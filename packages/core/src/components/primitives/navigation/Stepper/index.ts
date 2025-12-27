/**
 * Stepper - Engine Router
 *
 * This module exports the Stepper component with multi-engine support.
 * Stepper guides users through a multi-step process with visual feedback.
 *
 * @module Stepper
 * @example
 * ```tsx
 * import { Stepper } from '@rottay/design-system';
 *
 * // Basic usage with items
 * <Stepper
 *   items={[
 *     { title: 'Step 1', description: 'First step' },
 *     { title: 'Step 2', description: 'Second step' },
 *     { title: 'Step 3', description: 'Third step' },
 *   ]}
 *   current={0}
 * />
 *
 * // Vertical stepper
 * <Stepper items={items} direction="vertical" current={1} />
 *
 * // Clickable stepper with onChange
 * <Stepper items={items} clickable onChange={(step) => setStep(step)} />
 *
 * // With error status
 * <Stepper items={[{ title: 'Error', status: 'error' }]} current={0} />
 * ```
 */
import { createEngineComponent } from '../../../../system/engines/factory';
import type { StepperProps } from './types';
import { StepperStep, StepperContent } from './compound';

// Export types
export type {
  StepperProps,
  StepItem,
  StepperDirection,
  StepperSize,
  StepperVariant,
  StepStatus,
  LabelPlacement,
  StepProps,
  StepContentProps,
} from './types';
export { STEPPER_DEFAULTS, SIZE_MAP, FONT_SIZE_MAP } from './types';

// Export compound components
export { StepperStep, StepperContent };

// Export base component
export { BaseStepper } from './base';

// Create engine-aware Stepper component
export const Stepper = Object.assign(
  createEngineComponent<StepperProps>('Stepper', {
    titan: () => import('./engines/titan'),
    hermes: () => import('./engines/hermes'),
    apollo: () => import('./engines/apollo'),
  }),
  {
    Step: StepperStep,
    Content: StepperContent,
  }
);
