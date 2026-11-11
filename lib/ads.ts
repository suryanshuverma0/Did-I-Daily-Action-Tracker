import { useSyncExternalStore } from 'react';
import { TurboModuleRegistry } from 'react-native';
import type { InterstitialAd } from 'react-native-google-mobile-ads';

import { ADMOB_UNITS, INTERSTITIAL_LAUNCH_GRACE_MS, INTERSTITIAL_MIN_INTERVAL_MS } from '@/constants/config';

type AdsLib = typeof import('react-native-google-mobile-ads');

/**
 * The AdMob SDK only exists in real builds (EAS / dev client), not in Expo Go.
 * Load it only when its native module is present, so the app still runs in Expo Go (just without ads).
 */
export const adsLib: AdsLib | null = TurboModuleRegistry.get('RNGoogleMobileAdsModule')
  ? // eslint-disable-next-line @typescript-eslint/no-require-imports
    (require('react-native-google-mobile-ads') as AdsLib)
  : null;

if (!adsLib && __DEV__) {
  console.log('[ads] AdMob native module not found (Expo Go?) – ads are disabled in this session.');
}

/** Uses Google's test ads in development or while the real ID is still a placeholder. */
const pick = (real: string, test: string) => (__DEV__ || real.includes('xxxx') ? test : real);

export const BANNER_UNIT_ID = adsLib ? pick(ADMOB_UNITS.banner, adsLib.TestIds.ADAPTIVE_BANNER) : '';
const INTERSTITIAL_UNIT_ID = adsLib ? pick(ADMOB_UNITS.interstitial, adsLib.TestIds.INTERSTITIAL) : '';

// ---- tiny observable state so screens re-render when ads become available ----
type AdsState = { canRequestAds: boolean; privacyOptionsRequired: boolean };
let state: AdsState = { canRequestAds: false, privacyOptionsRequired: false };
const listeners = new Set<() => void>();
const setState = (next: Partial<AdsState>) => {
  state = { ...state, ...next };
  listeners.forEach((l) => l());
};
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
export const useAdsState = () => useSyncExternalStore(subscribe, () => state);

// ---- consent + init ----
let started = false;
const launchedAt = Date.now();

/** Shows Google's consent form when required (EEA/UK/etc.), then starts the SDK. Safe to call once at launch. */
export async function initAds() {
  if (started || !adsLib) return;
  started = true;
  const { AdsConsent, AdsConsentPrivacyOptionsRequirementStatus, MaxAdContentRating, default: mobileAds } = adsLib;
  try {
    await AdsConsent.gatherConsent();
  } catch (e) {
    // Network errors etc. — fall through; we may still be able to use a previous consent.
    console.warn('Consent error', e);
  }
  try {
    const info = await AdsConsent.getConsentInfo();
    setState({
      privacyOptionsRequired:
        info.privacyOptionsRequirementStatus === AdsConsentPrivacyOptionsRequirementStatus.REQUIRED,
    });
    if (!info.canRequestAds) return;
    await mobileAds().setRequestConfiguration({ maxAdContentRating: MaxAdContentRating.PG });
    await mobileAds().initialize();
    setState({ canRequestAds: true });
    loadInterstitial();
  } catch (e) {
    console.warn('Ads init error', e);
  }
}

/** Re-opens Google's privacy options form (required in Settings for EEA users). */
export async function openAdPrivacyOptions() {
  if (!adsLib) return;
  const { AdsConsent, default: mobileAds } = adsLib;
  try {
    await AdsConsent.showPrivacyOptionsForm();
    const info = await AdsConsent.getConsentInfo();
    if (!info.canRequestAds) {
      setState({ canRequestAds: false });
    } else if (!state.canRequestAds) {
      await mobileAds().initialize();
      setState({ canRequestAds: true });
      loadInterstitial();
    }
  } catch (e) {
    console.warn('Privacy options error', e);
  }
}

// ---- interstitial (frequency capped) ----
let interstitial: InterstitialAd | null = null;
let interstitialLoaded = false;
let lastShownAt = 0;

function loadInterstitial() {
  if (!adsLib || !state.canRequestAds) return;
  const { InterstitialAd, AdEventType } = adsLib;
  if (!interstitial) {
    interstitial = InterstitialAd.createForAdRequest(INTERSTITIAL_UNIT_ID);
    interstitial.addAdEventListener(AdEventType.LOADED, () => {
      interstitialLoaded = true;
    });
    interstitial.addAdEventListener(AdEventType.CLOSED, () => {
      interstitialLoaded = false;
      interstitial?.load();
    });
    interstitial.addAdEventListener(AdEventType.ERROR, () => {
      interstitialLoaded = false;
      // retry later, quietly
      setTimeout(() => interstitial?.load(), 60_000);
    });
  }
  interstitial.load();
}

/**
 * Call at natural break points (after saving an action, when opening History).
 * Only shows if an ad is ready, the launch grace period has passed and the cap allows it.
 */
export function maybeShowInterstitial() {
  const now = Date.now();
  if (!state.canRequestAds || !interstitial || !interstitialLoaded) return;
  if (now - launchedAt < INTERSTITIAL_LAUNCH_GRACE_MS) return;
  if (now - lastShownAt < INTERSTITIAL_MIN_INTERVAL_MS) return;
  lastShownAt = now;
  interstitialLoaded = false;
  interstitial.show().catch(() => {});
}
