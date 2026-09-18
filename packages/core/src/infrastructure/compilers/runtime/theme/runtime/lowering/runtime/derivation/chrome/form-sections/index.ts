/**
 * @fileoverview The `form-sections` channels the Modern skin reads with no
 * producer: the facts-card title's editorial size.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/chrome/form-sections
 * @category Compilers
 * @package @rottay/design-system
 *
 * @remarks
 * The value is the fallback the skin already resolved to, so producing the
 * name changes nothing that renders and everything about whether a tenant can
 * reach it: a `var(--ds-x, LITERAL)` whose name nobody writes is a channel
 * that looks customizable and is not.
 *
 * The editorial 17px has no canonical font-size role (base is 16px, lg is 18px
 * at every shipped type profile), so the resting value is the honest literal
 * rather than a type-scale chain that would not equal it under every
 * vertical.
 *
 * The eleven per-tone `--ds-form-sections-*` names are AUTHORED declarations
 * on the skin's `[data-tone]` arms, not reads waiting for a producer: the
 * per-tone variation is the family's product contract and a second producer
 * there would be a second authority. They are deliberately NOT listed here.
 *
 * The open card section's depth chains the governed `raised` role's SELECTED
 * facet (`--ds-material-raised-shadow-selected`) before its literal. That
 * channel never entered the material vocabulary; the read stays pinned as
 * routed residue on the material lane and is not restated under this family's
 * namespace.
 */

import type { FamilyDeriver } from "../../../../foundation/contract";

/** A vertical's own form-sections chrome outranks every relation stated here. */
export const formSectionsChromeDeriver: FamilyDeriver = {
  family: "form-sections",
  rank: "derived",
  consumes: [
    "palette.*",
    "typography.roles",
    "density",
    "motion.*",
  ],
  produces: [
    "--ds-form-sections-facts-title-font-size",
  ],
  derive: () => deriveFormSectionsChannels(),
};

export function deriveFormSectionsChannels(): Record<string, string> {
  const vars: Record<string, string> = {};

  /* The facts card title's editorial size: a literal with no canonical role,
     quoted byte-identically to the fallback the skin states for it. */
  vars["--ds-form-sections-facts-title-font-size"] = "17px";

  return vars;
}
