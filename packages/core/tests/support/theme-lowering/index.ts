/**
 * @fileoverview Test harness that drives the SOLE lowering from a BrandTheme.
 *
 * This is not a second lowering and not a compatibility door. It builds a
 * canonical `ThemeResolution` from an authored `BrandTheme` fixture, calls the
 * one public `compileTheme`, and re-flattens the result into the field names
 * the existing suites assert on (`personality`, `tokenOverrides`, `cssString`).
 * The lift is the lowering's own wrap-only intake, never the ISO normalizer, so
 * a sparse fixture reaches the compiler exactly as it was authored.
 * Productive code must never import it; the single-door architecture test
 * asserts exactly that.
 */

import type { BrandTheme } from "@/foundation/contracts/composition/tenants/themes";
import type { Theme } from "@/foundation/contracts/composition/tenants/themes/iso";
import type {
  ThemeCompilationModeBlock,
  ThemeCompilationRuntime,
} from "@/foundation/contracts/composition/tenants/themes/compiled";
import type { BrandThemeMode } from "@/foundation/contracts/composition/tenants/themes";
import type {
  TenantAuthoredPaths,
  ThemeLayerPatch,
} from "@/foundation/contracts/composition/tenants/themes/iso";
import { liftAuthoredTheme } from "@/infrastructure/compilers/runtime/theme/runtime/lowering/foundation/intake";
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
  compileTheme,
  containerScope,
  emitThemeCss,
  resolveAdapter,
} from "@/infrastructure/compilers/runtime/theme";
import { brandTenantSelector } from "@/infrastructure/compilers/kernel/foundation/css/tenant-selectors";

/** The legacy compile input shape the suites still spell. */
export interface BrandThemeFixtureInput {
  brandTheme: BrandTheme;
  tenantSlug?: string;
  tenantAuthoredPaths?: TenantAuthoredPaths;
  tenantPatch?: Partial<BrandTheme>;
  tenantStatusSeedAuthorship?: TenantStatusSeedAuthorship;
}

/** The legacy compile output shape the suites still assert on. */
export interface BrandThemeFixtureCompilation {
  cssVariables: Record<string, string>;
  cssString: string;
  personality: ThemeCompilationRuntime["personality"];
  tokenOverrides: ThemeCompilationRuntime["tokenOverrides"];
  recipeProfile?: string;
  experienceProfile?: string;
  colorScheme?: BrandThemeMode;
  modeBlocks?: readonly ThemeCompilationModeBlock[];
}

/**
 * Compile one authored BrandTheme through the canonical pipeline.
 */
export function lowerBrandThemeFixture(
  input: BrandThemeFixtureInput
): BrandThemeFixtureCompilation {
  const { brandTheme, tenantPatch } = input;
  // A floor with no declared authorship is a floor with an EMPTY claim set --
  // the same compile, because the seed derivations the retired door skipped are
  // no-ops over an empty set. Merging the floor into the theme would NOT be the
  // same: the tenant posture is applied last, above every vertical writer.
  const tenantAuthoredPaths =
    input.tenantAuthoredPaths ?? (tenantPatch !== undefined ? new Set<string>() : undefined);
  const slug = input.tenantSlug ?? brandTheme.id;
  const provenance: ThemeProvenance =
    tenantAuthoredPaths === undefined
      ? EMPTY_PROVENANCE
      : {
          tenantAuthored: true,
          authoredPaths: tenantAuthoredPaths,
          floors: (tenantPatch ?? {}) as ThemeFloors,
          statusSeedAuthorship:
            input.tenantStatusSeedAuthorship ??
            deriveTenantStatusSeedAuthorship((tenantPatch ?? {}) as ThemeLayerPatch),
        };
  const theme = { ...liftAuthoredTheme(brandTheme), id: slug };
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
  tenantPatch?: Partial<BrandTheme>;
  tenantStatusSeedAuthorship?: TenantStatusSeedAuthorship;
}

export function lowerTheme(
  theme: Theme,
  slugOrOptions: string | LowerThemeProvenanceOptions = theme.id
): BrandThemeFixtureCompilation {
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
