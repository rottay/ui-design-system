/**
 * Notification modern engine — paint ownership after the K4-A Daisy drain.
 *
 * The stack container historically carried DaisyUI's `toast`/`toast-top`/
 * `toast-bottom`/`toast-center`/`toast-start`/`toast-end` placement classes,
 * which theme.css's `[data-tenant] .toast` bridge tried to paint from six
 * `--ds-toast-*` tokens declared nowhere. K4-A drained those classes: the
 * provider now stamps only `rottay-notification-stack--modern` plus
 * `data-placement`, and the unlayered skin `notification.css` is the single
 * paint owner for fixed placement, stacking and item surface.
 *
 * Both halves of the contract are pinned here — the DOM the provider stamps
 * and the skin rules that paint it. Reading the skin also sidesteps the jsdom
 * CSSOM limitations (`color-mix()`, logical-property serialization) that make
 * computed-style assertions unreliable for these channels.
 *
 * RTL contract: `*Left`/`*Right` placements are LOGICAL (reading start/end)
 * and mirror under `dir="rtl"`; centred placements use margin-auto centring.
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import React, { useEffect } from 'react';
import { describe, expect, it } from 'vitest';
import { act, screen, waitFor } from '@testing-library/react';

import {
  NotificationItem as ModernNotificationItem,
  NotificationProvider as ModernNotificationProvider,
  useNotification as useModernNotification,
} from '../engines/modern';
import { renderWithEngine } from '@/tooling/testing/helpers/engine';

const here = dirname(fileURLToPath(import.meta.url));
// Comments are stripped: the skin's header documents the very declarations
// asserted below, so matching raw text would both false-green the positive
// pins and false-red the physical-property bans.
const SKIN = readFileSync(
  join(here, '../../../../../foundation/tokens/css/runtime/engines/modern/skin/notification.css'),
  'utf8'
).replace(/\/\*[\s\S]*?\*\//g, '');

function Harness({
  onReady,
}: {
  onReady: (api: ReturnType<typeof useModernNotification>[0]) => void;
}) {
  const [api] = useModernNotification();

  useEffect(() => {
    onReady(api);
  }, [api, onReady]);

  return null;
}

async function mountProvider(ui: React.ReactElement) {
  let apiRef: ReturnType<typeof useModernNotification>[0] | undefined;
  renderWithEngine(
    <ModernNotificationProvider placement="topLeft" top={12} bottom={20}>
      {ui}
      <Harness onReady={(api) => { apiRef = api; }} />
    </ModernNotificationProvider>,
    'modern'
  );
  await waitFor(() => expect(apiRef).toBeDefined());
  return () => apiRef!;
}

describe('Notification modern engine — placement reaches the DOM Daisy-free', () => {
  it('stamps data-placement on a stack container with NO Daisy toast classes', async () => {
    const api = await mountProvider(<span>host</span>);

    act(() => {
      api().info({ message: 'Placed start', duration: 0 });
      api().error({ message: 'Placed end', duration: 0, placement: 'bottomRight' });
    });

    await screen.findByText('Placed start');
    await screen.findByText('Placed end');

    const containers = document.querySelectorAll('[data-part="stack-container"]');
    expect(containers).toHaveLength(2);

    for (const el of containers) {
      expect(el.className).toBe('rottay-notification-stack--modern');
      expect(el.className).not.toMatch(/\btoast(-(top|bottom|center|start|end))?\b/);
    }
    expect(document.querySelector('[data-placement="topLeft"]')).not.toBeNull();
    expect(document.querySelector('[data-placement="bottomRight"]')).not.toBeNull();
  });

  it('channels the provider top/bottom offsets through --ds-notification-stack-offset', async () => {
    const api = await mountProvider(<span>host</span>);

    act(() => {
      api().info({ message: 'Top offset', duration: 0 });
      api().info({ message: 'Bottom offset', duration: 0, placement: 'bottomRight' });
    });

    await screen.findByText('Top offset');
    await screen.findByText('Bottom offset');

    const topLeft = document.querySelector('[data-placement="topLeft"]') as HTMLElement;
    const bottomRight = document.querySelector('[data-placement="bottomRight"]') as HTMLElement;

    // The engine stamps the dynamic value; physical margin/top/bottom paint
    // stays OUT of the element style so the skin owns the declaration.
    expect(topLeft.style.getPropertyValue('--ds-notification-stack-offset')).toBe('12px');
    expect(bottomRight.style.getPropertyValue('--ds-notification-stack-offset')).toBe('20px');
    expect(topLeft.style.marginTop).toBe('');
    expect(bottomRight.style.marginBottom).toBe('');
  });
});

describe('Notification modern engine — the item paints no surface inline', () => {
  it('stamps data-tone and leaves background/color/border to the skin', () => {
    renderWithEngine(
      <ModernNotificationItem
        id="owned-notification"
        type="success"
        message="Owned"
        duration={3}
        onRemove={() => {}}
      />,
      'modern'
    );

    const root = screen.getByText('Owned').closest('[data-part="root"]') as HTMLElement;
    expect(root.className).toContain('rottay-notification--modern');
    expect(root.getAttribute('data-tone')).toBe('success');

    expect(root.style.background).toBe('');
    expect(root.style.color).toBe('');
    expect(root.style.border).toBe('');

    // The duration CSS-var channel (consumed by the skin's progress
    // animation) and nothing else is engine-stamped.
    expect(root.style.getPropertyValue('--ds-notification-duration')).toBe('3s');
  });
});

describe('Notification modern engine — the skin owns placement and surface', () => {
  it('declares the fixed stack container with a family-local z-index fallback', () => {
    expect(SKIN).toContain(".rottay-notification-stack--modern[data-part='stack-container']");
    expect(SKIN).toContain('position: fixed;');
    expect(SKIN).toContain('z-index: var(--ds-z-notification, 1600);');
  });

  it('consumes the engine-stamped offset channel on the block edge', () => {
    expect(SKIN).toContain('top: var(--ds-notification-stack-offset, 0);');
    expect(SKIN).toContain('bottom: var(--ds-notification-stack-offset, 0);');
  });

  it('anchors start/end placements with LOGICAL inset-inline properties', () => {
    expect(SKIN).toMatch(/\[data-placement\$='Left'\]\s*\{[^}]*inset-inline-start:/);
    expect(SKIN).toMatch(/\[data-placement\$='Right'\]\s*\{[^}]*inset-inline-end:/);
    // ...and never with the physical properties that broke RTL mirroring.
    expect(SKIN).not.toMatch(/\[data-placement\$='Left'\]\s*\{[^}]*\sleft:/);
    expect(SKIN).not.toMatch(/\[data-placement\$='Right'\]\s*\{[^}]*\sright:/);
  });

  it('centres horizontally without a transform containing block', () => {
    expect(SKIN).toMatch(/\[data-placement='bottom'\]\s*\{[^}]*inset-inline: 0;[^}]*margin-inline: auto;/);
    expect(SKIN).not.toContain('left: 50%;');
    expect(SKIN).not.toContain('translateX(-50%)');
  });

  it.each([
    ['success', 'var(--ds-color-success)'],
    ['error', 'var(--ds-color-error)'],
    ['warning', 'var(--ds-color-warning)'],
    ['open', 'var(--ds-color-primary)'],
  ] as const)('%s derives its accent from its semantic color token', (_tone, colorVar) => {
    expect(SKIN).toContain(`--ds-notification-accent: ${colorVar};`);
  });

  it('keys every tone on data-tone, with info as the untoned default', () => {
    for (const tone of ['success', 'error', 'warning', 'open']) {
      expect(SKIN).toContain(`[data-part='root'][data-tone='${tone}']`);
    }
    expect(SKIN).toContain('--ds-notification-accent: var(--ds-color-info);');
  });

  it('never introduces a one-sided decorative border rail', () => {
    expect(SKIN).not.toMatch(/border-left-(width|style)\s*:/);
    expect(SKIN).not.toMatch(/border-right-(width|style)\s*:/);
  });

  it('mirrors the lifetime progress bar under RTL', () => {
    expect(SKIN).toContain(":dir(rtl) > [data-part='progress']");
    expect(SKIN).toContain('transform-origin: right center;');
    expect(SKIN).toMatch(/\[data-part='progress'\]\s*\{[^}]*inset-inline: 0;/);
  });
});
