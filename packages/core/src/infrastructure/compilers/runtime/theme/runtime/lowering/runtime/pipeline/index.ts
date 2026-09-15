/**
 * @fileoverview The ONE orchestrator: build the context once, run every family
 * deriver, resolve the channels by rank.
 *
 * @module Compilers/Theme/Lowering/Runtime/pipeline
 * @category Compilers
 * @package @rottay/design-system
 */

import type {
  FlatTheme,
  FlatThemeMode,
} from "@/foundation/contracts/composition/tenants/themes";
import { themeDefaultMode } from "@/infrastructure/compilers/kernel/foundation/modes";
import type { RampSurface } from "@/foundation/kernel/color/oklch/ramp";
import type {
  FamilyDeriver,
  LoweringContext,
  MergeRankName,
  TenantFacts,
} from "../../foundation/contract";
import { MERGE_RANK } from "../../foundation/contract";
import { resolveExpressiveFacts } from "../../foundation/expressive";
import { flatThemeRampSurface } from "../../foundation/ground";
import { FAMILY_DERIVERS } from "../derivation";
import { derivePaletteTints, resolveContrastPosture } from "../derivation/palette";
import { resolveRadiusBaseline } from "../../foundation/geometry";

/** What the caller states about the block being compiled. */
export interface LoweringRequest {
  /** The effective theme: vertical baseline under the tenant floor. */
  readonly theme: FlatTheme;
  /** The mode this block is FOR; defaults to the theme's declared default. */
  readonly mode?: FlatThemeMode;
  /** The ramp surface; defaults to the one the theme's declared mode implies. */
  readonly surface?: RampSurface;
  /** "" for the base block, "modes.<mode>." for a mode overlay block. */
  readonly modePrefix?: string;
  readonly tenant?: TenantFacts;
}

/** Which family produced each channel, and at which rank it settled. */
export interface ChannelProvenance {
  readonly family: string;
  readonly rank: MergeRankName;
}

export interface LoweringResult {
  readonly channels: Record<string, string>;
  readonly provenance: ReadonlyMap<string, ChannelProvenance>;
}

/**
 * Build the context every family reads.
 *
 * The expressive expansion and the radius baseline are resolved HERE, once, and
 * carried as facts. Before this they were re-resolved by each consumer that
 * needed them, with a different schema-version policy on the tenant arm, so
 * one theme could expand five ways inside one compile. The status tints join
 * them for the same reason: two families state those channels, at two ranks,
 * and only one of them was reading the block's contrast posture.
 */
export function buildLoweringContext(
  request: LoweringRequest
): LoweringContext {
  const theme = request.theme;
  const expressive = resolveExpressiveFacts(theme.expressive);
  return {
    theme,
    surface: request.surface ?? flatThemeRampSurface(theme),
    mode: request.mode ?? themeDefaultMode(theme),
    modePrefix: request.modePrefix ?? "",
    expressive,
    radiusBaseline: resolveRadiusBaseline(
      theme,
      expressive.expansion,
      request.tenant?.posture?.radiusScale
    ),
    statusTints: theme.palette
      ? derivePaletteTints(theme.palette, resolveContrastPosture(theme))
      : {},
    tenant: request.tenant,
  };
}

/**
 * Run the derivers and resolve every channel by rank.
 *
 * PRECEDENCE IS THE RANK, NOT THE ORDER. A write lands when its rank is at
 * least the rank already holding the channel, so a family that runs late with
 * a weaker claim cannot take a channel a stronger authority already stated --
 * which is exactly how a vertical's hand-authored chrome used to beat the
 * tenant floor merged before it. Position, on the other hand, IS the order:
 * an overwrite keeps the channel where it was first declared, so emission
 * order stays a property of the registry alone.
 *
 * Two families at the SAME rank claiming one channel is refused rather than
 * resolved. That contest has no answer -- both statements have equal standing
 * -- so a duplicate producer is a compiler defect and fails closed here
 * instead of being decided by whichever deriver happens to be listed later.
 */
export function runDerivation(
  context: LoweringContext,
  derivers: readonly FamilyDeriver[] = FAMILY_DERIVERS
): LoweringResult {
  const channels: Record<string, string> = {};
  const provenance = new Map<string, ChannelProvenance>();
  for (const deriver of derivers) {
    const rank = MERGE_RANK[deriver.rank];
    for (const [channel, value] of Object.entries(
      deriver.derive(context, channels)
    )) {
      const held = provenance.get(channel);
      if (held !== undefined) {
        const heldRank = MERGE_RANK[held.rank];
        if (heldRank === rank && held.family !== deriver.family) {
          throw new Error(
            `Duplicate producer for ${channel}: families "${held.family}" and ` +
              `"${deriver.family}" both produce it at rank "${deriver.rank}". ` +
              `A channel has exactly one producing family per rank.`
          );
        }
        if (rank < heldRank) continue;
      }
      channels[channel] = value;
      provenance.set(channel, { family: deriver.family, rank: deriver.rank });
    }
  }
  return { channels, provenance };
}

/** The channel map for one block: the pipeline's own single entry point. */
export function lowerBlock(
  request: LoweringRequest,
  derivers: readonly FamilyDeriver[] = FAMILY_DERIVERS
): Record<string, string> {
  return runDerivation(buildLoweringContext(request), derivers).channels;
}
