'use client';

/**
 * DataTable - Selectable Preset
 * Table with row selection checkboxes
 */

import {useState, useMemo} from 'react';
import { createPreset, PresetContext } from '../../../factory';
import {
  createPanelHeaderStyle,
  createSurfaceStyle,
} from '../../../helpers';
import type { DataTableProps } from '../../core';

export const SelectableDataTable = createPreset<DataTableProps & Record<string, unknown>>({
  name: 'DataTable.Selectable',
  render: ({ primitives, props, tokens, engine }: PresetContext<DataTableProps>) => {
    const { Box, Card, Stack, Badge, Spinner } = primitives;
    const {
      columns,
      data,
      rowKey = 'id',
      loading,
      selectedRowKeys: controlledSelected,
      onSelectionChange,
      emptyText = 'No data',
      striped,
      compact,
      className,
      style
    } = props;

    const [internalSelected, setInternalSelected] = useState<string[]>([]);
    const selectedKeys = controlledSelected ?? internalSelected;

    const getRowKey = (record: Record<string, unknown>, index: number): string => {
      if (typeof rowKey === 'function') return rowKey(record);
      return String(record[rowKey as string] ?? index);
    };

    const getValue = (record: Record<string, unknown>, dataIndex?: string): unknown => {
      if (!dataIndex) return undefined;
      return dataIndex.split('.').reduce((obj: unknown, key) =>
        (obj as Record<string, unknown>)?.[key], record);
    };

    const handleSelectAll = (checked: boolean) => {
      const newKeys = checked ? data.map((r, i) => getRowKey(r as Record<string, unknown>, i)) : [];
      if (!controlledSelected) setInternalSelected(newKeys);
      onSelectionChange?.(newKeys, checked ? data : []);
    };

    const handleSelectRow = (key: string, checked: boolean) => {
      const newKeys = checked
        ? [...selectedKeys, key]
        : selectedKeys.filter(k => k !== key);
      if (!controlledSelected) setInternalSelected(newKeys);
      onSelectionChange?.(newKeys, data.filter((r, i) => newKeys.includes(getRowKey(r as Record<string, unknown>, i))));
    };

    const allSelected = data.length > 0 && selectedKeys.length === data.length;
    const someSelected = selectedKeys.length > 0 && selectedKeys.length < data.length;
    const cellPadding = compact ? tokens.spacing[2] : tokens.spacing[3];
    const dropdownSurface = useMemo(() => createSurfaceStyle(tokens, { elevation: 'lg', glass: engine === 'modern' }), [tokens]);

    return (
      <Card variant="outlined" padding="none" className={className} style={style}>
        <Stack direction="vertical" spacing="none">
          {/* Selection Info */}
          {selectedKeys.length > 0 && (
            <Box style={{
              padding: tokens.spacing[3],
              backgroundColor: `${tokens.colors.primaryScale[600]}10`,
              borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[2],
            }}>
              <Badge variant="primary" size="sm">{selectedKeys.length}</Badge>
              <span style={{ fontSize: tokens.typography.fontSize.sm }}>
                item{selectedKeys.length > 1 ? 's' : ''} selected
              </span>
            </Box>
          )}

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
                      <input
                        type="checkbox"
                        checked={allSelected}
                        ref={(el) => { if (el) el.indeterminate = someSelected; }}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                      />
                    </th>
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
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => handleSelectRow(key, e.target.checked)}
                            />
                          </td>
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
                      );
                    })
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
