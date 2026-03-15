'use client';

/**
 * WalletPortfolio - Detailed Preset
 * Selected wallet detail view with wallet info header, asset list table
 * showing balances, USD values, and 24h change per asset.
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
  formatDistanceToNow,
} from '../../../helpers';
import type { WalletPortfolioProps, Wallet, WalletAsset, ChainType } from '../../core';
import { WALLET_PORTFOLIO_DEFAULTS, getChainColors, getWalletTypeIcon, formatUsd } from '../../core';
import type { DesignTokens } from '../../../../../core/types/tokens';
import {
  Wallet as WalletIcon,
  TrendingUp,
  TrendingDown,
  Copy,
  ArrowLeft,
  ExternalLink,
} from 'lucide-react';

// ============================================================================
// Chain Badge
// ============================================================================

function ChainBadge({ chain, tokens }: { chain: ChainType; tokens: DesignTokens }) {
  const chainColors = getChainColors(tokens);
  const config = chainColors[chain];

  const chainLabels: Record<ChainType, string> = {
    ethereum: 'Ethereum',
    polygon: 'Polygon',
    solana: 'Solana',
    bitcoin: 'Bitcoin',
    arbitrum: 'Arbitrum',
    optimism: 'Optimism',
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

export const DetailedWalletPortfolio = createPreset<WalletPortfolioProps>({
  name: 'WalletPortfolio.Detailed',
  render: ({ primitives, props, tokens }: PresetContext<WalletPortfolioProps>) => {
    const { Box, Flex, Text, Spinner } = primitives;
    const {
      wallets,
      onSelectWallet,
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
    const [hoveredAssetIdx, setHoveredAssetIdx] = useState<number | null>(null);

    // ========================================================================
    // Computed
    // ========================================================================
    const selectedWallet = useMemo(() => {
      if (selectedWalletId) {
        return wallets.find((w) => w.id === selectedWalletId) ?? wallets[0] ?? null;
      }
      return wallets[0] ?? null;
    }, [wallets, selectedWalletId]);

    const sortedAssets = useMemo(() => {
      if (!selectedWallet) return [];
      return [...selectedWallet.assets].sort((a, b) => b.valueUsd - a.valueUsd);
    }, [selectedWallet]);

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
          {wallets.length > 1 && onSelectWallet && (
            <Box
              onClick={() => onSelectWallet?.('')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 28,
                height: 28,
                borderRadius: tokens.borderRadius.md,
                cursor: 'pointer',
                color: tokens.colors.neutral[500],
                transition: `all ${tokens.motion.hover}`,
              }}
            >
              <ArrowLeft style={{ width: 16, height: 16 }} />
            </Box>
          )}
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
    // Render: Wallet Info
    // ========================================================================
    const renderWalletInfo = (wallet: Wallet) => (
      <Box
        style={{
          padding: `${tokens.spacing[5]}px ${tokens.spacing[6]}px`,
          borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
        }}
      >
        {/* Name + type */}
        <Flex align="center" gap={tokens.spacing[2]} style={{ marginBottom: tokens.spacing[3] }}>
          <Text style={{ fontSize: tokens.typography.fontSize.xl }}>
            {getWalletTypeIcon(wallet.type)}
          </Text>
          <Box>
            <Flex align="center" gap={tokens.spacing[2]}>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.lg,
                  fontWeight: tokens.typography.fontWeight.bold,
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
                  }}
                >
                  Default
                </span>
              )}
            </Flex>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[500],
                textTransform: 'capitalize',
              }}
            >
              {wallet.type.replace('-', ' ')} wallet
            </Text>
          </Box>
        </Flex>

        {/* Address + chain */}
        <Flex align="center" gap={tokens.spacing[3]} style={{ marginBottom: tokens.spacing[4] }}>
          <Flex
            align="center"
            gap={tokens.spacing[1]}
            style={{
              padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
              borderRadius: tokens.borderRadius.md,
              backgroundColor: tokens.colors.neutral[50],
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            }}
          >
            <Text
              style={{
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[600],
                fontFamily: 'monospace',
              }}
            >
              {wallet.address.slice(0, 10)}...{wallet.address.slice(-8)}
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
          <ChainBadge chain={wallet.chain} tokens={tokens} />
        </Flex>

        {/* Total value */}
        <Flex align="center" gap={tokens.spacing[3]}>
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
              Total Value
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize['2xl'],
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.neutral[900],
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {formatUsd(wallet.totalValueUsd)}
            </Text>
          </Box>
          {wallet.lastActivityAt && (
            <Box style={{ marginLeft: 'auto' }}>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[400],
                }}
              >
                Last activity {formatDistanceToNow(wallet.lastActivityAt, { addSuffix: true })}
              </Text>
            </Box>
          )}
        </Flex>
      </Box>
    );

    // ========================================================================
    // Render: Asset Table Header
    // ========================================================================
    const renderAssetTableHeader = () => (
      <Box
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 100px 120px 120px 80px',
          padding: `${tokens.spacing[2]}px ${tokens.spacing[6]}px`,
          backgroundColor: tokens.colors.neutral[50],
          borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
        }}
      >
        {['Asset', 'Balance', 'Value', '24h Change', 'Chain'].map((label) => (
          <Text
            key={label}
            style={{
              fontSize: tokens.typography.fontSize.xs,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.neutral[400],
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
            }}
          >
            {label}
          </Text>
        ))}
      </Box>
    );

    // ========================================================================
    // Render: Asset Row
    // ========================================================================
    const renderAssetRow = (asset: WalletAsset, index: number) => {
      const isHovered = hoveredAssetIdx === index;

      return (
        <Box
          key={`${asset.symbol}-${index}`}
          onMouseEnter={() => setHoveredAssetIdx(index)}
          onMouseLeave={() => setHoveredAssetIdx(null)}
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 100px 120px 120px 80px',
            padding: `${tokens.spacing[1]}px ${tokens.spacing[6]}px`,
            borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
            backgroundColor: isHovered ? tokens.colors.neutral[50] : tokens.colors.common.white,
            transition: `all ${tokens.motion.hover}`,
          }}
        >
          {/* Asset name + symbol */}
          <Flex align="center" gap={tokens.spacing[2]} style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[2]}px` }}>
            {asset.icon ? (
              <Text style={{ fontSize: tokens.typography.fontSize.lg }}>{asset.icon}</Text>
            ) : (
              <Box
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: tokens.borderRadius.full,
                  backgroundColor: tokens.colors.neutral[100],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: tokens.colors.neutral[500],
                  flexShrink: 0,
                }}
              >
                {asset.symbol.slice(0, 2)}
              </Box>
            )}
            <Box>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[900],
                }}
              >
                {asset.name}
              </Text>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[400],
                }}
              >
                {asset.symbol}
              </Text>
            </Box>
          </Flex>

          {/* Balance */}
          <Flex align="center" style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[2]}px` }}>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[700],
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {asset.balance.toLocaleString('en-US', { maximumFractionDigits: 6 })}
            </Text>
          </Flex>

          {/* USD Value */}
          <Flex align="center" style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[2]}px` }}>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.neutral[900],
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {formatUsd(asset.valueUsd)}
            </Text>
          </Flex>

          {/* 24h Change */}
          <Flex align="center" style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[2]}px` }}>
            <ChangeIndicator change={asset.change24h} tokens={tokens} />
          </Flex>

          {/* Chain */}
          <Flex align="center" style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[2]}px` }}>
            <ChainBadge chain={asset.chain} tokens={tokens} />
          </Flex>
        </Box>
      );
    };

    // ========================================================================
    // Render: Summary Footer
    // ========================================================================
    const renderSummaryFooter = (wallet: Wallet) => (
      <Flex
        align="center"
        justify="between"
        style={{
          padding: `${tokens.spacing[3]}px ${tokens.spacing[6]}px`,
          borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          backgroundColor: tokens.colors.neutral[50],
        }}
      >
        <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
          {wallet.assets.length} {wallet.assets.length === 1 ? 'asset' : 'assets'}
        </Text>
        <Text
          style={{
            fontSize: tokens.typography.fontSize.sm,
            fontWeight: tokens.typography.fontWeight.bold,
            color: tokens.colors.neutral[900],
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          Total: {formatUsd(wallet.totalValueUsd)}
        </Text>
      </Flex>
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
        <WalletIcon style={{ width: 40, height: 40, color: tokens.colors.neutral[300], marginBottom: tokens.spacing[3] }} />
        <Text style={{ fontSize: tokens.typography.fontSize.md, color: tokens.colors.neutral[400] }}>
          No wallet selected
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
        ) : !selectedWallet ? (
          renderEmptyState()
        ) : (
          <>
            {renderWalletInfo(selectedWallet)}
            <Box style={{ flex: 1, overflow: 'auto' }}>
              {renderAssetTableHeader()}
              {sortedAssets.length === 0 ? (
                <Flex
                  align="center"
                  justify="center"
                  style={{ padding: `${tokens.spacing[8]}px ${tokens.spacing[6]}px` }}
                >
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[400] }}>
                    No assets in this wallet
                  </Text>
                </Flex>
              ) : (
                sortedAssets.map((asset, idx) => renderAssetRow(asset, idx))
              )}
            </Box>
            {renderSummaryFooter(selectedWallet)}
          </>
        )}
      </Box>
    );
  },
});

export default DetailedWalletPortfolio;
