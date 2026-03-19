'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { createEngineComponent } from '../../../engines/factory';
import { useBreakpoints } from '../../../hooks/responsive/useBreakpoints';
import { useMediaQuery } from '../../../hooks/responsive/useMediaQuery';
import { Box, Button, Flex, Stack, Text } from '../../primitives';
import type { ColumnDef, ResponsiveColumnMode } from '../types';
import type { DataTablePatternProps } from './DataTable.types';
import { resolveRowKey } from './DataTable.types';
import { DataTableMobileCards } from './DataTableMobileCards';

/**
 * Resolves the effective responsive mode for a column at the current device class.
 * Returns `'visible'` when the column has no `responsive` config (backward-compatible).
 */
function getColumnResponsiveMode<T>(
  column: ColumnDef<T>,
  deviceKey: 'phone' | 'tablet' | 'desktop',
): ResponsiveColumnMode {
  return column.responsive?.[deviceKey] ?? 'visible';
}

/**
 * Maps the `useBreakpoints()` result to a device class key matching the
 * `ColumnResponsiveConfig` interface.
 */
function resolveDeviceKey(bp: { isMobile: boolean; isTablet: boolean }): 'phone' | 'tablet' | 'desktop' {
  if (bp.isMobile) return 'phone';
  if (bp.isTablet) return 'tablet';
  return 'desktop';
}

const DataTableEngine = createEngineComponent<DataTablePatternProps<any>>(
  'PatternDataTable',
  {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/modern'),
    rustic: () => import('./engines/rustic'),
  }
);

function MobileBulkActions<T extends object>({
  selectedKeys,
  data,
  rowKey,
  bulkActions,
}: {
  selectedKeys: string[];
  data: T[];
  rowKey?: keyof T | ((row: T) => string);
  bulkActions?: DataTablePatternProps<T>['bulkActions'];
}): React.ReactElement | null {
  if (!bulkActions || bulkActions.length === 0 || selectedKeys.length === 0) {
    return null;
  }

  const selectedRows = data.filter((row, index) =>
    selectedKeys.includes(resolveRowKey(row, rowKey, index))
  );

  return (
    <Flex align="center" justify="between" gap={12} wrap="wrap">
      <Text style={{ fontSize: 13, color: 'var(--ds-color-text-muted)' }}>
        {`${selectedKeys.length} selected`}
      </Text>
      <Flex gap={8} wrap="wrap">
        {bulkActions.map((action) => (
          <Button
            key={action.key}
            variant={
              action.variant === 'danger'
                ? 'danger'
                : action.variant === 'primary'
                  ? 'primary'
                  : 'ghost'
            }
            size="sm"
            disabled={action.disabled}
            icon={action.icon}
            onClick={() => action.onExecute(selectedRows)}
          >
            {action.label}
          </Button>
        ))}
      </Flex>
    </Flex>
  );
}

export function PatternDataTable<T extends object>(
  props: DataTablePatternProps<T>
): React.ReactElement {
  const {
    data,
    columns,
    rowKey,
    selectedKeys: controlledSelectedKeys,
    onSelectionChange,
    selectable = false,
    header,
    toolbar,
    footer,
    bulkActions,
    emptyState,
    loading = false,
    mobileCard,
    mobileBreakpoint = 768,
    actions,
    onRowClick,
  } = props;
  const isMobile = useMediaQuery(`(max-width: ${Math.max(mobileBreakpoint - 1, 0)}px)`);
  const breakpoints = useBreakpoints();
  const deviceKey = resolveDeviceKey(breakpoints);
  const [internalSelectedKeys, setInternalSelectedKeys] = useState<string[]>([]);

  const selectedKeys = controlledSelectedKeys ?? internalSelectedKeys;
  const handleSelectionChange = useCallback(
    (keys: string[], rows: T[]) => {
      if (controlledSelectedKeys === undefined) {
        setInternalSelectedKeys(keys);
      }
      onSelectionChange?.(keys, rows);
    },
    [controlledSelectedKeys, onSelectionChange]
  );
  const getRowKey = useCallback(
    (row: T, index: number) => resolveRowKey(row, rowKey, index),
    [rowKey]
  );

  const toggleSelection = useCallback(
    (key: string) => {
      const nextKeys = selectedKeys.includes(key)
        ? selectedKeys.filter((selectedKey) => selectedKey !== key)
        : [...selectedKeys, key];
      const selectedRows = data.filter((candidate, index) =>
        nextKeys.includes(getRowKey(candidate, index))
      );

      handleSelectionChange(nextKeys, selectedRows);
    },
    [data, getRowKey, handleSelectionChange, selectedKeys]
  );

  const visibleColumns = useMemo(
    () =>
      columns.filter((column) => {
        // Respect the legacy `visible` prop first
        if (column.visible === false) return false;
        // Filter out columns explicitly hidden at the current breakpoint
        const mode = getColumnResponsiveMode(column, deviceKey);
        return mode !== 'hidden';
      }),
    [columns, deviceKey]
  );
  const shouldUseMobileCards = isMobile && visibleColumns.length > 0;

  if (shouldUseMobileCards) {
    return (
      <Stack spacing="md">
        {header}
        {toolbar}
        <MobileBulkActions
          selectedKeys={selectedKeys}
          data={data}
          rowKey={rowKey}
          bulkActions={bulkActions}
        />

        {loading && data.length === 0 ? (
          <Box
            style={{
              padding: '32px 20px',
              borderRadius: 16,
              border: '1px solid color-mix(in srgb, var(--ds-color-text-primary) 8%, transparent)',
              background: 'var(--ds-color-bg-primary)',
            }}
          >
            <Text style={{ color: 'var(--ds-color-text-muted)' }}>Loading…</Text>
          </Box>
        ) : data.length === 0 ? (
          <Box
            style={{
              padding: '32px 20px',
              borderRadius: 16,
              border: '1px solid color-mix(in srgb, var(--ds-color-text-primary) 8%, transparent)',
              background: 'var(--ds-color-bg-primary)',
            }}
          >
            {emptyState ?? <Text style={{ color: 'var(--ds-color-text-muted)' }}>No data</Text>}
          </Box>
        ) : (
          <DataTableMobileCards
            data={data}
            columns={visibleColumns}
            deviceKey={deviceKey}
            getRowKey={getRowKey}
            selectedKeys={selectedKeys}
            selectable={selectable}
            onToggleSelection={selectable ? (key) => toggleSelection(key) : undefined}
            onRowClick={onRowClick}
            actions={actions}
            mobileCard={mobileCard}
          />
        )}

        {footer}
      </Stack>
    );
  }

  return (
    <DataTableEngine
      {...props}
      columns={visibleColumns}
      selectedKeys={selectedKeys}
      onSelectionChange={handleSelectionChange}
    />
  );
}
