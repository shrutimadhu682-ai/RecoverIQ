import React, { useState } from 'react';
import {
  Search,
  Bell,
  UploadCloud,
  Calendar,
  Sparkles,
  Command,
  Activity,
} from 'lucide-react';
import NotificationPanel from '../ui/NotificationPanel';

export default function Navbar({ onOpenUpload, collapsed }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [dateRange, setDateRange] = useState('Last 30 Days');

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <header
      className={`h-16 fixed top-0 right-0 z-30 bg-[#090D16]/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-6 transition-all duration-300 ${
        collapsed ? 'left-20' : 'left-64'
      }`}
    >
      {/* Left: Greeting & Date */}
      <div className="flex items-center gap-6">
        <div>
          <div className="text-sm font-bold text-white flex items-center gap-2">
            <span>Welcome back, Alex</span>
            <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 animate-pulse" />
              ML Engines Online
            </span>
          </div>
          <div className="text-[11px] text-slate-400 hidden sm:block">
            {currentDate} · Enterprise Portfolio
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="hidden lg:flex items-center relative w-64">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search records, merchants..."
            className="w-full bg-slate-900/60 border border-white/10 rounded-xl pl-9 pr-8 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/50 transition-colors"
          />
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 font-mono border border-white/5">
            ⌘K
          </span>
        </div>
      </div>

      {/* Right: Actions, Date Range, Notifications */}
      <div className="flex items-center gap-3">
        {/* Date Range Selector */}
        <div className="hidden sm:flex items-center gap-1.5 bg-slate-900/60 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-slate-300">
          <Calendar className="w-3.5 h-3.5 text-cyan-400" />
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="bg-transparent border-none text-xs text-white focus:outline-none cursor-pointer"
          >
            <option value="Last 30 Days" className="bg-slate-900">Last 30 Days</option>
            <option value="This Quarter" className="bg-slate-900">This Quarter</option>
            <option value="Year to Date" className="bg-slate-900">Year to Date (2026)</option>
          </select>
        </div>

        {/* Upload Statement CTA */}
        <button
          onClick={onOpenUpload}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold transition-all shadow-glow-primary shrink-0"
        >
          <UploadCloud className="w-3.5 h-3.5" />
          <span>Upload Statement</span>
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-9 h-9 rounded-xl border border-white/10 hover:border-white/20 bg-slate-900/60 hover:bg-white/5 flex items-center justify-center text-slate-300 hover:text-white transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400 shadow-glow-primary animate-pulse" />
          </button>

          <NotificationPanel
            isOpen={showNotifications}
            onClose={() => setShowNotifications(false)}
          />
        </div>
      </div>
    </header>
  );
}
