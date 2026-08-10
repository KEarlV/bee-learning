import React, { useState } from 'react';
import { Trophy, Crown, Flame, Zap, ShieldAlert, Globe, MapPin, Building } from 'lucide-react';
import BeeAnimatedMascot from './BeeAnimatedMascot';

export default function LeaderboardView() {
  const [scope, setScope] = useState('local'); // 'local' | 'national' | 'international'

  const localEntries = [
    { rank: 1, name: 'Alex_Mastery', location: 'Manila, PH', xp: 980, streak: 14, avatar: '/bee_frame_1.png', isUser: false },
    { rank: 2, name: 'Sophia_Brain', location: 'Quezon City, PH', xp: 840, streak: 9, avatar: '/bee_frame_2.png', isUser: false },
    { rank: 3, name: 'You (Bee Learner)', location: 'Manila, PH', xp: 620, streak: 5, avatar: '/bee_frame_4.png', isUser: true },
    { rank: 4, name: 'Juan_Polytech', location: 'Manila, PH', xp: 510, streak: 4, avatar: '/bee_frame_3.png', isUser: false },
  ];

  const nationalEntries = [
    { rank: 1, name: 'Maria_UP_Diliman', location: 'Philippines 🇵🇭', xp: 2450, streak: 28, avatar: '/bee_frame_2.png', isUser: false },
    { rank: 2, name: 'Carlos_UST', location: 'Philippines 🇵🇭', xp: 1980, streak: 21, avatar: '/bee_frame_1.png', isUser: false },
    { rank: 3, name: 'Alex_Mastery', location: 'Philippines 🇵🇭', xp: 980, streak: 14, avatar: '/bee_frame_1.png', isUser: false },
    { rank: 12, name: 'You (Bee Learner)', location: 'Philippines 🇵🇭', xp: 620, streak: 5, avatar: '/bee_frame_4.png', isUser: true },
  ];

  const internationalEntries = [
    { rank: 1, name: 'Kenji_TokyoTech', location: 'Japan 🇯🇵', xp: 4890, streak: 45, avatar: '/bee_frame_1.png', isUser: false },
    { rank: 2, name: 'Elena_Stanford', location: 'United States 🇺🇸', xp: 4120, streak: 38, avatar: '/bee_frame_3.png', isUser: false },
    { rank: 3, name: 'Maria_UP_Diliman', location: 'Philippines 🇵🇭', xp: 2450, streak: 28, avatar: '/bee_frame_2.png', isUser: false },
    { rank: 48, name: 'You (Bee Learner)', location: 'Philippines 🇵🇭', xp: 620, streak: 5, avatar: '/bee_frame_4.png', isUser: true },
  ];

  const activeEntries = scope === 'local' ? localEntries : scope === 'national' ? nationalEntries : internationalEntries;

  return (
    <div className="max-w-4xl mx-auto space-y-5 select-none">
      {/* Header */}
      <div className="glass-panel p-6 border-amber-500/30 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Trophy className="text-amber-400" size={26} />
            <h2 className="text-2xl font-bold text-white font-display">Real-Time Leaderboards</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Rank up in Local, National, and International leagues by earning study XP!
          </p>
        </div>

        <BeeAnimatedMascot size="lg" animated={true} flightPath={true} speechBubble="Aim for #1!" />
      </div>

      {/* Scope Switcher Tabs */}
      <div className="flex bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 text-xs">
        <button
          onClick={() => setScope('local')}
          className={`flex-1 py-2.5 font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
            scope === 'local' ? 'bg-amber-500 text-slate-950 shadow-lg' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Building size={16} />
          Local Scope (City)
        </button>

        <button
          onClick={() => setScope('national')}
          className={`flex-1 py-2.5 font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
            scope === 'national' ? 'bg-amber-500 text-slate-950 shadow-lg' : 'text-slate-400 hover:text-white'
          }`}
        >
          <MapPin size={16} />
          National Scope (🇵🇭 PH)
        </button>

        <button
          onClick={() => setScope('international')}
          className={`flex-1 py-2.5 font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
            scope === 'international' ? 'bg-amber-500 text-slate-950 shadow-lg' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Globe size={16} />
          International Scope (World)
        </button>
      </div>

      {/* Leaderboard Rankings Table */}
      <div className="glass-panel p-4 space-y-2 border-slate-800">
        {activeEntries.map((item) => (
          <div
            key={item.rank + item.name}
            className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
              item.isUser
                ? 'bg-sky-500/20 border-sky-400 shadow-md font-bold'
                : 'bg-slate-900/80 border-slate-800 hover:bg-slate-800/80'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <span className={`w-7 text-center font-extrabold text-sm ${
                item.rank === 1 ? 'text-amber-400 text-base' : item.rank === 2 ? 'text-slate-300' : item.rank === 3 ? 'text-amber-600' : 'text-slate-500'
              }`}>
                {item.rank === 1 ? '🥇' : item.rank === 2 ? '🥈' : item.rank === 3 ? '🥉' : `#${item.rank}`}
              </span>

              <img src={item.avatar} alt="Avatar" className="w-9 h-9 rounded-full bg-slate-800 p-0.5 object-contain" />

              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  {item.name}
                  {item.isUser && (
                    <span className="text-[9px] font-extrabold bg-sky-500 text-white px-1.5 py-0.5 rounded-full">YOU</span>
                  )}
                </h4>
                <span className="text-[10px] text-slate-400 font-medium">{item.location}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1 text-amber-400 font-extrabold">
                <Zap size={14} className="fill-amber-400" /> {item.xp} XP
              </span>
              <span className="flex items-center gap-1 text-slate-400 text-[11px]">
                <Flame size={13} className="text-amber-500" /> {item.streak}d
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
