/**
 * physical-properties drills.
 *
 * Every drill plants a REAL physical site -- in each syntax a style object
 * accepts -- and asserts the gate turns red. Nothing is planted in the real
 * tree: each drill mirrors `src/components` into a tmpdir sandbox, edits the
 * copy, and measures that. Every planted file must still parse as valid
 * TypeScript/TSX: a mutant the compiler rejects proves only that a detector
 * recognises broken source.
 *
 * The syntaxes are the point, and the reason is WO-INV-01's own history: its
 * roster was built by a grep for ONE spelling of `closest('[dir]')`, and the
 * tree answered in four. A detector that only sees `left:` would miss
 * `['left']:`, `{ left }` or a style object bound one line above its `style`.
 */
import { strict as assert } from 'node:assert';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

import ts from 'typescript';

import {
  FROZEN,
  PHYSICAL_PROPERTIES,
  SCAN_ROOT,
  countSites,
  fileSites,
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
 * `menuItemStyle`'s `textAlign: 'left'`, a DEAD export that retires under
 * WO-RET-04 rather than being made logical, so it is the row that stays put.
 * It is a `.ts` file, hence the CSSProperties plant below rather than a JSX one.
 */
const PINNED_DEBT = 'patterns/foundation/engine-styles/modern/index.ts';
/** A measured pointer coordinate; the exception names exactly this site. */
const EXCEPTION_FILE = 'patterns/customization/token-inspector/index.tsx';
const EXCEPTION_SITE = 'left: state.position.x,';

const parseErrors = (path, text) =>
  ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true, path.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS)
    .parseDiagnostics.map((diagnostic) => ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'));

function withPlantedTree(edit, assertFindings) {
  const sandbox = mkdtempSync(join(tmpdir(), 'physical-properties-drill-'));
  try {
    const target = join(sandbox, SCAN_ROOT);
    mkdirSync(dirname(target), { recursive: true });
    cpSync(join(ROOT, SCAN_ROOT), target, { recursive: true });
    edit(sandbox);
    const sites = physicalSites(sandbox);
    assertFindings(judge(sites), countSites(sites));
  } finally {
    rmSync(sandbox, { recursive: true, force: true });
  }
}

/** Rewrites one sandbox file and refuses a mutant that does not parse. */
const rewrite = (sandbox, relativePath, change) => {
  const file = join(sandbox, SCAN_ROOT, relativePath);
  const before = readFileSync(file, 'utf8');
  const after = change(before);
  assert.notEqual(after, before, `the drill edit did not change ${relativePath}`);
  assert.deepEqual(parseErrors(relativePath, after), [], `the planted ${relativePath} must be valid source`);
  writeFileSync(file, after);
};

const append = (sandbox, relativePath, snippet) =>
  rewrite(sandbox, relativePath, (text) => `${text}\n${snippet}\n`);

/**
 * Appends a style object carrying the planted site. A `.tsx` file gets a
 * component, a `.ts` file a typed constant -- the gate reads both shapes, and
 * planting JSX into a `.ts` module would be testing the parser, not the law.
 */
const plant = (sandbox, relativePath, styleBody) =>
  append(
    sandbox,
    relativePath,
    relativePath.endsWith('.tsx')
      ? `export const PlantedDrill = () => <div style={{ ${styleBody} }} />;`
      : `export const plantedDrillStyle: CSSProperties = { ${styleBody} };`,
  );

const mentions = (findings, fragment) => findings.filter((finding) => finding.includes(fragment));

// ---------------------------------------------------------------------------
// The tree as it stands
// ---------------------------------------------------------------------------

test('the live tree matches its baseline', () => {
  assert.deepEqual(run().findings, []);
});

test('the pinned numbers are the measurement, not a guess', () => {
  const baseline = readBaseline();
  const residual = countSites(
    physicalSites().filter((site) => !namedExceptions(baseline)[site.path]?.sites.some((row) => row.locator === site.locator)),
  );
  for (const band of ['pinnedDebt', 'inert']) {
    for (const [path, pin] of Object.entries(baseline[band])) {
      assert.equal(residual[path], pin.sites, `${band} pin for ${path} must be the measurement`);
    }
  }
  for (const [path, row] of Object.entries(baseline.namedExceptions)) {
    for (const { locator } of row.sites) {
      const matches = physicalSites().filter((site) => site.path === path && site.locator === locator);
      assert.equal(matches.length, 1, `exception ${path} \`${locator}\` must name exactly one live site`);
    }
  }
});

test('every counted file belongs to exactly one pinned band, and no exception file hides in one', () => {
  const baseline = readBaseline();
  const residual = physicalSites()
    .filter((site) => !baseline.namedExceptions[site.path]?.sites.some((row) => row.locator === site.locator));
  for (const path of Object.keys(countSites(residual))) {
    const bands = ['pinnedDebt', 'inert'].filter((band) => baseline[band][path]);
    assert.equal(bands.length, 1, `${path} is in ${bands.length} bands: ${bands.join(', ')}`);
  }
  for (const path of Object.keys(baseline.namedExceptions)) {
    assert.ok(!baseline.pinnedDebt[path] && !baseline.inert[path], `${path} is both an exception and a pinned band`);
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
  // permanent by adjudication, one declared site each.
  const sites = physicalSites();
  const exceptions = namedExceptions();
  const exceptionSites = sites.filter((site) => exceptions[site.path]?.sites.some((row) => row.locator === site.locator));
  assert.ok(sites.length >= 6, `only ${sites.length} sites found -- an empty scan is never a pass`);
  assert.equal(exceptionSites.length, 6, 'the six measured-coordinate readers carry one declared site each');
  assert.equal(Object.keys(exceptions).length, 6);
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
// The six counterexample classes, as one valid TSX module
// ---------------------------------------------------------------------------

const COUNTEREXAMPLE_FIXTURE = [
  "import React from 'react';",
  '',
  'export const PlainControl = () => <div style={{ marginLeft: 4 }} />;',
  "export const ComputedString = () => <div style={{ ['marginLeft']: 4 }} />;",
  'export const ComputedTemplate = () => <div style={{ [`marginRight`]: 4 }} />;',
  'export const SpaceBeforeEquals = () => <div style = {{ paddingLeft: 4 }} />;',
  'const indirectStyle = { paddingRight: 4 };',
  'export const Indirect = () => <div style={indirectStyle} />;',
  'export const Shorthand = () => { const left = 4; return <div style={{ left }} />; };',
  'export const LogicalControl = () => <div style={{ marginInlineStart: 4 }} />;',
].join('\n');

test('the six counterexample classes in valid TSX are all found, and the logical control is not', () => {
  const path = 'probe/index.tsx';
  assert.deepEqual(parseErrors(path, COUNTEREXAMPLE_FIXTURE), [], 'the fixture must be valid TSX');
  const sites = fileSites(path, COUNTEREXAMPLE_FIXTURE);
  assert.deepEqual(
    sites.map((site) => [site.line, site.property]),
    [[3, 'marginLeft'], [4, 'marginLeft'], [5, 'marginRight'], [6, 'paddingLeft'], [7, 'paddingRight'], [9, 'left']],
  );
});

// ---------------------------------------------------------------------------
// Planted reds: every syntax a style object accepts, each a valid module
// ---------------------------------------------------------------------------

const SPELLINGS = [
  ['a bare key', 'marginLeft: 4'],
  ['a single-quoted key', "'marginLeft': 4"],
  ['a double-quoted key', '"paddingRight": 8'],
  ['a computed string key', "['borderLeftWidth']: 1"],
  ['a computed template key', '[`borderLeftWidth`]: 1'],
  ['a kebab-case key', "'margin-left': 4"],
  ['a physical inset', 'left: 12'],
  ['a physical text alignment', "textAlign: 'right'"],
  ['a float', "float: 'left'"],
  ['a physical value behind a branch', "textAlign: Math.random() > 0.5 ? 'center' : 'left'"],
  ['a key inside a conditional spread', '...(Math.random() > 0.5 && { paddingLeft: 2 })'],
];

for (const [label, styleBody] of SPELLINGS) {
  test(`a planted physical site written as ${label} turns the gate red`, () => {
    withPlantedTree(
      (sandbox) => plant(sandbox, CLEAN_FILE, styleBody),
      (findings) => {
        const reported = mentions(findings, CLEAN_FILE);
        assert.equal(reported.length, 1, `expected one finding; got ${JSON.stringify(findings, null, 1)}`);
        assert.ok(reported[0].includes('no band declares'), reported[0]);
        assert.ok(reported[0].startsWith(`${CLEAN_FILE}: 1 physical-property site(s)`), reported[0]);
      },
    );
  });
}

const SHAPES = [
  ['whitespace around the style attribute', 'export const PlantedDrill = () => <div style = {  { marginLeft: 4 } } />;'],
  [
    'an indirect style object',
    'const plantedDrillStyle = { paddingRight: 4 };\nexport const PlantedDrill = () => <div style={plantedDrillStyle} />;',
  ],
  [
    'a computed key bound to a constant',
    "const plantedDrillKey = 'marginRight';\nexport const PlantedDrill = () => <div style={{ [plantedDrillKey]: 4 }} />;",
  ],
  ['shorthand', 'export const PlantedDrill = () => { const left = 4; return <div style={{ left }} />; };'],
  [
    'a spread of a bound object',
    'const plantedDrillBase = { marginRight: 4 };\nexport const PlantedDrill = () => <div style={{ ...plantedDrillBase, opacity: 1 }} />;',
  ],
  [
    'a memoised style object',
    'export const PlantedDrill = () => { const style = React.useMemo(() => ({ borderRight: 0 }), []); return <div style={style} />; };',
  ],
  [
    'a style-returning function',
    'function plantedDrillStyle(offset: number) { return { paddingLeft: offset }; }\n'
      + 'export const PlantedDrill = () => <div style={plantedDrillStyle(2)} />;',
  ],
  [
    'a CSSProperties-typed return',
    'export function plantedDrillStyle(): React.CSSProperties { return { borderTopLeftRadius: 2 }; }',
  ],
  ['an imperative style write', 'export function plantedDrill(node: HTMLElement) { node.style.marginLeft = "4px"; }'],
  ['an element-access style write', "export function plantedDrill(node: HTMLElement) { node.style['paddingRight'] = '4px'; }"],
  ['a kebab setProperty', "export function plantedDrill(node: HTMLElement) { node.style.setProperty('border-left-color', 'red'); }"],
  ['an Object.assign onto style', 'export function plantedDrill(node: HTMLElement) { Object.assign(node.style, { right: "0" }); }'],
];

for (const [label, snippet] of SHAPES) {
  test(`a planted physical site reached through ${label} turns the gate red`, () => {
    withPlantedTree(
      (sandbox) => append(sandbox, CLEAN_FILE, snippet),
      (findings) => {
        const reported = mentions(findings, CLEAN_FILE);
        assert.equal(reported.length, 1, `expected one finding; got ${JSON.stringify(findings, null, 1)}`);
        assert.ok(reported[0].startsWith(`${CLEAN_FILE}: 1 physical-property site(s)`), reported[0]);
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

test('a logical spelling is never a finding, in any syntax', () => {
  withPlantedTree(
    (sandbox) => append(
      sandbox,
      CLEAN_FILE,
      "const plantedDrillStyle = { marginInlineStart: 4, ['insetInlineEnd']: 8, [`paddingInlineStart`]: 2, textAlign: 'start' as const };\n"
        + 'export const PlantedDrill = () => { const insetInlineStart = 0; return <div style = {{ ...plantedDrillStyle, insetInlineStart }} />; };',
    ),
    (findings) => {
      assert.deepEqual(mentions(findings, CLEAN_FILE), []);
    },
  );
});

test('a physical-looking key that never reaches a style object is not a finding', () => {
  withPlantedTree(
    (sandbox) => append(sandbox, CLEAN_FILE, 'export const plantedDrillRect = { left: 0, right: 10 };'),
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

test('a correction that removes a site fails with an instruction to LOWER the pin', () => {
  // The ratchet direction: shrinking is red too, so the pin follows the tree
  // down instead of quietly keeping room for the site to come back.
  withPlantedTree(
    (sandbox) => rewrite(
      sandbox,
      PINNED_DEBT,
      (text) => text.replace("textAlign: 'left' as const", "textAlign: 'start' as const"),
    ),
    (findings) => {
      const reported = mentions(findings, PINNED_DEBT);
      assert.equal(reported.length, 1, JSON.stringify(findings, null, 1));
      assert.ok(reported[0].includes('remove the pin') || reported[0].includes('lower the pin'), reported[0]);
    },
  );
});

// ---------------------------------------------------------------------------
// Named exceptions bind to a site, never to a file
// ---------------------------------------------------------------------------

test('a NEW site in a named-exception file is judged, not excused', () => {
  withPlantedTree(
    (sandbox) => plant(sandbox, EXCEPTION_FILE, 'marginLeft: 4'),
    (findings) => {
      const reported = mentions(findings, EXCEPTION_FILE);
      assert.equal(reported.length, 1, JSON.stringify(findings, null, 1));
      assert.ok(reported[0].includes('no band declares'), reported[0]);
      assert.ok(reported[0].includes('`PlantedDrill marginLeft: 4`'), 'the finding must name the unexcused site');
    },
  );
});

test('SUBSTITUTING the excepted site at equal count fails', () => {
  // Same file, same number of physical sites: a count-only exception would
  // stay green. The declared locator no longer matches, and the stand-in is
  // judged as the unbanded site it is.
  withPlantedTree(
    (sandbox) => rewrite(sandbox, EXCEPTION_FILE, (text) => text.replace(EXCEPTION_SITE, 'marginLeft: 4,')),
    (findings, counts) => {
      const declared = readBaseline().namedExceptions[EXCEPTION_FILE].sites.length;
      assert.equal(counts[EXCEPTION_FILE], declared, 'the drill must hold the count equal');
      const reported = mentions(findings, EXCEPTION_FILE);
      assert.equal(reported.length, 2, JSON.stringify(findings, null, 1));
      assert.ok(reported.some((finding) => finding.includes('matches no physical site')), reported.join('\n'));
      assert.ok(reported.some((finding) => finding.includes('`panelStyle marginLeft: 4`')), reported.join('\n'));
    },
  );
});

test('substituting the excepted VALUE at equal count fails too', () => {
  withPlantedTree(
    (sandbox) => rewrite(sandbox, EXCEPTION_FILE, (text) => text.replace(EXCEPTION_SITE, 'left: 24,')),
    (findings) => {
      const reported = mentions(findings, EXCEPTION_FILE);
      assert.equal(reported.length, 2, JSON.stringify(findings, null, 1));
      assert.ok(reported.some((finding) => finding.includes('matches no physical site')), reported.join('\n'));
    },
  );
});

test('a DUPLICATE of the excepted site cannot ride the same exception', () => {
  withPlantedTree(
    (sandbox) => rewrite(
      sandbox,
      EXCEPTION_FILE,
      (text) => text.replace(EXCEPTION_SITE, `${EXCEPTION_SITE}\n    ...{ ${EXCEPTION_SITE} },`),
    ),
    (findings) => {
      const reported = mentions(findings, EXCEPTION_FILE);
      assert.equal(reported.length, 1, JSON.stringify(findings, null, 1));
      assert.ok(reported[0].includes('matches 2 sites'), reported[0]);
    },
  );
});

test('the exception is not moved by an unrelated edit above it', () => {
  withPlantedTree(
    (sandbox) => rewrite(sandbox, EXCEPTION_FILE, (text) => `\n\n\n${text}`),
    (findings) => {
      assert.deepEqual(findings, []);
    },
  );
});

test('judge() refuses a count map: counts cannot bind an exception to its site', () => {
  assert.throws(() => judge(physicalCounts()), /site list/);
});

// ---------------------------------------------------------------------------
// The bands are declarations, not a silent allowlist
// ---------------------------------------------------------------------------

test('every band row carries a reason long enough to be one', () => {
  const baseline = readBaseline();
  for (const band of ['pinnedDebt', 'inert']) {
    const rows = Object.entries(baseline[band]);
    assert.ok(rows.length > 0, `${band} must not be empty-by-accident`);
    for (const [path, pin] of rows) {
      assert.ok(pin.reason.length > 120, `a one-line reason is not a reason: ${band} ${path}`);
      assert.ok(Number.isInteger(pin.sites) && pin.sites > 0, `${band} ${path} must pin a real count`);
    }
  }
  const exceptions = Object.entries(baseline.namedExceptions);
  assert.ok(exceptions.length > 0, 'namedExceptions must not be empty-by-accident');
  for (const [path, row] of exceptions) {
    assert.ok(Array.isArray(row.sites) && row.sites.length > 0, `${path} must declare its sites, not a count`);
    const locators = row.sites.map((site) => site.locator);
    assert.equal(new Set(locators).size, locators.length, `${path} declares a locator twice`);
    for (const { locator, reason } of row.sites) {
      assert.match(locator, /^\S+ [A-Za-z]+: \S/, `${path} locator must read \`scope property: value\``);
      assert.ok(reason.length > 120, `a one-line reason is not a reason: exception ${path} ${locator}`);
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
