import React, { useState } from 'react';
import {
  ShieldCheck, Server, Users, Database, Sparkles, Activity, FileText,
  Search, CheckCircle2, XCircle, Clock, Zap, LogOut, UserCheck, UserX
} from 'lucide-react';
import BeeAnimatedMascot from './BeeAnimatedMascot';

const mockPendingUsers = [
  { id: 'u-101', username: 'Maria_Santos', email: 'maria@dlsu.edu.ph', city: 'Manila, 🇵🇭 Philippines', education: 'College / University', registeredAt: '2026-08-11 00:32:11', status: 'pending' },
  { id: 'u-102', username: 'Juan_Dela_Cruz', email: 'juan@up.edu.ph', city: 'Quezon City, 🇵🇭 Philippines', education: 'Engineering & Tech', registeredAt: '2026-08-11 00:28:44', status: 'pending' },
  { id: 'u-103', username: 'Elena_Stanford', email: 'elena@stanford.edu', city: 'New York, 🇺🇸 United States', education: 'Medical / Nursing', registeredAt: '2026-08-10 23:55:02', status: 'pending' },
];

const mockAuditLogs = [
  { id: 'log-101', timestamp: '2026-08-11 00:39:12', user: 'Alex_Mastery (Manila)', action: 'Gemini OCR Flashcard Synthesis', category: 'AI Generation', status: 'SUCCESS', tokens: 420 },
  { id: 'log-102', timestamp: '2026-08-11 00:38:45', user: 'Sophia_Brain (Quezon City)', action: 'Claimed Daily Login Bonus (+50 XP)', category: 'Gamification', status: 'SUCCESS', tokens: 0 },
  { id: 'log-103', timestamp: '2026-08-11 00:37:10', user: 'Sophia_Brain (QC)', action: 'Feynman Method Evaluation', category: 'Feynman Studio', status: 'SUCCESS', tokens: 280 },
  { id: 'log-104', timestamp: '2026-08-11 00:35:22', user: 'Kenji_Tokyo (Japan)', action: 'Supabase Realtime User Stats Upsert', category: 'Cloud Sync', status: 'SUCCESS', tokens: 0 },
  { id: 'log-105', timestamp: '2026-08-11 00:32:05', user: 'Elena_Stanford (US)', action: 'Completed Spaced Repetition Session (12 cards)', category: 'Study Round', status: 'SUCCESS', tokens: 150 },
  { id: 'log-106', timestamp: '2026-08-11 00:28:40', user: 'Kenji_Tokyo (Japan)', action: 'Ask Bee Q&A Query: "Quantum Physics"', category: 'Ask Bee AI', status: 'SUCCESS', tokens: 360 },
];

export default function AdminPanel({ onLogout }) {
  const [pendingUsers, setPendingUsers] = useState(mockPendingUsers);
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState('overview');

  const handleApprove = (userId) => {
    setPendingUsers((prev) => prev.map((u) => u.id === userId ? { ...u, status: 'approved' } : u));
  };

  const handleReject = (userId) => {
    setPendingUsers((prev) => prev.map((u) => u.id === userId ? { ...u, status: 'rejected' } : u));
  };

  const filteredLogs = mockAuditLogs.filter((log) => {
    const matchesCategory = filterCategory === 'ALL' || log.category === filterCategory;
    const matchesSearch =
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const pendingCount = pendingUsers.filter((u) => u.status === 'pending').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans select-none">
      {/* Admin Topbar */}
      <header className="h-14 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800/80 px-6 flex items-center justify-between z-40">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-indigo-500/20 border border-indigo-500/30">
            <ShieldCheck className="text-indigo-400" size={18} />
          </div>
          <div>
            <span className="font-extrabold text-sm text-white font-display">BEE AI — Admin Control Panel</span>
            <span className="text-[10px] text-slate-400 block">System oversight, user approvals & audit logs</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <BeeAnimatedMascot size="sm" animated={true} />
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 border border-rose-500/30 hover:border-rose-400 px-3 py-1.5 rounded-xl transition-all"
          >
            <LogOut size={14} /> Logout Admin
          </button>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="border-b border-slate-800 bg-slate-900/50 px-6 flex gap-1">
        {[
          { id: 'overview', label: '📊 Overview' },
          { id: 'approvals', label: `👤 User Approvals${pendingCount > 0 ? ` (${pendingCount})` : ''}` },
          { id: 'logs', label: '📋 Audit Logs' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id)}
            className={`text-xs font-semibold px-4 py-3 border-b-2 transition-all ${
              activeSection === tab.id
                ? 'border-indigo-400 text-indigo-300'
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-6">

        {/* OVERVIEW TAB */}
        {activeSection === 'overview' && (
          <div className="space-y-5">
            <div className="glass-panel p-5 border-indigo-500/30 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white font-display">System Admin & Accounting Panel</h2>
                <p className="text-xs text-slate-400 mt-0.5">Oversee app usage analytics, Gemini AI token consumption, and Supabase audit logs.</p>
              </div>
              <span className="text-[9px] font-extrabold uppercase px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                SYSTEM ONLINE
              </span>
            </div>

            {/* Analytics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              <div className="glass-panel p-4 space-y-2 border-sky-500/30">
                <div className="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase">
                  <Users size={15} /> Total Users
                </div>
                <p className="text-3xl font-extrabold text-white font-display">1,240</p>
                <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full inline-block">+14% this week</span>
              </div>

              <div className="glass-panel p-4 space-y-2 border-amber-500/30">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase">
                  <Clock size={15} /> Pending Approvals
                </div>
                <p className="text-3xl font-extrabold text-white font-display">{pendingCount}</p>
                <span className="text-[10px] text-amber-300 font-semibold bg-amber-500/10 px-2 py-0.5 rounded-full inline-block">Awaiting review</span>
              </div>

              <div className="glass-panel p-4 space-y-2 border-indigo-500/30">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase">
                  <Activity size={15} /> Cards Reviewed Today
                </div>
                <p className="text-3xl font-extrabold text-white font-display">18,450</p>
                <span className="text-[10px] text-indigo-300 font-semibold bg-indigo-500/10 px-2 py-0.5 rounded-full inline-block">SM-2 Memory Matrix</span>
              </div>

              <div className="glass-panel p-4 space-y-2 border-purple-500/30">
                <div className="flex items-center gap-2 text-xs font-bold text-purple-400 uppercase">
                  <Sparkles size={15} /> Gemini Tokens Used
                </div>
                <p className="text-3xl font-extrabold text-white font-display">1.2M</p>
                <span className="text-[10px] text-purple-300 font-semibold bg-purple-500/10 px-2 py-0.5 rounded-full inline-block">Gemini 2.5-Flash</span>
              </div>
            </div>

            {/* System Statuses */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { label: 'Google Gemini API', sub: 'Pre-Configured Key Active', status: 'HEALTHY', color: 'emerald', icon: Server },
                { label: 'Supabase PostgreSQL', sub: 'Realtime WebSocket Sync', status: 'CONNECTED', color: 'emerald', icon: Database },
                { label: 'IndexedDB Storage', sub: 'Offline Fallback Engine', status: 'ACTIVE', color: 'sky', icon: Activity },
              ].map((s, i) => {
                const Icon = s.icon;
                return (
                  <div key={i} className={`glass-panel p-3.5 flex items-center justify-between border-${s.color}-500/30`}>
                    <div className="flex items-center gap-2.5">
                      <Icon size={18} className={`text-${s.color}-400`} />
                      <div>
                        <h4 className="text-xs font-bold text-white">{s.label}</h4>
                        <p className="text-[10px] text-slate-400">{s.sub}</p>
                      </div>
                    </div>
                    <span className={`text-[9px] font-bold text-${s.color}-400 bg-${s.color}-500/15 px-2 py-0.5 rounded-full`}>{s.status}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* USER APPROVALS TAB */}
        {activeSection === 'approvals' && (
          <div className="space-y-4">
            <div className="glass-panel p-5 border-amber-500/30">
              <div className="flex items-center gap-2 mb-4">
                <UserCheck className="text-amber-400" size={20} />
                <h3 className="text-base font-bold text-white font-display">New User Registration Approvals</h3>
                <span className="text-[10px] font-bold text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/30">
                  {pendingCount} PENDING
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-4">
                New users who register are blocked from accessing the app until approved. Review and approve or reject their applications below.
              </p>

              <div className="space-y-3">
                {pendingUsers.map((user) => (
                  <div key={user.id} className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl border transition-all ${
                    user.status === 'approved' ? 'bg-emerald-500/5 border-emerald-500/30' :
                    user.status === 'rejected' ? 'bg-rose-500/5 border-rose-500/20 opacity-60' :
                    'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-sm font-bold text-indigo-300">
                        {user.username.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">{user.username}</span>
                          <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full ${
                            user.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' :
                            user.status === 'rejected' ? 'bg-rose-500/20 text-rose-400' :
                            'bg-amber-500/20 text-amber-400'
                          }`}>{user.status}</span>
                        </div>
                        <div className="text-[10px] text-slate-400">{user.email} · {user.city} · {user.education}</div>
                        <div className="text-[10px] text-slate-600">Registered: {user.registeredAt}</div>
                      </div>
                    </div>

                    {user.status === 'pending' && (
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleApprove(user.id)}
                          className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 border border-emerald-500/40 hover:border-emerald-400 hover:bg-emerald-500/10 px-3 py-1.5 rounded-xl transition-all"
                        >
                          <CheckCircle2 size={14} /> Approve
                        </button>
                        <button
                          onClick={() => handleReject(user.id)}
                          className="flex items-center gap-1.5 text-xs font-bold text-rose-400 border border-rose-500/40 hover:border-rose-400 hover:bg-rose-500/10 px-3 py-1.5 rounded-xl transition-all"
                        >
                          <XCircle size={14} /> Reject
                        </button>
                      </div>
                    )}

                    {user.status !== 'pending' && (
                      <span className={`text-xs font-bold flex items-center gap-1 ${user.status === 'approved' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {user.status === 'approved' ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                        {user.status === 'approved' ? 'Access Granted' : 'Access Denied'}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* AUDIT LOGS TAB */}
        {activeSection === 'logs' && (
          <div className="glass-panel p-5 space-y-4 border-slate-800">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <FileText className="text-sky-400" size={20} />
                <h3 className="text-base font-bold text-white font-display">System Audit & Activity Logs</h3>
              </div>

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
                  <option value="Study Round">Study Round</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300 border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-bold tracking-wider bg-slate-900/60">
                    <th className="p-3">Log ID & Timestamp</th>
                    <th className="p-3">User Profile</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Action</th>
                    <th className="p-3">Tokens</th>
                    <th className="p-3 text-right">Status</th>
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
        )}
      </div>
    </div>
  );
}
