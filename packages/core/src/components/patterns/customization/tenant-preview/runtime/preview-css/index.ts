/**
 * @fileoverview Preview CSS scoping and sanitization for TenantPreview.
 *
 * A preview shows what a tenant WILL look like, so it must show what a
 * compiler actually produces — not a third rendering of the same inputs. Both
 * canonical producers scope their output to a document-root selector owned by
 * TenantProvider: the static arm's `compileTheme` to `html[data-tenant='<slug>']`, and
 * `compileTenantThemeConfig` to its artifact's `scopes.combinedSelector`.
 *
 * That claim is ENFORCED, not assumed. The brand-theme arm runs the compiler
 * itself, so its output is compiled by construction; the tenant-theme arm is
 * handed an artifact and therefore verifies it (`verifyTenantThemeArtifactV1`)
 * before reading a byte of it, and throws when it does not verify. See
 * `resolveCompiledOutput` for why those are the same guarantee reached two
 * ways.
 *
 * A preview must never publish rules against either: inside the preview
 * container they are dead (the container is a div, not the document root),
 * and when the previewed slug equals the active tenant they restyle the whole
 * document. Every rule is therefore re-scoped here onto a selector anchored on
 * an attribute only the preview root carries, and every line is
 * whitelist-filtered so hostile config values, names, or slugs cannot escape
 * the injected <style> tag's scope.
 *
 * The scope attribute, slug sanitizer, and declaration-value whitelist are
 * the shared preview-scope primitives owned by
 * `infrastructure/runtime/tenant/runtime/preview-scope`; this module owns only
 * the rescoping state machine that rebuilds compiled output line by line.
 *
 * `buildPreviewCss` accepts either an already-resolved `PreviewSource` (a
 * caller that knows which of the two producers it wants) or a raw
 * `TenantConfig` (the common case: an engine holding a tenant config with no
 * opinion about which producer applies). The resolution from `TenantConfig`
 * to `PreviewSource` happens internally in `resolvePreviewInput`/
 * `liftTenantConfigToBrandTheme` below, so callers stay dumb call sites.
 */

import type { TenantConfig } from '../../../../../../foundation/contracts/composition/tenants';
import type {
  BrandChrome,
  BrandMotion,
  BrandPalette,
  BrandSurfaces,
  BrandTheme,
  BrandTypography,
} from '../../../../../../foundation/contracts/composition/tenants/themes';
import type { TenantThemeArtifact } from '../../../../../../foundation/contracts/composition/tenants/themes/tenant-theme';
import { PRIMARY_ENGINE } from '@/foundation/contracts/kernel/engine-identity';
import { getFirstPartyVertical } from '@/foundation/tokens/ts/presentation/brand-themes';
import { brandTenantSelector } from '@/infrastructure/compilers/kernel/foundation/css/tenant-selectors';
import {
  compileTheme,
  containerScope,
  emitThemeCss,
  resolveAdapter,
  resolveTheme,
} from '@/infrastructure/compilers/runtime/theme';
import { liftAuthoredTheme } from '@/infrastructure/compilers/runtime/theme/runtime/lowering/foundation/intake';
import { verifyTenantThemeArtifactV1 } from '../../../../../../infrastructure/runtime/theming/foundation/visual-authority';
import {
  buildPreviewScopeSelector,
  isSafePreviewCssValue,
  sanitizePreviewSlug,
} from '../../../../../../infrastructure/runtime/tenant/runtime/preview-scope';

/** One generated declaration: `  <property>: <value>;` on a single line. */
const DECLARATION_PATTERN = /^\s*(--[A-Za-z0-9_-]+|[A-Za-z][A-Za-z0-9-]*)\s*:\s*(.+);\s*$/;

/** Characters permitted in a selector suffix after the tenant base selector. */
const SELECTOR_SUFFIX_PATTERN = /^[A-Za-z0-9[\]='".:()\- ]*$/;

/**
 * Rewrite a generated selector-open line onto the preview scope selector.
 * Returns null unless every comma-separated selector starts with the expected
 * tenant base selector and continues with inert selector characters only.
 */
function rescopeSelectorLine(
  line: string,
  baseSelector: string,
  scopeSelector: string
): string | null {
  if (!line.endsWith('{')) return null;
  const selectorText = line.slice(0, -1).trim();
  if (selectorText.length === 0) return null;

  const rescoped: string[] = [];
  for (const part of selectorText.split(',')) {
    const trimmed = part.trim();
    if (!trimmed.startsWith(baseSelector)) return null;
    const suffix = trimmed.slice(baseSelector.length);
    if (!SELECTOR_SUFFIX_PATTERN.test(suffix)) return null;
    rescoped.push(`${scopeSelector}${suffix}`);
  }
  return `${rescoped.join(', ')} {`;
}

export interface PreviewCss {
  /** Sanitized stylesheet whose every rule is anchored to the scope selector. */
  css: string;
  /** Slug reduced to CSS-inert characters; the scope attribute's value. */
  safeSlug: string;
  /** The full scope selector the css is anchored to. */
  scopeSelector: string;
  /**
   * Visual axes present on the source that this preview could NOT represent
   * in `css`, named rather than dropped in silence. Always empty for a
   * caller-supplied `PreviewSource` (the caller already resolved that arm and
   * is responsible for what it chose to include). Populated only when
   * `buildPreviewCss` resolves a `TenantConfig` itself -- see
   * `resolvePreviewInput` and `liftTenantConfigToBrandTheme` below.
   */
  unsupportedAxes: readonly string[];
}

/**
 * What to preview: one of the two canonical compile paths, and nothing else.
 *
 * `buildPreviewCss` also accepts a raw `TenantConfig` (see below) and
 * resolves it into one of these two arms internally, but a `PreviewSource`
 * itself never gains a third "TenantConfig" variant: every producer this
 * module re-anchors is either a compiled `BrandTheme` or a compiled
 * `TenantThemeArtifact`, and nothing else has ever emitted CSS this module
 * knows how to re-scope.
 */
export type PreviewSource =
  | { kind: 'brand-theme'; slug: string; brandTheme: BrandTheme }
  | { kind: 'tenant-theme'; artifact: TenantThemeArtifact };

/**
 * Lift an authoring draft into the BrandTheme the static compiler accepts.
 *
 * The authoring surface collects a slug and two seed colors; a BrandTheme
 * palette IS those seeds. Routing the draft through `compileTheme`
 * instead of a preview-only generator is what makes the preview honest: the
 * OKLCH ramps, the readable-ink floor and the palette semantics a compiled
 * tenant will actually ship are the ones on screen, derived by the same code.
 *
 * This is deliberately narrow and stays that way: it is genuinely lossless
 * for the 4-field draft shape it declares (slug/name/primaryColor/
 * secondaryColor), which is all an authoring surface has before a tenant
 * exists. It must NOT be used to lift a full `TenantConfig` -- that config
 * carries far more (branding's dark/semantic/font fields, personality,
 * tokenOverrides), and this function has no parameter to receive any of it,
 * so every one of those fields would be silently dropped. The TenantConfig
 * path in `buildPreviewCss` below uses `liftTenantConfigToBrandTheme`
 * instead, which is the same idea applied to that richer shape.
 *
 * `density` deliberately does not participate here: it is a semantic posture
 * the runtime resolves from `appearance`/`surfaces.density`, and inventing a
 * `surfaces` block here would put a second interpretation of it in the tree.
 */
export function draftBrandTheme(draft: {
  slug: string;
  name: string;
  primaryColor: string;
  secondaryColor?: string;
}): BrandTheme {
  return {
    id: draft.slug,
    name: draft.name,
    palette: {
      primaryColor: draft.primaryColor,
      ...(draft.secondaryColor ? { secondaryColor: draft.secondaryColor } : {}),
    },
  };
}

/**
 * Lift a full `TenantConfig`'s legacy visual fields (`branding`, `personality`,
 * `tokenOverrides`) into the `BrandTheme` shape the lowering's intake accepts.
 *
 * This is NOT `draftBrandTheme` above. That function lifts a narrow 4-field
 * AUTHORING DRAFT (slug/name/primaryColor/secondaryColor) and is genuinely
 * lossless for that input because that input IS that small. A `TenantConfig`
 * carries far more: `branding`'s dark-mode/semantic/font fields,
 * `personality`'s five dimensions, and `tokenOverrides`' structural
 * surface/radius/shadow/glass/gradient/density knobs. Routing a full
 * `TenantConfig` through `draftBrandTheme` would silently drop every one of
 * those -- the exact defect this function exists to repair -- so each is
 * placed on its verified equivalent BrandTheme channel instead:
 *   - `branding.{primary,secondary,accent,success,warning,error,info}Color`
 *     -> `palette` (same field names as `BrandPalette`)
 *   - `branding.dark{Primary,Secondary,Accent,Background}Color`
 *     -> `modes.dark.palette` (compiled as an independently-scoped mode block
 *       by `compileTheme`; the generic rescoping loop below re-anchors
 *       it exactly like the base block, no special-casing needed)
 *   - `branding.fontFamily{Base,Heading,Mono,Display}` -> `typography`
 *   - `personality.typography.{headingWeightBias,headingLetterSpacing,labelStyle}`
 *     -> `typography` (verified against `brandThemeToPersonality`, the
 *       compiler's own reverse bridge: identical field names/types)
 *   - `personality.animation` -> `motion` (same verification; several fields
 *     reach emitted CSS text directly -- `intensity` feeds
 *     `--ds-motion-intensity`, `entranceDuration` feeds `--ds-motion-calm`
 *     and its `calc()` dependents, `springTension`/`springFriction` feed
 *     `--ds-motion-spring-gentle` when `useSpring` is set -- so a personality
 *     preset change is genuinely visible in the compiled preview)
 *   - `tokenOverrides.{surface,borderRadius,shadows,glass,gradients,overlays,
 *     densityScale}` -> `surfaces` (the exact inverse of
 *     `brandThemeToTokenOverrides`; `densityScale` feeds `--ds-density-scale`
 *     directly, which is how the density axis becomes observable)
 *   - `personality.{chart,card,accent}` -> `charts`/`chrome.{card,accent}`
 *     (stored losslessly on the BrandTheme -- nothing is dropped
 *     structurally) but reported in `unsupportedAxes` below: `chromeToVariables`
 *     only reads the VISUAL chrome sub-objects (`cardComponent`, `badge`,
 *     `controls`, ...), never `chrome.card`/`chrome.accent`, and `bt.charts`
 *     only ever reaches the compiler's separate `.personality` return value,
 *     which `buildPreviewCss` does not read. Their absence from the emitted
 *     CSS is therefore a named, observable fact instead of a silent one.
 *
 * `logo`, `logoMark`, `favicon`, `companyName` (routed to `name` instead),
 * `plan`, `features`, `domain`, `engine`, `vertical`, and `componentPack` are
 * intentionally NOT lifted and NOT reported in `unsupportedAxes`: per
 * `BrandTheme`'s own doc comment it "does NOT include tenant identity" --
 * those fields have no CSS-variable channel to lose in the first place, so
 * naming them as an unsupported VISUAL axis would misrepresent what they are.
 *
 * Returns `null` when `branding.primaryColor` is absent: `BrandPalette.primaryColor`
 * is required, and there is no seed to build a palette from. Inventing one
 * would be exactly the DS-baseline-wearing-the-tenant's-name preview this
 * module refuses to produce (see `PreviewSource`'s doc comment above).
 */
function liftTenantConfigToBrandTheme(
  config: TenantConfig
): { brandTheme: BrandTheme; unsupportedAxes: readonly string[] } | null {
  const branding = config.branding;
  if (!branding.primaryColor) return null;

  const { accentColor } = branding;
  const unsupportedAxes: string[] = [];

  const palette: BrandPalette = {
    primaryColor: branding.primaryColor,
    ...(branding.secondaryColor ? { secondaryColor: branding.secondaryColor } : {}),
    ...(accentColor ? { accentColor } : {}),
    ...(branding.successColor ? { successColor: branding.successColor } : {}),
    ...(branding.warningColor ? { warningColor: branding.warningColor } : {}),
    ...(branding.errorColor ? { errorColor: branding.errorColor } : {}),
    ...(branding.infoColor ? { infoColor: branding.infoColor } : {}),
  };

  const typography: BrandTypography = {
    ...(branding.fontFamilyBase ? { fontFamilyBase: branding.fontFamilyBase } : {}),
    ...(branding.fontFamilyHeading ? { fontFamilyHeading: branding.fontFamilyHeading } : {}),
    ...(branding.fontFamilyMono ? { fontFamilyMono: branding.fontFamilyMono } : {}),
    ...(branding.fontFamilyDisplay ? { fontFamilyDisplay: branding.fontFamilyDisplay } : {}),
    ...(config.personality?.typography ?? {}),
  };

  const tokenOverrides = config.tokenOverrides;
  const borderRadius = tokenOverrides?.borderRadius;
  const surfaces: BrandSurfaces = {
    ...(tokenOverrides?.surface ? { surface: tokenOverrides.surface } : {}),
    ...(borderRadius ? { borderRadius } : {}),
    ...(tokenOverrides?.shadows ? { shadows: tokenOverrides.shadows } : {}),
    ...(tokenOverrides?.glass ? { glass: tokenOverrides.glass } : {}),
    ...(tokenOverrides?.gradients ? { gradients: tokenOverrides.gradients } : {}),
    ...(tokenOverrides?.overlays ? { overlays: tokenOverrides.overlays } : {}),
    ...(tokenOverrides?.densityScale !== undefined
      ? { densityScale: tokenOverrides.densityScale }
      : {}),
  };

  const motion: BrandMotion | undefined = config.personality?.animation
    ? { ...config.personality.animation }
    : undefined;

  const charts = config.personality?.chart;
  if (charts) unsupportedAxes.push('personality.chart');

  const chrome: BrandChrome = {};
  if (config.personality?.card) {
    chrome.card = config.personality.card;
    unsupportedAxes.push('personality.card');
  }
  if (config.personality?.accent) {
    chrome.accent = config.personality.accent;
    unsupportedAxes.push('personality.accent');
  }

  let darkPalette: Partial<BrandPalette>;
  {
    const {
      darkPrimaryColor: primaryColor,
      darkSecondaryColor: secondaryColor,
      darkAccentColor: accentColor,
      darkBackgroundColor: backgroundColor,
    } = branding;
    darkPalette = {
      ...(primaryColor ? { primaryColor } : {}),
      ...(secondaryColor ? { secondaryColor } : {}),
      ...(accentColor ? { accentColor } : {}),
      ...(backgroundColor ? { backgroundColor } : {}),
    };
  }
  const hasDarkPalette = Object.keys(darkPalette).length > 0;

  const brandTheme: BrandTheme = {
    id: config.slug,
    name: branding.companyName,
    palette,
    ...(Object.keys(typography).length > 0 ? { typography } : {}),
    ...(Object.keys(surfaces).length > 0 ? { surfaces } : {}),
    ...(motion ? { motion } : {}),
    ...(charts ? { charts } : {}),
    ...(Object.keys(chrome).length > 0 ? { chrome } : {}),
    ...(hasDarkPalette
      ? {
          appearance: { defaultMode: 'light' as const },
          modes: { dark: { palette: darkPalette } },
        }
      : {}),
  };

  return { brandTheme, unsupportedAxes };
}

function isPreviewSource(input: TenantConfig | PreviewSource): input is PreviewSource {
  return 'kind' in input;
}

/**
 * Resolve what to preview from either an already-resolved `PreviewSource` or
 * a raw `TenantConfig`.
 *
 * A `PreviewSource` is returned unchanged and reports no loss -- the caller
 * already did its own resolution and owns whatever it chose to include. That
 * silence is the reason no production caller uses this arm and none should:
 * `unsupportedAxes: []` on a pre-resolved source is true by definition, not by
 * inspection, so a caller that narrowed its input first (say, through
 * `draftBrandTheme`, which has no parameter for `personality` or
 * `tokenOverrides`) would drop those axes and be told nothing was dropped. All
 * three engines pass their `TenantConfig` and let the lift below place each
 * axis on its verified channel and NAME whatever it cannot represent. The arm
 * exists for a caller that genuinely already holds a compiled artifact.
 *
 * A `TenantConfig` is resolved in this order:
 *   1. A compiled `TenantThemeArtifact` the config already carries. There is
 *      currently no such field on `TenantConfig` (see
 *      `foundation/contracts/composition/tenants` -- `brandTheme` and
 *      `appearance` are its only visual channels), so this step is a no-op
 *      today; a caller already holding a compiled artifact passes it via the
 *      `PreviewSource` `tenant-theme` arm instead, handled above. This is
 *      where a future artifact-bearing field would be checked FIRST, ahead
 *      of `brandTheme`.
 *   2. `config.brandTheme` -- passed through in FULL, unmodified. Per
 *      `TenantConfig`'s own doc comment, when both are present `brandTheme`
 *      supersedes `branding`/`personality`/`tokenOverrides`, so ignoring
 *      those legacy fields here loses nothing that was actually authoritative.
 *   3. Otherwise, `config.branding`/`personality`/`tokenOverrides` are lifted
 *      into an equivalent BrandTheme (`liftTenantConfigToBrandTheme`).
 *   4. If there is not even a `branding.primaryColor` to seed a palette from,
 *      there is no producer for this config -- return a null source rather
 *      than inventing one.
 */
function resolvePreviewInput(
  input: TenantConfig | PreviewSource
): { source: PreviewSource; unsupportedAxes: readonly string[] } | { source: null; unsupportedAxes: readonly string[] } {
  if (isPreviewSource(input)) {
    return { source: input, unsupportedAxes: [] };
  }

  if (input.brandTheme) {
    return {
      source: { kind: 'brand-theme', slug: input.slug, brandTheme: input.brandTheme },
      unsupportedAxes: [],
    };
  }

  const lifted = liftTenantConfigToBrandTheme(input);
  if (lifted === null) {
    // No BrandTheme, no artifact, and not even a primary color to seed a
    // palette from: nothing this module can honestly compile a preview from.
    return { source: null, unsupportedAxes: ['palette'] };
  }
  return {
    source: { kind: 'brand-theme', slug: input.slug, brandTheme: lifted.brandTheme },
    unsupportedAxes: lifted.unsupportedAxes,
  };
}

/** Slug and root-scoped selector the compiled output of a source is written against. */
function resolveCompiledOutput(source: PreviewSource): {
  slug: string;
  baseSelector: string;
  css: string;
} {
  if (source.kind === 'tenant-theme') {
    // The brand-theme arm below RUNS a compiler, so its output is compiled by
    // construction. This arm does not: it is handed bytes and a selector and
    // asked to trust them. `TenantThemeArtifact` is a structural type, so an
    // object literal satisfies it, and the two fields read here are exactly
    // the two an unverified object controls outright -- which would make this
    // module publish "what the compiler produces" from CSS no compiler
    // produced, the one thing the file header says it must never do.
    //
    // Verification is what closes that gap, and it is specific: the verifier
    // recomputes `scopes` from the artifact's own identity and re-renders
    // `css` deterministically from `variables`/`digest`, so passing it means
    // the exact two fields consumed below are the compiler's, not the
    // caller's. Failure throws rather than falling back to the brand-theme
    // arm or emitting an empty sheet: a preview that silently degrades to a
    // different producer is the same lie in a quieter form.
    //
    // Identity ADMISSION (`assertTenantIdentityAllowed`) deliberately stays
    // out. It is a first-party-slug policy the brand-theme arm does not apply
    // either, and enforcing it on one arm only would make the same module
    // answer the same question two ways. What is fixed here is provenance.
    const { artifact } = source;
    if (
      !artifact ||
      typeof artifact.slug !== 'string' ||
      typeof artifact.verticalKey !== 'string'
    ) {
      throw new TypeError('[design-system] Invalid tenant preview artifact identity.');
    }
    const verification = verifyTenantThemeArtifactV1(artifact, {
      slug: artifact.slug,
      verticalKey: artifact.verticalKey,
    });
    if (!verification.ok) {
      throw new TypeError(
        `[design-system] Invalid tenant preview artifact: ${verification.error}`
      );
    }
    const verified = verification.artifact;

    // The artifact's own declared scope. Read from `scopes`, never rebuilt
    // here: the compiler owns the exact specificity of that selector, and a
    // reconstruction that drifts stops matching without failing.
    return {
      slug: verified.slug,
      baseSelector: verified.scopes.combinedSelector,
      css: verified.css,
    };
  }

  // Compiled with the SANITIZED slug so the emitted selectors are
  // byte-predictable before the rescope pass reads them.
  const safeSlug = sanitizePreviewSlug(source.slug);
  return {
    slug: safeSlug,
    baseSelector: brandTenantSelector(safeSlug),
    css: emitThemeCss(
      compileTheme(
        resolveTheme({ ...liftAuthoredTheme(source.brandTheme), id: safeSlug }),
        // The previewed slug names the vertical, and the vertical owns the
        // engine. A draft slug that is not first-party takes the DS primary.
        resolveAdapter(getFirstPartyVertical(safeSlug)?.engine ?? PRIMARY_ENGINE),
      ),
      containerScope(brandTenantSelector(safeSlug)),
    ),
  };
}

/**
 * Rescope compiled tenant CSS into a preview container.
 *
 * The compiled output is rebuilt through a whitelist state machine: only
 * expected selector-open lines (re-anchored to the preview scope), safe
 * single-line declarations, and block closers survive. Comment lines (which
 * interpolate the tenant display name) and anything malformed -- including
 * multi-line or block-escaping values -- are dropped.
 *
 * @throws TypeError when a `tenant-theme` source carries an artifact that does
 * not verify. That arm is the only input this module cannot compile for
 * itself, so an unverifiable artifact has no honest rendering: an empty sheet
 * would read as "this tenant has no styling" and a fallback to the
 * brand-theme arm would show a different producer's output under the same
 * slug. Refusing is the only outcome that does not misreport.
 */
export function buildPreviewCss(source: TenantConfig | PreviewSource): PreviewCss {
  const resolved = resolvePreviewInput(source);

  if (resolved.source === null) {
    // `resolvePreviewInput` only ever returns a null source for the
    // TenantConfig branch (every PreviewSource arm resolves unconditionally),
    // so `source` is a TenantConfig here.
    const safeSlug = sanitizePreviewSlug((source as TenantConfig).slug);
    return {
      css: '',
      safeSlug,
      scopeSelector: buildPreviewScopeSelector(safeSlug),
      unsupportedAxes: resolved.unsupportedAxes,
    };
  }

  const compiled = resolveCompiledOutput(resolved.source);
  const safeSlug = sanitizePreviewSlug(compiled.slug);
  const scopeSelector = buildPreviewScopeSelector(safeSlug);
  const baseSelector = compiled.baseSelector;
  const generated = compiled.css;

  const output: string[] = [];
  let insideBlock = false;

  for (const line of generated.split('\n')) {
    if (!insideBlock) {
      const rescoped = rescopeSelectorLine(line, baseSelector, scopeSelector);
      if (rescoped !== null) {
        output.push(rescoped);
        insideBlock = true;
      }
      continue;
    }
    if (line.trim() === '}') {
      output.push('}');
      insideBlock = false;
      continue;
    }
    const declaration = DECLARATION_PATTERN.exec(line);
    if (declaration && isSafePreviewCssValue(declaration[2])) {
      output.push(`  ${declaration[1]}: ${declaration[2]};`);
    }
  }
  if (insideBlock) {
    output.push('}');
  }

  return { css: output.join('\n'), safeSlug, scopeSelector, unsupportedAxes: resolved.unsupportedAxes };
}
