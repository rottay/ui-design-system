import React from 'react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
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

const MODERN_SKIN = readFileSync(
  resolve(
    __dirname,
    '../../../../../foundation/tokens/css/runtime/engines/modern/skin/notification-center/index.css',
  ),
  'utf8',
).replace(/\/\*[\s\S]*?\*\//g, '');

const BUTTON_SKIN_STATE_HOST = '.ds-button.ds-button--modern[data-variant]';

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

describe('NotificationCenter modern engine keyboard state contract', () => {
  it('renders every action as a tabbable Button the Button skin states select', async () => {
    const { container } = render(
      <ModernNotificationCenter
        {...buildProps({
          onRead: vi.fn(),
          onReadAll: vi.fn(),
          onClear: vi.fn(),
          onClearAll: vi.fn(),
          notifications: [notification({ action: { label: 'View', onClick: vi.fn() } })],
        })}
      />,
    );
    await settle();

    for (const part of ['trigger', 'mark-all-read', 'clear-all', 'action', 'mark-read', 'dismiss']) {
      const control = container.querySelector<HTMLElement>(`[data-part="${part}"]`);
      expect(control, part).toBeTruthy();
      expect(control!.tagName, part).toBe('BUTTON');
      expect(control!.matches(BUTTON_SKIN_STATE_HOST), part).toBe(true);
      expect(control!.tabIndex, part).toBe(0);
      expect(control!.hasAttribute('disabled'), part).toBe(false);
    }
  });

  it('reveals the quiet row actions when keyboard focus reaches the row', () => {
    for (const part of ['mark-read', 'dismiss']) {
      expect(MODERN_SKIN).toContain(`[data-part='row']:focus-within [data-part='${part}']`);
      expect(MODERN_SKIN).toContain(
        `[data-part='${part}']:is([data-state~='focus-visible'], :focus-visible)`,
      );
    }
  });

  it('leaves the composed Buttons their own ring and dresses only the panel anchor in the focus signature', async () => {
    const { container } = render(<ModernNotificationCenter {...buildProps({ onClear: vi.fn() })} />);
    await settle();

    const panel = container.querySelector<HTMLElement>('[data-part="panel"]');
    expect(panel?.tabIndex).toBe(-1);

    const panelFocus =
      ".ds-pattern-notification-center.ds-engine-modern [data-part='panel']:is([data-state~='focus-visible'], :focus-visible)";
    const declarations = (body: string) =>
      body
        .split(';')
        .map((declaration) => declaration.trim().replace(/\s+/g, ' '))
        .filter(Boolean);
    const rulesOf = (css: string) =>
      [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(([, selector, body]) => ({
        selector: selector.trim(),
        declarations: declarations(body),
      }));

    const forcedStart = MODERN_SKIN.indexOf('@media (forced-colors: active)');
    const forcedEnd = MODERN_SKIN.indexOf('@media (hover: none), (pointer: coarse)');
    expect(forcedStart).toBeGreaterThan(-1);
    expect(forcedEnd).toBeGreaterThan(forcedStart);
    const authored = rulesOf(MODERN_SKIN.slice(0, forcedStart) + MODERN_SKIN.slice(forcedEnd));
    const forced = rulesOf(MODERN_SKIN.slice(forcedStart, forcedEnd));

    const paintsFocus = (rule: { declarations: string[] }) =>
      rule.declarations.some((declaration) => /^outline(-[a-z]+)?\s*:|--ds-focus-ring/.test(declaration));
    const focusRules = authored.filter(paintsFocus);
    for (const rule of focusRules) expect(rule.selector).toBe(panelFocus);
    for (const rule of forced.filter(paintsFocus)) expect(rule.selector).toBe(panelFocus);

    expect(focusRules.map((rule) => rule.declarations)).toEqual([
      [
        'outline: var(--ds-focus-ring-width) solid transparent',
        'outline-offset: var(--ds-focus-ring-offset)',
        'box-shadow: var(--ds-focus-ring)',
      ],
      ['box-shadow: var(--ds-focus-ring), var(--ds-elevation-3)'],
    ]);
    expect(MODERN_SKIN).toMatch(
      /@container not style\(--ds-elevation-3: none\)\s*\{\s*\.ds-pattern-notification-center\.ds-engine-modern \[data-part='panel'\]:is\(\[data-state~='focus-visible'\], :focus-visible\)\s*\{\s*box-shadow: var\(--ds-focus-ring\), var\(--ds-elevation-3\);/,
    );
    expect(MODERN_SKIN).not.toContain('--ds-focus-ring-color');

    expect(forced.filter(paintsFocus).map((rule) => rule.declarations)).toEqual([
      [
        'outline: max(2px, var(--ds-focus-ring-width)) solid Highlight',
        'outline-offset: var(--ds-focus-ring-width)',
        'box-shadow: none',
      ],
    ]);
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
