/**
 * Spinner modern engine -- focused real-engine coverage (K1 Lane C; R2+R3
 * ownership pass).
 *
 * The indicator announces through role="status" with a localized fallback
 * label (no hardcoded English), the ring cadence rides the motion authority
 * (--ds-motion-slow, zeroed under reduced motion), and ALL paint — ring
 * geometry per `data-size`, colors, animation, label typography — is
 * skin-owned: the engine stamps no inline style beyond the caller's own.
 */
import React from 'react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import ModernSpinner from '../engines/modern';
import { renderWithEngine } from '@/tooling/testing/helpers/engine';

const modernSkinPath = join(
  __dirname,
  '../../../../../foundation/tokens/css/runtime/engines/modern/skin/spinner.css',
);

describe('Spinner modern engine', () => {
  it('announces with role=status and the explicit label', () => {
    renderWithEngine(<ModernSpinner label="Processing payment" />, 'modern');

    const indicator = document.querySelector('[data-part="indicator"]');
    expect(indicator).toHaveAttribute('role', 'status');
    expect(indicator).toHaveAttribute('aria-label', 'Processing payment');
  });

  it('falls back to the localized loading string (i18n key, not a literal)', () => {
    renderWithEngine(<ModernSpinner />, 'modern');

    const indicator = document.querySelector('[data-part="indicator"]');
    // EN catalog common.loading = "Loading..."; the key point is the engine
    // no longer hardcodes the English word "Loading".
    expect(indicator).toHaveAttribute('aria-label', 'Loading...');
  });

  it('stamps the data-size contract and zero inline paint or geometry', () => {
    renderWithEngine(<ModernSpinner size="lg" />, 'modern');

    const root = document.querySelector('[data-part="root"]') as HTMLElement;
    expect(root).toHaveAttribute('data-size', 'lg');
    // No inline layout on the root -- the skin owns the column stack.
    expect(root.style.display).toBe('');
    expect(root.style.flexDirection).toBe('');

    // The indicator carries semantics only; geometry, color and cadence are
    // all skin-owned (no inline style attribute at all).
    const indicator = document.querySelector('[data-part="indicator"]') as HTMLElement;
    expect(indicator).not.toHaveAttribute('style');
  });

  it('keeps ring geometry, cadence and the reduced-motion guard in the skin', () => {
    const skin = readFileSync(modernSkinPath, 'utf-8');

    expect(skin).toContain("[data-size='lg']");
    expect(skin).toContain('--ds-spinner-lg-size');
    expect(skin).toContain('@keyframes ds-spinner-modern-spin');
    expect(skin).toContain('var(--ds-spinner-duration, calc(var(--ds-motion-slow) * 2))');
    expect(skin).toContain('var(--ds-spinner-spin-easing, linear) infinite');
    expect(skin).toContain('--ds-spinner-track-color');
    expect(skin).toContain('--ds-spinner-segment-color');
    expect(skin).toContain('border-inline-end-color');
    expect(skin).toContain('@media (prefers-reduced-motion: reduce)');
  });

  it('omits the label part when no label is provided', () => {
    renderWithEngine(<ModernSpinner />, 'modern');
    expect(document.querySelector('[data-part="label"]')).toBeNull();
  });
});
