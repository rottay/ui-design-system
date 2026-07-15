'use client';

/**
 * @fileoverview Rustic Table engine -- pure HTML/CSS (zero UI-library dependencies).
 *
 * Full-featured data table using authored engine CSS, bounded runtime layout values,
 * `var(--ds-*)` custom properties, and semantic HTML. Achieves feature parity with the Modern
 * engine (sorting, filtering, pagination, selection, expand, virtual scroll,
 * sticky columns, column resize, nested headers, inline editing, summary rows)
 * but without any DaisyUI or Tailwind dependency, making it ideal for
 * environments where a utility-class framework is unavailable.
 *
 * All visual properties are driven by CSS custom properties with sensible
 * fallbacks, so tenant themes can re-skin the table without touching JS.
 *
 * Engine: **Vanilla HTML + CSS custom properties**
 *
 * @example
 * ```tsx
 * <Table engine="rustic" dataSource={products} columns={cols} bordered size="small" />
 * ```
 *
 * @module Table/engines/rustic
 * @category Display
 * @package @rottay/design-system
 */
import React, { useState, Fragment, useRef, useEffect, useCallback } from 'react';
import type { CSSProperties } from 'react';
import type { TableProps, ColumnType, SortOrder, TableCellFieldType } from '../Table.types';
import {
  useTableFeatures,
  columnFieldKey,
  type HeaderCell,
} from '../hooks/useTableFeatures';
import { useTranslation } from '../../../../../i18n';

// ---------------------------------------------------------------------------
// Style definitions using CSS custom properties
// ---------------------------------------------------------------------------
// All styles use CSS custom properties with sensible fallbacks so tenant themes
// can override any visual aspect (colors, spacing, borders) without JS changes.
// The `as const` casts prevent TypeScript from widening string literal types.
//
// PAINT (color, background, border, shadow, outline, transform, hover/focus/
// active states) is NOT here -- it lives in the unlayered rustic table skin
// (`tokens/css/engines/rustic/skin/table.css`), keyed on the `data-part`/
// `data-*` contract stamped below (WO-ARC-09). Only layout, typography sizing,
// opacity, and animation stay inline.
const baseStyles = {
  wrapper: {
    position: 'relative' as const,
  },
  tableContainer: {
    overflowX: 'auto' as const,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontSize: 'var(--ds-table-cell-font-size, 14px)',
  },
  tableSmall: {
    fontSize: 'var(--ds-font-size-xs, 12px)',
  },
  tableLarge: {
    fontSize: 'var(--ds-font-size-lg, 16px)',
  },
  th: {
    padding: 'var(--ds-table-cell-padding, 12px 16px)',
    textAlign: 'left' as const,
    fontWeight: 'var(--ds-table-header-font-weight, 500)' as any,
    position: 'relative' as const,
  },
  // userSelect: none prevents text selection during rapid sort toggling
  thSortable: {
    cursor: 'pointer',
    userSelect: 'none' as const,
    transition: 'background-color 0.2s cubic-bezier(0.16, 1, 0.3, 1), color 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
  },
  // zIndex 20 sits above fixed columns (10). The opaque header background that
  // prevents body rows from bleeding through while scrolling is painted
  // unconditionally by the rustic table skin's header-cell rule, not here.
  thSticky: {
    position: 'sticky' as const,
    zIndex: 20,
  },
  td: {
    padding: 'var(--ds-table-cell-padding, 12px 16px)',
  },
  tdSmall: {
    padding: '8px 12px',
  },
  tdLarge: {
    padding: '16px 20px',
  },
  // box-shadow transition is included alongside background-color so the
  // left-border accent (applied via inset box-shadow on hover) also animates.
  rowHover: {
    transition: 'background-color 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
  },
  emptyCell: {
    textAlign: 'center' as const,
    padding: '48px 32px',
    fontStyle: 'italic',
    letterSpacing: '0.01em',
  },
  // Loading overlay sits above everything in the table (zIndex 30 > sticky 20).
  // Semi-transparent background lets users see the data is stale but updating.
  loading: {
    position: 'absolute' as const,
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 30,
  },
  pagination: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: '8px',
    marginTop: '16px',
    fontSize: 'var(--ds-table-cell-font-size, 14px)',
  },
  pageButton: {
    padding: '4px 12px',
    cursor: 'pointer',
    fontSize: 'inherit',
    transition: 'transform 0.15s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.15s',
  },
  pageButtonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  checkbox: {
    width: '16px',
    height: '16px',
    cursor: 'pointer',
  },
  sortIcon: {
    marginLeft: '4px',
    fontSize: '10px',
    opacity: 0.6,
    display: 'inline-block',
    transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s',
  },
  // Resize handle is a thin 4px strip on the right edge of each header cell.
  // It is invisible by default and only shows a colored indicator when active.
  resizeHandle: {
    position: 'absolute' as const,
    right: 0,
    top: 0,
    bottom: 0,
    width: '4px',
    cursor: 'col-resize',
    userSelect: 'none' as const,
  },
  resizeHandleActive: {
    opacity: 0.6,
  },
  filterInput: {
    width: '100%',
    padding: '2px 6px',
    fontSize: 'var(--ds-font-size-xs, 12px)',
    transition: 'border-color 0.15s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
  },
  expandButton: {
    padding: '2px 6px',
    cursor: 'pointer',
    fontSize: '12px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), color 0.15s',
  },
  expandedRowCell: {
    padding: '16px',
    animation: 'var(--ds-personality-animation-entrance-duration, 0.2s) cubic-bezier(0.16, 1, 0.3, 1) rottay-table-expand-in',
  },
  // Fixed (sticky) columns need an opaque background to obscure scrolling
  // content underneath; that background is painted by the rustic table skin's
  // `[data-fixed]` rule (three CSS variable fallback levels).
  fixedLeft: {
    position: 'sticky' as const,
    left: 0,
    zIndex: 10,
  },
  fixedRight: {
    position: 'sticky' as const,
    right: 0,
    zIndex: 10,
  },
  titleBar: {
    marginBottom: '8px',
    fontWeight: 600,
  },
  footerBar: {
    marginTop: '8px',
    fontSize: 'var(--ds-font-size-sm, 14px)',
  },
  tfoot: {
    fontWeight: 600,
  },
  editInput: {
    width: '100%',
    padding: '2px 6px',
    fontSize: 'inherit',
    boxSizing: 'border-box' as const,
  },
  editSelect: {
    width: '100%',
    padding: '2px 6px',
    fontSize: 'inherit',
    boxSizing: 'border-box' as const,
  },
  editCheckbox: {
    width: '16px',
    height: '16px',
    cursor: 'pointer',
  },
};

/**
 * Rustic Table engine -- dependency-free data grid.
 *
 * Layout and behavior use inline styles and CSS custom properties; paint
 * (color, background, border, shadow, and the hover/focus/active states) is
 * driven by the unlayered rustic table skin
 * (`tokens/css/engines/rustic/skin/table.css`), keyed on the
 * `data-part`/`data-*` contract this file stamps.
 *
 * @param props - Unified DS TableProps (see Table.types.ts)
 * @returns A vanilla HTML table element with pagination controls
 */
export const Table = <T extends object = object>(props: TableProps<T>) => {
  const { t } = useTranslation('components');

  const {
    columns = [],
    loading = false,
    size = 'default',
    bordered = false,
    pagination = {},
    rowSelection,
    expandable,
    scroll,
    showHeader = true,
    title,
    footer,
    locale,
    rowClassName,
    rowHoverable = true,
    onRow,
    summary,
    className = '',
    style,
    id,
  } = props;

  const features = useTableFeatures({ props });
  const {
    displayData,
    leafColumns,
    headerRows,
    sortState,
    handleSort,
    columnFilters,
    handleColumnFilter,
    currentPage,
    pageSize,
    totalItems,
    setCurrentPage,
    paginationRange,
    selectedRowKeys,
    handleSelectAll,
    handleSelectRow,
    isAllSelected,
    expandedRowKeys,
    handleToggleExpand,
    isRowExpandable,
    virtualEnabled,
    scrollContainerRef,
    virtualSlice,
    columnWidths,
    handleResizeStart,
    resizingColumn,
    stickyConfig,
    hasSummary,
    editingCell,
    isCellEditing,
    isCellEditable,
    handleCellClick,
    handleCellSave,
    handleCellCancel,
    handleCellKeyNav,
    getRowKey,
    getValue,
    totalColSpan,
    processedData,
  } = features;

  const { onCellEdit } = props;

  const hasExpandable = !!expandable?.expandedRowRender;
  const showExpandCol = hasExpandable && expandable?.showExpandColumn !== false;
  const hasFilters = leafColumns.some((c) => c.filterSearch || c.filters);

  // ---- Style helpers ----
  // These functions compose the base style objects with size/bordered/layout
  // overrides. Composition happens at render time because the size prop can
  // change dynamically (e.g., responsive layouts).
  const getTableStyle = (): CSSProperties => {
    const base: CSSProperties = { ...baseStyles.table };
    if (size === 'small') Object.assign(base, baseStyles.tableSmall);
    if (size === 'large') Object.assign(base, baseStyles.tableLarge);
    if (props.tableLayout === 'fixed') base.tableLayout = 'fixed';
    const scrollXValue = scroll?.x;
    if (scrollXValue) {
      base.width = typeof scrollXValue === 'number' ? scrollXValue : scrollXValue === true ? '100%' : scrollXValue;
    }
    return base;
  };

  const getCellStyle = (): CSSProperties => {
    const base: CSSProperties = { ...baseStyles.td };
    if (size === 'small') Object.assign(base, baseStyles.tdSmall);
    if (size === 'large') Object.assign(base, baseStyles.tdLarge);
    return base;
  };

  const getFixedStyle = (col: ColumnType<T>): CSSProperties => {
    if (!col.fixed) return {};
    if (col.fixed === 'left' || col.fixed === true) return baseStyles.fixedLeft;
    if (col.fixed === 'right') return baseStyles.fixedRight;
    return {};
  };

  const getColumnWidth = (col: ColumnType<T>): number | string | undefined => {
    const field = columnFieldKey(col) || String(col.key);
    if (columnWidths[field]) return columnWidths[field];
    return col.width;
  };

  // ---- Inline editable cell component (Rustic - pure inline styles) ----
  // Defined as a nested component so it closes over handleCellSave/handleCellKeyNav
  // without prop drilling. The component renders the appropriate input type
  // (text, number, date, select, checkbox) based on column.fieldType.
  const EditableCellInput = ({
    value: initialValue,
    record,
    index,
    column,
    colIndex,
  }: {
    value: unknown;
    record: T;
    index: number;
    column: ColumnType<T>;
    colIndex: number;
  }) => {
    const [cellValue, setCellValue] = useState(initialValue);
    const inputRef = useRef<HTMLInputElement | HTMLSelectElement>(null);
    const fieldType: TableCellFieldType = column.fieldType || 'text';

    useEffect(() => {
      inputRef.current?.focus();
    }, []);

    const save = useCallback(
      (val?: unknown) => {
        handleCellSave(record, index, column, val !== undefined ? val : cellValue);
      },
      [record, index, column, cellValue]
    );

    // Enter/Tab saves and moves focus to the next cell (via handleCellKeyNav).
    // Escape discards the edit. This matches spreadsheet keyboard conventions.
    const onKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === 'Tab' || e.key === 'Escape') {
        if (e.key !== 'Escape') {
          save();
        }
        handleCellKeyNav(e, record, index, column, colIndex);
      }
    };

    // Custom editRender
    if (column.editRender) {
      return (
        <div onKeyDown={onKeyDown}>
          {column.editRender(initialValue, record, (val) => save(val))}
        </div>
      );
    }

    if (fieldType === 'checkbox') {
      return (
        <input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          type="checkbox"
          style={baseStyles.editCheckbox}
          data-part="selection-control"
          checked={!!cellValue}
          onChange={(e) => {
            setCellValue(e.target.checked);
            save(e.target.checked);
          }}
          onKeyDown={onKeyDown}
          onBlur={() => save()}
          aria-label={t('table.edit_cell')}
        />
      );
    }

    if (fieldType === 'select') {
      return (
        <select
          ref={inputRef as React.RefObject<HTMLSelectElement>}
          style={baseStyles.editSelect}
          data-part="field"
          data-field="edit"
          value={String(cellValue ?? '')}
          onChange={(e) => {
            setCellValue(e.target.value);
            save(e.target.value);
          }}
          onKeyDown={onKeyDown}
          onBlur={() => save()}
          aria-label={t('table.edit_cell')}
        >
          {(column.selectOptions || []).map((opt) => (
            <option key={String(opt.value)} value={String(opt.value)}>
              {opt.label}
            </option>
          ))}
        </select>
      );
    }

    if (fieldType === 'date') {
      return (
        <input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          type="date"
          style={baseStyles.editInput}
          data-part="field"
          data-field="edit"
          value={String(cellValue ?? '')}
          onChange={(e) => setCellValue(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={() => save()}
          aria-label={t('table.edit_cell')}
        />
      );
    }

    // text or number
    return (
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        type={fieldType === 'number' ? 'number' : 'text'}
        style={baseStyles.editInput}
        data-part="field"
        data-field="edit"
        value={cellValue == null ? '' : String(cellValue)}
        onChange={(e) =>
          setCellValue(fieldType === 'number' ? Number(e.target.value) : e.target.value)
        }
        onKeyDown={onKeyDown}
        onBlur={() => save()}
        aria-label={t('table.edit_cell')}
      />
    );
  };

  // ---- Render header cells for one row of nested column groups ----
  const renderHeaderRow = (cells: HeaderCell<T>[], rowIndex: number) => {
    return cells.map((cell, cellIndex) => {
      const { column, colSpan, rowSpan } = cell;
      const field = columnFieldKey(column);
      const isSortable = !!column.sorter;
      const isCurrentSort = sortState.field === field;
      const width = getColumnWidth(column);

      let ariaSortValue: 'ascending' | 'descending' | 'none' | undefined;
      if (isSortable) {
        if (isCurrentSort && sortState.order === 'ascend') ariaSortValue = 'ascending';
        else if (isCurrentSort && sortState.order === 'descend') ariaSortValue = 'descending';
        else ariaSortValue = 'none';
      }

      const thStyle: CSSProperties = {
        ...baseStyles.th,
        width,
        minWidth: column.minWidth,
        textAlign: column.align,
        ...(isSortable ? baseStyles.thSortable : {}),
        ...getFixedStyle(column),
        ...(stickyConfig.enabled
          ? { ...baseStyles.thSticky, top: stickyConfig.offsetHeader + rowIndex * 40 }
          : {}),
        ...column.style,
      };

      return (
        <th
          key={column.key || field || `${rowIndex}-${cellIndex}`}
          colSpan={colSpan > 1 ? colSpan : undefined}
          rowSpan={rowSpan > 1 ? rowSpan : undefined}
          style={thStyle}
          data-part="header-cell"
          data-sortable={isSortable ? 'true' : undefined}
          data-sticky={stickyConfig.enabled ? 'true' : undefined}
          data-hairline="true"
          data-fixed={column.fixed === true ? 'true' : (column.fixed || undefined)}
          onClick={() => isSortable && handleSort(column)}
          aria-sort={ariaSortValue}
          role="columnheader"
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ flex: 1 }}>{column.title}</span>
            {isSortable && (
              <span
                data-part="sort-indicator"
                data-order={isCurrentSort ? sortState.order : 'none'}
                style={{
                  ...baseStyles.sortIcon,
                  opacity: isCurrentSort ? 1 : 0.4,
                }}
              >
                {isCurrentSort ? '▲' : '⇅'}
              </span>
            )}
          </span>
          {/* Resize handle */}
          {colSpan <= 1 && (
            <span
              data-part="resize-handle"
              data-resizing={resizingColumn === field ? 'true' : undefined}
              style={{
                ...baseStyles.resizeHandle,
                ...(resizingColumn === field ? baseStyles.resizeHandleActive : {}),
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
                if (field) handleResizeStart(field, e.clientX);
              }}
              role="separator"
              aria-label={t('table.resize_column', { column: String(column.title || '') })}
            />
          )}
        </th>
      );
    });
  };

  // ---- Filter row ----
  // Per-column text inputs for client-side filtering. Focus/hover paint is
  // driven by the rustic table skin's `:focus`/`:hover` rules, keyed on
  // `data-part="field"`.
  const renderFilterRow = () => {
    if (!hasFilters) return null;
    const cellStyle = getCellStyle();
    return (
      <tr data-part="filter-row">
        {rowSelection && <th data-part="cell" data-bordered="true" style={{ ...cellStyle, width: '48px' }} />}
        {showExpandCol && <th data-part="cell" data-bordered="true" style={{ ...cellStyle, width: '48px' }} />}
        {leafColumns.map((col, i) => {
          const field = columnFieldKey(col);
          if (!col.filterSearch && !col.filters) {
            return <th key={col.key || field || i} data-part="cell" data-bordered="true" style={cellStyle} />;
          }
          return (
            <th key={col.key || field || i} data-part="cell" data-bordered="true" style={{ ...cellStyle, padding: '4px 8px' }}>
              <input
                type="text"
                style={baseStyles.filterInput}
                data-part="field"
                data-field="filter"
                placeholder={t('table.filter_column', { column: String(col.title || '') })}
                value={columnFilters[field || ''] || ''}
                onChange={(e) => field && handleColumnFilter(field, e.target.value)}
                aria-label={t('table.filter_column', { column: String(col.title || '') })}
              />
            </th>
          );
        })}
      </tr>
    );
  };

  // ---- Body rows ----
  const renderBodyRows = () => {
    const cellStyle = getCellStyle();

    if (displayData.length === 0) {
      return (
        <tr>
          <td colSpan={totalColSpan} style={baseStyles.emptyCell} data-part="empty-cell">
            {locale?.emptyText || t('table.empty')}
          </td>
        </tr>
      );
    }

    const indexOffset = virtualEnabled ? virtualSlice.start : 0;

    return displayData.map((record, displayIdx) => {
      const actualIndex = indexOffset + displayIdx;
      const key = getRowKey(record, actualIndex);
      const isSelected = selectedRowKeys.includes(key);
      const isExpanded = expandedRowKeys.has(key);
      const canExpand = isRowExpandable(record);
      const rowClass = typeof rowClassName === 'function' ? rowClassName(record, actualIndex) : rowClassName;

      const rowStyle: CSSProperties = {
        ...(rowHoverable ? baseStyles.rowHover : {}),
      };

      return (
        <Fragment key={key}>
          <tr
            className={rowClass || undefined}
            style={rowStyle}
            data-part="row"
            data-selected={isSelected ? 'true' : undefined}
            data-hoverable={rowHoverable ? 'true' : undefined}
            aria-expanded={hasExpandable ? isExpanded : undefined}
            {...(onRow?.(record, actualIndex) || {})}
          >
            {/* Expand column */}
            {showExpandCol && (
              <td
                style={{ ...cellStyle, width: expandable?.columnWidth || '48px', textAlign: 'center' }}
                data-part="cell"
                data-bordered="true"
              >
                {canExpand ? (
                  expandable?.expandIcon ? (
                    expandable.expandIcon({
                      expanded: isExpanded,
                      onExpand: () => handleToggleExpand(record, actualIndex),
                      record,
                    })
                  ) : (
                    <button
                      style={baseStyles.expandButton}
                      data-part="expand-button"
                      data-expanded={isExpanded ? 'true' : undefined}
                      onClick={() => handleToggleExpand(record, actualIndex)}
                      aria-label={isExpanded ? t('table.collapse_row') : t('table.expand_row')}
                    >
                      {'▶'}
                    </button>
                  )
                ) : null}
              </td>
            )}

            {/* Selection column */}
            {rowSelection && (
              <td
                style={{ ...cellStyle, width: rowSelection.columnWidth || '48px' }}
                data-part="cell"
                data-bordered="true"
              >
                <input
                  type={rowSelection.type === 'radio' ? 'radio' : 'checkbox'}
                  style={baseStyles.checkbox}
                  data-part="selection-control"
                  checked={isSelected}
                  onChange={(e) => handleSelectRow(record, actualIndex, e.target.checked)}
                  name={rowSelection.type === 'radio' ? 'table-row-selection' : undefined}
                  aria-label={t('table.select_row', { index: actualIndex + 1 })}
                />
              </td>
            )}

            {/* Data columns */}
            {leafColumns.map((column, colIndex) => {
              const value = getValue(record, column.dataIndex);
              const field = columnFieldKey(column) || String(column.key) || '';
              const width = getColumnWidth(column);
              const cellEditable = onCellEdit && isCellEditable(column, record, actualIndex);
              const cellIsEditing = isCellEditing(key, field);

              const content = cellIsEditing ? (
                <EditableCellInput
                  value={value}
                  record={record}
                  index={actualIndex}
                  column={column}
                  colIndex={colIndex}
                />
              ) : column.render ? (
                column.render(value, record, actualIndex)
              ) : (
                String(value ?? '')
              );

              const tdStyle: CSSProperties = {
                ...cellStyle,
                textAlign: column.align,
                width,
                ...(column.ellipsis
                  ? { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }
                  : {}),
                ...getFixedStyle(column),
                ...column.style,
                ...(cellEditable && !cellIsEditing
                  ? {
                      cursor: 'pointer',
                      transition: 'outline 0.15s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
                    }
                  : {}),
              };

              return (
                <td
                  key={column.key || field || colIndex}
                  style={tdStyle}
                  data-part="cell"
                  data-bordered="true"
                  data-editable={cellEditable && !cellIsEditing ? 'true' : undefined}
                  data-fixed={column.fixed === true ? 'true' : (column.fixed || undefined)}
                  role="gridcell"
                  onClick={
                    cellEditable && !cellIsEditing
                      ? () => handleCellClick(record, actualIndex, column)
                      : undefined
                  }
                  {...(column.onCell?.(record, actualIndex) || {})}
                >
                  {content}
                </td>
              );
            })}
          </tr>

          {/* Expanded row content */}
          {hasExpandable && isExpanded && canExpand && expandable?.expandedRowRender && (
            <tr data-part="expanded-row">
              <td colSpan={totalColSpan} style={baseStyles.expandedRowCell}>
                {expandable.expandedRowRender(record, actualIndex, expandable.indentSize || 0, true)}
              </td>
            </tr>
          )}
        </Fragment>
      );
    });
  };

  // ---- Scroll dimensions ----
  // scroll.y sets maxHeight on the scroll container, enabling vertical overflow.
  // Accepts both pixel numbers and CSS strings (e.g., 'calc(100vh - 200px)').
  const scrollYValue = typeof scroll?.y === 'number' ? scroll.y : typeof scroll?.y === 'string' ? scroll.y : undefined;

  const tableElement = (
    <table
      style={getTableStyle()}
      role="grid"
      data-part="table"
      data-bordered={bordered ? 'true' : undefined}
    >
      {/* colgroup */}
      <colgroup>
        {showExpandCol && <col style={{ width: expandable?.columnWidth || 48 }} />}
        {rowSelection && <col style={{ width: rowSelection.columnWidth || 48 }} />}
        {leafColumns.map((col, i) => {
          const field = columnFieldKey(col) || String(col.key) || String(i);
          const w = getColumnWidth(col);
          return <col key={field} style={{ width: w, minWidth: col.minWidth }} />;
        })}
      </colgroup>

      {/* Header */}
      {showHeader && (
        <thead>
          {headerRows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {/* Expand + Selection header cells only on first header row */}
              {rowIndex === 0 && showExpandCol && (
                <th
                  rowSpan={headerRows.length > 1 ? headerRows.length : undefined}
                  style={{
                    ...baseStyles.th,
                    width: expandable?.columnWidth || '48px',
                    ...(stickyConfig.enabled ? { ...baseStyles.thSticky, top: stickyConfig.offsetHeader } : {}),
                  }}
                  data-part="header-cell"
                  data-hairline="true"
                  data-sticky={stickyConfig.enabled ? 'true' : undefined}
                >
                  {expandable?.columnTitle || ''}
                </th>
              )}
              {rowIndex === 0 && rowSelection && (
                <th
                  rowSpan={headerRows.length > 1 ? headerRows.length : undefined}
                  style={{
                    ...baseStyles.th,
                    width: rowSelection.columnWidth || '48px',
                    ...(stickyConfig.enabled ? { ...baseStyles.thSticky, top: stickyConfig.offsetHeader } : {}),
                  }}
                  data-part="header-cell"
                  data-hairline="true"
                  data-sticky={stickyConfig.enabled ? 'true' : undefined}
                >
                  {rowSelection.type !== 'radio' && !rowSelection.hideSelectAll && (
                    <input
                      type="checkbox"
                      style={baseStyles.checkbox}
                      data-part="selection-control"
                      checked={isAllSelected}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      aria-label={t('table.select_all')}
                    />
                  )}
                </th>
              )}
              {renderHeaderRow(row, rowIndex)}
            </tr>
          ))}
          {renderFilterRow()}
        </thead>
      )}

      {/* Body -- when virtual scrolling is enabled, invisible spacer rows before
          and after the visible window maintain the scroll container's total height
          so the scrollbar thumb size/position stays correct. 48px is the estimated
          row height used for offset calculations. */}
      <tbody>
        {virtualEnabled && virtualSlice.offsetTop > 0 && (
          <tr style={{ height: virtualSlice.offsetTop }} aria-hidden="true">
            <td colSpan={totalColSpan} />
          </tr>
        )}
        {renderBodyRows()}
        {virtualEnabled && (
          <tr
            style={{
              height: Math.max(
                0,
                virtualSlice.totalHeight -
                  virtualSlice.offsetTop -
                  (virtualSlice.end - virtualSlice.start) * 48
              ),
            }}
            aria-hidden="true"
          >
            <td colSpan={totalColSpan} />
          </tr>
        )}
      </tbody>

      {/* Summary / tfoot */}
      {hasSummary && summary && (
        <tfoot style={baseStyles.tfoot} data-part="summary-row">{summary(processedData)}</tfoot>
      )}
    </table>
  );

  return (
    <div
      className={['ds-table', 'ds-table--rustic', className].filter(Boolean).join(' ')}
      style={{ ...baseStyles.wrapper, ...style }}
      id={id}
    >
      {/* Title */}
      {title && (
        <div style={baseStyles.titleBar} data-part="title">{title(processedData)}</div>
      )}

      {/* Loading overlay */}
      {loading && (
        <div style={baseStyles.loading} data-part="loading-overlay">
          <span data-part="spinner">{t('table.loading')}</span>
        </div>
      )}

      {/* Table scroll container */}
      <div
        ref={virtualEnabled ? scrollContainerRef : undefined}
        style={{
          ...baseStyles.tableContainer,
          ...(loading ? { opacity: 0.5 } : {}),
          ...(resizingColumn ? { userSelect: 'none' } : {}),
          maxHeight: scrollYValue,
          overflowY: scrollYValue ? 'auto' : undefined,
        }}
      >
        {tableElement}
      </div>

      {/* Footer */}
      {footer && (
        <div style={baseStyles.footerBar} data-part="footer">{footer(processedData)}</div>
      )}

      {/* Pagination */}
      {pagination !== false && (
        <div style={baseStyles.pagination}>
          <span data-part="pagination-range">
            {paginationRange}
          </span>
          <button
            style={{
              ...baseStyles.pageButton,
              ...(currentPage === 1 ? baseStyles.pageButtonDisabled : {}),
            }}
            data-part="pagination-button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
            aria-label={t('table.previous_page')}
          >
            &#171;
          </button>
          <span>{t('table.page', { current: currentPage })}</span>
          <button
            style={{
              ...baseStyles.pageButton,
              ...(currentPage * pageSize >= totalItems ? baseStyles.pageButtonDisabled : {}),
            }}
            data-part="pagination-button"
            disabled={currentPage * pageSize >= totalItems}
            onClick={() => setCurrentPage(currentPage + 1)}
            aria-label={t('table.next_page')}
          >
            &#187;
          </button>
        </div>
      )}
    </div>
  );
};

Table.displayName = 'Table.Rustic';

export default Table;
