/**
 * Machine rules for the Modern Rescue segmented customization manifest.
 *
 * generator.mjs owns file layout, skeleton generation and the index; this module owns the
 * grading laws that make a manifest cell a CONTRACT rather than prose. Every function here is
 * pure with respect to an explicit context object, so a drill can grade a temporary fixture
 * tree without touching the real manifest.
 *
 * Field spellings are NOT invented here. They come from
 * customization-model.json#controlImpactContract (`applicableFamilyFields`,
 * `internalChannelFields`, `familyDispositionVocabulary`) and from
 * customization-model.json#cardinalityLaw / #orthogonality.duplicateControlRule.
 * schema.json mirrors the same names, and generator.test.mjs fails if the three drift.
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { SIGHTED_APPROVER, validateReceipt } from '../../../v2/receipts.mjs';

export { SIGHTED_APPROVER };

// ---------------------------------------------------------------------------
// Closed vocabularies (mirrored in schema.json#vocabulary)
// ---------------------------------------------------------------------------

/**
 * README: "Theme controls, recipes/anatomy and instance APIs are different mechanisms."
 * A cell that claims IMPLEMENTED must say which mechanism carries the change, so a structural
 * choice can never be smuggled in as a CSS token.
 */
export const CELL_MECHANISMS = new Set(['THEME_CONTROL', 'RECIPE_OR_ANATOMY', 'INSTANCE_API']);

export const CHANNEL_PREFIXES = Object.freeze(['--ds-', '--_ds-', 'data-']);

/**
 * FAM-KINDS: closed list of control domain kinds. Mirror of
 * schema.json#vocabulary.domainKinds; program-check.mjs enforces both sides.
 */
/**
 * CASCADA (adjudicacion R4): closed vocabulary of derivation rule kinds.
 * Mirror-enforced by validateCascadeRoot; program-check drills a planted kind.
 */
export const DERIVATION_KINDS = Object.freeze([
  'calc-multiply',
  'calc-divide',
  'clamp',
  'alias',
  'identity',
  'data-attr-select',
  'table-lookup',
  'color-mix',
  'ramp-derive',
  'contest-rank',
  'literal-pin',
]);

/** CASCADA (C5/R7): closed precedence vocabulary for overlaps. */
export const PRECEDENCE_KINDS = Object.freeze([
  'authored-field-wins',
  'explicit-root-over-composite',
  'producer-rank',
  'floor-ceiling',
]);

/** CASCADA (R5): scratch markers; a scratch channel is never a customization socket. */
export const SCRATCH_CHANNEL = /(-resolved-|-resolved$|-computed-|-computed$|-effective-|-effective$|-current-|-current$)/;

/**
 * CASCADA: validate one authored root file (manifest/cascade/roots/<id>.json).
 * socketOwnership: Map<channelId, { owner: controlId, families: Set<familyId> }>
 * built from families internalChannels (semanticOwner edges).
 */
export function validateCascadeRoot(doc, { label, repositoryRoot, activeControlIds, controlTier, familyIds, socketOwnership }) {
  const errors = [];
  if (!doc || typeof doc !== 'object') { errors.push(`${label}: cascade root must be an object`); return errors; }
  if (!activeControlIds.includes(doc.rootId)) errors.push(`${label}: rootId ${JSON.stringify(doc.rootId ?? null)} is not an active control`);
  if (controlTier && doc.tier !== controlTier) errors.push(`${label}: tier ${JSON.stringify(doc.tier ?? null)} must mirror controls tier (${controlTier})`);
  const rc = doc.rootChannel;
  /**
   * CASCADA (enmienda cabeza-nula): la ley sabia expresar la COLA vacia
   * (`derivations: []` + `derivationsEmptyReason`) pero no la CABEZA vacia, y por eso
   * cobraba como defecto un eje que POR DISENO no baja a ningun canal CSS. Se enmienda la
   * ley, nunca el marcador: fabricar un canal de mentira para comprar el verde queda
   * prohibido, y un `channel` ausente/mal escrito sigue dando el error de siempre.
   *
   * `channel: null` es una declaracion EXPLICITA y solo se admite bajo la conjuncion
   * completa: razon citada (`headEmptyReason`, hermano literal de `derivationsEmptyReason`)
   * y las tres colas de canal vacias. Sin cabeza no hay arista que salga, asi que una
   * derivacion, un terminalReach o un solape contradicen la propia declaracion.
   *
   * Los `declaredOutputs` del control (channels/rootAttributes vacios) NO se consultan aqui:
   * no viajan en el contexto explicito de esta funcion y este modulo es puro respecto de ese
   * contexto — leer manifest/controls por path clavaria el arbol real y un drill ya no podria
   * graduar un fixture temporal. La conjuncion de arriba es la prueba que el propio doc puede
   * dar; el cross-check inverso de socketOwnership (mas abajo) sigue delatando cualquier
   * arista de canal que esta raiz posea de verdad.
   */
  const headDeclaredEmpty = rc != null && typeof rc === 'object' && rc.channel === null;
  if (!rc || !(isGovernedChannel(rc.channel) || headDeclaredEmpty)) {
    errors.push(`${label}: rootChannel.channel must be a governed channel`);
  } else if (headDeclaredEmpty) {
    if (!isNonEmptyString(rc.headEmptyReason)) {
      errors.push(
        `${label}: rootChannel.channel null requires rootChannel.headEmptyReason citing the source that proves this axis emits no governed channel (the head's sibling of derivationsEmptyReason)`,
      );
    }
    for (const field of ['derivations', 'terminalReach', 'overlaps']) {
      const value = doc[field];
      const empty = value == null || (Array.isArray(value) && value.length === 0);
      if (!empty) {
        errors.push(
          `${label}: rootChannel.channel null requires ${field} to be empty; a head that emits no channel cannot originate ${field}`,
        );
      }
    }
  }
  const emission = rc?.emission;
  if (!Array.isArray(emission) || emission.length === 0) {
    errors.push(`${label}: rootChannel.emission must be a non-empty array (R2: the cascade needs a head)`);
  } else {
    emission.forEach((e, i) => {
      for (const f of ['kind', 'site']) if (!isNonEmptyString(e?.[f])) errors.push(`${label}: emission[${i}] missing ${f}`);
      const reason = e?.site ? resolveSourceBinding(e.site, { repositoryRoot }) : null;
      if (reason) errors.push(`${label}: emission[${i}] site does not resolve: ${e.site} - ${reason}`);
      for (const opt of ['clampSite', 'tenantRejectSite']) {
        if (e?.[opt] != null) {
          const rr = resolveSourceBinding(e[opt], { repositoryRoot });
          if (rr) errors.push(`${label}: emission[${i}] ${opt} does not resolve: ${e[opt]} - ${rr}`);
        }
      }
    });
  }
  const derivations = doc.derivations;
  (Array.isArray(derivations) ? derivations : []).forEach((d, i) => {
    const where = `${label}: derivations[${i}]`;
    if (!isGovernedChannel(d?.from)) errors.push(`${where} from must be a governed channel`);
    if (!isGovernedChannel(d?.to)) errors.push(`${where} to must be a governed channel`);
    if (!DERIVATION_KINDS.includes(d?.rule?.kind)) errors.push(`${where} rule.kind ${JSON.stringify(d?.rule?.kind ?? null)} is not a governed derivation kind`);
    if (!['LIVE', 'PRESCRIPCION'].includes(d?.state)) errors.push(`${where} state must be LIVE or PRESCRIPCION`);
    if (d?.state !== 'PRESCRIPCION') {
      const reason = isNonEmptyString(d?.site) ? resolveSourceBinding(d.site, { repositoryRoot }) : 'missing site';
      if (reason) errors.push(`${where} site does not resolve: ${JSON.stringify(d?.site ?? null)} - ${reason}`);
    }
  });
  /**
   * CASCADA (enmienda cola vacia): el diente que la ley DABA POR PUESTO. `derivationsEmptyReason`
   * es el hermano que citan la cabeza (`headEmptyReason`, cuyo propio mensaje de error se
   * presenta como "the head's sibling of derivationsEmptyReason") y el vocabulario
   * (`variantsEmptyReason`) -- pero hasta hoy NINGUNA linea lo leia: cinco raices lo declaraban
   * y el gate no lo miraba. Una cola vacia sin razon pasaba en silencio, indistinguible de
   * "nadie la lleno todavia". Se cierra fail-closed aqui, y la ley deja de apelar a un hermano
   * que no existia como codigo.
   *
   * La simetria corre en las DOS direcciones, igual que en `variants`: una razon de hueco junto
   * a una cola NO vacia es una mentira declarada -- afirma que no hay derivaciones mientras las
   * lista -- y tambien va rojo, para que la razon no se fosilice cuando alguien llene la cola
   * mas tarde.
   *
   * NIVEL DE EXIGENCIA, deliberado: string no vacio, exactamente el que piden hoy
   * `headEmptyReason` y `variantsEmptyReason`. NO se endurece a "cita resoluble": subir las
   * tres razones a cita resoluble es una enmienda aparte y coordinada, no un efecto colateral
   * de darle dientes a esta.
   *
   * `overlaps` queda DELIBERADAMENTE fuera de esta ley, y no por olvido: 14 de las 20 raices
   * autoradas llevan `overlaps: []` y ninguna trae razon. `overlaps: []` es una AFIRMACION
   * COMPLETA -- "esta raiz no se solapa con ninguna otra" -- y validateCascadeSet ya la
   * confronta contra la reciprocidad (C4) de las demas raices. A diferencia de un vocabulario
   * cerrado ausente o de una cola de derivacion ausente, no oculta informacion faltante: no hay
   * hueco mudo que tapar. Exigirle razon seria burocracia, no fail-closed.
   */
  if (derivations != null && !Array.isArray(derivations)) {
    errors.push(`${label}: derivations must be an array when present`);
  } else {
    const derivationsEmpty = derivations == null || derivations.length === 0;
    const derivationsReason = doc.derivationsEmptyReason;
    if (derivationsEmpty && !isNonEmptyString(derivationsReason)) {
      errors.push(
        `${label}: empty derivations requires derivationsEmptyReason citing the source that proves this axis derives no further channel (the tail the head and the vocabulary both cite as their sibling)`,
      );
    }
    if (!derivationsEmpty && derivationsReason != null) {
      errors.push(
        `${label}: derivationsEmptyReason is declared while derivations is non-empty (${derivations.length} declared); a reason for a hole that does not exist is a declared lie`,
      );
    }
  }
  const reach = Array.isArray(doc.terminalReach) ? doc.terminalReach : [];
  const reachSet = new Set();
  reach.forEach((t, i) => {
    const where = `${label}: terminalReach[${i}]`;
    if (!isNonEmptyString(t?.channelId) || !t.channelId.startsWith('--_ds-')) errors.push(`${where} channelId must be a --_ds- family socket`);
    if (t?.channelId && SCRATCH_CHANNEL.test(t.channelId)) errors.push(`${where} channel ${t.channelId} carries a scratch marker and is not a customization socket (R5)`);
    if (!familyIds.has(t?.familyId)) errors.push(`${where} familyId ${JSON.stringify(t?.familyId ?? null)} is not a canonical family id`);
    if (t?.channelId && t?.familyId) {
      reachSet.add(`${t.familyId} ${t.channelId}`);
      const own = socketOwnership.get(t.channelId);
      if (!own || own.owner !== doc.rootId || !own.families.has(t.familyId)) {
        errors.push(`${where} ${t.channelId}@${t.familyId} is not backed by an internalChannels edge owned by ${doc.rootId} (orphan terminalReach)`);
      }
    }
  });
  for (const [channelId, own] of socketOwnership) {
    if (own.owner !== doc.rootId) continue;
    if (SCRATCH_CHANNEL.test(channelId)) continue;
    for (const fam of own.families) {
      if (!reachSet.has(`${fam} ${channelId}`)) {
        errors.push(`${label}: internalChannels edge ${channelId}@${fam} owned by ${doc.rootId} is missing from terminalReach (reverse cross-check)`);
      }
    }
  }
  /**
   * CASCADA (enmienda vocabulario vacio): el diente simetrico de la COLA y de la CABEZA,
   * aplicado ahora al VOCABULARIO. Una raiz declara en `variants` el vocabulario cerrado de
   * su eje. Hasta hoy un `variants` ausente o vacio pasaba el gate en silencio: un hueco
   * MUDO, indistinguible de "nadie lo lleno todavia". Se cierra fail-closed con el hermano
   * literal de `derivationsEmptyReason`: `variantsEmptyReason`.
   *
   * La simetria corre en las DOS direcciones. Una razon de hueco junto a un vocabulario NO
   * vacio es una mentira declarada -- afirma que no hay variantes mientras las lista -- y
   * tambien va rojo, para que la razon no se fosilice cuando alguien llene el vocabulario
   * mas tarde.
   *
   * NIVEL DE EXIGENCIA, deliberado: string no vacio, exactamente el que pide hoy
   * `headEmptyReason` unas lineas mas arriba. No se endurece a "cita resoluble" porque el
   * hermano que esta regla replica no lo hace (`derivationsEmptyReason` hoy no lo valida
   * NINGUN gate, y `headEmptyReason` solo exige string no vacio). Una regla nueva no puede
   * exigir mas prueba que la ley que dice replicar; endurecer las tres es una enmienda
   * aparte y coordinada.
   *
   * `variantsLaw` es OPCIONAL y sigue siendolo: solo tres raices lo llevan. Se valida su
   * forma cuando esta, nunca su presencia.
   */
  const variants = doc.variants;
  if (variants != null && !Array.isArray(variants)) {
    errors.push(`${label}: variants must be an array when present`);
  } else {
    const variantsEmpty = variants == null || variants.length === 0;
    const variantsReason = doc.variantsEmptyReason;
    if (variantsEmpty && !isNonEmptyString(variantsReason)) {
      errors.push(
        `${label}: empty variants requires variantsEmptyReason citing the source that proves this axis declares no closed vocabulary (the vocabulary's sibling of derivationsEmptyReason)`,
      );
    }
    if (!variantsEmpty && variantsReason != null) {
      errors.push(
        `${label}: variantsEmptyReason is declared while variants is non-empty (${variants.length} declared); a reason for a hole that does not exist is a declared lie`,
      );
    }
  }
  if (doc.variantsLaw != null && !isNonEmptyString(doc.variantsLaw)) {
    errors.push(`${label}: variantsLaw is optional, but when present it must be a non-empty string`);
  }
  (doc.overlaps || []).forEach((o, i) => {
    const where = `${label}: overlaps[${i}]`;
    if (!activeControlIds.includes(o?.withRoot)) errors.push(`${where} withRoot must be an active control`);
    if (!PRECEDENCE_KINDS.includes(o?.precedence)) errors.push(`${where} precedence ${JSON.stringify(o?.precedence ?? null)} is not a governed precedence kind`);
    for (const f of ['mechanismSite', 'precedenceSite']) {
      if (isNonEmptyString(o?.[f])) {
        const reason = resolveSourceBinding(o[f], { repositoryRoot });
        if (reason) errors.push(`${where} ${f} does not resolve: ${o[f]} - ${reason}`);
      } else errors.push(`${where} missing ${f}`);
    }
  });
  return errors;
}

/**
 * CASCADA set-level laws: single home per derived channel (R6; duplicates
 * escalate, never invent) and overlap reciprocity (C4).
 */
export function validateCascadeSet(docs, { label }) {
  const errors = [];
  const homes = new Map();
  for (const doc of docs) {
    for (const d of doc.derivations || []) {
      if (!d?.to) continue;
      if (d.toIsPattern === true) continue; // un placeholder de patron no es un canal: dos pliegues de mapa no comparten hogar
      if (homes.has(d.to) && homes.get(d.to) !== doc.rootId) {
        errors.push(`${label}: channel ${d.to} has two homes (${homes.get(d.to)}, ${doc.rootId}) - escalate to adjudicator, do not invent (R6)`);
      } else homes.set(d.to, doc.rootId);
    }
  }
  const byId = new Map(docs.map((d) => [d.rootId, d]));
  for (const doc of docs) {
    for (const o of doc.overlaps || []) {
      const other = byId.get(o?.withRoot);
      if (!other) continue;
      const mirrored = (other.overlaps || []).some((b) => b?.withRoot === doc.rootId);
      if (!mirrored) errors.push(`${label}: overlap ${doc.rootId} -> ${o.withRoot} lacks its reciprocal (C4)`);
    }
  }
  return errors;
}

export const DOMAIN_KINDS = Object.freeze([
  'enum',
  'closed-enum',
  'bounded',
  'scale',
  'color-set',
  'chrome-map',
  'token-map',
  'font-stack',
  'profile-id',
  'enum-map',
  'axis-enum-map',
]);

/**
 * customization-model.json#controlImpactContract.forbiddenControlSegmentFields, verbatim.
 *
 * Families own applicability edges; a control that hand-lists them creates a second,
 * unfalsifiable spelling of the same edge. The reverse control -> family/part/channel view is
 * GENERATED from family cells instead, so it can never disagree with them.
 *
 * The set is checked RECURSIVELY. `representativeFamilyIds` survived a top-level-only check for
 * an entire session by sitting inside `calibration`, and `mountClassIds` rode along beside it
 * naming DOM classes (`ds-flex`) that no component has ever emitted -- an unfounded family edge
 * that no gate could see. Depth is not a hiding place.
 */
export const FORBIDDEN_CONTROL_FAMILY_EDGE_FIELDS = Object.freeze([
  'consumerFamilyIds',
  'families',
  'familyGroups',
  'familyIds',
  'mountClassIds',
  'parts',
  'propertyGroups',
  'representativeFamilyIds',
]);

/** Every path at which a forbidden family-edge field appears, at any depth. */
export function findForbiddenFamilyEdgeFields(value, path = '') {
  if (value === null || typeof value !== 'object') return [];
  if (Array.isArray(value)) {
    return value.flatMap((entry, index) =>
      findForbiddenFamilyEdgeFields(entry, `${path}[${index}]`),
    );
  }
  const found = [];
  for (const [key, child] of Object.entries(value)) {
    const where = path ? `${path}.${key}` : key;
    if (FORBIDDEN_CONTROL_FAMILY_EDGE_FIELDS.includes(key)) found.push(where);
    found.push(...findForbiddenFamilyEdgeFields(child, where));
  }
  return found;
}

/**
 * customization-model.json#controlImpactContract.internalChannelFields, verbatim.
 * An internal channel edge on an APPLICABLE cell must carry every one of these.
 */
export const INTERNAL_CHANNEL_FIELDS = Object.freeze([
  'channelId',
  'semanticOwner',
  'producer',
  'fallbackAuthority',
  'productiveConsumerFamilyIds',
  'sourceBindings',
  'replacementDisposition',
]);

/**
 * customization-model.json#controlImpactContract.applicableFamilyFields, verbatim.
 * `staticSourceBindings` and `dbSourceBindings` are deliberately separate: the split is what
 * makes "static and DB produce equivalent normalized output" checkable per family instead of
 * asserted once for the whole control.
 */
export const APPLICABLE_FAMILY_FIELDS = Object.freeze([
  'familyId',
  'stableParts',
  'states',
  'propertyGroups',
  'computedProperties',
  'staticSourceBindings',
  'dbSourceBindings',
  'internalChannels',
  'negativeControls',
  'stressCases',
  'evidenceIds',
  'nextAction',
]);

/**
 * `replacementDisposition` is declared by the model but never given a value vocabulary. It is
 * the field that carries the three channel cases, so it is closed here rather than wrapped in a
 * second partition object: a live channel, a channel a migration still has to add, and a
 * channel a completed migration retired ("A replacement retires its predecessor in the same
 * completed migration; aliases are not a second product model").
 */
export const CHANNEL_REPLACEMENT_STATES = new Set(['LIVE', 'REQUIRED_ADDITION', 'RETIRED']);

export const ASSESSMENT_STATE_RANK = Object.freeze({
  UNKNOWN: 0,
  SOURCE_BOUND: 1,
  IMPLEMENTED: 2,
  COMPUTED_VERIFIED: 3,
  SIGHTED_ACCEPTED: 4,
});

export const MAXIMUM_CLAIM_RANK = Object.freeze({
  INVENTORIED_ONLY: 0,
  SOURCE_BOUND: 1,
  ASSESSED: 2,
  COMPUTED_VERIFIED: 3,
  SIGHTED_ACCEPTED: 4,
});

export const MAXIMUM_CLAIM_BY_ASSESSMENT_STATE = Object.freeze({
  UNKNOWN: 'INVENTORIED_ONLY',
  SOURCE_BOUND: 'SOURCE_BOUND',
  IMPLEMENTED: 'ASSESSED',
  COMPUTED_VERIFIED: 'COMPUTED_VERIFIED',
  SIGHTED_ACCEPTED: 'SIGHTED_ACCEPTED',
});

/**
 * A receipt proves a ROLE, not merely that a file exists. COMPUTED_VERIFIED needs one receipt
 * that moved computed properties and one that restored the exact baseline; SIGHTED_ACCEPTED
 * needs a sighted receipt produced by somebody other than the sighted approver.
 */
export const EVIDENCE_PROOF_ROLES = Object.freeze({
  COMPUTED_DELTA: Object.freeze([
    'computed-delta',
    'computed-property-delta',
    'static-db-computed-parity',
  ]),
  EXACT_RESTORE: Object.freeze(['exact-restore', 'restore-parity']),
  SIGHTED: Object.freeze(['sighted-acceptance', 'sighted-review']),
});

/** README test-truth table. A red test is an observation; the class decides what may change. */
export const RED_TEST_CLASSES = new Set([
  'CURRENT_CONTRACT',
  'AGED_EXPECTATION',
  'INVALID_MECHANISM',
  'UNVERIFIED',
]);

export const RED_TEST_ALLOWED_ACTIONS = Object.freeze({
  CURRENT_CONTRACT: 'FIX_SOURCE',
  AGED_EXPECTATION: 'UPDATE_EXPECTATION_WITH_COUNTERFACTUAL_CONTROL',
  INVALID_MECHANISM: 'FIX_INSTRUMENT',
  UNVERIFIED: 'NONE',
});

export const RED_TEST_REQUIRED_FIELDS = Object.freeze([
  'authorityRef',
  'measuredScope',
  'sourceSha',
  'positiveControl',
]);

export const FAMILY_SECTION_KEYS = Object.freeze([
  'anatomy',
  'recipeAnatomy',
  'instanceApi',
  'hostAdaptation',
  'statesMotion',
  'invariants',
]);

/** customization-model.json#orthogonality.duplicateControlRule */
export const DUPLICATE_CONTROL_JACCARD_CEILING = 0.8;

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isNonEmptyArray(value) {
  return Array.isArray(value) && value.length > 0;
}

function rankOf(state) {
  return ASSESSMENT_STATE_RANK[state] ?? -1;
}

// ---------------------------------------------------------------------------
// Source bindings
// ---------------------------------------------------------------------------

/**
 * A binding is `<repo-relative path>` or `<repo-relative path>#<Symbol>`. The path may be a
 * file or a directory; a `#Symbol` suffix additionally requires a FILE that literally contains
 * the symbol. A path that merely exists never proves a symbol.
 *
 * @returns {string|null} a human reason when the binding does not resolve, otherwise null.
 */
export function resolveSourceBinding(binding, { repositoryRoot }) {
  if (!isNonEmptyString(binding)) return 'binding must be a non-empty string';
  const hashIndex = binding.indexOf('#');
  const pathPart = hashIndex === -1 ? binding : binding.slice(0, hashIndex);
  const symbol = hashIndex === -1 ? null : binding.slice(hashIndex + 1);
  if (!isNonEmptyString(pathPart)) return 'binding must name a repository-relative path';
  if (pathPart.startsWith('/') || pathPart.split('/').includes('..')) {
    return 'binding must be repository-relative and must not escape the repository';
  }
  const absolute = join(repositoryRoot, pathPart);
  if (!existsSync(absolute)) return 'path does not exist';
  if (symbol !== null) {
    if (!isNonEmptyString(symbol)) return 'symbol suffix is empty';
    if (!statSync(absolute).isFile()) return 'a #Symbol binding must name a file';
    if (!readFileSync(absolute, 'utf8').includes(symbol)) {
      return `file does not contain symbol ${JSON.stringify(symbol)}`;
    }
  }
  return null;
}

/** Grades a whole binding list; `bindings` may also be an object map of role -> binding. */
export function validateSourceBindings(bindings, { label, repositoryRoot }) {
  const errors = [];
  const list = Array.isArray(bindings)
    ? bindings
    : bindings && typeof bindings === 'object'
      ? Object.values(bindings)
      : [];
  for (const binding of list) {
    const reason = resolveSourceBinding(binding, { repositoryRoot });
    if (reason) {
      errors.push(`${label}: source binding does not resolve: ${JSON.stringify(binding)} — ${reason}`);
    }
  }
  return errors;
}

function bindingCount(bindings) {
  if (Array.isArray(bindings)) return bindings.length;
  if (bindings && typeof bindings === 'object') return Object.keys(bindings).length;
  return 0;
}

// ---------------------------------------------------------------------------
// Evidence receipts — resolved by CONTENT, never by path existence
// ---------------------------------------------------------------------------

/**
 * Resolves one `evidenceId` to a receipt under the evidence root declared by
 * evidence-contract.json and validates its CONTENT with the existing v2 receipt validator
 * (receiptRequiredFields, artifactSha256 vs artifact bytes, artifact under an allowed root,
 * createdAt not in the future, negativeDrill, producer-is-not-sighted-approver). No second set
 * of receipt rules is written here.
 *
 * @returns {{ receipt: object|null, failures: string[] }}
 */
export function resolveEvidenceReceipt(evidenceId, { repositoryRoot, contracts, now }) {
  const failures = [];
  if (!isNonEmptyString(evidenceId)) {
    return { receipt: null, failures: ['evidence id must be a non-empty string'] };
  }
  const evidenceRoot = contracts?.evidence?.root;
  if (!isNonEmptyString(evidenceRoot)) {
    return { receipt: null, failures: ['evidence-contract.json declares no evidence root'] };
  }
  const normalized = evidenceId.replace(/^\.\//, '');
  if (!normalized.startsWith(`${evidenceRoot}/`)) {
    return {
      receipt: null,
      failures: [`evidence ${evidenceId} is outside the allowed evidence root ${evidenceRoot}`],
    };
  }
  if (!normalized.endsWith('.json')) {
    return { receipt: null, failures: [`evidence ${evidenceId} is not a receipt document`] };
  }
  const absolute = join(repositoryRoot, normalized);
  if (!existsSync(absolute) || !statSync(absolute).isFile()) {
    return { receipt: null, failures: [`evidence receipt ${evidenceId} does not exist`] };
  }
  let receipt;
  try {
    receipt = JSON.parse(readFileSync(absolute, 'utf8'));
  } catch (error) {
    return {
      receipt: null,
      failures: [`evidence receipt ${evidenceId} is not valid JSON: ${error.message}`],
    };
  }
  const result = validateReceipt(receipt, { contracts, root: repositoryRoot, now });
  for (const failure of result.failures) failures.push(`evidence receipt ${evidenceId}: ${failure}`);
  return { receipt, failures };
}

/**
 * Resolves every evidence id of one claimant and additionally binds the receipt to the
 * claiming family: a family may not borrow another family's receipt.
 */
export function resolveEvidenceIds(evidenceIds, { label, familyId, repositoryRoot, contracts, now }) {
  const errors = [];
  const receipts = [];
  for (const evidenceId of evidenceIds ?? []) {
    const { receipt, failures } = resolveEvidenceReceipt(evidenceId, { repositoryRoot, contracts, now });
    for (const failure of failures) errors.push(`${label}: ${failure}`);
    if (!receipt) continue;
    if (
      isNonEmptyString(familyId) &&
      isNonEmptyString(receipt.familyId) &&
      receipt.familyId !== familyId &&
      !receipt.familyId.startsWith('program/')
    ) {
      errors.push(
        `${label}: evidence receipt ${evidenceId} is bound to family ${receipt.familyId}, not ${familyId}`,
      );
      continue;
    }
    receipts.push(receipt);
  }
  return { receipts, errors };
}

function hasProofRole(receipts, role) {
  const kinds = EVIDENCE_PROOF_ROLES[role];
  return receipts.some((receipt) => kinds.includes(receipt.evidenceKind));
}

// ---------------------------------------------------------------------------
// Internal channels
// ---------------------------------------------------------------------------

function isGovernedChannel(channelId) {
  return isNonEmptyString(channelId) && CHANNEL_PREFIXES.some((prefix) => channelId.startsWith(prefix));
}

/**
 * Validates one cell's `internalChannels` list against `internalChannelFields` and returns the
 * edges it declares, so validateInternalChannelLaws can enforce the cardinality law across the
 * whole manifest.
 *
 * `internalChannels` is REQUIRED at IMPLEMENTED+ and OPTIONAL below it — but whenever it is
 * present it is fully validated, at every state.
 */
export function validateInternalChannels(channels, { label, owner, repositoryRoot, activeControlIds, familyIds }) {
  const errors = [];
  const declared = [];
  if (channels === undefined || channels === null) return { errors, declared };
  if (!Array.isArray(channels)) {
    errors.push(`${label}: internalChannels must be an array of ${INTERNAL_CHANNEL_FIELDS.join('/')} edges`);
    return { errors, declared };
  }

  channels.forEach((edge, index) => {
    const where = `${label}: internalChannels[${index}]`;
    if (!edge || typeof edge !== 'object' || Array.isArray(edge)) {
      errors.push(`${where} must be an internal channel edge object`);
      return;
    }
    const channelId = edge.channelId;
    const named = isNonEmptyString(channelId) ? channelId : `<index ${index}>`;
    for (const field of INTERNAL_CHANNEL_FIELDS) {
      if (!Object.hasOwn(edge, field)) errors.push(`${where} channel ${named} is missing ${field}`);
    }
    if (!isGovernedChannel(channelId)) {
      errors.push(
        `${where} channelId ${JSON.stringify(channelId ?? null)} must start with one of ${CHANNEL_PREFIXES.join(', ')}`,
      );
    }

    // cardinalityLaw: one semantic owner per channel. The owner is the public control that
    // lowers into it, so it must name a real active control manifest id.
    if (!isNonEmptyString(edge.semanticOwner)) {
      errors.push(`${where} channel ${named} requires semanticOwner naming the owning control id`);
    } else if (!activeControlIds.includes(edge.semanticOwner)) {
      errors.push(
        `${where} channel ${named} names semanticOwner ${edge.semanticOwner}, which is not an active control manifest id`,
      );
    }

    const producerReason = resolveSourceBinding(edge.producer, { repositoryRoot });
    if (producerReason) {
      errors.push(
        `${where} channel ${named} producer does not resolve: ${JSON.stringify(edge.producer ?? null)} — ${producerReason}`,
      );
    }

    if (!Object.hasOwn(edge, 'fallbackAuthority')) {
      // already reported by the required-field sweep
    } else if (edge.fallbackAuthority !== null) {
      const reason = resolveSourceBinding(edge.fallbackAuthority, { repositoryRoot });
      if (reason) {
        errors.push(
          `${where} channel ${named} fallbackAuthority does not resolve: ${JSON.stringify(edge.fallbackAuthority)} — ${reason}; declare null when the channel has no fallback authority`,
        );
      }
    }

    if (!isNonEmptyArray(edge.sourceBindings)) {
      errors.push(`${where} channel ${named} requires non-empty sourceBindings`);
    }
    errors.push(
      ...validateSourceBindings(edge.sourceBindings, { label: `${where} channel ${named}`, repositoryRoot }),
    );

    const disposition = edge.replacementDisposition;
    let state = null;
    if (!disposition || typeof disposition !== 'object' || Array.isArray(disposition)) {
      errors.push(
        `${where} channel ${named} requires replacementDisposition { state: ${[...CHANNEL_REPLACEMENT_STATES].join(' | ')} }`,
      );
    } else if (!CHANNEL_REPLACEMENT_STATES.has(disposition.state)) {
      errors.push(
        `${where} channel ${named} replacementDisposition.state ${JSON.stringify(disposition.state ?? null)} must be one of ${[...CHANNEL_REPLACEMENT_STATES].join(', ')}`,
      );
    } else {
      state = disposition.state;
      if (state !== 'LIVE' && !isNonEmptyString(disposition.reason)) {
        errors.push(`${where} channel ${named} replacementDisposition ${state} requires reason`);
      }
      if (state === 'RETIRED') {
        if (!Object.hasOwn(disposition, 'replacedBy')) {
          errors.push(
            `${where} channel ${named} replacementDisposition RETIRED requires replacedBy, or an explicit null`,
          );
        } else if (disposition.replacedBy !== null && !isGovernedChannel(disposition.replacedBy)) {
          errors.push(
            `${where} channel ${named} replacementDisposition.replacedBy must be a governed channel id or null`,
          );
        }
      }
    }

    // A live channel with no productive consumer is a dead channel.
    if (state !== 'RETIRED') {
      if (!isNonEmptyArray(edge.productiveConsumerFamilyIds)) {
        errors.push(
          `${where} channel ${named} declares no productiveConsumerFamilyIds, so it is a dead channel`,
        );
      } else {
        for (const consumerId of edge.productiveConsumerFamilyIds) {
          if (!familyIds.has(consumerId)) {
            errors.push(
              `${where} channel ${named} names productive consumer ${JSON.stringify(consumerId)}, which is not a canonical family id`,
            );
          }
        }
      }
    }

    if (isNonEmptyString(channelId) && state) {
      declared.push({ channelId, semanticOwner: edge.semanticOwner ?? null, owner, state });
    }
  });

  return { errors, declared };
}

/**
 * Cross-file channel laws over the WHOLE manifest, from customization-model.json#cardinalityLaw:
 * "Internal channels may have many productive consumers but never competing semantic owners",
 * plus README: a retired channel is not a second product model that stays alive elsewhere.
 */
export function validateInternalChannelLaws(declarations) {
  const errors = [];
  const owners = new Map();
  const retired = new Map();
  for (const edge of declarations) {
    if (edge.state === 'RETIRED') {
      if (!retired.has(edge.channelId)) retired.set(edge.channelId, edge);
      continue;
    }
    const previous = owners.get(edge.channelId);
    if (!previous) {
      owners.set(edge.channelId, edge);
    } else if (previous.semanticOwner !== edge.semanticOwner) {
      errors.push(
        `channel ${edge.channelId} has competing semantic owners: ${previous.semanticOwner} (${previous.owner}) and ${edge.semanticOwner} (${edge.owner})`,
      );
    }
  }
  for (const edge of declarations) {
    if (edge.state === 'RETIRED') continue;
    const retirement = retired.get(edge.channelId);
    if (retirement) {
      errors.push(
        `channel ${edge.channelId} is retired by ${retirement.owner} but is still declared ${edge.state} by ${edge.owner}`,
      );
    }
  }
  return errors;
}

// ---------------------------------------------------------------------------
// Duplicate-control orthogonality (customization-model.json#orthogonality)
// ---------------------------------------------------------------------------

/**
 * "If consumer/property-group Jaccard similarity exceeds 0.80, derive or merge unless an owner
 * records an independent semantic invariant."
 *
 * The comparable set for a control is its APPLICABLE `<familyId>::<propertyGroup>` pairs. The
 * rule is INERT while no control has an APPLICABLE row — it must never fabricate similarity out
 * of two empty sets — and becomes binding as rows populate.
 */
export function validateControlOrthogonality({ consumerSetsByControl, independentInvariantByControl }) {
  const errors = [];
  const entries = [...consumerSetsByControl.entries()].filter(([, set]) => set.size > 0);
  for (let i = 0; i < entries.length; i += 1) {
    for (let j = i + 1; j < entries.length; j += 1) {
      const [leftId, left] = entries[i];
      const [rightId, right] = entries[j];
      let intersection = 0;
      for (const key of left) if (right.has(key)) intersection += 1;
      const union = left.size + right.size - intersection;
      if (union === 0) continue;
      const similarity = intersection / union;
      if (similarity <= DUPLICATE_CONTROL_JACCARD_CEILING) continue;
      const excused =
        isNonEmptyString(independentInvariantByControl.get(leftId)) ||
        isNonEmptyString(independentInvariantByControl.get(rightId));
      if (excused) continue;
      errors.push(
        `controls ${leftId} and ${rightId} share ${similarity.toFixed(2)} consumer/property-group Jaccard similarity, above ${DUPLICATE_CONTROL_JACCARD_CEILING}; derive or merge, or record independentSemanticInvariant on one of them`,
      );
    }
  }
  return errors;
}

// ---------------------------------------------------------------------------
// Test-truth classification (README test truth policy, machine form)
// ---------------------------------------------------------------------------

/**
 * A validator for records that lanes author. It is deliberately NOT a list of known red tests,
 * NOT a repair queue and NOT a second WO status: it only refuses a classification that has not
 * earned its allowed action.
 */
export function validateRedTestClassifications(records, { label, repositoryRoot }) {
  const errors = [];
  if (records === undefined || records === null) return errors;
  if (!Array.isArray(records)) {
    errors.push(`${label}: redTestClassifications must be an array`);
    return errors;
  }
  records.forEach((record, index) => {
    const where = `${label}: redTestClassifications[${index}]`;
    if (!record || typeof record !== 'object' || Array.isArray(record)) {
      errors.push(`${where} must be a classification record`);
      return;
    }
    const named = isNonEmptyString(record.testRef) ? record.testRef : `<index ${index}>`;
    if (!isNonEmptyString(record.testRef)) {
      errors.push(`${where} requires testRef`);
    } else {
      const reason = resolveSourceBinding(record.testRef, { repositoryRoot });
      if (reason) errors.push(`${where} testRef ${named} does not resolve — ${reason}`);
    }
    if (!RED_TEST_CLASSES.has(record.class)) {
      errors.push(
        `${where} testRef ${named} has class ${JSON.stringify(record.class ?? null)}, which is not one of ${[...RED_TEST_CLASSES].join(', ')}`,
      );
      return;
    }
    const missing = RED_TEST_REQUIRED_FIELDS.filter((field) => !isNonEmptyString(record[field]));
    for (const field of missing) errors.push(`${where} testRef ${named} is missing ${field}`);
    if (missing.length > 0) {
      if (record.allowedAction !== 'NONE') {
        errors.push(
          `${where} testRef ${named} is missing ${missing.join(', ')}, so allowedAction must be NONE, got ${JSON.stringify(record.allowedAction ?? null)}`,
        );
      }
      return;
    }
    const expected = RED_TEST_ALLOWED_ACTIONS[record.class];
    if (record.allowedAction !== expected) {
      errors.push(
        `${where} testRef ${named} class ${record.class} permits allowedAction ${expected}, got ${JSON.stringify(record.allowedAction ?? null)}`,
      );
    }
  });
  return errors;
}

// ---------------------------------------------------------------------------
// State-graded cells and sections
// ---------------------------------------------------------------------------

/**
 * Grades one themeControls cell against the strictly increasing state ladder and returns both
 * the errors it found and the internal channel edges it contributes to the cross-file laws.
 */
export function validateCell(cell, options) {
  const {
    label,
    familyId,
    anatomy,
    repositoryRoot,
    contracts,
    activeControlIds,
    familyIds,
    now,
  } = options;
  const errors = [];
  const controlId = isNonEmptyString(cell?.controlId) ? cell.controlId : '<missing controlId>';
  const where = `${label}: ${controlId}`;
  const state = cell?.verificationState;
  const rank = rankOf(state);
  let declared = [];

  if (rank < 0) return { errors, declared };

  // UNKNOWN — may be incomplete, but must say why. It awards nothing.
  if (rank === ASSESSMENT_STATE_RANK.UNKNOWN && !isNonEmptyString(cell.unknownReason)) {
    errors.push(`${where} verificationState UNKNOWN requires unknownReason`);
  }

  // internalChannels is optional below IMPLEMENTED, but always fully validated when present.
  const channels = validateInternalChannels(cell?.internalChannels, {
    label: where,
    owner: `${familyId}/${controlId}`,
    repositoryRoot,
    activeControlIds,
    familyIds,
  });
  errors.push(...channels.errors);
  declared = channels.declared;

  errors.push(
    ...validateRedTestClassifications(cell?.redTestClassifications, { label: where, repositoryRoot }),
  );

  // SOURCE_BOUND — the generic binding list must exist and every binding must resolve.
  if (rank >= ASSESSMENT_STATE_RANK.SOURCE_BOUND) {
    if (!isNonEmptyArray(cell.sourceBindings)) {
      errors.push(`${where} ${state} requires non-empty sourceBindings`);
    }
    errors.push(...validateSourceBindings(cell.sourceBindings, { label: where, repositoryRoot }));
  }

  // IMPLEMENTED — parts, groups, computed properties, a declared mechanism and live channels.
  if (rank >= ASSESSMENT_STATE_RANK.IMPLEMENTED) {
    for (const field of ['stableParts', 'propertyGroups', 'computedProperties']) {
      if (!isNonEmptyArray(cell[field])) errors.push(`${where} ${state} requires non-empty ${field}`);
    }
    if (!CELL_MECHANISMS.has(cell.mechanism)) {
      errors.push(
        `${where} ${state} requires mechanism in ${[...CELL_MECHANISMS].join(' | ')}, got ${JSON.stringify(cell.mechanism ?? null)}`,
      );
    }
    if (!isNonEmptyArray(cell.internalChannels)) {
      errors.push(`${where} ${state} requires non-empty internalChannels`);
    }
    // A cell may not invent a part or property group the family anatomy does not own.
    const ownedParts = new Set(anatomy?.stableParts ?? []);
    for (const part of cell.stableParts ?? []) {
      if (!ownedParts.has(part)) {
        errors.push(
          `${where} declares stable part ${JSON.stringify(part)}, which anatomy.stableParts does not own`,
        );
      }
    }
    const ownedGroups = new Set(anatomy?.propertyGroups ?? []);
    for (const group of cell.propertyGroups ?? []) {
      if (!ownedGroups.has(group)) {
        errors.push(
          `${where} declares property group ${JSON.stringify(group)}, which anatomy.propertyGroups does not own`,
        );
      }
    }
  }

  // Receipts, resolved by content and by proof role.
  let receipts = [];
  const needsEvidence =
    rank >= ASSESSMENT_STATE_RANK.COMPUTED_VERIFIED ||
    cell.disposition === 'NOT_APPLICABLE_WITH_REASON' ||
    cell.disposition === 'INVARIANT_WITH_REASON';
  if (needsEvidence || isNonEmptyArray(cell.evidenceIds)) {
    const resolved = resolveEvidenceIds(cell.evidenceIds, {
      label: where,
      familyId,
      repositoryRoot,
      contracts,
      now,
    });
    receipts = resolved.receipts;
    errors.push(...resolved.errors);
  }

  if (rank >= ASSESSMENT_STATE_RANK.COMPUTED_VERIFIED) {
    if (!isNonEmptyArray(cell.negativeControls)) {
      errors.push(`${where} ${state} requires non-empty negativeControls`);
    }
    if (!isNonEmptyArray(cell.evidenceIds)) {
      errors.push(`${where} ${state} requires non-empty evidenceIds`);
    }
    if (!hasProofRole(receipts, 'COMPUTED_DELTA')) {
      errors.push(
        `${where} ${state} requires a receipt whose evidenceKind proves computed deltas (${EVIDENCE_PROOF_ROLES.COMPUTED_DELTA.join(' | ')})`,
      );
    }
    if (!hasProofRole(receipts, 'EXACT_RESTORE')) {
      errors.push(
        `${where} ${state} requires a receipt whose evidenceKind proves exact restore (${EVIDENCE_PROOF_ROLES.EXACT_RESTORE.join(' | ')})`,
      );
    }
  }

  if (rank >= ASSESSMENT_STATE_RANK.SIGHTED_ACCEPTED) {
    const sighted = receipts.filter((receipt) =>
      EVIDENCE_PROOF_ROLES.SIGHTED.includes(receipt.evidenceKind),
    );
    if (sighted.length === 0) {
      errors.push(
        `${where} ${state} requires a sighted receipt (${EVIDENCE_PROOF_ROLES.SIGHTED.join(' | ')})`,
      );
    } else if (!sighted.some((receipt) => receipt.producer !== SIGHTED_APPROVER)) {
      errors.push(
        `${where} ${state} requires a sighted receipt whose producer is not ${SIGHTED_APPROVER}`,
      );
    }
  }

  // Dispositions.
  if (cell.disposition === 'APPLICABLE') {
    if (rank < ASSESSMENT_STATE_RANK.IMPLEMENTED) {
      errors.push(
        `${where} disposition APPLICABLE requires verificationState IMPLEMENTED or stronger, got ${state}`,
      );
    }
    // controlImpactContract.applicableFamilyFields — the whole row, not a plausible subset.
    for (const field of APPLICABLE_FAMILY_FIELDS) {
      const value = cell[field];
      const present = Array.isArray(value) ? value.length > 0 : isNonEmptyString(value);
      if (!present) errors.push(`${where} disposition APPLICABLE requires non-empty ${field}`);
    }
    if (isNonEmptyString(cell.familyId) && cell.familyId !== familyId) {
      errors.push(`${where} declares familyId ${cell.familyId}, which is not the owning family ${familyId}`);
    }
    // The static/DB split is what makes equivalence checkable per family.
    for (const field of ['staticSourceBindings', 'dbSourceBindings']) {
      errors.push(...validateSourceBindings(cell[field], { label: `${where} ${field}`, repositoryRoot }));
    }
  }
  if (cell.disposition === 'NOT_APPLICABLE_WITH_REASON' || cell.disposition === 'INVARIANT_WITH_REASON') {
    if (!isNonEmptyString(cell.reason)) {
      errors.push(`${where} ${cell.disposition} requires reason`);
    }
    if (!isNonEmptyArray(cell.negativeControls)) {
      errors.push(`${where} ${cell.disposition} requires non-empty negativeControls`);
    }
    if (!isNonEmptyArray(cell.evidenceIds)) {
      errors.push(`${where} ${cell.disposition} requires non-empty evidenceIds`);
    }
    const proof = cell.negativeProof;
    if (!proof || typeof proof !== 'object' || Array.isArray(proof)) {
      errors.push(
        `${where} ${cell.disposition} requires negativeProof { measuredProperties, measuredScope, method }; an existing path is not proof`,
      );
    } else {
      if (!isNonEmptyArray(proof.measuredProperties)) {
        errors.push(`${where} negativeProof requires non-empty measuredProperties`);
      }
      if (!isNonEmptyString(proof.measuredScope)) {
        errors.push(`${where} negativeProof requires measuredScope`);
      }
      if (!isNonEmptyString(proof.method)) {
        errors.push(`${where} negativeProof requires method`);
      }
    }
  }

  return { errors, declared };
}

/** Applies the same ladder to one family section via its `assessmentState`. */
export function validateSection(section, key, options) {
  const { label, familyId, repositoryRoot, contracts, now } = options;
  const errors = [];
  const state = section?.assessmentState;
  const rank = rankOf(state);
  if (rank < 0) return errors;
  const where = `${label}: ${key}`;

  if (rank >= ASSESSMENT_STATE_RANK.SOURCE_BOUND) {
    if (bindingCount(section.sourceBindings) === 0) {
      errors.push(`${where} assessmentState ${state} requires non-empty sourceBindings`);
    }
    errors.push(...validateSourceBindings(section.sourceBindings, { label: where, repositoryRoot }));
  }
  if (isNonEmptyArray(section.evidenceIds)) {
    const resolved = resolveEvidenceIds(section.evidenceIds, {
      label: where,
      familyId,
      repositoryRoot,
      contracts,
      now,
    });
    errors.push(...resolved.errors);
  }
  return errors;
}

/**
 * `maximumClaim` may never exceed the strongest state actually reached by the family's own
 * cells and sections.
 */
export function validateMaximumClaim(family, { label }) {
  const errors = [];
  const claimRank = MAXIMUM_CLAIM_RANK[family.maximumClaim];
  if (claimRank === undefined) return errors;
  let reached = ASSESSMENT_STATE_RANK.UNKNOWN;
  for (const cell of family.themeControls ?? []) {
    reached = Math.max(reached, Math.max(rankOf(cell?.verificationState), 0));
  }
  for (const key of FAMILY_SECTION_KEYS) {
    reached = Math.max(reached, Math.max(rankOf(family[key]?.assessmentState), 0));
  }
  const reachedState = Object.keys(ASSESSMENT_STATE_RANK).find(
    (state) => ASSESSMENT_STATE_RANK[state] === reached,
  );
  const ceiling = MAXIMUM_CLAIM_BY_ASSESSMENT_STATE[reachedState];
  if (claimRank > MAXIMUM_CLAIM_RANK[ceiling]) {
    errors.push(
      `${label}: maximumClaim ${family.maximumClaim} exceeds the strongest state its cells and sections reach (${reachedState} allows at most ${ceiling})`,
    );
  }
  return errors;
}

// ---------------------------------------------------------------------------
// Reverse source -> inventory correspondence
// ---------------------------------------------------------------------------

const PARENT_BARREL_IMPORT = /(?:from|import)\s*\(?\s*['"]\.\.(?:\/index)?['"]/;
const COMPONENT_SHAPED_NAME = '[A-Z][A-Za-z0-9]*[a-z][A-Za-z0-9]*';
/**
 * A LOCAL component declaration. `export { ModernModal as default } from '...'` is a
 * re-export and deliberately does not match: forwarding is not implementing.
 */
const LOCAL_COMPONENT_DECLARATION = new RegExp(
  `(^|[;}\\s])(?:export\\s+)?(?:default\\s+)?(?:async\\s+)?(?:function|class|const|let|var)\\s+${COMPONENT_SHAPED_NAME}\\b`,
  'm',
);

function readModuleSource(absolute) {
  return readFileSync(absolute, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^[ \t]*\/\/.*$/gm, '');
}

function indexFileOf(repositoryRoot, relative) {
  for (const name of ['index.ts', 'index.tsx']) {
    const absolute = join(repositoryRoot, relative, name);
    if (existsSync(absolute)) return absolute;
  }
  return null;
}

/**
 * A canonical family is a COMPONENT family: every inventory row names component symbols. A
 * directory that exports only constants, hooks or helper functions is a support unit, not an
 * unclaimed family.
 */
function exportsComponentShapedSymbol(repositoryRoot, relative, depth = 0) {
  const absolute = indexFileOf(repositoryRoot, relative);
  if (!absolute) return false;
  const source = readModuleSource(absolute)
    .replace(/export\s+type\s*\{[^}]*\}[^;\n]*;?/g, '')
    .replace(/export\s+type\s+[A-Za-z][^;]*;/g, '');
  const declaration = new RegExp(
    `export\\s+(?:default\\s+)?(?:async\\s+)?(?:function|const|class)\\s+${COMPONENT_SHAPED_NAME}\\b`,
  );
  if (declaration.test(source)) return true;
  const componentShaped = new RegExp(`^${COMPONENT_SHAPED_NAME}$`);
  for (const match of source.matchAll(/export\s*\{([^}]*)\}/g)) {
    for (const part of match[1].split(',')) {
      const trimmed = part.trim();
      if (trimmed.length === 0) continue;
      const [local, alias] = trimmed.split(/\s+as\s+/).map((entry) => entry.trim());
      if (componentShaped.test(alias || local)) return true;
    }
  }
  if (depth < 2) {
    for (const match of source.matchAll(/export\s*\*\s*from\s*['"]\.\/([^'"]+)['"]/g)) {
      const child = `${relative}/${match[1].replace(/\/index$/, '')}`;
      if (exportsComponentShapedSymbol(repositoryRoot, child, depth + 1)) return true;
    }
  }
  return false;
}

/**
 * Collects every authored production entrypoint in a subtree. CLAUDE.md: "Every authored
 * production unit uses `folder/index.ts` or `folder/index.tsx`; free-standing leaf modules are
 * forbidden", and stories/tests/fixtures are classified exceptions. Scanning index modules is
 * therefore how the tree itself says where implementation lives — no filename allowlist.
 */
function indexModulesBelow(repositoryRoot, relative, collected = []) {
  let entries;
  try {
    entries = readdirSync(join(repositoryRoot, relative), { withFileTypes: true });
  } catch {
    return collected;
  }
  for (const name of ['index.ts', 'index.tsx']) {
    const absolute = join(repositoryRoot, relative, name);
    if (existsSync(absolute)) collected.push(absolute);
  }
  for (const entry of entries) {
    if (entry.isDirectory()) indexModulesBelow(repositoryRoot, `${relative}/${entry.name}`, collected);
  }
  return collected;
}

/**
 * A family owner IMPLEMENTS something; a compatibility surface only forwards. A directory that
 * keeps the shape of a family — `engines/`, `compound/`, `contracts/`, `tests/` — while every
 * one of its production entrypoints merely re-exports somebody else's component is a retained
 * import path, not a 253rd family. This is what separates a 9-line forwarding engine from a
 * 597-line implementation without naming either of them.
 */
function declaresOwnImplementation(repositoryRoot, relative) {
  return indexModulesBelow(repositoryRoot, relative).some((absolute) =>
    LOCAL_COMPONENT_DECLARATION.test(readModuleSource(absolute)),
  );
}

/**
 * Enumerates real family-shaped source directories and proves each one is claimed by exactly
 * one inventory row. This is NOT a second inventory: the canonical roots and the family-level
 * depth pattern are derived from family-inventory.json itself.
 *
 * A directory is family-shaped when all of the following hold:
 *  1. it lies under a canonical root (`rows[].sourceRoot`, with nested roots collapsed);
 *  2. no claimed `sourceOwner` is a strict ancestor of it — an internal owner such as
 *     `Flex/contracts` belongs to its family rather than sitting beside it;
 *  3. it carries `index.ts` or `index.tsx`;
 *  4. its parent is a FAMILY LEVEL — the parent of at least one `resolvedBy: "folder-slug"`
 *     owner. A `component-symbol` row resolves to a containing folder by fallback, so it does
 *     not evidence a family level;
 *  5. it exports at least one component-shaped symbol;
 *  6. it does not import from its own parent barrel — CLAUDE.md: "A dependent owner must not
 *     sit beside its dependency as an architectural peer", so a consumer of a level is not a
 *     member of it; and
 *  7. it declares an implementation of its own. A directory whose production entrypoints only
 *     re-export somebody else's component is a compatibility surface preserving a historical
 *     import path, not an independently implementable family.
 *
 * A family-shaped directory passes only when it is claimed by exactly one row, or when it is a
 * strict ancestor of a claimed owner (a grouping node that CONTAINS families). Every clause is
 * structural; there is no path allowlist, because an allowlist would let a new family hide.
 */
export function checkSourceInventoryCorrespondence({ repositoryRoot, inventory }) {
  const errors = [];
  const rows = inventory?.rows ?? [];
  if (rows.length === 0) return errors;

  const roots = [...new Set(rows.map((row) => row.sourceRoot).filter(isNonEmptyString))]
    .filter((root, _index, all) => !all.some((other) => other !== root && root.startsWith(`${other}/`)))
    .sort();

  const claimedBy = new Map();
  for (const row of rows) {
    if (!isNonEmptyString(row.sourceOwner)) continue;
    if (!claimedBy.has(row.sourceOwner)) claimedBy.set(row.sourceOwner, []);
    claimedBy.get(row.sourceOwner).push(row.id);
  }
  const owners = [...claimedBy.keys()];
  const familyLevels = new Set(
    rows
      .filter((row) => row.resolvedBy === 'folder-slug' && isNonEmptyString(row.sourceOwner))
      .map((row) => row.sourceOwner.slice(0, row.sourceOwner.lastIndexOf('/'))),
  );

  const isInternalToClaim = (relative) => owners.some((owner) => relative.startsWith(`${owner}/`));
  const containsClaim = (relative) => owners.some((owner) => owner.startsWith(`${relative}/`));

  const candidates = [];
  const visit = (relative) => {
    let entries;
    try {
      entries = readdirSync(join(repositoryRoot, relative), { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const child = `${relative}/${entry.name}`;
      if (isInternalToClaim(child)) continue;
      const index = indexFileOf(repositoryRoot, child);
      if (
        index &&
        familyLevels.has(child.slice(0, child.lastIndexOf('/'))) &&
        exportsComponentShapedSymbol(repositoryRoot, child) &&
        !PARENT_BARREL_IMPORT.test(readModuleSource(index)) &&
        declaresOwnImplementation(repositoryRoot, child)
      ) {
        candidates.push(child);
      }
      visit(child);
    }
  };
  for (const root of roots) visit(root);

  for (const candidate of candidates.sort()) {
    if (containsClaim(candidate)) continue;
    if ((claimedBy.get(candidate) ?? []).length === 0) {
      errors.push(`source family directory is claimed by no family-inventory.json row: ${candidate}`);
    }
  }
  for (const [owner] of claimedBy) {
    const slugClaims = rows.filter(
      (row) => row.sourceOwner === owner && row.resolvedBy === 'folder-slug',
    );
    if (slugClaims.length > 1) {
      errors.push(
        `source family directory ${owner} is claimed by more than one folder-slug row: ${slugClaims.map((row) => row.id).join(', ')}`,
      );
    }
  }
  return errors;
}
