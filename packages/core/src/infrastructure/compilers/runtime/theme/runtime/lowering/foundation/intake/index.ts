/**
 * @fileoverview Governed intake: read a resolved Theme into compiler inputs.
 *
 * @module Compilers/Theme/Lowering/Foundation/intake
 * @category Compilers
 * @package @rottay/design-system
 */

import type { BrandTheme } from "@/foundation/contracts/composition/tenants/themes";
import {
  governedValue,
  isGovernedActive,
  type Governed,
  type Theme,
} from "@/foundation/contracts/composition/tenants/themes/iso";

/**
 * Unwrap a resolved `Theme`'s governed slots into the flat shape the channel
 * writers read.
 *
 * A governed slot carries a disposition when a capability is withheld, and a
 * withheld slot must be ABSENT rather than present-and-empty: the writers
 * branch on presence, so an empty object would paint a capability the theme
 * declined. `charts` is the one exception the contract makes — it unwraps to
 * `{}` because its writer reads sub-keys and never asks whether the container
 * is there.
 *
 * This is the lowering's own reading of the contract, not a conversion into a
 * second theme authority: nothing downstream of here may re-enter the Theme.
 */
export function readGovernedTheme(theme: Theme): BrandTheme {
  const brand: BrandTheme = {
    id: theme.id,
    name: theme.name,
    appearance: theme.appearance,
    modes: theme.modes,
    palette: theme.palette,
    typography: theme.typography,
    surfaces: theme.surfaces,
    charts: isGovernedActive(theme.charts) ? theme.charts.value : {},
    chrome: theme.chrome,
    capabilities: theme.capabilities,
  };

  if (isGovernedActive(theme.motion)) brand.motion = theme.motion.value;
  if (isGovernedActive(theme.recipes)) brand.recipes = theme.recipes.value;
  if (isGovernedActive(theme.expressive))
    brand.expressive = theme.expressive.value;
  if (isGovernedActive(theme.responsive))
    brand.responsive = theme.responsive.value;

  return brand;
}

/**
 * Lift an AUTHORED `BrandTheme` into a `Theme` by wrapping its governed
 * families and nothing else.
 *
 * This is the exact inverse of {@link readGovernedTheme}, and it is deliberately
 * NOT `brandThemeToTheme`: the ISO bridge also NORMALIZES — it materializes
 * every declared palette key, completes the chrome shape and folds in the
 * default motion/chart shapes. That completion is correct for a first-party
 * theme, which is already total, and wrong for an editor draft, which is not: a
 * sparse draft lifted through the normalizer would compile channels the author
 * never wrote.
 *
 * Callers holding a partially-authored theme — a brand-studio surface, a tenant
 * preview, a probe fixture — need the shape they authored to reach the compiler
 * unchanged. A family the draft omits gets a disposition rather than a value, so
 * `readGovernedTheme` drops the key again and the compiler sees exactly the
 * object it would have seen before this pipeline existed.
 */
export function liftAuthoredTheme(brand: BrandTheme): Theme {
  const wrap = <T>(value: T | undefined): Governed<T> =>
    value === undefined
      ? ({ value: undefined as T, disposition: "not-authored" } as Governed<T>)
      : governedValue(value);
  return {
    ...(brand as unknown as Theme),
    motion: wrap(brand.motion),
    charts: wrap(brand.charts),
    recipes: wrap(brand.recipes),
    expressive: wrap(brand.expressive),
    responsive: wrap(brand.responsive),
  };
}
