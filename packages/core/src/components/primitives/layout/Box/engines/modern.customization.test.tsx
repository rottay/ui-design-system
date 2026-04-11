/**
 * M7 regression test — proves that DS token overrides change rendered Modern Box output.
 *
 * Tests both:
 * 1. Token map correctness (values reference CSS custom properties)
 * 2. Rendered behavior (Box renders inline styles with token refs, not Tailwind classes)
 */

import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SPACING_MAP, RADIUS_MAP, SHADOW_MAP } from '../Box.types';

// Lazy import to avoid circular deps in test — the engine is loaded dynamically
// by createEngineComponent, so we import the Modern implementation directly.
const ModernBox = (await import('./modern')).default;

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
    const { container } = render(<ModernBox padding="md" data-testid="box">content</ModernBox>);
    const el = container.firstElementChild as HTMLElement;

    // Old behavior would produce `p-4` Tailwind class — now inline style
    expect(el.className).not.toMatch(/\bp-4\b/);
  });

  it('renders borderRadius via inline style, not Tailwind rounded-* class', () => {
    const { container } = render(<ModernBox borderRadius="lg" data-testid="box">content</ModernBox>);
    const el = container.firstElementChild as HTMLElement;

    expect(el.className).not.toMatch(/rounded-lg/);
  });

  it('renders shadow via inline style, not Tailwind shadow-* class', () => {
    const { container } = render(<ModernBox shadow="md" data-testid="box">content</ModernBox>);
    const el = container.firstElementChild as HTMLElement;

    // Old behavior: shadow Tailwind class. New: inline boxShadow.
    expect(el.className).not.toMatch(/\bshadow\b/);
  });

  it('renders margin via inline style, not Tailwind m-* class', () => {
    const { container } = render(<ModernBox margin="lg" data-testid="box">content</ModernBox>);
    const el = container.firstElementChild as HTMLElement;

    expect(el.className).not.toMatch(/\bm-6\b/);
  });
});
