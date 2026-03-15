'use client';

/**
 * CryptoTransactionExplorer - Table Preset
 * Sortable table view with columns: hash, type, status, from/to, amount, gas fee, time.
 * All visual values use design tokens for white-label support.
 */

import { useState, useMemo, useCallback } from 'react';
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
// Sort helpers
// ============================================================================

type SortField = 'hash' | 'type' | 'status' | 'amount' | 'gasFee' | 'timestamp';
type SortDir = 'asc' | 'desc';

function sortTransactions(
  txs: CryptoTransaction[],
  field: SortField,
  dir: SortDir
): CryptoTransaction[] {
  const sorted = [...txs];
  sorted.sort((a, b) => {
    let cmp = 0;
    switch (field) {
      case 'hash':
        cmp = a.hash.localeCompare(b.hash);
        break;
      case 'type':
        cmp = a.type.localeCompare(b.type);
        break;
      case 'status':
        cmp = a.status.localeCompare(b.status);
        break;
      case 'amount':
        cmp = a.valueUsd - b.valueUsd;
        break;
      case 'gasFee':
        cmp = a.gasFee - b.gasFee;
        break;
      case 'timestamp':
        cmp = a.timestamp.getTime() - b.timestamp.getTime();
        break;
    }
    return dir === 'asc' ? cmp : -cmp;
  });
  return sorted;
}

// ============================================================================
// Status Badge
// ============================================================================

function TxStatusBadge({ status, tokens }: { status: CryptoTransaction['status']; tokens: DesignTokens }) {
  const colors = getTxStatusColors(tokens);
  const config = colors[status];

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
        backgroundColor: config.bg,
        color: config.text,
        whiteSpace: 'nowrap',
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: tokens.borderRadius.full,
          backgroundColor: config.dot,
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

export const TableCryptoTransactionExplorer = createPreset<CryptoTransactionExplorerProps>({
  name: 'CryptoTransactionExplorer.Table',
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

    const [sortField, setSortField] = useState<SortField>('timestamp');
    const [sortDir, setSortDir] = useState<SortDir>('desc');
    const [hoveredRow, setHoveredRow] = useState<string | null>(null);

    const handleSort = useCallback(
      (field: SortField) => {
        if (field === sortField) {
          setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
          setSortField(field);
          setSortDir('desc');
        }
      },
      [sortField]
    );

    const sortedTransactions = useMemo(
      () => sortTransactions(transactions, sortField, sortDir),
      [transactions, sortField, sortDir]
    );

    const sortIndicator = (field: SortField) => {
      if (sortField !== field) return '';
      return sortDir === 'asc' ? ' \u2191' : ' \u2193';
    };

    // ========================================================================
    // Column definitions
    // ========================================================================
    const columns = [
      { key: 'hash' as const, label: 'Tx Hash', width: '140px' },
      { key: 'type' as const, label: 'Type', width: '120px' },
      { key: 'status' as const, label: 'Status', width: '110px' },
      { key: 'fromTo' as const, label: 'From / To', width: '1fr' },
      { key: 'amount' as const, label: 'Amount', width: '160px' },
      { key: 'gasFee' as const, label: 'Gas Fee', width: '100px' },
      { key: 'timestamp' as const, label: 'Time', width: '100px' },
    ];

    const gridCols = columns.map((c) => c.width).join(' ');

    // ========================================================================
    // Render: Header
    // ========================================================================
    const renderHeader = () => (
      <Flex
        align="center"
        justify="between"
        style={{
          ...createPanelHeaderStyle(tokens),
          borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
        }}
      >
        <Box>
          <Text
            style={{
              fontSize: tokens.typography.fontSize.lg,
              fontWeight: tokens.typography.fontWeight.semibold,
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
                display: 'block',
              }}
            >
              {subtitle}
            </Text>
          )}
        </Box>
        <Text
          style={{
            fontSize: tokens.typography.fontSize.xs,
            color: tokens.colors.neutral[400],
          }}
        >
          {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
        </Text>
      </Flex>
    );

    // ========================================================================
    // Render: Table Header
    // ========================================================================
    const renderTableHeader = () => (
      <Box
        style={{
          display: 'grid',
          gridTemplateColumns: gridCols,
          backgroundColor: tokens.colors.neutral[50],
          borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
        }}
      >
        {columns.map((col) => {
          const sortable = col.key !== 'fromTo';
          return (
            <Box
              key={col.key}
              onClick={sortable ? () => handleSort(col.key as SortField) : undefined}
              style={{
                padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.neutral[400],
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                whiteSpace: 'nowrap',
                userSelect: 'none',
                cursor: sortable ? 'pointer' : 'default',
              }}
            >
              {col.label}
              {sortable && sortIndicator(col.key as SortField)}
            </Box>
          );
        })}
      </Box>
    );

    // ========================================================================
    // Render: Table Row
    // ========================================================================
    const renderRow = (tx: CryptoTransaction) => {
      const isHovered = hoveredRow === tx.id;

      return (
        <Box
          key={tx.id}
          onClick={() => onViewTransaction?.(tx.id)}
          onMouseEnter={() => setHoveredRow(tx.id)}
          onMouseLeave={() => setHoveredRow(null)}
          style={{
            display: 'grid',
            gridTemplateColumns: gridCols,
            borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
            backgroundColor: isHovered ? tokens.colors.neutral[50] : tokens.colors.common.white,
            cursor: onViewTransaction ? 'pointer' : 'default',
            transition: `all ${tokens.motion.hover}`,
          }}
        >
          {/* Hash */}
          <Box style={{ padding: tokens.spacing[3], display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.sm,
                fontFamily: 'monospace',
                color: tokens.colors.primaryScale[600],
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {truncateAddress(tx.hash)}
            </Text>
          </Box>

          {/* Type */}
          <Box style={{ padding: tokens.spacing[3], display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
            <span style={{ fontSize: tokens.typography.fontSize.sm }}>{getTxTypeIcon(tx.type)}</span>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700] }}>
              {getTxTypeLabel(tx.type)}
            </Text>
          </Box>

          {/* Status */}
          <Box style={{ padding: tokens.spacing[3], display: 'flex', alignItems: 'center' }}>
            <TxStatusBadge status={tx.status} tokens={tokens} />
          </Box>

          {/* From / To */}
          <Box style={{ padding: tokens.spacing[3], display: 'flex', alignItems: 'center', gap: tokens.spacing[1], overflow: 'hidden' }}>
            <span
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                onViewAddress?.(tx.from);
              }}
              style={{
                fontSize: tokens.typography.fontSize.xs,
                fontFamily: 'monospace',
                color: onViewAddress ? tokens.colors.primaryScale[600] : tokens.colors.neutral[600],
                cursor: onViewAddress ? 'pointer' : 'default',
                whiteSpace: 'nowrap',
              }}
            >
              {truncateAddress(tx.from)}
            </span>
            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
              {'\u2192'}
            </Text>
            <span
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                onViewAddress?.(tx.to);
              }}
              style={{
                fontSize: tokens.typography.fontSize.xs,
                fontFamily: 'monospace',
                color: onViewAddress ? tokens.colors.primaryScale[600] : tokens.colors.neutral[600],
                cursor: onViewAddress ? 'pointer' : 'default',
                whiteSpace: 'nowrap',
              }}
            >
              {truncateAddress(tx.to)}
            </span>
          </Box>

          {/* Amount */}
          <Box style={{ padding: tokens.spacing[3], display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.neutral[900],
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {formatCryptoAmount(tx.amount, tx.symbol)}
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[400],
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {formatUsd(tx.valueUsd)}
            </Text>
          </Box>

          {/* Gas Fee */}
          <Box style={{ padding: tokens.spacing[3], display: 'flex', alignItems: 'center' }}>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[500],
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {tx.gasFee.toFixed(6)} {tx.gasSymbol}
            </Text>
          </Box>

          {/* Time */}
          <Box style={{ padding: tokens.spacing[3], display: 'flex', alignItems: 'center' }}>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[500],
                whiteSpace: 'nowrap',
              }}
            >
              {formatTimeAgo(tx.timestamp)}
            </Text>
          </Box>
        </Box>
      );
    };

    // ========================================================================
    // Render: Footer
    // ========================================================================
    const renderFooter = () => (
      <Flex
        align="center"
        justify="between"
        style={{
          padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
          borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          backgroundColor: tokens.colors.common.white,
        }}
      >
        <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
          Showing {sortedTransactions.length} transaction{sortedTransactions.length !== 1 ? 's' : ''}
        </Text>
        <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
          Sorted by {sortField} {sortDir === 'asc' ? 'ascending' : 'descending'}
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
          ...createCardStyle(tokens, { elevation: 'sm' }),
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          ...style,
        }}
      >
        {renderHeader()}

        <Box style={{ flex: 1, overflow: 'auto' }}>
          {renderTableHeader()}

          {loading ? (
            <Flex
              align="center"
              justify="center"
              style={{ padding: `${tokens.spacing[10]}px ${tokens.spacing[4]}px` }}
            >
              <Spinner size="md" />
            </Flex>
          ) : sortedTransactions.length === 0 ? (
            <Flex
              align="center"
              justify="center"
              style={{
                padding: `${tokens.spacing[10]}px ${tokens.spacing[4]}px`,
                flexDirection: 'column',
                gap: tokens.spacing[2],
              }}
            >
              <Text style={{ fontSize: tokens.typography.fontSize['2xl'] }}>{'\u2194\uFE0F'}</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[400] }}>
                No transactions found
              </Text>
            </Flex>
          ) : (
            sortedTransactions.map((tx) => renderRow(tx))
          )}
        </Box>

        {renderFooter()}
      </Box>
    );
  },
});

export default TableCryptoTransactionExplorer;
