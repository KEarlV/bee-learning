import React, { useState } from 'react';
import { RotateCcw, Volume2, Sparkles, CheckCircle2, XCircle, Trophy, ArrowRight, Heart, Bot } from 'lucide-react';
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

  const currentCard = cards[currentIndex] || null;

  const handleFlip = () => {
    soundService.playCardFlip();
    setIsFlipped(!isFlipped);
  };

  const handleSpeakText = (e, text) => {
    e.stopPropagation();
    soundService.speakText(text);
  };

  const handleRating = async (ratingScore) => {
    if (!currentCard) return;

    const isCorrect = ratingScore >= 4;
    if (isCorrect) {
      soundService.playCorrectChime();
    } else {
      soundService.playWrongRumble();
    }

    // Calculate SM-2 spaced repetition parameters
    const sm2Result = calculateSM2(
      ratingScore,
      currentCard.repetitions || 0,
      currentCard.intervalDays || 0,
      currentCard.easeFactor || 2.5
    );

    // Save updated parameters to Dexie storage
    await updateCard(currentCard.id, {
      repetitions: sm2Result.repetitions,
      intervalDays: sm2Result.intervalDays,
      easeFactor: sm2Result.easeFactor,
      dueDate: sm2Result.dueDate,
      status: sm2Result.status,
      lastReviewedAt: new Date().toISOString()
    });

    // XP Rule: strictly ONLY award XP if correct (>= 4) AND card was not already reviewed in this session
    let cardXpGained = 0;
    if (isCorrect && !reviewedCardIds.has(currentCard.id)) {
      cardXpGained = 15;
      setSessionXpEarned((prev) => prev + cardXpGained);
      if (onClaimXp) onClaimXp(cardXpGained, `Correct Flashcard Response`);
      logActivity('Card Correct (+15 XP)', 'Study', { tokens: cardXpGained });
    }

    // Track card as reviewed
    setReviewedCardIds((prev) => new Set(prev).add(currentCard.id));

    // Advance to next card or finish session
    if (currentIndex + 1 < cards.length) {
      setIsFlipped(false);
      setCurrentIndex((prev) => prev + 1);
    } else {
      // SET COMPLETION BONUS: Award +50 XP bonus for completing the entire deck set
      const completionBonus = 50;
      setSessionXpEarned((prev) => prev + completionBonus);
      if (onClaimXp) onClaimXp(completionBonus, `Deck Completion Bonus (+50 XP)`);
      logActivity(`Deck Completed (${deck?.title || 'Set'})`, 'Study', { tokens: completionBonus });

      setSessionCompleted(true);
      soundService.playRoundCompleteFanfare();
      try {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      } catch (e) {}
    }
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
            You reviewed all {cards.length} cards in <strong>{deck?.title}</strong> and earned a +50 XP Set Completion Bonus!
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

  return (
    <div className="max-w-3xl mx-auto space-y-5 select-none">
      {/* Header Info */}
      <div className="glass-panel p-4 flex items-center justify-between border-slate-800">
        <div>
          <h2 className="text-base font-bold text-white font-display">{deck?.title}</h2>
          <span className="text-xs text-slate-400">
            Card {currentIndex + 1} of {cards.length}
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

      {/* 3D Flip Card Container */}
      <div
        onClick={handleFlip}
        className="glass-panel p-8 min-h-[300px] flex flex-col justify-between cursor-pointer border-sky-500/30 hover:border-sky-400 transition-all text-center relative group"
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

        {/* Card Main Text */}
        <div className="my-6 space-y-3">
          <p className="text-xl sm:text-2xl font-bold text-white leading-relaxed">
            {isFlipped ? currentCard.backContent : currentCard.frontContent}
          </p>

          {isFlipped && currentCard.dynamicMnemonic && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300 inline-block max-w-md">
              💡 <strong>Mnemonic Trick:</strong> {currentCard.dynamicMnemonic}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1 text-slate-500">
            <RotateCcw size={13} />
            Click or press Space to {isFlipped ? 'see question' : 'reveal answer'}
          </span>

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

      {/* Answer Rating Buttons */}
      {isFlipped ? (
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
            Hard (0 XP)
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
            <CheckCircle2 size={15} /> Easy (+15 XP)
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
