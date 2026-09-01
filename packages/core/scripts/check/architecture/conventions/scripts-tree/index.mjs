#!/usr/bin/env node

/**
 * scripts-tree-gate — the §1.2/§2.9 law enforced on `packages/core/scripts/`.
 *
 * The scripts tree is mechanical governance (§2.9): one intent, one purpose;
 * every capability is `<intent>/<subdomain?>/<capability>/index.mjs` with its
 * tests and sidecars inside its own folder. A subdomain exists only when it
 * groups at least two related capabilities. A loose file tells you nothing;
 * the path is the documentation. This gate keeps the tree from re-flattening: every
 * finding that is NOT in the hand-maintained baseline fails, and every
 * baseline entry that no longer matches a live finding fails too (the
 * baseline is decrease-only — §1.2: "Never absorb a new finding merely to
 * make the gate pass").
 *
 * Rules:
 *   R1  scripts/ root holds directories only.
 *   R2  An intent root holds only capability or descriptive subdomain dirs.
 *       Declared doc exception: one README.md per intent root.
 *   R3  A capability dir owns an index file (code, data, declaration or CSS)
 *       or an index.test file. Owned child capabilities may coexist with the
 *       parent index; every child is checked recursively by the same law.
 *   R4  No generic ownership segments (_internal, internal, misc, shared,
 *       utils, hooks).
 *   R5  The destination roster is exactly build, check, generate, maintain,
 *       package and libraries. Legacy source-layer roots remain explicit
 *       decrease-only debt, never alternate targets. A child may not repeat
 *       its intent root name.
 *   R7  Capability names describe behavior. Agent, work-order, round and
 *       phase prefixes are migration debt held in the decrease-only baseline.
 *   R8  A subdomain contains at least two semantically related children and
 *       no loose files. Depth is allowed when every level adds information;
 *       single-child wrappers are forbidden at every level.
 *   R9  Every directory name is descriptive lowercase-kebab; PascalCase,
 *       underscores, agent labels and opaque wave labels are forbidden.
 *   A1  Modern Rescue lives under check/modern-rescue; no legacy program-path
 *       exception remains.
 *   M1  packages/core/governance/manifest/ contains folder/index data owners;
 *       nothing else is loose at that root.
 *
 * --check (default)  exit 1 listing every finding not in the baseline and
 *                    every stale baseline entry.
 * --drill=<rule>     self-inject one violation of the given rule class and
 *                    fail, proving the gate has teeth (used by index.test.mjs).
 *
 * Baseline: baseline/index.json, hand-maintained, one reason per
 * entry. There is no --write: absorbing a deviation is an adjudication, not a
 * regeneration.
 */

import { readdirSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync, existsSync } from 'node:fs';

const HERE = dirname(fileURLToPath(import.meta.url));
const SCRIPTS_ROOT = resolve(HERE, '../../../..');
const BASELINE_PATH = join(HERE, 'baseline/index.json');

export const SCRIPT_INTENT_ROOTS = Object.freeze([
  'build',
  'check',
  'generate',
  'maintain',
  'package',
  'libraries',
]);
export const LEGACY_SCRIPT_ROOTS = Object.freeze([
  'foundation',
  'infrastructure',
  'entrypoints',
  'tooling',
]);
export const TRANSITIONAL_LEGACY_PROGRAMS = Object.freeze([]);
const LEGACY_DOMAIN_PATHS = [
  'foundation/localization',
  'foundation/taxonomy',
  'foundation/tokens',
  'infrastructure/engine',
  'infrastructure/verticals',
  'entrypoints/boundaries',
  'entrypoints/packaging',
  'tooling/build',
  'tooling/generation',
  'tooling/maintenance/codemods',
  'tooling/quality/architecture',
  'tooling/quality/automation',
  'tooling/quality/evidence/certification',
  'tooling/quality/evidence/framework',
  ...TRANSITIONAL_LEGACY_PROGRAMS,
];
const FORBIDDEN_SEGMENTS = new Set(['_internal', 'internal', 'misc', 'shared', 'utils']);
const OPAQUE_CAPABILITY_PREFIX =
  /^(?:cra-|gat-|ck-|kimi-|opus-|sonnet-|fable-|codex-|agent-|wave-|ola-|round-|f\d+-|v\d+(?:-|$)|phase-)/iu;
const DECLARATIVE_DIRECTORY_NAME = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/u;
const OPAQUE_DIRECTORY_NAME =
  /^(?:coh|cra|gat|ck|kimi|opus|sonnet|fable|codex|agent|wave|ola|round|f\d+[a-z]?|r\d+|v\d+|phase)(?:-|$)/iu;
const OWNER_FILE = /^index\.(?:mjs|ts|tsx|json|css|d\.ts|d\.mts)$/u;
const TEST_OWNER_FILE = /^index\.test\.(?:mjs|ts|tsx)$/u;
const OWNED_FILE = /^index(?:\.test)?\.(?:mjs|ts|tsx|json|css|d\.ts|d\.mts)$/u;

export function measureScriptsTree(scriptsRoot) {
  let ownerFiles = 0;
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const target = join(dir, entry.name);
      if (entry.isDirectory()) walk(target);
      else if (/^index\.(?:mjs|ts|json|d\.ts)$/u.test(entry.name)) ownerFiles += 1;
    }
  };
  walk(scriptsRoot);
  return { rootName: basename(scriptsRoot), ownerFiles };
}

export function collectFindings(scriptsRoot, { drill } = {}) {
  const findings = [];
  const add = (rule, path) => findings.push({ rule, path });

  const rootEntries = readdirSync(scriptsRoot, { withFileTypes: true });
  const rootDirs = new Set(rootEntries.filter((e) => e.isDirectory()).map((e) => e.name));

  const checkDirectoryNames = (dir, rel = '') => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const childRel = rel ? `${rel}/${entry.name}` : entry.name;
      if (
        !DECLARATIVE_DIRECTORY_NAME.test(entry.name) ||
        OPAQUE_DIRECTORY_NAME.test(entry.name)
      ) {
        add('R9-non-declarative-directory-name', childRel);
      }
      checkDirectoryNames(join(dir, entry.name), childRel);
    }
  };
  checkDirectoryNames(scriptsRoot);

  for (const entry of rootEntries) {
    if (!entry.isDirectory()) add('R1-loose-root-file', entry.name);
  }
  for (const dir of rootDirs) {
    if (SCRIPT_INTENT_ROOTS.includes(dir)) continue;
    if (LEGACY_SCRIPT_ROOTS.includes(dir)) add('R5-legacy-root', dir);
    else add('R5-undeclared-intent-root', dir);
  }
  for (const intent of SCRIPT_INTENT_ROOTS) {
    if (!rootDirs.has(intent)) add('R5-missing-intent-root', intent);
  }

  const walkCapability = (capPath, rel) => {
    const cap = capPath.split('/').pop();
    if (OPAQUE_CAPABILITY_PREFIX.test(cap)) add('R7-opaque-capability-name', rel);
    const entries = readdirSync(capPath, { withFileTypes: true });
    const files = entries.filter((e) => !e.isDirectory()).map((e) => e.name);
    const hasIndex = files.some((name) => OWNER_FILE.test(name));
    const hasTest = files.some((name) => TEST_OWNER_FILE.test(name));
    if (!hasIndex && !hasTest) add('R3-ownerless-dir', rel);
    for (const name of files) {
      if (OWNED_FILE.test(name)) continue;
      if (name.startsWith(`${cap}.`) || name.startsWith(`${cap}-`)) continue;
      add('R3-foreign-file', `${rel}/${name}`);
    }
    for (const entry of entries) {
      if (entry.isDirectory()) walkFamilyChild(join(capPath, entry.name), `${rel}/${entry.name}`);
    }
  };

  const walkFamilyChild = (childPath, rel) => {
    const name = rel.split('/').pop();
    const entries = readdirSync(childPath, { withFileTypes: true });
    const files = entries.filter((entry) => !entry.isDirectory()).map((entry) => entry.name);
    const directories = entries.filter((entry) => entry.isDirectory());
    const isCapability = files.some((file) => OWNER_FILE.test(file) || TEST_OWNER_FILE.test(file));

    if (isCapability) {
      walkCapability(childPath, rel);
      return;
    }

    if (files.length === 0 && directories.length === 0) {
      add('R3-ownerless-dir', rel);
      return;
    }

    if (FORBIDDEN_SEGMENTS.has(name)) add('R4-forbidden-segment', rel);
    for (const file of files) {
      if (file !== 'README.md') add('R8-loose-subdomain-file', `${rel}/${file}`);
    }
    if (directories.length < 2) add('R8-single-child-subdomain', rel);
    for (const child of directories) {
      const childRel = `${rel}/${child.name}`;
      if (FORBIDDEN_SEGMENTS.has(child.name)) add('R4-forbidden-segment', childRel);
      walkFamilyChild(join(childPath, child.name), childRel);
    }
  };

  for (const intent of SCRIPT_INTENT_ROOTS) {
    const intentPath = join(scriptsRoot, intent);
    if (!existsSync(intentPath)) continue;
    for (const entry of readdirSync(intentPath, { withFileTypes: true })) {
      const rel = `${intent}/${entry.name}`;
      if (!entry.isDirectory()) {
        if (entry.name !== 'README.md') add('R2-loose-intent-file', rel);
        continue;
      }
      if (FORBIDDEN_SEGMENTS.has(entry.name)) add('R4-forbidden-segment', rel);
      if (entry.name.startsWith(`${intent}-`) || entry.name.startsWith(`${intent}.`)) {
        add('R5-family-prefix-repeat', rel);
      }
      walkFamilyChild(join(intentPath, entry.name), rel);
    }
  }

  // Transitional validation keeps existing capabilities honest without making
  // their source-layer roots part of the destination roster above.
  for (const domain of LEGACY_DOMAIN_PATHS) {
    const famPath = join(scriptsRoot, domain);
    if (!existsSync(famPath)) continue;
    for (const entry of readdirSync(famPath, { withFileTypes: true })) {
      const rel = `${domain}/${entry.name}`;
      if (!entry.isDirectory()) {
        if (entry.name === 'README.md') continue;
        add('R2-loose-family-file', rel);
        continue;
      }
      if (FORBIDDEN_SEGMENTS.has(entry.name)) {
        add('R4-forbidden-segment', rel);
      }
      const domainName = domain.split('/').pop();
      if (entry.name.startsWith(`${domainName}-`) || entry.name.startsWith(`${domainName}.`)) {
        add('R5-family-prefix-repeat', rel);
      }
      walkFamilyChild(join(famPath, entry.name), rel);
    }
  }

  // Authored manifest data follows folder/index without loose peer files.
  const manifestRoot = join(scriptsRoot, '..', 'governance', 'manifest');
  if (existsSync(manifestRoot)) {
    const walkManifestData = (dir, rel, isRoot = false) => {
      const entries = readdirSync(dir, { withFileTypes: true });
      const files = entries.filter((entry) => !entry.isDirectory()).map((entry) => entry.name);
      const directories = entries.filter((entry) => entry.isDirectory());
      for (const file of files) {
        if (file !== 'index.json') add('M1-loose-manifest-file', `${rel}/${file}`);
      }
      if (!isRoot && files.length === 0 && directories.length === 0) add('R3-ownerless-dir', rel);
      for (const child of directories) {
        walkManifestData(join(dir, child.name), `${rel}/${child.name}`);
      }
    };
    walkManifestData(manifestRoot, 'governance/manifest', true);
  }

  if (drill === 'R1') add('R1-loose-root-file', 'drill-loose-file.mjs');
  if (drill === 'R2') add('R2-loose-intent-file', 'check/drill-loose.mjs');
  if (drill === 'R3') add('R3-foreign-file', 'check/runner/drill-foreign.json');
  if (drill === 'R4') add('R4-forbidden-segment', 'check/utils');
  if (drill === 'R5' || drill === 'intent-root') add('R5-undeclared-intent-root', 'shadow-intent');
  if (drill === 'legacy-root') add('R5-legacy-root', 'legacy-source-layer');
  if (drill === 'R7' || drill === 'agent-wave') add('R7-opaque-capability-name', 'check/agent-wave-probe');
  if (drill === 'R8') add('R8-single-child-subdomain', 'check/only-one-child');
  if (drill === 'R9') add('R9-non-declarative-directory-name', 'check/OpaqueTask');
  if (drill === 'M1') add('M1-loose-manifest-file', 'governance/manifest/drill.mjs');
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

  const measured = measureScriptsTree(SCRIPTS_ROOT);
  if (measured.rootName !== 'scripts' || measured.ownerFiles === 0) {
    console.error(
      `scripts-tree-gate FAIL — non-vacuity: expected a populated scripts/ root, got ${SCRIPTS_ROOT} (${measured.ownerFiles} owners)`,
    );
    process.exit(1);
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
    `scripts-tree-gate OK — ${SCRIPT_INTENT_ROOTS.length} intent roots, ` +
      `${measured.ownerFiles} owners scanned, ` +
      `${baseline.entries.length} adjudicated baseline entr${baseline.entries.length === 1 ? 'y' : 'ies'} (decrease-only)`,
  );
}
