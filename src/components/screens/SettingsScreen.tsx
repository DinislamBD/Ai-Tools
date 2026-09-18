import React, { useState } from 'react';
import {
  Crown,
  Moon,
  Globe,
  Lock,
  ScanFace,
  Cloud,
  Trash2,
  HardDrive,
  Info,
  ChevronRight,
  Check,
  Shield,
  Star,
  ExternalLink
} from 'lucide-react';
import { AppSettings, SupportedLanguage } from '../../types';
import { playHaptic } from '../../services/haptics';
import { IOSNavigationBar } from '../common/IOSNavigationBar';

interface SettingsScreenProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onOpenPaywall: () => void;
  onClearCache: () => void;
  onBack?: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  settings,
  onUpdateSettings,
  onOpenPaywall,
  onClearCache,
  onBack,
}) => {
  const [current, setCurrent] = useState<AppSettings>(settings);

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    playHaptic('selection');
    const updated = { ...current, [key]: value };
    setCurrent(updated);
    onUpdateSettings(updated);
  };

  return (
    <div className="flex-1 bg-neutral-100 text-neutral-900 flex flex-col justify-between overflow-y-auto select-none">
      <IOSNavigationBar
        title="Settings"
        largeTitle
        onBack={onBack}
        backTitle="Home"
      />

      <div className="flex-1 p-4 space-y-4">
        {/* Pro Banner */}
        <div
          onClick={() => {
            playHaptic('medium');
            onOpenPaywall();
          }}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-4 text-white shadow-md cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-amber-300">
              <Crown size={22} />
            </div>
            <div>
              <h4 className="text-sm font-bold flex items-center gap-1.5">
                <span>{current.isPro ? 'DocuScan AI Pro Active' : 'Upgrade to Pro'}</span>
                {!current.isPro && (
                  <span className="text-[10px] bg-amber-400 text-neutral-900 font-extrabold px-1.5 py-0.2 rounded-full">
                    50% OFF
                  </span>
                )}
              </h4>
              <p className="text-xs text-blue-100 mt-0.5">
                {current.isPro ? 'All premium tools unlocked' : 'Unlimited scanning & full OCR suite'}
              </p>
            </div>
          </div>
          <ChevronRight size={18} className="text-white/70" />
        </div>

        {/* Scanning Preferences Group */}
        <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-xs overflow-hidden">
          <div className="px-4 py-2 bg-neutral-50/70 border-b border-neutral-100 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
            Scan &amp; Capture
          </div>

          <div className="divide-y divide-neutral-100 text-xs">
            {/* Auto Capture */}
            <div className="p-3.5 flex items-center justify-between">
              <div>
                <h5 className="font-semibold text-neutral-800">Auto-Capture Mode</h5>
                <p className="text-[11px] text-neutral-500">Capture automatically when paper is stable</p>
              </div>
              <input
                type="checkbox"
                checked={current.autoCapture}
                onChange={(e) => updateSetting('autoCapture', e.target.checked)}
                className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
              />
            </div>

            {/* Default Quality */}
            <div className="p-3.5 flex items-center justify-between">
              <span className="font-semibold text-neutral-800">Scan Quality</span>
              <select
                value={current.quality}
                onChange={(e) => updateSetting('quality', e.target.value as any)}
                className="bg-neutral-100 border border-neutral-200 rounded-lg px-2 py-1 font-semibold text-xs cursor-pointer text-neutral-700"
              >
                <option value="draft">Draft (72 DPI)</option>
                <option value="standard">Standard (150 DPI)</option>
                <option value="high">Print HD (300 DPI)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Security & Privacy Group */}
        <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-xs overflow-hidden">
          <div className="px-4 py-2 bg-neutral-50/70 border-b border-neutral-100 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
            Security &amp; Vault
          </div>

          <div className="divide-y divide-neutral-100 text-xs">
            {/* App Lock */}
            <div className="p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Lock size={16} className="text-blue-600" />
                <div>
                  <h5 className="font-semibold text-neutral-800">App Passcode Lock</h5>
                  <p className="text-[11px] text-neutral-500">Require PIN code on startup</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={current.securityLock}
                onChange={(e) => updateSetting('securityLock', e.target.checked)}
                className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
              />
            </div>

            {/* Face ID */}
            <div className="p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ScanFace size={16} className="text-indigo-600" />
                <div>
                  <h5 className="font-semibold text-neutral-800">Face ID Biometrics</h5>
                  <p className="text-[11px] text-neutral-500">Unlock scanner with Face ID</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={current.faceIdEnabled}
                onChange={(e) => updateSetting('faceIdEnabled', e.target.checked)}
                className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Language & Storage */}
        <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-xs overflow-hidden">
          <div className="px-4 py-2 bg-neutral-50/70 border-b border-neutral-100 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
            Language &amp; Storage
          </div>

          <div className="divide-y divide-neutral-100 text-xs">
            <div className="p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Globe size={16} className="text-emerald-600" />
                <span className="font-semibold text-neutral-800">Application Language</span>
              </div>
              <select
                value={current.language}
                onChange={(e) => updateSetting('language', e.target.value as SupportedLanguage)}
                className="bg-neutral-100 border border-neutral-200 rounded-lg px-2 py-1 font-semibold text-xs cursor-pointer text-neutral-700"
              >
                <option value="en">English</option>
                <option value="bn">বাংলা (Bengali)</option>
                <option value="it">Italiano (Italian)</option>
              </select>
            </div>

            {/* Clear Cache */}
            <div
              onClick={() => {
                playHaptic('warning');
                if (confirm('Clear local temporary image cache? Your saved documents will remain safe.')) {
                  onClearCache();
                }
              }}
              className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-neutral-50 transition"
            >
              <div className="flex items-center gap-2.5 text-neutral-800">
                <HardDrive size={16} className="text-amber-500" />
                <span>Clear Scanner Cache</span>
              </div>
              <span className="text-[11px] text-neutral-400">14.2 MB</span>
            </div>
          </div>
        </div>

        {/* About App */}
        <div className="text-center py-3 text-neutral-400 text-xs space-y-1">
          <p className="font-semibold text-neutral-600">DocuScan AI for iOS</p>
          <p className="text-[11px]">Version 1.0.0 (Build 42) • Made with Swift &amp; VisionKit</p>
          <p className="text-[10px] text-neutral-400">100% On-Device Confidentiality Guarantee</p>
        </div>
      </div>
    </div>
  );
};
