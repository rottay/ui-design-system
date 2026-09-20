'use client';

/**
 * @fileoverview The table's `expand-button` part.
 *
 * A native button inside the row `.map`. The skin paints hover, press and
 * focus-visible on it; the platform presses a button from the keyboard too, so
 * the kernel follows Enter/Space the way the reference Button does.
 */

import React from 'react';

import { partAttributes } from '@/foundation/behavior';

import { usePartInteraction } from '../../kernel';

export type TableExpandButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export const TableExpandButton = ({ children, ...rest }: TableExpandButtonProps) => {
  const { state, props } = usePartInteraction(rest, {
    stamped: true,
    disabled: rest.disabled ?? false,
    keyboardPress: true,
  });

  return (
    <button {...partAttributes('expand-button', state)} {...props}>
      {children}
    </button>
  );
};

TableExpandButton.displayName = 'Table.Modern.ExpandButton';
