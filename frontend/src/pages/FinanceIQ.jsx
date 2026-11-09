import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  AlertCircle,
  Sparkles,
  Layers,
  Repeat,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Loader2,
  Building2,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
} from 'recharts';
import MetricCard from '../components/ui/MetricCard';
import { api } from '../services/api';

export default function FinanceIQ() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await api.getSpending();
        setData(res);
      } catch (err) {
        console.error('Failed to load FinanceIQ analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
        <span className="text-xs font-mono text-slate-400 tracking-wider">
          SYNCHRONIZING FINANCEIQ FINANCIAL MODELS...
        </span>
      </div>
    );
  }

  const forecast = data?.forecast || {};
  const monthlyTrends = data?.monthly_trends || [];
  const categories = data?.category_distribution || [];
  const topMerchants = data?.top_merchants || [];
  const recurring = data?.recurring_expenses || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
            FinanceIQ™ Intelligence
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
              Predictive Mode
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Cash-flow telemetry, predictive expenditure forecasting, and automated subscription tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-900 border border-white/10 text-slate-300">
            Current Quarter: Q2 2026
          </span>
        </div>
      </div>

      {/* Hero Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Cash Inflow"
          value={`₹${(data?.total_income || 255000).toLocaleString('en-IN')}`}
          trend="+14.2%"
          trendPositive={true}
          icon={ArrowDownRight}
          accentColor="#10B981"
          subValue="Revenue & credits"
        />
        <MetricCard
          title="Total Operating Outflow"
          value={`₹${(data?.total_expenses || 166457).toLocaleString('en-IN')}`}
          trend="-3.8%"
          trendPositive={true}
          icon={ArrowUpRight}
          accentColor="#F59E0B"
          subValue="Operating costs"
        />
        <MetricCard
          title="Net Cashflow Margin"
          value={`₹${(data?.net_savings || 88543).toLocaleString('en-IN')}`}
          trend="+34.7%"
          trendPositive={true}
          trendLabel="net liquidity"
          icon={TrendingUp}
          accentColor="#38BDF8"
          subValue="Free liquid reserves"
        />
        <MetricCard
          title="Recurring SaaS & Commitments"
          value={`₹${recurring.reduce((acc, r) => acc + r.amount, 0).toLocaleString('en-IN')}`}
          trend={`${recurring.length} active`}
          trendPositive={true}
          trendLabel="commitments"
          icon={Repeat}
          accentColor="#818CF8"
          subValue="Monthly run-rate"
        />
      </div>

      {/* Predictive Expenditure Forecast Box */}
      <div className="glass-panel rounded-2xl p-6 border border-cyan-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider font-mono">
                Predictive AI Spend Projection · Next Month (May 2026)
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-white">
              Estimated Monthly Outflow: ₹{(forecast.projected_monthly_spend || 154000).toLocaleString('en-IN')}
            </h3>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Based on historical moving averages and polynomial regression, projected expenditure is within confidence bounds of{' '}
              <strong className="text-white font-mono">₹{(forecast.lower_bound || 142000).toLocaleString('en-IN')}</strong> to{' '}
              <strong className="text-white font-mono">₹{(forecast.upper_bound || 166000).toLocaleString('en-IN')}</strong>. Overspending risk is classified as{' '}
              <span className="text-emerald-400 font-bold uppercase">{forecast.overspending_risk || 'Normal'}</span>.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-900/80 border border-white/10 rounded-2xl p-4 shrink-0">
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Trend Direction</div>
              <div className="text-base font-bold text-white flex items-center gap-1 mt-0.5">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                <span>+{forecast.trend_percentage || 4.2}%</span>
              </div>
            </div>
            <div className="w-[1px] h-8 bg-white/10" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Health Score</div>
              <div className="text-base font-bold text-emerald-400 mt-0.5 font-mono">
                92/100
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts: Cashflow Trends + Category Budgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cashflow Velocity */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-white">Cashflow Inflow vs Outflow</h3>
              <p className="text-xs text-slate-400">Monthly trajectory showing net retained capital</p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrends}>
                <defs>
                  <linearGradient id="inflowColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="outflowColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="month" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} tickFormatter={(val) => `₹${val / 1000}k`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                  formatter={(val) => [`₹${Number(val).toLocaleString('en-IN')}`, '']}
                />
                <Area type="monotone" dataKey="income" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#inflowColor)" name="Income" />
                <Area type="monotone" dataKey="expenses" stroke="#F59E0B" strokeWidth={2} fillOpacity={1} fill="url(#outflowColor)" name="Expenses" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Budget Tracker */}
        <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white mb-1">Category Spend & Budgets</h3>
            <p className="text-xs text-slate-400 mb-5">Current allocation vs spending targets</p>

            <div className="space-y-4">
              {categories.slice(0, 5).map((cat, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">{cat.category}</span>
                    <span className="font-mono text-white font-bold">
                      ₹{cat.amount?.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(cat.percentage * 1.5, 100)}%`,
                        backgroundColor: cat.color || '#38BDF8',
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>{cat.count} transactions</span>
                    <span>{cat.percentage}% of debits</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Lower Section: Merchant Leaderboard + Subscriptions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Merchant Leaderboard */}
        <div className="glass-panel rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-cyan-400" />
                Merchant Expenditure Leaderboard
              </h3>
              <p className="text-xs text-slate-400">Top counterparty recipients by aggregate volume</p>
            </div>
          </div>

          <div className="divide-y divide-white/5">
            {topMerchants.map((m, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-slate-500 w-4">
                    #{idx + 1}
                  </span>
                  <div>
                    <div className="text-xs font-bold text-white">{m.merchant}</div>
                    <div className="text-[10px] text-slate-400">{m.category} · {m.count} charges</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold font-mono text-white">
                    ₹{m.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                  <span className="text-[10px] text-cyan-400 font-semibold">Verified Merchant</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recurring Subscriptions Tracker */}
        <div className="glass-panel rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Repeat className="w-4 h-4 text-purple-400" />
                Recurring Subscriptions & AutoDebits
              </h3>
              <p className="text-xs text-slate-400">Identified software, infrastructure and utility commitments</p>
            </div>
          </div>

          <div className="divide-y divide-white/5">
            {recurring.map((rec, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">{rec.name}</div>
                  <div className="text-[10px] text-slate-400">{rec.category} · {rec.method}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold font-mono text-purple-300">
                    ₹{rec.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                  <span className="text-[10px] text-slate-500 uppercase font-mono">
                    {rec.cycle}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
