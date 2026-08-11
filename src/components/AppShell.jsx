import React, { useState } from 'react';
import {
  LayoutDashboard, BookOpen, Sparkles, Trophy, Mic, BarChart3,
  Flame, Heart, Search, Menu, X, User, Bot, LogOut, Volume2, VolumeX
} from 'lucide-react';
import BeeAnimatedMascot from './BeeAnimatedMascot';
import AuthModal from './AuthModal';
import UserProfileModal from './UserProfileModal';
import StreakCalendarModal from './StreakCalendarModal';
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
  const [streakModalOpen, setStreakModalOpen] = useState(false);

  const isLoggedIn = currentUser?.isAuthenticated && currentUser?.userId !== 'local_user';

  const handleToggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    soundService.setEnabled(next);
  };

  const closeSidebar = () => setSidebarOpen(false);
  const userXp = userStats?.totalXp || 0;
  const currentStreak = userStats?.currentStreak ?? 1;

  const navItems = [
    { id: 'dashboard',   label: 'Dashboard',        icon: LayoutDashboard },
    { id: 'library',     label: 'My Library',        icon: BookOpen },
    { id: 'quick',       label: 'Quick Reviewer',    icon: BookOpen },
    { id: 'askbee',      label: 'Ask Bee Anything',  icon: Bot },
    { id: 'studio',      label: 'AI Scanner Studio', icon: Sparkles },
    { id: 'leaderboard', label: 'Weekly Leagues',    icon: Trophy, badge: userStats?.leagueTier || 'Gold' },
    { id: 'feynman',     label: 'Feynman Method',    icon: Mic },
    { id: 'analytics',   label: 'Exam Analytics',    icon: BarChart3 },
  ];

  return (
    <div className="h-screen w-screen bg-slate-950 text-slate-100 flex flex-col font-sans overflow-hidden select-none">
      <OfflineBanner />

      {/* ── Top Header ─────────────────────────────────────────── */}
      <header className="h-14 sm:h-16 shrink-0 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800/80 px-3 sm:px-5 flex items-center justify-between z-40">
        {/* Left: Hamburger + Logo */}
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden btn-icon shrink-0 w-8 h-8"
            aria-label="Toggle menu"
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          <div
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-1.5 cursor-pointer min-w-0"
          >
            <BeeAnimatedMascot size="sm" animated={true} className="shrink-0" />
            <span className="font-extrabold text-base sm:text-lg font-display tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-sky-400 via-indigo-300 to-amber-300 whitespace-nowrap">
              BEE AI
            </span>
            <span className="hidden sm:inline text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30 whitespace-nowrap">
              GIZMO ENGINE
            </span>
          </div>
        </div>

        {/* Center: Search — only md+ */}
        <div className="hidden md:flex flex-1 max-w-xs mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
            <input
              type="text"
              placeholder="Search decks or concepts..."
              className="w-full bg-slate-950/90 border border-slate-800 focus:border-sky-500 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 outline-none transition-all"
            />
          </div>
        </div>

        {/* Right: Action buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Quick Review — Clean text-only button */}
          <button
            onClick={onOpenQuickReview}
            className="btn-secondary text-xs py-1.5 px-2.5 sm:px-3 text-amber-400 border-amber-500/30 hover:border-amber-500 font-bold"
            title="Quick Review"
          >
            <span>Quick Review</span>
          </button>

          {/* AI Scan */}
          <button
            onClick={onOpenScan}
            className="btn-primary text-xs py-1.5 px-2 sm:px-3 font-bold"
            title="AI Scan"
          >
            <Sparkles size={14} className="shrink-0" />
            <span className="hidden sm:inline">AI Scan</span>
          </button>

          {/* XP — always shown but compact */}
          <div className="flex items-center gap-1 bg-amber-500/15 border border-amber-500/30 text-amber-300 px-2 py-1 rounded-xl text-xs font-extrabold">
            <span>{userXp}<span className="hidden sm:inline"> XP</span></span>
          </div>

          {/* Unlimited Hearts */}
          <div className="hidden xs:flex items-center gap-1 bg-rose-500/15 border border-rose-500/30 text-rose-400 px-2 py-1 rounded-xl text-xs font-bold">
            <Heart size={13} className="fill-rose-500 text-rose-500 animate-pulse shrink-0" />
            <span className="font-extrabold">∞</span>
          </div>

          {/* Streak Badge — Clickable Gizmo Popup Calendar */}
          <button
            onClick={() => setStreakModalOpen(true)}
            className="hidden xs:flex items-center gap-1 bg-amber-500/15 border border-amber-500/30 hover:border-amber-400 text-amber-400 px-2.5 py-1 rounded-xl text-xs font-bold cursor-pointer transition-all active:scale-95"
            title="View Streak Calendar"
          >
            <Flame size={14} className="fill-amber-500 text-amber-500 shrink-0" />
            <span>{currentStreak}d</span>
          </button>

          {/* User auth button */}
          {isLoggedIn ? (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setProfileModalOpen(true)}
                className="flex items-center gap-1.5 px-2 py-1 rounded-xl border border-sky-500/30 hover:border-sky-400 bg-sky-500/10 transition-all"
                title={currentUser.username}
              >
                {currentUser?.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt="Avatar"
                    className="w-6 h-6 rounded-full object-cover border border-sky-400"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-sky-500/30 border border-sky-400/50 flex items-center justify-center text-[10px] font-bold text-sky-300">
                    {(currentUser.username || 'B').charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="hidden sm:inline text-xs font-bold text-sky-300 max-w-[70px] truncate">
                  {currentUser.username}
                </span>
              </button>
              <button
                onClick={() => setAuthModalOpen(true)}
                className="btn-icon w-7 h-7 sm:w-8 sm:h-8 text-rose-400 border-rose-500/30 hover:border-rose-400 hover:bg-rose-500/10"
                title="Sign Out"
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setAuthModalOpen(true)}
              className="flex items-center gap-1 px-2 py-1.5 rounded-xl border border-sky-500/30 hover:border-sky-400 bg-sky-500/10 text-sky-300 text-xs font-bold transition-all"
            >
              <User size={14} className="text-sky-400 shrink-0" />
              <span className="hidden sm:inline">Sign In</span>
            </button>
          )}

          {/* Sound */}
          <button
            onClick={handleToggleSound}
            className={`btn-icon w-7 h-7 sm:w-8 sm:h-8 ${soundOn ? 'text-sky-400 border-sky-500/40' : 'text-slate-500'}`}
            title={soundOn ? 'Mute' : 'Unmute'}
          >
            {soundOn ? <Volume2 size={15} /> : <VolumeX size={15} />}
          </button>
        </div>
      </header>

      {/* ── Body ───────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar backdrop (mobile) */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-20 bg-slate-950/70 backdrop-blur-sm lg:hidden"
            onClick={closeSidebar}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`
            fixed inset-y-0 left-0 z-30 w-64 bg-slate-900/98 backdrop-blur-2xl border-r border-slate-800
            flex flex-col justify-between
            transition-transform duration-300 ease-in-out
            lg:static lg:translate-x-0 lg:w-56
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            pt-14 lg:pt-0
          `}
        >
          <div className="p-3 space-y-0.5 overflow-y-auto flex-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); closeSidebar(); }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30 font-semibold shadow-sm'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon size={16} className={isActive ? 'text-sky-400' : 'text-slate-500'} />
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

          {/* Sidebar footer */}
          <div className="p-3 pb-4">
            <div className="p-3 glass-panel border-sky-500/20 text-center space-y-2 rounded-2xl">
              <BeeAnimatedMascot size="md" animated={true} className="mx-auto" />
              <div className="text-[10px] font-bold text-amber-400 bg-amber-500/10 py-0.5 px-2 rounded-full inline-block border border-amber-500/20">
                ⚡ {userXp} XP
              </div>
              <button
                onClick={() => { setActiveTab('askbee'); closeSidebar(); }}
                className="w-full btn-primary text-xs py-1.5 justify-center"
              >
                Ask Bee Anything!
              </button>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 pb-20 lg:pb-6">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={(tab) => { setActiveTab(tab); closeSidebar(); }}
        currentUser={currentUser}
        onSignIn={() => setAuthModalOpen(true)}
      />

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
        onLogout={() => { onLogout?.(); setAuthModalOpen(false); }}
      />

      <StreakCalendarModal
        isOpen={streakModalOpen}
        onClose={() => setStreakModalOpen(false)}
        userStats={userStats}
      />
    </div>
  );
}
