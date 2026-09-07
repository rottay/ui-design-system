/**
 * @fileoverview An authored BrandTheme draft, as the patch a preview resolves.
 *
 * @module Compilers/Theme/Ingress/Foundation/DraftPatch
 * @category Compilers
 * @package @rottay/design-system
 */

import type { BrandTheme } from "@/foundation/contracts/composition/tenants/themes";
import type {
  Governed,
  Theme,
  ThemeLayerPatch,
} from "@/foundation/contracts/composition/tenants/themes/iso";

/**
 * The families the `Theme` wraps in a governed slot, read off the contract
 * rather than restated.
 *
 * A draft authors the flat value; the patch has to carry it in the wrapper the
 * baseline declares, or the merge finds a plain record where the baseline holds
 * `{ value, disposition }`. Derived so that a family added to or removed from
 * the contract is a compile error here instead of a patch that silently stops
 * activating one axis.
 */
type GovernedFamily = {
  [K in keyof Theme]-?: Theme[K] extends Governed<unknown> ? K : never;
}[keyof Theme];

const GOVERNED_FAMILIES = [
  "motion",
  "charts",
  "recipes",
  "expressive",
  "responsive",
] as const satisfies readonly GovernedFamily[];

/** Exhaustive: every governed family the contract declares is listed above. */
const _ALL_GOVERNED_LISTED: (typeof GOVERNED_FAMILIES)[number] extends GovernedFamily
  ? GovernedFamily extends (typeof GOVERNED_FAMILIES)[number]
    ? true
    : never
  : never = true;
void _ALL_GOVERNED_LISTED;

/** Families a patch may never name: identity is the intent's, not the draft's. */
const IDENTITY_FAMILIES = ["id", "name"] as const;

/**
 * Project an authored draft onto the patch shape.
 *
 * A brand-studio or tenant-preview draft used to be handed to the compiler as
 * the whole BASELINE, lifted wrap-only so a sparse draft compiled only the
 * channels its author had written. That is a second authoring path: the same
 * draft, published as a tenant document, resolves over the vertical's total
 * theme and paints every other channel too, so the preview and the publish
 * disagreed by construction. As a patch over the vertical the draft belongs to,
 * they agree.
 *
 * Supplying a governed value is an ACTIVATION: the wrapper carries `value` and
 * no `disposition`, which is the shape `mergeThemePatches` reads as "the
 * transport selected this", clearing any `unassigned` disposition the baseline
 * declared. A family the draft omits is absent from the patch, so the
 * baseline's own value survives untouched.
 */
export function authoredThemePatch(draft: BrandTheme): ThemeLayerPatch {
  const patch: Record<string, unknown> = {};
  const governed = new Set<string>(GOVERNED_FAMILIES);
  const identity = new Set<string>(IDENTITY_FAMILIES);
  for (const [family, value] of Object.entries(draft)) {
    if (value === undefined || identity.has(family)) continue;
    patch[family] = governed.has(family) ? { value } : value;
  }
  return patch as ThemeLayerPatch;
}
