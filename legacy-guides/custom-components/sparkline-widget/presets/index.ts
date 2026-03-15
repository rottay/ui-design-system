import type { SparklineWidgetPreset, SparklineWidgetProps } from '../core';
import type { ComponentType } from 'react';
import { Line } from './line';
import { Bar } from './bar';
import { Area } from './area';

export const PRESETS: Record<SparklineWidgetPreset, ComponentType<SparklineWidgetProps>> = {
  'line': Line,
  'bar': Bar,
  'area': Area,
};
