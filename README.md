# Rest Easy: Did I Lock It?

Stop second-guessing. Tap once when you lock the door, turn off the stove or take your pill, and check any time later: *"Today at 8:42 AM · 2 h ago"*.

Free, offline, no account. Monetized with Google AdMob (an anchored banner plus a frequency-capped interstitial).

## Features
- One-tap logging with haptics and **Undo**
- Each card shows when you last did it ("Today at 9:41 PM · 12 min ago")
- Optional **daily reminder** per check (local notifications)
- History grouped by day, with filters; hold an entry to delete it
- Custom checks: 20 icons, 8 colours, quick suggestions
- History retention: 7 / 30 / 90 / 365 days
- Light and dark mode
- Google UMP consent (GDPR) with an "Ad privacy choices" entry in Settings

## Tech
Expo SDK 58 (React Native 0.88, Android API 36) · Expo Router · TypeScript · AsyncStorage · expo-notifications · react-native-google-mobile-ads

```
app/
  _layout.tsx            root: providers, splash, ads init
  (tabs)/index.tsx       Today screen
  (tabs)/history.tsx     History
  (tabs)/settings.tsx    Settings
  action-editor.tsx      add/edit a check (modal)
components/              ActionCard, AdBanner, HapticTab
constants/config.ts      ← AdMob unit IDs, URLs, ad frequency
constants/theme.ts       colours, icons
lib/                     store (data), ads, notifications, time utils
site/                    privacy policy + app-ads.txt for GitHub Pages
store-assets/            Play icon 512 + feature graphic
```

## Develop
`npx expo start` + **Expo Go** works for UI work (ads are skipped automatically there). To test ads, use a development build:

```bash
npm install
eas build -p android --profile development   # once, then install the APK
npx expo start --dev-client
```

Checks: `npm run typecheck` · `npm run lint`

## Release
See **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** for the full walkthrough and **[STORE_LISTING.md](STORE_LISTING.md)** for store text.

```bash
npm run build:apk   # test APK
npm run build:aab   # Play Store bundle
```
