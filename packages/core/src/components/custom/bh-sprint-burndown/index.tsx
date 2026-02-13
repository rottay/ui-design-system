/**
 * BhSprintBurndown - Main Export
 * Sprint burndown chart with actual vs ideal line for BitHire ATS platform
 */

import type { BhSprintBurndownProps } from './core';
import { BH_SPRINT_BURNDOWN_DEFAULTS } from './core';
import { BH_SPRINT_BURNDOWN_PRESETS } from './presets';

export {
  type BhSprintBurndownProps,
  type BhSprintBurndownPreset,
  type BurndownDataPoint,
  BH_SPRINT_BURNDOWN_DEFAULTS,
} from './core';
export * from './presets';

/**
 * BhSprintBurndown component
 * Renders the appropriate preset based on the preset prop
 */
export function BhSprintBurndown(props: BhSprintBurndownProps): React.ReactElement {
  const preset = props.preset ?? BH_SPRINT_BURNDOWN_DEFAULTS.preset ?? 'chart';
  const PresetComponent = BH_SPRINT_BURNDOWN_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhSprintBurndown.displayName = 'BhSprintBurndown';

export { ChartBhSprintBurndown, CompactBhSprintBurndown } from './presets';
