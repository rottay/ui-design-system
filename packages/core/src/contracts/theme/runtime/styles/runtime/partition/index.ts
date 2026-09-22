/**
 * @fileoverview Which of the 29 decisions a style may author, and which are the
 * tenant's alone. A new column BESIDE the catalog, never inside it: the catalog
 * is AST-parsed by the gate reader, so a new field per row moves the reader too.
 *
 * Every row is classified and there is no default. A row missing from the table
 * is refused by name rather than admitted, so the partition can never acquire
 * one silently.
 *
 * @module Contracts/Theme/Styles/Partition
 * @category Types
 * @package @rottay/design-system
 */

import {
  THEME_DECISION_IDS,
  type ThemeDecisionId,
} from "@/contracts/theme/foundation/decisions";
import { ThemeStyleReferenceError } from "@/contracts/theme/runtime/styles/foundation/document";

/**
 * `style` a registered style may author it; `brand` it is the tenant's own
 * identity; `refused` a mechanical reason bars it whatever its fan-out says.
 */
export const THEME_STYLE_CLASSES = Object.freeze([
  "style",
  "brand",
  "refused",
] as const);

export type ThemeStyleClass = (typeof THEME_STYLE_CLASSES)[number];

/**
 * The partition, measured row by row.
 *
 * BRAND is chromatic reach or the tenant's own faces: the seeds, the status
 * seeds, the neutral temperature, the contrast posture that consumes both seed
 * rows, the per-tenant mode identity, and the font families. `navigation
 * .sidebar-tone` joins them on the same mechanical reading rather than as a
 * safe default: it consumes `palette.seeds` and produces six COLOUR channels,
 * so a style authoring it would set tenant sidebar colour derived from a seed
 * row it may not touch.
 *
 * REFUSED is `experience.profile` alone, for two independent reasons. It is the
 * sole row whose selection drives the profile expansion, which hard-codes
 * `profile-derived` -- so a style authoring it would emit rank-1 claims from a
 * rank-0 source. And the composition order makes it inert anyway: the underlay
 * runs AFTER the expansion, so a style-supplied profile would apply its own
 * channels while its field defaults never fired. Its fan-out is 8 fields over 6
 * rows, all style-class, so the fan-out reading alone would have said "style";
 * the rank reading overrules it.
 */
export const THEME_STYLE_CLASS_BY_DECISION: Readonly<
  Record<ThemeDecisionId, ThemeStyleClass>
> = Object.freeze({
  "palette.seeds": "brand",
  "palette.status-seeds": "brand",
  "palette.neutral-temperature": "brand",
  "palette.contrast-posture": "brand",
  "palette.dark-mode": "brand",
  "typography.families": "brand",
  "typography.pairing": "style",
  "typography.scale": "style",
  "typography.role-weights": "style",
  "typography.numeric": "style",
  "shape.radius-scale": "style",
  "shape.nesting": "style",
  "shape.button-style": "style",
  "shape.control-height": "style",
  "density.mode": "style",
  "spacing.rhythm": "style",
  "surfaces.elevation-posture": "style",
  "surfaces.border-style": "style",
  "surfaces.effect-intensity": "style",
  "states.emphasis": "style",
  "states.focus-style": "style",
  "motion.dial": "style",
  "motion.character": "style",
  "navigation.sidebar-tone": "brand",
  "experience.profile": "refused",
  "profiles.expressive": "style",
  "recipe-profile": "style",
  "chrome.anatomy": "style",
  "responsive.posture": "style",
});

/**
 * The style-class rows that emit NOTHING a paint census can see, declared here
 * because the catalog is this owner's unranked peer and a production edge to it
 * is structural debt.
 *
 * It is a measurement, not a judgement: within the 29 rows exactly one
 * `produces` block is empty on both axes. The owner's suite and the
 * `style-registry` gate re-derive it from `THEME_CONTROL_CATALOG` in BOTH
 * directions, so this list cannot drift from the reach it names.
 */
export const THEME_STYLE_NON_EMITTING_DECISIONS: readonly ThemeDecisionId[] =
  Object.freeze(["recipe-profile"] as const);

/**
 * Refuse a row a style may not author, by name, at registration.
 *
 * The refusal names the CLASS as well as the row, because "a style owns form,
 * the tenant owns brand" is the rule a style author has to internalise and a
 * bare "not allowed" teaches it to nobody.
 */
export function assertStyleAuthorable(styleId: string, id: string): void {
  const name = JSON.stringify(styleId);
  const row = THEME_STYLE_CLASS_BY_DECISION[id as ThemeDecisionId];
  if (row === undefined) {
    throw new ThemeStyleReferenceError(
      `style ${name} authors ${JSON.stringify(id)}, which the style partition does not classify; every one of the ${THEME_DECISION_IDS.length} rows is classified and there is no default`
    );
  }
  if (row === "brand") {
    throw new ThemeStyleReferenceError(
      `style ${name} authors ${JSON.stringify(id)}, which is brand-class; a style owns form, the tenant owns brand`
    );
  }
  if (row === "refused") {
    throw new ThemeStyleReferenceError(
      `style ${name} authors ${JSON.stringify(id)}, whose expansion produces "profile-derived"; a style may not author a row that outranks itself`
    );
  }
}

/**
 * The floor a publication must clear: at least one row that emits a channel or
 * a root attribute.
 *
 * Stated on REACH rather than on a label. The first spelling of this floor
 * ("at least one row whose `keypath.brandTheme` is not null") refused nothing:
 * every one of the 29 rows carries a brandTheme keypath, `recipe-profile`
 * included. A style made only of data-only rows is admissible in shape and
 * moves nothing anyone can measure, which is the one case this floor exists for.
 */
export function assertStyleEmitsSomething(
  styleId: string,
  rows: readonly string[]
): void {
  const emitting = rows.filter(
    (id) =>
      !(THEME_STYLE_NON_EMITTING_DECISIONS as readonly string[]).includes(id)
  );
  if (emitting.length > 0) return;
  throw new ThemeStyleReferenceError(
    `style ${JSON.stringify(styleId)} authors no row that emits a channel or a root attribute; ` +
      `${THEME_STYLE_NON_EMITTING_DECISIONS.map((id) => JSON.stringify(id)).join(", ")} is data-only`
  );
}
