/**
 * Design Tokens
 * Token definitions, hooks, and sub-hooks for the design system.
 *
 * For CSS tokens, import the CSS file directly:
 * import '@rottay/design-system/tokens/css/index.css';
 *
 * For TypeScript tokens:
 * import { colors, spacing, buttonTokens } from '@rottay/design-system/tokens';
 */

// Re-export TypeScript token definitions from theme/tokens
export * from '../theme/tokens';

// Export typography scale
export { typographyScale } from './typography-scale';
