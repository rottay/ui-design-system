import type { IncidentTrackerPreset } from '../core';
import { BoardIncidentTracker } from './board';
import { TableIncidentTracker } from './table';
import { DetailIncidentTracker } from './detail';

export { BoardIncidentTracker } from './board';
export { TableIncidentTracker } from './table';
export { DetailIncidentTracker } from './detail';

export const INCIDENT_TRACKER_PRESETS: Record<IncidentTrackerPreset, React.ComponentType<any>> = {
  board: BoardIncidentTracker,
  table: TableIncidentTracker,
  detail: DetailIncidentTracker,
};
