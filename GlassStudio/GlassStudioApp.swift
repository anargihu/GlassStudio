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

        if let url = Bundle.main.url(
            forResource: "index",
            withExtension: "html",
            subdirectory: "Website"
        ) {
            webView.loadFileURL(
                url,
                allowingReadAccessTo: Bundle.main.bundleURL
            )
        } else {
            webView.loadHTMLString(
                "<h1>Website/index.html not found</h1>",
                baseURL: nil
            )
        }

        return webView
    }

    func updateUIView(_ webView: WKWebView, context: Context) {}
}