import React, { useState } from 'react';
import {
  Camera,
  Search,
  Settings,
  Upload,
  FileSearch,
  Wrench,
  FilePlus,
  Files,
  PenTool,
  Minimize2,
  ChevronRight,
  Clock,
  Sparkles,
  FileText
} from 'lucide-react';
import { DocumentItem, UserSettings } from '../../types';
import { translations } from '../../localization/strings';
import { playHaptic } from '../../services/haptics';

interface HomeScreenProps {
  documents: DocumentItem[];
  settings: UserSettings;
  onNavigate: (screen: any, docId?: string) => void;
  onImportFile: (file: File) => void;
  onOpenPaywall: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  documents,
  settings,
  onNavigate,
  onImportFile,
  onOpenPaywall,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const t = translations[settings.appLanguage] || translations.en;

  // Time-aware greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? t.goodMorning : hour < 18 ? t.goodAfternoon : t.goodEvening;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImportFile(e.target.files[0]);
    }
  };

  const activeDocuments = documents.filter(d => !d.isDeleted);
  const recentDocuments = [...activeDocuments].sort(
    (a, b) => new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime()
  ).slice(0, 5);

  const filteredRecents = selectedCategory === 'all'
    ? recentDocuments
    : recentDocuments.filter(d => d.docType === selectedCategory);

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'document', label: 'Contracts' },
    { id: 'receipt', label: 'Receipts' },
    { id: 'passport', label: 'IDs' },
    { id: 'handwritten', label: 'Notes' },
  ];

  return (
    <div className="flex-1 bg-neutral-50 text-neutral-900 overflow-y-auto pb-6 select-none">
      {/* Top Bar */}
      <div className="px-5 pt-4 pb-2 flex items-center justify-between">
        <div>
          <span className="text-[12px] font-semibold text-neutral-400 tracking-tight uppercase">
            {greeting}
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 flex items-center gap-1.5">
            DocuScan <span className="text-blue-600 font-extrabold text-sm bg-blue-50 px-1.5 py-0.5 rounded-md border border-blue-200">AI</span>
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Pro Upgrade pill if not pro */}
          {!settings.isPro && (
            <button
              id="btn-home-pro"
              onClick={() => {
                playHaptic('medium');
                onOpenPaywall();
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[11px] font-bold shadow-sm active:scale-95 transition cursor-pointer"
            >
              <Sparkles size={11} />
              <span>PRO</span>
            </button>
          )}

          <button
            id="btn-home-search"
            onClick={() => {
              playHaptic('light');
              onNavigate('smart_search');
            }}
            className="w-9 h-9 rounded-full bg-white border border-neutral-200 shadow-sm flex items-center justify-center text-neutral-600 hover:text-neutral-900 active:scale-95 transition cursor-pointer"
            aria-label="Search"
          >
            <Search size={17} strokeWidth={2.2} />
          </button>

          <button
            id="btn-home-settings"
            onClick={() => {
              playHaptic('light');
              onNavigate('settings');
            }}
            className="w-9 h-9 rounded-full bg-white border border-neutral-200 shadow-sm flex items-center justify-center text-neutral-600 hover:text-neutral-900 active:scale-95 transition cursor-pointer"
            aria-label="Settings"
          >
            <Settings size={17} strokeWidth={2.2} />
          </button>
        </div>
      </div>

      {/* Main Action: Primary Hero Scan Card */}
      <div className="px-4 mt-2">
        <div
          id="card-hero-scan"
          onClick={() => {
            playHaptic('heavy');
            onNavigate('scanner_camera');
          }}
          className="w-full bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white rounded-3xl p-5 shadow-xl shadow-blue-600/25 relative overflow-hidden group cursor-pointer transition-transform active:scale-[0.98]"
        >
          {/* Subtle background decorative shapes */}
          <div className="absolute -right-6 -bottom-6 w-36 h-36 rounded-full bg-white/10 blur-xl pointer-events-none" />
          <div className="absolute top-3 right-4 opacity-20 group-hover:opacity-30 transition">
            <Camera size={110} strokeWidth={1} />
          </div>

          <div className="relative z-10 flex flex-col justify-between h-36">
            <div className="flex items-center justify-between">
              <span className="bg-white/20 backdrop-blur-md text-white text-[11px] font-semibold px-3 py-1 rounded-full flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live VisionKit AI
              </span>
              <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center text-white">
                <ChevronRight size={18} />
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white mb-1">
                {t.scanDocument}
              </h2>
              <p className="text-xs text-blue-100/90 font-normal">
                Auto-boundary detection • Multi-page • HD OCR
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Actions Grid */}
      <div className="px-4 mt-4 grid grid-cols-4 gap-2.5">
        <button
          id="btn-quick-scan"
          onClick={() => {
            playHaptic('medium');
            onNavigate('scanner_camera');
          }}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-neutral-200/80 shadow-sm hover:border-blue-300 transition active:scale-95 cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-1.5">
            <Camera size={20} strokeWidth={2.2} />
          </div>
          <span className="text-[11px] font-semibold text-neutral-700 tracking-tight">Scan</span>
        </button>

        <label
          htmlFor="file-import-input"
          onClick={() => playHaptic('light')}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-neutral-200/80 shadow-sm hover:border-blue-300 transition active:scale-95 cursor-pointer"
        >
          <input
            id="file-import-input"
            type="file"
            accept="image/*,application/pdf"
            className="hidden"
            onChange={handleFileUpload}
          />
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-1.5">
            <Upload size={20} strokeWidth={2.2} />
          </div>
          <span className="text-[11px] font-semibold text-neutral-700 tracking-tight">{t.importFile}</span>
        </label>

        <button
          id="btn-quick-ocr"
          onClick={() => {
            playHaptic('light');
            if (activeDocuments[0]) {
              onNavigate('ocr_view', activeDocuments[0].id);
            } else {
              onNavigate('scanner_camera');
            }
          }}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-neutral-200/80 shadow-sm hover:border-blue-300 transition active:scale-95 cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-1.5">
            <FileSearch size={20} strokeWidth={2.2} />
          </div>
          <span className="text-[11px] font-semibold text-neutral-700 tracking-tight">OCR</span>
        </button>

        <button
          id="btn-quick-tools"
          onClick={() => {
            playHaptic('light');
            onNavigate('pdf_tools');
          }}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-neutral-200/80 shadow-sm hover:border-blue-300 transition active:scale-95 cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1.5">
            <Wrench size={20} strokeWidth={2.2} />
          </div>
          <span className="text-[11px] font-semibold text-neutral-700 tracking-tight">{t.pdfTools}</span>
        </button>
      </div>

      {/* Quick Tools Carousel */}
      <div className="mt-5 px-4">
        <div className="flex items-center justify-between mb-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            {t.quickTools}
          </h3>
          <span className="text-[11px] font-medium text-blue-600 hover:underline cursor-pointer" onClick={() => onNavigate('pdf_tools')}>
            View all
          </span>
        </div>

        <div className="flex gap-2.5 overflow-x-auto no-scrollbar py-1">
          <div
            id="tool-create-pdf"
            onClick={() => {
              playHaptic('light');
              if (activeDocuments[0]) onNavigate('pdf_viewer', activeDocuments[0].id);
              else onNavigate('scanner_camera');
            }}
            className="shrink-0 w-28 p-3 rounded-2xl bg-white border border-neutral-200 shadow-xs hover:border-blue-300 transition active:scale-95 cursor-pointer flex flex-col items-start"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
              <FilePlus size={17} />
            </div>
            <span className="text-[12px] font-bold text-neutral-800 leading-tight">Create PDF</span>
            <span className="text-[10px] text-neutral-400 mt-0.5">Single / Multi</span>
          </div>

          <div
            id="tool-merge-pdf"
            onClick={() => {
              playHaptic('light');
              onNavigate('merge_pdf');
            }}
            className="shrink-0 w-28 p-3 rounded-2xl bg-white border border-neutral-200 shadow-xs hover:border-blue-300 transition active:scale-95 cursor-pointer flex flex-col items-start"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2">
              <Files size={17} />
            </div>
            <span className="text-[12px] font-bold text-neutral-800 leading-tight">Merge PDF</span>
            <span className="text-[10px] text-neutral-400 mt-0.5">Combine docs</span>
          </div>

          <div
            id="tool-sign-pdf"
            onClick={() => {
              playHaptic('light');
              onNavigate('signature_studio');
            }}
            className="shrink-0 w-28 p-3 rounded-2xl bg-white border border-neutral-200 shadow-xs hover:border-blue-300 transition active:scale-95 cursor-pointer flex flex-col items-start"
          >
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center mb-2">
              <PenTool size={17} />
            </div>
            <span className="text-[12px] font-bold text-neutral-800 leading-tight">Sign Doc</span>
            <span className="text-[10px] text-neutral-400 mt-0.5">Digital stamp</span>
          </div>

          <div
            id="tool-compress-pdf"
            onClick={() => {
              playHaptic('light');
              onNavigate('compress_pdf');
            }}
            className="shrink-0 w-28 p-3 rounded-2xl bg-white border border-neutral-200 shadow-xs hover:border-blue-300 transition active:scale-95 cursor-pointer flex flex-col items-start"
          >
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center mb-2">
              <Minimize2 size={17} />
            </div>
            <span className="text-[12px] font-bold text-neutral-800 leading-tight">Compress</span>
            <span className="text-[10px] text-neutral-400 mt-0.5">Reduce size</span>
          </div>
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="mt-5 px-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            {t.recentDocuments}
          </h3>
          <span className="text-[11px] font-medium text-blue-600 hover:underline cursor-pointer" onClick={() => onNavigate('document_library')}>
            See all ({activeDocuments.length})
          </span>
        </div>

        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-2">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => {
                playHaptic('selection');
                setSelectedCategory(cat.id);
              }}
              className={`px-3 py-1 rounded-full text-[12px] font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Recent Documents List */}
      <div className="px-4 space-y-2.5 mt-1">
        {filteredRecents.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-white border border-dashed border-neutral-200 text-neutral-400">
            <FileText size={32} className="mx-auto mb-2 text-neutral-300" />
            <p className="text-xs font-semibold text-neutral-600">No documents in this category</p>
            <p className="text-[11px] text-neutral-400 mt-0.5">Tap Scan Document to capture one now.</p>
          </div>
        ) : (
          filteredRecents.map((doc) => (
            <div
              key={doc.id}
              id={`doc-card-${doc.id}`}
              onClick={() => {
                playHaptic('light');
                onNavigate('document_viewer', doc.id);
              }}
              className="p-2.5 rounded-2xl bg-white border border-neutral-200/90 shadow-xs hover:shadow-md transition active:scale-[0.99] cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-14 h-16 rounded-xl bg-neutral-100 overflow-hidden border border-neutral-200 shrink-0 relative shadow-inner">
                  {doc.thumbnail ? (
                    <img
                      src={doc.thumbnail}
                      alt={doc.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-300">
                      <FileText size={20} />
                    </div>
                  )}
                  <div className="absolute bottom-0.5 right-0.5 bg-black/60 backdrop-blur-xs text-white text-[8px] font-bold px-1 rounded-xs">
                    {doc.pages.length}p
                  </div>
                </div>

                <div className="overflow-hidden">
                  <h4 className="text-[14px] font-bold text-neutral-900 tracking-tight truncate max-w-[200px]">
                    {doc.title}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] text-neutral-400 mt-0.5 font-medium">
                    <span className="flex items-center gap-1">
                      <Clock size={10} />
                      {new Date(doc.modifiedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                    <span>•</span>
                    <span>{(doc.fileSize / 1024).toFixed(0)} KB</span>
                    {doc.folderName && (
                      <>
                        <span>•</span>
                        <span className="text-blue-600 font-semibold">{doc.folderName}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-neutral-300 hover:text-neutral-600 pr-2">
                <ChevronRight size={18} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
