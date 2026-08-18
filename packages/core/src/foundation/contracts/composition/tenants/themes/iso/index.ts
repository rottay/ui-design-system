/**
 * @fileoverview Theme-ISO core contracts.
 *
 * T0 THEME-ISO: a single total nested `Theme`, an ingestion-only recursive
 * `ThemePatch`, and a fail-closed `resolveTheme`. Static first-party `.ts`
 * sources and DDB tenant documents are transports only: both resolve to the
 * same complete `Theme` and enter one `compileTheme` lowering.
 *
 * This module intentionally does NOT depend on the tenant-theme compiler,
 * so it can be imported by both the static compiler and the DDB compiler
 * without circularity.
 */

import type { EngineName } from "../../../../runtime/engine";
import type {
  ChartPersonalityTokens,
  CardPersonalityTokens,
  AccentPersonalityTokens,
  SurfaceTokens,
  SemanticSurfaceRoleMap,
} from "../../../../kernel/tokens";
import { SEMANTIC_SURFACE_ROLES } from "../../../../kernel/tokens/materials";
import { SEMANTIC_TYPOGRAPHY_ROLES } from "../../../../kernel/tokens/typography";
import type { FirstPartyVerticalId } from "../../../../kernel/verticals";
import type {
  BrandAppearance,
  BrandCapabilityAbsenceReason,
  BrandCapabilityCatalog,
  BrandCapabilityDisposition,
  BrandCapabilityId,
  BrandChrome,
  BrandColorRamp,
  BrandColorRamps,
  BrandExpressiveAxisOverrides,
  BrandExpressiveSelection,
  BrandMotion,
  BrandPalette,
  BrandPaletteAliases,
  BrandRampRole,
  BrandRampStep,
  BrandRecipeSelection,
  BrandResponsiveSelection,
  BrandSurfaces,
  BrandThemeModeOverlay,
  BrandThemeModes,
  BrandTypography,
  FirstPartyBrandTheme,
} from "..";
import type {
  TenantGlassTokens,
  TenantGradientTokens,
  TenantOverlayTokens,
} from "../../";
import { DEFAULT_CHROME_SHAPE } from "./shape";

/**
 * A governed family slot has a canonical shape with both structural keys present:
 * `value` carries the payload when active, `disposition` carries the reason when
 * inactive. This keeps the nested keypath set identical regardless of whether a
 * first-party vertical activates a given optional capability.
 */
export type Governed<T> = {
  readonly value: T;
  readonly disposition?: BrandCapabilityAbsenceReason;
};

/** Recursive partial: every object and array is optional at every depth. */
export type DeepPartial<T> = T extends object
  ? T extends ReadonlyArray<infer U>
    ? ReadonlyArray<DeepPartial<U>>
    : { [K in keyof T]?: DeepPartial<T[K]> }
  : T;

/**
 * The canonical total nested Theme. Metadata (`id`, `name`) never influences
 * lowering or channel names. Optional families are expressed through
 * `Governed<T>` and cross-checked against `capabilities`.
 *
 * For T0 the leaf optionality of the existing `Brand*` families is preserved
 * where derivation fills absent leaves; the totality is at the family/section
 * level (every family key is present and accounted for).
 */
export interface Theme {
  readonly id: FirstPartyVerticalId;
  readonly name: string;
  appearance: BrandAppearance;
  modes: BrandThemeModes;
  palette: BrandPalette;
  typography: BrandTypography;
  surfaces: BrandSurfaces;
  motion: Governed<BrandMotion>;
  charts: Governed<Partial<ChartPersonalityTokens>>;
  recipes: Governed<BrandRecipeSelection>;
  expressive: Governed<BrandExpressiveSelection>;
  responsive: Governed<BrandResponsiveSelection>;
  chrome: BrandChrome;
  engineBridge: Governed<Partial<Record<EngineName, Record<string, unknown>>>>;
  capabilities: BrandCapabilityCatalog;
}

/** Ingestion-only recursive patch. Never reaches the compiler directly. */
export type ThemePatch = DeepPartial<Omit<Theme, "id">>;

/** Envelope carrying a patch plus transport metadata outside the patch. */
export interface ThemePatchEnvelope {
  schemaVersion: string;
  source: "static" | "tenant-document-v1" | "appearance-compat";
  patch: ThemePatch;
}

/** True if the governed slot is active (no disposition is present). */
export function isGovernedActive<T>(g: Governed<T>): boolean {
  return g.disposition === undefined;
}

/** True if the governed slot carries a disposition. */
export function isGovernedDisposition<T>(g: Governed<T>): boolean {
  return g.disposition !== undefined;
}

/** Helper to build a governed active value. */
export function governedValue<T>(value: T): Governed<T> {
  return { value, disposition: undefined };
}

/** Helper to build a governed disabled disposition. */
export function governedDisabled<T>(
  reason: BrandCapabilityAbsenceReason,
  defaultValue: T
): Governed<T> {
  return { value: defaultValue, disposition: reason };
}

/**
 * Convert a complete Theme to the existing `FirstPartyBrandTheme` shape the
 * current compiler consumes. Governed fields unwrap to present/absent keys.
 */
export function themeToBrandTheme(theme: Theme): FirstPartyBrandTheme {
  const brand: FirstPartyBrandTheme = {
    id: theme.id,
    name: theme.name,
    appearance: theme.appearance,
    modes: theme.modes,
    palette: theme.palette,
    typography: theme.typography,
    surfaces: theme.surfaces,
    charts: isGovernedActive(theme.charts) ? theme.charts.value : {},
    chrome: theme.chrome,
    capabilities: theme.capabilities,
  };

  if (isGovernedActive(theme.motion)) brand.motion = theme.motion.value;
  if (isGovernedActive(theme.recipes)) brand.recipes = theme.recipes.value;
  if (isGovernedActive(theme.expressive))
    brand.expressive = theme.expressive.value;
  if (isGovernedActive(theme.responsive))
    brand.responsive = theme.responsive.value;
  if (isGovernedActive(theme.engineBridge))
    brand.engineBridge = theme.engineBridge.value;

  return brand;
}

function governedActiveValue<T>(g: Governed<T>): T | undefined {
  return isGovernedActive(g) ? g.value : undefined;
}

/**
 * `withAllKeys` only materializes the keys named here, so a declared
 * `BrandPalette` field missing from this list is absent from the bridged Theme
 * for every vertical that does not author it — which makes the nested keypath
 * set differ per vertical instead of being one shared structure.
 *
 * The list must therefore mirror the declared `BrandPalette` union exactly.
 *
 * ROTTAY-T1 migrated the `alpha*` channels, the six ground/ink names
 * (`bgHover`, `bgInfo`, `bgSubtle`, `neutralZero`, `primarySubtle`, `shadow`),
 * the four surface/text names and the `aliases` group out of the rottay
 * extension into this family; before they were enumerated here, rottay carried
 * keypaths BitHire and Evnto had no term for.
 */
const DEFAULT_PALETTE_KEYS: readonly (keyof BrandPalette)[] = [
  "primaryColor",
  "secondaryColor",
  "accentColor",
  "ramps",
  "primaryHoverColor",
  "secondaryHoverColor",
  "accentHoverColor",
  "onPrimaryColor",
  "primaryForegroundColor",
  "textPrimaryColor",
  "textSecondaryColor",
  "textMutedColor",
  "textTertiaryColor",
  "textDisabledColor",
  "borderPrimaryColor",
  "borderSecondaryColor",
  "borderColor",
  "borderTertiaryColor",
  "borderSubtleColor",
  "borderFocusColor",
  "backgroundColor",
  "backgroundSecondaryColor",
  "backgroundTertiaryColor",
  "backgroundElevatedColor",
  "backgroundSurfaceColor",
  "backgroundOverlayColor",
  "successColor",
  "warningColor",
  "errorColor",
  "infoColor",
  "successBgColor",
  "successBorderColor",
  "warningBgColor",
  "warningBorderColor",
  "errorBgColor",
  "errorBorderColor",
  "infoBgColor",
  "infoBorderColor",
  "infoInkColor",
  "linkColor",
  "linkHoverColor",
  "linkVisitedColor",
  "interactiveBorderColor",
  "interactiveBgHoverColor",
  "interactiveBgActiveColor",
  "interactiveBgMutedColor",
  "alphaBlack50",
  "alphaBlack100",
  "alphaWhite50",
  "alphaPrimary10",
  "alphaPrimary20",
  "alphaSecondary10",
  "alphaSecondary20",
  "alphaSuccess10",
  "alphaSuccess20",
  "alphaWarning10",
  "alphaWarning20",
  "alphaError10",
  "alphaError20",
  "alphaInfo10",
  "bgHoverColor",
  "bgInfoColor",
  "bgSubtleColor",
  "neutralZeroColor",
  "primarySubtleColor",
  "shadowColor",
  "surfaceColor",
  "surfaceMutedColor",
  "surfaceSecondaryColor",
  "textColor",
  "textInverseColor",
  "aliases",
];

/** Mirrors the declared `BrandPaletteAliases` union; see DEFAULT_PALETTE_KEYS. */
const DEFAULT_PALETTE_ALIASES_SHAPE: BrandPaletteAliases = {
  textPrimary: undefined,
  textSecondary: undefined,
  textTertiary: undefined,
  textDisabled: undefined,
  textInverse: undefined,
  borderColor: undefined,
  borderColorDefault: undefined,
  borderColorMuted: undefined,
  borderColorStrong: undefined,
  borderColorHover: undefined,
  borderColorFocus: undefined,
};

const DEFAULT_RAMP_ROLES: readonly BrandRampRole[] = [
  "primary",
  "secondary",
  "accent",
  "success",
  "warning",
  "error",
  "info",
  "neutral",
];

const DEFAULT_RAMP_STEPS: readonly BrandRampStep[] = [
  50, 100, 200, 300, 400, 500, 600, 700, 800, 900,
];

function defaultRampsShape(): BrandColorRamps {
  const ramps: Record<string, Record<string, undefined>> = {};
  for (const role of DEFAULT_RAMP_ROLES) {
    const ramp: Record<string, undefined> = {};
    for (const step of DEFAULT_RAMP_STEPS) {
      ramp[String(step)] = undefined;
    }
    ramps[role] = ramp;
  }
  return ramps as unknown as BrandColorRamps;
}

function normalizeRamps(ramps: BrandColorRamps | undefined): BrandColorRamps {
  const result = defaultRampsShape() as Record<string, Record<string, unknown>>;
  if (!ramps) return result as unknown as BrandColorRamps;
  for (const role of DEFAULT_RAMP_ROLES) {
    const sourceRamp = (ramps as Record<string, BrandColorRamp | undefined>)[
      role
    ];
    if (!sourceRamp) continue;
    const targetRamp = result[role];
    for (const step of DEFAULT_RAMP_STEPS) {
      const value = (sourceRamp as Record<string, unknown>)[String(step)];
      if (value !== undefined) targetRamp[String(step)] = value;
    }
  }
  return result as unknown as BrandColorRamps;
}

function normalizePalette(palette: BrandPalette): BrandPalette {
  return {
    ...palette,
    ramps: normalizeRamps(palette.ramps),
    aliases: mergeDefaultShape(
      DEFAULT_PALETTE_ALIASES_SHAPE,
      palette.aliases
    ) as BrandPaletteAliases,
  };
}

const DEFAULT_LETTER_SPACING_KEYS = [
  "display",
  "heading",
  "body",
  "mono",
] as const;
const DEFAULT_LINE_HEIGHT_KEYS = [
  "display",
  "heading",
  "body",
  "tight",
  "relaxed",
] as const;
const DEFAULT_SEMANTIC_TYPOGRAPHY_ROLE_KEYS = [
  "fontFamily",
  "fontSize",
  "fontWeight",
  "lineHeight",
  "letterSpacing",
  "textTransform",
  "fontVariantNumeric",
] as const;

function normalizeTypography(
  typography: BrandTypography | undefined
): BrandTypography {
  const base = withAllKeys(
    (typography ?? {}) as BrandTypography,
    DEFAULT_TYPOGRAPHY_KEYS
  );
  return {
    ...base,
    letterSpacing: withAllKeys(
      (base.letterSpacing ?? {}) as Record<string, string>,
      DEFAULT_LETTER_SPACING_KEYS as unknown as readonly (keyof typeof base.letterSpacing)[]
    ) as BrandTypography["letterSpacing"],
    lineHeight: withAllKeys(
      (base.lineHeight ?? {}) as Record<string, number>,
      DEFAULT_LINE_HEIGHT_KEYS as unknown as readonly (keyof typeof base.lineHeight)[]
    ) as BrandTypography["lineHeight"],
    roles: normalizeSemanticTypographyTokens(base.roles),
  };
}

function normalizeSemanticTypographyTokens(
  roles: BrandTypography["roles"] | undefined
): BrandTypography["roles"] {
  const result: Record<string, Record<string, unknown>> = {};
  for (const role of SEMANTIC_TYPOGRAPHY_ROLES) {
    const roleSource = roles?.[role] ?? {};
    const roleTarget: Record<string, unknown> = {};
    for (const key of DEFAULT_SEMANTIC_TYPOGRAPHY_ROLE_KEYS) {
      roleTarget[key] =
        (roleSource as Record<string, unknown>)[key] ?? undefined;
    }
    result[role] = roleTarget;
  }
  return result as BrandTypography["roles"];
}

const DEFAULT_CAPABILITY_IDS: readonly BrandCapabilityId[] = [
  "motion",
  "recipes",
  "expressive",
  "responsive",
  "engineBridge",
];

function normalizeCapabilities(
  capabilities: BrandCapabilityCatalog
): BrandCapabilityCatalog {
  const result = {} as Record<BrandCapabilityId, BrandCapabilityDisposition>;
  for (const id of DEFAULT_CAPABILITY_IDS) {
    const cap = capabilities[id];
    result[id] = {
      status: cap.status,
      reason: "reason" in cap ? cap.reason : undefined,
      note: "note" in cap ? cap.note : undefined,
    } as BrandCapabilityDisposition;
  }
  return result;
}

const DEFAULT_TYPOGRAPHY_KEYS: readonly (keyof BrandTypography)[] = [
  "typePairing",
  "scale",
  "fontFamilyBase",
  "fontFamilyHeading",
  "fontFamilyMono",
  "fontFamilyDisplay",
  "headingWeightBias",
  "headingLetterSpacing",
  "labelStyle",
  "roles",
  "letterSpacing",
  "lineHeight",
];

const DEFAULT_SURFACES_KEYS: readonly (keyof BrandSurfaces)[] = [
  "buttonStyle",
  "radiusScale",
  "elevation",
  "surface",
  "surfaceRoles",
  "materials",
  "borderRadius",
  "shadows",
  "glass",
  "gradients",
  "overlays",
  "densityScale",
  "density",
  "effectIntensity",
  "rhythm",
];

const DEFAULT_SURFACE_TOKENS_SHAPE: Partial<SurfaceTokens> = {
  borderWidth: undefined,
  borderStyle: undefined,
  useGradients: undefined,
  useGlass: undefined,
} as unknown as Partial<SurfaceTokens>;

const DEFAULT_SEMANTIC_SURFACE_ROLE_TOKENS_SHAPE = {
  background: undefined,
  backgroundHover: undefined,
  backgroundActive: undefined,
  backgroundSelected: undefined,
  backgroundDisabled: undefined,
  foreground: undefined,
  foregroundMuted: undefined,
  foregroundDisabled: undefined,
  border: undefined,
  borderStrong: undefined,
  borderHover: undefined,
  borderActive: undefined,
  borderSelected: undefined,
  borderDisabled: undefined,
  focusRing: undefined,
  shadow: undefined,
  shadowHover: undefined,
  shadowActive: undefined,
  shadowSelected: undefined,
  highlight: undefined,
  texture: undefined,
} as const;

function defaultSemanticSurfaceRoleMap(): SemanticSurfaceRoleMap {
  const map: Record<string, unknown> = {};
  for (const role of SEMANTIC_SURFACE_ROLES) {
    map[role] = { ...DEFAULT_SEMANTIC_SURFACE_ROLE_TOKENS_SHAPE };
  }
  return map as SemanticSurfaceRoleMap;
}

const DEFAULT_GLASS_SHAPE: TenantGlassTokens = {
  blur: undefined,
  background: undefined,
  border: undefined,
} as unknown as TenantGlassTokens;

const DEFAULT_GRADIENTS_SHAPE: TenantGradientTokens = {
  primary: undefined,
  surface: undefined,
  mesh: undefined,
} as unknown as TenantGradientTokens;

const DEFAULT_OVERLAYS_SHAPE: TenantOverlayTokens = {
  light: undefined,
  medium: undefined,
  heavy: undefined,
} as unknown as TenantOverlayTokens;

const DEFAULT_RADIUS_SHAPE: Partial<
  Record<"sm" | "md" | "lg" | "xl" | "full", string>
> = {
  sm: undefined,
  md: undefined,
  lg: undefined,
  xl: undefined,
  full: undefined,
};

/**
 * `mergeDefaultShape` walks `Object.keys(defaults)`, so a shadow field absent
 * from this shape is silently dropped on the BrandTheme -> Theme bridge. The
 * key set must therefore mirror the declared `BrandSurfaces["shadows"]` union
 * exactly — enumerating a subset is a lossy bridge, not a narrower contract.
 *
 * ROTTAY-T1 (G1 elevation ruling) migrated `xs`, `xxl`, `inner`, `focusRing`
 * and `focusRingError` out of the rottay extension into this family; before
 * this shape carried them, the static and Theme lowerings disagreed on those
 * five channels.
 */
const DEFAULT_SHADOWS_SHAPE: Partial<
  Record<
    | "xs"
    | "sm"
    | "md"
    | "lg"
    | "xl"
    | "xxl"
    | "inner"
    | "focusRing"
    | "focusRingError",
    string
  >
> = {
  xs: undefined,
  sm: undefined,
  md: undefined,
  lg: undefined,
  xl: undefined,
  xxl: undefined,
  inner: undefined,
  focusRing: undefined,
  focusRingError: undefined,
};

/**
 * The closed `--ds-elevation-0..5` ladder declared by `BrandSurfaces`. Same law
 * as DEFAULT_SHADOWS_SHAPE: the ladder is a declared family, so it is part of
 * the bridged shape for every vertical whether or not that vertical authors a
 * rung. ROTTAY-T1 (G1) moved the rottay ladder out of the extension into it.
 */
const DEFAULT_ELEVATIONS_SHAPE: Partial<
  Record<
    "level0" | "level1" | "level2" | "level3" | "level4" | "level5",
    string
  >
> = {
  level0: undefined,
  level1: undefined,
  level2: undefined,
  level3: undefined,
  level4: undefined,
  level5: undefined,
};

function normalizeSurfaces(surfaces: BrandSurfaces | undefined): BrandSurfaces {
  const base: BrandSurfaces = {
    buttonStyle: undefined,
    radiusScale: undefined,
    elevation: undefined,
    elevations: DEFAULT_ELEVATIONS_SHAPE,
    surface: DEFAULT_SURFACE_TOKENS_SHAPE as Partial<SurfaceTokens>,
    surfaceRoles: defaultSemanticSurfaceRoleMap(),
    materials: defaultSemanticSurfaceRoleMap(),
    borderRadius: DEFAULT_RADIUS_SHAPE,
    shadows: DEFAULT_SHADOWS_SHAPE,
    glass: DEFAULT_GLASS_SHAPE,
    gradients: DEFAULT_GRADIENTS_SHAPE,
    overlays: DEFAULT_OVERLAYS_SHAPE,
    densityScale: undefined,
    density: undefined,
    effectIntensity: undefined,
    rhythm: undefined,
  };
  if (!surfaces) return base;
  return {
    ...base,
    ...surfaces,
    surface: mergeDefaultShape(
      DEFAULT_SURFACE_TOKENS_SHAPE as SurfaceTokens,
      surfaces.surface
    ) as Partial<SurfaceTokens>,
    surfaceRoles: mergeDefaultShape(
      defaultSemanticSurfaceRoleMap(),
      surfaces.surfaceRoles
    ) as SemanticSurfaceRoleMap,
    materials: mergeDefaultShape(
      defaultSemanticSurfaceRoleMap(),
      surfaces.materials
    ) as SemanticSurfaceRoleMap,
    borderRadius: mergeDefaultShape(
      DEFAULT_RADIUS_SHAPE,
      surfaces.borderRadius
    ),
    shadows: mergeDefaultShape(DEFAULT_SHADOWS_SHAPE, surfaces.shadows),
    elevations: mergeDefaultShape(
      DEFAULT_ELEVATIONS_SHAPE,
      surfaces.elevations
    ),
    glass: mergeDefaultShape(DEFAULT_GLASS_SHAPE, surfaces.glass),
    gradients: mergeDefaultShape(DEFAULT_GRADIENTS_SHAPE, surfaces.gradients),
    overlays: mergeDefaultShape(DEFAULT_OVERLAYS_SHAPE, surfaces.overlays),
  };
}

const DEFAULT_MOTION_SHAPE: BrandMotion = {
  intensity: undefined,
  durationScale: undefined,
  ambient: undefined,
  entrance: undefined,
  entranceDuration: undefined,
  hoverLift: undefined,
  hoverScale: undefined,
  useSpring: undefined,
  springTension: undefined,
  springFriction: undefined,
  pulseSpeed: undefined,
  skeletonStyle: undefined,
  staggerDelay: undefined,
  staggerMax: undefined,
  countUpEnabled: undefined,
} as unknown as BrandMotion;

const DEFAULT_CHARTS_SHAPE: Partial<ChartPersonalityTokens> = {
  animateOnMount: undefined,
  mountDuration: undefined,
  lineStyle: undefined,
  showDots: undefined,
  useGradientFill: undefined,
  tooltipStyle: undefined,
  colorScheme: undefined,
  categoryColors: undefined,
} as unknown as Partial<ChartPersonalityTokens>;

const DEFAULT_EXPRESSIVE_AXIS_OVERRIDES_SHAPE: BrandExpressiveAxisOverrides = {
  type: undefined,
  geometry: undefined,
  edge: undefined,
  material: undefined,
  elevation: undefined,
  motif: undefined,
  icon: undefined,
} as unknown as BrandExpressiveAxisOverrides;

const DEFAULT_RECIPE_SHAPE: BrandRecipeSelection = {
  schemaVersion: undefined,
  profile: undefined,
} as unknown as BrandRecipeSelection;

const DEFAULT_EXPRESSIVE_SHAPE: BrandExpressiveSelection = {
  schemaVersion: undefined,
  experienceProfile: undefined,
  profiles: DEFAULT_EXPRESSIVE_AXIS_OVERRIDES_SHAPE,
} as unknown as BrandExpressiveSelection;

const DEFAULT_RESPONSIVE_SHAPE: BrandResponsiveSelection = {
  schemaVersion: undefined,
  posture: undefined,
} as unknown as BrandResponsiveSelection;

const DEFAULT_ENGINE_BRIDGE_SHAPE: Partial<
  Record<EngineName, Record<string, unknown>>
> = {};

const DEFAULT_MODE_OVERLAY_SHAPE: BrandThemeModeOverlay = {
  palette: withAllKeys({} as BrandPalette, DEFAULT_PALETTE_KEYS),
  typography: withAllKeys({} as BrandTypography, DEFAULT_TYPOGRAPHY_KEYS),
  surfaces: normalizeSurfaces({}),
  chrome: DEFAULT_CHROME_SHAPE as unknown as BrandChrome,
};

const DEFAULT_MODES_SHAPE: BrandThemeModes = {
  light: DEFAULT_MODE_OVERLAY_SHAPE,
  dark: DEFAULT_MODE_OVERLAY_SHAPE,
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

/**
 * Merge a partial source over a total default shape, preserving every default
 * key while replacing primitives and shallow-recursing into nested objects.
 * Used for chrome sections where spreading would wipe out a whole subtree.
 */
function mergeDefaultShape<T extends object>(
  defaults: T,
  source: Partial<T> | undefined
): T {
  if (!source) return defaults;
  const result = {} as T;
  for (const key of Object.keys(defaults) as Array<keyof T>) {
    const defaultVal = defaults[key];
    const sourceVal = source[key];
    if (isPlainObject(defaultVal) && isPlainObject(sourceVal)) {
      result[key] = mergeDefaultShape(
        defaultVal as Record<string, unknown>,
        sourceVal as Record<string, unknown>
      ) as T[typeof key];
    } else {
      result[key] =
        sourceVal !== undefined ? (sourceVal as T[typeof key]) : defaultVal;
    }
  }
  return result;
}

/**
 * Complete a sparse authored chrome container to the canonical shape: every
 * shape key present (undefined where unauthored), in shape order. This is the
 * SAME completion the ISO bridge applies to `Theme.chrome` and to every mode
 * overlay's chrome, exported so the compiler's mode-merge point can present
 * both transports with an identically-keyed merge base.
 */
export function completeChromeShape(
  chrome: BrandChrome | undefined
): BrandChrome {
  return mergeDefaultShape(
    DEFAULT_CHROME_SHAPE as unknown as BrandChrome,
    chrome
  );
}

function withAllKeys<T extends object>(obj: T, keys: readonly (keyof T)[]): T {
  const result = {} as T;
  for (const key of keys) {
    (result as Record<string, unknown>)[key as string] = undefined;
  }
  for (const [key, val] of Object.entries(obj)) {
    (result as Record<string, unknown>)[key] = val;
  }
  return result;
}

function normalizeModeOverlays(
  modes: BrandThemeModes | undefined
): BrandThemeModes {
  const result: Record<string, BrandThemeModeOverlay> = {};
  for (const mode of ["light", "dark"] as const) {
    const overlay = modes?.[mode] ?? {};
    result[mode] = {
      palette: normalizePalette(
        withAllKeys(
          (overlay.palette ?? {}) as BrandPalette,
          DEFAULT_PALETTE_KEYS
        )
      ),
      typography: normalizeTypography(overlay.typography),
      surfaces: normalizeSurfaces(overlay.surfaces),
      chrome: mergeDefaultShape(
        DEFAULT_CHROME_SHAPE as unknown as BrandChrome,
        overlay.chrome
      ),
    };
  }
  return result as BrandThemeModes;
}

/**
 * Convert an existing first-party BrandTheme to the ISO `Theme` shape.
 * Optional families are classified active/disabled from `capabilities`.
 */
export function brandThemeToTheme(brand: FirstPartyBrandTheme): Theme {
  const governedFor = <T extends object>(
    value: T | undefined,
    defaultShape: T,
    id: keyof BrandCapabilityCatalog
  ): Governed<T> => {
    const cap = brand.capabilities[id];
    if (value !== undefined && cap.status === "active") {
      return {
        value: mergeDefaultShape(defaultShape, value as Partial<T>),
        disposition: undefined,
      };
    }
    if (cap.status === "disabled") {
      return { value: defaultShape, disposition: cap.reason };
    }
    return { value: defaultShape, disposition: "not-authored" };
  };

  return {
    id: brand.id,
    name: brand.name,
    appearance: brand.appearance,
    modes: normalizeModeOverlays(brand.modes),
    palette: normalizePalette(withAllKeys(brand.palette, DEFAULT_PALETTE_KEYS)),
    typography: normalizeTypography(brand.typography),
    surfaces: normalizeSurfaces(brand.surfaces),
    motion: brand.motion
      ? governedValue({ ...DEFAULT_MOTION_SHAPE, ...brand.motion })
      : {
          value: DEFAULT_MOTION_SHAPE,
          disposition: "superseded",
        },
    charts: governedValue({
      ...DEFAULT_CHARTS_SHAPE,
      ...(brand.charts ?? {}),
    }),
    recipes: governedFor(brand.recipes, DEFAULT_RECIPE_SHAPE, "recipes"),
    expressive: governedFor(
      brand.expressive,
      DEFAULT_EXPRESSIVE_SHAPE,
      "expressive"
    ),
    responsive: governedFor(
      brand.responsive,
      DEFAULT_RESPONSIVE_SHAPE,
      "responsive"
    ),
    chrome: mergeDefaultShape(
      DEFAULT_CHROME_SHAPE as unknown as BrandChrome,
      brand.chrome
    ),
    engineBridge: governedFor(
      brand.engineBridge,
      DEFAULT_ENGINE_BRIDGE_SHAPE,
      "engineBridge"
    ),
    capabilities: normalizeCapabilities(brand.capabilities),
  };
}

/** Fail-closed deep merge. Any key in `patch` that is not in `base` throws. */
function mergeDeep(base: unknown, patch: unknown, path: string): unknown {
  if (patch === undefined) return base;

  if (patch === null || typeof patch !== "object" || Array.isArray(patch)) {
    return patch;
  }

  if (
    base === null ||
    base === undefined ||
    typeof base !== "object" ||
    Array.isArray(base)
  ) {
    throw new Error(
      `resolveTheme: cannot patch object at ${path} over ${typeof base}`
    );
  }

  const baseObj = base as Record<string, unknown>;
  const patchObj = patch as Record<string, unknown>;
  const result: Record<string, unknown> = { ...baseObj };

  // Supplying a governed value is an explicit activation. A DB transport may
  // select a profile even when the code-owned vertical has an `unassigned`
  // default; retaining that old disposition would silently discard the value.
  if (
    Object.prototype.hasOwnProperty.call(baseObj, "value") &&
    Object.prototype.hasOwnProperty.call(baseObj, "disposition") &&
    Object.prototype.hasOwnProperty.call(patchObj, "value") &&
    !Object.prototype.hasOwnProperty.call(patchObj, "disposition")
  ) {
    result.disposition = undefined;
  }

  for (const key of Object.keys(patchObj)) {
    if (!(key in baseObj)) {
      throw new Error(
        `resolveTheme: unknown key "${key}" at ${path}; ThemePatch is ingestion-only`
      );
    }
    result[key] = mergeDeep(
      baseObj[key],
      patchObj[key],
      path ? `${path}.${key}` : key
    );
  }

  return result;
}

/**
 * Resolve a base Theme against one or more ThemePatches. Fail-closed:
 * - unknown keys throw
 * - type mismatches throw
 * - governed fields accept either a governed shape or an active value, but
 *   a disposition that is not a known absence reason throws.
 */
export function resolveTheme(base: Theme, ...patches: ThemePatch[]): Theme {
  let current: Theme = base;
  for (const [idx, patch] of patches.entries()) {
    if (!patch || typeof patch !== "object") {
      throw new Error(`resolveTheme: patch[${idx}] is not an object`);
    }
    current = mergeDeep(current, patch, "$") as Theme;
  }
  return current;
}

/** Hard deny-list for product/vertical/slug-derived token vocabulary. */
export const THEME_NAME_DENY_LIST =
  /event|ticket|dashboard|rottay|bithire|evnto|--rt-/i;

/** True if a keypath or channel name violates the universal-name law. */
export function violatesThemeNameLaw(name: string): boolean {
  return THEME_NAME_DENY_LIST.test(name);
}

const CANONICAL_THEME_KEY_ORDER: readonly (keyof Theme)[] = [
  "id",
  "name",
  "appearance",
  "modes",
  "palette",
  "typography",
  "surfaces",
  "motion",
  "charts",
  "recipes",
  "expressive",
  "responsive",
  "chrome",
  "engineBridge",
  "capabilities",
];

const CANONICAL_CHROME_SECTION_ORDER: readonly (keyof BrandChrome)[] = [
  "card",
  "surface",
  "accent",
  "sidebar",
  "layout",
  "shell",
  "toolbar",
  "filterPill",
  "badge",
  "breadcrumb",
  "search",
  "controls",
  "table",
  "cardComponent",
  "premiumCard",
  "metricCard",
  "signalCard",
  "workspaceCard",
  "compactCard",
  "tallCard",
  "collectionCard",
  "listingGrid",
  "list",
  "detail",
  "modal",
  "tooltip",
  "popover",
  "tabs",
  "alert",
  "anchor",
  "avatar",
  "backTop",
  "calendar",
  "collapse",
  "descriptions",
  "drawer",
  "dropdown",
  "empty",
  "floatButton",
  "liveFeed",
  "menu",
  "message",
  "notification",
  "pagination",
  "progress",
  "result",
  "skeleton",
  "spinner",
  "statistic",
  "statsGrid",
  "steps",
  "tag",
  "timeline",
  "tree",
];

/**
 * Return a Theme with every canonical chrome section present (empty object if
 * the source does not author it). This makes the section structure a mirror
 * across the three first-party themes while preserving value differences.
 */
export function mirrorChromeSections(theme: Theme): Theme {
  const chrome = theme.chrome ?? {};
  const chromeRecord = chrome as unknown as Record<string, unknown>;
  const mirroredChrome: Record<string, unknown> = {};
  for (const key of CANONICAL_CHROME_SECTION_ORDER) {
    mirroredChrome[key] = chromeRecord[key] ?? {};
  }
  return { ...theme, chrome: mirroredChrome as unknown as BrandChrome };
}

/** Return a Theme with canonical top-level and chrome-section key ordering. */
export function canonicalizeTheme(theme: Theme): Theme {
  const ordered: Record<string, unknown> = {};
  const themeRecord = theme as unknown as Record<string, unknown>;
  for (const key of CANONICAL_THEME_KEY_ORDER) {
    ordered[key] = themeRecord[key];
  }

  const chrome = theme.chrome ?? {};
  const chromeRecord = chrome as unknown as Record<string, unknown>;
  const orderedChrome: Record<string, unknown> = {};
  for (const key of CANONICAL_CHROME_SECTION_ORDER) {
    const value = chromeRecord[key];
    if (value !== undefined) orderedChrome[key] = value;
  }
  ordered.chrome = orderedChrome;

  return ordered as unknown as Theme;
}

/**
 * The set of Theme keypaths a tenant actually authored, in BRANDTHEME space.
 *
 * There is no separate provenance map: a `ThemePatch` IS the authorship
 * record, because the only way a path can appear in it is that the tenant
 * document put it there. Reading authorship off the patch keeps `mergeDeep`
 * and `resolveTheme` -- the most load-bearing fail-closed functions in this
 * plane -- byte-for-byte untouched.
 */
export type TenantAuthoredPaths = ReadonlySet<string>;

/**
 * `themeToBrandTheme` unwraps `.value` for exactly these six governed roots
 * (see :147-159), so a patch path such as `motion.value.intensity` names the
 * BrandTheme path `motion.intensity`. Collecting in one space and consuming in
 * another is how a provenance set silently stops matching, so the strip
 * happens here, once, beside the unwrap it mirrors.
 */
const GOVERNED_UNWRAPPED_ROOTS: readonly string[] = [
  "charts",
  "motion",
  "recipes",
  "expressive",
  "responsive",
  "engineBridge",
];

/**
 * Collect the tenant-authored paths of a patch, normalized to BrandTheme space.
 *
 * Deliberately an over-approximation in one direction only: it enumerates
 * intermediate container keys as well as leaves. That is harmless because the
 * only consumers are two closed field vocabularies (see
 * `CONSULTED_PROVENANCE_FIELDS`), and the mP6 fence proves the profile-filled
 * paths never intersect them.
 */
export function collectPatchAuthoredPaths(
  patch: ThemePatch
): TenantAuthoredPaths {
  const authored = new Set<string>();
  for (const path of collectThemeKeypaths(patch)) {
    const [root, second] = path.split(".");
    authored.add(
      second === "value" && GOVERNED_UNWRAPPED_ROOTS.includes(root)
        ? [root, ...path.split(".").slice(2)].join(".")
        : path
    );
  }
  return authored;
}

/**
 * The CLOSED vocabulary of Theme fields any provenance decision may consult.
 *
 * Provenance is deliberately not a general capability: it is read at exactly
 * two compiler sites (the primary-seed derivation and the sidebar tone/leaf
 * contest), and each of those consults a small, named table. This set is the
 * union of those two tables and is the single authority they are checked
 * against, so a third site cannot quietly start asking about a field nobody
 * agreed to make provenance-sensitive.
 *
 * Membership is by BrandTheme-space path WITHOUT a mode prefix; a mode block
 * consults `modes.<mode>.<field>` as well through `isTenantAuthoredField`.
 *
 * Two properties are enforced executably rather than asserted in prose:
 * the two site tables must union to EXACTLY this set, and the paths a
 * profile fill materializes must not intersect it (the mP6 fence) -- because
 * a profile default that landed on a consulted field would be read as tenant
 * authorship and would silently promote a rank-0 producer to rank 4.
 */
export const CONSULTED_PROVENANCE_FIELDS: ReadonlySet<string> = new Set([
  // -- primary-seed derivation (the seed, then the leaves that shadow each
  //    channel the seed would otherwise re-derive)
  "palette.primaryColor",
  "palette.primaryForegroundColor",
  "palette.borderFocusColor",
  "palette.linkColor",
  "palette.linkHoverColor",
  "chrome.controls.buttonPrimary.bg",
  "chrome.controls.buttonPrimary.bgHover",
  "chrome.controls.buttonPrimary.border",
  "chrome.controls.buttonPrimary.color",
  "chrome.controls.buttonPrimary.text",
  "chrome.controls.input.borderFocus",
  "chrome.controls.input.shadowFocus",
  // -- sidebar tone versus the tenant's own explicit leaves
  "chrome.sidebar.tone",
  "chrome.sidebar.bg",
  "chrome.sidebar.text",
  "chrome.sidebar.textMuted",
  "chrome.sidebar.itemBgHover",
  "chrome.sidebar.itemBgActive",
  "chrome.sidebar.itemColorActive",
]);

/**
 * Did the tenant author `field` for the block being compiled?
 *
 * A mode block compiles from base + overlay, so a base-authored tenant leaf is
 * still the tenant's statement inside that mode: both spellings count. The
 * base block, which no overlay reaches, consults the bare path only.
 */
export function isTenantAuthoredField(
  authoredPaths: TenantAuthoredPaths,
  field: string,
  /** "" for the base block, "modes.<mode>." for a mode overlay block. */
  modePrefix = ""
): boolean {
  if (authoredPaths.has(field)) return true;
  return modePrefix !== "" && authoredPaths.has(`${modePrefix}${field}`);
}

/** Recursively collect every object key in a Theme (metadata values ignored). */
export function collectThemeKeypaths(value: unknown, prefix = ""): string[] {
  if (value === null || value === undefined) return [];
  if (typeof value !== "object") return [];
  if (Array.isArray(value)) return [];

  const paths: string[] = [];
  const obj = value as Record<string, unknown>;
  for (const key of Object.keys(obj)) {
    const full = prefix ? `${prefix}.${key}` : key;
    paths.push(full);
    paths.push(...collectThemeKeypaths(obj[key], full));
  }
  return paths;
}
