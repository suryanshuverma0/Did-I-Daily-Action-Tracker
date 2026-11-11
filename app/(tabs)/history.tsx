import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, SectionList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AdBanner } from '@/components/AdBanner';
import { Radius, usePalette } from '@/constants/theme';
import { useNow } from '@/hooks/use-now';
import { maybeShowInterstitial } from '@/lib/ads';
import { useStore, type Log } from '@/lib/store';
import { formatAgo, formatClock, formatDayLabel, startOfDay } from '@/lib/time';

export default function HistoryScreen() {
  const p = usePalette();
  const { actions, logs, removeLog, settings } = useStore();
  const now = useNow(60_000);
  const [filter, setFilter] = useState<string | null>(null);

  // Natural break point: the user chose to switch screens.
  useFocusEffect(
    useCallback(() => {
      maybeShowInterstitial();
    }, []),
  );

  const actionById = useMemo(() => Object.fromEntries(actions.map((a) => [a.id, a])), [actions]);

  const sections = useMemo(() => {
    const groups = new Map<number, Log[]>();
    const f = filter && actionById[filter] ? filter : null;
    for (const l of logs) {
      if (f && l.actionId !== f) continue;
      if (!actionById[l.actionId]) continue;
      const day = startOfDay(l.at);
      const arr = groups.get(day);
      if (arr) arr.push(l);
      else groups.set(day, [l]);
    }
    return [...groups.entries()].map(([day, data]) => ({ title: formatDayLabel(day, now), data }));
  }, [logs, filter, actionById, now]);

  const confirmDelete = (log: Log) => {
    const a = actionById[log.actionId];
    Alert.alert('Delete this entry?', `${a?.title ?? 'Entry'} · ${formatClock(log.at)}`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => removeLog(log.id) },
    ]);
  };

  const renderChip = (id: string | null, label: string) => {
    const active = (filter && actionById[filter] ? filter : null) === id;
    return (
      <Pressable
        key={id ?? 'all'}
        onPress={() => setFilter(id)}
        style={[
          styles.chip,
          { backgroundColor: active ? p.primary : p.surface, borderColor: active ? p.primary : p.border },
        ]}
      >
        <Text style={[styles.chipText, { color: active ? p.onPrimary : p.text }]} numberOfLines={1}>
          {label}
        </Text>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: p.bg }]} edges={['top']}>
      <Text style={[styles.title, { color: p.text }]}>History</Text>

      {actions.length > 1 && (
        <View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
            {renderChip(null, 'All')}
            {actions.map((a) => renderChip(a.id, a.title))}
          </ScrollView>
        </View>
      )}

      <SectionList
        style={styles.flex}
        sections={sections}
        keyExtractor={(l) => l.id}
        contentContainerStyle={styles.list}
        stickySectionHeadersEnabled={false}
        renderSectionHeader={({ section }) => (
          <Text style={[styles.sectionTitle, { color: p.textMuted }]}>{section.title}</Text>
        )}
        renderItem={({ item }) => {
          const a = actionById[item.actionId]!;
          return (
            <Pressable
              onLongPress={() => confirmDelete(item)}
              style={[styles.row, { backgroundColor: p.surface, borderColor: p.border }]}
              accessibilityHint="Hold to delete"
            >
              <View style={[styles.rowIcon, { backgroundColor: a.color }]}>
                <MaterialCommunityIcons name={a.icon} size={18} color="#fff" />
              </View>
              <Text style={[styles.rowTitle, { color: p.text }]} numberOfLines={1}>
                {a.title}
              </Text>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[styles.rowTime, { color: p.text }]}>{formatClock(item.at)}</Text>
                <Text style={[styles.rowAgo, { color: p.textMuted }]}>{formatAgo(item.at, now)}</Text>
              </View>
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialCommunityIcons name="history" size={44} color={p.textMuted} />
            <Text style={[styles.emptyText, { color: p.textMuted }]}>
              Nothing logged yet.{'\n'}Tap a card on the Today screen to start.
            </Text>
          </View>
        }
        ListFooterComponent={
          sections.length > 0 ? (
            <Text style={[styles.footer, { color: p.textMuted }]}>
              Hold an entry to delete it · History is kept for {settings.keepDays} days
            </Text>
          ) : undefined
        }
      />
      <AdBanner />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  title: { fontSize: 34, fontWeight: '800', letterSpacing: -0.5, paddingHorizontal: 18, paddingTop: 16 },
  chips: { paddingHorizontal: 18, paddingVertical: 14, gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.pill,
    borderWidth: 1,
    maxWidth: 180,
  },
  chipText: { fontSize: 14, fontWeight: '600' },
  list: { paddingHorizontal: 18, paddingBottom: 24 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: 14,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginBottom: 8,
  },
  rowIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  rowTitle: { flex: 1, fontSize: 16, fontWeight: '600', marginHorizontal: 12 },
  rowTime: { fontSize: 15, fontWeight: '700' },
  rowAgo: { fontSize: 12, marginTop: 2 },
  empty: { alignItems: 'center', marginTop: 80, gap: 12 },
  emptyText: { fontSize: 15, textAlign: 'center', lineHeight: 22 },
  footer: { textAlign: 'center', fontSize: 12.5, marginTop: 16 },
});
