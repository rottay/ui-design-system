export { ForecastEnginePlanner } from './planner';
export { ForecastEngineComparison } from './comparison';

import type { ForecastEnginePreset } from '../core';
import type { ComponentType } from 'react';
import type { ForecastEngineProps } from '../core';
import { ForecastEnginePlanner } from './planner';
import { ForecastEngineComparison } from './comparison';

export const PRESETS: Record<
  ForecastEnginePreset,
  ComponentType<ForecastEngineProps>
> = {
  planner: ForecastEnginePlanner,
  comparison: ForecastEngineComparison,
};
