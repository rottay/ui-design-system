/** Runtime values and operations separated from the public type contract. */

import type { ColumnDef } from '@/foundation/contracts/runtime/components/patterns/core';
import type { DataTablePatternProps } from '../../contracts';

function readRecordValue(value: unknown, key: PropertyKey): unknown {
  if (typeof value !== 'object' || value === null) return undefined;
  return Reflect.get(value, key);
}

/**
 * Resolves the display value for a cell by checking the column's accessor
 * chain: `accessorFn` first, then `accessorKey`, then falls back to `key`.
 *
 * @typeParam T - Row data shape.
 * @param column - The column definition to resolve.
 * @param row    - The data row to extract the value from.
 * @returns The raw cell value (before any `render` transform).
 */
export function resolveAccessor<T>(column: ColumnDef<T>, row: T): unknown {
  if (column.accessorFn) return column.accessorFn(row);
  if (column.accessorKey) return readRecordValue(row, column.accessorKey);
  return readRecordValue(row, column.key);
}

/**
 * Resolves a unique string key for a table row, used for React keys and
 * selection tracking. Falls back to the array index when `rowKey` is not
 * provided.
 *
 * @typeParam T - Row data shape.
 * @param row    - The data row.
 * @param rowKey - The `rowKey` prop from DataTablePatternProps.
 * @param index  - The array index, used as fallback.
 * @returns A string uniquely identifying this row.
 */
export function resolveRowKey<T>(row: T, rowKey: DataTablePatternProps<T>['rowKey'], index: number): string {
  if (!rowKey) return String(index);
  if (typeof rowKey === 'function') return rowKey(row);
  return String(readRecordValue(row, rowKey as string));
}
