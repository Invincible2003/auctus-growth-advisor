from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Any

from app.core.database import get_db
from app.api.auth import get_current_user
from app.models.models import User, BusinessProfile, AuditLog
from app.schemas.schemas import BusinessProfileCreate, BusinessProfileResponse

router = APIRouter(prefix="/business", tags=["Business Profile"])

@router.get("/profile", response_model=BusinessProfileResponse)
def get_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """Fetches the active business profile associated with the current user."""
    profile = db.query(BusinessProfile).filter(BusinessProfile.user_id == current_user.id).first()
    if not profile:
        # Create profile dynamically if missing
        profile = BusinessProfile(
            user_id=current_user.id,
            name="My Business",
            industry="Retail",
            location="Local Area",
            employees=1,
            revenue=0.0
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile

@router.put("/profile", response_model=BusinessProfileResponse)
def update_profile(
    profile_in: BusinessProfileCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """Updates the settings of the business profile."""
    profile = db.query(BusinessProfile).filter(BusinessProfile.user_id == current_user.id).first()
    if not profile:
        profile = BusinessProfile(user_id=current_user.id)
        db.add(profile)
    
    # Update fields
    profile.name = profile_in.name
    profile.industry = profile_in.industry
    profile.location = profile_in.location
    profile.employees = profile_in.employees
    profile.revenue = profile_in.revenue
    profile.contact_email = profile_in.contact_email
    profile.contact_phone = profile_in.contact_phone
    
    # Audit log
    audit = AuditLog(
        user_id=current_user.id,
        action="UPDATE_BUSINESS_PROFILE",
        details=f"Updated profile values. Name: {profile_in.name}"
    )
    db.add(audit)
    db.commit()
    db.refresh(profile)
    
    return profile
