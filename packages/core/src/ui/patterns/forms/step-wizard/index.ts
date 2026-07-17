'use client';

/**
 * @fileoverview StepWizard pattern -- engine-aware multi-step form wizard
 * with progress tracking, per-step async validation, and skip support.
 */

import { createEngineComponent } from '../../../../infrastructure/runtime/engines/presentation/component-factory';
import type { StepWizardProps } from './contracts';

export type { StepWizardProps, StepWizardProgressLabelContext, WizardStep } from './contracts';

export const PatternStepWizard = createEngineComponent<StepWizardProps>('PatternStepWizard', {
  classic: () => import('./engines/classic'),
  modern: () => import('./engines/modern'),
  rustic: () => import('./engines/rustic'),
});
