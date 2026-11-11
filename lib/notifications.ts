import type * as NotificationsModule from 'expo-notifications';
import { Platform } from 'react-native';

import type { Action } from './store';

const CHANNEL_ID = 'reminders';

/**
 * expo-notifications is loaded defensively: if its native side is missing or broken on a device
 * (e.g. some Expo Go versions), reminders are disabled instead of crashing the whole app.
 */
let N: typeof NotificationsModule | null = null;
let loadError: string | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  N = require('expo-notifications') as typeof NotificationsModule;
} catch (e) {
  loadError = String((e as Error)?.message ?? e);
  console.warn('[notifications] unavailable:', loadError);
}

export const notificationsAvailable = N !== null;
export const notificationsError = loadError;

export function setupNotifications() {
  if (!N) return;
  try {
    N.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
    if (Platform.OS === 'android') {
      N.setNotificationChannelAsync(CHANNEL_ID, {
        name: 'Daily reminders',
        importance: N.AndroidImportance.HIGH,
      }).catch(() => {});
    }
  } catch (e) {
    console.warn('[notifications] setup failed', e);
  }
}

/** Asks for notification permission if needed. Returns true when granted. */
export async function ensureNotificationPermission(): Promise<boolean> {
  if (!N) return false;
  const current = await N.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  const next = await N.requestPermissionsAsync();
  return next.granted;
}

export async function cancelReminder(notificationId?: string) {
  if (!N || !notificationId) return;
  await N.cancelScheduledNotificationAsync(notificationId).catch(() => {});
}

/**
 * Cancels the action's old reminder and schedules a new daily one if enabled.
 * Returns the new notification id (or undefined if the reminder is off).
 */
export async function syncReminder(action: Action): Promise<string | undefined> {
  if (!N) return undefined;
  await cancelReminder(action.notificationId);
  if (!action.reminder.enabled) return undefined;
  return N.scheduleNotificationAsync({
    content: {
      title: `Did you check: ${action.title}?`,
      body: 'Done it? Tap to check it off.',
    },
    trigger: {
      type: N.SchedulableTriggerInputTypes.DAILY,
      hour: action.reminder.hour,
      minute: action.reminder.minute,
      channelId: CHANNEL_ID,
    },
  });
}
