/**
 * @fileoverview Tenant CSS generator - Rottay Design System
 * @description Generate runtime tenant CSS from `TenantConfig` without requiring
 * prebuilt per-tenant stylesheets.
 *
 * @remarks
 * This module is what makes tenant self-service viable: the app/platform layer
 * can persist tenant branding and personality in data, and the DS can turn that
 * into CSS variables on demand at runtime.
 */

import type { TenantConfig } from '../../../../../contracts';
import type { CompiledBrand } from '../../../../../contracts/themes';
import { compileBrandTheme, brandThemeToBranding, brandThemeToChromeVariables, mergePartialPersonality, deepMergeTokenOverrides } from '../../../../../compilers/brand-theme';
import { isHexColor, normalizeHexColor, hexToRgb, rgbToHex, mixColor, buildRuntimeScale, buildDarkRuntimeScale, getReadableForegroundColor, buildElevationScale } from '../../../../../compilers/_shared/color-math';
import { appearanceToVariables } from '../../../../../compilers/appearance';
import { getVerticalPreset } from '../../../../verticals/registry';
import type { VerticalPreset } from '../../../../verticals/types';
import { getProductProfile } from '../../../../product-profiles/registry';
import { resolvePartialPersonalityCssVariables } from '../../../../personality/primitives';

const COLOR_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] as const;

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
// from compilers/_shared/color-math.ts — single canonical implementation.

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

/** Generate tenant branding variables for the default light theme. */
function brandingVariables(config: TenantConfig): Record<string, string | number | undefined> {
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
    declarations[`--ds-color-${tokenName}`] = scale[500];
    COLOR_STEPS.forEach((step) => {
      declarations[`--ds-color-${tokenName}-${step}`] = scale[step];
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

/** Generate tenant branding variables for dark-theme selectors. */
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
 * Generate a complete CSS stylesheet from an already-resolved tenant visual config.
 *
 * Produces up to three selector blocks:
 * 1. Light theme -- branding + personality + token overrides
 * 2. Dark theme -- explicit `[data-theme='dark']` / `.dark` selectors
 * 3. System dark -- `@media (prefers-color-scheme: dark)` for unset themes
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
    ? appearanceToVariables(effectiveConfig.appearance)
    : {};

  // Base declarations without chrome (shared across light + dark base)
  const baseDeclarations = {
    ...brandingVariables(effectiveConfig),
    ...tokenOverrideVariables(effectiveConfig),
    ...personalityVariables(effectiveConfig),
  };

  // Compiled BrandTheme vars include palette, structural, typography, and
  // chrome CSS. Tenant compat fields then override palette/structure, and
  // appearance stays the highest-priority CSS layer.
  const lightDeclarations = { ...compiledBrandVars, ...baseDeclarations, ...appearanceVars };

  // Block 1: light-theme tenant variables (always generated)
  const blocks = [toCssBlock(selector, lightDeclarations)];

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
    const darkDeclarations = {
      ...baseDeclarations,
      ...darkBrandingVariables(effectiveConfig),
      ...darkSemanticVariables(effectiveConfig),
      ...darkChromeVars,
      ...darkPersonalityOverrides(effectiveConfig),
      ...appearanceVars,
    };

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

  return [
    `/* Auto-generated tenant theme for ${effectiveConfig.name} (${effectiveConfig.slug}) */`,
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

/** Marker written at the top of every generated vertical artifact. */
export const GENERATED_ARTIFACT_BANNER = 'GENERATED — do not edit';

/** Command shown in generated headers and used by the artifact guard. */
export const FIRST_PARTY_ARTIFACT_REGENERATE_COMMAND =
  'pnpm -C ui-design-system/packages/core build:vertical-css';

/** Static description of a first-party vertical artifact this generator owns. */
export interface FirstPartyArtifactSpec {
  /** Tenant slug, e.g. `'bithire'`. */
  slug: string;
  /** Human-facing product name for the header banner. */
  displayName: string;
  /** Selector the compiled variable block is scoped to. */
  selector: string;
  /**
   * Path to the authored theme, relative to `packages/core/src`.
   *
   * Named rather than derived from the slug: a tenant lives inside the folder of
   * the vertical that owns it, so `bithire` and `themanagementmiami` share a
   * directory and `rottay` sits under `platform`. A slug cannot tell you that.
   */
  authoredThemePath: string;
}

/**
 * First-party vertical artifacts regenerated by `build:vertical-artifacts`.
 *
 * The build script, parity gate, and guard gate all read this single list so
 * they cannot drift apart. `themanagementmiami` is a real customer tenant of
 * the bithire vertical and is deliberately excluded — it compiles at render
 * time through the dynamic path and has no precompiled artifact. The hostile-
 * tenant torture brand-theme fixtures must never be registered here.
 */
export const FIRST_PARTY_ARTIFACT_SPECS: readonly FirstPartyArtifactSpec[] = [
  {
    slug: 'bithire',
    displayName: 'BitHire',
    authoredThemePath: 'tokens/ts/brand-themes/bithire/bithire.ts',
    // Compiler-native tenant selector. Dark-mode overrides in the extension use
    // the higher-specificity `.dark` / `[data-theme='dark']` selectors and win.
    selector: "html[data-tenant='bithire']",
  },
  {
    slug: 'evnto',
    displayName: 'Evnto',
    authoredThemePath: 'tokens/ts/brand-themes/evnto/evnto.ts',
    // Light-first, same shape as bithire: dark-mode overrides in the extension
    // use the higher-specificity `.dark` / `[data-theme='dark']` selectors.
    selector: "html[data-tenant='evnto']",
  },
  {
    slug: 'rottay',
    displayName: 'Rottay',
    authoredThemePath: 'tokens/ts/brand-themes/platform/rottay.ts',
    // Rottay is dark-first: the tenant's unscoped default rendering is dark.
    // rottayBrandTheme.chrome (sidebar/layout/table/controls) is single-valued
    // and dark-authored, so compileBrandTheme cannot also produce a light
    // variant of it -- the compiled block is scoped to the explicit light
    // override instead, where its palette output applies; chrome for this
    // selector stays declared extension for the same single-value reason.
    // See roadmap/tokens.md WO-TOK-01 for the full rationale.
    selector: "html[data-tenant='rottay'][data-theme='light'], html[data-tenant='rottay'].light",
  },
];

/**
 * Inputs for {@link renderVerticalArtifact}.
 *
 * A first-party vertical artifact (`tokens/css/artifacts/<slug>/index.css`) is a
 * build output assembled from two authored sources: the compiled `BrandTheme`
 * (via {@link compileBrandTheme}) and a declared extension file that carries the
 * hand-authored CSS the brand compiler cannot express (the oklch DaisyUI bridge,
 * color scales, semantic bg/text/border sets, dark-mode blocks, and component
 * rules). Keeping the extension a separate source — instead of hand-editing the
 * artifact — is what lets the parity/guard gates enforce "all changes flow
 * through the generator".
 */
export interface RenderVerticalArtifactInput {
  /** Tenant slug, e.g. `'bithire'`. */
  tenantSlug: string;
  /** Path to the authored theme, relative to `packages/core/src`. */
  authoredThemePath: string;
  /** Human-facing product name for the header banner. */
  displayName: string;
  /** Selector the compiled variable block is scoped to. */
  selector: string;
  /** Flat CSS variable map from `compileBrandTheme(...).cssVariables`. */
  compiledCssVariables: Record<string, string>;
  /** Authored, generator-preserved CSS appended verbatim after the compiled block. */
  extensionCss: string;
  /** Command a developer runs to regenerate the artifact (shown in the header). */
  regenerateCommand: string;
}

/**
 * Render a first-party vertical CSS artifact as a deterministic build output.
 *
 * Output layout: a `GENERATED` header, the compiled `BrandTheme` variables
 * (keys sorted so regeneration is byte-stable) scoped to `selector`, then the
 * declared extension verbatim. The compiled block is the sole definer of every
 * compiler-owned variable; the extension must not redeclare those keys.
 */
export function renderVerticalArtifact(input: RenderVerticalArtifactInput): string {
  const { tenantSlug, authoredThemePath, displayName, selector, compiledCssVariables, extensionCss, regenerateCommand } = input;

  const header = [
    `/* ${GENERATED_ARTIFACT_BANNER} */`,
    '/*',
    ` * ${displayName} tenant theme.`,
    ' *',
    ' * This file is a BUILD OUTPUT assembled from two authored sources; any manual',
    ' * edit is reverted by the DS artifact parity/guard gates:',
    ` *   1. ${authoredThemePath} (compiled via compileBrandTheme)`,
    ` *   2. tokens/css/artifacts/${tenantSlug}/_source/extension.css (declared extension)`,
    ' *',
    ` * Regenerate: ${regenerateCommand}`,
    ' */',
  ].join('\n');

  const compiledDecls = Object.keys(compiledCssVariables)
    .sort()
    .map((key) => `  ${key}: ${compiledCssVariables[key]};`)
    .join('\n');
  const compiledBlock = [
    '/* === Compiled from BrandTheme via compileBrandTheme — do not edit === */',
    `${selector} {`,
    compiledDecls,
    '}',
  ].join('\n');

  const extensionSection = [
    '/* === Declared artifact extension (authored source, generator-preserved) === */',
    extensionCss.replace(/^\s+/, '').replace(/\s+$/, ''),
  ].join('\n');

  return `${header}\n\n${compiledBlock}\n\n${extensionSection}\n`;
}
