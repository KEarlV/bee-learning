import React, { useState, useEffect } from 'react';
import { WifiOff, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="bg-amber-500/90 text-slate-950 font-bold text-xs py-1.5 px-4 flex items-center justify-center gap-2 border-b border-amber-400 z-50 shadow-md">
      <WifiOff size={16} className="animate-pulse" />
      <span>Offline Mode Active — Bee is serving local decks from IndexedDB storage!</span>
    </div>
  );
}
