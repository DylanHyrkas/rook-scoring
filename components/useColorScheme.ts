import { useColorScheme as useColorSchemeCore } from 'react-native';

import { useSettings } from '@/contexts/SettingsContext';

export const useColorScheme = (): 'light' | 'dark' => {
  const { settings } = useSettings();
  const system = useColorSchemeCore();
  if (settings.colorScheme !== 'system') return settings.colorScheme;
  return system == null || system === 'unspecified' ? 'dark' : system;
};
