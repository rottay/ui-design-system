'use client';

/**
 * @fileoverview StepWizard pattern -- engine-aware multi-step form wizard
 * with progress tracking, per-step async validation, and skip support.
 */

import { createEngineComponent } from '../../../../runtime/engines/factory';
import type { StepWizardProps } from './StepWizard.types';

export type { StepWizardProps, StepWizardProgressLabelContext, WizardStep } from './StepWizard.types';

export const PatternStepWizard = createEngineComponent<StepWizardProps>('PatternStepWizard', {
  classic: () => import('./engines/classic'),
  modern: () => import('./engines/modern'),
  rustic: () => import('./engines/rustic'),
});
