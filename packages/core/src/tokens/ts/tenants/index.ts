/**
 * @fileoverview Barrel for tenant-specific token overrides.
 *
 * Tenant tokens provide brand-specific CSS variable references that sit on top
 * of the base token layer. Currently only ships the Rottay (default) tenant.
 * Additional tenants (BitHire, Evnto) apply their overrides via CSS class
 * scoping at runtime rather than through this TS layer.
 */

// Individual tenant token exports
export * from './rottay';

// Named imports for grouped exports
import { rottayTokens } from './rottay';

// Combined tenant tokens export
export const tenantTokens = {
  rottay: rottayTokens,
} as const;

export default tenantTokens;
