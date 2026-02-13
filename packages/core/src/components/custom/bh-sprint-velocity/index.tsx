/**
 * BhSprintVelocity - Main Export
 * Positions filled per sprint BarChart for BitHire ATS platform
 */

import type { BhSprintVelocityProps } from './core';
import { BH_SPRINT_VELOCITY_DEFAULTS } from './core';
import { BH_SPRINT_VELOCITY_PRESETS } from './presets';

export {
  type BhSprintVelocityProps,
  type BhSprintVelocityPreset,
  type SprintVelocityData,
  BH_SPRINT_VELOCITY_DEFAULTS,
} from './core';
export * from './presets';

/**
 * BhSprintVelocity component
 * Renders the appropriate preset based on the preset prop
 */
export function BhSprintVelocity(props: BhSprintVelocityProps): React.ReactElement {
  const preset = props.preset ?? BH_SPRINT_VELOCITY_DEFAULTS.preset ?? 'chart';
  const PresetComponent = BH_SPRINT_VELOCITY_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhSprintVelocity.displayName = 'BhSprintVelocity';

export { ChartBhSprintVelocity, CompactBhSprintVelocity } from './presets';
