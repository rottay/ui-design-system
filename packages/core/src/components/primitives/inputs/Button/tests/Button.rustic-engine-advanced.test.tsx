import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import RusticButton from '../engines/rustic';

describe('RusticButton advanced runtime coverage', () => {
  it.each([
    ['xs', '12'],
    ['sm', '12'],
    ['md', '14'],
    ['lg', '18'],
    ['xl', '18'],
  ] as const)('renders the loading spinner size for %s buttons', (size, expectedSize) => {
    const { container } = render(
      <RusticButton size={size} loading>
        Loading
      </RusticButton>
    );

    const spinner = container.querySelector('svg');
    expect(spinner).toHaveAttribute('width', expectedSize);
    expect(spinner).toHaveAttribute('height', expectedSize);
  });

  it('covers the anchor branch, end-icon rendering, and interactive hover states', async () => {
    render(
      <RusticButton
        href="/events"
        target="_blank"
        variant="link"
        icon={<span data-testid="end-icon">I</span>}
        iconPosition="end"
        prefix={<span data-testid="prefix">P</span>}
        suffix={<span data-testid="suffix">S</span>}
      >
        Open event
      </RusticButton>
    );

    const link = screen.getByRole('link', { name: /open event/i });
    expect(link).toHaveAttribute('href', '/events');
    expect(link).toHaveAttribute('target', '_blank');
    expect(screen.getByTestId('prefix')).toBeInTheDocument();
    expect(screen.getByTestId('suffix')).toBeInTheDocument();
    expect(screen.getByTestId('end-icon')).toBeInTheDocument();

    fireEvent.pointerEnter(link);
    expect(link.style.textDecoration).toBe('underline');

    fireEvent.pointerDown(link);
    expect(link.style.transform).toContain('var(--ds-button-active-transform');

    fireEvent.pointerUp(link);
    fireEvent.pointerLeave(link);
    expect(link.style.transform).toBe('translateY(0) scale(1)');
  });

  it('covers dashed, outline/default border logic and full-width circle sizing', () => {
    const { rerender } = render(<RusticButton variant="dashed">Dashed</RusticButton>);
    let button = screen.getByRole('button', { name: /dashed/i });
    expect((button as HTMLButtonElement).style.border).toContain('dashed');

    rerender(
      <RusticButton variant="outline" shape="circle" fullWidth>
        O
      </RusticButton>
    );
    button = screen.getByRole('button', { name: 'O' });
    expect((button as HTMLButtonElement).style.border).toContain('solid');
    expect(button).toHaveStyle({ width: '100%', padding: '0px' });

    rerender(<RusticButton variant="default">Default</RusticButton>);
    button = screen.getByRole('button', { name: /default/i });
    expect((button as HTMLButtonElement).style.border).toContain('solid');
  });

  it('covers danger override, gradient, pulse, shadow, disabled and loading branches on the button path', async () => {
    const handleClick = vi.fn();

    const { rerender } = render(
      <RusticButton
        variant="secondary"
        danger
        shadow
        gradient
        pulse
        bordered
        onClick={handleClick}
      >
        Save
      </RusticButton>
    );

    const button = screen.getByRole('button', { name: /save/i });
    expect(button.className).toContain('rottay-button--danger');
    expect(button.className).toContain('rottay-button--shadow');
    expect(button.className).toContain('rottay-button--gradient');
    expect(button).toHaveStyle({ animation: 'rottay-button-pulse 2s infinite' });
    expect(button.style.boxShadow).toContain('rgba(0, 0, 0');

    rerender(
      <RusticButton
        variant="secondary"
        danger
        gradient
        pulse
        bordered
        onClick={handleClick}
      >
        Save
      </RusticButton>
    );

    fireEvent.focus(screen.getByRole('button', { name: /save/i }));
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /save/i }).style.boxShadow).toContain('var(--ds-button-focus-ring');
    });

    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    expect(handleClick).toHaveBeenCalledTimes(1);

    rerender(
      <RusticButton loading onClick={handleClick} suffix={<span data-testid="suffix">S</span>}>
        Save
      </RusticButton>
    );

    const loadingButton = screen.getByRole('button', { name: /save/i });
    expect(loadingButton).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByTestId('suffix')).toBeInTheDocument();
    fireEvent.click(loadingButton);
    expect(handleClick).toHaveBeenCalledTimes(1);

    rerender(
      <RusticButton disabled onClick={handleClick}>
        Save
      </RusticButton>
    );
    expect(screen.getByRole('button', { name: /save/i })).toBeDisabled();
  });

  it('keeps href buttons on the native button path when loading or disabled and honors start icons + htmlType', () => {
    const handleClick = vi.fn();
    const { rerender } = render(
      <RusticButton
        href="/billing"
        loading
        htmlType="submit"
        icon={<span data-testid="start-icon">I</span>}
        iconPosition="start"
        onClick={handleClick}
      >
        Billing
      </RusticButton>
    );

    const loadingButton = screen.getByRole('button', { name: /billing/i });
    expect(loadingButton).toHaveAttribute('type', 'submit');
    expect(screen.queryByRole('link', { name: /billing/i })).not.toBeInTheDocument();
    expect(screen.queryByTestId('start-icon')).not.toBeInTheDocument();

    fireEvent.click(loadingButton);
    expect(handleClick).not.toHaveBeenCalled();

    rerender(
      <RusticButton
        href="/billing"
        disabled
        icon={<span data-testid="start-icon">I</span>}
        iconPosition="start"
        onClick={handleClick}
      >
        Billing
      </RusticButton>
    );

    const disabledButton = screen.getByRole('button', { name: /billing/i });
    expect(disabledButton).toBeDisabled();
    expect(screen.getByTestId('start-icon')).toBeInTheDocument();

    fireEvent.click(disabledButton);
    expect(handleClick).not.toHaveBeenCalled();
  });
});
