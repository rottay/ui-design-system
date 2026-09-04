/**
 * Drills for the tokens-catalog gate: each `--drill=<case>` self-injects
 * one synthetic violation and the check MUST exit non-zero naming it.
 *
 * The FASE G drills guard the two claims the per-token catalog makes that no
 * aggregate view could make before it: every corpus name has exactly one row
 * (`omit-family`), and the operational tree never carries a debt name
 * (`mix-status`). A catalog that silently drops a family while still printing
 * a coverage assertion is worse than no catalog at all, so both are red-tested
 * rather than trusted.
 */
import { spawnSync } from 'node:child_process';
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  realpathSync,
  statSync,
  symlinkSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import test from 'node:test';
import { packageRoot as findPackageRoot } from '../../../../../libraries/repo-root/index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = findPackageRoot(HERE);
const SCRIPT = join(ROOT, 'scripts/generate/tokens/customization/catalog/index.mjs');
const DOCS = resolve(ROOT, '../../../docs-engineering/engineering/design-system/tokens');

function run(...args) {
  const result = spawnSync(process.execPath, [SCRIPT, ...args], {
    cwd: ROOT,
    encoding: 'utf8',
  });
  return { status: result.status, out: `${result.stdout}\n${result.stderr}` };
}

/** Every `--ds-*` row emitted by the family pages of one tree. */
function pageNames(tree) {
  const dir = join(DOCS, tree, 'families');
  const names = [];
  for (const file of readdirSync(dir).sort()) {
    if (!file.endsWith('.md')) continue;
    for (const line of readFileSync(join(dir, file), 'utf8').split('\n')) {
      const match = /^\| `(--ds-[a-z0-9-]+)` \|/.exec(line);
      if (match) names.push({ name: match[1], file: `${tree}/families/${file}` });
    }
  }
  return names;
}

/**
 * The EXACT residual the sibling `docs-engineering` checkout carries today, in
 * the generator's own normalized wording. Four files, named one by one: an
 * extra, a missing, a renamed or a differently-categorized residual all fail
 * here, where a category pattern would have absorbed every one of them.
 *
 * C2 added the two `governance/families` pages. `--ds-experience-profile` and
 * `--ds-recipe-profile` were always emitted, by an `export const … = (…) => {}`
 * arrow the emitter scans could not reach; the lowering's orchestration is a
 * function declaration, so the census now sees them and files each on its
 * family page. Writing those pages means writing into `docs-engineering`, which
 * is a separate repository and outside this lot's scope — so the debt is pinned
 * here, exactly, rather than deferred by category or waved through.
 */
const CROSS_REPO_RESIDUAL = [
  'stale/missing generated view: tokens/governance/families/experience.md — run pnpm tokens:catalog:write',
  'stale/missing generated view: tokens/governance/families/recipe.md — run pnpm tokens:catalog:write',
  'stale/missing generated view: tokens/README.md — run pnpm tokens:catalog:write',
  'stale/missing generated view: tokens/governance/lifecycle-and-deprecations.md — run pnpm tokens:catalog:write',
];

test('positive: the catalog check passes on the real tree', () => {
  // The IN-REPO check is the one this package owns, and it must be green.
  const { status, out } = run('--check', '--in-repo-only');
  assert.equal(status, 0, out);

  // The full `--check` additionally audits the sibling `docs-engineering`
  // checkout, whose freshness this package cannot write. It is still RUN and
  // nothing is deferred: the residual it reports is pinned file by file, so it
  // can neither grow nor change category without reddening this gate.
  const full = run('--check');
  assert.equal(full.out.includes('DEFERRED (cross-repo'), false, full.out);

  const failures = full.out
    .split(String.fromCharCode(10))
    .filter((line) => line.includes('tokens-catalog FAIL'))
    .map((line) => line.replace(/^.*FAIL — /, ''));

  assert.deepEqual(failures, CROSS_REPO_RESIDUAL, full.out);
  assert.equal(full.status, 1, full.out);
});

test('positive: the two trees cover the census exactly once, and never mix', () => {
  const report = JSON.parse(readFileSync(join(ROOT, 'scripts/generate/tokens/customization/surface/report/index.json'), 'utf8'));
  const operational = new Set(['active', 'app-slot', 'adjudicated-live']);
  const emitted = [...pageNames('catalog'), ...pageNames('governance')];

  const seen = new Map();
  for (const row of emitted) {
    assert.ok(report.rows[row.name], `${row.name} is on a page but not in the census`);
    assert.equal(seen.has(row.name), false, `${row.name} appears twice (${row.file})`);
    seen.set(row.name, row.file);
  }
  for (const name of Object.keys(report.rows)) {
    assert.ok(seen.has(name), `${name} is in the census but on no family page`);
    const tree = seen.get(name).startsWith('catalog/') ? 'catalog' : 'governance';
    const expected = operational.has(report.rows[name].status) ? 'catalog' : 'governance';
    assert.equal(tree, expected, `${name} (${report.rows[name].status}) landed in the ${tree} tree`);
  }
  assert.equal(seen.size, Object.keys(report.rows).length);
});

test('drill: a derivation cycle fails', () => {
  const { status, out } = run('--drill=cycle');
  assert.notEqual(status, 0);
  assert.match(out, /derivation cycle/);
});

test('drill: a public hook without owner metadata fails', () => {
  const { status, out } = run('--drill=hook-owner');
  assert.notEqual(status, 0);
  assert.match(out, /without owner/);
});

test('drill: an active capability with a channel unknown to the census fails', () => {
  const { status, out } = run('--drill=unknown-channel');
  assert.notEqual(status, 0);
  assert.match(out, /unknown to the census/);
});

test('drill: an unadjudicated dual-authority family fails', () => {
  const { status, out } = run('--drill=dual-authority');
  assert.notEqual(status, 0);
  assert.match(out, /dual authority/);
});

test('drill: stale generated docs fail', () => {
  const { status, out } = run('--drill=stale');
  assert.notEqual(status, 0);
  assert.match(out, /stale\/missing generated view/);
});

test('drill: a reconciliation not derived from the current report fails', () => {
  const { status, out } = run('--drill=recon-digest');
  assert.notEqual(status, 0);
  assert.match(out, /reconciliation digest mismatch/);
});

test('drill: dropping one family from the catalog fails coverage-100', () => {
  const { status, out } = run('--drill=omit-family');
  assert.notEqual(status, 0);
  assert.match(out, /coverage-100: \d+ corpus name\(s\) appear on no family page/);
});

test('drill: a dead name inside the operational corpus fails no-mixing', () => {
  const { status, out } = run('--drill=mix-status');
  assert.notEqual(status, 0);
  assert.match(out, /no-mixing: \d+ governance-status name\(s\) inside the operational catalog/);
});

/* -------------------------------------------------------------------------- */
/* --in-repo-only                                                             */
/* -------------------------------------------------------------------------- */

/**
 * `--write` reaches into the SIBLING repository: it creates
 * `docs-engineering/engineering/design-system/tokens`, writes every generated
 * view there, and `unlinkSync`s every `.md` under the two family prefixes the
 * run did not produce. Measured read-only that is up to 343 files written and
 * up to 332 prune-eligible, landing on whatever uncommitted state that
 * repository happens to be carrying. `--check` is not a preview of it: it names
 * the one view that is stale, while `--write` rewrites all of them.
 *
 * These drills pin that `--in-repo-only` performs ZERO writes outside
 * `packages/core`, and that the checks it defers are named rather than dropped.
 */
const DOCS_TOKENS_DIR = resolve(
  findPackageRoot(HERE),
  '../../../docs-engineering/engineering/design-system/tokens',
);

function snapshotDocs() {
  if (!existsSync(DOCS_TOKENS_DIR)) return null;
  const entries = [];
  const walk = (dir) => {
    for (const name of readdirSync(dir).sort()) {
      const absolute = join(dir, name);
      const info = statSync(absolute);
      if (info.isDirectory()) {
        walk(absolute);
        continue;
      }
      entries.push([absolute, info.size, info.mtimeMs].join(' '));
    }
  };
  walk(DOCS_TOKENS_DIR);
  return entries.join(String.fromCharCode(10));
}

/** The one directory chain whose leaf `--write --in-repo-only` writes into. */
const WRITE_PATH = ['scripts', 'generate', 'tokens', 'customization', 'catalog'];
const RECONCILIATION = join(ROOT, ...WRITE_PATH, 'reconciliation', 'index.json');

/**
 * A throwaway package tree the generator can WRITE into.
 *
 * Everything it reads is symlinked at whatever depth is not on the write path,
 * so the fixture costs a few dozen links instead of the ~180M the real package
 * weighs; only the directories leading to the write target are real, because a
 * write through a symlinked directory lands in the real tree. The generator's
 * own module is COPIED rather than linked: Node resolves an ESM symlink to its
 * realpath, so a linked entrypoint would compute the real package root and
 * write there — the exact defect this fixture exists to prevent. `realpathSync`
 * on the sandbox is what makes `import.meta.url === argv[1]` hold on macOS,
 * where the temp directory is itself a symlink.
 */
function isolatedPackageTree() {
  const sandbox = realpathSync(mkdtempSync(join(tmpdir(), 'tokens-catalog-write-')));
  const root = join(sandbox, 'packages', 'core');
  const link = (from, to) =>
    symlinkSync(from, to, statSync(from).isDirectory() ? 'dir' : 'file');
  const linkSiblings = (relDir, keep) => {
    const from = relDir ? join(ROOT, relDir) : ROOT;
    const to = relDir ? join(root, relDir) : root;
    mkdirSync(to, { recursive: true });
    for (const entry of readdirSync(from)) {
      if (entry !== keep) link(join(from, entry), join(to, entry));
    }
  };
  let prefix = '';
  for (const segment of WRITE_PATH) {
    linkSiblings(prefix, segment);
    prefix = prefix ? `${prefix}/${segment}` : segment;
  }
  const catalogFrom = join(ROOT, ...WRITE_PATH);
  const catalogTo = join(root, ...WRITE_PATH);
  mkdirSync(catalogTo, { recursive: true });
  for (const entry of readdirSync(catalogFrom)) {
    if (entry === 'reconciliation') continue;
    if (entry === 'index.mjs') cpSync(join(catalogFrom, entry), join(catalogTo, entry));
    else link(join(catalogFrom, entry), join(catalogTo, entry));
  }
  return { sandbox, root, script: join(catalogTo, 'index.mjs'), catalogTo };
}

test('--in-repo-only writes nothing outside packages/core', () => {
  // HERMETIC: the write case runs against a throwaway tree. Running it against
  // the worktree made a TEST the producer of a committed artifact -- a stale
  // reconciliation would be silently rewritten here and `--check` would then
  // pass on something no official command produced.
  const docsBefore = snapshotDocs();
  const committedBefore = readFileSync(RECONCILIATION, 'utf8');

  const { sandbox, root, script, catalogTo } = isolatedPackageTree();
  const result = spawnSync(process.execPath, [script, '--write', '--in-repo-only'], {
    cwd: root,
    encoding: 'utf8',
  });
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stdout, /--in-repo-only — wrote .* and NOTHING under/);

  // 1. it wrote INSIDE the sandbox, and the bytes are the committed artifact's,
  //    which is what makes the worktree copy provably fresh without producing it
  const produced = join(catalogTo, 'reconciliation', 'index.json');
  assert.ok(existsSync(produced), 'the sandbox run produced no reconciliation');
  assert.equal(
    readFileSync(produced, 'utf8'),
    committedBefore,
    'the official reconciliation artifact is not what the generator produces',
  );

  // 2. the sandbox's OWN sibling-docs location was never created, so the
  //    cross-repo branch did not run even where it would have been harmless
  assert.equal(
    existsSync(join(sandbox, 'docs-engineering')),
    false,
    '--in-repo-only reached the cross-repo write branch',
  );

  // 3. and the real worktree is invariant: neither the sibling documentation
  //    tree nor the committed artifact moved a byte
  assert.equal(
    snapshotDocs(),
    docsBefore,
    'the sibling documentation tree must be byte-for-byte untouched',
  );
  assert.equal(
    readFileSync(RECONCILIATION, 'utf8'),
    committedBefore,
    'the drill must not write the real reconciliation artifact',
  );
});

test('--in-repo-only defers the cross-repo checks BY NAME, never silently', () => {
  const result = spawnSync(
    process.execPath,
    [join(HERE, '../index.mjs'), '--check', '--in-repo-only'],
    { cwd: findPackageRoot(HERE), encoding: 'utf8' },
  );
  assert.equal(result.status, 0, result.stdout + result.stderr);
  const deferred = result.stdout.split(String.fromCharCode(10)).filter((line) => line.includes('DEFERRED (cross-repo'));
  assert.equal(deferred.length, 3, result.stdout);
  assert.ok(deferred.some((line) => line.includes('docs staleness')));
  assert.ok(deferred.some((line) => line.includes('orphan family pages')));
  assert.ok(deferred.some((line) => line.includes('hand-written guide')));
});

test('the full --check still owns the cross-repo checks; the flag is the only way to defer them', () => {
  // Anti-weakening: if the deferral leaked into the default path, the gate
  // would have quietly stopped measuring the sibling repository everywhere.
  const source = readFileSync(join(HERE, '../index.mjs'), 'utf8');
  assert.match(source, /if \(inRepoOnly\) \{/);
  assert.match(source, /if \(!inRepoOnly\) \{/);
  assert.match(source, /deferredCrossRepo\.push\(/);
  const full = spawnSync(process.execPath, [join(HERE, '../index.mjs'), '--check'], {
    cwd: findPackageRoot(HERE),
    encoding: 'utf8',
  });
  assert.equal(
    full.stdout.includes('DEFERRED (cross-repo'),
    false,
    'the full --check must not report deferrals',
  );
});
