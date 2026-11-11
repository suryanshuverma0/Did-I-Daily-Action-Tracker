import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Tiny crash reporter (no backend): if a JavaScript error crashes the app, save it,
 * so the next launch can show it to the user (who can email it to us).
 * Imported first in app/_layout.tsx so it is installed before anything else runs.
 */
const KEY = 'yepdidit:lastCrash';

type ErrorHandler = (error: unknown, isFatal?: boolean) => void;
type ErrorUtilsT = { getGlobalHandler: () => ErrorHandler; setGlobalHandler: (h: ErrorHandler) => void };
const EU = (globalThis as unknown as { ErrorUtils?: ErrorUtilsT }).ErrorUtils;

if (EU) {
  const previous = EU.getGlobalHandler();
  EU.setGlobalHandler((error, isFatal) => {
    if (!isFatal) return previous(error, isFatal);
    const e = error as { message?: string; stack?: string };
    const report = JSON.stringify({
      at: new Date().toISOString(),
      message: String(e?.message ?? error),
      stack: String(e?.stack ?? '').slice(0, 1500),
    });
    // Give the write a moment to finish before the default handler closes the app.
    AsyncStorage.setItem(KEY, report)
      .catch(() => {})
      .finally(() => previous(error, isFatal));
  });
}

/** Returns the last saved crash (and clears it), or null. */
export async function takeLastCrash(): Promise<{ at: string; message: string; stack: string } | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return null;
    await AsyncStorage.removeItem(KEY);
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
