/**
 * Progress - Engine Router
 */

import { createEngineComponent } from '../../../../system/engines/factory';
import type { ProgressProps } from './types';

export { type ProgressProps, type ProgressType, type ProgressStatus, PROGRESS_DEFAULTS } from './types';


// Export base component
export { BaseProgress } from './base';

export const Progress = createEngineComponent<ProgressProps>('Progress', {
  titan: () => import('./engines/titan'),
  hermes: () => import('./engines/hermes'),
  apollo: () => import('./engines/apollo'),
});
