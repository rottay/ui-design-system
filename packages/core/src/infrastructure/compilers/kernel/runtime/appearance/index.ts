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

import type {
  TenantAppearance,
  TenantAppearanceGeneral,
  TenantAppearanceAdvanced,
} from '@/foundation/contracts/composition/tenants/themes';
import { MOTION_DIAL_BOUNDS } from '@/foundation/contracts/runtime/motion';
import {
  TENANT_THEME_RADIUS_SCALE_BOUNDS_V1,
  TENANT_THEME_TYPE_SCALE_BOUNDS_V1,
} from '@/foundation/contracts/composition/tenants/themes/tenant-theme';
import {
  RAMP_STEPS,
  deriveOklchRamp,
  type RampSurface,
} from '@/foundation/kernel/color/oklch/ramp';
import { deriveChartSeriesPalette } from '@/foundation/kernel/color/oklch/chart-series';
import { TYPE_PAIRINGS } from '@/foundation/tokens/ts/presentation/typography/pairings';
import {
  clampValue,
  isHexColor,
  isValidCssColor,
  normalizeHexColor,
} from '../../foundation/css/color-math';
import { chromeToVariables } from '../../foundation/css/chrome-variables';
import { TENANT_THEME_CONFIG_V1_SCHEMA } from '../../foundation/schemas/tenant-theme';

/** Raw tokenOverrides entry cap; the schema limits object is the sole authority. */
const MAX_TOKEN_OVERRIDES: number =
  TENANT_THEME_CONFIG_V1_SCHEMA.limits.maxTokenOverrides;

// ── Validation helpers ──────────────────────────────────────

/** Only set a CSS color var if the value is a valid CSS color. */
function setColor(vars: Record<string, string>, key: string, value: string | undefined): void {
  if (value && isValidCssColor(value)) vars[key] = value;
}

/** Set any CSS var (non-color values like fonts, padding, etc). */
function setVar(vars: Record<string, string>, key: string, value: string | number | undefined | null): void {
  if (value != null) vars[key] = String(value);
}

// ── General tier ──────────────────────────────────────────

// Density and type-scale are resolved inside useTokens() (hooks/tokens/index.ts)
// as numeric factors that multiply the spacing array and font sizes. They are NOT
// emitted as CSS variables because that would require every consumer to use calc(),
// which is a paradigm shift not justified by the current audience.

/** Button shape presets map to a --ds-radius-button value. */
const BUTTON_STYLE_RADIUS: Record<string, string> = {
  sharp: '2px',
  soft: 'var(--ds-radius-md, 8px)',
  pill: '9999px',
};

/** Elevation presets map to shadow scales. */
const ELEVATION_PRESET: Record<string, Record<string, string>> = {
  flat: {
    '--ds-elevation-1': 'none',
    '--ds-elevation-2': 'none',
    '--ds-elevation-3': '0 1px 2px rgba(0,0,0,0.05)',
  },
  soft: {}, // use DS defaults
  elevated: {
    '--ds-elevation-1': '0 2px 4px rgba(0,0,0,0.08)',
    '--ds-elevation-2': '0 4px 8px rgba(0,0,0,0.1)',
    '--ds-elevation-3': '0 8px 16px rgba(0,0,0,0.12)',
  },
};

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
    setColor(vars, '--ds-color-primary', p.primary);
    setColor(vars, '--ds-color-secondary', p.secondary);
    setColor(vars, '--ds-color-accent', p.accent);
    // backgroundMode is consumed by ThemeProvider, not a CSS variable
  }

  // Typography — font families are real CSS vars consumed by engines.
  // The pairing preset applies first; explicit free-form families still win.
  if (general.typography) {
    const t = general.typography;
    if (t.typePairing) {
      const pairing = TYPE_PAIRINGS[t.typePairing];
      if (pairing) {
        vars['--ds-font-family-heading'] = pairing.heading;
        vars['--ds-font-family-base'] = pairing.base;
        if ('mono' in pairing && pairing.mono) vars['--ds-font-family-mono'] = pairing.mono;
        vars['--ds-letter-spacing-heading'] = pairing.headingLs;
        vars['--ds-line-height-display'] = String(pairing.displayLh);
      }
    }
    if (t.fontFamilyBase) vars['--ds-font-family-base'] = t.fontFamilyBase;
    if (t.fontFamilyHeading) vars['--ds-font-family-heading'] = t.fontFamilyHeading;
    if (typeof t.scale === 'number' && Number.isFinite(t.scale)) {
      setVar(
        vars,
        '--ds-type-scale',
        clampValue(
          t.scale,
          TENANT_THEME_TYPE_SCALE_BOUNDS_V1.min,
          TENANT_THEME_TYPE_SCALE_BOUNDS_V1.max,
        ),
      );
    }
  }

  // Shape — buttonStyle maps to a real CSS var consumed by engines
  if (general.shape?.buttonStyle) {
    const r = BUTTON_STYLE_RADIUS[general.shape.buttonStyle];
    if (r) vars['--ds-radius-button'] = r;
  }
  if (
    typeof general.shape?.radiusScale === 'number'
    && Number.isFinite(general.shape.radiusScale)
  ) {
    setVar(
      vars,
      '--ds-radius-scale',
      clampValue(
        general.shape.radiusScale,
        TENANT_THEME_RADIUS_SCALE_BOUNDS_V1.min,
        TENANT_THEME_RADIUS_SCALE_BOUNDS_V1.max,
      ),
    );
  }

  // Density is consumed by useTokens() as a JS factor, not a CSS variable.

  // Motion is consumed by MotionProvider as structured data. These variables
  // keep the same bounded values available to CSS-only pre-hydration seams.
  if (general.motion) {
    const { intensity, durationScale, ambient } = general.motion;
    if (typeof intensity === 'number' && Number.isFinite(intensity)) {
      setVar(
        vars,
        '--ds-motion-intensity',
        clampValue(
          intensity,
          MOTION_DIAL_BOUNDS.intensity.min,
          MOTION_DIAL_BOUNDS.intensity.max,
        ),
      );
    }
    if (typeof durationScale === 'number' && Number.isFinite(durationScale)) {
      setVar(
        vars,
        '--ds-motion-duration-scale',
        clampValue(
          durationScale,
          MOTION_DIAL_BOUNDS.durationScale.min,
          MOTION_DIAL_BOUNDS.durationScale.max,
        ),
      );
    }
    if (ambient === 'off' || ambient === 'subtle') {
      setVar(vars, '--ds-motion-ambient', ambient);
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

  // Surfaces / elevation
  if (general.surfaces?.elevation) {
    const preset = ELEVATION_PRESET[general.surfaces.elevation];
    if (preset) Object.assign(vars, preset);
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

/**
 * Convert the full TenantAppearance into CSS custom property overrides.
 * General is applied first, then Advanced layers on top.
 */
export function appearanceToVariables(
  appearance: TenantAppearance
): Record<string, string> {
  const vars: Record<string, string> = {};

  if (appearance.general) {
    Object.assign(vars, appearanceGeneralToVariables(appearance.general));
  }

  if (appearance.advanced) {
    Object.assign(vars, appearanceAdvancedToVariables(appearance.advanced));
  }

  // Derived ramps are compiler-owned output. Apply them after Advanced so a
  // broad runtime Appearance object cannot accidentally arbitrate ramp names;
  // TenantTheme's closed schema rejects those names at the DB boundary too.
  // The chart-series seed is read BEFORE the ramp merge: dual (light-dark)
  // emission may rewrite `--ds-color-primary` into a non-hex function value.
  const chartSeriesSeed = vars['--ds-color-primary'];
  Object.assign(vars, deriveAppearanceColorRamps(appearance.general ?? {}, vars));

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
