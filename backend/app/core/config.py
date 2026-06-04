import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    PROJECT_NAME: str = "AUCTUS"
    API_V1_STR: str = "/api/v1"
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "SUPER_SECRET_KEY_FOR_AUCTUS_2026_MADE_BY_ARYAN")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days session
    
    # Databases
    # Fallback to local SQLite if DATABASE_URL is not specified or postgresql connection fails
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///D:/AUCTUS/database/auctus.db")
    
    # AI & Services
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    
    # Brand Owner Branding
    BRAND_OWNER: str = "Made by Aryan Pandey"
    
    class Config:
        case_sensitive = True

settings = Settings()
