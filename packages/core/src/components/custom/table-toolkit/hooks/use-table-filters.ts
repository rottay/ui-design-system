import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import type { UseTableFiltersOptions, UseTableFiltersReturn } from '../core';

export function useTableFilters<T extends Record<string, string>>(
  options: UseTableFiltersOptions<T>
): UseTableFiltersReturn<T> {
  const {
    defaultFilters,
    debounceMs = 300,
    debouncedKeys = ['search'] as (keyof T)[],
    minSearchLength = 0,
  } = options;

  const [filters, setFiltersState] = useState<T>({ ...defaultFilters });
  const [debouncedFilters, setDebouncedFilters] = useState<T>({ ...defaultFilters });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce specified keys
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setDebouncedFilters({ ...filters });
    }, debounceMs);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [filters, debounceMs]);

  const setFilter = useCallback((key: keyof T, value: string) => {
    setFiltersState((prev) => ({ ...prev, [key]: value }));
  }, []);

  const setFilters = useCallback((updates: Partial<T>) => {
    setFiltersState((prev) => ({ ...prev, ...updates }));
  }, []);

  const resetFilters = useCallback(() => {
    setFiltersState({ ...defaultFilters });
    setDebouncedFilters({ ...defaultFilters });
  }, [defaultFilters]);

  const isFiltered = useMemo(() => {
    return Object.keys(defaultFilters).some((key) => {
      const k = key as keyof T;
      const current = filters[k];
      const def = defaultFilters[k];
      if (debouncedKeys.includes(k)) {
        return current !== def && current.length >= minSearchLength;
      }
      return current !== def;
    });
  }, [filters, defaultFilters, debouncedKeys, minSearchLength]);

  const getFilter = useCallback(
    (key: keyof T): string => {
      if (debouncedKeys.includes(key)) {
        return debouncedFilters[key];
      }
      return filters[key];
    },
    [filters, debouncedFilters, debouncedKeys]
  );

  return {
    filters,
    setFilter,
    setFilters,
    resetFilters,
    isFiltered,
    getFilter,
  };
}
