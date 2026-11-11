import { Alert, Linking } from 'react-native';

/**
 * Tiny crash reporter (no backend). Loaded from index.js BEFORE expo-router and everything else,
 * so even errors during app startup are caught.
 *  - On a fatal JS error: show the error on screen (so the user can screenshot / email it),
 *    save it, and only close the app when the user taps "Close".
 *  - On next launch: if a crash was saved, show it once.
 * AsyncStorage is required lazily so a problem there can't break the reporter itself.
 */
const KEY = 'yepdidit:lastCrash';
const SUPPORT_EMAIL = 'suryanshuverma42@gmail.com';

type Report = { at: string; message: string; stack: string };
type ErrorHandler = (error: unknown, isFatal?: boolean) => void;
type ErrorUtilsT = { getGlobalHandler: () => ErrorHandler; setGlobalHandler: (h: ErrorHandler) => void };

function storage(): {
  getItem: (k: string) => Promise<string | null>;
  setItem: (k: string, v: string) => Promise<void>;
  removeItem: (k: string) => Promise<void>;
} | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('@react-native-async-storage/async-storage').default;
  } catch {
    return null;
  }
}

function emailReport(r: Report) {
  const body = `${r.at}\n${r.message}\n\n${r.stack}`;
  const url = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('Yep, Did It crash report')}&body=${encodeURIComponent(body)}`;
  Linking.openURL(url).catch(() => {});
}

const EU = (globalThis as unknown as { ErrorUtils?: ErrorUtilsT }).ErrorUtils;
let showing = false;

if (EU) {
  const previous = EU.getGlobalHandler();
  EU.setGlobalHandler((error, isFatal) => {
    if (!isFatal) return previous(error, isFatal);
    const e = error as { message?: string; stack?: string };
    const report: Report = {
      at: new Date().toISOString(),
      message: String(e?.message ?? error),
      stack: String(e?.stack ?? '').slice(0, 1500),
    };
    storage()?.setItem(KEY, JSON.stringify(report)).catch(() => {});
    if (showing) return;
    showing = true;
    try {
      Alert.alert(
        'Yep, Did It hit an error',
        `${report.message}\n\n${report.stack.slice(0, 600)}`,
        [
          { text: 'Email details', onPress: () => emailReport(report) },
          { text: 'Close app', style: 'destructive', onPress: () => previous(error, isFatal) },
        ],
        { cancelable: false },
      );
    } catch {
      previous(error, isFatal);
    }
  });
}

/** Returns the last saved crash (and clears it), or null. */
export async function takeLastCrash(): Promise<Report | null> {
  const s = storage();
  if (!s) return null;
  try {
    const raw = await s.getItem(KEY);
    if (!raw) return null;
    await s.removeItem(KEY);
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
