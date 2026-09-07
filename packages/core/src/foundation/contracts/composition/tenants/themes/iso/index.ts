/**
 * @fileoverview Theme-ISO core contracts.
 *
 * T0 THEME-ISO: a single total nested `Theme`, an ingestion-only recursive
 * `ThemeLayerPatch`, and a fail-closed `mergeThemePatches`. Static first-party `.ts`
 * sources and DDB tenant documents are transports only: both resolve to the
 * same complete `Theme` and enter one `compileTheme` lowering.
 *
 * This module intentionally does NOT depend on the tenant-theme compiler,
 * so it can be imported by both the static compiler and the DDB compiler
 * without circularity.
 */

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
import { BRAND_CAPABILITY_ABSENCE_REASONS } from "./capability-absence";
import { themeLeafKinds, themeLeafOptions, type ThemeLeafKind } from "./schema";
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
  /**
   * The theme's own identity, used as the compile's diagnostic label.
   *
   * `string`, not the first-party union: a customer's resolved theme is a
   * `Theme` too, and the DB arm labels its compile with the tenant's slug.
   * `FirstPartyBrandTheme.id` stays narrowed — that narrowing is what makes the
   * roster's slug derivation a compile-time fact — but narrowing it HERE would
   * mean only three tenants in the world can be lowered.
   */
  readonly id: string;
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
  capabilities: BrandCapabilityCatalog;
}

/**
 * Ingestion-only recursive patch over the resolved `Theme`. It is a LAYER the
 * resolver merges, not a thing a tenant authors: what a tenant authors is
 * `ThemePatch` (decisions and sanctioned overrides) in `contracts/theme`.
 *
 * `id` and `name` are excluded. A patch that could restate the identity of the
 * theme it patches would let a document rename the tenant it belongs to, which
 * `assertThemeIntent` also refuses at runtime for a patch that arrives as JSON.
 */
export type ThemeLayerPatch = DeepPartial<Omit<Theme, "id" | "name">>;

/** Envelope carrying a patch plus transport metadata outside the patch. */
export interface ThemePatchEnvelope {
  schemaVersion: string;
  source: "static" | "tenant-document-v1";
  patch: ThemeLayerPatch;
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
  "textPageColor",
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
  // Iterate by ENTRIES, not by computed reads off `T` / `Partial<T>`.
  //
  // `T extends object` includes functions, and a mapped type over a bare type
  // parameter is opaque to the checker, so `defaults[key]` / `source[key]` are
  // indistinguishable from a capability escape (`obj[k].constructor` reaching
  // `Function`) to the dependency-honesty analyser that guards this package's
  // runtime edges. `Object.entries` carries the same own enumerable string
  // keys in the same order and hands the values over directly, so this reads
  // exactly what the computed form read, with nothing left to prove.
  const sourceValues = new Map(
    Object.entries(source as Record<string, unknown>)
  );
  const result = {} as T;
  for (const [key, defaultVal] of Object.entries(
    defaults as Record<string, unknown>
  )) {
    const slot = key as keyof T;
    const sourceVal = sourceValues.get(key);
    if (isPlainObject(defaultVal) && isPlainObject(sourceVal)) {
      result[slot] = mergeDefaultShape(
        defaultVal as Record<string, unknown>,
        sourceVal as Record<string, unknown>
      ) as T[typeof slot];
    } else {
      result[slot] =
        sourceVal !== undefined
          ? (sourceVal as T[typeof slot])
          : (defaultVal as T[typeof slot]);
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
    capabilities: normalizeCapabilities(brand.capabilities),
  };
}

/**
 * What a merge node IS, for the purpose of refusing a mismatch.
 *
 * `typeof` alone answers `"object"` for an array and for `null`, which is the
 * distinction the whole container rule turns on.
 */
function nodeKind(value: unknown): string {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value;
}

/** Kinds a `ThemeLayerPatch` leaf may carry. `DeepPartial<Theme>` admits no others. */
const LEAF_KINDS = new Set<ThemeLeafKind | string>(["string", "number", "boolean"]);

/**
 * A `ThemeLayerPatch` container is a PLAIN record.
 *
 * `typeof value === "object"` admits `new Date()`, `/re/`, `new Map()` and
 * every class instance. A `Date` and a `RegExp` carry no own string keys, so
 * the merge walked zero of them and reported the family as applied while
 * changing nothing; a class instance carries its fields as own keys, so its
 * values were merged INTO the Theme through a container the contract never
 * declared. An object built with `Object.create(proto)` is refused by the same
 * rule, which is what closes inherited keys: the merge reads own keys only, so
 * an inherited one would otherwise be dropped in silence.
 *
 * Arrays stay outside this predicate on purpose -- they are the one non-plain
 * container the schema declares, and `assertArrayPatch` owns them.
 */
function isPlainPatchRecord(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value) as object | null;
  return prototype === Object.prototype || prototype === null;
}

/** What to call a refused container, without reading its `constructor`. */
function containerTag(value: unknown): string {
  const tag = Object.prototype.toString.call(value).slice(8, -1);
  return tag === "Object" ? "class instance" : tag;
}

/**
 * Refuse a leaf whose kind the Theme does not declare at this keypath.
 *
 * `DeepPartial<Omit<Theme, "id">>` narrows every leaf to the type the Theme
 * declares, and a JS caller never saw that type. Without this, an ingested
 * document could put a number on `palette.primaryColor`, a `null` on a string,
 * or a function on a boolean, and the merge would hand it straight to the
 * lowering, which then writes it into a CSS channel.
 *
 * The DECLARATION decides, not the baseline value. A baseline is a sample: it
 * says nothing about an optional leaf it leaves `undefined`, nothing about the
 * elements of an empty array, and it wrongly narrows the 44 leaves the contract
 * declares as `number | string` to whichever of the two that theme happened to
 * author. `themeLeafKinds` is the canonical schema; the baseline is consulted
 * only where the schema declares an opaque value.
 */
function assertLeafKind(base: unknown, patch: unknown, path: string): void {
  const kind = nodeKind(patch);
  if (!LEAF_KINDS.has(kind)) {
    throw new Error(
      `mergeThemePatches: ${kind} at ${path} is not a ThemeLayerPatch leaf; ` +
        `the admissible kinds are ${[...LEAF_KINDS].join(", ")}`
    );
  }
  if (kind === "number" && !Number.isFinite(patch as number)) {
    throw new Error(
      `mergeThemePatches: non-finite number at ${path}; a theme value must be finite`
    );
  }
  const declared = themeLeafKinds(path);
  if (declared) {
    if (!declared.includes(kind as ThemeLeafKind)) {
      throw new Error(
        `mergeThemePatches: expected ${declared.join(" | ")} at ${path}, received ${kind}`
      );
    }
    assertLeafOption(patch, path);
    return;
  }
  // The schema declares an opaque value here, so the baseline is the only
  // evidence left. A container may still never become a scalar.
  if (base === undefined) return;
  const baseKind = nodeKind(base);
  if (baseKind === "object" || baseKind === "array") {
    throw new Error(
      `mergeThemePatches: expected ${baseKind} at ${path}, received ${kind}`
    );
  }
}

/**
 * Refuse a value outside the closed option domain the Theme declares.
 *
 * A literal union IS a string, so the kind check cannot tell `"dark"` from
 * `"potato"` on `appearance.defaultMode`: both were admitted, and the invented
 * one either compiled into a channel set no reader expects or died much later
 * as whatever generic error the first reader of it happened to raise. The
 * domain refuses it here, where the contract that declares it is still in
 * scope.
 */
function assertLeafOption(patch: unknown, path: string): void {
  if (typeof patch !== "string") return;
  const options = themeLeafOptions(path);
  if (!options || options.includes(patch)) return;
  throw new Error(
    `mergeThemePatches: ${JSON.stringify(patch)} is not an option at ${path}; ` +
      `the closed set is ${options.map((option) => `"${option}"`).join(", ")}`
  );
}

/**
 * Refuse an array whose container or element kinds the Theme does not declare.
 *
 * An array patch REPLACES rather than merges, so it is the one node kind that
 * can substitute a whole container without a single key being checked. The
 * elements are held to the same leaf law, and an array over a declared object
 * or scalar is a container mismatch.
 */
function assertArrayPatch(base: unknown, patch: readonly unknown[], path: string): void {
  if (base !== undefined && !Array.isArray(base)) {
    throw new Error(
      `mergeThemePatches: expected ${nodeKind(base)} at ${path}, received array`
    );
  }
  patch.forEach((element, index) => {
    const elementPath = `${path}[${index}]`;
    if (element !== null && typeof element === "object" && !Array.isArray(element)) {
      throw new Error(
        `mergeThemePatches: object element at ${elementPath}; ` +
          "an array patch replaces wholesale and carries scalars only"
      );
    }
    // The element kind comes from the DECLARATION, not from `base[0]`: an empty
    // baseline array types nothing, which is exactly the ambiguity a wholesale
    // replacement can hide.
    assertLeafKind(undefined, element, elementPath);
  });
}

/** The closed absence-reason vocabulary, as a runtime membership test. */
const ABSENCE_REASONS: ReadonlySet<unknown> = new Set(BRAND_CAPABILITY_ABSENCE_REASONS);

/**
 * Refuse a governed disposition outside the closed vocabulary.
 *
 * `disposition` is the only key in the Theme that decides whether a family is
 * live, and every reader of it (`isGovernedActive`, the capability catalog, the
 * lowering's intake) asks only whether it is `undefined`. An invented string is
 * therefore not an inert unknown: it silently DISABLES the family, which is the
 * failure a customer document should never be able to cause by typo.
 */
function assertDisposition(value: unknown, path: string): void {
  if (value === undefined || ABSENCE_REASONS.has(value)) return;
  throw new Error(
    `mergeThemePatches: unknown disposition ${JSON.stringify(value)} at ${path}; ` +
      `the closed set is ${BRAND_CAPABILITY_ABSENCE_REASONS.map((r) => `"${r}"`).join(", ")}`
  );
}

/** Keys that reach the prototype chain, refused wherever a patch names one. */
const FORBIDDEN_PATCH_KEYS: ReadonlySet<string> = new Set([
  "__proto__",
  "constructor",
  "prototype",
]);

function assertPatchKey(key: string, path: string): void {
  if (!FORBIDDEN_PATCH_KEYS.has(key)) return;
  throw new Error(
    `mergeThemePatches: forbidden key "${key}" at ${path}; ThemeLayerPatch may not name the prototype chain`
  );
}

/** Fail-closed deep merge. Any key in `patch` that is not in `base` throws. */
function mergeDeep(base: unknown, patch: unknown, path: string): unknown {
  if (patch === undefined) return base;

  if (Array.isArray(patch)) {
    assertArrayPatch(base, patch, path);
    return patch;
  }

  if (patch === null || typeof patch !== "object") {
    assertLeafKind(base, patch, path);
    return patch;
  }

  if (!isPlainPatchRecord(patch)) {
    throw new Error(
      `mergeThemePatches: ${containerTag(patch)} at ${path} is not a ThemeLayerPatch container; ` +
        "a patch family is a plain record"
    );
  }

  if (
    base === null ||
    base === undefined ||
    typeof base !== "object" ||
    Array.isArray(base)
  ) {
    throw new Error(
      `mergeThemePatches: cannot patch object at ${path} over ${nodeKind(base)}`
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
    // OWN properties only. `key in baseObj` walks the prototype chain, so
    // `constructor`, `toString`, `valueOf`, `hasOwnProperty` and `__proto__` all
    // answered "known key" on a public runtime boundary and were merged. This is
    // ingestion from a customer document; the shape it may name is the shape the
    // Theme actually declares, not everything Object hands every object.
    if (!Object.prototype.hasOwnProperty.call(baseObj, key)) {
      throw new Error(
        `mergeThemePatches: unknown key "${key}" at ${path}; ThemeLayerPatch is ingestion-only`
      );
    }
    // Refused even if a base ever declared one of them as an own key: assigning
    // to `__proto__` mutates the prototype rather than the object, and the other
    // two are how that reach is usually laundered.
    if (key === "__proto__" || key === "constructor" || key === "prototype") {
      throw new Error(
        `mergeThemePatches: forbidden key "${key}" at ${path}; ThemeLayerPatch may not name the prototype chain`
      );
    }
    if (key === "disposition") {
      assertDisposition(patchObj[key], path ? `${path}.${key}` : key);
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
 *
 * Named for what it does. `resolveTheme` is the PIPELINE stage that turns an
 * intent into a resolved theme plus the provenance the merge destroys; this is
 * only the deep merge underneath it, and two exported functions sharing that
 * name is how a caller ends up merging when it meant to resolve.
 */
export function mergeThemePatches(base: Theme, ...patches: ThemeLayerPatch[]): Theme {
  assertThemeBaseline(base, "mergeThemePatches");
  let current: Theme = base;
  for (const [idx, patch] of patches.entries()) {
    // `typeof [] === "object"`, so the null/typeof pair admitted an array here
    // and handed it to a merge that reads its numeric keys as Theme families.
    if (!patch || typeof patch !== "object" || Array.isArray(patch)) {
      throw new Error(`mergeThemePatches: patch[${idx}] is not an object`);
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
  "capabilities",
];

/** The visual families a Theme can carry; identity alone is not a theme. */
const THEME_VISUAL_FAMILIES: readonly (keyof Theme)[] = CANONICAL_THEME_KEY_ORDER.filter(
  (key) => key !== "id" && key !== "name"
);

/** Every key a Theme declares. Anything else is not part of this contract. */
const THEME_KEYS: ReadonlySet<string> = new Set<string>(CANONICAL_THEME_KEY_ORDER);

/**
 * Refuse a baseline that is not a Theme.
 *
 * `resolveTheme(baseline)` used to hand an intentless baseline straight back,
 * so `null`, an array, `{}` and `{ id: "x" }` all became "resolved themes" that
 * the lowering then read family by family. A baseline is the FLOOR every merge
 * and every compile stands on; validating it only when a patch happens to be
 * present is validating it by luck.
 *
 * TOTALITY IS NOT THE TEST, and deliberately so: `liftAuthoredTheme` exists to
 * carry a SPARSE authored draft to the compiler unchanged, because normalizing
 * an editor draft would compile channels its author never wrote. What is
 * required is what the lowering actually reads before it reads anything else —
 * an `id` it scopes the compile by, and at least one visual family to lower.
 */
export function assertThemeBaseline(baseline: unknown, label: string): void {
  if (typeof baseline !== "object" || baseline === null || Array.isArray(baseline)) {
    throw new Error(`${label}: baseline must be a Theme object`);
  }
  // OWN key, and checked before the container rule so that the diagnosis names
  // the defect: `Object.create({ id: "x", palette: {} })` reads back as a Theme
  // through every dotted access, and none of it is on the object the compiler
  // then scopes, serializes and hands on.
  const id = Object.prototype.hasOwnProperty.call(baseline, "id")
    ? (baseline as Partial<Theme>).id
    : undefined;
  if (typeof id !== "string" || id.length === 0) {
    throw new Error(`${label}: baseline.id must be a non-empty own string`);
  }
  if (!isPlainPatchRecord(baseline)) {
    throw new Error(
      `${label}: baseline is a ${containerTag(baseline)}, not a plain Theme object`
    );
  }
  const unknown = Object.keys(baseline).filter((key) => !THEME_KEYS.has(key));
  if (unknown.length > 0) {
    throw new Error(
      `${label}: baseline carries unknown key(s) ` +
        `${unknown.map((key) => JSON.stringify(key)).join(", ")}; ` +
        "a Theme carries only the families it declares"
    );
  }
  const families = THEME_VISUAL_FAMILIES.filter((key) =>
    Object.prototype.hasOwnProperty.call(baseline, key)
  );
  if (families.length === 0) {
    throw new Error(
      `${label}: baseline declares no visual family; identity alone is not a Theme`
    );
  }
  // STRUCTURAL, not total: a sparse authored draft legitimately omits families,
  // and `liftAuthoredTheme` exists to carry exactly that. What a present family
  // may not be is a scalar -- `palette: false` reached the lowering, which then
  // read channels off a boolean.
  for (const key of families) {
    const value = baseline[key];
    if (value === undefined) continue;
    if (!isPlainPatchRecord(value)) {
      throw new Error(
        `${label}: baseline.${key} must be a record, received ${nodeKind(value)}`
      );
    }
  }
}


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
 * There is no separate provenance map: a `ThemeLayerPatch` IS the authorship
 * record, because the only way a path can appear in it is that the tenant
 * document put it there. Reading authorship off the patch keeps `mergeDeep`
 * and `mergeThemePatches` -- the most load-bearing fail-closed functions in this
 * plane -- byte-for-byte untouched.
 */
export type TenantAuthoredPaths = ReadonlySet<string>;

/**
 * The lowering's governed intake unwraps `.value` for exactly these six roots
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
  patch: ThemeLayerPatch
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
 * THREE compiler sites (the primary-seed derivation, the sidebar tone/leaf
 * contest, and the status-tint seed derivation), and each of those consults
 * a small, named table. This set is the union of those three tables and is
 * the single authority they are checked against, so a fourth site cannot
 * quietly start asking about a field nobody agreed to make
 * provenance-sensitive.
 *
 * COH-1 D3: the status-tint site (`applyTenantStatusSeedDerivations`,
 * `brand-theme/index.ts`) was already reading fifteen fields via
 * `isTenantAuthoredField` (its own `STATUS_SEED_SHADOWING_FIELDS` guard) when
 * this set still only unioned the first two sites' tables -- a third site
 * asking a question this vocabulary did not yet name. Closed here: this set
 * now also carries the four status seeds and their fifteen shadowing leaves
 * (independent audit 5 audit, D3, `coh-1-fable-audit.md`).
 *
 * Membership is by BrandTheme-space path WITHOUT a mode prefix; a mode block
 * consults `modes.<mode>.<field>` as well through `isTenantAuthoredField`.
 *
 * Two properties are enforced executably rather than asserted in prose:
 * the three site tables must union to EXACTLY this set, and the paths a
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
  // -- status-tint seed derivation (COH-1, D3): four independent seeds, each
  //    with its own shadowing leaves -- mirrors `STATUS_SEED_FIELDS` +
  //    `STATUS_SEED_SHADOWING_FIELDS` in `brand-theme/index.ts`, duplicated
  //    here as literals (not imported) because this module is `foundation`
  //    and must not depend on `infrastructure/compilers`.
  "palette.successColor",
  "palette.warningColor",
  "palette.errorColor",
  "palette.infoColor",
  "palette.successBgColor",
  "palette.successBorderColor",
  "palette.alphaSuccess10",
  "palette.alphaSuccess20",
  "palette.warningBgColor",
  "palette.warningBorderColor",
  "palette.alphaWarning10",
  "palette.alphaWarning20",
  "palette.errorBgColor",
  "palette.errorBorderColor",
  "palette.alphaError10",
  "palette.alphaError20",
  "palette.infoBgColor",
  "palette.infoBorderColor",
  "palette.alphaInfo10",
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
