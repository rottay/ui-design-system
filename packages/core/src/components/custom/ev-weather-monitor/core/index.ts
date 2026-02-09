import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type WeatherMonitorPreset = 'forecast' | 'action';

export interface WeatherForecast {
  hour: string;
  temp: number;
  condition: 'clear' | 'cloudy' | 'light-rain' | 'heavy-rain' | 'storm' | 'wind';
  windSpeed: number;
  rainProbability: number;
}

export interface Contingency {
  id: string;
  condition: string;
  threshold: string;
  actions: string[];
  status: 'standby' | 'triggered' | 'resolved';
}

export interface WeatherMonitorProps extends EngineAwareProps {
  preset?: WeatherMonitorPreset;
  forecasts?: WeatherForecast[];
  contingencies?: Contingency[];
  onTriggerContingency?: (contingencyId: string) => void;
  onResolve?: (contingencyId: string) => void;
  style?: CSSProperties;
  className?: string;
}

export const WEATHER_MONITOR_DEFAULTS: Required<
  Pick<WeatherMonitorProps, 'preset' | 'forecasts' | 'contingencies'>
> = {
  preset: 'forecast',
  forecasts: [],
  contingencies: [],
};
