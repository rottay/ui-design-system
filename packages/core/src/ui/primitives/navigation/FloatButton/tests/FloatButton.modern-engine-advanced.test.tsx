import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import {
  BackTop as ModernBackTop,
  FloatButton as ModernFloatButton,
  Group as ModernFloatButtonGroup,
} from '../engines/modern';

describe('FloatButton modern advanced engine coverage', () => {
  it('covers modern button and anchor branches, tooltip guards, and badge rendering', () => {
    const handleClick = vi.fn();
    const { rerender } = render(
      <ModernFloatButton
        icon={<span aria-hidden="true">+</span>}
        description="Create"
        tooltip={{ title: 'rich tooltip' } as never}
        badge={{ dot: true, count: 128 }}
        onClick={handleClick}
        className="qa-fab"
      />
    );

    const button = screen.getByRole('button', { name: /create/i });
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
    expect(button).toHaveClass('btn', 'btn-circle', 'btn-ghost', 'bg-base-100', 'shadow-lg', 'qa-fab');
    expect(button).not.toHaveAttribute('title');
    expect(screen.getByText('99+')).toBeInTheDocument();
    expect(button.querySelector('.bg-error.rounded-full')).toBeTruthy();

    rerender(
      <ModernFloatButton
        href="https://example.com"
        target="_blank"
        description="Docs"
        tooltip="Open docs"
        type="default"
        shape="square"
      />
    );

    const link = screen.getByRole('link', { name: /docs/i });
    expect(link).toHaveClass('btn', 'rounded-lg', 'btn-ghost', 'bg-base-100');
    expect(link).toHaveAttribute('href', 'https://example.com');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('title', 'Open docs');
  });

  it('covers hover groups in both uncontrolled and controlled modes', () => {
    const onOpenChange = vi.fn();
    const { rerender } = render(
      <ModernFloatButtonGroup
        trigger="hover"
        icon={<span>?</span>}
        closeIcon={<span>×</span>}
        onOpenChange={onOpenChange}
      >
        <ModernFloatButton description="Child action" />
      </ModernFloatButtonGroup>
    );

    const uncontrolledRoot = screen.getByRole('button', { name: /\?/i }).parentElement;
    if (!(uncontrolledRoot instanceof HTMLElement)) {
      throw new Error('Expected uncontrolled group container');
    }

    fireEvent.mouseEnter(uncontrolledRoot);
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(screen.getByRole('button', { name: /×/i })).toBeInTheDocument();

    fireEvent.mouseLeave(uncontrolledRoot);
    expect(onOpenChange).toHaveBeenCalledWith(false);

    rerender(
      <ModernFloatButtonGroup
        trigger="hover"
        open
        icon={<span>?</span>}
        closeIcon={<span>×</span>}
        onOpenChange={onOpenChange}
      >
        <ModernFloatButton description="Controlled child" />
      </ModernFloatButtonGroup>
    );

    const controlledRoot = screen.getByRole('button', { name: /×/i }).parentElement;
    if (!(controlledRoot instanceof HTMLElement)) {
      throw new Error('Expected controlled group container');
    }

    expect(controlledRoot.querySelector('.opacity-100.translate-y-0')).toBeTruthy();
    fireEvent.mouseLeave(controlledRoot);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('covers custom target scroll containers and hidden-state branches for BackTop', async () => {
    const target = document.createElement('div');
    Object.defineProperty(target, 'scrollTop', {
      value: 0,
      writable: true,
      configurable: true,
    });
    target.scrollTo = vi.fn();

    const handleClick = vi.fn();
    const { rerender } = render(
      <ModernBackTop
        visibilityHeight={20}
        target={() => target}
        description="Back to top"
        onClick={handleClick}
        type="default"
        shape="square"
      />
    );

    expect(screen.queryByRole('button', { name: /back to top/i })).not.toBeInTheDocument();

    await act(async () => {
      target.scrollTop = 48;
      target.dispatchEvent(new Event('scroll'));
    });

    const button = screen.getByRole('button', { name: /back to top/i });
    fireEvent.click(button);

    expect(target.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
    expect(handleClick).toHaveBeenCalledTimes(1);
    expect(button).toHaveClass('btn', 'rounded-lg', 'btn-ghost', 'bg-base-100');

    rerender(
      <ModernBackTop
        visibilityHeight={50}
        target={() => target}
        description="Back to top"
      />
    );

    await act(async () => {
      target.scrollTop = 10;
      target.dispatchEvent(new Event('scroll'));
    });

    expect(screen.queryByRole('button', { name: /back to top/i })).not.toBeInTheDocument();
  });
});
