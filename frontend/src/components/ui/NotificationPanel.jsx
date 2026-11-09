import React from 'react';
import { ShieldAlert, Zap, CheckCircle2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function NotificationPanel({ isOpen, onClose }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const notifications = [
    {
      id: 1,
      title: 'High-Risk Anomaly Detected',
      message: '₹94,000 transaction flagged by Isolation Forest (Z-Score > 4.5).',
      time: '12m ago',
      type: 'risk',
      path: '/risk',
    },
    {
      id: 2,
      title: 'Payment Recovery Executed',
      message: '₹32,000 successfully recovered from Veloce Mobility via Adaptive Backoff.',
      time: '45m ago',
      type: 'recovery',
      path: '/recovery',
    },
    {
      id: 3,
      title: 'Duplicate Transaction Flagged',
      message: 'Identical ₹7,500 UPI charges detected to Electronics Store.',
      time: '2h ago',
      type: 'duplicate',
      path: '/transactions',
    },
    {
      id: 4,
      title: 'Cloud Infrastructure Recurrent Spend',
      message: 'Monthly AWS AutoDebit of ₹14,850 processed and reconciled.',
      time: '5h ago',
      type: 'info',
      path: '/finance',
    },
  ];

  return (
    <div className="absolute right-0 top-12 w-80 sm:w-96 glass-panel rounded-2xl shadow-2xl p-4 border border-white/10 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="flex items-center justify-between pb-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm text-white">Notifications</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-400">
            {notifications.length}
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="divide-y divide-white/5 max-h-80 overflow-y-auto mt-2 pr-1">
        {notifications.map((n) => (
          <div
            key={n.id}
            onClick={() => {
              navigate(n.path);
              onClose();
            }}
            className="py-3 px-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group"
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                  n.type === 'risk'
                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    : n.type === 'recovery'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                }`}
              >
                {n.type === 'risk' ? (
                  <ShieldAlert className="w-4 h-4" />
                ) : n.type === 'recovery' ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <Zap className="w-4 h-4" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-white group-hover:text-cyan-400 transition-colors">
                    {n.title}
                  </h4>
                  <span className="text-[10px] text-slate-500">{n.time}</span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">
                  {n.message}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-2 border-t border-white/5 mt-2">
        <button
          onClick={() => {
            navigate('/risk');
            onClose();
          }}
          className="w-full py-2 text-center text-xs font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          View All System Alerts →
        </button>
      </div>
    </div>
  );
}
