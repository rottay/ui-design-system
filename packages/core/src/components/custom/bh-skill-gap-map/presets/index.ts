/**
 * BhSkillGapMap - All Presets
 */

import type { BhSkillGapMapPreset } from '../core';
import { HeatmapBhSkillGapMap } from './heatmap';
import { ListBhSkillGapMap } from './list';

export { HeatmapBhSkillGapMap } from './heatmap';
export { ListBhSkillGapMap } from './list';

export const BH_SKILL_GAP_MAP_PRESETS: Record<BhSkillGapMapPreset, React.ComponentType<any>> = {
  heatmap: HeatmapBhSkillGapMap,
  list: ListBhSkillGapMap,
};
