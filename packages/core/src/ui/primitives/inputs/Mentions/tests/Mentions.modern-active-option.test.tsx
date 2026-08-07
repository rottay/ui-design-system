import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ModernMentions from '../engines/modern';

const FIVE = ['ana', 'ben', 'cara', 'dan', 'eve'].map((v) => ({ value: v, label: v }));
const TWO = FIVE.slice(0, 2);

/**
 * Active-option integrity for the modern Mentions popup.
 *
 * The family's async idiom is `onSearch` -> the parent refetches -> new
 * `options` arrive with no keystroke. `focusedIndex` was only ever reset inside
 * the change handler, so an arrowed index outlived the list it pointed into:
 * `aria-activedescendant` named a row that no longer existed, no row painted
 * active, and Enter committed nothing.
 *
 * The row markup also carried `role="option"` on the `<li>` while keeping a
 * focusable `<button>` inside it — a nested-interactive violation that both
 * sibling combobox families already avoid.
 */
const openPopup = (textarea: HTMLElement) => {
  fireEvent.change(textarea, { target: { value: '@' } });
};

describe('Mentions modern active option', () => {
  it('never points aria-activedescendant at a row an async refill removed', () => {
    const { rerender } = render(<ModernMentions options={FIVE} />);
    const textarea = screen.getByRole('textbox');
    openPopup(textarea);

    // Arrow down to the fourth row.
    for (let i = 0; i < 3; i += 1) fireEvent.keyDown(textarea, { key: 'ArrowDown' });
    const activeId = textarea.getAttribute('aria-activedescendant');
    expect(activeId).toBeTruthy();
    expect(document.getElementById(activeId as string)).not.toBeNull();

    // The in-flight search resolves with a shorter list — no keystroke involved.
    rerender(<ModernMentions options={TWO} />);

    const nextId = textarea.getAttribute('aria-activedescendant');
    expect(nextId).toBeTruthy();
    expect(document.getElementById(nextId as string)).not.toBeNull();
  });

  it('restores the visible highlight after the list shrinks', () => {
    const { container, rerender } = render(<ModernMentions options={FIVE} />);
    const textarea = screen.getByRole('textbox');
    openPopup(textarea);
    for (let i = 0; i < 3; i += 1) fireEvent.keyDown(textarea, { key: 'ArrowDown' });

    rerender(<ModernMentions options={TWO} />);

    expect(container.querySelectorAll('[data-part="option"][data-active]')).toHaveLength(1);
  });

  it('keeps the option role off the wrapper so no option contains a focusable child', () => {
    const { container } = render(<ModernMentions options={FIVE} />);
    openPopup(screen.getByRole('textbox'));

    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(FIVE.length);
    for (const option of options) {
      expect(option.tagName).toBe('BUTTON');
      expect(option.querySelector('button, a[href], input, select, textarea')).toBeNull();
    }
    for (const li of Array.from(container.querySelectorAll('[data-part="dropdown"] > li'))) {
      expect(li).toHaveAttribute('role', 'none');
    }
  });
});
