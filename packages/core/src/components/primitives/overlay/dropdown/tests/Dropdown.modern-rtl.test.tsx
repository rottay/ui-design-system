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
 * Geometry is proven in a real browser by the causality suite; this file pins
 * the stamped placement and the keyboard model.
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { I18nProvider } from '@/infrastructure/runtime/i18n';

import { Dropdown as ModernDropdown } from '../engines/modern';
import type { DropdownPlacement } from '../contracts';

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
  // Direction arrives through the i18n authority the engine now reads, not a
  // bare `dir` wrapper; the provider stamps `dir` itself.
  return render(
    <I18nProvider locale={rtl ? 'ar' : 'en'} fallbackLocale="en">
      <ModernDropdown open placement={placement} menu={SUBMENU}>
        <button type="button">Actions</button>
      </ModernDropdown>
    </I18nProvider>,
  );
}

describe('Dropdown modern engine — in-tree placement is stamped, never inline', () => {
  it.each(['bottomLeft', 'topLeft', 'bottomRight', 'topRight', 'bottom', 'top'] as const)(
    '%s travels as data-placement with no inline coordinates',
    (placement) => {
      const { container } = renderOpen(placement);
      const surface = container.querySelector('[data-part="surface"]') as HTMLElement;

      expect(surface).toHaveAttribute('data-placement', placement);
      expect(surface.getAttribute('style') ?? '').not.toMatch(/inset|left|right|translate|top|bottom/);
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

/**
 * DOM-SIMULATED, deliberately: neither happy-dom nor jsdom implements
 * `:dir()` or resolves a matched rule into a computed matrix, so the mirror is
 * read off the skin text the cascade would apply, not off a rendered box.
 */
const SKIN = readFileSync(
  resolve(
    dirname(fileURLToPath(import.meta.url)),
    '../../../../../foundation/tokens/css/runtime/engines/modern/skin/dropdown/index.css',
  ),
  'utf8',
);

describe('Dropdown modern skin — the item sheen sweeps with the reading direction', () => {
  it('mirrors the rest offset on a :dir(rtl) twin declared after the base', () => {
    const base = SKIN.indexOf(
      ".ds-dropdown-surface[data-part='surface'] [data-part='item']::after {",
    );
    const twin = SKIN.indexOf(
      ".ds-dropdown-surface[data-part='surface'] [data-part='item']:dir(rtl)::after {\n  transform: translateX(40%);",
    );
    expect(base).toBeGreaterThanOrEqual(0);
    expect(twin).toBeGreaterThan(base);
  });

  it('mirrors the hover offset on a :dir(rtl) twin declared after the base', () => {
    const base = SKIN.indexOf(
      ".ds-dropdown-surface[data-part='surface'] [data-part='item']:is([data-state~='hovered'], :hover):not([data-state~='disabled'])::after {",
    );
    const twin = SKIN.indexOf(
      ".ds-dropdown-surface[data-part='surface'] [data-part='item']:is([data-state~='hovered'], :hover):not([data-state~='disabled']):dir(rtl)::after {\n  transform: translateX(-40%);",
    );
    expect(base).toBeGreaterThanOrEqual(0);
    expect(twin).toBeGreaterThan(base);
  });
});
