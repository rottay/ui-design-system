/**
 * @fileoverview The notifier family: every announcement role's surface on the
 * overlay material and the elevation scale, its title and copy on the label,
 * supporting and body roles, its controls on the control material and the
 * focus decisions, and each tone's accent, ink, wash and edges on the palette
 * and the tint ramps.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/chrome/notifier
 * @category Compilers
 * @package @rottay/design-system
 */

import type { FamilyDeriver } from "../../../../foundation/contract";

/** A vertical's own notification and message chrome outranks every relation stated here. */
export const notifierChromeDeriver: FamilyDeriver = {
  family: "notifier",
  rank: "derived",
  consumes: ["palette.*", "surfaces.materials", "surfaces.elevation", "surfaces.effects", "typography.roles", "states.focus", "states.press"],
  produces: [
    "--ds-notifier-toast-bg",
    "--ds-notifier-toast-shadow",
    "--ds-notifier-notification-bg",
    "--ds-notifier-notification-shadow",
    "--ds-notifier-message-bg",
    "--ds-notifier-message-shadow",
    "--ds-notifier-notification-title-color",
    "--ds-notifier-message-close-color",
    "--ds-notifier-message-close-color-hover",
    "--ds-notifier-color",
    "--ds-notifier-description-color",
    "--ds-notifier-border-color",
    "--ds-notifier-title-font-family",
    "--ds-notifier-title-font-size",
    "--ds-notifier-title-font-weight",
    "--ds-notifier-title-urgent-font-weight",
    "--ds-notifier-title-line-height",
    "--ds-notifier-title-letter-spacing",
    "--ds-notifier-description-font-family",
    "--ds-notifier-description-font-size",
    "--ds-notifier-description-line-height",
    "--ds-notifier-message-font-size",
    "--ds-notifier-message-font-weight",
    "--ds-notifier-message-urgent-font-weight",
    "--ds-notifier-close-color",
    "--ds-notifier-close-color-hover",
    "--ds-notifier-control-color",
    "--ds-notifier-control-bg",
    "--ds-notifier-control-bg-hover",
    "--ds-notifier-control-border",
    "--ds-notifier-control-shadow-hover",
    "--ds-notifier-control-font-size",
    "--ds-notifier-control-font-weight",
    "--ds-notifier-press-scale",
    "--ds-notifier-focus-ring",
    "--ds-notifier-well-keyline",
    "--ds-notifier-clickable-shadow-hover",
    "--ds-notifier-gradient-bg",
    "--ds-notifier-gradient-color",
    "--ds-notifier-gradient-edge",
    "--ds-notifier-gradient-well",
    "--ds-notifier-spinner-track",
    "--ds-notifier-spinner-head",
    "--ds-notifier-neutral-accent",
    "--ds-notifier-neutral-ink",
    "--ds-notifier-neutral-wash",
    "--ds-notifier-neutral-well",
    "--ds-notifier-neutral-edge",
    "--ds-notifier-neutral-edge-strong",
    "--ds-notifier-neutral-well-edge",
    "--ds-notifier-neutral-rule",
    "--ds-notifier-neutral-lifetime",
    "--ds-notifier-primary-accent",
    "--ds-notifier-primary-ink",
    "--ds-notifier-primary-wash",
    "--ds-notifier-primary-well",
    "--ds-notifier-primary-edge",
    "--ds-notifier-primary-edge-strong",
    "--ds-notifier-primary-well-edge",
    "--ds-notifier-primary-rule",
    "--ds-notifier-primary-lifetime",
    "--ds-notifier-secondary-accent",
    "--ds-notifier-secondary-ink",
    "--ds-notifier-secondary-wash",
    "--ds-notifier-secondary-well",
    "--ds-notifier-secondary-edge",
    "--ds-notifier-secondary-edge-strong",
    "--ds-notifier-secondary-well-edge",
    "--ds-notifier-secondary-rule",
    "--ds-notifier-secondary-lifetime",
    "--ds-notifier-info-accent",
    "--ds-notifier-info-ink",
    "--ds-notifier-info-wash",
    "--ds-notifier-info-well",
    "--ds-notifier-info-edge",
    "--ds-notifier-info-edge-strong",
    "--ds-notifier-info-well-edge",
    "--ds-notifier-info-rule",
    "--ds-notifier-info-lifetime",
    "--ds-notifier-success-accent",
    "--ds-notifier-success-ink",
    "--ds-notifier-success-wash",
    "--ds-notifier-success-well",
    "--ds-notifier-success-edge",
    "--ds-notifier-success-edge-strong",
    "--ds-notifier-success-well-edge",
    "--ds-notifier-success-rule",
    "--ds-notifier-success-lifetime",
    "--ds-notifier-warning-accent",
    "--ds-notifier-warning-ink",
    "--ds-notifier-warning-wash",
    "--ds-notifier-warning-well",
    "--ds-notifier-warning-edge",
    "--ds-notifier-warning-edge-strong",
    "--ds-notifier-warning-well-edge",
    "--ds-notifier-warning-rule",
    "--ds-notifier-warning-lifetime",
    "--ds-notifier-error-accent",
    "--ds-notifier-error-ink",
    "--ds-notifier-error-wash",
    "--ds-notifier-error-well",
    "--ds-notifier-error-edge",
    "--ds-notifier-error-edge-strong",
    "--ds-notifier-error-well-edge",
    "--ds-notifier-error-rule",
    "--ds-notifier-error-lifetime",
    "--ds-notifier-loading-accent",
    "--ds-notifier-loading-ink",
    "--ds-notifier-loading-wash",
    "--ds-notifier-loading-well",
    "--ds-notifier-loading-edge",
    "--ds-notifier-loading-edge-strong",
    "--ds-notifier-loading-well-edge",
    "--ds-notifier-loading-rule",
    "--ds-notifier-loading-lifetime",
  ],
  derive: () => deriveNotifierChannels(),
};

export function deriveNotifierChannels(): Record<string, string> {
  const vars: Record<string, string> = {};
  vars["--ds-notifier-toast-bg"] = "var(--ds-material-overlay-background)";
  vars["--ds-notifier-toast-shadow"] = "var(--ds-elevation-3)";
  vars["--ds-notifier-notification-bg"] = "var(--ds-material-overlay-background)";
  vars["--ds-notifier-notification-shadow"] = "var(--ds-elevation-3)";
  vars["--ds-notifier-message-bg"] = "var(--ds-material-overlay-background)";
  vars["--ds-notifier-message-shadow"] = "var(--ds-elevation-3)";
  vars["--ds-notifier-notification-title-color"] = "var(--ds-color-text-primary)";
  vars["--ds-notifier-message-close-color"] = "var(--ds-color-text-secondary)";
  vars["--ds-notifier-message-close-color-hover"] = "var(--ds-color-text-primary)";
  vars["--ds-notifier-color"] = "var(--ds-color-text-primary)";
  vars["--ds-notifier-description-color"] = "var(--ds-color-text-secondary)";
  vars["--ds-notifier-border-color"] = "var(--ds-color-border-subtle)";
  vars["--ds-notifier-title-font-family"] = "var(--ds-type-label-font-family)";
  vars["--ds-notifier-title-font-size"] = "var(--ds-type-label-font-size)";
  vars["--ds-notifier-title-font-weight"] = "var(--ds-font-weight-semibold)";
  vars["--ds-notifier-title-urgent-font-weight"] = "var(--ds-font-weight-bold)";
  vars["--ds-notifier-title-line-height"] = "var(--ds-type-label-line-height)";
  vars["--ds-notifier-title-letter-spacing"] = "var(--ds-letter-spacing-heading)";
  vars["--ds-notifier-description-font-family"] = "var(--ds-type-supporting-font-family)";
  vars["--ds-notifier-description-font-size"] = "var(--ds-type-supporting-font-size)";
  vars["--ds-notifier-description-line-height"] = "var(--ds-type-supporting-line-height)";
  vars["--ds-notifier-message-font-size"] = "var(--ds-type-body-font-size)";
  vars["--ds-notifier-message-font-weight"] = "var(--ds-font-weight-medium)";
  vars["--ds-notifier-message-urgent-font-weight"] = "var(--ds-font-weight-semibold)";
  vars["--ds-notifier-close-color"] = "var(--ds-color-text-secondary)";
  vars["--ds-notifier-close-color-hover"] = "var(--ds-color-text-primary)";
  vars["--ds-notifier-control-color"] = "var(--ds-color-text-primary)";
  vars["--ds-notifier-control-bg"] = "color-mix(in srgb, var(--ds-material-overlay-background) 82%, transparent)";
  vars["--ds-notifier-control-bg-hover"] = "var(--ds-material-control-background-hover)";
  vars["--ds-notifier-control-border"] = "var(--ds-color-border-subtle)";
  vars["--ds-notifier-control-shadow-hover"] = "var(--ds-elevation-1)";
  vars["--ds-notifier-control-font-size"] = "var(--ds-type-label-font-size)";
  vars["--ds-notifier-control-font-weight"] = "var(--ds-type-label-font-weight)";
  vars["--ds-notifier-press-scale"] = "var(--ds-state-press-scale)";
  vars["--ds-notifier-focus-ring"] = "var(--ds-focus-ring)";
  vars["--ds-notifier-well-keyline"] = "inset 0 1px 0 color-mix(in srgb, var(--ds-color-text-on-primary) calc(56% * var(--ds-effect-intensity)), transparent)";
  vars["--ds-notifier-clickable-shadow-hover"] = "var(--ds-elevation-4)";
  vars["--ds-notifier-gradient-bg"] = "linear-gradient(135deg, var(--ds-color-primary), var(--ds-color-secondary))";
  vars["--ds-notifier-gradient-color"] = "var(--ds-color-text-on-primary)";
  vars["--ds-notifier-gradient-edge"] = "color-mix(in srgb, var(--ds-color-text-on-primary) 28%, transparent)";
  vars["--ds-notifier-gradient-well"] = "color-mix(in srgb, var(--ds-color-text-on-primary) 14%, transparent)";
  vars["--ds-notifier-spinner-track"] = "var(--ds-color-border)";
  vars["--ds-notifier-spinner-head"] = "var(--ds-color-primary)";
  vars["--ds-notifier-neutral-accent"] = "var(--ds-color-primary)";
  vars["--ds-notifier-neutral-ink"] = "var(--ds-color-primary)";
  vars["--ds-notifier-neutral-wash"] = "var(--ds-tint-8)";
  vars["--ds-notifier-neutral-well"] = "var(--ds-tint-12)";
  vars["--ds-notifier-neutral-edge"] = "color-mix(in srgb, var(--ds-color-primary) 30%, var(--ds-color-border-subtle))";
  vars["--ds-notifier-neutral-edge-strong"] = "color-mix(in srgb, var(--ds-color-primary) 40%, var(--ds-color-border-subtle))";
  vars["--ds-notifier-neutral-well-edge"] = "color-mix(in srgb, var(--ds-color-primary) 26%, var(--ds-color-border-subtle))";
  vars["--ds-notifier-neutral-rule"] = "color-mix(in srgb, var(--ds-color-primary) 16%, var(--ds-color-border-subtle))";
  vars["--ds-notifier-neutral-lifetime"] = "color-mix(in srgb, var(--ds-color-primary) 74%, transparent)";
  vars["--ds-notifier-primary-accent"] = "var(--ds-color-primary)";
  vars["--ds-notifier-primary-ink"] = "var(--ds-color-primary)";
  vars["--ds-notifier-primary-wash"] = "var(--ds-tint-8)";
  vars["--ds-notifier-primary-well"] = "var(--ds-tint-12)";
  vars["--ds-notifier-primary-edge"] = "color-mix(in srgb, var(--ds-color-primary) 30%, var(--ds-color-border-subtle))";
  vars["--ds-notifier-primary-edge-strong"] = "color-mix(in srgb, var(--ds-color-primary) 40%, var(--ds-color-border-subtle))";
  vars["--ds-notifier-primary-well-edge"] = "color-mix(in srgb, var(--ds-color-primary) 26%, var(--ds-color-border-subtle))";
  vars["--ds-notifier-primary-rule"] = "color-mix(in srgb, var(--ds-color-primary) 16%, var(--ds-color-border-subtle))";
  vars["--ds-notifier-primary-lifetime"] = "color-mix(in srgb, var(--ds-color-primary) 74%, transparent)";
  vars["--ds-notifier-secondary-accent"] = "var(--ds-color-secondary)";
  vars["--ds-notifier-secondary-ink"] = "var(--ds-color-secondary)";
  vars["--ds-notifier-secondary-wash"] = "color-mix(in srgb, var(--ds-color-secondary) 10%, var(--ds-color-bg-primary))";
  vars["--ds-notifier-secondary-well"] = "color-mix(in srgb, var(--ds-color-secondary) 11%, var(--ds-color-bg-primary))";
  vars["--ds-notifier-secondary-edge"] = "color-mix(in srgb, var(--ds-color-secondary) 30%, var(--ds-color-border-subtle))";
  vars["--ds-notifier-secondary-edge-strong"] = "color-mix(in srgb, var(--ds-color-secondary) 40%, var(--ds-color-border-subtle))";
  vars["--ds-notifier-secondary-well-edge"] = "color-mix(in srgb, var(--ds-color-secondary) 26%, var(--ds-color-border-subtle))";
  vars["--ds-notifier-secondary-rule"] = "color-mix(in srgb, var(--ds-color-secondary) 16%, var(--ds-color-border-subtle))";
  vars["--ds-notifier-secondary-lifetime"] = "color-mix(in srgb, var(--ds-color-secondary) 74%, transparent)";
  vars["--ds-notifier-info-accent"] = "var(--ds-color-info)";
  vars["--ds-notifier-info-ink"] = "var(--ds-color-info-ink)";
  vars["--ds-notifier-info-wash"] = "var(--ds-tint-info-8)";
  vars["--ds-notifier-info-well"] = "var(--ds-tint-info-12)";
  vars["--ds-notifier-info-edge"] = "color-mix(in srgb, var(--ds-color-info) 30%, var(--ds-color-border-subtle))";
  vars["--ds-notifier-info-edge-strong"] = "color-mix(in srgb, var(--ds-color-info) 40%, var(--ds-color-border-subtle))";
  vars["--ds-notifier-info-well-edge"] = "color-mix(in srgb, var(--ds-color-info) 26%, var(--ds-color-border-subtle))";
  vars["--ds-notifier-info-rule"] = "color-mix(in srgb, var(--ds-color-info) 16%, var(--ds-color-border-subtle))";
  vars["--ds-notifier-info-lifetime"] = "color-mix(in srgb, var(--ds-color-info) 74%, transparent)";
  vars["--ds-notifier-success-accent"] = "var(--ds-color-success)";
  vars["--ds-notifier-success-ink"] = "var(--ds-color-success-ink)";
  vars["--ds-notifier-success-wash"] = "var(--ds-tint-success-8)";
  vars["--ds-notifier-success-well"] = "var(--ds-tint-success-12)";
  vars["--ds-notifier-success-edge"] = "color-mix(in srgb, var(--ds-color-success) 30%, var(--ds-color-border-subtle))";
  vars["--ds-notifier-success-edge-strong"] = "color-mix(in srgb, var(--ds-color-success) 40%, var(--ds-color-border-subtle))";
  vars["--ds-notifier-success-well-edge"] = "color-mix(in srgb, var(--ds-color-success) 26%, var(--ds-color-border-subtle))";
  vars["--ds-notifier-success-rule"] = "color-mix(in srgb, var(--ds-color-success) 16%, var(--ds-color-border-subtle))";
  vars["--ds-notifier-success-lifetime"] = "color-mix(in srgb, var(--ds-color-success) 74%, transparent)";
  vars["--ds-notifier-warning-accent"] = "var(--ds-color-warning)";
  vars["--ds-notifier-warning-ink"] = "var(--ds-color-warning-ink)";
  vars["--ds-notifier-warning-wash"] = "var(--ds-tint-warning-8)";
  vars["--ds-notifier-warning-well"] = "var(--ds-tint-warning-12)";
  vars["--ds-notifier-warning-edge"] = "color-mix(in srgb, var(--ds-color-warning) 30%, var(--ds-color-border-subtle))";
  vars["--ds-notifier-warning-edge-strong"] = "color-mix(in srgb, var(--ds-color-warning) 40%, var(--ds-color-border-subtle))";
  vars["--ds-notifier-warning-well-edge"] = "color-mix(in srgb, var(--ds-color-warning) 26%, var(--ds-color-border-subtle))";
  vars["--ds-notifier-warning-rule"] = "color-mix(in srgb, var(--ds-color-warning) 16%, var(--ds-color-border-subtle))";
  vars["--ds-notifier-warning-lifetime"] = "color-mix(in srgb, var(--ds-color-warning) 74%, transparent)";
  vars["--ds-notifier-error-accent"] = "var(--ds-color-error)";
  vars["--ds-notifier-error-ink"] = "var(--ds-color-error-ink)";
  vars["--ds-notifier-error-wash"] = "var(--ds-tint-error-8)";
  vars["--ds-notifier-error-well"] = "var(--ds-tint-error-12)";
  vars["--ds-notifier-error-edge"] = "color-mix(in srgb, var(--ds-color-error) 30%, var(--ds-color-border-subtle))";
  vars["--ds-notifier-error-edge-strong"] = "color-mix(in srgb, var(--ds-color-error) 40%, var(--ds-color-border-subtle))";
  vars["--ds-notifier-error-well-edge"] = "color-mix(in srgb, var(--ds-color-error) 26%, var(--ds-color-border-subtle))";
  vars["--ds-notifier-error-rule"] = "color-mix(in srgb, var(--ds-color-error) 16%, var(--ds-color-border-subtle))";
  vars["--ds-notifier-error-lifetime"] = "color-mix(in srgb, var(--ds-color-error) 74%, transparent)";
  vars["--ds-notifier-loading-accent"] = "var(--ds-color-primary)";
  vars["--ds-notifier-loading-ink"] = "var(--ds-color-primary)";
  vars["--ds-notifier-loading-wash"] = "var(--ds-tint-8)";
  vars["--ds-notifier-loading-well"] = "var(--ds-tint-8)";
  vars["--ds-notifier-loading-edge"] = "color-mix(in srgb, var(--ds-color-primary) 30%, var(--ds-color-border-subtle))";
  vars["--ds-notifier-loading-edge-strong"] = "color-mix(in srgb, var(--ds-color-primary) 40%, var(--ds-color-border-subtle))";
  vars["--ds-notifier-loading-well-edge"] = "color-mix(in srgb, var(--ds-color-primary) 26%, var(--ds-color-border-subtle))";
  vars["--ds-notifier-loading-rule"] = "color-mix(in srgb, var(--ds-color-primary) 16%, var(--ds-color-border-subtle))";
  vars["--ds-notifier-loading-lifetime"] = "color-mix(in srgb, var(--ds-color-primary) 74%, transparent)";
  return vars;
}
