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
 * The flat shape carries `vertical` BESIDE `tenantSlug`, because they answer two
 * different questions: the vertical decides the ENGINE and the slug decides the
 * SELECTOR. One value once answered both, and a customer tenant -- which the DB
 * door requires and the roster never claims -- had to take a default engine for
 * the pair to keep working. There is no default here now: an unknown or missing
 * vertical is refused.
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
  synthesizesResolution:
    "mutant-fixture-theme-or-tenant-floor-without-merged-patch, and the governed-family wrapper that theme needs",
  domain: "compiles inputs no ThemeIntent can name: a mutated roster leaf, and a tenant floor applied as posture",
});

/**
 * The refusal when a reader asks to lower without naming a valid vertical.
 *
 * Named rather than a bare `Error` so a caller can distinguish it from the load
 * failures above, and worded after the productive law it mirrors
 * (`verticalEngine`, in `compilers/runtime/theme/runtime/ingress/foundation/engine`).
 */
export class UnknownVerticalError extends Error {
  constructor(vertical, tenantSlug) {
    super(
      'theme-lowering: no first-party vertical declares an engine for ' +
        `${JSON.stringify(vertical ?? null)}` +
        (tenantSlug === undefined ? '' : ` (compiling for tenant ${JSON.stringify(tenantSlug ?? null)})`) +
        '. Pass the vertical beside the tenant slug; there is no default engine.',
    );
    this.name = 'UnknownVerticalError';
    this.vertical = vertical ?? null;
    this.tenantSlug = tenantSlug ?? null;
  }
}

/** Published entrypoint the lowering is read from, and the export's name. */
export const LOWERING_MODULE = 'dist/server.js';
export const LOWERING_MODULE_SUBPATH = '@rottay/design-system/server';
/**
 * The name this adapter calls. It is no longer a PUBLISHED name -- WO-CAT-03
 * closed the public door onto `compileThemeIntent` -- so it is read off the
 * internal lowering owner below rather than off `LOWERING_MODULE`.
 */
export const LOWERING_EXPORT = 'compileTheme';
export const LOWERING_SOURCE =
  'src/infrastructure/compilers/runtime/theme/runtime/lowering/index.ts';

/**
 * Deep dist owners the adapter needs beside the published door.
 *
 * `compileTheme` joined this list in WO-CAT-03. It used to be bound off
 * `dist/server.js`, which is precisely what made the single door evadable from
 * outside the package (F-24): a published lowering plus a published lift is a
 * complete second route with no admission on it. It is reached by ABSOLUTE PATH
 * here instead, which no consumer can do through the package's `exports` map --
 * so this support adapter keeps measuring the real compiler while the public
 * surface stays closed.
 */
const LOWERING_OWNER_MODULE =
  'dist/infrastructure/compilers/runtime/theme/runtime/lowering/index.js';
const RESOLVED_CONTRACT =
  'dist/foundation/contracts/composition/tenants/themes/resolved/index.js';
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
/**
 * The five `Governed<T>` families a `Theme` declares, wrapped over a partial
 * fixture -- the same shape `liftAuthoredTheme` produces.
 *
 * It is synthesized HERE, and that is part of this module's declared domain
 * rather than a second lift with a different name. WO-CAT-03 closed the public
 * entry point, and `liftAuthoredTheme` had no other consumer, so the bundler
 * shakes it out of every non-entry chunk: there is no built module left to bind
 * it from. Re-publishing it to keep this adapter fed would re-open exactly the
 * route F-24 measured -- a published lift plus a published lowering is the
 * bypass -- so the support adapter absorbs the six lines instead.
 *
 * TOTAL over the five families, which is the whole point: `readGovernedTheme`
 * reads `.disposition` off each one, so an ABSENT family is a TypeError rather
 * than an omission. An absent family gets the `not-authored` disposition, which
 * that reader drops again, so the compiler sees exactly the object it would
 * have seen.
 */
const GOVERNED_FAMILIES = ['motion', 'charts', 'recipes', 'expressive', 'responsive'];

/* Exported so the architecture gate can hold it to `liftAuthoredTheme` itself:
 * two spellings of one wrap is debt only if nothing proves they agree. */
export function wrapGovernedFamilies(brand) {
  const theme = { ...brand };
  for (const family of GOVERNED_FAMILIES) {
    theme[family] =
      brand[family] === undefined
        ? { value: undefined, disposition: 'not-authored' }
        : { value: brand[family], disposition: undefined };
  }
  return theme;
}

export async function brandThemeLoweringAdapter({
  module,
  coreRoot,
  importModule = importByPath,
}) {
  const {
    resolveAdapter,
    emitThemeCss,
    containerScope,
    brandTenantSelector,
    verticalEngine,
  } = module;
  for (const [name, value] of Object.entries({
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
  const roster = await importModule(join(coreRoot, VERTICAL_ROSTER));
  if (typeof roster.getFirstPartyVertical !== 'function') {
    throw new Error(
      `theme-lowering: ${VERTICAL_ROSTER} exports no getFirstPartyVertical.`,
    );
  }
  /* The lowering and the lift are INTERNAL now, so they are bound off their own
   * dist owners rather than off the published entry point. A missing one is the
   * same refusal as a missing published name: this adapter never fabricates. */
  const loweringOwner = await importModule(join(coreRoot, LOWERING_OWNER_MODULE));
  const { compileTheme } = loweringOwner;
  if (typeof compileTheme !== 'function') {
    throw new Error(
      'theme-lowering: the internal lowering owner exports no compileTheme; ' +
        'refusing to fabricate the lowering.',
    );
  }
  /* A first-party vertical's engine is answered by `verticalEngine`, the same
   * law the productive door calls -- not by re-reading the roster row here,
   * which is how four sites once grew four spellings of one question. The
   * roster is consulted only for MEMBERSHIP, and a vertical it does not claim is
   * REFUSED: there is no engine resolution here without a valid vertical.
   *
   * The tenant slug is a separate argument and does not decide anything; it is
   * carried so a refusal can name the tenant that was being compiled for. A
   * customer tenant -- `probe-tenant-rottay`, the only slug shape the DB door
   * accepts -- has no roster row by construction, which is why fail-closing on
   * the SLUG refused every legitimate reader and fail-closing on the VERTICAL
   * refuses none of them. */
  const adapters = new Map();
  const adapterFor = (vertical, tenantSlug) => {
    if (typeof vertical !== 'string' || !roster.getFirstPartyVertical(vertical)) {
      throw new UnknownVerticalError(vertical, tenantSlug);
    }
    const engine = verticalEngine(vertical);
    if (!adapters.has(engine)) adapters.set(engine, resolveAdapter(engine));
    return adapters.get(engine);
  };

  return function lowerBrandTheme(input = {}) {
    const { brandTheme, tenantPatch, vertical } = input;
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
    const theme = { ...wrapGovernedFamilies(brandTheme ?? {}), id: slug };
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
    const compiled = compileTheme(resolution, adapterFor(vertical, slug));
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
