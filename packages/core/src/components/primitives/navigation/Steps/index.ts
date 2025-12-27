/**
 * Steps - Engine Router
 *
 * This module exports the Steps component with multi-engine support.
 * Steps displays progress through a sequence of logical and numbered steps.
 *
 * @module Steps
 * @example
 * ```tsx
 * import { Steps } from '@rottay/design-system';
 *
 * // Basic usage
 * <Steps
 *   items={[
 *     { title: 'Login', description: 'Enter credentials' },
 *     { title: 'Verify', description: 'Confirm identity' },
 *     { title: 'Done', description: 'Complete' },
 *   ]}
 *   current={1}
 * />
 *
 * // Vertical steps
 * <Steps items={items} direction="vertical" current={0} />
 *
 * // With onChange callback
 * <Steps items={items} current={step} onChange={setStep} />
 *
 * // Navigation type
 * <Steps items={items} type="navigation" current={1} />
 * ```
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
