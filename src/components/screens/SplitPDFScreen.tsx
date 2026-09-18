import React, { useState } from 'react';
import { Scissors, Check } from 'lucide-react';
import { DocumentItem } from '../../types';
import { splitDocument } from '../../services/pdfService';
import { playHaptic } from '../../services/haptics';
import { IOSNavigationBar } from '../common/IOSNavigationBar';

interface SplitPDFScreenProps {
  document: DocumentItem;
  onSplitComplete: (doc1: DocumentItem, doc2: DocumentItem) => void;
  onCancel: () => void;
}

export const SplitPDFScreen: React.FC<SplitPDFScreenProps> = ({
  document: doc,
  onSplitComplete,
  onCancel,
}) => {
  const [splitIndex, setSplitIndex] = useState(1);

  const handleSplit = () => {
    playHaptic('success');
    const [d1, d2] = splitDocument(doc, splitIndex);
    onSplitComplete(d1, d2);
  };

  return (
    <div className="flex-1 bg-neutral-50 text-neutral-900 flex flex-col justify-between overflow-y-auto select-none">
      <IOSNavigationBar
        title="Split PDF"
        subtitle={doc.title}
        onBack={onCancel}
        backTitle="Tools"
        trailingActions={
          <button
            id="btn-split-action"
            onClick={handleSplit}
            disabled={doc.pages.length < 2}
            className="text-xs font-bold text-purple-600 disabled:opacity-40 px-3 py-1 bg-purple-50 border border-purple-200 rounded-full active:scale-95 transition cursor-pointer"
          >
            Split
          </button>
        }
      />

      <div className="flex-1 p-4 space-y-4">
        <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
            Split Configuration
          </h3>
          <p className="text-xs text-neutral-600 mb-3">
            Choose where to divide this {doc.pages.length}-page document into two standalone files.
          </p>

          <div className="flex items-center justify-between text-xs font-semibold text-neutral-800 mb-2">
            <span>Cut after Page:</span>
            <span className="text-purple-600 font-bold text-sm">{splitIndex}</span>
          </div>

          <input
            type="range"
            min="1"
            max={Math.max(1, doc.pages.length - 1)}
            value={splitIndex}
            onChange={(e) => {
              playHaptic('selection');
              setSplitIndex(parseInt(e.target.value));
            }}
            className="w-full accent-purple-600 h-1.5 bg-neutral-200 rounded-lg cursor-pointer"
          />

          <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-neutral-100 text-xs">
            <div className="p-2 rounded-xl bg-purple-50 border border-purple-200 text-center">
              <span className="font-bold text-purple-900 block">Part 1</span>
              <span className="text-purple-700 text-[11px]">Pages 1 to {splitIndex}</span>
            </div>
            <div className="p-2 rounded-xl bg-purple-50 border border-purple-200 text-center">
              <span className="font-bold text-purple-900 block">Part 2</span>
              <span className="text-purple-700 text-[11px]">Pages {splitIndex + 1} to {doc.pages.length}</span>
            </div>
          </div>
        </div>

        {/* Thumbnail Preview strip */}
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            Page Layout
          </span>
          <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
            {doc.pages.map((p, idx) => (
              <div key={p.id} className="relative shrink-0 flex items-center">
                <div className="w-16 h-22 rounded-lg bg-white border border-neutral-200 overflow-hidden shadow-xs relative">
                  <img src={p.thumbnailImage || p.originalImage} alt={`Page ${idx + 1}`} className="w-full h-full object-cover" />
                  <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[9px] font-bold px-1 rounded">
                    {idx + 1}
                  </span>
                </div>
                {idx + 1 === splitIndex && (
                  <div className="mx-1 h-20 w-0.5 bg-purple-500 border-r-2 border-dashed border-purple-500 flex items-center justify-center relative">
                    <Scissors size={14} className="text-purple-600 -ml-1 bg-white rounded-full p-0.5" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
