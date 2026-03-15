/**
 * EvZoneCapacity - Core Interface
 * Zone capacity monitoring
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type EvZoneCapacityPreset = 'map' | 'dashboard';

export interface ZoneInfo {
  id: string;
  name: string;
  currentCount: number;
  capacity: number;
  percentage: number;
  status: "normal" | "warning" | "critical" | "closed";
  color: string;
}

export interface FlowData {
  zoneId: string;
  entriesPerMinute: number;
  exitsPerMinute: number;
  netFlow: number;
}

export interface EvZoneCapacityProps extends EngineAwareProps {
  preset?: EvZoneCapacityPreset;
  zones?: ZoneInfo[];
  flowData?: FlowData[];
  onZoneClick?: (zoneId: string) => void;
  onSetThreshold?: (zoneId: string, threshold: number) => void;
  className?: string;
  style?: CSSProperties;
}

export const EV_ZONE_CAPACITY_DEFAULTS: Partial<EvZoneCapacityProps> = {
  preset: 'map',

};
