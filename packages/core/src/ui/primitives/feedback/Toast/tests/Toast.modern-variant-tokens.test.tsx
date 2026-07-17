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
 * The per-tone `border` MUST stay a shorthand: Toast-modern's root carries
 * DaisyUI's structural `alert` class, which `personality.css` targets with a
 * `border-left-width: 4px` accent bar. The inline shorthand suppressed it; a
 * skin that split the shorthand into longhands would leave that bar
 * uncontested and re-materialise it on every modern toast.
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import ModernToast from '../engines/modern';
import { VARIANT_COLORS } from '../contracts';

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
    render(<ModernToast variant={variant} title="Notice" visible />);
    const alert = screen.getByRole('alert');

    expect(alert.getAttribute('data-tone')).toBe(variant);
    expect(alert.getAttribute('data-part')).toBe('root');
  });

  it('keeps the structural `alert` class but drops the animate-* utility', () => {
    render(<ModernToast variant="default" title="Notice" visible />);
    const alert = screen.getByRole('alert');

    expect(alert.className).toContain('alert');
    expect(alert.className).not.toMatch(/animate-fade/);
  });

  it('paints nothing inline: the surface is the skin`s to own', () => {
    render(<ModernToast variant="success" title="Notice" visible />);
    const alert = screen.getByRole('alert');

    expect(alert.style.background).toBe('');
    expect(alert.style.color).toBe('');
    expect(alert.style.border).toBe('');
  });
});

describe('Toast modern engine — the skin derives every variant from tokens', () => {
  it.each(VARIANTS)('%s carries a fill + text rule keyed on its tone', (variant) => {
    expect(SKIN).toContain(`[data-part='root'][data-tone='${variant}']`);
  });

  it.each(VARIANTS)('%s borders from its VARIANT_COLORS token, as a shorthand', (variant) => {
    expect(SKIN).toContain(`border: 1px solid ${VARIANT_COLORS[variant].borderColor};`);
  });

  it('never leaves a border longhand for personality.css`s accent bar to win', () => {
    expect(SKIN).not.toMatch(/border-left-(width|style)\s*:/);
  });

  it.each([
    ['success', 'var(--ds-color-success)'],
    ['error', 'var(--ds-color-error)'],
    ['warning', 'var(--ds-color-warning)'],
    ['info', 'var(--ds-color-info)'],
    ['primary', 'var(--ds-color-primary)'],
    ['secondary', 'var(--ds-color-secondary)'],
  ] as const)('%s still derives its text from its semantic color token', (_variant, colorVar) => {
    expect(SKIN).toContain(`color: ${colorVar};`);
  });

  it('default reads the card surface tokens, not an inherited DaisyUI literal', () => {
    expect(SKIN).toContain('background: var(--ds-card-bg);');
    expect(SKIN).toContain('color: var(--ds-card-color);');
  });

  it('gradient keeps its token-first chain with the two-stop fallback', () => {
    expect(SKIN).toContain('--ds-toast-gradient-bg');
    expect(SKIN).toContain('linear-gradient(135deg, var(--ds-color-primary), var(--ds-color-secondary))');
    expect(SKIN).toContain('color: var(--ds-toast-gradient-color, var(--ds-color-text-on-primary));');
  });
});
