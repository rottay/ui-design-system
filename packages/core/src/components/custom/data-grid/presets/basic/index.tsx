'use client';

/**
 * DataGrid - Basic Preset
 * Airtable-style spreadsheet with sortable columns, colored badges,
 * filterable rows, numbered rows, and selection checkboxes
 */

import { useState, useMemo, useCallback } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import type { DataGridProps, DataGridColumn } from '../../core';
import { DATA_GRID_DEFAULTS, getValue, compareValues, getBadgeColors } from '../../core';
import {
  createBadgeStyle,
  createCardStyle,
  createFilterPillStyle,
  createHoverStyle,
  createListItemStyle,
  createPanelHeaderStyle,
} from '../../../helpers';

// ============================================================================
// Component
// ============================================================================

export const BasicDataGrid = createPreset<DataGridProps & Record<string, unknown>>({
  name: 'DataGrid.Basic',
  render: ({ primitives, props, tokens, engine }: PresetContext<DataGridProps>) => {
    const { Box, Flex, Text, Spinner } = primitives;

    // ========================================================================
    // Badge Color Map (uses tokens for white-label support)
    // ========================================================================
    const BADGE_COLORS = getBadgeColors(tokens);

    // ========================================================================
    // Column Type Icons
    // ========================================================================
    function ColumnTypeIcon({ type }: { type?: string }) {
      const iconStyle: React.CSSProperties = {
        fontSize: tokens.typography.fontSize.xs,
        fontWeight: tokens.typography.fontWeight.semibold,
        color: tokens.colors.neutral[400],
        marginRight: tokens.spacing[1],
        fontFamily: 'monospace',
        userSelect: 'none',
      };

      switch (type) {
        case 'number': return <span style={iconStyle}>#</span>;
        case 'badge': return <span style={{ ...iconStyle, fontSize: tokens.typography.fontSize.xs }}>&#9679;</span>;
        case 'link': return <span style={iconStyle}>&#8599;</span>;
        case 'date': return <span style={{ ...iconStyle, fontFamily: 'sans-serif', fontSize: tokens.typography.fontSize.sm }}>&#128197;</span>;
        case 'text':
        default: return <span style={iconStyle}>Aa</span>;
      }
    }

    const {
      columns,
      data,
      rowKey = 'id',
      showRowNumbers = DATA_GRID_DEFAULTS.showRowNumbers,
      selectable = DATA_GRID_DEFAULTS.selectable,
      selectedRowKeys: controlledSelectedKeys,
      onSelectionChange,
      sortable = true,
      sortState: controlledSortState,
      onSortChange,
      searchable = true,
      searchPlaceholder = DATA_GRID_DEFAULTS.searchPlaceholder,
      onSearch,
      filters = [],
      onFilterClick,
      totalRows,
      visibleColumns,
      totalColumns,
      viewName = 'Grid view',
      onViewChange,
      headerActions,
      onRowClick,
      stickyHeader = DATA_GRID_DEFAULTS.stickyHeader,
      compact = DATA_GRID_DEFAULTS.compact,
      bordered = DATA_GRID_DEFAULTS.bordered,
      striped = DATA_GRID_DEFAULTS.striped,
      loading,
      emptyText = DATA_GRID_DEFAULTS.emptyText,
      className,
      style,
    } = props;

    // ========================================================================
    // Internal State
    // ========================================================================
    const [internalSelectedKeys, setInternalSelectedKeys] = useState<string[]>([]);
    const [internalSortState, setInternalSortState] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [hoveredRowKey, setHoveredRowKey] = useState<string | null>(null);

    const selectedKeys = controlledSelectedKeys ?? internalSelectedKeys;
    const sortState = controlledSortState !== undefined ? controlledSortState : internalSortState;

    // ========================================================================
    // Helpers
    // ========================================================================
    const getRowKey = useCallback((record: Record<string, unknown>, index: number): string => {
      if (typeof rowKey === 'function') return rowKey(record);
      return String(record[rowKey as string] ?? index);
    }, [rowKey]);

    const cellPadding = compact
      ? `${tokens.spacing[1]}px ${tokens.spacing[2]}px`
      : `${tokens.spacing[2]}px ${tokens.spacing[3]}px`;
    const rowHeight = compact ? tokens.spacing[7] : 36;

    // ========================================================================
    // Handlers
    // ========================================================================
    const handleSort = useCallback((columnKey: string) => {
      const nextState = (() => {
        if (sortState?.key === columnKey) {
          if (sortState.direction === 'asc') return { key: columnKey, direction: 'desc' as const };
          return null;
        }
        return { key: columnKey, direction: 'asc' as const };
      })();

      if (controlledSortState === undefined) setInternalSortState(nextState);
      if (nextState) onSortChange?.(nextState.key, nextState.direction);
    }, [sortState, controlledSortState, onSortChange]);

    const handleSearch = useCallback((value: string) => {
      setSearchQuery(value);
      onSearch?.(value);
    }, [onSearch]);

    const handleSelectionChange = useCallback((keys: string[], records: Record<string, unknown>[]) => {
      if (!controlledSelectedKeys) setInternalSelectedKeys(keys);
      onSelectionChange?.(keys, records);
    }, [controlledSelectedKeys, onSelectionChange]);

    const toggleSelectAll = useCallback(() => {
      if (selectedKeys.length === data.length) {
        handleSelectionChange([], []);
      } else {
        const allKeys = data.map((r, i) => getRowKey(r as Record<string, unknown>, i));
        handleSelectionChange(allKeys, data as Record<string, unknown>[]);
      }
    }, [data, selectedKeys.length, getRowKey, handleSelectionChange]);

    const toggleSelectRow = useCallback((key: string, record: Record<string, unknown>) => {
      const newKeys = selectedKeys.includes(key)
        ? selectedKeys.filter((k) => k !== key)
        : [...selectedKeys, key];
      const newRecords = data.filter((r, i) =>
        newKeys.includes(getRowKey(r as Record<string, unknown>, i))
      ) as Record<string, unknown>[];
      handleSelectionChange(newKeys, newRecords);
    }, [selectedKeys, data, getRowKey, handleSelectionChange]);

    // ========================================================================
    // Data Processing
    // ========================================================================
    const filteredData = useMemo(() => {
      if (!searchQuery) return data;
      const query = searchQuery.toLowerCase();
      return data.filter((record) => {
        return (columns as DataGridColumn[]).some((col) => {
          const value = getValue(record as Record<string, unknown>, (col.dataIndex ?? col.key) as string);
          return String(value ?? '').toLowerCase().includes(query);
        });
      });
    }, [data, searchQuery, columns]);

    const sortedData = useMemo(() => {
      if (!sortState) return filteredData;
      const column = (columns as DataGridColumn[]).find((c) => c.key === sortState.key);
      if (!column) return filteredData;
      return [...filteredData].sort((a, b) => {
        const aVal = getValue(a as Record<string, unknown>, (column.dataIndex ?? column.key) as string);
        const bVal = getValue(b as Record<string, unknown>, (column.dataIndex ?? column.key) as string);
        return compareValues(aVal, bVal, sortState.direction);
      });
    }, [filteredData, sortState, columns]);

    const displayRowCount = totalRows ?? sortedData.length;
    const displayVisibleCols = visibleColumns ?? columns.length;
    const displayTotalCols = totalColumns ?? columns.length;

    // ========================================================================
    // Render: Badge Cell
    // ========================================================================
    const renderBadge = (value: unknown, col: DataGridColumn) => {
      const text = String(value ?? '');
      if (!text) return null;
      const colorKey = col.badgeColorMap?.[text] ?? 'gray';
      const colors = BADGE_COLORS[colorKey] ?? BADGE_COLORS.gray;
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`,
            borderRadius: tokens.borderRadius.full,
            fontSize: tokens.typography.fontSize.sm,
            fontWeight: tokens.typography.fontWeight.medium,
            lineHeight: '20px',
            backgroundColor: colors.bg,
            color: colors.text,
            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${colors.border}`,
            whiteSpace: 'nowrap',
          }}
        >
          {text}
        </span>
      );
    };

    // ========================================================================
    // Render: Cell Content
    // ========================================================================
    const renderCell = (value: unknown, record: Record<string, unknown>, index: number, col: DataGridColumn) => {
      if (col.render) return col.render(value, record, index);

      if (col.type === 'badge') return renderBadge(value, col);

      if (col.type === 'link') {
        const href = String(value ?? '');
        return (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: tokens.colors.primaryScale[600], textDecoration: 'none', fontSize: tokens.typography.fontSize.sm }}
            onClick={(e) => e.stopPropagation()}
          >
            {href}
          </a>
        );
      }

      if (col.type === 'number') {
        return (
          <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[800], fontVariantNumeric: 'tabular-nums' }}>
            {value != null ? String(value) : ''}
          </Text>
        );
      }

      if (col.type === 'date') {
        return (
          <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600] }}>
            {value != null ? String(value) : ''}
          </Text>
        );
      }

      return (
        <Text style={{
          fontSize: tokens.typography.fontSize.sm,
          color: tokens.colors.neutral[800],
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {value != null ? String(value) : ''}
        </Text>
      );
    };

    // ========================================================================
    // Render: Toolbar
    // ========================================================================
    const renderToolbar = () => (
      <Box
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
          borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          backgroundColor: tokens.colors.common.white,
          flexWrap: 'wrap',
          gap: tokens.spacing[2],
          minHeight: tokens.spacing[8],
        }}
      >
        {/* Left toolbar section */}
        <Flex align="center" gap={tokens.spacing[2]} style={{ flexWrap: 'wrap' }}>
          {/* View selector */}
          <button
            onClick={() => onViewChange?.(viewName)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: tokens.spacing[1],
              padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
              border: 'none',
              borderRadius: tokens.borderRadius.sm,
              backgroundColor: 'transparent',
              color: tokens.colors.neutral[700],
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.medium,
              cursor: 'pointer',
              transition: `all ${tokens.motion.hover}`,
              fontFamily: 'inherit',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
              <rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
              <rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
              <rect x="1" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
              <rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            {viewName}
          </button>

          {/* Separator */}
          <span style={{ width: 1, height: tokens.spacing[4], backgroundColor: tokens.colors.neutral[200], flexShrink: 0 }} />

          {/* Column / row count */}
          <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500], whiteSpace: 'nowrap' }}>
            {displayVisibleCols} of {displayTotalCols} columns &middot; {displayRowCount} rows
          </Text>

          {/* Separator */}
          <span style={{ width: 1, height: tokens.spacing[4], backgroundColor: tokens.colors.neutral[200], flexShrink: 0 }} />

          {/* Filter buttons */}
          {filters.length > 0 ? (
            filters.map((filter) => (
              <button
                key={filter.key}
                onClick={() => onFilterClick?.(filter.key)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: tokens.spacing[1],
                  padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`,
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${filter.active ? tokens.colors.primaryScale[600] : tokens.colors.neutral[200]}`,
                  borderRadius: tokens.borderRadius.sm,
                  backgroundColor: filter.active ? tokens.colors.primaryScale[50] : 'transparent',
                  color: filter.active ? tokens.colors.primaryScale[600] : tokens.colors.neutral[600],
                  fontSize: tokens.typography.fontSize.sm,
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                  fontWeight: filter.active ? tokens.typography.fontWeight.medium : tokens.typography.fontWeight.normal,
                  fontFamily: 'inherit',
                }}
              >
                {filter.label}
              </button>
            ))
          ) : (
            <button
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
                padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`,
                border: 'none',
                borderRadius: tokens.borderRadius.sm,
                backgroundColor: 'transparent',
                color: tokens.colors.neutral[500],
                fontSize: tokens.typography.fontSize.sm,
                cursor: 'default',
                fontFamily: 'inherit',
              }}
              disabled
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                <path d="M2 4h12M4 8h8M6 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              No filters
            </button>
          )}

          {/* Sort button */}
          {sortable && (
            <button
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
                padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`,
                border: 'none',
                borderRadius: tokens.borderRadius.sm,
                backgroundColor: sortState ? tokens.colors.primaryScale[50] : 'transparent',
                color: sortState ? tokens.colors.primaryScale[600] : tokens.colors.neutral[500],
                fontSize: tokens.typography.fontSize.sm,
                cursor: 'pointer',
                transition: `all ${tokens.motion.hover}`,
                fontWeight: sortState ? tokens.typography.fontWeight.medium : tokens.typography.fontWeight.normal,
                fontFamily: 'inherit',
              }}
              onClick={() => {
                if (sortState && controlledSortState === undefined) {
                  setInternalSortState(null);
                }
              }}
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                <path d="M4 6l4-4 4 4M4 10l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Sort{sortState ? ` by ${sortState.key}` : ''}
            </button>
          )}
        </Flex>

        {/* Right toolbar section */}
        <Flex align="center" gap={tokens.spacing[2]}>
          {headerActions}

          {/* Search */}
          {searchable && (
            <Box style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <svg
                width="14"
                height="14"
                viewBox="0 0 16 16"
                fill="none"
                style={{ position: 'absolute', left: tokens.spacing[2], pointerEvents: 'none', color: tokens.colors.neutral[400] }}
              >
                <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                style={{
                  width: 180,
                  padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px ${tokens.spacing[1]}px ${tokens.spacing[7]}px`,
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                  borderRadius: tokens.borderRadius.sm,
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.neutral[700],
                  backgroundColor: tokens.colors.common.white,
                  outline: 'none',
                  fontFamily: 'inherit',
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
          )}
        </Flex>
      </Box>
    );

    // ========================================================================
    // Render: Table Header
    // ========================================================================
    const renderHeader = () => (
      <tr style={{ backgroundColor: tokens.colors.neutral[50] }}>
        {/* Checkbox column header */}
        {selectable && (
          <th
            style={{
              width: 36,
              minWidth: 36,
              padding: cellPadding,
              borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
              borderRight: bordered ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}` : undefined,
              textAlign: 'center',
              position: stickyHeader ? 'sticky' as const : undefined,
              top: stickyHeader ? 0 : undefined,
              backgroundColor: tokens.colors.neutral[50],
              zIndex: stickyHeader ? 2 : undefined,
            }}
          >
            <input
              type="checkbox"
              checked={selectedKeys.length === data.length && data.length > 0}
              ref={(el) => {
                if (el) el.indeterminate = selectedKeys.length > 0 && selectedKeys.length < data.length;
              }}
              onChange={toggleSelectAll}
              style={{ width: 15, height: 15, cursor: 'pointer', accentColor: tokens.colors.primaryScale[600] }}
            />
          </th>
        )}

        {/* Row number column header */}
        {showRowNumbers && (
          <th
            style={{
              width: tokens.spacing[9],
              minWidth: tokens.spacing[9],
              padding: cellPadding,
              borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
              borderRight: bordered ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}` : undefined,
              textAlign: 'center',
              fontSize: tokens.typography.fontSize.xs,
              fontWeight: tokens.typography.fontWeight.medium,
              color: tokens.colors.neutral[400],
              position: stickyHeader ? 'sticky' as const : undefined,
              top: stickyHeader ? 0 : undefined,
              backgroundColor: tokens.colors.neutral[50],
              zIndex: stickyHeader ? 2 : undefined,
            }}
          />
        )}

        {/* Data column headers */}
        {(columns as DataGridColumn[]).map((col) => {
          const isSorted = sortState?.key === col.key;
          const sortDirection = isSorted ? sortState!.direction : null;
          const isColumnSortable = sortable && col.sortable !== false;

          return (
            <th
              key={col.key}
              onClick={isColumnSortable ? () => handleSort(col.key) : undefined}
              style={{
                padding: cellPadding,
                textAlign: col.align || 'left',
                fontWeight: tokens.typography.fontWeight.medium,
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[500],
                borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                borderRight: bordered ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}` : undefined,
                cursor: isColumnSortable ? 'pointer' : 'default',
                userSelect: 'none',
                whiteSpace: 'nowrap',
                width: col.width,
                minWidth: col.minWidth,
                position: stickyHeader ? 'sticky' as const : undefined,
                top: stickyHeader ? 0 : undefined,
                backgroundColor: tokens.colors.neutral[50],
                zIndex: stickyHeader ? 2 : undefined,
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                {col.icon ?? <ColumnTypeIcon type={col.type} />}
                {col.title}
                {isColumnSortable && isSorted && (
                  <span style={{ marginLeft: tokens.spacing[1], fontSize: tokens.typography.fontSize.xs, color: tokens.colors.primaryScale[600] }}>
                    {sortDirection === 'asc' ? '\u25B2' : '\u25BC'}
                  </span>
                )}
              </span>
            </th>
          );
        })}
      </tr>
    );

    // ========================================================================
    // Render: Table Rows
    // ========================================================================
    const renderRows = () => {
      if (sortedData.length === 0) {
        const totalColSpan = (selectable ? 1 : 0) + (showRowNumbers ? 1 : 0) + columns.length;
        return (
          <tr>
            <td
              colSpan={totalColSpan}
              style={{
                padding: tokens.spacing[8],
                textAlign: 'center',
                color: tokens.colors.neutral[400],
                fontSize: tokens.typography.fontSize.sm,
              }}
            >
              {emptyText}
            </td>
          </tr>
        );
      }

      return sortedData.map((record, index) => {
        const rec = record as Record<string, unknown>;
        const key = getRowKey(rec, index);
        const isSelected = selectedKeys.includes(key);
        const isHovered = hoveredRowKey === key;

        let rowBg = tokens.colors.common.white;
        if (isSelected) rowBg = tokens.colors.primaryScale[50];
        else if (isHovered) rowBg = tokens.colors.neutral[50];
        else if (striped && index % 2 === 1) rowBg = tokens.colors.neutral[50];

        return (
          <tr
            key={key}
            onClick={() => onRowClick?.(record, index)}
            onMouseEnter={() => setHoveredRowKey(key)}
            onMouseLeave={() => setHoveredRowKey(null)}
            style={{
              backgroundColor: rowBg,
              cursor: onRowClick ? 'pointer' : 'default',
              transition: `all ${tokens.motion.hover}`,
              transform: isHovered ? tokens.motion.transform : 'none',
              height: rowHeight,
            }}
          >
            {/* Checkbox */}
            {selectable && (
              <td
                style={{
                  width: 36,
                  padding: cellPadding,
                  borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                  borderRight: bordered ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` : undefined,
                  textAlign: 'center',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleSelectRow(key, rec)}
                  style={{ width: 15, height: 15, cursor: 'pointer', accentColor: tokens.colors.primaryScale[600] }}
                />
              </td>
            )}

            {/* Row number */}
            {showRowNumbers && (
              <td
                style={{
                  width: tokens.spacing[9],
                  padding: cellPadding,
                  borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                  borderRight: bordered ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` : undefined,
                  textAlign: 'center',
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.neutral[400],
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {index + 1}
              </td>
            )}

            {/* Data cells */}
            {(columns as DataGridColumn[]).map((col) => {
              const value = getValue(rec, (col.dataIndex ?? col.key) as string);
              return (
                <td
                  key={col.key}
                  style={{
                    padding: cellPadding,
                    borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                    borderRight: bordered ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` : undefined,
                    textAlign: col.align || 'left',
                    overflow: 'hidden',
                    maxWidth: 0,
                  }}
                >
                  {renderCell(value, rec, index, col)}
                </td>
              );
            })}
          </tr>
        );
      });
    };

    // ========================================================================
    // Render: Bottom Bar
    // ========================================================================
    const renderBottomBar = () => (
      <Box
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
          borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          backgroundColor: tokens.colors.common.white,
          minHeight: tokens.spacing[7],
        }}
      >
        <button
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: tokens.spacing[1],
            border: 'none',
            background: 'none',
            color: tokens.colors.neutral[500],
            fontSize: tokens.typography.fontSize.sm,
            cursor: 'pointer',
            transition: `all ${tokens.motion.hover}`,
            padding: `${tokens.spacing[0]}px ${tokens.spacing[1]}px`,
            fontFamily: 'inherit',
          }}
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
            <path d="M8 5v3l2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          View table history
        </button>

        <Flex align="center" gap={tokens.spacing[2]}>
          {selectedKeys.length > 0 && (
            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.primaryScale[600], fontWeight: tokens.typography.fontWeight.medium }}>
              {selectedKeys.length} selected
            </Text>
          )}
          <button
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              border: 'none',
              background: 'none',
              color: tokens.colors.neutral[400],
              cursor: 'pointer',
              transition: `all ${tokens.motion.hover}`,
              padding: tokens.spacing[1],
            }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </Flex>
      </Box>
    );

    // ========================================================================
    // Main Render
    // ========================================================================
    return (
      <Box
        className={className}
        style={{
          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          borderRadius: tokens.borderRadius.md,
          overflow: 'hidden',
          backgroundColor: tokens.colors.common.white,
          boxShadow: tokens.shadows.sm,
          ...style,
        }}
      >
        {renderToolbar()}

        <Box style={{ overflow: 'auto' }}>
          {loading ? (
            <Flex
              align="center"
              justify="center"
              style={{ padding: `${tokens.spacing[9]}px ${tokens.spacing[6]}px`, backgroundColor: tokens.colors.common.white }}
            >
              <Spinner size="md" />
            </Flex>
          ) : (
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                tableLayout: 'fixed',
              }}
            >
              <thead>{renderHeader()}</thead>
              <tbody>{renderRows()}</tbody>
            </table>
          )}
        </Box>

        {renderBottomBar()}
      </Box>
    );
  },
});
