/**
 * @fileoverview The column-settings family: every channel its Modern skin reads, at the
 * resting value the skin itself stated, so a decision now has somewhere to
 * move it. One namespace, taken from the folder name.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/chrome/column-settings
 * @category Compilers
 * @package @rottay/design-system
 */

import type { FamilyDeriver } from "../../../../foundation/contract";

/** A vertical's own column-settings chrome outranks every relation stated here. */
export const columnSettingsChromeDeriver: FamilyDeriver = {
  family: "column-settings",
  rank: "derived",
  consumes: [
    "palette.*",
    "surfaces.radiusScale",
    "typography.roles",
    "density",
  ],
  produces: [
    "--ds-column-settings-empty-padding-block",
    "--ds-column-settings-empty-padding-inline",
    "--ds-column-settings-footer-padding-block",
    "--ds-column-settings-footer-padding-inline",
    "--ds-column-settings-hairline",
    "--ds-column-settings-header-padding-block",
    "--ds-column-settings-header-padding-block-end",
    "--ds-column-settings-header-padding-inline",
    "--ds-column-settings-label-font-size",
    "--ds-column-settings-list-max-block-size",
    "--ds-column-settings-list-padding-block",
    "--ds-column-settings-motion-duration",
    "--ds-column-settings-motion-timing",
    "--ds-column-settings-pin-side-font-size",
    "--ds-column-settings-quiet-ink",
    "--ds-column-settings-row-bg-hover",
    "--ds-column-settings-row-gap",
    "--ds-column-settings-row-padding-block",
    "--ds-column-settings-row-padding-inline",
    "--ds-column-settings-row-radius",
    "--ds-column-settings-search-padding-block",
    "--ds-column-settings-search-padding-inline",
  ],
  derive: () => deriveColumnSettingsChannels(),
};

export function deriveColumnSettingsChannels(): Record<string, string> {
  const vars: Record<string, string> = {};
  vars["--ds-column-settings-empty-padding-block"] = "8px";
  vars["--ds-column-settings-empty-padding-inline"] = "12px";
  vars["--ds-column-settings-footer-padding-block"] = "8px";
  vars["--ds-column-settings-footer-padding-inline"] = "12px";
  vars["--ds-column-settings-hairline"] = "var(--ds-color-border-subtle)";
  vars["--ds-column-settings-header-padding-block"] = "10px";
  vars["--ds-column-settings-header-padding-block-end"] = "8px";
  vars["--ds-column-settings-header-padding-inline"] = "12px";
  vars["--ds-column-settings-label-font-size"] = "var(--ds-font-size-sm)";
  vars["--ds-column-settings-list-max-block-size"] = "320px";
  vars["--ds-column-settings-list-padding-block"] = "4px";
  vars["--ds-column-settings-motion-duration"] = "var(--ds-motion-feedback)";
  vars["--ds-column-settings-motion-timing"] = "var(--ds-motion-ease-out)";
  vars["--ds-column-settings-pin-side-font-size"] = "10px";
  // The panel's quiet rung (the counter, a hidden column's label) graded
  // against the ground the panel actually sits on, so its sign follows the mode
  // instead of borrowing a page role fixed for a light canvas. 72% is the
  // fleet's governed quiet weight, taken from the data-table repair rather than
  // from this family's own minimum: measured here, WCAG 4.5 binds at 64% across
  // the gated scopes, and one weight for the whole quiet tier is worth more than
  // three families each sitting on their own floor.
  vars["--ds-column-settings-quiet-ink"] =
    "color-mix(in srgb, var(--ds-color-text-primary) 72%, var(--ds-surface-canvas, var(--ds-color-bg-primary)))";
  vars["--ds-column-settings-row-bg-hover"] = "color-mix(in srgb, var(--ds-color-text-primary) 4%, transparent)";
  vars["--ds-column-settings-row-gap"] = "var(--ds-spacing-2, 8px)";
  vars["--ds-column-settings-row-padding-block"] = "6px";
  vars["--ds-column-settings-row-padding-inline"] = "12px";
  vars["--ds-column-settings-row-radius"] = "var(--ds-radius-sm)";
  vars["--ds-column-settings-search-padding-block"] = "8px";
  vars["--ds-column-settings-search-padding-inline"] = "12px";
  return vars;
}

