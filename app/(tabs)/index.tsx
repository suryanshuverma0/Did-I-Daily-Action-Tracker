import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ActionCard } from '@/components/ActionCard';
import { AdBanner } from '@/components/AdBanner';
import { APP_NAME } from '@/constants/config';
import { Radius, usePalette } from '@/constants/theme';
import { useNow } from '@/hooks/use-now';
import { useStore, type Action } from '@/lib/store';
import { formatLongDate, isToday } from '@/lib/time';

type Toast = { logId: string; title: string; visible: boolean };

export default function TodayScreen() {
  const p = usePalette();
  const { actions, lastLog, logAction, removeLog } = useStore();
  const now = useNow();
  const [toast, setToast] = useState<Toast | null>(null);
  const [toastAnim] = useState(() => new Animated.Value(0));
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const doneCount = actions.filter((a) => {
    const l = lastLog[a.id];
    return l && isToday(l.at, now);
  }).length;

  useEffect(() => {
    Animated.spring(toastAnim, { toValue: toast?.visible ? 1 : 0, useNativeDriver: true, speed: 18 }).start();
  }, [toast, toastAnim]);

  useEffect(
    () => () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    },
    [],
  );

  const handleLog = (action: Action) => {
    const log = logAction(action.id);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setToast({ logId: log.id, title: action.title, visible: true });
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setToast((t) => t && { ...t, visible: false }), 4000);
  };

  const handleUndo = () => {
    if (!toast?.visible) return;
    removeLog(toast.logId);
    Haptics.selectionAsync().catch(() => {});
    setToast({ ...toast, visible: false });
  };

  const openEditor = (id?: string) =>
    router.push(id ? { pathname: '/action-editor', params: { id } } : '/action-editor');

  const header = (
    <View style={styles.header}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.date, { color: p.textMuted }]}>{formatLongDate(now)}</Text>
        <Text style={[styles.appTitle, { color: p.text }]}>{APP_NAME}</Text>
        {actions.length > 0 && (
          <Text style={[styles.summary, { color: doneCount === actions.length ? p.success : p.textMuted }]}>
            {doneCount === actions.length
              ? 'All checked today. Yep, you did it!'
              : `${doneCount} of ${actions.length} checked today`}
          </Text>
        )}
      </View>
      <Pressable
        onPress={() => openEditor()}
        accessibilityRole="button"
        accessibilityLabel="Add a check"
        style={({ pressed }) => [styles.addBtn, { backgroundColor: p.primary, opacity: pressed ? 0.85 : 1 }]}
      >
        <MaterialCommunityIcons name="plus" size={26} color={p.onPrimary} />
      </Pressable>
    </View>
  );

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: p.bg }]} edges={['top']}>
      <View style={styles.flex}>
        <FlatList
          data={actions}
          keyExtractor={(a) => a.id}
          contentContainerStyle={styles.list}
          ListHeaderComponent={header}
          renderItem={({ item }) => (
            <ActionCard
              action={item}
              last={lastLog[item.id]}
              now={now}
              onPress={() => handleLog(item)}
              onLongPress={() => openEditor(item.id)}
            />
          )}
          ListEmptyComponent={
            <View style={[styles.empty, { backgroundColor: p.surface, borderColor: p.border }]}>
              <MaterialCommunityIcons name="shield-check-outline" size={48} color={p.primary} />
              <Text style={[styles.emptyTitle, { color: p.text }]}>What do you double-check?</Text>
              <Text style={[styles.emptyText, { color: p.textMuted }]}>
                Add things like locking the door or turning off the stove. Tap once when you do them, and
                never wonder again.
              </Text>
              <Pressable
                onPress={() => openEditor()}
                style={[styles.emptyBtn, { backgroundColor: p.primary }]}
                accessibilityRole="button"
              >
                <Text style={[styles.emptyBtnText, { color: p.onPrimary }]}>Add your first check</Text>
              </Pressable>
            </View>
          }
          ListFooterComponent={
            actions.length > 0 ? (
              <Text style={[styles.hint, { color: p.textMuted }]}>
                Tap a card when you do it · Hold to edit
              </Text>
            ) : undefined
          }
        />

        <Animated.View
          pointerEvents={toast?.visible ? 'auto' : 'none'}
          style={[
            styles.toast,
            {
              backgroundColor: p.isDark ? p.surfaceAlt : '#1D1F2B',
              opacity: toastAnim,
              transform: [
                { translateY: toastAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) },
              ],
            },
          ]}
        >
          <MaterialCommunityIcons name="check-circle" size={20} color="#4ADE80" />
          <Text style={styles.toastText} numberOfLines={1}>
            Logged: {toast?.title}
          </Text>
          <Pressable onPress={handleUndo} hitSlop={12} accessibilityRole="button" accessibilityLabel="Undo">
            <Text style={[styles.undo, { color: p.isDark ? p.primary : '#A5ADFF' }]}>UNDO</Text>
          </Pressable>
        </Animated.View>
      </View>

      <AdBanner />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: { paddingHorizontal: 18, paddingBottom: 90 },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 16, paddingBottom: 20 },
  date: { fontSize: 14, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.6 },
  appTitle: { fontSize: 34, fontWeight: '800', letterSpacing: -0.5, marginTop: 2 },
  summary: { fontSize: 15, fontWeight: '600', marginTop: 4 },
  addBtn: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  hint: { textAlign: 'center', fontSize: 13, marginTop: 8 },
  empty: { alignItems: 'center', padding: 28, borderRadius: Radius.lg, borderWidth: 1 },
  emptyTitle: { fontSize: 19, fontWeight: '700', marginTop: 12 },
  emptyText: { fontSize: 15, textAlign: 'center', lineHeight: 22, marginTop: 8 },
  emptyBtn: { marginTop: 18, paddingHorizontal: 22, paddingVertical: 13, borderRadius: Radius.pill },
  emptyBtnText: { fontSize: 16, fontWeight: '700' },
  toast: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: Radius.md,
    gap: 10,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  toastText: { flex: 1, color: '#fff', fontSize: 15, fontWeight: '600' },
  undo: { fontSize: 14, fontWeight: '800', letterSpacing: 0.5 },
});
