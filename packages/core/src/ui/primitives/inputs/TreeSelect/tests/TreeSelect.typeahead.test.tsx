import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent } from '@testing-library/react';

import { TreeSelect } from '../engines/modern';
import { renderWithEngine } from '../../../../../tooling/testing/helpers/engine';

const treeData = [
  { value: 'apple', title: 'Apple' },
  { value: 'apricot', title: 'Apricot' },
  { value: 'banana', title: 'Banana' },
  { value: 'blueberry', title: 'Blueberry' },
];

/** Inside the accumulation window. */
const KEEP = 100;
/** Past the accumulation window. */
const LAPSE = 900;

const focusedLabel = (): string | null =>
  (document.activeElement as HTMLElement | null)
    ?.querySelector('[data-part="tree-node-label"]')
    ?.textContent?.trim() ?? null;

const openOnFirstRow = (): void => {
  const { container } = renderWithEngine(<TreeSelect treeData={treeData} open />, 'modern');
  const first = container.ownerDocument.querySelector('[data-part="option"]') as HTMLElement;
  first.focus();
};

const type = (key: string): void => {
  fireEvent.keyDown(document.activeElement as HTMLElement, { key });
};

describe('TreeSelect modern type-ahead', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('moves focus to the next row matching a single character', () => {
    openOnFirstRow();
    expect(focusedLabel()).toBe('Apple');

    type('b');

    expect(focusedLabel()).toBe('Banana');
  });

  it('accumulates characters typed inside the window into one prefix', () => {
    openOnFirstRow();

    type('b');
    vi.advanceTimersByTime(KEEP);
    type('l');

    expect(focusedLabel()).toBe('Blueberry');
  });

  it('restarts the prefix after a pause longer than the window', () => {
    openOnFirstRow();

    type('b');
    vi.advanceTimersByTime(LAPSE);
    type('a');

    // A fresh "a" search from the row after Banana, wrapping to the top.
    expect(focusedLabel()).toBe('Apple');
  });

  it('cycles same-initial rows when the grown prefix stops matching', () => {
    openOnFirstRow();

    // A fresh character searches from the row AFTER the current one.
    type('a');
    expect(focusedLabel()).toBe('Apricot');

    // "aa" matches nothing, so it falls back to "a" from the next row and
    // wraps around to the other same-initial row.
    vi.advanceTimersByTime(KEEP);
    type('a');
    expect(focusedLabel()).toBe('Apple');
  });

  it('searches from the current row while the prefix is still growing', () => {
    openOnFirstRow();

    type('a');
    expect(focusedLabel()).toBe('Apricot');

    // "ap" still matches the CURRENT row, so focus must not jump past it.
    vi.advanceTimersByTime(KEEP);
    type('p');
    expect(focusedLabel()).toBe('Apricot');
  });

  it('leaves focus alone when nothing matches', () => {
    openOnFirstRow();

    type('z');

    expect(focusedLabel()).toBe('Apple');
  });
});
