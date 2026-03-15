/**
 * Design Tokens - Rottay Design System
 *
 * Main entry point for all design tokens.
 *
 * This module exports:
 * - Public token mirrors for JS/TS consumers
 *
 * For CSS tokens, import the CSS file directly:
 * import '@rottay/design-system/tokens/css/index.css';
 *
 * Usage Examples:
 *
 * // Import public token mirrors
 * import { colors, spacing, buttonTokens } from '@rottay/design-system/tokens';
 *
 * // Import combined tokens object
 * import { tokens } from '@rottay/design-system/tokens';
 *
 * // Import CSS tokens (in CSS or via bundler)
 * @import '@rottay/design-system/tokens/css/index.css';
 */

// Re-export all TypeScript tokens
export * from './ts';

// Default export
export { default } from './ts';
