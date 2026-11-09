import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Sliders,
  Shield,
  Key,
  RotateCcw,
  Check,
  Save,
  Server,
  Zap,
} from 'lucide-react';

export default function Settings() {
  const [saved, setSaved] = useState(false);
  const [contamination, setContamination] = useState('0.08');
  const [maxRetries, setMaxRetries] = useState('3');
  const [banditExploration, setBanditExploration] = useState('15');
  const [autoRetry, setAutoRetry] = useState(true);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 max-w-4xl">
      {/* Header */}
      <div className="pb-2 border-b border-white/5">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
          Platform Configuration & Model Hyperparameters
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Adjust risk sensitivities, payment retry policies, and automated bandit exploration rates.
        </p>
      </div>

      {saved && (
        <div className="glass-panel p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Platform configurations updated successfully and propagated to ML engines.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* ML Hyperparameters Card */}
        <div className="glass-panel rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <h3>Machine Learning & Anomaly Detection Tuning</h3>
          </div>
          <p className="text-xs text-slate-400">
            Tune Isolation Forest sensitivity and contextual multi-armed bandit exploration probabilities.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="text-xs text-slate-300 font-semibold block mb-1">
                Isolation Forest Contamination Rate
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max="0.25"
                value={contamination}
                onChange={(e) => setContamination(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Standard baseline: 0.08 (flags top 8% multi-dimensional outlier clusters)
              </span>
            </div>

            <div>
              <label className="text-xs text-slate-300 font-semibold block mb-1">
                Bandit Exploration Probability (ε-Greedy)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="5"
                  max="50"
                  value={banditExploration}
                  onChange={(e) => setBanditExploration(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                />
                <span className="text-xs text-slate-400 font-mono">%</span>
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">
                Exploration fraction for discovering high-performing alternate routing rails
              </span>
            </div>
          </div>
        </div>

        {/* Payment Recovery Policy */}
        <div className="glass-panel rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <RotateCcw className="w-4 h-4 text-purple-400" />
            <h3>RecoverIQ Payment Execution & Safety Safeguards</h3>
          </div>
          <p className="text-xs text-slate-400">
            Enforce retry limits and safe sandbox simulation constraints.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="text-xs text-slate-300 font-semibold block mb-1">
                Maximum Automated Retry Attempts per Payment
              </label>
              <input
                type="number"
                min="1"
                max="5"
                value={maxRetries}
                onChange={(e) => setMaxRetries(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Prevents infinite retries and preserves bank clearing compliance
              </span>
            </div>

            <div className="flex flex-col justify-center">
              <label className="flex items-center gap-2 cursor-pointer mt-1">
                <input
                  type="checkbox"
                  checked={autoRetry}
                  onChange={(e) => setAutoRetry(e.target.checked)}
                  className="w-4 h-4 rounded text-cyan-500 bg-slate-900 border-white/10 focus:ring-0"
                />
                <span className="text-xs text-white font-semibold">
                  Enable Autonomous Contextual Retries
                </span>
              </label>
              <span className="text-[10px] text-slate-500 mt-1 block pl-6">
                Allows system to automatically execute recommended bandit arm when expected value exceeds retry cost
              </span>
            </div>
          </div>
        </div>

        {/* Organization & API Security */}
        <div className="glass-panel rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Shield className="w-4 h-4 text-emerald-400" />
            <h3>Organization & API Access Control</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-300 font-semibold block mb-1">
                Company Name
              </label>
              <input
                type="text"
                defaultValue="Apex Financial Technologies"
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div>
              <label className="text-xs text-slate-300 font-semibold block mb-1">
                Compliance Officer Email
              </label>
              <input
                type="email"
                defaultValue="compliance@apexfin.com"
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-all shadow-glow-primary flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
}
