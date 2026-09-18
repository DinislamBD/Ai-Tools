import React, { useState } from 'react';
import {
  Crop,
  RotateCw,
  Wand2,
  Sliders,
  FileSearch,
  PenTool,
  Trash2,
  Copy,
  Plus,
  ChevronLeft,
  ChevronRight,
  Check,
  X
} from 'lucide-react';
import { DocumentItem, DocumentPage } from '../../types';
import { playHaptic } from '../../services/haptics';
import { IOSNavigationBar } from '../common/IOSNavigationBar';

interface MultiPageEditorScreenProps {
  document: DocumentItem;
  onSave: (doc: DocumentItem) => void;
  onCancel: () => void;
  onOpenCrop: (pageIndex: number) => void;
  onOpenEnhance: (pageIndex: number) => void;
  onOpenOCR: (pageIndex: number) => void;
  onOpenAnnotate: (pageIndex: number) => void;
  onAddPage: () => void;
}

export const MultiPageEditorScreen: React.FC<MultiPageEditorScreenProps> = ({
  document: initialDoc,
  onSave,
  onCancel,
  onOpenCrop,
  onOpenEnhance,
  onOpenOCR,
  onOpenAnnotate,
  onAddPage,
}) => {
  const [pages, setPages] = useState<DocumentPage[]>(initialDoc.pages);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  const activePage = pages[currentPageIndex] || pages[0];

  const handleRotate = () => {
    playHaptic('medium');
    const updated = pages.map((p, idx) => {
      if (idx === currentPageIndex) {
        const nextRotation = (p.rotation + 90) % 360;
        return { ...p, rotation: nextRotation };
      }
      return p;
    });
    setPages(updated);
  };

  const handleDuplicate = () => {
    playHaptic('medium');
    const clone: DocumentPage = {
      ...activePage,
      id: `p-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      pageNumber: pages.length + 1,
    };
    const updated = [...pages];
    updated.splice(currentPageIndex + 1, 0, clone);
    setPages(updated);
    setCurrentPageIndex(currentPageIndex + 1);
  };

  const handleDeletePage = () => {
    playHaptic('warning');
    if (pages.length <= 1) {
      alert('A document must have at least one page.');
      return;
    }
    const updated = pages.filter((_, i) => i !== currentPageIndex).map((p, idx) => ({ ...p, pageNumber: idx + 1 }));
    setPages(updated);
    setCurrentPageIndex(Math.max(0, currentPageIndex - 1));
  };

  const handleMovePage = (direction: 'left' | 'right') => {
    playHaptic('light');
    if (direction === 'left' && currentPageIndex > 0) {
      const copy = [...pages];
      const temp = copy[currentPageIndex];
      copy[currentPageIndex] = copy[currentPageIndex - 1];
      copy[currentPageIndex - 1] = temp;
      setPages(copy.map((p, i) => ({ ...p, pageNumber: i + 1 })));
      setCurrentPageIndex(currentPageIndex - 1);
    } else if (direction === 'right' && currentPageIndex < pages.length - 1) {
      const copy = [...pages];
      const temp = copy[currentPageIndex];
      copy[currentPageIndex] = copy[currentPageIndex + 1];
      copy[currentPageIndex + 1] = temp;
      setPages(copy.map((p, i) => ({ ...p, pageNumber: i + 1 })));
      setCurrentPageIndex(currentPageIndex + 1);
    }
  };

  const handleSaveAll = () => {
    playHaptic('success');
    const updatedDoc: DocumentItem = {
      ...initialDoc,
      pages,
      thumbnail: pages[0]?.thumbnailImage || initialDoc.thumbnail,
      modifiedAt: new Date().toISOString(),
    };
    onSave(updatedDoc);
  };

  return (
    <div className="flex-1 bg-neutral-900 text-white flex flex-col justify-between select-none">
      {/* Navigation */}
      <IOSNavigationBar
        title={`Page ${currentPageIndex + 1} of ${pages.length}`}
        dark
        onBack={onCancel}
        backTitle="Cancel"
        trailingActions={
          <button
            id="btn-multipage-save"
            onClick={handleSaveAll}
            className="text-xs font-bold text-blue-400 hover:text-blue-300 px-3 py-1 bg-blue-600/20 rounded-full border border-blue-500/30 active:scale-95 transition cursor-pointer"
          >
            Save
          </button>
        }
      />

      {/* Main Page Viewport with Page Flip Chevrons */}
      <div className="flex-1 relative flex items-center justify-center p-4 overflow-hidden">
        {pages.length > 1 && (
          <button
            disabled={currentPageIndex === 0}
            onClick={() => handleMovePage('left')}
            className={`absolute left-2 z-20 w-8 h-8 rounded-full bg-black/60 border border-neutral-700 flex items-center justify-center text-white transition ${
              currentPageIndex === 0 ? 'opacity-30 cursor-not-allowed' : 'active:scale-90 cursor-pointer'
            }`}
          >
            <ChevronLeft size={18} />
          </button>
        )}

        <div className="relative max-w-full max-h-full rounded-lg overflow-hidden shadow-2xl bg-neutral-950 flex items-center justify-center">
          {activePage && (
            <img
              src={activePage.enhancedImage || activePage.originalImage}
              alt={`Page ${currentPageIndex + 1}`}
              className="max-h-[440px] w-auto object-contain transition-transform duration-300"
              style={{ transform: `rotate(${activePage.rotation}deg)` }}
            />
          )}
        </div>

        {pages.length > 1 && (
          <button
            disabled={currentPageIndex === pages.length - 1}
            onClick={() => handleMovePage('right')}
            className={`absolute right-2 z-20 w-8 h-8 rounded-full bg-black/60 border border-neutral-700 flex items-center justify-center text-white transition ${
              currentPageIndex === pages.length - 1 ? 'opacity-30 cursor-not-allowed' : 'active:scale-90 cursor-pointer'
            }`}
          >
            <ChevronRight size={18} />
          </button>
        )}
      </div>

      {/* Thumbnail Strip for Multi-Page Browsing */}
      <div className="px-4 py-2 bg-neutral-950 border-t border-neutral-800 flex items-center gap-2 overflow-x-auto no-scrollbar">
        {pages.map((p, idx) => (
          <div
            key={p.id}
            onClick={() => {
              playHaptic('selection');
              setCurrentPageIndex(idx);
            }}
            className={`shrink-0 w-12 h-16 rounded-md overflow-hidden border-2 cursor-pointer transition relative ${
              idx === currentPageIndex ? 'border-blue-500 ring-2 ring-blue-500/30' : 'border-neutral-700 opacity-60'
            }`}
          >
            <img
              src={p.thumbnailImage || p.enhancedImage || p.originalImage}
              alt={`Thumbnail ${idx + 1}`}
              className="w-full h-full object-cover"
            />
            <span className="absolute bottom-0 right-0 bg-black/70 text-[9px] font-bold px-1 text-white">
              {idx + 1}
            </span>
          </div>
        ))}

        <button
          id="btn-multipage-add"
          onClick={() => {
            playHaptic('light');
            onAddPage();
          }}
          className="shrink-0 w-12 h-16 rounded-md border-2 border-dashed border-neutral-700 flex flex-col items-center justify-center text-neutral-400 hover:text-white hover:border-neutral-500 transition active:scale-95 cursor-pointer"
        >
          <Plus size={18} />
          <span className="text-[9px] font-medium mt-0.5">Add</span>
        </button>
      </div>

      {/* Editor Primary Toolbar */}
      <div className="px-3 py-3 bg-neutral-900 border-t border-neutral-800 grid grid-cols-7 gap-1">
        <button
          id="btn-tool-crop"
          onClick={() => {
            playHaptic('medium');
            onOpenCrop(currentPageIndex);
          }}
          className="flex flex-col items-center justify-center py-1 text-neutral-300 hover:text-white active:scale-95 transition cursor-pointer"
        >
          <Crop size={18} />
          <span className="text-[9px] mt-1 font-medium">Crop</span>
        </button>

        <button
          id="btn-tool-rotate"
          onClick={handleRotate}
          className="flex flex-col items-center justify-center py-1 text-neutral-300 hover:text-white active:scale-95 transition cursor-pointer"
        >
          <RotateCw size={18} />
          <span className="text-[9px] mt-1 font-medium">Rotate</span>
        </button>

        <button
          id="btn-tool-filter"
          onClick={() => {
            playHaptic('medium');
            onOpenEnhance(currentPageIndex);
          }}
          className="flex flex-col items-center justify-center py-1 text-neutral-300 hover:text-white active:scale-95 transition cursor-pointer"
        >
          <Wand2 size={18} className="text-cyan-400" />
          <span className="text-[9px] mt-1 font-medium">Filter</span>
        </button>

        <button
          id="btn-tool-ocr"
          onClick={() => {
            playHaptic('medium');
            onOpenOCR(currentPageIndex);
          }}
          className="flex flex-col items-center justify-center py-1 text-neutral-300 hover:text-white active:scale-95 transition cursor-pointer"
        >
          <FileSearch size={18} className="text-indigo-400" />
          <span className="text-[9px] mt-1 font-medium">OCR</span>
        </button>

        <button
          id="btn-tool-annotate"
          onClick={() => {
            playHaptic('medium');
            onOpenAnnotate(currentPageIndex);
          }}
          className="flex flex-col items-center justify-center py-1 text-neutral-300 hover:text-white active:scale-95 transition cursor-pointer"
        >
          <PenTool size={18} className="text-amber-400" />
          <span className="text-[9px] mt-1 font-medium">Annotate</span>
        </button>

        <button
          id="btn-tool-duplicate"
          onClick={handleDuplicate}
          className="flex flex-col items-center justify-center py-1 text-neutral-300 hover:text-white active:scale-95 transition cursor-pointer"
        >
          <Copy size={18} />
          <span className="text-[9px] mt-1 font-medium">Clone</span>
        </button>

        <button
          id="btn-tool-delete"
          onClick={handleDeletePage}
          className="flex flex-col items-center justify-center py-1 text-rose-400 hover:text-rose-300 active:scale-95 transition cursor-pointer"
        >
          <Trash2 size={18} />
          <span className="text-[9px] mt-1 font-medium">Delete</span>
        </button>
      </div>
    </div>
  );
};
