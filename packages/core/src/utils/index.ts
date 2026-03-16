/**
 * @fileoverview Public barrel for shared utility helpers.
 *
 * Exports compound component helpers, runtime logging, performance comparators,
 * math functions, and WCAG accessibility utilities. All helpers are pure and
 * reusable -- React-context-dependent logic belongs elsewhere.
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
