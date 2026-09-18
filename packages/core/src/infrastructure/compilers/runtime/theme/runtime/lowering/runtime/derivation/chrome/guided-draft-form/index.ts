/**
 * @fileoverview The `guided-draft-form` heading-weight channel the skin reads
 * with no producer: the title, the section-card titles and the nav eyebrow
 * all resolve one personality-profile value, which the surface stamps on its
 * root at runtime; this deriver states the resting value of that channel so a
 * tenant theme can reach it without an instance override.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/chrome/guided-draft-form
 * @category Compilers
 * @package @rottay/design-system
 *
 * @remarks
 * The resting value is the fallback the skin already resolves to — producing
 * the name changes nothing that renders and everything about whether a tenant
 * can reach it: a `var(--ds-x, LITERAL)` whose name nobody writes is a channel
 * that looks customizable and is not.
 *
 * No decision plane reaches this value today: the profile bias is a runtime
 * product-profile input, not a Theme decision, so `derive` returns the resting
 * chain regardless of context. The instance stamp on the root still wins by
 * cascade, exactly as before.
 */

import type { FamilyDeriver } from "../../../../foundation/contract";

/** A vertical's own guided-draft-form chrome outranks every relation stated here. */
export const guidedDraftFormChromeDeriver: FamilyDeriver = {
  family: "guided-draft-form",
  rank: "derived",
  consumes: [
    "palette.*",
    "typography.roles",
    "typography.scale",
    "spacing.rhythm",
    "density",
  ],
  produces: ["--ds-guided-draft-form-heading-font-weight"],
  derive: () => deriveGuidedDraftFormChannels(),
};

export function deriveGuidedDraftFormChannels(): Record<string, string> {
  const vars: Record<string, string> = {};

  /* The resting value the personality profile's 'normal' bias resolves to
     (500/800 for the lighter/heavier biases arrive as the root's runtime
     stamp); the chain mirrors the skin's own fallback byte for byte. */
  vars["--ds-guided-draft-form-heading-font-weight"] =
    "var(--ds-font-weight-semibold, 600)";

  return vars;
}
