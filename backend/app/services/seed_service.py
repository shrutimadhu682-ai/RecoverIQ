import datetime
import logging
from sqlalchemy.orm import Session
from app.core.security import get_password_hash
from app.models.entities import User, FinancialTransaction, Merchant, PaymentEvent, RecoveryAttempt, RiskAlert
from app.services.finparse_service import parse_transaction_narration
from app.services.risk_iq_service import risk_iq_engine
from app.services.recover_iq_service import recover_iq_engine

logger = logging.getLogger("recoveriq.seed")

def seed_database(db: Session):
    """Populates realistic fintech transactions, merchants, recovery events and risk alerts."""
    # Check if already seeded
    if db.query(User).first():
        logger.info("Database already contains data; skipping seed.")
        return

    logger.info("Seeding realistic fintech database...")

    # 1. Create Default Admin User
    admin = User(
        email="alex.chen@recoveriq.io",
        hashed_password=get_password_hash("password123"),
        full_name="Alex Chen",
        company="Apex Financial Technologies",
        role="admin"
    )
    db.add(admin)
    db.commit()
    db.refresh(admin)

    # 2. Raw Transaction Narrations
    raw_tx_data = [
        # Income credits
        ("2026-04-01", 185000.0, "credit", 245000.0, "NEFT/CMS/093281/APEX_GLOBAL_SALARY/APR26", "Apex Global Tech", "NEFT", "Salary & Consulting"),
        ("2026-04-10", 70000.0, "credit", 315000.0, "IMPS/923841/STRIPE_CONSULTING_PAYOUT", "Stripe Payout", "IMPS", "Salary & Consulting"),
        
        # Cloud & SaaS
        ("2026-04-02", 14850.0, "debit", 300150.0, "CARD/POS/AWS_CLOUD_SERVICES/US/9321", "AWS Cloud", "Card", "SaaS & Cloud"),
        ("2026-04-03", 2400.0, "debit", 297750.0, "CARD/POS/GITHUB_ENTERPRISE_ORG/US", "GitHub Inc", "Card", "SaaS & Cloud"),
        ("2026-04-04", 5120.0, "debit", 292630.0, "CARD/POS/GOOGLE_WORKSPACE_MONTHLY", "Google Workspace", "Card", "SaaS & Cloud"),
        ("2026-04-05", 8900.0, "debit", 283730.0, "CARD/POS/OPENAI_API_PLATFORM_BILLING", "OpenAI API", "Card", "SaaS & Cloud"),
        ("2026-04-06", 3200.0, "debit", 280530.0, "CARD/POS/SLACK_TECHNOLOGIES_MONTHLY", "Slack Technologies", "Card", "SaaS & Cloud"),
        
        # Food & Dining
        ("2026-04-02", 640.0, "debit", 279890.0, "UPI/839201/SWIGGY/OKAXIS/640", "Swiggy", "UPI", "Food & Dining"),
        ("2026-04-03", 420.0, "debit", 279470.0, "UPI/839492/ZOMATO_REST/OKHDFC/420", "Zomato", "UPI", "Food & Dining"),
        ("2026-04-05", 380.0, "debit", 279090.0, "UPI/942810/STARBUCKS_COFFEE_BLR/450", "Starbucks", "UPI", "Food & Dining"),
        ("2026-04-07", 1250.0, "debit", 277840.0, "POS/CARD/TOIT_BREWPUB_INDIRANAGAR", "Toit Brewpub", "Card", "Food & Dining"),
        ("2026-04-09", 540.0, "debit", 277300.0, "UPI/948211/SWIGGY_INSTAMART/OKICICI", "Swiggy Instamart", "UPI", "Food & Dining"),
        
        # Travel & Commute
        ("2026-04-04", 480.0, "debit", 276820.0, "UPI/928341/UBER_INDIA_RIDE/OKAXIS", "Uber", "UPI", "Travel & Commute"),
        ("2026-04-06", 320.0, "debit", 276500.0, "UPI/839121/OLA_CABS_BANGALORE/OKSBI", "Ola Cabs", "UPI", "Travel & Commute"),
        ("2026-04-11", 6400.0, "debit", 270100.0, "CARD/POS/INDIGO_AIRLINES_BOOKING_DEL_BLR", "IndiGo Airlines", "Card", "Travel & Commute"),
        
        # Subscriptions & Entertainment
        ("2026-04-01", 649.0, "debit", 269451.0, "NACH/AUTOPAY/NETFLIX_PREMIUM_MONTHLY", "Netflix", "NACH AutoDebit", "Entertainment"),
        ("2026-04-01", 119.0, "debit", 269332.0, "NACH/AUTOPAY/SPOTIFY_INDIVIDUAL_SUB", "Spotify", "NACH AutoDebit", "Entertainment"),
        
        # Utilities
        ("2026-04-08", 3450.0, "debit", 265882.0, "INB/BILLDESK/BESCOM_ELECTRICITY_BILL", "BESCOM Electricity", "NetBanking", "Utilities"),
        ("2026-04-08", 1299.0, "debit", 264583.0, "UPI/948201/AIRTEL_FIBER_BROADBAND", "Airtel Telecommunications", "UPI", "Utilities"),
        
        # Healthcare & Shopping
        ("2026-04-09", 2150.0, "debit", 262433.0, "CARD/POS/APOLLO_PHARMACY_BLR", "Apollo Pharmacy", "Card", "Healthcare"),
        ("2026-04-10", 4890.0, "debit", 257543.0, "CARD/POS/AMAZON_RETAIL_INDIA", "Amazon", "Card", "Shopping"),
        
        # High Risk Anomaly Spike (Z-Score > 4.5)
        ("2026-04-11", 94000.0, "debit", 163543.0, "POS/CARD/UNVERIFIED_INTL_CRYPTO_EXCHANGE/ESTONIA", "Unverified Intl Exchange", "Card", "Financial Services"),
        
        # Duplicate pair for Risk Engine demonstration
        ("2026-04-12", 7500.0, "debit", 156043.0, "UPI/998811/ELECTRONICS_ACCESSORIES/OKAXIS", "Electronics Store", "UPI", "Shopping"),
        ("2026-04-12", 7500.0, "debit", 148543.0, "UPI/998811/ELECTRONICS_ACCESSORIES/OKAXIS", "Electronics Store", "UPI", "Shopping"),
    ]

    tx_objects = []
    for item in raw_tx_data:
        date_str, amt, t_type, bal, narration, payee, method, cat = item
        parsed = parse_transaction_narration(narration, amt)
        
        is_dup = narration == "UPI/998811/ELECTRONICS_ACCESSORIES/OKAXIS" and len([x for x in tx_objects if x.raw_narration == narration]) > 0

        tx = FinancialTransaction(
            user_id=admin.id,
            date=date_str,
            amount=amt,
            type=t_type,
            balance=bal,
            reference_number=parsed.get("reference_number") or f"TXN{abs(hash(narration))%100000000}",
            category=cat,
            raw_narration=narration,
            clean_narration=parsed.get("clean_narration"),
            payee_name=payee,
            merchant_name=parsed.get("merchant_name") or payee,
            is_merchant=parsed.get("is_merchant", True),
            payment_method=method,
            confidence_score=parsed.get("confidence_score", 0.95),
            risk_score=15.0,
            is_recurring=parsed.get("is_recurring", False) or "MONTHLY" in narration,
            is_duplicate=is_dup,
            status="COMPLETED"
        )
        tx_objects.append(tx)

    db.add_all(tx_objects)
    db.commit()

    # Re-evaluate with Risk Engine
    historical_dicts = [
        {"amount": t.amount, "type": t.type, "is_merchant": t.is_merchant, "is_recurring": t.is_recurring}
        for t in tx_objects
    ]
    risk_iq_engine.fit(historical_dicts)

    for tx in tx_objects:
        tx_dict = {
            "amount": tx.amount,
            "type": tx.type,
            "is_merchant": tx.is_merchant,
            "is_recurring": tx.is_recurring,
            "is_duplicate": tx.is_duplicate,
            "payee_name": tx.payee_name,
            "confidence_score": tx.confidence_score
        }
        risk_result = risk_iq_engine.analyze_transaction(tx_dict)
        tx.risk_score = risk_result["risk_score"]
        if risk_result["risk_level"] in ["HIGH", "MEDIUM"]:
            tx.is_flagged = True
            alert = RiskAlert(
                transaction_id=tx.id,
                user_id=admin.id,
                risk_score=risk_result["risk_score"],
                risk_level=risk_result["risk_level"],
                anomaly_score=risk_result["anomaly_score"],
                detection_method=risk_result["detection_method"],
                reasons=risk_result["reasons"],
                status="PENDING"
            )
            db.add(alert)
    db.commit()

    # 3. Seed Simulated Payment Recovery Events (MODULE D)
    recovery_events_data = [
        ("REF-REC-8921", "Horizon Labs Pvt Ltd", "billing@horizonlabs.ai", 45000.0, "UPI", "Razorpay Sandbox", "FAILED", "BANK_TIMEOUT"),
        ("REF-REC-8922", "CloudScale Networks", "ops@cloudscale.io", 28500.0, "Card", "Stripe Sandbox", "RECOVERED", "NETWORK_ERROR"),
        ("REF-REC-8923", "NextGen Retailers", "accounts@nextgen.com", 12400.0, "UPI", "Razorpay Sandbox", "FAILED", "INSUFFICIENT_FUNDS"),
        ("REF-REC-8924", "Starlight Media", "finance@starlight.co", 8500.0, "NetBanking", "PayU Sandbox", "FAILED", "GATEWAY_DOWNTIME"),
        ("REF-REC-8925", "Veloce Mobility", "billing@veloce.in", 32000.0, "Card", "Stripe Sandbox", "RECOVERED", "AUTH_EXPIRED"),
        ("REF-REC-8926", "Global Enterprise Corp", "pay@globalent.com", 95000.0, "Card", "Stripe Sandbox", "FAILED", "CARD_EXPIRED"),
    ]

    for item in recovery_events_data:
        ref, c_name, c_email, amt, method, gateway, status, f_code = item
        pred = recover_iq_engine.predict_recovery(amt, method, f_code)
        
        pe = PaymentEvent(
            transaction_ref=ref,
            customer_name=c_name,
            customer_email=c_email,
            amount=amt,
            currency="INR",
            payment_method=method,
            gateway=gateway,
            status=status,
            failure_code=f_code,
            failure_reason=pred["description"],
            failure_type=pred["failure_type"],
            recovery_probability=pred["recovery_probability"],
            recommended_action=pred["recommended_action"],
            recommended_retry_time=pred["recommended_retry_time"],
            expected_recovery_value=pred["expected_recovery_value"],
            retry_cost=pred["retry_cost"],
            bandit_strategy=pred["bandit_strategy"]
        )
        db.add(pe)
        db.commit()
        db.refresh(pe)

        # Add initial attempt
        if status == "RECOVERED":
            attempt = RecoveryAttempt(
                payment_event_id=pe.id,
                attempt_number=1,
                action_taken="Dynamic Secondary Rail Routing (T+15m)",
                result_status="SUCCESS",
                response_code="200_AUTH_SETTLED",
                notes="Recovered automatically via contextual bandit smart routing."
            )
            db.add(attempt)
        else:
            attempt = RecoveryAttempt(
                payment_event_id=pe.id,
                attempt_number=1,
                action_taken="Initial Gateway Submission",
                result_status="FAILED",
                response_code="504_TIMEOUT",
                notes=f"Initial failure recorded: {f_code}."
            )
            db.add(attempt)
        db.commit()

    logger.info("Database successfully seeded with realistic enterprise fintech records.")
