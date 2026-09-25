/**
 * The notifier surface's lifecycle across a refresh in place and an Escape
 * during IME composition.
 *
 * A stack owner that replaces an entry under a stable key keeps the same
 * surface mounted; the surface learns of the refresh through `revision`. A new
 * revision cancels a pending exit (manual or timed), shows the new content and
 * restarts the lifetime in full, so the obsolete exit window can never remove
 * the refreshed surface.
 *
 * Escape reaches the surface's local handler bubbled from a caller-owned
 * control. While an IME owns that keystroke it cancels a candidate, not the
 * surface: the local branch consults the same composition authority the
 * overlay router and the field families use.
 */
import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { NotifierItemProps } from '../../../contracts';
import { NotifierItem } from '..';

/** Window the governed exit reading yields when no motion is declared. */
const BUFFER_MS = 50;
/** The keydown a browser dispatches while an IME owns the key. */
const COMPOSING = { isComposing: true, keyCode: 229 } as const;
/** Safari reports only the legacy keyCode on the confirming keydown. */
const LEGACY_COMPOSING = { keyCode: 229 } as const;

afterEach(() => {
  vi.useRealTimers();
});

const BASE: NotifierItemProps = {
  role: 'notification',
  tone: 'info',
  title: 'Job queued',
  closeLabel: 'Close',
  duration: 0,
};

function surface(props: Partial<NotifierItemProps>) {
  const view = render(<NotifierItem {...BASE} {...props} />);
  const root = () => document.querySelector<HTMLElement>('.ds-notifier')!;
  const refresh = (next: Partial<NotifierItemProps>) => view.rerender(<NotifierItem {...BASE} {...props} {...next} />);
  return { ...view, root, refresh };
}

describe('a refresh in place re-arms the surface', () => {
  it('cancels a manual exit and keeps the refreshed surface', () => {
    vi.useFakeTimers();
    const onDismiss = vi.fn();
    const onExited = vi.fn();
    const { root, refresh } = surface({ revision: 1, onDismiss, onExited });

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(root()).toHaveAttribute('data-open', 'false');

    refresh({ revision: 2, title: 'Job running' });
    expect(root()).toHaveAttribute('data-open', 'true');
    expect(screen.getByText('Job running')).toBeInTheDocument();

    act(() => void vi.advanceTimersByTime(BUFFER_MS * 100));
    expect(onExited).not.toHaveBeenCalled();
    expect(screen.getByText('Job running')).toBeInTheDocument();
  });

  it('cancels a timed exit and restarts the lifetime in full', () => {
    vi.useFakeTimers();
    const onDismiss = vi.fn();
    const onExited = vi.fn();
    const { root, refresh } = surface({ revision: 1, duration: 1000, onDismiss, onExited });

    act(() => void vi.advanceTimersByTime(1000));
    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(root()).toHaveAttribute('data-open', 'false');

    act(() => void vi.advanceTimersByTime(20));
    refresh({ revision: 2, title: 'Job running' });
    expect(root()).toHaveAttribute('data-open', 'true');

    act(() => void vi.advanceTimersByTime(999));
    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(onExited).not.toHaveBeenCalled();
    expect(root()).toHaveAttribute('data-open', 'true');

    act(() => void vi.advanceTimersByTime(1));
    expect(onDismiss).toHaveBeenCalledTimes(2);
    expect(root()).toHaveAttribute('data-open', 'false');

    act(() => void vi.advanceTimersByTime(BUFFER_MS));
    expect(onExited).toHaveBeenCalledTimes(1);
  });

  it('restarts a running lifetime in full', () => {
    vi.useFakeTimers();
    const onDismiss = vi.fn();
    const { refresh } = surface({ revision: 1, duration: 1000, onDismiss });

    act(() => void vi.advanceTimersByTime(800));
    refresh({ revision: 2, title: 'Job running' });
    act(() => void vi.advanceTimersByTime(999));
    expect(onDismiss).not.toHaveBeenCalled();

    act(() => void vi.advanceTimersByTime(1));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('turns a leaving surface persistent when the refresh drops the lifetime', () => {
    vi.useFakeTimers();
    const onExited = vi.fn();
    const { root, refresh } = surface({ revision: 1, duration: 1000, onExited });

    act(() => void vi.advanceTimersByTime(1000));
    expect(root()).toHaveAttribute('data-open', 'false');

    refresh({ revision: 2, duration: 0, title: 'Job done' });
    expect(root()).toHaveAttribute('data-open', 'true');

    act(() => void vi.advanceTimersByTime(60_000));
    expect(onExited).not.toHaveBeenCalled();
    expect(screen.getByText('Job done')).toBeInTheDocument();
  });

  it('still dismisses ordinarily after a refresh', () => {
    vi.useFakeTimers();
    const onExited = vi.fn();
    const { root, refresh } = surface({ revision: 1, onExited });

    refresh({ revision: 2, title: 'Job running' });
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(root()).toHaveAttribute('data-open', 'false');

    act(() => void vi.advanceTimersByTime(BUFFER_MS));
    expect(onExited).toHaveBeenCalledTimes(1);
  });

  it('leaves the running budget alone when the same revision is re-sent', () => {
    vi.useFakeTimers();
    const onDismiss = vi.fn();
    const { refresh } = surface({ revision: 1, duration: 1000, onDismiss });

    act(() => void vi.advanceTimersByTime(800));
    refresh({ revision: 1, title: 'Job queued' });
    act(() => void vi.advanceTimersByTime(199));
    expect(onDismiss).not.toHaveBeenCalled();

    act(() => void vi.advanceTimersByTime(1));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});

describe('Escape inside a caller control yields to a live composition', () => {
  it.each([
    ['notification', { actions: <input aria-label="Reply" /> }],
    ['toast', { children: <input aria-label="Reply" /> }],
  ] as const)('keeps a %s surface while the IME owns the keystroke, then dismisses on the plain Escape', (role, slot) => {
    const onDismiss = vi.fn();
    const { root } = surface({ role, ...slot, onDismiss });
    const reply = screen.getByLabelText('Reply') as HTMLInputElement;

    fireEvent.keyDown(reply, { key: 'Escape', ...COMPOSING });
    expect(onDismiss).not.toHaveBeenCalled();
    expect(root()).toHaveAttribute('data-open', 'true');

    fireEvent.keyDown(reply, { key: 'Escape', ...LEGACY_COMPOSING });
    expect(onDismiss).not.toHaveBeenCalled();

    fireEvent.change(reply, { target: { value: 'still editing' } });
    expect(reply.value).toBe('still editing');

    fireEvent.keyDown(reply, { key: 'Escape' });
    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(root()).toHaveAttribute('data-open', 'false');
  });

  it('never dismisses on Escape when the role opted out, composed or not', () => {
    const onDismiss = vi.fn();
    const { root } = surface({ role: 'message', dismissOnEscape: false, onDismiss });
    const close = screen.getByRole('button', { name: 'Close' });

    fireEvent.keyDown(close, { key: 'Escape', ...COMPOSING });
    fireEvent.keyDown(close, { key: 'Escape' });
    expect(onDismiss).not.toHaveBeenCalled();
    expect(root()).toHaveAttribute('data-open', 'true');

    fireEvent.click(close);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('never dismisses an unclosable surface on Escape', () => {
    const onDismiss = vi.fn();
    const { root } = surface({ closable: false, actions: <input aria-label="Reply" />, onDismiss });

    fireEvent.keyDown(screen.getByLabelText('Reply'), { key: 'Escape' });
    expect(onDismiss).not.toHaveBeenCalled();
    expect(root()).toHaveAttribute('data-open', 'true');
  });
});
