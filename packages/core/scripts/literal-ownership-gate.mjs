#!/usr/bin/env node
/**
 * literal-ownership-gate v2 — MULTISET identity, not count-plus-presence
 * (Codex final remediation blocker 1, 2026-08-02).
 *
 * v1 was FAIL-OPEN, reproduced: replacing a real registry row with a
 * duplicate of another (keeping 41 rows) returned 0 failures, because the
 * gate compared COUNT and per-row local presence. v2 derives the REAL corpus
 * from source with the audit's own collector (one walker, imported — never a
 * second measurement) and compares the exact MULTISET against the registry:
 *
 *   identity = normalizedFile :: normalizedValue :: ordinal
 *
 * where `ordinal` is the occurrence index among identical (file,value) pairs
 * on each side, in deterministic scan/row order. Line numbers are FRESHNESS
 * info, never identity. The numeric pin stays as a SECONDARY ratchet — it can
 * fail, but it can never prove identity. Missing sites, stale rows and
 * one-for-one substitutions are all detected simultaneously (a substitution
 * is exactly one missing + one stale). Fully-identical duplicated registry
 * rows are rejected outright.
 *
 * --check          exit 1 on any violation
 * --drill=<case>   duplicate-one | drop-one | missing-real-site |
 *                  stale-extra-row | duplicate-key | broken-without-owner |
 *                  pin-drift | planted-literal
 */
import { readFileSync } from 'node:fs';
import { dirname, join, resolve, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { collectSkinFiles } from './lib/skin-files.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CSS_ROOT = join(ROOT, 'src/foundation/tokens/css');
const REGISTRY = join(ROOT, 'src/foundation/tokens/residual-adjudication.json');
const BASELINE = join(ROOT, 'scripts/engine-token-audit.baseline.json');

const LEGIT = new Set(['SUB_RUNG_DELIBERATE', 'BESPOKE_CLAMP']);
const BROKEN = new Set(['EXACT_RUNG', 'NO_RUNG_SCALE_EXTENSION']);
const CLASSES = new Set([...LEGIT, ...BROKEN]);

const args = process.argv.slice(2);
const drillArg = args.find((a) => a.startsWith('--drill'));
const drill = drillArg?.includes('=') ? drillArg.split('=')[1] : undefined;

const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '');
const normValue = (v) => String(v).trim().replace(/\s+/g, ' ').toLowerCase();
const normFile = (f) => {
  const clean = String(f).replaceAll('\\', '/');
  const i = clean.indexOf('foundation/tokens/css/');
  return i >= 0 ? clean.slice(i + 'foundation/tokens/css/'.length) : clean.replace(/^packages\/core\/src\//, '').replace(/^src\//, '');
};

/** The REAL corpus, derived from source with the audit's exact semantics
 * (same files via the imported collector, comments stripped, var() skipped,
 * literal length required). Deterministic order: collector order, then
 * position in file. */
export function discoverCorpus() {
  const declRe = /font-size\s*:\s*([^;}{]+)[;}]/gi;
  const literalLen = /(?<![\w-])-?\d*\.?\d+(?:px|rem|em)\b/;
  const sites = [];
  for (const file of collectSkinFiles().sort()) {
    const text = stripComments(readFileSync(file, 'utf8'));
    for (const m of text.matchAll(declRe)) {
      const val = m[1];
      if (/var\(\s*--/.test(val)) continue;
      if (!literalLen.test(val)) continue;
      const line = text.slice(0, m.index).split('\n').length;
      sites.push({ file: normFile(relative(ROOT, file)), value: normValue(val), line });
    }
  }
  return sites;
}

function toMultiset(sites) {
  const counts = new Map();
  const keyed = [];
  for (const s of sites) {
    const base = `${s.file}::${s.value}`;
    const ordinal = counts.get(base) ?? 0;
    counts.set(base, ordinal + 1);
    keyed.push({ ...s, key: `${base}::${ordinal}` });
  }
  return keyed;
}

export function checkOwnership({ registryRows, discovered, pin, drillCase }) {
  const failures = [];
  let rows = registryRows.map((r) => ({ ...r }));
  let found = discovered.map((s) => ({ ...s }));

  if (drillCase === 'duplicate-one' && rows.length > 5) rows[5] = { ...rows[0] };
  if (drillCase === 'drop-one') rows = rows.slice(0, -1);
  if (drillCase === 'missing-real-site' || drillCase === 'planted-literal') {
    found.push({ file: 'runtime/engines/modern/skin/button.css', value: normValue('14px'), line: 1 });
  }
  if (drillCase === 'stale-extra-row') {
    rows.push({ file: 'runtime/engines/modern/skin/button.css', value: '99px', cls: 'EXACT_RUNG', owner: 'x', reason: 'x', proof: 'x' });
  }
  if (drillCase === 'duplicate-key' && rows.length > 1) rows.push({ ...rows[1] });
  if (drillCase === 'broken-without-owner') {
    const t = rows.find((r) => BROKEN.has(r.cls));
    if (t) { t.owner = ''; t.reason = ''; }
  }
  const effectivePin = drillCase === 'pin-drift' ? pin + 5 : pin;

  // Fully-identical duplicated registry rows are corruption, rejected
  // outright. LINE is part of the fingerprint: two rows for two REAL sites
  // with the same value legitimately differ only by line (the multiset maps
  // them by ordinal); the same line twice is a copy-paste, not a site.
  const seenExact = new Set();
  for (const r of rows) {
    const exact = JSON.stringify([normFile(r.file), normValue(r.value), r.line ?? null]);
    if (seenExact.has(exact)) failures.push(`fila de registro DUPLICADA (mismo file+value+line — copy-paste, no un sitio): ${normFile(r.file)}:${r.line} :: ${r.value}`);
    seenExact.add(exact);
  }

  // THE LAW: exact multiset equality, both directions.
  const regKeyed = toMultiset(rows.map((r) => ({ file: normFile(r.file), value: normValue(r.value), row: r })));
  const disKeyed = toMultiset(found);
  const regKeys = new Map(regKeyed.map((k) => [k.key, k]));
  const disKeys = new Map(disKeyed.map((k) => [k.key, k]));
  for (const [key, site] of disKeys) {
    if (!regKeys.has(key)) {
      failures.push(`LITERAL VIVO SIN FILA (missing-real-site): ${key} @ línea ${site.line} — un tamaño que debe responder a typography.scale no puede quedar sin ownership`);
    }
  }
  for (const [key, entry] of regKeys) {
    if (!disKeys.has(key)) {
      failures.push(`FILA SIN LITERAL (stale-extra-row): ${key} — el registro afirma un sitio que la fuente ya no tiene`);
    }
  }

  // Per-row vocabulary + broken-needs-owner (unchanged law).
  for (const { row } of regKeyed.map((k) => ({ row: k.row ?? {} }))) {
    if (!row.cls) continue;
    const id = `${normFile(row.file)}::${row.value}`;
    if (!CLASSES.has(row.cls)) failures.push(`${id}: clase fuera de vocabulario (${row.cls})`);
    else if (BROKEN.has(row.cls) && !(row.owner && row.reason && row.proof)) {
      failures.push(`${id}: clase ${row.cls} (control vendido roto) sin owner+razón+prueba`);
    }
  }

  // SECONDARY ratchet — can fail, can never prove identity.
  if (rows.length !== effectivePin) {
    failures.push(`ratchet secundario: pin=${effectivePin} vs registro=${rows.length} (el pin nunca prueba identidad; el multiset arriba es la ley)`);
  }
  return failures;
}

function main() {
  const registry = JSON.parse(readFileSync(REGISTRY, 'utf8'));
  const corpus = registry.faseBExecution?.fase2_reconciliation?.ownershipGateCorpus;
  if (!corpus?.sites?.length) {
    console.error('literal-ownership FAIL — ownershipGateCorpus ausente');
    process.exit(1);
  }
  const pin = JSON.parse(readFileSync(BASELINE, 'utf8'))['scale.fontSizeLiterals'];
  const discovered = discoverCorpus();
  const failures = checkOwnership({ registryRows: corpus.sites, discovered, pin, drillCase: drill });
  if (drill) {
    if (failures.length === 0) {
      console.error(`literal-ownership DRILL FAIL — "${drill}" no produjo violaciones (gate vacuo)`);
      process.exit(1);
    }
    console.log(`literal-ownership drill "${drill}" OK — ${failures.length} violación(es): ${failures[0].slice(0, 200)}`);
    return;
  }
  if (failures.length > 0) {
    for (const f of failures.slice(0, 12)) console.error(`literal-ownership FAIL — ${f}`);
    process.exit(1);
  }
  const byClass = {};
  for (const s of corpus.sites) byClass[s.cls] = (byClass[s.cls] ?? 0) + 1;
  console.log(`literal-ownership OK — MULTISET idéntico: ${discovered.length} descubiertos = ${corpus.sites.length} registrados (pin ${pin} como ratchet secundario); legítimos ${[...LEGIT].map((c) => `${c}=${byClass[c] ?? 0}`).join(' ')}; rotos-con-owner ${[...BROKEN].map((c) => `${c}=${byClass[c] ?? 0}`).join(' ')}`);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  main();
}
