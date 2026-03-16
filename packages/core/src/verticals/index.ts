/**
 * @fileoverview Public entry point for vertical presets.
 *
 * Verticals are the DS-owned fallback layer for product domains such as events,
 * recruiting, or platform admin. They bundle engine preference, personality
 * tokens, density, and surface defaults into a single configuration object.
 */

export type { VerticalKey, VerticalPreset } from './types';
export { VERTICAL_REGISTRY, getVerticalPreset } from './registry';
