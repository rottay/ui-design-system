import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type LoyaltyProgramPreset = 'dashboard' | 'member';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedDate?: Date;
}

export interface LoyaltyMember {
  id: string;
  name: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  points: number;
  lifetimePoints: number;
  eventsAttended: number;
  achievements: Achievement[];
}

export interface LoyaltyReward {
  id: string;
  name: string;
  pointsCost: number;
  description: string;
  category: string;
  available: boolean;
}

export interface LoyaltyProgramProps extends EngineAwareProps {
  preset?: LoyaltyProgramPreset;
  members?: LoyaltyMember[];
  rewards?: LoyaltyReward[];
  programStats?: {
    totalMembers: number;
    averagePoints: number;
    rewardsRedeemed: number;
  };
  onRewardRedeem?: (rewardId: string, memberId: string) => void;
  onMemberClick?: (memberId: string) => void;
  style?: CSSProperties;
  className?: string;
}

export const LOYALTY_PROGRAM_DEFAULTS: Required<
  Pick<LoyaltyProgramProps, 'preset' | 'members' | 'rewards'>
> = {
  preset: 'dashboard',
  members: [],
  rewards: [],
};
