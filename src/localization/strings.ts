import { SupportedLanguage } from '../types';

export interface TranslationDict {
  goodMorning: string;
  goodAfternoon: string;
  goodEvening: string;
  scanDocument: string;
  quickTools: string;
  recentDocuments: string;
  allDocuments: string;
  importFile: string;
  ocrExtract: string;
  pdfTools: string;
  createPdf: string;
  mergePdf: string;
  splitPdf: string;
  compressPdf: string;
  signature: string;
  annotate: string;
  searchPlaceholder: string;
  favorites: string;
  folders: string;
  recentlyDeleted: string;
  settings: string;
  upgradeToPro: string;
  proBadge: string;
  unlockPro: string;
  autoCapture: string;
  manualCapture: string;
  holdStill: string;
  documentDetected: string;
  noDocumentDetected: string;
  cropRotate: string;
  filters: string;
  enhancements: string;
  save: string;
  cancel: string;
  done: string;
  edit: string;
  delete: string;
  share: string;
  print: string;
  retake: string;
  addPage: string;
  copyText: string;
  copied: string;
  ocrSuccess: string;
  ocrFailed: string;
  pdfCreated: string;
  faceIdLocked: string;
  unlockWithBiometrics: string;
  enterPasscode: string;
  restorePurchases: string;
  termsOfUse: string;
  privacyPolicy: string;
  continueBtn: string;
  skip: string;
}

export const translations: Record<SupportedLanguage, TranslationDict> = {
  en: {
    goodMorning: 'Good morning',
    goodAfternoon: 'Good afternoon',
    goodEvening: 'Good evening',
    scanDocument: 'Scan Document',
    quickTools: 'Quick Tools',
    recentDocuments: 'Recent Documents',
    allDocuments: 'All Documents',
    importFile: 'Import',
    ocrExtract: 'OCR Text',
    pdfTools: 'PDF Tools',
    createPdf: 'Create PDF',
    mergePdf: 'Merge PDF',
    splitPdf: 'Split PDF',
    compressPdf: 'Compress',
    signature: 'Sign',
    annotate: 'Annotate',
    searchPlaceholder: 'Search documents, OCR text, tags...',
    favorites: 'Favorites',
    folders: 'Folders',
    recentlyDeleted: 'Recently Deleted',
    settings: 'Settings',
    upgradeToPro: 'Upgrade to DocuScan Pro',
    proBadge: 'PRO',
    unlockPro: 'Unlock Pro',
    autoCapture: 'Auto',
    manualCapture: 'Manual',
    holdStill: 'Hold still — capturing...',
    documentDetected: 'Document detected',
    noDocumentDetected: 'Align document inside frame',
    cropRotate: 'Crop & Rotate',
    filters: 'Filters',
    enhancements: 'Enhancements',
    save: 'Save',
    cancel: 'Cancel',
    done: 'Done',
    edit: 'Edit',
    delete: 'Delete',
    share: 'Share',
    print: 'AirPrint',
    retake: 'Retake',
    addPage: 'Add Page',
    copyText: 'Copy All Text',
    copied: 'Copied to Clipboard',
    ocrSuccess: 'Text extracted successfully',
    ocrFailed: 'OCR processing failed',
    pdfCreated: 'PDF Document Ready',
    faceIdLocked: 'DocuScan AI is Locked',
    unlockWithBiometrics: 'Tap Face ID to Unlock',
    enterPasscode: 'Enter 4-Digit Passcode',
    restorePurchases: 'Restore Purchases',
    termsOfUse: 'Terms of Use',
    privacyPolicy: 'Privacy Policy',
    continueBtn: 'Continue',
    skip: 'Skip'
  },
  bn: {
    goodMorning: 'শুভ সকাল',
    goodAfternoon: 'শুভ অপরাহ্ন',
    goodEvening: 'শুভ সন্ধ্যা',
    scanDocument: 'ডকুমেন্ট স্ক্যান করুন',
    quickTools: 'দ্রুত টুলস',
    recentDocuments: 'সাম্প্রতিক ডকুমেন্টস',
    allDocuments: 'সকল ডকুমেন্টস',
    importFile: 'ইমপোর্ট',
    ocrExtract: 'ওসিআর টেক্সট',
    pdfTools: 'পিডিএফ টুলস',
    createPdf: 'পিডিএফ তৈরি',
    mergePdf: 'পিডিএফ একত্র',
    splitPdf: 'পিডিএফ বিভক্ত',
    compressPdf: 'কম্প্রেস',
    signature: 'স্বাক্ষর',
    annotate: 'টীকা',
    searchPlaceholder: 'ডকুমেন্ট বা টেক্সট অনুসন্ধান করুন...',
    favorites: 'পছন্দসমূহ',
    folders: 'ফোল্ডার',
    recentlyDeleted: 'সম্প্রতি মুছে ফেলা',
    settings: 'সেটিংস',
    upgradeToPro: 'ডকুস্ক্যান প্রো নিন',
    proBadge: 'প্রো',
    unlockPro: 'প্রো আনলক করুন',
    autoCapture: 'অটো',
    manualCapture: 'ম্যানুয়াল',
    holdStill: 'স্থির রাখুন — ক্যাপচার হচ্ছে...',
    documentDetected: 'ডকুমেন্ট সনাক্ত হয়েছে',
    noDocumentDetected: 'ফ্রেমের ভেতর ডকুমেন্ট রাখুন',
    cropRotate: 'ক্রপ ও ঘোরান',
    filters: 'ফিল্টার',
    enhancements: 'উন্নতিকরণ',
    save: 'সংরক্ষণ',
    cancel: 'বাতিল',
    done: 'সম্পন্ন',
    edit: 'সম্পাদনা',
    delete: 'মুছুন',
    share: 'শেয়ার',
    print: 'প্রিন্ট',
    retake: 'আবার তুলুন',
    addPage: 'পৃষ্ঠা যোগ করুন',
    copyText: 'সব টেক্সট কপি করুন',
    copied: 'ক্লিপবোর্ডে কপি করা হয়েছে',
    ocrSuccess: 'টেক্সট সফলভাবে উদ্ধার হয়েছে',
    ocrFailed: 'ওসিআর ব্যর্থ হয়েছে',
    pdfCreated: 'পিডিএফ প্রস্তুত',
    faceIdLocked: 'ডকুস্ক্যান লক করা',
    unlockWithBiometrics: 'আনলক করতে ফেস আইডি চাপুন',
    enterPasscode: '৪ সংখ্যার পাসকোড দিন',
    restorePurchases: 'ক্রয় পুনরুদ্ধার',
    termsOfUse: 'ব্যবহারের শর্তাবলী',
    privacyPolicy: 'গোপনীয়তা নীতি',
    continueBtn: 'এগিয়ে যান',
    skip: 'এড়িয়ে যান'
  },
  it: {
    goodMorning: 'Buongiorno',
    goodAfternoon: 'Buon pomeriggio',
    goodEvening: 'Buonasera',
    scanDocument: 'Scansiona Documento',
    quickTools: 'Strumenti Rapidi',
    recentDocuments: 'Documenti Recenti',
    allDocuments: 'Tutti i Documenti',
    importFile: 'Importa',
    ocrExtract: 'Testo OCR',
    pdfTools: 'Strumenti PDF',
    createPdf: 'Crea PDF',
    mergePdf: 'Unisci PDF',
    splitPdf: 'Dividi PDF',
    compressPdf: 'Comprimi',
    signature: 'Firma',
    annotate: 'Annota',
    searchPlaceholder: 'Cerca documenti, testo OCR, cartelle...',
    favorites: 'Preferiti',
    folders: 'Cartelle',
    recentlyDeleted: 'Eliminati di Recente',
    settings: 'Impostazioni',
    upgradeToPro: 'Passa a DocuScan Pro',
    proBadge: 'PRO',
    unlockPro: 'Sblocca Pro',
    autoCapture: 'Auto',
    manualCapture: 'Manuale',
    holdStill: 'Tieni fermo — acquisizione...',
    documentDetected: 'Documento rilevato',
    noDocumentDetected: 'Allinea il documento nel riquadro',
    cropRotate: 'Ritaglia e Ruota',
    filters: 'Filtri',
    enhancements: 'Miglioramenti',
    save: 'Salva',
    cancel: 'Annulla',
    done: 'Fatto',
    edit: 'Modifica',
    delete: 'Elimina',
    share: 'Condividi',
    print: 'AirPrint',
    retake: 'Rifai',
    addPage: 'Aggiungi Pagina',
    copyText: 'Copia Tutto il Testo',
    copied: 'Copiato negli Appunti',
    ocrSuccess: 'Testo estratto con successo',
    ocrFailed: 'Estrazione OCR fallita',
    pdfCreated: 'Documento PDF Pronto',
    faceIdLocked: 'DocuScan AI è Bloccato',
    unlockWithBiometrics: 'Tocca Face ID per Sbloccare',
    enterPasscode: 'Inserisci il PIN a 4 Cifre',
    restorePurchases: 'Ripristina Acquisti',
    termsOfUse: 'Termini di Utilizzo',
    privacyPolicy: 'Informativa sulla Privacy',
    continueBtn: 'Continua',
    skip: 'Salta'
  }
};
