import React, { useState } from 'react';
import { Files, Check, Plus, Trash2, ArrowUpDown } from 'lucide-react';
import { DocumentItem } from '../../types';
import { mergePDFDocuments } from '../../services/pdfService';
import { playHaptic } from '../../services/haptics';
import { IOSNavigationBar } from '../common/IOSNavigationBar';

interface MergePDFScreenProps {
  documents: DocumentItem[];
  onMergeComplete: (mergedDoc: DocumentItem) => void;
  onCancel: () => void;
}

export const MergePDFScreen: React.FC<MergePDFScreenProps> = ({
  documents,
  onMergeComplete,
  onCancel,
}) => {
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>(
    documents.slice(0, 2).map(d => d.id)
  );
  const [mergedTitle, setMergedTitle] = useState('Combined Contract & Receipts');
  const [isMerging, setIsMerging] = useState(false);

  const toggleSelect = (id: string) => {
    playHaptic('selection');
    if (selectedDocIds.includes(id)) {
      if (selectedDocIds.length > 2) {
        setSelectedDocIds(selectedDocIds.filter(dId => dId !== id));
      }
    } else {
      setSelectedDocIds([...selectedDocIds, id]);
    }
  };

  const handleMerge = async () => {
    if (selectedDocIds.length < 2) return;
    playHaptic('success');
    setIsMerging(true);

    const docsToMerge = selectedDocIds
      .map(id => documents.find(d => d.id === id))
      .filter((d): d is DocumentItem => !!d);

    const merged = await mergePDFDocuments(docsToMerge, mergedTitle);
    setIsMerging(false);
    onMergeComplete(merged);
  };

  return (
    <div className="flex-1 bg-neutral-50 text-neutral-900 flex flex-col justify-between overflow-y-auto select-none">
      <IOSNavigationBar
        title="Merge PDFs"
        onBack={onCancel}
        backTitle="Tools"
        trailingActions={
          <button
            id="btn-merge-action"
            onClick={handleMerge}
            disabled={selectedDocIds.length < 2 || isMerging}
            className="text-xs font-bold text-blue-600 disabled:opacity-40 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full active:scale-95 transition cursor-pointer"
          >
            {isMerging ? 'Merging...' : 'Merge'}
          </button>
        }
      />

      <div className="flex-1 p-4 space-y-4">
        {/* Title Input */}
        <div className="bg-white p-3.5 rounded-2xl border border-neutral-200 shadow-xs">
          <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
            Merged Document Title
          </label>
          <input
            type="text"
            value={mergedTitle}
            onChange={(e) => setMergedTitle(e.target.value)}
            className="w-full text-sm font-semibold text-neutral-900 focus:outline-hidden"
            placeholder="Enter document title..."
          />
        </div>

        {/* Document Selection List */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Select Documents to Combine ({selectedDocIds.length} selected)
            </span>
          </div>

          <div className="space-y-2">
            {documents.filter(d => !d.isDeleted).map((doc) => {
              const isSelected = selectedDocIds.includes(doc.id);
              return (
                <div
                  key={doc.id}
                  onClick={() => toggleSelect(doc.id)}
                  className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-blue-50/70 border-blue-300 shadow-xs'
                      : 'bg-white border-neutral-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-14 rounded-lg bg-neutral-100 border border-neutral-200 overflow-hidden shrink-0">
                      {doc.thumbnail && (
                        <img src={doc.thumbnail} alt={doc.title} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-[13px] font-bold text-neutral-900 truncate max-w-[200px]">
                        {doc.title}
                      </h4>
                      <p className="text-[11px] text-neutral-500">
                        {doc.pages.length} pages • {(doc.fileSize / 1024).toFixed(0)} KB
                      </p>
                    </div>
                  </div>

                  <div className={`w-6 h-6 rounded-full border flex items-center justify-center ${
                    isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-neutral-300'
                  }`}>
                    {isSelected && <Check size={14} strokeWidth={3} />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
