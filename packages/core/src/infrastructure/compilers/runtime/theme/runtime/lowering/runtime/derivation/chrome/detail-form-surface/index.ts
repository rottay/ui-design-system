/**
 * @fileoverview The `detail-form-surface` channel the Modern skin reads with
 * no producer: the ruled alert's optical padding.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/chrome/detail-form-surface
 * @category Compilers
 * @package @rottay/design-system
 *
 * @remarks
 * The value is the fallback the skin already resolved to, so producing the
 * name changes nothing that renders and everything about whether a tenant can
 * reach it: a `var(--ds-x, LITERAL)` whose name nobody writes is a channel
 * that looks customizable and is not.
 */

import type { FamilyDeriver } from "../../../../foundation/contract";

/** A vertical's own detail-form-surface chrome outranks every relation stated here. */
export const detailFormSurfaceChromeDeriver: FamilyDeriver = {
  family: "detail-form-surface",
  rank: "derived",
  consumes: ["spacing.rhythm", "density"],
  produces: ["--ds-detail-form-surface-error-banner-padding"],
  derive: () => deriveDetailFormSurfaceChannels(),
};

export function deriveDetailFormSurfaceChannels(): Record<string, string> {
  const vars: Record<string, string> = {};

  /* The ruled alert's optical padding on the rhythm plane. */
  vars["--ds-detail-form-surface-error-banner-padding"] =
    "calc(var(--ds-spacing-3, 12px) * var(--ds-rhythm-effective-scale, 1))";

  return vars;
}
