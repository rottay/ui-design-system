/**
 * @fileoverview Migrate a v1 TenantThemeDocument into an ISO ThemePatchEnvelope.
 *
 * This is a total function: every supported v1 dial maps to a typed ThemePatch
 * keypath; every unsupported/unknown dial fails closed. The envelope carries
 * transport metadata (`source: "tenant-document-v1"`) outside the patch.
 */

import type {
  ThemePatch,
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
): ThemePatch {
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
    return { palette: { [paletteField]: text } } as ThemePatch;
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
    } as ThemePatch;
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
      } as ThemePatch;
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
    return { typography: { [typographyField]: text } } as ThemePatch;
  }

  const letterSpacing =
    /^--ds-letter-spacing-(display|heading|body|mono)$/.exec(token);
  if (letterSpacing) {
    return {
      typography: { letterSpacing: { [letterSpacing[1]]: text } },
    } as ThemePatch;
  }
  const lineHeight =
    /^--ds-line-height-(display|heading|body|tight|relaxed)$/.exec(token);
  if (lineHeight) {
    return {
      typography: {
        lineHeight: { [lineHeight[1]]: numericOverride(value, token) },
      },
    } as ThemePatch;
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
      } as ThemePatch;
    }
  }

  const radius = /^--ds-radius-(sm|md|lg|xl)$/.exec(token);
  if (radius) {
    return {
      surfaces: { borderRadius: { [radius[1]]: text } },
    } as ThemePatch;
  }
  const shadow = /^--ds-shadow-(sm|md|lg|xl)$/.exec(token);
  if (shadow) {
    return { surfaces: { shadows: { [shadow[1]]: text } } } as ThemePatch;
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
    } as ThemePatch;
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
): ThemePatch {
  if (!overrides) return {};
  const patches: ThemePatch[] = [];
  const categoryColors: string[] = [];
  for (const [key, value] of Object.entries(overrides)) {
    if (!OVERRIDE_TOKEN_SET.has(key)) {
      throw new ThemePatchMigrationError(
        `unsupported tokenOverride "${key}"; ThemePatch requires a typed keypath`
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
): ThemePatch {
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
): ThemePatch {
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
  ]);
  const foregroundKeys = new Set(["primary", "secondary", "muted", "disabled"]);
  const borderKeys = new Set(["primary", "secondary"]);

  const validateSeeds = (source: PaletteSeeds, path: string): void => {
    for (const key of Object.keys(source)) {
      if (!seedKeys.has(key)) {
        throw new ThemePatchMigrationError(`unsupported ${path}.${key}`);
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
        `unsupported general.palette.${key}; ThemePatch requires an exact typed keypath`
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
  };
  validateSeeds(baseSeeds, "general.palette");
  if (palette.dark) validateSeeds(palette.dark, "general.palette.dark");

  const paletteFields = (
    source: PaletteSeeds
  ): NonNullable<ThemePatch["palette"]> => ({
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
  });

  const mode = palette.backgroundMode ?? "light";
  const basePalette = paletteFields(palette);
  const darkPalette = palette.dark ? paletteFields(palette.dark) : undefined;

  // backgroundMode is runtime selection metadata, not Theme authority. It
  // therefore never reaches ThemePatch.appearance.defaultMode and never
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
): ThemePatch {
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
  const patches: ThemePatch[] = [
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
): ThemePatch {
  if (!advanced) return {};
  const patches: ThemePatch[] = [
    migrateTokenOverrides(advanced.tokenOverrides),
  ];
  if (advanced.chrome) {
    patches.push({ chrome: advanced.chrome as ThemePatch["chrome"] });
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
): ThemePatch {
  if (!vf) return {};
  const patches: ThemePatch[] = [
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

function mergePatches(patches: ThemePatch[]): ThemePatch {
  const out: ThemePatch = {};
  for (const p of patches) deepMergeInto(out, p);
  return out;
}

function deepMergeInto(target: ThemePatch, source: ThemePatch): void {
  for (const [key, val] of Object.entries(source)) {
    if (val === undefined) continue;
    if (
      val !== null &&
      typeof val === "object" &&
      !Array.isArray(val) &&
      target[key as keyof ThemePatch] !== undefined &&
      target[key as keyof ThemePatch] !== null &&
      typeof target[key as keyof ThemePatch] === "object" &&
      !Array.isArray(target[key as keyof ThemePatch])
    ) {
      deepMergeInto(
        target[key as keyof ThemePatch] as ThemePatch,
        val as ThemePatch
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
