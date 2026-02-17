'use client';

/**
 * DataTable - Professional Preset
 * Full-featured table built ONLY with DS primitives (no Ant Design Table)
 * Uses CSS Grid for table layout to ensure theme compatibility
 */

import React, { useState, useMemo, useCallback, type ReactNode, type Key } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createHoverStyle,
  createSectionHeaderStyle,
  createSurfaceStyle,
} from '../../../helpers';
import type { DataTableProps, DataTableColumn } from '../../core';
import { ChevronUp, ChevronDown, ChevronRight, ChevronLeft, Search } from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

export interface FilterOption {
  value: string;
  label: string;
  icon?: ReactNode;
}

export interface RowAction<T = Record<string, unknown>> {
  key: string;
  label: string;
  icon?: ReactNode;
  onClick: (record: T, index: number) => void;
  hidden?: (record: T) => boolean;
  danger?: boolean;
}

export interface BulkAction<T = Record<string, unknown>> {
  key: string;
  label: string;
  icon?: ReactNode;
  onClick: (selectedRecords: T[]) => void;
  danger?: boolean;
}

export interface ProfessionalDataTableProps<T = Record<string, unknown>> extends Omit<DataTableProps<T>, 'pagination' | 'selectedRowKeys' | 'editable' | 'onCellEdit' | 'columnReorderable' | 'onColumnReorder'> {
  /** Render function for expanded row content */
  expandedRowRender?: (record: T, index: number) => ReactNode;
  /** Default expanded row keys */
  defaultExpandedRowKeys?: Key[];
  /** Expand callback */
  onExpand?: (expanded: boolean, record: T) => void;
  /** Expand row by clicking anywhere on the row */
  expandRowByClick?: boolean;

  /** Filter options for toolbar */
  filters?: FilterOption[];
  /** Current filter value */
  filterValue?: string;
  /** Filter change handler */
  onFilterChange?: (value: string) => void;
  /** Filter label shown before buttons */
  filterLabel?: string;

  /** Enable row selection */
  selectable?: boolean;
  /** Selected row keys (controlled) */
  selectedRowKeys?: Key[];
  /** Selection change handler */
  onSelectionChange?: (keys: Key[], records: T[]) => void;
  /** Bulk actions for selected rows */
  bulkActions?: BulkAction<T>[];

  /** Row actions column */
  rowActions?: RowAction<T>[];
  /** Actions column width */
  actionsColumnWidth?: number | string;

  /** Search placeholder */
  searchPlaceholder?: string;
  /** Searchable fields for client-side filtering */
  searchableFields?: (keyof T)[];
  /** External search handler */
  onSearch?: (query: string) => void;

  /** Enable pagination */
  pagination?: boolean | {
    current?: number;
    pageSize?: number;
    total?: number;
    onChange?: (page: number, pageSize: number) => void;
  };
  /** Items per page options */
  pageSizeOptions?: number[];
  /** Default page size */
  defaultPageSize?: number;
  /** Show total count in pagination */
  showTotal?: boolean;

  /** Table title */
  title?: ReactNode;
  /** Extra content in toolbar */
  toolbarExtra?: ReactNode;
  /** Table size */
  size?: 'small' | 'middle' | 'large';
  /** Show border */
  bordered?: boolean;
  /** Sticky header */
  stickyHeader?: boolean;
  /** Max height for scrollable table */
  maxHeight?: number | string;
  /** Virtual scroll for large datasets */
  virtual?: boolean;

  /** Custom empty state */
  emptyState?: ReactNode;
  /** Hide toolbar */
  hideToolbar?: boolean;

  /** Enable inline cell editing (double-click to edit) */
  editable?: boolean;
  /** Cell edit handler */
  onCellEdit?: (rowKey: string, columnKey: string, value: unknown) => void;
  /** Enable column reordering via drag */
  columnReorderable?: boolean;
  /** Column reorder handler */
  onColumnReorder?: (columns: DataTableColumn[]) => void;
}

// ============================================================================
// Utility Functions
// ============================================================================

function getValue(record: Record<string, unknown>, dataIndex?: string): unknown {
  if (!dataIndex) return undefined;
  return dataIndex.split('.').reduce((obj: unknown, key) =>
    (obj as Record<string, unknown>)?.[key], record);
}

function compareValues(a: unknown, b: unknown, direction: 'asc' | 'desc'): number {
  const multiplier = direction === 'asc' ? 1 : -1;

  if (a == null && b == null) return 0;
  if (a == null) return 1 * multiplier;
  if (b == null) return -1 * multiplier;

  if (typeof a === 'string' && typeof b === 'string') {
    return a.localeCompare(b) * multiplier;
  }

  if (typeof a === 'number' && typeof b === 'number') {
    return (a - b) * multiplier;
  }

  return String(a).localeCompare(String(b)) * multiplier;
}

// ============================================================================
// Component
// ============================================================================

export const ProfessionalDataTable = createPreset<ProfessionalDataTableProps & Record<string, unknown>>({
  name: 'DataTable.Professional',
  render: ({ primitives, props, tokens, engine }: PresetContext<ProfessionalDataTableProps>) => {
    const { Box, Flex, Stack, Text, Button, Input, Badge, Card, Spinner } = primitives;
    const {
      columns,
      data,
      rowKey = 'id',
      loading,
      emptyText = 'No data',
      onRowClick,
      className,
      style,
      // Expandable
      expandedRowRender,
      defaultExpandedRowKeys: rawDefaultExpandedRowKeys = [],
      onExpand,
      expandRowByClick = false,
      // Filters
      filters = [],
      filterValue: controlledFilterValue,
      onFilterChange,
      // Selection
      selectable = false,
      selectedRowKeys: controlledSelectedKeys,
      onSelectionChange,
      bulkActions: rawBulkActions = [],
      // Row Actions
      rowActions = [],
      // Search
      searchPlaceholder = 'Filter...',
      searchableFields: rawSearchableFields = [],
      onSearch,
      // Pagination
      pagination = true,
      defaultPageSize = 10,
      showTotal = true,
      // Layout
      title,
      toolbarExtra,
      size = 'middle',
      maxHeight,
      // Empty
      emptyState,
      hideToolbar = false,
      // Inline editing
      editable = false,
      onCellEdit,
      // Column reorder
      columnReorderable = false,
      onColumnReorder,
    } = props;

    const defaultExpandedRowKeys = Array.isArray(rawDefaultExpandedRowKeys) ? rawDefaultExpandedRowKeys : [];
    const bulkActions = Array.isArray(rawBulkActions) ? rawBulkActions : [];
    const searchableFields = Array.isArray(rawSearchableFields) ? rawSearchableFields : [];

    // ========================================================================
    // Internal State
    // ========================================================================
    const [expandedKeys, setExpandedKeys] = useState<Set<Key>>(new Set(defaultExpandedRowKeys));
    const [sortState, setSortState] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [internalFilter, setInternalFilter] = useState('all');
    const [internalSelectedKeys, setInternalSelectedKeys] = useState<Key[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [hoveredRowKey, setHoveredRowKey] = useState<Key | null>(null);
    const [editingCell, setEditingCell] = useState<{ rowKey: string; colKey: string } | null>(null);
    const [editValue, setEditValue] = useState<string>('');
    const [draggedColKey, setDraggedColKey] = useState<string | null>(null);
    const [dragOverColKey, setDragOverColKey] = useState<string | null>(null);
    const [columnOrder, setColumnOrder] = useState<string[]>(() => (columns as DataTableColumn<unknown>[]).map(c => c.key));

    // Controlled vs uncontrolled
    const filterValue = controlledFilterValue ?? internalFilter;
    const selectedKeys = controlledSelectedKeys ?? internalSelectedKeys;

    // ========================================================================
    // Helpers
    // ========================================================================
    const getRowKey = useCallback((record: Record<string, unknown>, index: number): string => {
      if (typeof rowKey === 'function') return rowKey(record as Record<string, unknown>);
      return String(record[rowKey as string] ?? index);
    }, [rowKey]);

    // Size-based styling
    const cellPadding = size === 'small' ? '8px 12px' : size === 'large' ? '16px 20px' : '12px 16px';
    const fontSize = size === 'small' ? 12 : size === 'large' ? 14 : 13;
    const dropdownSurface = useMemo(() => createSurfaceStyle(tokens, { elevation: 'lg', glass: tokens.surface.useGlass }), [tokens, engine]);

    // ========================================================================
    // Handlers
    // ========================================================================
    const handleFilterChange = useCallback((value: string) => {
      if (!controlledFilterValue) setInternalFilter(value);
      onFilterChange?.(value);
      setCurrentPage(1);
    }, [controlledFilterValue, onFilterChange]);

    const handleSearch = useCallback((query: string) => {
      setSearchQuery(query);
      onSearch?.(query);
      setCurrentPage(1);
    }, [onSearch]);

    const handleSelectionChange = useCallback((keys: Key[], rows: unknown[]) => {
      if (!controlledSelectedKeys) setInternalSelectedKeys(keys);
      onSelectionChange?.(keys, rows as Record<string, unknown>[]);
    }, [controlledSelectedKeys, onSelectionChange]);

    const handleSort = useCallback((columnKey: string) => {
      setSortState((prev) => {
        if (prev?.key === columnKey) {
          if (prev.direction === 'asc') return { key: columnKey, direction: 'desc' };
          return null; // Remove sorting
        }
        return { key: columnKey, direction: 'asc' };
      });
    }, []);

    const toggleExpand = useCallback((key: Key, record: unknown) => {
      setExpandedKeys((prev) => {
        const next = new Set(prev);
        const isExpanded = next.has(key);
        if (isExpanded) {
          next.delete(key);
        } else {
          next.add(key);
        }
        onExpand?.(!isExpanded, record as Record<string, unknown>);
        return next;
      });
    }, [onExpand]);

    const toggleSelectAll = useCallback(() => {
      if (selectedKeys.length === data.length) {
        handleSelectionChange([], []);
      } else {
        const allKeys = data.map((r, i) => getRowKey(r as Record<string, unknown>, i));
        handleSelectionChange(allKeys, data);
      }
    }, [data, selectedKeys.length, getRowKey, handleSelectionChange]);

    const toggleSelectRow = useCallback((key: Key, record: unknown) => {
      const newKeys = selectedKeys.includes(key)
        ? selectedKeys.filter((k) => k !== key)
        : [...selectedKeys, key];
      const newRecords = data.filter((r, i) => newKeys.includes(getRowKey(r as Record<string, unknown>, i)));
      handleSelectionChange(newKeys, newRecords);
    }, [selectedKeys, data, getRowKey, handleSelectionChange]);

    // Inline editing handlers
    const startEditing = useCallback((rKey: string, colKey: string, currentValue: unknown) => {
      if (!editable) return;
      const col = (columns as DataTableColumn<unknown>[]).find(c => c.key === colKey);
      if (col && col.editable === false) return;
      setEditingCell({ rowKey: rKey, colKey });
      setEditValue(currentValue != null ? String(currentValue) : '');
    }, [editable, columns]);

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
      const reorderedCols = newOrder.map(key => (columns as DataTableColumn<unknown>[]).find(c => c.key === key)!).filter(Boolean);
      onColumnReorder?.(reorderedCols as DataTableColumn[]);
      setDraggedColKey(null);
      setDragOverColKey(null);
    }, [draggedColKey, columnOrder, columns, onColumnReorder]);

    const handleColumnDragEnd = useCallback(() => {
      setDraggedColKey(null);
      setDragOverColKey(null);
    }, []);

    // Ordered columns (respecting drag reorder)
    const orderedColumns = useMemo(() => {
      if (!columnReorderable) return columns as DataTableColumn<unknown>[];
      return columnOrder
        .map(key => (columns as DataTableColumn<unknown>[]).find(c => c.key === key))
        .filter((c): c is DataTableColumn<unknown> => c != null);
    }, [columns, columnOrder, columnReorderable]);

    // ========================================================================
    // Data Processing
    // ========================================================================

    // Client-side search filtering
    const searchFilteredData = useMemo(() => {
      if (!searchQuery || searchableFields.length === 0) return data;
      const query = searchQuery.toLowerCase();
      return data.filter((record) => {
        return searchableFields.some((field) => {
          const value = getValue(record as Record<string, unknown>, field as string);
          return String(value ?? '').toLowerCase().includes(query);
        });
      });
    }, [data, searchQuery, searchableFields]);

    // Status filtering (based on filterValue)
    const filteredData = useMemo(() => {
      if (filterValue === 'all' || !filterValue) return searchFilteredData;
      return searchFilteredData.filter((record) => {
        const rec = record as Record<string, unknown>;
        return rec.status === filterValue;
      });
    }, [searchFilteredData, filterValue]);

    // Sorting
    const sortedData = useMemo(() => {
      if (!sortState) return filteredData;
      const column = (columns as DataTableColumn<unknown>[]).find((c) => c.key === sortState.key);
      if (!column) return filteredData;

      return [...filteredData].sort((a, b) => {
        const aVal = getValue(a as Record<string, unknown>, column.dataIndex as string);
        const bVal = getValue(b as Record<string, unknown>, column.dataIndex as string);
        return compareValues(aVal, bVal, sortState.direction);
      });
    }, [filteredData, sortState, columns]);

    // Pagination
    const pageSize = defaultPageSize;
    const totalPages = Math.ceil(sortedData.length / pageSize);
    const paginatedData = useMemo(() => {
      if (pagination === false) return sortedData;
      const start = (currentPage - 1) * pageSize;
      return sortedData.slice(start, start + pageSize);
    }, [sortedData, currentPage, pageSize, pagination]);

    // Get selected records
    const selectedRecords = useMemo(() =>
      data.filter((r, i) => selectedKeys.includes(getRowKey(r as Record<string, unknown>, i))),
      [data, selectedKeys, getRowKey]
    );

    // Build grid template columns
    const gridTemplateColumns = useMemo(() => {
      const parts: string[] = [];

      // Expand column
      if (expandedRowRender) parts.push('40px');

      // Selection column
      if (selectable) parts.push('40px');

      // Data columns
      orderedColumns.forEach((col) => {
        if (col.width) {
          parts.push(typeof col.width === 'number' ? `${col.width}px` : col.width);
        } else {
          parts.push('1fr');
        }
      });

      // Actions column
      if (rowActions.length > 0) parts.push('100px');

      return parts.join(' ');
    }, [orderedColumns, expandedRowRender, selectable, rowActions.length]);

    // ========================================================================
    // Render: Toolbar
    // ========================================================================
    const renderToolbar = () => {
      if (hideToolbar) return null;

      const hasFilters = filters.length > 0;
      const hasSelection = selectedKeys.length > 0 && bulkActions.length > 0;

      return (
        <Box
          style={{
            padding: '16px 20px',
            borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} var(--ds-color-border-secondary)`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            backgroundColor: 'var(--ds-color-bg-primary)',
          }}
        >
          {/* Left: Title + Record count */}
          <Flex align="center" gap={16} style={{ flexWrap: 'wrap' }}>
            {title && (
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.lg,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: 'var(--ds-color-text-primary)',
                }}
              >
                {title}
              </Text>
            )}

            <Text
              style={{
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: 'var(--ds-color-text-secondary)',
                letterSpacing: '0.5px',
              }}
            >
              {filteredData.length} {filteredData.length === 1 ? 'RECORD' : 'RECORDS'}
            </Text>

            {/* Bulk actions when items selected */}
            {hasSelection && (
              <Flex align="center" gap={8}>
                <Badge variant="primary" size="sm">{selectedKeys.length} selected</Badge>
                {bulkActions.map((action) => (
                  <Button
                    key={action.key}
                    size="sm"
                    variant={action.danger ? 'error' : 'ghost'}
                    onClick={() => action.onClick(selectedRecords)}
                  >
                    {action.icon}
                    {action.label}
                  </Button>
                ))}
              </Flex>
            )}
          </Flex>

          {/* Right: Filters + Search */}
          <Flex align="center" gap={16}>
            {toolbarExtra}

            {/* Filters - now on the right */}
            {hasFilters && !hasSelection && (
              <Flex align="center" gap={4}>
                {filters.map((filter) => {
                  const isActive = filterValue === filter.value;
                  return (
                    <Button
                      key={filter.value}
                      size="sm"
                      variant={isActive ? 'primary' : 'ghost'}
                      onClick={() => handleFilterChange(filter.value)}
                      style={{
                        borderRadius: tokens.borderRadius.md,
                        padding: '6px 14px',
                        fontSize: tokens.typography.fontSize.sm,
                        fontWeight: tokens.typography.fontWeight.medium,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        border: isActive ? 'none' : `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} var(--ds-color-border-secondary)`,
                        backgroundColor: isActive ? 'var(--ds-color-primary)' : 'transparent',
                        color: isActive ? tokens.colors.common.white : 'var(--ds-color-text-secondary)',
                      }}
                    >
                      {filter.icon}
                      {filter.label}
                    </Button>
                  );
                })}
              </Flex>
            )}

            <Box
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Search
                style={{
                  position: 'absolute',
                  left: 12,
                  width: 16,
                  height: 16,
                  color: 'var(--ds-color-text-muted)',
                  pointerEvents: 'none',
                  zIndex: 1,
                }}
              />
              <Input
                type="text"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(value: string) => handleSearch(value)}
                style={{
                  minWidth: '200px',
                  paddingLeft: '36px',
                }}
                size="sm"
              />
            </Box>
          </Flex>
        </Box>
      );
    };

    // ========================================================================
    // Render: Header Row
    // ========================================================================
    const renderHeaderRow = () => (
      <Box
        style={{
          display: 'grid',
          gridTemplateColumns,
          backgroundColor: 'var(--ds-color-neutral-50)',
          borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} var(--ds-color-border-secondary)`,
        }}
      >
        {/* Expand column header */}
        {expandedRowRender && (
          <Box style={{ padding: cellPadding }} />
        )}

        {/* Selection column header */}
        {selectable && (
          <Box
            style={{
              padding: cellPadding,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <input
              type="checkbox"
              checked={selectedKeys.length === data.length && data.length > 0}
              onChange={toggleSelectAll}
              style={{
                width: 16,
                height: 16,
                cursor: 'pointer',
                transition: `all ${tokens.motion.hover}`,
                accentColor: 'var(--ds-color-primary)',
              }}
            />
          </Box>
        )}

        {/* Column headers */}
        {orderedColumns.map((col) => {
          const isSorted = sortState?.key === col.key;
          const sortDirection = isSorted ? sortState.direction : null;
          const isDragOver = dragOverColKey === col.key && draggedColKey !== col.key;

          return (
            <Box
              key={col.key}
              draggable={columnReorderable}
              onDragStart={columnReorderable ? (e: React.DragEvent) => handleColumnDragStart(e, col.key) : undefined}
              onDragOver={columnReorderable ? (e: React.DragEvent) => handleColumnDragOver(e, col.key) : undefined}
              onDrop={columnReorderable ? (e: React.DragEvent) => handleColumnDrop(e, col.key) : undefined}
              onDragEnd={columnReorderable ? handleColumnDragEnd : undefined}
              style={{
                padding: cellPadding,
                cursor: columnReorderable ? 'grab' : col.sortable ? 'pointer' : 'default',
                userSelect: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                borderLeft: isDragOver ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} var(--ds-color-primary)` : `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} transparent`,
                opacity: draggedColKey === col.key ? 0.5 : 1,
              }}
              onClick={col.sortable ? () => handleSort(col.key) : undefined}
            >
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: 'var(--ds-color-text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  whiteSpace: 'nowrap',
                }}
              >
                {col.title}
              </Text>

              {col.sortable && (
                <Stack gap={0} style={{ opacity: isSorted ? 1 : 0.3 }}>
                  <ChevronUp
                    style={{
                      width: 12,
                      height: 12,
                      marginBottom: -4,
                      color: sortDirection === 'asc'
                        ? 'var(--ds-color-primary)'
                        : 'var(--ds-color-text-muted)',
                    }}
                  />
                  <ChevronDown
                    style={{
                      width: 12,
                      height: 12,
                      color: sortDirection === 'desc'
                        ? 'var(--ds-color-primary)'
                        : 'var(--ds-color-text-muted)',
                    }}
                  />
                </Stack>
              )}
            </Box>
          );
        })}

        {/* Actions column header */}
        {rowActions.length > 0 && (
          <Box style={{ padding: cellPadding }} />
        )}
      </Box>
    );

    // ========================================================================
    // Render: Data Row
    // ========================================================================
    const renderDataRow = (record: unknown, index: number) => {
      const rec = record as Record<string, unknown>;
      const key = getRowKey(rec, index);
      const isExpanded = expandedKeys.has(key);
      const isSelected = selectedKeys.includes(key);
      const isHovered = hoveredRowKey === key;

      const handleRowClick = () => {
        if (expandRowByClick && expandedRowRender) {
          toggleExpand(key, record);
        }
        onRowClick?.(rec, index);
      };

      return (
        <Box key={key}>
          {/* Main Row */}
          <Box
            style={{
              display: 'grid',
              gridTemplateColumns,
              backgroundColor: isSelected
                ? 'var(--ds-color-primary-50)'
                : isHovered
                  ? 'var(--ds-color-bg-secondary)'
                  : 'var(--ds-color-bg-primary)',
              borderBottom: isExpanded ? 'none' : `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} var(--ds-color-border-secondary)`,
              cursor: (expandedRowRender || onRowClick) ? 'pointer' : 'default',
              transition: `all ${tokens.motion.hover}`,
              transform: isHovered ? tokens.motion.transform : 'none',
            }}
            onClick={handleRowClick}
            onMouseEnter={() => setHoveredRowKey(key)}
            onMouseLeave={() => setHoveredRowKey(null)}
          >
            {/* Expand toggle */}
            {expandedRowRender && (
              <Box
                style={{
                  padding: cellPadding,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  toggleExpand(key, record);
                }}
              >
                <Box
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: tokens.borderRadius.sm,
                    backgroundColor: isExpanded
                      ? 'var(--ds-color-primary)'
                      : 'var(--ds-color-neutral-200)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: `all ${tokens.motion.hover}`,
                  }}
                >
                  <ChevronDown
                    style={{
                      width: 14,
                      height: 14,
                      color: isExpanded ? tokens.colors.common.white : 'var(--ds-color-text-muted)',
                      transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                      transition: `all ${tokens.motion.hover}`,
                    }}
                  />
                </Box>
              </Box>
            )}

            {/* Selection checkbox */}
            {selectable && (
              <Box
                style={{
                  padding: cellPadding,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleSelectRow(key, record)}
                  style={{
                    width: 16,
                    height: 16,
                    cursor: 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                    accentColor: 'var(--ds-color-primary)',
                  }}
                />
              </Box>
            )}

            {/* Data cells */}
            {orderedColumns.map((col) => {
              const value = getValue(rec, col.dataIndex as string);
              const isEditing = editable && editingCell?.rowKey === key && editingCell?.colKey === col.key;
              const isColEditable = editable && col.editable !== false && !col.render;

              if (isEditing) {
                return (
                  <Box
                    key={col.key}
                    style={{
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                    onClick={(e: React.MouseEvent) => e.stopPropagation()}
                  >
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
                        padding: '4px 8px',
                        border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} var(--ds-color-primary)`,
                        borderRadius: tokens.borderRadius.sm,
                        fontSize,
                        outline: 'none',
                        backgroundColor: tokens.colors.common.white,
                        fontFamily: 'inherit',
                      }}
                    
                      onFocus={(e) => {
                        e.currentTarget.style.boxShadow = `0 0 0 2px ${tokens.colors.primaryScale[100]}`;
                        e.currentTarget.style.borderColor = tokens.colors.primaryScale[400];
                      }}
                    />
                  </Box>
                );
              }

              const content = col.render
                ? col.render(value, rec as Record<string, unknown>, index)
                : String(value ?? '');

              return (
                <Box
                  key={col.key}
                  onDoubleClick={isColEditable ? () => startEditing(String(key), col.key, value) : undefined}
                  style={{
                    padding: cellPadding,
                    display: 'flex',
                    alignItems: 'center',
                    overflow: 'hidden',
                    textAlign: col.align || 'left',
                    cursor: isColEditable ? 'text' : 'default',
                  }}
                >
                  {typeof content === 'string' ? (
                    <Text
                      style={{
                        fontSize,
                        color: 'var(--ds-color-text-primary)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {content}
                    </Text>
                  ) : (
                    content
                  )}
                </Box>
              );
            })}

            {/* Row actions */}
            {rowActions.length > 0 && (
              <Box
                style={{
                  padding: cellPadding,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: 4,
                }}
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
              >
                {rowActions
                  .filter((action) => !action.hidden?.(rec))
                  .map((action) => (
                    <Button
                      key={action.key}
                      size="sm"
                      variant={action.danger ? 'error' : 'ghost'}
                      onClick={() => action.onClick(rec, index)}
                      title={action.label}
                      style={{ padding: '4px 8px' }}
                    >
                      {action.icon || action.label}
                    </Button>
                  ))}
              </Box>
            )}
          </Box>

          {/* Expanded Content */}
          {isExpanded && expandedRowRender && (
            <Box
              style={{
                backgroundColor: 'var(--ds-color-bg-secondary)',
                borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} var(--ds-color-border-secondary)`,
                padding: '20px 24px',
              }}
            >
              {expandedRowRender(rec, index)}
            </Box>
          )}
        </Box>
      );
    };

    // ========================================================================
    // Render: Empty State
    // ========================================================================
    const renderEmptyState = () => (
      <Flex
        align="center"
        justify="center"
        style={{
          padding: '48px 24px',
          backgroundColor: 'var(--ds-color-bg-primary)',
        }}
      >
        {emptyState || (
          <Text style={{ color: 'var(--ds-color-text-muted)', fontSize: tokens.typography.fontSize.sm }}>
            {emptyText}
          </Text>
        )}
      </Flex>
    );

    // ========================================================================
    // Render: Pagination
    // ========================================================================
    const renderPagination = () => {
      if (pagination === false || sortedData.length === 0) return null;

      const startRecord = (currentPage - 1) * pageSize + 1;
      const endRecord = Math.min(currentPage * pageSize, sortedData.length);

      // Generate page numbers
      const getPageNumbers = () => {
        const pages: (number | 'ellipsis')[] = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
          for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
          pages.push(1);
          if (currentPage > 3) pages.push('ellipsis');
          for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
            pages.push(i);
          }
          if (currentPage < totalPages - 2) pages.push('ellipsis');
          if (totalPages > 1) pages.push(totalPages);
        }

        return pages;
      };

      return (
        <Flex
          align="center"
          justify="between"
          style={{
            padding: '12px 20px',
            borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} var(--ds-color-border-secondary)`,
            backgroundColor: 'var(--ds-color-bg-primary)',
          }}
        >
          {/* Left: Showing X-Y of Z */}
          {showTotal && (
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: 'var(--ds-color-text-secondary)' }}>
              Showing {startRecord}-{endRecord} of {sortedData.length} results
            </Text>
          )}

          {/* Right: Page controls */}
          <Flex align="center" gap={4}>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              style={{
                padding: '6px 10px',
                opacity: currentPage === 1 ? 0.5 : 1,
              }}
            >
              <ChevronLeft style={{ width: 16, height: 16 }} />
              Previous
            </Button>

            {getPageNumbers().map((page, idx) =>
              page === 'ellipsis' ? (
                <Text
                  key={`ellipsis-${idx}`}
                  style={{
                    padding: '0 8px',
                    color: 'var(--ds-color-text-muted)',
                  }}
                >
                  ...
                </Text>
              ) : (
                <Button
                  key={page}
                  size="sm"
                  variant={currentPage === page ? 'primary' : 'ghost'}
                  onClick={() => setCurrentPage(page)}
                  style={{
                    minWidth: 32,
                    padding: '6px 10px',
                  }}
                >
                  {page}
                </Button>
              )
            )}

            <Button
              size="sm"
              variant="ghost"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              style={{
                padding: '6px 10px',
                opacity: currentPage === totalPages ? 0.5 : 1,
              }}
            >
              Next
              <ChevronRight style={{ width: 16, height: 16 }} />
            </Button>
          </Flex>
        </Flex>
      );
    };

    // ========================================================================
    // Main Render
    // ========================================================================
    return (
      <Card
        variant="outlined"
        padding="none"
        className={className}
        style={{
          overflow: 'hidden',
          ...style,
        }}
      >
        {renderToolbar()}

        <Box
          style={{
            maxHeight: maxHeight,
            overflow: maxHeight ? 'auto' : 'visible',
          }}
        >
          {renderHeaderRow()}

          {loading ? (
            <Flex
              align="center"
              justify="center"
              style={{
                padding: '48px 24px',
                backgroundColor: 'var(--ds-color-bg-primary)',
              }}
            >
              <Spinner size="md" />
            </Flex>
          ) : paginatedData.length === 0 ? (
            renderEmptyState()
          ) : (
            paginatedData.map((record, index) =>
              renderDataRow(record, (currentPage - 1) * pageSize + index)
            )
          )}
        </Box>

        {renderPagination()}
      </Card>
    );
  },
});

export default ProfessionalDataTable;
