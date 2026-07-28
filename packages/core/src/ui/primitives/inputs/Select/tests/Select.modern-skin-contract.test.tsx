/**
 * Select modern engine — R2+R3 (BATCH C) ownership + i18n contract.
 *
 * Pass 1 pins: the skin is the single paint owner (per-size geometry rides
 * `data-size` through documented `--ds-select-trigger-*` channels, never
 * inline), and the engine resolves every visible string through
 * `useOptionalTranslation` with the catalogued English floor — never a hard
 * `useTranslation`.
 *
 * Pass 2 pins: the Quiet Premium grammar — flat control surface, hairline
 * borders, opt-in backdrop blur, no literal `white` substrate mixes, and
 * motion that always rides the `--ds-motion-*` canon with reduced-motion and
 * forced-colors postures.
 */

import React, { Suspense } from 'react';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';

import { renderWithEngine } from '../../../../../tooling/testing/helpers/engine';

const here = dirname(fileURLToPath(import.meta.url));
const modernEngine = readFileSync(join(here, '../engines/modern/index.tsx'), 'utf8');
const modernSkin = readFileSync(
  join(here, '../../../../../foundation/tokens/css/runtime/engines/modern/skin/select.css'),
  'utf8'
);
/** Comment-stripped skin: prose in the header must not satisfy a pin. */
const SKIN = modernSkin.replace(/\/\*[\s\S]*?\*\//g, '');

const OPTIONS = [
  { label: 'Alpha', value: 'alpha' },
  { label: 'Bravo', value: 'bravo' },
] as const;

describe('Select modern — single paint owner (Pass 1)', () => {
  it('the engine carries no sizing/typography style builders', () => {
    expect(modernEngine).not.toContain('buildTriggerStyle');
    expect(modernEngine).not.toContain('nativeSelectStyle');
    expect(modernEngine).not.toMatch(/const SIZES\s*=/);
    expect(modernEngine).not.toMatch(/const TRANSITION\s*=/);
  });

  it('the engine stamps data-size and the skin owns the per-size geometry', () => {
    for (const size of ['xs', 'sm', 'md', 'lg', 'xl']) {
      expect(SKIN).toContain(`[data-size='${size}'] [data-part='trigger']`);
      expect(SKIN).toContain(`--ds-select-trigger-${size}-height`);
      expect(SKIN).toContain(`--ds-select-trigger-${size}-padding-x`);
      expect(SKIN).toContain(`--ds-select-trigger-${size}-font-size`);
    }
  });

  it('the skin owns the dropdown entry motion and the loading spinner', () => {
    expect(SKIN).toMatch(/animation:\s*ds-select-appear/);
    expect(SKIN).toMatch(/\[data-part='loading-spinner'\][\s\S]*?animation:\s*ds-foundation-spin/);
    expect(modernEngine).not.toContain("animation: 'ds-select-appear");
    expect(modernEngine).not.toContain("animation: 'ds-foundation-spin");
  });

  it('native-branch layout is logical (RTL-safe), never physical', () => {
    expect(modernEngine).not.toContain("right: '32px'");
    expect(modernEngine).not.toContain('paddingLeft');
    expect(modernEngine).not.toContain('paddingRight');
    expect(SKIN).toContain('inset-inline-end');
    expect(SKIN).toContain('padding-inline-end');
  });

  it('the custom trigger renders with no inline style at all', async () => {
    const { Select } = await import('..');
    renderWithEngine(
      <Suspense fallback={<div>Loading…</div>}>
        <Select engine="modern" options={OPTIONS as any} multiple forceCustomDropdown />
      </Suspense>,
      'modern'
    );

    const trigger = await screen.findByRole('combobox');
    expect(trigger.getAttribute('style') ?? '').toBe('');
    expect(trigger.getAttribute('data-part')).toBe('trigger');
    // `data-size` rides the shell root (single owner of the size contract).
    expect(trigger.closest("[data-part='root']")?.getAttribute('data-size')).toBe('md');
  });
});

describe('Select modern — i18n English floor (Pass 1)', () => {
  it('the engine never hooks the translator hard', () => {
    expect(modernEngine).not.toMatch(/\buseTranslation\b/);
    expect(modernEngine).toContain('useOptionalTranslation');
  });

  it('renders the catalogued English floor with no provider mounted', async () => {
    const { Select } = await import('..');
    renderWithEngine(
      <Suspense fallback={<div>Loading…</div>}>
        <Select engine="modern" options={OPTIONS as any} />
      </Suspense>,
      'modern'
    );

    const select = (await screen.findByRole('combobox')) as HTMLSelectElement;
    expect(select.querySelector('option[value=""]')).toHaveTextContent('Select an option');
  });

  it('keeps the English floor in the custom branch placeholder', async () => {
    const { Select } = await import('..');
    const { container } = renderWithEngine(
      <Suspense fallback={<div>Loading…</div>}>
        <Select engine="modern" options={OPTIONS as any} forceCustomDropdown />
      </Suspense>,
      'modern'
    );

    await screen.findByRole('combobox');
    expect(container.querySelector("[data-part='placeholder']")).toHaveTextContent(
      'Select an option'
    );
  });
});

describe('Select modern — Quiet Premium grammar (Pass 2)', () => {
  it('paints the trigger flat: one surface, one hairline, focus ring by shadow', () => {
    expect(SKIN).toContain('background: var(--ds-select-bg, var(--ds-surface-control));');
    expect(SKIN).toContain('box-shadow: var(--ds-select-shadow-focus, var(--ds-focus-ring));');
    // No glass gradients or inset top-highlights on the trigger.
    const triggerRules = SKIN.match(/\[data-part='trigger'\][^{]*\{[^}]*\}/g) ?? [];
    for (const rule of triggerRules) {
      expect(rule).not.toContain('linear-gradient');
      expect(rule).not.toContain('inset 0 1px 0');
    }
  });

  it('has no literal white substrate mixes (tokens or documented hatches only)', () => {
    expect(SKIN).not.toContain('color-mix(in srgb, white');
  });

  it('makes the backdrop blur tenant opt-in (default: none)', () => {
    expect(SKIN).toContain('backdrop-filter: var(--ds-select-backdrop-filter, none);');
    expect(SKIN).not.toContain('blur(var(--ds-select-backdrop-blur');
  });

  it('lifts nothing on hover: options change surface and ink, not position', () => {
    expect(SKIN).not.toContain('translateY(-1px)');
    expect(SKIN).not.toMatch(/filter:\s*saturate/);
  });

  it('keeps the eyebrow group labels and the open-chevron accent', () => {
    expect(SKIN).toMatch(/\[data-part='group-label'\][^{]*\{[^}]*text-transform: uppercase/);
    expect(SKIN).toContain("--ds-select-arrow-color-open, var(--ds-color-primary)");
  });

  it('guards reduced motion and forced colors', () => {
    expect(SKIN).toContain('@media (prefers-reduced-motion: reduce)');
    expect(SKIN).toContain('@media (forced-colors: active)');
  });
});
