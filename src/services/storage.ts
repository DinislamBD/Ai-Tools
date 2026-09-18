import { DocumentItem, FolderItem, SignatureSaved, UserSettings, DocumentPage } from '../types';

const STORAGE_KEYS = {
  DOCUMENTS: 'docuscan_documents_v1',
  FOLDERS: 'docuscan_folders_v1',
  SIGNATURES: 'docuscan_signatures_v1',
  SETTINGS: 'docuscan_settings_v1',
  ONBOARDING_DONE: 'docuscan_onboarding_done_v1',
};

// High-fidelity SVG-based document renders to simulate real crisp scans
export const generateSampleDocumentCanvas = (
  type: 'contract' | 'receipt' | 'passport' | 'notes',
  title: string
): string => {
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 1100;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background
  ctx.fillStyle = type === 'receipt' ? '#fdfbf7' : type === 'notes' ? '#fffdf0' : '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (type === 'notes') {
    // Ruled lines for notes
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    for (let y = 140; y < canvas.height - 80; y += 36) {
      ctx.beginPath();
      ctx.moveTo(60, y);
      ctx.lineTo(canvas.width - 60, y);
      ctx.stroke();
    }
    // Margin line
    ctx.strokeStyle = '#fca5a5';
    ctx.beginPath();
    ctx.moveTo(120, 0);
    ctx.lineTo(120, canvas.height);
    ctx.stroke();
  }

  // Header
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 30px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(title, 80, 80);

  ctx.fillStyle = '#64748b';
  ctx.font = '16px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(`DocuScan AI Verified • ${new Date().toLocaleDateString()} • Ref: #DS-${Math.floor(100000 + Math.random() * 900000)}`, 80, 112);

  // Content body
  if (type === 'contract') {
    ctx.fillStyle = '#1e293b';
    ctx.font = '18px serif';
    const lines = [
      'CONFIDENTIAL MASTER SERVICES AGREEMENT',
      '',
      'This Master Services Agreement ("Agreement") is made effective as of the date of signing.',
      '1. Scope of Services: The Contractor agrees to provide artificial intelligence system development,',
      '   computer vision pipelines, and mobile scanning architecture services.',
      '2. Payment Terms: Invoices payable net 30 days upon acceptance of milestone deliverables.',
      '3. Intellectual Property: All developed assets, source code, and trained neural network models',
      '   shall become the exclusive property of the Client upon settlement.',
      '4. Confidentiality & Non-Disclosure: The parties covenant to safeguard all proprietary materials',
      '   and customer data with highest commercial diligence.',
      '5. Governing Law: This Agreement shall be construed in accordance with applicable laws.',
      '',
      'IN WITNESS WHEREOF, the authorized representatives have executed this Agreement.',
      '',
      'Client Signature: _______________________      Date: ____________',
      'Contractor:      _______________________      Date: ____________'
    ];
    let y = 170;
    for (const line of lines) {
      ctx.fillText(line, 80, y);
      y += 34;
    }
    // Stamp seal
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 3;
    ctx.strokeRect(canvas.width - 240, 720, 160, 60);
    ctx.fillStyle = '#0284c7';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('VERIFIED ORIGINAL', canvas.width - 225, 755);
  } else if (type === 'receipt') {
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 22px monospace';
    ctx.fillText('APPLE STORE RETAIL', 260, 160);
    ctx.font = '16px monospace';
    ctx.fillText('One Apple Park Way, Cupertino, CA', 220, 190);
    ctx.fillText('Receipt #9482-10842-8821', 250, 215);
    ctx.fillText('------------------------------------------------', 140, 245);

    const items = [
      ['iPhone 16 Pro Max 512GB Natural Titanium', '$1,399.00'],
      ['AppleCare+ with Theft and Loss (2 Yrs)', '$269.00'],
      ['MagSafe Clear Case with Camera Control', '$49.00'],
      ['30W USB-C Power Adapter Fast Charge', '$39.00'],
      ['Subtotal', '$1,756.00'],
      ['State Tax (8.25%)', '$144.87'],
      ['TOTAL AMOUNT CHARGED', '$1,900.87'],
    ];
    let y = 280;
    for (const [name, price] of items) {
      if (name.startsWith('TOTAL')) {
        ctx.font = 'bold 18px monospace';
        ctx.fillText(name, 140, y);
        ctx.fillText(price, 560, y);
      } else {
        ctx.font = '15px monospace';
        ctx.fillText(name, 140, y);
        ctx.fillText(price, 560, y);
      }
      y += 36;
    }
    ctx.fillText('------------------------------------------------', 140, y);
    ctx.font = '14px monospace';
    ctx.fillText('Payment: Apple Pay (Visa ending in 8892)', 140, y + 36);
    ctx.fillText('Thank you for shopping at Apple!', 230, y + 80);
  } else if (type === 'passport') {
    // Passport mockup
    ctx.fillStyle = '#0369a1';
    ctx.fillRect(80, 160, canvas.width - 160, 480);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText('PASSPORT / PASSEPORT', 120, 210);

    // Photo placeholder
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(120, 240, 160, 210);
    ctx.fillStyle = '#475569';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('[ PHOTO ID ]', 150, 350);

    ctx.fillStyle = '#ffffff';
    ctx.font = '16px monospace';
    ctx.fillText('Surname: DOE', 310, 260);
    ctx.fillText('Given Names: ALEXANDER JAMES', 310, 295);
    ctx.fillText('Nationality: UNITED STATES OF AMERICA', 310, 330);
    ctx.fillText('Date of Birth: 14 NOV 1992', 310, 365);
    ctx.fillText('Sex: M    Place of Birth: CALIFORNIA', 310, 400);
    ctx.fillText('Passport No: USA98762410', 310, 435);

    // Machine readable zone
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(100, 520, canvas.width - 200, 90);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px monospace';
    ctx.fillText('P<USADOE<<ALEXANDER<JAMES<<<<<<<<<<<<<<<<<<<<<', 110, 560);
    ctx.fillText('USA98762410<8USA9211144M3009181<<<<<<<<<<<<<<04', 110, 595);
  } else {
    // Notes
    ctx.fillStyle = '#1e293b';
    ctx.font = '20px "Plus Jakarta Sans", sans-serif';
    const lines = [
      'Product Strategy Meeting Notes - Q4',
      'Attendees: Sophia, Liam, Elena, Noah',
      '',
      'Key Action Items:',
      '• Finalize StoreKit 2 subscriptions & family sharing rollout',
      '• Optimize CoreImage auto-thresholding for receipts',
      '• Integrate Apple Vision multi-language OCR recognition',
      '• Run accessibility voice-over audits across all 30 screens',
      '• Benchmark PDFKit generation speed on multi-page books',
      '',
      'Next Sprint Goal: App Store Review submission readiness.'
    ];
    let y = 180;
    for (const line of lines) {
      ctx.fillText(line, 140, y);
      y += 36;
    }
  }

  return canvas.toDataURL('image/jpeg', 0.88);
};

const initialFolders: FolderItem[] = [
  { id: 'f-work', name: 'Work & Legal', color: '#2563eb', icon: 'Briefcase', createdAt: new Date().toISOString() },
  { id: 'f-finance', name: 'Receipts & Tax', color: '#059669', icon: 'Receipt', createdAt: new Date().toISOString() },
  { id: 'f-personal', name: 'Personal & IDs', color: '#7c3aed', icon: 'User', createdAt: new Date().toISOString() },
];

const initialSettings: UserSettings = {
  isPro: false,
  autoCapture: true,
  autoEnhance: true,
  defaultFilter: 'magic_color',
  defaultPageSize: 'A4',
  defaultQuality: 'high',
  ocrLanguage: 'en',
  appLanguage: 'en',
  biometricLockEnabled: false,
  passcode: null,
  iCloudSyncEnabled: true,
  theme: 'system',
  hapticsEnabled: true,
};

const createInitialDocuments = (): DocumentItem[] => {
  const contractImg = generateSampleDocumentCanvas('contract', 'Services Agreement 2026');
  const receiptImg = generateSampleDocumentCanvas('receipt', 'Apple Store Cupertino');
  const passportImg = generateSampleDocumentCanvas('passport', 'Identity Document');
  const notesImg = generateSampleDocumentCanvas('notes', 'Product Strategy Q4');

  const now = new Date();

  return [
    {
      id: 'doc-1',
      title: 'Services Agreement 2026',
      createdAt: new Date(now.getTime() - 2 * 3600000).toISOString(),
      modifiedAt: new Date(now.getTime() - 1 * 3600000).toISOString(),
      thumbnail: contractImg,
      folderId: 'f-work',
      folderName: 'Work & Legal',
      isFavorite: true,
      isDeleted: false,
      fileSize: 420000,
      docType: 'document',
      ocrFullText: 'CONFIDENTIAL MASTER SERVICES AGREEMENT Scope of Services Payment Terms net 30 days Intellectual Property Confidentiality Governing Law Client Signature Contractor',
      metadata: {
        title: 'Master Services Agreement',
        author: 'DocuScan AI Enterprise',
        subject: 'Engineering Contract',
        keywords: 'contract, legal, agreement, services',
        creationDate: now.toISOString(),
      },
      pages: [
        {
          id: 'p-1-1',
          pageNumber: 1,
          originalImage: contractImg,
          enhancedImage: contractImg,
          thumbnailImage: contractImg,
          filter: 'magic_color',
          adjustments: { brightness: 0, contrast: 10, saturation: 0, sharpness: 20, exposure: 0, shadows: 0, highlights: 0 },
          rotation: 0,
          ocrText: 'CONFIDENTIAL MASTER SERVICES AGREEMENT. Scope of Services Payment Terms net 30 days Intellectual Property.',
          ocrConfidence: 0.98,
        }
      ]
    },
    {
      id: 'doc-2',
      title: 'Apple Store Receipt',
      createdAt: new Date(now.getTime() - 24 * 3600000).toISOString(),
      modifiedAt: new Date(now.getTime() - 24 * 3600000).toISOString(),
      thumbnail: receiptImg,
      folderId: 'f-finance',
      folderName: 'Receipts & Tax',
      isFavorite: true,
      isDeleted: false,
      fileSize: 215000,
      docType: 'receipt',
      ocrFullText: 'APPLE STORE RETAIL Cupertino CA iPhone 16 Pro Max 512GB AppleCare+ MagSafe Case Subtotal $1,756.00 Total $1,900.87 Visa 8892',
      metadata: {
        title: 'Apple Store Receipt',
        author: 'Apple Retail',
        subject: 'Hardware Expense',
        keywords: 'receipt, apple, iphone, expense',
      },
      pages: [
        {
          id: 'p-2-1',
          pageNumber: 1,
          originalImage: receiptImg,
          enhancedImage: receiptImg,
          thumbnailImage: receiptImg,
          filter: 'document',
          adjustments: { brightness: 5, contrast: 25, saturation: -10, sharpness: 30, exposure: 5, shadows: 0, highlights: 0 },
          rotation: 0,
          ocrText: 'APPLE STORE RETAIL Cupertino CA. iPhone 16 Pro Max $1,399.00. TOTAL $1,900.87.',
          ocrConfidence: 0.99,
        }
      ]
    },
    {
      id: 'doc-3',
      title: 'Passport Copy - Travel',
      createdAt: new Date(now.getTime() - 48 * 3600000).toISOString(),
      modifiedAt: new Date(now.getTime() - 48 * 3600000).toISOString(),
      thumbnail: passportImg,
      folderId: 'f-personal',
      folderName: 'Personal & IDs',
      isFavorite: false,
      isDeleted: false,
      fileSize: 580000,
      docType: 'passport',
      ocrFullText: 'PASSPORT PASSEPORT DOE ALEXANDER JAMES UNITED STATES OF AMERICA Date of Birth 14 NOV 1992 Passport No USA98762410',
      metadata: {
        title: 'Passport Scan',
        author: 'Alexander Doe',
        subject: 'Travel Document',
        keywords: 'passport, id, travel, identification',
      },
      pages: [
        {
          id: 'p-3-1',
          pageNumber: 1,
          originalImage: passportImg,
          enhancedImage: passportImg,
          thumbnailImage: passportImg,
          filter: 'enhanced',
          adjustments: { brightness: 0, contrast: 15, saturation: 5, sharpness: 15, exposure: 0, shadows: 0, highlights: 0 },
          rotation: 0,
          ocrText: 'PASSPORT PASSEPORT DOE ALEXANDER JAMES USA98762410',
          ocrConfidence: 0.97,
        }
      ]
    },
    {
      id: 'doc-4',
      title: 'Strategy Meeting Notes',
      createdAt: new Date(now.getTime() - 72 * 3600000).toISOString(),
      modifiedAt: new Date(now.getTime() - 72 * 3600000).toISOString(),
      thumbnail: notesImg,
      folderId: 'f-work',
      folderName: 'Work & Legal',
      isFavorite: false,
      isDeleted: false,
      fileSize: 310000,
      docType: 'handwritten',
      ocrFullText: 'Product Strategy Meeting Notes Q4 Attendees Sophia Liam Elena Noah Finalize StoreKit 2 subscriptions CoreImage auto-thresholding Vision OCR',
      metadata: {
        title: 'Meeting Notes Q4',
        author: 'DocuScan Team',
        subject: 'Engineering Roadmap',
        keywords: 'notes, meeting, roadmap, strategy',
      },
      pages: [
        {
          id: 'p-4-1',
          pageNumber: 1,
          originalImage: notesImg,
          enhancedImage: notesImg,
          thumbnailImage: notesImg,
          filter: 'magic_color',
          adjustments: { brightness: 0, contrast: 15, saturation: 0, sharpness: 10, exposure: 0, shadows: 0, highlights: 0 },
          rotation: 0,
          ocrText: 'Product Strategy Meeting Notes - Q4. Attendees: Sophia, Liam, Elena, Noah. Action items: StoreKit 2, CoreImage filters, Vision OCR.',
          ocrConfidence: 0.95,
        }
      ]
    }
  ];
};

export const StorageService = {
  getDocuments: (): DocumentItem[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
      if (!data) {
        const initial = createInitialDocuments();
        StorageService.saveDocuments(initial);
        return initial;
      }
      return JSON.parse(data);
    } catch {
      return createInitialDocuments();
    }
  },

  saveDocuments: (docs: DocumentItem[]): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(docs));
    } catch (e) {
      console.error('Failed to save documents to storage:', e);
    }
  },

  saveDocument: (doc: DocumentItem): void => {
    const docs = StorageService.getDocuments();
    const index = docs.findIndex(d => d.id === doc.id);
    if (index >= 0) {
      docs[index] = { ...doc, modifiedAt: new Date().toISOString() };
    } else {
      docs.unshift(doc);
    }
    StorageService.saveDocuments(docs);
  },

  deleteDocument: (id: string, permanent = false): void => {
    const docs = StorageService.getDocuments();
    if (permanent) {
      const filtered = docs.filter(d => d.id !== id);
      StorageService.saveDocuments(filtered);
    } else {
      const updated = docs.map(d => d.id === id ? { ...d, isDeleted: true, deletedAt: new Date().toISOString() } : d);
      StorageService.saveDocuments(updated);
    }
  },

  restoreDocument: (id: string): void => {
    const docs = StorageService.getDocuments();
    const updated = docs.map(d => d.id === id ? { ...d, isDeleted: false, deletedAt: undefined } : d);
    StorageService.saveDocuments(updated);
  },

  toggleFavorite: (id: string): void => {
    const docs = StorageService.getDocuments();
    const updated = docs.map(d => d.id === id ? { ...d, isFavorite: !d.isFavorite } : d);
    StorageService.saveDocuments(updated);
  },

  getFolders: (): FolderItem[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FOLDERS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.FOLDERS, JSON.stringify(initialFolders));
        return initialFolders;
      }
      return JSON.parse(data);
    } catch {
      return initialFolders;
    }
  },

  saveFolder: (folder: FolderItem): void => {
    const folders = StorageService.getFolders();
    const idx = folders.findIndex(f => f.id === folder.id);
    if (idx >= 0) {
      folders[idx] = folder;
    } else {
      folders.push(folder);
    }
    localStorage.setItem(STORAGE_KEYS.FOLDERS, JSON.stringify(folders));
  },

  deleteFolder: (id: string): void => {
    const folders = StorageService.getFolders().filter(f => f.id !== id);
    localStorage.setItem(STORAGE_KEYS.FOLDERS, JSON.stringify(folders));
  },

  getSignatures: (): SignatureSaved[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SIGNATURES);
      if (!data) return [];
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  saveSignature: (sig: SignatureSaved): void => {
    const sigs = StorageService.getSignatures();
    sigs.unshift(sig);
    localStorage.setItem(STORAGE_KEYS.SIGNATURES, JSON.stringify(sigs));
  },

  deleteSignature: (id: string): void => {
    const sigs = StorageService.getSignatures().filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEYS.SIGNATURES, JSON.stringify(sigs));
  },

  getSettings: (): UserSettings => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!data) return initialSettings;
      return { ...initialSettings, ...JSON.parse(data) };
    } catch {
      return initialSettings;
    }
  },

  saveSettings: (settings: UserSettings): void => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },

  isOnboardingDone: (): boolean => {
    return localStorage.getItem(STORAGE_KEYS.ONBOARDING_DONE) === 'true';
  },

  setOnboardingDone: (done: boolean): void => {
    localStorage.setItem(STORAGE_KEYS.ONBOARDING_DONE, done ? 'true' : 'false');
  }
};
