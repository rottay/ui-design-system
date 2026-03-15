/**
 * BhOnboardingFlow - Main Export
 * Automatically selects preset based on props
 */

import type { BhOnboardingFlowProps } from './core';
import { BH_ONBOARDING_FLOW_DEFAULTS } from './core';
import { BH_ONBOARDING_FLOW_PRESETS } from './presets';

export { type BhOnboardingFlowProps, type BhOnboardingFlowPreset, type OnboardingStep, type FormField, type PreviewItem, type HelpTooltip, BH_ONBOARDING_FLOW_DEFAULTS } from './core';
export * from './presets';

/**
 * BhOnboardingFlow component
 * Renders the appropriate preset based on the preset prop
 */
export function BhOnboardingFlow(props: BhOnboardingFlowProps): React.ReactElement {
  const preset = props.preset ?? BH_ONBOARDING_FLOW_DEFAULTS.preset ?? 'admin-setup';
  const PresetComponent = BH_ONBOARDING_FLOW_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhOnboardingFlow.displayName = 'BhOnboardingFlow';

export { AdminSetupBhOnboardingFlow, RecruiterWelcomeBhOnboardingFlow } from './presets';
