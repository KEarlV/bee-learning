import React, { useState } from 'react';
import { Flame, ShieldCheck, Calendar, ChevronLeft, ChevronRight, X, Trophy } from 'lucide-react';
import BeeAnimatedMascot from './BeeAnimatedMascot';

export default function StreakCalendarModal({ isOpen, onClose, userStats }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  if (!isOpen) return null;

  const userXp = userStats?.totalXp ?? 0;
  // If user has 0 XP or is newly registered, streak is 1 (Day 1 for today)
  const currentStreak = (userXp === 0 || (userStats?.currentStreak === 5 && userXp < 100)) ? 1 : (userStats?.currentStreak ?? 1);
  const longestStreak = userStats?.longestStreak ? Math.max(currentStreak, userStats.longestStreak) : currentStreak;
  const today = new Date();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const isStreakDay = (dayNumber) => {
    const checkMidnight = new Date(year, month, dayNumber).setHours(0, 0, 0, 0);
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate()).setHours(0, 0, 0, 0);
    const diffDays = Math.round((todayMidnight - checkMidnight) / (1000 * 3600 * 24));
    return diffDays >= 0 && diffDays < currentStreak;
  };

  const isToday = (dayNumber) => {
    return (
      today.getDate() === dayNumber &&
      today.getMonth() === month &&
      today.getFullYear() === year
    );
  };

  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md select-none overflow-y-auto">
      <div className="glass-panel w-full max-w-md p-4 sm:p-6 relative border-amber-500/40 shadow-2xl space-y-3.5 sm:space-y-4 rounded-3xl max-h-[92vh] overflow-y-auto my-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors z-10"
        >
          <X size={18} />
        </button>

        {/* Header Mascot & Streak Counter */}
        <div className="text-center space-y-1.5 pt-1">
          <div className="relative inline-block">
            <BeeAnimatedMascot size="md" animated={true} flightPath={true} className="mx-auto" />
            <div className="absolute -bottom-1 right-0 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 p-1 rounded-full shadow-lg border-2 border-slate-950">
              <Flame size={14} className="fill-slate-950" />
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display flex items-center justify-center gap-2">
            <Flame className="text-amber-400 fill-amber-400 animate-pulse" size={24} />
            <span>{currentStreak} Day Streak!</span>
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-300 max-w-xs mx-auto">
            You're on fire! Study every day to keep your memory decay curve protected.
          </p>
        </div>

        {/* Streak Protection Shield */}
        <div className="p-2.5 sm:p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-between text-xs text-amber-300">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-amber-400 shrink-0" />
            <div>
              <p className="font-bold text-[11px] sm:text-xs">Streak Freeze Active</p>
              <p className="text-[9px] sm:text-[10px] text-amber-400/80">Your streak is safe if you miss 1 day</p>
            </div>
          </div>
          <span className="text-[9px] sm:text-[10px] font-extrabold bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30 shrink-0">
            PROTECTED
          </span>
        </div>

        {/* Calendar Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 sm:p-4 space-y-2.5">
          {/* Calendar Header Navigation */}
          <div className="flex items-center justify-between text-xs font-bold text-slate-200 px-1">
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-amber-400" />
              <span>{monthNames[month]} {year}</span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={prevMonth}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={nextMonth}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 text-center text-[10px] font-bold text-slate-500 py-1 border-b border-slate-800">
            {daysOfWeek.map((day, idx) => (
              <div key={idx}>{day}</div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 sm:gap-1.5 text-center text-xs">
            {/* Empty slots for first week offset */}
            {Array.from({ length: firstDayIndex }).map((_, idx) => (
              <div key={`empty-${idx}`} className="h-7 sm:h-8" />
            ))}

            {/* Month days */}
            {Array.from({ length: totalDays }).map((_, idx) => {
              const dayNum = idx + 1;
              const active = isStreakDay(dayNum);
              const todayFlag = isToday(dayNum);

              return (
                <div
                  key={`day-${dayNum}`}
                  className={`h-7 sm:h-8 rounded-xl flex items-center justify-center font-bold text-[11px] sm:text-xs relative transition-all ${
                    active
                      ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-slate-950 shadow-md font-extrabold scale-105'
                      : todayFlag
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-400'
                      : 'bg-slate-950/60 text-slate-400 border border-slate-800/60'
                  }`}
                >
                  {active ? (
                    <Flame size={13} className="fill-slate-950 text-slate-950" />
                  ) : (
                    dayNum
                  )}

                  {todayFlag && !active && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-sky-400 rounded-full animate-ping" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Streak Stats Summary Footer */}
        <div className="grid grid-cols-2 gap-2.5 text-xs">
          <div className="p-2.5 bg-slate-900/80 border border-slate-800 rounded-2xl flex items-center gap-2">
            <div className="p-1.5 bg-amber-500/10 text-amber-400 rounded-xl">
              <Flame size={14} className="fill-amber-400" />
            </div>
            <div>
              <p className="text-[9px] text-slate-400 font-bold uppercase">Current Streak</p>
              <p className="font-extrabold text-white text-xs sm:text-sm">{currentStreak} Days</p>
            </div>
          </div>

          <div className="p-2.5 bg-slate-900/80 border border-slate-800 rounded-2xl flex items-center gap-2">
            <div className="p-1.5 bg-sky-500/10 text-sky-400 rounded-xl">
              <Trophy size={14} />
            </div>
            <div>
              <p className="text-[9px] text-slate-400 font-bold uppercase">Best Streak</p>
              <p className="font-extrabold text-white text-xs sm:text-sm">{longestStreak} Days</p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          className="w-full btn-primary py-2.5 justify-center text-xs font-bold"
        >
          Keep Studying to Extend Streak
        </button>
      </div>
    </div>
  );
}
