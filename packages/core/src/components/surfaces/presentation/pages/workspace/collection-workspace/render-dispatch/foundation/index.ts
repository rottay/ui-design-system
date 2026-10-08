import type { ReactNode } from 'react';
import type { ColumnDef } from '../../../../../../../../foundation/contracts/runtime/components/patterns/core';

// ---------------------------------------------------------------------------
// Key resolver
// ---------------------------------------------------------------------------

export function resolveKey<T extends object>(
  item: T,
  rowKey: keyof T | ((row: T) => string),
): string {
  if (typeof rowKey === 'function') return rowKey(item);
  return String(readCollectionRecordValue(item, rowKey));
}

export function readCollectionRecordValue(value: unknown, key: PropertyKey): unknown {
  if (typeof value !== 'object' || value === null) return undefined;
  return Reflect.get(value, key);
}

export function getColumnHeader(column: ColumnDef<unknown>): ReactNode {
  const legacyTitle = (column as ColumnDef<unknown> & { title?: ReactNode }).title;
  return column.header ?? legacyTitle ?? column.key;
}

export function getColumnCapabilityId<T>(column: ColumnDef<T>): string {
  const fieldId = (column as ColumnDef<T> & { fieldId?: string }).fieldId;
  return fieldId?.trim() || column.key;
}

export type SurfaceTranslator = (
  key: string,
  fallback: string,
  params?: Record<string, string | number>,
) => string;
