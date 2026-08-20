/**
 * kimi-worklist drills, grouped for CI (Codex final remediation blockers 2+4).
 * Named-cause assertions: each drill's detected violation must match ITS
 * message — with a temporarily red base, count>0 would certify nothing.
 * Hermetic in-memory injection; the tree is never mutated.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  CONSUMER_EVIDENCE_COMMIT_PIN,
  canonicalRowsSha256,
  resolveRepoRoots,
  validateWorklistAuthority,
} from './index.mjs';
import { packageRoot as findPackageRoot, repoRoot as findRepoRoot } from '../../lib/repo-root/index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const SCRIPT = join(HERE, 'index.mjs');
const run = (name) => spawnSync('node', [SCRIPT, `--drill=${name}`], { encoding: 'utf8' });

const CORE_ROOT = findPackageRoot(HERE);
const WORKLIST = join(CORE_ROOT, 'KIMI-VISUAL-WORKLIST.json');
const UPSTREAM = join(CORE_ROOT, 'src/foundation/tokens/premium-dead-adjudication.json');
const WORKFLOW = resolve(CORE_ROOT, '../../.github/workflows/ci.yml');
const SIBLING_APP_BITHIRE = resolve(CORE_ROOT, '../../..', 'app-bithire');

const loadDoc = () => JSON.parse(readFileSync(WORKLIST, 'utf8'));
const loadUpstream = () => JSON.parse(readFileSync(UPSTREAM, 'utf8'));
/** Deep clone so every mutation is hermetic; the tree is never written. */
const mutated = (mutate) => {
  const doc = structuredClone(loadDoc());
  mutate(doc);
  return doc;
};
const red = (doc, options) => validateWorklistAuthority(doc, options);
const matches = (failures, re) => failures.some((failure) => re.test(failure));

const CASES = [
  ['unshipped-owner', /TOMBSTONE|shipping-reachable/],
  ['rule-only-proof', /una regla CSS no es un part|RENDERED_NODE sin renderProof\.tsx/],
  ['tombstone-row', /TOMBSTONE/],
  ['nonexistent-path', /NO EXISTE/],
  ['missing-selector', /NO aparece/],
  ['prose-instead-of-structure', /PROSA|estructura gobernada/],
  ['wrong-repository', /fuera de allowlist/],
  ['stale-commit-or-digest', /RANCIA|fileDigest/],
  ['stale-commit', /commit.*HEAD|commit\/path NO EXISTE/],
  ['invalid-consumer-kind', /consumerKind fuera de vocabulario/],
  ['mismatched-family', /no corresponde a la familia/],
];

for (const [name, causeRe] of CASES) {
  test(`drill "${name}" red por su causa nombrada`, () => {
    const r = run(name);
    assert.equal(r.status, 0, `drill runner falló: ${r.stderr}`);
    assert.match(r.stdout + r.stderr, causeRe, `la violación detectada no es la causa del drill: ${(r.stdout + r.stderr).slice(0, 300)}`);
  });
}

test('meta: un drill no-op FALLA (el runner no puede ser vacuo)', () => {
  const r = run('bogus-no-op');
  assert.equal(r.status, 1);
  assert.match(r.stderr, /DRILL FAIL/);
});

/* ------------------------------------------------------------------------- *
 * Authority / provenance. The worklist is a DERIVED document: it names its
 * upstream, its consumer-evidence pin and its row identity, and this suite
 * proves each claim is falsifiable rather than decorative.
 * ------------------------------------------------------------------------- */

test('el documento vivo pasa su propia validación de autoridad', () => {
  assert.deepEqual(red(loadDoc()), []);
});

test('metadata: autoridad, provenance histórica y clases de rol declaradas', () => {
  const doc = loadDoc();
  // The false claim is gone and cannot come back unnoticed.
  assert.equal('sourceOfTruth' in doc, false);
  assert.equal(doc.authority.worklistAuthority.source, 'src/foundation/tokens/premium-dead-adjudication.json');
  assert.equal(doc.authority.worklistAuthority.sourceKind, 'tracked');
  assert.equal(doc.authority.worklistAuthority.role, 'BINDING_DISPOSITION_UPSTREAM');
  assert.equal(doc.authority.consumerEvidenceAuthority.repository, 'app-bithire');
  assert.equal(doc.authority.consumerEvidenceAuthority.commit, CONSUMER_EVIDENCE_COMMIT_PIN);
  assert.equal(doc.authority.consumerEvidenceAuthority.checkoutRootEnv, 'APP_BITHIRE_ROOT');
  assert.equal(doc.authority.consumerEvidenceAuthority.role, 'CURRENT_CONSUMER_EVIDENCE_AUTHORITY');
  assert.equal(doc.authority.rows.role, 'ROW_IDENTITY');
  // The two unretained scratchpad inputs are HISTORY, never authority.
  assert.equal(doc.historicalProvenance.role, 'HISTORICAL_UNRETAINED_NON_AUTHORITY');
  assert.deepEqual(doc.historicalProvenance.missingInputs.map((i) => i.path).sort(), [
    'scratchpad/premium-chains.json',
    'scratchpad/premium-traceability.json',
  ]);
  for (const input of doc.historicalProvenance.missingInputs) assert.equal(input.status, 'UNRETAINED');
  // The old measurement stays attributable without becoming the live pin.
  assert.equal(doc.historicalProvenance.historicalMeasurementCommit.commit, 'bd1142d3a5895eb24a21c64f43849bedb24999c0');
  assert.equal(doc.historicalProvenance.historicalMeasurementCommit.status, 'SUPERSEDED');
  assert.notEqual(doc.historicalProvenance.historicalMeasurementCommit.commit, CONSUMER_EVIDENCE_COMMIT_PIN);
  // measuredBy is preserved; measuredAgainst is the FULL pin.
  const cac = doc.renderVerification.consumerAppliedClass;
  assert.match(cac.measuredBy, /team-lead/);
  assert.equal(cac.measuredAgainst, `full app-bithire @ ${CONSUMER_EVIDENCE_COMMIT_PIN}`);
});

test('counts: 139 + 80 = 219, y los totales del documento son medidos, no declarados', () => {
  const doc = loadDoc();
  assert.equal(doc.A_pendingPartBlocked.length, 139);
  assert.equal(doc.B_deliberateDelta.length, 80);
  assert.equal(doc.A_pendingPartBlocked.length + doc.B_deliberateDelta.length, 219);
  assert.equal(doc.totals.A_pendingPartBlocked, 139);
  assert.equal(doc.totals.B_deliberateDelta, 80);
  assert.equal(doc.totals.total, 219);
  assert.equal(doc.authority.rows.rowCount, 219);
});

test('tokens: las 219 filas son 219 identidades distintas', () => {
  const doc = loadDoc();
  const tokens = [...doc.A_pendingPartBlocked, ...doc.B_deliberateDelta].map((r) => r.token);
  assert.equal(tokens.length, 219);
  assert.equal(new Set(tokens).size, 219);
  for (const token of tokens) assert.match(token, /^--ds-/);
});

test('hash: el digest registrado es el que las filas vivas producen', () => {
  const doc = loadDoc();
  assert.equal(doc.authority.rows.canonicalRowsSha256, canonicalRowsSha256(doc));
  assert.match(doc.authority.rows.canonicalRowsSha256, /^[a-f0-9]{64}$/);
  // The registered algorithm is stated, not implied.
  assert.match(doc.authority.rows.algorithm, /sorts every OBJECT's keys/);
  assert.match(doc.authority.rows.algorithm, /PRESERVES array order/);
});

test('hash: el digest cubre las filas y NO la metadata que lo rodea', () => {
  // Editing metadata must not move the ROW identity -- otherwise the digest
  // could not distinguish "the rows changed" from "a comment changed".
  const doc = mutated((d) => { d.generatedBy = 'something else entirely'; });
  assert.equal(canonicalRowsSha256(doc), loadDoc().authority.rows.canonicalRowsSha256);
});

test('mutación de CAMPO es roja aunque se forjen todos los totales', () => {
  const doc = mutated((d) => {
    d.A_pendingPartBlocked[0].proposedSlot = 'forged slot value';
    // Every self-referential number forged to stay consistent.
    d.totals.A_pendingPartBlocked = d.A_pendingPartBlocked.length;
    d.totals.total = d.A_pendingPartBlocked.length + d.B_deliberateDelta.length;
    d.authority.rows.rowCount = d.totals.total;
  });
  const failures = red(doc);
  assert.ok(matches(failures, /canonicalRowsSha256/), `esperaba deriva de digest: ${failures.join(' | ')}`);
});

test('SWAP de dos filas es rojo: el orden es parte de la identidad', () => {
  const doc = mutated((d) => {
    const [first, second] = [d.A_pendingPartBlocked[0], d.A_pendingPartBlocked[1]];
    d.A_pendingPartBlocked[0] = second;
    d.A_pendingPartBlocked[1] = first;
  });
  // Counts, totals and token set are all IDENTICAL -- only order moved.
  assert.equal(doc.A_pendingPartBlocked.length, 139);
  assert.equal(doc.totals.total, 219);
  const failures = red(doc);
  assert.ok(matches(failures, /canonicalRowsSha256/), `un swap debe re-firmar el digest: ${failures.join(' | ')}`);
});

test('DELETE de una fila es rojo aunque se forjen totales y rowCount', () => {
  const doc = mutated((d) => {
    d.A_pendingPartBlocked.splice(5, 1);
    d.totals.A_pendingPartBlocked = d.A_pendingPartBlocked.length;
    d.totals.total = d.A_pendingPartBlocked.length + d.B_deliberateDelta.length;
    d.authority.rows.rowCount = d.totals.total;
  });
  const failures = red(doc);
  // Forging every internal number does not help: the absolute counts are pinned
  // in the gate and the digest is recomputed from the rows themselves.
  assert.ok(matches(failures, /A_pendingPartBlocked: 138 filas ≠ 139/), failures.join(' | '));
  assert.ok(matches(failures, /filas totales: 218 ≠ 219/), failures.join(' | '));
  assert.ok(matches(failures, /canonicalRowsSha256/), failures.join(' | '));
});

test('token duplicado es rojo aunque el conteo siga siendo 219', () => {
  const doc = mutated((d) => {
    d.A_pendingPartBlocked[1].token = d.A_pendingPartBlocked[0].token;
    d.authority.rows.canonicalRowsSha256 = canonicalRowsSha256(d);
  });
  assert.equal(doc.A_pendingPartBlocked.length, 139);
  const failures = red(doc);
  assert.ok(matches(failures, /token duplicado/), failures.join(' | '));
});

test('deriva de commit de evidencia: una fila que se mueve de commit es roja', () => {
  const doc = mutated((d) => {
    const row = [...d.A_pendingPartBlocked, ...d.B_deliberateDelta]
      .find((r) => r.renderProof?.verdict === 'CONSUMER_APPLIED');
    const evs = Array.isArray(row.renderProof.consumerEvidence)
      ? row.renderProof.consumerEvidence
      : [row.renderProof.consumerEvidence];
    evs[0].commit = '1111111111111111111111111111111111111111';
    d.authority.rows.canonicalRowsSha256 = canonicalRowsSha256(d);
  });
  assert.ok(matches(red(doc), /deriva respecto de la autoridad de evidencia/), red(doc).join(' | '));
});

test('deriva de commit declarado: el documento no puede reescribir el pin del gate', () => {
  const doc = mutated((d) => { d.authority.consumerEvidenceAuthority.commit = '2e844fd58638987d4a20cb752b2e6e68b63a0a05'; });
  // The pin is an INDEPENDENT constant, so moving the document's own claim is
  // caught rather than followed.
  assert.ok(matches(red(doc), /pin independiente del gate/), red(doc).join(' | '));
});

test('lo histórico no puede ascender a autoridad', () => {
  // (a) the retired `sourceOfTruth` key coming back
  assert.ok(matches(red(mutated((d) => { d.sourceOfTruth = { adjudication: 'whatever' }; })), /sourceOfTruth/));
  // (b) the historical role relabelled as something authoritative
  assert.ok(matches(red(mutated((d) => { d.historicalProvenance.role = 'BINDING_DISPOSITION_UPSTREAM'; })), /HISTORICAL_UNRETAINED_NON_AUTHORITY/));
  // (c) the superseded measurement promoted to the live pin
  assert.ok(matches(
    red(mutated((d) => { d.historicalProvenance.historicalMeasurementCommit.commit = CONSUMER_EVIDENCE_COMMIT_PIN; })),
    /NO puede ser el pin vivo/,
  ));
  // (d) an "unretained" input that actually exists is a lie in the other
  //     direction: re-readable means it could have been authority.
  assert.ok(matches(
    red(mutated((d) => { d.historicalProvenance.missingInputs[0].path = 'src/foundation/tokens/premium-dead-adjudication.json'; })),
    /declarado UNRETAINED pero EXISTE/,
  ));
  // (e) measuredAgainst reverting to the historical commit
  assert.ok(matches(
    red(mutated((d) => { d.renderVerification.consumerAppliedClass.measuredAgainst = 'app-bithire @ bd1142d3a5895eb24a21c64f43849bedb24999c0'; })),
    /commit histórico como si fuera el vivo/,
  ));
  // (f) measuredBy dropped — who measured is attributable history
  assert.ok(matches(
    red(mutated((d) => { delete d.renderVerification.consumerAppliedClass.measuredBy; })),
    /measuredBy/,
  ));
});

test('schema cerrado: sobra o falta una clave y la autoridad es roja', () => {
  assert.ok(matches(red(mutated((d) => { d.authority.rows.extraKey = 1; })), /authority\.rows: schema no cerrado/));
  assert.ok(matches(red(mutated((d) => { delete d.authority.worklistAuthority.role; })), /authority\.worklistAuthority: schema no cerrado/));
  assert.ok(matches(red(mutated((d) => { delete d.historicalProvenance.missingInputs[0].note; })), /missingInputs\[.*\]: schema no cerrado/));
  assert.ok(matches(red(mutated((d) => { delete d.authority; })), /authority: schema no cerrado|authority: debe ser un objeto/));
});

test('upstream declarado inexistente es rojo (una autoridad irreleíble no es autoridad)', () => {
  const failures = red(loadDoc(), { upstreamExists: () => false });
  assert.ok(matches(failures, /el upstream declarado NO existe/), failures.join(' | '));
});

test('upstream vinculante: A y B son exactamente las dos disposiciones gobernadas', () => {
  const doc = loadDoc();
  const upstream = loadUpstream();
  const tokensFor = (decision) => Object.entries(upstream.entries)
    .filter(([, entry]) => entry.decision === decision)
    .map(([token]) => token)
    .sort();
  assert.deepEqual(doc.A_pendingPartBlocked.map(({ token }) => token).sort(), tokensFor('PENDING_PART_BLOCKED'));
  assert.deepEqual(doc.B_deliberateDelta.map(({ token }) => token).sort(), tokensFor('DELIBERATE_DELTA_PENDING_OWNER'));
  assert.deepEqual(red(doc), []);
});

test('upstream vinculante: cambiar A -> B enrojece ambos conjuntos sin tocar el worklist', () => {
  const upstream = loadUpstream();
  const token = loadDoc().A_pendingPartBlocked[0].token;
  upstream.entries[token].decision = 'DELIBERATE_DELTA_PENDING_OWNER';
  const failures = red(loadDoc(), { loadUpstream: () => upstream });
  assert.ok(matches(failures, /A_pendingPartBlocked:.*contradicen/), failures.join(' | '));
  assert.ok(matches(failures, /B_deliberateDelta:.*faltan/), failures.join(' | '));
});

test('upstream vinculante: borrar o agregar una adjudicación relevante es rojo', () => {
  const deleted = loadUpstream();
  delete deleted.entries[loadDoc().A_pendingPartBlocked[0].token];
  assert.ok(matches(
    red(loadDoc(), { loadUpstream: () => deleted }),
    /A_pendingPartBlocked:.*contradicen/,
  ));

  const added = loadUpstream();
  added.entries['--ds-kimi-synthetic-pending-part'] = { decision: 'PENDING_PART_BLOCKED' };
  assert.ok(matches(
    red(loadDoc(), { loadUpstream: () => added }),
    /A_pendingPartBlocked:.*faltan.*--ds-kimi-synthetic-pending-part/,
  ));
});

test('upstream vinculante: re-firmar A con una disposición de otro bucket sigue rojo', () => {
  const upstream = loadUpstream();
  const propertyBlocked = Object.entries(upstream.entries)
    .find(([, entry]) => entry.decision === 'PENDING_PROPERTY_BLOCKED')?.[0];
  assert.ok(propertyBlocked, 'fixture upstream debe conservar el caso PENDING_PROPERTY_BLOCKED');
  const doc = mutated((candidate) => {
    candidate.A_pendingPartBlocked[0].token = propertyBlocked;
    candidate.authority.rows.canonicalRowsSha256 = canonicalRowsSha256(candidate);
  });
  const failures = red(doc, { loadUpstream: () => upstream });
  assert.ok(matches(failures, /A_pendingPartBlocked:.*contradicen.*PENDING_PROPERTY_BLOCKED|A_pendingPartBlocked:.*contradicen/), failures.join(' | '));
  assert.ok(matches(failures, /A_pendingPartBlocked:.*faltan/), failures.join(' | '));
});

test('sourceKind tracked es una afirmación ejecutable, no metadata decorativa', () => {
  const failures = red(loadDoc(), { upstreamTracked: () => false });
  assert.ok(matches(failures, /no está tracked en Git/), failures.join(' | '));
});

test('upstream vinculante: JSON null o primitivo no puede apagar la validación', () => {
  for (const upstream of [null, 'not-an-object', 7]) {
    const failures = red(loadDoc(), { loadUpstream: () => upstream });
    assert.ok(matches(failures, /documento upstream debe ser un objeto JSON no nulo/), failures.join(' | '));
  }
});

/* ------------------------------------------------------------------------- *
 * APP_BITHIRE_ROOT resolver. Absence is the ONLY fallback; a present-but-broken
 * value must fail loudly, because resolving against a different tree than the
 * one requested is the fail-open this gate exists to prevent.
 * ------------------------------------------------------------------------- */

test('env AUSENTE: cae al sibling local', () => {
  const roots = resolveRepoRoots({});
  assert.equal(roots.get('app-bithire'), SIBLING_APP_BITHIRE);
});

test('env ausente por own-key, no por falsy: `undefined` explícito NO es ausencia', () => {
  // `{APP_BITHIRE_ROOT: undefined}` HAS the key. Truthiness would call it absent
  // and silently fall back; own-key does not.
  assert.throws(() => resolveRepoRoots({ APP_BITHIRE_ROOT: undefined }), /no es string/);
});

test('env EXPLÍCITO y válido gana al decoy sibling', () => {
  // A real git checkout that is NOT the sibling. If the resolver ignored the
  // explicit value it would silently verify the wrong tree.
  const explicit = findRepoRoot(HERE);
  const roots = resolveRepoRoots({ APP_BITHIRE_ROOT: explicit });
  assert.equal(roots.get('app-bithire'), explicit);
  assert.notEqual(roots.get('app-bithire'), SIBLING_APP_BITHIRE);
});

test('el resolver mueve SOLO app-bithire; los demás repos quedan intactos', () => {
  const base = resolveRepoRoots({});
  const moved = resolveRepoRoots({ APP_BITHIRE_ROOT: findRepoRoot(HERE) });
  assert.notEqual(moved.get('app-bithire'), base.get('app-bithire'));
  for (const repo of ['app-evnto', 'app-platform', 'showroom']) {
    assert.equal(moved.get(repo), base.get(repo), `${repo} no debe moverse`);
  }
  assert.deepEqual([...moved.keys()].sort(), [...base.keys()].sort());
});

test('env presente pero inutilizable: rojo con causa y JAMÁS fallback', () => {
  const tempDir = mkdtempSync(join(tmpdir(), 'kimi-gate-'));
  const tempFile = join(tempDir, 'not-a-directory');
  writeFileSync(tempFile, 'x');
  const cases = [
    ['vacío', '', /vacío o sólo espacios/],
    ['sólo espacios', '   \t  ', /vacío o sólo espacios/],
    ['relativo', '../app-bithire', /no es absoluto/],
    ['inexistente', join(tempDir, 'nope', 'still-nope'), /no existe/],
    ['un fichero', tempFile, /no es un directorio/],
    ['no es checkout de Git', tempDir, /no es un checkout de Git/],
  ];
  for (const [label, value, causeRe] of cases) {
    assert.throws(
      () => resolveRepoRoots({ APP_BITHIRE_ROOT: value }),
      (error) => {
        assert.match(error.message, causeRe, `${label}: causa equivocada`);
        assert.match(error.message, /NO cae al sibling local/, `${label}: debe declarar que no hace fallback`);
        return true;
      },
      `${label}: debía lanzar`,
    );
  }
});

/* ------------------------------------------------------------------------- *
 * The CI workflow pin. The gate constant and the workflow must name the same
 * commit; a bump that touches one and not the other is exactly the drift this
 * pair of assertions exists to catch.
 * ------------------------------------------------------------------------- */

test('workflow: exactamente 2 pins nuevos y 0 viejos', () => {
  const yaml = readFileSync(WORKFLOW, 'utf8');
  const count = (needle) => yaml.split(needle).length - 1;
  assert.equal(count(CONSUMER_EVIDENCE_COMMIT_PIN), 2, 'el checkout ref y el echo deben citar el pin');
  assert.equal(count('2e844fd58638987d4a20cb752b2e6e68b63a0a05'), 0, 'no puede sobrevivir ninguna ocurrencia del pin viejo');
  assert.match(yaml, new RegExp(`ref: ${CONSUMER_EVIDENCE_COMMIT_PIN}`));
  assert.match(yaml, new RegExp(`app-bithire corpus ref: ${CONSUMER_EVIDENCE_COMMIT_PIN}`));
});

test('workflow y documento citan el MISMO commit que el pin del gate', () => {
  const doc = loadDoc();
  const yaml = readFileSync(WORKFLOW, 'utf8');
  assert.equal(doc.authority.consumerEvidenceAuthority.commit, CONSUMER_EVIDENCE_COMMIT_PIN);
  assert.ok(yaml.includes(CONSUMER_EVIDENCE_COMMIT_PIN));
});
