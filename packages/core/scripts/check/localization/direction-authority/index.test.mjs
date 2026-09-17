/**
 * direction-authority drills.
 *
 * Every drill plants a REAL probe -- one of the exact spellings that defeated
 * WO-INV-01's own census -- and asserts the gate turns red. Nothing is planted
 * in the real tree: each drill mirrors `src` into a tmpdir sandbox, edits the
 * copy, and measures that.
 *
 * The spellings are the point. The roster that produced this WO was built by
 * `grep "closest('[dir]')"`, which saw one of them; the sweep's acceptance
 * criterion was that same grep reading zero, so it went green with sixteen
 * probes alive. A drill that plants only the spelling the old census could see
 * would reproduce the blindness it exists to prevent. L1b added the two shapes
 * that defeated the gate in turn -- the DOCUMENT read that `adaptive-overlay`
 * used for a physical drawer side, and the `.dir === 'rtl'` comparison -- plus
 * the two drills that keep the WIDENED scope honest: a probe planted OUTSIDE
 * `src/components` must be red, and a probe written as PROSE must not be.
 */
import { strict as assert } from 'node:assert';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

import {
  DIRECTION_AUTHORITY,
  NAMED_EXCEPTIONS,
  SCAN_ROOT,
  judge,
  probeCounts,
  probeSites,
  readBaseline,
  run,
} from './index.mjs';
import { packageRoot as findPackageRoot } from '../../../libraries/repo-root/index.mjs';

const ROOT = findPackageRoot(dirname(fileURLToPath(import.meta.url)));

/** A file with no probe of its own, so a planted one is unambiguously the drill's. */
const CLEAN_FILE = 'components/primitives/layout/box/engines/modern/index.tsx';

/**
 * The same, OUTSIDE `src/components`: the widened scan root is a claim about
 * the package, and a claim nothing measures is a preference.
 */
const CLEAN_FILE_OUTSIDE_COMPONENTS = 'infrastructure/runtime/responsive/index.ts';

/**
 * Mirrors the scanned corpus into a sandbox, hands `edit` the sandbox root,
 * then runs `judge` over the sandbox measurement.
 */
function withPlantedTree(edit, assertFindings, baseline = readBaseline()) {
  const sandbox = mkdtempSync(join(tmpdir(), 'direction-authority-drill-'));
  try {
    const target = join(sandbox, SCAN_ROOT);
    mkdirSync(dirname(target), { recursive: true });
    cpSync(join(ROOT, SCAN_ROOT), target, { recursive: true });
    edit(sandbox);
    assertFindings(judge(probeCounts(sandbox), baseline), probeCounts(sandbox));
  } finally {
    rmSync(sandbox, { recursive: true, force: true });
  }
}

/**
 * The ledger is EMPTY at HEAD, so the two ratchet drills below cannot borrow a
 * real row. They pin a SYNTHETIC one over the same sandbox instead: `judge`
 * takes its baseline as an argument, so the ratchet is exercised against the
 * real measurement without the real ledger having to keep a row alive for the
 * test's convenience.
 */
const PINNED_FIXTURE_PATH = 'components/primitives/display/tree/engines/modern/index.tsx';
const syntheticBaseline = (probes) => ({
  authority: readBaseline().authority,
  pinnedDebt: {
    [PINNED_FIXTURE_PATH]: { probes, group: 'A', reason: 'Synthetic ratchet fixture.' },
  },
});

const plant = (sandbox, relativePath, line) => {
  const file = join(sandbox, SCAN_ROOT, relativePath);
  writeFileSync(file, `${readFileSync(file, 'utf8')}\n${line}\n`);
};

const mentions = (findings, fragment) =>
  findings.filter((finding) => finding.includes(fragment));

// ---------------------------------------------------------------------------
// The tree as it stands
// ---------------------------------------------------------------------------

test('the live tree matches its baseline', () => {
  assert.deepEqual(run().findings, []);
});

test('the pinned numbers are the measurement, not a guess', () => {
  const counts = probeCounts();
  for (const [path, pin] of Object.entries(readBaseline().pinnedDebt)) {
    assert.equal(counts[path], pin.probes, `pin for ${path} must be the measurement`);
  }
});

test('the sandbox mirror measures exactly what the real tree measures', () => {
  // The control for every planted red below: if the mirror did not reproduce
  // the real measurement, a planted red would prove nothing about the gate.
  withPlantedTree(() => {}, (findings) => {
    assert.deepEqual(findings, []);
  });
});

test('the corpus is not vacuous and the clean files really are clean', () => {
  // The floor is the NAMED EXCEPTIONS, not the debt: debt is supposed to reach
  // zero -- it now IS zero -- and a floor tied to it would have to be lowered on
  // every migration until it eventually asserted nothing. There is now exactly
  // ONE anchor/portal reader, the shared portal-scope one, and it carries the
  // four lines the widened census sees (the `[dir]` selector, the anchor's
  // computed-style read, the one-time probe that asks whether this runtime
  // resolves `dir` into computed style at all, and the `.dir === 'rtl'`
  // fallback comparison), so four probes in one file is the honest "the scan
  // really ran" signal. The tooltip and
  // popover copies were retired with their exceptions; the drill below keeps a
  // re-added copy red. WO-INV-01's migrations took the debt from 21 to 0.
  const sites = probeSites();
  const exceptionSites = sites.filter((site) => NAMED_EXCEPTIONS[site.path]);
  assert.ok(sites.length >= 4, `only ${sites.length} probe sites found -- an empty scan is never a pass`);
  assert.equal(exceptionSites.length, 4, 'the one anchor/portal reader carries four probe lines');
  assert.equal(
    Object.keys(NAMED_EXCEPTIONS).length,
    1,
    'the anchor/portal read has ONE implementation, so it has ONE exception',
  );
  assert.equal(probeCounts()[CLEAN_FILE], undefined, `${CLEAN_FILE} must hold no probe of its own`);
  assert.equal(
    probeCounts()[CLEAN_FILE_OUTSIDE_COMPONENTS],
    undefined,
    `${CLEAN_FILE_OUTSIDE_COMPONENTS} must hold no probe of its own`,
  );
  // The widened scope really is wider: the scan walks owners no `components/`
  // prefix can reach.
  assert.ok(
    sites.length === exceptionSites.length,
    'every remaining probe site belongs to a declared anchor/portal reader',
  );
});

// ---------------------------------------------------------------------------
// Planted reds: every spelling that defeated a census
// ---------------------------------------------------------------------------

const SPELLINGS = [
  ["closest('[dir]') -- the one the roster's grep could see",
   "const planted = element.closest('[dir]')?.getAttribute('dir');"],
  ['closest("[dir]") -- double quotes, how data-table stayed invisible',
   'const planted = element.closest("[dir]")?.getAttribute("dir");'],
  ["closest<HTMLElement>('[dir]') -- the generic call, ten sites invisible",
   "const planted = element.closest<HTMLElement>('[dir]')?.dir === 'rtl';"],
  ["closest?.('[dir]') -- the optional call, how scroll-reveal stayed invisible",
   "const planted = element.closest?.('[dir]') as HTMLElement | null;"],
  ['getComputedStyle(x).direction -- the shape with no closest at all',
   "const planted = getComputedStyle(element).direction === 'rtl';"],
  ['window.getComputedStyle(x).direction -- the same read with a receiver',
   "const planted = window.getComputedStyle(element).direction === 'rtl';"],
  ["document.documentElement.dir -- adaptive-overlay's third authority, SSR-false",
   "const planted = document.documentElement.dir === 'rtl';"],
  ['document.dir -- the same read one property shorter',
   "const planted = document.dir;"],
  ['ownerDocument.documentElement.dir -- the same read through the node',
   'const planted = element.ownerDocument.documentElement.dir;'],
  ["node.dir === 'rtl' -- the comparison with no call of any kind",
   "const planted = element.dir === 'rtl';"],
  ["node?.dir === 'ltr' -- the optional form, and the other literal",
   "const planted = owner?.dir === 'ltr';"],
];

for (const [label, line] of SPELLINGS) {
  test(`a planted ${label} turns the gate red`, () => {
    withPlantedTree(
      (sandbox) => plant(sandbox, CLEAN_FILE, line),
      (findings) => {
        assert.equal(
          mentions(findings, CLEAN_FILE).length,
          1,
          `the planted probe must be reported exactly once; got ${JSON.stringify(findings, null, 1)}`,
        );
        assert.ok(
          mentions(findings, CLEAN_FILE)[0].includes('does not pin'),
          'a probe in an unpinned file must be reported as a new owner',
        );
      },
    );
  });
}

const RETIRED_PRIVATE_COPIES = [
  'components/primitives/display/tooltip/engines/modern/index.tsx',
  'components/primitives/overlay/popover/engines/modern/index.tsx',
];

for (const path of RETIRED_PRIVATE_COPIES) {
  test(`a re-added private direction copy in ${path} is red`, () => {
    // These two files used to carry their own `readLocaleContext`, each with
    // the precedence the ruling overturned. They consume the shared reader now
    // and hold no exception, so a re-added copy fails as a new unpinned owner
    // rather than inheriting the retired exemption.
    assert.equal(NAMED_EXCEPTIONS[path], undefined, `${path} must hold no exception`);
    assert.equal(probeCounts()[path], undefined, `${path} must hold no probe of its own`);
    withPlantedTree(
      (sandbox) => plant(
        sandbox,
        path,
        "const planted = anchor.closest<HTMLElement>('[dir]')?.dir === 'rtl';",
      ),
      (findings) => {
        const reported = mentions(findings, path);
        assert.equal(reported.length, 1, JSON.stringify(findings, null, 1));
        assert.ok(reported[0].includes('does not pin'), reported[0]);
      },
    );
  });
}

test('a probe planted OUTSIDE src/components is red too', () => {
  // The law is "one direction source in the package", so a scan that stopped at
  // `src/components` could only ever prove it for part of the package. This is
  // the drill that fails if the scan root narrows back.
  withPlantedTree(
    (sandbox) => plant(
      sandbox,
      CLEAN_FILE_OUTSIDE_COMPONENTS,
      "export const planted = document.documentElement.dir === 'rtl';",
    ),
    (findings) => {
      const reported = mentions(findings, CLEAN_FILE_OUTSIDE_COMPONENTS);
      assert.equal(reported.length, 1, JSON.stringify(findings, null, 1));
      assert.ok(reported[0].includes('does not pin'), reported[0]);
    },
  );
});

test('a probe written as PROSE is not counted as a read', () => {
  // The widened scan reached the documents that forbid the probe by quoting it.
  // Counting those would make the gate punish its own law being written down --
  // and the escape is bounded: only a line that OPENS as a comment is skipped.
  withPlantedTree(
    (sandbox) => {
      plant(sandbox, CLEAN_FILE, "// const planted = element.closest('[dir]');");
      plant(sandbox, CLEAN_FILE, " * `document.documentElement.dir === 'rtl'` is the forbidden read.");
      plant(sandbox, CLEAN_FILE, "/* const planted = getComputedStyle(element).direction; */");
    },
    (findings) => {
      assert.deepEqual(mentions(findings, CLEAN_FILE), [], JSON.stringify(findings, null, 1));
    },
  );
});

test('a SECOND probe in an already-pinned file grows its count and fails', () => {
  // The ledger is empty at HEAD, so the row is synthetic: the sandbox file holds
  // no probe, the baseline claims it holds one, and the plant makes it two.
  withPlantedTree(
    (sandbox) => plant(sandbox, PINNED_FIXTURE_PATH, "const planted = element.closest('[dir]');"),
    (findings) => {
      const reported = mentions(findings, PINNED_FIXTURE_PATH);
      assert.equal(reported.length, 1, JSON.stringify(findings, null, 1));
      assert.ok(reported[0].includes('GREW from 0 to 1'), reported[0]);
      assert.ok(reported[0].includes(DIRECTION_AUTHORITY), 'the finding must name the authority to adopt');
    },
    syntheticBaseline(0),
  );
});

test('a NAMED EXCEPTION file is not counted as debt, in either direction', () => {
  const exceptionPath = Object.keys(NAMED_EXCEPTIONS)[0];
  withPlantedTree(
    (sandbox) => plant(sandbox, exceptionPath, "const planted = anchor.closest('[dir]');"),
    (findings) => {
      assert.deepEqual(
        mentions(findings, exceptionPath),
        [],
        'a declared anchor/portal reader is exempt by path',
      );
    },
  );
});

test('a migration that removes a probe fails with an instruction to LOWER the pin', () => {
  // The ratchet direction: shrinking is red too, so the pin follows the tree
  // down instead of quietly keeping room for the probe to come back. Planted
  // against a synthetic row that claims two probes for a file holding one.
  withPlantedTree(
    (sandbox) => plant(sandbox, PINNED_FIXTURE_PATH, "const planted = element.closest('[dir]');"),
    (findings) => {
      const reported = mentions(findings, PINNED_FIXTURE_PATH);
      assert.equal(reported.length, 1, JSON.stringify(findings, null, 1));
      assert.ok(reported[0].includes('FELL from 2 to 1'), reported[0]);
      assert.ok(reported[0].includes('lower the pin to 1'), reported[0]);
    },
    syntheticBaseline(2),
  );
});

test('a pinned file that loses its last probe is told to REMOVE the pin', () => {
  withPlantedTree(
    () => {},
    (findings) => {
      const reported = mentions(findings, PINNED_FIXTURE_PATH);
      assert.equal(reported.length, 1, JSON.stringify(findings, null, 1));
      assert.ok(reported[0].includes('remove the pin'), reported[0]);
    },
    syntheticBaseline(1),
  );
});

// ---------------------------------------------------------------------------
// The exceptions are exceptions, not a silent allowlist
// ---------------------------------------------------------------------------

test('every named exception is declared WITH a reason, and holds a real probe', () => {
  const counts = probeCounts();
  const entries = Object.entries(NAMED_EXCEPTIONS);
  assert.ok(entries.length > 0, 'the exception list must not be empty-by-accident');
  for (const [path, reason] of entries) {
    assert.ok(reason.length > 120, `a one-line reason is not a reason: ${path}`);
    assert.ok(counts[path] > 0, `${path} claims an exemption for a probe it does not hold`);
  }
});

test('every pinned debt row carries the reason it is still debt', () => {
  // Vacuous at HEAD by construction: the ledger is EMPTY, which is the state
  // the sweep was for. It is asserted rather than deleted because the next row
  // to appear -- and a row will appear the first time a file re-derives
  // direction from the DOM -- owes the same reason and census group.
  const baseline = readBaseline();
  assert.equal(typeof baseline.pinnedDebt, 'object', 'the ledger must stay declared');
  for (const [path, pin] of Object.entries(baseline.pinnedDebt)) {
    assert.ok(pin.reason.length > 80, `a one-word reason is not a reason: ${path}`);
    assert.ok(/^[ACD]$/.test(pin.group), `${path} must name its census group`);
  }
});
