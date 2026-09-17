/**
 * @fileoverview The calendar-view family: every channel its Modern skin reads, at the
 * resting value the skin itself stated, so a decision now has somewhere to move it.
 * Its namespace is `--ds-calendar-view-`, derived from the folder name; the event
 * accent used to be read and stamped as `--ds-calendar-event-accent`, a name inside
 * the `calendar` PRIMITIVE's prefix that no deriver and no declaration ever wrote.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/chrome/calendar-view
 * @category Compilers
 * @package @rottay/design-system
 */

import type { FamilyDeriver } from "../../../../foundation/contract";

/**
 * A vertical's own calendar-view chrome outranks every relation stated here.
 *
 * `palette.*`, `typography.roles`, `surfaces.radiusScale`, `states.focus` and
 * `density` are read by the family's SKIN rather than by these four channels:
 * the seeded ink paints the day grounds, the today marker and the event chip,
 * the role ramp sets the month title and the weekday row, the radius rungs
 * close the grid frame and the date label, the focus signature rings the
 * roving gridcell, and the density-scaled spacing ramp sets the cell and
 * toolbar rhythm. Each is measured in
 * `PatternCalendarView.causality.integration.test.tsx`.
 *
 * `--ds-calendar-view-event-accent` can also be STAMPED per chip, but only
 * when the consumer's event states a colour: a chip that states none leaves
 * the channel to the value here, so it is the tenant's, and a per-event stamp
 * outranks it exactly as an inline declaration outranks the theme root.
 *
 * The family's private narrow-collapse dot diameter
 * (`--_ds-calendar-view-dot-size`) is deliberately NOT produced: it is not a
 * cross-family tenant axis, which is why it is spelled private.
 */
export const calendarViewChromeDeriver: FamilyDeriver = {
  family: "calendar-view",
  rank: "derived",
  consumes: [
    "palette.*",
    "typography.roles",
    "surfaces.radiusScale",
    "states.focus",
    "density",
  ],
  produces: [
    "--ds-calendar-view-cell-min-height",
    "--ds-calendar-view-cell-min-height-compact",
    "--ds-calendar-view-event-accent",
    "--ds-calendar-view-touch-target",
  ],
  derive: () => deriveCalendarViewChannels(),
};

export function deriveCalendarViewChannels(): Record<string, string> {
  const vars: Record<string, string> = {};
  // A month cell holds a date label plus up to three chips: the floor is the
  // height at which that stack still reads, and the narrow container cut
  // relaxes it to the agenda density the skin collapses to.
  vars["--ds-calendar-view-cell-min-height"] = "5rem";
  vars["--ds-calendar-view-cell-min-height-compact"] = "3.5rem";
  // An event that states no colour reads as the family's own accent, which is
  // the seeded primary -- never a neutral chip nobody can tell from the cell.
  vars["--ds-calendar-view-event-accent"] = "var(--ds-color-primary)";
  vars["--ds-calendar-view-touch-target"] = "2.75rem";
  return vars;
}
