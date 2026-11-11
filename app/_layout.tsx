import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Palettes, usePalette } from '@/constants/theme';
import { initAds } from '@/lib/ads';
import { setupNotifications } from '@/lib/notifications';
import { StoreProvider, useStore } from '@/lib/store';

SplashScreen.preventAutoHideAsync().catch(() => {});
setupNotifications();

export const unstable_settings = { anchor: '(tabs)' };

function AppStack() {
  const { ready } = useStore();
  const p = usePalette();

  useEffect(() => {
    if (!ready) return;
    SplashScreen.hideAsync().catch(() => {});
    // Consent form (if needed) appears after the UI is visible.
    initAds();
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
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: palette.bg }}>
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
    </GestureHandlerRootView>
  );
}
