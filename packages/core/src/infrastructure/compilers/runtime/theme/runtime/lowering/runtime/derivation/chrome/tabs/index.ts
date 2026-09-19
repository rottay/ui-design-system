/**
 * @fileoverview The tabs family: four bounded recipes (underline, contained,
 * segmented, pills) on the inset and card materials, tab ink from the tab
 * roots, the selection indicator and highlight on the primary seed, three
 * size steps on the spacing ramp and the type roles, the overflow controls
 * and badge on the elevation scale, and every motion on the intent cadences.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/chrome/tabs
 * @category Compilers
 * @package @rottay/design-system
 */

import type { FamilyDeriver } from "../../../../foundation/contract";

/** A vertical's own tabs chrome outranks every relation stated here. */
export const tabsChromeDeriver: FamilyDeriver = {
  family: "tabs",
  rank: "derived",
  consumes: ["palette.*", "surfaces.materials", "surfaces.elevation", "surfaces.effects", "surfaces.radiusScale", "typography.roles", "states.focus", "states.press", "density", "motion"],
  produces: [
    "--ds-tabs-gap",
    "--ds-tabs-motion-duration",
    "--ds-tabs-motion-easing",
    "--ds-tabs-focus-ring",
    "--ds-tabs-focus-ring-width",
    "--ds-tabs-sm-height",
    "--ds-tabs-sm-padding",
    "--ds-tabs-sm-font-size",
    "--ds-tabs-sm-icon-size",
    "--ds-tabs-md-height",
    "--ds-tabs-md-padding",
    "--ds-tabs-md-font-size",
    "--ds-tabs-md-icon-size",
    "--ds-tabs-responsive-height",
    "--ds-tabs-responsive-padding",
    "--ds-tabs-responsive-font-size",
    "--ds-tabs-responsive-icon-size",
    "--ds-tabs-lg-height",
    "--ds-tabs-lg-padding",
    "--ds-tabs-lg-font-size",
    "--ds-tabs-lg-icon-size",
    "--ds-tabs-mobile-gap",
    "--ds-tabs-mobile-padding",
    "--ds-tabs-mobile-item-max-width",
    "--ds-tabs-list-width",
    "--ds-tabs-list-max-width",
    "--ds-tabs-list-bg",
    "--ds-tabs-list-border",
    "--ds-tabs-list-padding",
    "--ds-tabs-list-radius",
    "--ds-tabs-list-shadow",
    "--ds-tabs-list-highlight",
    "--ds-tabs-list-texture",
    "--ds-tabs-list-texture-size",
    "--ds-tabs-list-texture-opacity",
    "--ds-tabs-list-blur",
    "--ds-tabs-underline-list-width",
    "--ds-tabs-underline-list-bg",
    "--ds-tabs-underline-list-shadow",
    "--ds-tabs-contained-list-bg",
    "--ds-tabs-segmented-list-bg",
    "--ds-tabs-pills-list-bg",
    "--ds-tabs-pills-list-radius",
    "--ds-tabs-border",
    "--ds-tabs-overflow-fade-width",
    "--ds-tabs-overflow-fade-color",
    "--ds-tabs-item-max-width",
    "--ds-tabs-item-gap",
    "--ds-tabs-item-radius",
    "--ds-tabs-line-item-radius",
    "--ds-tabs-pills-item-radius",
    "--ds-tabs-item-font-family",
    "--ds-tabs-item-font-weight",
    "--ds-tabs-item-font-weight-active",
    "--ds-tabs-item-line-height",
    "--ds-tabs-item-letter-spacing",
    "--ds-tabs-item-lift",
    "--ds-tabs-active-highlight",
    "--ds-tabs-active-highlight-opacity",
    "--ds-tabs-active-reveal-duration",
    "--ds-tabs-active-bg",
    "--ds-tabs-active-shadow",
    "--ds-tabs-active-transform",
    "--ds-tabs-pressed-transform",
    "--ds-tabs-line-hover-bg",
    "--ds-tabs-line-active-bg",
    "--ds-tabs-contained-active-bg",
    "--ds-tabs-contained-active-shadow",
    "--ds-tabs-segmented-active-bg",
    "--ds-tabs-segmented-active-shadow",
    "--ds-tabs-pills-active-bg",
    "--ds-tabs-pills-active-border",
    "--ds-tabs-pills-active-color",
    "--ds-tabs-pills-active-shadow",
    "--ds-tabs-disabled-bg",
    "--ds-tabs-disabled-color",
    "--ds-tabs-disabled-opacity",
    "--ds-tabs-icon-padding",
    "--ds-tabs-icon-radius",
    "--ds-tabs-icon-bg",
    "--ds-tabs-icon-bg-active",
    "--ds-tabs-icon-color",
    "--ds-tabs-icon-shadow",
    "--ds-tabs-icon-shadow-active",
    "--ds-tabs-icon-transform-active",
    "--ds-tabs-loading-size",
    "--ds-tabs-loading-stroke",
    "--ds-tabs-loading-track",
    "--ds-tabs-loading-color",
    "--ds-tabs-loading-duration",
    "--ds-tabs-badge-min-width",
    "--ds-tabs-badge-height",
    "--ds-tabs-badge-padding",
    "--ds-tabs-badge-radius",
    "--ds-tabs-badge-border",
    "--ds-tabs-badge-border-active",
    "--ds-tabs-badge-bg",
    "--ds-tabs-badge-bg-active",
    "--ds-tabs-badge-color",
    "--ds-tabs-badge-color-active",
    "--ds-tabs-badge-font-size",
    "--ds-tabs-badge-font-weight",
    "--ds-tabs-badge-keyline",
    "--ds-tabs-indicator-height",
    "--ds-tabs-indicator-gradient",
    "--ds-tabs-indicator-radius",
    "--ds-tabs-indicator-shadow",
    "--ds-tabs-indicator-motion-duration",
    "--ds-tabs-indicator-offset",
    "--ds-tabs-overflow-control-size",
    "--ds-tabs-overflow-control-border",
    "--ds-tabs-overflow-control-bg",
    "--ds-tabs-overflow-control-bg-hover",
    "--ds-tabs-overflow-control-color",
    "--ds-tabs-overflow-control-shadow",
    "--ds-tabs-overflow-control-shadow-hover",
    "--ds-tabs-panel-padding",
    "--ds-tabs-panel-gap",
    "--ds-tabs-panel-border",
    "--ds-tabs-panel-radius",
    "--ds-tabs-panel-bg",
    "--ds-tabs-panel-shadow",
    "--ds-tabs-panel-texture",
    "--ds-tabs-panel-highlight",
    "--ds-tabs-panel-focus-ring",
    "--ds-tabs-panel-motion-duration",
    "--ds-tabs-panel-motion-easing",
    "--ds-tabs-panel-motion-distance",
    "--ds-tabs-touch-target-min",
  ],
  derive: () => deriveTabsChannels(),
};

export function deriveTabsChannels(): Record<string, string> {
  const vars: Record<string, string> = {};

  // Rail rhythm and motion cadence.
  vars["--ds-tabs-gap"] = "var(--ds-spacing-1)";
  vars["--ds-tabs-motion-duration"] = "var(--ds-motion-feedback)";
  vars["--ds-tabs-motion-easing"] = "var(--ds-motion-ease-standard)";
  vars["--ds-tabs-focus-ring"] = "var(--ds-focus-ring)";
  vars["--ds-tabs-focus-ring-width"] = "var(--ds-focus-ring-width)";

  // Three size steps and the type roles. A control height is its base scaled
  // by density and by the control-height factor once each, so the base is the
  // ramp step's own rem, not the ramp (which already carries density).
  vars["--ds-tabs-sm-height"] = "calc(2rem * var(--ds-density-effective-scale, 1) * var(--ds-control-height-scale, 1))";
  vars["--ds-tabs-sm-padding"] = "0 var(--ds-spacing-3, 12px)";
  vars["--ds-tabs-sm-font-size"] = "var(--ds-type-supporting-font-size)";
  vars["--ds-tabs-sm-icon-size"] = "var(--ds-icon-sm-size)";
  vars["--ds-tabs-md-height"] = "calc(2.25rem * var(--ds-density-effective-scale, 1) * var(--ds-control-height-scale, 1))";
  vars["--ds-tabs-md-padding"] = "0 var(--ds-spacing-4)";
  vars["--ds-tabs-md-font-size"] = "var(--ds-type-body-font-size)";
  vars["--ds-tabs-md-icon-size"] = "var(--ds-icon-sm-size)";
  vars["--ds-tabs-responsive-height"] = "var(--ds-tabs-md-height)";
  vars["--ds-tabs-responsive-padding"] = "var(--ds-tabs-md-padding)";
  vars["--ds-tabs-responsive-font-size"] = "var(--ds-tabs-md-font-size)";
  vars["--ds-tabs-responsive-icon-size"] = "var(--ds-tabs-md-icon-size)";
  vars["--ds-tabs-lg-height"] = "calc(2.5rem * var(--ds-density-effective-scale, 1) * var(--ds-control-height-scale, 1))";
  vars["--ds-tabs-lg-padding"] = "0 var(--ds-spacing-4, 16px)";
  vars["--ds-tabs-lg-font-size"] = "var(--ds-font-size-base)";
  vars["--ds-tabs-lg-icon-size"] = "var(--ds-icon-md-size)";
  vars["--ds-tabs-mobile-gap"] = "var(--ds-spacing-0)";
  vars["--ds-tabs-mobile-padding"] = "0 var(--ds-spacing-2, 8px)";
  vars["--ds-tabs-mobile-item-max-width"] = "12rem";

  // Trays: the recipe surfaces on the inset and card materials.
  vars["--ds-tabs-list-width"] = "max-content";
  vars["--ds-tabs-list-max-width"] = "100%";
  vars["--ds-tabs-list-bg"] = "linear-gradient(145deg, color-mix(in srgb, var(--ds-surface-inset) 90%, var(--ds-color-primary) 10%), var(--ds-surface-inset))";
  vars["--ds-tabs-list-border"] = "var(--ds-color-border-subtle)";
  vars["--ds-tabs-list-padding"] = "var(--ds-spacing-1)";
  vars["--ds-tabs-list-radius"] = "var(--ds-radius-lg)";
  vars["--ds-tabs-list-shadow"] = "inset 0 1px 0 color-mix(in srgb, var(--ds-color-bg-elevated) 82%, transparent)";
  vars["--ds-tabs-list-highlight"] = "inset 0 1px 0 color-mix(in srgb, var(--ds-color-bg-elevated) 68%, transparent)";
  vars["--ds-tabs-list-texture"] = "radial-gradient(circle at 1px 1px, color-mix(in srgb, var(--ds-color-text-primary) 13%, transparent) 0.55px, transparent 0.75px)";
  vars["--ds-tabs-list-texture-size"] = "9px 9px";
  vars["--ds-tabs-list-texture-opacity"] = "calc(0.16 * var(--ds-effect-intensity))";
  vars["--ds-tabs-list-blur"] = "0px";
  vars["--ds-tabs-underline-list-width"] = "100%";
  vars["--ds-tabs-underline-list-bg"] = "linear-gradient(180deg, color-mix(in srgb, var(--ds-surface-card) 76%, transparent), color-mix(in srgb, var(--ds-surface-inset) 44%, transparent))";
  vars["--ds-tabs-underline-list-shadow"] = "inset 0 -1px 0 color-mix(in srgb, var(--ds-color-bg-elevated) 58%, transparent)";
  vars["--ds-tabs-contained-list-bg"] = "var(--ds-tabs-list-bg)";
  vars["--ds-tabs-segmented-list-bg"] = "color-mix(in srgb, var(--ds-surface-inset) 94%, var(--ds-color-primary) 6%)";
  vars["--ds-tabs-pills-list-bg"] = "color-mix(in srgb, var(--ds-surface-inset) 88%, transparent)";
  vars["--ds-tabs-pills-list-radius"] = "var(--ds-radius-full)";
  vars["--ds-tabs-border"] = "var(--ds-color-border-subtle)";
  vars["--ds-tabs-overflow-fade-width"] = "var(--ds-spacing-7)";
  vars["--ds-tabs-overflow-fade-color"] = "var(--ds-surface-card)";

  // Destinations: ink from the tab roots, geometry from the ramp.
  vars["--ds-tabs-item-max-width"] = "18rem";
  vars["--ds-tabs-item-gap"] = "var(--ds-spacing-2)";
  vars["--ds-tabs-item-radius"] = "var(--ds-radius-md)";
  vars["--ds-tabs-line-item-radius"] = "var(--ds-radius-md)";
  vars["--ds-tabs-pills-item-radius"] = "var(--ds-radius-full)";
  vars["--ds-tabs-item-font-family"] = "var(--ds-type-label-font-family)";
  vars["--ds-tabs-item-font-weight"] = "var(--ds-tab-font-weight, var(--ds-font-weight-medium))";
  vars["--ds-tabs-item-font-weight-active"] = "var(--ds-font-weight-semibold)";
  vars["--ds-tabs-item-line-height"] = "var(--ds-type-label-line-height)";
  vars["--ds-tabs-item-letter-spacing"] = "var(--ds-type-label-letter-spacing)";
  vars["--ds-tabs-item-lift"] = "calc(-1px * var(--ds-motion-intensity))";
  vars["--ds-tabs-active-highlight"] = "linear-gradient(118deg, transparent 12%, color-mix(in srgb, var(--ds-color-bg-elevated) 72%, transparent) 48%, transparent 76%)";
  vars["--ds-tabs-active-highlight-opacity"] = "calc(0.44 * var(--ds-effect-intensity))";
  vars["--ds-tabs-active-reveal-duration"] = "var(--ds-motion-feedback)";
  vars["--ds-tabs-active-bg"] = "linear-gradient(160deg, var(--ds-surface-card), color-mix(in srgb, var(--ds-surface-card) 93%, var(--ds-color-primary) 7%))";
  vars["--ds-tabs-active-shadow"] = "var(--ds-elevation-1)";
  vars["--ds-tabs-active-transform"] = "translateY(var(--ds-tabs-item-lift))";
  vars["--ds-tabs-pressed-transform"] = "translateY(0) scale(0.985)";
  vars["--ds-tabs-line-hover-bg"] = "color-mix(in srgb, var(--ds-color-text-primary) 4%, transparent)";
  vars["--ds-tabs-line-active-bg"] = "linear-gradient(180deg, color-mix(in srgb, var(--ds-color-primary) 8%, transparent), color-mix(in srgb, var(--ds-color-primary) 3%, transparent))";
  vars["--ds-tabs-contained-active-bg"] = "var(--ds-tabs-active-bg)";
  vars["--ds-tabs-contained-active-shadow"] = "var(--ds-tabs-active-shadow)";
  vars["--ds-tabs-segmented-active-bg"] = "var(--ds-surface-card)";
  vars["--ds-tabs-segmented-active-shadow"] = "var(--ds-tabs-active-shadow)";
  vars["--ds-tabs-pills-active-bg"] = "var(--ds-color-primary)";
  vars["--ds-tabs-pills-active-border"] = "var(--ds-tab-border-active, var(--ds-color-primary))";
  vars["--ds-tabs-pills-active-color"] = "var(--ds-color-text-on-primary)";
  vars["--ds-tabs-pills-active-shadow"] = "var(--ds-elevation-1)";
  vars["--ds-tabs-disabled-bg"] = "transparent";
  vars["--ds-tabs-disabled-color"] = "var(--ds-color-text-tertiary)";
  vars["--ds-tabs-disabled-opacity"] = "0.48";

  // Icon well, loading arc and badge.
  vars["--ds-tabs-icon-padding"] = "var(--ds-spacing-1)";
  vars["--ds-tabs-icon-radius"] = "var(--ds-radius-sm)";
  vars["--ds-tabs-icon-bg"] = "color-mix(in srgb, var(--ds-color-text-primary) 5%, transparent)";
  vars["--ds-tabs-icon-bg-active"] = "color-mix(in srgb, var(--ds-color-primary) 10%, transparent)";
  vars["--ds-tabs-icon-color"] = "currentColor";
  vars["--ds-tabs-icon-shadow"] = "inset 0 0 0 1px color-mix(in srgb, var(--ds-color-border-subtle) 72%, transparent)";
  vars["--ds-tabs-icon-shadow-active"] = "inset 0 0 0 1px color-mix(in srgb, var(--ds-color-primary) 14%, transparent), 0 3px 8px color-mix(in srgb, var(--ds-color-primary) 8%, transparent)";
  vars["--ds-tabs-icon-transform-active"] = "translateY(var(--ds-tabs-item-lift))";
  vars["--ds-tabs-loading-size"] = "var(--ds-icon-sm-size)";
  vars["--ds-tabs-loading-stroke"] = "var(--ds-border-width-2)";
  vars["--ds-tabs-loading-track"] = "color-mix(in srgb, currentColor 22%, transparent)";
  vars["--ds-tabs-loading-color"] = "currentColor";
  vars["--ds-tabs-loading-duration"] = "var(--ds-motion-deliberate)";
  vars["--ds-tabs-badge-min-width"] = "var(--ds-spacing-4)";
  vars["--ds-tabs-badge-height"] = "var(--ds-spacing-4)";
  vars["--ds-tabs-badge-padding"] = "0 var(--ds-spacing-1)";
  vars["--ds-tabs-badge-radius"] = "var(--ds-radius-full)";
  vars["--ds-tabs-badge-border"] = "color-mix(in srgb, currentColor 16%, transparent)";
  vars["--ds-tabs-badge-border-active"] = "color-mix(in srgb, currentColor 22%, transparent)";
  vars["--ds-tabs-badge-bg"] = "color-mix(in srgb, var(--ds-color-text-primary) 7%, transparent)";
  vars["--ds-tabs-badge-bg-active"] = "color-mix(in srgb, currentColor 10%, transparent)";
  vars["--ds-tabs-badge-color"] = "var(--ds-color-text-secondary)";
  vars["--ds-tabs-badge-color-active"] = "currentColor";
  vars["--ds-tabs-badge-font-size"] = "var(--ds-type-caption-font-size)";
  vars["--ds-tabs-badge-font-weight"] = "var(--ds-font-weight-semibold)";
  vars["--ds-tabs-badge-keyline"] = "inset 0 1px 0 color-mix(in srgb, var(--ds-color-bg-elevated) 72%, transparent)";

  // The selection indicator: a hairline on the primary seed.
  vars["--ds-tabs-indicator-height"] = "var(--ds-border-width-2)";
  vars["--ds-tabs-indicator-gradient"] = "linear-gradient(90deg, color-mix(in srgb, var(--ds-color-primary) 68%, transparent), var(--ds-tab-border-active, var(--ds-color-primary)), color-mix(in srgb, var(--ds-color-primary) 68%, transparent))";
  vars["--ds-tabs-indicator-radius"] = "var(--ds-radius-full) var(--ds-radius-full) 0 0";
  vars["--ds-tabs-indicator-shadow"] = "none";
  vars["--ds-tabs-indicator-motion-duration"] = "var(--ds-motion-rearrange, var(--ds-motion-normal))";
  // The measured offset is runtime data: produced at the resting value the
  // skin's root arm declares, so the read lands on a root while the element
  // statement and the engine's measured overwrite still outrank this one.
  vars["--ds-tabs-indicator-offset"] = "var(--ds-spacing-0, 0px)";

  // Overflow controls on the raised material and the elevation scale.
  vars["--ds-tabs-overflow-control-size"] = "var(--ds-spacing-8)";
  vars["--ds-tabs-overflow-control-border"] = "var(--ds-color-border-subtle)";
  vars["--ds-tabs-overflow-control-bg"] = "var(--ds-surface-raised, var(--ds-surface-card))";
  vars["--ds-tabs-overflow-control-bg-hover"] = "var(--ds-surface-highlight, var(--ds-surface-raised))";
  vars["--ds-tabs-overflow-control-color"] = "var(--ds-color-text-secondary)";
  vars["--ds-tabs-overflow-control-shadow"] = "var(--ds-elevation-1)";
  vars["--ds-tabs-overflow-control-shadow-hover"] = "var(--ds-elevation-2)";

  // The panel, plain or contained.
  vars["--ds-tabs-panel-padding"] = "var(--ds-spacing-4, 16px) 0 0";
  vars["--ds-tabs-panel-gap"] = "var(--ds-spacing-3, 12px)";
  vars["--ds-tabs-panel-border"] = "var(--ds-color-border-subtle)";
  vars["--ds-tabs-panel-radius"] = "var(--ds-radius-lg)";
  vars["--ds-tabs-panel-bg"] = "var(--ds-surface-card)";
  vars["--ds-tabs-panel-shadow"] = "var(--ds-elevation-1)";
  vars["--ds-tabs-panel-texture"] = "linear-gradient(135deg, color-mix(in srgb, var(--ds-color-primary) 2.5%, transparent), transparent 42%)";
  vars["--ds-tabs-panel-highlight"] = "inset 0 1px 0 color-mix(in srgb, var(--ds-color-bg-elevated) 72%, transparent)";
  vars["--ds-tabs-panel-focus-ring"] = "var(--ds-focus-ring)";
  vars["--ds-tabs-panel-motion-duration"] = "var(--ds-motion-reveal)";
  vars["--ds-tabs-panel-motion-easing"] = "var(--ds-motion-ease-enter)";
  vars["--ds-tabs-panel-motion-distance"] = "calc(var(--ds-spacing-1) * var(--ds-motion-intensity))";
  vars["--ds-tabs-touch-target-min"] = "var(--ds-touch-target-min)";
  return vars;
}
