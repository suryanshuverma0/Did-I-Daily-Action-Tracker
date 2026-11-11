import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { ACTION_COLORS, type ActionIcon } from '@/constants/theme';

export type Reminder = { enabled: boolean; hour: number; minute: number };

export type Action = {
  id: string;
  title: string;
  icon: ActionIcon;
  color: string;
  reminder: Reminder;
  /** Id of the scheduled local notification, if a reminder is on. */
  notificationId?: string;
};

export type Log = { id: string; actionId: string; at: number };

export type Settings = { keepDays: number };

type Data = { actions: Action[]; logs: Log[]; settings: Settings };

const STORAGE_KEY = 'resteasy:data:v1';
const MAX_LOGS = 5000;

const OFF: Reminder = { enabled: false, hour: 22, minute: 0 };

const DEFAULT_DATA: Data = {
  actions: [
    { id: 'a1', title: 'Locked the door', icon: 'door-closed-lock', color: ACTION_COLORS[0], reminder: OFF },
    { id: 'a2', title: 'Turned off the stove', icon: 'stove', color: ACTION_COLORS[2], reminder: OFF },
    {
      id: 'a3',
      title: 'Took my medicine',
      icon: 'pill',
      color: ACTION_COLORS[1],
      reminder: { ...OFF, hour: 9 },
    },
    { id: 'a4', title: 'Fed the pet', icon: 'paw', color: ACTION_COLORS[3], reminder: { ...OFF, hour: 8 } },
  ],
  logs: [],
  settings: { keepDays: 30 },
};

export const newId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

function prune(logs: Log[], keepDays: number): Log[] {
  const cutoff = Date.now() - keepDays * 24 * 60 * 60 * 1000;
  return logs.filter((l) => l.at >= cutoff).slice(0, MAX_LOGS);
}

type Store = Data & {
  ready: boolean;
  /** Most recent log per action id. */
  lastLog: Record<string, Log | undefined>;
  logAction: (actionId: string) => Log;
  removeLog: (logId: string) => void;
  saveAction: (action: Action) => void;
  deleteAction: (actionId: string) => void;
  setKeepDays: (days: number) => void;
  clearHistory: () => void;
};

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<Data>(DEFAULT_DATA);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as Data;
          const settings = { ...DEFAULT_DATA.settings, ...parsed.settings };
          setData({
            actions: parsed.actions ?? [],
            logs: prune(parsed.logs ?? [], settings.keepDays),
            settings,
          });
        }
      } catch (e) {
        console.warn('Failed to load data', e);
      } finally {
        setReady(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!ready) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data)).catch((e) =>
      console.warn('Failed to save data', e),
    );
  }, [data, ready]);

  const logAction = useCallback((actionId: string) => {
    const log: Log = { id: newId(), actionId, at: Date.now() };
    setData((d) => ({ ...d, logs: [log, ...d.logs].slice(0, MAX_LOGS) }));
    return log;
  }, []);

  const removeLog = useCallback((logId: string) => {
    setData((d) => ({ ...d, logs: d.logs.filter((l) => l.id !== logId) }));
  }, []);

  const saveAction = useCallback((action: Action) => {
    setData((d) => {
      const exists = d.actions.some((a) => a.id === action.id);
      return {
        ...d,
        actions: exists ? d.actions.map((a) => (a.id === action.id ? action : a)) : [...d.actions, action],
      };
    });
  }, []);

  const deleteAction = useCallback((actionId: string) => {
    setData((d) => ({
      ...d,
      actions: d.actions.filter((a) => a.id !== actionId),
      logs: d.logs.filter((l) => l.actionId !== actionId),
    }));
  }, []);

  const setKeepDays = useCallback((keepDays: number) => {
    setData((d) => ({ ...d, settings: { ...d.settings, keepDays }, logs: prune(d.logs, keepDays) }));
  }, []);

  const clearHistory = useCallback(() => {
    setData((d) => ({ ...d, logs: [] }));
  }, []);

  const lastLog = useMemo(() => {
    const map: Record<string, Log | undefined> = {};
    // logs are kept newest-first, so the first one we see per action wins
    for (const l of data.logs) if (!map[l.actionId]) map[l.actionId] = l;
    return map;
  }, [data.logs]);

  const value = useMemo<Store>(
    () => ({
      ...data,
      ready,
      lastLog,
      logAction,
      removeLog,
      saveAction,
      deleteAction,
      setKeepDays,
      clearHistory,
    }),
    [data, ready, lastLog, logAction, removeLog, saveAction, deleteAction, setKeepDays, clearHistory],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>');
  return ctx;
}
