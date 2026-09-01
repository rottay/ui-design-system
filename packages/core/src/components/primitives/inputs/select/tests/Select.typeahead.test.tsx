import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import ModernSelect from '../engines/modern';

const OPTIONS = [
  { value: 'apple', label: 'Apple' },
  { value: 'apricot', label: 'Apricot' },
  { value: 'banana', label: 'Banana' },
  { value: 'blueberry', label: 'Blueberry' },
];

/** Type-ahead lives on the custom listbox; the native path defers to the browser. */
const openCustomPanel = (extraProps: Record<string, unknown> = {}): HTMLElement => {
  render(<ModernSelect options={OPTIONS} forceCustomDropdown {...extraProps} />);
  const trigger = screen.getByRole('combobox');
  fireEvent.click(trigger);
  return trigger;
};

const activeLabel = (): string | null =>
  document.querySelector('[data-part="option"][data-active="true"]')?.textContent?.trim() ?? null;

/** Inside the accumulation window. */
const KEEP = 100;
/** Past the accumulation window. */
const LAPSE = 900;

describe('Select modern type-ahead', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('jumps focus to the first option matching a single character', () => {
    const trigger = openCustomPanel();
    expect(activeLabel()).toBe('Apple');

    fireEvent.keyDown(trigger, { key: 'b' });

    expect(activeLabel()).toBe('Banana');
  });

  it('accumulates characters typed inside the window into one prefix', () => {
    const trigger = openCustomPanel();

    fireEvent.keyDown(trigger, { key: 'b' });
    vi.advanceTimersByTime(KEEP);
    fireEvent.keyDown(trigger, { key: 'l' });

    expect(activeLabel()).toBe('Blueberry');
  });

  it('restarts the prefix after a pause longer than the window', () => {
    const trigger = openCustomPanel();

    fireEvent.keyDown(trigger, { key: 'b' });
    vi.advanceTimersByTime(LAPSE);
    fireEvent.keyDown(trigger, { key: 'a' });

    // A fresh "a" search rather than a dead "ba" one.
    expect(activeLabel()).toBe('Apple');
  });

  it('cycles same-initial options on a repeated character', () => {
    const trigger = openCustomPanel();

    fireEvent.keyDown(trigger, { key: 'a' });
    expect(activeLabel()).toBe('Apple');

    vi.advanceTimersByTime(KEEP);
    fireEvent.keyDown(trigger, { key: 'a' });
    expect(activeLabel()).toBe('Apricot');

    vi.advanceTimersByTime(KEEP);
    fireEvent.keyDown(trigger, { key: 'a' });
    expect(activeLabel()).toBe('Apple');
  });

  it('retries a dead accumulated prefix as a fresh single-character search', () => {
    const trigger = openCustomPanel();

    fireEvent.keyDown(trigger, { key: 'a' });
    expect(activeLabel()).toBe('Apple');

    // "ab" matches nothing, so the fallback re-searches "b" from the next row.
    vi.advanceTimersByTime(KEEP);
    fireEvent.keyDown(trigger, { key: 'b' });
    expect(activeLabel()).toBe('Banana');
  });

  it('leaves focus alone when nothing matches at all', () => {
    const trigger = openCustomPanel();

    fireEvent.keyDown(trigger, { key: 'b' });
    vi.advanceTimersByTime(LAPSE);
    fireEvent.keyDown(trigger, { key: 'z' });

    expect(activeLabel()).toBe('Banana');
  });

  it('stays inert while the searchable filter owns the keystrokes', () => {
    const trigger = openCustomPanel({ searchable: true });
    const before = activeLabel();

    fireEvent.keyDown(trigger, { key: 'b' });

    expect(activeLabel()).toBe(before);
  });
});
