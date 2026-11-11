import { DarkTheme, DefaultTheme, Stack, ThemeProvider, type ErrorBoundaryProps } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Alert, Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { SUPPORT_EMAIL } from '@/constants/config';
import { takeLastCrash } from '@/lib/crash';
import { Palettes, usePalette } from '@/constants/theme';
import { initAds } from '@/lib/ads';
import { setupNotifications } from '@/lib/notifications';
import { StoreProvider, useStore } from '@/lib/store';

SplashScreen.preventAutoHideAsync().catch(() => {});
setupNotifications();

export const unstable_settings = { anchor: '(tabs)' };

function emailReport(text: string) {
  const url = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('Yep, Did It crash report')}&body=${encodeURIComponent(text)}`;
  Linking.openURL(url).catch(() => {});
}

/** Shown instead of a blank/closed app if a screen throws while rendering. */
export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  const p = usePalette();
  const details = `${error.message}\n\n${String(error.stack ?? '').slice(0, 1500)}`;
  return (
    <View style={{ flex: 1, backgroundColor: p.bg, padding: 24, paddingTop: 80 }}>
      <Text style={{ color: p.text, fontSize: 24, fontWeight: '800' }}>Something went wrong</Text>
      <Text style={{ color: p.textMuted, fontSize: 15, marginTop: 8 }}>
        Sorry about that. Your data is safe. Please try again, or send us the details so we can fix it.
      </Text>
      <ScrollView
        style={{ marginTop: 16, maxHeight: 240, backgroundColor: p.surface, borderRadius: 12, padding: 12 }}
      >
        <Text selectable style={{ color: p.textMuted, fontSize: 12, fontFamily: 'monospace' }}>
          {details}
        </Text>
      </ScrollView>
      <Pressable
        onPress={retry}
        style={{
          marginTop: 20,
          backgroundColor: p.primary,
          padding: 15,
          borderRadius: 999,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: p.onPrimary, fontWeight: '700', fontSize: 16 }}>Try again</Text>
      </Pressable>
      <Pressable
        onPress={() => emailReport(details)}
        style={{ marginTop: 12, padding: 12, alignItems: 'center' }}
      >
        <Text style={{ color: p.primary, fontWeight: '600', fontSize: 15 }}>Email details to developer</Text>
      </Pressable>
    </View>
  );
}

function AppStack() {
  const { ready } = useStore();
  const p = usePalette();

  useEffect(() => {
    if (!ready) return;
    SplashScreen.hideAsync().catch(() => {});
    // Consent form (if needed) appears after the UI is visible.
    initAds();
    // If the app crashed last time, show what happened so it can be reported.
    takeLastCrash().then((crash) => {
      if (!crash) return;
      const text = `${crash.at}\n${crash.message}\n\n${crash.stack}`;
      Alert.alert('The app closed unexpectedly last time', crash.message.slice(0, 300), [
        { text: 'OK', style: 'cancel' },
        { text: 'Email details', onPress: () => emailReport(text) },
      ]);
    });
  }, [ready]);

  if (!ready) return null;

  return (
    <Stack screenOptions={{ contentStyle: { backgroundColor: p.bg } }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="action-editor"
        options={{
          presentation: 'modal',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: p.bg },
          headerTintColor: p.text,
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const p = usePalette();
  const navTheme = p.isDark ? DarkTheme : DefaultTheme;
  const palette = p.isDark ? Palettes.dark : Palettes.light;

  return (
    <View style={{ flex: 1, backgroundColor: palette.bg }}>
      <SafeAreaProvider>
        <ThemeProvider
          value={{
            ...navTheme,
            colors: {
              ...navTheme.colors,
              background: palette.bg,
              card: palette.surface,
              text: palette.text,
              border: palette.border,
              primary: palette.primary,
            },
          }}
        >
          <StoreProvider>
            <AppStack />
          </StoreProvider>
          <StatusBar style={p.isDark ? 'light' : 'dark'} />
        </ThemeProvider>
      </SafeAreaProvider>
    </View>
  );
}
