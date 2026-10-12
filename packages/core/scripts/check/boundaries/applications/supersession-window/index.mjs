#!/usr/bin/env node

/**
 * SUPERSESSION-WINDOW RECEIVER — the consumer half of WO-FAM-11's app-shell
 * supersession window, read from an IDENTIFIED checkout of the named consumer.
 *
 * WHAT THIS ENFORCES
 * ------------------
 * `SHELL_SUPERSEDED_HOOK_CHANNELS` keeps fourteen public hook names assignable
 * under their retired spelling for as long as a named consumer still authors
 * one. This gate reads the roster and returns one of three verdicts:
 *
 *   window open      a rostered consumer still authors a superseded spelling.
 *                    The only green.
 *   roster UNREADABLE  a rostered consumer could not be read at the pinned
 *                    revision. ABSENT is never "migrated": a consumer that
 *                    moved cannot be mistaken for a consumer that migrated.
 *   trigger PASSED   every named consumer authors the canonical spelling.
 *                    Red on good news: delete `SHELL_SUPERSEDED_HOOK_CHANNELS`,
 *                    the first arm of each skin read, the fourteen superseded
 *                    hook rows, the in-repo unit suite and this gate.
 *
 * The in-repo half of the window (producer, skin arms, public hooks) is the unit
 * suite `shell-superseded-window.test.ts`; this gate owns the consumer read.
 *
 * THE CHECKOUT IS IDENTIFIED, NOT DISCOVERED
 * ------------------------------------------
 *   root      `APP_BITHIRE_ROOT`, declared. There is NO sibling fallback: an
 *             undeclared root is ABSENT, not a reason to go and find a tree.
 *   revision  `SURFACE_CAPABILITY_PINS['app-bithire']` in
 *             `scripts/libraries/taxonomy/surfaces/index.mjs`, the one reviewed
 *             map of sibling revisions. The checkout's HEAD must equal it, and
 *             so must the `ref:` `.github/workflows/ci.yml` checks out.
 *   bytes     `git show <pin>:<path>` — the committed blob. Uncommitted edits
 *             in the checkout can neither open nor close the window.
 *
 * Usage:
 *   APP_BITHIRE_ROOT=<checkout> node scripts/check/boundaries/applications/supersession-window/index.mjs [--check]
 */

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, realpathSync, statSync } from 'node:fs';
import { dirname, isAbsolute, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import ts from 'typescript';

import { packageRoot as findPackageRoot, repoRoot as findRepoRoot } from '../../../../libraries/repo-root/index.mjs';
import { SURFACE_CAPABILITY_PINS } from '../../../../libraries/taxonomy/surfaces/index.mjs';

const SCRIPT_PATH = fileURLToPath(import.meta.url);
const HERE = dirname(SCRIPT_PATH);
const CORE_ROOT = findPackageRoot(HERE);
const REPO_ROOT = findRepoRoot(HERE);

export const GATE_NAME = 'supersession-window';
export const SHELL_CONTRACTS_PATH = 'src/components/structures/foundation/shell-contracts/index.ts';
export const SUPERSEDED_MAP_NAME = 'SHELL_SUPERSEDED_HOOK_CHANNELS';
export const WORKFLOW_PATH = '.github/workflows/ci.yml';
export const WINDOW_OPEN = 'window open';

const FULL_COMMIT = /^[0-9a-f]{40}$/;

/** Each rostered consumer names its repository, the variable that roots it and the file that proves it. */
export const NAMED_CONSUMERS = Object.freeze([
  Object.freeze({
    id: 'app-bithire/vertical shell app-layout',
    repository: 'app-bithire',
    workflowRepository: 'rottay/app-bithire',
    rootEnv: 'APP_BITHIRE_ROOT',
    path: 'src/vertical/surface/shell/app-layout/styles/index.css',
  }),
]);

/**
 * The superseded -> canonical pairs, read from the contract source. Parsed, not
 * imported: the contract is TypeScript and this gate runs before any build.
 */
export function readSupersededPairs(source) {
  const file = ts.createSourceFile('shell-contracts.ts', source, ts.ScriptTarget.Latest, true);
  let literal = null;
  const visit = (node) => {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.name.text === SUPERSEDED_MAP_NAME) {
      let initializer = node.initializer;
      while (initializer && (ts.isAsExpression(initializer) || ts.isSatisfiesExpression(initializer))) {
        initializer = initializer.expression;
      }
      if (initializer && ts.isObjectLiteralExpression(initializer)) literal = initializer;
    }
    ts.forEachChild(node, visit);
  };
  visit(file);
  if (!literal) throw new Error(`${SUPERSEDED_MAP_NAME} is not an object literal in ${SHELL_CONTRACTS_PATH}`);

  const pairs = [];
  for (const property of literal.properties) {
    if (
      !ts.isPropertyAssignment(property)
      || !ts.isStringLiteralLike(property.name)
      || !ts.isStringLiteralLike(property.initializer)
    ) {
      throw new Error(`${SUPERSEDED_MAP_NAME} holds a row this gate cannot read: ${property.getText(file)}`);
    }
    pairs.push([property.name.text, property.initializer.text]);
  }
  // An empty map would read every consumer as migrated.
  if (pairs.length === 0) throw new Error(`${SUPERSEDED_MAP_NAME} is empty: there is no window to measure`);
  return pairs;
}

function git(root, args) {
  return execFileSync('git', ['-C', root, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
}

const absent = (detail) => ({ state: 'absent', detail });

/**
 * Read one rostered consumer from its declared checkout at its pinned revision.
 *
 * `env` and `pins` are parameters so the drills can prove every arm without
 * touching the real environment or the real pin. Every failure to identify the
 * checkout reads ABSENT; nothing here falls back to another tree.
 */
export function readConsumer(entry, { env = process.env, pins = SURFACE_CAPABILITY_PINS } = {}) {
  const pin = pins[entry.repository];
  if (typeof pin !== 'string' || !FULL_COMMIT.test(pin)) {
    return absent(`no full-SHA pin recorded for ${entry.repository}`);
  }
  if (!Object.hasOwn(env, entry.rootEnv) || typeof env[entry.rootEnv] !== 'string' || env[entry.rootEnv].trim() === '') {
    return absent(`${entry.rootEnv} is not declared; this gate never falls back to a sibling worktree`);
  }
  const root = env[entry.rootEnv].trim();
  if (!isAbsolute(root)) return absent(`${entry.rootEnv} is not an absolute path: ${root}`);
  if (!existsSync(root) || !statSync(root).isDirectory()) {
    return absent(`${entry.rootEnv} names no checked-out repository: ${root}`);
  }

  let head;
  try {
    // A plain directory nested in another repository resolves to THAT repository.
    const toplevel = git(root, ['rev-parse', '--show-toplevel']).trim();
    if (realpathSync(toplevel) !== realpathSync(root)) throw new Error('not a checkout root');
    head = git(root, ['rev-parse', 'HEAD']).trim();
  } catch {
    return absent(`${root} is not a Git checkout, so its revision cannot be identified`);
  }
  if (head !== pin) {
    return absent(`revision MISMATCH: checkout HEAD ${head} is not the pinned ${pin}`);
  }

  let source;
  try {
    source = git(root, ['show', `${pin}:${entry.path}`]);
  } catch {
    return absent(`rostered file missing at the pinned revision: ${pin}:${entry.path}`);
  }
  return { state: 'present', source, root, revision: head };
}

/**
 * Three readings, three verdicts: unreadable roster, window open, trigger passed.
 * Only the middle one is green, so both ends of the window fail closed.
 */
export function readRoster(pairs, read, consumers = NAMED_CONSUMERS) {
  const missing = [];
  const authored = [];
  for (const entry of consumers) {
    const reading = read(entry);
    if (reading.state === 'absent') {
      missing.push(`${entry.id}: ABSENT (${reading.detail})`);
      continue;
    }
    for (const [superseded] of pairs) {
      if (reading.source.includes(superseded)) authored.push(`${entry.id}: ${superseded}`);
    }
  }
  if (consumers.length === 0) {
    return { verdict: 'roster UNREADABLE — no consumer is rostered: ABSENT (empty roster)', authored };
  }
  if (missing.length > 0) {
    return {
      verdict: `roster UNREADABLE — re-roster the consumer at its current path; the window stays open: ${missing.join(', ')}`,
      authored,
    };
  }
  if (authored.length > 0) return { verdict: WINDOW_OPEN, authored };
  return {
    verdict: 'window trigger PASSED — every named consumer authors the canonical spelling; close the window',
    authored,
  };
}

/**
 * The workflow must check each rostered repository out at the pinned revision
 * and must run this gate. Line-based on purpose, as the workflow wiring gate is.
 */
export function checkWorkflowReceiver(workflow, { pins = SURFACE_CAPABILITY_PINS, consumers = NAMED_CONSUMERS } = {}) {
  const failures = [];
  const lines = workflow.split('\n');
  for (const entry of consumers) {
    const refs = [];
    lines.forEach((line, index) => {
      if (!new RegExp(`^\\s*repository:\\s*['"]?${entry.workflowRepository}['"]?\\s*$`).test(line)) return;
      let ref = null;
      for (let next = index + 1; next < lines.length && !/^\s*-\s+(name|uses):/.test(lines[next]); next += 1) {
        const match = lines[next].match(/^\s*ref:\s*['"]?([^'"\s#]+)/);
        if (match) ref = match[1];
      }
      refs.push(ref);
    });
    if (refs.length === 0) {
      failures.push(`${WORKFLOW_PATH} never checks out ${entry.workflowRepository}`);
    }
    for (const ref of refs) {
      if (ref !== pins[entry.repository]) {
        failures.push(
          `${WORKFLOW_PATH} checks out ${entry.workflowRepository} at ${String(ref)}, not the pinned ${String(pins[entry.repository])}`,
        );
      }
    }
  }
  const runs = lines.some((line) => /^\s*run:/.test(line) && line.includes(`${GATE_NAME}/index.mjs`));
  if (!runs) failures.push(`${WORKFLOW_PATH} has no step that runs ${GATE_NAME}/index.mjs`);
  return failures;
}

export function runGate({ env = process.env, pins = SURFACE_CAPABILITY_PINS, coreRoot = CORE_ROOT, repoRoot = REPO_ROOT } = {}) {
  const pairs = readSupersededPairs(readFileSync(join(coreRoot, SHELL_CONTRACTS_PATH), 'utf8'));
  const readings = new Map(NAMED_CONSUMERS.map((entry) => [entry.id, readConsumer(entry, { env, pins })]));
  const { verdict, authored } = readRoster(pairs, (entry) => readings.get(entry.id));
  const workflowFile = join(repoRoot, WORKFLOW_PATH);
  const workflowFailures = existsSync(workflowFile)
    ? checkWorkflowReceiver(readFileSync(workflowFile, 'utf8'), { pins })
    : [`${WORKFLOW_PATH} is missing: the receiver has no CI step`];
  return {
    ok: verdict === WINDOW_OPEN && workflowFailures.length === 0,
    verdict,
    authored,
    pairs,
    readings,
    workflowFailures,
    pins,
  };
}

export function formatReport(result) {
  const lines = [`${GATE_NAME}: ${result.pairs.length} superseded pairs (${SUPERSEDED_MAP_NAME})`];
  for (const entry of NAMED_CONSUMERS) {
    const reading = result.readings.get(entry.id);
    lines.push(`  consumer  ${entry.id}`);
    lines.push(`  pin       ${entry.repository} ${String(result.pins[entry.repository])} (SURFACE_CAPABILITY_PINS)`);
    lines.push(
      reading.state === 'present'
        ? `  checkout  ${reading.root} @ ${reading.revision} (${entry.rootEnv}; committed bytes of ${entry.path})`
        : `  checkout  ABSENT — ${reading.detail}`,
    );
  }
  for (const row of result.authored) lines.push(`  authored  ${row}`);
  for (const failure of result.workflowFailures) lines.push(`  workflow  ${failure}`);
  lines.push(`${GATE_NAME}: ${result.verdict}`);
  lines.push(`${GATE_NAME}: ${result.ok ? 'OK' : 'FAIL'}`);
  return lines.join('\n');
}

export function main(argv = process.argv.slice(2)) {
  for (const token of argv) {
    if (token !== '--check') throw new Error(`unknown argument ${token}`);
  }
  const result = runGate();
  (result.ok ? console.log : console.error)(formatReport(result));
  return result.ok ? 0 : 1;
}

if (process.argv[1] && realpathSync(process.argv[1]) === SCRIPT_PATH) {
  process.exitCode = main();
}
