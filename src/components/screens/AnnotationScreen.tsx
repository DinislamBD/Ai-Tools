import React, { useState, useRef, useEffect } from 'react';
import {
  Pen,
  Highlighter,
  Type,
  Square,
  Circle,
  ArrowRight,
  Eraser,
  Undo2,
  Redo2,
  RotateCcw,
  Check,
  Palette
} from 'lucide-react';
import { DocumentPage, AnnotationItem } from '../../types';
import { playHaptic } from '../../services/haptics';
import { IOSNavigationBar } from '../common/IOSNavigationBar';

interface AnnotationScreenProps {
  page: DocumentPage;
  onApply: (updatedPage: DocumentPage) => void;
  onCancel: () => void;
}

type AnnotationTool = 'pen' | 'highlighter' | 'text' | 'rect' | 'circle' | 'arrow' | 'eraser';

export const AnnotationScreen: React.FC<AnnotationScreenProps> = ({
  page,
  onApply,
  onCancel,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [activeTool, setActiveTool] = useState<AnnotationTool>('pen');
  const [color, setColor] = useState('#ef4444'); // Red default markup
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [isDrawing, setIsDrawing] = useState(false);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Initialize canvas with document page image
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const img = new Image();
    img.src = page.enhancedImage || page.originalImage;
    img.onload = () => {
      canvas.width = img.naturalWidth || 800;
      canvas.height = img.naturalHeight || 1100;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const initial = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setHistory([initial]);
      setHistoryIndex(0);
    };
  }, [page]);

  const saveHistorySnapshot = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    const snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const newHistory = history.slice(0, historyIndex + 1);
    setHistory([...newHistory, snapshot]);
    setHistoryIndex(newHistory.length);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      playHaptic('light');
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const prev = history[historyIndex - 1];
      ctx.putImageData(prev, 0, 0);
      setHistoryIndex(historyIndex - 1);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      playHaptic('light');
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const next = history[historyIndex + 1];
      ctx.putImageData(next, 0, 0);
      setHistoryIndex(historyIndex + 1);
    }
  };

  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    ctx.beginPath();
    ctx.moveTo(x, y);

    if (activeTool === 'highlighter') {
      ctx.strokeStyle = color;
      ctx.globalAlpha = 0.35;
      ctx.lineWidth = strokeWidth * 3.5;
    } else if (activeTool === 'eraser') {
      ctx.strokeStyle = '#ffffff';
      ctx.globalAlpha = 1.0;
      ctx.lineWidth = strokeWidth * 4;
    } else {
      ctx.strokeStyle = color;
      ctx.globalAlpha = 1.0;
      ctx.lineWidth = strokeWidth;
    }

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
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.globalAlpha = 1.0;
      }
      saveHistorySnapshot();
    }
  };

  const handleApply = () => {
    playHaptic('success');
    const canvas = canvasRef.current;
    if (!canvas) return;
    const annotatedUrl = canvas.toDataURL('image/jpeg', 0.9);
    onApply({
      ...page,
      enhancedImage: annotatedUrl,
      thumbnailImage: annotatedUrl,
    });
  };

  const colors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#0f172a', '#ffffff'];

  return (
    <div className="flex-1 bg-neutral-950 text-white flex flex-col justify-between select-none">
      <IOSNavigationBar
        title="Annotate &amp; Markup"
        dark
        onBack={onCancel}
        backTitle="Cancel"
        trailingActions={
          <button
            id="btn-annotate-save"
            onClick={handleApply}
            className="text-xs font-bold text-amber-400 px-3 py-1 bg-amber-500/20 border border-amber-500/30 rounded-full active:scale-95 transition cursor-pointer"
          >
            Save
          </button>
        }
      />

      {/* Main Annotation Viewport */}
      <div ref={containerRef} className="flex-1 p-4 flex items-center justify-center overflow-hidden">
        <div className="relative max-w-full max-h-full rounded-lg overflow-hidden shadow-2xl bg-white border border-neutral-800">
          <canvas
            ref={canvasRef}
            onPointerDown={startDrawing}
            onPointerMove={draw}
            onPointerUp={stopDrawing}
            onPointerLeave={stopDrawing}
            className="max-h-[440px] w-auto cursor-crosshair touch-none"
          />
        </div>
      </div>

      {/* Undo/Redo/Palette Toolbar */}
      <div className="bg-neutral-900 border-t border-neutral-800 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {colors.map((c) => (
            <button
              key={c}
              onClick={() => {
                playHaptic('selection');
                setColor(c);
              }}
              className={`w-5 h-5 rounded-full border transition cursor-pointer ${
                color === c ? 'scale-125 border-white ring-2 ring-white/40' : 'border-transparent opacity-70'
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            disabled={historyIndex <= 0}
            onClick={handleUndo}
            className="p-1.5 text-neutral-300 hover:text-white disabled:opacity-30 cursor-pointer"
          >
            <Undo2 size={16} />
          </button>
          <button
            disabled={historyIndex >= history.length - 1}
            onClick={handleRedo}
            className="p-1.5 text-neutral-300 hover:text-white disabled:opacity-30 cursor-pointer"
          >
            <Redo2 size={16} />
          </button>
        </div>
      </div>

      {/* Primary Tool Icons */}
      <div className="bg-neutral-950 px-4 py-3 border-t border-neutral-800 flex items-center justify-around">
        <button
          onClick={() => {
            playHaptic('selection');
            setActiveTool('pen');
          }}
          className={`flex flex-col items-center gap-1 transition cursor-pointer ${
            activeTool === 'pen' ? 'text-amber-400 font-bold' : 'text-neutral-400'
          }`}
        >
          <Pen size={18} />
          <span className="text-[9px]">Pen</span>
        </button>

        <button
          onClick={() => {
            playHaptic('selection');
            setActiveTool('highlighter');
          }}
          className={`flex flex-col items-center gap-1 transition cursor-pointer ${
            activeTool === 'highlighter' ? 'text-amber-400 font-bold' : 'text-neutral-400'
          }`}
        >
          <Highlighter size={18} />
          <span className="text-[9px]">Highlight</span>
        </button>

        <button
          onClick={() => {
            playHaptic('selection');
            setActiveTool('eraser');
          }}
          className={`flex flex-col items-center gap-1 transition cursor-pointer ${
            activeTool === 'eraser' ? 'text-amber-400 font-bold' : 'text-neutral-400'
          }`}
        >
          <Eraser size={18} />
          <span className="text-[9px]">Eraser</span>
        </button>
      </div>
    </div>
  );
};
