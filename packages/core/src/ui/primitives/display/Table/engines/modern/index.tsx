'use client';

/**
 * @fileoverview Modern Table engine -- DS token inline-style implementation.
 *
 * Full-featured data table built on inline styles and DS CSS custom properties
 * instead of DaisyUI or Tailwind utility classes. Implements sorting, filtering,
 * pagination, row selection, expandable rows, virtual scrolling, column resize,
 * nested header groups, inline cell editing, and summary rows -- all with
 * WAI-ARIA grid semantics.
 *
 * The heavy lifting (sort/filter/paginate/virtual-scroll state) lives in the
 * shared `useTableFeatures` hook; this file is responsible only for rendering
 * that state into semantic markup and wiring user interactions back to the hook.
 *
 * Engine: **DS Token / Inline Styles**
 *
 * @example
 * ```tsx
 * <Table engine="modern" dataSource={orders} columns={cols} rowSelection={{ type: 'checkbox' }} />
 * ```
 *
 * @module Table/engines/modern
 * @category Display
 * @package @rottay/design-system
 */
import React, { Fragment, useState, useRef, useEffect, useCallback } from 'react';
import type { TableProps, ColumnType, SortOrder, TableCellFieldType } from '../../contracts';
import {
  useTableFeatures,
  columnFieldKey,
  type HeaderCell,
} from '../../runtime/table-features';
import { useTranslation } from '@/infrastructure/runtime/i18n';
import { toCanonicalSize } from '../../../../../../foundation/contracts/kernel/common';

/** Padding tokens per canonical `sm | md | lg` size step (replaces DaisyUI table-xs/md/lg). */
const SIZE_PADDING: Record<'sm' | 'md' | 'lg', { cell: string; fontSize: number }> = {
  sm: { cell: '4px 8px', fontSize: 12 },
  md: { cell: '8px 12px', fontSize: 14 },
  lg: { cell: '12px 16px', fontSize: 16 },
};

/** Layout for inline inputs; the paint is the modern skin's `[data-part='field']`. */
const inlineInputStyle: React.CSSProperties = {
  width: '100%',
  padding: '2px 6px',
  fontSize: 12,
};

/** Layout for inline selects; `[data-part='field']` paints them, `appearance` stays inline. */
const inlineSelectStyle: React.CSSProperties = {
  ...inlineInputStyle,
  appearance: 'auto' as const,
};

/** Layout for inline checkboxes/radios; the paint is the modern skin's `[data-part='selection-control']`. */
const inlineCheckboxStyle: React.CSSProperties = {
  width: 16,
  height: 16,
  cursor: 'pointer',
};

/**
 * Modern Table engine backed by DS token inline styles.
 *
 * Renders a full-featured data grid using semantic `<table>` markup styled
 * with inline DS token styles. All stateful logic (sort, filter, pagination,
 * selection, virtual scroll, column resize) is delegated to `useTableFeatures`.
 *
 * @param props - Unified DS TableProps (see Table.types.ts)
 * @returns A DS-token-styled table element with pagination controls
 */
export const Table = <T extends object = object>(props: TableProps<T>) => {
  const { t } = useTranslation('components');

  const {
    columns = [],
    loading = false,
    size = 'default',
    bordered = false,
    headerBordered = true,
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
  // Normalize size (canonical sm/md/lg or the deprecated small/middle/large/
  // default spellings) to one of our three DS tokens. Any unrecognized value
  // falls through to 'md' so the table always has valid sizing.
  const sizeKey = toCanonicalSize(size) ?? 'md';
  const sizeTokens = SIZE_PADDING[sizeKey];
  const hasExpandable = !!expandable?.expandedRowRender;
  // The expand column is rendered unless the consumer explicitly opts out via
  // showExpandColumn: false -- useful when they want expand-on-row-click only.
  const showExpandCol = hasExpandable && expandable?.showExpandColumn !== false;
  // Only render the filter row if at least one column declares filterSearch or filters.
  const hasFilters = leafColumns.some((c) => c.filterSearch || c.filters);
  // Header/body separator: `bordered` implies the full cell-border treatment
  // (see the <td> borderBottom below, gated on `bordered` alone), which always
  // includes this line. `headerBordered` controls the line independently so an
  // unconfigured <Table> still separates header from body; passing
  // `headerBordered={false}` is the only way to reach a fully borderless table.
  const showHeaderHairline = bordered || headerBordered;

  /**
   * Returns inline styles for fixed (pinned) columns. Sticky positioning with
   * an opaque background prevents scrolling content from bleeding through.
   * z-index 10 keeps them above normal cells but below sticky headers (z-20)
   * and loading overlays (z-30).
   */
  const getFixedStyle = (position: 'left' | 'right' | boolean | undefined): React.CSSProperties => {
    if (!position) return {};
    const base: React.CSSProperties = {
      position: 'sticky',
      zIndex: 10,
    };
    if (position === 'left' || position === true) return { ...base, left: 0 };
    if (position === 'right') return { ...base, right: 0 };
    return base;
  };

  const getColumnWidth = (col: ColumnType<T>): number | string | undefined => {
    const field = columnFieldKey(col) || String(col.key);
    if (columnWidths[field]) return columnWidths[field];
    return col.width;
  };

  // ---- Inline editable cell component ----
  // Defined as a nested component (not extracted to module scope) so it can
  // close over handleCellSave/handleCellKeyNav without prop drilling. Each
  // render of the table creates a new component identity, but React reconciles
  // by key so this does not cause unmount/remount issues in practice.
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

    // Auto-focus the input on mount so the user can immediately start typing
    // without an extra click. This mirrors spreadsheet inline-edit UX.
    useEffect(() => {
      inputRef.current?.focus();
    }, []);

    const save = useCallback(
      (val?: unknown) => {
        handleCellSave(record, index, column, val !== undefined ? val : cellValue);
      },
      [record, index, column, cellValue]
    );

    // Enter/Tab commits the value and advances focus to the next editable cell
    // (via handleCellKeyNav). Escape discards changes. This keyboard model
    // follows spreadsheet conventions so power users can tab through rows.
    const onKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === 'Tab' || e.key === 'Escape') {
        if (e.key !== 'Escape') {
          save();
        }
        handleCellKeyNav(e, record, index, column, colIndex);
      }
    };

    // If the column provides a custom editRender, defer to it entirely.
    // This lets consumers render rich editors (color pickers, date pickers, etc.)
    // while still getting keyboard navigation from the wrapping onKeyDown.
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
          style={inlineCheckboxStyle}
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
          style={inlineSelectStyle}
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
          style={inlineInputStyle}
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
        style={inlineInputStyle}
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

  // ---- Render header cells for a single row (nested column groups) ----
  // Column groups produce multiple header rows: parent groups span multiple
  // columns via colSpan, while leaf columns span multiple rows via rowSpan.
  // This renders one <tr>'s worth of <th> cells.
  const renderHeaderRow = (cells: HeaderCell<T>[], rowIndex: number) => {
    return cells.map((cell, cellIndex) => {
      const { column, colSpan, rowSpan } = cell;
      const field = columnFieldKey(column);
      const isSortable = !!column.sorter;
      const isCurrentSort = sortState.field === field;
      const width = getColumnWidth(column);

      // WAI-ARIA requires aria-sort to distinguish ascending, descending, and
      // unsorted states on sortable column headers for screen readers.
      let ariaSortValue: 'ascending' | 'descending' | 'none' | undefined;
      if (isSortable) {
        if (isCurrentSort && sortState.order === 'ascend') ariaSortValue = 'ascending';
        else if (isCurrentSort && sortState.order === 'descend') ariaSortValue = 'descending';
        else ariaSortValue = 'none';
      }

      return (
        <th
          key={column.key || field || `${rowIndex}-${cellIndex}`}
          colSpan={colSpan > 1 ? colSpan : undefined}
          rowSpan={rowSpan > 1 ? rowSpan : undefined}
          className={column.className || undefined}
          data-part="header-cell"
          data-sortable={isSortable ? 'true' : undefined}
          data-sticky={stickyConfig.enabled ? 'true' : undefined}
          data-hairline={showHeaderHairline ? 'true' : undefined}
          data-fixed={column.fixed === true ? 'true' : (column.fixed || undefined)}
          style={{
            padding: sizeTokens.cell,
            width,
            minWidth: column.minWidth,
            textAlign: column.align,
            position: stickyConfig.enabled || column.fixed ? 'sticky' : undefined,
            ...(stickyConfig.enabled ? { top: stickyConfig.offsetHeader + rowIndex * 40, zIndex: 20 } : {}),
            ...getFixedStyle(column.fixed),
            ...(isSortable ? { cursor: 'pointer', userSelect: 'none' as const, transition: 'color var(--ds-motion-fast)' } : {}),
            ...column.style,
          }}
          onClick={() => isSortable && handleSort(column)}
          aria-sort={ariaSortValue}
          role="columnheader"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, position: 'relative' }}>
            <span style={{ flex: 1 }}>{column.title}</span>
            {isSortable && (
              <span
                data-part="sort-indicator"
                data-order={isCurrentSort ? sortState.order : 'none'}
                style={{ fontSize: 12, opacity: 0.6, display: 'inline-block', transition: 'transform var(--ds-motion-normal)' }}
              >
                {isCurrentSort
                  ? '\u25B2'
                  : '\u21C5'}
              </span>
            )}
            {/* Resize handle -- only on leaf columns (colSpan <= 1) because
                dragging a group header's edge is ambiguous about which child
                column should resize. */}
            {colSpan <= 1 && (
              <span
                data-part="resize-handle"
                data-resizing={resizingColumn === field ? 'true' : undefined}
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 0,
                  bottom: 0,
                  width: 4,
                  cursor: 'col-resize',
                }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  if (field) handleResizeStart(field, e.clientX);
                }}
                role="separator"
                aria-label={t('table.resize_column', { column: String(column.title || '') })}
              />
            )}
          </div>
        </th>
      );
    });
  };

  // ---- Render filter row under headers ----
  // An additional <tr> in <thead> holds per-column text filter inputs. Only
  // rendered when at least one column declares filterSearch or filters.
  const renderFilterRow = () => {
    if (!hasFilters) return null;
    return (
      <tr data-part="filter-row" style={{ transition: 'background-color var(--ds-motion-normal)' }}>
        {rowSelection && <th style={{ width: 48 }} />}
        {showExpandCol && <th style={{ width: 48 }} />}
        {leafColumns.map((col, i) => {
          const field = columnFieldKey(col);
          if (!col.filterSearch && !col.filters) {
            return <th key={col.key || field || i} />;
          }
          return (
            <th key={col.key || field || i} style={{ padding: 4 }}>
              <input
                type="text"
                data-part="field"
                data-field="filter"
                style={{ ...inlineInputStyle, transition: 'border-color var(--ds-motion-normal)' }}
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

  // ---- Body content ----
  const renderBodyRows = () => {
    if (displayData.length === 0) {
      return (
        <tr>
          <td
            colSpan={totalColSpan}
            data-part="empty-cell"
            style={{ textAlign: 'center', padding: '32px 0' }}
          >
            {locale?.emptyText || t('table.empty')}
          </td>
        </tr>
      );
    }

    // When virtual scrolling, displayData is a slice of the full paginated set.
    // indexOffset maps local display indices back to their position in the
    // original dataset so row keys, selection, and callbacks use correct indices.
    const indexOffset = virtualEnabled ? virtualSlice.start : 0;

    return displayData.map((record, displayIdx) => {
      const actualIndex = indexOffset + displayIdx;
      const key = getRowKey(record, actualIndex);
      const isSelected = selectedRowKeys.includes(key);
      const isExpanded = expandedRowKeys.has(key);
      const canExpand = isRowExpandable(record);
      const rowClass = typeof rowClassName === 'function' ? rowClassName(record, actualIndex) : rowClassName;

      return (
        <Fragment key={key}>
          <tr
            className={rowClass || undefined}
            data-part="row"
            data-selected={isSelected ? 'true' : undefined}
            data-hoverable={rowHoverable ? 'true' : undefined}
            style={{
              transition: rowHoverable ? 'background-color var(--ds-motion-normal)' : undefined,
            }}
            aria-expanded={hasExpandable ? isExpanded : undefined}
            {...(onRow?.(record, actualIndex) || {})}
          >
            {/* Expand column */}
            {showExpandCol && (
              <td style={{ width: 48, textAlign: 'center', padding: sizeTokens.cell }}>
                {canExpand ? (
                  expandable?.expandIcon ? (
                    expandable.expandIcon({
                      expanded: isExpanded,
                      onExpand: () => handleToggleExpand(record, actualIndex),
                      record,
                    })
                  ) : (
                    <button
                      data-part="expand-button"
                      style={{ height: 24, padding: '0 8px', fontSize: 12, cursor: 'pointer', transition: 'all var(--ds-motion-normal)' }}
                      onClick={() => handleToggleExpand(record, actualIndex)}
                      aria-label={isExpanded ? t('table.collapse_row') : t('table.expand_row')}
                    >
                      <span data-part="expand-indicator" data-expanded={isExpanded ? 'true' : undefined} style={{ display: 'inline-block', transition: 'transform var(--ds-motion-normal)' }}>{'\u25B6'}</span>
                    </button>
                  )
                ) : null}
              </td>
            )}

            {/* Selection column */}
            {rowSelection && (
              <td style={{ width: 48, padding: sizeTokens.cell }}>
                <input
                  type={rowSelection.type === 'radio' ? 'radio' : 'checkbox'}
                  style={inlineCheckboxStyle}
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

              return (
                <td
                  key={column.key || field || colIndex}
                  className={column.className || undefined}
                  data-part="cell"
                  data-editable={cellEditable && !cellIsEditing ? 'true' : undefined}
                  data-bordered={bordered ? 'true' : undefined}
                  data-fixed={column.fixed === true ? 'true' : (column.fixed || undefined)}
                  style={{
                    padding: sizeTokens.cell,
                    textAlign: column.align,
                    width,
                    ...(column.ellipsis ? { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const, maxWidth: 320 } : {}),
                    ...getFixedStyle(column.fixed),
                    ...(cellEditable && !cellIsEditing ? { cursor: 'pointer', transition: 'all var(--ds-motion-fast)' } : {}),
                    ...column.style,
                  }}
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
              <td colSpan={totalColSpan} style={{ padding: 16, animation: 'ds-table-expand-modern var(--ds-motion-slow) ease-out' }}>
                {expandable.expandedRowRender(record, actualIndex, expandable.indentSize || 0, true)}
              </td>
            </tr>
          )}
        </Fragment>
      );
    });
  };

  // ---- Virtual scroll wrapper ----
  // scroll.y constrains the table body height and enables vertical overflow.
  // scroll.x sets the table's minimum width for horizontal scrolling.
  const scrollYValue = typeof scroll?.y === 'number' ? scroll.y : typeof scroll?.y === 'string' ? scroll.y : undefined;
  const scrollXValue = scroll?.x;

  const tableContent = (
    <table
      role="grid"
      data-part="table"
      data-bordered={bordered ? 'true' : undefined}
      data-size={sizeKey}
      style={{
        width: scrollXValue ? (typeof scrollXValue === 'number' ? scrollXValue : scrollXValue === true ? '100%' : scrollXValue) : '100%',
        borderCollapse: 'collapse',
        fontSize: sizeTokens.fontSize,
        tableLayout: props.tableLayout === 'fixed' ? 'fixed' : undefined,
      }}
    >
      {/* Column group for widths */}
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
                  data-part="header-cell"
                  rowSpan={headerRows.length > 1 ? headerRows.length : undefined}
                  style={{ width: 48, padding: sizeTokens.cell, ...(stickyConfig.enabled ? { position: 'sticky' as const, top: stickyConfig.offsetHeader, zIndex: 20 } : {}) }}
                >
                  {expandable?.columnTitle || ''}
                </th>
              )}
              {rowIndex === 0 && rowSelection && (
                <th
                  data-part="header-cell"
                  rowSpan={headerRows.length > 1 ? headerRows.length : undefined}
                  style={{ width: 48, padding: sizeTokens.cell, ...(stickyConfig.enabled ? { position: 'sticky' as const, top: stickyConfig.offsetHeader, zIndex: 20 } : {}) }}
                >
                  {rowSelection.type !== 'radio' && !rowSelection.hideSelectAll && (
                    <input
                      type="checkbox"
                      style={inlineCheckboxStyle}
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

      {/* Body -- when virtual scrolling is on, invisible spacer rows above and
          below the visible window maintain the scroll container's total height
          so the scrollbar thumb size and position stay correct. 48px is the
          estimated average row height used for offset calculations. */}
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
        <tfoot>
          {summary(processedData)}
        </tfoot>
      )}
    </table>
  );

  return (
    <div className={['ds-table', 'ds-table--modern', className].filter(Boolean).join(' ')} style={{ position: 'relative', ...style }} id={id}>
      {/* Title */}
      {title && (
        <div style={{ marginBottom: 8, fontWeight: 600 }}>
          {title(processedData)}
        </div>
      )}

      {/* Loading overlay */}
      {loading && (
        <div data-part="loading-overlay" style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 30 }}>
          <span
            data-part="spinner"
            style={{
              display: 'inline-block',
              width: 24,
              height: 24,
              animation: 'ds-table-spin-modern var(--ds-motion-glacial) linear infinite',
            }}
            role="status"
            aria-label="Loading"
          />
        </div>
      )}

      {/* Table container */}
      <div
        ref={virtualEnabled ? scrollContainerRef : undefined}
        style={{
          overflowX: 'auto',
          maxHeight: scrollYValue,
          overflowY: scrollYValue ? 'auto' : undefined,
          ...(loading ? { opacity: 0.5 } : {}),
          ...(resizingColumn ? { userSelect: 'none' as const } : {}),
        }}
      >
        {tableContent}
      </div>

      {/* Footer */}
      {footer && (
        <div data-part="footer" style={{ marginTop: 8, fontSize: 14 }}>
          {footer(processedData)}
        </div>
      )}

      {/* Pagination -- `pagination !== false` keeps the controls visible even
          when the consumer passes an empty object (default). Explicitly passing
          `false` hides them for cases like infinite scroll or server-side paging. */}
      {pagination !== false && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8, marginTop: 16 }}>
          <span data-part="pagination-range" style={{ fontSize: 14 }}>{paginationRange}</span>
          <div style={{ display: 'inline-flex' }}>
            <button
              data-part="pagination-button"
              style={{ height: 32, padding: '0 12px', fontSize: 13, cursor: 'pointer', transition: 'all var(--ds-motion-normal)' }}
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              aria-label={t('table.previous_page')}
            >
              &#171;
            </button>
            <button data-part="pagination-button" style={{ height: 32, padding: '0 12px', fontSize: 13, pointerEvents: 'none', fontWeight: 600 }} aria-current="page">
              {t('table.page', { current: currentPage })}
            </button>
            <button
              data-part="pagination-button"
              style={{ height: 32, padding: '0 12px', fontSize: 13, cursor: 'pointer', transition: 'all var(--ds-motion-normal)' }}
              disabled={currentPage * pageSize >= totalItems}
              onClick={() => setCurrentPage(currentPage + 1)}
              aria-label={t('table.next_page')}
            >
              &#187;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

Table.displayName = 'Table.Modern';

export default Table;
