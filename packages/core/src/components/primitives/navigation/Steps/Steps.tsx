'use client';

/**
 * @fileoverview Steps -- sequential progress indicator with numbered/dotted/navigation
 * display types, per-step status (wait/process/finish/error), and clickable navigation.
 *
 * @example
 * ```tsx
 * import { Steps } from '@rottay/design-system';
 *
 * <Steps
 *   current={current}
 *   onChange={setCurrent}
 *   items={[
 *     { title: 'Login', description: 'Enter credentials' },
 *     { title: 'Verify', description: 'Confirm identity' },
 *     { title: 'Done', description: 'Complete registration' },
 *   ]}
 * />
 *
 * // Dot style progress
 * <Steps progressDot current={1} items={items} />
 * ```
 *
 * @module Steps
 * @category Navigation
 */

import { createEngineComponent } from '../../../../engines/factory';
import type { StepsProps } from './Steps.types';

export {
  type StepsProps,
  type StepItem,
  type StepStatus,
  type ProgressDotInfo,
  STEPS_DEFAULTS,
} from './Steps.types';

/** Sequential progress primitive resolved through the active engine. */
export const Steps = createEngineComponent<StepsProps>('Steps', {
  /** Ant Design implementation - full-featured with animations */
  classic: () => import('./engines/classic'),
  /** DaisyUI/Tailwind implementation - utility-first styling */
  modern: () => import('./engines/modern'),
  /** Vanilla HTML/CSS implementation - zero dependencies */
  rustic: () => import('./engines/rustic'),
});

export default Steps;
