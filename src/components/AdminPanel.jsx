import React, { useState } from 'react';
import { ShieldCheck, Server, Users, Database, Sparkles, Activity, FileText, Search, CheckCircle2, Clock, Zap, RefreshCw, BarChart } from 'lucide-react';
import BeeAnimatedMascot from './BeeAnimatedMascot';

const sampleAuditLogs = [
  { id: 'log-101', timestamp: '2026-08-11 00:39:12', user: 'Alex_Mastery (Manila)', action: 'Gemini OCR Flashcard Synthesis', category: 'AI Generation', status: 'SUCCESS', tokens: 420 },
  { id: 'log-102', timestamp: '2026-08-11 00:38:45', user: 'Bee Learner (You)', action: 'Claimed Daily Login Bonus (+50 XP)', category: 'Gamification', status: 'SUCCESS', tokens: 0 },
  { id: 'log-103', timestamp: '2026-08-11 00:37:10', user: 'Sophia_Brain (Quezon City)', action: 'Feynman Method Evaluation', category: 'Feynman Studio', status: 'SUCCESS', tokens: 280 },
  { id: 'log-104', timestamp: '2026-08-11 00:35:22', user: 'Juan_Polytech (Manila)', action: 'Supabase Realtime User Stats Upsert', category: 'Cloud Sync', status: 'SUCCESS', tokens: 0 },
  { id: 'log-105', timestamp: '2026-08-11 00:32:05', user: 'Elena_Stanford (US)', action: 'Completed Spaced Repetition Session (12 cards)', category: 'Study Round', status: 'SUCCESS', tokens: 150 },
  { id: 'log-106', timestamp: '2026-08-11 00:28:40', user: 'Kenji_TokyoTech (Japan)', action: 'Ask Bee Q&A Query: "Quantum Physics"', category: 'Ask Bee AI', status: 'SUCCESS', tokens: 360 }
];

export default function AdminPanel() {
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLogs = sampleAuditLogs.filter((log) => {
    const matchesCategory = filterCategory === 'ALL' || log.category === filterCategory;
    const matchesSearch =
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6 select-none">
      {/* Admin Header */}
      <div className="glass-panel p-6 border-indigo-500/40 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <ShieldCheck size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-white font-display">System Admin & Accounting Panel</h2>
                <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  SYSTEM ONLINE
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Oversee app usage analytics, Gemini AI token consumption, and Supabase audit logs.
              </p>
            </div>
          </div>
        </div>

        <BeeAnimatedMascot size="lg" animated={true} flightPath={true} speechBubble="Admin Dashboard!" />
      </div>

      {/* Analytics Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Users Count */}
        <div className="glass-panel p-4 space-y-2 border-sky-500/30">
          <div className="flex items-center justify-between text-xs font-bold text-sky-400 uppercase tracking-wider">
            <Users size={16} /> Total Active Users
          </div>
          <p className="text-3xl font-extrabold text-white font-display">1,240</p>
          <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full inline-block">
            + 14% this week
          </span>
        </div>

        {/* Decks Created */}
        <div className="glass-panel p-4 space-y-2 border-indigo-500/30">
          <div className="flex items-center justify-between text-xs font-bold text-indigo-400 uppercase tracking-wider">
            <Database size={16} /> Study Decks Created
          </div>
          <p className="text-3xl font-extrabold text-white font-display">3,820</p>
          <span className="text-[10px] text-indigo-300 font-semibold bg-indigo-500/10 px-2 py-0.5 rounded-full inline-block">
            IndexedDB + Supabase
          </span>
        </div>

        {/* Reviews Today */}
        <div className="glass-panel p-4 space-y-2 border-amber-500/30">
          <div className="flex items-center justify-between text-xs font-bold text-amber-400 uppercase tracking-wider">
            <Activity size={16} /> Cards Reviewed Today
          </div>
          <p className="text-3xl font-extrabold text-white font-display">18,450</p>
          <span className="text-[10px] text-amber-300 font-semibold bg-amber-500/10 px-2 py-0.5 rounded-full inline-block">
            SM-2 Memory Matrix
          </span>
        </div>

        {/* Gemini AI Tokens */}
        <div className="glass-panel p-4 space-y-2 border-purple-500/30">
          <div className="flex items-center justify-between text-xs font-bold text-purple-400 uppercase tracking-wider">
            <Sparkles size={16} /> Gemini AI Tokens
          </div>
          <p className="text-3xl font-extrabold text-white font-display">1.2M</p>
          <span className="text-[10px] text-purple-300 font-semibold bg-purple-500/10 px-2 py-0.5 rounded-full inline-block">
            Gemini 2.5-Flash Active
          </span>
        </div>
      </div>

      {/* System Status Monitors */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="glass-panel p-3.5 flex items-center justify-between border-emerald-500/30">
          <div className="flex items-center gap-2.5">
            <Server size={18} className="text-emerald-400" />
            <div>
              <h4 className="text-xs font-bold text-white">Google Gemini API</h4>
              <p className="text-[10px] text-slate-400">Pre-Configured Key Active</p>
            </div>
          </div>
          <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full">HEALTHY</span>
        </div>

        <div className="glass-panel p-3.5 flex items-center justify-between border-emerald-500/30">
          <div className="flex items-center gap-2.5">
            <Database size={18} className="text-emerald-400" />
            <div>
              <h4 className="text-xs font-bold text-white">Supabase PostgreSQL</h4>
              <p className="text-[10px] text-slate-400">Realtime WebSocket Sync</p>
            </div>
          </div>
          <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full">CONNECTED</span>
        </div>

        <div className="glass-panel p-3.5 flex items-center justify-between border-sky-500/30">
          <div className="flex items-center gap-2.5">
            <Activity size={18} className="text-sky-400" />
            <div>
              <h4 className="text-xs font-bold text-white">IndexedDB Storage</h4>
              <p className="text-[10px] text-slate-400">Offline Fallback Engine</p>
            </div>
          </div>
          <span className="text-[9px] font-bold text-sky-400 bg-sky-500/15 px-2 py-0.5 rounded-full">ACTIVE</span>
        </div>
      </div>

      {/* Audit & Accounting Logs History Table */}
      <div className="glass-panel p-5 space-y-4 border-slate-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FileText className="text-sky-400" size={20} />
            <h3 className="text-base font-bold text-white font-display">System Audit & Activity Logs</h3>
          </div>

          {/* Search & Category Filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search logs..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white outline-none"
              />
            </div>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 outline-none"
            >
              <option value="ALL">All Categories</option>
              <option value="AI Generation">AI Generation</option>
              <option value="Feynman Studio">Feynman Studio</option>
              <option value="Ask Bee AI">Ask Bee AI</option>
              <option value="Gamification">Gamification</option>
              <option value="Cloud Sync">Cloud Sync</option>
            </select>
          </div>
        </div>

        {/* Logs Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300 border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-bold tracking-wider bg-slate-900/60">
                <th className="p-3 rounded-l-xl">Log ID & Timestamp</th>
                <th className="p-3">User Profile</th>
                <th className="p-3">Category</th>
                <th className="p-3">Action Description</th>
                <th className="p-3">Tokens</th>
                <th className="p-3 rounded-r-xl text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-900/50 transition-colors">
                  <td className="p-3">
                    <div className="font-mono text-white font-bold">{log.id}</div>
                    <div className="text-[10px] text-slate-500">{log.timestamp}</div>
                  </td>
                  <td className="p-3 font-semibold text-slate-200">{log.user}</td>
                  <td className="p-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                      {log.category}
                    </span>
                  </td>
                  <td className="p-3 text-slate-300">{log.action}</td>
                  <td className="p-3 font-mono text-purple-300">{log.tokens ? `${log.tokens} tk` : '-'}</td>
                  <td className="p-3 text-right">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      <CheckCircle2 size={12} /> {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
