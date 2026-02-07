import type { SparklineWidgetPreset } from '../core';
import { Line } from './line';
import { Bar } from './bar';
import { Area } from './area';

export const PRESETS: Record<SparklineWidgetPreset, React.ComponentType<any>> = {
  'line': Line,
  'bar': Bar,
  'area': Area,
};
