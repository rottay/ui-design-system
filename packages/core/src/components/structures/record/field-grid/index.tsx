'use client';

/**
 * @fileoverview RecordFieldGrid — the pure CSS-grid wrapper that lays out
 * `RecordField` cards.
 *
 * INLINE BOUNDARY: the caller's runtime `columns` prop is the ONE legal inline
 * write — the `--ds-record-field-grid-columns` channel. Display, gap,
 * alignment and the channel's DEFAULT (the intrinsic auto-fit measure over a
 * 16rem minimum, private measure channel included) are skin-owned: the skin
 * authors the default declaration, so an unset prop changes nothing. An
 * explicit `columns` prop still always wins.
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
  /* Unset by default: the skin authors the intrinsic default (auto-fit over a
     16rem minimum measure), so a narrow container re-flows 2→1 columns with
     no caller override. A caller's explicit `columns` rides the
     `--ds-record-field-grid-columns` channel and always wins. */
  columns,
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
      style={{
        ...(columns !== undefined
          ? ({ '--ds-record-field-grid-columns': columns } as CSSProperties)
          : undefined),
        ...style,
      }}
    >
      {children}
    </Box>
  );
}
