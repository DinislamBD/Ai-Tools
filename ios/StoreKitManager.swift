import StoreKit

/// StoreKit 2 native in-app subscription and transaction manager
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
            print("Failed to fetch StoreKit products: \(error)")
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
}

enum StoreKitError: Error {
    case unverifiedTransaction
}
