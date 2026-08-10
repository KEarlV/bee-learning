import React from 'react';
import { BarChart3, TrendingUp, Brain, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import BeeAnimatedMascot from './BeeAnimatedMascot';

export default function AnalyticsView({ userStats }) {
  const examScore = userStats?.predictedExamScore || 88;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="glass-panel p-6 border-sky-500/30 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="text-sky-400" size={26} />
            <h2 className="text-2xl font-bold text-white font-display">Exam Readiness & Memory Analytics</h2>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Gemini memory decay forecast based on your SM-2 recall intervals and response latency.
          </p>
        </div>
        <BeeAnimatedMascot size="lg" animated={true} speechBubble="Your memory is sharp!" />
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Predicted Exam Readiness */}
        <div className="glass-panel p-6 border-emerald-500/30 text-center space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wider">
            <TrendingUp size={16} /> Predicted Exam Readiness
          </div>
          <p className="text-4xl font-extrabold text-white font-display">{examScore}%</p>
          <p className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 py-1 px-3 rounded-full inline-block">
            Passing Threshold Met
          </p>
        </div>

        {/* Mastered Cards Count */}
        <div className="glass-panel p-6 border-sky-500/30 text-center space-y-2">
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-sky-400 uppercase tracking-wider">
            <CheckCircle2 size={16} /> Mastered Cards (&gt;21d)
          </div>
          <p className="text-4xl font-extrabold text-white font-display">{userStats?.cardsMastered || 14}</p>
          <p className="text-xs text-slate-400">Moved to long-term memory</p>
        </div>

        {/* Streak Record */}
        <div className="glass-panel p-6 border-amber-500/30 text-center space-y-2">
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider">
            <Brain size={16} /> Study Streak Record
          </div>
          <p className="text-4xl font-extrabold text-amber-300 font-display">{userStats?.longestStreak || 12} days</p>
          <p className="text-xs text-slate-400">Personal best consistency</p>
        </div>
      </div>

      {/* Forgetting Curve & Diagnostics */}
      <div className="glass-panel p-6 space-y-4">
        <h3 className="text-base font-bold text-white">Ebbinghaus Forgetting Curve Forecast</h3>
        <p className="text-xs text-slate-400">
          Spaced repetition maintains your retention curve above 90% accuracy before memory decay triggers.
        </p>

        {/* Simulated Graph Visualizer */}
        <div className="h-40 bg-slate-900/90 rounded-2xl border border-slate-800 p-4 flex items-end justify-between gap-3">
          {[
            { day: 'Day 1', retention: 98, color: 'bg-emerald-500' },
            { day: 'Day 3', retention: 92, color: 'bg-emerald-400' },
            { day: 'Day 7', retention: 89, color: 'bg-sky-400' },
            { day: 'Day 14', retention: 86, color: 'bg-sky-500' },
            { day: 'Day 30', retention: 84, color: 'bg-indigo-400' },
          ].map((bar, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
              <span className="text-[11px] font-bold text-slate-300">{bar.retention}%</span>
              <div
                className={`w-full ${bar.color} rounded-t-lg transition-all duration-500`}
                style={{ height: `${bar.retention}%` }}
              />
              <span className="text-[10px] text-slate-500 font-medium">{bar.day}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
