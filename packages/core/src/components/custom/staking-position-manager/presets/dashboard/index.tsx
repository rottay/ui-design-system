'use client';

/**
 * StakingPositionManager - Dashboard Preset
 * Overview dashboard with total staked value, total rewards, average APY,
 * and a position list with action buttons per position.
 *
 * All visual values use design tokens for white-label support.
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createListItemStyle,
  createPanelHeaderStyle,
  createEmptyStateStyle,
  createProgressBarStyle,
  formatDistanceToNow,
} from '../../../helpers';
import type { StakingPositionManagerProps, StakingPosition, StakingStatus } from '../../core';
import { STAKING_POSITION_MANAGER_DEFAULTS, getStakingStatusColors, formatTokenAmount, formatUsd } from '../../core';
import type { DesignTokens } from '../../../../../core/types/tokens';
import {
  Coins,
  Plus,
  Gift,
  ArrowDownToLine,
  RotateCcw,
  TrendingUp,
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
// APY Badge
// ============================================================================

function ApyBadge({ apy, tokens }: { apy: number; tokens: DesignTokens }) {
  return (
    <span
      style={{
        ...createBadgeStyle(tokens, 'success'),
        gap: tokens.spacing[1],
      }}
    >
      <TrendingUp style={{ width: 10, height: 10 }} />
      {apy.toFixed(1)}% APY
    </span>
  );
}

// ============================================================================
// Component
// ============================================================================

export const DashboardStakingPositionManager = createPreset<StakingPositionManagerProps>({
  name: 'StakingPositionManager.Dashboard',
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
    // State
    // ========================================================================
    const [hoveredPositionId, setHoveredPositionId] = useState<string | null>(null);

    // ========================================================================
    // Computed
    // ========================================================================
    const totalStakedValue = useMemo(() => {
      return positions.reduce((sum, p) => sum + p.valueUsd, 0);
    }, [positions]);

    const totalRewardsUsd = useMemo(() => {
      return positions.reduce((sum, p) => sum + p.rewardsUsd, 0);
    }, [positions]);

    const avgApy = useMemo(() => {
      if (positions.length === 0) return 0;
      const activePositions = positions.filter((p) => p.status === 'active');
      if (activePositions.length === 0) return 0;
      const weightedApy = activePositions.reduce((sum, p) => sum + p.apy * p.valueUsd, 0);
      const totalValue = activePositions.reduce((sum, p) => sum + p.valueUsd, 0);
      return totalValue > 0 ? weightedApy / totalValue : 0;
    }, [positions]);

    // ========================================================================
    // Render: Header
    // ========================================================================
    const renderHeader = () => (
      <Flex
        align="center"
        justify="between"
        style={{
          padding: `${tokens.spacing[6]}px ${tokens.spacing[6]}px ${tokens.spacing[4]}px`,
        }}
      >
        <Box>
          <Text
            style={{
              fontSize: tokens.typography.fontSize['2xl'],
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.neutral[900],
              lineHeight: tokens.typography.lineHeight.normal,
            }}
          >
            {title}
          </Text>
          {subtitle && (
            <Text
              style={{
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[500],
                marginTop: tokens.spacing[1],
              }}
            >
              {subtitle}
            </Text>
          )}
        </Box>

        {onStake && (
          <Box
            onClick={onStake}
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
            <Plus style={{ width: 14, height: 14 }} />
            Stake
          </Box>
        )}
      </Flex>
    );

    // ========================================================================
    // Render: Summary Cards
    // ========================================================================
    const renderSummary = () => (
      <Box
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: tokens.spacing[4],
          padding: `0 ${tokens.spacing[6]}px ${tokens.spacing[4]}px`,
        }}
      >
        {/* Total Staked */}
        <Box
          style={{
            padding: tokens.spacing[4],
            borderRadius: tokens.borderRadius.lg,
            backgroundColor: tokens.colors.neutral[50],
            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          }}
        >
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
            Total Staked
          </Text>
          <Text
            style={{
              fontSize: tokens.typography.fontSize.xl,
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.neutral[900],
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {formatUsd(totalStakedValue)}
          </Text>
        </Box>

        {/* Total Rewards */}
        <Box
          style={{
            padding: tokens.spacing[4],
            borderRadius: tokens.borderRadius.lg,
            backgroundColor: tokens.colors.successScale[50],
            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.successScale[200]}`,
          }}
        >
          <Text
            style={{
              fontSize: tokens.typography.fontSize.xs,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.successScale[600],
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: tokens.spacing[1],
            }}
          >
            Total Rewards
          </Text>
          <Text
            style={{
              fontSize: tokens.typography.fontSize.xl,
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.successScale[700],
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {formatUsd(totalRewardsUsd)}
          </Text>
        </Box>

        {/* Avg APY */}
        <Box
          style={{
            padding: tokens.spacing[4],
            borderRadius: tokens.borderRadius.lg,
            backgroundColor: tokens.colors.primaryScale[50],
            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[200]}`,
          }}
        >
          <Text
            style={{
              fontSize: tokens.typography.fontSize.xs,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.primaryScale[600],
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: tokens.spacing[1],
            }}
          >
            Avg APY
          </Text>
          <Text
            style={{
              fontSize: tokens.typography.fontSize.xl,
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.primaryScale[700],
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {avgApy.toFixed(1)}%
          </Text>
        </Box>
      </Box>
    );

    // ========================================================================
    // Render: Position Row
    // ========================================================================
    const renderPositionRow = (position: StakingPosition) => {
      const isSelected = selectedPositionId === position.id;
      const isHovered = hoveredPositionId === position.id;

      return (
        <Box
          key={position.id}
          onMouseEnter={() => setHoveredPositionId(position.id)}
          onMouseLeave={() => setHoveredPositionId(null)}
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 100px 90px 100px 100px auto',
            alignItems: 'center',
            padding: `${tokens.spacing[3]}px ${tokens.spacing[6]}px`,
            borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
            backgroundColor: isSelected
              ? tokens.colors.primaryScale[50]
              : isHovered
                ? tokens.colors.neutral[50]
                : tokens.colors.common.white,
            transition: `all ${tokens.motion.hover}`,
          }}
        >
          {/* Validator */}
          <Box style={{ overflow: 'hidden' }}>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.neutral[900],
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {position.validatorName}
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[400],
              }}
            >
              {position.chain}
            </Text>
          </Box>

          {/* Amount */}
          <Box>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.neutral[900],
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {formatUsd(position.valueUsd)}
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[400],
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {formatTokenAmount(position.amount, position.symbol)}
            </Text>
          </Box>

          {/* APY */}
          <Box>
            <ApyBadge apy={position.apy} tokens={tokens} />
          </Box>

          {/* Status */}
          <Box>
            <StatusBadge status={position.status} tokens={tokens} />
          </Box>

          {/* Rewards */}
          <Box>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                color: tokens.colors.successScale[600],
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {formatUsd(position.rewardsUsd)}
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[400],
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {formatTokenAmount(position.rewards, position.symbol)}
            </Text>
          </Box>

          {/* Actions */}
          <Flex align="center" gap={tokens.spacing[1]}>
            {onClaimRewards && position.status === 'active' && position.rewards > 0 && (
              <Box
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  onClaimRewards(position.id);
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: tokens.spacing[1],
                  padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                  borderRadius: tokens.borderRadius.md,
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.successScale[200]}`,
                  backgroundColor: tokens.colors.successScale[50],
                  color: tokens.colors.successScale[700],
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.medium,
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                  whiteSpace: 'nowrap',
                }}
              >
                <Gift style={{ width: 12, height: 12 }} />
                Claim
              </Box>
            )}
            {onRestake && position.status === 'active' && position.rewards > 0 && (
              <Box
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  onRestake(position.id);
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: tokens.spacing[1],
                  padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                  borderRadius: tokens.borderRadius.md,
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[200]}`,
                  backgroundColor: tokens.colors.primaryScale[50],
                  color: tokens.colors.primaryScale[700],
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.medium,
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                  whiteSpace: 'nowrap',
                }}
              >
                <RotateCcw style={{ width: 12, height: 12 }} />
                Restake
              </Box>
            )}
            {onUnstake && position.status === 'active' && (
              <Box
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  onUnstake(position.id);
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: tokens.spacing[1],
                  padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                  borderRadius: tokens.borderRadius.md,
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                  backgroundColor: tokens.colors.common.white,
                  color: tokens.colors.neutral[600],
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.medium,
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                  whiteSpace: 'nowrap',
                }}
              >
                <ArrowDownToLine style={{ width: 12, height: 12 }} />
                Unstake
              </Box>
            )}
          </Flex>
        </Box>
      );
    };

    // ========================================================================
    // Render: Table Header
    // ========================================================================
    const renderTableHeader = () => (
      <Box
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 100px 90px 100px 100px auto',
          padding: `${tokens.spacing[2]}px ${tokens.spacing[6]}px`,
          backgroundColor: tokens.colors.neutral[50],
          borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
        }}
      >
        {['Validator', 'Value', 'APY', 'Status', 'Rewards', 'Actions'].map((label) => (
          <Text
            key={label}
            style={{
              fontSize: tokens.typography.fontSize.xs,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.neutral[400],
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              whiteSpace: 'nowrap',
              userSelect: 'none',
            }}
          >
            {label}
          </Text>
        ))}
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
          padding: `${tokens.spacing[10]}px ${tokens.spacing[6]}px`,
        }}
      >
        <Coins style={{ width: 40, height: 40, color: tokens.colors.neutral[300], marginBottom: tokens.spacing[3] }} />
        <Text style={{ fontSize: tokens.typography.fontSize.md, color: tokens.colors.neutral[400] }}>
          No staking positions yet
        </Text>
        {onStake && (
          <Box
            onClick={onStake}
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
              marginTop: tokens.spacing[3],
            }}
          >
            <Plus style={{ width: 14, height: 14 }} />
            Start Staking
          </Box>
        )}
      </Flex>
    );

    // ========================================================================
    // Render: Footer
    // ========================================================================
    const renderFooter = () => (
      <Flex
        align="center"
        justify="between"
        style={{
          padding: `${tokens.spacing[3]}px ${tokens.spacing[6]}px`,
          borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          backgroundColor: tokens.colors.common.white,
        }}
      >
        <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
          {positions.length} {positions.length === 1 ? 'position' : 'positions'}
        </Text>
        <Text
          style={{
            fontSize: tokens.typography.fontSize.sm,
            fontWeight: tokens.typography.fontWeight.medium,
            color: tokens.colors.neutral[700],
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          Total staked: {formatUsd(totalStakedValue)}
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
        {renderSummary()}

        {/* Position List */}
        <Box style={{ flex: 1, overflow: 'auto' }}>
          {loading ? (
            <Flex
              align="center"
              justify="center"
              style={{ padding: `${tokens.spacing[10]}px ${tokens.spacing[6]}px` }}
            >
              <Spinner size="md" />
            </Flex>
          ) : positions.length === 0 ? (
            renderEmptyState()
          ) : (
            <>
              {renderTableHeader()}
              {positions.map((position) => renderPositionRow(position))}
            </>
          )}
        </Box>

        {positions.length > 0 && renderFooter()}
      </Box>
    );
  },
});

export default DashboardStakingPositionManager;
