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
 * THE CLOSED SET OF REASONS A STOP MAY BE PUBLISHED AS "EXCLUDED" (R-2 hardening).
 *
 * `assertStopDiscrimination` lowers every declared stop and publishes the ones
 * that could not lower, so a small witness set never looks arbitrary. That
 * catch used to be UNTYPED: any throw at all became an exclusion with its
 * message as the reason. A broken test double, a wiring mistake, a renamed
 * field -- each would have been published as a legitimate reason a stop cannot
 * lower, and the guard would have reported a shrunken witness set as a
 * measurement instead of failing. That is the false-green shape this programme
 * exists to refuse.
 *
 * So the reasons are a CLOSED SET, marked at the throw sites rather than
 * recognised by pattern-matching a message afterwards. Anything not on this
 * list re-throws.
 */
export const STOP_EXCLUSION_CLASSES = Object.freeze({
  /** The compiler elides a vertical default, so the stop lowers no declared channel (radius/suave, typography/normal). */
  COMPILER_ELIDES_VERTICAL_DEFAULT: 'COMPILER_ELIDES_VERTICAL_DEFAULT',
  /** The vertical envelope refuses the stop outright (radius/recto, effect/estandar). */
  VERTICAL_ENVELOPE_REJECTS_STOP: 'VERTICAL_ENVELOPE_REJECTS_STOP',
  /** The governed APCA contrast floor refuses the compiled pair (palette.seeds, per vertical). */
  GOVERNED_CONTRAST_FLOOR: 'GOVERNED_CONTRAST_FLOOR',
  /** A domain kind, or a value in it, this harness will not lower (motion.dial; a non-hex colour). */
  DOMAIN_KIND_NOT_LOWERED: 'DOMAIN_KIND_NOT_LOWERED',
  /** An IDENTITY stop resolves the vertical's own value, so an arm with no baseline cannot lower it (W-A). */
  IDENTITY_NEEDS_A_BASELINE: 'IDENTITY_NEEDS_A_BASELINE',
});

/**
 * A throw that `assertStopDiscrimination` may publish as an exclusion.
 *
 * Carrying the class ON THE ERROR is the whole point: the guard then decides by
 * TYPE, not by recognising prose. A message can be reworded by any future edit
 * without anyone noticing that a fail-closed became a silent exclusion.
 */
export class StopExclusionError extends Error {
  constructor(exclusionClass, message) {
    super(message);
    this.name = 'StopExclusionError';
    if (!Object.hasOwn(STOP_EXCLUSION_CLASSES, exclusionClass)) {
      throw new Error(
        `resolution-probe: "${exclusionClass}" is not a declared stop-exclusion class. The set is ` +
          `closed: ${Object.keys(STOP_EXCLUSION_CLASSES).join(', ')}.`,
      );
    }
    this.exclusionClass = exclusionClass;
  }
}

/**
 * Classifies a throw that came out of the PRODUCT compiler rather than this
 * harness. `TenantThemeValidationError` is a real exported type, so this is a
 * type test and not a message match; the APCA split reads the issue payload the
 * compiler itself builds, which is the only place that distinction exists.
 *
 * @returns {string|null} the exclusion class, or null when the throw is not one
 *   this guard is allowed to publish.
 */
export function classifyStopExclusion(error) {
  if (error instanceof StopExclusionError) return error.exclusionClass;
  if (error?.name !== 'TenantThemeValidationError') return null;
  const issues = Array.isArray(error.issues) ? error.issues : [];
  const apca = issues.some((issue) => /\bAPCA Lc\b/.test(String(issue?.message ?? '')));
  return apca
    ? STOP_EXCLUSION_CLASSES.GOVERNED_CONTRAST_FLOOR
    : STOP_EXCLUSION_CLASSES.VERTICAL_ENVELOPE_REJECTS_STOP;
}

/**
 * The two DOCUMENT SPACES the DB door lowers into, keyed by the prefix of the
 * `dbTenantThemePath` a control manifest DECLARES.
 *
 * Deciding by the declared path and not by inspecting the built document is the
 * point: the document is a DERIVED shape, and a derived shape can coincide with
 * the other space by accident. The contract cannot.
 */
export const DB_INGRESS_SPACES = Object.freeze({
  'appearance.general.': 'simple',
  'visualFoundation.': 'advanced',
});

/**
 * A declared `dbTenantThemePath` that lives under NEITHER space.
 *
 * W-B -- WHICH SIDE OF THE CLOSED SET THIS FALLS ON, stated so nobody has to
 * guess later: this is NOT a `StopExclusionError`. An unknown space is a defect
 * in the MANIFEST, not a stop the compiler legitimately refuses, so
 * `classifyStopExclusion` must return null for it and the R-2 hardening must
 * RE-THROW it -- breaking the run instead of shrinking the witness set by one
 * and reporting the shrunken set as a measurement. `STOP_EXCLUSION_CLASSES`
 * stays untouched on purpose: adding a class here would make this publishable,
 * which is exactly the silent-exclusion failure R-2 closed.
 */
export class IngressSpaceError extends Error {
  constructor(message) {
    super(message);
    this.name = 'IngressSpaceError';
  }
}

/**
 * The declared path -> the document space it lowers into. Fail-closed on the
 * third edge: an unknown prefix NEVER degrades to simple.
 */
export function dbIngressSpace(declaredPath) {
  if (typeof declaredPath === 'string') {
    for (const [prefix, space] of Object.entries(DB_INGRESS_SPACES)) {
      if (declaredPath.startsWith(prefix)) return space;
    }
  }
  throw new IngressSpaceError(
    `resolution-probe: the control declares dbTenantThemePath ${JSON.stringify(declaredPath)}, ` +
      'which lives under neither legal document space. The set is closed: ' +
      `${Object.keys(DB_INGRESS_SPACES).map((k) => `"${k}<rest>"`).join(' (simple) or ')} ` +
      '(advanced). Refusing to degrade an unknown space to simple: that would compile a ' +
      'document the manifest never described and report the result as a measurement.',
  );
}

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
      'artifact uses, plus one block per compiled mode at the compiler\'s own mode grammar ' +
      '(M-1). This is where a code-owned vertical lands: above the base layer, and above the ' +
      'vertical artifact by source order at equal specificity. AGED CLAUSE REMOVED IN H-3 PHASE ' +
      '(a): this used to say "below an inline root write", which described the DB arm as it was ' +
      'then. Both arms are stylesheet arms now, so nothing sits above this one.',
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
    position: 'tenant-artifact-stylesheet',
    positionMeaning:
      'The compiled TenantThemeArtifact, served the way production serves it: a base rule plus ' +
      'one rule per modeDelta, re-scoped from the artifact\'s probe-tenant selector onto the ' +
      "scene's own (H-3 phase (a)). It used to be a root inline write, and that was a " +
      'measurement defect, not a position: inline beats every mode block, so the arm reported ' +
      'the tenant BASE value in a mode where production serves the vertical\'s own. The provider ' +
      'preview does write inline; whether the preview can express mode deltas at all is a ' +
      'separate, unmeasured product question.',
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

/**
 * THE EMPTINESS QUESTION IS ASKED OVER EVERY SCOPE THE COMPILER WROTE (R-2).
 *
 * This guard predates H-3 phase (a): when it was written a lowering WAS its
 * base map, so "the base map is empty" and "the compiler emitted nothing" were
 * the same sentence. They stopped being the same sentence when mode blocks
 * became a first-class half of the lowering, and nobody widened the question.
 *
 * Measured cost of the narrow question (R-1): rottay's DB door lowers a palette
 * seed into `modeDeltas[light]` -- 19 variables, 2 of them declared -- because
 * rottay is the only first-party vertical whose `defaultMode` is dark, so the
 * v1 transport routes a top-level seed into its non-default mode. The base
 * delta is legitimately empty, and this guard read that emptiness as "the door
 * is inert". It was not; it was the guard looking at one of two scopes.
 *
 * So the union is the question, and the base map alone is not. A brazo whose
 * every scope is empty is still the finding it always was.
 */
function assertVariables(variables, modeVariables = {}) {
  const names = Object.keys(variables ?? {});
  const modeNames = Object.values(modeVariables ?? {}).flatMap((map) => Object.keys(map ?? {}));
  if (names.length === 0 && modeNames.length === 0) {
    throw new Error(
      'resolution-probe: an ingress arm that carries no variable in ANY scope — not the base ' +
        'map and not one mode block — is not a mutation. If the compiler emitted nothing for ' +
        'this stop, that is the finding — record it, do not run a phase against an empty map.',
    );
  }
  const nonCustom = [...names, ...modeNames].filter((name) => !name.startsWith('--'));
  if (nonCustom.length > 0) {
    throw new Error(
      `resolution-probe: ingress arms carry custom properties only; got ${[
        ...new Set(nonCustom),
      ].join(', ')}.`,
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
/**
 * The CSS an arm serves: one block per scope its compiler writes.
 *
 * SHARED BY BOTH ARMS SINCE H-3 PHASE (a), and that is the point rather than a
 * convenience. The two arms now differ in exactly one thing -- which compiler
 * produced the values -- so an equivalence result isolates the COMPILER instead
 * of confounding it with a cascade position. Two composers would let the halves
 * drift and quietly reintroduce the confound.
 *
 * SPECIFICITY IS NEVER RAISED. The mode block is emitted at the compiler's own
 * grammar; nothing is duplicated or `:is()`-stacked to win a comparison. A block
 * that won without modelling anything would be building around the guard.
 *
 * @param {{armId: string, selector: string, exportName: string, variables: object,
 *          modeVariables: object, themeModeSelector: ((base: string, mode: string) => string)|null}} input
 */
function composeArmCss({ armId, selector, exportName, variables, modeVariables, themeModeSelector }) {
  const declare = (map) =>
    Object.keys(map)
      .sort()
      .map((name) => `  ${name}: ${map[name]};`)
      .join('\n');
  // An EMPTY mode delta is not a scope: `selector[data-theme=dark] { }` would
  // claim the arm speaks there when it says nothing.
  const modes = Object.keys(modeVariables ?? {})
    .filter((mode) => Object.keys(modeVariables[mode] ?? {}).length > 0)
    .sort();
  if (modes.length > 0 && typeof themeModeSelector !== 'function') {
    throw new Error(
      `resolution-probe: the ${armId} arm lowered mode blocks but was handed no ` +
        'themeModeSelector. The mode grammar belongs to the COMPILER (brand-theme exports it as ' +
        'the "shared explicit-mode selector grammar for static and DB artifact renderers"), and ' +
        'spelling it in the harness would keep matching a grammar the compiler had already left.',
    );
  }
  const modeSelectors = Object.fromEntries(modes.map((mode) => [mode, themeModeSelector(selector, mode)]));
  const cssBlock = [
    '',
    `/* resolution-probe ingress arm: ${armId} (${exportName}) */`,
    `${selector} {\n${declare(variables)}\n}`,
    ...modes.map((mode) => `${modeSelectors[mode]} {\n${declare(modeVariables[mode])}\n}`),
    '',
  ].join('\n');
  return {
    cssBlock,
    modeSelectors: Object.freeze(modeSelectors),
    modeVariables: Object.freeze(
      Object.fromEntries(modes.map((mode) => [mode, Object.freeze({ ...modeVariables[mode] })])),
    ),
  };
}

export function composeStaticArm({
  vertical,
  variables,
  producedBy,
  modeVariables = {},
  themeModeSelector = null,
}) {
  assertVariables(variables, modeVariables);
  const provenance = assertArmProvenance(producedBy);
  const selector = tenantArmSelector(vertical);

  const composed = composeArmCss({
    armId: 'static-brand-theme',
    selector,
    exportName: provenance.exportName,
    variables,
    modeVariables,
    themeModeSelector,
  });

  return Object.freeze({
    armId: 'static-brand-theme',
    vertical,
    position: INGRESS_ARMS['static-brand-theme'].position,
    positionMeaning: INGRESS_ARMS['static-brand-theme'].positionMeaning,
    selector,
    /** The scopes this arm actually writes: the base, plus one per compiled mode. */
    modeSelectors: composed.modeSelectors,
    variables: Object.freeze({ ...variables }),
    modeVariables: composed.modeVariables,
    cssBlock: composed.cssBlock,
    /** Mutation-phase CSS. Removal re-serves the baseline string unchanged. */
    mutateCss: (baselineCss) => `${baselineCss}\n${composed.cssBlock}`,
    provenance,
  });
}

/**
 * The DB arm: the compiled tenant artifact, served the way production serves it.
 *
 * H-3 PHASE (a). It used to write `variables` INLINE on the document element,
 * and that was the measurement defect M-1 isolated: production embeds
 * `artifact.css` in a `<style>` (`emitTenantThemeArtifactForSsr`), which is a
 * base rule plus one rule per `modeDelta` under the compiler's mode grammar --
 * so an inline write beats every mode block and reported the tenant's BASE
 * value in a mode where production serves the vertical's own. No production
 * path produces that reading.
 *
 * IT RE-SCOPES RATHER THAN SERVING `artifact.css` VERBATIM, and the reason is
 * measured: the artifact is scoped to
 * `…[data-tenant="probe-tenant-<vertical>"]`, a slug the scene cannot carry
 * (`assertTenantIdentityAllowed` rejects the reserved first-party slugs, and the
 * scene must carry the real one or the vertical artifact stops applying). So the
 * arm COMPOSES from the extracted maps onto the scene's own tenant selector --
 * never by parsing the artifact's CSS, which would be a second, weaker copy of
 * the compiler's own structure.
 *
 * ITS RESTORE IS NOW THE STATIC ARM'S, and that is stronger than what it
 * replaces: the baseline string is never rewritten, so the removal phase
 * re-serves the identical bytes instead of replaying an inline memo.
 */
export function composeDbArm({ vertical, variables, producedBy, modeVariables = {}, themeModeSelector = null }) {
  assertVariables(variables, modeVariables);
  const provenance = assertArmProvenance(producedBy);
  const selector = tenantArmSelector(vertical);
  const composed = composeArmCss({
    armId: 'db-tenant-theme',
    selector,
    exportName: provenance.exportName,
    variables,
    modeVariables,
    themeModeSelector,
  });
  return Object.freeze({
    armId: 'db-tenant-theme',
    vertical,
    position: INGRESS_ARMS['db-tenant-theme'].position,
    positionMeaning: INGRESS_ARMS['db-tenant-theme'].positionMeaning,
    selector,
    modeSelectors: composed.modeSelectors,
    variables: Object.freeze({ ...variables }),
    modeVariables: composed.modeVariables,
    cssBlock: composed.cssBlock,
    /** Mutation-phase CSS. Removal re-serves the baseline string unchanged. */
    mutateCss: (baselineCss) => `${baselineCss}\n${composed.cssBlock}`,
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
 * K — the channels a stop may be held to. THE single reader of the calibration
 * surface, and the reason it is single.
 *
 * C5 separated two questions that had been sharing `declaredOutputs.channels`:
 * the IMPACT RADIUS of a capability (what authoring it moves — read by the
 * impact map, the controls/tokens catalogues, the surface census and the
 * root-exposure gate) and the CALIBRATION SURFACE (which channels a stop may be
 * attributed to — K in the H-2 law, "and nothing wider"). The registry now
 * states them separately and the generator mirrors the second into
 * `calibration.channels`.
 *
 * The fallback is what keeps this a no-op for everything else: a manifest with
 * no `calibration.channels` calibrates its whole declared radius, exactly as
 * before, so the nineteen capabilities that never needed the distinction see no
 * change at all.
 *
 * WHY ONE FUNCTION AND NOT FOUR READS. The harness asks this question in four
 * places — the extraction inside `lowerStop`, the empty-lowering guard beside
 * it, the H-2 discrimination guard, and `directControlFixtureIds`' `every()`
 * law. If any one of them kept reading `declaredOutputs.channels` directly, a
 * control whose two surfaces differ would be calibrated against one set and
 * recorded against another: the artifact's declared/omitted rows would gain a
 * channel no stop writes, every receipt over it would stop being re-attestable,
 * and the divergence would look like a measurement rather than a wiring
 * mistake. Four readers of one fact is three chances to disagree.
 *
 * @param {object} controlManifest
 * @returns {readonly string[]}
 */
export function calibrationChannels(controlManifest) {
  return (
    controlManifest?.calibration?.channels ?? controlManifest?.declaredOutputs?.channels ?? []
  );
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
  /* FASE-B -- THE BRACE-IN-THE-MIDDLE LAW, checked BEFORE the role.
   *
   * This harness selects a member by its LAST segment. That is an ASSUMPTION
   * about the shape of a brace-set, and until now it was undeclared. When the
   * brace sits mid-path and every member ends in the same segment
   * (`chrome.{cardComponent,table,sidebar,layout}.anatomy`), the filter below
   * matches 0 or N -- never exactly 1 -- for EVERY possible role. The generic
   * "selects N members" throw then describes the SYMPTOM and reads as though
   * the role were wrong, when what is wrong is the shape of the set.
   *
   * So the check is STRUCTURAL and comes first: it is a property of the set,
   * not of the role, and it is a defect in the MANIFEST rather than a stop the
   * compiler refused. Which is why it is a plain Error and NOT a
   * `StopExclusionError`: `classifyStopExclusion` must return null for it so
   * the R-2 hardening RE-THROWS and breaks the run, instead of publishing it as
   * "this stop cannot lower" and shrinking the witness set. `STOP_EXCLUSION_CLASSES`
   * stays untouched. */
  const suffixes = new Set(members.map((member) => member.split('.').at(-1)));
  if (suffixes.size === 1) {
    throw new Error(
      `resolution-probe: the ingress set "${declared}" cannot be discriminated by role: all ` +
        `${members.length} members end in the same segment ("${[...suffixes][0]}"), so no role ` +
        'can ever select exactly one. This harness selects a member by its LAST segment; a ' +
        'brace-set whose discriminator sits mid-path needs a different ingress shape, not a ' +
        `different stop. Members: ${members.join(', ')}`,
    );
  }
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
  const isIdentityStop = stop.identity === true;
  const ingressValue = isIdentityStop
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
  /* B-2: WHICH path of this compile the TENANT authored — and the one stop
   * whose answer is "none".
   *
   * For a normal stop the patch above IS the tenant's authorship record, so the
   * path is NAMED here rather than re-derived downstream: the arm knows exactly
   * which keypath it wrote, and an instrument that re-infers what it already
   * knows is inventing an opportunity to be wrong. `staticTenantAuthoredPaths`
   * turns this into the compiler's set.
   *
   * AN IDENTITY STOP DECLARES NO AUTHORSHIP (W-B, owner-adjudicated 2026-08-24
   * on Fable's measurement). Since W-A an identity stop does not write
   * "nothing": it RESOLVES the vertical's own authored value at this door and
   * writes THAT. Declaring authorship over it would tell the compiler that a
   * tenant deliberately selected the value the vertical itself ships — and the
   * governed seed derivation does not read the VALUE, it reads the CLAIM, so
   * every leaf that shadows the seed would switch to the alias and the identity
   * stop would stop being an identity. Measured on bithire: identity WITHOUT
   * the flag moves 0 channels; identity WITH it moves 7, and
   * `--ds-button-primary-bg` leaves `#3A6FB0` for `var(--ds-color-primary)`.
   *
   * That is the same law F4B-8 already seated for this arm — an identity is
   * "whatever THIS vertical already authors" — and the DB arm reaches it from
   * the other side: it refuses a base outright, so an identity stop is a
   * STATIC-ARM CLAIM ABOUT WHAT THE VERTICAL SHIPS, not an act of tenant
   * authorship. Fenced by drill 7. */
  const tenantAuthoredPath = isIdentityStop ? null : resolvedPath;
  return {
    path: resolvedPath,
    declaredPath: path,
    document,
    patch,
    stopId,
    ingressValue,
    identity: isIdentityStop,
    tenantAuthoredPath,
  };
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
/* FASE-B -- the font-family contract, REPLICATED from the product validator.
 *
 * These three constants mirror `isSafeFontFamily`
 * (`compilers/composition/tenant-theme`): the length limit lives in
 * `TENANT_THEME_CONFIG_SCHEMA.limits.maxFontFamilyLength`, the pack ids in
 * `TENANT_THEME_FONT_PACK_IDS`, and the residue charset in the validator body.
 * They are COPIED rather than imported because this module is the pure half of
 * the harness: `buildIngressInput` runs in tests that never load `dist/`, and
 * importing the published schema here would make the ingress path depend on a
 * build. The copy is not left to rot -- a drill asserts these three values
 * against the PUBLISHED ones, so drift turns red instead of silent. */
const FONT_STACK_MAX_LENGTH = 200;
const FONT_STACK_PACK_IDS = Object.freeze([
  'editorial-display',
  'editorial-text',
  'grotesk-display',
  'humanist-text',
  'geometric-display',
  'plex-mono',
]);
const FONT_PACK_REFERENCE = /var\(--ds-font-pack-([a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?)\)/g;
const FONT_STACK_RESIDUE = /^[\p{L}\p{N}\s'",._-]+$/u;

/**
 * `isSafeFontFamily`, step for step and in the SAME ORDER as the product
 * validator -- approximating it would be the divergence this replica exists to
 * prevent.
 */
export function isLowerableFontStack(value) {
  if (typeof value !== 'string') return false;
  if (value.length === 0 || value.length > FONT_STACK_MAX_LENGTH || value !== value.trim()) {
    return false;
  }
  const references = value.match(FONT_PACK_REFERENCE) ?? [];
  const allVarFunctions = value.match(/var\s*\(/gi) ?? [];
  // EVERY `var()` must be a font-pack reference: a count mismatch means the
  // string names something else, which is the asset-channel the product closes.
  if (references.length !== allVarFunctions.length) return false;
  const allowed = new Set(FONT_STACK_PACK_IDS);
  for (const reference of references) {
    const packId = /^var\(--ds-font-pack-(.+)\)$/.exec(reference)?.[1];
    if (!packId || !allowed.has(packId)) return false;
  }
  return FONT_STACK_RESIDUE.test(value.replace(FONT_PACK_REFERENCE, 'FontPack'));
}

/**
 * The value types a `map-entry` catalogue may declare, and what this harness is
 * willing to lower for each.
 *
 * The set is CLOSED and small on purpose. It is not a re-implementation of the
 * document schema — the schema is the product's authority and stays that way.
 * It is the smaller question this instrument has to answer: "is this value one
 * whose meaning I can predict on BOTH arms?" Where the schema is stricter than
 * this table, the drills pin the difference; where this table is stricter than
 * the schema, it is for a measured reason recorded at the entry.
 *
 * `color` is HEX-ONLY even though the DB schema accepts functional colour
 * syntax, and the reason is the one the `color-set` branch already measured:
 * `hexToRgbFloat` reads a non-hex seed as NaN, `NaN >> 16 & 255` is 0, and the
 * ramp derives from BLACK. The channel moves, so a probe asking "did it move?"
 * answers yes about a value the compiler discarded.
 *
 * `visual-value` is the loosest type the schema declares, but it is NOT a free
 * string — measured this packet: `--ds-radius-md: "#123456"` is refused with
 * `unsafe_value: Invalid or unsafe visual-value`. This harness cannot reproduce
 * the product's safety validator without importing it, so it refuses the class
 * it CAN name: a value that could terminate the declaration it is written into.
 * That is the FASE-B brace law, applied to the one door that validates nothing —
 * the static chrome arm emits the string raw (measured), so a value carrying `;`
 * or a brace would end the rule rather than paint it.
 */
const MAP_ENTRY_VALUE_TYPES = Object.freeze({
  'hex-color': (value) => typeof value === 'string' && HEX_COLOR.test(value),
  color: (value) => typeof value === 'string' && HEX_COLOR.test(value),
  'font-family': (value) => isLowerableFontStack(value),
  number: (value, entry) =>
    typeof value === 'number' &&
    Number.isFinite(value) &&
    (typeof entry?.min !== 'number' || value >= entry.min) &&
    (typeof entry?.max !== 'number' || value <= entry.max),
  'visual-value': (value) =>
    typeof value === 'string' && value.length > 0 && value === value.trim() && !/[;{}]/.test(value),
});

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
  if (kind === 'font-stack') {
    /* A tenant writes the FONT STACK verbatim at the role's keypath. Written as
     * it stands: no trimming, no quoting, no normalisation -- the product
     * validator refuses an untrimmed value outright, so trimming here would
     * lower a string the DB door would never accept and call it a measurement.
     *
     * WHY THE HARNESS VALIDATES AT ALL, and it is not caution.
     * `compileBrandTheme` validates font families NOWHERE (verified:
     * `isSafeFontFamily` and the font-pack pattern do not appear in the static
     * compiler), so the string reaches the serialised stylesheet RAW. Measured,
     * a stop carrying a closing brace emits
     * `--ds-font-family-base: Inter; } html { display:none } /*, ...` -- a
     * declaration that terminates the rule. The DB door refuses the same string.
     * So an unvalidated stop would produce a reading that looks ALIVE on one arm
     * and throws on the other, and the divergence would have been invented by
     * this instrument rather than found in the product.
     *
     * The asymmetry itself is a real finding and is NOT this packet's to fix: it
     * is reachable by a code-owned BrandTheme or a caller of `compileBrandTheme`
     * with a `tenantPatch`, not by a tenant document, and it is registered with
     * the other door asymmetries for the owner.
     *
     * `DOMAIN_KIND_NOT_LOWERED` is the class `color-set` already uses for a
     * value this harness will not lower -- same law, same failure shape. */
    if (!isLowerableFontStack(stop.value)) {
      throw new StopExclusionError(
        STOP_EXCLUSION_CLASSES.DOMAIN_KIND_NOT_LOWERED,
        `resolution-probe: ${controlId} has a font-stack domain, so a tenant writes a CSS ` +
          `font-family list at the ingress path — but stop "${stop.id}" declares ` +
          `${JSON.stringify(stop.value)}, which the product's own contract refuses ` +
          '(1..200 chars, already trimmed, charset [letters digits space \' " , . _ -], and ' +
          `var() only as var(--ds-font-pack-<id>) with <id> in ${FONT_STACK_PACK_IDS.join(', ')}). ` +
          'The STATIC arm validates nothing and would emit it raw into the stylesheet, so ' +
          'lowering it would invent a divergence instead of measuring one.',
      );
    }
    return stop.value;
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
      throw new StopExclusionError(
        STOP_EXCLUSION_CLASSES.DOMAIN_KIND_NOT_LOWERED,
        `resolution-probe: ${controlId} has a color-set domain, so a tenant writes a COLOUR at ` +
          `the ingress path — but stop "${stop.id}" declares ${JSON.stringify(stop.value)}, which ` +
          'is not a hex colour (#rgb or #rrggbb). A non-hex seed does not fail: the ramp ' +
          'derivation reads it as black and emits a grey ramp, so the channel MOVES and the run ' +
          'would report a live control while the tenant colour was discarded.',
      );
    }
    return stop.value;
  }
  if (kind === 'map-entry') {
    /* A MAP DOMAIN. The tenant writes ONE typed entry of a closed catalogue: a
     * `{key, value}` pair for the flat token map, a `{(family, field), value}`
     * triple for the nested chrome map. Both reduce to the same act — "write this
     * value at this named entry" — which is why ONE kind covers both.
     *
     * WHERE the entry is written is NOT this branch's job. `resolveIngressMember`
     * already selects the member by the stop's `role`, exactly as it does for
     * `palette.{...}`, and it selects by the member's LAST SEGMENT. This decides
     * only WHAT is written — the same division of labour the `color-set` branch
     * states above. A map domain therefore needs no second coordinate here: the
     * brace-set carries it.
     *
     * THE CLOSURE IS PER ENTRY, AND THAT IS THE WHOLE DIFFERENCE. `closed-enum`
     * closes over a set of VALUES; `profile-id` over a set of registry IDS; a map
     * domain closes over a set of KEYS, and each key carries its OWN expected
     * type. The product already derives exactly that: `tokenValueRules`
     * (compilers/kernel/foundation/schemas/tenant-theme/index.ts:1892-1909) builds
     * the document schema by mapping every published token name to a type by
     * prefix. So `entryCatalog` is a PROJECTION of a real closed source, never a
     * convention — and its drill pins it against that source, because a projection
     * nobody re-derives is exactly the "remembered convention" the terminal throw
     * below refuses to act on.
     *
     * WHY A MISTYPED VALUE IS REFUSED RATHER THAN LOWERED. Measured this packet
     * across the 290 published tokens with a uniform `#123456`: the DB door
     * refuses the WHOLE DOCUMENT for 15 of them — 4 `unsafe_value: Invalid or
     * unsafe font-family`, 7 `invalid_type: Expected a finite number`, 4
     * `unsafe_value: Invalid or unsafe visual-value` — and all 15 are accepted
     * once the value carries its declared type, so none of them is a rejected
     * KEY. The static chrome door validates NOTHING and emits the string raw
     * (measured: `chrome.table.headerBg` lowers verbatim). Lowering a mistyped
     * value would therefore produce one arm that lives and one arm that throws,
     * and the divergence would have been INVENTED by this instrument rather than
     * found in the product. Same law and same failure shape as `font-stack`.
     *
     * A CATALOGUE DEFECT IS NOT A STOP EXCLUSION. A missing catalogue, a role the
     * catalogue does not carry, or a type name this harness does not know are all
     * defects in the MANIFEST, not reasons a tenant could not write the entry. So
     * they throw a plain Error: `classifyStopExclusion` returns null for it, the
     * R-2 hardening RE-THROWS, and the run breaks instead of publishing a shrunken
     * witness set as a measurement. This is the same choice, for the same reason,
     * that the brace-in-the-middle law makes in `resolveIngressMember`.
     */
    if (typeof stop.role !== 'string' || stop.role.length === 0) {
      throw new Error(
        `resolution-probe: ${controlId} has a map-entry domain, so a stop names WHICH entry of ` +
          `the map it writes — but stop "${stop.id}" declares no role. Picking an entry for it ` +
          'would measure a door nobody declared.',
      );
    }
    const catalog = controlManifest?.calibration?.entryCatalog ?? [];
    if (!Array.isArray(catalog) || catalog.length === 0) {
      throw new Error(
        `resolution-probe: ${controlId} declares a map-entry domain but no ` +
          '`calibration.entryCatalog`, so the closed catalogue that bounds it — and the type each ' +
          'entry expects — is unreadable. Refusing to lower an unbounded map entry.',
      );
    }
    const entry = catalog.find((candidate) => candidate?.role === stop.role);
    if (!entry) {
      throw new Error(
        `resolution-probe: stop "${stop.id}" of ${controlId} names role "${stop.role}", which is ` +
          `not an entry of the declared catalogue (${catalog.map((c) => c?.role).join(', ')}). ` +
          'A role the catalogue does not carry is a defect in the manifest, not a stop the ' +
          'compiler refused.',
      );
    }
    const admits = MAP_ENTRY_VALUE_TYPES[entry.valueType];
    if (!admits) {
      throw new Error(
        `resolution-probe: entry "${entry.role}" of ${controlId} declares value type ` +
          `"${entry.valueType ?? 'none'}", which this harness does not know how to lower. The set ` +
          `is closed: ${Object.keys(MAP_ENTRY_VALUE_TYPES).join(', ')}.`,
      );
    }
    if (!admits(stop.value, entry)) {
      throw new StopExclusionError(
        STOP_EXCLUSION_CLASSES.DOMAIN_KIND_NOT_LOWERED,
        `resolution-probe: entry "${entry.role}" of ${controlId} expects a ${entry.valueType} ` +
          `value, but stop "${stop.id}" declares ${JSON.stringify(stop.value)}. The DB door ` +
          'refuses the whole document for a mistyped entry and the static door emits it raw, so ' +
          'lowering it would invent a divergence between the arms instead of measuring one.',
      );
    }
    return stop.value;
  }
  throw new StopExclusionError(
    STOP_EXCLUSION_CLASSES.DOMAIN_KIND_NOT_LOWERED,
    `resolution-probe: ${controlId} declares domain kind "${kind ?? 'none'}", and this harness ` +
      'only knows how to write a closed-enum stop id, a bounded stop value, a profile-id ' +
      'registry id, a font-stack family list, a color-set hex colour, or a map-entry typed ' +
      'catalogue value at an ingress path. Refusing to lower a stop on a remembered convention.',
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
    throw new StopExclusionError(
      STOP_EXCLUSION_CLASSES.IDENTITY_NEEDS_A_BASELINE,
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
 * B-2 — the authorship set the static arm hands `compileBrandTheme`: exactly
 * the keypath this stop wrote, or nothing at all.
 *
 * WHY THE ARM DECLARES ANYTHING. Since B-1 the static arm lowers a TENANT
 * PATCH over the vertical baseline, which is the same composition the DB
 * transport performs — and the DB transport declares its authorship every
 * time (`composition/tenant-theme:1941-1950`, `collectPatchAuthoredPaths` over
 * the migrated patch). Measured for this packet: that composition is the ONLY
 * baseline+patch compile production performs, and it never happens without
 * provenance. An arm that composed the same two floors and said nothing was
 * lowering a tenant patch while telling the compiler no tenant existed.
 *
 * NAMED, NEVER COLLECTED. `collectPatchAuthoredPaths` is the right tool for
 * the DB leg and the wrong one here: it normalises from ThemePatch space into
 * BrandTheme space, unwrapping `.value` for six governed roots, and this patch
 * is ALREADY in BrandTheme space because `buildIngressInput` writes it at the
 * keypath `staticBrandThemePath` declares. Its own doc names the failure mode
 * — "Collecting in one space and consuming in another is how a provenance set
 * silently stops matching."
 *
 * ONE LEAF, NOT ITS CONTAINERS. `collectPatchAuthoredPaths` also enumerates the
 * intermediate objects as a deliberate over-approximation. The compiler's two
 * read sites test EXACT membership against `CONSULTED_PROVENANCE_FIELDS`, whose
 * entries are all leaf paths, so one path is both sufficient and the honest
 * claim.
 *
 * FAIL-CLOSED ON THE STRONGER LAW. A claim of authorship over a path the patch
 * does not write is a FALSE STATEMENT about who wrote what, so it throws. That
 * such a claim would be inert TODAY — the consulted vocabulary is closed, so
 * most spellings are never asked about — is a property of that vocabulary, not
 * of this arm; an instrument whose lie is harmless only because a neighbour
 * happens to be closed has no law of its own.
 *
 * @param {{patch: object, authoredPath: string|null|undefined}} input
 * @returns {ReadonlySet<string>|undefined} `undefined` means "this compile is
 *   not a tenant" — the exact semantics the compiler already defines for an
 *   absent set, and what every baseline compile supplies.
 */
export function staticTenantAuthoredPaths({ patch, authoredPath }) {
  if (authoredPath === null || authoredPath === undefined) return undefined;
  if (typeof authoredPath !== 'string' || authoredPath.length === 0) {
    throw new Error(
      'resolution-probe: a tenant-authorship claim must NAME a keypath, and got ' +
        `${JSON.stringify(authoredPath)}. An empty claim is not the same thing as no claim — ` +
        'pass null for "this compile is not a tenant".',
    );
  }
  if (readKeypath(patch ?? {}, authoredPath) === undefined) {
    throw new Error(
      `resolution-probe: the static arm claimed the tenant authored "${authoredPath}", but the ` +
        'patch it lowered writes nothing there (an EMPTY patch writes nothing anywhere, which is ' +
        'the same refusal for a compile that carries no tenant floor at all). Provenance is a ' +
        'statement about WHO WROTE WHAT, so a set that does not correspond to the patch is a ' +
        'false claim rather than a harmless extra entry: the compiler would derive a leaf from a ' +
        'tenant selection that never happened, and the run would report that derivation as the ' +
        'door working.',
    );
  }
  return new Set([authoredPath]);
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
function toCompilerInput({
  armId,
  document,
  base,
  patch,
  tenantAuthoredPath = null,
  tenantSlug,
  vertical,
  defaultMode = null,
  schemaVersion,
  dbTenantThemePath = null,
}) {
  if (armId === 'db-tenant-theme') {
    /* FASE-A: the space is decided by the DECLARED path, never by the built
     * document (see `dbIngressSpace`). Simple keeps its shape byte-identical to
     * what it produced before this branch existed. */
    const space = dbIngressSpace(dbTenantThemePath);
    const visualFoundation = space === 'advanced' ? document?.visualFoundation : undefined;
    if (space === 'advanced' && (!visualFoundation || typeof visualFoundation !== 'object')) {
      throw new Error(
        'resolution-probe: the db-tenant-theme document declares the advanced space but has no ' +
          '"visualFoundation" object, so there is no TenantVisualFoundation to put in the ' +
          'TenantThemeConfig.',
      );
    }
    /* ONE extraction, whatever the space. `general` is the SAME
     * `TenantAppearanceGeneral` in both: simple puts it at `appearance`,
     * advanced at `visualFoundation.general` (measured: an advanced document
     * with `general.palette` compiles the same 29 vars as its simple twin). It
     * is optional in the advanced space -- today's seven advanced controls all
     * write under `.advanced` -- and absent is not a defect there. */
    const general = space === 'simple' ? document?.appearance?.general : visualFoundation?.general;
    if (space === 'simple' && (!general || typeof general !== 'object')) {
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
    const appearance = general ? structuredClone(general) : undefined;
    /* R-2 SCOPE-MATCHED PARITY (DT ruling + W-A) — STAMPED ON THE PALETTE NODE
     * THE SCENARIO ALREADY WROTE, and only there.
     *
     * `backgroundMode` is the field `migratePalette` reads to route a top-level
     * seed (`migrate-v1:396`). Declaring it makes the DB door write the same
     * mode scope the static door writes, which is what makes a parity run
     * compare one question instead of two.
     *
     * WHY IT IS NOT STAMPED ON EVERY DOCUMENT. The ruling's own justification
     * says "in bithire/evnto nothing changes"; measured, an unconditional stamp
     * falsifies that. `backgroundMode` lives INSIDE `palette`, so writing it
     * into a document that has no palette node MATERIALISES one — and
     * `migratePalette` then returns a palette patch whose ten seed fields are
     * all `undefined`, which `collectPatchAuthoredPaths` collects as ten
     * AUTHORED keypaths including `palette.primaryColor`, a member of
     * `CONSULTED_PROVENANCE_FIELDS`. The compiler is then told a tenant
     * selected a seed nobody wrote, the governed seed-derivation ladder fires,
     * and channels repaint: measured, 24 of the 36 receipted DB-arm compiles
     * change value that way (density.mode, spacing.rhythm,
     * surfaces.effect-intensity and experience.profile on all three verticals),
     * with `--ds-button-primary-bg`, `--ds-button-primary-bg-hover` and
     * `--ds-color-border-focus` among the new rows.
     *
     * So the stamp is scoped to documents that already carry a palette node.
     * For every control whose door is not a palette keypath the document is
     * byte-identical to what it was, which is what "nothing changes in
     * bithire/evnto" actually requires. */
    if (appearance?.palette && typeof appearance.palette === 'object') {
      if (defaultMode !== 'light' && defaultMode !== 'dark') {
        throw new Error(
          'resolution-probe: this db-tenant-theme document writes a palette node, so its mode ' +
            'scope is decided by `palette.backgroundMode` — and no vertical defaultMode was ' +
            `handed to lowerStop (got ${JSON.stringify(defaultMode)}). Read it from the ` +
            'published BrandTheme with verticalDefaultMode(); assuming "light" would put the ' +
            "seed in a dark vertical's non-default mode and the run would compare two different " +
            'scopes without saying so.',
        );
      }
      appearance.palette = { ...appearance.palette, backgroundMode: defaultMode };
    }
    if (space === 'simple') {
      return {
        schemaVersion,
        mode: 'simple',
        appearance,
        ...dbTenantIdentity(vertical),
      };
    }
    /* The sealed `general` goes back where the advanced space keeps it. The
     * rest of the foundation travels verbatim. */
    return {
      schemaVersion,
      mode: 'advanced',
      visualFoundation: {
        ...structuredClone(visualFoundation),
        ...(appearance === undefined ? {} : { general: appearance }),
      },
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
      /* B-2: the patch travels WITH its authorship. `compileBrandTheme` already
       * accepts the field (`BrandCompilerProvenanceInput.tenantAuthoredPaths`);
       * no compiler is touched by this arm learning to fill it. */
      const authoredPaths = staticTenantAuthoredPaths({ patch, authoredPath: tenantAuthoredPath });
      return {
        brandTheme: base ?? {},
        tenantPatch: patch,
        tenantSlug,
        ...(authoredPaths === undefined ? {} : { tenantAuthoredPaths: authoredPaths }),
      };
    }
    /* NO PATCH, NO AUTHORSHIP — routed through the SAME law rather than a
     * second one. This branch is the H-1 "lowered in isolation" comparison:
     * one theme, no tenant floor at all. Authorship is a claim ABOUT a patch,
     * so a claim here has no writer to attribute it to — and an empty patch
     * writes nothing at any path, which is exactly what
     * `staticTenantAuthoredPaths` already refuses. Calling it (rather than
     * writing a parallel guard that no caller could reach) keeps the refusal
     * on the one exported unit a drill can actually exercise. */
    staticTenantAuthoredPaths({ patch: {}, authoredPath: tenantAuthoredPath });
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
 * THE MODE SCOPE THE DB DOCUMENT DECLARES (R-2 scope-matched parity, W-A).
 *
 * The two doors do not write the same mode scope on their own. The static door
 * writes `palette.primaryColor` into the BrandTheme BODY, which is the
 * vertical's DEFAULT mode. The DB door writes `appearance.general.palette.*`
 * into a v1 document, and `migratePalette` routes a top-level seed by
 * `palette.backgroundMode ?? "light"` (`migrate-v1:396`, `:404-418`) — so on a
 * vertical whose default is LIGHT the seed lands in the body too, and on a
 * vertical whose default is DARK it lands in `modes.light` instead. Measured:
 * rottay is the only first-party vertical with a dark default, and its DB seed
 * landed in a scope the static arm never wrote. Comparing those two arms would
 * diff two different questions and call the difference a compiler divergence.
 *
 * Ruling (DT, 2026-08-24): the probe's DB document declares
 * `backgroundMode = the vertical's own defaultMode`, uniformly — never a
 * per-vertical literal, and never a special case for rottay. The dominant
 * tenant intent a parity run models is "my brand in my product's default
 * appearance".
 *
 * W-A — THE SOURCE OF THAT BOOLEAN IS THE PUBLISHED BrandTheme, and the reason
 * is REACHABILITY rather than absence. W-A asked for the source to be verified
 * and the verification corrected W-A's own evidence: it held that
 * `FIRST_PARTY_THEMES.<v>.appearance.defaultMode` is `undefined`, and measured
 * it is `'dark'` — the Theme projection DOES carry the field. What it does not
 * do is leave the package: `FIRST_PARTY_THEMES` is not exported from the
 * published entrypoint at all, so reading it would take the deep import this
 * harness refuses for its compilers (a deep path can be tree-shaken out from
 * under it with no gate noticing). `<v>BrandTheme` IS published, and
 * `loadStaticBaselines()` already loads exactly those themes from
 * `dist/index.js` under the freshness law — so the caller reads it there and
 * hands it here. Both halves are asserted in R-2 drill 3 so neither claim can
 * rot silently. FAIL-CLOSED: a missing value refuses the run rather than
 * defaulting to `"light"`, which would silently reinstate the scope mismatch
 * this exists to remove.
 *
 * @param {{theme: object, source: string}} baseline the tuple loadStaticBaselines returns
 * @returns {'light'|'dark'} the vertical's declared default mode
 */
export function verticalDefaultMode(baseline, vertical) {
  const mode = baseline?.theme?.appearance?.defaultMode;
  if (mode !== 'light' && mode !== 'dark') {
    throw new Error(
      `resolution-probe: the published BrandTheme for "${vertical}" declares no usable ` +
        `appearance.defaultMode (got ${JSON.stringify(mode)}), so the DB document cannot declare ` +
        'the mode scope its parity run is measured in. Refusing to assume "light": that ' +
        'assumption is exactly the scope mismatch the scope-matched ruling removes, and it ' +
        'fails silently — the arm would still compile, in the wrong mode.',
    );
  }
  return mode;
}

/**
 * Runs one compiler and keeps only the channels the manifest declares.
 *
 * FAIL-CLOSED ON AN EMPTY LOWERING. A compiler that emits none of the declared
 * channels for a valid stop — IN ANY SCOPE IT WROTE, base map or mode block —
 * is a finding: the door does not lower the control. It must surface as a
 * thrown error rather than as an arm carrying an empty map, which the causal
 * run would later report as "the control moved nothing". The union is the
 * question (R-2); the base map alone was, and reading only it reported a
 * 19-variable lowering as an inert door.
 *
 * `compile` is passed in (from `loadCompilerArms` or a test double), so the
 * extraction mechanics are provable without a build.
 *
 * @param {object} input
 * @param {string} [input.vertical]
 *   Required for `static-brand-theme` — the tenant `compileBrandTheme` is
 *   compiling for. Unused (and not required) for `db-tenant-theme`, which
 *   compiles a TenantAppearance document that carries no vertical concept.
 * @param {'light'|'dark'} [input.defaultMode]
 *   The vertical's own default mode, from `verticalDefaultMode()`. Required by
 *   the DB arm whenever the document it builds writes a palette node, and
 *   ignored otherwise. See `toCompilerInput`.
 */
/**
 * The compile options for one lowering. `{}` unless the DB arm is lowering into
 * the advanced space, which the compiler refuses to compile without a vertical
 * policy envelope.
 *
 * FAIL-CLOSED IN BOTH DIRECTIONS, and neither is a `StopExclusionError`: a
 * missing export is a defect in the published module and an unresolvable
 * vertical is a defect in the call, so both must break the run rather than be
 * published as "this stop cannot lower".
 */
export function advancedCompileOptions({ armId, mode, vertical, verticalEnvelopeFor }) {
  if (armId !== 'db-tenant-theme' || mode !== 'advanced') return {};
  if (typeof verticalEnvelopeFor !== 'function') {
    throw new Error(
      'resolution-probe: lowering into the advanced space needs the vertical policy envelope, ' +
        'and no resolver was handed to lowerStop. It rides on the arm that `loadCompilerArms` ' +
        'returns (`verticalEnvelopeFor`), from the SAME published module the compiler comes ' +
        'from and under the same freshness proof. Refusing to reconstruct an envelope here: a ' +
        'hand-built one could disagree with the contract the compiler validates against.',
    );
  }
  const verticalEnvelope = verticalEnvelopeFor(vertical);
  if (!verticalEnvelope || typeof verticalEnvelope !== 'object') {
    throw new Error(
      `resolution-probe: the published module resolves no vertical policy envelope for ` +
        `${JSON.stringify(vertical)}, so an advanced document has nothing to be validated ` +
        'against. Refusing to compile without it: the compiler would throw "$.verticalKey: ' +
        'Tenant theme compilation requires a vertical policy envelope" anyway, and a run that ' +
        'cannot name its envelope cannot claim the result was governed by one.',
    );
  }
  return { verticalEnvelope };
}

/**
 * The envelope digest the COMPILER stamped on the artifact it just produced.
 *
 * Fail-closed: an advanced compile that carries no digest cannot be recorded as
 * having been governed by an envelope, and inventing one here would be the
 * second authority this record exists to avoid.
 */
export function assertEnvelopeDigest(compiled, vertical) {
  const digest = compiled?.verticalEnvelopeDigest ?? null;
  if (typeof digest !== 'string' || !/^sha256-[0-9a-f]{64}$/.test(digest)) {
    throw new Error(
      `resolution-probe: the advanced compile for ${JSON.stringify(vertical)} produced no ` +
        `well-formed verticalEnvelopeDigest (got ${JSON.stringify(digest)}), so the run cannot ` +
        'record WHICH envelope governed it. The digest is read off the artifact on purpose, so ' +
        'the two halves of the provenance cannot disagree.',
    );
  }
  return digest;
}

export function lowerStop({
  armId,
  controlManifest,
  stopId,
  compile,
  base = {},
  baselineSource = null,
  provenance = {},
  vertical = null,
  defaultMode = null,
  verticalEnvelopeFor = null,
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
    tenantAuthoredPath: input.tenantAuthoredPath,
    tenantSlug,
    vertical,
    defaultMode,
    schemaVersion: provenance.schemaVersion,
    /* FASE-A: the CONTRACT decides the space, so the declared path travels here
     * rather than the built document being sniffed. */
    dbTenantThemePath: controlManifest?.ingress?.dbTenantThemePath ?? null,
  });
  /* B-2: the claim, in a shape a record can carry.
   *
   * `tenantAuthoredPaths` reaches the compiler as a `Set`, which has NO JSON
   * form — `JSON.stringify(new Set(['a']))` is `{}`, and `{}` in an artifact
   * reads as "an empty claim", the exact opposite of what happened. So the
   * provenance record below carries a sorted ARRAY, and `compilerInput` is
   * recorded with the same substitution so the two halves of the record cannot
   * disagree about what was declared. Null on the DB arm, and that is honest
   * rather than missing: `compileTenantThemeConfig` collects its own authorship
   * INSIDE itself, so this arm has none to name here — the same asymmetry
   * `baseline` already records. */
  const declaredAuthoredPaths = compilerInput.tenantAuthoredPaths
    ? [...compilerInput.tenantAuthoredPaths].sort()
    : null;
  /* FASE-A: `compile` is called with TWO arguments, always. `{}` in the simple
   * space keeps the arity stable (measured: no test double asserts
   * `compile.length`, and the compiler ignores an empty options object -- a
   * simple scene compiles byte-identically with it and without it). The
   * advanced space MUST carry the vertical policy envelope: without it the
   * compiler throws `$.verticalKey: Tenant theme compilation requires a
   * vertical policy envelope`, which is the gate this argument answers. */
  const compileOptions = advancedCompileOptions({
    armId,
    mode: compilerInput.mode,
    vertical,
    verticalEnvelopeFor,
  });
  const compiled = compile(compilerInput, compileOptions);
  const emitted = compiled?.variables ?? compiled?.cssVariables ?? compiled;
  if (!emitted || typeof emitted !== 'object') {
    throw new Error(
      `resolution-probe: ${armId} compiler returned no variable map for stop "${stopId}".`,
    );
  }
  const channels = calibrationChannels(controlManifest);
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
  /* R-2: THE EMPTY-LOWERING GUARD USED TO STAND HERE, and standing here is what
   * made it wrong. See the union check below the mode extraction. */
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
  /* H-3 PHASE (a): the TWO compilers spell their mode scopes differently, and
   * this reads BOTH -- by name, per arm, never by a `??` chain that would accept
   * whatever happened to be there.
   *
   *   static-brand-theme  compileBrandTheme        -> modeBlocks[{mode, cssVariables}]
   *   db-tenant-theme     compileTenantThemeConfig -> modeDeltas[{mode, variables}]
   *
   * M-1 read only the first, so the DB arm's `modeVariables` was `{}` even
   * though its compiler had produced a full dark delta -- measured, and the
   * reason the DB half of the dark divergence survived M-1. */
  const MODE_SCOPE_SHAPES = {
    'static-brand-theme': { collection: 'modeBlocks', values: 'cssVariables' },
    'db-tenant-theme': { collection: 'modeDeltas', values: 'variables' },
  };
  const shape = MODE_SCOPE_SHAPES[armId];
  const modeVariables = {};
  for (const block of compiled?.[shape.collection] ?? []) {
    const perMode = {};
    for (const channel of channels) {
      if (Object.hasOwn(block[shape.values] ?? {}, channel)) {
        perMode[channel] = String(block[shape.values][channel]);
      }
    }
    modeVariables[block.mode] = perMode;
  }

  /* R-2 — THE EMPTY-LOWERING GUARD, ASKED OVER THE UNION OF EVERY SCOPE.
   *
   * It used to sit 35 lines above, between the base extraction and this mode
   * extraction, and that position was the whole defect: it was written before
   * H-3 phase (a), when a lowering WAS its base map, and it was never widened
   * when mode blocks became the other half of the lowering.
   *
   * Measured (R-1): rottay + `primary/crimson` through the DB door gives
   * `variables = {}` and `modeDeltas = [{ mode: 'light', 19 variables }]`
   * carrying two of the five declared channels
   * (`--ds-color-primary: #DC2626`, `--ds-chart-series-1: #B33831`). rottay is
   * the only first-party vertical with a dark `defaultMode`, so the v1
   * transport routes a top-level seed into its NON-default mode
   * (`migrate-v1:396`, `?? "light"`). The base delta is legitimately empty and
   * the door is not inert -- the guard was reading one of two scopes and
   * reporting a full lowering as a finding.
   *
   * FAIL-CLOSED IS UNCHANGED IN THE DIRECTION THAT MATTERS: an arm with
   * nothing in the base map AND nothing in any mode block is still refused, and
   * still with the sentence that says why. The message now names the scope so a
   * future reader cannot mistake "empty everywhere" for "empty in base". Which
   * scope carried what is recorded per channel in `producedBy.modeChannels`. */
  const modeChannelNames = Object.values(modeVariables).flatMap((map) => Object.keys(map));
  if (Object.keys(variables).length === 0 && modeChannelNames.length === 0) {
    throw new StopExclusionError(
      STOP_EXCLUSION_CLASSES.COMPILER_ELIDES_VERTICAL_DEFAULT,
      `resolution-probe: ${armId} lowered "${stopId}" through ${input.path} and emitted none of ` +
        `the declared channels (${channels.join(', ')}) in ANY scope — not in the base map and ` +
        `not in any mode block (${Object.keys(modeVariables).join(', ') || 'no mode block'}). ` +
        'That is the finding; it is not an arm.',
    );
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
        compilerInput:
          declaredAuthoredPaths === null
            ? compilerInput
            : { ...compilerInput, tenantAuthoredPaths: declaredAuthoredPaths },
        /* B-2: which paths this arm told the compiler the TENANT authored.
         * `null` means no claim was made — the DB arm always, and a static
         * IDENTITY stop by ruling (W-B: an identity is what the vertical
         * ships, not what a tenant selected). A reader can therefore tell a
         * run that declared authorship from one that did not without
         * re-deriving it from `stopId`. */
        tenantAuthoredPaths: declaredAuthoredPaths,
        /* R-2 (W-A): the mode scope this run was measured IN, named rather than
         * left to be excavated. The value physically travels inside
         * `compilerInput.appearance.palette.backgroundMode` (verified: it is
         * stamped by `toCompilerInput`, so it is NOT in `document`, which is the
         * manifest-path-relative shape `buildIngressInput` built before the
         * reshape). `null` on the static arm and on any DB document with no
         * palette node — both are honest: neither declares a mode scope. */
        modeScope:
          armId === 'db-tenant-theme'
            ? (compilerInput.appearance?.palette?.backgroundMode ??
              /* FASE-A: the advanced space keeps the same `general` one level
               * in, so the stamp is read from wherever the seal placed it. */
              compilerInput.visualFoundation?.general?.palette?.backgroundMode ??
              null)
            : null,
        /* FASE-A (W-A.1): the SECOND argument, in the record.
         *
         * An argument that changes what the compiler validates against has to
         * be readable in the provenance, for the same reason `modeScope` is.
         * `{}` in the simple space -- honest, nothing was handed over.
         *
         * The digest is NOT recomputed here. It is read off the artifact the
         * compiler just produced (`verticalEnvelopeDigest`), so the two halves
         * of the record CANNOT disagree -- the same law B-2 applied to
         * `tenantAuthoredPaths`. Re-deriving it would need a second sha
         * implementation (`sha256Utf8` is not published), i.e. a second
         * authority for one number. The object itself stays out: the artifact
         * already carries the digest and duplicating the envelope would fatten
         * every artifact without adding information. */
        compileOptions:
          compilerInput.mode === 'advanced'
            ? {
                verticalEnvelope: {
                  verticalKey: vertical,
                  digest: assertEnvelopeDigest(compiled, vertical),
                },
              }
            : {},
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
    if (spec.id === 'db-tenant-theme' && typeof module?.getTenantThemeVerticalEnvelope !== 'function') {
      throw new Error(
        `resolution-probe: ${spec.compilerModule} exports no getTenantThemeVerticalEnvelope, so ` +
          'the DB arm cannot lower an advanced document without hand-building the vertical ' +
          'policy envelope the compiler validates against. Failing at load, like the schema ' +
          'version above, rather than at the first advanced stop.',
      );
    }
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
       * Imported, never reconstructed, and it rides on the arm because that is
       * what the dist-freshness gate above has already proven fresh. */
      themeModeSelector: module?.themeModeSelector ?? null,
      themeModeSelectorSource: module?.themeModeSelector ? spec.compilerModule : null,
      /* FASE-A: the vertical policy envelope resolver, handed out with the arm
       * for exactly the reason `themeModeSelector` is -- it comes from the SAME
       * published module as the compiler, under the freshness the gate above
       * already proved. Never a deep-path import, never a hand-built envelope. */
      verticalEnvelopeFor: module?.getTenantThemeVerticalEnvelope ?? null,
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
  /* W-A (H-3 phase (a)): ONE named source for the mode grammar.
   *
   * MEASURED: the tenant-theme dist module does NOT export `themeModeSelector`
   * -- it calls it internally, from brand-theme, inside `renderArtifactCss`. So
   * the DB arm has no grammar of its own to hand out, and the DB arm now needs
   * one.
   *
   * It BORROWS the brand-theme export rather than the harness spelling
   * `[data-theme='<mode>']`, and the exporter itself declares that legitimate:
   * "Shared explicit-mode selector grammar for static AND DB artifact
   * renderers". Both modules are behind the same dist-freshness gate, so the
   * borrow proves as fresh as the compile. The lender is RECORDED on the
   * borrower (`themeModeSelectorSource`) so a reader never has to guess whose
   * grammar an arm used, and it fails closed if no arm exports one at all --
   * a harness with no grammar must refuse, not invent. */
  const lender = Object.values(loaded).find((arm) => typeof arm.themeModeSelector === 'function');
  /* No lender is not an error HERE. An arm needs the grammar only if it actually
   * lowered mode blocks, and `composeArmCss` refuses at exactly that point --
   * which is the fail-closed W-A asks for, placed where it can distinguish "this
   * run has mode scopes and no grammar" from "this fixture never had one". A
   * throw at load time would punish every mechanics drill that injects a
   * compiler double, and those doubles produce no modes. */
  for (const arm of Object.values(loaded)) {
    if (!lender) break;
    if (typeof arm.themeModeSelector === 'function') continue;
    arm.themeModeSelector = lender.themeModeSelector;
    arm.themeModeSelectorSource = lender.themeModeSelectorSource;
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
  defaultMode = null,
  verticalEnvelopeFor = null,
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

  const channels = calibrationChannels(controlManifest);
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
        /* FASE-A: the guard lowers through the SAME door as the arm, so it
         * needs the same envelope resolver. Without it an advanced control
         * would throw here and the throw is not publishable, which is the
         * correct direction but the wrong place to discover it. */
        verticalEnvelopeFor,
        /* R-2: the guard lowers the SAME document the arm lowers, mode scope
         * included. Without this a palette control would fail closed here
         * (`toCompilerInput` refuses a palette node with no declared scope),
         * which is the correct direction but the wrong place to stop — the
         * guard is meant to measure the arm, not to differ from it. */
        defaultMode,
        ...(armId === 'static-brand-theme' ? { base, baselineSource: baseline.source } : {}),
      });
      witnesses.push({ stopId: stop.id, variables: lowered.variables });
    } catch (error) {
      /* A stop that cannot lower on this arm is not a violation -- but only for
       * a reason on the CLOSED list, and the class is read off the ERROR rather
       * than recognised in its prose (see STOP_EXCLUSION_CLASSES).
       *
       * R-2 HARDENING. This catch used to publish ANY throw as an exclusion with
       * its message as the reason. A broken test double, a renamed field, a
       * wiring mistake -- each became a legitimate-looking "this stop cannot
       * lower", the witness set shrank, and the guard reported the shrunken set
       * as a measurement. That is the exact false-green this guard exists to
       * refuse, sitting inside the guard itself. Anything unclassified now
       * RE-THROWS, and the message says which stop and arm surfaced it so the
       * real defect is not buried under a discrimination verdict. */
      const exclusionClass = classifyStopExclusion(error);
      if (exclusionClass === null) {
        error.message =
          `resolution-probe: lowering stop "${stop.id}" on ${armId} for ` +
          `${controlManifest?.controlId} threw an error this guard is NOT allowed to publish as ` +
          `an exclusion (${error?.name ?? 'Error'}). The publishable set is closed: ` +
          `${Object.keys(STOP_EXCLUSION_CLASSES).join(', ')}. Fail-closed: an unrecognised throw ` +
          `is a defect in the harness or the run, not a reason a stop cannot lower.\n  ` +
          `${error.message}`;
        throw error;
      }
      excluded.push({ stopId: stop.id, reason: error.message, exclusionClass });
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
