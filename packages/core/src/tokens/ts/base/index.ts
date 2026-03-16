/**
 * @fileoverview Barrel for foundational design tokens.
 *
 * Base tokens are the lowest layer in the token hierarchy. They define
 * global primitives (color scales, spacing grid, font stacks, shadow
 * elevations, border styles, and z-index layers) that component tokens
 * and tenant overrides build upon.
 */

// Individual token exports
export * from './colors';
export * from './spacing';
export * from './typography';
export * from './shadows';
export * from './borders';
export * from './zIndex';

// Named imports for grouped exports
import { colors } from './colors';
import { spacing } from './spacing';
import { typography } from './typography';
import { shadows } from './shadows';
import { borders } from './borders';
import { zIndices } from './zIndex';

/** Grouped aggregate of all base token categories. */
export const baseTokens = {
  colors,
  spacing,
  typography,
  shadows,
  borders,
  zIndices,
} as const;

export default baseTokens;
