import type { ThemeCompilation } from "@/foundation/contracts/composition/tenants/themes/compiled";
import type {
  EngineAdapter,
  EngineProjection,
  EngineSeeds,
} from "@/foundation/contracts/composition/tenants/themes/engine-adapter";
import { dialedCssLengthToPx } from "@/foundation/kernel/geometry/css-length";

/**
 * The antd seed vocabulary: antd token name -> the DS channel whose compiled
 * value answers it. Reading a `--ds-*` name to resolve a seed is not minting
 * one; nothing here ever becomes a projection KEY. Mirrors `CSS_VAR_MAP` in
 * `infrastructure/runtime/engines/presentation/adapters/antd`.
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
    tokenOverrides: {},
    modes: compiled.modeBlocks.map((block) => ({
      mode: block.mode,
      seeds: seedsOf({ ...compiled.cssVariables, ...block.cssVariables }),
    })),
  };
}

export const classicThemeAdapter: EngineAdapter = {
  id: "classic",
  posture: {
    "palette.seeds": "native",
    "palette.dark-mode": "native",
    "typography.pairing": "native",
    "typography.families": "native",
    // reads no --ds-type-scale and no --ds-type-*font-size channel
    "typography.scale": "unsupported",
    "shape.radius-scale": "native",
    "shape.button-style": "native",
    // reaches antd only through DENSITY_SIZE_MAP: compact|comfortable|spacious
    // -> antd small|middle|large; reads no --ds-density-* or --ds-spacing-*
    "density.mode": "mapped",
    // reads no --ds-rhythm-* channel
    "spacing.rhythm": "unsupported",
    // reads no --ds-motion-* channel
    "motion.dial": "unsupported",
    // the declared elevation ladder is read by modern and rustic but not
    // classic, which expresses the same axis through --ds-shadow-{sm,md,lg} on
    // its own surface: DS vocabulary, not antd's, so `mapped` would be
    // factually wrong and `unsupported` would contradict the measured reads
    "surfaces.elevation-posture": "native",
    // CLASSIC_TOKENS.surface declares useGradients:false, useGlass:false
    "surfaces.effect-intensity": "invariant",
    // reads none of the six declared --ds-sidebar-* channels
    "navigation.sidebar-tone": "unsupported",
    // reads none of the five declared experience-profile channels
    "experience.profile": "unsupported",
    "chrome.families": "native",
    // classic-anatomy-support.json: 5 supported / 5 approximated / 0 unsupported
    "chrome.anatomy": "mapped",
    "token-overrides": "native",
    "recipe-profile": "native",
    // reads none of the six declared expressive-profile channels
    "profiles.expressive": "unsupported",
    "palette.status-seeds": "native",
    "profiles.icon": "native",
    "responsive.posture": "native",
  },
  project: projectClassic,
};
