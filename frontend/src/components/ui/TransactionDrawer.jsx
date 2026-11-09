import React, { useState, useEffect } from 'react';
import { X, Check, Edit3, ShieldAlert, Sparkles, Building2, Tag, CreditCard, Hash, Calendar, Loader2 } from 'lucide-react';
import StatusBadge from './StatusBadge';
import RiskIndicator from './RiskIndicator';
import { api } from '../../services/api';

const CATEGORY_OPTIONS = [
  'Food & Dining',
  'SaaS & Cloud',
  'Travel & Commute',
  'Shopping',
  'Utilities',
  'Healthcare',
  'Entertainment',
  'Financial Services',
  'Salary & Consulting',
  'General',
];

export default function TransactionDrawer({ transaction, isOpen, onClose, onUpdated }) {
  const [editing, setEditing] = useState(false);
  const [merchantName, setMerchantName] = useState('');
  const [category, setCategory] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (transaction) {
      setMerchantName(transaction.merchant_name || transaction.payee_name || '');
      setCategory(transaction.category || 'General');
      setNotes(transaction.notes || '');
      setEditing(false);
    }
  }, [transaction]);

  if (!isOpen || !transaction) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.updateTransaction(transaction.id, {
        merchant_name: merchantName,
        category: category,
        notes: notes,
      });
      setEditing(false);
      if (onUpdated) onUpdated();
    } catch (err) {
      console.error('Failed to update transaction:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#0C111D] border-l border-white/10 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider">
                Transaction Intelligence
              </span>
              <h3 className="text-lg font-bold text-white mt-0.5 font-mono">
                #{transaction.id} · Ref {transaction.reference_number || 'N/A'}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6 overflow-y-auto flex-1">
            {/* Amount & Type Hero Card */}
            <div className="glass-panel rounded-2xl p-4 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 font-medium">Recorded Amount</span>
                <div className="text-3xl font-extrabold text-white font-mono mt-0.5">
                  ₹{transaction.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <StatusBadge status={transaction.type} />
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {transaction.date}
                </span>
              </div>
            </div>

            {/* AI Narration Cleaning */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  FinParse AI Narration
                </span>
                <span className="text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  {(transaction.confidence_score * 100).toFixed(0)}% Confidence
                </span>
              </div>

              <div className="bg-slate-900/60 rounded-xl p-3 border border-white/5 space-y-2">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-500">Raw Statement Narration</div>
                  <div className="text-xs font-mono text-slate-300 break-all mt-0.5">
                    {transaction.raw_narration}
                  </div>
                </div>
                <div className="pt-2 border-t border-white/5">
                  <div className="text-[10px] uppercase font-bold text-cyan-400">Normalized Interpretation</div>
                  <div className="text-xs font-medium text-white mt-0.5">
                    {transaction.clean_narration || 'Processed via FinParse standard heuristics.'}
                  </div>
                </div>
              </div>
            </div>

            {/* Editable Fields Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">Classified Metadata</span>
                {!editing ? (
                  <button
                    onClick={() => setEditing(true)}
                    className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium transition-colors"
                  >
                    <Edit3 className="w-3 h-3" /> Edit Fields
                  </button>
                ) : (
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="text-xs bg-cyan-500 text-slate-950 font-bold px-3 py-1 rounded-lg flex items-center gap-1 hover:bg-cyan-400 transition-colors"
                  >
                    {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                    Save
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {/* Merchant Name */}
                <div className="bg-slate-900/40 rounded-xl p-3 border border-white/5">
                  <label className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5 mb-1">
                    <Building2 className="w-3.5 h-3.5 text-slate-500" /> Merchant / Entity
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      value={merchantName}
                      onChange={(e) => setMerchantName(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                    />
                  ) : (
                    <div className="text-sm font-semibold text-white">
                      {transaction.merchant_name || transaction.payee_name || 'Unassigned'}
                    </div>
                  )}
                </div>

                {/* Category */}
                <div className="bg-slate-900/40 rounded-xl p-3 border border-white/5">
                  <label className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5 mb-1">
                    <Tag className="w-3.5 h-3.5 text-slate-500" /> Category
                  </label>
                  {editing ? (
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                    >
                      {CATEGORY_OPTIONS.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="text-sm font-semibold text-white">
                      {transaction.category}
                    </div>
                  )}
                </div>

                {/* Payment Method */}
                <div className="bg-slate-900/40 rounded-xl p-3 border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-slate-400" />
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Method</div>
                      <div className="text-xs font-semibold text-white">{transaction.payment_method}</div>
                    </div>
                  </div>
                  {transaction.is_recurring && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      Recurring Subscription
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Risk & Anomaly Score */}
            <div className="bg-slate-900/40 rounded-xl p-4 border border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                  RiskIQ Evaluation
                </span>
                <span className="text-[10px] text-slate-500">Isolation Forest</span>
              </div>
              <RiskIndicator score={transaction.risk_score} level={transaction.risk_score >= 70 ? 'HIGH' : transaction.risk_score >= 40 ? 'MEDIUM' : 'LOW'} />
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {transaction.risk_score >= 70
                  ? 'Flagged for manual review due to anomalous amount or unverified merchant clearing characteristics.'
                  : 'Statistical profile aligns with verified financial baselines.'}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-white/5 bg-slate-950/50 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-white/5 transition-colors"
            >
              Close Drawer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
