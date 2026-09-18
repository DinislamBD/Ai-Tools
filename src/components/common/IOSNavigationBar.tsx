import React, { ReactNode } from 'react';
import { ChevronLeft } from 'lucide-react';
import { playHaptic } from '../../services/haptics';

interface IOSNavigationBarProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  backTitle?: string;
  trailingActions?: ReactNode;
  largeTitle?: boolean;
  translucent?: boolean;
  dark?: boolean;
}

export const IOSNavigationBar: React.FC<IOSNavigationBarProps> = ({
  title,
  subtitle,
  onBack,
  backTitle = 'Back',
  trailingActions,
  largeTitle = false,
  translucent = true,
  dark = false,
}) => {
  return (
    <div
      className={`w-full z-30 transition-colors shrink-0 ${
        translucent
          ? dark
            ? 'bg-neutral-900/85 backdrop-blur-xl border-b border-neutral-800 text-white'
            : 'bg-white/85 backdrop-blur-xl border-b border-neutral-200/80 text-neutral-900'
          : dark
          ? 'bg-neutral-900 text-white'
          : 'bg-white text-neutral-900'
      }`}
    >
      <div className="h-11 px-4 flex items-center justify-between relative">
        {/* Leading / Back Button */}
        <div className="flex items-center min-w-[60px] z-10">
          {onBack && (
            <button
              id="btn-nav-back"
              onClick={() => {
                playHaptic('light');
                onBack();
              }}
              className="flex items-center text-blue-600 active:text-blue-700 -ml-1.5 py-1 pr-2 transition cursor-pointer"
            >
              <ChevronLeft size={22} strokeWidth={2.6} />
              <span className="text-[15px] font-normal tracking-tight -ml-0.5">{backTitle}</span>
            </button>
          )}
        </div>

        {/* Center Inline Title (when not largeTitle) */}
        {!largeTitle && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-16">
            <span className="text-[16px] font-semibold tracking-tight truncate max-w-[200px]">
              {title}
            </span>
            {subtitle && (
              <span className="text-[11px] text-neutral-400 font-medium tracking-tight -mt-0.5">
                {subtitle}
              </span>
            )}
          </div>
        )}

        {/* Trailing Actions */}
        <div className="flex items-center justify-end min-w-[60px] z-10 gap-2">
          {trailingActions}
        </div>
      </div>

      {/* Large iOS Header Title */}
      {largeTitle && (
        <div className="px-4 pt-1 pb-2">
          <h1 className="text-[28px] font-bold tracking-tight text-neutral-900 dark:text-white leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[13px] text-neutral-500 font-medium -mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
