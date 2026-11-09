import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function MetricCard({
  title,
  value,
  trend,
  trendPositive = true,
  trendLabel = 'vs last month',
  icon: Icon,
  accentColor = '#38BDF8',
  subValue,
}) {
  return (
    <div className="glass-panel glass-panel-hover rounded-2xl p-5 relative overflow-hidden group">
      {/* Subtle top border accent glow */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] opacity-70 group-hover:opacity-100 transition-opacity"
        style={{
          background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
        }}
      />

      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {title}
          </span>
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1.5 font-mono">
            {value}
          </div>
          {subValue && (
            <div className="text-xs text-slate-400 mt-1">{subValue}</div>
          )}
        </div>

        {Icon && (
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border border-white/10"
            style={{
              backgroundColor: `${accentColor}15`,
              color: accentColor,
              boxShadow: `0 0 15px -3px ${accentColor}25`,
            }}
          >
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {trend !== undefined && (
        <div className="flex items-center gap-1.5 mt-4 text-xs font-medium">
          <span
            className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-semibold ${
              trendPositive
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
            }`}
          >
            {trendPositive ? (
              <TrendingUp className="w-3 h-3 mr-1" />
            ) : (
              <TrendingDown className="w-3 h-3 mr-1" />
            )}
            {trend}
          </span>
          <span className="text-slate-400">{trendLabel}</span>
        </div>
      )}
    </div>
  );
}
