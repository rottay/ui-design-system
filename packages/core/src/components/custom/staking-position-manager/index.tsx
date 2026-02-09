/**
 * StakingPositionManager - Main Export
 */

import type { StakingPositionManagerProps } from './core';
import { STAKING_POSITION_MANAGER_DEFAULTS } from './core';
import { STAKING_POSITION_MANAGER_PRESETS } from './presets';

export {
  type StakingPositionManagerProps,
  type StakingPositionManagerPreset,
  type StakingPosition,
  type StakingStatus,
  STAKING_POSITION_MANAGER_DEFAULTS,
} from './core';
export * from './presets';

export function StakingPositionManager(props: StakingPositionManagerProps): React.ReactElement {
  const preset = props.preset ?? STAKING_POSITION_MANAGER_DEFAULTS.preset ?? 'dashboard';
  const PresetComponent = STAKING_POSITION_MANAGER_PRESETS[preset];
  return <PresetComponent {...props} />;
}

StakingPositionManager.displayName = 'StakingPositionManager';

export { DashboardStakingPositionManager, DetailStakingPositionManager } from './presets';
