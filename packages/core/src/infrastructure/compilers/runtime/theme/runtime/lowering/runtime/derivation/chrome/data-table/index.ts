/**
 * @fileoverview The data-table family: every channel its Modern skins read, at the
 * resting value the skins themselves stated, so a decision now has somewhere to
 * move it. Its namespace is `--ds-data-table-`, derived from the folder name;
 * `--ds-table-` belongs to the Table primitive's own deriver and to the
 * `chrome.table` decision, and this family only consumes those.
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
    "--ds-data-table-action-gap",
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
    "--ds-data-table-drag-grip-offset",
    "--ds-data-table-drag-grip-opacity",
    "--ds-data-table-drag-grip-size",
    "--ds-data-table-drag-handle-font-size",
    "--ds-data-table-drop-indicator-bg",
    "--ds-data-table-drop-indicator-border",
    "--ds-data-table-drop-indicator-inset",
    "--ds-data-table-drop-indicator-radius",
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
    "--ds-data-table-editorial-lead-font-weight",
    "--ds-data-table-editorial-mobile-title-size",
    "--ds-data-table-editorial-row-shadow",
    "--ds-data-table-empty-description-font-size",
    "--ds-data-table-empty-title-font-size",
    "--ds-data-table-empty-title-font-weight",
    "--ds-data-table-expanded-padding",
    "--ds-data-table-group-count-font-size",
    "--ds-data-table-group-disclosure-font-size",
    "--ds-data-table-group-header-font-size",
    "--ds-data-table-group-header-font-weight",
    "--ds-data-table-header-content-gap",
    "--ds-data-table-header-focus-shadow",
    "--ds-data-table-header-font-family",
    "--ds-data-table-header-pinned-bg",
    "--ds-data-table-leading-cell-padding-comfortable",
    "--ds-data-table-leading-cell-padding-compact",
    "--ds-data-table-leading-cell-padding-spacious",
    "--ds-data-table-min-inline-size",
    "--ds-data-table-minimal-shadow",
    "--ds-data-table-mobile-actions-padding-block",
    "--ds-data-table-mobile-bulk-bar-bg",
    "--ds-data-table-mobile-bulk-bar-ink",
    "--ds-data-table-mobile-bulk-padding",
    "--ds-data-table-mobile-card-focus-ring",
    "--ds-data-table-mobile-card-hover-lift",
    "--ds-data-table-mobile-control-size",
    "--ds-data-table-mobile-pagination-bg",
    "--ds-data-table-mobile-pagination-ink",
    "--ds-data-table-mobile-pagination-padding",
    "--ds-data-table-mobile-selected-outline-offset",
    "--ds-data-table-mobile-state-min-height",
    "--ds-data-table-mobile-state-padding",
    "--ds-data-table-mobile-state-radius",
    "--ds-data-table-mobile-summary-divider",
    "--ds-data-table-mobile-summary-min-height",
    "--ds-data-table-mobile-summary-padding-block",
    "--ds-data-table-mobile-summary-padding-inline",
    "--ds-data-table-open-cell-padding-block",
    "--ds-data-table-pagination-padding",
    "--ds-data-table-pinned-cell-bg",
    "--ds-data-table-pinned-cell-bg-focus",
    "--ds-data-table-pinned-cell-bg-hover",
    "--ds-data-table-pinned-cell-bg-selected",
    "--ds-data-table-pinned-cell-bg-striped",
    "--ds-data-table-resize-bar-height",
    "--ds-data-table-resize-bar-height-active",
    "--ds-data-table-resize-bar-width",
    "--ds-data-table-resize-bar-width-active",
    "--ds-data-table-resize-hit-size",
    "--ds-data-table-row-selected-shadow",
    "--ds-data-table-rule-strong",
    "--ds-data-table-ruled-mobile-radius",
    "--ds-data-table-ruled-mobile-shadow",
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
  vars["--ds-data-table-action-shadow"] = "var(--ds-elevation-0, none)";
  vars["--ds-data-table-bulk-bar-padding"] =
    "calc(0.625rem * var(--ds-rhythm-effective-scale, 1)) calc(1rem * var(--ds-rhythm-effective-scale, 1))";
  vars["--ds-data-table-caption-font-size"] = "var(--ds-font-size-xs)";
  vars["--ds-data-table-collapsed-min-inline-size"] = "34rem";
  vars["--ds-data-table-control-font-size"] = "var(--ds-button-sm-font-size, var(--ds-font-size-sm))";
  vars["--ds-data-table-control-size"] = "calc(var(--ds-spacing-8, 2rem) * var(--ds-density-effective-scale, 1) * var(--ds-control-height-scale, 1))";
  vars["--ds-data-table-control-size-compact"] = "calc(var(--ds-spacing-7, 1.75rem) * var(--ds-density-effective-scale, 1) * var(--ds-control-height-scale, 1))";
  vars["--ds-data-table-control-size-spacious"] = "calc(var(--ds-spacing-9, 2.25rem) * var(--ds-density-effective-scale, 1) * var(--ds-control-height-scale, 1))";
  vars["--ds-data-table-drag-grip-bg"] = "color-mix(in srgb, var(--ds-color-bg-primary) 34%, transparent)";
  vars["--ds-data-table-drag-grip-border"] = "color-mix(in srgb, var(--ds-color-border-secondary) 76%, transparent)";
  vars["--ds-data-table-drag-grip-opacity"] = "0.58";
  vars["--ds-data-table-drag-handle-font-size"] = "calc(var(--ds-font-size-xs) * 0.9167)";
  vars["--ds-data-table-drop-indicator-bg"] = "color-mix(in srgb, var(--ds-color-primary) 7%, transparent)";
  vars["--ds-data-table-drop-indicator-border"] = "color-mix(in srgb, var(--ds-color-primary) 52%, transparent)";
  vars["--ds-data-table-drop-indicator-inset"] = "0.1875rem";
  vars["--ds-data-table-drop-indicator-shadow"] = "0 0 0 3px color-mix(in srgb, var(--ds-color-primary) 6%, transparent)";
  vars["--ds-data-table-editor-checkbox-size"] = "var(--ds-spacing-4, 1rem)";
  vars["--ds-data-table-editor-error-font-size"] = "var(--ds-font-size-xs)";
  vars["--ds-data-table-editor-input-font-size"] = "var(--ds-font-size-sm, 0.875rem)";
  vars["--ds-data-table-editor-input-line-height"] = "var(--ds-line-height-normal, 1.5)";
  vars["--ds-data-table-editor-input-padding"] = "0.25rem 0.5rem";
  vars["--ds-data-table-editorial-cell-padding-block"] = "1.125rem";
  vars["--ds-data-table-editorial-header-bg"] = "transparent";
  vars["--ds-data-table-editorial-header-padding-block"] = "var(--ds-spacing-4, 1rem)";
  vars["--ds-data-table-editorial-header-transform"] = "var(--ds-text-eyebrow-transform, uppercase)";
  vars["--ds-data-table-editorial-lead-font-weight"] = "var(--ds-type-section-title-font-weight, 600)";
  vars["--ds-data-table-editorial-row-shadow"] = "var(--ds-elevation-1)";
  vars["--ds-data-table-empty-description-font-size"] = "var(--ds-button-sm-font-size, var(--ds-font-size-sm))";
  vars["--ds-data-table-empty-title-font-size"] = "var(--ds-font-size-sm)";
  vars["--ds-data-table-empty-title-font-weight"] = "var(--ds-type-section-title-font-weight, 600)";
  vars["--ds-data-table-expanded-padding"] =
    "calc(0.875rem * var(--ds-rhythm-effective-scale, 1)) calc(1rem * var(--ds-rhythm-effective-scale, 1)) calc(1rem * var(--ds-rhythm-effective-scale, 1))";
  vars["--ds-data-table-group-count-font-size"] = "calc(var(--ds-font-size-xs) * 0.9167)";
  vars["--ds-data-table-group-disclosure-font-size"] = "calc(var(--ds-font-size-xs) * 0.8333)";
  vars["--ds-data-table-group-header-font-size"] = "var(--ds-button-sm-font-size, var(--ds-font-size-sm))";
  vars["--ds-data-table-group-header-font-weight"] = "var(--ds-type-section-title-font-weight, 600)";
  vars["--ds-data-table-header-content-gap"] = "calc(0.375rem * var(--ds-rhythm-effective-scale, 1))";
  vars["--ds-data-table-header-focus-shadow"] = "inset 0 0 0 2px color-mix(in srgb, var(--ds-color-primary) 48%, transparent)";
  vars["--ds-data-table-header-font-family"] = "var(--ds-type-label-font-family, inherit)";
  vars["--ds-data-table-header-pinned-bg"] = "var(--ds-table-header-bg, var(--ds-surface-inset))";
  vars["--ds-data-table-leading-cell-padding-comfortable"] = "0.75rem 1rem 0.75rem 0.1875rem";
  vars["--ds-data-table-leading-cell-padding-compact"] = "0.375rem 0.75rem 0.375rem 0.125rem";
  vars["--ds-data-table-leading-cell-padding-spacious"] = "1rem 1rem 1rem 0.25rem";
  vars["--ds-data-table-min-inline-size"] = "42rem";
  vars["--ds-data-table-minimal-shadow"] = "var(--ds-elevation-0, none)";
  // Each phone chrome bar states its ground AND the quiet ink that sits on it,
  // so the ink flips with the mode instead of borrowing a page role graded for
  // the page ground. 72% of the reading ink is the floor's own answer: the
  // smallest whole-percent weight clearing WCAG 4.5 (binding in light) and APCA
  // Lc 60 (binding in dark) in every gated scope. It is not a tenant knob.
  vars["--ds-data-table-mobile-bulk-bar-bg"] =
    "color-mix(in srgb, var(--ds-color-primary) 7%, var(--ds-surface-card))";
  vars["--ds-data-table-mobile-bulk-bar-ink"] =
    "color-mix(in srgb, var(--ds-color-text-primary) 72%, var(--ds-data-table-mobile-bulk-bar-bg))";
  vars["--ds-data-table-mobile-pagination-bg"] = "var(--ds-surface-inset, var(--ds-surface-panel))";
  vars["--ds-data-table-mobile-pagination-ink"] =
    "color-mix(in srgb, var(--ds-color-text-primary) 72%, var(--ds-data-table-mobile-pagination-bg))";
  vars["--ds-data-table-open-cell-padding-block"] = "0.875rem";
  vars["--ds-data-table-pagination-padding"] =
    "calc(0.625rem * var(--ds-rhythm-effective-scale, 1)) calc(1rem * var(--ds-rhythm-effective-scale, 1))";
  vars["--ds-data-table-pinned-cell-bg"] = "var(--ds-table-row-bg, var(--ds-surface-card))";
  vars["--ds-data-table-pinned-cell-bg-focus"] = "var(--ds-table-row-bg-selected, color-mix(in srgb, var(--ds-color-primary) 7%, var(--ds-surface-card)))";
  vars["--ds-data-table-pinned-cell-bg-hover"] = "var(--ds-table-row-bg-hover, color-mix(in srgb, var(--ds-color-text-primary) 4%, var(--ds-surface-card)))";
  vars["--ds-data-table-pinned-cell-bg-selected"] = "var(--ds-table-row-bg-selected, color-mix(in srgb, var(--ds-color-primary) 9%, var(--ds-surface-card)))";
  vars["--ds-data-table-pinned-cell-bg-striped"] = "var(--ds-table-row-bg-striped, var(--ds-surface-inset))";
  vars["--ds-data-table-resize-bar-height"] = "58%";
  vars["--ds-data-table-resize-bar-width"] = "0.125rem";
  vars["--ds-data-table-resize-hit-size"] = "var(--ds-spacing-4, 1rem)";
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
  vars["--ds-data-table-sort-control-size"] = "calc(1.375rem * var(--ds-density-effective-scale, 1) * var(--ds-control-height-scale, 1))";
  vars["--ds-data-table-sort-opacity"] = "0.68";
  vars["--ds-data-table-state-copy-max-inline-size"] = "32rem";
  vars["--ds-data-table-toolbar-gap"] = "calc(var(--ds-spacing-2, 0.5rem) * var(--ds-rhythm-effective-scale, 1))";
  vars["--ds-data-table-touch-hit-expansion"] = "0.5625rem";
  vars["--ds-data-table-touch-target"] = "var(--ds-spacing-11, 2.75rem)";
  /* Drained out of the `--ds-table-` spelling nobody produced: the skins now
     read the family's own name at the same byte-identical fallback. */
  vars["--ds-data-table-action-gap"] = "var(--ds-spacing-2, 0.5rem)";
  /* Two rules state the grip's margin on the same selector; the later one
     carries `0`, so `0` is what it paints produced or not. */
  vars["--ds-data-table-drag-grip-offset"] = "0";
  vars["--ds-data-table-drag-grip-size"] = "calc(var(--ds-modern-table-control-size) - 0.375rem)";
  vars["--ds-data-table-drop-indicator-radius"] = "var(--ds-modern-table-control-radius)";
  vars["--ds-data-table-editorial-mobile-title-size"] = "1rem";
  vars["--ds-data-table-mobile-actions-padding-block"] = "0.625rem";
  vars["--ds-data-table-mobile-bulk-padding"] = "0.625rem 0.75rem";
  vars["--ds-data-table-mobile-card-focus-ring"] = "0 0 0 var(--ds-focus-ring-width, 2px) color-mix(in srgb, var(--ds-color-primary) 42%, transparent), var(--ds-collection-card-shadow-hover, var(--ds-premium-card-shadow-hover, var(--ds-elevation-2)))";
  vars["--ds-data-table-mobile-card-hover-lift"] = "-1px";
  vars["--ds-data-table-mobile-control-size"] = "2.25rem";
  vars["--ds-data-table-mobile-pagination-padding"] = "0.625rem 0.75rem";
  vars["--ds-data-table-mobile-selected-outline-offset"] = "2px";
  vars["--ds-data-table-mobile-state-min-height"] = "8rem";
  vars["--ds-data-table-mobile-state-padding"] = "2rem 1.25rem";
  vars["--ds-data-table-mobile-state-radius"] = "var(--ds-table-radius, var(--ds-radius-lg))";
  vars["--ds-data-table-mobile-summary-divider"] = "color-mix(in srgb, var(--ds-color-border-subtle) 72%, transparent)";
  vars["--ds-data-table-mobile-summary-min-height"] = "2rem";
  vars["--ds-data-table-mobile-summary-padding-block"] = "0.375rem";
  vars["--ds-data-table-mobile-summary-padding-inline"] = "0.125rem";
  vars["--ds-data-table-resize-bar-height-active"] = "74%";
  vars["--ds-data-table-resize-bar-width-active"] = "0.1875rem";
  vars["--ds-data-table-ruled-mobile-radius"] = "var(--ds-radius-md, 0.5rem)";
  vars["--ds-data-table-ruled-mobile-shadow"] = "none";
  return vars;
}
