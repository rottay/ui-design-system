#!/usr/bin/env node
/**
 * kimi-worklist-gate — the binding worklist may never point Kimi at CSS that
 * does not ship (Codex blocker 2, 2026-08-02).
 *
 * Property protected: every row's cssOwner/shippingOwner is REACHABLE from the
 * shipped facade entrypoints (same @import walk as css-layer-paint-gate — one
 * walker, not two), no row field names the tombstone, and renderProof is a
 * NODE, never just a CSS rule: RENDERED_NODE rows must cite an existing TSX
 * file that actually contains the part. `renderProof.tsx` is legitimately null
 * for NO_NODE (no surface exists) and NO_DEDICATED_PART (fallback-arm reach) —
 * a blanket non-null assertion would go red on rows that are correct.
 * The tombstone check is scoped to ROW fields: the reachability metadata and
 * the MD narrative legitimately name the file as their own audit trail.
 *
 * AUTHORITY (2026-08-13). The worklist is a DERIVED document and says so. Its
 * former `sourceOfTruth` key claimed an authority it does not hold and named two
 * scratchpad inputs that were never retained. The metadata now separates three
 * different things, and this gate validates all three BEFORE any drill is
 * injected, so a drill can never be what makes the authority look checked:
 *
 *   worklistAuthority         the binding disposition upstream, a TRACKED file
 *   consumerEvidenceAuthority the app-bithire commit every CONSUMER_APPLIED row
 *                             resolves against
 *   rows                      content identity of the 139 + 80 = 219 rows
 *
 * The consumer-evidence commit is pinned HERE as an independent constant. The
 * document does not get to tell the gate which commit is authoritative; the two
 * must agree, and disagreement in either direction is red.
 *
 * --check          exit 1 on any violation
 * --drill=<case>   self-inject: unshipped-owner | rule-only-proof | tombstone-row
 */
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { collectReachable } from '../../css-layer-paint-gate.mjs';
import { packageRoot as findPackageRoot, repoRoot as findRepoRoot } from '../../lib/repo-root/index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = findPackageRoot(HERE);
const WORKLIST = join(ROOT, 'KIMI-VISUAL-WORKLIST.json');
const CSS_ROOT = join(ROOT, 'src/foundation/tokens/css');
const ENTRY_DIR = join(CSS_ROOT, 'facade/entrypoints');
const TOMBSTONE = 'patterns-paint.css';
const VERDICTS = new Set(['RENDERED_NODE', 'NO_DEDICATED_PART', 'NO_NODE', 'CONSUMER_APPLIED']);

const args = process.argv.slice(2);
const drillArg = args.find((a) => a.startsWith('--drill'));
const drill = drillArg?.includes('=') ? drillArg.split('=')[1] : undefined;

function reachableSet() {
  const seen = new Set();
  for (const name of ['base.css', 'styles.css']) {
    const entry = join(ENTRY_DIR, name);
    if (existsSync(entry)) collectReachable(entry, CSS_ROOT, seen);
  }
  // Positive control: the walker must clear a known shipper and refuse the
  // known orphan, or every zero below is untrustworthy.
  const tails = new Set(
    [...seen]
      .map((p) => relTail(p.replaceAll('\\', '/')))
      .filter(Boolean)
  );
  const shipperOk = tails.has('presentation/components/patterns.css');
  const orphanOut = ![...tails].some((t) => t.endsWith(TOMBSTONE));
  if (!shipperOk || !orphanOut) {
    throw new Error(`walker positive control FAILED (shipper=${shipperOk}, orphanExcluded=${orphanOut})`);
  }
  return tails;
}

/** Real PATH fields only — `proposedSlot` is prose and is checked solely for
 * tombstone mentions. Paths may carry a `:line` suffix. */
function rowCssPaths(row) {
  const out = [];
  for (const key of ['cssOwner', 'shippingOwner']) {
    if (typeof row[key] === 'string' && row[key].includes('.css')) out.push([key, row[key]]);
  }
  const rp = row.renderProof;
  if (rp && typeof rp.cssShippingOwner === 'string') out.push(['renderProof.cssShippingOwner', rp.cssShippingOwner]);
  return out;
}

function relTail(value) {
  const clean = value.replaceAll('\\', '/').replace(/:\d+(?:-\d+)?$/, '');
  const idx = clean.indexOf('foundation/tokens/css/');
  return idx >= 0 ? clean.slice(idx + 'foundation/tokens/css/'.length) : null;
}

const SIBLINGS_ROOT = resolve(findRepoRoot(HERE), '..');

/**
 * The app-bithire commit every CONSUMER_APPLIED row resolves against, pinned as
 * an INDEPENDENT constant. It is deliberately NOT read from the worklist: if the
 * document were the only place the pin lived, a row that moved the commit would
 * move the thing that judges it and the check would be circular.
 */
export const CONSUMER_EVIDENCE_COMMIT_PIN = '8abd05578d04cd3cf1c82ca8d777f0ca1ef6925f';
/** Superseded. Kept so a document that silently reverts to it is red. */
const HISTORICAL_MEASUREMENT_COMMIT = 'bd1142d3a5895eb24a21c64f43849bedb24999c0';
const APP_BITHIRE_ROOT_ENV = 'APP_BITHIRE_ROOT';
const WORKLIST_UPSTREAM = 'src/foundation/tokens/premium-dead-adjudication.json';

const siblingRoots = () => new Map([
  ['app-bithire', join(SIBLINGS_ROOT, 'app-bithire')],
  ['app-evnto', join(SIBLINGS_ROOT, 'app-evnto')],
  ['app-platform', join(SIBLINGS_ROOT, 'app-platform')],
  ['showroom', resolve(ROOT, '../showroom')],
]);

function isGitCheckout(path) {
  try {
    return String(git(path, ['rev-parse', '--show-toplevel'])).trim().length > 0;
  } catch {
    return false;
  }
}

/**
 * Resolve the repo allowlist, with app-bithire relocatable via APP_BITHIRE_ROOT.
 *
 * The env var is INJECTABLE (never read from the ambient process here) so the
 * suite can prove each branch without mutating the real environment.
 *
 * Absent  -> local sibling. That is the developer default and the only fallback.
 * Present -> the value must be usable, and if it is not, this THROWS with the
 *            cause. It never falls back: a CI job that sets the variable to
 *            something broken must fail loudly, because silently checking a
 *            different tree than the one requested is exactly the fail-open the
 *            Codex audit found. Presence is decided by own-key, not by
 *            truthiness, so an explicitly blank value is an error and not an
 *            absence.
 *
 * Only app-bithire is relocated. The other three roots are untouched.
 */
export function resolveRepoRoots(env = process.env) {
  const roots = siblingRoots();
  if (!Object.prototype.hasOwnProperty.call(env, APP_BITHIRE_ROOT_ENV)) return roots;

  const raw = env[APP_BITHIRE_ROOT_ENV];
  const fail = (why) => {
    throw new Error(`${APP_BITHIRE_ROOT_ENV} está presente pero es inutilizable (${why}) — el gate NO cae al sibling local: una raíz explícita rota debe fallar, no resolverse en silencio contra otro árbol`);
  };
  if (typeof raw !== 'string') fail(`no es string: ${typeof raw}`);
  const value = raw.trim();
  if (value.length === 0) fail('vacío o sólo espacios');
  if (!isAbsolute(value)) fail(`no es absoluto: ${value}`);
  if (!existsSync(value)) fail(`no existe: ${value}`);
  let stats;
  try {
    stats = statSync(value);
  } catch {
    fail(`no se puede stat: ${value}`);
  }
  if (!stats.isDirectory()) fail(`no es un directorio: ${value}`);
  if (!isGitCheckout(value)) fail(`no es un checkout de Git: ${value}`);

  roots.set('app-bithire', value);
  return roots;
}
const NON_PRODUCTIVE_RE = /(\/tests?\/|\.test\.|\.spec\.|\.stories\.|__fixtures__|__mocks__|\/e2e\/)/;
const EVIDENCE_KEYS = new Set(['repository', 'commit', 'path', 'selector', 'consumerKind', 'fileDigest']);
const CONSUMER_KINDS = new Set(['class-skin-consumer']);
const FULL_COMMIT_RE = /^[a-f0-9]{40}$/;

function sha16(buf) {
  return createHash('sha256').update(buf).digest('hex').slice(0, 16);
}

function git(base, args, encoding = 'utf8') {
  return execFileSync('git', ['-C', base, ...args], {
    encoding,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

/** Resolve evidence against committed bytes, never against a dirty sibling
 * worktree. A digest of WIP labelled with HEAD's commit is not reproducible in
 * CI, which was the final fail-open found during the Codex audit. */
function committedEvidence(base, commit, evidencePath) {
  if (typeof evidencePath !== 'string' || evidencePath.length === 0 || isAbsolute(evidencePath) || evidencePath.split(/[\\/]/).includes('..')) {
    return { failure: `consumerEvidence.path inválido o no relativo: ${String(evidencePath)}` };
  }
  if (!FULL_COMMIT_RE.test(String(commit))) {
    return { failure: `consumerEvidence.commit debe ser SHA completo de 40 hex: ${String(commit)}` };
  }
  try {
    const head = String(git(base, ['rev-parse', 'HEAD'])).trim();
    if (head !== commit) {
      return { failure: `evidencia RANCIA — commit ${commit} ≠ HEAD vivo ${head}` };
    }
    const repoRoot = String(git(base, ['rev-parse', '--show-toplevel'])).trim();
    const prefix = relative(repoRoot, base).replaceAll('\\', '/');
    const blobPath = prefix && prefix !== '.' ? `${prefix}/${evidencePath.replaceAll('\\', '/')}` : evidencePath.replaceAll('\\', '/');
    const blob = git(repoRoot, ['show', `${commit}:${blobPath}`], null);
    return { blob: Buffer.isBuffer(blob) ? blob : Buffer.from(blob), blobPath };
  } catch {
    return { failure: `commit/path NO EXISTE en Git: ${commit}:${evidencePath}` };
  }
}

/**
 * Governed CONSUMER_APPLIED evidence: every leg falsifiable, none simulated.
 *
 * `roots` is a PARAMETER, not a module-level Map closed over at import time. A
 * captured global cannot be relocated per-run, so a test could not prove the
 * APP_BITHIRE_ROOT branches without mutating the real process environment.
 */
export function checkConsumerEvidence(id, row, rp, roots = siblingRoots()) {
  const failures = [];
  const evs = Array.isArray(rp.consumerEvidence) ? rp.consumerEvidence : [rp.consumerEvidence];
  if (evs.length === 0 || evs.every((e) => e == null)) {
    return [`${id}: CONSUMER_APPLIED sin consumerEvidence`];
  }
  for (const ev of evs) {
    if (typeof ev !== 'object' || ev === null) {
      failures.push(`${id}: consumerEvidence es PROSA/string — la evidencia es estructura gobernada {repository, commit, path, selector, consumerKind, fileDigest}`);
      continue;
    }
    const extraneous = Object.keys(ev).filter((k) => !EVIDENCE_KEYS.has(k));
    const missing = [...EVIDENCE_KEYS].filter((k) => !(k in ev));
    if (extraneous.length || missing.length) {
      failures.push(`${id}: schema de evidencia no cerrado (faltan: ${missing.join(',') || '—'}; sobran: ${extraneous.join(',') || '—'})`);
      continue;
    }
    const base = roots.get(ev.repository);
    if (!base) {
      failures.push(`${id}: repositorio fuera de allowlist: ${ev.repository}`);
      continue;
    }
    if (!existsSync(base)) {
      failures.push(`${id}: checkout de ${ev.repository} AUSENTE — la garantía no se simula: el CI debe checkoutear el sibling (ya lo hace para app-ds-boundary)`);
      continue;
    }
    if (!CONSUMER_KINDS.has(ev.consumerKind)) {
      failures.push(`${id}: consumerKind fuera de vocabulario: ${String(ev.consumerKind)}`);
      continue;
    }
    if (NON_PRODUCTIVE_RE.test(`/${ev.path}`)) {
      failures.push(`${id}: consumerEvidence.path no es productivo (test/story/fixture): ${ev.path}`);
      continue;
    }
    const committed = committedEvidence(base, ev.commit, ev.path);
    if (committed.failure) {
      failures.push(`${id}: ${committed.failure}`);
      continue;
    }
    const buf = committed.blob;
    if (!buf.toString().includes(ev.selector)) {
      failures.push(`${id}: el selector "${ev.selector}" NO aparece en ${ev.repository}@${ev.commit}:${committed.blobPath}`);
      continue;
    }
    const family = (row.family ?? row.token ?? '').replace(/^--ds-/, '').split('-').slice(0, 2).join('-');
    if (family && !ev.selector.includes(family)) {
      failures.push(`${id}: selector "${ev.selector}" no corresponde a la familia de la fila (${family})`);
    }
    const live = sha16(buf);
    if (live !== ev.fileDigest) {
      failures.push(`${id}: evidencia RANCIA — fileDigest ${ev.fileDigest} ≠ blob ${live} en ${ev.commit} (re-verificar y re-firmar contra el commit actual)`);
    }
  }
  return failures;
}

/**
 * Canonical row identity. Object keys are sorted recursively; ARRAY ORDER IS
 * PRESERVED, so a row swap re-signs the digest exactly like a field edit does.
 * Only the two row arrays are covered -- surrounding metadata is deliberately
 * out of scope, so this digest measures row CONTENT and nothing else.
 */
export function canonicalRowsSha256(doc) {
  const canonical = (value) => {
    if (Array.isArray(value)) return value.map(canonical);
    if (value && typeof value === 'object') {
      const out = {};
      for (const key of Object.keys(value).sort()) out[key] = canonical(value[key]);
      return out;
    }
    return value;
  };
  const payload = canonical({
    A_pendingPartBlocked: doc.A_pendingPartBlocked ?? [],
    B_deliberateDelta: doc.B_deliberateDelta ?? [],
  });
  return createHash('sha256').update(JSON.stringify(payload), 'utf8').digest('hex');
}

const AUTHORITY_KEYS = new Set(['note', 'worklistAuthority', 'consumerEvidenceAuthority', 'rows']);
const WORKLIST_AUTHORITY_KEYS = new Set(['source', 'sourceKind', 'role', 'meaning']);
const CONSUMER_AUTHORITY_KEYS = new Set(['repository', 'commit', 'checkoutRootEnv', 'role', 'meaning']);
const ROWS_AUTHORITY_KEYS = new Set(['rowCount', 'canonicalRowsSha256', 'role', 'algorithm', 'meaning']);
const HISTORICAL_KEYS = new Set(['role', 'meaning', 'missingInputs', 'historicalMeasurementCommit']);
const MISSING_INPUT_KEYS = new Set(['path', 'phase', 'status', 'note']);
const HISTORICAL_COMMIT_KEYS = new Set(['repository', 'commit', 'status', 'note']);
const HISTORICAL_MISSING_INPUTS = ['scratchpad/premium-chains.json', 'scratchpad/premium-traceability.json'];

function closedSchema(failures, label, value, allowed) {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    failures.push(`${label}: debe ser un objeto`);
    return false;
  }
  const extraneous = Object.keys(value).filter((k) => !allowed.has(k));
  const missing = [...allowed].filter((k) => !(k in value));
  if (extraneous.length || missing.length) {
    failures.push(`${label}: schema no cerrado (faltan: ${missing.join(',') || '—'}; sobran: ${extraneous.join(',') || '—'})`);
    return false;
  }
  return true;
}

/**
 * Validate the worklist's own authority claims. Runs BEFORE any drill injection,
 * so the metadata is judged against the real document and a drill can never be
 * the reason the authority appears checked.
 *
 * The upstream readers are injectable so the suite can prove binding drift
 * without touching either governed JSON document.
 */
export function validateWorklistAuthority(doc, {
  pin = CONSUMER_EVIDENCE_COMMIT_PIN,
  upstreamExists = (relPath) => existsSync(join(ROOT, relPath)),
  loadUpstream = (relPath) => JSON.parse(readFileSync(join(ROOT, relPath), 'utf8')),
  upstreamTracked = (relPath) => {
    try {
      git(ROOT, ['ls-files', '--error-unmatch', relPath]);
      return true;
    } catch {
      return false;
    }
  },
} = {}) {
  const failures = [];
  let bindingUpstream;
  if ('sourceOfTruth' in doc) {
    failures.push('sourceOfTruth: la clave volvió — este documento es DERIVADO y no es fuente de verdad; la autoridad vive en `authority`');
  }
  if (!closedSchema(failures, 'authority', doc.authority, AUTHORITY_KEYS)) return failures;
  const authority = doc.authority;

  if (closedSchema(failures, 'authority.worklistAuthority', authority.worklistAuthority, WORKLIST_AUTHORITY_KEYS)) {
    const wa = authority.worklistAuthority;
    if (wa.source !== WORKLIST_UPSTREAM) {
      failures.push(`authority.worklistAuthority.source: ${String(wa.source)} ≠ ${WORKLIST_UPSTREAM}`);
    } else if (!upstreamExists(wa.source)) {
      failures.push(`authority.worklistAuthority.source: el upstream declarado NO existe (${wa.source}) — una autoridad que no se puede releer no es autoridad`);
    } else {
      if (!upstreamTracked(wa.source)) {
        failures.push(`authority.worklistAuthority.source: ${wa.source} no está tracked en Git — sourceKind=tracked sería una afirmación falsa`);
      }
      try {
        bindingUpstream = loadUpstream(wa.source);
      } catch (error) {
        failures.push(`authority.worklistAuthority.source: no se puede leer/parsear ${wa.source} (${error.message})`);
      }
    }
    if (wa.sourceKind !== 'tracked') failures.push(`authority.worklistAuthority.sourceKind: ${String(wa.sourceKind)} ≠ tracked`);
    if (wa.role !== 'BINDING_DISPOSITION_UPSTREAM') failures.push(`authority.worklistAuthority.role: ${String(wa.role)} ≠ BINDING_DISPOSITION_UPSTREAM`);
  }

  if (closedSchema(failures, 'authority.consumerEvidenceAuthority', authority.consumerEvidenceAuthority, CONSUMER_AUTHORITY_KEYS)) {
    const ca = authority.consumerEvidenceAuthority;
    if (ca.repository !== 'app-bithire') failures.push(`authority.consumerEvidenceAuthority.repository: ${String(ca.repository)} ≠ app-bithire`);
    if (ca.commit !== pin) {
      failures.push(`authority.consumerEvidenceAuthority.commit: ${String(ca.commit)} ≠ pin independiente del gate ${pin}`);
    }
    if (ca.checkoutRootEnv !== APP_BITHIRE_ROOT_ENV) failures.push(`authority.consumerEvidenceAuthority.checkoutRootEnv: ${String(ca.checkoutRootEnv)} ≠ ${APP_BITHIRE_ROOT_ENV}`);
    if (ca.role !== 'CURRENT_CONSUMER_EVIDENCE_AUTHORITY') failures.push(`authority.consumerEvidenceAuthority.role: ${String(ca.role)} ≠ CURRENT_CONSUMER_EVIDENCE_AUTHORITY`);
  }

  const A = Array.isArray(doc.A_pendingPartBlocked) ? doc.A_pendingPartBlocked : [];
  const B = Array.isArray(doc.B_deliberateDelta) ? doc.B_deliberateDelta : [];
  if (A.length !== 139) failures.push(`A_pendingPartBlocked: ${A.length} filas ≠ 139`);
  if (B.length !== 80) failures.push(`B_deliberateDelta: ${B.length} filas ≠ 80`);
  if (A.length + B.length !== 219) failures.push(`filas totales: ${A.length + B.length} ≠ 219`);
  if (doc.totals?.A_pendingPartBlocked !== A.length) failures.push(`totals.A_pendingPartBlocked: ${String(doc.totals?.A_pendingPartBlocked)} ≠ ${A.length} medidas`);
  if (doc.totals?.B_deliberateDelta !== B.length) failures.push(`totals.B_deliberateDelta: ${String(doc.totals?.B_deliberateDelta)} ≠ ${B.length} medidas`);
  if (doc.totals?.total !== A.length + B.length) failures.push(`totals.total: ${String(doc.totals?.total)} ≠ ${A.length + B.length} medidas`);

  // The adjudication is not decorative provenance: it is the binding
  // disposition ledger. Prove both directions for both worklist buckets so a
  // changed decision, an omitted relevant entry, a synthetic addition or a
  // row re-signed into the wrong bucket all fail independently of row counts.
  if (bindingUpstream !== undefined) {
    if (typeof bindingUpstream !== 'object' || bindingUpstream === null || Array.isArray(bindingUpstream)) {
      failures.push('authority.worklistAuthority.source: el documento upstream debe ser un objeto JSON no nulo');
    } else {
    const entries = bindingUpstream.entries;
    if (typeof entries !== 'object' || entries === null || Array.isArray(entries)) {
      failures.push('authority.worklistAuthority.entries: debe ser un objeto token -> adjudicación');
    } else {
      const expectedFor = (decision) => Object.entries(entries)
        .filter(([, entry]) => entry?.decision === decision)
        .map(([token]) => token)
        .sort();
      const compareBucket = (label, rows, decision) => {
        const actual = rows.map((row) => row?.token).filter((token) => typeof token === 'string').sort();
        const expected = expectedFor(decision);
        const actualSet = new Set(actual);
        const expectedSet = new Set(expected);
        const missing = expected.filter((token) => !actualSet.has(token));
        const unsupported = actual.filter((token) => !expectedSet.has(token));
        if (missing.length > 0) {
          failures.push(`${label}: ${missing.length} adjudicaciones ${decision} faltan del worklist (${missing.slice(0, 3).join(', ')})`);
        }
        if (unsupported.length > 0) {
          failures.push(`${label}: ${unsupported.length} filas contradicen el upstream ${decision} (${unsupported.slice(0, 3).join(', ')})`);
        }
      };
      compareBucket('A_pendingPartBlocked', A, 'PENDING_PART_BLOCKED');
      compareBucket('B_deliberateDelta', B, 'DELIBERATE_DELTA_PENDING_OWNER');
    }
    }
  }

  if (closedSchema(failures, 'authority.rows', authority.rows, ROWS_AUTHORITY_KEYS)) {
    const rowsAuthority = authority.rows;
    if (rowsAuthority.rowCount !== A.length + B.length) {
      failures.push(`authority.rows.rowCount: ${String(rowsAuthority.rowCount)} ≠ ${A.length + B.length} filas medidas`);
    }
    if (rowsAuthority.role !== 'ROW_IDENTITY') failures.push(`authority.rows.role: ${String(rowsAuthority.role)} ≠ ROW_IDENTITY`);
    if (typeof rowsAuthority.algorithm !== 'string' || rowsAuthority.algorithm.length < 80) {
      failures.push('authority.rows.algorithm: el algoritmo del digest debe quedar registrado, no implícito');
    }
    // SEMANTIC: recomputed from the live arrays. The stored string is never
    // trusted -- it is only ever compared against what the rows actually hash to.
    const measured = canonicalRowsSha256(doc);
    if (rowsAuthority.canonicalRowsSha256 !== measured) {
      failures.push(`authority.rows.canonicalRowsSha256: registrado ${String(rowsAuthority.canonicalRowsSha256)} ≠ medido ${measured} — las filas cambiaron y el digest no se re-firmó`);
    }
  }

  const rows = [...A, ...B];
  const seen = new Map();
  for (const row of rows) {
    const token = row?.token;
    if (typeof token !== 'string' || token.length === 0) {
      failures.push(`fila sin token: ${JSON.stringify(row?.family ?? row?.name ?? row).slice(0, 80)}`);
      continue;
    }
    seen.set(token, (seen.get(token) ?? 0) + 1);
  }
  for (const [token, count] of seen) {
    if (count > 1) failures.push(`token duplicado (${count}×): ${token} — cada fila es una identidad, no una repetición`);
  }

  // Every CONSUMER_APPLIED row resolves against the SAME pinned commit. A row
  // that quietly moved to another commit is drift, even when its evidence is
  // internally consistent.
  for (const row of rows) {
    const rp = row?.renderProof;
    if (!rp || rp.verdict !== 'CONSUMER_APPLIED') continue;
    const evs = Array.isArray(rp.consumerEvidence) ? rp.consumerEvidence : [rp.consumerEvidence];
    for (const ev of evs) {
      if (typeof ev !== 'object' || ev === null) continue;
      if (ev.repository !== 'app-bithire') {
        failures.push(`${row.token}: consumerEvidence.repository ${String(ev.repository)} ≠ app-bithire (autoridad de evidencia declarada)`);
      }
      if (ev.commit !== pin) {
        failures.push(`${row.token}: consumerEvidence.commit ${String(ev.commit)} ≠ pin ${pin} — deriva respecto de la autoridad de evidencia`);
      }
    }
  }

  if (closedSchema(failures, 'historicalProvenance', doc.historicalProvenance, HISTORICAL_KEYS)) {
    const hp = doc.historicalProvenance;
    if (hp.role !== 'HISTORICAL_UNRETAINED_NON_AUTHORITY') {
      failures.push(`historicalProvenance.role: ${String(hp.role)} ≠ HISTORICAL_UNRETAINED_NON_AUTHORITY — lo histórico no puede ascender a autoridad`);
    }
    const inputs = Array.isArray(hp.missingInputs) ? hp.missingInputs : [];
    const paths = inputs.map((i) => i?.path).sort();
    if (JSON.stringify(paths) !== JSON.stringify([...HISTORICAL_MISSING_INPUTS].sort())) {
      failures.push(`historicalProvenance.missingInputs: ${JSON.stringify(paths)} ≠ ${JSON.stringify(HISTORICAL_MISSING_INPUTS)}`);
    }
    for (const input of inputs) {
      if (!closedSchema(failures, `historicalProvenance.missingInputs[${String(input?.path)}]`, input, MISSING_INPUT_KEYS)) continue;
      if (input.status !== 'UNRETAINED') failures.push(`historicalProvenance.missingInputs[${input.path}].status: ${String(input.status)} ≠ UNRETAINED`);
      // A "missing" input that is actually present is a lie in the other
      // direction: it would be re-readable and therefore could be authority.
      if (upstreamExists(input.path)) {
        failures.push(`historicalProvenance.missingInputs[${input.path}]: declarado UNRETAINED pero EXISTE — si se puede releer, no pertenece a lo histórico`);
      }
    }
    if (closedSchema(failures, 'historicalProvenance.historicalMeasurementCommit', hp.historicalMeasurementCommit, HISTORICAL_COMMIT_KEYS)) {
      const hc = hp.historicalMeasurementCommit;
      if (hc.commit !== HISTORICAL_MEASUREMENT_COMMIT) {
        failures.push(`historicalProvenance.historicalMeasurementCommit.commit: ${String(hc.commit)} ≠ ${HISTORICAL_MEASUREMENT_COMMIT}`);
      }
      if (hc.status !== 'SUPERSEDED') failures.push(`historicalProvenance.historicalMeasurementCommit.status: ${String(hc.status)} ≠ SUPERSEDED`);
      if (hc.commit === pin) {
        failures.push('historicalProvenance.historicalMeasurementCommit: el commit histórico NO puede ser el pin vivo');
      }
    }
  }

  const cac = doc.renderVerification?.consumerAppliedClass;
  if (typeof cac?.measuredBy !== 'string' || cac.measuredBy.length === 0) {
    failures.push('renderVerification.consumerAppliedClass.measuredBy: debe conservarse (quién midió es historia atribuible)');
  }
  if (typeof cac?.measuredAgainst !== 'string' || !cac.measuredAgainst.includes(pin)) {
    failures.push(`renderVerification.consumerAppliedClass.measuredAgainst: ${String(cac?.measuredAgainst)} no cita el pin completo ${pin}`);
  }
  if (typeof cac?.measuredAgainst === 'string' && cac.measuredAgainst.includes(HISTORICAL_MEASUREMENT_COMMIT)) {
    failures.push('renderVerification.consumerAppliedClass.measuredAgainst: sigue citando el commit histórico como si fuera el vivo');
  }
  return failures;
}

export function checkWorklist({ rows, reachable, drillCase, roots = siblingRoots() }) {
  const failures = [];
  const list = rows.map((r) => ({ ...r, renderProof: r.renderProof ? { ...r.renderProof } : r.renderProof }));
  if (drillCase === 'unshipped-owner' && list[0]) list[0].shippingOwner = `src/foundation/tokens/css/presentation/components/${TOMBSTONE}`;
  if (drillCase === 'tombstone-row' && list[1]) list[1].cssOwner = TOMBSTONE;
  if (drillCase === 'rule-only-proof') {
    const target = list.find((r) => r.renderProof?.verdict === 'RENDERED_NODE');
    if (target) target.renderProof.tsx = null;
  }
  // CONSUMER_APPLIED evidence drills — each mutates ONE consumer row in memory.
  const ca = list.find((r) => r.renderProof?.verdict === 'CONSUMER_APPLIED');
  if (ca) {
    const ev = () => {
      const arr = Array.isArray(ca.renderProof.consumerEvidence) ? ca.renderProof.consumerEvidence : [ca.renderProof.consumerEvidence];
      ca.renderProof.consumerEvidence = arr.map((e) => (typeof e === 'object' && e ? { ...e } : e));
      return ca.renderProof.consumerEvidence[0];
    };
    if (drillCase === 'nonexistent-path') { const e = ev(); if (typeof e === 'object') e.path = 'src/DOES-NOT-EXIST.tsx'; else ca.renderProof.consumerEvidence = [{ repository: 'app-bithire', commit: 'x', path: 'src/DOES-NOT-EXIST.tsx', selector: 'ds-rich-card', consumerKind: 'class-skin-consumer', fileDigest: 'x' }]; }
    if (drillCase === 'missing-selector') { const e = ev(); if (typeof e === 'object') e.selector = 'ds-selector-que-no-existe'; }
    if (drillCase === 'prose-instead-of-structure') { ca.renderProof.consumerEvidence = 'app-bithire/src/ui/surfaces/index.tsx (renders it, trust me)'; }
    if (drillCase === 'wrong-repository') { const e = ev(); if (typeof e === 'object') e.repository = 'some-external-repo'; }
    if (drillCase === 'stale-commit-or-digest') { const e = ev(); if (typeof e === 'object') e.fileDigest = 'deadbeefdeadbeef'; }
    if (drillCase === 'stale-commit') { const e = ev(); if (typeof e === 'object') e.commit = '0000000000000000000000000000000000000000'; }
    if (drillCase === 'invalid-consumer-kind') { const e = ev(); if (typeof e === 'object') e.consumerKind = 'anything-at-all'; }
    if (drillCase === 'mismatched-family') { ev(); ca.family = '--ds-metric-card'; ca.token = '--ds-metric-card-drill'; }
  }

  for (const row of list) {
    const id = row.token ?? row.name ?? 'row';
    const rp = row.renderProof;
    if (!rp || !VERDICTS.has(rp.verdict)) {
      failures.push(`${id}: renderProof.verdict ausente o fuera de vocabulario`);
      continue;
    }
    // Prose in a path field is what turned rows red twice (rich-card ×7,
    // premium-card ×4) — close the class by shape, not by having looked:
    // tsx is null or a path, narrative goes in renderProof.note.
    if (rp.tsx !== null && rp.tsx !== undefined && !/^[\w@()[\]./-]+\.tsx?$/.test(rp.tsx)) {
      failures.push(`${id}: renderProof.tsx no tiene forma de path (prosa va en renderProof.note): "${String(rp.tsx).slice(0, 60)}"`);
    }
    if (typeof row.proposedSlot === 'string' && row.proposedSlot.includes(TOMBSTONE)) {
      failures.push(`${id}: proposedSlot menciona el TOMBSTONE`);
    }
    for (const [field, value] of rowCssPaths(row)) {
      if (value.includes(TOMBSTONE)) {
        failures.push(`${id}: ${field} apunta al TOMBSTONE`);
        continue;
      }
      const tail = relTail(value);
      if (!tail) {
        failures.push(`${id}: ${field} no es un path bajo foundation/tokens/css (${value})`);
        continue;
      }
      if (!reachable.has(tail)) failures.push(`${id}: ${field} NO es shipping-reachable (${tail})`);
    }
    if (rp.verdict === 'CONSUMER_APPLIED') {
      // The DS ships a class-keyed skin and the CONSUMING APP renders the
      // node. v1 accepted any string here and was FAIL-OPEN (an invented
      // path returned 0 failures — reproduced by Codex). The evidence is now
      // a GOVERNED STRUCTURE verified against the live sibling repo: closed
      // schema, repo allowlist, existing PRODUCTIVE file, selector present,
      // family correspondence, digest freshness. Multi-repo checkout is the
      // existing CI reality (app-ds-boundary already requires app-bithire);
      // a checkout without the sibling FAILS here honestly instead of
      // simulating the guarantee.
      failures.push(...checkConsumerEvidence(id, row, rp, roots));
    }
    if (rp.verdict === 'RENDERED_NODE') {
      if (!rp.tsx) {
        failures.push(`${id}: RENDERED_NODE sin renderProof.tsx — una regla CSS no es un part`);
        continue;
      }
      const tsxAbs = join(ROOT, rp.tsx.replace(/^packages\/core\//, ''));
      if (!existsSync(tsxAbs)) {
        failures.push(`${id}: renderProof.tsx no existe (${rp.tsx})`);
      } else if (rp.part) {
        // `part` may be a composite label ("a / b / c"): every listed part
        // must appear in the rendering TSX.
        const content = readFileSync(tsxAbs, 'utf8');
        const missing = rp.part.split('/').map((s) => s.trim()).filter(Boolean)
          .filter((p) => !content.includes(p));
        if (missing.length > 0) {
          failures.push(`${id}: part(s) "${missing.join(', ')}" no aparecen en ${rp.tsx}`);
        }
      }
    }
  }
  return failures;
}

function main() {
  if (!existsSync(WORKLIST)) {
    console.error('kimi-worklist FAIL — KIMI-VISUAL-WORKLIST.json ausente');
    process.exit(1);
  }
  const doc = JSON.parse(readFileSync(WORKLIST, 'utf8'));

  // Authority FIRST, on the untouched document. Drills mutate rows in memory, so
  // validating after injection would let a drill's mutation be mistaken for the
  // authority result -- and would let a real metadata regression hide behind a
  // drill that is red for its own reason.
  const authorityFailures = validateWorklistAuthority(doc);
  if (authorityFailures.length > 0) {
    for (const f of authorityFailures.slice(0, 12)) console.error(`kimi-worklist AUTHORITY FAIL — ${f}`);
    console.error(`kimi-worklist: ${authorityFailures.length} violación(es) de autoridad/metadata`);
    process.exit(1);
  }

  let roots;
  try {
    roots = resolveRepoRoots(process.env);
  } catch (error) {
    console.error(`kimi-worklist FAIL — ${error.message}`);
    process.exit(1);
  }

  const rows = [...(doc.A_pendingPartBlocked ?? []), ...(doc.B_deliberateDelta ?? [])];
  const reachable = reachableSet();
  const failures = checkWorklist({ rows, reachable, drillCase: drill, roots });
  if (drill) {
    if (failures.length === 0) {
      console.error(`kimi-worklist DRILL FAIL — "${drill}" no produjo violaciones (gate vacuo)`);
      process.exit(1);
    }
    console.log(`kimi-worklist drill "${drill}" OK — ${failures.length} violación(es): ${failures.join(" | ").slice(0, 400)}`);
    return;
  }
  if (failures.length > 0) {
    for (const f of failures.slice(0, 12)) console.error(`kimi-worklist FAIL — ${f}`);
    console.error(`kimi-worklist: ${failures.length} violación(es) en ${rows.length} filas`);
    process.exit(1);
  }
  console.log(`kimi-worklist OK — ${rows.length} filas: autoridad/metadata válidas, digest de filas re-firmado, owners shipping-reachable, cero tombstone en filas, renderProof = nodo`);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  main();
}
