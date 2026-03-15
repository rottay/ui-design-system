'use client';

/**
 * WalletPortfolio - Overview Preset
 * Portfolio overview with total value summary and a grid of wallet cards
 * showing chain badges, type icons, asset counts, and 24h change indicators.
 *
 * All visual values use design tokens for white-label support.
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createPanelHeaderStyle,
  createEmptyStateStyle,
  formatDistanceToNow,
} from '../../../helpers';
import type { WalletPortfolioProps, Wallet, ChainType } from '../../core';
import { WALLET_PORTFOLIO_DEFAULTS, getChainColors, getWalletTypeIcon, formatUsd } from '../../core';
import type { DesignTokens } from '../../../../../core/types/tokens';
import {
  Wallet as WalletIcon,
  Plus,
  TrendingUp,
  TrendingDown,
  ArrowRight,
} from 'lucide-react';

// ============================================================================
// Chain Badge
// ============================================================================

function ChainBadge({ chain, tokens }: { chain: ChainType; tokens: DesignTokens }) {
  const chainColors = getChainColors(tokens);
  const config = chainColors[chain];

  const chainLabels: Record<ChainType, string> = {
    ethereum: 'ETH',
    polygon: 'MATIC',
    solana: 'SOL',
    bitcoin: 'BTC',
    arbitrum: 'ARB',
    optimism: 'OP',
  };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
        borderRadius: tokens.borderRadius.full,
        fontSize: tokens.typography.fontSize.xs,
        fontWeight: tokens.typography.fontWeight.medium,
        backgroundColor: config.bgColor,
        color: config.textColor,
        border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${config.borderColor}`,
        whiteSpace: 'nowrap',
      }}
    >
      {chainLabels[chain] ?? chain}
    </span>
  );
}

// ============================================================================
// Change Indicator
// ============================================================================

function ChangeIndicator({ change, tokens }: { change: number; tokens: DesignTokens }) {
  const isPositive = change >= 0;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: tokens.spacing[1],
        fontSize: tokens.typography.fontSize.xs,
        fontWeight: tokens.typography.fontWeight.medium,
        color: isPositive ? tokens.colors.successScale[600] : tokens.colors.errorScale[600],
      }}
    >
      {isPositive ? (
        <TrendingUp style={{ width: 12, height: 12 }} />
      ) : (
        <TrendingDown style={{ width: 12, height: 12 }} />
      )}
      {isPositive ? '+' : ''}{change.toFixed(2)}%
    </span>
  );
}

// ============================================================================
// Component
// ============================================================================

export const OverviewWalletPortfolio = createPreset<WalletPortfolioProps>({
  name: 'WalletPortfolio.Overview',
  render: ({ primitives, props, tokens }: PresetContext<WalletPortfolioProps>) => {
    const { Box, Flex, Text, Spinner } = primitives;
    const {
      wallets,
      onSelectWallet,
      onCreateWallet,
      selectedWalletId,
      title = WALLET_PORTFOLIO_DEFAULTS.title,
      subtitle,
      loading = false,
      className,
      style,
    } = props;

    // ========================================================================
    // State
    // ========================================================================
    const [hoveredWalletId, setHoveredWalletId] = useState<string | null>(null);

    // ========================================================================
    // Computed
    // ========================================================================
    const totalPortfolioValue = useMemo(() => {
      return wallets.reduce((sum, w) => sum + w.totalValueUsd, 0);
    }, [wallets]);

    const totalAssets = useMemo(() => {
      return wallets.reduce((sum, w) => sum + w.assets.length, 0);
    }, [wallets]);

    const avg24hChange = useMemo(() => {
      if (wallets.length === 0) return 0;
      const allAssets = wallets.flatMap((w) => w.assets);
      if (allAssets.length === 0) return 0;
      const weightedChange = allAssets.reduce((sum, a) => sum + a.change24h * a.valueUsd, 0);
      const totalValue = allAssets.reduce((sum, a) => sum + a.valueUsd, 0);
      return totalValue > 0 ? weightedChange / totalValue : 0;
    }, [wallets]);

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

        {onCreateWallet && (
          <Box
            onClick={onCreateWallet}
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
            Add Wallet
          </Box>
        )}
      </Flex>
    );

    // ========================================================================
    // Render: Portfolio Summary
    // ========================================================================
    const renderSummary = () => (
      <Box
        style={{
          margin: `0 ${tokens.spacing[6]}px ${tokens.spacing[4]}px`,
          padding: tokens.spacing[5],
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
            marginBottom: tokens.spacing[2],
          }}
        >
          Total Portfolio Value
        </Text>
        <Flex align="center" gap={tokens.spacing[3]}>
          <Text
            style={{
              fontSize: tokens.typography.fontSize['3xl'],
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.neutral[900],
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {formatUsd(totalPortfolioValue)}
          </Text>
          <ChangeIndicator change={avg24hChange} tokens={tokens} />
        </Flex>
        <Flex align="center" gap={tokens.spacing[4]} style={{ marginTop: tokens.spacing[3] }}>
          <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
            {wallets.length} {wallets.length === 1 ? 'wallet' : 'wallets'}
          </Text>
          <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
            {totalAssets} {totalAssets === 1 ? 'asset' : 'assets'}
          </Text>
        </Flex>
      </Box>
    );

    // ========================================================================
    // Render: Wallet Card
    // ========================================================================
    const renderWalletCard = (wallet: Wallet) => {
      const isSelected = selectedWalletId === wallet.id;
      const isHovered = hoveredWalletId === wallet.id;

      const walletChange = wallet.assets.length > 0
        ? wallet.assets.reduce((sum, a) => sum + a.change24h * a.valueUsd, 0) /
          wallet.assets.reduce((sum, a) => sum + a.valueUsd, 0) || 0
        : 0;

      return (
        <Box
          key={wallet.id}
          onClick={() => onSelectWallet?.(wallet.id)}
          onMouseEnter={() => setHoveredWalletId(wallet.id)}
          onMouseLeave={() => setHoveredWalletId(null)}
          style={{
            ...createCardStyle(tokens, { elevation: 'sm', interactive: true }),
            backgroundColor: isSelected
              ? tokens.colors.primaryScale[50]
              : isHovered
                ? tokens.colors.neutral[50]
                : tokens.colors.common.white,
            borderColor: isSelected
              ? tokens.colors.primaryScale[200]
              : tokens.colors.neutral[200],
            padding: tokens.spacing[4],
          }}
        >
          {/* Top row: icon + name + chain */}
          <Flex align="center" justify="between" style={{ marginBottom: tokens.spacing[3] }}>
            <Flex align="center" gap={tokens.spacing[2]}>
              <Text style={{ fontSize: tokens.typography.fontSize.lg }}>
                {getWalletTypeIcon(wallet.type)}
              </Text>
              <Box>
                <Flex align="center" gap={tokens.spacing[2]}>
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.sm,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      color: tokens.colors.neutral[900],
                    }}
                  >
                    {wallet.name}
                  </Text>
                  {wallet.isDefault && (
                    <span
                      style={{
                        ...createBadgeStyle(tokens, 'primary'),
                        fontSize: tokens.typography.fontSize.xs,
                        padding: `0 ${tokens.spacing[1]}px`,
                      }}
                    >
                      Default
                    </span>
                  )}
                </Flex>
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.xs,
                    color: tokens.colors.neutral[400],
                    fontFamily: 'monospace',
                  }}
                >
                  {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                </Text>
              </Box>
            </Flex>
            <ChainBadge chain={wallet.chain} tokens={tokens} />
          </Flex>

          {/* Value + change */}
          <Flex align="center" justify="between" style={{ marginBottom: tokens.spacing[2] }}>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.lg,
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.neutral[900],
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {formatUsd(wallet.totalValueUsd)}
            </Text>
            <ChangeIndicator change={walletChange} tokens={tokens} />
          </Flex>

          {/* Bottom row: asset count + last activity */}
          <Flex align="center" justify="between">
            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
              {wallet.assets.length} {wallet.assets.length === 1 ? 'asset' : 'assets'}
            </Text>
            {wallet.lastActivityAt && (
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
                Active {formatDistanceToNow(wallet.lastActivityAt, { addSuffix: true })}
              </Text>
            )}
          </Flex>
        </Box>
      );
    };

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
        <WalletIcon style={{ width: 40, height: 40, color: tokens.colors.neutral[300], marginBottom: tokens.spacing[3] }} />
        <Text style={{ fontSize: tokens.typography.fontSize.md, color: tokens.colors.neutral[400] }}>
          No wallets added yet
        </Text>
        {onCreateWallet && (
          <Box
            onClick={onCreateWallet}
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
            Add Your First Wallet
          </Box>
        )}
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

        {/* Wallet Grid */}
        <Box style={{ flex: 1, overflow: 'auto', padding: `0 ${tokens.spacing[6]}px ${tokens.spacing[6]}px` }}>
          {loading ? (
            <Flex
              align="center"
              justify="center"
              style={{ padding: `${tokens.spacing[10]}px ${tokens.spacing[6]}px` }}
            >
              <Spinner size="md" />
            </Flex>
          ) : wallets.length === 0 ? (
            renderEmptyState()
          ) : (
            <Box
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: tokens.spacing[4],
              }}
            >
              {wallets.map((wallet) => renderWalletCard(wallet))}
            </Box>
          )}
        </Box>
      </Box>
    );
  },
});

export default OverviewWalletPortfolio;
