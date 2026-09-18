/**
 * @fileoverview The `header-surface` chrome deriver — the measured empty set.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/chrome/header-surface
 * @category Compilers
 * @package @rottay/design-system
 *
 * @remarks
 * `produces` is EMPTY, and that is a measurement rather than an omission. The
 * surface reads zero custom properties and carries zero inline paint, because
 * every visual decision it renders belongs to a component it composes —
 * PageShellSurface, Tabs, Stack and Typography each own their own chrome,
 * their own channels and their own family row. What survives in the skin is
 * ONE rule: `min-inline-size: 0` flex/grid resilience under the compact
 * mobile posture. That is layout, not paint, and it has no value a tenant
 * could state — producing a channel for it would name a dial nobody turns,
 * and `var(--ds-x, LITERAL)` with no producer is a channel that looks
 * customizable and is not. Zero inline paint exists to drain; there is
 * nothing here to repair and no unproduced name to adopt. (The skin's own
 * header documents the same measurement:
 * `skin/layout-header/index.css`.)
 *
 * `consumes` is still stated honestly: these are the decision keypaths the
 * surface's composed children depend on, so a change to any of them reaches
 * this surface through its children's channels even though this family
 * emits none of its own.
 */

import type { FamilyDeriver } from "../../../../foundation/contract";

/** A vertical's own header-surface chrome outranks every relation stated here. */
export const headerSurfaceChromeDeriver: FamilyDeriver = {
  family: "header-surface",
  rank: "derived",
  consumes: [
    "palette.*",
    "typography.roles",
    "typography.scale",
    "spacing.rhythm",
    "density",
    "shape.*",
  ],
  produces: [],
  derive: () => deriveHeaderSurfaceChannels(),
};

/**
 * The family's channels at rest: none. See the module docblock for the
 * measured reason — the family owns zero paint channels, so the honest
 * emission is the empty map, and the ranked merge treats it as a no-op.
 */
export function deriveHeaderSurfaceChannels(): Record<string, string> {
  return {};
}
