import React, { useState, useEffect } from 'react';

const frameSources = [
  '/bee_frame_1.png',
  '/bee_frame_2.png',
  '/bee_frame_3.png',
  '/bee_frame_4.png'
];

export default function BeeAnimatedMascot({
  size = 'md',
  animated = true,
  flightPath = false,
  speechBubble = null,
  className = ''
}) {
  const [currentFrame, setCurrentFrame] = useState(0);

  useEffect(() => {
    if (!animated) return;

    const interval = setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % frameSources.length);
    }, 160);

    return () => clearInterval(interval);
  }, [animated]);

  // Size mapping with strict max constraints
  const sizeStyles = {
    sm: 'w-8 h-8 max-w-[32px] max-h-[32px]',
    md: 'w-14 h-14 max-w-[56px] max-h-[56px]',
    lg: 'w-20 h-20 max-w-[80px] max-h-[80px]',
    xl: 'w-28 h-28 max-w-[112px] max-h-[112px]',
    splash: 'w-32 h-32 max-w-[128px] max-h-[128px]'
  }[size] || 'w-14 h-14 max-w-[56px] max-h-[56px]';

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      {/* Floating Speech Bubble */}
      {speechBubble && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap bg-sky-500/90 text-white text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-lg border border-white/20 backdrop-blur-md animate-bounce z-20 pointer-events-none">
          {speechBubble}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-sky-500 rotate-45" />
        </div>
      )}

      {/* Mascot Image Container */}
      <div
        className={`relative flex items-center justify-center shrink-0 ${
          flightPath ? 'animate-flight-path' : animated ? 'animate-float-bob' : ''
        }`}
      >
        <img
          src={frameSources[currentFrame]}
          alt="Bee AI Mascot"
          className={`${sizeStyles} object-contain filter drop-shadow-[0_0_12px_rgba(30,165,252,0.4)] select-none pointer-events-none shrink-0`}
          onError={(e) => {
            e.target.src = '/logo.png';
          }}
        />
      </div>
    </div>
  );
}
