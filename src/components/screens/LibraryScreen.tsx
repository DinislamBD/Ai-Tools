import React, { useState, useMemo } from 'react';
import {
  Search,
  Grid,
  List,
  FolderPlus,
  Filter,
  ArrowUpDown,
  Star,
  Trash2,
  Folder,
  Check,
  MoreVertical,
  Share2,
  FileText,
  ChevronRight
} from 'lucide-react';
import { DocumentItem, FolderItem, SortOption } from '../../types';
import { playHaptic } from '../../services/haptics';
import { IOSNavigationBar } from '../common/IOSNavigationBar';

interface LibraryScreenProps {
  documents: DocumentItem[];
  folders: FolderItem[];
  onOpenDocument: (doc: DocumentItem) => void;
  onDeleteDocument: (docId: string) => void;
  onToggleFavorite: (docId: string) => void;
  onCreateFolder: (name: string, color: string) => void;
  onMoveToFolder: (docIds: string[], folderId: string) => void;
}

export const LibraryScreen: React.FC<LibraryScreenProps> = ({
  documents,
  folders,
  onOpenDocument,
  onDeleteDocument,
  onToggleFavorite,
  onCreateFolder,
  onMoveToFolder,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolderId, setSelectedFolderId] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('date_desc');
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  // Filter and Sort
  const filteredDocs = useMemo(() => {
    let list = documents.filter(d => !d.isDeleted);

    // Folder Filter
    if (selectedFolderId === 'favorites') {
      list = list.filter(d => d.isFavorite);
    } else if (selectedFolderId !== 'all') {
      list = list.filter(d => d.folderId === selectedFolderId);
    }

    // Search Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(d =>
        d.title.toLowerCase().includes(q) ||
        (d.tags || []).some((t: string) => t.toLowerCase().includes(q)) ||
        d.pages.some(p => p.ocrText?.toLowerCase().includes(q))
      );
    }

    // Sort
    return list.sort((a, b) => {
      if (sortBy === 'date_desc') return new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime();
      if (sortBy === 'date_asc') return new Date(a.modifiedAt).getTime() - new Date(b.modifiedAt).getTime();
      if (sortBy === 'name_asc') return a.title.localeCompare(b.title);
      if (sortBy === 'name_desc') return b.title.localeCompare(a.title);
      if (sortBy === 'size_desc') return b.fileSize - a.fileSize;
      if (sortBy === 'size_asc') return a.fileSize - b.fileSize;
      return 0;
    });
  }, [documents, selectedFolderId, searchQuery, sortBy]);

  const toggleSelectDoc = (id: string) => {
    playHaptic('selection');
    if (selectedDocIds.includes(id)) {
      setSelectedDocIds(selectedDocIds.filter(i => i !== id));
    } else {
      setSelectedDocIds([...selectedDocIds, id]);
    }
  };

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    playHaptic('success');
    onCreateFolder(newFolderName.trim(), '#3b82f6');
    setNewFolderName('');
    setShowFolderModal(false);
  };

  return (
    <div className="flex-1 bg-neutral-50 text-neutral-900 flex flex-col justify-between overflow-y-auto select-none">
      <IOSNavigationBar
        title="Library"
        largeTitle
        subtitle={`${filteredDocs.length} documents`}
        trailingActions={
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                playHaptic('light');
                setIsSelecting(!isSelecting);
                setSelectedDocIds([]);
              }}
              className="text-xs font-bold text-blue-600 px-2 py-1 rounded-md hover:bg-neutral-100 transition cursor-pointer"
            >
              {isSelecting ? 'Done' : 'Select'}
            </button>

            <button
              onClick={() => {
                playHaptic('light');
                setViewMode(prev => prev === 'grid' ? 'list' : 'grid');
              }}
              className="p-1.5 text-neutral-600 hover:text-neutral-900 transition cursor-pointer"
            >
              {viewMode === 'grid' ? <List size={18} /> : <Grid size={18} />}
            </button>
          </div>
        }
      />

      {/* Search Input */}
      <div className="px-4 py-2 bg-neutral-50">
        <div className="relative flex items-center">
          <Search size={15} className="absolute left-3 text-neutral-400" />
          <input
            type="text"
            placeholder="Search documents or OCR content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-neutral-200/70 border-0 rounded-xl text-xs text-neutral-800 placeholder-neutral-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Folder Chips */}
      <div className="px-4 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => {
            playHaptic('selection');
            setSelectedFolderId('all');
          }}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            selectedFolderId === 'all'
              ? 'bg-neutral-900 text-white shadow-xs'
              : 'bg-white border border-neutral-200 text-neutral-600'
          }`}
        >
          All Scans
        </button>

        <button
          onClick={() => {
            playHaptic('selection');
            setSelectedFolderId('favorites');
          }}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition cursor-pointer flex items-center gap-1 whitespace-nowrap ${
            selectedFolderId === 'favorites'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'bg-white border border-neutral-200 text-neutral-600'
          }`}
        >
          <Star size={12} fill={selectedFolderId === 'favorites' ? 'currentColor' : 'none'} />
          <span>Favorites</span>
        </button>

        {folders.map((f) => (
          <button
            key={f.id}
            onClick={() => {
              playHaptic('selection');
              setSelectedFolderId(f.id);
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              selectedFolderId === f.id
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white border border-neutral-200 text-neutral-600'
            }`}
          >
            <Folder size={12} />
            <span>{f.name}</span>
          </button>
        ))}

        <button
          onClick={() => {
            playHaptic('light');
            setShowFolderModal(true);
          }}
          className="p-1.5 rounded-full bg-neutral-200/80 hover:bg-neutral-300 text-neutral-700 transition cursor-pointer shrink-0"
          title="New Folder"
        >
          <FolderPlus size={15} />
        </button>
      </div>

      {/* Main Document Content */}
      <div className="flex-1 p-4 overflow-y-auto">
        {filteredDocs.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center text-neutral-400">
            <FileText size={40} className="stroke-1 mb-2 text-neutral-300" />
            <h4 className="text-sm font-bold text-neutral-700">No Documents Found</h4>
            <p className="text-xs text-neutral-500 mt-1">
              Try adjusting your search query or folder filter.
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 gap-3.5">
            {filteredDocs.map((doc) => {
              const isSelected = selectedDocIds.includes(doc.id);
              return (
                <div
                  key={doc.id}
                  id={`doc-card-${doc.id}`}
                  onClick={() => {
                    if (isSelecting) {
                      toggleSelectDoc(doc.id);
                    } else {
                      playHaptic('medium');
                      onOpenDocument(doc);
                    }
                  }}
                  className={`bg-white rounded-2xl p-2.5 border transition cursor-pointer relative group flex flex-col justify-between ${
                    isSelected ? 'ring-2 ring-blue-500 border-blue-400' : 'border-neutral-200/90 shadow-xs hover:shadow-md'
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="w-full h-36 bg-neutral-100 rounded-xl overflow-hidden relative mb-2 flex items-center justify-center border border-neutral-100">
                    {doc.thumbnail ? (
                      <img src={doc.thumbnail} alt={doc.title} className="w-full h-full object-cover" />
                    ) : (
                      <FileText size={32} className="text-neutral-400" />
                    )}

                    {/* Page badge */}
                    <div className="absolute bottom-1.5 right-1.5 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded text-[9px] font-bold text-white">
                      {doc.pages.length} {doc.pages.length === 1 ? 'Page' : 'Pages'}
                    </div>

                    {/* Favorite star */}
                    {doc.isFavorite && (
                      <div className="absolute top-1.5 left-1.5 text-amber-400 drop-shadow">
                        <Star size={14} fill="currentColor" />
                      </div>
                    )}

                    {/* Selection Indicator */}
                    {isSelecting && (
                      <div className={`absolute top-1.5 right-1.5 w-5 h-5 rounded-full border flex items-center justify-center ${
                        isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white/80 border-neutral-300'
                      }`}>
                        {isSelected && <Check size={12} strokeWidth={3} />}
                      </div>
                    )}
                  </div>

                  {/* Title & Metadata */}
                  <div>
                    <h4 className="text-[13px] font-bold text-neutral-900 truncate leading-snug">
                      {doc.title}
                    </h4>
                    <p className="text-[10px] text-neutral-500 mt-0.5">
                      {new Date(doc.modifiedAt).toLocaleDateString()} • {(doc.fileSize / 1024).toFixed(0)} KB
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* List View */
          <div className="space-y-2">
            {filteredDocs.map((doc) => {
              const isSelected = selectedDocIds.includes(doc.id);
              return (
                <div
                  key={doc.id}
                  onClick={() => {
                    if (isSelecting) {
                      toggleSelectDoc(doc.id);
                    } else {
                      playHaptic('medium');
                      onOpenDocument(doc);
                    }
                  }}
                  className={`bg-white rounded-xl p-3 border transition cursor-pointer flex items-center justify-between ${
                    isSelected ? 'ring-2 ring-blue-500 border-blue-400' : 'border-neutral-200/90 shadow-xs hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-13 rounded-md bg-neutral-100 border border-neutral-200 overflow-hidden shrink-0">
                      {doc.thumbnail && (
                        <img src={doc.thumbnail} alt={doc.title} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-[13px] font-bold text-neutral-900 truncate max-w-[200px]">
                        {doc.title}
                      </h4>
                      <p className="text-[11px] text-neutral-500">
                        {doc.pages.length} pages • {new Date(doc.modifiedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {doc.isFavorite && <Star size={14} className="text-amber-400 fill-amber-400" />}
                    {isSelecting ? (
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-neutral-300'
                      }`}>
                        {isSelected && <Check size={12} strokeWidth={3} />}
                      </div>
                    ) : (
                      <ChevronRight size={16} className="text-neutral-400" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Batch Actions Bar if Selecting */}
      {isSelecting && (
        <div className="px-4 py-3 bg-white border-t border-neutral-200 flex items-center justify-between shadow-lg">
          <span className="text-xs font-semibold text-neutral-600">
            {selectedDocIds.length} Selected
          </span>

          <div className="flex items-center gap-3">
            <button
              disabled={selectedDocIds.length === 0}
              onClick={() => {
                playHaptic('warning');
                selectedDocIds.forEach(id => onDeleteDocument(id));
                setSelectedDocIds([]);
                setIsSelecting(false);
              }}
              className="text-xs font-bold text-rose-600 disabled:opacity-40 flex items-center gap-1 cursor-pointer"
            >
              <Trash2 size={14} />
              <span>Delete</span>
            </button>
          </div>
        </div>
      )}

      {/* New Folder Modal */}
      {showFolderModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-xs bg-white rounded-2xl p-5 shadow-2xl border border-neutral-200">
            <h3 className="text-sm font-bold text-neutral-900 mb-1">New Folder</h3>
            <p className="text-xs text-neutral-500 mb-3">Organize your scanned documents</p>

            <input
              type="text"
              placeholder="Folder Name (e.g. Invoices 2026)"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="w-full px-3 py-2 bg-neutral-100 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 mb-4"
            />

            <div className="flex gap-2">
              <button
                onClick={() => setShowFolderModal(false)}
                className="flex-1 py-2 rounded-xl text-xs font-semibold bg-neutral-100 text-neutral-700 hover:bg-neutral-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFolder}
                className="flex-1 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-500 cursor-pointer"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
