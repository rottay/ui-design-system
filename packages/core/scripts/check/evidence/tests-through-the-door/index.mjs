#!/usr/bin/env node
// WO-EVI-03 (F-48): harness consumers, channel-text assertions without a producer, visual baseline expiry.
// Each census equals its ledger in both directions; the ledgers state the law and the owners.
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

import { maskSourceComments } from '../../tokens/cascade/channels/liveness/index.mjs';
import { collectChannelProducers } from '../../../libraries/tokens/producers/index.mjs';
import { packageRoot } from '../../../libraries/repo-root/index.mjs';

const HERE = fileURLToPath(new URL('.', import.meta.url));
export const CORE_ROOT = packageRoot(HERE);
export const PACKAGES_ROOT = resolve(CORE_ROOT, '..');
export const SHOWROOM_ROOT = resolve(PACKAGES_ROOT, 'showroom');
export const TEST_LEDGER = resolve(HERE, 'ledger/index.json');
export const BASELINE_LEDGER = resolve(SHOWROOM_ROOT, 'e2e/baseline-expiry/index.json');

export const HARNESS_FILE = 'core/tests/support/theme-lowering/index.ts';
export const HARNESS_BINDING = 'lowerFlatThemeFixture';
const OWN_DRILL = 'core/scripts/check/evidence/tests-through-the-door/';

const SKIPPED_DIRS = new Set(['node_modules', 'dist', 'coverage', '.next', '.turbo', 'test-results', 'playwright-report']);
const SOURCE_FILE = /\.(?:[cm]?[jt]sx?)$/u;
const TEST_FILE = /(?:^|\/)(?:tests?|__tests__|e2e)\/|\.(?:test|spec)\.[cm]?[jt]sx?$/u;
const OWNER = /^WO-[A-Z]{3,4}-\d{2}$/u;
export const UNASSIGNED_CLASS = 'uncut-family-read';
const posix = (path) => path.split(sep).join('/');

function walk(root, keep, out = []) {
  let entries;
  try {
    entries = readdirSync(root, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    if (SKIPPED_DIRS.has(entry.name)) continue;
    const full = join(root, entry.name);
    if (entry.isDirectory()) walk(full, keep, out);
    else if (entry.isFile() && keep(full)) out.push(full);
  }
  return out;
}

export function collectTestSources({ packagesRoot = PACKAGES_ROOT } = {}) {
  const files = [];
  for (const pkg of ['core', 'showroom']) {
    for (const full of walk(join(packagesRoot, pkg), (path) => SOURCE_FILE.test(path))) {
      const path = posix(relative(packagesRoot, full));
      if (TEST_FILE.test(path) && !path.startsWith(OWN_DRILL)) files.push({ path, text: readFileSync(full, 'utf8') });
    }
  }
  return files.sort((a, b) => a.path.localeCompare(b.path));
}

export function censusHarnessConsumers(sources) {
  const binding = new RegExp(`\\b${HARNESS_BINDING}\\b`, 'u');
  return sources
    .filter(({ path }) => path !== HARNESS_FILE)
    .filter(({ text }) => binding.test(maskSourceComments(text)))
    .map(({ path }) => path);
}

const CONTAIN_CALL = /(\.not\s*)?\.toContain\(\s*(['"`])((?:\\.|(?!\2)[^\\])*)\2/gu;
const CHANNEL = /--ds-[a-zA-Z0-9_-]*/gu;
const KEY_WRITE = /(?:^|[{,(])\s*(['"`])(--ds-[a-zA-Z0-9_-]+)\1\s*:/gmu;
const SET_PROPERTY = /setProperty\(\s*(['"`])(--ds-[a-zA-Z0-9_-]+)\1/gu;
const BRACKET_WRITE = /\[\s*(['"`])(--ds-[a-zA-Z0-9_-]+)\1(?:\s+as\s+const)?\s*\]\s*(?::|=(?!=))/gu;
const CSS_DECLARATION = /(--ds-[a-zA-Z0-9_-]+)\s*:(?!:)/gu;

// A literal ending in `-` or before a template hole names a prefix, produced when any producer starts with it.
export function extractChannelTextAssertions(path, text) {
  const scanned = maskSourceComments(text);
  const rows = [];
  for (const call of scanned.matchAll(CONTAIN_CALL)) {
    if (call[1]) continue;
    const literal = call[3];
    const line = scanned.slice(0, call.index).split('\n').length;
    for (const match of literal.matchAll(CHANNEL)) {
      const rest = literal.slice(match.index + match[0].length);
      const prefix = match[0].endsWith('-') || (call[2] === '`' && rest.startsWith('${'));
      if (match[0] === '--ds-') continue;
      rows.push({ file: path, line, name: match[0], prefix });
    }
  }
  return rows;
}

export function testLocalDeclarations(text) {
  const scanned = maskSourceComments(text);
  const names = new Set();
  for (const match of scanned.matchAll(CSS_DECLARATION)) names.add(match[1]);
  for (const pattern of [KEY_WRITE, BRACKET_WRITE]) for (const match of scanned.matchAll(pattern)) names.add(match[2]);
  return names;
}

export function collectSourceWriters({ coreRoot = CORE_ROOT } = {}) {
  const runtime = new Set();
  const src = join(coreRoot, 'src');
  for (const full of walk(src, (path) => SOURCE_FILE.test(path))) {
    const path = posix(relative(coreRoot, full));
    if (TEST_FILE.test(path) || /(?:^|\/)(?:fixtures|stories)\/|\.stories\./u.test(path)) continue;
    const scanned = maskSourceComments(readFileSync(full, 'utf8'));
    for (const pattern of [KEY_WRITE, SET_PROPERTY, BRACKET_WRITE]) {
      for (const match of scanned.matchAll(pattern)) runtime.add(match[2]);
    }
  }
  const artifact = new Set();
  const artifacts = join(coreRoot, 'src/foundation/tokens/css/facade/artifacts');
  for (const full of walk(artifacts, (path) => path.endsWith('.css'))) {
    const scanned = readFileSync(full, 'utf8').replace(/\/\*[\s\S]*?\*\//gu, '');
    for (const match of scanned.matchAll(CSS_DECLARATION)) artifact.add(match[1]);
  }
  return { runtime, artifact };
}

export function censusUnproducedAssertions(sources, { producers, runtime, artifact }) {
  const rows = new Map();
  let assertions = 0;
  for (const { path, text } of sources) {
    const found = extractChannelTextAssertions(path, text);
    if (found.length === 0) continue;
    const local = testLocalDeclarations(text);
    const sets = [producers, runtime, artifact, local];
    for (const row of found) {
      assertions += 1;
      const produced = row.prefix
        ? sets.some((set) => [...set].some((name) => name.startsWith(row.name)))
        : sets.some((set) => set.has(row.name));
      if (produced) continue;
      const key = `${row.file}::${row.name}`;
      const entry = rows.get(key) ?? { file: row.file, name: row.name, lines: [] };
      entry.lines.push(row.line);
      rows.set(key, entry);
    }
  }
  return { assertions, unproduced: [...rows.values()].sort((a, b) => `${a.file}::${a.name}`.localeCompare(`${b.file}::${b.name}`)) };
}

export function censusVisualBaselines({ showroomRoot = SHOWROOM_ROOT } = {}) {
  const sets = new Map();
  for (const full of walk(join(showroomRoot, 'e2e'), (path) => path.endsWith('.png'))) {
    const path = posix(relative(showroomRoot, full));
    const match = /^(.*)\/__screenshots__\/([^/]+)\/(.+)$/u.exec(path);
    if (!match) continue;
    const spec = `${match[1]}/${match[2]}`;
    const set = sets.get(spec) ?? [];
    set.push({ path, bytes: readFileSync(full) });
    sets.set(spec, set);
  }
  return [...sets.entries()]
    .map(([spec, files]) => {
      const hash = createHash('sha256');
      for (const file of files.sort((a, b) => a.path.localeCompare(b.path))) {
        hash.update(file.path).update('\0').update(file.bytes).update('\0');
      }
      return { spec, baselines: files.length, sha256: hash.digest('hex') };
    })
    .sort((a, b) => a.spec.localeCompare(b.spec));
}

function exactSet(label, measured, recorded, findings) {
  const want = new Set(recorded);
  const have = new Set(measured);
  for (const item of have) if (!want.has(item)) findings.push(`${label}: new row ${item} -- the ledger is decrease-only; route it through the door instead`);
  for (const item of want) if (!have.has(item)) findings.push(`${label}: ${item} left the census -- write the exit into the ledger (remove the row) so the count follows the tree down`);
}

export function checkArms({ consumers, unproduced, baselines, testLedger, baselineLedger }) {
  const findings = [];

  const harness = testLedger.harnessConsumers;
  if (!OWNER.test(harness.owner ?? '') || !harness.reason) findings.push('harness consumers: the ledger names no owner work order or no reason');
  exactSet('harness consumers', consumers, harness.files, findings);

  const ledgerRows = testLedger.unproducedChannelAssertions.rows;
  const byKey = new Map(ledgerRows.map((row) => [`${row.file}::${row.name}`, row]));
  for (const row of ledgerRows) {
    const unassigned = row.owner === null && row.class === UNASSIGNED_CLASS && OWNER.test(row.ownerProposal ?? '');
    if (!unassigned && !OWNER.test(row.owner ?? '')) findings.push(`unproduced assertion ${row.file}::${row.name}: owner "${row.owner}" is not a work order (only ${UNASSIGNED_CLASS} may carry a null owner, and then with an ownerProposal)`);
    if (!testLedger.unproducedChannelAssertions.classes[row.class]) findings.push(`unproduced assertion ${row.file}::${row.name}: class "${row.class}" is not declared`);
    if (!row.reason) findings.push(`unproduced assertion ${row.file}::${row.name}: no reason`);
    if (row.class === 'producer-outside-static-reach' && !row.producer) findings.push(`unproduced assertion ${row.file}::${row.name}: a producer the static set cannot see must be cited at its file`);
  }
  exactSet('unproduced assertions', unproduced.map((row) => `${row.file}::${row.name}`), byKey.keys(), findings);
  for (const row of unproduced) {
    const recorded = byKey.get(`${row.file}::${row.name}`);
    if (recorded && recorded.occurrences !== row.lines.length) {
      findings.push(`unproduced assertion ${row.file}::${row.name}: ${row.lines.length} occurrence(s), the ledger records ${recorded.occurrences}`);
    }
  }

  const notes = new Map(baselineLedger.entries.map((entry) => [entry.spec, entry]));
  const allowedExpiry = new Set(Object.keys(baselineLedger.expiries));
  for (const entry of baselineLedger.entries) {
    if (!OWNER.test(entry.owner ?? '') || !entry.reason || !entry.measuredAt) findings.push(`visual baselines ${entry.spec}: the note needs owner, reason and measuredAt`);
    if (!allowedExpiry.has(entry.expiresWhen)) findings.push(`visual baselines ${entry.spec}: expiresWhen "${entry.expiresWhen}" is not a declared expiry`);
  }
  for (const set of baselines) {
    const note = notes.get(set.spec);
    if (!note) {
      findings.push(`visual baselines ${set.spec}: ${set.baselines} baseline(s) carry no expiry note`);
      continue;
    }
    if (note.baselines !== set.baselines) findings.push(`visual baselines ${set.spec}: ${set.baselines} baseline(s) on disk, the note covers ${note.baselines} -- a baseline without its note`);
    else if (note.sha256 !== set.sha256) findings.push(`visual baselines ${set.spec}: the set changed under its note (sha256 ${set.sha256.slice(0, 12)} != ${String(note.sha256).slice(0, 12)}) -- baselines are not regenerated before ${note.expiresWhen}`);
  }
  for (const spec of notes.keys()) if (!baselines.some((set) => set.spec === spec)) findings.push(`visual baselines ${spec}: the note covers no baseline on disk -- remove it`);

  return findings;
}

export function measure() {
  const sources = collectTestSources();
  const { producers } = collectChannelProducers();
  const writers = collectSourceWriters();
  const assertionCensus = censusUnproducedAssertions(sources, { producers, ...writers });
  return {
    consumers: censusHarnessConsumers(sources),
    assertions: assertionCensus.assertions,
    unproduced: assertionCensus.unproduced,
    baselines: censusVisualBaselines(),
  };
}

function main() {
  const measured = measure();
  if (process.argv.includes('--census')) {
    console.log(JSON.stringify(measured, null, 2));
    return;
  }
  const testLedger = JSON.parse(readFileSync(TEST_LEDGER, 'utf8'));
  const baselineLedger = existsSync(BASELINE_LEDGER) ? JSON.parse(readFileSync(BASELINE_LEDGER, 'utf8')) : { entries: [], expiries: {} };
  const findings = checkArms({ ...measured, testLedger, baselineLedger });
  const byClass = Object.groupBy(testLedger.unproducedChannelAssertions.rows, (row) => row.class);
  const lines = [
    `tests-through-the-door: harness consumers ${measured.consumers.length} (target 0, owner ${testLedger.harnessConsumers.owner})`,
    `  channel-text assertions: ${measured.assertions} positive, ${measured.unproduced.length} file/channel pair(s) without a static producer`,
    ...Object.entries(byClass).map(([name, rows]) => `    ${name}: ${rows.length}`),
    `  visual baselines: ${measured.baselines.reduce((sum, set) => sum + set.baselines, 0)} in ${measured.baselines.length} set(s), ${baselineLedger.entries.length} note(s)`,
    ...findings.map((finding) => `  - ${finding}`),
    `tests-through-the-door ${findings.length === 0 ? 'OK' : `FAIL -- ${findings.length} finding(s)`}`,
  ];
  (findings.length === 0 ? console.log : console.error)(lines.join('\n'));
  process.exitCode = findings.length === 0 ? 0 : 1;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
