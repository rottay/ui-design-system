'use client';

/**
 * StakingPositionManager - Detail Preset
 * Detailed view of a single staking position with validator info,
 * stake breakdown, lock period progress bar, rewards, and action buttons.
 *
 * All visual values use design tokens for white-label support.
 */

import { useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createPanelHeaderStyle,
  createProgressBarStyle,
  createEmptyStateStyle,
  formatDistanceToNow,
} from '../../../helpers';
import type { StakingPositionManagerProps, StakingPosition, StakingStatus } from '../../core';
import { STAKING_POSITION_MANAGER_DEFAULTS, getStakingStatusColors, formatTokenAmount, formatUsd } from '../../core';
import type { DesignTokens } from '../../../../../core/types/tokens';
import {
  Coins,
  Gift,
  ArrowDownToLine,
  RotateCcw,
  TrendingUp,
  ArrowLeft,
  Clock,
  Shield,
  Copy,
  Lock,
} from 'lucide-react';

// ============================================================================
// Status Badge
// ============================================================================

function StatusBadge({ status, tokens }: { status: StakingStatus; tokens: DesignTokens }) {
  const statusConfig = getStakingStatusColors(tokens);
  const config = statusConfig[status];

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: tokens.spacing[1],
        padding: `2px ${tokens.spacing[2]}px`,
        borderRadius: tokens.borderRadius.full,
        fontSize: tokens.typography.fontSize.xs,
        fontWeight: tokens.typography.fontWeight.medium,
        backgroundColor: config.bgColor,
        color: config.textColor,
        whiteSpace: 'nowrap',
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: tokens.borderRadius.full,
          backgroundColor: config.dotColor,
          flexShrink: 0,
        }}
      />
      {config.label}
    </span>
  );
}

// ============================================================================
// Component
// ============================================================================

export const DetailStakingPositionManager = createPreset<StakingPositionManagerProps>({
  name: 'StakingPositionManager.Detail',
  render: ({ primitives, props, tokens }: PresetContext<StakingPositionManagerProps>) => {
    const { Box, Flex, Text, Spinner } = primitives;
    const {
      positions,
      onStake,
      onUnstake,
      onClaimRewards,
      onRestake,
      selectedPositionId,
      title = STAKING_POSITION_MANAGER_DEFAULTS.title,
      subtitle,
      loading = false,
      className,
      style,
    } = props;

    // ========================================================================
    // Computed
    // ========================================================================
    const selectedPosition = useMemo(() => {
      if (selectedPositionId) {
        return positions.find((p) => p.id === selectedPositionId) ?? positions[0] ?? null;
      }
      return positions[0] ?? null;
    }, [positions, selectedPositionId]);

    const lockProgress = useMemo(() => {
      if (!selectedPosition?.lockPeriodDays || !selectedPosition.stakedAt) return null;
      const stakedTime = Date.now() - selectedPosition.stakedAt.getTime();
      const lockDurationMs = selectedPosition.lockPeriodDays * 24 * 60 * 60 * 1000;
      const progress = Math.min(100, Math.max(0, (stakedTime / lockDurationMs) * 100));
      const daysElapsed = Math.floor(stakedTime / (24 * 60 * 60 * 1000));
      const daysRemaining = Math.max(0, selectedPosition.lockPeriodDays - daysElapsed);
      return { progress, daysElapsed, daysRemaining };
    }, [selectedPosition]);

    const unbondingProgress = useMemo(() => {
      if (!selectedPosition?.unbondingEndsAt || selectedPosition.status !== 'unbonding') return null;
      const now = Date.now();
      const endTime = selectedPosition.unbondingEndsAt.getTime();
      const stakedTime = selectedPosition.stakedAt.getTime();
      const totalDuration = endTime - stakedTime;
      const elapsed = now - stakedTime;
      const progress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
      return { progress };
    }, [selectedPosition]);

    // ========================================================================
    // Render: Header
    // ========================================================================
    const renderHeader = () => (
      <Box
        style={{
          ...createPanelHeaderStyle(tokens),
          padding: `${tokens.spacing[4]}px ${tokens.spacing[6]}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Flex align="center" gap={tokens.spacing[3]}>
          <Text
            style={{
              fontSize: tokens.typography.fontSize.lg,
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.neutral[900],
            }}
          >
            {title}
          </Text>
        </Flex>
        {subtitle && (
          <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
            {subtitle}
          </Text>
        )}
      </Box>
    );

    // ========================================================================
    // Render: Validator Info
    // ========================================================================
    const renderValidatorInfo = (position: StakingPosition) => (
      <Box
        style={{
          padding: `${tokens.spacing[5]}px ${tokens.spacing[6]}px`,
          borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
        }}
      >
        <Flex align="center" justify="between" style={{ marginBottom: tokens.spacing[4] }}>
          <Flex align="center" gap={tokens.spacing[3]}>
            <Box
              style={{
                width: 40,
                height: 40,
                borderRadius: tokens.borderRadius.full,
                backgroundColor: tokens.colors.primaryScale[100],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Shield style={{ width: 20, height: 20, color: tokens.colors.primaryScale[600] }} />
            </Box>
            <Box>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.lg,
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: tokens.colors.neutral[900],
                }}
              >
                {position.validatorName}
              </Text>
              <Flex align="center" gap={tokens.spacing[2]}>
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.xs,
                    color: tokens.colors.neutral[400],
                    fontFamily: 'monospace',
                  }}
                >
                  {position.validatorAddress.slice(0, 10)}...{position.validatorAddress.slice(-8)}
                </Text>
                <Copy
                  style={{
                    width: 12,
                    height: 12,
                    color: tokens.colors.neutral[400],
                    cursor: 'pointer',
                  }}
                />
              </Flex>
            </Box>
          </Flex>
          <StatusBadge status={position.status} tokens={tokens} />
        </Flex>

        {/* Chain + Staked Since */}
        <Flex align="center" gap={tokens.spacing[4]}>
          <Box>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.neutral[500],
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: tokens.spacing[1],
              }}
            >
              Chain
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                color: tokens.colors.neutral[900],
              }}
            >
              {position.chain}
            </Text>
          </Box>
          <Box>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.neutral[500],
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: tokens.spacing[1],
              }}
            >
              Staked Since
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                color: tokens.colors.neutral[900],
              }}
            >
              {formatDistanceToNow(position.stakedAt, { addSuffix: true })}
            </Text>
          </Box>
        </Flex>
      </Box>
    );

    // ========================================================================
    // Render: Stake Details
    // ========================================================================
    const renderStakeDetails = (position: StakingPosition) => (
      <Box
        style={{
          padding: `${tokens.spacing[5]}px ${tokens.spacing[6]}px`,
          borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
        }}
      >
        <Text
          style={{
            fontSize: tokens.typography.fontSize.xs,
            fontWeight: tokens.typography.fontWeight.semibold,
            color: tokens.colors.neutral[500],
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: tokens.spacing[3],
          }}
        >
          Stake Details
        </Text>

        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: tokens.spacing[4],
          }}
        >
          {/* Staked Amount */}
          <Box
            style={{
              padding: tokens.spacing[4],
              borderRadius: tokens.borderRadius.lg,
              backgroundColor: tokens.colors.neutral[50],
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            }}
          >
            <Flex align="center" gap={tokens.spacing[1]} style={{ marginBottom: tokens.spacing[2] }}>
              <Coins style={{ width: 14, height: 14, color: tokens.colors.neutral[500] }} />
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[500],
                }}
              >
                Staked Amount
              </Text>
            </Flex>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.xl,
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.neutral[900],
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {formatUsd(position.valueUsd)}
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[500],
                fontVariantNumeric: 'tabular-nums',
                marginTop: tokens.spacing[1],
              }}
            >
              {formatTokenAmount(position.amount, position.symbol)}
            </Text>
          </Box>

          {/* Rewards */}
          <Box
            style={{
              padding: tokens.spacing[4],
              borderRadius: tokens.borderRadius.lg,
              backgroundColor: tokens.colors.successScale[50],
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.successScale[200]}`,
            }}
          >
            <Flex align="center" gap={tokens.spacing[1]} style={{ marginBottom: tokens.spacing[2] }}>
              <Gift style={{ width: 14, height: 14, color: tokens.colors.successScale[600] }} />
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.successScale[600],
                }}
              >
                Rewards Earned
              </Text>
            </Flex>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.xl,
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.successScale[700],
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {formatUsd(position.rewardsUsd)}
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.successScale[600],
                fontVariantNumeric: 'tabular-nums',
                marginTop: tokens.spacing[1],
              }}
            >
              {formatTokenAmount(position.rewards, position.symbol)}
            </Text>
          </Box>
        </Box>

        {/* APY Display */}
        <Box
          style={{
            marginTop: tokens.spacing[4],
            padding: tokens.spacing[3],
            borderRadius: tokens.borderRadius.lg,
            backgroundColor: tokens.colors.primaryScale[50],
            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[200]}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Flex align="center" gap={tokens.spacing[2]}>
            <TrendingUp style={{ width: 16, height: 16, color: tokens.colors.primaryScale[600] }} />
            <Text
              style={{
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                color: tokens.colors.primaryScale[700],
              }}
            >
              Annual Percentage Yield
            </Text>
          </Flex>
          <Text
            style={{
              fontSize: tokens.typography.fontSize.lg,
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.primaryScale[700],
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {position.apy.toFixed(2)}%
          </Text>
        </Box>
      </Box>
    );

    // ========================================================================
    // Render: Lock Period Progress
    // ========================================================================
    const renderLockPeriod = (position: StakingPosition) => {
      if (!lockProgress && !unbondingProgress) return null;

      const progressData = position.status === 'unbonding' ? unbondingProgress : lockProgress;
      if (!progressData) return null;

      const progressColor = position.status === 'unbonding'
        ? tokens.colors.warningScale[500]
        : tokens.colors.primaryScale[500];

      const barStyles = createProgressBarStyle(tokens, {
        color: progressColor,
        percent: progressData.progress,
      });

      return (
        <Box
          style={{
            padding: `${tokens.spacing[4]}px ${tokens.spacing[6]}px`,
            borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          }}
        >
          <Flex align="center" justify="between" style={{ marginBottom: tokens.spacing[2] }}>
            <Flex align="center" gap={tokens.spacing[1]}>
              {position.status === 'unbonding' ? (
                <Clock style={{ width: 14, height: 14, color: tokens.colors.warningScale[600] }} />
              ) : (
                <Lock style={{ width: 14, height: 14, color: tokens.colors.primaryScale[600] }} />
              )}
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[500],
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                {position.status === 'unbonding' ? 'Unbonding Progress' : 'Lock Period'}
              </Text>
            </Flex>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.medium,
                color: tokens.colors.neutral[600],
              }}
            >
              {progressData.progress.toFixed(0)}%
            </Text>
          </Flex>

          {/* Progress Bar */}
          <Box style={barStyles.track}>
            <Box style={barStyles.fill} />
          </Box>

          {lockProgress && position.status !== 'unbonding' && (
            <Flex align="center" justify="between" style={{ marginTop: tokens.spacing[2] }}>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
                {lockProgress.daysElapsed} days elapsed
              </Text>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
                {lockProgress.daysRemaining} days remaining
              </Text>
            </Flex>
          )}

          {position.status === 'unbonding' && position.unbondingEndsAt && (
            <Text
              style={{
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.warningScale[600],
                marginTop: tokens.spacing[2],
              }}
            >
              Unbonding completes {formatDistanceToNow(position.unbondingEndsAt, { addSuffix: true })}
            </Text>
          )}
        </Box>
      );
    };

    // ========================================================================
    // Render: Action Buttons
    // ========================================================================
    const renderActions = (position: StakingPosition) => (
      <Box
        style={{
          padding: `${tokens.spacing[4]}px ${tokens.spacing[6]}px`,
          borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          backgroundColor: tokens.colors.neutral[50],
        }}
      >
        <Flex align="center" gap={tokens.spacing[2]}>
          {onClaimRewards && position.status === 'active' && position.rewards > 0 && (
            <Box
              onClick={() => onClaimRewards(position.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
                padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                borderRadius: tokens.borderRadius.md,
                backgroundColor: tokens.colors.successScale[600],
                color: tokens.colors.common.white,
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                cursor: 'pointer',
                transition: `all ${tokens.motion.hover}`,
                border: 'none',
              }}
            >
              <Gift style={{ width: 14, height: 14 }} />
              Claim Rewards
            </Box>
          )}
          {onRestake && position.status === 'active' && position.rewards > 0 && (
            <Box
              onClick={() => onRestake(position.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
                padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                borderRadius: tokens.borderRadius.md,
                backgroundColor: tokens.colors.primaryScale[600],
                color: tokens.colors.common.white,
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                cursor: 'pointer',
                transition: `all ${tokens.motion.hover}`,
                border: 'none',
              }}
            >
              <RotateCcw style={{ width: 14, height: 14 }} />
              Restake
            </Box>
          )}
          {onUnstake && position.status === 'active' && (
            <Box
              onClick={() => onUnstake(position.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
                padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                borderRadius: tokens.borderRadius.md,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.errorScale[200]}`,
                backgroundColor: tokens.colors.common.white,
                color: tokens.colors.errorScale[600],
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                cursor: 'pointer',
                transition: `all ${tokens.motion.hover}`,
              }}
            >
              <ArrowDownToLine style={{ width: 14, height: 14 }} />
              Unstake
            </Box>
          )}
        </Flex>
      </Box>
    );

    // ========================================================================
    // Render: Empty State
    // ========================================================================
    const renderEmptyState = () => (
      <Flex
        align="center"
        justify="center"
        style={{
          ...createEmptyStateStyle(tokens),
          flex: 1,
          padding: `${tokens.spacing[10]}px ${tokens.spacing[6]}px`,
        }}
      >
        <Coins style={{ width: 40, height: 40, color: tokens.colors.neutral[300], marginBottom: tokens.spacing[3] }} />
        <Text style={{ fontSize: tokens.typography.fontSize.md, color: tokens.colors.neutral[400] }}>
          No position selected
        </Text>
      </Flex>
    );

    // ========================================================================
    // Main Render
    // ========================================================================
    return (
      <Box
        className={className}
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          minHeight: 400,
          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          borderRadius: tokens.borderRadius.lg,
          overflow: 'hidden',
          backgroundColor: tokens.colors.common.white,
          fontFamily: 'inherit',
          ...style,
        }}
      >
        {renderHeader()}

        {loading ? (
          <Flex
            align="center"
            justify="center"
            style={{ flex: 1, padding: `${tokens.spacing[10]}px ${tokens.spacing[6]}px` }}
          >
            <Spinner size="md" />
          </Flex>
        ) : !selectedPosition ? (
          renderEmptyState()
        ) : (
          <>
            {renderValidatorInfo(selectedPosition)}
            <Box style={{ flex: 1, overflow: 'auto' }}>
              {renderStakeDetails(selectedPosition)}
              {renderLockPeriod(selectedPosition)}
            </Box>
            {renderActions(selectedPosition)}
          </>
        )}
      </Box>
    );
  },
});

export default DetailStakingPositionManager;
