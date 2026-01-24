/**
 * Evnto Theme
 * Notion-inspired monochromatic theme for event management
 */

import type { ThemeConfig } from '../../../../core/types';

export const evntoTheme: ThemeConfig = {
  name: 'evnto',
  extends: 'foundation',
  variables: {
    // Brand colors - Black/Grey monochromatic
    'color-primary': '#191919',
    'color-primary-hover': '#2f2f2f',
    'color-accent': '#6b6b6b',

    // Surface colors
    'color-background': '#FAFAFA',
    'color-surface': '#FFFFFF',
    'color-surface-hover': '#F5F5F5',

    // Typography - Inter for clean, modern look
    'font-family-base': "'Inter', -apple-system, sans-serif",
    'font-family-heading': "'Inter', -apple-system, sans-serif",

    // Effects - Minimal shadows, subtle borders
    'radius-base': '0.25rem',
    'shadow-card': '0 0 0 1px rgba(0,0,0,.06)',
  },
  engineOverrides: {
    titan: {
      token: {
        colorPrimary: '#191919',
        borderRadius: 4,
        fontFamily: "'Inter', -apple-system, sans-serif",
      },
    },
  },
};
