import React, { useState } from 'react';
import { ScanLine, FileSearch, FileText, ShieldCheck, ArrowRight } from 'lucide-react';
import { playHaptic } from '../../services/haptics';

interface OnboardingScreenProps {
  onComplete: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: 'Scan Anything',
      subtitle: 'Turn paper documents into high-quality digital files.',
      badge: 'Auto Boundary Detection',
      icon: <ScanLine size={48} className="text-blue-500" />,
      color: 'from-blue-500/20 to-cyan-500/10',
      tag: 'Receipts • Contracts • IDs • Books',
    },
    {
      title: 'Smart OCR',
      subtitle: 'Extract searchable text from your documents.',
      badge: 'Apple Vision Powered',
      icon: <FileSearch size={48} className="text-indigo-500" />,
      color: 'from-indigo-500/20 to-purple-500/10',
      tag: 'English • Bengali • Italian & 5+ Languages',
    },
    {
      title: 'Professional PDFs',
      subtitle: 'Create, organize and share PDFs easily.',
      badge: 'PDFKit Engine',
      icon: <FileText size={48} className="text-emerald-500" />,
      color: 'from-emerald-500/20 to-teal-500/10',
      tag: 'Merge • Split • Compress • Sign • Watermark',
    },
    {
      title: 'Your Documents, Your Privacy',
      subtitle: 'Keep your documents secure on your device.',
      badge: '100% On-Device Storage',
      icon: <ShieldCheck size={48} className="text-blue-500" />,
      color: 'from-blue-500/20 to-sky-500/10',
      tag: 'Face ID / Touch ID • Keychain Encrypted',
    },
  ];

  const current = steps[currentStep];

  const handleNext = () => {
    playHaptic('medium');
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    playHaptic('light');
    onComplete();
  };

  return (
    <div className="flex-1 bg-neutral-950 text-white flex flex-col justify-between p-6 select-none relative overflow-hidden">
      {/* Top Bar: Skip button */}
      <div className="flex justify-end items-center z-10 pt-2">
        <button
          id="btn-onboarding-skip"
          onClick={handleSkip}
          className="text-xs font-semibold text-neutral-400 hover:text-white px-3 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 transition active:scale-95 cursor-pointer"
        >
          Skip
        </button>
      </div>

      {/* Main Illustration Area */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-4 relative z-10">
        <div className={`w-32 h-32 rounded-3xl bg-gradient-to-br ${current.color} border border-neutral-800 flex items-center justify-center shadow-2xl mb-8 relative transition-all duration-300 transform scale-105`}>
          <div className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-700/50 backdrop-blur-md shadow-inner">
            {current.icon}
          </div>
          <span className="absolute -bottom-3 bg-neutral-900 border border-neutral-700 text-cyan-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-md whitespace-nowrap">
            {current.badge}
          </span>
        </div>

        <h2 className="text-2xl font-bold tracking-tight text-white mb-2">
          {current.title}
        </h2>
        <p className="text-sm text-neutral-400 max-w-xs leading-relaxed mb-4">
          {current.subtitle}
        </p>

        <span className="text-[11px] font-medium text-neutral-500 bg-neutral-900/70 border border-neutral-800 px-3 py-1 rounded-full">
          {current.tag}
        </span>
      </div>

      {/* Footer Navigation & Progress Dots */}
      <div className="w-full flex flex-col items-center gap-5 z-10 pb-4">
        {/* Step Indicators */}
        <div className="flex items-center gap-2">
          {steps.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentStep ? 'w-6 bg-blue-500' : 'w-1.5 bg-neutral-700'
              }`}
            />
          ))}
        </div>

        {/* Primary Continue Button */}
        <button
          id="btn-onboarding-continue"
          onClick={handleNext}
          className="w-full py-3.5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white font-semibold text-[15px] shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition cursor-pointer"
        >
          <span>{currentStep === steps.length - 1 ? 'Get Started' : 'Continue'}</span>
          <ArrowRight size={16} strokeWidth={2.4} />
        </button>
      </div>
    </div>
  );
};
