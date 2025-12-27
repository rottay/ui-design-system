/**
 * Progress Component with compound components
 */

import { createEngineComponent } from '../../../../system/engines/factory';
import type { ProgressProps } from './types';
import { ProgressCircle, ProgressLine } from './compound';

export { type ProgressProps, type ProgressType, type ProgressStatus, PROGRESS_DEFAULTS } from './types';

export { BaseProgress } from './base';

export { ProgressCircle, ProgressLine };
export type { ProgressCircleProps, ProgressLineProps } from './compound';

export const Progress = Object.assign(
  createEngineComponent<ProgressProps>('Progress', {
    titan: () => import('./engines/titan'),
    hermes: () => import('./engines/hermes'),
    apollo: () => import('./engines/apollo'),
  }),
  {
    Circle: ProgressCircle,
    Line: ProgressLine,
  }
);
