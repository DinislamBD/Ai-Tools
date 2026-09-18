import React, { ReactNode } from 'react';
import { Wifi, Battery, Code, Smartphone, Maximize2, ShieldCheck } from 'lucide-react';
import { playHaptic } from '../../services/haptics';

interface IPhoneFrameProps {
  children: ReactNode;
  isLocked?: boolean;
  onHomeClick?: () => void;
  onCodeClick?: () => void;
  isBezelMode?: boolean;
  onToggleBezel?: () => void;
  currentScreenTitle?: string;
  theme?: 'light' | 'dark';
}

export const IPhoneFrame: React.FC<IPhoneFrameProps> = ({
  children,
  onHomeClick,
  onCodeClick,
  isBezelMode = true,
  onToggleBezel,
  theme = 'light'
}) => {
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

  return (
    <div className="min-h-screen w-full bg-neutral-950 flex flex-col items-center justify-center p-0 sm:p-4 md:p-6 select-none font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top utility control bar */}
      <header className="w-full max-w-5xl mb-3 px-4 py-2 bg-neutral-900/80 border border-neutral-800 backdrop-blur-md rounded-2xl flex items-center justify-between text-xs text-neutral-300 shadow-xl hidden sm:flex">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-md shadow-blue-500/20">
            D
          </div>
          <span className="font-semibold tracking-tight text-white">DocuScan AI</span>
          <span className="text-neutral-500 font-normal">|</span>
          <span className="text-neutral-400">iOS 17+ Swift &amp; SwiftUI Production Architecture</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-toggle-device-view"
            onClick={() => {
              playHaptic('selection');
              if (onToggleBezel) onToggleBezel();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition active:scale-95 cursor-pointer font-medium"
          >
            {isBezelMode ? <Maximize2 size={13} /> : <Smartphone size={13} />}
            <span>{isBezelMode ? 'Expand Fullscreen' : 'iPhone 16 Pro Frame'}</span>
          </button>

          <button
            id="btn-open-swift-code"
            onClick={() => {
              playHaptic('selection');
              if (onCodeClick) onCodeClick();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-md shadow-blue-600/30 transition active:scale-95 cursor-pointer"
          >
            <Code size={13} />
            <span>Swift / SwiftUI Codebase</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div
        className={`relative transition-all duration-300 flex flex-col overflow-hidden ${
          isBezelMode
            ? 'w-full max-w-[420px] h-[874px] rounded-[52px] ring-12 ring-neutral-800 shadow-[0_25px_80px_-15px_rgba(0,0,0,0.9)] border-[4px] border-neutral-700/60 bg-white'
            : 'w-full max-w-md h-[92vh] sm:rounded-3xl border border-neutral-800 shadow-2xl bg-white'
        }`}
      >
        {/* Dynamic Island & iOS Status Bar */}
        <div className="w-full pt-2.5 px-7 pb-1 flex items-center justify-between text-[14px] font-semibold tracking-tight z-50 shrink-0 bg-transparent text-neutral-800 pointer-events-auto">
          <span className="w-12 text-left tabular-nums text-neutral-900 font-semibold">{currentTime}</span>

          {/* Dynamic Island */}
          <div className="h-[28px] w-[116px] bg-black rounded-full flex items-center justify-between px-2.5 shadow-md group hover:w-[136px] transition-all cursor-pointer">
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-neutral-400 font-medium tracking-tight">DocuScan</span>
            </div>
            <div className="h-3 w-3 rounded-full bg-neutral-800 flex items-center justify-center">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-400/80" />
            </div>
          </div>

          <div className="w-12 flex items-center justify-end gap-1.5 text-neutral-900">
            <Wifi size={14} strokeWidth={2.4} />
            <Battery size={16} strokeWidth={2.4} className="fill-neutral-900" />
          </div>
        </div>

        {/* Screen Content */}
        <div className="flex-1 overflow-hidden relative flex flex-col">
          {children}
        </div>

        {/* iOS Home Indicator Bar */}
        <div className="w-full pt-1 pb-2 flex justify-center items-center bg-transparent z-40 shrink-0">
          <button
            id="btn-ios-home-indicator"
            onClick={() => {
              playHaptic('medium');
              if (onHomeClick) onHomeClick();
            }}
            className="w-36 h-1.5 bg-neutral-400/70 hover:bg-neutral-600 rounded-full transition cursor-pointer active:scale-90"
            aria-label="Home Indicator"
          />
        </div>
      </div>
    </div>
  );
};
