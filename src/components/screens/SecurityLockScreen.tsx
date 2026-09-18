import React, { useState } from 'react';
import { Lock, ScanFace, Delete, Check } from 'lucide-react';
import { playHaptic } from '../../services/haptics';

interface SecurityLockScreenProps {
  correctPasscode?: string;
  onUnlocked: () => void;
}

export const SecurityLockScreen: React.FC<SecurityLockScreenProps> = ({
  correctPasscode = '1234',
  onUnlocked,
}) => {
  const [pin, setPin] = useState<string>('');
  const [isError, setIsError] = useState(false);
  const [faceIdActive, setFaceIdActive] = useState(false);

  const handleDigit = (digit: string) => {
    if (pin.length >= 4) return;
    playHaptic('light');

    const next = pin + digit;
    setPin(next);

    if (next.length === 4) {
      if (next === correctPasscode) {
        playHaptic('success');
        onUnlocked();
      } else {
        playHaptic('error');
        setIsError(true);
        setTimeout(() => {
          setPin('');
          setIsError(false);
        }, 500);
      }
    }
  };

  const handleDelete = () => {
    playHaptic('light');
    setPin(prev => prev.slice(0, -1));
  };

  const handleFaceID = () => {
    playHaptic('medium');
    setFaceIdActive(true);
    setTimeout(() => {
      setFaceIdActive(false);
      playHaptic('success');
      onUnlocked();
    }, 1200);
  };

  return (
    <div className="flex-1 bg-neutral-950 text-white flex flex-col items-center justify-between py-12 px-6 select-none">
      {/* Top Header */}
      <div className="flex flex-col items-center mt-4">
        <div className="w-14 h-14 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-blue-400 mb-3 shadow-lg">
          <Lock size={26} />
        </div>
        <h2 className="text-lg font-bold tracking-tight">DocuScan AI Locked</h2>
        <p className="text-xs text-neutral-400 mt-1">Enter Passcode or use Face ID</p>

        {/* Passcode Dots */}
        <div className={`flex gap-4 mt-6 ${isError ? 'animate-bounce text-rose-500' : ''}`}>
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              className={`w-3.5 h-3.5 rounded-full border-2 transition-all ${
                idx < pin.length
                  ? isError
                    ? 'bg-rose-500 border-rose-500 scale-110'
                    : 'bg-white border-white scale-110'
                  : 'border-neutral-600 bg-transparent'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Keypad */}
      <div className="w-full max-w-xs grid grid-cols-3 gap-4 mb-2">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
          <button
            key={num}
            onClick={() => handleDigit(num)}
            className="w-16 h-16 rounded-full bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-800/80 mx-auto flex items-center justify-center text-xl font-semibold active:bg-neutral-700 transition cursor-pointer"
          >
            {num}
          </button>
        ))}

        {/* Bottom row: Face ID, 0, Delete */}
        <button
          onClick={handleFaceID}
          className="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-neutral-400 hover:text-white transition cursor-pointer"
          title="Face ID"
        >
          <ScanFace size={24} className={faceIdActive ? 'text-blue-400 animate-pulse' : ''} />
        </button>

        <button
          onClick={() => handleDigit('0')}
          className="w-16 h-16 rounded-full bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-800/80 mx-auto flex items-center justify-center text-xl font-semibold active:bg-neutral-700 transition cursor-pointer"
        >
          0
        </button>

        <button
          onClick={handleDelete}
          className="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-neutral-400 hover:text-white transition cursor-pointer"
          title="Delete"
        >
          <Delete size={22} />
        </button>
      </div>

      {/* FaceID Modal Overlay if active */}
      {faceIdActive && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50">
          <div className="w-48 h-48 rounded-3xl bg-neutral-900/95 border border-neutral-700 p-6 flex flex-col items-center justify-center shadow-2xl">
            <ScanFace size={56} className="text-blue-400 animate-pulse mb-3" />
            <span className="text-xs font-bold text-neutral-200">Face ID</span>
          </div>
        </div>
      )}
    </div>
  );
};
