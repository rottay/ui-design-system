/**
 * BhIndividualHome - Main Export
 * Automatically selects preset based on props
 */

import type { BhIndividualHomeProps } from './core';
import { BH_INDIVIDUAL_HOME_DEFAULTS } from './core';
import { BH_INDIVIDUAL_HOME_PRESETS } from './presets';

export { type BhIndividualHomeProps, type BhIndividualHomePreset, type WelcomeInfo, type PipelinePreview, type PipelineStage, type ScheduleItem, type WizardStep, type PerformanceRing, type RecentCandidate, type TokenBalance, BH_INDIVIDUAL_HOME_DEFAULTS } from './core';
export * from './presets';

/**
 * BhIndividualHome component
 * Renders the appropriate preset based on the preset prop
 */
export function BhIndividualHome(props: BhIndividualHomeProps): React.ReactElement {
  const preset = props.preset ?? BH_INDIVIDUAL_HOME_DEFAULTS.preset ?? 'standard';
  const PresetComponent = BH_INDIVIDUAL_HOME_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhIndividualHome.displayName = 'BhIndividualHome';

export { StandardBhIndividualHome } from './presets';
