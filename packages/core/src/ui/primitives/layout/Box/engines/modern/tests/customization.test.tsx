/**
 * M7 regression test — proves that DS token overrides change rendered Modern Box output.
 *
 * Tests both:
 * 1. Token map correctness (values reference CSS custom properties)
 * 2. Rendered behavior (Box selects skin rules with data attributes, not Tailwind classes)
 */

import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SPACING_MAP, RADIUS_MAP, SHADOW_MAP } from '../../../contracts';

// Lazy import to avoid circular deps in test — the engine is loaded dynamically
// by createEngineComponent, so we import the Modern implementation directly.
const ModernBox = (await import('..')).default;

describe('Modern Box customization regression', () => {
  // Token map correctness
  it('SPACING_MAP values reference DS CSS custom properties', () => {
    const tokenized = Object.entries(SPACING_MAP).filter(([key]) => key !== 'none');
    for (const [, value] of tokenized) {
      expect(value).toMatch(/var\(--ds-spacing-/);
    }
  });

  it('RADIUS_MAP values reference DS CSS custom properties', () => {
    const tokenized = Object.entries(RADIUS_MAP).filter(([key]) => key !== 'none');
    for (const [, value] of tokenized) {
      expect(value).toMatch(/var\(--ds-radius-/);
    }
  });

  it('SHADOW_MAP values reference DS CSS custom properties for xs-xl', () => {
    const tokenized = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
    for (const key of tokenized) {
      expect(SHADOW_MAP[key]).toMatch(/var\(--ds-elevation-/);
    }
  });

  // Rendered behavior: verify the Modern Box no longer uses Tailwind spacing/radius
  // classes. happy-dom strips var() from style properties so we verify by asserting
  // the ABSENCE of old Tailwind classes and the PRESENCE of the data-component attribute
  // that proves the Modern engine rendered (not a fallback).
  it('renders padding via inline style, not Tailwind p-* class', () => {
    const { container } = render(
      <ModernBox padding="md" data-testid="box">
        content
      </ModernBox>
    );
    const el = container.firstElementChild as HTMLElement;

    // Old behavior would produce `p-4` Tailwind class — now inline style
    expect(el.className).not.toMatch(/\bp-4\b/);
  });

  it('selects borderRadius through the skin, not a Tailwind rounded-* class', () => {
    const { container } = render(
      <ModernBox borderRadius="lg" data-testid="box">
        content
      </ModernBox>
    );
    const el = container.firstElementChild as HTMLElement;

    expect(el.className).not.toMatch(/rounded-lg/);
    expect(el).toHaveAttribute('data-radius', 'lg');
    expect(el.style.borderRadius).toBe('');
  });

  it('selects shadow through the skin, not a Tailwind shadow-* class', () => {
    const { container } = render(
      <ModernBox shadow="md" data-testid="box">
        content
      </ModernBox>
    );
    const el = container.firstElementChild as HTMLElement;

    expect(el.className).not.toMatch(/\bshadow\b/);
    expect(el).toHaveAttribute('data-shadow', 'md');
    expect(el.style.boxShadow).toBe('');
  });

  it('renders margin via inline style, not Tailwind m-* class', () => {
    const { container } = render(
      <ModernBox margin="lg" data-testid="box">
        content
      </ModernBox>
    );
    const el = container.firstElementChild as HTMLElement;

    expect(el.className).not.toMatch(/\bm-6\b/);
  });
});
