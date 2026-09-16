/**
 * @fileoverview The list family: the meta description's ink, mixed from the
 * secondary text role toward the primary one so a row's supporting line keeps
 * its contrast on every seed a tenant can author.
 *
 * The family's skeleton channels are deliberately NOT here: its loading state
 * is still hand-written, and the WO-FAM-14 renderer cannot own it until the
 * `aria-busy` ownership collision is adjudicated. Deriving channels for a
 * subtree slated to be replaced would be work to delete.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/chrome/list
 * @category Compilers
 * @package @rottay/design-system
 */

import type { FamilyDeriver } from "../../../../foundation/contract";

/** A vertical's own list chrome outranks every relation stated here. */
export const listChromeDeriver: FamilyDeriver = {
  family: "list",
  rank: "derived",
  consumes: ["palette.*", "typography.roles"],
  produces: ["--ds-list-meta-description-ink"],
  derive: () => deriveListChannels(),
};

export function deriveListChannels(): Record<string, string> {
  const vars: Record<string, string> = {};
  vars["--ds-list-meta-description-ink"] =
    "color-mix(in srgb, var(--ds-list-meta-description-color, var(--ds-color-text-secondary)) 70%,"
    + " var(--ds-color-text-primary) 30%)";
  return vars;
}
