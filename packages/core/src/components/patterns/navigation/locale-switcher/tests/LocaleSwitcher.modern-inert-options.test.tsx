import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { renderWithEngine } from '@tests/support/engine';
import ModernLocaleSwitcher from '../engines/modern';
import { DEFAULT_LOCALES } from '../runtime/default-locales';

/** Opens the panel and returns the trigger plus every rendered option row. */
function openPanel() {
  renderWithEngine(
    <ModernLocaleSwitcher locale="en" onChange={vi.fn()} locales={DEFAULT_LOCALES} />,
    'modern',
  );
  const trigger = screen.getByTestId('locale-switcher-trigger');
  fireEvent.click(trigger);
  return { trigger, options: screen.getAllByRole('option') };
}

// APG select-only combobox: the trigger owns DOM focus for the whole widget
// and the option rows are inert, pointed at only by aria-activedescendant.
describe('modern locale switcher -- activedescendant options are inert', () => {
  it('keeps every option row out of the tab sequence', () => {
    const { options } = openPanel();

    expect(options.length).toBeGreaterThan(1);
    for (const option of options) {
      // The widget's own contract keeps DOM focus on the trigger at all
      // times, so no option row may be a tab-sequence stop.
      expect(option.getAttribute('tabindex')).toBe('-1');
    }
  });

  it('keeps each row a native control rather than a rebuilt one', () => {
    const { options } = openPanel();

    // A div carrying role=option + onClick rebuilds a primitive's semantics on
    // a non-interactive element, which the ownership contract forbids.
    for (const option of options) {
      expect(option.tagName).toBe('BUTTON');
      expect(option.getAttribute('type')).toBe('button');
    }
  });

  it('leaves the trigger as the only tab stop while the panel is open', () => {
    const { trigger } = openPanel();

    const root = trigger.closest('[data-part="root"]') as HTMLElement;
    // tabindex="-1" removes a natively focusable element from the sequence, so
    // the query has to exclude it on native controls too, not only on [tabindex].
    const tabStops = root.querySelectorAll(
      [
        'button:not([tabindex="-1"])',
        '[href]:not([tabindex="-1"])',
        'input:not([tabindex="-1"])',
        'select:not([tabindex="-1"])',
        'textarea:not([tabindex="-1"])',
        '[tabindex]:not([tabindex="-1"])',
      ].join(', '),
    );

    expect(Array.from(tabStops)).toEqual([trigger]);
  });

  it('does not blur the trigger when a row is pressed with a pointer', () => {
    const { options } = openPanel();

    const mousedown = fireEvent.mouseDown(options[1]);

    // fireEvent returns false only when a listener called preventDefault —
    // needed here so pointer-down never moves focus off the trigger.
    expect(mousedown).toBe(false);
  });

  it('still selects on click and still exposes the active row', () => {
    const onChange = vi.fn();
    renderWithEngine(
      <ModernLocaleSwitcher locale="en" onChange={onChange} locales={DEFAULT_LOCALES} />,
      'modern',
    );
    fireEvent.click(screen.getByTestId('locale-switcher-trigger'));

    const options = screen.getAllByRole('option');
    const active = options.find((o) => o.getAttribute('aria-selected') === 'true');
    expect(active).toBeDefined();

    const other = options.find((o) => o.getAttribute('aria-selected') !== 'true');
    fireEvent.click(other as HTMLElement);

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId('locale-switcher-menu')).toBeNull();
  });
});
