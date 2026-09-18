export type FilterType = 
  | 'auto' 
  | 'original' 
  | 'magic_color' 
  | 'black_and_white' 
  | 'grayscale' 
  | 'document' 
  | 'enhanced' 
  | 'low_light';

export type ScanMode = 
  | 'document' 
  | 'receipt' 
  | 'id_card' 
  | 'passport' 
  | 'business_card' 
  | 'book' 
  | 'handwritten';

export type PageSize = 'A4' | 'Letter' | 'Legal' | 'Original';
export type PageOrientation = 'portrait' | 'landscape';
export type PDFQuality = 'draft' | 'standard' | 'high';

export interface Point {
  x: number;
  y: number;
}

export interface QuadCropPoints {
  topLeft: Point;
  topRight: Point;
  bottomRight: Point;
  bottomLeft: Point;
}

export interface ImageAdjustments {
  brightness: number;  // -100 to 100
  contrast: number;    // -100 to 100
  saturation: number;  // -100 to 100
  sharpness: number;   // 0 to 100
  exposure: number;    // -100 to 100
  shadows: number;     // -100 to 100
  highlights: number;  // -100 to 100
}

export interface AnnotationItem {
  id: string;
  type: 'pen' | 'highlighter' | 'text' | 'arrow' | 'rectangle' | 'circle' | 'underline' | 'strikethrough';
  color: string;
  strokeWidth: number;
  points?: Point[];
  rect?: { x: number; y: number; width: number; height: number };
  text?: string;
  fontSize?: number;
}

export interface SignatureStamp {
  id: string;
  signatureId: string;
  dataUrl: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

export interface DocumentPage {
  id: string;
  originalImage: string; // base64 or url
  enhancedImage: string; // base64
  thumbnailImage: string;
  filter: FilterType;
  adjustments: ImageAdjustments;
  rotation: number; // 0, 90, 180, 270
  cropPoints?: QuadCropPoints;
  ocrText?: string;
  ocrConfidence?: number;
  annotations?: AnnotationItem[];
  signatures?: SignatureStamp[];
  pageNumber: number;
}

export type MainTab = 'home' | 'library' | 'pdf_tools' | 'settings';

export type SortOption = 'date_desc' | 'date_asc' | 'name_asc' | 'name_desc' | 'size_desc' | 'size_asc';

export interface PDFMetadata {
  title: string;
  author?: string;
  subject?: string;
  keywords?: string;
  creationDate?: string;
  password?: string;
  isPasswordProtected?: boolean;
}

export interface DocumentItem {
  id: string;
  title: string;
  createdAt: string;
  modifiedAt: string;
  pages: DocumentPage[];
  thumbnail: string;
  folderId?: string;
  folderName?: string;
  isFavorite: boolean;
  isDeleted: boolean;
  deletedAt?: string;
  fileSize: number; // in bytes
  docType: ScanMode;
  metadata: PDFMetadata;
  ocrFullText: string;
  tags?: string[];
}

export interface FolderItem {
  id: string;
  name: string;
  color: string;
  icon: string;
  createdAt: string;
  documentCount?: number;
}

export interface SignatureSaved {
  id: string;
  title: string;
  dataUrl: string;
  createdAt: string;
}

export type AppScreen =
  | 'splash'
  | 'onboarding'
  | 'home'
  | 'scanner_camera'
  | 'scan_preview'
  | 'multi_page_editor'
  | 'image_enhancement'
  | 'crop'
  | 'ocr_view'
  | 'document_viewer'
  | 'pdf_viewer'
  | 'pdf_tools'
  | 'merge_pdf'
  | 'split_pdf'
  | 'compress_pdf'
  | 'signature_studio'
  | 'annotation_canvas'
  | 'document_library'
  | 'folder_view'
  | 'smart_search'
  | 'recently_deleted'
  | 'favorites'
  | 'paywall'
  | 'subscription_management'
  | 'settings'
  | 'security_lock'
  | 'about'
  | 'privacy_policy'
  | 'terms_of_service'
  | 'air_print'
  | 'swift_code_inspector';

export type SupportedLanguage = 'en' | 'bn' | 'it';

export type AppSettings = UserSettings;

export interface UserSettings {
  isPro: boolean;
  subscriptionPlan?: 'monthly' | 'yearly' | 'lifetime';
  subscriptionExpiry?: string;
  autoCapture: boolean;
  autoEnhance: boolean;
  defaultFilter: FilterType;
  defaultPageSize: PageSize;
  defaultQuality: PDFQuality;
  quality?: PDFQuality;
  ocrLanguage: string;
  appLanguage: SupportedLanguage;
  language?: SupportedLanguage;
  biometricLockEnabled: boolean;
  securityLock?: boolean;
  faceIdEnabled?: boolean;
  passcode: string | null;
  iCloudSyncEnabled: boolean;
  theme: 'system' | 'light' | 'dark';
  hapticsEnabled: boolean;
}
