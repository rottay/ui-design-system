/**
 * @fileoverview The shortcuts-overlay family: the fixed top-anchored frame,
 * its scrim, the reference dialog, and the header / search / category / row /
 * footer rhythm inside it. Its ground rests on the card surface, its scrim on
 * the overlay roots and the sanctioned glass layer, its rhythm on the spacing
 * ramp, its hairlines on the border root and its entrance on the motion dial.
 *
 * @remarks
 * Each produced value is the single chained fallback its Modern skin reads it
 * with, so producing the name cannot move a pixel -- it changes WHO can reach
 * the value, not what it rests at.
 *
 * The keyframe NAME stays in the skin. A tenant may retime the entrance
 * (duration, easing) and may silence it through the reduced-motion arm, but it
 * does not get to choose which motion an overlay performs: that is the motion
 * vocabulary's decision, not a chrome channel.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/chrome/shortcuts-overlay
 * @category Compilers
 * @package @rottay/design-system
 */

import type { FamilyDeriver } from "../../../../foundation/contract";

/** The hairline the header, the search row and the footer share. */
const OVERLAY_RULE = "1px solid var(--ds-color-border)";

export const shortcutsOverlayChromeDeriver: FamilyDeriver = {
  family: "shortcuts-overlay",
  rank: "derived",
  consumes: ["surfaces.*", "palette.*", "shape.*", "density", "motion"],
  produces: [
    // The frame
    "--ds-shortcuts-overlay-z-index",
    "--ds-shortcuts-overlay-inset-block-start",
    "--ds-shortcuts-overlay-padding-inline",
    "--ds-shortcuts-overlay-narrow-inset-block-start",
    // The scrim
    "--ds-shortcuts-overlay-scrim",
    "--ds-shortcuts-overlay-scrim-tint",
    "--ds-shortcuts-overlay-scrim-filter",
    // The dialog
    "--ds-shortcuts-overlay-dialog-max-inline-size",
    "--ds-shortcuts-overlay-dialog-radius",
    "--ds-shortcuts-overlay-dialog-bg",
    "--ds-shortcuts-overlay-dialog-shadow",
    "--ds-shortcuts-overlay-dialog-color",
    "--ds-shortcuts-overlay-enter-duration",
    "--ds-shortcuts-overlay-enter-easing",
    // Header and search
    "--ds-shortcuts-overlay-rule",
    "--ds-shortcuts-overlay-header-gap",
    "--ds-shortcuts-overlay-header-padding-block",
    "--ds-shortcuts-overlay-header-padding-inline",
    "--ds-shortcuts-overlay-title-color",
    "--ds-shortcuts-overlay-title-font-size",
    "--ds-shortcuts-overlay-title-font-weight",
    "--ds-shortcuts-overlay-search-padding-block",
    "--ds-shortcuts-overlay-search-padding-inline",
    "--ds-shortcuts-overlay-close-touch-target",
    // The reference list
    "--ds-shortcuts-overlay-list-padding-block",
    "--ds-shortcuts-overlay-list-column-width",
    "--ds-shortcuts-overlay-list-column-gap",
    "--ds-shortcuts-overlay-group-padding-block",
    "--ds-shortcuts-overlay-category-padding-block",
    "--ds-shortcuts-overlay-category-padding-inline",
    "--ds-shortcuts-overlay-category-color",
    "--ds-shortcuts-overlay-category-font-size",
    "--ds-shortcuts-overlay-category-font-weight",
    "--ds-shortcuts-overlay-category-letter-spacing",
    "--ds-shortcuts-overlay-item-gap",
    "--ds-shortcuts-overlay-item-padding-block",
    "--ds-shortcuts-overlay-item-padding-inline",
    "--ds-shortcuts-overlay-description-color",
    "--ds-shortcuts-overlay-description-font-size",
    "--ds-shortcuts-overlay-chord-gap",
    "--ds-shortcuts-overlay-empty-padding-block",
    // Footer
    "--ds-shortcuts-overlay-footer-padding-block",
    "--ds-shortcuts-overlay-footer-padding-inline",
    "--ds-shortcuts-overlay-footer-color",
    "--ds-shortcuts-overlay-footer-font-size",
  ],
  derive: () => deriveShortcutsOverlayChannels(),
};

export function deriveShortcutsOverlayChannels(): Record<string, string> {
  const vars: Record<string, string> = {};

  // The frame stacks on the modal rung: a reference panel over a modal is
  // still an overlay, never a layer below one.
  vars["--ds-shortcuts-overlay-z-index"] = "var(--ds-z-modal, 1500)";
  vars["--ds-shortcuts-overlay-inset-block-start"] = "10vh";
  vars["--ds-shortcuts-overlay-padding-inline"] = "var(--ds-spacing-3, 12px)";
  vars["--ds-shortcuts-overlay-narrow-inset-block-start"] = "var(--ds-spacing-8, 32px)";

  // The scrim is the overlay root plus the sanctioned glass layer, which
  // collapses to a plain scrim when the effect dial is at 0.
  vars["--ds-shortcuts-overlay-scrim"] = "var(--ds-overlay-scrim, var(--ds-color-bg-overlay))";
  vars["--ds-shortcuts-overlay-scrim-tint"] = "var(--ds-glass-scrim-tint)";
  vars["--ds-shortcuts-overlay-scrim-filter"] = "var(--ds-glass-backdrop-filter)";

  // The dialog is a lifted card; the entrance rides the motion dial.
  vars["--ds-shortcuts-overlay-dialog-max-inline-size"] = "40rem";
  vars["--ds-shortcuts-overlay-dialog-radius"] = "var(--ds-radius-xl)";
  vars["--ds-shortcuts-overlay-dialog-bg"] = "var(--ds-surface-card)";
  vars["--ds-shortcuts-overlay-dialog-shadow"] = "var(--ds-elevation-3)";
  vars["--ds-shortcuts-overlay-dialog-color"] = "var(--ds-color-text-primary)";
  vars["--ds-shortcuts-overlay-enter-duration"] = "var(--ds-motion-reveal)";
  vars["--ds-shortcuts-overlay-enter-easing"] = "var(--ds-motion-ease-enter, ease-out)";

  // Header, search and the close control's physical floor.
  vars["--ds-shortcuts-overlay-rule"] = OVERLAY_RULE;
  vars["--ds-shortcuts-overlay-header-gap"] = "var(--ds-spacing-3, 12px)";
  vars["--ds-shortcuts-overlay-header-padding-block"] = "var(--ds-spacing-3, 12px)";
  vars["--ds-shortcuts-overlay-header-padding-inline"] = "var(--ds-spacing-5, 20px)";
  vars["--ds-shortcuts-overlay-title-color"] = "var(--ds-color-text-primary)";
  vars["--ds-shortcuts-overlay-title-font-size"] = "var(--ds-font-size-base, 16px)";
  vars["--ds-shortcuts-overlay-title-font-weight"] = "var(--ds-font-weight-semibold, 600)";
  vars["--ds-shortcuts-overlay-search-padding-block"] = "var(--ds-spacing-2, 8px)";
  vars["--ds-shortcuts-overlay-search-padding-inline"] = "var(--ds-spacing-5, 20px)";
  vars["--ds-shortcuts-overlay-close-touch-target"] = "var(--ds-touch-target-min, 44px)";

  // The reference list: intrinsic columns, a quiet category hierarchy and a
  // row that reads as description-then-chord.
  vars["--ds-shortcuts-overlay-list-padding-block"] = "var(--ds-spacing-2, 8px)";
  vars["--ds-shortcuts-overlay-list-column-width"] = "16rem";
  vars["--ds-shortcuts-overlay-list-column-gap"] = "var(--ds-spacing-4, 16px)";
  vars["--ds-shortcuts-overlay-group-padding-block"] = "var(--ds-spacing-1, 4px)";
  vars["--ds-shortcuts-overlay-category-padding-block"] = "var(--ds-spacing-1, 4px)";
  vars["--ds-shortcuts-overlay-category-padding-inline"] = "var(--ds-spacing-5, 20px)";
  vars["--ds-shortcuts-overlay-category-color"] = "var(--ds-color-text-secondary)";
  vars["--ds-shortcuts-overlay-category-font-size"] = "var(--ds-font-size-xs, 12px)";
  vars["--ds-shortcuts-overlay-category-font-weight"] = "var(--ds-font-weight-semibold, 600)";
  vars["--ds-shortcuts-overlay-category-letter-spacing"] =
    "var(--ds-letter-spacing-wide, 0.025em)";
  vars["--ds-shortcuts-overlay-item-gap"] = "var(--ds-spacing-3, 12px)";
  vars["--ds-shortcuts-overlay-item-padding-block"] = "6px";
  vars["--ds-shortcuts-overlay-item-padding-inline"] = "var(--ds-spacing-5, 20px)";
  vars["--ds-shortcuts-overlay-description-color"] = "var(--ds-color-text-primary)";
  vars["--ds-shortcuts-overlay-description-font-size"] = "var(--ds-font-size-sm, 14px)";
  vars["--ds-shortcuts-overlay-chord-gap"] = "var(--ds-spacing-1, 4px)";
  vars["--ds-shortcuts-overlay-empty-padding-block"] = "var(--ds-spacing-8, 32px)";

  // The footer slot: supporting ink over the shared hairline.
  vars["--ds-shortcuts-overlay-footer-padding-block"] = "var(--ds-spacing-2, 8px)";
  vars["--ds-shortcuts-overlay-footer-padding-inline"] = "var(--ds-spacing-5, 20px)";
  vars["--ds-shortcuts-overlay-footer-color"] = "var(--ds-color-text-secondary)";
  vars["--ds-shortcuts-overlay-footer-font-size"] = "var(--ds-font-size-xs, 12px)";

  return vars;
}
