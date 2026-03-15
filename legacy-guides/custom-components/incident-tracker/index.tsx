import type { IncidentTrackerProps } from './core';
import { INCIDENT_TRACKER_DEFAULTS } from './core';
import { INCIDENT_TRACKER_PRESETS } from './presets';

export { type IncidentTrackerProps, type IncidentTrackerPreset, type Incident, type IncidentUpdate, type IncidentSeverity, type IncidentStatus, INCIDENT_TRACKER_DEFAULTS } from './core';
export { getIncidentSeverityColors, getIncidentStatusColors } from './core';
export * from './presets';

export function IncidentTracker(props: IncidentTrackerProps): React.ReactElement {
  const preset = props.preset ?? INCIDENT_TRACKER_DEFAULTS.preset ?? 'board';
  const PresetComponent = INCIDENT_TRACKER_PRESETS[preset];
  return <PresetComponent {...props} />;
}

IncidentTracker.displayName = 'IncidentTracker';
export { BoardIncidentTracker, TableIncidentTracker, DetailIncidentTracker } from './presets';
