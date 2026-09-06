/**
 * NON-PRODUCTIVE SUPPORT. Test and tooling only; never imported from `src/`.
 *
 * The dist-side call shape for the SOLE theme lowering.
 *
 * The cascade probes, the purity reader and the slot inventory all used to bind
 * `compileBrandTheme` out of `dist/` and call it with a flat
 * `{ brandTheme, tenantSlug, tenantAuthoredPaths, tenantPatch }`. That export is
 * retired: there is one lowering, it takes a resolved theme plus its provenance,
 * and scope belongs to emission.
 *
 * This module is the one place that maps the readers' call shape onto the
 * canonical door. It is not a second lowering — it calls `compileTheme` once and
 * nothing else — and it exists so that a reader keeps measuring the compiler
 * instead of measuring an adapter of its own.
 *
 * It SYNTHESIZES the `ThemeResolution` it lowers, because the productive door
 * cannot express what these readers measure, and that is a CLOSED domain rather
 * than debt awaiting a sunset:
 *
 *   - the slot inventory compiles MUTANTS. It replaces one authored leaf of a
 *     roster theme with a sentinel and diffs the emitted channels, which is how
 *     it learns which leaf feeds which channel. A mutated theme is not a roster
 *     baseline and not a patch over one -- a `ThemeIntent` names a baseline it
 *     cannot name.
 *   - the ingress probe supplies a tenant FLOOR with no merged patch. Resolving
 *     the floor as an intent would merge it at the vertical's position instead
 *     of applying it last as a posture, which is a different compile.
 *
 * A productive import of this module is a defect, not a shortcut, and
 * `THEME_LOWERING_OWNERSHIP` states the rule the architecture gate asserts.
 */

import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

/**
 * Modules are addressed by ABSOLUTE PATH, never by URL: the readers that inject
 * their own loader hand one an absolute path, and a URL passed to a
 * path-expecting loader is silently re-joined onto the package root.
 */
const importByPath = (absolutePath) => import(pathToFileURL(absolutePath).href);

/**
 * The ownership rule, stated in the module so a reader cannot miss it and an
 * executable assertion can bind to it rather than to a comment's wording.
 */
export const THEME_LOWERING_OWNERSHIP = Object.freeze({
  disposition: "non-productive-support",
  productiveConsumers: 0,
  synthesizesResolution: "mutant-fixture-theme-or-tenant-floor-without-merged-patch",
  domain: "compiles inputs no ThemeIntent can name: a mutated roster leaf, and a tenant floor applied as posture",
});

/** Published entrypoint the lowering is read from, and the export's name. */
export const LOWERING_MODULE = 'dist/server.js';
export const LOWERING_MODULE_SUBPATH = '@rottay/design-system/server';
export const LOWERING_EXPORT = 'compileTheme';
export const LOWERING_SOURCE =
  'src/infrastructure/compilers/runtime/theme/runtime/lowering/index.ts';

/** Deep dist owners the adapter needs beside the published lowering. */
const RESOLVED_CONTRACT =
  'dist/foundation/contracts/composition/tenants/themes/resolved/index.js';
const ENGINE_IDENTITY_CONTRACT =
  'dist/foundation/contracts/kernel/engine-identity/index.js';
const VERTICAL_ROSTER =
  'dist/foundation/tokens/ts/presentation/brand-themes/index.js';

/**
 * Build the flat `compile(input, options)` the readers call, over `compileTheme`.
 *
 * `module` must be the loaded published entrypoint. The returned function
 * accepts the legacy input shape and answers with the legacy field names, so a
 * caller that only needs `cssVariables` / `cssString` / `modeBlocks` is
 * unchanged. A tenant floor without its authorship is refused rather than
 * defaulted: the canonical provenance has one tenant discriminant, and quietly
 * supplying an empty authorship would move the seed channels without the reader
 * asking for it.
 */
export async function brandThemeLoweringAdapter({
  module,
  coreRoot,
  importModule = importByPath,
}) {
  const {
    compileTheme,
    liftAuthoredTheme,
    resolveAdapter,
    emitThemeCss,
    containerScope,
    brandTenantSelector,
    verticalEngine,
  } = module;
  for (const [name, value] of Object.entries({
    compileTheme,
    liftAuthoredTheme,
    resolveAdapter,
    emitThemeCss,
    containerScope,
    brandTenantSelector,
    verticalEngine,
  })) {
    if (value === undefined) {
      throw new Error(
        `theme-lowering: ${LOWERING_MODULE_SUBPATH} exports no ${name}; ` +
          'refusing to fabricate the lowering.',
      );
    }
  }
  const resolved = await importModule(join(coreRoot, RESOLVED_CONTRACT));
  const { EMPTY_PROVENANCE, deriveTenantStatusSeedAuthorship } = resolved;
  if (!EMPTY_PROVENANCE || typeof deriveTenantStatusSeedAuthorship !== 'function') {
    throw new Error(
      `theme-lowering: ${RESOLVED_CONTRACT} exports no provenance vocabulary.`,
    );
  }
  const identity = await importModule(join(coreRoot, ENGINE_IDENTITY_CONTRACT));
  if (typeof identity.PRIMARY_ENGINE !== 'string') {
    throw new Error(
      `theme-lowering: ${ENGINE_IDENTITY_CONTRACT} exports no PRIMARY_ENGINE.`,
    );
  }
  const roster = await importModule(join(coreRoot, VERTICAL_ROSTER));
  if (typeof roster.getFirstPartyVertical !== 'function') {
    throw new Error(
      `theme-lowering: ${VERTICAL_ROSTER} exports no getFirstPartyVertical.`,
    );
  }
  /* A first-party vertical's engine is answered by `verticalEngine`, the same
   * law the productive door calls -- not by re-reading the roster row here,
   * which is how four sites once grew four spellings of one question. The
   * roster is consulted only for MEMBERSHIP: a fixture slug that no row claims
   * takes the primary engine here and ONLY here, because these readers measure
   * the compiler over mutants and probe fixtures that are tenants of no
   * vertical, and refusing them the way the productive door does would leave
   * the compiler unmeasured. */
  const adapters = new Map();
  const adapterFor = (slug) => {
    const engine = roster.getFirstPartyVertical(slug)
      ? verticalEngine(slug)
      : identity.PRIMARY_ENGINE;
    if (!adapters.has(engine)) adapters.set(engine, resolveAdapter(engine));
    return adapters.get(engine);
  };

  return function lowerBrandTheme(input = {}) {
    const { brandTheme, tenantPatch } = input;
    /* A FLOOR WITH NO DECLARED AUTHORSHIP maps to a floor with an EMPTY claim
     * set, which is the same compile: the retired door skipped the seed
     * derivations when authorship was absent, and running them over an empty
     * claim set is a no-op (measured across all three verticals). Merging the
     * floor into the theme instead would NOT be equivalent -- the tenant posture
     * is applied last, above every vertical-authored writer, and a merged floor
     * lowers at the vertical's position. */
    const tenantAuthoredPaths =
      input.tenantAuthoredPaths ?? (tenantPatch !== undefined ? new Set() : undefined);
    const slug = input.tenantSlug ?? brandTheme?.id;
    const theme = { ...liftAuthoredTheme(brandTheme ?? {}), id: slug };
    /* Both legs are synthesized because the theme the readers hand in is not a
     * roster baseline: `resolveTheme` now takes a `ThemeIntent`, which NAMES its
     * baseline, and a mutant or probe fixture has no name in the roster. The
     * provenance is the same vocabulary the door produces -- EMPTY_PROVENANCE
     * when there is no tenant, the floor claim set when there is. */
    const resolution =
      tenantAuthoredPaths === undefined
        ? { theme, provenance: EMPTY_PROVENANCE }
        : {
            theme,
            provenance: {
              tenantAuthored: true,
              authoredPaths: tenantAuthoredPaths,
              floors: tenantPatch ?? {},
              statusSeedAuthorship:
                input.tenantStatusSeedAuthorship ??
                deriveTenantStatusSeedAuthorship(tenantPatch ?? {}),
            },
          };
    const compiled = compileTheme(resolution, adapterFor(slug));
    return {
      cssVariables: compiled.cssVariables,
      modeBlocks: compiled.modeBlocks,
      colorScheme: compiled.colorScheme,
      personality: compiled.runtime.personality,
      tokenOverrides: compiled.runtime.tokenOverrides,
      recipeProfile: compiled.runtime.recipeProfile,
      experienceProfile: compiled.runtime.experienceProfile,
      cssString: emitThemeCss(compiled, containerScope(brandTenantSelector(slug))),
    };
  };
}

/** Load the published lowering entrypoint and wrap it for the readers. */
export async function loadBrandThemeLowering({ coreRoot, importModule = importByPath }) {
  const module = await importModule(join(coreRoot, LOWERING_MODULE));
  return {
    module,
    compile: await brandThemeLoweringAdapter({ module, coreRoot, importModule }),
  };
}
