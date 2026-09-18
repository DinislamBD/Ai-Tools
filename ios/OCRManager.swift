import Vision
import UIKit

/// Apple Vision framework text recognition engine
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
        self.recognizedText = textResults.joined(separator: "\n")
        self.confidence = observations.compactMap { $0.topCandidates(1).first?.confidence }.reduce(0.0, +) / Float(max(1, observations.count))
    }
}
