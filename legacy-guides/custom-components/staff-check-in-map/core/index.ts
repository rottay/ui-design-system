/**
 * StaffCheckInMap - Core Interface
 * Map view with geolocation-based check-in/out tracking
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type StaffCheckInMapPreset = 'map' | 'list';

export interface CheckInRecord {
  id: string;
  staffId: string;
  staffName: string;
  role: string;
  avatar?: string;
  type: 'check-in' | 'check-out';
  timestamp: Date;
  latitude: number;
  longitude: number;
  locationName?: string;
  isWithinGeofence: boolean;
  notes?: string;
}

export interface StaffCheckInMapProps extends EngineAwareProps {
  preset?: StaffCheckInMapPreset;
  records?: CheckInRecord[];
  centerLatitude?: number;
  centerLongitude?: number;
  geofenceRadius?: number;
  onRecordClick?: (id: string) => void;
  onFlagAnomaly?: (id: string) => void;
  className?: string;
  style?: CSSProperties;
}

export const STAFF_CHECK_IN_MAP_DEFAULTS: Partial<StaffCheckInMapProps> = {
  preset: 'map',
};
