/**
 * FeatureGrid Presets
 */

import type { FeatureGridPreset } from '../core';
import { GridFeatureGrid } from './grid';
import { ListFeatureGrid } from './list';
import { BentoFeatureGrid } from './bento';

export const PRESETS: Record<FeatureGridPreset, React.ComponentType<any>> = {
  grid: GridFeatureGrid,
  list: ListFeatureGrid,
  bento: BentoFeatureGrid,
};
