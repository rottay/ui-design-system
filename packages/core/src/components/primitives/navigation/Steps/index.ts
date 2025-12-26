/**
 * Steps - Engine Router
 */
import { createEngineComponent } from '../../../../system/engines/factory';
import type { StepsProps } from './types';

export { type StepsProps, type StepItem, type StepStatus, type ProgressDotInfo, STEPS_DEFAULTS } from './types';

export const Steps = createEngineComponent<StepsProps>('Steps', {
  titan: () => import('./engines/titan'),
  hermes: () => import('./engines/hermes'),
  apollo: () => import('./engines/apollo'),
});

export default Steps;
