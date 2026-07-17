/**
 * @rottay/design-system ESLint plugin
 *
 * Governance rules that enforce Design System conventions across all
 * Rottay apps. Ships inside the design system package so there is no
 * extra dependency to install.
 *
 * Usage (flat config):
 *
 *   import { configs } from '@rottay/design-system/eslint';
 *
 *   export default [
 *     configs.recommended,
 *     // or cherry-pick:
 *     {
 *       plugins: { '@rottay': plugin },
 *       rules: { '@rottay/no-raw-html': ['error', { exempt: ['**\/landing\/**'] }] },
 *     },
 *   ];
 */

import {
  noDbInComponents,
  noDirectLucide,
  noHardcodedColors,
  noMotionLiterals,
  noRawHtml,
} from '../../runtime/rules';

// ── Plugin object ──────────────────────────────────────────────────

export const rules = {
  'no-raw-html': noRawHtml,
  'no-hardcoded-colors': noHardcodedColors,
  'no-db-in-components': noDbInComponents,
  'no-direct-lucide': noDirectLucide,
  'no-motion-literals': noMotionLiterals,
};

/** Standalone plugin reference (for manual wiring) */
export const plugin = { rules };

// ── Pre-built configs ──────────────────────────────────────────────

export const configs = {
  /**
   * Recommended config -- enables all governance rules as errors.
   * Use as-is for strict enforcement, or spread and override individual rules.
   */
  recommended: {
    plugins: {
      '@rottay': { rules },
    },
    rules: {
      '@rottay/no-raw-html': 'error' as const,
      '@rottay/no-hardcoded-colors': 'error' as const,
      '@rottay/no-db-in-components': 'error' as const,
      '@rottay/no-direct-lucide': 'warn' as const,
      '@rottay/no-motion-literals': 'error' as const,
    },
  },

  /**
   * Marketing/landing page config -- relaxes rules that conflict with
   * freeform marketing designs (raw HTML and Tailwind colors are allowed).
   */
  marketing: {
    plugins: {
      '@rottay': { rules },
    },
    rules: {
      '@rottay/no-raw-html': 'off' as const,
      '@rottay/no-hardcoded-colors': ['warn' as const, { allowTailwind: true }],
      '@rottay/no-db-in-components': 'error' as const,
      '@rottay/no-direct-lucide': 'warn' as const,
    },
  },
};
