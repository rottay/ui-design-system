/**
 * @fileoverview Typography sub-owner: the figure posture the numeric and code
 * roles wear.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/typography/numeric
 * @category Compilers
 * @package @rottay/design-system
 */

import type { SemanticTypographyTokens } from "@/foundation/contracts/kernel/tokens/typography";

/**
 * Tabular, lining figures for the two roles that carry numbers.
 *
 * `--ds-type-numeric-font-weight` and `--ds-type-code-font-variant-numeric`
 * were each declared at `:root` in two foundation files with DIFFERENT values
 * (600 vs 500, tabular-nums vs normal), so which figures a table drew depended
 * on import order. This is the type family's statement of that posture, and
 * `../tests` pins the foundation's single resting declaration to it.
 *
 * It mints nothing and does not enter the role merge: an expressive profile
 * and an authored role both outrank a DS default, and a sub-owner that
 * re-asserted the same facet above them would silently invert that order.
 */
export const NUMERIC_POSTURE: SemanticTypographyTokens = Object.freeze({
  numeric: Object.freeze({
    fontWeight: 600,
    fontVariantNumeric: "tabular-nums lining-nums",
  }),
  code: Object.freeze({ fontVariantNumeric: "tabular-nums" }),
});
