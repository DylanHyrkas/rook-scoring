// Rook Scoring Theme Colors

export type ColorPalette = {
  primary: string;
  onPrimary: string;
  surface: string;
  onSurface: string;
  surfaceVariant: string;
  scaffoldBg: string;
};

export const darkColors: ColorPalette = {
  primary: '#006B99',
  onPrimary: '#FFFFFF',
  surface: '#152A3E',
  onSurface: '#CCE4F6',
  surfaceVariant: '#1E3D57',
  scaffoldBg: '#0D1B2A',
};

export const lightColors: ColorPalette = {
  primary: '#006B99',
  onPrimary: '#FFFFFF',
  surface: '#FFFFFF',
  onSurface: '#0D2137',
  surfaceVariant: '#DDE8F0',
  scaffoldBg: '#EEF3F7',
};

// Backward compat alias
export const Colors = darkColors;

export default {
  light: {
    text: lightColors.onSurface,
    background: lightColors.scaffoldBg,
    tint: lightColors.primary,
    tabIconDefault: lightColors.surfaceVariant,
    tabIconSelected: lightColors.primary,
  },
  dark: {
    text: darkColors.onSurface,
    background: darkColors.scaffoldBg,
    tint: darkColors.primary,
    tabIconDefault: darkColors.surfaceVariant,
    tabIconSelected: darkColors.primary,
  },
};
