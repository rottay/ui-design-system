/**
 * BhOnboardingPlaybook - Main Export
 * Onboarding playbook for new recruiter training on BitHire ATS platform
 * Automatically selects preset based on props
 */

import type { BhOnboardingPlaybookProps } from './core';
import { BH_ONBOARDING_PLAYBOOK_DEFAULTS } from './core';
import { BH_ONBOARDING_PLAYBOOK_PRESETS } from './presets';

export {
  type BhOnboardingPlaybookProps,
  type BhOnboardingPlaybookPreset,
  type PlaybookStep,
  type PlaybookModule,
  type PlaybookResource,
  type OnboardingData,
  BH_ONBOARDING_PLAYBOOK_DEFAULTS,
} from './core';
export * from './presets';

/**
 * BhOnboardingPlaybook component
 * Renders the appropriate preset based on the preset prop
 */
export function BhOnboardingPlaybook(props: BhOnboardingPlaybookProps): React.ReactElement {
  const preset = props.preset ?? BH_ONBOARDING_PLAYBOOK_DEFAULTS.preset ?? 'guided';
  const PresetComponent = BH_ONBOARDING_PLAYBOOK_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhOnboardingPlaybook.displayName = 'BhOnboardingPlaybook';

export { GuidedBhOnboardingPlaybook, ProgressBhOnboardingPlaybook } from './presets';
