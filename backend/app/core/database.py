import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from pymongo import MongoClient
from app.core.config import settings

logger = logging.getLogger("recoveriq.database")

# SQLAlchemy setup
connect_args = {"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {}
engine = create_engine(settings.DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# PyMongo setup with graceful fallback
mongo_client = None
mongo_db = None

try:
    mongo_client = MongoClient(settings.MONGODB_URL, serverSelectionTimeoutMS=1500)
    mongo_client.admin.command('ping')
    mongo_db = mongo_client[settings.MONGODB_DB_NAME]
    logger.info("MongoDB connected successfully.")
except Exception as e:
    logger.warning(f"MongoDB not available, running in relational fallback mode: {e}")
    mongo_db = None
