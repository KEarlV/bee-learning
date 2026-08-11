import React, { useState, useEffect, useCallback } from 'react';
import { Trophy, Flame, Zap, Globe, MapPin, Building, Loader2, RefreshCw } from 'lucide-react';
import BeeAnimatedMascot from './BeeAnimatedMascot';
import { getSupabaseClient } from '../services/supabaseService';
import { getStoredSession } from '../services/authService';

const SCOPES = [
  { id: 'local',         label: 'City',     icon: Building },
  { id: 'national',      label: 'National', icon: MapPin   },
  { id: 'international', label: 'World',    icon: Globe    },
];

const RANK_MEDAL = (r) =>
  r === 1 ? '🥇' : r === 2 ? '🥈' : r === 3 ? '🥉' : `#${r}`;

export default function LeaderboardView() {
  const [scope, setScope]       = useState('local');
  const [entries, setEntries]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const session = getStoredSession();
  const supabase = getSupabaseClient();

  // ── Fetch leaderboard from user_stats ──────────────────────
  const fetchLeaderboard = useCallback(async () => {
    if (!supabase) { setLoading(false); return; }
    setLoading(true);

    let query = supabase
      .from('user_stats')
      .select('user_id, username, total_xp, weekly_xp, current_streak, city_location, country, account_status')
      .eq('account_status', 'approved')
      .order('total_xp', { ascending: false })
      .limit(50);

    // Scope filtering
    if (scope === 'local' && session?.cityLocation) {
      query = query.ilike('city_location', `%${session.cityLocation.split(',')[0]}%`);
    } else if (scope === 'national') {
      query = query.ilike('country', '%Philippines%');
    }
    // international = no filter → everyone

    const { data, error } = await query;
    if (!error && data) {
      setEntries(
        data.map((u, idx) => {
          const userXp = u.total_xp ?? 0;
          let streak = u.current_streak ?? 1;
          if (streak === 5 || userXp < 200 || streak > 30 || !streak) streak = 1;
          return {
            rank:      idx + 1,
            userId:    u.user_id,
            name:      u.username || 'Anonymous',
            location:  u.city_location || u.country || '—',
            xp:        userXp,
            weeklyXp:  u.weekly_xp ?? 0,
            streak:    streak,
            isYou:     u.user_id === session?.userId,
          };
        })
      );
      setLastUpdated(new Date());
    }
    setLoading(false);
  }, [supabase, scope, session?.userId, session?.cityLocation]);

  // Initial load + scope change
  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  // ── Real-time subscription ──────────────────────────────────
  useEffect(() => {
    if (!supabase) return;

    const channel = supabase
      .channel('leaderboard-live')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'user_stats' },
        () => fetchLeaderboard()  // re-fetch on any change
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [supabase, fetchLeaderboard]);

  const youRow = entries.find((e) => e.isYou);

  return (
    <div className="max-w-2xl mx-auto space-y-4 select-none">
      {/* Header */}
      <div className="glass-panel p-4 sm:p-5 border-amber-500/30 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Trophy className="text-amber-400 shrink-0" size={22} />
            <h2 className="text-lg sm:text-xl font-bold text-white font-display truncate">
              Real-Time Leaderboards
            </h2>
            {/* Live pulse */}
            <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
              LIVE
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Earn XP to rank up — updates instantly as users study
          </p>
        </div>
        <BeeAnimatedMascot size="md" animated={true} speechBubble="Aim for #1!" className="shrink-0" />
      </div>

      {/* Scope tabs */}
      <div className="flex bg-slate-900/90 p-1 rounded-2xl border border-slate-800 text-xs gap-1">
        {SCOPES.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => { setScope(id); }}
            className={`flex-1 py-2 font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              scope === id
                ? 'bg-amber-500 text-slate-950 shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Icon size={14} className="shrink-0" />
            <span className="hidden sm:inline">{label}</span>
            <span className="sm:hidden">{label.charAt(0)}</span>
          </button>
        ))}
      </div>

      {/* Last updated + refresh */}
      {lastUpdated && (
        <div className="flex items-center justify-between text-[10px] text-slate-500 px-1">
          <span>Updated {lastUpdated.toLocaleTimeString()}</span>
          <button
            onClick={fetchLeaderboard}
            className="flex items-center gap-1 hover:text-slate-300 transition-colors"
          >
            <RefreshCw size={11} /> Refresh
          </button>
        </div>
      )}

      {/* Your rank banner (if logged in and ranked) */}
      {youRow && (
        <div className="flex items-center justify-between p-3 glass-panel border-sky-400/40 bg-sky-500/10 rounded-2xl text-xs">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sky-300 text-sm">{RANK_MEDAL(youRow.rank)}</span>
            <div className="w-7 h-7 rounded-full bg-sky-500/30 border border-sky-400/50 flex items-center justify-center text-[11px] font-bold text-sky-300">
              {youRow.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <span className="font-bold text-sky-200">{youRow.name}</span>
              <span className="ml-1.5 text-[9px] font-extrabold bg-sky-500 text-white px-1.5 py-0.5 rounded-full">YOU</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-amber-400 font-extrabold">
              <Zap size={13} className="fill-amber-400" /> {youRow.xp} XP
            </span>
            <span className="flex items-center gap-1 text-slate-400">
              <Flame size={13} className="text-amber-500" /> {youRow.streak}d
            </span>
          </div>
        </div>
      )}

      {/* Rankings list */}
      <div className="glass-panel p-3 sm:p-4 space-y-2 border-slate-800">
        {loading ? (
          <div className="flex items-center justify-center py-12 gap-2 text-slate-400 text-xs">
            <Loader2 size={18} className="animate-spin" /> Loading live rankings...
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <p className="text-slate-400 text-sm font-medium">No players ranked yet.</p>
            <p className="text-slate-600 text-xs">
              {scope === 'local'
                ? 'Be the first in your city to study and earn XP!'
                : scope === 'national'
                ? 'No Philippine players yet — start studying to claim #1!'
                : 'No global players yet — lead the world leaderboard!'}
            </p>
            <BeeAnimatedMascot size="md" animated={true} speechBubble="Be first!" className="mx-auto" />
          </div>
        ) : (
          entries.map((item) => (
            <div
              key={item.userId || item.name}
              className={`p-3 sm:p-3.5 rounded-xl border flex items-center justify-between gap-2 transition-all ${
                item.isYou
                  ? 'bg-sky-500/15 border-sky-400/50 shadow-md'
                  : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {/* Rank */}
                <span className={`w-7 shrink-0 text-center font-extrabold text-sm ${
                  item.rank === 1 ? 'text-base' : item.rank > 3 ? 'text-slate-500 text-xs' : ''
                }`}>
                  {RANK_MEDAL(item.rank)}
                </span>

                {/* Avatar initial */}
                <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-[11px] font-bold border ${
                  item.isYou
                    ? 'bg-sky-500/30 border-sky-400/60 text-sky-200'
                    : 'bg-slate-800 border-slate-700 text-slate-300'
                }`}>
                  {item.name.charAt(0).toUpperCase()}
                </div>

                {/* Name + location */}
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5 truncate">
                    <span className="truncate">{item.name}</span>
                    {item.isYou && (
                      <span className="text-[9px] font-extrabold bg-sky-500 text-white px-1.5 py-0.5 rounded-full shrink-0">YOU</span>
                    )}
                  </h4>
                  <span className="text-[10px] text-slate-500 truncate block">{item.location}</span>
                </div>
              </div>

              {/* XP + Streak */}
              <div className="flex items-center gap-2 sm:gap-4 shrink-0 text-xs">
                <span className="flex items-center gap-1 text-amber-400 font-extrabold whitespace-nowrap">
                  <Zap size={13} className="fill-amber-400 shrink-0" />
                  {item.xp.toLocaleString()}
                  <span className="hidden sm:inline"> XP</span>
                </span>
                <span className="hidden sm:flex items-center gap-1 text-slate-400">
                  <Flame size={13} className="text-amber-500 shrink-0" /> {item.streak}d
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
