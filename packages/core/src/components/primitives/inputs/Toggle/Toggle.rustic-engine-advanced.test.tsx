import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import RusticToggle from './engines/rustic';

describe('Toggle rustic advanced engine coverage', () => {
  it('covers keyboard toggling, labels, descriptions, loading, and disabled branches', async () => {
    const handleChange = vi.fn();

    const { rerender, container } = render(
      <RusticToggle
        size="lg"
        color="success"
        labelPlacement="start"
        label="Notifications"
        checkedLabel="ON"
        uncheckedLabel="OFF"
        description="Keep alerts enabled"
        defaultChecked
        onChange={handleChange}
      />
    );

    const toggle = screen.getByRole('switch');
    expect(toggle).toBeChecked();
    expect(screen.getByText('Notifications')).toBeInTheDocument();
    expect(screen.getByText('Keep alerts enabled')).toBeInTheDocument();
    expect(screen.getByText('ON')).toBeInTheDocument();

    fireEvent.keyDown(toggle.closest('label') as HTMLLabelElement, { key: 'Enter' });
    fireEvent.keyDown(toggle.closest('label') as HTMLLabelElement, { key: ' ' });

    await waitFor(() => {
      expect(handleChange.mock.calls.length).toBeGreaterThanOrEqual(2);
    });

    rerender(
      <RusticToggle
        checked={false}
        disabled
        loading
        error
        checkedLabel="ON"
        uncheckedLabel="OFF"
        label="Locked"
      />
    );

    const lockedToggle = screen.getByRole('switch');
    expect(lockedToggle).toBeDisabled();
    expect(lockedToggle).toHaveAttribute('aria-busy', 'true');
    expect(container.querySelector('.rottay-toggle__spinner')).toBeTruthy();
    expect(screen.getByText('OFF')).toBeInTheDocument();
  });
});
