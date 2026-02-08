/**
 * BhSkillGapMap - Main Export
 * Dimension heatmap for gap distributions
 */

import type { BhSkillGapMapProps } from './core';
import { BH_SKILL_GAP_MAP_DEFAULTS } from './core';
import { BH_SKILL_GAP_MAP_PRESETS } from './presets';

export { type BhSkillGapMapProps, type BhSkillGapMapPreset, type SkillGapItem, type DimensionHeatmapCell, type GapSummary, type GapPriority, BH_SKILL_GAP_MAP_DEFAULTS } from './core';
export * from './presets';

export function BhSkillGapMap(props: BhSkillGapMapProps): React.ReactElement {
  const preset = props.preset ?? BH_SKILL_GAP_MAP_DEFAULTS.preset ?? 'heatmap';
  const PresetComponent = BH_SKILL_GAP_MAP_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhSkillGapMap.displayName = 'BhSkillGapMap';

export { HeatmapBhSkillGapMap, ListBhSkillGapMap } from './presets';
