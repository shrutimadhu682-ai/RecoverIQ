from fastapi import APIRouter, Depends, HTTPException, Query, Body
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.models.entities import PaymentEvent, RecoveryAttempt
from app.schemas.schemas import (
    PaymentEventOut, RetrySimulationRequest, RetrySimulationResponse
)
from app.services.recover_iq_service import recover_iq_engine, BANDIT_ARMS

router = APIRouter(prefix="/recovery", tags=["Payment Recovery Engine"])

@router.get("/events", response_model=List[PaymentEventOut])
def list_recovery_events(
    db: Session = Depends(get_db),
    status: Optional[str] = Query(None),
    failure_type: Optional[str] = Query(None)
):
    query = db.query(PaymentEvent)
    if status and status != "All":
        query = query.filter(PaymentEvent.status == status.upper())
    if failure_type and failure_type != "All":
        query = query.filter(PaymentEvent.failure_type == failure_type.upper())
    
    events = query.order_by(PaymentEvent.id.desc()).all()
    return events

@router.post("/predict")
def predict_recovery_probability(
    amount: float = Body(..., embed=True),
    payment_method: str = Body("UPI", embed=True),
    failure_code: str = Body("BANK_TIMEOUT", embed=True),
    attempt_count: int = Body(1, embed=True)
):
    """Predicts recovery probability and recommended bandit recovery action."""
    return recover_iq_engine.predict_recovery(amount, payment_method, failure_code, attempt_count)

@router.post("/retry", response_model=RetrySimulationResponse)
def simulate_retry(
    req: RetrySimulationRequest,
    db: Session = Depends(get_db)
):
    """
    Executes a simulated, idempotent smart retry on a failed payment event.
    Updates event state and adds a recovery attempt record.
    """
    event = db.query(PaymentEvent).filter(PaymentEvent.id == req.event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Payment event not found.")

    sim_result = recover_iq_engine.simulate_recovery_attempt(
        event_id=event.id,
        current_status=event.status,
        recovery_prob=event.recovery_probability,
        amount=event.amount
    )

    action_name = req.override_action or event.recommended_action
    new_status = sim_result.get("status", event.status)
    event.status = new_status

    # Record attempt
    attempt_count = db.query(RecoveryAttempt).filter(RecoveryAttempt.payment_event_id == event.id).count() + 1
    attempt = RecoveryAttempt(
        payment_event_id=event.id,
        attempt_number=attempt_count,
        action_taken=action_name,
        result_status="SUCCESS" if sim_result.get("success") else "FAILED",
        response_code=sim_result.get("response_code", "408_RETRY_SCHEDULED"),
        notes=sim_result.get("message")
    )
    db.add(attempt)
    db.commit()
    db.refresh(event)

    return RetrySimulationResponse(
        success=sim_result.get("success", False),
        event_id=event.id,
        status=event.status,
        recovered_amount=sim_result.get("recovered_amount", 0.0),
        retry_attempt_number=attempt_count,
        action_taken=action_name,
        message=sim_result.get("message", "Recovery attempt evaluated.")
    )

@router.get("/history")
def get_recovery_history(db: Session = Depends(get_db)):
    attempts = db.query(RecoveryAttempt).order_by(RecoveryAttempt.id.desc()).limit(100).all()
    out = []
    for a in attempts:
        event = db.query(PaymentEvent).filter(PaymentEvent.id == a.payment_event_id).first()
        out.append({
            "id": a.id,
            "payment_event_id": a.payment_event_id,
            "transaction_ref": event.transaction_ref if event else "N/A",
            "customer_name": event.customer_name if event else "Customer",
            "amount": event.amount if event else 0.0,
            "attempt_number": a.attempt_number,
            "action_taken": a.action_taken,
            "result_status": a.result_status,
            "response_code": a.response_code,
            "executed_at": a.executed_at,
            "notes": a.notes
        })
    return out

@router.get("/analytics")
def get_recovery_analytics(db: Session = Depends(get_db)):
    events = db.query(PaymentEvent).all()
    failed = [e for e in events if e.status == "FAILED"]
    recovered = [e for e in events if e.status == "RECOVERED"]
    retrying = [e for e in events if e.status == "RETRYING"]

    total_recovered_revenue = sum(e.amount for e in recovered)
    total_failed_revenue = sum(e.amount for e in failed)
    total_pipeline_volume = total_recovered_revenue + total_failed_revenue + sum(e.amount for e in retrying)
    
    # Reason distribution
    reasons_count = {}
    for e in events:
        reasons_count[e.failure_code] = reasons_count.get(e.failure_code, 0) + 1
    
    reasons_dist = [{"reason": k, "count": v} for k, v in reasons_count.items()]

    return {
        "total_cases": len(events),
        "recovered_cases_count": len(recovered),
        "failed_cases_count": len(failed),
        "pending_cases_count": len(retrying),
        "recovered_revenue": round(total_recovered_revenue, 2),
        "pending_revenue": round(total_failed_revenue, 2),
        "recovery_success_rate": round((len(recovered) / len(events) * 100), 1) if events else 0.0,
        "reasons_distribution": reasons_dist,
        "bandit_arms": BANDIT_ARMS,
        "bandit_stats": recover_iq_engine.bandit_scores
    }
