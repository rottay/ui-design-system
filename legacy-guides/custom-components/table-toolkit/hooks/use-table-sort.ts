import { useState, useCallback } from 'react';
import type { SortDirection, UseTableSortOptions, UseTableSortReturn } from '../core';

export function useTableSort<T extends string>(
  options: UseTableSortOptions<T>
): UseTableSortReturn<T> {
  const { defaultField, defaultDirection = 'asc' } = options;

  const [sortField, setSortField] = useState<T>(defaultField);
  const [sortDirection, setSortDirection] = useState<SortDirection>(defaultDirection);

  const handleSort = useCallback(
    (field: T) => {
      if (field === sortField) {
        // Cycle: asc → desc → null → asc
        if (sortDirection === 'asc') setSortDirection('desc');
        else if (sortDirection === 'desc') setSortDirection(null);
        else setSortDirection('asc');
      } else {
        setSortField(field);
        setSortDirection('asc');
      }
    },
    [sortField, sortDirection]
  );

  const sortData = useCallback(
    <R extends Record<string, unknown>>(
      data: R[],
      fieldAccessor?: (item: R, field: T) => unknown
    ): R[] => {
      if (!sortDirection) return data;

      return [...data].sort((a, b) => {
        const aVal = fieldAccessor ? fieldAccessor(a, sortField) : a[sortField];
        const bVal = fieldAccessor ? fieldAccessor(b, sortField) : b[sortField];

        if (aVal == null && bVal == null) return 0;
        if (aVal == null) return 1;
        if (bVal == null) return -1;

        let cmp = 0;
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          cmp = aVal.localeCompare(bVal);
        } else if (typeof aVal === 'number' && typeof bVal === 'number') {
          cmp = aVal - bVal;
        } else {
          cmp = String(aVal).localeCompare(String(bVal));
        }

        return sortDirection === 'desc' ? -cmp : cmp;
      });
    },
    [sortField, sortDirection]
  );

  return {
    sortField,
    sortDirection,
    handleSort,
    sortData,
  };
}
