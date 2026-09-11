/**
 * The drill for the intent door.
 *
 * Every case plants a real bypass into a sandbox workspace and asserts the gate
 * refuses it: an intent assembled in a component, one assembled in the
 * showroom (the reachable bypass F-24 demonstrated), a fourth door added to the
 * ingress without being declared, a declared door deleted, and the one-line
 * mutation that costs nothing and breaks everything -- deleting the
 * `assertThemeIntent` call out of `resolveTheme`.
 */
import assert from 'node:assert/strict';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { after, describe, it } from 'node:test';

import {
  DECLARED_PRODUCERS,
  GUARD_NAME,
  GUARDED_ENTRY,
  INGRESS_ROOT,
  RESOLVER_FILE,
  exportedIntentProducers,
  findIntentLiterals,
  guardIsWired,
  measure,
} from '../index.mjs';
import { packageRoot as findPackageRoot, repoRoot as findRepoRoot } from '../../../../libraries/repo-root/index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const CORE_ROOT = findPackageRoot(HERE);
const REPO_ROOT = findRepoRoot(HERE);

const sandboxes = [];
after(() => { for (const dir of sandboxes) rmSync(dir, { recursive: true, force: true }); });

/**
 * A sandbox workspace carrying only the two trees the gate walks. Copying the
 * ingress, the resolver and one component directory is enough for every case
 * and keeps each run to a few hundred files instead of the whole package.
 */
function sandbox() {
  const repo = mkdtempSync(join(tmpdir(), 'evi02-intent-'));
  sandboxes.push(repo);
  const core = join(repo, 'packages/core');
  mkdirSync(join(core, 'src'), { recursive: true });
  mkdirSync(join(repo, 'packages/showroom/src'), { recursive: true });
  writeFileSync(join(core, 'package.json'), '{"name":"@rottay/design-system"}\n');
  writeFileSync(join(repo, 'pnpm-workspace.yaml'), 'packages:\n  - packages/*\n');
  cpSync(join(CORE_ROOT, INGRESS_ROOT), join(core, INGRESS_ROOT), { recursive: true });
  cpSync(join(CORE_ROOT, RESOLVER_FILE), join(core, RESOLVER_FILE));
  return { repo, core };
}

const options = ({ repo, core }) => ({ coreRoot: core, repoRoot: repo });
const rules = (result) => result.findings.map((finding) => finding.rule);

describe('intent-literal — the measurement', () => {
  it('the real tree has every intent literal inside the ingress', () => {
    const result = measure();
    assert.deepEqual(result.findings, [], result.findings.map((f) => `${f.rule} ${f.where}`).join('\n'));
    assert.ok(result.literals.length > 0, 'a scan that finds no literal has stopped scanning');
  });

  it('the roster and the ingress source name the same doors', () => {
    for (const producer of DECLARED_PRODUCERS) {
      const found = exportedIntentProducers(join(CORE_ROOT, producer.file));
      assert.ok(found.some((entry) => entry.name === producer.name),
        `${producer.name} is declared but ${producer.file} does not export it`);
    }
  });

  it(`${GUARDED_ENTRY} calls ${GUARD_NAME} on the real tree`, () => {
    const guard = guardIsWired(CORE_ROOT);
    assert.ok(guard.defined);
    assert.ok(guard.calledFrom.includes(GUARDED_ENTRY));
  });

  it('a comment or a string that mentions origin and patch is not a literal', () => {
    const dir = sandbox();
    const file = join(dir.core, 'src/decoy/index.ts');
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, [
      '// { origin: "preview", patch: {} } is what the ingress builds.',
      'export const DOC = "origin: preview, patch: {}";',
      '/* origin: "tenant-document", patch: {} */',
      'export const ORIGINS = ["preview"] as const;',
      '',
    ].join('\n'));
    const literals = findIntentLiterals(join(dir.core, 'src/decoy'));
    assert.deepEqual(literals, [], 'a textual scan would have reported three findings here');
  });
});

describe('intent-literal drills — every bypass is refused', () => {
  it('MUTANT: an intent assembled inside a component', () => {
    const dir = sandbox();
    assert.deepEqual(rules(measure(options(dir))), [], 'the sandbox must be green first');
    const file = join(dir.core, 'src/components/rogue/index.tsx');
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, [
      'export function rogue() {',
      '  return { vertical: "bithire", slug: "acme", origin: "tenant-document", patch: {} };',
      '}',
      '',
    ].join('\n'));
    assert.ok(rules(measure(options(dir))).includes('INTENT_LITERAL_OUTSIDE_INGRESS'));
  });

  it('MUTANT: the F-24 bypass — an intent assembled in the showroom', () => {
    const dir = sandbox();
    const file = join(dir.repo, 'packages/showroom/src/components/torture/index.tsx');
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, [
      'export const intent = { vertical: "rottay", slug: "t", origin: "preview", patch: {} };',
      '',
    ].join('\n'));
    const found = measure(options(dir)).findings
      .filter((finding) => finding.rule === 'INTENT_LITERAL_OUTSIDE_INGRESS');
    assert.equal(found.length, 1, 'the showroom is inside the scan, not beside it');
    assert.match(found[0].where, /packages\/showroom/u);
  });

  it('MUTANT: `as ThemeIntent` on a bare object is still an assembled intent', () => {
    const dir = sandbox();
    const file = join(dir.core, 'src/runtime/sneaky/index.ts');
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, [
      'import type { ThemeIntent } from "x";',
      'export const sneaky = ({ vertical: "bithire", slug: "a", origin: "preview" }) as ThemeIntent;',
      '',
    ].join('\n'));
    assert.ok(rules(measure(options(dir))).includes('INTENT_LITERAL_OUTSIDE_INGRESS'),
      'a cast is a construction with the field list hidden');
  });

  it('MUTANT: a fourth ingress door that declares itself', () => {
    const dir = sandbox();
    const file = join(dir.core, `${INGRESS_ROOT}/static/index.ts`);
    const source = readFileSync(file, 'utf8');
    writeFileSync(file, `${source}\nexport function backdoorThemeIntent(): ThemeIntent {\n`
      + '  return { vertical: "bithire", slug: "back", origin: "static-vertical", patch: {} };\n}\n');
    const found = measure(options(dir)).findings.filter((f) => f.rule === 'UNDECLARED_INGRESS_PRODUCER');
    assert.equal(found.length, 1, `expected one undeclared door; got ${JSON.stringify(found)}`);
    assert.match(found[0].detail, /backdoorThemeIntent/u);
  });

  it('MUTANT: a declared door deleted from the source', () => {
    const dir = sandbox();
    const file = join(dir.core, `${INGRESS_ROOT}/preview/index.ts`);
    const source = readFileSync(file, 'utf8');
    writeFileSync(file, source.replace('export function draftPreviewThemeIntent', 'function draftPreviewThemeIntent'));
    assert.ok(rules(measure(options(dir))).includes('DECLARED_PRODUCER_MISSING'));
  });

  it(`MUTANT: the ${GUARD_NAME} call deleted from ${GUARDED_ENTRY}`, () => {
    const dir = sandbox();
    const file = join(dir.core, RESOLVER_FILE);
    const source = readFileSync(file, 'utf8');
    const mutated = source.replace(`  ${GUARD_NAME}(intent);`, `  // ${GUARD_NAME}(intent);`);
    assert.notEqual(mutated, source, 'the mutation must actually remove the call');
    writeFileSync(file, mutated);
    const found = measure(options(dir)).findings.filter((f) => f.rule === 'GUARD_NOT_CALLED');
    assert.equal(found.length, 1, 'one commented-out line must turn the closed unions into documentation, loudly');
  });

  it('MUTANT: a scan that finds nothing is a failure, not a pass', () => {
    const dir = sandbox();
    for (const producer of new Set(DECLARED_PRODUCERS.map((entry) => entry.file))) {
      const file = join(dir.core, producer);
      writeFileSync(file, readFileSync(file, 'utf8').replace(/origin:/gu, 'originX:'));
    }
    assert.ok(rules(measure(options(dir))).includes('VACUOUS_SCAN'));
  });
});
