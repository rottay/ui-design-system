/* GENERATED — do not edit */
/**
 * @fileoverview The runtime half of every first-party vertical artifact.
 *
 * This file is a BUILD OUTPUT of the SAME compile that writes
 * `src/foundation/tokens/css/facade/artifacts/<slug>/index.css`:
 *   block = compileThemeIntent(staticThemeIntent(<slug>)).compiled.runtime
 *
 * WHY IT EXISTS. A code-owned vertical ships its CSS inside `styles.css`, so
 * the runtime has no artifact row to read the non-CSS half off — and a
 * governed SELECTION is not paint, so no stylesheet can hand it to React.
 * The runtime used to re-derive that selection from the authored BrandTheme,
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

import type { FirstPartyVerticalId } from '@/foundation/contracts/kernel/verticals';

/** The governed, non-CSS selections one vertical's artifact compiled. */
export interface FirstPartyArtifactRuntimeBlock {
  /** Validated recipe-profile id, absent when the vertical selects none. */
  readonly recipeProfile?: string;
}

export const FIRST_PARTY_ARTIFACT_RUNTIME: Readonly<
  Record<FirstPartyVerticalId, FirstPartyArtifactRuntimeBlock>
> = Object.freeze({
  rottay: Object.freeze({ recipeProfile: "rottay/technical-sharp@1" }),
  bithire: Object.freeze({ recipeProfile: "rottay/network-professional@1" }),
  evnto: Object.freeze({}),
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
