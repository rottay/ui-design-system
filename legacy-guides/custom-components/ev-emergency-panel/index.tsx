/**
 * EvEmergencyPanel - Main Export
 * Emergency controls with evacuation, lockdown, PA broadcast, and progress monitoring
 */

import type { EvEmergencyPanelProps } from './core';
import { EV_EMERGENCY_PANEL_DEFAULTS } from './core';
import { EV_EMERGENCY_PANEL_PRESETS } from './presets';

export {
  type EvEmergencyPanelProps,
  type EvEmergencyPanelPreset,
  type EmergencyAction as EvEmergencyPanelEmergencyAction,
  type ZoneEvacuation as EvEmergencyPanelZoneEvacuation,
  EV_EMERGENCY_PANEL_DEFAULTS,
} from './core';
export * from './presets';

export function EvEmergencyPanel(props: EvEmergencyPanelProps): React.ReactElement {
  const preset = props.preset ?? EV_EMERGENCY_PANEL_DEFAULTS.preset ?? 'control';
  const PresetComponent = EV_EMERGENCY_PANEL_PRESETS[preset];
  return <PresetComponent {...props} />;
}

EvEmergencyPanel.displayName = 'EvEmergencyPanel';

export { ControlEvEmergencyPanel, MonitorEvEmergencyPanel } from './presets';
