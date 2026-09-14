/**
 * Escape during IME composition belongs to the IME, not to the announcement.
 *
 * A notification or toast may carry a caller-owned text control. Escape
 * bubbles from it to the surface's local dismissal branch, which must consult
 * the same composition authority the overlay router and the field families
 * use: a composed Escape cancels the candidate and leaves the surface alone,
 * the plain Escape that follows dismisses. The message role opted out of
 * Escape dismissal altogether and stays that way.
 */
import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { NotificationInstance } from '../../notification/contracts';
import { NotificationItem, NotificationProvider, useNotification } from '../../notification/engines/modern';
import { MessageItem } from '../../message/engines/modern';
import ModernToast from '../../toast/engines/modern';

/** Window the governed exit reading yields when no motion is declared. */
const BUFFER_MS = 50;
/** The keydown a browser dispatches while an IME owns the key. */
const COMPOSING = { isComposing: true, keyCode: 229 } as const;
/** Safari reports only the legacy keyCode on the confirming keydown. */
const LEGACY_COMPOSING = { keyCode: 229 } as const;

afterEach(() => {
  vi.useRealTimers();
});

const root = () => document.querySelector<HTMLElement>('.ds-notifier')!;

describe('a notification with a caller input', () => {
  it('yields a composed Escape to the IME and dismisses on the plain one', () => {
    vi.useFakeTimers();
    const onClose = vi.fn();
    const onRemove = vi.fn();
    render(
      <NotificationItem
        id="ime"
        type="info"
        message="Reply"
        duration={0}
        onClose={onClose}
        onRemove={onRemove}
        actions={<input aria-label="Reply input" />}
      />,
    );
    const reply = screen.getByLabelText('Reply input') as HTMLInputElement;

    fireEvent.keyDown(reply, { key: 'Escape', ...COMPOSING });
    expect(onClose).not.toHaveBeenCalled();
    expect(root()).toHaveAttribute('data-open', 'true');

    fireEvent.keyDown(reply, { key: 'Escape', ...LEGACY_COMPOSING });
    expect(onClose).not.toHaveBeenCalled();

    fireEvent.change(reply, { target: { value: 'still editing' } });
    expect(reply.value).toBe('still editing');

    fireEvent.keyDown(reply, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(root()).toHaveAttribute('data-open', 'false');

    act(() => void vi.advanceTimersByTime(BUFFER_MS));
    expect(onRemove).toHaveBeenCalledWith('ime');
  });
});

describe('a notification opened through the provider with a caller input', () => {
  it('yields a composed Escape to the IME and dismisses on the plain one', () => {
    vi.useFakeTimers();
    const onClose = vi.fn();
    let api!: NotificationInstance;
    function Capture() {
      [api] = useNotification();
      return null;
    }
    render(
      <NotificationProvider>
        <Capture />
      </NotificationProvider>,
    );

    act(() => api.open({ key: 'ime', message: 'Reply', duration: 0, onClose, actions: <input aria-label="Reply input" /> }));
    const reply = screen.getByLabelText('Reply input') as HTMLInputElement;

    fireEvent.keyDown(reply, { key: 'Escape', ...COMPOSING });
    fireEvent.keyDown(reply, { key: 'Escape', ...LEGACY_COMPOSING });
    act(() => void vi.advanceTimersByTime(BUFFER_MS * 4));
    expect(onClose).not.toHaveBeenCalled();
    expect(root()).toHaveAttribute('data-open', 'true');
    expect(screen.getByText('Reply')).toBeInTheDocument();

    fireEvent.change(reply, { target: { value: 'still editing' } });
    expect(reply.value).toBe('still editing');

    fireEvent.keyDown(reply, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(root()).toHaveAttribute('data-open', 'false');

    act(() => void vi.advanceTimersByTime(BUFFER_MS));
    expect(screen.queryByText('Reply')).not.toBeInTheDocument();
  });
});

describe('a toast with a caller input', () => {
  it('yields a composed Escape to the IME and dismisses on the plain one', () => {
    vi.useFakeTimers();
    const onClose = vi.fn();
    render(
      <ModernToast title="Reply" closable visible duration={0} onClose={onClose}>
        <input aria-label="Reply input" />
      </ModernToast>,
    );
    const reply = screen.getByLabelText('Reply input') as HTMLInputElement;

    fireEvent.keyDown(reply, { key: 'Escape', ...COMPOSING });
    act(() => void vi.advanceTimersByTime(BUFFER_MS * 4));
    expect(onClose).not.toHaveBeenCalled();
    expect(root()).toHaveAttribute('data-open', 'true');

    fireEvent.keyDown(reply, { key: 'Escape', ...LEGACY_COMPOSING });
    act(() => void vi.advanceTimersByTime(BUFFER_MS * 4));
    expect(onClose).not.toHaveBeenCalled();

    fireEvent.change(reply, { target: { value: 'still editing' } });
    expect(reply.value).toBe('still editing');

    fireEvent.keyDown(reply, { key: 'Escape' });
    expect(root()).toHaveAttribute('data-open', 'false');

    act(() => void vi.advanceTimersByTime(BUFFER_MS));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Reply')).not.toBeInTheDocument();
  });
});

describe('a message stays out of Escape dismissal', () => {
  it('ignores a plain and a composed Escape alike and still closes from its control', () => {
    vi.useFakeTimers();
    const onClose = vi.fn();
    render(<MessageItem id="sync" type="info" content="Synced" duration={0} closable onClose={onClose} />);
    const close = screen.getByRole('button', { name: 'Close' });

    fireEvent.keyDown(close, { key: 'Escape', ...COMPOSING });
    fireEvent.keyDown(close, { key: 'Escape' });
    act(() => void vi.advanceTimersByTime(BUFFER_MS * 4));
    expect(onClose).not.toHaveBeenCalled();
    expect(root()).toHaveAttribute('data-open', 'true');

    fireEvent.click(close);
    expect(root()).toHaveAttribute('data-open', 'false');

    act(() => void vi.advanceTimersByTime(BUFFER_MS));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
