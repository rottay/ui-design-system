/**
 * StakingPositionManager Presets
 */

export { DashboardStakingPositionManager } from './dashboard';
export { DetailStakingPositionManager } from './detail';

import type { StakingPositionManagerPreset } from '../core';
import type { ComponentType } from 'react';
import type { StakingPositionManagerProps } from '../core';
import { DashboardStakingPositionManager } from './dashboard';
import { DetailStakingPositionManager } from './detail';

export const STAKING_POSITION_MANAGER_PRESETS: Record<StakingPositionManagerPreset, ComponentType<StakingPositionManagerProps>> = {
  dashboard: DashboardStakingPositionManager,
  detail: DetailStakingPositionManager,
};
