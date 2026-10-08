import { useCallback, useMemo } from 'react';
import type { ColumnDef } from '../../../../../../../foundation/contracts/runtime/components/patterns/core';
import type { CollectionWorkspaceProps } from '..';

export interface CollectionColumnSettingsInput<T extends object> {
  controls: CollectionWorkspaceProps<T>['controls'];
  behavior: CollectionWorkspaceProps<T>['behavior'];
  capabilityColumns: ColumnDef<T>[];
  selectionEnabled: boolean;
  defaultColumnKeys: string[];
}

export function useCollectionColumnSettings<T extends object>(input: CollectionColumnSettingsInput<T>) {
  const { controls, behavior, capabilityColumns, selectionEnabled, defaultColumnKeys } = input;
  const hasColumnMenu = Boolean(
    controls?.columnSettings?.enabled &&
      (
        (
          capabilityColumns.length > 0 &&
          (
            controls.columnSettings.onColumnsChange ||
            controls.columnSettings.onVisibleColumnsChange ||
            controls.columnSettings.onColumnOrderChange ||
            controls.columnSettings.onReset
          )
        ) ||
        (
          Boolean(controls.columnSettings.actionItems?.length) &&
          Boolean(controls.columnSettings.onVisibleActionKeysChange)
        )
      ),
  );

  const columnMenuColumns = useMemo(
    () =>
      capabilityColumns.map((column) => ({
        key: column.key,
        title: typeof column.header === 'string' ? column.header : column.key,
        group: column.group,
      })),
    [capabilityColumns],
  );

  const columnMenuActions = useMemo(
    () =>
      (controls?.columnSettings?.actionItems ?? []).map((action) => ({
        key: action.key,
        title: action.label,
        locked: action.locked,
      })),
    [controls?.columnSettings?.actionItems],
  );

  const handleColumnsApply = useCallback(
    (visibleKeys: string[], orderedKeys: string[]) => {
      const settings = controls?.columnSettings;
      if (!settings) return;

      if (settings.onColumnsChange) {
        settings.onColumnsChange(visibleKeys, orderedKeys);
        return;
      }

      settings.onColumnOrderChange?.(orderedKeys);
      settings.onVisibleColumnsChange?.(visibleKeys);
    },
    [controls?.columnSettings],
  );

  const handleColumnsReset = useCallback(() => {
    const settings = controls?.columnSettings;
    if (!settings) return;

    if (settings.onReset) {
      settings.onReset();
      return;
    }

    handleColumnsApply(defaultColumnKeys, defaultColumnKeys);
  }, [controls?.columnSettings, defaultColumnKeys, handleColumnsApply]);

  const handleVisibleActionsApply = useCallback((visibleKeys: string[]) => {
    controls?.columnSettings?.onVisibleActionKeysChange?.(visibleKeys);
  }, [controls?.columnSettings]);

  const handleSelectionModeToggle = useCallback(() => {
    behavior?.selection?.onModeChange?.(!selectionEnabled);
  }, [behavior?.selection, selectionEnabled]);
  return {
    hasColumnMenu, columnMenuColumns, columnMenuActions, handleColumnsApply, handleColumnsReset,
    handleVisibleActionsApply, handleSelectionModeToggle,
  };
}
