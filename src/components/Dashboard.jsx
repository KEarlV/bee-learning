import React, { useState, useEffect } from 'react';
import { BookOpen, Sparkles, Trophy, Play, Plus, Flame, Heart, Clock, Trash2, Zap } from 'lucide-react';
import BeeAnimatedMascot from './BeeAnimatedMascot';
import DailyQuests from './DailyQuests';
import StreakCalendarModal from './StreakCalendarModal';
import { db } from '../services/storageService';


export default function Dashboard({ userStats, onStartSession, onOpenScan, onNavigateTab, onClaimXp }) {
  const [decks, setDecks] = useState([]);
  const [streakModalOpen, setStreakModalOpen] = useState(false);


  useEffect(() => {
    async function loadDecks() {
      const list = await db.decks.toArray();
      const enriched = await Promise.all(
        list.map(async (d) => {
          const cardCount = await db.cards.where('deckId').equals(d.id).count();
          return { ...d, cardCount };
        })
      );
      setDecks(enriched);
    }
    loadDecks();
  }, []);

  const handleDeleteDeck = async (deckId, e) => {
    e.stopPropagation();
    if (window.confirm('Delete this deck?')) {
      await db.decks.delete(deckId);
      await db.cards.where('deckId').equals(deckId).delete();
      setDecks(decks.filter((d) => d.id !== deckId));
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6 select-none">
      {/* Welcome Hero Banner */}
      <div className="glass-panel p-4 sm:p-5 border-sky-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 relative overflow-hidden">
        <div className="space-y-2 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 bg-sky-500/10 px-2.5 py-0.5 rounded-full border border-sky-500/20">
              Daily Login Bonus Ready!
            </span>
            <button
              onClick={() => setStreakModalOpen(true)}
              className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20 hover:border-amber-400 flex items-center gap-1 cursor-pointer transition-all active:scale-95"
            >
              <Flame size={12} className="fill-amber-400" /> {userStats?.currentStreak ?? 1} Day Streak
            </button>

          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-white font-display">
            Ready to Review with Bee?
          </h1>
          <p className="text-xs text-slate-300 max-w-md">
            Complete daily study quests to earn XP and rank up on Local, National, & International Leaderboards!
          </p>

          <div className="pt-1 flex flex-wrap justify-center sm:justify-start gap-2.5">
            <button onClick={onOpenScan} className="btn-primary text-xs py-1.5 px-3">
              <Sparkles size={14} />
              AI Scan Document
            </button>
            <button onClick={() => onNavigateTab('leaderboard')} className="btn-secondary text-xs py-1.5 px-3">
              <Trophy size={14} className="text-amber-400" />
              Leaderboards
            </button>
          </div>
        </div>

        {/* Live Animated Bee Mascot */}
        <div className="shrink-0">
          <BeeAnimatedMascot size="lg" animated={true} flightPath={true} speechBubble="Daily Quests Active!" />
        </div>
      </div>

      {/* Daily Quests Widget */}
      <DailyQuests userStats={userStats} onClaimXp={onClaimXp} />

      {/* Quick Stats Grid — 2 cols on mobile, 3 on sm+ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
        {/* Hearts */}
        <div className="glass-panel p-3.5 flex items-center justify-between border-rose-500/30">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/30">
              <Heart size={20} className="fill-rose-500 animate-pulse" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Practice Hearts</p>
              <h4 className="text-sm font-extrabold text-white">∞ Unlimited</h4>
            </div>
          </div>
          <span className="text-[9px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full">ACTIVE</span>
        </div>

        {/* Daily Goal */}
        <div className="glass-panel p-3.5 flex items-center justify-between border-sky-500/30">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-500/15 text-sky-400 border border-sky-500/30">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cards Today</p>
              <h4 className="text-sm font-extrabold text-white">{userStats?.cardsStudiedToday ?? 0} / {userStats?.dailyGoalTarget || 20}</h4>
            </div>
          </div>
          <span className="text-[9px] font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full">GOAL</span>
        </div>

        {/* Rank */}
        <div className="glass-panel p-3.5 flex items-center justify-between border-amber-500/30">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <Trophy size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Local Rank ({userStats?.cityLocation?.split(',')[0] || 'Manila'})</p>
              <h4 className="text-sm font-extrabold text-white">#3 {userStats?.leagueTier || 'Gold'} Tier</h4>
            </div>
          </div>
          <span className="text-[9px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">{(userStats?.leagueTier || 'Gold').toUpperCase()}</span>
        </div>
      </div>

      {/* Decks Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white font-display flex items-center gap-2">
            <BookOpen className="text-sky-400" size={18} />
            Your Study Decks ({decks.length})
          </h2>

          <button onClick={onOpenScan} className="btn-secondary text-xs py-1 px-3">
            <Plus size={14} />
            New Deck
          </button>
        </div>

        {/* Decks grid or Empty State */}
        {decks.length === 0 ? (
          <div className="glass-panel p-8 text-center space-y-3 border-slate-800/80">
            <BeeAnimatedMascot size="md" animated={true} speechBubble="Create your first deck!" className="mx-auto" />
            <h3 className="text-base font-bold text-white font-display">No Study Decks Yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Scan a textbook image, upload a PDF, or paste study notes in AI Scan Studio to generate active recall cards!
            </p>
            <button onClick={onOpenScan} className="btn-primary text-xs py-2 px-4 mx-auto font-bold">
              <Sparkles size={15} /> AI Scan Document to Build Deck
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {decks.map((deck) => (
              <div
                key={deck.id}
                onClick={() => onStartSession(deck)}
                className="glass-panel p-4 glass-panel-interactive flex flex-col justify-between space-y-3 border-slate-800 relative group"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-bold text-[10px] text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20">
                      {deck.subjectCategory}
                    </span>
                    <button
                      onClick={(e) => handleDeleteDeck(deck.id, e)}
                      className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete Deck"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-sky-300 transition-colors">
                    {deck.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    {deck.description}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-slate-800/80 pt-2.5 text-xs text-slate-400">
                  <span className="text-[11px] font-medium">{deck.cardCount ?? 0} cards due</span>
                  <span className="btn-primary text-[10px] py-1 px-2.5">
                    <Play size={10} fill="currentColor" />
                    Study Now
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <StreakCalendarModal
        isOpen={streakModalOpen}
        onClose={() => setStreakModalOpen(false)}
        userStats={userStats}
      />
    </div>
  );
}

