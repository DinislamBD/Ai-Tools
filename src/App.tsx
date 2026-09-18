import React, { useState, useEffect } from 'react';
import {
  DocumentItem,
  DocumentPage,
  FolderItem,
  AppSettings,
  MainTab,
  SignatureStamp,
  Point
} from './types';
import { StorageService, generateSampleDocumentCanvas } from './services/storage';
import { playHaptic } from './services/haptics';
import { IPhoneFrame } from './components/common/IPhoneFrame';
import { IOSTabBar } from './components/common/IOSTabBar';
import { SplashScreen } from './components/screens/SplashScreen';
import { OnboardingScreen } from './components/screens/OnboardingScreen';
import { HomeScreen } from './components/screens/HomeScreen';
import { LibraryScreen } from './components/screens/LibraryScreen';
import { ScannerCameraScreen } from './components/screens/ScannerCameraScreen';
import { ScanPreviewScreen } from './components/screens/ScanPreviewScreen';
import { MultiPageEditorScreen } from './components/screens/MultiPageEditorScreen';
import { ImageEnhancementScreen } from './components/screens/ImageEnhancementScreen';
import { CropScreen } from './components/screens/CropScreen';
import { OCRScreen } from './components/screens/OCRScreen';
import { DocumentViewerScreen } from './components/screens/DocumentViewerScreen';
import { PDFViewerScreen } from './components/screens/PDFViewerScreen';
import { PDFToolsScreen } from './components/screens/PDFToolsScreen';
import { MergePDFScreen } from './components/screens/MergePDFScreen';
import { SplitPDFScreen } from './components/screens/SplitPDFScreen';
import { CompressPDFScreen } from './components/screens/CompressPDFScreen';
import { SignatureScreen } from './components/screens/SignatureScreen';
import { AnnotationScreen } from './components/screens/AnnotationScreen';
import { SecurityLockScreen } from './components/screens/SecurityLockScreen';
import { SubscriptionPaywallScreen } from './components/screens/SubscriptionPaywallScreen';
import { SettingsScreen } from './components/screens/SettingsScreen';
import { SwiftCodeModal } from './components/modals/SwiftCodeModal';

export default function App() {
  const [screen, setScreen] = useState<string>('splash');
  const [currentTab, setCurrentTab] = useState<MainTab>('home');
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [settings, setSettings] = useState<AppSettings>(StorageService.getSettings());
  const [isBezelMode, setIsBezelMode] = useState<boolean>(true);
  const [isSwiftModalOpen, setIsSwiftModalOpen] = useState<boolean>(false);

  // Active items for sub-screens
  const [activeDocument, setActiveDocument] = useState<DocumentItem | null>(null);
  const [activePageIndex, setActivePageIndex] = useState<number>(0);
  const [capturedPages, setCapturedPages] = useState<DocumentPage[]>([]);

  // Initialize storage
  useEffect(() => {
    const loadedDocs = StorageService.getDocuments();
    const loadedFolders = StorageService.getFolders();
    const loadedSettings = StorageService.getSettings();
    setDocuments(loadedDocs);
    setFolders(loadedFolders);
    setSettings(loadedSettings);

    // Check onboarding & security lock
    const timer = setTimeout(() => {
      if (loadedSettings.securityLock || loadedSettings.biometricLockEnabled) {
        setScreen('locked');
      } else if (!StorageService.isOnboardingDone()) {
        setScreen('onboarding');
      } else {
        setScreen('main');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Save documents on change
  const handleUpdateDocuments = (newDocs: DocumentItem[]) => {
    setDocuments(newDocs);
    StorageService.saveDocuments(newDocs);
  };

  const handleSaveDocument = (doc: DocumentItem) => {
    StorageService.saveDocument(doc);
    const updated = StorageService.getDocuments();
    setDocuments(updated);
    setActiveDocument(doc);
  };

  const handleDeleteDocument = (docId: string) => {
    StorageService.deleteDocument(docId, false);
    setDocuments(StorageService.getDocuments());
    if (activeDocument?.id === docId) {
      setActiveDocument(null);
      setScreen('main');
    }
  };

  const handleToggleFavorite = (docId: string) => {
    StorageService.toggleFavorite(docId);
    setDocuments(StorageService.getDocuments());
    if (activeDocument?.id === docId) {
      setActiveDocument(prev => prev ? { ...prev, isFavorite: !prev.isFavorite } : null);
    }
  };

  const handleCreateFolder = (name: string, color: string) => {
    const newFolder: FolderItem = {
      id: `f-${Date.now()}`,
      name,
      color,
      icon: 'folder',
      createdAt: new Date().toISOString(),
      documentCount: 0,
    };
    StorageService.saveFolder(newFolder);
    setFolders(StorageService.getFolders());
  };

  // Quick scan trigger
  const handleStartScan = () => {
    playHaptic('medium');
    setCapturedPages([]);
    setScreen('scanner_camera');
  };

  // Capture callback from camera
  const handleCapturePage = (page: DocumentPage, allPages: DocumentPage[]) => {
    setCapturedPages(allPages);
  };

  // Finish camera scan -> create doc or open editor
  const handleFinishScan = (pages: DocumentPage[]) => {
    if (pages.length === 0) return;

    const newDoc: DocumentItem = {
      id: `doc-${Date.now()}`,
      title: `Scan ${new Date().toLocaleDateString()}`,
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
      pages: pages,
      thumbnail: pages[0]?.thumbnailImage || pages[0]?.originalImage,
      isFavorite: false,
      isDeleted: false,
      fileSize: pages.length * 350000,
      docType: 'document',
      ocrFullText: pages.map(p => p.ocrText || '').join(' '),
      metadata: {
        title: `Scan ${new Date().toLocaleDateString()}`,
        author: 'DocuScan AI User',
        creationDate: new Date().toISOString(),
      }
    };

    handleSaveDocument(newDoc);
    setActiveDocument(newDoc);
    setActivePageIndex(0);

    if (pages.length === 1) {
      setScreen('scan_preview');
    } else {
      setScreen('multi_page_editor');
    }
  };

  // Import file from photo library / files
  const handleImportFile = (file: File) => {
    playHaptic('success');
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const newPage: DocumentPage = {
        id: `p-import-${Date.now()}`,
        pageNumber: 1,
        originalImage: dataUrl,
        enhancedImage: dataUrl,
        thumbnailImage: dataUrl,
        filter: 'original',
        adjustments: { brightness: 0, contrast: 0, saturation: 0, sharpness: 0, exposure: 0, shadows: 0, highlights: 0 },
        rotation: 0,
        ocrText: 'Imported image document.',
      };

      const newDoc: DocumentItem = {
        id: `doc-${Date.now()}`,
        title: file.name.replace(/\.[^/.]+$/, "") || 'Imported Document',
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
        pages: [newPage],
        thumbnail: dataUrl,
        isFavorite: false,
        isDeleted: false,
        fileSize: file.size || 250000,
        docType: 'document',
        ocrFullText: 'Imported file scan.',
        metadata: {
          title: file.name,
          creationDate: new Date().toISOString(),
        }
      };

      handleSaveDocument(newDoc);
      setActiveDocument(newDoc);
      setScreen('document_viewer');
    };
    reader.readAsDataURL(file);
  };

  // AirPrint simulation
  const handleAirPrint = () => {
    playHaptic('medium');
    window.print();
  };

  // Web Share simulation
  const handleShare = async () => {
    playHaptic('light');
    if (navigator.share && activeDocument) {
      try {
        await navigator.share({
          title: activeDocument.title,
          text: `DocuScan AI Scan: ${activeDocument.title}`,
        });
      } catch {
        alert(`Document ready to share: ${activeDocument.title}`);
      }
    } else {
      alert(`Sharing options opened for "${activeDocument?.title || 'Document'}"`);
    }
  };

  // Navigation handler from HomeScreen
  const handleHomeNavigate = (targetScreen: any, docId?: string) => {
    if (docId) {
      const doc = documents.find(d => d.id === docId);
      if (doc) setActiveDocument(doc);
    }

    if (targetScreen === 'scanner_camera') {
      handleStartScan();
    } else if (targetScreen === 'document_viewer') {
      setScreen('document_viewer');
    } else if (targetScreen === 'pdf_tools') {
      setCurrentTab('pdf_tools');
      setScreen('main');
    } else if (targetScreen === 'document_library' || targetScreen === 'favorites') {
      setCurrentTab('library');
      setScreen('main');
    } else if (targetScreen === 'ocr_view' && activeDocument) {
      setScreen('ocr_view');
    } else if (targetScreen === 'paywall') {
      setScreen('paywall');
    } else if (targetScreen === 'settings') {
      setCurrentTab('settings');
      setScreen('main');
    }
  };

  // Active page helper
  const currentPage = activeDocument?.pages[activePageIndex] || activeDocument?.pages[0];

  return (
    <IPhoneFrame
      isBezelMode={isBezelMode}
      onToggleBezel={() => setIsBezelMode(!isBezelMode)}
      onCodeClick={() => setIsSwiftModalOpen(true)}
      onHomeClick={() => {
        playHaptic('light');
        setScreen('main');
      }}
      currentScreenTitle={screen}
    >
      {/* 1. Splash Screen */}
      {screen === 'splash' && (
        <SplashScreen
          onFinish={() => {
            if (settings.securityLock || settings.biometricLockEnabled) {
              setScreen('locked');
            } else if (!StorageService.isOnboardingDone()) {
              setScreen('onboarding');
            } else {
              setScreen('main');
            }
          }}
        />
      )}

      {/* 2. Onboarding Screen */}
      {screen === 'onboarding' && (
        <OnboardingScreen
          onComplete={() => {
            StorageService.setOnboardingDone(true);
            setScreen('main');
          }}
        />
      )}

      {/* 3. Security App Lock Screen */}
      {screen === 'locked' && (
        <SecurityLockScreen
          correctPasscode={settings.passcode || '1234'}
          onUnlocked={() => {
            if (!StorageService.isOnboardingDone()) {
              setScreen('onboarding');
            } else {
              setScreen('main');
            }
          }}
        />
      )}

      {/* 4. Main Tabs (Home, Library, PDF Tools, Settings) */}
      {screen === 'main' && (
        <div className="flex-1 flex flex-col justify-between overflow-hidden">
          {currentTab === 'home' && (
            <HomeScreen
              documents={documents}
              settings={settings}
              onNavigate={handleHomeNavigate}
              onImportFile={handleImportFile}
              onOpenPaywall={() => setScreen('paywall')}
            />
          )}

          {currentTab === 'library' && (
            <LibraryScreen
              documents={documents}
              folders={folders}
              onOpenDocument={(doc) => {
                setActiveDocument(doc);
                setActivePageIndex(0);
                setScreen('document_viewer');
              }}
              onDeleteDocument={handleDeleteDocument}
              onToggleFavorite={handleToggleFavorite}
              onCreateFolder={handleCreateFolder}
              onMoveToFolder={(docIds, folderId) => {
                const folder = folders.find(f => f.id === folderId);
                const updated = documents.map(d =>
                  docIds.includes(d.id) ? { ...d, folderId, folderName: folder?.name } : d
                );
                handleUpdateDocuments(updated);
              }}
            />
          )}

          {currentTab === 'pdf_tools' && (
            <PDFToolsScreen
              onSelectTool={(toolId) => {
                if (toolId === 'merge_pdf') setScreen('merge_pdf');
                else if (toolId === 'split_pdf') {
                  if (documents.length > 0) {
                    setActiveDocument(documents[0]);
                    setScreen('split_pdf');
                  } else {
                    alert('Scan or import a multi-page document first.');
                  }
                } else if (toolId === 'compress_pdf') {
                  if (documents.length > 0) {
                    setActiveDocument(documents[0]);
                    setScreen('compress_pdf');
                  }
                } else if (toolId === 'signature_studio') {
                  setScreen('signature_studio');
                } else if (toolId === 'watermark_pdf' || toolId === 'password_pdf') {
                  if (documents.length > 0) {
                    setActiveDocument(documents[0]);
                    setScreen('pdf_viewer');
                  }
                } else {
                  setScreen('paywall');
                }
              }}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsScreen
              settings={settings}
              onUpdateSettings={(newSet) => {
                setSettings(newSet);
                StorageService.saveSettings(newSet);
              }}
              onOpenPaywall={() => setScreen('paywall')}
              onClearCache={() => {
                playHaptic('success');
                alert('Image cache cleared successfully.');
              }}
            />
          )}

          {/* Persistent iOS Tab Bar */}
          <IOSTabBar
            currentTab={currentTab}
            onSelectTab={(t) => setCurrentTab(t)}
          />
        </div>
      )}

      {/* 5. Live Scanner Camera Screen */}
      {screen === 'scanner_camera' && (
        <ScannerCameraScreen
          onCapturePage={handleCapturePage}
          onFinishScan={handleFinishScan}
          onCancel={() => setScreen('main')}
          autoCaptureDefault={settings.autoCapture}
        />
      )}

      {/* 6. Scan Preview Screen */}
      {screen === 'scan_preview' && currentPage && (
        <ScanPreviewScreen
          page={currentPage}
          totalPages={activeDocument?.pages.length || 1}
          onRetake={() => setScreen('scanner_camera')}
          onCrop={() => setScreen('crop')}
          onFilter={() => setScreen('image_enhancement')}
          onAddMore={() => setScreen('scanner_camera')}
          onDone={() => setScreen('document_viewer')}
        />
      )}

      {/* 7. Multi-Page Editor Screen */}
      {screen === 'multi_page_editor' && activeDocument && (
        <MultiPageEditorScreen
          document={activeDocument}
          onSave={(doc) => {
            handleSaveDocument(doc);
            setScreen('document_viewer');
          }}
          onCancel={() => setScreen('main')}
          onOpenCrop={(idx) => {
            setActivePageIndex(idx);
            setScreen('crop');
          }}
          onOpenEnhance={(idx) => {
            setActivePageIndex(idx);
            setScreen('image_enhancement');
          }}
          onOpenOCR={(idx) => {
            setActivePageIndex(idx);
            setScreen('ocr_view');
          }}
          onOpenAnnotate={(idx) => {
            setActivePageIndex(idx);
            setScreen('annotation_canvas');
          }}
          onAddPage={() => setScreen('scanner_camera')}
        />
      )}

      {/* 8. Image Filter & Tuning Screen */}
      {screen === 'image_enhancement' && currentPage && activeDocument && (
        <ImageEnhancementScreen
          page={currentPage}
          onApply={(updatedPage) => {
            const updatedPages = [...activeDocument.pages];
            updatedPages[activePageIndex] = updatedPage;
            const updatedDoc: DocumentItem = {
              ...activeDocument,
              pages: updatedPages,
              thumbnail: updatedPages[0]?.thumbnailImage || activeDocument.thumbnail,
            };
            handleSaveDocument(updatedDoc);
            setScreen('multi_page_editor');
          }}
          onCancel={() => setScreen('multi_page_editor')}
        />
      )}

      {/* 9. Crop & Perspective Warp Screen */}
      {screen === 'crop' && currentPage && activeDocument && (
        <CropScreen
          page={currentPage}
          onApplyCrop={(updatedPage) => {
            const updatedPages = [...activeDocument.pages];
            updatedPages[activePageIndex] = updatedPage;
            const updatedDoc: DocumentItem = {
              ...activeDocument,
              pages: updatedPages,
              thumbnail: updatedPages[0]?.thumbnailImage || activeDocument.thumbnail,
            };
            handleSaveDocument(updatedDoc);
            setScreen('multi_page_editor');
          }}
          onCancel={() => setScreen('multi_page_editor')}
        />
      )}

      {/* 10. OCR Screen */}
      {screen === 'ocr_view' && currentPage && activeDocument && (
        <OCRScreen
          page={currentPage}
          onSaveExtractedText={(text) => {
            const updatedPages = [...activeDocument.pages];
            updatedPages[activePageIndex] = { ...currentPage, ocrText: text };
            const updatedDoc: DocumentItem = {
              ...activeDocument,
              pages: updatedPages,
              ocrFullText: updatedPages.map(p => p.ocrText || '').join('\n'),
            };
            handleSaveDocument(updatedDoc);
          }}
          onBack={() => setScreen('document_viewer')}
        />
      )}

      {/* 11. Document Viewer Screen */}
      {screen === 'document_viewer' && activeDocument && (
        <DocumentViewerScreen
          document={activeDocument}
          onBack={() => setScreen('main')}
          onOpenPDF={() => setScreen('pdf_viewer')}
          onEditPages={() => setScreen('multi_page_editor')}
          onOpenOCR={() => setScreen('ocr_view')}
          onOpenSign={() => setScreen('signature_studio')}
          onOpenAnnotate={() => setScreen('annotation_canvas')}
          onToggleFavorite={() => handleToggleFavorite(activeDocument.id)}
          onDelete={() => handleDeleteDocument(activeDocument.id)}
          onAirPrint={handleAirPrint}
          onShare={handleShare}
        />
      )}

      {/* 12. PDF Viewer Screen */}
      {screen === 'pdf_viewer' && activeDocument && (
        <PDFViewerScreen
          document={activeDocument}
          onBack={() => setScreen('document_viewer')}
          onShare={handleShare}
          onAirPrint={handleAirPrint}
        />
      )}

      {/* 13. Merge PDF Screen */}
      {screen === 'merge_pdf' && (
        <MergePDFScreen
          documents={documents}
          onMergeComplete={(mergedDoc) => {
            handleSaveDocument(mergedDoc);
            setActiveDocument(mergedDoc);
            setScreen('document_viewer');
          }}
          onCancel={() => setScreen('main')}
        />
      )}

      {/* 14. Split PDF Screen */}
      {screen === 'split_pdf' && activeDocument && (
        <SplitPDFScreen
          document={activeDocument}
          onSplitComplete={(doc1, doc2) => {
            handleSaveDocument(doc1);
            handleSaveDocument(doc2);
            setActiveDocument(doc1);
            setScreen('document_viewer');
          }}
          onCancel={() => setScreen('main')}
        />
      )}

      {/* 15. Compress PDF Screen */}
      {screen === 'compress_pdf' && activeDocument && (
        <CompressPDFScreen
          document={activeDocument}
          onCompressComplete={(compressed) => {
            handleSaveDocument(compressed);
            setActiveDocument(compressed);
            setScreen('document_viewer');
          }}
          onCancel={() => setScreen('main')}
        />
      )}

      {/* 16. Digital Signature Screen */}
      {screen === 'signature_studio' && (
        <SignatureScreen
          onApplySignature={(stamp) => {
            if (activeDocument && currentPage) {
              // Stamp signature onto active page canvas
              const canvas = document.createElement('canvas');
              canvas.width = 800;
              canvas.height = 1100;
              const ctx = canvas.getContext('2d');
              if (ctx) {
                const bgImg = new Image();
                bgImg.src = currentPage.enhancedImage || currentPage.originalImage;
                bgImg.onload = () => {
                  ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
                  const sigImg = new Image();
                  sigImg.src = stamp.dataUrl;
                  sigImg.onload = () => {
                    ctx.drawImage(sigImg, stamp.x, stamp.y, stamp.width, stamp.height);
                    const stampedUrl = canvas.toDataURL('image/jpeg', 0.92);

                    const updatedPages = [...activeDocument.pages];
                    updatedPages[activePageIndex] = {
                      ...currentPage,
                      enhancedImage: stampedUrl,
                      thumbnailImage: stampedUrl,
                    };
                    const updatedDoc: DocumentItem = {
                      ...activeDocument,
                      pages: updatedPages,
                    };
                    handleSaveDocument(updatedDoc);
                    setScreen('document_viewer');
                  };
                };
              }
            } else {
              setScreen('main');
            }
          }}
          onCancel={() => {
            if (activeDocument) setScreen('document_viewer');
            else setScreen('main');
          }}
        />
      )}

      {/* 17. Annotation Canvas Screen */}
      {screen === 'annotation_canvas' && currentPage && activeDocument && (
        <AnnotationScreen
          page={currentPage}
          onApply={(updatedPage) => {
            const updatedPages = [...activeDocument.pages];
            updatedPages[activePageIndex] = updatedPage;
            const updatedDoc: DocumentItem = {
              ...activeDocument,
              pages: updatedPages,
              thumbnail: updatedPages[0]?.thumbnailImage || activeDocument.thumbnail,
            };
            handleSaveDocument(updatedDoc);
            setScreen('document_viewer');
          }}
          onCancel={() => setScreen('document_viewer')}
        />
      )}

      {/* 18. StoreKit Subscription Paywall */}
      {screen === 'paywall' && (
        <SubscriptionPaywallScreen
          onDismiss={() => setScreen('main')}
          onSubscribe={(tier) => {
            playHaptic('success');
            const updatedSettings: AppSettings = {
              ...settings,
              isPro: true,
              subscriptionPlan: tier === 'annual' ? 'yearly' : tier,
            };
            setSettings(updatedSettings);
            StorageService.saveSettings(updatedSettings);
            alert(`Welcome to DocuScan AI Pro! (${tier.toUpperCase()})`);
            setScreen('main');
          }}
          onRestore={() => {
            playHaptic('success');
            alert('Purchases restored. You are an active Pro member.');
            const updatedSettings: AppSettings = { ...settings, isPro: true };
            setSettings(updatedSettings);
            StorageService.saveSettings(updatedSettings);
            setScreen('main');
          }}
        />
      )}

      {/* Swift Architecture Inspector Modal */}
      <SwiftCodeModal
        isOpen={isSwiftModalOpen}
        onClose={() => setIsSwiftModalOpen(false)}
      />
    </IPhoneFrame>
  );
}
