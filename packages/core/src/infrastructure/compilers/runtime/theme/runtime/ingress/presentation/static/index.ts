/**
 * @fileoverview The static first-party ingress: a vertical's own baseline.
 *
 * @module Compilers/Theme/Ingress/Presentation/Static
 * @category Compilers
 * @package @rottay/design-system
 */

import type { ThemeIntent } from "@/foundation/contracts/composition/tenants/themes/intent";
import type { FirstPartyVerticalId } from "@/foundation/contracts/kernel/verticals";

/**
 * The intent a code-owned vertical compiles under.
 *
 * The patch is EMPTY, and that is the whole statement: the roster `Theme` is
 * already total, so the vertical's own compile has nothing to overlay. No
 * neutral DS Theme is invented to demote the vertical into a patch, and no
 * caller assembles `{ ...FIRST_PARTY_THEMES[slug], id }` to say the same thing.
 *
 * `slug` defaults to the vertical because the vertical's shipped artifact is
 * scoped to its own name; it is separate so that a probe or a preview can scope
 * the vertical's untouched baseline under a tenant's selector, which is exactly
 * what a delta against that baseline needs.
 */
export function staticThemeIntent(
  vertical: FirstPartyVerticalId,
  slug: string = vertical
): ThemeIntent {
  return { vertical, slug, origin: "static-vertical", patch: {} };
}
