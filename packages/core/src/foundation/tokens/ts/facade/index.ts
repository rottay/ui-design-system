/**
 * @fileoverview Aggregator for all TypeScript design tokens.
 *
 * Tokens are organized into four categories:
 *
 * - **Base** -- Foundational primitives: colors, spacing (4px grid), typography,
 *   shadows, borders, and z-index layering.
 * - **Components** -- Per-component token objects (e.g. `buttonTokens`, `cardTokens`)
 *   covering sizes, variants, states, and transitions.
 * - **Tenant Mirrors** -- Reference mirrors of CSS variable handles (`var(--ds-*)`).
 *   Useful for component code and discovery, but NOT authored sources: a
 *   first-party vertical is the neutral foundation plus its preset document.
 *
 * The combined `tokens` default export nests all tiers for exploratory use.
 * Most consumers should prefer direct named imports for tree-shaking.
 */

// Export all individual tokens
export * from '../foundation/base';
export * from '../runtime/components';
export * from '../../../presets/verticals/roster';
export * from '../runtime/mirrors';

// Named imports for combined export
import { baseTokens } from '../foundation/base';
import { componentTokens } from '../runtime/components';
import { tenantTokens } from '../runtime/mirrors';

/** Nested aggregate of all token tiers for discovery and runtime introspection. */
export const tokens = {
  base: baseTokens,
  components: componentTokens,
  /** Reference mirrors of CSS variable handles (not authored sources). */
  tenantMirrors: tenantTokens,
  /** @deprecated Use `tenantMirrors` — kept for backward compatibility. */
  tenants: tenantTokens,
} as const;

export default tokens;
