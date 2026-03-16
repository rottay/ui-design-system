/**
 * @fileoverview Public entry point for the design token system.
 *
 * The token layer is the single source of truth for all visual values in the DS.
 * Tokens are maintained in two parallel formats:
 *
 * - **CSS custom properties** (`tokens/css/`) -- consumed by stylesheets and
 *   CSS-in-JS at runtime. Import the CSS entry directly:
 *   `import '@rottay/design-system/tokens/css/index.css';`
 *
 * - **TypeScript mirrors** (`tokens/ts/`) -- provide type-safe references to
 *   the same CSS variables for use in component logic, inline styles, and
 *   test utilities. Import from this file:
 *   `import { colors, spacing, buttonTokens } from '@rottay/design-system/tokens';`
 *
 * Both formats reference the same `--ds-*` custom properties so they are
 * always in sync -- the CSS file defines values, the TS file provides handles.
 */

// TypeScript token definitions (canonical source)
export * from './ts';

/** Geist-based typography scale with hardcoded rem values for direct style application. */
export { typographyScale } from './typography-scale';
