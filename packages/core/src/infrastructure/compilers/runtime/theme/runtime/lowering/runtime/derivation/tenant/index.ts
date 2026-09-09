/**
 * @fileoverview The tenant family: the white-label floor's own posture and
 * type, at the rank that outranks every vertical statement.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/tenant
 * @category Compilers
 * @package @rottay/design-system
 */

import { withArabicSafeFallback } from "@/foundation/kernel/typography";
import { appearancePostureToVariables } from "@/infrastructure/compilers/kernel/foundation/css/appearance-posture";
import type { FamilyDeriver } from "../../../foundation/contract";
import {
  buttonSilhouetteAlias,
  buttonSilhouetteChannels,
} from "../../../foundation/geometry";

/**
 * The tenant floor: tenant override > tenant profile > vertical theme > DS
 * defaults.
 *
 * It is a RANK, not a trailing assignment. Before the ranked merge the floor
 * had to be applied last to win, which meant it won over every writer that ran
 * before it and lost to every writer that ran after -- including the
 * vertical's hand-authored chrome, merged over the whole map one level up.
 * Absent tenant => this family emits nothing and the compile is exactly the
 * vertical's own.
 *
 * The tenant's own literal outranks the tenant's own pairing, so both halves
 * travel in this one family and resolve here rather than through two writers
 * separated by a rank boundary.
 */
export const tenantDeriver: FamilyDeriver = {
  family: "tenant",
  rank: "tenant",
  consumes: ["typography.*", "surfaces.*", "motion.*", "expressive.*"],
  produces: [
    "--ds-type-scale",
    "--ds-radius-scale",
    "--ds-radius-button",
    "--ds-button-xs-radius",
    "--ds-button-sm-radius",
    "--ds-button-md-radius",
    "--ds-button-lg-radius",
    "--ds-button-xl-radius",
    "--ds-density-mode-factor",
    "--ds-motion-intensity",
    "--ds-motion-duration-scale",
    "--ds-elevation-*",
    "--ds-font-family-base",
    "--ds-font-family-heading",
    "--ds-font-family-mono",
    "--ds-letter-spacing-heading",
    "--ds-line-height-display",
  ],
  derive: (context) => {
    const tenant = context.tenant;
    const vars: Record<string, string> = {};
    if (!tenant) return vars;
    const posture = tenant.posture;
    if (posture) {
      Object.assign(vars, appearancePostureToVariables(posture));
      // The silhouette is the tenant's statement, at the tenant's rank: it has
      // to outrank the vertical's authored button chrome, which is exactly what
      // the DB transport used to buy by expanding the word into a chrome leaf
      // of its own. It reaches the same six channels here, on both transports.
      // A word the tenant's PROFILE filled reaches the ramp alias only.
      Object.assign(
        vars,
        buttonSilhouetteAlias(posture.buttonStyle, context.radiusBaseline),
        buttonSilhouetteChannels(tenant.chosenButtonStyle, context.radiusBaseline)
      );
    }
    const tl = tenant.typography;
    if (tl) {
      if (tl.fontFamilyBase)
        vars["--ds-font-family-base"] = withArabicSafeFallback(
          tl.fontFamilyBase
        );
      if (tl.fontFamilyHeading)
        vars["--ds-font-family-heading"] = withArabicSafeFallback(
          tl.fontFamilyHeading
        );
      if (tl.fontFamilyMono) vars["--ds-font-family-mono"] = tl.fontFamilyMono;
      if (tl.letterSpacing?.heading)
        vars["--ds-letter-spacing-heading"] = tl.letterSpacing.heading;
      if (tl.lineHeight?.display != null)
        vars["--ds-line-height-display"] = String(tl.lineHeight.display);
    }
    return vars;
  },
};
