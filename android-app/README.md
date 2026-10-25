# Android app: Maharshi Kanad Jyotish Kendra

A thin Android app that opens the live website in a WebView. It adds pull to refresh,
an offline screen, Back button handling, and opens calls, WhatsApp and external links
in the right apps. All content and features come from the website, so every admin
change appears in the app at once.

The site address is set in `app/build.gradle.kts` (`SITE_URL`).

## Build the app (needs Android Studio)

1. Install Android Studio (free): https://developer.android.com/studio
2. Open this `android-app` folder in Android Studio and let it sync.
3. Test: connect a phone or start an emulator and press Run.
4. Release build for the Play Store: Build > Generate Signed Bundle / APK > Android App Bundle.
   Create a keystore when asked and keep it and its password safe. Without it the app
   can never be updated on the Play Store.

## Publish on Google Play

1. The client creates a Google Play Console developer account (one-time $25).
2. Create the app and upload the signed `.aab` file.
3. Fill in the store listing, privacy policy link (the site has /legal/privacy) and content rating.
4. Submit for review. Google's review can take several days.
5. When the app is live, paste its Play Store link in Admin > Settings > Android App Download.
   The website then shows a download page (/app) with the link and a QR code.

## Notes

- Google sign-in is not allowed inside a WebView, so the website hides it in the app.
  App users sign in with a mobile OTP (or Facebook if enabled on the site).
- The website also installs as a web app (PWA) from the browser menu.
- This project was not compiled in the build environment where it was written.
  Open it in Android Studio and fix any version prompts it shows before releasing.
