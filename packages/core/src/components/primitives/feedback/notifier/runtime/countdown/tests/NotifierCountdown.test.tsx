/**
 * The notifier lifetime holds while the pointer OR keyboard focus is inside the
 * surface, and those are independent reasons: leaving one does not release the
 * budget while the other still applies, `pauseOnHover={false}` disables only the
 * pointer reason, and whatever released the hold resumes the remaining time
 * rather than the full lifetime.
 */
import React from 'react';
import { act, fireEvent, render, renderHook, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { renderWithEngine } from '@tests/support/engine';
import { NotificationItem } from '../../../../notification/engines/modern';
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

describe('a replaced duration is a whole new budget', () => {
  type Replaceable = { durationMs: number; revision?: number };

  function replaceable(initial: Replaceable, onExpire: () => void) {
    return renderHook(
      ({ durationMs, revision }: Replaceable) =>
        useNotifierCountdown({ durationMs, revision, running: true, pauseOnHover: true, onExpire }),
      { initialProps: initial },
    );
  }

  it('grants a longer replacement its full lifetime instead of charging the old elapsed to it', () => {
    vi.useFakeTimers();
    const onExpire = vi.fn();
    const { rerender } = replaceable({ durationMs: 1000 }, onExpire);

    act(() => void vi.advanceTimersByTime(800));
    rerender({ durationMs: 2000 });
    act(() => void vi.advanceTimersByTime(1999));

    expect(onExpire).not.toHaveBeenCalled();

    act(() => void vi.advanceTimersByTime(1));

    expect(onExpire).toHaveBeenCalledTimes(1);
  });

  it('grants a shorter replacement its full lifetime as well', () => {
    vi.useFakeTimers();
    const onExpire = vi.fn();
    const { rerender } = replaceable({ durationMs: 1000 }, onExpire);

    act(() => void vi.advanceTimersByTime(300));
    rerender({ durationMs: 500 });
    act(() => void vi.advanceTimersByTime(499));

    expect(onExpire).not.toHaveBeenCalled();

    act(() => void vi.advanceTimersByTime(1));

    expect(onExpire).toHaveBeenCalledTimes(1);
  });

  it('runs a replacement made while paused in full once the hold is released', () => {
    vi.useFakeTimers();
    const host = document.createElement('div');
    document.body.append(host);
    const onExpire = vi.fn();
    const { result, rerender } = replaceable({ durationMs: 1000 }, onExpire);

    act(() => void vi.advanceTimersByTime(300));
    act(() => result.current.handlers.onFocus?.());
    act(() => void vi.advanceTimersByTime(200));
    rerender({ durationMs: 2000 });
    act(() => void vi.advanceTimersByTime(5000));

    expect(onExpire).not.toHaveBeenCalled();
    expect(result.current.paused).toBe(true);

    act(() => result.current.handlers.onBlur?.(focusEventTo(host, null)));
    act(() => void vi.advanceTimersByTime(1999));

    expect(onExpire).not.toHaveBeenCalled();

    act(() => void vi.advanceTimersByTime(1));

    expect(onExpire).toHaveBeenCalledTimes(1);
  });

  it('turns a persistent surface into a timed one from the replacement alone', () => {
    vi.useFakeTimers();
    const onExpire = vi.fn();
    const { rerender } = replaceable({ durationMs: 0 }, onExpire);

    act(() => void vi.advanceTimersByTime(5000));
    rerender({ durationMs: 3000 });
    act(() => void vi.advanceTimersByTime(2999));

    expect(onExpire).not.toHaveBeenCalled();

    act(() => void vi.advanceTimersByTime(1));

    expect(onExpire).toHaveBeenCalledTimes(1);
  });

  it('turns a timed surface persistent and never expires it', () => {
    vi.useFakeTimers();
    const onExpire = vi.fn();
    const { rerender } = replaceable({ durationMs: 1000 }, onExpire);

    act(() => void vi.advanceTimersByTime(800));
    rerender({ durationMs: 0 });
    act(() => void vi.advanceTimersByTime(60_000));

    expect(onExpire).not.toHaveBeenCalled();
  });

  it('keeps the running budget when the same duration is sent again', () => {
    vi.useFakeTimers();
    const onExpire = vi.fn();
    const { rerender } = replaceable({ durationMs: 1000 }, onExpire);

    act(() => void vi.advanceTimersByTime(800));
    rerender({ durationMs: 1000 });
    act(() => void vi.advanceTimersByTime(199));

    expect(onExpire).not.toHaveBeenCalled();

    act(() => void vi.advanceTimersByTime(1));

    expect(onExpire).toHaveBeenCalledTimes(1);
  });

  it('still holds the replacement for every pause reason that remains', () => {
    vi.useFakeTimers();
    const host = document.createElement('div');
    document.body.append(host);
    const onExpire = vi.fn();
    const { result, rerender } = replaceable({ durationMs: 1000 }, onExpire);

    act(() => result.current.handlers.onMouseEnter?.());
    act(() => result.current.handlers.onFocus?.());
    rerender({ durationMs: 2000 });
    act(() => result.current.handlers.onMouseLeave?.());
    act(() => void vi.advanceTimersByTime(5000));

    expect(onExpire).not.toHaveBeenCalled();
    expect(result.current.paused).toBe(true);

    act(() => result.current.handlers.onBlur?.(focusEventTo(host, null)));
    act(() => void vi.advanceTimersByTime(1999));

    expect(onExpire).not.toHaveBeenCalled();

    act(() => void vi.advanceTimersByTime(1));

    expect(onExpire).toHaveBeenCalledTimes(1);
  });

  it('restarts a running lifetime in full when the surface is refreshed in place', () => {
    vi.useFakeTimers();
    const onExpire = vi.fn();
    const { rerender } = replaceable({ durationMs: 1000, revision: 1 }, onExpire);

    act(() => void vi.advanceTimersByTime(800));
    rerender({ durationMs: 1000, revision: 2 });
    act(() => void vi.advanceTimersByTime(999));

    expect(onExpire).not.toHaveBeenCalled();

    act(() => void vi.advanceTimersByTime(1));

    expect(onExpire).toHaveBeenCalledTimes(1);
  });

  it('leaves the running budget alone when the same revision is sent again', () => {
    vi.useFakeTimers();
    const onExpire = vi.fn();
    const { rerender } = replaceable({ durationMs: 1000, revision: 1 }, onExpire);

    act(() => void vi.advanceTimersByTime(800));
    rerender({ durationMs: 1000, revision: 1 });
    act(() => void vi.advanceTimersByTime(199));

    expect(onExpire).not.toHaveBeenCalled();

    act(() => void vi.advanceTimersByTime(1));

    expect(onExpire).toHaveBeenCalledTimes(1);
  });
});

describe('the public notification item grants a replacement its full lifetime', () => {
  it('does not close the replacement on what was left of the old budget', () => {
    vi.useFakeTimers();
    const onClose = vi.fn();
    const { rerender } = render(<NotificationItem id="duration" type="info" message="Before" duration={1} onClose={onClose} />);

    act(() => void vi.advanceTimersByTime(800));
    rerender(<NotificationItem id="duration" type="info" message="Updated" duration={2} onClose={onClose} />);
    act(() => void vi.advanceTimersByTime(1999));

    expect(onClose).not.toHaveBeenCalled();
    expect(document.querySelector('.ds-notifier')).toHaveAttribute('data-open', 'true');

    act(() => void vi.advanceTimersByTime(1));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(document.querySelector('.ds-notifier')).toHaveAttribute('data-open', 'false');
  });
});
