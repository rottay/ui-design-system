import React from 'react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import ModernSwitch from '../engines/modern';

// `loading` is BUSY, not disabled: marking the input `disabled` mid-activation removes the
// tab stop and drops the keyboard user to <body>.
describe('Modern Switch busy state', () => {
  it('stays reachable by keyboard after it enters the busy state', async () => {
    const user = userEvent.setup();

    const { rerender } = render(
      <>
        <button type="button">before</button>
        <ModernSwitch aria-label="Sync" />
      </>,
    );

    await act(async () => {
      screen.getByRole('button', { name: 'before' }).focus();
    });

    rerender(
      <>
        <button type="button">before</button>
        <ModernSwitch aria-label="Sync" loading />
      </>,
    );

    // A `disabled` input leaves the tab order entirely: the user who just
    // activated the control is thrown past it. Busy must not do that.
    await user.tab();
    expect(screen.getByRole('switch', { name: 'Sync' })).toHaveFocus();
  });

  it('stays a tab stop while busy and announces the busy state', async () => {
    render(<ModernSwitch aria-label="Sync" loading />);

    const control = screen.getByRole('switch', { name: 'Sync' });
    expect(control).toHaveAttribute('aria-busy', 'true');
    expect(control).toHaveAttribute('aria-disabled', 'true');
    expect(control).not.toBeDisabled();
  });

  it('refuses to commit a new value while busy', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<ModernSwitch aria-label="Sync" loading onChange={onChange} />);

    const control = screen.getByRole('switch', { name: 'Sync' });
    await user.click(control);

    expect(onChange).not.toHaveBeenCalled();
    expect(control).not.toBeChecked();
  });

  it('still hard-disables when the caller disables it', () => {
    render(<ModernSwitch aria-label="Sync" disabled />);

    expect(screen.getByRole('switch', { name: 'Sync' })).toBeDisabled();
  });
});
