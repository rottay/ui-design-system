#!/usr/bin/env node
/**
 * App `--ds-*` boundary gate.
 *
 * THE LAW. The `--ds-*` namespace is minted by the design system. An
 * application may ASSIGN a value to a shipped DS hook inside a scoped selector
 * -- that is how a feature tunes a component it renders -- but it may not
 * become a second GLOBAL authority for the design system's tokens.
 *
 * The distinction that matters is not "does the app write `--ds-*`" (it must,
 * to use hooks at all) but WHERE and WITH WHAT EFFECT. This gate classifies
 * every app declaration against what the DS actually ships:
 *
 *   SHADOWED    declared at bare `:root`, and the UNLAYERED tenant artifact
 *               declares it too. The artifact is (0,1,1), the app's `:root` is
 *               (0,1,0), so the app line never wins. Dead code that reads as
 *               authority -- the most misleading category, because it looks
 *               like the app is branding itself and it is not.
 *
 *   GLOBAL-OWN  declared at bare `:root`, the artifact does NOT declare it, and
 *               DS CSS consumes it. Unlayered app CSS beats every DS layer, so
 *               here the app genuinely IS the global authority for a DS token.
 *               This is the violation the law targets.
 *
 *   ORPHAN      declared at bare `:root` and nothing in the DS consumes it.
 *               Dead weight; usually a renamed or removed hook.
 *
 *   SCOPED      declared under any selector that is not bare `:root`. Legitimate
 *               by construction: a feature-scoped assignment to a hook cannot
 *               redefine system-wide authority.
 *
 * Only GLOBAL-OWN and ORPHAN are failures. SHADOWED is tracked, decrease-only,
 * because deleting 97 lines from a live stylesheet is a visual review, not a
 * mechanical one.
 *
 * Usage:
 *   node scripts/app-ds-boundary-gate.mjs            # report
 *   node scripts/app-ds-boundary-gate.mjs --check    # enforce baseline
 */

import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(HERE, '..');

/**
 * `--workspace-root <dir>` relocates the corpus search. It exists so the
 * missing-corpus behaviour is TESTABLE: without it, a drill can only assert
 * fail-closed by deleting the real sibling repository, which no test may do.
 */
function argValue(flag) {
  const index = process.argv.indexOf(flag);
  return index !== -1 ? process.argv[index + 1] : undefined;
}

// packageRoot is <repo>/packages/core, so the workspace is three levels up.
const workspaceRoot = resolve(argValue('--workspace-root') ?? resolve(packageRoot, '../../..'));

/**
 * Where the app corpus lives.
 *
 * Locally the sibling checkout is the natural default. CI has no sibling: the
 * `core` job clones only this repository, so the workflow checks app-bithire out
 * at a controlled path and points the gate at it. Without that, a gate wired as
 * blocking would be red on every CI run for a reason unrelated to the boundary
 * -- which is how gates get quietly downgraded.
 *
 * Precedence: `--app-root` > `APP_BITHIRE_ROOT` > sibling of the workspace.
 */
const APP_ROOT = resolve(
  argValue('--app-root') ?? process.env.APP_BITHIRE_ROOT ?? resolve(workspaceRoot, 'app-bithire'),
);
const BASELINE = resolve(HERE, 'app-ds-boundary-gate.baseline.json');

/** Stable logical prefix for baseline keys, independent of where APP_ROOT is. */
const CORPUS_KEY_PREFIX = 'app-bithire';

const ARTIFACT = resolve(
  packageRoot,
  'src/foundation/tokens/css/facade/artifacts/bithire/index.css',
);
const BUNDLE = resolve(packageRoot, 'dist/bithire.css');

/** CSS with comments removed, so prose never counts as a declaration. */
function code(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, '');
}

function collectCssFiles(root) {
  const out = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
      const full = join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (extname(entry.name) === '.css') out.push(full);
    }
  };
  walk(root);
  return out.sort();
}

/**
 * Declarations with their enclosing selector. A brace scanner is required:
 * a regex cannot attribute a declaration to the rule that contains it, which
 * is the entire distinction between a scoped hook and a global override.
 */
function declarations(css) {
  const stripped = code(css);
  const found = [];
  const stack = [];
  let index = 0;
  let segmentStart = 0;

  while (index < stripped.length) {
    const char = stripped[index];
    if (char === '{') {
      stack.push(stripped.slice(segmentStart, index).trim().replace(/\s+/g, ' '));
      segmentStart = index + 1;
    } else if (char === '}') {
      const body = stripped.slice(segmentStart, index);
      const selector = stack[stack.length - 1] ?? '';
      for (const match of body.matchAll(/(--ds-[a-z0-9-]+)\s*:/g)) {
        found.push({ name: match[1], selector });
      }
      stack.pop();
      segmentStart = index + 1;
    }
    index += 1;
  }
  return found;
}

const isBareRoot = (selector) => /^:root$/.test(selector.trim());

function main() {
  const check = process.argv.includes('--check');
  const write = process.argv.includes('--write');
  const optional = process.argv.includes('--optional');

  if (!existsSync(APP_ROOT)) {
    // A BLOCKING gate that returns 0 because it could not find its corpus is
    // green for the worst possible reason: it did not look. That is the exact
    // failure class this whole programme exists to remove, and the first
    // version of this gate shipped it.
    //
    // `--optional` exists for a genuinely single-repo context, and it must
    // never appear in the blocking path -- `ci-gates.manifest.mjs` asserts that.
    if (optional) {
      console.log(
        `app-ds-boundary-gate: ${relative(workspaceRoot, APP_ROOT)} absent; --optional so not enforcing.`,
      );
      return 0;
    }
    console.error(
      `app-ds-boundary-gate: corpus missing — ${relative(workspaceRoot, APP_ROOT)} is not checked out.`,
    );
    console.error(
      '  A blocking gate cannot pass without its corpus. Check out app-bithire beside',
    );
    console.error(
      '  ui-design-system, or run with --optional in a context where that is impossible.',
    );
    return 1;
  }
  for (const required of [ARTIFACT, BUNDLE]) {
    if (!existsSync(required)) {
      console.error(`app-ds-boundary-gate: missing ${required}. Run build:vertical-css first.`);
      return 1;
    }
  }

  const artifactNames = new Set(
    [...code(readFileSync(ARTIFACT, 'utf8')).matchAll(/(--ds-[a-z0-9-]+)\s*:/g)].map((m) => m[1]),
  );
  const consumed = new Set(
    [...code(readFileSync(BUNDLE, 'utf8')).matchAll(/var\(\s*(--ds-[a-z0-9-]+)/g)].map((m) => m[1]),
  );

  // Print WHAT was audited. A cross-repo gate whose corpus is invisible cannot
  // be reviewed: the reader has no way to tell which revision produced the
  // numbers below.
  console.log(`app-ds-boundary-gate: corpus ${APP_ROOT}`);
  const headFile = resolve(APP_ROOT, '.git/HEAD');
  if (existsSync(headFile)) {
    const head = readFileSync(headFile, 'utf8').trim();
    const ref = head.startsWith('ref: ') ? head.slice(5) : null;
    const sha = ref && existsSync(resolve(APP_ROOT, '.git', ref))
      ? readFileSync(resolve(APP_ROOT, '.git', ref), 'utf8').trim()
      : head;
    console.log(`app-ds-boundary-gate: corpus SHA ${sha}`);
  } else {
    console.log('app-ds-boundary-gate: corpus SHA unavailable (no .git — exported tree)');
  }

  const buckets = { shadowed: [], globalOwn: [], orphan: [], scoped: 0 };

  for (const file of collectCssFiles(resolve(APP_ROOT, 'src'))) {
    // Baseline keys are LOGICAL, not filesystem-derived. The corpus lives at a
    // sibling path locally and at a runner-specific path in CI, so keying by
    // `relative(workspaceRoot, file)` made every entry look new the moment the
    // corpus moved -- a false red that would have made this gate untrustworthy
    // exactly where it matters most.
    const rel = `${CORPUS_KEY_PREFIX}/${relative(APP_ROOT, file)}`;
    for (const { name, selector } of declarations(readFileSync(file, 'utf8'))) {
      if (!isBareRoot(selector)) {
        buckets.scoped += 1;
        continue;
      }
      const entry = `${rel} :: ${name}`;
      if (artifactNames.has(name)) buckets.shadowed.push(entry);
      else if (consumed.has(name)) buckets.globalOwn.push(entry);
      else buckets.orphan.push(entry);
    }
  }

  for (const key of ['shadowed', 'globalOwn', 'orphan']) buckets[key].sort();

  console.log('app-ds-boundary-gate');
  console.log(`  SCOPED     (legitimate, feature-scoped hook assignments): ${buckets.scoped}`);
  console.log(`  SHADOWED   (artifact wins; app line is dead):            ${buckets.shadowed.length}`);
  console.log(`  GLOBAL-OWN (app is the effective global authority):      ${buckets.globalOwn.length}`);
  console.log(`  ORPHAN     (nothing consumes it):                       ${buckets.orphan.length}`);

  const current = {
    shadowed: buckets.shadowed,
    globalOwn: buckets.globalOwn,
    orphan: buckets.orphan,
  };

  if (write) {
    writeFileSync(BASELINE, `${JSON.stringify(current, null, 2)}\n`);
    console.log(`\nBaseline written: ${relative(workspaceRoot, BASELINE)}`);
    return 0;
  }

  if (!check) return 0;

  if (!existsSync(BASELINE)) {
    console.error('\napp-ds-boundary-gate: baseline missing. Generate it with --write.');
    return 1;
  }
  const baseline = JSON.parse(readFileSync(BASELINE, 'utf8'));
  const failures = [];

  // GLOBAL-OWN and ORPHAN are violations: never allowed to grow.
  for (const bucket of ['globalOwn', 'orphan']) {
    const known = new Set(baseline[bucket] ?? []);
    for (const entry of current[bucket]) {
      if (!known.has(entry)) failures.push(`NEW ${bucket}: ${entry}`);
    }
  }
  // SHADOWED is decrease-only debt.
  const knownShadowed = new Set(baseline.shadowed ?? []);
  for (const entry of current.shadowed) {
    if (!knownShadowed.has(entry)) failures.push(`NEW shadowed: ${entry}`);
  }

  if (failures.length > 0) {
    console.error(`\napp-ds-boundary-gate FAILED (${failures.length}):`);
    for (const failure of failures) console.error(`  - ${failure}`);
    console.error('\nAn app may assign a shipped DS hook inside a SCOPED selector.');
    console.error('It may not declare one at bare `:root` — that is global authority.');
    return 1;
  }

  console.log('\napp-ds-boundary-gate OK — no new global `--ds-*` authority in the app.');
  return 0;
}

process.exitCode = main();
