import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useFilterPanel } from '../useFilterPanel';

describe('useFilterPanel', () => {
  it('builds defaults from initial values and filter defaults, then tracks active filters correctly', () => {
    const onChange = vi.fn();

    const { result } = renderHook(() =>
      useFilterPanel({
        filters: [
          { key: 'query', label: 'Query', type: 'text', defaultValue: '' },
          { key: 'status', label: 'Status', type: 'select', defaultValue: 'draft' },
          { key: 'tags', label: 'Tags', type: 'multi-select', defaultValue: [] },
          { key: 'published', label: 'Published', type: 'boolean' },
        ],
        initialValues: {
          query: 'launch',
          published: false,
        },
        onChange,
      })
    );

    expect(result.current.values).toEqual({
      query: 'launch',
      status: 'draft',
      tags: [],
      published: false,
    });
    expect(result.current.activeCount).toBe(0);
    expect(result.current.hasActiveFilters).toBe(false);
    expect(result.current.filterProps.activeCount).toBe(0);
  });

  it('supports single updates, bulk updates, reset, and ignores empty values in the active count', () => {
    const onChange = vi.fn();

    const { result } = renderHook(() =>
      useFilterPanel({
        filters: [
          { key: 'query', label: 'Query', type: 'text', defaultValue: '' },
          { key: 'assignee', label: 'Assignee', type: 'select' },
          { key: 'tags', label: 'Tags', type: 'multi-select', defaultValue: [] },
          { key: 'published', label: 'Published', type: 'boolean', defaultValue: false },
        ],
        onChange,
      })
    );

    act(() => {
      result.current.setValue('query', 'evnto');
    });

    expect(result.current.values.query).toBe('evnto');
    expect(result.current.activeCount).toBe(1);
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ query: 'evnto' })
    );

    act(() => {
      result.current.setValues({
        assignee: 'daniel',
        tags: ['pilot'],
        published: true,
      });
    });

    expect(result.current.values).toEqual({
      query: 'evnto',
      assignee: 'daniel',
      tags: ['pilot'],
      published: true,
    });
    expect(result.current.activeCount).toBe(4);
    expect(result.current.filterProps.values).toEqual(result.current.values);

    act(() => {
      result.current.setValues({
        query: '',
        assignee: undefined,
        tags: [],
        published: false,
      });
    });

    expect(result.current.activeCount).toBe(0);
    expect(result.current.hasActiveFilters).toBe(false);

    act(() => {
      result.current.reset();
    });

    expect(result.current.values).toEqual({
      query: '',
      assignee: undefined,
      tags: [],
      published: false,
    });
    expect(onChange).toHaveBeenLastCalledWith(result.current.values);
  });
});
