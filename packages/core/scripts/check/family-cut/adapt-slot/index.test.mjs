/**
 * Drills of the adapt-slot gate.
 *
 * Each drill mirrors the reference family and the adaptation contract into a
 * tmpdir sandbox, plants the shape a real regression takes, and asserts the
 * gate turns red. The mirror itself is the control: unedited, it is green.
 */

import assert from 'node:assert/strict';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import test from 'node:test';

import { packageRoot as findPackageRoot } from '../../../libraries/repo-root/index.mjs';
import { collectChannelProducers } from '../../../libraries/tokens/producers/index.mjs';
import { judgeFamily, measureFamily, resolveFamily } from '../index.mjs';
import {
  CONTRACT_ROOT,
  REGISTRY_SOURCE,
  censusPostureVocabulary,
  collectAdaptSlot,
  readLayoutSensitiveFamilies,
} from './index.mjs';

const ROOT = findPackageRoot(new URL('.', import.meta.url).pathname);
const OWNER = 'src/components/patterns/data/data-table';
const CONTRACTS = `${OWNER}/contracts/index.ts`;
const PRESENTATION = `${OWNER}/presentation/table/index.tsx`;

function withSandbox(edit, run) {
  const sandbox = mkdtempSync(join(tmpdir(), 'adapt-slot-drill-'));
  try {
    for (const relativePath of [OWNER, CONTRACT_ROOT]) {
      const target = join(sandbox, relativePath);
      mkdirSync(dirname(target), { recursive: true });
      cpSync(join(ROOT, relativePath), target, { recursive: true });
    }
    edit(sandbox);
    run(sandbox);
  } finally {
    rmSync(sandbox, { recursive: true, force: true });
  }
}

const patch = (sandbox, relativePath, replace) => {
  const file = join(sandbox, relativePath);
  const before = readFileSync(file, 'utf8');
  const after = replace(before);
  assert.notEqual(after, before, `the plant must change ${relativePath}`);
  writeFileSync(file, after);
};

const onlyDataTable = (sandbox) => collectAdaptSlot({ root: sandbox, only: 'data-table' }).findings;

test('declares the seven layout-sensitive families, each with one owner and a cut', () => {
  const families = readLayoutSensitiveFamilies();
  assert.deepEqual(
    families.map((entry) => entry.family),
    ['data-table', 'card', 'grid', 'form', 'app-shell', 'modal', 'charts'],
  );
  for (const entry of families) {
    assert.equal(entry.layoutSensitive, true);
    assert.match(entry.owner, /^src\/components\//);
    assert.match(entry.cut, /^WO-FAM-\d{2}$/);
  }
});

test('the reference family holds every arm on the live tree', () => {
  const { measurements, findings } = collectAdaptSlot({ only: 'data-table' });
  assert.deepEqual(findings, []);
  assert.deepEqual(measurements[0].arms, { acceptsAdapt: true, stampsPosture: true, oneVocabulary: true });
});

test('a family whose cut has not landed is red, by design', () => {
  const { findings } = collectAdaptSlot({ only: 'card' });
  assert.ok(findings.some((finding) => finding.includes('card (WO-FAM-06): accepts-adapt')), JSON.stringify(findings));
  assert.ok(findings.some((finding) => finding.includes('card (WO-FAM-06): stamps-posture')), JSON.stringify(findings));
});

test('the whole-registry run is red while any declared family lacks the slot', () => {
  const { findings } = collectAdaptSlot();
  assert.ok(findings.length > 0);
  assert.equal(findings.filter((finding) => finding.startsWith('data-table')).length, 0);
});

test('an unknown family is refused by name, not skipped', () => {
  const { findings } = collectAdaptSlot({ only: 'button' });
  assert.ok(findings.some((finding) => finding.includes('button is not a declared layout-sensitive family')));
});

test('the sandbox mirror measures exactly what the live tree measures', () => {
  withSandbox(() => {}, (sandbox) => assert.deepEqual(onlyDataTable(sandbox), []));
});

test('removing the `adapt` member turns accepts-adapt red', () => {
  withSandbox(
    (sandbox) => patch(sandbox, CONTRACTS, (text) => text.replace('adapt?: Adapt<DataTableAdaptation>;', '')),
    (sandbox) => {
      const findings = onlyDataTable(sandbox);
      assert.ok(findings.some((finding) => finding.includes('accepts-adapt')), JSON.stringify(findings));
    },
  );
});

test('an `adapt` member typed as a family-local shape is not the slot', () => {
  withSandbox(
    (sandbox) => patch(sandbox, CONTRACTS, (text) =>
      text.replace('adapt?: Adapt<DataTableAdaptation>;', 'adapt?: Record<string, DataTableAdaptation>;')),
    (sandbox) => {
      const findings = onlyDataTable(sandbox);
      assert.ok(findings.some((finding) => finding.includes('accepts-adapt')), JSON.stringify(findings));
    },
  );
});

test('a literal `data-posture` is written, not resolved, and is red', () => {
  withSandbox(
    (sandbox) => patch(sandbox, PRESENTATION, (text) =>
      text.replaceAll('data-posture={postureAttribute}', 'data-posture="compact"')),
    (sandbox) => {
      const findings = onlyDataTable(sandbox);
      assert.ok(findings.some((finding) => finding.includes('literal `data-posture`')), JSON.stringify(findings));
      assert.ok(findings.some((finding) => finding.includes('stamps no computed `data-posture`')), JSON.stringify(findings));
    },
  );
});

test('a posture stamped without the shared runtime is red', () => {
  withSandbox(
    (sandbox) => patch(sandbox, PRESENTATION, (text) =>
      text.replace('import { useAdaptation } from "@/infrastructure/runtime/adaptation";',
        'import { useAdaptation } from "./local-adaptation";')),
    (sandbox) => {
      const findings = onlyDataTable(sandbox);
      assert.ok(findings.some((finding) => finding.includes('never resolves it through useAdaptation')), JSON.stringify(findings));
    },
  );
});

test('a family-local posture vocabulary is red', () => {
  withSandbox(
    (sandbox) => patch(sandbox, CONTRACTS, (text) =>
      `${text}\nexport type DataTablePosture = 'compact' | 'standard' | 'expanded';\n`),
    (sandbox) => {
      const findings = onlyDataTable(sandbox);
      assert.ok(findings.some((finding) => finding.includes('one-vocabulary')), JSON.stringify(findings));
    },
  );
});

test('a declared owner that does not exist is red', () => {
  withSandbox(
    (sandbox) => patch(sandbox, REGISTRY_SOURCE, (text) =>
      text.replace("owner: 'src/components/patterns/data/data-table'", "owner: 'src/components/patterns/data/data-grid'")),
    (sandbox) => {
      const findings = onlyDataTable(sandbox);
      assert.ok(findings.some((finding) => finding.includes('does not exist')), JSON.stringify(findings));
    },
  );
});

test('the live census counts one posture vocabulary', () => {
  const census = censusPostureVocabulary();
  assert.deepEqual(census.vocabulary, {
    viewport: ['phone', 'tablet', 'desktop'],
    container: ['compact', 'regular', 'expanded'],
  });
  assert.deepEqual(census.foreign, []);
  assert.equal(census.vocabularies, 1);
  assert.ok(census.sets.length > 0, 'a census that sees no posture set proves nothing');
});

test('the census counts a second vocabulary: the pre-contract container posture', () => {
  withSandbox(
    (sandbox) => {
      const file = join(sandbox, 'src/components/patterns/runtime/adaptive-layout/foundation/index.ts');
      mkdirSync(dirname(file), { recursive: true });
      writeFileSync(file, "export type ContainerPosture = 'compact' | 'standard' | 'expanded';\n");
    },
    (sandbox) => {
      const census = censusPostureVocabulary(sandbox);
      assert.equal(census.vocabularies, 2);
      assert.deepEqual(census.foreign.map((set) => set.foreign), [['standard']]);
    },
  );
});

test('the census does not mistake a non-posture set for a vocabulary', () => {
  withSandbox(
    (sandbox) => {
      const file = join(sandbox, 'src/foundation/contracts/kernel/control-height/index.ts');
      mkdirSync(dirname(file), { recursive: true });
      writeFileSync(file, "export type ControlHeight = 'compact' | 'standard' | 'tall';\n");
    },
    (sandbox) => assert.equal(censusPostureVocabulary(sandbox).vocabularies, 1),
  );
});

test('family-cut holds a rostered layout-sensitive family to the slot as BLOCKING', () => {
  const producers = collectChannelProducers().producers;
  const measured = measureFamily(resolveFamily('card'), { producers });
  assert.ok(measured.blocking.adaptSlot.length > 0);
  const findings = judgeFamily(measured, { cut: 'WO-FAM-06' });
  assert.ok(findings.some((finding) => finding.startsWith('card: BLOCKING adapt-slot')), JSON.stringify(findings));

  const button = measureFamily(resolveFamily('button'), { producers });
  assert.deepEqual(button.blocking.adaptSlot, []);
});
