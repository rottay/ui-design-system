import type { WeatherMonitorProps } from './core';
import { WEATHER_MONITOR_DEFAULTS } from './core';
import { PRESETS } from './presets';

export type {
  WeatherMonitorProps,
  WeatherForecast,
  Contingency,
  WeatherMonitorPreset,
} from './core';

export type EvWeatherMonitorProps = WeatherMonitorProps;

export function WeatherMonitor(props: WeatherMonitorProps) {
  const { preset = WEATHER_MONITOR_DEFAULTS.preset, ...rest } = props;
  const Component = PRESETS[preset];
  return <Component {...rest} />;
}

WeatherMonitor.displayName = 'WeatherMonitor';

export const EvWeatherMonitor = WeatherMonitor;
export { ForecastEvWeatherMonitor, ActionEvWeatherMonitor } from './presets';
