import SwiftUI
import WebKit

@main
struct GlassStudioApp: App {
    var body: some Scene {
        WindowGroup {
            WebView()
                .ignoresSafeArea()
        }
    }
}

struct WebView: UIViewRepresentable {
    func makeUIView(context: Context) -> WKWebView {
        let webView = WKWebView(frame: .zero)

        let websiteURL = Bundle.main.bundleURL
            .appendingPathComponent("Website")
            .appendingPathComponent("index.html")

        webView.loadFileURL(
            websiteURL,
            allowingReadAccessTo: Bundle.main.bundleURL
        )

        return webView
    }

    func updateUIView(_ webView: WKWebView, context: Context) {}
}