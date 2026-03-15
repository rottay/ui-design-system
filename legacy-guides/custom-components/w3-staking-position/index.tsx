/**
 * W3StakingPosition - Main Export
 * View active staking positions with earned rewards, unlock timers, and actions
 */

import type { W3StakingPositionProps } from './core';
import { W3_STAKING_POSITION_DEFAULTS } from './core';
import { W3_STAKING_POSITION_PRESETS } from './presets';

export { type W3StakingPositionProps, type W3StakingPositionPreset, W3_STAKING_POSITION_DEFAULTS } from './core';
export * from './presets';

export function W3StakingPosition(props: W3StakingPositionProps): React.ReactElement {
  const preset = props.preset ?? W3_STAKING_POSITION_DEFAULTS.preset ?? 'cards';
  const PresetComponent = W3_STAKING_POSITION_PRESETS[preset];
  return <PresetComponent {...props} />;
}

W3StakingPosition.displayName = 'W3StakingPosition';
