import React from 'react';
import { AlertCircle, BrainCircuit, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';

export default function RecoveryTimeline({ event }) {
  if (!event) return null;

  const isRecovered = event.status === 'RECOVERED';
  const isRetrying = event.status === 'RETRYING';

  const steps = [
    {
      title: 'Payment Gateway Decline',
      time: 'T+0m',
      status: 'failed',
      icon: AlertCircle,
      iconColor: 'text-rose-400 bg-rose-500/10 border-rose-500/25',
      description: `${event.failure_code}: ${event.failure_reason || 'Upstream gateway authorization failure'}`,
      badge: event.failure_type,
    },
    {
      title: 'RecoverIQ XGBoost Inference',
      time: 'T+12s',
      status: 'completed',
      icon: BrainCircuit,
      iconColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/25',
      description: `Classified as ${event.failure_type}. Estimated recovery probability: ${(event.recovery_probability * 100).toFixed(1)}%.`,
      badge: `${(event.recovery_probability * 100).toFixed(0)}% Probability`,
    },
    {
      title: 'Contextual Bandit Optimization',
      time: 'T+25s',
      status: 'completed',
      icon: RefreshCw,
      iconColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/25',
      description: `Selected arm: "${event.bandit_strategy}". Estimated delay: ${event.recommended_retry_time}. Net expected recovery value: ₹${event.expected_recovery_value?.toLocaleString() || 0}.`,
      badge: event.bandit_strategy,
    },
    {
      title: isRecovered ? 'Automated Smart Recovery Settled' : (isRetrying ? 'Smart Retry Queued' : 'Pending Recovery Execution'),
      time: isRecovered ? 'T+15m' : 'Pending',
      status: isRecovered ? 'success' : (isRetrying ? 'pending' : 'idle'),
      icon: isRecovered ? CheckCircle2 : (isRetrying ? RefreshCw : XCircle),
      iconColor: isRecovered
        ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25'
        : 'text-amber-400 bg-amber-500/10 border-amber-500/25',
      description: isRecovered
        ? `Successfully recovered full amount ₹${event.amount?.toLocaleString()} via secondary gateway routing rails.`
        : 'Awaiting execution trigger or next scheduled optimal retry window.',
      badge: event.status,
    },
  ];

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
      {steps.map((step, idx) => {
        const Icon = step.icon;
        return (
          <div key={idx} className="relative flex items-start gap-3 group">
            <div
              className={`absolute -left-6 top-0 w-6 h-6 rounded-full border flex items-center justify-center shrink-0 ${step.iconColor}`}
            >
              <Icon className="w-3.5 h-3.5" />
            </div>

            <div className="flex-1 bg-slate-900/40 border border-white/5 rounded-xl p-3.5 hover:border-white/10 transition-colors">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-semibold text-white">{step.title}</h4>
                <span className="text-[11px] font-mono text-slate-400">{step.time}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-2">
                {step.description}
              </p>
              {step.badge && (
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                  {step.badge}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
