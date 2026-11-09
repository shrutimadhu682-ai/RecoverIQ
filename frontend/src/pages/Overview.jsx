import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  RotateCcw,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Receipt,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import MetricCard from '../components/ui/MetricCard';
import StatusBadge from '../components/ui/StatusBadge';
import RiskIndicator from '../components/ui/RiskIndicator';
import TransactionDrawer from '../components/ui/TransactionDrawer';
import { api } from '../services/api';

const DONUT_COLORS = ['#38BDF8', '#818CF8', '#2DD4BF', '#F59E0B', '#EC4899', '#A855F7', '#64748B'];

export default function Overview() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [recoveryEvents, setRecoveryEvents] = useState([]);
  const [riskAlerts, setRiskAlerts] = useState([]);
  const [selectedTx, setSelectedTx] = useState(null);
  const [retryingEventId, setRetryingEventId] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ovData, txData, recData, riskData] = await Promise.all([
        api.getOverview(),
        api.getTransactions({ limit: 6 }),
        api.getRecoveryEvents({ limit: 4 }),
        api.getRiskAlerts({ limit: 4 }),
      ]);
      setOverview(ovData);
      setRecentTransactions(txData || []);
      setRecoveryEvents(recData || []);
      setRiskAlerts(riskData || []);
    } catch (err) {
      console.error('Error loading overview data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSimulateRetry = async (eventId) => {
    try {
      setRetryingEventId(eventId);
      await api.simulateRetry(eventId);
      await fetchData(); // refresh stats
    } catch (err) {
      console.error('Error simulating retry:', err);
    } finally {
      setRetryingEventId(null);
    }
  };

  if (loading && !overview) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
        <span className="text-xs font-mono text-slate-400 tracking-wider">
          CALIBRATING RECOVERIQ INTELLIGENCE...
        </span>
      </div>
    );
  }

  const monthlyTrends = overview?.monthly_trends || [];
  const categoryDist = overview?.category_distribution || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-white/5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
            Financial Intelligence & Recovery
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              Live Feed
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time transaction parsing, Isolation Forest anomaly telemetry, and automated contextual payment recovery.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/assistant')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 transition-all shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Ask AI Assistant</span>
          </button>
        </div>
      </div>

      {/* 6 Financial Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <MetricCard
          title="Total Transactions"
          value={overview?.total_transactions || 24}
          trend="+12%"
          trendPositive={true}
          icon={Receipt}
          accentColor="#38BDF8"
          subValue="Parsed from bank statement"
        />
        <MetricCard
          title="Total Inflow"
          value={`₹${(overview?.total_income || 255000).toLocaleString('en-IN')}`}
          trend="+14.2%"
          trendPositive={true}
          icon={ArrowDownRight}
          accentColor="#10B981"
          subValue="Consulting & payouts"
        />
        <MetricCard
          title="Total Expenditure"
          value={`₹${(overview?.total_expenses || 166457).toLocaleString('en-IN')}`}
          trend="-3.8%"
          trendPositive={true}
          icon={ArrowUpRight}
          accentColor="#F59E0B"
          subValue="Operating & SaaS spend"
        />
        <MetricCard
          title="Failed Payments"
          value={overview?.failed_payments_count || 4}
          trend="₹78.4k risk"
          trendPositive={false}
          trendLabel="pipeline"
          icon={AlertTriangle}
          accentColor="#F43F5E"
          subValue="Requires smart recovery"
        />
        <MetricCard
          title="Recovered Revenue"
          value={`₹${(overview?.recovered_revenue || 60500).toLocaleString('en-IN')}`}
          trend={`${overview?.recovery_rate || 72.4}%`}
          trendPositive={true}
          trendLabel="success rate"
          icon={RotateCcw}
          accentColor="#2DD4BF"
          subValue="Via Contextual Bandit"
        />
        <MetricCard
          title="High-Risk Anomalies"
          value={overview?.high_risk_alerts_count || 1}
          trend="Isolation Forest"
          trendPositive={true}
          trendLabel="detection"
          icon={ShieldAlert}
          accentColor="#A855F7"
          subValue="0 confirmed fraud"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Area Chart: Income vs Expenses */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Cash Flow Velocity & Recovery Trends
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Monthly comparison of cash inflows, operating expenditures, and recovered revenue
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" /> Inflow
              </span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" /> Outflow
              </span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Recovered
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#38BDF8" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818CF8" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#818CF8" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="recoveryGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2DD4BF" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2DD4BF" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="month" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#64748B"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `₹${val / 1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                  formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, '']}
                />
                <Area
                  type="monotone"
                  dataKey="income"
                  stroke="#38BDF8"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#incomeGrad)"
                  name="Inflow"
                />
                <Area
                  type="monotone"
                  dataKey="expenses"
                  stroke="#818CF8"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#expenseGrad)"
                  name="Outflow"
                />
                <Area
                  type="monotone"
                  dataKey="recovery"
                  stroke="#2DD4BF"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#recoveryGrad)"
                  name="Recovered"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart: Category Spending */}
        <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-white">Expenditure Breakdown</h3>
              <span className="text-[11px] text-cyan-400 font-semibold cursor-pointer hover:underline" onClick={() => navigate('/finance')}>
                Details →
              </span>
            </div>
            <p className="text-xs text-slate-400">Category distribution across active debits</p>
          </div>

          <div className="h-52 w-full my-auto relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryDist}
                  dataKey="amount"
                  nameKey="category"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                >
                  {categoryDist.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || DONUT_COLORS[index % DONUT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                  formatter={(val, name, props) => [
                    `₹${Number(val).toLocaleString('en-IN')} (${props.payload.percentage}%)`,
                    name,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Debits</span>
              <span className="text-base font-bold text-white font-mono">
                ₹{((overview?.total_expenses || 166457) / 1000).toFixed(1)}k
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-white/5">
            {categoryDist.slice(0, 4).map((cat, idx) => (
              <div key={idx} className="flex items-center gap-1.5 truncate">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                <span className="text-slate-300 truncate">{cat.category}</span>
                <span className="text-slate-500 text-[10px] ml-auto font-mono">{cat.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lower Section: Recent Transactions & Live Recovery Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions List */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white">Recent Normalized Transactions</h3>
              <p className="text-xs text-slate-400">Processed by FinParse with confidence scores</p>
            </div>
            <button
              onClick={() => navigate('/transactions')}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
            >
              View All ({overview?.total_transactions || 24}) <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-white/5">
            {recentTransactions.map((tx) => (
              <div
                key={tx.id}
                onClick={() => setSelectedTx(tx)}
                className="py-3 px-2 rounded-xl hover:bg-white/[0.03] transition-colors flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center font-bold text-xs text-cyan-400 group-hover:border-cyan-400/40 transition-colors shrink-0">
                    {(tx.merchant_name || tx.payee_name || 'TX').substring(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-white truncate group-hover:text-cyan-400 transition-colors">
                      {tx.merchant_name || tx.payee_name || 'Unassigned Counterparty'}
                    </div>
                    <div className="text-xs text-slate-400 truncate flex items-center gap-2 mt-0.5">
                      <span>{tx.clean_narration || tx.raw_narration}</span>
                      <span>·</span>
                      <span className="font-mono text-[11px]">{tx.date}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0 text-right ml-4">
                  <div>
                    <div
                      className={`text-sm font-bold font-mono ${
                        tx.type === 'credit' ? 'text-emerald-400' : 'text-slate-100'
                      }`}
                    >
                      {tx.type === 'credit' ? '+' : '-'}₹{tx.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">
                      {tx.payment_method}
                    </div>
                  </div>
                  <StatusBadge status={tx.is_flagged ? 'HIGH' : tx.type} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live RecoverIQ Actions Radar */}
        <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-cyan-400" />
                RecoverIQ Engine
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                Sandbox Mode
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Contextual Bandit recommendations for failed payments
            </p>

            <div className="space-y-3">
              {recoveryEvents.slice(0, 3).map((event) => {
                const isRecovered = event.status === 'RECOVERED';
                const isRetrying = retryingEventId === event.id;

                return (
                  <div
                    key={event.id}
                    className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 hover:border-white/10 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-white truncate max-w-[150px]">
                        {event.customer_name}
                      </span>
                      <span className="text-xs font-mono font-bold text-white">
                        ₹{event.amount?.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
                      <span className="flex items-center gap-1 text-rose-400">
                        {event.failure_code}
                      </span>
                      <span className="font-semibold text-emerald-400">
                        {(event.recovery_probability * 100).toFixed(0)}% recovery prob
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                      <span className="text-[10px] text-slate-400 truncate max-w-[130px]">
                        {event.bandit_strategy}
                      </span>
                      {isRecovered ? (
                        <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Settled
                        </span>
                      ) : (
                        <button
                          disabled={isRetrying}
                          onClick={() => handleSimulateRetry(event.id)}
                          className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center gap-1 transition-all disabled:opacity-50"
                        >
                          {isRetrying && <Loader2 className="w-3 h-3 animate-spin" />}
                          Simulate Retry
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-white/5 mt-4">
            <button
              onClick={() => navigate('/recovery')}
              className="w-full py-2.5 rounded-xl text-xs font-bold text-center bg-white/5 hover:bg-white/10 text-cyan-400 transition-colors flex items-center justify-center gap-1.5"
            >
              Open Payment Operations Hub <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Transaction Slide-over Drawer */}
      <TransactionDrawer
        transaction={selectedTx}
        isOpen={!!selectedTx}
        onClose={() => setSelectedTx(null)}
        onUpdated={fetchData}
      />
    </div>
  );
}
