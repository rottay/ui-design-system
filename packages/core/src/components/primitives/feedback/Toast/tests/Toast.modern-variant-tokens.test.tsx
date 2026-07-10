/**
 * Toast modern engine — variant surface token derivation (WO-ENG-21, P-41).
 *
 * Every variant `ToastVariant` admits must paint its background, text
 * colour, and border from tenant-derived DS tokens rather than inheriting
 * DaisyUI's un-tenanted `.alert` literals (base-100/base-content fill,
 * base-200 border).
 */
import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import ModernToast, { getAlertStyle } from '../engines/modern';
import { VARIANT_COLORS } from '../Toast.types';

describe('Toast modern engine — default variant', () => {
  it('reads the card surface tokens instead of an inherited literal', () => {
    render(<ModernToast variant="default" title="Notice" visible />);
    const alert = screen.getByRole('alert');

    expect(alert.style.background).toBe('var(--ds-card-bg)');
    expect(alert.style.color).toBe('var(--ds-card-color)');
  });

  it('keeps the structural `alert` class but drops the animate-* utility', () => {
    render(<ModernToast variant="default" title="Notice" visible />);
    const alert = screen.getByRole('alert');

    expect(alert.className).toContain('alert');
    expect(alert.className).not.toMatch(/animate-fade/);
  });
});

describe('Toast modern engine — siblings unaffected', () => {
  // jsdom's CSSOM (cssstyle) rejects the `background: color-mix(...)`
  // declaration outright (it drops from the style attribute entirely), so
  // only `color` — which jsdom parses fine — is asserted here. This is an
  // environment limitation, not a component behavior; it applies equally on
  // main and is not something this WO's change touches.
  it.each([
    ['success', 'var(--ds-color-success)'],
    ['error', 'var(--ds-color-error)'],
    ['warning', 'var(--ds-color-warning)'],
    ['info', 'var(--ds-color-info)'],
  ] as const)('%s still derives from its semantic color token', (variant, colorVar) => {
    render(<ModernToast variant={variant} title="Notice" visible />);
    const alert = screen.getByRole('alert');

    expect(alert.style.color).toBe(colorVar);
  });
});

describe('Toast modern engine — primary/secondary no longer fall through', () => {
  // Same jsdom color-mix limitation as above: primary/secondary's background
  // is a color-mix() expression and is asserted (as a resolved string, not a
  // DOM style) in the getAlertStyle() suite below instead.
  //
  // gradient has no case in this describe block: unlike primary/secondary,
  // BOTH of its background and color are `var(--ds-toast-gradient-*, var(--ds-color-...))`
  // chains -- a var() whose fallback is itself another var() call. jsdom's
  // CSSOM drops that shape from color/background/border/borderColor alike; a
  // bare no-fallback var() (what success/error/warning/info/primary/secondary
  // use for `color`) is the only form it renders reliably. gradient is
  // asserted only against getAlertStyle() below, where every field is
  // checked directly against the resolved string.
  it('primary derives from its semantic color token', () => {
    render(<ModernToast variant="primary" title="Notice" visible />);
    const alert = screen.getByRole('alert');

    expect(alert.style.color).toBe('var(--ds-color-primary)');
  });

  it('secondary derives from its semantic color token', () => {
    render(<ModernToast variant="secondary" title="Notice" visible />);
    const alert = screen.getByRole('alert');

    expect(alert.style.color).toBe('var(--ds-color-secondary)');
  });
});

describe('Toast modern engine — getAlertStyle() resolves every variant, including border', () => {
  // DaisyUI's `.alert` sets `border-color` from `--alert-border-color`
  // (base-200) as part of the base `.alert` rule, whenever no
  // `alert-{variant}` modifier class is applied -- and this engine never
  // applies one. Every variant needs an explicit border to stop inheriting
  // that un-tenanted grey, including the variants whose background/color
  // already came from a DS token.
  //
  // Asserted against the pure function rather than through the rendered DOM:
  // jsdom's CSSOM (cssstyle) drops any `border`, `borderColor`, `color`, or
  // `background` declaration whose value contains a var() with a fallback
  // (nested var() fallback: dropped entirely; `border`'s own width/style/color
  // decomposition additionally mis-assigns even a plain, non-var fallback to
  // all three longhands). A bare no-fallback var() is the only form it
  // renders reliably. Every VARIANT_COLORS[variant].borderColor value is a
  // nested-fallback chain (`var(--ds-toast-{variant}-border, var(--ds-color-...))`),
  // so no DOM-level assertion can observe any variant's border in this
  // environment. This is an environment limitation, not a component
  // behavior -- it is exactly why the "siblings unaffected" and
  // "primary/secondary" suites above assert only the bare-var `color` case
  // through the DOM.
  it.each([
    'default',
    'success',
    'error',
    'warning',
    'info',
    'primary',
    'secondary',
    'gradient',
  ] as const)('%s resolves a tenanted border from VARIANT_COLORS', (variant) => {
    const style = getAlertStyle(variant);

    expect(style.border).toBe(`1px solid ${VARIANT_COLORS[variant].borderColor}`);
  });

  it.each([
    ['default', 'var(--ds-card-bg)', 'var(--ds-card-color)'],
    ['success', 'color-mix(in srgb, var(--ds-color-success) 10%, transparent)', 'var(--ds-color-success)'],
    ['error', 'color-mix(in srgb, var(--ds-color-error) 10%, transparent)', 'var(--ds-color-error)'],
    ['warning', 'color-mix(in srgb, var(--ds-color-warning) 10%, transparent)', 'var(--ds-color-warning)'],
    ['info', 'color-mix(in srgb, var(--ds-color-info) 10%, transparent)', 'var(--ds-color-info)'],
    ['primary', 'color-mix(in srgb, var(--ds-color-primary) 10%, transparent)', 'var(--ds-color-primary)'],
    ['secondary', 'color-mix(in srgb, var(--ds-color-secondary) 10%, transparent)', 'var(--ds-color-secondary)'],
    ['gradient', VARIANT_COLORS.gradient.bg, VARIANT_COLORS.gradient.color],
  ] as const)('%s resolves the expected background and color', (variant, background, color) => {
    const style = getAlertStyle(variant);

    expect(style.background).toBe(background);
    expect(style.color).toBe(color);
  });
});
