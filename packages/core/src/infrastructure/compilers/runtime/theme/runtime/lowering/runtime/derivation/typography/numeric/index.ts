/**
 * @fileoverview Typography sub-owner: the figure posture the roles wear -- the
 * resting statement, and the decision that moves it.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/typography/numeric
 * @category Compilers
 * @package @rottay/design-system
 */

import type { BrandTheme } from "@/foundation/contracts/composition/tenants/themes";
import {
  SEMANTIC_TYPOGRAPHY_ROLES,
  type SemanticTypographyTokens,
} from "@/foundation/contracts/kernel/tokens/typography";

/**
 * Tabular, lining figures for the two roles that carry numbers.
 *
 * `--ds-type-numeric-font-weight` and `--ds-type-code-font-variant-numeric`
 * were each declared at `:root` in two foundation files with DIFFERENT values
 * (600 vs 500, tabular-nums vs normal), so which figures a table drew depended
 * on import order. This is the type family's statement of that RESTING posture,
 * and `../tests` pins the foundation's single resting declaration to it.
 *
 * It mints nothing on its own: it is the floor `typography.numeric` moves from,
 * and the decision below is what enters the role merge.
 */
export const NUMERIC_POSTURE: SemanticTypographyTokens = Object.freeze({
  numeric: Object.freeze({
    fontWeight: 600,
    fontVariantNumeric: "tabular-nums lining-nums",
  }),
  code: Object.freeze({ fontVariantNumeric: "tabular-nums" }),
});

/**
 * Kit row 10: ONE figure posture, across every role.
 *
 * Figures are not a property of a surface, they are a property of a product: a
 * table whose columns align and a metric card whose digits drift are the same
 * decision made twice. Both steps therefore state every role, and the `numeric`
 * role keeps its LINING figures in both -- the choice is proportional versus
 * tabular advance, not whether digits sit on the baseline.
 *
 * Neither step is the identity, which is why both move channels: the resting
 * vocabulary is mixed (prose `normal`, code and numeric tabular), and a posture
 * that says "one figure grammar" cannot reproduce a mixture.
 */
const NUMERIC_FIGURES: Readonly<
  Record<
    NonNullable<NonNullable<BrandTheme["typography"]>["numeric"]>,
    { readonly prose: string; readonly numeric: string }
  >
> = {
  proportional: {
    prose: "proportional-nums",
    numeric: "proportional-nums lining-nums",
  },
  tabular: { prose: "tabular-nums", numeric: "tabular-nums lining-nums" },
};

type NumericPosture = keyof typeof NUMERIC_FIGURES;

/**
 * The posture the theme DECIDED, read with an own-property guard: a BrandTheme
 * is plain data by the time it reaches this compiler, so a bare bracket read of
 * a closed table resolves inherited members and unknown words alike. See
 * `../weights` for the full statement of that law.
 */
function readNumeric(bt: BrandTheme): NumericPosture | undefined {
  const authored = bt.typography?.numeric;
  return typeof authored === "string" &&
    Object.prototype.hasOwnProperty.call(NUMERIC_FIGURES, authored)
    ? (authored as NumericPosture)
    : undefined;
}

/**
 * The per-role figure posture the decision states, for the role merge.
 *
 * Returned as authored role tokens so the emitter's own precedence applies
 * unchanged: this posture outranks an expressive profile's
 * `fontVariantNumeric` overlay, and the finer
 * `typography.roles.<role>.fontVariantNumeric` outranks this posture.
 *
 * Empty when no decision is authored, which leaves `NUMERIC_POSTURE` and the
 * builder defaults exactly where they were.
 */
export function numericOverlay(bt: BrandTheme): SemanticTypographyTokens {
  const decided = readNumeric(bt);
  if (decided === undefined) return {};
  const figures = NUMERIC_FIGURES[decided];
  const overlay: Record<string, { fontVariantNumeric: string }> = {};
  for (const role of SEMANTIC_TYPOGRAPHY_ROLES) {
    overlay[role] = {
      fontVariantNumeric:
        role === "numeric" ? figures.numeric : figures.prose,
    };
  }
  return overlay as SemanticTypographyTokens;
}
