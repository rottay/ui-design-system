/**
 * @fileoverview Internal entry point for the design token system.
 *
 * The token layer is the single source of truth for all visual values in the DS.
 * Tokens are maintained in two parallel formats:
 *
 * - **CSS custom properties** (`tokens/css/`) -- consumed by stylesheets and
 *   CSS-in-JS at runtime. The bundled, public way to ship them to a consumer
 *   app is via one of the `@rottay/design-system/styles*` subpaths (full
 *   bundle, per-vertical, or per-engine).
 *
 * - **TypeScript mirrors** (`tokens/ts/`) -- provide type-safe references to
 *   the same CSS variables for use in component logic, inline styles, and
 *   test utilities. These value objects are package-internal: they are not
 *   re-exported from the package root and there is no
 *   `@rottay/design-system/tokens` subpath in `package.json`.
 *
 * For React consumers, the public way to read resolved tokens is the
 * `useTokens()` hook re-exported from the package root.
 *
 * Both formats reference the same `--ds-*` custom properties so they are
 * always in sync -- the CSS file defines values, the TS file provides handles.
 */

// TypeScript token definitions (canonical source)
export * from './ts';

/** @deprecated Geist-based typography scale. Moved to tokens/compat/. */
export { typographyScale } from './compat/typography-scale';
