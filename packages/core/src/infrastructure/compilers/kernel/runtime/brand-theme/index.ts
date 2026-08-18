/**
 * @fileoverview Brand compiler — bridge utilities + compilation.
 *
 * Converts a BrandTheme into the shapes consumed by the runtime
 * (useTokens, ThemeProvider) and by static CSS generation.
 *
 * Bridge functions: brandThemeToTokenOverrides, brandThemeToPersonality,
 * deepMergeTokenOverrides.
 *
 * Compiler: compileBrandTheme — conforms to the CompileBrandTheme contract
 * from contracts/themes. Produces personality, tokenOverrides, CSS variables,
 * and a CSS string from a BrandTheme + vertical baseline.
 */

import {
  assertMandatoryFontFallback,
  withArabicSafeFallback,
} from "@/foundation/kernel/typography";
import {
  TENANT_THEME_RHYTHM_FACTORS,
  TENANT_THEME_RHYTHM_SCALE_BOUNDS,
} from "@/foundation/contracts/composition/tenants/themes/tenant-theme";
import type {
  BrandTheme,
  BrandPalette,
  BrandPaletteAliases,
  BrandThemeMode,
  BrandThemeModeOverlay,
  CompileBrandTheme,
  CompiledBrand,
  CompiledBrandModeBlock,
  BrandCompilerInput,
} from "@/foundation/contracts/composition/tenants/themes";
import type {
  Theme,
  TenantAuthoredPaths,
} from "@/foundation/contracts/composition/tenants/themes/iso";
import {
  completeChromeShape,
  isTenantAuthoredField,
  themeToBrandTheme,
} from "@/foundation/contracts/composition/tenants/themes/iso";
import type { EngineName } from "@/foundation/contracts/runtime/engine";
import { validateRecipeProfileSelection } from "@/foundation/tokens/ts/presentation/recipe-profiles";
import {
  resolveExpressiveAxes,
  sanitizeExpressiveOverrides,
  validateExperienceProfileSelection,
} from "@/foundation/tokens/ts/presentation/expressive-profiles";
import {
  expandExpressiveProfiles,
  expressiveTypeRoleOverlay,
} from "@/foundation/tokens/ts/presentation/expressive-profiles/expansion";
import type { ExpressiveTypeRoleOverlay } from "@/foundation/tokens/ts/presentation/expressive-profiles/expansion";
import { appearancePostureToVariables } from "../../foundation/css/appearance-posture";
import type { TenantTokenOverrides } from "@/foundation/contracts/composition/tenants";
import type {
  PartialPersonalityTokens,
  PersonalityTokens,
} from "@/foundation/contracts/kernel/tokens/personality";
import {
  SEMANTIC_SURFACE_ROLES,
  type SemanticSurfaceRoleMap,
} from "@/foundation/contracts/kernel/tokens/materials";
import {
  SEMANTIC_TYPOGRAPHY_ROLES,
  type SemanticTypographyRoleTokens,
  type SemanticTypographyTokens,
} from "@/foundation/contracts/kernel/tokens/typography";
import {
  RAMP_STEPS,
  deriveOklchRamp,
  type RampSurface,
} from "@/foundation/kernel/color/oklch/ramp";
import { deriveChartSeriesPalette } from "@/foundation/kernel/color/oklch/chart-series";
import {
  PRODUCER_RANK,
  SIDEBAR_TONE_LEAF_FIELDS,
  chromeToVariables,
} from "../../foundation/css/chrome-variables";
import {
  derivePaletteSemantics,
  derivePrimarySemantics,
} from "../../foundation/css/color-math/palette-derivations";
import { isHexColor } from "../../foundation/css/color-math";
import { deriveInteractionFloor } from "../../foundation/css/color-math/interaction-floor";
import {
  ON_TONE_ROLES,
  deriveReadableInk,
  onToneChannel,
} from "../../foundation/css/color-math/readable-ink";
import {
  springLinearEasing,
  springLinearEasingGentle,
} from "../../foundation/motion/spring-easing";

/**
 * A BrandTheme opts into generated spring physics only when it declares BOTH
 * tension and friction and does not explicitly disable spring (`useSpring:
 * false`, e.g. bithire's calm operational motion law). Absent `useSpring` defaults
 * to enabled, matching every first-party theme that sets tension/friction.
 */
function isSpringEligible(bt: BrandTheme): boolean {
  const motion = bt.motion;
  return (
    !!motion &&
    typeof motion.springTension === "number" &&
    typeof motion.springFriction === "number" &&
    motion.useSpring !== false
  );
}

/**
 * Extract structural token overrides from a BrandTheme.
 *
 * Maps BrandTheme.surfaces to TenantTokenOverrides so the existing
 * structural merge chain can consume it without changes. When the theme is
 * spring-eligible, also derives `motion.spring` (a generated `linear()`
 * curve) so it rides the SAME `TenantTokenOverrides.motion.spring` field
 * `useTokens` resolves into `--ds-motion-spring` -- this is the only path
 * that reaches the compiled artifact without a theme manually authoring a
 * literal override.
 */
export function brandThemeToTokenOverrides(
  bt: BrandTheme
): Partial<TenantTokenOverrides> {
  const overrides: Partial<TenantTokenOverrides> = {};
  if (bt.surfaces) {
    overrides.surface = bt.surfaces.surface;
    overrides.borderRadius = bt.surfaces.borderRadius;
    overrides.shadows = bt.surfaces.shadows;
    overrides.glass = bt.surfaces.glass;
    overrides.gradients = bt.surfaces.gradients;
    overrides.overlays = bt.surfaces.overlays;
    overrides.densityScale = bt.surfaces.densityScale;
  }
  if (isSpringEligible(bt)) {
    overrides.motion = {
      spring: springLinearEasing(
        bt.motion!.springTension!,
        bt.motion!.springFriction!
      ),
    };
  }
  return overrides;
}

/**
 * Extract personality tokens from a BrandTheme.
 *
 * Maps BrandTheme.motion/charts/chrome/typography to the PersonalityTokens
 * shape that the existing personality merge chain consumes.
 */
export function brandThemeToPersonality(
  bt: BrandTheme
): Partial<PersonalityTokens> {
  const result: Partial<PersonalityTokens> = {};
  const expressiveMotion = expandExpressiveProfiles(
    resolveExpressiveAxes(
      bt.expressive?.experienceProfile,
      sanitizeExpressiveOverrides(bt.expressive?.profiles),
      bt.expressive?.schemaVersion
    )
  ).fieldDefaults.motion;

  if (bt.motion || expressiveMotion) {
    result.animation = {
      intensity: bt.motion?.intensity ?? expressiveMotion?.intensity,
      entrance: bt.motion?.entrance,
      entranceDuration: bt.motion?.entranceDuration,
      hoverLift: bt.motion?.hoverLift,
      hoverScale: bt.motion?.hoverScale,
      useSpring: bt.motion?.useSpring,
      springTension: bt.motion?.springTension,
      springFriction: bt.motion?.springFriction,
      pulseSpeed: bt.motion?.pulseSpeed,
      skeletonStyle: bt.motion?.skeletonStyle,
      staggerDelay: bt.motion?.staggerDelay,
      staggerMax: bt.motion?.staggerMax,
      countUpEnabled: bt.motion?.countUpEnabled,
    } as PersonalityTokens["animation"];
  }

  if (bt.charts) {
    result.chart = bt.charts as PersonalityTokens["chart"];
  }

  if (bt.typography) {
    result.typography = {
      headingWeightBias: bt.typography.headingWeightBias,
      headingLetterSpacing: bt.typography.headingLetterSpacing,
      labelStyle: bt.typography.labelStyle,
    } as PersonalityTokens["typography"];
  }

  if (bt.chrome?.accent) {
    result.accent = bt.chrome.accent as PersonalityTokens["accent"];
  }

  if (bt.chrome?.card) {
    result.card = bt.chrome.card as PersonalityTokens["card"];
  }

  return result;
}

/**
 * Deep-merge two TenantTokenOverrides objects.
 *
 * Nested objects (glass, gradients, overlays, surface, motion, borderRadius,
 * shadows) are merged per-key so a tenant override for one glass property
 * does not wipe out the entire glass namespace from brandTheme.
 */
export function deepMergeTokenOverrides(
  base: Partial<TenantTokenOverrides>,
  override: Partial<TenantTokenOverrides> | undefined
): Partial<TenantTokenOverrides> {
  if (!override) return base;
  return {
    surface: override.surface
      ? { ...base.surface, ...override.surface }
      : base.surface,
    motion: override.motion
      ? { ...base.motion, ...override.motion }
      : base.motion,
    borderRadius: override.borderRadius
      ? { ...base.borderRadius, ...override.borderRadius }
      : base.borderRadius,
    shadows: override.shadows
      ? { ...base.shadows, ...override.shadows }
      : base.shadows,
    densityScale: override.densityScale ?? base.densityScale,
    glass: override.glass ? { ...base.glass, ...override.glass } : base.glass,
    gradients: override.gradients
      ? { ...base.gradients, ...override.gradients }
      : base.gradients,
    overlays: override.overlays
      ? { ...base.overlays, ...override.overlays }
      : base.overlays,
  };
}

// ── Helpers for compileBrandTheme ──────────────────────────

/** Merge two partial PersonalityTokens (per-dimension spread). */
export function mergePartialPersonality(
  base: PartialPersonalityTokens | undefined,
  override: PartialPersonalityTokens
): PartialPersonalityTokens {
  if (!base) return override;
  return {
    animation: override.animation
      ? { ...base.animation, ...override.animation }
      : base.animation,
    chart: override.chart ? { ...base.chart, ...override.chart } : base.chart,
    typography: override.typography
      ? { ...base.typography, ...override.typography }
      : base.typography,
    accent: override.accent
      ? { ...base.accent, ...override.accent }
      : base.accent,
    card: override.card ? { ...base.card, ...override.card } : base.card,
  };
}

// ── Perceptual color ramp derivation (WO-TOK-02) ───────────

/** The DS foundation's light canvas -- the ground a light-surface theme
 * falls back to when it does not declare its own `backgroundColor`. */
const LIGHT_DEFAULT_GROUND = "#FFFFFF";

/** The DS foundation's dark canvas -- the ground a dark-surface theme falls
 * back to when it does not declare its own `backgroundColor`. */
const DARK_DEFAULT_GROUND = "#0A0A0A";

/**
 * A theme is dark-surface when it DECLARES so: `appearance.defaultMode`.
 *
 * The classification used to be inferred from the shape of the palette --
 * "declares `darkBackgroundColor` and no `backgroundColor`". That inference
 * existed only because a dark theme had nowhere to say what it was: its own
 * ground had to be smuggled through a `dark`-prefixed field while the plain
 * field stayed empty, and every reader had to reconstruct the intent.
 *
 * A theme now writes its default mode down and puts that mode's values in the
 * PLAIN channels; the other mode, when it has one, is a `modes` overlay. So
 * the declaration is the classification, and a theme's ground is
 * `palette.backgroundColor` in every mode including its own dark one.
 */
export function isDarkSurfaceTheme(bt: BrandTheme | undefined): boolean {
  return bt?.appearance?.defaultMode === "dark";
}

/** The surface a theme's base block compiles for. */
export function brandThemeRampSurface(bt: BrandTheme | undefined): RampSurface {
  return isDarkSurfaceTheme(bt) ? "dark" : "light";
}

interface RampRoleSpec {
  name: string;
  seed: string | undefined;
}

/**
 * The 7 palette roles a ramp can be derived for.
 *
 * One seed per role, whatever the surface. A mode overlay that wants a
 * different seed restates `primaryColor` in `modes.{mode}.palette`, which
 * re-enters this same derivation against that mode's own ground -- so the
 * other mode is a real compiled block rather than a parallel channel family
 * nothing consumes.
 */
function rampRoleSpecs(palette: BrandPalette): readonly RampRoleSpec[] {
  return [
    { name: "primary", seed: palette.primaryColor },
    { name: "secondary", seed: palette.secondaryColor },
    { name: "accent", seed: palette.accentColor },
    { name: "success", seed: palette.successColor },
    { name: "warning", seed: palette.warningColor },
    { name: "error", seed: palette.errorColor },
    { name: "info", seed: palette.infoColor },
  ];
}

/**
 * Derive the perceptually-even `--ds-color-{role}-{50..900}` ramp for every
 * palette role that declares a seed, keyed to the surface being compiled: any
 * seed color mechanically yields a full, even, gamut-mapped palette -- no
 * per-tenant design work. See `deriveOklchRamp` for the derivation itself
 * (OKLCH lightness/chroma interpolation, hue held constant, gamut mapped per
 * step).
 *
 * `surface` is the mode this palette is being compiled FOR, passed by the
 * caller that knows it. One call derives one ramp; a second mode is a second
 * call with that mode's merged palette, not a second channel family.
 */
export function deriveTenantColorRamps(
  palette: BrandPalette | undefined,
  surface: RampSurface = "light"
): Record<string, string> {
  if (!palette) return {};
  const ground =
    palette.backgroundColor ??
    (surface === "dark" ? DARK_DEFAULT_GROUND : LIGHT_DEFAULT_GROUND);

  const vars: Record<string, string> = {};
  for (const role of rampRoleSpecs(palette)) {
    if (!role.seed) continue;
    const ramp = deriveOklchRamp(role.seed, ground, surface);
    for (const step of RAMP_STEPS) {
      vars[`--ds-color-${role.name}-${step}`] = ramp[step];
    }
  }
  // Authored steps win over derived ones. A role that is authored-only
  // (`neutral` has no seed to derive from) emits nothing until authored, so an
  // absent override never claims a channel.
  for (const [role, ramp] of Object.entries(palette.ramps ?? {})) {
    for (const [step, value] of Object.entries(ramp ?? {})) {
      if (value) vars[`--ds-color-${role}-${step}`] = value;
    }
  }
  return vars;
}

/**
 * Convert a semantic surface-role map to a flat CSS variable map.
 *
 * Emits the channels of the mode being compiled. A theme's other mode is a
 * `modes` overlay that re-enters the same family compilers with its own
 * merged values, so there is exactly one channel family per role and no
 * `dark`-prefixed twin for anything to consume.
 */
export function semanticSurfaceRolesToCssVariables(
  surfaceRoles: SemanticSurfaceRoleMap | undefined
): Record<string, string> {
  if (!surfaceRoles) return {};

  const vars: Record<string, string> = {};
  for (const role of SEMANTIC_SURFACE_ROLES) {
    const surfaceRoleTokens = surfaceRoles[role];
    if (!surfaceRoleTokens) continue;

    const prefix = `--ds-material-${role}`;
    if (surfaceRoleTokens.background) {
      vars[`--ds-surface-${role}`] = surfaceRoleTokens.background;
      // The semantic surface is the single paint authority. Legacy-prefixed
      // compatibility channels remain aliases so a later DB TenantTheme
      // override cannot be masked by a static vertical literal.
      vars[`${prefix}-background`] = `var(--ds-surface-${role})`;
    }
    if (surfaceRoleTokens.backgroundHover)
      vars[`${prefix}-background-hover`] = surfaceRoleTokens.backgroundHover;
    if (surfaceRoleTokens.backgroundActive)
      vars[`${prefix}-background-active`] = surfaceRoleTokens.backgroundActive;
    if (surfaceRoleTokens.backgroundSelected)
      vars[`${prefix}-background-selected`] =
        surfaceRoleTokens.backgroundSelected;
    if (surfaceRoleTokens.backgroundDisabled)
      vars[`${prefix}-background-disabled`] =
        surfaceRoleTokens.backgroundDisabled;
    if (surfaceRoleTokens.foreground)
      vars[`${prefix}-foreground`] = surfaceRoleTokens.foreground;
    if (surfaceRoleTokens.foregroundMuted)
      vars[`${prefix}-foreground-muted`] = surfaceRoleTokens.foregroundMuted;
    if (surfaceRoleTokens.foregroundDisabled)
      vars[`${prefix}-foreground-disabled`] =
        surfaceRoleTokens.foregroundDisabled;
    if (surfaceRoleTokens.border)
      vars[`${prefix}-border`] = surfaceRoleTokens.border;
    if (surfaceRoleTokens.borderStrong)
      vars[`${prefix}-border-strong`] = surfaceRoleTokens.borderStrong;
    if (surfaceRoleTokens.borderHover)
      vars[`${prefix}-border-hover`] = surfaceRoleTokens.borderHover;
    if (surfaceRoleTokens.borderActive)
      vars[`${prefix}-border-active`] = surfaceRoleTokens.borderActive;
    if (surfaceRoleTokens.borderSelected)
      vars[`${prefix}-border-selected`] = surfaceRoleTokens.borderSelected;
    if (surfaceRoleTokens.borderDisabled)
      vars[`${prefix}-border-disabled`] = surfaceRoleTokens.borderDisabled;
    if (surfaceRoleTokens.focusRing)
      vars[`${prefix}-focus-ring`] = surfaceRoleTokens.focusRing;
    if (surfaceRoleTokens.shadow)
      vars[`${prefix}-shadow`] = surfaceRoleTokens.shadow;
    if (surfaceRoleTokens.shadowHover)
      vars[`${prefix}-shadow-hover`] = surfaceRoleTokens.shadowHover;
    if (surfaceRoleTokens.shadowActive)
      vars[`${prefix}-shadow-active`] = surfaceRoleTokens.shadowActive;
    if (surfaceRoleTokens.shadowSelected)
      vars[`${prefix}-shadow-selected`] = surfaceRoleTokens.shadowSelected;
    if (surfaceRoleTokens.highlight)
      vars[`${prefix}-highlight`] = surfaceRoleTokens.highlight;
    if (surfaceRoleTokens.texture)
      vars[`${prefix}-texture`] = surfaceRoleTokens.texture;
  }

  const card = surfaceRoles.card;
  if (card?.background) vars["--ds-surface-card-bg"] = "var(--ds-surface-card)";
  if (card?.border)
    vars["--ds-surface-card-border"] = "var(--ds-material-card-border)";
  if (card?.borderStrong)
    vars["--ds-surface-card-border-strong"] =
      "var(--ds-material-card-border-strong)";
  if (card?.shadow)
    vars["--ds-surface-card-shadow"] = "var(--ds-material-card-shadow)";
  if (card?.shadowHover)
    vars["--ds-surface-card-shadow-hover"] =
      "var(--ds-material-card-shadow-hover)";

  const panel = surfaceRoles.panel;
  if (panel?.background)
    vars["--ds-surface-panel-bg"] = "var(--ds-surface-panel)";
  const control = surfaceRoles.control;
  if (control?.background)
    vars["--ds-surface-control-bg"] = "var(--ds-surface-control)";

  /**
   * `raised` gets no `-bg` alias. Its three siblings above alias inside
   * `--ds-surface-*`; raised aliased into `--ds-color-*`, so a name in the
   * colour family resolved to a surface role that a tenant may author as a
   * gradient — bithire does. Its thirteen real consumers already read
   * `--ds-surface-raised` directly, so the alias had one reader and no job.
   */

  return vars;
}

/**
 * @deprecated Use `semanticSurfaceRolesToCssVariables`.
 * Kept for one compatibility cycle; this does not represent Material UI.
 */
export const semanticMaterialsToCssVariables =
  semanticSurfaceRolesToCssVariables;

/**
 * The palette channels beyond the seeds: the second and third steps of every
 * semantic family a product actually paints with.
 *
 * These are DS-owned channels with real consumers (`--ds-color-bg-elevated`
 * alone is read in ~295 places). Before they were contract fields the only way
 * for a vertical to set them was a hand-written root block in its artifact
 * extension, which is how a static vertical ended up with a second theme
 * author. One field reaches exactly one channel, so a value that ships today
 * moves into the contract without changing.
 *
 * Spelled as a static `field -> --ds-*` record so the channel-parity graph can
 * read every edge from source. Encoded as tuples or computed keys these 31
 * emissions are invisible to it and each one reappears as a phantom
 * declared-but-unemitted finding.
 */
const EXTENDED_PALETTE_CHANNELS = {
  primaryHoverColor: "--ds-color-primary-hover",
  secondaryHoverColor: "--ds-color-secondary-hover",
  accentHoverColor: "--ds-color-accent-hover",
  onPrimaryColor: "--ds-color-text-on-primary",
  primaryForegroundColor: "--ds-color-primary-foreground",
  textTertiaryColor: "--ds-color-text-tertiary",
  borderColor: "--ds-color-border",
  borderTertiaryColor: "--ds-color-border-tertiary",
  borderSubtleColor: "--ds-color-border-subtle",
  borderFocusColor: "--ds-color-border-focus",
  backgroundSecondaryColor: "--ds-color-bg-secondary",
  backgroundTertiaryColor: "--ds-color-bg-tertiary",
  backgroundElevatedColor: "--ds-color-bg-elevated",
  backgroundSurfaceColor: "--ds-color-bg-surface",
  backgroundOverlayColor: "--ds-color-bg-overlay",
  successBgColor: "--ds-color-success-bg",
  successBorderColor: "--ds-color-success-border",
  warningBgColor: "--ds-color-warning-bg",
  warningBorderColor: "--ds-color-warning-border",
  errorBgColor: "--ds-color-error-bg",
  errorBorderColor: "--ds-color-error-border",
  infoBgColor: "--ds-color-info-bg",
  infoBorderColor: "--ds-color-info-border",
  infoInkColor: "--ds-color-info-ink",
  linkColor: "--ds-color-link",
  linkHoverColor: "--ds-color-link-hover",
  linkVisitedColor: "--ds-color-link-visited",
  interactiveBorderColor: "--ds-color-interactive-border",
  interactiveBgHoverColor: "--ds-color-interactive-bg-hover",
  interactiveBgActiveColor: "--ds-color-interactive-bg-active",
  interactiveBgMutedColor: "--ds-color-interactive-bg-muted",
  alphaBlack50: "--ds-color-alpha-black-50",
  alphaBlack100: "--ds-color-alpha-black-100",
  alphaWhite50: "--ds-color-alpha-white-50",
  alphaPrimary10: "--ds-color-alpha-primary-10",
  alphaPrimary20: "--ds-color-alpha-primary-20",
  alphaSecondary10: "--ds-color-alpha-secondary-10",
  alphaSecondary20: "--ds-color-alpha-secondary-20",
  alphaSuccess10: "--ds-color-alpha-success-10",
  alphaSuccess20: "--ds-color-alpha-success-20",
  alphaWarning10: "--ds-color-alpha-warning-10",
  alphaWarning20: "--ds-color-alpha-warning-20",
  alphaError10: "--ds-color-alpha-error-10",
  alphaError20: "--ds-color-alpha-error-20",
  alphaInfo10: "--ds-color-alpha-info-10",
  bgHoverColor: "--ds-color-bg-hover",
  bgInfoColor: "--ds-color-bg-info",
  bgSubtleColor: "--ds-color-bg-subtle",
  neutralZeroColor: "--ds-color-neutral-0",
  primarySubtleColor: "--ds-color-primary-subtle",
  shadowColor: "--ds-color-shadow",
  surfaceColor: "--ds-color-surface",
  surfaceMutedColor: "--ds-color-surface-muted",
  surfaceSecondaryColor: "--ds-color-surface-secondary",
  textColor: "--ds-color-text",
  textInverseColor: "--ds-color-text-inverse",
} as const satisfies Readonly<Partial<Record<keyof BrandPalette, string>>>;

/**
 * The unprefixed alias namespace. Same shape as the record above, keyed on
 * `BrandPalette.aliases` instead of the palette root, and exhaustive over that
 * type so a new alias leaf fails type review until it has a destination.
 */
const PALETTE_ALIAS_CHANNELS = {
  textPrimary: "--ds-text-primary",
  textSecondary: "--ds-text-secondary",
  textTertiary: "--ds-text-tertiary",
  textDisabled: "--ds-text-disabled",
  textInverse: "--ds-text-inverse",
  borderColor: "--ds-border-color",
  borderColorDefault: "--ds-border-color-default",
  borderColorMuted: "--ds-border-color-muted",
  borderColorStrong: "--ds-border-color-strong",
  borderColorHover: "--ds-border-color-hover",
  borderColorFocus: "--ds-border-color-focus",
} as const satisfies Readonly<Record<keyof BrandPaletteAliases, string>>;

/**
 * Derive `--ds-color-{primary,secondary}-rgb` from the resolved seed.
 *
 * The channel is a comma-separated sRGB triplet, which is what a `rgb(var(...)
 * / <alpha>)` reader needs and what a hex seed cannot supply directly. It is
 * DERIVED, never authored: a theme that could write the triplet by hand could
 * write one that disagrees with its own seed, which is a second color
 * authority. A non-hex seed (a `var()` forward, a color function) has no
 * verified triplet, so the channel is omitted and the reader keeps its floor.
 */
function seedRgbTriplet(seed: string | undefined): string | undefined {
  if (typeof seed !== "string") return undefined;
  const hex = seed.trim();
  const match = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex);
  if (!match) return undefined;
  const digits = match[1];
  const full =
    digits.length === 3
      ? digits
          .split("")
          .map((d) => d + d)
          .join("")
      : digits;
  const r = Number.parseInt(full.slice(0, 2), 16);
  const g = Number.parseInt(full.slice(2, 4), 16);
  const b = Number.parseInt(full.slice(4, 6), 16);
  return `${r}, ${g}, ${b}`;
}

function setSeedRgbVariables(
  vars: Record<string, string>,
  palette: BrandPalette
): void {
  const primary = seedRgbTriplet(palette.primaryColor);
  if (primary) vars["--ds-color-primary-rgb"] = primary;
  const secondary = seedRgbTriplet(palette.secondaryColor);
  if (secondary) vars["--ds-color-secondary-rgb"] = secondary;
}

function setExtendedPaletteVariables(
  vars: Record<string, string>,
  palette: BrandPalette
): void {
  for (const [field, variable] of Object.entries(
    EXTENDED_PALETTE_CHANNELS
  ) as ReadonlyArray<readonly [keyof BrandPalette, string]>) {
    const value = palette[field];
    if (typeof value === "string" && value) vars[variable] = value;
  }
  const aliases = palette.aliases;
  if (aliases) {
    for (const [field, variable] of Object.entries(
      PALETTE_ALIAS_CHANNELS
    ) as ReadonlyArray<readonly [keyof BrandPaletteAliases, string]>) {
      const value = aliases[field];
      if (typeof value === "string" && value) vars[variable] = value;
    }
  }
  setSeedRgbVariables(vars, palette);
}

/**
 * The FLOOR for four `EXTENDED_PALETTE_CHANNELS` entries a theme may author
 * but never must: `--ds-color-primary-foreground`, `--ds-color-border-focus`,
 * `--ds-color-link`, `--ds-color-link-hover`.
 *
 * The math itself is `deriveInteractionFloor` in
 * `color-math/interaction-floor` -- shared verbatim with the DB
 * `compileTenantThemeConfig` path, so the two ingress paths cannot answer
 * "what does this seed imply" differently. This wrapper exists only to keep
 * the static path's own call site named after the channel group it feeds.
 *
 * Merged BEFORE `setExtendedPaletteVariables`, whose unconditional "write
 * when the string is present" then overwrites exactly the keys the theme
 * supplies -- derivation is the floor, authored is the ceiling, and it is
 * never the other way around. Precedence is per channel: authoring the link
 * color leaves the derived foreground, focus border and link hover in place.
 */
export function deriveExtendedPaletteFloor(
  effectivePrimary: string | undefined
): Record<string, string> {
  return deriveInteractionFloor(effectivePrimary).variables;
}

/**
 * Drop own-enumerable keys whose value is `undefined` before a spread.
 *
 * The ISO bridge materializes COMPLETE containers, so a resolved `Theme` lowered
 * back through `themeToBrandTheme` carries role keys that are present with the
 * value `undefined`. A plain spread copies those keys and stomps the layer below
 * it — the engine defaults inside the role emitter, and the authored label case
 * in its caller — after which `String(undefined)` ships the literal text
 * "undefined" as a CSS value. Compacting the spread SOURCE (never the guards,
 * never the precedence order) is what makes the two lowerings agree: an authored
 * value still wins, and a key that carries no value simply does not participate.
 */
function omitUndefined<T extends object>(source: T | undefined): Partial<T> {
  if (source === undefined) return {};
  const compacted: Partial<T> = {};
  for (const key of Object.keys(source) as Array<keyof T>) {
    const value = source[key];
    if (value !== undefined) compacted[key] = value;
  }
  return compacted;
}

/**
 * Compile one BrandTheme block.
 *
 * `surface` is the mode the block is FOR. It defaults to the theme's declared
 * default mode, and `compileModeBlocks` passes the overlay's own mode when it
 * re-enters with a merged theme — so a light overlay on a dark-default theme
 * derives its ramp against a light surface rather than inheriting the base
 * theme's. All three first-party verticals pin every derivable role in their
 * overlays today, so threading it is zero-delta on the committed artifacts and
 * only decides what an UNPINNED overlay role derives to.
 */
function brandThemeToCssVariables(
  bt: BrandTheme,
  surface: RampSurface = brandThemeRampSurface(bt)
): Record<string, string> {
  // C1b expressive expansion — resolved HERE (not in compileBrandTheme) so
  // compileModeBlocks, which re-invokes this function per authored mode
  // overlay, re-expands automatically and every mode block sees the same
  // profile layer. Fail-closed: an invalid selection expands to nothing.
  const expressiveAxes = resolveExpressiveAxes(
    bt.expressive?.experienceProfile,
    sanitizeExpressiveOverrides(bt.expressive?.profiles),
    bt.expressive?.schemaVersion
  );
  const expansion = expandExpressiveProfiles(expressiveAxes);

  // A compiled BrandTheme is the complete static baseline for a first-party
  // product. Keep the three ramp axes explicit in that artifact instead of
  // relying on the consumer-side `var(--ds-*-scale, 1)` fallbacks: a DB
  // TenantTheme artifact emits the same canonical properties, so both sides
  // of the cascade remain observable and comparable without a second app-side
  // theme channel. Type and radius are neutral until a bounded appearance
  // override retunes them; density preserves the authored BrandTheme value.
  const vars: Record<string, string> = {
    "--ds-type-scale": "1",
    "--ds-radius-scale": "1",
    "--ds-density-scale": String(bt.surfaces?.densityScale ?? 1),
  };
  // Static/DB parity for the rhythm axis (E1): the SAME factor table the
  // appearance compiler uses lowers `surfaces.rhythm` here, so a static
  // vertical and a DB tenant authoring the same word get the same scale.
  // Absent -> no emission (the :root seed 1 governs; zero-delta).
  //
  // FAILING CLOSED IS PART OF THE PARITY, not an extra. `BrandTheme` is typed,
  // but it is also plain data by the time it reaches this compiler — it
  // crosses the RSC/JSON boundary and arrives through the compatibility
  // `TenantConfig.brandTheme` field, where no type survives. A bare bracket
  // read of the factor table therefore resolves INHERITED members:
  // `rhythm: 'toString'` returned a function and emitted its source text into
  // the channel, `'__proto__'` emitted `[object Object]`, and an object whose
  // `toString()` says `'tight'` was silently accepted by key coercion. Any of
  // those makes `clamp(0.8, var(--ds-rhythm-scale, 1), 1.25)` invalid at
  // computed-value time for every consumer of the effective channel — the
  // opposite of the documented "absent behaves like the pre-rhythm cascade".
  // The DB path rejects all of them at document validation, so an own-property
  // + numeric guard is what makes the two ingress paths fail closed the same
  // way. The clamp mirrors the DB lowering for the same reason: one envelope,
  // both paths, even though the three canonical postures sit inside it.
  const authoredRhythm = bt.surfaces?.rhythm;
  if (
    typeof authoredRhythm === "string" &&
    Object.prototype.hasOwnProperty.call(
      TENANT_THEME_RHYTHM_FACTORS,
      authoredRhythm
    )
  ) {
    const rhythmFactor =
      TENANT_THEME_RHYTHM_FACTORS[
        authoredRhythm as keyof typeof TENANT_THEME_RHYTHM_FACTORS
      ];
    if (typeof rhythmFactor === "number" && Number.isFinite(rhythmFactor)) {
      vars["--ds-rhythm-scale"] = String(
        Math.min(
          TENANT_THEME_RHYTHM_SCALE_BOUNDS.max,
          Math.max(TENANT_THEME_RHYTHM_SCALE_BOUNDS.min, rhythmFactor)
        )
      );
    }
  }
  // Profile channels land OVER the neutral structural seeds and UNDER every
  // authored write below: each authored field emits only when present, so
  // the later assignments restore exactly the "authored wins over profile"
  // precedence without a second writer per channel. The `--ds-type-{role}-*`
  // rows seeded here are intentionally restated by the semantic-typography
  // emitter at the end of this function, which receives the same table as a
  // role overlay — one owner, identical values.
  Object.assign(vars, expansion.variables);
  // Field-backed expressive defaults use the SAME lowering as DB Appearance.
  // Before this bridge a static selection changed density/radius only while
  // type pairing, button silhouette, elevation and motion were DB-only.
  Object.assign(vars, appearancePostureToVariables(expansion.fieldDefaults));
  // Every Standard posture, regardless of whether it arrived from a static
  // Theme or a DB ThemePatch, lowers through this one canonical table. The
  // expressive profile already wrote its defaults above; these authored fields
  // intentionally overwrite only the channels they own.
  Object.assign(
    vars,
    appearancePostureToVariables({
      typePairing: bt.typography?.typePairing,
      typeScale: bt.typography?.scale,
      buttonStyle: bt.surfaces?.buttonStyle,
      radiusScale: bt.surfaces?.radiusScale,
      density: bt.surfaces?.density,
      motion: bt.motion
        ? {
            intensity: bt.motion.intensity,
            durationScale: bt.motion.durationScale,
            ambient: bt.motion.ambient,
          }
        : undefined,
      elevation: bt.surfaces?.elevation,
    })
  );
  if (bt.palette) {
    // Semantic defaults come FIRST, so every authored layer outranks them:
    // the palette literals immediately below restate their own channels, and
    // `compileBrandTheme` merges the chrome map after this whole object. A
    // theme that authors its button chrome therefore keeps its exact pixels
    // while a palette-only theme stops being inert — the seeds reach the
    // buttons, focus ring, links, interactive states and grounds instead of
    // stopping at the ramps. Seed resolution mirrors `deriveTenantColorRamps`:
    // a dark-surface tenant derives from its dark seeds against its own dark
    // ground. A ground is derived only when the palette actually declares one,
    // so an absent seed never claims a channel.
    // The seed every derived channel below reads. One palette, one primary,
    // one ground -- a mode overlay re-enters this function with its own
    // merged palette, so the other mode resolves its own seed here rather
    // than being smuggled through a second field on this one.
    const effectivePrimary = bt.palette.primaryColor;
    Object.assign(
      vars,
      derivePaletteSemantics({
        primary: effectivePrimary,
        background: bt.palette.backgroundColor,
      })
    );

    // Light-mode palette (default)
    if (bt.palette.primaryColor)
      vars["--ds-color-primary"] = bt.palette.primaryColor;
    if (bt.palette.secondaryColor)
      vars["--ds-color-secondary"] = bt.palette.secondaryColor;
    if (bt.palette.accentColor)
      vars["--ds-color-accent"] = bt.palette.accentColor;
    if (bt.palette.textPrimaryColor)
      vars["--ds-color-text-primary"] = bt.palette.textPrimaryColor;
    if (bt.palette.textSecondaryColor)
      vars["--ds-color-text-secondary"] = bt.palette.textSecondaryColor;
    if (bt.palette.textMutedColor)
      vars["--ds-color-text-muted"] = bt.palette.textMutedColor;
    if (bt.palette.textDisabledColor)
      vars["--ds-color-text-disabled"] = bt.palette.textDisabledColor;
    if (bt.palette.borderPrimaryColor)
      vars["--ds-color-border-primary"] = bt.palette.borderPrimaryColor;
    if (bt.palette.borderSecondaryColor)
      vars["--ds-color-border-secondary"] = bt.palette.borderSecondaryColor;
    if (bt.palette.successColor)
      vars["--ds-color-success"] = bt.palette.successColor;
    if (bt.palette.warningColor)
      vars["--ds-color-warning"] = bt.palette.warningColor;
    if (bt.palette.errorColor) vars["--ds-color-error"] = bt.palette.errorColor;
    if (bt.palette.infoColor) vars["--ds-color-info"] = bt.palette.infoColor;
    // Readable ink over each hex status tone, from the shared derivation the
    // DB path also uses. A mode overlay re-enters this function with its own
    // merged palette, so a dark-mode tone re-derives its own ink; a future
    // authored on-<tone> field would simply overwrite these entries below.
    for (const role of ON_TONE_ROLES) {
      const seed = bt.palette[`${role}Color`];
      if (seed && isHexColor(seed)) {
        vars[onToneChannel(role)] = deriveReadableInk(seed);
      }
    }
    // The unauthored floor for the four channels a theme MAY author, merged
    // UNDER `setExtendedPaletteVariables` so any authored value overwrites its
    // own channel and leaves the other three derived. This compiler is now
    // the only author of all four: the runtime generator that used to derive
    // them from an NTSC luma threshold is gone, so there is no second emitter
    // to collide with and no reason to keep the floor exported-but-unwired.
    Object.assign(vars, deriveExtendedPaletteFloor(effectivePrimary));
    setExtendedPaletteVariables(vars, bt.palette);

    // This mode's ground. A theme declares one ground in the plain channel;
    // its other mode declares that mode's ground in its own overlay, which
    // compiles into a mode block. There is no `--ds-color-dark-bg` twin,
    // because a channel nothing paints from is not a mode.
    if (bt.palette.backgroundColor) {
      vars["--ds-color-bg-primary"] = bt.palette.backgroundColor;
      vars["--ds-color-bg"] = bt.palette.backgroundColor;
      vars["--ds-color-background"] = bt.palette.backgroundColor;
    }

    // The semantic control surface, which `--ds-surface-control` derives from
    // and every modern input control falls back to. It belongs here and not in
    // the chrome emitter: a mode overlay restates it through this same path,
    // so the value is always the one that mode authored.
    const inputBg = bt.chrome?.controls?.input?.bg;
    if (inputBg) vars["--ds-color-bg-input"] = inputBg;
  }
  if (bt.typography) {
    const ty = bt.typography;
    if (ty.fontFamilyBase)
      vars["--ds-font-family-base"] = withArabicSafeFallback(ty.fontFamilyBase);
    if (ty.fontFamilyHeading)
      vars["--ds-font-family-heading"] = withArabicSafeFallback(
        ty.fontFamilyHeading
      );
    if (ty.fontFamilyMono) vars["--ds-font-family-mono"] = ty.fontFamilyMono;
    if (ty.fontFamilyDisplay)
      vars["--ds-font-family-display"] = withArabicSafeFallback(
        ty.fontFamilyDisplay
      );
    if (ty.letterSpacing) {
      if (ty.letterSpacing.display)
        vars["--ds-letter-spacing-display"] = ty.letterSpacing.display;
      if (ty.letterSpacing.heading)
        vars["--ds-letter-spacing-heading"] = ty.letterSpacing.heading;
      if (ty.letterSpacing.body)
        vars["--ds-letter-spacing-body"] = ty.letterSpacing.body;
      if (ty.letterSpacing.mono)
        vars["--ds-letter-spacing-mono"] = ty.letterSpacing.mono;
    }
    if (ty.lineHeight) {
      if (ty.lineHeight.display != null)
        vars["--ds-line-height-display"] = String(ty.lineHeight.display);
      if (ty.lineHeight.heading != null)
        vars["--ds-line-height-heading"] = String(ty.lineHeight.heading);
      if (ty.lineHeight.body != null)
        vars["--ds-line-height-body"] = String(ty.lineHeight.body);
      if (ty.lineHeight.tight != null)
        vars["--ds-line-height-tight"] = String(ty.lineHeight.tight);
      if (ty.lineHeight.relaxed != null)
        vars["--ds-line-height-relaxed"] = String(ty.lineHeight.relaxed);
    }
  }
  if (bt.surfaces) {
    const su = bt.surfaces;
    Object.assign(
      vars,
      semanticSurfaceRolesToCssVariables(su.surfaceRoles ?? su.materials)
    );
    if (su.borderRadius) {
      // sm/md/lg/xl are emitted as the `-base` OPERANDS of the foundation dial,
      // never as resolved radii. themes/default.css computes each step as
      // `calc(base * var(--ds-radius-scale, 1))`, and a flat `--ds-radius-*` at
      // tenant scope replaces that calc entirely — sanctioned for a Pro tenant's
      // token set ("explicit beats dial"), but when the static compiler takes
      // that path for every code-owned vertical the dial can never move them.
      //
      // The divisor is the scale THIS theme emits, so the foundation calc
      // reproduces the authored value at today's dial while leaving the dial
      // live. The division is expressed in CSS rather than evaluated here: the
      // browser then multiplies and divides in one pass, which is exact for any
      // scale instead of correct only for the ones that divide evenly.
      //
      // Written as explicit per-step assignments, not a loop: the typed graph
      // both parity gates share seeds identifier domains from initializers, so
      // a `for…of` binding has none and the template key degrades to a wildcard
      // that resolves to no concrete channel.
      const radiusScale = Number(vars["--ds-radius-scale"] ?? "1");
      const dialed =
        Number.isFinite(radiusScale) && radiusScale > 0 && radiusScale !== 1;
      const radiusBase = (authored: string) =>
        dialed ? `calc(${authored} / ${radiusScale})` : authored;
      if (su.borderRadius.sm)
        vars["--ds-radius-sm-base"] = radiusBase(su.borderRadius.sm);
      if (su.borderRadius.md)
        vars["--ds-radius-md-base"] = radiusBase(su.borderRadius.md);
      if (su.borderRadius.lg)
        vars["--ds-radius-lg-base"] = radiusBase(su.borderRadius.lg);
      if (su.borderRadius.xl)
        vars["--ds-radius-xl-base"] = radiusBase(su.borderRadius.xl);
      // `full` is a pill radius, outside the dial ramp (themes/default.css).
      if (su.borderRadius.full) vars["--ds-radius-full"] = su.borderRadius.full;
    }
    if (su.shadows) {
      if (su.shadows.sm) vars["--ds-shadow-sm"] = su.shadows.sm;
      if (su.shadows.md) vars["--ds-shadow-md"] = su.shadows.md;
      if (su.shadows.lg) vars["--ds-shadow-lg"] = su.shadows.lg;
      if (su.shadows.xl) vars["--ds-shadow-xl"] = su.shadows.xl;
      if (su.shadows.xs) vars["--ds-shadow-xs"] = su.shadows.xs;
      // `2xl` cannot be an identifier, so the field is `xxl` and the channel
      // keeps the scale's own spelling.
      if (su.shadows.xxl) vars["--ds-shadow-2xl"] = su.shadows.xxl;
      if (su.shadows.inner) vars["--ds-shadow-inner"] = su.shadows.inner;
      if (su.shadows.focusRing)
        vars["--ds-shadow-focus-ring"] = su.shadows.focusRing;
      if (su.shadows.focusRingError)
        vars["--ds-shadow-focus-ring-error"] = su.shadows.focusRingError;
    }
    if (su.elevations) {
      // Authored AFTER the governed posture preset on purpose: the preset is
      // the floor a tenant selects, an authored ladder is the ceiling it
      // states outright, and it is never the other way around.
      if (su.elevations.level0) vars["--ds-elevation-0"] = su.elevations.level0;
      if (su.elevations.level1) vars["--ds-elevation-1"] = su.elevations.level1;
      if (su.elevations.level2) vars["--ds-elevation-2"] = su.elevations.level2;
      if (su.elevations.level3) vars["--ds-elevation-3"] = su.elevations.level3;
      if (su.elevations.level4) vars["--ds-elevation-4"] = su.elevations.level4;
      if (su.elevations.level5) vars["--ds-elevation-5"] = su.elevations.level5;
    }
    if (su.glass) {
      // 'none' is legacy zero-decoration suppression. The premium.css defaults + the
      // --ds-effect-intensity dial now own collapse, so a 'none' override must NOT be
      // emitted: doing so clobbered premium.css at runtime for every non-zero-intensity
      // tenant (including rottay, killing its surface tint). A tenant stays flat via
      // --ds-effect-intensity: 0 (bithire), not by nulling the role token. Only a real
      // (non-'none') value is emitted.
      if (su.glass.background && su.glass.background !== "none")
        vars["--ds-glass-bg"] = su.glass.background;
      if (su.glass.border && su.glass.border !== "none")
        vars["--ds-glass-border"] = su.glass.border;
      if (su.glass.blur && su.glass.blur !== "none")
        vars["--ds-glass-blur"] = su.glass.blur;
    }
    if (su.gradients) {
      if (su.gradients.primary && su.gradients.primary !== "none")
        vars["--ds-gradient-primary"] = su.gradients.primary;
      if (su.gradients.surface && su.gradients.surface !== "none")
        vars["--ds-gradient-surface"] = su.gradients.surface;
      if (su.gradients.mesh && su.gradients.mesh !== "none")
        vars["--ds-gradient-mesh"] = su.gradients.mesh;
    }
    if (su.overlays) {
      if (su.overlays.light) vars["--ds-overlay-light"] = su.overlays.light;
      if (su.overlays.medium) vars["--ds-overlay-medium"] = su.overlays.medium;
      if (su.overlays.heavy) vars["--ds-overlay-heavy"] = su.overlays.heavy;
    }
    // Premium effect-intensity dial (engines/modern spec section 5). Multiplies the
    // gradient/glass/glow layer via --ds-effect-intensity; 0 collapses it to flat.
    // Defaults to 1 (full Quiet Premium) when the theme does not set it.
    vars["--ds-effect-intensity"] = String(su.effectIntensity ?? 1);
  }
  // One ramp, on the surface THIS block compiles for. A mode overlay re-enters
  // this function with its own merged palette and its own mode, so its ramp
  // derives against its own ground through the same call — one channel family,
  // two blocks, never a namespaced twin.
  Object.assign(vars, deriveTenantColorRamps(bt.palette, surface));
  const chartSeed = bt.palette?.primaryColor;
  if (chartSeed && isHexColor(chartSeed)) {
    const chartGrounds = [
      bt.palette?.backgroundColor ??
        (surface === "dark" ? DARK_DEFAULT_GROUND : LIGHT_DEFAULT_GROUND),
      ...Object.values(
        bt.surfaces?.surfaceRoles ?? bt.surfaces?.materials ?? {}
      )
        .map((role) => role?.background)
        .filter((value): value is string => typeof value === "string"),
    ];
    deriveChartSeriesPalette(chartSeed, chartGrounds, surface).forEach(
      (color, index) => {
        vars[`--ds-chart-series-${index + 1}`] = color;
      }
    );
  }
  bt.charts?.categoryColors?.forEach((color, index) => {
    if (index < 10 && color) vars[`--ds-chart-category-${index + 1}`] = color;
  });
  setTintScaleVariables(vars, bt);
  setTypeRampVariables(vars);
  // `labelStyle` is an AUTHORED case decision and must sit in the authored
  // layer of the single role emitter — above any expressive profile overlay.
  // Historically it fed personality only, which let the label role channel
  // silently ignore it; the finer `typography.roles.label` surface still
  // wins over this mapping when both are authored.
  const authoredLabelCase: "uppercase" | "capitalize" | "none" | undefined =
    bt.typography?.labelStyle === undefined
      ? undefined
      : bt.typography.labelStyle === "uppercase"
      ? "uppercase"
      : bt.typography.labelStyle === "capitalize"
      ? "capitalize"
      : "none";
  const authoredRoles =
    authoredLabelCase === undefined
      ? bt.typography?.roles
      : {
          ...bt.typography?.roles,
          label: {
            textTransform: authoredLabelCase,
            ...omitUndefined(bt.typography?.roles?.label),
          },
        };
  setSemanticTypographyVariables(
    vars,
    authoredRoles,
    expressiveTypeRoleOverlay(expressiveAxes)
  );
  setMotionVariables(vars, bt);
  return vars;
}

/**
 * The closed motion vocabulary (design-language §2.6): three durations and two
 * easing families, expressed as tokens. `instant` (hover/focus/toggle/pill),
 * `calm` (page/tab transitions, entrance fades, tooltips), and `deliberate`
 * (panel open/resize, sheets, modals) are the ONLY sanctioned durations —
 * app-side raw ms literals are gate-banned in favor of these. The `standard`
 * ease drives everything; `exit` drives dismissals. The three steps are a fixed
 * closed set (120/200/320ms), except that `calm` tracks the theme's own
 * `entranceDuration` so the transition speed a BrandTheme authors for its
 * entrances is the same value tabs and tooltips animate at (design-language §2.6
 * notes calm "matches BITHIRE_PROFILE.transitionSpeed: '200ms'").
 */
function setMotionVariables(
  vars: Record<string, string>,
  bt: BrandTheme
): void {
  const calmMs = bt.motion?.entranceDuration ?? 200;
  vars["--ds-motion-instant"] = "120ms";
  vars["--ds-motion-calm"] = `${calmMs}ms`;
  vars["--ds-motion-deliberate"] = "320ms";
  vars["--ds-motion-feedback"] =
    "calc(var(--ds-motion-instant) * var(--ds-motion-duration-scale, 1))";
  vars["--ds-motion-reveal"] =
    "calc(var(--ds-motion-calm) * var(--ds-motion-duration-scale, 1))";
  vars["--ds-motion-disclosure"] =
    "calc(var(--ds-motion-calm) * var(--ds-motion-duration-scale, 1))";
  vars["--ds-motion-resize"] =
    "calc(var(--ds-motion-calm) * var(--ds-motion-duration-scale, 1))";
  vars["--ds-motion-rearrange"] =
    "calc(var(--ds-motion-deliberate) * var(--ds-motion-duration-scale, 1))";
  vars["--ds-motion-attention"] =
    "calc(var(--ds-motion-deliberate) * var(--ds-motion-duration-scale, 1))";
  vars["--ds-ease-standard"] = "cubic-bezier(0.2, 0, 0, 1)";
  vars["--ds-ease-exit"] = "cubic-bezier(0.4, 0, 1, 1)";
  vars["--ds-motion-ease-enter"] = "cubic-bezier(0.16, 1, 0.3, 1)";
  vars["--ds-motion-ease-exit"] = "var(--ds-ease-exit)";
  vars["--ds-motion-ease-move"] = "var(--ds-ease-standard)";

  // `--ds-motion-spring-gentle` has no consumer in the static generator's
  // tokenOverrideVariables() (unlike `--ds-motion-spring`, routed through
  // brandThemeToTokenOverrides above), so it is emitted directly as a
  // compiled CSS variable here. It only appears in this compiled block's
  // light-theme selector, but still resolves correctly for dark-themed
  // elements: the generator's dark selector block never redeclares this
  // property, and CSS custom properties fall back to a less-specific rule
  // on a per-property basis when a more-specific rule for the same element
  // omits that property entirely.
  if (isSpringEligible(bt)) {
    vars["--ds-motion-spring-gentle"] = springLinearEasingGentle(
      bt.motion!.springTension!,
      bt.motion!.springFriction!
    );
  }
}

/** The five closed tint steps of the one-blue scale (design-language §2.5). */
const TINT_STEPS = [4, 8, 12, 16, 24] as const;

/**
 * The closed composite type ramp (design-language §2.1): five sizes, three
 * weights, one editorial uppercase variant. Each entry's size aligns to a step
 * of the DS scalar font ramp (0.75rem=xs, 0.875rem=sm, 1rem, 1.25rem, 2rem) but
 * pairs it with a fixed rem line-height and tracking so a consumer binds one
 * named ramp entry instead of hand-picking a size/weight/tracking triple. The
 * weight set is 400/600/700 only; 500 and the 620–860 band are banned.
 */
const TYPE_RAMP = [
  {
    name: "detail",
    size: "0.75rem",
    lineHeight: "1rem",
    weight: 400,
    tracking: "0",
  },
  {
    name: "body",
    size: "0.875rem",
    lineHeight: "1.25rem",
    weight: 400,
    tracking: "0",
  },
  {
    name: "emphasis",
    size: "1rem",
    lineHeight: "1.5rem",
    weight: 600,
    tracking: "0",
  },
  {
    name: "title",
    size: "1.25rem",
    lineHeight: "1.75rem",
    weight: 600,
    tracking: "-0.01em",
  },
  {
    name: "display",
    size: "2rem",
    lineHeight: "2.25rem",
    weight: 700,
    tracking: "-0.02em",
  },
] as const;

/**
 * Emit the composite type ramp --ds-text-{detail,body,emphasis,title,display}
 * plus the --ds-text-eyebrow variant (design-language §2.1).
 *
 * Each ramp entry is emitted as a bare `font`-shorthand token (`--ds-text-<name>`
 * = `<weight> <size>/<line-height> <family>`, the headline composite the §2.1
 * table names) AND as the four addressable facets
 * `--ds-text-<name>-{size,weight,line-height,letter-spacing}` (tracking cannot
 * ride the `font` shorthand, so it is a separate facet; the facet names match the
 * existing foundation composite-text convention in
 * foundation/tokens/css/foundation/base/typography.css). The eyebrow reuses the detail size
 * at weight 600 with +0.08em tracking and is the sole uppercase in the product
 * (S1) — it carries a `-transform: uppercase` facet; every other ramp entry is
 * sentence case. The ramp is a fixed, tenant-independent closed set, so it is
 * emitted for every compiled BrandTheme.
 */
function setTypeRampVariables(vars: Record<string, string>): void {
  const family = "var(--ds-font-family-base)";

  for (const { name, size, lineHeight, weight, tracking } of TYPE_RAMP) {
    vars[`--ds-text-${name}`] = `${weight} ${size}/${lineHeight} ${family}`;
    vars[`--ds-text-${name}-size`] = size;
    vars[`--ds-text-${name}-weight`] = String(weight);
    vars[`--ds-text-${name}-line-height`] = lineHeight;
    vars[`--ds-text-${name}-letter-spacing`] = tracking;
  }

  // Eyebrow — detail size, weight 600, +0.08em tracking, uppercase (the sole
  // uppercase per BITHIRE_PROFILE.labelStyle: 'sentence').
  vars["--ds-text-eyebrow"] = `600 0.75rem/1rem ${family}`;
  vars["--ds-text-eyebrow-size"] = "0.75rem";
  vars["--ds-text-eyebrow-weight"] = "600";
  vars["--ds-text-eyebrow-line-height"] = "1rem";
  vars["--ds-text-eyebrow-letter-spacing"] = "0.08em";
  vars["--ds-text-eyebrow-transform"] = "uppercase";
}

/**
 * `fontSize` is optional here because the `body` role has no builder default:
 * body size is 14px canonical and its single authority is the theme layer
 * (foundation/tokens/css/foundation/themes/default.css). A BrandTheme that
 * wants a different body size still authors it via `typography.roles.body`,
 * which outranks this table.
 */
const DEFAULT_SEMANTIC_TYPOGRAPHY: Record<
  (typeof SEMANTIC_TYPOGRAPHY_ROLES)[number],
  Required<Omit<SemanticTypographyRoleTokens, "fontSize">> &
    Pick<SemanticTypographyRoleTokens, "fontSize">
> = {
  display: {
    fontFamily: "var(--ds-font-family-display, var(--ds-font-family-heading))",
    fontSize: "calc(2rem * var(--ds-type-scale, 1))",
    fontWeight: 700,
    lineHeight: 1.1,
    letterSpacing: "var(--ds-letter-spacing-display, -0.03em)",
    textTransform: "none",
    fontVariantNumeric: "normal",
  },
  pageTitle: {
    fontFamily: "var(--ds-font-family-heading)",
    fontSize: "calc(1.5rem * var(--ds-type-scale, 1))",
    fontWeight: 700,
    lineHeight: 1.16,
    letterSpacing: "var(--ds-letter-spacing-heading, -0.02em)",
    textTransform: "none",
    fontVariantNumeric: "normal",
  },
  sectionTitle: {
    fontFamily: "var(--ds-font-family-heading)",
    fontSize: "calc(1.125rem * var(--ds-type-scale, 1))",
    fontWeight: 600,
    lineHeight: 1.3,
    letterSpacing: "var(--ds-letter-spacing-heading, -0.01em)",
    textTransform: "none",
    fontVariantNumeric: "normal",
  },
  body: {
    fontFamily: "var(--ds-font-family-base)",
    fontWeight: 400,
    lineHeight: "var(--ds-line-height-body, 1.6)",
    letterSpacing: "var(--ds-letter-spacing-body, 0)",
    textTransform: "none",
    fontVariantNumeric: "normal",
  },
  supporting: {
    fontFamily: "var(--ds-font-family-base)",
    fontSize: "calc(0.8125rem * var(--ds-type-scale, 1))",
    fontWeight: 400,
    lineHeight: 1.5,
    letterSpacing: "var(--ds-letter-spacing-body, 0)",
    textTransform: "none",
    fontVariantNumeric: "normal",
  },
  label: {
    fontFamily: "var(--ds-font-family-base)",
    fontSize: "calc(0.75rem * var(--ds-type-scale, 1))",
    fontWeight: 600,
    lineHeight: 1.3,
    letterSpacing: "0.04em",
    textTransform: "none",
    fontVariantNumeric: "normal",
  },
  caption: {
    fontFamily: "var(--ds-font-family-base)",
    fontSize: "calc(0.6875rem * var(--ds-type-scale, 1))",
    fontWeight: 400,
    lineHeight: 1.35,
    letterSpacing: "0.01em",
    textTransform: "none",
    fontVariantNumeric: "normal",
  },
  code: {
    fontFamily: "var(--ds-font-family-mono)",
    fontSize: "calc(0.8125rem * var(--ds-type-scale, 1))",
    fontWeight: 400,
    lineHeight: 1.5,
    letterSpacing: "var(--ds-letter-spacing-mono, 0)",
    textTransform: "none",
    fontVariantNumeric: "tabular-nums",
  },
  numeric: {
    fontFamily: "var(--ds-font-family-heading)",
    fontSize: "calc(1rem * var(--ds-type-scale, 1))",
    fontWeight: 600,
    lineHeight: 1.2,
    letterSpacing: "-0.01em",
    textTransform: "none",
    fontVariantNumeric: "tabular-nums lining-nums",
  },
};

export function setSemanticTypographyVariables(
  vars: Record<string, string>,
  authored: SemanticTypographyTokens | undefined,
  profileOverlay?: ExpressiveTypeRoleOverlay
): void {
  for (const role of SEMANTIC_TYPOGRAPHY_ROLES) {
    // Single-writer precedence for every `--ds-type-{role}-*` channel:
    // engine defaults < expressive profile overlay < authored roles.
    const overlay = profileOverlay?.[role as keyof ExpressiveTypeRoleOverlay];
    const value = {
      ...DEFAULT_SEMANTIC_TYPOGRAPHY[role],
      ...(overlay?.letterSpacing !== undefined
        ? { letterSpacing: overlay.letterSpacing }
        : {}),
      ...(overlay?.textTransform !== undefined
        ? { textTransform: overlay.textTransform }
        : {}),
      ...(overlay?.fontVariantNumeric !== undefined
        ? { fontVariantNumeric: overlay.fontVariantNumeric }
        : {}),
      ...omitUndefined(authored?.[role]),
    };
    const kebabRole = role.replace(
      /[A-Z]/g,
      (letter) => `-${letter.toLowerCase()}`
    );
    const prefix = `--ds-type-${kebabRole}`;
    vars[`${prefix}-font-family`] = String(value.fontFamily);
    // Emitted only when a default or an authored role supplies one, so a role
    // the theme layer owns is left to the cascade instead of being reasserted
    // per tenant.
    if (value.fontSize !== undefined) {
      vars[`${prefix}-font-size`] = String(value.fontSize);
    }
    vars[`${prefix}-font-weight`] = String(value.fontWeight);
    vars[`${prefix}-line-height`] = String(value.lineHeight);
    vars[`${prefix}-letter-spacing`] = String(value.letterSpacing);
    vars[`${prefix}-text-transform`] = String(value.textTransform);
    vars[`${prefix}-font-variant-numeric`] = String(value.fontVariantNumeric);
    vars[
      prefix
    ] = `var(${prefix}-font-weight) var(${prefix}-font-size)/var(${prefix}-line-height) var(${prefix}-font-family)`;
  }
}

/**
 * Emit the closed tint scale --ds-tint-{4,8,12,16,24} per palette role.
 *
 * Each step is `color-mix(in oklab, <role> N%, var(--ds-color-bg-primary))`, so a
 * single role color (mixed over the page background) generates every interaction
 * tint instead of hand-picked rgba() values. This is what lets a vertical drop a
 * foreign second blue and re-derive hover/active/selected/focus states from its
 * primary alone (one-blue law). The primary role is emitted UNSUFFIXED (the
 * canonical interaction scale — hover=tint-4, active/selected=tint-8, selected
 * row=tint-12, focus ring=tint-24); each status tone (success/warning/error/info)
 * carries a role suffix so a tinted pill reads bg = tint-8 of the tone and
 * border = tint-24 of the tone. A role is skipped when its palette color is
 * absent, so themes that omit a tone simply omit that tone's tints.
 *
 * OKLAB, NOT SRGB, because a perceptually-even space keeps the steps evenly
 * spaced in perceived lightness; an sRGB mix compresses and expands unevenly
 * depending on hue, measured here at a 1.0% spread in the per-1% lightness gap
 * across the scale versus 0.0% for Oklab.
 *
 * OKLAB, NOT OKLCH, and the two are NOT interchangeable even though they are the
 * same space. The evenness above is a property of L, which both forms carry
 * identically -- the ramp's L values are byte-identical under either. They differ
 * only in the chroma plane: the polar form interpolates hue as an ANGLE, so a
 * ground with any chroma at all drags the role across the wheel in proportion to
 * how much of the mix the ground occupies -- and at these steps the ground is
 * 76-96% of it. A near-neutral page background is enough: at C=0.0059 an OKLCH
 * mix turned a warm role cold, and at C=0.0013 it rendered a blue primary as a
 * green-grey. The rectangular form interpolates a and b, which lands the mix
 * along the role's own direction and keeps the hue.
 *
 * This is invisible on a pure-white or pure-black ground. There the hue is
 * POWERLESS (CSS Color 4 §12.2: a hue with zero chroma is replaced by the other
 * color's during interpolation), so OKLCH carries the role's own hue forward and
 * the two forms agree exactly. A scale validated only against a neutral ground,
 * or only on a role that happens to share the ground's hue, will therefore show
 * no difference at all -- which is why this needs saying rather than rediscovering.
 */
function setTintScaleVariables(
  vars: Record<string, string>,
  bt: BrandTheme
): void {
  const palette = bt.palette;
  if (!palette) return;

  if (palette.primaryColor)
    setTintRampVariables(vars, "--ds-tint", "--ds-color-primary");
  if (palette.successColor)
    setTintRampVariables(vars, "--ds-tint-success", "--ds-color-success");
  if (palette.warningColor)
    setTintRampVariables(vars, "--ds-tint-warning", "--ds-color-warning");
  if (palette.errorColor)
    setTintRampVariables(vars, "--ds-tint-error", "--ds-color-error");
  if (palette.infoColor)
    setTintRampVariables(vars, "--ds-tint-info", "--ds-color-info");
}

/**
 * One role's five-step ramp. The scale prefix arrives as a literal at every
 * call site and each step is spelled in its own key, so the emitted names are
 * enumerable from source: ownership derivations read this file, and a family
 * assembled behind an interpolated variable is invisible to them — a channel
 * the compiler writes at :root would then be classified as an unowned read.
 */
function setTintRampVariables(
  vars: Record<string, string>,
  scale: string,
  colorVar: string
): void {
  vars[`${scale}-4`] = tintStep(colorVar, 4);
  vars[`${scale}-8`] = tintStep(colorVar, 8);
  vars[`${scale}-12`] = tintStep(colorVar, 12);
  vars[`${scale}-16`] = tintStep(colorVar, 16);
  vars[`${scale}-24`] = tintStep(colorVar, 24);
}

function tintStep(colorVar: string, step: (typeof TINT_STEPS)[number]): string {
  return `color-mix(in oklab, var(${colorVar}) ${step}%, var(--ds-color-bg-primary))`;
}

// ── Mode overlays ───────────────────────────────────────

/**
 * Merge one mode overlay over the base theme.
 *
 * Plain-object branches recurse so a partial like `chrome.controls.input.bg`
 * replaces one leaf and leaves its siblings alone; everything else (strings,
 * numbers, arrays) is a leaf and is replaced wholesale. `undefined` in the
 * overlay means "not authored", never "unset".
 */
function mergeModeOverlay<T>(base: T, overlay: unknown): T {
  if (overlay === undefined) return base;
  if (
    !overlay ||
    typeof overlay !== "object" ||
    Array.isArray(overlay) ||
    !base ||
    typeof base !== "object" ||
    Array.isArray(base)
  ) {
    return overlay as T;
  }
  const merged: Record<string, unknown> = {
    ...(base as Record<string, unknown>),
  };
  for (const [key, value] of Object.entries(overlay)) {
    if (value === undefined) continue;
    merged[key] = mergeModeOverlay(
      (base as Record<string, unknown>)[key],
      value
    );
  }
  return merged as T;
}

/** Apply a mode overlay to a BrandTheme, leaving identity fields alone. */
export function applyModeOverlay(
  bt: BrandTheme,
  overlay: BrandThemeModeOverlay
): BrandTheme {
  return {
    ...bt,
    palette: mergeModeOverlay(bt.palette, overlay.palette) as
      | BrandPalette
      | undefined,
    typography: mergeModeOverlay(bt.typography, overlay.typography),
    surfaces: mergeModeOverlay(bt.surfaces, overlay.surfaces),
    // The merge base is completed to the canonical chrome shape so both
    // transports place an overlay-only key at the SAME (shape) position:
    // sparse static chrome would otherwise APPEND it while the ISO bridge's
    // materialized chrome carries the shape slot, and the authored-order
    // emitters make that placement observable in the mode block's css.
    chrome: mergeModeOverlay(completeChromeShape(bt.chrome), overlay.chrome),
  };
}

/**
 * Compile every authored mode overlay into its delta over the base block.
 *
 * The overlay goes through the SAME family compilers as the base — there is no
 * second emission path and no per-vertical branch. Only channels whose value
 * actually moves are kept: everything the mode does not restate keeps
 * cascading from the base block, which is also what lets a `var()` chain
 * authored once (the tint scale mixes against `--ds-color-bg-primary`)
 * re-resolve against the mode's own ground instead of being duplicated.
 */
function modeOverlayHasValues(overlay: BrandThemeModeOverlay): boolean {
  for (const family of Object.values(overlay)) {
    if (family && typeof family === "object") {
      for (const value of Object.values(family)) {
        if (value === undefined) continue;
        if (value !== null && typeof value === "object") {
          if (modeOverlayHasValues(value as BrandThemeModeOverlay)) return true;
        } else {
          return true;
        }
      }
    }
  }
  return false;
}

/** The Theme field a tenant sets to re-seed the primary family. */
export const PRIMARY_SEED_FIELD = "palette.primaryColor";

/**
 * Every channel the primary seed derives, mapped to the Theme leaves that
 * SHADOW it -- the explicit statements that name the same channel directly.
 *
 * The key set is not hand-authored law: it is exactly the union of what
 * `derivePrimarySemantics` and `deriveInteractionFloor` emit for a seed, and
 * a test asserts that. This table only records, per channel, WHICH field an
 * author would use to overrule the derivation. `--ds-button-primary-color`
 * carries two because its emitter falls back from `.color` to `.text`, so both
 * spellings are the same statement about the same channel.
 */
export const SEED_SHADOWING_FIELDS: Readonly<
  Record<string, readonly string[]>
> = {
  "--ds-button-primary-bg": ["chrome.controls.buttonPrimary.bg"],
  "--ds-button-primary-bg-hover": ["chrome.controls.buttonPrimary.bgHover"],
  "--ds-button-primary-border": ["chrome.controls.buttonPrimary.border"],
  "--ds-button-primary-color": [
    "chrome.controls.buttonPrimary.color",
    "chrome.controls.buttonPrimary.text",
  ],
  "--ds-input-border-focus": ["chrome.controls.input.borderFocus"],
  "--ds-input-shadow-focus": ["chrome.controls.input.shadowFocus"],
  "--ds-color-primary-foreground": ["palette.primaryForegroundColor"],
  "--ds-color-border-focus": ["palette.borderFocusColor"],
  "--ds-color-link": ["palette.linkColor"],
  "--ds-color-link-hover": ["palette.linkHoverColor"],
};

const CUSTOM_PROPERTY_NAME = /--[a-z0-9-]+/gi;
const BAKED_COLOR = /#[0-9a-f]{3,8}\b|\b(?:rgba?|hsla?|oklch|oklab|lab|lch)\(/i;

/**
 * Does this value bake a colour OF ITS OWN, or does it only point at one?
 *
 * The distinction decides whether a tenant's seed may replace an assembled
 * value. `var(--ds-button-primary-bg)` and `var(--ds-control-on-brand)` bake
 * nothing: they resolve THROUGH channels this same derivation re-seeds, so
 * they already carry the tenant's brand and rewriting them would change bytes
 * without changing a pixel. `var(--ds-material-control-border-active, #3A6FB0)`
 * does bake one -- the vertical's blue survives in the fallback no matter what
 * the tenant seeds -- so it is genuinely stale and must be re-derived.
 *
 * Custom-property NAMES are stripped before the test because a channel name is
 * a reference, never a colour; what remains is only literal values, including
 * the ones hiding in a `var()` fallback.
 */
function bakesItsOwnColor(value: string): boolean {
  return BAKED_COLOR.test(value.replace(CUSTOM_PROPERTY_NAME, ""));
}

/** What one compiled block needs to know about its tenant's authorship. */
interface TenantSeedProvenance {
  readonly authoredPaths: TenantAuthoredPaths;
  /** "" for the base block, "modes.<mode>." for a mode overlay block. */
  readonly modePrefix: string;
  /** Whether the seed THIS block compiles from is the tenant's own. */
  readonly seedIsTenantAuthored: boolean;
}

/**
 * Re-derive the primary family a TENANT seed owns, over an assembled block.
 *
 * A tenant that sets its primary colour and nothing else must get a sidebar,
 * a focus ring and a link colour that are ITS brand, not the vertical's. Today
 * the vertical baseline's concrete leaves sit in the assembled map and outrank
 * the derivation purely because they were written later, which is a
 * white-label defect: a BASELINE_LEAF cannot beat a TENANT_DERIVED value.
 *
 * Three guards keep the repair from becoming a repaint:
 *
 *  1. No provenance, or a seed this block did not get from the tenant, and the
 *     function returns without touching a byte. Every static first-party
 *     compile takes this path.
 *  2. A tenant leaf that names the channel directly (`SEED_SHADOWING_FIELDS`)
 *     is TENANT_LEAF and outranks the tenant's own seed, so the derivation
 *     skips it.
 *  3. A value that bakes no colour of its own already tracks the seed, so it
 *     is left exactly as assembled -- the indirection survives.
 *
 * The values themselves come from the SAME two owners the unseeded path uses,
 * called with the same arguments. There is no second derivation and no
 * arithmetic here.
 */
function applyTenantSeedDerivations(
  vars: Record<string, string>,
  effectivePrimary: string | undefined,
  provenance: TenantSeedProvenance | undefined
): void {
  if (!provenance || !provenance.seedIsTenantAuthored) return;
  const derived: Record<string, string> = {
    ...derivePrimarySemantics({ primary: effectivePrimary }),
    ...deriveInteractionFloor(effectivePrimary).variables,
  };
  for (const [channel, derivedValue] of Object.entries(derived)) {
    const currentRank = (SEED_SHADOWING_FIELDS[channel] ?? []).some((field) =>
      isTenantAuthoredField(
        provenance.authoredPaths,
        field,
        provenance.modePrefix
      )
    )
      ? PRODUCER_RANK.tenantLeaf
      : PRODUCER_RANK.baselineLeaf;
    if (PRODUCER_RANK.tenantDerived <= currentRank) continue;
    const current = vars[channel];
    if (current !== undefined && !bakesItsOwnColor(current)) continue;
    vars[channel] = derivedValue;
  }
}

/**
 * Keep a tenant's base-authored sidebar leaf authoritative INSIDE a mode.
 *
 * A mode overlay is a statement about the other mode, not a statement about
 * who outranks whom. `applyModeOverlay` merges structurally, so the vertical
 * baseline's `modes.dark.chrome.sidebar.*` lands on top of the tenant's base
 * leaf purely because it is more specific -- and that is the same
 * BASELINE_LEAF(1) beating TENANT_LEAF(4) inversion this wave exists to close,
 * displaced by one block. A tenant that states its sidebar colour once, without
 * qualifying a mode, has stated it for every mode; only the TENANT can narrow
 * that statement, by authoring the mode leaf itself.
 *
 * So the base block's emitted value is restored whenever the tenant authored
 * the leaf at the base and did NOT restate it for this mode. The delta filter
 * downstream then withdraws the channel entirely, which is the visible
 * signature of the rule: a tenant sidebar colour produces no mode row at all,
 * rather than a row painting it back to the vertical's.
 *
 * Scope is Site B's closed table and nothing else. It is deliberately NOT
 * generalised to every authored chrome field: an overlay that carries a
 * genuinely mode-specific value (a dark card surface against a light one) is
 * not an inversion, and re-ranking those is a separate contest this wave has
 * no standing in.
 *
 * Rank does not consult the shape of the value. Site A's `bakesItsOwnColor`
 * predicate governs SEED-DERIVED rewriting, where the question is whether an
 * assembled value already tracks the seed; it has no authority here. A tenant
 * leaf holding `var(--ds-tint-8)` is a TENANT_LEAF(4) statement exactly as
 * much as one holding `#101014`, and filtering on literal-vs-reference would
 * hand the channel back to the baseline overlay it outranks. If carrying a
 * reference across a mode makes a contrast pair unverifiable, that is an
 * intake question for the document, answered at ingestion -- not a reason to
 * demote the rank.
 */
function keepTenantBaseSidebarLeaves(
  modeVars: Record<string, string>,
  baseVars: Record<string, string>,
  authoredPaths: TenantAuthoredPaths | undefined,
  modePrefix: string
): void {
  if (authoredPaths === undefined) return;
  for (const [channel, field] of Object.entries(SIDEBAR_TONE_LEAF_FIELDS)) {
    // Base authorship only -- `isTenantAuthoredField` would also answer yes for
    // a mode-qualified path, and a tenant's own mode leaf is exactly the case
    // that must NOT be overwritten here.
    if (!authoredPaths.has(field)) continue;
    if (authoredPaths.has(`${modePrefix}${field}`)) continue;
    const base = baseVars[channel];
    if (base === undefined) continue;
    modeVars[channel] = base;
  }
}

function compileModeBlocks(
  bt: BrandTheme,
  baseVars: Record<string, string>,
  authoredPaths: TenantAuthoredPaths | undefined
): CompiledBrandModeBlock[] {
  const modes = bt.modes;
  if (!modes) return [];
  const defaultMode = bt.appearance?.defaultMode;
  const blocks: CompiledBrandModeBlock[] = [];
  for (const mode of ["light", "dark"] as const) {
    const overlay = modes[mode];
    if (!overlay) continue;
    if (mode === defaultMode) {
      // Canonical ISO Themes always carry both mode slots; an empty default-mode
      // overlay is a structural placeholder, not an authority violation.
      if (!modeOverlayHasValues(overlay)) continue;
      throw new Error(
        `BrandTheme '${bt.id}' authors modes.${mode}, but ${mode} is its declared defaultMode. ` +
          `The default mode's values belong in the theme body; a mode overlay describes the OTHER mode.`
      );
    }
    const merged = applyModeOverlay(bt, overlay);
    const modePrefix = `modes.${mode}.`;
    const modeVars = {
      ...brandThemeToCssVariables(merged, mode),
      ...brandThemeToChromeVariables(merged, mode, authoredPaths, modePrefix),
    };
    // The seed this block compiles from is `merged.palette.primaryColor`. It is
    // the TENANT'S only when the tenant stated it for this mode, or stated it
    // at the base and the overlay does not restate it -- an overlay-authored
    // seed belongs to whoever wrote that overlay, and re-deriving a baseline's
    // own mode seed would be a baseline-versus-baseline fight this site has no
    // standing in.
    applyTenantSeedDerivations(
      modeVars,
      merged.palette?.primaryColor,
      authoredPaths === undefined
        ? undefined
        : {
            authoredPaths,
            modePrefix,
            seedIsTenantAuthored:
              authoredPaths.has(`${modePrefix}${PRIMARY_SEED_FIELD}`) ||
              (overlay.palette?.primaryColor === undefined &&
                authoredPaths.has(PRIMARY_SEED_FIELD)),
          }
    );
    keepTenantBaseSidebarLeaves(modeVars, baseVars, authoredPaths, modePrefix);
    const cssVariables: Record<string, string> = {};
    for (const [key, value] of Object.entries(modeVars)) {
      if (baseVars[key] !== value) cssVariables[key] = value;
    }
    blocks.push({ mode, cssVariables, colorScheme: mode });
  }
  return blocks;
}

/**
 * The selector a compiled BrandTheme's base block is scoped to.
 *
 * Exported because consumers that RE-SCOPE this compiler's output — the
 * tenant preview rebuilds every rule onto a container-local selector — need
 * the same string this compiler writes. Reconstructing it at the call site is
 * how a preview silently stops matching when the scoping changes here.
 */
export function brandTenantSelector(tenantSlug: string): string {
  return `html[data-tenant='${tenantSlug}']`;
}

/** Build a CSS string from variables with tenant selector scoping. */
function buildCssString(
  vars: Record<string, string>,
  tenantSlug: string,
  colorScheme?: "light" | "dark"
): string {
  const entries = Object.entries(vars).filter(([, v]) => v != null);
  if (entries.length === 0 && !colorScheme) return "";
  const declarations = [
    ...(colorScheme ? [`  color-scheme: ${colorScheme};`] : []),
    ...entries.map(([k, v]) => `  ${k}: ${v};`),
  ].join("\n");
  return `${brandTenantSelector(tenantSlug)} {\n${declarations}\n}`;
}

/**
 * Selector a compiled mode block is scoped to.
 *
 * Both arms are the root-state contract's two ways of naming an explicit mode:
 * `data-theme` is what the SSR projection and the DS provider stamp, the class
 * is the legacy hook still used by pre-paint scripts. Both are one attribute
 * more specific than the base block, so a mode wins wherever it speaks and the
 * base supplies everything else — no source-order dependency.
 */
export function brandModeSelector(
  tenantSlug: string,
  mode: BrandThemeMode
): string {
  return themeModeSelector(brandTenantSelector(tenantSlug), mode);
}

/** Shared explicit-mode selector grammar for static and DB artifact renderers. */
export function themeModeSelector(
  baseSelector: string,
  mode: BrandThemeMode
): string {
  return `${baseSelector}[data-theme='${mode}'], ${baseSelector}.${mode}`;
}

/** Build one compiled mode block's CSS. */
function buildModeCssString(
  block: CompiledBrandModeBlock,
  tenantSlug: string
): string {
  const entries = Object.entries(block.cssVariables).filter(
    ([, v]) => v != null
  );
  const declarations = [
    `  color-scheme: ${block.colorScheme};`,
    ...entries.map(([k, v]) => `  ${k}: ${v};`),
  ].join("\n");
  return `${brandModeSelector(tenantSlug, block.mode)} {\n${declarations}\n}`;
}

// ── Chrome Variables ────────────────────────────────────

/**
 * Map BrandTheme.chrome sub-interfaces to flat CSS variable declarations.
 *
 * This is the explicit chrome channel — sidebar, layout, shell, controls,
 * and table are NOT shoehorned into tokenOverrides or personality. The
 * mapping is shared with runtime/appearance via kernel/css/chrome-variables,
 * since TenantAppearanceAdvanced.chrome is the same shape as BrandTheme.chrome.
 */
export function brandThemeToChromeVariables(
  bt: BrandTheme,
  mode: BrandThemeMode = bt.appearance?.defaultMode ?? "light",
  /** Tenant authorship, when this compile has a tenant. See `ChromeVariableContext`. */
  tenantAuthoredPaths?: TenantAuthoredPaths,
  modePrefix = ""
): Record<string, string> {
  return chromeToVariables(bt.chrome, {
    radiusScale: brandThemeRadiusScale(bt),
    mode,
    tenantAuthoredPaths,
    modePrefix,
  });
}

/**
 * The `--ds-radius-scale` this theme compiles to.
 *
 * Derived here rather than threaded from the caller so no call site can emit
 * chrome against the wrong dial: the chrome emitter divides authored radius
 * literals by this exact number, and a divisor that disagrees with the
 * declared scale is a silent repaint rather than a failure. Same lowering, on
 * the same input, as the assignment `brandThemeToCssVariables` makes before it
 * reads the channel for the surface ramp's `-base` operands.
 */
function brandThemeRadiusScale(bt: BrandTheme): string {
  const expansion = expandExpressiveProfiles(
    resolveExpressiveAxes(
      bt.expressive?.experienceProfile,
      sanitizeExpressiveOverrides(bt.expressive?.profiles),
      bt.expressive?.schemaVersion
    )
  );
  return (
    appearancePostureToVariables({ radiusScale: bt.surfaces?.radiusScale })[
      "--ds-radius-scale"
    ] ??
    appearancePostureToVariables(expansion.fieldDefaults)[
      "--ds-radius-scale"
    ] ??
    "1"
  );
}

// ── Brand Compiler ──────────────────────────────────────

/**
 * Compile a BrandTheme into resolved outputs for runtime and static generation.
 *
 * Implements the CompileBrandTheme contract. The merge chain is:
 *   vertical baseline -> BrandTheme
 *
 * Tenant-level overrides (personality, tokenOverrides) are NOT applied here —
 * they are the highest-priority layer applied by useTokens and
 * DesignSystemProvider at runtime.
 */
/**
 * Re-exported so the artifact build can gate on the same threshold the compiler
 * reasons with. `foundation/kernel` is not a package entry, and Vite tree-shakes an
 * export no entry reaches -- the constant vanished from `dist` while remaining
 * in the source, and the build script that imported it failed at run time.
 */
export {
  APCA_BODY_TEXT_MIN_LC,
  apcaContrast,
} from "@/foundation/kernel/accessibility/branding-contrast";

/**
 * `BrandCompilerInput` plus the optional tenant authorship record.
 *
 * Widened HERE rather than on the contract because provenance is a property of
 * one COMPILE, not of the BrandTheme shape the contract describes, and because
 * every existing caller stays valid: the field is optional, so omitting it is
 * the documented "no provenance supplied" case that must reproduce today's
 * bytes exactly.
 */
type BrandCompilerProvenanceInput = BrandCompilerInput & {
  tenantAuthoredPaths?: TenantAuthoredPaths;
};

export const compileBrandTheme: CompileBrandTheme = (
  input: BrandCompilerProvenanceInput
): CompiledBrand => {
  const {
    brandTheme,
    tenantSlug,
    verticalPersonality,
    verticalTokenOverrides,
    tenantAuthoredPaths,
  } = input;

  // Merge personality: vertical baseline -> brandTheme
  const btPersonality = brandThemeToPersonality(brandTheme);
  const personality = mergePartialPersonality(
    verticalPersonality,
    btPersonality
  );

  // Merge structural: vertical baseline -> brandTheme
  const btOverrides = brandThemeToTokenOverrides(brandTheme);
  const tokenOverrides = deepMergeTokenOverrides(
    verticalTokenOverrides ?? {},
    btOverrides
  );

  // CSS variables from palette + typography + surfaces + chrome
  const paletteVars = brandThemeToCssVariables(brandTheme);
  const chromeVars = brandThemeToChromeVariables(
    brandTheme,
    undefined,
    tenantAuthoredPaths
  );
  const cssVariables = { ...paletteVars, ...chromeVars };
  // The base block's seed is the tenant's exactly when the tenant stated it;
  // there is no overlay above this block to restate it.
  applyTenantSeedDerivations(
    cssVariables,
    brandTheme.palette?.primaryColor,
    tenantAuthoredPaths === undefined
      ? undefined
      : {
          authoredPaths: tenantAuthoredPaths,
          modePrefix: "",
          seedIsTenantAuthored: tenantAuthoredPaths.has(PRIMARY_SEED_FIELD),
        }
  );

  // DS-S001: governed recipe-profile selection. Fail-closed — an unknown id,
  // malformed id or foreign schema version compiles to engine defaults.
  const recipeProfileValidation = validateRecipeProfileSelection(
    brandTheme.recipes?.profile,
    brandTheme.recipes?.schemaVersion
  );
  const recipeProfile = recipeProfileValidation.ok
    ? recipeProfileValidation.profile?.id
    : undefined;
  if (recipeProfile) {
    cssVariables["--ds-recipe-profile"] = `"${recipeProfile}"`;
  }

  // C1b: governed experience-profile selection. The expansion itself already
  // ran inside brandThemeToCssVariables (so mode overlays re-expand); this
  // block only publishes the validated selection id as provenance, exactly
  // like the recipe channel above. Same fail-closed posture: invalid ids
  // compile to baseline identity with no marker.
  const experienceProfileValidation = validateExperienceProfileSelection(
    brandTheme.expressive?.experienceProfile,
    brandTheme.expressive?.schemaVersion
  );
  const experienceProfile = experienceProfileValidation.ok
    ? experienceProfileValidation.profile?.id
    : undefined;
  if (experienceProfile) {
    cssVariables["--ds-experience-profile"] = `"${experienceProfile}"`;
  }

  assertMandatoryFontFallback(cssVariables, tenantSlug);

  // The declared mode of the values above; the non-default modes are compiled
  // from the typed `modes` overlays into their own blocks below.
  const colorScheme = brandTheme.appearance?.defaultMode;
  const modeBlocks = compileModeBlocks(
    brandTheme,
    cssVariables,
    tenantAuthoredPaths
  );
  for (const block of modeBlocks) {
    // A mode may restyle type; it may not drop the mandatory fallback while
    // doing so. The guard reads the block's own emission, not the base's.
    assertMandatoryFontFallback(
      block.cssVariables,
      `${tenantSlug} (${block.mode} mode)`
    );
  }

  // CSS string with tenant selectors
  const cssString = [
    buildCssString(cssVariables, tenantSlug, colorScheme),
    ...modeBlocks.map((block) => buildModeCssString(block, tenantSlug)),
  ]
    .filter(Boolean)
    .join("\n\n");

  // Engine bridge passthrough
  const engineBridge: Partial<Record<EngineName, Record<string, unknown>>> =
    brandTheme.engineBridge ?? {};

  return {
    cssVariables,
    cssString,
    personality,
    tokenOverrides,
    engineBridge,
    ...(recipeProfile ? { recipeProfile } : {}),
    ...(experienceProfile ? { experienceProfile } : {}),
    ...(colorScheme ? { colorScheme } : {}),
    ...(modeBlocks.length > 0 ? { modeBlocks } : {}),
  };
};

/** ISO T0: the single lowering for a resolved Theme. */
export function compileTheme(
  theme: Theme,
  options?: {
    tenantSlug?: string;
    verticalPersonality?: BrandCompilerInput["verticalPersonality"];
    verticalTokenOverrides?: BrandCompilerInput["verticalTokenOverrides"];
    /**
     * Which paths of this Theme the TENANT authored, collected from the patch
     * that produced it (`collectPatchAuthoredPaths`). Supplied only for the
     * tenant leg of a DB compile; a baseline compile supplies nothing and
     * therefore compiles exactly as it did before provenance existed.
     */
    tenantAuthoredPaths?: TenantAuthoredPaths;
  }
): CompiledBrand {
  const input: BrandCompilerProvenanceInput = {
    brandTheme: themeToBrandTheme(theme),
    tenantSlug: options?.tenantSlug ?? theme.id,
    verticalPersonality: options?.verticalPersonality,
    verticalTokenOverrides: options?.verticalTokenOverrides,
    tenantAuthoredPaths: options?.tenantAuthoredPaths,
  };
  return compileBrandTheme(input);
}

export type CompiledTheme = CompiledBrand;
export type CompileTheme = typeof compileTheme;

/**
 * @deprecated Use `compileTheme` with a complete resolved `Theme`. Kept as a
 * compatibility alias for one migration window.
 */
export const compileBrandThemeDeprecated: CompileBrandTheme = compileBrandTheme;
