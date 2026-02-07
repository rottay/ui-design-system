import { useState, useCallback, useMemo } from 'react';
import type { UseBulkSelectionOptions, UseBulkSelectionReturn } from '../core';

export function useBulkSelection(options: UseBulkSelectionOptions): UseBulkSelectionReturn {
  const {
    totalCount,
    onSelectionChange,
    initialSelectedKeys = [],
    initialBulkMode = false,
  } = options;

  const [bulkSelectMode, setBulkSelectMode] = useState(initialBulkMode);
  const [selectedKeys, setSelectedKeysState] = useState<string[]>(initialSelectedKeys);

  const setSelectedKeys = useCallback(
    (keys: string[]) => {
      setSelectedKeysState(keys);
      onSelectionChange?.(keys);
    },
    [onSelectionChange]
  );

  const toggleBulkMode = useCallback(() => {
    setBulkSelectMode((prev) => {
      if (prev) {
        // Exiting bulk mode - clear selection
        setSelectedKeys([]);
      }
      return !prev;
    });
  }, [setSelectedKeys]);

  const selectAll = useCallback(
    (allIds: string[]) => {
      setSelectedKeys(allIds);
    },
    [setSelectedKeys]
  );

  const deselectAll = useCallback(() => {
    setSelectedKeys([]);
  }, [setSelectedKeys]);

  const toggleItem = useCallback(
    (id: string) => {
      setSelectedKeysState((prev) => {
        const next = prev.includes(id) ? prev.filter((k) => k !== id) : [...prev, id];
        onSelectionChange?.(next);
        return next;
      });
    },
    [onSelectionChange]
  );

  const isSelected = useCallback(
    (id: string) => selectedKeys.includes(id),
    [selectedKeys]
  );

  const selectedCount = selectedKeys.length;

  const isAllSelected = useMemo(
    () => totalCount > 0 && selectedCount === totalCount,
    [totalCount, selectedCount]
  );

  const isSomeSelected = useMemo(
    () => selectedCount > 0 && selectedCount < totalCount,
    [selectedCount, totalCount]
  );

  return {
    bulkSelectMode,
    selectedKeys,
    isAllSelected,
    isSomeSelected,
    selectedCount,
    toggleBulkMode,
    selectAll,
    deselectAll,
    toggleItem,
    isSelected,
  };
}
