from fastapi import APIRouter, Depends, HTTPException, Query, Body
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.models.entities import RiskAlert, FinancialTransaction
from app.schemas.schemas import RiskAlertOut, RiskStatusUpdate
from app.services.risk_iq_service import risk_iq_engine

router = APIRouter(prefix="/risk", tags=["Risk Monitoring"])

@router.get("/alerts", response_model=List[RiskAlertOut])
def get_risk_alerts(
    db: Session = Depends(get_db),
    level: Optional[str] = Query(None),
    status: Optional[str] = Query(None)
):
    query = db.query(RiskAlert)
    if level and level != "All":
        query = query.filter(RiskAlert.risk_level == level.upper())
    if status and status != "All":
        query = query.filter(RiskAlert.status == status.upper())

    alerts = query.order_by(RiskAlert.id.desc()).all()
    return alerts

@router.post("/analyze")
def analyze_transaction_risk(
    transaction: dict = Body(...),
    db: Session = Depends(get_db)
):
    """Real-time Isolation Forest + Statistical Velocity evaluation."""
    result = risk_iq_engine.analyze_transaction(transaction)
    return result

@router.put("/alerts/{alert_id}/status", response_model=RiskAlertOut)
def update_alert_status(
    alert_id: int,
    status_update: RiskStatusUpdate,
    db: Session = Depends(get_db)
):
    alert = db.query(RiskAlert).filter(RiskAlert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Risk alert not found.")
    
    valid_statuses = ["PENDING", "CONFIRMED_FRAUD", "FALSE_POSITIVE", "RESOLVED"]
    if status_update.status.upper() not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of {valid_statuses}")
    
    alert.status = status_update.status.upper()
    db.commit()
    db.refresh(alert)
    return alert
