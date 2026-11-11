import { MaterialCommunityIcons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import React from 'react';
import { Alert, Linking, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AdBanner } from '@/components/AdBanner';
import {
  ANDROID_PACKAGE,
  APP_NAME,
  PLAY_STORE_URL,
  PRIVACY_POLICY_URL,
  SUPPORT_EMAIL,
} from '@/constants/config';
import { Radius, usePalette } from '@/constants/theme';
import { openAdPrivacyOptions, useAdsState } from '@/lib/ads';
import { useStore } from '@/lib/store';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];
const KEEP_OPTIONS = [7, 30, 90, 365];

function Row({
  icon,
  label,
  onPress,
  danger,
  last,
}: {
  icon: IconName;
  label: string;
  onPress: () => void;
  danger?: boolean;
  last?: boolean;
}) {
  const p = usePalette();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.row,
        { borderBottomColor: p.border, borderBottomWidth: last ? 0 : StyleSheet.hairlineWidth },
        pressed && { backgroundColor: p.surfaceAlt },
      ]}
    >
      <MaterialCommunityIcons name={icon} size={22} color={danger ? p.danger : p.primary} />
      <Text style={[styles.rowLabel, { color: danger ? p.danger : p.text }]}>{label}</Text>
      {!danger && <MaterialCommunityIcons name="chevron-right" size={22} color={p.textMuted} />}
    </Pressable>
  );
}

export default function SettingsScreen() {
  const p = usePalette();
  const { settings, setKeepDays, clearHistory, logs } = useStore();
  const { privacyOptionsRequired } = useAdsState();
  const version = Constants.expoConfig?.version ?? '1.0.0';

  const rate = () =>
    Linking.openURL(`market://details?id=${ANDROID_PACKAGE}`).catch(() => Linking.openURL(PLAY_STORE_URL));

  const share = () =>
    Share.share({
      message: `Always wondering "did I lock the door?" ${APP_NAME} answers it: tap once, check anytime. ${PLAY_STORE_URL}`,
    }).catch(() => {});

  const feedback = () =>
    Linking.openURL(
      `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(`${APP_NAME} feedback (v${version})`)}`,
    ).catch(() => Alert.alert('No email app found', `Write to us at ${SUPPORT_EMAIL}`));

  const confirmClear = () =>
    Alert.alert('Clear all history?', `This deletes ${logs.length} entries. Your checks stay.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: clearHistory },
    ]);

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: p.bg }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: p.text }]}>Settings</Text>

        <Text style={[styles.section, { color: p.textMuted }]}>Keep history for</Text>
        <View style={[styles.segment, { backgroundColor: p.surface, borderColor: p.border }]}>
          {KEEP_OPTIONS.map((d) => {
            const active = settings.keepDays === d;
            return (
              <Pressable
                key={d}
                onPress={() => setKeepDays(d)}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                style={[styles.segmentItem, active && { backgroundColor: p.primary }]}
              >
                <Text style={[styles.segmentText, { color: active ? p.onPrimary : p.text }]}>
                  {d === 365 ? '1 year' : `${d} days`}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={[styles.card, { backgroundColor: p.surface, borderColor: p.border, marginTop: 12 }]}>
          <Row icon="trash-can-outline" label="Clear all history" onPress={confirmClear} danger last />
        </View>

        <Text style={[styles.section, { color: p.textMuted }]}>Support</Text>
        <View style={[styles.card, { backgroundColor: p.surface, borderColor: p.border }]}>
          <Row icon="star-outline" label="Rate us on Google Play" onPress={rate} />
          <Row icon="share-variant-outline" label="Share with a friend" onPress={share} />
          <Row icon="email-outline" label="Send feedback" onPress={feedback} last />
        </View>

        <Text style={[styles.section, { color: p.textMuted }]}>Privacy</Text>
        <View style={[styles.card, { backgroundColor: p.surface, borderColor: p.border }]}>
          <Row
            icon="file-document-outline"
            label="Privacy policy"
            onPress={() => Linking.openURL(PRIVACY_POLICY_URL)}
            last={!privacyOptionsRequired}
          />
          {privacyOptionsRequired && (
            <Row icon="shield-lock-outline" label="Ad privacy choices" onPress={openAdPrivacyOptions} last />
          )}
        </View>

        <Text style={[styles.note, { color: p.textMuted }]}>
          Your checks and history are stored only on this phone. No account, no cloud.
        </Text>
        <Text style={[styles.note, { color: p.textMuted }]}>
          {APP_NAME} v{version}
        </Text>
      </ScrollView>
      <AdBanner />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingHorizontal: 18, paddingBottom: 32 },
  title: { fontSize: 34, fontWeight: '800', letterSpacing: -0.5, paddingTop: 16 },
  section: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: 26,
    marginBottom: 8,
  },
  card: { borderRadius: Radius.md, borderWidth: 1, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 15, gap: 14 },
  rowLabel: { flex: 1, fontSize: 16, fontWeight: '500' },
  segment: { flexDirection: 'row', borderRadius: Radius.md, borderWidth: 1, padding: 4 },
  segmentItem: { flex: 1, paddingVertical: 10, borderRadius: Radius.sm, alignItems: 'center' },
  segmentText: { fontSize: 14, fontWeight: '600' },
  note: { textAlign: 'center', fontSize: 13, marginTop: 20, lineHeight: 19 },
});
