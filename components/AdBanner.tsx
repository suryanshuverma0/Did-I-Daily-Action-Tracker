import { useState } from 'react';
import { View } from 'react-native';

import { usePalette } from '@/constants/theme';
import { adsLib, BANNER_UNIT_ID, useAdsState } from '@/lib/ads';

/** Anchored adaptive banner. Takes no space until consent allows ads and an ad has loaded. */
export function AdBanner() {
  const { canRequestAds } = useAdsState();
  const [failed, setFailed] = useState(false);
  const p = usePalette();

  // adsLib is null in Expo Go; canRequestAds is false until consent + SDK init succeed.
  if (!adsLib || !canRequestAds || failed) return null;
  const { BannerAd, BannerAdSize } = adsLib;

  return (
    <View style={{ alignItems: 'center', backgroundColor: p.bg }}>
      <BannerAd
        unitId={BANNER_UNIT_ID}
        size={BannerAdSize.LARGE_ANCHORED_ADAPTIVE_BANNER}
        onAdFailedToLoad={() => setFailed(true)}
      />
    </View>
  );
}
