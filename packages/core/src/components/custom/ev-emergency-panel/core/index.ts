/**
 * EvEmergencyPanel - Core Interface
 * Emergency controls with evacuation, lockdown, PA broadcast, and progress monitoring
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type EvEmergencyPanelPreset = 'control' | 'monitor';

export interface EmergencyAction {
  id: string;
  type: 'evacuate-zone' | 'evacuate-all' | 'lockdown' | 'pa-broadcast' | 'medical-alert' | 'fire-alarm';
  label: string;
  description: string;
  active: boolean;
  activatedAt?: Date;
  activatedBy?: string;
}

export interface ZoneEvacuation {
  zoneId: string;
  zoneName: string;
  totalCapacity: number;
  currentOccupancy: number;
  evacuated: number;
  percentComplete: number;
  exits: { name: string; status: 'open' | 'blocked' | 'congested' }[];
}

export interface EvEmergencyPanelProps extends EngineAwareProps {
  preset?: EvEmergencyPanelPreset;
  actions?: EmergencyAction[];
  zones?: ZoneEvacuation[];
  headcount?: { total: number; accounted: number; missing: number };
  onActivate?: (actionId: string) => void;
  onDeactivate?: (actionId: string) => void;
  onBroadcast?: (message: string) => void;
  className?: string;
  style?: CSSProperties;
}

export const EV_EMERGENCY_PANEL_DEFAULTS: Partial<EvEmergencyPanelProps> = {
  preset: 'control',
};
