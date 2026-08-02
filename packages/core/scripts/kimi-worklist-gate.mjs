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
 * --check          exit 1 on any violation
 * --drill=<case>   self-inject: unshipped-owner | rule-only-proof | tombstone-row
 */
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { collectReachable } from './css-layer-paint-gate.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
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

const SIBLINGS_ROOT = resolve(ROOT, '../..', '..');
const REPO_ALLOWLIST = new Map([
  ['app-bithire', join(SIBLINGS_ROOT, 'app-bithire')],
  ['app-evnto', join(SIBLINGS_ROOT, 'app-evnto')],
  ['app-platform', join(SIBLINGS_ROOT, 'app-platform')],
  ['showroom', resolve(ROOT, '../showroom')],
]);
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

/** Governed CONSUMER_APPLIED evidence: every leg falsifiable, none simulated. */
export function checkConsumerEvidence(id, row, rp) {
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
    const base = REPO_ALLOWLIST.get(ev.repository);
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

export function checkWorklist({ rows, reachable, drillCase }) {
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
      failures.push(...checkConsumerEvidence(id, row, rp));
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
  const rows = [...(doc.A_pendingPartBlocked ?? []), ...(doc.B_deliberateDelta ?? [])];
  const reachable = reachableSet();
  const failures = checkWorklist({ rows, reachable, drillCase: drill });
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
  console.log(`kimi-worklist OK — ${rows.length} filas: owners shipping-reachable, cero tombstone en filas, renderProof = nodo`);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  main();
}
