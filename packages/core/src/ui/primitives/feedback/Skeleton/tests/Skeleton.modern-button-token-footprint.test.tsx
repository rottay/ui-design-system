import React from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

import { SkeletonButton } from '../compound/Button';

/**
 * jsdom's CSS parser silently drops `calc()` chains containing `var()` from
 * typed properties, so the authored declarations are read off the SSR markup.
 */
const declarations = (element: React.ReactElement): Map<string, string> => {
  const html = renderToStaticMarkup(element);
  const style = /style="([^"]*)"/.exec(html)?.[1] ?? '';
  return new Map(
    style
      .replace(/&quot;/g, '"')
      .split(';')
      .map((part) => part.split(/:(.*)/s))
      .filter((pair) => pair.length > 1)
      .map(([prop, value]) => [prop.trim(), value.trim()])
  );
};

describe('SkeletonButton tenant footprint', () => {
  it.each([
    ['sm', 24],
    ['md', 32],
    ['lg', 40],
  ] as const)('reads the %s button height channel with the historical fallback', (size, fallback) => {
    expect(declarations(<SkeletonButton size={size} />).get('height')).toBe(
      `calc(var(--ds-button-${size}-height, ${fallback}px) * var(--ds-density-effective-scale, 1))`
    );
  });

  it('scales the width preset by the density plane', () => {
    expect(declarations(<SkeletonButton size="md" />).get('width')).toBe(
      'calc(80px * var(--ds-density-effective-scale, 1))'
    );
  });

  it('follows the size-matched button radius by default', () => {
    expect(
      declarations(<SkeletonButton size="lg" />).get('--ds-skeleton-button-radius')
    ).toBe('var(--ds-button-lg-radius, 4px)');
  });

  it('rides the tenant full-radius channel for the pill shape', () => {
    expect(
      declarations(<SkeletonButton shape="round" />).get('--ds-skeleton-button-radius')
    ).toBe('var(--ds-radius-full, 9999px)');
  });

  it('squares the circle shape off the resolved height, not the width preset', () => {
    const decls = declarations(<SkeletonButton shape="circle" size="md" />);

    expect(decls.get('height')).toBe(
      'calc(var(--ds-button-md-height, 32px) * var(--ds-density-effective-scale, 1))'
    );
    expect(decls.get('width')).toBe(decls.get('height'));
    expect(decls.get('--ds-skeleton-button-radius')).toBe('50%');
  });

  it('never emits a bare pixel literal for the block axis', () => {
    const decls = declarations(<SkeletonButton size="lg" />);

    expect(decls.get('height')).not.toBe('40px');
    expect(decls.get('height')).toContain('--ds-button-lg-height');
  });
});
