'use client';

/**
 * @fileoverview RecordPanel — the generic card-like container record pages use
 * to group unrelated content.
 *
 * It is deliberately empty of behavior: frame, padding and elevation are
 * skin-owned off the family's `data-structure='record'` hook, and the only
 * inline value is the consumer's `style` passthrough.
 *
 * @see `../index.ts` for the record family narrative and the pre-Checkpoint-D
 * `Surface*` compatibility aliases.
 */

import { type CSSProperties, type ReactNode } from 'react';

import { Box } from '../../../primitives/layout/box';

export function RecordPanel({
  children,
  style,
}: {
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <Box
      className="ds-structure ds-record"
      data-part="panel"
      data-structure="record"
      style={style}
    >
      {children}
    </Box>
  );
}
