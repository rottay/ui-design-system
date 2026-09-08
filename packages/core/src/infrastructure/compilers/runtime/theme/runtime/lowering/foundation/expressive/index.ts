/**
 * @fileoverview The one expressive expansion of the lowering.
 *
 * @module Compilers/Theme/Lowering/Foundation/expressive
 * @category Compilers
 * @package @rottay/design-system
 */

import type { BrandExpressiveSelection } from "@/foundation/contracts/composition/tenants/themes";
import {
  resolveExpressiveAxes,
  sanitizeExpressiveOverrides,
} from "@/foundation/tokens/ts/presentation/expressive-profiles";
/* A namespace import, so the expansion is named on exactly one line in this
 * package: the single-call-site law is greppable rather than merely intended. */
import * as profiles from "@/foundation/tokens/ts/presentation/expressive-profiles/expansion";
import type { ExpressiveFacts } from "../contract";

/**
 * Resolve one expressive selection into the facts every family reads.
 *
 * This is the SOLE call site of the profile expansion in the lowering. It used
 * to run once per consumer -- the channel assembly, the chrome radius divisor,
 * the tenant posture and the personality projection each expanded the same
 * selection with its own version policy, so five copies could disagree about
 * one theme. Fail-closed is unchanged: an unknown id or a foreign schema
 * version resolves to empty axes, which expand to nothing.
 */
export function resolveExpressiveFacts(
  selection: BrandExpressiveSelection | undefined
): ExpressiveFacts {
  const axes = resolveExpressiveAxes(
    selection?.experienceProfile,
    sanitizeExpressiveOverrides(selection?.profiles),
    selection?.schemaVersion
  );
  return {
    axes,
    expansion: profiles.expandExpressiveProfiles(axes),
    typeRoleOverlay: profiles.expressiveTypeRoleOverlay(axes),
  };
}
