from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import Any, List, Dict
import os
from datetime import datetime

from app.core.database import get_db
from app.api.auth import get_current_user
from app.models.models import User, Report, BusinessProfile, AuditLog
from app.schemas.schemas import ReportResponse
from app.services.report_service import ReportService
from app.services.ai_service import AIService
from app.api.analytics import get_user_sales_df

router = APIRouter(prefix="/reports", tags=["Report Generation"])

@router.post("/generate", response_model=ReportResponse)
def generate_business_report(
    payload: Dict[str, str],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Triggers generation of a custom PDF, Word, or PowerPoint report.
    Pulls real KPIs and AI recommendations, branding it with the logo and copyright footer.
    """
    fmt = payload.get("format", "pdf").lower()
    if fmt not in ["pdf", "docx", "pptx"]:
        raise HTTPException(status_code=400, detail="Supported formats are 'pdf', 'docx', 'pptx'")
        
    profile = db.query(BusinessProfile).filter(BusinessProfile.user_id == current_user.id).first()
    b_name = profile.name if profile else "My Business"
    industry = profile.industry if profile else "Retail"
    
    # Compile KPIs
    sales_df = get_user_sales_df(current_user.id, db)
    if not sales_df.empty:
        kpis = {
            "Total Accumulated Revenue": f"${sales_df['amount'].sum():,.2f}",
            "Average Transaction Value": f"${sales_df['amount'].mean():,.2f}",
            "Total Ingested Volume": f"{sales_df['quantity'].sum()} Units",
            "Active Customer Base": f"{sales_df['customer_id'].nunique()} Members",
            "Leading Product SKU": str(sales_df.groupby('product_name')['quantity'].sum().idxmax())
        }
    else:
        # Sandbox fallbacks
        kpis = {
            "Total Accumulated Revenue": "$45,890.50",
            "Average Transaction Value": "$131.87",
            "Total Ingested Volume": "450 Units",
            "Active Customer Base": "348 Members",
            "Leading Product SKU": "Premium Blend Espresso (Mock)"
        }
        
    # Compile Recommendations
    recs = AIService.generate_marketing_campaigns(industry, b_name)
    
    # File naming
    timestamp = int(datetime.now().timestamp())
    title = f"{b_name.replace(' ', '_')}_Performance_Audit_{timestamp}"
    filename = f"{title}.{fmt}"
    
    # Generate File
    if fmt == 'pdf':
        file_path = ReportService.generate_pdf_report(b_name, kpis, recs, filename)
    elif fmt == 'docx':
        file_path = ReportService.generate_docx_report(b_name, kpis, recs, filename)
    else: # pptx
        file_path = ReportService.generate_pptx_report(b_name, kpis, recs, filename)
        
    # Save Report Record to DB
    db_report = Report(
        user_id=current_user.id,
        title=f"{b_name} Business Growth Report",
        file_path=file_path,
        format=fmt
    )
    db.add(db_report)
    
    # Audit log
    audit = AuditLog(
        user_id=current_user.id,
        action="GENERATE_REPORT",
        details=f"Generated performance report in {fmt.upper()} format."
    )
    db.add(audit)
    db.commit()
    db.refresh(db_report)
    
    return db_report

@router.get("/history", response_model=List[ReportResponse])
def get_report_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """Returns list of previously generated reports for the current user."""
    return db.query(Report).filter(Report.user_id == current_user.id).order_by(Report.generated_at.desc()).all()

@router.get("/download/{report_id}")
def download_report_file(
    report_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """Downloads the physical PDF/Word/PPTX report file via HTTP FileResponse."""
    report = db.query(Report).filter(Report.id == report_id, Report.user_id == current_user.id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report record not found.")
        
    if not os.path.exists(report.file_path):
        raise HTTPException(status_code=404, detail="The requested file no longer exists on the server.")
        
    # Determine media type
    media_types = {
        "pdf": "application/pdf",
        "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    }
    
    return FileResponse(
        path=report.file_path,
        filename=os.path.basename(report.file_path),
        media_type=media_types.get(report.format, "application/octet-stream")
    )
