import React, { useState } from 'react';
import {
  Share2,
  Printer,
  FileText,
  Edit,
  PenTool,
  FileSearch,
  Star,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Download,
  Info,
  Lock,
  Layers
} from 'lucide-react';
import { DocumentItem } from '../../types';
import { playHaptic } from '../../services/haptics';
import { IOSNavigationBar } from '../common/IOSNavigationBar';

interface DocumentViewerScreenProps {
  document: DocumentItem;
  onBack: () => void;
  onOpenPDF: () => void;
  onEditPages: () => void;
  onOpenOCR: () => void;
  onOpenSign: () => void;
  onOpenAnnotate: () => void;
  onToggleFavorite: () => void;
  onDelete: () => void;
  onAirPrint: () => void;
  onShare: () => void;
}

export const DocumentViewerScreen: React.FC<DocumentViewerScreenProps> = ({
  document: doc,
  onBack,
  onOpenPDF,
  onEditPages,
  onOpenOCR,
  onOpenSign,
  onOpenAnnotate,
  onToggleFavorite,
  onDelete,
  onAirPrint,
  onShare,
}) => {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [showMetadata, setShowMetadata] = useState(false);

  const activePage = doc.pages[currentPageIndex] || doc.pages[0];

  return (
    <div className="flex-1 bg-neutral-900 text-white flex flex-col justify-between select-none">
      {/* Navigation */}
      <IOSNavigationBar
        title={doc.title}
        subtitle={`${doc.pages.length} pages • ${(doc.fileSize / 1024).toFixed(0)} KB`}
        dark
        onBack={onBack}
        backTitle="Library"
        trailingActions={
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                playHaptic('medium');
                onToggleFavorite();
              }}
              className={`p-1.5 rounded-full transition cursor-pointer active:scale-90 ${
                doc.isFavorite ? 'text-amber-400' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Star size={18} fill={doc.isFavorite ? 'currentColor' : 'none'} />
            </button>

            <button
              onClick={() => {
                playHaptic('light');
                setShowMetadata(!showMetadata);
              }}
              className="p-1.5 text-neutral-400 hover:text-white transition cursor-pointer"
            >
              <Info size={18} />
            </button>
          </div>
        }
      />

      {/* Metadata Drawer overlay if toggled */}
      {showMetadata && (
        <div className="bg-neutral-800 border-b border-neutral-700 p-4 text-xs space-y-1.5 text-neutral-300">
          <div className="flex justify-between">
            <span className="text-neutral-400">Created:</span>
            <span>{new Date(doc.createdAt).toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-400">Modified:</span>
            <span>{new Date(doc.modifiedAt).toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-400">Scan Mode:</span>
            <span className="capitalize">{doc.docType}</span>
          </div>
          {doc.folderName && (
            <div className="flex justify-between">
              <span className="text-neutral-400">Folder:</span>
              <span className="text-blue-400">{doc.folderName}</span>
            </div>
          )}
        </div>
      )}

      {/* Main Document Image Stage */}
      <div className="flex-1 relative p-4 flex items-center justify-center overflow-hidden">
        {doc.pages.length > 1 && (
          <button
            disabled={currentPageIndex === 0}
            onClick={() => {
              playHaptic('selection');
              setCurrentPageIndex(prev => Math.max(0, prev - 1));
            }}
            className={`absolute left-2 z-20 w-8 h-8 rounded-full bg-black/60 border border-neutral-700 flex items-center justify-center text-white ${
              currentPageIndex === 0 ? 'opacity-20 cursor-not-allowed' : 'active:scale-90 cursor-pointer'
            }`}
          >
            <ChevronLeft size={18} />
          </button>
        )}

        <div className="relative max-w-full max-h-full rounded-lg overflow-hidden shadow-2xl bg-neutral-950">
          {activePage && (
            <img
              src={activePage.enhancedImage || activePage.originalImage}
              alt={`Page ${currentPageIndex + 1}`}
              className="max-h-[460px] w-auto object-contain"
              style={{ transform: `rotate(${activePage.rotation || 0}deg)` }}
            />
          )}
          {/* Page Badge */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-neutral-300">
            {currentPageIndex + 1} / {doc.pages.length}
          </div>
        </div>

        {doc.pages.length > 1 && (
          <button
            disabled={currentPageIndex === doc.pages.length - 1}
            onClick={() => {
              playHaptic('selection');
              setCurrentPageIndex(prev => Math.min(doc.pages.length - 1, prev + 1));
            }}
            className={`absolute right-2 z-20 w-8 h-8 rounded-full bg-black/60 border border-neutral-700 flex items-center justify-center text-white ${
              currentPageIndex === doc.pages.length - 1 ? 'opacity-20 cursor-not-allowed' : 'active:scale-90 cursor-pointer'
            }`}
          >
            <ChevronRight size={18} />
          </button>
        )}
      </div>

      {/* Bottom Action Bar */}
      <div className="bg-neutral-950 border-t border-neutral-800 px-4 py-3">
        {/* Primary PDF & Edit Buttons */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <button
            id="btn-doc-open-pdf"
            onClick={() => {
              playHaptic('medium');
              onOpenPDF();
            }}
            className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/30 active:scale-95 transition cursor-pointer"
          >
            <FileText size={15} />
            <span>Generate &amp; View PDF</span>
          </button>

          <button
            id="btn-doc-edit-pages"
            onClick={() => {
              playHaptic('medium');
              onEditPages();
            }}
            className="py-2.5 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-neutral-700 active:scale-95 transition cursor-pointer"
          >
            <Edit size={15} />
            <span>Edit Pages</span>
          </button>
        </div>

        {/* Secondary Tool Icons */}
        <div className="flex items-center justify-around text-neutral-400">
          <button
            id="btn-doc-ocr"
            onClick={() => {
              playHaptic('light');
              onOpenOCR();
            }}
            className="flex flex-col items-center gap-1 hover:text-white transition active:scale-95 cursor-pointer"
          >
            <FileSearch size={18} className="text-indigo-400" />
            <span className="text-[10px]">OCR Text</span>
          </button>

          <button
            id="btn-doc-sign"
            onClick={() => {
              playHaptic('light');
              onOpenSign();
            }}
            className="flex flex-col items-center gap-1 hover:text-white transition active:scale-95 cursor-pointer"
          >
            <PenTool size={18} className="text-teal-400" />
            <span className="text-[10px]">Sign</span>
          </button>

          <button
            id="btn-doc-annotate"
            onClick={() => {
              playHaptic('light');
              onOpenAnnotate();
            }}
            className="flex flex-col items-center gap-1 hover:text-white transition active:scale-95 cursor-pointer"
          >
            <Layers size={18} className="text-amber-400" />
            <span className="text-[10px]">Annotate</span>
          </button>

          <button
            id="btn-doc-share"
            onClick={() => {
              playHaptic('light');
              onShare();
            }}
            className="flex flex-col items-center gap-1 hover:text-white transition active:scale-95 cursor-pointer"
          >
            <Share2 size={18} />
            <span className="text-[10px]">Share</span>
          </button>

          <button
            id="btn-doc-print"
            onClick={() => {
              playHaptic('light');
              onAirPrint();
            }}
            className="flex flex-col items-center gap-1 hover:text-white transition active:scale-95 cursor-pointer"
          >
            <Printer size={18} />
            <span className="text-[10px]">AirPrint</span>
          </button>

          <button
            id="btn-doc-delete"
            onClick={() => {
              playHaptic('error');
              onDelete();
            }}
            className="flex flex-col items-center gap-1 text-rose-400 hover:text-rose-300 transition active:scale-95 cursor-pointer"
          >
            <Trash2 size={18} />
            <span className="text-[10px]">Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
};
