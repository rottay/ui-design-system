/**
 * Design Tokens - TypeScript
 *
 * Main entry point for all TypeScript design tokens.
 * Import from this file to get access to the complete token system.
 *
 * Token Categories:
 * - Base: Foundational tokens (colors, spacing, typography, shadows, borders, z-index)
 * - Components: Component-specific tokens (avatar, button, input, card, modal)
 * - Tenants: Brand-specific customizations (rottay)
 *
 * Usage:
 * import { colors, spacing, buttonTokens } from '@rottay/design-system/tokens';
 * import { tokens } from '@rottay/design-system/tokens';
 */

// Export all individual tokens
export * from './base';
export * from './components';
export * from './tenants';

// Named imports for combined export
import { baseTokens } from './base';
import { componentTokens } from './components';
import { tenantTokens } from './tenants';

// Combined tokens export
export const tokens = {
  base: baseTokens,
  components: componentTokens,
  tenants: tenantTokens,
} as const;

export default tokens;
