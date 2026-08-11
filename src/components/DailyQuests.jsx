import React, { useState } from 'react';
import { Gift, Zap, CheckCircle2, Flame, Award, ArrowRight } from 'lucide-react';
import { soundService } from '../services/soundService';

export default function DailyQuests({ userStats, onClaimXp }) {
  const todayKey = `daily_login_claimed_${new Date().toISOString().split('T')[0]}`;
  const [claimedLogin, setClaimedLogin] = useState(() => localStorage.getItem(todayKey) === 'true');

  const handleClaimLogin = () => {
    if (claimedLogin) return;
    setClaimedLogin(true);
    localStorage.setItem(todayKey, 'true');
    soundService.playRoundCompleteFanfare();
    if (onClaimXp) onClaimXp(50);
  };

  const cardsToday = userStats?.cardsStudiedToday ?? 0;

  const quests = [
    {
      id: 'quest-login',
      title: 'Daily Login Reward',
      reward: 50,
      progress: 1,
      target: 1,
      completed: claimedLogin,
      canClaim: !claimedLogin,
      onClaim: handleClaimLogin
    },
    {
      id: 'quest-cards',
      title: 'Review 10 Flashcards Today',
      reward: 75,
      progress: Math.min(10, cardsToday),
      target: 10,
      completed: cardsToday >= 10,
      canClaim: false
    },
    {
      id: 'quest-askbee',
      title: 'Ask Bee 2 Study Questions',
      reward: 60,
      progress: 1,
      target: 2,
      completed: false,
      canClaim: false
    },
    {
      id: 'quest-feynman',
      title: 'Complete 1 Feynman Explanation',
      reward: 100,
      progress: 0,
      target: 1,
      completed: false,
      canClaim: false
    }
  ];

  const totalAvailableXp = quests.reduce((acc, q) => (!q.completed ? acc + q.reward : acc), 0);

  return (
    <div className="glass-panel p-5 space-y-4 border-amber-500/30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Gift className="text-amber-400" size={22} />
          <div>
            <h3 className="text-base font-bold text-white font-display">Daily Quests & XP Rewards</h3>
            <p className="text-xs text-slate-400">Complete quests daily to earn XP and rank up!</p>
          </div>
        </div>

        <span className="text-xs font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-3 py-1 rounded-full flex items-center gap-1">
          <Zap size={14} className="fill-amber-400" /> +{totalAvailableXp} XP Available
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {quests.map((q) => (
          <div
            key={q.id}
            className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between gap-3"
          >
            <div className="space-y-1 flex-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-200">{q.title}</span>
                <span className="font-extrabold text-amber-400">+{q.reward} XP</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-sky-400 transition-all duration-300"
                  style={{ width: `${Math.min(100, (q.progress / q.target) * 100)}%` }}
                />
              </div>

              <span className="text-[10px] text-slate-500 font-mono">
                {q.progress} / {q.target} {q.completed ? '✓ Completed' : ''}
              </span>
            </div>

            {q.canClaim ? (
              <button
                onClick={q.onClaim}
                className="btn-primary text-xs py-1.5 px-3 shrink-0 animate-bounce"
              >
                Claim XP
              </button>
            ) : q.completed ? (
              <span className="text-emerald-400 text-xs font-bold flex items-center gap-1 shrink-0">
                <CheckCircle2 size={16} /> Claimed
              </span>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

