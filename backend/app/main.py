import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
from app.services.seed_service import seed_database
from app.routers import auth, transactions, analytics, risk, recovery, assistant, reports

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("recoveriq")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create tables and seed data if needed
    logger.info("Initializing RecoverIQ Database & Machine Learning Services...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    logger.info("RecoverIQ Engine initialized and ready.")
    yield
    # Shutdown
    logger.info("Shutting down RecoverIQ Engine.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="AI-Powered Financial Intelligence, Risk Detection & Revenue Recovery Platform",
    version="2.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Sub-Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(transactions.router, prefix=settings.API_V1_STR)
app.include_router(analytics.router, prefix=settings.API_V1_STR)
app.include_router(risk.router, prefix=settings.API_V1_STR)
app.include_router(recovery.router, prefix=settings.API_V1_STR)
app.include_router(assistant.router, prefix=settings.API_V1_STR)
app.include_router(reports.router, prefix=settings.API_V1_STR)

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "RecoverIQ Core API",
        "version": "2.0.0"
    }

@app.get("/")
def root():
    return {
        "name": "RecoverIQ API",
        "description": "Financial Intelligence, Anomaly Risk Detection & Intelligent Revenue Recovery",
        "docs": "/docs",
        "status": "active"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
