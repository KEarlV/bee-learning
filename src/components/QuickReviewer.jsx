import React, { useState } from 'react';
import { Zap, UploadCloud, RotateCcw, Volume2, CheckCircle2, XCircle, ArrowRight, Sparkles, ShieldAlert } from 'lucide-react';
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
      // In-memory extraction (not saved to database)
      const generated = await generateFlashcardsFromText(inputText, 4);
      setCards(generated);
      setInReviewSession(true);
      setCurrentIndex(0);
      setIsFlipped(false);
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

  const handleNextCard = (rating) => {
    if (rating >= 4) {
      soundService.playCorrectChime();
    } else {
      soundService.playWrongRumble();
    }

    if (currentIndex + 1 < cards.length) {
      setIsFlipped(false);
      setCurrentIndex(currentIndex + 1);
    } else {
      setSessionCompleted(true);
      soundService.playRoundCompleteFanfare();
    }
  };

  const currentCard = cards[currentIndex] || null;

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
              Fast, zero-save study session. Perfect for a 2-minute exam warm-up!
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
              className="btn-primary text-xs py-2 px-4 disabled:opacity-50"
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
              You reviewed {cards.length} cards in memory. Great job warming up your brain!
            </p>
          </div>

          <button
            onClick={() => {
              setInReviewSession(false);
              setSessionCompleted(false);
              setInputText('');
            }}
            className="btn-primary text-xs px-5 mx-auto"
          >
            Review Another Topic
          </button>
        </div>
      ) : (
        /* Active In-Memory Card Flip Arena */
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Card {currentIndex + 1} of {cards.length}</span>
            <span className="text-amber-400 font-bold">⚡ Quick Review Mode</span>
          </div>

          <div
            onClick={handleFlip}
            className="glass-panel p-8 min-h-[260px] flex flex-col justify-between cursor-pointer border-amber-500/30 hover:border-amber-400 transition-all text-center"
          >
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
              {isFlipped ? 'Answer Back' : 'Question Prompt'}
            </span>

            <p className="text-xl font-bold text-white my-4 leading-relaxed">
              {isFlipped ? currentCard.backContent : currentCard.frontContent}
            </p>

            <span className="text-xs text-slate-500 flex items-center justify-center gap-1">
              <RotateCcw size={13} />
              Click to {isFlipped ? 'see question' : 'reveal answer'}
            </span>
          </div>

          {isFlipped ? (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleNextCard(0)}
                className="btn-secondary text-xs justify-center border-rose-500/30 text-rose-400 py-2.5"
              >
                <XCircle size={16} /> Needs Practice
              </button>
              <button
                onClick={() => handleNextCard(5)}
                className="btn-primary text-xs justify-center py-2.5"
              >
                <CheckCircle2 size={16} /> Got It!
              </button>
            </div>
          ) : (
            <button onClick={handleFlip} className="w-full btn-primary text-xs py-2.5 justify-center">
              Reveal Answer
            </button>
          )}
        </div>
      )}
    </div>
  );
}
