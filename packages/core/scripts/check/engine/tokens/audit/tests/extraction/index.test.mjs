import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { packageRoot, repoRoot as findRepoRoot } from '../../../../../../libraries/repo-root/index.mjs';
import * as paths from '../../context/paths/index.mjs';

const AUDIT_DIR = join(dirname(fileURLToPath(import.meta.url)), '../..');
const COORDINATOR = join(AUDIT_DIR, 'index.mjs');
const BASELINE = join(AUDIT_DIR, 'baseline/index.json');

function authoredSources(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) return ['tests', 'baseline'].includes(entry.name) ? [] : authoredSources(full);
    return entry.name.endsWith('.mjs') ? [full] : [];
  });
}

test('every path keeps the authority the single-file audit resolved from its own directory', () => {
  const root = packageRoot(AUDIT_DIR);
  const repoRoot = findRepoRoot(AUDIT_DIR);
  assert.equal(paths.auditDir, AUDIT_DIR);
  assert.equal(paths.root, root);
  assert.equal(relative(repoRoot, root), 'packages/core');
  assert.equal(paths.repoRoot, repoRoot);
  assert.equal(paths.baselinePath, BASELINE);
  assert.equal(paths.componentsDir, join(root, 'src/components'));
  assert.equal(paths.tokensCssDir, join(root, 'src/foundation/tokens/css'));
  assert.equal(paths.artifactsDir, join(root, 'src/foundation/tokens/css/facade/artifacts'));
  assert.equal(paths.foundationDir, join(root, 'src/foundation/tokens/css/foundation'));
  assert.equal(paths.themeCssPath, join(root, 'src/foundation/tokens/css/runtime/engines/modern/theme/index.css'));
  assert.equal(paths.tokenAuditDir, join(repoRoot, 'packages/core/artifacts/quality/audits/engine/tokens'));
  assert.ok(existsSync(paths.baselinePath));
});

test('the coordinator stays thin and no owned module grows back into a monolith', () => {
  const coordinator = readFileSync(COORDINATOR, 'utf8');
  assert.ok(coordinator.split('\n').length <= 150, 'index.mjs is the CLI coordinator only');
  assert.doesNotMatch(coordinator, /\bfunction\s/u, 'index.mjs declares no counting or reporting logic');
  for (const file of authoredSources(AUDIT_DIR)) {
    const lineCount = readFileSync(file, 'utf8').split('\n').length;
    assert.ok(lineCount <= 800, `${relative(AUDIT_DIR, file)} has ${lineCount} lines`);
  }
});

function ignoredPaths(files) {
  const result = spawnSync('git', ['check-ignore', '--no-index', ...files], { cwd: AUDIT_DIR, encoding: 'utf8' });
  assert.ok(result.status === 0 || result.status === 1, result.stderr);
  return result.stdout.split('\n').filter(Boolean);
}

test('no audit source is hidden from git by an ignore rule', () => {
  const ignoredControl = join(AUDIT_DIR, 'reports/coverage/index.mjs');
  assert.deepEqual(ignoredPaths([ignoredControl]), [ignoredControl], 'the probe detects an ignored module path');
  const sources = [...authoredSources(AUDIT_DIR), ...authoredSources(join(AUDIT_DIR, 'tests'))];
  assert.ok(sources.includes(join(AUDIT_DIR, 'reports/token-coverage/index.mjs')));
  assert.ok(sources.includes(join(AUDIT_DIR, 'tests/extraction/index.test.mjs')));
  assert.deepEqual(ignoredPaths(sources), []);
});

test('each counting and reporting function has exactly one owner', () => {
  const owners = new Map();
  for (const file of authoredSources(AUDIT_DIR)) {
    for (const match of readFileSync(file, 'utf8').matchAll(/^(?:export\s+)?function\s+(\w+)/gmu)) {
      owners.set(match[1], [...(owners.get(match[1]) ?? []), relative(AUDIT_DIR, file)]);
    }
  }
  const duplicated = [...owners].filter(([, files]) => files.length > 1);
  assert.deepEqual(duplicated, []);
});

test('the executable path emits the counter map first-key-first and refuses a drill-fixture baseline write', () => {
  const current = spawnSync(process.execPath, [COORDINATOR, '--current-json', '--quiet'], { encoding: 'utf8' });
  assert.equal(current.status, 0, current.stderr);
  const counters = JSON.parse(current.stdout);
  assert.equal(Object.keys(counters)[0], 'motion.cubicBezierLiterals');
  assert.ok(Object.keys(counters).includes('scale.duplicateRootRosterDrift'));

  const sandbox = mkdtempSync(join(tmpdir(), 'engine-audit-extraction-'));
  try {
    const fixture = join(sandbox, 'probe.tsx');
    writeFileSync(fixture, 'export const P = () => null;\n');
    const before = createHash('sha256').update(readFileSync(BASELINE)).digest('hex');
    const refused = spawnSync(
      process.execPath,
      [COORDINATOR, '--update-baseline', '--quiet', `--gat07-evasion-fixture=${fixture}`],
      { encoding: 'utf8' },
    );
    assert.equal(refused.status, 1);
    assert.match(refused.stderr, /--update-baseline cannot run with a drill fixture/u);
    assert.equal(createHash('sha256').update(readFileSync(BASELINE)).digest('hex'), before);
  } finally {
    rmSync(sandbox, { recursive: true, force: true });
  }
});
