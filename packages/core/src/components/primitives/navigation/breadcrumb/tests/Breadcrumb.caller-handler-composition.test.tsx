/**
 * The crumb and the overflow trigger now compose the caller's handler bag with
 * the kernel's instead of spreading one over the other. Every one of the six
 * kernel handlers must survive that composition.
 */
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import { renderWithEngine } from '@tests/support/engine';
import { describe, expect, it } from 'vitest';

import ModernBreadcrumb from '../engines/modern';

const ITEMS = [
  { key: 'home', label: 'Home', href: '/' },
  { key: 'catalog', label: 'Catalog', href: '/catalog' },
  { key: 'filters', label: 'Filters', href: '/filters' },
  { key: 'saved', label: 'Saved', href: '/saved' },
  { key: 'reports', label: 'Reports', href: '/reports' },
  { key: 'current', label: 'Current page' },
];

function expectKernelRoundTrip(element: HTMLElement): void {
  expect(element).not.toHaveAttribute('data-state');
  fireEvent.pointerEnter(element);
  expect(element).toHaveAttribute('data-state', 'hovered');
  fireEvent.pointerDown(element);
  expect(element).toHaveAttribute('data-state', 'hovered pressed');
  fireEvent.pointerUp(element);
  expect(element).toHaveAttribute('data-state', 'hovered');
  fireEvent.pointerLeave(element);
  expect(element).not.toHaveAttribute('data-state');
  fireEvent.focus(element);
  expect(element).toHaveAttribute('data-state', 'focused focus-visible');
  fireEvent.blur(element);
  expect(element).not.toHaveAttribute('data-state');
}

describe('the composed handler bag keeps every kernel handler', () => {
  it('routes hover, press and focus on a crumb', () => {
    const { container } = render(<ModernBreadcrumb items={ITEMS} />);
    expectKernelRoundTrip(container.querySelector('a[data-part="crumb"]') as HTMLElement);
  });

  it('routes hover, press and focus on the overflow trigger', async () => {
    renderWithEngine(
      <ModernBreadcrumb items={ITEMS} overflow={{ maxVisible: 4, keepFirst: 1, keepLast: 2 }} />,
      'modern',
    );
    const trigger = await screen.findByRole('button', { name: 'Show hidden items' });
    expect(trigger).toHaveAttribute('data-part', 'overflow-trigger');
    expectKernelRoundTrip(trigger);
  });
});
