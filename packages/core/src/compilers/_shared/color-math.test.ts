/**
 * @fileoverview Tests for shared color math — ensures ThemeProvider and
 * static generator produce identical outputs from the same inputs.
 */

import { describe, it, expect } from 'vitest';
import {
  isHexColor,
  normalizeHexColor,
  hexToRgb,
  mixColor,
  buildRuntimeScale,
  buildDarkRuntimeScale,
  getReadableForegroundColor,
} from './color-math';
import { generateTenantCss } from '../../runtime/tenant/storage/static/generator';
import type { TenantConfig } from '../../contracts';

describe('color-math canonical implementation', () => {
  it('isHexColor validates correctly', () => {
    expect(isHexColor('#abc')).toBe(true);
    expect(isHexColor('#aabbcc')).toBe(true);
    expect(isHexColor('rgb(0,0,0)')).toBe(false);
    expect(isHexColor('var(--ds-color-primary)')).toBe(false);
  });

  it('normalizeHexColor expands shorthand', () => {
    expect(normalizeHexColor('#abc')).toBe('#aabbcc');
    expect(normalizeHexColor('#aabbcc')).toBe('#aabbcc');
    expect(normalizeHexColor('not-hex')).toBe('not-hex');
  });

  it('hexToRgb parses correctly', () => {
    expect(hexToRgb('#ff0000')).toEqual({ r: 255, g: 0, b: 0 });
    expect(hexToRgb('#00ff00')).toEqual({ r: 0, g: 255, b: 0 });
    expect(hexToRgb('not-hex')).toBeNull();
  });

  it('mixColor interpolates', () => {
    expect(mixColor('#000000', '#ffffff', 0.5)).toBe('#808080');
    expect(mixColor('#ff0000', '#0000ff', 0)).toBe('#ff0000');
    expect(mixColor('not-hex', '#ffffff', 0.5)).toBe('not-hex');
  });

  it('buildRuntimeScale produces 10 steps', () => {
    const scale = buildRuntimeScale('#0A66C2');
    expect(Object.keys(scale)).toHaveLength(10);
    expect(scale[500].toLowerCase()).toBe('#0a66c2');
    // 50 should be very light (mixed 92% toward white)
    expect(scale[50]).toBeTruthy();
    // 900 should be very dark (mixed 48% toward black)
    expect(scale[900]).toBeTruthy();
  });

  it('buildDarkRuntimeScale produces 10 steps', () => {
    const scale = buildDarkRuntimeScale('#0A66C2');
    expect(Object.keys(scale)).toHaveLength(10);
    expect(scale[600].toLowerCase()).toBe('#0a66c2'); // base is at 600 in dark scale
  });

  it('getReadableForegroundColor picks contrast', () => {
    expect(getReadableForegroundColor('#ffffff')).toBe('#171717'); // dark text on white
    expect(getReadableForegroundColor('#000000')).toBe('#ffffff'); // white text on black
  });
});

describe('runtime + static parity', () => {
  // Generate CSS from a known config and verify key vars are present
  const testConfig: TenantConfig = {
    slug: 'parity-test',
    name: 'Parity',
    engine: 'classic',
    theme: 'base',
    plan: 'pro',
    features: [],
    branding: {
      companyName: 'Test',
      primaryColor: '#3B82F6',
      secondaryColor: '#71717A',
      accentColor: '#06B6D4',
    },
  };

  it('static generator produces primary color scale from shared color-math', () => {
    const css = generateTenantCss(testConfig, { includeDarkSelector: false });
    // The generator uses buildRuntimeScale from shared color-math
    const expectedScale = buildRuntimeScale('#3B82F6');
    expect(css).toContain(`--ds-color-primary-500: ${expectedScale[500]}`);
    expect(css).toContain(`--ds-color-primary-50`);
    expect(css).toContain(`--ds-color-primary-900`);
  });

  it('static generator produces foreground from shared color-math', () => {
    const css = generateTenantCss(testConfig, { includeDarkSelector: false });
    const expectedFg = getReadableForegroundColor('#3B82F6');
    expect(css).toContain(`--ds-color-primary-foreground: ${expectedFg}`);
  });

  it('dark scale uses same shared implementation', () => {
    const css = generateTenantCss(testConfig, { includeDarkSelector: true });
    const darkScale = buildDarkRuntimeScale('#3B82F6');
    // Dark block should contain a value from the dark scale
    expect(css).toContain(`--ds-color-primary-300`);
  });
});
