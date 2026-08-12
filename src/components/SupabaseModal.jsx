import React, { useState } from 'react';
import { Database, Key, ShieldCheck, X, Check, Globe } from 'lucide-react';
import BeeAnimatedMascot from './BeeAnimatedMascot';
import { getSupabaseCredentials, setSupabaseCredentials } from '../services/supabaseService';

export default function SupabaseModal({ isOpen, onClose }) {
  const currentCreds = getSupabaseCredentials();
  const [url, setUrl] = useState(currentCreds.url);
  const [anonKey, setAnonKey] = useState(currentCreds.anonKey);
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    setSupabaseCredentials(url, anonKey);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 select-none">
      <div className="glass-panel w-full max-w-md p-6 relative border-emerald-500/40 shadow-2xl space-y-5 backdrop-blur-2xl bg-slate-900/90">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
        >
          <X size={18} />
        </button>

        {/* Mascot & Header */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Database size={22} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white font-display">Supabase Cloud Connection</h3>
            <p className="text-xs text-slate-400">Connect to your Supabase PostgreSQL Database</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-300">Supabase Project URL</label>
              <span className="text-[10px] text-slate-500">e.g. https://xyz.supabase.co</span>
            </div>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
              <input
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://your-project.supabase.co"
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white outline-none placeholder-slate-500 font-mono"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-300">Supabase Anon Key</label>
              <span className="text-[10px] text-slate-500">public anon key</span>
            </div>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
              <input
                type="password"
                required
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsIn..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white outline-none placeholder-slate-500 font-mono"
              />
            </div>
          </div>

          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2 text-xs text-emerald-300">
            <ShieldCheck size={16} className="shrink-0 text-emerald-400" />
            <span>Enables real-time PostgreSQL WebSocket sync across devices!</span>
          </div>

          <button
            type="submit"
            className="w-full btn-primary text-xs py-2.5 justify-center bg-gradient-to-r from-emerald-500 to-sky-500"
          >
            {isSaved ? (
              <>
                <Check size={16} /> Supabase Connected!
              </>
            ) : (
              <>
                <Database size={16} /> Save & Connect Supabase
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
