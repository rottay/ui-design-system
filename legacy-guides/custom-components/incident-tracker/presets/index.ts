import type { IncidentTrackerPreset, IncidentTrackerProps } from '../core';
import type { ComponentType } from 'react';
import { BoardIncidentTracker } from './board';
import { TableIncidentTracker } from './table';
import { DetailIncidentTracker } from './detail';

export { BoardIncidentTracker } from './board';
export { TableIncidentTracker } from './table';
export { DetailIncidentTracker } from './detail';

export const INCIDENT_TRACKER_PRESETS: Record<IncidentTrackerPreset, ComponentType<IncidentTrackerProps>> = {
  board: BoardIncidentTracker,
  table: TableIncidentTracker,
  detail: DetailIncidentTracker,
};
