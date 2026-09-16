/**
 * @fileoverview The splitter family: the gutter rail, its grip, the tints it
 * wears while a boundary is being moved, and the panel share it distributes.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/chrome/splitter
 * @category Compilers
 * @package @rottay/design-system
 */

import type { FamilyDeriver } from "../../../../foundation/contract";

/** A vertical's own chrome outranks every relation stated here. */
export const splitterChromeDeriver: FamilyDeriver = {
  family: "splitter",
  rank: "derived",
  consumes: ["palette.*", "surfaces.*", "materials", "density", "motion.*"],
  produces: [
    "--ds-splitter-gutter-bg",
    "--ds-splitter-gutter-bg-dragging",
    "--ds-splitter-gutter-bg-hover",
    "--ds-splitter-gutter-focus-ring-offset",
    "--ds-splitter-gutter-grip-color",
    "--ds-splitter-gutter-grip-color-locked",
    "--ds-splitter-gutter-grip-length",
    "--ds-splitter-gutter-grip-thickness",
    "--ds-splitter-gutter-reach",
    "--ds-splitter-gutter-size",
    "--ds-splitter-gutter-transition-duration",
    "--ds-splitter-gutter-transition-timing",
    "--ds-splitter-panel-grow",
  ],
  derive: () => deriveSplitterChannels(),
};

/**
 * The rail sits on the material panel surface rather than the raw surface
 * channel: the raw one is the brand's dark chrome on some tenants, while the
 * material channel is the tenant-tuned content surface the panels beside it
 * already wear.
 *
 * `--ds-splitter-panel-grow` carries the resting equal share and the engine
 * overwrites it inline per panel, so a panel measured at runtime never needs a
 * second declaration path.
 *
 * The locked grip has its OWN channel: reading the live grip name with a
 * different fallback meant a tenant that set the grip colour silently erased
 * the distinction between an operable boundary and a locked one.
 */
export function deriveSplitterChannels(): Record<string, string> {
  const vars: Record<string, string> = {};
  const rail = "var(--ds-material-panel-background, var(--ds-surface-panel))";
  const tint = (percent: number) =>
    `color-mix(in srgb, var(--ds-color-primary) ${percent}%, ${rail})`;

  vars["--ds-splitter-gutter-bg"] = rail;
  vars["--ds-splitter-gutter-bg-hover"] = tint(30);
  vars["--ds-splitter-gutter-bg-dragging"] = tint(55);
  vars["--ds-splitter-gutter-grip-color"] =
    "color-mix(in srgb, var(--ds-color-text-primary) 32%, transparent)";
  vars["--ds-splitter-gutter-grip-color-locked"] =
    "color-mix(in srgb, var(--ds-color-text-primary) 16%, transparent)";
  vars["--ds-splitter-gutter-grip-length"] = "1rem";
  vars["--ds-splitter-gutter-grip-thickness"] = "2px";
  vars["--ds-splitter-gutter-size"] =
    "calc(0.5rem * var(--ds-density-effective-scale))";
  vars["--ds-splitter-gutter-focus-ring-offset"] = "1px";
  // Physical px on purpose: the coarse-pointer target is a hand, not a rem.
  vars["--ds-splitter-gutter-reach"] = "18px";
  vars["--ds-splitter-gutter-transition-duration"] = "var(--ds-motion-feedback)";
  vars["--ds-splitter-gutter-transition-timing"] = "var(--ds-motion-ease-out)";
  vars["--ds-splitter-panel-grow"] = "50";
  return vars;
}
