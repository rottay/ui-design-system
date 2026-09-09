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
 * on import order. The posture is a decision of the type family, so it is
 * stated here once and merged into the roles below anything the theme
 * authored; the foundation keeps a single resting declaration.
 *
 * This sub-owner mints nothing of its own: a facet with two writers inside one
 * family is the same defect one rank down.
 */
export const NUMERIC_POSTURE: SemanticTypographyTokens = Object.freeze({
  numeric: Object.freeze({
    fontWeight: 600,
    fontVariantNumeric: "tabular-nums lining-nums",
  }),
  code: Object.freeze({ fontVariantNumeric: "tabular-nums" }),
});
