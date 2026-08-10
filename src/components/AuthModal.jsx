import React, { useState } from 'react';
import { User, Lock, Mail, ArrowRight, ShieldCheck, X, LogIn, UserPlus, HelpCircle } from 'lucide-react';
import BeeAnimatedMascot from './BeeAnimatedMascot';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      const userProfile = {
        userId: 'user-' + Date.now(),
        email: email || 'student@beestudy.ai',
        username: username || (email ? email.split('@')[0] : 'BeeLearner'),
        avatarUrl: '/bee_frame_4.png',
        isAuthenticated: true
      };
      onAuthSuccess(userProfile);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md select-none">
      <div className="glass-panel w-full max-w-md p-6 relative border-sky-500/40 shadow-2xl space-y-5">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
        >
          <X size={18} />
        </button>

        {/* Mascot & Header */}
        <div className="text-center space-y-2">
          <BeeAnimatedMascot size="lg" animated={true} flightPath={true} speechBubble="Welcome back!" className="mx-auto" />
          <h2 className="text-2xl font-bold text-white font-display">
            {mode === 'login' ? 'Welcome Back to BEE!' : 'Join BEE AI Study'}
          </h2>
          <p className="text-xs text-slate-400">
            {mode === 'login'
              ? 'Sign in to sync your study streaks and rank up in weekly leagues'
              : 'Create an account to track your memory curves across devices'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setMode('login')}
            className={`flex-1 py-2 font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              mode === 'login' ? 'bg-sky-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <LogIn size={14} />
            Sign In
          </button>
          <button
            onClick={() => setMode('register')}
            className={`flex-1 py-2 font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              mode === 'register' ? 'bg-sky-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus size={14} />
            Create Account
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'register' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300">Username</label>
                <span className="text-[10px] text-slate-500">e.g. Alex_Mastery</span>
              </div>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. Alex_Mastery (Your display name)"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white outline-none placeholder-slate-500"
                />
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-300">Email Address</label>
              <span className="text-[10px] text-slate-500">e.g. student@school.edu</span>
            </div>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. alex@student.edu"
                className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white outline-none placeholder-slate-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-300">Password</label>
              <span className="text-[10px] text-slate-500">Min 6 characters</span>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="•••••••• (Enter your secret password)"
                className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white outline-none placeholder-slate-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full btn-primary text-xs py-3 justify-center mt-2"
          >
            {isSubmitting ? 'Authenticating...' : mode === 'login' ? 'Sign In to BEE' : 'Create Free Account'}
            <ArrowRight size={15} />
          </button>
        </form>

        {/* Security Notice */}
        <div className="p-3 bg-sky-500/10 border border-sky-500/20 rounded-xl flex items-center justify-between text-xs text-sky-300">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-sky-400" />
            <span>Prepared for Supabase Cloud Sync</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white underline text-[11px]"
          >
            Continue as Guest
          </button>
        </div>
      </div>
    </div>
  );
}
