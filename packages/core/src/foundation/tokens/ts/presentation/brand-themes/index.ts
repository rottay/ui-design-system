/**
 * First-party authored themes, and the canonical ISO Themes derived from them.
 * Identity, engine, envelope and the slug-derived paths live in the roster
 * (`foundation/presets/verticals/roster`); this barrel owns paint only.
 */

import {
  brandThemeToTheme,
  type Theme,
} from "@/foundation/contracts/composition/tenants/themes/iso";
import type { FirstPartyVerticalId } from "@/foundation/contracts/kernel/verticals";

import { rottayBrandTheme } from "./rottay";
import { bithireBrandTheme } from "./bithire";
import { evntoBrandTheme } from "./evnto";

export { rottayBrandTheme } from "./rottay";
export { bithireBrandTheme } from "./bithire";
export { evntoBrandTheme } from "./evnto";

/**
 * The canonical first-party ISO Themes, derived from the BrandTheme sources
 * this barrel already owns.
 *
 * This lived in a `first-party-themes.ts` leaf beside the three vertical
 * folders, re-exported from here. The leaf's whole content was the three-line
 * record below, over the same three imports this file already had -- so the
 * indirection bought nothing and cost the tree its ownership shape: the
 * brand-themes root is supposed to hold the barrel and the three vertical
 * folders, and nothing else. Folded in, with no compatibility re-export left
 * behind.
 */
/**
 * FROZEN, all the way down.
 *
 * These three objects are module singletons that every SSR request in a process
 * reads. Unfrozen, one request that mutated a leaf of the baseline it resolved
 * changed the product for every request after it, in the same process, with no
 * trace (F-60). Freezing does not stop the resolver -- `mergeThemePatches`
 * builds a new object -- it stops the accident.
 */
function deepFreezeTheme<T>(value: T): T {
  if (value !== null && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value as Record<string, unknown>)) {
      deepFreezeTheme(child);
    }
  }
  return value;
}

export const FIRST_PARTY_THEMES: Record<FirstPartyVerticalId, Theme> =
  deepFreezeTheme({
    rottay: brandThemeToTheme(rottayBrandTheme),
    bithire: brandThemeToTheme(bithireBrandTheme),
    evnto: brandThemeToTheme(evntoBrandTheme),
  });
