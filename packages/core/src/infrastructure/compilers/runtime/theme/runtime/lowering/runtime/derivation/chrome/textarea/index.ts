/**
 * @fileoverview The textarea family: its frame, surface and ink on the input
 * family's field grammar and the palette decisions, its inset on the density
 * plane, and its counter ink deepened toward the text role for contrast.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/chrome/textarea
 * @category Compilers
 * @package @rottay/design-system
 */

import type { FamilyDeriver } from "../../../../foundation/contract";

/** A vertical's own textarea chrome outranks every relation stated here. */
export const textareaChromeDeriver: FamilyDeriver = {
  family: "textarea",
  rank: "derived",
  consumes: ["palette.*", "surfaces.densityScale", "surfaces.materials"],
  produces: [
    "--ds-textarea-bg",
    "--ds-textarea-bg-disabled",
    "--ds-textarea-filled-bg",
    "--ds-textarea-readonly-bg",
    "--ds-textarea-color",
    "--ds-textarea-color-placeholder",
    "--ds-textarea-caret-color",
    "--ds-textarea-border",
    "--ds-textarea-border-hover",
    "--ds-textarea-border-focus",
    "--ds-textarea-shadow-focus",
    "--ds-textarea-error-border",
    "--ds-textarea-warning-border",
    "--ds-textarea-success-border",
    "--ds-textarea-error-bg",
    "--ds-textarea-warning-bg",
    "--ds-textarea-success-bg",
    "--ds-textarea-error-shadow-focus",
    "--ds-textarea-warning-shadow-focus",
    "--ds-textarea-success-shadow-focus",
    "--ds-textarea-sm-padding",
    "--ds-textarea-md-padding",
    "--ds-textarea-lg-padding",
    "--ds-textarea-clear-color",
    "--ds-textarea-clear-color-hover",
    "--ds-textarea-clear-bg-hover",
    "--ds-textarea-clear-border-hover",
    "--ds-textarea-count-color",
    "--ds-textarea-count-color-error",
    "--ds-textarea-count-color-warning",
    "--ds-textarea-grip-ink",
    "--ds-textarea-grip-ink-hover",
  ],
  derive: () => deriveTextareaChannels(),
};

export function deriveTextareaChannels(): Record<string, string> {
  const vars: Record<string, string> = {};
  vars["--ds-textarea-bg"] = "var(--ds-input-bg, var(--ds-material-control-background))";
  vars["--ds-textarea-bg-disabled"] = "var(--ds-material-control-background-disabled)";
  vars["--ds-textarea-filled-bg"] = "var(--ds-input-filled-bg, var(--ds-material-control-background-hover))";
  vars["--ds-textarea-readonly-bg"] = "var(--ds-input-readonly-bg, var(--ds-material-control-background-disabled))";
  vars["--ds-textarea-color"] = "var(--ds-color-text-primary)";
  vars["--ds-textarea-color-placeholder"] = "var(--ds-input-color-placeholder, var(--ds-color-text-muted))";
  vars["--ds-textarea-caret-color"] = "var(--ds-color-primary)";
  vars["--ds-textarea-border"] = "var(--ds-input-border, var(--ds-material-control-border))";
  vars["--ds-textarea-border-hover"] = "var(--ds-input-border-hover, var(--ds-material-control-border-hover))";
  vars["--ds-textarea-border-focus"] = "var(--ds-input-border-focus, var(--ds-color-primary))";
  vars["--ds-textarea-shadow-focus"] = "var(--ds-input-shadow-focus, var(--ds-focus-ring))";
  vars["--ds-textarea-error-border"] = "var(--ds-input-error-border, var(--ds-color-error))";
  vars["--ds-textarea-warning-border"] = "var(--ds-input-warning-border, var(--ds-color-warning))";
  vars["--ds-textarea-success-border"] = "var(--ds-input-success-border, var(--ds-color-success))";
  vars["--ds-textarea-error-bg"] = "var(--ds-input-error-bg, var(--ds-material-control-background))";
  vars["--ds-textarea-warning-bg"] = "var(--ds-input-warning-bg, var(--ds-material-control-background))";
  vars["--ds-textarea-success-bg"] = "var(--ds-input-success-bg, var(--ds-material-control-background))";
  vars["--ds-textarea-error-shadow-focus"] = "var(--ds-input-error-shadow-focus, var(--ds-focus-ring))";
  vars["--ds-textarea-warning-shadow-focus"] = "var(--ds-input-warning-shadow-focus, var(--ds-focus-ring))";
  vars["--ds-textarea-success-shadow-focus"] = "var(--ds-input-success-shadow-focus, var(--ds-focus-ring))";
  vars["--ds-textarea-sm-padding"] = "calc(var(--ds-spacing-1) * 1.5) var(--ds-spacing-2)";
  vars["--ds-textarea-md-padding"] = "var(--ds-spacing-2) var(--ds-spacing-3)";
  vars["--ds-textarea-lg-padding"] = "var(--ds-spacing-3) var(--ds-spacing-4)";
  vars["--ds-textarea-clear-color"] = "var(--ds-input-clear-color, var(--ds-color-text-muted))";
  vars["--ds-textarea-clear-color-hover"] = "var(--ds-input-clear-color-hover, var(--ds-color-text-primary))";
  vars["--ds-textarea-clear-bg-hover"] = "var(--ds-input-clear-bg-hover, var(--ds-material-control-background-hover))";
  vars["--ds-textarea-clear-border-hover"] = "var(--ds-input-clear-border-hover, var(--ds-material-control-border))";
  vars["--ds-textarea-count-color"] = "var(--ds-input-count-color, var(--ds-color-text-muted))";
  vars["--ds-textarea-count-color-error"] =
    "var(--ds-input-count-color-error, color-mix(in srgb, var(--ds-color-error) 78%, var(--ds-color-neutral-900) 22%))";
  vars["--ds-textarea-count-color-warning"] =
    "var(--ds-input-count-color-warning, color-mix(in srgb, var(--ds-color-warning) 55%, var(--ds-color-neutral-900) 45%))";
  vars["--ds-textarea-grip-ink"] = "color-mix(in srgb, var(--ds-color-text-muted) 62%, transparent)";
  vars["--ds-textarea-grip-ink-hover"] = "color-mix(in srgb, var(--ds-color-text-primary) 50%, transparent)";
  return vars;
}
