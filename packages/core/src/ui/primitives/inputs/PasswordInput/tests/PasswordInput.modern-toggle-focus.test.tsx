import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import ModernPasswordInput from '../engines/modern';

/**
 * The visibility toggle is a real tab stop. Pulling focus into the field on
 * every activation makes the keyboard path one-way: the user reveals the
 * password and then has no focused control to hide it again.
 */
describe('PasswordInput modern - visibility toggle focus', () => {
  it('keeps focus on the toggle after keyboard activation so it can be toggled back', async () => {
    const user = userEvent.setup();
    render(<ModernPasswordInput aria-label="Password" />);

    const field = screen.getByLabelText('Password');
    await user.click(field);
    await user.tab();

    const toggle = screen.getByRole('button', { name: 'Show password' });
    expect(toggle).toHaveFocus();

    await user.keyboard('{Enter}');
    expect(field).toHaveAttribute('type', 'text');
    // Focus must still be on the toggle, which now offers the inverse action.
    expect(screen.getByRole('button', { name: 'Hide password' })).toHaveFocus();

    await user.keyboard('{Enter}');
    expect(field).toHaveAttribute('type', 'password');
  });

  it('still returns focus to the field on pointer activation', async () => {
    const user = userEvent.setup();
    render(<ModernPasswordInput aria-label="Password" />);

    await user.click(screen.getByRole('button', { name: 'Show password' }));

    expect(screen.getByLabelText('Password')).toHaveFocus();
    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'text');
  });
});

describe('Modern PasswordInput toggle focus by activation kind', () => {
  it('keeps focus on the toggle for keyboard activation (detail 0)', () => {
    render(<ModernPasswordInput defaultValue="secret" />);
    const toggle = screen.getByRole('button', { name: 'Show password' });

    toggle.focus();
    fireEvent.click(toggle, { detail: 0 });

    expect(document.activeElement).toBe(toggle);
  });

  it('hands focus to the field for a pointer click (detail 1)', () => {
    const { container } = render(<ModernPasswordInput defaultValue="secret" />);
    const toggle = screen.getByRole('button', { name: 'Show password' });

    fireEvent.click(toggle, { detail: 1 });

    expect(document.activeElement).toBe(container.querySelector('input'));
  });
});
