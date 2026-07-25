/**
 * Message modern engine -- live-region and lifecycle coverage (K1 Lane C).
 *
 * The stack container is the polite live region (role="log",
 * aria-live="polite", rustic parity); each item keeps role="alert" with a
 * polite announcement posture. Dismissal and expiry route through the skin's
 * exit animation (data-state='exit') before the node is removed, so the stack
 * never witnesses an abrupt disappearance.
 */
import React from 'react';
import { act, fireEvent, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { MessageItem as ModernMessageItem, MessageProvider } from '../engines/modern';
import { renderWithEngine } from '@/tooling/testing/helpers/engine';

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
    expect(stack).toHaveAttribute('data-part', 'stack-container');
    expect(stack).toHaveAttribute('aria-live', 'polite');
    expect(stack).toHaveAttribute('data-placement', 'top');
  });

  it('item keeps role=alert with a polite announcement posture', () => {
    renderWithEngine(
      <ModernMessageItem id="m1" type="success" content="Saved" duration={0} />,
      'modern',
    );

    const item = screen.getByRole('alert');
    expect(item).toHaveAttribute('aria-live', 'polite');
    expect(item).toHaveAttribute('data-tone', 'success');
    expect(item).toHaveAttribute('data-state', 'enter');
  });

  it('dismiss stamps the exit state before removal (no abrupt disappearance)', () => {
    vi.useFakeTimers();
    const onRemove = vi.fn();
    renderWithEngine(
      <ModernMessageItem id="m2" type="info" content="Dismiss me" duration={0} closable onRemove={onRemove} />,
      'modern',
    );

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));

    // Exit animation in flight: node still mounted, stamped data-state='exit'.
    const exiting = screen.getByRole('alert');
    expect(exiting).toHaveAttribute('data-state', 'exit');
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
    expect(screen.getByRole('alert')).toHaveAttribute('data-state', 'exit');
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

    expect(container.querySelector('[data-icon="spinner"]')).not.toBeNull();
    expect(screen.getByRole('alert')).toHaveAttribute('data-tone', 'loading');
  });
});
