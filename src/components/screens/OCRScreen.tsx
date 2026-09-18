import React, { useState, useEffect } from 'react';
import {
  Copy,
  Check,
  Search,
  Share2,
  Download,
  Languages,
  Sparkles,
  FileText,
  Edit3
} from 'lucide-react';
import { DocumentPage } from '../../types';
import { performOCR, supportedOCRLanguages, OCRResultData } from '../../services/ocrService';
import { playHaptic } from '../../services/haptics';
import { IOSNavigationBar } from '../common/IOSNavigationBar';

interface OCRScreenProps {
  page: DocumentPage;
  onSaveExtractedText: (text: string) => void;
  onBack: () => void;
}

export const OCRScreen: React.FC<OCRScreenProps> = ({
  page,
  onSaveExtractedText,
  onBack,
}) => {
  const [selectedLang, setSelectedLang] = useState('en');
  const [extractedText, setExtractedText] = useState(page.ocrText || '');
  const [isLoading, setIsLoading] = useState(!page.ocrText);
  const [ocrData, setOcrData] = useState<OCRResultData | null>(null);
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    let active = true;

    async function runRecognition() {
      setIsLoading(true);
      const res = await performOCR(page.enhancedImage || page.originalImage, selectedLang, page.ocrText);
      if (active) {
        setOcrData(res);
        setExtractedText(res.fullText);
        setIsLoading(false);
      }
    }

    runRecognition();

    return () => { active = false; };
  }, [selectedLang, page.enhancedImage, page.originalImage]);

  const handleCopy = () => {
    playHaptic('success');
    navigator.clipboard.writeText(extractedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    playHaptic('light');
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'DocuScan AI - OCR Extraction',
          text: extractedText,
        });
      } catch {
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  const handleExportTxt = () => {
    playHaptic('light');
    const blob = new Blob([extractedText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `OCR_Export_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDone = () => {
    playHaptic('success');
    onSaveExtractedText(extractedText);
    onBack();
  };

  // Highlighting matched search query in read mode
  const renderHighlightedText = () => {
    if (!searchQuery.trim()) {
      return <pre className="font-sans whitespace-pre-wrap text-sm leading-relaxed text-neutral-800">{extractedText}</pre>;
    }
    const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = extractedText.split(regex);
    return (
      <pre className="font-sans whitespace-pre-wrap text-sm leading-relaxed text-neutral-800">
        {parts.map((part, i) =>
          regex.test(part) ? (
            <mark key={i} className="bg-amber-300 text-neutral-950 font-semibold px-0.5 rounded">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </pre>
    );
  };

  return (
    <div className="flex-1 bg-neutral-100 text-neutral-900 flex flex-col justify-between select-none">
      {/* Navigation */}
      <IOSNavigationBar
        title="OCR Text Extractor"
        onBack={onBack}
        backTitle="Editor"
        trailingActions={
          <button
            id="btn-ocr-save"
            onClick={handleDone}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 px-3 py-1 bg-blue-50 rounded-full border border-blue-200 active:scale-95 transition cursor-pointer"
          >
            Done
          </button>
        }
      />

      {/* Language Bar & Status Header */}
      <div className="px-4 py-2.5 bg-white border-b border-neutral-200 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2">
          <Languages size={16} className="text-blue-600" />
          <select
            value={selectedLang}
            onChange={(e) => {
              playHaptic('selection');
              setSelectedLang(e.target.value);
            }}
            className="text-xs font-semibold bg-neutral-100 border border-neutral-200 rounded-lg px-2 py-1 text-neutral-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            {supportedOCRLanguages.map(lang => (
              <option key={lang.code} value={lang.code}>
                {lang.name} ({lang.native})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
          <Sparkles size={11} />
          <span>{isLoading ? 'Recognizing...' : `${Math.round((ocrData?.confidence || 0.98) * 100)}% Confidence`}</span>
        </div>
      </div>

      {/* Search within Extracted Text */}
      <div className="px-4 pt-2.5 pb-1 bg-white">
        <div className="relative flex items-center">
          <Search size={14} className="absolute left-3 text-neutral-400" />
          <input
            type="text"
            placeholder="Search in extracted text..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-4 py-1.5 bg-neutral-100 border border-neutral-200 rounded-xl text-xs text-neutral-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Main Text Content Stage */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-neutral-200 min-h-[300px] relative">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-neutral-100 text-xs text-neutral-400 font-medium">
            <span className="flex items-center gap-1">
              <FileText size={13} />
              <span>Apple Vision Recognition Engine</span>
            </span>
            <button
              onClick={() => {
                playHaptic('light');
                setIsEditing(!isEditing);
              }}
              className="flex items-center gap-1 text-blue-600 font-semibold hover:underline cursor-pointer"
            >
              <Edit3 size={12} />
              <span>{isEditing ? 'Preview Mode' : 'Edit Text'}</span>
            </button>
          </div>

          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center text-neutral-400 gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
              <span className="text-xs font-semibold">Running VNRecognizeTextRequest...</span>
            </div>
          ) : isEditing ? (
            <textarea
              value={extractedText}
              onChange={(e) => setExtractedText(e.target.value)}
              className="w-full h-80 p-2 text-sm text-neutral-800 leading-relaxed font-sans border-0 focus:ring-0 focus:outline-hidden resize-none"
              placeholder="Type or edit extracted OCR text..."
            />
          ) : (
            renderHighlightedText()
          )}
        </div>
      </div>

      {/* Bottom Action Strip */}
      <div className="px-4 py-3 bg-white border-t border-neutral-200 flex items-center justify-between gap-2 shadow-sm">
        <button
          id="btn-ocr-copy"
          onClick={handleCopy}
          className={`flex-1 py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold transition active:scale-95 cursor-pointer ${
            copied
              ? 'bg-emerald-600 text-white'
              : 'bg-neutral-900 text-white hover:bg-neutral-800'
          }`}
        >
          {copied ? <Check size={14} strokeWidth={2.5} /> : <Copy size={14} />}
          <span>{copied ? 'Copied!' : 'Copy Text'}</span>
        </button>

        <button
          id="btn-ocr-share"
          onClick={handleShare}
          className="p-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 text-neutral-700 active:scale-95 transition cursor-pointer"
          title="Share Text"
        >
          <Share2 size={16} />
        </button>

        <button
          id="btn-ocr-export"
          onClick={handleExportTxt}
          className="p-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 text-neutral-700 active:scale-95 transition cursor-pointer"
          title="Export TXT"
        >
          <Download size={16} />
        </button>
      </div>
    </div>
  );
};
