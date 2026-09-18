/**
 * @fileoverview The header contract's channels: the six shared tones and the back
 * chip's focus ring, produced once for every header family that consumes them.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/chrome/header
 * @category Compilers
 * @package @rottay/design-system
 *
 * @remarks
 * These channels belong to the header CONTRACT, not to `form-header` or to
 * `edit-header`. Two derivers may not name the same channel at one rank, and a tone
 * that one family derived and the other copied is the duplication this cut exists to
 * remove — so the shared paint has one producer, exactly as it has one skin file
 * (`skin/header-hero-shared/index.css`) and one resolver
 * (`structures/foundation/chrome/runtime/header-tone`).
 *
 * The values are the retired `getVariantTone` recipe, unchanged to the percentage.
 * Each is the single fallback its skin reads it with, so the contract test can prove
 * byte-equality rather than assert it.
 */

import type { FamilyDeriver } from "../../../../foundation/contract";

/** A vertical's own header chrome outranks every relation stated here. */
export const headerChromeDeriver: FamilyDeriver = {
  family: "header",
  rank: "derived",
  consumes: [
    "palette.*",
    "surfaces.focusStyle",
    "states.*",
  ],
  produces: [
    "--ds-header-back-focus-ring",
    "--ds-header-tone-error-bd",
    "--ds-header-tone-error-bg",
    "--ds-header-tone-error-fg",
    "--ds-header-tone-info-bd",
    "--ds-header-tone-info-bg",
    "--ds-header-tone-info-fg",
    "--ds-header-tone-primary-bd",
    "--ds-header-tone-primary-bg",
    "--ds-header-tone-primary-fg",
    "--ds-header-tone-secondary-bd",
    "--ds-header-tone-secondary-bg",
    "--ds-header-tone-secondary-fg",
    "--ds-header-tone-success-bd",
    "--ds-header-tone-success-bg",
    "--ds-header-tone-success-fg",
    "--ds-header-tone-warning-bd",
    "--ds-header-tone-warning-bg",
    "--ds-header-tone-warning-fg",
  ],
  derive: () => deriveHeaderChannels(),
};

/**
 * The `secondary` tone is the only one that does not mix a status hue: it is the
 * resting chrome, so it reads the secondary surface, border and text roles whole.
 * The other five are the same three mixes over their own hue.
 */
export function deriveHeaderChannels(): Record<string, string> {
  const vars: Record<string, string> = {};

  vars["--ds-header-tone-secondary-bg"] =
    "color-mix(in srgb, var(--ds-color-bg-secondary) 92%, transparent)";
  vars["--ds-header-tone-secondary-bd"] = "var(--ds-color-border-secondary)";
  vars["--ds-header-tone-secondary-fg"] = "var(--ds-color-text-secondary)";

  vars["--ds-header-tone-primary-bg"] =
    "color-mix(in srgb, var(--ds-color-primary) 10%, var(--ds-color-bg-secondary) 90%)";
  vars["--ds-header-tone-primary-bd"] =
    "color-mix(in srgb, var(--ds-color-primary) 18%, var(--ds-color-border-secondary) 82%)";
  vars["--ds-header-tone-primary-fg"] =
    "color-mix(in srgb, var(--ds-color-primary) 78%, var(--ds-color-text-primary) 22%)";

  vars["--ds-header-tone-success-bg"] =
    "color-mix(in srgb, var(--ds-color-success) 10%, var(--ds-color-bg-secondary) 90%)";
  vars["--ds-header-tone-success-bd"] =
    "color-mix(in srgb, var(--ds-color-success) 18%, var(--ds-color-border-secondary) 82%)";
  vars["--ds-header-tone-success-fg"] =
    "color-mix(in srgb, var(--ds-color-success) 78%, var(--ds-color-text-primary) 22%)";

  vars["--ds-header-tone-warning-bg"] =
    "color-mix(in srgb, var(--ds-color-warning) 10%, var(--ds-color-bg-secondary) 90%)";
  vars["--ds-header-tone-warning-bd"] =
    "color-mix(in srgb, var(--ds-color-warning) 18%, var(--ds-color-border-secondary) 82%)";
  vars["--ds-header-tone-warning-fg"] =
    "color-mix(in srgb, var(--ds-color-warning) 78%, var(--ds-color-text-primary) 22%)";

  vars["--ds-header-tone-info-bg"] =
    "color-mix(in srgb, var(--ds-color-info) 10%, var(--ds-color-bg-secondary) 90%)";
  vars["--ds-header-tone-info-bd"] =
    "color-mix(in srgb, var(--ds-color-info) 18%, var(--ds-color-border-secondary) 82%)";
  vars["--ds-header-tone-info-fg"] =
    "color-mix(in srgb, var(--ds-color-info) 78%, var(--ds-color-text-primary) 22%)";

  vars["--ds-header-tone-error-bg"] =
    "color-mix(in srgb, var(--ds-color-error) 10%, var(--ds-color-bg-secondary) 90%)";
  vars["--ds-header-tone-error-bd"] =
    "color-mix(in srgb, var(--ds-color-error) 18%, var(--ds-color-border-secondary) 82%)";
  vars["--ds-header-tone-error-fg"] =
    "color-mix(in srgb, var(--ds-color-error) 78%, var(--ds-color-text-primary) 22%)";

  vars["--ds-header-back-focus-ring"] =
    "var(--ds-focus-ring, 0 0 0 3px color-mix(in srgb, var(--ds-color-primary) 24%, transparent))";

  return vars;
}
