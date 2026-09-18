# DocuScan AI — iOS Document Scanner & PDF Utility

An iOS 17+ document scanner, OCR engine, and PDF utility web application built with **React 19, TypeScript, Tailwind CSS v4, and Lucide Icons**. Includes complete native **Swift / SwiftUI** implementations using Apple VisionKit, CoreImage, Vision OCR, PDFKit, and StoreKit 2.

![DocuScan AI Preview](public/icon-512.png)

---

## 📱 Features

- **Live Camera Scanner & Document Detection**:
  - Real-time quadrilateral boundary detection with animated HUD overlays.
  - Multi-scan modes: Documents, Receipts, ID Cards, Passports, Business Cards, Books, and Whiteboards.
  - Auto-capture upon camera stability with manual shutter fallback and flash controls (Auto/On/Off/Torch).

- **Perspective Warp & 4-Corner Cropping**:
  - Interactive touch/drag corner handles with magnification loupe for sub-pixel precision.
  - 90° rotation and auto-perspective rectification.

- **CoreImage Filter Engine**:
  - 8 document enhancement presets: *Magic Color, Document, B&W, Grayscale, Enhanced, Auto, Low-Light, Original*.
  - Manual sliders for brightness, contrast, saturation, sharpness, and exposure.

- **Vision OCR (Optical Character Recognition)**:
  - Multi-language text recognition (English, Bengali, Italian, Spanish, French, German, and more).
  - Searchable text with query highlighting, one-tap clipboard copy, and `.txt` export.

- **Professional PDF Tools**:
  - **PDF Compiler**: Export multi-page documents to PDF with custom page formats (A4, US Letter, Legal).
  - **Merge PDFs**: Combine multiple documents into a single document.
  - **Split PDF**: Divide multi-page documents at selected break points.
  - **Compress PDF**: Optimize file size with quality toggles (Standard 150 DPI, Print 300 DPI, Compressed 72 DPI).
  - **Security**: Password protection and custom text watermarking.

- **Digital Signature Studio & Markup**:
  - Finger and stylus signature capture pad with stroke smoothing and saved signature vault.
  - Markup canvas with drawing tools (pen, highlighter, eraser, undo/redo).

- **Vault & Security**:
  - Biometric Face ID simulation with 4-digit passcode lock.
  - Folder categorization, tag searching, batch export, and AirPrint support.
  - StoreKit 2 subscription paywall architecture (Monthly, Annual, Lifetime).

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18 or higher recommended)
- [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/) or [bun](https://bun.sh/)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/docuscan-ai.git
   cd docuscan-ai
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open in your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000).

---

## 🛠️ Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Runs the development server at `http://localhost:3000` with hot-reload. |
| `npm run build` | Compiles the production build into the `dist/` directory. |
| `npm run preview` | Locally previews the production build. |
| `npm run lint` | Type-checks code with `tsc --noEmit`. |
| `npm run clean` | Cleans temporary build artifacts. |

---

## 📂 Project Structure

```text
├── ios/                       # Native iOS Swift / SwiftUI reference implementation
│   ├── ScannerView.swift      # VisionKit VNDocumentCameraViewController representable
│   ├── CoreImagePipeline.swift# CoreImage CIFilter pipeline (Magic Color & binarization)
│   ├── OCRManager.swift       # Apple Vision framework VNRecognizeTextRequest
│   ├── PDFKitEngine.swift     # PDFKit document compilation & encryption
│   └── StoreKitManager.swift  # StoreKit 2 in-app purchases & entitlements
├── public/                    # Static assets, PWA manifest, and app icons
├── src/
│   ├── components/
│   │   ├── common/            # iPhone bezel container, iOS TabBar, headers
│   │   ├── modals/            # Swift code inspector modal, folder dialogs
│   │   └── screens/           # Camera, Crop, Filters, OCR, PDF Tools, Paywall, etc.
│   ├── services/              # Storage, OCR engine, PDF generators, Haptics
│   ├── types.ts               # Shared TypeScript types and interfaces
│   ├── App.tsx                # Main state controller and navigation router
│   ├── main.tsx               # React DOM entry point
│   └── index.css              # Tailwind CSS v4 styling rules
├── metadata.json              # App manifest & permissions
├── package.json               # Dependencies and scripts
└── vite.config.ts             # Vite build configuration
```

---

## 🍏 Native iOS (Swift / SwiftUI) Code

The repository includes production-ready Swift source files in the [`ios/`](./ios/) folder:
- **`ScannerView.swift`**: SwiftUI wrapper for Apple's `VNDocumentCameraViewController`.
- **`CoreImagePipeline.swift`**: Native GPU-accelerated document contrast & unsharp masking.
- **`OCRManager.swift`**: On-device text recognition with `VNRecognizeTextRequest`.
- **`PDFKitEngine.swift`**: 256-bit AES encrypted PDF document builder.
- **`StoreKitManager.swift`**: StoreKit 2 transaction observer and entitlement manager.

You can inspect and copy these directly inside the app by clicking the **"Swift Code"** button in the top navigation bar.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
