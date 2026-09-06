import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderWithEngine } from '@tests/support/engine';
import { Cascader as ModernCascader } from '../engines/modern';

const options = [
  {
    value: 'zhejiang',
    label: 'Zhejiang',
    children: [{ value: 'hangzhou', label: 'Hangzhou' }],
  },
];

/**
 * Two modern-engine holes.
 *
 * 1. The selected-path effect only rebuilt when `value.length > 0`, so a
 *    controlled reset to `[]` (form reset, external clear, route change) left
 *    the trigger label, its accessible name and the clear affordance showing a
 *    selection the form no longer holds.
 * 2. `role="combobox"` announced `aria-expanded` with no `aria-controls`, and
 *    the popup carried no id at all, so AT had no route from the combobox to
 *    the popup it had just been told was open.
 */
describe('Cascader modern controlled value and popup wiring', () => {
  it('clears the rendered path when a controlled value resets to empty', () => {
    const { rerender } = renderWithEngine(
      <ModernCascader options={options} value={['zhejiang', 'hangzhou']} />,
      'modern'
    );

    expect(screen.getByText('Zhejiang / Hangzhou')).toBeInTheDocument();

    rerender(<ModernCascader options={options} value={[]} />);

    expect(screen.queryByText('Zhejiang / Hangzhou')).not.toBeInTheDocument();
    expect(screen.getByText('Please select')).toBeInTheDocument();
  });

  it('drops the stale clear affordance when the controlled value empties', () => {
    const { container, rerender } = renderWithEngine(
      <ModernCascader options={options} allowClear value={['zhejiang', 'hangzhou']} />,
      'modern'
    );
    expect(container.querySelector('[data-part="clear-button"]')).not.toBeNull();

    rerender(<ModernCascader options={options} allowClear value={[]} />);
    expect(container.querySelector('[data-part="clear-button"]')).toBeNull();
  });

  it('points aria-controls at the real popup only while expanded', () => {
    const { container } = renderWithEngine(<ModernCascader options={options} />, 'modern');

    const trigger = screen.getByRole('combobox');
    expect(trigger).not.toHaveAttribute('aria-controls');

    fireEvent.click(trigger);

    const popupId = trigger.getAttribute('aria-controls');
    expect(popupId).toBeTruthy();
    // The panel is PORTALED (WO-CAN-05) into `#rottay-portal-root`, so the
    // id has to resolve in the document, not inside the render container.
    // `aria-controls` is now the ONLY link between field and panel, which is
    // exactly why it is asserted here.
    const popup = document.getElementById(popupId as string);
    expect(popup).not.toBeNull();
    expect(container.contains(popup)).toBe(false);
    expect(popup?.closest('#rottay-portal-root')).not.toBeNull();
    expect(popup).toHaveAttribute('data-part', 'dropdown');
  });

  it('scopes the popup id per instance', () => {
    renderWithEngine(
      <>
        <ModernCascader options={options} open />
        <ModernCascader options={options} open />
      </>,
      'modern'
    );

    // Two portaled panels, two distinct ids, both in the shared portal root.
    const panels = Array.from(
      document.querySelectorAll('[data-part="dropdown"]'),
    ) as HTMLElement[];
    expect(panels).toHaveLength(2);
    expect(new Set(panels.map((n) => n.id)).size).toBe(2);
    for (const panel of panels) {
      expect(panel.closest('#rottay-portal-root')).not.toBeNull();
    }
  });
});
