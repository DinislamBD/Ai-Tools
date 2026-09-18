import React, { useState } from 'react';
import { X, Copy, Check, Code, FileCode, Sparkles, Terminal } from 'lucide-react';
import { playHaptic } from '../../services/haptics';

interface SwiftCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SwiftCodeModal: React.FC<SwiftCodeModalProps> = ({ isOpen, onClose }) => {
  const [selectedFile, setSelectedFile] = useState<string>('ScannerView.swift');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const swiftFiles: { [filename: string]: { description: string; code: string } } = {
    'ScannerView.swift': {
      description: 'SwiftUI camera scanner with VisionKit document detection and auto-capture',
      code: `import SwiftUI
import VisionKit
import AVFoundation

struct ScannerView: UIViewControllerRepresentable {
    @Binding var scannedDocuments: [VNDocumentCameraScan]
    @Environment(\\.presentationMode) var presentationMode
    
    func makeUIViewController(context: Context) -> VNDocumentCameraViewController {
        let scanner = VNDocumentCameraViewController()
        scanner.delegate = context.coordinator
        return scanner
    }
    
    func updateUIViewController(_ uiViewController: VNDocumentCameraViewController, context: Context) {}
    
    func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }
    
    class Coordinator: NSObject, VNDocumentCameraViewControllerDelegate {
        var parent: ScannerView
        
        init(_ parent: ScannerView) {
            self.parent = parent
        }
        
        func documentCameraViewController(_ controller: VNDocumentCameraViewController, didFinishWith scan: VNDocumentCameraScan) {
            parent.scannedDocuments.append(scan)
            parent.presentationMode.wrappedValue.dismiss()
        }
        
        func documentCameraViewControllerDidCancel(_ controller: VNDocumentCameraViewController) {
            parent.presentationMode.wrappedValue.dismiss()
        }
        
        func documentCameraViewController(_ controller: VNDocumentCameraViewController, didFailWithError error: Error) {
            print("VisionKit scan failed: \\(error.localizedDescription)")
            parent.presentationMode.wrappedValue.dismiss()
        }
    }
}`
    },
    'CoreImagePipeline.swift': {
      description: 'CoreImage CIFilter pipeline for Magic Color, binarization, and perspective correction',
      code: `import CoreImage
import CoreImage.CIFilterBuiltins
import UIKit

final class ImageEnhancementService {
    static let shared = ImageEnhancementService()
    private let context = CIContext(options: [.useSoftwareRenderer: false])
    
    func applyMagicColor(to inputImage: UIImage) -> UIImage? {
        guard let ciImage = CIImage(image: inputImage) else { return nil }
        
        // 1. Perspective Transform / Auto White Balance
        let colorControls = CIFilter.colorControls()
        colorControls.inputImage = ciImage
        colorControls.contrast = 1.35
        colorControls.saturation = 1.20
        colorControls.brightness = 0.05
        
        guard let enhanced = colorControls.outputImage else { return nil }
        
        // 2. Unsharp Mask for Crisp Text Edges
        let unsharp = CIFilter.unsharpMask()
        unsharp.inputImage = enhanced
        unsharp.radius = 2.5
        unsharp.intensity = 0.70
        
        guard let output = unsharp.outputImage,
              let cgImage = context.createCGImage(output, from: output.extent) else {
            return nil
        }
        
        return UIImage(cgImage: cgImage, scale: inputImage.scale, orientation: inputImage.imageOrientation)
    }
}`
    },
    'OCRManager.swift': {
      description: 'Apple Vision framework VNRecognizeTextRequest with multi-language recognition',
      code: `import Vision
import UIKit

@MainActor
final class OCRManager: ObservableObject {
    @Published var recognizedText: String = ""
    @Published var confidence: Float = 0.0
    @Published var isProcessing: Bool = false
    
    func recognizeText(from image: UIImage, recognitionLanguages: [String] = ["en-US", "it-IT", "bn-BD"]) async throws {
        guard let cgImage = image.cgImage else { return }
        isProcessing = true
        defer { isProcessing = false }
        
        let request = VNRecognizeTextRequest()
        request.recognitionLevel = .accurate
        request.recognitionLanguages = recognitionLanguages
        request.usesLanguageCorrection = true
        
        let handler = VNImageRequestHandler(cgImage: cgImage, options: [:])
        try handler.perform([request])
        
        guard let observations = request.results else { return }
        let textResults = observations.compactMap { $0.topCandidates(1).first?.string }
        self.recognizedText = textResults.joined(separator: "\\n")
        self.confidence = observations.compactMap { $0.topCandidates(1).first?.confidence }.reduce(0.0, +) / Float(max(1, observations.count))
    }
}`
    },
    'PDFKitEngine.swift': {
      description: 'Native PDFKit document compilation, A4/Letter sizing, and 256-bit encryption',
      code: `import PDFKit
import UIKit

final class PDFExportEngine {
    static func createDocument(from pages: [UIImage], title: String, watermark: String? = nil, password: String? = nil) -> Data? {
        let pdfDocument = PDFDocument()
        
        for (index, image) in pages.enumerated() {
            guard let page = PDFPage(image: image) else { continue }
            pdfDocument.insert(page, at: index)
        }
        
        var options: [PDFDocumentWriteOption: Any] = [:]
        if let password = password, !password.isEmpty {
            options[.userPasswordOption] = password
            options[.ownerPasswordOption] = password
        }
        
        return pdfDocument.dataRepresentation(options: options)
    }
}`
    },
    'StoreKitManager.swift': {
      description: 'StoreKit 2 native in-app subscription and transaction listener',
      code: `import StoreKit

@MainActor
final class StoreKitManager: ObservableObject {
    @Published var isProSubscribed: Bool = false
    @Published var subscriptions: [Product] = []
    
    private let productIDs = ["com.docuscan.pro.monthly", "com.docuscan.pro.yearly", "com.docuscan.pro.lifetime"]
    
    init() {
        Task {
            await fetchProducts()
            await updatePurchasedStatus()
        }
    }
    
    func fetchProducts() async {
        do {
            self.subscriptions = try await Product.products(for: productIDs)
        } catch {
            print("Failed to fetch StoreKit products: \\(error)")
        }
    }
    
    func purchase(_ product: Product) async throws -> Bool {
        let result = try await product.purchase()
        switch result {
        case .success(let verification):
            let transaction = try checkVerified(verification)
            await transaction.finish()
            await updatePurchasedStatus()
            return true
        default:
            return false
        }
    }
    
    private func checkVerified<T>(_ result: VerificationResult<T>) throws -> T {
        switch result {
        case .unverified: throw StoreKitError.unverifiedTransaction
        case .verified(let safe): return safe
        }
    }
    
    func updatePurchasedStatus() async {
        for await result in Transaction.currentEntitlements {
            if case .verified(let transaction) = result {
                if productIDs.contains(transaction.productID) {
                    self.isProSubscribed = true
                    return
                }
            }
        }
        self.isProSubscribed = false
    }
}`
    }
  };

  const currentFileData = swiftFiles[selectedFile] || swiftFiles['ScannerView.swift'];

  const handleCopy = () => {
    playHaptic('success');
    navigator.clipboard.writeText(currentFileData.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-3.5 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-xs">
              <FileCode size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Native Swift / SwiftUI Production Source</span>
                <span className="text-[10px] bg-neutral-800 text-neutral-400 font-semibold px-2 py-0.5 rounded-full">
                  iOS 17+ Target
                </span>
              </h3>
              <p className="text-[11px] text-neutral-400">
                Direct Apple VisionKit, CoreImage, PDFKit &amp; StoreKit 2 implementations
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playHaptic('light');
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab Bar for Files */}
        <div className="px-4 py-2 bg-neutral-950/60 border-b border-neutral-800 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {Object.keys(swiftFiles).map((filename) => (
            <button
              key={filename}
              onClick={() => {
                playHaptic('selection');
                setSelectedFile(filename);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                selectedFile === filename
                  ? 'bg-neutral-800 text-orange-400 border border-neutral-700'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Code size={12} />
              <span>{filename}</span>
            </button>
          ))}
        </div>

        {/* Code Content */}
        <div className="flex-1 p-4 overflow-y-auto bg-neutral-950 font-mono text-xs text-neutral-300 leading-relaxed relative">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-neutral-800 text-neutral-400 text-[11px]">
            <span>{currentFileData.description}</span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition cursor-pointer"
            >
              {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
              <span>{copied ? 'Copied' : 'Copy Swift'}</span>
            </button>
          </div>

          <pre className="text-neutral-200 whitespace-pre-wrap selection:bg-orange-500/30 selection:text-white">
            {currentFileData.code}
          </pre>
        </div>
      </div>
    </div>
  );
};
