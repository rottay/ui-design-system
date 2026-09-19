/**
 * @fileoverview The `workspace-shell` family: the continuous workspace
 * surface's ground, frame, elevation and wash, plus the atmospheric field's
 * two particle colours and the two ramps that fade each canvas out.
 *
 * @remarks
 * Every produced value is the single chained fallback its skin reads it with,
 * so producing the name changes WHO can reach the value, not what it rests at.
 *
 * The field channels are new in WO-FAM-11 sub-lot C. They were a `color=` prop
 * string and four `color-mix()` template literals in TypeScript — two of them
 * the family-cut gate's only BLOCKING visual literals in the whole shell cut.
 * They are stated here rather than declared on the shell root, because a
 * `--ds-workspace-shell-*` declaration ON the root outranks the inherited
 * tenant artifact and would close the only door a white label has to them; the
 * skin keeps the same values as terminal `var()` fallbacks so the paint
 * survives with no producer at all.
 *
 * `--ds-workspace-shell-bg` / `-border` / `-overlay` / `-shadow` are NOT
 * produced, and the measurement is why. They are a SHARED namespace with a
 * second consumer: `:where(.ds-workspace-frame)` in
 * `presentation/components/patterns{,-paint}/index.css` paints its own ground,
 * frame, elevation and wash from the same four names, and its `--list` and
 * `--form` variants declare `--ds-workspace-shell-bg` on the element. The base
 * frame reads them at a DIFFERENT rest — an unresolved background, the plain
 * `--ds-color-border` rule and `--ds-card-shadow` — so a derived value would
 * silently repaint `feature-workspace-frame` with this shell's atmosphere. One
 * name, two rests. The legacy `chrome-variables` kernel already emits all four
 * conditionally when a tenant states them, and that path is unchanged.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/chrome/workspace-shell
 * @category Compilers
 * @package @rottay/design-system
 */

import type { FamilyDeriver } from "../../../../foundation/contract";

/** A vertical's own workspace chrome outranks every relation stated here. */
export const workspaceShellChromeDeriver: FamilyDeriver = {
  family: "workspace-shell",
  rank: "derived",
  consumes: ["palette.*", "surfaces.*"],
  produces: [
    "--ds-workspace-shell-mask-color",
    "--ds-workspace-shell-particle-primary",
    "--ds-workspace-shell-particle-secondary",
    "--ds-workspace-shell-orbital-mask",
    "--ds-workspace-shell-ambient-mask",
  ],
  derive: () => deriveWorkspaceShellChannels(),
};

/** The accent the whole atmosphere is mixed from, stated once. */
const MASK_COLOR = "var(--ds-workspace-shell-mask-color, var(--ds-color-primary))";

const ramp = (...stops: [number, string][]) =>
  `linear-gradient(\n      180deg,\n      ${stops
    .map(([mix, at]) => `color-mix(in srgb, ${MASK_COLOR} ${mix}%, transparent) ${at}`)
    .join(",\n      ")}\n    )`;

export function deriveWorkspaceShellChannels(): Record<string, string> {
  const vars: Record<string, string> = {};

  // The atmospheric field mixes from one accent.
  vars["--ds-workspace-shell-mask-color"] = "var(--ds-color-primary)";
  vars["--ds-workspace-shell-particle-primary"] =
    "color-mix(in srgb, var(--ds-color-primary) 34%, var(--ds-surface-card) 66%)";
  vars["--ds-workspace-shell-particle-secondary"] =
    "color-mix( in srgb, var(--ds-color-primary) 18%, var(--ds-color-text-secondary) 24%, transparent )";

  // Each canvas fades out downward; the orbital field carries further.
  vars["--ds-workspace-shell-orbital-mask"] = ramp(
    [58, "0%"],
    [58, "24%"],
    [46, "54%"],
    [32, "80%"],
    [8, "100%"]
  );
  vars["--ds-workspace-shell-ambient-mask"] = ramp([36, "0%"], [42, "40%"], [18, "100%"]);

  return vars;
}
