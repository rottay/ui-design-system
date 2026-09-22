/**
 * The drill for the style-registry gate.
 *
 * Each case plants a publication or a partition that the law forbids and
 * asserts the gate names it. Two of them are the ones the law exists for and
 * would be invisible to a reviewer reading the JSON: a dial that clears two
 * verticals and not the third, and a floor that has drifted from the reach it
 * claims to measure.
 */
import assert from 'node:assert/strict';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { after, describe, it } from 'node:test';

import {
  ENVELOPES_FILE,
  PARTITION_FILE,
  REGISTRY_DIR,
  ROSTER_FILE,
  measure,
  readEnvelopes,
  readFirstPartyRoster,
  readPartition,
  readPublications,
} from '../index.mjs';
import { packageRoot as findPackageRoot, repoRoot as findRepoRoot } from '../../../../libraries/repo-root/index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const CORE_ROOT = findPackageRoot(HERE);
const REPO_ROOT = findRepoRoot(HERE);

const CATALOG_FILE = 'src/contracts/theme/runtime/catalog/index.ts';
const STYLES_ROOT = 'src/contracts/theme/runtime/styles';

const sandboxes = [];
after(() => { for (const dir of sandboxes) rmSync(dir, { recursive: true, force: true }); });

function sandbox() {
  const repo = mkdtempSync(join(tmpdir(), 'cat04-styles-'));
  sandboxes.push(repo);
  const core = join(repo, 'packages/core');
  mkdirSync(join(core, 'src'), { recursive: true });
  writeFileSync(join(core, 'package.json'), '{"name":"@rottay/design-system"}\n');
  writeFileSync(join(repo, 'pnpm-workspace.yaml'), 'packages:\n  - packages/*\n');
  for (const path of [STYLES_ROOT, dirname(CATALOG_FILE), dirname(ENVELOPES_FILE), dirname(ROSTER_FILE)]) {
    mkdirSync(join(core, path), { recursive: true });
  }
  cpSync(join(CORE_ROOT, STYLES_ROOT), join(core, STYLES_ROOT), { recursive: true });
  cpSync(join(CORE_ROOT, CATALOG_FILE), join(core, CATALOG_FILE));
  cpSync(join(CORE_ROOT, ENVELOPES_FILE), join(core, ENVELOPES_FILE));
  cpSync(join(CORE_ROOT, ROSTER_FILE), join(core, ROSTER_FILE));
  return { repo, core };
}

const options = ({ repo, core }) => ({ coreRoot: core, repoRoot: repo });
const rules = (result) => result.findings.map((finding) => finding.rule);

/** Rewrite the registered publication's decisions, digest untouched: this gate
 *  reads content, and the digest is the contract's own module-load law. */
function repoint(core, decisions, manifestPatch = {}) {
  const folder = join(core, REGISTRY_DIR, 'quiet-premium');
  writeFileSync(join(folder, 'document/index.json'), JSON.stringify({ decisions }, null, 2));
  const manifest = JSON.parse(readFileSync(join(folder, 'manifest/index.json'), 'utf8'));
  writeFileSync(
    join(folder, 'manifest/index.json'),
    JSON.stringify({ ...manifest, rows: Object.keys(decisions), ...manifestPatch }, null, 2),
  );
}

describe('theme-style-registry — the measurement', () => {
  it('the real tree is clean', () => {
    assert.deepEqual(measure().findings, []);
  });

  it('reads the partition, the envelopes and the publications from source', () => {
    assert.equal(Object.keys(readPartition(CORE_ROOT).classes).length, 29);
    assert.deepEqual(Object.keys(readEnvelopes(CORE_ROOT)).sort(), ['bithire', 'evnto', 'rottay']);
    assert.deepEqual(readFirstPartyRoster(CORE_ROOT), ['rottay', 'bithire', 'evnto']);
    assert.ok(readPublications(CORE_ROOT).length > 0);
  });
});

describe('theme-style-registry — the drills', () => {
  it('goes RED when a style authors a brand-class row', () => {
    const box = sandbox();
    repoint(box.core, { 'palette.seeds': { primary: '#101010' } });
    assert.ok(rules(measure(options(box))).includes('STYLE_AUTHORS_FORBIDDEN_ROW'));
  });

  it('goes RED when a dial leaves ONE declared vertical envelope', () => {
    // 0.7 clears evnto [0, 0.75] and fails rottay and bithire [0, 0.65]. The
    // remedy is the written exclusion, which the next case proves.
    const box = sandbox();
    repoint(box.core, { 'surfaces.effect-intensity': 0.7 });
    const findings = measure(options(box)).findings.filter(
      (finding) => finding.rule === 'STYLE_DIAL_OUTSIDE_ENVELOPE',
    );
    assert.equal(findings.length, 2);
    assert.match(findings[0].detail, /outside the rottay envelope \[0, 0\.65\]/u);
  });

  it('goes GREEN for the same dial once the excluded verticals each carry a reason', () => {
    const box = sandbox();
    repoint(box.core, { 'surfaces.effect-intensity': 0.7 }, {
      verticals: ['evnto'],
      exclusionReasons: {
        rottay: 'D-28: 0.7 leaves the rottay effectIntensity range',
        bithire: 'D-28: 0.7 leaves the bithire effectIntensity range',
      },
    });
    const found = rules(measure(options(box)));
    assert.ok(!found.includes('STYLE_DIAL_OUTSIDE_ENVELOPE'));
    assert.ok(!found.includes('EXCLUSION_WITHOUT_REASON'));
  });

  it('goes RED when a vertical is excluded WITHOUT a written reason', () => {
    const box = sandbox();
    repoint(box.core, { 'surfaces.effect-intensity': 0.7 }, { verticals: ['evnto'] });
    const detail = measure(options(box)).findings
      .filter((finding) => finding.rule === 'EXCLUSION_WITHOUT_REASON')
      .map((finding) => finding.detail);
    assert.equal(detail.length, 2);
    assert.match(detail.join('\n'), /excludes rottay without a written D-28 reason/u);
    assert.match(detail.join('\n'), /excludes bithire without a written D-28 reason/u);
  });

  it('goes RED when the reason is keyed by the ADMITTED vertical instead of the excluded ones', () => {
    // The defect this arm exists for: a reason under `evnto` explains nothing
    // about rottay or bithire, and it is rottay's key the request-time refusal
    // reads. Two reasons are owed, and neither was written.
    const box = sandbox();
    repoint(box.core, { 'surfaces.effect-intensity': 0.7 }, {
      verticals: ['evnto'],
      exclusionReasons: { evnto: 'D-28: the only envelope that admits 0.7' },
    });
    assert.equal(
      measure(options(box)).findings.filter((finding) => finding.rule === 'EXCLUSION_WITHOUT_REASON').length,
      2,
    );
  });

  it('goes RED when one excluded vertical is covered and the other is not', () => {
    const box = sandbox();
    repoint(box.core, { 'surfaces.effect-intensity': 0.7 }, {
      verticals: ['evnto'],
      exclusionReasons: { rottay: 'D-28: 0.7 leaves the rottay effectIntensity range' },
    });
    const detail = measure(options(box)).findings
      .filter((finding) => finding.rule === 'EXCLUSION_WITHOUT_REASON')
      .map((finding) => finding.detail);
    assert.equal(detail.length, 1);
    assert.match(detail[0], /excludes bithire without a written D-28 reason/u);
  });

  it('goes RED when the roster cannot be read, because the exclusion law would refuse nothing', () => {
    const box = sandbox();
    rmSync(join(box.core, ROSTER_FILE));
    assert.ok(rules(measure(options(box))).includes('ROSTER_UNREADABLE'));
  });

  it('goes RED on a style that emits nothing a census can see', () => {
    const box = sandbox();
    repoint(box.core, { 'recipe-profile': 'rottay/technical-sharp@1' });
    assert.ok(rules(measure(options(box))).includes('STYLE_EMITS_NOTHING'));
  });

  it('goes RED when the non-emitting list drifts from the catalog reach', () => {
    const box = sandbox();
    const file = join(box.core, PARTITION_FILE);
    writeFileSync(
      file,
      readFileSync(file, 'utf8').replace('Object.freeze(["recipe-profile"] as const)', 'Object.freeze([] as const)'),
    );
    assert.ok(rules(measure(options(box))).includes('NON_EMITTING_LIST_DRIFTED'));
  });

  it('goes RED when a catalog row loses its classification', () => {
    const box = sandbox();
    const file = join(box.core, PARTITION_FILE);
    writeFileSync(
      file,
      readFileSync(file, 'utf8').replace('  "responsive.posture": "style",\n', ''),
    );
    const rulesFound = rules(measure(options(box)));
    assert.ok(rulesFound.includes('PARTITION_ROW_UNCLASSIFIED'));
    assert.ok(rulesFound.includes('PARTITION_COUNT_MOVED'));
  });

  it('goes RED when a row is moved between classes without a decision', () => {
    const box = sandbox();
    const file = join(box.core, PARTITION_FILE);
    writeFileSync(
      file,
      readFileSync(file, 'utf8').replace(
        '  "navigation.sidebar-tone": "brand",',
        '  "navigation.sidebar-tone": "style",',
      ),
    );
    assert.ok(rules(measure(options(box))).includes('PARTITION_COUNT_MOVED'));
  });

  it('goes RED when a vertical closes allowAnatomyVariants under a style that uses one', () => {
    // Vacuous on production data -- all three envelopes open it -- and this is
    // the arm that makes the day one of them closes it visible.
    const box = sandbox();
    repoint(box.core, { 'chrome.anatomy': { table: 'grid' } });
    const file = join(box.core, ENVELOPES_FILE);
    writeFileSync(
      file,
      readFileSync(file, 'utf8').replace(
        '      allowTokenOverrides: true,\n      allowAnatomyVariants: true,\n    },\n    ranges: {\n      // Capability limits',
        '      allowTokenOverrides: true,\n      allowAnatomyVariants: false,\n    },\n    ranges: {\n      // Capability limits',
      ),
    );
    const findings = measure(options(box)).findings.filter(
      (finding) => finding.rule === 'STYLE_ANATOMY_FORBIDDEN',
    );
    assert.equal(findings.length, 1);
    assert.match(findings[0].detail, /the evnto envelope sets allowAnatomyVariants false/u);
  });

  it('goes RED on an empty registry rather than reporting a pass', () => {
    const box = sandbox();
    rmSync(join(box.core, REGISTRY_DIR, 'quiet-premium'), { recursive: true, force: true });
    assert.ok(rules(measure(options(box))).includes('VACUOUS_SCAN'));
  });
});
