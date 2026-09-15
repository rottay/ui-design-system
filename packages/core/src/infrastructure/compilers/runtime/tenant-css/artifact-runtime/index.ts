/* GENERATED — do not edit */
/**
 * @fileoverview The runtime half of every first-party vertical artifact.
 *
 * This file is a BUILD OUTPUT of the SAME compile that writes
 * `src/foundation/tokens/css/facade/artifacts/<slug>/index.css`:
 *   block = the recipe selection that compile validated, plus the governed
 *   behavior `firstPartyGovernedBehavior` reads off its resolved baseline.
 *
 * WHY IT EXISTS. A code-owned vertical ships its CSS inside `styles.css`, so
 * the runtime has no artifact row to read the non-CSS half off — and a
 * governed SELECTION is not paint, so no stylesheet can hand it to React.
 * The runtime used to re-derive that selection from the authored theme,
 * which made the artifact and the product two independent readers of one
 * decision. This is the artifact's own block, materialized for import
 * exactly as its variables are materialized for loading.
 *
 * Regenerate: pnpm -C ui-design-system/packages/core build:vertical-css
 *
 * @module Compilers/TenantCss/ArtifactRuntime
 * @category Compilers
 * @package @rottay/design-system
 */

import type { BrandExpressiveSelection } from '@/foundation/contracts/composition/tenants/themes';
import type { FirstPartyVerticalId } from '@/foundation/contracts/kernel/verticals';

/** The governed, non-CSS selections one vertical's artifact compiled. */
export interface FirstPartyArtifactRuntimeBlock {
  /** Validated recipe-profile id, absent when the vertical selects none. */
  readonly recipeProfile?: string;
  /** The motion dial the vertical decided; absent when it left motion to the foundation. */
  readonly motion?: {
    readonly intensity?: number;
    readonly entranceDuration?: number;
  };
  /** The expressive selection the vertical decided. */
  readonly expressive?: BrandExpressiveSelection;
  /** Personality channels the vertical decided -- names only, nothing here can paint. */
  readonly decidedChannels?: readonly string[];
}

export const FIRST_PARTY_ARTIFACT_RUNTIME: Readonly<
  Record<FirstPartyVerticalId, FirstPartyArtifactRuntimeBlock>
> = Object.freeze({
  rottay: Object.freeze({ motion: {"intensity":0.5}, decidedChannels: ["animation.intensity","card.paddingDensity"] }),
  bithire: Object.freeze({ recipeProfile: "rottay/technical-sharp@1", motion: {"intensity":0.55}, expressive: {"schemaVersion":1,"experienceProfile":"rottay/bithire-technical@1","profiles":{"type":"technical","geometry":"sharp","edge":"outlined","material":"flat","elevation":"hairline-lift","motif":"micro-grid","icon":"strong-outline"}}, decidedChannels: ["animation.intensity","card.paddingDensity"] }),
  evnto: Object.freeze({ motion: {"intensity":0.5}, decidedChannels: ["animation.intensity","card.paddingDensity"] }),
});

/**
 * The recipe profile a first-party vertical's artifact compiled, or
 * `undefined` when it selected none. Never a fallback to another vertical.
 */
export function firstPartyArtifactRecipeProfile(
  vertical: string,
): string | undefined {
  return FIRST_PARTY_ARTIFACT_RUNTIME[vertical as FirstPartyVerticalId]
    ?.recipeProfile;
}
