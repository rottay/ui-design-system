/**
 * BhSkillGapMap - All Presets
 */

import type { BhSkillGapMapPreset, BhSkillGapMapProps } from '../core';
import type { ComponentType } from 'react';
import { HeatmapBhSkillGapMap } from './heatmap';
import { ListBhSkillGapMap } from './list';

export { HeatmapBhSkillGapMap } from './heatmap';
export { ListBhSkillGapMap } from './list';

export const BH_SKILL_GAP_MAP_PRESETS: Record<BhSkillGapMapPreset, ComponentType<BhSkillGapMapProps>> = {
  heatmap: HeatmapBhSkillGapMap,
  list: ListBhSkillGapMap,
};
