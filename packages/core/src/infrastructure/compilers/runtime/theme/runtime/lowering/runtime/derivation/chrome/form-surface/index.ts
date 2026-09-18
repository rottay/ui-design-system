/**
 * @fileoverview The `form-surface` channels the Modern skin reads with no
 * producer: the sticky-actions scroll runway, the action rail's gap, the
 * description's trailing rhythm and the ruled alert's optical padding.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/chrome/form-surface
 * @category Compilers
 * @package @rottay/design-system
 *
 * @remarks
 * Each value is the fallback the skin already resolved to, so producing the
 * name changes nothing that renders and everything about whether a tenant can
 * reach it: a `var(--ds-x, LITERAL)` whose name nobody writes is a channel
 * that looks customizable and is not.
 */

import type { FamilyDeriver } from "../../../../foundation/contract";

/** A vertical's own form-surface chrome outranks every relation stated here. */
export const formSurfaceChromeDeriver: FamilyDeriver = {
  family: "form-surface",
  rank: "derived",
  consumes: ["spacing.rhythm", "density"],
  produces: [
    "--ds-form-action-dock-reserved-space",
    "--ds-form-surface-actions-gap",
    "--ds-form-surface-description-margin-block-end",
    "--ds-form-surface-error-banner-padding",
  ],
  derive: () => deriveFormSurfaceChannels(),
};

export function deriveFormSurfaceChannels(): Record<string, string> {
  const vars: Record<string, string> = {};

  /* 96px of scroll runway under the fixed mobile ActionDock. No spacing rung
     is stable at 96px across density modes (`--ds-spacing-24` recomputes under
     `--ds-density-effective-scale`) while this reservation is a fixed scroll
     length, so the literal stays — the form-header 24px root margin precedent. */
  vars["--ds-form-action-dock-reserved-space"] = "6rem";

  /* The rail's gap was a `gap={8}` prop on the actions Flex: a visual value in
     the TSX. Same 8px at rest, on the rhythm plane every other gutter here
     already rides. */
  vars["--ds-form-surface-actions-gap"] =
    "calc(8px * var(--ds-rhythm-effective-scale, 1))";

  /* The profile-driven Stack already supplies the description's trailing gap,
     so the channel rests at 0, chained to the produced zero rung: the produced
     `--ds-spacing-0` is itself `0`, so producing the name moves nothing. */
  vars["--ds-form-surface-description-margin-block-end"] = "var(--ds-spacing-0, 0)";

  /* The ruled alert's optical padding on the rhythm plane. */
  vars["--ds-form-surface-error-banner-padding"] =
    "calc(var(--ds-spacing-3, 12px) * var(--ds-rhythm-effective-scale, 1))";

  return vars;
}
