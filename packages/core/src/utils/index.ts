/**
 * Utility Functions
 *
 * Provides common utilities for the design system.
 * Merged from core/utils and shared/utils.
 */

// Compound component helpers
export {
  createSubComponent,
  createCompoundComponent,
} from './compound';
export type { PolymorphicProps } from './compound';

// Runtime logging helpers
export { warnInDev, warnOnceInDev, errorInDev } from './runtime-logger';

// Performance utilities
export { arePropsEqual, createPropsComparator } from './performance';

// Math utilities
export { clamp, lerp, normalize, remap, roundTo, range } from './math';

// Accessibility utilities
export {
  contrastRatio,
  meetsContrastLevel,
  getContrastingTextColor,
  checkColorAccessibility,
} from './accessibility';
export type { ColorAccessibilityReport } from './accessibility';
