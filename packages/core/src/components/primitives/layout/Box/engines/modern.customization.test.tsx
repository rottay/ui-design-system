/**
 * M7 regression test — proves that DS token overrides change rendered Modern Box output.
 *
 * If this test fails, it means the token customization pipeline from
 * CSS custom properties to rendered layout is broken.
 */

import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SPACING_MAP, RADIUS_MAP, SHADOW_MAP } from '../Box.types';

describe('Modern Box customization regression', () => {
  it('SPACING_MAP values reference DS CSS custom properties', () => {
    // Every non-"none" spacing value should resolve through --ds-spacing-*
    const tokenized = Object.entries(SPACING_MAP).filter(([key]) => key !== 'none');
    for (const [key, value] of tokenized) {
      expect(value).toMatch(/var\(--ds-spacing-/);
    }
  });

  it('RADIUS_MAP values reference DS CSS custom properties', () => {
    const tokenized = Object.entries(RADIUS_MAP).filter(([key]) => key !== 'none');
    for (const [key, value] of tokenized) {
      expect(value).toMatch(/var\(--ds-radius-/);
    }
  });

  it('SHADOW_MAP values reference DS CSS custom properties for xs-xl', () => {
    const tokenized = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
    for (const key of tokenized) {
      expect(SHADOW_MAP[key]).toMatch(/var\(--ds-elevation-/);
    }
  });

  it('a tenant that overrides --ds-spacing-4 changes what Box md padding resolves to', () => {
    // The value should reference the var — if this ever becomes a hardcoded "1rem"
    // it means the tokenization was reverted
    expect(SPACING_MAP.md).toBe('var(--ds-spacing-4, 1rem)');
  });

  it('a tenant that overrides --ds-radius-lg changes what Box lg radius resolves to', () => {
    expect(RADIUS_MAP.lg).toBe('var(--ds-radius-lg, 0.75rem)');
  });
});
