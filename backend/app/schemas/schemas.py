from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, date

# Token schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    user: Dict[str, Any]

class TokenData(BaseModel):
    user_id: Optional[str] = None

# User schemas
class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str
    role: Optional[str] = "Business Owner"

class UserLogin(UserBase):
    password: str

class UserResponse(UserBase):
    id: str
    role: str
    created_at: datetime
    
    class Config:
        from_attributes = True

# Business Profile schemas
class BusinessProfileBase(BaseModel):
    name: str
    industry: str
    location: str
    employees: Optional[int] = 1
    revenue: Optional[float] = 0.0
    contact_email: Optional[EmailStr] = None
    contact_phone: Optional[str] = None

class BusinessProfileCreate(BusinessProfileBase):
    pass

class BusinessProfileResponse(BusinessProfileBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Dataset schemas
class DatasetResponse(BaseModel):
    id: str
    user_id: str
    filename: str
    file_type: str
    file_path: str
    row_count: int
    column_metadata: Dict[str, Any]
    cleaning_logs: List[Any]
    created_at: datetime
    
    class Config:
        from_attributes = True

# Sales Record schemas
class SalesRecordBase(BaseModel):
    date: date
    amount: float
    quantity: Optional[int] = 1
    product_name: str
    category: Optional[str] = None
    customer_id: Optional[str] = None
    region: Optional[str] = None

class SalesRecordCreate(SalesRecordBase):
    pass

class SalesRecordResponse(SalesRecordBase):
    id: str
    dataset_id: str
    
    class Config:
        from_attributes = True

# Customer Review schemas
class CustomerReviewBase(BaseModel):
    reviewer_name: Optional[str] = "Anonymous"
    review_text: str
    rating: Optional[int] = None
    sentiment: Optional[str] = "Neutral"
    score: Optional[float] = 0.0
    keywords: Optional[List[str]] = []

class CustomerReviewCreate(CustomerReviewBase):
    pass

class CustomerReviewResponse(CustomerReviewBase):
    id: str
    dataset_id: str
    
    class Config:
        from_attributes = True

# Competitor schemas
class CompetitorCreate(BaseModel):
    name: str

class CompetitorResponse(BaseModel):
    id: str
    user_id: str
    name: str
    market_position: Optional[str] = None
    pricing_strategy: Optional[str] = None
    strengths: Optional[str] = None
    weaknesses: Optional[str] = None
    swot_analysis: Dict[str, Any] = {}
    ai_report: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

# Forecasting schemas
class ForecastRequest(BaseModel):
    days: int = Field(30, description="Number of days to forecast (30, 90, 180, 365)")

class ForecastResponse(BaseModel):
    id: str
    user_id: str
    forecast_type: str
    data_points: List[Dict[str, Any]]
    metrics: Dict[str, Any]
    generated_at: datetime
    
    class Config:
        from_attributes = True

# Report schemas
class ReportResponse(BaseModel):
    id: str
    user_id: str
    title: str
    file_path: str
    format: str
    generated_at: datetime
    
    class Config:
        from_attributes = True

# Notification schemas
class NotificationResponse(BaseModel):
    id: str
    user_id: str
    title: str
    message: str
    category: str
    is_read: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Chat schemas
class ChatMessage(BaseModel):
    role: str = Field(..., description="Role: 'user' or 'model'")
    message: str
    
class ChatHistoryResponse(ChatMessage):
    id: str
    created_at: datetime
    
    class Config:
        from_attributes = True

# Admin stats schema
class AdminStats(BaseModel):
    total_users: int
    total_datasets: int
    total_reports: int
    total_forecasts: int
    storage_used_bytes: int
    api_call_count: int
    revenue_metrics: Dict[str, Any]
