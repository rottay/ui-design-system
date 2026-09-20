'use client';

/**
 * @fileoverview The table's `field` part: the column filter input and the
 * inline cell editor's text/number/date input and select.
 *
 * The skin re-asserts the governed focus ring on it, so focus-visible is the
 * state that matters here. `onBlur` is the editor's own commit hook and is
 * composed with the kernel's, never replaced.
 */

import React from 'react';

import { partAttributes } from '@/foundation/behavior';

import { usePartInteraction } from '../../kernel';

export type TableFieldInputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const TableFieldInput = React.forwardRef<HTMLInputElement, TableFieldInputProps>(
  (rest, ref) => {
    const { state, props } = usePartInteraction(rest, {
      stamped: true,
      disabled: rest.disabled ?? false,
    });

    return <input {...partAttributes('field', state)} {...props} ref={ref} />;
  }
);

TableFieldInput.displayName = 'Table.Modern.FieldInput';

export type TableFieldSelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

export const TableFieldSelect = React.forwardRef<HTMLSelectElement, TableFieldSelectProps>(
  ({ children, ...rest }, ref) => {
    const { state, props } = usePartInteraction(rest, {
      stamped: true,
      disabled: rest.disabled ?? false,
    });

    return (
      <select {...partAttributes('field', state)} {...props} ref={ref}>
        {children}
      </select>
    );
  }
);

TableFieldSelect.displayName = 'Table.Modern.FieldSelect';
