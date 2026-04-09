/**
 * @fileoverview Aggregator for all TypeScript design tokens.
 *
 * Tokens are organized into three tiers:
 *
 * - **Base** -- Foundational primitives: colors, spacing (4px grid), typography,
 *   shadows, borders, and z-index layering.
 * - **Components** -- Per-component token objects (e.g. `buttonTokens`, `cardTokens`)
 *   covering sizes, variants, states, and transitions.
 * - **Tenants** -- Brand-specific overrides. Currently ships `rottayTokens` only;
 *   additional tenant token sets are loaded at runtime via CSS class scoping.
 *
 * The combined `tokens` default export nests all three tiers for exploratory use.
 * Most consumers should prefer direct named imports for tree-shaking.
 */

// Export all individual tokens
export * from './base';
export * from './components';
export * from './tenants';
export * from './brand-themes';

// Named imports for combined export
import { baseTokens } from './base';
import { componentTokens } from './components';
import { tenantTokens } from './tenants';

/** Nested aggregate of all token tiers for discovery and runtime introspection. */
export const tokens = {
  base: baseTokens,
  components: componentTokens,
  tenants: tenantTokens,
} as const;

export default tokens;
