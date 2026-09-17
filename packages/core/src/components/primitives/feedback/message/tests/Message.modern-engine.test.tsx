/**
 * Message modern engine -- live-region and lifecycle coverage (K1 Lane C).
 *
 * The stack container is the polite live region (role="log",
 * aria-live="polite", rustic parity); each item keeps role="alert" with a
 * polite announcement posture. Dismissal and expiry route through the skin's
 * exit animation (data-open='false') before the node is removed, so the stack
 * never witnesses an abrupt disappearance.
 */
import React from 'react';
import { act, fireEvent, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { MessageItem as ModernMessageItem, MessageProvider } from '../engines/modern';
import { renderWithEngine } from '@tests/support/engine';

describe('Message modern engine live region + lifecycle', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('announces through a polite log stack with alert items', () => {
    renderWithEngine(
      <MessageProvider placement="top">
        <span>child</span>
      </MessageProvider>,
      'modern',
    );

    const stack = screen.getByRole('log');
    expect(stack).toHaveAttribute('data-part', 'stack');
    expect(stack).toHaveAttribute('data-variant', 'message');
    expect(stack).toHaveAttribute('aria-live', 'polite');
    expect(stack).toHaveAttribute('data-placement', 'top');
  });

  it('stack joins the overlay stack and carries the notification band', () => {
    renderWithEngine(
      <MessageProvider>
        <span>child</span>
      </MessageProvider>,
      'modern',
    );

    const stack = screen.getByRole('log');
    expect(stack).toHaveAttribute('data-overlay-kind', 'toast');
    expect(stack.getAttribute('data-overlay-layer')).toBeTruthy();
    expect(stack.style.getPropertyValue('--ds-notifier-layer')).toBe(
      'var(--ds-z-index-notification)',
    );
  });

  it('item keeps role=alert with a polite announcement posture', () => {
    renderWithEngine(
      <ModernMessageItem id="m1" type="success" content="Saved" duration={0} />,
      'modern',
    );

    const item = screen.getByRole('alert');
    expect(item).toHaveAttribute('aria-live', 'polite');
    expect(item).toHaveAttribute('data-tone', 'success');
    expect(item).toHaveAttribute('data-open', 'true');
    expect(item).toHaveAttribute('data-variant', 'message');
  });

  it('dismiss stamps the exit state before removal (no abrupt disappearance)', () => {
    vi.useFakeTimers();
    const onRemove = vi.fn();
    renderWithEngine(
      <ModernMessageItem id="m2" type="info" content="Dismiss me" duration={0} closable onRemove={onRemove} />,
      'modern',
    );

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));

    // Exit animation in flight: node still mounted, stamped data-open='false'.
    const exiting = screen.getByRole('alert');
    expect(exiting).toHaveAttribute('data-open', 'false');
    expect(onRemove).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(onRemove).toHaveBeenCalledWith('m2');
  });

  it('auto-expiry routes through the same exit lifecycle', () => {
    vi.useFakeTimers();
    const onRemove = vi.fn();
    renderWithEngine(
      <ModernMessageItem id="m3" type="warning" content="Expiring" duration={1} onRemove={onRemove} />,
      'modern',
    );

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByRole('alert')).toHaveAttribute('data-open', 'false');
    expect(onRemove).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(onRemove).toHaveBeenCalledWith('m3');
  });

  it('loading type exposes the built-in spinner hatch for the skin ring', () => {
    const { container } = renderWithEngine(
      <ModernMessageItem id="m4" type="loading" content="Working" duration={0} />,
      'modern',
    );

    expect(container.querySelector('[data-part="spinner"]')).not.toBeNull();
    expect(screen.getByRole('alert')).toHaveAttribute('data-tone', 'loading');
  });
});
