/**
 * EvIncidentManager - Main Export
 * Security, medical, and maintenance incident dispatch with timeline and map views
 */

import type { EvIncidentManagerProps } from './core';
import { EV_INCIDENT_MANAGER_DEFAULTS } from './core';
import { EV_INCIDENT_MANAGER_PRESETS } from './presets';

export {
  type EvIncidentManagerProps,
  type EvIncidentManagerPreset,
  type Incident as EvIncidentManagerIncident,
  type IncidentAction as EvIncidentManagerIncidentAction,
  EV_INCIDENT_MANAGER_DEFAULTS,
} from './core';
export * from './presets';

export function EvIncidentManager(props: EvIncidentManagerProps): React.ReactElement {
  const preset = props.preset ?? EV_INCIDENT_MANAGER_DEFAULTS.preset ?? 'dispatch';
  const PresetComponent = EV_INCIDENT_MANAGER_PRESETS[preset];
  return <PresetComponent {...props} />;
}

EvIncidentManager.displayName = 'EvIncidentManager';

export { DispatchEvIncidentManager, MapEvIncidentManager } from './presets';
