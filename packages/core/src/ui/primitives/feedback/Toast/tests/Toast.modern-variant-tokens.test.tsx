/**
 * Toast modern engine — variant surface token derivation (WO-ENG-21, P-41).
 *
 * Every variant `ToastVariant` admits must paint its background, text colour,
 * and border from tenant-derived DS tokens rather than inheriting DaisyUI's
 * un-tenanted `.alert` literals (base-100/base-content fill, base-200 border).
 *
 * WO-SKIN-03 moved that paint out of `getAlertStyle()` and into the unlayered
 * skin, so the derivation is now a two-part contract: the engine stamps the
 * tone, and `engines/modern/skin/toast.css` carries one rule per tone. Both
 * halves are pinned here — reading the skin also sidesteps the jsdom CSSOM
 * limitations (`color-mix()`, a `var()` whose fallback is another `var()`)
 * that kept the pre-migration suite from asserting several variants at all.
 *
 * Per-tone borders remain full, neutral container borders. No variant may
 * reintroduce a one-sided decorative rail.
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import React from 'react';
import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';

import ModernToast from '../engines/modern';
import { renderWithEngine } from '@/tooling/testing/helpers/engine';

const here = dirname(fileURLToPath(import.meta.url));
// Comments are stripped: the skin's header documents the very declarations
// asserted below, so matching raw text would both false-green the positive
// pins and false-red the longhand ban.
const SKIN = readFileSync(
  join(here, '../../../../../foundation/tokens/css/runtime/engines/modern/skin/toast.css'),
  'utf8'
).replace(/\/\*[\s\S]*?\*\//g, '');

const VARIANTS = [
  'default',
  'success',
  'error',
  'warning',
  'info',
  'primary',
  'secondary',
  'gradient',
] as const;

describe('Toast modern engine — the tone reaches the DOM', () => {
  it.each(VARIANTS)('%s stamps data-tone on the alert root', (variant) => {
    renderWithEngine(<ModernToast variant={variant} title="Notice" visible />, 'modern');
    const alert = screen.getByRole('alert');

    expect(alert.getAttribute('data-tone')).toBe(variant);
    expect(alert.getAttribute('data-part')).toBe('root');
  });

  it('is self-contained and drops external structural/animation utilities', () => {
    renderWithEngine(<ModernToast variant="default" title="Notice" visible />, 'modern');
    const alert = screen.getByRole('alert');

    expect(alert.className).toContain('rottay-toast--modern');
    expect(alert.className).not.toContain('alert');
    expect(alert.className).not.toMatch(/animate-fade/);
  });

  it('paints nothing inline: the surface is the skin`s to own', () => {
    renderWithEngine(<ModernToast variant="success" title="Notice" visible />, 'modern');
    const alert = screen.getByRole('alert');

    expect(alert.style.background).toBe('');
    expect(alert.style.color).toBe('');
    expect(alert.style.border).toBe('');
  });
});

describe('Toast modern engine — the skin derives every variant from tokens', () => {
  it.each(VARIANTS)('%s carries a rule keyed on its tone', (variant) => {
    expect(SKIN).toContain(`[data-part='root'][data-tone='${variant}']`);
  });

  it('uses one tokenized full-border recipe for every tone', () => {
    expect(SKIN).toContain('border: 1px solid color-mix(in srgb, var(--ds-toast-accent) 30%, var(--ds-color-border-subtle));');
  });

  it('never introduces a one-sided decorative border rail', () => {
    expect(SKIN).not.toMatch(/border-left-(width|style)\s*:/);
  });

  it.each([
    ['success', 'var(--ds-color-success)'],
    ['error', 'var(--ds-color-error)'],
    ['warning', 'var(--ds-color-warning)'],
    ['info', 'var(--ds-color-info)'],
    ['primary', 'var(--ds-color-primary)'],
    ['secondary', 'var(--ds-color-secondary)'],
  ] as const)('%s derives its accent from its semantic color token', (_variant, colorVar) => {
    expect(SKIN).toContain(`--ds-toast-accent: ${colorVar};`);
  });

  it('uses the shared premium surface and explicit anatomy', () => {
    expect(SKIN).toContain("[data-part='layout']");
    expect(SKIN).toContain("[data-part='icon']");
    expect(SKIN).toContain("[data-part='actions']");
    expect(SKIN).toContain('var(--ds-color-bg-primary)');
  });

  it('clamps the viewport-relative width to the containing block (R1: 390px in-flow hosts)', () => {
    expect(SKIN).toContain('max-inline-size: 100%;');
  });

  it('gradient keeps its token-first chain with the two-stop fallback', () => {
    expect(SKIN).toContain('--ds-toast-gradient-bg');
    expect(SKIN).toContain('linear-gradient(135deg, var(--ds-color-primary), var(--ds-color-secondary))');
    expect(SKIN).toContain('color: var(--ds-toast-gradient-color, var(--ds-color-text-on-primary));');
  });
});
