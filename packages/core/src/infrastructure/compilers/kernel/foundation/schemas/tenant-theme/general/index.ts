/**
 * The `general` appearance node of the TenantThemeConfig v1 schema.
 */

import { MOTION_DIAL_BOUNDS } from "@/foundation/contracts/runtime/motion";
import {
  TENANT_THEME_EFFECT_INTENSITY_BOUNDS,
  TENANT_THEME_RADIUS_SCALE_BOUNDS,
  TENANT_THEME_TYPE_SCALE_BOUNDS,
} from "@/foundation/contracts/composition/tenants/themes/tenant-theme";
import { EXPERIENCE_PROFILES } from "@/foundation/tokens/ts/presentation/expressive-profiles";
import {
  COLOR,
  HEX_COLOR,
  enumeration,
  number,
  object,
  string,
} from "../foundation";

/**
 * Governed experience-profile selection (C1b): closed enum over the published
 * first-party registry, mirroring the recipe-profile idiom — a customer
 * document can only SELECT a composition id, never author profile content.
 */
const experienceProfile = enumeration(
  ...EXPERIENCE_PROFILES.map((profile) => profile.id)
);

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

export { general };
