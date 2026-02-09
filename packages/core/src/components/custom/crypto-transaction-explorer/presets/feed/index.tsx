'use client';

/**
 * CryptoTransactionExplorer - Feed Preset
 * Real-time feed style with timeline dots and streaming appearance.
 * Each transaction is a card in a vertical timeline layout.
 * All visual values use design tokens for white-label support.
 */

import { useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import { createCardStyle, createPanelHeaderStyle } from '../../../helpers';
import type { CryptoTransactionExplorerProps, CryptoTransaction } from '../../core';
import {
  CRYPTO_TRANSACTION_EXPLORER_DEFAULTS,
  getTxStatusColors,
  getTxTypeIcon,
  getTxTypeLabel,
  truncateAddress,
  formatUsd,
  formatCryptoAmount,
  formatTimeAgo,
} from '../../core';
import type { DesignTokens } from '../../../../../core/types/tokens';

// ============================================================================
// Feed Item
// ============================================================================

function FeedItem({
  tx,
  tokens,
  isLast,
  onViewTransaction,
  onViewAddress,
}: {
  tx: CryptoTransaction;
  tokens: DesignTokens;
  isLast: boolean;
  onViewTransaction?: (id: string) => void;
  onViewAddress?: (address: string) => void;
}) {
  const statusColors = getTxStatusColors(tokens);
  const sc = statusColors[tx.status];

  return (
    <div
      style={{
        display: 'flex',
        gap: tokens.spacing[3],
        position: 'relative',
      }}
    >
      {/* Timeline Column */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: 20,
          flexShrink: 0,
          position: 'relative',
        }}
      >
        {/* Dot */}
        <div
          style={{
            width: 12,
            height: 12,
            borderRadius: tokens.borderRadius.full,
            backgroundColor: sc.dot,
            border: `2px solid ${sc.bg}`,
            flexShrink: 0,
            zIndex: 1,
            marginTop: tokens.spacing[3],
          }}
        />
        {/* Line */}
        {!isLast && (
          <div
            style={{
              width: 2,
              flex: 1,
              backgroundColor: tokens.colors.neutral[200],
              marginTop: tokens.spacing[1],
            }}
          />
        )}
      </div>

      {/* Content Card */}
      <div
        onClick={() => onViewTransaction?.(tx.id)}
        style={{
          flex: 1,
          padding: tokens.spacing[3],
          marginBottom: tokens.spacing[3],
          borderRadius: tokens.borderRadius.md,
          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          backgroundColor: tokens.colors.common.white,
          cursor: onViewTransaction ? 'pointer' : 'default',
          transition: `all ${tokens.motion.hover}`,
        }}
      >
        {/* Top Row: Type + Status + Time */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: tokens.spacing[2],
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
            <span style={{ fontSize: tokens.typography.fontSize.md }}>{getTxTypeIcon(tx.type)}</span>
            <span
              style={{
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.neutral[900],
              }}
            >
              {getTxTypeLabel(tx.type)}
            </span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
                padding: `1px ${tokens.spacing[2]}px`,
                borderRadius: tokens.borderRadius.full,
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.medium,
                backgroundColor: sc.bg,
                color: sc.text,
              }}
            >
              <span
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: tokens.borderRadius.full,
                  backgroundColor: sc.dot,
                }}
              />
              {sc.label}
            </span>
          </div>
          <span
            style={{
              fontSize: tokens.typography.fontSize.xs,
              color: tokens.colors.neutral[400],
              whiteSpace: 'nowrap',
            }}
          >
            {formatTimeAgo(tx.timestamp)}
          </span>
        </div>

        {/* Amount Row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: tokens.spacing[2],
            marginBottom: tokens.spacing[2],
          }}
        >
          <span
            style={{
              fontSize: tokens.typography.fontSize.md,
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.neutral[900],
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {formatCryptoAmount(tx.amount, tx.symbol)}
          </span>
          <span
            style={{
              fontSize: tokens.typography.fontSize.xs,
              color: tokens.colors.neutral[400],
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {formatUsd(tx.valueUsd)}
          </span>
        </div>

        {/* From / To Row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[2],
            fontSize: tokens.typography.fontSize.xs,
            color: tokens.colors.neutral[500],
          }}
        >
          <span
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              onViewAddress?.(tx.from);
            }}
            style={{
              fontFamily: 'monospace',
              color: onViewAddress ? tokens.colors.primaryScale[600] : tokens.colors.neutral[600],
              cursor: onViewAddress ? 'pointer' : 'default',
            }}
          >
            {truncateAddress(tx.from)}
          </span>
          <span style={{ color: tokens.colors.neutral[300] }}>{'\u2192'}</span>
          <span
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              onViewAddress?.(tx.to);
            }}
            style={{
              fontFamily: 'monospace',
              color: onViewAddress ? tokens.colors.primaryScale[600] : tokens.colors.neutral[600],
              cursor: onViewAddress ? 'pointer' : 'default',
            }}
          >
            {truncateAddress(tx.to)}
          </span>
        </div>

        {/* Bottom Row: Hash + Chain + Gas */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[3],
            marginTop: tokens.spacing[2],
            fontSize: tokens.typography.fontSize.xs,
            color: tokens.colors.neutral[400],
          }}
        >
          <span
            style={{
              fontFamily: 'monospace',
              color: tokens.colors.primaryScale[500],
            }}
          >
            {truncateAddress(tx.hash)}
          </span>
          <span
            style={{
              padding: `0 ${tokens.spacing[1]}px`,
              borderRadius: tokens.borderRadius.sm,
              backgroundColor: tokens.colors.infoScale[50],
              color: tokens.colors.infoScale[600],
              fontWeight: tokens.typography.fontWeight.medium,
            }}
          >
            {tx.chain}
          </span>
          <span style={{ fontVariantNumeric: 'tabular-nums' }}>
            Gas: {tx.gasFee.toFixed(6)} {tx.gasSymbol}
          </span>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Component
// ============================================================================

export const FeedCryptoTransactionExplorer = createPreset<CryptoTransactionExplorerProps>({
  name: 'CryptoTransactionExplorer.Feed',
  render: ({ primitives, props, tokens }: PresetContext<CryptoTransactionExplorerProps>) => {
    const { Box, Flex, Text, Spinner } = primitives;
    const {
      transactions,
      onViewTransaction,
      onViewAddress,
      title = CRYPTO_TRANSACTION_EXPLORER_DEFAULTS.title,
      subtitle,
      loading = false,
      className,
      style,
    } = props;

    const sortedTransactions = useMemo(
      () => [...transactions].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()),
      [transactions]
    );

    // ========================================================================
    // Status Summary Counts
    // ========================================================================
    const statusCounts = useMemo(() => {
      const counts = { confirmed: 0, pending: 0, failed: 0 };
      for (const tx of transactions) {
        counts[tx.status]++;
      }
      return counts;
    }, [transactions]);

    const statusColors = getTxStatusColors(tokens);

    return (
      <Box
        className={className}
        style={{
          ...createCardStyle(tokens, { elevation: 'sm' }),
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          ...style,
        }}
      >
        {/* Header */}
        <Box
          style={{
            ...createPanelHeaderStyle(tokens),
            borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          }}
        >
          <Flex align="center" justify="between">
            <Box>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.lg,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[900],
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
                    display: 'block',
                  }}
                >
                  {subtitle}
                </Text>
              )}
            </Box>
            <Flex align="center" gap={tokens.spacing[3]}>
              {(['confirmed', 'pending', 'failed'] as const).map((status) => {
                const sc = statusColors[status];
                return (
                  <Flex key={status} align="center" gap={tokens.spacing[1]}>
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: tokens.borderRadius.full,
                        backgroundColor: sc.dot,
                      }}
                    />
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                      {statusCounts[status]}
                    </Text>
                  </Flex>
                );
              })}
            </Flex>
          </Flex>
        </Box>

        {/* Feed Content */}
        <Box
          style={{
            flex: 1,
            overflow: 'auto',
            padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
          }}
        >
          {loading ? (
            <Flex
              align="center"
              justify="center"
              style={{ padding: `${tokens.spacing[10]}px 0` }}
            >
              <Spinner size="md" />
            </Flex>
          ) : sortedTransactions.length === 0 ? (
            <Flex
              align="center"
              justify="center"
              style={{
                padding: `${tokens.spacing[10]}px 0`,
                flexDirection: 'column',
                gap: tokens.spacing[2],
              }}
            >
              <Text style={{ fontSize: tokens.typography.fontSize['2xl'] }}>{'\u2194\uFE0F'}</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[400] }}>
                No transactions in the feed
              </Text>
            </Flex>
          ) : (
            sortedTransactions.map((tx, idx) => (
              <FeedItem
                key={tx.id}
                tx={tx}
                tokens={tokens}
                isLast={idx === sortedTransactions.length - 1}
                onViewTransaction={onViewTransaction}
                onViewAddress={onViewAddress}
              />
            ))
          )}
        </Box>

        {/* Footer */}
        <Flex
          align="center"
          justify="center"
          style={{
            padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
            borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            backgroundColor: tokens.colors.common.white,
          }}
        >
          <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
            {sortedTransactions.length} transaction{sortedTransactions.length !== 1 ? 's' : ''} in feed
          </Text>
        </Flex>
      </Box>
    );
  },
});

export default FeedCryptoTransactionExplorer;
