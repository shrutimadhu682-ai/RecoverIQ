import React, { useEffect, useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  HelpCircle,
  Sparkles,
  ArrowRight,
  Loader2,
  Calendar,
  Building2,
  Clock,
  Layers,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis,
  Cell,
} from 'recharts';
import MetricCard from '../components/ui/MetricCard';
import StatusBadge from '../components/ui/StatusBadge';
import RiskIndicator from '../components/ui/RiskIndicator';
import { api } from '../services/api';

export default function RiskIQ() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedAlert, setSelectedAlert] = useState(null);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const data = await api.getRiskAlerts();
      setAlerts(data || []);
      if (data && data.length > 0 && !selectedAlert) {
        setSelectedAlert(data[0]);
      }
    } catch (err) {
      console.error('Failed to load risk alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleUpdateStatus = async (alertId, newStatus) => {
    try {
      setUpdatingId(alertId);
      await api.updateAlertStatus(alertId, newStatus);
      await fetchAlerts();
      if (selectedAlert && selectedAlert.id === alertId) {
        setSelectedAlert((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.error('Failed to update alert status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const highAlerts = alerts.filter((a) => a.risk_level === 'HIGH');
  const mediumAlerts = alerts.filter((a) => a.risk_level === 'MEDIUM');
  const resolvedCount = alerts.filter((a) => a.status === 'RESOLVED' || a.status === 'FALSE_POSITIVE').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
            RiskIQ™ Fraud & Anomaly Telemetry
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 font-mono">
              Isolation Forest Active
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Unsupervised outlier detection, velocity spike monitoring, and SHAP-explainable attribution.
          </p>
        </div>
      </div>

      {/* Critical Disclaimer Banner: Anomaly != Fraud */}
      <div className="glass-panel rounded-2xl p-4 border-l-4 border-l-amber-500 bg-amber-500/[0.04] flex items-start gap-3.5">
        <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 leading-relaxed">
          <span className="font-bold text-white block mb-0.5">
            Principle of Anomaly vs. Confirmed Fraud Distinction:
          </span>
          RiskIQ detects mathematical anomalies (outliers in volume, frequency, or counterparty) using an Isolation Forest. An anomaly is a signal for review, never automatic condemnation. Confirming fraud requires human compliance authorization.
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Risk Alerts"
          value={alerts.length}
          trend={`${highAlerts.length} High Risk`}
          trendPositive={highAlerts.length === 0}
          icon={ShieldAlert}
          accentColor="#F43F5E"
          subValue="Flagged by Isolation Forest"
        />
        <MetricCard
          title="High-Risk Anomalies"
          value={highAlerts.length}
          trend="Score ≥ 70"
          trendPositive={false}
          icon={AlertTriangle}
          accentColor="#F59E0B"
          subValue="Prioritized for triage"
        />
        <MetricCard
          title="Confirmed Fraud Cases"
          value="0"
          trend="0.0% fraud rate"
          trendPositive={true}
          icon={XCircle}
          accentColor="#A855F7"
          subValue="Zero confirmed breaches"
        />
        <MetricCard
          title="Cleared / False Positives"
          value={resolvedCount}
          trend="Reconciled"
          trendPositive={true}
          icon={ShieldCheck}
          accentColor="#10B981"
          subValue="Reviewed by compliance"
        />
      </div>

      {/* Main Grid: Alerts List & Explainable AI Detail Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alerts List Feed */}
        <div className="lg:col-span-1 glass-panel rounded-2xl p-5 space-y-3 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white mb-1">Anomaly Queue</h3>
            <p className="text-xs text-slate-400 mb-4">Click to inspect SHAP feature factors</p>

            {loading ? (
              <div className="py-12 text-center text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-cyan-400 mb-2" />
                Scanning anomaly clusters...
              </div>
            ) : alerts.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No active risk alerts recorded.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                {alerts.map((alert) => {
                  const isSelected = selectedAlert?.id === alert.id;
                  return (
                    <div
                      key={alert.id}
                      onClick={() => setSelectedAlert(alert)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-slate-800/90 border-cyan-400/40 shadow-glow-primary'
                          : 'bg-slate-900/50 border-white/5 hover:border-white/10 hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-white font-mono">
                          Alert #{alert.id} · Txn #{alert.transaction_id}
                        </span>
                        <StatusBadge status={alert.risk_level} />
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>Score: {alert.risk_score}/100</span>
                        <span className="font-mono text-[10px] text-slate-500">
                          {alert.detection_method.split('+')[0]}
                        </span>
                      </div>

                      <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400">Status</span>
                        <span className="text-[11px] font-semibold text-white">
                          {alert.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Selected Alert: Explainable AI & Action Panel */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 flex flex-col justify-between">
          {selectedAlert ? (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
                <div>
                  <div className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider font-mono">
                    Explainable AI (XAI) Insight
                  </div>
                  <h3 className="text-xl font-bold text-white mt-0.5">
                    Anomaly Evaluation for Transaction #{selectedAlert.transaction_id}
                  </h3>
                </div>
                <div className="flex items-center gap-3">
                  <RiskIndicator score={selectedAlert.risk_score} level={selectedAlert.risk_level} />
                </div>
              </div>

              {/* Isolation Forest Metrics Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-900/60 rounded-xl p-3 border border-white/5">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Risk Score</div>
                  <div className="text-lg font-bold text-rose-400 font-mono mt-0.5">
                    {selectedAlert.risk_score}/100
                  </div>
                </div>
                <div className="bg-slate-900/60 rounded-xl p-3 border border-white/5">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Anomaly Index</div>
                  <div className="text-lg font-bold text-amber-400 font-mono mt-0.5">
                    {selectedAlert.anomaly_score}
                  </div>
                </div>
                <div className="bg-slate-900/60 rounded-xl p-3 border border-white/5">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Model Architecture</div>
                  <div className="text-xs font-bold text-white mt-1">
                    Isolation Forest
                  </div>
                </div>
                <div className="bg-slate-900/60 rounded-xl p-3 border border-white/5">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Triage Status</div>
                  <div className="text-xs font-bold text-cyan-400 mt-1">
                    {selectedAlert.status}
                  </div>
                </div>
              </div>

              {/* SHAP Feature Contribution Attributions */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  Contributing Risk Factors (SHAP Feature Weighting)
                </h4>

                <div className="space-y-2.5">
                  {selectedAlert.reasons && selectedAlert.reasons.length > 0 ? (
                    selectedAlert.reasons.map((r, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-slate-900/50 border border-white/5 flex items-start justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{r.factor}</span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                              {r.impact}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed">{r.detail}</p>
                        </div>
                        {r.shap_value && (
                          <span className="text-xs font-mono font-bold text-cyan-400 shrink-0">
                            SHAP: +{r.shap_value}
                          </span>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-slate-400 py-3">No anomalous factors registered.</div>
                  )}
                </div>
              </div>

              {/* Compliance Actions Footer */}
              <div className="pt-4 border-t border-white/5 flex flex-wrap items-center justify-between gap-3">
                <span className="text-[11px] text-slate-500">
                  Compliance Officer Authorization Required
                </span>

                <div className="flex items-center gap-2">
                  <button
                    disabled={updatingId === selectedAlert.id}
                    onClick={() => handleUpdateStatus(selectedAlert.id, 'FALSE_POSITIVE')}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors"
                  >
                    Mark as False Positive
                  </button>
                  <button
                    disabled={updatingId === selectedAlert.id}
                    onClick={() => handleUpdateStatus(selectedAlert.id, 'RESOLVED')}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 transition-colors"
                  >
                    Resolve Anomaly
                  </button>
                  <button
                    disabled={updatingId === selectedAlert.id}
                    onClick={() => handleUpdateStatus(selectedAlert.id, 'CONFIRMED_FRAUD')}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition-all shadow-glow-danger"
                  >
                    Confirm as Fraud
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-24 text-center text-slate-400 text-xs">
              Select an alert from the queue to view explainable AI insights.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
