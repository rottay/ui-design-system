'use client';

/**
 * @fileoverview Table Modern Engine - Rottay Design System
 * @description DaisyUI/Tailwind-based table with full feature parity with Classic.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * This engine uses DaisyUI's table classes with Tailwind utilities
 * for lightweight, responsive table rendering.
 *
 * **Supported Features:**
 * - Column sorting (single column, toggle ascend/descend/none)
 * - Column filtering (text input per column)
 * - Client-side pagination with page size control
 * - Row selection (checkbox/radio)
 * - Expandable rows with custom render
 * - Virtual scrolling for large datasets
 * - Fixed/sticky columns and headers
 * - Column resize via drag handles
 * - Nested column groups (multi-row headers)
 * - Summary rows (tfoot)
 * - Title and footer render functions
 *
 * **ARIA Compliance:**
 * - role="grid" on table element
 * - aria-sort on sortable header cells
 * - aria-expanded on expandable rows
 * - aria-label on interactive controls
 *
 * @see {@link Table} for the main component
 * @see {@link https://daisyui.com/components/table/} DaisyUI Table
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

const sizeClasses: Record<string, string> = {
  small: 'table-xs',
  default: 'table-md',
  large: 'table-lg',
};

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
  const sizeClass = sizeClasses[size === 'large' ? 'large' : size === 'small' ? 'small' : 'default'];
  const hasExpandable = !!expandable?.expandedRowRender;
  const showExpandCol = hasExpandable && expandable?.showExpandColumn !== false;
  const hasFilters = leafColumns.some((c) => c.filterSearch || c.filters);

  // Fixed column helpers
  const getFixedClass = (col: ColumnType<T>, position: 'left' | 'right' | boolean | undefined): string => {
    if (!position) return '';
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
  const renderHeaderRow = (cells: HeaderCell<T>[], rowIndex: number) => {
    return cells.map((cell, cellIndex) => {
      const { column, colSpan, rowSpan } = cell;
      const field = columnFieldKey(column);
      const isSortable = !!column.sorter;
      const isCurrentSort = sortState.field === field;
      const fixedClass = getFixedClass(column, column.fixed);
      const width = getColumnWidth(column);

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
            {/* Resize handle */}
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

    // Offset for virtual row indices in the full paginatedData
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

      {/* Body */}
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
      {/* Inline keyframes for expand animation */}
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

      {/* Pagination */}
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
