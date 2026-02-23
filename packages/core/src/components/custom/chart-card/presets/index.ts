import type { ComponentType } from 'react';
import type { ChartCardPreset, ChartCardProps } from '../core';

import areaPreset from './area';
import barPreset from './bar';
import donutPreset from './donut';
import linePreset from './line';

export const area = areaPreset;
export const bar = barPreset;
export const donut = donutPreset;
export const line = linePreset;

export const PRESETS: Record<ChartCardPreset, ComponentType<ChartCardProps>> = {
  area: areaPreset,
  bar: barPreset,
  donut: donutPreset,
  line: linePreset,
};
