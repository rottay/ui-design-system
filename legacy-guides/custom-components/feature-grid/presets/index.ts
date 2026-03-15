/**
 * FeatureGrid Presets
 */

import type { FeatureGridPreset, FeatureGridProps } from '../core';
import type { ComponentType } from 'react';
import { GridFeatureGrid } from './grid';
import { ListFeatureGrid } from './list';
import { BentoFeatureGrid } from './bento';

export const PRESETS: Record<FeatureGridPreset, ComponentType<FeatureGridProps>> = {
  grid: GridFeatureGrid,
  list: ListFeatureGrid,
  bento: BentoFeatureGrid,
};
