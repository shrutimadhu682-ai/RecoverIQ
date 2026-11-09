# ⚡ RecoverIQ
### AI-Powered Financial Intelligence, Anomaly Risk Detection & Intelligent Revenue Recovery

**RecoverIQ** is an enterprise-grade fintech platform combining intelligent transaction parsing (inspired by FinParse-AI), predictive cash-flow forecasting, multi-dimensional risk monitoring, and automated contextual payment recovery.

---

## 🏛️ System Architecture & Visual Identity

RecoverIQ is engineered with an enterprise design philosophy inspired by Stripe, Ramp, Linear, and Mercury:
- **Midnight Dark Aesthetic**: Deep charcoal (`#070A11`, `#0B0F19`) backgrounds paired with selective glassmorphism (`backdrop-blur-md`).
- **Refined Accents**: Electric Blue (`#38BDF8`), Soft Lavender (`#818CF8`), and Emerald Teal (`#2DD4BF`).
- **High Visual Hierarchy**: Typography in Inter and JetBrains Mono with micro-interactions, responsive sidebars, slide-over drawers, and interactive Recharts data visualizations.

---

## 🧩 Core Modules

### 1. Module A: FinParse – Intelligent Transaction Parsing
- **Format Support**: Ingests bank statements in CSV and PDF formats.
- **Normalization Engine**: Cleans noisy transaction narrations (UPI, POS, IMPS, NEFT, NACH AutoDebit).
- **Merchant Registry Matching**: Automatically resolves merchants (e.g. Swiggy, Netflix, AWS, Uber, Starbucks).
- **Confidence Scoring**: Computes a confidence score for extracted entities and flags uncertain items.
- **Manual Field Correction**: Allows users to edit merchant, category, and counterparty fields via a slide-over drawer, saving updates via `PUT /api/transactions/{id}`.
- **Duplicate Detection**: Identifies exact duplicate timestamp, amount, and reference pairs.

### 2. Module B: FinanceIQ – Predictive Financial Analytics
- **Cash-Flow Telemetry**: Inflow vs outflow velocity tracking.
- **Expenditure Breakdown**: Donut and progress-bar category distribution.
- **Predictive Monthly Spend Forecasting**: Uses polynomial trend regression with upper/lower confidence bounds.
- **Subscription Tracker**: Detects recurring commitments (AWS, GitHub, Google Workspace, Netflix, Airtel).
- **Merchant Leaderboard**: Tracks top counterparty recipients by aggregate volume.

### 3. Module C: RiskIQ – Fraud & Anomaly Telemetry
- **Isolation Forest Model**: Unsupervised outlier clustering on multi-dimensional transaction features.
- **SHAP-Style Explainability**: Itemizes exact contributing reasons (Amount Spikes, Duplicate Detections, Velocity Surges, Unverified Entities).
- **Risk Score Spectrum**: Classifies transactions into LOW (0-39), MEDIUM (40-69), and HIGH (70-100).
- **Anomaly vs Fraud Principle**: Strictly treats statistical outliers as anomalies requiring review, never automatically branding an anomaly as fraud.
- **Triage Workflows**: Action controls to mark items as *False Positive*, *Resolved*, or *Confirmed Fraud*.

### 4. Module D: RecoverIQ – Intelligent Payment Recovery Engine
- **Decline Classification**: Categorizes failures into **TEMPORARY** (`BANK_TIMEOUT`, `NETWORK_ERROR`, `INSUFFICIENT_FUNDS`, `GATEWAY_DOWNTIME`) vs **PERMANENT** (`CARD_EXPIRED`, `INVALID_ACCOUNT`, `ACCOUNT_CLOSED`).
- **XGBoost Recovery Predictor**: Generates probabilistic recovery rates based on method, amount, decline code, and retry count.
- **Contextual Multi-Armed Bandits**:
  1. *Adaptive Exponential Backoff*
  2. *Dynamic Secondary Rail Routing*
  3. *Time-Of-Day Optimal Window*
  4. *Pre-Retry SMS/WhatsApp Nudge*
- **Economic Value Yield**: Calculates Net Expected Value ($EV = P_{recovery} \times \text{Amount} - \text{RetryCost}$).
- **Interactive Sandbox Simulation**: Allows one-click execution of smart retries with real-time UI status updates and audit attempts logging.

### 5. Module E: AI Financial Assistant
- **Real Database Grounding**: Answers queries directly from the SQLAlchemy/MongoDB financial store.
- **Zero Hallucination**: Aggregates actual figures for spending summaries, top merchants, subscriptions, anomaly reasons, and recovery recommendations.
- **Structured Interactive Cards**: Injects metric cards, tables, risk factor boxes, and recovery pills into the conversational thread.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS v4, Recharts, Lucide React, Axios, React Router v7 |
| **Backend** | Python 3.11+, FastAPI, Pydantic v2, SQLAlchemy 2.0, Uvicorn |
| **Machine Learning** | Scikit-learn (Isolation Forest), XGBoost, NumPy, Pandas |
| **Databases** | SQLite (with zero-config local run) / PostgreSQL, PyMongo / MongoDB |
| **DevOps** | Docker, Docker Compose, Nginx |

---

## 🚀 Running the Application Locally

### Prerequisites
- Node.js (v18+) & npm
- Python (v3.10+)

### 1. Start the Backend API Server
```bash
cd backend
# Optional: create or activate virtualenv
pip install -r requirements.txt
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
*Backend runs at: [http://127.0.0.1:8000](http://127.0.0.1:8000)*  
*Swagger Documentation: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)*

### 2. Start the React Frontend
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs at: [http://127.0.0.1:5173](http://127.0.0.1:5173)*

---

## 🐳 Docker Deployment

To launch the full stack (FastAPI Backend, Nginx-served React Frontend, and MongoDB) with a single command:

```bash
docker-compose up --build
```

Access the platform:
- Web Application: [http://localhost:5173](http://localhost:5173)
- REST API Documentation: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 📡 Key API Endpoints

### Analytics & Intelligence
- `GET /api/analytics/overview` – Comprehensive financial overview KPIs and trends.
- `GET /api/analytics/spending` – Category-wise and merchant-wise spend distribution.
- `GET /api/analytics/cashflow` – Cashflow velocity and predictive expenditure forecast.

### Transactions
- `GET /api/transactions` – List transactions with search, category, type, and anomaly filters.
- `GET /api/transactions/{id}` – Get transaction details with confidence & risk metadata.
- `PUT /api/transactions/{id}` – Manually correct extracted fields (merchant, category, notes).
- `POST /api/transactions/upload` – Upload bank statement (CSV or PDF) for parsing.

### Risk Telemetry
- `GET /api/risk/alerts` – Get all active anomaly alerts.
- `POST /api/risk/analyze` – Real-time Isolation Forest evaluation of transaction payload.
- `PUT /api/risk/alerts/{id}/status` – Update alert triage status (`CONFIRMED_FRAUD`, `FALSE_POSITIVE`, `RESOLVED`).

### Payment Recovery Engine
- `GET /api/recovery/events` – Get all failed payment events and recovery recommendations.
- `POST /api/recovery/predict` – Predict recovery probability using XGBoost model.
- `POST /api/recovery/retry` – Simulate smart retry execution via contextual bandit.
- `GET /api/recovery/history` – Complete audit log of retry executions and responses.
- `GET /api/recovery/analytics` – Recovery rates, bandit strategy metrics, and failure distribution.

### AI Financial Assistant & Reports
- `POST /api/assistant/chat` – Conversational financial assistant grounded in real database records.
- `GET /api/reports/summary` – Executive summary report.
- `GET /api/reports/export?report_type={transactions|recovery}` – Download raw CSV exports.

---

## 📄 License
MIT License. Built for enterprise financial intelligence and revenue recovery.
