import numpy as np
import pandas as pd
from typing import Dict, Any, List, Tuple
from sklearn.ensemble import IsolationForest
import logging

logger = logging.getLogger("recoveriq.riskiq")

class RiskIQEngine:
    def __init__(self):
        # Isolation Forest configuration
        self.model = IsolationForest(
            n_estimators=100,
            contamination=0.08,
            random_state=42
        )
        self.is_fitted = False
        self._mean_amount = 2500.0
        self._std_amount = 3200.0

    def fit(self, transactions: List[Dict[str, Any]]):
        """Fit Isolation Forest on historical numerical transaction features."""
        if len(transactions) < 10:
            return
        
        amounts = [t.get("amount", 0.0) for t in transactions]
        self._mean_amount = float(np.mean(amounts))
        self._std_amount = float(np.std(amounts)) or 1.0

        features = self._extract_features(transactions)
        self.model.fit(features)
        self.is_fitted = True
        logger.info("RiskIQ Isolation Forest fitted on %d transactions", len(transactions))

    def _extract_features(self, transactions: List[Dict[str, Any]]) -> np.ndarray:
        feats = []
        for t in transactions:
            amt = float(t.get("amount", 0.0))
            is_debit = 1.0 if t.get("type", "debit") == "debit" else 0.0
            is_merchant = 1.0 if t.get("is_merchant") else 0.0
            is_recurring = 1.0 if t.get("is_recurring") else 0.0
            feats.append([amt, is_debit, is_merchant, is_recurring])
        return np.array(feats)

    def analyze_transaction(self, trx: Dict[str, Any], history: List[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Calculates risk score (0-100), classification, Isolation Forest score,
        and SHAP-style explainable feature attributions.
        """
        amount = float(trx.get("amount", 0.0))
        reasons = []
        risk_score = 10.0  # baseline normal transaction risk

        # 1. Unusual Amount Deviation (Z-Score calculation)
        z_score = (amount - self._mean_amount) / (self._std_amount if self._std_amount > 0 else 1.0)
        if amount > (self._mean_amount * 4) or z_score > 3.0:
            deviation_factor = round(amount / self._mean_amount, 1) if self._mean_amount > 0 else 5.0
            risk_score += 45.0
            reasons.append({
                "factor": "Unusual Amount Spike",
                "impact": "High (+45)",
                "detail": f"Amount ₹{amount:,.2f} is {deviation_factor}x higher than your historical average (₹{self._mean_amount:,.2f}).",
                "shap_value": 0.45
            })
        elif amount > (self._mean_amount * 2):
            risk_score += 20.0
            reasons.append({
                "factor": "Elevated Transaction Amount",
                "impact": "Medium (+20)",
                "detail": f"Amount ₹{amount:,.2f} is more than 2x your typical spending level.",
                "shap_value": 0.20
            })

        # 2. Duplicate Check
        if trx.get("is_duplicate"):
            risk_score += 30.0
            reasons.append({
                "factor": "Identical Duplicate Detected",
                "impact": "High (+30)",
                "detail": "Duplicate transaction detected with identical timestamp, amount, and reference identifier.",
                "shap_value": 0.30
            })

        # 3. High Frequency / Burst Check (if history provided)
        if history and len(history) >= 3:
            recent_same_payee = [h for h in history[-5:] if h.get("payee_name") and h.get("payee_name") == trx.get("payee_name")]
            if len(recent_same_payee) >= 3:
                risk_score += 25.0
                reasons.append({
                    "factor": "Transaction Velocity Surge",
                    "impact": "Medium (+25)",
                    "detail": f"Unusual burst of {len(recent_same_payee)} transactions to '{trx.get('payee_name')}' within a short time window.",
                    "shap_value": 0.25
                })

        # 4. Unknown / Low-Confidence Merchant
        confidence = float(trx.get("confidence_score", 0.9))
        if confidence < 0.65:
            risk_score += 15.0
            reasons.append({
                "factor": "Unverified Counterparty Entity",
                "impact": "Low (+15)",
                "detail": "Narration string does not match known merchant registries or standard clearing patterns.",
                "shap_value": 0.15
            })

        # 5. Isolation Forest Score
        anomaly_score = -0.15
        if self.is_fitted:
            feat = np.array([[amount, 1.0 if trx.get("type") == "debit" else 0.0, 1.0 if trx.get("is_merchant") else 0.0, 1.0 if trx.get("is_recurring") else 0.0]])
            pred = self.model.predict(feat)[0]  # -1 for anomaly, 1 for inlier
            score = self.model.score_samples(feat)[0]
            anomaly_score = float(score)
            if pred == -1:
                risk_score += 15.0
                reasons.append({
                    "factor": "Multi-Dimensional Anomaly Cluster",
                    "impact": "Medium (+15)",
                    "detail": f"Isolation Forest flagged this transaction in an outlier feature region (Score: {score:.3f}).",
                    "shap_value": 0.18
                })

        # Normalize score
        risk_score = min(max(risk_score, 5.0), 98.0)

        # Classification (LOW, MEDIUM, HIGH)
        if risk_score >= 70.0:
            level = "HIGH"
        elif risk_score >= 40.0:
            level = "MEDIUM"
        else:
            level = "LOW"

        if not reasons:
            reasons.append({
                "factor": "Consistent Behavioral Profile",
                "impact": "Baseline",
                "detail": "Transaction matches typical spend amount, recognized counterparty, and normal frequency.",
                "shap_value": -0.10
            })

        return {
            "risk_score": round(risk_score, 1),
            "risk_level": level,
            "anomaly_score": round(anomaly_score, 3),
            "detection_method": "Isolation Forest + Statistical Velocity Engine",
            "reasons": reasons,
            "is_anomaly": risk_score >= 65.0,
            "explanation": "Flagged as an anomaly for verification. An anomaly represents an unusual pattern and is not confirmed fraud."
        }

risk_iq_engine = RiskIQEngine()
