import random
import logging
import numpy as np
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta

logger = logging.getLogger("recoveriq.recovery")

# Failure classifications
TEMPORARY_FAILURES = {
    "BANK_TIMEOUT": {
        "description": "Issuing bank gateway timed out during authorization handshake.",
        "base_recovery_prob": 0.88,
        "default_delay": "15 minutes",
        "action": "Smart Delay Retry (T+15m)"
    },
    "NETWORK_ERROR": {
        "description": "Transient packet drop or network routing failure at gateway node.",
        "base_recovery_prob": 0.92,
        "default_delay": "5 minutes",
        "action": "Immediate Exponential Backoff (T+5m)"
    },
    "INSUFFICIENT_FUNDS": {
        "description": "Payer balance currently below order threshold; likely replenished near pay cycle.",
        "base_recovery_prob": 0.64,
        "default_delay": "24 hours (Morning replenishment window)",
        "action": "Payday-Optimized Retry (T+24h)"
    },
    "GATEWAY_DOWNTIME": {
        "description": "Primary acquiring switch reporting elevated degradation.",
        "base_recovery_prob": 0.85,
        "default_delay": "30 minutes",
        "action": "Dynamic Secondary Gateway Switch"
    },
    "AUTH_EXPIRED": {
        "description": "User session or 3D-Secure 2FA challenge expired before completion.",
        "base_recovery_prob": 0.70,
        "default_delay": "1 hour",
        "action": "Automated Customer Re-Auth Notification"
    }
}

PERMANENT_FAILURES = {
    "CARD_EXPIRED": {
        "description": "Payment instrument past expiry validity period.",
        "base_recovery_prob": 0.15,
        "action": "Prompt Customer for Updated Card Details"
    },
    "INVALID_ACCOUNT": {
        "description": "Destination VPA or account number does not exist.",
        "base_recovery_prob": 0.05,
        "action": "Do Not Retry - Require Payment Method Replacement"
    },
    "FRAUD_SUSPECTED": {
        "description": "Transaction halted by issuer risk control rules.",
        "base_recovery_prob": 0.08,
        "action": "Manual Compliance Review Required"
    },
    "ACCOUNT_CLOSED": {
        "description": "The linked bank account has been decommissioned.",
        "base_recovery_prob": 0.02,
        "action": "Do Not Retry - Permanently Closed"
    }
}

# Contextual Multi-Armed Bandit Arms
BANDIT_ARMS = [
    {"id": "arm_exp_backoff", "name": "Adaptive Exponential Backoff", "weight": 0.35, "cost": 3.5},
    {"id": "arm_cascade_gateway", "name": "Dynamic Secondary Rail Routing", "weight": 0.30, "cost": 5.0},
    {"id": "arm_smart_window", "name": "Time-Of-Day Optimal Window", "weight": 0.20, "cost": 2.0},
    {"id": "arm_nudge_retry", "name": "Pre-Retry WhatsApp / SMS Nudge", "weight": 0.15, "cost": 8.0}
]

class RecoverIQEngine:
    def __init__(self):
        # Simulated XGBoost model weights for recovery probability
        self.retry_cost_base = 5.0  # INR estimated cost per automated payment retry
        self.bandit_scores = {arm["id"]: {"successes": 15, "failures": 3} for arm in BANDIT_ARMS}

    def classify_failure(self, failure_code: str) -> Dict[str, Any]:
        """Classifies payment failure into TEMPORARY or PERMANENT with domain intelligence."""
        code_upper = (failure_code or "BANK_TIMEOUT").upper()
        if code_upper in TEMPORARY_FAILURES:
            info = TEMPORARY_FAILURES[code_upper]
            return {
                "failure_code": code_upper,
                "failure_type": "TEMPORARY",
                "is_retryable": True,
                "description": info["description"],
                "base_prob": info["base_recovery_prob"],
                "default_delay": info["default_delay"],
                "recommended_action": info["action"]
            }
        elif code_upper in PERMANENT_FAILURES:
            info = PERMANENT_FAILURES[code_upper]
            return {
                "failure_code": code_upper,
                "failure_type": "PERMANENT",
                "is_retryable": False,
                "description": info["description"],
                "base_prob": info["base_recovery_prob"],
                "default_delay": "N/A (User action needed)",
                "recommended_action": info["action"]
            }
        else:
            # Fallback
            return {
                "failure_code": code_upper,
                "failure_type": "TEMPORARY",
                "is_retryable": True,
                "description": "General upstream payment decline.",
                "base_prob": 0.65,
                "default_delay": "15 minutes",
                "recommended_action": "Adaptive Retry (T+15m)"
            }

    def predict_recovery(self, amount: float, method: str, failure_code: str, attempt_count: int = 1) -> Dict[str, Any]:
        """
        Predicts recovery probability using simulated XGBoost features
        and estimates expected recovery value vs retry cost.
        """
        classification = self.classify_failure(failure_code)
        base_prob = classification["base_prob"]

        # Feature modifications (Method, Amount, Attempt degradation)
        method_multiplier = 1.05 if method.upper() == "UPI" else (0.95 if method.upper() == "CARD" else 0.90)
        
        # Lower probability for very large amounts due to credit limits
        amount_penalty = 0.0
        if amount > 50000:
            amount_penalty = 0.12
        elif amount > 15000:
            amount_penalty = 0.05

        # Degradation per failed retry attempt
        attempt_penalty = (attempt_count - 1) * 0.18

        final_prob = max(min((base_prob * method_multiplier) - amount_penalty - attempt_penalty, 0.96), 0.02)
        final_prob = round(final_prob, 3)

        # Multi-armed bandit strategy selection (Thompson Sampling / UCB approximation)
        selected_arm = self._select_bandit_arm(classification["is_retryable"])

        # Expected Value calculation: EV = (Probability * Amount) - RetryCost
        retry_cost = selected_arm["cost"]
        expected_value = round((final_prob * amount) - retry_cost, 2)

        return {
            "failure_code": classification["failure_code"],
            "failure_type": classification["failure_type"],
            "is_retryable": classification["is_retryable"],
            "description": classification["description"],
            "recovery_probability": final_prob,
            "recommended_action": selected_arm["name"] if classification["is_retryable"] else classification["recommended_action"],
            "recommended_retry_time": classification["default_delay"],
            "expected_recovery_value": max(expected_value, 0.0),
            "retry_cost": retry_cost,
            "bandit_strategy": selected_arm["name"],
            "confidence_interval": [round(max(final_prob - 0.06, 0.01), 2), round(min(final_prob + 0.06, 0.99), 2)]
        }

    def _select_bandit_arm(self, is_retryable: bool) -> Dict[str, Any]:
        if not is_retryable:
            return {"id": "arm_manual", "name": "Customer Re-engagement Notice", "cost": 1.0}
        
        # Choose best performing arm with epsilon-greedy exploration
        if random.random() < 0.15:
            # Explore
            return random.choice(BANDIT_ARMS)
        else:
            # Exploit highest empirical win-rate
            best_arm = BANDIT_ARMS[0]
            best_rate = -1.0
            for arm in BANDIT_ARMS:
                stats = self.bandit_scores.get(arm["id"], {"successes": 1, "failures": 1})
                rate = stats["successes"] / (stats["successes"] + stats["failures"])
                if rate > best_rate:
                    best_rate = rate
                    best_arm = arm
            return best_arm

    def simulate_recovery_attempt(self, event_id: int, current_status: str, recovery_prob: float, amount: float) -> Dict[str, Any]:
        """
        Executes a simulated, idempotent payment recovery attempt in the sandbox.
        Never touches real cards or real banks.
        """
        if current_status == "RECOVERED":
            return {
                "success": True,
                "already_recovered": True,
                "message": f"Payment event #{event_id} was already successfully recovered."
            }

        # Simulated outcome weighted by model probability
        outcome_roll = random.random()
        is_success = outcome_roll <= recovery_prob

        # Update bandit stats
        arm_id = "arm_exp_backoff"
        if is_success:
            self.bandit_scores[arm_id]["successes"] += 1
            return {
                "success": True,
                "status": "RECOVERED",
                "recovered_amount": amount,
                "message": f"Smart Retry Succeeded! ₹{amount:,.2f} recovered via optimal routing rails.",
                "response_code": "200_AUTH_SETTLED"
            }
        else:
            self.bandit_scores[arm_id]["failures"] += 1
            return {
                "success": False,
                "status": "RETRYING",
                "recovered_amount": 0.0,
                "message": "Attempt unsuccessful on this cycle; rescheduling next optimal window.",
                "response_code": "408_RETRY_SCHEDULED"
            }

recover_iq_engine = RecoverIQEngine()
