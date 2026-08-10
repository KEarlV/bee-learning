import React, { useState } from 'react';
import { GraduationCap, MapPin, Target, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import BeeAnimatedMascot from './BeeAnimatedMascot';
import CityAutocomplete from './CityAutocomplete';

export default function OnboardingModal({ isOpen, onClose, onComplete }) {
  const [step, setStep] = useState(1);
  const [educationLevel, setEducationLevel] = useState('College / University');
  const [cityLocation, setCityLocation] = useState('Manila, 🇵🇭 Philippines');
  const [targetExam, setTargetExam] = useState('Biology & CS Midterms');
  const [studyStyle, setStudyStyle] = useState('Active Recall + Feynman');

  if (!isOpen) return null;

  const handleFinish = () => {
    const profileData = {
      educationLevel,
      cityLocation,
      targetExam,
      studyStyle,
      onboardedAt: new Date().toISOString()
    };
    onComplete(profileData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md select-none">
      <div className="glass-panel w-full max-w-lg p-6 relative border-sky-500/40 shadow-2xl space-y-5">
        {/* Header */}
        <div className="text-center space-y-2">
          <BeeAnimatedMascot size="lg" animated={true} flightPath={true} speechBubble="Let's set up your profile!" className="mx-auto" />
          <h2 className="text-2xl font-bold text-white font-display">
            Personalize Your BEE Study Path
          </h2>
          <p className="text-xs text-slate-400">
            Tell Bee about your study goals for AI card recommendations and Leaderboard rankings!
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all ${
                s === step ? 'w-8 bg-sky-400' : s < step ? 'w-4 bg-emerald-400' : 'w-4 bg-slate-800'
              }`}
            />
          ))}
        </div>

        {/* Step 1: Location & Leaderboard Scope */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <MapPin className="text-sky-400" size={18} />
              Step 1: Your Location & Leaderboard Placement
            </h3>
            <p className="text-xs text-slate-400">
              Select or type your city for Local, National, and International Leaderboards!
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">City / Region (Auto-Suggested)</label>
              <CityAutocomplete value={cityLocation} onChange={(val) => setCityLocation(val)} />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Education Level</label>
              <select
                value={educationLevel}
                onChange={(e) => setEducationLevel(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
              >
                <option value="High School">High School Student</option>
                <option value="College / University">College / University</option>
                <option value="Medical / Nursing">Medical & Health Sciences</option>
                <option value="Engineering & Tech">Engineering & Computer Science</option>
                <option value="Board / Licensing Exam">Board / Licensure Exam Prep</option>
                <option value="Self Learner">Self-Taught / Professional</option>
              </select>
            </div>

            <button onClick={() => setStep(2)} className="w-full btn-primary text-xs py-2.5 justify-center">
              Next Step <ArrowRight size={15} />
            </button>
          </div>
        )}

        {/* Step 2: Target Exams & Goals */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Target className="text-amber-400" size={18} />
              Step 2: Target Exams & Study Goal
            </h3>
            <p className="text-xs text-slate-400">
              What major subject or upcoming exam are you preparing for?
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Upcoming Exam / Main Focus</label>
              <input
                type="text"
                value={targetExam}
                onChange={(e) => setTargetExam(e.target.value)}
                placeholder="e.g. Organic Chemistry Final, Bar Exam, NMAT"
                className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
              />
            </div>

            <div className="flex gap-2">
              <button onClick={() => setStep(1)} className="btn-secondary text-xs py-2.5 flex-1">
                Back
              </button>
              <button onClick={() => setStep(3)} className="btn-primary text-xs py-2.5 flex-1 justify-center">
                Next Step <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Preferred AI Learning Style */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="text-purple-400" size={18} />
              Step 3: Preferred AI Learning Style
            </h3>

            <div className="grid grid-cols-2 gap-2">
              {[
                { name: 'Active Recall + Spaced Repetition', desc: 'SM-2 Memory Flashcards' },
                { name: 'Feynman Explanation', desc: 'Explain to Bee for feedback' },
                { name: 'Multiple Choice Quizzes', desc: 'Fast practice tests' },
                { name: 'Mnemonics & Analogies', desc: 'Memory tricks & stories' }
              ].map((style, idx) => (
                <div
                  key={idx}
                  onClick={() => setStudyStyle(style.name)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    studyStyle === style.name
                      ? 'bg-sky-500/20 border-sky-400 text-white font-bold'
                      : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <h4 className="text-xs font-bold">{style.name}</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">{style.desc}</p>
                </div>
              ))}
            </div>

            <button onClick={handleFinish} className="w-full btn-primary text-xs py-3 justify-center">
              <CheckCircle2 size={16} /> Complete & Claim +100 XP Onboarding Bonus!
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
