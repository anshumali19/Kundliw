package org.kanadjyotish.app

import android.annotation.SuppressLint
import android.content.ActivityNotFoundException
import android.content.Intent
import android.net.ConnectivityManager
import android.net.Uri
import android.os.Bundle
import android.view.View
import android.webkit.WebChromeClient
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView
import androidx.activity.OnBackPressedCallback
import androidx.appcompat.app.AppCompatActivity
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout

/**
 * Opens the Kanad Jyotish Kendra website inside the app. Calls, WhatsApp and
 * links to other apps open outside the WebView. The site is told it runs in an
 * app (user agent suffix "KanadApp") so it can adapt, for example by hiding
 * Google sign-in, which Google does not allow inside a WebView.
 */
class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private lateinit var refresh: SwipeRefreshLayout
    private lateinit var offlineView: LinearLayout

    private val siteHost: String = Uri.parse(BuildConfig.SITE_URL).host.orEmpty()

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        webView = findViewById(R.id.webview)
        refresh = findViewById(R.id.refresh)
        offlineView = findViewById(R.id.offline)
        findViewById<Button>(R.id.retry).setOnClickListener { load() }

        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            cacheMode = WebSettings.LOAD_DEFAULT
            mediaPlaybackRequiresUserGesture = true
            userAgentString = "$userAgentString KanadApp/${BuildConfig.VERSION_NAME}"
        }

        webView.webChromeClient = WebChromeClient()
        webView.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
                val uri = request.url
                val internal = (uri.scheme == "https" || uri.scheme == "http") && uri.host == siteHost
                if (internal) return false
                return openExternally(uri)
            }

            override fun onPageFinished(view: WebView, url: String) {
                refresh.isRefreshing = false
            }

            override fun onReceivedError(view: WebView, request: WebResourceRequest, error: WebResourceError) {
                if (request.isForMainFrame) showOffline(true)
            }
        }

        refresh.setOnRefreshListener { webView.reload() }

        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (webView.canGoBack()) webView.goBack() else finish()
            }
        })

        if (savedInstanceState == null) load() else webView.restoreState(savedInstanceState)
    }

    private fun load() {
        showOffline(!isOnline())
        if (isOnline()) webView.loadUrl(BuildConfig.SITE_URL)
    }

    private fun showOffline(offline: Boolean) {
        offlineView.visibility = if (offline) View.VISIBLE else View.GONE
        refresh.visibility = if (offline) View.GONE else View.VISIBLE
        if (!offline) refresh.isRefreshing = false
    }

    @Suppress("DEPRECATION")
    private fun isOnline(): Boolean {
        val cm = getSystemService(CONNECTIVITY_SERVICE) as ConnectivityManager
        return cm.activeNetworkInfo?.isConnected == true
    }

    private fun openExternally(uri: Uri): Boolean {
        return try {
            startActivity(Intent(Intent.ACTION_VIEW, uri))
            true
        } catch (e: ActivityNotFoundException) {
            true
        }
    }

    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        webView.saveState(outState)
    }

    override fun onDestroy() {
        webView.destroy()
        super.onDestroy()
    }
}
