/**
 * Toast modern engine — variant surface token derivation (WO-ENG-21).
 *
 * The `default` variant must paint from tenant-derived DS tokens, the same
 * way its success/error/warning/info siblings already do, rather than
 * inheriting DaisyUI's un-tenanted `.alert` base-100/base-content literals.
 */
import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import ModernToast from '../engines/modern';

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
