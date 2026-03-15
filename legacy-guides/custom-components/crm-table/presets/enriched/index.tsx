'use client';

/**
 * CrmTable - Enriched Preset
 * CRM table with context menus, enrichment actions, and column visibility
 */

import { useState } from 'react';
import { createPreset, PresetContext } from '../../../factory';
import type { CrmTableProps, CrmColumnType, CompanySizeCategory } from '../../core';
import { getSizeBadgeColors, getCrmBadgeColors, getValue, compareValues, categorizeSizeRange } from '../../core';
import {
  createCardStyle,
  createEmptyStateStyle,
  createHoverStyle,
  createListItemStyle,
  createPanelHeaderStyle,
} from '../../../helpers';

export const EnrichedCrmTable = createPreset<CrmTableProps>({
  name: 'CrmTable.Enriched',
  render: ({ primitives, props, tokens, engine }: PresetContext<CrmTableProps>) => {
    const { Box, Stack } = primitives;
    const sizeBadgeColors = getSizeBadgeColors(tokens);
    const crmBadgeColors = getCrmBadgeColors(tokens);

    const {
      columns,
      data,
      breadcrumbs: rawBreadcrumbs = [],
      onRowClick,
      onEnrich,
      onFindPeople,
      contextMenuItems: rawContextMenuItems = [],
      onContextMenuAction,
      selectedRows: selectedRowsProp,
      onRowSelect,
      sortColumn: sortColumnProp,
      sortDirection: sortDirectionProp,
      onSort,
      onColumnVisibilityChange,
      viewMode: viewModeProp,
      onViewModeChange,
      title = 'Companies',
      totalCount,
      loading,
      editable = false,
      onCellEdit,
      className,
      style,
    } = props;

    const breadcrumbs = Array.isArray(rawBreadcrumbs) ? rawBreadcrumbs : [];
    const contextMenuItems = Array.isArray(rawContextMenuItems) ? rawContextMenuItems : [];

    const [internalSort, setInternalSort] = useState<{ column: string; direction: 'asc' | 'desc' }>({
      column: sortColumnProp ?? '', direction: sortDirectionProp ?? 'asc',
    });
    const [internalSelected, setInternalSelected] = useState<number[]>(selectedRowsProp ?? []);
    const [contextMenuRow, setContextMenuRow] = useState<number | null>(null);
    const [contextMenuPos, setContextMenuPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const [showColumnPicker, setShowColumnPicker] = useState(false);
    const [editingCell, setEditingCell] = useState<{ rowIdx: number; colKey: string } | null>(null);
    const [editValue, setEditValue] = useState<string>('');

    const sortColumn = sortColumnProp ?? internalSort.column;
    const sortDirection = sortDirectionProp ?? internalSort.direction;
    const selectedRows = selectedRowsProp ?? internalSelected;
    const viewMode = viewModeProp ?? 'table';

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

    const handleContextMenu = (e: React.MouseEvent, rowIdx: number) => {
      e.preventDefault();
      setContextMenuRow(rowIdx);
      setContextMenuPos({ x: e.clientX, y: e.clientY });
    };

    const startEditing = (rowIdx: number, colKey: string, currentValue: unknown) => {
      if (!editable) return;
      const col = columns.find(c => c.key === colKey);
      if (col && col.editable === false) return;
      // Only allow text/link types to be inline-edited
      if (col && (col.type === 'badge' || col.type === 'size' || col.type === 'icon')) return;
      setEditingCell({ rowIdx, colKey });
      setEditValue(currentValue != null ? String(currentValue) : '');
    };

    const commitEdit = () => {
      if (editingCell) {
        onCellEdit?.(editingCell.rowIdx, editingCell.colKey, editValue);
        setEditingCell(null);
        setEditValue('');
      }
    };

    const cancelEdit = () => {
      setEditingCell(null);
      setEditValue('');
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
            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
              <span style={{ color: tokens.colors.primaryScale[500], fontSize: tokens.typography.fontSize.sm }}>in</span>
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
              display: 'inline-block', padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`,
              borderRadius: tokens.borderRadius.sm, fontSize: tokens.typography.fontSize.xs,
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
              display: 'inline-block', padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`,
              borderRadius: tokens.borderRadius.sm, fontSize: tokens.typography.fontSize.xs,
              fontWeight: tokens.typography.fontWeight.medium,
              color: sizeColor.color, backgroundColor: sizeColor.bgColor,
            }}>
              {String(value ?? '')}
            </span>
          );
        }
        case 'link':
          return <span style={{ color: tokens.colors.primaryScale[600], fontSize: tokens.typography.fontSize.sm, cursor: 'pointer' }}>{String(value ?? '')}</span>;
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
      <Box className={className} style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: tokens.colors.common.white, position: 'relative', ...style }}>
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
            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
              {/* View mode toggle */}
              <Box style={{ display: 'flex', border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, borderRadius: tokens.borderRadius.sm, overflow: 'hidden' }}>
                <button onClick={() => onViewModeChange?.('table')} style={{
                  padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`, border: 'none',
                  backgroundColor: viewMode === 'table' ? tokens.colors.neutral[100] : 'transparent',
                  color: viewMode === 'table' ? tokens.colors.neutral[900] : tokens.colors.neutral[500],
                  fontSize: tokens.typography.fontSize.xs, cursor: 'pointer', fontFamily: 'inherit',
                  transition: `all ${tokens.motion.hover}`,
                }}>
                  Table
                </button>
                <button onClick={() => onViewModeChange?.('graph')} style={{
                  padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`, border: 'none', borderLeft: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                  backgroundColor: viewMode === 'graph' ? tokens.colors.neutral[100] : 'transparent',
                  color: viewMode === 'graph' ? tokens.colors.neutral[900] : tokens.colors.neutral[500],
                  fontSize: tokens.typography.fontSize.xs, cursor: 'pointer', fontFamily: 'inherit',
                  transition: `all ${tokens.motion.hover}`,
                }}>
                  Graph
                </button>
              </Box>
              {/* Column visibility */}
              <Box style={{ position: 'relative' }}>
                <button onClick={() => setShowColumnPicker(!showColumnPicker)} style={{
                  padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                  borderRadius: tokens.borderRadius.sm, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                  backgroundColor: 'transparent', color: tokens.colors.neutral[600],
                  fontSize: tokens.typography.fontSize.xs, cursor: 'pointer', fontFamily: 'inherit',
                  transition: `all ${tokens.motion.hover}`,
                }}>
                  Columns ▼
                </button>
                {showColumnPicker && (
                  <Box style={{
                    position: 'absolute', top: '100%', right: 0, marginTop: tokens.spacing[1],
                    backgroundColor: tokens.colors.common.white, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                    borderRadius: tokens.borderRadius.md, boxShadow: tokens.shadows.md,
                    padding: tokens.spacing[2], zIndex: 10, minWidth: 160,
                  }}>
                    {columns.map((col) => (
                      <label key={col.key} style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], padding: `${tokens.spacing[1]}px`, fontSize: tokens.typography.fontSize.sm, cursor: 'pointer' }}>
                        <input type="checkbox" checked={col.visible !== false} onChange={() => onColumnVisibilityChange?.(col.key, col.visible === false)} />
                        {col.label}
                      </label>
                    ))}
                  </Box>
                )}
              </Box>
              {/* Enrichment actions */}
              <button onClick={onEnrich} style={{
                padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                borderRadius: tokens.borderRadius.md, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[200]}`,
                backgroundColor: tokens.colors.primaryScale[50], color: tokens.colors.primaryScale[700],
                fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium,
                cursor: 'pointer', fontFamily: 'inherit',
                transition: `all ${tokens.motion.hover}`,
              }}>
                Enrich
              </button>
              <button onClick={onFindPeople} style={{
                padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                borderRadius: tokens.borderRadius.md, border: 'none',
                backgroundColor: tokens.colors.primaryScale[500], color: tokens.colors.common.white,
                fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold,
                cursor: 'pointer', fontFamily: 'inherit',
                transition: `all ${tokens.motion.hover}`,
              }}>
                Find People
              </button>
            </Box>
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
                      textAlign: 'left', padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                      fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold,
                      color: tokens.colors.neutral[500], borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                      backgroundColor: tokens.colors.neutral[50],
                      cursor: col.sortable !== false ? 'pointer' : 'default', userSelect: 'none', width: col.width,
                    }}>
                      {col.label}
                      {sortColumn === col.key && <span style={{ marginLeft: tokens.spacing[1] }}>{sortDirection === 'asc' ? '↑' : '↓'}</span>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedData.map((row, idx) => (
                  <tr key={idx}
                    onClick={() => onRowClick?.(row)}
                    onContextMenu={(e) => handleContextMenu(e, idx)}
                    style={{
                      cursor: 'pointer',
                      transition: `all ${tokens.motion.hover}`,
                      backgroundColor: selectedRows.includes(idx) ? tokens.colors.primaryScale[50] : 'transparent',
                    }}
                  >
                    <td style={{ padding: `${tokens.spacing[2]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}>
                      <input type="checkbox" checked={selectedRows.includes(idx)} onChange={(e) => { e.stopPropagation(); handleRowSelect(idx); }} style={{ cursor: 'pointer' }} />
                    </td>
                    {visibleColumns.map((col) => {
                      const isEditing = editable && editingCell?.rowIdx === idx && editingCell?.colKey === col.key;
                      const isColEditable = editable && col.editable !== false && col.type !== 'badge' && col.type !== 'size' && col.type !== 'icon';

                      if (isEditing) {
                        return (
                          <td key={col.key} style={{ padding: '4px', borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }} onClick={(e) => e.stopPropagation()}>
                            <input
                              type="text"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={(e) => {
                                commitEdit();
                                e.currentTarget.style.boxShadow = 'none';
                                e.currentTarget.style.borderColor = tokens.colors.neutral[300];
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') commitEdit();
                                if (e.key === 'Escape') cancelEdit();
                              }}
                              autoFocus
                              style={{
                                width: '100%',
                                padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[600]}`,
                                borderRadius: tokens.borderRadius.sm,
                                fontSize: tokens.typography.fontSize.sm,
                                outline: 'none',
                                backgroundColor: tokens.colors.common.white,
                                fontFamily: 'inherit',
                              }}
                            
                              onFocus={(e) => {
                                e.currentTarget.style.boxShadow = `0 0 0 2px ${tokens.colors.primaryScale[100]}`;
                                e.currentTarget.style.borderColor = tokens.colors.primaryScale[400];
                              }}
                            />
                          </td>
                        );
                      }

                      return (
                        <td
                          key={col.key}
                          onDoubleClick={isColEditable ? () => startEditing(idx, col.key, getValue(row, col.key)) : undefined}
                          style={{
                            padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                            borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                            cursor: isColEditable ? 'text' : 'default',
                          }}
                        >
                          {renderCell(row, col)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Box>

        {/* Context menu */}
        {contextMenuRow !== null && contextMenuItems.length > 0 && (
          <>
            <Box onClick={() => setContextMenuRow(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99 }} />
            <Box style={{
              position: 'fixed', left: contextMenuPos.x, top: contextMenuPos.y, zIndex: 100,
              backgroundColor: tokens.colors.common.white, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
              borderRadius: tokens.borderRadius.md, boxShadow: tokens.shadows.lg,
              padding: `${tokens.spacing[1]}px 0`, minWidth: 180,
            }}>
              {contextMenuItems.map((item) => (
                item.divider ? (
                  <Box key={item.key} style={{ height: 1, backgroundColor: tokens.colors.neutral[100], margin: `${tokens.spacing[1]}px 0` }} />
                ) : (
                  <Box key={item.key} onClick={() => { onContextMenuAction?.(item.key, contextMenuRow); item.onClick?.(); setContextMenuRow(null); }} style={{
                    display: 'flex', alignItems: 'center', gap: tokens.spacing[2],
                    padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                    fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700],
                    cursor: 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                  }}>
                    {item.icon && <span>{item.icon}</span>}
                    {item.label}
                  </Box>
                )
              ))}
            </Box>
          </>
        )}
      </Box>
    );
  },
});
