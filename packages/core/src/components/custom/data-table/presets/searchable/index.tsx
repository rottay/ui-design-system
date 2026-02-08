'use client';

/**
 * DataTable - Searchable Preset
 * Table with search input
 */

import {useState, useMemo} from 'react';
import { createPreset, PresetContext } from '../../../factory';
import {
  createPanelHeaderStyle,
  createSurfaceStyle,
} from '../../../helpers';
import type { DataTableProps } from '../../core';
import { DATA_TABLE_DEFAULTS } from '../../core';

export const SearchableDataTable = createPreset<DataTableProps & Record<string, unknown>>({
  name: 'DataTable.Searchable',
  render: ({ primitives, props, tokens, engine }: PresetContext<DataTableProps>) => {
    const { Box, Card, Stack, Spinner } = primitives;
    const {
      columns,
      data,
      rowKey = 'id',
      loading,
      searchPlaceholder = DATA_TABLE_DEFAULTS.searchPlaceholder,
      onSearch,
      emptyText = 'No data',
      onRowClick,
      striped,
      compact,
      className,
      style
    } = props;

    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = (value: string) => {
      setSearchQuery(value);
      onSearch?.(value);
    };

    const getRowKey = (record: Record<string, unknown>, index: number): string => {
      if (typeof rowKey === 'function') return rowKey(record);
      return String(record[rowKey as string] ?? index);
    };

    const getValue = (record: Record<string, unknown>, dataIndex?: string): unknown => {
      if (!dataIndex) return undefined;
      return dataIndex.split('.').reduce((obj: unknown, key) =>
        (obj as Record<string, unknown>)?.[key], record);
    };

    const cellPadding = compact ? tokens.spacing[2] : tokens.spacing[3];
    const dropdownSurface = useMemo(() => createSurfaceStyle(tokens, { elevation: 'lg', glass: engine === 'modern' }), [tokens]);

    // Filter data locally if no onSearch provided
    const filteredData = onSearch ? data : data.filter((record) => {
      if (!searchQuery) return true;
      return columns.some((col) => {
        const value = getValue(record as Record<string, unknown>, col.dataIndex as string);
        return String(value ?? '').toLowerCase().includes(searchQuery.toLowerCase());
      });
    });

    return (
      <Card variant="outlined" padding="none" className={className} style={style}>
        <Stack direction="vertical" spacing="none">
          {/* Search Header */}
          <Box style={{ padding: tokens.spacing[4], borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}` }}>
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              style={{
                width: '100%',
                maxWidth: '300px',
                padding: `${tokens.spacing[2]} ${tokens.spacing[3]}`,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
                borderRadius: tokens.borderRadius.md,
                fontSize: tokens.typography.fontSize.sm,
                outline: 'none',
              }}
            
              onFocus={(e) => {
                e.currentTarget.style.boxShadow = `0 0 0 2px ${tokens.colors.primaryScale[100]}`;
                e.currentTarget.style.borderColor = tokens.colors.primaryScale[400];
              }}
              onBlur={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = tokens.colors.neutral[300];
              }}
            />
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
                    {columns.map((col) => (
                      <th
                        key={col.key}
                        style={{
                          padding: cellPadding,
                          textAlign: col.align || 'left',
                          fontWeight: tokens.typography.fontWeight.semibold,
                          fontSize: tokens.typography.fontSize.sm,
                          color: tokens.colors.neutral[600],
                          borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                        }}
                      >
                        {col.title}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredData.length === 0 ? (
                    <tr>
                      <td colSpan={columns.length} style={{ padding: tokens.spacing[8], textAlign: 'center', color: tokens.colors.neutral[500] }}>
                        {emptyText}
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((record, index) => (
                      <tr
                        key={getRowKey(record as Record<string, unknown>, index)}
                        onClick={() => onRowClick?.(record, index)}
                        style={{
                          backgroundColor: striped && index % 2 === 1 ? tokens.colors.neutral[50] : undefined,
                          cursor: onRowClick ? 'pointer' : undefined,
                          transition: `all ${tokens.motion.hover}`,
                        }}
                        onMouseEnter={(e) => {
                          if (onRowClick) e.currentTarget.style.backgroundColor = tokens.colors.neutral[100];
          e.currentTarget.style.transform = tokens.motion.transform;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = striped && index % 2 === 1 ? tokens.colors.neutral[50] : '';
                          e.currentTarget.style.transform = 'none';
                        }}
                      >
                        {columns.map((col) => {
                          const value = getValue(record as Record<string, unknown>, col.dataIndex as string);
                          return (
                            <td
                              key={col.key}
                              style={{
                                padding: cellPadding,
                                textAlign: col.align || 'left',
                                fontSize: tokens.typography.fontSize.sm,
                                borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                              }}
                            >
                              {col.render ? col.render(value, record, index) : String(value ?? '')}
                            </td>
                          );
                        })}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </Box>
        </Stack>
      </Card>
    );
  },
});
