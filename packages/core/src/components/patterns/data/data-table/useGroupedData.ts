/**
 * @fileoverview Hook that groups flat data by a column value and computes
 * per-group aggregation summaries. Used internally by engine renderers
 * when `groupBy` is set, and also exported for external composition.
 *
 * The hook is intentionally stateless with respect to collapsed/expanded
 * groups -- that state lives in the engine renderer so each engine can
 * manage it independently (e.g. the classic engine may use Ant's internal
 * expand API).
 */

import { useMemo } from 'react';
import type { ReactNode } from 'react';
import type { AggregationFn } from './DataTable.types';

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

/**
 * A single group section containing a shared group value, the items in
 * that group, and computed aggregate values keyed by column key.
 */
export interface GroupedSection<T> {
  /** The shared value that identifies this group (stringified). */
  groupValue: string;
  /** The data items belonging to this group, in their original order. */
  items: T[];
  /** Computed aggregation values keyed by column key. */
  aggregates: Record<string, ReactNode>;
}

// ---------------------------------------------------------------------------
// Built-in aggregation implementations
// ---------------------------------------------------------------------------

/**
 * Resolves a single aggregation function against a set of items and a
 * column key. Numeric built-in functions coerce values to numbers and
 * silently skip `NaN` entries.
 */
function computeAggregate<T>(
  items: T[],
  columnKey: string,
  fn: AggregationFn<T>,
): ReactNode {
  // Custom function -- delegate entirely
  if (typeof fn === 'function') {
    return fn(items);
  }

  // Extract numeric values for built-in strategies
  const numericValues: number[] = [];
  for (const item of items) {
    const raw = (item as Record<string, unknown>)[columnKey];
    const num = Number(raw);
    if (!Number.isNaN(num) && raw !== null && raw !== undefined && raw !== '') {
      numericValues.push(num);
    }
  }

  switch (fn) {
    case 'count':
      return items.length;

    case 'sum': {
      if (numericValues.length === 0) return 0;
      const total = numericValues.reduce((acc, v) => acc + v, 0);
      return Number.isInteger(total) ? total : Number(total.toFixed(2));
    }

    case 'average': {
      if (numericValues.length === 0) return 0;
      const avg = numericValues.reduce((acc, v) => acc + v, 0) / numericValues.length;
      return Number(avg.toFixed(2));
    }

    case 'min': {
      if (numericValues.length === 0) return '-';
      return Math.min(...numericValues);
    }

    case 'max': {
      if (numericValues.length === 0) return '-';
      return Math.max(...numericValues);
    }

    default:
      return null;
  }
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Groups `data` by the value of `data[groupBy]` and computes per-group
 * aggregation summaries.
 *
 * When `groupBy` is `undefined`, the hook short-circuits and returns
 * `isGrouped: false` with a single passthrough section containing all
 * items. This lets consumers skip conditional logic around grouping.
 *
 * @typeParam T - The shape of a single data row.
 *
 * @param data         - The flat data array to group.
 * @param groupBy      - The column key whose value determines grouping.
 *                        `undefined` disables grouping.
 * @param aggregations - Optional aggregation functions keyed by column key.
 *
 * @returns An object with `sections` (grouped data) and `isGrouped` flag.
 *
 * @example
 * ```tsx
 * const { sections, isGrouped } = useGroupedData(
 *   users,
 *   'department',
 *   { salary: 'average', id: 'count' },
 * );
 * ```
 */
export function useGroupedData<T>(
  data: T[],
  groupBy: string | undefined,
  aggregations?: Record<string, AggregationFn<T>>,
): { sections: GroupedSection<T>[]; isGrouped: boolean } {
  return useMemo(() => {
    // Fast path -- no grouping requested
    if (!groupBy) {
      return {
        sections: [{
          groupValue: '',
          items: data,
          aggregates: {},
        }],
        isGrouped: false,
      };
    }

    // Build a Map preserving insertion order (first occurrence wins)
    const groupMap = new Map<string, T[]>();

    for (const item of data) {
      const raw = (item as Record<string, unknown>)[groupBy];
      const groupValue = raw == null ? '' : String(raw);

      const existing = groupMap.get(groupValue);
      if (existing) {
        existing.push(item);
      } else {
        groupMap.set(groupValue, [item]);
      }
    }

    // Build sections with aggregation
    const sections: GroupedSection<T>[] = [];

    for (const [groupValue, items] of groupMap) {
      const aggregates: Record<string, ReactNode> = {};

      if (aggregations) {
        for (const [columnKey, fn] of Object.entries(aggregations)) {
          aggregates[columnKey] = computeAggregate(items, columnKey, fn);
        }
      }

      sections.push({ groupValue, items, aggregates });
    }

    return { sections, isGrouped: true };
  }, [data, groupBy, aggregations]);
}
