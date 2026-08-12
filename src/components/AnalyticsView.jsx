import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart3, TrendingUp, Brain, CheckCircle2, Zap, Flame,
  Trophy, Star, Calendar, RefreshCw, Loader2
} from 'lucide-react';
import BeeAnimatedMascot from './BeeAnimatedMascot';
import { getSupabaseClient } from '../services/supabaseService';
import { getStoredSession } from '../services/authService';
import { logActivity } from '../services/activityLogService';
import { calculateStreak } from '../utils/streakUtils';

// ── XP → Level calculation ─────────────────────────────────
// Level 1 = 0 XP, each level needs 100 more XP than last
// L1: 0, L2: 100, L3: 300, L4: 600, L5: 1000 …
function xpToLevel(totalXp) {
  let level = 1;
  let threshold = 0;
  let step = 100;
  while (totalXp >= threshold + step) {
    threshold += step;
    step += 50;
    level++;
  }
  const xpIntoLevel = totalXp - threshold;
  const xpNeeded = step;
  return { level, xpIntoLevel, xpNeeded, threshold };
}

const LEVEL_LABELS = [
  '', 'Novice Bee', 'Apprentice', 'Scholar', 'Analyst',
  'Expert', 'Master', 'Grand Master', 'Sage', 'Legend', 'Infinite Mind'
];
function levelLabel(lvl) {
  return LEVEL_LABELS[Math.min(lvl, LEVEL_LABELS.length - 1)];
}

const TIER_COLORS = {
  Bronze:   'text-amber-700  bg-amber-900/30  border-amber-700/40',
  Silver:   'text-slate-300  bg-slate-700/30  border-slate-400/40',
  Gold:     'text-amber-400  bg-amber-500/20  border-amber-500/40',
  Platinum: 'text-sky-300    bg-sky-500/20    border-sky-400/40',
  Diamond:  'text-indigo-300 bg-indigo-500/20 border-indigo-400/40',
};

// ── Daily login XP award ───────────────────────────────────
const DAILY_LOGIN_XP = 25;
const LOGIN_DATE_KEY = 'bee_last_login_xp_date';

import { getTierInfo } from '../utils/tierSystem';

export default function AnalyticsView() {
  const [stats, setStats]       = useState(null);
  const [loading, setLoading]   = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [dailyXpAwarded, setDailyXpAwarded] = useState(false);

  const session  = getStoredSession();
  const supabase = getSupabaseClient();

  // ── Fetch user stats from Supabase ─────────────────────────
  const fetchStats = useCallback(async () => {
    if (!supabase || !session?.userId) { setLoading(false); return; }

    const { data, error } = await supabase
      .from('user_stats')
      .select(`
        user_id, username, total_xp, weekly_xp, level,
        current_streak, longest_streak, cards_mastered,
        cards_studied_today, daily_goal_target,
        predicted_exam_score, league_tier, created_at
      `)
      .eq('user_id', session.userId)
      .single();

    if (!error && data) {
      setStats(data);
      setLastUpdated(new Date());
    }
    setLoading(false);
  }, [supabase, session?.userId]);

  // ── Award daily login XP (once per calendar day) ──────────
  const awardDailyLoginXp = useCallback(async () => {
    if (!supabase || !session?.userId) return;

    const today = new Date().toDateString();
    const lastDate = localStorage.getItem(LOGIN_DATE_KEY);
    if (lastDate === today) return; // already awarded today

    // Fetch current XP + streak
    const { data: current } = await supabase
      .from('user_stats')
      .select('total_xp, weekly_xp, current_streak, longest_streak, last_active_date')
      .eq('user_id', session.userId)
      .single();

    if (!current) return;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const lastActiveStr = current.last_active_date;
    const wasYesterday = lastActiveStr &&
      new Date(lastActiveStr).toDateString() === yesterday.toDateString();

    const newStreak = wasYesterday ? (current.current_streak || 0) + 1 : 1;
    const bonusXp   = Math.min(newStreak * 5, 50); // streak bonus up to +50
    const totalBonus = DAILY_LOGIN_XP + bonusXp;
    const newXp      = (current.total_xp || 0) + totalBonus;
    const { level: newLevel } = xpToLevel(newXp);

    await supabase
      .from('user_stats')
      .update({
        total_xp:        newXp,
        weekly_xp:       (current.weekly_xp || 0) + totalBonus,
        current_streak:  newStreak,
        longest_streak:  Math.max(newStreak, current.longest_streak || 0),
        last_active_date: new Date().toISOString().split('T')[0],
        level:           newLevel,
      })
      .eq('user_id', session.userId);

    localStorage.setItem(LOGIN_DATE_KEY, today);
    setDailyXpAwarded(true);

    logActivity('Daily Login XP', 'Rewards', {
      userId:   session.userId,
      username: session.username,
      tokens:   totalBonus,
    });

    // Re-fetch to show updated stats
    setTimeout(fetchStats, 400);
  }, [supabase, session?.userId, session?.username, fetchStats]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    if (session?.userId) awardDailyLoginXp();
  }, [session?.userId, awardDailyLoginXp]);

  // ── Real-time subscription ─────────────────────────────────
  useEffect(() => {
    if (!supabase || !session?.userId) return;

    const channel = supabase
      .channel(`analytics-${session.userId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'user_stats', filter: `user_id=eq.${session.userId}` },
        () => fetchStats()
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [supabase, session?.userId, fetchStats]);

  // ── Derived stats ──────────────────────────────────────────
  const totalXp    = stats?.total_xp || 0;
  const weeklyXp   = stats?.weekly_xp || 0;
  const { level, xpIntoLevel, xpNeeded } = xpToLevel(totalXp);
  const lvlPct     = Math.round((xpIntoLevel / xpNeeded) * 100);
  const streak     = calculateStreak(stats?.current_streak, stats?.last_active_date, stats?.created_at);
  const longestStreak = Math.max(streak, stats?.longest_streak || 0);
  const mastered   = stats?.cards_mastered || 0;
  const examScore  = stats?.predicted_exam_score || 0;
  const tierInfo   = getTierInfo(totalXp);

  // Retention forecast based on streak (realistic, starts at 50% day 1)
  const retentionBars = [
    { day: 'Day 1', pct: Math.min(50 + streak * 2, 98) },
    { day: 'Day 3', pct: Math.min(44 + streak * 2, 94) },
    { day: 'Day 7', pct: Math.min(38 + streak * 2, 90) },
    { day: 'Day 14', pct: Math.min(32 + streak * 2, 86) },
    { day: 'Day 30', pct: Math.min(26 + streak * 2, 84) },
  ];

  // Days since joined
  const daysSince = stats?.created_at
    ? Math.max(1, Math.floor((Date.now() - new Date(stats.created_at)) / 86400000) + 1)
    : 1;

  if (!session?.userId) {
    return (
      <div className="max-w-2xl mx-auto flex flex-col items-center justify-center py-20 space-y-4 text-center">
        <BeeAnimatedMascot size="lg" animated={true} speechBubble="Sign in to see your progress!" className="mx-auto" />
        <h2 className="text-xl font-bold text-white font-display">Sign In to Track Your Progress</h2>
        <p className="text-sm text-slate-400">Your analytics, XP, and streak are synced live once you log in.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-5 select-none">

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="glass-panel p-4 sm:p-5 border-sky-500/30 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <BarChart3 className="text-sky-400 shrink-0" size={22} />
            <h2 className="text-lg sm:text-2xl font-bold text-white font-display truncate">
              Study Analytics
            </h2>
            <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
              LIVE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Day {daysSince} of your learning journey — keep the streak alive!
          </p>
        </div>
        <BeeAnimatedMascot size="md" animated={true} speechBubble={`Level ${level}!`} className="shrink-0" />
      </div>

      {/* ── Daily Login XP Banner ──────────────────────────── */}
      {dailyXpAwarded && (
        <div className="glass-panel p-3.5 border-amber-500/40 bg-amber-500/10 flex items-center justify-between gap-3 animate-pulse-once">
          <div className="flex items-center gap-2.5">
            <Zap size={20} className="text-amber-400 fill-amber-400 shrink-0" />
            <div>
              <p className="text-sm font-bold text-amber-300">Daily Login Bonus!</p>
              <p className="text-[10px] text-amber-400/80">+{DAILY_LOGIN_XP} XP + streak bonus awarded for today</p>
            </div>
          </div>
          <span className="text-xl font-extrabold text-amber-300">🎉</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20 gap-2 text-slate-400 text-xs">
          <Loader2 size={18} className="animate-spin" /> Loading your analytics...
        </div>
      ) : (
        <>
          {/* ── Level & XP Progress ─────────────────────────── */}
          <div className="glass-panel p-4 sm:p-5 border-indigo-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Star size={16} className="text-amber-400 fill-amber-400 shrink-0" />
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Level {level} — {levelLabel(level)}
                  </span>
                </div>
                <p className="text-2xl sm:text-3xl font-extrabold text-white font-display mt-1">
                  {totalXp.toLocaleString()} <span className="text-lg text-amber-400">XP</span>
                </p>
                <p className="text-[10px] text-slate-500">
                  {xpIntoLevel} / {xpNeeded} XP to Level {level + 1}
                </p>
              </div>
              <div className={`text-center px-3 py-2 rounded-xl border text-xs font-bold ${tierInfo.color}`}>
                <Trophy size={16} className="mx-auto mb-0.5" />
                {tierInfo.badge}
              </div>
            </div>

            {/* XP Progress bar */}
            <div className="space-y-1">
              <div className="h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 via-sky-400 to-amber-400 rounded-full transition-all duration-700"
                  style={{ width: `${lvlPct}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>Level {level}</span>
                <span>{lvlPct}% to Level {level + 1}</span>
              </div>
            </div>
          </div>

          {/* ── Top Metrics Grid ─────────────────────────────── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            {[
              {
                label: 'Weekly XP',
                value: weeklyXp.toLocaleString(),
                sub: 'This week',
                icon: Zap,
                color: 'border-amber-500/30 text-amber-400',
                bg: 'bg-amber-500/10',
              },
              {
                label: 'Day Streak',
                value: `${streak}d`,
                sub: `Best: ${longestStreak}d`,
                icon: Flame,
                color: 'border-rose-500/30 text-rose-400',
                bg: 'bg-rose-500/10',
              },
              {
                label: 'Cards Mastered',
                value: mastered,
                sub: 'Long-term memory',
                icon: CheckCircle2,
                color: 'border-emerald-500/30 text-emerald-400',
                bg: 'bg-emerald-500/10',
              },
              {
                label: 'Exam Readiness',
                value: `${Math.round(examScore)}%`,
                sub: examScore >= 75 ? '✓ Passing' : 'Keep studying',
                icon: TrendingUp,
                color: 'border-sky-500/30 text-sky-400',
                bg: 'bg-sky-500/10',
              },
            ].map(({ label, value, sub, icon: Icon, color, bg }) => (
              <div key={label} className={`glass-panel p-3 sm:p-4 border ${color} text-center space-y-1.5`}>
                <div className={`w-8 h-8 rounded-xl ${bg} flex items-center justify-center mx-auto`}>
                  <Icon size={16} className={color.split(' ')[1]} />
                </div>
                <p className="text-xl sm:text-2xl font-extrabold text-white font-display">{value}</p>
                <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
                <p className="text-[9px] text-slate-500">{sub}</p>
              </div>
            ))}
          </div>

          {/* ── Retention Forecast Chart ─────────────────────── */}
          <div className="glass-panel p-4 sm:p-5 space-y-4 border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Brain size={16} className="text-indigo-400" />
                Ebbinghaus Retention Forecast
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Estimated based on your Day {daysSince} streak of {streak} day{streak !== 1 ? 's' : ''}.
                Keep studying to raise retention!
              </p>
            </div>

            <div className="h-36 sm:h-44 bg-slate-900/90 rounded-2xl border border-slate-800 p-3 sm:p-4 flex items-end justify-between gap-2 sm:gap-3">
              {retentionBars.map((bar, idx) => {
                const colors = ['bg-emerald-500','bg-emerald-400','bg-sky-400','bg-sky-500','bg-indigo-400'];
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                    <span className="text-[10px] sm:text-[11px] font-bold text-slate-300">{bar.pct}%</span>
                    <div
                      className={`w-full ${colors[idx]} rounded-t-lg transition-all duration-700`}
                      style={{ height: `${bar.pct}%` }}
                    />
                    <span className="text-[9px] sm:text-[10px] text-slate-500 font-medium">{bar.day}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Progress Timeline ─────────────────────────────── */}
          <div className="glass-panel p-4 sm:p-5 border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Calendar size={15} className="text-sky-400" />
              Your Journey — Day {daysSince}
            </h3>
            <div className="space-y-2">
              {[
                { day: 1,  label: 'Joined BEE 🐝',              done: daysSince >= 1  },
                { day: 3,  label: '3-Day Streak Unlocked 🔥',    done: streak >= 3     },
                { day: 7,  label: 'Silver Tier Eligible 🥈',     done: streak >= 7     },
                { day: 14, label: 'Gold Tier Eligible 🥇',       done: streak >= 14    },
                { day: 30, label: 'Platinum Legend 💎',          done: streak >= 30    },
              ].map(({ day, label, done }) => (
                <div key={day} className={`flex items-center gap-3 p-2.5 rounded-xl border text-xs transition-all ${
                  done
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-slate-900/40 border-slate-800 text-slate-500'
                }`}>
                  <CheckCircle2 size={14} className={done ? 'text-emerald-400 shrink-0' : 'text-slate-700 shrink-0'} />
                  <span className="font-semibold">Day {day}</span>
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Last updated footer */}
          {lastUpdated && (
            <div className="flex items-center justify-between text-[10px] text-slate-600 px-1">
              <span>Last synced: {lastUpdated.toLocaleTimeString()}</span>
              <button onClick={fetchStats} className="flex items-center gap-1 hover:text-slate-400 transition-colors">
                <RefreshCw size={10} /> Refresh
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
