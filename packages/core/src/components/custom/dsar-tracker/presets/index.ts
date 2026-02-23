/**
 * DsarTracker - All Presets
 */

import type { DsarTrackerPreset, DsarTrackerProps } from '../core';
import type { ComponentType } from 'react';
import { BoardDsarTracker } from './board';
import { TableDsarTracker } from './table';
import { DetailDsarTracker } from './detail';

export { BoardDsarTracker } from './board';
export { TableDsarTracker } from './table';
export { DetailDsarTracker } from './detail';

export const DSAR_TRACKER_PRESETS: Record<DsarTrackerPreset, ComponentType<DsarTrackerProps>> = {
  board: BoardDsarTracker,
  table: TableDsarTracker,
  detail: DetailDsarTracker,
};
