export interface OCRWord {
  text: string;
  confidence: number;
  bbox: { x: number; y: number; width: number; height: number };
}

export interface OCRResultData {
  fullText: string;
  language: string;
  confidence: number;
  words: OCRWord[];
}

export const supportedOCRLanguages = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা' },
  { code: 'it', name: 'Italian', native: 'Italiano' },
  { code: 'es', name: 'Spanish', native: 'Español' },
  { code: 'fr', name: 'French', native: 'Français' },
  { code: 'de', name: 'German', native: 'Deutsch' },
  { code: 'ar', name: 'Arabic', native: 'العربية' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
];

export const performOCR = async (
  imageSrc: string,
  language = 'en',
  presetText?: string
): Promise<OCRResultData> => {
  // Simulate Apple Vision VNRecognizeTextRequest with realistic latency
  await new Promise(r => setTimeout(r, 650));

  if (presetText && presetText.trim().length > 0) {
    const words = presetText.split(/\s+/).map((w, i) => ({
      text: w,
      confidence: 0.94 + (i % 5) * 0.01,
      bbox: { x: (i % 8) * 90, y: Math.floor(i / 8) * 32, width: w.length * 9, height: 20 }
    }));

    return {
      fullText: presetText,
      language,
      confidence: 0.98,
      words,
    };
  }

  // Language-specific recognition outputs if no preset text
  let mockText = '';
  switch (language) {
    case 'bn':
      mockText = 'ডকুমেন্ট স্ক্যান ও ওসিআর প্রতিবেদন\nতারিখ: ১৮ সেপ্টেম্বর ২০২৬\nবিষয়: কৃত্রিম বুদ্ধিমত্তা চালিত মোবাইল অ্যাপ্লিকেশন নকশা ও বাস্তবায়ন।\n১. গোপনীয়তা ও ডিভাইস ভিত্তিক সংরক্ষণ নিশ্চিত করা হয়েছে।\n২. সমস্ত ফিচার উচ্চমানে প্রস্তুত।';
      break;
    case 'it':
      mockText = 'RELAZIONE DI SCANSIONE DOCUMENTALE E OCR\nData: 18 Settembre 2026\nOggetto: Specifica tecnica applicazione iOS DocuScan AI.\n1. Riconoscimento bordi in tempo reale e correzione prospettica.\n2. Conforme ai requisiti di privacy Apple e memorizzazione su dispositivo.';
      break;
    case 'es':
      mockText = 'REPORTE DE ESCANEO DE DOCUMENTOS OCR\nFecha: 18 de Septiembre 2026\nAsunto: Arquitectura de procesamiento de documentos y VisionKit.\n1. Detección automática de bordes y filtros de contraste inteligente.\n2. Almacenamiento local seguro.';
      break;
    case 'fr':
      mockText = 'RAPPORT DE NUMÉRISATION ET OCR\nDate: 18 Septembre 2026\nObjet: Architecture technique DocuScan AI pour iOS 17.\n1. Détection automatique des contours et correction de perspective.\n2. Traitement local respectant la vie privée.';
      break;
    case 'de':
      mockText = 'DOKUMENTEN-SCAN UND OCR-BERICHT\nDatum: 18. September 2026\nBetreff: Technische Spezifikation für DocuScan AI iOS.\n1. Echtzeit-Kantenerkennung und automatische Perspektivenkorrektur.\n2. Lokale Datenspeicherung und höchste Privatsphäre.';
      break;
    case 'ar':
      mockText = 'تقرير مسح المستندات والتعرف الضوئي على الحروف (OCR)\nالتاريخ: ١٨ سبتمبر ٢٠٢٦\nالموضوع: المواصفات الفنية لتطبيق DocuScan AI\n١. الكشف التلقائي عن حواف المستندات.\n٢. تخزين محلي آمن وخصوصية تامة.';
      break;
    case 'hi':
      mockText = 'दस्तावेज़ स्कैनिंग और ओसीआर रिपोर्ट\nदिनांक: 18 सितंबर 2026\nविषय: डॉक्यूस्कैन एआई आईओएस तकनीकी विनिर्देश।\n१. वास्तविक समय दस्तावेज़ सीमा पहचान।\n२. स्थानीय सुरक्षित भंडारण।';
      break;
    case 'en':
    default:
      mockText = 'CONFIDENTIAL DOCUMENT SCAN REPORT\nDocuScan AI - High Precision Recognition Pipeline\n\n1. EXECUTIVE SUMMARY\nThis scanned document demonstrates automated text extraction, neural boundary correction, and character classification.\n\n2. KEY DELIVERABLES\n• Complete PDF/A generation with high-compression rendering\n• Biometric hardware authentication layer\n• Local on-device storage with privacy protection\n\nVerified by Apple Vision Framework (VNRecognizeTextRequest).';
      break;
  }

  const words = mockText.split(/\s+/).map((w, i) => ({
    text: w,
    confidence: 0.95 + (i % 4) * 0.01,
    bbox: { x: (i % 6) * 110 + 20, y: Math.floor(i / 6) * 35 + 40, width: w.length * 10, height: 22 }
  }));

  return {
    fullText: mockText,
    language,
    confidence: 0.97,
    words,
  };
};
