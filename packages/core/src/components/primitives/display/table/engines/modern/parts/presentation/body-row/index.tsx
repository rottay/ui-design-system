'use client';

/**
 * @fileoverview The table's body `row` part.
 *
 * Rows render inside a `.map`, so the interaction kernel needs a component of
 * its own to live in. The row keeps its own vocabulary (`data-selected`,
 * `aria-expanded`) -- the stamp only adds the kernel's `data-state` twin for
 * the hover the skin paints under `[data-hoverable='true']`.
 *
 * `onRow` props arrive in `rest` and are composed, not replaced: a consumer
 * that listens for `onPointerEnter` still hears it.
 *
 * The row/cell is a CONTAINER: React's focus events bubble, so it takes no
 * focus listener -- `:focus-visible`, the twin this stamp mirrors, never
 * matches an ancestor, and the skin paints hover here and nothing else.
 */

import React from 'react';

import { partAttributes } from '@/foundation/behavior';

import { usePartInteraction } from '../../kernel';

export interface TableBodyRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  /** The gate the skin reads; also decides whether this row stamps state. */
  hoverable: boolean;
}

export const TableBodyRow = ({ hoverable, children, ...rest }: TableBodyRowProps) => {
  const { state, props } = usePartInteraction(rest, { stamped: hoverable, focusable: false });

  return (
    <tr {...partAttributes('row', state)} {...props}>
      {children}
    </tr>
  );
};

TableBodyRow.displayName = 'Table.Modern.BodyRow';
