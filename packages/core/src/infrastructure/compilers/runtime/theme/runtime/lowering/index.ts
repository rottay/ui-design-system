/**
 * @fileoverview The sole lowering: a resolved Theme to a ThemeCompilation.
 *
 * @module Compilers/Theme/Lowering
 * @category Compilers
 * @package @rottay/design-system
 */

import type { ThemeCompilation } from "@/foundation/contracts/composition/tenants/themes/compiled";
import type {
  EngineAdapter,
  EngineThemeCompilation,
} from "@/foundation/contracts/composition/tenants/themes/engine-adapter";
import type { ThemeResolution } from "@/foundation/contracts/composition/tenants/themes/resolved";
import { assertMandatoryFontFallback } from "@/foundation/kernel/typography";
import { validateRecipeProfileSelection } from "@/foundation/tokens/ts/presentation/recipe-profiles";
import { validateExperienceProfileSelection } from "@/foundation/tokens/ts/presentation/expressive-profiles";
import { ON_TONE_ROLES, type OnToneRole } from "@/infrastructure/compilers/kernel/foundation/css/color-math/readable-ink";
import { brandThemeToChromeVariables } from "./foundation/chrome";
import { mergeBrandThemeFloors, resolveTenantPosture } from "./foundation/floors";
import { readGovernedTheme } from "./foundation/intake";
import {
  brandThemeToPersonality,
  brandThemeToTokenOverrides,
  deepMergeTokenOverrides,
  mergePartialPersonality,
} from "./foundation/personality";
import {
  PRIMARY_SEED_FIELD,
  applyTenantSeedDerivations,
  applyTenantStatusSeedDerivations,
} from "./foundation/seeds";
import { compileModeBlocks } from "./runtime/mode-blocks";
import { brandThemeToCssVariables } from "./runtime/variables";
import type { BrandTheme } from "@/foundation/contracts/composition/tenants/themes";

/**
 * Lower one resolved theme, then project it onto an engine.
 *
 * `provenance.tenantAuthored` is the sole discriminant: an empty
 * `authoredPaths` from a real tenant is not the same fact as "no tenant", and
 * object identity does not survive a second module instance, a structured
 * clone or any transport.
 *
 * The tenant floor enters TWICE on purpose. `effectiveTheme` is what every
 * channel writer below reads, while `tenantPosture` is lowered LAST inside
 * `brandThemeToCssVariables`, so a tenant's posture outranks every
 * vertical-authored writer instead of merging into their position.
 *
 * Scope is not lowered here: no `cssString` and no selector. `emitThemeCss`
 * owns emission, which is what lets one compile serve a document root, a DB
 * artifact and a preview container without recompiling.
 */
export function compileTheme(
  resolution: ThemeResolution,
  adapter: EngineAdapter
): EngineThemeCompilation {
  const brandTheme = readGovernedTheme(resolution.theme);
  const tenantSlug = resolution.theme.id;
  const tenant = resolution.provenance.tenantAuthored;
  const tenantAuthoredPaths = tenant
    ? resolution.provenance.authoredPaths
    : undefined;
  const tenantPatch = tenant
    ? (resolution.provenance.floors as Partial<BrandTheme>)
    : undefined;
  const tenantStatusSeedAuthorship = tenant
    ? resolution.provenance.statusSeedAuthorship
    : undefined;

  const personality = mergePartialPersonality(
    undefined,
    brandThemeToPersonality(brandTheme)
  );
  const tokenOverrides = deepMergeTokenOverrides(
    {},
    brandThemeToTokenOverrides(brandTheme)
  );

  const effectiveTheme = tenantPatch
    ? (mergeBrandThemeFloors(brandTheme, tenantPatch) as BrandTheme)
    : brandTheme;
  const tenantPosture = tenantPatch
    ? resolveTenantPosture(tenantPatch)
    : undefined;
  const tenantTypography = tenantPatch?.typography;

  const paletteVars = brandThemeToCssVariables(
    effectiveTheme,
    undefined,
    tenantPosture,
    tenantTypography
  );
  const chromeVars = brandThemeToChromeVariables(
    effectiveTheme,
    undefined,
    tenantAuthoredPaths
  );
  const cssVariables = { ...paletteVars, ...chromeVars };
  // The base block's seed is the tenant's exactly when the tenant stated it;
  // there is no overlay above this block to restate it.
  applyTenantSeedDerivations(
    cssVariables,
    effectiveTheme.palette?.primaryColor,
    tenantAuthoredPaths === undefined
      ? undefined
      : {
          authoredPaths: tenantAuthoredPaths,
          modePrefix: "",
          seedIsTenantAuthored: tenantAuthoredPaths.has(PRIMARY_SEED_FIELD),
        }
  );
  // The status-tint sibling. Seed authorship here is whether the raw tenant
  // patch's own palette carried this tone's seed -- see the function's
  // docblock for why that must read the raw value rather than `authoredPaths`
  // membership. Prefer the closed `tenantStatusSeedAuthorship` channel; fall
  // back to `tenantPatch` for callers that supply only the floor.
  applyTenantStatusSeedDerivations(
    cssVariables,
    effectiveTheme.palette,
    tenantAuthoredPaths === undefined
      ? undefined
      : {
          authoredPaths: tenantAuthoredPaths,
          modePrefix: "",
          toneSeedIsTenantAuthored: Object.fromEntries(
            ON_TONE_ROLES.map((role) => [
              role,
              tenantStatusSeedAuthorship
                ? tenantStatusSeedAuthorship.base[role]
                : tenantPatch?.palette?.[`${role}Color`] !== undefined,
            ])
          ) as Record<OnToneRole, boolean>,
        }
  );

  // DS-S001: governed recipe-profile selection. Fail-closed -- an unknown id,
  // malformed id or foreign schema version compiles to engine defaults.
  const recipeProfileValidation = validateRecipeProfileSelection(
    effectiveTheme.recipes?.profile,
    effectiveTheme.recipes?.schemaVersion
  );
  const recipeProfile = recipeProfileValidation.ok
    ? recipeProfileValidation.profile?.id
    : undefined;
  if (recipeProfile) {
    cssVariables["--ds-recipe-profile"] = `"${recipeProfile}"`;
  }

  // The expansion itself already ran inside `brandThemeToCssVariables` (so
  // mode overlays re-expand); this block only publishes the validated
  // selection id as provenance, exactly like the recipe channel above. Same
  // fail-closed posture: invalid ids compile to baseline identity, unmarked.
  const experienceProfileValidation = validateExperienceProfileSelection(
    effectiveTheme.expressive?.experienceProfile,
    effectiveTheme.expressive?.schemaVersion
  );
  const experienceProfile = experienceProfileValidation.ok
    ? experienceProfileValidation.profile?.id
    : undefined;
  if (experienceProfile) {
    cssVariables["--ds-experience-profile"] = `"${experienceProfile}"`;
  }

  assertMandatoryFontFallback(cssVariables, tenantSlug);

  // The declared mode of the values above; the non-default modes are compiled
  // from the typed `modes` overlays into their own blocks below.
  const colorScheme = effectiveTheme.appearance?.defaultMode;
  const modeBlocks = compileModeBlocks(
    effectiveTheme,
    cssVariables,
    tenantAuthoredPaths,
    tenantPosture,
    tenantTypography,
    tenantPatch,
    tenantStatusSeedAuthorship
  );
  for (const block of modeBlocks) {
    // A mode may restyle type; it may not drop the mandatory fallback while
    // doing so. The guard reads the block's own emission, not the base's.
    assertMandatoryFontFallback(
      block.cssVariables,
      `${tenantSlug} (${block.mode} mode)`
    );
  }

  const compiled: ThemeCompilation = {
    cssVariables,
    modeBlocks,
    ...(colorScheme ? { colorScheme } : {}),
    runtime: {
      personality,
      tokenOverrides,
      ...(recipeProfile ? { recipeProfile } : {}),
      ...(experienceProfile ? { experienceProfile } : {}),
    },
  };
  return { ...compiled, engine: adapter.id, projection: adapter.project(compiled) };
}
