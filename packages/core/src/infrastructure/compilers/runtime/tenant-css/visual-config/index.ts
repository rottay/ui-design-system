/**
 * @fileoverview Tenant visual composition - Rottay Design System
 * @description Generate runtime tenant CSS from `TenantConfig` without requiring
 * prebuilt per-tenant stylesheets.
 *
 * @remarks
 * This module is what makes tenant self-service viable: the app/platform layer
 * can persist tenant branding and personality in data, and the DS can turn that
 * into CSS variables on demand at runtime.
 */

import type { TenantConfig } from '../../../../../foundation/contracts';
import type { CompiledBrand } from '../../../../../foundation/contracts/composition/tenants/themes';
import {
  compileBrandTheme,
  brandThemeToBranding,
  brandThemeToChromeVariables,
  isDarkSurfacePalette,
  mergePartialPersonality,
  deepMergeTokenOverrides,
} from '@/infrastructure/compilers/kernel/runtime/brand-theme';
import {
  enforceTextContrast,
  type TextContrastBackgroundMode,
} from '@/foundation/kernel/accessibility/branding-contrast/text-contrast-autocorrect';
import {
  isHexColor,
  normalizeHexColor,
  hexToRgb,
  rgbToHex,
  mixColor,
  buildRuntimeScale,
  buildDarkRuntimeScale,
  getReadableForegroundColor,
  buildElevationScale,
} from '@/infrastructure/compilers/kernel/foundation/css/color-math';
import { compileAppearanceVariables } from '@/infrastructure/compilers/kernel/runtime/appearance';
import { getVerticalPreset } from '@/foundation/presets/verticals';
import type { VerticalPreset } from '../../../../../foundation/contracts/composition/tenants';
import { getProductProfile } from '@/foundation/presets/product-profiles';
import { resolvePartialPersonalityCssVariables } from '@/foundation/tokens/ts/runtime/personality';

const COLOR_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] as const;

/**
 * Palette roles that own a `--ds-color-{role}` channel and a
 * `--ds-color-{role}-{50..900}` ramp. The OKLCH brand compiler
 * (`deriveTenantColorRamps`) authors these for every role a BrandTheme seeds;
 * the legacy sRGB scale below may only fill the roles it leaves unauthored.
 * Both sides are asserted to a single author per channel by
 * `assertSingleLightEmitter`.
 */
const PALETTE_ROLES = [
  'primary',
  'secondary',
  'accent',
  'success',
  'warning',
  'error',
  'info',
] as const;

const PALETTE_CHANNELS: ReadonlySet<string> = new Set(
  PALETTE_ROLES.flatMap((role) => [
    `--ds-color-${role}`,
    ...COLOR_STEPS.map((step) => `--ds-color-${role}-${step}`),
  ]),
);

export interface GenerateTenantCssOptions {
  includeDarkSelector?: boolean;
  includeSystemDarkSelector?: boolean;
}

export interface ResolveTenantVisualConfigOptions {
  /**
   * Resolved vertical preset. When omitted, config.vertical is resolved locally.
   * DesignSystemProvider passes its already-resolved vertical here so prop-level
   * vertical overrides and static generation follow the same brand merge path.
   */
  vertical?: VerticalPreset;
  /**
   * Static generation must materialize the legacy path (vertical -> profile ->
   * tenant) into CSS. Runtime keeps that legacy path in useTokens().
   */
  includeLegacyProductProfile?: boolean;
  /**
   * Bundled first-party tenants already get their default visual fields from
   * precompiled CSS, so runtime should not inject duplicate palette/font vars.
   */
  useCssOwnedBranding?: boolean;
}

export interface ResolvedTenantVisualConfig {
  config: TenantConfig;
  compiledBrand?: CompiledBrand;
}

const VISUAL_BRANDING_KEYS = [
  'primaryColor',
  'secondaryColor',
  'accentColor',
  'darkPrimaryColor',
  'darkSecondaryColor',
  'darkAccentColor',
  'darkBackgroundColor',
  'successColor',
  'warningColor',
  'errorColor',
  'infoColor',
  'fontFamilyBase',
  'fontFamilyHeading',
  'fontFamilyMono',
  'fontFamilyDisplay',
] as const;

export function hasVisualBrandingFields(
  branding: TenantConfig['branding'] | Partial<TenantConfig['branding']> | undefined,
): boolean {
  if (!branding) return false;
  return VISUAL_BRANDING_KEYS.some((key) => branding[key] != null);
}

function stripVisualBrandingFields(branding: TenantConfig['branding']): TenantConfig['branding'] {
  return {
    companyName: branding.companyName,
    logo: branding.logo,
    logoMark: branding.logoMark,
    favicon: branding.favicon,
  };
}

function mergeDefinedBranding(
  base: Partial<TenantConfig['branding']>,
  override: TenantConfig['branding'],
): TenantConfig['branding'] {
  const result: Partial<TenantConfig['branding']> = { ...base };

  for (const [key, value] of Object.entries(override) as Array<
    [keyof TenantConfig['branding'], TenantConfig['branding'][keyof TenantConfig['branding']]]
  >) {
    if (value !== undefined) {
      result[key] = value;
    }
  }

  return result as TenantConfig['branding'];
}

/**
 * Resolve the tenant visual bridge used by both runtime and static CSS paths.
 *
 * Precedence:
 * - Brand path: vertical -> compileBrandTheme(brandTheme) -> tenant
 * - Legacy static path: vertical -> product profile -> tenant
 * - Appearance is intentionally not folded into config; callers layer
 *   appearanceToVariables() last so it can override CSS vars without mutating
 *   tenant identity/compat fields.
 */
export function resolveTenantVisualConfig(
  config: TenantConfig,
  options: ResolveTenantVisualConfigOptions = {}
): ResolvedTenantVisualConfig {
  const vertical = options.vertical ?? (config.vertical ? getVerticalPreset(config.vertical) : undefined);

  if (config.brandTheme) {
    const compiledBrand = compileBrandTheme({
      brandTheme: config.brandTheme,
      tenantSlug: config.slug,
      verticalPersonality: vertical?.personality,
      verticalTokenOverrides: vertical?.tokenOverrides,
    });

    const branding = options.useCssOwnedBranding
      ? stripVisualBrandingFields(config.branding)
      : mergeDefinedBranding(brandThemeToBranding(config.brandTheme), config.branding);

    return {
      compiledBrand,
      config: {
        ...config,
        branding,
        personality: mergePartialPersonality(
          compiledBrand.personality,
          config.personality ?? {},
        ),
        tokenOverrides: deepMergeTokenOverrides(
          compiledBrand.tokenOverrides,
          config.tokenOverrides,
        ) as TenantConfig['tokenOverrides'],
      },
    };
  }

  if (!options.includeLegacyProductProfile) {
    return { config };
  }

  const profile = getProductProfile(vertical?.defaultProductProfile);
  const personality = mergePartialPersonality(
    mergePartialPersonality(vertical?.personality ?? {}, profile.personality ?? {}),
    config.personality ?? {},
  );
  const profileOverrides = deepMergeTokenOverrides(
    vertical?.tokenOverrides ?? {},
    profile.tokenOverrides ?? {},
  );
  const tokenOverrides = config.tokenOverrides
    ? deepMergeTokenOverrides(profileOverrides, config.tokenOverrides)
    : profileOverrides;

  return {
    config: {
      ...config,
      personality,
      tokenOverrides: tokenOverrides as TenantConfig['tokenOverrides'],
    },
  };
}

// Color math (isHexColor, normalizeHexColor, hexToRgb, rgbToHex, mixColor,
// buildRuntimeScale, buildDarkRuntimeScale, getReadableForegroundColor) imported
// from compilers/kernel/foundation/css/color-math — single canonical implementation.

/** Render a selector block from a flat declaration map. */
function toCssBlock(selector: string, declarations: Record<string, string | number | undefined>): string {
  const lines = Object.entries(declarations)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([name, value]) => `  ${name}: ${String(value)};`);

  return `${selector} {\n${lines.join('\n')}\n}`;
}

/** Indent nested CSS blocks for readable generated output. */
function indentBlock(block: string, spaces = 2): string {
  const indent = ' '.repeat(spaces);
  return block
    .split('\n')
    .map((line) => (line.length > 0 ? `${indent}${line}` : line))
    .join('\n');
}

/**
 * Generate tenant branding variables for the default light theme.
 *
 * Single-author law: a palette channel the OKLCH brand compiler already wrote
 * is NOT written here. The flat `mixColor` scale used to be spread over the
 * compiled ramp and won every step, so a tenant carrying both `branding` and
 * `brandTheme` shipped the sRGB mix instead of the perceptual ramp its own
 * BrandTheme compiled. The scale still fills roles the compiler left
 * unauthored -- a tenant with legacy branding colors and no `brandTheme` has
 * no other palette author, and dropping it outright would repaint it in the
 * design system's default colors.
 *
 * The four derived channels below have no compiled counterpart (the brand
 * compiler emits none of them), so they stay legacy-owned and keep deriving
 * from the sRGB scale. They are written unconditionally on purpose: if the
 * compiler ever starts emitting one, that is a second author and
 * `assertSingleLightEmitter` must say so rather than silently yield.
 */
function brandingVariables(
  config: TenantConfig,
  compilerOwnedChannels: ReadonlySet<string>,
): Record<string, string | number | undefined> {
  const declarations: Record<string, string | number | undefined> = {};
  const colorEntries = [
    ['primary', config.branding.primaryColor],
    ['secondary', config.branding.secondaryColor],
    ['accent', config.branding.accentColor],
  ] as const;

  colorEntries.forEach(([tokenName, colorValue]) => {
    if (!colorValue) {
      return;
    }

    const scale = buildRuntimeScale(colorValue);
    const claimUnowned = (name: string, value: string): void => {
      if (!compilerOwnedChannels.has(name)) {
        declarations[name] = value;
      }
    };

    claimUnowned(`--ds-color-${tokenName}`, scale[500]);
    COLOR_STEPS.forEach((step) => {
      claimUnowned(`--ds-color-${tokenName}-${step}`, scale[step]);
    });

    if (tokenName === 'primary') {
      declarations['--ds-color-primary-foreground'] = getReadableForegroundColor(scale[500]);
      declarations['--ds-color-link'] = scale[500];
      declarations['--ds-color-link-hover'] = scale[600];
      declarations['--ds-color-border-focus'] = scale[500];
    }
  });

  return declarations;
}

/**
 * Generate tenant branding variables for dark-theme selectors.
 *
 * @ds-exception kind=capability-gap owner=claude
 *   purpose="sole author of the dark palette ramp; no OKLCH dark competitor exists"
 *   reachability=mode:dark
 *   retire="until OKLCH dark ramp derivation exists"
 *
 * `deriveTenantColorRamps` derives one ramp keyed to the theme's own surface,
 * so a light-surface tenant gets no compiled dark twin at all. This sRGB dark
 * scale is therefore the only author of `--ds-color-{role}-{50..900}` inside
 * the dark blocks -- a capability gap, not the dual emission the light block
 * carried. It stays until the OKLCH compiler can derive a dark ramp, at which
 * point this function retires and the dark blocks join the same single-author
 * assertion the light block is held to.
 */
function darkBrandingVariables(config: TenantConfig): Record<string, string | number | undefined> {
  const declarations: Record<string, string | number | undefined> = {};
  const colorEntries = [
    ['primary', config.branding.primaryColor],
    ['secondary', config.branding.secondaryColor],
    ['accent', config.branding.accentColor],
  ] as const;

  colorEntries.forEach(([tokenName, colorValue]) => {
    if (!colorValue) {
      return;
    }

    const scale = buildDarkRuntimeScale(colorValue);
    declarations[`--ds-color-${tokenName}`] = scale[400];
    COLOR_STEPS.forEach((step) => {
      declarations[`--ds-color-${tokenName}-${step}`] = scale[step];
    });

    if (tokenName === 'primary') {
      declarations['--ds-color-primary-foreground'] = getReadableForegroundColor(scale[400]);
      declarations['--ds-color-link'] = scale[300];
      declarations['--ds-color-link-hover'] = scale[200];
      declarations['--ds-color-border-focus'] = scale[300];
    }
  });

  return declarations;
}

/** Convert structural token overrides from config into CSS variable declarations. */
function tokenOverrideVariables(config: TenantConfig): Record<string, string | number | undefined> {
  const overrides = config.tokenOverrides;

  return {
    '--ds-surface-border-width': overrides?.surface?.borderWidth,
    '--ds-surface-border-style': overrides?.surface?.borderStyle,
    '--ds-surface-use-gradients': overrides?.surface?.useGradients ? '1' : undefined,
    '--ds-surface-use-glass': overrides?.surface?.useGlass ? '1' : undefined,
    '--ds-motion-hover-transition': overrides?.motion?.hover,
    '--ds-motion-hover-transform': overrides?.motion?.transform,
    '--ds-motion-spring': overrides?.motion?.spring,
    '--ds-motion-duration-scale': overrides?.motion?.durationScale,
    '--ds-density-scale': overrides?.densityScale,
    '--ds-radius-sm': overrides?.borderRadius?.sm,
    '--ds-radius-md': overrides?.borderRadius?.md,
    '--ds-radius-lg': overrides?.borderRadius?.lg,
    '--ds-radius-xl': overrides?.borderRadius?.xl,
    '--ds-shadow-sm': overrides?.shadows?.sm,
    '--ds-shadow-md': overrides?.shadows?.md,
    '--ds-shadow-lg': overrides?.shadows?.lg,
    '--ds-shadow-xl': overrides?.shadows?.xl,
  };
}

/**
 * Personality-derived CSS variable deltas for the static tenant generator.
 * Delegates to the same derivation `resolvePersonalityCssVariables` (the
 * runtime bridge) uses, so a tenant's generated stylesheet and its live
 * runtime paint the same personality-driven values from one formula.
 */
function personalityVariables(config: TenantConfig): Record<string, string | number | undefined> {
  return resolvePartialPersonalityCssVariables(config.personality);
}

function darkPersonalityOverrides(config: TenantConfig): Record<string, string | number | undefined> {
  const personality = config.personality;
  if (!personality) {
    return {};
  }

  return {
    // In dark mode, card hover tint should mix with a dark shade of the primary
    '--ds-card-bg-hover':
      personality.card?.hoverTint !== undefined
        ? personality.card.hoverTint
          ? 'color-mix(in srgb, var(--ds-card-bg) 88%, var(--ds-color-primary-800) 12%)'
          : 'var(--ds-card-bg)'
        : undefined,
  };
}

/** The design system's dark ground, used when a tenant declares none. */
const DEFAULT_DARK_GROUND = '#0a0a0a';

function darkSemanticVariables(config: TenantConfig): Record<string, string | number | undefined> {
  const primaryColor = config.branding.primaryColor
    ? buildDarkRuntimeScale(config.branding.primaryColor)[300]
    : '#7dd3fc';

  // The tenant's own dark ground. `palette.darkBackgroundColor` used to compile
  // only to `--ds-color-dark-bg`, which nothing consumes, while the canvas below
  // was a literal -- so a tenant could declare a ground and never see it.
  const ground = config.brandTheme?.palette?.darkBackgroundColor ?? DEFAULT_DARK_GROUND;

  return {
    /* ── Background inversion: the tenant's ground, or the DS default ── */
    '--ds-color-bg-primary': ground,
    '--ds-color-bg-secondary': '#111827',
    '--ds-color-bg-tertiary': '#162033',
    '--ds-color-bg-elevated': '#141a2a',
    '--ds-color-bg-overlay': 'rgba(2, 6, 23, 0.78)',
    '--ds-color-bg': ground,
    '--ds-color-background': ground,

    /* ── Surfaces ── */
    '--ds-color-surface': '#111827',
    '--ds-color-surface-primary': '#111827',
    '--ds-color-surface-secondary': '#162033',
    '--ds-color-surface-muted': '#1a2332',

    /* ── Text inversion: dark text (#0A0A0A) -> light text (#FAFAFA) ── */
    '--ds-color-text-primary': '#fafafa',
    '--ds-color-text-secondary': '#cbd5e1',
    '--ds-color-text-tertiary': '#94a3b8',
    '--ds-color-text-muted': '#94a3b8',
    // Chosen by the primary's own luminance, not asserted. `getReadableForegroundColor`
    // is already used three lines up for `--ds-color-primary-foreground`; this line
    // hardcoded white beside it, so a tenant whose dark primary is light -- evnto's
    // resolves to #e8e8e0 -- painted white text on a near-white badge.
    '--ds-color-text-on-primary': getReadableForegroundColor(primaryColor),
    '--ds-color-text-inverse': '#0a0a0a',
    '--ds-color-text': '#fafafa',

    /* ── Border adjustment: rgba(0,0,0,0.08) -> rgba(255,255,255,0.12) ── */
    '--ds-color-border-primary': 'rgba(255, 255, 255, 0.12)',
    '--ds-color-border-secondary': 'rgba(255, 255, 255, 0.08)',

    /* ── Brand colors: keep hue, adjust for dark contrast ── */
    '--ds-color-link': primaryColor,
    '--ds-color-link-hover': config.branding.primaryColor
      ? buildDarkRuntimeScale(config.branding.primaryColor)[200]
      : '#a5d8ff',

    /* ── Focus ring: the dark-lightened primary (scale[300]) reads >=3:1 on the
       dark canvas, where the base near-black primary would be dark-blind
       (WO-ENG-04 interaction-state contract). ── */
    '--ds-focus-ring-color': primaryColor,

    /* ── Overlay / Modal ── */
    '--ds-overlay-bg': 'rgba(2, 6, 23, 0.72)',
    '--ds-modal-overlay-bg': 'rgba(2, 6, 23, 0.78)',

    /* ── Component surfaces ── */
    '--ds-card-bg': '#111827',
    '--ds-card-bg-hover': 'color-mix(in srgb, #111827 86%, var(--ds-color-primary-400) 14%)',
    '--ds-modal-bg': '#111827',
    '--ds-drawer-bg': '#111827',
    '--ds-message-bg': '#111827',
    '--ds-toast-bg': '#111827',
    '--ds-notification-bg': '#111827',
    '--ds-tooltip-bg': '#0f172a',

    /* ── Input ── */
    // `--ds-color-bg-input` is deliberately NOT emitted here. It carries the
    // tenant's own control surface from the base block, and a literal in this
    // dark block would overwrite it -- a dynamic dark tenant that declared
    // `chrome.controls.input.bg: '#1A0014'` would paint slate instead.
    // A light-authored chrome on a dark ground is a real defect, but the design
    // system cannot tell which mode a single-valued chrome was authored for.
    // That is WO-ENG-22's subject; guessing here would be worse than the bug.
    '--ds-input-bg': '#0f172a',
    '--ds-input-border': 'rgba(255, 255, 255, 0.12)',
    '--ds-input-border-hover': 'rgba(255, 255, 255, 0.2)',
    '--ds-input-placeholder-color': '#94a3b8',
    '--ds-input-color': '#fafafa',

    /* ── Depth tokens alias the dark elevation ramp so every --ds-shadow-* /
       --ds-card-shadow* consumer inherits the hairline highlight (pure-black
       shadows are invisible on a dark canvas) ── */
    '--ds-shadow-xs': 'var(--ds-elevation-1)',
    '--ds-shadow-sm': 'var(--ds-elevation-1)',
    '--ds-shadow-md': 'var(--ds-elevation-2)',
    '--ds-shadow-lg': 'var(--ds-elevation-3)',
    '--ds-shadow-xl': 'var(--ds-elevation-4)',
    '--ds-shadow-2xl': 'var(--ds-elevation-5)',
    '--ds-card-shadow': 'var(--ds-elevation-1)',
    '--ds-card-shadow-hover': 'var(--ds-elevation-2)',
    '--ds-card-shadow-elevated': 'var(--ds-elevation-3)',

    /* ── Perceived depth: elevation derived from the dark canvas luminance
       (top hairline highlight + deeper ambient + glow on 4-5) ── */
    ...buildElevationScale('#0a0a0a'),

    /* ── Alias shortcuts ── */
    '--ds-text-primary': 'var(--ds-color-text-primary)',
    '--ds-text-secondary': 'var(--ds-color-text-secondary)',
    '--ds-bg-primary': 'var(--ds-color-bg-primary)',
    '--ds-bg-secondary': 'var(--ds-color-bg-secondary)',
    '--ds-border-color-default': 'var(--ds-color-border-primary)',
  };
}

/**
 * Build the CSS selector used to scope tenant variables: `html[data-tenant='<slug>']`.
 * This matches the attribute set by TenantProvider on mount.
 */
export function buildTenantSelector(slug: string): string {
  return `html[data-tenant='${slug}']`;
}

/**
 * One internal source of light-block declarations, plus the authority it holds
 * over the compiled BrandTheme map.
 *
 * `compat` layers exist precisely to re-declare compiled values:
 * `resolveTenantVisualConfig` deep-merges the tenant's own `tokenOverrides`
 * and `personality` on top of the compiled ones, so a tenant radius of 18px is
 * MEANT to beat the theme's 10px and a personality card elevation is MEANT to
 * beat the theme's compiled card shadow. An `exclusive` layer holds no such
 * authority: anything it re-declares is a second author.
 */
interface LightMergeLayer {
  name: string;
  declarations: Record<string, string | number | undefined>;
  authority: 'exclusive' | 'compat';
}

/**
 * Fail closed when the light block ends up with two internal authors for one
 * channel, so composition is by construction rather than spread-order luck.
 *
 * Two rules:
 * 1. an `exclusive` layer may never re-declare a compiled channel, even with
 *    an identical value -- an agreeing duplicate is still a second author, and
 *    it stops agreeing the moment either derivation changes;
 * 2. a palette channel has exactly one author whatever the layer's authority.
 *    That family is the OKLCH compiler's, and no compatibility layer has a
 *    mandate to re-derive a ramp.
 *
 * `appearanceVars` is deliberately not a layer here: it is the sanctioned
 * final authority (itself OKLCH-derived and APCA-corrected) and is documented
 * to win over everything below it.
 */
function assertSingleLightEmitter(
  compiledBrandVars: Record<string, string>,
  layers: readonly LightMergeLayer[],
  slug: string,
): void {
  const authors = new Map<string, { layer: string; value: string }>();
  for (const [name, value] of Object.entries(compiledBrandVars)) {
    authors.set(name, { layer: 'compiled-brand-theme', value });
  }

  const conflicts: string[] = [];
  for (const layer of layers) {
    for (const [name, rawValue] of Object.entries(layer.declarations)) {
      if (rawValue === undefined || rawValue === null) continue;
      const value = String(rawValue);
      const prior = authors.get(name);
      if (prior !== undefined) {
        const authorized = layer.authority === 'compat' && !PALETTE_CHANNELS.has(name);
        if (!authorized) {
          conflicts.push(`${name} (${prior.layer}=${prior.value} vs ${layer.name}=${value})`);
        }
      }
      authors.set(name, { layer: layer.name, value });
    }
  }

  if (conflicts.length > 0) {
    throw new Error(
      `Tenant "${slug}" light block has more than one author for ` +
        `${conflicts.length} channel(s): ${conflicts.join(', ')}. ` +
        `Remove the competing emission at its source -- filtering at the merge ` +
        `would keep both authors and only hide which one wins.`,
    );
  }
}

/**
 * The background the APCA pass assumes when a text pairing's whole ground
 * chain is unauthored.
 *
 * A dark-surface BrandTheme declares `darkBackgroundColor` and no
 * `backgroundColor`, so it emits no `--ds-color-bg-*` for its own base block
 * -- reading the default LIGHT ground there would "correct" its near-white ink
 * to near-black. `isDarkSurfacePalette` is the same classification the ramp
 * derivation keys off, so the contrast pass and the ramp agree on which
 * surface the tenant actually has.
 */
function resolveContrastBackgroundMode(config: TenantConfig): TextContrastBackgroundMode {
  const declared = config.appearance?.general?.palette?.backgroundMode;
  if (declared) return declared;
  return isDarkSurfacePalette(config.brandTheme?.palette) ? 'dark' : 'light';
}

/**
 * Run the governed APCA pairings over a block's FINAL declarations.
 *
 * The pass used to see only the appearance slice, so it validated values that
 * were not the ones shipped: a button ink compiled from chrome, or a text
 * color from the BrandTheme, reached the stylesheet unchecked, and an
 * appearance foreground could be checked against a ground that a lower layer
 * then replaced. Running it here -- over exactly the map `toCssBlock`
 * serializes -- makes the value APCA validated and the value emitted the same
 * value, which is what `compileTenantThemeConfig` already does for v1.
 *
 * Scope note: this covers the TEXT_CONTRAST_PAIRINGS semantic pairs (the same
 * guarantee v1 gives). Ramp steps as such are checked by the static path's
 * APCA gate, not here.
 */
function withEnforcedTextContrast(
  declarations: Record<string, string | number | undefined>,
  backgroundMode: TextContrastBackgroundMode,
): Record<string, string | number | undefined> {
  const authored: Record<string, string> = {};
  for (const [name, value] of Object.entries(declarations)) {
    if (value === undefined || value === null) continue;
    authored[name] = String(value);
  }

  // Nothing authored means nothing to verify: an empty tenant must serialize
  // as an empty block, not as a set of autocorrected defaults.
  if (Object.keys(authored).length === 0) return declarations;

  const { variables } = enforceTextContrast(authored, {
    general: { palette: { backgroundMode } },
  });

  // `enforceTextContrast` only rewrites keys it was given, so the spread
  // replaces values in place and the declaration order stays byte-stable.
  return { ...declarations, ...variables };
}

/**
 * Generate a complete CSS stylesheet from an already-resolved tenant visual config.
 *
 * Produces up to three selector blocks:
 * 1. Light theme -- branding + personality + token overrides
 * 2. Dark theme -- explicit `[data-theme='dark']` / `.dark` selectors
 * 3. System dark -- `@media (prefers-color-scheme: dark)` for unset themes
 *
 * This is the COMPATIBILITY path, not the canonical one. A tenant that mounts
 * a compiled v1 artifact never reaches it: `TENANT_THEME_V1_COVERAGE` includes
 * `brand-chrome`, `resolveVisualAuthority` suppresses every covered channel,
 * and the provider skips this generator entirely for a suppressed
 * `brand-chrome`. What reaches it is a DB tenant with a `brandTheme` and no
 * compiled artifact, the brand-studio tenant preview (`buildPreviewCss`), and
 * the build-time `generateTenantCssFile` export.
 *
 * @param resolvedVisualConfig - Output from resolveTenantVisualConfig()
 * @param options - Control dark mode selector generation
 * @returns Raw CSS string ready for injection or file writing
 */
export function generateTenantCssFromResolvedVisualConfig(
  resolvedVisualConfig: ResolvedTenantVisualConfig,
  options: GenerateTenantCssOptions = {}
): string {
  const effectiveConfig = resolvedVisualConfig.config;
  const selector = buildTenantSelector(effectiveConfig.slug);
  const includeDarkSelector = options.includeDarkSelector ?? true;
  const includeSystemDarkSelector = options.includeSystemDarkSelector ?? true;
  const compiledBrandVars = resolvedVisualConfig.compiledBrand?.cssVariables ?? {};

  // Appearance variables from TenantAppearance (General + Advanced tiers).
  // Layered AFTER chrome vars so appearance overrides win when both are
  // present — matching the runtime merge order in ThemeProvider.
  const appearanceVars = effectiveConfig.appearance
    ? compileAppearanceVariables(effectiveConfig.appearance).variables
    : {};

  // Base declarations without chrome (shared across light + dark base).
  // The legacy sRGB scale is handed the compiled channel set so it can stay
  // off the palette channels the OKLCH compiler already authored.
  const brandingDeclarations = brandingVariables(
    effectiveConfig,
    new Set(Object.keys(compiledBrandVars)),
  );
  const tokenOverrideDeclarations = tokenOverrideVariables(effectiveConfig);
  const personalityDeclarations = personalityVariables(effectiveConfig);
  const baseDeclarations = {
    ...brandingDeclarations,
    ...tokenOverrideDeclarations,
    ...personalityDeclarations,
  };

  assertSingleLightEmitter(
    compiledBrandVars,
    [
      { name: 'legacy-branding', declarations: brandingDeclarations, authority: 'exclusive' },
      { name: 'tenant-token-overrides', declarations: tokenOverrideDeclarations, authority: 'compat' },
      { name: 'tenant-personality', declarations: personalityDeclarations, authority: 'compat' },
    ],
    effectiveConfig.slug,
  );

  // Compiled BrandTheme vars include palette, structural, typography, and
  // chrome CSS. Tenant compat fields then override structure/personality, and
  // appearance stays the highest-priority CSS layer. The APCA pass runs last,
  // over the composed map, so it verifies the values this block ships.
  const lightDeclarations = withEnforcedTextContrast(
    { ...compiledBrandVars, ...baseDeclarations, ...appearanceVars },
    resolveContrastBackgroundMode(effectiveConfig),
  );

  // Block 1: light-theme tenant variables (always generated).
  // Scoped to the html element (page-wide) AND directly to the DS-root wrapper
  // (`html[data-tenant] [data-ds-root]`): vertical artifacts declare their own
  // values directly on that wrapper via `:where([data-ds-root][data-vertical])`,
  // and a directly-matched declaration always beats the tenant values the
  // wrapper would otherwise inherit from the html element — silently shadowing
  // DB-appearance typography/surfaces for tenants under a vertical (measured
  // live: a DB tenant's Optima body font lost to the vertical's font pack).
  // The documented merge order puts Appearance above the vertical artifact;
  // the wrapper-scoped selector is what makes the cascade implement it.
  const blocks = [toCssBlock(`${selector}, ${selector} [data-ds-root]`, lightDeclarations)];

  if (includeDarkSelector) {
    // chrome.controls (buttons + full input chrome), chrome.cardComponent, and
    // chrome.modal carry no separate dark variant -- unlike BrandPalette's
    // darkPrimaryColor/darkAccentColor/darkBackgroundColor, a tenant declares these
    // once and they apply under both themes. Scoped to these three sub-objects only
    // (not the rest of BrandChrome) so sidebar/layout/shell/table/tabs positional
    // chrome, pinned dark-block-absent by premium-regression.test.ts, is unaffected.
    // A tenant with no brandTheme (or a brandTheme with none of these three) gets {}
    // here, so darkSemanticVariables' generated defaults below are the only source.
    const darkChromeVars = effectiveConfig.brandTheme?.chrome
      ? brandThemeToChromeVariables({
          ...effectiveConfig.brandTheme,
          chrome: {
            controls: effectiveConfig.brandTheme.chrome.controls,
            cardComponent: effectiveConfig.brandTheme.chrome.cardComponent,
            modal: effectiveConfig.brandTheme.chrome.modal,
          },
        })
      : {};

    // Dark declarations layer: base (brand compat + token overrides + personality),
    // dark-tuned brand scale, generated dark defaults, then the tenant's compiled
    // chrome so a declared value overrides the generated default for that channel,
    // followed by dark-only personality deltas. Appearance vars are included because
    // in the runtime they are set as inline styles on the root element and persist
    // across theme switches.
    // The dark block's ground is always dark by construction
    // (`darkSemanticVariables` authors it), so the APCA pass is told so rather
    // than inferring a light default for any pairing whose chain is unauthored.
    const darkDeclarations = withEnforcedTextContrast(
      {
        ...baseDeclarations,
        ...darkBrandingVariables(effectiveConfig),
        ...darkSemanticVariables(effectiveConfig),
        ...darkChromeVars,
        ...darkPersonalityOverrides(effectiveConfig),
        ...appearanceVars,
      },
      'dark',
    );

    // Block 2: explicit dark mode -- matches `data-theme='dark'` attribute or `.dark` class.
    // The `:is()` variant handles frameworks that set only the attribute without a class.
    blocks.push(
      toCssBlock(
        `${selector}[data-theme='dark'], ${selector}.dark, ${selector}:is([data-theme='dark'])`,
        darkDeclarations
      )
    );

    if (includeSystemDarkSelector) {
      // Block 3: system-preference dark mode for apps that do not explicitly set a theme.
      // The `:not()` guards prevent double-application when an explicit theme is set.
      blocks.push(
        `@media (prefers-color-scheme: dark) {\n${indentBlock(
          toCssBlock(
            `${selector}:not([data-theme]):not(.light):not(.dark)`,
            darkDeclarations
          )
        )}\n}`
      );
    }
  }

  // The header comment interpolates tenant-controlled strings; a name or slug
  // containing `*/` (or a newline) would break out of the comment and inject
  // live CSS into every consumer of the generated stylesheet.
  const commentSafe = (value: string): string =>
    value.replace(/\*\//g, '* /').replace(/[\r\n]+/g, ' ');

  return [
    `/* Auto-generated tenant theme for ${commentSafe(effectiveConfig.name)} (${commentSafe(effectiveConfig.slug)}) */`,
    ...blocks,
    '',
  ].join('\n');
}

/**
 * Generate a complete CSS stylesheet for a tenant config.
 *
 * @param config - Full tenant configuration with branding and personality
 * @param options - Control dark mode selector generation
 * @returns Raw CSS string ready for injection or file writing
 */
export function generateTenantCss(
  config: TenantConfig,
  options: GenerateTenantCssOptions = {}
): string {
  return generateTenantCssFromResolvedVisualConfig(
    resolveTenantVisualConfig(config, {
      includeLegacyProductProfile: true,
    }),
    options,
  );
}

/**
 * Generate a tenant CSS file artifact suitable for build-time pipelines.
 * Returns the conventional path (`<slug>/index.css`) and the CSS content.
 */
export function generateTenantCssFile(
  config: TenantConfig,
  options?: GenerateTenantCssOptions
): { path: string; contents: string } {
  return {
    path: `${config.slug}/index.css`,
    contents: generateTenantCss(config, options),
  };
}
