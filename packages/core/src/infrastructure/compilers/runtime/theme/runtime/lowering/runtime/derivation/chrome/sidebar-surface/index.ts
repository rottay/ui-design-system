/**
 * @fileoverview The sidebar-surface family: a collapsible navigation panel
 * beside the main region, its tracks on the tenant's authored sidebar widths,
 * its region gap on the spacing ramp scaled by the rhythm dial, the
 * separator on the edge decision and the sidebar border root, and the track
 * change on the rearrange cadence. The panel and aside are Cards and paint
 * their own material.
 *
 * @remarks
 * Each produced value is the chained fallback the skin states for its read,
 * so producing the name cannot move a pixel: the gaps rest on the spacing
 * rungs (with the resting px tail), the aside track on the 80 rung, the
 * separator on the edge decision and the sidebar border root, and the track
 * change on the rearrange cadence.
 *
 * `--ds-sidebar-surface-aside-inline-size` is produced at the value the
 * skin's default arm declares it at, chaining the family's own aside-width
 * relation (which reaches the 80 rung): the skin redeclares the name on the
 * root element and that element-level statement outranks this derived one,
 * so the collapsed/aside arms stand untouched.
 *
 * The two tenant track widths stay honest literals: no produced spacing rung
 * rests at 17.5rem or 5.5rem (the ramp steps 16 to 20rem, 5 to 6rem), and
 * `--ds-sidebar-width`/`--ds-sidebar-collapsed-width` are tenant-authored
 * channels, not governed roots, so a chained fallback would repaint the
 * track under any tenant that moves a rung. `--ds-sidebar-surface-inline-size`
 * is deliberately not produced: its default arm chains the rootless width.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/chrome/sidebar-surface
 * @category Compilers
 * @package @rottay/design-system
 */

import type { FamilyDeriver } from "../../../../foundation/contract";

/** A vertical's own sidebar chrome outranks every relation stated here. */
export const sidebarSurfaceChromeDeriver: FamilyDeriver = {
  family: "sidebar-surface",
  rank: "derived",
  consumes: ["surfaces.*", "density", "motion", "navigation.sidebarTone"],
  produces: [
    "--ds-sidebar-surface-gap",
    "--ds-sidebar-surface-stacked-gap",
    "--ds-sidebar-surface-panel-gap",
    "--ds-sidebar-surface-main-gap",
    "--ds-sidebar-surface-width",
    "--ds-sidebar-surface-collapsed-width",
    "--ds-sidebar-surface-aside-width",
    "--ds-sidebar-surface-aside-inline-size",
    "--ds-sidebar-surface-divider",
    "--ds-sidebar-surface-motion-duration",
    "--ds-sidebar-surface-motion-easing",
  ],
  derive: () => deriveSidebarSurfaceChannels(),
};

export function deriveSidebarSurfaceChannels(): Record<string, string> {
  const vars: Record<string, string> = {};

  // Region rhythm on the spacing ramp, scaled by the rhythm dial.
  vars["--ds-sidebar-surface-gap"] = "calc(var(--ds-spacing-6, 24px) * var(--ds-rhythm-effective-scale, 1))";
  vars["--ds-sidebar-surface-stacked-gap"] = "calc(var(--ds-spacing-4, 16px) * var(--ds-rhythm-effective-scale, 1))";
  vars["--ds-sidebar-surface-panel-gap"] = "var(--ds-spacing-4, 16px)";
  vars["--ds-sidebar-surface-main-gap"] = "var(--ds-spacing-4, 16px)";

  // Tracks: the tenant's authored sidebar widths outrank the family's own.
  vars["--ds-sidebar-surface-width"] = "var(--ds-sidebar-width, 17.5rem)";
  vars["--ds-sidebar-surface-collapsed-width"] = "var(--ds-sidebar-collapsed-width, 5.5rem)";
  vars["--ds-sidebar-surface-aside-width"] = "var(--ds-spacing-80, 320px)";
  vars["--ds-sidebar-surface-aside-inline-size"] = "var(--ds-sidebar-surface-aside-width)";

  // The separator between panel and main follows the edge decision and the sidebar border root.
  vars["--ds-sidebar-surface-divider"] = "var(--ds-edge-standard-width) var(--ds-edge-standard-style) var(--ds-sidebar-border, var(--ds-color-border-subtle))";

  // A track change is a rearrangement.
  vars["--ds-sidebar-surface-motion-duration"] = "var(--ds-motion-rearrange, var(--ds-motion-normal))";
  vars["--ds-sidebar-surface-motion-easing"] = "var(--ds-motion-ease-move)";

  return vars;
}
