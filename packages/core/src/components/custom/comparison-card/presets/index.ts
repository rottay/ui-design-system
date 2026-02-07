import type { ComparisonCardPreset } from '../core';
import { SideBySide } from './side-by-side';
import { Stacked } from './stacked';

export const PRESETS: Record<ComparisonCardPreset, React.ComponentType<any>> = {
  'side-by-side': SideBySide,
  'stacked': Stacked,
};
