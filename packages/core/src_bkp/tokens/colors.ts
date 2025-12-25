/**
 * Color Tokens
 * Design system color palette and semantic colors
 */

// ==================== Neutral/Gray Scale ====================
export const neutral = {
  50: '#fafafa',
  100: '#f5f5f5',
  200: '#e5e5e5',
  300: '#d4d4d4',
  400: '#a3a3a3',
  500: '#737373',
  600: '#525252',
  700: '#404040',
  800: '#262626',
  900: '#171717',
  950: '#0a0a0a',
} as const;

// ==================== Primary Colors by Theme ====================
export const primary = {
  spotify: '#1DB954',
  stripe: '#635BFF',
  airbnb: '#FF385C',
  slack: '#611F69',
  notion: '#000000',
  linear: '#5E6AD2',
  vercel: '#000000',
  base: '#1890ff',
} as const;

// ==================== Semantic Colors ====================
export const semantic = {
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  info: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
} as const;

// ==================== Theme-specific Color Palettes ====================
export const themeColors = {
  spotify: {
    primary: '#1DB954',
    background: '#121212',
    surface: '#181818',
    surfaceElevated: '#282828',
    text: '#FFFFFF',
    textSecondary: '#B3B3B3',
    border: '#282828',
    hover: '#1ed760',
    active: '#1aa34a',
  },
  stripe: {
    primary: '#635BFF',
    background: '#FFFFFF',
    surface: '#F6F9FC',
    surfaceElevated: '#FFFFFF',
    text: '#0A2540',
    textSecondary: '#425466',
    border: '#E3E8EE',
    hover: '#0A2540',
    active: '#00D4FF',
  },
  airbnb: {
    primary: '#FF385C',
    background: '#FFFFFF',
    surface: '#F7F7F7',
    surfaceElevated: '#FFFFFF',
    text: '#222222',
    textSecondary: '#717171',
    border: '#DDDDDD',
    hover: '#E31C5F',
    active: '#C13515',
  },
  slack: {
    primary: '#611F69',
    background: '#FFFFFF',
    surface: '#F8F8F8',
    surfaceElevated: '#FFFFFF',
    text: '#1D1C1D',
    textSecondary: '#616061',
    border: '#DDDDDD',
    hover: '#4A154B',
    active: '#350D36',
  },
  notion: {
    primary: '#000000',
    background: '#FFFFFF',
    surface: '#F7F6F3',
    surfaceElevated: '#FFFFFF',
    text: '#37352F',
    textSecondary: '#787774',
    border: '#E9E9E7',
    hover: '#37352F',
    active: '#2F2F2F',
  },
  linear: {
    primary: '#5E6AD2',
    background: '#FFFFFF',
    surface: '#F5F5F7',
    surfaceElevated: '#FFFFFF',
    text: '#0D0E10',
    textSecondary: '#8A8F98',
    border: '#E3E4E8',
    hover: '#4C5FD5',
    active: '#3E4FBE',
  },
  vercel: {
    primary: '#000000',
    background: '#FFFFFF',
    surface: '#FAFAFA',
    surfaceElevated: '#FFFFFF',
    text: '#000000',
    textSecondary: '#666666',
    border: '#EAEAEA',
    hover: '#111111',
    active: '#000000',
  },
  base: {
    primary: '#1890ff',
    background: '#FFFFFF',
    surface: '#F5F5F5',
    surfaceElevated: '#FFFFFF',
    text: '#000000',
    textSecondary: '#666666',
    border: '#D9D9D9',
    hover: '#40a9ff',
    active: '#096dd9',
  },
} as const;

// ==================== Alpha Colors (with transparency) ====================
export const alpha = {
  white: {
    10: 'rgba(255, 255, 255, 0.1)',
    20: 'rgba(255, 255, 255, 0.2)',
    30: 'rgba(255, 255, 255, 0.3)',
    40: 'rgba(255, 255, 255, 0.4)',
    50: 'rgba(255, 255, 255, 0.5)',
    60: 'rgba(255, 255, 255, 0.6)',
    70: 'rgba(255, 255, 255, 0.7)',
    80: 'rgba(255, 255, 255, 0.8)',
    90: 'rgba(255, 255, 255, 0.9)',
  },
  black: {
    10: 'rgba(0, 0, 0, 0.1)',
    20: 'rgba(0, 0, 0, 0.2)',
    30: 'rgba(0, 0, 0, 0.3)',
    40: 'rgba(0, 0, 0, 0.4)',
    50: 'rgba(0, 0, 0, 0.5)',
    60: 'rgba(0, 0, 0, 0.6)',
    70: 'rgba(0, 0, 0, 0.7)',
    80: 'rgba(0, 0, 0, 0.8)',
    90: 'rgba(0, 0, 0, 0.9)',
  },
} as const;

// ==================== Common UI Colors ====================
export const common = {
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
} as const;

// ==================== Type Exports ====================
export type NeutralShade = keyof typeof neutral;
export type SemanticColor = keyof typeof semantic;
export type SemanticShade = keyof typeof semantic.success;
export type ThemeName = keyof typeof themeColors;
export type AlphaLevel = keyof typeof alpha.white;
