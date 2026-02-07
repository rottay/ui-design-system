import type { DataSummaryBarPreset } from '../core';
import { Pills } from './pills';
import { Inline } from './inline';

export const PRESETS: Record<DataSummaryBarPreset, React.ComponentType<any>> = {
  'pills': Pills,
  'inline': Inline,
};
