import os
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "RecoverIQ"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "recoveriq-super-secret-production-key-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./recoveriq.db")
    MONGODB_URL: str = os.getenv("MONGODB_URL", "mongodb://localhost:27017/")
    MONGODB_DB_NAME: str = os.getenv("MONGODB_DB_NAME", "recoveriq_db")
    
    # External APIs (Optional)
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://localhost:8000",
        "*"
    ]

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
