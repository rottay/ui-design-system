'use client';

import React from 'react';
import { Box, Card, Checkbox, Flex, Stack, Text } from '../../../primitives';
import type { ColumnDef, ResponsiveColumnMode } from '../../foundation/types';
import type { DataTableMobileCardContext } from './DataTable.types';
import { resolveAccessor } from './DataTable.types';

function stringifyMobileValue(value: unknown): string {
  if (value === null || value === undefined || value === '') {
    return '—';
  }

  if (typeof value === 'string' || typeof value === 'number') {
    return String(value);
  }

  return String(value);
}

function renderDefaultField<T extends object>(
  column: ColumnDef<T>,
  row: T,
  index: number
): React.ReactNode {
  const value = resolveAccessor(column, row);

  if (column.render) {
    return column.render(value, row, index);
  }

  return stringifyMobileValue(value);
}

export interface DataTableMobileCardsProps<T extends object> {
  data: T[];
  columns: ColumnDef<T>[];
  /** Current device class key, used to resolve responsive column roles. */
  deviceKey?: 'phone' | 'tablet' | 'desktop';
  getRowKey: (row: T, index: number) => string;
  selectedKeys?: string[];
  selectable?: boolean;
  onToggleSelection?: (key: string) => void;
  onRowClick?: (row: T, index: number) => void;
  actions?: (row: T, index: number) => React.ReactNode;
  mobileCard?: (
    row: T,
    index: number,
    context: DataTableMobileCardContext<T>,
  ) => React.ReactNode;
}

/**
 * Resolves the responsive mode for a column at the given device class.
 * Falls back to `'visible'` when the column has no responsive config.
 */
function getMode<T>(column: ColumnDef<T>, deviceKey: 'phone' | 'tablet' | 'desktop'): ResponsiveColumnMode {
  return column.responsive?.[deviceKey] ?? 'visible';
}

export function DataTableMobileCards<T extends object>({
  data,
  columns,
  deviceKey = 'phone',
  getRowKey,
  selectedKeys = [],
  selectable = false,
  onToggleSelection,
  onRowClick,
  actions,
  mobileCard,
}: DataTableMobileCardsProps<T>): React.ReactElement {
  const visibleColumns = columns.filter((column) => column.visible !== false);

  // Check if ANY column has a responsive config at this device class.
  // If so, use the responsive roles to pick title/summary columns.
  // Otherwise, fall back to the legacy positional heuristic.
  const hasResponsiveConfig = visibleColumns.some(
    (col) => col.responsive && col.responsive[deviceKey] !== undefined
  );

  let titleColumn: ColumnDef<T> | undefined;
  let summaryColumns: ColumnDef<T>[];

  if (hasResponsiveConfig) {
    // Use explicit responsive roles
    const primaryCols = visibleColumns.filter((col) => getMode(col, deviceKey) === 'primary');
    const summaryCols = visibleColumns.filter((col) => getMode(col, deviceKey) === 'summary');

    // If there are primary columns, use the first as card title.
    // Otherwise fall back to the first visible column (legacy behavior).
    titleColumn = primaryCols[0] ?? visibleColumns[0];
    summaryColumns = summaryCols.length > 0
      ? summaryCols
      : visibleColumns.filter(
          (col) => col !== titleColumn && getMode(col, deviceKey) === 'visible'
        ).slice(0, 3);
  } else {
    // Legacy positional heuristic: first column is title, next 3 are summary.
    titleColumn = visibleColumns[0];
    summaryColumns = visibleColumns.slice(1, 4);
  }

  return (
    <Stack spacing="md" className="ds-pattern-data-table ds-data-table--mobile">
      {data.map((row, index) => {
        const rowKey = getRowKey(row, index);
        const isSelected = selectedKeys.includes(rowKey);
        const resolvedActions = actions?.(row, index);
        const mobileCardContext: DataTableMobileCardContext<T> = {
          item: row,
          index,
          rowKey,
          selected: isSelected,
          selectable,
          toggleSelection: (event) => {
            event?.stopPropagation?.();
            onToggleSelection?.(rowKey);
          },
          open: (event) => {
            event?.stopPropagation?.();
            onRowClick?.(row, index);
          },
          actions: resolvedActions,
        };

        if (mobileCard) {
          return (
            <Box
              key={rowKey}
              data-part="mobile-card-custom"
              data-selected={isSelected ? 'true' : 'false'}
            >
              {mobileCard(row, index, mobileCardContext)}
            </Box>
          );
        }

        return (
          <Card
            key={rowKey}
            variant="outlined"
            hoverable={!!onRowClick}
            clickable={!!onRowClick}
            onClick={() => onRowClick?.(row, index)}
            className={`ds-data-table__mobile-card${isSelected ? ' ds-data-table__mobile-card--selected' : ''}`}
            style={{
              overflow: 'hidden',
            }}
          >
            <Card.Body>
              <Stack spacing="md">
                <Flex justify="between" align="start" gap={12}>
                  <Stack spacing="xs" style={{ flex: 1, minWidth: 0 }}>
                    {titleColumn && (
                      <Box data-part="mobile-card-title">
                        {renderDefaultField(titleColumn, row, index)}
                      </Box>
                    )}
                  </Stack>

                  {selectable && onToggleSelection && (
                    <Box onClick={(event) => event.stopPropagation()}>
                      <Checkbox
                        checked={isSelected}
                        onChange={() => onToggleSelection(rowKey)}
                        aria-label={`Select ${rowKey}`}
                      />
                    </Box>
                  )}
                </Flex>

                {summaryColumns.length > 0 && (
                  <Stack spacing="sm">
                    {summaryColumns.map((column) => (
                      <Flex key={column.key} justify="between" align="start" gap={12}>
                        <Text
                          data-part="mobile-card-summary-label"
                          color="subtle"
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            letterSpacing: '0.04em',
                            textTransform: 'uppercase',
                            flexShrink: 0,
                          }}
                        >
                          {column.header}
                        </Text>
                        <Box
                          data-part="mobile-card-summary-value"
                          style={{
                            textAlign: 'right',
                            minWidth: 0,
                          }}
                        >
                          {renderDefaultField(column, row, index)}
                        </Box>
                      </Flex>
                    ))}
                  </Stack>
                )}

                {resolvedActions && (
                  <Box onClick={(event) => event.stopPropagation()}>
                    <Flex gap={8} wrap="wrap">
                      {resolvedActions}
                    </Flex>
                  </Box>
                )}
              </Stack>
            </Card.Body>
          </Card>
        );
      })}
    </Stack>
  );
}
