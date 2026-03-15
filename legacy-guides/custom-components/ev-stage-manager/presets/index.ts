/**
 * EvStageManager - All Presets
 */

export { VisualEvStageManager } from './visual';
export { TableEvStageManager } from './table';

import type { EvStageManagerPreset } from '../core';
import type { ComponentType } from 'react';
import type { EvStageManagerProps } from '../core';
import { VisualEvStageManager } from './visual';
import { TableEvStageManager } from './table';

export const EV_STAGE_MANAGER_PRESETS: Record<EvStageManagerPreset, ComponentType<EvStageManagerProps>> = {
  visual: VisualEvStageManager,
  table: TableEvStageManager,
};
