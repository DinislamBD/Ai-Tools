import { jsPDF } from 'jspdf';
import { PDFDocument, rgb, degrees } from 'pdf-lib';
import { DocumentItem, DocumentPage, PageSize, PageOrientation, PDFQuality, PDFMetadata } from '../types';

export interface PDFExportOptions {
  pageSize?: PageSize;
  orientation?: PageOrientation;
  quality?: PDFQuality;
  metadata?: PDFMetadata;
  watermarkText?: string;
  watermarkOpacity?: number;
}

export const createPDFFromDocument = async (
  doc: DocumentItem,
  options: PDFExportOptions = {}
): Promise<{ blob: Blob; dataUrl: string; filename: string }> => {
  const {
    pageSize = 'A4',
    orientation = 'portrait',
    quality = 'standard',
    metadata = doc.metadata,
    watermarkText,
    watermarkOpacity = 0.25,
  } = options;

  // Format mapping
  const format = pageSize === 'Letter' ? 'letter' : pageSize === 'Legal' ? 'legal' : 'a4';
  const pdf = new jsPDF({
    orientation,
    unit: 'pt',
    format: format,
    compress: quality !== 'high',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // Set Metadata
  pdf.setProperties({
    title: metadata.title || doc.title,
    subject: metadata.subject || 'Scanned Document',
    author: metadata.author || 'DocuScan AI',
    keywords: metadata.keywords || 'scan, docuscan, ios',
    creator: 'DocuScan AI for iOS'
  });

  const pages = doc.pages.length > 0 ? doc.pages : [];

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    if (i > 0) {
      pdf.addPage(format, orientation);
    }

    const imgData = page.enhancedImage || page.originalImage;
    if (imgData) {
      // Calculate aspect ratio fit
      const margin = 10;
      const targetW = pageWidth - margin * 2;
      const targetH = pageHeight - margin * 2;

      pdf.addImage(imgData, 'JPEG', margin, margin, targetW, targetH, undefined, quality === 'high' ? 'NONE' : 'FAST');

      // Burn in any signatures
      if (page.signatures && page.signatures.length > 0) {
        for (const sig of page.signatures) {
          const sigW = (sig.width / 400) * targetW;
          const sigH = (sig.height / 400) * targetW;
          const sigX = margin + (sig.x / 400) * targetW;
          const sigY = margin + (sig.y / 600) * targetH;
          try {
            pdf.addImage(sig.dataUrl, 'PNG', sigX, sigY, sigW, sigH);
          } catch (e) {
            console.warn('Failed to burn signature into PDF:', e);
          }
        }
      }

      // Burn watermark if requested
      if (watermarkText) {
        pdf.saveGraphicsState();
        pdf.setTextColor(150, 150, 150);
        pdf.setFontSize(48);
        // Center watermark
        pdf.text(watermarkText, pageWidth / 2, pageHeight / 2, {
          align: 'center',
          angle: 45,
        });
        pdf.restoreGraphicsState();
      }
    }
  }

  const blob = pdf.output('blob');
  const dataUrl = pdf.output('dataurlstring');
  const cleanTitle = (doc.title || 'document').replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `${cleanTitle}.pdf`;

  return { blob, dataUrl, filename };
};

export const mergePDFDocuments = async (
  docs: DocumentItem[],
  mergedTitle = 'Merged Document'
): Promise<DocumentItem> => {
  const mergedPages: DocumentPage[] = [];
  let totalSize = 0;

  docs.forEach((doc) => {
    totalSize += doc.fileSize;
    doc.pages.forEach((p, idx) => {
      mergedPages.push({
        ...p,
        id: `merged-${p.id}-${Math.random().toString(36).substring(2, 6)}`,
        pageNumber: mergedPages.length + 1,
      });
    });
  });

  const now = new Date().toISOString();
  const firstThumb = mergedPages[0]?.thumbnailImage || docs[0]?.thumbnail || '';

  return {
    id: `doc-merged-${Date.now()}`,
    title: mergedTitle,
    createdAt: now,
    modifiedAt: now,
    pages: mergedPages,
    thumbnail: firstThumb,
    isFavorite: false,
    isDeleted: false,
    fileSize: totalSize,
    docType: 'document',
    metadata: {
      title: mergedTitle,
      author: 'DocuScan AI',
      subject: `Merged from ${docs.length} documents`,
      keywords: 'merged, pdf',
    },
    ocrFullText: docs.map(d => d.ocrFullText).join('\n\n'),
  };
};

export const splitDocument = (
  doc: DocumentItem,
  splitPageNumber: number
): [DocumentItem, DocumentItem] => {
  const pages1 = doc.pages.slice(0, splitPageNumber).map((p, i) => ({ ...p, pageNumber: i + 1 }));
  const pages2 = doc.pages.slice(splitPageNumber).map((p, i) => ({ ...p, pageNumber: i + 1 }));

  const now = new Date().toISOString();

  const doc1: DocumentItem = {
    ...doc,
    id: `doc-split-1-${Date.now()}`,
    title: `${doc.title} (Part 1)`,
    createdAt: now,
    modifiedAt: now,
    pages: pages1,
    thumbnail: pages1[0]?.thumbnailImage || doc.thumbnail,
    fileSize: Math.round(doc.fileSize * (pages1.length / doc.pages.length)),
  };

  const doc2: DocumentItem = {
    ...doc,
    id: `doc-split-2-${Date.now()}`,
    title: `${doc.title} (Part 2)`,
    createdAt: now,
    modifiedAt: now,
    pages: pages2,
    thumbnail: pages2[0]?.thumbnailImage || doc.thumbnail,
    fileSize: Math.round(doc.fileSize * (pages2.length / doc.pages.length)),
  };

  return [doc1, doc2];
};

export const compressDocumentPages = async (
  doc: DocumentItem,
  qualityRatio = 0.55
): Promise<DocumentItem> => {
  const updatedPages: DocumentPage[] = [];

  for (const page of doc.pages) {
    const img = new Image();
    img.src = page.enhancedImage || page.originalImage;
    await new Promise((res) => { img.onload = res; img.onerror = res; });

    const canvas = document.createElement('canvas');
    const scale = 0.75;
    canvas.width = (img.naturalWidth || 800) * scale;
    canvas.height = (img.naturalHeight || 1100) * scale;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const compressedData = canvas.toDataURL('image/jpeg', qualityRatio);
      updatedPages.push({
        ...page,
        enhancedImage: compressedData,
        thumbnailImage: compressedData,
      });
    } else {
      updatedPages.push(page);
    }
  }

  return {
    ...doc,
    id: `doc-compressed-${Date.now()}`,
    title: `${doc.title} (Compressed)`,
    modifiedAt: new Date().toISOString(),
    pages: updatedPages,
    fileSize: Math.round(doc.fileSize * 0.45),
  };
};
