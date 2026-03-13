import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme as useColorSchemeCore } from 'react-native';
import 'react-native-reanimated';

import { darkColors, lightColors } from '@/constants/Colors';
import { SettingsProvider, useSettings } from '@/contexts/SettingsContext';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: 'index',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, error] = useFonts({
    Rubik: require('../assets/fonts/Rubik-Medium.ttf'),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  if (!fontsLoaded) return null;

  return (
    <SettingsProvider>
      <RootLayoutNav />
    </SettingsProvider>
  );
}

function RootLayoutNav() {
  const { settings, loaded: settingsLoaded } = useSettings();
  const systemScheme = useColorSchemeCore();

  useEffect(() => {
    if (settingsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [settingsLoaded]);

  const effectiveScheme =
    settings.colorScheme === 'system'
      ? systemScheme === 'dark'
        ? 'dark'
        : 'light'
      : settings.colorScheme;

  const colors = effectiveScheme === 'dark' ? darkColors : lightColors;

  return (
    <ThemeProvider value={effectiveScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.surface,
          },
          headerTintColor: colors.onSurface,
          headerTitleStyle: {
            fontFamily: 'Rubik',
            fontSize: 18,
            fontWeight: '600',
          },
        }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="settings" options={{ title: 'Settings' }} />
        <Stack.Screen name="game" options={{ title: 'Game' }} />
      </Stack>
    </ThemeProvider>
  );
}
