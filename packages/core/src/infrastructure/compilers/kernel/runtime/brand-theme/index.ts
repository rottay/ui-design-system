/**
 * @fileoverview Brand compiler — bridge utilities + compilation.
 *
 * Converts a BrandTheme into the shapes consumed by the runtime
 * (useTokens, ThemeProvider) and by static CSS generation.
 *
 * Bridge functions: brandThemeToTokenOverrides, brandThemeToPersonality,
 * brandThemeToBranding, deepMergeTokenOverrides.
 *
 * Compiler: compileBrandTheme — conforms to the CompileBrandTheme contract
 * from contracts/themes. Produces personality, tokenOverrides, CSS variables,
 * and a CSS string from a BrandTheme + vertical baseline.
 */

import {
  assertMandatoryFontFallback,
  withArabicSafeFallback,
} from "@/foundation/kernel/typography";
import type {
  BrandTheme,
  BrandPalette,
  BrandThemeMode,
  BrandThemeModeOverlay,
  CompileBrandTheme,
  CompiledBrand,
  CompiledBrandModeBlock,
  BrandCompilerInput,
} from "@/foundation/contracts/composition/tenants/themes";
import type { EngineName } from "@/foundation/contracts/runtime/engine";
import {
  DENSITY_MODE_FACTOR_VARIABLE,
  isDensityPreference,
  resolveDensityModeFactor,
} from "@/foundation/tokens/ts/foundation/base/density";
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
import type {
  TenantBranding,
  TenantTokenOverrides,
} from "@/foundation/contracts/composition/tenants";
import type { PersonalityTokens } from "@/foundation/contracts/kernel/tokens/personality";
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
import { chromeToVariables } from "../../foundation/css/chrome-variables";
import { derivePaletteSemantics } from "../../foundation/css/color-math/palette-derivations";
import { isHexColor } from "../../foundation/css/color-math";
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
 * curve) so it rides the SAME `TenantTokenOverrides.motion.spring` field the
 * tenant visual compiler (`infrastructure/compilers/runtime/tenant-css/visual-config`) maps
 * to `--ds-motion-spring` -- this is the only path that reaches the
 * generated tenant artifact without a tenant manually authoring a literal
 * override.
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
      bt.expressive?.schemaVersion,
    ),
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
 * Extract legacy-compatible branding from a BrandTheme.
 *
 * Maps BrandTheme.palette + typography font families to TenantBranding
 * so ThemeProvider's branding injection works without modification.
 */
export function brandThemeToBranding(bt: BrandTheme): Partial<TenantBranding> {
  const result: Partial<TenantBranding> = {};

  if (bt.palette) {
    result.primaryColor = bt.palette.primaryColor;
    result.secondaryColor = bt.palette.secondaryColor;
    result.accentColor = bt.palette.accentColor;
    result.darkPrimaryColor = bt.palette.darkPrimaryColor;
    result.darkSecondaryColor = bt.palette.darkSecondaryColor;
    result.darkAccentColor = bt.palette.darkAccentColor;
    result.darkBackgroundColor = bt.palette.darkBackgroundColor;
    result.successColor = bt.palette.successColor;
    result.warningColor = bt.palette.warningColor;
    result.errorColor = bt.palette.errorColor;
    result.infoColor = bt.palette.infoColor;
  }

  if (bt.typography) {
    result.fontFamilyBase = bt.typography.fontFamilyBase;
    result.fontFamilyHeading = bt.typography.fontFamilyHeading;
    result.fontFamilyMono = bt.typography.fontFamilyMono;
    result.fontFamilyDisplay = bt.typography.fontFamilyDisplay;
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
  base: Partial<PersonalityTokens> | undefined,
  override: Partial<PersonalityTokens>
): Partial<PersonalityTokens> {
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

/** The DS foundation's light canvas -- the ground a light-surface tenant
 * falls back to when it does not declare its own `backgroundColor`. */
const LIGHT_DEFAULT_GROUND = "#FFFFFF";

/**
 * A tenant is dark-surface when it declares ONLY a dark ground
 * (`darkBackgroundColor` set, `backgroundColor` absent) -- its one true
 * canvas is dark and there is no light default to fall back to (rottay:
 * `darkBackgroundColor` set, no `backgroundColor`). A tenant that declares
 * BOTH stays light-surface: a declared `backgroundColor` is always its own
 * default ground, and a `darkBackgroundColor` alongside it is an optional
 * toggle variant, not the tenant's canonical surface (evnto: both set,
 * light-first). There is no light/dark toggle in the derivation itself --
 * each tenant gets exactly one ramp, keyed to this classification.
 */
export function isDarkSurfacePalette(
  palette: BrandPalette | undefined
): boolean {
  return !!palette?.darkBackgroundColor && !palette?.backgroundColor;
}

interface RampRoleSpec {
  name: string;
  light: string | undefined;
  dark: string | undefined;
}

/** The 7 palette roles a ramp can be derived for. success/warning/error/info
 * have no dedicated dark seed in the BrandPalette contract, so a dark-surface
 * tenant re-derives their ramp from the same seed against its dark ground. */
function rampRoleSpecs(palette: BrandPalette): readonly RampRoleSpec[] {
  return [
    {
      name: "primary",
      light: palette.primaryColor,
      dark: palette.darkPrimaryColor,
    },
    {
      name: "secondary",
      light: palette.secondaryColor,
      dark: palette.darkSecondaryColor,
    },
    {
      name: "accent",
      light: palette.accentColor,
      dark: palette.darkAccentColor,
    },
    { name: "success", light: palette.successColor, dark: undefined },
    { name: "warning", light: palette.warningColor, dark: undefined },
    { name: "error", light: palette.errorColor, dark: undefined },
    { name: "info", light: palette.infoColor, dark: undefined },
  ];
}

/**
 * Derive the perceptually-even `--ds-color-{role}-{50..900}` ramp for every
 * palette role that declares a seed, keyed to the tenant's OWN surface: any
 * tenant seed color mechanically yields a full, even, gamut-mapped palette
 * -- no per-tenant design work. See `deriveOklchRamp` for the derivation
 * itself (OKLCH lightness/chroma interpolation, hue held constant, gamut
 * mapped per step).
 */
export function deriveTenantColorRamps(
  palette: BrandPalette | undefined
): Record<string, string> {
  if (!palette) return {};
  const dark = isDarkSurfacePalette(palette);
  const surface: RampSurface = dark ? "dark" : "light";
  const ground =
    dark && palette.darkBackgroundColor
      ? palette.darkBackgroundColor
      : palette.backgroundColor ?? LIGHT_DEFAULT_GROUND;

  const vars: Record<string, string> = {};
  for (const role of rampRoleSpecs(palette)) {
    const seed = (dark ? role.dark : undefined) ?? role.light;
    if (!seed) continue;
    const ramp = deriveOklchRamp(seed, ground, surface);
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
 * Convert BrandTheme palette to a flat CSS variable map.
 * Emits light-mode vars by default. Dark-mode palette aliases use the
 * `--ds-color-dark-*` names consumed by ThemeProvider. For bundled tenants
 * the CSS artifact handles light/dark
 * splitting directly; these dark vars are consumed by DB-driven tenants
 * where runtime switching is needed.
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
  if (card?.background)
    vars["--ds-surface-card-bg"] = "var(--ds-surface-card)";
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
  const raised = surfaceRoles.raised;
  if (raised?.background)
    vars["--ds-color-surface-raised"] = "var(--ds-surface-raised)";

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
 */
const EXTENDED_PALETTE_CHANNELS: readonly (readonly [
  keyof BrandPalette,
  string,
])[] = [
  ["primaryHoverColor", "--ds-color-primary-hover"],
  ["secondaryHoverColor", "--ds-color-secondary-hover"],
  ["accentHoverColor", "--ds-color-accent-hover"],
  ["onPrimaryColor", "--ds-color-text-on-primary"],
  ["primaryForegroundColor", "--ds-color-primary-foreground"],
  ["textTertiaryColor", "--ds-color-text-tertiary"],
  ["borderColor", "--ds-color-border"],
  ["borderTertiaryColor", "--ds-color-border-tertiary"],
  ["borderSubtleColor", "--ds-color-border-subtle"],
  ["borderFocusColor", "--ds-color-border-focus"],
  ["backgroundSecondaryColor", "--ds-color-bg-secondary"],
  ["backgroundTertiaryColor", "--ds-color-bg-tertiary"],
  ["backgroundElevatedColor", "--ds-color-bg-elevated"],
  ["backgroundSurfaceColor", "--ds-color-bg-surface"],
  ["backgroundOverlayColor", "--ds-color-bg-overlay"],
  ["successBgColor", "--ds-color-success-bg"],
  ["successBorderColor", "--ds-color-success-border"],
  ["warningBgColor", "--ds-color-warning-bg"],
  ["warningBorderColor", "--ds-color-warning-border"],
  ["errorBgColor", "--ds-color-error-bg"],
  ["errorBorderColor", "--ds-color-error-border"],
  ["infoBgColor", "--ds-color-info-bg"],
  ["infoBorderColor", "--ds-color-info-border"],
  ["linkColor", "--ds-color-link"],
  ["linkHoverColor", "--ds-color-link-hover"],
  ["linkVisitedColor", "--ds-color-link-visited"],
  ["interactiveBorderColor", "--ds-color-interactive-border"],
  ["interactiveBgHoverColor", "--ds-color-interactive-bg-hover"],
  ["interactiveBgActiveColor", "--ds-color-interactive-bg-active"],
  ["interactiveBgMutedColor", "--ds-color-interactive-bg-muted"],
];

function setExtendedPaletteVariables(
  vars: Record<string, string>,
  palette: BrandPalette
): void {
  for (const [field, variable] of EXTENDED_PALETTE_CHANNELS) {
    const value = palette[field];
    if (typeof value === "string" && value) vars[variable] = value;
  }
}

function brandThemeToCssVariables(bt: BrandTheme): Record<string, string> {
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
  // Semantic posture — the static path's equivalent of the DB Appearance
  // compiler. Same canonical resolver, same single channel, so a code-owned
  // vertical is no longer limited to the structural scale. Absent posture
  // emits nothing: the channel's `var(…, 1)` default already is the identity,
  // so an explicit `1` would add no value while claiming the channel against
  // every lower-precedence writer — including a root `data-density` boundary
  // reached through an inline injection of this same variable map. The
  // expressive density default participates only where the theme itself is
  // silent, mirroring the DB path's field-default law.
  const authoredPosture =
    bt.surfaces?.density ?? expansion.fieldDefaults.density;
  if (isDensityPreference(authoredPosture)) {
    vars[DENSITY_MODE_FACTOR_VARIABLE] = String(
      resolveDensityModeFactor(authoredPosture),
    );
  }
  // Authored static motion stays above the profile default, matching the DB
  // field precedence. Duration-scale remains profile-owned because the legacy
  // BrandMotion contract has no equivalent authored field.
  Object.assign(
    vars,
    appearancePostureToVariables({
      motion:
        bt.motion?.intensity === undefined
          ? undefined
          : { intensity: bt.motion.intensity },
    }),
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
    const darkSurface = isDarkSurfacePalette(bt.palette);
    Object.assign(
      vars,
      derivePaletteSemantics({
        primary: darkSurface
          ? bt.palette.darkPrimaryColor ?? bt.palette.primaryColor
          : bt.palette.primaryColor,
        background: darkSurface
          ? bt.palette.darkBackgroundColor
          : bt.palette.backgroundColor,
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
    setExtendedPaletteVariables(vars, bt.palette);

    // Dark-mode palette aliases consumed by ThemeProvider.
    if (bt.palette.darkPrimaryColor)
      vars["--ds-color-dark-primary"] = bt.palette.darkPrimaryColor;
    if (bt.palette.darkSecondaryColor)
      vars["--ds-color-dark-secondary"] = bt.palette.darkSecondaryColor;
    if (bt.palette.darkAccentColor)
      vars["--ds-color-dark-accent"] = bt.palette.darkAccentColor;
    // The clear-mode ground. The dark twin is emitted by the generator's dark
    // block, which is the only place a `[data-theme='dark']` selector exists.
    if (bt.palette.backgroundColor) {
      vars["--ds-color-bg-primary"] = bt.palette.backgroundColor;
      vars["--ds-color-bg"] = bt.palette.backgroundColor;
      vars["--ds-color-background"] = bt.palette.backgroundColor;
    }
    if (bt.palette.darkBackgroundColor)
      vars["--ds-color-dark-bg"] = bt.palette.darkBackgroundColor;

    // The semantic control surface, which `--ds-surface-control` derives from and
    // every modern input control falls back to. It belongs here and not in the
    // chrome emitter: the generator applies chrome into the dark block too, so a
    // value emitted there is mode-blind and a light-authored tenant would paint
    // white controls on its own dark ground. The dark twin is emitted by the
    // generator's dark block, which is the only place that knows the mode.
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
      if (su.borderRadius.sm) vars["--ds-radius-sm"] = su.borderRadius.sm;
      if (su.borderRadius.md) vars["--ds-radius-md"] = su.borderRadius.md;
      if (su.borderRadius.lg) vars["--ds-radius-lg"] = su.borderRadius.lg;
      if (su.borderRadius.xl) vars["--ds-radius-xl"] = su.borderRadius.xl;
      if (su.borderRadius.full) vars["--ds-radius-full"] = su.borderRadius.full;
    }
    if (su.shadows) {
      if (su.shadows.sm) vars["--ds-shadow-sm"] = su.shadows.sm;
      if (su.shadows.md) vars["--ds-shadow-md"] = su.shadows.md;
      if (su.shadows.lg) vars["--ds-shadow-lg"] = su.shadows.lg;
      if (su.shadows.xl) vars["--ds-shadow-xl"] = su.shadows.xl;
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
  Object.assign(vars, deriveTenantColorRamps(bt.palette));
  setTintScaleVariables(vars, bt);
  setTypeRampVariables(vars);
  // `labelStyle` is an AUTHORED case decision and must sit in the authored
  // layer of the single role emitter — above any expressive profile overlay.
  // Historically it fed personality only, which let the label role channel
  // silently ignore it; the finer `typography.roles.label` surface still
  // wins over this mapping when both are authored.
  const authoredLabelCase: 'uppercase' | 'capitalize' | 'none' | undefined =
    bt.typography?.labelStyle === undefined
      ? undefined
      : bt.typography.labelStyle === 'uppercase'
        ? 'uppercase'
        : bt.typography.labelStyle === 'capitalize'
          ? 'capitalize'
          : 'none';
  const authoredRoles =
    authoredLabelCase === undefined
      ? bt.typography?.roles
      : {
          ...bt.typography?.roles,
          label: {
            textTransform: authoredLabelCase,
            ...bt.typography?.roles?.label,
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

const DEFAULT_SEMANTIC_TYPOGRAPHY: Record<
  (typeof SEMANTIC_TYPOGRAPHY_ROLES)[number],
  Required<SemanticTypographyRoleTokens>
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
    fontSize: "calc(0.875rem * var(--ds-type-scale, 1))",
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
    const overlay =
      profileOverlay?.[role as keyof ExpressiveTypeRoleOverlay];
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
      ...authored?.[role],
    };
    const kebabRole = role.replace(
      /[A-Z]/g,
      (letter) => `-${letter.toLowerCase()}`
    );
    const prefix = `--ds-type-${kebabRole}`;
    vars[`${prefix}-font-family`] = String(value.fontFamily);
    vars[`${prefix}-font-size`] = String(value.fontSize);
    vars[`${prefix}-font-weight`] = String(value.fontWeight);
    vars[`${prefix}-line-height`] = String(value.lineHeight);
    vars[`${prefix}-letter-spacing`] = String(value.letterSpacing);
    vars[`${prefix}-text-transform`] = String(value.textTransform);
    vars[`${prefix}-font-variant-numeric`] = String(value.fontVariantNumeric);
    vars[prefix] = `var(${prefix}-font-weight) var(${prefix}-font-size)/var(${prefix}-line-height) var(${prefix}-font-family)`;
  }
}

/**
 * Emit the closed tint scale --ds-tint-{4,8,12,16,24} per palette role.
 *
 * Each step is `color-mix(in oklch, <role> N%, var(--ds-color-bg-primary))`, so a
 * single role color (mixed over the page background) generates every interaction
 * tint instead of hand-picked rgba() values. Mixing in OKLCH (a perceptually-even
 * space) rather than sRGB keeps intermediate steps evenly spaced in perceived
 * lightness -- an sRGB mix compresses/expands unevenly depending on hue, most
 * visibly on saturated blues and greens. This is what lets a vertical drop a
 * foreign second blue and re-derive hover/active/selected/focus states from its
 * primary alone (one-blue law). The primary role is emitted UNSUFFIXED (the
 * canonical interaction scale — hover=tint-4, active/selected=tint-8, selected
 * row=tint-12, focus ring=tint-24); each status tone (success/warning/error/info)
 * carries a role suffix so a tinted pill reads bg = tint-8 of the tone and
 * border = tint-24 of the tone. A role is skipped when its palette color is
 * absent, so themes that omit a tone simply omit that tone's tints.
 */
function setTintScaleVariables(
  vars: Record<string, string>,
  bt: BrandTheme
): void {
  const palette = bt.palette;
  if (!palette) return;

  const roles: Array<{
    suffix: string;
    color: string | undefined;
    colorVar: string;
  }> = [
    { suffix: "", color: palette.primaryColor, colorVar: "--ds-color-primary" },
    {
      suffix: "success",
      color: palette.successColor,
      colorVar: "--ds-color-success",
    },
    {
      suffix: "warning",
      color: palette.warningColor,
      colorVar: "--ds-color-warning",
    },
    {
      suffix: "error",
      color: palette.errorColor,
      colorVar: "--ds-color-error",
    },
    { suffix: "info", color: palette.infoColor, colorVar: "--ds-color-info" },
  ];

  for (const { suffix, color, colorVar } of roles) {
    if (!color) continue;
    for (const step of TINT_STEPS) {
      const name = suffix ? `--ds-tint-${suffix}-${step}` : `--ds-tint-${step}`;
      vars[
        name
      ] = `color-mix(in oklch, var(${colorVar}) ${step}%, var(--ds-color-bg-primary))`;
    }
  }
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
    chrome: mergeModeOverlay(bt.chrome, overlay.chrome),
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
function compileModeBlocks(
  bt: BrandTheme,
  baseVars: Record<string, string>
): CompiledBrandModeBlock[] {
  const modes = bt.modes;
  if (!modes) return [];
  const defaultMode = bt.appearance?.defaultMode;
  const blocks: CompiledBrandModeBlock[] = [];
  for (const mode of ["light", "dark"] as const) {
    const overlay = modes[mode];
    if (!overlay) continue;
    if (mode === defaultMode) {
      throw new Error(
        `BrandTheme '${bt.id}' authors modes.${mode}, but ${mode} is its declared defaultMode. ` +
          `The default mode's values belong in the theme body; a mode overlay describes the OTHER mode.`
      );
    }
    const merged = applyModeOverlay(bt, overlay);
    const modeVars = {
      ...brandThemeToCssVariables(merged),
      ...brandThemeToChromeVariables(merged),
    };
    const cssVariables: Record<string, string> = {};
    for (const [key, value] of Object.entries(modeVars)) {
      if (baseVars[key] !== value) cssVariables[key] = value;
    }
    blocks.push({ mode, cssVariables, colorScheme: mode });
  }
  return blocks;
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
  return `html[data-tenant='${tenantSlug}'] {\n${declarations}\n}`;
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
  return `html[data-tenant='${tenantSlug}'][data-theme='${mode}'], html[data-tenant='${tenantSlug}'].${mode}`;
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
  bt: BrandTheme
): Record<string, string> {
  return chromeToVariables(bt.chrome);
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

export const compileBrandTheme: CompileBrandTheme = (
  input: BrandCompilerInput
): CompiledBrand => {
  const {
    brandTheme,
    tenantSlug,
    verticalPersonality,
    verticalTokenOverrides,
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
  const chromeVars = brandThemeToChromeVariables(brandTheme);
  const cssVariables = { ...paletteVars, ...chromeVars };

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
  const modeBlocks = compileModeBlocks(brandTheme, cssVariables);
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
    ...modeBlocks.map((block) =>
      buildModeCssString(block, tenantSlug)
    ),
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
