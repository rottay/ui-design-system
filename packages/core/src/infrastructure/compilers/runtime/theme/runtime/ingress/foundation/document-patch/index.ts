/**
 * @fileoverview Migrate a v1 TenantThemeDocument into an ISO ThemePatchEnvelope.
 *
 * This is a total function: every supported v1 dial maps to a typed ThemeLayerPatch
 * keypath; every unsupported/unknown dial fails closed. The envelope carries
 * transport metadata (`source: "tenant-document-v1"`) outside the patch.
 *
 * It is the ONE document-to-patch owner. It used to sit inside the DB
 * composition compiler, which meant a preview surface that wanted the same
 * migration had to deep-import a composition-tier module from a pattern and
 * then guess the mode argument. It lives under the ingress owner now, beside
 * the producers that call it, and the mode argument is no longer a caller's to
 * guess -- see {@link documentThemePatch}.
 *
 * @module Compilers/Theme/Ingress/Foundation/DocumentPatch
 * @category Compilers
 * @package @rottay/design-system
 */

import type {
  ThemeLayerPatch,
  ThemePatchEnvelope,
} from "@/foundation/contracts/composition/tenants/themes/iso";
import type {
  BrandExpressiveAxisOverrides,
  BrandThemeMode,
  TenantAppearanceGeneral,
} from "@/foundation/contracts/composition/tenants/themes";
import type {
  TenantThemeAdvancedAppearance,
  TenantThemeAdvancedDocument,
  TenantThemeDocument,
  TenantThemeSimpleDocument,
  TenantVisualFoundation,
} from "@/foundation/contracts/composition/tenants/themes/tenant-theme";
import {
  TENANT_THEME_OVERRIDE_TOKENS,
  type TenantThemeOverrideToken,
} from "@/foundation/contracts/composition/tenants/themes/tenant-theme";
import {
  buttonStyleRadius,
  typePairingToTypography,
} from "@/infrastructure/compilers/kernel/foundation/css/appearance-posture";
import type { FirstPartyVerticalId } from "@/foundation/contracts/kernel/verticals";
import {
  FIRST_PARTY_THEMES,
  isFirstPartyVerticalId,
} from "@/foundation/tokens/ts/presentation/brand-themes";

const V1_SCHEMA_VERSION = "1";

export class ThemePatchMigrationError extends Error {
  constructor(message: string) {
    super(`ThemePatch migration: ${message}`);
    this.name = "ThemePatchMigrationError";
  }
}

function assertExactKeys(
  value: unknown,
  allowed: readonly string[],
  path: string
): void {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new ThemePatchMigrationError(
      `unsupported ${path}; expected an object`
    );
  }
  const allow = new Set(allowed);
  for (const key of Object.keys(value)) {
    if (!allow.has(key)) {
      throw new ThemePatchMigrationError(`unsupported ${path}.${key}`);
    }
  }
}

const OVERRIDE_TOKEN_SET = new Set<string>(TENANT_THEME_OVERRIDE_TOKENS);

const MATERIAL_FACET_FIELDS = {
  "background-hover": "backgroundHover",
  "background-active": "backgroundActive",
  "background-selected": "backgroundSelected",
  "background-disabled": "backgroundDisabled",
  foreground: "foreground",
  "foreground-muted": "foregroundMuted",
  "foreground-disabled": "foregroundDisabled",
  border: "border",
  "border-strong": "borderStrong",
  "border-hover": "borderHover",
  "border-active": "borderActive",
  "border-selected": "borderSelected",
  "border-disabled": "borderDisabled",
  "focus-ring": "focusRing",
  shadow: "shadow",
  "shadow-hover": "shadowHover",
  "shadow-active": "shadowActive",
  "shadow-selected": "shadowSelected",
  highlight: "highlight",
  texture: "texture",
} as const;

const TYPE_ROLE_FIELDS = {
  display: "display",
  "page-title": "pageTitle",
  "section-title": "sectionTitle",
  body: "body",
  supporting: "supporting",
  label: "label",
  caption: "caption",
  code: "code",
  numeric: "numeric",
} as const;

const TYPE_FACET_FIELDS = {
  "font-family": "fontFamily",
  "font-size": "fontSize",
  "font-weight": "fontWeight",
  "line-height": "lineHeight",
  "letter-spacing": "letterSpacing",
  "text-transform": "textTransform",
  "font-variant-numeric": "fontVariantNumeric",
} as const;

function numericOverride(value: string | number, token: string): number {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed)) {
    throw new ThemePatchMigrationError(
      `unsupported value for ${token}; expected a finite number`
    );
  }
  return parsed;
}

function migrateTokenOverride(
  token: TenantThemeOverrideToken,
  value: string | number
): ThemeLayerPatch {
  const text = String(value);
  const paletteFields: Partial<Record<TenantThemeOverrideToken, string>> = {
    "--ds-color-primary": "primaryColor",
    "--ds-color-secondary": "secondaryColor",
    "--ds-color-accent": "accentColor",
    "--ds-color-success": "successColor",
    "--ds-color-warning": "warningColor",
    "--ds-color-error": "errorColor",
    "--ds-color-info": "infoColor",
    "--ds-color-bg-primary": "backgroundColor",
    "--ds-color-bg": "backgroundColor",
    "--ds-color-background": "backgroundColor",
    "--ds-color-bg-overlay": "backgroundOverlayColor",
    "--ds-color-text-primary": "textPrimaryColor",
    "--ds-color-text-secondary": "textSecondaryColor",
    "--ds-color-text-muted": "textMutedColor",
    "--ds-color-text-disabled": "textDisabledColor",
    "--ds-color-border-primary": "borderPrimaryColor",
    "--ds-color-border-secondary": "borderSecondaryColor",
  };
  const paletteField = paletteFields[token];
  if (paletteField) {
    return { palette: { [paletteField]: text } } as ThemeLayerPatch;
  }

  const surfaceAlias =
    /^--ds-surface-(canvas|shell|panel|card|inset|control|raised|overlay)$/.exec(
      token
    );
  if (surfaceAlias) {
    return {
      surfaces: {
        surfaceRoles: { [surfaceAlias[1]]: { background: text } },
      },
    } as ThemeLayerPatch;
  }

  const material =
    /^--ds-material-(canvas|shell|panel|card|inset|control|raised|overlay)-(.+)$/.exec(
      token
    );
  if (material) {
    const field =
      MATERIAL_FACET_FIELDS[material[2] as keyof typeof MATERIAL_FACET_FIELDS];
    if (field) {
      return {
        surfaces: {
          surfaceRoles: { [material[1]]: { [field]: text } },
        },
      } as ThemeLayerPatch;
    }
  }

  const typographyFields: Partial<Record<TenantThemeOverrideToken, string>> = {
    "--ds-font-family-base": "fontFamilyBase",
    "--ds-font-family-heading": "fontFamilyHeading",
    "--ds-font-family-mono": "fontFamilyMono",
    "--ds-font-family-display": "fontFamilyDisplay",
  };
  const typographyField = typographyFields[token];
  if (typographyField) {
    return { typography: { [typographyField]: text } } as ThemeLayerPatch;
  }

  const letterSpacing =
    /^--ds-letter-spacing-(display|heading|body|mono)$/.exec(token);
  if (letterSpacing) {
    return {
      typography: { letterSpacing: { [letterSpacing[1]]: text } },
    } as ThemeLayerPatch;
  }
  const lineHeight =
    /^--ds-line-height-(display|heading|body|tight|relaxed)$/.exec(token);
  if (lineHeight) {
    return {
      typography: {
        lineHeight: { [lineHeight[1]]: numericOverride(value, token) },
      },
    } as ThemeLayerPatch;
  }

  const typeRole =
    /^--ds-type-(display|page-title|section-title|body|supporting|label|caption|code|numeric)-(.+)$/.exec(
      token
    );
  if (typeRole) {
    const role = TYPE_ROLE_FIELDS[typeRole[1] as keyof typeof TYPE_ROLE_FIELDS];
    const facet =
      TYPE_FACET_FIELDS[typeRole[2] as keyof typeof TYPE_FACET_FIELDS];
    if (role && facet) {
      return {
        typography: { roles: { [role]: { [facet]: value } } },
      } as ThemeLayerPatch;
    }
  }

  const radius = /^--ds-radius-(sm|md|lg|xl)$/.exec(token);
  if (radius) {
    return {
      surfaces: { borderRadius: { [radius[1]]: text } },
    } as ThemeLayerPatch;
  }
  const shadow = /^--ds-shadow-(sm|md|lg|xl)$/.exec(token);
  if (shadow) {
    return { surfaces: { shadows: { [shadow[1]]: text } } } as ThemeLayerPatch;
  }

  const surfaceFields: Partial<
    Record<
      TenantThemeOverrideToken,
      readonly ["glass" | "gradients" | "overlays", string]
    >
  > = {
    "--ds-glass-bg": ["glass", "background"],
    "--ds-glass-border": ["glass", "border"],
    "--ds-glass-blur": ["glass", "blur"],
    "--ds-gradient-primary": ["gradients", "primary"],
    "--ds-gradient-surface": ["gradients", "surface"],
    "--ds-gradient-mesh": ["gradients", "mesh"],
    "--ds-overlay-light": ["overlays", "light"],
    "--ds-overlay-medium": ["overlays", "medium"],
    "--ds-overlay-heavy": ["overlays", "heavy"],
  };
  const surfaceField = surfaceFields[token];
  if (surfaceField) {
    return {
      surfaces: { [surfaceField[0]]: { [surfaceField[1]]: text } },
    } as ThemeLayerPatch;
  }
  if (token === "--ds-density-scale") {
    return { surfaces: { densityScale: numericOverride(value, token) } };
  }
  if (token === "--ds-effect-intensity") {
    return { surfaces: { effectIntensity: numericOverride(value, token) } };
  }

  throw new ThemePatchMigrationError(
    `unsupported tokenOverride "${token}"; no canonical Theme keypath`
  );
}

function migrateTokenOverrides(
  overrides: Record<string, string | number> | undefined
): ThemeLayerPatch {
  if (!overrides) return {};
  const patches: ThemeLayerPatch[] = [];
  const categoryColors: string[] = [];
  for (const [key, value] of Object.entries(overrides)) {
    if (!OVERRIDE_TOKEN_SET.has(key)) {
      throw new ThemePatchMigrationError(
        `unsupported tokenOverride "${key}"; ThemeLayerPatch requires a typed keypath`
      );
    }
    const category = /^--ds-chart-category-(10|[1-9])$/.exec(key);
    if (category) {
      categoryColors[Number(category[1]) - 1] = String(value);
      continue;
    }
    patches.push(migrateTokenOverride(key as TenantThemeOverrideToken, value));
  }
  if (categoryColors.some((value) => value !== undefined)) {
    patches.push({ charts: { value: { categoryColors } } });
  }
  return mergePatches(patches);
}

function migrateTypography(
  typography: TenantAppearanceGeneral["typography"] | undefined
): ThemeLayerPatch {
  if (!typography) return {};
  assertExactKeys(
    typography,
    ["fontFamilyBase", "fontFamilyHeading", "typePairing", "scale"],
    "general.typography"
  );
  const paired = typePairingToTypography(typography.typePairing);
  return {
    typography: {
      ...paired,
      typePairing: typography.typePairing,
      scale: typography.scale,
      fontFamilyBase: typography.fontFamilyBase ?? paired.fontFamilyBase,
      fontFamilyHeading:
        typography.fontFamilyHeading ?? paired.fontFamilyHeading,
    },
  };
}

function migratePalette(
  palette: TenantAppearanceGeneral["palette"] | undefined,
  defaultMode: BrandThemeMode
): ThemeLayerPatch {
  if (!palette) return {};

  type Palette = NonNullable<TenantAppearanceGeneral["palette"]>;
  type PaletteSeeds = Omit<Palette, "backgroundMode" | "dark">;

  const seedKeys = new Set([
    "primary",
    "secondary",
    "accent",
    "background",
    "foreground",
    "border",
    "status",
  ]);
  const foregroundKeys = new Set(["primary", "secondary", "muted", "disabled"]);
  const borderKeys = new Set(["primary", "secondary"]);
  // P0: vocabulario CERRADO de tonos de estado. La lista es literal porque la
  // fila DB es JSON no confiable: el tipo protege al autor, esta lista protege
  // contra el documento. Es la leccion del "undefined" textual.
  const statusKeys = new Set(["success", "warning", "error", "info"]);

  const validateSeeds = (
    source: PaletteSeeds,
    path: string,
    { allowStatus = false }: { allowStatus?: boolean } = {}
  ): void => {
    for (const key of Object.keys(source)) {
      if (!seedKeys.has(key)) {
        throw new ThemePatchMigrationError(`unsupported ${path}.${key}`);
      }
    }
    // Sin gemelo `dark` en P0 (adjudicado): el modo oscuro de las semillas de
    // estado es un lote propio con su propio cero-delta. `dark.status` se
    // rechaza aqui y no por omision del tipo, porque el documento no lo respeta.
    if (!allowStatus && source.status !== undefined) {
      throw new ThemePatchMigrationError(`unsupported ${path}.status`);
    }
    for (const key of Object.keys(source.status ?? {})) {
      if (!statusKeys.has(key)) {
        throw new ThemePatchMigrationError(`unsupported ${path}.status.${key}`);
      }
    }
    for (const key of Object.keys(source.foreground ?? {})) {
      if (!foregroundKeys.has(key)) {
        throw new ThemePatchMigrationError(
          `unsupported ${path}.foreground.${key}`
        );
      }
    }
    for (const key of Object.keys(source.border ?? {})) {
      if (!borderKeys.has(key)) {
        throw new ThemePatchMigrationError(`unsupported ${path}.border.${key}`);
      }
    }
  };

  const supported = new Set([...seedKeys, "backgroundMode", "dark"]);
  for (const key of Object.keys(palette)) {
    if (!supported.has(key)) {
      throw new ThemePatchMigrationError(
        `unsupported general.palette.${key}; ThemeLayerPatch requires an exact typed keypath`
      );
    }
  }

  if (
    palette.backgroundMode !== undefined &&
    !["light", "dark", "auto"].includes(palette.backgroundMode)
  ) {
    throw new ThemePatchMigrationError(
      `unsupported general.palette.backgroundMode ${JSON.stringify(
        palette.backgroundMode
      )}`
    );
  }

  const baseSeeds: PaletteSeeds = {
    primary: palette.primary,
    secondary: palette.secondary,
    accent: palette.accent,
    background: palette.background,
    foreground: palette.foreground,
    border: palette.border,
    status: palette.status,
  };
  validateSeeds(baseSeeds, "general.palette", { allowStatus: true });
  if (palette.dark) validateSeeds(palette.dark, "general.palette.dark");

  const paletteFields = (
    source: PaletteSeeds
  ): NonNullable<ThemeLayerPatch["palette"]> => ({
    primaryColor: source.primary,
    secondaryColor: source.secondary,
    accentColor: source.accent,
    backgroundColor: source.background,
    textPrimaryColor: source.foreground?.primary,
    textSecondaryColor: source.foreground?.secondary,
    textMutedColor: source.foreground?.muted,
    textDisabledColor: source.foreground?.disabled,
    borderPrimaryColor: source.border?.primary,
    borderSecondaryColor: source.border?.secondary,
    // AQUI y en ningun otro lado: las semillas de estado confluyen en
    // BrandPalette ANTES del unico lowering, de modo que la via DB y la via
    // estatica entran a `deriveTenantColorRamps` por la misma puerta. No hay un
    // segundo emisor y P0 no lo crea.
    successColor: source.status?.success,
    warningColor: source.status?.warning,
    errorColor: source.status?.error,
    infoColor: source.status?.info,
  });

  const mode = palette.backgroundMode ?? "light";
  const basePalette = paletteFields(palette);
  const darkPalette = palette.dark ? paletteFields(palette.dark) : undefined;

  // backgroundMode is runtime selection metadata, not Theme authority. It
  // therefore never reaches ThemeLayerPatch.appearance.defaultMode and never
  // restructures the code-owned Theme. The v1 transport semantics are:
  // - light: top-level seeds customize the light/body mode; dark seeds inert
  // - dark: top-level seeds customize the selected dark mode; dark seeds inert
  // - auto: top-level seeds customize light/body and authored dark seeds
  //   customize the dark overlay
  const lightPalette = mode === "dark" ? undefined : basePalette;
  const selectedDarkPalette =
    mode === "dark" ? basePalette : mode === "auto" ? darkPalette : undefined;
  return mergePatches([
    defaultMode === "light"
      ? { palette: lightPalette }
      : { palette: selectedDarkPalette },
    lightPalette && defaultMode !== "light"
      ? { modes: { light: { palette: lightPalette } } }
      : {},
    selectedDarkPalette && defaultMode !== "dark"
      ? { modes: { dark: { palette: selectedDarkPalette } } }
      : {},
  ]);
}

function migrateGeneral(
  general: TenantAppearanceGeneral | undefined,
  defaultMode: BrandThemeMode
): ThemeLayerPatch {
  if (!general) return {};
  assertExactKeys(
    general,
    [
      "palette",
      "typography",
      "shape",
      "density",
      "rhythm",
      "motion",
      "surfaces",
      "navigation",
      "experienceProfile",
    ],
    "general"
  );
  const patches: ThemeLayerPatch[] = [
    migratePalette(general.palette, defaultMode),
    migrateTypography(general.typography),
  ];

  if (general.density) {
    patches.push({ surfaces: { density: general.density } });
  }

  if (general.rhythm) {
    patches.push({ surfaces: { rhythm: general.rhythm } });
  }

  if (general.motion) {
    assertExactKeys(
      general.motion,
      ["intensity", "durationScale", "ambient"],
      "general.motion"
    );
    const motion = general.motion;
    patches.push({
      motion: {
        value: {
          intensity: motion.intensity,
          durationScale: motion.durationScale,
          ambient: motion.ambient,
        },
      },
    });
  }

  if (general.shape) {
    assertExactKeys(
      general.shape,
      ["buttonStyle", "radiusScale"],
      "general.shape"
    );
    patches.push({
      surfaces: {
        buttonStyle: general.shape.buttonStyle,
        radiusScale: general.shape.radiusScale,
      },
      chrome: general.shape.buttonStyle
        ? {
            controls: {
              buttonGeometry: {
                radius: buttonStyleRadius(general.shape.buttonStyle),
              },
            },
          }
        : undefined,
    });
  }
  if (general.surfaces) {
    assertExactKeys(
      general.surfaces,
      ["elevation", "effectIntensity"],
      "general.surfaces"
    );
    patches.push({
      surfaces: {
        elevation: general.surfaces.elevation,
        effectIntensity: general.surfaces.effectIntensity,
      },
    });
  }
  if (general.navigation) {
    assertExactKeys(general.navigation, ["sidebarTone"], "general.navigation");
    const tone = general.navigation.sidebarTone;
    patches.push({
      chrome: {
        sidebar: {
          tone,
        },
      },
    });
  }
  if (general.experienceProfile) {
    patches.push({
      expressive: {
        value: {
          schemaVersion: 1,
          experienceProfile: general.experienceProfile,
        },
      },
    });
  }

  return mergePatches(patches);
}

function migrateAdvanced(
  advanced: TenantThemeAdvancedAppearance | undefined
): ThemeLayerPatch {
  if (!advanced) return {};
  const patches: ThemeLayerPatch[] = [
    migrateTokenOverrides(advanced.tokenOverrides),
  ];
  if (advanced.chrome) {
    patches.push({ chrome: advanced.chrome as ThemeLayerPatch["chrome"] });
  }
  if (advanced.profiles) {
    patches.push({
      expressive: {
        value: {
          schemaVersion: 1,
          profiles: advanced.profiles as BrandExpressiveAxisOverrides,
        },
      },
    });
  }
  if (advanced.responsivePosture) {
    patches.push({
      responsive: {
        value: {
          schemaVersion: 1,
          posture: advanced.responsivePosture,
        },
      },
    });
  }
  return mergePatches(patches);
}

function migrateVisualFoundation(
  vf: TenantVisualFoundation | undefined,
  defaultMode: BrandThemeMode
): ThemeLayerPatch {
  if (!vf) return {};
  const patches: ThemeLayerPatch[] = [
    migrateGeneral(vf.general, defaultMode),
    migrateAdvanced(vf.advanced),
  ];
  if (vf.recipeProfile) {
    patches.push({
      recipes: {
        value: { schemaVersion: 1, profile: vf.recipeProfile },
      },
    });
  }
  return mergePatches(patches);
}

function mergePatches(patches: ThemeLayerPatch[]): ThemeLayerPatch {
  const out: ThemeLayerPatch = {};
  for (const p of patches) deepMergeInto(out, p);
  return out;
}

function deepMergeInto(target: ThemeLayerPatch, source: ThemeLayerPatch): void {
  for (const [key, val] of Object.entries(source)) {
    if (val === undefined) continue;
    if (
      val !== null &&
      typeof val === "object" &&
      !Array.isArray(val) &&
      target[key as keyof ThemeLayerPatch] !== undefined &&
      target[key as keyof ThemeLayerPatch] !== null &&
      typeof target[key as keyof ThemeLayerPatch] === "object" &&
      !Array.isArray(target[key as keyof ThemeLayerPatch])
    ) {
      deepMergeInto(
        target[key as keyof ThemeLayerPatch] as ThemeLayerPatch,
        val as ThemeLayerPatch
      );
    } else {
      (target as Record<string, unknown>)[key] = val;
    }
  }
}

function migrateAdvancedDocument(
  doc: TenantThemeAdvancedDocument,
  defaultMode: BrandThemeMode
): ThemePatchEnvelope {
  return {
    schemaVersion: String(doc.schemaVersion),
    source: "tenant-document-v1",
    patch: migrateVisualFoundation(doc.visualFoundation, defaultMode),
  };
}

function migrateSimpleDocument(
  doc: TenantThemeSimpleDocument,
  defaultMode: BrandThemeMode
): ThemePatchEnvelope {
  return {
    schemaVersion: String(doc.schemaVersion),
    source: "tenant-document-v1",
    patch: migrateGeneral(doc.appearance, defaultMode),
  };
}

/** Total migration: every known dial maps to a typed keypath; unknowns throw. */
export function migrateV1(
  doc: TenantThemeDocument,
  defaultMode: BrandThemeMode
): ThemePatchEnvelope {
  if (doc.schemaVersion !== Number(V1_SCHEMA_VERSION)) {
    throw new ThemePatchMigrationError(
      `unsupported schemaVersion ${String(doc.schemaVersion)}`
    );
  }
  if (doc.mode === "simple") return migrateSimpleDocument(doc, defaultMode);
  if (doc.mode === "advanced") return migrateAdvancedDocument(doc, defaultMode);
  throw new ThemePatchMigrationError(`unsupported document mode`);
}

/**
 * The patch a persisted or previewed document contributes, over the baseline
 * the vertical names.
 *
 * The default mode is READ FROM THE ROSTER, never passed in. `migrateV1` routes
 * a top-level palette seed to `palette` when the document's background mode
 * matches the baseline's own default and to `modes.<mode>.palette` otherwise,
 * so the mode argument decides WHICH block a customer's colour lands in. The DB
 * terminal passed the baseline's `appearance.defaultMode`; the preview sandbox
 * passed the literal `"light"`. On Rottay, whose default mode is `dark`, that
 * made the preview repaint the dark canvas for a change publish would write
 * into the light block -- the preview and the artifact disagreed about the same
 * document. One reader, one answer.
 */
export function documentThemePatch(input: {
  vertical: FirstPartyVerticalId;
  document: TenantThemeDocument;
}): ThemeLayerPatch {
  // A JS caller is not held to the type. Refuse an off-roster vertical with the
  // owner's own error rather than indexing the roster and throwing a TypeError.
  if (!isFirstPartyVerticalId(input.vertical)) {
    throw new ThemePatchMigrationError(
      `${String(input.vertical)} is not a first-party vertical`
    );
  }
  const defaultMode = FIRST_PARTY_THEMES[input.vertical].appearance?.defaultMode;
  if (!defaultMode) {
    throw new ThemePatchMigrationError(
      `the ${input.vertical} baseline declares no default mode`
    );
  }
  return migrateV1(input.document, defaultMode).patch;
}
