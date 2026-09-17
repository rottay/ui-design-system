/**
 * @fileoverview The kanban-board family: every channel its Modern skin reads, at the
 * resting value the skin itself stated, so a decision now has somewhere to move it.
 * Its namespace is `--ds-kanban-board-`, derived from the folder name; the skin used
 * to read the shorter `--ds-kanban-` spelling, which no deriver and no declaration
 * ever wrote.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/chrome/kanban-board
 * @category Compilers
 * @package @rottay/design-system
 */

import type { FamilyDeriver } from "../../../../foundation/contract";

/**
 * A vertical's own kanban-board chrome outranks every relation stated here.
 *
 * `palette.*`, `typography.roles`, `surfaces.radiusScale`, `surfaces.elevation`,
 * `states.focus` and `density` are read by the family's SKIN rather than by these
 * five channels: the seeded ink paints the drop ring and the insertion bars, the
 * role ramp sets the column title, the radius rungs close the column header, body
 * and card, the elevation ramp lifts the card under the pointer, the focus
 * signature rings the card tab stop and the density-scaled spacing ramp sets the
 * column and card rhythm. Each is measured in
 * `PatternKanbanBoard.causality.integration.test.tsx`.
 *
 * Three of the five channels below can also be STAMPED at runtime, but only when
 * the consumer states the value: `column-gap` and `column-min-width` on the board
 * root when `columnGap` / `columnMinWidth` are passed, `column-accent` on a column
 * that configures a colour. A board that states none of them leaves all three to
 * the values here, so they are the tenant's to move; a per-instance stamp outranks
 * them, exactly as an inline declaration outranks the theme root.
 */
export const kanbanBoardChromeDeriver: FamilyDeriver = {
  family: "kanban-board",
  rank: "derived",
  consumes: [
    "palette.*",
    "typography.roles",
    "surfaces.radiusScale",
    "surfaces.elevation",
    "states.focus",
    "density",
  ],
  produces: [
    "--ds-kanban-board-column-accent",
    "--ds-kanban-board-column-gap",
    "--ds-kanban-board-column-max-height",
    "--ds-kanban-board-column-min-width",
    "--ds-kanban-board-touch-target",
  ],
  derive: () => deriveKanbanBoardChannels(),
};

export function deriveKanbanBoardChannels(): Record<string, string> {
  const vars: Record<string, string> = {};
  // A column with no configured colour states no accent; the header strip is
  // the absence of a strip, not a neutral hairline.
  vars["--ds-kanban-board-column-accent"] = "transparent";
  // The board rhythm rides the density-scaled spacing ramp: `--ds-spacing-4` is
  // `calc(1rem * density)`, which is the 16px the skin stated at rest.
  vars["--ds-kanban-board-column-gap"] = "var(--ds-spacing-4)";
  // A column scrolls only when the consumer caps it; uncapped it grows.
  vars["--ds-kanban-board-column-max-height"] = "none";
  vars["--ds-kanban-board-column-min-width"] = "280px";
  vars["--ds-kanban-board-touch-target"] = "2.75rem";
  return vars;
}
