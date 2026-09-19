/**
 * Serializable schema manifest for TenantThemeConfig v1.
 *
 * Validation is derived from this object. Platform editors and persistence
 * adapters can compare its canonical digest instead of maintaining a second
 * field inventory by hand.
 */

import { MOTION_DIAL_BOUNDS } from "@/foundation/contracts/runtime/motion";
import { dimensionToPx } from "@/foundation/kernel/geometry/css-length";
import { isCanonicalJsonObject as isPlainObject } from "@/foundation/kernel/serialization";
import type { TenantThemeValidationIssue } from "@/foundation/contracts/composition/tenants/themes/tenant-theme";
import { isValidCssColor } from "@/foundation/kernel/color/contrast";
import { ALLOWED_VALUE_FUNCTIONS } from "@/foundation/kernel/css/value-functions";
import {
  TENANT_THEME_ANATOMY_VARIANTS,
  TENANT_THEME_EFFECT_INTENSITY_BOUNDS,
  TENANT_THEME_NEUTRAL_OVERRIDE_TOKENS,
  TENANT_THEME_OVERRIDE_TOKENS,
  TENANT_THEME_RADIUS_SCALE_BOUNDS,
  TENANT_THEME_REFERENCE_TOKENS,
  TENANT_THEME_FONT_PACK_IDS,
  TENANT_THEME_SCHEMA_VERSION,
  TENANT_THEME_TYPE_SCALE_BOUNDS,
} from "@/foundation/contracts/composition/tenants/themes/tenant-theme";
import { RECIPE_PROFILES } from "@/foundation/tokens/ts/presentation/recipe-profiles";
import { RESPONSIVE_POSTURE_PROFILES } from "@/foundation/tokens/ts/presentation/responsive-postures";
import {
  EXPERIENCE_PROFILES,
  EXPRESSIVE_EDGE_PROFILES,
  EXPRESSIVE_ELEVATION_PROFILES,
  EXPRESSIVE_GEOMETRY_PROFILES,
  EXPRESSIVE_MATERIAL_PROFILES,
  EXPRESSIVE_ICON_PROFILES,
  EXPRESSIVE_MOTIF_PROFILES,
  EXPRESSIVE_TYPE_PROFILES,
} from "@/foundation/tokens/ts/presentation/expressive-profiles";

export type TenantThemeSchemaNode =
  | {
      type: "object";
      fields: Readonly<Record<string, TenantThemeSchemaNode>>;
      required?: readonly string[];
    }
  | { type: "literal"; value: string | number }
  | { type: "enum"; values: readonly (string | number)[] }
  | {
      type: "string";
      format:
        | "identifier"
        | "slug"
        | "color"
        | "hex-color"
        | "font-family"
        | "visual-value";
    }
  | { type: "number"; integer?: boolean; min?: number; max?: number };

const literal = (value: string | number): TenantThemeSchemaNode => ({
  type: "literal",
  value,
});
const enumeration = (
  ...values: Array<string | number>
): TenantThemeSchemaNode => ({ type: "enum", values });
const string = (
  format: Extract<TenantThemeSchemaNode, { type: "string" }>["format"]
): TenantThemeSchemaNode => ({
  type: "string",
  format,
});
const number = (
  options: Omit<Extract<TenantThemeSchemaNode, { type: "number" }>, "type"> = {}
): TenantThemeSchemaNode => ({
  type: "number",
  ...options,
});
const object = (
  fields: Readonly<Record<string, TenantThemeSchemaNode>>,
  required: readonly string[] = []
): TenantThemeSchemaNode => ({
  type: "object",
  fields,
  ...(required.length > 0 ? { required } : {}),
});

const visualFields = (
  fields: readonly string[]
): Readonly<Record<string, TenantThemeSchemaNode>> =>
  Object.fromEntries(fields.map((field) => [field, string("visual-value")]));

/**
 * Governed recipe-profile selection (DS-S001): the schema is a closed enum
 * over the first-party registry, so a customer document can only SELECT a
 * published profile id — never author one.
 */
const recipeProfile = enumeration(
  ...RECIPE_PROFILES.map((profile) => profile.id)
);

/**
 * Governed experience-profile selection (C1b): closed enum over the published
 * first-party registry, mirroring the recipe-profile idiom — a customer
 * document can only SELECT a composition id, never author profile content.
 */
const experienceProfile = enumeration(
  ...EXPERIENCE_PROFILES.map((profile) => profile.id)
);

/**
 * Pro explicit per-axis expressive overrides (C1b; `icon` opened in C2).
 * Each axis is a closed vocabulary enum — out-of-vocabulary values are
 * rejected, and the governed weight tables in the icon policy are the only
 * thing an icon posture can select (never a supplier, glyph or SVG).
 */
const expressiveProfiles = object({
  type: enumeration(...EXPRESSIVE_TYPE_PROFILES),
  geometry: enumeration(...EXPRESSIVE_GEOMETRY_PROFILES),
  edge: enumeration(...EXPRESSIVE_EDGE_PROFILES),
  material: enumeration(...EXPRESSIVE_MATERIAL_PROFILES),
  elevation: enumeration(...EXPRESSIVE_ELEVATION_PROFILES),
  motif: enumeration(...EXPRESSIVE_MOTIF_PROFILES),
  icon: enumeration(...EXPRESSIVE_ICON_PROFILES),
});

const COLOR = string("color");
const HEX_COLOR = string("hex-color");
const VISUAL = string("visual-value");
const FONT_WEIGHT = number({ min: 1, max: 1000 });
const OPACITY = number({ min: 0, max: 1 });

const general = object({
  palette: object({
    primary: COLOR,
    secondary: COLOR,
    accent: COLOR,
    background: HEX_COLOR,
    foreground: object({
      primary: HEX_COLOR,
      secondary: HEX_COLOR,
      muted: HEX_COLOR,
      disabled: HEX_COLOR,
    }),
    border: object({
      primary: HEX_COLOR,
      secondary: HEX_COLOR,
    }),
    // Vocabulario CERRADO de tonos de estado. El sobre rechaza cualquier quinta
    // clave, que es la mitad de runtime del cierre: el tipo protege al autor,
    // esto protege contra la fila DB, que es JSON no confiable.
    status: object({
      success: COLOR,
      warning: COLOR,
      error: COLOR,
      info: COLOR,
    }),
    neutralTemperature: enumeration("cool", "neutral", "warm"),
    contrastPosture: enumeration("soft", "standard", "high"),
    backgroundMode: enumeration("light", "dark", "auto"),
    dark: object({
      primary: COLOR,
      secondary: COLOR,
      accent: COLOR,
      background: HEX_COLOR,
      foreground: object({
        primary: HEX_COLOR,
        secondary: HEX_COLOR,
        muted: HEX_COLOR,
        disabled: HEX_COLOR,
      }),
      border: object({
        primary: HEX_COLOR,
        secondary: HEX_COLOR,
      }),
    }),
  }),
  typography: object({
    fontFamilyBase: string("font-family"),
    fontFamilyHeading: string("font-family"),
    fontFamilyDisplay: string("font-family"),
    typePairing: enumeration("sober", "editorial", "geometric", "technical"),
    scale: number({
      min: TENANT_THEME_TYPE_SCALE_BOUNDS.min,
      max: TENANT_THEME_TYPE_SCALE_BOUNDS.max,
    }),
    roleWeights: enumeration("light", "regular", "strong"),
    numeric: enumeration("proportional", "tabular"),
  }),
  shape: object({
    buttonStyle: enumeration("sharp", "soft", "pill"),
    radiusScale: number({
      min: TENANT_THEME_RADIUS_SCALE_BOUNDS.min,
      max: TENANT_THEME_RADIUS_SCALE_BOUNDS.max,
    }),
    nesting: enumeration("concentric", "uniform"),
    controlHeight: enumeration("compact", "standard", "tall"),
  }),
  density: enumeration("compact", "normal", "spacious"),
  // Layout rhythm is a SEPARATE axis from density: density sizes controls,
  // rhythm sizes the space between them. A closed domain, so an unknown
  // posture is rejected rather than silently ignored.
  rhythm: enumeration("tight", "normal", "airy"),
  motion: object({
    intensity: number({
      min: MOTION_DIAL_BOUNDS.intensity.min,
      max: MOTION_DIAL_BOUNDS.intensity.max,
    }),
    durationScale: number({
      min: MOTION_DIAL_BOUNDS.durationScale.min,
      max: MOTION_DIAL_BOUNDS.durationScale.max,
    }),
    ambient: enumeration("off", "subtle"),
    // The SHAPE of motion, not a fourth speed input: `MOTION_DIAL_KEYS` stays
    // the three bounded dials the `motion.dial` decision is judged against.
    character: enumeration("mechanical", "organic", "playful"),
  }),
  states: object({
    emphasis: enumeration("subtle", "medium", "strong"),
    focusStyle: enumeration("ring", "underline", "glow"),
  }),
  surfaces: object({
    elevation: enumeration("flat", "soft", "elevated"),
    effectIntensity: number({
      min: TENANT_THEME_EFFECT_INTENSITY_BOUNDS.min,
      max: TENANT_THEME_EFFECT_INTENSITY_BOUNDS.max,
    }),
    borderStyle: enumeration("none", "hairline", "strong"),
  }),
  navigation: object({
    sidebarTone: enumeration("subtle", "strong", "inverse"),
  }),
  experienceProfile,
});

const anatomy = (
  family: keyof typeof TENANT_THEME_ANATOMY_VARIANTS
): TenantThemeSchemaNode =>
  enumeration(...TENANT_THEME_ANATOMY_VARIANTS[family]);

const sidebar = object({
  anatomy: anatomy("sidebar"),
  ...visualFields([
    "bg",
    "border",
    "text",
    "textMuted",
    "width",
    "collapsedWidth",
    "headerHeight",
    "groupFontSize",
    "groupColor",
    "groupLetterSpacing",
    "itemFontSize",
    "itemColor",
    "itemColorActive",
    "itemBgActive",
    "itemBgHover",
    "itemPadding",
    "iconSize",
    "footerBg",
    // Sidebar geometry admitted alongside the static BrandSidebarChrome
    // fields so both transports author the same nine channels.
    "shellPaddingInline",
    "shellPaddingCollapsed",
    "itemHeight",
    "itemChildHeight",
    "itemFontSizeChild",
    "itemPaddingInline",
    "iconColumnSize",
    "itemGap",
    "childPaddingInline",
  ]),
  groupFontWeight: FONT_WEIGHT,
  itemFontWeight: FONT_WEIGHT,
  itemFontWeightActive: FONT_WEIGHT,
});

const shell = object(
  visualFields([
    "gridSize",
    "gridLine",
    "bg",
    "border",
    "overlay",
    "shadow",
    "activeBg",
    "activeGradient",
    "dropdownShadow",
    "shimmerFaint",
    "shimmerSoft",
    "shimmerMedium",
    "shimmerStrong",
    "commandFont",
    "commandLetterSpacing",
    "commandGridSize",
    "commandGridLineSoft",
    "commandGridLine",
    "commandGridLineStrong",
    "commandGridBg",
    "commandGridBgStrong",
    "commandGlow",
    "commandLine",
    "commandRailBg",
    "commandHomeMaxWidth",
    "commandHomeGap",
    "commandHomePanelGap",
    "commandHomeGridLine",
    "commandHomePanelBorder",
    "commandHomePanelBorderSoft",
    "commandHomePanelShadow",
    "commandHomePanelBg",
    "commandHomePanelBgStrong",
    "commandHomeCompactActionHeight",
    "commandHomeConsoleMinHeight",
    "commandHomeConsolePadding",
    "commandHomeConsoleBg",
    "commandHomeSurfaceBg",
    "commandHomeHeroBg",
    "commandHomeIconBg",
    "commandHomeIconBorder",
    "commandHomeControlBg",
    "commandHomeControlBorder",
    "commandHomeControlHoverBg",
    "commandHomeControlHoverBorder",
    "commandHomeMeterBg",
    "commandHomeMeterFill",
  ])
);

const buttonVariant = object(
  visualFields([
    "bg",
    "bgHover",
    "bgActive",
    "color",
    "colorHover",
    "colorActive",
    "text",
    "border",
    "borderHover",
    "borderActive",
    "shadow",
    "shadowHover",
    "shadowActive",
  ])
);

const controlSize = object(
  visualFields([
    "height",
    "paddingX",
    "paddingY",
    "fontSize",
    "lineHeight",
    "iconSize",
    "gap",
    "radius",
  ])
);

const buttonGeometry = object({
  ...visualFields([
    "fontFamily",
    "letterSpacing",
    "textTransform",
    "gap",
    "radius",
    "borderWidth",
    "touchTargetMin",
    "groupGap",
    "groupMobileGap",
    "groupMobileWidth",
    "hoverTransform",
    "activeTransform",
    "iconHoverTransform",
    "iconActiveTransform",
    "labelOffsetY",
    "hoverFilter",
    "activeFilter",
    "focusRingOffset",
    "spinnerDuration",
    "surfaceHighlight",
    "surfaceHighlightOpacity",
    "surfaceHighlightHoverOpacity",
    "surfaceHighlightActiveOpacity",
    "gradient",
    "aiTexture",
    "transitionDuration",
    "transitionTiming",
  ]),
  groupMobileDirection: enumeration("row", "column"),
  fontWeight: FONT_WEIGHT,
  xs: controlSize,
  sm: controlSize,
  md: controlSize,
  lg: controlSize,
  xl: controlSize,
});

const fieldGeometry = object({
  ...visualFields([
    "gap",
    "radius",
    "fontFamily",
    "letterSpacing",
    "borderWidth",
    "borderStyle",
    "messageGap",
    "groupGap",
    "groupGapSeparated",
    "groupOverlap",
    "groupMinItemWidth",
    "formFieldGap",
    "horizontalGap",
    "labelOffsetY",
    "requiredGap",
    "labelFontSize",
    "labelFontFamily",
    "labelLetterSpacing",
    "labelLineHeight",
    "helperFontSize",
    "helperLineHeight",
    "affixSize",
    "affixSizeCompact",
    "affixRadius",
    "actionSize",
    "actionRadius",
    "touchTargetMin",
    "loadingSize",
    "loadingStroke",
    "loadingDuration",
    "textareaMinHeight",
    "textareaMaxHeight",
    "textareaPaddingX",
    "textareaPaddingY",
    "textareaRadius",
    "textareaResize",
    "transitionDuration",
    "transitionTiming",
  ]),
  fontWeight: FONT_WEIGHT,
  labelFontWeight: FONT_WEIGHT,
  formFieldDisabledOpacity: OPACITY,
  xs: controlSize,
  sm: controlSize,
  md: controlSize,
  lg: controlSize,
  xl: controlSize,
});

const segmented = object({
  ...visualFields([
    "bg",
    "border",
    "radius",
    "padding",
    "gap",
    "shadow",
    "itemBg",
    "itemBgHover",
    "itemBgSelected",
    "itemColor",
    "itemColorHover",
    "itemColorSelected",
    "itemRadius",
  ]),
  itemFontWeight: FONT_WEIGHT,
  itemFontWeightSelected: FONT_WEIGHT,
  sm: controlSize,
  md: controlSize,
  lg: controlSize,
});

const input = object({
  ...visualFields([
    "bg",
    "bgHover",
    "bgFocus",
    "bgDisabled",
    "color",
    "colorPlaceholder",
    "colorDisabled",
    "border",
    "borderHover",
    "borderFocus",
    "borderDisabled",
    "shadowRest",
    "shadowHover",
    "shadowFocus",
    "insetShadow",
    "caretColor",
    "selectionBg",
    "selectionColor",
    "successBorder",
    "successBg",
    "successShadowFocus",
    "warningBorder",
    "warningBg",
    "warningShadowFocus",
    "errorBorder",
    "errorBg",
    "errorShadowFocus",
    "errorColor",
    "loadingColor",
  ]),
  disabledOpacity: OPACITY,
  placeholderOpacity: OPACITY,
  filled: object(visualFields(["bg", "bgHover", "bgFocus", "border"])),
  addon: object({
    ...visualFields(["bg", "color", "border", "radius"]),
    fontWeight: FONT_WEIGHT,
  }),
  affix: object(visualFields(["bg", "color", "border", "paddingX"])),
  label: object(visualFields(["color", "requiredColor", "disabledColor"])),
  helper: object({
    ...visualFields(["color", "errorColor"]),
    errorFontWeight: FONT_WEIGHT,
  }),
  clear: object(
    visualFields([
      "color",
      "colorHover",
      "bg",
      "bgHover",
      "border",
      "borderHover",
      "shadowHover",
      "focusRing",
      "activeTransform",
    ])
  ),
  readOnly: object(
    visualFields(["bg", "color", "border", "borderStyle", "cursor"])
  ),
  autofill: object(visualFields(["bg", "color", "caret"])),
  count: object(visualFields(["color", "colorWarning", "colorError"])),
});

const controls = object({
  buttonGeometry,
  fieldGeometry,
  segmented,
  textarea: object(
    visualFields([
      "bg",
      "bgDisabled",
      "filledBg",
      "border",
      "borderHover",
      "borderFocus",
      "shadowFocus",
      "successBorder",
      "warningBorder",
      "errorBorder",
      "color",
      "colorPlaceholder",
      "countColor",
    ])
  ),
  form: object(
    visualFields([
      "labelColor",
      // `labelFontWeight` is a visual value rather than FONT_WEIGHT because the
      // static BrandFormChrome field lowers a CSS string straight into
      // `--ds-form-label-font-weight`; both transports must admit the same type.
      "labelFontWeight",
      "helpColor",
      "extraColor",
      "requiredColor",
      "successColor",
      "warningColor",
      "errorColor",
    ])
  ),
  buttonPrimary: buttonVariant,
  buttonSecondary: buttonVariant,
  buttonDefault: buttonVariant,
  buttonGhost: buttonVariant,
  buttonText: buttonVariant,
  buttonDashed: buttonVariant,
  buttonLink: buttonVariant,
  buttonSuccess: buttonVariant,
  buttonWarning: buttonVariant,
  buttonError: buttonVariant,
  buttonInfo: buttonVariant,
  buttonAI: buttonVariant,
  disabled: object({
    ...visualFields(["bg", "text", "border", "borderColor"]),
    opacity: OPACITY,
  }),
  focusRing: VISUAL,
  input,
  /**
   * ROTTAY-T2 MASS. The DB transport authors the same closed control
   * vocabulary the static `FlatTheme` transport does, because
   * `chromeToVariables` is the single lowering for both. 13 containers, 163
   * governed leaves: `select` carries 33 (the 15 C3 channels plus the 18
   * ROTTAY-T2 added), and the twelve families below carry 130.
   *
   * Every leaf is a VISUAL field. There are no open maps, no legacy aliases,
   * no slug or product branches: a customer document that names a channel
   * outside this list is rejected before it reaches the compiler.
   */
  select: object(
    visualFields([
      "bg",
      "bgHover",
      "bgFocus",
      "color",
      "colorPlaceholder",
      "borderColor",
      "borderColorHover",
      "borderColorFocus",
      "dropdownBg",
      "dropdownBorderColor",
      "dropdownShadow",
      "optionBgHover",
      "optionBgSelected",
      "optionColor",
      "optionColorSelected",
      "arrowColor",
      "bgDisabled",
      "border",
      "borderFocus",
      "borderHover",
      "checkColor",
      "clearColor",
      "clearColorHover",
      "colorDisabled",
      "dropdownBorder",
      "errorBorder",
      "filledBg",
      "optionColorDisabled",
      "shadowFocus",
      "successBorder",
      "tagBg",
      "tagColor",
      "warningBorder",
    ])
  ),
  autocomplete: object(
    visualFields([
      "bg",
      "border",
      "borderFocus",
      "clearColor",
      "dropdownBg",
      "dropdownShadow",
      "emptyColor",
      "errorBorder",
      "optionBgHover",
      "warningBorder",
    ])
  ),
  checkbox: object(
    visualFields([
      "bg",
      "bgDisabled",
      "border",
      "borderHover",
      "checkedBg",
      "checkedBorder",
      "checkedColor",
      "errorBorder",
      "errorColor",
      "focusRing",
      "focusRingColor",
      "labelColor",
      "labelColorDisabled",
    ])
  ),
  datePicker: object(
    visualFields([
      "bg",
      "bgDisabled",
      "border",
      "borderFocus",
      "borderHover",
      "clearColor",
      "color",
      "errorBorder",
      "iconColor",
      "separatorColor",
      "shadowFocus",
      "warningBorder",
    ])
  ),
  inputNumber: object(
    visualFields([
      "addonBg",
      "addonBorder",
      "addonColor",
      "affixColor",
      "bg",
      "bgDisabled",
      "border",
      "borderFocus",
      "color",
      "controlColor",
      "errorBorder",
      "shadowFocus",
      "warningBorder",
    ])
  ),
  radio: object(
    visualFields([
      "bg",
      "bgDisabled",
      "border",
      "borderHover",
      "checkedBg",
      "checkedBorder",
      "checkedDot",
      "descriptionColor",
      "errorBorder",
      "errorColor",
      "focusRing",
      "focusRingColor",
      "labelColor",
      "labelColorDisabled",
    ])
  ),
  rate: object(
    visualFields([
      "color",
    ])
  ),
  slider: object(
    visualFields([
      "focusRing",
      "handleBg",
      "handleBgDisabled",
      "handleBorder",
      "handleShadow",
      "markColor",
      "railColor",
      "trackColor",
      "trackColorDisabled",
    ])
  ),
  switch: object(
    visualFields([
      "bg",
      "bgHover",
      "checkedBg",
      "checkedBgHover",
      "focusRing",
      "labelColor",
      "thumbBg",
      "thumbShadow",
    ])
  ),
  timePicker: object(
    visualFields([
      "bg",
      "bgDisabled",
      "border",
      "borderFocus",
      "clearColor",
      "color",
      "errorBorder",
      "iconColor",
      "separatorColor",
      "shadowFocus",
      "warningBorder",
    ])
  ),
  toggle: object(
    visualFields([
      "descriptionColor",
      "dotBg",
      "dotShadow",
      "errorBg",
      "errorColor",
      "focusRing",
      "innerLabelColor",
      "labelColor",
      "successBg",
      "trackBg",
      "trackBgChecked",
      "warningBg",
    ])
  ),
  transfer: object(
    visualFields([
      "bg",
      "border",
      "headerBg",
      "headerBorder",
      "itemBgHover",
    ])
  ),
  upload: object(
    visualFields([
      "bg",
      "border",
      "borderHover",
      "buttonBg",
      "buttonBorder",
      "buttonColor",
      "cardBg",
      "cardBorder",
      "draggerBg",
      "draggerBgHover",
      "draggerBorder",
      "draggerBorderActive",
      "draggerIconColor",
      "draggerTextColor",
      "errorBorder",
      "fileBg",
      "fileColor",
      "fileRemoveColor",
      "previewBackdrop",
      "previewOverlay",
      "progressBar",
      "progressTrack",
    ])
  ),
});

const premiumCardFields: Readonly<Record<string, TenantThemeSchemaNode>> =
  visualFields([
    "bg",
    "bgHover",
    "border",
    "borderHover",
    "selectedBorder",
    "selectedRing",
    "shadow",
    "shadowHover",
    "radius",
    "padding",
    "gap",
    "minHeight",
    "glassBg",
    "gridSize",
    "gridLine",
    "gridBg",
    "overlay",
    "sheen",
    "depth",
    "hoverTransform",
    "transition",
    "iconBg",
    "iconBorder",
    "iconColor",
    "titleColor",
    "bodyColor",
    "labelColor",
    "valueColor",
    "valueHoverColor",
    "footerBg",
    "footerBorder",
    "footerColor",
    "statusBg",
    "statusBorder",
    "statusColor",
    "actionBg",
    "actionBorder",
    "actionColor",
    "meterTrack",
    "meterTrackBorder",
    "meterFill",
    "numberMinWidth",
    "numberFontVariant",
  ]);

const chrome = object({
  sidebar,
  layout: object({
    anatomy: anatomy("layout"),
    ...visualFields([
      "bg",
      "headerBg",
      "headerHeight",
      "headerBackdrop",
      "headerBorder",
      "siderBg",
      "siderBorder",
      "containerBackground",
      "containerBorder",
      "containerRadius",
      "containerShadow",
      "containerMotionDuration",
      "containerMotionEasing",
      "aspectRatioBackground",
      "aspectRatioBorder",
      "aspectRatioRadius",
      "aspectRatioShadow",
      "aspectRatioOverflow",
      "aspectRatioMotionDuration",
      "aspectRatioMotionEasing",
      "dividerColor",
      "dividerTextColor",
      "dividerThicknessThin",
      "dividerThicknessMedium",
      "dividerThicknessThick",
      "dividerContentGap",
      "dividerEdgeSegment",
      "dividerMinSegment",
      "dividerLabelMaxWidth",
      "dividerLabelFontSize",
      "dividerLabelFontWeight",
      "dividerLabelLineHeight",
      "dividerLabelTransform",
      "dividerLabelTracking",
      "dividerMotionDuration",
      "dividerMotionEasing",
      "stackDividerSize",
      "stackDividerColor",
      "stackDividerOpacity",
      "spaceMotionDuration",
      "spaceMotionEasing",
    ]),
  }),
  shell,
  toolbar: object(
    visualFields([
      "bg",
      "border",
      "borderBottom",
      "color",
      "shadow",
      "solidBg",
      "solidColor",
      "solidBorder",
      "softBg",
      "softColor",
      "softBorder",
      "ghostBg",
      "ghostColor",
      "ghostBorder",
      "ghostShadow",
      "outlineBg",
      "outlineColor",
      "outlineBorder",
      "outlineShadow",
      "radius",
      "padding",
      "gap",
      "controlBg",
      "controlBorder",
      "controlColor",
      "divider",
    ])
  ),
  filterPill: object(
    visualFields([
      "bg",
      "border",
      "color",
      "shadow",
      "frameBg",
      "frameBorder",
      "frameShadow",
      "hoverBg",
      "hoverBorder",
      "activeBg",
      "activeBorder",
      "activeColor",
      "activeShadow",
      "focusRing",
      "countBg",
      "countActiveBg",
      "countBorder",
      "countActiveBorder",
      "countRing",
      "countActiveRing",
    ])
  ),
  badge: object({
    ...visualFields([
      "lineHeight",
      "letterSpacing",
      "gap",
      "borderColor",
      "textColor",
      "maxInlineSize",
      "chipMaxInlineSize",
      "pillMaxInlineSize",
      "frameWidth",
      "radius",
      "chipRadius",
      "pillRadius",
      "surface",
      "ink",
      "frame",
      "highlight",
      "shadow",
      "solidBg",
      "solidColor",
      "solidBorder",
      "softBg",
      "softColor",
      "softBorder",
      "ghostBg",
      "ghostColor",
      "ghostBorder",
      "ghostShadow",
      "outlineBg",
      "outlineColor",
      "outlineBorder",
      "outlineShadow",
      "surfaceHover",
      "inkHover",
      "frameHover",
      "highlightHover",
      "shadowHover",
      "hoverTransform",
      "surfacePressed",
      "inkPressed",
      "framePressed",
      "shadowPressed",
      "pressTransform",
      "focusRing",
      "selectedSurface",
      "selectedInk",
      "selectedFrame",
      "selectedShadow",
      "borderedRing",
      "iconSize",
      "iconColor",
      "iconBg",
      "iconBorder",
      "iconBorderWidth",
      "iconRadius",
      "iconShadow",
      "avatarSize",
      "avatarBleed",
      "avatarBg",
      "avatarBorder",
      "avatarBorderWidth",
      "avatarRadius",
      "avatarShadow",
      "dotSize",
      "dotBg",
      "dotBorder",
      "dotBorderWidth",
      "dotShadow",
      "countMinSize",
      "countSize",
      "countPaddingInline",
      "countBg",
      "countColor",
      "countBorder",
      "countBorderWidth",
      "countRadius",
      "countRing",
      "countFontSize",
      "countSelectedBg",
      "countSelectedBorder",
      "countSelectedRing",
      "removeSize",
      "removeTouchSize",
      "removeBleed",
      "removeBg",
      "removeColor",
      "removeBorder",
      "removeBorderWidth",
      "removeRadius",
      "removeHoverBg",
      "removeHoverTransform",
      "removeFocusRing",
      "disabledFilter",
      "motionDuration",
      "motionEasing",
      "pulseDuration",
      "pulseTiming",
      "spinnerDuration",
      "touchTarget",
      "containerPaddingInline",
      "indicatorMaxInlineSize",
      "indicatorRadius",
    ]),
    fontFamily: string("font-family"),
    countFontFamily: string("font-family"),
    fontWeight: FONT_WEIGHT,
    countFontWeight: FONT_WEIGHT,
    removeOpacity: OPACITY,
    disabledOpacity: OPACITY,
    loadingOpacity: OPACITY,
    pulseScale: number({ min: 1, max: 2 }),
  }),
  breadcrumb: object({
    ...visualFields([
      "bg",
      "border",
      "color",
      "linkColor",
      "itemColor",
      "colorHover",
      "colorActive",
      "separatorColor",
      "fontSize",
      "padding",
    ]),
    fontWeight: FONT_WEIGHT,
  }),
  search: object({
    commandPalette: object(
      visualFields([
        "backdrop",
        "bg",
        "border",
        "emptyColor",
        "groupColor",
        "itemHoverBg",
        "shortcutBorder",
      ])
    ),
    ...visualFields([
      "bg",
      "border",
      "color",
      "shadow",
      "radius",
      "inputBg",
      "inputBorder",
      "inputColor",
      "placeholderColor",
      "iconColor",
      "clearColor",
      "clearColorHover",
      "resultBg",
      "resultBgHover",
      "resultBorder",
      "resultShadow",
      "resultTitleColor",
      "resultMetaColor",
      "categoryColor",
      "emptyBg",
    ]),
  }),
  controls,
  table: object({
    anatomy: anatomy("table"),
    ...visualFields([
      "bg",
      "border",
      "radius",
      "headerBg",
      "headerBgHover",
      "headerColor",
      "headerFontSize",
      "headerLetterSpacing",
      "headerTextTransform",
      "headerBlockSize",
      "headerBorder",
      "headerShadow",
      "rowBg",
      "rowBgHover",
      "rowBgStriped",
      "rowBgSelected",
      "rowBgExpanded",
      "rowBorder",
      "rowHoverShadow",
      "cellPadding",
      "cellPaddingCompact",
      "cellPaddingComfortable",
      "cellPaddingSpacious",
      "cellFontSize",
      "cellColor",
      "filterRowBg",
      "filterFocusShadow",
      "resizeBg",
      "resizeBgHover",
      "reorderBg",
      "actionBg",
      "actionBorder",
      "sheen",
      "pageButtonHoverShadow",
      "loadingOverlayBg",
    ]),
    headerFontWeight: FONT_WEIGHT,
  }),
  cardComponent: object({
    anatomy: anatomy("cardComponent"),
    ...visualFields([
      "padding",
      "paddingSm",
      "paddingMd",
      "paddingLg",
      "paddingXl",
      "bg",
      "bgHover",
      "bgActive",
      "bgSelected",
      "bgDisabled",
      "color",
      "colorHover",
      "colorActive",
      "colorSelected",
      "colorDisabled",
      "colorMuted",
      "border",
      "borderColor",
      "borderWidth",
      "borderStyle",
      "borderHover",
      "borderColorHover",
      "borderActive",
      "borderSelected",
      "borderDisabled",
      "borderAccentHover",
      "radius",
      "radiusSm",
      "radiusLg",
      "radiusXl",
      "shadow",
      "shadowHover",
      "shadowActive",
      "shadowSelected",
      "shadowElevated",
      "focusRing",
      "focusRingColor",
      "focusRingWidth",
      "focusRingOffset",
      "selectedOutlineWidth",
      "hoverTransform",
      "activeTransform",
      "transitionDuration",
      "transitionTiming",
      "texture",
      "textureSize",
      "overlay",
      "surfaceGradient",
      "stateOverlay",
      "elevatedBg",
      "elevatedBorderWidth",
      "elevatedShadow",
      "elevatedShadowHover",
      "outlinedBg",
      "outlinedBorderWidth",
      "outlinedBorderColor",
      "outlinedShadow",
      "filledBg",
      "filledBorderWidth",
      "filledShadow",
      "ghostBg",
      "ghostBorderColor",
      "ghostShadow",
      "headerBorder",
      "headerBorderColor",
      "headerBorderWidth",
      "headerBg",
      "headerColor",
      "headerPadding",
      "headerPaddingSm",
      "headerPaddingLg",
      "headerGap",
      "headerActionsGap",
      "headerMinHeight",
      "headerCopyMaxWidth",
      "headerEyebrowSize",
      "headerEyebrowTracking",
      "headerIconSize",
      "headerIconRadius",
      "headerIconBg",
      "headerIconBorder",
      "headerIconColor",
      "headerExtraBg",
      "headerExtraBorder",
      "headerExtraRadius",
      "headerExtraPadding",
      "titleColor",
      "titleFontSize",
      "titleLineHeight",
      "titleLetterSpacing",
      "subtitleColor",
      "subtitleFontSize",
      "subtitleMarginTop",
      "bodyColor",
      "bodyPadding",
      "bodyPaddingSm",
      "bodyPaddingLg",
      "bodyFontSize",
      "bodyLineHeight",
      "footerBorder",
      "footerBorderColor",
      "footerBorderWidth",
      "footerBg",
      "footerColor",
      "footerPadding",
      "footerPaddingSm",
      "footerPaddingLg",
      "footerActionsGap",
      "actionsGap",
      "actionsMarginTop",
      "actionsPaddingTop",
      "coverInlineSize",
      "coverInlineMinSize",
      "coverBlockMinSize",
      "coverAspectRatio",
      "coverObjectPosition",
      "coverObjectFit",
      "bodyInlineMinSize",
      "imagePlaceholderBg",
      "imagePlaceholderColor",
      "imageHeight",
      "imageLoadingTrack",
      "imageLoadingActive",
      "imageLoadingSize",
      "imageLoadingStroke",
      "imageLoadingDuration",
      "imageErrorIconSize",
      "spinnerSize",
      "spinnerStroke",
      "spinnerTrack",
      "spinnerColor",
      "spinnerDuration",
      "loadingOverlayBg",
      "loadingBackdropBlur",
      "skeletonBg",
      "skeletonHighlight",
      "skeletonRadius",
      "skeletonDuration",
    ]),
    titleFontWeight: FONT_WEIGHT,
    disabledOpacity: OPACITY,
    textureOpacity: OPACITY,
    stateOverlayHoverOpacity: OPACITY,
    stateOverlayActiveOpacity: OPACITY,
    stateOverlaySelectedOpacity: OPACITY,
    loadingCoverOpacity: OPACITY,
    loadingSkeletonOpacity: OPACITY,
  }),
  metricCard: object({
    ...premiumCardFields,
    ...visualFields([
      "trendColor",
      "trendColorWarning",
      "trendColorError",
      "trendErrorBg",
      "trendErrorBorder",
      "meterFillSuccess",
      "meterFillWarning",
      "meterFillError",
      "meterFillNeutral",
      "meterHeight",
    ]),
  }),
  signalCard: object({
    ...premiumCardFields,
    ...visualFields([
      "accent",
      "soft",
      "badgeBg",
      "badgeBorder",
      "badgeColor",
      "sectionBg",
      "sectionAltBg",
      "topLineDisplay",
    ]),
  }),
  workspaceCard: object(premiumCardFields),
  compactCard: object(premiumCardFields),
  tallCard: object(premiumCardFields),
  collectionCard: object(premiumCardFields),
  listingGrid: object(
    visualFields([
      "gap",
      "minCardWidth",
      "minCompactWidth",
      "minTallWidth",
      "columns",
      "cardGap",
      "cardBg",
      "cardBorder",
      "cardShadow",
      "selectedRing",
      "emptyBg",
      "emptyBorder",
      "skeletonBg",
    ])
  ),
  modal: object(
    visualFields([
      "bg",
      "color",
      "shadow",
      "overlayBg",
      "overlayBackdrop",
      "headerBg",
      "headerBorder",
      "titleColor",
      "subtitleColor",
      "bodyColor",
      "footerBorder",
      "footerBg",
      "closeColor",
      "closeColorHover",
      "closeBgHover",
    ])
  ),
  tooltip: object(
    visualFields([
      "bg",
      "color",
      "shadow",
      "defaultBg",
      "defaultColor",
      "primaryBg",
      "primaryColor",
      "secondaryBg",
      "secondaryColor",
      "successBg",
      "warningBg",
      "errorBg",
      "borderedBackground",
      "borderedForeground",
      "borderedBorder",
      "borderedBorderWidth",
      "borderedShadow",
      "borderedTexture",
      "borderedHighlight",
      "borderedRadius",
      "borderedMaxWidth",
      "borderedPaddingBlock",
      "borderedPaddingInline",
      "minimalBackground",
      "minimalForeground",
      "minimalBorder",
      "minimalBorderWidth",
      "minimalShadow",
      "minimalTexture",
      "minimalHighlight",
      "minimalRadius",
      "minimalMaxWidth",
      "minimalPaddingBlock",
      "minimalPaddingInline",
      "inverseBackground",
      "inverseForeground",
      "inverseBorder",
      "inverseBorderWidth",
      "inverseShadow",
      "inverseTexture",
      "inverseHighlight",
      "inverseRadius",
      "inverseMaxWidth",
      "inversePaddingBlock",
      "inversePaddingInline",
      "richBackground",
      "richForeground",
      "richBorder",
      "richBorderWidth",
      "richShadow",
      "richTexture",
      "richHighlight",
      "richRadius",
      "richMaxWidth",
      "richPaddingBlock",
      "richPaddingInline",
      "richType",
      "richLetterSpacing",
      "compactPaddingBlock",
      "compactPaddingInline",
      "compactType",
      "comfortablePaddingBlock",
      "comfortablePaddingInline",
      "spaciousPaddingBlock",
      "spaciousPaddingInline",
      "spaciousType",
      "arrowSize",
      "arrowHalfSize",
      "arrowOverlap",
      "viewportGap",
      "touchTarget",
      "shortcutGap",
      "shortcutChipGap",
      "shortcutKeyBackground",
      "shortcutKeyBorder",
      "shortcutKeyBorderWidth",
      "shortcutKeyRadius",
      "shortcutKeyShadow",
      "shortcutKeyType",
      "motionDistance",
      "motionScale",
      "enterDuration",
      "enterEasing",
      "exitDuration",
      "exitEasing",
    ])
  ),
  popover: object(
    visualFields([
      "bg",
      "border",
      "contentColor",
      "shadow",
      "titleBorder",
      "borderedBackground",
      "borderedForeground",
      "borderedMutedForeground",
      "borderedBorder",
      "borderedBorderWidth",
      "borderedShadow",
      "borderedTexture",
      "borderedRadius",
      "borderedMaxWidth",
      "borderedPaddingBlock",
      "borderedPaddingInline",
      "borderedTitleGap",
      "minimalBackground",
      "minimalForeground",
      "minimalMutedForeground",
      "minimalBorder",
      "minimalBorderWidth",
      "minimalShadow",
      "minimalTexture",
      "minimalRadius",
      "minimalMaxWidth",
      "minimalPaddingBlock",
      "minimalPaddingInline",
      "inverseBackground",
      "inverseForeground",
      "inverseMutedForeground",
      "inverseBorder",
      "inverseShadow",
      "inverseTexture",
      "inverseRadius",
      "richBackground",
      "richForeground",
      "richMutedForeground",
      "richBorder",
      "richShadow",
      "richTexture",
      "richRadius",
      "richMaxWidth",
      "richPaddingBlock",
      "richPaddingInline",
      "compactPaddingBlock",
      "compactPaddingInline",
      "compactTitleGap",
      "compactMaxHeight",
      "comfortablePaddingBlock",
      "comfortablePaddingInline",
      "spaciousPaddingBlock",
      "spaciousPaddingInline",
      "spaciousTitleGap",
      "minWidth",
      "maxWidth",
      "maxHeight",
      "bodyMaxHeight",
      "viewportGap",
      "touchTarget",
      "arrowSize",
      "titleBackground",
      "titleColor",
      "titleDivider",
      "titleDividerWidth",
      "titlePaddingBlock",
      "titlePaddingInline",
      "titleGap",
      "titleType",
      "titleLetterSpacing",
      "bodyType",
      "motionDistance",
      "motionScale",
      "enterDuration",
      "enterEasing",
      "exitDuration",
      "exitEasing",
    ])
  ),
  tabs: object({
    ...visualFields([
      "border",
      "color",
      "colorHover",
      "colorActive",
      "bgHover",
      "borderActive",
      "listBg",
      "underlineListBg",
      "containedListBg",
      "segmentedListBg",
      "pillsListBg",
      "underlineHoverBg",
      "underlineActiveBg",
      "underlineItemRadius",
      "listBorder",
      "listRadius",
      "listPadding",
      "listWidth",
      "listMaxWidth",
      "underlineListWidth",
      "listShadow",
      "listBlur",
      "listTexture",
      "listTextureSize",
      "listHighlight",
      "gap",
      "itemGap",
      "itemRadius",
      "itemMaxWidth",
      "itemLineHeight",
      "itemLetterSpacing",
      "activeBg",
      "activeShadow",
      "activeTransform",
      "activeHighlight",
      "pressedTransform",
      "containedActiveBg",
      "containedActiveShadow",
      "segmentedActiveBg",
      "segmentedActiveShadow",
      "pillsActiveBg",
      "pillsActiveColor",
      "pillsActiveBorder",
      "pillsActiveShadow",
      "disabledColor",
      "disabledBg",
      "iconColor",
      "iconBg",
      "iconBgActive",
      "iconPadding",
      "iconRadius",
      "iconShadow",
      "iconShadowActive",
      "iconTransformActive",
      "badgeBg",
      "badgeColor",
      "badgeBorder",
      "badgeRadius",
      "badgeHeight",
      "badgeMinWidth",
      "badgePadding",
      "badgeFontSize",
      "badgeBgActive",
      "badgeColorActive",
      "badgeBorderActive",
      "indicatorHeight",
      "indicatorGradient",
      "indicatorRadius",
      "indicatorShadow",
      "panelPadding",
      "panelGap",
      "panelBg",
      "panelBorder",
      "panelRadius",
      "panelShadow",
      "panelFocusRing",
      "panelTexture",
      "panelHighlight",
      "panelMotionDistance",
      "overflowControlSize",
      "overflowControlBg",
      "overflowControlColor",
      "overflowControlBorder",
      "overflowControlShadow",
      "overflowControlBgHover",
      "overflowControlShadowHover",
      "overflowFadeWidth",
      "overflowFadeColor",
      "mobilePadding",
      "mobileGap",
      "mobileItemMaxWidth",
      "motionDuration",
      "motionEasing",
      "activeRevealDuration",
      "panelMotionDuration",
      "panelMotionEasing",
      "smHeight",
      "smPadding",
      "smFontSize",
      "smIconSize",
      "mdHeight",
      "mdPadding",
      "mdFontSize",
      "mdIconSize",
      "lgHeight",
      "lgPadding",
      "lgFontSize",
      "lgIconSize",
    ]),
    itemFontFamily: string("font-family"),
    itemFontWeight: FONT_WEIGHT,
    itemFontWeightActive: FONT_WEIGHT,
    badgeFontWeight: FONT_WEIGHT,
    listTextureOpacity: OPACITY,
    activeHighlightOpacity: OPACITY,
    disabledOpacity: OPACITY,
  }),
  alert: object(
    visualFields([
      "errorBg",
      "errorBorder",
      "errorColor",
      "errorIcon",
      "infoBg",
      "infoBorder",
      "infoColor",
      "infoIcon",
      "successBg",
      "successBorder",
      "successColor",
      "successIcon",
      "warningBg",
      "warningBorder",
      "warningColor",
      "warningIcon",
    ])
  ),
  anchor: object(visualFields(["inkColor", "linkColor", "linkColorActive"])),
  avatar: object(
    visualFields([
      "borderColor",
      "defaultBg",
      "defaultColor",
      "errorBg",
      "errorColor",
      "gradientBg",
      "gradientColor",
      "groupBorder",
      "groupOverflowBg",
      "groupOverflowColor",
      "primaryBg",
      "primaryColor",
      "ringColor",
      "secondaryBg",
      "secondaryColor",
      "statusBorder",
      "successBg",
      "successColor",
      "warningBg",
      "warningColor",
    ])
  ),
  backTop: object(visualFields(["bg", "color", "shadow"])),
  calendar: object(
    visualFields(["bg", "border", "dayColorOther", "headerColor"])
  ),
  collapse: object(
    visualFields([
      "bg",
      "border",
      "contentBg",
      "headerBg",
      "headerBgHover",
      "headerColor",
    ])
  ),
  descriptions: object(
    visualFields(["bg", "border", "contentColor", "labelColor"])
  ),
  drawer: object(
    visualFields([
      "bg",
      "bodyColor",
      "footerBorder",
      "headerBorder",
      "shadow",
      "titleColor",
    ])
  ),
  dropdown: object(
    visualFields([
      "bg",
      "itemBgActive",
      "itemBgHover",
      "itemColor",
      "itemColorActive",
      "itemColorHover",
      "shadow",
    ])
  ),
  empty: object(visualFields(["descriptionColor", "iconColor"])),
  floatButton: object(
    visualFields([
      "badgeBg",
      "badgeColor",
      "defaultBg",
      "defaultColor",
      "descriptionColor",
      "primaryBg",
      "primaryColor",
    ])
  ),
  liveFeed: object(
    visualFields([
      "badgeBg",
      "badgeColor",
      "bg",
      "border",
      "emptyColor",
      "loadMoreColor",
      "newBg",
      "newBorder",
      "newColor",
      "refreshColor",
      "skeletonBg",
    ])
  ),
  menu: object(
    visualFields([
      "bg",
      "darkBg",
      "darkItemColor",
      "dividerColor",
      "focusRingColor",
      "groupTitleColor",
      "itemBgActive",
      "itemBgHover",
      "itemColor",
      "itemColorActive",
      "itemColorHover",
      "itemDangerColor",
      "itemHoverBg",
      "itemSelectedBg",
      "itemSelectedColor",
      "submenuBg",
    ])
  ),
  message: object(
    visualFields(["bg", "closeColor", "closeColorHover", "shadow"])
  ),
  notification: object(visualFields(["bg", "shadow", "titleColor"])),
  pagination: object(
    visualFields([
      "activeBg",
      "activeColor",
      "itemBg",
      "itemBgActive",
      "itemBgHover",
      "itemBorder",
      "itemColor",
      "itemColorActive",
      "itemColorHover",
    ])
  ),
  progress: object(
    visualFields([
      "bg",
      "fillError",
      "fillPrimary",
      "fillSuccess",
      "fillWarning",
    ])
  ),
  result: object(visualFields(["iconColor", "subtitleColor", "titleColor"])),
  skeleton: object(visualFields(["bg", "highlight", "waveGradient"])),
  spinner: object(visualFields(["color", "track"])),
  statistic: object(
    visualFields(["prefixColor", "suffixColor", "titleColor", "valueColor"])
  ),
  statsGrid: object(
    visualFields([
      "cardBg",
      "cardBorder",
      "cardFilledBg",
      "cardGlassBg",
      "cardGlassBorder",
      "descriptionColor",
      "labelColor",
      "skeletonBg",
      "skeletonWaveGradient",
      "trendNegative",
      "trendNeutral",
      "trendPositive",
      "valueColor",
    ])
  ),
  steps: object(
    visualFields([
      "connectorColor",
      "connectorColorActive",
      "finishBg",
      "finishBorder",
      "itemBg",
      "itemBgActive",
      "itemColor",
      "itemColorActive",
      "processBg",
      "processBorder",
      "waitBg",
      "waitBorder",
    ])
  ),
  tag: object(
    visualFields([
      "border",
      "defaultBg",
      "defaultBorder",
      "defaultColor",
      "errorBg",
      "errorBorder",
      "errorColor",
      "primaryBg",
      "primaryBorder",
      "primaryColor",
      "secondaryBg",
      "secondaryBorder",
      "secondaryColor",
      "successBg",
      "successBorder",
      "successColor",
      "warningBg",
      "warningBorder",
      "warningColor",
    ])
  ),
  timeline: object(
    visualFields(["contentColor", "dotBg", "dotBorder", "lineColor"])
  ),
  tree: object(
    visualFields([
      "nodeBgHover",
      "nodeBgSelected",
      "nodeColor",
      "nodeColorSelected",
    ])
  ),
});

const NEUTRAL_OVERRIDE_TOKENS = new Set<string>(
  TENANT_THEME_NEUTRAL_OVERRIDE_TOKENS
);

/**
 * The VALUE law of every raw override token, one row per token.
 *
 * Exported because it is not the write terminal's private table: the v1
 * producers lower the same `tokenOverrides` object into Theme keypaths, and
 * while this table was held privately they admitted an unregistered font-pack
 * reference and a line height of `99` that publication refused (S19-A01).
 */
export const TENANT_THEME_TOKEN_VALUE_RULES: Readonly<
  Record<string, TenantThemeSchemaNode>
> =
  Object.fromEntries(
    TENANT_THEME_OVERRIDE_TOKENS.map((token) => {
      if (token.startsWith("--ds-chart-category-")) return [token, HEX_COLOR];
      if (NEUTRAL_OVERRIDE_TOKENS.has(token)) return [token, HEX_COLOR];
      if (token.startsWith("--ds-color-") || token.startsWith("--ds-overlay-"))
        return [token, COLOR];
      if (token.startsWith("--ds-font-family-"))
        return [token, string("font-family")];
      if (token.startsWith("--ds-line-height-"))
        return [token, number({ min: 0.5, max: 3 })];
      if (token === "--ds-density-scale")
        return [token, number({ min: 0.75, max: 1.25 })];
      if (token === "--ds-effect-intensity")
        return [token, number({ min: 0, max: 1 })];
      return [token, VISUAL];
    })
  );

/**
 * Governed responsive-posture selection (E2): closed enum over the published
 * first-party registry (`compact` | `balanced` | `expansive`) — a customer
 * document can only SELECT a ladder, never author thresholds or span biases.
 * Absent means `balanced`, whose values ARE the pre-capability constants.
 */
const responsivePosture = enumeration(
  ...RESPONSIVE_POSTURE_PROFILES.map((profile) => profile.id)
);

const advanced = object({
  chrome,
  tokenOverrides: object(TENANT_THEME_TOKEN_VALUE_RULES),
  profiles: expressiveProfiles,
  responsivePosture,
});

const documentFields: Readonly<Record<string, TenantThemeSchemaNode>> = {
  schemaVersion: literal(TENANT_THEME_SCHEMA_VERSION),
};

const identityFields: Readonly<Record<string, TenantThemeSchemaNode>> = {
  tenantId: string("identifier"),
  slug: string("slug"),
  verticalKey: string("slug"),
  rowVersion: number({ integer: true, min: 0 }),
};

function deepFreeze<T>(value: T): Readonly<T> {
  if (value !== null && typeof value === "object") {
    for (const child of Object.values(value as Record<string, unknown>))
      deepFreeze(child);
    if (!Object.isFrozen(value)) Object.freeze(value);
  }
  return value;
}

export const TENANT_THEME_CONFIG_SCHEMA = deepFreeze({
  id: "rottay.tenant-theme-config",
  schemaVersion: TENANT_THEME_SCHEMA_VERSION,
  documents: Object.freeze({
    simple: object(
      { ...documentFields, mode: literal("simple"), appearance: general },
      ["schemaVersion", "mode", "appearance"]
    ),
    advanced: object(
      {
        ...documentFields,
        mode: literal("advanced"),
        visualFoundation: object({ general, advanced, recipeProfile }),
      },
      ["schemaVersion", "mode", "visualFoundation"]
    ),
  }),
  modes: Object.freeze({
    simple: object(
      {
        ...documentFields,
        ...identityFields,
        mode: literal("simple"),
        appearance: general,
      },
      [
        "schemaVersion",
        "tenantId",
        "slug",
        "verticalKey",
        "rowVersion",
        "mode",
        "appearance",
      ]
    ),
    advanced: object(
      {
        ...documentFields,
        ...identityFields,
        mode: literal("advanced"),
        visualFoundation: object({ general, advanced, recipeProfile }),
      },
      [
        "schemaVersion",
        "tenantId",
        "slug",
        "verticalKey",
        "rowVersion",
        "mode",
        "visualFoundation",
      ]
    ),
  }),
  scopeAttributes: Object.freeze([
    "data-ds-root",
    "data-vertical",
    "data-tenant",
  ]),
  forbiddenCapabilities: Object.freeze([
    "rawCss",
    "selectors",
    "engine",
    "componentPack",
    "topology",
    "permissions",
    "semanticMappings",
    "iconGlyphs",
    "iconContainers",
    "motionRecipes",
    "chartRenderer",
    "chartDataSemantics",
  ]),
  overrideTokens: TENANT_THEME_OVERRIDE_TOKENS,
  referenceTokens: TENANT_THEME_REFERENCE_TOKENS,
  fontPackIds: TENANT_THEME_FONT_PACK_IDS,
  limits: Object.freeze({
    maxDocumentBytes: 65_536,
    maxDepth: 10,
    maxObjectFields: 512,
    // Advanced can legally project broad chrome plus 70 compiler-owned color
    // ramp variables. The adversarial max-byte v2 fixture emits 69,894 bytes:
    // 64 KiB is 4,358 bytes too small; 88 KiB leaves 20,218 bytes of headroom
    // while remaining a hard SSR/hydration ceiling.
    maxCompiledVariables: 512,
    maxCompiledVariableBytes: 90_112,
    // Single authority for the raw tokenOverrides entry cap. The appearance
    // compiler imports this value; a second literal 200 anywhere is a
    // cascade-integrity defect.
    maxTokenOverrides: 200,
    maxStringLength: 512,
    maxFontFamilyLength: 200,
    maxShadowLayers: 4,
    maxGradientStops: 8,
    maxPaddingPx: 128,
    maxRadiusPx: 64,
    maxGapPx: 64,
    maxGridSizePx: 256,
  }),
});

const FONT_PACK_REFERENCE =
  /var\(--ds-font-pack-([a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?)\)/g;

/**
 * Admit only code-owned font-pack variables inside an otherwise ordinary CSS
 * font-family list. Arbitrary `var()` references and fallback arguments stay
 * forbidden, so DB data can choose a loaded pack but cannot name private DS
 * tokens or turn font loading into a tenant-owned asset channel.
 *
 * Both doors that admit a tenant font read it: the write validator and the
 * ingress migration. Held privately by the first, the second admitted what the
 * first refused.
 */
export function isSafeFontFamily(value: string): boolean {
  const limits = TENANT_THEME_CONFIG_SCHEMA.limits;
  if (
    value.length === 0 ||
    value.length > limits.maxFontFamilyLength ||
    value !== value.trim()
  )
    return false;
  const references = value.match(FONT_PACK_REFERENCE) ?? [];
  const allVarFunctions = value.match(/var\s*\(/gi) ?? [];
  if (references.length !== allVarFunctions.length) return false;
  const allowedPacks = new Set<string>(TENANT_THEME_FONT_PACK_IDS);
  for (const reference of references) {
    const packId = /^var\(--ds-font-pack-(.+)\)$/.exec(reference)?.[1];
    if (!packId || !allowedPacks.has(packId)) return false;
  }
  const withoutFontPacks = value.replace(FONT_PACK_REFERENCE, "FontPack");
  return /^[\p{L}\p{N}\s'",._-]+$/u.test(withoutFontPacks);
}

export const TENANT_THEME_GENERAL_SCHEMA = general;
export const TENANT_THEME_ADVANCED_SCHEMA = advanced;

/* -------------------------------------------------------------------------- */
/* The value grammar every door reads (S19-A01)                               */
/* -------------------------------------------------------------------------- */

/**
 * The grammar and the node validator live BELOW the doors that read them.
 *
 * They used to sit in the admission facade and in the write terminal, which
 * are both above the v1 ingress: a preview and a persisted-intent compile
 * therefore lowered `tokenOverrides` with no value law at all, and a tenant
 * could paint a reference or a magnitude that publication refused by name.
 * Here the schema owner that STATES each token's rule is also the owner that
 * evaluates it, so the three routes cannot answer differently.
 */

function isBalancedVisualValue(value: string): boolean {
  let quote: string | null = null;
  let depth = 0;
  for (let index = 0; index < value.length; index += 1) {
    const character = value[index];
    if (quote) {
      if (character === quote) quote = null;
      continue;
    }
    if (character === '"' || character === "'") {
      quote = character;
    } else if (character === "(") {
      depth += 1;
    } else if (character === ")") {
      depth -= 1;
      if (depth < 0) return false;
    }
  }
  return quote === null && depth === 0;
}

function countCommasAtDepth(value: string, targetDepth: number): number {
  let depth = 0;
  let quote: string | null = null;
  let count = 0;
  for (const character of value) {
    if (quote) {
      if (character === quote) quote = null;
      continue;
    }
    if (character === '"' || character === "'") quote = character;
    else if (character === "(") depth += 1;
    else if (character === ")") depth -= 1;
    else if (character === "," && depth === targetDepth) count += 1;
  }
  return count;
}

function countGradientStops(value: string): number {
  const open = value.search(
    /(?:repeating-)?(?:linear|radial|conic)-gradient\s*\(/i
  );
  if (open < 0) return 0;
  const bodyStart = value.indexOf("(", open) + 1;
  let depth = 1;
  let quote: string | null = null;
  let current = "";
  const args: string[] = [];
  for (let index = bodyStart; index < value.length; index += 1) {
    const character = value[index];
    if (quote) {
      current += character;
      if (character === quote) quote = null;
      continue;
    }
    if (character === '"' || character === "'") {
      quote = character;
      current += character;
    } else if (character === "(") {
      depth += 1;
      current += character;
    } else if (character === ")") {
      depth -= 1;
      if (depth === 0) {
        args.push(current.trim());
        break;
      }
      current += character;
    } else if (character === "," && depth === 1) {
      args.push(current.trim());
      current = "";
    } else {
      current += character;
    }
  }
  if (args.length === 0) return 0;
  const first = args[0].toLowerCase();
  const hasPreamble =
    /^(?:to\s|[-+]?\d+(?:\.\d+)?(?:deg|rad|turn)|circle\b|ellipse\b|at\s|from\s|in\s)/.test(
      first
    );
  return Math.max(0, args.length - (hasPreamble ? 1 : 0));
}

function respectsDimensionCap(value: string, capPx: number): boolean {
  if (value.includes("var(")) return true;
  if (/\b(?:calc|min|max|clamp)\s*\(/i.test(value)) return false;
  const dimensions = [...value.matchAll(/(-?\d+(?:\.\d+)?)(px|rem|em|%)?/gi)];
  if (dimensions.length === 0) return false;
  return dimensions.every((match) => {
    const numeric = Number(match[1]);
    const unit = match[2] ?? "";
    if (numeric < 0) return false;
    if (unit === "%") return numeric <= 100;
    const converted = dimensionToPx(numeric, unit);
    return converted !== null && converted <= capPx;
  });
}

/**
 * The nine G4 sidebar geometry channels are the only capped keypaths whose
 * mode overlay may author the CSS-wide keyword `initial`. Rottay's light mode
 * has no root-level floor for them, so the overlay has to *reset* the channel
 * instead of repainting it; `initial` carries no magnitude, so a dimension cap
 * has nothing to bound and the `dimensions.length === 0` early return in
 * `respectsDimensionCap` would otherwise reject the reset. The allowlist is
 * deliberately field- and path-scoped: every other capped field keeps
 * rejecting `initial`.
 */
const SIDEBAR_GEOMETRY_RESET_FIELDS: ReadonlySet<string> = new Set([
  "shellPaddingInline",
  "shellPaddingCollapsed",
  "itemHeight",
  "itemChildHeight",
  "itemFontSizeChild",
  "itemPaddingInline",
  "iconColumnSize",
  "itemGap",
  "childPaddingInline",
]);

function admitsSidebarGeometryReset(path: string, field: string): boolean {
  return (
    SIDEBAR_GEOMETRY_RESET_FIELDS.has(field) &&
    /(?:^|\.)sidebar\.[^.]+$/.test(path)
  );
}

/**
 * True when a value cannot terminate its declaration, open a comment, fetch,
 * or exceed an authored cap.
 *
 * `enforceAuthoredCaps` separates an AUTHORED leaf (a document field, where the
 * tenant's own caps apply) from an EMITTED channel (what the compiler produced
 * from one, where the grammar still applies but the authored caps were already
 * enforced upstream).
 */
export function isSafeVisualValue(
  value: string,
  path: string,
  enforceAuthoredCaps = true
): boolean {
  const limits = TENANT_THEME_CONFIG_SCHEMA.limits;
  if (
    value.length === 0 ||
    value.length > limits.maxStringLength ||
    value !== value.trim()
  )
    return false;
  const field = path.slice(path.lastIndexOf(".") + 1).replace(/[\]"']/g, "");
  // `initial` is a cascade reset, not a paint: it blanks the channel instead of
  // giving it a value. Only the nine G4 sidebar geometry mode resets may author
  // it, so no other authored keypath can silently erase a governed channel.
  const isSidebarGeometryReset =
    value === "initial" && admitsSidebarGeometryReset(path, field);
  if (enforceAuthoredCaps && value === "initial" && !isSidebarGeometryReset)
    return false;
  const forbiddenCharacters = enforceAuthoredCaps
    ? /[\u0000-\u001f\u007f{};<>\[\]@\\]/
    : /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f{};<>\[\]@\\]/;
  if (forbiddenCharacters.test(value)) return false;
  if (
    /\/\*|\*\/|!\s*important|expression\s*\(|url\s*\(|javascript\s*:|data\s*:|-moz-binding/i.test(
      value
    )
  )
    return false;
  if (!isBalancedVisualValue(value)) return false;

  const functionNames = [...value.matchAll(/([a-z][a-z0-9-]*)\s*\(/gi)].map(
    (match) => match[1].toLowerCase()
  );
  if (functionNames.some((name) => !ALLOWED_VALUE_FUNCTIONS.has(name)))
    return false;

  const varCount = functionNames.filter((name) => name === "var").length;
  const varReferences = [...value.matchAll(/var\(\s*(--[a-z0-9-]+)/gi)];
  if (varReferences.length !== varCount) return false;
  if (enforceAuthoredCaps) {
    const allowedReferences = new Set<string>(TENANT_THEME_REFERENCE_TOKENS);
    if (varReferences.some((match) => !allowedReferences.has(match[1])))
      return false;
  } else if (varReferences.some((match) => !match[1].startsWith("--ds-"))) {
    return false;
  }

  const lowerPath = path.toLowerCase();
  if (
    enforceAuthoredCaps &&
    (lowerPath.includes("shadow") || lowerPath.includes("ring"))
  ) {
    if (countCommasAtDepth(value, 0) + 1 > limits.maxShadowLayers) return false;
    const shadowDimensions = [
      ...value.matchAll(/(-?\d+(?:\.\d+)?)(px|rem|em)/gi),
    ];
    if (
      shadowDimensions.some((match) => {
        const converted = dimensionToPx(
          Math.abs(Number(match[1])),
          match[2].toLowerCase()
        );
        return converted === null || converted > 128;
      })
    )
      return false;
  }
  if (enforceAuthoredCaps && /gradient\s*\(/i.test(value)) {
    if (countGradientStops(value) > limits.maxGradientStops) return false;
  }

  if (
    enforceAuthoredCaps &&
    /padding/i.test(field) &&
    !isSidebarGeometryReset &&
    !respectsDimensionCap(value, limits.maxPaddingPx)
  )
    return false;
  if (
    enforceAuthoredCaps &&
    /radius/i.test(field) &&
    !isSidebarGeometryReset &&
    !respectsDimensionCap(value, limits.maxRadiusPx)
  )
    return false;
  if (
    enforceAuthoredCaps &&
    /gap/i.test(field) &&
    !isSidebarGeometryReset &&
    !respectsDimensionCap(value, limits.maxGapPx)
  )
    return false;
  if (
    enforceAuthoredCaps &&
    /gridSize/i.test(field) &&
    !isSidebarGeometryReset &&
    !respectsDimensionCap(value, limits.maxGridSizePx)
  )
    return false;

  return true;
}

function childPath(path: string, key: string): string {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key)
    ? `${path}.${key}`
    : `${path}[${JSON.stringify(key)}]`;
}

function isTenantColor(value: string): boolean {
  return (
    isSafeVisualValue(value, "$.color") &&
    isValidCssColor(value) &&
    !/^(?:var|inherit|currentColor|unset|initial|none)\b/i.test(value)
  );
}

/**
 * Judge one value against one schema node, reporting issues by path.
 *
 * The write terminal validates whole documents with it; the v1 ingress
 * validates the token-override leaves it is about to lower. Same rule, same
 * code, same message, so a refusal can be compared across routes rather than
 * merely observed on one.
 */
export function validateTenantThemeNode(
  value: unknown,
  rule: TenantThemeSchemaNode,
  path: string,
  issues: TenantThemeValidationIssue[]
): void {
  if (rule.type === "object") {
    if (!isPlainObject(value)) {
      issues.push({
        code: "invalid_type",
        path,
        message: "Expected an object",
      });
      return;
    }
    for (const required of rule.required ?? []) {
      if (!Object.prototype.hasOwnProperty.call(value, required)) {
        issues.push({
          code: "invalid_type",
          path: childPath(path, required),
          message: "Required field is missing",
        });
      }
    }
    for (const key of Object.keys(value).sort()) {
      if (!Object.prototype.hasOwnProperty.call(rule.fields, key)) {
        issues.push({
          code: "unknown_key",
          path: childPath(path, key),
          message: "Field is not part of TenantThemeConfig v1",
        });
        continue;
      }
      validateTenantThemeNode(
        value[key],
        rule.fields[key],
        childPath(path, key),
        issues
      );
    }
    return;
  }

  if (rule.type === "literal") {
    if (value !== rule.value)
      issues.push({
        code: "invalid_value",
        path,
        message: `Expected literal ${JSON.stringify(rule.value)}`,
      });
    return;
  }

  if (rule.type === "enum") {
    if (!rule.values.includes(value as string | number)) {
      issues.push({
        code: "invalid_value",
        path,
        message: `Expected one of ${rule.values.join(", ")}`,
      });
    }
    return;
  }

  if (rule.type === "number") {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      issues.push({
        code: "invalid_type",
        path,
        message: "Expected a finite number",
      });
      return;
    }
    if (rule.integer && !Number.isSafeInteger(value)) {
      issues.push({
        code: "invalid_value",
        path,
        message: "Expected a safe integer",
      });
    } else if (
      (rule.min !== undefined && value < rule.min) ||
      (rule.max !== undefined && value > rule.max)
    ) {
      issues.push({
        code: "invalid_value",
        path,
        message: `Number must be between ${rule.min ?? "-∞"} and ${
          rule.max ?? "∞"
        }`,
      });
    }
    return;
  }

  if (typeof value !== "string") {
    issues.push({ code: "invalid_type", path, message: "Expected a string" });
    return;
  }

  let valid = false;
  switch (rule.format) {
    case "identifier":
      valid = /^[A-Za-z0-9][A-Za-z0-9:_-]{0,127}$/.test(value);
      break;
    case "slug":
      valid = /^[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?$/.test(value);
      break;
    case "color":
      valid = isTenantColor(value);
      break;
    case "hex-color":
      valid = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value);
      break;
    case "font-family":
      valid = isSafeFontFamily(value);
      break;
    case "visual-value":
      valid = isSafeVisualValue(value, path);
      break;
  }
  if (!valid)
    issues.push({
      code: "unsafe_value",
      path,
      message: `Invalid or unsafe ${rule.format}`,
    });
}

/**
 * The raw override values a transport is about to admit, judged by the same
 * table publication judges them with, at the path publication names.
 *
 * A token with no row is not silently admitted here: it has no keypath either,
 * and the caller that owns the key grammar refuses it by name before asking
 * this owner about its value.
 */
export function tenantThemeTokenOverrideIssues(
  overrides: Readonly<Record<string, unknown>>,
  path: string
): TenantThemeValidationIssue[] {
  const issues: TenantThemeValidationIssue[] = [];
  for (const key of Object.keys(overrides).sort()) {
    const rule = TENANT_THEME_TOKEN_VALUE_RULES[key];
    if (rule) validateTenantThemeNode(overrides[key], rule, childPath(path, key), issues);
  }
  return issues;
}
