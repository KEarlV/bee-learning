import React, { useState, useEffect } from 'react';
import { ShieldCheck, Eye, EyeOff, Lock, AlertCircle } from 'lucide-react';
import BeeAnimatedMascot from './BeeAnimatedMascot';

// Admin credentials are NOT visible to regular users.
// The admin panel is a completely separate protected route.
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD_HASH = 'bee_admin_2024!'; // Change this before production deployment

export default function AdminLoginPage({ onAdminAuthenticated }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation after mount
    const t = setTimeout(() => setVisible(true), 30);
    return () => clearTimeout(t);
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD_HASH) {
        // Fade out before switching
        setVisible(false);
        setTimeout(() => {
          sessionStorage.setItem('bee_admin_session', 'true');
          onAdminAuthenticated(true);
        }, 250);
      } else {
        setError('Invalid admin credentials. Access denied.');
        setIsLoading(false);
      }
    }, 600);
  };

  return (
    <div className={`min-h-screen bg-slate-950 flex items-center justify-center p-4 transition-opacity duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/50 via-slate-950 to-slate-950 pointer-events-none" />

      <div className={`relative w-full max-w-sm transition-all duration-500 ${visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-6 scale-95'}`}>
        {/* Panel */}
        <div className="glass-panel border-indigo-500/40 p-8 space-y-6 shadow-2xl">
          {/* Header */}
          <div className="text-center space-y-2">
            <BeeAnimatedMascot size="lg" animated={true} className="mx-auto" speechBubble="Admin only area!" />
            <div className="pt-2 space-y-1">
              <div className="flex items-center justify-center gap-2">
                <ShieldCheck className="text-indigo-400" size={20} />
                <h1 className="text-xl font-bold text-white font-display">Admin Access</h1>
              </div>
              <p className="text-xs text-slate-400">BEE AI Study Engine — Admin Control Panel</p>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-[10px] font-bold">
                <Lock size={11} /> RESTRICTED AREA
              </div>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Admin Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. admin"
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none placeholder-slate-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Admin Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 pr-9 py-2.5 text-xs text-white outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300">
                <AlertCircle size={14} className="shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isLoading ? (
                <span className="animate-pulse">Authenticating...</span>
              ) : (
                <>
                  <ShieldCheck size={15} /> Login to Admin Panel
                </>
              )}
            </button>
          </form>

          <p className="text-center text-[10px] text-slate-600">
            Not an admin? <a href="/" className="text-sky-400 hover:underline">Return to App</a>
          </p>
        </div>
      </div>
    </div>
  );
}
