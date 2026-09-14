/**
 * The notifier lifetime holds while the pointer OR keyboard focus is inside the
 * surface, and those are independent reasons: leaving one does not release the
 * budget while the other still applies, `pauseOnHover={false}` disables only the
 * pointer reason, and whatever released the hold resumes the remaining time
 * rather than the full lifetime.
 */
import React from 'react';
import { act, fireEvent, renderHook, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { renderWithEngine } from '@tests/support/engine';
import { NotifierItem } from '../../../presentation/item';
import { useNotifierCountdown } from '..';

afterEach(() => {
  vi.useRealTimers();
  document.body.replaceChildren();
});

function focusEventTo(host: HTMLElement, next: Node | null): React.FocusEvent<HTMLElement> {
  return { relatedTarget: next, currentTarget: host } as unknown as React.FocusEvent<HTMLElement>;
}

function countdown(options: { pauseOnHover?: boolean; durationMs?: number; onExpire: () => void }) {
  const { durationMs = 1000, pauseOnHover = true, onExpire } = options;
  return renderHook(() => useNotifierCountdown({ durationMs, running: true, pauseOnHover, onExpire }));
}

describe('the pointer and keyboard focus hold the lifetime independently', () => {
  it('keeps the budget held after the pointer leaves while focus is still inside', () => {
    vi.useFakeTimers();
    const onExpire = vi.fn();
    const { result } = countdown({ onExpire });

    act(() => result.current.handlers.onMouseEnter?.());
    act(() => result.current.handlers.onFocus?.());
    act(() => result.current.handlers.onMouseLeave?.());
    act(() => void vi.advanceTimersByTime(1001));

    expect(onExpire).not.toHaveBeenCalled();
    expect(result.current.paused).toBe(true);
  });

  it('keeps the budget held after focus leaves while the pointer is still inside', () => {
    vi.useFakeTimers();
    const host = document.createElement('div');
    document.body.append(host);
    const onExpire = vi.fn();
    const { result } = countdown({ onExpire });

    act(() => result.current.handlers.onFocus?.());
    act(() => result.current.handlers.onMouseEnter?.());
    act(() => result.current.handlers.onBlur?.(focusEventTo(host, null)));
    act(() => void vi.advanceTimersByTime(1001));

    expect(onExpire).not.toHaveBeenCalled();
    expect(result.current.paused).toBe(true);

    act(() => result.current.handlers.onMouseLeave?.());
    act(() => void vi.advanceTimersByTime(1001));

    expect(onExpire).toHaveBeenCalledTimes(1);
  });

  it('holds the budget on keyboard focus even when the pointer reason is disabled', () => {
    vi.useFakeTimers();
    const onExpire = vi.fn();
    const { result } = countdown({ pauseOnHover: false, onExpire });

    expect(result.current.handlers.onFocus).toBeTypeOf('function');
    expect(result.current.handlers.onMouseEnter).toBeUndefined();
    expect(result.current.handlers.onMouseLeave).toBeUndefined();

    act(() => result.current.handlers.onFocus?.());
    act(() => void vi.advanceTimersByTime(1001));

    expect(onExpire).not.toHaveBeenCalled();
    expect(result.current.paused).toBe(true);
  });

  it('ignores a blur that hands focus to another child of the surface', () => {
    vi.useFakeTimers();
    const host = document.createElement('div');
    const child = document.createElement('button');
    host.append(child);
    document.body.append(host);
    const onExpire = vi.fn();
    const { result } = countdown({ onExpire });

    act(() => result.current.handlers.onFocus?.());
    act(() => result.current.handlers.onBlur?.(focusEventTo(host, child)));
    act(() => void vi.advanceTimersByTime(1001));

    expect(onExpire).not.toHaveBeenCalled();
    expect(result.current.paused).toBe(true);
  });

  it('resumes with the remaining budget and expires once', () => {
    vi.useFakeTimers();
    const host = document.createElement('div');
    document.body.append(host);
    const onExpire = vi.fn();
    const { result } = countdown({ onExpire });

    act(() => void vi.advanceTimersByTime(400));
    act(() => result.current.handlers.onFocus?.());
    act(() => void vi.advanceTimersByTime(5000));

    expect(onExpire).not.toHaveBeenCalled();

    act(() => result.current.handlers.onBlur?.(focusEventTo(host, null)));
    act(() => void vi.advanceTimersByTime(599));

    expect(onExpire).not.toHaveBeenCalled();

    act(() => void vi.advanceTimersByTime(2));
    act(() => void vi.advanceTimersByTime(5000));

    expect(onExpire).toHaveBeenCalledTimes(1);
  });
});

describe('the surface holds its lifetime for the focus inside it', () => {
  function renderSurface(props: { pauseOnHover?: boolean; onDismiss: () => void }) {
    renderWithEngine(
      <NotifierItem
        role="notification"
        tone="info"
        title="Held"
        duration={1000}
        closeLabel="Close"
        action={{ label: 'Undo', onClick: () => {} }}
        pauseOnHover={props.pauseOnHover}
        onDismiss={props.onDismiss}
      />,
      'modern',
    );
    return document.querySelector<HTMLElement>('.ds-notifier')!;
  }

  it('holds across an internal focus transfer and releases when focus leaves', () => {
    vi.useFakeTimers();
    const onDismiss = vi.fn();
    const root = renderSurface({ onDismiss });
    const undo = screen.getByRole('button', { name: 'Undo' });
    const close = screen.getByRole('button', { name: 'Close' });

    fireEvent.focusIn(undo);
    act(() => void vi.advanceTimersByTime(2000));

    expect(root).toHaveAttribute('data-paused', 'true');
    expect(root).toHaveAttribute('data-open', 'true');

    fireEvent.focusOut(undo, { relatedTarget: close });
    fireEvent.focusIn(close);
    act(() => void vi.advanceTimersByTime(2000));

    expect(root).toHaveAttribute('data-paused', 'true');
    expect(onDismiss).not.toHaveBeenCalled();

    fireEvent.focusOut(close, { relatedTarget: null });
    act(() => void vi.advanceTimersByTime(1001));

    expect(root).toHaveAttribute('data-paused', 'false');
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('does not resume on pointer exit while focus is still inside', () => {
    vi.useFakeTimers();
    const onDismiss = vi.fn();
    const root = renderSurface({ onDismiss });
    const undo = screen.getByRole('button', { name: 'Undo' });

    fireEvent.mouseEnter(root);
    fireEvent.focusIn(undo);
    fireEvent.mouseLeave(root);
    act(() => void vi.advanceTimersByTime(2000));

    expect(root).toHaveAttribute('data-paused', 'true');
    expect(onDismiss).not.toHaveBeenCalled();

    fireEvent.focusOut(undo, { relatedTarget: null });
    act(() => void vi.advanceTimersByTime(1001));

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('holds for keyboard focus with the pointer reason disabled', () => {
    vi.useFakeTimers();
    const onDismiss = vi.fn();
    const root = renderSurface({ pauseOnHover: false, onDismiss });
    const undo = screen.getByRole('button', { name: 'Undo' });

    fireEvent.focusIn(undo);
    act(() => void vi.advanceTimersByTime(2000));

    expect(root).toHaveAttribute('data-paused', 'true');
    expect(onDismiss).not.toHaveBeenCalled();

    fireEvent.focusOut(undo, { relatedTarget: null });
    act(() => void vi.advanceTimersByTime(1001));

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
