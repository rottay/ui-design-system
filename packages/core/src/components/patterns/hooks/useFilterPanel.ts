'use client';

/**
 * useFilterPanel - Composition Hook
 *
 * Manages filter state for FilterPanel pattern.
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

export function useFilterPanel(options: UseFilterPanelOptions): UseFilterPanelReturn {
  const { filters, initialValues, onChange } = options;

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
