/**
 * @fileoverview Appearance compiler — bridges TenantAppearance into runtime shapes.
 *
 * Converts the DB-safe TenantAppearanceGeneral and TenantAppearanceAdvanced
 * contracts into the existing runtime primitives (branding, tokenOverrides,
 * chrome CSS variables) so the merge chain stays unified.
 *
 * Merge order in the runtime:
 *   DS base -> vertical -> BrandTheme -> Appearance General -> Appearance Advanced
 *
 * General produces safe, bounded overrides (palette colors, font families,
 * radius scale factor, density preset, etc.).
 * Advanced produces fine-grained overrides (chrome, raw token overrides).
 */

import { withArabicSafeFallback } from '@/foundation/kernel/typography';
import type {
  TenantAppearance,
  TenantAppearanceGeneral,
  TenantAppearanceAdvanced,
} from '@/foundation/contracts/composition/tenants/themes';
import {
  TENANT_THEME_EFFECT_INTENSITY_BOUNDS,
  TENANT_THEME_TYPE_SCALE_BOUNDS,
} from '@/foundation/contracts/composition/tenants/themes/tenant-theme';
import {
  RAMP_STEPS,
  deriveOklchRamp,
  type RampSurface,
} from '@/foundation/kernel/color/oklch/ramp';
import { deriveChartSeriesPalette } from '@/foundation/kernel/color/oklch/chart-series';
import {
  enforceTextContrast,
  type TextContrastResult,
} from '@/foundation/kernel/accessibility/branding-contrast/text-contrast-autocorrect';
import { contrastRatio } from '@/foundation/kernel/color/contrast';
import {
  ON_TONE_ROLES,
  deriveReadableInk,
  onToneChannel,
} from '@/infrastructure/compilers/kernel/foundation/css/color-math/readable-ink';
import {
  resolveExpressiveAxes,
  sanitizeExpressiveOverrides,
} from '@/foundation/tokens/ts/presentation/expressive-profiles';
import {
  expandExpressiveProfiles,
  type ExpressiveFieldDefaultSet,
} from '@/foundation/tokens/ts/presentation/expressive-profiles/expansion';
import { appearancePostureToVariables } from '../../foundation/css/appearance-posture';
import {
  clampValue,
  isHexColor,
  isValidCssColor,
  normalizeHexColor,
} from '../../foundation/css/color-math';
import { chromeToVariables } from '../../foundation/css/chrome-variables';
import {
  deriveGroundLadder,
  derivePaletteSemantics,
  type GroundLadder,
} from '../../foundation/css/color-math/palette-derivations';
import { TENANT_THEME_CONFIG_SCHEMA } from '../../foundation/schemas/tenant-theme';

/** Raw tokenOverrides entry cap; the schema limits object is the sole authority. */
const MAX_TOKEN_OVERRIDES: number =
  TENANT_THEME_CONFIG_SCHEMA.limits.maxTokenOverrides;

// ── Validation helpers ──────────────────────────────────────

/** Only set a CSS color var if the value is a valid CSS color. */
function setColor(vars: Record<string, string>, key: string, value: string | undefined): void {
  if (value && isValidCssColor(value)) vars[key] = value;
}

/** Set any CSS var (non-color values like fonts, padding, etc). */
function setVar(vars: Record<string, string>, key: string, value: string | number | undefined | null): void {
  if (value != null) vars[key] = String(value);
}

function resolveModeColor(
  light: string | undefined,
  dark: string | undefined,
  mode: "light" | "dark" | "auto" | undefined,
): string | undefined {
  if (mode === "dark") return dark ?? light;
  if (mode === "auto" && light && dark) return `light-dark(${light}, ${dark})`;
  // Under auto a dark-only value belongs to the dark half and must not become
  // the clear-scheme base. The mode-specific ramp compiler consumes it later.
  return light;
}

function setResolvedColor(
  vars: Record<string, string>,
  key: string,
  light: string | undefined,
  dark: string | undefined,
  mode: "light" | "dark" | "auto" | undefined,
): void {
  const value = resolveModeColor(light, dark, mode);
  if (value) setVar(vars, key, value);
}

/**
 * Compiler-owned readable ink for every hex status tone in the FINAL merged
 * map: `--ds-color-on-{success,warning,error,info}`. Runs after Advanced so a
 * tenant that overrides `--ds-color-error` drags its on-error ink along; a
 * tenant without a hex tone emits nothing and the DS root floor decides. The
 * derivation itself is the shared `readable-ink` module, so the static path
 * cannot drift from this math.
 */
function deriveAppearanceOnToneInks(
  compiledBaseVariables: Readonly<Record<string, string>>,
): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const role of ON_TONE_ROLES) {
    const seed = compiledBaseVariables[`--ds-color-${role}`];
    if (!seed || !isHexColor(seed)) continue;
    vars[onToneChannel(role)] = deriveReadableInk(seed);
  }
  return vars;
}

/**
 * Combine the light and dark halves of a derivation into one emission.
 *
 * A channel whose two halves agree — every `var()`-chained alias, because the
 * chain re-resolves against whichever seed the active scheme declares — stays
 * a single mode-blind value. Only a channel whose halves genuinely differ
 * (real math on a mode's own seed) becomes a `light-dark()` pair, which is
 * what keeps the emitted map as small as the tenant's actual divergence.
 */
function mergeDerivedModeHalves(
  light: Record<string, string>,
  dark: Record<string, string> | undefined,
): Record<string, string> {
  if (!dark) return light;
  const merged: Record<string, string> = {};
  for (const channel of new Set([...Object.keys(light), ...Object.keys(dark)])) {
    const lightValue = light[channel];
    const darkValue = dark[channel];
    if (lightValue && darkValue) {
      merged[channel] =
        lightValue === darkValue
          ? lightValue
          : `light-dark(${lightValue}, ${darkValue})`;
    } else {
      merged[channel] = lightValue ?? darkValue;
    }
  }
  return merged;
}

// ── General tier ──────────────────────────────────────────

// Type-scale is resolved both through CSS and useTokens. Density follows the
// same split-runtime contract: appearance emits only the semantic mode factor;
// the structural engine/vertical/brand/tenant scale remains a separate channel.

/**
 * Code-owned fallback grounds for the single palette admitted by Appearance
 * v1. The final compiled surface wins when it is a concrete hex color.
 * `auto` is deliberately light-first: v1 does not carry independent light and
 * dark seeds/grounds, so pretending to derive two honest ramps would make SSR
 * and hydration depend on ambient browser state. A future schema can add dual
 * palettes without changing this deterministic v2 artifact contract.
 */
const APPEARANCE_RAMP_GROUNDS: Record<RampSurface, string> = {
  light: '#FFFFFF',
  dark: '#0C0C0E',
};

const FUNCTIONAL_RAMP_SEED_WEIGHTS = [8, 16, 28, 42, 64, 100, 84, 66, 48, 28] as const;

function deriveFunctionalOklchRamp(
  seed: string,
  surface: RampSurface,
  ground: string,
): Record<number, string> {
  const far = surface === 'dark' ? APPEARANCE_RAMP_GROUNDS.light : '#161616';

  return Object.fromEntries(RAMP_STEPS.map((step, index) => {
    const seedWeight = FUNCTIONAL_RAMP_SEED_WEIGHTS[index];
    const mixTarget = index <= 5 ? ground : far;
    return [step, seedWeight === 100
      ? seed
      : `color-mix(in oklch, ${seed} ${seedWeight}%, ${mixTarget})`];
  }));
}

type TenantAppearanceDarkSeeds = NonNullable<
  NonNullable<TenantAppearanceGeneral['palette']>['dark']
>;

/**
 * Ground for the dark half of a dual (`auto` + dark seeds) derivation. The
 * authored dark background wins; `--ds-color-dark-bg` (a legal tokenOverride)
 * is the fallback; the code-owned dark ground anchors the rest. The generic
 * light-first resolver is not reused here because under `auto` its
 * `--ds-color-bg-primary` candidate is the tenant's LIGHT canvas.
 */
function resolveAppearanceDarkGround(
  darkSeeds: TenantAppearanceDarkSeeds | undefined,
  compiledBaseVariables: Readonly<Record<string, string>>,
): string {
  const authored = darkSeeds?.background;
  if (authored && isHexColor(authored)) return normalizeHexColor(authored);
  const declared = compiledBaseVariables['--ds-color-dark-bg'];
  if (declared && isHexColor(declared)) return normalizeHexColor(declared);
  return APPEARANCE_RAMP_GROUNDS.dark;
}

function resolveAppearanceRampGround(
  surface: RampSurface,
  compiledBaseVariables: Readonly<Record<string, string>>,
): string {
  const candidates = surface === 'dark'
    ? ['--ds-color-dark-bg', '--ds-color-bg-primary']
    : ['--ds-color-bg-primary', '--ds-color-background', '--ds-color-bg'];
  for (const name of candidates) {
    const candidate = compiledBaseVariables[name];
    if (candidate && isHexColor(candidate)) return normalizeHexColor(candidate);
  }
  return APPEARANCE_RAMP_GROUNDS[surface];
}

/**
 * Derive compiler-owned ramps for every final semantic base color. General
 * supplies primary/secondary/accent; legal Advanced overrides may replace
 * those bases and add success/warning/error/info before this final projection.
 *
 * Hex seeds use the concrete, gamut-mapped OKLCH derivation shared with
 * BrandTheme. Other CSS Color v1 inputs remain backwards compatible through a
 * deterministic CSS `color-mix(in oklch, ...)` projection. Advanced data never
 * authors ramp names: `appearanceToVariables` derives and applies them last.
 */
export function deriveAppearanceColorRamps(
  general: TenantAppearanceGeneral,
  compiledBaseVariables: Readonly<Record<string, string>> = appearanceGeneralToVariables(general),
): Record<string, string> {
  const palette = general.palette;
  const surface: RampSurface = palette?.backgroundMode === 'dark' ? 'dark' : 'light';
  const ground = resolveAppearanceRampGround(surface, compiledBaseVariables);
  const vars: Record<string, string> = {};

  // Dual emission is only honest under `auto` with authored dark seeds; a
  // single-mode tenant keeps today's deterministic single-value ramps.
  const darkSeeds = palette?.backgroundMode === 'auto' ? palette.dark : undefined;
  const dualActive =
    darkSeeds !== undefined
    && Object.values(darkSeeds).some(
      (seed) => typeof seed === 'string' && isValidCssColor(seed),
    );
  const darkGround = dualActive
    ? resolveAppearanceDarkGround(darkSeeds, compiledBaseVariables)
    : APPEARANCE_RAMP_GROUNDS.dark;

  for (const role of [
    'primary', 'secondary', 'accent', 'success', 'warning', 'error', 'info',
  ] as const) {
    const seed = compiledBaseVariables[`--ds-color-${role}`];
    if (!seed || !isValidCssColor(seed)) continue;
    const ramp = isHexColor(seed)
      ? deriveOklchRamp(normalizeHexColor(seed), ground, surface)
      : deriveFunctionalOklchRamp(seed, surface, ground);
    if (!dualActive) {
      for (const step of RAMP_STEPS) vars[`--ds-color-${role}-${step}`] = ramp[step];
      continue;
    }
    const authoredDarkSeed =
      role === 'primary' || role === 'secondary' || role === 'accent'
        ? darkSeeds?.[role]
        : undefined;
    const darkSeed =
      authoredDarkSeed && isValidCssColor(authoredDarkSeed) ? authoredDarkSeed : seed;
    const darkRamp = isHexColor(darkSeed)
      ? deriveOklchRamp(normalizeHexColor(darkSeed), darkGround, 'dark')
      : deriveFunctionalOklchRamp(darkSeed, 'dark', darkGround);
    for (const step of RAMP_STEPS) {
      vars[`--ds-color-${role}-${step}`] = `light-dark(${ramp[step]}, ${darkRamp[step]})`;
    }
    if (darkSeed !== seed) {
      vars[`--ds-color-${role}`] = `light-dark(${seed}, ${darkSeed})`;
    }
  }

  // Consumed by the theme bridge; the artifact block stays custom-properties-only.
  if (dualActive) vars['--ds-color-scheme'] = 'light dark';

  return vars;
}

/**
 * Convert TenantAppearanceGeneral into a flat Record of CSS custom property
 * overrides that can be merged into the runtime token chain.
 */
export function appearanceGeneralToVariables(
  general: TenantAppearanceGeneral
): Record<string, string> {
  const vars: Record<string, string> = {};

  // Palette (validated - invalid colors are silently skipped)
  if (general.palette) {
    const p = general.palette;
    const mode = p.backgroundMode;

    // Semantic defaults FIRST, from the SAME derivation module the static
    // BrandTheme compiler uses, so a DB tenant and a code-owned vertical
    // cannot drift in vocabulary or in math. Everything below restates its own
    // channels and therefore wins, as does Advanced, which merges after
    // General — the derivation only reaches channels nobody authored. Each
    // mode half is derived from its own seeds and the halves are combined into
    // `light-dark()` only where they actually differ, so the `var()`-chained
    // channels stay mode-blind single values.
    const darkSeeds = {
      primary: p.dark?.primary ?? p.primary,
      background: p.dark?.background ?? p.background,
    };
    Object.assign(
      vars,
      mergeDerivedModeHalves(
        derivePaletteSemantics(
          mode === 'dark'
            ? darkSeeds
            : { primary: p.primary, background: p.background },
        ),
        mode === 'auto' ? derivePaletteSemantics(darkSeeds) : undefined,
      ),
    );

    setColor(
      vars,
      '--ds-color-primary',
      mode === 'dark' ? p.dark?.primary ?? p.primary : p.primary,
    );
    setColor(
      vars,
      '--ds-color-secondary',
      mode === 'dark' ? p.dark?.secondary ?? p.secondary : p.secondary,
    );
    setColor(
      vars,
      '--ds-color-accent',
      mode === 'dark' ? p.dark?.accent ?? p.accent : p.accent,
    );
    const background = resolveModeColor(p.background, p.dark?.background, mode);
    if (background) {
      setVar(vars, '--ds-color-bg-primary', background);
      setVar(vars, '--ds-color-bg', background);
      setVar(vars, '--ds-color-background', background);
    }
    setResolvedColor(
      vars,
      '--ds-color-text-primary',
      p.foreground?.primary,
      p.dark?.foreground?.primary,
      mode,
    );
    setResolvedColor(
      vars,
      '--ds-color-text-secondary',
      p.foreground?.secondary,
      p.dark?.foreground?.secondary,
      mode,
    );
    setResolvedColor(
      vars,
      '--ds-color-text-muted',
      p.foreground?.muted,
      p.dark?.foreground?.muted,
      mode,
    );
    setResolvedColor(
      vars,
      '--ds-color-text-disabled',
      p.foreground?.disabled,
      p.dark?.foreground?.disabled,
      mode,
    );
    setResolvedColor(
      vars,
      '--ds-color-border-primary',
      p.border?.primary,
      p.dark?.border?.primary,
      mode,
    );
    setResolvedColor(
      vars,
      '--ds-color-border-secondary',
      p.border?.secondary,
      p.dark?.border?.secondary,
      mode,
    );

    // Surface family + primary ink derivation. Without these channels the
    // canonical surface/on-primary tokens fall through to the dark base
    // `:root` values inside a light DB-tenant theme (K4 evidence: measured
    // 1.19:1 live pairs under a DB appearance). The derivation mirrors the
    // first-party artifact grammar (dark canvas: 5%/2.5% white lifts, the
    // default theme's own elevation distances; light canvas: tenant-tinted
    // near-white, the static artifacts' pure-white card grammar) and still
    // loses to Advanced tokenOverrides, which merge after General.
    const resolvedPrimary = mode === 'dark' ? p.dark?.primary ?? p.primary : p.primary;
    if (
      mode === 'auto' &&
      p.primary &&
      isHexColor(p.primary) &&
      p.dark?.primary &&
      isHexColor(p.dark.primary)
    ) {
      setVar(
        vars,
        '--ds-color-text-on-primary',
        `light-dark(${deriveReadableInk(p.primary)}, ${deriveReadableInk(p.dark.primary)})`,
      );
    } else if (resolvedPrimary && isHexColor(resolvedPrimary)) {
      setVar(vars, '--ds-color-text-on-primary', deriveReadableInk(resolvedPrimary));
    }

    // The ladder itself now lives in the shared derivation module, so the DB
    // path and the static path cannot drift apart; this tier keeps only the
    // `light-dark()` pairing, which is a DB-only concern.
    const emitSurfaces = (
      light: GroundLadder,
      dark?: GroundLadder,
    ): void => {
      const channel = {
        secondary: '--ds-color-bg-secondary',
        tertiary: '--ds-color-bg-tertiary',
        elevated: '--ds-color-bg-elevated',
        input: '--ds-color-bg-input',
      } as const;
      for (const key of Object.keys(channel) as Array<keyof typeof channel>) {
        setVar(
          vars,
          channel[key],
          dark ? `light-dark(${light[key]}, ${dark[key]})` : light[key],
        );
      }
    };
    const lightBg =
      p.background && isHexColor(p.background) ? normalizeHexColor(p.background) : undefined;
    const darkBg =
      p.dark?.background && isHexColor(p.dark.background)
        ? normalizeHexColor(p.dark.background)
        : undefined;
    if (mode === 'auto' && lightBg && darkBg) {
      emitSurfaces(deriveGroundLadder(lightBg), deriveGroundLadder(darkBg));
    } else {
      const resolvedBg = mode === 'dark' ? darkBg ?? lightBg : lightBg;
      if (resolvedBg) emitSurfaces(deriveGroundLadder(resolvedBg));
    }

    if (mode === 'auto' && p.dark && Object.keys(p.dark).length > 0) {
      vars['--ds-color-scheme'] = 'light dark';
    }
  }

  // Bounded semantic postures have one lowering shared with BrandTheme.
  Object.assign(
    vars,
    appearancePostureToVariables({
      typePairing: general.typography?.typePairing,
      buttonStyle: general.shape?.buttonStyle,
      radiusScale: general.shape?.radiusScale,
      density: general.density,
      motion: general.motion,
      elevation: general.surfaces?.elevation,
    }),
  );

  // Typography — free-form families and scale override the pairing preset.
  if (general.typography) {
    const t = general.typography;
    if (t.fontFamilyBase)
      vars['--ds-font-family-base'] = withArabicSafeFallback(t.fontFamilyBase);
    if (t.fontFamilyHeading)
      vars['--ds-font-family-heading'] = withArabicSafeFallback(
        t.fontFamilyHeading
      );
    if (typeof t.scale === 'number' && Number.isFinite(t.scale)) {
      setVar(
        vars,
        '--ds-type-scale',
        clampValue(
          t.scale,
          TENANT_THEME_TYPE_SCALE_BOUNDS.min,
          TENANT_THEME_TYPE_SCALE_BOUNDS.max,
        ),
      );
    }
  }

  // Navigation — sidebarTone maps to real sidebar chrome variables
  if (general.navigation?.sidebarTone) {
    const tone = general.navigation.sidebarTone;
    switch (tone) {
      case 'subtle':
        vars['--ds-sidebar-bg'] = 'var(--ds-color-bg-secondary)';
        vars['--ds-sidebar-text'] = 'var(--ds-color-text-primary)';
        vars['--ds-sidebar-text-muted'] = 'var(--ds-color-text-muted)';
        vars['--ds-sidebar-item-bg-hover'] = 'var(--ds-color-bg-hover)';
        vars['--ds-sidebar-item-bg-active'] = 'var(--ds-color-primary-100)';
        vars['--ds-sidebar-item-color-active'] = 'var(--ds-color-primary)';
        break;
      case 'strong':
        vars['--ds-sidebar-bg'] = 'var(--ds-color-primary-900)';
        vars['--ds-sidebar-text'] = 'var(--ds-color-white)';
        vars['--ds-sidebar-text-muted'] = 'var(--ds-color-neutral-400)';
        vars['--ds-sidebar-item-bg-hover'] = 'var(--ds-color-primary-800)';
        vars['--ds-sidebar-item-bg-active'] = 'var(--ds-color-primary-700)';
        vars['--ds-sidebar-item-color-active'] = 'var(--ds-color-white)';
        break;
      case 'inverse':
        vars['--ds-sidebar-bg'] = 'var(--ds-color-neutral-900)';
        vars['--ds-sidebar-text'] = 'var(--ds-color-neutral-100)';
        vars['--ds-sidebar-text-muted'] = 'var(--ds-color-neutral-500)';
        vars['--ds-sidebar-item-bg-hover'] = 'var(--ds-color-neutral-800)';
        vars['--ds-sidebar-item-bg-active'] = 'var(--ds-color-neutral-700)';
        vars['--ds-sidebar-item-color-active'] = 'var(--ds-color-white)';
        break;
    }
  }

  // Surfaces / elevation is emitted by the shared posture lowering above.
  if (
    typeof general.surfaces?.effectIntensity === 'number'
    && Number.isFinite(general.surfaces.effectIntensity)
  ) {
    setVar(
      vars,
      '--ds-effect-intensity',
      clampValue(
        general.surfaces.effectIntensity,
        TENANT_THEME_EFFECT_INTENSITY_BOUNDS.min,
        TENANT_THEME_EFFECT_INTENSITY_BOUNDS.max,
      ),
    );
  }

  // media (logo/logoMark/favicon) removed from contract — no CSS reader exists.
  // Re-add when sidebar/header components consume --ds-tenant-logo vars.

  return vars;
}

// ── Advanced tier ─────────────────────────────────────────

/**
 * Convert TenantAppearanceAdvanced into a flat Record of CSS custom property
 * overrides. Chrome values use the same variable namespace as brandThemeToChromeVariables.
 *
 * Full chrome parity with BrandTheme: ~140 CSS variables across all categories.
 */
export function appearanceAdvancedToVariables(
  advanced: TenantAppearanceAdvanced
): Record<string, string> {
  const vars: Record<string, string> = {};

  if (advanced.chrome) {
    // Chrome mapping is shared with runtime/brand-theme via
    // kernel/css/chrome-variables — TenantAppearanceAdvanced.chrome and
    // BrandTheme.chrome are the same shape.
    Object.assign(vars, chromeToVariables(advanced.chrome));
  }

  // ── Raw token overrides (allowlisted, capped by the schema limits object) ──
  if (advanced.tokenOverrides) {
    let count = 0;
    for (const [key, value] of Object.entries(advanced.tokenOverrides)) {
      if (count >= MAX_TOKEN_OVERRIDES) break;
      if (key.startsWith('--ds-') && value != null) {
        vars[key] = String(value);
        count++;
      }
    }
  }

  return vars;
}

// ── Combined ──────────────────────────────────────────────

/** Envelope ranges a caller may clamp expressive field defaults against. */
export interface ExpressiveClampRanges {
  radiusScale?: { min: number; max: number };
  motionIntensity?: { min: number; max: number };
  motionDurationScale?: { min: number; max: number };
}

/**
 * Apply expressive-profile FIELD defaults to the general appearance —
 * only where the tenant left the field unset, so authored dials always win.
 *
 * Density, motion and the pairing/silhouette/posture enums ride fields
 * instead of expansion variables because they have JS consumers (useTokens,
 * MotionProvider) and single field emitters: defaulting the field keeps CSS
 * and JS reading the same effective value through the same single writer.
 * Numeric defaults are additionally clamped into the vertical envelope when
 * the caller provides it (profile data is DS-reviewed, but a vertical's
 * envelope is law and a profile must never be a bypass around it).
 *
 * Returns the SAME reference when nothing applies, so profile-less
 * documents keep an identical normalized appearance and digest.
 */
export function withExpressiveFieldDefaults(
  general: TenantAppearanceGeneral | undefined,
  fieldDefaults: ExpressiveFieldDefaultSet,
  ranges?: ExpressiveClampRanges
): TenantAppearanceGeneral | undefined {
  const clampInto = (
    value: number,
    bounds?: { min: number; max: number }
  ): number =>
    bounds ? Math.min(bounds.max, Math.max(bounds.min, value)) : value;

  const source = general ?? {};
  let next: TenantAppearanceGeneral | undefined;
  const target = (): TenantAppearanceGeneral => (next ??= { ...source });

  if (fieldDefaults.typePairing && !source.typography?.typePairing) {
    target().typography = {
      ...source.typography,
      typePairing: fieldDefaults.typePairing,
    };
  }
  if (
    fieldDefaults.buttonStyle !== undefined &&
    source.shape?.buttonStyle === undefined
  ) {
    target().shape = { ...target().shape, buttonStyle: fieldDefaults.buttonStyle };
  }
  if (
    fieldDefaults.radiusScale !== undefined &&
    source.shape?.radiusScale === undefined
  ) {
    target().shape = {
      ...target().shape,
      radiusScale: clampInto(fieldDefaults.radiusScale, ranges?.radiusScale),
    };
  }
  if (fieldDefaults.density && source.density === undefined) {
    target().density = fieldDefaults.density;
  }
  if (fieldDefaults.motion && source.motion === undefined) {
    const motion = fieldDefaults.motion;
    target().motion = {
      ...(motion.intensity !== undefined
        ? { intensity: clampInto(motion.intensity, ranges?.motionIntensity) }
        : {}),
      ...(motion.durationScale !== undefined
        ? {
            durationScale: clampInto(
              motion.durationScale,
              ranges?.motionDurationScale
            ),
          }
        : {}),
      ...(motion.ambient !== undefined ? { ambient: motion.ambient } : {}),
    };
  }
  if (fieldDefaults.elevation && source.surfaces?.elevation === undefined) {
    target().surfaces = {
      ...source.surfaces,
      elevation: fieldDefaults.elevation,
    };
  }
  return next ?? general;
}

/**
 * Convert the full TenantAppearance into CSS custom property overrides.
 * The expressive expansion seeds the map first (profile layer), then
 * General, then Advanced — later writes win, so every authored value
 * outranks its profile default while post-merge derivations keep running
 * over the complete map.
 */
export function appearanceToVariables(
  appearance: TenantAppearance
): Record<string, string> {
  const expressiveAxes = resolveExpressiveAxes(
    appearance.general?.experienceProfile,
    sanitizeExpressiveOverrides(appearance.advanced?.profiles)
  );
  const expansion = expandExpressiveProfiles(expressiveAxes);
  // The authoritative artifact path pre-applies these defaults WITH the
  // vertical envelope in compileTenantThemeConfig; re-applying here is a
  // no-op there (fields already set) and keeps the compat/preview path,
  // which has no envelope, honest about the same profile.
  const general = withExpressiveFieldDefaults(
    appearance.general,
    expansion.fieldDefaults
  );

  const vars: Record<string, string> = { ...expansion.variables };

  if (general) {
    Object.assign(vars, appearanceGeneralToVariables(general));
  }

  if (appearance.advanced) {
    Object.assign(vars, appearanceAdvancedToVariables(appearance.advanced));
  }

  // Typography safety is a final compiler invariant, not merely a General-tier
  // convenience. Advanced raw overrides are allowed to replace the front of
  // these stacks, but cannot remove the Arabic-safe fallback.
  for (const key of [
    '--ds-font-family-base',
    '--ds-font-family-heading',
    '--ds-font-family-display',
  ] as const) {
    if (vars[key]) vars[key] = withArabicSafeFallback(vars[key]);
  }

  // Derived ramps are compiler-owned output. Apply them after Advanced so a
  // broad runtime Appearance object cannot accidentally arbitrate ramp names;
  // TenantTheme's closed schema rejects those names at the DB boundary too.
  // The chart-series seed is read BEFORE the ramp merge: dual (light-dark)
  // emission may rewrite `--ds-color-primary` into a non-hex function value.
  const chartSeriesSeed = vars['--ds-color-primary'];
  Object.assign(vars, deriveAppearanceColorRamps(appearance.general ?? {}, vars));
  Object.assign(vars, deriveAppearanceOnToneInks(vars));

  // Generated categorical series are compiler-owned and always emitted when a
  // concrete seed exists. Tenant-authored `--ds-chart-category-N` stays the
  // authoritative channel in the palette resolver's fallback chain.
  if (chartSeriesSeed && isHexColor(chartSeriesSeed)) {
    const mode = appearance.general?.palette?.backgroundMode ?? 'light';
    const surface: RampSurface = mode === 'dark' ? 'dark' : 'light';
    const grounds: string[] = [];
    if (mode !== 'dark') grounds.push(resolveAppearanceRampGround('light', vars));
    if (mode === 'dark') grounds.push(resolveAppearanceRampGround('dark', vars));
    if (mode === 'auto') {
      grounds.push(
        resolveAppearanceDarkGround(appearance.general?.palette?.dark, vars),
      );
    }
    const series = deriveChartSeriesPalette(
      normalizeHexColor(chartSeriesSeed),
      grounds,
      surface,
    );
    series.forEach((color, index) => {
      vars[`--ds-chart-series-${index + 1}`] = color;
    });
  }

  return vars;
}

/**
 * Compile Appearance for a runtime consumer that will actually paint UI.
 *
 * `appearanceToVariables()` intentionally remains the deterministic raw
 * projection used by low-level compiler tests and composition passes. Runtime
 * providers and generated tenant CSS must use this function instead so the
 * exact same APCA autocorrection contract protects both first-party compiled
 * artifacts and DB-authored Appearance documents.
 *
 * Returning the full contrast result keeps adjustments and unverifiable pairs
 * observable by tenant editors instead of silently mutating authored colors.
 */
export function compileAppearanceVariables(
  appearance: TenantAppearance
): TextContrastResult {
  return enforceTextContrast(appearanceToVariables(appearance), appearance);
}
