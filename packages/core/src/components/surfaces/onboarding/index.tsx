'use client';

/**
 * @fileoverview OnboardingSurface - Rottay Design System
 * @description Specialized wizard surface for onboarding and setup flows with
 * extra emphasis on guidance, checklist content, and hero copy.
 *
 * @remarks
 * This surface intentionally builds on top of `WizardSurface` so progression
 * logic stays centralized while onboarding adds richer supporting content.
 */

import React from 'react';
import type { OnboardingSurfaceConfig, WizardSurfaceConfig } from '../types';
import { WizardSurface } from '../wizard';

export interface OnboardingSurfaceProps {
  config: OnboardingSurfaceConfig;
  loading?: boolean;
  error?: unknown;
  onRetry?: () => void | Promise<void>;
}

/** Thin onboarding specialization over `WizardSurface`. */
export function OnboardingSurface({
  config,
  loading = false,
  error,
  onRetry,
}: OnboardingSurfaceProps): React.ReactElement {
  /**
   * Onboarding is intentionally implemented as a thin specialization over the
   * generic wizard surface. That keeps the progression logic in one place while
   * letting onboarding add richer side guidance through `aside`.
   */
  const wizardConfig: WizardSurfaceConfig = {
    visual: {
      maxWidth: config.visual.maxWidth,
      orientation: config.visual.orientation,
      showProgress: config.visual.showProgress,
      allowSkip: config.visual.allowSkip,
      stackOnMobile: config.visual.stackOnMobile,
      stackOnTablet: config.visual.stackOnTablet,
    },
    presentation: {
      chrome: config.presentation.chrome,
      description: config.presentation.description,
      renderField: config.presentation.renderField,
      emptyState: config.presentation.emptyState,
      footer: config.presentation.footer,
      // The aside is deliberately assembled here so onboarding can reorder hero
      // content without teaching WizardSurface about onboarding semantics.
      aside: (
        <React.Fragment>
          {config.visual.heroPosition !== 'end' && config.presentation.hero}
          {config.presentation.checklist}
          {config.visual.heroPosition === 'end' && config.presentation.hero}
        </React.Fragment>
      ),
    },
    behavior: config.behavior,
    permissions: config.permissions,
  };

  return <WizardSurface config={wizardConfig} loading={loading} error={error} onRetry={onRetry} />;
}
