import json
import pandas as pd
import numpy as np
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import Any, Dict, List, Optional
from datetime import datetime, timedelta

from app.core.database import get_db
from app.api.auth import get_current_user
from app.models.models import User, SalesRecord, CustomerReview, Dataset
from app.services.ml_service import MLService
from app.services.ai_service import AIService

router = APIRouter(prefix="/analytics", tags=["Business Analytics & Forecasting"])

def get_user_sales_df(user_id: str, db: Session) -> pd.DataFrame:
    """Helper to load all sales records for a user into a pandas DataFrame."""
    datasets = db.query(Dataset).filter(Dataset.user_id == user_id, Dataset.file_type == 'sales').all()
    if not datasets:
        return pd.DataFrame()
        
    ds_ids = [d.id for d in datasets]
    records = db.query(SalesRecord).filter(SalesRecord.dataset_id.in_(ds_ids)).all()
    if not records:
        return pd.DataFrame()
        
    data = []
    for r in records:
        data.append({
            "id": r.id,
            "date": r.date,
            "amount": float(r.amount),
            "quantity": int(r.quantity),
            "product_name": r.product_name,
            "category": r.category or 'Uncategorized',
            "customer_id": r.customer_id or 'Guest',
            "region": r.region or 'Local'
        })
    df = pd.DataFrame(data)
    if not df.empty:
        df['date'] = pd.to_datetime(df['date'])
    return df

def get_user_reviews_df(user_id: str, db: Session) -> pd.DataFrame:
    """Helper to load all reviews for a user into a pandas DataFrame."""
    datasets = db.query(Dataset).filter(Dataset.user_id == user_id, Dataset.file_type == 'reviews').all()
    if not datasets:
        return pd.DataFrame()
        
    ds_ids = [d.id for d in datasets]
    records = db.query(CustomerReview).filter(CustomerReview.dataset_id.in_(ds_ids)).all()
    if not records:
        return pd.DataFrame()
        
    data = []
    for r in records:
        data.append({
            "id": r.id,
            "reviewer_name": r.reviewer_name or 'Anonymous',
            "review_text": r.review_text,
            "rating": int(r.rating or 5),
            "sentiment": r.sentiment or 'Neutral',
            "score": float(r.score or 0.5),
            "keywords": r.keywords or []
        })
    return pd.DataFrame(data)

@router.get("/dashboard", response_model=Dict[str, Any])
def get_dashboard_data(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """Computes all standard analytics components, metrics, and health scores."""
    df_sales = get_user_sales_df(current_user.id, db)
    df_reviews = get_user_reviews_df(current_user.id, db)
    
    # 1. Fallback to mock dashboard if no data is uploaded yet
    if df_sales.empty:
        # Generate realistic mockup datasets for demonstration
        mock_kpis = {
            "total_revenue": 45890.50,
            "monthly_growth_percent": 12.4,
            "best_selling_product": "Premium Blend Espresso",
            "customer_count": 348,
            "health_score": 85,
            "health_rating": "Excellent",
            "has_real_data": False
        }
        
        # Sales charts
        mock_sales_trends = [
            {"date": "Mon", "revenue": 1200, "orders": 45},
            {"date": "Tue", "revenue": 1450, "orders": 52},
            {"date": "Wed", "revenue": 1100, "orders": 38},
            {"date": "Thu", "revenue": 1800, "orders": 60},
            {"date": "Fri", "revenue": 2400, "orders": 85},
            {"date": "Sat", "revenue": 3100, "orders": 110},
            {"date": "Sun", "revenue": 2900, "orders": 105}
        ]
        
        mock_categories = [
            {"name": "Coffee Beverages", "value": 45},
            {"name": "Bakery Items", "value": 25},
            {"name": "Whole Beans Bag", "value": 20},
            {"name": "Merchandise", "value": 10}
        ]
        
        mock_regions = [
            {"region": "Downtown", "revenue": 24500},
            {"region": "Westside", "revenue": 12300},
            {"region": "Suburbs", "revenue": 9090}
        ]
        
        return {
            "kpis": mock_kpis,
            "sales_trends": mock_sales_trends,
            "category_distribution": mock_categories,
            "regional_sales": mock_regions,
            "recent_activity": [
                {"event": "System Setup", "time": "2 hours ago", "desc": "Account configured for Aryan Pandey"},
                {"event": "Ingestion Sandbox", "time": "1 hour ago", "desc": "Mock analytics loaded successfully"}
            ]
        }
        
    # 2. Real data analytics computation
    total_rev = float(df_sales['amount'].sum())
    cust_count = int(df_sales['customer_id'].nunique())
    
    # Best seller
    best_seller = "None"
    if 'product_name' in df_sales.columns:
        best_seller = str(df_sales.groupby('product_name')['quantity'].sum().idxmax())
        
    # Monthly growth rate
    growth_pct = 5.0
    if len(df_sales) > 10:
        try:
            df_sales['month'] = df_sales['date'].dt.to_period('M')
            monthly_totals = df_sales.groupby('month')['amount'].sum()
            if len(monthly_totals) >= 2:
                prev_month = monthly_totals.iloc[-2]
                curr_month = monthly_totals.iloc[-1]
                if prev_month > 0:
                    growth_pct = round(((curr_month - prev_month) / prev_month) * 100, 1)
        except Exception:
            pass
            
    # Business Health Score calculations
    # Based on: Growth rate, Customer sentiment, Customer retention
    retention_rate = 50.0
    if 'customer_id' in df_sales.columns and cust_count > 0:
        cust_freq = df_sales.groupby('customer_id')['id'].count()
        repeat_customers = (cust_freq > 1).sum()
        retention_rate = float((repeat_customers / cust_count) * 100)
        
    avg_rating = 4.0
    if not df_reviews.empty and 'rating' in df_reviews.columns:
        avg_rating = float(df_reviews['rating'].mean())
        
    # Scale components (0 to 100)
    sentiment_factor = (avg_rating / 5.0) * 100
    retention_factor = retention_rate
    growth_factor = min(100.0, max(0.0, (growth_pct + 10) * 5)) # scale -10% -> +10% to 0->100
    
    health_score = int((sentiment_factor * 0.4) + (retention_factor * 0.3) + (growth_factor * 0.3))
    health_score = max(0, min(100, health_score))
    
    if health_score >= 80:
        rating_lbl = "Excellent"
    elif health_score >= 60:
        rating_lbl = "Good"
    elif health_score >= 45:
        rating_lbl = "Average"
    else:
        rating_lbl = "Poor"
        
    kpis = {
        "total_revenue": round(total_rev, 2),
        "monthly_growth_percent": growth_pct,
        "best_selling_product": best_seller,
        "customer_count": cust_count,
        "health_score": health_score,
        "health_rating": rating_lbl,
        "has_real_data": True
    }
    
    # Group by date for trends
    df_trends = df_sales.groupby(df_sales['date'].dt.strftime('%Y-%m-%d'))[['amount', 'quantity']].agg({'amount':'sum', 'quantity':'sum'}).reset_index()
    # Take last 15 days
    trends_payload = []
    for _, row in df_trends.tail(15).iterrows():
        trends_payload.append({
            "date": row['date'],
            "revenue": round(row['amount'], 2),
            "orders": int(row['quantity'])
        })
        
    # Category Pie Chart
    cat_dist = []
    if 'category' in df_sales.columns:
        cat_counts = df_sales.groupby('category')['amount'].sum().reset_index()
        total_cat_sum = cat_counts['amount'].sum()
        for _, row in cat_counts.iterrows():
            pct = round((row['amount'] / total_cat_sum) * 100, 1) if total_cat_sum > 0 else 0
            cat_dist.append({
                "name": str(row['category']),
                "value": pct
            })
            
    # Region bar chart
    region_sales = []
    if 'region' in df_sales.columns:
        reg_counts = df_sales.groupby('region')['amount'].sum().reset_index()
        for _, row in reg_counts.iterrows():
            region_sales.append({
                "region": str(row['region']),
                "revenue": round(row['amount'], 2)
            })
            
    # Recent Activities
    recent_activity = [
        {"event": "Data Ingested", "time": "Just now", "desc": f"Sales database updated with {len(df_sales)} transactions."}
    ]
    if not df_reviews.empty:
        recent_activity.append(
            {"event": "Sentiment Audit", "time": "Just now", "desc": f"Analyzed feedback from {len(df_reviews)} customers."}
        )
        
    return {
        "kpis": kpis,
        "sales_trends": trends_payload,
        "category_distribution": cat_dist,
        "regional_sales": region_sales,
        "recent_activity": recent_activity
    }

@router.get("/sentiment", response_model=Dict[str, Any])
def get_sentiment_analytics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """Computes customer sentiment indices, trending terms, and AI descriptions."""
    df_reviews = get_user_reviews_df(current_user.id, db)
    
    if df_reviews.empty:
        # Mock sentiment output
        mock_summary = "Customers are overwhelmingly positive about product taste and store decor. Some complaints focus on long waiting lines during peak hours."
        return {
            "distribution": [
                {"name": "Positive", "value": 75, "color": "#06b6d4"},
                {"name": "Neutral", "value": 15, "color": "#3b82f6"},
                {"name": "Negative", "value": 10, "color": "#ef4444"}
            ],
            "average_rating": 4.3,
            "word_cloud": [
                {"text": "espresso", "value": 45},
                {"text": "service", "value": 38},
                {"text": "ambience", "value": 30},
                {"text": "waiting", "value": 25},
                {"text": "friendly", "value": 22},
                {"text": "clean", "value": 18}
            ],
            "trending_topics": [
                {"topic": "Customer Service", "sentiment": "Positive", "count": 28},
                {"topic": "Wait Times", "sentiment": "Negative", "count": 14},
                {"topic": "Store Aesthetic", "sentiment": "Positive", "count": 18}
            ],
            "ai_summary": mock_summary
        }
        
    total_revs = len(df_reviews)
    pos_count = int((df_reviews['sentiment'] == 'Positive').sum())
    neu_count = int((df_reviews['sentiment'] == 'Neutral').sum())
    neg_count = int((df_reviews['sentiment'] == 'Negative').sum())
    
    pos_pct = round((pos_count / total_revs) * 100, 1) if total_revs > 0 else 0
    neu_pct = round((neu_count / total_revs) * 100, 1) if total_revs > 0 else 0
    neg_pct = round((neg_count / total_revs) * 100, 1) if total_revs > 0 else 0
    
    avg_rating = round(float(df_reviews['rating'].mean()), 2)
    
    # Word cloud extraction from keywords list
    word_freq = {}
    for idx, row in df_reviews.iterrows():
        kws = row.get('keywords', [])
        for k in kws:
            word_freq[k] = word_freq.get(k, 0) + 1
            
    word_cloud = [{"text": k, "value": v} for k, v in word_freq.items()]
    word_cloud = sorted(word_cloud, key=lambda x: x['value'], reverse=True)[:15] # Top 15 keywords
    
    # Trending topics
    trending_topics = [
        {"topic": "Quality & Taste", "sentiment": "Positive" if pos_pct > 50 else "Neutral", "count": pos_count},
        {"topic": "Pricing / Value", "sentiment": "Neutral" if neu_pct > neg_pct else "Negative", "count": neu_count + neg_count}
    ]
    
    # AI Summary
    reviews_sample = df_reviews['review_text'].head(5).tolist()
    context_text = f"Sample reviews: {json.dumps(reviews_sample)}. Avg Rating: {avg_rating} Stars."
    ai_summary = AIService.get_chat_response([], "Summarize these customer reviews concisely, focusing on what they love and where the business can improve.", context_text)
    
    return {
        "distribution": [
            {"name": "Positive", "value": pos_pct, "color": "#06b6d4"},
            {"name": "Neutral", "value": neu_pct, "color": "#3b82f6"},
            {"name": "Negative", "value": neg_pct, "color": "#ef4444"}
        ],
        "average_rating": avg_rating,
        "word_cloud": word_cloud,
        "trending_topics": trending_topics,
        "ai_summary": ai_summary
    }

@router.get("/forecasting", response_model=Dict[str, Any])
def get_sales_forecast(
    days: int = Query(30, description="Forecast window in days"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """Calculates future sales forecasts and fetches an AI explanatory summary."""
    df_sales = get_user_sales_df(current_user.id, db)
    
    predictions, metrics = MLService.forecast_sales(df_sales, days)
    
    # Generate AI explanation
    hist_mean = float(df_sales['amount'].mean()) if not df_sales.empty else 250.0
    forecast_total = sum(p["revenue"] for p in predictions)
    avg_predicted = forecast_total / len(predictions) if predictions else 0.0
    
    context_info = f"Historical daily average: ${hist_mean:.2f}. Projected forecast average for next {days} days: ${avg_predicted:.2f}. Model metrics: {json.dumps(metrics)}"
    ai_explanation = AIService.get_chat_response([], f"Explain the sales forecast predictions for the next {days} days to a non-technical business owner in simple terms. Highlight recommendations.", context_info)
    
    return {
        "predictions": predictions,
        "metrics": metrics,
        "ai_explanation": ai_explanation
    }

@router.get("/customers", response_model=Dict[str, Any])
def get_customer_clustering(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """Executes customer clustering algorithms and yields user segment profiles."""
    df_sales = get_user_sales_df(current_user.id, db)
    
    customer_segments, segment_summary = MLService.segment_customers(df_sales)
    
    return {
        "customer_segments": customer_segments,
        "segment_summary": segment_summary
    }
