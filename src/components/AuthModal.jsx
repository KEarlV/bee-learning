import React, { useState, useEffect } from 'react';
import {
  User, Lock, Mail, ArrowRight, ShieldCheck, X,
  LogIn, UserPlus, LogOut, Eye, EyeOff, CheckCircle2, Clock, AlertCircle
} from 'lucide-react';
import BeeAnimatedMascot from './BeeAnimatedMascot';
import { getSupabaseClient } from '../services/supabaseService';

export default function AuthModal({ isOpen, onClose, onAuthSuccess, onLogout, currentUser }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [visible, setVisible] = useState(false);

  // Graceful open/close animation
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setVisible(true), 10);
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const supabase = getSupabaseClient();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      if (!supabase) {
        // Offline / guest fallback
        const userProfile = {
          userId: 'guest-' + Date.now(),
          email: email || 'guest@beestudy.ai',
          username: username || (email ? email.split('@')[0] : 'BeeLearner'),
          avatarUrl: null,
          isAuthenticated: true,
        };
        onAuthSuccess(userProfile);
        handleClose();
        return;
      }

      if (mode === 'register') {
        // Register via Supabase Auth
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { username: username || email.split('@')[0] } }
        });
        if (signUpError) throw signUpError;

        // Insert pending user row
        await supabase.from('user_stats').insert({
          user_id: data.user?.id,
          username: username || email.split('@')[0],
          email,
          account_status: 'pending',
          role: 'user',
        });

        setSuccessMessage('Account created! Awaiting admin approval before you can log in.');
        setIsSubmitting(false);
        return; // Don't close — show pending message
      }

      if (mode === 'login') {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;

        // Check approval status
        const { data: statsRow } = await supabase
          .from('user_stats')
          .select('account_status, username, avatar_url')
          .eq('user_id', data.user.id)
          .single();

        if (statsRow?.account_status === 'pending') {
          await supabase.auth.signOut();
          setError('Your account is pending admin approval. Please wait for access.');
          setIsSubmitting(false);
          return;
        }
        if (statsRow?.account_status === 'rejected') {
          await supabase.auth.signOut();
          setError('Your account access has been denied. Contact support.');
          setIsSubmitting(false);
          return;
        }

        const userProfile = {
          userId: data.user.id,
          email: data.user.email,
          username: statsRow?.username || data.user.user_metadata?.username || email.split('@')[0],
          avatarUrl: statsRow?.avatar_url || null,
          isAuthenticated: true,
        };
        onAuthSuccess(userProfile);
        handleClose();
      }
    } catch (err) {
      const msg = err.message || '';
      if (msg.includes('Invalid login credentials')) {
        setError('Invalid email or password. Check your details or click "Create Account".');
      } else if (msg.includes('Email not confirmed')) {
        setError('Email address not confirmed yet. Please check your inbox or contact your admin.');
      } else {
        setError(msg || 'Something went wrong during sign in. Please try again.');
      }
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 250);
  };

  const handleLogout = async () => {
    if (supabase) await supabase.auth.signOut();
    onLogout?.();
    handleClose();
  };

  // If user is already logged in → show profile/logout panel
  if (currentUser?.isAuthenticated && currentUser?.userId !== 'local_user') {
    return (
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md transition-all duration-250 ${
          visible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div
          className={`glass-panel w-full max-w-sm p-6 relative border-sky-500/40 shadow-2xl space-y-5 transition-all duration-250 ${
            visible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'
          }`}
        >
          <button onClick={handleClose} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">
            <X size={18} />
          </button>

          <div className="text-center space-y-3">
            <BeeAnimatedMascot size="lg" animated={true} speechBubble="Hey there!" className="mx-auto" />
            {currentUser.avatarUrl ? (
              <img src={currentUser.avatarUrl} alt="Avatar" className="w-16 h-16 rounded-full mx-auto object-cover border-2 border-sky-400/50 shadow-lg" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-sky-500/20 border-2 border-sky-400/40 mx-auto flex items-center justify-center text-2xl font-bold text-sky-300">
                {(currentUser.username || 'B').charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold text-white font-display">{currentUser.username}</h2>
              <p className="text-xs text-slate-400">{currentUser.email}</p>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30 inline-block mt-1">
                ✓ Approved & Active
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-bold text-rose-400 border border-rose-500/40 hover:border-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md transition-all duration-250 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div
        className={`glass-panel w-full max-w-md p-6 relative border-sky-500/40 shadow-2xl space-y-5 transition-all duration-250 ${
          visible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'
        }`}
      >
        <button onClick={handleClose} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">
          <X size={18} />
        </button>

        {/* Header */}
        <div className="text-center space-y-2">
          <BeeAnimatedMascot size="lg" animated={true} flightPath={true}
            speechBubble={mode === 'login' ? 'Welcome back!' : 'Join the hive!'}
            className="mx-auto"
          />
          <h2 className="text-2xl font-bold text-white font-display">
            {mode === 'login' ? 'Welcome Back to BEE!' : 'Join BEE AI Study'}
          </h2>
          <p className="text-xs text-slate-400">
            {mode === 'login'
              ? 'Sign in to sync streaks and rank in weekly leagues'
              : 'Register — admin will approve your account before access'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs">
          {[
            { id: 'login', label: 'Sign In', icon: LogIn },
            { id: 'register', label: 'Create Account', icon: UserPlus },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => { setMode(id); setError(''); setSuccessMessage(''); }}
              className={`flex-1 py-2 font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                mode === id ? 'bg-sky-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>

        {/* Success / Pending message */}
        {successMessage && (
          <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300">
            <Clock size={15} className="shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="flex items-start gap-2 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300">
            <AlertCircle size={15} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        {!successMessage && (
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
                    placeholder="e.g. Alex_Mastery"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white outline-none placeholder-slate-500 transition-colors"
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
                  className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white outline-none placeholder-slate-500 transition-colors"
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
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl pl-9 pr-9 py-2.5 text-xs text-white outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-primary text-xs py-3 justify-center mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting
                ? <span className="animate-pulse">Authenticating...</span>
                : <>{mode === 'login' ? 'Sign In to BEE' : 'Create Account'} <ArrowRight size={15} /></>
              }
            </button>
          </form>
        )}

        {/* Footer note */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={13} className="text-sky-500" />
            <span>Secured via Supabase Auth</span>
          </div>
          <button onClick={handleClose} className="text-slate-500 hover:text-slate-300 transition-colors underline text-[11px]">
            Continue as Guest
          </button>
        </div>
      </div>
    </div>
  );
}
