/**
 * @fileoverview The link family: how far the Modern hover ink darkens its
 * variant tone, on the state-emphasis hover delta.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/chrome/link
 * @category Compilers
 * @package @rottay/design-system
 */

import type { FamilyDeriver } from "../../../../foundation/contract";

/** A share, never a colour: the tone is declared on the Link element, so a root
 * colour naming it is invalid. Medium (4% hover delta) keeps the skin's 30%. */
export const linkChromeDeriver: FamilyDeriver = {
  family: "link",
  rank: "derived",
  consumes: ["surfaces.stateEmphasis"],
  produces: ["--ds-link-hover-mix"],
  derive: () => deriveLinkChannels(),
};

export function deriveLinkChannels(): Record<string, string> {
  const vars: Record<string, string> = {};
  vars["--ds-link-hover-mix"] = "calc(var(--ds-state-hover-shift, 4%) + 26%)";
  return vars;
}
