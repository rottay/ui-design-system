/**
 * @fileoverview Public entry point for vertical presets.
 *
 * Verticals are the DS-owned fallback layer for product domains such as events,
 * recruiting, or platform admin. They bundle engine preference, personality
 * tokens, density, and surface defaults into a single configuration object.
 */

export type { VerticalKey } from '../../../../foundation/contracts/kernel/verticals';
export type { VerticalPreset } from '../../../../foundation/contracts/composition/tenants';
export { VERTICAL_REGISTRY, getVerticalPreset } from '@/foundation/presets/verticals';
