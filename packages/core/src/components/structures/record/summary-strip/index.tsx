'use client';

/**
 * @fileoverview RecordSummaryStrip — the horizontal/grid summary card at the
 * top of a record page.
 *
 * Renders label/value/helper triples in five visual variants (default,
 * editorial, technical, governance, metrics). Items whose value is empty are
 * dropped, and a strip with nothing left to show renders nothing rather than
 * an empty frame.
 *
 * STATES (C-12): `loading` renders the shared anatomy-derived skeleton — the
 * resolved item chrome is built once and mirrored bone-for-part, so the wait
 * has the shape of the strip it stands in for.
 *
 * SPECIFICITY HOOK: the root stamps `data-structure='record'`, the family's
 * always-present attribute, so the skin buys its (0,4,0) border floor without
 * repeating a class. Grid rhythm and the per-variant columns/padding/gap are
 * skin-owned off `data-variant`.
 *
 * The family stays domain-agnostic: every label, value and helper is
 * consumer-supplied.
 *
 * @see `../index.ts` for the record family narrative and the pre-Checkpoint-D
 * `Surface*` compatibility aliases.
 */

import { type CSSProperties, type ReactNode } from 'react';

import { Box } from '../../../primitives/layout/box';
import { Stack } from '../../../primitives/layout/stack';
import { Text } from '../../../primitives/display/typography/compound/text';
import { AnatomySkeleton } from '../../../primitives/feedback/skeleton/runtime/anatomy-renderer';

export interface RecordSummaryItem {
  label: string;
  value: ReactNode;
  helper?: ReactNode;
  mono?: boolean;
}

export function RecordSummaryStrip({
  items,
  variant = 'default',
  loading = false,
  style,
}: {
  items: RecordSummaryItem[];
  variant?: 'default' | 'editorial' | 'technical' | 'governance' | 'metrics';
  /** Mirrors the resolved item chrome with the shared anatomy-derived
      skeleton while the summary data resolves. */
  loading?: boolean;
  style?: CSSProperties;
}) {
  const visibleItems = items.filter((item) => item.value !== undefined && item.value !== null && item.value !== '');

  if (!visibleItems.length) {
    return null;
  }

  /* Grid rhythm + per-variant columns/padding/gap are skin-owned off
     data-variant (they were an inline variantStyles map). */
  const chrome = (
    <Box data-part="summary-grid">
      {visibleItems.map((item) => (
        <Stack key={item.label} data-part="summary-item" spacing={4}>
          <Text
            data-part="summary-item-label"
            size="xs"
            weight="bold"
          >
            {item.label}
          </Text>
          <Text
            data-part="summary-item-value"
            data-mono={item.mono ? 'true' : undefined}
            size={variant === 'metrics' ? 'md' : 'sm'}
            weight="medium"
          >
            {item.value}
          </Text>
          {item.helper ? (
            <Text data-part="summary-item-helper" size="xs">
              {item.helper}
            </Text>
          ) : null}
        </Stack>
      ))}
    </Box>
  );

  return (
    <Box
      className="ds-structure ds-record"
      data-part="summary-strip"
      data-structure="record"
      data-variant={variant}
      data-loading={loading ? 'true' : undefined}
      aria-busy={loading ? true : undefined}
      style={style}
    >
      {/* The root keeps the announcement (`aria-busy`), so the skeleton is told
          not to announce a second time. */}
      {loading ? <AnatomySkeleton busy={false}>{chrome}</AnatomySkeleton> : chrome}
    </Box>
  );
}
