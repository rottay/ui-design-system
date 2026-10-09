import React from 'react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ModernNotificationCenter from '../engines/modern';
import type { Notification } from '../contracts';

const NOTIFICATIONS: Notification[] = [
  { id: 'n1', title: 'Build passed', message: 'CI green on main', type: 'success', read: false, timestamp: new Date().toISOString(), action: { label: 'Open run', onClick: vi.fn() } },
  { id: 'n2', title: 'Upload complete', message: 'Your file was uploaded', type: 'info', read: true, timestamp: new Date().toISOString() },
] as Notification[];

const MODERN_SKIN = readFileSync(
  resolve(__dirname, '../../../../../foundation/tokens/css/runtime/engines/modern/skin/notification-center/index.css'),
  'utf8',
).replace(/\/\*[\s\S]*?\*\//g, '');

async function mount(props: Partial<React.ComponentProps<typeof ModernNotificationCenter>> = {}) {
  const view = render(<ModernNotificationCenter notifications={NOTIFICATIONS} open {...props} />);
  await act(async () => {});
  return view;
}

describe('NotificationCenter modern row activation is a composed chrome-less Button', () => {
  it('activates a row through a Button named by its title, read or unread, and the row itself handles nothing', async () => {
    const onRead = vi.fn();
    const { container } = await mount({ onRead });
    for (const [id, title] of [['n1', 'Build passed'], ['n2', 'Upload complete']] as const) {
      const activation = screen.getByRole('button', { name: title });
      expect(activation).toHaveAttribute('data-part', 'row-activate');
      expect(activation).toHaveAttribute('data-chrome', 'none');
      expect(activation).toHaveClass('ds-button', 'ds-button--modern');
      fireEvent.click(activation);
      expect(onRead).toHaveBeenLastCalledWith(id);
    }
    expect(onRead).toHaveBeenCalledTimes(2);
    fireEvent.click(screen.getByText('CI green on main'));
    expect(onRead).toHaveBeenCalledTimes(2);
    for (const row of container.ownerDocument.querySelectorAll('[data-part="row"]')) {
      expect(row.firstElementChild).toHaveAttribute('data-part', 'row-activate');
    }
  });

  it('keeps the row actions their own: the action, mark-read and dismiss controls never activate the row', async () => {
    const onRead = vi.fn();
    const onClear = vi.fn();
    await mount({ onRead, onClear });
    fireEvent.click(screen.getByRole('button', { name: 'Open run' }));
    fireEvent.click(screen.getByRole('button', { name: /Dismiss.*Build passed/ }));
    expect(onRead).not.toHaveBeenCalled();
    expect(onClear).toHaveBeenCalledWith('n1');
  });

  it('renders no activation when the caller supplies no onRead', async () => {
    const { container } = await mount();
    expect(container.ownerDocument.querySelector('[data-part="row-activate"]')).toBeNull();
  });

  it('stretches the activation over the row in the skin, and lifts the timestamp so its title stays reachable', () => {
    expect(MODERN_SKIN).toMatch(/\[data-part='row'\] \{\s*position: relative;/);
    expect(MODERN_SKIN).toMatch(/\[data-part='row'\] > \.ds-notification-center__row-activate \{\s*position: absolute;\s*inset: 0;\s*\}/);
    expect(MODERN_SKIN).toMatch(/\[data-part='row-timestamp'\] \{\s*position: relative;\s*\}/);
  });
});
