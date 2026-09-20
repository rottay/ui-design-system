'use client';

/**
 * @fileoverview The table's body `cell` part.
 *
 * Cells render inside a `.map`, so each stamping cell needs its own component
 * to host the kernel. Only an editable cell paints, and the skin gates that
 * hover the same way (`[data-editable='true']`), so a plain data cell stamps
 * nothing. The kernel still tracks it, because this is the gate that closes
 * under a mounted part: the inline editor drops `data-editable` while it is up,
 * and a cell that stopped listening there would miss the pointer leaving and
 * reopen painting a hover ghost.
 *
 * `column.onCell` props arrive in `rest` and are composed, not replaced.
 *
 * The row/cell is a CONTAINER: React's focus events bubble, so it takes no
 * focus listener -- `:focus-visible`, the twin this stamp mirrors, never
 * matches an ancestor, and the skin paints hover here and nothing else.
 */

import React from 'react';

import { partAttributes } from '@/foundation/behavior';

import { usePartInteraction } from '../../kernel';

export interface TableBodyCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  /** The gate the skin reads; also decides whether this cell stamps state. */
  editable: boolean;
}

export const TableBodyCell = ({ editable, children, ...rest }: TableBodyCellProps) => {
  const { state, props } = usePartInteraction(rest, { stamped: editable, focusable: false });

  return (
    <td {...partAttributes('cell', state)} {...props}>
      {children}
    </td>
  );
};

TableBodyCell.displayName = 'Table.Modern.BodyCell';
