'use client';

/**
 * @fileoverview Stepper -- multi-step process guide with clickable navigation,
 * step status indicators, and paired content panels for wizard workflows.
 *
 * @example
 * ```tsx
 * import { Stepper } from '@rottay/design-system';
 *
 * // Items array API
 * <Stepper
 *   current={current}
 *   clickable
 *   onChange={setCurrent}
 *   items={[
 *     { title: 'Cart', description: 'Review items' },
 *     { title: 'Shipping', description: 'Enter address' },
 *     { title: 'Payment', description: 'Add payment method' },
 *   ]}
 * />
 *
 * // Compound component API with content panels
 * <Stepper current={step} clickable onChange={setStep}>
 *   <Stepper.Step title="Account" />
 *   <Stepper.Step title="Profile" />
 *   <Stepper.Content stepIndex={0}><AccountForm /></Stepper.Content>
 *   <Stepper.Content stepIndex={1}><ProfileForm /></Stepper.Content>
 * </Stepper>
 * ```
 *
 * @module Stepper
 * @category Navigation
 */

import { createEngineComponent } from '../../../../engines/factory';
import type { StepperProps } from './Stepper.types';
import { StepperStep, StepperContent } from './compound';

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
} from './Stepper.types';
export { STEPPER_DEFAULTS, SIZE_MAP, FONT_SIZE_MAP } from './Stepper.types';

export { StepperStep, StepperContent };

// Assemble compound component: Stepper + Stepper.Step + Stepper.Content
export const Stepper = Object.assign(
  createEngineComponent<StepperProps>('Stepper', {
    /** Ant Design implementation - full-featured with animations */
    classic: () => import('./engines/classic'),
    /** DaisyUI/Tailwind implementation - utility-first styling */
    modern: () => import('./engines/modern'),
    /** Vanilla HTML/CSS implementation - maximum accessibility */
    rustic: () => import('./engines/rustic'),
  }),
  {
    /** Individual step with title, description, and optional icon. */
    Step: StepperStep,
    /** Content panel for a step; supports fade/slide transitions. */
    Content: StepperContent,
  }
);
