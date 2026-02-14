/**
 * BhCalendarHeatmap - Core Interface
 * 12-month activity heatmap for interviews scheduled
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../types';

export type BhCalendarHeatmapPreset = 'full' | 'compact';

export interface HeatmapDay {
  date?: string;
  count?: number;
}

export interface BhCalendarHeatmapProps extends EngineAwareProps {
  preset?: BhCalendarHeatmapPreset;

  /** Daily activity data */
  days?: HeatmapDay[];

  /** Title */
  title?: string;

  /** Label for the activity metric */
  activityLabel?: string;

  /** Callback when a day is clicked */
  onDayClick?: (date: string, count: number) => void;

  /** Currently selected date */
  selectedDate?: string | null;

  /** Loading state */
  loading?: boolean;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_CALENDAR_HEATMAP_DEFAULTS: Partial<BhCalendarHeatmapProps> = {
  preset: 'full',
  activityLabel: 'interviews',
};
