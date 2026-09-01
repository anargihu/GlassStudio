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

        if let url = Bundle.main.url(forResource: "index", withExtension: "html") {
            webView.loadFileURL(url, allowingReadAccessTo: Bundle.main.resourceURL!)
        }

        return webView
    }

    func updateUIView(_ webView: WKWebView, context: Context) {}
}