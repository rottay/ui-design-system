'use client';

/**
 * @fileoverview RecordFieldGrid — the pure CSS-grid wrapper that lays out
 * `RecordField` cards.
 *
 * INLINE BOUNDARY: `gridTemplateColumns` is the only inline value and it is the
 * caller's runtime `columns` prop. Display, gap and alignment are skin-owned.
 * The default track embeds the private `--_ds-record-field-measure` channel
 * (fallback 16rem) so a tenant density/geometry posture can retune the 2→1
 * reflow point from one place; an explicit `columns` prop always wins.
 *
 * SPECIFICITY HOOK: the root stamps `data-structure='record'`, the family's
 * always-present attribute.
 *
 * @see `../index.ts` for the record family narrative and the pre-Checkpoint-D
 * `Surface*` compatibility aliases.
 */

import { type CSSProperties, type ReactNode } from 'react';

import { Box } from '../../../primitives/layout/box';

export function RecordFieldGrid({
  children,
  /* The default is intrinsic: tracks auto-fit a minimum measure, so a
     narrow container re-flows 2→1 columns and long labels/values never force
     an overflow. The measure rides the private
     `--_ds-record-field-measure` channel (fallback 16rem, the exact
     value painted before) so a tenant density/geometry posture can retune
     the 2→1 reflow point from one place. A caller's explicit `columns`
     always wins (runtime prop). */
  columns = 'repeat(auto-fit, minmax(min(100%, var(--_ds-record-field-measure, 16rem)), 1fr))',
  style,
}: {
  children: ReactNode;
  columns?: string;
  style?: CSSProperties;
}) {
  return (
    <Box
      className="ds-structure ds-record"
      data-part="field-grid"
      data-structure="record"
      /* gridTemplateColumns stays inline: it is the caller's runtime `columns`
         prop. Display/gap/alignment are skin-owned. */
      style={{
        gridTemplateColumns: columns,
        ...style,
      }}
    >
      {children}
    </Box>
  );
}
