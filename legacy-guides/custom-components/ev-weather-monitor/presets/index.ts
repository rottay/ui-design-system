export { ForecastEvWeatherMonitor } from './forecast';
export { ActionEvWeatherMonitor } from './action';

import type { WeatherMonitorPreset } from '../core';
import type { ComponentType } from 'react';
import type { WeatherMonitorProps } from '../core';
import { ForecastEvWeatherMonitor } from './forecast';
import { ActionEvWeatherMonitor } from './action';

export const PRESETS: Record<
  WeatherMonitorPreset,
  ComponentType<WeatherMonitorProps>
> = {
  forecast: ForecastEvWeatherMonitor,
  action: ActionEvWeatherMonitor,
};
