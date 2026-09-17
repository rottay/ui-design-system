/**
 * @fileoverview The column-menu family: every channel its Modern-scope skin
 * reads under the family's own namespace, at the resting value the skin itself
 * stated, so a decision now has somewhere to move it.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/chrome/column-menu
 * @category Compilers
 * @package @rottay/design-system
 */

import type { FamilyDeriver } from "../../../../foundation/contract";

/**
 * A vertical's own column-menu chrome outranks every relation stated here.
 *
 * WHAT THIS FILE IS: the forty `--ds-column-menu-*` names the panel's skin
 * reads were written as `var(NAME, RESTING)` and nobody wrote NAME, so every
 * one of them resolved to its literal fallback -- customizable in appearance,
 * unreachable in fact. Each value below is the skin's OWN resting value,
 * transcribed, so the rendered default is byte-identical and the channel is now
 * a place a decision can land.
 *
 * WHAT IS DELIBERATELY NOT HERE: `--ds-material-overlay-border`,
 * `--ds-material-overlay-shadow` and `--ds-material-raised-shadow-selected`,
 * which three of the values below chain THROUGH. They are the materials
 * vocabulary, owned by `derivation/materials`, and a column-menu deriver that
 * produced them would be a second owner of another family's channels. They stay
 * the cut's named residue, pinned by category in the roster.
 *
 * CONSUMES, and each one is discharged by a probe in
 * `ColumnMenu.causality.integration.test.tsx`: `palette.*` paints the panel
 * ground, the header wash, the row states and the title/description ink;
 * `surfaces.radiusScale` closes the panel, the rows and the count pill on three
 * rungs of one ramp; `typography.roles` sets the header and caption steps;
 * `motion.*` times the row transition. No `density` is declared, because the
 * family's rhythm is stated in px by the values below and no density channel is
 * read anywhere in its skin -- declaring it would be an inert consumes.
 */
export const columnMenuChromeDeriver: FamilyDeriver = {
  family: "column-menu",
  rank: "derived",
  consumes: ["palette.*", "surfaces.radiusScale", "typography.roles", "motion.*"],
  produces: [
    "--ds-column-menu-body-background",
    "--ds-column-menu-body-max-block-size",
    "--ds-column-menu-body-padding",
    "--ds-column-menu-count-background",
    "--ds-column-menu-count-block-size",
    "--ds-column-menu-count-border",
    "--ds-column-menu-count-color",
    "--ds-column-menu-count-min-inline-size",
    "--ds-column-menu-count-padding-inline",
    "--ds-column-menu-count-radius",
    "--ds-column-menu-description-color",
    "--ds-column-menu-footer-background",
    "--ds-column-menu-footer-padding",
    "--ds-column-menu-header-background",
    "--ds-column-menu-header-padding",
    "--ds-column-menu-panel-backdrop",
    "--ds-column-menu-panel-background",
    "--ds-column-menu-panel-border",
    "--ds-column-menu-panel-focus-outline",
    "--ds-column-menu-panel-focus-outline-offset",
    "--ds-column-menu-panel-inline-size",
    "--ds-column-menu-panel-radius",
    "--ds-column-menu-panel-shadow",
    "--ds-column-menu-row-active-background",
    "--ds-column-menu-row-active-shadow",
    "--ds-column-menu-row-background",
    "--ds-column-menu-row-border",
    "--ds-column-menu-row-drag-background",
    "--ds-column-menu-row-motion-duration",
    "--ds-column-menu-row-padding",
    "--ds-column-menu-row-radius",
    "--ds-column-menu-row-shadow",
    "--ds-column-menu-row-title-color",
    "--ds-column-menu-section-border",
    "--ds-column-menu-section-gap",
    "--ds-column-menu-section-padding-block-start",
    "--ds-column-menu-title-color",
    "--ds-column-menu-trigger-open-z",
    "--ds-column-menu-trigger-z",
    "--ds-column-menu-viewport-gutter",
    "--ds-column-menu-viewport-reservation",
  ],
  derive: () => deriveColumnMenuChannels(),
};

export function deriveColumnMenuChannels(): Record<string, string> {
  const vars: Record<string, string> = {};

  // Stacking: the trigger sits one step above its row, and one step above the
  // whole workspace while its panel is open.
  vars["--ds-column-menu-trigger-z"] = "var(--ds-z-index-relative-above, 1)";
  vars["--ds-column-menu-trigger-open-z"] = "var(--ds-z-index-popover)";

  // The floating panel: its measure, its viewport allowance, and the overlay
  // material role its keyline and depth chain through.
  vars["--ds-column-menu-panel-inline-size"] = "432px";
  vars["--ds-column-menu-viewport-gutter"] = "24px";
  vars["--ds-column-menu-panel-radius"] = "var(--ds-radius-xl, 20px)";
  vars["--ds-column-menu-panel-border"] =
    "1px solid var(--ds-material-overlay-border, color-mix(in srgb, var(--ds-color-border-secondary) 72%, transparent))";
  vars["--ds-column-menu-panel-background"] =
    "var(--ds-gradient-surface, linear-gradient(180deg, color-mix(in srgb, var(--ds-surface-card) 96%, var(--ds-color-bg-elevated) 4%), color-mix(in srgb, var(--ds-surface-card) 90%, var(--ds-color-bg-primary) 10%)))";
  vars["--ds-column-menu-panel-shadow"] =
    "var(--ds-material-overlay-shadow, var(--ds-elevation-4, 0 24px 64px color-mix(in srgb, var(--ds-color-text-primary) 14%, transparent)))";
  vars["--ds-column-menu-panel-backdrop"] = "none";
  // The panel is programmatically focused on open, so it owns a ring of its own.
  vars["--ds-column-menu-panel-focus-outline"] = "2px solid var(--ds-color-border-focus)";
  vars["--ds-column-menu-panel-focus-outline-offset"] = "-2px";

  // Header band, and the seam every section of the panel is cut with.
  vars["--ds-column-menu-header-padding"] = "18px 20px 16px";
  vars["--ds-column-menu-section-border"] =
    "1px solid color-mix(in srgb, var(--ds-color-border-subtle) 82%, transparent)";
  vars["--ds-column-menu-header-background"] =
    "color-mix(in srgb, var(--ds-color-primary) 6%, transparent)";
  vars["--ds-column-menu-title-color"] = "var(--ds-color-text-primary)";
  vars["--ds-column-menu-description-color"] = "var(--ds-color-text-muted)";

  // The scroll region: how tall it may grow, what it reserves for the chrome
  // above and below it, and its recessed ground.
  vars["--ds-column-menu-body-max-block-size"] = "430px";
  vars["--ds-column-menu-viewport-reservation"] = "152px";
  vars["--ds-column-menu-body-padding"] = "14px";
  vars["--ds-column-menu-body-background"] =
    "color-mix(in srgb, var(--ds-color-bg-primary) 5%, transparent)";

  // The visible/total count pill.
  vars["--ds-column-menu-count-min-inline-size"] = "26px";
  vars["--ds-column-menu-count-block-size"] = "22px";
  vars["--ds-column-menu-count-padding-inline"] = "8px";
  vars["--ds-column-menu-count-border"] =
    "1px solid color-mix(in srgb, var(--ds-color-border-subtle) 76%, transparent)";
  vars["--ds-column-menu-count-radius"] = "var(--ds-radius-full, 9999px)";
  vars["--ds-column-menu-count-background"] =
    "color-mix(in srgb, var(--ds-color-bg-primary) 72%, transparent)";
  vars["--ds-column-menu-count-color"] = "var(--ds-color-text-secondary)";

  // One column row at rest, and the two states it can be stamped into. The
  // resting row paints an INSET keyline; the visible/draft row lifts through
  // the raised role's selected facet, so the state channel cannot collapse
  // onto rest.
  vars["--ds-column-menu-row-border"] =
    "1px solid color-mix(in srgb, var(--ds-color-border-subtle) 82%, transparent)";
  vars["--ds-column-menu-row-radius"] = "var(--ds-radius-lg, 14px)";
  vars["--ds-column-menu-row-background"] =
    "color-mix(in srgb, var(--ds-surface-card) 94%, var(--ds-color-bg-primary) 6%)";
  vars["--ds-column-menu-row-shadow"] =
    "inset 0 1px 0 color-mix(in srgb, var(--ds-color-bg-elevated) 52%, transparent)";
  vars["--ds-column-menu-row-padding"] = "13px 15px";
  vars["--ds-column-menu-row-active-background"] =
    "color-mix(in srgb, var(--ds-color-primary) 7%, var(--ds-surface-card))";
  vars["--ds-column-menu-row-active-shadow"] =
    "var(--ds-material-raised-shadow-selected, 0 8px 20px color-mix(in srgb, var(--ds-color-primary) 8%, transparent))";
  vars["--ds-column-menu-row-drag-background"] =
    "color-mix(in srgb, var(--ds-color-primary) 13%, var(--ds-surface-card))";
  vars["--ds-column-menu-row-title-color"] = "var(--ds-color-text-primary)";
  // The row's state changes are FEEDBACK, so they read the role the motion dial
  // bends. `--ds-motion-feedback` is `calc(instant * duration-scale)`, and at
  // scale 1 that is exactly the `--ds-motion-fast` the skin used to read, so an
  // unbranded tenant renders the same 120ms; a tenant that states a motion dial
  // now reaches this family instead of being told it is inert.
  vars["--ds-column-menu-row-motion-duration"] =
    "var(--ds-motion-feedback, var(--ds-motion-fast, 120ms))";

  // The trailing action section and the footer rail.
  vars["--ds-column-menu-section-gap"] = "8px";
  vars["--ds-column-menu-section-padding-block-start"] = "14px";
  vars["--ds-column-menu-footer-padding"] = "12px";
  vars["--ds-column-menu-footer-background"] =
    "color-mix(in srgb, var(--ds-color-bg-primary) 24%, transparent)";

  return vars;
}
