/**
 * preview-scope unit tests -- shared scoping and sanitization primitives
 * (audit CMP-02).
 *
 * Every preview injector anchors its rules to PREVIEW_SCOPE_ATTRIBUTE and
 * filters declaration values through isSafePreviewCssValue before the CSS
 * reaches a <style> tag; hostile slugs and values must never escape the
 * preview container's scope.
 */

import { describe, it, expect } from 'vitest';
import {
  PREVIEW_SCOPE_ATTRIBUTE,
  buildPreviewScopeSelector,
  isSafePreviewCssValue,
  sanitizePreviewSlug,
} from '..';

describe('sanitizePreviewSlug', () => {
  it('keeps well-formed slugs unchanged', () => {
    expect(sanitizePreviewSlug('acme')).toBe('acme');
    expect(sanitizePreviewSlug('test-tenant-2')).toBe('test-tenant-2');
  });

  it('lowercases and strips characters that are not CSS-inert', () => {
    expect(sanitizePreviewSlug('ACME')).toBe('acme');
    expect(sanitizePreviewSlug("x'] zz [q='")).toBe('xzzq');
  });

  it('falls back to a fixed scope for all-hostile or empty slugs', () => {
    expect(sanitizePreviewSlug('')).toBe('preview');
    expect(sanitizePreviewSlug('\'"]{}')).toBe('preview');
  });
});

describe('buildPreviewScopeSelector', () => {
  it('anchors on the preview scope attribute with the sanitized slug', () => {
    expect(buildPreviewScopeSelector('acme')).toBe(
      `[${PREVIEW_SCOPE_ATTRIBUTE}='acme']`
    );
  });
});

describe('isSafePreviewCssValue', () => {
  it('accepts values the tenant CSS generator legitimately emits', () => {
    expect(isSafePreviewCssValue('#3b82f6')).toBe(true);
    expect(isSafePreviewCssValue('var(--ds-color-primary)')).toBe(true);
    expect(isSafePreviewCssValue('0 1px 2px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.04)')).toBe(true);
    expect(isSafePreviewCssValue('color-mix(in srgb, var(--ds-card-bg) 88%, var(--ds-color-primary-800) 12%)')).toBe(true);
    expect(isSafePreviewCssValue("'Inter', sans-serif")).toBe(true);
    expect(isSafePreviewCssValue('all 150ms cubic-bezier(0.4, 0, 0.2, 1)')).toBe(true);
    expect(isSafePreviewCssValue('translateY(-1px)')).toBe(true);
    expect(isSafePreviewCssValue('light-dark(#2f6b9a, #d06a9f)')).toBe(true);
  });

  it('rejects values that can escape the declaration or block', () => {
    expect(isSafePreviewCssValue('red;} html{background:black}')).toBe(false);
    expect(isSafePreviewCssValue('red; --x: y')).toBe(false);
    expect(isSafePreviewCssValue('red}')).toBe(false);
    expect(isSafePreviewCssValue('</style><script>alert(1)</script>')).toBe(false);
    expect(isSafePreviewCssValue('red /* comment */')).toBe(false);
  });

  it('rejects fetching, legacy-executable, and non-allowlisted function values', () => {
    expect(isSafePreviewCssValue('url(https://evil.example/x.png)')).toBe(false);
    expect(isSafePreviewCssValue('expression(alert(1))')).toBe(false);
    expect(isSafePreviewCssValue('image-set("x.png")')).toBe(false);
    expect(isSafePreviewCssValue('red !important')).toBe(false);
  });

  it('rejects unbalanced quotes and parens', () => {
    expect(isSafePreviewCssValue("rgba(0, 0, 0")).toBe(false);
    expect(isSafePreviewCssValue("'Inter")).toBe(false);
  });
});
