/**
 * BhRequisitionTreemap - All Presets
 */

import type { BhRequisitionTreemapPreset, BhRequisitionTreemapProps } from '../core';
import type { ComponentType } from 'react';
import { StandardBhRequisitionTreemap } from './standard';

export { StandardBhRequisitionTreemap } from './standard';

export const BH_REQUISITION_TREEMAP_PRESETS: Record<BhRequisitionTreemapPreset, ComponentType<BhRequisitionTreemapProps>> = {
  standard: StandardBhRequisitionTreemap,
};
