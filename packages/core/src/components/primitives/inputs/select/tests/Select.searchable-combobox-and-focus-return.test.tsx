/**
 * Searchable-combobox integrity and focus return for the modern Select.
 *
 * Two defects met here. The combobox contract lived on the trigger div while
 * `searchable` moved DOM focus to a bare, unnamed `<input>` inside the portal,
 * so `aria-controls`/`aria-activedescendant` were announced against an element
 * the user had already left. And the shared overlay layer is registered with
 * `restoreFocus: false`, while no dismissal path -- Escape, outside press,
 * commit -- put focus back on the trigger, so closing the panel dropped focus
 * to `<body>`.
 *
 * @module Select/tests
 */

import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ModernSelect from '../engines/modern';

const OPTIONS = [
  { value: 'alpha', label: 'Alpha' },
  { value: 'bravo', label: 'Bravo' },
  { value: 'charlie', label: 'Charlie', disabled: true },
];

const openSearchable = (extra: Record<string, unknown> = {}) => {
  const view = render(<ModernSelect searchable options={OPTIONS} {...extra} />);
  const trigger = screen.getByRole('combobox');
  fireEvent.click(trigger);
  return { view, trigger };
};

describe('Select modern searchable combobox + focus return', () => {
  it('puts the combobox contract on the element that actually holds focus', () => {
    openSearchable();

    const search = screen.getByRole('combobox');
    expect(document.activeElement).toBe(search);
    expect(search.tagName).toBe('INPUT');
    expect(search).toHaveAccessibleName('Search options');

    const listbox = screen.getByRole('listbox');
    expect(search).toHaveAttribute('aria-controls', listbox.id);
    expect(search).toHaveAttribute('aria-expanded', 'true');
    expect(search).toHaveAttribute('aria-autocomplete', 'list');

    // The open panel focuses its first selectable option, and the focused
    // element is the one that names it.
    const active = search.getAttribute('aria-activedescendant');
    expect(active).toBeTruthy();
    expect(document.getElementById(active!)).toHaveAttribute('role', 'option');
  });

  it('stops the unfocused trigger from claiming the list it no longer drives', () => {
    const { trigger } = openSearchable();

    expect(trigger).not.toHaveAttribute('aria-controls');
    expect(trigger).not.toHaveAttribute('aria-activedescendant');
    expect(trigger).toHaveAttribute('role', 'button');
  });

  it('keeps the trigger as the combobox on the non-searchable custom path', () => {
    render(<ModernSelect multiple options={OPTIONS} />);
    const trigger = screen.getByRole('combobox');
    fireEvent.click(trigger);

    expect(screen.getAllByRole('combobox')).toHaveLength(1);
    expect(trigger).toHaveAttribute('aria-controls', screen.getByRole('listbox').id);
  });

  it('returns focus to the trigger on Escape', () => {
    const { trigger } = openSearchable();
    expect(document.activeElement).not.toBe(trigger);

    fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Escape' });

    expect(screen.queryByRole('listbox')).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it('returns focus to the trigger when a commit closes the panel', () => {
    const { trigger } = openSearchable();

    fireEvent.click(screen.getByText('Bravo'));

    expect(screen.queryByRole('listbox')).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it('returns focus to the trigger when an outside press dismisses the panel', () => {
    const outside = document.createElement('button');
    document.body.appendChild(outside);
    try {
      const { trigger } = openSearchable();
      fireEvent.pointerDown(outside);

      expect(screen.queryByRole('listbox')).toBeNull();
      expect(document.activeElement).toBe(trigger);
    } finally {
      outside.remove();
    }
  });

  it('marks disabled options as such instead of offering them as choosable', () => {
    openSearchable();
    const disabled = screen.getByText('Charlie').closest('[role="option"]');
    expect(disabled).toHaveAttribute('aria-disabled', 'true');
  });

  it('keeps the listbox children legal when the panel is empty or loading', () => {
    const { rerender } = render(<ModernSelect searchable options={[]} />);
    fireEvent.click(screen.getByRole('combobox'));

    const empty = screen.getByText('No options available');
    expect(empty).toHaveAttribute('role', 'option');
    expect(empty).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByRole('listbox')).toContainElement(empty);

    rerender(<ModernSelect searchable options={[]} loading />);
    const listbox = screen.getByRole('listbox');
    // The trigger carries its own loading indicator, so scope to the panel.
    const loading = listbox.querySelector('[data-part="loading-state"]');
    expect(loading).toHaveAttribute('role', 'option');
    expect(loading).toHaveAttribute('aria-disabled', 'true');
    expect(listbox).toHaveAttribute('aria-busy', 'true');
  });
});
