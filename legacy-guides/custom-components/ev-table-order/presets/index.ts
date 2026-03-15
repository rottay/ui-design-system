/**
 * EvTableOrder - All Presets
 */

export { TimelineEvTableOrder } from './timeline';
export { GridEvTableOrder } from './grid';

import type { EvTableOrderPreset } from '../core';
import type { ComponentType } from 'react';
import type { EvTableOrderProps } from '../core';
import { TimelineEvTableOrder } from './timeline';
import { GridEvTableOrder } from './grid';

export const EV_TABLE_ORDER_PRESETS: Record<EvTableOrderPreset, ComponentType<EvTableOrderProps>> = {
  timeline: TimelineEvTableOrder,
  grid: GridEvTableOrder,
};
