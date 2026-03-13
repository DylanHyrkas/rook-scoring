import { useColorScheme } from 'react-native';

import { ColorPalette, darkColors, lightColors } from '@/constants/Colors';
import { useSettings } from '@/contexts/SettingsContext';

export function useColors(): ColorPalette {
  const { settings } = useSettings();
  const system = useColorScheme();
  const effective =
    settings.colorScheme === 'system'
      ? system === 'dark'
        ? 'dark'
        : 'light'
      : settings.colorScheme;
  return effective === 'dark' ? darkColors : lightColors;
}
