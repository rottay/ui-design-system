'use client';

/**
 * DataGrid - Enriched Preset
 * Full-featured Airtable-style spreadsheet with column resizing,
 * inline editing, row expansion, frozen first column, enrichment controls,
 * breadcrumb navigation, and onboarding progress bar
 */

import React, { useState, useMemo, useCallback, useRef } from 'react';
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
// Extended Props for Enriched Preset
// ============================================================================

export interface EnrichedDataGridProps<T = Record<string, unknown>> extends DataGridProps<T> {
  /** Enable inline cell editing */
  editable?: boolean;
  /** Cell edit handler */
  onCellEdit?: (rowKey: string, columnKey: string, value: unknown) => void;
  /** Enable column reordering via drag */
  columnReorderable?: boolean;
  /** Column reorder handler */
  onColumnReorder?: (columns: DataGridColumn<T>[]) => void;
  /** Enable row expansion */
  expandable?: boolean;
  /** Render function for expanded row content */
  expandedRowRender?: (record: T, index: number) => React.ReactNode;
  /** Freeze first data column */
  freezeFirstColumn?: boolean;
  /** Show "Add enrichment" button */
  showEnrichmentButton?: boolean;
  /** Enrichment button click handler */
  onAddEnrichment?: () => void;
  /** Breadcrumb items */
  breadcrumbs?: Array<{ label: string; href?: string; onClick?: () => void }>;
  /** Onboarding progress (0-100) */
  onboardingProgress?: number;
  /** Onboarding label */
  onboardingLabel?: string;
  /** Onboarding dismiss handler */
  onDismissOnboarding?: () => void;
}

// ============================================================================
// Component
// ============================================================================

export const EnrichedDataGrid = createPreset<EnrichedDataGridProps & Record<string, unknown>>({
  name: 'DataGrid.Enriched',
  render: ({ primitives, props, tokens, engine }: PresetContext<EnrichedDataGridProps>) => {
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
      filters: rawFilters = [],
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
      // Enriched-specific
      editable = false,
      onCellEdit,
      expandable = false,
      expandedRowRender,
      freezeFirstColumn = true,
      showEnrichmentButton = true,
      onAddEnrichment,
      breadcrumbs: rawBreadcrumbs = [],
      onboardingProgress,
      onboardingLabel,
      onDismissOnboarding,
      // Column reorder
      columnReorderable = false,
      onColumnReorder,
    } = props;

    const filters = Array.isArray(rawFilters) ? rawFilters : [];
    const breadcrumbs = Array.isArray(rawBreadcrumbs) ? rawBreadcrumbs : [];

    // ========================================================================
    // Internal State
    // ========================================================================
    const [internalSelectedKeys, setInternalSelectedKeys] = useState<string[]>([]);
    const [internalSortState, setInternalSortState] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [hoveredRowKey, setHoveredRowKey] = useState<string | null>(null);
    const [expandedRowKeys, setExpandedRowKeys] = useState<Set<string>>(new Set());
    const [editingCell, setEditingCell] = useState<{ rowKey: string; colKey: string } | null>(null);
    const [editValue, setEditValue] = useState<string>('');
    const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
    const [showOnboarding, setShowOnboarding] = useState(onboardingProgress != null);
    const [draggedColKey, setDraggedColKey] = useState<string | null>(null);
    const [dragOverColKey, setDragOverColKey] = useState<string | null>(null);
    const [columnOrder, setColumnOrder] = useState<string[]>(() => (columns as DataGridColumn[]).map(c => c.key));

    const resizingRef = useRef<{ colKey: string; startX: number; startWidth: number } | null>(null);

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
    // Frozen Column Offset Calculation
    // ========================================================================
    const frozenLeftOffset = useMemo(() => {
      let offset = 0;
      if (expandable && expandedRowRender) offset += tokens.spacing[7];
      if (selectable) offset += 36;
      if (showRowNumbers) offset += tokens.spacing[9];
      return offset;
    }, [expandable, expandedRowRender, selectable, showRowNumbers, tokens.spacing]);

    // ========================================================================
    // Column Resizing
    // ========================================================================
    const handleResizeStart = useCallback((e: React.MouseEvent, colKey: string, currentWidth: number) => {
      e.preventDefault();
      e.stopPropagation();
      const startX = e.clientX;
      const startWidth = columnWidths[colKey] ?? currentWidth;
      resizingRef.current = { colKey, startX, startWidth };

      const handleMouseMove = (moveEvent: MouseEvent) => {
        if (!resizingRef.current) return;
        const diff = moveEvent.clientX - resizingRef.current.startX;
        const newWidth = Math.max(60, resizingRef.current.startWidth + diff);
        setColumnWidths((prev) => ({ ...prev, [resizingRef.current!.colKey]: newWidth }));
      };

      const handleMouseUp = () => {
        resizingRef.current = null;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }, [columnWidths]);

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

    const toggleExpand = useCallback((key: string) => {
      setExpandedRowKeys((prev) => {
        const next = new Set(prev);
        if (next.has(key)) next.delete(key);
        else next.add(key);
        return next;
      });
    }, []);

    const startEditing = useCallback((rKey: string, colKey: string, currentValue: unknown) => {
      if (!editable) return;
      setEditingCell({ rowKey: rKey, colKey });
      setEditValue(currentValue != null ? String(currentValue) : '');
    }, [editable]);

    const commitEdit = useCallback(() => {
      if (editingCell) {
        onCellEdit?.(editingCell.rowKey, editingCell.colKey, editValue);
        setEditingCell(null);
        setEditValue('');
      }
    }, [editingCell, editValue, onCellEdit]);

    const cancelEdit = useCallback(() => {
      setEditingCell(null);
      setEditValue('');
    }, []);

    // Column reorder handlers
    const handleColumnDragStart = useCallback((e: React.DragEvent, colKey: string) => {
      if (!columnReorderable) return;
      setDraggedColKey(colKey);
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', colKey);
    }, [columnReorderable]);

    const handleColumnDragOver = useCallback((e: React.DragEvent, colKey: string) => {
      if (!columnReorderable || !draggedColKey) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      setDragOverColKey(colKey);
    }, [columnReorderable, draggedColKey]);

    const handleColumnDrop = useCallback((e: React.DragEvent, targetColKey: string) => {
      e.preventDefault();
      if (!draggedColKey || draggedColKey === targetColKey) {
        setDraggedColKey(null);
        setDragOverColKey(null);
        return;
      }
      const newOrder = [...columnOrder];
      const fromIdx = newOrder.indexOf(draggedColKey);
      const toIdx = newOrder.indexOf(targetColKey);
      if (fromIdx === -1 || toIdx === -1) return;
      newOrder.splice(fromIdx, 1);
      newOrder.splice(toIdx, 0, draggedColKey);
      setColumnOrder(newOrder);
      const reorderedCols = newOrder.map(key => (columns as DataGridColumn[]).find(c => c.key === key)!).filter(Boolean);
      onColumnReorder?.(reorderedCols);
      setDraggedColKey(null);
      setDragOverColKey(null);
    }, [draggedColKey, columnOrder, columns, onColumnReorder]);

    const handleColumnDragEnd = useCallback(() => {
      setDraggedColKey(null);
      setDragOverColKey(null);
    }, []);

    // Ordered columns
    const orderedColumns = useMemo(() => {
      if (!columnReorderable) return columns as DataGridColumn[];
      return columnOrder
        .map(key => (columns as DataGridColumn[]).find(c => c.key === key))
        .filter((c): c is DataGridColumn => c != null);
    }, [columns, columnOrder, columnReorderable]);

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
    const renderCell = (
      value: unknown,
      record: Record<string, unknown>,
      index: number,
      col: DataGridColumn,
      rKey: string,
    ) => {
      // Inline editing mode
      if (editable && editingCell?.rowKey === rKey && editingCell?.colKey === col.key) {
        return (
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
              padding: `${tokens.spacing[0]}px ${tokens.spacing[1]}px`,
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
        );
      }

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
    // Render: Breadcrumbs
    // ========================================================================
    const renderBreadcrumbs = () => {
      if (breadcrumbs.length === 0) return null;
      return (
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[1],
            padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
            borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            backgroundColor: tokens.colors.common.white,
            fontSize: tokens.typography.fontSize.sm,
          }}
        >
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && (
                <span style={{ color: tokens.colors.neutral[300], fontSize: tokens.typography.fontSize.xs }}>/</span>
              )}
              {crumb.href || crumb.onClick ? (
                <a
                  href={crumb.href ?? '#'}
                  onClick={(e) => {
                    if (crumb.onClick) { e.preventDefault(); crumb.onClick(); }
                  }}
                  style={{
                    color: idx === breadcrumbs.length - 1 ? tokens.colors.neutral[800] : tokens.colors.primaryScale[600],
                    textDecoration: 'none',
                    fontWeight: idx === breadcrumbs.length - 1 ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.normal,
                    cursor: 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                  }}
                >
                  {crumb.label}
                </a>
              ) : (
                <span
                  style={{
                    color: idx === breadcrumbs.length - 1 ? tokens.colors.neutral[800] : tokens.colors.neutral[500],
                    fontWeight: idx === breadcrumbs.length - 1 ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.normal,
                  }}
                >
                  {crumb.label}
                </span>
              )}
            </React.Fragment>
          ))}
        </Box>
      );
    };

    // ========================================================================
    // Render: Onboarding Progress Bar
    // ========================================================================
    const renderOnboarding = () => {
      if (!showOnboarding || onboardingProgress == null) return null;
      return (
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
            borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            backgroundColor: tokens.colors.infoScale[50],
          }}
        >
          <Flex align="center" gap={tokens.spacing[3]} style={{ flex: 1 }}>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[700], whiteSpace: 'nowrap' }}>
              {onboardingLabel ?? 'Getting started'}
            </Text>
            <Box
              style={{
                flex: 1,
                maxWidth: 200,
                height: tokens.spacing[1],
                backgroundColor: tokens.colors.neutral[200],
                borderRadius: tokens.borderRadius.sm,
                overflow: 'hidden',
              }}
            >
              <Box
                style={{
                  width: `${Math.min(100, Math.max(0, onboardingProgress))}%`,
                  height: '100%',
                  backgroundColor: tokens.colors.primaryScale[600],
                  borderRadius: tokens.borderRadius.sm,
                  transition: `width ${tokens.transitions?.normal || tokens.motion.hover}`,
                }}
              />
            </Box>
            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
              {onboardingProgress}%
            </Text>
          </Flex>
          <button
            onClick={() => { setShowOnboarding(false); onDismissOnboarding?.(); }}
            style={{
              border: 'none',
              background: 'none',
              color: tokens.colors.neutral[400],
              cursor: 'pointer',
              transition: `all ${tokens.motion.hover}`,
              padding: tokens.spacing[1],
              fontSize: tokens.typography.fontSize.sm,
              lineHeight: 1,
              fontFamily: 'inherit',
            }}
            aria-label="Dismiss onboarding"
          >
            &#10005;
          </button>
        </Box>
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

          <span style={{ width: 1, height: tokens.spacing[4], backgroundColor: tokens.colors.neutral[200], flexShrink: 0 }} />

          <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500], whiteSpace: 'nowrap' }}>
            {displayVisibleCols} of {displayTotalCols} columns &middot; {displayRowCount} rows
          </Text>

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

          {/* Add enrichment button */}
          {showEnrichmentButton && (
            <button
              onClick={onAddEnrichment}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
                padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[600]}`,
                borderRadius: tokens.borderRadius.sm,
                backgroundColor: 'transparent',
                color: tokens.colors.primaryScale[600],
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                cursor: 'pointer',
                transition: `all ${tokens.motion.hover}`,
                whiteSpace: 'nowrap',
                fontFamily: 'inherit',
              }}
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Add enrichment
            </button>
          )}

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
        {/* Expand column header */}
        {expandable && expandedRowRender && (
          <th
            style={{
              width: tokens.spacing[7],
              minWidth: tokens.spacing[7],
              padding: cellPadding,
              borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
              borderRight: bordered ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}` : undefined,
              position: stickyHeader ? 'sticky' as const : undefined,
              top: stickyHeader ? 0 : undefined,
              backgroundColor: tokens.colors.neutral[50],
              zIndex: stickyHeader ? 2 : undefined,
            }}
          />
        )}

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
        {orderedColumns.map((col, colIndex) => {
          const isSorted = sortState?.key === col.key;
          const sortDirection = isSorted ? sortState!.direction : null;
          const isColumnSortable = sortable && col.sortable !== false;
          const isFirstCol = colIndex === 0;
          const colWidth = columnWidths[col.key] ?? (typeof col.width === 'number' ? col.width : undefined);
          const isDragOver = dragOverColKey === col.key && draggedColKey !== col.key;

          return (
            <th
              key={col.key}
              draggable={columnReorderable}
              onDragStart={columnReorderable ? (e: React.DragEvent) => handleColumnDragStart(e, col.key) : undefined}
              onDragOver={columnReorderable ? (e: React.DragEvent) => handleColumnDragOver(e, col.key) : undefined}
              onDrop={columnReorderable ? (e: React.DragEvent) => handleColumnDrop(e, col.key) : undefined}
              onDragEnd={columnReorderable ? handleColumnDragEnd : undefined}
              onClick={isColumnSortable ? () => handleSort(col.key) : undefined}
              style={{
                padding: cellPadding,
                textAlign: col.align || 'left',
                fontWeight: tokens.typography.fontWeight.medium,
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[500],
                borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                borderRight: bordered ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}` : undefined,
                borderLeft: isDragOver ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[600]}` : undefined,
                cursor: columnReorderable ? 'grab' : isColumnSortable ? 'pointer' : 'default',
                userSelect: 'none',
                whiteSpace: 'nowrap',
                width: colWidth,
                minWidth: col.minWidth ?? 80,
                opacity: draggedColKey === col.key ? 0.5 : 1,
                position: (stickyHeader || (freezeFirstColumn && isFirstCol)) ? 'sticky' as const : undefined,
                top: stickyHeader ? 0 : undefined,
                left: freezeFirstColumn && isFirstCol ? frozenLeftOffset : undefined,
                backgroundColor: tokens.colors.neutral[50],
                zIndex: stickyHeader
                  ? (freezeFirstColumn && isFirstCol ? 3 : 2)
                  : (freezeFirstColumn && isFirstCol ? 1 : undefined),
                boxShadow: freezeFirstColumn && isFirstCol ? tokens.shadows.sm : undefined,
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, width: '100%' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, flex: 1 }}>
                  {col.icon ?? <ColumnTypeIcon type={col.type} />}
                  {col.title}
                  {isColumnSortable && isSorted && (
                    <span style={{ marginLeft: tokens.spacing[1], fontSize: tokens.typography.fontSize.xs, color: tokens.colors.primaryScale[600] }}>
                      {sortDirection === 'asc' ? '\u25B2' : '\u25BC'}
                    </span>
                  )}
                </span>

                {/* Resize handle */}
                {col.resizable !== false && (
                  <span
                    onMouseDown={(e) => handleResizeStart(e, col.key, colWidth ?? 150)}
                    style={{
                      display: 'inline-block',
                      width: tokens.spacing[1],
                      height: 18,
                      cursor: 'col-resize',
                      backgroundColor: 'transparent',
                      borderRight: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} transparent`,
                      marginLeft: 'auto',
                      flexShrink: 0,
                    }}
                    onMouseEnter={(e) => {
                      (e.target as HTMLElement).style.borderRightColor = tokens.colors.primaryScale[600];
                    }}
                    onMouseLeave={(e) => {
                      (e.target as HTMLElement).style.borderRightColor = 'transparent';
                    }}
                  />
                )}
              </span>
            </th>
          );
        })}

        {/* Add column header */}
        <th
          style={{
            width: 36,
            minWidth: 36,
            padding: cellPadding,
            borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            textAlign: 'center',
            position: stickyHeader ? 'sticky' as const : undefined,
            top: stickyHeader ? 0 : undefined,
            backgroundColor: tokens.colors.neutral[50],
            zIndex: stickyHeader ? 2 : undefined,
          }}
        >
          <button
            onClick={onAddEnrichment}
            style={{
              border: 'none',
              background: 'none',
              color: tokens.colors.neutral[400],
              cursor: 'pointer',
              transition: `all ${tokens.motion.hover}`,
              padding: tokens.spacing[0],
              fontSize: tokens.typography.fontSize.md,
              lineHeight: 1,
              fontFamily: 'inherit',
            }}
            title="Add column"
          >
            +
          </button>
        </th>
      </tr>
    );

    // ========================================================================
    // Render: Table Rows
    // ========================================================================
    const renderRows = () => {
      if (sortedData.length === 0) {
        const totalColSpan =
          (expandable && expandedRowRender ? 1 : 0) +
          (selectable ? 1 : 0) +
          (showRowNumbers ? 1 : 0) +
          columns.length + 1;
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
        const isExpanded = expandedRowKeys.has(key);

        let rowBg = tokens.colors.common.white;
        if (isSelected) rowBg = tokens.colors.primaryScale[50];
        else if (isHovered) rowBg = tokens.colors.neutral[50];
        else if (striped && index % 2 === 1) rowBg = tokens.colors.neutral[50];

        const totalColSpan =
          (expandable && expandedRowRender ? 1 : 0) +
          (selectable ? 1 : 0) +
          (showRowNumbers ? 1 : 0) +
          columns.length + 1;

        return (
          <React.Fragment key={key}>
            <tr
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
              {/* Expand toggle */}
              {expandable && expandedRowRender && (
                <td
                  style={{
                    width: tokens.spacing[7],
                    padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                    borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                    borderRight: bordered ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` : undefined,
                    textAlign: 'center',
                  }}
                  onClick={(e) => { e.stopPropagation(); toggleExpand(key); }}
                >
                  <span
                    style={{
                      display: 'inline-block',
                      fontSize: tokens.typography.fontSize.xs,
                      color: tokens.colors.neutral[400],
                      transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                      transition: `all ${tokens.motion.hover}`,
                      cursor: 'pointer',
                    }}
                  >
                    &#9654;
                  </span>
                </td>
              )}

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
              {orderedColumns.map((col, colIndex) => {
                const value = getValue(rec, (col.dataIndex ?? col.key) as string);
                const isFirstCol = colIndex === 0;
                const colWidth = columnWidths[col.key] ?? (typeof col.width === 'number' ? col.width : undefined);

                return (
                  <td
                    key={col.key}
                    onDoubleClick={() => startEditing(key, col.key, value)}
                    style={{
                      padding: cellPadding,
                      borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                      borderRight: bordered ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` : undefined,
                      textAlign: col.align || 'left',
                      overflow: 'hidden',
                      maxWidth: 0,
                      width: colWidth,
                      position: freezeFirstColumn && isFirstCol ? 'sticky' as const : undefined,
                      left: freezeFirstColumn && isFirstCol ? frozenLeftOffset : undefined,
                      backgroundColor: freezeFirstColumn && isFirstCol ? rowBg : undefined,
                      zIndex: freezeFirstColumn && isFirstCol ? 1 : undefined,
                      boxShadow: freezeFirstColumn && isFirstCol ? tokens.shadows.sm : undefined,
                      cursor: editable ? 'text' : undefined,
                    }}
                  >
                    {renderCell(value, rec, index, col, key)}
                  </td>
                );
              })}

              {/* Empty add-column cell */}
              <td
                style={{
                  width: 36,
                  padding: cellPadding,
                  borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                }}
              />
            </tr>

            {/* Expanded row content */}
            {expandable && expandedRowRender && isExpanded && (
              <tr>
                <td
                  colSpan={totalColSpan}
                  style={{
                    padding: `${tokens.spacing[4]}px ${tokens.spacing[6]}px`,
                    backgroundColor: tokens.colors.neutral[50],
                    borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                  }}
                >
                  {expandedRowRender(record, index)}
                </td>
              </tr>
            )}
          </React.Fragment>
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
        {renderBreadcrumbs()}
        {renderOnboarding()}
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
