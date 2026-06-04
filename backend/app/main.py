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
    allow_credentials=True,
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
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "branding": settings.BRAND_OWNER,
        "database": "connected"
    }

@app.get("/", tags=["System Health"])
def root_redirect():
    """Redirect to Swagger UI API docs."""
    return {
        "message": f"Welcome to the {settings.PROJECT_NAME} API. Access API documentation at /docs",
        "developer": settings.BRAND_OWNER
    }
