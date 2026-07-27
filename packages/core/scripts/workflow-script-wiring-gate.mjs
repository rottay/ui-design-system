#!/usr/bin/env node
/**
 * Workflow script-wiring gate.
 *
 * THE DEFECT THIS CATCHES. A CI step read `pnpm run gates:ci:list` from the
 * repository root, while the script existed only in `packages/core/package.json`.
 * Nothing in the repo could tell: YAML is not type-checked, the script name is a
 * plain string, and the failure only appears on a runner. In this case it failed
 * loudly, but the same mistake in a `|| true` step, or a step whose failure is
 * tolerated, is silent — a gate that never runs and never says so.
 *
 * So: every `pnpm run <script>` in every workflow must resolve, from the
 * directory that step actually runs in.
 *
 * Resolution rules, matching pnpm:
 *   - `pnpm --filter <pkg> run <script>` resolves against that package.
 *   - otherwise it resolves against the step's working directory (the job
 *     default, or the repository root).
 *
 * Usage:
 *   node scripts/workflow-script-wiring-gate.mjs [--check]
 */

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(HERE, '..');
const repoRoot = resolve(packageRoot, '../..');
const WORKFLOWS = resolve(repoRoot, '.github/workflows');

/** Every package.json in the workspace, by directory and by package name. */
function loadPackages() {
  const byDir = new Map();
  const byName = new Map();
  const add = (dir) => {
    const manifest = join(dir, 'package.json');
    if (!existsSync(manifest)) return;
    const json = JSON.parse(readFileSync(manifest, 'utf8'));
    const scripts = new Set(Object.keys(json.scripts ?? {}));
    byDir.set(dir, scripts);
    if (json.name) byName.set(json.name, scripts);
  };
  add(repoRoot);
  const packagesDir = join(repoRoot, 'packages');
  if (existsSync(packagesDir)) {
    for (const entry of readdirSync(packagesDir, { withFileTypes: true })) {
      if (entry.isDirectory()) add(join(packagesDir, entry.name));
    }
  }
  return { byDir, byName };
}

/**
 * Extracts `pnpm run <script>` invocations with the filter and working
 * directory in force. Deliberately line-based: a full YAML parser would add a
 * dependency for a gate whose whole purpose is to need nothing.
 */
function scanWorkflow(text) {
  const lines = text.split('\n');
  const found = [];
  let jobIndent = null;
  let defaultWorkingDirectory = null;
  let stepWorkingDirectory = null;

  for (const line of lines) {
    const workingDir = line.match(/^\s*working-directory:\s*(\S+)/);
    if (workingDir) {
      const value = workingDir[1].replace(/^['"]|['"]$/g, '');
      if (/^\s{8,}/.test(line)) stepWorkingDirectory = value;
      else defaultWorkingDirectory = value;
      continue;
    }
    if (/^\s*-\s+(name|uses):/.test(line)) stepWorkingDirectory = null;
    if (/^\s{2}\w[\w-]*:\s*$/.test(line)) {
      jobIndent = null;
      defaultWorkingDirectory = null;
    }

    // `run` must be the token immediately after `pnpm` (or after the filter):
    // `pnpm --filter x exec vitest run ...` invokes a BINARY, not a script, and
    // matching the word `run` anywhere on the line flags it as a missing script.
    for (const match of line.matchAll(
      /pnpm\s+(?:(?:--filter|-F)\s+(\S+)\s+)?run\s+([\w:.-]+)/g,
    )) {
      const [, filterTarget, script] = match;
      const filterFlag = filterTarget ? '--filter' : null;
      found.push({
        script,
        filter: filterFlag ? filterTarget : null,
        workingDirectory: stepWorkingDirectory ?? defaultWorkingDirectory ?? '.',
        line: line.trim(),
      });
    }
    void jobIndent;
  }
  return found;
}

/**
 * `actions/checkout` resolves `with.path` relative to GITHUB_WORKSPACE and
 * rejects paths that escape it. Validate that property locally so a corpus
 * checkout cannot be wired to a path that only works in a synthetic drill.
 */
function invalidCheckoutPaths(text) {
  const lines = text.split('\n');
  const failures = [];

  for (let index = 0; index < lines.length; index += 1) {
    const checkout = lines[index].match(/^(\s*)-\s+uses:\s*actions\/checkout@/);
    if (!checkout) continue;

    const stepIndent = checkout[1].length;
    for (let cursor = index + 1; cursor < lines.length; cursor += 1) {
      const line = lines[cursor];
      const nextStep = line.match(/^(\s*)-\s+(?:name|uses|run):/);
      if (nextStep && nextStep[1].length <= stepIndent) break;

      const pathMatch = line.match(/^\s*path:\s*(\S.*?)\s*$/);
      if (!pathMatch) continue;
      const path = pathMatch[1].replace(/^['"]|['"]$/g, '');
      const segments = path.replaceAll('\\', '/').split('/');
      const escapesWorkspace =
        /^[/\\]|^[A-Za-z]:[/\\]/.test(path) || segments.includes('..');
      if (escapesWorkspace) failures.push(path);
      break;
    }
  }

  return failures;
}

function main() {
  if (!existsSync(WORKFLOWS)) {
    console.error(`workflow-script-wiring-gate: no workflows at ${WORKFLOWS}`);
    return 1;
  }
  const { byDir, byName } = loadPackages();
  const failures = [];
  let checked = 0;

  const files = readdirSync(WORKFLOWS).filter((name) => /\.ya?ml$/.test(name)).sort();
  for (const file of files) {
    const text = readFileSync(join(WORKFLOWS, file), 'utf8');
    for (const checkoutPath of invalidCheckoutPaths(text)) {
      failures.push(
        `${file}: actions/checkout path "${checkoutPath}" escapes GITHUB_WORKSPACE`,
      );
    }
    for (const use of scanWorkflow(text)) {
      checked += 1;
      const scripts = use.filter
        ? byName.get(use.filter)
        : byDir.get(resolve(repoRoot, use.workingDirectory));
      if (!scripts) {
        failures.push(
          `${file}: cannot resolve ${use.filter ? `--filter ${use.filter}` : `cwd ${use.workingDirectory}`} — ${use.line}`,
        );
        continue;
      }
      if (!scripts.has(use.script)) {
        failures.push(
          `${file}: script "${use.script}" does not exist in ` +
            `${use.filter ?? use.workingDirectory} — ${use.line}`,
        );
      }
    }
  }

  console.log(`workflow-script-wiring-gate: ${checked} pnpm script reference(s) across ${files.length} workflow(s)`);

  // Non-vacuity floor. A scanner that matched nothing would pass silently and
  // report exactly the same success as a fully-wired repository.
  if (checked < 5) {
    console.error(
      `\nworkflow-script-wiring-gate: only ${checked} references found — the scanner is not reading the workflows.`,
    );
    return 1;
  }

  if (failures.length > 0) {
    console.error(`\nworkflow-script-wiring-gate FAILED (${failures.length}):`);
    for (const failure of failures) console.error(`  - ${failure}`);
    return 1;
  }
  console.log('workflow-script-wiring-gate OK — every referenced script resolves.');
  return 0;
}

process.exitCode = main();
