/**
 * The drill for the document-version gate.
 *
 * Every case plants a real defect into a sandbox workspace and asserts the gate
 * refuses it -- and, just as importantly, one case plants a v2 literal INSIDE
 * the migrate chain and asserts the gate stays green. The write-position
 * definition is the whole subtlety of this gate, so it is tested rather than
 * asserted: a gate that refused every v2 literal would refuse the read path,
 * and the first thing anyone does with a gate that is red for the wrong reason
 * is widen it.
 */
import assert from 'node:assert/strict';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { after, describe, it } from 'node:test';

import {
  ADMISSION_FILE,
  CONTRACT_FILE,
  DECLARED_V2_WRITERS,
  FORK_CALLER,
  FORK_NAME,
  declaredVersions,
  forkIsWired,
  measure,
} from '../index.mjs';
import { packageRoot as findPackageRoot, repoRoot as findRepoRoot } from '../../../../libraries/repo-root/index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const CORE_ROOT = findPackageRoot(HERE);
const REPO_ROOT = findRepoRoot(HERE);

const INGRESS = 'src/infrastructure/compilers/runtime/theme/runtime/ingress';
const COMPONENT = 'src/components/primitives/display/probe';

const sandboxes = [];
after(() => { for (const dir of sandboxes) rmSync(dir, { recursive: true, force: true }); });

/** A sandbox carrying the ingress, the contract and one component directory. */
function sandbox() {
  const repo = mkdtempSync(join(tmpdir(), 'cat04-version-'));
  sandboxes.push(repo);
  const core = join(repo, 'packages/core');
  mkdirSync(join(core, 'src'), { recursive: true });
  mkdirSync(join(core, COMPONENT), { recursive: true });
  writeFileSync(join(core, 'package.json'), '{"name":"@rottay/design-system"}\n');
  writeFileSync(join(repo, 'pnpm-workspace.yaml'), 'packages:\n  - packages/*\n');
  cpSync(join(CORE_ROOT, INGRESS), join(core, INGRESS), { recursive: true });
  mkdirSync(dirname(join(core, CONTRACT_FILE)), { recursive: true });
  cpSync(join(CORE_ROOT, CONTRACT_FILE), join(core, CONTRACT_FILE));
  return { repo, core };
}

const options = ({ repo, core }) => ({ coreRoot: core, repoRoot: repo });
const rules = (result) => result.findings.map((finding) => finding.rule);

describe('theme-document-version — the measurement', () => {
  it('the real tree has no v2 literal in a write position', () => {
    const result = measure();
    assert.deepEqual(result.findings, []);
    assert.deepEqual(result.versions, [2, 3]);
  });

  it('finds the migrate chain, so the scan is not empty', () => {
    assert.ok(measure().literals.length > 0);
  });

  it('reads the version set off the contract itself', () => {
    assert.deepEqual(declaredVersions(CORE_ROOT), [2, 3]);
  });

  it(`sees ${FORK_NAME} wired into ${FORK_CALLER}`, () => {
    assert.ok(forkIsWired(CORE_ROOT).calledFrom.includes(FORK_CALLER));
  });
});

describe('theme-document-version — the drills', () => {
  it('goes RED on a v2 literal handed to a persistence producer', () => {
    const box = sandbox();
    writeFileSync(
      join(box.core, COMPONENT, 'index.ts'),
      [
        'import { compileTenantThemeDocumentV2 } from "@/x";',
        'export const published = compileTenantThemeDocumentV2({',
        '  document: { version: 2, plan: "pro", decisions: {} },',
        '});',
        '',
      ].join('\n'),
    );
    assert.ok(rules(measure(options(box))).includes('V2_LITERAL_IN_WRITE_POSITION'));
  });

  it('STAYS GREEN on a v2 literal inside the migrate chain', () => {
    // The other half of the write-position definition, and the one a careless
    // gate gets wrong: the migration's own literal is a read-path lift.
    const box = sandbox();
    assert.ok(!rules(measure(options(box))).includes('V2_LITERAL_IN_WRITE_POSITION'));
    assert.ok(measure(options(box)).literals.some((literal) => literal.enclosing === DECLARED_V2_WRITERS[0].name));
  });

  it('goes RED when the declared migrate writer stops writing one', () => {
    const box = sandbox();
    const file = join(box.core, DECLARED_V2_WRITERS[0].file);
    writeFileSync(
      file,
      readFileSync(file, 'utf8').replace(
        'return assertTenantThemeDocumentV2({\n    version: TENANT_THEME_DOCUMENT_VERSION_V2,',
        'return assertTenantThemeDocumentV2({\n    version: 2 as 2 as never,',
      ),
    );
    const result = measure(options(box));
    assert.ok(rules(result).includes('DECLARED_WRITER_MISSING'));
  });

  it('goes RED when the version fork is unwired from admitDocument', () => {
    // The one-line mutation that costs nothing, keeps every type correct, and
    // returns two public doors to a bare TypeError.
    const box = sandbox();
    const file = join(box.core, ADMISSION_FILE);
    writeFileSync(
      file,
      readFileSync(file, 'utf8').replace('assertSupportedDocumentVersion(input.document);', ''),
    );
    assert.ok(rules(measure(options(box))).includes('VERSION_FORK_NOT_CALLED'));
  });

  it('goes RED when the contract stops declaring v3', () => {
    const box = sandbox();
    const file = join(box.core, CONTRACT_FILE);
    writeFileSync(
      file,
      readFileSync(file, 'utf8').replace(
        'export const TENANT_THEME_DOCUMENT_VERSION_V3 = 3 as const;',
        'const RETIRED_V3 = 3;',
      ),
    );
    assert.ok(rules(measure(options(box))).includes('VERSION_SET_UNEXPECTED'));
  });

  it('goes RED on an empty scan, so a walk that stopped walking is a finding', () => {
    const repo = mkdtempSync(join(tmpdir(), 'cat04-version-empty-'));
    sandboxes.push(repo);
    const core = join(repo, 'packages/core');
    mkdirSync(join(core, 'src'), { recursive: true });
    writeFileSync(join(core, 'package.json'), '{"name":"@rottay/design-system"}\n');
    writeFileSync(join(repo, 'pnpm-workspace.yaml'), 'packages:\n  - packages/*\n');
    assert.ok(rules(measure({ coreRoot: core, repoRoot: repo })).includes('VACUOUS_SCAN'));
  });
});
