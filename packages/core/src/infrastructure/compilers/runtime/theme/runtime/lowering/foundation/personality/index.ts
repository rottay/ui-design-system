/**
 * @fileoverview BrandTheme to personality/token-override projection and its merges.
 *
 * @module Compilers/Theme/Lowering/Foundation/personality
 * @category Compilers
 * @package @rottay/design-system
 */

import type { TenantTokenOverrides } from "@/foundation/contracts/composition/tenants";
import type { BrandTheme } from "@/foundation/contracts/composition/tenants/themes";
import type {
  PartialPersonalityTokens,
  PersonalityTokens,
} from "@/foundation/contracts/kernel/tokens/personality";
import { springLinearEasing } from "@/infrastructure/compilers/kernel/foundation/motion/spring-easing";
import { resolveExpressiveFacts } from "../expressive";

/**
 * A BrandTheme opts into generated spring physics only when it declares BOTH
 * tension and friction and does not explicitly disable spring (`useSpring:
 * false`, e.g. bithire's calm operational motion law). Absent `useSpring` defaults
 * to enabled, matching every first-party theme that sets tension/friction.
 */
export function isSpringEligible(bt: BrandTheme): boolean {
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
 * curve) so it rides the SAME `TenantTokenOverrides.motion.spring` field
 * `useTokens` resolves into `--ds-motion-spring` -- this is the only path
 * that reaches the compiled artifact without a theme manually authoring a
 * literal override.
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
  const expressiveMotion = resolveExpressiveFacts(bt.expressive).expansion
    .fieldDefaults.motion;

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

/** Merge two partial PersonalityTokens (per-dimension spread). */
export function mergePartialPersonality(
  base: PartialPersonalityTokens | undefined,
  override: PartialPersonalityTokens
): PartialPersonalityTokens {
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
