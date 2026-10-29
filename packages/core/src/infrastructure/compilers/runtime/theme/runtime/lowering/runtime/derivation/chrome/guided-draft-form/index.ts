/**
 * @fileoverview GuidedDraftForm headings follow the section-title role weight,
 * with the existing semibold fallback when that role channel is absent.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/chrome/guided-draft-form
 * @category Compilers
 * @package @rottay/design-system
 *
 * @remarks
 * The role is read at the theme root before the skin retunes it on heading
 * elements. An explicitly authored personality bias stamps above this inherited channel.
 */

import type { FamilyDeriver } from "../../../../foundation/contract";

/** A vertical's own guided-draft-form chrome outranks every relation stated here. */
export const guidedDraftFormChromeDeriver: FamilyDeriver = {
  family: "guided-draft-form",
  rank: "derived",
  consumes: [
    "palette.*",
    "typography.roles",
    "typography.roleWeights",
    "typography.scale",
    "spacing.rhythm",
    "density",
  ],
  produces: ["--ds-guided-draft-form-heading-font-weight"],
  derive: () => deriveGuidedDraftFormChannels(),
};

export function deriveGuidedDraftFormChannels(): Record<string, string> {
  const vars: Record<string, string> = {};

  vars["--ds-guided-draft-form-heading-font-weight"] =
    "var(--ds-type-section-title-font-weight, var(--ds-font-weight-semibold, 600))";

  return vars;
}
