import React, { useEffect, useState } from 'react';
import {
  RotateCcw,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Play,
  Clock,
  Layers,
  ArrowRight,
  TrendingUp,
  BrainCircuit,
  ShieldCheck,
  RefreshCw,
  Loader2,
  DollarSign,
  Send,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import MetricCard from '../components/ui/MetricCard';
import StatusBadge from '../components/ui/StatusBadge';
import RecoveryTimeline from '../components/ui/RecoveryTimeline';
import { api } from '../services/api';

const PIE_COLORS = ['#38BDF8', '#818CF8', '#F59E0B', '#F43F5E', '#10B981', '#A855F7'];

export default function PaymentRecovery() {
  const [events, setEvents] = useState([]);
  const [history, setHistory] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [simulatingId, setSimulatingId] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [evData, histData, anData] = await Promise.all([
        api.getRecoveryEvents(),
        api.getRecoveryHistory(),
        api.getRecoveryAnalytics(),
      ]);
      setEvents(evData || []);
      setHistory(histData || []);
      setAnalytics(anData || {});
      if (evData && evData.length > 0 && !selectedEvent) {
        setSelectedEvent(evData[0]);
      }
    } catch (err) {
      console.error('Failed to load payment recovery data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSimulateRetry = async (eventId, overrideAction = null) => {
    try {
      setSimulatingId(eventId);
      setFeedbackMessage(null);
      const res = await api.simulateRetry(eventId, overrideAction);
      setFeedbackMessage(res.message);
      await fetchData();
      if (selectedEvent && selectedEvent.id === eventId) {
        setSelectedEvent((prev) => ({ ...prev, status: res.status }));
      }
    } catch (err) {
      console.error('Error executing simulated retry:', err);
      setFeedbackMessage('Simulation failed. Please verify sandbox connectivity.');
    } finally {
      setSimulatingId(null);
    }
  };

  if (loading && events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
        <span className="text-xs font-mono text-slate-400 tracking-wider">
          ACTIVATING RECOVERIQ CONTEXTUAL BANDIT PIPELINE...
        </span>
      </div>
    );
  }

  const failedEvents = events.filter((e) => e.status === 'FAILED');
  const recoveredEvents = events.filter((e) => e.status === 'RECOVERED');
  const reasonsDist = analytics?.reasons_distribution || [];
  const banditArms = analytics?.bandit_arms || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
            RecoverIQ™ Payment Recovery Operations
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">
              XGBoost + Bandit
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Automated decline triage, optimal retry scheduling, and multi-armed bandit recovery execution.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl text-xs font-medium bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            Sandbox Gateway Simulation
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Recovered Revenue"
          value={`₹${(analytics?.recovered_revenue || 60500).toLocaleString('en-IN')}`}
          trend={`${analytics?.recovery_success_rate || 72.4}%`}
          trendPositive={true}
          trendLabel="success rate"
          icon={CheckCircle2}
          accentColor="#2DD4BF"
          subValue={`${recoveredEvents.length} transactions settled`}
        />
        <MetricCard
          title="Pending Failed Pipeline"
          value={`₹${(analytics?.pending_revenue || 78400).toLocaleString('en-IN')}`}
          trend={`${failedEvents.length} cases`}
          trendPositive={false}
          trendLabel="awaiting retry"
          icon={AlertTriangle}
          accentColor="#F43F5E"
          subValue="Temporary decline window"
        />
        <MetricCard
          title="Contextual Bandit Active Arms"
          value="4 Strategies"
          trend="Thompson Sampling"
          trendPositive={true}
          icon={BrainCircuit}
          accentColor="#818CF8"
          subValue="Dynamic rail routing"
        />
        <MetricCard
          title="Average Retry Cost"
          value="₹4.80"
          trend="96.2% ROI"
          trendPositive={true}
          trendLabel="value yield"
          icon={TrendingUp}
          accentColor="#38BDF8"
          subValue="Expected value > cost"
        />
      </div>

      {/* Feedback banner if an action was just simulated */}
      {feedbackMessage && (
        <div className="glass-panel rounded-2xl p-4 border border-cyan-500/30 bg-cyan-500/10 flex items-center justify-between text-xs text-white animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            <span>{feedbackMessage}</span>
          </div>
          <button
            onClick={() => setFeedbackMessage(null)}
            className="text-slate-400 hover:text-white text-xs font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Split: Cases Table & Selected Case Visual Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cases Table */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white">Payment Decline Queue</h3>
                <p className="text-xs text-slate-400">Classified temporary vs permanent failures</p>
              </div>
              <span className="text-xs font-mono text-slate-400">
                {events.length} Total Events
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/80 border-b border-white/5 text-slate-400 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-3">Customer / Ref</th>
                    <th className="py-3 px-3 text-right">Amount</th>
                    <th className="py-3 px-3">Failure Reason</th>
                    <th className="py-3 px-3 text-center">Recovery Prob</th>
                    <th className="py-3 px-3">Recommended Strategy</th>
                    <th className="py-3 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {events.map((event) => {
                    const isSelected = selectedEvent?.id === event.id;
                    const isRecovered = event.status === 'RECOVERED';
                    const isSimulating = simulatingId === event.id;

                    return (
                      <tr
                        key={event.id}
                        onClick={() => setSelectedEvent(event)}
                        className={`hover:bg-white/[0.03] transition-colors cursor-pointer group ${
                          isSelected ? 'bg-cyan-500/[0.06]' : ''
                        }`}
                      >
                        {/* Customer */}
                        <td className="py-3 px-3">
                          <div className="font-semibold text-white group-hover:text-cyan-400 transition-colors">
                            {event.customer_name}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            {event.transaction_ref} · {event.payment_method}
                          </div>
                        </td>

                        {/* Amount */}
                        <td className="py-3 px-3 text-right font-mono font-bold text-white">
                          ₹{event.amount?.toLocaleString('en-IN')}
                        </td>

                        {/* Failure Reason */}
                        <td className="py-3 px-3">
                          <div className="font-semibold text-rose-400 text-[11px]">
                            {event.failure_code}
                          </div>
                          <span
                            className={`inline-block text-[10px] px-1.5 py-0.2 rounded font-medium ${
                              event.failure_type === 'TEMPORARY'
                                ? 'bg-amber-500/10 text-amber-300'
                                : 'bg-rose-500/10 text-rose-300'
                            }`}
                          >
                            {event.failure_type}
                          </span>
                        </td>

                        {/* Probability */}
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`font-mono font-bold text-xs ${
                              event.recovery_probability >= 0.75
                                ? 'text-emerald-400'
                                : event.recovery_probability >= 0.4
                                ? 'text-amber-400'
                                : 'text-rose-400'
                            }`}
                          >
                            {(event.recovery_probability * 100).toFixed(0)}%
                          </span>
                        </td>

                        {/* Strategy */}
                        <td className="py-3 px-3 max-w-[140px] truncate text-slate-300 text-[11px]">
                          {event.recommended_action}
                        </td>

                        {/* Action CTA */}
                        <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                          {isRecovered ? (
                            <span className="inline-flex items-center text-[11px] font-semibold text-emerald-400 gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Recovered
                            </span>
                          ) : (
                            <button
                              disabled={isSimulating}
                              onClick={() => handleSimulateRetry(event.id)}
                              className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center gap-1 transition-all mx-auto disabled:opacity-50 shadow-glow-primary"
                            >
                              {isSimulating ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Play className="w-3 h-3 fill-current" />
                              )}
                              Smart Retry
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Selected Case Deep Dive & Timeline */}
        <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between">
          {selectedEvent ? (
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">
                    Recovery Case Deep Dive
                  </span>
                  <StatusBadge status={selectedEvent.status} />
                </div>
                <h3 className="text-lg font-bold text-white font-mono">
                  {selectedEvent.transaction_ref}
                </h3>
                <div className="text-xs text-slate-400 mt-0.5">
                  {selectedEvent.customer_name} ({selectedEvent.customer_email})
                </div>
              </div>

              {/* Economic Recovery Value vs Cost Card */}
              <div className="bg-slate-900/60 rounded-xl p-4 border border-white/5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Order Amount</span>
                  <span className="text-white font-mono font-bold">
                    ₹{selectedEvent.amount?.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Recovery Probability</span>
                  <span className="text-emerald-400 font-mono font-bold">
                    {(selectedEvent.recovery_probability * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Estimated Retry Cost</span>
                  <span className="text-slate-300 font-mono">₹{selectedEvent.retry_cost}</span>
                </div>
                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                  <span className="font-semibold text-cyan-400">Net Expected Value (EV)</span>
                  <span className="text-emerald-400 font-mono font-extrabold text-sm">
                    ₹{selectedEvent.expected_recovery_value?.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Visual Execution Timeline */}
              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4">
                  Lifecycle Telemetry Timeline
                </h4>
                <RecoveryTimeline event={selectedEvent} />
              </div>

              {/* Action Button */}
              {selectedEvent.status !== 'RECOVERED' && (
                <div className="pt-2 border-t border-white/5">
                  <button
                    disabled={simulatingId === selectedEvent.id}
                    onClick={() => handleSimulateRetry(selectedEvent.id)}
                    className="w-full py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 flex items-center justify-center gap-2 transition-all shadow-glow-primary"
                  >
                    {simulatingId === selectedEvent.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Zap className="w-4 h-4 fill-current" />
                    )}
                    Execute {selectedEvent.recommended_action}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="py-24 text-center text-slate-400 text-xs">
              Select a payment event to inspect telemetry and execution controls.
            </div>
          )}
        </div>
      </div>

      {/* Recovery History Log Table */}
      <div className="glass-panel rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              Automated Recovery Execution History
            </h3>
            <p className="text-xs text-slate-400">Real-time log of automated bandit retry attempts and responses</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 border-b border-white/5 text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-3">Attempt ID</th>
                <th className="py-3 px-3">Transaction Ref</th>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3">Strategy Executed</th>
                <th className="py-3 px-3">Response Code</th>
                <th className="py-3 px-3 text-right">Amount</th>
                <th className="py-3 px-3 text-center">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {history.map((att) => (
                <tr key={att.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-3 font-mono text-slate-400">#{att.id}</td>
                  <td className="py-3 px-3 font-mono text-white font-semibold">
                    {att.transaction_ref}
                  </td>
                  <td className="py-3 px-3 text-slate-300">{att.customer_name}</td>
                  <td className="py-3 px-3 text-slate-300">{att.action_taken}</td>
                  <td className="py-3 px-3 font-mono text-cyan-400 text-[11px]">
                    {att.response_code}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-white">
                    ₹{att.amount?.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <StatusBadge status={att.result_status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
