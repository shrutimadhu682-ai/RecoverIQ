import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowLeftRight,
  TrendingUp,
  ShieldAlert,
  RotateCcw,
  Sparkles,
  FileSpreadsheet,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
} from 'lucide-react';

export default function Sidebar({ collapsed, setCollapsed }) {
  const location = useLocation();

  const navItems = [
    { label: 'Overview', path: '/', icon: LayoutDashboard },
    { label: 'Transactions', path: '/transactions', icon: ArrowLeftRight },
    { label: 'FinanceIQ', path: '/finance', icon: TrendingUp },
    { label: 'RiskIQ', path: '/risk', icon: ShieldAlert, badge: '1 Alert', badgeColor: 'bg-rose-500/20 text-rose-300' },
    { label: 'Payment Recovery', path: '/recovery', icon: RotateCcw, badge: '4 Cases', badgeColor: 'bg-cyan-500/20 text-cyan-300' },
    { label: 'AI Assistant', path: '/assistant', icon: Sparkles, highlight: true },
    { label: 'Reports', path: '/reports', icon: FileSpreadsheet },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 z-40 bg-[#090D16] border-r border-white/5 flex flex-col justify-between transition-all duration-300 ease-in-out ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div>
        <div className="h-16 flex items-center justify-between px-5 border-b border-white/5">
          <NavLink to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 p-[1px] shadow-glow-primary shrink-0 flex items-center justify-center">
              <div className="w-full h-full bg-[#0B0F19] rounded-[11px] flex items-center justify-center group-hover:bg-transparent transition-colors">
                <Zap className="w-4 h-4 text-cyan-400 group-hover:text-white" />
              </div>
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <div className="text-base font-extrabold tracking-tight text-white flex items-center gap-1 font-mono">
                  Recover<span className="text-gradient-primary">IQ</span>
                </div>
                <div className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">
                  Financial Intelligence
                </div>
              </div>
            )}
          </NavLink>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-slate-500 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors hidden sm:block"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation List */}
        <nav className="p-3 space-y-1.5 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                title={collapsed ? item.label : undefined}
                className={`relative flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/15 to-blue-500/5 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                {/* Active Indicator Bar */}
                {isActive && (
                  <div className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-cyan-400 shadow-glow-primary" />
                )}

                <Icon
                  className={`w-5 h-5 shrink-0 transition-colors ${
                    isActive
                      ? 'text-cyan-400'
                      : item.highlight
                      ? 'text-purple-400 group-hover:text-purple-300'
                      : 'text-slate-400 group-hover:text-white'
                  }`}
                />

                {!collapsed && (
                  <div className="flex-1 flex items-center justify-between overflow-hidden">
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* User Profile Footer */}
      <div className="p-3 border-t border-white/5 bg-[#060910]/60">
        <div
          className={`flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-sm">
              AC
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#090D16]" />
          </div>

          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-white truncate">Alex Chen</div>
              <div className="text-[11px] text-slate-400 truncate">Apex Technologies</div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
