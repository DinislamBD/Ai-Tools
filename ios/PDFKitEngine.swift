import PDFKit
import UIKit

/// Native PDF compilation, page formatting, and password encryption engine
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
}
