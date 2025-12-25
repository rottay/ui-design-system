/**
 * Corporate Theme
 * Conservative, professional theme for enterprise applications
 */

import type { ThemeConfig } from '../../../../types';

export const corporateTheme: ThemeConfig = {
  name: 'corporate',
  extends: 'foundation',
  variables: {
    // Brand colors - Conservative blues
    'color-primary': '#1E3A5F',
    'color-primary-hover': '#152A45',
    'color-accent': '#2563EB',

    // Surface colors
    'color-background': '#F8FAFC',
    'color-surface': '#FFFFFF',
    'color-surface-hover': '#F1F5F9',

    // Typography
    'font-family-base': "'Inter', -apple-system, sans-serif",
    'font-family-heading': "'Inter', -apple-system, sans-serif",

    // Effects - More subtle
    'radius-base': '0.25rem',
    'shadow-card': '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
  },
  engineOverrides: {
    titan: {
      token: {
        colorPrimary: '#1E3A5F',
        borderRadius: 4,
        fontFamily: "'Inter', -apple-system, sans-serif",
      },
    },
  },
};
