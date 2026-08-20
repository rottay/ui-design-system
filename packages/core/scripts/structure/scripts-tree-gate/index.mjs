#!/usr/bin/env node

/**
 * scripts-tree-gate — the §1.2/§2.9 law enforced on `packages/core/scripts/`.
 *
 * The scripts tree is mechanical governance (§2.9): one family, one purpose;
 * every capability is `<family>/<capability>/index.mjs` with its tests and
 * sidecars inside its own folder. A loose file tells you nothing; the path is
 * the documentation. This gate keeps the tree from re-flattening: every
 * finding that is NOT in the hand-maintained baseline fails, and every
 * baseline entry that no longer matches a live finding fails too (the
 * baseline is decrease-only — §1.2: "Never absorb a new finding merely to
 * make the gate pass").
 *
 * Rules:
 *   R1  scripts/ root holds only family dirs + the two declared toolchain
 *       files (vitest.scripts.config.ts, tests-typecheck-ambient.d.ts).
 *   R2  A family dir holds only capability dirs. Declared doc exception: one
 *       README.md per family. Declared capability exception: lib/repo-root/
 *       is a capability sitting at subfamily depth (§2.9 names it).
 *   R3  A capability dir holds index.mjs (production) or at least one test
 *       (test-ley capability); every file inside is index.mjs /
 *       index.test.mjs / index.vitest.test.ts or carries the capability's
 *       full basename. Deviations live in the baseline with a reason.
 *   R4  No generic ownership segments (_internal, internal, misc, shared,
 *       utils, hooks) — except the §2.9-declared lib/ subfamily roster.
 *   R5  The family roster is exactly §2.9's. A child whose name starts with
 *       its family's name is a finding (grandfathered product names live in
 *       the baseline; Paso C shortens them).
 *   R6  The lib/ subfamily roster is exactly §2.9's.
 *   A1  quality-evidence/ is its own jurisdiction (v2/ + programs/) — the
 *       gate checks nothing inside it beyond its presence.
 *   M1  packages/core/manifest/ (graduated in F0.5, capability form in F1
 *       Paso C3): capability dirs at the root next to the declared data
 *       owners (cascade/, controls/, families/, generated/, groups/ +
 *       index.json, schema.json). Nothing else loose at that root.
 *
 * --check (default)  exit 1 listing every finding not in the baseline and
 *                    every stale baseline entry.
 * --drill=<rule>     self-inject one violation of the given rule class and
 *                    fail, proving the gate has teeth (used by index.test.mjs).
 *
 * Baseline: scripts-tree-gate.baseline.json, hand-maintained, one reason per
 * entry. There is no --write: absorbing a deviation is an adjudication, not a
 * regeneration.
 */

import { readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync, existsSync } from 'node:fs';

const HERE = dirname(fileURLToPath(import.meta.url));
const SCRIPTS_ROOT = dirname(dirname(HERE)); // structure/scripts-tree-gate/ -> scripts/
const BASELINE_PATH = join(HERE, 'scripts-tree-gate.baseline.json');

const TOOLCHAIN_FILES = new Set(['vitest.scripts.config.ts', 'tests-typecheck-ambient.d.ts']);
const FAMILIES = [
  'boundaries', 'builders', 'ci', 'codemods', 'engine', 'evidence', 'generators',
  'i18n', 'lib', 'packaging', 'quality-evidence', 'structure', 'taxonomy',
  'tokens', 'verticals',
];
const LIB_SUBFAMILIES = [
  'build', 'engine', 'evidence', 'hooks', 'paint', 'repo-root', 'source',
  'taxonomy', 'tokens', 'verticals',
];
const FORBIDDEN_SEGMENTS = new Set(['_internal', 'internal', 'misc', 'shared', 'utils', 'hooks']);

export function collectFindings(scriptsRoot, { drill } = {}) {
  const findings = [];
  const add = (rule, path) => findings.push({ rule, path });

  const rootEntries = readdirSync(scriptsRoot, { withFileTypes: true });
  const rootDirs = new Set(rootEntries.filter((e) => e.isDirectory()).map((e) => e.name));

  for (const entry of rootEntries) {
    if (!entry.isDirectory() && !TOOLCHAIN_FILES.has(entry.name)) add('R1-loose-root-file', entry.name);
  }
  for (const dir of rootDirs) {
    if (!FAMILIES.includes(dir)) add('R5-undeclared-family', dir);
  }
  for (const family of FAMILIES) {
    if (!rootDirs.has(family)) add('R5-missing-family', family);
  }

  const walkCapability = (capPath, rel) => {
    const cap = capPath.split('/').pop();
    const entries = readdirSync(capPath, { withFileTypes: true });
    const files = entries.filter((e) => !e.isDirectory()).map((e) => e.name);
    const hasIndex = files.includes('index.mjs');
    const hasTest = files.some((n) => /\.test\.(mjs|ts)$/.test(n));
    if (!hasIndex && !hasTest) add('R3-ownerless-dir', rel);
    for (const name of files) {
      if (name === 'index.mjs' || name === 'index.test.mjs' || name === 'index.vitest.test.ts') continue;
      if (name.startsWith(`${cap}.`) || name.startsWith(`${cap}-`)) continue;
      add('R3-foreign-file', `${rel}/${name}`);
    }
    for (const entry of entries) {
      if (entry.isDirectory()) add('R3-nested-dir', `${rel}/${entry.name}`);
    }
  };

  for (const family of [...rootDirs].sort()) {
    if (family === 'quality-evidence') continue; // A1
    const famPath = join(scriptsRoot, family);
    for (const entry of readdirSync(famPath, { withFileTypes: true })) {
      const rel = `${family}/${entry.name}`;
      if (!entry.isDirectory()) {
        if (entry.name === 'README.md') continue; // declared family doc
        add('R2-loose-family-file', rel);
        continue;
      }
      if (FORBIDDEN_SEGMENTS.has(entry.name) && !(family === 'lib' && LIB_SUBFAMILIES.includes(entry.name))) {
        add('R4-forbidden-segment', rel);
      }
      if (entry.name.startsWith(`${family}-`) || entry.name.startsWith(`${family}.`)) {
        add('R5-family-prefix-repeat', rel);
      }
      if (family === 'lib') {
        if (!LIB_SUBFAMILIES.includes(entry.name)) {
          add('R6-undeclared-lib-subfamily', rel);
          continue;
        }
        if (entry.name === 'repo-root') {
          walkCapability(join(famPath, entry.name), rel); // declared §2.9 capability
          continue;
        }
        for (const sub of readdirSync(join(famPath, entry.name), { withFileTypes: true })) {
          const subRel = `${rel}/${sub.name}`;
          if (!sub.isDirectory()) {
            add('R2-loose-libsub-file', subRel);
            continue;
          }
          if (FORBIDDEN_SEGMENTS.has(sub.name)) add('R4-forbidden-segment', subRel);
          if (sub.name.startsWith(`${entry.name}-`) || sub.name.startsWith(`${entry.name}.`)) {
            add('R5-family-prefix-repeat', subRel);
          }
          walkCapability(join(famPath, entry.name, sub.name), subRel);
        }
      } else {
        walkCapability(join(famPath, entry.name), rel);
      }
    }
  }

  // manifest/ — the graduated jurisdiction (Paso C3): capability dirs at the
  // root next to declared data owners; no loose authored files. M1 catches
  // anything else at that root; capabilities follow the same R3 law.
  const manifestRoot = join(scriptsRoot, '..', 'manifest');
  if (existsSync(manifestRoot)) {
    const DATA_OWNERS = new Set(['cascade', 'controls', 'families', 'generated', 'groups']);
    const DATA_FILES = new Set(['index.json', 'schema.json']);
    for (const entry of readdirSync(manifestRoot, { withFileTypes: true })) {
      const rel = `manifest/${entry.name}`;
      if (!entry.isDirectory()) {
        if (!DATA_FILES.has(entry.name)) add('M1-loose-manifest-file', rel);
        continue;
      }
      if (DATA_OWNERS.has(entry.name)) continue;
      walkCapability(join(manifestRoot, entry.name), rel);
    }
  }

  if (drill === 'R1') add('R1-loose-root-file', 'drill-loose-file.mjs');
  if (drill === 'R2') add('R2-loose-family-file', 'ci/drill-loose.mjs');
  if (drill === 'R3') add('R3-foreign-file', 'ci/runner/drill-foreign.json');
  if (drill === 'R4') add('R4-forbidden-segment', 'ci/utils');
  if (drill === 'R5') add('R5-family-prefix-repeat', 'ci/ci-drill');
  if (drill === 'R6') add('R6-undeclared-lib-subfamily', 'lib/drill-sub');
  if (drill === 'M1') add('M1-loose-manifest-file', 'manifest/drill.mjs');
  if (drill === 'stale-baseline') { /* handled by caller mutating findings */ }
  return findings;
}

export function evaluate(findings, baseline) {
  const failures = [];
  const baselineSet = new Map(baseline.entries.map((e) => [`${e.rule}${e.path}`, e]));
  const findingKeys = new Set(findings.map((f) => `${f.rule}${f.path}`));
  for (const f of findings) {
    if (!baselineSet.has(`${f.rule}${f.path}`)) {
      failures.push(`NEW ${f.rule} ${f.path} — fix it, or adjudicate it into the baseline with a reason`);
    }
  }
  for (const [key] of baselineSet) {
    if (!findingKeys.has(key)) {
      failures.push(`STALE baseline entry ${key} — the deviation is gone; shrink the baseline`);
    }
  }
  return failures;
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  const args = process.argv.slice(2);
  const drillArg = args.find((a) => a.startsWith('--drill'));
  const drill = drillArg?.includes('=') ? drillArg.split('=')[1] : undefined;

  const baseline = JSON.parse(readFileSync(BASELINE_PATH, 'utf8'));
  for (const entry of baseline.entries) {
    if (!entry.reason || typeof entry.reason !== 'string') {
      console.error(`scripts-tree-gate FAIL — baseline entry without reason: ${entry.rule} ${entry.path}`);
      process.exit(1);
    }
  }

  const findings = collectFindings(SCRIPTS_ROOT, { drill });
  const failures = evaluate(findings, baseline);
  if (drill && failures.length === 0) {
    console.error(`scripts-tree-gate DRILL FAIL — injected ${drill} violation was not reported`);
    process.exit(1);
  }
  if (drill) {
    console.log(`scripts-tree-gate drill ${drill}: violation caught (${failures.length} failure line(s))`);
    process.exit(0);
  }
  if (failures.length > 0) {
    for (const f of failures) console.error(`scripts-tree-gate FAIL — ${f}`);
    process.exit(1);
  }
  console.log(
    `scripts-tree-gate OK — ${FAMILIES.length} families, ${LIB_SUBFAMILIES.length} lib subfamilies, ` +
      `${baseline.entries.length} adjudicated baseline entr${baseline.entries.length === 1 ? 'y' : 'ies'} (decrease-only)`,
  );
}
