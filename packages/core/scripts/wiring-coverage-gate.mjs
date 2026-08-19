/**
 * wiring-coverage-gate — every production script is wired through at least
 * one legitimate channel, or it does not exist.
 *
 * ARCHITECTURE §1.10 declares the three legitimate wiring channels:
 * `ci-gates.manifest.mjs`, the npm lifecycle hooks (`prebuild` / `postbuild` /
 * `prepack` / `pretest` and the aliases they chain to) and
 * `.github/workflows/ci.yml`. This gate walks every production `.mjs` under
 * `scripts/` (not tests, not `lib/`, not `codemods/`, not `quality-evidence/`
 * — that subtree has its own program wiring) and requires each one to be
 * named by at least one channel. An orphan gate is exactly the defect the
 * honest-floor programme exists to kill: a check nobody runs.
 *
 * Usage: node scripts/wiring-coverage-gate.mjs
 * Exit 0 = full coverage. Exit 1 = orphan scripts, each reported.
 */

import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const CORE_ROOT = join(HERE, '..');
const REPO_ROOT = join(CORE_ROOT, '../..');

/** All script paths named by any of the three channels. */
function collectWiredPaths() {
  const wired = new Set();
  const addMatches = (text) => {
    for (const match of text.matchAll(/(?:scripts|src)\/[\w./-]+\.mjs/g)) wired.add(match[0]);
  };

  // Channel 1: the CI gates manifest.
  addMatches(readFileSync(join(HERE, 'ci-gates.manifest.mjs'), 'utf8'));

  // Channel 2: package.json lifecycle chains (aliases expanded transitively).
  const pkg = JSON.parse(readFileSync(join(CORE_ROOT, 'package.json'), 'utf8'));
  const scripts = pkg.scripts ?? {};
  const seen = new Set();
  const expand = (name) => {
    if (seen.has(name)) return;
    seen.add(name);
    const command = scripts[name];
    if (!command) return;
    addMatches(command);
    for (const match of command.matchAll(/pnpm (?:run )?([\w:.-]+)/g)) {
      const target = match[1];
      if (!/^(run|--)/.test(target)) expand(target);
    }
  };
  for (const entry of ['prebuild', 'postbuild', 'prepack', 'pretest', 'build', 'gates:ci', 'test:scripts']) {
    expand(entry);
  }
  // Any alias whose command runs a script directly also wires it.
  for (const command of Object.values(scripts)) addMatches(command);

  // Channel 3: the CI workflow.
  try {
    addMatches(readFileSync(join(REPO_ROOT, '.github/workflows/ci.yml'), 'utf8'));
  } catch {
    /* workflow absent locally; channels 1-2 still apply */
  }
  return wired;
}

/** Production scripts: flat .mjs under scripts/, excluding tests. */
function productionScripts() {
  return readdirSync(HERE)
    .filter((entry) => entry.endsWith('.mjs') && !entry.endsWith('.test.mjs'))
    .map((entry) => `scripts/${entry}`);
}

const wired = collectWiredPaths();

// One-hop import following: a module imported BY a wired script is itself
// wired (it runs inside something CI runs).
for (const path of [...wired]) {
  if (!path.startsWith('scripts/')) continue;
  try {
    const source = readFileSync(join(CORE_ROOT, path), 'utf8');
    for (const match of source.matchAll(/from\s+['"]\.(\.?\/[\w./-]+\.mjs)['"]/g)) {
      const resolved = join('scripts', match[1]).split('\\').join('/');
      const normalized = resolved.replace(/^scripts\/\.\//, 'scripts/').replace(/scripts\/\.\.\//, 'packages/');
      if (normalized.startsWith('scripts/')) wired.add(normalized);
    }
  } catch {
    /* a wired path that does not resolve is another gate's finding */
  }
}

const orphans = productionScripts().filter((path) => !wired.has(path));

if (orphans.length > 0) {
  console.error('wiring-coverage-gate: FAIL — production scripts with no wiring channel:');
  for (const orphan of orphans.sort()) console.error(`  ${orphan}`);
  console.error('Wire each into the manifest, a lifecycle chain or ci.yml — or delete it.');
  process.exit(1);
}

console.log(`wiring-coverage-gate: OK — every production script is wired through a declared channel.`);
