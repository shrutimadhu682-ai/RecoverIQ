import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  User,
  Bot,
  Loader2,
  TrendingUp,
  Receipt,
  ShieldAlert,
  RotateCcw,
  Building2,
  Calendar,
  Layers,
} from 'lucide-react';
import { api } from '../services/api';

const SUGGESTED_PROMPTS = [
  'How much did I spend this month?',
  'Which merchant received the highest payments?',
  'Show my recurring subscriptions.',
  'Are there any unusual transactions?',
  'Which payments failed?',
  'What recovery action is recommended?',
];

export default function AIAssistant() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content:
        "Hello Alex! I am your **RecoverIQ Financial Intelligence Assistant**. I analyze your live transactions, Isolation Forest risk alerts, and payment recovery pipelines in real time. Ask me about your spending patterns, merchant volumes, flagged anomalies, or automated retry recommendations.",
      structured_data: null,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend = null) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg = {
      id: Date.now(),
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const historyPayload = messages.map((m) => ({ role: m.role, content: m.content }));
      const response = await api.askAssistant(query, historyPayload);

      const botMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response.reply,
        structured_data: response.structured_data,
        suggested_actions: response.suggested_actions,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error('Error asking assistant:', err);
      const errorMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        content:
          "I apologize, but I encountered an error connecting to the financial database service. Please ensure the backend is running.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const renderStructuredData = (data) => {
    if (!data) return null;

    if (data.type === 'metric_card') {
      return (
        <div className="mt-3 p-3.5 rounded-xl bg-slate-900/80 border border-white/10 space-y-2">
          <div className="text-[10px] uppercase font-bold text-slate-400">{data.title}</div>
          <div className="text-xl font-bold font-mono text-cyan-400">{data.value}</div>
          {data.breakdown && (
            <div className="pt-2 border-t border-white/5 space-y-1">
              {data.breakdown.map((item, idx) => (
                <div key={idx} className="flex justify-between text-xs text-slate-300">
                  <span>{item.category}</span>
                  <span className="font-mono font-semibold">₹{item.amount?.toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (data.type === 'table') {
      return (
        <div className="mt-3 overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-left text-xs bg-slate-900/80">
            <thead className="bg-slate-950/60 border-b border-white/5 text-slate-400 font-semibold">
              <tr>
                {data.columns.map((c, i) => (
                  <th key={i} className="py-2 px-3">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data.rows.map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => (
                    <td key={j} className={`py-2 px-3 ${j > 0 ? 'font-mono text-cyan-300 font-semibold' : 'text-white'}`}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    if (data.type === 'subscription_list') {
      return (
        <div className="mt-3 space-y-2">
          {data.items.map((item, idx) => (
            <div key={idx} className="p-2.5 rounded-xl bg-slate-900/80 border border-white/10 flex items-center justify-between text-xs">
              <span className="font-bold text-white">{item.name}</span>
              <span className="font-mono text-purple-400 font-semibold">₹{item.amount?.toLocaleString('en-IN')} /mo</span>
            </div>
          ))}
        </div>
      );
    }

    if (data.type === 'risk_card') {
      return (
        <div className="mt-3 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-rose-400">Risk Score: {data.risk_score}/100</span>
            <span className="font-mono text-[10px] text-slate-400">Anomaly Index: {data.anomaly_score}</span>
          </div>
          <div className="space-y-1 text-xs text-slate-300">
            {data.factors?.map((f, idx) => (
              <div key={idx} className="text-[11px] leading-relaxed">
                • <strong className="text-white">{f.factor}:</strong> {f.detail}
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (data.type === 'recovery_card') {
      return (
        <div className="mt-3 p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 space-y-1.5 text-xs">
          <div className="flex justify-between font-bold text-white">
            <span>Ref: {data.ref}</span>
            <span className="text-cyan-400 font-mono">{data.amount}</span>
          </div>
          <div className="text-slate-300">Failure: <strong className="text-rose-400">{data.failure_code}</strong></div>
          <div className="text-slate-300">Recovery Prob: <strong className="text-emerald-400 font-mono">{data.probability}</strong></div>
          <div className="pt-1.5 border-t border-white/5 text-cyan-300 font-semibold">
            Recommended Action: {data.recommended_action}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="h-[calc(100vh-8.5rem)] flex flex-col glass-panel rounded-2xl overflow-hidden border border-white/5 animate-in fade-in duration-300">
      {/* Header */}
      <div className="p-4 border-b border-white/5 bg-slate-900/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-glow-primary">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              RecoverIQ AI Financial Assistant
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Grounded in Real Records
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">
              Direct access to transaction database, Isolation Forest risk flags, and payment recovery telemetry.
            </p>
          </div>
        </div>
      </div>

      {/* Messages Scroll Feed */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
        {messages.map((m) => {
          const isUser = m.role === 'user';
          return (
            <div
              key={m.id}
              className={`flex items-start gap-3 max-w-2xl ${
                isUser ? 'ml-auto flex-row-reverse' : ''
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-glow-primary'
                    : 'bg-purple-600/30 text-purple-300 border border-purple-500/30'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-cyan-500/20 text-white border border-cyan-500/30 rounded-tr-sm'
                    : 'bg-slate-900/80 text-slate-200 border border-white/10 rounded-tl-sm'
                }`}
              >
                <div className="whitespace-pre-wrap">{m.content}</div>

                {renderStructuredData(m.structured_data)}

                {m.suggested_actions && m.suggested_actions.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-white/5 flex flex-wrap gap-1.5">
                    {m.suggested_actions.map((act, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(act)}
                        className="px-2.5 py-1 rounded-lg text-[11px] bg-white/5 hover:bg-white/10 text-cyan-300 border border-white/5 transition-colors text-left"
                      >
                        {act}
                      </button>
                    ))}
                  </div>
                )}

                <div className="mt-1 text-[10px] text-slate-500 text-right">
                  {m.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-600/30 text-purple-300 border border-purple-500/30 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div className="rounded-2xl px-4 py-3 bg-slate-900/80 border border-white/10 rounded-tl-sm flex items-center gap-2 text-xs text-slate-400">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
              Querying financial records & models...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompt Chips */}
      <div className="px-4 py-2 border-t border-white/5 bg-slate-900/40 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="text-[10px] uppercase font-bold text-slate-500 shrink-0">
          Try asking:
        </span>
        {SUGGESTED_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            className="px-3 py-1 rounded-full text-xs font-medium bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-white/5 transition-colors shrink-0"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-4 border-t border-white/5 bg-slate-900/80 flex items-center gap-3"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything about your spending, anomalous charges, or payment recovery..."
          className="flex-1 bg-slate-950/80 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/50"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center gap-1.5 shadow-glow-primary text-xs"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Send</span>
        </button>
      </form>
    </div>
  );
}
