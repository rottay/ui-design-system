/**
 * @fileoverview The `record` channels the Modern skin read with no producer:
 * the metrics summary strip's heading rung.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/chrome/record
 * @category Compilers
 * @package @rottay/design-system
 *
 * @remarks
 * Each value is the fallback the skin already resolved to, so producing the name
 * changes nothing that renders and everything about whether a tenant can reach it:
 * a `var(--ds-x, LITERAL)` whose name nobody writes is a channel that looks
 * customizable and is not.
 *
 * The field grid's `--ds-record-field-grid-columns` is deliberately NOT here:
 * the skin authors that declaration (an authored declaration is a producer),
 * and a second producer would be a second authority.
 */

import type { FamilyDeriver } from "../../../../foundation/contract";

/** A vertical's own record chrome outranks every relation stated here. */
export const recordChromeDeriver: FamilyDeriver = {
  family: "record",
  rank: "derived",
  consumes: ["typography.scale"],
  produces: ["--ds-record-heading-font-size"],
  derive: () => deriveRecordChannels(),
};

export function deriveRecordChannels(): Record<string, string> {
  const vars: Record<string, string> = {};

  /* The metrics strip's value rung, at rest the `--ds-font-size-lg` step the
     skin's single fallback resolves to. No type role states this rung across
     verticals (`--ds-type-numeric-font-size` diverges from it), so the honest
     chain is the fallback itself; the type-scale plane reaches it because the
     whole ramp rides `--ds-type-scale`. */
  vars["--ds-record-heading-font-size"] = "var(--ds-font-size-lg)";

  return vars;
}
