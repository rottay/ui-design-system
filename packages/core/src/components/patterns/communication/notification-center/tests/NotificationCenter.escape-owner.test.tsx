/**
 * Escape reaches NotificationCenter through the overlay layer stack: the panel closes,
 * focus returns to the trigger, and the router consumes the key. Opened inside
 * an enclosing modal layer, the panel closes first and the modal second.
 */

import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/react';

import { useOverlayLayer } from '../../../../primitives/runtime/overlay/layer-stack';
import { renderWithEngine } from '@tests/support/engine';
import ModernNotificationCenter from '../engines/modern';

const NOTIFICATIONS = [
  { id: 'n1', title: 'New message', message: 'Hello', type: 'info' as const, read: false, timestamp: new Date().toISOString() },
];

function EnclosingModal({ onEscape }: { onEscape: () => void }) {
  useOverlayLayer({ kind: 'modal', modal: true, lockScroll: false, restoreFocus: false, onEscape });
  return null;
}

function pressEscape(): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
  (document.activeElement ?? document.body).dispatchEvent(event);
  return event;
}

const isPanelOpen = (): boolean => screen.queryByText('New message') !== null;

async function openPanel(): Promise<HTMLElement> {
  const trigger = await screen.findByTestId('notification-trigger');
  fireEvent.click(trigger);
  await waitFor(() => expect(isPanelOpen()).toBe(true));
  return trigger;
}

describe('NotificationCenter: Escape through the layer stack', () => {
  it('closes the panel, refocuses the trigger and consumes the key', async () => {
    renderWithEngine(<ModernNotificationCenter notifications={NOTIFICATIONS} />, 'modern');
    const trigger = await openPanel();
    const event = pressEscape();
    await waitFor(() => expect(isPanelOpen()).toBe(false));
    expect(document.activeElement).toBe(trigger);
    expect(event.defaultPrevented).toBe(true);
  });

  it('closes before an enclosing modal layer', async () => {
    const modalEscape = vi.fn();
    renderWithEngine(<><EnclosingModal onEscape={modalEscape} /><ModernNotificationCenter notifications={NOTIFICATIONS} /></>, 'modern');
    await openPanel();
    pressEscape();
    await waitFor(() => expect(isPanelOpen()).toBe(false));
    expect(modalEscape).not.toHaveBeenCalled();
    pressEscape();
    expect(modalEscape).toHaveBeenCalledTimes(1);
  });
});
