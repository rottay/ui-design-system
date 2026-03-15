/**
 * BhSprintCapacity - Main Export
 * Dashboard widget showing sprint capacity utilization at a glance.
 */

import type { BhSprintCapacityProps } from './core';
import { BH_SPRINT_CAPACITY_DEFAULTS } from './core';
import { BH_SPRINT_CAPACITY_PRESETS } from './presets';

export {
  type BhSprintCapacityProps,
  type BhSprintCapacityPreset,
  type SprintCapacityData,
  BH_SPRINT_CAPACITY_DEFAULTS,
} from './core';
export * from './presets';

export function BhSprintCapacity(props: BhSprintCapacityProps): React.ReactElement {
  const preset = props.preset ?? BH_SPRINT_CAPACITY_DEFAULTS.preset ?? 'compact';
  const PresetComponent = BH_SPRINT_CAPACITY_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhSprintCapacity.displayName = 'BhSprintCapacity';

export { CompactBhSprintCapacity } from './presets';
