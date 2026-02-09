import type { LoyaltyProgramProps } from './core';
import { LOYALTY_PROGRAM_DEFAULTS } from './core';
import { PRESETS } from './presets';

export type {
  LoyaltyProgramProps,
  LoyaltyMember,
  Achievement,
  LoyaltyReward,
  LoyaltyProgramPreset,
} from './core';

export type EvLoyaltyProgramProps = LoyaltyProgramProps;

export function LoyaltyProgram(props: LoyaltyProgramProps) {
  const { preset = LOYALTY_PROGRAM_DEFAULTS.preset, ...rest } = props;
  const Component = PRESETS[preset];
  return <Component {...rest} />;
}

LoyaltyProgram.displayName = 'LoyaltyProgram';

export const EvLoyaltyProgram = LoyaltyProgram;
export { LoyaltyProgramDashboard, LoyaltyProgramMember } from './presets';
