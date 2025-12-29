/**
 * Minimal Theme
 * Clean, grayscale theme inspired by Notion
 */

import type { ThemeConfig } from '../../../../core/types';

export const minimalTheme: ThemeConfig = {
  name: 'minimal',
  extends: 'foundation',
  variables: {
    // Brand colors - Grayscale
    'color-primary': '#37352F',
    'color-primary-hover': '#2F2D28',
    'color-accent': '#EB5757',

    // Surface colors
    'color-background': '#FFFFFF',
    'color-surface': '#FFFFFF',
    'color-surface-hover': '#F7F6F3',

    // Typography
    'font-family-base': "Georgia, 'Times New Roman', serif",
    'font-family-heading': "-apple-system, BlinkMacSystemFont, sans-serif",

    // Effects - Very subtle
    'radius-base': '0.25rem',
    'shadow-card': 'rgba(15, 15, 15, 0.05) 0px 0px 0px 1px',
  },
  engineOverrides: {
    titan: {
      token: {
        colorPrimary: '#37352F',
        borderRadius: 4,
        fontFamily: "Georgia, 'Times New Roman', serif",
      },
    },
  },
};
