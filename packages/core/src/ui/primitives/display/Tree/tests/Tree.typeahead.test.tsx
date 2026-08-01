import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent } from '@testing-library/react';

import Tree from '../engines/modern';
import { renderWithEngine } from '../../../../../tooling/testing/helpers/engine';

const treeData = [
  { key: 'apple', title: 'Apple' },
  { key: 'apricot', title: 'Apricot' },
  { key: 'banana', title: 'Banana' },
  { key: 'blueberry', title: 'Blueberry' },
];

/** Inside the accumulation window. */
const KEEP = 100;
/** Past the accumulation window. */
const LAPSE = 900;

const focusedLabel = (): string | null =>
  (document.activeElement as HTMLElement | null)
    ?.closest('[role="treeitem"]')
    ?.textContent?.trim() ?? null;

const focusFirstNode = (): void => {
  const { container } = renderWithEngine(<Tree treeData={treeData} />, 'modern');
  const first = container.ownerDocument.querySelector('[data-tree-node-key]') as HTMLElement;
  first.focus();
};

const type = (key: string): void => {
  fireEvent.keyDown(document.activeElement as HTMLElement, { key });
};

describe('Tree modern type-ahead', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('moves focus to the next node matching a single character', () => {
    focusFirstNode();
    expect(focusedLabel()).toBe('Apple');

    type('b');

    expect(focusedLabel()).toBe('Banana');
  });

  it('accumulates characters typed inside the window into one prefix', () => {
    focusFirstNode();

    type('b');
    vi.advanceTimersByTime(KEEP);
    type('l');

    expect(focusedLabel()).toBe('Blueberry');
  });

  it('restarts the prefix after a pause longer than the window', () => {
    focusFirstNode();

    type('b');
    vi.advanceTimersByTime(LAPSE);
    type('a');

    // A fresh "a" search from after Banana, wrapping to the top.
    expect(focusedLabel()).toBe('Apple');
  });

  it('cycles same-initial nodes when the grown prefix stops matching', () => {
    focusFirstNode();

    type('b');
    vi.advanceTimersByTime(LAPSE);
    type('a');
    expect(focusedLabel()).toBe('Apple');

    // "aa" matches nothing, so it restarts from "a" and takes the next
    // same-initial node instead of pinning the first one.
    vi.advanceTimersByTime(KEEP);
    type('a');
    expect(focusedLabel()).toBe('Apricot');
  });

  it('leaves focus alone when nothing matches', () => {
    focusFirstNode();

    type('z');

    expect(focusedLabel()).toBe('Apple');
  });
});
