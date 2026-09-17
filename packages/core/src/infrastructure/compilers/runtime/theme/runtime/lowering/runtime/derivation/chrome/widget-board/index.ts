/**
 * @fileoverview The widget-board family: the channels its Modern skin reads and
 * nobody wrote, at the resting value the skin itself stated, so a decision now
 * has somewhere to move them. Its namespace is `--ds-widget-board-`, derived
 * from the folder name.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/chrome/widget-board
 * @category Compilers
 * @package @rottay/design-system
 */

import type { FamilyDeriver } from "../../../../foundation/contract";

/**
 * Scope, stated rather than implied. The family reads eight names with no
 * producer and only these three are its own to emit.
 *
 * `--ds-widget-board-layout-x` / `-layout-y` are the spatial-continuity kernel's
 * geometry, written by the runtime on the cell it is moving and registered with
 * an `@property` initial value; a theme has no opinion about a FLIP delta, so
 * they stay pinned by category rather than derived. `--ds-workspace-card-icon-bg`
 * / `-border` / `-color` belong to the `--ds-workspace-card-` vocabulary, which
 * four other skins read; owning it here would make one family the producer of a
 * namespace it does not own.
 *
 * The three below are the family's own catalog geometry. `density` is the one
 * decision they depend on: the search row's margin rides `--ds-spacing-3`, which
 * is `calc(0.75rem * density)`, so a tenant's density moves it. It is measured in
 * `PatternWidgetBoard.causality.integration.test.tsx`.
 */
export const widgetBoardChromeDeriver: FamilyDeriver = {
  family: "widget-board",
  rank: "derived",
  consumes: ["density"],
  produces: [
    "--ds-widget-board-catalog-no-results-min-height",
    "--ds-widget-board-catalog-search-margin-block-end",
    "--ds-widget-board-catalog-search-max-width",
  ],
  derive: () => deriveWidgetBoardChannels(),
};

export function deriveWidgetBoardChannels(): Record<string, string> {
  const vars: Record<string, string> = {};
  // The quiet framed "nothing matches" region keeps a floor so the catalog does
  // not collapse to a line of text while the search is being typed.
  vars["--ds-widget-board-catalog-no-results-min-height"] = "96px";
  // The room under the search row is rhythm, so it rides the density-scaled
  // spacing ramp: `--ds-spacing-3` is the 12px the skin stated at rest.
  vars["--ds-widget-board-catalog-search-margin-block-end"] = "var(--ds-spacing-3)";
  // A measure cap, not a width: the field still fills a narrower catalog.
  vars["--ds-widget-board-catalog-search-max-width"] = "680px";
  return vars;
}
