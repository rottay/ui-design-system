import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type ForecastEnginePreset = 'planner' | 'comparison';

export interface ForecastInput {
  eventType: string;
  expectedAttendance: number;
  ticketPrice: number;
  venueCapacity: number;
  date: Date;
  historicalEventId?: string;
}

export interface ForecastResult {
  attendance: number;
  revenue: number;
  staffNeeded: number;
  inventoryNeeded: Record<string, number>;
  confidence: number;
}

export interface ForecastComparison {
  eventName: string;
  forecast: ForecastResult;
  actual: ForecastResult;
  accuracyScore: number;
}

export interface ForecastEngineProps extends EngineAwareProps {
  preset?: ForecastEnginePreset;
  inputs?: ForecastInput;
  results?: ForecastResult;
  comparisons?: ForecastComparison[];
  onSimulate?: () => void;
  onInputChange?: (field: keyof ForecastInput, value: any) => void;
  style?: CSSProperties;
  className?: string;
}

export const FORECAST_ENGINE_DEFAULTS: Required<
  Pick<ForecastEngineProps, 'preset' | 'comparisons'>
> = {
  preset: 'planner',
  comparisons: [],
};
