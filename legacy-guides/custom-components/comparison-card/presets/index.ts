import type { ComparisonCardPreset, ComparisonCardProps } from '../core';
import type { ComponentType } from 'react';
import { SideBySide } from './side-by-side';
import { Stacked } from './stacked';

export const PRESETS: Record<ComparisonCardPreset, ComponentType<ComparisonCardProps>> = {
  'side-by-side': SideBySide,
  'stacked': Stacked,
};
