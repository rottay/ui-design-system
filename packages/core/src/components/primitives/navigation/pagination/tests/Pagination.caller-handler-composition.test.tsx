/**
 * The nav button and the size select compose the caller's handler bag with the
 * kernel's instead of spreading one over the other. Every one of the six kernel
 * handlers must survive that composition.
 */
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ModernPagination from '../engines/modern';

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
  it('routes hover, press and focus on a nav button', () => {
    render(<ModernPagination current={2} total={50} pageSize={10} />);
    expectKernelRoundTrip(screen.getByRole('button', { name: 'Next' }));
  });

  it('routes hover, press and focus on the size select', () => {
    render(<ModernPagination current={2} total={50} pageSize={10} showSizeChanger />);
    expectKernelRoundTrip(screen.getByRole('combobox', { name: 'Items per page' }));
  });
});
