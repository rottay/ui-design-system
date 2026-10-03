/**
 * @fileoverview The input family: its caret, selection and loading ink on the
 * palette decisions, its rest depth on the control material, its focus ring on
 * the focus decision, and its counter and placeholder on the type roles.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/chrome/input
 * @category Compilers
 * @package @rottay/design-system
 */

import type { FlatTheme } from "@/foundation/contracts/composition/tenants/themes";
import type { FamilyDeriver } from "../../../../foundation/contract";

/** A vertical's own input chrome outranks every relation stated here. */
export const inputChromeDeriver: FamilyDeriver = {
  family: "input",
  rank: "derived",
  consumes: [
    "palette.*",
    "surfaces.materials",
    "typography.roles",
    "typography.roleWeights",
    "states.focus",
    "chrome.controls.input.shadowFocus",
    "chrome.controls.input.errorShadowFocus",
    "chrome.controls.input.warningShadowFocus",
    "chrome.controls.input.successShadowFocus",
  ],
  produces: [
    "--ds-input-caret-color",
    "--ds-input-selection-bg",
    "--ds-input-loading-color",
    "--ds-input-filled-border",
    "--ds-input-shadow-rest",
    "--ds-input-focus-ring",
    "--ds-input-focus-ring-error",
    "--ds-input-focus-ring-warning",
    "--ds-input-focus-ring-success",
    "--ds-input-color-placeholder",
    "--ds-input-count-color",
    "--ds-input-count-limit-font-weight",
  ],
  derive: (context) => deriveInputChannels(context.theme),
};

export function deriveInputChannels(theme?: FlatTheme): Record<string, string> {
  const vars: Record<string, string> = {};
  vars["--ds-input-caret-color"] = "var(--ds-color-primary)";
  vars["--ds-input-selection-bg"] = "color-mix(in srgb, var(--ds-color-primary) 20%, transparent)";
  vars["--ds-input-loading-color"] = "var(--ds-color-primary)";
  vars["--ds-input-filled-border"] = "transparent";
  vars["--ds-input-shadow-rest"] = "var(--ds-material-control-shadow)";
  // The halo the frozen engines read is referenced only when a theme states it.
  const input = theme?.chrome?.controls?.input;
  vars["--ds-input-focus-ring"] = input?.shadowFocus
    ? "var(--ds-input-shadow-focus)"
    : "var(--ds-focus-ring)";
  vars["--ds-input-focus-ring-error"] = statusRing(input?.errorShadowFocus, "error");
  vars["--ds-input-focus-ring-warning"] = statusRing(input?.warningShadowFocus, "warning");
  vars["--ds-input-focus-ring-success"] = statusRing(input?.successShadowFocus, "success");
  vars["--ds-input-color-placeholder"] = "var(--ds-type-color-muted)";
  vars["--ds-input-count-color"] = "var(--ds-type-color-muted)";
  vars["--ds-input-count-limit-font-weight"] = "var(--ds-type-label-font-weight)";
  return vars;
}

/**
 * The frozen engines read the `--ds-input-*-shadow-focus` halos directly, so each
 * is referenced only when a theme states it and its default never reaches Modern.
 */
function statusRing(authored: string | undefined, status: "error" | "warning" | "success"): string {
  return authored ? `var(--ds-input-${status}-shadow-focus)` : "var(--ds-input-focus-ring)";
}
