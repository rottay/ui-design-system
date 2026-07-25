import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ButtonIcon } from '../compound';

describe('ButtonIcon', () => {
  it('renders an accessible icon button and forwards click events', () => {
    const onClick = vi.fn();

    render(
      <ButtonIcon
        icon={<span data-testid="icon">+</span>}
        aria-label="Create event"
        tooltip="Create"
        onClick={onClick}
      />
    );

    const button = screen.getByRole('button', { name: 'Create event' });
    fireEvent.pointerEnter(button);
    fireEvent.pointerDown(button);
    fireEvent.pointerUp(button);
    fireEvent.click(button);

    expect(screen.getByTestId('icon')).toBeInTheDocument();
    expect(button).not.toHaveAttribute('title');
    expect(button.closest('.rottay-tooltip-root')).toHaveAttribute('data-part', 'root');
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('handles loading and disabled branches without firing clicks', () => {
    const onClick = vi.fn();

    const { rerender } = render(
      <ButtonIcon
        icon={<span>!</span>}
        aria-label="Busy action"
        loading
        onClick={onClick}
      />
    );

    expect(screen.getByRole('button', { name: 'Busy action' })).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('button', { name: 'Busy action' })).toBeDisabled();

    rerender(
      <ButtonIcon
        icon={<span>!</span>}
        aria-label="Disabled action"
        disabled
        variant="ghost"
        size="lg"
        onClick={onClick}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Disabled action' }));
    expect(onClick).not.toHaveBeenCalled();
  });
});
