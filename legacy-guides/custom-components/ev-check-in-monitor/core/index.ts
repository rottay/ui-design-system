/**
 * EvCheckInMonitor - Core Interface
 * Real-time check-in monitoring
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type EvCheckInMonitorPreset = 'dashboard' | 'map';

export interface CheckInStat {
  label: string;
  value: number;
  total: number;
  rate: number;
}

export interface ZoneHeat {
  zoneId: string;
  zoneName: string;
  currentCount: number;
  capacity: number;
  heatLevel: "low" | "medium" | "high" | "critical";
}

export interface EntryPoint {
  id: string;
  name: string;
  entriesPerMinute: number;
  status: "active" | "idle" | "closed";
}

export interface EvCheckInMonitorProps extends EngineAwareProps {
  preset?: EvCheckInMonitorPreset;
  stats?: CheckInStat[];
  zones?: ZoneHeat[];
  entryPoints?: EntryPoint[];
  flowRate?: number;
  onZoneClick?: (zoneId: string) => void;
  className?: string;
  style?: CSSProperties;
}

export const EV_CHECK_IN_MONITOR_DEFAULTS: Partial<EvCheckInMonitorProps> = {
  preset: 'dashboard',

};
