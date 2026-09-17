/**
 * @fileoverview The avatar family: its tone fills on the palette's own seeds
 * mixed toward the deep neutral, its inks on the inverse text role, the
 * surplus corner on the full radius, the focus ring on the foundation ring,
 * the hover and press transforms on the family's scale dials, and the initials
 * tracking on the letter-spacing step.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/chrome/avatar
 * @category Compilers
 * @package @rottay/design-system
 */

import type { FamilyDeriver } from "../../../../foundation/contract";

/** A vertical's own avatar chrome outranks every relation stated here. */
export const avatarChromeDeriver: FamilyDeriver = {
  family: "avatar",
  rank: "derived",
  consumes: ["palette.*", "surfaces.radiusScale", "surfaces.focusStyle", "typography.roles", "motion.*"],
  produces: [
    "--ds-avatar-primary-solid-bg",
    "--ds-avatar-secondary-solid-bg",
    "--ds-avatar-success-solid-bg",
    "--ds-avatar-warning-solid-bg",
    "--ds-avatar-error-solid-bg",
    "--ds-avatar-primary-ink",
    "--ds-avatar-secondary-ink",
    "--ds-avatar-success-ink",
    "--ds-avatar-warning-ink",
    "--ds-avatar-error-ink",
    "--ds-avatar-group-surplus-radius",
    "--ds-avatar-focus-ring",
    "--ds-avatar-hover-transform",
    "--ds-avatar-press-transform",
    "--ds-avatar-initials-tracking",
  ],
  derive: () => deriveAvatarChannels(),
};

export function deriveAvatarChannels(): Record<string, string> {
  const vars: Record<string, string> = {};

  // A tone tile carries its seed mixed toward the deep neutral, so the ink on
  // top clears the contrast floor at every seed a tenant can author.
  vars["--ds-avatar-primary-solid-bg"] = "var(--ds-color-primary)";
  vars["--ds-avatar-secondary-solid-bg"] =
    "color-mix(in srgb, var(--ds-color-secondary) 82%, var(--ds-color-neutral-900) 18%)";
  vars["--ds-avatar-success-solid-bg"] =
    "color-mix(in srgb, var(--ds-color-success) 62%, var(--ds-color-neutral-900) 38%)";
  vars["--ds-avatar-warning-solid-bg"] =
    "color-mix(in srgb, var(--ds-color-warning) 55%, var(--ds-color-neutral-900) 45%)";
  vars["--ds-avatar-error-solid-bg"] =
    "color-mix(in srgb, var(--ds-color-error) 78%, var(--ds-color-neutral-900) 22%)";

  vars["--ds-avatar-primary-ink"] = "var(--ds-color-primary-foreground, var(--ds-color-text-inverse))";
  vars["--ds-avatar-secondary-ink"] = "var(--ds-color-white)";
  vars["--ds-avatar-success-ink"] = "var(--ds-color-white)";
  vars["--ds-avatar-warning-ink"] = "var(--ds-color-white)";
  vars["--ds-avatar-error-ink"] = "var(--ds-color-white)";

  vars["--ds-avatar-group-surplus-radius"] = "var(--ds-radius-full)";

  // The ring is the foundation's, offset over the tile's own ground.
  vars["--ds-avatar-focus-ring"] =
    "0 0 0 var(--ds-avatar-focus-ring-offset) var(--ds-surface-card-bg, var(--ds-color-bg-elevated)),"
    + " 0 0 0 calc(var(--ds-avatar-focus-ring-offset) + var(--ds-avatar-focus-ring-width))"
    + " var(--ds-avatar-focus-ring-color, var(--ds-color-primary-500, var(--ds-color-primary)))";

  vars["--ds-avatar-hover-transform"] = "scale(var(--ds-avatar-hover-scale))";
  vars["--ds-avatar-press-transform"] = "scale(var(--ds-avatar-active-scale))";
  vars["--ds-avatar-initials-tracking"] = "var(--ds-letter-spacing-wide, 0.025em)";

  return vars;
}
