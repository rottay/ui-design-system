'use client';

/**
 * CrmTable - Standard Preset
 * Clean CRM table with sorting and badges
 */

import { useState } from 'react';
import { createPreset, PresetContext } from '../../../factory';
import type { CrmTableProps, CrmColumnType, CompanySizeCategory } from '../../core';
import { getSizeBadgeColors, getCrmBadgeColors, getValue, compareValues, categorizeSizeRange } from '../../core';
import {
  createCardStyle,
  createEmptyStateStyle,
  createListItemStyle,
  createPanelHeaderStyle,
} from '../../../helpers';

export const StandardCrmTable = createPreset<CrmTableProps>({
  name: 'CrmTable.Standard',
  render: ({ primitives, props, tokens, engine }: PresetContext<CrmTableProps>) => {
    const { Box, Stack } = primitives;
    const sizeBadgeColors = getSizeBadgeColors(tokens);
    const crmBadgeColors = getCrmBadgeColors(tokens);

    const {
      columns,
      data,
      breadcrumbs = [],
      onRowClick,
      selectedRows: selectedRowsProp,
      onRowSelect,
      sortColumn: sortColumnProp,
      sortDirection: sortDirectionProp,
      onSort,
      title = 'Companies',
      totalCount,
      loading,
      className,
      style,
    } = props;

    const [internalSort, setInternalSort] = useState<{ column: string; direction: 'asc' | 'desc' }>({
      column: sortColumnProp ?? '', direction: sortDirectionProp ?? 'asc',
    });
    const [internalSelected, setInternalSelected] = useState<number[]>(selectedRowsProp ?? []);

    const sortColumn = sortColumnProp ?? internalSort.column;
    const sortDirection = sortDirectionProp ?? internalSort.direction;
    const selectedRows = selectedRowsProp ?? internalSelected;

    const handleSort = (colKey: string) => {
      const newDir = sortColumn === colKey && sortDirection === 'asc' ? 'desc' : 'asc';
      setInternalSort({ column: colKey, direction: newDir });
      onSort?.(colKey);
    };

    const handleRowSelect = (idx: number) => {
      const next = selectedRows.includes(idx) ? selectedRows.filter(i => i !== idx) : [...selectedRows, idx];
      setInternalSelected(next);
      onRowSelect?.(next);
    };

    const visibleColumns = columns.filter(c => c.visible !== false);

    const sortedData = sortColumn
      ? [...data].sort((a, b) => compareValues(getValue(a, sortColumn), getValue(b, sortColumn), sortDirection))
      : data;

    const renderCell = (row: Record<string, unknown>, col: typeof columns[0]) => {
      const value = getValue(row, col.key);

      switch (col.type as CrmColumnType) {
        case 'company':
          return (
            <Box style={{
              boxShadow: tokens.shadows.md, display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
              {row[`${col.key}Logo`] ? (
                <img src={String(row[`${col.key}Logo`])} alt="" style={{ width: tokens.spacing[6], height: tokens.spacing[6], borderRadius: tokens.borderRadius.sm }} />
              ) : (
                <Box style={{ width: tokens.spacing[6], height: tokens.spacing[6], borderRadius: tokens.borderRadius.sm, backgroundColor: tokens.colors.neutral[200], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>
                  {String(value ?? '').charAt(0)}
                </Box>
              )}
              <span style={{ fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[900] }}>{String(value ?? '')}</span>
            </Box>
          );
        case 'badge': {
          const badgeColor = crmBadgeColors[String(row[`${col.key}Color`] ?? 'default') as keyof typeof crmBadgeColors] ?? crmBadgeColors.default;
          return (
            <span style={{
              display: 'inline-block',
              padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`,
              borderRadius: tokens.borderRadius.sm,
              fontSize: tokens.typography.fontSize.xs,
              color: badgeColor.color, backgroundColor: badgeColor.bgColor,
            }}>
              {String(value ?? '')}
            </span>
          );
        }
        case 'size': {
          const numVal = typeof value === 'number' ? value : parseInt(String(value ?? '0'), 10);
          const category = categorizeSizeRange(numVal);
          const sizeColor = sizeBadgeColors[category];
          return (
            <span style={{
              display: 'inline-block',
              padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`,
              borderRadius: tokens.borderRadius.sm,
              fontSize: tokens.typography.fontSize.xs,
              fontWeight: tokens.typography.fontWeight.medium,
              color: sizeColor.color, backgroundColor: sizeColor.bgColor,
            }}>
              {String(value ?? '')}
            </span>
          );
        }
        case 'link':
          return (
            <span style={{ color: tokens.colors.primaryScale[600], fontSize: tokens.typography.fontSize.sm, cursor: 'pointer' }}>
              {String(value ?? '')}
            </span>
          );
        case 'icon': {
          const iconValue = row[`${col.key}Icon`];
          return (
            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
              {iconValue ? <span>{String(iconValue)}</span> : null}
              <span style={{ color: tokens.colors.neutral[600], fontSize: tokens.typography.fontSize.sm }}>{String(value ?? '')}</span>
            </Box>
          );
        }
        default:
          return <span style={{ color: tokens.colors.neutral[700], fontSize: tokens.typography.fontSize.sm }}>{String(value ?? '')}</span>;
      }
    };

    return (
      <Box className={className} style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: tokens.colors.common.white, ...style }}>
        {/* Header */}
        <Box style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}` }}>
          {breadcrumbs.length > 0 && (
            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1], marginBottom: tokens.spacing[2], fontSize: tokens.typography.fontSize.sm }}>
              {breadcrumbs.map((crumb, idx) => (
                <span key={crumb.key}>
                  {idx > 0 && <span style={{ color: tokens.colors.neutral[400], margin: `0 ${tokens.spacing[1]}px` }}>/</span>}
                  <span onClick={crumb.onClick} style={{ color: idx === breadcrumbs.length - 1 ? tokens.colors.neutral[900] : tokens.colors.primaryScale[600], cursor: crumb.onClick ? 'pointer' : 'default' }}>
                    {crumb.label}
                  </span>
                </span>
              ))}
            </Box>
          )}
          <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ margin: 0, fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>
              {title}
              {totalCount !== undefined && <span style={{ fontWeight: tokens.typography.fontWeight.normal, color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.sm, marginLeft: tokens.spacing[2] }}>({totalCount})</span>}
            </h2>
            {selectedRows.length > 0 && (
              <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.primaryScale[600] }}>{selectedRows.length} selected</span>
            )}
          </Box>
        </Box>

        {/* Table */}
        <Box style={{ flex: 1, overflow: 'auto' }}>
          {loading ? (
            <Box style={{ textAlign: 'center', padding: tokens.spacing[8], color: tokens.colors.neutral[400] }}>Loading...</Box>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ width: tokens.spacing[8], padding: `${tokens.spacing[2]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, backgroundColor: tokens.colors.neutral[50] }}>
                    <input type="checkbox" onChange={(e) => { const newSel = e.target.checked ? data.map((_, i) => i) : []; setInternalSelected(newSel); onRowSelect?.(newSel); }} checked={selectedRows.length === data.length && data.length > 0} style={{ cursor: 'pointer' }} />
                  </th>
                  {visibleColumns.map((col) => (
                    <th key={col.key} onClick={() => col.sortable !== false && handleSort(col.key)} style={{
                      textAlign: 'left',
                      padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                      fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold,
                      color: tokens.colors.neutral[500],
                      borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                      backgroundColor: tokens.colors.neutral[50],
                      cursor: col.sortable !== false ? 'pointer' : 'default',
                      userSelect: 'none',
                      width: col.width,
                    }}>
                      {col.label}
                      {sortColumn === col.key && <span style={{ marginLeft: tokens.spacing[1] }}>{sortDirection === 'asc' ? '↑' : '↓'}</span>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedData.map((row, idx) => (
                  <tr key={idx} onClick={() => onRowClick?.(row)} style={{
                    cursor: onRowClick ? 'pointer' : 'default',
                    backgroundColor: selectedRows.includes(idx) ? tokens.colors.primaryScale[50] : 'transparent',
                  }}>
                    <td style={{ padding: `${tokens.spacing[2]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}>
                      <input type="checkbox" checked={selectedRows.includes(idx)} onChange={(e) => { e.stopPropagation(); handleRowSelect(idx); }} style={{ cursor: 'pointer' }} />
                    </td>
                    {visibleColumns.map((col) => (
                      <td key={col.key} style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}>
                        {renderCell(row, col)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Box>
      </Box>
    );
  },
});
