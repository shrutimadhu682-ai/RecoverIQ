import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, JSON
)
from sqlalchemy.orm import relationship
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), default="Alex Chen")
    company = Column(String(255), default="Apex Financial Technologies")
    role = Column(String(50), default="admin")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    transactions = relationship("FinancialTransaction", back_populates="user")
    alerts = relationship("RiskAlert", back_populates="user")


class FinancialTransaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    date = Column(String(50), nullable=False)
    amount = Column(Float, nullable=False)
    type = Column(String(20), default="debit")  # credit / debit
    balance = Column(Float, nullable=True)
    reference_number = Column(String(100), index=True, nullable=True)
    category = Column(String(100), default="General")  # Food, Travel, Utilities, SaaS, Shopping, etc.
    raw_narration = Column(Text, nullable=False)
    clean_narration = Column(Text, nullable=True)
    payee_name = Column(String(255), nullable=True)
    merchant_name = Column(String(255), nullable=True)
    is_merchant = Column(Boolean, default=False)
    payment_method = Column(String(50), default="UPI")  # UPI, Card, NetBanking, NEFT, ACH
    confidence_score = Column(Float, default=0.95)
    risk_score = Column(Float, default=15.0)  # 0 to 100
    is_recurring = Column(Boolean, default=False)
    is_flagged = Column(Boolean, default=False)
    is_duplicate = Column(Boolean, default=False)
    status = Column(String(50), default="COMPLETED")  # COMPLETED, FAILED, PENDING
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="transactions")
    risk_alerts = relationship("RiskAlert", back_populates="transaction")


class Merchant(Base):
    __tablename__ = "merchants"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, index=True, nullable=False)
    category = Column(String(100), default="Retail")
    logo_initials = Column(String(10), default="MC")
    accent_color = Column(String(20), default="#3B82F6")
    total_volume = Column(Float, default=0.0)
    transaction_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class PaymentEvent(Base):
    __tablename__ = "payment_events"

    id = Column(Integer, primary_key=True, index=True)
    transaction_ref = Column(String(100), index=True, nullable=False)
    customer_name = Column(String(255), default="Enterprise Client")
    customer_email = Column(String(255), default="billing@client.com")
    amount = Column(Float, nullable=False)
    currency = Column(String(10), default="INR")
    payment_method = Column(String(50), default="UPI")
    gateway = Column(String(50), default="Razorpay Sandbox")
    status = Column(String(50), default="FAILED")  # FAILED, RECOVERED, RETRYING, ABANDONED
    failure_code = Column(String(50), default="BANK_TIMEOUT")
    failure_reason = Column(String(255), default="Issuing bank timed out during authorization")
    failure_type = Column(String(50), default="TEMPORARY")  # TEMPORARY, PERMANENT
    recovery_probability = Column(Float, default=0.82)
    recommended_action = Column(String(255), default="Smart Delay Retry (T+15m)")
    recommended_retry_time = Column(String(100), default="15 minutes")
    expected_recovery_value = Column(Float, default=0.0)
    retry_cost = Column(Float, default=5.0)
    bandit_strategy = Column(String(100), default="Adaptive Exponential Backoff")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    attempts = relationship("RecoveryAttempt", back_populates="payment_event")


class RecoveryAttempt(Base):
    __tablename__ = "recovery_attempts"

    id = Column(Integer, primary_key=True, index=True)
    payment_event_id = Column(Integer, ForeignKey("payment_events.id"), nullable=False)
    attempt_number = Column(Integer, default=1)
    action_taken = Column(String(255), nullable=False)
    result_status = Column(String(50), default="SUCCESS")  # SUCCESS, FAILED, PENDING
    response_code = Column(String(50), default="200_OK")
    executed_at = Column(DateTime, default=datetime.datetime.utcnow)
    notes = Column(Text, nullable=True)

    payment_event = relationship("PaymentEvent", back_populates="attempts")


class RiskAlert(Base):
    __tablename__ = "risk_alerts"

    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(Integer, ForeignKey("transactions.id"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    risk_score = Column(Float, default=78.5)
    risk_level = Column(String(50), default="HIGH")  # LOW, MEDIUM, HIGH
    anomaly_score = Column(Float, default=-0.42)
    detection_method = Column(String(100), default="Isolation Forest + Velocity Rules")
    reasons = Column(JSON, default=list)  # list of feature explanations / SHAP contributions
    status = Column(String(50), default="PENDING")  # PENDING, CONFIRMED_FRAUD, FALSE_POSITIVE, RESOLVED
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    transaction = relationship("FinancialTransaction", back_populates="risk_alerts")
    user = relationship("User", back_populates="alerts")


class AIConversation(Base):
    __tablename__ = "ai_conversations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True)
    query = Column(Text, nullable=False)
    response_text = Column(Text, nullable=False)
    structured_data = Column(JSON, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    action = Column(String(100), nullable=False)
    entity = Column(String(100), nullable=False)
    entity_id = Column(String(100), nullable=True)
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
