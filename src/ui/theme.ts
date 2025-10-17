import { useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { MD3DarkTheme, MD3LightTheme, type MD3Theme } from 'react-native-paper';
import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
  type Theme as NavigationTheme
} from '@react-navigation/native';

const primaryColor = '#6366F1';
const secondaryColor = '#22D3EE';
const accentColor = '#F97316';

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32
} as const;

export const radius = {
  sm: 8,
  md: 14,
  lg: 20,
  pill: 32
} as const;

const lightPalette = {
  primary: primaryColor,
  secondary: secondaryColor,
  background: '#F4F6FB',
  surface: '#FFFFFF',
  surfaceVariant: '#EEF1F8',
  text: '#101828',
  muted: '#4B5563',
  subtle: '#94A3B8',
  border: '#E2E8F0',
  accent: accentColor,
  success: '#22C55E',
  danger: '#EF4444',
  info: '#38BDF8',
  overlay: 'rgba(15, 23, 42, 0.12)'
};

const darkPalette = {
  primary: primaryColor,
  secondary: secondaryColor,
  background: '#0F172A',
  surface: '#15213C',
  surfaceVariant: '#1F2A44',
  text: '#E2E8F0',
  muted: '#CBD5F5',
  subtle: '#94A3B8',
  border: '#1F2A44',
  accent: accentColor,
  success: '#4ADE80',
  danger: '#F87171',
  info: '#38BDF8',
  overlay: 'rgba(148, 163, 184, 0.18)'
};

export type AppTheme = typeof lightPalette & {
  gradients: {
    hero: string[];
    card: string[];
    practice: string[];
    exam: string[];
  };
};

const buildAppTheme = (palette: typeof lightPalette): AppTheme => ({
  ...palette,
  gradients: {
    hero: [palette.primary, palette.secondary],
    card: [palette.surfaceVariant, palette.surface],
    practice: ['#6366F1', '#8B5CF6'],
    exam: ['#F97316', '#FB7185']
  }
});

const paperLightTheme: MD3Theme = {
  ...MD3LightTheme,
  roundness: radius.md,
  colors: {
    ...MD3LightTheme.colors,
    primary: primaryColor,
    secondary: secondaryColor,
    background: lightPalette.background,
    surface: lightPalette.surface,
    surfaceVariant: lightPalette.surfaceVariant,
    outline: lightPalette.border,
    onSurface: lightPalette.text,
    onSurfaceVariant: lightPalette.muted,
    tertiary: accentColor
  }
};

const paperDarkTheme: MD3Theme = {
  ...MD3DarkTheme,
  roundness: radius.md,
  colors: {
    ...MD3DarkTheme.colors,
    primary: primaryColor,
    secondary: secondaryColor,
    background: darkPalette.background,
    surface: darkPalette.surface,
    surfaceVariant: darkPalette.surfaceVariant,
    outline: darkPalette.border,
    onSurface: darkPalette.text,
    onSurfaceVariant: darkPalette.muted,
    tertiary: accentColor
  }
};

const navigationLight: NavigationTheme = {
  ...NavigationDefaultTheme,
  colors: {
    ...NavigationDefaultTheme.colors,
    primary: paperLightTheme.colors.primary,
    background: paperLightTheme.colors.background,
    card: paperLightTheme.colors.surface,
    text: lightPalette.text,
    border: lightPalette.border,
    notification: paperLightTheme.colors.tertiary ?? accentColor
  }
};

const navigationDark: NavigationTheme = {
  ...NavigationDarkTheme,
  colors: {
    ...NavigationDarkTheme.colors,
    primary: paperDarkTheme.colors.primary,
    background: paperDarkTheme.colors.background,
    card: paperDarkTheme.colors.surface,
    text: darkPalette.text,
    border: darkPalette.border,
    notification: paperDarkTheme.colors.tertiary ?? accentColor
  }
};

export const getPaperTheme = (scheme: 'light' | 'dark'): MD3Theme =>
  scheme === 'dark' ? paperDarkTheme : paperLightTheme;

export const getNavigationTheme = (scheme: 'light' | 'dark'): NavigationTheme =>
  scheme === 'dark' ? navigationDark : navigationLight;

export const useTheme = (): AppTheme => {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  return useMemo(() => buildAppTheme(scheme === 'dark' ? darkPalette : lightPalette), [scheme]);
};

export const usePaperTheme = (): MD3Theme => {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  return useMemo(() => getPaperTheme(scheme), [scheme]);
};

export const useNavigationAppTheme = (): NavigationTheme => {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  return useMemo(() => getNavigationTheme(scheme), [scheme]);
};
