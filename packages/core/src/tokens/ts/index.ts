/**
 * @fileoverview Aggregator for all TypeScript design tokens.
 *
 * Tokens are organized into four categories:
 *
 * - **Base** -- Foundational primitives: colors, spacing (4px grid), typography,
 *   shadows, borders, and z-index layering.
 * - **Components** -- Per-component token objects (e.g. `buttonTokens`, `cardTokens`)
 *   covering sizes, variants, states, and transitions.
 * - **Brand Themes** -- Canonical authored premium sources. Each `BrandTheme`
 *   captures the full visual identity (palette, typography, surfaces, motion,
 *   charts, chrome) for a first-party product. These are the SOURCE — tenant
 *   CSS and runtime overrides are derived from them.
 * - **Tenant Mirrors** -- Reference mirrors of CSS variable handles (`var(--ds-*)`).
 *   Useful for component code and discovery, but NOT authored premium sources.
 *   The canonical authored source is `brand-themes/`.
 *
 * The combined `tokens` default export nests all tiers for exploratory use.
 * Most consumers should prefer direct named imports for tree-shaking.
 */

// Export all individual tokens
export * from './base';
export * from './components';
export * from './brand-themes';
export * from './tenants';

// Named imports for combined export
import { baseTokens } from './base';
import { componentTokens } from './components';
import { tenantTokens } from './tenants';
import { rottayBrandTheme, bithireBrandTheme, evntoBrandTheme } from './brand-themes';

/** Nested aggregate of all token tiers for discovery and runtime introspection. */
export const tokens = {
  base: baseTokens,
  components: componentTokens,
  /** Reference mirrors of CSS variable handles (not authored sources). */
  tenantMirrors: tenantTokens,
  /** Canonical authored premium sources. */
  brandThemes: {
    rottay: rottayBrandTheme,
    bithire: bithireBrandTheme,
    evnto: evntoBrandTheme,
  },
} as const;

export default tokens;
