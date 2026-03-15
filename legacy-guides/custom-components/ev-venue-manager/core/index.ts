/**
 * EvVenueManager - Core Interface
 * Venue manager dashboard
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type EvVenueManagerPreset = 'overview' | 'analytics';

export interface VenueInfo {
  id: string;
  name: string;
  address: string;
  totalCapacity: number;
  currentOccupancy: number;
  zonesCount: number;
  status: "open" | "closed" | "maintenance";
}

export interface ZoneStatus {
  id: string;
  name: string;
  capacity: number;
  currentCount: number;
  accessLevel: string;
  isActive: boolean;
}

export interface StageInfo {
  id: string;
  name: string;
  zone: string;
  isActive: boolean;
  currentAct?: string;
  nextAct?: string;
  nextTime?: Date;
}

export interface VenueAlert {
  id: string;
  type: "capacity" | "maintenance" | "security" | "weather";
  message: string;
  severity: "low" | "medium" | "high";
  time: Date;
}

export interface EvVenueManagerProps extends EngineAwareProps {
  preset?: EvVenueManagerPreset;
  venue?: VenueInfo;
  zones?: ZoneStatus[];
  stages?: StageInfo[];
  alerts?: VenueAlert[];
  onZoneClick?: (zoneId: string) => void;
  onAlertDismiss?: (alertId: string) => void;
  className?: string;
  style?: CSSProperties;
}

export const EV_VENUE_MANAGER_DEFAULTS: Partial<EvVenueManagerProps> = {
  preset: 'overview',

};
