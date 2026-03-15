/**
 * EvServiceStation - Core Interface
 * Service points (bars, food trucks, merch) with queue, wait times, and stock indicators
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type EvServiceStationPreset = 'map' | 'operations';

export interface ServicePoint {
  id: string;
  name: string;
  type: 'bar' | 'food-truck' | 'merch' | 'vip-bar' | 'water-station';
  x: number;
  y: number;
  status: 'open' | 'busy' | 'closed' | 'paused';
  queueLength: number;
  estimatedWaitMinutes: number;
  staffCount: number;
  staffAssigned: string[];
  lowStockItems: string[];
  revenue: number;
  ordersPerHour: number;
}

export interface EvServiceStationProps extends EngineAwareProps {
  preset?: EvServiceStationPreset;
  stations?: ServicePoint[];
  onStationClick?: (stationId: string) => void;
  onStaffAssign?: (stationId: string, staffId: string) => void;
  onStatusChange?: (stationId: string, status: ServicePoint['status']) => void;
  className?: string;
  style?: CSSProperties;
}

export const EV_SERVICE_STATION_DEFAULTS: Partial<EvServiceStationProps> = {
  preset: 'map',
};
