import React, { useState } from 'react';
import {
  LayoutDashboard, BookOpen, Sparkles, Trophy, Mic, BarChart3,
  Flame, Heart, Zap, Volume2, VolumeX, Search, Menu, X, User, Bot, LogOut
} from 'lucide-react';
import BeeAnimatedMascot from './BeeAnimatedMascot';
import AuthModal from './AuthModal';
import UserProfileModal from './UserProfileModal';
import OfflineBanner from './OfflineBanner';
import MobileBottomNav from './MobileBottomNav';
import { soundService } from '../services/soundService';

export default function AppShell({
  userStats,
  activeTab,
  setActiveTab,
  onOpenScan,
  onOpenQuickReview,
  currentUser,
  onUserAuthChange,
  onLogout,
  onUpdateUserStats,
  children
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [soundOn, setSoundOn] = useState(userStats?.soundEnabled ?? true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const isLoggedIn = currentUser?.isAuthenticated && currentUser?.userId !== 'local_user';

  const handleToggleSound = () => {
    const nextState = !soundOn;
    setSoundOn(nextState);
    soundService.setEnabled(nextState);
  };

  const userXp = userStats?.totalXp || 350;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'library', label: 'My Library', icon: BookOpen },
    { id: 'quick', label: 'Quick Reviewer ⚡', icon: Zap },
    { id: 'askbee', label: 'Ask Bee Anything 🤖', icon: Bot },
    { id: 'studio', label: 'AI Scanner Studio', icon: Sparkles },
    { id: 'leaderboard', label: 'Weekly Leagues', icon: Trophy, badge: userStats?.leagueTier || 'Gold' },
    { id: 'feynman', label: 'Feynman Method', icon: Mic },
    { id: 'analytics', label: 'Exam Analytics', icon: BarChart3 },
  ];

  return (
    <div className="h-screen w-screen bg-slate-950 text-slate-100 flex flex-col font-sans overflow-hidden select-none">
      <OfflineBanner />

      {/* Top Header Navbar */}
      <header className="h-16 shrink-0 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800/80 px-4 lg:px-6 flex items-center justify-between z-40">
        <div className="flex items-center gap-3">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden btn-icon">
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <div onClick={() => setActiveTab('dashboard')} className="flex items-center gap-2.5 cursor-pointer">
            <BeeAnimatedMascot size="sm" animated={true} />
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg font-display tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-sky-400 via-indigo-300 to-amber-300">
                BEE AI
              </span>
              <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30">
                GIZMO ENGINE
              </span>
            </div>
          </div>
        </div>

        <div className="hidden md:flex flex-1 max-w-sm mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
            <input
              type="text"
              placeholder="Search decks or concepts..."
              className="w-full bg-slate-950/90 border border-slate-800 focus:border-sky-500 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 outline-none transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button onClick={onOpenQuickReview} className="btn-secondary text-xs py-1.5 px-3 text-amber-400 border-amber-500/30 hover:border-amber-500">
            <Zap size={14} className="fill-amber-400" />
            <span className="hidden sm:inline">Quick Review</span>
          </button>

          <button onClick={onOpenScan} className="btn-primary text-xs py-1.5 px-3">
            <Sparkles size={14} />
            <span className="hidden sm:inline">AI Scan</span>
          </button>

          {/* Real-Time XP Badge */}
          <div className="flex items-center gap-1 bg-amber-500/15 border border-amber-500/30 text-amber-300 px-2.5 py-1 rounded-xl text-xs font-extrabold">
            <Zap size={15} className="fill-amber-400 text-amber-400" />
            <span>{userXp} XP</span>
          </div>

          {/* Unlimited Hearts */}
          <div className="flex items-center gap-1 bg-rose-500/15 border border-rose-500/30 text-rose-400 px-2.5 py-1 rounded-xl text-xs font-bold">
            <Heart size={15} className="fill-rose-500 text-rose-500 animate-pulse" />
            <span className="text-xs font-extrabold">∞</span>
          </div>

          {/* Streak */}
          <div className="flex items-center gap-1 bg-amber-500/15 border border-amber-500/30 text-amber-400 px-2.5 py-1 rounded-xl text-xs font-bold">
            <Flame size={15} className="fill-amber-500 text-amber-500" />
            <span>{userStats?.currentStreak || 5}d</span>
          </div>

          {/* User Auth Button — Sign In or User Menu */}
          {isLoggedIn ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setProfileModalOpen(true)}
                className="btn-secondary text-xs py-1 px-2.5 flex items-center gap-2 border-sky-500/30 hover:border-sky-400 transition-all"
              >
                {currentUser?.avatarUrl ? (
                  <img src={currentUser.avatarUrl} alt="Avatar" className="w-6 h-6 rounded-full object-cover border border-sky-400" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-sky-500/25 border border-sky-400/50 flex items-center justify-center text-[10px] font-bold text-sky-300">
                    {(currentUser.username || 'B').charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="hidden sm:inline font-bold text-sky-300 max-w-[80px] truncate">
                  {currentUser.username}
                </span>
              </button>
              <button
                onClick={() => setAuthModalOpen(true)}
                className="btn-icon w-8 h-8 text-rose-400 border-rose-500/30 hover:border-rose-400 hover:bg-rose-500/10 transition-all"
                title="Sign Out"
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setAuthModalOpen(true)}
              className="btn-secondary text-xs py-1 px-3 flex items-center gap-2 border-sky-500/30 hover:border-sky-400 transition-all"
            >
              <User size={15} className="text-sky-400" />
              <span className="hidden sm:inline font-bold text-sky-300">Sign In</span>
            </button>
          )}

          {/* Sound Button */}
          <button
            onClick={handleToggleSound}
            className={`btn-icon w-8 h-8 ${soundOn ? 'text-sky-400 border-sky-500/40' : 'text-slate-500'}`}
          >
            {soundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden relative pb-14 lg:pb-0">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-30 w-60 bg-slate-900/95 backdrop-blur-2xl border-r border-slate-800 p-4 transition-transform duration-300 lg:static lg:translate-x-0 flex flex-col justify-between ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-xs transition-all ${
                    isActive
                      ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon size={17} className={isActive ? 'text-sky-400' : 'text-slate-400'} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Sidebar Mascot Footer */}
          <div className="p-3.5 glass-panel border-sky-500/20 text-center space-y-2">
            <BeeAnimatedMascot size="md" animated={true} className="mx-auto" />
            <h4 className="text-xs font-bold text-slate-200">Study with Bee!</h4>
            <div className="text-[10px] font-bold text-amber-400 bg-amber-500/10 py-0.5 px-2 rounded-full inline-block border border-amber-500/20">
              ⚡ {userXp} Total XP
            </div>
            <button onClick={() => setActiveTab('askbee')} className="w-full btn-primary text-xs py-1.5 justify-center">
              Ask Bee Anything!
            </button>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>

      <MobileBottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      <UserProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        currentUser={currentUser}
        userStats={userStats}
        onSaveProfile={(updatedUser, updatedStats) => {
          onUserAuthChange(updatedUser);
          if (onUpdateUserStats) onUpdateUserStats(updatedStats);
        }}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        currentUser={currentUser}
        onAuthSuccess={(user) => { onUserAuthChange(user); setAuthModalOpen(false); }}
        onLogout={() => {
          onLogout?.();
          setAuthModalOpen(false);
        }}
      />
    </div>
  );
}
