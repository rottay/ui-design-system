import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ModernButton from './engines/modern';

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
    expect(loadingButton.className).toContain('btn-error');
    expect(loadingButton.className).toContain('btn-lg');
    expect(loadingButton.className).toContain('btn-circle');
    expect(loadingButton.className).toContain('btn-block');
    expect(loadingButton.className).toContain('shadow-lg');
    expect(loadingButton).toBeDisabled();
    expect(loadingButton).toHaveAttribute('aria-busy', 'true');
    const spinner = container.querySelector('svg');
    expect(spinner).toHaveAttribute('width', '18');
    expect(spinner).toHaveAttribute('height', '18');
    expect(screen.queryByTestId('start-icon')).not.toBeInTheDocument();
    expect(screen.queryByTestId('prefix')).not.toBeInTheDocument();
    expect(screen.queryByTestId('suffix')).not.toBeInTheDocument();

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
    expect(activeButton.className).toContain('btn-primary');
    expect(activeButton.className).toContain('btn-xs');
    expect(activeButton.className).toContain('rounded-full');
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
    expect(button.className).toContain('btn-link');
    expect(button.className).toContain('btn-sm');
    expect(screen.getByTestId('suffix')).toBeInTheDocument();

    fireEvent.mouseEnter(button);
    expect(button.style.transform).toBe('var(--ds-button-hover-transform, translateY(-1px))');

    fireEvent.mouseDown(button);
    expect(button.style.transform).toBe('scale(0.98)');

    fireEvent.mouseUp(button);
    expect(button.style.transform).toBe('var(--ds-button-hover-transform, translateY(-1px))');

    fireEvent.focus(button);
    expect(button.style.boxShadow).toContain('var(--ds-color-primary-200');

    fireEvent.blur(button);
    expect(button.style.boxShadow).toBe('');

    fireEvent.mouseLeave(button);
    expect(button.style.transform).toBe('translateY(0)');

    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
