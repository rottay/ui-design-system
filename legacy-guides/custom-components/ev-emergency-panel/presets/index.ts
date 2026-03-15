/**
 * EvEmergencyPanel - All Presets
 */

export { ControlEvEmergencyPanel } from './control';
export { MonitorEvEmergencyPanel } from './monitor';

import type { EvEmergencyPanelPreset } from '../core';
import type { ComponentType } from 'react';
import type { EvEmergencyPanelProps } from '../core';
import { ControlEvEmergencyPanel } from './control';
import { MonitorEvEmergencyPanel } from './monitor';

export const EV_EMERGENCY_PANEL_PRESETS: Record<EvEmergencyPanelPreset, ComponentType<EvEmergencyPanelProps>> = {
  control: ControlEvEmergencyPanel,
  monitor: MonitorEvEmergencyPanel,
};
