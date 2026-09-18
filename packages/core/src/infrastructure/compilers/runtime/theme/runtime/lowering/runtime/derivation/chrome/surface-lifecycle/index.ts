/**
 * @fileoverview The `surface-lifecycle` channels: the stale banner's compact
 * strip rhythm and the error boundary's governed paint.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/chrome/surface-lifecycle
 * @category Compilers
 * @package @rottay/design-system
 *
 * @remarks
 * Two of these channels rename a read nobody produced:
 * `--ds-stale-banner-padding-block` / `-inline` were this family's own rhythm
 * under a name no family row could claim; they are `--ds-surface-lifecycle-*`
 * now, at the same resting values.
 *
 * The four error channels exist because the boundary's paint must outlive a
 * stylesheet failure: the runtime keeps only the measured legibility floor
 * inline and reads these channels for it, while `skin/surface-states` carries
 * the full paint from them. The values ride the semantic error surface (the
 * wash, edge and ink the Modern alert arm already mixes), so the boundary
 * answers to the same status error seed as every other error surface.
 */

import type { FamilyDeriver } from "../../../../foundation/contract";

/** A vertical's own surface-lifecycle chrome outranks every relation stated here. */
export const surfaceLifecycleChromeDeriver: FamilyDeriver = {
  family: "surface-lifecycle",
  rank: "derived",
  consumes: [
    "palette.*",
    "typography.roles",
    "typography.scale",
    "spacing.rhythm",
    "density",
  ],
  produces: [
    "--ds-surface-lifecycle-error-action-bg",
    "--ds-surface-lifecycle-error-bg",
    "--ds-surface-lifecycle-error-border",
    "--ds-surface-lifecycle-error-color",
    "--ds-surface-lifecycle-stale-banner-padding-block",
    "--ds-surface-lifecycle-stale-banner-padding-inline",
  ],
  derive: () => deriveSurfaceLifecycleChannels(),
};

export function deriveSurfaceLifecycleChannels(): Record<string, string> {
  const vars: Record<string, string> = {};

  /* The banner strip's rhythm, renamed from the unproduced
     `--ds-stale-banner-*` pair into the family namespace at the same
     resting gutters. */
  vars["--ds-surface-lifecycle-stale-banner-padding-block"] =
    "var(--ds-spacing-2, 8px)";
  vars["--ds-surface-lifecycle-stale-banner-padding-inline"] =
    "var(--ds-spacing-3, 12px)";

  /* The error boundary's governed paint, on the semantic error surface the
     Modern alert arm already mixes: an 8% wash on the mode's own canvas and
     a 30% edge on the mode's own border. The ink mixes the status error tone
     toward the MODE'S OWN text ink -- the same law section-frame's inks were
     adjudicated under: `--ds-color-error-ink` was measured failing this
     wash at 4.1-4.3 against the 4.5 AA floor on two dark scopes and on
     evnto light, and text that quiet is a finding, not a boundary. */
  vars["--ds-surface-lifecycle-error-bg"] =
    "color-mix(in oklab, var(--ds-color-error) 8%, var(--ds-color-bg-primary))";
  vars["--ds-surface-lifecycle-error-border"] =
    "color-mix(in srgb, var(--ds-color-error) 30%, var(--ds-color-border))";
  vars["--ds-surface-lifecycle-error-color"] =
    "color-mix(in oklab, var(--ds-color-error) 60%, var(--ds-color-text-primary))";
  vars["--ds-surface-lifecycle-error-action-bg"] =
    "var(--ds-color-bg-elevated)";

  return vars;
}
