'use client';

/**
 * @fileoverview Modern Table engine -- DaisyUI/Tailwind implementation.
 *
 * Full-featured data table built on DaisyUI table classes and Tailwind utilities
 * instead of Ant Design. Implements sorting, filtering, pagination, row selection,
 * expandable rows, virtual scrolling, column resize, nested header groups, inline
 * cell editing, and summary rows -- all with WAI-ARIA grid semantics.
 *
 * The heavy lifting (sort/filter/paginate/virtual-scroll state) lives in the
 * shared `useTableFeatures` hook; this file is responsible only for rendering
 * that state into DaisyUI markup and wiring user interactions back to the hook.
 *
 * Engine: **DaisyUI / Tailwind CSS**
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
import type { TableProps, ColumnType, SortOrder, TableCellFieldType } from '../Table.types';
import {
  useTableFeatures,
  columnFieldKey,
  type HeaderCell,
} from '../hooks/useTableFeatures';
import { useTranslation } from '../../../../../i18n';

// DaisyUI uses table-xs/md/lg for size variants. The DS uses small/default/large
// as size tokens, so we map between the two naming conventions here.
const sizeClasses: Record<string, string> = {
  small: 'table-xs',
  default: 'table-md',
  large: 'table-lg',
};

/**
 * Modern Table engine backed by DaisyUI/Tailwind.
 *
 * Renders a full-featured data grid using semantic `<table>` markup styled
 * with DaisyUI classes. All stateful logic (sort, filter, pagination,
 * selection, virtual scroll, column resize) is delegated to `useTableFeatures`.
 *
 * @param props - Unified DS TableProps (see Table.types.ts)
 * @returns A DaisyUI-styled table element with pagination controls
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
  // Normalize size to one of our three DaisyUI tokens. Any unrecognized value
  // falls through to 'default' so the table never renders without a size class.
  const sizeClass = sizeClasses[size === 'large' ? 'large' : size === 'small' ? 'small' : 'default'];
  const hasExpandable = !!expandable?.expandedRowRender;
  // The expand column is rendered unless the consumer explicitly opts out via
  // showExpandColumn: false -- useful when they want expand-on-row-click only.
  const showExpandCol = hasExpandable && expandable?.showExpandColumn !== false;
  // Only render the filter row if at least one column declares filterSearch or filters.
  const hasFilters = leafColumns.some((c) => c.filterSearch || c.filters);

  // Fixed (pinned) columns use sticky positioning with an opaque background
  // to prevent scrolling content from bleeding through. z-10 keeps them above
  // normal cells but below sticky headers (z-20) and loading overlays (z-30).
  const getFixedClass = (col: ColumnType<T>, position: 'left' | 'right' | boolean | undefined): string => {
    if (!position) return '';
    // `fixed: true` is treated as left-fixed for backwards compatibility.
    if (position === 'left' || position === true) return 'sticky left-0 z-10 bg-base-100';
    if (position === 'right') return 'sticky right-0 z-10 bg-base-100';
    return '';
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
          className="checkbox checkbox-sm"
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
          className="select select-bordered select-xs w-full"
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
          className="input input-bordered input-xs w-full"
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
        className="input input-bordered input-xs w-full"
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
      const fixedClass = getFixedClass(column, column.fixed);
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
          className={[
            column.className || '',
            isSortable ? 'cursor-pointer select-none hover:text-primary transition-colors duration-150' : '',
            fixedClass,
            stickyConfig.enabled ? 'sticky z-20 bg-base-200' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          style={{
            width,
            minWidth: column.minWidth,
            textAlign: column.align,
            ...(stickyConfig.enabled ? { top: stickyConfig.offsetHeader + rowIndex * 40 } : {}),
            ...column.style,
            position: stickyConfig.enabled || column.fixed ? 'sticky' : undefined,
          }}
          onClick={() => isSortable && handleSort(column)}
          aria-sort={ariaSortValue}
          role="columnheader"
        >
          <div className="flex items-center gap-1">
            <span className="flex-1">{column.title}</span>
            {isSortable && (
              <span className={`text-xs opacity-60 inline-block transition-transform duration-200 ${isCurrentSort && sortState.order === 'descend' ? 'rotate-180' : ''}`}>
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
                className={[
                  'absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/40',
                  resizingColumn === field ? 'bg-primary/60' : '',
                ].join(' ')}
                style={{ position: 'absolute' }}
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
      <tr className="bg-base-200/30 transition-colors duration-200">
        {rowSelection && <th className="w-12" />}
        {showExpandCol && <th className="w-12" />}
        {leafColumns.map((col, i) => {
          const field = columnFieldKey(col);
          if (!col.filterSearch && !col.filters) {
            return <th key={col.key || field || i} />;
          }
          return (
            <th key={col.key || field || i} className="p-1">
              <input
                type="text"
                className="input input-xs input-bordered w-full focus:input-primary transition-all duration-200"
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
            className="text-center py-8 text-base-content/60"
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
            className={[
              rowClass || '',
              isSelected ? 'bg-primary/10' : '',
              rowHoverable ? 'hover transition-colors duration-200 hover:bg-primary/5' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            aria-expanded={hasExpandable ? isExpanded : undefined}
            {...(onRow?.(record, actualIndex) || {})}
          >
            {/* Expand column */}
            {showExpandCol && (
              <td className="w-12 text-center">
                {canExpand ? (
                  expandable?.expandIcon ? (
                    expandable.expandIcon({
                      expanded: isExpanded,
                      onExpand: () => handleToggleExpand(record, actualIndex),
                      record,
                    })
                  ) : (
                    <button
                      className="btn btn-ghost btn-xs hover:btn-primary transition-all duration-200"
                      onClick={() => handleToggleExpand(record, actualIndex)}
                      aria-label={isExpanded ? t('table.collapse_row') : t('table.expand_row')}
                    >
                      <span className={`inline-block transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}>{'\u25B6'}</span>
                    </button>
                  )
                ) : null}
              </td>
            )}

            {/* Selection column */}
            {rowSelection && (
              <td className="w-12">
                <input
                  type={rowSelection.type === 'radio' ? 'radio' : 'checkbox'}
                  className={
                    rowSelection.type === 'radio' ? 'radio radio-sm' : 'checkbox checkbox-sm'
                  }
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
              const fixedClass = getFixedClass(column, column.fixed);
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
                  className={[
                    column.className || '',
                    column.ellipsis ? 'truncate max-w-xs' : '',
                    fixedClass,
                    cellEditable && !cellIsEditing
                      ? 'cursor-pointer hover:outline hover:outline-1 hover:outline-primary/30 hover:outline-dashed hover:outline-offset-[-1px] hover:bg-primary/5 transition-all duration-150'
                      : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  style={{
                    textAlign: column.align,
                    width,
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
            <tr className="bg-base-200/30">
              <td colSpan={totalColSpan} className="p-4" style={{ animation: 'rottay-table-expand 0.3s ease-out' }}>
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
      className={[
        'table',
        sizeClass,
        bordered ? 'border border-base-300' : '',
        props.tableLayout === 'fixed' ? 'table-fixed' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      role="grid"
      style={{
        width: scrollXValue ? (typeof scrollXValue === 'number' ? scrollXValue : scrollXValue === true ? '100%' : scrollXValue) : undefined,
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
                  rowSpan={headerRows.length > 1 ? headerRows.length : undefined}
                  className="w-12"
                  style={stickyConfig.enabled ? { position: 'sticky', top: stickyConfig.offsetHeader, zIndex: 20 } : undefined}
                >
                  {expandable?.columnTitle || ''}
                </th>
              )}
              {rowIndex === 0 && rowSelection && (
                <th
                  rowSpan={headerRows.length > 1 ? headerRows.length : undefined}
                  className="w-12"
                  style={stickyConfig.enabled ? { position: 'sticky', top: stickyConfig.offsetHeader, zIndex: 20 } : undefined}
                >
                  {rowSelection.type !== 'radio' && !rowSelection.hideSelectAll && (
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm"
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
    <div className={`relative ${className}`} style={style} id={id}>
      {/* Inline keyframes avoid a global CSS file dependency. dangerouslySetInnerHTML
          is safe here because the content is a static string, not user input. */}
      <style dangerouslySetInnerHTML={{ __html: `@keyframes rottay-table-expand{from{opacity:0;max-height:0;transform:translateY(-8px)}to{opacity:1;max-height:500px;transform:translateY(0)}}` }} />
      {/* Title */}
      {title && (
        <div className="mb-2 font-semibold">
          {title(processedData)}
        </div>
      )}

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-base-100/50 flex items-center justify-center z-30">
          <span className="loading loading-spinner loading-md" />
        </div>
      )}

      {/* Table container */}
      <div
        ref={virtualEnabled ? scrollContainerRef : undefined}
        className={[
          'overflow-x-auto',
          loading ? 'opacity-50' : '',
          resizingColumn ? 'select-none' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        style={{
          maxHeight: scrollYValue,
          overflowY: scrollYValue ? 'auto' : undefined,
        }}
      >
        {tableContent}
      </div>

      {/* Footer */}
      {footer && (
        <div className="mt-2 text-sm text-base-content/70">
          {footer(processedData)}
        </div>
      )}

      {/* Pagination -- `pagination !== false` keeps the controls visible even
          when the consumer passes an empty object (default). Explicitly passing
          `false` hides them for cases like infinite scroll or server-side paging. */}
      {pagination !== false && (
        <div className="flex justify-end items-center gap-2 mt-4">
          <span className="text-sm text-base-content/60">{paginationRange}</span>
          <div className="join">
            <button
              className="join-item btn btn-sm btn-ghost hover:btn-primary transition-all duration-200"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              aria-label={t('table.previous_page')}
            >
              &#171;
            </button>
            <button className="join-item btn btn-sm btn-ghost pointer-events-none font-semibold" aria-current="page">
              {t('table.page', { current: currentPage })}
            </button>
            <button
              className="join-item btn btn-sm btn-ghost hover:btn-primary transition-all duration-200"
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
