import React from 'react';
import { describe, expect, it } from 'vitest';
import { act, render, renderHook, screen } from '@testing-library/react';

import { resolveComboboxListState, useComboboxFoundation } from '..';
import type { ComboboxFoundationOptions } from '..';

const OPTIONS: ComboboxFoundationOptions = {
  open: true,
  itemCount: 3,
  listboxId: 'listbox-1',
};

describe('resolveComboboxListState', () => {
  it('reports idle while the panel is closed, whatever else is true', () => {
    expect(resolveComboboxListState({ open: false, itemCount: 0 })).toBe('idle');
    expect(resolveComboboxListState({ open: false, itemCount: 5, loading: true })).toBe('idle');
  });

  it('ranks loading above empty so a pending list never claims it found nothing', () => {
    expect(resolveComboboxListState({ open: true, itemCount: 0, loading: true })).toBe('loading');
    expect(resolveComboboxListState({ open: true, itemCount: 0, loading: false })).toBe('empty');
  });

  it('ranks existing rows above loading so a refresh never blanks the list', () => {
    expect(resolveComboboxListState({ open: true, itemCount: 4, loading: true })).toBe('results');
    expect(resolveComboboxListState({ open: true, itemCount: 4 })).toBe('results');
  });
});

describe('useComboboxFoundation state', () => {
  it('moves through the postures as open, loading and row count change', () => {
    const { result, rerender } = renderHook(
      (props: ComboboxFoundationOptions) => useComboboxFoundation(props),
      { initialProps: { ...OPTIONS, open: false, itemCount: 0 } }
    );

    expect(result.current.listState).toBe('idle');

    rerender({ ...OPTIONS, open: true, itemCount: 0, loading: true });
    expect(result.current.listState).toBe('loading');

    rerender({ ...OPTIONS, open: true, itemCount: 0, loading: false });
    expect(result.current.listState).toBe('empty');

    rerender({ ...OPTIONS, open: true, itemCount: 3 });
    expect(result.current.listState).toBe('results');
  });

  it('lists only selectable indices', () => {
    const { result } = renderHook(() =>
      useComboboxFoundation({
        ...OPTIONS,
        itemCount: 5,
        isItemSelectable: (index) => index !== 1 && index !== 3,
      })
    );

    expect(result.current.selectableIndices).toEqual([0, 2, 4]);
  });

  it('scans to the next selectable index in both directions, wrapping', () => {
    const { result } = renderHook(() =>
      useComboboxFoundation({
        ...OPTIONS,
        itemCount: 4,
        isItemSelectable: (index) => index !== 1,
      })
    );

    const { nextSelectableFrom } = result.current;
    expect(nextSelectableFrom(0, 1)).toBe(2);
    expect(nextSelectableFrom(3, 1)).toBe(0);
    expect(nextSelectableFrom(2, -1)).toBe(0);
    expect(nextSelectableFrom(0, -1)).toBe(3);
  });

  it('scans from the first row downward and the last row upward with no active row', () => {
    const { result } = renderHook(() => useComboboxFoundation({ ...OPTIONS, itemCount: 4 }));

    expect(result.current.nextSelectableFrom(-1, 1)).toBe(0);
    expect(result.current.nextSelectableFrom(-1, -1)).toBe(3);
  });

  it('returns -1 when nothing is selectable', () => {
    const { result } = renderHook(() =>
      useComboboxFoundation({ ...OPTIONS, itemCount: 3, isItemSelectable: () => false })
    );

    expect(result.current.nextSelectableFrom(0, 1)).toBe(-1);
    expect(result.current.selectableIndices).toEqual([]);
  });

  it('releases an active descendant stranded past the last row', () => {
    const { result, rerender } = renderHook(
      (props: ComboboxFoundationOptions) => useComboboxFoundation(props),
      { initialProps: { ...OPTIONS, itemCount: 5 } }
    );

    act(() => result.current.setActiveIndex(4));
    expect(result.current.activeIndex).toBe(4);

    rerender({ ...OPTIONS, itemCount: 2 });
    expect(result.current.activeIndex).toBe(-1);
  });

  it('releases an active descendant when its row becomes disabled without shrinking', () => {
    const { result, rerender } = renderHook(
      (props: ComboboxFoundationOptions) => useComboboxFoundation(props),
      {
        initialProps: {
          ...OPTIONS,
          isItemSelectable: () => true,
        } as ComboboxFoundationOptions,
      }
    );

    act(() => result.current.setActiveIndex(1, 'keyboard'));
    expect(result.current.activeId).toBe('listbox-1-option-1');

    rerender({ ...OPTIONS, isItemSelectable: (index) => index !== 1 });
    expect(result.current.activeIndex).toBe(-1);
    expect(result.current.activeId).toBeUndefined();
  });

  it('rejects a programmatic move to a disabled row', () => {
    const { result } = renderHook(() =>
      useComboboxFoundation({ ...OPTIONS, isItemSelectable: (index) => index !== 1 })
    );

    act(() => result.current.setActiveIndex(1, 'keyboard'));
    expect(result.current.activeIndex).toBe(-1);
    expect(result.current.consumeKeyboardMove()).toBe(false);
  });

  it('reports a keyboard move once and a pointer move never', () => {
    const { result } = renderHook(() => useComboboxFoundation(OPTIONS));

    act(() => result.current.setActiveIndex(1, 'keyboard'));
    expect(result.current.consumeKeyboardMove()).toBe(true);
    expect(result.current.consumeKeyboardMove()).toBe(false);

    act(() => result.current.setActiveIndex(2, 'pointer'));
    expect(result.current.consumeKeyboardMove()).toBe(false);
  });
});

describe('useComboboxFoundation aria', () => {
  it('wires the input, listbox and items to each other', () => {
    const { result } = renderHook(() => useComboboxFoundation(OPTIONS));

    act(() => result.current.setActiveIndex(1, 'keyboard'));

    expect(result.current.getInputProps()).toMatchObject({
      role: 'combobox',
      'aria-haspopup': 'listbox',
      'aria-autocomplete': 'list',
      'aria-expanded': true,
      'aria-controls': 'listbox-1',
      'aria-activedescendant': 'listbox-1-option-1',
    });
    expect(result.current.getListboxProps()).toMatchObject({
      role: 'listbox',
      id: 'listbox-1',
    });
    expect(result.current.getItemProps(1)).toMatchObject({
      role: 'option',
      id: 'listbox-1-option-1',
      'aria-selected': false,
      'data-active': true,
    });
  });

  it('drops the panel wiring while closed', () => {
    const { result } = renderHook(() => useComboboxFoundation({ ...OPTIONS, open: false }));

    act(() => result.current.setActiveIndex(1, 'keyboard'));

    expect(result.current.getInputProps()).toMatchObject({
      'aria-expanded': false,
      'aria-controls': undefined,
      'aria-activedescendant': undefined,
    });
  });

  it('marks the listbox busy only while loading', () => {
    const { result, rerender } = renderHook(
      (props: ComboboxFoundationOptions) => useComboboxFoundation(props),
      { initialProps: { ...OPTIONS, loading: true } }
    );

    expect(result.current.getListboxProps()['aria-busy']).toBe(true);

    rerender({ ...OPTIONS, loading: false });
    expect(result.current.getListboxProps()['aria-busy']).toBeUndefined();
  });

  it('announces value selection over the active row when the caller distinguishes them', () => {
    const { result } = renderHook(() => useComboboxFoundation(OPTIONS));

    act(() => result.current.setActiveIndex(0, 'keyboard'));

    expect(result.current.getItemProps(0, { selected: false })['aria-selected']).toBe(false);
    expect(result.current.getItemProps(2, { selected: true })['aria-selected']).toBe(true);
  });

  it('keeps disabled and selected semantics explicit and separate from active state', () => {
    const { result } = renderHook(() => useComboboxFoundation(OPTIONS));

    act(() => result.current.setActiveIndex(0, 'keyboard'));

    expect(result.current.getItemProps(0, { selected: false })['aria-selected']).toBe(false);
    expect(result.current.getItemProps(1, { disabled: true })).toMatchObject({
      'aria-selected': false,
      'aria-disabled': true,
    });
  });

  it('moves aria-activedescendant with the active row on a rendered combobox', () => {
    function Harness(): React.ReactElement {
      const combobox = useComboboxFoundation({ ...OPTIONS, itemCount: 2 });
      return (
        <div>
          <input aria-label="Search" {...combobox.getInputProps()} />
          <ul {...combobox.getListboxProps()}>
            {[0, 1].map((index) => (
              <li key={index} {...combobox.getItemProps(index)}>
                {`Row ${index}`}
              </li>
            ))}
          </ul>
          <button type="button" onClick={() => combobox.setActiveIndex(1, 'keyboard')}>
            Advance
          </button>
        </div>
      );
    }

    render(<Harness />);
    const input = screen.getByRole('combobox');
    expect(input).not.toHaveAttribute('aria-activedescendant');

    act(() => screen.getByRole('button', { name: 'Advance' }).click());

    const activeId = input.getAttribute('aria-activedescendant');
    expect(activeId).toBe('listbox-1-option-1');
    expect(document.getElementById(activeId as string)).toHaveTextContent('Row 1');
  });
});
