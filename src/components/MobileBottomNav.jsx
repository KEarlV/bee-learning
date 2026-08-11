import React from 'react';
import { LayoutDashboard, BookOpen, Bot, Sparkles, Trophy, User } from 'lucide-react';

export default function MobileBottomNav({ activeTab, setActiveTab, currentUser, onSignIn }) {
  const tabs = [
    { id: 'dashboard',   label: 'Home',    icon: LayoutDashboard },
    { id: 'library',     label: 'Decks',   icon: BookOpen },
    { id: 'askbee',      label: 'Ask Bee', icon: Bot },
    { id: 'studio',      label: 'Scan',    icon: Sparkles },
    { id: 'leaderboard', label: 'Leagues', icon: Trophy },
  ];

  const isLoggedIn = currentUser?.isAuthenticated && currentUser?.userId !== 'local_user';

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-slate-900/98 backdrop-blur-2xl border-t border-slate-800/80 shadow-2xl">
      <div className="flex items-center justify-around px-1 py-1 pb-safe">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-xl transition-all duration-150 min-w-[52px] relative active:scale-95"
            >
              {/* Active pill background */}
              {isActive && (
                <span className="absolute inset-0 rounded-xl bg-sky-500/15 border border-sky-500/25" />
              )}
              <Icon
                size={20}
                className={`relative z-10 transition-all duration-150 ${
                  isActive ? 'text-sky-400 scale-110' : 'text-slate-500'
                }`}
              />
              <span
                className={`relative z-10 text-[10px] font-semibold transition-colors duration-150 ${
                  isActive ? 'text-sky-300' : 'text-slate-500'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}

        {/* User/Sign In button as 6th item */}
        <button
          onClick={onSignIn}
          className="flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-xl transition-all duration-150 min-w-[52px] active:scale-95"
        >
          {isLoggedIn && currentUser?.avatarUrl ? (
            <img
              src={currentUser.avatarUrl}
              alt="Avatar"
              className="w-5 h-5 rounded-full object-cover border border-sky-400/60"
            />
          ) : (
            <User size={20} className={isLoggedIn ? 'text-sky-400' : 'text-slate-500'} />
          )}
          <span className={`text-[10px] font-semibold ${isLoggedIn ? 'text-sky-300' : 'text-slate-500'}`}>
            {isLoggedIn ? (currentUser?.username?.split('_')[0] || 'Me') : 'Sign In'}
          </span>
        </button>
      </div>
    </nav>
  );
}
