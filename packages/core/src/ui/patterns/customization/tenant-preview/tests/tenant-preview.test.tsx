/**
 * TenantPreview pattern tests
 */

import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// Test the types and creation utilities that power the preview
import type { TenantPreviewProps, PreviewComponent } from '../contracts';
import {
  createTenantConfig,
  type TenantCreationConfig,
} from '../../../../../infrastructure/runtime/tenant/runtime/authoring/configuration';
import { buildPreviewCss, draftBrandTheme } from '../runtime/preview-css';
import { PREVIEW_SCOPE_ATTRIBUTE } from '../../../../../infrastructure/runtime/tenant/runtime/preview-scope';
import RusticTenantPreview from '../engines/rustic';
import ClassicTenantPreview from '../engines/classic';
import ModernTenantPreview from '../engines/modern';

const rusticSkin = readFileSync(
  join(__dirname, '../../../../../foundation/tokens/css/runtime/engines/rustic/skin/tenant-preview.css'),
  'utf8'
);
const normalizedRusticSkin = rusticSkin.replace(/"/g, "'");

describe('TenantPreview', () => {
  const sampleConfig: TenantCreationConfig = {
    slug: 'test-tenant',
    name: 'Test Tenant',
    primaryColor: '#3B82F6',
    personality: 'formal',
  };

  describe('Config generation', () => {
    it('should generate a valid TenantConfig for the preview', () => {
      const config = createTenantConfig(sampleConfig);
      expect(config.slug).toBe('test-tenant');
      expect(config.name).toBe('Test Tenant');
      expect(config.branding.primaryColor).toBe('#3B82F6');
      expect(config.personality).toBeDefined();
    });

    it('should generate CSS from the config', () => {
      // `buildPreviewCss` takes the `TenantConfig` directly -- this is
      // exactly the call shape the Classic/Rustic engines use
      // (`buildPreviewCss(tenantConfig)`), so this test exercises the real
      // production resolution path instead of pre-building a `PreviewSource`.
      const config = createTenantConfig(sampleConfig);
      const { css } = buildPreviewCss(config);

      expect(css).toContain('test-tenant');
      expect(css).toContain('--ds-color-primary');
    });

    it('should produce genuinely different CSS across personality presets', () => {
      // Restores 'should handle all personality presets', which looped
      // presets through the retired runtime tenant-CSS generator and asserted
      // only `css.length > 0` -- true for any non-empty string, so it proved
      // nothing about personality actually affecting anything. Now that
      // `buildPreviewCss` resolves a `TenantConfig` itself (see
      // `liftTenantConfigToBrandTheme`), `personality.animation.entranceDuration`
      // is lifted onto `BrandMotion.entranceDuration`, which
      // `compileBrandTheme` feeds verbatim into `--ds-motion-calm`. Each of
      // the four presets authors a different `entranceDuration`
      // (formal 160, neutral 220, expressive 300, playful 400), so this
      // checks the actual differing value per preset -- see
      // `runtime/preview-css/tests/preview-css.test.ts` for why
      // `--ds-motion-intensity` was rejected as the proof axis (two presets
      // saturate to the same clamped value there).
      const presets = ['formal', 'neutral', 'playful', 'expressive'] as const;
      const calmValues = presets.map((personality) => {
        const config = createTenantConfig({ ...sampleConfig, personality });
        const { css } = buildPreviewCss(config);
        const line = css.split('\n').find((l) => l.trim().startsWith('--ds-motion-calm:'));
        expect(line).toBeDefined();
        return line;
      });

      expect(new Set(calmValues).size).toBe(presets.length);
    });
  });

  describe('Type safety', () => {
    it('should accept valid component list', () => {
      const components: PreviewComponent[] = ['button', 'card', 'input', 'badge', 'table'];
      expect(components).toHaveLength(5);
    });

    it('should type-check TenantPreviewProps', () => {
      const props: TenantPreviewProps = {
        config: sampleConfig,
        components: ['button', 'card'],
        showColorPalette: true,
        showPersonalityInfo: false,
      };

      expect(props.config.slug).toBe('test-tenant');
      expect(props.components).toHaveLength(2);
    });
  });

  describe('CSS generation for preview', () => {
    // 'should generate dark mode selectors by default' and 'should generate
    // without dark mode when disabled' deleted: both exercised
    // `includeDarkSelector`/`includeSystemDarkSelector`, options of the
    // retired the retired runtime tenant-CSS generator call the old buildPreviewCss(TenantConfig)
    // made internally. buildPreviewCss has no such option anymore, and
    // draftBrandTheme never authors a BrandTheme.modes overlay for an
    // authoring draft -- there is nothing for compileBrandTheme to compile a
    // dark block FROM, so the toggle has no equivalent to migrate onto.
    // Replaced below with the structural guarantee that follows from that:
    // preview CSS never contains a dark-mode block at all -- for THIS
    // authoring-draft arm specifically. A full `TenantConfig` carrying
    // `branding.darkPrimaryColor` (etc.) is a different story: buildPreviewCss
    // lifts those into a `modes.dark` overlay and DOES emit a scoped dark
    // block for it -- see `runtime/preview-css/tests/preview-css.test.ts`
    // ("dark/modes: branding dark-mode seeds emit a scoped, independent dark
    // selector block"). The distinction is real, not an inconsistency: an
    // authoring draft structurally has no field to carry a dark seed in the
    // first place, so there is nothing to lift.
    it('never emits a dark-mode selector block, because an authoring draft has no mode overlay', () => {
      const { css } = buildPreviewCss({
        kind: 'brand-theme',
        slug: sampleConfig.slug,
        brandTheme: draftBrandTheme(sampleConfig),
      });

      expect(css).not.toContain("data-theme='dark'");
      expect(css).not.toContain('prefers-color-scheme');
    });

    it('should include secondary color scale when provided', () => {
      const draft = { ...sampleConfig, secondaryColor: '#10B981' };
      const { css } = buildPreviewCss({
        kind: 'brand-theme',
        slug: draft.slug,
        brandTheme: draftBrandTheme(draft),
      });

      expect(css).toContain('--ds-color-secondary');
    });
  });

  describe('Rustic runtime preview', () => {
    it('renders the live preview with generated tenant CSS and token-driven sample styles', () => {
      const { container } = render(
        <RusticTenantPreview
          config={{
            ...sampleConfig,
            secondaryColor: '#10B981',
          }}
        />
      );

      const root = container.firstElementChild as HTMLDivElement | null;
      expect(root).toHaveAttribute('data-tenant', 'test-tenant');
      expect(root).toHaveAttribute(PREVIEW_SCOPE_ATTRIBUTE, 'test-tenant');
      expect(screen.getByText('Color Palette')).toBeInTheDocument();
      expect(screen.getByText('Component Preview')).toBeInTheDocument();
      expect(screen.getByText('Personality: formal')).toBeInTheDocument();
      expect(screen.getByText('Secondary')).toBeInTheDocument();

      const primaryButton = screen.getByRole('button', { name: 'Primary' });
      expect(primaryButton.style.boxShadow).toBe('');
      expect(normalizedRusticSkin).toContain("[data-part='button'][data-variant='primary']");
      expect(rusticSkin).toContain('box-shadow: var(--ds-button-primary-shadow, var(--ds-shadow-sm));');

      const input = screen.getByPlaceholderText('Type something...');
      expect(input).toBeInTheDocument();
      expect(input.style.border).toBe('');
      expect(input.style.backgroundColor).toBe('');
      expect(normalizedRusticSkin).toContain("[data-part='sample-input'][data-part='sample-input']");
      expect(rusticSkin).toContain('background-color: var(--ds-input-bg, var(--ds-color-surface));');
    });

    it('supports hiding optional sections and rendering a focused component subset', () => {
      render(
        <RusticTenantPreview
          config={sampleConfig}
          components={['button']}
          showColorPalette={false}
          showPersonalityInfo={false}
        />
      );

      expect(screen.queryByText('Color Palette')).not.toBeInTheDocument();
      expect(screen.queryByText(/Personality:/)).not.toBeInTheDocument();
      expect(screen.getByText('Buttons')).toBeInTheDocument();
      expect(screen.queryByText('Card')).not.toBeInTheDocument();
      expect(screen.queryByText('Input')).not.toBeInTheDocument();
    });
  });

  describe('Preview CSS scoping (CMP-02)', () => {
    const engines = [
      ['rustic', RusticTenantPreview],
      ['classic', ClassicTenantPreview],
      ['modern', ModernTenantPreview],
    ] as const;

    /** Selector-open lines of the injected stylesheet, without the trailing brace. */
    function styleSelectors(styleEl: HTMLStyleElement): string[] {
      return (styleEl.textContent ?? '')
        .split('\n')
        .filter((line) => line.endsWith('{'))
        .map((line) => line.slice(0, -1).trim());
    }

    it.each(engines)('%s: applies inside the preview container only', (_name, Engine) => {
      const { container } = render(
        <div>
          <Engine config={sampleConfig} />
          <div data-testid={`outside-${_name}`} />
        </div>
      );

      const styleEl = container.querySelector('style') as HTMLStyleElement;
      expect(styleEl).not.toBeNull();
      const selectors = styleSelectors(styleEl);
      expect(selectors.length).toBeGreaterThan(0);

      const root = container.querySelector(`[${PREVIEW_SCOPE_ATTRIBUTE}]`) as HTMLElement;
      const outside = screen.getByTestId(`outside-${_name}`);
      for (const selector of selectors) {
        expect(root.matches(selector)).toBe(true);
        expect(outside.matches(selector)).toBe(false);
        expect(document.documentElement.matches(selector)).toBe(false);
      }
    });

    it('emits no document-root rule when previewing the ACTIVE tenant slug', () => {
      document.documentElement.setAttribute('data-tenant', 'test-tenant');
      try {
        const { container } = render(<RusticTenantPreview config={sampleConfig} />);
        const styleEl = container.querySelector('style') as HTMLStyleElement;
        const cssText = styleEl.textContent ?? '';

        expect(cssText).not.toContain('html[data-tenant');
        for (const selector of styleSelectors(styleEl)) {
          expect(document.documentElement.matches(selector)).toBe(false);
        }
      } finally {
        document.documentElement.removeAttribute('data-tenant');
      }
    });

    it('neutralizes a hostile slug before it reaches the selector', () => {
      const { container } = render(
        <RusticTenantPreview
          config={{
            ...sampleConfig,
            slug: "x'] , * { --pwn9: 1 } [q9='",
          }}
        />
      );

      const root = container.firstElementChild as HTMLDivElement;
      expect(root.getAttribute(PREVIEW_SCOPE_ATTRIBUTE)).toMatch(/^[a-z0-9-]+$/);

      const styleEl = container.querySelector('style') as HTMLStyleElement;
      const cssText = styleEl.textContent ?? '';
      expect(cssText).not.toContain('--pwn9:');
      expect(cssText).not.toContain('html[data-tenant');
      // Every selector-open line is scope-anchored -- proof no wildcard rule
      // survived. A bare `.not.toContain('*')` would also flag
      // compileBrandTheme's legitimate `calc(var(--x) * var(--y))`
      // multiplication, unrelated to the injection vector under test here.
      for (const selector of styleSelectors(styleEl)) {
        expect(selector.startsWith(`[${PREVIEW_SCOPE_ATTRIBUTE}='`)).toBe(true);
      }
    });

    /* The three engines are three renderings of ONE tenant, so the stylesheet
       they inject is not an engine choice -- it is the compiled tenant. The
       preview-css suite pins that at the compiler boundary; these two pin it
       at the engine boundary, which is where it can actually regress. Since
       `buildPreviewCss` gained a `PreviewSource` arm, an engine could narrow
       its own input before calling (`draftBrandTheme` carries no
       `personality`/`tokenOverrides`) and lose axes SILENTLY, because a
       pre-resolved source reports `unsupportedAxes: []` by definition. Then
       the preset this very component renders as metadata would be missing
       from the CSS it injects, and the engines would disagree. */
    it.each(engines)('%s: the injected sheet carries the personality axis, not just the seeds', (_name, Engine) => {
      // `personality.animation.entranceDuration` -> `BrandMotion` ->
      // `--ds-motion-calm`, the same unclamped per-preset channel the
      // preview-css suite pins at the compiler boundary; here it is read back
      // through the rendered engine. Presence alone would prove nothing -- a
      // default emits the variable too. Four pairwise-distinct values can only
      // come from the preset itself reaching the compiler.
      const lines = (['formal', 'neutral', 'playful', 'expressive'] as const).map((personality) => {
        const { container } = render(<Engine config={{ ...sampleConfig, personality }} />);
        const cssText = (container.querySelector('style') as HTMLStyleElement).textContent ?? '';
        const calm = cssText.split('\n').find((line) => line.trim().startsWith('--ds-motion-calm:'));
        expect(calm).toBeDefined();
        return calm;
      });

      expect(new Set(lines).size).toBe(4);
    });

    /* The other half of the same honesty contract: what the preview could not
       paint has to be readable from the rendered component, not just from the
       builder's return value. `compileBrandTheme` renders no chart, card or
       accent personality, and every preset carries all three, so a preset-built
       preview ALWAYS has something to declare. */
    it('modern: names the axes it could not paint, on the rendered root', () => {
      const { container } = render(<ModernTenantPreview config={sampleConfig} />);
      const root = container.querySelector(`[${PREVIEW_SCOPE_ATTRIBUTE}]`) as HTMLElement;

      const declared = (root.getAttribute('data-ds-tenant-preview-unsupported') ?? '').split(' ');
      expect(declared).toEqual(
        expect.arrayContaining(['personality.chart', 'personality.card', 'personality.accent']),
      );

      // Named, and named ACCURATELY: the attribute must agree with the builder
      // rather than being a constant string that happens to look right.
      expect(declared).toEqual([...buildPreviewCss(createTenantConfig(sampleConfig)).unsupportedAxes]);
    });

    /* The attribute is absent rather than empty when there is no loss. That
       branch is currently unreachable through `TenantPreviewProps` -- every
       personality preset carries chart, card and accent, and the props expose
       no way to author a config without a preset -- so it is pinned where it
       IS reachable, on the builder, next to the component assertion above
       rather than asserted through a fake config the component cannot produce. */
    it('has an empty-loss case to be absent for', () => {
      const config = createTenantConfig(sampleConfig);
      const { unsupportedAxes } = buildPreviewCss({
        kind: 'brand-theme',
        slug: config.slug,
        brandTheme: draftBrandTheme(sampleConfig),
      });
      expect(unsupportedAxes).toEqual([]);
    });

    it('renders the same compiled tenant in every engine', () => {
      const config: TenantCreationConfig = { ...sampleConfig, personality: 'expressive', density: 'compact' };
      const sheets = engines.map(([, Engine]) => {
        const { container } = render(<Engine config={config} />);
        return (container.querySelector('style') as HTMLStyleElement).textContent ?? '';
      });

      expect(sheets[0].length).toBeGreaterThan(0);
      expect(new Set(sheets).size).toBe(1);
    });
  });
});
