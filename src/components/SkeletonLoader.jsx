import React from 'react';

export default function SkeletonLoader({ type = 'deck', count = 3 }) {
  if (type === 'deck') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="glass-panel p-5 space-y-3 animate-pulse border-slate-800"
          >
            <div className="flex justify-between">
              <div className="h-4 w-20 bg-slate-800 rounded-full" />
              <div className="h-4 w-4 bg-slate-800 rounded" />
            </div>
            <div className="h-5 w-3/4 bg-slate-800 rounded" />
            <div className="h-3 w-full bg-slate-800/80 rounded" />
            <div className="h-3 w-2/3 bg-slate-800/80 rounded" />
            <div className="pt-3 border-t border-slate-800/80 flex justify-between items-center">
              <div className="h-3 w-16 bg-slate-800 rounded" />
              <div className="h-6 w-20 bg-slate-800 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'card') {
    return (
      <div className="glass-panel p-8 min-h-[260px] flex flex-col justify-between animate-pulse border-slate-800 text-center">
        <div className="h-4 w-24 bg-slate-800 rounded mx-auto" />
        <div className="space-y-2 my-6">
          <div className="h-6 w-4/5 bg-slate-800 rounded mx-auto" />
          <div className="h-6 w-2/3 bg-slate-800 rounded mx-auto" />
        </div>
        <div className="h-4 w-32 bg-slate-800 rounded mx-auto" />
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className="glass-panel p-4 space-y-3 animate-pulse">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex justify-between items-center p-3 bg-slate-900/60 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-800" />
              <div className="h-4 w-28 bg-slate-800 rounded" />
            </div>
            <div className="h-4 w-16 bg-slate-800 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return null;
}
