/**
 * wiring-coverage-gate — every production script is wired through at least
 * one legitimate channel, or it does not exist.
 *
 * ARCHITECTURE §1.10 declares the three legitimate wiring channels:
 * `ci-gates.manifest.mjs`, the npm lifecycle hooks (`prebuild` / `postbuild` /
 * `prepack` / `pretest` and the aliases they chain to) and
 * `.github/workflows/ci.yml`. This gate walks every production `.mjs` under
 * `scripts/` RECURSIVELY (the folder/index law of §1.2: each capability lives
 * at `<family>/<capability>/index.mjs`), skipping tests, `lib/`, `codemods/`
 * and `quality-evidence/` (that subtree has its own program wiring), and
 * requires each one to be named by at least one channel. An orphan gate is
 * exactly the defect the honest-floor programme exists to kill: a check
 * nobody runs. A census that finds ZERO production scripts is itself a
 * failure — a vacuous pass is not a pass.
 *
 * Usage: node scripts/check/automation/wiring/gate-coverage/index.mjs
 * Exit 0 = full coverage. Exit 1 = orphan scripts, each reported, or an empty
 * census.
 */

import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, posix } from 'node:path';
import { fileURLToPath } from 'node:url';
import { packageRoot as findPackageRoot, repoRoot as findRepoRoot } from '../../../../libraries/repo-root/index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const CORE_ROOT = findPackageRoot(HERE);
const REPO_ROOT = findRepoRoot(HERE);

/**
 * A channel may name a script through a GLOB rather than a literal path:
 * `test:scripts` runs `node --test` over a recursive test glob, which executes
 * 119 suites and, through them, everything those suites import. The literal-path
 * matcher cannot see a `*`, so every one of those files read as an orphan and
 * the gate demanded manifest entries for scripts CI already runs -- the
 * decorative-reference failure this gate exists to prevent, produced by the
 * gate itself.
 *
 * The glob is expanded against the real tree, so it wires exactly what it
 * executes: a pattern that matches nothing wires nothing.
 */
const GLOB_CHANNEL = /(?:^|["'\s])(scripts\/[\w./*-]*\*[\w./*-]*\.m?js)(?:["'\s]|$)/g;

function globToRegExp(pattern) {
  const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
  const body = escaped.replace(/\*\*\//g, '\u0000').replace(/\*/g, '[^/]*').replace(/\u0000/g, '(?:.*/)?');
  return new RegExp(`^${body}$`);
}

/** All script paths named by any of the three channels. */
function collectWiredPaths() {
  const wired = new Set();
  const addMatches = (text) => {
    for (const match of text.matchAll(/(?:scripts|src)\/[\w./-]+\.mjs/g)) wired.add(match[0]);
    for (const match of text.matchAll(GLOB_CHANNEL)) {
      const matcher = globToRegExp(match[1]);
      for (const file of allScriptFiles()) if (matcher.test(file)) wired.add(file);
    }
  };

  // Channel 1: the CI gates manifest. Resolved from the package root (not
  // from HERE) so the gate keeps working from any depth; Paso B lot F updates
  // this path when the manifest itself graduates to its capability folder.
  addMatches(readFileSync(join(CORE_ROOT, 'scripts/check/automation/gates/manifest/index.mjs'), 'utf8'));

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

/** Every .mjs under scripts/, tests included -- the corpus a glob channel matches against. */
let scriptFileCache = null;
function allScriptFiles() {
  if (scriptFileCache) return scriptFileCache;
  const out = [];
  const walk = (rel) => {
    for (const entry of readdirSync(join(CORE_ROOT, 'scripts', rel), { withFileTypes: true })) {
      const entryRel = rel ? `${rel}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        walk(entryRel);
        continue;
      }
      if (entry.name.endsWith('.mjs')) out.push(`scripts/${entryRel}`);
    }
  };
  walk('');
  scriptFileCache = out;
  return out;
}

/** Production scripts: every non-test .mjs under scripts/, recursively. */
function productionScripts() {
  const out = [];
  const walk = (rel) => {
    for (const entry of readdirSync(join(CORE_ROOT, 'scripts', rel), { withFileTypes: true })) {
      const entryRel = rel ? `${rel}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        walk(entryRel);
        continue;
      }
      if (!entry.name.endsWith('.mjs') || entry.name.endsWith('.test.mjs')) continue;
      out.push(`scripts/${entryRel}`);
    }
  };
  walk('');
  return out;
}

const wired = collectWiredPaths();

// A transitively imported module runs inside the wired entrypoint too.
const queue = [...wired];
for (let cursor = 0; cursor < queue.length; cursor += 1) {
  const path = queue[cursor];
  if (!path.startsWith('scripts/')) continue;
  try {
    const source = readFileSync(join(CORE_ROOT, path), 'utf8');
    for (const match of source.matchAll(/(?:from\s+|import\s*(?:\(\s*)?)['"](\.{1,2}\/[\w./-]+\.mjs)['"]/g)) {
      const resolved = posix.normalize(join(dirname(path), match[1]));
      if (!resolved.startsWith('scripts/') || wired.has(resolved)) continue;
      wired.add(resolved);
      queue.push(resolved);
    }
  } catch {
    /* a wired path that does not resolve is another gate's finding */
  }
}

const production = productionScripts();

if (production.length === 0) {
  console.error('wiring-coverage-gate: FAIL — zero production scripts found under scripts/.');
  console.error('A vacuous pass is not a pass: the census walk is broken.');
  process.exit(1);
}

const orphans = production.filter((path) => !wired.has(path));

if (orphans.length > 0) {
  console.error('wiring-coverage-gate: FAIL — production scripts with no wiring channel:');
  for (const orphan of orphans.sort()) console.error(`  ${orphan}`);
  console.error('Wire each into the manifest, a lifecycle chain or ci.yml — or delete it.');
  process.exit(1);
}

console.log(`wiring-coverage-gate: OK — ${production.length} production scripts, every one wired through a declared channel.`);
