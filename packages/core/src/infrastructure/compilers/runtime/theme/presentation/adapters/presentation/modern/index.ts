import type { EngineTokenOverrides } from "@/foundation/contracts/kernel/tokens/engine-tokens";
import { defineEngineAdapter } from "../../foundation/definition";

const INVARIANT_ICON = {
  kind: "delivery",
  module: "@/infrastructure/runtime/foundation/icons/active-profile/foundation/read",
  symbol: "useActiveIconExpressiveProfile",
  reason:
    "the icon posture selects governed weight tables in the icon runtime; no engine surface reads a channel of it",
} as const;

const INVARIANT_RESPONSIVE = {
  kind: "delivery",
  module: "@/components/patterns/runtime/adaptive-layout/presentation/react",
  symbol: "resolveActiveResponsivePosture",
  reason:
    "the ladder reaches geometry through the adaptive solver, never a CSS channel, so no engine implementation participates",
} as const;

const INVARIANT_RECIPE = {
  kind: "delivery",
  module: "@/foundation/tokens/ts/presentation/recipe-profiles",
  symbol: "validateRecipeProfileSelection",
  reason:
    "--ds-recipe-profile is provenance of the selection and is read by no engine surface; the selection is consumed as data",
} as const;

/**
 * Modern's baseline: larger radii and colour-tinted shadows, a 1px hover
 * lift and a spring curve, on the 1.0 density reference every other engine
 * is read against.
 */
const MODERN_TOKENS: EngineTokenOverrides = {
  borderRadius: {
    none: "0",
    sm: "8px",
    md: "12px",
    lg: "16px",
    xl: "20px",
    full: "9999px",
  },
  shadows: {
    sm: "0 1px 3px rgba(0,0,0,0.04), 0 4px 6px var(--ds-color-primary-50, rgba(0,0,0,0.02))",
    md: "0 4px 6px rgba(0,0,0,0.03), 0 10px 20px var(--ds-color-primary-50, rgba(0,0,0,0.04))",
    lg: "0 10px 25px rgba(0,0,0,0.05), 0 20px 40px var(--ds-color-primary-100, rgba(0,0,0,0.06))",
    xl: "0 15px 35px rgba(0,0,0,0.06), 0 25px 60px var(--ds-color-primary-100, rgba(0,0,0,0.08))",
  },
  surface: {
    borderWidth: "0",
    borderStyle: "none",
    useGradients: true,
    useGlass: true,
  },
  motion: {
    hover: "200ms cubic-bezier(0.16, 1, 0.3, 1)",
    transform: "translateY(-1px)",
    spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
    durationScale: 1.0,
  },
  densityScale: 1.0,
};

/**
 * Modern is the primary engine: it consumes the compiled channels directly and
 * has no engine library to seed, so both the base and the per-mode projections
 * are empty.
 */
export const modernThemeAdapter = defineEngineAdapter({
  id: "modern",
  tokenBaseline: MODERN_TOKENS,
  controls: {
    "palette.seeds": {
      posture: "native",
      evidence: {
        kind: "channels",
        read: [
          "--ds-color-primary",
          "--ds-color-primary-500",
          "--ds-button-primary-bg",
          "--ds-color-text-on-primary",
        ],
      },
    },
    "palette.dark-mode": {
      posture: "native",
      evidence: { kind: "channels", read: ["--ds-color-primary-500"] },
    },
    "typography.pairing": {
      posture: "native",
      evidence: {
        kind: "channels",
        read: ["--ds-font-family-base", "--ds-font-family-heading"],
      },
    },
    "typography.families": {
      posture: "native",
      evidence: {
        kind: "channels",
        read: [
          "--ds-font-family-base",
          "--ds-font-family-heading",
          "--ds-font-family-mono",
          "--ds-font-family-display",
        ],
      },
    },
    "typography.scale": {
      posture: "native",
      evidence: { kind: "channels", read: ["--ds-type-scale"] },
    },
    "shape.radius-scale": {
      posture: "native",
      evidence: {
        kind: "channels",
        read: ["--ds-radius-md"],
        carriers: [{ channel: "--ds-radius-scale", via: ["--ds-radius-md"] }],
      },
    },
    "shape.button-style": {
      posture: "native",
      evidence: { kind: "channels", read: ["--ds-radius-button"] },
    },
    "density.mode": {
      posture: "native",
      evidence: {
        kind: "channels",
        read: [],
        carriers: [
          {
            channel: "--ds-density-mode-factor",
            via: [
              "--ds-density-global-effective-scale",
              "--ds-density-effective-scale",
            ],
          },
          {
            channel: "--ds-density-scale",
            via: [
              "--ds-density-global-effective-scale",
              "--ds-density-effective-scale",
            ],
          },
        ],
      },
    },
    "spacing.rhythm": {
      posture: "native",
      evidence: {
        kind: "channels",
        read: ["--ds-rhythm-effective-scale"],
        carriers: [
          { channel: "--ds-rhythm-scale", via: ["--ds-rhythm-effective-scale"] },
        ],
      },
    },
    "motion.dial": {
      posture: "native",
      evidence: {
        kind: "channels",
        read: ["--ds-motion-intensity", "--ds-motion-duration-scale"],
      },
    },
    "surfaces.elevation-posture": {
      posture: "native",
      evidence: {
        kind: "channels",
        read: ["--ds-elevation-1", "--ds-elevation-2", "--ds-elevation-3"],
      },
    },
    "surfaces.effect-intensity": {
      posture: "native",
      evidence: { kind: "channels", read: ["--ds-effect-intensity"] },
    },
    "navigation.sidebar-tone": {
      posture: "native",
      evidence: {
        kind: "channels",
        read: [
          "--ds-sidebar-text",
          "--ds-sidebar-text-muted",
          "--ds-sidebar-item-bg-hover",
          "--ds-sidebar-item-bg-active",
          "--ds-sidebar-item-color-active",
        ],
      },
    },
    "experience.profile": {
      posture: "native",
      evidence: {
        kind: "channels",
        read: [
          "--ds-letter-spacing-heading",
          "--ds-edge-standard-width",
          "--ds-elevation-lift-strength",
        ],
      },
    },
    "chrome.families": {
      posture: "native",
      evidence: {
        kind: "channels",
        read: ["--ds-button-primary-bg", "--ds-table-header-bg", "--ds-modal-bg"],
      },
    },
    "chrome.anatomy": {
      posture: "native",
      evidence: {
        kind: "channels",
        read: [],
        attributes: [
          "data-anatomy-card",
          "data-anatomy-table",
          "data-anatomy-sidebar",
          "data-anatomy-layout",
        ],
      },
    },
    "token-overrides": {
      posture: "native",
      evidence: {
        kind: "channels",
        read: ["--ds-color-error", "--ds-surface-card", "--ds-color-bg-overlay"],
      },
    },
    "recipe-profile": { posture: "invariant", evidence: INVARIANT_RECIPE },
    "profiles.expressive": {
      posture: "native",
      evidence: {
        kind: "channels",
        read: [
          "--ds-select-group-text-transform",
          "--ds-edge-emphasis-width",
          "--ds-elevation-lift-strength",
        ],
        carriers: [{ channel: "--ds-radius-scale", via: ["--ds-radius-md"] }],
      },
    },
    "palette.status-seeds": {
      posture: "native",
      evidence: {
        kind: "channels",
        read: [
          "--ds-color-success",
          "--ds-color-warning",
          "--ds-color-error",
          "--ds-color-info",
        ],
        family: {
          minimumRead: 46,
          reason:
            "83 declared names are the ramp, tint and on-tone family derived from four authored seeds; the floor is decrease-only",
        },
      },
    },
    "profiles.icon": { posture: "invariant", evidence: INVARIANT_ICON },
    "responsive.posture": { posture: "invariant", evidence: INVARIANT_RESPONSIVE },
  },
  project: () => ({ seeds: {}, modes: [] }),
});
