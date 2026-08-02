/**
 * Tests for responsive style-property runtime projection.
 */

import { describe, it, expect } from 'vitest';
import { isResponsiveValue, generateResponsiveCSS, type ResponsivePropEntry } from '..';

describe('isResponsiveValue', () => {
  it('returns false for plain string values', () => {
    expect(isResponsiveValue('md')).toBe(false);
    expect(isResponsiveValue('block')).toBe(false);
  });

  it('returns false for numbers', () => {
    expect(isResponsiveValue(16)).toBe(false);
    expect(isResponsiveValue(0)).toBe(false);
  });

  it('returns false for null and undefined', () => {
    expect(isResponsiveValue(null)).toBe(false);
    expect(isResponsiveValue(undefined)).toBe(false);
  });

  it('returns false for arrays', () => {
    expect(isResponsiveValue([16, 24])).toBe(false);
  });

  it('returns true for objects with breakpoint keys', () => {
    expect(isResponsiveValue({ xs: 'sm', lg: 'xl' })).toBe(true);
    expect(isResponsiveValue({ sm: 'md' })).toBe(true);
    expect(isResponsiveValue({ md: 'lg', xl: '2xl' })).toBe(true);
  });

  it('returns true for objects with alias keys', () => {
    expect(isResponsiveValue({ base: 'sm' })).toBe(true);
    expect(isResponsiveValue({ phone: 'column', tablet: 'row' })).toBe(true);
    expect(isResponsiveValue({ desktop: 'row' })).toBe(true);
  });

  it('returns false for objects with no valid breakpoint keys', () => {
    expect(isResponsiveValue({ foo: 'bar' })).toBe(false);
    expect(isResponsiveValue({ invalid: 123 })).toBe(false);
  });
});

describe('generateResponsiveCSS', () => {
  it('returns empty CSS for empty entries', () => {
    const result = generateResponsiveCSS('test-id', []);
    expect(result.css).toBe('');
    expect(result.attrs).toEqual({});
  });

  it('generates base (xs) CSS without media query', () => {
    const entries: ResponsivePropEntry[] = [
      { cssProperty: 'padding', value: { xs: 'sm' }, resolve: (v) => v === 'sm' ? '0.5rem' : '0' },
    ];
    const result = generateResponsiveCSS('test-1', entries);
    expect(result.css).toContain('[data-responsive-id="test-1"]');
    expect(result.css).toContain('padding: 0.5rem;');
    expect(result.css).not.toContain('@media');
    expect(result.attrs).toEqual({ 'data-responsive-id': 'test-1' });
  });

  it('generates @media queries for non-xs breakpoints', () => {
    const entries: ResponsivePropEntry[] = [
      { cssProperty: 'display', value: { xs: 'none', lg: 'block' } },
    ];
    const result = generateResponsiveCSS('test-2', entries);
    expect(result.css).toContain('display: none;');
    expect(result.css).toContain('@media (min-width: 1024px)');
    expect(result.css).toContain('display: block;');
  });

  it('resolves alias keys to canonical breakpoints', () => {
    const entries: ResponsivePropEntry[] = [
      { cssProperty: 'flex-direction', value: { phone: 'column', tablet: 'row', desktop: 'row-reverse' } },
    ];
    const result = generateResponsiveCSS('test-3', entries);
    // phone -> xs (no media query)
    expect(result.css).toContain('flex-direction: column;');
    // tablet -> sm (640px)
    expect(result.css).toContain('@media (min-width: 640px)');
    expect(result.css).toContain('flex-direction: row;');
    // desktop -> lg (1024px)
    expect(result.css).toContain('@media (min-width: 1024px)');
    expect(result.css).toContain('flex-direction: row-reverse;');
  });

  it('resolves base alias to xs', () => {
    const entries: ResponsivePropEntry[] = [
      { cssProperty: 'gap', value: { base: '8px', md: '16px' } },
    ];
    const result = generateResponsiveCSS('test-4', entries);
    // base -> xs (no media query)
    expect(result.css).toContain('gap: 8px;');
    // md -> 768px
    expect(result.css).toContain('@media (min-width: 768px)');
    expect(result.css).toContain('gap: 16px;');
  });

  it('handles multiple CSS properties in the same breakpoint', () => {
    const entries: ResponsivePropEntry[] = [
      { cssProperty: 'padding', value: { xs: '8px', lg: '24px' } },
      { cssProperty: 'margin', value: { xs: '4px', lg: '16px' } },
    ];
    const result = generateResponsiveCSS('test-5', entries);
    // Both properties in xs block
    expect(result.css).toContain('padding: 8px;');
    expect(result.css).toContain('margin: 4px;');
    // Both properties in lg block
    const lgBlock = result.css.split('@media (min-width: 1024px)')[1];
    expect(lgBlock).toContain('padding: 24px;');
    expect(lgBlock).toContain('margin: 16px;');
  });

  it('uses custom resolve function', () => {
    const entries: ResponsivePropEntry<number>[] = [
      {
        cssProperty: 'gap',
        value: { xs: 16, lg: 32 },
        resolve: (v: number) => `${v}px`,
      },
    ];
    const result = generateResponsiveCSS('test-6', entries);
    expect(result.css).toContain('gap: 16px;');
    expect(result.css).toContain('gap: 32px;');
  });

  it('canonical key takes precedence over alias', () => {
    const entries: ResponsivePropEntry[] = [
      { cssProperty: 'display', value: { xs: 'flex', phone: 'block' } },
    ];
    const result = generateResponsiveCSS('test-7', entries);
    // xs should win over phone since it is the canonical key
    expect(result.css).toContain('display: flex;');
  });
});
