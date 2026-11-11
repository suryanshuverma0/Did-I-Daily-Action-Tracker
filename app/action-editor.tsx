import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ACTION_COLORS, ACTION_ICONS, Radius, usePalette, type ActionIcon } from '@/constants/theme';
import { maybeShowInterstitial } from '@/lib/ads';
import { cancelReminder, ensureNotificationPermission, syncReminder } from '@/lib/notifications';
import { newId, useStore, type Action } from '@/lib/store';
import { formatClockHM } from '@/lib/time';

const SUGGESTIONS: { title: string; icon: ActionIcon }[] = [
  { title: 'Locked the door', icon: 'door-closed-lock' },
  { title: 'Turned off the stove', icon: 'stove' },
  { title: 'Took my medicine', icon: 'pill' },
  { title: 'Fed the pet', icon: 'paw' },
  { title: 'Locked the car', icon: 'car' },
  { title: 'Closed the windows', icon: 'window-closed-variant' },
  { title: 'Unplugged the iron', icon: 'iron-outline' },
  { title: 'Watered the plants', icon: 'sprout-outline' },
];

const MAX_TITLE = 32;

export default function ActionEditor() {
  const p = usePalette();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { actions, saveAction, deleteAction } = useStore();
  const existing = actions.find((a) => a.id === id);

  const [title, setTitle] = useState(existing?.title ?? '');
  const [icon, setIcon] = useState<ActionIcon>(existing?.icon ?? ACTION_ICONS[0]);
  const [color, setColor] = useState(existing?.color ?? ACTION_COLORS[actions.length % ACTION_COLORS.length]);
  const [reminder, setReminder] = useState(existing?.reminder ?? { enabled: false, hour: 22, minute: 0 });
  const [saving, setSaving] = useState(false);

  const canSave = title.trim().length > 0 && !saving;

  const toggleReminder = async (enabled: boolean) => {
    if (enabled) {
      const granted = await ensureNotificationPermission();
      if (!granted) {
        Alert.alert(
          'Notifications are off',
          'To get reminders, allow notifications for "Yep, Did It" in your phone settings.',
          [
            { text: 'Not now', style: 'cancel' },
            { text: 'Open settings', onPress: () => Linking.openSettings() },
          ],
        );
        return;
      }
    }
    setReminder((r) => ({ ...r, enabled }));
  };

  const pickTime = () => {
    const value = new Date();
    value.setHours(reminder.hour, reminder.minute, 0, 0);
    DateTimePickerAndroid.open({
      value,
      mode: 'time',
      onChange: (event, date) => {
        if (event.type === 'set' && date)
          setReminder((r) => ({ ...r, hour: date.getHours(), minute: date.getMinutes() }));
      },
    });
  };

  const save = async () => {
    if (!canSave) return;
    setSaving(true);
    const action: Action = {
      id: existing?.id ?? newId(),
      title: title.trim(),
      icon,
      color,
      reminder,
      notificationId: existing?.notificationId,
    };
    try {
      action.notificationId = await syncReminder(action);
    } catch (e) {
      console.warn('Reminder scheduling failed', e);
      action.notificationId = undefined;
    }
    saveAction(action);
    router.back();
    if (!existing) setTimeout(maybeShowInterstitial, 400);
  };

  const remove = () => {
    if (!existing) return;
    Alert.alert('Delete this check?', `"${existing.title}" and its history will be removed.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await cancelReminder(existing.notificationId);
          deleteAction(existing.id);
          router.back();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: p.bg }]} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: existing ? 'Edit check' : 'New check',
          headerLeft: () => (
            <Pressable onPress={() => router.back()} hitSlop={12} accessibilityLabel="Close">
              <MaterialCommunityIcons name="close" size={24} color={p.text} />
            </Pressable>
          ),
        }}
      />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {/* Preview */}
          <View style={[styles.preview, { backgroundColor: p.surface, borderColor: p.border }]}>
            <View style={[styles.previewIcon, { backgroundColor: color }]}>
              <MaterialCommunityIcons name={icon} size={26} color="#fff" />
            </View>
            <Text style={[styles.previewTitle, { color: title ? p.text : p.textMuted }]} numberOfLines={1}>
              {title || 'Name your check'}
            </Text>
          </View>

          <Text style={[styles.label, { color: p.textMuted }]}>Name</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Locked the door"
            placeholderTextColor={p.textMuted}
            maxLength={MAX_TITLE}
            autoFocus={!existing}
            returnKeyType="done"
            onSubmitEditing={save}
            style={[styles.input, { backgroundColor: p.surface, borderColor: p.border, color: p.text }]}
          />

          {!existing && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.suggestions}
              keyboardShouldPersistTaps="handled"
            >
              {SUGGESTIONS.filter((s) => !actions.some((a) => a.title === s.title)).map((s) => (
                <Pressable
                  key={s.title}
                  onPress={() => {
                    setTitle(s.title);
                    setIcon(s.icon);
                  }}
                  style={[styles.suggestion, { backgroundColor: p.primarySoft }]}
                >
                  <Text style={[styles.suggestionText, { color: p.primary }]}>{s.title}</Text>
                </Pressable>
              ))}
            </ScrollView>
          )}

          <Text style={[styles.label, { color: p.textMuted }]}>Icon</Text>
          <View style={styles.grid}>
            {ACTION_ICONS.map((name) => {
              const active = icon === name;
              return (
                <Pressable
                  key={name}
                  onPress={() => setIcon(name)}
                  accessibilityLabel={name.replace(/-/g, ' ')}
                  accessibilityState={{ selected: active }}
                  style={[
                    styles.iconCell,
                    { backgroundColor: active ? color : p.surface, borderColor: active ? color : p.border },
                  ]}
                >
                  <MaterialCommunityIcons name={name} size={24} color={active ? '#fff' : p.textMuted} />
                </Pressable>
              );
            })}
          </View>

          <Text style={[styles.label, { color: p.textMuted }]}>Color</Text>
          <View style={styles.colors}>
            {ACTION_COLORS.map((c) => (
              <Pressable
                key={c}
                onPress={() => setColor(c)}
                accessibilityLabel={`Color ${c}`}
                accessibilityState={{ selected: color === c }}
                style={[
                  styles.colorDot,
                  { backgroundColor: c, borderColor: color === c ? p.text : 'transparent' },
                ]}
              >
                {color === c && <MaterialCommunityIcons name="check" size={18} color="#fff" />}
              </Pressable>
            ))}
          </View>

          <Text style={[styles.label, { color: p.textMuted }]}>Daily reminder</Text>
          <View style={[styles.reminderCard, { backgroundColor: p.surface, borderColor: p.border }]}>
            <View style={styles.reminderRow}>
              <MaterialCommunityIcons name="bell-ring-outline" size={22} color={p.primary} />
              <Text style={[styles.reminderText, { color: p.text }]}>Remind me every day</Text>
              <Switch
                value={reminder.enabled}
                onValueChange={toggleReminder}
                trackColor={{ true: p.primary, false: p.border }}
                thumbColor="#fff"
              />
            </View>
            {reminder.enabled && (
              <View style={[styles.reminderRow, styles.timeRow, { borderTopColor: p.border }]}>
                <Text style={[styles.reminderText, { color: p.textMuted }]}>At</Text>
                {Platform.OS === 'android' ? (
                  <Pressable onPress={pickTime} style={[styles.timeBtn, { backgroundColor: p.primarySoft }]}>
                    <Text style={[styles.timeText, { color: p.primary }]}>
                      {formatClockHM(reminder.hour, reminder.minute)}
                    </Text>
                  </Pressable>
                ) : (
                  <DateTimePicker
                    mode="time"
                    display="compact"
                    value={(() => {
                      const d = new Date();
                      d.setHours(reminder.hour, reminder.minute, 0, 0);
                      return d;
                    })()}
                    onChange={(_, date) =>
                      date && setReminder((r) => ({ ...r, hour: date.getHours(), minute: date.getMinutes() }))
                    }
                  />
                )}
              </View>
            )}
          </View>

          {existing && (
            <Pressable onPress={remove} style={styles.deleteBtn} accessibilityRole="button">
              <MaterialCommunityIcons name="trash-can-outline" size={20} color={p.danger} />
              <Text style={[styles.deleteText, { color: p.danger }]}>Delete this check</Text>
            </Pressable>
          )}
        </ScrollView>

        <View style={[styles.footer, { borderTopColor: p.border, backgroundColor: p.bg }]}>
          <Pressable
            onPress={save}
            disabled={!canSave}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.saveBtn,
              { backgroundColor: p.primary, opacity: !canSave ? 0.4 : pressed ? 0.85 : 1 },
            ]}
          >
            <Text style={[styles.saveText, { color: p.onPrimary }]}>
              {existing ? 'Save changes' : 'Add check'}
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 18, paddingBottom: 32 },
  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: Radius.lg,
    borderWidth: 1,
    gap: 14,
  },
  previewIcon: {
    width: 50,
    height: 50,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewTitle: { flex: 1, fontSize: 17, fontWeight: '700' },
  label: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: 22,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 16,
  },
  suggestions: { gap: 8, paddingTop: 10 },
  suggestion: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: Radius.pill },
  suggestionText: { fontSize: 14, fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  iconCell: {
    width: 52,
    height: 52,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colors: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  colorDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reminderCard: { borderRadius: Radius.md, borderWidth: 1 },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 12,
  },
  reminderText: { flex: 1, fontSize: 16, fontWeight: '500' },
  timeRow: { borderTopWidth: StyleSheet.hairlineWidth },
  timeBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: Radius.sm },
  timeText: { fontSize: 16, fontWeight: '700' },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 28,
    padding: 12,
  },
  deleteText: { fontSize: 16, fontWeight: '600' },
  footer: { padding: 16, borderTopWidth: StyleSheet.hairlineWidth },
  saveBtn: { paddingVertical: 16, borderRadius: Radius.pill, alignItems: 'center' },
  saveText: { fontSize: 17, fontWeight: '700' },
});
