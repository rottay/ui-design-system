/**
 * @fileoverview The `wizard-surface` channels the Modern skin reads with no
 * producer: the description's trailing rhythm and the ruled alert's optical
 * padding.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/chrome/wizard-surface
 * @category Compilers
 * @package @rottay/design-system
 *
 * @remarks
 * Each value is the fallback the skin already resolved to, so producing the
 * name changes nothing that renders and everything about whether a tenant can
 * reach it: a `var(--ds-x, LITERAL)` whose name nobody writes is a channel
 * that looks customizable and is not.
 */

import type { FamilyDeriver } from "../../../../foundation/contract";

/** A vertical's own wizard-surface chrome outranks every relation stated here. */
export const wizardSurfaceChromeDeriver: FamilyDeriver = {
  family: "wizard-surface",
  rank: "derived",
  consumes: ["spacing.rhythm", "density"],
  produces: [
    "--ds-wizard-surface-description-margin-block-end",
    "--ds-wizard-surface-error-banner-padding",
  ],
  derive: () => deriveWizardSurfaceChannels(),
};

export function deriveWizardSurfaceChannels(): Record<string, string> {
  const vars: Record<string, string> = {};

  /* The profile-driven Stack already supplies the description's trailing gap,
     so the channel rests at 0: producing the name moves nothing. */
  vars["--ds-wizard-surface-description-margin-block-end"] = "0";

  /* The ruled alert's optical padding on the rhythm plane. */
  vars["--ds-wizard-surface-error-banner-padding"] =
    "calc(var(--ds-spacing-3, 12px) * var(--ds-rhythm-effective-scale, 1))";

  return vars;
}
