import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ModernButton from '../engines/modern';

describe('ModernButton advanced engine coverage', () => {
  it('covers loading, danger override, sizing, shapes, and full-width branches', () => {
    const handleClick = vi.fn();
    const { container, rerender } = render(
      <ModernButton
        variant="secondary"
        danger
        size="xl"
        shape="circle"
        fullWidth
        shadow
        loading
        icon={<span data-testid="start-icon">I</span>}
        prefix={<span data-testid="prefix">P</span>}
        suffix={<span data-testid="suffix">S</span>}
        onClick={handleClick}
      >
        Save
      </ModernButton>
    );

    const loadingButton = screen.getByRole('button', { name: /save/i });
    expect(loadingButton.className).toContain('rottay-button--danger');
    expect(loadingButton.className).toContain('rottay-button--xl');
    expect(loadingButton.className).toContain('rottay-button--circle');
    expect(loadingButton.className).toContain('rottay-button--block');
    expect(loadingButton.className).toContain('rottay-button--shadow');
    expect(loadingButton).toBeDisabled();
    expect(loadingButton).toHaveAttribute('aria-busy', 'true');
    const spinner = container.querySelector('[data-part="spinner"]');
    expect(spinner).toHaveAttribute('data-size', 'xl');
    expect(spinner).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByTestId('start-icon').closest('[data-part="content"]')).toHaveAttribute(
      'data-state',
      'hidden'
    );
    expect(screen.queryByTestId('prefix')).not.toBeInTheDocument();
    expect(screen.getByTestId('suffix').closest('[data-part="content"]')).toHaveAttribute(
      'data-state',
      'hidden'
    );

    fireEvent.click(loadingButton);
    expect(handleClick).not.toHaveBeenCalled();

    rerender(
      <ModernButton
        variant={'unexpected' as never}
        size="xs"
        shape="round"
        icon={<span data-testid="end-icon">I</span>}
        iconPosition="end"
        prefix={<span data-testid="prefix">P</span>}
        suffix={<span data-testid="suffix">S</span>}
        onClick={handleClick}
      >
        Go
      </ModernButton>
    );

    const activeButton = screen.getByRole('button', { name: /go/i });
    expect(activeButton.className).toContain('rottay-button--primary');
    expect(activeButton.className).toContain('rottay-button--xs');
    expect(activeButton.className).toContain('rottay-button--round');
    expect(screen.getByTestId('prefix')).toBeInTheDocument();
    expect(screen.getByTestId('end-icon')).toBeInTheDocument();
    expect(screen.queryByTestId('suffix')).not.toBeInTheDocument();

    fireEvent.click(activeButton);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  // Pointer events, not mouse events: the behavior core listens on the pointer
  // primitive, which covers mouse, touch and pen with one code path.
  it('covers interactive hover, active, focus, type, and suffix fallback branches', () => {
    const handleClick = vi.fn();

    render(
      <ModernButton
        variant="link"
        htmlType="submit"
        size="sm"
        suffix={<span data-testid="suffix">Next</span>}
        onClick={handleClick}
      >
        Continue
      </ModernButton>
    );

    const button = screen.getByRole('button', { name: /continue/i });
    expect(button).toHaveAttribute('type', 'submit');
    expect(button.className).toContain('rottay-button--link');
    expect(button.className).toContain('rottay-button--sm');
    expect(screen.getByTestId('suffix')).toBeInTheDocument();

    // The skin paints from a stylesheet, keyed on `data-state`. This runtime
    // never loads that stylesheet, so what is assertable here is the state the
    // component publishes, not the declaration a browser would resolve from it.
    // The paint itself is measured against a real cascade, per tenant and per
    // engine, by `packages/showroom/e2e/visual/states.spec.ts`.
    fireEvent.pointerEnter(button);
    expect(button.getAttribute('data-state')).toContain('hovered');

    fireEvent.pointerDown(button);
    expect(button.getAttribute('data-state')).toContain('pressed');

    fireEvent.pointerUp(button);
    expect(button.getAttribute('data-state') ?? '').not.toContain('pressed');

    fireEvent.focus(button);
    expect(button).toHaveAttribute('data-focus-visible', 'true');
    expect(button.getAttribute('data-state')).toContain('focus-visible');

    fireEvent.blur(button);
    expect(button).not.toHaveAttribute('data-focus-visible');

    fireEvent.pointerLeave(button);
    expect(button.getAttribute('data-state') ?? '').not.toContain('hovered');

    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
