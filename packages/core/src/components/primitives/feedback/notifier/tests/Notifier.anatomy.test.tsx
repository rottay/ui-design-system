/**
 * Notifier anatomy: every role entry point renders the one `ds-notifier`
 * surface, stamps its role and tone, carries only runtime channels inline, and
 * its stacks carry the caller's placement and edge offset as channels.
 */
import React, { useEffect } from 'react';
import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { renderWithEngine } from '@tests/support/engine';
import ModernToast from '../../toast/engines/modern';
import {
  NotificationItem as ModernNotificationItem,
  NotificationProvider as ModernNotificationProvider,
  useNotification as useModernNotification,
} from '../../notification/engines/modern';
import {
  MessageItem as ModernMessageItem,
  MessageProvider as ModernMessageProvider,
  useMessage as useModernMessage,
} from '../../message/engines/modern';
import { NotifierItem } from '..';

afterEach(() => {
  vi.useRealTimers();
});

function expectNoInlinePaint(root: HTMLElement) {
  const declared = Array.from({ length: root.style.length }, (_, index) => root.style.item(index));
  for (const property of declared) expect(property).toMatch(/^--ds-notifier-/);
}

describe('one surface for every role', () => {
  it.each([
    ['default', 'neutral'],
    ['success', 'success'],
    ['error', 'error'],
    ['warning', 'warning'],
    ['info', 'info'],
    ['primary', 'primary'],
    ['secondary', 'secondary'],
    ['gradient', 'gradient'],
  ] as const)('a %s toast is a toast-role surface on the %s tone', (variant, tone) => {
    renderWithEngine(<ModernToast variant={variant} title="Notice" duration={0} visible />, 'modern');
    const root = screen.getByRole('alert');
    expect(root).toHaveClass('ds-notifier', 'ds-notifier--modern');
    expect(root).toHaveAttribute('data-part', 'root');
    expect(root).toHaveAttribute('data-variant', 'toast');
    expect(root).toHaveAttribute('data-tone', tone);
    expectNoInlinePaint(root);
  });

  it('a notification is a notification-role surface announced by its urgency', () => {
    renderWithEngine(
      <>
        <ModernNotificationItem id="n1" type="success" message="Saved" duration={3} />
        <ModernNotificationItem id="n2" type="error" message="Failed" duration={0} />
      </>,
      'modern',
    );
    const saved = screen.getByRole('status');
    expect(saved).toHaveAttribute('data-variant', 'notification');
    expect(saved).toHaveAttribute('data-tone', 'success');
    expect(saved.style.getPropertyValue('--ds-notifier-lifetime')).toBe('3000ms');
    expectNoInlinePaint(saved);
    expect(screen.getByRole('alert')).toHaveAttribute('data-tone', 'error');
  });

  it('a message is a message-role surface', () => {
    renderWithEngine(<ModernMessageItem id="m1" type="loading" content="Working" duration={0} />, 'modern');
    const root = screen.getByRole('alert');
    expect(root).toHaveAttribute('data-variant', 'message');
    expect(root).toHaveAttribute('data-tone', 'loading');
    expect(root.querySelector('[data-part="spinner"]')).not.toBeNull();
    expect(root.getAttribute('style')).toBeNull();
  });

  it('decides its controls through the interaction kernel', () => {
    renderWithEngine(
      <NotifierItem role="toast" tone="info" title="Saved" duration={0} closeLabel="Close" action={{ label: 'Undo', onClick: () => {} }} />,
      'modern',
    );
    const close = screen.getByRole('button', { name: 'Close' });
    fireEvent.pointerEnter(close);
    expect(close).toHaveAttribute('data-state', 'hovered');
    expect(screen.getByRole('button', { name: 'Undo' })).toHaveAttribute('data-part', 'action');
  });

  it('pauses its lifetime while the pointer or focus is inside it', () => {
    vi.useFakeTimers();
    const onExited = vi.fn();
    renderWithEngine(
      <NotifierItem role="notification" tone="info" title="Held" duration={1000} closeLabel="Close" onExited={onExited} />,
      'modern',
    );
    const root = document.querySelector<HTMLElement>('.ds-notifier')!;
    fireEvent.mouseEnter(root);
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(root).toHaveAttribute('data-paused', 'true');
    expect(root).toHaveAttribute('data-open', 'true');
    fireEvent.mouseLeave(root);
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(root).toHaveAttribute('data-open', 'false');
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(onExited).toHaveBeenCalledTimes(1);
  });
});

describe('stacks', () => {
  function NotificationHarness({ onReady }: { onReady: (api: ReturnType<typeof useModernNotification>[0]) => void }) {
    const [api] = useModernNotification();
    useEffect(() => {
      onReady(api);
    }, [api, onReady]);
    return null;
  }

  function MessageHarness({ onReady }: { onReady: (api: ReturnType<typeof useModernMessage>[0]) => void }) {
    const [api] = useModernMessage();
    useEffect(() => {
      onReady(api);
    }, [api, onReady]);
    return null;
  }

  it('places notification stacks on logical edges with their offsets as channels', async () => {
    let api: ReturnType<typeof useModernNotification>[0] | undefined;
    renderWithEngine(
      <ModernNotificationProvider placement="topLeft" top={12} bottom={20}>
        <NotificationHarness onReady={(ready) => (api = ready)} />
      </ModernNotificationProvider>,
      'modern',
    );
    await waitFor(() => expect(api).toBeDefined());
    act(() => {
      api!.info({ message: 'Start', duration: 0 });
      api!.error({ message: 'End', duration: 0, placement: 'bottomRight' });
    });
    await screen.findByText('End');
    const start = document.querySelector<HTMLElement>('.ds-notifier-stack[data-placement="top-start"]')!;
    const end = document.querySelector<HTMLElement>('.ds-notifier-stack[data-placement="bottom-end"]')!;
    expect(start).toHaveAttribute('data-variant', 'notification');
    expect(start.style.getPropertyValue('--ds-notifier-stack-offset')).toBe('12px');
    expect(end.style.getPropertyValue('--ds-notifier-stack-offset')).toBe('20px');
    expect(start.style.getPropertyValue('--ds-notifier-layer')).not.toBe('');
    expect(start.style.zIndex).toBe('');
  });

  it('keeps the message stack a polite log with its top offset as a channel', async () => {
    let api: ReturnType<typeof useModernMessage>[0] | undefined;
    renderWithEngine(
      <ModernMessageProvider placement="top" top={32}>
        <MessageHarness onReady={(ready) => (api = ready)} />
      </ModernMessageProvider>,
      'modern',
    );
    await waitFor(() => expect(api).toBeDefined());
    act(() => {
      api!.info('Placed', 0);
    });
    await screen.findByText('Placed');
    const stack = screen.getByRole('log');
    expect(stack).toHaveClass('ds-notifier-stack');
    expect(stack).toHaveAttribute('aria-live', 'polite');
    expect(stack.style.getPropertyValue('--ds-notifier-stack-offset')).toBe('32px');
    expect(stack.style.top).toBe('');
  });
});
