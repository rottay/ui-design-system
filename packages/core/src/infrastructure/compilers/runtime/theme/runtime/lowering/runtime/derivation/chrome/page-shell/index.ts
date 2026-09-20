/**
 * @fileoverview The `page-shell` family: the page identity panel's ground,
 * frame, sheen and radius, its identity tile corner, the supporting measure
 * and the opt-in glass channel of the actions cluster.
 *
 * @remarks
 * Every produced value is the single chained fallback its skin reads it with,
 * so producing the name changes WHO can reach the value, not what it rests at.
 *
 * The family states ONE spelling, `--ds-page-shell-*`, and reads a second it
 * does not own. `--ds-page-header-*` is a genuine cross-owner group:
 * `collection-header`'s own deriver states `--ds-collection-header-overline-size`,
 * `-overline-tracking`, `-overline-case` and both title measures as reads
 * THROUGH it, `skin/detail-header`, `skin/edit-fields` and `skin/card-compounds`
 * read its case channel, and all three first-party artifacts compile it. The six
 * panel channels this family used to state under that prefix were not part of
 * that group: `skin/page-shell` was their only reader anywhere, and no app or
 * showroom file read or wrote one, so WO-FAM-11 sub-lot C moved them to
 * `--ds-page-shell-header-*`. What is left under `--ds-page-header-*` is exactly
 * what is shared.
 *
 * The names of that group are read here and deliberately NOT produced, each for
 * a measured reason:
 *
 * - `--ds-page-header-bg` is already authored at `profile` rank by the
 *   expressive `contour` motif. A `derived` producer outranks a profile, so
 *   producing it would silently retire that motif's page-header treatment.
 * - `--ds-page-header-eyebrow-size` (10px here), `-eyebrow-tracking` (0.11em),
 *   `-title-max-width` (32ch) and `-subtitle-max-width` (72ch) have a SECOND
 *   correct rest: `collection-header` reads each one through to
 *   `var(--ds-font-size-xs, 12px)`, `0.13em`, `35rem` / `42.5rem` and `45rem`.
 *   One name, two rests — producing either silently repaints the other family.
 *
 * `palette.*` and `motion` are NOT claimed. The browser probes measured that
 * neither plane reaches a channel this deriver states: the panel's ground is
 * the card-header chain, its arrive animation rests on `--ds-motion-calm`, and
 * both stayed put under a seeded primary and a 1.35 duration scale. The
 * keypaths left `consumes` rather than the claim standing unproven.
 *
 * `--ds-page-shell-max-width` is not here either: it is a per-instance value
 * the engine writes on the shell root from the caller's `maxWidth`, and the
 * skin declares its rest. `--ds-workspace-card-icon-bg` / `-border` / `-color`
 * are the shared workspace-card tenant group that `cockpit-header`,
 * `workbench-header` and `surface-chrome` read with the same fallbacks; they
 * belong to that owner and are routed, not invented here.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/chrome/page-shell
 * @category Compilers
 * @package @rottay/design-system
 */

import type { FamilyDeriver } from "../../../../foundation/contract";

/** A vertical's own page-shell chrome outranks every relation stated here. */
export const pageShellChromeDeriver: FamilyDeriver = {
  family: "page-shell",
  rank: "derived",
  consumes: ["surfaces.*", "shape.*"],
  produces: [
    // The identity panel
    "--ds-page-shell-header-radius",
    "--ds-page-shell-header-shadow",
    "--ds-page-shell-header-shadow-hover",
    "--ds-page-shell-header-sheen-opacity",
    "--ds-page-shell-header-sheen-duration",
    // The identity tile
    "--ds-page-shell-header-icon-radius",
    // The actions cluster's opt-in glass
    "--ds-page-shell-actions-backdrop",
  ],
  derive: () => derivePageShellChannels(),
};

export function derivePageShellChannels(): Record<string, string> {
  const vars: Record<string, string> = {};

  // The panel is a card-shaped surface: the shape ramp's largest corner, the
  // toolbar's elevation at rest and the next rung under the pointer.
  vars["--ds-page-shell-header-radius"] = "var(--ds-radius-xl)";
  vars["--ds-page-shell-header-shadow"] = "var(--ds-toolbar-shadow, var(--ds-elevation-1))";
  vars["--ds-page-shell-header-shadow-hover"] = "var(--ds-elevation-2)";

  // The ambient sheen: a quiet wash on a long loop, never a signal.
  vars["--ds-page-shell-header-sheen-opacity"] = "0.28";
  vars["--ds-page-shell-header-sheen-duration"] = "14s";

  // The identity tile sits one corner rung below the panel it lives in.
  vars["--ds-page-shell-header-icon-radius"] = "var(--ds-radius-lg)";

  // Glass on the actions cluster is opt-in: a default-ON blur taxes every
  // scroll frame, so the rest is no filter at all.
  vars["--ds-page-shell-actions-backdrop"] = "none";

  return vars;
}
