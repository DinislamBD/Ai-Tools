import test from 'node:test';
import assert from 'node:assert/strict';
import { splitDocument, mergePDFDocuments } from '../src/services/pdfService.ts';
import type { DocumentItem, DocumentPage } from '../src/types.ts';

const adjustments = {
  brightness: 0, contrast: 0, saturation: 0, sharpness: 0,
  exposure: 0, shadows: 0, highlights: 0,
};

function page(index: number): DocumentPage {
  return {
    id: `page-${index}`,
    pageNumber: index,
    originalImage: '',
    enhancedImage: '',
    thumbnailImage: '',
    filter: 'original',
    adjustments,
    rotation: 0,
  };
}

function documentWithPages(count: number, id = 'example'): DocumentItem {
  return {
    id,
    title: 'Sample document',
    createdAt: '2026-01-01T00:00:00.000Z',
    modifiedAt: '2026-01-01T00:00:00.000Z',
    pages: Array.from({ length: count }, (_, i) => page(i + 1)),
    thumbnail: '',
    isFavorite: false,
    isDeleted: false,
    fileSize: count * 1000,
    docType: 'document',
    metadata: { title: 'Sample document' },
    ocrFullText: 'Example text',
  };
}

test('splitting preserves page order and updates page numbers', () => {
  const original = documentWithPages(4);
  const [left, right] = splitDocument(original, 2);
  assert.deepEqual(left.pages.map(p => p.pageNumber), [1, 2]);
  assert.deepEqual(right.pages.map(p => p.pageNumber), [1, 2]);
  assert.deepEqual(left.pages.map(p => p.id), ['page-1', 'page-2']);
  assert.deepEqual(right.pages.map(p => p.id), ['page-3', 'page-4']);
  assert.equal(original.pages.length, 4);
  assert.equal(left.fileSize + right.fileSize, original.fileSize);
  assert.notEqual(left.id, right.id);
});

test('split allows a single page on either side', () => {
  const [left, right] = splitDocument(documentWithPages(2), 1);
  assert.equal(left.pages.length, 1);
  assert.equal(right.pages.length, 1);
});

for (const invalid of [0, -1, 3, 1.5, NaN, Infinity]) {
  test(`split rejects invalid breakpoint ${String(invalid)}`, () => {
    assert.throws(() => splitDocument(documentWithPages(3), invalid), RangeError);
  });
}

test('split rejects documents too short to divide', () => {
  assert.throws(() => splitDocument(documentWithPages(1), 1), RangeError);
  assert.throws(() => splitDocument(documentWithPages(0), 1), RangeError);
});

test('merging concatenates pages without mutating sources', async () => {
  const docs = [documentWithPages(2, 'a'), documentWithPages(1, 'b')];
  const merged = await mergePDFDocuments(docs, 'Combined');
  assert.equal(merged.pages.length, 3);
  assert.deepEqual(merged.pages.map(p => p.pageNumber), [1, 2, 3]);
  assert.equal(merged.fileSize, 3000);
  assert.equal(merged.title, 'Combined');
  assert.deepEqual(docs.map(d => d.pages.length), [2, 1]);
});
