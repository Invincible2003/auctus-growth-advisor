import os
import shutil
import json
import pandas as pd
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from typing import Any, List, Dict
from datetime import datetime

from app.core.database import get_db
from app.api.auth import get_current_user
from app.models.models import User, Dataset, SalesRecord, CustomerReview, AuditLog
from app.schemas.schemas import DatasetResponse
from app.services.cleaning_service import CleaningService
from app.services.ai_service import AIService

router = APIRouter(prefix="/ingestion", tags=["Data Ingestion & Cleaning"])

UPLOAD_DIR = "D:/AUCTUS/datasets"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR, exist_ok=True)

def analyze_sentiment_simple(text: str, rating: int = None) -> tuple:
    """Helper to classify review text into sentiment classes and scores."""
    text_lower = str(text).lower()
    
    # Rating based override
    if rating is not None:
        if rating >= 4:
            return "Positive", 0.85
        elif rating == 3:
            return "Neutral", 0.50
        elif rating <= 2:
            return "Negative", 0.15
            
    positive_words = ['good', 'great', 'excellent', 'love', 'amazing', 'perfect', 'friendly', 'fast', 'satisfied', 'best', 'happy', 'wonderful']
    negative_words = ['bad', 'poor', 'slow', 'rude', 'broken', 'terrible', 'worst', 'expensive', 'hate', 'disappointed', 'fail', 'awful']
    
    pos_count = sum(1 for word in positive_words if word in text_lower)
    neg_count = sum(1 for word in negative_words if word in text_lower)
    
    if pos_count > neg_count:
        return "Positive", 0.80
    elif neg_count > pos_count:
        return "Negative", 0.20
    else:
        return "Neutral", 0.50

def extract_keywords_simple(text: str) -> list:
    """Extracts high-importance nouns/descriptors from feedback."""
    text_lower = str(text).lower()
    words = text_lower.split()
    stops = {'the', 'a', 'an', 'and', 'but', 'is', 'are', 'was', 'to', 'for', 'in', 'of', 'on', 'with', 'at', 'by', 'this', 'that', 'it', 'my', 'i'}
    candidates = [w.strip('.,!?"()') for w in words if w not in stops and len(w) > 4]
    
    # Return top 4 unique candidates
    seen = set()
    result = []
    for c in candidates:
        if c not in seen:
            seen.add(c)
            result.append(c)
        if len(result) >= 4:
            break
    return result

@router.post("/upload", response_model=Dict[str, Any])
def upload_dataset(
    file: UploadFile = File(...),
    file_type: str = Form(...), # 'sales' or 'reviews'
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Uploads a file (CSV, Excel, or JSON), cleans it automatically,
    explains cleaning decisions via AI, and stores it in the database.
    """
    if file_type not in ['sales', 'reviews']:
        raise HTTPException(status_code=400, detail="file_type must be either 'sales' or 'reviews'")
        
    # Save file temporarily
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in ['.csv', '.xlsx', '.xls', '.json']:
        raise HTTPException(status_code=400, detail="Only CSV, Excel, or JSON files are supported.")
        
    safe_filename = f"{current_user.id}_{int(datetime.now().timestamp())}{file_ext}"
    saved_path = os.path.join(UPLOAD_DIR, safe_filename)
    
    try:
        with open(saved_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")
        
    try:
        # Load dataset with Pandas
        if file_ext == '.csv':
            df = pd.read_csv(saved_path)
        elif file_ext in ['.xlsx', '.xls']:
            df = pd.read_excel(saved_path)
        else: # .json
            df = pd.read_json(saved_path)
            
        if df.empty:
            raise ValueError("The uploaded dataset is empty.")
            
        # Standardize columns to lowercase for easy manipulation
        df.columns = [c.lower().strip() for c in df.columns]
        
        cleaning_logs = []
        cleaned_count = len(df)
        
        # Run Cleaning Logic
        if file_type == 'sales':
            df_cleaned, cleaning_logs = CleaningService.clean_sales_data(df)
            cleaned_count = len(df_cleaned)
        else: # reviews
            df_cleaned, cleaning_logs = CleaningService.clean_reviews_data(df)
            cleaned_count = len(df_cleaned)
            
        # Get AI explanation for data quality dashboard
        ai_explanation = AIService.explain_cleaning_logs(cleaning_logs)
        
        # Save cleaned file back to disk
        df_cleaned.to_csv(saved_path, index=False)
        
        # Create dataset row
        col_metadata = {"columns": list(df_cleaned.columns)}
        db_dataset = Dataset(
            user_id=current_user.id,
            filename=file.filename,
            file_type=file_type,
            file_path=saved_path,
            row_count=cleaned_count,
            column_metadata=col_metadata,
            cleaning_logs=cleaning_logs
        )
        db.add(db_dataset)
        db.flush() # Fetch database dataset ID
        
        # Insert records into specific tables
        if file_type == 'sales':
            sales_records = []
            for _, row in df_cleaned.iterrows():
                # Extract date, format to date type
                dt_val = row.get('date')
                if isinstance(dt_val, pd.Timestamp):
                    record_date = dt_val.date()
                else:
                    record_date = pd.to_datetime(dt_val).date()
                    
                sales_records.append(SalesRecord(
                    dataset_id=db_dataset.id,
                    date=record_date,
                    amount=float(row.get('amount', 0.0)),
                    quantity=int(row.get('quantity', 1)),
                    product_name=str(row.get('product_name', 'General SKU')),
                    category=str(row.get('category', 'Uncategorized')),
                    customer_id=str(row.get('customer_id', 'Guest')) if pd.notna(row.get('customer_id')) else 'Guest',
                    region=str(row.get('region', 'Local')) if pd.notna(row.get('region')) else 'Local'
                ))
            db.bulk_save_objects(sales_records)
            
        else: # reviews
            reviews_records = []
            for _, row in df_cleaned.iterrows():
                text = str(row.get('review_text', ''))
                rating = int(row.get('rating', 5))
                sent, score = analyze_sentiment_simple(text, rating)
                keywords = extract_keywords_simple(text)
                
                reviews_records.append(CustomerReview(
                    dataset_id=db_dataset.id,
                    reviewer_name=str(row.get('reviewer_name', 'Anonymous')),
                    review_text=text,
                    rating=rating,
                    sentiment=sent,
                    score=score,
                    keywords=keywords
                ))
            db.bulk_save_objects(reviews_records)
            
        # Create audit log
        audit = AuditLog(
            user_id=current_user.id,
            action="UPLOAD_DATASET",
            details=f"Uploaded {file_type} dataset '{file.filename}' containing {cleaned_count} rows."
        )
        db.add(audit)
        db.commit()
        
        return {
            "success": True,
            "dataset_id": db_dataset.id,
            "filename": file.filename,
            "row_count": cleaned_count,
            "cleaning_logs": cleaning_logs,
            "ai_explanation": ai_explanation
        }
        
    except Exception as e:
        db.rollback()
        if os.path.exists(saved_path):
            os.remove(saved_path)
        raise HTTPException(
            status_code=400,
            detail=f"An error occurred while cleaning or storing the dataset: {str(e)}"
        )

@router.get("/history", response_model=List[DatasetResponse])
def get_upload_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """Retrieves all datasets uploaded by the current user."""
    return db.query(Dataset).filter(Dataset.user_id == current_user.id).order_by(Dataset.created_at.desc()).all()

@router.delete("/dataset/{dataset_id}")
def delete_dataset(
    dataset_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """Deletes an ingested dataset and cleans up its associated records."""
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id, Dataset.user_id == current_user.id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
        
    # Delete file from local storage
    if os.path.exists(dataset.file_path):
        try:
            os.remove(dataset.file_path)
        except Exception:
            pass
            
    # Delete from DB (cascade deletes children sales_records / customer_reviews)
    db.delete(dataset)
    
    # Audit log
    audit = AuditLog(
        user_id=current_user.id,
        action="DELETE_DATASET",
        details=f"Deleted dataset '{dataset.filename}'"
    )
    db.add(audit)
    db.commit()
    
    return {"success": True, "message": "Dataset deleted successfully."}
