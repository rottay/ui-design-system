/**
 * Utility Functions
 *
 * Provides common utilities for the design system
 */

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
