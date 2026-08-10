import React from 'react';
import { LayoutDashboard, BookOpen, Bot, Sparkles, Trophy } from 'lucide-react';

export default function MobileBottomNav({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'library', label: 'Decks', icon: BookOpen },
    { id: 'askbee', label: 'Ask Bee', icon: Bot },
    { id: 'studio', label: 'AI Scan', icon: Sparkles },
    { id: 'leaderboard', label: 'Leagues', icon: Trophy }
  ];

  return (
    <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-slate-900/95 backdrop-blur-2xl border-t border-slate-800 px-2 py-1.5 flex items-center justify-around shadow-2xl">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all ${
              isActive ? 'text-sky-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Icon size={18} className={isActive ? 'text-sky-400 scale-110' : ''} />
            <span className="text-[10px] font-medium">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
