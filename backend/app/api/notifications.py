from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Any, List
from datetime import datetime

from app.core.database import get_db
from app.api.auth import get_current_user
from app.models.models import User, Notification, Dataset
from app.schemas.schemas import NotificationResponse
from app.api.analytics import get_user_sales_df, get_user_reviews_df

router = APIRouter(prefix="/notifications", tags=["Notification Engine"])

@router.get("", response_model=List[NotificationResponse])
def get_notifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Fetches notifications. Programmatically checks data values to inject fresh 
    warnings/alerts if new metrics are out of bounds.
    """
    # 1. Analyze data and inject alerts dynamically
    sales_df = get_user_sales_df(current_user.id, db)
    reviews_df = get_user_reviews_df(current_user.id, db)
    
    # Check if we should inject standard notifications
    existing_notifs_count = db.query(Notification).filter(Notification.user_id == current_user.id).count()
    
    if existing_notifs_count == 0:
        # Create standard welcome alerts
        db.add(Notification(
            user_id=current_user.id,
            title="Welcome to AUCTUS!",
            message="Your AI growth advisor account is ready. Go to the Data Ingestion tab to upload your first sales dataset.",
            category="alert"
        ))
        db.add(Notification(
            user_id=current_user.id,
            title="Marketing Strategy Ready",
            message="AUCTUS has pre-compiled customized marketing recommendations. Go to 'AI Advisor' -> 'Copy Generator' to check them.",
            category="marketing"
        ))
        
    # Data specific checks
    if not sales_df.empty:
        # 1. Check for sales drop
        daily_sales = sales_df.groupby('date')['amount'].sum()
        if len(daily_sales) >= 5:
            last_few = daily_sales.tail(3).mean()
            prev_few = daily_sales.head(3).mean()
            if last_few < prev_few * 0.8: # 20% drop
                # Check if warning already exists
                warn_exists = db.query(Notification).filter(
                    Notification.user_id == current_user.id,
                    Notification.title == "Sales Trend Alert: Sales Dip Detected"
                ).first()
                if not warn_exists:
                    db.add(Notification(
                        user_id=current_user.id,
                        title="Sales Trend Alert: Sales Dip Detected",
                        message="Daily sales have decreased by more than 20% over the last few logs. Check the Forecasting dashboard for details.",
                        category="forecast"
                    ))
                    
    if not reviews_df.empty:
        # 2. Check for negative sentiment
        neg_count = (reviews_df['sentiment'] == 'Negative').sum()
        if neg_count > 0:
            warn_exists = db.query(Notification).filter(
                Notification.user_id == current_user.id,
                Notification.title == "Customer Sentiment Alert"
            ).first()
            if not warn_exists:
                db.add(Notification(
                    user_id=current_user.id,
                    title="Customer Sentiment Alert",
                    message=f"Detected {neg_count} reviews with Negative Sentiment. Review the Sentiment Analysis panel to respond.",
                    category="sentiment"
                ))
                
    db.commit()
    
    # Return all notifications
    return db.query(Notification).filter(Notification.user_id == current_user.id).order_by(Notification.created_at.desc()).all()

@router.put("/{notif_id}/read")
def mark_as_read(
    notif_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """Marks a specific notification as read."""
    notif = db.query(Notification).filter(Notification.id == notif_id, Notification.user_id == current_user.id).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found.")
        
    notif.is_read = True
    db.commit()
    return {"success": True}

@router.put("/read-all")
def mark_all_as_read(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """Marks all notifications for the user as read."""
    db.query(Notification).filter(Notification.user_id == current_user.id).update({Notification.is_read: True})
    db.commit()
    return {"success": True}
