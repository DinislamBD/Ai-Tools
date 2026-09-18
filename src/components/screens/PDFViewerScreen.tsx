import React, { useState, useEffect } from 'react';
import {
  Download,
  Share2,
  Printer,
  Lock,
  Unlock,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Shield,
  Stamp,
  Sliders
} from 'lucide-react';
import { DocumentItem, PageSize, PageOrientation, PDFQuality } from '../../types';
import { createPDFFromDocument } from '../../services/pdfService';
import { playHaptic } from '../../services/haptics';
import { IOSNavigationBar } from '../common/IOSNavigationBar';

interface PDFViewerScreenProps {
  document: DocumentItem;
  onBack: () => void;
  onShare: () => void;
  onAirPrint: () => void;
}

export const PDFViewerScreen: React.FC<PDFViewerScreenProps> = ({
  document: doc,
  onBack,
  onShare,
  onAirPrint,
}) => {
  const [pageSize, setPageSize] = useState<PageSize>('A4');
  const [orientation, setOrientation] = useState<PageOrientation>('portrait');
  const [quality, setQuality] = useState<PDFQuality>('standard');
  const [watermark, setWatermark] = useState('');
  const [isGenerating, setIsGenerating] = useState(true);
  const [pdfDataUrl, setPdfDataUrl] = useState<string | null>(null);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [filename, setFilename] = useState(`${doc.title}.pdf`);
  const [currentPage, setCurrentPage] = useState(1);
  const [showConfig, setShowConfig] = useState(false);

  useEffect(() => {
    let active = true;

    async function generate() {
      setIsGenerating(true);
      try {
        const res = await createPDFFromDocument(doc, {
          pageSize,
          orientation,
          quality,
          watermarkText: watermark || undefined,
        });
        if (active) {
          setPdfDataUrl(res.dataUrl);
          setPdfBlob(res.blob);
          setFilename(res.filename);
          setIsGenerating(false);
        }
      } catch (e) {
        console.error('PDF error:', e);
        if (active) setIsGenerating(false);
      }
    }

    generate();

    return () => { active = false; };
  }, [doc, pageSize, orientation, quality, watermark]);

  const handleDownload = () => {
    playHaptic('success');
    if (!pdfBlob) return;
    const url = URL.createObjectURL(pdfBlob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 bg-neutral-900 text-white flex flex-col justify-between select-none">
      {/* Navigation */}
      <IOSNavigationBar
        title={doc.title}
        subtitle={`PDF (${pageSize} • ${quality.toUpperCase()})`}
        dark
        onBack={onBack}
        backTitle="Back"
        trailingActions={
          <button
            id="btn-pdf-config"
            onClick={() => {
              playHaptic('light');
              setShowConfig(!showConfig);
            }}
            className="text-xs font-semibold text-blue-400 p-1.5 rounded-full hover:bg-neutral-800 transition cursor-pointer"
          >
            <Sliders size={18} />
          </button>
        }
      />

      {/* PDF Settings Drawer */}
      {showConfig && (
        <div className="bg-neutral-800 border-b border-neutral-700 p-4 text-xs space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-neutral-300">Page Size:</span>
            <div className="flex gap-1">
              {(['A4', 'Letter', 'Legal'] as PageSize[]).map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    playHaptic('selection');
                    setPageSize(s);
                  }}
                  className={`px-2 py-1 rounded text-[11px] font-semibold ${
                    pageSize === s ? 'bg-blue-600 text-white' : 'bg-neutral-700 text-neutral-300'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="font-semibold text-neutral-300">Orientation:</span>
            <div className="flex gap-1">
              {(['portrait', 'landscape'] as PageOrientation[]).map((o) => (
                <button
                  key={o}
                  onClick={() => {
                    playHaptic('selection');
                    setOrientation(o);
                  }}
                  className={`px-2 py-1 rounded text-[11px] font-semibold capitalize ${
                    orientation === o ? 'bg-blue-600 text-white' : 'bg-neutral-700 text-neutral-300'
                  }`}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="font-semibold text-neutral-300">Watermark:</span>
            <input
              type="text"
              placeholder="e.g. CONFIDENTIAL"
              value={watermark}
              onChange={(e) => setWatermark(e.target.value)}
              className="bg-neutral-900 border border-neutral-700 px-2 py-1 rounded text-xs text-white max-w-[150px]"
            />
          </div>
        </div>
      )}

      {/* PDF Viewer Stage */}
      <div className="flex-1 p-4 flex items-center justify-center overflow-hidden relative">
        {isGenerating ? (
          <div className="flex flex-col items-center gap-3 text-neutral-400">
            <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
            <span className="text-xs font-semibold">Compiling PDF via PDFKit Engine...</span>
          </div>
        ) : (
          <div className="relative max-w-full max-h-full rounded-lg overflow-hidden shadow-2xl bg-white border border-neutral-700">
            {/* Display rendered page */}
            {doc.pages[currentPage - 1] && (
              <div className="relative">
                <img
                  src={doc.pages[currentPage - 1].enhancedImage || doc.pages[currentPage - 1].originalImage}
                  alt={`PDF Page ${currentPage}`}
                  className="max-h-[460px] w-auto object-contain"
                />
                {watermark && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-3xl font-black text-neutral-500/30 rotate-[-35deg] tracking-widest uppercase">
                      {watermark}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Page Floating Pill */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-md px-3 py-0.5 rounded-full text-[11px] font-semibold text-white">
              {currentPage} of {doc.pages.length}
            </div>
          </div>
        )}
      </div>

      {/* Page Navigation if multi-page */}
      {doc.pages.length > 1 && (
        <div className="px-6 py-2 bg-neutral-950 flex items-center justify-between text-xs text-neutral-400 border-t border-neutral-800">
          <button
            disabled={currentPage === 1}
            onClick={() => {
              playHaptic('selection');
              setCurrentPage(p => Math.max(1, p - 1));
            }}
            className="flex items-center gap-1 disabled:opacity-30 cursor-pointer"
          >
            <ChevronLeft size={16} />
            <span>Prev Page</span>
          </button>

          <span className="font-semibold text-neutral-200">
            Page {currentPage} of {doc.pages.length}
          </span>

          <button
            disabled={currentPage === doc.pages.length}
            onClick={() => {
              playHaptic('selection');
              setCurrentPage(p => Math.min(doc.pages.length, p + 1));
            }}
            className="flex items-center gap-1 disabled:opacity-30 cursor-pointer"
          >
            <span>Next Page</span>
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Bottom Actions Bar */}
      <div className="px-4 py-3 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between gap-2">
        <button
          id="btn-pdf-download"
          onClick={handleDownload}
          className="flex-1 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/30 active:scale-95 transition cursor-pointer"
        >
          <Download size={15} />
          <span>Save to Files</span>
        </button>

        <button
          id="btn-pdf-share"
          onClick={() => {
            playHaptic('light');
            onShare();
          }}
          className="p-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 active:scale-95 transition cursor-pointer"
          title="Share PDF"
        >
          <Share2 size={16} />
        </button>

        <button
          id="btn-pdf-airprint"
          onClick={() => {
            playHaptic('light');
            onAirPrint();
          }}
          className="p-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 active:scale-95 transition cursor-pointer"
          title="AirPrint"
        >
          <Printer size={16} />
        </button>
      </div>
    </div>
  );
};
