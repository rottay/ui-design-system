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
  PHYSICAL_CONTRACT,
  PHYSICAL_CONTRACT_KEY,
  PHYSICAL_PROPERTIES,
  PHYSICAL_SHORTHANDS,
  SCAN_ROOTS,
  channelsRead,
  classify,
  compareSpecificity,
  countSites,
  coversSequence,
  cssCorpus,
  fileSites,
  inlineTranslations,
  judge,
  keyframeConsumers,
  keyframeOf,
  namedExceptions,
  physicalCssSites,
  readBaseline,
  run,
  selectorSequence,
  shorthandInlinePairs,
  specificity,
} from './index.mjs';
import { packageRoot as findPackageRoot } from '../../../libraries/repo-root/index.mjs';

const ROOT = findPackageRoot(dirname(fileURLToPath(import.meta.url)));

/** A skin no band declares, so a planted site is unambiguously the drill's. */
const CLEAN_FILE = 'runtime/engines/modern/skin/divider/index.css';
/** Four dead toast slides: pinned debt owed to a removal lot, no consumer to mirror at. */
const PINNED_DEBT = 'presentation/components/skin/toast-animation-keyframes/index.css';
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
      // A stamp is keyed on a physical `data-*` contract, or -- for the motion
      // arm of that same contract -- on a `@keyframes <name> / <step>` locator,
      // whose honesty the gate checks at the animation-name site instead.
      const keyed = PHYSICAL_CONTRACT_KEY.test(pin.selector) || keyframeOf(pin.selector) !== null;
      assert.ok(keyed, `${path} stamp must be keyed on a physical data-* contract or a keyframe step`);
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

/**
 * Every shorthand site the tree measures, by band and locator: a floor on the
 * COUNT reads a drained site and a newly arrived one as the same number.
 */
const LIVE_SHORTHANDS = [
  [
    'debt',
    'runtime/engines/modern/framework-bridge/index.css',
    "[data-engine='modern'] select | padding: 8px 32px 8px 12px",
  ],
  [
    'stamp',
    'runtime/engines/modern/skin/drawer/index.css',
    ".ds-drawer.ds-drawer--modern[data-part='surface'][data-placement='left'] | border-radius: 0 var(--ds-drawer-radius, var(--ds-radius-lg)) var(--ds-drawer-radius, var(--ds-radius-lg)) 0",
  ],
  [
    'stamp',
    'runtime/engines/modern/skin/drawer/index.css',
    ".ds-drawer.ds-drawer--modern[data-part='surface'][data-placement='right'] | border-radius: var(--ds-drawer-radius, var(--ds-radius-lg)) 0 0 var(--ds-drawer-radius, var(--ds-radius-lg))",
  ],
  [
    'stamp',
    'runtime/engines/modern/skin/sheet/index.css',
    ".ds-sheet.ds-sheet--modern[data-part='root'] > [data-part='surface'][data-placement='left'] | border-radius: 0 var(--ds-sheet-radius, var(--ds-radius-lg)) var(--ds-sheet-radius, var(--ds-radius-lg)) 0",
  ],
  [
    'stamp',
    'runtime/engines/modern/skin/sheet/index.css',
    ".ds-sheet.ds-sheet--modern[data-part='root'] > [data-part='surface'][data-placement='right'] | border-radius: var(--ds-sheet-radius, var(--ds-radius-lg)) 0 0 var(--ds-sheet-radius, var(--ds-radius-lg))",
  ],
];

const BAND_ORDER = ['debt', 'stamp', 'inert', 'excepted'];

test('the live shorthand sites land in the bands the ledger declares', () => {
  const baseline = readBaseline();
  const bands = classify(physicalCssSites(), baseline);
  const measured = BAND_ORDER.flatMap((band) => bands[band]
    .filter((site) => site.kind === 'shorthand')
    .map((site) => [band, site.path, site.locator]));
  const byIdentity = (rows) => [...rows].sort((a, b) => a.join(' | ').localeCompare(b.join(' | ')));
  assert.deepEqual(byIdentity(measured), byIdentity(LIVE_SHORTHANDS));
  // The drawer's and the sheet's placement radii ride the same physical
  // contract as the `left: 0` beside them, so they belong to the stamp; the
  // rest is debt, and nothing may be excused as an exception by spelling.
  for (const site of bands.stamp.filter((site) => site.kind === 'shorthand')) {
    assert.equal(site.property, 'border-radius');
    assert.match(site.selector, PHYSICAL_CONTRACT, `${site.selector} is stamped with no physical contract to follow`);
  }
  for (const site of bands.debt.filter((site) => site.kind === 'shorthand')) {
    const pin = baseline.pinnedDebt[site.path];
    assert.ok(pin, `${site.path} measures a shorthand no pin declares`);
    const declaration = site.locator.split(' | ')[1];
    assert.ok(pin.reason.includes(declaration), `${site.path} pins the site without writing \`${declaration}\``);
  }
  assert.deepEqual(
    [...bands.excepted, ...bands.inert].filter((site) => site.kind === 'shorthand').map((site) => site.locator),
    [],
  );
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

// ---------------------------------------------------------------------------
// A keyframe step is mirrored at its CONSUMERS, or not at all
// ---------------------------------------------------------------------------

/** A keyframe plus the rules that animate with it, planted as one fixture. */
const keyframeFixture = (consumers) => [
  '@keyframes ds-planted-slide {',
  '  from { transform: translateX(-100%); }',
  '  to { transform: none; }',
  '}',
  consumers,
].join('\n');

const plantedBands = (body) => fileSites(CLEAN_FILE, body)
  .filter((site) => site.kind === 'transform')
  .map((site) => site.band);

test('a keyframe step is MIRRORED when its only consumer reverses it under RTL', () => {
  const body = keyframeFixture([
    '.ds-planted-drill { animation: ds-planted-slide 200ms ease both; }',
    '.ds-planted-drill:dir(rtl) { animation-direction: reverse; }',
  ].join('\n'));
  assert.deepEqual(parseErrors(CLEAN_FILE, body), []);
  assert.deepEqual(plantedBands(body), ['mirrored']);
});

test('ONE unmirrored consumer out of two keeps the step as debt', () => {
  // The consumer that reverses does not speak for the one that does not: the
  // second rule paints the step unflipped under RTL, so the step still owes.
  const body = keyframeFixture([
    '.ds-planted-drill { animation: ds-planted-slide 200ms ease both; }',
    '.ds-planted-drill:dir(rtl) { animation-direction: reverse; }',
    '.ds-planted-other { animation-name: ds-planted-slide; }',
  ].join('\n'));
  assert.deepEqual(parseErrors(CLEAN_FILE, body), []);
  assert.deepEqual(plantedBands(body), ['physical']);
});

test('a consumer that reverses WITHOUT an RTL qualifier is not a mirror', () => {
  // `animation-direction: reverse` in every direction plays the slide backwards
  // in LTR too: it is a different animation, not a mirrored one.
  const body = keyframeFixture([
    '.ds-planted-drill { animation: ds-planted-slide 200ms ease both; }',
    '.ds-planted-drill { animation-direction: reverse; }',
  ].join('\n'));
  assert.deepEqual(parseErrors(CLEAN_FILE, body), []);
  assert.deepEqual(plantedBands(body), ['physical']);
});

test('a keyframe NO rule animates with stays debt: dead code is not mirrored', () => {
  const body = keyframeFixture('.ds-planted-drill:dir(rtl) { animation-direction: reverse; }');
  assert.deepEqual(parseErrors(CLEAN_FILE, body), []);
  assert.deepEqual(plantedBands(body), ['physical']);
  // And the tree really does hold steps no CSS rule animates with, pinned rather
  // than excused. The pin is the toast file, whose consumer is the JS runtime --
  // read its reason before treating an unanimated step as removable dead code.
  assert.ok(readBaseline().pinnedDebt[PINNED_DEBT].sites >= 4);
});

test("a step whose x reads a channel is mirrored by the consumer's :dir(rtl) channel twin", () => {
  // The cascader idiom: the step cannot carry a qualifier, so the consumer
  // re-declares the channel the step reads and the column drifts in from the
  // reading start in both directions.
  const body = [
    '@keyframes ds-planted-channel {',
    '  from { transform: translateX(var(--ds-planted-enter-x, -8px)); }',
    '  to { transform: none; }',
    '}',
    '.ds-planted-drill { --ds-planted-enter-x: -8px; animation: ds-planted-channel 200ms ease; }',
    '.ds-planted-drill:dir(rtl) { --ds-planted-enter-x: 8px; }',
  ].join('\n');
  assert.deepEqual(parseErrors(CLEAN_FILE, body), []);
  assert.deepEqual(plantedBands(body), ['mirrored']);
  // The control: a twin that re-declares some OTHER channel mirrors nothing.
  const other = body.replace('.ds-planted-drill:dir(rtl) { --ds-planted-enter-x: 8px; }', '.ds-planted-drill:dir(rtl) { --ds-planted-unrelated: 8px; }');
  assert.deepEqual(plantedBands(other), ['physical']);
});

test('the consumer is resolved ACROSS files, not within one', () => {
  // `foundation/animations/keyframes` is animated from a Modern skin: a
  // per-file reading would have called the live progress sweep dead.
  const sites = physicalCssSites();
  const steps = sites.filter((site) => site.path === 'foundation/animations/keyframes/index.css'
    && site.selector.startsWith('@keyframes ds-foundation-progress-indeterminate'));
  assert.equal(steps.length, 2);
  for (const step of steps) {
    assert.equal(step.band, 'mirrored');
    assert.deepEqual(step.consumers.map((consumer) => consumer.path), ['runtime/engines/modern/skin/progress/index.css']);
  }
});

test('channelsRead reads the channel, never the fallback that stands in for it', () => {
  assert.deepEqual([...channelsRead('translateX(var(--ds-a, var(--ds-b)))')], ['--ds-a']);
  assert.deepEqual([...channelsRead('calc(var(--ds-a) * -1)')], ['--ds-a']);
  assert.deepEqual([...channelsRead('translateX(-100%)')], []);
});

test('a twin only mirrors a consumer it spells IN FULL', () => {
  // The live progress shape: the twin narrows the consumer further, so it
  // matches a subset of the same elements and still counts as its mirror.
  const consumer = selectorSequence(".ds-a.ds-a--modern [data-part='x'][data-part='x']");
  assert.ok(coversSequence(selectorSequence(".ds-a.ds-a--modern[data-type='line'] [data-part='x'][data-part='x']"), consumer));
  // A twin that drops one of the repeated attributes does not spell it in full.
  assert.equal(coversSequence(selectorSequence(".ds-a.ds-a--modern [data-part='x']"), consumer), false);
  assert.equal(coversSequence(selectorSequence('.ds-other'), consumer), false);
  assert.equal(coversSequence(consumer, selectorSequence('')), false, 'an empty consumer is covered by nothing');
});

test('the compound SEQUENCE is compared, combinators included -- not a flat multiset', () => {
  // A multiset reads `.inner .outer` and `.outer .inner` as the same selector.
  // They match different elements, so neither can be the other's mirror.
  const consumer = selectorSequence('.outer .inner');
  assert.equal(coversSequence(selectorSequence('.inner .outer'), consumer), false, 'order must decide');
  assert.ok(coversSequence(selectorSequence('.outer.narrow .inner'), consumer), 'narrowing in place still covers');
  // The combinator is part of the structure: a child is not a descendant.
  assert.equal(coversSequence(selectorSequence('.outer > .inner'), consumer), false);
  assert.equal(coversSequence(selectorSequence('.outer .inner'), selectorSequence('.outer > .inner')), false);
  // A shorter or longer chain matches other elements entirely.
  assert.equal(coversSequence(selectorSequence('.outer .mid .inner'), consumer), false);
  assert.equal(coversSequence(selectorSequence('.inner'), consumer), false);
  // The live shapes the corpus depends on keep their parenthesised commas and
  // their sibling combinator: `:is(a, b)` is one compound, not two.
  const cascader = ".ds-cascader:is([data-part='root'], [data-part='dropdown']) [data-part='menu-column'] + [data-part='menu-column']";
  assert.equal(selectorSequence(cascader).length, 3);
  assert.deepEqual(selectorSequence(cascader).map((compound) => compound.combinator), ['', ' ', '+']);
  assert.ok(coversSequence(selectorSequence(cascader.replace(' + ', ':dir(rtl) + ')), selectorSequence(cascader)));
});

test('a planted `.inner:dir(rtl) .outer` twin does not mirror `.outer .inner`', () => {
  const body = [
    '@keyframes ds-planted-order {',
    '  from { transform: translateX(-100%); }',
    '  to { transform: none; }',
    '}',
    '.outer .inner { animation: ds-planted-order 1s; }',
    '.inner:dir(rtl) .outer { animation-direction: reverse; }',
  ].join('\n');
  assert.deepEqual(parseErrors(CLEAN_FILE, body), []);
  assert.deepEqual(plantedBands(body), ['physical']);
  // The same twin written in the consumer's own order IS the mirror.
  assert.deepEqual(plantedBands(body.replace('.inner:dir(rtl) .outer', '.outer .inner:dir(rtl)')), ['mirrored']);
});

test('a twin that LOSES the cascade is dead paint, not a keyframe mirror', () => {
  // isMirroredBy's rule, applied to the consumer arm: `:where()` contributes
  // nothing, so the twin ties at zero classes and is declared ABOVE the base.
  const body = [
    '.ds-a.ds-b.ds-c:dir(rtl) { animation-direction: reverse; }',
    '@keyframes ds-planted-cascade {',
    '  from { transform: translateX(-100%); }',
    '  to { transform: none; }',
    '}',
    '.ds-a.ds-b.ds-c { animation: ds-planted-cascade 1s; }',
  ].join('\n');
  assert.deepEqual(parseErrors(CLEAN_FILE, body), []);
  assert.deepEqual(plantedBands(body), ['mirrored'], 'the twin out-specifies the base by :dir(rtl)');
  // Wrapped in `:where()` the twin carries NO specificity at all, so an
  // equally weightless consumer declared after it wins and the step still owes.
  const weightless = body
    .replace('.ds-a.ds-b.ds-c:dir(rtl) {', ':where(.ds-a.ds-b.ds-c):dir(rtl) {')
    .replace('.ds-a.ds-b.ds-c { animation', ':where(.ds-a.ds-b.ds-c):where(:dir(ltr), :dir(rtl)) { animation');
  assert.deepEqual(parseErrors(CLEAN_FILE, weightless), []);
  assert.deepEqual(plantedBands(weightless), ['physical']);
});

test('an at-rule-scoped twin does not mirror an UNCONDITIONAL consumer', () => {
  const consume = '.ds-planted-drill { animation: ds-planted-scope 1s; }';
  const body = [
    '@keyframes ds-planted-scope {',
    '  from { transform: translateX(-100%); }',
    '  to { transform: none; }',
    '}',
    consume,
    '@media (min-width: 900px) {',
    '  .ds-planted-drill:dir(rtl) { animation-direction: reverse; }',
    '}',
  ].join('\n');
  assert.deepEqual(parseErrors(CLEAN_FILE, body), []);
  assert.deepEqual(plantedBands(body), ['physical'], 'the twin only holds above 900px');
  // The consumer scoped to the same query is mirrored by it.
  const scoped = body.replace(consume, `@media (min-width: 900px) {\n  ${consume}\n}`);
  assert.deepEqual(parseErrors(CLEAN_FILE, scoped), []);
  assert.deepEqual(plantedBands(scoped), ['mirrored']);
});

test('animation LAYERS are mirrored one by one, with the list repeated', () => {
  // `animation-direction: reverse, normal` reverses layer 1 only. The step the
  // second layer names is painted forwards under RTL, so it still owes.
  const body = (steps) => [
    '@keyframes ds-planted-slide {',
    '  from { transform: translateX(-100%); }',
    '  to { transform: none; }',
    '}',
    '@keyframes ds-planted-other {',
    '  from { transform: translateX(-30%); }',
    '  to { transform: none; }',
    '}',
    '.ds-planted-drill { animation: ds-planted-other 1s, ds-planted-slide 1s; }',
    `.ds-planted-drill:dir(rtl) { animation-direction: ${steps}; }`,
  ].join('\n');
  const banded = (steps) => fileSites(CLEAN_FILE, body(steps))
    .filter((site) => site.kind === 'transform')
    .map((site) => [site.selector, site.band]);
  assert.deepEqual(parseErrors(CLEAN_FILE, body('reverse, normal')), []);
  assert.deepEqual(banded('reverse, normal'), [
    ['@keyframes ds-planted-slide / from', 'physical'],
    ['@keyframes ds-planted-other / from', 'mirrored'],
  ]);
  // The other order reverses the second layer instead.
  assert.deepEqual(banded('normal, reverse'), [
    ['@keyframes ds-planted-slide / from', 'mirrored'],
    ['@keyframes ds-planted-other / from', 'physical'],
  ]);
  // A one-value list repeats over both layers, which is how CSS reads it.
  assert.deepEqual(banded('reverse'), [
    ['@keyframes ds-planted-slide / from', 'mirrored'],
    ['@keyframes ds-planted-other / from', 'mirrored'],
  ]);
});

test('a channel twin that re-declares the SAME value mirrors nothing', () => {
  const body = (twin) => [
    '@keyframes ds-planted-channel {',
    '  from { transform: translateX(var(--ds-planted-enter-x, -8px)); }',
    '  to { transform: none; }',
    '}',
    '.ds-planted-drill { --ds-planted-enter-x: -8px; animation: ds-planted-channel 1s; }',
    `.ds-planted-drill:dir(rtl) { --ds-planted-enter-x: ${twin}; }`,
  ].join('\n');
  assert.deepEqual(parseErrors(CLEAN_FILE, body('-8px')), []);
  assert.deepEqual(plantedBands(body('-8px')), ['physical'], 'an identical re-declaration is the same paint');
  assert.deepEqual(plantedBands(body('8px')), ['mirrored']);
});

test('a keyframe name is matched whole: `ds-x` is not consumed by `ds-x-rtl`', () => {
  const body = [
    '@keyframes ds-planted-sweep {',
    '  from { transform: translateX(-100%); }',
    '  to { transform: none; }',
    '}',
    '@keyframes ds-planted-sweep-rtl {',
    '  from { transform: translateX(100%); }',
    '  to { transform: none; }',
    '}',
    '.ds-planted-drill { animation-name: ds-planted-sweep-rtl; }',
    '.ds-planted-drill:dir(rtl) { animation-direction: reverse; }',
  ].join('\n');
  assert.deepEqual(parseErrors(CLEAN_FILE, body), []);
  const sites = fileSites(CLEAN_FILE, body).filter((site) => site.kind === 'transform');
  assert.deepEqual(sites.map((site) => [site.selector, site.band, site.consumers.length]), [
    // Nobody animates with `ds-planted-sweep`: the substring is not a consumer.
    ['@keyframes ds-planted-sweep / from', 'physical', 0],
    // `ds-planted-sweep-rtl` is judged on its own consumer, which mirrors it.
    ['@keyframes ds-planted-sweep-rtl / from', 'mirrored', 1],
  ]);
});

test('the physical CONTRACT key is the vocabulary; the STAMP key is an inline-axis value', () => {
  // The motion arm stamps an inline x, so only a value that names an inline
  // edge can carry it -- bare, by prefix, or in the dropdown's camel spelling.
  for (const selector of [
    ".ds-drawer[data-placement='left']",
    ".ds-x[data-placement^='right']",
    ".ds-dropdown-surface[data-part='surface'][data-placement$='Left']",
    '.ds-table [data-fixed="right"]',
    ".ds-x[data-align='left']",
  ]) assert.ok(PHYSICAL_CONTRACT.test(selector), selector);
  for (const selector of [
    '.ds-x[data-placement]',
    ".ds-x[data-placement='top']",
    ".ds-x[data-placement='bottom']",
    ".ds-x[data-fixed='true']",
    ".ds-x[data-align='center']",
    ".ds-x[data-side='leftover']",
    ".ds-x[data-part='left']",
  ]) assert.equal(PHYSICAL_CONTRACT.test(selector), false, selector);
  // The block-placed row keeps its own selector-shaped stamp: the vocabulary
  // key still holds it, which is what the band's honesty test reads.
  const blockPlaced = ".ds-drawer.ds-drawer--modern[data-part='surface'][data-placement='top'], "
    + ".ds-drawer.ds-drawer--modern[data-part='surface'][data-placement='bottom']";
  assert.ok(PHYSICAL_CONTRACT_KEY.test(blockPlaced));
  assert.equal(PHYSICAL_CONTRACT.test(blockPlaced), false);
  const stamps = readBaseline().physicalStamp['runtime/engines/modern/skin/drawer/index.css'].selectors;
  assert.ok(stamps.some((pin) => pin.selector === blockPlaced), 'the block-placed stamp must still be declared');
});

test('a motion arm whose consumer is keyed on a BLOCK-axis value is refused', () => {
  // Presence-only or block-axis keys decide a different edge, so they cannot
  // carry the inline-x a keyframe step writes.
  withPlantedTree(
    (sandbox) => rewrite(
      sandbox,
      'runtime/engines/modern/skin/drawer/index.css',
      (text) => text.replace(
        "[data-open='true'][data-placement='left'] {",
        "[data-open='true'][data-placement='top'] {",
      ),
    ),
    (findings) => {
      const reported = mentions(findings, '@keyframes ds-drawer-enter-left / from');
      assert.ok(reported.length >= 1, JSON.stringify(findings, null, 1));
      assert.ok(reported[0].includes('not keyed on a physical data-* contract'), reported[0]);
    },
  );
});

test('a keyframe stamp whose consumers are not placement-keyed is REFUSED', () => {
  // The stamp is only as honest as the rule that animates with it: strip the
  // placement key off the drawer's enter rule and the stamped step turns back
  // into a step that owes a mirror.
  withPlantedTree(
    (sandbox) => rewrite(
      sandbox,
      'runtime/engines/modern/skin/drawer/index.css',
      (text) => text.replace(
        ".ds-drawer.ds-drawer--modern[data-part='surface'][data-motion='animated'][data-open='true'][data-placement='left'] {",
        ".ds-drawer.ds-drawer--modern[data-part='surface'][data-motion='animated'][data-open='true'] {",
      ),
    ),
    (findings) => {
      const reported = mentions(findings, '@keyframes ds-drawer-enter-left / from');
      assert.ok(reported.length >= 1, JSON.stringify(findings, null, 1));
      assert.ok(reported[0].includes('not keyed on a physical data-* contract'), reported[0]);
    },
  );
});

test('a keyframe stamp for a keyframe nobody animates with is REFUSED', () => {
  withPlantedTree(
    (sandbox) => rewrite(
      sandbox,
      'runtime/engines/modern/skin/sheet/index.css',
      (text) => text.replace('animation: ds-sheet-enter-left ', 'animation: ds-sheet-enter-bottom '),
    ),
    (findings) => {
      const reported = mentions(findings, '@keyframes ds-sheet-enter-left / from');
      assert.ok(reported.length >= 1, JSON.stringify(findings, null, 1));
      assert.ok(reported[0].includes('no rule animates with'), reported[0]);
    },
  );
});

test('the drawer and sheet motion arms are stamped, not pinned as debt', () => {
  const baseline = readBaseline();
  const bands = classify(physicalCssSites(), baseline);
  for (const path of ['runtime/engines/modern/skin/drawer/index.css', 'runtime/engines/modern/skin/sheet/index.css']) {
    assert.equal(baseline.pinnedDebt[path], undefined, `${path} must not pin debt any more`);
    const steps = bands.stamp.filter((site) => site.path === path && keyframeOf(site.selector) !== null);
    assert.equal(steps.length, 4, `${path} must stamp its four enter/exit x steps`);
    for (const step of steps) {
      assert.ok(step.consumers.length > 0, `${step.selector} must name its consumers`);
      for (const consumer of step.consumers) {
        assert.ok(PHYSICAL_CONTRACT.test(consumer.selector), `${step.selector} is animated from an unkeyed rule`);
      }
    }
  }
});

test('keyframeConsumers reports each consumer and whether it mirrors', () => {
  const corpus = cssCorpus([['p.css', keyframeFixture(
    '.ds-a { animation: ds-planted-slide 1s; }\n.ds-a:dir(rtl) { animation-direction: reverse; }\n.ds-b { animation-name: ds-planted-slide; }',
  )]]);
  const rows = keyframeConsumers('ds-planted-slide', new Set(), corpus);
  assert.deepEqual(rows.map((row) => [row.selector, row.mirrored]), [['.ds-a', true], ['.ds-b', false]]);
  assert.deepEqual(keyframeConsumers('ds-absent', new Set(), corpus), []);
});
