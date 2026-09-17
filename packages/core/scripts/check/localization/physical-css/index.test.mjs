/**
 * physical-css drills.
 *
 * Every drill plants a REAL physical declaration -- in each syntax a
 * stylesheet accepts -- and asserts the gate turns red. Nothing is planted in
 * the real tree: each drill mirrors the scanned CSS into a tmpdir sandbox,
 * edits the copy, and measures that. Every planted file must still parse as
 * CSS, because a mutant postcss rejects would prove only that a detector
 * recognises broken source.
 *
 * The syntaxes are the point. A regex over `left:` sees a comment, a string
 * and a custom property; it does not see a declaration nested two at-rules
 * deep, and it cannot tell `translateX(-50%)` (centring, inert) from
 * `translateX(-100%)` (an unmirrored slide) or from a pair whose `:dir(rtl)`
 * twin already flips it.
 */
import { strict as assert } from 'node:assert';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

import postcss from 'postcss';

import {
  CSS_ROOT,
  FROZEN,
  PHYSICAL_PROPERTIES,
  PHYSICAL_SHORTHANDS,
  SCAN_ROOTS,
  classify,
  compareSpecificity,
  countSites,
  fileSites,
  inlineTranslations,
  judge,
  namedExceptions,
  physicalCssSites,
  readBaseline,
  run,
  shorthandInlinePairs,
  specificity,
} from './index.mjs';
import { packageRoot as findPackageRoot } from '../../../libraries/repo-root/index.mjs';

const ROOT = findPackageRoot(dirname(fileURLToPath(import.meta.url)));

/** A skin no band declares, so a planted site is unambiguously the drill's. */
const CLEAN_FILE = 'runtime/engines/modern/skin/divider/index.css';
/** The drawer's four keyframe slides: pinned debt owed to the L3 mirror lot. */
const PINNED_DEBT = 'runtime/engines/modern/skin/drawer/index.css';
/** The tooltip's centred export toast: symmetric, so pinned inert. */
const PINNED_INERT = 'presentation/components/skin/export-button/index.css';
/** A measured viewport coordinate; the exception names exactly this site. */
const EXCEPTION_FILE = 'runtime/engines/modern/skin/tour/index.css';
const EXCEPTION_SITE = 'left: var(--ds-tour-spotlight-left);';
/** A placement-keyed contract; the stamp names exactly this selector. */
const STAMP_FILE = 'runtime/engines/modern/skin/typography/index.css';

const parseErrors = (path, text) => {
  try {
    postcss.parse(text, { from: path });
    return [];
  } catch (error) {
    return [error.message];
  }
};

function withPlantedTree(edit, assertFindings) {
  const sandbox = mkdtempSync(join(tmpdir(), 'physical-css-drill-'));
  try {
    for (const scanRoot of SCAN_ROOTS) {
      const target = join(sandbox, CSS_ROOT, scanRoot);
      mkdirSync(dirname(target), { recursive: true });
      cpSync(join(ROOT, CSS_ROOT, scanRoot), target, { recursive: true });
    }
    edit(sandbox);
    const sites = physicalCssSites(sandbox);
    assertFindings(judge(sites), countSites(sites), sites);
  } finally {
    rmSync(sandbox, { recursive: true, force: true });
  }
}

/** Rewrites one sandbox file and refuses a mutant that does not parse. */
const rewrite = (sandbox, relativePath, change) => {
  const file = join(sandbox, CSS_ROOT, relativePath);
  const before = readFileSync(file, 'utf8');
  const after = change(before);
  assert.notEqual(after, before, `the drill edit did not change ${relativePath}`);
  assert.deepEqual(parseErrors(relativePath, after), [], `the planted ${relativePath} must be valid CSS`);
  writeFileSync(file, after);
};

const append = (sandbox, relativePath, snippet) =>
  rewrite(sandbox, relativePath, (text) => `${text}\n${snippet}\n`);

/** Appends a rule carrying the planted declarations. */
const plant = (sandbox, relativePath, body, selector = '.ds-planted-drill') =>
  append(sandbox, relativePath, `${selector} {\n  ${body}\n}`);

const mentions = (findings, fragment) => findings.filter((finding) => finding.includes(fragment));

// ---------------------------------------------------------------------------
// The tree as it stands
// ---------------------------------------------------------------------------

test('the live tree matches its baseline', () => {
  assert.deepEqual(run().findings, []);
});

test('the pinned numbers are the measurement, not a guess', () => {
  const baseline = readBaseline();
  const bands = classify(physicalCssSites(), baseline);
  for (const [band, rows] of [['pinnedDebt', bands.debt], ['inert', bands.inert]]) {
    const counts = countSites(rows);
    for (const [path, pin] of Object.entries(baseline[band])) {
      assert.equal(counts[path], pin.sites, `${band} pin for ${path} must be the measurement`);
    }
  }
  for (const [path, row] of Object.entries(baseline.physicalStamp)) {
    for (const pin of row.selectors) {
      const matches = bands.stamp.filter((site) => site.path === path && site.selector === pin.selector);
      assert.equal(matches.length, pin.sites, `stamp pin for ${path} \`${pin.selector}\` must be the measurement`);
    }
  }
  for (const [path, row] of Object.entries(baseline.namedExceptions)) {
    for (const { locator } of row.sites) {
      const matches = physicalCssSites().filter((site) => site.path === path && site.locator === locator);
      assert.equal(matches.length, 1, `exception ${path} \`${locator}\` must name exactly one live site`);
    }
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
  // The floor is the NAMED EXCEPTIONS and the STAMPS, not the debt: debt is
  // supposed to reach zero, and a floor tied to it would have to be lowered on
  // every correction until it asserted nothing.
  const sites = physicalCssSites();
  const bands = classify(sites, readBaseline());
  assert.ok(sites.length >= 100, `only ${sites.length} sites found -- an empty scan is never a pass`);
  assert.ok(bands.excepted.length >= 10, 'the declared exception sites must all still measure');
  assert.ok(bands.stamp.length >= 20, 'the placement-keyed stamps must all still measure');
  assert.equal(countSites(sites)[CLEAN_FILE], undefined, `${CLEAN_FILE} must hold no physical site`);
});

test('the frozen engines are excluded by path, never measured', () => {
  for (const site of physicalCssSites()) {
    assert.ok(!FROZEN.test(`/${site.path}`), `a frozen file reached the census: ${site.path}`);
  }
  // And the exclusion is not vacuous: the tree really does hold frozen skins.
  assert.ok(FROZEN.test('/runtime/engines/classic/skin/modal/index.css'));
  assert.ok(FROZEN.test('/runtime/engines/rustic/skin/modal/index.css'));
});

// ---------------------------------------------------------------------------
// The tokenizer: what a regex would get wrong
// ---------------------------------------------------------------------------

const TOKENIZER_FIXTURE = [
  '/* margin-left: 4px; a comment is not a declaration */',
  '.a { content: "margin-left: 4px"; }',
  '.b { --ds-drill-left: 4px; }',
  '.c { margin-inline-start: 4px; }',
  '.d { margin-left: 4px; }',
  '@media (min-width: 40rem) { @supports (display: grid) { .e { padding-right: 8px; } } }',
  '@keyframes ds-drill { from { transform: translateX(-100%); } to { transform: translateX(0); } }',
  '.f { text-align: center; float: none; }',
  '.g { text-align: right; }',
  '.h { transform: translateX(-50%); }',
  '.i { left: 0; right: 0; }',
  '.j { transform: translate(0, -12px); }',
].join('\n');

test('the tokenizer reads declarations, not letters', () => {
  const path = 'probe/index.css';
  assert.deepEqual(parseErrors(path, TOKENIZER_FIXTURE), [], 'the fixture must be valid CSS');
  const sites = fileSites(path, TOKENIZER_FIXTURE);
  assert.deepEqual(
    sites.map((site) => [site.line, site.property, site.band]),
    [
      [5, 'margin-left', 'physical'],
      [6, 'padding-right', 'physical'],
      [7, 'transform', 'physical'],
      [9, 'text-align', 'physical'],
      [10, 'transform', 'inert'],
      [11, 'left', 'inert'],
      [11, 'right', 'inert'],
    ],
    'a comment, a string, a custom property, a logical spelling, a neutral value and a block-only translate are not sites',
  );
});

test('a signed x is read from the transform function, not from the text', () => {
  assert.deepEqual(inlineTranslations('transform', 'translateX(-100%)'), ['-100%']);
  assert.deepEqual(inlineTranslations('transform', 'translate(-50%, -50%)'), ['-50%']);
  assert.deepEqual(inlineTranslations('transform', 'translate3d(8px, 0, 0)'), ['8px']);
  assert.deepEqual(inlineTranslations('translate', '-50% 0'), ['-50%']);
  assert.deepEqual(inlineTranslations('translate', 'none'), [], '`none` moves nothing');
  assert.deepEqual(inlineTranslations('transform', 'translateY(-4px) rotate(45deg)'), [], 'a block-axis move is not inline');
  assert.deepEqual(inlineTranslations('transform', 'translateX(0)'), [], 'a zero move is not a site');
  assert.deepEqual(inlineTranslations('transform', 'matrix(1, 0, 0, 1, 12, 0)'), ['matrix()'], 'a matrix is unresolved, never silently green');
});

// ---------------------------------------------------------------------------
// Planted reds
// ---------------------------------------------------------------------------

const SPELLINGS = [
  ['a physical margin', 'margin-left: 4px;'],
  ['a physical padding', 'padding-right: var(--ds-spacing-2);'],
  ['a physical inset', 'left: 12px;'],
  ['a physical border', 'border-right: 1px solid var(--ds-color-border);'],
  ['a physical border width', 'border-left-width: 2px;'],
  ['a physical corner radius', 'border-top-left-radius: 4px;'],
  ['a physical text alignment', 'text-align: right;'],
  ['a float', 'float: left;'],
  ['an UPPERCASE property', 'MARGIN-LEFT: 4px;'],
  ['an unmirrored slide', 'transform: translateX(-100%);'],
  ['an unmirrored slide in the shorthand property', 'translate: -12px 0;'],
  ['an unresolved matrix', 'transform: matrix(1, 0, 0, 1, 12, 0);'],
];

for (const [label, body] of SPELLINGS) {
  test(`a planted physical declaration written as ${label} turns the gate red`, () => {
    withPlantedTree(
      (sandbox) => plant(sandbox, CLEAN_FILE, body),
      (findings) => {
        const reported = mentions(findings, CLEAN_FILE);
        assert.equal(reported.length, 1, `expected one finding; got ${JSON.stringify(findings, null, 1)}`);
        assert.ok(reported[0].includes('no band declares'), reported[0]);
        assert.ok(reported[0].startsWith(`${CLEAN_FILE}: 1 physical-CSS debt site(s)`), reported[0]);
      },
    );
  });
}

const NESTINGS = [
  ['a media query', '@media (min-width: 40rem) { .ds-planted-drill { margin-left: 4px; } }'],
  ['a supports block', '@supports (display: grid) { .ds-planted-drill { margin-left: 4px; } }'],
  ['two at-rules deep', '@media print { @supports (color: red) { .ds-planted-drill { left: 8px; } } }'],
  ['a keyframe step', '@keyframes ds-planted-drill { 0% { transform: translateX(-24px); } 100% { transform: none; } }'],
  ['a nested rule', '.ds-planted-drill { color: red; & > .child { padding-left: 4px; } }'],
];

for (const [label, snippet] of NESTINGS) {
  test(`a planted physical declaration inside ${label} turns the gate red`, () => {
    withPlantedTree(
      (sandbox) => append(sandbox, CLEAN_FILE, snippet),
      (findings) => {
        const reported = mentions(findings, CLEAN_FILE);
        assert.equal(reported.length, 1, `expected one finding; got ${JSON.stringify(findings, null, 1)}`);
        assert.ok(reported[0].startsWith(`${CLEAN_FILE}: 1 physical-CSS debt site(s)`), reported[0]);
      },
    );
  });
}

test('a logical spelling is never a finding', () => {
  withPlantedTree(
    (sandbox) => plant(
      sandbox,
      CLEAN_FILE,
      'margin-inline-start: 4px; padding-inline-end: 8px; inset-inline-start: 0; border-inline-end: 0; text-align: start;',
    ),
    (findings) => {
      assert.deepEqual(mentions(findings, CLEAN_FILE), []);
    },
  );
});

test('a direction-NEUTRAL value on a value-gated property is not a finding', () => {
  withPlantedTree(
    (sandbox) => plant(sandbox, CLEAN_FILE, 'text-align: center; float: none;'),
    (findings) => {
      assert.deepEqual(mentions(findings, CLEAN_FILE), []);
    },
  );
});

// ---------------------------------------------------------------------------
// The bands the measurement decides
// ---------------------------------------------------------------------------

test('a CENTRING translate is inert, not debt -- and still counted', () => {
  withPlantedTree(
    (sandbox) => plant(sandbox, CLEAN_FILE, 'transform: translateX(-50%);'),
    (findings, counts, sites) => {
      const planted = sites.filter((site) => site.path === CLEAN_FILE);
      assert.equal(planted.length, 1);
      assert.equal(planted[0].band, 'inert', 'a centring +/-50% moves nothing when the direction flips');
      const reported = mentions(findings, CLEAN_FILE);
      assert.equal(reported.length, 1, JSON.stringify(findings, null, 1));
      assert.ok(reported[0].includes('inert site(s) no band declares'), reported[0]);
    },
  );
});

test('a SYMMETRIC inset pair is inert, not debt', () => {
  withPlantedTree(
    (sandbox) => plant(sandbox, CLEAN_FILE, 'left: 0; right: 0;'),
    (findings, counts, sites) => {
      assert.deepEqual(sites.filter((site) => site.path === CLEAN_FILE).map((site) => site.band), ['inert', 'inert']);
      const reported = mentions(findings, CLEAN_FILE);
      assert.equal(reported.length, 1, JSON.stringify(findings, null, 1));
      assert.ok(reported[0].startsWith(`${CLEAN_FILE}: 2 physical-CSS inert site(s)`), reported[0]);
    },
  );
});

test('an asymmetric inset pair is NOT inert', () => {
  withPlantedTree(
    (sandbox) => plant(sandbox, CLEAN_FILE, 'left: 0; right: 8px;'),
    (findings, counts, sites) => {
      assert.deepEqual(sites.filter((site) => site.path === CLEAN_FILE).map((site) => site.band), ['physical', 'physical']);
    },
  );
});

test('a translate MIRRORED by a :dir(rtl) twin is green, in either qualifier spelling', () => {
  for (const qualifier of [':dir(rtl)', "[dir='rtl'] "]) {
    withPlantedTree(
      (sandbox) => append(
        sandbox,
        CLEAN_FILE,
        `.ds-planted-drill { transform: translateX(-100%); }\n`
          + `${qualifier === ':dir(rtl)' ? '.ds-planted-drill:dir(rtl)' : "[dir='rtl'] .ds-planted-drill"} { transform: translateX(100%); }`,
      ),
      (findings, counts, sites) => {
        assert.deepEqual(
          sites.filter((site) => site.path === CLEAN_FILE).map((site) => site.band),
          ['mirrored', 'mirrored'],
          `the ${qualifier} pair must be read as one mirrored pair`,
        );
        assert.deepEqual(mentions(findings, CLEAN_FILE), []);
      },
    );
  }
});

test('a mirror that flips only ONE selector of a comma list does not excuse the others', () => {
  withPlantedTree(
    (sandbox) => append(
      sandbox,
      CLEAN_FILE,
      '.ds-planted-a, .ds-planted-b { transform: translateX(-100%); }\n'
        + '.ds-planted-a:dir(rtl) { transform: translateX(100%); }\n'
        + '.ds-planted-b { padding-left: 4px; }',
    ),
    (findings, counts, sites) => {
      const planted = sites.filter((site) => site.path === CLEAN_FILE);
      // The comma rule is mirrored for `.ds-planted-a`, so the shared
      // declaration is green; the unrelated physical padding still fails.
      assert.equal(planted.filter((site) => site.band === 'mirrored').length, 2);
      const reported = mentions(findings, CLEAN_FILE);
      assert.equal(reported.length, 1, JSON.stringify(findings, null, 1));
      assert.ok(reported[0].includes('padding-left: 4px'), reported[0]);
    },
  );
});

test('an env(safe-area-inset-*) padding is the documented exception class, not debt', () => {
  const baseline = readBaseline();
  const bands = classify(physicalCssSites(), baseline);
  assert.ok(bands.excepted.length > 0);
  for (const site of bands.excepted) {
    const declared = baseline.namedExceptions[site.path].sites.find((row) => row.locator === site.locator);
    assert.ok(baseline.exceptionClasses[declared.class], `${site.path} claims an undeclared class`);
  }
  assert.ok(
    bands.excepted.some((site) => /env\(\s*safe-area-inset-(left|right)/.test(site.locator)),
    'the safe-area class must have live members',
  );
  // A planted one in an UNDECLARED file is still judged: the class is a
  // rationale, never a blanket permission.
  withPlantedTree(
    (sandbox) => plant(sandbox, CLEAN_FILE, 'padding-left: env(safe-area-inset-left, 0px);'),
    (findings) => {
      const reported = mentions(findings, CLEAN_FILE);
      assert.equal(reported.length, 1, JSON.stringify(findings, null, 1));
      assert.ok(reported[0].includes('no band declares'), reported[0]);
    },
  );
});

// ---------------------------------------------------------------------------
// The ratchet: both directions
// ---------------------------------------------------------------------------

test('a SECOND site in an already-pinned debt file grows its count and fails', () => {
  const pin = readBaseline().pinnedDebt[PINNED_DEBT].sites;
  withPlantedTree(
    (sandbox) => plant(sandbox, PINNED_DEBT, 'margin-left: 4px;'),
    (findings) => {
      const reported = mentions(findings, PINNED_DEBT);
      assert.equal(reported.length, 1, JSON.stringify(findings, null, 1));
      assert.ok(reported[0].includes(`debt sites GREW from ${pin} to ${pin + 1}`), reported[0]);
    },
  );
});

test('a second site in an INERT file grows that band too', () => {
  const pin = readBaseline().inert[PINNED_INERT].sites;
  withPlantedTree(
    (sandbox) => plant(sandbox, PINNED_INERT, 'transform: translateX(50%);'),
    (findings) => {
      const reported = mentions(findings, PINNED_INERT);
      assert.equal(reported.length, 1, JSON.stringify(findings, null, 1));
      assert.ok(reported[0].includes(`inert sites GREW from ${pin} to ${pin + 1}`), reported[0]);
    },
  );
});

test('a correction that removes a site fails with an instruction to LOWER the pin', () => {
  // The ratchet direction: shrinking is red too, so the pin follows the tree
  // down instead of quietly keeping room for the site to come back.
  const pin = readBaseline().pinnedDebt[PINNED_DEBT].sites;
  withPlantedTree(
    (sandbox) => rewrite(
      sandbox,
      PINNED_DEBT,
      (text) => text.replace('transform: translateX(-100%);', 'transform: none;'),
    ),
    (findings) => {
      const reported = mentions(findings, PINNED_DEBT);
      assert.equal(reported.length, 1, JSON.stringify(findings, null, 1));
      assert.ok(reported[0].includes(`FELL from ${pin} to ${pin - 1}`), reported[0]);
      assert.ok(reported[0].includes(`lower the pin to ${pin - 1}`), reported[0]);
    },
  );
});

test('a file that drains completely fails with an instruction to REMOVE the pin', () => {
  withPlantedTree(
    (sandbox) => rewrite(
      sandbox,
      PINNED_INERT,
      (text) => text.replaceAll('translateX(-50%)', 'translateX(0)'),
    ),
    (findings) => {
      const reported = mentions(findings, PINNED_INERT);
      assert.ok(reported.some((finding) => finding.includes('remove the pin')), JSON.stringify(findings, null, 1));
    },
  );
});

// ---------------------------------------------------------------------------
// Exceptions bind to a site; stamps bind to a selector
// ---------------------------------------------------------------------------

test('a NEW site in a named-exception file is judged, not excused', () => {
  withPlantedTree(
    (sandbox) => plant(sandbox, EXCEPTION_FILE, 'margin-left: 4px;'),
    (findings) => {
      const reported = mentions(findings, EXCEPTION_FILE);
      assert.equal(reported.length, 1, JSON.stringify(findings, null, 1));
      assert.ok(reported[0].includes('no band declares'), reported[0]);
      assert.ok(reported[0].includes('margin-left: 4px'), 'the finding must name the unexcused site');
    },
  );
});

test('SUBSTITUTING the excepted site at equal count fails', () => {
  // Same file, same number of physical sites: a count-only exception would
  // stay green. The declared locator no longer matches, and the stand-in is
  // judged as the unbanded site it is.
  withPlantedTree(
    (sandbox) => rewrite(sandbox, EXCEPTION_FILE, (text) => text.replace(EXCEPTION_SITE, 'left: 24px;')),
    (findings, counts) => {
      // The file measures three sites: the excepted inset plus the centring
      // translate and its :dir(rtl) mirror. The substitution keeps all three.
      assert.equal(counts[EXCEPTION_FILE], 3, 'the drill must hold the count equal');
      const reported = mentions(findings, EXCEPTION_FILE);
      assert.equal(reported.length, 2, JSON.stringify(findings, null, 1));
      assert.ok(reported.some((finding) => finding.includes('matches no physical site')), reported.join('\n'));
      assert.ok(reported.some((finding) => finding.includes('left: 24px')), reported.join('\n'));
    },
  );
});

test('a DUPLICATE of the excepted site cannot ride the same exception', () => {
  withPlantedTree(
    (sandbox) => rewrite(
      sandbox,
      EXCEPTION_FILE,
      (text) => text.replace(
        ".ds-tour.ds-tour--modern[data-part='root'] > [data-part='spotlight'] {",
        ".ds-tour.ds-tour--modern[data-part='root'] > [data-part='spotlight'] {\n  left: var(--ds-tour-spotlight-left);",
      ),
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
    (sandbox) => rewrite(sandbox, EXCEPTION_FILE, (text) => `/* drill */\n\n\n${text}`),
    (findings) => {
      assert.deepEqual(findings, []);
    },
  );
});

test('a SECOND declaration under a declared stamp selector grows the stamp and fails', () => {
  const baseline = readBaseline();
  const pin = baseline.physicalStamp[STAMP_FILE].selectors[0];
  withPlantedTree(
    (sandbox) => rewrite(
      sandbox,
      STAMP_FILE,
      (text) => text.replace(`${pin.selector} {`, `${pin.selector} {\n  padding-left: 4px;`),
    ),
    (findings) => {
      const reported = mentions(findings, STAMP_FILE);
      assert.equal(reported.length, 1, JSON.stringify(findings, null, 1));
      assert.ok(reported[0].includes('physical stamp'), reported[0]);
      assert.ok(reported[0].includes(`GREW from ${pin.sites} to ${pin.sites + 1}`), reported[0]);
    },
  );
});

test('a stamp whose contract turned logical fails with an instruction to remove the row', () => {
  const pin = readBaseline().physicalStamp[STAMP_FILE].selectors[0];
  withPlantedTree(
    (sandbox) => rewrite(sandbox, STAMP_FILE, (text) => text.replace(
      `${pin.selector} {\n  text-align: left;`,
      `${pin.selector} {\n  text-align: start;`,
    )),
    (findings) => {
      const reported = mentions(findings, STAMP_FILE);
      assert.equal(reported.length, 1, JSON.stringify(findings, null, 1));
      assert.ok(reported[0].includes('matches no site'), reported[0]);
    },
  );
});

test('a physical declaration OUTSIDE the declared stamp selector is judged as debt', () => {
  withPlantedTree(
    (sandbox) => plant(sandbox, STAMP_FILE, 'margin-left: 4px;', '.rottay-typography-drill'),
    (findings) => {
      const reported = mentions(findings, STAMP_FILE);
      assert.equal(reported.length, 1, JSON.stringify(findings, null, 1));
      assert.ok(reported[0].includes('debt site(s) no band declares'), reported[0]);
    },
  );
});

test('judge() refuses a count map: counts cannot bind an exception to its site', () => {
  assert.throws(() => judge(countSites(physicalCssSites())), /site list/);
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
  const stamps = Object.entries(baseline.physicalStamp);
  assert.ok(stamps.length > 0, 'physicalStamp must not be empty-by-accident');
  for (const [path, row] of stamps) {
    const selectors = row.selectors.map((pin) => pin.selector);
    assert.equal(new Set(selectors).size, selectors.length, `${path} declares a selector twice`);
    for (const pin of row.selectors) {
      assert.ok(/\[data-(placement|fixed|align|side)/.test(pin.selector), `${path} stamp must be keyed on a physical data-* contract`);
      assert.ok(pin.reason.length > 120, `a one-line reason is not a reason: stamp ${path} ${pin.selector}`);
      assert.ok(Number.isInteger(pin.sites) && pin.sites > 0, `${path} stamp must pin a real count`);
    }
  }
  const classes = Object.entries(baseline.exceptionClasses);
  assert.ok(classes.length > 0, 'exceptionClasses must not be empty-by-accident');
  for (const [name, row] of classes) {
    assert.ok(row.reason.length > 200, `an exception CLASS carries the rationale for every member: ${name}`);
  }
  const exceptions = Object.entries(namedExceptions(baseline));
  assert.ok(exceptions.length > 0, 'namedExceptions must not be empty-by-accident');
  for (const [path, row] of exceptions) {
    assert.ok(Array.isArray(row.sites) && row.sites.length > 0, `${path} must declare its sites, not a count`);
    const locators = row.sites.map((site) => site.locator);
    assert.equal(new Set(locators).size, locators.length, `${path} declares a locator twice`);
    for (const site of row.sites) {
      assert.match(site.locator, /^\S.* \| [a-z-]+: \S/, `${path} locator must read \`selector | property: value\``);
      assert.ok(baseline.exceptionClasses[site.class], `${path} \`${site.locator}\` claims an undeclared class`);
      assert.ok(site.reason.length > 120, `a one-line reason is not a reason: exception ${path} ${site.locator}`);
    }
  }
});

test('the property vocabulary is closed and every name is an inline-axis one', () => {
  // The floor is the measured size of the vocabulary, not a round number below
  // it: `inset-left` and `inset-right` were removed because CSS ships no such
  // property, so a floor with slack in it would have hidden the correction.
  assert.equal(PHYSICAL_PROPERTIES.length, 24, 'the longhand vocabulary is closed; change it deliberately');
  for (const property of PHYSICAL_PROPERTIES) {
    assert.ok(
      /(^|-)(left|right)(-|$)|^text-align$|^float$/.test(property),
      `${property} is not a physical inline-axis property`,
    );
    assert.ok(!/^inset-(left|right)$/.test(property), `${property} is not a real CSS property`);
  }
  // The shorthands are a SECOND vocabulary: their names carry no side, so they
  // are legal here exactly because the gate reads their VALUES by position.
  const shorthands = Object.entries(PHYSICAL_SHORTHANDS);
  assert.equal(shorthands.length, 9, 'the shorthand vocabulary is closed; change it deliberately');
  for (const [property, kind] of shorthands) {
    assert.ok(!/(^|-)(left|right)(-|$)/.test(property), `${property} is a longhand, not a shorthand`);
    assert.ok(kind === 'box' || kind === 'corner', `${property} must say how its value is ordered`);
  }
  for (const property of PHYSICAL_PROPERTIES) {
    assert.equal(PHYSICAL_SHORTHANDS[property], undefined, `${property} is declared twice`);
  }
});

// ---------------------------------------------------------------------------
// Shorthands: the hole a longhand-only vocabulary leaves open
// ---------------------------------------------------------------------------

test('a box shorthand is read at positions 2 and 4, a corner shorthand as two inline pairs', () => {
  assert.deepEqual(shorthandInlinePairs('padding', '8px 32px 8px 12px'), [['12px', '32px']]);
  assert.deepEqual(shorthandInlinePairs('padding', '8px 12px'), [], 'a two-value box paints both inline edges alike');
  assert.deepEqual(shorthandInlinePairs('padding', '8px 12px 16px'), [], 'a three-value box paints both inline edges alike');
  assert.deepEqual(shorthandInlinePairs('padding', '8px'), []);
  assert.deepEqual(shorthandInlinePairs('margin', '0 auto'), [], 'the centring idiom is symmetric');
  assert.deepEqual(shorthandInlinePairs('border-radius', '0 8px 8px 0'), [['0', '8px'], ['0', '8px']]);
  assert.deepEqual(shorthandInlinePairs('border-radius', '8px'), [], 'one term is one radius on all four corners');
  assert.deepEqual(shorthandInlinePairs('border-radius', '10px 0'), [['10px', '0'], ['0', '10px']], 'a two-value radius is NOT symmetric');
  assert.deepEqual(shorthandInlinePairs('border-radius', '50% / 20%'), [], 'the elliptical form is two lists, out of scope');
  assert.deepEqual(shorthandInlinePairs('padding', 'var(--ds-drill-box)'), [], 'one term is not a list the gate can read');
  assert.deepEqual(
    shorthandInlinePairs('padding', '0 var(--ds-spacing-2, 8px 9px) 0 var(--ds-spacing-1)'),
    [['var(--ds-spacing-1)', 'var(--ds-spacing-2, 8px 9px)']],
    'a var() with inner spaces stays one term',
  );
  assert.deepEqual(shorthandInlinePairs('margin-left', '4px'), [], 'a longhand is not a shorthand');
});

const SHORTHAND_SPELLINGS = [
  ['an asymmetric inset', 'inset: 0 4px 0 8px;'],
  ['an asymmetric margin', 'margin: 0 4px 0 8px;'],
  ['an asymmetric padding', 'padding: 8px 32px 8px 12px;'],
  ['an asymmetric border width', 'border-width: 2px 0 0 2px;'],
  ['an asymmetric border color', 'border-color: var(--ds-color-border) var(--ds-color-border-strong) var(--ds-color-border) var(--ds-color-border-subtle);'],
  ['an asymmetric border style', 'border-style: solid dashed solid dotted;'],
  ['an asymmetric scroll margin', 'scroll-margin: 0 4px 0 8px;'],
  ['an asymmetric scroll padding', 'scroll-padding: 0 4px 0 8px;'],
  ['an asymmetric corner radius', 'border-radius: 0 4px 4px 0;'],
];

for (const [label, body] of SHORTHAND_SPELLINGS) {
  test(`a planted shorthand written as ${label} turns the gate red`, () => {
    withPlantedTree(
      (sandbox) => plant(sandbox, CLEAN_FILE, body),
      (findings) => {
        const reported = mentions(findings, CLEAN_FILE);
        assert.equal(reported.length, 1, `expected one finding; got ${JSON.stringify(findings, null, 1)}`);
        assert.ok(reported[0].startsWith(`${CLEAN_FILE}: 1 physical-CSS debt site(s)`), reported[0]);
      },
    );
  });
}

test('a SYMMETRIC shorthand is not a site: the band must not fill with neutral paint', () => {
  withPlantedTree(
    (sandbox) => plant(
      sandbox,
      CLEAN_FILE,
      'padding: 8px 12px; margin: 0 auto; border-radius: 4px; inset: 0; border-width: 1px 2px 3px 2px;',
    ),
    (findings, counts) => {
      assert.deepEqual(mentions(findings, CLEAN_FILE), []);
      assert.equal(counts[CLEAN_FILE], undefined, 'a symmetric shorthand is not a site at all');
    },
  );
});

test('the live shorthand sites land in the bands the ledger declares', () => {
  const bands = classify(physicalCssSites(), readBaseline());
  const shorthands = [...bands.debt, ...bands.stamp, ...bands.inert, ...bands.excepted]
    .filter((site) => site.kind === 'shorthand');
  assert.ok(shorthands.length >= 9, `only ${shorthands.length} shorthand sites measured`);
  // The drawer's and the sheet's placement radii ride the same physical
  // contract as the `left: 0` beside them, so they belong to the stamp; the
  // rest is debt, and nothing may be excused as an exception by spelling.
  const stamped = bands.stamp.filter((site) => site.kind === 'shorthand');
  assert.equal(stamped.length, 4);
  for (const site of stamped) {
    assert.equal(site.property, 'border-radius');
    assert.match(site.path, /skin\/(drawer|sheet)\/index\.css$/);
  }
  assert.equal(bands.excepted.filter((site) => site.kind === 'shorthand').length, 0);
});

// ---------------------------------------------------------------------------
// A value is a value wherever it is spelled
// ---------------------------------------------------------------------------

test('a physical keyword inside a var() FALLBACK is still a physical value', () => {
  const path = 'probe/index.css';
  const fixture = [
    '.a { text-align: var(--ds-drill-align, left); }',
    '.b { text-align: var(--ds-drill-align,right); }',
    '.c { text-align: var(--ds-drill-align, center); }',
    '.d { float: var(--ds-drill-float, none); }',
    '.e { text-align: var(--ds-drill-align-left); }',
  ].join('\n');
  assert.deepEqual(parseErrors(path, fixture), [], 'the fixture must be valid CSS');
  assert.deepEqual(
    fileSites(path, fixture).map((site) => site.line),
    [1, 2],
    'a neutral fallback and a custom-property NAME that merely contains "left" are not sites',
  );
});

test('a planted var() fallback turns the gate red', () => {
  withPlantedTree(
    (sandbox) => plant(sandbox, CLEAN_FILE, 'text-align: var(--ds-drill-align, left);'),
    (findings) => {
      const reported = mentions(findings, CLEAN_FILE);
      assert.equal(reported.length, 1, JSON.stringify(findings, null, 1));
      assert.ok(reported[0].includes('no band declares'), reported[0]);
    },
  );
});

// ---------------------------------------------------------------------------
// A mirror has to WIN: cascade order and specificity
// ---------------------------------------------------------------------------

test('specificity counts what the cascade counts', () => {
  assert.deepEqual(specificity('.a'), [0, 1, 0]);
  assert.deepEqual(specificity('.a:dir(rtl)'), [0, 2, 0]);
  assert.deepEqual(specificity("[dir='rtl'] .a"), [0, 2, 0]);
  assert.deepEqual(specificity(':where(:dir(rtl)).a'), [0, 1, 0], ':where() contributes nothing');
  assert.deepEqual(specificity('.a:not(.b.c)'), [0, 3, 0], ':not() contributes its most specific argument');
  assert.deepEqual(specificity('#id .a span'), [1, 1, 1]);
  assert.deepEqual(specificity('.a::after'), [0, 1, 1], 'a pseudo-element is type-level, not class-level');
  assert.deepEqual(
    specificity("@media (min-width: 40rem) / .a"),
    specificity('.a'),
    'an at-rule carries no specificity',
  );
  assert.equal(compareSpecificity([0, 2, 0], [0, 1, 9]), 1);
  assert.equal(compareSpecificity([0, 1, 0], [0, 1, 0]), 0);
});

test('an RTL twin declared ABOVE an equally specific base is dead paint, not a mirror', () => {
  // `:where()` zeroes the qualifier's specificity, so the twin ties with the
  // base -- and a tie is decided by source order, which the base wins here.
  withPlantedTree(
    (sandbox) => append(
      sandbox,
      CLEAN_FILE,
      '.ds-planted-drill:where(:dir(rtl)) { transform: translateX(100%); }\n'
        + '.ds-planted-drill { transform: translateX(-100%); }',
    ),
    (findings, counts, sites) => {
      const planted = sites.filter((site) => site.path === CLEAN_FILE);
      assert.deepEqual(planted.map((site) => site.band), ['mirrored', 'physical']);
      const reported = mentions(findings, CLEAN_FILE);
      assert.equal(reported.length, 1, JSON.stringify(findings, null, 1));
      assert.ok(reported[0].startsWith(`${CLEAN_FILE}: 1 physical-CSS debt site(s)`), reported[0]);
    },
  );
});

test('the same tied pair in the other ORDER is a real mirror', () => {
  // The control for the drill above: nothing but the source order changes.
  withPlantedTree(
    (sandbox) => append(
      sandbox,
      CLEAN_FILE,
      '.ds-planted-drill { transform: translateX(-100%); }\n'
        + '.ds-planted-drill:where(:dir(rtl)) { transform: translateX(100%); }',
    ),
    (findings, counts, sites) => {
      // The tie now falls to the twin, because it is declared last: the base
      // is a mirrored pair rather than debt, and nothing is reported.
      assert.deepEqual(sites.filter((site) => site.path === CLEAN_FILE).map((site) => site.band), ['mirrored', 'mirrored']);
      assert.deepEqual(mentions(findings, CLEAN_FILE), []);
    },
  );
});

test('a twin that qualifies only ONE part of its own comma list mirrors only that part', () => {
  withPlantedTree(
    (sandbox) => append(
      sandbox,
      CLEAN_FILE,
      ".ds-planted-a, .ds-planted-b:dir(rtl) { transform: translateX(100%); }\n"
        + '.ds-planted-a { transform: translateX(-100%); }',
    ),
    (findings, counts, sites) => {
      const planted = sites.filter((site) => site.path === CLEAN_FILE);
      assert.deepEqual(planted.map((site) => site.band), ['mirrored', 'physical']);
      const reported = mentions(findings, CLEAN_FILE);
      assert.equal(reported.length, 1, JSON.stringify(findings, null, 1));
      assert.ok(reported[0].includes('translateX(-100%)'), reported[0]);
    },
  );
});

test("the dropdown's :dir(rtl) twin sits ABOVE the placement rules that tie with it", () => {
  // A regression pin, not a measurement: the twin and the `*Left`/`*Right`
  // placement rules have equal specificity, so source order decides which
  // `translate` survives. The edge-pinned placements must keep their
  // `translate: none`, which only holds while they are declared LAST.
  const path = 'runtime/engines/modern/skin/dropdown/index.css';
  const text = readFileSync(join(ROOT, CSS_ROOT, path), 'utf8');
  const twin = ".ds-dropdown-surface[data-part='surface']:not([data-portaled='true']):dir(rtl)";
  const edges = [
    ".ds-dropdown-surface[data-part='surface']:not([data-portaled='true'])[data-placement$='Left']",
    ".ds-dropdown-surface[data-part='surface']:not([data-portaled='true'])[data-placement$='Right']",
  ];
  assert.ok(text.includes(`${twin} {`), 'the mirror twin must exist');
  for (const edge of edges) {
    assert.ok(text.includes(`${edge} {`), `${edge} must exist`);
    assert.equal(compareSpecificity(specificity(twin), specificity(edge)), 0, 'the tie is the whole point');
    assert.ok(text.indexOf(`${twin} {`) < text.indexOf(`${edge} {`), `${edge} must be declared after the twin`);
    const body = text.slice(text.indexOf(`${edge} {`), text.indexOf('}', text.indexOf(`${edge} {`)));
    assert.match(body, /translate:\s*none/, 'the edge-pinned placement must clear the centring pull-back');
  }
});

// ---------------------------------------------------------------------------
// glyph-geometry: a class is a rationale, not a permission
// ---------------------------------------------------------------------------

const GLYPH_FILE = 'runtime/engines/modern/skin/color-picker/index.css';

test('the checkmark is declared glyph-geometry, and the class is a live one', () => {
  const baseline = readBaseline();
  const bands = classify(physicalCssSites(), baseline);
  const glyphs = bands.excepted.filter((site) => {
    const row = baseline.namedExceptions[site.path].sites.find((entry) => entry.locator === site.locator);
    return row.class === 'glyph-geometry';
  });
  assert.equal(glyphs.length, 1, 'the class must have exactly its one declared member');
  assert.equal(glyphs[0].path, GLYPH_FILE);
  assert.equal(glyphs[0].property, 'border-left');
  assert.match(glyphs[0].selector, /\[data-selected='true'\]::after$/, 'the site is the checkmark, not the swatch box');
});

test('a glyph-geometry site with no class entry is red', () => {
  const baseline = readBaseline();
  const stripped = { ...baseline, exceptionClasses: { ...baseline.exceptionClasses } };
  delete stripped.exceptionClasses['glyph-geometry'];
  const findings = judge(physicalCssSites(), stripped);
  assert.equal(findings.length, 1, JSON.stringify(findings, null, 1));
  assert.ok(findings[0].includes('claims the undeclared class `glyph-geometry`'), findings[0]);
});

test('a glyph-geometry site with no EXCEPTION entry is judged as debt like any other', () => {
  const baseline = readBaseline();
  const stripped = { ...baseline, namedExceptions: { ...baseline.namedExceptions } };
  delete stripped.namedExceptions[GLYPH_FILE];
  const findings = judge(physicalCssSites(), stripped);
  assert.equal(findings.length, 1, JSON.stringify(findings, null, 1));
  assert.ok(findings[0].startsWith(`${GLYPH_FILE}: 1 physical-CSS debt site(s) no band declares`), findings[0]);
  assert.ok(findings[0].includes('border-left'), findings[0]);
});

test('a SECOND border in the checkmark rule cannot ride the glyph-geometry exception', () => {
  withPlantedTree(
    (sandbox) => rewrite(
      sandbox,
      GLYPH_FILE,
      (text) => text.replace(
        "  border-bottom: var(--ds-color-picker-selected-ring-width",
        "  border-right: 1px solid var(--ds-color-picker-check-ink);\n  border-bottom: var(--ds-color-picker-selected-ring-width",
      ),
    ),
    (findings) => {
      const reported = mentions(findings, GLYPH_FILE);
      assert.equal(reported.length, 1, JSON.stringify(findings, null, 1));
      assert.ok(reported[0].includes('no band declares'), reported[0]);
      assert.ok(reported[0].includes('border-right'), reported[0]);
    },
  );
});

// ---------------------------------------------------------------------------
// The scan roots are the whole owner
// ---------------------------------------------------------------------------

test('the scan covers every authored CSS owner, not just the skins', () => {
  assert.deepEqual([...SCAN_ROOTS].sort(), ['facade', 'foundation', 'presentation', 'runtime']);
  const measured = new Set(physicalCssSites().map((site) => site.path.split('/')[0]));
  // The foundations really do paint physical edges: a scan scoped to the skins
  // would have reported a clean tree while these stayed unmeasured.
  assert.ok(measured.has('foundation'), 'the foundation CSS must be measured');
  assert.ok(measured.has('presentation'), 'the engine-agnostic component CSS must be measured');
  assert.ok(measured.has('runtime'), 'the engine CSS must be measured');
  const counts = countSites(physicalCssSites());
  for (const path of [
    'foundation/responsive/channels/index.css',
    'foundation/animations/keyframes/index.css',
    'foundation/animations/transitions/index.css',
    'presentation/components/patterns/index.css',
    'presentation/components/arc/index.css',
  ]) {
    assert.ok(counts[path] > 0, `${path} must be measured`);
  }
});

test('the responsive channel vocabulary is pinned as DEBT, never excused', () => {
  // It is a public contract (`data-ds-responsive="margin-left@xs"`), so its
  // migration is the owner's, not the stylesheet's -- but the sites are real
  // RTL defects and an exception class would say they are not.
  const baseline = readBaseline();
  const path = 'foundation/responsive/channels/index.css';
  assert.equal(baseline.namedExceptions[path], undefined);
  assert.equal(baseline.physicalStamp[path], undefined);
  assert.equal(baseline.inert[path], undefined);
  assert.ok(baseline.pinnedDebt[path].sites >= 24);
  assert.match(baseline.pinnedDebt[path].reason, /D9/);
});
