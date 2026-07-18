/**
 * preview-css unit tests -- scoping and sanitization contract (audit CMP-02).
 *
 * The generator emits rules against html[data-tenant='<slug>'], which is the
 * document-root attribute owned by TenantProvider. buildPreviewCss must
 * re-anchor every rule to the preview scope attribute and neutralize hostile
 * slugs, names, and values before the CSS reaches a <style> tag.
 */

import { describe, it, expect } from 'vitest';
import {
  buildPreviewCss,
  buildPreviewScopeSelector,
  isSafePreviewCssValue,
  sanitizePreviewSlug,
  PREVIEW_SCOPE_ATTRIBUTE,
} from '..';
import {
  createTenantConfig,
  type TenantCreationConfig,
} from '../../../../../../../infrastructure/runtime/tenant/runtime/authoring/configuration';
import { generateTenantCss } from '../../../../../../../infrastructure/runtime/tenant';
import type { TenantConfig } from '../../../../../../../foundation/contracts';

const sampleCreation: TenantCreationConfig = {
  slug: 'acme',
  name: 'ACME Corp',
  primaryColor: '#3B82F6',
  secondaryColor: '#10B981',
  personality: 'formal',
};

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

describe('isSafePreviewCssValue', () => {
  it('accepts values the tenant CSS generator legitimately emits', () => {
    expect(isSafePreviewCssValue('#3b82f6')).toBe(true);
    expect(isSafePreviewCssValue('var(--ds-color-primary)')).toBe(true);
    expect(isSafePreviewCssValue('0 1px 2px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.04)')).toBe(true);
    expect(isSafePreviewCssValue('color-mix(in srgb, var(--ds-card-bg) 88%, var(--ds-color-primary-800) 12%)')).toBe(true);
    expect(isSafePreviewCssValue("'Inter', sans-serif")).toBe(true);
    expect(isSafePreviewCssValue('all 150ms cubic-bezier(0.4, 0, 0.2, 1)')).toBe(true);
    expect(isSafePreviewCssValue('translateY(-1px)')).toBe(true);
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

describe('buildPreviewCss scoping', () => {
  it('re-anchors every rule to the preview scope selector and keeps all generated declarations', () => {
    const presets = ['formal', 'neutral', 'playful', 'expressive'] as const;
    const densities = ['compact', 'comfortable', 'spacious'] as const;

    for (const personality of presets) {
      for (const density of densities) {
        const config = createTenantConfig({ ...sampleCreation, personality, density });
        const raw = generateTenantCss(config, {
          includeDarkSelector: false,
          includeSystemDarkSelector: false,
        });
        const rawDeclarationCount = raw
          .split('\n')
          .filter((line) => /^ {2}\S.*;$/.test(line)).length;

        const { css, safeSlug, scopeSelector } = buildPreviewCss(config);
        const keptDeclarationCount = css
          .split('\n')
          .filter((line) => /^ {2}\S.*;$/.test(line)).length;

        expect(safeSlug).toBe('acme');
        expect(scopeSelector).toBe(buildPreviewScopeSelector('acme'));
        // Sanitization must be lossless on legitimate generator output.
        expect(keptDeclarationCount).toBe(rawDeclarationCount);
        expect(keptDeclarationCount).toBeGreaterThan(0);
        expect(css.startsWith(`${scopeSelector} {`)).toBe(true);
        expect(css).not.toContain('html[data-tenant');
      }
    }
  });

  it('emits no html[data-tenant] rule even when previewing the active tenant slug', () => {
    const config = createTenantConfig({ ...sampleCreation, slug: 'bithire' });
    const { css, scopeSelector } = buildPreviewCss(config);

    expect(css).not.toContain('html');
    expect(css).toContain('--ds-color-primary');
    for (const line of css.split('\n').filter((l) => l.endsWith('{'))) {
      expect(line.startsWith(scopeSelector)).toBe(true);
    }
  });
});

describe('buildPreviewCss hostile input neutralization', () => {
  it('drops declarations whose value could close the block and restyle the document', () => {
    const config = createTenantConfig(sampleCreation);
    const hostile: TenantConfig = {
      ...config,
      tokenOverrides: {
        ...config.tokenOverrides,
        shadows: { md: 'red;} html{background:black}' },
      } as TenantConfig['tokenOverrides'],
    };

    const { css } = buildPreviewCss(hostile);
    expect(css).not.toContain('background:black');
    expect(css).not.toContain('html');
    expect(css).not.toContain('--ds-shadow-md');
    expect(css).toContain('--ds-color-primary');
  });

  it('contains multi-line hostile values inside the scoped block', () => {
    const config = createTenantConfig(sampleCreation);
    const hostile: TenantConfig = {
      ...config,
      tokenOverrides: {
        ...config.tokenOverrides,
        borderRadius: { md: 'red;\n} zz9{--pwn9:1}\n' },
      } as TenantConfig['tokenOverrides'],
    };

    const { css, scopeSelector } = buildPreviewCss(hostile);
    expect(css).not.toContain('zz9');
    expect(css).not.toContain('--pwn9');
    for (const line of css.split('\n').filter((l) => l.endsWith('{'))) {
      expect(line.startsWith(scopeSelector)).toBe(true);
    }
  });

  it('never lets a hostile slug break out of the scope selector', () => {
    const config = createTenantConfig({
      ...sampleCreation,
      slug: "x'] , * { --pwn9: 1 } [q9='",
    });

    const { css, safeSlug, scopeSelector } = buildPreviewCss(config);
    expect(safeSlug).toMatch(/^[a-z0-9-]+$/);
    expect(scopeSelector).toBe(`[${PREVIEW_SCOPE_ATTRIBUTE}='${safeSlug}']`);
    expect(css).not.toContain('*');
    expect(css).not.toContain('--pwn9:');
    expect(css).not.toContain('html[data-tenant');
    for (const line of css.split('\n').filter((l) => l.endsWith('{'))) {
      expect(line.startsWith(scopeSelector)).toBe(true);
    }
  });

  it('drops the display-name comment so a hostile name cannot open a comment breakout', () => {
    const config = createTenantConfig({
      ...sampleCreation,
      name: 'Evil */ zz9{--pwn9:1} /*',
    });

    const { css } = buildPreviewCss(config);
    expect(css).not.toContain('Evil');
    expect(css).not.toContain('--pwn9');
    expect(css).not.toContain('/*');
    expect(css).not.toContain('*/');
  });
});
