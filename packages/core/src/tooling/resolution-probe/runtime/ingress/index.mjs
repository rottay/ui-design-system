/**
 * @fileoverview The two tenant ingress arms, on ONE scene.
 *
 * A control has two doors. A code-owned vertical writes it into a static
 * `BrandTheme` (`surfaces.rhythm`), which `compileBrandTheme` lowers into the
 * compiled tenant artifact — an unlayered block behind
 * `:is(html[data-tenant='<slug>'], :where([data-ds-root][data-vertical='<v>']))`.
 * A customer writes it into a DB `TenantTheme` (`appearance.general.rhythm`),
 * which `compileAppearanceVariables` lowers into a flat variable map that the
 * provider applies as INLINE STYLE ON THE DOCUMENT ELEMENT.
 *
 * THOSE ARE TWO DIFFERENT POSITIONS IN THE CASCADE, and that is the whole
 * reason this unit exists. "Static and DB are equivalent" is a claim about the
 * cascade, so it can only be settled by putting both on the SAME DOM, in one
 * run, and diffing the two arms. Two separately-taken runs are not comparable:
 * they differ in browser state, bundle sha and scene, and every one of those
 * differences is a place for a real divergence to hide.
 *
 * TERMINOLOGY, BECAUSE `arm` IS ALREADY TAKEN. `scope.arm` in
 * `foundation/scope` means the tenant SELECTOR arm (legacy `html[data-tenant]`
 * versus provider `[data-ds-root][data-vertical]`). This file's `ingressArm`
 * means the INGRESS DOOR (static BrandTheme versus DB TenantTheme). They are
 * orthogonal: every ingress arm is measured on a scene that carries both
 * selector arms, which is what SSR actually emits.
 *
 * NO SECOND COMPILER, AND NO INVENTED PAYLOAD. This unit composes a POSITION;
 * it never derives a value. The variable map must arrive with a `producedBy`
 * binding naming the module and exported symbol that produced it, and
 * `assertArmProvenance` throws without one. A harness that could synthesise
 * `--ds-rhythm-scale: 1.2` itself would prove that the harness can multiply,
 * which nobody doubts, and would report it as proof that the compiler lowers
 * the stop.
 *
 * NO TENANT SELECTOR IS INVENTED EITHER. The static arm's selector is rebuilt
 * from the SAME vocabulary `foundation/scope` already publishes and the
 * generated artifacts already emit. If that selector shape ever changes, one
 * place changes.
 *
 * @module Tooling/ResolutionProbe/Runtime/Ingress
 */

import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import { CORE_ROOT, fromCoreRoot } from '../../foundation/paths/index.mjs';
import { VERTICALS } from '../../foundation/scope/index.mjs';
import { assertDistFresh } from '../../../../../scripts/packaging/dist-freshness-gate/index.mjs';

/**
 * The two doors, with where each one lands and which compiler owns it.
 *
 * `manifestIngressPath` is the exact key the modern-rescue control manifest
 * names under `ingress`, so a run can be checked against the contract rather
 * than against this file's memory of it.
 */
export const INGRESS_ARMS = Object.freeze({
  'static-brand-theme': Object.freeze({
    id: 'static-brand-theme',
    door: 'static',
    manifestIngressKey: 'staticBrandThemePath',
    position: 'tenant-scoped-stylesheet-block',
    positionMeaning:
      'Appended to the measured bundle behind the same unlayered tenant selector the compiled ' +
      'artifact uses. This is where a code-owned vertical lands: below an inline root write, ' +
      'above the base layer.',
    compilerModule: 'dist/infrastructure/compilers/kernel/runtime/brand-theme/index.js',
    compilerSource: 'src/infrastructure/compilers/kernel/runtime/brand-theme/index.ts',
    compilerExport: 'compileBrandTheme',
  }),
  'db-tenant-theme': Object.freeze({
    id: 'db-tenant-theme',
    door: 'db',
    manifestIngressKey: 'dbTenantThemePath',
    position: 'root-inline-style',
    positionMeaning:
      'Written with setProperty on document.documentElement, which is exactly what the theming ' +
      'provider does with compileAppearanceVariables().variables. This is the strongest ' +
      'position a tenant occupies, and it is ABOVE the static arm.',
    compilerModule: 'dist/infrastructure/compilers/kernel/runtime/appearance/index.js',
    compilerSource: 'src/infrastructure/compilers/kernel/runtime/appearance/index.ts',
    compilerExport: 'compileAppearanceVariables',
  }),
});

export const INGRESS_ARM_IDS = Object.freeze(Object.keys(INGRESS_ARMS));

/**
 * The tenant selector the generated artifacts emit, rebuilt from the scope
 * vocabulary rather than pasted.
 */
export function tenantArmSelector(vertical) {
  const spec = VERTICALS[vertical];
  if (!spec) throw new Error(`resolution-probe: unknown vertical: ${vertical}`);
  if (spec.tenantSlug === null) {
    throw new Error(
      `resolution-probe: --vertical ${vertical} carries no tenant arm, so a static ingress arm ` +
        'has nowhere to land. The tenant-less scope measures the base layer on purpose.',
    );
  }
  return (
    `:is(html[data-tenant='${spec.tenantSlug}'], ` +
    `:where([data-ds-root][data-vertical='${spec.vertical}']))`
  );
}

/**
 * Refuses a payload the harness cannot attribute to a compiler.
 *
 * @param {{module: string, exportName: string, input: unknown, digest?: string}} producedBy
 */
export function assertArmProvenance(producedBy) {
  const missing = ['module', 'exportName', 'input'].filter(
    (field) => producedBy?.[field] === undefined || producedBy?.[field] === null,
  );
  if (!producedBy || missing.length > 0) {
    throw new Error(
      'resolution-probe: an ingress arm needs a producedBy binding naming the compiler module, ' +
        `the exported symbol and the input it lowered (missing: ${
          missing.join(', ') || 'producedBy'
        }). A payload the harness wrote itself proves only that the harness can multiply.`,
    );
  }
  return Object.freeze({ ...producedBy });
}

function assertVariables(variables) {
  const names = Object.keys(variables ?? {});
  if (names.length === 0) {
    throw new Error(
      'resolution-probe: an ingress arm that carries no variable is not a mutation. If the ' +
        'compiler emitted nothing for this stop, that is the finding — record it, do not run a ' +
        'phase against an empty map.',
    );
  }
  const nonCustom = names.filter((name) => !name.startsWith('--'));
  if (nonCustom.length > 0) {
    throw new Error(
      `resolution-probe: ingress arms carry custom properties only; got ${nonCustom.join(', ')}.`,
    );
  }
  return names.sort();
}

/**
 * The static arm: a tenant-scoped block appended to the measured CSS.
 *
 * Appending is what makes REMOVAL exact for this arm. The baseline CSS string
 * is untouched, so the removal phase re-serves that identical string and the
 * restore comparison is between two loads of byte-identical bytes — the
 * stylesheet-level analogue of restoring a preexisting inline value.
 */
export function composeStaticArm({ vertical, variables, producedBy }) {
  const names = assertVariables(variables);
  const provenance = assertArmProvenance(producedBy);
  const selector = tenantArmSelector(vertical);
  const declarations = names.map((name) => `  ${name}: ${variables[name]};`).join('\n');
  const cssBlock = [
    '',
    `/* resolution-probe ingress arm: static-brand-theme (${provenance.exportName}) */`,
    `${selector} {`,
    declarations,
    '}',
    '',
  ].join('\n');

  return Object.freeze({
    armId: 'static-brand-theme',
    vertical,
    position: INGRESS_ARMS['static-brand-theme'].position,
    positionMeaning: INGRESS_ARMS['static-brand-theme'].positionMeaning,
    selector,
    variables: Object.freeze({ ...variables }),
    cssBlock,
    /** Mutation-phase CSS. Removal re-serves the baseline string unchanged. */
    mutateCss: (baselineCss) => `${baselineCss}\n${cssBlock}`,
    provenance,
  });
}

/**
 * The DB arm: a root inline write, which is what the provider performs.
 *
 * It carries no CSS. Its removal is planned by `foundation/causality` from an
 * inline memo taken before the write, so a preexisting inline declaration comes
 * back byte-identical instead of being deleted.
 */
export function composeDbArm({ variables, producedBy }) {
  assertVariables(variables);
  const provenance = assertArmProvenance(producedBy);
  return Object.freeze({
    armId: 'db-tenant-theme',
    position: INGRESS_ARMS['db-tenant-theme'].position,
    positionMeaning: INGRESS_ARMS['db-tenant-theme'].positionMeaning,
    variables: Object.freeze({ ...variables }),
    /** Removal restores the memo; it never writes a "default" back. */
    mutateCss: (baselineCss) => baselineCss,
    provenance,
  });
}

/**
 * Checks the arms against the control manifest's own declared ingress paths.
 *
 * The manifest owns which paths a control is reached through. This asserts the
 * run's arms are those paths and not a pair the harness liked better.
 */
export function assertArmsMatchManifest({ controlManifest, arms }) {
  const declared = controlManifest?.ingress ?? {};
  const failures = [];
  for (const arm of arms) {
    const spec = INGRESS_ARMS[arm.armId];
    if (!spec) {
      failures.push({ armId: arm.armId, reason: 'not a declared ingress arm' });
      continue;
    }
    const path = declared[spec.manifestIngressKey];
    if (typeof path !== 'string' || path.length === 0) {
      failures.push({
        armId: arm.armId,
        reason: `the control manifest declares no ${spec.manifestIngressKey}, so this arm has ` +
          'no contract behind it',
      });
      continue;
    }
    if (arm.provenance?.input?.path !== undefined && arm.provenance.input.path !== path) {
      failures.push({
        armId: arm.armId,
        reason:
          `the arm lowered "${arm.provenance.input.path}" but the manifest declares "${path}"`,
      });
    }
    if (arm.provenance?.module !== spec.compilerModule) {
      failures.push({
        armId: arm.armId,
        reason:
          `the arm claims compiler module "${arm.provenance?.module ?? 'none'}" but the ingress ` +
          `contract requires "${spec.compilerModule}"`,
      });
    }
    if (arm.provenance?.exportName !== spec.compilerExport) {
      failures.push({
        armId: arm.armId,
        reason:
          `the arm claims compiler export "${arm.provenance?.exportName ?? 'none'}" but the ` +
          `ingress contract requires "${spec.compilerExport}"`,
      });
    }
  }
  return { ok: failures.length === 0, failures, declared };
}

/**
 * Builds the document a compiler is asked to lower, at the path the MANIFEST
 * declares.
 *
 * The stop value is not written by this harness — only its LOCATION is, and
 * that location is read from `ingress.staticBrandThemePath` /
 * `ingress.dbTenantThemePath`. So a manifest that moves the door moves this
 * input, and a harness that lowered the old path would be lowering a path the
 * contract no longer names.
 *
 * @param {{armId: string, controlManifest: object, stopId: string, base?: object}} input
 * @returns {{path: string, document: object, stopId: string}}
 */
export function buildIngressInput({ armId, controlManifest, stopId, base = {} }) {
  const spec = INGRESS_ARMS[armId];
  if (!spec) throw new Error(`resolution-probe: unknown ingress arm: ${armId}`);
  const path = controlManifest?.ingress?.[spec.manifestIngressKey];
  if (typeof path !== 'string' || path.length === 0) {
    throw new Error(
      `resolution-probe: the control manifest declares no ${spec.manifestIngressKey}, so this ` +
        'arm has no door to lower through.',
    );
  }
  const stops = controlManifest?.calibration?.normalizedStops ?? [];
  if (!stops.some((entry) => entry.id === stopId)) {
    throw new Error(
      `resolution-probe: "${stopId}" is not a normalized stop of ${controlManifest?.controlId}. ` +
        `Declared: ${stops.map((entry) => entry.id).join(', ') || 'none'}.`,
    );
  }

  const segments = path.split('.');
  const document = structuredClone(base);
  let cursor = document;
  for (const segment of segments.slice(0, -1)) {
    if (typeof cursor[segment] !== 'object' || cursor[segment] === null) cursor[segment] = {};
    cursor = cursor[segment];
  }
  cursor[segments.at(-1)] = stopId;
  return { path, document, stopId };
}

/**
 * Reshapes the path-built document into the argument shape each compiler
 * FUNCTION actually takes — verified against source, not guessed.
 *
 * `buildIngressInput` builds `document` at the path the MANIFEST declares,
 * which names a position INSIDE a larger tenant document (a DB TenantTheme's
 * `appearance` field, or a static BrandTheme's own root). Neither compiler
 * accepts that larger document as its argument:
 *
 *   - `compileAppearanceVariables(appearance: TenantAppearance)`
 *     (`infrastructure/compilers/kernel/runtime/appearance/index.ts`)
 *     destructures `appearance.general` immediately, and `TenantAppearance`
 *     IS `{ general: TenantAppearanceGeneral, ... }` — so the compiler wants
 *     `document.appearance`, not `document`. Handing it the whole document
 *     (`{appearance:{general:{rhythm}}}`, exactly what `dbTenantThemePath`
 *     builds) makes `appearance.general` read `undefined.general` inside the
 *     compiler, which is this harness's OWN bug reported as a design-system
 *     defect.
 *   - `compileBrandTheme(input: BrandCompilerInput)`
 *     (`infrastructure/compilers/kernel/runtime/brand-theme/index.ts`)
 *     destructures `{ brandTheme, tenantSlug, ... }` immediately.
 *     `document` built from `staticBrandThemePath` (e.g. `surfaces.rhythm`)
 *     IS a `BrandTheme` fragment, so it becomes `input.brandTheme`;
 *     `tenantSlug` is a required SIBLING field the manifest path does not
 *     carry at all, so the caller must supply it.
 */
function toCompilerInput({ armId, document, tenantSlug }) {
  if (armId === 'db-tenant-theme') {
    if (!document || typeof document.appearance !== 'object' || document.appearance === null) {
      throw new Error(
        'resolution-probe: the db-tenant-theme document has no "appearance" object at its root ' +
          '(dbTenantThemePath must read "appearance.<rest>"), so there is nothing to hand ' +
          'compileAppearanceVariables — it destructures appearance.general immediately.',
      );
    }
    return document.appearance;
  }
  if (armId === 'static-brand-theme') {
    if (typeof tenantSlug !== 'string' || tenantSlug.length === 0) {
      throw new Error(
        'resolution-probe: the static-brand-theme arm needs a tenantSlug — compileBrandTheme ' +
          'destructures { brandTheme, tenantSlug } from its input and uses tenantSlug to build ' +
          'the selector, so an arm with no vertical to lower for has nowhere to compile FOR. ' +
          'Pass `vertical` to lowerStop().',
      );
    }
    return { brandTheme: document, tenantSlug };
  }
  throw new Error(`resolution-probe: unknown ingress arm: ${armId}`);
}

/** The tenant slug `compileBrandTheme` needs, from the SAME vocabulary `tenantArmSelector` reads. */
function deriveTenantSlug(vertical) {
  if (!vertical) {
    throw new Error(
      'resolution-probe: the static-brand-theme arm needs --vertical to know which tenant slug ' +
        'compileBrandTheme should compile for.',
    );
  }
  const spec = VERTICALS[vertical];
  if (!spec || spec.tenantSlug === null) {
    throw new Error(
      `resolution-probe: "${vertical}" is not a tenant-bearing vertical, so a static arm has no ` +
        'slug to compile for.',
    );
  }
  return spec.tenantSlug;
}

/**
 * Runs one compiler and keeps only the channels the manifest declares.
 *
 * FAIL-CLOSED ON AN EMPTY LOWERING. A compiler that emits none of the declared
 * channels for a valid stop is a finding — the door does not lower the control
 * — and it must surface as a thrown error rather than as an arm carrying an
 * empty map, which the causal run would later report as "the control moved
 * nothing".
 *
 * `compile` is passed in (from `loadCompilerArms` or a test double), so the
 * extraction mechanics are provable without a build.
 *
 * @param {object} input
 * @param {string} [input.vertical]
 *   Required for `static-brand-theme` — the tenant `compileBrandTheme` is
 *   compiling for. Unused (and not required) for `db-tenant-theme`, which
 *   compiles a TenantAppearance document that carries no vertical concept.
 */
export function lowerStop({
  armId,
  controlManifest,
  stopId,
  compile,
  base = {},
  provenance = {},
  vertical = null,
}) {
  const input = buildIngressInput({ armId, controlManifest, stopId, base });
  const tenantSlug = armId === 'static-brand-theme' ? deriveTenantSlug(vertical) : null;
  const compilerInput = toCompilerInput({ armId, document: input.document, tenantSlug });
  const compiled = compile(compilerInput);
  const emitted = compiled?.variables ?? compiled?.cssVariables ?? compiled;
  if (!emitted || typeof emitted !== 'object') {
    throw new Error(
      `resolution-probe: ${armId} compiler returned no variable map for stop "${stopId}".`,
    );
  }
  const channels = controlManifest?.declaredOutputs?.channels ?? [];
  if (channels.length === 0) {
    throw new Error(
      'resolution-probe: the control manifest declares no output channels, so there is nothing ' +
        'to extract from the compiler output and no way to tell a lowering from a no-op.',
    );
  }
  const variables = {};
  for (const channel of channels) {
    if (Object.hasOwn(emitted, channel)) variables[channel] = String(emitted[channel]);
  }
  if (Object.keys(variables).length === 0) {
    throw new Error(
      `resolution-probe: ${armId} lowered "${stopId}" through ${input.path} and emitted none of ` +
        `the declared channels (${channels.join(', ')}). That is the finding; it is not an arm.`,
    );
  }
  return {
    variables,
    producedBy: {
      ...provenance,
      module: provenance.module ?? INGRESS_ARMS[armId].compilerModule,
      exportName: provenance.exportName ?? INGRESS_ARMS[armId].compilerExport,
      // `document` is the manifest-path-relative shape (what buildIngressInput
      // builds); `compilerInput` is what was ACTUALLY handed to `compile()`
      // after `toCompilerInput` reshaped it. Both are recorded so a reader can
      // see the reshape happened rather than trust it happened.
      input: { path: input.path, stopId, document: input.document, compilerInput },
      declaredChannels: [...channels],
      emittedChannels: Object.keys(variables).sort(),
      omittedChannels: channels.filter((channel) => !Object.hasOwn(variables, channel)),
    },
  };
}

/**
 * Loads the two compiled compilers so an arm's payload comes from them.
 *
 * IT READS `dist/`, AND SAYS SO. The compilers are TypeScript and this harness
 * runs without a build, so the only thing it can import at run time is the
 * compiled output — which is exactly what `scripts/verticals/build-vertical-artifacts/index.mjs`
 * already does. `dist/` goes stale silently, so the returned provenance carries
 * `freshnessProven: false` and names the authority that answers the question
 * (`node --test scripts/verticals/css-staleness-gate/index.mjs` for the CSS,
 * `dist/build-stamp.json` for the compiled modules). A causal run pairs this
 * with the stale-source guard, which fails when the recorded digest no longer
 * describes the tree.
 *
 * `importModule` is injectable so the mechanics can be tested without a build.
 */
export async function loadCompilerArms({
  importModule = defaultImport,
  assertFresh = () =>
    assertDistFresh({
      packageRoot: CORE_ROOT,
      stampPath: resolve(CORE_ROOT, 'dist/build-stamp.json'),
    }),
} = {}) {
  const freshness = assertFresh();
  if (!freshness?.ok) {
    throw new Error(
      'resolution-probe: compiled ingress arms are stale or their freshness is unproven:\n  ' +
        `${(freshness?.failures ?? ['freshness check returned no proof']).join('\n  ')}`,
    );
  }
  const loaded = {};
  for (const spec of Object.values(INGRESS_ARMS)) {
    const absolute = resolve(CORE_ROOT, spec.compilerModule);
    const module = await importModule(absolute);
    const exported = module?.[spec.compilerExport];
    if (typeof exported !== 'function') {
      throw new Error(
        `resolution-probe: ${spec.compilerModule} exports no callable ${spec.compilerExport}. ` +
          'Refusing to fabricate the arm payload.',
      );
    }
    loaded[spec.id] = {
      armId: spec.id,
      compile: exported,
      provenance: {
        module: fromCoreRoot(absolute),
        sourceOfTruth: spec.compilerSource,
        exportName: spec.compilerExport,
        freshnessProven: true,
        freshnessNote:
          'Compiled output read from dist/ only after dist-freshness-gate verified its build ' +
          'stamp against the current source and build-input fingerprint.',
      },
    };
  }
  return loaded;
}

function defaultImport(absolutePath) {
  return import(pathToFileURL(absolutePath).href);
}
