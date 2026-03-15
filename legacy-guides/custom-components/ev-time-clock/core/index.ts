/**
 * EvTimeClock - Core Interface
 * Staff check-in/out time clock
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type EvTimeClockPreset = 'standard' | 'kiosk';

export interface ClockEntry {
  id: string;
  staffName: string;
  checkInTime: Date;
  checkOutTime?: Date;
  breakMinutes: number;
  totalMinutes: number;
  status: "clocked-in" | "on-break" | "clocked-out";
}

export interface ShiftInfo {
  shiftName: string;
  role: string;
  scheduledStart: Date;
  scheduledEnd: Date;
  location: string;
}

export interface EvTimeClockProps extends EngineAwareProps {
  preset?: EvTimeClockPreset;
  currentEntry?: ClockEntry;
  recentEntries?: ClockEntry[];
  shiftInfo?: ShiftInfo;
  onClockIn?: () => void;
  onClockOut?: () => void;
  onStartBreak?: () => void;
  onEndBreak?: () => void;
  className?: string;
  style?: CSSProperties;
}

export const EV_TIME_CLOCK_DEFAULTS: Partial<EvTimeClockProps> = {
  preset: 'standard',

};
