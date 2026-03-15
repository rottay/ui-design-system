/**
 * EvIncidentManager - All Presets
 */

export { DispatchEvIncidentManager } from './dispatch';
export { MapEvIncidentManager } from './map';

import type { EvIncidentManagerPreset } from '../core';
import type { ComponentType } from 'react';
import type { EvIncidentManagerProps } from '../core';
import { DispatchEvIncidentManager } from './dispatch';
import { MapEvIncidentManager } from './map';

export const EV_INCIDENT_MANAGER_PRESETS: Record<EvIncidentManagerPreset, ComponentType<EvIncidentManagerProps>> = {
  dispatch: DispatchEvIncidentManager,
  map: MapEvIncidentManager,
};
