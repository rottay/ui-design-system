/**
 * @fileoverview The stepper family (the unified steps/stepper cut): a track of
 * status circles on the card material, the tenant's authored `--ds-steps-*`
 * roots chained ahead of the palette seeds, three size steps on the spacing
 * ramp and the type roles, the connector on the border ink, and every motion
 * on the intent cadences. Serves the engine track, the Step and Content
 * compounds and the deprecated Steps name alike.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/chrome/stepper
 * @category Compilers
 * @package @rottay/design-system
 */

import type { FamilyDeriver } from "../../../../foundation/contract";

/** A vertical's own stepper chrome outranks every relation stated here. */
export const stepperChromeDeriver: FamilyDeriver = {
  family: "stepper",
  rank: "derived",
  consumes: ["palette.*", "surfaces.materials", "surfaces.elevation", "surfaces.effects", "surfaces.radiusScale", "typography.roles", "typography.numeric", "states.focus", "states.press", "density", "motion"],
  produces: [
    "--ds-stepper-font-family",
    "--ds-stepper-motion-duration",
    "--ds-stepper-motion-easing",
    "--ds-stepper-item-size-sm",
    "--ds-stepper-item-size-md",
    "--ds-stepper-item-size-lg",
    "--ds-stepper-item-font-size-sm",
    "--ds-stepper-item-font-size-md",
    "--ds-stepper-item-font-size-lg",
    "--ds-stepper-label-font-size-sm",
    "--ds-stepper-label-font-size-md",
    "--ds-stepper-label-font-size-lg",
    "--ds-stepper-description-font-size-sm",
    "--ds-stepper-description-font-size-md",
    "--ds-stepper-description-font-size-lg",
    "--ds-stepper-dot-size",
    "--ds-stepper-item-gap",
    "--ds-stepper-item-radius",
    "--ds-stepper-item-bg",
    "--ds-stepper-item-color",
    "--ds-stepper-item-border",
    "--ds-stepper-item-font-weight",
    "--ds-stepper-numeric",
    "--ds-stepper-icon-border-width",
    "--ds-stepper-item-bg-process",
    "--ds-stepper-item-color-process",
    "--ds-stepper-item-border-process",
    "--ds-stepper-process-ring",
    "--ds-stepper-item-bg-finish",
    "--ds-stepper-item-color-finish",
    "--ds-stepper-item-border-finish",
    "--ds-stepper-item-bg-error",
    "--ds-stepper-item-color-error",
    "--ds-stepper-item-border-error",
    "--ds-stepper-item-color-process-simple",
    "--ds-stepper-circles-ring",
    "--ds-stepper-icon-color",
    "--ds-stepper-connector-width",
    "--ds-stepper-connector-clearance",
    "--ds-stepper-connector-color",
    "--ds-stepper-connector-color-active",
    "--ds-stepper-connector-min-length",
    "--ds-stepper-connector-inset",
    "--ds-stepper-connector-block-gap",
    "--ds-stepper-text-gap",
    "--ds-stepper-text-margin-block-start",
    "--ds-stepper-vertical-gap",
    "--ds-stepper-vertical-item-gap",
    "--ds-stepper-label-color",
    "--ds-stepper-label-color-process",
    "--ds-stepper-label-color-wait",
    "--ds-stepper-label-color-error",
    "--ds-stepper-label-color-hover",
    "--ds-stepper-label-font-weight",
    "--ds-stepper-label-font-weight-process",
    "--ds-stepper-label-line-height",
    "--ds-stepper-subtitle-color",
    "--ds-stepper-description-color",
    "--ds-stepper-description-line-height",
    "--ds-stepper-hover-lift",
    "--ds-stepper-hover-shadow",
    "--ds-stepper-pressed-transform",
    "--ds-stepper-focus-ring",
    "--ds-stepper-focus-ring-width",
    "--ds-stepper-disabled-opacity",
    "--ds-stepper-disabled-label-color",
    "--ds-stepper-disabled-description-color",
    "--ds-stepper-panel-slide-distance",
    "--ds-stepper-panel-motion-duration",
    "--ds-stepper-panel-motion-easing",
    "--ds-stepper-touch-target-min",
  ],
  derive: () => deriveStepperChannels(),
};

export function deriveStepperChannels(): Record<string, string> {
  const vars: Record<string, string> = {};

  // Type and motion: the body role for the track, the intent cadences for every transition.
  vars["--ds-stepper-font-family"] = "var(--ds-type-body-font-family)";
  vars["--ds-stepper-motion-duration"] = "var(--ds-motion-feedback)";
  vars["--ds-stepper-motion-easing"] = "var(--ds-motion-ease-standard)";

  // Three size steps on the spacing ramp and the type roles.
  vars["--ds-stepper-item-size-sm"] = "var(--ds-spacing-6)";
  vars["--ds-stepper-item-size-md"] = "var(--ds-spacing-8)";
  vars["--ds-stepper-item-size-lg"] = "var(--ds-spacing-10)";
  vars["--ds-stepper-item-font-size-sm"] = "var(--ds-type-caption-font-size)";
  vars["--ds-stepper-item-font-size-md"] = "var(--ds-type-supporting-font-size)";
  vars["--ds-stepper-item-font-size-lg"] = "var(--ds-type-body-font-size)";
  vars["--ds-stepper-label-font-size-sm"] = "var(--ds-type-supporting-font-size)";
  vars["--ds-stepper-label-font-size-md"] = "var(--ds-type-body-font-size)";
  vars["--ds-stepper-label-font-size-lg"] = "var(--ds-font-size-base)";
  vars["--ds-stepper-description-font-size-sm"] = "var(--ds-type-caption-font-size)";
  vars["--ds-stepper-description-font-size-md"] = "var(--ds-type-caption-font-size)";
  vars["--ds-stepper-description-font-size-lg"] = "var(--ds-type-supporting-font-size)";
  vars["--ds-stepper-dot-size"] = "var(--ds-spacing-2)";
  vars["--ds-stepper-item-gap"] = "var(--ds-spacing-3)";
  vars["--ds-stepper-item-radius"] = "var(--ds-radius-md)";

  // The circle at rest: the tenant's authored steps roots outrank the card material.
  vars["--ds-stepper-item-bg"] = "var(--ds-steps-wait-bg, var(--ds-steps-item-bg, var(--ds-card-bg, var(--ds-surface-card))))";
  vars["--ds-stepper-item-color"] = "var(--ds-steps-item-color, var(--ds-color-text-secondary))";
  vars["--ds-stepper-item-border"] = "var(--ds-steps-wait-border, var(--ds-color-border))";
  vars["--ds-stepper-item-font-weight"] = "var(--ds-font-weight-semibold)";
  vars["--ds-stepper-numeric"] = "tabular-nums";
  vars["--ds-stepper-icon-border-width"] = "var(--ds-border-width-2)";

  // Status paint: process fills with the primary seed, finish and error wash it.
  vars["--ds-stepper-item-bg-process"] = "var(--ds-steps-process-bg, var(--ds-steps-item-bg-active, var(--ds-color-primary)))";
  vars["--ds-stepper-item-color-process"] = "var(--ds-steps-item-color-active, var(--ds-color-text-on-primary))";
  vars["--ds-stepper-item-border-process"] = "var(--ds-steps-process-border, var(--ds-steps-item-bg-active, var(--ds-color-primary)))";
  vars["--ds-stepper-process-ring"] = "0 0 0 var(--ds-spacing-1) color-mix(in srgb, var(--ds-color-primary) 12%, transparent)";
  vars["--ds-stepper-item-bg-finish"] = "var(--ds-steps-finish-bg, color-mix(in srgb, var(--ds-color-primary) 10%, var(--ds-card-bg, var(--ds-surface-card))))";
  vars["--ds-stepper-item-color-finish"] = "var(--ds-color-primary)";
  vars["--ds-stepper-item-border-finish"] = "var(--ds-steps-finish-border, color-mix(in srgb, var(--ds-color-primary) 32%, var(--ds-color-border)))";
  vars["--ds-stepper-item-bg-error"] = "color-mix(in srgb, var(--ds-color-error) 8%, var(--ds-card-bg, var(--ds-surface-card)))";
  vars["--ds-stepper-item-color-error"] = "var(--ds-color-error)";
  vars["--ds-stepper-item-border-error"] = "color-mix(in srgb, var(--ds-color-error) 36%, var(--ds-color-border))";
  vars["--ds-stepper-item-color-process-simple"] = "var(--ds-color-primary)";
  vars["--ds-stepper-circles-ring"] = "0 0 0 calc(var(--ds-spacing-1) * 0.75) color-mix(in srgb, var(--ds-color-text-primary) 8%, transparent)";
  vars["--ds-stepper-icon-color"] = "var(--ds-color-text-secondary)";

  // The connector is a neutral hairline; finished and current steps ink it with the primary seed.
  vars["--ds-stepper-connector-width"] = "var(--ds-border-width-2)";
  vars["--ds-stepper-connector-clearance"] = "var(--ds-spacing-1)";
  vars["--ds-stepper-connector-color"] = "var(--ds-steps-connector-color, var(--ds-color-border-secondary))";
  vars["--ds-stepper-connector-color-active"] = "var(--ds-steps-connector-color-active, var(--ds-color-primary))";
  vars["--ds-stepper-connector-min-length"] = "var(--ds-spacing-8)";
  vars["--ds-stepper-connector-inset"] = "var(--ds-spacing-2)";
  vars["--ds-stepper-connector-block-gap"] = "var(--ds-spacing-1)";

  // The text column.
  vars["--ds-stepper-text-gap"] = "calc(var(--ds-spacing-1) / 2)";
  vars["--ds-stepper-text-margin-block-start"] = "var(--ds-spacing-2)";
  vars["--ds-stepper-vertical-gap"] = "var(--ds-spacing-3)";
  vars["--ds-stepper-vertical-item-gap"] = "var(--ds-spacing-4)";
  vars["--ds-stepper-label-color"] = "var(--ds-color-text-primary)";
  vars["--ds-stepper-label-color-process"] = "var(--ds-color-text-primary)";
  vars["--ds-stepper-label-color-wait"] = "var(--ds-steps-label-color-wait, var(--ds-color-text-secondary))";
  vars["--ds-stepper-label-color-error"] = "var(--ds-color-error)";
  vars["--ds-stepper-label-color-hover"] = "var(--ds-color-primary)";
  vars["--ds-stepper-label-font-weight"] = "var(--ds-font-weight-medium)";
  vars["--ds-stepper-label-font-weight-process"] = "var(--ds-font-weight-semibold)";
  vars["--ds-stepper-label-line-height"] = "var(--ds-type-body-line-height)";
  vars["--ds-stepper-subtitle-color"] = "var(--ds-color-text-tertiary)";
  vars["--ds-stepper-description-color"] = "var(--ds-color-text-secondary)";
  vars["--ds-stepper-description-line-height"] = "var(--ds-type-supporting-line-height)";

  // Interaction states: the lift and the press follow the motion and press dials, the ring the focus decision.
  vars["--ds-stepper-hover-lift"] = "calc(-1px * var(--ds-motion-intensity))";
  vars["--ds-stepper-hover-shadow"] = "var(--ds-elevation-1)";
  vars["--ds-stepper-pressed-transform"] = "translateY(0) scale(var(--ds-state-press-scale))";
  vars["--ds-stepper-focus-ring"] = "var(--ds-focus-ring)";
  vars["--ds-stepper-focus-ring-width"] = "var(--ds-focus-ring-width)";
  vars["--ds-stepper-disabled-opacity"] = "var(--ds-button-disabled-opacity)";
  vars["--ds-stepper-disabled-label-color"] = "var(--ds-color-text-secondary)";
  vars["--ds-stepper-disabled-description-color"] = "var(--ds-color-text-secondary)";

  // The content panels' slide and fade ride the rearrange cadence.
  vars["--ds-stepper-panel-slide-distance"] = "var(--ds-spacing-5)";
  vars["--ds-stepper-panel-motion-duration"] = "var(--ds-motion-normal)";
  vars["--ds-stepper-panel-motion-easing"] = "var(--ds-motion-ease-out)";
  vars["--ds-stepper-touch-target-min"] = "var(--ds-touch-target-min)";

  return vars;
}
