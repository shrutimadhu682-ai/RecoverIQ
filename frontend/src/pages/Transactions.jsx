import React, { useEffect, useState } from 'react';
import {
  Search,
  Filter,
  UploadCloud,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Building2,
  Calendar,
  ShieldAlert,
  ArrowUpDown,
  RefreshCw,
  Loader2,
  CreditCard,
  CheckCircle,
} from 'lucide-react';
import StatusBadge from '../components/ui/StatusBadge';
import RiskIndicator from '../components/ui/RiskIndicator';
import TransactionDrawer from '../components/ui/TransactionDrawer';
import UploadModal from '../components/ui/UploadModal';
import { api } from '../services/api';

const CATEGORIES = [
  'All',
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

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [type, setType] = useState('All');
  const [flaggedOnly, setFlaggedOnly] = useState(false);
  const [selectedTx, setSelectedTx] = useState(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params = {
        limit: 100,
        offset: 0,
        search: search || undefined,
        category: category !== 'All' ? category : undefined,
        type: type !== 'All' ? type : undefined,
        is_flagged: flaggedOnly ? true : undefined,
      };
      const data = await api.getTransactions(params);
      setTransactions(data || []);
    } catch (err) {
      console.error('Failed to load transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [category, type, flaggedOnly]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTransactions();
  };

  // Pagination slice
  const totalPages = Math.ceil(transactions.length / pageSize) || 1;
  const paginatedTransactions = transactions.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
            Normalized Transactions
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">
              {transactions.length} Records
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Intelligent parsing engine extracting clean entities, confidence ratings, and anomaly scores.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setUploadModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 transition-all shadow-glow-primary"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Statement</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-panel rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search payee, narration, ref ID..."
            className="w-full bg-slate-900/60 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/50"
          />
        </form>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Category Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-900/60 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-300">
            <span className="text-slate-500">Category:</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-transparent border-none text-xs text-white focus:outline-none cursor-pointer"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat} className="bg-slate-900">
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-1.5 bg-slate-900/60 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-300">
            <span className="text-slate-500">Type:</span>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="bg-transparent border-none text-xs text-white focus:outline-none cursor-pointer"
            >
              <option value="All" className="bg-slate-900">All Types</option>
              <option value="Debit" className="bg-slate-900">Debits</option>
              <option value="Credit" className="bg-slate-900">Credits</option>
            </select>
          </div>

          {/* Flagged Anomalies Toggle */}
          <button
            onClick={() => setFlaggedOnly(!flaggedOnly)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              flaggedOnly
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                : 'bg-slate-900/60 text-slate-400 border-white/10 hover:text-white'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>Anomalies Only</span>
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-white/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 border-b border-white/5 text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3.5 px-4">Merchant / Entity</th>
                <th className="py-3.5 px-4">Clean Narration</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Method</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4 text-right">Amount (INR)</th>
                <th className="py-3.5 px-4 text-center">Confidence</th>
                <th className="py-3.5 px-4">Risk Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-cyan-400 mb-2" />
                    Loading transaction records...
                  </td>
                </tr>
              ) : paginatedTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No transactions match the selected filters.
                  </td>
                </tr>
              ) : (
                paginatedTransactions.map((tx) => (
                  <tr
                    key={tx.id}
                    onClick={() => setSelectedTx(tx)}
                    className="hover:bg-white/[0.03] transition-colors cursor-pointer group"
                  >
                    {/* Merchant */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center font-bold text-xs text-cyan-400 shrink-0 group-hover:border-cyan-400/40 transition-colors">
                          {(tx.merchant_name || tx.payee_name || 'TX').substring(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-white truncate max-w-[150px] group-hover:text-cyan-400 transition-colors">
                            {tx.merchant_name || tx.payee_name || 'Unassigned'}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            #{tx.id} · Ref {tx.reference_number || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Clean Narration */}
                    <td className="py-3.5 px-4 max-w-xs truncate text-slate-300">
                      {tx.clean_narration || tx.raw_narration}
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800/80 text-slate-300 border border-slate-700/60">
                        {tx.category}
                      </span>
                    </td>

                    {/* Payment Method */}
                    <td className="py-3.5 px-4 text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-slate-500" />
                        <span>{tx.payment_method}</span>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-slate-400 font-mono">
                      {tx.date}
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4 text-right">
                      <div
                        className={`font-mono font-bold text-sm ${
                          tx.type === 'credit' ? 'text-emerald-400' : 'text-slate-100'
                        }`}
                      >
                        {tx.type === 'credit' ? '+' : '-'}₹{tx.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-[10px] uppercase font-bold text-slate-500">
                        {tx.type}
                      </div>
                    </td>

                    {/* Confidence */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                        {(tx.confidence_score * 100).toFixed(0)}%
                      </span>
                    </td>

                    {/* Risk Level */}
                    <td className="py-3.5 px-4">
                      <RiskIndicator
                        score={tx.risk_score}
                        level={tx.risk_score >= 70 ? 'HIGH' : tx.risk_score >= 40 ? 'MEDIUM' : 'LOW'}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-white/5 bg-slate-900/40 flex items-center justify-between text-xs text-slate-400">
          <div>
            Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, transactions.length)} of {transactions.length} entries
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none transition-colors flex items-center gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Previous
            </button>
            <span className="font-mono text-white px-2">
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none transition-colors flex items-center gap-1"
            >
              Next <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Transaction Slide-over Drawer */}
      <TransactionDrawer
        transaction={selectedTx}
        isOpen={!!selectedTx}
        onClose={() => setSelectedTx(null)}
        onUpdated={fetchTransactions}
      />

      {/* Upload Modal */}
      <UploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUploadSuccess={fetchTransactions}
      />
    </div>
  );
}
