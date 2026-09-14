/**
 * IME composition on the modern Select's commit path.
 *
 * The Enter branch of the keydown handler prevented default and committed the
 * active option unconditionally, so the keydown an IME sends to confirm a
 * candidate (`isComposing`, or the legacy keyCode 229 Safari reports) selected
 * the highlighted row instead of resolving the composition. AutoComplete and
 * Mentions already route that decision through the shared submit-intent owner;
 * Select was the remaining asymmetric consumer. The same authority now guards
 * every mode, so the keys an IME owns while composing leave the candidate
 * session -- panel, filter text and active row -- intact.
 *
 * @module Select/tests
 */

import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ModernSelect from '../engines/modern';

const OPTIONS = [
  { value: 'tokyo', label: 'Tokyo' },
  { value: 'toronto', label: 'Toronto' },
  { value: 'lima', label: 'Lima' },
];

/** The keydown a browser dispatches while an IME owns the key. */
const COMPOSING = { isComposing: true, keyCode: 229 } as const;

const activeOptionName = () =>
  screen
    .getAllByRole('option')
    .find((option) => option.getAttribute('data-active') === 'true')
    ?.textContent;

const openSearchable = (extra: Record<string, unknown> = {}) => {
  const onChange = vi.fn();
  render(<ModernSelect searchable options={OPTIONS} onChange={onChange} {...extra} />);
  fireEvent.keyDown(screen.getByRole('combobox'), { key: 'ArrowDown' });
  const search = screen.getByPlaceholderText('Search...');
  return { onChange, search };
};

const openCustom = (extra: Record<string, unknown> = {}) => {
  const onChange = vi.fn();
  render(<ModernSelect options={OPTIONS} onChange={onChange} {...extra} />);
  const trigger = screen.getByRole('combobox');
  fireEvent.keyDown(trigger, { key: 'ArrowDown' });
  return { onChange, trigger };
};

describe('Select modern IME composition', () => {
  it('does not commit the active option when an IME confirms a candidate', () => {
    const { onChange, search } = openSearchable();
    expect(activeOptionName()).toBe('Tokyo');

    fireEvent.keyDown(search, { key: 'Enter', ...COMPOSING });

    expect(onChange).not.toHaveBeenCalled();
    // The candidate session survives: the panel, the filter and the active row.
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(activeOptionName()).toBe('Tokyo');
    expect(document.activeElement).toBe(search);
  });

  it('keeps a typed filter and its active row across the composing Enter', () => {
    const { onChange, search } = openSearchable();
    fireEvent.change(search, { target: { value: 'tor' } });
    fireEvent.keyDown(search, { key: 'ArrowDown' });
    expect(activeOptionName()).toBe('Toronto');

    fireEvent.keyDown(search, { key: 'Enter', ...COMPOSING });

    expect(onChange).not.toHaveBeenCalled();
    expect(search).toHaveValue('tor');
    expect(activeOptionName()).toBe('Toronto');
  });

  it('reads the legacy 229 keydown as composition even without the isComposing flag', () => {
    const { onChange, search } = openSearchable();

    fireEvent.keyDown(search, { key: 'Enter', keyCode: 229 });

    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('commits exactly once on a real Enter', () => {
    const { onChange, search } = openSearchable();

    fireEvent.keyDown(search, { key: 'Enter' });

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('tokyo', expect.objectContaining({ value: 'tokyo' }));
  });

  it('guards the single-select custom path and still commits a real Enter once', () => {
    const { onChange, trigger } = openCustom({ forceCustomDropdown: true });

    fireEvent.keyDown(trigger, { key: 'Enter', ...COMPOSING });
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    fireEvent.keyDown(trigger, { key: 'Enter' });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('tokyo', expect.objectContaining({ value: 'tokyo' }));
  });

  it('guards the multiple path and still commits a real Enter once', () => {
    const { onChange, trigger } = openCustom({ multiple: true });

    fireEvent.keyDown(trigger, { key: 'Enter', ...COMPOSING });
    expect(onChange).not.toHaveBeenCalled();

    fireEvent.keyDown(trigger, { key: 'Enter' });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(['tokyo'], [expect.objectContaining({ value: 'tokyo' })]);
  });

  it('leaves the active row where the IME found it when the arrows walk the candidate window', () => {
    const { search } = openSearchable();
    expect(activeOptionName()).toBe('Tokyo');

    fireEvent.keyDown(search, { key: 'ArrowDown', ...COMPOSING });

    expect(activeOptionName()).toBe('Tokyo');
  });

  it('does not peel the last tag when Backspace edits the composition', () => {
    const { onChange, trigger } = openCustom({ multiple: true, defaultValue: ['tokyo'] });

    fireEvent.keyDown(trigger, { key: 'Backspace', ...COMPOSING });

    expect(onChange).not.toHaveBeenCalled();
  });
});
