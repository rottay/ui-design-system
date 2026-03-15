/**
 * Vertical Presets System
 *
 * Industry-specific configuration bundles for Rottay applications.
 * Each vertical maps to a product domain (events, recruiting, admin)
 * and provides a complete set of design system defaults.
 */

export type { VerticalKey, VerticalPreset } from './types';
export { VERTICAL_REGISTRY, getVerticalPreset } from './registry';
