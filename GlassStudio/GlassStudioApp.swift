import SwiftUI
import WebKit

@main
struct GlassStudioApp: App {
    var body: some Scene {
        WindowGroup {
            WebView()
        }
    }
}

struct WebView: UIViewRepresentable {
    func makeUIView(context: Context) -> WKWebView {
        let webView = WKWebView()
        if let url = Bundle.main.url(forResource: "index", withExtension: "html", subdirectory: nil) {
            webView.loadFileURL(url, allowingReadAccessTo: Bundle.main)
        }
        return webView
    }

    func updateUIView(_ webView: WKWebView, context: Context) {}
}
