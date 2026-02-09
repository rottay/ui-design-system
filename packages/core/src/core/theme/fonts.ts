/**
 * Typography Scale
 *
 * Geist-based typography scale for the design system.
 * Personality tokens (headingWeightBias, labelStyle, letterSpacing)
 * are applied at component level via getPersonalityTypography().
 */

import type { CSSProperties } from 'react';

export const typographyScale: Record<string, CSSProperties> = {
  pageTitle: {
    fontSize: '2.25rem',
    fontWeight: 700,
    lineHeight: 1.2,
    letterSpacing: '-0.02em',
  },
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: 600,
    lineHeight: 1.3,
    letterSpacing: '-0.01em',
  },
  subsection: {
    fontSize: '1.25rem',
    fontWeight: 600,
    lineHeight: 1.3,
  },
  cardTitle: {
    fontSize: '1rem',
    fontWeight: 600,
    lineHeight: 1.4,
  },
  body: {
    fontSize: '0.875rem',
    fontWeight: 400,
    lineHeight: 1.5,
  },
  bodySmall: {
    fontSize: '0.8125rem',
    fontWeight: 400,
    lineHeight: 1.5,
  },
  caption: {
    fontSize: '0.75rem',
    fontWeight: 500,
  },
  code: {
    fontFamily: 'var(--font-geist-mono, monospace)',
    fontSize: '0.8125rem',
    lineHeight: 1.5,
  },
  kpiValue: {
    fontSize: '1.75rem',
    fontWeight: 700,
    lineHeight: 1.1,
    fontFeatureSettings: '"tnum"',
  },
  kpiLabel: {
    fontSize: '0.75rem',
    fontWeight: 500,
  },
};
