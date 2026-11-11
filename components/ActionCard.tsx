import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import { Radius, usePalette } from '@/constants/theme';
import type { Action, Log } from '@/lib/store';
import { formatAgo, formatClock, formatDayLabel, isToday } from '@/lib/time';

type Props = {
  action: Action;
  last?: Log;
  now: number;
  onPress: () => void;
  onLongPress: () => void;
};

export function ActionCard({ action, last, now, onPress, onLongPress }: Props) {
  const p = usePalette();
  const [scale] = useState(() => new Animated.Value(1));
  const doneToday = !!last && isToday(last.at, now);

  const pressIn = () => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 50 }).start();
  const pressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 8 }).start();

  let status: string;
  if (!last) status = 'Not logged yet';
  else if (doneToday) status = `Today at ${formatClock(last.at)} · ${formatAgo(last.at, now)}`;
  else status = `Last: ${formatDayLabel(last.at, now)}, ${formatClock(last.at)}`;

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={onPress}
        onLongPress={onLongPress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        delayLongPress={400}
        accessibilityRole="button"
        accessibilityLabel={`${action.title}. ${status}. Tap to log now, hold to edit.`}
        style={[
          styles.card,
          {
            backgroundColor: p.surface,
            borderColor: doneToday ? p.success : p.border,
          },
        ]}
      >
        <View style={[styles.iconWrap, { backgroundColor: action.color }]}>
          <MaterialCommunityIcons name={action.icon} size={26} color="#fff" />
        </View>
        <View style={styles.body}>
          <Text style={[styles.title, { color: p.text }]} numberOfLines={1}>
            {action.title}
          </Text>
          <View style={styles.statusRow}>
            {action.reminder.enabled && (
              <MaterialCommunityIcons
                name="bell-outline"
                size={13}
                color={p.textMuted}
                style={{ marginRight: 4 }}
              />
            )}
            <Text style={[styles.status, { color: doneToday ? p.success : p.textMuted }]} numberOfLines={1}>
              {status}
            </Text>
          </View>
        </View>
        <View
          style={[
            styles.check,
            doneToday
              ? { backgroundColor: p.success, borderColor: p.success }
              : { backgroundColor: 'transparent', borderColor: p.border },
          ]}
        >
          <MaterialCommunityIcons name="check" size={20} color={doneToday ? '#fff' : p.textMuted} />
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    marginBottom: 12,
  },
  iconWrap: {
    width: 50,
    height: 50,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, marginHorizontal: 14 },
  title: { fontSize: 17, fontWeight: '700' },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  status: { fontSize: 13.5, fontWeight: '500', flexShrink: 1 },
  check: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
