'use client';

/**
 * @fileoverview The table's `header-cell` part.
 *
 * Only a sortable header has interaction semantics -- it IS the sort control,
 * takes a tab stop and activates on Enter/Space -- and the skin gates its state
 * paint the same way (`[data-part='header-cell'][data-sortable='true']`). An
 * unsortable header stamps nothing.
 */

import React from 'react';

import { partAttributes } from '@/foundation/behavior';

import { usePartInteraction } from '../../kernel';

export interface TableHeaderCellProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  /** The gate the skin reads; also decides whether this header stamps state. */
  sortable: boolean;
}

export const TableHeaderCell = ({ sortable, children, ...rest }: TableHeaderCellProps) => {
  const { state, props } = usePartInteraction(rest, { stamped: sortable });

  return (
    <th {...partAttributes('header-cell', state)} {...props}>
      {children}
    </th>
  );
};

TableHeaderCell.displayName = 'Table.Modern.HeaderCell';
