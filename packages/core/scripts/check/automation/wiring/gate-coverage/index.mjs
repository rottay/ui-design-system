/**
 * wiring-coverage-gate — every production script is wired through at least
 * one legitimate channel, or it does not exist.
 *
 * ARCHITECTURE §1.10 declares the three legitimate wiring channels:
 * the gate manifest, the npm lifecycle hooks (`prebuild` / `postbuild` /
 * `prepack` / `pretest` and the aliases they CHAIN TO) and
 * `.github/workflows/ci.yml`.
 *
 * WHAT IS NOT A CHANNEL (WO-CAN-02, audit F-23/F-49). Until now this walk also
 * did `for (const command of Object.values(scripts)) addMatches(command)` --
 * every npm alias in package.json counted as wiring. An alias is a way to TYPE
 * a command, not a thing that runs: twenty-plus of them (`constitution:check`,
 * `claim-integrity:*`, `lane-control:*`, `cascade:*`,
 * `runtime-hardening:final` ...) were named by no chain and no workflow, so
 * twenty-plus checks that nobody had ever run counted as covered. Defining an
 * alias for a script now wires nothing; only a chain, the manifest or the
 * workflow does. This gate walks every production `.mjs` under
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

import { existsSync, readdirSync, readFileSync } from 'node:fs';
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

  const pkg = JSON.parse(readFileSync(join(CORE_ROOT, 'package.json'), 'utf8'));
  const scripts = pkg.scripts ?? {};
  const seen = new Set();

  /**
   * Follow an alias to the commands it really runs, transitively.
   *
   * An alias is expanded ONLY when a channel names it. That is the whole
   * difference between this and the removed alias channel: `pnpm run lint` in
   * `ci.yml` is a real invocation and everything it chains to really runs;
   * an alias sitting in package.json that nothing invokes runs never.
   */
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

  /** Every package.json alias a channel's text invokes by name. */
  const expandAliasesNamedIn = (text) => {
    for (const match of text.matchAll(/(?:pnpm|npm)(?:\s+run)?\s+(?:--filter\s+\S+\s+(?:run\s+)?)?([\w:.-]+)/g)) {
      const name = match[1];
      if (Object.hasOwn(scripts, name)) expand(name);
    }
    for (const match of text.matchAll(/'(?:pnpm|npm)',\s*'run',\s*'([\w:.-]+)'/g)) {
      if (Object.hasOwn(scripts, match[1])) expand(match[1]);
    }
  };

  // Channel 1: the CI gates manifest. Resolved from the package root (not
  // from HERE) so the gate keeps working from any depth.
  const manifestText = readFileSync(join(CORE_ROOT, 'scripts/check/automation/gates/manifest/index.mjs'), 'utf8');
  addMatches(manifestText);
  expandAliasesNamedIn(manifestText);

  // Channel 2: the npm lifecycle chains.
  for (const entry of ['prebuild', 'postbuild', 'prepack', 'pretest', 'build', 'gates:ci', 'test:scripts']) {
    expand(entry);
  }

  // Channel 3: the CI workflow, including the aliases its steps invoke.
  try {
    const workflow = readFileSync(join(REPO_ROOT, '.github/workflows/ci.yml'), 'utf8');
    addMatches(workflow);
    expandAliasesNamedIn(workflow);
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

/**
 * The hand-run tools, each with a reason and an owner.
 *
 * Registration is the ONLY third state, and it is a written one. It replaces
 * the docblock this gate used to carry, which claimed the walk skipped tests,
 * `lib/`, `codemods/` and `quality-evidence/` -- a claim the walk never
 * implemented and nothing ever checked.
 */
// A missing register is an EMPTY register, never a skip: with no entries every
// unwired script is an orphan, so the absence makes the gate louder rather than
// quieter. (It also lets the synthetic-tree drills in `gates/honesty` exercise
// the walk without carrying a register they have nothing to say about.)
const registerPath = join(HERE, 'manual-tools/index.json');
const register = existsSync(registerPath)
  ? JSON.parse(readFileSync(registerPath, 'utf8'))
  : { tools: [], workspaceTools: [] };
const registryProblems = [];
const registered = new Set();
for (const tool of register.tools ?? []) {
  if (typeof tool?.path !== 'string' || tool.path.length === 0) {
    registryProblems.push('a manual-tool entry has no path');
    continue;
  }
  if (registered.has(tool.path)) registryProblems.push(`duplicate manual-tool entry: ${tool.path}`);
  registered.add(tool.path);
  if (typeof tool.reason !== 'string' || tool.reason.trim().length < 40) {
    registryProblems.push(`${tool.path}: a manual-tool entry needs a written reason`);
  }
  if (typeof tool.owner !== 'string' || tool.owner.trim().length === 0) {
    registryProblems.push(`${tool.path}: a manual-tool entry needs an owner`);
  }
  if (!production.includes(tool.path)) {
    registryProblems.push(`${tool.path}: registered as a manual tool but no such production script exists`);
  }
  if (wired.has(tool.path)) {
    registryProblems.push(`${tool.path}: registered as a manual tool AND named by a channel; the registration hides the real wiring`);
  }
}

/**
 * Workspace hand-run tools: declared files that live OUTSIDE this package's
 * `scripts/` census.
 *
 * WHY THEY ARE NOT AN EXEMPTION. A workspaceTool excuses nothing, because the
 * file was never in the census there is nothing to excuse it from — which is
 * precisely why it cannot become a laundering channel. What the declaration
 * buys is that the claim becomes CHECKABLE: the file must exist, it must carry
 * a reason and an owner, and it must be named by NO channel in the workspace.
 * `packages/showroom/scripts/causal-canary-capture.mjs` is 2,397 lines that
 * looked like a test and ran in no job (audit F-107); saying so in prose is
 * what let that stand for months.
 */
const WORKSPACE_MANIFESTS = ['packages/core/package.json', 'packages/showroom/package.json'];
const channelText = [
  readFileSync(join(CORE_ROOT, 'scripts/check/automation/gates/manifest/index.mjs'), 'utf8'),
  ...WORKSPACE_MANIFESTS.map((relative) => {
    try {
      return readFileSync(join(REPO_ROOT, relative), 'utf8');
    } catch {
      return '';
    }
  }),
  (() => {
    try {
      return readFileSync(join(REPO_ROOT, '.github/workflows/ci.yml'), 'utf8');
    } catch {
      return '';
    }
  })(),
].join('\n');

const workspaceTools = register.workspaceTools ?? [];
const declaredWorkspace = new Set();
for (const tool of workspaceTools) {
  const label = `${tool?.package ?? '?'}:${tool?.path ?? '?'}`;
  if (typeof tool?.package !== 'string' || typeof tool?.path !== 'string' || tool.path.length === 0) {
    registryProblems.push(`a workspaceTools entry needs a package and a path (got ${label})`);
    continue;
  }
  if (declaredWorkspace.has(label)) registryProblems.push(`duplicate workspaceTools entry: ${label}`);
  declaredWorkspace.add(label);
  if (typeof tool.reason !== 'string' || tool.reason.trim().length < 40) {
    registryProblems.push(`${label}: a workspaceTools entry needs a written reason`);
  }
  if (typeof tool.owner !== 'string' || tool.owner.trim().length === 0) {
    registryProblems.push(`${label}: a workspaceTools entry needs an owner`);
  }
  const absolute = join(REPO_ROOT, 'packages', tool.package, tool.path);
  if (!existsSync(absolute)) {
    registryProblems.push(`${label}: declared as a hand-run tool but the file does not exist (${absolute})`);
  }
  if (channelText.includes(tool.path)) {
    registryProblems.push(
      `${label}: declared hand-run but named by a channel (a package.json script, the gate manifest or ci.yml); `
      + 'wire it and delete the declaration, or stop naming it',
    );
  }
}

if (registryProblems.length > 0) {
  console.error('wiring-coverage-gate: FAIL — the manual-tool register is malformed:');
  for (const problem of registryProblems.sort()) console.error(`  ${problem}`);
  process.exit(1);
}

const orphans = production.filter((path) => !wired.has(path) && !registered.has(path));

if (orphans.length > 0) {
  console.error('wiring-coverage-gate: FAIL — production scripts with no wiring channel:');
  for (const orphan of orphans.sort()) console.error(`  ${orphan}`);
  console.error('Wire each into the manifest, a lifecycle chain or ci.yml, register it as a');
  console.error('hand-run tool in manual-tools/index.json with a reason and an owner — or delete it.');
  process.exit(1);
}

console.log(
  `wiring-coverage-gate: OK — ${production.length} production scripts: `
  + `${production.length - registered.size} wired through a declared channel, `
  + `${registered.size} registered hand-run tools, each with a reason and an owner.`,
);
for (const tool of register.tools ?? []) console.log(`  hand-run: ${tool.path} — owner=${tool.owner}`);
for (const tool of workspaceTools) {
  console.log(`  hand-run (workspace, outside this census): packages/${tool.package}/${tool.path} — owner=${tool.owner}`);
}
