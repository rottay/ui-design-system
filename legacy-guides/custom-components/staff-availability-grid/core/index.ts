/**
 * StaffAvailabilityGrid - Core Interface
 * Weekly availability grid per staff member
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type StaffAvailabilityGridPreset = 'grid' | 'compact';

export interface AvailabilitySlot {
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  startTime: string;
  endTime: string;
  type: 'available' | 'preferred' | 'unavailable';
}

export interface StaffAvailabilityEntry {
  id: string;
  staffId: string;
  staffName: string;
  role: string;
  avatar?: string;
  slots: AvailabilitySlot[];
}

export interface StaffAvailabilityGridProps extends EngineAwareProps {
  preset?: StaffAvailabilityGridPreset;
  entries?: StaffAvailabilityEntry[];
  weekStart?: Date;
  onSlotClick?: (staffId: string, day: string, hour: number) => void;
  onWeekChange?: (start: Date) => void;
  className?: string;
  style?: CSSProperties;
}

export const STAFF_AVAILABILITY_GRID_DEFAULTS: Partial<StaffAvailabilityGridProps> = {
  preset: 'grid',
};
