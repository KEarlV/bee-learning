import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck, Server, Users, Database, Sparkles, Activity, FileText,
  Search, CheckCircle2, XCircle, Clock, Zap, LogOut, UserCheck, Loader2, RefreshCw,
  Mail, Key, Trash2, Shield, Filter, Award
} from 'lucide-react';
import BeeAnimatedMascot from './BeeAnimatedMascot';
import { getAdminSupabaseClient } from '../services/supabaseService';
import { logActivity } from '../services/activityLogService';

export default function AdminPanel({ onLogout }) {
  const [activeSection, setActiveSection] = useState('overview');

  // ── Overview stats ───────────────────────────────────────────
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0 });

  // ── Pending users ────────────────────────────────────────────
  const [pendingUsers, setPendingUsers] = useState([]);
  const [pendingLoading, setPendingLoading] = useState(true);

  // ── All Users directory ──────────────────────────────────────
  const [allUsers, setAllUsers] = useState([]);
  const [allUsersLoading, setAllUsersLoading] = useState(true);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState('all');

  // ── Audit / activity logs ────────────────────────────────────
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const supabase = getAdminSupabaseClient();

  // ── Fetch overview stats ─────────────────────────────────────
  const fetchStats = useCallback(async () => {
    if (!supabase) return;
    const { data } = await supabase.from('user_stats').select('account_status');
    if (data) {
      setStats({
        total: data.length,
        pending: data.filter((u) => u.account_status === 'pending').length,
        approved: data.filter((u) => u.account_status === 'approved').length,
      });
    }
  }, [supabase]);

  // ── Fetch pending users ──────────────────────────────────────
  const fetchPending = useCallback(async () => {
    if (!supabase) return;
    setPendingLoading(true);
    const { data, error } = await supabase
      .from('user_stats')
      .select('user_id, username, email, city_location, education_level, account_status, created_at')
      .order('created_at', { ascending: false });
    if (error) console.error('fetchPending error:', error);
    if (!error && data) setPendingUsers(data);
    setPendingLoading(false);
  }, [supabase]);

  // ── Fetch all users & credentials directory ─────────────────
  const fetchAllUsers = useCallback(async () => {
    if (!supabase) return;
    setAllUsersLoading(true);
    const { data, error } = await supabase
      .from('user_stats')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) console.error('fetchAllUsers error:', error);
    if (!error && data) setAllUsers(data);
    setAllUsersLoading(false);
  }, [supabase]);

  // ── Fetch activity logs ──────────────────────────────────────
  const fetchLogs = useCallback(async () => {
    if (!supabase) return;
    setLogsLoading(true);
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);
    if (error) {
      console.error('fetchLogs error:', error.message);
      // Table might not exist yet
      if (error.code === '42P01') {
        console.warn('activity_logs table does not exist in Supabase. Run the SQL to create it.');
      }
    }
    if (!error && data) setLogs(data);
    setLogsLoading(false);
  }, [supabase]);

  // ── Initial load ─────────────────────────────────────────────
  useEffect(() => {
    fetchStats();
    fetchPending();
    fetchAllUsers();
    fetchLogs();
  }, [fetchStats, fetchPending, fetchAllUsers, fetchLogs]);

  // ── Realtime subscriptions ───────────────────────────────────
  useEffect(() => {
    if (!supabase) return;

    const usersSub = supabase
      .channel('admin-users-watch')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_stats' }, () => {
        fetchStats();
        fetchPending();
        fetchAllUsers();
      })
      .subscribe();

    const logsSub = supabase
      .channel('admin-logs-watch')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'activity_logs' }, (payload) => {
        setLogs((prev) => [payload.new, ...prev]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(usersSub);
      supabase.removeChannel(logsSub);
    };
  }, [supabase, fetchStats, fetchPending, fetchAllUsers]);

  // ── Approve / Reject handlers ────────────────────────────────
  const handleApprove = async (userId, username) => {
    if (!supabase) return;
    await supabase
      .from('user_stats')
      .update({ account_status: 'approved', approved_at: new Date().toISOString() })
      .eq('user_id', userId);
    logActivity('User Approved', 'Admin', { userId, username: username || 'Unknown', status: 'SUCCESS' });
    setPendingUsers((prev) =>
      prev.map((u) => (u.user_id === userId ? { ...u, account_status: 'approved' } : u))
    );
    setAllUsers((prev) =>
      prev.map((u) => (u.user_id === userId ? { ...u, account_status: 'approved' } : u))
    );
    fetchStats();
  };

  const handleReject = async (userId) => {
    if (!supabase) return;
    await supabase
      .from('user_stats')
      .update({ account_status: 'rejected' })
      .eq('user_id', userId);
    setPendingUsers((prev) =>
      prev.map((u) => (u.user_id === userId ? { ...u, account_status: 'rejected' } : u))
    );
    setAllUsers((prev) =>
      prev.map((u) => (u.user_id === userId ? { ...u, account_status: 'rejected' } : u))
    );
    fetchStats();
  };

  const handleToggleRole = async (userId, currentRole) => {
    if (!supabase) return;
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    await supabase.from('user_stats').update({ role: newRole }).eq('user_id', userId);
    setAllUsers((prev) =>
      prev.map((u) => (u.user_id === userId ? { ...u, role: newRole } : u))
    );
  };

  const handleDeleteUser = async (userId, username) => {
    if (!supabase) return;
    if (!window.confirm(`Are you sure you want to delete user "${username || userId}"? This action cannot be undone.`)) return;
    await supabase.from('user_stats').delete().eq('user_id', userId);
    setAllUsers((prev) => prev.filter((u) => u.user_id !== userId));
    setPendingUsers((prev) => prev.filter((u) => u.user_id !== userId));
    fetchStats();
  };

  const filteredUsers = allUsers.filter((u) => {
    const matchesSearch =
      (u.username || '').toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      (u.city_location || '').toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      (u.user_id || '').toLowerCase().includes(userSearchQuery.toLowerCase());
    const matchesStatus =
      userStatusFilter === 'all' || u.account_status === userStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredLogs = logs.filter((log) =>
    (log.username || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (log.action || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (log.category || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingCount = pendingUsers.filter((u) => u.account_status === 'pending').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans select-none">
      {/* Topbar */}
      <header className="h-14 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800/80 px-6 flex items-center justify-between z-40">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-indigo-500/20 border border-indigo-500/30">
            <ShieldCheck className="text-indigo-400" size={18} />
          </div>
          <div>
            <span className="font-extrabold text-sm text-white font-display">BEE AI — Admin Control Panel</span>
            <span className="text-[10px] text-slate-400 block">Real-time oversight · User credentials · Audit logs</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
            LIVE
          </div>
          <BeeAnimatedMascot size="sm" animated={true} />
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 border border-rose-500/30 hover:border-rose-400 px-3 py-1.5 rounded-xl transition-all"
          >
            <LogOut size={14} /> Logout
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-slate-800 bg-slate-900/50 px-6 flex gap-1 overflow-x-auto">
        {[
          { id: 'overview', label: '📊 Overview' },
          { id: 'users', label: `👥 User Directory & Credentials (${stats.total})` },
          { id: 'approvals', label: `👤 Pending Approvals${pendingCount > 0 ? ` (${pendingCount})` : ''}` },
          { id: 'logs', label: '📋 Activity Logs' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id)}
            className={`text-xs font-semibold px-4 py-3 border-b-2 whitespace-nowrap transition-all ${
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

        {/* ── OVERVIEW ── */}
        {activeSection === 'overview' && (
          <div className="space-y-5">
            <div className="glass-panel p-5 border-indigo-500/30 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white font-display">System Admin & Accounting Panel</h2>
                <p className="text-xs text-slate-400 mt-0.5">Live Supabase data — updates in real-time as users interact.</p>
              </div>
              <span className="text-[9px] font-extrabold uppercase px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                SYSTEM ONLINE
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="glass-panel p-4 space-y-2 border-sky-500/30">
                <div className="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase"><Users size={15} /> Total Users</div>
                <p className="text-3xl font-extrabold text-white font-display">{stats.total}</p>
                <span className="text-[10px] text-sky-300 font-semibold bg-sky-500/10 px-2 py-0.5 rounded-full inline-block">Supabase Live</span>
              </div>

              <div className="glass-panel p-4 space-y-2 border-amber-500/30">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase"><Clock size={15} /> Pending Approvals</div>
                <p className="text-3xl font-extrabold text-white font-display">{stats.pending}</p>
                <span className="text-[10px] text-amber-300 font-semibold bg-amber-500/10 px-2 py-0.5 rounded-full inline-block">Awaiting review</span>
              </div>

              <div className="glass-panel p-4 space-y-2 border-emerald-500/30">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase"><UserCheck size={15} /> Approved Users</div>
                <p className="text-3xl font-extrabold text-white font-display">{stats.approved}</p>
                <span className="text-[10px] text-emerald-300 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full inline-block">Active access</span>
              </div>
            </div>

            {/* System Statuses */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { label: 'Google Gemini API', sub: 'Pre-Configured Key Active', status: 'HEALTHY', borderCls: 'border-emerald-500/30', textCls: 'text-emerald-400', bgCls: 'bg-emerald-500/15', icon: Server },
                { label: 'Supabase PostgreSQL', sub: 'Realtime WebSocket Sync', status: 'CONNECTED', borderCls: 'border-emerald-500/30', textCls: 'text-emerald-400', bgCls: 'bg-emerald-500/15', icon: Database },
                { label: 'IndexedDB Storage', sub: 'Offline Fallback Engine', status: 'ACTIVE', borderCls: 'border-sky-500/30', textCls: 'text-sky-400', bgCls: 'bg-sky-500/15', icon: Activity },
              ].map((s, i) => {
                const Icon = s.icon;
                return (
                  <div key={i} className={`glass-panel p-3.5 flex items-center justify-between ${s.borderCls}`}>
                    <div className="flex items-center gap-2.5">
                      <Icon size={18} className={s.textCls} />
                      <div>
                        <h4 className="text-xs font-bold text-white">{s.label}</h4>
                        <p className="text-[10px] text-slate-400">{s.sub}</p>
                      </div>
                    </div>
                    <span className={`text-[9px] font-bold ${s.textCls} ${s.bgCls} px-2 py-0.5 rounded-full`}>{s.status}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── USER DIRECTORY & CREDENTIALS ── */}
        {activeSection === 'users' && (
          <div className="glass-panel p-5 border-indigo-500/30 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Users className="text-indigo-400" size={20} />
                <h3 className="text-base font-bold text-white font-display">User Accounts & Credentials Directory</h3>
                <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/15 px-2 py-0.5 rounded-full border border-indigo-500/30">
                  ADMIN RESTRICTED
                </span>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-56">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                  <input
                    type="text"
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    placeholder="Search user, email, ID..."
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white outline-none"
                  />
                </div>
                <select
                  value={userStatusFilter}
                  onChange={(e) => setUserStatusFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-2.5 py-1.5 text-xs outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </select>
                <button onClick={fetchAllUsers} className="btn-icon w-7 h-7 text-slate-400 hover:text-slate-200">
                  <RefreshCw size={14} />
                </button>
              </div>
            </div>
            <p className="text-xs text-slate-400">
              Only admins can view registered user credentials, email addresses, study metrics, and manage permissions.
            </p>

            {allUsersLoading ? (
              <div className="flex items-center justify-center py-10 gap-2 text-slate-400 text-xs">
                <Loader2 size={16} className="animate-spin" /> Fetching registered users...
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-sm">No matching users found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300 border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-bold tracking-wider bg-slate-900/60">
                      <th className="p-3">User & Credentials</th>
                      <th className="p-3">Location & Focus</th>
                      <th className="p-3">Stats & Level</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Role</th>
                      <th className="p-3 text-right">Admin Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredUsers.map((user) => (
                      <tr key={user.user_id} className="hover:bg-slate-900/50 transition-colors">
                        <td className="p-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-xs font-bold text-indigo-300 shrink-0">
                              {(user.username || '?').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <span className="font-bold text-white block">{user.username || '—'}</span>
                              <span className="text-[10px] text-indigo-300 flex items-center gap-1 font-mono">
                                <Mail size={11} className="text-indigo-400 shrink-0" />
                                {user.email || 'No email registered'}
                              </span>
                              <span className="text-[9px] text-slate-600 font-mono block">
                                ID: {user.user_id}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="text-slate-200 font-medium block">{user.city_location || '—'}</span>
                          <span className="text-[10px] text-slate-400 block">{user.education_level || '—'}</span>
                          <span className="text-[10px] text-sky-400 block">{user.target_exam || 'General'}</span>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <span className="text-amber-400 font-bold flex items-center gap-0.5">
                              <Zap size={12} className="fill-amber-400" /> {user.total_xp || 0} XP
                            </span>
                            <span className="text-slate-400 text-[10px]">
                              Lvl {user.level || 1}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500 block">
                            🔥 {user.current_streak || 0}d streak · {user.cards_mastered || 0} mastered
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full inline-block ${
                            user.account_status === 'approved' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                            user.account_status === 'rejected' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                            'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}>
                            {user.account_status || 'pending'}
                          </span>
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => handleToggleRole(user.user_id, user.role)}
                            className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border transition-all flex items-center gap-1 ${
                              user.role === 'admin'
                                ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 hover:border-purple-300'
                                : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500'
                            }`}
                            title="Click to toggle user/admin role"
                          >
                            <Shield size={10} />
                            {user.role || 'user'}
                          </button>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {user.account_status !== 'approved' && (
                              <button
                                onClick={() => handleApprove(user.user_id)}
                                className="p-1 rounded-lg text-emerald-400 hover:bg-emerald-500/10 border border-emerald-500/30"
                                title="Approve Access"
                              >
                                <CheckCircle2 size={15} />
                              </button>
                            )}
                            {user.account_status !== 'rejected' && (
                              <button
                                onClick={() => handleReject(user.user_id)}
                                className="p-1 rounded-lg text-amber-400 hover:bg-amber-500/10 border border-amber-500/30"
                                title="Reject Access"
                              >
                                <XCircle size={15} />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteUser(user.user_id, user.username)}
                              className="p-1 rounded-lg text-rose-400 hover:bg-rose-500/10 border border-rose-500/30 transition-all"
                              title="Delete Account"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── USER APPROVALS ── */}
        {activeSection === 'approvals' && (
          <div className="glass-panel p-5 border-amber-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck className="text-amber-400" size={20} />
                <h3 className="text-base font-bold text-white font-display">New User Registrations</h3>
                {pendingCount > 0 && (
                  <span className="text-[10px] font-bold text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/30">
                    {pendingCount} PENDING
                  </span>
                )}
              </div>
              <button onClick={fetchPending} className="btn-icon w-7 h-7 text-slate-400 hover:text-slate-200">
                <RefreshCw size={14} />
              </button>
            </div>
            <p className="text-xs text-slate-400">
              Users who register are <strong className="text-amber-300">blocked</strong> until you approve them. Their data comes live from Supabase.
            </p>

            {pendingLoading ? (
              <div className="flex items-center justify-center py-10 gap-2 text-slate-400 text-xs">
                <Loader2 size={16} className="animate-spin" /> Loading from Supabase...
              </div>
            ) : pendingUsers.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-sm">No registered users yet.</div>
            ) : (
              <div className="space-y-3">
                {pendingUsers.map((user) => (
                  <div
                    key={user.user_id}
                    className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl border transition-all ${
                      user.account_status === 'approved' ? 'bg-emerald-500/5 border-emerald-500/30' :
                      user.account_status === 'rejected' ? 'bg-rose-500/5 border-rose-500/20 opacity-60' :
                      'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-sm font-bold text-indigo-300">
                        {(user.username || '?').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">{user.username || '—'}</span>
                          <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full ${
                            user.account_status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' :
                            user.account_status === 'rejected' ? 'bg-rose-500/20 text-rose-400' :
                            'bg-amber-500/20 text-amber-400'
                          }`}>{user.account_status}</span>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {user.email || 'No email'} · {user.city_location || '—'} · {user.education_level || '—'}
                        </div>
                        <div className="text-[10px] text-slate-600">
                          Registered: {user.created_at ? new Date(user.created_at).toLocaleString() : '—'}
                        </div>
                      </div>
                    </div>

                    {user.account_status === 'pending' && (
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleApprove(user.user_id)}
                          className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 border border-emerald-500/40 hover:border-emerald-400 hover:bg-emerald-500/10 px-3 py-1.5 rounded-xl transition-all"
                        >
                          <CheckCircle2 size={14} /> Approve
                        </button>
                        <button
                          onClick={() => handleReject(user.user_id)}
                          className="flex items-center gap-1.5 text-xs font-bold text-rose-400 border border-rose-500/40 hover:border-rose-400 hover:bg-rose-500/10 px-3 py-1.5 rounded-xl transition-all"
                        >
                          <XCircle size={14} /> Reject
                        </button>
                      </div>
                    )}

                    {user.account_status !== 'pending' && (
                      <span className={`text-xs font-bold flex items-center gap-1 ${user.account_status === 'approved' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {user.account_status === 'approved' ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                        {user.account_status === 'approved' ? 'Access Granted' : 'Access Denied'}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── ACTIVITY LOGS ── */}
        {activeSection === 'logs' && (
          <div className="glass-panel p-5 space-y-4 border-slate-800">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <FileText className="text-sky-400" size={20} />
                <h3 className="text-base font-bold text-white font-display">Activity Logs</h3>
                <div className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                  Live
                </div>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-56">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search user, action..."
                    className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white outline-none"
                  />
                </div>
                <button onClick={fetchLogs} className="btn-icon w-7 h-7 text-slate-400 hover:text-slate-200">
                  <RefreshCw size={14} />
                </button>
              </div>
            </div>

            {logsLoading ? (
              <div className="flex items-center justify-center py-10 gap-2 text-slate-400 text-xs">
                <Loader2 size={16} className="animate-spin" /> Loading logs from Supabase...
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="text-center py-10 space-y-2">
                <p className="text-slate-500 text-sm">No activity logs yet.</p>
                <p className="text-slate-600 text-xs">
                  To enable logging, create an <code className="text-sky-400">activity_logs</code> table in Supabase.<br />
                  See the SQL below:
                </p>
                <pre className="text-left bg-slate-900 border border-slate-800 rounded-xl p-3 text-[10px] text-slate-400 inline-block mt-2">
{`CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  username VARCHAR(100),
  action TEXT,
  category VARCHAR(100),
  tokens_used INT DEFAULT 0,
  status VARCHAR(30) DEFAULT 'SUCCESS',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_logs;`}
                </pre>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300 border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-bold tracking-wider bg-slate-900/60">
                      <th className="p-3">Timestamp</th>
                      <th className="p-3">User</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Action</th>
                      <th className="p-3">Tokens</th>
                      <th className="p-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-900/50 transition-colors">
                        <td className="p-3 text-[10px] text-slate-500 whitespace-nowrap">{new Date(log.created_at).toLocaleString()}</td>
                        <td className="p-3 font-semibold text-slate-200 whitespace-nowrap">{log.username || '—'}</td>
                        <td className="p-3">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 whitespace-nowrap">
                            {log.category || '—'}
                          </span>
                        </td>
                        <td className="p-3 text-slate-300">{log.action || '—'}</td>
                        <td className="p-3 font-mono text-purple-300">{log.tokens_used ? `${log.tokens_used} tk` : '—'}</td>
                        <td className="p-3 text-right">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            log.status === 'SUCCESS'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                          }`}>
                            {log.status === 'SUCCESS' ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
                            {log.status || 'SUCCESS'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
