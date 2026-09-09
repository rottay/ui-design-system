/**
 * Canonical lowering for bounded appearance postures shared by the static
 * BrandTheme compiler and the DB Appearance compiler.
 *
 * A posture may come from an explicitly authored field or an expressive
 * profile, but it must reach the same CSS channels through this one table.
 */
import type {
  BrandTypography,
  BrandSurfaces,
  TenantAppearanceGeneral,
} from "@/foundation/contracts/composition/tenants/themes";
import {
  TENANT_THEME_RADIUS_SCALE_BOUNDS,
  TENANT_THEME_TYPE_SCALE_BOUNDS,
} from "@/foundation/contracts/composition/tenants/themes/tenant-theme";
import { MOTION_DIAL_BOUNDS } from "@/foundation/contracts/runtime/motion";
import {
  dialReachableRadius,
  resolveRadiusScale,
} from "@/foundation/kernel/geometry/radius-dial";
import { clamp } from "@/foundation/kernel/math";
import { withArabicSafeFallback } from "@/foundation/kernel/typography";
import {
  DENSITY_MODE_FACTOR_VARIABLE,
  isDensityPreference,
  resolveDensityModeFactor,
} from "@/foundation/tokens/ts/foundation/base/density";
import { TYPE_PAIRINGS } from "@/foundation/tokens/ts/presentation/typography/pairings";

export interface AppearancePostureFields {
  readonly typePairing?: NonNullable<
    NonNullable<TenantAppearanceGeneral["typography"]>["typePairing"]
  >;
  readonly typeScale?: number;
  readonly buttonStyle?: NonNullable<
    NonNullable<TenantAppearanceGeneral["shape"]>["buttonStyle"]
  >;
  readonly radiusScale?: number;
  readonly density?: BrandSurfaces["density"];
  readonly motion?: TenantAppearanceGeneral["motion"];
  readonly elevation?: NonNullable<
    NonNullable<TenantAppearanceGeneral["surfaces"]>["elevation"]
  >;
}

const BUTTON_STYLE_RADIUS: Readonly<
  Record<NonNullable<AppearancePostureFields["buttonStyle"]>, string>
> = {
  sharp: "2px",
  soft: "var(--ds-radius-md, 8px)",
  pill: "9999px",
};

/** Raw Theme fields implied by a governed pairing before explicit families win. */
export function typePairingToTypography(
  typePairing: AppearancePostureFields["typePairing"]
): BrandTypography {
  if (!typePairing) return {};
  const pairing = TYPE_PAIRINGS[typePairing];
  if (!pairing) return {};
  return {
    fontFamilyBase: pairing.base,
    fontFamilyHeading: pairing.heading,
    ...("mono" in pairing && pairing.mono
      ? { fontFamilyMono: pairing.mono }
      : {}),
    letterSpacing: { heading: pairing.headingLs },
    lineHeight: { display: pairing.displayLh },
  };
}

/** Raw silhouette radius; radius-dial folding remains compiler-owned. */
export function buttonStyleRadius(
  buttonStyle: AppearancePostureFields["buttonStyle"]
): string | undefined {
  return buttonStyle ? BUTTON_STYLE_RADIUS[buttonStyle] : undefined;
}

/**
 * The ladder each governed posture states, over all SEVEN roles plus the
 * border weight it implies.
 *
 * It used to state roles 1..3 only, so a theme that asked for a flat product
 * still got the full derived depth on roles 4..6: three steps of one posture
 * on top of four of another. A posture is a statement about the whole ladder
 * or it is not a posture. `soft` is the identity and states nothing, which is
 * what leaves the derived foundation ramp standing.
 */
const ELEVATION_PRESET: Readonly<
  Record<
    NonNullable<AppearancePostureFields["elevation"]>,
    Readonly<Record<string, string>>
  >
> = {
  flat: {
    "--ds-elevation-0": "none",
    "--ds-elevation-1": "none",
    "--ds-elevation-2": "none",
    "--ds-elevation-3": "0 1px 2px rgba(0,0,0,0.05)",
    "--ds-elevation-4": "0 1px 3px rgba(0,0,0,0.06)",
    "--ds-elevation-5": "0 2px 4px rgba(0,0,0,0.07)",
    "--ds-elevation-6": "0 2px 6px rgba(0,0,0,0.08)",
    "--ds-elevation-border-style": "solid",
  },
  soft: {},
  elevated: {
    "--ds-elevation-0": "none",
    "--ds-elevation-1": "0 2px 4px rgba(0,0,0,0.08)",
    "--ds-elevation-2": "0 4px 8px rgba(0,0,0,0.1)",
    "--ds-elevation-3": "0 8px 16px rgba(0,0,0,0.12)",
    "--ds-elevation-4": "0 16px 32px rgba(0,0,0,0.14)",
    "--ds-elevation-5": "0 24px 48px rgba(0,0,0,0.16)",
    "--ds-elevation-6": "0 32px 64px rgba(0,0,0,0.18)",
    "--ds-elevation-border-style": "none",
  },
};

export function appearancePostureToVariables(
  posture: AppearancePostureFields
): Record<string, string> {
  const vars: Record<string, string> = {};

  if (posture.typePairing) {
    const typography = typePairingToTypography(posture.typePairing);
    if (typography.fontFamilyHeading)
      vars["--ds-font-family-heading"] = withArabicSafeFallback(
        typography.fontFamilyHeading
      );
    if (typography.fontFamilyBase)
      vars["--ds-font-family-base"] = withArabicSafeFallback(
        typography.fontFamilyBase
      );
    if (typography.fontFamilyMono)
      vars["--ds-font-family-mono"] = typography.fontFamilyMono;
    if (typography.letterSpacing?.heading)
      vars["--ds-letter-spacing-heading"] = typography.letterSpacing.heading;
    if (typography.lineHeight?.display != null)
      vars["--ds-line-height-display"] = String(typography.lineHeight.display);
  }

  if (
    typeof posture.typeScale === "number" &&
    Number.isFinite(posture.typeScale)
  ) {
    vars["--ds-type-scale"] = String(
      clamp(
        posture.typeScale,
        TENANT_THEME_TYPE_SCALE_BOUNDS.min,
        TENANT_THEME_TYPE_SCALE_BOUNDS.max
      )
    );
  }

  const clampedRadiusScale =
    typeof posture.radiusScale === "number" &&
    Number.isFinite(posture.radiusScale)
      ? clamp(
          posture.radiusScale,
          TENANT_THEME_RADIUS_SCALE_BOUNDS.min,
          TENANT_THEME_RADIUS_SCALE_BOUNDS.max
        )
      : undefined;

  if (posture.buttonStyle) {
    // Two of the three presets are literals, and a literal at tenant scope is
    // unreachable by the very dial declared beside it. `soft` already reads the
    // ramp, so the helper leaves it alone. The divisor is the scale this same
    // posture emits below, so a silhouette keeps its exact resting geometry.
    vars["--ds-radius-button"] = dialReachableRadius(
      buttonStyleRadius(posture.buttonStyle)!,
      resolveRadiusScale(clampedRadiusScale)
    );
  }
  if (clampedRadiusScale !== undefined) {
    vars["--ds-radius-scale"] = String(clampedRadiusScale);
  }
  if (isDensityPreference(posture.density)) {
    const f = resolveDensityModeFactor(posture.density);
    if (f !== 1) vars[DENSITY_MODE_FACTOR_VARIABLE] = String(f);
  }

  const motion = posture.motion;
  if (motion) {
    if (
      typeof motion.intensity === "number" &&
      Number.isFinite(motion.intensity)
    ) {
      vars["--ds-motion-intensity"] = String(
        clamp(
          motion.intensity,
          MOTION_DIAL_BOUNDS.intensity.min,
          MOTION_DIAL_BOUNDS.intensity.max
        )
      );
    }
    if (
      typeof motion.durationScale === "number" &&
      Number.isFinite(motion.durationScale)
    ) {
      vars["--ds-motion-duration-scale"] = String(
        clamp(
          motion.durationScale,
          MOTION_DIAL_BOUNDS.durationScale.min,
          MOTION_DIAL_BOUNDS.durationScale.max
        )
      );
    }
    // `ambient` is a behavioral policy, not a CSS value. It stays in the
    // normalized appearance document and is consumed by MotionProvider; a
    // keyword custom property had no productive CSS reader and previously
    // invited accidental use in <time> positions.
  }

  if (posture.elevation) {
    Object.assign(vars, ELEVATION_PRESET[posture.elevation]);
  }

  return vars;
}
