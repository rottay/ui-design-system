/**
 * The drill for `theme-single-listing`. The gate's whole value is that it can
 * see a second listing appear, so each law is planted and its refusal asserted.
 */

import assert from 'node:assert/strict';
import { cpSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import test from 'node:test';

import {
  NAMING_EXCEPTIONS,
  RETIRED_CONTROL_PATH,
  RETIRED_MODEL_PATH,
  SCANNED_ROOTS,
  collectFindings,
} from './index.mjs';
import { packageRoot as findPackageRoot } from '../../../libraries/repo-root/index.mjs';

const CORE_ROOT = findPackageRoot(dirname(new URL(import.meta.url).pathname));

/** A sandbox that mirrors only what this gate reads. */
function sandbox(mutate) {
  const box = mkdtempSync(join(tmpdir(), 'theme-single-listing-'));
  try {
    for (const root of [...SCANNED_ROOTS, 'src/contracts/theme']) {
      cpSync(join(CORE_ROOT, root), join(box, root), { recursive: true });
    }
    cpSync(
      join(CORE_ROOT, 'src/foundation/contracts/composition/tenants/capabilities'),
      join(box, 'src/foundation/contracts/composition/tenants/capabilities'),
      { recursive: true },
    );
    const options = { coreRoot: box };
    mutate({
      box,
      write: (rel, text) => {
        mkdirSync(dirname(join(box, rel)), { recursive: true });
        writeFileSync(join(box, rel), text);
      },
      inject: (registryRows) => { options.registryRows = registryRows; },
    });
    return collectFindings(options);
  } finally {
    rmSync(box, { recursive: true, force: true });
  }
}

test('the live tree passes', () => {
  assert.deepEqual(collectFindings(), []);
});

test('every naming exception carries a written reason', () => {
  assert.ok(NAMING_EXCEPTIONS.length > 0);
  for (const entry of NAMING_EXCEPTIONS) {
    assert.ok(entry.path.endsWith('.mjs'), `${entry.path} must name a module`);
    assert.ok(
      typeof entry.reason === 'string' && entry.reason.trim().length >= 40,
      `${entry.path} needs a written reason, not a placeholder`,
    );
  }
});

test('DRILL: a gate that starts reading the retired control documents fails', () => {
  const findings = sandbox(({ write }) => {
    write(
      'scripts/check/planted/index.mjs',
      `const dir = '${RETIRED_CONTROL_PATH}';\nexport default dir;\n`,
    );
  });
  assert.equal(findings.length, 1, JSON.stringify(findings));
  assert.match(findings[0], /scripts\/check\/planted\/index\.mjs still reads/u);
});

test('DRILL: the excepted modules are excepted, and only them', () => {
  // Planting the same string in an EXCEPTED path must stay green, so the
  // exception list is proven to be doing the work the drill above measures.
  const findings = sandbox(({ write }) => {
    write(
      'scripts/libraries/manifest/rules/index.mjs',
      `// ${RETIRED_CONTROL_PATH}\nexport const rules = [];\n`,
    );
  });
  assert.deepEqual(findings, []);
});

test('DRILL: resurrecting the customization-model contract fails', () => {
  const findings = sandbox(({ write }) => {
    write(`${RETIRED_MODEL_PATH}/index.json`, '{}\n');
  });
  assert.equal(findings.length, 1, JSON.stringify(findings));
  assert.match(findings[0], /still exists; WO-CAT-02 deletes it/u);
});

test('DRILL: a capability the catalog does not recognise fails', () => {
  const findings = sandbox(({ inject }) => {
    inject([
      { id: 'palette.seeds', tier: 'standard', status: 'active' },
      { id: 'palette.brand-new-control', tier: 'standard', status: 'active' },
    ]);
  });
  assert.ok(
    findings.some((finding) => /declares "palette\.brand-new-control"/u.test(finding)),
    JSON.stringify(findings),
  );
});

test('DRILL: a registry that only SHRINKS stays green — the population is frozen, not pinned', () => {
  const findings = sandbox(({ inject }) => {
    inject([{ id: 'palette.seeds', tier: 'standard', status: 'active' }]);
  });
  assert.deepEqual(findings, []);
});
