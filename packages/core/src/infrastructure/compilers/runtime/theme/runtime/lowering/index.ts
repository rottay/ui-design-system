import type { ThemeCompilation } from "@/foundation/contracts/composition/tenants/themes/compiled";
import type {
  EngineAdapter,
  EngineThemeCompilation,
} from "@/foundation/contracts/composition/tenants/themes/engine-adapter";
import { themeToBrandTheme } from "@/foundation/contracts/composition/tenants/themes/iso";
import type {
  BrandCompilerProvenanceInput,
  ThemeResolution,
} from "@/foundation/contracts/composition/tenants/themes/resolved";
import { compileBrandTheme } from "@/infrastructure/compilers/kernel/runtime/brand-theme";

/**
 * The future facade over the single lowering. `tenantAuthored` is the sole
 * discriminant: an empty `authoredPaths` from a real tenant is not the same
 * fact as "no tenant", and object identity does not survive a second module
 * instance, a structured clone or any transport.
 */
export function compileTheme(
  resolution: ThemeResolution,
  adapter: EngineAdapter
): EngineThemeCompilation {
  const tenant = resolution.provenance.tenantAuthored;
  const input: BrandCompilerProvenanceInput = {
    brandTheme: themeToBrandTheme(resolution.theme),
    tenantSlug: resolution.theme.id,
    tenantAuthoredPaths: tenant ? resolution.provenance.authoredPaths : undefined,
    tenantPatch: tenant ? resolution.provenance.floors : undefined,
    tenantStatusSeedAuthorship: tenant
      ? resolution.provenance.statusSeedAuthorship
      : undefined,
  };
  const brand = compileBrandTheme(input);
  const compiled: ThemeCompilation = {
    cssVariables: brand.cssVariables,
    modeBlocks: brand.modeBlocks ?? [],
    ...(brand.colorScheme ? { colorScheme: brand.colorScheme } : {}),
    runtime: {
      personality: brand.personality,
      tokenOverrides: brand.tokenOverrides,
      ...(brand.recipeProfile ? { recipeProfile: brand.recipeProfile } : {}),
      ...(brand.experienceProfile ? { experienceProfile: brand.experienceProfile } : {}),
    },
  };
  return { ...compiled, engine: adapter.id, projection: adapter.project(compiled) };
}
