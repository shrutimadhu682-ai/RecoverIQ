import re
import os
import json
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime

logger = logging.getLogger("recoveriq.finparse")

# Standard Merchant Knowledge Base for deterministic, high-confidence matching
KNOWN_MERCHANTS = {
    "swiggy": {"name": "Swiggy", "category": "Food & Dining", "is_merchant": True, "method": "UPI"},
    "zomato": {"name": "Zomato", "category": "Food & Dining", "is_merchant": True, "method": "UPI"},
    "uber": {"name": "Uber", "category": "Travel & Commute", "is_merchant": True, "method": "Card"},
    "ola": {"name": "Ola Cabs", "category": "Travel & Commute", "is_merchant": True, "method": "UPI"},
    "netflix": {"name": "Netflix", "category": "Entertainment", "is_merchant": True, "method": "Card", "recurring": True},
    "spotify": {"name": "Spotify", "category": "Entertainment", "is_merchant": True, "method": "Card", "recurring": True},
    "amazon": {"name": "Amazon", "category": "Shopping", "is_merchant": True, "method": "Card"},
    "flipkart": {"name": "Flipkart", "category": "Shopping", "is_merchant": True, "method": "UPI"},
    "aws": {"name": "Amazon Web Services (AWS)", "category": "SaaS & Cloud", "is_merchant": True, "method": "Card", "recurring": True},
    "google": {"name": "Google Cloud / Workspace", "category": "SaaS & Cloud", "is_merchant": True, "method": "Card", "recurring": True},
    "github": {"name": "GitHub Inc", "category": "SaaS & Cloud", "is_merchant": True, "method": "Card", "recurring": True},
    "microsoft": {"name": "Microsoft Azure", "category": "SaaS & Cloud", "is_merchant": True, "method": "Card", "recurring": True},
    "openai": {"name": "OpenAI API", "category": "SaaS & Cloud", "is_merchant": True, "method": "Card", "recurring": True},
    "slack": {"name": "Slack Technologies", "category": "SaaS & Cloud", "is_merchant": True, "method": "Card", "recurring": True},
    "airtel": {"name": "Airtel Telecommunications", "category": "Utilities", "is_merchant": True, "method": "UPI", "recurring": True},
    "jio": {"name": "Reliance Jio", "category": "Utilities", "is_merchant": True, "method": "UPI", "recurring": True},
    "bescom": {"name": "BESCOM Electricity", "category": "Utilities", "is_merchant": True, "method": "NetBanking", "recurring": True},
    "apollo": {"name": "Apollo Pharmacy & Hospitals", "category": "Healthcare", "is_merchant": True, "method": "Card"},
    "practo": {"name": "Practo Healthcare", "category": "Healthcare", "is_merchant": True, "method": "UPI"},
    "starbucks": {"name": "Starbucks Coffee", "category": "Food & Dining", "is_merchant": True, "method": "Card"},
    "makemytrip": {"name": "MakeMyTrip", "category": "Travel & Commute", "is_merchant": True, "method": "Card"},
    "indigo": {"name": "IndiGo Airlines", "category": "Travel & Commute", "is_merchant": True, "method": "NetBanking"},
    "stripe": {"name": "Stripe Payments", "category": "Financial Services", "is_merchant": True, "method": "Transfer"},
    "razorpay": {"name": "Razorpay Gateway", "category": "Financial Services", "is_merchant": True, "method": "UPI"},
}

CATEGORIES = [
    "Food & Dining", "SaaS & Cloud", "Travel & Commute", "Shopping", 
    "Utilities", "Healthcare", "Entertainment", "Financial Services", "General"
]

def clean_narration(raw: str) -> str:
    """Removes noise, special characters, and repeated slashes."""
    if not raw:
        return ""
    cleaned = re.sub(r'[\r\n\t]+', ' ', raw)
    cleaned = re.sub(r'\s+', ' ', cleaned).strip()
    return cleaned

def parse_transaction_narration(raw_narration: str, amount: Optional[float] = None) -> Dict[str, Any]:
    """
    Intelligent extraction engine for financial narrations.
    Input example: UPI/839201/SWIGGY/OKAXIS/450
    """
    raw = clean_narration(raw_narration)
    lower = raw.lower()

    # Default extraction state
    result = {
        "raw_narration": raw,
        "clean_narration": raw,
        "merchant_name": None,
        "payee_name": None,
        "is_merchant": False,
        "category": "General",
        "payment_method": "Transfer",
        "reference_number": None,
        "confidence_score": 0.85,
        "is_recurring": False,
        "extracted_amount": amount
    }

    # 1. Detect Payment Method
    if "upi" in lower or "okaxis" in lower or "okhdfc" in lower or "okicici" in lower or "@" in lower:
        result["payment_method"] = "UPI"
    elif "pos" in lower or "card" in lower or "visa" in lower or "mastercard" in lower:
        result["payment_method"] = "Card"
    elif "neft" in lower:
        result["payment_method"] = "NEFT"
    elif "rtgs" in lower:
        result["payment_method"] = "RTGS"
    elif "imps" in lower:
        result["payment_method"] = "IMPS"
    elif "nach" in lower or "ach" in lower or "autopay" in lower:
        result["payment_method"] = "NACH AutoDebit"
        result["is_recurring"] = True
    elif "netbanking" in lower or "inb" in lower:
        result["payment_method"] = "NetBanking"

    # 2. Extract Reference Numbers
    ref_match = re.search(r'\b(?:ref|rrn|txn|id|utr)?[:\s/]*([0-9A-Z]{9,16})\b', raw, re.IGNORECASE)
    if ref_match:
        result["reference_number"] = ref_match.group(1)

    # 3. Known Merchant matching
    for key, info in KNOWN_MERCHANTS.items():
        pattern = r'(?:\b|_|/)' + re.escape(key) + r'(?:\b|_|/)'
        if re.search(pattern, lower) or key in lower:
            result["merchant_name"] = info["name"]
            result["payee_name"] = info["name"]
            result["is_merchant"] = info["is_merchant"]
            result["category"] = info["category"]
            if info.get("recurring"):
                result["is_recurring"] = True
            result["confidence_score"] = 0.98
            result["clean_narration"] = f"Payment to {info['name']} via {result['payment_method']}"
            return result

    # 4. Pattern matching for generic UPI string format (e.g., UPI/12345/MERCHANT_OR_PERSON/BANK/AMOUNT)
    upi_parts = raw.split('/')
    if len(upi_parts) >= 3 and result["payment_method"] == "UPI":
        candidate = upi_parts[2].strip()
        # Clean candidate
        candidate_clean = re.sub(r'[^a-zA-Z0-9\s]', '', candidate)
        if len(candidate_clean) > 2 and not candidate_clean.isnumeric():
            result["payee_name"] = candidate_clean.title()
            # Determine if merchant
            merchant_indicators = ["store", "pvt", "ltd", "mart", "shop", "tech", "foods", "services", "enterprises", "cafe"]
            if any(ind in candidate_clean.lower() for ind in merchant_indicators):
                result["merchant_name"] = candidate_clean.title()
                result["is_merchant"] = True
                result["confidence_score"] = 0.92
            else:
                result["is_merchant"] = False
                result["confidence_score"] = 0.88
            
            result["clean_narration"] = f"UPI transfer to {result['payee_name']}"
            return result

    # 5. Fallback heuristics for POS or Card transactions
    if "pos" in lower or "card" in lower:
        tokens = [t for t in re.split(r'[\s/,-]+', raw) if len(t) > 2 and not t.isnumeric() and t.lower() not in ["pos", "card", "txn", "dr", "cr"]]
        if tokens:
            merchant_candidate = " ".join(tokens[:2]).title()
            result["merchant_name"] = merchant_candidate
            result["payee_name"] = merchant_candidate
            result["is_merchant"] = True
            result["confidence_score"] = 0.82
            result["clean_narration"] = f"Card payment at {merchant_candidate}"
            return result

    # Generic Payee Fallback
    words = [w for w in re.split(r'[^a-zA-Z]', raw) if len(w) > 3 and w.lower() not in ["transfer", "payment", "bank", "credit", "debit"]]
    if words:
        result["payee_name"] = " ".join(words[:2]).title()
        result["confidence_score"] = 0.75
    else:
        result["payee_name"] = "Counterparty"
        result["confidence_score"] = 0.60

    result["clean_narration"] = f"Transaction with {result['payee_name']}"
    return result

def detect_duplicates(transactions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Flag duplicate transactions having identical date, amount, and reference/narration."""
    seen = {}
    for trx in transactions:
        key = (trx.get("date"), trx.get("amount"), trx.get("reference_number") or trx.get("raw_narration"))
        if key in seen:
            trx["is_duplicate"] = True
        else:
            seen[key] = True
            trx["is_duplicate"] = False
    return transactions
