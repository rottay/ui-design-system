/**
 * @fileoverview Test harness that drives the SOLE lowering from a FlatTheme.
 *
 * This is not a second lowering and not a compatibility door. It builds a
 * canonical `ThemeResolution` from an authored `FlatTheme` fixture, calls the
 * one public `compileTheme`, and re-flattens the result into the field names
 * the existing suites assert on (`personality`, `tokenOverrides`, `cssString`).
 * The lift is the lowering's own wrap-only intake, never the ISO normalizer, so
 * a sparse fixture reaches the compiler exactly as it was authored.
 * Productive code must never import it; the single-door architecture test
 * asserts exactly that.
 */

import type { FlatTheme, ThemeSource } from "@/foundation/contracts/composition/tenants/themes";
import type { Theme } from "@/foundation/contracts/composition/tenants/themes/iso";
import type {
  ThemeCompilationModeBlock,
  ThemeCompilationRuntime,
} from "@/foundation/contracts/composition/tenants/themes/compiled";
import type { FlatThemeMode } from "@/foundation/contracts/composition/tenants/themes";
import type {
  TenantAuthoredPaths,
  ThemeLayerPatch,
} from "@/foundation/contracts/composition/tenants/themes/iso";
import {
  liftAuthoredTheme,
  readGovernedTheme,
} from "@/infrastructure/compilers/runtime/theme/runtime/lowering/foundation/intake";
import {
  FIRST_PARTY_VERTICAL_SLUGS,
  type FirstPartyVerticalId,
} from "@/foundation/contracts/kernel/verticals";
import { baselineFor } from "@/infrastructure/compilers/runtime/theme";
import type {
  TenantStatusSeedAuthorship,
  ThemeFloors,
  ThemeProvenance,
} from "@/foundation/contracts/composition/tenants/themes/resolved";
import {
  EMPTY_PROVENANCE,
  deriveTenantStatusSeedAuthorship,
} from "@/foundation/contracts/composition/tenants/themes/resolved";
import { PRIMARY_ENGINE } from "@/foundation/contracts/kernel/engine-identity";
import {
  containerScope,
  emitThemeCss,
  resolveAdapter,
} from "@/infrastructure/compilers/runtime/theme";
import { compileTheme } from "@/infrastructure/compilers/runtime/theme/runtime/lowering";
import { brandTenantSelector } from "@/infrastructure/compilers/kernel/foundation/css/tenant-selectors";
import type { ThemeIntent } from "@/foundation/contracts/composition/tenants/themes/intent";
import type { ThemeResolution } from "@/foundation/contracts/composition/tenants/themes/resolved";
import { NEUTRAL_THEME } from "@/foundation/presets/neutral-theme";
import { isFirstPartyVerticalId } from "@/foundation/presets/verticals/roster";
import { resolveTheme } from "@/infrastructure/compilers/runtime/theme/runtime/resolution";

/**
 * The baseline a first-party vertical compiles: the neutral foundation with
 * the vertical's preset admitted, labelled with the slug. This is the ONLY
 * first-party theme there is; nobody authors one.
 */
export function firstPartyBaseline(vertical: FirstPartyVerticalId, slug: string = vertical): Theme {
  return baselineFor(vertical, slug);
}

/** The three first-party baselines, keyed by vertical and labelled with it. */
export const FIRST_PARTY_BASELINES: Readonly<Record<FirstPartyVerticalId, Theme>> =
  Object.freeze(
    Object.fromEntries(
      FIRST_PARTY_VERTICAL_SLUGS.map((vertical) => [vertical, baselineFor(vertical, vertical)])
    ) as Record<FirstPartyVerticalId, Theme>
  );

/**
 * The flat read view of a first-party baseline, for the suites that spell
 * the legacy compile input. Lifting it back reproduces the baseline exactly
 * (`liftAuthoredTheme(readGovernedTheme(b))` is `b` for all three verticals),
 * so `lowerFlatThemeFixture({ flatTheme: firstPartyFixture(v) })` compiles
 * the same Theme the artifact does.
 */
export function firstPartyFixture(vertical: FirstPartyVerticalId, slug: string = vertical): FlatTheme {
  return readGovernedTheme(baselineFor(vertical, slug));
}

/** A read view as a normalizer input, proven total rather than asserted. */
export function themeSourceOf(view: FlatTheme): ThemeSource {
  if (!view.appearance || !view.palette || !view.capabilities) {
    throw new Error(`${view.id}: a normalizer source declares appearance, palette and capabilities`);
  }
  return { ...view, appearance: view.appearance, palette: view.palette, capabilities: view.capabilities };
}

/** The three required families are present on every first-party baseline. */
export function firstPartySource(vertical: FirstPartyVerticalId, slug: string = vertical): ThemeSource {
  return themeSourceOf(firstPartyFixture(vertical, slug));
}

/**
 * Resolve an intent the way the compile door does: over the vertical's own
 * baseline. An intent naming no first-party vertical is handed the neutral
 * foundation, so a suite probing the resolver's refusals sees the INTENT's
 * error and never a baseline lookup's.
 */
export function resolveFirstParty(intent: ThemeIntent): ThemeResolution {
  const baseline = isFirstPartyVerticalId(intent.vertical)
    ? baselineFor(intent.vertical, intent.slug)
    : NEUTRAL_THEME;
  return resolveTheme(intent, { baseline });
}

/** The legacy compile input shape the suites still spell. */
export interface FlatThemeFixtureInput {
  flatTheme: FlatTheme;
  tenantSlug?: string;
  tenantAuthoredPaths?: TenantAuthoredPaths;
  /**
   * The honest subset the modes family carries across modes. A hand-authored
   * fixture set is already honest, so it defaults to `tenantAuthoredPaths`;
   * a suite mirroring a real document patch passes the collector's own answer.
   */
  tenantAuthoredLeaves?: TenantAuthoredPaths;
  tenantPatch?: Partial<FlatTheme>;
  tenantStatusSeedAuthorship?: TenantStatusSeedAuthorship;
}

/** The legacy compile output shape the suites still assert on. */
export interface FlatThemeFixtureCompilation {
  cssVariables: Record<string, string>;
  cssString: string;
  personality: ThemeCompilationRuntime["personality"];
  tokenOverrides: ThemeCompilationRuntime["tokenOverrides"];
  recipeProfile?: string;
  experienceProfile?: string;
  colorScheme?: FlatThemeMode;
  modeBlocks?: readonly ThemeCompilationModeBlock[];
}

/**
 * Compile one authored FlatTheme through the canonical pipeline.
 */
export function lowerFlatThemeFixture(
  input: FlatThemeFixtureInput
): FlatThemeFixtureCompilation {
  const { flatTheme, tenantPatch } = input;
  // A floor with no declared authorship is a floor with an EMPTY claim set --
  // the same compile, because the seed derivations the retired door skipped are
  // no-ops over an empty set. Merging the floor into the theme would NOT be the
  // same: the tenant posture is applied last, above every vertical writer.
  const tenantAuthoredPaths =
    input.tenantAuthoredPaths ?? (tenantPatch !== undefined ? new Set<string>() : undefined);
  const slug = input.tenantSlug ?? flatTheme.id;
  const provenance: ThemeProvenance =
    tenantAuthoredPaths === undefined
      ? EMPTY_PROVENANCE
      : {
          tenantAuthored: true,
          authoredPaths: tenantAuthoredPaths,
          authoredLeaves: input.tenantAuthoredLeaves ?? tenantAuthoredPaths,
          floors: (tenantPatch ?? {}) as ThemeFloors,
          statusSeedAuthorship:
            input.tenantStatusSeedAuthorship ??
            deriveTenantStatusSeedAuthorship((tenantPatch ?? {}) as ThemeLayerPatch),
        };
  const theme = { ...liftAuthoredTheme(flatTheme), id: slug };
  const compiled = compileTheme({ theme, provenance }, resolveAdapter(PRIMARY_ENGINE));
  return {
    cssVariables: { ...compiled.cssVariables },
    cssString: emitThemeCss(compiled, containerScope(brandTenantSelector(slug))),
    personality: compiled.runtime.personality,
    tokenOverrides: compiled.runtime.tokenOverrides,
    ...(compiled.runtime.recipeProfile
      ? { recipeProfile: compiled.runtime.recipeProfile }
      : {}),
    ...(compiled.runtime.experienceProfile
      ? { experienceProfile: compiled.runtime.experienceProfile }
      : {}),
    ...(compiled.colorScheme ? { colorScheme: compiled.colorScheme } : {}),
    ...(compiled.modeBlocks.length > 0 ? { modeBlocks: compiled.modeBlocks } : {}),
  };
}

/**
 * The canonical route from a resolved `Theme`, flattened for assertions.
 *
 * The retired `compileTheme(theme, { tenantSlug })` folded scope into the
 * compile and returned CSS text with it. It does not any more — one compile
 * serves every scope — so a suite that asserts on both asks for both here
 * instead of restating the resolve/lower/emit chain in every file.
 */
export interface LowerThemeProvenanceOptions {
  tenantSlug?: string;
  tenantAuthoredPaths?: TenantAuthoredPaths;
  /** See `FlatThemeFixtureInput.tenantAuthoredLeaves`. */
  tenantAuthoredLeaves?: TenantAuthoredPaths;
  tenantPatch?: Partial<FlatTheme>;
  tenantStatusSeedAuthorship?: TenantStatusSeedAuthorship;
}

export function lowerTheme(
  theme: Theme,
  slugOrOptions: string | LowerThemeProvenanceOptions = theme.id
): FlatThemeFixtureCompilation {
  const options: LowerThemeProvenanceOptions =
    typeof slugOrOptions === "string" ? { tenantSlug: slugOrOptions } : slugOrOptions;
  const tenantSlug = options.tenantSlug ?? theme.id;
  const labelled = tenantSlug === theme.id ? theme : { ...theme, id: tenantSlug };
  const provenance: ThemeProvenance =
    options.tenantAuthoredPaths === undefined
      ? EMPTY_PROVENANCE
      : {
          tenantAuthored: true,
          authoredPaths: options.tenantAuthoredPaths,
          authoredLeaves:
            options.tenantAuthoredLeaves ?? options.tenantAuthoredPaths,
          floors: (options.tenantPatch ?? {}) as ThemeFloors,
          statusSeedAuthorship:
            options.tenantStatusSeedAuthorship ??
            deriveTenantStatusSeedAuthorship(
              (options.tenantPatch ?? {}) as ThemeLayerPatch
            ),
        };
  const compiled = compileTheme(
    { theme: labelled, provenance },
    resolveAdapter(PRIMARY_ENGINE)
  );
  return {
    cssVariables: { ...compiled.cssVariables },
    cssString: emitThemeCss(compiled, containerScope(brandTenantSelector(tenantSlug))),
    personality: compiled.runtime.personality,
    tokenOverrides: compiled.runtime.tokenOverrides,
    ...(compiled.runtime.recipeProfile
      ? { recipeProfile: compiled.runtime.recipeProfile }
      : {}),
    ...(compiled.runtime.experienceProfile
      ? { experienceProfile: compiled.runtime.experienceProfile }
      : {}),
    ...(compiled.colorScheme ? { colorScheme: compiled.colorScheme } : {}),
    ...(compiled.modeBlocks.length > 0 ? { modeBlocks: compiled.modeBlocks } : {}),
  };
}
