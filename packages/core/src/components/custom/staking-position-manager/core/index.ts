/**
 * StakingPositionManager - Core Interface
 * Staking positions dashboard with validator info, APY badges,
 * status tracking, rewards claiming, and lock period progress.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DesignTokens } from '../../../../core/types/tokens';

export type StakingPositionManagerPreset = 'dashboard' | 'detail';

export type StakingStatus = 'active' | 'unbonding' | 'completed' | 'slashed';

export interface StakingPosition {
  id: string;
  validatorName: string;
  validatorAddress: string;
  chain: string;
  amount: number;
  symbol: string;
  valueUsd: number;
  rewards: number;
  rewardsUsd: number;
  apy: number;
  status: StakingStatus;
  stakedAt: Date;
  unbondingEndsAt?: Date;
  lockPeriodDays?: number;
}

export interface StakingPositionManagerProps extends EngineAwareProps {
  preset?: StakingPositionManagerPreset;
  positions: StakingPosition[];
  onStake?: () => void;
  onUnstake?: (id: string) => void;
  onClaimRewards?: (id: string) => void;
  onRestake?: (id: string) => void;
  selectedPositionId?: string;
  title?: string;
  subtitle?: string;
  loading?: boolean;
  className?: string;
  style?: CSSProperties;
}

export const STAKING_POSITION_MANAGER_DEFAULTS: Partial<StakingPositionManagerProps> = {
  preset: 'dashboard',
  title: 'Staking Positions',
};

// ============================================================================
// Shared Utilities
// ============================================================================

export interface StakingStatusConfig {
  label: string;
  bgColor: string;
  textColor: string;
  dotColor: string;
}

export function getStakingStatusColors(tokens: DesignTokens): Record<StakingStatus, StakingStatusConfig> {
  return {
    active: {
      label: 'Active',
      bgColor: tokens.colors.successScale[50],
      textColor: tokens.colors.successScale[700],
      dotColor: tokens.colors.successScale[500],
    },
    unbonding: {
      label: 'Unbonding',
      bgColor: tokens.colors.warningScale[50],
      textColor: tokens.colors.warningScale[700],
      dotColor: tokens.colors.warningScale[500],
    },
    completed: {
      label: 'Completed',
      bgColor: tokens.colors.neutral[100],
      textColor: tokens.colors.neutral[600],
      dotColor: tokens.colors.neutral[400],
    },
    slashed: {
      label: 'Slashed',
      bgColor: tokens.colors.errorScale[50],
      textColor: tokens.colors.errorScale[700],
      dotColor: tokens.colors.errorScale[500],
    },
  };
}

export function formatTokenAmount(amount: number, symbol: string): string {
  const formatted = amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  });
  return `${formatted} ${symbol}`;
}

export function formatUsd(amount: number): string {
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  const formatted = absAmount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${isNegative ? '-' : ''}$${formatted}`;
}
