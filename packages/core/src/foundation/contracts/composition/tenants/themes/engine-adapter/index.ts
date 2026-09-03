/**
 * @fileoverview Engine-adapter contract: posture and projection, nothing else.
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
 * `native`      the engine's own implementation reads the control's channels
 * `mapped`      deterministically translated into the engine library's vocabulary
 * `invariant`   the axis is outside this engine's declared expressive vocabulary
 * `unsupported` inside the vocabulary, but this engine has no route to it
 */
export type EnginePosture = "native" | "mapped" | "invariant" | "unsupported";

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
  readonly tokenOverrides: Partial<EngineTokenOverrides>;
  /**
   * One entry per compiled mode block, so a mode never silently reuses the
   * base seeds. Empty when the engine seeds no library at all.
   */
  readonly modes: readonly EngineProjectionMode[];
}

/**
 * `posture` is TOTAL over `ControlId`: omitting a key is a `tsc` error, which
 * is what makes "absence is a build error, not a default" structural rather
 * than a convention.
 */
export interface EngineAdapter {
  readonly id: EngineName;
  readonly posture: Readonly<Record<ControlId, EnginePosture>>;
  project(compiled: ThemeCompilation): EngineProjection;
}

/** The engine-aware product. Extends the engine-agnostic contract, never replaces it. */
export interface EngineThemeCompilation extends ThemeCompilation {
  readonly engine: EngineName;
  readonly projection: EngineProjection;
}
