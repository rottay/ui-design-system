/**
 * EvShiftScheduler - Core Interface
 * Shift scheduling calendar
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type EvShiftSchedulerPreset = 'calendar' | 'timeline';

export interface ShiftBlock {
  id: string;
  staffName: string;
  staffId: string;
  role: string;
  startTime: Date;
  endTime: Date;
  status: "draft" | "published" | "confirmed" | "completed";
  color: string;
}

export interface ShiftRequirement {
  role: string;
  required: number;
  assigned: number;
  date: Date;
}

export interface EvShiftSchedulerProps extends EngineAwareProps {
  preset?: EvShiftSchedulerPreset;
  shifts?: ShiftBlock[];
  requirements?: ShiftRequirement[];
  selectedDate?: Date;
  onShiftClick?: (shiftId: string) => void;
  onDateChange?: (date: Date) => void;
  onAssignStaff?: (shiftId: string, staffId: string) => void;
  className?: string;
  style?: CSSProperties;
}

export const EV_SHIFT_SCHEDULER_DEFAULTS: Partial<EvShiftSchedulerProps> = {
  preset: 'calendar',

};
