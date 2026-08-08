import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ModernNotificationCenter from '../engines/modern';
import type { Notification, NotificationCenterProps } from '../contracts';

function notification(overrides: Partial<Notification> = {}): Notification {
  return {
    id: 'n1',
    title: 'Build passed',
    message: 'CI green on main',
    type: 'success',
    read: false,
    timestamp: new Date().toISOString(),
    ...overrides,
  } as Notification;
}

function buildProps(overrides: Partial<NotificationCenterProps> = {}): NotificationCenterProps {
  return {
    notifications: [notification()],
    open: true,
    ...overrides,
  } as NotificationCenterProps;
}

const settle = () => act(async () => {});

describe('NotificationCenter modern engine row action names', () => {
  it('distinguishes the dismiss control of each row', async () => {
    render(
      <ModernNotificationCenter
        {...buildProps({
          onClear: vi.fn(),
          notifications: [
            notification({ id: 'n1', title: 'Build passed' }),
            notification({ id: 'n2', title: 'Deploy failed' }),
          ],
        })}
      />,
    );
    await settle();

    // Two buttons both named "Dismiss" are indistinguishable in a screen
    // reader's control listing.
    expect(await screen.findByRole('button', { name: 'Dismiss: Build passed' })).toBeTruthy();
    expect(await screen.findByRole('button', { name: 'Dismiss: Deploy failed' })).toBeTruthy();
  });

  it('distinguishes the mark-as-read control of each row', async () => {
    render(
      <ModernNotificationCenter
        {...buildProps({
          onRead: vi.fn(),
          notifications: [
            notification({ id: 'n1', title: 'Build passed' }),
            notification({ id: 'n2', title: 'Deploy failed' }),
          ],
        })}
      />,
    );
    await settle();

    expect(await screen.findByRole('button', { name: 'Mark as read: Build passed' })).toBeTruthy();
    expect(await screen.findByRole('button', { name: 'Mark as read: Deploy failed' })).toBeTruthy();
  });
});

describe('NotificationCenter modern engine dismiss focus handoff', () => {
  it('keeps focus inside the panel when a row is dismissed', async () => {
    const onClear = vi.fn();
    const { container } = render(<ModernNotificationCenter {...buildProps({ onClear })} />);
    await settle();

    const dismiss = await screen.findByRole('button', { name: 'Dismiss: Build passed' });
    await act(async () => { fireEvent.click(dismiss); });

    expect(onClear).toHaveBeenCalledWith('n1');
    // Without the handoff focus lands on <body> and the next Tab restarts from
    // the top of the document, throwing the user out of the panel.
    expect(document.activeElement).toBe(container.querySelector('[data-part="panel"]'));
  });
});

describe('NotificationCenter modern engine overflow accounting', () => {
  it('accounts for notifications the maxVisible cap removes', async () => {
    const { container } = render(
      <ModernNotificationCenter
        {...buildProps({
          maxVisible: 2,
          notifications: [
            notification({ id: 'n1', title: 'One' }),
            notification({ id: 'n2', title: 'Two' }),
            notification({ id: 'n3', title: 'Three' }),
            notification({ id: 'n4', title: 'Four' }),
          ],
        })}
      />,
    );
    await settle();

    expect(screen.queryByText('Three')).toBeNull();
    const note = container.querySelector('[data-part="overflow-note"]');
    expect(note?.textContent).toBe('2 more not shown');
  });

  it('omits the note when nothing is capped', async () => {
    const { container } = render(<ModernNotificationCenter {...buildProps({ maxVisible: 10 })} />);
    await settle();

    expect(container.querySelector('[data-part="overflow-note"]')).toBeNull();
  });
});

describe('NotificationCenter modern engine busy posture', () => {
  it('keeps the trigger mounted while notifications load', async () => {
    const { container } = render(<ModernNotificationCenter {...buildProps({ loading: true })} />);
    await settle();

    // The bell is a fixed anchor in an app header; unmounting it shifts the row.
    expect(screen.getByTestId('notification-trigger')).toBeTruthy();
    expect(container.querySelector('[data-part="root"]')?.getAttribute('aria-busy')).toBe('true');
    expect(container.querySelector('[data-part="loading-spinner"]')).toBeTruthy();
  });

  it('clears busy on the loaded root rather than dropping the attribute', async () => {
    const { container } = render(<ModernNotificationCenter {...buildProps()} />);
    await settle();

    expect(container.querySelector('[data-part="root"]')?.getAttribute('aria-busy')).toBe('false');
  });
});

describe('NotificationCenter modern engine floor interpolation', () => {
  it('never prints a raw placeholder in the unread status', async () => {
    const { container } = render(
      <ModernNotificationCenter {...buildProps({ unreadCount: 4 })} />,
    );
    await settle();

    const status = container.querySelector(`[role="status"][aria-live="polite"]`);
    expect(status?.textContent).toBe('4 unread');
    expect(status?.textContent).not.toContain('{count}');
  });
});
