import React, { useState } from 'react';
import { Check, Sparkles, X, ShieldCheck, Zap, Crown } from 'lucide-react';
import { playHaptic } from '../../services/haptics';

interface SubscriptionPaywallScreenProps {
  onDismiss: () => void;
  onSubscribe: (tier: 'monthly' | 'annual' | 'lifetime') => void;
  onRestore: () => void;
}

export const SubscriptionPaywallScreen: React.FC<SubscriptionPaywallScreenProps> = ({
  onDismiss,
  onSubscribe,
  onRestore,
}) => {
  const [selectedTier, setSelectedTier] = useState<'monthly' | 'annual' | 'lifetime'>('annual');

  const proFeatures = [
    'Unlimited HD Document & Batch Scanning',
    'High-Precision Vision OCR in 8+ Languages',
    'No Watermarks on Exported PDF Files',
    'Digital Signatures & Apple Pencil Annotation',
    'PDF Suite: Merge, Split & Smart Compression',
    'Biometric App Lock & Encrypted Vault',
  ];

  return (
    <div className="flex-1 bg-neutral-950 text-white flex flex-col justify-between overflow-y-auto select-none p-5 relative">
      {/* Dismiss button */}
      <button
        id="btn-paywall-close"
        onClick={() => {
          playHaptic('light');
          onDismiss();
        }}
        className="absolute top-4 right-4 w-8 h-8 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white transition cursor-pointer z-20"
      >
        <X size={16} />
      </button>

      {/* Hero Branding */}
      <div className="flex flex-col items-center text-center mt-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-neutral-950 shadow-xl shadow-amber-500/20 mb-3">
          <Crown size={28} />
        </div>
        <h2 className="text-xl font-extrabold tracking-tight">DocuScan AI Pro</h2>
        <p className="text-xs text-neutral-400 mt-1 max-w-[260px]">
          Unlock unlimited document scanning, full OCR, and professional PDF utilities.
        </p>
      </div>

      {/* Features Checklist */}
      <div className="my-5 bg-neutral-900/70 border border-neutral-800/80 rounded-2xl p-4 space-y-2.5">
        {proFeatures.map((feat, idx) => (
          <div key={idx} className="flex items-center gap-2.5 text-xs text-neutral-200">
            <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Check size={11} strokeWidth={3} />
            </div>
            <span>{feat}</span>
          </div>
        ))}
      </div>

      {/* Pricing Options (StoreKit 2 Products) */}
      <div className="space-y-2.5">
        {/* Annual Option (Featured) */}
        <div
          onClick={() => {
            playHaptic('selection');
            setSelectedTier('annual');
          }}
          className={`p-3.5 rounded-2xl border-2 transition cursor-pointer relative flex items-center justify-between ${
            selectedTier === 'annual'
              ? 'bg-blue-600/15 border-blue-500 shadow-lg shadow-blue-500/10'
              : 'bg-neutral-900 border-neutral-800'
          }`}
        >
          <div className="absolute -top-2.5 right-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wide">
            Best Value • Save 50%
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-sm font-bold text-white">Annual Plan</h4>
              <span className="text-[10px] text-blue-400 font-semibold">(3-day trial)</span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">$29.99 / year ($2.49/mo)</p>
          </div>

          <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
            selectedTier === 'annual' ? 'border-blue-500 bg-blue-500 text-white' : 'border-neutral-700'
          }`}>
            {selectedTier === 'annual' && <Check size={12} strokeWidth={3} />}
          </div>
        </div>

        {/* Monthly Option */}
        <div
          onClick={() => {
            playHaptic('selection');
            setSelectedTier('monthly');
          }}
          className={`p-3.5 rounded-2xl border-2 transition cursor-pointer flex items-center justify-between ${
            selectedTier === 'monthly'
              ? 'bg-blue-600/15 border-blue-500'
              : 'bg-neutral-900 border-neutral-800'
          }`}
        >
          <div>
            <h4 className="text-sm font-bold text-white">Monthly Plan</h4>
            <p className="text-xs text-neutral-400 mt-0.5">$4.99 / month</p>
          </div>

          <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
            selectedTier === 'monthly' ? 'border-blue-500 bg-blue-500 text-white' : 'border-neutral-700'
          }`}>
            {selectedTier === 'monthly' && <Check size={12} strokeWidth={3} />}
          </div>
        </div>

        {/* Lifetime Option */}
        <div
          onClick={() => {
            playHaptic('selection');
            setSelectedTier('lifetime');
          }}
          className={`p-3.5 rounded-2xl border-2 transition cursor-pointer flex items-center justify-between ${
            selectedTier === 'lifetime'
              ? 'bg-blue-600/15 border-blue-500'
              : 'bg-neutral-900 border-neutral-800'
          }`}
        >
          <div>
            <h4 className="text-sm font-bold text-white">Lifetime Access</h4>
            <p className="text-xs text-neutral-400 mt-0.5">$69.99 one-time payment</p>
          </div>

          <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
            selectedTier === 'lifetime' ? 'border-blue-500 bg-blue-500 text-white' : 'border-neutral-700'
          }`}>
            {selectedTier === 'lifetime' && <Check size={12} strokeWidth={3} />}
          </div>
        </div>
      </div>

      {/* Main Subscribe CTA */}
      <div className="mt-5 space-y-3">
        <button
          id="btn-paywall-subscribe"
          onClick={() => {
            playHaptic('success');
            onSubscribe(selectedTier);
          }}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-blue-600/30 active:scale-[0.98] transition cursor-pointer"
        >
          {selectedTier === 'annual' ? 'Start 3-Day Free Trial' : 'Continue'}
        </button>

        <div className="flex items-center justify-center gap-4 text-[11px] text-neutral-500">
          <button
            onClick={() => {
              playHaptic('light');
              onRestore();
            }}
            className="hover:text-neutral-300 transition cursor-pointer"
          >
            Restore Purchases
          </button>
          <span>•</span>
          <a href="#" onClick={(e) => { e.preventDefault(); alert('Terms of Service: Standard Apple EULA applies.'); }} className="hover:text-neutral-300 transition">
            Terms of Use
          </a>
          <span>•</span>
          <a href="#" onClick={(e) => { e.preventDefault(); alert('Privacy Policy: All document scanning and OCR is performed 100% locally on your device.'); }} className="hover:text-neutral-300 transition">
            Privacy Policy
          </a>
        </div>
      </div>
    </div>
  );
};
