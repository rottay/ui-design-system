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
const CHARTS_OWNER = 'src/components/patterns/visualization/charts';
const CHARTS_CONTRACTS = `${CHARTS_OWNER}/contracts/index.ts`;
const CHARTS_COMPACT = `${CHARTS_OWNER}/runtime/responsive/compact-mode/index.ts`;
const CHARTS_SCAFFOLD = `${CHARTS_OWNER}/presentation/scaffold/index.tsx`;

function withSandbox(edit, run, mirrored = [OWNER, CONTRACT_ROOT]) {
  const sandbox = mkdtempSync(join(tmpdir(), 'adapt-slot-drill-'));
  try {
    for (const relativePath of mirrored) {
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
const onlyCharts = (sandbox) => collectAdaptSlot({ root: sandbox, only: 'charts' }).findings;
const withChartsSandbox = (edit, run) => withSandbox(edit, run, [CHARTS_OWNER, CONTRACT_ROOT]);

test('every declared layout-sensitive family has one owner and a cut, with no duplicates', () => {
  const families = readLayoutSensitiveFamilies();
  assert.ok(families.length > 0, 'the registry declares at least one family');
  const names = families.map((entry) => entry.family);
  assert.equal(new Set(names).size, names.length, 'no family is declared twice');
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

test('charts holds every arm on the live tree', () => {
  const { measurements, findings } = collectAdaptSlot({ only: 'charts' });
  assert.deepEqual(findings, []);
  assert.deepEqual(measurements[0].arms, { acceptsAdapt: true, stampsPosture: true, oneVocabulary: true });
});

test('the whole-registry run is green: every declared family holds every arm', () => {
  const { families, measurements, findings } = collectAdaptSlot();
  assert.deepEqual(findings, []);
  assert.equal(measurements.length, families.length);
  assert.ok(measurements.every((measured) => Object.values(measured.arms).every(Boolean)), JSON.stringify(measurements));
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

test('the unedited charts sandbox mirror measures exactly what the live tree measures', () => {
  withChartsSandbox(() => {}, (sandbox) => assert.deepEqual(onlyCharts(sandbox), []));
});

test('charts: removing BOTH `adapt` members turns accepts-adapt red', () => {
  withChartsSandbox(
    (sandbox) => {
      patch(sandbox, CHARTS_CONTRACTS, (text) => text.replace('adapt?: Adapt<ChartAdaptation>;', ''));
      patch(sandbox, CHARTS_COMPACT, (text) => text.replace('adapt?: Adapt<ChartAdaptation>;', ''));
    },
    (sandbox) => {
      const findings = onlyCharts(sandbox);
      assert.ok(findings.some((finding) => finding.includes('charts (WO-FAM-09): accepts-adapt')), JSON.stringify(findings));
    },
  );
});

test('charts: the gate is owner-wide, so the props member alone is not what it measures', () => {
  // The hook options keep the arm green; the per-family props guarantee is
  // ChartCapabilityTraits under typecheck:tests, not this gate.
  withChartsSandbox(
    (sandbox) => patch(sandbox, CHARTS_CONTRACTS, (text) => text.replace('adapt?: Adapt<ChartAdaptation>;', '')),
    (sandbox) => assert.deepEqual(onlyCharts(sandbox), []),
  );
});

test('charts: repointing BOTH useAdaptation imports is red', () => {
  const repoint = (text) => text.replace(
    "import { useAdaptation } from '@/infrastructure/runtime/adaptation';",
    "import { useAdaptation } from './local-adaptation';",
  );
  withChartsSandbox(
    (sandbox) => {
      patch(sandbox, CHARTS_COMPACT, repoint);
      patch(sandbox, CHARTS_SCAFFOLD, repoint);
    },
    (sandbox) => {
      const findings = onlyCharts(sandbox);
      assert.ok(findings.some((finding) => finding.includes('never resolves it through useAdaptation')), JSON.stringify(findings));
    },
  );
});

test('charts: a literal `data-posture` on every scaffold root is red', () => {
  withChartsSandbox(
    (sandbox) => patch(sandbox, CHARTS_SCAFFOLD, (text) => {
      assert.equal(text.split('data-posture={stampedPosture}').length - 1, 3, 'the scaffold stamps its three lifecycle roots');
      return text.replaceAll('data-posture={stampedPosture}', 'data-posture="compact"');
    }),
    (sandbox) => {
      const findings = onlyCharts(sandbox);
      assert.equal(findings.filter((finding) => finding.includes('literal `data-posture`')).length, 3, JSON.stringify(findings));
      assert.ok(findings.some((finding) => finding.includes('stamps no computed `data-posture`')), JSON.stringify(findings));
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
  assert.deepEqual(measureFamily(resolveFamily('charts'), { producers }).blocking.adaptSlot, []);

  withChartsSandbox(() => {}, (sandbox) => {
    assert.deepEqual(measureFamily(resolveFamily('charts', sandbox), { producers }).blocking.adaptSlot, []);
  });

  withChartsSandbox(
    (sandbox) => {
      patch(sandbox, CHARTS_CONTRACTS, (text) => text.replace('adapt?: Adapt<ChartAdaptation>;', ''));
      patch(sandbox, CHARTS_COMPACT, (text) => text.replace('adapt?: Adapt<ChartAdaptation>;', ''));
    },
    (sandbox) => {
      const resolved = resolveFamily('charts', sandbox);
      assert.deepEqual(resolved.componentDirs.map((dir) => dir.slice(sandbox.length + 1)), [CHARTS_OWNER]);
      const measured = measureFamily(resolved, { producers });
      assert.ok(measured.blocking.adaptSlot.length > 0);
      const findings = judgeFamily(measured, { cut: 'WO-FAM-09' });
      assert.ok(
        findings.some((finding) => finding.startsWith('charts: BLOCKING adapt-slot charts (WO-FAM-09): accepts-adapt')),
        JSON.stringify(findings),
      );
    },
  );

  const button = measureFamily(resolveFamily('button'), { producers });
  assert.deepEqual(button.blocking.adaptSlot, []);
});
