'use client';

/**
 * @fileoverview The table's `pagination-button` part.
 *
 * Native buttons, so the kernel's `disabled` token follows the native
 * `disabled` attribute and nothing else: the current-page readout carries
 * `aria-disabled` without being disabled, and the skin's disabled rule has
 * never applied to it. It is also `pointer-events: none` and out of the tab
 * order, so it reaches no interaction state -- the stamp does not invent one.
 */

import React from 'react';

import { partAttributes } from '@/foundation/behavior';

import { usePartInteraction } from '../../kernel';

export type TablePaginationButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export const TablePaginationButton = ({ children, ...rest }: TablePaginationButtonProps) => {
  const { state, props } = usePartInteraction(rest, {
    stamped: true,
    disabled: rest.disabled ?? false,
    keyboardPress: true,
  });

  return (
    <button {...partAttributes('pagination-button', state)} {...props}>
      {children}
    </button>
  );
};

TablePaginationButton.displayName = 'Table.Modern.PaginationButton';
