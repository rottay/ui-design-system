/**
 * A keyed refresh through the public role providers re-arms the one mounted
 * surface: it cancels a manual or timed exit, shows the new content, restarts
 * the intended lifetime, and the obsolete exit window can never remove it.
 * Ordinary dismissal and explicit destroy keep working around a refresh.
 */
import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { NotificationInstance } from '../../notification/contracts';
import { NotificationProvider, useNotification } from '../../notification/engines/modern';
import type { MessageInstance } from '../../message/contracts';
import { MessageProvider, useMessage } from '../../message/engines/modern';

/** Window the governed exit reading yields when no motion is declared. */
const BUFFER_MS = 50;

afterEach(() => {
  vi.useRealTimers();
});

function notifications() {
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
  return { api: () => api, root: () => document.querySelector<HTMLElement>('.ds-notifier') };
}

function messages() {
  let api!: MessageInstance;
  function Capture() {
    [api] = useMessage();
    return null;
  }
  render(
    <MessageProvider>
      <Capture />
    </MessageProvider>,
  );
  return { api: () => api, root: () => document.querySelector<HTMLElement>('.ds-notifier') };
}

describe('a keyed notification refresh survives the exit it interrupts', () => {
  it('cancels a manual exit and keeps the refreshed persistent notification', () => {
    vi.useFakeTimers();
    const { api, root } = notifications();

    act(() => api().open({ key: 'job', message: 'Before', duration: 0 }));
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(root()).toHaveAttribute('data-open', 'false');

    act(() => api().open({ key: 'job', message: 'Refreshed', duration: 0 }));
    expect(screen.getByText('Refreshed')).toBeInTheDocument();
    expect(root()).toHaveAttribute('data-open', 'true');

    act(() => void vi.advanceTimersByTime(BUFFER_MS * 100));
    expect(screen.getByText('Refreshed')).toBeInTheDocument();
    expect(screen.queryByText('Before')).not.toBeInTheDocument();
  });

  it('cancels a timed exit, restarts the lifetime and closes once on the new budget', () => {
    vi.useFakeTimers();
    const before = vi.fn();
    const after = vi.fn();
    const { api, root } = notifications();

    act(() => api().open({ key: 'job', message: 'Before', duration: 1, onClose: before }));
    act(() => void vi.advanceTimersByTime(1000));
    expect(before).toHaveBeenCalledTimes(1);
    expect(root()).toHaveAttribute('data-open', 'false');

    act(() => api().open({ key: 'job', message: 'Refreshed', duration: 1, onClose: after }));
    expect(root()).toHaveAttribute('data-open', 'true');

    act(() => void vi.advanceTimersByTime(999));
    expect(screen.getByText('Refreshed')).toBeInTheDocument();
    expect(after).not.toHaveBeenCalled();

    act(() => void vi.advanceTimersByTime(1));
    expect(after).toHaveBeenCalledTimes(1);
    expect(before).toHaveBeenCalledTimes(1);
    expect(root()).toHaveAttribute('data-open', 'false');

    act(() => void vi.advanceTimersByTime(BUFFER_MS));
    expect(screen.queryByText('Refreshed')).not.toBeInTheDocument();
  });

  it('restarts the lifetime of a running notification refreshed without a duration change', () => {
    vi.useFakeTimers();
    const before = vi.fn();
    const after = vi.fn();
    const { api, root } = notifications();

    act(() => api().open({ key: 'job', message: 'Before', duration: 1, onClose: before }));
    act(() => void vi.advanceTimersByTime(800));
    expect(root()).toHaveAttribute('data-open', 'true');

    act(() => api().open({ key: 'job', message: 'Refreshed', duration: 1, onClose: after }));
    act(() => void vi.advanceTimersByTime(999));
    expect(screen.getByText('Refreshed')).toBeInTheDocument();
    expect(before).not.toHaveBeenCalled();
    expect(after).not.toHaveBeenCalled();
    expect(root()).toHaveAttribute('data-open', 'true');

    act(() => void vi.advanceTimersByTime(1));
    expect(after).toHaveBeenCalledTimes(1);
    expect(before).not.toHaveBeenCalled();
    expect(root()).toHaveAttribute('data-open', 'false');

    act(() => void vi.advanceTimersByTime(BUFFER_MS));
    expect(screen.queryByText('Refreshed')).not.toBeInTheDocument();
  });

  it('turns a leaving notification persistent when the refresh drops the lifetime', () => {
    vi.useFakeTimers();
    const { api, root } = notifications();

    act(() => api().open({ key: 'job', message: 'Working', duration: 1 }));
    act(() => void vi.advanceTimersByTime(1000));
    expect(root()).toHaveAttribute('data-open', 'false');

    act(() => api().open({ key: 'job', message: 'Done', duration: 0 }));
    act(() => void vi.advanceTimersByTime(60_000));
    expect(screen.getByText('Done')).toBeInTheDocument();
    expect(root()).toHaveAttribute('data-open', 'true');
  });

  it('still dismisses ordinarily after a refresh', () => {
    vi.useFakeTimers();
    const { api, root } = notifications();

    act(() => api().open({ key: 'job', message: 'Before', duration: 0 }));
    act(() => api().open({ key: 'job', message: 'Refreshed', duration: 0 }));
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(root()).toHaveAttribute('data-open', 'false');

    act(() => void vi.advanceTimersByTime(BUFFER_MS));
    expect(screen.queryByText('Refreshed')).not.toBeInTheDocument();
  });

  it('still destroys explicitly, by key and altogether, after a refresh', () => {
    vi.useFakeTimers();
    const { api } = notifications();

    act(() => api().open({ key: 'job', message: 'Before', duration: 0 }));
    act(() => api().open({ key: 'job', message: 'Refreshed', duration: 0 }));
    act(() => api().open({ key: 'other', message: 'Other', duration: 0 }));
    act(() => api().destroy('job'));
    expect(screen.queryByText('Refreshed')).not.toBeInTheDocument();
    expect(screen.getByText('Other')).toBeInTheDocument();

    act(() => api().destroy());
    expect(screen.queryByText('Other')).not.toBeInTheDocument();
  });

  it('keeps a key destroyed and reopened in one batch while it was leaving', () => {
    vi.useFakeTimers();
    const { api, root } = notifications();

    act(() => api().open({ key: 'job', message: 'Before', duration: 0 }));
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(root()).toHaveAttribute('data-open', 'false');

    act(() => {
      api().destroy('job');
      api().open({ key: 'job', message: 'Again', duration: 0 });
    });
    expect(root()).toHaveAttribute('data-open', 'true');

    act(() => void vi.advanceTimersByTime(BUFFER_MS * 100));
    expect(screen.getByText('Again')).toBeInTheDocument();
  });
});

describe('a keyed message refresh survives the exit it interrupts', () => {
  it('cancels a manual exit and keeps the refreshed message', () => {
    vi.useFakeTimers();
    const { api, root } = messages();

    act(() => void api().loading({ content: 'Working', key: 'job', duration: 0, closable: true }));
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(root()).toHaveAttribute('data-open', 'false');

    act(() => void api().success({ content: 'Done', key: 'job', duration: 0, closable: true }));
    expect(screen.getByText('Done')).toBeInTheDocument();
    expect(root()).toHaveAttribute('data-open', 'true');

    act(() => void vi.advanceTimersByTime(BUFFER_MS * 100));
    expect(screen.getByText('Done')).toBeInTheDocument();
  });

  it('restarts the lifetime of a message refreshed during its timed exit', () => {
    vi.useFakeTimers();
    const { api, root } = messages();

    act(() => void api().loading({ content: 'Working', key: 'job', duration: 1 }));
    act(() => void vi.advanceTimersByTime(1000));
    expect(root()).toHaveAttribute('data-open', 'false');

    act(() => void api().success({ content: 'Done', key: 'job', duration: 1 }));
    expect(root()).toHaveAttribute('data-open', 'true');

    act(() => void vi.advanceTimersByTime(999));
    expect(root()).toHaveAttribute('data-open', 'true');

    act(() => void vi.advanceTimersByTime(1));
    expect(root()).toHaveAttribute('data-open', 'false');

    act(() => void vi.advanceTimersByTime(BUFFER_MS));
    expect(screen.queryByText('Done')).not.toBeInTheDocument();
  });
});
