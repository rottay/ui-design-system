'use client';

/**
 * @fileoverview useFilterPanel composition hook -- manages filter values,
 * reset, and active count tracking. Returns `filterProps` ready to spread
 * onto PatternFilterPanel.
 *
 * Use this hook when you need to coordinate filter state with other UI
 * (e.g. a DataTable or URL query params). The `activeCount` and
 * `hasActiveFilters` flags are handy for "N filters applied" badges.
 *
 * @example
 * ```tsx
 * const { filterProps, hasActiveFilters } = useFilterPanel({
 *   filters: [{ key: 'status', type: 'select', options: statusOptions }],
 *   onChange: (values) => refetch(values),
 * });
 * return <PatternFilterPanel {...filterProps} />;
 * ```
 */

import { useState, useCallback, useMemo } from 'react';
import type { FilterDef } from '../types';

export interface UseFilterPanelOptions {
  filters: FilterDef[];
  initialValues?: Record<string, unknown>;
  onChange?: (values: Record<string, unknown>) => void;
}

export interface UseFilterPanelReturn {
  values: Record<string, unknown>;
  setValue: (key: string, value: unknown) => void;
  setValues: (values: Record<string, unknown>) => void;
  reset: () => void;
  activeCount: number;
  hasActiveFilters: boolean;
  filterProps: {
    filters: FilterDef[];
    values: Record<string, unknown>;
    onChange: (values: Record<string, unknown>) => void;
    onReset: () => void;
    activeCount: number;
  };
}

/**
 * Manages filter state for a set of filter definitions, with reset and
 * active-count tracking.
 *
 * Every `setValue` / `setValues` call immediately notifies the parent via
 * `onChange`, making it straightforward to trigger server-side refetches.
 *
 * @param options - Filter definitions, initial values, and change callback.
 * @returns Filter state plus a `filterProps` object ready to spread onto
 *          PatternFilterPanel.
 *
 * @example
 * ```tsx
 * const { filterProps, activeCount } = useFilterPanel({ filters, onChange: refetch });
 * ```
 */
export function useFilterPanel(options: UseFilterPanelOptions): UseFilterPanelReturn {
  const { filters, initialValues, onChange } = options;

  // Build the default values map once per filter set. These serve both as
  // the initial state and as the baseline for determining which filters
  // are "active" (i.e. differ from their default).
  const defaults = useMemo(() => {
    const d: Record<string, unknown> = {};
    for (const f of filters) {
      d[f.key] = initialValues?.[f.key] ?? f.defaultValue ?? undefined;
    }
    return d;
  }, [filters, initialValues]);

  const [values, setValuesState] = useState<Record<string, unknown>>(defaults);

  const setValue = useCallback((key: string, value: unknown) => {
    setValuesState((prev) => {
      const next = { ...prev, [key]: value };
      onChange?.(next);
      return next;
    });
  }, [onChange]);

  const setValues = useCallback((newValues: Record<string, unknown>) => {
    setValuesState((prev) => {
      const next = { ...prev, ...newValues };
      onChange?.(next);
      return next;
    });
  }, [onChange]);

  const reset = useCallback(() => {
    setValuesState(defaults);
    onChange?.(defaults);
  }, [defaults, onChange]);

  // Count filters whose value meaningfully differs from the default.
  // Empty strings, nulls, undefined, and empty arrays are treated as
  // "not active" even if the default was something else, since they
  // represent a cleared filter from the user's perspective.
  const activeCount = useMemo(() => {
    return Object.entries(values).filter(([key, val]) => {
      if (val === undefined || val === null || val === '') return false;
      if (Array.isArray(val) && val.length === 0) return false;
      return val !== defaults[key];
    }).length;
  }, [values, defaults]);

  return {
    values,
    setValue,
    setValues,
    reset,
    activeCount,
    hasActiveFilters: activeCount > 0,
    filterProps: {
      filters,
      values,
      onChange: setValues,
      onReset: reset,
      activeCount,
    },
  };
}
