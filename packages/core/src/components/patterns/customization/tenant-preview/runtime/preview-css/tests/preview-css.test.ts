/**
 * preview-css unit tests -- scoping and sanitization contract (audit CMP-02).
 *
 * There are two canonical compilers, and buildPreviewCss must re-anchor
 * either one's output to the preview scope: compileTheme emits rules
 * against html[data-tenant='<slug>'] (brandTenantSelector), the document-root
 * attribute owned by TenantProvider; compileTenantThemeConfig emits rules
 * against its own artifact's `scopes.combinedSelector`. Both are dead inside
 * the preview container (a div, not the document root) and dangerous if the
 * previewed slug equals the active tenant, so every rule from either producer
 * is re-anchored here onto the preview scope attribute, and every line is
 * whitelist-filtered so hostile config values, names, or slugs cannot escape
 * the injected <style> tag's scope.
 *
 * "Either one's output" is now load-bearing. The brand-theme arm runs the
 * compiler itself; the tenant-theme arm is handed an artifact and verifies it,
 * so an object that merely satisfies `TenantThemeArtifact` structurally is
 * refused rather than sanitized. The suites below are split accordingly:
 * hostile-input neutralization is proven where a real producer can actually
 * emit the hostile text (the brand-theme arm), and the tenant-theme arm proves
 * refusal of everything a forged artifact could carry.
 */

import { describe, it, expect } from 'vitest';
import { buildPreviewCss, draftBrandTheme } from '..';
import {
  PREVIEW_SCOPE_ATTRIBUTE,
  buildPreviewScopeSelector,
  sanitizePreviewSlug,
} from '../../../../../../../infrastructure/runtime/tenant/runtime/preview-scope';
import { lowerBrandThemeFixture } from "@tests/support/theme-lowering";
import {
  compileThemeIntent,
  containerScope,
  draftPreviewThemeIntent,
  emitThemeCss,
  staticThemeIntent,
} from '@/infrastructure/compilers/runtime/theme';
import { brandTenantSelector } from '@/infrastructure/compilers/kernel/foundation/css/tenant-selectors';
import {
  compileTenantThemeConfig,
  getTenantThemeVerticalEnvelope,
  hydrateTenantThemeConfig,
} from '../../../../../../../infrastructure/compilers/composition/tenant-theme';
import { createTenantConfig } from '../../../../../../../infrastructure/runtime/tenant/runtime/authoring/configuration';
import type { BrandTheme } from '../../../../../../../foundation/contracts/composition/tenants/themes';
import type { TenantConfig } from '../../../../../../../foundation/contracts/composition/tenants';
import type {
  TenantThemeArtifact,
  TenantThemeDocument,
} from '../../../../../../../foundation/contracts/composition/tenants/themes/tenant-theme';

/** Minimal valid TenantConfig, overridable per test. */
function baseTenantConfig(overrides: Partial<TenantConfig> = {}): TenantConfig {
  return {
    slug: 'acme',
    name: 'Acme Corp',
    // The vertical the draft is a patch of. A config that names none names no
    // baseline, and `buildPreviewCss` reports `vertical` as a lost axis rather
    // than compiling the draft as a baseline of its own. `bithire` because
    // these fixtures carry LIGHT-default legacy branding with dark seeds in a
    // `modes.dark` overlay, which only a light-default vertical can accept.
    vertical: 'bithire',
    theme: 'base',
    plan: 'starter',
    features: [],
    branding: { companyName: 'Acme Corp' },
    ...overrides,
  };
}

/**
 * An ADMISSIBLE draft, and that is now part of the fixture's job.
 *
 * WO-CAT-03 made the compile door apply one admission to every origin, so a
 * draft whose derived on-tone ink misses the governed APCA floor on the rottay
 * dark canvas is refused here exactly as a publish refuses it (F-13). These
 * seeds are the same hues the fixture always used, lifted to a lightness the
 * floor admits; nothing below reads the hue, only that the compile happened.
 */
const sampleDraft = {
  slug: 'acme',
  name: 'ACME Corp',
  primaryColor: '#93BAFA',
  secondaryColor: '#34C494',
};

describe('buildPreviewCss scoping (brand-theme source)', () => {
  it('re-anchors every rule to the preview scope selector and keeps all generated declarations', () => {
    const drafts = [
      sampleDraft,
      { slug: 'bravo', name: 'Bravo Inc', primaryColor: '#F69898' },
      { slug: 'charlie-co', name: 'Charlie Co', primaryColor: '#C4C5C9', secondaryColor: '#F59E0B' },
    ];

    for (const draft of drafts) {
      const brandTheme = draftBrandTheme(draft);
      const safeSlug = sanitizePreviewSlug(draft.slug);
      // Same call `resolveCompiledOutput` makes internally, so this is a
      // faithful "raw" baseline rather than a second interpretation of it. The
      // draft is a PATCH over the vertical now, so the raw side has to resolve
      // the same way or it would compare two different compiles.
      const raw = emitThemeCss(
        compileThemeIntent(
          draftPreviewThemeIntent({
            vertical: 'rottay',
            slug: safeSlug,
            draft: brandTheme,
          }),
        ).compiled,
        containerScope(brandTenantSelector(safeSlug)),
      );
      const rawDeclarationCount = raw
        .split('\n')
        .filter((line) => /^ {2}\S.*;$/.test(line)).length;

      const { css, safeSlug: outSlug, scopeSelector } = buildPreviewCss({
        kind: 'brand-theme',
      vertical: 'rottay',
        slug: draft.slug,
        brandTheme,
      });
      const keptDeclarationCount = css
        .split('\n')
        .filter((line) => /^ {2}\S.*;$/.test(line)).length;

      expect(outSlug).toBe(safeSlug);
      expect(scopeSelector).toBe(buildPreviewScopeSelector(safeSlug));
      // Sanitization must be lossless on legitimate compiler output.
      expect(keptDeclarationCount).toBe(rawDeclarationCount);
      expect(keptDeclarationCount).toBeGreaterThan(0);
      const firstRule = css.split('\n').find((line) => line.endsWith('{'));
      expect(firstRule?.startsWith(scopeSelector)).toBe(true);
      expect(css).not.toContain('html[data-tenant');
    }
  });

  it('emits no html[data-tenant] rule even when previewing the active tenant slug', () => {
    const brandTheme = draftBrandTheme({ ...sampleDraft, slug: 'bithire' });
    const { css, scopeSelector } = buildPreviewCss({ kind: 'brand-theme',
      vertical: 'rottay', slug: 'bithire', brandTheme });

    expect(css).not.toContain('html');
    expect(css).toContain('--ds-color-primary');
    for (const line of css.split('\n').filter((l) => l.endsWith('{'))) {
      expect(line.startsWith(scopeSelector)).toBe(true);
    }
  });
});

describe('buildPreviewCss hostile input neutralization (brand-theme source)', () => {
  /**
   * THE DEFENCE MOVED EARLIER AGAIN, and these two cases are where it shows.
   *
   * It used to be the rescope pass that dropped a block-closing value; then the
   * emission grammar refused it before a character was assembled; since
   * WO-CAT-03 the compile door refuses the whole compile BY NAME, on every
   * origin, because the value grammar that only the DB terminal used to run now
   * runs for the draft too (F-13, F-61). A preview that silently dropped what a
   * publish refused was the defect; a preview that refuses what a publish
   * refuses, naming the channel, is the fix.
   *
   * The residual property is asserted with it: nothing is emitted at all, so
   * there is no CSS for a later pass to have to neutralize.
   */
  const refusalOf = (brandTheme: BrandTheme) => {
    try {
      buildPreviewCss({
        kind: 'brand-theme',
        vertical: 'rottay',
        slug: sampleDraft.slug,
        brandTheme,
      });
    } catch (error) {
      return error as Error;
    }
    return undefined;
  };

  it('refuses BY NAME a value that could close the block and restyle the document', () => {
    const brandTheme: BrandTheme = {
      ...draftBrandTheme(sampleDraft),
      surfaces: { shadows: { md: 'red;} html{background:black}' } },
    };

    const refusal = refusalOf(brandTheme);
    expect(refusal?.name).toBe('ThemeAdmissionError');
    expect(refusal?.message).toContain('--ds-shadow-md');
    expect(refusal?.message).toContain('unsafe variable declaration');
  });

  it('refuses BY NAME a multi-line value, naming the channel it was authored on', () => {
    const brandTheme: BrandTheme = {
      ...draftBrandTheme(sampleDraft),
      surfaces: { borderRadius: { md: 'red;\n} zz9{--pwn9:1}\n' } },
    };

    const refusal = refusalOf(brandTheme);
    expect(refusal?.name).toBe('ThemeAdmissionError');
    expect(refusal?.message).toContain('unsafe variable declaration');
    // The channel is named, so an author is told WHICH value to fix.
    expect(refusal?.message).toMatch(/--ds-radius-md/u);
  });

  it('never lets a multi-line escape reach the rescope pass at all', () => {
    // This drill used to feed the rescope pass a REAL compiled escape -- a
    // multi-line brand value whose emitted declaration closed the block early
    // and opened a rule the base selector does not own -- and prove that
    // `rescopeSelectorLine` returned null for it. Its own guard (`expect(raw)
    // .toContain('zz9, * {')`) was written to fail loudly if the value ever
    // stopped reaching the state machine, and that is what it now does: the
    // emission owner refuses the value before a character is assembled, so no
    // foreign selector line is produced for the rescope pass to reject.
    //
    // The stronger fact is asserted instead. `rescopeSelectorLine`'s rejection
    // branch survives as defence in depth behind the emission grammar, no
    // longer as the first line of it.
    const brandTheme: BrandTheme = {
      ...draftBrandTheme(sampleDraft),
      surfaces: { shadows: { md: 'red;\n}\nzz9, * {\n  --pwn9: 1;\n' } },
    };
    const safeSlug = sanitizePreviewSlug(sampleDraft.slug);
    const raw = lowerBrandThemeFixture({ brandTheme, tenantSlug: safeSlug }).cssString;
    expect(raw).not.toContain('zz9');
    expect(raw).not.toContain('--pwn9');
    // The DECLARATION, not the name: the material roots READ `--ds-shadow-md`
    // by design, so a bare substring check would confuse "the hostile value
    // was refused" with "the channel is never mentioned".
    expect(raw).not.toMatch(/--ds-shadow-md\s*:/u);

    // And the layer above it: the compile door refuses the draft outright, so
    // `buildPreviewCss` produces no CSS for the rescope pass to read. Both
    // layers are asserted because both survive -- the emission grammar is
    // still the last line behind the admission, not replaced by it.
    let refusal: Error | undefined;
    try {
      buildPreviewCss({
        kind: 'brand-theme',
        vertical: 'rottay',
        slug: sampleDraft.slug,
        brandTheme,
      });
    } catch (error) {
      refusal = error as Error;
    }
    expect(refusal?.name).toBe('ThemeAdmissionError');
    // The refusal NAMES the channel and QUOTES the value it refused, which is
    // the point of refusing by name: an author is told what to fix. It is a
    // JSON-quoted string in an error message, never CSS text -- no stylesheet
    // was produced at all, so there is nothing for the rescope pass to read.
    expect(refusal?.message).toContain('--ds-shadow-md');
    expect(refusal?.message).toContain(JSON.stringify(brandTheme.surfaces?.shadows?.md));
  });

  it('never lets a hostile slug reach the selector', () => {
    // The defense moved earlier in the pipeline: `resolveCompiledOutput`
    // compiles with the SANITIZED slug (`sanitizePreviewSlug` runs before
    // `compileTheme`), so a hostile slug never reaches the compiler and
    // therefore never reaches the CSS text at all -- the rescope pass below
    // has nothing to reject here because there is nothing hostile left to
    // reject. The `x'] , * { --pwn9: 1 } [q9='`-shaped attack this used to
    // exercise via the rescope rejection is covered by the case directly
    // above, where the emission grammar refuses the hostile value before any
    // foreign selector can be assembled.
    const hostileSlug = "x'] , * { --pwn9: 1 } [q9='";
    const brandTheme = draftBrandTheme({ ...sampleDraft, slug: hostileSlug });
    const { css, safeSlug, scopeSelector } = buildPreviewCss({
      kind: 'brand-theme',
      vertical: 'rottay',
      slug: hostileSlug,
      brandTheme,
    });

    expect(safeSlug).toMatch(/^[a-z0-9-]+$/);
    expect(scopeSelector).toBe(`[${PREVIEW_SCOPE_ATTRIBUTE}='${safeSlug}']`);
    expect(css).not.toContain('--pwn9:');
    expect(css).not.toContain('html[data-tenant');
    // Every selector-open line starts with the scope selector -- proof no
    // wildcard/attribute-escaping rule survived. A bare `.not.toContain('*')`
    // would also flag compileTheme's own legitimate
    // `calc(var(--x) * var(--y))` multiplication, which has nothing to do
    // with the injection vector this test targets.
    for (const line of css.split('\n').filter((l) => l.endsWith('{'))) {
      expect(line.startsWith(scopeSelector)).toBe(true);
    }
  });
});

describe('buildPreviewCss scoping (tenant-theme source)', () => {
  /**
   * A type-only forgery: an object literal that satisfies `TenantThemeArtifact`
   * structurally and controls exactly the two fields `resolveCompiledOutput`
   * reads. It was this suite's main fixture, which is precisely what made the
   * old contract dishonest -- it let a module whose whole premise is "show
   * what a compiler actually produces" publish CSS no compiler produced.
   * It survives only as the subject of the refusal drills below.
   */
  function stubArtifact(fields: { combinedSelector: string; css: string; slug?: string }): TenantThemeArtifact {
    return {
      slug: fields.slug ?? 'acme',
      scopes: { combinedSelector: fields.combinedSelector },
      css: fields.css,
    } as unknown as TenantThemeArtifact;
  }

  /** The genuine article: compiled, and therefore verifiable. */
  function compiledArtifact(): TenantThemeArtifact {
    const document_ = {
      schemaVersion: 1,
      mode: 'advanced',
      visualFoundation: {
        general: { palette: { primary: '#2F6B9A', backgroundMode: 'dark' } },
      },
    } as TenantThemeDocument;
    return compileTenantThemeConfig(
      hydrateTenantThemeConfig(document_, {
        tenantId: 'tenant_acme',
        slug: 'acme',
        verticalKey: 'bithire',
        rowVersion: 1,
      }),
      { verticalEnvelope: getTenantThemeVerticalEnvelope('bithire') },
    );
  }

  it('re-anchors a real compiled artifact to the preview scope, losslessly', () => {
    const artifact = compiledArtifact();
    const rawDeclarationCount = artifact.css
      .split('\n')
      .filter((line) => /^ {2}\S.*;$/.test(line)).length;

    const { css, scopeSelector } = buildPreviewCss({ kind: 'tenant-theme', artifact });
    const keptDeclarationCount = css
      .split('\n')
      .filter((line) => /^ {2}\S.*;$/.test(line)).length;

    expect(keptDeclarationCount).toBe(rawDeclarationCount);
    expect(keptDeclarationCount).toBeGreaterThan(0);
    const firstRule = css.split('\n').find((line) => line.endsWith('{'));
    expect(firstRule?.startsWith(scopeSelector)).toBe(true);
    expect(css).not.toContain(artifact.scopes.combinedSelector);
    // The artifact's own provenance comment is a comment line, not a
    // recognized selector/declaration/closer, so the whitelist state machine
    // drops it same as any other comment -- proven against real shipped
    // bytes rather than assumed.
    expect(artifact.css).toContain('/*');
    expect(css).not.toContain('/*');
    expect(css).not.toContain('TenantThemeArtifact');
  });

  it('DRILL: refuses hostile CSS text presented as a compiled artifact', () => {
    // These three payloads are verbatim the ones this suite used to FILTER.
    // Filtering them was the wrong verb: it treated attacker-authored CSS as
    // a legitimate producer's output that merely needed cleaning, and shipped
    // whatever survived the whitelist under the tenant's own slug. None of
    // them was ever compiled, so the honest answer to all three is refusal.
    //
    // The whitelist still runs -- on real compiled output, above and in the
    // brand-theme suite -- so nothing is weakened by moving these cases from
    // "sanitized" to "rejected". What changes is that a forged artifact can
    // no longer produce a preview at all, whether or not its payload would
    // have survived the filter.
    const artifact = compiledArtifact();
    const combined = artifact.scopes.combinedSelector;
    const forgeries: ReadonlyArray<{ name: string; css: string }> = [
      {
        name: 'selector escape',
        css: [
          `${combined} {`,
          '  --ds-color-primary: #3B82F6;',
          '}',
          '',
          `${combined}, * {`,
          '  --pwn9: 1;',
          '}',
        ].join('\n'),
      },
      {
        name: 'block-closing declaration value',
        css: [
          `${combined} {`,
          '  --ds-color-primary: #3B82F6;',
          '  --ds-shadow-md: red;} html{background:black};',
          '}',
        ].join('\n'),
      },
      {
        name: 'hostile comment breakout',
        css: [
          '/* Tenant: Evil */ zz9{--pwn9:1} /* */',
          `${combined} {`,
          '  --ds-color-primary: #3B82F6;',
          '}',
        ].join('\n'),
      },
    ];

    for (const forgery of forgeries) {
      // Named, so a future change that refuses for an unrelated reason cannot
      // keep this drill green: the CSS bytes must be what is caught.
      expect(
        () => buildPreviewCss({ kind: 'tenant-theme', artifact: { ...artifact, css: forgery.css } }),
        forgery.name,
      ).toThrow(/is not the deterministic v1 rendering/);
    }
  });

  it('DRILL: refuses an artifact whose declared scope does not recompute from its identity', () => {
    // The other field `resolveCompiledOutput` reads. Widening the selector is
    // the interesting forgery: every rule would still start with the declared
    // base selector, so the rescope pass would pass it through and re-anchor
    // a `, *` rule onto the preview scope. Verification catches it a step
    // earlier, on the ground that the compiler never emits that selector for
    // this identity.
    const artifact = compiledArtifact();
    expect(() =>
      buildPreviewCss({
        kind: 'tenant-theme',
        artifact: {
          ...artifact,
          scopes: {
            ...artifact.scopes,
            combinedSelector: `${artifact.scopes.combinedSelector}, *`,
          },
        },
      }),
    ).toThrow(/scopes do not recompute/);
  });

  it('DRILL: refuses an object that merely satisfies the artifact type', () => {
    // `TenantThemeArtifact` is structural, so this literal type-checks. That
    // is exactly why the type is not the guarantee, and why the arm verifies.
    const combinedSelector = "[data-ds-root][data-vertical=\"bithire\"][data-tenant][data-tenant=\"acme\"]";
    const artifact = stubArtifact({
      combinedSelector,
      css: `${combinedSelector} {\n  --ds-color-primary: #3B82F6;\n}`,
    });

    expect(() => buildPreviewCss({ kind: 'tenant-theme', artifact })).toThrow(TypeError);
  });
});

describe('buildPreviewCss resolving a TenantConfig directly (CMP-02 restoration)', () => {
  // These exercise the engines' real call shape: `buildPreviewCss(tenantConfig)`
  // with a `TenantConfig` -- not a pre-resolved `PreviewSource` -- so the
  // internal resolution in `resolvePreviewInput`/`liftTenantConfigToBrandTheme`
  // is what's under test here, per axis, with real differing output (not
  // `css.length > 0`).

  it('palette: emitted custom-property values differ when branding.primaryColor differs', () => {
    const blue = createTenantConfig({ slug: 'acme', vertical: 'rottay', name: 'Acme', primaryColor: '#93BAFA' });
    const red = createTenantConfig({ slug: 'acme', vertical: 'rottay', name: 'Acme', primaryColor: '#F69898' });

    const cssBlue = buildPreviewCss(blue).css;
    const cssRed = buildPreviewCss(red).css;

    expect(cssBlue).toContain('--ds-color-primary: #93BAFA;');
    expect(cssRed).toContain('--ds-color-primary: #F69898;');
    expect(cssBlue).not.toBe(cssRed);
  });

  it('personality preset: emitted output differs across presets via --ds-motion-calm', () => {
    // `personality.animation.entranceDuration` differs per preset (formal
    // 160, neutral 220, expressive 300, playful 400 -- see foundation
    // personality presets) and is lifted onto `BrandMotion.entranceDuration`,
    // which `compileTheme`'s `setMotionVariables` feeds directly (no
    // clamping) into `--ds-motion-calm: <ms>ms`. This is real, observed
    // compiler behavior, not an assumption -- verified against
    // `infrastructure/compilers/runtime/theme/runtime/lowering`'s source.
    //
    // `--ds-motion-intensity` was tried first and rejected: it IS lifted from
    // `personality.animation.intensity` and DOES feed a real CSS variable,
    // but `MOTION_DIAL_BOUNDS.intensity` clamps to `[0, 1]`, and playful's
    // 1.2 and expressive's 1.0 both saturate to the same clamped `1` --
    // collapsing two of the four presets onto identical output for that one
    // property. `entranceDuration` has no such clamp and is pairwise unique
    // across all four presets, so it is the honest choice for a per-preset
    // matrix rather than a coincidentally-passing one.
    // Only the presets a tenant may actually select. `playful` (intensity 1.2)
    // and `expressive` (1.0) sit ABOVE every vertical's `motionIntensity` cap
    // of 0.8, so since WO-CAT-03 the door refuses them by name on the preview
    // path exactly as it would on publish -- asserted immediately below rather
    // than left as a surprise at save time.
    const presets = ['formal', 'neutral'] as const;
    const calmLine = (css: string) =>
      css.split('\n').find((line) => line.trim().startsWith('--ds-motion-calm:'));

    const lines = presets.map((personality) => {
      const config = createTenantConfig({
        slug: 'acme',
        vertical: 'rottay',
        name: 'Acme',
        primaryColor: '#93BAFA',
        personality,
      });
      const { css } = buildPreviewCss(config);
      const line = calmLine(css);
      expect(line).toBeDefined();
      return line;
    });

    // Every preset must be pairwise distinguishable -- not just "some pair differs".
    expect(new Set(lines).size).toBe(presets.length);
  });

  it('personality preset: one above the vertical motion envelope is refused BY NAME', () => {
    // The collision this records is real and pre-dates WO-CAT-03: the DS's own
    // personality presets carry `animation.intensity` 1.2 (`playful`) and 1.0
    // (`expressive`), while every vertical envelope caps a TENANT's
    // `motionIntensity` at 0.8. Nothing compared the two until one admission
    // ran for every origin. Whether the cap rises or the presets stop being a
    // tenant-selectable axis is an owner decision; that it is now visible
    // instead of silently painted is not.
    // `playful` alone: `expressive` also carries intensity 1.0, which is the
    // value rottay's own theme already declares, and a tenant that restates the
    // vertical's value has decided nothing. That distinction is the admission's
    // -- it measures what a tenant MOVED -- and it is why the studio can open a
    // vertical's own theme at all.
    expect(() =>
      buildPreviewCss(
        createTenantConfig({
          slug: 'acme',
          vertical: 'rottay',
          name: 'Acme',
          primaryColor: '#93BAFA',
          personality: 'playful',
        }),
      ),
    ).toThrow(/motion\.intensity: Value 1\.2 exceeds the rottay envelope for motionIntensity/);
  });

  it('density: emitted --ds-density-scale differs between compact and spacious', () => {
    const compact = createTenantConfig({
      slug: 'acme',
      vertical: 'rottay',
      name: 'Acme',
      primaryColor: '#93BAFA',
      density: 'compact',
    });
    const spacious = createTenantConfig({
      slug: 'acme',
      vertical: 'rottay',
      name: 'Acme',
      primaryColor: '#93BAFA',
      density: 'spacious',
    });

    const cssCompact = buildPreviewCss(compact).css;
    const cssSpacious = buildPreviewCss(spacious).css;

    expect(cssCompact).toContain('--ds-density-scale: 0.95;');
    expect(cssSpacious).toContain('--ds-density-scale: 1.1;');
  });

  it('dark/modes: branding dark-mode seeds emit a scoped, independent dark selector block', () => {
    const config = baseTenantConfig({
      branding: {
        companyName: 'Acme Corp',
        // `baseTenantConfig` is a BITHIRE config, and bithire is light-default:
        // the seeds the governed floor admits there are the DARK end of a hue,
        // where rottay's dark canvas admits the light end. One seed cannot
        // serve both, so each fixture carries its own vertical's.
        primaryColor: '#2F6B9A',
        darkPrimaryColor: '#1B4A6E',
      },
    });

    const { css, scopeSelector, unsupportedAxes } = buildPreviewCss(config);

    const darkLine = css.split('\n').find((line) => line.includes("[data-theme='dark']"));
    expect(darkLine).toBeDefined();
    expect(darkLine).toContain(scopeSelector);
    expect(css).toContain('--ds-color-primary: #1B4A6E;');
    expect(unsupportedAxes).not.toContain('modes.dark');

    // The base (light) block is still scoped correctly alongside the dark one.
    for (const line of css.split('\n').filter((l) => l.endsWith('{'))) {
      expect(line.startsWith(scopeSelector)).toBe(true);
    }
  });

  it('dark/modes: no dark branding seeds -> the draft contributes no mode block of its own', () => {
    // The vertical's own overlays are still compiled -- a draft is a patch over
    // it, not a theme on its own -- so absence is measured as a DELTA: the
    // preview's mode blocks are exactly the untouched vertical's.
    const config = createTenantConfig({ slug: 'acme', vertical: 'bithire', name: 'Acme', primaryColor: '#2F6B9A' });
    const { css } = buildPreviewCss(config);
    const untouched = emitThemeCss(
      compileThemeIntent(staticThemeIntent('bithire', 'acme')).compiled,
      containerScope(brandTenantSelector('acme')),
    );
    // The MODES, not the selectors: the two sides are scoped differently by
    // construction (a preview container versus the tenant root).
    const modes = (text: string) =>
      [...text.matchAll(/\[data-theme='([a-z]+)'\]/g)].map((m) => m[1]).sort();

    expect(modes(css)).toEqual(modes(untouched));
    expect(css).not.toContain('prefers-color-scheme');
  });

  it('an explicit config.brandTheme is passed through in FULL, ignoring legacy branding/personality/tokenOverrides', () => {
    const brandTheme: BrandTheme = {
      id: 'acme',
      name: 'Acme Corp',
      palette: { primaryColor: '#111827', secondaryColor: '#F59E0B' },
    };
    const config = baseTenantConfig({
      brandTheme,
      // Legacy fields present alongside brandTheme; per TenantConfig's own
      // doc comment these are superseded and must not leak into the output.
      // A canary hex: no first-party theme authors it, so its absence proves
      // the legacy field was ignored rather than merely coinciding with a
      // baseline value the vertical happens to declare.
      branding: { companyName: 'Acme Corp', primaryColor: '#FE01DC' },
      personality: { animation: { intensity: 1.5 } },
    });

    const direct = buildPreviewCss({ kind: 'brand-theme',
      vertical: 'bithire', slug: config.slug, brandTheme });
    const viaConfig = buildPreviewCss(config);

    expect(viaConfig.css).toBe(direct.css);
    expect(viaConfig.unsupportedAxes).toEqual([]);
    expect(viaConfig.css).toContain('#111827');
    expect(viaConfig.css).not.toContain('#FE01DC');
  });

  it('neither a brandTheme nor a branding.primaryColor: returns the typed empty/unsupported result instead of inventing a preview', () => {
    const config = baseTenantConfig({ branding: { companyName: 'Acme Corp' } });

    const result = buildPreviewCss(config);

    expect(result.css).toBe('');
    expect(result.unsupportedAxes).toContain('palette');
    expect(result.safeSlug).toBe(sanitizePreviewSlug(config.slug));
    expect(result.scopeSelector).toBe(buildPreviewScopeSelector(result.safeSlug));
  });

  it('personality.chart/card/accent are preserved on the lift but reported as unsupported, since the compiler never renders them', () => {
    const config = baseTenantConfig({
      branding: { companyName: 'Acme Corp', primaryColor: '#3B82F6' },
      personality: {
        chart: {
          animateOnMount: true,
          mountDuration: 300,
          lineStyle: 'smooth',
          showDots: true,
          useGradientFill: false,
          tooltipStyle: 'minimal',
        },
        card: {
          defaultElevation: 'lg',
          hoverElevation: 'lift-one',
          showBorder: true,
          hoverTint: false,
          paddingDensity: 'compact',
        },
        accent: {
          barPosition: 'top',
          barThickness: 2,
          barStyle: 'solid',
          iconContainerShape: 'circle',
          badgeShape: 'pill',
          dividerStyle: 'dashed',
        },
      },
    });

    const { unsupportedAxes } = buildPreviewCss(config);

    expect(unsupportedAxes).toEqual(
      expect.arrayContaining(['personality.chart', 'personality.card', 'personality.accent'])
    );
  });

  it('never lets a hostile slug reach the selector, via the TenantConfig arm', () => {
    const hostileSlug = "x'] , * { --pwn9: 1 } [q9='";
    const config = createTenantConfig({ slug: hostileSlug, name: 'Acme', primaryColor: '#3B82F6' });

    const { css, safeSlug, scopeSelector } = buildPreviewCss(config);

    expect(safeSlug).toMatch(/^[a-z0-9-]+$/);
    expect(scopeSelector).toBe(`[${PREVIEW_SCOPE_ATTRIBUTE}='${safeSlug}']`);
    expect(css).not.toContain('--pwn9:');
    for (const line of css.split('\n').filter((l) => l.endsWith('{'))) {
      expect(line.startsWith(scopeSelector)).toBe(true);
    }
  });

  it('drops the display-name comment so a hostile name cannot open a comment breakout, via the TenantConfig arm', () => {
    // Faithful restoration of the HEAD test of the same name, adapted to the
    // new call shape (`buildPreviewCss(tenantConfig)` still works exactly as
    // before). It holds for a stronger reason than at HEAD: `compileTheme`
    // never writes `bt.name` into `cssString` at all (verified against the
    // compiler source), so there is no comment-emitting code path left to
    // exploit in the first place -- the assertions below guard against that
    // regressing back in.
    const config = createTenantConfig({
      slug: 'acme',
      vertical: 'rottay',
      name: 'Evil */ zz9{--pwn9:1} /*',
      primaryColor: '#93BAFA',
    });

    const { css } = buildPreviewCss(config);

    expect(css).not.toContain('Evil');
    expect(css).not.toContain('--pwn9');
    expect(css).not.toContain('/*');
    expect(css).not.toContain('*/');
  });
});
