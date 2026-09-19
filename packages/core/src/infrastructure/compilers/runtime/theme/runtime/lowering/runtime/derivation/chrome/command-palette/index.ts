/**
 * @fileoverview The command-palette family: the search row, the result
 * listbox, the option rows and their keyboard cursor, the section headings,
 * the argument panel and the footer hairline. Its rhythm rests on the spacing
 * ramp, its ink on the text roles, its rules on the border root, its active
 * row on the inset surface and its row transition on the motion dial.
 *
 * @remarks
 * Each produced value is the single chained fallback its Modern skin reads it
 * with, so producing the name cannot move a pixel -- it changes WHO can reach
 * the value, not what it rests at.
 *
 * Three names a tenant could already author through
 * `chrome.search.commandPalette` reach the Modern skin for the first time:
 * `--ds-command-palette-border` (the search and footer hairlines),
 * `--ds-command-palette-group-color` (the section headings, behind the
 * narrower `--ds-search-category-color` a tenant may also author) and
 * `--ds-command-palette-shortcut-border` (the composed Kbd's own frame
 * channel). All three already rest on `--ds-color-border` /
 * `--ds-color-text-muted`, which is exactly where the Modern paint rested, so
 * wiring them changes reach and not appearance.
 *
 * Five are deliberately NOT produced and NOT read, because the pattern gave
 * that paint away when it adopted certified primitives and the rests disagree:
 * `-bg`, `-shadow` and `-backdrop` are the chamber, which is Modal's
 * (`--ds-modal-bg` rests on `--ds-material-overlay-background`, the palette
 * root on `--ds-color-bg-elevated`); `-empty-color` is the composed Empty's
 * description ink (`--ds-color-text-secondary` against the root's
 * `--ds-color-text-muted`); and `-item-hover-bg` rests on
 * `--ds-material-card-background-hover` where the row rests on
 * `--ds-surface-inset`. Reading any of them would repaint every tenant that
 * never authored the field, so they are routed rather than taken here.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/chrome/command-palette
 * @category Compilers
 * @package @rottay/design-system
 */

import type { FamilyDeriver } from "../../../../foundation/contract";

/** The hairline the search row and the footer share. */
const PALETTE_RULE = "1px solid var(--ds-command-palette-border, var(--ds-color-border))";

export const commandPaletteChromeDeriver: FamilyDeriver = {
  family: "command-palette",
  rank: "derived",
  consumes: ["surfaces.*", "palette.*", "shape.*", "density", "motion"],
  produces: [
    // Measure
    "--ds-command-palette-max-inline-size",
    "--ds-command-palette-list-max-block-size",
    // Search row
    "--ds-command-palette-search-gap",
    "--ds-command-palette-search-padding",
    "--ds-command-palette-search-rule",
    // Listbox
    "--ds-command-palette-list-padding-block",
    "--ds-command-palette-scrollbar-thumb",
    // Sections
    "--ds-command-palette-recent-padding-inline",
    "--ds-command-palette-recent-padding-block-end",
    "--ds-command-palette-section-label-padding-block",
    "--ds-command-palette-section-label-padding-inline",
    "--ds-command-palette-section-label-margin-block-end",
    "--ds-command-palette-section-label-color",
    "--ds-command-palette-section-label-font-size",
    "--ds-command-palette-section-label-font-weight",
    "--ds-command-palette-section-label-letter-spacing",
    "--ds-command-palette-group-label-padding-block",
    "--ds-command-palette-group-label-padding-inline",
    "--ds-command-palette-group-color",
    // Option rows
    "--ds-command-palette-item-gap",
    "--ds-command-palette-item-margin-inline",
    "--ds-command-palette-item-padding-block",
    "--ds-command-palette-item-padding-inline",
    "--ds-command-palette-item-radius",
    "--ds-command-palette-item-transition",
    "--ds-command-palette-item-disabled-opacity",
    "--ds-command-palette-item-active-bg",
    "--ds-command-palette-item-active-ring",
    "--ds-command-palette-item-hover-surface",
    "--ds-command-palette-item-touch-target",
    "--ds-command-palette-item-main-gap",
    "--ds-command-palette-label-color",
    "--ds-command-palette-label-font-size",
    "--ds-command-palette-label-font-weight",
    "--ds-command-palette-description-color",
    "--ds-command-palette-description-font-size",
    "--ds-command-palette-shortcut-margin-inline-start",
    "--ds-command-palette-shortcut-border",
    // Empty and provider-error rows
    "--ds-command-palette-empty-padding-block",
    "--ds-command-palette-error-padding-block",
    "--ds-command-palette-error-padding-inline",
    "--ds-command-palette-error-color",
    // Argument mode
    "--ds-command-palette-argument-panel-padding-block",
    "--ds-command-palette-argument-panel-padding-inline",
    "--ds-command-palette-argument-prompt-color",
    "--ds-command-palette-argument-prompt-font-size",
    "--ds-command-palette-argument-error-margin-block-start",
    "--ds-command-palette-argument-error-color",
    "--ds-command-palette-argument-error-font-size",
    // Footer
    "--ds-command-palette-footer-padding-block",
    "--ds-command-palette-footer-padding-inline",
    "--ds-command-palette-footer-color",
    "--ds-command-palette-footer-font-size",
    "--ds-command-palette-footer-rule",
  ],
  derive: () => deriveCommandPaletteChannels(),
};

export function deriveCommandPaletteChannels(): Record<string, string> {
  const vars: Record<string, string> = {};

  // The chamber measure the palette hands to the composed Modal, and the
  // listbox measure the caller may restate per instance.
  vars["--ds-command-palette-max-inline-size"] = "32rem";
  vars["--ds-command-palette-list-max-block-size"] = "25rem";

  // The search row: spacing ramp plus the family hairline.
  vars["--ds-command-palette-search-gap"] = "var(--ds-spacing-2, 8px)";
  vars["--ds-command-palette-search-padding"] = "var(--ds-spacing-3, 12px)";
  vars["--ds-command-palette-search-rule"] = PALETTE_RULE;

  // The listbox: its own rhythm and an ink-derived scrollbar thumb.
  vars["--ds-command-palette-list-padding-block"] = "var(--ds-spacing-2, 8px)";
  vars["--ds-command-palette-scrollbar-thumb"] =
    "color-mix(in srgb, var(--ds-color-primary) 24%, var(--ds-color-border))";

  // Sections: the recent block and the two heading kinds.
  vars["--ds-command-palette-recent-padding-inline"] = "var(--ds-spacing-3, 12px)";
  vars["--ds-command-palette-recent-padding-block-end"] = "var(--ds-spacing-2, 8px)";
  vars["--ds-command-palette-section-label-padding-block"] = "6px 4px";
  vars["--ds-command-palette-section-label-padding-inline"] = "var(--ds-spacing-3, 12px)";
  vars["--ds-command-palette-section-label-margin-block-end"] = "var(--ds-spacing-1, 4px)";
  vars["--ds-command-palette-section-label-color"] = "var(--ds-color-text-muted)";
  vars["--ds-command-palette-section-label-font-size"] = "var(--ds-font-size-xs, 12px)";
  vars["--ds-command-palette-section-label-font-weight"] = "500";
  vars["--ds-command-palette-section-label-letter-spacing"] = "0.05em";
  vars["--ds-command-palette-group-label-padding-block"] =
    "var(--ds-spacing-3, 12px) var(--ds-spacing-1, 4px)";
  vars["--ds-command-palette-group-label-padding-inline"] = "var(--ds-spacing-5, 20px)";
  vars["--ds-command-palette-group-color"] = "var(--ds-color-text-muted)";

  // The option row: geometry on the spacing ramp, the keyboard cursor on the
  // inset surface with the focus ring's own ink, the pointer arm on the same
  // surface, and the transition on the feedback cadence.
  vars["--ds-command-palette-item-gap"] = "var(--ds-spacing-2, 8px)";
  vars["--ds-command-palette-item-margin-inline"] = "var(--ds-spacing-1, 4px)";
  vars["--ds-command-palette-item-padding-block"] = "var(--ds-spacing-2, 8px)";
  vars["--ds-command-palette-item-padding-inline"] = "var(--ds-spacing-3, 12px)";
  vars["--ds-command-palette-item-radius"] = "var(--ds-radius-lg)";
  vars["--ds-command-palette-item-transition"] =
    "var(--ds-motion-fast) var(--ds-motion-ease-out, ease-out)";
  vars["--ds-command-palette-item-disabled-opacity"] = "0.5";
  vars["--ds-command-palette-item-active-bg"] = "var(--ds-surface-inset)";
  vars["--ds-command-palette-item-active-ring"] =
    "inset 0 0 0 1px var(--ds-color-border-focus, var(--ds-color-primary))";
  vars["--ds-command-palette-item-hover-surface"] = "var(--ds-surface-inset)";
  vars["--ds-command-palette-item-touch-target"] = "var(--ds-touch-target-min, 44px)";
  vars["--ds-command-palette-item-main-gap"] = "var(--ds-spacing-2, 8px)";
  vars["--ds-command-palette-label-color"] = "var(--ds-color-text-primary)";
  vars["--ds-command-palette-label-font-size"] = "var(--ds-font-size-sm, 14px)";
  vars["--ds-command-palette-label-font-weight"] = "500";
  vars["--ds-command-palette-description-color"] = "var(--ds-color-text-secondary)";
  vars["--ds-command-palette-description-font-size"] = "var(--ds-font-size-xs, 12px)";
  vars["--ds-command-palette-shortcut-margin-inline-start"] = "var(--ds-spacing-2, 8px)";
  vars["--ds-command-palette-shortcut-border"] = "var(--ds-color-border)";

  // The empty state keeps rhythm only; the provider-error row is the one place
  // the palette speaks in the error tone.
  vars["--ds-command-palette-empty-padding-block"] = "var(--ds-spacing-8, 32px)";
  vars["--ds-command-palette-error-padding-block"] = "var(--ds-spacing-2, 8px)";
  vars["--ds-command-palette-error-padding-inline"] = "var(--ds-spacing-4, 16px)";
  vars["--ds-command-palette-error-color"] =
    "var(--ds-color-error, var(--ds-color-text-secondary))";

  // Argument mode: the prompt is supporting ink, the validation line is error ink.
  vars["--ds-command-palette-argument-panel-padding-block"] = "var(--ds-spacing-3, 12px)";
  vars["--ds-command-palette-argument-panel-padding-inline"] = "var(--ds-spacing-4, 16px)";
  vars["--ds-command-palette-argument-prompt-color"] = "var(--ds-color-text-secondary)";
  vars["--ds-command-palette-argument-prompt-font-size"] = "var(--ds-font-size-sm, 14px)";
  vars["--ds-command-palette-argument-error-margin-block-start"] = "var(--ds-spacing-1, 4px)";
  vars["--ds-command-palette-argument-error-color"] =
    "var(--ds-color-error, var(--ds-color-text-primary))";
  vars["--ds-command-palette-argument-error-font-size"] = "var(--ds-font-size-xs, 12px)";

  // The footer slot: supporting ink over the family hairline.
  vars["--ds-command-palette-footer-padding-block"] = "var(--ds-spacing-2, 8px)";
  vars["--ds-command-palette-footer-padding-inline"] = "var(--ds-spacing-4, 16px)";
  vars["--ds-command-palette-footer-color"] = "var(--ds-color-text-secondary)";
  vars["--ds-command-palette-footer-font-size"] = "var(--ds-font-size-xs, 12px)";
  vars["--ds-command-palette-footer-rule"] = PALETTE_RULE;

  return vars;
}
