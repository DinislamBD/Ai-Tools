import React from 'react';
import { RotateCw, Crop, Wand2, Plus, Check, Trash2, ArrowLeft } from 'lucide-react';
import { DocumentPage } from '../../types';
import { playHaptic } from '../../services/haptics';

interface ScanPreviewScreenProps {
  page: DocumentPage;
  totalPages: number;
  onRetake: () => void;
  onCrop: () => void;
  onFilter: () => void;
  onAddMore: () => void;
  onDone: () => void;
}

export const ScanPreviewScreen: React.FC<ScanPreviewScreenProps> = ({
  page,
  totalPages,
  onRetake,
  onCrop,
  onFilter,
  onAddMore,
  onDone,
}) => {
  return (
    <div className="flex-1 bg-neutral-950 text-white flex flex-col justify-between select-none">
      {/* Top Navigation */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-neutral-800 bg-neutral-900/60 backdrop-blur-md">
        <button
          id="btn-preview-retake"
          onClick={() => {
            playHaptic('light');
            onRetake();
          }}
          className="text-xs font-semibold text-neutral-300 hover:text-white flex items-center gap-1 active:scale-95 transition cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Retake</span>
        </button>

        <span className="text-xs font-bold text-neutral-400">
          Page {page.pageNumber} of {totalPages}
        </span>

        <button
          id="btn-preview-done"
          onClick={() => {
            playHaptic('success');
            onDone();
          }}
          className="text-xs font-bold text-blue-400 hover:text-blue-300 px-3 py-1 bg-blue-600/20 rounded-full border border-blue-500/30 active:scale-95 transition cursor-pointer"
        >
          Done
        </button>
      </div>

      {/* Main Document Preview Stage */}
      <div className="flex-1 p-6 flex items-center justify-center overflow-hidden">
        <div className="relative max-w-full max-h-full rounded-xl overflow-hidden shadow-2xl border border-neutral-700/80 bg-neutral-900">
          <img
            src={page.enhancedImage || page.originalImage}
            alt="Scanned Document Preview"
            className="max-h-[500px] w-auto object-contain"
          />
          <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold text-emerald-400">
            {page.filter.toUpperCase().replace('_', ' ')}
          </div>
        </div>
      </div>

      {/* Action Tools Bar */}
      <div className="px-6 py-4 bg-neutral-900/80 backdrop-blur-xl border-t border-neutral-800 flex items-center justify-around gap-2">
        <button
          id="btn-preview-crop"
          onClick={() => {
            playHaptic('medium');
            onCrop();
          }}
          className="flex flex-col items-center gap-1 text-neutral-300 hover:text-white transition active:scale-95 cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-neutral-800 flex items-center justify-center">
            <Crop size={18} />
          </div>
          <span className="text-[10px] font-medium">Crop</span>
        </button>

        <button
          id="btn-preview-filter"
          onClick={() => {
            playHaptic('medium');
            onFilter();
          }}
          className="flex flex-col items-center gap-1 text-neutral-300 hover:text-white transition active:scale-95 cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-neutral-800 flex items-center justify-center text-cyan-400">
            <Wand2 size={18} />
          </div>
          <span className="text-[10px] font-medium">Filter</span>
        </button>

        <button
          id="btn-preview-add-page"
          onClick={() => {
            playHaptic('medium');
            onAddMore();
          }}
          className="flex flex-col items-center gap-1 text-neutral-300 hover:text-white transition active:scale-95 cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/30">
            <Plus size={20} strokeWidth={2.5} />
          </div>
          <span className="text-[10px] font-medium text-blue-400">Add Page</span>
        </button>
      </div>
    </div>
  );
};
