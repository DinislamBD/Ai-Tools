import React, { useState, useEffect, useRef } from 'react';
import { Sliders, Wand2, RotateCcw, Check, Sparkles, Sun, Contrast, Droplet, Zap, Eye } from 'lucide-react';
import { FilterType, ImageAdjustments, DocumentPage } from '../../types';
import { applyDocumentFilters, defaultAdjustments } from '../../services/imageProcessing';
import { playHaptic } from '../../services/haptics';
import { IOSNavigationBar } from '../common/IOSNavigationBar';

interface ImageEnhancementScreenProps {
  page: DocumentPage;
  onApply: (updatedPage: DocumentPage) => void;
  onCancel: () => void;
}

export const ImageEnhancementScreen: React.FC<ImageEnhancementScreenProps> = ({
  page,
  onApply,
  onCancel,
}) => {
  const [currentFilter, setCurrentFilter] = useState<FilterType>(page.filter || 'magic_color');
  const [adjustments, setAdjustments] = useState<ImageAdjustments>(page.adjustments || { ...defaultAdjustments });
  const [activeTab, setActiveTab] = useState<'filters' | 'adjust'>('filters');
  const [previewDataUrl, setPreviewDataUrl] = useState<string>(page.enhancedImage || page.originalImage);
  const [isProcessing, setIsProcessing] = useState(false);

  const filterList: { id: FilterType; label: string; desc: string }[] = [
    { id: 'magic_color', label: 'Magic Color', desc: 'Vibrant text with pure white background' },
    { id: 'document', label: 'Document', desc: 'High contrast black & white paper document' },
    { id: 'black_and_white', label: 'B & W', desc: 'Sharp adaptive binarization' },
    { id: 'grayscale', label: 'Grayscale', desc: 'Clean 8-bit monochromatic tonal scan' },
    { id: 'enhanced', label: 'Enhanced', desc: 'Color edge boost and de-noise' },
    { id: 'auto', label: 'Auto', desc: 'Intelligent balanced lighting' },
    { id: 'low_light', label: 'Low-Light', desc: 'Shadow lift and gamma boost' },
    { id: 'original', label: 'Original', desc: 'Raw camera capture' },
  ];

  // Re-run pipeline when filter or adjustments change
  useEffect(() => {
    let active = true;
    const img = new Image();
    img.src = page.originalImage;
    img.onload = async () => {
      if (!active) return;
      setIsProcessing(true);
      const res = await applyDocumentFilters(img, currentFilter, adjustments, page.rotation);
      if (active) {
        setPreviewDataUrl(res);
        setIsProcessing(false);
      }
    };
    return () => { active = false; };
  }, [currentFilter, adjustments, page.originalImage, page.rotation]);

  const handleSliderChange = (key: keyof ImageAdjustments, value: number) => {
    setAdjustments(prev => ({ ...prev, [key]: value }));
  };

  const handleResetAdjustments = () => {
    playHaptic('light');
    setAdjustments({ ...defaultAdjustments });
  };

  const handleSave = () => {
    playHaptic('success');
    onApply({
      ...page,
      filter: currentFilter,
      adjustments,
      enhancedImage: previewDataUrl,
      thumbnailImage: previewDataUrl,
    });
  };

  return (
    <div className="flex-1 bg-neutral-950 text-white flex flex-col justify-between select-none">
      {/* Navigation */}
      <IOSNavigationBar
        title="Enhance &amp; Filter"
        dark
        onBack={onCancel}
        backTitle="Cancel"
        trailingActions={
          <button
            id="btn-enhance-apply"
            onClick={handleSave}
            className="text-xs font-bold text-blue-400 hover:text-blue-300 px-3 py-1 bg-blue-600/20 rounded-full border border-blue-500/30 active:scale-95 transition cursor-pointer"
          >
            Apply
          </button>
        }
      />

      {/* Real-time Preview Area */}
      <div className="flex-1 relative p-4 flex items-center justify-center overflow-hidden">
        <div className="relative max-h-full max-w-full rounded-lg overflow-hidden shadow-2xl bg-neutral-900 border border-neutral-800">
          <img
            src={previewDataUrl}
            alt="Enhanced Preview"
            className="max-h-[380px] w-auto object-contain"
          />
          {isProcessing && (
            <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded text-[10px] text-cyan-400 font-semibold flex items-center gap-1">
              <Sparkles size={10} className="animate-spin" />
              <span>CoreImage Processing</span>
            </div>
          )}
        </div>
      </div>

      {/* Control Drawer */}
      <div className="bg-neutral-900/90 border-t border-neutral-800 backdrop-blur-xl pb-2">
        {/* Sub-Tab Switcher: Filters vs Adjustments */}
        <div className="px-6 pt-3 pb-2 flex items-center justify-center gap-4">
          <button
            onClick={() => {
              playHaptic('selection');
              setActiveTab('filters');
            }}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
              activeTab === 'filters'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            <Wand2 size={13} />
            <span>Filters</span>
          </button>

          <button
            onClick={() => {
              playHaptic('selection');
              setActiveTab('adjust');
            }}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
              activeTab === 'adjust'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            <Sliders size={13} />
            <span>Adjustments</span>
          </button>
        </div>

        {/* Filters Carousel */}
        {activeTab === 'filters' ? (
          <div className="px-4 py-2 flex items-center gap-3 overflow-x-auto no-scrollbar">
            {filterList.map((f) => (
              <button
                key={f.id}
                onClick={() => {
                  playHaptic('selection');
                  setCurrentFilter(f.id);
                }}
                className={`shrink-0 flex flex-col items-center p-2 rounded-xl border transition cursor-pointer ${
                  currentFilter === f.id
                    ? 'border-blue-500 bg-blue-500/15'
                    : 'border-neutral-800 bg-neutral-900 hover:border-neutral-700'
                }`}
              >
                <div className="w-14 h-18 rounded-md bg-neutral-800 border border-neutral-700 overflow-hidden mb-1 relative">
                  <img
                    src={page.thumbnailImage || page.originalImage}
                    alt={f.label}
                    className={`w-full h-full object-cover ${
                      f.id === 'black_and_white' ? 'contrast-200 grayscale' :
                      f.id === 'grayscale' ? 'grayscale' :
                      f.id === 'magic_color' ? 'contrast-125 saturate-125' :
                      f.id === 'enhanced' ? 'contrast-150' : ''
                    }`}
                  />
                </div>
                <span className={`text-[10px] font-bold tracking-tight ${currentFilter === f.id ? 'text-blue-400' : 'text-neutral-300'}`}>
                  {f.label}
                </span>
              </button>
            ))}
          </div>
        ) : (
          /* Fine-grain Adjustments Sliders */
          <div className="px-5 py-2 max-h-48 overflow-y-auto space-y-3">
            <div className="flex justify-between items-center text-xs text-neutral-400 mb-1">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Precision Sliders</span>
              <button
                onClick={handleResetAdjustments}
                className="flex items-center gap-1 text-[11px] text-blue-400 hover:underline cursor-pointer"
              >
                <RotateCcw size={11} />
                <span>Reset All</span>
              </button>
            </div>

            {/* Brightness */}
            <div>
              <div className="flex justify-between text-[11px] font-medium text-neutral-300 mb-1">
                <span className="flex items-center gap-1"><Sun size={12} /> Brightness</span>
                <span className="tabular-nums font-mono">{adjustments.brightness}</span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                value={adjustments.brightness}
                onChange={(e) => handleSliderChange('brightness', parseInt(e.target.value))}
                className="w-full accent-blue-500 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Contrast */}
            <div>
              <div className="flex justify-between text-[11px] font-medium text-neutral-300 mb-1">
                <span className="flex items-center gap-1"><Contrast size={12} /> Contrast</span>
                <span className="tabular-nums font-mono">{adjustments.contrast}</span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                value={adjustments.contrast}
                onChange={(e) => handleSliderChange('contrast', parseInt(e.target.value))}
                className="w-full accent-blue-500 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Saturation */}
            <div>
              <div className="flex justify-between text-[11px] font-medium text-neutral-300 mb-1">
                <span className="flex items-center gap-1"><Droplet size={12} /> Saturation</span>
                <span className="tabular-nums font-mono">{adjustments.saturation}</span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                value={adjustments.saturation}
                onChange={(e) => handleSliderChange('saturation', parseInt(e.target.value))}
                className="w-full accent-blue-500 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Sharpness */}
            <div>
              <div className="flex justify-between text-[11px] font-medium text-neutral-300 mb-1">
                <span className="flex items-center gap-1"><Zap size={12} /> Sharpness</span>
                <span className="tabular-nums font-mono">{adjustments.sharpness}</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={adjustments.sharpness}
                onChange={(e) => handleSliderChange('sharpness', parseInt(e.target.value))}
                className="w-full accent-blue-500 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Exposure */}
            <div>
              <div className="flex justify-between text-[11px] font-medium text-neutral-300 mb-1">
                <span className="flex items-center gap-1"><Eye size={12} /> Exposure</span>
                <span className="tabular-nums font-mono">{adjustments.exposure}</span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                value={adjustments.exposure}
                onChange={(e) => handleSliderChange('exposure', parseInt(e.target.value))}
                className="w-full accent-blue-500 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
