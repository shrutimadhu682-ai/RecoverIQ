import re
import logging
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models.entities import FinancialTransaction, PaymentEvent, RiskAlert

logger = logging.getLogger("recoveriq.assistant")

def answer_financial_query(db: Session, query: str) -> Dict[str, Any]:
    """
    Answers user questions grounded in actual database records.
    Never hallucinates fake financial figures.
    """
    q = query.lower().strip()
    
    # Fetch real records from DB
    transactions = db.query(FinancialTransaction).all()
    failed_events = db.query(PaymentEvent).filter(PaymentEvent.status == "FAILED").all()
    recovered_events = db.query(PaymentEvent).filter(PaymentEvent.status == "RECOVERED").all()
    alerts = db.query(RiskAlert).all()

    total_spend = sum(t.amount for t in transactions if t.type == "debit")
    total_income = sum(t.amount for t in transactions if t.type == "credit")
    recurring_txs = [t for t in transactions if t.is_recurring and t.type == "debit"]

    # 1. "How much did I spend / spending / expenses"
    if any(k in q for k in ["spend", "expense", "expenses", "spent", "total spend"]):
        top_cats = {}
        for t in transactions:
            if t.type == "debit":
                top_cats[t.category] = top_cats.get(t.category, 0.0) + t.amount
        sorted_cats = sorted(top_cats.items(), key=lambda x: x[1], reverse=True)[:3]
        cat_summary = ", ".join([f"{c} (₹{amt:,.0f})" for c, amt in sorted_cats])

        return {
            "reply": f"Based on your recorded transactions, your total expenditure is **₹{total_spend:,.2f}** across {len([t for t in transactions if t.type == 'debit'])} debit transactions. Your highest spending categories are {cat_summary}.",
            "intent": "SPENDING_SUMMARY",
            "structured_data": {
                "type": "metric_card",
                "title": "Total Recorded Expenditure",
                "value": f"₹{total_spend:,.2f}",
                "breakdown": [{"category": c, "amount": amt} for c, amt in sorted_cats]
            },
            "suggested_actions": ["Which merchant received the highest payments?", "Show my recurring subscriptions", "Are there any unusual transactions?"]
        }

    # 2. "Which merchant / top merchant / highest payment"
    if any(k in q for k in ["merchant", "highest payment", "highest spend", "vendor"]):
        merchant_totals = {}
        for t in transactions:
            if t.merchant_name and t.type == "debit":
                merchant_totals[t.merchant_name] = merchant_totals.get(t.merchant_name, 0.0) + t.amount

        if merchant_totals:
            top_merch, top_amt = max(merchant_totals.items(), key=lambda x: x[1])
            top_list = sorted(merchant_totals.items(), key=lambda x: x[1], reverse=True)[:5]
            
            return {
                "reply": f"Your highest expenditure went to **{top_merch}** with a cumulative volume of **₹{top_amt:,.2f}**. Here is your top merchant leaderboard from active records:",
                "intent": "TOP_MERCHANTS",
                "structured_data": {
                    "type": "table",
                    "columns": ["Merchant", "Total Spent (INR)"],
                    "rows": [[m, f"₹{amt:,.2f}"] for m, amt in top_list]
                },
                "suggested_actions": ["Show recurring subscriptions", "What recovery action is recommended?", "Are there any unusual transactions?"]
            }

    # 3. "Recurring / Subscriptions"
    if any(k in q for k in ["recurring", "subscription", "subscriptions", "autodebit"]):
        rec_list = []
        for t in recurring_txs:
            rec_list.append({"name": t.merchant_name or t.payee_name, "amount": t.amount, "category": t.category, "method": t.payment_method})
        
        total_rec = sum(t.amount for t in recurring_txs)
        return {
            "reply": f"You have **{len(recurring_txs)} active recurring commitments** totaling **₹{total_rec:,.2f}** per billing cycle. These include cloud infrastructure, productivity tools, and utilities.",
            "intent": "RECURRING_SUBSCRIPTIONS",
            "structured_data": {
                "type": "subscription_list",
                "total_monthly": total_rec,
                "items": rec_list
            },
            "suggested_actions": ["How much did I spend this month?", "Which payments failed?"]
        }

    # 4. "Unusual / Anomaly / Risk / Suspicious / Why flagged"
    if any(k in q for k in ["unusual", "anomaly", "risk", "flagged", "suspicious", "fraud"]):
        high_alerts = [a for a in alerts if a.risk_level == "HIGH"]
        if high_alerts:
            latest = high_alerts[0]
            reasons_text = "; ".join([r.get("detail", "") for r in latest.reasons])
            return {
                "reply": f"RiskIQ has identified **{len(alerts)} suspicious transactions** ({len(high_alerts)} high-risk alerts). For example, Transaction #{latest.transaction_id} was flagged with a risk score of **{latest.risk_score}/100** because: {reasons_text}. Note: RiskIQ labels this as an *anomaly* for verification, not confirmed fraud.",
                "intent": "RISK_EXPLANATION",
                "structured_data": {
                    "type": "risk_card",
                    "risk_score": latest.risk_score,
                    "risk_level": latest.risk_level,
                    "anomaly_score": latest.anomaly_score,
                    "factors": latest.reasons
                },
                "suggested_actions": ["Show all high-risk alerts", "Which payments failed?", "What recovery action is recommended?"]
            }
        else:
            return {
                "reply": "No high-risk anomalies currently flagged in your transactions. All recent entries conform to expected frequency, amount, and merchant patterns.",
                "intent": "RISK_CLEAR",
                "suggested_actions": ["How much did I spend this month?", "Which payments failed?"]
            }

    # 5. "Failed / Recovery / Recommended action"
    if any(k in q for k in ["failed", "recovery", "recover", "retry", "failure"]):
        if failed_events:
            event = failed_events[0]
            return {
                "reply": f"You currently have **{len(failed_events)} pending failed payment events** totaling **₹{sum(e.amount for e in failed_events):,.2f}**. For Ref `{event.transaction_ref}` (₹{event.amount:,.2f}), the failure was classified as **{event.failure_type} ({event.failure_code})** with an estimated recovery probability of **{event.recovery_probability * 100:.1f}%**. Recommended strategy: **{event.recommended_action}** (optimal delay: {event.recommended_retry_time}).",
                "intent": "PAYMENT_RECOVERY",
                "structured_data": {
                    "type": "recovery_card",
                    "ref": event.transaction_ref,
                    "amount": f"₹{event.amount:,.2f}",
                    "failure_code": event.failure_code,
                    "probability": f"{event.recovery_probability * 100:.1f}%",
                    "recommended_action": event.recommended_action
                },
                "suggested_actions": ["Execute smart retry simulation", "Show spending breakdown", "Are there any unusual transactions?"]
            }
        else:
            return {
                "reply": f"All payment events are currently healthy! {len(recovered_events)} transactions were successfully recovered by RecoverIQ's automated retry engine.",
                "intent": "RECOVERY_HEALTHY",
                "suggested_actions": ["How much did I spend this month?", "Which merchant received the highest payments?"]
            }

    # General default response grounded in real data
    return {
        "reply": f"RecoverIQ is actively monitoring **{len(transactions)} transactions**, **{len(alerts)} risk alerts**, and **{len(failed_events)} pending recovery cases**. I can answer specific questions regarding your spending breakdown, highest merchant volume, subscriptions, risk explanations, or payment recovery recommendations.",
        "intent": "GENERAL_INQUIRY",
        "suggested_actions": [
            "How much did I spend this month?",
            "Which merchant received the highest payments?",
            "Show my recurring subscriptions",
            "Are there any unusual transactions?",
            "What recovery action is recommended?"
        ]
    }
