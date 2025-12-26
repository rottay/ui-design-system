/**
 * Stepper - Engine Router
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
