/**
 * BitHire Theme
 * Professional theme inspired by LinkedIn/recruiting platforms
 */

import type { ThemeConfig } from '../../../../core/types';

export const bithireTheme: ThemeConfig = {
  name: 'bithire',
  extends: 'foundation',
  variables: {
    // Brand colors - Blues and Beige
    'color-primary': '#0A66C2',
    'color-primary-hover': '#004182',
    'color-accent': '#7FC15E',

    // Surface colors
    'color-background': '#F3F2EE',
    'color-surface': '#FFFFFF',
    'color-surface-hover': '#F5F5F5',

    // Typography
    'font-family-base': "'Source Sans Pro', -apple-system, sans-serif",
    'font-family-heading': "'Source Sans Pro', -apple-system, sans-serif",

    // Effects
    'radius-base': '0.5rem',
    'shadow-card': '0 0 0 1px rgba(0,0,0,.08), 0 4px 6px rgba(0,0,0,.04)',
  },
  engineOverrides: {
    classic: {
      token: {
        colorPrimary: '#0A66C2',
        borderRadius: 8,
        fontFamily: "'Source Sans Pro', -apple-system, sans-serif",
      },
    },
  },
};
