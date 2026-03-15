'use client';

/**
 * DataTable - Full Preset
 * Table with all features: search, selection, sorting, pagination
 */

import {useState, useMemo} from 'react';
import { createPreset, PresetContext } from '../../../factory';
import {
  createPanelHeaderStyle,
  createSurfaceStyle,
} from '../../../helpers';
import type { DataTableProps } from '../../core';

export const FullDataTable = createPreset<DataTableProps & Record<string, unknown>>({
  name: 'DataTable.Full',
  render: ({ primitives, props, tokens, engine }: PresetContext<DataTableProps>) => {
    const { Box, Card, Stack, Badge, Spinner, Pagination } = primitives;
    const {
      columns,
      data,
      rowKey = 'id',
      loading,
      searchPlaceholder = 'Search...',
      onSearch,
      selectedRowKeys: controlledSelected,
      onSelectionChange,
      sortState: controlledSort,
      onSortChange,
      pagination,
      emptyText = 'No data',
      striped,
      compact,
      className,
      style
    } = props;

    const [searchQuery, setSearchQuery] = useState('');
    const [internalSelected, setInternalSelected] = useState<string[]>([]);
    const [internalSort, setInternalSort] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

    const selectedKeys = controlledSelected ?? internalSelected;
    const sortState = controlledSort ?? internalSort;

    const getRowKey = (record: Record<string, unknown>, index: number): string => {
      if (typeof rowKey === 'function') return rowKey(record);
      return String(record[rowKey as string] ?? index);
    };

    const getValue = (record: Record<string, unknown>, dataIndex?: string): unknown => {
      if (!dataIndex) return undefined;
      return dataIndex.split('.').reduce((obj: unknown, key) =>
        (obj as Record<string, unknown>)?.[key], record);
    };

    const handleSort = (key: string) => {
      const newDirection = sortState?.key === key && sortState.direction === 'asc' ? 'desc' : 'asc';
      if (!controlledSort) setInternalSort({ key, direction: newDirection });
      onSortChange?.(key, newDirection);
    };

    const handleSelectAll = (checked: boolean) => {
      const newKeys = checked ? data.map((r, i) => getRowKey(r as Record<string, unknown>, i)) : [];
      if (!controlledSelected) setInternalSelected(newKeys);
      onSelectionChange?.(newKeys, checked ? data : []);
    };

    const handleSelectRow = (key: string, checked: boolean) => {
      const newKeys = checked ? [...selectedKeys, key] : selectedKeys.filter(k => k !== key);
      if (!controlledSelected) setInternalSelected(newKeys);
      onSelectionChange?.(newKeys, data.filter((r, i) => newKeys.includes(getRowKey(r as Record<string, unknown>, i))));
    };

    const cellPadding = compact ? tokens.spacing[2] : tokens.spacing[3];
    const allSelected = data.length > 0 && selectedKeys.length === data.length;
    const dropdownSurface = useMemo(() => createSurfaceStyle(tokens, { elevation: 'lg', glass: tokens.surface.useGlass }), [tokens]);

    return (
      <Card variant="outlined" padding="none" className={className} style={style}>
        <Stack direction="vertical" spacing="none">
          {/* Toolbar */}
          <Box style={{
            padding: tokens.spacing[4],
            borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: tokens.spacing[3],
          }}>
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); onSearch?.(e.target.value); }}
              style={{
                padding: `${tokens.spacing[2]} ${tokens.spacing[3]}`,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
                borderRadius: tokens.borderRadius.md,
                fontSize: tokens.typography.fontSize.sm,
                minWidth: '200px',
              }}
            />
            {selectedKeys.length > 0 && (
              <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                <Badge variant="primary">{selectedKeys.length} selected</Badge>
              </Box>
            )}
          </Box>

          {/* Table */}
          <Box style={{ overflow: 'auto' }}>
            {loading ? (
              <Box style={{ display: 'flex', justifyContent: 'center', padding: tokens.spacing[8] }}>
                <Spinner size="lg" />
              </Box>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: tokens.colors.neutral[50] }}>
                    <th style={{ padding: cellPadding, width: '40px' }}>
                      <input type="checkbox" checked={allSelected} onChange={(e) => handleSelectAll(e.target.checked)} />
                    </th>
                    {columns.map((col) => (
                      <th
                        key={col.key}
                        onClick={() => col.sortable && handleSort(col.key)}
                        style={{
                          padding: cellPadding,
                          textAlign: col.align || 'left',
                          fontWeight: tokens.typography.fontWeight.semibold,
                          fontSize: tokens.typography.fontSize.sm,
                          color: tokens.colors.neutral[600],
                          borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                          cursor: col.sortable ? 'pointer' : undefined,
                          userSelect: 'none',
                        }}
                      >
                        {col.title}
                        {col.sortable && sortState?.key === col.key && (
                          <span style={{ marginLeft: '4px' }}>
                            {sortState.direction === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.length === 0 ? (
                    <tr>
                      <td colSpan={columns.length + 1} style={{ padding: tokens.spacing[8], textAlign: 'center', color: tokens.colors.neutral[500] }}>
                        {emptyText}
                      </td>
                    </tr>
                  ) : (
                    data.map((record, index) => {
                      const key = getRowKey(record as Record<string, unknown>, index);
                      const isSelected = selectedKeys.includes(key);
                      return (
                        <tr
                          key={key}
                          style={{
                            backgroundColor: isSelected ? `${tokens.colors.primaryScale[600]}08` : striped && index % 2 === 1 ? tokens.colors.neutral[50] : undefined,
                            transition: `all ${tokens.motion.hover}`,
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected) e.currentTarget.style.backgroundColor = tokens.colors.neutral[100];
          e.currentTarget.style.transform = tokens.motion.transform;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = isSelected
                              ? `${tokens.colors.primaryScale[600]}08`
                              : striped && index % 2 === 1
                                ? tokens.colors.neutral[50]
                                : '';
                          }}
                        >
                          <td style={{ padding: cellPadding }}>
                            <input type="checkbox" checked={isSelected} onChange={(e) => handleSelectRow(key, e.target.checked)} />
                          </td>
                          {columns.map((col) => {
                            const value = getValue(record as Record<string, unknown>, col.dataIndex as string);
                            return (
                              <td key={col.key} style={{ padding: cellPadding, textAlign: col.align || 'left', fontSize: tokens.typography.fontSize.sm, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}` }}>
                                {col.render ? col.render(value, record, index) : String(value ?? '')}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            )}
          </Box>

          {/* Pagination */}
          {pagination && typeof pagination === 'object' && (
            <Box style={{ padding: tokens.spacing[4], borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, display: 'flex', justifyContent: 'flex-end' }}>
              <Pagination
                current={pagination.current}
                total={pagination.total}
                pageSize={pagination.pageSize}
                onChange={pagination.onChange}
              />
            </Box>
          )}
        </Stack>
      </Card>
    );
  },
});
