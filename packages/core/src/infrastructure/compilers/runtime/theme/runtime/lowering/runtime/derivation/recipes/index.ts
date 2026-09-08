/**
 * @fileoverview The recipe family: the two governed selection provenance channels.
 *
 * @module Compilers/Theme/Lowering/Runtime/derivation/recipes
 * @category Compilers
 * @package @rottay/design-system
 */

import type { BrandTheme } from "@/foundation/contracts/composition/tenants/themes";
import { validateExperienceProfileSelection } from "@/foundation/tokens/ts/presentation/expressive-profiles";
import { validateRecipeProfileSelection } from "@/foundation/tokens/ts/presentation/recipe-profiles";
import type { FamilyDeriver } from "../../../foundation/contract";

/**
 * DS-S001: governed selection provenance. Fail-closed -- an unknown id,
 * malformed id or foreign schema version compiles to engine defaults and
 * publishes no channel at all.
 *
 * The expressive expansion itself is the `expressive` family's job; this one
 * only publishes the validated selection id, exactly like the recipe channel
 * beside it.
 */
export interface GovernedSelections {
  readonly recipeProfile: string | undefined;
  readonly experienceProfile: string | undefined;
}

/**
 * The two validated selection ids, for the channel below and for the compiled
 * runtime payload that states the same two ids un-quoted. One validation, one
 * answer -- the payload never re-reads the emitted channel to learn what the
 * compiler already decided.
 */
export function resolveGovernedSelections(
  theme: BrandTheme
): GovernedSelections {
  const recipe = validateRecipeProfileSelection(
    theme.recipes?.profile,
    theme.recipes?.schemaVersion
  );
  const experience = validateExperienceProfileSelection(
    theme.expressive?.experienceProfile,
    theme.expressive?.schemaVersion
  );
  return {
    recipeProfile: recipe.ok ? recipe.profile?.id : undefined,
    experienceProfile: experience.ok ? experience.profile?.id : undefined,
  };
}

export const recipesDeriver: FamilyDeriver = {
  family: "recipes",
  rank: "derived",
  consumes: [
    "recipes.profile",
    "recipes.schemaVersion",
    "expressive.experienceProfile",
    "expressive.schemaVersion",
  ],
  produces: ["--ds-recipe-profile", "--ds-experience-profile"],
  derive: (context) => {
    const selections = resolveGovernedSelections(context.theme);
    const vars: Record<string, string> = {};
    if (selections.recipeProfile)
      vars["--ds-recipe-profile"] = `"${selections.recipeProfile}"`;
    if (selections.experienceProfile)
      vars["--ds-experience-profile"] = `"${selections.experienceProfile}"`;
    return vars;
  },
};
