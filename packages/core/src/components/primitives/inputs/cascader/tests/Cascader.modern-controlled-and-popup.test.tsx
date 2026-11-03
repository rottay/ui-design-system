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

describe('Cascader modern keyboard drill focus', () => {
  const regions = [
    {
      value: 'europe',
      label: 'Europe',
      children: [
        {
          value: 'portugal',
          label: 'Portugal',
          children: [
            { value: 'lisbon', label: 'Lisbon' },
            { value: 'porto', label: 'Porto' },
          ],
        },
        {
          value: 'spain',
          label: 'Spain',
          children: [
            { value: 'madrid', label: 'Madrid' },
            { value: 'barcelona', label: 'Barcelona' },
          ],
        },
      ],
    },
    { value: 'asia', label: 'Asia', children: [{ value: 'japan', label: 'Japan' }] },
  ];

  it('lands on the first option of the last column after each keyboard drill', async () => {
    renderWithEngine(<ModernCascader options={regions} />, 'modern');
    fireEvent.click(screen.getByRole('combobox'));

    const europe = await screen.findByRole('option', { name: 'Europe' });
    europe.focus();
    fireEvent.keyDown(europe, { key: 'ArrowRight' });
    const portugal = await screen.findByRole('option', { name: 'Portugal' });
    expect(portugal).toHaveFocus();

    fireEvent.keyDown(portugal, { key: 'ArrowRight' });
    const lisbon = await screen.findByRole('option', { name: 'Lisbon' });
    expect(lisbon).toHaveFocus();
    const column = lisbon.closest('[data-part="menu-column"]');
    expect(column).toHaveAttribute('data-last', 'true');
    expect(column?.parentElement?.querySelectorAll(':scope > [data-part="menu-column"]')).toHaveLength(3);
  });

  it('focuses the replaced last column when drilling from a middle column, then releases the pending focus', async () => {
    renderWithEngine(
      <ModernCascader options={regions} defaultValue={['europe', 'portugal', 'lisbon']} />,
      'modern'
    );
    fireEvent.click(screen.getByRole('combobox'));

    const spain = await screen.findByRole('option', { name: 'Spain' });
    expect(document.querySelectorAll('[data-part="menu-column"]')).toHaveLength(3);
    spain.focus();
    fireEvent.keyDown(spain, { key: 'ArrowRight' });

    const madrid = await screen.findByRole('option', { name: 'Madrid' });
    expect(madrid).toHaveFocus();
    expect(madrid.closest('[data-part="menu-column"]')).toHaveAttribute('data-last', 'true');
    expect(screen.queryByRole('option', { name: 'Lisbon' })).toBeNull();
    expect(document.querySelectorAll('[data-part="menu-column"]')).toHaveLength(3);

    // A pointer expansion after the keyboard drill must not inherit its focus move.
    fireEvent.click(screen.getByRole('option', { name: 'Portugal' }));
    const lisbon = await screen.findByRole('option', { name: 'Lisbon' });
    expect(lisbon).not.toHaveFocus();
  });

  // Europe, Iberia and Spain each sit second in their column, so a read from
  // another column or a first-option fallback lands on a different row.
  const realms = [
    {
      value: 'asia',
      label: 'Asia',
      children: [
        {
          value: 'east-asia',
          label: 'East Asia',
          children: [{ value: 'japan', label: 'Japan', children: [{ value: 'tokyo', label: 'Tokyo' }] }],
        },
      ],
    },
    {
      value: 'europe',
      label: 'Europe',
      children: [
        {
          value: 'nordics',
          label: 'Nordics',
          children: [{ value: 'norway', label: 'Norway', children: [{ value: 'oslo', label: 'Oslo' }] }],
        },
        {
          value: 'iberia',
          label: 'Iberia',
          children: [
            { value: 'portugal', label: 'Portugal', children: [{ value: 'lisbon', label: 'Lisbon' }] },
            { value: 'spain', label: 'Spain', children: [{ value: 'madrid', label: 'Madrid' }] },
          ],
        },
      ],
    },
  ];

  it('expands the option of its own column when drilling from a deeper middle column', async () => {
    renderWithEngine(
      <ModernCascader options={realms} defaultValue={['europe', 'iberia', 'portugal', 'lisbon']} />,
      'modern'
    );
    fireEvent.click(screen.getByRole('combobox'));

    const spain = await screen.findByRole('option', { name: 'Spain' });
    expect(document.querySelectorAll('[data-part="menu-column"]')).toHaveLength(4);
    spain.focus();
    fireEvent.keyDown(spain, { key: 'ArrowRight' });

    const madrid = await screen.findByRole('option', { name: 'Madrid' });
    expect(madrid).toHaveFocus();
    expect(madrid.closest('[data-part="menu-column"]')).toHaveAttribute('data-last', 'true');
    expect(screen.getByRole('option', { name: 'Spain' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.queryByRole('option', { name: 'Lisbon' })).toBeNull();
    expect(document.querySelectorAll('[data-part="menu-column"]')).toHaveLength(4);
  });

  it('returns focus to the selected option of each previous column and stops at the first column', async () => {
    renderWithEngine(
      <ModernCascader options={realms} defaultValue={['europe', 'iberia', 'portugal', 'lisbon']} />,
      'modern'
    );
    fireEvent.click(screen.getByRole('combobox'));

    const spain = await screen.findByRole('option', { name: 'Spain' });
    spain.focus();
    fireEvent.keyDown(spain, { key: 'ArrowRight' });
    const madrid = await screen.findByRole('option', { name: 'Madrid' });
    expect(madrid).toHaveFocus();

    fireEvent.keyDown(madrid, { key: 'ArrowLeft' });
    expect(screen.getByRole('option', { name: 'Spain' })).toHaveFocus();
    fireEvent.keyDown(document.activeElement as HTMLElement, { key: 'ArrowLeft' });
    expect(screen.getByRole('option', { name: 'Iberia' })).toHaveFocus();
    fireEvent.keyDown(document.activeElement as HTMLElement, { key: 'ArrowLeft' });
    const europe = screen.getByRole('option', { name: 'Europe' });
    expect(europe).toHaveFocus();
    expect(document.querySelectorAll('[data-part="menu-column"]')).toHaveLength(4);

    // The first column has no previous column: the key is neither consumed nor moves focus.
    expect(fireEvent.keyDown(europe, { key: 'ArrowLeft' })).toBe(true);
    expect(europe).toHaveFocus();
  });
});
