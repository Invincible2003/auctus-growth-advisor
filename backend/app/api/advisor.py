from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Any, List, Dict
from datetime import datetime

from app.core.database import get_db
from app.api.auth import get_current_user
from app.models.models import User, ChatHistory, Competitor, BusinessProfile, AuditLog
from app.schemas.schemas import ChatHistoryResponse, ChatMessage, CompetitorResponse
from app.services.ai_service import AIService
from app.api.analytics import get_user_sales_df

router = APIRouter(prefix="/advisor", tags=["AI Advisor & Intelligence"])

@router.get("/chat/history", response_model=List[ChatHistoryResponse])
def get_chat_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """Fetches full advisor chat records for the user session."""
    return db.query(ChatHistory).filter(ChatHistory.user_id == current_user.id).order_by(ChatHistory.created_at.asc()).all()

@router.post("/chat", response_model=Dict[str, Any])
def post_chat_message(
    payload: ChatMessage,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """Submits a chat message to the advisor, compiling sales/business metadata to feed the prompt context."""
    user_msg = payload.message
    
    # 1. Fetch previous chat history
    db_history = db.query(ChatHistory).filter(ChatHistory.user_id == current_user.id).order_by(ChatHistory.created_at.asc()).all()
    history_list = [{"role": h.role, "message": h.message} for h in db_history]
    
    # 2. Build dataset context summary for Gemini
    sales_df = get_user_sales_df(current_user.id, db)
    dataset_context = ""
    
    profile = db.query(BusinessProfile).filter(BusinessProfile.user_id == current_user.id).first()
    if profile:
        dataset_context += f"Business Profile: Name={profile.name}, Industry={profile.industry}, Location={profile.location}, Revenue=${profile.revenue:.2f}.\n"
        
    if not sales_df.empty:
        total_sales = sales_df['amount'].sum()
        total_items = sales_df['quantity'].sum()
        avg_sale = sales_df['amount'].mean()
        best_prod = sales_df.groupby('product_name')['quantity'].sum().idxmax()
        dataset_context += f"Sales Summary: Total Revenue=${total_sales:.2f}, Transactions={len(sales_df)}, Average Ticket=${avg_sale:.2f}, Best Selling Product={best_prod}.\n"
    else:
        dataset_context += "Sales Summary: No custom dataset uploaded yet. Current analytics are showing mock demo sandboxes."
        
    # 3. Call AI Service
    ai_response = AIService.get_chat_response(history_list, user_msg, dataset_context)
    
    # 4. Save to DB
    user_record = ChatHistory(user_id=current_user.id, role="user", message=user_msg)
    ai_record = ChatHistory(user_id=current_user.id, role="model", message=ai_response)
    db.add(user_record)
    db.add(ai_record)
    
    # Audit log
    audit = AuditLog(
        user_id=current_user.id,
        action="ADVISOR_CHAT",
        details=f"Asked: '{user_msg[:40]}...'"
    )
    db.add(audit)
    db.commit()
    
    return {
        "reply": ai_response,
        "history_item": {
            "user": user_msg,
            "advisor": ai_response
        }
    }

@router.delete("/chat/history")
def clear_chat_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """Clears chat history records for the user."""
    db.query(ChatHistory).filter(ChatHistory.user_id == current_user.id).delete()
    db.commit()
    return {"success": True, "message": "Chat history cleared successfully."}

@router.post("/competitor/swot", response_model=CompetitorResponse)
def generate_competitor_swot(
    payload: Dict[str, str],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """Creates a new competitor analysis report, generating a SWOT audit via Gemini."""
    comp_name = payload.get("competitor_name")
    if not comp_name:
        raise HTTPException(status_code=400, detail="Competitor name is required.")
        
    profile = db.query(BusinessProfile).filter(BusinessProfile.user_id == current_user.id).first()
    ind = profile.industry if profile else "Retail"
    
    # Generate SWOT and report via Gemini / Fallback
    swot_res = AIService.generate_swot(comp_name, ind)
    
    competitor = Competitor(
        user_id=current_user.id,
        name=comp_name,
        market_position=swot_res.get("market_position"),
        pricing_strategy=swot_res.get("pricing_strategy"),
        strengths=swot_res.get("strengths"),
        weaknesses=swot_res.get("weaknesses"),
        swot_analysis=swot_res.get("swot_analysis"),
        ai_report=swot_res.get("ai_report")
    )
    db.add(competitor)
    
    # Audit log
    audit = AuditLog(
        user_id=current_user.id,
        action="GENERATE_COMPETITOR_SWOT",
        details=f"Generated competitive SWOT audit for competitor '{comp_name}'"
    )
    db.add(audit)
    db.commit()
    db.refresh(competitor)
    
    return competitor

@router.get("/competitors", response_model=List[CompetitorResponse])
def get_competitor_analyses(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """Fetches previously saved competitor analysis reports."""
    return db.query(Competitor).filter(Competitor.user_id == current_user.id).order_by(Competitor.created_at.desc()).all()

@router.delete("/competitor/{comp_id}")
def delete_competitor(
    comp_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """Removes a competitor analysis report."""
    comp = db.query(Competitor).filter(Competitor.id == comp_id, Competitor.user_id == current_user.id).first()
    if not comp:
        raise HTTPException(status_code=404, detail="Competitor report not found.")
        
    db.delete(comp)
    db.commit()
    return {"success": True, "message": "Competitor deleted successfully."}

@router.post("/marketing/recommendations", response_model=List[Dict[str, Any]])
def get_marketing_campaigns(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """Fetches recommended marketing campaigns and priority scores."""
    profile = db.query(BusinessProfile).filter(BusinessProfile.user_id == current_user.id).first()
    ind = profile.industry if profile else "Retail"
    b_name = profile.name if profile else "My Business"
    
    campaigns = AIService.generate_marketing_campaigns(ind, b_name)
    return campaigns

@router.post("/generator/social", response_model=Dict[str, Any])
def generate_social_post(
    payload: Dict[str, str],
    current_user: User = Depends(get_current_user)
) -> Any:
    """Generates engaging social media post copywriting and hashtags."""
    post_type = payload.get("post_type", "Instagram") # Instagram, FB, LinkedIn, WhatsApp
    context = payload.get("context", "Summer Sale")
    
    result = AIService.generate_social_content(post_type, context)
    return result

@router.post("/generator/ads", response_model=Dict[str, Any])
def generate_ads_copy(
    payload: Dict[str, str],
    current_user: User = Depends(get_current_user)
) -> Any:
    """Generates search/display advertisements and budget recommendations."""
    ad_type = payload.get("ad_type", "Google Ads") # Google, Facebook, Youtube
    context = payload.get("context", "Affordable pricing & local quality")
    
    result = AIService.generate_advertisement(ad_type, context)
    return result
