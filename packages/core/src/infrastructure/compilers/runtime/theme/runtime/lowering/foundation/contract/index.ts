/**
 * @fileoverview The FamilyDeriver contract: what a family reads, what it
 * produces, and where its writes sit in the one ranked merge.
 *
 * @module Compilers/Theme/Lowering/Foundation/contract
 * @category Compilers
 * @package @rottay/design-system
 */

import type {
  BrandTheme,
  BrandThemeMode,
} from "@/foundation/contracts/composition/tenants/themes";
import type { TenantAuthoredPaths } from "@/foundation/contracts/composition/tenants/themes/iso";
import type { TenantStatusSeedAuthorship } from "@/foundation/contracts/composition/tenants/themes/resolved";
import type { RampSurface } from "@/foundation/kernel/color/oklch/ramp";
import type {
  ExpressiveExpansion,
  ExpressiveTypeRoleOverlay,
} from "@/foundation/tokens/ts/presentation/expressive-profiles/expansion";
import type { ExpressiveAxes } from "@/foundation/tokens/ts/presentation/expressive-profiles";
import type { AppearancePostureFields } from "@/infrastructure/compilers/kernel/foundation/css/appearance-posture";
import type { OnToneRole } from "@/infrastructure/compilers/kernel/foundation/css/color-math/readable-ink";

/** A `--ds-*` custom property name. */
export type ChannelName = `--ds-${string}`;

/**
 * A declared output. An entry ending in `*` is a PREFIX: `--ds-color-primary-*`
 * covers the derived ramp steps whose exact names depend on the palette rather
 * than on the deriver. Everything else is an exact channel name.
 */
export type ChannelPattern = ChannelName;

/** A dotted `Theme` keypath a deriver reads; a trailing `*` covers the subtree. */
export type ThemeKeypath = string;

/**
 * The precedence lattice of the single merge, lowest first.
 *
 * `profile` is the weakest statement anyone makes -- an expressive profile
 * fills a channel nobody claimed. `derived` is what the compiler derives from
 * the vertical Theme's own decisions. `verticalOverride` is the vertical's
 * hand-authored chrome, which is a statement about a concrete channel and
 * therefore outranks a derivation. `tenant` is the white-label floor and
 * outranks everything, which is the whole point of a white-label compiler.
 */
export const MERGE_RANK = {
  profile: 0,
  derived: 1,
  verticalOverride: 2,
  tenant: 3,
} as const;

export type MergeRankName = keyof typeof MERGE_RANK;
export type MergeRank = (typeof MERGE_RANK)[MergeRankName];

/** The expressive expansion, resolved exactly once per compiled block. */
export interface ExpressiveFacts {
  readonly axes: ExpressiveAxes;
  readonly expansion: ExpressiveExpansion;
  readonly typeRoleOverlay: ExpressiveTypeRoleOverlay | undefined;
}

/**
 * What this block knows about its tenant. Absent means "no tenant": every
 * `tenant`-ranked deriver then returns nothing and the compile is exactly the
 * vertical's own.
 */
export interface TenantFacts {
  readonly posture: AppearancePostureFields | undefined;
  /**
   * The silhouette the tenant CHOSE, read from the raw patch.
   *
   * `posture.buttonStyle` cannot answer this: it is the `??` chain that lets
   * the tenant's own profile fill the word nobody picked, and a profile filling
   * a default is not the tenant deciding one. The distinction is what keeps a
   * profile from flattening the five per-size button radii a skin varies.
   */
  readonly chosenButtonStyle: AppearancePostureFields["buttonStyle"];
  readonly typography: BrandTheme["typography"] | undefined;
  readonly authoredPaths: TenantAuthoredPaths | undefined;
  readonly statusSeedAuthorship: TenantStatusSeedAuthorship | undefined;
  /** Whether the seed THIS block compiles from is the tenant's own. */
  readonly seedIsTenantAuthored: boolean;
  /** The same question per status tone, read from the raw patch by the caller. */
  readonly toneSeedIsTenantAuthored: Readonly<Record<OnToneRole, boolean>>;
}

/**
 * Everything a family deriver may read. One object, built once per compiled
 * block, so no deriver re-resolves a decision another deriver already resolved
 * -- which is how the expressive expansion ended up running four times.
 */
export interface LoweringContext {
  /** The effective theme for this block: vertical baseline under the tenant floor. */
  readonly theme: BrandTheme;
  /** The ramp surface this block derives against. */
  readonly surface: RampSurface;
  /** The mode this block compiles for. */
  readonly mode: BrandThemeMode;
  /** "" for the base block, "modes.<mode>." for a mode overlay block. */
  readonly modePrefix: string;
  readonly expressive: ExpressiveFacts;
  /**
   * The `--ds-radius-scale` the VERTICAL BASELINE resolves to. Every authored
   * radius is normalized against this exact number, so the divisor is a
   * constant of the vertical instead of the dial the block itself emits.
   */
  readonly radiusBaseline: string;
  /**
   * The status tints THIS block implies, derived once at the block's own
   * contrast posture.
   *
   * Two families state these channels at two ranks -- the palette family as
   * the derived floor, the seeds family as the tenant floor over an assembled
   * block -- and a tenant that asked for a harder read must not get the
   * posture's separator from one and the identity's from the other. Deriving
   * them here is what makes that impossible rather than merely unintended.
   */
  readonly statusTints: Record<string, string>;
  readonly tenant: TenantFacts | undefined;
}

/**
 * The five posture channels the TYPOGRAPHY family owns.
 *
 * A governed type pairing lowers into font families and two metrics, and so
 * does an authored `typography` block -- which is why these five were the five
 * channels the old assembly wrote twice. The shared posture table still
 * computes them; this states which family is allowed to emit them.
 */
export const TYPE_PAIRING_CHANNELS = [
  "--ds-font-family-base",
  "--ds-font-family-heading",
  "--ds-font-family-mono",
  "--ds-letter-spacing-heading",
  "--ds-line-height-display",
] as const;

/** The posture channels the ELEVATION family owns: seven roles and the edge. */
export const ELEVATION_PRESET_CHANNELS = [
  "--ds-elevation-0",
  "--ds-elevation-1",
  "--ds-elevation-2",
  "--ds-elevation-3",
  "--ds-elevation-4",
  "--ds-elevation-5",
  "--ds-elevation-6",
  "--ds-elevation-border-style",
] as const;

/** A read-only view of everything merged at strictly lower ranks. */
export type AssembledChannels = Readonly<Record<string, string>>;

/** What one deriver returns: its own channels, nothing else. */
export type DerivedChannels = Readonly<Record<string, string>>;

/**
 * One family, one deriver.
 *
 * `consumes` and `produces` are the typed contract: a family states the Theme
 * keypaths it reads and the channels it writes, and the contract test template
 * proves the statement against what `derive` actually emits. Two families may
 * name the same channel only when their ranks differ -- that is precedence.
 * Two families at the SAME rank naming the same channel is a duplicate
 * producer, and the pipeline refuses it rather than letting write order decide.
 *
 * A deriver never imports another deriver. Anything two families need is a
 * fact on the `LoweringContext`, resolved once by the pipeline.
 */
export interface FamilyDeriver {
  /** The canonical family id; unique across the registry. */
  readonly family: string;
  readonly rank: MergeRankName;
  readonly consumes: readonly ThemeKeypath[];
  readonly produces: readonly ChannelPattern[];
  derive(context: LoweringContext, below: AssembledChannels): DerivedChannels;
}

/** Does `name` fall under `pattern` (exact, or prefix when it ends in `*`)? */
export function channelMatches(name: string, pattern: ChannelPattern): boolean {
  return pattern.endsWith("*")
    ? name.startsWith(pattern.slice(0, -1))
    : name === pattern;
}

/** Is `name` covered by any of `patterns`? */
export function channelDeclared(
  name: string,
  patterns: readonly ChannelPattern[]
): boolean {
  return patterns.some((pattern) => channelMatches(name, pattern));
}
