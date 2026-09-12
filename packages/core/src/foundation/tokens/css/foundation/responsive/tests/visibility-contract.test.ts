/**
 * The responsive visibility sheet is a projection of the boundary vocabulary.
 *
 * Show, Hide and ResponsiveSlot stamp one attribute each; this sheet is every
 * rule that answers them. The test pins the two together so a boundary the
 * components can express always has a rule, and a rule never outlives its
 * boundary.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, it, expect } from 'vitest';

import {
  RESPONSIVE_HIDE_ATTRIBUTE,
  RESPONSIVE_SHOW_ATTRIBUTE,
  responsiveVisibilityQuery,
  responsiveVisibilityToken,
} from '@/foundation/contracts/kernel/responsive/visibility';

import {
  buildResponsiveVisibilitySheet,
  responsiveVisibilityTokens,
} from './projection';

const SHEET_PATH = join(__dirname, '../visibility/index.css');
const sheet = (): string => readFileSync(SHEET_PATH, 'utf8');

describe('responsive visibility sheet', () => {
  it('is byte-for-byte the contract projection', () => {
    expect(sheet()).toBe(buildResponsiveVisibilitySheet());
  });

  it('declares the default state of both modes', () => {
    const css = sheet();
    expect(css).toContain(`[${RESPONSIVE_SHOW_ATTRIBUTE}] {\n  display: none;\n}`);
    expect(css).toContain(`[${RESPONSIVE_HIDE_ATTRIBUTE}] {\n  display: contents;\n}`);
  });

  it('answers every token a boundary can stamp, except the one that means never', () => {
    const css = sheet();
    for (const token of responsiveVisibilityTokens()) {
      const answered = css.includes(`[${RESPONSIVE_SHOW_ATTRIBUTE}="${token}"]`);
      // `below:xs` is an upper bound of 0px: it matches no width, so the
      // default rules already are its whole behaviour.
      expect(answered, token).toBe(token !== 'below:xs');
    }
  });

  it('collapses device aliases onto the ladder rather than duplicating rules', () => {
    expect(responsiveVisibilityToken({ from: 'tablet' })).toBe('from:sm');
    expect(responsiveVisibilityToken({ from: 'desktop' })).toBe('from:lg');
    expect(responsiveVisibilityToken({ below: 'phone' })).toBe('below:xs');
    expect(responsiveVisibilityToken({})).toBeNull();
  });

  it('keeps the device bands the public contract documents', () => {
    expect(responsiveVisibilityQuery({ on: 'phone' })).toBe('(max-width: 639px)');
    expect(responsiveVisibilityQuery({ on: 'tablet' })).toBe(
      '(min-width: 640px) and (max-width: 1023px)',
    );
    expect(responsiveVisibilityQuery({ on: 'desktop' })).toBe('(min-width: 1024px)');
    expect(responsiveVisibilityQuery({ below: 'phone' })).toBe('not all');
  });
});
