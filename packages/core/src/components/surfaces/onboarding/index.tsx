'use client';

/**
 * OnboardingSurface
 *
 * Onboarding is a specialized wizard: same progression mechanics, but with
 * much stronger emphasis on guidance, value framing, and side education. This
 * surface formalizes that experience instead of forcing product teams to fork
 * WizardSurface for every setup flow.
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
