/**
 * @fileoverview The `stats-header` channels: the pulse card's frame and state, the
 * metric's editorial scale, the change pill's rungs, the sparkline and the glow.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/chrome/stats-header
 * @category Compilers
 * @package @rottay/design-system
 *
 * @remarks
 * Nine of these names were already read by the Modern skin with no producer at all,
 * which is a channel that looks customizable and is not. The rest were literals in
 * the skin or geometry props in the TSX -- the card's hover lift, its press, its
 * focus ring, the sparkline's dot size and gap, the change pill's gaps and the glow
 * -- so this family's whole visual vocabulary is reachable in one place now.
 *
 * Each value is the single fallback the skin reads it with, so producing the name
 * moves no pixel. The two names that stay PRIVATE are the two that are per-instance
 * rather than per-tenant: `--_ds-stats-header-track-count`, written by the container
 * cuts, and `--_ds-stats-header-spark-dot-level`, written by the dot's own
 * `data-level` stamp. Neither is a dial anybody turns from a theme.
 */

import type { FamilyDeriver } from "../../../../foundation/contract";

/** A vertical's own stats-header chrome outranks every relation stated here. */
export const statsHeaderChromeDeriver: FamilyDeriver = {
  family: "stats-header",
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
    "--ds-stats-header-card-bg",
    "--ds-stats-header-card-frame",
    "--ds-stats-header-card-min-height",
    "--ds-stats-header-card-min-height-compact",
    "--ds-stats-header-card-padding",
    "--ds-stats-header-card-padding-compact",
    "--ds-stats-header-card-radius",
    "--ds-stats-header-change-column-gap",
    "--ds-stats-header-change-row-gap",
    "--ds-stats-header-columns",
    "--ds-stats-header-focus-ring-color",
    "--ds-stats-header-glow-block-size",
    "--ds-stats-header-glow-strength",
    "--ds-stats-header-grid-gap",
    "--ds-stats-header-hover-lift",
    "--ds-stats-header-hover-shadow",
    "--ds-stats-header-icon-opacity",
    "--ds-stats-header-insight-margin-block-start",
    "--ds-stats-header-kicker-font-size",
    "--ds-stats-header-kicker-tracking",
    "--ds-stats-header-label-font-size",
    "--ds-stats-header-meta-font-size",
    "--ds-stats-header-ping-duration",
    "--ds-stats-header-press-scale",
    "--ds-stats-header-press-shadow",
    "--ds-stats-header-progress-margin-block-start",
    "--ds-stats-header-spark-dot-gap",
    "--ds-stats-header-spark-dot-opacity-floor",
    "--ds-stats-header-spark-dot-size",
    "--ds-stats-header-spark-margin-block-start",
    "--ds-stats-header-value-font-size",
    "--ds-stats-header-value-font-size-compact",
    "--ds-stats-header-value-font-weight",
  ],
  derive: () => deriveStatsHeaderChannels(),
};

export function deriveStatsHeaderChannels(): Record<string, string> {
  const vars: Record<string, string> = {};
  /* The card's own quiet frame: the text ink at 6%, which is the tint the card,
     the glow and the hover shadow all quote. */
  const tint = (percent: string) =>
    `color-mix(in srgb, var(--ds-color-text-primary) ${percent}, transparent)`;

  /* The wide-column default. The engine publishes the real count per instance --
     as a channel the grid reads AND as an attribute the container cuts select on,
     because a container query cannot read a custom property from a selector. */
  vars["--ds-stats-header-columns"] = "4";
  vars["--ds-stats-header-grid-gap"] = "var(--ds-spacing-3, 12px)";

  vars["--ds-stats-header-card-min-height"] = "140px";
  vars["--ds-stats-header-card-min-height-compact"] = "120px";
  vars["--ds-stats-header-card-padding"] = "var(--ds-spacing-5, 20px) var(--ds-spacing-6, 24px)";
  vars["--ds-stats-header-card-padding-compact"] = "18px";
  vars["--ds-stats-header-card-radius"] = "var(--ds-radius-lg, 12px)";
  vars["--ds-stats-header-card-bg"] = "var(--ds-color-bg-primary)";
  vars["--ds-stats-header-card-frame"] = tint("6%");

  vars["--ds-stats-header-hover-lift"] = "translateY(-2px)";
  vars["--ds-stats-header-hover-shadow"] = `0 8px 24px ${tint("6%")}`;
  vars["--ds-stats-header-press-scale"] = "scale(0.98)";
  vars["--ds-stats-header-press-shadow"] = `0 1px 3px ${tint("2%")}`;
  vars["--ds-stats-header-focus-ring-color"] =
    "var(--ds-focus-ring-color, var(--ds-color-primary))";

  vars["--ds-stats-header-value-font-size"] = "2.25rem";
  vars["--ds-stats-header-value-font-size-compact"] = "1.75rem";
  vars["--ds-stats-header-value-font-weight"] = "var(--ds-font-weight-extrabold, 800)";
  vars["--ds-stats-header-label-font-size"] = "var(--ds-font-size-sm)";
  vars["--ds-stats-header-kicker-font-size"] = "var(--ds-font-size-2xs)";
  vars["--ds-stats-header-kicker-tracking"] = "0.04em";
  vars["--ds-stats-header-meta-font-size"] = "var(--ds-font-size-2xs)";
  vars["--ds-stats-header-icon-opacity"] = "0.6";

  /* The change pill's two gaps and the sparkline's were `gap` props on the TSX:
     visual values in the component, on no plane at all. */
  vars["--ds-stats-header-change-row-gap"] = "2px";
  vars["--ds-stats-header-change-column-gap"] = "3px";
  vars["--ds-stats-header-spark-dot-gap"] = "6px";
  vars["--ds-stats-header-spark-dot-size"] = "var(--ds-spacing-1, 4px)";
  vars["--ds-stats-header-spark-margin-block-start"] = "14px";
  /* The quietest dot of a series. The loudest is opaque, and the six steps in
     between are the dot's `data-level` stamp read through the skin. */
  vars["--ds-stats-header-spark-dot-opacity-floor"] = "0.15";
  vars["--ds-stats-header-ping-duration"] = "400ms";

  vars["--ds-stats-header-progress-margin-block-start"] = "10px";
  vars["--ds-stats-header-insight-margin-block-start"] = "var(--ds-spacing-2, 8px)";
  vars["--ds-stats-header-glow-block-size"] = "var(--ds-spacing-10, 40px)";
  vars["--ds-stats-header-glow-strength"] = "6%";

  return vars;
}
