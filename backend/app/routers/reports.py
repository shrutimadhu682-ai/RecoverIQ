import io
import csv
from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.entities import FinancialTransaction, PaymentEvent, RiskAlert
from app.services.finance_iq_service import analyze_finances

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("/summary")
def get_reports_summary(db: Session = Depends(get_db)):
    txs = db.query(FinancialTransaction).all()
    failed = db.query(PaymentEvent).filter(PaymentEvent.status == "FAILED").all()
    recovered = db.query(PaymentEvent).filter(PaymentEvent.status == "RECOVERED").all()
    alerts = db.query(RiskAlert).all()

    tx_dicts = [
        {"amount": t.amount, "type": t.type, "category": t.category, "merchant_name": t.merchant_name, "is_merchant": t.is_merchant, "is_recurring": t.is_recurring}
        for t in txs
    ]
    fin_stats = analyze_finances(tx_dicts)

    return {
        "report_id": "REP-2026-Q2-FIN",
        "generated_at": "2026-04-12T10:00:00Z",
        "scope": "Comprehensive Enterprise Financial Intelligence & Revenue Recovery",
        "metrics": {
            "total_transactions": len(txs),
            "total_income": fin_stats["total_income"],
            "total_expenses": fin_stats["total_expenses"],
            "net_cashflow": fin_stats["net_savings"],
            "recovered_revenue": sum(e.amount for e in recovered),
            "pending_failed_revenue": sum(e.amount for e in failed),
            "risk_alerts_logged": len(alerts),
            "top_categories": fin_stats["category_distribution"][:5]
        }
    }

@router.get("/export")
def export_transactions_csv(
    report_type: str = Query("transactions"),
    db: Session = Depends(get_db)
):
    output = io.StringIO()
    writer = csv.writer(output)

    if report_type == "recovery":
        writer.writerow(["ID", "Reference", "Customer", "Amount", "Method", "Gateway", "Status", "Failure Code", "Recovery Prob", "Action"])
        events = db.query(PaymentEvent).all()
        for e in events:
            writer.writerow([e.id, e.transaction_ref, e.customer_name, e.amount, e.payment_method, e.gateway, e.status, e.failure_code, e.recovery_probability, e.recommended_action])
        filename = "recoveriq_payment_recovery.csv"
    else:
        writer.writerow(["ID", "Date", "Narration", "Payee", "Merchant", "Category", "Method", "Amount", "Type", "Confidence", "Risk Score"])
        txs = db.query(FinancialTransaction).all()
        for t in txs:
            writer.writerow([t.id, t.date, t.raw_narration, t.payee_name, t.merchant_name, t.category, t.payment_method, t.amount, t.type, t.confidence_score, t.risk_score])
        filename = "recoveriq_transactions.csv"

    output.seek(0)
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
