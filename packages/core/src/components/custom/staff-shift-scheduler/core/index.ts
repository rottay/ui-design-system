/**
 * StaffShiftScheduler - Core Interface
 * Calendar view for shift management with drag-drop assignment
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type StaffShiftSchedulerPreset = 'calendar' | 'list';

export interface ShiftAssignment {
  id: string;
  staffId: string;
  staffName: string;
  role: string;
  color?: string;
}

export interface StaffShift {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  location?: string;
  requiredStaff: number;
  assignments: ShiftAssignment[];
  status: 'draft' | 'published' | 'in-progress' | 'completed';
}

export interface StaffShiftSchedulerProps extends EngineAwareProps {
  preset?: StaffShiftSchedulerPreset;
  shifts?: StaffShift[];
  weekStart?: Date;
  onShiftClick?: (id: string) => void;
  onAssign?: (shiftId: string, staffId: string) => void;
  onCreateShift?: (date: string) => void;
  onWeekChange?: (start: Date) => void;
  className?: string;
  style?: CSSProperties;
}

export const STAFF_SHIFT_SCHEDULER_DEFAULTS: Partial<StaffShiftSchedulerProps> = {
  preset: 'calendar',
};
