import type { ProgressTrackerPreset } from '../core';
import { Linear } from './linear';
import { Circular } from './circular';
import { Milestone } from './milestone';

export const PRESETS: Record<ProgressTrackerPreset, React.ComponentType<any>> = {
  'linear': Linear,
  'circular': Circular,
  'milestone': Milestone,
};
