/**
 * Type-Safe Column Builders
 *
 * Utility functions for building ColumnDef arrays with type inference.
 *
 * @example
 * const cols = columns<Candidate>([
 *   column('name', { header: 'Name', sortable: true }),
 *   column('status', { render: (v) => <Badge>{v}</Badge> }),
 * ]);
 */

import type { ReactNode } from 'react';
import type { ColumnDef } from '../types';

type ColumnOptions<T, K extends keyof T & string> = Omit<ColumnDef<T>, 'key' | 'accessorKey'> & {
  header?: ReactNode;
};

/**
 * Create a single column definition with type inference.
 */
export function column<T, K extends keyof T & string>(
  key: K,
  options: ColumnOptions<T, K> = {} as ColumnOptions<T, K>
): ColumnDef<T> {
  const { header, ...rest } = options;
  return {
    key,
    accessorKey: key,
    header: header ?? key.charAt(0).toUpperCase() + key.slice(1),
    ...rest,
  };
}

/**
 * Create a column array with type checking.
 */
export function columns<T>(defs: ColumnDef<T>[]): ColumnDef<T>[] {
  return defs;
}

/**
 * Create an actions column (no data accessor).
 */
export function actionsColumn<T>(
  render: (row: T, index: number) => ReactNode,
  options: Partial<ColumnDef<T>> = {}
): ColumnDef<T> {
  return {
    key: '__actions',
    header: '',
    align: 'right',
    width: 'auto',
    render: (_value, row, index) => render(row, index),
    ...options,
  };
}
