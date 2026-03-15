export { LoyaltyProgramDashboard } from './dashboard';
export { LoyaltyProgramMember } from './member';

import type { LoyaltyProgramPreset } from '../core';
import type { ComponentType } from 'react';
import type { LoyaltyProgramProps } from '../core';
import { LoyaltyProgramDashboard } from './dashboard';
import { LoyaltyProgramMember } from './member';

export const PRESETS: Record<
  LoyaltyProgramPreset,
  ComponentType<LoyaltyProgramProps>
> = {
  dashboard: LoyaltyProgramDashboard,
  member: LoyaltyProgramMember,
};
