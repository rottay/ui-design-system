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
import { cpSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { after, describe, it } from 'node:test';

import {
  BASELINE_PATH,
  ENVELOPES_FILE,
  PARTITION_FILE,
  REGISTRY_DIR,
  REGISTRY_FILE,
  ROSTER_FILE,
  STYLE_DATA_ROOTS,
  measure,
  pinnedClasses,
  readEnvelopes,
  readFirstPartyRoster,
  readPartition,
  readBaseline,
  readPublications,
  readRegistryRoster,
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
  for (const home of STYLE_DATA_ROOTS) cpSync(join(CORE_ROOT, home), join(core, home), { recursive: true });
  cpSync(join(CORE_ROOT, CATALOG_FILE), join(core, CATALOG_FILE));
  cpSync(join(CORE_ROOT, ENVELOPES_FILE), join(core, ENVELOPES_FILE));
  cpSync(join(CORE_ROOT, ROSTER_FILE), join(core, ROSTER_FILE));
  return { repo, core };
}

const options = ({ repo, core }, baseline) => ({ coreRoot: core, repoRoot: repo, ...(baseline ? { baseline } : {}) });
const rules = (result) => result.findings.map((finding) => finding.rule);

/** Rewrite partition rows in the sandbox, asserting every replacement lands. */
function mutatePartition(core, replacements) {
  const file = join(core, PARTITION_FILE);
  let text = readFileSync(file, 'utf8');
  for (const [from, to] of replacements) {
    const next = text.replace(from, to);
    assert.notEqual(next, text, `the mutation must land: ${from}`);
    text = next;
  }
  writeFileSync(file, text);
}

/** A deep copy of the real pin, so a re-pin drill never writes the reviewed file. */
const pin = () => structuredClone(readBaseline());

/** The two-row swap no fixture names, derived from the effective pin: the first two rows no publication authors
 *  whose pinned classes differ trade places, so the per-class tally is unchanged. */
const [FIRST, SECOND] = (() => {
  const pinned = pinnedClasses(readBaseline());
  const authored = new Set(readPublications(CORE_ROOT).flatMap((publication) => Object.keys(publication.document.decisions)));
  const free = Object.keys(readPartition(CORE_ROOT).classes)
    .filter((id) => !authored.has(id))
    .map((id) => ({ id, cls: pinned[id] }));
  const first = free[0];
  return [first, free.find((row) => row.cls !== first.cls)];
})();
const SWAP = [
  [`  "${FIRST.id}": "${FIRST.cls}",`, `  "${FIRST.id}": "${SECOND.cls}",`],
  [`  "${SECOND.id}": "${SECOND.cls}",`, `  "${SECOND.id}": "${FIRST.cls}",`],
];
const escape = (text) => text.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');
const tally = (classes) => Object.values(classes).reduce((out, cls) => ({ ...out, [cls]: (out[cls] ?? 0) + 1 }), {});
/** The real pin with the swap recorded under `reclassified`, over whatever it already carries. */
function reclassifySwap(firstReason = 'drill: a reviewed move', secondReason = 'drill: a reviewed move') {
  const baseline = pin();
  baseline.reclassified = {
    ...baseline.reclassified,
    [FIRST.id]: { class: SECOND.cls, reason: firstReason },
    [SECOND.id]: { class: FIRST.cls, reason: secondReason },
  };
  return baseline;
}

const REAL_PARTITION = readFileSync(join(CORE_ROOT, PARTITION_FILE), 'utf8');
const REAL_PIN = readFileSync(BASELINE_PATH, 'utf8');

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
    assert.deepEqual(pinnedClasses(readBaseline()), readPartition(CORE_ROOT).classes);
    assert.equal(readBaseline().rowsEverPinned, 29);
    assert.deepEqual(Object.keys(readEnvelopes(CORE_ROOT)).sort(), ['bithire', 'evnto', 'rottay']);
    assert.deepEqual(readFirstPartyRoster(CORE_ROOT), ['rottay', 'bithire', 'evnto']);
    assert.ok(readPublications(CORE_ROOT).length > 0);
  });

  it('reads the roster the registry publishes, including the boundary styles outside its folder', () => {
    const { entries, problems } = readRegistryRoster(CORE_ROOT);
    assert.deepEqual(problems, []);
    assert.deepEqual(measure().publications, [
      'quiet-premium@1', 'product-dense@1', 'editorial-quiet@1', 'technical-dense@1', 'structural-neutral@1',
    ]);
    assert.deepEqual(
      entries.filter((entry) => !entry.folder.startsWith(REGISTRY_DIR)).map((entry) => entry.folder),
      ['src/foundation/presets/styles/technical-dense', 'src/foundation/presets/styles/structural-neutral'],
    );
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
      readFileSync(file, 'utf8').replace('Object.freeze(["recipe-profile", "responsive.posture"] as const)', 'Object.freeze([] as const)'),
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
    assert.ok(rulesFound.includes('PARTITION_ROW_LOST'));
  });

  it('goes RED when a row is moved between classes without a decision', () => {
    // Undoing the 2026-09-22 ratification without a decision is exactly such a move.
    const box = sandbox();
    const file = join(box.core, PARTITION_FILE);
    const before = readFileSync(file, 'utf8');
    const after = before.replace('  "navigation.sidebar-tone": "style",', '  "navigation.sidebar-tone": "brand",');
    assert.notEqual(after, before, 'the mutation must land');
    writeFileSync(file, after);
    assert.ok(rules(measure(options(box))).includes('PARTITION_ROW_MOVED'));
  });

  it('goes RED on two rows trading classes that no publication authors, with the tally unchanged', () => {
    const box = sandbox();
    mutatePartition(box.core, SWAP);
    const { findings, classCounts } = measure(options(box));
    assert.deepEqual(classCounts, tally(pinnedClasses(readBaseline())));
    assert.deepEqual(findings.map((finding) => finding.rule), ['PARTITION_ROW_MOVED', 'PARTITION_ROW_MOVED']);
    assert.match(findings[0].detail, new RegExp(`${escape(FIRST.id)} is declared ${SECOND.cls} but pinned ${FIRST.cls}`, 'u'));
    assert.match(findings[1].detail, new RegExp(`${escape(SECOND.id)} is declared ${FIRST.cls} but pinned ${SECOND.cls}`, 'u'));
  });

  it('goes GREEN on the same swap once each move is reclassified with a written reason', () => {
    const box = sandbox();
    mutatePartition(box.core, SWAP);
    assert.deepEqual(measure(options(box, reclassifySwap())).findings, []);
  });

  it('keeps the effective pin equal to the moved source, so the reads case holds after a reasoned re-pin', () => {
    const box = sandbox();
    mutatePartition(box.core, SWAP);
    const baseline = reclassifySwap();
    assert.deepEqual(baseline.partition, readBaseline().partition, 'partition stays frozen');
    assert.deepEqual(measure(options(box, baseline)).findings, []);
    assert.deepEqual(pinnedClasses(baseline), readPartition(box.core).classes);
  });

  it('goes RED on a reclassification whose reason is empty, and the move stays red', () => {
    const box = sandbox();
    mutatePartition(box.core, SWAP);
    // An invalid entry falls back to the frozen partition, so blank the row whose frozen class differs from its move.
    const frozen = readBaseline().partition;
    const blankFirst = frozen[FIRST.id] !== SECOND.cls;
    const [row, moved] = blankFirst ? [FIRST, SECOND.cls] : [SECOND, FIRST.cls];
    assert.notEqual(frozen[row.id], moved, 'one row of the swap must move against the frozen partition');
    const found = measure(options(box, blankFirst ? reclassifySwap('  ') : reclassifySwap(undefined, '  '))).findings;
    assert.deepEqual(found.map((finding) => finding.rule), ['PARTITION_REPIN_INVALID', 'PARTITION_ROW_MOVED']);
    assert.match(found[0].detail, new RegExp(`${escape(row.id)} is reclassified to ${moved} with no written reason`, 'u'));
    assert.match(found[1].detail, new RegExp(`${escape(row.id)} is declared ${moved} but pinned ${frozen[row.id]}`, 'u'));
  });

  it('goes RED on a re-pin that names no pinned row, an unknown class, or a retired row still declared', () => {
    const baseline = pin();
    baseline.reclassified = {
      'palette.nowhere': { class: 'style', reason: 'drill' },
      [FIRST.id]: { class: 'tenant', reason: 'drill' },
    };
    baseline.retired = { 'responsive.posture': 'drill' };
    baseline.rowsEverPinned += 1;
    const detail = measure(options(sandbox(), baseline)).findings
      .filter((finding) => finding.rule === 'PARTITION_REPIN_INVALID')
      .map((finding) => finding.detail);
    assert.deepEqual(detail, [
      'palette.nowhere is reclassified but is not a pinned row',
      `${FIRST.id} is reclassified to "tenant", which is not one of style, brand, refused`,
      'responsive.posture is both pinned and retired',
      'responsive.posture is retired but the partition still declares it',
    ]);
    const effective = pinnedClasses(baseline);
    assert.ok(!('responsive.posture' in effective), 'the effective pin excludes a retired row');
    assert.equal(effective[FIRST.id], readBaseline().partition[FIRST.id], 'an invalid reclassification does not apply');
  });

  it('goes RED on a row renamed in the partition alone', () => {
    const box = sandbox();
    mutatePartition(box.core, [['  "shape.nesting": "style",', '  "shape.nesting-depth": "style",']]);
    const found = rules(measure(options(box)));
    assert.ok(found.includes('PARTITION_ROW_UNPINNED'));
    assert.ok(found.includes('PARTITION_ROW_LOST'));
  });

  it('goes RED on a row lost from the partition and the pin together, until it is retired with a reason', () => {
    const box = sandbox();
    mutatePartition(box.core, [['  "responsive.posture": "style",\n', '']]);
    const dropped = pin();
    delete dropped.partition['responsive.posture'];
    assert.ok(rules(measure(options(box, dropped))).includes('PARTITION_PIN_SHRANK'));
    const unreasoned = structuredClone(dropped);
    unreasoned.retired = { 'responsive.posture': '' };
    assert.ok(rules(measure(options(box, unreasoned))).includes('PARTITION_REPIN_INVALID'));
    const retired = structuredClone(dropped);
    retired.retired = { 'responsive.posture': 'drill: a reviewed retirement' };
    assert.deepEqual(
      rules(measure(options(box, retired))).filter((rule) => rule.startsWith('PARTITION_') && rule !== 'PARTITION_ROW_UNCLASSIFIED'),
      [],
    );
  });

  it('goes RED when the pin cannot be read, because an unread pin refuses nothing', () => {
    const box = sandbox();
    assert.ok(rules(measure({ ...options(box), baseline: null })).includes('PARTITION_PIN_UNREADABLE'));
  });


  it('goes RED when a vertical closes allowAnatomyVariants under a style that uses one', () => {
    // Every publication that sets an anatomy variant reds under the closed envelope, each naming evnto;
    // the repointed quiet-premium's single variant is asserted exactly.
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
    const own = findings.filter((finding) => finding.detail.startsWith('style "quiet-premium"'));
    assert.equal(own.length, 1);
    assert.match(own[0].detail, /the evnto envelope sets allowAnatomyVariants false/u);
    for (const finding of findings) assert.match(finding.detail, /the evnto envelope sets allowAnatomyVariants false/u);
  });

  it('goes RED on an empty registry rather than reporting a pass', () => {
    const box = sandbox();
    const file = join(box.core, REGISTRY_FILE);
    const before = readFileSync(file, 'utf8');
    const after = before.replace(/const PUBLICATIONS: readonly ThemeStyleRecord\[\] = Object\.freeze\(\[[\s\S]*?\]\.map\(admit\)\);/u,
      'const PUBLICATIONS: readonly ThemeStyleRecord[] = Object.freeze([].map(admit));');
    assert.notEqual(after, before, 'the mutation must land');
    writeFileSync(file, after);
    const found = rules(measure(options(box)));
    assert.ok(found.includes('VACUOUS_SCAN'));
    assert.ok(found.includes('STYLE_DATA_UNREGISTERED'), 'the five folders left behind are data with no door');
  });

  it('goes RED on every publication folder removed, in both homes', () => {
    const box = sandbox();
    for (const home of STYLE_DATA_ROOTS) {
      for (const entry of readdirSync(join(box.core, home), { withFileTypes: true })) {
        if (entry.isDirectory()) rmSync(join(box.core, home, entry.name), { recursive: true, force: true });
      }
    }
    const result = measure(options(box));
    assert.equal(result.findings.filter((finding) => finding.rule === 'PUBLICATION_INCOMPLETE').length, 5);
  });

  it('goes RED when a boundary style is removed, and the scan counts 4 publications', () => {
    const box = sandbox();
    rmSync(join(box.core, 'src/foundation/presets/styles/structural-neutral'), { recursive: true, force: true });
    const result = measure(options(box));
    const incomplete = result.findings.filter((finding) => finding.rule === 'PUBLICATION_INCOMPLETE');
    assert.deepEqual(incomplete.map((finding) => finding.where), ['src/foundation/presets/styles/structural-neutral']);
    assert.equal(result.publications.filter((name) => name.includes('@')).length, 4);
  });

  it('goes RED on a boundary style that breaks the partition, which the old registry-folder scan never read', () => {
    const box = sandbox();
    const path = join(box.core, 'src/foundation/presets/styles/technical-dense/document/index.json');
    const document = JSON.parse(readFileSync(path, 'utf8'));
    writeFileSync(path, JSON.stringify({ ...document, decisions: { ...document.decisions, 'palette.seeds': { primary: '#101010' } } }));
    const found = measure(options(box)).findings.filter((finding) => finding.rule === 'STYLE_AUTHORS_FORBIDDEN_ROW');
    assert.equal(found.length, 1);
    assert.match(found[0].detail, /style "technical-dense" authors palette\.seeds/u);
  });

  it('goes RED on style data the registry does not publish', () => {
    const box = sandbox();
    cpSync(
      join(box.core, 'src/foundation/presets/styles/technical-dense'),
      join(box.core, 'src/foundation/presets/styles/unpublished'),
      { recursive: true },
    );
    const found = measure(options(box)).findings.filter((finding) => finding.rule === 'STYLE_DATA_UNREGISTERED');
    assert.deepEqual(found.map((finding) => finding.where), ['src/foundation/presets/styles/unpublished']);
  });

  it('goes RED when a PUBLICATIONS element cannot be followed to its import', () => {
    const box = sandbox();
    const file = join(box.core, REGISTRY_FILE);
    const before = readFileSync(file, 'utf8');
    const after = before.replace('  EDITORIAL_QUIET_V1,\n', '  EDITORIAL_QUIET_V1,\n  SOMEWHERE_ELSE_V1,\n');
    assert.notEqual(after, before, 'the mutation must land');
    writeFileSync(file, after);
    const found = measure(options(box)).findings.filter((finding) => finding.rule === 'REGISTRY_UNREADABLE');
    assert.equal(found.length, 1);
    assert.match(found[0].detail, /SOMEWHERE_ELSE_V1/u);
  });

  it('leaves the real partition and the reviewed pin byte-identical', () => {
    assert.equal(readFileSync(join(CORE_ROOT, PARTITION_FILE), 'utf8'), REAL_PARTITION);
    assert.equal(readFileSync(BASELINE_PATH, 'utf8'), REAL_PIN);
  });
});
