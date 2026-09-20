'use client';

/**
 * @fileoverview The table's `selection-control` part.
 *
 * The row checkbox/radio, the select-all, and the inline checkbox editor. The
 * skin paints focus-visible and disabled on it; `checked` and `indeterminate`
 * stay native properties and the row's `data-selected` stays the family's own
 * vocabulary.
 */

import React from 'react';

import { partAttributes } from '@/foundation/behavior';

import { usePartInteraction } from '../../kernel';

export type TableSelectionControlProps = React.InputHTMLAttributes<HTMLInputElement>;

export const TableSelectionControl = React.forwardRef<HTMLInputElement, TableSelectionControlProps>(
  (rest, ref) => {
    const { state, props } = usePartInteraction(rest, {
      stamped: true,
      disabled: rest.disabled ?? false,
    });

    return <input {...partAttributes('selection-control', state)} {...props} ref={ref} />;
  }
);

TableSelectionControl.displayName = 'Table.Modern.SelectionControl';
