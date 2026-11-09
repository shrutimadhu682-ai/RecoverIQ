import React from 'react';

export default function StatusBadge({ status, type = 'status' }) {
  const s = String(status || '').toUpperCase();

  let styles = 'bg-slate-800 text-slate-300 border-slate-700';

  if (s === 'COMPLETED' || s === 'SUCCESS' || s === 'RECOVERED' || s === 'LOW' || s === 'RESOLVED') {
    styles = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25';
  } else if (s === 'FAILED' || s === 'HIGH' || s === 'CONFIRMED_FRAUD' || s === 'PERMANENT') {
    styles = 'bg-rose-500/10 text-rose-400 border-rose-500/25';
  } else if (s === 'RETRYING' || s === 'PENDING' || s === 'MEDIUM' || s === 'TEMPORARY' || s === 'INVESTIGATING') {
    styles = 'bg-amber-500/10 text-amber-400 border-amber-500/25';
  } else if (s === 'CREDIT') {
    styles = 'bg-teal-500/10 text-teal-300 border-teal-500/25';
  } else if (s === 'DEBIT') {
    styles = 'bg-blue-500/10 text-blue-300 border-blue-500/25';
  } else if (s === 'FALSE_POSITIVE') {
    styles = 'bg-purple-500/10 text-purple-300 border-purple-500/25';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles} tracking-wide`}>
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-75 animate-pulse" />
      {s.replace(/_/g, ' ')}
    </span>
  );
}
