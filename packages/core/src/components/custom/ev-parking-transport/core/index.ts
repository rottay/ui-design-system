import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type ParkingTransportPreset = 'overview' | 'wayfinding';

export interface ParkingLot {
  id: string;
  name: string;
  type: 'general' | 'vip' | 'disabled' | 'staff';
  capacity: number;
  occupied: number;
  status: 'open' | 'full' | 'closed';
}

export interface ShuttleRoute {
  id: string;
  name: string;
  stops: string[];
  frequency: number;
  activeShuttles: number;
  estimatedWait: number;
}

export interface RideshareZone {
  id: string;
  name: string;
  x: number;
  y: number;
  activeDrivers: number;
  surgeMultiplier: number;
}

export interface ParkingTransportProps extends EngineAwareProps {
  preset?: ParkingTransportPreset;
  lots?: ParkingLot[];
  shuttles?: ShuttleRoute[];
  rideshareZones?: RideshareZone[];
  onLotClick?: (lotId: string) => void;
  onRouteClick?: (routeId: string) => void;
  style?: CSSProperties;
  className?: string;
}

export const PARKING_TRANSPORT_DEFAULTS: Required<
  Pick<ParkingTransportProps, 'preset' | 'lots' | 'shuttles' | 'rideshareZones'>
> = {
  preset: 'overview',
  lots: [],
  shuttles: [],
  rideshareZones: [],
};
