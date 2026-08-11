import React, { useState } from 'react';
import { Zap, UploadCloud, RotateCcw, Volume2, CheckCircle2, XCircle, ArrowRight, Sparkles, ShieldAlert, Send, Bot } from 'lucide-react';
import BeeAnimatedMascot from './BeeAnimatedMascot';
import { generateFlashcardsFromText } from '../services/geminiService';
import { soundService } from '../services/soundService';

export default function QuickReviewer({ onClose }) {
  const [inputText, setInputText] = useState('');
  const [inReviewSession, setInReviewSession] = useState(false);
  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);

  // Identification & Multiple Choice states
  const [typedAnswer, setTypedAnswer] = useState('');
  const [mcSubmitted, setMcSubmitted] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);

  const currentCard = cards[currentIndex] || null;

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      setInputText(evt.target?.result || '');
    };
    reader.readAsText(file);
  };

  const handleStartQuickReview = async () => {
    if (!inputText.trim()) return;
    setIsParsing(true);

    try {
      const generated = await generateFlashcardsFromText(inputText, 4);
      setCards(generated);
      setInReviewSession(true);
      setCurrentIndex(0);
      setIsFlipped(false);
      setTypedAnswer('');
      setMcSubmitted(false);
      setSelectedOption(null);
    } catch (e) {
      console.error(e);
    } finally {
      setIsParsing(false);
    }
  };

  const handleFlip = () => {
    soundService.playCardFlip();
    setIsFlipped(!isFlipped);
  };

  const resetCardState = () => {
    setIsFlipped(false);
    setTypedAnswer('');
    setMcSubmitted(false);
    setSelectedOption(null);
  };

  const handleNextCard = (rating = 5) => {
    if (rating >= 3) {
      soundService.playCorrectChime();
    } else {
      soundService.playWrongRumble();
    }

    if (currentIndex + 1 < cards.length) {
      resetCardState();
      setCurrentIndex(currentIndex + 1);
    } else {
      setSessionCompleted(true);
      soundService.playRoundCompleteFanfare();
    }
  };

  const handleIdentificationSubmit = (e) => {
    e.preventDefault();
    if (!typedAnswer.trim()) return;

    const target = (currentCard.backContent || '').toLowerCase().trim();
    const input = typedAnswer.toLowerCase().trim();
    const correct = target.includes(input) || input.includes(target);

    if (correct) soundService.playCorrectChime();
    else soundService.playWrongRumble();

    setIsFlipped(true);
  };

  const handleOptionSelect = (opt) => {
    if (mcSubmitted) return;
    setSelectedOption(opt);
    setMcSubmitted(true);
    setIsFlipped(true);

    const target = (currentCard.backContent || '').toLowerCase().trim();
    const selected = opt.toLowerCase().trim();
    if (target.includes(selected) || selected.includes(target)) {
      soundService.playCorrectChime();
    } else {
      soundService.playWrongRumble();
    }
  };

  const isMcCard = currentCard?.cardType === 'multiple_choice' || (currentCard?.options && currentCard.options.length > 0);
  const isIdentCard = currentCard?.cardType === 'identification' || currentCard?.cardType === 'fill_in_blank';

  return (
    <div className="max-w-3xl mx-auto space-y-5 select-none">
      {/* Header Banner */}
      <div className="glass-panel p-5 border-amber-500/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <Zap size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white font-display">Offline Quick Reviewer</h2>
              <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                In-Memory Mode
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Fast, zero-save study session with mixed card types (Multiple Choice, Identification & Flashcards).
            </p>
          </div>
        </div>
        <BeeAnimatedMascot size="md" animated={true} speechBubble="Quick review time!" />
      </div>

      {!inReviewSession ? (
        /* Input & Upload Form */
        <div className="glass-panel p-6 space-y-4 border-slate-800">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-2.5 text-xs text-amber-300">
            <ShieldAlert size={18} className="shrink-0 text-amber-400" />
            <span>
              <strong>Note:</strong> Cards generated in Quick Reviewer mode are kept in memory only and will NOT be saved to your library.
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Paste Study Text or Upload File
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste notes, definitions, or exam summaries for instant review..."
              className="w-full h-40 bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl p-3.5 text-xs text-slate-200 placeholder-slate-500 outline-none resize-none"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="btn-secondary text-xs cursor-pointer py-1.5 px-3">
              <UploadCloud size={15} />
              Upload File (.txt, .md)
              <input type="file" accept=".txt,.md,.pdf" onChange={handleFileUpload} className="hidden" />
            </label>

            <button
              onClick={handleStartQuickReview}
              disabled={isParsing || !inputText.trim()}
              className="btn-primary text-xs py-2 px-4 disabled:opacity-50 font-bold"
            >
              <Zap size={15} />
              {isParsing ? 'Preparing Cards...' : 'Start Quick Review'}
            </button>
          </div>
        </div>
      ) : sessionCompleted ? (
        /* Completed Screen */
        <div className="glass-panel p-8 text-center space-y-5 border-amber-500/30">
          <BeeAnimatedMascot size="splash" animated={true} flightPath={true} speechBubble="Quick review complete!" />
          <div>
            <h3 className="text-2xl font-bold text-white font-display">Quick Review Complete! 🎉</h3>
            <p className="text-xs text-slate-400 mt-1">
              You reviewed {cards.length} mixed cards in memory. Great job warming up your brain!
            </p>
          </div>

          <button
            onClick={() => {
              setInReviewSession(false);
              setSessionCompleted(false);
              setInputText('');
            }}
            className="btn-primary text-xs px-5 mx-auto font-bold"
          >
            Review Another Topic
          </button>
        </div>
      ) : (
        /* Active In-Memory Mixed Card Arena */
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>
              Card {currentIndex + 1} of {cards.length} • <span className="text-amber-400 capitalize">{currentCard?.cardType || 'flashcard'}</span>
            </span>
            <span className="text-amber-400 font-bold">⚡ Quick Review Mode</span>
          </div>

          <div
            onClick={() => !isMcCard && !isIdentCard && handleFlip()}
            className={`glass-panel p-6 sm:p-8 min-h-[260px] flex flex-col justify-between border-amber-500/30 hover:border-amber-400 transition-all text-center ${
              !isMcCard && !isIdentCard ? 'cursor-pointer' : ''
            }`}
          >
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
              {isFlipped ? 'Answer Back' : 'Question Prompt'}
            </span>

            <div className="my-4 space-y-3">
              <p className="text-xl font-bold text-white leading-relaxed">
                {isFlipped ? currentCard.backContent : currentCard.frontContent}
              </p>

              {/* Identification Form */}
              {isIdentCard && !isFlipped && (
                <form onSubmit={handleIdentificationSubmit} className="max-w-md mx-auto pt-2 flex gap-2" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="text"
                    value={typedAnswer}
                    onChange={(e) => setTypedAnswer(e.target.value)}
                    placeholder="Type your answer here..."
                    className="flex-1 bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-xl px-3.5 py-2 text-xs text-white outline-none"
                    autoFocus
                  />
                  <button type="submit" className="btn-primary text-xs px-3.5 font-bold shrink-0">
                    <Send size={14} /> Submit Answer
                  </button>
                </form>
              )}

              {/* Multiple Choice Grid */}
              {isMcCard && currentCard.options && !isFlipped && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-xl mx-auto pt-2" onClick={(e) => e.stopPropagation()}>
                  {currentCard.options.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleOptionSelect(opt)}
                      className="p-3 rounded-xl border border-slate-700 hover:border-amber-400 bg-slate-900/80 text-slate-200 text-xs font-semibold text-left transition-all"
                    >
                      <span className="text-amber-400 font-bold mr-2">{String.fromCharCode(65 + idx)}.</span>
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <span className="text-xs text-slate-500 flex items-center justify-center gap-1">
              {!isMcCard && !isIdentCard ? (
                <>
                  <RotateCcw size={13} /> Click to {isFlipped ? 'see question' : 'reveal answer'}
                </>
              ) : (
                'Select an option or type answer above'
              )}
            </span>
          </div>

          {/* Action buttons */}
          {isMcCard || isIdentCard ? (
            isFlipped && (
              <button
                onClick={() => handleNextCard(5)}
                className="w-full btn-primary text-xs py-3 justify-center font-bold"
              >
                Next Question <ArrowRight size={16} />
              </button>
            )
          ) : isFlipped ? (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleNextCard(1)}
                className="btn-secondary text-xs justify-center border-rose-500/30 text-rose-400 py-2.5 font-bold"
              >
                <XCircle size={16} /> Needs Practice
              </button>
              <button
                onClick={() => handleNextCard(5)}
                className="btn-primary text-xs justify-center py-2.5 font-bold"
              >
                <CheckCircle2 size={16} /> Got It!
              </button>
            </div>
          ) : (
            <button onClick={handleFlip} className="w-full btn-primary text-xs py-2.5 justify-center font-bold">
              Reveal Answer
            </button>
          )}
        </div>
      )}
    </div>
  );
}
