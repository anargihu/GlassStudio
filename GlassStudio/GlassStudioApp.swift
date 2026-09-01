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

        if let url = Bundle.main.url(forResource: "index", withExtension: "html", subdirectory: "Website") {
            let accessURL = url.deletingLastPathComponent()
            webView.loadFileURL(url, allowingReadAccessTo: accessURL)
        }

        return webView
    }

    func updateUIView(_ webView: WKWebView, context: Context) {}
}