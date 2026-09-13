/**
 * @fileoverview The password-input family: its field ground on the input
 * surface, and its strength meter on the palette and status seeds.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/chrome/password-input
 * @category Compilers
 * @package @rottay/design-system
 */

import type { FamilyDeriver } from "../../../../foundation/contract";

/** A vertical's own password-input chrome outranks every relation stated here. */
export const passwordInputChromeDeriver: FamilyDeriver = {
  family: "password-input",
  rank: "derived",
  consumes: ["palette.*"],
  produces: [
    "--ds-password-input-bg",
    "--ds-password-input-strength-track-bg",
    "--ds-password-input-strength-weak",
    "--ds-password-input-strength-fair",
    "--ds-password-input-strength-good",
    "--ds-password-input-strength-strong",
    "--ds-password-input-strength-label-color",
    "--ds-password-input-error-ink",
  ],
  derive: () => derivePasswordInputChannels(),
};

export function derivePasswordInputChannels(): Record<string, string> {
  const vars: Record<string, string> = {};
  vars["--ds-password-input-bg"] = "var(--ds-input-bg)";
  vars["--ds-password-input-strength-track-bg"] = "var(--ds-surface-inset)";
  vars["--ds-password-input-strength-weak"] = "var(--ds-color-error)";
  vars["--ds-password-input-strength-fair"] = "var(--ds-color-warning)";
  vars["--ds-password-input-strength-good"] = "var(--ds-color-primary)";
  vars["--ds-password-input-strength-strong"] = "var(--ds-color-success)";
  vars["--ds-password-input-strength-label-color"] = "var(--ds-color-text-secondary)";
  vars["--ds-password-input-error-ink"] = "var(--ds-color-error-ink)";
  return vars;
}
