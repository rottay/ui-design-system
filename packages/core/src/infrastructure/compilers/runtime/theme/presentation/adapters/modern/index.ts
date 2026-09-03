import type { EngineAdapter } from "@/foundation/contracts/composition/tenants/themes/engine-adapter";

/**
 * Modern is primary: every governed control is `native`, and both the base and
 * the per-mode projections are empty because Modern consumes the compiled
 * channels directly and has no engine library to seed.
 */
export const modernThemeAdapter: EngineAdapter = {
  id: "modern",
  posture: {
    "palette.seeds": "native",
    "palette.dark-mode": "native",
    "typography.pairing": "native",
    "typography.families": "native",
    "typography.scale": "native",
    "shape.radius-scale": "native",
    "shape.button-style": "native",
    "density.mode": "native",
    "spacing.rhythm": "native",
    "motion.dial": "native",
    "surfaces.elevation-posture": "native",
    "surfaces.effect-intensity": "native",
    "navigation.sidebar-tone": "native",
    "experience.profile": "native",
    "chrome.families": "native",
    "chrome.anatomy": "native",
    "token-overrides": "native",
    "recipe-profile": "native",
    "profiles.expressive": "native",
    "palette.status-seeds": "native",
    "profiles.icon": "native",
    "responsive.posture": "native",
  },
  project: () => ({ seeds: {}, tokenOverrides: {}, modes: [] }),
};
