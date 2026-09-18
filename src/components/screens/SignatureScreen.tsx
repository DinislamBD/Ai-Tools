import React, { useState, useRef, useEffect } from 'react';
import { RotateCcw, Check, Trash2, Stamp, PenTool, Sparkles } from 'lucide-react';
import { SignatureSaved, SignatureStamp } from '../../types';
import { StorageService } from '../../services/storage';
import { playHaptic } from '../../services/haptics';
import { IOSNavigationBar } from '../common/IOSNavigationBar';

interface SignatureScreenProps {
  onApplySignature: (stamp: SignatureStamp) => void;
  onCancel: () => void;
}

export const SignatureScreen: React.FC<SignatureScreenProps> = ({
  onApplySignature,
  onCancel,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#0f172a');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [hasSignature, setHasSignature] = useState(false);
  const [savedSignatures, setSavedSignatures] = useState<SignatureSaved[]>([]);
  const [selectedSavedId, setSelectedSavedId] = useState<string | null>(null);

  useEffect(() => {
    setSavedSignatures(StorageService.getSignatures());
  }, []);

  const clearCanvas = () => {
    playHaptic('light');
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    setSelectedSavedId(null);
  };

  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasSignature(true);
    setSelectedSavedId(null);

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = color;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleApply = () => {
    playHaptic('success');
    let dataUrl = '';

    if (selectedSavedId) {
      const found = savedSignatures.find(s => s.id === selectedSavedId);
      if (found) dataUrl = found.dataUrl;
    } else if (canvasRef.current) {
      dataUrl = canvasRef.current.toDataURL('image/png');
      // Save signature for future reuse
      const newSig: SignatureSaved = {
        id: `sig-${Date.now()}`,
        title: `Signature ${savedSignatures.length + 1}`,
        dataUrl,
        createdAt: new Date().toISOString(),
      };
      StorageService.saveSignature(newSig);
    }

    if (!dataUrl) return;

    const stamp: SignatureStamp = {
      id: `stamp-${Date.now()}`,
      signatureId: `sig-${Date.now()}`,
      dataUrl,
      x: 100,
      y: 350,
      width: 160,
      height: 70,
      rotation: 0,
    };

    onApplySignature(stamp);
  };

  return (
    <div className="flex-1 bg-neutral-900 text-white flex flex-col justify-between select-none">
      <IOSNavigationBar
        title="Digital Signature"
        dark
        onBack={onCancel}
        backTitle="Cancel"
        trailingActions={
          <button
            id="btn-sig-apply"
            onClick={handleApply}
            disabled={!hasSignature && !selectedSavedId}
            className="text-xs font-bold text-teal-400 disabled:opacity-40 px-3 py-1 bg-teal-500/20 border border-teal-500/30 rounded-full active:scale-95 transition cursor-pointer"
          >
            Insert
          </button>
        }
      />

      {/* Main Signature Pad */}
      <div className="flex-1 p-4 flex flex-col items-center justify-center">
        <div className="w-full max-w-sm h-64 bg-white rounded-2xl shadow-2xl relative overflow-hidden flex items-center justify-center border-2 border-neutral-700">
          <canvas
            ref={canvasRef}
            width={360}
            height={240}
            onPointerDown={startDrawing}
            onPointerMove={draw}
            onPointerUp={stopDrawing}
            onPointerLeave={stopDrawing}
            className="w-full h-full cursor-crosshair touch-none"
          />

          {/* Guidelines */}
          <div className="absolute inset-x-8 bottom-12 border-b border-dashed border-neutral-300 pointer-events-none flex justify-between text-[10px] text-neutral-400">
            <span>Sign on the line above</span>
            <span className="font-mono">X</span>
          </div>

          {!hasSignature && !selectedSavedId && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-neutral-300">
              <span className="text-xs font-medium">Draw signature with finger or Apple Pencil</span>
            </div>
          )}
        </div>

        {/* Color and Width Bar */}
        <div className="w-full max-w-sm mt-3 px-3 py-2 bg-neutral-800 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            {[
              { label: 'Black', hex: '#0f172a' },
              { label: 'Navy', hex: '#1e3a8a' },
              { label: 'Blue', hex: '#2563eb' },
              { label: 'Charcoal', hex: '#334155' },
            ].map((c) => (
              <button
                key={c.hex}
                onClick={() => {
                  playHaptic('selection');
                  setColor(c.hex);
                }}
                className={`w-6 h-6 rounded-full border-2 transition cursor-pointer ${
                  color === c.hex ? 'border-white scale-110 shadow-md' : 'border-transparent opacity-70'
                }`}
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>

          <button
            onClick={clearCanvas}
            className="flex items-center gap-1 text-xs text-neutral-400 hover:text-white transition cursor-pointer"
          >
            <RotateCcw size={13} />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Saved Signatures Shelf */}
      {savedSignatures.length > 0 && (
        <div className="px-4 py-3 bg-neutral-950 border-t border-neutral-800">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-2">
            Saved Signatures
          </span>
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {savedSignatures.map((sig) => (
              <div
                key={sig.id}
                onClick={() => {
                  playHaptic('selection');
                  setSelectedSavedId(sig.id);
                  setHasSignature(false);
                }}
                className={`shrink-0 w-24 h-14 bg-white rounded-lg p-1 border-2 transition cursor-pointer flex items-center justify-center ${
                  selectedSavedId === sig.id ? 'border-teal-500 ring-2 ring-teal-500/30' : 'border-neutral-700 opacity-80'
                }`}
              >
                <img src={sig.dataUrl} alt={sig.title} className="max-h-full max-w-full object-contain" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
