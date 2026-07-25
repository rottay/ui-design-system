/**
 * Message modern engine — paint ownership after the Daisy toast-class drain.
 *
 * The stack container historically carried DaisyUI's `toast`/`toast-top`/
 * `toast-bottom`/`toast-center` placement classes (held in a placement map,
 * invisible to the pre-hardening Daisy counter), which theme.css's
 * `[data-tenant] .toast` bridge tried to paint from six `--ds-toast-*`
 * tokens declared nowhere. The drain removed both: the provider now stamps
 * only `rottay-message-stack--modern` plus `data-placement`, and the
 * unlayered skin `message.css` is the single paint owner for fixed
 * placement, stacking and item surface.
 *
 * Both halves of the contract are pinned here — the DOM the provider stamps
 * and the skin rules that paint it. Reading the skin also sidesteps the jsdom
 * CSSOM limitations (`color-mix()`, logical-property serialization) that make
 * computed-style assertions unreliable for these channels.
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import React, { useEffect } from 'react';
import { describe, expect, it } from 'vitest';
import { act, screen, waitFor } from '@testing-library/react';

import type { MessagePlacement } from '../../contracts';
import {
  MessageItem as ModernMessageItem,
  MessageProvider as ModernMessageProvider,
  useMessage as useModernMessage,
} from '../engines/modern';
import { renderWithEngine } from '@/tooling/testing/helpers/engine';

const here = dirname(fileURLToPath(import.meta.url));
// Comments are stripped: the skin's header documents the very declarations
// asserted below, so matching raw text would both false-green the positive
// pins and false-red the physical-property bans.
const SKIN = readFileSync(
  join(here, '../../../../../foundation/tokens/css/runtime/engines/modern/skin/message.css'),
  'utf8'
).replace(/\/\*[\s\S]*?\*\//g, '');

function Harness({
  onReady,
}: {
  onReady: (api: ReturnType<typeof useModernMessage>[0]) => void;
}) {
  const [api] = useModernMessage();

  useEffect(() => {
    onReady(api);
  }, [api, onReady]);

  return null;
}

async function mountProvider(placement: MessagePlacement, top = 32) {
  let apiRef: ReturnType<typeof useModernMessage>[0] | undefined;
  renderWithEngine(
    <ModernMessageProvider placement={placement} top={top}>
      <span>host</span>
      <Harness onReady={(api) => { apiRef = api; }} />
    </ModernMessageProvider>,
    'modern'
  );
  await waitFor(() => expect(apiRef).toBeDefined());
  return () => apiRef!;
}

describe('Message modern engine — placement reaches the DOM Daisy-free', () => {
  it.each(['top', 'bottom'] as const)(
    'stamps data-placement=%s on a stack container with NO Daisy toast classes',
    async (placement) => {
      const api = await mountProvider(placement);

      act(() => {
        api().info(`Placed ${placement}`, 0);
      });

      await screen.findByText(`Placed ${placement}`);

      const stack = document.querySelector('[data-part="stack-container"]') as HTMLElement;
      expect(stack).not.toBeNull();
      expect(stack.getAttribute('data-placement')).toBe(placement);
      expect(stack.className).toBe('rottay-message-stack--modern');
      expect(stack.className).not.toMatch(/\btoast(-(top|bottom|center|start|end))?\b/);
    }
  );

  it('channels the provider top offset through --ds-message-stack-offset', async () => {
    const api = await mountProvider('top', 32);

    act(() => {
      api().info('Top offset', 0);
    });

    await screen.findByText('Top offset');

    const stack = document.querySelector('[data-placement="top"]') as HTMLElement;
    expect(stack.style.getPropertyValue('--ds-message-stack-offset')).toBe('32px');
    // Physical margin/top paint stays OUT of the element style so the skin
    // owns the declaration.
    expect(stack.style.marginTop).toBe('');
    expect(stack.style.top).toBe('');
  });

  it('stamps no offset channel for bottom placement (skin owns the gutter)', async () => {
    const api = await mountProvider('bottom');

    act(() => {
      api().info('Bottom placed', 0);
    });

    await screen.findByText('Bottom placed');

    const stack = document.querySelector('[data-placement="bottom"]') as HTMLElement;
    expect(stack.style.getPropertyValue('--ds-message-stack-offset')).toBe('');
    expect(stack.style.marginTop).toBe('');
  });
});

describe('Message modern engine — the item paints no surface inline', () => {
  it('stamps data-tone and leaves background/color/border to the skin', () => {
    renderWithEngine(
      <ModernMessageItem
        id="owned-message"
        type="success"
        content="Owned"
        duration={3}
        onRemove={() => {}}
      />,
      'modern'
    );

    const root = screen.getByText('Owned').closest('[data-part="root"]') as HTMLElement;
    expect(root.className).toContain('rottay-message--modern');
    expect(root.getAttribute('data-tone')).toBe('success');

    expect(root.style.background).toBe('');
    expect(root.style.color).toBe('');
    expect(root.style.border).toBe('');

    // The duration CSS-var channel (consumed by the skin's progress
    // animation) and nothing else is engine-stamped.
    expect(root.style.getPropertyValue('--ds-message-duration')).toBe('3s');
  });
});

describe('Message modern engine — the skin owns placement and surface', () => {
  it('declares the fixed stack container with a family-local z-index fallback', () => {
    expect(SKIN).toContain(".rottay-message-stack--modern[data-part='stack-container']");
    expect(SKIN).toContain('position: fixed;');
    expect(SKIN).toContain('z-index: var(--ds-z-message, 1590);');
  });

  it('consumes the engine-stamped offset channel on the top block edge', () => {
    expect(SKIN).toMatch(
      /\[data-placement='top'\]\s*\{[^}]*top: var\(--ds-message-stack-offset, 0\);/
    );
  });

  it('keeps the bottom gutter on the spacing token', () => {
    expect(SKIN).toMatch(/\[data-placement='bottom'\]\s*\{[^}]*bottom: var\(--ds-spacing-4\);/);
  });

  it('centres horizontally without a transform containing block', () => {
    expect(SKIN).toMatch(/\[data-placement='top'\]\s*\{[^}]*inset-inline: 0;[^}]*margin-inline: auto;/);
    expect(SKIN).toMatch(/\[data-placement='bottom'\]\s*\{[^}]*inset-inline: 0;[^}]*margin-inline: auto;/);
    expect(SKIN).not.toContain('left: 50%;');
    expect(SKIN).not.toContain('translateX(-50%)');
  });

  it('keeps the bottom exit animation keyed on data-placement', () => {
    expect(SKIN).toContain(
      ".rottay-message-stack--modern[data-placement='bottom'] .rottay-message--modern[data-part='root'][data-state='exit']"
    );
  });
});
