import type { ThemeCompilation } from "@/foundation/contracts/composition/tenants/themes/compiled";
import type {
  EngineProjection,
  EngineSeeds,
} from "@/foundation/contracts/composition/tenants/themes/engine-adapter";
import type { EngineTokenOverrides } from "@/foundation/contracts/kernel/tokens/engine-tokens";
import { defineEngineAdapter } from "../../foundation/definition";
import { dialedCssLengthToPx } from "@/foundation/kernel/geometry/css-length";

/**
 * The antd seed vocabulary: antd token name -> the DS channel whose compiled
 * value answers it. Reading a `--ds-*` name to resolve a seed is not minting
 * one; nothing here ever becomes a projection KEY. This table is the only
 * statement of that mapping — the runtime bridge consumes the projection.
 */
export const CLASSIC_SEED_CHANNELS = Object.freeze({
  colorPrimary: "--ds-color-primary",
  colorSuccess: "--ds-color-success",
  colorWarning: "--ds-color-warning",
  colorError: "--ds-color-error",
  colorInfo: "--ds-color-info",
  colorBgBase: "--ds-color-bg-primary",
  colorTextBase: "--ds-color-text-primary",
  colorLink: "--ds-color-primary",
  colorTextLightSolid: "--ds-color-text-on-primary",
} as const);

/**
 * antd's `borderRadius` is a NUMBER of px, and the compiler emits no resolved
 * radius step: it emits the ramp operand and the dial, which the foundation
 * stylesheet combines as `calc(base * scale)`. This adapter performs that same
 * multiplication so the compile-time seed equals the value the runtime bridge
 * reads off the live cascade.
 */
export const CLASSIC_RADIUS_CHANNELS = Object.freeze({
  base: "--ds-radius-md-base",
  scale: "--ds-radius-scale",
} as const);

/**
 * Absence is absence: no operand, no seed. A PRESENT operand that cannot become
 * a number is a different fact and fails loudly, because antd would otherwise
 * silently paint its own 6px default over a radius the tenant authored.
 */
function radiusSeed(variables: Readonly<Record<string, string>>): number | undefined {
  const operand = variables[CLASSIC_RADIUS_CHANNELS.base];
  if (operand == null) return undefined;
  const authored = dialedCssLengthToPx(operand);
  if (authored === null)
    throw new Error(
      `classicThemeAdapter: ${CLASSIC_RADIUS_CHANNELS.base} is ${JSON.stringify(operand)}, ` +
        "which antd's numeric borderRadius seed cannot carry. Expected one unitless, " +
        "px, rem or em length, optionally as calc(<length> / <scale>)."
    );
  const dial = variables[CLASSIC_RADIUS_CHANNELS.scale] ?? "1";
  const scale = Number(dial);
  const resolved = authored * scale;
  if (!Number.isFinite(resolved))
    throw new Error(
      `classicThemeAdapter: ${CLASSIC_RADIUS_CHANNELS.scale} is ${JSON.stringify(dial)}, ` +
        "which is not a finite multiplier for the radius seed."
    );
  return resolved;
}

function seedsOf(variables: Readonly<Record<string, string>>): EngineSeeds {
  const seeds: Record<string, string | number> = {};
  for (const [token, channel] of Object.entries(CLASSIC_SEED_CHANNELS)) {
    const value = variables[channel];
    if (value != null) seeds[token] = value;
  }
  const radius = radiusSeed(variables);
  if (radius !== undefined) seeds.borderRadius = radius;
  return seeds;
}

function projectClassic(compiled: ThemeCompilation): EngineProjection {
  return {
    seeds: seedsOf(compiled.cssVariables),
    modes: compiled.modeBlocks.map((block) => ({
      mode: block.mode,
      seeds: seedsOf({ ...compiled.cssVariables, ...block.cssVariables }),
    })),
  };
}

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
 * Classic's baseline: smaller radii and multi-layer shadows build depth by
 * layering, and the 0.9375 density scale gives enterprise UIs ~6% tighter
 * spacing than the 1.0 reference.
 */
const CLASSIC_TOKENS: EngineTokenOverrides = {
  borderRadius: {
    none: "0",
    sm: "4px",
    md: "6px",
    lg: "8px",
    xl: "12px",
    full: "9999px",
  },
  shadows: {
    sm: "0 1px 2px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)",
    md: "0 2px 4px rgba(0,0,0,0.04), 0 4px 6px rgba(0,0,0,0.06)",
    lg: "0 4px 6px rgba(0,0,0,0.03), 0 10px 15px rgba(0,0,0,0.06), 0 20px 25px rgba(0,0,0,0.04)",
    xl: "0 10px 15px rgba(0,0,0,0.04), 0 20px 25px rgba(0,0,0,0.06), 0 25px 50px rgba(0,0,0,0.08)",
  },
  surface: {
    borderWidth: "1px",
    borderStyle: "solid",
    useGradients: false,
    useGlass: false,
  },
  motion: {
    hover: "150ms ease",
    transform: "none",
    spring: "ease",
    durationScale: 0.8,
  },
  densityScale: 0.9375,
};

export const classicThemeAdapter = defineEngineAdapter({
  id: "classic",
  tokenBaseline: CLASSIC_TOKENS,
  controls: {
    "palette.seeds": {
      posture: "mapped",
      evidence: {
        kind: "projection",
        seeds: ["colorPrimary", "colorLink", "colorTextLightSolid"],
        from: ["--ds-color-primary", "--ds-color-text-on-primary"],
        reason:
          "classic/theme/index.css reads neither channel; the brand seed reaches Ant through the projection table above, and the handful of inline reads on the classic TSX surface are component paint, not an engine stylesheet",
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
          "the classic surface reads --ds-font-family-base and never --ds-font-family-heading, and antd receives no fontFamily seed",
      },
    },
    "typography.families": {
      posture: "unsupported",
      evidence: {
        kind: "absent",
        unaccounted: 2,
        reason:
          "the classic surface reads the base and mono families and never the heading or display ones",
      },
    },
    "typography.scale": {
      posture: "unsupported",
      evidence: {
        kind: "absent",
        unaccounted: 1,
        reason:
          "the classic surface reads no --ds-type-scale channel and antd sizes from its own fontSize token, which the projection does not seed",
      },
    },
    "shape.radius-scale": {
      posture: "mapped",
      evidence: {
        kind: "projection",
        seeds: ["borderRadius"],
        from: ["--ds-radius-md-base", "--ds-radius-scale"],
        reason:
          "antd's numeric borderRadius seed carries the dialed radius step; the classic surface reads no declared radius channel of its own",
      },
    },
    "shape.button-style": {
      posture: "unsupported",
      evidence: {
        kind: "absent",
        unaccounted: 1,
        reason:
          "--ds-radius-button is read nowhere on the classic surface; classic buttons take the radius-scale axis instead, so sharp|soft|pill changes nothing",
      },
    },
    "density.mode": {
      posture: "unsupported",
      evidence: {
        kind: "absent",
        unaccounted: 2,
        reason:
          "the classic surface reads no --ds-density-* or --ds-spacing-* channel and the projection seeds antd no size token; DENSITY_SIZE_MAP is driven by a component prop, not by this capability",
      },
    },
    "spacing.rhythm": {
      posture: "unsupported",
      evidence: {
        kind: "absent",
        unaccounted: 2,
        reason: "the classic surface reads no --ds-rhythm-* channel",
      },
    },
    "motion.dial": {
      posture: "unsupported",
      evidence: {
        kind: "absent",
        unaccounted: 2,
        reason: "the classic surface reads neither dial channel",
      },
    },
    "surfaces.elevation-posture": {
      posture: "unsupported",
      evidence: {
        kind: "absent",
        unaccounted: 3,
        reason:
          "the classic surface reads --ds-shadow-{sm,md,lg}, which alias the elevation ladder only in the default theme: every first-party artifact redeclares them as literals and evnto emits no elevation channel at all, so no total mapping exists",
      },
    },
    "surfaces.effect-intensity": {
      posture: "unsupported",
      evidence: {
        kind: "absent",
        unaccounted: 1,
        reason:
          "the classic surface reads no --ds-effect-intensity channel and its baseline declares neither gradients nor glass, so dialling decoration moves nothing here",
      },
    },
    "navigation.sidebar-tone": {
      posture: "unsupported",
      evidence: {
        kind: "absent",
        unaccounted: 5,
        reason:
          "the classic surface reads sidebar geometry and typography channels but none of the declared tone ones",
      },
    },
    "experience.profile": {
      posture: "unsupported",
      evidence: {
        kind: "absent",
        unaccounted: 3,
        reason: "the classic surface reads none of the experience-profile channels",
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
      posture: "unsupported",
      evidence: {
        kind: "absent",
        unaccounted: 4,
        reason:
          "no data-anatomy-* selector and no anatomy prop exists anywhere on the classic surface, so selecting a variant changes nothing",
      },
    },
    "token-overrides": {
      posture: "unsupported",
      evidence: {
        kind: "absent",
        unaccounted: 2,
        reason:
          "the classic surface reads --ds-color-error and neither --ds-surface-card nor --ds-color-bg-overlay, so the bounded override surface lands only in part",
      },
    },
    "recipe-profile": { posture: "invariant", evidence: INVARIANT_RECIPE },
    "profiles.expressive": {
      posture: "unsupported",
      evidence: {
        kind: "absent",
        unaccounted: 4,
        reason: "the classic surface reads none of the expressive-profile channels",
      },
    },
    "palette.status-seeds": {
      posture: "mapped",
      evidence: {
        kind: "projection",
        seeds: ["colorSuccess", "colorWarning", "colorError", "colorInfo"],
        from: [
          "--ds-color-success",
          "--ds-color-warning",
          "--ds-color-error",
          "--ds-color-info",
        ],
        reason:
          "classic/theme/index.css reads none of the four status seeds; they reach Ant's own status vocabulary through the projection table above, and the ramp family is derived by Ant rather than consumed from the DS channels",
      },
    },
    "profiles.icon": { posture: "invariant", evidence: INVARIANT_ICON },
    "responsive.posture": { posture: "invariant", evidence: INVARIANT_RESPONSIVE },
  },
  project: projectClassic,
});
