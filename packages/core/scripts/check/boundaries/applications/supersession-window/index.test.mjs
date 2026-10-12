/**
 * NEGATIVE DRILLS for the supersession-window receiver.
 *
 * The gate has one green and many reds, and the dangerous failure is a red
 * that reads as the wrong red: an ABSENT consumer reported as a migrated one
 * closes the window on a consumer nobody read. Every drill builds its own
 * throwaway Git repository; none reads a sibling checkout or the ambient
 * `APP_BITHIRE_ROOT`.
 */

import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { packageRoot as findPackageRoot, repoRoot as findRepoRoot } from '../../../../libraries/repo-root/index.mjs';
import { SURFACE_CAPABILITY_PINS } from '../../../../libraries/taxonomy/surfaces/index.mjs';
import {
  checkWorkflowReceiver,
  NAMED_CONSUMERS,
  readConsumer,
  readRoster,
  readSupersededPairs,
  SHELL_CONTRACTS_PATH,
  WINDOW_OPEN,
  WORKFLOW_PATH,
} from './index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const GATE = join(HERE, 'index.mjs');
const ENTRY = NAMED_CONSUMERS[0];
const PAIRS = readSupersededPairs(readFileSync(join(findPackageRoot(HERE), SHELL_CONTRACTS_PATH), 'utf8'));
const [SUPERSEDED, CANONICAL] = PAIRS[0];

function tempDirectory(prefix) {
  const directory = realpathSync(mkdtempSync(join(tmpdir(), `${prefix}-`)));
  test.after(() => rmSync(directory, { recursive: true, force: true }));
  return directory;
}

function git(root, args) {
  return execFileSync(
    'git',
    ['-C', root, '-c', 'user.name=drill', '-c', 'user.email=drill@example.invalid', '-c', 'commit.gpgsign=false', ...args],
    { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
  ).trim();
}

/** A consumer checkout with one commit; `css: null` commits the repository without the rostered file. */
function plantCheckout(css) {
  const root = tempDirectory('supersession-window');
  git(root, ['init', '--quiet']);
  writeFileSync(join(root, 'package.json'), '{}\n');
  if (css !== null) {
    mkdirSync(dirname(join(root, ENTRY.path)), { recursive: true });
    writeFileSync(join(root, ENTRY.path), css);
  }
  git(root, ['add', '-A']);
  git(root, ['commit', '--quiet', '-m', 'consumer']);
  return { root, head: git(root, ['rev-parse', 'HEAD']) };
}

const verdictOf = (reading) => readRoster(PAIRS, () => reading).verdict;
const readAt = (root, pin) => readConsumer(ENTRY, { env: { [ENTRY.rootEnv]: root }, pins: { [ENTRY.repository]: pin } });

function assertAbsent(reading, detail) {
  assert.equal(reading.state, 'absent');
  assert.match(reading.detail, detail);
  const verdict = verdictOf(reading);
  assert.notEqual(verdict, WINDOW_OPEN);
  assert.match(verdict, /roster UNREADABLE/);
  assert.match(verdict, /ABSENT/);
  assert.doesNotMatch(verdict, /trigger PASSED/);
}

test('the contract source yields the fourteen superseded pairs', () => {
  assert.equal(PAIRS.length, 14);
  for (const [superseded, canonical] of PAIRS) {
    assert.match(superseded, /^--ds-shell-/);
    assert.equal(canonical, superseded.replace('--ds-shell-', '--ds-app-shell-'));
  }
});

test('DRILL: an empty or unreadable pair map is refused, never read as "nothing superseded"', () => {
  assert.throws(() => readSupersededPairs('export const SHELL_SUPERSEDED_HOOK_CHANNELS = {} as const;'), /is empty/);
  assert.throws(() => readSupersededPairs('export const OTHER = {};'), /is not an object literal/);
  assert.throws(
    () => readSupersededPairs('const rest = {}; export const SHELL_SUPERSEDED_HOOK_CHANNELS = { ...rest };'),
    /cannot read/,
  );
});

test('GREEN: a pinned checkout that still authors a superseded spelling keeps the window open', () => {
  const { root, head } = plantCheckout(`.shell{${SUPERSEDED}:0}`);
  const reading = readAt(root, head);
  assert.equal(reading.state, 'present');
  assert.equal(reading.revision, head);
  assert.equal(verdictOf(reading), WINDOW_OPEN);
});

test('DRILL: a pinned checkout that authors only the canonical spelling passes the trigger, which is red', () => {
  const { root, head } = plantCheckout(`.shell{${CANONICAL}:0}`);
  const verdict = verdictOf(readAt(root, head));
  assert.match(verdict, /trigger PASSED/);
  assert.notEqual(verdict, WINDOW_OPEN);
});

test('DRILL: an undeclared or blank root is ABSENT, with no sibling fallback', () => {
  const pins = { [ENTRY.repository]: SURFACE_CAPABILITY_PINS[ENTRY.repository] };
  assertAbsent(readConsumer(ENTRY, { env: {}, pins }), /is not declared/);
  assertAbsent(readConsumer(ENTRY, { env: { [ENTRY.rootEnv]: '  ' }, pins }), /is not declared/);
  assertAbsent(readConsumer(ENTRY, { env: { [ENTRY.rootEnv]: 'app-bithire' }, pins }), /not an absolute path/);
});

test('DRILL: a declared root that is not on disk is ABSENT', () => {
  const { root, head } = plantCheckout(`.shell{${SUPERSEDED}:0}`);
  assertAbsent(readAt(`${root}-not-checked-out`, head), /names no checked-out repository/);
});

test('DRILL: a directory with the right file but no Git identity is ABSENT, even nested in a repository', () => {
  const { root, head } = plantCheckout(`.shell{${SUPERSEDED}:0}`);
  const nested = join(root, 'export');
  mkdirSync(dirname(join(nested, ENTRY.path)), { recursive: true });
  writeFileSync(join(nested, ENTRY.path), `.shell{${SUPERSEDED}:0}`);
  assertAbsent(readAt(nested, head), /revision cannot be identified/);

  const bare = tempDirectory('supersession-window-export');
  mkdirSync(dirname(join(bare, ENTRY.path)), { recursive: true });
  writeFileSync(join(bare, ENTRY.path), `.shell{${SUPERSEDED}:0}`);
  assertAbsent(readAt(bare, head), /revision cannot be identified/);
});

test('DRILL: a checkout at any revision but the pin is a MISMATCH, whatever it authors', () => {
  const { root, head } = plantCheckout(`.shell{${SUPERSEDED}:0}`);
  writeFileSync(join(root, 'package.json'), '{"moved":true}\n');
  git(root, ['commit', '--quiet', '-am', 'moved on']);
  assertAbsent(readAt(root, head), /revision MISMATCH/);
  assertAbsent(readAt(root, 'f'.repeat(40)), /revision MISMATCH/);
  assertAbsent(readAt(root, 'main'), /no full-SHA pin/);
});

test('DRILL: a rostered file missing at the pinned revision is ABSENT, never migrated', () => {
  const { root, head } = plantCheckout(null);
  assertAbsent(readAt(root, head), /rostered file missing at the pinned revision/);
});

test('DRILL: uncommitted edits in the checkout neither close nor open the window', () => {
  const open = plantCheckout(`.shell{${SUPERSEDED}:0}`);
  writeFileSync(join(open.root, ENTRY.path), `.shell{${CANONICAL}:0}`);
  assert.equal(verdictOf(readAt(open.root, open.head)), WINDOW_OPEN);

  const migrated = plantCheckout(`.shell{${CANONICAL}:0}`);
  writeFileSync(join(migrated.root, ENTRY.path), `.shell{${SUPERSEDED}:0}`);
  assert.match(verdictOf(readAt(migrated.root, migrated.head)), /trigger PASSED/);
});

test('DRILL: an empty roster is unreadable, not a passed trigger', () => {
  const { verdict } = readRoster(PAIRS, () => assert.fail('nothing to read'), []);
  assert.match(verdict, /ABSENT/);
  assert.doesNotMatch(verdict, /trigger PASSED/);
});

test('the live workflow checks the consumer out at the pin and runs this gate', () => {
  const workflow = readFileSync(join(findRepoRoot(HERE), WORKFLOW_PATH), 'utf8');
  assert.deepEqual(checkWorkflowReceiver(workflow), []);
});

test('DRILL: a workflow that drifts from the pin, drops the checkout or drops the step is refused', () => {
  const workflow = readFileSync(join(findRepoRoot(HERE), WORKFLOW_PATH), 'utf8');
  const pin = SURFACE_CAPABILITY_PINS[ENTRY.repository];

  const drifted = workflow.replace(`ref: ${pin}`, `ref: ${'0'.repeat(40)}`);
  assert.notEqual(drifted, workflow);
  assert.match(checkWorkflowReceiver(drifted).join('\n'), /not the pinned/);

  const floating = workflow.replace(`ref: ${pin}`, 'ref: main');
  assert.match(checkWorkflowReceiver(floating).join('\n'), /at main, not the pinned/);

  const unpinned = workflow.replace(new RegExp(`^\\s*ref: ${pin}\\n`, 'm'), '');
  assert.match(checkWorkflowReceiver(unpinned).join('\n'), /at null, not the pinned/);

  const uncloned = workflow.replaceAll(`repository: ${ENTRY.workflowRepository}`, 'repository: rottay/elsewhere');
  assert.match(checkWorkflowReceiver(uncloned).join('\n'), /never checks out/);

  const unwired = workflow.replaceAll('supersession-window/index.mjs', 'retired/index.mjs');
  assert.match(checkWorkflowReceiver(unwired).join('\n'), /no step that runs/);
});

test('DRILL: the command line fails closed on an absent or unidentified checkout', () => {
  const run = (environment) => {
    const env = { ...process.env, ...environment };
    // An ambient root must not stand in for the one a drill declares.
    if (!Object.hasOwn(environment, ENTRY.rootEnv)) delete env[ENTRY.rootEnv];
    return spawnSync(process.execPath, [GATE, '--check'], { encoding: 'utf8', env });
  };

  const undeclared = run({});
  assert.equal(undeclared.status, 1, undeclared.stdout + undeclared.stderr);
  assert.match(undeclared.stderr, /ABSENT/);
  assert.match(undeclared.stderr, /is not declared/);
  assert.doesNotMatch(undeclared.stdout + undeclared.stderr, /trigger PASSED/);

  const { root } = plantCheckout(`.shell{${SUPERSEDED}:0}`);
  const wrongRevision = run({ [ENTRY.rootEnv]: root });
  assert.equal(wrongRevision.status, 1, wrongRevision.stdout + wrongRevision.stderr);
  assert.match(wrongRevision.stderr, /revision MISMATCH/);

  const missing = run({ [ENTRY.rootEnv]: `${root}-not-checked-out` });
  assert.equal(missing.status, 1, missing.stdout + missing.stderr);
  assert.match(missing.stderr, /names no checked-out repository/);
});
