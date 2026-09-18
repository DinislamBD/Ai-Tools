import React from 'react';
import { Home, FolderOpen, Wrench, Settings } from 'lucide-react';
import { playHaptic } from '../../services/haptics';

export type MainTab = 'home' | 'library' | 'pdf_tools' | 'settings';

interface IOSTabBarProps {
  currentTab: MainTab;
  onSelectTab: (tab: MainTab) => void;
  dark?: boolean;
}

export const IOSTabBar: React.FC<IOSTabBarProps> = ({
  currentTab,
  onSelectTab,
  dark = false,
}) => {
  const tabs: { id: MainTab; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Home', icon: <Home size={22} strokeWidth={currentTab === 'home' ? 2.4 : 1.8} /> },
    { id: 'library', label: 'Library', icon: <FolderOpen size={22} strokeWidth={currentTab === 'library' ? 2.4 : 1.8} /> },
    { id: 'pdf_tools', label: 'PDF Tools', icon: <Wrench size={22} strokeWidth={currentTab === 'pdf_tools' ? 2.4 : 1.8} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={22} strokeWidth={currentTab === 'settings' ? 2.4 : 1.8} /> },
  ];

  return (
    <div
      className={`w-full h-[52px] border-t backdrop-blur-xl flex items-center justify-around px-2 z-30 shrink-0 select-none ${
        dark
          ? 'bg-neutral-900/90 border-neutral-800 text-neutral-400'
          : 'bg-white/90 border-neutral-200 text-neutral-400'
      }`}
    >
      {tabs.map((tab) => {
        const isActive = currentTab === tab.id;
        return (
          <button
            key={tab.id}
            id={`tab-btn-${tab.id}`}
            onClick={() => {
              playHaptic('selection');
              onSelectTab(tab.id);
            }}
            className={`flex-1 flex flex-col items-center justify-center py-1 transition cursor-pointer active:scale-95 ${
              isActive ? 'text-blue-600 dark:text-blue-400' : 'hover:text-neutral-600 dark:hover:text-neutral-300'
            }`}
          >
            <div className="relative">
              {tab.icon}
            </div>
            <span
              className={`text-[10px] tracking-tight mt-0.5 ${
                isActive ? 'font-semibold' : 'font-medium'
              }`}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};
