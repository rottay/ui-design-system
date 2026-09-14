/**
 * @fileoverview The alert family (callout folded in): its surface on the tint
 * ramps, the palette and the elevation scale, its title and copy on the label
 * and supporting roles, and its dismiss on the press and focus decisions.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/chrome/alert
 * @category Compilers
 * @package @rottay/design-system
 */

import type { FamilyDeriver } from "../../../../foundation/contract";

/** A vertical's own alert chrome outranks every relation stated here. */
export const alertChromeDeriver: FamilyDeriver = {
  family: "alert",
  rank: "derived",
  consumes: ["palette.*", "surfaces.elevation", "surfaces.effects", "typography.roles", "states.focus"],
  produces: [
    "--ds-alert-color",
    "--ds-alert-texture",
    "--ds-alert-shadow",
    "--ds-alert-keyline",
    "--ds-alert-title-color",
    "--ds-alert-title-font-family",
    "--ds-alert-title-font-size",
    "--ds-alert-title-font-weight",
    "--ds-alert-title-urgent-font-weight",
    "--ds-alert-title-line-height",
    "--ds-alert-title-letter-spacing",
    "--ds-alert-description-color",
    "--ds-alert-description-font-family",
    "--ds-alert-description-font-size",
    "--ds-alert-description-line-height",
    "--ds-alert-well-keyline",
    "--ds-alert-close-color",
    "--ds-alert-close-color-hover",
    "--ds-alert-close-bg",
    "--ds-alert-close-shadow",
    "--ds-alert-press-scale",
    "--ds-alert-focus-ring",
    "--ds-alert-actions-bg",
    "--ds-alert-info-ink",
    "--ds-alert-info-wash",
    "--ds-alert-info-wash-subtle",
    "--ds-alert-info-well",
    "--ds-alert-info-edge",
    "--ds-alert-info-well-edge",
    "--ds-alert-info-control-edge",
    "--ds-alert-info-control-edge-hover",
    "--ds-alert-success-ink",
    "--ds-alert-success-wash",
    "--ds-alert-success-wash-subtle",
    "--ds-alert-success-well",
    "--ds-alert-success-edge",
    "--ds-alert-success-well-edge",
    "--ds-alert-success-control-edge",
    "--ds-alert-success-control-edge-hover",
    "--ds-alert-warning-ink",
    "--ds-alert-warning-wash",
    "--ds-alert-warning-wash-subtle",
    "--ds-alert-warning-well",
    "--ds-alert-warning-edge",
    "--ds-alert-warning-well-edge",
    "--ds-alert-warning-control-edge",
    "--ds-alert-warning-control-edge-hover",
    "--ds-alert-error-ink",
    "--ds-alert-error-wash",
    "--ds-alert-error-wash-subtle",
    "--ds-alert-error-well",
    "--ds-alert-error-edge",
    "--ds-alert-error-well-edge",
    "--ds-alert-error-control-edge",
    "--ds-alert-error-control-edge-hover",
  ],
  derive: () => deriveAlertChannels(),
};

export function deriveAlertChannels(): Record<string, string> {
  const vars: Record<string, string> = {};
  vars["--ds-alert-color"] = "var(--ds-color-text-primary)";
  vars["--ds-alert-texture"] = "var(--ds-gradient-surface)";
  vars["--ds-alert-shadow"] = "var(--ds-elevation-1)";
  vars["--ds-alert-keyline"] = "inset 0 1px 0 color-mix(in srgb, var(--ds-color-text-on-primary) calc(35% * var(--ds-effect-intensity)), transparent)";
  vars["--ds-alert-title-color"] = "var(--ds-color-text-primary)";
  vars["--ds-alert-title-font-family"] = "var(--ds-type-label-font-family)";
  vars["--ds-alert-title-font-size"] = "var(--ds-type-label-font-size)";
  vars["--ds-alert-title-font-weight"] = "var(--ds-font-weight-semibold)";
  vars["--ds-alert-title-urgent-font-weight"] = "var(--ds-font-weight-bold)";
  vars["--ds-alert-title-line-height"] = "var(--ds-type-label-line-height)";
  vars["--ds-alert-title-letter-spacing"] = "var(--ds-letter-spacing-heading)";
  vars["--ds-alert-description-color"] = "var(--ds-color-text-secondary)";
  vars["--ds-alert-description-font-family"] = "var(--ds-type-supporting-font-family)";
  vars["--ds-alert-description-font-size"] = "var(--ds-type-supporting-font-size)";
  vars["--ds-alert-description-line-height"] = "var(--ds-type-supporting-line-height)";
  vars["--ds-alert-well-keyline"] = "inset 0 1px 0 color-mix(in srgb, var(--ds-color-text-on-primary) calc(48% * var(--ds-effect-intensity)), transparent)";
  vars["--ds-alert-close-color"] = "var(--ds-color-text-secondary)";
  vars["--ds-alert-close-color-hover"] = "var(--ds-color-text-primary)";
  vars["--ds-alert-close-bg"] = "color-mix(in srgb, var(--ds-color-bg-elevated) 86%, transparent)";
  vars["--ds-alert-close-shadow"] = "var(--ds-shadow-xs)";
  vars["--ds-alert-press-scale"] = "var(--ds-state-press-scale)";
  vars["--ds-alert-focus-ring"] = "var(--ds-focus-ring)";
  vars["--ds-alert-actions-bg"] = "color-mix(in srgb, var(--ds-color-bg-elevated) 60%, transparent)";
  vars["--ds-alert-info-ink"] = "var(--ds-color-info-ink)";
  vars["--ds-alert-info-wash"] = "var(--ds-tint-info-8)";
  vars["--ds-alert-info-wash-subtle"] = "var(--ds-tint-info-4)";
  vars["--ds-alert-info-well"] = "color-mix(in srgb, var(--ds-color-info) 11%, var(--ds-color-bg-elevated))";
  vars["--ds-alert-info-edge"] = "color-mix(in srgb, var(--ds-color-info) 30%, var(--ds-color-border))";
  vars["--ds-alert-info-well-edge"] = "color-mix(in srgb, var(--ds-color-info) 34%, var(--ds-color-border))";
  vars["--ds-alert-info-control-edge"] = "color-mix(in srgb, var(--ds-color-info) 26%, var(--ds-color-border))";
  vars["--ds-alert-info-control-edge-hover"] = "color-mix(in srgb, var(--ds-color-info) 45%, var(--ds-color-border))";
  vars["--ds-alert-success-ink"] = "var(--ds-color-success-ink)";
  vars["--ds-alert-success-wash"] = "var(--ds-tint-success-8)";
  vars["--ds-alert-success-wash-subtle"] = "var(--ds-tint-success-4)";
  vars["--ds-alert-success-well"] = "color-mix(in srgb, var(--ds-color-success) 11%, var(--ds-color-bg-elevated))";
  vars["--ds-alert-success-edge"] = "color-mix(in srgb, var(--ds-color-success) 30%, var(--ds-color-border))";
  vars["--ds-alert-success-well-edge"] = "color-mix(in srgb, var(--ds-color-success) 34%, var(--ds-color-border))";
  vars["--ds-alert-success-control-edge"] = "color-mix(in srgb, var(--ds-color-success) 26%, var(--ds-color-border))";
  vars["--ds-alert-success-control-edge-hover"] = "color-mix(in srgb, var(--ds-color-success) 45%, var(--ds-color-border))";
  vars["--ds-alert-warning-ink"] = "var(--ds-color-warning-ink)";
  vars["--ds-alert-warning-wash"] = "var(--ds-tint-warning-8)";
  vars["--ds-alert-warning-wash-subtle"] = "var(--ds-tint-warning-4)";
  vars["--ds-alert-warning-well"] = "color-mix(in srgb, var(--ds-color-warning) 11%, var(--ds-color-bg-elevated))";
  vars["--ds-alert-warning-edge"] = "color-mix(in srgb, var(--ds-color-warning) 30%, var(--ds-color-border))";
  vars["--ds-alert-warning-well-edge"] = "color-mix(in srgb, var(--ds-color-warning) 34%, var(--ds-color-border))";
  vars["--ds-alert-warning-control-edge"] = "color-mix(in srgb, var(--ds-color-warning) 26%, var(--ds-color-border))";
  vars["--ds-alert-warning-control-edge-hover"] = "color-mix(in srgb, var(--ds-color-warning) 45%, var(--ds-color-border))";
  vars["--ds-alert-error-ink"] = "var(--ds-color-error-ink)";
  vars["--ds-alert-error-wash"] = "var(--ds-tint-error-8)";
  vars["--ds-alert-error-wash-subtle"] = "var(--ds-tint-error-4)";
  vars["--ds-alert-error-well"] = "color-mix(in srgb, var(--ds-color-error) 11%, var(--ds-color-bg-elevated))";
  vars["--ds-alert-error-edge"] = "color-mix(in srgb, var(--ds-color-error) 30%, var(--ds-color-border))";
  vars["--ds-alert-error-well-edge"] = "color-mix(in srgb, var(--ds-color-error) 34%, var(--ds-color-border))";
  vars["--ds-alert-error-control-edge"] = "color-mix(in srgb, var(--ds-color-error) 26%, var(--ds-color-border))";
  vars["--ds-alert-error-control-edge-hover"] = "color-mix(in srgb, var(--ds-color-error) 45%, var(--ds-color-border))";
  return vars;
}
