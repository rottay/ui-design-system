/**
 * EvOnboardingFlow - Main Export
 * Platform onboarding wizard
 * Automatically selects preset based on props
 */

import type { EvOnboardingFlowProps } from './core';
import { EV_ONBOARDING_FLOW_DEFAULTS } from './core';
import { EV_ONBOARDING_FLOW_PRESETS } from './presets';

export {
  type EvOnboardingFlowProps,
  type EvOnboardingFlowPreset,
  type OnboardingStep as EvOnboardingFlowOnboardingStep,
  type OnboardingFormData as EvOnboardingFlowOnboardingFormData,
  EV_ONBOARDING_FLOW_DEFAULTS,
} from './core';
export * from './presets';

/**
 * EvOnboardingFlow component
 * Renders the appropriate preset based on the preset prop
 */
export function EvOnboardingFlow(props: EvOnboardingFlowProps): React.ReactElement {
  const preset = props.preset ?? EV_ONBOARDING_FLOW_DEFAULTS.preset ?? 'organizer';
  const PresetComponent = EV_ONBOARDING_FLOW_PRESETS[preset];

  return <PresetComponent {...props} />;
}

EvOnboardingFlow.displayName = 'EvOnboardingFlow';

export { OrganizerEvOnboardingFlow, VenueEvOnboardingFlow } from './presets';
