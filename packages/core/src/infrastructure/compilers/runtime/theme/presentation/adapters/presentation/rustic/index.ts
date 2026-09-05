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
 * Rustic's baseline: minimal radii, barely-visible shadows, faster-than-
 * reference transitions and a 1.125 density scale that adds whitespace.
 */
const RUSTIC_TOKENS: EngineTokenOverrides = {
  borderRadius: {
    none: "0",
    sm: "2px",
    md: "4px",
    lg: "6px",
    xl: "8px",
    full: "9999px",
  },
  shadows: {
    sm: "0 1px 2px rgba(0,0,0,0.02)",
    md: "0 1px 3px rgba(0,0,0,0.03), 0 2px 6px rgba(0,0,0,0.02)",
    lg: "0 2px 4px rgba(0,0,0,0.02), 0 4px 12px rgba(0,0,0,0.03)",
    xl: "0 4px 8px rgba(0,0,0,0.02), 0 8px 24px rgba(0,0,0,0.04)",
  },
  surface: {
    borderWidth: "1px",
    borderStyle: "solid",
    useGradients: false,
    useGlass: false,
  },
  motion: {
    hover: "120ms ease",
    transform: "none",
    spring: "ease",
    durationScale: 0.6,
  },
  densityScale: 1.125,
};

/**
 * Rustic consumes the compiled channels directly and has no engine library to
 * seed, so both the base and the per-mode projections are empty.
 */
export const rusticThemeAdapter = defineEngineAdapter({
  id: "rustic",
  tokenBaseline: RUSTIC_TOKENS,
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
      posture: "unsupported",
      evidence: {
        kind: "absent",
        unaccounted: 1,
        reason:
          "the rustic surface reads --ds-font-family-base and never --ds-font-family-heading, so a pairing selection moves body text only",
      },
    },
    "typography.families": {
      posture: "unsupported",
      evidence: {
        kind: "absent",
        unaccounted: 2,
        reason:
          "the rustic surface reads the base and mono families and never the heading or display ones",
      },
    },
    "typography.scale": {
      posture: "unsupported",
      evidence: {
        kind: "absent",
        unaccounted: 1,
        reason: "the rustic surface reads no --ds-type-scale channel",
      },
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
      posture: "unsupported",
      evidence: {
        kind: "absent",
        unaccounted: 1,
        reason:
          "the rustic button skin reads --ds-button-radius, --ds-button-radius-round and --ds-button-radius-circle, none of which any producer emits, and never --ds-radius-button",
      },
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
              "--ds-spacing-2",
            ],
          },
          {
            channel: "--ds-density-scale",
            via: [
              "--ds-density-global-effective-scale",
              "--ds-density-effective-scale",
              "--ds-spacing-2",
            ],
          },
        ],
      },
    },
    "spacing.rhythm": {
      posture: "unsupported",
      evidence: {
        kind: "absent",
        unaccounted: 2,
        reason: "the rustic surface reads no --ds-rhythm-* channel",
      },
    },
    "motion.dial": {
      posture: "unsupported",
      evidence: {
        kind: "absent",
        unaccounted: 2,
        reason:
          "the rustic surface reads neither dial channel; its transitions are the fixed --ds-motion-{fast,normal,glacial} steps",
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
      posture: "unsupported",
      evidence: {
        kind: "absent",
        unaccounted: 1,
        reason:
          "the rustic surface reads no --ds-effect-intensity channel and its baseline declares neither gradients nor glass, so dialling decoration moves nothing here",
      },
    },
    "navigation.sidebar-tone": {
      posture: "unsupported",
      evidence: {
        kind: "absent",
        unaccounted: 5,
        reason:
          "the rustic surface reads sidebar geometry and typography channels but none of the declared tone ones",
      },
    },
    "experience.profile": {
      posture: "unsupported",
      evidence: {
        kind: "absent",
        unaccounted: 3,
        reason: "the rustic surface reads none of the experience-profile channels",
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
      posture: "unsupported",
      evidence: {
        kind: "absent",
        unaccounted: 4,
        reason: "the rustic surface reads none of the expressive-profile channels",
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
          minimumRead: 32,
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
