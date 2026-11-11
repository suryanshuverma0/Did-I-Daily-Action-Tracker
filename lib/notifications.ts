import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import type { Action } from './store';

const CHANNEL_ID = 'reminders';

export function setupNotifications() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Daily reminders',
      importance: Notifications.AndroidImportance.HIGH,
    }).catch(() => {});
  }
}

/** Asks for notification permission if needed. Returns true when granted. */
export async function ensureNotificationPermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  const next = await Notifications.requestPermissionsAsync();
  return next.granted;
}

export async function cancelReminder(notificationId?: string) {
  if (!notificationId) return;
  await Notifications.cancelScheduledNotificationAsync(notificationId).catch(() => {});
}

/**
 * Cancels the action's old reminder and schedules a new daily one if enabled.
 * Returns the new notification id (or undefined if the reminder is off).
 */
export async function syncReminder(action: Action): Promise<string | undefined> {
  await cancelReminder(action.notificationId);
  if (!action.reminder.enabled) return undefined;
  return Notifications.scheduleNotificationAsync({
    content: {
      title: `Did you check: ${action.title}?`,
      body: 'Done it? Tap to check it off.',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: action.reminder.hour,
      minute: action.reminder.minute,
      channelId: CHANNEL_ID,
    },
  });
}
