'use client';

/**
 * StepWizard - Pattern Component
 *
 * Multi-step form wizard with progress tracking and per-step validation.
 * Used by: Onboarding flows (bh/ev/pl), EventCreation (ev), JobPosting (bh), TenantSetup (pl)
 */

import { createEngineComponent } from '../../../core/engines/factory';
import type { StepWizardProps } from './StepWizard.types';

export type { StepWizardProps, WizardStep } from './StepWizard.types';

export const PatternStepWizard = createEngineComponent<StepWizardProps>(
  'PatternStepWizard',
  {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/modern'),
    rustic: () => import('./engines/rustic'),
  }
);
