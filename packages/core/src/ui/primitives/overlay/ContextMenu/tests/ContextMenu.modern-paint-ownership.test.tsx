/**
 * ContextMenu modern engine — skin paint ownership & logical opening side (K4-A).
 *
 * The engine historically hardcoded row chrome inline (divider
 * `height:1, margin:'4px 0'`; group-label `padding/fontSize/letterSpacing`),
 * laid rows out with eleven Tailwind utilities, and always opened the panel
 * with the positioning runtime's PHYSICAL `bottom-start` -- which spans right
 * from the cursor even under RTL (the runtime is direction-agnostic by
 * design). K4-A drained geometry/utility paint into the unlayered skin
 * `context-menu.css` and made the opening side logical: the reading direction
 * captured at open time picks `bottom-start` (LTR) or `bottom-end` (RTL), so
 * the panel opens toward the reading-start side like a native context menu.
 *
 * The shipped ZERO-hover item feedback (documented P2b behaviour) is pinned
 * as absent so that adding it in Pass 2 is a deliberate, reviewed test flip.
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import React from 'react';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const useOverlayPositionSpy = vi.fn(
  (_args: unknown): { strategy: string; style: Record<string, never>; anchorAttrs: Record<string, never> } => ({
    strategy: 'js',
    style: {},
    anchorAttrs: {},
  })
);

vi.mock('../../../runtime/overlay/positioning', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  return {
    ...actual,
    useOverlayPosition: (args: unknown) => useOverlayPositionSpy(args),
  };
});

import ModernContextMenu from '../engines/modern';
import type { ContextMenuItem } from '../contracts';

const here = dirname(fileURLToPath(import.meta.url));
// Comments are stripped: the skin's header documents the very declarations
// asserted below, so matching raw text would both false-green the positive
// pins and false-red the bans.
const SKIN = readFileSync(
  join(here, '../../../../../foundation/tokens/css/runtime/engines/modern/skin/context-menu.css'),
  'utf8'
).replace(/\/\*[\s\S]*?\*\//g, '');

const ITEMS: ContextMenuItem[] = [
  { key: 'group', label: 'Workspace', type: 'group' },
  { key: 'open', label: 'Open dashboard', shortcut: 'O' },
  { key: 'divider-1', label: '', type: 'divider' },
  { key: 'disabled', label: 'Disabled item', disabled: true },
  { key: 'danger', label: 'Delete workspace', danger: true },
];

afterEach(() => {
  cleanup();
  useOverlayPositionSpy.mockClear();
});

function openMenu(container: HTMLElement): HTMLElement {
  const trigger = container.querySelector('[data-part="trigger"]') as HTMLElement;
  fireEvent.contextMenu(trigger);
  const panel = document.querySelector('[data-part="surface"]') as HTMLElement | null;
  if (!panel) throw new Error('context menu surface not rendered');
  return panel;
}

describe('ContextMenu modern engine — rows carry no inline geometry or utility classes', () => {
  it('drains divider/group/item chrome to data-parts the skin owns', () => {
    const { container } = render(
      <ModernContextMenu items={ITEMS} trigger={<button type="button">Target</button>} />,
    );
    const panel = openMenu(container);

    const divider = panel.querySelector('[data-part="divider"]') as HTMLElement;
    expect(divider.getAttribute('style')).toBeNull();

    const groupLabel = panel.querySelector('[data-part="group-label"]') as HTMLElement;
    expect(groupLabel.getAttribute('style')).toBeNull();

    const item = panel.querySelector('[data-part="item"]') as HTMLElement;
    expect(item.getAttribute('class') ?? '').toBe('');
    expect(item.querySelector('[data-part="label"]')).not.toBeNull();
    expect(item.querySelector('[data-part="shortcut"]')?.textContent).toBe('O');

    const disabled = panel.querySelector('[data-part="item"][data-disabled="true"]') as HTMLElement;
    expect(disabled.getAttribute('class') ?? '').toBe('');

    const danger = panel.querySelector('[data-part="item"][data-tone="danger"]') as HTMLElement;
    expect(danger.getAttribute('class') ?? '').toBe('');
  });

  it('stamps Dropdown-mirroring menu semantics (R1: the lane spec waits on role=menu)', () => {
    const { container } = render(
      <ModernContextMenu items={ITEMS} trigger={<button type="button">Target</button>} />,
    );
    const panel = openMenu(container);

    expect(panel).toHaveAttribute('role', 'menu');
    expect(panel).toHaveAttribute('aria-orientation', 'vertical');
    expect(panel.querySelector('[data-part="divider"]')).toHaveAttribute('role', 'separator');
    expect(panel.querySelector('[data-part="group-label"]')).toHaveAttribute('role', 'presentation');

    const item = panel.querySelector('[data-part="item"]') as HTMLElement;
    expect(item).toHaveAttribute('role', 'menuitem');

    const disabled = panel.querySelector('[data-part="item"][data-disabled="true"]') as HTMLElement;
    expect(disabled).toHaveAttribute('aria-disabled', 'true');
  });

  it('keeps panel chrome (width/padding/list reset) out of the element style', () => {
    const { container } = render(
      <ModernContextMenu items={ITEMS} trigger={<button type="button">Target</button>} />,
    );
    const panel = openMenu(container);

    expect(panel.style.width).toBe('');
    expect(panel.style.padding).toBe('');
    expect(panel.style.margin).toBe('');
    expect(panel.style.listStyle).toBe('');
    // Measured/positioning channels stay inline: z-index token and animation.
    expect(panel.style.zIndex).toBe('var(--ds-z-popover)');
  });

  it('drops the `relative` utility from the trigger container', () => {
    const { container } = render(
      <ModernContextMenu items={ITEMS} trigger={<button type="button">Target</button>} />,
    );
    const trigger = container.querySelector('[data-part="trigger"]') as HTMLElement;
    expect(trigger.className).not.toMatch(/\brelative\b/);
    expect(trigger.className).toContain('rottay-context-menu--modern');
  });
});

describe('ContextMenu modern engine — the opening side is logical', () => {
  it('opens bottom-start in an LTR context', () => {
    const { container } = render(
      <ModernContextMenu items={ITEMS} trigger={<button type="button">Target</button>} />,
    );
    openMenu(container);

    const lastCall = useOverlayPositionSpy.mock.calls.at(-1)?.[0] as { placement: string };
    expect(lastCall.placement).toBe('bottom-start');
  });

  it('opens bottom-end inside a dir="rtl" subtree so the panel mirrors', () => {
    const { container } = render(
      <div dir="rtl">
        <ModernContextMenu items={ITEMS} trigger={<button type="button">Target</button>} />
      </div>,
    );
    openMenu(container);

    const lastCall = useOverlayPositionSpy.mock.calls.at(-1)?.[0] as { placement: string };
    expect(lastCall.placement).toBe('bottom-end');
  });
});

describe('ContextMenu modern engine — the skin owns the drained paint', () => {
  it('owns the panel chrome', () => {
    expect(SKIN).toContain('inline-size: var(--ds-context-menu-width, 14rem);');
    expect(SKIN).toContain('padding: var(--ds-context-menu-padding, var(--ds-spacing-2, 0.5rem));');
    expect(SKIN).toContain('list-style: none;');
  });

  it('shares the lane overlay material register with Dropdown (Pass-2 coherence)', () => {
    expect(SKIN).toContain('color-mix(in srgb, var(--ds-color-primary) 5%, transparent)');
    expect(SKIN).toContain(
      'linear-gradient(var(--ds-elevation-surface-3), var(--ds-elevation-surface-3))',
    );
    expect(SKIN).toContain('var(--ds-surface-card)');
    expect(SKIN).toContain('var(--ds-context-menu-border-color, color-mix(in srgb, var(--ds-color-border) 86%, var(--ds-color-primary) 14%))');
    expect(SKIN).toContain('var(--ds-context-menu-shadow, var(--ds-elevation-3))');
    expect(SKIN).toContain('var(--ds-context-menu-radius, var(--ds-radius-xl, 16px))');
    expect(SKIN).not.toContain('background: var(--ds-surface-card);');
    expect(SKIN).not.toContain('box-shadow: var(--ds-elevation-2);');
  });

  it('owns the positioning context the `relative` utility used to provide', () => {
    expect(SKIN).toMatch(/\.rottay-context-menu--modern\[data-part='trigger'\]\s*\{[^}]*position: relative;/);
  });

  it('owns the divider geometry with logical margins', () => {
    expect(SKIN).toMatch(/\[data-part='divider'\]\s*\{[^}]*block-size: 1px;/);
    expect(SKIN).toContain('margin-block: var(--ds-context-menu-divider-margin-block, 4px);');
    expect(SKIN).toContain('margin-inline: 0;');
  });

  it('owns the group-label chrome with token channels', () => {
    expect(SKIN).toMatch(/\[data-part='group-label'\]\s*\{[^}]*padding: var\(--ds-context-menu-group-padding, 0\.375rem 0\.75rem\);/);
    expect(SKIN).toContain('font-size: var(--ds-font-size-xs, 0.75rem);');
    expect(SKIN).toContain('font-weight: var(--ds-font-weight-medium, 500);');
    expect(SKIN).toContain('letter-spacing: var(--ds-context-menu-group-letter-spacing, 0.05em);');
  });

  it('owns the item-row layout drained from Tailwind utilities', () => {
    expect(SKIN).toMatch(/\[data-part='item'\]\s*\{[^}]*display: flex;[^}]*justify-content: space-between;/);
    expect(SKIN).toContain("[data-part='item'][data-disabled='true']");
    expect(SKIN).toContain('opacity: var(--ds-state-disabled-opacity);');
    expect(SKIN).toContain("[data-part='shortcut']");
  });

  it('scopes row rules UNDER the surface so trigger content is never matched', () => {
    for (const part of ['divider', 'group-label', 'item', 'label', 'shortcut']) {
      expect(SKIN).toContain(`[data-part='trigger'] > [data-part='surface'] [data-part='${part}']`);
    }
  });

  it('pins the leveled Pass-2 interaction contract (hover/focus/pressed, not the retired zero-hover)', () => {
    // The P2b zero-hover contract was retired in Pass 2 (premium bar).
    expect(SKIN).toContain("[data-part='item']:not(:disabled):hover");
    expect(SKIN).toContain("[data-part='item']:not(:disabled):focus-visible");
    expect(SKIN).toContain("[data-part='item']:not(:disabled):active");
    expect(SKIN).toContain('color-mix(in srgb, var(--ds-color-primary) 7%, var(--ds-surface-card))');
    expect(SKIN).toContain("[data-tone='danger']:not(:disabled):hover");
    // ...with the forced-colors and coarse-pointer contracts beside it.
    expect(SKIN).toContain('@media (forced-colors: active)');
    expect(SKIN).toContain('@media (pointer: coarse)');
    expect(SKIN).toContain('min-block-size: max(44px, var(--ds-context-menu-touch-target-min, 2rem));');
    expect(SKIN).toContain('@media (prefers-reduced-motion: reduce)');
  });
});
