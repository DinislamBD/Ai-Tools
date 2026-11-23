import { createWorker } from 'tesseract.js';

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
  fromSavedText?: boolean;
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
] as const;

const languageModels: Record<string, string> = {
  en: 'eng',
  bn: 'ben',
  it: 'ita',
  es: 'spa',
  fr: 'fra',
  de: 'deu',
  ar: 'ara',
  hi: 'hin',
};

/**
 * Run OCR in a Tesseract.js worker, locally in the browser.
 * Language models may be downloaded from the Tesseract.js CDN on first use.
 * No document image is intentionally uploaded to an application server.
 */
export const performOCR = async (
  imageSrc: string,
  language = 'en',
  presetText?: string
): Promise<OCRResultData> => {
  if (!Object.hasOwn(languageModels, language)) {
    throw new Error('Unsupported OCR language.');
  }

  // Preserve existing user-edited text. Its recognition confidence is unknown.
  if (presetText?.trim()) {
    return {
      fullText: presetText,
      language,
      confidence: 0,
      words: [],
      fromSavedText: true,
    };
  }

  if (!imageSrc.trim()) {
    throw new Error('Please scan or import an image before running OCR.');
  }

  const worker = await createWorker(languageModels[language]);
  try {
    const { data } = await worker.recognize(imageSrc);
    return {
      fullText: data.text ?? '',
      language,
      confidence: Math.max(0, Math.min(1, (data.confidence ?? 0) / 100)),
      words: [],
    };
  } finally {
    await worker.terminate();
  }
};
