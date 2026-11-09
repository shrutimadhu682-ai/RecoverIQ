import React, { useEffect, useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Calendar,
  CheckCircle2,
  FileText,
  Clock,
  ShieldCheck,
  Layers,
  Loader2,
} from 'lucide-react';
import { api } from '../services/api';

export default function Reports() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await api.getReportsSummary();
        setSummary(data);
      } catch (err) {
        console.error('Failed to load reports summary:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleDownloadCSV = (type) => {
    const url = api.getExportUrl(type);
    window.open(url, '_blank');
  };

  if (loading && !summary) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
        <span className="text-xs font-mono text-slate-400 tracking-wider">
          COMPILING RECOVERIQ AUDIT LEDGER & REPORTS...
        </span>
      </div>
    );
  }

  const m = summary?.metrics || {};

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
            Executive Financial & Recovery Reports
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Reconciliation statements, audit ledgers, and raw transaction data exports.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-900 border border-white/10 text-slate-400 font-mono">
            Report ID: {summary?.report_id || 'REP-2026-Q2-FIN'}
          </span>
        </div>
      </div>

      {/* Export Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center mb-4">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Transactions Reconciliation Report</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Complete tabular export of all bank transactions, extracted counterparties, FinParse confidence scores, and Isolation Forest anomaly tags.
            </p>
          </div>

          <div className="pt-6 mt-6 border-t border-white/5 flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">CSV Format · UTF-8</span>
            <button
              onClick={() => handleDownloadCSV('transactions')}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center gap-2 transition-all shadow-glow-primary"
            >
              <Download className="w-3.5 h-3.5" />
              Download CSV
            </button>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center mb-4">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Payment Recovery Performance Ledger</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Full breakdown of failed payment events, decline codes, XGBoost predicted recovery rates, and executed contextual bandit retry history.
            </p>
          </div>

          <div className="pt-6 mt-6 border-t border-white/5 flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">CSV Format · UTF-8</span>
            <button
              onClick={() => handleDownloadCSV('recovery')}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white flex items-center gap-2 transition-all shadow-glow-primary"
            >
              <Download className="w-3.5 h-3.5" />
              Download CSV
            </button>
          </div>
        </div>
      </div>

      {/* Financial Health Summary Card */}
      <div className="glass-panel rounded-2xl p-6 space-y-6">
        <div>
          <h3 className="text-base font-bold text-white">Quarterly Health Summary Ledger</h3>
          <p className="text-xs text-slate-400 mt-0.5">Automated cross-reconciliation across modules</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Processed Volume</div>
            <div className="text-xl font-bold font-mono text-white mt-1">
              ₹{(m.total_income || 255000).toLocaleString('en-IN')}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Operating Outflow</div>
            <div className="text-xl font-bold font-mono text-slate-200 mt-1">
              ₹{(m.total_expenses || 166457).toLocaleString('en-IN')}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Recovered Capital</div>
            <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
              ₹{(m.recovered_revenue || 60500).toLocaleString('en-IN')}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Risk Alerts Logged</div>
            <div className="text-xl font-bold font-mono text-rose-400 mt-1">
              {m.risk_alerts_logged || 1}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
