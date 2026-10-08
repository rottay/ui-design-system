import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { renderWithEngine } from '@tests/support/engine';
import ModernLocaleSwitcher from '../engines/modern';
import { DEFAULT_LOCALES } from '../runtime/default-locales';

/** Opens the panel and returns the trigger plus every rendered option row. */
function openPanel(onChange = vi.fn()) {
  renderWithEngine(
    <ModernLocaleSwitcher locale="en" onChange={onChange} locales={DEFAULT_LOCALES} />,
    'modern',
  );
  const trigger = screen.getByRole('combobox', { name: /Language/ });
  trigger.focus();
  fireEvent.click(trigger);
  return { trigger, options: screen.getAllByRole('option') };
}

const TAB_STOPS = [
  'button:not([tabindex="-1"])',
  '[href]:not([tabindex="-1"])',
  'input:not([tabindex="-1"])',
  'select:not([tabindex="-1"])',
  'textarea:not([tabindex="-1"])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

// APG select-only combobox: the trigger owns DOM focus for the whole widget
// and the option rows are inert, pointed at only by aria-activedescendant.
// The rows are the canonical Select's: a native control per row is no longer
// pinned, because an activedescendant target is never focusable by design.
describe('modern locale switcher -- activedescendant options are inert', () => {
  it('keeps every option row out of the tab sequence', () => {
    const { options } = openPanel();

    expect(options.length).toBeGreaterThan(1);
    for (const option of options) {
      expect(option.matches(TAB_STOPS)).toBe(false);
      expect(option.querySelector(TAB_STOPS)).toBeNull();
    }
  });

  it('leaves the trigger as the only tab stop while the panel is open', () => {
    const { trigger } = openPanel();

    const root = trigger.closest('.ds-pattern-locale-switcher') as HTMLElement;
    const panel = screen.getByRole('listbox');
    expect(Array.from(root.querySelectorAll(TAB_STOPS))).toEqual([trigger]);
    expect(panel.querySelectorAll(TAB_STOPS)).toHaveLength(0);
  });

  it('does not blur the trigger when a row is pressed with a pointer', () => {
    const { trigger, options } = openPanel();

    expect(document.activeElement).toBe(trigger);
    fireEvent.pointerDown(options[2]!);
    fireEvent.mouseDown(options[2]!);
    expect(document.activeElement).toBe(trigger);
    fireEvent.click(options[2]!);
    expect(document.activeElement).toBe(trigger);
  });

  it('still selects on click and still exposes the active row', () => {
    const onChange = vi.fn();
    const { trigger, options } = openPanel(onChange);

    const selected = options.find((o) => o.getAttribute('aria-selected') === 'true');
    expect(selected).toBeDefined();
    expect(trigger.getAttribute('aria-activedescendant')).toBe(selected!.id);
    expect(selected!.getAttribute('data-active')).toBe('true');

    const other = options.find((o) => o.getAttribute('aria-selected') !== 'true');
    fireEvent.click(other as HTMLElement);

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(document.querySelector('[role="listbox"]')).toBeNull();
  });
});
