/**
 * Tenant Tokens Index - TypeScript
 *
 * Central export file for all tenant-specific design tokens.
 * Import from this file to access all tenant tokens.
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
