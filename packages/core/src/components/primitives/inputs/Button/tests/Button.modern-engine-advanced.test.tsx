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
    const spinner = container.querySelector('svg');
    expect(spinner).toHaveAttribute('width', '18');
    expect(spinner).toHaveAttribute('height', '18');
    expect(screen.getByTestId('start-icon').parentElement).toHaveStyle({ opacity: '0' });
    expect(screen.queryByTestId('prefix')).not.toBeInTheDocument();
    expect(screen.getByTestId('suffix').parentElement).toHaveStyle({ opacity: '0' });

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

    fireEvent.mouseEnter(button);
    expect(button.style.textDecoration).toBe('underline');

    fireEvent.mouseDown(button);
    expect(button.style.transform).toBe('scale(0.98)');

    fireEvent.mouseUp(button);
    expect(button.style.transform).toBe('');

    fireEvent.focus(button);
    expect(button).toHaveAttribute('data-focus-visible', 'true');

    fireEvent.blur(button);
    expect(button).not.toHaveAttribute('data-focus-visible');

    fireEvent.mouseLeave(button);
    expect(button.style.textDecoration).toBe('none');

    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
