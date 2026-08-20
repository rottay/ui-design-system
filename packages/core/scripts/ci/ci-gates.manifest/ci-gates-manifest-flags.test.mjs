/**
 * WHY THIS FILE EXISTS.
 *
 * `gat-07-exact-proof` sat in the blocking manifest invoked with `--check`, a
 * flag the script never parses. The script has exactly four flags
 * (`--write`, `--check-artifact`, `--allow-unsealed-documentation`,
 * `--print-doc-allowlist`); `--check` fell through, the default path ran, the
 * gate printed OK and exited 0 without checking the artifact it exists to
 * check. A blocking gate that cannot fail is worse than no gate: it spends CI
 * time buying a guarantee nobody holds.
 *
 * THE RULE THIS ENCODES. Every flag the manifest hands to a script must appear
 * literally in that script's source. This cannot prove the flag is honoured,
 * but it does make a typo or an invented flag impossible to merge -- which is
 * the whole failure mode observed.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { CI_GATES } from './ci-gates.manifest.mjs';
import { packageRoot as findPackageRoot } from './lib/repo-root/index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const CORE_ROOT = findPackageRoot(HERE);

/** Flags consumed by the node binary itself, never by the target script. */
const NODE_OWNED = new Set(['--test', '--experimental-vm-modules', '--conditions']);

const PKG = JSON.parse(readFileSync(join(CORE_ROOT, 'package.json'), 'utf8'));

/**
 * A gate may be spelled `node script.mjs --flag`, `pnpm run <npm-script>` or
 * `pnpm exec vitest run <file>`. Only the first form hands flags to a script
 * this repo owns; the other two are resolved to their real command first so a
 * phantom flag cannot hide behind an npm alias.
 */
function resolveCommand(run) {
  if (run[0] === 'pnpm' && run[1] === 'run') {
    const cmd = PKG.scripts?.[run[2]];
    assert.ok(cmd, `gate names an npm script that does not exist: ${run[2]}`);
    return cmd.split(/\s+/);
  }
  if (run[0] === 'pnpm' && run[1] === 'exec') return run.slice(2);
  return run;
}

function targetsOf(rawRun) {
  const run = resolveCommand(rawRun);
  if (run[0] !== 'node') return { scripts: [], flags: [] };
  const scripts = [];
  const flags = [];
  for (const arg of run.slice(1)) {
    if (arg.startsWith('--')) {
      if (!NODE_OWNED.has(arg.split('=')[0])) flags.push(arg);
      continue;
    }
    // Bare words that are not module paths are values for the preceding flag
    // (`--repositories ui-design-system`), not scripts to resolve.
    if (/\.(mjs|cjs|js|mts|cts|ts|tsx)$/.test(arg)) scripts.push(arg);
  }
  return { scripts, flags };
}

test('every script the manifest names exists', () => {
  for (const gate of CI_GATES) {
    for (const script of targetsOf(gate.run).scripts) {
      const abs = join(CORE_ROOT, script);
      assert.ok(existsSync(abs), `gate ${gate.id} names a script that does not exist: ${script}`);
    }
  }
});

test('no gate passes a flag its target script does not recognise', () => {
  const phantom = [];
  for (const gate of CI_GATES) {
    const { scripts, flags } = targetsOf(gate.run);
    if (flags.length === 0) continue;
    // A `node --test a.mjs b.mjs` entry has no script-owned flags left by here.
    const sources = scripts
      .map((s) => join(CORE_ROOT, s))
      .filter((abs) => existsSync(abs))
      .map((abs) => readFileSync(abs, 'utf8'));
    for (const flag of flags) {
      const name = flag.split('=')[0];
      const known = sources.some((src) => src.includes(`'${name}'`) || src.includes(`"${name}"`));
      if (!known) phantom.push(`${gate.id}: ${name} (${scripts.join(', ')})`);
    }
  }
  assert.deepEqual(
    phantom,
    [],
    `the manifest passes flags no target script parses:\n  ${phantom.join('\n  ')}`,
  );
});
