/**
 * @fileoverview The two tenant ingress arms, on ONE scene.
 *
 * A control has two doors. A code-owned vertical writes it into a static
 * `BrandTheme` (`surfaces.rhythm`), which `compileBrandTheme` lowers into the
 * compiled tenant artifact — an unlayered block behind
 * `:is(html[data-tenant='<slug>'], :where([data-ds-root][data-vertical='<v>']))`.
 * A customer writes it into a DB `TenantTheme` (`appearance.general.rhythm`),
 * which `compileTenantThemeConfig` compiles into a `TenantThemeArtifact` whose
 * `variables` map is applied as INLINE STYLE ON THE DOCUMENT ELEMENT.
 *
 * The DB door is `compileTenantThemeConfig` and only that;
 * `RETIRED_DB_COMPILER_EXPORTS` makes rebinding to a retired lowering a
 * load-time throw. Each retired spelling still lowers a stop to a plausible
 * number, so a rebound arm goes GREEN while measuring a door no customer theme
 * travels through.
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

import { createHash } from 'node:crypto';
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
    /* H-1, 2026-08-23 (V1). This arm COMPOSES the stop over the vertical's
     * published baseline BrandTheme (`dist/index.js` -> `<vertical>BrandTheme`),
     * it does not lower the stop alone.
     *
     * Before H-1 it compiled a ONE-FIELD theme built from the ingress keypath
     * and nothing else. `compileBrandTheme` was behaving correctly on that
     * input -- its density seed is authored-preserving,
     * `String(bt.surfaces?.densityScale ?? 1)` -- but with no baseline to read,
     * the `?? 1` branch fired and every vertical was measured as if its
     * structural scale were 1. The signature was uniformity across verticals
     * exactly where production diverges: density.mode collapsed bithire (0.9)
     * and evnto (1.125) onto the rottay value, and experience.profile reported
     * one letter-spacing for all three. The compiler was never wrong; the
     * instrument was handing it a theme production does not ship.
     *
     * The DB arm needs no equivalent: `compileTenantThemeConfig` resolves the
     * vertical's baseline itself, which is why it composed correctly all along
     * and why passing `base` to it is a fail-closed error (see `lowerStop`).
     *
     * A stop lowered in ISOLATION remains a legitimate question -- it isolates
     * the stop's own contribution -- but it is not representable in production
     * and must never carry a receipt from this arm; keep it as an advisory,
     * non-receipted run. */
    composesOverVerticalBaseline: true,
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
      'Written with setProperty on document.documentElement from the compiled ' +
      'TenantThemeArtifact.variables. This is the strongest position a tenant occupies, and it ' +
      'is ABOVE the static arm.',
    // A PUBLISHED entrypoint (`exports["./server"]`), never a deep path: a deep import can be
    // tree-shaken out from under the harness without any gate noticing.
    compilerModule: 'dist/server.js',
    compilerModuleSubpath: '@rottay/design-system/server',
    compilerSource: 'src/infrastructure/compilers/composition/tenant-theme/index.ts',
    compilerExport: 'compileTenantThemeConfig',
  }),
});

/** DB compiler exports that are retired and must never be bound again. */
export const RETIRED_DB_COMPILER_EXPORTS = Object.freeze([
  'compileAppearanceVariables',
  'appearanceGeneralToVariables',
  'appearanceAdvancedToVariables',
  'appearanceToVariables',
]);

/** Runs at module load: no code path reaches a browser without passing here. */
export function assertNoRetiredCompilerBinding(arms) {
  for (const spec of Object.values(arms)) {
    if (RETIRED_DB_COMPILER_EXPORTS.includes(spec.compilerExport)) {
      throw new Error(
        `resolution-probe: ingress arm "${spec.id}" binds the RETIRED DB compiler ` +
          `"${spec.compilerExport}". The productive DB door is compileTenantThemeConfig. ` +
          'Rebinding to a retired lowering measures a legacy compat path and reports it as ' +
          'static/DB parity.',
      );
    }
    if (/compilers\/kernel\/runtime\/appearance\//.test(spec.compilerModule)) {
      throw new Error(
        `resolution-probe: ingress arm "${spec.id}" deep-imports the retired appearance ` +
          `compiler module ("${spec.compilerModule}"). Bind a published entrypoint instead.`,
      );
    }
  }
}

assertNoRetiredCompilerBinding(INGRESS_ARMS);

export const INGRESS_ARM_IDS = Object.freeze(Object.keys(INGRESS_ARMS));

/** The only colour shape the ramp derivation reads correctly. Mirrors `isHexColor` in the compiler. */
const HEX_COLOR = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

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
  /* H-1 (V1): the static arm composes its stop ON TOP OF the vertical's published
   * baseline, so WHICH baseline it composed on is part of what the arm claims.
   * A static arm that cannot name its baseline is not under-documented, it is
   * unverifiable: the same stop over two different baselines paints two
   * different scenes, and the reader has no way to tell which one was measured.
   *
   * This is fail-closed rather than best-effort on purpose. The defect H-1
   * corrects was silent precisely because a missing baseline looked like no
   * baseline at all -- the arm lowered a one-field theme and reported numbers
   * that no vertical ships. */
  if (producedBy.exportName === INGRESS_ARMS['static-brand-theme'].compilerExport) {
    const baseline = producedBy.input?.baseline;
    const bad =
      !baseline ||
      typeof baseline.source !== 'string' ||
      baseline.source.length === 0 ||
      typeof baseline.digest !== 'string' ||
      baseline.digest.length === 0;
    if (bad) {
      throw new Error(
        'resolution-probe: the static-brand-theme arm must record which vertical baseline it ' +
          'composed its stop onto (producedBy.input.baseline = { source, digest }). Since H-1 ' +
          'this arm compiles the stop OVER the vertical\'s published BrandTheme, so an arm with ' +
          'no named baseline describes a scene nobody can reconstruct.',
      );
    }
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
export function composeStaticArm({
  vertical,
  variables,
  producedBy,
  modeVariables = {},
  themeModeSelector = null,
}) {
  const names = assertVariables(variables);
  const provenance = assertArmProvenance(producedBy);
  const selector = tenantArmSelector(vertical);
  const declare = (map) =>
    Object.keys(map)
      .sort()
      .map((name) => `  ${name}: ${map[name]};`)
      .join('\n');

  /* M-1 — ONE BLOCK PER SCOPE THE COMPILER WRITES, not one block total.
   *
   * `compileBrandTheme` emits a base block plus one block per authored
   * non-default mode, and the mode block carries one attribute more, so in that
   * mode it outranks the base. An arm that appends only the base block is
   * therefore INERT in the non-default mode -- not because the control is
   * inert, but because the arm never spoke in the scope that governs there.
   *
   * The mode blocks carry the DELTA the compiler put in them, which is often
   * empty for a given control: the five closed controls have no declared
   * channel in any mode block, so their arm CSS is byte-identical to before
   * this change. That is measured, and it is the invariance fence.
   *
   * SPECIFICITY IS NOT RAISED. The mode block is emitted at the compiler's own
   * mode grammar; nothing is duplicated or `:is()`-stacked to win a comparison.
   * A block that won without modelling anything would be building around the
   * guard, not through it. */
  const modes = Object.keys(modeVariables)
    .filter((mode) => Object.keys(modeVariables[mode] ?? {}).length > 0)
    .sort();
  if (modes.length > 0 && typeof themeModeSelector !== 'function') {
    throw new Error(
      'resolution-probe: the static arm lowered mode blocks but was handed no themeModeSelector. ' +
        'The mode grammar is the COMPILER\'s (it exports `themeModeSelector` for exactly this), ' +
        'and spelling it here would keep matching a grammar the compiler had already left.',
    );
  }
  const blocks = [
    `${selector} {\n${declare(variables)}\n}`,
    ...modes.map((mode) => `${themeModeSelector(selector, mode)} {\n${declare(modeVariables[mode])}\n}`),
  ];
  const cssBlock = [
    '',
    `/* resolution-probe ingress arm: static-brand-theme (${provenance.exportName}) */`,
    ...blocks,
    '',
  ].join('\n');

  return Object.freeze({
    armId: 'static-brand-theme',
    vertical,
    position: INGRESS_ARMS['static-brand-theme'].position,
    positionMeaning: INGRESS_ARMS['static-brand-theme'].positionMeaning,
    selector,
    /** The scopes this arm actually writes: the base, plus one per compiled mode. */
    modeSelectors: Object.freeze(
      Object.fromEntries(modes.map((mode) => [mode, themeModeSelector(selector, mode)])),
    ),
    variables: Object.freeze({ ...variables }),
    modeVariables: Object.freeze(
      Object.fromEntries(modes.map((mode) => [mode, Object.freeze({ ...modeVariables[mode] })])),
    ),
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
    /* MEMBERSHIP, not equality — and only membership.
     *
     * A declared door may be a SET (`palette.{primaryColor,...}`), in which case
     * the arm lowers exactly one member and records THAT as its path. Exact
     * equality would fail every brace-set run on a correct arm. Widening it to
     * membership is the whole change: a path that is not a member is still a
     * failure, and a declared set this harness cannot enumerate is a failure
     * too rather than a reason to skip the check. */
    if (arm.provenance?.input?.path !== undefined) {
      let members;
      try {
        members = ingressPathMembers(path);
      } catch (error) {
        failures.push({ armId: arm.armId, reason: error.message });
        members = null;
      }
      if (members !== null && !members.includes(arm.provenance.input.path)) {
        failures.push({
          armId: arm.armId,
          reason:
            `the arm lowered "${arm.provenance.input.path}" but the manifest declares "${path}"` +
            (members.length > 1 ? ` (members: ${members.join(', ')})` : ''),
        });
      }
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
/**
 * A declared ingress path is either ONE keypath or a SET of them.
 *
 * `palette.{primaryColor,secondaryColor,accentColor,backgroundColor}` names four
 * real, all-valid fields — not a wildcard and not prose. That is a different
 * class from the `density.mode` slash-join, where one half was simply wrong:
 * here every member is a door a tenant can write, and a run writes exactly one.
 *
 * So the set is RESOLVED, never expanded: the stop names its role and the role
 * selects the member. That keeps "one control, one static door, one DB door" —
 * the door IS the set — and it keeps the registry, the schema and the generator
 * out of it entirely, since `ingress` is derived from two scalar strings there.
 *
 * @param {string} declared the manifest's ingress path, with or without a brace set
 * @returns {readonly string[]} the members, in declaration order; `[declared]` when there is no set
 */
export function ingressPathMembers(declared) {
  const open = declared.indexOf('{');
  const close = declared.indexOf('}');
  if (open === -1 && close === -1) return Object.freeze([declared]);
  if (open === -1 || close === -1 || close < open || declared.indexOf('{', open + 1) !== -1) {
    throw new Error(
      `resolution-probe: the ingress path "${declared}" has an unbalanced or nested brace set. ` +
        'A door this harness cannot enumerate is a door it must not guess at.',
    );
  }
  const prefix = declared.slice(0, open);
  const suffix = declared.slice(close + 1);
  const members = declared
    .slice(open + 1, close)
    .split(',')
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
  if (members.length === 0) {
    throw new Error(
      `resolution-probe: the ingress path "${declared}" declares an EMPTY brace set, so it names ` +
        'no door at all.',
    );
  }
  return Object.freeze(members.map((member) => `${prefix}${member}${suffix}`));
}

/**
 * Which member of a declared set a ROLE selects.
 *
 * The two doors spell the same role differently — `palette.primaryColor` on the
 * static side, `appearance.general.palette.primary` on the DB side — so the
 * match is on the final segment with a trailing `Color` removed, and it must be
 * UNIQUE. Two candidates is not a tie to break on a convention; it is a door
 * this harness cannot attribute, and it fails closed.
 *
 * @param {string} declared the manifest's ingress path
 * @param {string} role     the role the stop names
 */
export function resolveIngressMember(declared, role) {
  const members = ingressPathMembers(declared);
  if (members.length === 1 && members[0] === declared) return declared;
  if (typeof role !== 'string' || role.length === 0) {
    throw new Error(
      `resolution-probe: the ingress path "${declared}" is a SET of ${members.length} doors, so a ` +
        'stop must name which role it writes. A stop with no role cannot select a member, and ' +
        'picking one for it would measure a door nobody declared.',
    );
  }
  const matches = members.filter((member) => {
    const last = member.split('.').at(-1);
    return last === role || last.replace(/Color$/, '') === role;
  });
  if (matches.length !== 1) {
    throw new Error(
      `resolution-probe: role "${role}" selects ${matches.length} members of the ingress set ` +
        `"${declared}" (${members.join(', ')}). Exactly one is required.`,
    );
  }
  return matches[0];
}

/** Read a dotted keypath out of a document; `undefined` when any hop is absent. */
function readKeypath(document, path) {
  let cursor = document;
  for (const segment of path.split('.')) {
    if (cursor === null || typeof cursor !== 'object') return undefined;
    cursor = cursor[segment];
  }
  return cursor;
}

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
  const stop = stops.find((entry) => entry.id === stopId);
  if (!stop) {
    throw new Error(
      `resolution-probe: "${stopId}" is not a normalized stop of ${controlManifest?.controlId}. ` +
        `Declared: ${stops.map((entry) => entry.id).join(', ') || 'none'}.`,
    );
  }
  /* The door may be a SET; the stop's role selects the member this run writes.
   * Everything downstream — the document, the patch, the recorded provenance
   * path — is about that ONE member, which is what makes "the other roles did
   * not move" a claim about a door rather than about a wish. */
  const resolvedPath = resolveIngressMember(path, stop.role);

  /* W-A — the IDENTITY stop, and the first identity in this programme that
   * depends on the vertical.
   *
   * `radius suave` and `density normal` are constant enum ids, so their
   * identity is a literal in the manifest. A colour identity is not: it is
   * "whatever THIS vertical already authors", which differs per vertical
   * (#3A6FB0 / #171717 / #FFFFFF, measured). So an identity stop declares no
   * value and is resolved HERE, against the arm's own baseline document.
   *
   * FAIL-CLOSED, and this is the half that matters: an arm with no baseline
   * cannot resolve an identity, and inventing one — the vertical's value read
   * from somewhere else, or the DS default — would silently measure a
   * DIFFERENT scene than the one the stop names. The DB arm takes no base by
   * law (H-1 V5), so an identity stop is a static-arm claim and says so
   * instead of quietly becoming something else.
   */
  const ingressValue = stop.identity === true
    ? resolveIdentityValue({ controlManifest, stop, base, resolvedPath, armId })
    : ingressValueForStop({ controlManifest, stop });

  const segments = resolvedPath.split('.');
  const document = structuredClone(base);
  let cursor = document;
  for (const segment of segments.slice(0, -1)) {
    if (typeof cursor[segment] !== 'object' || cursor[segment] === null) cursor[segment] = {};
    cursor = cursor[segment];
  }
  cursor[segments.at(-1)] = ingressValue;

  /* B-1: the stop, written at the same path into an EMPTY object.
   *
   * This IS the tenant patch of the scenario, and it is the whole reason the
   * static arm can now be measured at all. Before B-1 the arm handed the
   * compiler `document` -- baseline and stop already flattened into one object
   * -- so no lowering could tell a tenant's deliberate selection from the
   * vertical's own baseline authoring, and the vertical always won. Handing the
   * two floors over separately is what lets the compiler apply the owner's law;
   * `document` stays for the provenance record, so a reader can still see the
   * merged shape that used to be the only thing that existed. */
  const patch = {};
  let patchCursor = patch;
  for (const segment of segments.slice(0, -1)) {
    patchCursor[segment] = {};
    patchCursor = patchCursor[segment];
  }
  patchCursor[segments.at(-1)] = ingressValue;
  return { path: resolvedPath, declaredPath: path, document, patch, stopId, ingressValue };
}

/**
 * What a tenant actually WRITES at the ingress path for one normalized stop.
 *
 * A stop has two halves and they are not always the same thing. `id` is the
 * stop's NAME; `value` is the normalized number it stands for. For a
 * `closed-enum` control the tenant writes the name — `surfaces.rhythm: 'airy'`
 * — and `value` records the factor that name resolves to downstream. For a
 * `bounded` control the tenant writes the NUMBER — `surfaces.effectIntensity:
 * 0.6` — and `id` is only a human label this programme gave it.
 *
 * Writing the id for a bounded control produces the most convincing false
 * negative this harness can produce, and it is not hypothetical: the static
 * lowering of `surfaces.effectIntensity` is `String(su.effectIntensity ?? 1)`
 * with no numeric guard, so it would emit `--ds-effect-intensity: mate`. That
 * name is not a `<number>`, `--ds-effect-intensity` is a registered
 * `@property` with `initial-value: 1`, and an invalid value on a registered
 * property falls back to the initial value. Every stop would then paint
 * exactly what the baseline paints and the run would report a live control as
 * INERT — while the arm still carried a non-empty variable map, so no
 * existing guard would fire.
 *
 * A `profile-id` control is a THIRD shape and not a spelling of the first. The
 * tenant writes an opaque versioned registry id (`rottay/bithire-technical@1`),
 * so `id` is the written value exactly as `closed-enum`'s is — but the closed
 * set is NOT `domain.enumValues`, which is empty by contract for this kind. It
 * is `calibration.catalog`, the closed first-party REGISTRY that grows by
 * registration rather than by schema change. Reading the closure from the
 * catalog is what keeps this branch fail-closed instead of turning
 * "enumValues is empty" into "anything may be written".
 *
 * So the shape is read from `domain.kind` rather than guessed per control, and
 * every other kind fails closed: a control whose ingress value this function
 * cannot derive from the contract must not be lowered on a remembered
 * convention.
 */
function ingressValueForStop({ controlManifest, stop }) {
  const kind = controlManifest?.domain?.kind;
  const controlId = controlManifest?.controlId ?? 'unknown control';
  if (kind === 'closed-enum') {
    const enumValues = controlManifest?.domain?.enumValues ?? [];
    if (enumValues.length > 0 && !enumValues.includes(stop.id)) {
      throw new Error(
        `resolution-probe: stop "${stop.id}" of ${controlId} is not one of the closed-enum ` +
          `domain values (${enumValues.join(', ')}), so a tenant could not write it at the ` +
          'ingress path.',
      );
    }
    return stop.id;
  }
  if (kind === 'bounded') {
    if (typeof stop.value !== 'number' || !Number.isFinite(stop.value)) {
      throw new Error(
        `resolution-probe: ${controlId} has a bounded domain, so a tenant writes the NUMBER at ` +
          `the ingress path — but stop "${stop.id}" declares no finite numeric value ` +
          `(got ${JSON.stringify(stop.value)}). Writing the stop NAME into a numeric field ` +
          'lowers an invalid value, which a registered @property silently replaces with its ' +
          'initial value, and the run then reports a live control as inert.',
      );
    }
    return stop.value;
  }
  if (kind === 'profile-id') {
    // A profile id is an OPAQUE, versioned registry id — `rottay/bithire-technical@1`.
    // It is written verbatim: no trimming, no normalisation, no version stripping.
    // A silently-rewritten id is the same class of false negative the bounded
    // branch guards against, because `validateExperienceProfileSelection` rejects
    // fail-closed and a rejected selection paints exactly what the baseline paints.
    if (typeof stop.id !== 'string' || stop.id.length === 0) {
      throw new Error(
        `resolution-probe: ${controlId} has a profile-id domain, so a tenant writes the registry ` +
          `ID at the ingress path — but this stop declares no non-empty string id ` +
          `(got ${JSON.stringify(stop.id)}).`,
      );
    }
    // Closed by REGISTRY, not by schema: `domain.enumValues` is empty by contract
    // for this kind, and the closed set lives in `calibration.catalog`. So the
    // closure check reads the catalog — the same law `closed-enum` applies to
    // `enumValues`. An empty/absent catalog does not open the domain silently.
    const catalog = controlManifest?.calibration?.catalog ?? [];
    if (!Array.isArray(catalog) || catalog.length === 0) {
      throw new Error(
        `resolution-probe: ${controlId} declares a profile-id domain but no ` +
          '`calibration.catalog`, so the closed registry that bounds it is unreadable. ' +
          'Refusing to lower an unbounded profile id.',
      );
    }
    if (!catalog.includes(stop.id)) {
      throw new Error(
        `resolution-probe: stop "${stop.id}" of ${controlId} is not in the closed profile ` +
          `registry (${catalog.join(', ')}), so a tenant could not write it at the ingress path.`,
      );
    }
    return stop.id;
  }
  if (kind === 'color-set') {
    /* A tenant writes the COLOR at the role's keypath. Which keypath is
     * `resolveIngressMember`'s job; this decides only WHAT is written.
     *
     * HEX ONLY, AND THIS IS THE GUARD THE CONTROL EXISTS FOR. Measured on
     * `deriveTenantColorRamps` at HEAD: a non-hex seed does NOT throw and does
     * not produce NaN. `hexToRgbFloat` runs `parseInt(value, 16)`, which is NaN
     * for any non-hex, and `NaN >> 16 & 255` is 0 in JS -- so the seed silently
     * becomes BLACK and derives a perfectly plausible GREY ramp. `rebeccapurple`
     * and `rgb(59, 130, 246)` are both valid CSS colours and both collapse this
     * way.
     *
     * That is the worst shape a false green can take here: the channel MOVES, so
     * a probe asking "did it move?" answers yes and certifies as live a control
     * that is throwing the tenant's colour away. The `bounded` branch above
     * refuses a stop name in a numeric field for exactly this reason; this is
     * the same law for the same failure.
     *
     * IT IS A HARNESS RESTRICTION, NOT A PRODUCT ONE. The DB compiler accepts
     * functional colour syntax; what this branch refuses to do is LOWER a value
     * whose downstream meaning it cannot predict on both arms. Recorded in the
     * control manifest rather than left as an implied product law.
     */
    if (typeof stop.value !== 'string' || !HEX_COLOR.test(stop.value)) {
      throw new Error(
        `resolution-probe: ${controlId} has a color-set domain, so a tenant writes a COLOUR at ` +
          `the ingress path — but stop "${stop.id}" declares ${JSON.stringify(stop.value)}, which ` +
          'is not a hex colour (#rgb or #rrggbb). A non-hex seed does not fail: the ramp ' +
          'derivation reads it as black and emits a grey ramp, so the channel MOVES and the run ' +
          'would report a live control while the tenant colour was discarded.',
      );
    }
    return stop.value;
  }
  throw new Error(
    `resolution-probe: ${controlId} declares domain kind "${kind ?? 'none'}", and this harness ` +
      'only knows how to write a closed-enum stop id, a bounded stop value, a profile-id ' +
      'registry id, or a color-set hex colour at an ingress path. Refusing to lower a stop on a ' +
      'remembered convention.',
  );
}

/**
 * W-A — the value an IDENTITY stop writes: the one the arm's own baseline
 * already authors at this door.
 *
 * @param {{controlManifest: object, stop: object, base: object, resolvedPath: string, armId: string}} input
 */
function resolveIdentityValue({ controlManifest, stop, base, resolvedPath, armId }) {
  const controlId = controlManifest?.controlId ?? 'unknown control';
  const authored = readKeypath(base ?? {}, resolvedPath);
  if (authored === undefined || authored === null || authored === '') {
    throw new Error(
      `resolution-probe: stop "${stop.id}" of ${controlId} is an IDENTITY stop, so its value is ` +
        `whatever the arm's own baseline authors at "${resolvedPath}" — and the ${armId} baseline ` +
        'authors nothing there. An identity that has to be invented is not an identity: it would ' +
        'measure a scene the vertical does not ship. (The db-tenant-theme arm takes no baseline ' +
        'by law, so an identity stop is a static-arm claim.)',
    );
  }
  return authored;
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
 *   - `compileTenantThemeConfig(input): TenantThemeArtifact` takes the
 *     read/compile ENVELOPE (`TenantThemeSimpleDocument &
 *     TenantThemeConfigIdentity`), not the JSONB payload. Two invariants the
 *     manifest path cannot express:
 *       (a) the config's `appearance` IS a flat `TenantAppearanceGeneral`,
 *           whereas `dbTenantThemePath` (`appearance.general.rhythm`) names the
 *           position in the NORMALIZED appearance the artifact reports back. So
 *           the stop moves from `document.appearance.general` to the config's
 *           `appearance`. Both shapes are real; the round trip is asserted by
 *           the manifest-ingress parity drill rather than by this comment.
 *       (b) identity is required and validated, and first-party slugs are
 *           RESERVED — a DB arm must compile for a customer tenant.
 *   - `compileBrandTheme(input: BrandCompilerInput)`
 *     (`infrastructure/compilers/kernel/runtime/brand-theme/index.ts`)
 *     destructures `{ brandTheme, tenantSlug, ... }` immediately.
 *     `document` built from `staticBrandThemePath` (e.g. `surfaces.rhythm`)
 *     IS a `BrandTheme` fragment, so it becomes `input.brandTheme`;
 *     `tenantSlug` is a required SIBLING field the manifest path does not
 *     carry at all, so the caller must supply it.
 */
function toCompilerInput({ armId, document, base, patch, tenantSlug, vertical, schemaVersion }) {
  if (armId === 'db-tenant-theme') {
    const general = document?.appearance?.general;
    if (!general || typeof general !== 'object') {
      throw new Error(
        'resolution-probe: the db-tenant-theme document has no "appearance.general" object ' +
          '(dbTenantThemePath must read "appearance.general.<rest>"), so there is no ' +
          'TenantAppearanceGeneral to put in the TenantThemeConfig.',
      );
    }
    if (!Number.isInteger(schemaVersion)) {
      throw new Error(
        'resolution-probe: the db-tenant-theme arm needs TENANT_THEME_SCHEMA_VERSION from the ' +
          'published module. Refusing to hardcode a contract literal in the harness.',
      );
    }
    return {
      schemaVersion,
      mode: 'simple',
      appearance: structuredClone(general),
      ...dbTenantIdentity(vertical),
    };
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
    /* B-1: the two floors, delivered SEPARATELY.
     *
     * `brandTheme` is the vertical baseline exactly as H-1 loaded it (its
     * provenance law is unchanged: `assertArmProvenance` still demands the
     * source and digest of that baseline, and this reshape does not touch
     * them). `tenantPatch` is the scenario's tenant floor. `compileBrandTheme`
     * treats an absent patch as identity, so a caller that lowers with no base
     * -- the H-1 "without a baseline" comparison, for one -- gets exactly the
     * bytes it got before. */
    if (patch && Object.keys(patch).length > 0) {
      return { brandTheme: base ?? {}, tenantPatch: patch, tenantSlug };
    }
    return { brandTheme: document, tenantSlug };
  }
  throw new Error(`resolution-probe: unknown ingress arm: ${armId}`);
}

/**
 * Identity columns for the DB arm's compile envelope.
 *
 * The slug must NOT be the first-party one: `assertTenantIdentityAllowed`
 * rejects reserved slugs, because a first-party vertical is a code-owned STATIC
 * identity and the DB door belongs to customer tenants. `verticalKey` stays the
 * real vertical so the compile resolves the same code-owned envelope the static
 * arm compiles against — that is what keeps the two arms comparable. The
 * artifact's tenant-scoped `css`/`scopes` are unused here: the harness writes
 * `variables` inline on the root, so the slug never reaches the measured scene.
 */
/* F4B-6: exported so the DATA probe compiles against the SAME probe tenant the
 * CSS DB arm uses. Duplicating these four lines in the DATA runner would create
 * a second authority for the probe identity, and the two instruments could then
 * silently compile against different tenants -- the same class of defect W-C
 * closed for the baseline tuple. One definition, two callers. */
export function dbTenantIdentity(vertical) {
  if (!vertical) {
    throw new Error(
      'resolution-probe: the db-tenant-theme arm needs --vertical to resolve the code-owned ' +
        'vertical envelope compileTenantThemeConfig validates against.',
    );
  }
  const spec = VERTICALS[vertical];
  if (!spec || spec.tenantSlug === null) {
    throw new Error(
      `resolution-probe: "${vertical}" is not a tenant-bearing vertical, so a DB arm has no ` +
        'vertical envelope to compile against.',
    );
  }
  const slug = `${DB_PROBE_TENANT_PREFIX}${vertical}`;
  return { tenantId: slug, slug, verticalKey: vertical, rowVersion: 1 };
}

/** Deterministic, non-reserved customer-tenant slug prefix for the DB arm. */
const DB_PROBE_TENANT_PREFIX = 'probe-tenant-';

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
  baselineSource = null,
  provenance = {},
  vertical = null,
}) {
  /* H-1 (V5): the DB arm resolves its own baseline inside
   * `compileTenantThemeConfig`. Handing it one HERE would apply the vertical
   * twice, and the second application is invisible: the numbers stay plausible
   * because they are still per-vertical, just composed twice. Fail closed
   * instead of trusting every future caller to remember the asymmetry. */
  if (armId === 'db-tenant-theme' && base && Object.keys(base).length > 0) {
    throw new Error(
      'resolution-probe: the db-tenant-theme arm must NOT be given a base. Its compiler ' +
        'resolves the vertical baseline itself, so a base here composes the vertical twice and ' +
        'the double application is silent. Only static-brand-theme takes a base.',
    );
  }
  const input = buildIngressInput({ armId, controlManifest, stopId, base });
  const tenantSlug = armId === 'static-brand-theme' ? deriveTenantSlug(vertical) : null;
  const compilerInput = toCompilerInput({
    armId,
    document: input.document,
    base,
    patch: input.patch,
    tenantSlug,
    vertical,
    schemaVersion: provenance.schemaVersion,
  });
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
  /* M-1 — THE MODE BLOCKS ARE PART OF THE LOWERING, and dropping them was a
   * measurement defect rather than an omission.
   *
   * `compileModeBlocks` re-runs the whole lowering against the mode overlay and
   * emits only the delta against the base, under
   * `<tenant-selector>[data-theme='<mode>'], <tenant-selector>.<mode>` -- one
   * attribute more than the base block, so it OUTRANKS it by specificity in
   * that mode. An arm that carries only `variables` therefore serves a scene
   * production never serves: in the non-default mode the vertical's own overlay
   * is what governs, and the arm has nothing to say about it.
   *
   * Measured before this was written (M-1 design, reproduced by the preaudit):
   * all three first-party verticals author an overlay (rottay light, bithire
   * dark, evnto dark); a tenant seed moves the base block and NOT the mode block
   * (bithire: 22 vs 0); and the DB compiler even ADDS a mode delta that
   * re-asserts the vertical's values precisely to hold that line.
   *
   * Only the DECLARED channels are kept, exactly as for the base map: this is
   * the same extraction, once per compiled mode. */
  const modeVariables = {};
  for (const block of compiled?.modeBlocks ?? []) {
    const perMode = {};
    for (const channel of channels) {
      if (Object.hasOwn(block.cssVariables ?? {}, channel)) {
        perMode[channel] = String(block.cssVariables[channel]);
      }
    }
    modeVariables[block.mode] = perMode;
  }

  return {
    variables,
    modeVariables,
    producedBy: {
      ...provenance,
      module: provenance.module ?? INGRESS_ARMS[armId].compilerModule,
      exportName: provenance.exportName ?? INGRESS_ARMS[armId].compilerExport,
      // `document` is the manifest-path-relative shape (what buildIngressInput
      // builds); `compilerInput` is what was ACTUALLY handed to `compile()`
      // after `toCompilerInput` reshaped it. Both are recorded so a reader can
      // see the reshape happened rather than trust it happened.
      input: {
        path: input.path,
        stopId,
        // The VALUE the tenant writes at `path`, which is the stop id for a
        // closed-enum control and the stop's number for a bounded one. Recorded
        // separately from `stopId` so a reader can see which of the two was
        // lowered instead of inferring it from the document.
        ingressValue: input.ingressValue,
        document: input.document,
        compilerInput,
        /* H-1 (V1): WHICH baseline this stop was composed onto. `document` now
         * carries the whole vertical theme, so diffing two runs by eye is not a
         * practical way to answer that question -- the digest is. Absent (null)
         * on the DB arm, which composes its baseline inside its own compiler
         * and therefore has none to name here; `assertArmProvenance` requires
         * it on the static arm and only there. */
        baseline: baselineProvenance(armId, base, baselineSource),
      },
      declaredChannels: [...channels],
      emittedChannels: Object.keys(variables).sort(),
      omittedChannels: channels.filter((channel) => !Object.hasOwn(variables, channel)),
      /* M-1: which modes the compiler emitted a block for, and how many of the
       * declared channels each one carries. A reader can then tell "this control
       * has nothing in any mode block" (the five closed controls) apart from
       * "this control is governed per mode" without re-deriving it. */
      modeChannels: Object.fromEntries(
        Object.entries(modeVariables).map(([mode, map]) => [mode, Object.keys(map).sort()]),
      ),
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
    // Read from the same published module that supplies the compiler, so the
    // envelope the harness builds can never disagree with the contract version
    // the compiler validates against.
    const schemaVersion = module?.TENANT_THEME_SCHEMA_VERSION;
    if (spec.id === 'db-tenant-theme' && !Number.isInteger(schemaVersion)) {
      throw new Error(
        `resolution-probe: ${spec.compilerModule} exports no TENANT_THEME_SCHEMA_VERSION, so the ` +
          'DB arm cannot build a TenantThemeConfig without hardcoding a contract literal.',
      );
    }
    loaded[spec.id] = {
      armId: spec.id,
      compile: exported,
      /* M-1: the compiler's OWN mode-selector grammar, handed out with the arm.
       * Imported, never reconstructed: `themeModeSelector` is exported for
       * exactly this reason ("Shared explicit-mode selector grammar for static
       * and DB artifact renderers"), and a probe that spelled `[data-theme=...]`
       * itself would keep matching a grammar the compiler had already left. It
       * rides on the arm because that is what the dist-freshness gate above has
       * already proven fresh. */
      themeModeSelector: module?.themeModeSelector ?? null,
      provenance: {
        module: fromCoreRoot(absolute),
        moduleSubpath: spec.compilerModuleSubpath ?? null,
        sourceOfTruth: spec.compilerSource,
        exportName: spec.compilerExport,
        ...(spec.id === 'db-tenant-theme' ? { schemaVersion } : {}),
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

/**
 * Which vertical baseline a static arm composed its stop onto (H-1, V1).
 *
 * `digest` uses plain `JSON.stringify`, not the programme's `canonicalJson`.
 * Deliberate, and the reason is scope rather than laziness: the value being
 * hashed is a frozen module export read from one build, so its key order is
 * stable for the comparison this digest is for -- "is this the same baseline as
 * the other run's" -- and reaching into
 * `scripts/quality-evidence/programs/modern-rescue/cascade-governance.mjs`
 * would couple the instrument to one programme's cascade module for a label.
 * If this digest ever needs to be compared ACROSS tools, canonicalise it then.
 */
function baselineProvenance(armId, base, baselineSource) {
  if (armId !== 'static-brand-theme') return null;
  if (!base || Object.keys(base).length === 0) return null;
  return Object.freeze({
    source: typeof baselineSource === 'string' && baselineSource.length > 0 ? baselineSource : null,
    digest: createHash('sha256').update(JSON.stringify(base)).digest('hex'),
  });
}

/**
 * Does this arm ENCODE the stop at all, or does it merely emit a constant?
 *
 * THE DEFECT THIS CLOSES, twice recorded before it was fixed:
 * `shape.radius-scale#knownDefects[1]` -- "lowerStop fails closed when a
 * compiler emits NONE of the declared channels, but not when it emits one at a
 * constant default. Any control whose declared channel has a non-conditional
 * default can therefore carry a non-empty arm that encodes no stop."
 * Two real instances were measured before this guard existed: radius pointed at
 * `surfaces.borderRadius` lowered `--ds-radius-scale: 1` at all four stops, and
 * density pointed at a prose double keypath lowered `--ds-density-scale: 1` at
 * all three -- with `--ds-density-mode-factor` absent entirely, so the
 * unconditional seed satisfied the empty-lowering guard on its own.
 *
 * THE PREDICATE, and why it is shaped this way. The distinction between a
 * constant default and a legitimate identity stop is NOT a property of any stop:
 * it is a property of the CHANNEL across the stop set. `suave`=1 lowers exactly
 * `1` both when radius is healthy (0.75/0.9/1/1.15 -- it is a value) and when it
 * is anti-doored (1/1/1/1 -- it is the absence of the dial). So an identity stop
 * never needs an exemption; it falls out of a set-level predicate for free.
 *
 * It is EXISTS, not FOR-ALL: a healthy `density.mode` discriminates on ONE of
 * its two declared channels, because `--ds-density-scale` is the vertical's
 * structural scale and is constant within a vertical by construction. A
 * for-all rule would fail a healthy control. Per-channel liveness is a
 * different question, and it belongs to `ingressEquivalence` and the painted
 * witness -- see the README: this guard proves the arm ENCODES the stop, never
 * that the stop PAINTS.
 *
 * K is `declaredOutputs.channels` and nothing wider. The full emitted map would
 * turn "this control declared its channels badly" into "this control is alive".
 *
 * @param {object} input
 * @param {{theme: object, source: string}} [input.baseline]
 *   The static arm's baseline TUPLE, exactly as `loadStaticBaselines()` returns
 *   it. Taking the tuple rather than a bare theme is deliberate: passing the
 *   wrapper where a theme belongs degrades SILENTLY to an empty theme (measured:
 *   bithire lowers `--ds-density-scale: 1` instead of `0.9`, with no error),
 *   and this guard lowers stops OUTSIDE the `composeStaticArm` path where
 *   `assertArmProvenance` would have caught it. So the shape is enforced here,
 *   and the digest is cross-checked against the arm's own.
 */
export function assertStopDiscrimination({
  armId,
  controlManifest,
  compile,
  vertical = null,
  baseline = null,
  provenance = {},
  armBaselineDigest = null,
}) {
  const spec = INGRESS_ARMS[armId];
  if (!spec) throw new Error(`resolution-probe: unknown ingress arm: ${armId}`);

  let base;
  if (armId === 'static-brand-theme') {
    const shapeOk =
      baseline &&
      typeof baseline === 'object' &&
      baseline.theme &&
      typeof baseline.theme === 'object' &&
      typeof baseline.source === 'string' &&
      baseline.source.length > 0;
    if (!shapeOk) {
      throw new Error(
        'resolution-probe: assertStopDiscrimination needs the static arm\'s baseline TUPLE ' +
          '{ theme, source }, exactly as loadStaticBaselines() returns it. A bare theme, or the ' +
          'wrapper passed where the theme belongs, degrades silently to an empty theme and the ' +
          'guard would then measure a scene the scenario never compiles.',
      );
    }
    base = baseline.theme;
    // W-C: the guard and the arm must stand on the SAME baseline. Recomputing
    // the digest and comparing it to the one the arm recorded turns "they
    // should match" into "they are proven to match, per run".
    const digest = baselineProvenance(armId, base, baseline.source)?.digest ?? null;
    if (armBaselineDigest !== null && digest !== armBaselineDigest) {
      throw new Error(
        `resolution-probe: the discrimination guard's baseline (${String(digest).slice(0, 12)}) is ` +
          `not the arm's baseline (${String(armBaselineDigest).slice(0, 12)}). The guard would be ` +
          'certifying a different scene from the one the scenario measures.',
      );
    }
  } else if (baseline) {
    throw new Error(
      'resolution-probe: only the static arm takes a baseline; the DB arm resolves the vertical ' +
        'inside its own compiler (see lowerStop).',
    );
  }

  const channels = controlManifest?.declaredOutputs?.channels ?? [];
  if (channels.length === 0) {
    throw new Error(
      'resolution-probe: the control manifest declares no output channels, so there is no vector ' +
        'in which a stop could be encoded.',
    );
  }
  const stops = controlManifest?.calibration?.normalizedStops ?? [];

  const witnesses = [];
  const excluded = [];
  for (const stop of stops) {
    try {
      const lowered = lowerStop({
        armId,
        controlManifest,
        stopId: stop.id,
        compile,
        vertical,
        provenance,
        ...(armId === 'static-brand-theme' ? { base, baselineSource: baseline.source } : {}),
      });
      witnesses.push({ stopId: stop.id, variables: lowered.variables });
    } catch (error) {
      // A stop that cannot lower on this arm is not a violation. Three
      // legitimate kinds were measured: the compiler eliding a vertical default
      // (radius/suave, typography/normal), the vertical envelope rejecting a
      // stop (radius/recto, effect/estandar), and a domain kind this harness
      // does not lower (motion.dial). They are PUBLISHED with their reason so a
      // small witness set never looks arbitrary.
      excluded.push({ stopId: stop.id, reason: error.message });
    }
  }

  const valuesOf = (channel) =>
    new Set(witnesses.map((w) => (Object.hasOwn(w.variables, channel) ? String(w.variables[channel]) : '\u0000absent')));
  const discriminating = channels.filter((channel) => valuesOf(channel).size > 1);
  const constant = channels.filter((channel) => !discriminating.includes(channel));

  const exception = controlManifest?.calibration?.stopDiscriminationException ?? null;
  const exceptionApplies =
    exception &&
    typeof exception === 'object' &&
    exception.armId === armId &&
    typeof exception.reason === 'string' &&
    exception.reason.length > 0 &&
    typeof exception.adjudicatedBy === 'string' &&
    exception.adjudicatedBy.length > 0;

  const verdict = {
    armId,
    vertical,
    witnesses: witnesses.map((w) => w.stopId),
    discriminating,
    constant,
    excluded,
    exception: exceptionApplies ? { ...exception } : null,
  };

  if (witnesses.length < 2) {
    if (exceptionApplies) return Object.freeze({ ...verdict, outcome: 'PASS_WITH_EXCEPTION' });
    throw new Error(
      `resolution-probe: ${armId} lowered ${witnesses.length} witness stop(s) for ` +
        `${controlManifest?.controlId}; discrimination is NOT DECIDABLE below two. A single ` +
        'witness cannot show that this arm encodes anything. Excluded: ' +
        `${excluded.map((e) => e.stopId).join(', ') || 'none'}. If this control legitimately ` +
        'cannot exhibit two witnesses on this arm, that needs an adjudicated ' +
        'calibration.stopDiscriminationException { armId, reason, adjudicatedBy }, not a silent pass.',
    );
  }

  if (discriminating.length === 0) {
    if (exceptionApplies) return Object.freeze({ ...verdict, outcome: 'PASS_WITH_EXCEPTION' });
    throw new Error(
      `resolution-probe: ${armId} encodes NO stop for ${controlManifest?.controlId}: every ` +
        `declared channel (${channels.join(', ')}) lowers a constant across ` +
        `${witnesses.length} witness stops (${verdict.witnesses.join(', ')}). A non-empty arm ` +
        'carrying a constant default is the false-INERT vector; it is not a measurement.',
    );
  }

  return Object.freeze({ ...verdict, outcome: 'PASS' });
}

/**
 * The published BrandTheme of each first-party vertical, for the static arm to
 * compose its stop onto (H-1).
 *
 * PUBLISHED ENTRYPOINT, never a deep path -- the same law the DB arm follows
 * for `dist/server.js`. `package.json` `exports["."]` resolves to
 * `dist/index.js`, which re-exports the three themes from
 * `src/index.ts`. A deep import into the brand-theme tree could be tree-shaken
 * out from under the harness with no gate noticing.
 *
 * SAME FRESHNESS LAW AS `loadCompilerArms` (V4): the baseline and the compiler
 * must come from ONE verified `dist/`. A fresh compiler composing a stale
 * baseline would be a new way to measure a tree nobody has -- the exact defect
 * class H-1 exists to close.
 */
export async function loadStaticBaselines({
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
      'resolution-probe: the vertical baselines are stale or their freshness is unproven:\n  ' +
        `${(freshness?.failures ?? ['freshness check returned no proof']).join('\n  ')}`,
    );
  }
  const MODULE = 'dist/index.js';
  const module = await importModule(resolve(CORE_ROOT, MODULE));
  const baselines = {};
  // `none` is the tenant-less scope: it has no vertical and therefore no
  // BrandTheme to compose onto. Every other roster entry must have one.
  for (const vertical of Object.keys(VERTICALS).filter((id) => id !== 'none')) {
    const exportName = `${vertical}BrandTheme`;
    const theme = module?.[exportName];
    if (!theme || typeof theme !== 'object') {
      throw new Error(
        `resolution-probe: ${MODULE} exports no BrandTheme for the "${vertical}" vertical ` +
          `(expected ${exportName}). Refusing to fall back to an empty theme: an empty base is ` +
          'exactly the one-field-theme defect H-1 corrects, and it fails silently.',
      );
    }
    baselines[vertical] = Object.freeze({ theme, source: `${MODULE}#${exportName}` });
  }
  return Object.freeze(baselines);
}
