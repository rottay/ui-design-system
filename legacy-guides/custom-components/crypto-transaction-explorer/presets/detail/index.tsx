'use client';

/**
 * CryptoTransactionExplorer - Detail Preset
 * Full transaction detail view for the selected transaction.
 * Displays all metadata, addresses, amounts, gas info, and chain data.
 * All visual values use design tokens for white-label support.
 */

import { useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import { createCardStyle, createPanelHeaderStyle } from '../../../helpers';
import type { CryptoTransactionExplorerProps } from '../../core';
import {
  CRYPTO_TRANSACTION_EXPLORER_DEFAULTS,
  getTxStatusColors,
  getTxTypeIcon,
  getTxTypeLabel,
  truncateAddress,
  formatUsd,
  formatCryptoAmount,
} from '../../core';
import type { DesignTokens } from '../../../../../core/types/tokens';

// ============================================================================
// Detail Row
// ============================================================================

function DetailRow({
  label,
  tokens,
  children,
}: {
  label: string;
  tokens: DesignTokens;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        padding: `${tokens.spacing[3]}px 0`,
        borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
        gap: tokens.spacing[4],
      }}
    >
      <span
        style={{
          width: 140,
          flexShrink: 0,
          fontSize: tokens.typography.fontSize.sm,
          fontWeight: tokens.typography.fontWeight.medium,
          color: tokens.colors.neutral[500],
        }}
      >
        {label}
      </span>
      <div style={{ flex: 1, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[900] }}>
        {children}
      </div>
    </div>
  );
}

// ============================================================================
// Component
// ============================================================================

export const DetailCryptoTransactionExplorer = createPreset<CryptoTransactionExplorerProps>({
  name: 'CryptoTransactionExplorer.Detail',
  render: ({ primitives, props, tokens }: PresetContext<CryptoTransactionExplorerProps>) => {
    const { Box, Flex, Text, Spinner } = primitives;
    const {
      transactions,
      selectedTransactionId,
      onViewTransaction,
      onViewAddress,
      title = CRYPTO_TRANSACTION_EXPLORER_DEFAULTS.title,
      subtitle,
      loading = false,
      className,
      style,
    } = props;

    const selectedTx = useMemo(
      () => transactions.find((tx) => tx.id === selectedTransactionId),
      [transactions, selectedTransactionId]
    );

    const statusColors = getTxStatusColors(tokens);

    // ========================================================================
    // Render: Empty / Not Found
    // ========================================================================
    if (loading) {
      return (
        <Box
          className={className}
          style={{
            ...createCardStyle(tokens, { elevation: 'sm' }),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: tokens.spacing[10],
            ...style,
          }}
        >
          <Spinner size="md" />
        </Box>
      );
    }

    if (!selectedTx) {
      return (
        <Box
          className={className}
          style={{
            ...createCardStyle(tokens, { elevation: 'sm' }),
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: tokens.spacing[10],
            gap: tokens.spacing[3],
            ...style,
          }}
        >
          <Text style={{ fontSize: tokens.typography.fontSize['2xl'] }}>{'\uD83D\uDD0D'}</Text>
          <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[400] }}>
            {selectedTransactionId ? 'Transaction not found' : 'Select a transaction to view details'}
          </Text>
          {transactions.length > 0 && !selectedTransactionId && (
            <Box style={{ marginTop: tokens.spacing[2], display: 'flex', gap: tokens.spacing[2], flexWrap: 'wrap', justifyContent: 'center' }}>
              {transactions.slice(0, 3).map((tx) => (
                <span
                  key={tx.id}
                  onClick={() => onViewTransaction?.(tx.id)}
                  style={{
                    padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                    borderRadius: tokens.borderRadius.md,
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                    backgroundColor: tokens.colors.common.white,
                    color: tokens.colors.primaryScale[600],
                    fontSize: tokens.typography.fontSize.xs,
                    fontFamily: 'monospace',
                    cursor: 'pointer',
                  }}
                >
                  {truncateAddress(tx.hash)}
                </span>
              ))}
            </Box>
          )}
        </Box>
      );
    }

    // ========================================================================
    // Render: Detail View
    // ========================================================================
    const sc = statusColors[selectedTx.status];

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
              <Flex align="center" gap={tokens.spacing[2]}>
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.lg,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.neutral[900],
                  }}
                >
                  Transaction Detail
                </Text>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: tokens.spacing[1],
                    padding: `2px ${tokens.spacing[2]}px`,
                    borderRadius: tokens.borderRadius.full,
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.medium,
                    backgroundColor: sc.bg,
                    color: sc.text,
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: tokens.borderRadius.full,
                      backgroundColor: sc.dot,
                    }}
                  />
                  {sc.label}
                </span>
              </Flex>
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
            <Text
              style={{
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[500],
              }}
            >
              {selectedTx.chain}
            </Text>
          </Flex>
        </Box>

        {/* Amount Summary */}
        <Box
          style={{
            padding: `${tokens.spacing[5]}px ${tokens.spacing[4]}px`,
            backgroundColor: tokens.colors.neutral[50],
            borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            textAlign: 'center',
          }}
        >
          <Text
            style={{
              fontSize: tokens.typography.fontSize['2xl'],
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.neutral[900],
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {formatCryptoAmount(selectedTx.amount, selectedTx.symbol)}
          </Text>
          <Text
            style={{
              fontSize: tokens.typography.fontSize.md,
              color: tokens.colors.neutral[500],
              marginTop: tokens.spacing[1],
              display: 'block',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {formatUsd(selectedTx.valueUsd)}
          </Text>
        </Box>

        {/* Detail Rows */}
        <Box style={{ padding: `0 ${tokens.spacing[4]}px`, flex: 1, overflow: 'auto' }}>
          <DetailRow label="Transaction Hash" tokens={tokens}>
            <span
              style={{
                fontFamily: 'monospace',
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.primaryScale[600],
                wordBreak: 'break-all',
              }}
            >
              {selectedTx.hash}
            </span>
          </DetailRow>

          <DetailRow label="Type" tokens={tokens}>
            <Flex align="center" gap={tokens.spacing[1]}>
              <span>{getTxTypeIcon(selectedTx.type)}</span>
              <span>{getTxTypeLabel(selectedTx.type)}</span>
            </Flex>
          </DetailRow>

          <DetailRow label="From" tokens={tokens}>
            <span
              onClick={() => onViewAddress?.(selectedTx.from)}
              style={{
                fontFamily: 'monospace',
                fontSize: tokens.typography.fontSize.sm,
                color: onViewAddress ? tokens.colors.primaryScale[600] : tokens.colors.neutral[900],
                cursor: onViewAddress ? 'pointer' : 'default',
                wordBreak: 'break-all',
              }}
            >
              {selectedTx.from}
            </span>
          </DetailRow>

          <DetailRow label="To" tokens={tokens}>
            <span
              onClick={() => onViewAddress?.(selectedTx.to)}
              style={{
                fontFamily: 'monospace',
                fontSize: tokens.typography.fontSize.sm,
                color: onViewAddress ? tokens.colors.primaryScale[600] : tokens.colors.neutral[900],
                cursor: onViewAddress ? 'pointer' : 'default',
                wordBreak: 'break-all',
              }}
            >
              {selectedTx.to}
            </span>
          </DetailRow>

          <DetailRow label="Gas Fee" tokens={tokens}>
            <span style={{ fontVariantNumeric: 'tabular-nums' }}>
              {selectedTx.gasFee.toFixed(6)} {selectedTx.gasSymbol}
            </span>
          </DetailRow>

          {selectedTx.blockNumber !== undefined && (
            <DetailRow label="Block Number" tokens={tokens}>
              <span style={{ fontVariantNumeric: 'tabular-nums' }}>
                {selectedTx.blockNumber.toLocaleString()}
              </span>
            </DetailRow>
          )}

          <DetailRow label="Chain" tokens={tokens}>
            <span
              style={{
                padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                borderRadius: tokens.borderRadius.sm,
                backgroundColor: tokens.colors.infoScale[50],
                color: tokens.colors.infoScale[700],
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.medium,
              }}
            >
              {selectedTx.chain}
            </span>
          </DetailRow>

          <DetailRow label="Timestamp" tokens={tokens}>
            <span>
              {selectedTx.timestamp.toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
            </span>
          </DetailRow>

          {selectedTx.contractAddress && (
            <DetailRow label="Contract" tokens={tokens}>
              <span
                onClick={() => onViewAddress?.(selectedTx.contractAddress!)}
                style={{
                  fontFamily: 'monospace',
                  fontSize: tokens.typography.fontSize.sm,
                  color: onViewAddress ? tokens.colors.primaryScale[600] : tokens.colors.neutral[900],
                  cursor: onViewAddress ? 'pointer' : 'default',
                  wordBreak: 'break-all',
                }}
              >
                {selectedTx.contractAddress}
              </span>
            </DetailRow>
          )}

          {selectedTx.methodName && (
            <DetailRow label="Method" tokens={tokens}>
              <span
                style={{
                  padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                  borderRadius: tokens.borderRadius.sm,
                  backgroundColor: tokens.colors.secondaryScale[50],
                  color: tokens.colors.secondaryScale[700],
                  fontSize: tokens.typography.fontSize.xs,
                  fontFamily: 'monospace',
                  fontWeight: tokens.typography.fontWeight.medium,
                }}
              >
                {selectedTx.methodName}
              </span>
            </DetailRow>
          )}
        </Box>
      </Box>
    );
  },
});

export default DetailCryptoTransactionExplorer;
