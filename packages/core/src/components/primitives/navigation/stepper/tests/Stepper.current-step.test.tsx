/**
 * Modern Stepper announces the current step on the FOCUSABLE control.
 *
 * The engine stamped `aria-current="step"` on the `<li>` only. When steps are
 * clickable the focusable control is the `<button data-part="trigger">`, and an
 * ancestor listitem does not convey state to a focused button: every step
 * announced "Step N, button" and the current one was indistinguishable by ear.
 *
 * The Steps family already resolved this the same way; these assertions pin the
 * outcome for Stepper — on the button when clickable, on the `<li>` when not,
 * never on both.
 */

import React from 'react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { renderWithEngine } from '@tests/support/engine';
import ModernStepper from '../engines/modern';

const ITEMS = [
  { title: 'Draft', description: 'Write content' },
  { title: 'Review', description: 'Check details' },
  { title: 'Publish', description: 'Go live' },
];

describe('Modern Stepper current-step state', () => {
  it('marks the trigger button when steps are clickable', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<ModernStepper items={ITEMS} current={1} clickable onChange={onChange} />);

    const current = screen.getByRole('button', { name: /Review/ });
    expect(current).toHaveAttribute('aria-current', 'step');

    // The state must survive a real focus move — that is the moment a screen
    // reader reads the control.
    await act(async () => {
      await user.tab();
      await user.tab();
    });
    expect(document.activeElement).toHaveAttribute('aria-current', 'step');

    const others = screen.getAllByRole('button').filter((node) => node !== current);
    for (const node of others) {
      expect(node).not.toHaveAttribute('aria-current');
    }
  });

  it('does not duplicate the state onto the listitem when clickable', () => {
    const { container } = render(
      <ModernStepper items={ITEMS} current={1} clickable onChange={vi.fn()} />
    );

    const items = container.querySelectorAll('[data-part="item"]');
    for (const item of items) {
      expect(item).not.toHaveAttribute('aria-current');
    }
    expect(container.querySelectorAll('[aria-current="step"]')).toHaveLength(1);
  });

  it('marks the listitem when steps are not clickable', () => {
    const { container } = render(<ModernStepper items={ITEMS} current={1} />);

    const marked = container.querySelectorAll('[aria-current="step"]');
    expect(marked).toHaveLength(1);
    expect(marked[0]?.getAttribute('data-part')).toBe('item');
    expect(marked[0]?.getAttribute('data-status')).toBe('process');
  });

  it('keeps the contract under the engine provider', async () => {
    const { container } = renderWithEngine(
      <ModernStepper items={ITEMS} current={2} clickable onChange={vi.fn()} />,
      'modern'
    );

    const marked = container.querySelectorAll('[aria-current="step"]');
    expect(marked).toHaveLength(1);
    expect(marked[0]?.tagName).toBe('BUTTON');
  });
});
