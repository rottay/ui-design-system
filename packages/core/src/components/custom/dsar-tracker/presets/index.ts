/**
 * DsarTracker - All Presets
 */

import type { DsarTrackerPreset } from '../core';
import { BoardDsarTracker } from './board';
import { TableDsarTracker } from './table';
import { DetailDsarTracker } from './detail';

export { BoardDsarTracker } from './board';
export { TableDsarTracker } from './table';
export { DetailDsarTracker } from './detail';

export const DSAR_TRACKER_PRESETS: Record<DsarTrackerPreset, React.ComponentType<any>> = {
  board: BoardDsarTracker,
  table: TableDsarTracker,
  detail: DetailDsarTracker,
};
