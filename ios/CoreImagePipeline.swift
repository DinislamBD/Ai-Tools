import CoreImage
import CoreImage.CIFilterBuiltins
import UIKit

/// CoreImage pipeline for document enhancement, Magic Color, and binarization
final class ImageEnhancementService {
    static let shared = ImageEnhancementService()
    private let context = CIContext(options: [.useSoftwareRenderer: false])
    
    func applyMagicColor(to inputImage: UIImage) -> UIImage? {
        guard let ciImage = CIImage(image: inputImage) else { return nil }
        
        // 1. Perspective Transform / Auto White Balance & Color Tuning
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
}
