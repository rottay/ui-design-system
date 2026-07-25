/**
 * Dropdown modern engine — logical placement & RTL mirroring (K4-A).
 *
 * Placement semantics are LOGICAL: `bottomLeft` anchors the surface's
 * reading-start edge to the trigger's reading-start edge and mirrors under
 * `dir="rtl"`. K4-A converted the in-tree fallback from physical
 * `left`/`right` to `inset-inline-*` (the browser mirrors for free), made the
 * portal alignment computation direction-aware (Popover's
 * toPhysicalPlacement precedent -- measured geometry stays physical), and
 * made the submenu ArrowRight/ArrowLeft keys logical forward/backward.
 *
 * Portal pixel geometry is NOT asserted here: happy-dom returns zeroed rects,
 * so only the direction-free contracts (attribute stamping, in-tree style,
 * keyboard model, skin rules) are pinnable in this environment.
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { Dropdown as ModernDropdown } from '../engines/modern';
import type { DropdownPlacement } from '../contracts';

const here = dirname(fileURLToPath(import.meta.url));
// Comments are stripped so header prose cannot false-green the rule pins.
const SKIN = readFileSync(
  join(here, '../../../../../foundation/tokens/css/runtime/engines/modern/skin/dropdown.css'),
  'utf8'
).replace(/\/\*[\s\S]*?\*\//g, '');

const SUBMENU = {
  items: [
    {
      key: 'share',
      label: 'Share',
      children: [{ key: 'copy-link', label: 'Copy link' }],
    },
  ],
};

afterEach(() => cleanup());

function renderOpen(placement: DropdownPlacement, rtl = false) {
  return render(
    <div dir={rtl ? 'rtl' : 'ltr'}>
      <ModernDropdown open placement={placement} menu={SUBMENU}>
        <button type="button">Actions</button>
      </ModernDropdown>
    </div>,
  );
}

describe('Dropdown modern engine — in-tree placement is logical', () => {
  it.each([
    ['bottomLeft', 'inset-inline-start'],
    ['topLeft', 'inset-inline-start'],
    ['bottomRight', 'inset-inline-end'],
    ['topRight', 'inset-inline-end'],
  ] as const)('%s anchors with %s and no physical left/right', (placement, property) => {
    const { container } = renderOpen(placement);
    const surface = container.querySelector('[data-part="surface"]') as HTMLElement;
    const styleAttr = surface.getAttribute('style') ?? '';

    expect(styleAttr).toContain(`${property}: 0`);
    expect(surface.style.left).toBe('');
    expect(surface.style.right).toBe('');
  });

  it.each(['bottom', 'top'] as const)(
    '%s centre keeps the direction-neutral physical centring',
    (placement) => {
      const { container } = renderOpen(placement);
      const surface = container.querySelector('[data-part="surface"]') as HTMLElement;

      expect(surface.style.left).toBe('50%');
      expect(surface.style.translate).toBe('-50% 0');
    },
  );
});

describe('Dropdown modern engine — submenu keys are logical forward/backward', () => {
  it('ArrowRight opens and ArrowLeft closes in LTR', () => {
    renderOpen('bottomLeft');
    const item = screen.getByRole('menuitem', { name: 'Share' });

    fireEvent.keyDown(item, { key: 'ArrowRight' });
    expect(item).toHaveAttribute('aria-expanded', 'true');

    fireEvent.keyDown(item, { key: 'ArrowLeft' });
    expect(item).toHaveAttribute('aria-expanded', 'false');
  });

  it('ArrowLeft opens and ArrowRight closes inside a dir="rtl" subtree', () => {
    renderOpen('bottomLeft', true);
    const item = screen.getByRole('menuitem', { name: 'Share' });

    fireEvent.keyDown(item, { key: 'ArrowLeft' });
    expect(item).toHaveAttribute('aria-expanded', 'true');

    fireEvent.keyDown(item, { key: 'ArrowRight' });
    expect(item).toHaveAttribute('aria-expanded', 'false');
  });
});

describe('Dropdown modern engine — the skin mirrors under RTL', () => {
  it('hangs submenus off the reading-end edge with a logical inset', () => {
    expect(SKIN).toContain("[data-part='submenu']");
    expect(SKIN).toContain('inset-inline-start: calc(100% + 0.48rem);');
  });

  it('flips the open-state submenu-indicator nudge under :dir(rtl)', () => {
    expect(SKIN).toContain("[data-part='submenu-indicator']:dir(rtl)");
    expect(SKIN).toContain('transform: translateX(-2px);');
  });

  it('paints arrow edges with logical border properties', () => {
    expect(SKIN).toContain('border-inline-end: 0;');
    expect(SKIN).toContain('border-inline-start: 0;');
  });

  it('carries the Pass-2 interaction contracts (coarse 44px floor, forced-colors outline)', () => {
    expect(SKIN).toContain('@media (pointer: coarse)');
    expect(SKIN).toContain('min-block-size: max(44px, var(--ds-dropdown-item-height, 2.4rem));');
    expect(SKIN).toContain('@media (forced-colors: active)');
  });

  it('never isolates the trigger (the in-tree surface must stack at page level)', () => {
    expect(SKIN).not.toMatch(/\[data-part='trigger'\]\s*\{[^}]*isolation: isolate/);
    // ...while the surface keeps its own isolation for the -1 arrow.
    expect(SKIN).toMatch(/\[data-part='surface'\]\s*\{[^}]*isolation: isolate/);
  });
});
