/**
 * @fileoverview The toolbar vocabulary at the one resting value the Modern list-toolbar skin
 * reads, for every channel that paints the same resolved at the theme root.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/chrome/toolbar
 * @category Compilers
 * @package @rottay/design-system
 */

import type { FamilyDeriver } from "../../../../foundation/contract";

/** A vertical's own toolbar chrome outranks every relation stated here. */
export const toolbarChromeDeriver: FamilyDeriver = {
  family: "toolbar",
  rank: "derived",
  consumes: [
    "palette.*",
    "surfaces.radiusScale",
    "surfaces.focusStyle",
    "typography.roles",
  ],
  produces: [
    "--ds-toolbar-control-focus-ring",
    "--ds-toolbar-control-pressed-scale",
    "--ds-toolbar-controls-bg",
    "--ds-toolbar-controls-blur",
    "--ds-toolbar-controls-border",
    "--ds-toolbar-controls-padding",
    "--ds-toolbar-controls-shadow",
    "--ds-toolbar-count-radius",
    "--ds-toolbar-divider-opacity",
    "--ds-toolbar-entry-animation",
    "--ds-toolbar-focus-border",
    "--ds-toolbar-focus-ring",
    "--ds-toolbar-header-gradient",
    "--ds-toolbar-icon-bg",
    "--ds-toolbar-icon-border",
    "--ds-toolbar-icon-color",
    "--ds-toolbar-menu-item-radius",
    "--ds-toolbar-mobile-actions-bg",
    "--ds-toolbar-mobile-actions-border",
    "--ds-toolbar-mobile-actions-padding",
    "--ds-toolbar-mobile-rail-bg",
    "--ds-toolbar-mobile-rail-border",
    "--ds-toolbar-mobile-rail-padding",
    "--ds-toolbar-popover-radius",
    "--ds-toolbar-primary-action-max-width",
    "--ds-toolbar-rail-focus-clearance",
    "--ds-toolbar-saved-views-bg",
    "--ds-toolbar-saved-views-border",
    "--ds-toolbar-search-font-size",
    "--ds-toolbar-search-height",
    "--ds-toolbar-search-max-width",
    "--ds-toolbar-search-min-width",
    "--ds-toolbar-search-wide-max-width",
    "--ds-toolbar-sheen",
    "--ds-toolbar-sheen-animation",
    "--ds-toolbar-title-font-family",
    "--ds-toolbar-title-font-size",
    "--ds-toolbar-title-font-weight",
    "--ds-toolbar-title-icon-size",
    "--ds-toolbar-title-max-width",
    "--ds-toolbar-title-section-padding",
    "--ds-toolbar-touch-target",
  ],
  derive: () => deriveToolbarChannels(),
};

export function deriveToolbarChannels(): Record<string, string> {
  const vars: Record<string, string> = {};
  vars["--ds-toolbar-control-focus-ring"] = "var(--ds-material-control-focus-ring, 0 0 0 3px color-mix(in srgb, var(--ds-color-primary) 20%, transparent))";
  vars["--ds-toolbar-control-pressed-scale"] = "0.975";
  vars["--ds-toolbar-controls-bg"] = "transparent";
  vars["--ds-toolbar-controls-blur"] = "0px";
  vars["--ds-toolbar-controls-border"] = "transparent";
  vars["--ds-toolbar-controls-padding"] = "0";
  vars["--ds-toolbar-controls-shadow"] = "none";
  vars["--ds-toolbar-count-radius"] = "var(--ds-radius-full, 9999px)";
  vars["--ds-toolbar-divider-opacity"] = "0.6";
  vars["--ds-toolbar-entry-animation"] = "none";
  vars["--ds-toolbar-focus-border"] = "var(--ds-material-panel-border-hover, var(--ds-color-primary))";
  vars["--ds-toolbar-focus-ring"] = "var(--ds-material-panel-focus-ring, 0 0 0 3px color-mix(in srgb, var(--ds-color-primary) 18%, transparent))";
  vars["--ds-toolbar-header-gradient"] = "linear-gradient(118deg, color-mix(in srgb, var(--ds-toolbar-bg, var(--ds-material-panel-background, var(--ds-surface-card))) 96%, var(--ds-color-primary) 4%) 0%, var(--ds-toolbar-bg, var(--ds-material-panel-background, var(--ds-surface-card))) 48%, color-mix(in srgb, var(--ds-toolbar-bg, var(--ds-material-panel-background, var(--ds-surface-card))) 94%, var(--ds-surface-inset, var(--ds-color-bg-secondary)) 6%) 100%)";
  vars["--ds-toolbar-icon-bg"] = "color-mix(in srgb, var(--ds-color-primary) 8%, var(--ds-surface-card))";
  vars["--ds-toolbar-icon-border"] = "var(--ds-toolbar-control-border, var(--ds-color-border))";
  vars["--ds-toolbar-icon-color"] = "var(--ds-color-primary)";
  vars["--ds-toolbar-menu-item-radius"] = "var(--ds-button-sm-radius, var(--ds-radius-sm, 6px))";
  vars["--ds-toolbar-mobile-actions-bg"] = "transparent";
  vars["--ds-toolbar-mobile-actions-border"] = "transparent";
  vars["--ds-toolbar-mobile-actions-padding"] = "0";
  vars["--ds-toolbar-mobile-rail-bg"] = "transparent";
  vars["--ds-toolbar-mobile-rail-border"] = "transparent";
  vars["--ds-toolbar-mobile-rail-padding"] = "var(--ds-toolbar-rail-focus-clearance, 0.25rem)";
  vars["--ds-toolbar-popover-radius"] = "var(--ds-radius-md, 0.5rem)";
  vars["--ds-toolbar-primary-action-max-width"] = "18rem";
  vars["--ds-toolbar-rail-focus-clearance"] = "0.25rem";
  vars["--ds-toolbar-saved-views-bg"] = "color-mix(in srgb, var(--ds-surface-inset) 45%, transparent)";
  vars["--ds-toolbar-saved-views-border"] = "transparent";
  vars["--ds-toolbar-search-font-size"] = "var(--ds-button-sm-font-size, 0.8125rem)";
  vars["--ds-toolbar-search-height"] = "var(--ds-button-sm-height, 2rem)";
  vars["--ds-toolbar-search-max-width"] = "20rem";
  vars["--ds-toolbar-search-min-width"] = "11.25rem";
  vars["--ds-toolbar-search-wide-max-width"] = "30rem";
  vars["--ds-toolbar-sheen"] = "linear-gradient(105deg, transparent 18%, color-mix(in srgb, var(--ds-color-primary) 7%, transparent) 48%, transparent 76%)";
  vars["--ds-toolbar-sheen-animation"] = "none";
  vars["--ds-toolbar-title-font-family"] = "var(--ds-type-section-title-font-family, var(--ds-font-family-heading))";
  vars["--ds-toolbar-title-font-size"] = "var(--ds-font-size-md)";
  vars["--ds-toolbar-title-font-weight"] = "var(--ds-font-weight-semibold, 600)";
  vars["--ds-toolbar-title-icon-size"] = "2rem";
  vars["--ds-toolbar-title-max-width"] = "18rem";
  vars["--ds-toolbar-title-section-padding"] = "0.25rem";
  vars["--ds-toolbar-touch-target"] = "2.75rem";
  return vars;
}
