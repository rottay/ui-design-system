/**
 * @fileoverview The otp-input family: its slot frame, surface and focus on the
 * input family's field grammar and the palette decisions, and its error ink
 * deepened toward the text role so small text clears contrast.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/chrome/otp-input
 * @category Compilers
 * @package @rottay/design-system
 */

import type { FamilyDeriver } from "../../../../foundation/contract";

/** A vertical's own otp-input chrome outranks every relation stated here. */
export const otpInputChromeDeriver: FamilyDeriver = {
  family: "otp-input",
  rank: "derived",
  consumes: ["palette.*", "surfaces.materials"],
  produces: [
    "--ds-otp-input-slot-bg",
    "--ds-otp-input-slot-bg-error",
    "--ds-otp-input-slot-color",
    "--ds-otp-input-caret-color",
    "--ds-otp-input-slot-border",
    "--ds-otp-input-slot-border-hover",
    "--ds-otp-input-slot-border-filled",
    "--ds-otp-input-filled-keyline",
    "--ds-otp-input-slot-border-focus",
    "--ds-otp-input-slot-border-error",
    "--ds-otp-input-slot-shadow-focus",
    "--ds-otp-input-slot-shadow-focus-error",
    "--ds-otp-input-error-ink",
  ],
  derive: () => deriveOtpInputChannels(),
};

export function deriveOtpInputChannels(): Record<string, string> {
  const vars: Record<string, string> = {};
  vars["--ds-otp-input-slot-bg"] = "var(--ds-input-bg, var(--ds-material-control-background))";
  vars["--ds-otp-input-slot-bg-error"] =
    "var(--ds-input-error-bg, color-mix(in srgb, var(--ds-color-error) 6%, var(--ds-input-bg, var(--ds-material-control-background))))";
  vars["--ds-otp-input-slot-color"] = "var(--ds-color-text-primary)";
  vars["--ds-otp-input-caret-color"] = "var(--ds-color-primary)";
  vars["--ds-otp-input-slot-border"] = "var(--ds-input-border, var(--ds-material-control-border))";
  vars["--ds-otp-input-slot-border-hover"] = "var(--ds-input-border-hover, var(--ds-material-control-border-hover))";
  vars["--ds-otp-input-slot-border-filled"] = "var(--ds-material-control-border-strong)";
  vars["--ds-otp-input-filled-keyline"] = "var(--ds-material-control-border-strong)";
  vars["--ds-otp-input-slot-border-focus"] = "var(--ds-input-border-focus, var(--ds-color-primary))";
  vars["--ds-otp-input-slot-border-error"] = "var(--ds-color-error)";
  vars["--ds-otp-input-slot-shadow-focus"] = "var(--ds-input-shadow-focus, var(--ds-focus-ring))";
  vars["--ds-otp-input-slot-shadow-focus-error"] = "var(--ds-input-error-shadow-focus, var(--ds-focus-ring))";
  vars["--ds-otp-input-error-ink"] = "color-mix(in srgb, var(--ds-color-error) 70%, var(--ds-color-text-primary) 30%)";
  return vars;
}
