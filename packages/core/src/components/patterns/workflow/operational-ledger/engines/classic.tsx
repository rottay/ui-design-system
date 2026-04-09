'use client';

/**
 * @fileoverview Classic engine for the OperationalLedger pattern.
 * Renders a dense ledger table with alternating rows, signed quantity
 * coloring (green for credit, red for debit), timestamps, actor column,
 * and inline filters.
 */

import React from 'react';
import { Box, Flex } from '../../../../primitives/layout';
import { Text } from '../../../../primitives/display';
import { Select } from '../../../../primitives/inputs';
import type { OperationalLedgerProps, LedgerEntry } from '../OperationalLedger.types';

/** Formats an ISO timestamp to a compact date/time string. */
function formatTimestamp(ts: string): string {
  const date = new Date(ts);
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Returns the signed display string for a quantity. */
function formatQuantity(entry: LedgerEntry): string {
  const sign = entry.type === 'credit' ? '+' : '-';
  return `${sign}${entry.quantity.toLocaleString()}`;
}

/**
 * Classic engine OperationalLedger.
 * Renders a dense table with alternating rows, signed quantity coloring,
 * timestamps, actor attribution, and inline type filters.
 */
export default function ClassicOperationalLedger(props: OperationalLedgerProps) {
  const {
    entries,
    filters,
    onFilter,
    emptyMessage = 'No ledger entries found',
    loading,
    className,
    style,
  } = props;

  if (loading) {
    return (
      <Box
        className={className}
        style={{
          padding: '20px 24px',
          background: 'var(--ds-color-bg-primary)',
          borderRadius: 12,
          border: '1px solid var(--ds-color-border, color-mix(in srgb, var(--ds-color-text-primary) 8%, transparent))',
          ...style,
        }}
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <Box
            key={`skel-${i}`}
            style={{
              width: '100%',
              height: 20,
              borderRadius: 4,
              background: 'var(--ds-color-bg-secondary)',
              marginBottom: 8,
              opacity: 1 - i * 0.15,
            }}
          />
        ))}
      </Box>
    );
  }

  return (
    <Box
      className={`ds-pattern-operational-ledger ds-engine-classic ${className ?? ''}`}
      style={{
        background: 'var(--ds-color-bg-primary)',
        borderRadius: 12,
        border: '1px solid var(--ds-color-border, color-mix(in srgb, var(--ds-color-text-primary) 8%, transparent))',
        overflow: 'hidden',
        ...style,
      }}
    >
      {/* Filter bar */}
      {onFilter && (
        <Flex
          gap={8}
          align="center"
          style={{
            padding: '12px 20px',
            borderBottom: '1px solid var(--ds-color-border, color-mix(in srgb, var(--ds-color-text-primary) 6%, transparent))',
          }}
        >
          <Select
            multiple
            placeholder="Filter by type"
            value={filters?.types || []}
            onChange={(val) => onFilter({ ...filters, types: val as ('credit' | 'debit')[] })}
            options={[
              { label: 'Credit', value: 'credit' },
              { label: 'Debit', value: 'debit' },
            ]}
            style={{ minWidth: 160 }}
            size="sm"
            allowClear
          />
        </Flex>
      )}

      {/* Table header */}
      <Box
        style={{
          display: 'grid',
          gridTemplateColumns: '140px 1fr 100px 120px 120px 120px',
          padding: '10px 20px',
          borderBottom: '1px solid var(--ds-color-border, color-mix(in srgb, var(--ds-color-text-primary) 6%, transparent))',
          background: 'var(--ds-color-bg-secondary)',
        }}
      >
        {['Timestamp', 'Description', 'Quantity', 'Actor', 'Reason', 'Reference'].map((h) => (
          <Text
            key={h}
            style={{
              fontSize: 11,
              fontWeight: 600,
              textTransform: 'uppercase' as const,
              letterSpacing: '0.04em',
              color: 'var(--ds-color-text-muted)',
              lineHeight: 1,
            }}
          >
            {h}
          </Text>
        ))}
      </Box>

      {/* Entries */}
      {entries.length === 0 ? (
        <Flex justify="center" align="center" style={{ padding: '40px 20px' }}>
          <Text style={{ fontSize: 14, color: 'var(--ds-color-text-muted)' }}>
            {emptyMessage}
          </Text>
        </Flex>
      ) : (
        entries.map((entry, idx) => (
          <Box
            key={entry.id}
            style={{
              display: 'grid',
              gridTemplateColumns: '140px 1fr 100px 120px 120px 120px',
              padding: '10px 20px',
              borderBottom:
                idx < entries.length - 1
                  ? '1px solid var(--ds-color-border, color-mix(in srgb, var(--ds-color-text-primary) 4%, transparent))'
                  : 'none',
              background:
                idx % 2 === 0
                  ? 'transparent'
                  : 'color-mix(in srgb, var(--ds-color-bg-secondary) 50%, transparent)',
              alignItems: 'center',
            }}
          >
            {/* Timestamp */}
            <Text
              style={{
                fontSize: 12,
                color: 'var(--ds-color-text-muted)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {formatTimestamp(entry.timestamp)}
            </Text>

            {/* Description */}
            <Text
              style={{
                fontSize: 13,
                color: 'var(--ds-color-text-primary)',
                fontWeight: 500,
              }}
            >
              {entry.description}
            </Text>

            {/* Quantity with sign coloring */}
            <Text
              style={{
                fontSize: 13,
                fontWeight: 600,
                fontVariantNumeric: 'tabular-nums',
                color:
                  entry.type === 'credit'
                    ? 'var(--ds-color-success)'
                    : 'var(--ds-color-error)',
              }}
            >
              {formatQuantity(entry)}
            </Text>

            {/* Actor */}
            <Text
              style={{
                fontSize: 12,
                color: 'var(--ds-color-text-secondary)',
              }}
            >
              {entry.actor}
            </Text>

            {/* Reason */}
            <Text
              style={{
                fontSize: 12,
                color: 'var(--ds-color-text-muted)',
              }}
            >
              {entry.reason ?? '--'}
            </Text>

            {/* Reference */}
            <Text
              style={{
                fontSize: 12,
                color: 'var(--ds-color-text-muted)',
                fontFamily: 'monospace',
              }}
            >
              {entry.reference ?? '--'}
            </Text>
          </Box>
        ))
      )}
    </Box>
  );
}
