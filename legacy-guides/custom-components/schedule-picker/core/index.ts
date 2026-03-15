import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DesignTokens } from '../../../../core/types/tokens';

export type SchedulePickerPreset = 'booking' | 'compact';

export type TimePeriod = 'morning' | 'afternoon' | 'evening';

export interface SessionDuration {
  label: string;
  minutes: number;
}

export interface TimeSlot {
  time: string;
  period: TimePeriod;
  available: boolean;
}

export interface DayAvailability {
  date: string;
  slots: TimeSlot[];
}

export interface SchedulePickerProps extends EngineAwareProps {
  preset?: SchedulePickerPreset;
  availability: DayAvailability[];
  selectedDate?: string;
  selectedSlot?: string;
  onDateSelect?: (date: string) => void;
  onSlotSelect?: (time: string) => void;
  onConfirm?: () => void;
  durations?: SessionDuration[];
  selectedDuration?: number;
  onDurationChange?: (minutes: number) => void;
  timezone?: string;
  month?: number;
  year?: number;
  onMonthChange?: (month: number, year: number) => void;
  title?: string;
  subtitle?: string;
  confirmLabel?: string;
  loading?: boolean;
  className?: string;
  style?: CSSProperties;
}

export const SCHEDULE_PICKER_DEFAULTS: Partial<SchedulePickerProps> = {
  preset: 'booking',
  confirmLabel: 'Confirm booking',
  title: 'Schedule a session',
};

export function groupSlotsByPeriod(slots: TimeSlot[]): Record<TimePeriod, TimeSlot[]> {
  return {
    morning: slots.filter(s => s.period === 'morning'),
    afternoon: slots.filter(s => s.period === 'afternoon'),
    evening: slots.filter(s => s.period === 'evening'),
  };
}

export function getSlotColors(tokens: DesignTokens) {
  return {
    available: {
      color: tokens.colors.neutral[700],
      bgColor: tokens.colors.common.white,
      border: tokens.colors.neutral[200],
    },
    selected: {
      color: tokens.colors.common.white,
      bgColor: tokens.colors.primaryScale[500],
      border: tokens.colors.primaryScale[500],
    },
    unavailable: {
      color: tokens.colors.neutral[300],
      bgColor: tokens.colors.neutral[50],
      border: tokens.colors.neutral[100],
    },
  };
}

export function getCalendarDayColors(tokens: DesignTokens) {
  return {
    default: { color: tokens.colors.neutral[800], bgColor: 'transparent' },
    selected: { color: tokens.colors.common.white, bgColor: tokens.colors.primaryScale[500] },
    today: { color: tokens.colors.primaryScale[600], bgColor: tokens.colors.primaryScale[50] },
    hasSlots: { color: tokens.colors.neutral[800], bgColor: 'transparent', dot: tokens.colors.primaryScale[400] },
    disabled: { color: tokens.colors.neutral[300], bgColor: 'transparent' },
  };
}

export function getDaysInMonth(month: number, year: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function getFirstDayOfMonth(month: number, year: number): number {
  return new Date(year, month, 1).getDay();
}
