import React, { useState, useEffect } from 'react';
import BeeAnimatedMascot from './BeeAnimatedMascot';

const loadingStatuses = [
  'Bee is buzzing up your study cards! 🐝',
  'Initializing Spaced Repetition Memory Matrix...',
  'Connecting to Bee\'s Gemini AI Neural Engine...',
  'Preparing Active Recall Memory Decks...'
];

export default function SplashLoader({ onFinished }) {
  const [progress, setProgress] = useState(0);
  const [statusIndex, setStatusIndex] = useState(0);

  useEffect(() => {
    // Progress counter animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setTimeout(() => onFinished && onFinished(), 350);
          return 100;
        }
        return prev + 5;
      });
    }, 70);

    // Status text cycle
    const textInterval = setInterval(() => {
      setStatusIndex((prev) => (prev + 1) % loadingStatuses.length);
    }, 550);

    return () => {
      clearInterval(progressInterval);
      clearInterval(textInterval);
    };
  }, [onFinished]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 text-white overflow-hidden select-none p-6">
      {/* Background Aura Glow */}
      <div className="absolute w-72 h-72 bg-sky-500/15 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute w-60 h-60 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none animate-pulse delay-500" />

      {/* Center Orbit & Flying Bee */}
      <div className="relative w-48 h-48 flex items-center justify-center mb-6">
        <div className="absolute w-44 h-44 border border-sky-400/30 rounded-full animate-pulse-orbit pointer-events-none" />
        <div className="absolute w-52 h-52 border border-purple-500/20 rounded-full animate-pulse-orbit pointer-events-none" style={{ animationDuration: '6s' }} />

        <BeeAnimatedMascot
          size="splash"
          animated={true}
          flightPath={true}
          speechBubble="Welcome to BEE Study!"
        />
      </div>

      {/* App Branding Title */}
      <h1 className="text-3xl font-extrabold tracking-tight font-display mb-1.5 bg-clip-text text-transparent bg-gradient-to-r from-sky-400 via-indigo-300 to-amber-300">
        BEE AI STUDY
      </h1>
      <p className="text-xs text-slate-400 mb-6 font-medium tracking-wide">
        Gizmo-Powered Active Recall & Spaced Repetition Engine
      </p>

      {/* Shimmer Progress Gauge */}
      <div className="w-72 h-2.5 bg-slate-900 border border-slate-800 rounded-full overflow-hidden p-0.5 shadow-inner mb-3">
        <div
          className="h-full bg-gradient-to-r from-sky-400 via-indigo-500 to-amber-400 rounded-full transition-all duration-150 ease-out shadow-[0_0_12px_rgba(30,165,252,0.6)]"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Dynamic Status Quotes */}
      <p className="text-xs font-semibold text-sky-400/90 h-5 transition-all duration-300 text-center">
        {loadingStatuses[statusIndex]}
      </p>

      <span className="mt-1 text-[10px] text-slate-500 font-mono">
        {progress}% COMPLETE
      </span>
    </div>
  );
}
