import React from 'react';

export default function RiskIndicator({ score = 15, level = 'LOW', size = 'md' }) {
  const normalizedScore = Math.min(Math.max(score, 0), 100);

  let barColor = 'from-emerald-500 to-teal-400';
  let textColor = 'text-emerald-400';
  let badgeBg = 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';

  if (normalizedScore >= 70 || level === 'HIGH') {
    barColor = 'from-amber-500 to-rose-500';
    textColor = 'text-rose-400';
    badgeBg = 'bg-rose-500/10 border-rose-500/20 text-rose-400';
  } else if (normalizedScore >= 40 || level === 'MEDIUM') {
    barColor = 'from-blue-500 to-amber-500';
    textColor = 'text-amber-400';
    badgeBg = 'bg-amber-500/10 border-amber-500/20 text-amber-400';
  }

  return (
    <div className="flex flex-col gap-1.5 min-w-[120px]">
      <div className="flex items-center justify-between text-xs">
        <span className={`font-mono font-bold ${textColor}`}>
          {normalizedScore.toFixed(0)}
          <span className="text-[10px] text-slate-500">/100</span>
        </span>
        <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border ${badgeBg}`}>
          {level}
        </span>
      </div>
      
      {/* Progress track */}
      <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${barColor} transition-all duration-500`}
          style={{ width: `${normalizedScore}%` }}
        />
      </div>
    </div>
  );
}
