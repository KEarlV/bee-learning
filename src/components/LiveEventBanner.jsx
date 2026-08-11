import React, { useState, useEffect } from 'react';
import { Zap, Clock, Trophy, Send, CheckCircle2, XCircle, Sparkles, X, Gift } from 'lucide-react';
import confetti from 'canvas-confetti';
import BeeAnimatedMascot from './BeeAnimatedMascot';
import { soundService } from '../services/soundService';
import { getSupabaseClient } from '../services/supabaseService';
import { logActivity } from '../services/activityLogService';

export default function LiveEventBanner({ currentSession, onClaimXp }) {
  const [activeEvent, setActiveEvent] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showAnswerModal, setShowAnswerModal] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [submitStatus, setSubmitStatus] = useState(null); // 'correct' | 'wrong' | null
  const [isSubmitting, setIsSubmitting] = useState(false);

  const supabase = getSupabaseClient();

  // ── Fetch active live event from Supabase / localStorage ──────
  const fetchLiveEvent = async () => {
    try {
      if (supabase) {
        const { data, error } = await supabase
          .from('live_events')
          .select('*')
          .eq('id', 'current_event')
          .single();

        if (!error && data) {
          const now = Date.now();
          const expiresAt = new Date(data.expires_at).getTime();

          if (expiresAt > now) {
            setActiveEvent(data);
            setTimeLeft(Math.floor((expiresAt - now) / 1000));
            return;
          }
        }
      }
    } catch (e) {
      // Supabase table fallback
    }

    // Fallback to local storage state
    try {
      const localStr = localStorage.getItem('bee_live_event');
      if (localStr) {
        const parsed = JSON.parse(localStr);
        const now = Date.now();
        if (parsed.expires_at > now) {
          setActiveEvent(parsed);
          setTimeLeft(Math.floor((parsed.expires_at - now) / 1000));
          return;
        }
      }
    } catch (e) {}

    setActiveEvent(null);
    setTimeLeft(0);
  };

  useEffect(() => {
    fetchLiveEvent();

    // Supabase Real-time Channel Listener
    if (supabase) {
      const channel = supabase
        .channel('live-event-sync')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'live_events' },
          () => fetchLiveEvent()
        )
        .subscribe();

      return () => supabase.removeChannel(channel);
    }
  }, [supabase]);

  // Also listen to local window storage events for immediate local testing
  useEffect(() => {
    const handleStorageChange = () => fetchLiveEvent();
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('bee_event_update', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('bee_event_update', handleStorageChange);
    };
  }, []);

  // ── Countdown Timer ──────────────────────────────────────────
  useEffect(() => {
    if (!activeEvent || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [activeEvent, timeLeft]);

  if (!activeEvent || timeLeft <= 0) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const isClaimed = activeEvent.is_claimed;
  const winnerName = activeEvent.winner_username || 'a fast student';

  // ── Handle User Answer Submission ────────────────────────────
  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    if (!userAnswer.trim() || isSubmitting || isClaimed) return;

    setIsSubmitting(true);
    const targetAnswer = (activeEvent.correct_answer || '').toLowerCase().trim();
    const input = userAnswer.toLowerCase().trim();

    const isCorrect = targetAnswer.includes(input) || input.includes(targetAnswer);

    if (isCorrect) {
      soundService.playCorrectChime();
      soundService.playRoundCompleteFanfare();
      setSubmitStatus('correct');

      const xpAmount = Number(activeEvent.xp_reward) || 100;
      const username = currentSession?.username || 'Anonymous Player';

      // Update event state in Supabase
      if (supabase) {
        try {
          await supabase.from('live_events').update({
            is_claimed: true,
            winner_username: username,
            claimed_at: new Date().toISOString()
          }).eq('id', 'current_event');
        } catch (err) {}
      }

      // Update local storage backup
      try {
        const updatedLocal = {
          ...activeEvent,
          is_claimed: true,
          winner_username: username
        };
        localStorage.setItem('bee_live_event', JSON.stringify(updatedLocal));
        window.dispatchEvent(new Event('bee_event_update'));
      } catch (e) {}

      // Grant XP
      if (onClaimXp) onClaimXp(xpAmount, `First Place Event Winner (+${xpAmount} XP)`);
      logActivity(`Won Live Quiz Event (+${xpAmount} XP)`, 'Study', { tokens: xpAmount });

      try {
        confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
      } catch (e) {}
    } else {
      soundService.playWrongRumble();
      setSubmitStatus('wrong');
    }

    setIsSubmitting(false);
  };

  return (
    <>
      {/* Top Banner Bar */}
      <div className="bg-gradient-to-r from-amber-500 via-indigo-600 to-sky-500 text-white px-4 py-2 text-xs font-bold shadow-lg flex items-center justify-between z-40 select-none animate-pulse">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="flex items-center gap-1 bg-black/30 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/20 text-[10px] uppercase font-extrabold text-amber-300">
            <Zap size={13} className="fill-amber-300" />
            30-MIN FLASH EVENT
          </span>

          <p className="truncate font-semibold text-slate-100">
            <strong>Q:</strong> "{activeEvent.question}"
          </p>

          <span className="hidden sm:inline-flex items-center gap-1 bg-amber-400/20 text-amber-200 border border-amber-400/40 px-2 py-0.5 rounded-full text-[10px] font-bold">
            <Gift size={12} /> +{activeEvent.xp_reward || 100} XP First Winner
          </span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Timer Countdown */}
          <div className="flex items-center gap-1 text-[11px] font-mono bg-black/40 px-2.5 py-1 rounded-xl border border-white/15 text-sky-200">
            <Clock size={13} />
            <span>{formattedTime}</span>
          </div>

          {/* Action Button */}
          {isClaimed ? (
            <span className="bg-emerald-500/30 border border-emerald-400 text-emerald-200 px-3 py-1 rounded-xl text-[11px] font-bold">
              🎉 Claimed by @{winnerName}
            </span>
          ) : (
            <button
              onClick={() => {
                setShowAnswerModal(true);
                setSubmitStatus(null);
                setUserAnswer('');
              }}
              className="bg-white text-indigo-950 hover:bg-amber-300 font-extrabold text-[11px] px-3.5 py-1 rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1"
            >
              <Trophy size={13} className="text-amber-600" /> Answer Now!
            </button>
          )}
        </div>
      </div>

      {/* Answer Pop-up Modal */}
      {showAnswerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md select-none">
          <div className="glass-panel p-6 max-w-md w-full border-amber-500/40 space-y-4 relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setShowAnswerModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400">
                <Zap size={22} />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  ⚡ 30-Minute Live Quiz Event
                </span>
                <h3 className="text-lg font-bold text-white font-display mt-0.5">First to Answer Wins!</h3>
              </div>
            </div>

            {/* Question Card */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Question Prompt</span>
              <p className="text-base font-bold text-white leading-relaxed">
                "{activeEvent.question}"
              </p>
              <div className="inline-flex items-center gap-1.5 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full font-bold">
                <Trophy size={14} /> Reward: +{activeEvent.xp_reward || 100} XP (First Correct Winner)
              </div>
            </div>

            {isClaimed ? (
              <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-center text-xs text-emerald-300 space-y-1">
                <p className="font-extrabold text-sm text-white">🎉 Event Claimed!</p>
                <p>This event was won by <strong>@{winnerName}</strong>!</p>
              </div>
            ) : submitStatus === 'correct' ? (
              <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-center space-y-2">
                <BeeAnimatedMascot size="sm" animated={true} speechBubble="YOU WON! 🎉" className="mx-auto" />
                <h4 className="text-lg font-extrabold text-white">CONGRATULATIONS!</h4>
                <p className="text-xs text-emerald-300">
                  You answered correctly first! <strong>+{activeEvent.xp_reward || 100} XP</strong> has been added to your profile!
                </p>
                <button
                  onClick={() => setShowAnswerModal(false)}
                  className="btn-primary text-xs py-2 px-4 mx-auto font-bold"
                >
                  Awesome!
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitAnswer} className="space-y-3">
                {submitStatus === 'wrong' && (
                  <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-xs text-rose-300 text-center font-semibold">
                    ❌ Incorrect answer! Try again before someone else claims it!
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Your Answer
                  </label>
                  <input
                    type="text"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Type the answer..."
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  disabled={!userAnswer.trim() || isSubmitting}
                  className="w-full btn-primary text-xs py-3 justify-center font-bold"
                >
                  <Send size={15} />
                  {isSubmitting ? 'Verifying Answer...' : 'Submit Answer Now'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
