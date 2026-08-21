/**
 * Drills for root-exposure-gate. Every one plants a real defect in the real
 * tree and restores it, because a gate whose drills only ever feed it a fixture
 * proves the fixture, not the tree.
 *
 * The three laws each get a planted red, and the two escape hatches that make
 * the live tree green -- `representativeOnly` channel lists and the written
 * gap adjudication -- each get a control proving they are load-bearing rather
 * than decorative.
 */

import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';

import { CATALOG_PATH, CONTROLS_DIR, collectFindings, countByExposure } from './index.mjs';

function expectFinding(findings, fragment, message) {
  assert.ok(
    findings.some((finding) => finding.includes(fragment)),
    `${message}; got ${JSON.stringify(findings, null, 1)}`,
  );
}

/** Plant a mutated catalog, run the gate, restore -- always. */
function withCatalog(mutate, run) {
  const original = readFileSync(CATALOG_PATH, 'utf8');
  try {
    const doc = JSON.parse(original);
    mutate(doc);
    writeFileSync(CATALOG_PATH, `${JSON.stringify(doc, null, 2)}\n`);
    run(collectFindings());
  } finally {
    writeFileSync(CATALOG_PATH, original);
  }
}

function withControl(controlId, mutate, run) {
  const target = join(CONTROLS_DIR, `${controlId}.json`);
  const original = readFileSync(target, 'utf8');
  try {
    const doc = JSON.parse(original);
    mutate(doc);
    writeFileSync(target, `${JSON.stringify(doc, null, 2)}\n`);
    run(collectFindings());
  } finally {
    writeFileSync(target, original);
  }
}

const findRoot = (doc, exposure) => doc.roots.find((root) => root.exposure === exposure);

test('the live tree passes', () => {
  assert.deepEqual(collectFindings(), []);
});

test('the live snapshot is the measured one, not a guess', () => {
  const counts = countByExposure(JSON.parse(readFileSync(CATALOG_PATH, 'utf8')).roots);
  // F4A-6 (K3): entra `tier.page.ink` (--ds-color-text-page) como cabeza
  // interna — internal-head hasta que F4B le de dial, que es lo que hacen sus
  // cinco hermanas de tinta. tenant-dial y gap no se mueven.
  assert.deepEqual(counts, { 'tenant-dial': 26, 'internal-head': 28, gap: 10 });
});

/* ---------------- LAW 1: a dial with no owner ---------------- */

test('LAW 1: a tenant-dial root with no governedBy fails', () => {
  withCatalog(
    (doc) => {
      findRoot(doc, 'tenant-dial').governedBy = null;
    },
    (findings) => expectFinding(findings, 'but governedBy is null', 'a dial without an owner must fail'),
  );
});

test('LAW 1: a tenant-dial root pointing at a control that does not exist fails', () => {
  withCatalog(
    (doc) => {
      findRoot(doc, 'tenant-dial').governedBy = 'chrome.imaginary';
    },
    (findings) =>
      expectFinding(findings, 'is not a control in manifest/controls/', 'a ghost owner must fail'),
  );
});

/* ---------------- LAW 2: a knobless head that gains a knob ---------------- */

test('LAW 2: an internal-head whose channel a control starts declaring fails', () => {
  const catalog = JSON.parse(readFileSync(CATALOG_PATH, 'utf8'));
  const head = findRoot(catalog, 'internal-head');
  withControl(
    'token-overrides',
    (doc) => {
      doc.declaredOutputs.channels = [...doc.declaredOutputs.channels, head.channel];
    },
    (findings) =>
      expectFinding(
        findings,
        `${head.rootId}: exposure 'internal-head' but token-overrides declares its head channel`,
        'winning a knob in silence must fail',
      ),
  );
});

test('LAW 2: an internal-head that simply names a control fails', () => {
  withCatalog(
    (doc) => {
      findRoot(doc, 'internal-head').governedBy = 'token-overrides';
    },
    (findings) => expectFinding(findings, 'a governed root is a tenant-dial', 'a governed head is a dial'),
  );
});

/* ---------------- LAW 3: gap, decrease-only and adjudicated ---------------- */

test('LAW 3: a gap whose channel a control declares, with no written adjudication, fails', () => {
  const catalog = JSON.parse(readFileSync(CATALOG_PATH, 'utf8'));
  // Two of the ten gaps ALREADY carry a written adjudication naming
  // `token-overrides` (`ramp.seed.error`, `ramp.seed.neutral`); planting on one
  // of those would be admitted, correctly, and prove nothing. Pick a gap with a
  // real head channel whose note does NOT name the control, and say so.
  const gap = catalog.roots.find(
    (root) =>
      root.exposure === 'gap' &&
      typeof root.channel === 'string' &&
      !String(root.exposureNote ?? '').includes('token-overrides'),
  );
  assert.ok(gap, 'the drill needs an unadjudicated gap to plant on');
  withControl(
    'token-overrides',
    (doc) => {
      doc.declaredOutputs.channels = [...doc.declaredOutputs.channels, gap.channel];
    },
    (findings) =>
      expectFinding(
        findings,
        'exposureNote does not name it',
        'a gap that gained a control without being reclassified must fail',
      ),
  );
});

test('CONTROL: the written gap adjudication is load-bearing, not a shrug', () => {
  // `ramp.seed.error` is green today ONLY because its exposureNote names
  // `token-overrides` and says why a per-channel allowlist is not a seed.
  // Strip the name and the same tree goes red.
  withCatalog(
    (doc) => {
      const root = doc.roots.find((entry) => entry.rootId === 'ramp.seed.error');
      root.exposureNote = 'no reason recorded';
    },
    (findings) =>
      expectFinding(
        findings,
        "ramp.seed.error: exposure 'gap' but token-overrides declares its head channel",
        'the adjudication must be what admits the mention',
      ),
  );
});

test('LAW 3: gap is decrease-only -- growth fails', () => {
  withCatalog(
    (doc) => {
      const head = findRoot(doc, 'internal-head');
      head.exposure = 'gap';
      doc.reconciliation.byExposure.counts['internal-head'] -= 1;
      doc.reconciliation.byExposure.counts.gap += 1;
    },
    (findings) => expectFinding(findings, 'snapshot: gap moved from 10 to 11', 'gap may never grow'),
  );
});

test('LAW 3: a gap that closes still fails until the snapshot is updated', () => {
  withCatalog(
    (doc) => {
      const gap = doc.roots.find((root) => root.exposure === 'gap');
      gap.exposure = 'tenant-dial';
      gap.governedBy = 'token-overrides';
      doc.reconciliation.byExposure.counts.gap -= 1;
      doc.reconciliation.byExposure.counts['tenant-dial'] += 1;
    },
    (findings) =>
      expectFinding(findings, 'snapshot: gap shrank from 10 to 9', 'good news still has to be written down'),
  );
});

/* ---------------- catalog self-consistency and vocabulary ---------------- */

test('the catalog must agree with its own reconciliation counts', () => {
  withCatalog(
    (doc) => {
      doc.reconciliation.byExposure.counts.gap = 99;
    },
    (findings) => expectFinding(findings, 'but roots[] holds 10', 'a catalog that miscounts itself must fail'),
  );
});

test('an invented exposure is a typo, not a new category', () => {
  withCatalog(
    (doc) => {
      findRoot(doc, 'gap').exposure = 'sometimes';
    },
    (findings) => expectFinding(findings, 'is not one of tenant-dial | internal-head | gap', 'closed vocabulary'),
  );
});

test('a changed reading fails until it is re-read', () => {
  withCatalog(
    (doc) => {
      doc.reconciliation.byExposure.reading = 'something else entirely';
    },
    (findings) => expectFinding(findings, 'the catalog reading changed', 'the reading is part of the snapshot'),
  );
});
