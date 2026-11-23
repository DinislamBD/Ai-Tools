# DocuScan AI (Open-Source Web Prototype)

A **React + TypeScript** document-scanning and PDF workflow prototype, with a separate set of **Swift / SwiftUI reference examples** in `ios/`.

> **Important status:** This is a work-in-progress. It is not a released iOS application, an encrypted document vault, or a production-ready substitute for secure document software. Some UI flows and sample documents are demonstrations. Please do **not** store sensitive identity documents or confidential records in this prototype.

## Working and in-progress features

- **Camera capture:** Browser `getUserMedia` is used when supported and authorized. A clearly labeled synthetic camera feed is displayed as fallback; its contents are not live camera scans.
- **Import:** Import image files through the web UI. Direct import of existing PDF files is **not supported** in this prototype.
- **OCR:** Uses [Tesseract.js](https://github.com/naptha/tesseract.js) in a browser Web Worker to recognize text from images. Supported language choices: English, Bengali, Italian, Spanish, French, German, Arabic, and Hindi. Recognition accuracy varies. Previously saved text is displayed as saved text, not presented as a new OCR result.
- **PDF:** Build image-based PDFs, watermark exported pages, and merge, split, or compress **app document objects**. Importing and editing arbitrary PDFs is not yet implemented.
- **Editor:** Image filters, manual perspective crop, rotation, annotations, and simple signature overlays are present; verify results before relying on them.
- **Library:** Local browser-based collection with synthetic sample documents.

### Security and privacy limitations

**Document data is stored in browser localStorage, not encrypted.** Browser storage may be shared with anyone who can use that browser profile. The demo does not provide reliable Face ID, hardware biometrics, a cryptographically secure vault, or purchase verification. Those simulated flows have been disabled or explicitly labeled.

Tesseract.js processes OCR images locally in the browser but downloads the WebAssembly engine and language models from third-party content delivery infrastructure on first use. Avoid importing private documents into an untrusted deployment. The project has not undergone a professional security audit.

Native Swift examples under `ios/` are illustrative source code, **not an integrated, built or App Store-released iOS application**.

## Run locally

Requirements: **Node.js 22.12+** (or a compatible newer Node.js release) and npm.

```bash
git clone https://github.com/DinislamBD/Ai-Tools.git
cd Ai-Tools
npm install
npm run dev
```

Open the local URL displayed by Vite.

### Checks

```bash
npm run lint   # TypeScript checks
npm test       # Unit tests
npm run build  # Production web build
npm run clean  # Remove generated outputs
```

GitHub Actions also runs checks on pull requests. Checks or features must not be claimed to pass until their results are verified.

## Project layout

- `src/App.tsx`: primary UI flow
- `src/components/`: web UI screens
- `src/services/`: image, OCR, PDF, and browser storage services
- `ios/`: separate native reference code
- `tests/`: unit tests
- `.github/workflows/`: automated checks

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md), [SECURITY.md](SECURITY.md), and the issue templates. New contributors are welcome. Please file a focused issue and do not attach private scans, API keys or identification documents.

See [OPEN_SOURCE_ROADMAP.md](OPEN_SOURCE_ROADMAP.md) for current limitations and priorities.

## License

MIT. See [LICENSE](LICENSE).
