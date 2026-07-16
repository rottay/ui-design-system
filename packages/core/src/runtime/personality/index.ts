/**
 * @fileoverview Personality System - Rottay Design System
 * @description Public barrel for the personality subsystem. Exports CSS
 * variable resolvers, component-level personality defaults, and the baseline
 * `DEFAULT_PERSONALITY` tokens. Consumers access everything they need for
 * personality-aware styling from this single path.
 *
 * @module System/Personality
 * @category System
 * @package @rottay/design-system
 */
export * from './primitives';
export { DEFAULT_PERSONALITY } from './defaults';
export { resolveChartPersonality } from './chart-personality';
export type { ChartPersonalityResolutionInput } from './chart-personality';
export { useResolvedChartPersonality } from './useResolvedChartPersonality';
