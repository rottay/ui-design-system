/**
 * @fileoverview Tenant token reference mirrors.
 *
 * These are NOT authored premium sources — that role belongs to
 * `tokens/ts/brand-themes/`. This directory contains typed catalogs of
 * CSS variable references (`var(--ds-*)`) for discovery and component code.
 *
 * Currently only ships the Rottay reference mirror. Other tenants apply
 * their overrides via CSS class scoping at runtime.
 *
 * @see tokens/ts/brand-themes/ — the canonical authored premium source
 */

// Individual tenant reference mirrors
export * from './rottay';

// Named imports for grouped exports
import { rottayTokens } from './rottay';

// Combined tenant tokens export (reference mirrors only)
export const tenantTokens = {
  rottay: rottayTokens,
} as const;

export default tenantTokens;
