import React, { useState } from 'react';
import { Mic, Send, Sparkles, CheckCircle2, AlertCircle, Loader2, Award } from 'lucide-react';
import BeeAnimatedMascot from './BeeAnimatedMascot';
import { evaluateFeynmanExplanation } from '../services/geminiService';

export default function FeynmanStudio() {
  const [concept, setConcept] = useState('Selective Permeability of Cell Membrane');
  const [targetAnswer, setTargetAnswer] = useState('Phospholipid bilayer allows small hydrophobic molecules to pass freely while requiring transport proteins for ions.');
  const [userExplanation, setUserExplanation] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState(null);

  const handleEvaluate = async () => {
    if (!userExplanation.trim()) return;
    setIsEvaluating(true);

    try {
      const result = await evaluateFeynmanExplanation(concept, targetAnswer, userExplanation);
      setEvaluationResult(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="glass-panel p-6 border-sky-500/30 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Mic className="text-amber-400" size={24} />
            <h2 className="text-2xl font-bold text-white font-display">Feynman Method Studio</h2>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            The best way to test true mastery is teaching a concept. Explain it to Bee!
          </p>
        </div>
        <BeeAnimatedMascot size="lg" animated={true} speechBubble="Explain it to Bee!" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Concept Card */}
        <div className="glass-panel p-6 space-y-4">
          <div>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Concept to Explain</span>
            <input
              type="text"
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              className="w-full mt-1 bg-slate-900 border border-slate-800 focus:border-sky-500 rounded-xl p-3 text-sm text-white font-bold outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
              Your Explanation (Speak or Type)
            </label>
            <textarea
              value={userExplanation}
              onChange={(e) => setUserExplanation(e.target.value)}
              placeholder="Explain how this works in your own words, as if teaching a beginner..."
              className="w-full h-44 bg-slate-900 border border-slate-800 focus:border-sky-500 rounded-xl p-3 text-sm text-slate-200 placeholder-slate-500 outline-none resize-none"
            />
          </div>

          <button
            onClick={handleEvaluate}
            disabled={isEvaluating || !userExplanation.trim()}
            className="w-full btn-primary justify-center text-sm py-3 disabled:opacity-50"
          >
            {isEvaluating ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Bee is evaluating your explanation...
              </>
            ) : (
              <>
                <Send size={18} />
                Submit Explanation to Bee
              </>
            )}
          </button>
        </div>

        {/* Bee Evaluation Feedback Card */}
        <div className="glass-panel p-6 flex flex-col justify-between">
          {evaluationResult ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Award className="text-amber-400" size={24} />
                  <span className="font-bold text-lg text-white">Bee's Mastery Score</span>
                </div>
                <span className="text-2xl font-extrabold text-sky-400">{evaluationResult.score}%</span>
              </div>

              <div>
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">Strengths Identified</h4>
                <ul className="space-y-1">
                  {evaluationResult.strengths.map((s, i) => (
                    <li key={i} className="text-xs text-slate-300 flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {evaluationResult.missingPoints.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">Nuances to Add</h4>
                  <ul className="space-y-1">
                    {evaluationResult.missingPoints.map((m, i) => (
                      <li key={i} className="text-xs text-slate-300 flex items-center gap-2">
                        <AlertCircle size={14} className="text-amber-400 shrink-0" />
                        <span>{m}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="p-3.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-xs text-sky-300">
                💬 <strong>Bee says:</strong> {evaluationResult.feedback}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 space-y-3">
              <BeeAnimatedMascot size="lg" animated={true} />
              <h4 className="text-base font-bold text-slate-300">Ready for Bee's Feedback?</h4>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Type your explanation on the left and click submit. Bee will evaluate your grasp!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
