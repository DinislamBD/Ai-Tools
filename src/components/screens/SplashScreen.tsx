import React, { useEffect } from 'react';
import { Scan, Sparkles } from 'lucide-react';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 1800);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="flex-1 bg-gradient-to-b from-neutral-900 via-neutral-950 to-black text-white flex flex-col items-center justify-center relative overflow-hidden select-none">
      {/* Subtle background glow */}
      <div className="absolute w-72 h-72 rounded-full bg-blue-600/15 blur-3xl -top-12 animate-pulse" />

      {/* App Icon */}
      <div className="relative mb-6">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 p-0.5 shadow-2xl shadow-blue-500/40 flex items-center justify-center">
          <div className="w-full h-full rounded-[22px] bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center relative overflow-hidden">
            <Scan size={44} className="text-white drop-shadow-md" strokeWidth={2.2} />
            {/* Animated scan line */}
            <div className="absolute inset-x-0 h-1 bg-cyan-300/80 shadow-[0_0_12px_rgba(103,232,249,0.9)] animate-bounce" />
          </div>
        </div>
        <div className="absolute -top-1.5 -right-1.5 bg-cyan-400 text-neutral-950 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full shadow-md flex items-center gap-0.5">
          <Sparkles size={9} />
          <span>AI</span>
        </div>
      </div>

      {/* App Title */}
      <h1 className="text-3xl font-extrabold tracking-tight text-white mb-1.5">
        DocuScan <span className="text-blue-400">AI</span>
      </h1>
      <p className="text-xs text-neutral-400 font-medium tracking-wide">
        Premium Document Scanner &amp; PDF Engine
      </p>

      {/* Bottom loader */}
      <div className="absolute bottom-12 flex flex-col items-center gap-2 text-neutral-500 text-[11px]">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
          <span>Initializing VisionKit &amp; CoreImage...</span>
        </div>
        <span className="text-[10px] text-neutral-600">iOS 17+ Native Architecture</span>
      </div>
    </div>
  );
};
