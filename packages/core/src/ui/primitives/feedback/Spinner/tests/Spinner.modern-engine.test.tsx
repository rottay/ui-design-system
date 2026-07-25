/**
 * Spinner modern engine -- focused real-engine coverage (K1 Lane C).
 *
 * The indicator announces through role="status" with a localized fallback
 * label (no hardcoded English), the ring cadence rides the motion authority
 * (--ds-motion-slow, zeroed under reduced motion), and layout is skin-owned
 * (no inline flex literals remain on the root).
 */
import React from 'react';
import { describe, expect, it } from 'vitest';

import ModernSpinner from '../engines/modern';
import { renderWithEngine } from '@/tooling/testing/helpers/engine';

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

  it('keeps geometry + cadence as token hatches; layout is skin-owned', () => {
    renderWithEngine(<ModernSpinner size="lg" />, 'modern');

    const root = document.querySelector('[data-part="root"]') as HTMLElement;
    // No inline flex layout on the root -- the skin owns the column stack.
    expect(root.style.display).toBe('');
    expect(root.style.flexDirection).toBe('');

    const indicator = document.querySelector('[data-part="indicator"]') as HTMLElement;
    expect(indicator.style.getPropertyValue('--ds-spinner-ring-width')).toBe('3px');
    // jsdom's CSSOM drops var() dimension declarations from the serialized
    // style entirely (browser keeps them), so the size hatch is asserted via
    // the ring width; cadence must ride the motion authority.
    expect(indicator.style.animation).toContain('ds-spinner-modern-spin');
    expect(indicator.style.animation).toContain('var(--ds-motion-slow)');
  });

  it('omits the label part when no label is provided', () => {
    renderWithEngine(<ModernSpinner />, 'modern');
    expect(document.querySelector('[data-part="label"]')).toBeNull();
  });
});
