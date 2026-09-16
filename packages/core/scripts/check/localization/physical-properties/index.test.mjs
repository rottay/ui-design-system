/**
 * physical-properties drills.
 *
 * Every drill plants a REAL physical site -- in each spelling a style object
 * accepts -- and asserts the gate turns red. Nothing is planted in the real
 * tree: each drill mirrors `src/components` into a tmpdir sandbox, edits the
 * copy, and measures that.
 *
 * The spellings are the point, and the reason is WO-INV-01's own history: its
 * roster was built by a grep for ONE spelling of `closest('[dir]')`, and the
 * tree answered in four. A detector that only sees `left:` would miss
 * `'left':` the day someone quotes a key.
 */
import { strict as assert } from 'node:assert';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

import {
  FROZEN,
  PHYSICAL_PROPERTIES,
  SCAN_ROOT,
  judge,
  namedExceptions,
  physicalCounts,
  physicalSites,
  readBaseline,
  run,
} from './index.mjs';
import { packageRoot as findPackageRoot } from '../../../libraries/repo-root/index.mjs';

const ROOT = findPackageRoot(dirname(fileURLToPath(import.meta.url)));

/** A file no band declares, so a planted site is unambiguously the drill's. */
const CLEAN_FILE = 'primitives/layout/box/engines/modern/index.tsx';
/**
 * The one debt row left. The corrections lot cleared the two live ones; this is
 * `menuItemStyle`'s `textAlign: 'left'`, a DEAD export that retires under
 * WO-RET-04 rather than being made logical, so it is the row that stays put.
 * It is a `.ts` file, hence the CSSProperties plant below rather than a JSX one.
 */
const PINNED_DEBT = 'patterns/foundation/engine-styles/modern/index.ts';

function withPlantedTree(edit, assertFindings) {
  const sandbox = mkdtempSync(join(tmpdir(), 'physical-properties-drill-'));
  try {
    const target = join(sandbox, SCAN_ROOT);
    mkdirSync(dirname(target), { recursive: true });
    cpSync(join(ROOT, SCAN_ROOT), target, { recursive: true });
    edit(sandbox);
    assertFindings(judge(physicalCounts(sandbox)), physicalCounts(sandbox));
  } finally {
    rmSync(sandbox, { recursive: true, force: true });
  }
}

/**
 * Appends a style object carrying the planted site. A `.tsx` file gets a
 * component, a `.ts` file a typed constant -- the gate reads both shapes, and
 * planting JSX into a `.ts` module would be testing the parser, not the law.
 */
const plant = (sandbox, relativePath, styleBody) => {
  const file = join(sandbox, SCAN_ROOT, relativePath);
  const planted = relativePath.endsWith('.tsx')
    ? `export const PlantedDrill = () => <div style={{ ${styleBody} }} />;`
    : `export const plantedDrillStyle: CSSProperties = { ${styleBody} };`;
  writeFileSync(file, `${readFileSync(file, 'utf8')}\n${planted}\n`);
};

const mentions = (findings, fragment) => findings.filter((finding) => finding.includes(fragment));

// ---------------------------------------------------------------------------
// The tree as it stands
// ---------------------------------------------------------------------------

test('the live tree matches its baseline', () => {
  assert.deepEqual(run().findings, []);
});

test('the pinned numbers are the measurement, not a guess', () => {
  const counts = physicalCounts();
  const baseline = readBaseline();
  for (const band of ['pinnedDebt', 'inert', 'namedExceptions']) {
    for (const [path, pin] of Object.entries(baseline[band])) {
      assert.equal(counts[path], pin.sites, `${band} pin for ${path} must be the measurement`);
    }
  }
});

test('every file the scan finds belongs to exactly one band', () => {
  const baseline = readBaseline();
  for (const path of Object.keys(physicalCounts())) {
    const bands = ['pinnedDebt', 'inert', 'namedExceptions'].filter((band) => baseline[band][path]);
    assert.equal(bands.length, 1, `${path} is in ${bands.length} bands: ${bands.join(', ')}`);
  }
});

test('the sandbox mirror measures exactly what the real tree measures', () => {
  // The control for every planted red below: if the mirror did not reproduce
  // the real measurement, a planted red would prove nothing about the gate.
  withPlantedTree(() => {}, (findings) => {
    assert.deepEqual(findings, []);
  });
});

test('the corpus is not vacuous and the clean file really is clean', () => {
  // The floor is the NAMED EXCEPTIONS, not the debt: debt is supposed to reach
  // zero, and a floor tied to it would have to be lowered on every correction
  // until it asserted nothing. The six measured-coordinate readers are
  // permanent by adjudication.
  const sites = physicalSites();
  const exceptionSites = sites.filter((site) => namedExceptions()[site.path]);
  assert.ok(sites.length >= 6, `only ${sites.length} sites found -- an empty scan is never a pass`);
  assert.equal(exceptionSites.length, 6, 'the six measured-coordinate readers carry one site each');
  assert.equal(physicalCounts()[CLEAN_FILE], undefined, `${CLEAN_FILE} must hold no physical site`);
});

test('the frozen engines are excluded by path, never measured', () => {
  for (const site of physicalSites()) {
    assert.ok(!FROZEN.test(`/${site.path}`), `a frozen file reached the census: ${site.path}`);
  }
  // And the exclusion is not vacuous: the tree really does hold frozen sites.
  assert.ok(FROZEN.test('/primitives/feedback/modal/engines/rustic/index.tsx'));
});

// ---------------------------------------------------------------------------
// Planted reds: every spelling a style object accepts
// ---------------------------------------------------------------------------

const SPELLINGS = [
  ['a bare key', "marginLeft: 4"],
  ['a single-quoted key', "'marginLeft': 4"],
  ['a double-quoted key', '"paddingRight": 8'],
  ['a backtick key', '`borderLeftWidth`: 1'],
  ['a physical inset', "left: 12"],
  ['a physical text alignment', "textAlign: 'right'"],
  ['a float', "float: 'left'"],
];

for (const [label, styleBody] of SPELLINGS) {
  test(`a planted physical site written as ${label} turns the gate red`, () => {
    withPlantedTree(
      (sandbox) => plant(sandbox, CLEAN_FILE, styleBody),
      (findings) => {
        const reported = mentions(findings, CLEAN_FILE);
        assert.equal(reported.length, 1, `expected one finding; got ${JSON.stringify(findings, null, 1)}`);
        assert.ok(reported[0].includes('no band declares'), reported[0]);
      },
    );
  });
}

test('a direction-NEUTRAL value on a value-gated property is not a finding', () => {
  // `textAlign: 'center'` and `float: 'none'` follow no direction, so counting
  // them would make the gate fire on paint that has nothing to migrate.
  withPlantedTree(
    (sandbox) => plant(sandbox, CLEAN_FILE, "textAlign: 'center', float: 'none'"),
    (findings) => {
      assert.deepEqual(mentions(findings, CLEAN_FILE), []);
    },
  );
});

test('a logical spelling is never a finding', () => {
  withPlantedTree(
    (sandbox) => plant(sandbox, CLEAN_FILE, "marginInlineStart: 4, insetInlineEnd: 8, textAlign: 'start'"),
    (findings) => {
      assert.deepEqual(mentions(findings, CLEAN_FILE), []);
    },
  );
});

test('a SECOND site in an already-pinned file grows its count and fails', () => {
  const pin = readBaseline().pinnedDebt[PINNED_DEBT].sites;
  withPlantedTree(
    (sandbox) => plant(sandbox, PINNED_DEBT, 'marginRight: 4'),
    (findings) => {
      const reported = mentions(findings, PINNED_DEBT);
      assert.equal(reported.length, 1, JSON.stringify(findings, null, 1));
      assert.ok(reported[0].includes(`GREW from ${pin} to ${pin + 1}`), reported[0]);
      assert.ok(reported[0].includes('debt'), 'the finding must name the band');
    },
  );
});

test('a second site in an INERT file grows that band too', () => {
  const inertPath = 'primitives/runtime/overlay/backdrop/index.tsx';
  const pin = readBaseline().inert[inertPath].sites;
  withPlantedTree(
    (sandbox) => plant(sandbox, inertPath, 'marginLeft: 4'),
    (findings) => {
      const reported = mentions(findings, inertPath);
      assert.equal(reported.length, 1, JSON.stringify(findings, null, 1));
      assert.ok(reported[0].includes(`GREW from ${pin} to ${pin + 1}`), reported[0]);
      assert.ok(reported[0].includes('inert'), 'the finding must name the band');
    },
  );
});

test('a NAMED EXCEPTION file is not counted, in either direction', () => {
  const exceptionPath = Object.keys(namedExceptions())[0];
  withPlantedTree(
    (sandbox) => plant(sandbox, exceptionPath, 'marginLeft: 4'),
    (findings) => {
      assert.deepEqual(mentions(findings, exceptionPath), [], 'a declared measured-space reader is exempt by path');
    },
  );
});

test('a correction that removes a site fails with an instruction to LOWER the pin', () => {
  // The ratchet direction: shrinking is red too, so the pin follows the tree
  // down instead of quietly keeping room for the site to come back.
  withPlantedTree(
    (sandbox) => {
      const file = join(sandbox, SCAN_ROOT, PINNED_DEBT);
      writeFileSync(
        file,
        readFileSync(file, 'utf8').replace("textAlign: 'left' as const", "textAlign: 'start' as const"),
      );
    },
    (findings) => {
      const reported = mentions(findings, PINNED_DEBT);
      assert.equal(reported.length, 1, JSON.stringify(findings, null, 1));
      assert.ok(reported[0].includes('remove the pin') || reported[0].includes('lower the pin'), reported[0]);
    },
  );
});

// ---------------------------------------------------------------------------
// The bands are declarations, not a silent allowlist
// ---------------------------------------------------------------------------

test('every band row carries a reason long enough to be one', () => {
  const baseline = readBaseline();
  for (const band of ['namedExceptions', 'pinnedDebt', 'inert']) {
    const rows = Object.entries(baseline[band]);
    assert.ok(rows.length > 0, `${band} must not be empty-by-accident`);
    for (const [path, pin] of rows) {
      assert.ok(pin.reason.length > 120, `a one-line reason is not a reason: ${band} ${path}`);
      assert.ok(Number.isInteger(pin.sites) && pin.sites > 0, `${band} ${path} must pin a real count`);
    }
  }
});

test('the property vocabulary is closed and every name has a logical counterpart', () => {
  assert.ok(PHYSICAL_PROPERTIES.length >= 18, 'the vocabulary must not have been trimmed to fit');
  for (const property of PHYSICAL_PROPERTIES) {
    assert.ok(
      /Left|Right|^left$|^right$|textAlign|float/.test(property),
      `${property} is not a physical-edge property`,
    );
  }
});
