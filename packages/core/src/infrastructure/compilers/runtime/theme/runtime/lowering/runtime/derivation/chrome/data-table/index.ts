/**
 * @fileoverview The data-table family: every channel its Modern skins read, at the
 * resting value the skins themselves stated, so a decision now has somewhere to
 * move it. Its namespace is `--ds-data-table-`, derived from the folder name;
 * `--ds-table-` belongs to the Table primitive's own deriver.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/chrome/data-table
 * @category Compilers
 * @package @rottay/design-system
 */

import type { FamilyDeriver } from "../../../../foundation/contract";

/** A vertical's own data-table chrome outranks every relation stated here. */
export const dataTableChromeDeriver: FamilyDeriver = {
  family: "data-table",
  rank: "derived",
  consumes: [
    "palette.*",
    "typography.roles",
    "spacing.rhythm",
    "surfaces.radiusScale",
    "surfaces.controlHeight",
    "surfaces.elevation",
    "states.focus",
    "density",
  ],
  produces: [
    "--ds-data-table-action-cell-padding-comfortable",
    "--ds-data-table-action-cell-padding-compact",
    "--ds-data-table-action-cell-padding-spacious",
    "--ds-data-table-action-shadow",
    "--ds-data-table-bulk-bar-padding",
    "--ds-data-table-caption-font-size",
    "--ds-data-table-collapsed-min-inline-size",
    "--ds-data-table-control-font-size",
    "--ds-data-table-control-size",
    "--ds-data-table-control-size-compact",
    "--ds-data-table-control-size-spacious",
    "--ds-data-table-drag-grip-bg",
    "--ds-data-table-drag-grip-border",
    "--ds-data-table-drag-grip-opacity",
    "--ds-data-table-drag-handle-font-size",
    "--ds-data-table-drop-indicator-bg",
    "--ds-data-table-drop-indicator-border",
    "--ds-data-table-drop-indicator-inset",
    "--ds-data-table-drop-indicator-shadow",
    "--ds-data-table-editor-checkbox-size",
    "--ds-data-table-editor-error-font-size",
    "--ds-data-table-editor-input-font-size",
    "--ds-data-table-editor-input-line-height",
    "--ds-data-table-editor-input-padding",
    "--ds-data-table-editorial-cell-padding-block",
    "--ds-data-table-editorial-header-bg",
    "--ds-data-table-editorial-header-padding-block",
    "--ds-data-table-editorial-header-transform",
    "--ds-data-table-editorial-row-shadow",
    "--ds-data-table-empty-description-font-size",
    "--ds-data-table-empty-title-font-size",
    "--ds-data-table-expanded-padding",
    "--ds-data-table-group-count-font-size",
    "--ds-data-table-group-disclosure-font-size",
    "--ds-data-table-group-header-font-size",
    "--ds-data-table-header-content-gap",
    "--ds-data-table-header-focus-shadow",
    "--ds-data-table-header-font-family",
    "--ds-data-table-header-pinned-bg",
    "--ds-data-table-leading-cell-padding-comfortable",
    "--ds-data-table-leading-cell-padding-compact",
    "--ds-data-table-leading-cell-padding-spacious",
    "--ds-data-table-min-inline-size",
    "--ds-data-table-minimal-shadow",
    "--ds-data-table-open-cell-padding-block",
    "--ds-data-table-pagination-padding",
    "--ds-data-table-pinned-cell-bg",
    "--ds-data-table-pinned-cell-bg-focus",
    "--ds-data-table-pinned-cell-bg-hover",
    "--ds-data-table-pinned-cell-bg-selected",
    "--ds-data-table-pinned-cell-bg-striped",
    "--ds-data-table-resize-bar-height",
    "--ds-data-table-resize-bar-width",
    "--ds-data-table-resize-hit-size",
    "--ds-data-table-row-selected-shadow",
    "--ds-data-table-rule-strong",
    "--ds-data-table-selection-cell-padding-comfortable",
    "--ds-data-table-selection-cell-padding-compact",
    "--ds-data-table-selection-cell-padding-spacious",
    "--ds-data-table-sort-bg",
    "--ds-data-table-sort-bg-active",
    "--ds-data-table-sort-bg-hover",
    "--ds-data-table-sort-border",
    "--ds-data-table-sort-border-active",
    "--ds-data-table-sort-border-hover",
    "--ds-data-table-sort-color",
    "--ds-data-table-sort-color-active",
    "--ds-data-table-sort-color-hover",
    "--ds-data-table-sort-control-offset",
    "--ds-data-table-sort-control-radius",
    "--ds-data-table-sort-control-size",
    "--ds-data-table-sort-opacity",
    "--ds-data-table-state-copy-max-inline-size",
    "--ds-data-table-toolbar-gap",
    "--ds-data-table-touch-hit-expansion",
    "--ds-data-table-touch-target",
  ],
  derive: () => deriveDataTableChannels(),
};

export function deriveDataTableChannels(): Record<string, string> {
  const vars: Record<string, string> = {};
  vars["--ds-data-table-action-cell-padding-comfortable"] = "0 0.625rem";
  vars["--ds-data-table-action-cell-padding-compact"] = "0 0.5rem";
  vars["--ds-data-table-action-cell-padding-spacious"] = "0 0.75rem";
  vars["--ds-data-table-action-shadow"] = "none";
  vars["--ds-data-table-bulk-bar-padding"] = "0.625rem 1rem";
  vars["--ds-data-table-caption-font-size"] = "var(--ds-font-size-xs)";
  vars["--ds-data-table-collapsed-min-inline-size"] = "34rem";
  vars["--ds-data-table-control-font-size"] = "var(--ds-button-sm-font-size, var(--ds-font-size-sm))";
  vars["--ds-data-table-control-size"] = "2rem";
  vars["--ds-data-table-control-size-compact"] = "1.75rem";
  vars["--ds-data-table-control-size-spacious"] = "2.25rem";
  vars["--ds-data-table-drag-grip-bg"] = "color-mix(in srgb, var(--ds-color-bg-primary) 34%, transparent)";
  vars["--ds-data-table-drag-grip-border"] = "color-mix(in srgb, var(--ds-color-border-secondary) 76%, transparent)";
  vars["--ds-data-table-drag-grip-opacity"] = "0.58";
  vars["--ds-data-table-drag-handle-font-size"] = "calc(var(--ds-font-size-xs) * 0.9167)";
  vars["--ds-data-table-drop-indicator-bg"] = "color-mix(in srgb, var(--ds-color-primary) 7%, transparent)";
  vars["--ds-data-table-drop-indicator-border"] = "color-mix(in srgb, var(--ds-color-primary) 52%, transparent)";
  vars["--ds-data-table-drop-indicator-inset"] = "0.1875rem";
  vars["--ds-data-table-drop-indicator-shadow"] = "0 0 0 3px color-mix(in srgb, var(--ds-color-primary) 6%, transparent)";
  vars["--ds-data-table-editor-checkbox-size"] = "1rem";
  vars["--ds-data-table-editor-error-font-size"] = "var(--ds-font-size-xs)";
  vars["--ds-data-table-editor-input-font-size"] = "var(--ds-font-size-sm, 0.875rem)";
  vars["--ds-data-table-editor-input-line-height"] = "1.5";
  vars["--ds-data-table-editor-input-padding"] = "0.25rem 0.5rem";
  vars["--ds-data-table-editorial-cell-padding-block"] = "1.125rem";
  vars["--ds-data-table-editorial-header-bg"] = "transparent";
  vars["--ds-data-table-editorial-header-padding-block"] = "1rem";
  vars["--ds-data-table-editorial-header-transform"] = "uppercase";
  vars["--ds-data-table-editorial-row-shadow"] = "var(--ds-elevation-1)";
  vars["--ds-data-table-empty-description-font-size"] = "var(--ds-button-sm-font-size, var(--ds-font-size-sm))";
  vars["--ds-data-table-empty-title-font-size"] = "var(--ds-font-size-sm)";
  vars["--ds-data-table-expanded-padding"] = "0.875rem 1rem 1rem";
  vars["--ds-data-table-group-count-font-size"] = "calc(var(--ds-font-size-xs) * 0.9167)";
  vars["--ds-data-table-group-disclosure-font-size"] = "calc(var(--ds-font-size-xs) * 0.8333)";
  vars["--ds-data-table-group-header-font-size"] = "var(--ds-button-sm-font-size, var(--ds-font-size-sm))";
  vars["--ds-data-table-header-content-gap"] = "0.375rem";
  vars["--ds-data-table-header-focus-shadow"] = "inset 0 0 0 2px color-mix(in srgb, var(--ds-color-primary) 48%, transparent)";
  vars["--ds-data-table-header-font-family"] = "var(--ds-typography-label-family, inherit)";
  vars["--ds-data-table-header-pinned-bg"] = "var(--ds-table-header-bg, var(--ds-surface-inset))";
  vars["--ds-data-table-leading-cell-padding-comfortable"] = "0.75rem 1rem 0.75rem 0.1875rem";
  vars["--ds-data-table-leading-cell-padding-compact"] = "0.375rem 0.75rem 0.375rem 0.125rem";
  vars["--ds-data-table-leading-cell-padding-spacious"] = "1rem 1rem 1rem 0.25rem";
  vars["--ds-data-table-min-inline-size"] = "42rem";
  vars["--ds-data-table-minimal-shadow"] = "none";
  vars["--ds-data-table-open-cell-padding-block"] = "0.875rem";
  vars["--ds-data-table-pagination-padding"] = "0.625rem 1rem";
  vars["--ds-data-table-pinned-cell-bg"] = "var(--ds-table-row-bg, var(--ds-surface-card))";
  vars["--ds-data-table-pinned-cell-bg-focus"] = "var(--ds-table-row-bg-selected, color-mix(in srgb, var(--ds-color-primary) 7%, var(--ds-surface-card)))";
  vars["--ds-data-table-pinned-cell-bg-hover"] = "var(--ds-table-row-bg-hover, color-mix(in srgb, var(--ds-color-text-primary) 4%, var(--ds-surface-card)))";
  vars["--ds-data-table-pinned-cell-bg-selected"] = "var(--ds-table-row-bg-selected, color-mix(in srgb, var(--ds-color-primary) 9%, var(--ds-surface-card)))";
  vars["--ds-data-table-pinned-cell-bg-striped"] = "var(--ds-table-row-bg-striped, var(--ds-surface-inset))";
  vars["--ds-data-table-resize-bar-height"] = "58%";
  vars["--ds-data-table-resize-bar-width"] = "0.125rem";
  vars["--ds-data-table-resize-hit-size"] = "1rem";
  vars["--ds-data-table-row-selected-shadow"] = "inset 0 0 0 1px color-mix(in srgb, var(--ds-color-primary) 30%, transparent)";
  vars["--ds-data-table-rule-strong"] = "var(--ds-color-border-secondary)";
  vars["--ds-data-table-selection-cell-padding-comfortable"] = "0 0 0 0.4375rem";
  vars["--ds-data-table-selection-cell-padding-compact"] = "0 0 0 0.375rem";
  vars["--ds-data-table-selection-cell-padding-spacious"] = "0 0 0 0.5rem";
  vars["--ds-data-table-sort-bg"] = "transparent";
  vars["--ds-data-table-sort-bg-active"] = "color-mix(in srgb, var(--ds-color-primary) 10%, transparent)";
  vars["--ds-data-table-sort-bg-hover"] = "color-mix(in srgb, var(--ds-color-primary) 7%, transparent)";
  vars["--ds-data-table-sort-border"] = "transparent";
  vars["--ds-data-table-sort-border-active"] = "color-mix(in srgb, var(--ds-color-primary) 30%, transparent)";
  vars["--ds-data-table-sort-border-hover"] = "color-mix(in srgb, var(--ds-color-primary) 24%, transparent)";
  vars["--ds-data-table-sort-color"] = "var(--ds-color-text-muted)";
  vars["--ds-data-table-sort-color-active"] = "var(--ds-color-primary)";
  vars["--ds-data-table-sort-color-hover"] = "var(--ds-color-text-secondary)";
  vars["--ds-data-table-sort-control-offset"] = "0.125rem";
  vars["--ds-data-table-sort-control-radius"] = "var(--ds-radius-sm, 0.375rem)";
  vars["--ds-data-table-sort-control-size"] = "1.375rem";
  vars["--ds-data-table-sort-opacity"] = "0.68";
  vars["--ds-data-table-state-copy-max-inline-size"] = "32rem";
  vars["--ds-data-table-toolbar-gap"] = "var(--ds-spacing-2, 0.5rem)";
  vars["--ds-data-table-touch-hit-expansion"] = "0.5625rem";
  vars["--ds-data-table-touch-target"] = "2.75rem";
  return vars;
}
