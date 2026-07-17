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
export * from '@/foundation/tokens/ts/runtime/personality';
export { DEFAULT_PERSONALITY } from '../foundation/defaults';
export { resolveChartPersonality } from '../runtime/resolution/chart';
export type { ChartPersonalityResolutionInput } from '../runtime/resolution/chart';
export { useResolvedChartPersonality } from '../presentation/resolution/chart-personality';
