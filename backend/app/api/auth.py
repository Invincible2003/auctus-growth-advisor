from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from datetime import timedelta
from typing import Any
from jose import jwt, JWTError

from app.core.database import get_db
from app.core.config import settings
from app.core.security import verify_password, get_password_hash, create_access_token
from app.models.models import User, BusinessProfile, AuditLog
from app.schemas.schemas import UserCreate, UserLogin, UserResponse, Token

router = APIRouter(prefix="/auth", tags=["Authentication"])

reusable_oauth2 = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login-form")

def get_current_user(db: Session = Depends(get_db), token: str = Depends(reusable_oauth2)) -> User:
    """Dependency to validate JWT token and return active user object."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception
    return user

@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def signup(user_in: UserCreate, db: Session = Depends(get_db)) -> Any:
    """Registers a new user and creates an associated blank business profile."""
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="A user with this email address already exists in AUCTUS.",
        )
    
    # Create user
    new_user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        role=user_in.role
    )
    db.add(new_user)
    db.flush() # Populate user ID
    
    # Create default business profile
    default_profile = BusinessProfile(
        user_id=new_user.id,
        name="My Business",
        industry="Retail",
        location="Local Area",
        employees=1,
        revenue=0.00,
        contact_email=new_user.email
    )
    db.add(default_profile)
    
    # Audit log
    audit = AuditLog(
        user_id=new_user.id,
        action="USER_SIGNUP",
        details=f"User signed up with email {user_in.email}"
    )
    db.add(audit)
    db.commit()
    db.refresh(new_user)
    
    return new_user

@router.post("/login", response_model=Token)
def login_json(user_in: UserLogin, db: Session = Depends(get_db)) -> Any:
    """Authenticates users via JSON payload and issues JWT."""
    user = db.query(User).filter(User.email == user_in.email).first()
    if not user or not verify_password(user_in.password, user.hashed_password):
        raise HTTPException(
            status_code=400,
            detail="Incorrect email or password"
        )
        
    # Generate token
    token_expire = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    token = create_access_token(subject=user.id, expires_delta=token_expire)
    
    # Fetch business profile name if set
    profile_name = "My Business"
    if user.profile:
        profile_name = user.profile.name
        
    # Create audit log
    audit = AuditLog(
        user_id=user.id,
        action="USER_LOGIN",
        details="User logged in successfully"
    )
    db.add(audit)
    db.commit()
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "role": user.role,
            "business_name": profile_name
        }
    }

@router.post("/forgot-password")
def forgot_password(email_payload: dict, db: Session = Depends(get_db)) -> Any:
    """Handles password reset request logs."""
    email = email_payload.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Email is required")
        
    user = db.query(User).filter(User.email == email).first()
    if user:
        # Create audit log
        audit = AuditLog(
            user_id=user.id,
            action="PASSWORD_RESET_REQUEST",
            details=f"Password recovery requested for {email}"
        )
        db.add(audit)
        db.commit()
        
    # Always return success to prevent email enumeration
    return {"message": "If this email is registered, a password reset link has been dispatched."}

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)) -> Any:
    """Returns details of the currently authenticated session user."""
    return current_user
