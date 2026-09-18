/**
 * @fileoverview The `form-sections` channels the Modern skin reads: the
 * per-tone tone set and the facts-card title's editorial size.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/chrome/form-sections
 * @category Compilers
 * @package @rottay/design-system
 *
 * @remarks
 * Each value is the fallback the skin already resolved to, so producing the
 * name changes nothing that renders and everything about whether a tenant can
 * reach it: a `var(--ds-x, LITERAL)` whose name nobody writes is a channel
 * that looks customizable and is not.
 *
 * The per-tone names are produced at the DEFAULT tone's resting value: the
 * skin's `[data-tone]` arms redeclare every one of them on the section
 * element, and that element-level statement outranks this derived `:root`
 * statement for the whole subtree, so the four-tone product contract stands
 * untouched. What the derivation adds is the cascade-law landing and a
 * tenant/vertical statement surface for the family channel as such.
 *
 * `--ds-form-sections-grid-size` stays OUT of this produces list: the skin
 * declares it per tone at 26/22/24px and no produced spacing rung equals any
 * of those values (the scale steps 24 to 28), so a chained fallback would
 * repaint the header grid under any tenant that moves the rung. It is a
 * structural constant, not debt.
 *
 * The open card section's depth chains the governed `raised` role's SELECTED
 * facet (`--ds-material-raised-shadow-selected`) before its literal. That
 * channel never entered the material vocabulary, so it has no producer; the
 * literal tail keeps the resting shadow exact and the inner
 * `var(--ds-color-text-primary)` still lands the chain on a produced root.
 * The routed channel itself is deliberately not restated here.
 *
 * The editorial 17px has no canonical font-size role (base is 16px, lg is 18px
 * at every shipped type profile), so the resting value is the honest literal
 * rather than a type-scale chain that would not equal it under every
 * vertical.
 */

import type { FamilyDeriver } from "../../../../foundation/contract";

/** A vertical's own form-sections chrome outranks every relation stated here. */
export const formSectionsChromeDeriver: FamilyDeriver = {
  family: "form-sections",
  rank: "derived",
  consumes: [
    "palette.*",
    "typography.roles",
    "density",
    "motion.*",
  ],
  produces: [
    "--ds-form-sections-accent",
    "--ds-form-sections-accent-secondary",
    "--ds-form-sections-active-border",
    "--ds-form-sections-badge-bg",
    "--ds-form-sections-badge-border",
    "--ds-form-sections-border",
    "--ds-form-sections-divider",
    "--ds-form-sections-facts-title-font-size",
    "--ds-form-sections-grid-color",
    "--ds-form-sections-muted-surface",
    "--ds-form-sections-shadow",
    "--ds-form-sections-surface",
  ],
  derive: () => deriveFormSectionsChannels(),
};

export function deriveFormSectionsChannels(): Record<string, string> {
  const vars: Record<string, string> = {};

  /* Default-tone resting values, quoted byte-identically to the chained
     fallback the skin states for each read. */
  vars["--ds-form-sections-accent"] =
    "color-mix(in srgb, var(--ds-color-text-secondary) 14%, transparent)";
  vars["--ds-form-sections-accent-secondary"] =
    "color-mix(in srgb, var(--ds-color-text-primary) 7%, transparent)";
  vars["--ds-form-sections-active-border"] = "var(--ds-color-border)";
  vars["--ds-form-sections-badge-bg"] = "var(--ds-color-bg-secondary)";
  vars["--ds-form-sections-badge-border"] = "var(--ds-color-border-secondary)";
  vars["--ds-form-sections-border"] = "var(--ds-color-border-secondary)";
  vars["--ds-form-sections-divider"] =
    "color-mix(in srgb, var(--ds-color-border-secondary) 78%, transparent)";
  vars["--ds-form-sections-grid-color"] =
    "color-mix(in srgb, var(--ds-color-text-muted) 22%, transparent)";
  vars["--ds-form-sections-muted-surface"] =
    "color-mix(in srgb, var(--ds-surface-card, var(--ds-color-bg-elevated)) 92%, var(--ds-color-bg-secondary) 8%)";
  vars["--ds-form-sections-shadow"] =
    "var(--ds-material-raised-shadow-selected, 0 14px 34px color-mix(in srgb, var(--ds-color-text-primary) 10%, transparent))";
  vars["--ds-form-sections-surface"] =
    "var(--ds-surface-card, var(--ds-color-bg-elevated))";

  /* The facts card title's editorial size: a literal with no canonical role,
     quoted byte-identically to the fallback the skin states for it. */
  vars["--ds-form-sections-facts-title-font-size"] = "17px";

  return vars;
}
