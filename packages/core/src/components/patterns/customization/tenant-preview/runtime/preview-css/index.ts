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
 * `TenantConfig`, whose only remaining visual channel is its bounded branding.
 * The resolution from `TenantConfig` to `PreviewSource` happens internally in
 * `resolvePreviewInput`/`liftTenantConfigToTheme` below, so callers stay
 * dumb call sites. An authoring draft that wants its personality preset and
 * density painted resolves through `draftPreviewSource` instead: those are
 * theme channels, not `TenantConfig` ones.
 */

import type { TenantConfig } from '../../../../../../foundation/contracts/composition/tenants';
import type {
  BrandPalette,
  FlatTheme,
  BrandTypography,
} from '../../../../../../foundation/contracts/composition/tenants/themes';
import type { TenantThemeArtifact } from '../../../../../../foundation/contracts/composition/tenants/themes/tenant-theme';
import type { FirstPartyVerticalId } from '@/foundation/contracts/kernel/verticals';
import { isFirstPartyVerticalId } from '@/foundation/presets/verticals/roster';
import { brandTenantSelector } from '@/infrastructure/compilers/kernel/foundation/css/tenant-selectors';
import {
  compileThemeIntent,
  containerScope,
  draftPreviewThemeIntent,
  draftTenantTheme,
  governedTenantTheme,
  emitThemeCss,
} from '@/infrastructure/compilers/runtime/theme';
import { verifyTenantThemeArtifactV1 } from '../../../../../../infrastructure/runtime/theming/foundation/visual-authority';
import {
  createTenantTheme,
  type TenantCreationConfig,
} from '@/infrastructure/runtime/tenant/runtime/authoring/configuration';
import {
  buildPreviewScopeSelector,
  isSafePreviewCssValue,
  sanitizePreviewSlug,
} from '../../../../../../infrastructure/runtime/tenant/runtime/preview-scope';

/** One generated declaration: `  <property>: <value>;` on a single line. */
import type { Theme } from '@/foundation/contracts/composition/tenants/themes/iso';

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
   * `resolvePreviewInput` and `liftTenantConfigToTheme` below.
   */
  unsupportedAxes: readonly string[];
}

/**
 * What to preview: one of the two canonical compile paths, and nothing else.
 *
 * `buildPreviewCss` also accepts a raw `TenantConfig` (see below) and
 * resolves it into one of these two arms internally, but a `PreviewSource`
 * itself never gains a third "TenantConfig" variant: every producer this
 * module re-anchors is either a compiled governed `Theme` or a compiled
 * `TenantThemeArtifact`, and nothing else has ever emitted CSS this module
 * knows how to re-scope.
 */
export type PreviewSource =
  | {
      /**
       * WO-DER-08 renamed this discriminator from `brand-theme`, and the
       * payload from `flatTheme` to `theme`, because the draft is now the
       * governed `Theme` and the old names stated a transport that no longer
       * exists. It is a serialized union tag, so `readPreviewSource` below
       * migrates the old shape by name rather than letting it fail silently.
       */
      kind: 'theme-draft';
      /**
       * The first-party vertical the draft is a patch of. A draft is not a
       * baseline of its own: the publish path resolves it over the vertical's
       * theme, so a preview that does not name one is previewing a compile that
       * cannot be published.
       */
      vertical: FirstPartyVerticalId;
      slug: string;
      theme: Theme;
    }
  | { kind: 'tenant-theme'; artifact: TenantThemeArtifact };

/** The superseded shape, kept only so the migration below can name it. */
type LegacyBrandThemeSource = {
  kind: 'brand-theme';
  vertical: FirstPartyVerticalId;
  slug: string;
  flatTheme: FlatTheme;
};

/**
 * Accept the superseded `brand-theme` source and carry it forward.
 *
 * A REGISTERED MIGRATION, not a compatibility shim that stays: the union tag
 * and its payload key are serialized data, so WO-DER-08 renames them with a
 * reader that lifts the old flat payload into the governed Theme through the
 * same `liftAuthoredTheme` the intake owns. A caller still on the old shape
 * therefore previews the same compile instead of throwing, and the grep for
 * `flatTheme` outside this migration is zero.
 */
export function readPreviewSource(
  source: PreviewSource | LegacyBrandThemeSource,
): PreviewSource {
  if (source.kind !== 'brand-theme') return source;
  return {
    kind: 'theme-draft',
    vertical: source.vertical,
    slug: source.slug,
    theme: governedTenantTheme(source.flatTheme),
  };
}

/**
 * Lift an authoring draft into the governed `Theme` the compile door accepts.
 *
 * The authoring surface collects a slug and two seed colors; a theme
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
 * path in `buildPreviewCss` below uses `liftTenantConfigToTheme`
 * instead, which is the same idea applied to that richer shape.
 *
 * `density` deliberately does not participate here: it is a semantic posture
 * the runtime resolves from `appearance`/`surfaces.density`, and inventing a
 * `surfaces` block here would put a second interpretation of it in the tree.
 */
export function draftTheme(draft: {
  slug: string;
  name: string;
  primaryColor: string;
  secondaryColor?: string;
}): Theme {
  // The four authored fields, handed straight to the owner that builds the
  // governed Theme from them. The palette assembly moved WITH the lift so this
  // module holds no second interpretation of the same bounded set.
  return draftTenantTheme(draft);
}

/**
 * Lift a `TenantConfig`'s bounded branding into the governed `Theme` the
 * lowering's intake accepts.
 *
 * This is NOT `draftTheme` above. That function lifts a narrow 4-field
 * AUTHORING DRAFT (slug/name/primaryColor/secondaryColor). This one lifts every
 * visual field a `TenantConfig` still has, which is exactly `branding`:
 *   - `branding.{primary,secondary,accent,success,warning,error,info}Color`
 *     -> `palette` (same field names as `BrandPalette`)
 *   - `branding.dark{Primary,Secondary,Accent,Background}Color`
 *     -> `modes.dark.palette` (compiled as an independently-scoped mode block
 *       by `compileTheme`; the generic rescoping loop below re-anchors
 *       it exactly like the base block, no special-casing needed)
 *   - `branding.fontFamily{Base,Heading,Mono,Display}` -> `typography`
 *
 * It reports NO unsupported axis, and that is a statement about the input, not
 * a silence: `branding` is the whole visual surface a `TenantConfig` carries,
 * so there is no authored visual axis this lift can fail to represent.
 *
 * `logo`, `logoMark`, `favicon`, `companyName` (routed to `name` instead),
 * `plan`, `features`, `domain`, `vertical`, and `componentPack` are
 * intentionally NOT lifted and NOT reported: per the flat projection's own doc comment
 * it "does NOT include tenant identity" -- those fields have no CSS-variable
 * channel to lose in the first place, so naming them as an unsupported VISUAL
 * axis would misrepresent what they are.
 *
 * Returns `null` when `branding.primaryColor` is absent: `BrandPalette.primaryColor`
 * is required, and there is no seed to build a palette from. Inventing one
 * would be exactly the DS-baseline-wearing-the-tenant's-name preview this
 * module refuses to produce (see `PreviewSource`'s doc comment above).
 */
function liftTenantConfigToTheme(config: TenantConfig): Theme | null {
  const branding = config.branding;
  if (!branding.primaryColor) return null;

  const { accentColor } = branding;

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
  };

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

  // The bounded branding is assembled in the flat vocabulary it is written in,
  // then lifted ONCE. Assembling a governed Theme field by field here would be a
  // second interpretation of the same bounded set, which is what the intake's
  // `liftAuthoredTheme` already owns.
  return governedTenantTheme({
    id: config.slug,
    name: branding.companyName,
    palette,
    ...(Object.keys(typography).length > 0 ? { typography } : {}),
    // The overlay only. `appearance.defaultMode` used to be stamped `'light'`
    // here so that a standalone draft could legally carry a `modes.dark`
    // overlay. A draft is a patch over a vertical now, and the vertical
    // declares its own default mode; restating it would let a legacy branding
    // lift silently flip the mode of the product it is a tenant of. A dark
    // overlay on a dark-default vertical is refused by the overlay law, which
    // is the correct answer: there, a tenant's dark seeds ARE the base palette.
    ...(hasDarkPalette ? { modes: { dark: { palette: darkPalette } } } : {}),
  });
}

/**
 * The preview source an AUTHORING DRAFT compiles to.
 *
 * A draft's personality preset and density posture are theme channels --
 * `motion`, `typography`, `chrome`, `surfaces` -- so the honest preview of a
 * draft is a compile of the theme it would publish, not of the identity config
 * it would publish beside it.
 *
 * `null` when the draft names no first-party vertical: a draft is a patch over
 * a vertical, so one that names no baseline names no compile either. Callers
 * fall back to the config arm, which reports `vertical` as the lost axis.
 */
export function draftPreviewSource(draft: TenantCreationConfig): PreviewSource | null {
  if (!isFirstPartyVerticalId(draft.vertical)) return null;
  return {
    kind: 'theme-draft',
    vertical: draft.vertical,
    slug: draft.slug,
    theme: createTenantTheme(draft),
  };
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
 * `draftTheme`, which has no parameter for `personality` or
 * `tokenOverrides`) would drop those axes and be told nothing was dropped. All
 * three engines pass their `TenantConfig` and let the lift below place each
 * axis on its verified channel and NAME whatever it cannot represent. The arm
 * exists for a caller that genuinely already holds a compiled artifact.
 *
 * A `TenantConfig` carries exactly one visual channel -- its bounded
 * `branding` -- so it resolves by lifting that onto an equivalent theme
 * (`liftTenantConfigToTheme`). If there is not even a
 * `branding.primaryColor` to seed a palette from, there is no producer for this
 * config, and a null source is returned rather than one invented.
 */
function resolvePreviewInput(
  input: TenantConfig | PreviewSource
): { source: PreviewSource; unsupportedAxes: readonly string[] } | { source: null; unsupportedAxes: readonly string[] } {
  if (isPreviewSource(input)) {
    return { source: input, unsupportedAxes: [] };
  }

  // A draft compiles as a patch over the vertical it belongs to, so a config
  // that does not name a first-party vertical names no baseline. It used to be
  // previewed under `PRIMARY_ENGINE` over its own sparse theme, which produced
  // CSS for a compile the publish path would have refused outright. Reported as
  // a lost axis, on the same channel every other unsupported axis uses.
  if (!isFirstPartyVerticalId(input.vertical)) {
    return { source: null, unsupportedAxes: ['vertical'] };
  }
  const vertical: FirstPartyVerticalId = input.vertical;

  const lifted = liftTenantConfigToTheme(input);
  if (lifted === null) {
    // Not even a primary color to seed a palette from: nothing this module can
    // honestly compile a preview from.
    return { source: null, unsupportedAxes: ['palette'] };
  }
  return {
    source: { kind: 'theme-draft', vertical, slug: input.slug, theme: lifted },
    unsupportedAxes: [],
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
      // The intent names the vertical; the vertical owns the baseline and the
      // engine, and the door refuses a vertical the roster does not declare.
      compileThemeIntent(
        draftPreviewThemeIntent({
          vertical: source.vertical,
          slug: safeSlug,
          draft: source.theme,
        }),
      ).compiled,
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
