import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { TableProps } from './Table.types';
import {
  buildHeaderRows,
  columnFieldKey,
  flattenColumns,
  getHeaderDepth,
  getNestedValue,
  normalizeTableKey,
  useTableFeatures,
} from './hooks/useTableFeatures';

interface TableRow {
  id: string;
  meta: { name: string };
  status: string;
  score: number;
  hidden?: string;
}

const BASE_COLUMNS = [
  {
    key: 'group',
    title: 'Group',
    children: [
      {
        key: 'name',
        title: 'Name',
        dataIndex: ['meta', 'name'],
        sorter: true,
        minWidth: 90,
      },
      {
        key: 'status',
        title: 'Status',
        dataIndex: 'status',
        sorter: (a: TableRow, b: TableRow) => a.status.localeCompare(b.status),
        width: 120,
      },
      {
        key: 'hidden-child',
        title: 'Hidden child',
        dataIndex: 'hidden',
        hidden: true,
      },
    ],
  },
  {
    key: 'score',
    title: 'Score',
    dataIndex: 'score',
    width: 100,
    minWidth: 80,
  },
] as const;

const BASE_ROWS: TableRow[] = [
  { id: '1', meta: { name: 'Zoe' }, status: 'Draft', score: 90, hidden: 'x' },
  { id: '2', meta: { name: 'Ada' }, status: 'Live', score: 70, hidden: 'y' },
  { id: '3', meta: { name: 'Moe' }, status: 'Paused', score: 88, hidden: 'z' },
  { id: '4', meta: { name: 'Bea' }, status: 'Live', score: 95, hidden: 'w' },
];

function createTableProps(overrides: Partial<TableProps<TableRow>> = {}): TableProps<TableRow> {
  return {
    columns: BASE_COLUMNS as unknown as TableProps<TableRow>['columns'],
    dataSource: BASE_ROWS,
    rowKey: (record) => record.id,
    pagination: { pageSize: 2, current: 1, onChange: vi.fn() },
    rowSelection: { onChange: vi.fn(), defaultSelectedRowKeys: ['1'] },
    expandable: {
      expandedRowRender: (record) => <div>{record.meta.name} details</div>,
      defaultExpandedRowKeys: ['2'],
      rowExpandable: (record) => record.status !== 'Draft',
      onExpand: vi.fn(),
      onExpandedRowsChange: vi.fn(),
    },
    summary: (rows) => <tr><td>{rows.length}</td></tr>,
    ...overrides,
  };
}

describe('useTableFeatures', () => {
  it('covers helper utilities for nested columns and keys', () => {
    const columns = BASE_COLUMNS as unknown as TableProps<TableRow>['columns'];
    const leafColumns = flattenColumns(columns);
    const headerDepth = getHeaderDepth(columns);
    const headerRows = buildHeaderRows(columns, headerDepth);

    expect(normalizeTableKey('key-1', 0)).toBe('key-1');
    expect(normalizeTableKey(5, 1)).toBe(5);
    expect(normalizeTableKey({ complex: true }, 3)).toBe('[object Object]');
    expect(normalizeTableKey(null, 7)).toBe('7');

    expect(leafColumns).toHaveLength(4);
    expect(leafColumns.map((column) => column.key)).toEqual(['name', 'status', 'hidden-child', 'score']);
    expect(headerDepth).toBe(2);
    expect(headerRows).toHaveLength(2);
    expect(headerRows[0]).toHaveLength(2);
    expect(headerRows[1]).toHaveLength(2);
    expect(headerRows[0]?.[0]).toMatchObject({ colSpan: 2, rowSpan: 1 });
    expect(headerRows[1]?.[0]).toMatchObject({ colSpan: 1, rowSpan: 1 });
    expect(columnFieldKey(leafColumns[0]!)).toBe('meta.name');
    expect(columnFieldKey(leafColumns[3]!)).toBe('score');
    expect(getNestedValue(BASE_ROWS[0]!, ['meta', 'name'])).toBe('Zoe');
    expect(getNestedValue(BASE_ROWS[0]!, 'status')).toBe('Draft');
    expect(getNestedValue(BASE_ROWS[0]!, undefined)).toBeUndefined();
  });

  it('covers sorting, filtering, pagination clamping, sticky config, and summary detection', async () => {
    const paginationOnChange = vi.fn();
    const onChange = vi.fn();
    const props = createTableProps({
      pagination: { pageSize: 2, current: 3, onChange: paginationOnChange },
      sticky: { offsetHeader: 24 },
      onChange,
    });

    const { result } = renderHook(() => useTableFeatures({ props }));

    expect(result.current.currentPage).toBe(1);
    expect(result.current.pageSize).toBe(2);
    expect(result.current.hasSummary).toBe(true);
    expect(result.current.stickyConfig).toEqual({ enabled: true, offsetHeader: 24 });
    expect(result.current.totalColSpan).toBe(6);

    act(() => {
      result.current.handleSort(result.current.leafColumns[0]!);
    });
    expect(result.current.sortState).toEqual({ field: 'meta.name', order: 'ascend' });

    act(() => {
      result.current.handleSort(result.current.leafColumns[0]!);
    });
    expect(result.current.sortState).toEqual({ field: 'meta.name', order: 'descend' });

    act(() => {
      result.current.handleSort(result.current.leafColumns[0]!);
    });
    expect(result.current.sortState).toEqual({});

    act(() => {
      result.current.handleSort(result.current.leafColumns[1]!);
    });
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ pageSize: 2, current: 3 }),
      {},
      expect.objectContaining({ field: 'status', order: 'ascend', columnKey: 'status' }),
      expect.objectContaining({ action: 'sort' })
    );

    act(() => {
      result.current.handleColumnFilter('meta.name', 'be');
    });
    await waitFor(() => {
      expect(result.current.processedData).toHaveLength(1);
    });
    await waitFor(() => {
      expect(result.current.currentPage).toBe(1);
    });
    expect(result.current.paginationRange).toBe('1-1 of 1');

    act(() => {
      result.current.handleColumnFilter('meta.name', '');
    });
    await waitFor(() => {
      expect(result.current.processedData).toHaveLength(4);
    });

    act(() => {
      result.current.setCurrentPage(999);
    });
    expect(result.current.currentPage).toBe(2);
    expect(paginationOnChange).toHaveBeenCalledWith(2, 2);
  });

  it('covers selection, expandable branches, virtual scrolling, and resize lifecycle', async () => {
    const rowSelectionOnChange = vi.fn();
    const onExpand = vi.fn();
    const onExpandedRowsChange = vi.fn();
    const props = createTableProps({
      rowSelection: {
        defaultSelectedRowKeys: ['1'],
        onChange: rowSelectionOnChange,
      },
      expandable: {
        expandedRowRender: (record) => <div>{record.meta.name} details</div>,
        defaultExpandAllRows: true,
        rowExpandable: (record) => record.status === 'Live',
        onExpand,
        onExpandedRowsChange,
      },
      virtual: false,
      scroll: undefined,
      sticky: false,
    });

    const { result, rerender } = renderHook(
      ({ nextProps }: { nextProps: TableProps<TableRow> }) => useTableFeatures({ props: nextProps }),
      { initialProps: { nextProps: props } }
    );

    expect(result.current.selectedRowKeys).toEqual(['1']);
    expect(Array.from(result.current.expandedRowKeys)).toEqual(['1', '2', '3', '4']);
    expect(result.current.isRowExpandable(BASE_ROWS[0]!)).toBe(false);
    expect(result.current.isRowExpandable(BASE_ROWS[1]!)).toBe(true);

    act(() => {
      result.current.handleSelectAll(true);
    });
    expect(result.current.isAllSelected).toBe(true);
    expect(rowSelectionOnChange).toHaveBeenCalledWith(
      ['1', '2'],
      BASE_ROWS.slice(0, 2),
      { type: 'all' }
    );

    act(() => {
      result.current.handleSelectRow(BASE_ROWS[0]!, 0, false);
    });
    expect(result.current.selectedRowKeys).toEqual(['2']);
    expect(rowSelectionOnChange).toHaveBeenLastCalledWith(
      ['2'],
      [BASE_ROWS[1]],
      { type: 'single' }
    );

    act(() => {
      result.current.handleToggleExpand(BASE_ROWS[1]!, 1);
    });
    expect(onExpand).toHaveBeenCalledWith(false, BASE_ROWS[1]);
    expect(onExpandedRowsChange).toHaveBeenCalled();

    rerender({
      nextProps: createTableProps({
        expandable: {
          expandedRowRender: (record) => <div>{record.meta.name} controlled</div>,
          expandedRowKeys: ['3'],
        },
        rowSelection: {
          onChange: rowSelectionOnChange,
          selectedRowKeys: ['3'],
        },
      }),
    });

    await waitFor(() => {
      expect(Array.from(result.current.expandedRowKeys)).toEqual(['3']);
    });

    const scrollContainer = document.createElement('div');
    Object.defineProperty(scrollContainer, 'scrollTop', { value: 220, writable: true });
    (result.current.scrollContainerRef as React.MutableRefObject<HTMLDivElement | null>).current = scrollContainer;

    rerender({
      nextProps: createTableProps({
        virtual: true,
        scroll: { y: 96 },
        expandable: {
          expandedRowRender: (record) => <div>{record.meta.name} virtual</div>,
        },
      }),
    });

    act(() => {
      scrollContainer.dispatchEvent(new Event('scroll'));
    });

    await waitFor(() => {
      expect(result.current.virtualEnabled).toBe(true);
    });
    expect(result.current.displayData.length).toBeLessThanOrEqual(result.current.processedData.length);

    act(() => {
      result.current.handleResizeStart('score', 100);
    });
    expect(result.current.resizingColumn).toBe('score');

    act(() => {
      document.dispatchEvent(new MouseEvent('mousemove', { clientX: 170 }));
    });
    await waitFor(() => {
      expect(result.current.columnWidths.score).toBe(170);
    });

    act(() => {
      document.dispatchEvent(new MouseEvent('mouseup'));
    });
    await waitFor(() => {
      expect(result.current.resizingColumn).toBeNull();
    });
  });
});
