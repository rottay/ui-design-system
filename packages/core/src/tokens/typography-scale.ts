/**
 * @fileoverview Hardcoded Geist-based typography scale for direct style application.
 *
 * Unlike the CSS-variable-backed token mirrors in `ts/base/typography.ts`, this
 * scale uses concrete rem/px values suitable for inline `style` props and
 * canvas/SVG rendering where CSS variables are unavailable.
 *
 * Personality-level adjustments (headingWeightBias, labelStyle, letterSpacing)
 * are layered on top of these values at the component level via
 * `getPersonalityTypography()`.
 */

import type { CSSProperties } from 'react';

/**
 * Named text style presets mapping style keys to CSSProperties objects.
 *
 * Keys: pageTitle, sectionTitle, subsection, cardTitle, body, bodySmall,
 * caption, code, kpiValue, kpiLabel.
 */
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
    fontFamily: 'var(--ds-font-family-mono, monospace)',
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
