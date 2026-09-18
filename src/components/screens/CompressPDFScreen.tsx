import React, { useState } from 'react';
import { Minimize2, Check, Sparkles, ArrowDown } from 'lucide-react';
import { DocumentItem } from '../../types';
import { compressDocumentPages } from '../../services/pdfService';
import { playHaptic } from '../../services/haptics';
import { IOSNavigationBar } from '../common/IOSNavigationBar';

interface CompressPDFScreenProps {
  document: DocumentItem;
  onCompressComplete: (compressedDoc: DocumentItem) => void;
  onCancel: () => void;
}

export const CompressPDFScreen: React.FC<CompressPDFScreenProps> = ({
  document: doc,
  onCompressComplete,
  onCancel,
}) => {
  const [level, setLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [isCompressing, setIsCompressing] = useState(false);

  const originalSize = doc.fileSize;
  const reductionFactor = level === 'low' ? 0.3 : level === 'medium' ? 0.55 : 0.72;
  const estimatedSize = Math.round(originalSize * (1 - reductionFactor));

  const handleCompress = async () => {
    playHaptic('success');
    setIsCompressing(true);

    const qualityRatio = level === 'low' ? 0.8 : level === 'medium' ? 0.55 : 0.35;
    const res = await compressDocumentPages(doc, qualityRatio);
    setIsCompressing(false);
    onCompressComplete(res);
  };

  return (
    <div className="flex-1 bg-neutral-50 text-neutral-900 flex flex-col justify-between overflow-y-auto select-none">
      <IOSNavigationBar
        title="Compress PDF"
        subtitle={doc.title}
        onBack={onCancel}
        backTitle="Tools"
        trailingActions={
          <button
            id="btn-compress-action"
            onClick={handleCompress}
            disabled={isCompressing}
            className="text-xs font-bold text-emerald-600 disabled:opacity-40 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full active:scale-95 transition cursor-pointer"
          >
            {isCompressing ? 'Compressing...' : 'Compress'}
          </button>
        }
      />

      <div className="flex-1 p-4 space-y-4">
        {/* Compression Comparison Card */}
        <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3">
            Estimated Storage Savings
          </h3>

          <div className="flex items-center justify-around py-3 bg-neutral-50 rounded-xl border border-neutral-100">
            <div className="text-center">
              <span className="text-[11px] font-semibold text-neutral-400 block">Original</span>
              <span className="text-base font-bold text-neutral-800">
                {(originalSize / 1024).toFixed(0)} KB
              </span>
            </div>

            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <ArrowDown size={18} />
            </div>

            <div className="text-center">
              <span className="text-[11px] font-semibold text-emerald-600 block">
                -{Math.round(reductionFactor * 100)}%
              </span>
              <span className="text-base font-bold text-emerald-600">
                {(estimatedSize / 1024).toFixed(0)} KB
              </span>
            </div>
          </div>
        </div>

        {/* Compression Level Selector */}
        <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
            Compression Strategy
          </h3>

          {[
            { id: 'low', title: 'Low Compression', desc: 'Minimal size reduction, preserves ultra HD image detail (~30%)' },
            { id: 'medium', title: 'Medium Compression (Recommended)', desc: 'Balanced compression ideal for email & web sharing (~55%)' },
            { id: 'high', title: 'Maximum Compression', desc: 'Highest size reduction for low-bandwidth archives (~72%)' },
          ].map((item) => (
            <div
              key={item.id}
              onClick={() => {
                playHaptic('selection');
                setLevel(item.id as any);
              }}
              className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                level === item.id
                  ? 'bg-emerald-50/70 border-emerald-300'
                  : 'bg-neutral-50 border-neutral-200'
              }`}
            >
              <div>
                <h4 className="text-[13px] font-bold text-neutral-900">{item.title}</h4>
                <p className="text-[11px] text-neutral-500 mt-0.5">{item.desc}</p>
              </div>
              <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                level === item.id ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-neutral-300'
              }`}>
                {level === item.id && <Check size={12} strokeWidth={3} />}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
