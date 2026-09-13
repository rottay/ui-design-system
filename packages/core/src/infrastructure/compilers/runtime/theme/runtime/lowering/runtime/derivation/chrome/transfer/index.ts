/**
 * @fileoverview The transfer family: its panels, header and rows on the panel
 * and control materials, its search field on the input grammar, and its inks and
 * focus on the palette and focus decisions.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/chrome/transfer
 * @category Compilers
 * @package @rottay/design-system
 */

import type { FamilyDeriver } from "../../../../foundation/contract";

/** A vertical's own transfer chrome outranks every relation stated here. */
export const transferChromeDeriver: FamilyDeriver = {
  family: "transfer",
  rank: "derived",
  consumes: ["palette.*", "surfaces.materials", "typography.roles", "states.focus"],
  produces: [
    "--ds-transfer-bg",
    "--ds-transfer-border",
    "--ds-transfer-header-bg",
    "--ds-transfer-header-border",
    "--ds-transfer-ink",
    "--ds-transfer-meta-ink",
    "--ds-transfer-icon-ink",
    "--ds-transfer-remove-ink",
    "--ds-transfer-focus-ink",
    "--ds-transfer-search-bg",
    "--ds-transfer-search-border",
    "--ds-transfer-search-border-focus",
    "--ds-transfer-search-shadow-focus",
    "--ds-transfer-search-placeholder-color",
    "--ds-transfer-item-bg-hover",
    "--ds-transfer-item-bg-selected",
    "--ds-transfer-button-bg-hover",
    "--ds-transfer-control-bg-active",
  ],
  derive: () => deriveTransferChannels(),
};

export function deriveTransferChannels(): Record<string, string> {
  const vars: Record<string, string> = {};
  vars["--ds-transfer-bg"] = "transparent";
  vars["--ds-transfer-border"] = "var(--ds-color-border)";
  vars["--ds-transfer-header-bg"] = "var(--ds-material-inset-background)";
  vars["--ds-transfer-header-border"] = "var(--ds-color-border)";
  vars["--ds-transfer-ink"] = "var(--ds-color-text-primary)";
  vars["--ds-transfer-meta-ink"] = "var(--ds-color-text-secondary)";
  vars["--ds-transfer-icon-ink"] = "var(--ds-color-text-muted)";
  vars["--ds-transfer-remove-ink"] = "var(--ds-color-text-tertiary)";
  vars["--ds-transfer-focus-ink"] = "var(--ds-focus-ring-color, var(--ds-color-primary))";
  vars["--ds-transfer-search-bg"] = "var(--ds-input-bg, var(--ds-material-control-background))";
  vars["--ds-transfer-search-border"] = "var(--ds-color-border)";
  vars["--ds-transfer-search-border-focus"] = "var(--ds-color-primary)";
  vars["--ds-transfer-search-shadow-focus"] = "var(--ds-input-shadow-focus, var(--ds-focus-ring))";
  vars["--ds-transfer-search-placeholder-color"] = "var(--ds-input-color-placeholder, var(--ds-type-color-muted))";
  vars["--ds-transfer-item-bg-hover"] = "var(--ds-material-inset-background)";
  vars["--ds-transfer-item-bg-selected"] = "color-mix(in srgb, var(--ds-color-primary) 8%, transparent)";
  vars["--ds-transfer-button-bg-hover"] = "var(--ds-button-ghost-bg-hover, var(--ds-material-inset-background))";
  vars["--ds-transfer-control-bg-active"] = "var(--ds-surface-highlight)";
  return vars;
}
