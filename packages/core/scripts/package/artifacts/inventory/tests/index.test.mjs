// Self-test for pack-inventory-gate.mjs (BLD packaging honesty).
//
// Hermetic: drills the pure `auditPackInventory` with synthetic pack inventories
// and injected file contents (no real `npm pack`, no dist dependency), so it is
// safe in the pre-build `test:scripts` slot. Also pins the tenant-token
// derivation against the real torture fixtures and the shipped lucide allowlist.

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import {
  auditPackInventory,
  collectForbiddenTenantTokens,
  loadLucideAllowlist,
} from '../index.mjs';
import { packageRoot as findPackageRoot } from '../../../../libraries/repo-root/index.mjs';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const packageRoot = findPackageRoot(scriptDir);

const TOKENS = {
  all: new Set(['themanagementmiami', 'torture', 'torture-dark', 'torture-light', 'tortureDarkBrandTheme']),
  content: new Set(['themanagementmiami', 'torture-dark', 'torture-light', 'tortureDarkBrandTheme']),
};
const ALLOW = { prefixes: ['dist/entrypoints/eslint/'], exacts: new Set(['contracts/runtime/suppliers/index.json']) };

function pack(files, { unpackedSize, entryCount } = {}) {
  const list = files.map((f) => (typeof f === 'string' ? { path: f, size: 10 } : f));
  return {
    name: '@rottay/design-system',
    version: '2.19.34',
    files: list,
    entryCount: entryCount ?? list.length,
    unpackedSize: unpackedSize ?? list.reduce((n, f) => n + f.size, 0),
  };
}

function baselineFrom(p) {
  return {
    files: p.files.map((f) => ({ path: f.path, size: f.size })),
    entryCount: p.entryCount,
    unpackedSize: p.unpackedSize,
  };
}

function audit(p, { baseline = null, additions = [], contents = {} } = {}) {
  return auditPackInventory({
    pack: p,
    baseline,
    additions,
    lucideAllow: ALLOW,
    forbiddenTokens: TOKENS,
    readPackedFile: (path) => {
      if (path in contents) {
        if (contents[path] instanceof Error) throw contents[path];
        return contents[path];
      }
      return '';
    },
  });
}

test('a clean pack within baseline passes', () => {
  const p = pack(['dist/index.js', 'dist/index.d.ts', 'README.md']);
  const { failures } = audit(p, { baseline: baselineFrom(p) });
  assert.deepEqual(failures, []);
});

test('a shipped fixtures/ path fails', () => {
  const p = pack(['dist/tests/fixtures/brand-themes/torture/index.js']);
  const { failures } = audit(p, { baseline: baselineFrom(p) });
  assert.match(failures.join('\n'), /fixture path shipped/);
});

test('a tenant proof-fixture token in a packed PATH fails', () => {
  const p = pack(['dist/foundation/themanagementmiami/index.js']);
  const { failures } = audit(p, { baseline: baselineFrom(p) });
  assert.match(failures.join('\n'), /themanagementmiami.*packed path/);
});

test('lucide in a packed path fails unless allowlisted', () => {
  const bad = pack(['dist/ui/lucide-adapter/index.js']);
  assert.match(audit(bad, { baseline: baselineFrom(bad) }).failures.join('\n'), /lucide token in packed path/);

  const ok = pack(['dist/entrypoints/eslint/rules/no-direct-lucide/index.js']);
  const res = audit(ok, { baseline: baselineFrom(ok) });
  assert.deepEqual(res.failures, [], 'allowlisted ban-rule path must not fail');
});

test('lucide in shipped file CONTENT fails; allowlisted files are exempt', () => {
  const p = pack(['dist/ui/patterns/forms/filter-panel/index.js', 'contracts/runtime/suppliers/index.json']);
  const failing = audit(p, {
    baseline: baselineFrom(p),
    contents: {
      'dist/ui/patterns/forms/filter-panel/index.js': "import { X } from 'lucide-react';\n",
      'contracts/runtime/suppliers/index.json': '{ "supplier": "lucide-react" }',
    },
  });
  const joined = failing.failures.join('\n');
  assert.match(joined, /lucide token in shipped file content: dist\/ui\/patterns\/forms\/filter-panel/);
  assert.doesNotMatch(joined, /supplier-contract\.json.*content/);
});

test('a tenant fixture identifier in shipped CONTENT fails', () => {
  const p = pack(['dist/index.js']);
  const { failures } = audit(p, {
    baseline: baselineFrom(p),
    contents: { 'dist/index.js': 'export { tortureDarkBrandTheme } from "./fixtures";\n' },
  });
  assert.match(failures.join('\n'), /tortureDarkBrandTheme.*shipped file content/);
});

test('an unexpected new packed entry fails; an entry in the additions review passes', () => {
  // Headroom on size/count so this isolates the additions logic from the ratchet.
  const baseline = { files: [{ path: 'dist/index.js', size: 10 }], unpackedSize: 100000, entryCount: 100 };
  const grown = pack(['dist/index.js', 'dist/new-thing.js']);

  assert.match(audit(grown, { baseline }).failures.join('\n'), /unexpected new packed entry.*dist\/new-thing\.js/);
  assert.deepEqual(audit(grown, { baseline, additions: ['dist/new-thing.js'] }).failures, []);
});

test('total size growth fails; a shrink is a note, not a failure', () => {
  const baseline = baselineFrom(pack(['dist/index.js'], { unpackedSize: 1000, entryCount: 1 }));
  const grew = pack(['dist/index.js'], { unpackedSize: 1500, entryCount: 1 });
  assert.match(audit(grew, { baseline }).failures.join('\n'), /unpacked size grew: 1500 > baseline 1000/);

  const shrank = pack(['dist/index.js'], { unpackedSize: 800, entryCount: 1 });
  const res = audit(shrank, { baseline });
  assert.deepEqual(res.failures, []);
  assert.match(res.notes.join('\n'), /shrank/);
});

test('entry-count growth fails even when total size holds', () => {
  const baseline = baselineFrom(pack(['dist/a.js'], { unpackedSize: 1000, entryCount: 1 }));
  const p = pack(['dist/a.js', 'dist/b.js'], { unpackedSize: 900, entryCount: 2 });
  assert.match(audit(p, { baseline }).failures.join('\n'), /entry count grew: 2 > baseline 1/);
});

test('an unreadable packed file is a failure (cannot verify content)', () => {
  const p = pack(['dist/index.js']);
  const { failures } = audit(p, {
    baseline: baselineFrom(p),
    contents: { 'dist/index.js': new Error('EACCES') },
  });
  assert.match(failures.join('\n'), /cannot read packed file/);
});

test('forbidden tokens are derived from the real torture fixtures', () => {
  const tokens = collectForbiddenTenantTokens(packageRoot);
  for (const slug of ['themanagementmiami', 'torture-dark', 'torture-light', 'tortureDarkBrandTheme']) {
    assert.ok(tokens.all.has(slug), `expected derived tokens to include ${slug}`);
  }
  // The content set keeps unambiguous slugs but drops the bare English word.
  assert.ok(tokens.content.has('themanagementmiami'));
  assert.ok(tokens.content.has('tortureDarkBrandTheme'));
  assert.ok(!tokens.content.has('torture'), 'bare "torture" must not be a content token');
});

test('the shipped lucide allowlist covers the ban-rule subtree and the honesty contract', () => {
  const allow = loadLucideAllowlist(resolve(scriptDir, '../third-party-icon-allowlist/index.json'));
  assert.ok(allow.prefixes.includes('dist/entrypoints/eslint/'));
  assert.ok(allow.exacts.has('contracts/runtime/suppliers/index.json'));
  // The consumer CLI must NOT be allowlisted: since the ./icons wildcard became
  // Phosphor-only (ruling R1b) the shipped CLI carries zero 'lucide' tokens, and a
  // dead allowlist entry would reopen the door for the token to return unnoticed.
  assert.ok(!allow.exacts.has('dist/entrypoints/suppliers/cli/index.js'));
  assert.ok(!allow.exacts.has('dist/entrypoints/suppliers/cli/index.cjs'));
  const cliSource = readFileSync(resolve(findPackageRoot(scriptDir), 'src/entrypoints/suppliers/cli/index.mjs'), 'utf8');
  assert.ok(!/lucide/iu.test(cliSource), 'shipped consumer CLI must stay lucide-free');
});

const STALE_DIST_HERE = dirname(fileURLToPath(import.meta.url));

/* -------------------------------------------------------------------------- */
/* stale-dist holes                                                            */
/* -------------------------------------------------------------------------- */


const DECLARATION = 'dist/components/primitives/display/badge/compound/index.d.ts';
const RUNTIME = 'dist/components/primitives/display/badge/compound/index.js';

function stalePackOf(paths, { unpackedSize = 100, entryCount = paths.length } = {}) {
  return {
    name: '@rottay/design-system',
    version: '1.0.0',
    entryCount,
    unpackedSize,
    files: paths.map((path) => ({ path, size: 1 })),
  };
}

function staleAudit({ pack, baseline }) {
  return auditPackInventory({
    pack,
    baseline,
    additions: [],
    lucideAllow: { exacts: new Set(), prefixes: [] },
    forbiddenTokens: { all: new Set(), content: new Set() },
    readPackedFile: () => '',
  });
}

test('N11: a baselined public .d.ts that is no longer packed is a VIOLATION, not a shrink', () => {
  const baseline = {
    entryCount: 2,
    unpackedSize: 100,
    files: [{ path: DECLARATION, size: 1 }, { path: RUNTIME, size: 1 }],
  };
  const { failures, notes } = staleAudit({
    pack: stalePackOf([RUNTIME], { unpackedSize: 50, entryCount: 1 }),
    baseline,
  });
  assert.ok(
    failures.some((failure) => failure.includes('baselined public declaration is no longer packed')),
    `expected a declaration failure, got: ${JSON.stringify({ failures, notes })}`,
  );
  assert.equal(
    notes.some((note) => note.includes(`allowed shrink): ${DECLARATION}`)),
    false,
    'a missing declaration must not also be recorded as an allowed shrink',
  );
});

test('a non-declaration entry disappearing IS still an allowed shrink', () => {
  // The bound. Narrowing "allowed shrink" to exclude declarations must not turn
  // every removal into a failure, or the ratchet stops being decrease-only.
  const baseline = {
    entryCount: 2,
    unpackedSize: 100,
    files: [{ path: DECLARATION, size: 1 }, { path: RUNTIME, size: 1 }],
  };
  const { failures, notes } = staleAudit({
    pack: stalePackOf([DECLARATION], { unpackedSize: 50, entryCount: 1 }),
    baseline,
  });
  assert.deepEqual(failures, []);
  assert.ok(notes.some((note) => note.includes(`allowed shrink): ${RUNTIME}`)));
});

test('N12: packinv:write refuses while distfresh is red', () => {
  // A baseline seeded over a stale dist bakes the staleness in permanently:
  // whatever the stale pack was missing stops being required. The coupling is
  // asserted on the writer's source because running it shells out to
  // `npm pack --dry-run` over the real tree.
  const source = readFileSync(resolve(STALE_DIST_HERE, '../index.mjs'), 'utf8');
  const writeIndex = source.indexOf("if (mode === 'write')");
  const freshnessIndex = source.indexOf('assertDistFresh(');
  assert.ok(writeIndex >= 0, 'the writer branch must exist');
  assert.ok(freshnessIndex > writeIndex, 'the freshness check must run inside the writer branch');
  assert.match(source, /refusing to seed a baseline over a STALE dist/);
  // The SEED CALL, not the helper's declaration, is what must follow the
  // freshness check.
  const seedIndex = source.indexOf('writeFileSync(BASELINE_PATH');
  assert.ok(seedIndex > freshnessIndex, 'freshness must be proven BEFORE the baseline is written');
});

test('the pack ratchet still refuses growth in both size and entry count', () => {
  // Non-vacuity for the drills above: the ratchet must still be a ratchet.
  const baseline = { entryCount: 1, unpackedSize: 100, files: [{ path: RUNTIME, size: 1 }] };
  const grew = staleAudit({
    pack: stalePackOf([RUNTIME, DECLARATION], { unpackedSize: 200, entryCount: 2 }),
    baseline,
  });
  assert.ok(grew.failures.some((failure) => failure.includes('pack unpacked size grew')));
  assert.ok(grew.failures.some((failure) => failure.includes('pack entry count grew')));
  assert.ok(grew.failures.some((failure) => failure.includes('unexpected new packed entry')));
});
