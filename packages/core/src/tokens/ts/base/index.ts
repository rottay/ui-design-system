/**
 * Base Tokens Index - TypeScript
 *
 * Central export file for all base design tokens.
 * Import from this file to access all foundational design tokens.
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

// Combined base tokens export
export const baseTokens = {
  colors,
  spacing,
  typography,
  shadows,
  borders,
  zIndices,
} as const;

export default baseTokens;
