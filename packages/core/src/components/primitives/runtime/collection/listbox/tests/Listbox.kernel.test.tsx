/**
 * @fileoverview One listbox law: arrows, edges, pages and type-ahead land on the
 * same option in every selection family.
 */

import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  LISTBOX_PAGE_SIZE,
  isTypeaheadKey,
  resolveListboxTarget,
  resolveTypeaheadTarget,
  useListbox,
} from '..';

const FRUIT = ['Apple', 'Apricot', 'Banana', 'Blueberry', 'Cherry'];
const EMPTY = { buffer: '', lastKeyTime: 0 };

describe('resolveListboxTarget', () => {
  const base = { itemCount: 5, isItemSelectable: (index: number) => index !== 2 };

  it('walks the selectable rows and wraps at both edges', () => {
    expect(resolveListboxTarget('ArrowDown', { ...base, activeIndex: 1 })).toBe(3);
    expect(resolveListboxTarget('ArrowUp', { ...base, activeIndex: 3 })).toBe(1);
    expect(resolveListboxTarget('ArrowDown', { ...base, activeIndex: 4 })).toBe(0);
    expect(resolveListboxTarget('ArrowUp', { ...base, activeIndex: 0 })).toBe(4);
  });

  it('opens a fresh list on the first row going down and the last row going up', () => {
    expect(resolveListboxTarget('ArrowDown', { ...base, activeIndex: -1 })).toBe(0);
    expect(resolveListboxTarget('ArrowUp', { ...base, activeIndex: -1 })).toBe(4);
    expect(resolveListboxTarget('Home', { ...base, activeIndex: 3 })).toBe(0);
    expect(resolveListboxTarget('End', { ...base, activeIndex: 0 })).toBe(4);
  });

  it('holds the edges without wrap and leaves cross-axis keys to the family', () => {
    expect(resolveListboxTarget('ArrowDown', { ...base, activeIndex: 4, wrap: false })).toBe(-1);
    expect(resolveListboxTarget('ArrowRight', { ...base, activeIndex: 1 })).toBeNull();
    expect(resolveListboxTarget('Enter', { ...base, activeIndex: 1 })).toBeNull();
  });

  it('mirrors a horizontal list under RTL', () => {
    const horizontal = { itemCount: 3, activeIndex: 1, orientation: 'horizontal' as const };
    expect(resolveListboxTarget('ArrowRight', horizontal)).toBe(2);
    expect(resolveListboxTarget('ArrowRight', { ...horizontal, rtl: true })).toBe(0);
  });

  it('pages rendered rows, clamps without wrapping and recovers to a selectable row', () => {
    const long = { itemCount: 25, isItemSelectable: (index: number) => index !== 10 };
    expect(resolveListboxTarget('PageDown', { ...long, activeIndex: 0 })).toBe(11);
    expect(resolveListboxTarget('PageDown', { ...long, activeIndex: 20 })).toBe(24);
    expect(resolveListboxTarget('PageUp', { ...long, activeIndex: 20 })).toBe(9);
    expect(resolveListboxTarget('PageUp', { ...long, activeIndex: 3 })).toBe(0);
    expect(LISTBOX_PAGE_SIZE).toBe(10);
  });

  it('reports no target in an empty or fully disabled list', () => {
    expect(resolveListboxTarget('ArrowDown', { itemCount: 0, activeIndex: -1 })).toBe(-1);
    expect(resolveListboxTarget('End', { itemCount: 2, activeIndex: -1, isItemSelectable: () => false })).toBe(-1);
  });
});

describe('resolveTypeaheadTarget', () => {
  const at = (activeIndex: number, now: number) => ({
    activeIndex,
    itemCount: FRUIT.length,
    getItemText: (index: number) => FRUIT[index],
    now,
  });

  it('searches a fresh character from the next row and cycles a repeated one', () => {
    const first = resolveTypeaheadTarget(EMPTY, 'a', at(0, 1000));
    expect(FRUIT[first.index]).toBe('Apricot');
    const second = resolveTypeaheadTarget(first.state, 'a', at(first.index, 1100));
    expect(FRUIT[second.index]).toBe('Apple');
  });

  it('keeps a growing prefix on the current row and restarts after the window', () => {
    const b = resolveTypeaheadTarget(EMPTY, 'b', at(0, 1000));
    expect(FRUIT[b.index]).toBe('Banana');
    const bl = resolveTypeaheadTarget(b.state, 'l', at(b.index, 1100));
    expect(FRUIT[bl.index]).toBe('Blueberry');
    const later = resolveTypeaheadTarget(bl.state, 'c', at(bl.index, 5000));
    expect(FRUIT[later.index]).toBe('Cherry');
  });

  it('retries a dead prefix with its last character and reports a miss', () => {
    const a = resolveTypeaheadTarget(EMPTY, 'a', at(-1, 1000));
    const ab = resolveTypeaheadTarget(a.state, 'b', at(a.index, 1100));
    expect(FRUIT[ab.index]).toBe('Banana');
    expect(ab.state.buffer).toBe('b');
    expect(resolveTypeaheadTarget(EMPTY, 'z', at(2, 1000)).index).toBe(-1);
  });

  it('never lands on a row that cannot hold the active option', () => {
    const result = resolveTypeaheadTarget(EMPTY, 'b', { ...at(0, 1000), isItemSelectable: (index) => index !== 2 });
    expect(FRUIT[result.index]).toBe('Blueberry');
  });

  it('accepts printable keys only, and Space only when the family allows it', () => {
    expect(isTypeaheadKey({ key: 'a' })).toBe(true);
    expect(isTypeaheadKey({ key: 'a', ctrlKey: true })).toBe(false);
    expect(isTypeaheadKey({ key: 'ArrowDown' })).toBe(false);
    expect(isTypeaheadKey({ key: ' ' })).toBe(false);
    expect(isTypeaheadKey({ key: ' ' }, { allowSpace: true })).toBe(true);
  });
});

function Probe({ disabled = [] as number[] }) {
  const listbox = useListbox({
    open: true,
    itemCount: FRUIT.length,
    isItemSelectable: (index) => !disabled.includes(index),
    listboxId: 'fruit',
    getItemText: (index) => FRUIT[index],
  });
  return (
    <div>
      <input
        aria-label="Fruit"
        {...listbox.getInputProps()}
        onKeyDown={(event) => {
          listbox.navigate(event);
        }}
      />
      <ul {...listbox.getListboxProps()}>
        {FRUIT.map((fruit, index) => (
          <li key={fruit} {...listbox.getOptionProps(index, { disabled: disabled.includes(index) })}>
            {fruit}
          </li>
        ))}
      </ul>
    </div>
  );
}

describe('useListbox', () => {
  it('announces the option the keyboard lands on through the combobox relationship', () => {
    render(<Probe disabled={[1]} />);
    const input = screen.getByRole('combobox', { name: 'Fruit' });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(input).toHaveAttribute('aria-activedescendant', 'fruit-option-0');
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(input).toHaveAttribute('aria-activedescendant', 'fruit-option-2');
    fireEvent.keyDown(input, { key: 'c' });
    expect(screen.getByRole('option', { name: 'Cherry' })).toHaveAttribute('data-active', 'true');
  });

  it('follows the pointer except onto a disabled option', () => {
    render(<Probe disabled={[1]} />);
    const input = screen.getByRole('combobox', { name: 'Fruit' });
    act(() => {
      fireEvent.mouseEnter(screen.getByRole('option', { name: 'Banana' }));
    });
    expect(input).toHaveAttribute('aria-activedescendant', 'fruit-option-2');
    act(() => {
      fireEvent.mouseEnter(screen.getByRole('option', { name: 'Apricot' }));
    });
    expect(input).toHaveAttribute('aria-activedescendant', 'fruit-option-2');
    expect(screen.getByRole('option', { name: 'Apricot' })).toHaveAttribute('aria-disabled', 'true');
  });
});
