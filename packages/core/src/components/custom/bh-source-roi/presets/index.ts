/**
 * BhSourceRoi - All Presets
 */

export { SummaryBhSourceRoi } from './summary';
export { BreakdownBhSourceRoi } from './breakdown';

import type { BhSourceRoiPreset } from '../core';
import type { ComponentType } from 'react';
import type { BhSourceRoiProps } from '../core';
import { SummaryBhSourceRoi } from './summary';
import { BreakdownBhSourceRoi } from './breakdown';

export const BH_SOURCE_ROI_PRESETS: Record<BhSourceRoiPreset, ComponentType<BhSourceRoiProps>> = {
  summary: SummaryBhSourceRoi,
  breakdown: BreakdownBhSourceRoi,
};
