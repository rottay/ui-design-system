import type { ProgressTrackerPreset, ProgressTrackerProps } from '../core';
import type { ComponentType } from 'react';
import { Linear } from './linear';
import { Circular } from './circular';
import { Milestone } from './milestone';

export const PRESETS: Record<ProgressTrackerPreset, ComponentType<ProgressTrackerProps>> = {
  'linear': Linear,
  'circular': Circular,
  'milestone': Milestone,
};
