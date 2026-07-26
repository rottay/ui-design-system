/**
 * Self-test for portal-substrate-gate.mjs.
 *
 * Unit-drills the pure helpers against in-memory fixtures (including the
 * simulated new bypass the gate exists to catch), then integration-checks the
 * real tree through both `runPortalSubstrateGate` and the `--check` CLI.
 */
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import {
  SUBSTRATE_MODULE,
  findPortalSites,
  evaluatePortalCensus,
  loadAllowlist,
  runPortalSubstrateGate,
} from './portal-substrate-gate.mjs';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const gate = join(scriptDir, 'portal-substrate-gate.mjs');

const EMPTY_ALLOWLIST = { entries: [] };

test('findPortalSites detects the bare and namespaced call shapes', () => {
  const source = `
    import { createPortal } from 'react-dom';
    import ReactDOM from 'react-dom';
    export function Panel() {
      if (a) return createPortal(<div />, document.body);
      return ReactDOM.createPortal(<div />, document.body);
    }
  `;
  const sites = findPortalSites(source, 'panel.tsx');
  assert.equal(sites.length, 2);
  assert.deepEqual(sites.map((site) => site.text), ['createPortal', 'ReactDOM.createPortal']);
});

test('findPortalSites ignores prose -- comments, docs and strings are not calls', () => {
  // The migrated owners all explain the substrate in their comments; a text
  // scan would score every explanation as a fresh violation.
  const source = `
    /**
     * Portal rendering used to go through createPortal(content, document.body).
     * Now it renders through <Portal>.
     */
    const note = 'createPortal(x, document.body)';
    export function Panel() {
      // no createPortal(...) here either
      return <Portal>{surface}</Portal>;
    }
  `;
  assert.deepEqual(findPortalSites(source, 'panel.tsx'), []);
});

test('the substrate module itself is never a violation', () => {
  const census = [{ file: SUBSTRATE_MODULE, sites: [{ line: 127, text: 'createPortal' }] }];
  assert.deepEqual(evaluatePortalCensus(census, EMPTY_ALLOWLIST), []);
});

test('catches a SIMULATED NEW BYPASS in a fresh file', () => {
  const census = [
    { file: SUBSTRATE_MODULE, sites: [{ line: 127, text: 'createPortal' }] },
    { file: 'src/ui/primitives/overlay/Brandnew/engines/modern/index.tsx', sites: [{ line: 42, text: 'createPortal' }] },
  ];
  const violations = evaluatePortalCensus(census, EMPTY_ALLOWLIST);
  assert.equal(violations.length, 1);
  assert.equal(violations[0].kind, 'unauthorized');
  assert.equal(violations[0].file, 'src/ui/primitives/overlay/Brandnew/engines/modern/index.tsx');
  assert.deepEqual(violations[0].lines, [42]);
  assert.match(violations[0].message, /render through <Portal>/);
});

test('catches a SIMULATED NEW BYPASS added inside an allowlisted file', () => {
  // The entry authorizes a COUNT, not the file: growing it must still fail.
  const allowlist = { entries: [{ file: 'src/ui/primitives/overlay/Sheet/engines/rustic/index.tsx', sites: 1, reason: 'frozen' }] };
  const census = [
    { file: SUBSTRATE_MODULE, sites: [{ line: 127, text: 'createPortal' }] },
    {
      file: 'src/ui/primitives/overlay/Sheet/engines/rustic/index.tsx',
      sites: [{ line: 156, text: 'createPortal' }, { line: 201, text: 'createPortal' }],
    },
  ];
  const violations = evaluatePortalCensus(census, allowlist);
  assert.equal(violations.length, 1);
  assert.equal(violations[0].kind, 'over-budget');
  assert.match(violations[0].message, /authorizes 1 createPortal site\(s\), found 2/);
});

test('a ledger entry cannot outlive its sites (stale entries fail)', () => {
  const allowlist = { entries: [{ file: 'src/ui/primitives/overlay/Gone/index.tsx', sites: 2, reason: 'frozen' }] };
  const census = [{ file: SUBSTRATE_MODULE, sites: [{ line: 127, text: 'createPortal' }] }];
  const violations = evaluatePortalCensus(census, allowlist);
  assert.equal(violations.length, 1);
  assert.equal(violations[0].kind, 'stale');
  assert.match(violations[0].message, /remove the entry/);
});

test('a partially migrated allowlisted file must lower its count', () => {
  const allowlist = { entries: [{ file: 'src/ui/x/index.tsx', sites: 3, reason: 'frozen' }] };
  const census = [
    { file: SUBSTRATE_MODULE, sites: [{ line: 127, text: 'createPortal' }] },
    { file: 'src/ui/x/index.tsx', sites: [{ line: 10, text: 'createPortal' }] },
  ];
  const violations = evaluatePortalCensus(census, allowlist);
  assert.equal(violations.length, 1);
  assert.equal(violations[0].kind, 'stale');
  assert.match(violations[0].message, /lower "sites" to 1/);
});

test('an absent allowlist file fails every bypass closed', () => {
  const dir = mkdtempSync(join(tmpdir(), 'portal-gate-'));
  try {
    const missing = join(dir, 'does-not-exist.json');
    assert.deepEqual(loadAllowlist(missing), { entries: [] });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('the shipped allowlist entries all carry a written reason and owner', () => {
  const allowlist = loadAllowlist();
  assert.ok(allowlist.entries.length > 0, 'expected a non-empty ledger');
  for (const entry of allowlist.entries) {
    assert.ok(typeof entry.file === 'string' && entry.file.startsWith('src/'), `bad file: ${entry.file}`);
    assert.ok(Number.isInteger(entry.sites) && entry.sites > 0, `bad site count on ${entry.file}`);
    assert.ok(typeof entry.reason === 'string' && entry.reason.length > 20, `missing reason on ${entry.file}`);
    assert.ok(typeof entry.owner === 'string' && entry.owner.length > 0, `missing owner on ${entry.file}`);
  }
});

test('the real tree passes: every Modern portal resolves through the substrate', () => {
  const result = runPortalSubstrateGate();
  assert.ok(result.substrateSites > 0, 'substrate module must still call createPortal');
  assert.deepEqual(
    result.violations.map((violation) => `${violation.kind} ${violation.file}`),
    [],
  );
  assert.equal(result.pass, true);
  // Nothing under an `engines/modern` path may bypass the substrate.
  const modernBypasses = result.census
    .map(({ file }) => file)
    .filter((file) => file !== SUBSTRATE_MODULE && /engines\/modern\//.test(file));
  assert.deepEqual(modernBypasses, []);
});

test('CLI: --check exits 0 on the real tree and prints the OK line', () => {
  const run = spawnSync(process.execPath, [gate, '--check'], { encoding: 'utf8' });
  assert.equal(run.status, 0, run.stderr);
  assert.match(run.stdout, /\[portal-substrate-gate\] OK/);
});

test('CLI: --check exits 1 when the ledger is emptied under a real bypass', () => {
  // Drives the real tree against an EMPTY ledger: the frozen rustic engines
  // become unauthorized, proving the non-zero exit path end to end.
  const dir = mkdtempSync(join(tmpdir(), 'portal-gate-'));
  try {
    const emptyLedger = join(dir, 'empty.json');
    writeFileSync(emptyLedger, JSON.stringify({ entries: [] }), 'utf8');
    const result = runPortalSubstrateGate({ allowlistPath: emptyLedger });
    assert.ok(result.violations.length > 0, 'expected the frozen engines to surface as unauthorized');
    assert.ok(result.violations.every((violation) => violation.kind === 'unauthorized'));
    assert.equal(result.pass, false);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
