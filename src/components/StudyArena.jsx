import React, { useState } from 'react';
import { RotateCcw, Volume2, Sparkles, CheckCircle2, XCircle, Trophy, ArrowRight, Heart, Bot, Send, HelpCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import BeeAnimatedMascot from './BeeAnimatedMascot';
import { soundService } from '../services/soundService';
import { calculateSM2 } from '../services/spacedRepetition';
import { updateCard } from '../services/storageService';
import { logActivity } from '../services/activityLogService';

export default function StudyArena({ deck, cards = [], onFinishSession, onAskBee, onClaimXp }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [sessionXpEarned, setSessionXpEarned] = useState(0);
  const [reviewedCardIds, setReviewedCardIds] = useState(() => new Set());

  // Identification card input state
  const [typedAnswer, setTypedAnswer] = useState('');
  const [identificationSubmitted, setIdentificationSubmitted] = useState(false);
  const [isIdentificationCorrect, setIsIdentificationCorrect] = useState(false);

  // Multiple Choice card state
  const [selectedOption, setSelectedOption] = useState(null);
  const [mcSubmitted, setMcSubmitted] = useState(false);

  const currentCard = cards[currentIndex] || null;

  const handleFlip = () => {
    soundService.playCardFlip();
    setIsFlipped(!isFlipped);
  };

  const handleSpeakText = (e, text) => {
    e.stopPropagation();
    soundService.speakText(text);
  };

  // ── Reset local states on next card ──────────────────────────
  const resetCardState = () => {
    setIsFlipped(false);
    setTypedAnswer('');
    setIdentificationSubmitted(false);
    setIsIdentificationCorrect(false);
    setSelectedOption(null);
    setMcSubmitted(false);
  };

  // ── Advance or Finish ─────────────────────────────────────────
  const advanceToNextOrFinish = (extraBonus = 0) => {
    let totalBonus = extraBonus;
    const isLastCard = currentIndex + 1 >= cards.length;

    if (isLastCard) {
      const setCompletionBonus = 50;
      totalBonus += setCompletionBonus;
      setSessionXpEarned((prev) => prev + setCompletionBonus);
      if (onClaimXp) onClaimXp(setCompletionBonus, `Deck Completion Bonus (+50 XP)`);
      logActivity(`Deck Completed (${deck?.title || 'Set'})`, 'Study', { tokens: setCompletionBonus });

      setSessionCompleted(true);
      soundService.playRoundCompleteFanfare();
      try {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      } catch (e) {}
    } else {
      resetCardState();
      setCurrentIndex((prev) => prev + 1);
    }
  };

  // ── Evaluate SM-2 & Award XP dynamically ──────────────────────
  const handleRating = async (ratingScore) => {
    if (!currentCard) return;

    // Rating XP Matrix:
    // Easy (5): +10 XP
    // Good (4): +15 XP
    // Hard (3): +5 XP
    // Again (1): 0 XP
    let xpGained = 0;
    if (ratingScore === 5) xpGained = 10;
    else if (ratingScore === 4) xpGained = 15;
    else if (ratingScore === 3) xpGained = 5;

    const isCorrect = ratingScore >= 3;
    if (isCorrect) soundService.playCorrectChime();
    else soundService.playWrongRumble();

    // SM-2 calculation
    const sm2Result = calculateSM2(
      ratingScore,
      currentCard.repetitions || 0,
      currentCard.intervalDays || 0,
      currentCard.easeFactor || 2.5
    );

    await updateCard(currentCard.id, {
      repetitions: sm2Result.repetitions,
      intervalDays: sm2Result.intervalDays,
      easeFactor: sm2Result.easeFactor,
      dueDate: sm2Result.dueDate,
      status: sm2Result.status,
      lastReviewedAt: new Date().toISOString()
    });

    // Grant XP strictly ONCE per card per session
    if (xpGained > 0 && !reviewedCardIds.has(currentCard.id)) {
      setSessionXpEarned((prev) => prev + xpGained);
      if (onClaimXp) onClaimXp(xpGained, `Flashcard Rating (+${xpGained} XP)`);
      logActivity(`Card Rated (+${xpGained} XP)`, 'Study', { tokens: xpGained });
    }

    setReviewedCardIds((prev) => new Set(prev).add(currentCard.id));
    advanceToNextOrFinish();
  };

  // ── Identification / Type Answer Submit Handler ────────────────
  const handleIdentificationSubmit = async (e) => {
    e.preventDefault();
    if (!typedAnswer.trim() || identificationSubmitted) return;

    setIdentificationSubmitted(true);
    const target = (currentCard.backContent || '').toLowerCase().trim();
    const input = typedAnswer.toLowerCase().trim();

    // Flexible matching: exact or substring match
    const correct = target.includes(input) || input.includes(target);
    setIsIdentificationCorrect(correct);

    let xpGained = 0;
    if (correct) {
      soundService.playCorrectChime();
      if (!reviewedCardIds.has(currentCard.id)) {
        xpGained = 20; // +20 XP identification bonus!
        setSessionXpEarned((prev) => prev + xpGained);
        if (onClaimXp) onClaimXp(xpGained, `Identification Bonus (+20 XP)`);
        logActivity('Identification Correct (+20 XP)', 'Study', { tokens: xpGained });
      }
    } else {
      soundService.playWrongRumble();
    }

    setReviewedCardIds((prev) => new Set(prev).add(currentCard.id));
    setIsFlipped(true); // Reveal card back explanation
  };

  // ── Multiple Choice Option Click Handler ───────────────────────
  const handleOptionSelect = async (opt) => {
    if (mcSubmitted) return;

    setSelectedOption(opt);
    setMcSubmitted(true);
    setIsFlipped(true);

    const target = (currentCard.backContent || '').toLowerCase().trim();
    const selected = opt.toLowerCase().trim();

    const correct = target.includes(selected) || selected.includes(target);

    let xpGained = 0;
    if (correct) {
      soundService.playCorrectChime();
      if (!reviewedCardIds.has(currentCard.id)) {
        xpGained = 15;
        setSessionXpEarned((prev) => prev + xpGained);
        if (onClaimXp) onClaimXp(xpGained, `Multiple Choice Correct (+15 XP)`);
        logActivity('Multiple Choice Correct (+15 XP)', 'Study', { tokens: xpGained });
      }
    } else {
      soundService.playWrongRumble();
    }

    setReviewedCardIds((prev) => new Set(prev).add(currentCard.id));
  };

  if (!cards.length) {
    return (
      <div className="glass-panel p-8 text-center max-w-md mx-auto space-y-4 my-10 select-none">
        <BeeAnimatedMascot size="lg" animated={true} speechBubble="No cards yet!" />
        <h3 className="text-xl font-bold text-white font-display">This deck has no cards</h3>
        <p className="text-xs text-slate-400">Use AI Scanner Studio to generate cards for this deck!</p>
        <button onClick={onFinishSession} className="btn-primary text-xs px-4 mx-auto font-bold">
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (sessionCompleted) {
    return (
      <div className="glass-panel p-8 text-center max-w-lg mx-auto space-y-5 my-6 border-sky-500/40 select-none">
        <BeeAnimatedMascot size="splash" animated={true} flightPath={true} speechBubble="Deck Set Complete!" />
        <div>
          <span className="text-xs font-extrabold text-amber-400 bg-amber-500/10 px-3.5 py-1.5 rounded-full border border-amber-500/30">
            + {sessionXpEarned} Total Session XP Earned! 🎉
          </span>
          <h2 className="text-3xl font-extrabold text-white font-display mt-3">Study Session Complete!</h2>
          <p className="text-xs text-slate-300 mt-1">
            You reviewed all {cards.length} cards in <strong>{deck?.title}</strong> and unlocked a +50 XP Set Completion Bonus!
          </p>
        </div>

        <div className="pt-2 flex justify-center gap-3">
          <button onClick={onFinishSession} className="btn-primary text-xs py-2.5 px-5 font-bold">
            Back to Dashboard <ArrowRight size={15} />
          </button>
        </div>
      </div>
    );
  }

  const isMcCard = currentCard.cardType === 'multiple_choice' || (currentCard.options && currentCard.options.length > 0);
  const isIdentCard = currentCard.cardType === 'identification' || currentCard.cardType === 'fill_in_blank';

  return (
    <div className="max-w-3xl mx-auto space-y-5 select-none">
      {/* Header Info */}
      <div className="glass-panel p-4 flex items-center justify-between border-slate-800">
        <div>
          <h2 className="text-base font-bold text-white font-display">{deck?.title}</h2>
          <span className="text-xs text-slate-400">
            Card {currentIndex + 1} of {cards.length} • <span className="text-sky-400 capitalize">{currentCard.cardType || 'flashcard'}</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-rose-500/15 border border-rose-500/30 text-rose-400 px-2.5 py-1 rounded-xl text-xs font-bold">
            <Heart size={14} className="fill-rose-500 text-rose-500 animate-pulse" />
            <span>∞ Unlimited</span>
          </div>

          <div className="flex items-center gap-1 bg-amber-500/15 border border-amber-500/30 text-amber-400 px-2.5 py-1 rounded-xl text-xs font-bold">
            <Trophy size={14} />
            <span>+ {sessionXpEarned} XP</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-sky-400 to-indigo-500 transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
        />
      </div>

      {/* Main Flashcard Body */}
      <div
        onClick={() => !isMcCard && !isIdentCard && handleFlip()}
        className={`glass-panel p-6 sm:p-8 min-h-[300px] flex flex-col justify-between border-sky-500/30 hover:border-sky-400 transition-all text-center relative group ${
          !isMcCard && !isIdentCard ? 'cursor-pointer' : ''
        }`}
      >
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-sky-400 uppercase tracking-wider">
            {isFlipped ? 'Answer Back' : 'Question Prompt'}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => handleSpeakText(e, isFlipped ? currentCard.backContent : currentCard.frontContent)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-sky-400 hover:bg-slate-800 transition-all"
              title="Read aloud with Speech Audio"
            >
              <Volume2 size={18} />
            </button>
          </div>
        </div>

        {/* Card Content Display */}
        <div className="my-5 space-y-4">
          <p className="text-xl sm:text-2xl font-bold text-white leading-relaxed">
            {isFlipped ? currentCard.backContent : currentCard.frontContent}
          </p>

          {/* Identification Input Form */}
          {isIdentCard && !isFlipped && (
            <form onSubmit={handleIdentificationSubmit} className="max-w-md mx-auto pt-2 flex gap-2" onClick={(e) => e.stopPropagation()}>
              <input
                type="text"
                value={typedAnswer}
                onChange={(e) => setTypedAnswer(e.target.value)}
                placeholder="Type your answer here..."
                className="flex-1 bg-slate-900 border border-slate-700 focus:border-sky-400 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none"
                autoFocus
              />
              <button type="submit" className="btn-primary text-xs px-4 font-bold shrink-0">
                <Send size={15} /> Submit (+20 XP)
              </button>
            </form>
          )}

          {/* Multiple Choice Options Grid */}
          {isMcCard && currentCard.options && !isFlipped && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-xl mx-auto pt-2" onClick={(e) => e.stopPropagation()}>
              {currentCard.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleOptionSelect(opt)}
                  className="p-3 rounded-xl border border-slate-700 hover:border-sky-400 bg-slate-900/80 hover:bg-sky-500/10 text-slate-200 text-xs font-semibold text-left transition-all active:scale-98"
                >
                  <span className="text-sky-400 font-bold mr-2">{String.fromCharCode(65 + idx)}.</span>
                  {opt}
                </button>
              ))}
            </div>
          )}

          {/* Mnemonic Display */}
          {isFlipped && currentCard.dynamicMnemonic && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300 inline-block max-w-md">
              💡 <strong>Mnemonic Trick:</strong> {currentCard.dynamicMnemonic}
            </div>
          )}
        </div>

        {/* Card Footer Actions */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          {!isMcCard && !isIdentCard ? (
            <span className="flex items-center gap-1 text-slate-500">
              <RotateCcw size={13} />
              Click to {isFlipped ? 'see question' : 'reveal answer'}
            </span>
          ) : (
            <span className="text-slate-500 text-[11px]">
              {isIdentCard ? 'Type answer above & submit' : 'Select one of the 4 options'}
            </span>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              onAskBee(isFlipped ? currentCard.backContent : currentCard.frontContent);
            }}
            className="text-sky-400 font-semibold hover:underline flex items-center gap-1 text-[11px]"
          >
            <Bot size={14} /> Ask Bee for an Analogy
          </button>
        </div>
      </div>

      {/* Answer Evaluation Controls */}
      {isMcCard || isIdentCard ? (
        isFlipped && (
          <button
            onClick={() => advanceToNextOrFinish()}
            className="w-full btn-primary text-xs py-3 justify-center font-bold"
          >
            Next Question <ArrowRight size={16} />
          </button>
        )
      ) : isFlipped ? (
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => handleRating(1)}
            className="btn-secondary text-xs justify-center border-rose-500/30 text-rose-400 py-3 font-bold"
          >
            <XCircle size={15} /> Again (0 XP)
          </button>
          <button
            onClick={() => handleRating(3)}
            className="btn-secondary text-xs justify-center border-amber-500/30 text-amber-300 py-3 font-bold"
          >
            Hard (+5 XP)
          </button>
          <button
            onClick={() => handleRating(4)}
            className="btn-secondary text-xs justify-center border-sky-500/30 text-sky-300 py-3 font-bold"
          >
            Good (+15 XP)
          </button>
          <button
            onClick={() => handleRating(5)}
            className="btn-primary text-xs justify-center py-3 font-bold"
          >
            <CheckCircle2 size={15} /> Easy (+10 XP)
          </button>
        </div>
      ) : (
        <button onClick={handleFlip} className="w-full btn-primary text-xs py-3 justify-center font-bold">
          Reveal Answer
        </button>
      )}
    </div>
  );
}
