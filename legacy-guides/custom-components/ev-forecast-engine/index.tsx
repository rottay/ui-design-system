import type { ForecastEngineProps } from './core';
import { FORECAST_ENGINE_DEFAULTS } from './core';
import { PRESETS } from './presets';

export type {
  ForecastEngineProps,
  ForecastInput,
  ForecastResult,
  ForecastComparison,
  ForecastEnginePreset,
} from './core';

export type EvForecastEngineProps = ForecastEngineProps;

export function ForecastEngine(props: ForecastEngineProps) {
  const { preset = FORECAST_ENGINE_DEFAULTS.preset, ...rest } = props;
  const Component = PRESETS[preset];
  return <Component {...rest} />;
}

ForecastEngine.displayName = 'ForecastEngine';

export const EvForecastEngine = ForecastEngine;
export { ForecastEnginePlanner, ForecastEngineComparison } from './presets';
