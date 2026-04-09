import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useDataTable } from './useDataTable';
import { useFormBuilder } from './useFormBuilder';
import { useKanban } from './useKanban';

describe('composition hooks', () => {
  describe('useDataTable', () => {
    const rows = [
      { id: '1', name: 'Gamma', score: 30 },
      { id: '2', name: 'Alpha', score: 90 },
      { id: '3', name: 'Beta', score: 60 },
    ];

    const columns = [
      { key: 'name', label: 'Name', accessorKey: 'name' as const },
      { key: 'score', label: 'Score', accessorKey: 'score' as const },
    ];

    it('sorts, paginates, and resolves selections on the client', () => {
      const { result } = renderHook(() =>
        useDataTable({
          data: rows,
          columns,
          initialSort: { key: 'name', direction: 'asc' },
          pageSize: 2,
          rowKey: (row) => row.id,
        })
      );

      // The hook should sort immediately from the initial configuration.
      expect(result.current.processedData.map((row) => row.name)).toEqual(['Alpha', 'Beta']);
      expect(result.current.totalCount).toBe(3);
      expect(result.current.tableProps.pagination).not.toBe(false);

      // Changing sort should also reset pagination back to page 1.
      act(() => {
        result.current.tableProps.onSortChange?.({ key: 'score', direction: 'desc' });
      });

      expect(result.current.page).toBe(1);
      expect(result.current.processedData.map((row) => row.score)).toEqual([90, 60]);

      // Page changes should propagate through the public pagination contract.
      act(() => {
        if (result.current.tableProps.pagination && result.current.tableProps.pagination !== false) {
          result.current.tableProps.pagination.onChange?.(2, 2);
        }
      });

      expect(result.current.page).toBe(2);
      expect(result.current.processedData.map((row) => row.id)).toEqual(['1']);

      // Selection should resolve back to rows so surfaces do not need to remap ids.
      act(() => {
        result.current.tableProps.onSelectionChange?.(['1', '3'], [rows[0], rows[2]]);
      });

      expect(result.current.selectedKeys).toEqual(['1', '3']);
      expect(result.current.selectedRows.map((row) => row.name)).toEqual(['Gamma', 'Beta']);

      act(() => {
        result.current.clearSelection();
      });

      expect(result.current.selectedKeys).toEqual([]);
      expect(result.current.selectedRows).toEqual([]);
    });

    it('can opt out of client-side sort and pagination when the app owns data orchestration', () => {
      const { result } = renderHook(() =>
        useDataTable({
          data: rows,
          columns,
          clientSideSorting: false,
          clientSidePagination: false,
        })
      );

      expect(result.current.processedData).toEqual(rows);
      expect(result.current.tableProps.pagination).toBe(false);

      // The public setter should still work even when sorting is delegated upstream.
      act(() => {
        result.current.setSorting({ key: 'score', direction: 'asc' });
      });

      expect(result.current.sorting).toEqual({ key: 'score', direction: 'asc' });
      expect(result.current.processedData).toEqual(rows);
    });

    it('covers invalid columns, null sorting branches, rowKey variations, and page-size reset logic', () => {
      const nullableRows = [
        { id: '1', name: 'Gamma', score: null },
        { id: '2', name: 'Alpha', score: 90 },
        { id: '3', name: 'Beta', score: undefined },
      ];

      const { result } = renderHook(() =>
        useDataTable({
          data: nullableRows,
          columns,
          initialSort: { key: 'missing-column', direction: 'asc' },
          initialPage: 2,
          pageSize: 1,
          rowKey: 'id',
        })
      );

      // Unknown sort keys should leave the data untouched.
      expect(result.current.processedData.map((row) => row.id)).toEqual(['2']);

      act(() => {
        result.current.setSorting({ key: 'score', direction: 'asc' });
      });

      expect(result.current.processedData.map((row) => row.id)).toEqual(['1']);

      act(() => {
        if (result.current.tableProps.pagination && result.current.tableProps.pagination !== false) {
          result.current.tableProps.pagination.onChange?.(3, 1);
        }
      });

      // Keeping the same page size should preserve the requested page.
      expect(result.current.page).toBe(3);

      act(() => {
        if (result.current.tableProps.pagination && result.current.tableProps.pagination !== false) {
          result.current.tableProps.pagination.onChange?.(2, 2);
        }
      });

      // Changing page size should reset pagination back to page 1.
      expect(result.current.page).toBe(1);
      expect(result.current.pageSize).toBe(2);

      act(() => {
        result.current.tableProps.onSelectionChange?.(['2'], [nullableRows[1]]);
      });

      expect(result.current.selectedRows.map((row) => row.id)).toEqual(['2']);

      act(() => {
        result.current.setSelectedKeys(['1', '3']);
      });

      expect(result.current.selectedRows.map((row) => row.id)).toEqual(['1', '3']);
    });

    it('covers default index row keys, descending sort, and empty-selection fallbacks', () => {
      const nullableRows = [
        { name: 'Gamma', score: null },
        { name: 'Alpha', score: 90 },
        { name: 'Beta', score: undefined },
      ];

      const { result } = renderHook(() =>
        useDataTable({
          data: nullableRows,
          columns,
          initialSort: { key: 'score', direction: 'desc' },
        })
      );

      expect(result.current.processedData.map((row) => row.name)).toEqual(['Alpha', 'Gamma', 'Beta']);
      expect(result.current.selectedRows).toEqual([]);

      act(() => {
        result.current.setSelectedKeys(['0', '2']);
      });

      expect(result.current.selectedRows.map((row) => row.name)).toEqual(['Gamma', 'Beta']);
    });
  });

  describe('useFormBuilder', () => {
    const fields = [
      { name: 'email', label: 'Email', required: true },
      { name: 'attendees', label: 'Attendees', validation: { min: 1 } },
      {
        name: 'secret',
        label: 'Secret',
        required: true,
        hidden: (values: Record<string, unknown>) => values.showSecret !== true,
      },
      { name: 'showSecret', label: 'Show secret', defaultValue: false },
    ];

    it('tracks dirty state, validates hidden fields correctly, and submits resolved values', async () => {
      const onSubmit = vi.fn().mockResolvedValue(undefined);

      const { result } = renderHook(() =>
        useFormBuilder({
          fields,
          initialValues: { email: '', attendees: 0 },
          onSubmit,
        })
      );

      expect(result.current.isDirty).toBe(false);
      expect(result.current.values.showSecret).toBe(false);

      act(() => {
        result.current.touch('email');
      });

      act(() => {
        result.current.validate();
      });

      expect(result.current.errors.email).toContain('Email is required');
      expect(result.current.errors.attendees).toContain('Minimum value is 1');
      expect(result.current.errors.secret).toBeUndefined();
      expect(result.current.isValid).toBe(false);

      // Updating a field should clear its own error and mark the form dirty.
      act(() => {
        result.current.setValue('email', 'owner@rottay.com');
      });

      expect(result.current.errors.email).toBeUndefined();
      expect(result.current.isDirty).toBe(true);

      // Revealing the hidden field should make it participate in validation.
      act(() => {
        result.current.setValues({ attendees: 25, showSecret: true });
      });

      act(() => {
        result.current.validate();
      });

      expect(result.current.errors.secret).toContain('Secret is required');

      act(() => {
        const secretProps = result.current.getFieldProps('secret');
        secretProps.onChange('launch-ready');
        secretProps.onBlur();
      });

      expect(result.current.touched.secret).toBe(true);
      expect(result.current.getFieldProps('secret').error).toBeUndefined();

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(onSubmit).toHaveBeenCalledWith({
        email: 'owner@rottay.com',
        attendees: 25,
        secret: 'launch-ready',
        showSecret: true,
      });
      expect(result.current.isSubmitting).toBe(false);

      act(() => {
        result.current.reset({ email: 'reset@rottay.com', attendees: 10, showSecret: false });
      });

      expect(result.current.values.email).toBe('reset@rottay.com');
      expect(result.current.errors).toEqual({});
      expect(result.current.touched).toEqual({});
      expect(result.current.isDirty).toBe(false);
    });
  });

  describe('useKanban', () => {
    type Task = { id: string; title: string; priority?: 'low' | 'high' };

    const initialColumns = [
      { id: 'todo', title: 'Todo', items: [{ id: 'a', title: 'Brief' }, { id: 'b', title: 'Venue' }] },
      { id: 'done', title: 'Done', items: [{ id: 'c', title: 'Publish' }] },
    ];

    it('moves, updates, removes, and locates items across columns', () => {
      const onItemMoved = vi.fn();

      const { result } = renderHook(() =>
        useKanban<Task>({
          initialColumns,
          itemKey: (item) => item.id,
          onItemMoved,
        })
      );

      act(() => {
        result.current.moveItem('b', 'todo', 'done', 0);
      });

      expect(result.current.getColumnItems('todo').map((item) => item.id)).toEqual(['a']);
      expect(result.current.getColumnItems('done').map((item) => item.id)).toEqual(['b', 'c']);
      expect(onItemMoved).toHaveBeenCalledWith('b', 'todo', 'done', 0);

      act(() => {
        result.current.addItem('todo', { id: 'd', title: 'Run QA', priority: 'high' });
      });

      expect(result.current.getItem('d')).toEqual({ id: 'd', title: 'Run QA', priority: 'high' });

      act(() => {
        result.current.updateItem('todo', 'd', (item) => ({ ...item, title: 'Run premium QA' }));
      });

      expect(result.current.getItem('d')?.title).toBe('Run premium QA');

      act(() => {
        result.current.removeItem('done', 'c');
      });

      expect(result.current.getItem('c')).toBeUndefined();

      // Invalid moves should be ignored instead of corrupting board state.
      const snapshot = result.current.columns;
      act(() => {
        result.current.moveItem('missing', 'todo', 'done', 1);
      });

      expect(result.current.columns).toEqual(snapshot);
    });
  });
});
