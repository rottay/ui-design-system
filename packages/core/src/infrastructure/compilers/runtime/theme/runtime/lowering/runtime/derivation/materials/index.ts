/**
 * @fileoverview The materials family: the semantic surface stack, emitted
 * whole for every vertical instead of only where a theme authored it.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/materials
 * @category Compilers
 * @package @rottay/design-system
 */

import type { BrandTheme } from "@/foundation/contracts/composition/tenants/themes";
import type { FamilyDeriver } from "../../../foundation/contract";
import { semanticSurfaceRolesToMaterialVariables } from "../../../foundation/materials";

/**
 * Every material root, for every theme.
 *
 * F-10 measured the alternative: the roots were emitted only where a vertical
 * had authored the facet, so one artifact carried 65 of them, another 2 and a
 * third none — and a tenant that wanted a different hover had to reach ~370
 * per-component channels because the root it should have moved did not exist
 * in its scope. Emission is unconditional here, and a theme that authors a
 * facet overrides its own default rather than deciding whether the root is
 * emitted at all.
 *
 * The state facets are DERIVED FROM THE STATE DELTAS, not authored: a hover
 * ground is the resting ground travelled toward the brand by
 * `--ds-state-hover-shift`, which is the one number `states.emphasis` moves.
 * That is what makes the emphasis decision reach a family without the family
 * knowing the decision exists.
 */
export const materialsDeriver: FamilyDeriver = {
  family: "materials",
  rank: "derived",
  consumes: ["surfaces.surfaceRoles", "surfaces.materials"],
  produces: ["--ds-material-*"],
  derive: (context) => deriveMaterialChannels(context.theme),
};

export function deriveMaterialChannels(bt: BrandTheme): Record<string, string> {
  const vars: Record<string, string> = {};
  // Written as explicit per-root assignments, not a loop over a role table:
  // the producer census both cascade gates share reads these names out of the
  // source text, so a computed key would leave every material root without a
  // declared producer and the ratchets would count them as unowned reads.
  vars["--ds-material-canvas-background"] = "var(--ds-surface-canvas)";
  vars["--ds-material-canvas-foreground"] = "var(--ds-color-text-primary)";
  vars["--ds-material-shell-background"] = "var(--ds-surface-shell)";
  vars["--ds-material-shell-foreground"] = "var(--ds-color-text-primary)";
  vars["--ds-material-panel-background"] = "var(--ds-surface-panel)";
  vars["--ds-material-panel-background-hover"] = "color-mix(in srgb, var(--ds-color-primary) var(--ds-state-hover-shift, 4%), var(--ds-surface-panel))";
  vars["--ds-material-panel-background-active"] = "color-mix(in srgb, var(--ds-color-primary) var(--ds-state-active-shift, 7%), var(--ds-surface-panel))";
  vars["--ds-material-panel-background-selected"] = "color-mix(in srgb, var(--ds-color-primary) var(--ds-state-selected-shift, 9%), var(--ds-surface-panel))";
  vars["--ds-material-panel-background-disabled"] = "color-mix(in srgb, var(--ds-surface-panel) var(--ds-state-disabled-mix, 82%), var(--ds-surface-canvas))";
  vars["--ds-material-panel-foreground"] = "var(--ds-color-text-primary)";
  vars["--ds-material-panel-foreground-muted"] = "var(--ds-color-text-secondary)";
  vars["--ds-material-panel-foreground-disabled"] = "var(--ds-color-text-disabled)";
  vars["--ds-material-panel-border"] = "var(--ds-color-border-primary)";
  vars["--ds-material-panel-border-strong"] = "var(--ds-color-border-secondary)";
  vars["--ds-material-panel-border-hover"] = "var(--ds-color-border-secondary)";
  vars["--ds-material-panel-border-active"] = "var(--ds-color-primary)";
  vars["--ds-material-panel-border-selected"] = "var(--ds-color-primary)";
  vars["--ds-material-panel-border-disabled"] = "var(--ds-color-border-disabled, var(--ds-color-border-subtle))";
  vars["--ds-material-panel-focus-ring"] = "var(--ds-focus-ring, var(--ds-shadow-focus-ring))";
  vars["--ds-material-panel-shadow"] = "none";
  vars["--ds-material-panel-shadow-hover"] = "var(--ds-shadow-sm)";
  vars["--ds-material-panel-shadow-active"] = "none";
  vars["--ds-material-panel-shadow-selected"] = "var(--ds-material-panel-focus-ring)";
  vars["--ds-material-card-background"] = "var(--ds-surface-card)";
  vars["--ds-material-card-background-hover"] = "color-mix(in srgb, var(--ds-color-primary) var(--ds-state-hover-shift, 4%), var(--ds-surface-card))";
  vars["--ds-material-card-background-active"] = "color-mix(in srgb, var(--ds-color-primary) var(--ds-state-active-shift, 7%), var(--ds-surface-card))";
  vars["--ds-material-card-background-selected"] = "color-mix(in srgb, var(--ds-color-primary) var(--ds-state-selected-shift, 9%), var(--ds-surface-card))";
  vars["--ds-material-card-background-disabled"] = "color-mix(in srgb, var(--ds-surface-card) var(--ds-state-disabled-mix, 82%), var(--ds-surface-panel))";
  vars["--ds-material-card-foreground"] = "var(--ds-color-text-primary)";
  vars["--ds-material-card-foreground-muted"] = "var(--ds-color-text-secondary)";
  vars["--ds-material-card-foreground-disabled"] = "var(--ds-color-text-disabled)";
  vars["--ds-material-card-border"] = "var(--ds-color-border-primary)";
  vars["--ds-material-card-border-strong"] = "var(--ds-color-border-secondary)";
  vars["--ds-material-card-border-hover"] = "var(--ds-color-border-hover, var(--ds-color-border-secondary))";
  vars["--ds-material-card-border-active"] = "var(--ds-color-primary)";
  vars["--ds-material-card-border-selected"] = "var(--ds-color-primary)";
  vars["--ds-material-card-border-disabled"] = "var(--ds-color-border-disabled, var(--ds-color-border-subtle))";
  vars["--ds-material-card-focus-ring"] = "var(--ds-focus-ring, var(--ds-shadow-focus-ring))";
  vars["--ds-material-card-shadow"] = "var(--ds-shadow-sm)";
  vars["--ds-material-card-shadow-hover"] = "var(--ds-shadow-md)";
  vars["--ds-material-card-shadow-active"] = "var(--ds-shadow-sm)";
  vars["--ds-material-card-shadow-selected"] = "var(--ds-material-card-focus-ring)";
  vars["--ds-material-inset-background"] = "var(--ds-surface-inset)";
  vars["--ds-material-inset-foreground"] = "var(--ds-color-text-primary)";
  vars["--ds-material-inset-shadow"] = "var(--ds-shadow-inner)";
  vars["--ds-material-inset-shadow-hover"] = "inset 0 2px 6px 0 color-mix(in srgb, var(--ds-color-neutral-900) 7%, transparent)";
  vars["--ds-material-inset-shadow-active"] = "inset 0 3px 8px 0 color-mix(in srgb, var(--ds-color-neutral-900) 9%, transparent)";
  vars["--ds-material-inset-shadow-selected"] = "var(--ds-focus-ring, var(--ds-shadow-focus-ring))";
  vars["--ds-material-control-background"] = "var(--ds-surface-control)";
  vars["--ds-material-control-background-hover"] = "color-mix(in srgb, var(--ds-color-primary) var(--ds-state-hover-shift, 4%), var(--ds-surface-control))";
  vars["--ds-material-control-background-active"] = "color-mix(in srgb, var(--ds-color-primary) var(--ds-state-active-shift, 7%), var(--ds-surface-control))";
  vars["--ds-material-control-background-selected"] = "color-mix(in srgb, var(--ds-color-primary) var(--ds-state-selected-shift, 9%), var(--ds-surface-control))";
  vars["--ds-material-control-background-disabled"] = "color-mix(in srgb, var(--ds-surface-control) var(--ds-state-disabled-mix, 82%), var(--ds-surface-panel))";
  vars["--ds-material-control-foreground"] = "var(--ds-color-text-primary)";
  vars["--ds-material-control-foreground-muted"] = "var(--ds-color-text-secondary)";
  vars["--ds-material-control-foreground-disabled"] = "var(--ds-color-text-disabled)";
  vars["--ds-material-control-border"] = "var(--ds-color-border-primary)";
  vars["--ds-material-control-border-strong"] = "var(--ds-color-border-secondary)";
  vars["--ds-material-control-border-hover"] = "var(--ds-color-border-hover, var(--ds-color-border-secondary))";
  vars["--ds-material-control-border-active"] = "var(--ds-color-primary)";
  vars["--ds-material-control-border-selected"] = "var(--ds-color-primary)";
  vars["--ds-material-control-border-disabled"] = "var(--ds-color-border-disabled, var(--ds-color-border-subtle))";
  vars["--ds-material-control-focus-ring"] = "var(--ds-focus-ring, var(--ds-shadow-focus-ring))";
  vars["--ds-material-control-shadow"] = "none";
  vars["--ds-material-control-shadow-hover"] = "var(--ds-shadow-sm)";
  vars["--ds-material-control-shadow-active"] = "none";
  vars["--ds-material-control-shadow-selected"] = "var(--ds-material-control-focus-ring)";
  vars["--ds-material-raised-background"] = "var(--ds-surface-raised)";
  vars["--ds-material-raised-foreground"] = "var(--ds-color-text-primary)";
  vars["--ds-material-overlay-background"] = "var(--ds-surface-overlay)";
  vars["--ds-material-overlay-opaque"] = "var(--ds-surface-card)";
  // An authored surface role overrides this family's own default for the
  // facets it states, and only those: the theme is inside the family, not a
  // second family competing for the same channel at the same rank.
  Object.assign(
    vars,
    semanticSurfaceRolesToMaterialVariables(
      bt.surfaces?.surfaceRoles ?? bt.surfaces?.materials
    )
  );
  return vars;
}
