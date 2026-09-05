/**
 * @fileoverview Engine-adapter contract: posture, evidence and projection.
 *
 * @module Contracts/Themes/EngineAdapter
 * @category Types
 * @package @rottay/design-system
 */

import type { BrandThemeMode } from "..";
import type { EngineName } from "@/foundation/contracts/kernel/engine-identity";
import type { EngineTokenOverrides } from "@/foundation/contracts/kernel/tokens/engine-tokens";
import type { TenantCapabilityId } from "@/foundation/contracts/composition/tenants";
import type { ThemeCompilation } from "../compiled";

/** Every governed control id. Derived from the registry; never hand-listed. */
export type ControlId = TenantCapabilityId;

/**
 * `native`      this engine's own surface consumes the control's channels
 * `mapped`      translated into the engine library's own token vocabulary by
 *               the adapter's projection
 * `invariant`   this engine does not participate: either the axis is outside
 *               its declared expressive vocabulary, or an engine-independent
 *               runtime delivers it identically to every engine
 * `unsupported` a real axis another engine consumes, to which this engine has
 *               no route; activating it under this engine is refused
 */
export type EnginePosture = "native" | "mapped" | "invariant" | "unsupported";

/**
 * One declared channel reaching an engine through a producer chain rather than
 * a direct read. `via` is ordered from the first derived channel to the one the
 * engine's own surface reads.
 */
export interface EngineChannelCarrier {
  readonly channel: string;
  readonly via: readonly string[];
}

/**
 * A control whose declared channels are a derived FAMILY over a smaller set of
 * authored inputs. `read` then names the authored inputs and `minimumRead` is a
 * decrease-only floor on how much of the family the engine consumes, because
 * pinning 83 ramp names exactly would redden on every skin edit without
 * measuring anything the floor does not already measure.
 */
export interface EngineChannelFamily {
  readonly minimumRead: number;
  readonly reason: string;
}

/** `native`: the engine's own surface reads these channels or attributes. */
export interface EngineChannelEvidence {
  readonly kind: "channels";
  readonly read: readonly string[];
  readonly carriers?: readonly EngineChannelCarrier[];
  readonly attributes?: readonly string[];
  readonly family?: EngineChannelFamily;
}

/** `mapped`: the projection carries the axis into the library's own vocabulary. */
export interface EngineProjectionEvidence {
  readonly kind: "projection";
  readonly seeds: readonly string[];
  readonly from: readonly string[];
  readonly reason: string;
}

/** `invariant`: a resolvable symbol delivers the axis, or fixes it, outside this engine. */
export interface EngineDeliveryEvidence {
  readonly kind: "delivery";
  readonly module: string;
  readonly symbol: string;
  readonly reason: string;
}

/**
 * `unsupported`: the axis is measurably incomplete here. `unaccounted` is the
 * exact count of declared channels this engine neither reads nor carries, so
 * the gap is pinned and cannot widen or close in silence.
 */
export interface EngineAbsenceEvidence {
  readonly kind: "absent";
  readonly unaccounted: number;
  readonly reason: string;
}

export type EngineEvidence =
  | EngineChannelEvidence
  | EngineProjectionEvidence
  | EngineDeliveryEvidence
  | EngineAbsenceEvidence;

/** The evidence shape each posture demands. Pairing the wrong one is a `tsc` error. */
export interface EnginePostureEvidence {
  readonly native: EngineChannelEvidence;
  readonly mapped: EngineProjectionEvidence;
  readonly invariant: EngineDeliveryEvidence;
  readonly unsupported: EngineAbsenceEvidence;
}

/** One cell of the posture matrix: a posture and the evidence that makes it falsifiable. */
export type EngineControlDeclaration = {
  [P in EnginePosture]: {
    readonly posture: P;
    readonly evidence: EnginePostureEvidence[P];
  };
}[EnginePosture];

/** Engine-library seeds, keyed by the LIBRARY's own token names. */
export type EngineSeeds = Readonly<Record<string, string | number>>;

/**
 * One compiled mode's seeds, already resolved against the base block the way
 * the cascade resolves it: a channel the mode does not override keeps its base
 * value, so a consumer never has to re-merge to configure a mode.
 */
export interface EngineProjectionMode {
  readonly mode: BrandThemeMode;
  readonly seeds: EngineSeeds;
}

/**
 * What an adapter may produce. An adapter may READ a `--ds-*` name in order to
 * resolve a seed value from `ThemeCompilation.cssVariables`; it may never EMIT
 * one as a key, and never produce CSS text. Enforced by the adapter drills, not
 * by the key type: `Record<string, ...>` cannot express the prohibition.
 */
export interface EngineProjection {
  readonly seeds: EngineSeeds;
  /**
   * One entry per compiled mode block, so a mode never silently reuses the
   * base seeds. Empty when the engine seeds no library at all.
   */
  readonly modes: readonly EngineProjectionMode[];
}

/**
 * `controls` is TOTAL over `ControlId`: omitting a key is a `tsc` error, which
 * is what makes "absence is a build error, not a default" structural rather
 * than a convention. `posture` is DERIVED from `controls` by
 * `defineEngineAdapter`, so a cell and its posture can never disagree.
 */
export interface EngineAdapter {
  readonly id: EngineName;
  /**
   * This engine's own baseline for the JS token tree: what `useTokens` layers
   * vertical, product-profile and tenant values on top of. It belongs to the
   * engine rather than to a theme, so it is declared beside the postures and
   * reached only through `resolveAdapter`.
   */
  readonly tokenBaseline: EngineTokenOverrides;
  readonly controls: Readonly<Record<ControlId, EngineControlDeclaration>>;
  readonly posture: Readonly<Record<ControlId, EnginePosture>>;
  project(compiled: ThemeCompilation): EngineProjection;
}

/** The engine-aware product. Extends the engine-independent contract, never replaces it. */
export interface EngineThemeCompilation extends ThemeCompilation {
  readonly engine: EngineName;
  readonly projection: EngineProjection;
}

/**
 * What the classic runtime bridge needs to seed its library without reading the
 * live cascade: the projection, the compiled default mode, and the engine the
 * projection was produced for.
 */
export interface EngineVisualDeclaration {
  readonly engine: EngineName;
  readonly projection: EngineProjection;
  readonly colorScheme?: BrandThemeMode;
  readonly runtime: ThemeCompilation["runtime"];
}
