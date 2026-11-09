from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

# --- Auth ---
class UserCreate(BaseModel):
    email: str
    password: str
    full_name: Optional[str] = "Alex Chen"
    company: Optional[str] = "Apex Financial Technologies"

class UserLogin(BaseModel):
    email: str
    password: str

class UserOut(BaseModel):
    id: int
    email: str
    full_name: str
    company: str
    role: str

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

# --- Transactions ---
class TransactionCreate(BaseModel):
    date: str
    amount: float
    type: str = "debit"
    balance: Optional[float] = None
    reference_number: Optional[str] = None
    category: Optional[str] = "General"
    raw_narration: str
    payee_name: Optional[str] = None
    merchant_name: Optional[str] = None
    is_merchant: Optional[bool] = False
    payment_method: Optional[str] = "UPI"

class TransactionUpdate(BaseModel):
    category: Optional[str] = None
    merchant_name: Optional[str] = None
    payee_name: Optional[str] = None
    is_merchant: Optional[bool] = None
    payment_method: Optional[str] = None
    notes: Optional[str] = None

class TransactionOut(BaseModel):
    id: int
    date: str
    amount: float
    type: str
    balance: Optional[float]
    reference_number: Optional[str]
    category: str
    raw_narration: str
    clean_narration: Optional[str]
    payee_name: Optional[str]
    merchant_name: Optional[str]
    is_merchant: bool
    payment_method: str
    confidence_score: float
    risk_score: float
    is_recurring: bool
    is_flagged: bool
    is_duplicate: bool
    status: str
    notes: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

# --- Analytics ---
class CategorySpending(BaseModel):
    category: str
    amount: float
    percentage: float
    count: int
    color: str

class MerchantSpending(BaseModel):
    merchant: str
    amount: float
    count: int
    category: str

class MonthlyTrend(BaseModel):
    month: str
    income: float
    expenses: float
    net_savings: float
    recovery: float

class AnalyticsOverview(BaseModel):
    total_transactions: int
    total_income: float
    total_expenses: float
    net_cashflow: float
    failed_payments_count: int
    recovered_revenue: float
    recovery_rate: float
    high_risk_alerts_count: int
    recurring_expenses_monthly: float
    monthly_trends: List[MonthlyTrend]
    category_distribution: List[CategorySpending]
    top_merchants: List[MerchantSpending]

# --- Risk ---
class RiskAlertOut(BaseModel):
    id: int
    transaction_id: Optional[int]
    risk_score: float
    risk_level: str
    anomaly_score: float
    detection_method: str
    reasons: List[Dict[str, Any]]
    status: str
    created_at: datetime
    transaction: Optional[TransactionOut] = None

    class Config:
        from_attributes = True

class RiskStatusUpdate(BaseModel):
    status: str  # CONFIRMED_FRAUD, FALSE_POSITIVE, RESOLVED

# --- Recovery Engine ---
class PaymentEventOut(BaseModel):
    id: int
    transaction_ref: str
    customer_name: str
    customer_email: str
    amount: float
    currency: str
    payment_method: str
    gateway: str
    status: str
    failure_code: str
    failure_reason: str
    failure_type: str
    recovery_probability: float
    recommended_action: str
    recommended_retry_time: str
    expected_recovery_value: float
    retry_cost: float
    bandit_strategy: str
    created_at: datetime

    class Config:
        from_attributes = True

class RetrySimulationRequest(BaseModel):
    event_id: int
    override_action: Optional[str] = None

class RetrySimulationResponse(BaseModel):
    success: bool
    event_id: int
    status: str
    recovered_amount: float
    retry_attempt_number: int
    action_taken: str
    message: str

# --- AI Assistant ---
class ChatMessage(BaseModel):
    role: str
    content: str

class AssistantRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = []

class AssistantResponse(BaseModel):
    reply: str
    intent: str
    structured_data: Optional[Dict[str, Any]] = None
    suggested_actions: Optional[List[str]] = []
