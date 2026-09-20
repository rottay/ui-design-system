/**
 * @fileoverview The collapse family: the size rungs its header and content
 * wear, the affordances around the toggle, and the pressed and focus states the
 * skin paints.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/chrome/collapse
 * @category Compilers
 * @package @rottay/design-system
 */

import type { FamilyDeriver } from "../../../../foundation/contract";

/** A vertical's own chrome outranks every relation stated here. */
export const collapseChromeDeriver: FamilyDeriver = {
  family: "collapse",
  rank: "derived",
  consumes: [
    "palette.*",
    "surfaces.radiusScale",
    "surfaces.focusStyle",
    "surfaces.borderStyle",
    "spacing.rhythm",
    "density",
    "motion.dial",
  ],
  produces: [
    "--ds-collapse-arrow-focus-ring-radius",
    "--ds-collapse-arrow-hover-color",
    "--ds-collapse-arrow-motion-duration",
    "--ds-collapse-arrow-motion-easing",
    "--ds-collapse-content-lg-idle-padding-x",
    "--ds-collapse-content-lg-idle-padding-y",
    "--ds-collapse-content-sm-idle-padding-x",
    "--ds-collapse-content-sm-idle-padding-y",
    "--ds-collapse-content-surface",
    "--ds-collapse-extra-margin-inline-start",
    "--ds-collapse-header-default-pressed-bg",
    "--ds-collapse-header-expanded-ink",
    "--ds-collapse-header-focus-ring-radius",
    "--ds-collapse-header-gap",
    "--ds-collapse-header-lg-idle-padding-x",
    "--ds-collapse-header-lg-idle-padding-y",
    "--ds-collapse-header-sm-idle-padding-x",
    "--ds-collapse-header-sm-idle-padding-y",
    "--ds-collapse-panel-surface",
    "--ds-collapse-root-default-idle-border-width",
    "--ds-collapse-reveal-motion-duration",
    "--ds-collapse-reveal-motion-easing",
    "--ds-collapse-state-motion-duration",
    "--ds-collapse-touch-target-min",
  ],
  derive: () => deriveCollapseChannels(),
};

/**
 * Only the channels the Modern skin READ WITHOUT ANY PRODUCER are minted here.
 * The family's structural constants keep their single declaration in
 * `presentation/components/collapse` -- the card precedent -- and the values
 * below are the exact fallbacks the skin was carrying inline, so no engine's
 * resolved paint moves; what changes is that a decision can now reach them.
 *
 * The size rungs ride the spacing ramp, which already carries density at the
 * token layer, instead of the bare pixel literals the fallbacks spelled: the
 * skin multiplies each rung by the density scale exactly once, and the ramp
 * steps chosen here are the ones those literals were approximating.
 *
 * MOTION IS MINTED, NOT BORROWED. The Modern skin used to time itself from
 * `--ds-collapse-transition-{duration,timing}`, which the shared
 * `presentation/components/collapse` recipe pins at a literal `0.2s` /
 * `cubic-bezier(0.4, 0, 0.2, 1)` for the FROZEN classic path's bridge. A
 * literal that the frozen engine owns cannot answer the motion dial, and
 * re-pointing it would move classic's paint. The Modern path takes its own
 * names off the semantic motion ramp instead -- the ramp the dial scales --
 * so the dial reaches the reveal while the frozen channel keeps its value.
 *
 * THE TWO SURFACES ARE MODE-AWARE NOW. Every other channel the recipe declares
 * rides a ramp that flips with the mode; exactly two resolved to
 * `--ds-color-white`, a literal that does not -- the panel behind the whole
 * family and the content area inside it. In dark mode that painted a white
 * card under ink the mode HAD flipped (neutral-700 on #ffffff reads about
 * 1.6:1). The recipe keeps both declarations byte-identical, because the
 * frozen bridge reads one of them; Modern reads the two names below instead.
 *
 * The expanded header's ink is the third. The recipe spells it
 * `--ds-color-primary-600`: a fixed step of the brand ramp, which on a
 * monochrome brand is near-black (rottay: #0a0a0a) while the header ground
 * `--ds-color-neutral-50` DOES flip with the mode (#0b1220 dark). Measured
 * together they read 1.05:1 -- an expanded header label that vanishes. The
 * emphasis is kept as a tint OF the mode's own ink, so it can never be
 * brighter or darker than the ground it sits on.
 */
export function deriveCollapseChannels(): Record<string, string> {
  const vars: Record<string, string> = {};

  vars["--ds-collapse-header-sm-idle-padding-x"] = "var(--ds-spacing-3)";
  vars["--ds-collapse-header-sm-idle-padding-y"] = "var(--ds-spacing-2)";
  vars["--ds-collapse-header-lg-idle-padding-x"] = "var(--ds-spacing-5)";
  vars["--ds-collapse-header-lg-idle-padding-y"] = "var(--ds-spacing-4)";
  vars["--ds-collapse-content-sm-idle-padding-x"] = "var(--ds-spacing-3)";
  vars["--ds-collapse-content-sm-idle-padding-y"] = "var(--ds-spacing-3)";
  vars["--ds-collapse-content-lg-idle-padding-x"] = "var(--ds-spacing-5)";
  vars["--ds-collapse-content-lg-idle-padding-y"] = "var(--ds-spacing-5)";

  // The panel is the family's card; the content area sits on it rather than
  // painting a second surface over it.
  vars["--ds-collapse-panel-surface"] =
    "var(--ds-material-card-background, var(--ds-surface-card))";
  vars["--ds-collapse-content-surface"] = "transparent";

  vars["--ds-collapse-header-gap"] = "var(--ds-spacing-2)";
  vars["--ds-collapse-extra-margin-inline-start"] = "var(--ds-spacing-2)";
  vars["--ds-collapse-touch-target-min"] = "var(--ds-touch-target-min)";

  // The reveal is one motion (track + inner fade); the header's state change
  // and the arrow's turn are feedback, which is the shorter rung.
  vars["--ds-collapse-reveal-motion-duration"] = "var(--ds-motion-reveal)";
  vars["--ds-collapse-reveal-motion-easing"] = "var(--ds-motion-ease-out)";
  vars["--ds-collapse-state-motion-duration"] = "var(--ds-motion-feedback)";
  vars["--ds-collapse-arrow-motion-duration"] = "var(--ds-motion-feedback)";
  vars["--ds-collapse-arrow-motion-easing"] = "var(--ds-motion-ease-out)";

  vars["--ds-collapse-header-focus-ring-radius"] = "var(--ds-radius-md)";
  vars["--ds-collapse-arrow-focus-ring-radius"] = "var(--ds-radius-sm)";
  vars["--ds-collapse-arrow-hover-color"] = "var(--ds-color-primary)";
  vars["--ds-collapse-header-expanded-ink"] =
    "color-mix(in srgb, var(--ds-color-primary) 35%, var(--ds-color-text-primary))";
  // `--ds-color-bg-active` is consumed-but-undefined, so the pressed surface
  // takes the card-paired mix one step deeper than hover rather than a name
  // nothing writes.
  vars["--ds-collapse-header-default-pressed-bg"] =
    "color-mix(in srgb, var(--ds-color-primary) 7%, var(--ds-card-bg, var(--ds-surface-card)))";

  // A bordered panel wears a keyline, so it reads hairline: the one edge role
  // resting at the component default's 1px in every vertical.
  vars["--ds-collapse-root-default-idle-border-width"] =
    "var(--ds-edge-hairline-width)";
  return vars;
}
