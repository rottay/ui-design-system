/**
 * @fileoverview The sole lowering: a resolved Theme to a ThemeCompilation.
 *
 * @module Compilers/Theme/Lowering
 * @category Compilers
 * @package @rottay/design-system
 */

import type { BrandTheme } from "@/foundation/contracts/composition/tenants/themes";
import type { ThemeCompilation } from "@/foundation/contracts/composition/tenants/themes/compiled";
import type {
  EngineAdapter,
  EngineThemeCompilation,
} from "@/foundation/contracts/composition/tenants/themes/engine-adapter";
import type { ThemeResolution } from "@/foundation/contracts/composition/tenants/themes/resolved";
import { assertMandatoryFontFallback } from "@/foundation/kernel/typography";
import type { DecisionProvenanceLedger } from "@/foundation/contracts/composition/tenants/themes/provenance";
import { ledgerOwnerOfLeaf } from "@/foundation/contracts/composition/tenants/themes/provenance";
import type { OnToneRole } from "@/infrastructure/compilers/kernel/foundation/css/color-math/readable-ink";
import { ON_TONE_ROLES } from "@/infrastructure/compilers/kernel/foundation/css/color-math/readable-ink";
import type { TenantFacts } from "./foundation/contract";
import { mergeBrandThemeFloors, resolveTenantPosture } from "./foundation/floors";
import { readGovernedTheme } from "./foundation/intake";
import {
  brandThemeToPersonality,
  brandThemeToTokenOverrides,
  deepMergeTokenOverrides,
  mergePartialPersonality,
} from "./foundation/personality";
import { PRIMARY_SEED_FIELD } from "./foundation/seeds";
import { resolveGovernedSelections } from "./runtime/derivation/recipes";
import { compileModeBlocks } from "./runtime/mode-blocks";
import { lowerBlock } from "./runtime/pipeline";

/** The one chrome leaf a governed silhouette also expands into. */
const BUTTON_RADIUS_LEAF = "chrome.controls.buttonGeometry.radius";

/**
 * The button radius the tenant NAMED, asked of the ledger rather than mirrored.
 *
 * `shape.button-style` expands into this leaf and a sanctioned override names
 * it outright, so the two contest one leaf inside one provenance class, and
 * I-P5 settles it for the override. The paint could not honour that: the
 * silhouette lands at the `tenant` rank and the chrome family one rank below
 * it, so a `pill` + override document reported the override as effective and
 * drew the pill -- one leaf with two answers.
 *
 * The fix READS the verdict instead of restating the rule. A second
 * implementation of "named beats expansion-derived" here would be a second
 * authority to keep in step, and the first thing it would drift on is the next
 * decision that learns an expansion. `ledgerOwnerOfLeaf` is the ledger's own
 * reader and the entry it returns is the causal winner, so the compiled block
 * and the provenance report cannot disagree by construction.
 *
 * `undefined` on every other shape of answer: no ledger (a transport that
 * carries none authored nothing this station models), a decision owning the
 * leaf (the silhouette IS the answer), a profile-derived owner (a default is
 * not the tenant naming a radius), or a non-string value.
 */
function tenantNamedButtonRadius(
  ledger: DecisionProvenanceLedger | undefined
): string | undefined {
  if (!ledger) return undefined;
  const owner = ledgerOwnerOfLeaf(ledger, BUTTON_RADIUS_LEAF);
  if (
    owner === undefined ||
    owner.ref.kind !== "sanctioned-override" ||
    owner.provenance !== "direct-override" ||
    typeof owner.authoredValue !== "string"
  ) {
    return undefined;
  }
  return owner.authoredValue;
}

/**
 * Lower one resolved theme, then project it onto an engine.
 *
 * `provenance.tenantAuthored` is the sole discriminant: an empty
 * `authoredPaths` from a real tenant is not the same fact as "no tenant", and
 * object identity does not survive a second module instance, a structured
 * clone or any transport.
 *
 * The tenant floor enters TWICE on purpose. `effectiveTheme` is what every
 * family deriver reads, while `tenantFacts` carries the tenant's own posture
 * and type into the pipeline at the `tenant` RANK -- so a tenant's statement
 * outranks every vertical writer instead of merging into their position, and
 * it no longer depends on which writer happened to run last.
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

  // The base block's seed is the tenant's exactly when the tenant stated it;
  // there is no overlay above this block to restate it. Status-seed authorship
  // reads the RAW patch value rather than `authoredPaths` membership -- see
  // `applyTenantStatusSeedDerivations` for why the Set alone answers yes for a
  // tenant that never touched the tone.
  const tenantFacts: TenantFacts | undefined = tenantPatch
    ? {
        posture: resolveTenantPosture(tenantPatch),
        chosenButtonStyle: tenantPatch.surfaces?.buttonStyle,
        chosenButtonRadius: tenantNamedButtonRadius(
          resolution.provenance.ledger
        ),
        typography: tenantPatch.typography,
        authoredPaths: tenantAuthoredPaths,
        statusSeedAuthorship: tenantStatusSeedAuthorship,
        seedIsTenantAuthored:
          tenantAuthoredPaths !== undefined &&
          tenantAuthoredPaths.has(PRIMARY_SEED_FIELD),
        toneSeedIsTenantAuthored: Object.fromEntries(
          ON_TONE_ROLES.map((role) => [
            role,
            tenantStatusSeedAuthorship
              ? tenantStatusSeedAuthorship.base[role]
              : tenantPatch?.palette?.[`${role}Color`] !== undefined,
          ])
        ) as Record<OnToneRole, boolean>,
      }
    : undefined;

  const cssVariables = lowerBlock({
    theme: effectiveTheme,
    tenant: tenantFacts,
  });

  assertMandatoryFontFallback(cssVariables, tenantSlug);

  // The declared mode of the values above; the non-default modes are compiled
  // from the typed `modes` overlays into their own blocks below.
  const colorScheme = effectiveTheme.appearance?.defaultMode;
  const modeBlocks = compileModeBlocks(
    effectiveTheme,
    cssVariables,
    tenantFacts,
    tenantPatch
  );
  for (const block of modeBlocks) {
    // A mode may restyle type; it may not drop the mandatory fallback while
    // doing so. The guard reads the block's own emission, not the base's.
    assertMandatoryFontFallback(
      block.cssVariables,
      `${tenantSlug} (${block.mode} mode)`
    );
  }

  const { recipeProfile, experienceProfile } =
    resolveGovernedSelections(effectiveTheme);
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
