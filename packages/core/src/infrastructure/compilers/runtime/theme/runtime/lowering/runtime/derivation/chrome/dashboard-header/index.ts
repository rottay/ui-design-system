/**
 * @fileoverview The `dashboard-header` channels: the root card's room, rule and
 * wash, the identity tile, the readout rail's rhythm and the action cluster's
 * glass opt-in.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/chrome/dashboard-header
 * @category Compilers
 * @package @rottay/design-system
 *
 * @remarks
 * Sixteen names the Modern skin already read had no producer at all
 * (`-actions-backdrop`, `-bg`, `-border`, the icon tile's four, `-radius`,
 * `-shadow`, the sheen's two, `-title-tracking` and the four
 * `--ds-dashboard-metric-*` reads): a `var(--ds-x, LITERAL)` nobody writes is a
 * channel that looks customizable and is not. The four metric names lived
 * OUTSIDE the family namespace (`--ds-dashboard-metric-*`), one folder name
 * away from the family's own; they are respelled `--ds-dashboard-header-metric-*`
 * at byte-identical fallbacks, the kanban-board precedent.
 *
 * Seven more were family-PRIVATE (`--_ds-dashboard-header-room`,
 * `-room-tight`, `-gap`, `-gap-tight`, `-gap-hair`, `-rule`, `-highlight`) --
 * the rhythm aliases the root mounted for its descendants. A leading
 * underscore puts a channel outside every producer census and outside the
 * tenant's reach at the same time; the family's whole box model is the
 * family's own, so the names move into the namespace at the same resting
 * values. The eighth private (`--_ds-dashboard-header-rule-color`) was a pure
 * alias of the border channel and is read as that chain directly.
 *
 * Each value is the single fallback the skin reads it with, so producing the
 * name moves no pixel; registration at integration only makes the resting
 * value tenant-movable.
 */

import type { FamilyDeriver } from "../../../../foundation/contract";

/** A vertical's own dashboard-header chrome outranks every relation stated here. */
export const dashboardHeaderChromeDeriver: FamilyDeriver = {
  family: "dashboard-header",
  rank: "derived",
  consumes: [
    "palette.*",
    "typography.roles",
    "typography.scale",
    "spacing.rhythm",
    "density",
    "shape.*",
    "surfaces.elevation-posture",
    "surfaces.focusStyle",
    "states.*",
    "motion.*",
  ],
  produces: [
    "--ds-dashboard-header-actions-backdrop",
    "--ds-dashboard-header-bg",
    "--ds-dashboard-header-border",
    "--ds-dashboard-header-gap",
    "--ds-dashboard-header-gap-hair",
    "--ds-dashboard-header-gap-tight",
    "--ds-dashboard-header-highlight",
    "--ds-dashboard-header-icon-bg",
    "--ds-dashboard-header-icon-border",
    "--ds-dashboard-header-icon-color",
    "--ds-dashboard-header-icon-size",
    "--ds-dashboard-header-metric-bg",
    "--ds-dashboard-header-metric-icon-color",
    "--ds-dashboard-header-metric-radius",
    "--ds-dashboard-header-metric-rule",
    "--ds-dashboard-header-radius",
    "--ds-dashboard-header-room",
    "--ds-dashboard-header-room-tight",
    "--ds-dashboard-header-rule",
    "--ds-dashboard-header-shadow",
    "--ds-dashboard-header-sheen-duration",
    "--ds-dashboard-header-sheen-opacity",
    "--ds-dashboard-header-title-tracking",
  ],
  derive: () => deriveDashboardHeaderChannels(),
};

export function deriveDashboardHeaderChannels(): Record<string, string> {
  const vars: Record<string, string> = {};

  /* The room axis: the fluid clamp the root padded with and the tight block
     the compact posture substitutes, both on the density dial. */
  vars["--ds-dashboard-header-room"] =
    "calc(clamp(var(--ds-spacing-4, 16px), 2.2vw, var(--ds-spacing-6, 24px)) * var(--ds-rhythm-effective-scale, 1))";
  vars["--ds-dashboard-header-room-tight"] =
    "calc(var(--ds-spacing-3, 12px) * var(--ds-rhythm-effective-scale, 1))";
  vars["--ds-dashboard-header-gap"] =
    "calc(var(--ds-spacing-4, 16px) * var(--ds-rhythm-effective-scale, 1))";
  vars["--ds-dashboard-header-gap-tight"] =
    "calc(var(--ds-spacing-2, 8px) * var(--ds-rhythm-effective-scale, 1))";
  vars["--ds-dashboard-header-gap-hair"] =
    "calc(var(--ds-spacing-1, 4px) * var(--ds-rhythm-effective-scale, 1))";

  /* The one hairline the header draws: its weight and its ink. The ink is the
     border channel over the neutral ramp -- the alias the skin used to mount
     privately is gone. */
  vars["--ds-dashboard-header-rule"] = "var(--ds-border-width-1, 1px)";
  vars["--ds-dashboard-header-border"] = "var(--ds-color-border-subtle)";

  /* The quiet top-down wash: the card material with the primary's faintest
     breath at the crown and the panel's at the foot. */
  vars["--ds-dashboard-header-bg"] =
    "linear-gradient(180deg, color-mix(in srgb, var(--ds-color-primary) 5%, var(--ds-surface-card)), var(--ds-surface-card) 58%, color-mix(in srgb, var(--ds-surface-panel) 34%, var(--ds-surface-card)))";
  vars["--ds-dashboard-header-highlight"] =
    "color-mix(in srgb, var(--ds-color-bg-elevated) 88%, transparent)";
  vars["--ds-dashboard-header-radius"] = "var(--ds-radius-xl)";
  vars["--ds-dashboard-header-shadow"] = "var(--ds-elevation-1)";

  /* One arrival sweep, then still. */
  vars["--ds-dashboard-header-sheen-opacity"] = "0.2";
  vars["--ds-dashboard-header-sheen-duration"] = "var(--ds-motion-calm, var(--ds-motion-slow))";

  /* The identity tile. */
  vars["--ds-dashboard-header-icon-size"] = "42px";
  vars["--ds-dashboard-header-icon-color"] = "var(--ds-color-primary)";
  vars["--ds-dashboard-header-icon-bg"] =
    "color-mix(in srgb, var(--ds-color-primary) 9%, var(--ds-surface-card))";
  vars["--ds-dashboard-header-icon-border"] =
    "color-mix(in srgb, var(--ds-color-primary) 20%, var(--ds-color-border-subtle))";
  vars["--ds-dashboard-header-title-tracking"] = "var(--ds-type-page-title-letter-spacing)";

  /* The readout rail: the metric cells stay frameless by default; a tenant
     that declares the frame channels gets a framed chip back. The rule between
     cells rides the border channel over the neutral ramp. */
  vars["--ds-dashboard-header-metric-bg"] = "none";
  vars["--ds-dashboard-header-metric-radius"] = "var(--ds-radius-none, 0)";
  vars["--ds-dashboard-header-metric-icon-color"] = "var(--ds-color-primary)";
  vars["--ds-dashboard-header-metric-rule"] =
    "var(--ds-dashboard-header-border, var(--ds-color-border-subtle))";

  /* Glass on the action cluster is opt-in (default none): a default-ON blur
     taxes every scroll frame. */
  vars["--ds-dashboard-header-actions-backdrop"] = "none";

  return vars;
}
