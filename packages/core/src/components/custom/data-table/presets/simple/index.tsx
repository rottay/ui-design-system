/**
 * DataTable - Simple Preset
 * Basic table with rows only
 */

import { createPreset, PresetContext } from '../../../factory';
import { createSurfaceStyle } from '../../../helpers';
import type { DataTableProps } from '../../core';

export const SimpleDataTable = createPreset<DataTableProps & Record<string, unknown>>({
  name: 'DataTable.Simple',
  render: ({ primitives, props, tokens, engine }: PresetContext<DataTableProps>) => {
    const { Box, Spinner } = primitives;
    const {
      columns,
      data,
      rowKey = 'id',
      loading,
      emptyText = 'No data',
      onRowClick,
      striped,
      bordered,
      compact,
      className,
      style
    } = props;

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

    return (
      <Box className={className} style={{ overflow: 'auto', ...style }}>
        {loading ? (
          <Box style={{ display: 'flex', justifyContent: 'center', padding: tokens.spacing[8] }}>
            <Spinner size="lg" />
          </Box>
        ) : (
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            border: bordered ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}` : undefined,
          }}>
            <thead>
              <tr style={{ backgroundColor: tokens.colors.neutral[50] }}>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    style={{
                      padding: cellPadding,
                      textAlign: col.align || 'left',
                      fontWeight: 600,
                      fontSize: tokens.typography.fontSize.sm,
                      color: tokens.colors.neutral[600],
                      borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                      width: col.width,
                    }}
                  >
                    {col.title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    style={{
                      padding: tokens.spacing[8],
                      textAlign: 'center',
                      color: tokens.colors.neutral[500],
                    }}
                  >
                    {emptyText}
                  </td>
                </tr>
              ) : (
                data.map((record, index) => (
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
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = striped && index % 2 === 1 ? tokens.colors.neutral[50] : '';
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
    );
  },
});
