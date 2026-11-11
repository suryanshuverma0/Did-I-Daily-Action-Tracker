/**
 * Everything you need to change before publishing lives in this file and in app.json.
 */

export const APP_NAME = 'Yep, Did It';
export const ANDROID_PACKAGE = 'com.suryanshu.yepdidit';
export const PLAY_STORE_URL = `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE}`;

// Hosted for free on GitHub Pages from this repo's /docs folder (see DEPLOYMENT_GUIDE.md, Part 3).
// Don't rename the GitHub repo, or this URL changes and Play will flag a broken privacy policy.
export const DEVELOPER_SITE = 'https://suryanshuverma0.github.io/Did-I-Daily-Action-Tracker';
export const PRIVACY_POLICY_URL = `${DEVELOPER_SITE}/privacy-policy.html`;
export const SUPPORT_EMAIL = 'suryanshuverma42@gmail.com';

/**
 * AdMob ad unit IDs (from https://admob.google.com → Apps → Yep, Did It → Ad units).
 * While these still contain "xxxx", the app automatically uses Google's test ads,
 * so you can never accidentally click your own live ads during development.
 */
export const ADMOB_UNITS = {
  banner: 'ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx',
  interstitial: 'ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx',
};

/** Full-screen ads: at most one every N ms, never in the first N ms after launch. */
export const INTERSTITIAL_MIN_INTERVAL_MS = 3 * 60 * 1000;
export const INTERSTITIAL_LAUNCH_GRACE_MS = 2 * 60 * 1000;
