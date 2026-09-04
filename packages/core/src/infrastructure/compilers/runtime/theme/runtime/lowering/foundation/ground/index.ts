/**
 * @fileoverview Canvas ground facts: the default grounds and which one a theme sits on.
 *
 * @module Compilers/Theme/Lowering/Foundation/ground
 * @category Compilers
 * @package @rottay/design-system
 */

import type { BrandTheme } from "@/foundation/contracts/composition/tenants/themes";
import type { RampSurface } from "@/foundation/kernel/color/oklch/ramp";

/** The DS foundation's light canvas -- the ground a light-surface theme
 * falls back to when it does not declare its own `backgroundColor`. */
export const LIGHT_DEFAULT_GROUND = "#FFFFFF";

/** The DS foundation's dark canvas -- the ground a dark-surface theme falls
 * back to when it does not declare its own `backgroundColor`. */
export const DARK_DEFAULT_GROUND = "#0A0A0A";

/**
 * A theme is dark-surface when it DECLARES so: `appearance.defaultMode`.
 *
 * The classification used to be inferred from the shape of the palette --
 * "declares `darkBackgroundColor` and no `backgroundColor`". That inference
 * existed only because a dark theme had nowhere to say what it was: its own
 * ground had to be smuggled through a `dark`-prefixed field while the plain
 * field stayed empty, and every reader had to reconstruct the intent.
 *
 * A theme now writes its default mode down and puts that mode's values in the
 * PLAIN channels; the other mode, when it has one, is a `modes` overlay. So
 * the declaration is the classification, and a theme's ground is
 * `palette.backgroundColor` in every mode including its own dark one.
 */
export function isDarkSurfaceTheme(bt: BrandTheme | undefined): boolean {
  return bt?.appearance?.defaultMode === "dark";
}

/** The surface a theme's base block compiles for. */
export function brandThemeRampSurface(bt: BrandTheme | undefined): RampSurface {
  return isDarkSurfaceTheme(bt) ? "dark" : "light";
}
