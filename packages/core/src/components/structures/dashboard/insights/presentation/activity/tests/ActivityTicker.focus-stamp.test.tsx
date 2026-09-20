/**
 * The ticker's own two controls — the prev/next chevrons and the pagination
 * dots — carry the kernel stamp their skin ring is keyed on.
 *
 * They are real `<button>`s the strip owns, so unlike the view-all anchor
 * nothing external has to forward anything: the gap was that the ring rule read
 * `:focus-visible` alone and no DOM attribute ever said the control was
 * keyboard-focused.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, waitFor } from '@testing-library/react';
import { renderWithEngine } from '@tests/support/engine';

import { ActivityTicker } from '../ticker';
import type { ActivityItem } from '../../../foundation/contracts';

const skin = readFileSync(
  join(
    __dirname,
    '../../../../../../../foundation/tokens/css/presentation/components/skin/activity-ticker/index.css',
  ),
  'utf8',
);

const ITEMS: ActivityItem[] = [
  { text: 'First update', time: '2m', type: 'success' },
  { text: 'Second update', time: '5m', type: 'info' },
];

afterEach(cleanup);

describe('ActivityTicker control focus stamp', () => {
  it.each(['nav-button', 'ticker-dot'])('pairs the %s ring with the stamped state', (part) => {
    expect(skin).toContain(
      `[data-part='${part}']:is([data-state~='focus-visible'], :focus-visible)`,
    );
    expect(skin).not.toMatch(new RegExp(`\\[data-part='${part}'\\]:focus-visible\\s*\\{`, 'u'));
  });

  it.each(['nav-button', 'ticker-dot'])('leaves %s silent at rest', async (part) => {
    const { container } = renderWithEngine(<ActivityTicker items={ITEMS} />, 'modern');
    await waitFor(() => expect(container.querySelector(`[data-part="${part}"]`)).not.toBeNull());
    for (const control of container.querySelectorAll(`[data-part="${part}"]`)) {
      expect(control.hasAttribute('data-state')).toBe(false);
    }
  });

  it.each(['nav-button', 'ticker-dot'])('stamps focus-visible on %s for a keyboard focus', async (part) => {
    const { container } = renderWithEngine(<ActivityTicker items={ITEMS} />, 'modern');
    await waitFor(() => expect(container.querySelector(`[data-part="${part}"]`)).not.toBeNull());
    const control = container.querySelector<HTMLElement>(`[data-part="${part}"]`)!;

    fireEvent.focus(control);
    expect(control.getAttribute('data-state')?.split(' ')).toContain('focus-visible');

    fireEvent.blur(control);
    expect(control.hasAttribute('data-state')).toBe(false);
  });

  it('keeps every attribute the dots carried before the stamp', async () => {
    const { container } = renderWithEngine(<ActivityTicker items={ITEMS} />, 'modern');
    await waitFor(() => expect(container.querySelector('[data-part="ticker-dot"]')).not.toBeNull());
    const dots = container.querySelectorAll<HTMLElement>('[data-part="ticker-dot"]');
    expect(dots).toHaveLength(ITEMS.length);
    expect(dots[0].getAttribute('data-active')).toBe('true');
    expect(dots[0].getAttribute('aria-current')).toBe('true');
    expect(dots[0].getAttribute('data-type')).toBe('success');
    expect(dots[0].style.width).toBe('24px');
    expect(dots[1].getAttribute('data-active')).toBe('false');
    expect(dots[1].hasAttribute('aria-current')).toBe(false);
    expect(dots[1].style.width).toBe('10px');
  });
});
