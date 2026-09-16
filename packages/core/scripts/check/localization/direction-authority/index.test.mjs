/**
 * direction-authority drills.
 *
 * Every drill plants a REAL probe -- one of the exact spellings that defeated
 * WO-INV-01's own census -- and asserts the gate turns red. Nothing is planted
 * in the real tree: each drill mirrors `src/components` into a tmpdir sandbox,
 * edits the copy, and measures that.
 *
 * The four spellings are the point. The roster that produced this WO was built
 * by `grep "closest('[dir]')"`, which saw one of them; the sweep's acceptance
 * criterion was that same grep reading zero, so it went green with sixteen
 * probes alive. A drill that plants only the spelling the old census could see
 * would reproduce the blindness it exists to prevent.
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
const CLEAN_FILE = 'primitives/layout/box/engines/modern/index.tsx';

/**
 * Mirrors the scanned corpus into a sandbox, hands `edit` the sandbox root,
 * then runs `judge` over the sandbox measurement.
 */
function withPlantedTree(edit, assertFindings) {
  const sandbox = mkdtempSync(join(tmpdir(), 'direction-authority-drill-'));
  try {
    const target = join(sandbox, SCAN_ROOT);
    mkdirSync(dirname(target), { recursive: true });
    cpSync(join(ROOT, SCAN_ROOT), target, { recursive: true });
    edit(sandbox);
    assertFindings(judge(probeCounts(sandbox)), probeCounts(sandbox));
  } finally {
    rmSync(sandbox, { recursive: true, force: true });
  }
}

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

test('the corpus is not vacuous and the clean file really is clean', () => {
  const sites = probeSites();
  assert.ok(sites.length >= 20, `only ${sites.length} probe sites found -- an empty scan is never a pass`);
  assert.equal(probeCounts()[CLEAN_FILE], undefined, `${CLEAN_FILE} must hold no probe of its own`);
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

test('a SECOND probe in an already-pinned file grows its count and fails', () => {
  const pinnedPath = 'structures/workspace/table-toolbar/runtime/rendering/index.tsx';
  const pin = readBaseline().pinnedDebt[pinnedPath].probes;
  withPlantedTree(
    (sandbox) => plant(sandbox, pinnedPath, "const planted = element.closest('[dir]');"),
    (findings) => {
      const reported = mentions(findings, pinnedPath);
      assert.equal(reported.length, 1, JSON.stringify(findings, null, 1));
      assert.ok(reported[0].includes(`GREW from ${pin} to ${pin + 1}`), reported[0]);
      assert.ok(reported[0].includes(DIRECTION_AUTHORITY), 'the finding must name the authority to adopt');
    },
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
  // down instead of quietly keeping room for the probe to come back.
  const pinnedPath = 'patterns/data/detail-panel/engines/modern/index.tsx';
  withPlantedTree(
    (sandbox) => {
      const file = join(sandbox, SCAN_ROOT, pinnedPath);
      writeFileSync(
        file,
        readFileSync(file, 'utf8').replace(/getComputedStyle\(e\.currentTarget\)\.direction/, "direction"),
      );
    },
    (findings) => {
      const reported = mentions(findings, pinnedPath);
      assert.equal(reported.length, 1, JSON.stringify(findings, null, 1));
      assert.ok(reported[0].includes('remove the pin') || reported[0].includes('lower the pin'), reported[0]);
    },
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
  for (const [path, pin] of Object.entries(readBaseline().pinnedDebt)) {
    assert.ok(pin.reason.length > 80, `a one-word reason is not a reason: ${path}`);
    assert.ok(/^[ACD]$/.test(pin.group), `${path} must name its census group`);
  }
});
