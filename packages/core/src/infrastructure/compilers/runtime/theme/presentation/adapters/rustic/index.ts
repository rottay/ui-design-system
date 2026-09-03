import type { EngineAdapter } from "@/foundation/contracts/composition/tenants/themes/engine-adapter";

/**
 * Rustic consumes the compiled channels directly and has no engine library to
 * seed, so both the base and the per-mode projections are empty.
 */
export const rusticThemeAdapter: EngineAdapter = {
  id: "rustic",
  posture: {
    "palette.seeds": "native",
    "palette.dark-mode": "native",
    "typography.pairing": "native",
    "typography.families": "native",
    // reads 9 --ds-type-* names, none of them a font size and none --ds-type-scale
    "typography.scale": "unsupported",
    "shape.radius-scale": "native",
    "shape.button-style": "native",
    "density.mode": "native",
    // reads no --ds-rhythm-* channel
    "spacing.rhythm": "unsupported",
    "motion.dial": "native",
    "surfaces.elevation-posture": "native",
    // RUSTIC_TOKENS.surface declares useGradients:false, useGlass:false
    "surfaces.effect-intensity": "invariant",
    // reads none of the six declared --ds-sidebar-* channels
    "navigation.sidebar-tone": "unsupported",
    // reads none of the five declared experience-profile channels
    "experience.profile": "unsupported",
    "chrome.families": "native",
    "chrome.anatomy": "native",
    "token-overrides": "native",
    "recipe-profile": "native",
    // reads none of the six declared expressive-profile channels
    "profiles.expressive": "unsupported",
    "palette.status-seeds": "native",
    "profiles.icon": "native",
    "responsive.posture": "native",
  },
  project: () => ({ seeds: {}, tokenOverrides: {}, modes: [] }),
};
