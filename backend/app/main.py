import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import engine, Base
from app.api import auth, business, ingestion, analytics, advisor, reports, notifications, admin

# Setup logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Compile database tables automatically on startup (SQLite fallback or active PostgreSQL)
try:
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables initialized successfully.")
except Exception as e:
    logger.error(f"Failed to initialize database tables: {e}")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="AI-Powered Local Business Growth Advisor | Made by Aryan Pandey",
    version="1.0.0"
)

# Configure CORS
# Allow localhost development and production hosting links
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to specific domains
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(business.router, prefix=settings.API_V1_STR)
app.include_router(ingestion.router, prefix=settings.API_V1_STR)
app.include_router(analytics.router, prefix=settings.API_V1_STR)
app.include_router(advisor.router, prefix=settings.API_V1_STR)
app.include_router(reports.router, prefix=settings.API_V1_STR)
app.include_router(notifications.router, prefix=settings.API_V1_STR)
app.include_router(admin.router, prefix=settings.API_V1_STR)

@app.get("/health", tags=["System Health"])
def health_check():
    """Simple status check verifying the backend service is up and running."""
    import google.generativeai as genai
    from app.services.ai_service import is_gemini_active, last_gemini_error
    
    gemini_test_status = "inactive"
    if is_gemini_active:
        models_to_try = ['gemini-1.5-flash', 'gemini-1.5-flash-latest', 'gemini-pro', 'gemini-2.0-flash']
        errors = []
        for model_name in models_to_try:
            try:
                model = genai.GenerativeModel(model_name)
                res = model.generate_content("hello")
                gemini_test_status = f"success: {res.text.strip()[:30]}"
                break
            except Exception as e:
                errors.append(f"{model_name}: {str(e)}")
        if not gemini_test_status.startswith("success:"):
            gemini_test_status = f"error: {'; '.join(errors)}"
            
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "branding": settings.BRAND_OWNER,
        "database": "connected",
        "gemini_active": is_gemini_active,
        "gemini_version": genai.__version__,
        "gemini_test_status": gemini_test_status,
        "gemini_last_chat_error": last_gemini_error
    }

@app.get("/", tags=["System Health"])
def root_redirect():
    """Redirect to Swagger UI API docs."""
    return {
        "message": f"Welcome to the {settings.PROJECT_NAME} API. Access API documentation at /docs",
        "developer": settings.BRAND_OWNER
    }
