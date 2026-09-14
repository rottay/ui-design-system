/**
 * @fileoverview The toggle family (Switch is its deprecated name): its track on
 * the palette and state decisions, its thumb on the elevation decision, its
 * supporting text on the caption type role, and the corner of both track and
 * thumb on the silhouette decision -- a pill until a tenant states otherwise.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/chrome/toggle
 * @category Compilers
 * @package @rottay/design-system
 */

import type { BrandSurfaces } from "@/foundation/contracts/composition/tenants/themes";

import type { FamilyDeriver } from "../../../../foundation/contract";

const TRACK = "var(--ds-toggle-track-bg, var(--ds-color-border-secondary))";

/**
 * The switch is a pill by identity, so the corner follows the silhouette only
 * when a tenant STATES one: reading the button channel unconditionally would
 * hand the switch a vertical's authored button corner nobody asked it for.
 */
const PILL = "var(--ds-radius-full)";
const SILHOUETTE = "var(--ds-radius-button, var(--ds-radius-full))";

/** A vertical's own toggle chrome outranks every relation stated here. */
export const toggleChromeDeriver: FamilyDeriver = {
  family: "toggle",
  rank: "derived",
  consumes: [
    "palette.*",
    "surfaces.buttonStyle",
    "surfaces.stateEmphasis",
    "surfaces.elevation",
    "typography.roles",
  ],
  produces: [
    "--ds-toggle-track-border-radius",
    "--ds-toggle-dot-border-radius",
    "--ds-toggle-track-bg",
    "--ds-toggle-track-bg-checked",
    "--ds-toggle-track-bg-hover",
    "--ds-toggle-track-bg-active",
    "--ds-toggle-hover-shift",
    "--ds-toggle-error-track-bg",
    "--ds-toggle-dot-shadow",
    "--ds-toggle-label-color",
    "--ds-toggle-error-label-color",
    "--ds-toggle-state-label-color",
    "--ds-toggle-state-label-font-size",
    "--ds-toggle-state-label-line-height",
    "--ds-toggle-description-color",
    "--ds-toggle-description-font-size",
    "--ds-toggle-description-line-height",
    "--ds-toggle-loading-arc-color",
    "--ds-toggle-loading-track-color",
  ],
  derive: (context) => deriveToggleChannels(context.theme.surfaces?.buttonStyle),
};

export function deriveToggleChannels(
  buttonStyle?: BrandSurfaces["buttonStyle"]
): Record<string, string> {
  const vars: Record<string, string> = {};
  // Track and thumb turn together, or the thumb misfits its own well.
  const corner = buttonStyle ? SILHOUETTE : PILL;
  vars["--ds-toggle-track-border-radius"] = corner;
  vars["--ds-toggle-dot-border-radius"] = corner;
  vars["--ds-toggle-track-bg"] = "var(--ds-color-border-secondary)";
  vars["--ds-toggle-track-bg-checked"] = "var(--ds-color-primary)";
  vars["--ds-toggle-track-bg-hover"] = `color-mix(in srgb, ${TRACK}, var(--ds-color-text-primary) var(--ds-state-hover-shift))`;
  vars["--ds-toggle-track-bg-active"] = `color-mix(in srgb, ${TRACK}, var(--ds-color-text-primary) var(--ds-state-active-shift))`;
  vars["--ds-toggle-hover-shift"] = "var(--ds-state-hover-shift)";
  vars["--ds-toggle-error-track-bg"] = "var(--ds-color-error)";
  vars["--ds-toggle-dot-shadow"] = "var(--ds-elevation-1)";
  vars["--ds-toggle-label-color"] = "var(--ds-color-text-primary)";
  vars["--ds-toggle-error-label-color"] = "var(--ds-color-error-ink)";
  vars["--ds-toggle-state-label-color"] = "var(--ds-type-color-muted)";
  vars["--ds-toggle-state-label-font-size"] = "var(--ds-type-caption-font-size)";
  vars["--ds-toggle-state-label-line-height"] = "var(--ds-type-caption-line-height)";
  vars["--ds-toggle-description-color"] = "var(--ds-type-color-muted)";
  vars["--ds-toggle-description-font-size"] = "var(--ds-type-caption-font-size)";
  vars["--ds-toggle-description-line-height"] = "var(--ds-type-caption-line-height)";
  vars["--ds-toggle-loading-arc-color"] = "var(--ds-color-primary)";
  vars["--ds-toggle-loading-track-color"] = "var(--ds-color-border-secondary)";
  return vars;
}
