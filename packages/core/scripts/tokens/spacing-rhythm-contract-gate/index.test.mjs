/**
 * Drills for the spacing-rhythm contract gate.
 *
 * Two kinds of assertion live here and they are deliberately separated.
 *
 * HERMETIC drills use `analyzeRhythmStylesheets` with injected stylesheets, so
 * they never depend on what the real tree happens to contain today. Every
 * classification constant carries at least one POSITIVE fixture -- a read that
 * must be caught -- and the allowed set carries NEGATIVE fixtures that must not
 * be caught. A drill battery that only ever asserted "clean" would pass against
 * a classifier that returned `ALLOWED_SPACING_RHYTHM` for everything.
 *
 * LIVE drills point at the real corpus, but assert INVARIANTS (every finding is
 * fully attributed; an injected extra reader is detected as growth) rather than
 * a count. A count would be a baseline, and a baseline is how a gate stops
 * seeing growth.
 */

import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, sep } from 'node:path';
import test from 'node:test';

import {
  analyzeRhythmStylesheets,
  CLASSIFICATIONS,
  classifyRhythmProperty,
  illicitRhythmMentions,
  collectAuthoredModernStylesheets,
  collectTypeScriptRhythmCarriers,
  compoundIsExactOrNarrower,
  compoundConditions,
  DASHBOARD_PANEL_SIZE_SEAM,
  DEFAULT_FAMILY_INVENTORY,
  DEFAULT_SOURCE_ROOT,
  formatReport,
  isDescendantOfSelector,
  NAMED_FORBIDDEN_CAPABILITIES,
  occurrenceCount,
  RAW_RHYTHM_CHANNEL,
  resolveDashboardInsightsFamilyId,
  RHYTHM_CHANNEL,
  runGate,
  scalesByReference,
  splitSelectorList,
  subjectHasNoIdentity,
  subjectIsComponentRoot,
  subjectIsContained,
  subjectLacksIdentity,
  UNDECIDABLE_TS_CARRIER,
} from './index.mjs';

const READ = `var(${RHYTHM_CHANNEL}, 1)`;

function fixture(css, file = '/fixture/modern.css') {
  return [{ file, css }];
}

function analyze(css) {
  return analyzeRhythmStylesheets(fixture(css));
}

/** The single classification a one-declaration fixture produces. */
function classifyDeclaration(property, value = `calc(1rem * ${READ})`) {
  const result = analyze(`.probe { ${property}: ${value}; }`);
  assert.equal(
    result.reads.length,
    1,
    `${property} produced ${result.reads.length} reads, expected exactly 1`,
  );
  return result.reads[0].classification;
}

function tempDirectory(prefix) {
  const directory = mkdtempSync(join(tmpdir(), `${prefix}-`));
  test.after(() => rmSync(directory, { recursive: true, force: true }));
  return directory;
}

function write(root, path, contents) {
  const full = join(root, path);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, contents, 'utf8');
  return full;
}

function writeInventory(rows) {
  const root = tempDirectory('spacing-rhythm-inventory');
  return write(root, 'family-inventory.json', JSON.stringify({ rows }));
}

// ---------------------------------------------------------------------------
// 1. The allowed set -- negative fixtures that must NOT be caught
// ---------------------------------------------------------------------------

test('GREEN: gap, shorthands, and logical sides are rhythm-owned spacing', () => {
  const result = analyze(`
    .layout {
      gap: calc(1rem * ${READ});
      row-gap: calc(1rem * ${READ});
      column-gap: calc(1rem * ${READ});
      padding: calc(1rem * ${READ});
      padding-block: calc(2rem * ${READ});
      padding-block-start: calc(2rem * ${READ});
      padding-inline: calc(2rem * ${READ});
      padding-inline-end: calc(2rem * ${READ});
      padding-top: calc(2rem * ${READ});
      padding-bottom: calc(2rem * ${READ});
      margin: calc(1rem * ${READ});
      margin-block: calc(2rem * ${READ});
      margin-inline-start: calc(1rem * ${READ});
      margin-bottom: calc(1rem * ${READ});
    }
  `);

  assert.equal(result.ok, true);
  assert.equal(result.reads.length, 14);
  assert.equal(result.byClassification[CLASSIFICATIONS.allowedSpacing], 14);
  assert.deepEqual(result.violations, []);
});

test('GREEN: a spacing-named custom property may carry the rhythm factor', () => {
  const result = analyze(`
    :root {
      --ds-card-layout-gap: calc(1rem * ${READ});
      --_ds-panel-room: calc(2rem * ${READ});
      --ds-section-spacing: calc(2rem * ${READ});
      --ds-stack-margin-current: calc(2rem * ${READ});
      --ds-rhythm-effective-scale: clamp(0.8, var(${RAW_RHYTHM_CHANNEL}, 1), 1.25);
    }
  `);

  assert.equal(result.ok, true);
  assert.equal(result.reads.length, 5);
  assert.equal(result.byClassification[CLASSIFICATIONS.allowedSpacing], 5);
});

// ---------------------------------------------------------------------------
// 2. One positive fixture per classification constant
// ---------------------------------------------------------------------------

test('RED: every direct forbidden capability has a positive fixture', () => {
  assert.equal(classifyDeclaration('block-size'), CLASSIFICATIONS.forbiddenSize);
  assert.equal(classifyDeclaration('height'), CLASSIFICATIONS.forbiddenSize);
  assert.equal(classifyDeclaration('min-inline-size'), CLASSIFICATIONS.forbiddenSize);
  assert.equal(classifyDeclaration('max-width'), CLASSIFICATIONS.forbiddenSize);

  assert.equal(classifyDeclaration('font-size'), CLASSIFICATIONS.forbiddenTypography);
  assert.equal(classifyDeclaration('line-height'), CLASSIFICATIONS.forbiddenTypography);
  assert.equal(classifyDeclaration('letter-spacing'), CLASSIFICATIONS.forbiddenTypography);

  assert.equal(classifyDeclaration('transition-duration'), CLASSIFICATIONS.forbiddenMotion);
  assert.equal(classifyDeclaration('animation-delay'), CLASSIFICATIONS.forbiddenMotion);
  assert.equal(
    classifyDeclaration('transform', `translateY(calc(1px * ${READ}))`),
    CLASSIFICATIONS.forbiddenMotion,
  );

  assert.equal(classifyDeclaration('padding-left'), CLASSIFICATIONS.forbiddenPhysicalInlineSide);
  assert.equal(classifyDeclaration('padding-right'), CLASSIFICATIONS.forbiddenPhysicalInlineSide);
  assert.equal(classifyDeclaration('margin-left'), CLASSIFICATIONS.forbiddenPhysicalInlineSide);
  assert.equal(classifyDeclaration('margin-right'), CLASSIFICATIONS.forbiddenPhysicalInlineSide);

  assert.equal(classifyDeclaration('--ds-touch-target-padding'), CLASSIFICATIONS.forbiddenTouchTarget);
  assert.equal(classifyDeclaration('--ds-icon-gap'), CLASSIFICATIONS.forbiddenIcon);
});

test('RED: size reached SIDEWAYS is named as size, not filed under "other"', () => {
  // These all change rendered capacity without spelling a box metric. Before
  // they were enumerated they fell to FORBIDDEN_OTHER_CAPABILITY, which still
  // blocked -- but reported the harm without naming it, and named-ness is what
  // makes the indirect leg block rather than merely record.
  assert.equal(classifyDeclaration('scale', `calc(1 * ${READ})`), CLASSIFICATIONS.forbiddenSize);
  assert.equal(classifyDeclaration('zoom', `calc(1 * ${READ})`), CLASSIFICATIONS.forbiddenSize);
  assert.equal(classifyDeclaration('aspect-ratio', `calc(1 * ${READ})`), CLASSIFICATIONS.forbiddenSize);
  assert.equal(classifyDeclaration('contain-intrinsic-size'), CLASSIFICATIONS.forbiddenSize);
  assert.equal(classifyDeclaration('contain-intrinsic-block-size'), CLASSIFICATIONS.forbiddenSize);

  // `translate`/`rotate` are the longhand siblings of `transform`, which was
  // already gated; splitting the shorthand must not split the contract.
  assert.equal(
    classifyDeclaration('translate', `0 calc(1px * ${READ})`),
    CLASSIFICATIONS.forbiddenMotion,
  );
  assert.equal(classifyDeclaration('rotate', `calc(1deg * ${READ})`), CLASSIFICATIONS.forbiddenMotion);

  // ...and each one blocks through the INDIRECT leg too, as a named capability
  // rather than the unlicensed bucket.
  const laundered = analyzeRhythmStylesheets([
    { file: '/fixture/tokens.css', css: `:root { --ds-panel-room: calc(1 * ${READ}); }` },
    { file: '/fixture/panel.css', css: '.panel { aspect-ratio: var(--ds-panel-room); }' },
  ]);
  assert.equal(laundered.ok, false);
  assert.equal(laundered.indirectViolations.length, 1);
  assert.equal(laundered.indirectViolations[0].classification, CLASSIFICATIONS.forbiddenSize);
});

test('RED: an unknown or unclassifiable property fails closed, it does not pass', () => {
  // The whole point of a fail-closed classifier: a property nobody thought
  // about must be a violation, not silence.
  assert.equal(
    classifyDeclaration('color', `color-mix(in srgb, currentColor calc(50% * ${READ}), transparent)`),
    CLASSIFICATIONS.forbiddenOther,
  );
  assert.equal(classifyDeclaration('border-radius'), CLASSIFICATIONS.forbiddenOther);
  assert.equal(classifyDeclaration('z-index', `calc(1 * ${READ})`), CLASSIFICATIONS.forbiddenOther);
  assert.equal(classifyDeclaration('inset-inline-start'), CLASSIFICATIONS.forbiddenOther);
  assert.equal(classifyDeclaration('border-spacing'), CLASSIFICATIONS.forbiddenOther);
  assert.equal(classifyDeclaration('--ds-panel-opacity'), CLASSIFICATIONS.forbiddenOther);
  assert.equal(classifyDeclaration('--ds-totally-novel-channel'), CLASSIFICATIONS.forbiddenOther);
});

test('META: every classification constant is exercised by a positive fixture', () => {
  const covered = new Set();
  const battery = [
    ['gap', CLASSIFICATIONS.allowedSpacing],
    ['block-size', CLASSIFICATIONS.forbiddenSize],
    ['--ds-touch-target-padding', CLASSIFICATIONS.forbiddenTouchTarget],
    ['--ds-icon-gap', CLASSIFICATIONS.forbiddenIcon],
    ['font-size', CLASSIFICATIONS.forbiddenTypography],
    ['--ds-motion-gap', CLASSIFICATIONS.forbiddenMotion],
    ['padding-left', CLASSIFICATIONS.forbiddenPhysicalInlineSide],
    ['border-radius', CLASSIFICATIONS.forbiddenOther],
  ];
  for (const [property, expected] of battery) {
    assert.equal(classifyDeclaration(property), expected, `${property} misclassified`);
    covered.add(expected);
  }

  // The three radius verdicts are not decidable from a property name -- they
  // are earned or lost on the indirect leg by the shape of the derivation and
  // of the SELECTOR -- so their positive fixtures run the real pipeline
  // instead of the name classifier.
  const tokens = {
    file: '/fixture/tokens.css',
    css: `:root { --ds-card-padding-current: calc(1rem * ${READ}); }`,
  };
  const producer =
    '--_ds-card-nest-radius: max(0px, calc(8px - min(var(--ds-card-padding-current), 4px)));';
  // Defect 3 (clause g): the producing rule must also paint real padding from
  // the same carrier.
  const realPadding = 'padding: var(--ds-card-padding-current);';

  const concentric = analyzeRhythmStylesheets([
    tokens,
    {
      file: '/fixture/card.css',
      css: `.card { ${realPadding} ${producer} }
            .card > .body { border-radius: var(--_ds-card-nest-radius); }`,
    },
  ]);
  assert.equal(concentric.ok, true);
  assert.equal(concentric.concentricAllowances.length, 2);
  for (const finding of concentric.concentricAllowances) {
    assert.equal(finding.classification, CLASSIFICATIONS.derivedConcentricGeometry);
    covered.add(finding.classification);
  }

  // FORBIDDEN_OUTER_RADIUS: proven-inner selector, but the subject is a whole
  // component root.
  const outer = analyzeRhythmStylesheets([
    tokens,
    {
      file: '/fixture/card.css',
      css: `.card { ${producer} }
            .card > .body [data-part='root'] { border-radius: var(--_ds-card-nest-radius); }`,
    },
  ]);
  const outerFinding = outer.indirectViolations.find(
    (finding) => finding.classification === CLASSIFICATIONS.forbiddenOuterRadius,
  );
  assert.ok(outerFinding, 'FORBIDDEN_OUTER_RADIUS has no positive fixture');
  covered.add(outerFinding.classification);

  // FORBIDDEN_GENERIC_RADIUS_CARRIER: the ruling's named shape.
  const carrier = analyzeRhythmStylesheets([
    tokens,
    {
      file: '/fixture/card.css',
      css: `.card { ${producer} }
            .surface { --_surface-radius-current: var(--_ds-card-nest-radius); border-radius: var(--_surface-radius-current); }`,
    },
  ]);
  const carrierFinding = carrier.indirectViolations.find(
    (finding) => finding.classification === CLASSIFICATIONS.forbiddenGenericRadiusCarrier,
  );
  assert.ok(carrierFinding, 'FORBIDDEN_GENERIC_RADIUS_CARRIER has no positive fixture');
  covered.add(carrierFinding.classification);

  assert.deepEqual(
    [...covered].sort(),
    Object.values(CLASSIFICATIONS).slice().sort(),
    'a classification constant exists that no fixture proves',
  );
});

// ---------------------------------------------------------------------------
// 3. Precedence: a forbidden capability outranks a coincidental spacing word
// ---------------------------------------------------------------------------

test('RED: a forbidden capability outranks a spacing word in a custom property name', () => {
  // Each name below carries `gap`/`padding`/`margin`/`room`. Without the
  // precedence rule every one of them would classify as allowed spacing, which
  // is exactly how forbidden geometry travels under a legal name.
  const cases = [
    ['--ds-touch-target-gap', CLASSIFICATIONS.forbiddenTouchTarget],
    ['--ds-hit-area-padding', CLASSIFICATIONS.forbiddenTouchTarget],
    ['--ds-icon-gap', CLASSIFICATIONS.forbiddenIcon],
    ['--ds-glyph-margin', CLASSIFICATIONS.forbiddenIcon],
    ['--ds-font-gap', CLASSIFICATIONS.forbiddenTypography],
    ['--ds-line-height-room', CLASSIFICATIONS.forbiddenTypography],
    ['--ds-motion-gap', CLASSIFICATIONS.forbiddenMotion],
    ['--ds-stagger-padding', CLASSIFICATIONS.forbiddenMotion],
    ['--ds-panel-block-size-gap', CLASSIFICATIONS.forbiddenSize],
    ['--_ds-dashboard-panel-height-room', CLASSIFICATIONS.forbiddenSize],
    ['--ds-card-padding-left', CLASSIFICATIONS.forbiddenPhysicalInlineSide],
    ['--ds-panel-margin-right', CLASSIFICATIONS.forbiddenPhysicalInlineSide],
  ];
  for (const [property, expected] of cases) {
    assert.equal(classifyDeclaration(property), expected, `${property} misclassified`);
  }

  // ...and the companion proof that these names really do carry a spacing word,
  // so the assertions above are about PRECEDENCE and not about a typo.
  for (const [property] of cases) {
    assert.match(property, /(?:gap|padding|margin|room)/u, `${property} carries no spacing word`);
  }
});

test('RED: physical inline sides are forbidden however they are spelled', () => {
  const result = analyze(`
    .bad {
      padding-left: calc(1rem * ${READ});
      padding-right: calc(1rem * ${READ});
      margin-left: calc(1rem * ${READ});
      margin-right: calc(1rem * ${READ});
      --ds-card-padding-left: calc(1rem * ${READ});
      --ds-drawer-right-room: calc(1rem * ${READ});
    }
  `);

  assert.equal(result.ok, false);
  assert.equal(result.violations.length, 6);
  assert.ok(
    result.violations.every(
      (finding) =>
        finding.classification === CLASSIFICATIONS.forbiddenPhysicalInlineSide,
    ),
    'an RTL-hostile spelling escaped as something other than a physical inline side',
  );
  // The logical siblings stay legal, so the rule is about direction and not
  // about the word "padding".
  assert.equal(classifyRhythmProperty('padding-inline-start'), CLASSIFICATIONS.allowedSpacing);
  assert.equal(classifyRhythmProperty('--ds-card-padding-inline'), CLASSIFICATIONS.allowedSpacing);
});

// ---------------------------------------------------------------------------
// 4. Counting: N reads are N findings, and a longer name is not a read
// ---------------------------------------------------------------------------

test('N reads in one declaration are N findings, numbered', () => {
  const result = analyze(`
    .shorthand {
      padding: calc(1rem * ${READ}) calc(2rem * ${READ}) calc(3rem * ${READ});
    }
  `);

  assert.equal(result.reads.length, 3);
  assert.deepEqual(result.reads.map((read) => read.occurrence), [1, 2, 3]);
  assert.ok(result.reads.every((read) => read.line === 3 && read.property === 'padding'));
});

test('a longer channel name that merely contains the rhythm channel is not a read', () => {
  assert.equal(occurrenceCount(`var(${RHYTHM_CHANNEL})`), 1);
  // trailing extension
  assert.equal(occurrenceCount(`var(${RHYTHM_CHANNEL}-x)`), 0);
  assert.equal(occurrenceCount(`var(${RHYTHM_CHANNEL}2)`), 0);
  assert.equal(occurrenceCount(`var(${RHYTHM_CHANNEL}_alt)`), 0);
  // leading extension
  assert.equal(occurrenceCount(`var(--legacy${RHYTHM_CHANNEL})`), 0);
  // the raw tenant input is its own channel, and its extensions are not reads
  assert.equal(occurrenceCount(`var(${RAW_RHYTHM_CHANNEL}, 1)`), 1);
  assert.equal(occurrenceCount(`var(${RAW_RHYTHM_CHANNEL}-legacy)`), 0);
  // both spellings in one value count twice
  assert.equal(occurrenceCount(`calc(var(${RHYTHM_CHANNEL}) * var(${RAW_RHYTHM_CHANNEL}))`), 2);

  const result = analyze(`
    .probe {
      gap: var(${RHYTHM_CHANNEL}-x, 1rem);
      padding: var(--legacy${RHYTHM_CHANNEL}, 1rem);
    }
  `);
  assert.equal(result.reads.length, 0);
});

test('the RAW tenant input is a rhythm read too -- it skips the clamp', () => {
  // The DS floor derives --ds-rhythm-effective-scale by clamping the raw input
  // to 0.8..1.25. A consumer that reads the raw channel escapes the envelope,
  // so a gate that watched only the clamped spelling could be defeated by
  // deleting six characters.
  const result = analyze(`.bad { block-size: calc(415px * var(${RAW_RHYTHM_CHANNEL}, 1)); }`);
  assert.equal(result.ok, false);
  assert.equal(result.reads.length, 1);
  assert.equal(result.violations[0].classification, CLASSIFICATIONS.forbiddenSize);
});

test('a read wrapped across lines is still a read; a read inside a comment is not', () => {
  // A wrapped `var(` defeats every reader that greps for `var(--name`. This
  // counter matches the channel name itself, so the wrap cannot hide it.
  const wrapped = analyze(`.bad {\n  block-size: var(\n    ${RHYTHM_CHANNEL},\n    1\n  );\n}`);
  assert.equal(wrapped.reads.length, 1);
  assert.equal(wrapped.violations[0].classification, CLASSIFICATIONS.forbiddenSize);

  // A commented read paints nothing, so it must not be counted as a read --
  // otherwise a corpus of prose would satisfy the "reads > 0" liveness check.
  const commented = analyze(`.fine { block-size: /* var(${RHYTHM_CHANNEL}) */ 415px; }`);
  assert.equal(commented.reads.length, 0);
});

// ---------------------------------------------------------------------------
// 5. The indirect leg -- one rename must not launder the defect
// ---------------------------------------------------------------------------

test('RED: rhythm reaching a size through a spacing-named channel is caught', () => {
  // The laundering shape. `--ds-panel-room` is a legal rhythm carrier by name,
  // so the DIRECT leg is silent; the capacity it feeds is the actual defect.
  const result = analyzeRhythmStylesheets([
    { file: '/fixture/tokens.css', css: `:root { --ds-panel-room: calc(415px * ${READ}); }` },
    { file: '/fixture/panel.css', css: '.panel { block-size: var(--ds-panel-room); }' },
  ]);

  assert.equal(result.ok, false);
  assert.deepEqual(result.violations, [], 'the direct leg should stay silent here');
  assert.equal(result.indirectViolations.length, 1);
  const [finding] = result.indirectViolations;
  assert.equal(finding.classification, CLASSIFICATIONS.forbiddenSize);
  assert.equal(finding.reach, 'indirect');
  assert.deepEqual(finding.via, ['--ds-panel-room']);
  assert.equal(finding.property, 'block-size');
  assert.equal(finding.selector, '.panel');
});

test('RED: the indirect leg follows a multi-hop chain across files', () => {
  const result = analyzeRhythmStylesheets([
    { file: '/fixture/a.css', css: `:root { --ds-a-gap: calc(1rem * ${READ}); }` },
    { file: '/fixture/b.css', css: ':root { --ds-b-room: var(--ds-a-gap); }' },
    { file: '/fixture/c.css', css: ':root { --ds-c-spacing: calc(2 * var(--ds-b-room)); }' },
    { file: '/fixture/d.css', css: '.d { min-block-size: var(--ds-c-spacing); }' },
  ]);

  assert.equal(result.ok, false);
  assert.equal(result.indirectViolations.length, 1);
  assert.equal(result.indirectViolations[0].classification, CLASSIFICATIONS.forbiddenSize);
  assert.deepEqual(result.rhythmCarriers, ['--ds-a-gap', '--ds-b-room', '--ds-c-spacing']);
});

test('GREEN: a rhythm carrier consumed by spacing is exactly what the control is for', () => {
  const result = analyzeRhythmStylesheets([
    { file: '/fixture/tokens.css', css: `:root { --ds-panel-room: calc(1rem * ${READ}); }` },
    {
      file: '/fixture/panel.css',
      css: '.panel { gap: var(--ds-panel-room); padding-block: var(--ds-panel-room); }',
    },
  ]);

  assert.equal(result.ok, true);
  assert.deepEqual(result.indirectViolations, []);
});

test('RED: a radius reading the padding carrier directly is an outer radius', () => {
  // COUNTERFACTUAL CONTROL for an AGED_EXPECTATION. This exact fixture used to
  // assert `ok: true` on the grounds that `border-radius` is not one of
  // size/capacity/touch/icon/type/motion, so a carrier reaching it was merely
  // RECORDED. The owner then ruled that rhythm may reach only an internal
  // DESCENDANT radius that stays concentric with scaled padding. Here the
  // radius reads the padding carrier DIRECTLY on a bare compound, so it is an
  // outer radius tracking rhythm and must block -- now by name.
  const result = analyzeRhythmStylesheets([
    { file: '/fixture/tokens.css', css: `:root { --ds-card-padding-current: calc(1rem * ${READ}); }` },
    {
      file: '/fixture/card.css',
      css: '.card { border-radius: calc(8px - var(--ds-card-padding-current)); }',
    },
  ]);

  assert.equal(result.ok, false, 'an unlicensed indirect reach must fail the gate');
  assert.equal(result.indirectViolations.length, 1);
  assert.equal(
    result.indirectViolations[0].classification,
    CLASSIFICATIONS.forbiddenOuterRadius,
  );
  assert.deepEqual(result.concentricAllowances, []);
});

test('the indirect leg is fail-closed: a reach nobody classified still blocks', () => {
  // The unlicensed bucket must stay LIVE. Radius now has named verdicts, so
  // this drill uses a property that belongs to no named capability at all: if
  // the bucket ever stopped blocking, a novel channel would pass in silence.
  const result = analyzeRhythmStylesheets([
    { file: '/fixture/tokens.css', css: `:root { --ds-panel-room: calc(1rem * ${READ}); }` },
    { file: '/fixture/panel.css', css: '.panel { --ds-panel-opacity: var(--ds-panel-room); }' },
  ]);

  assert.equal(result.ok, false, 'an unlicensed indirect reach must fail the gate');
  assert.deepEqual(result.indirectViolations, []);
  assert.equal(result.indirectUnclassified.length, 1);
  assert.equal(result.indirectUnclassified[0].classification, CLASSIFICATIONS.forbiddenOther);
  assert.ok(
    !NAMED_FORBIDDEN_CAPABILITIES.includes(CLASSIFICATIONS.forbiddenOther),
    'FORBIDDEN_OTHER_CAPABILITY must stay out of the named set, and still block via the unlicensed bucket',
  );
});

// ---------------------------------------------------------------------------
// The concentric-radius allowance, and every way it must refuse to be abused.
// The owner ruling: only an INTERNAL derived radius that must stay concentric
// with scaled padding may move. Direct rhythm radius, generic carrier and
// outer-radius change all fail. Each drill below mutates exactly one clause.
// ---------------------------------------------------------------------------

const PADDING_CARRIER = {
  file: '/fixture/tokens.css',
  css: `:root { --ds-card-padding-current: calc(1rem * ${READ}); }`,
};

function concentricDrill(css) {
  return analyzeRhythmStylesheets([PADDING_CARRIER, { file: '/fixture/card.css', css }]);
}

/**
 * The shape the ruling licenses: subtract scaled padding from a fixed radius.
 * Defect 3 (clause g) requires the SAME producing rule to also paint a REAL
 * `padding` property from the SAME carrier the radius derives from -- this
 * mirrors the actual production shape (`.ds-card...[data-part='body']` pairs
 * `padding: var(--ds-card-instance-padding, var(--ds-card-padding-current))`
 * with `--_ds-card-nest-radius` under one selector).
 */
const LICENSED_CHANNEL =
  'padding: var(--ds-card-padding-current); ' +
  '--_ds-card-nest-radius: max(0px, calc(8px - min(var(--ds-card-padding-current), 4px)));';

test('GREEN: an internal radius that subtracts scaled padding is licensed', () => {
  const result = concentricDrill(
    `.card { ${LICENSED_CHANNEL} } .card > .body { border-radius: var(--_ds-card-nest-radius); }`,
  );

  assert.equal(result.ok, true);
  assert.deepEqual(result.indirectUnclassified, []);
  assert.deepEqual(result.concentricChannels, ['--_ds-card-nest-radius']);
  assert.equal(result.concentricAllowances.length, 2);
});

test('RED: clause (c) -- a radius that MULTIPLIES by rhythm is an outer-radius change', () => {
  for (const operator of ['*', '/']) {
    const result = concentricDrill(
      `.card { --_ds-card-nest-radius: calc(8px ${operator} var(--ds-card-padding-current)); }`,
    );
    assert.equal(result.ok, false, `${operator} must not earn the concentric allowance`);
    assert.deepEqual(result.concentricChannels, []);
    assert.equal(result.indirectViolations.length, 1);
    assert.equal(
      result.indirectViolations[0].classification,
      CLASSIFICATIONS.forbiddenOuterRadius,
      `${operator} must be reported as an outer radius, not as an unnamed reach`,
    );
  }
});

test('RED: clause (c) -- adopting scaled padding wholesale is not a derivation', () => {
  // No subtraction and no clamp: the corner would track rhythm 1:1, which is
  // exactly the outer-radius scaling the ruling forbids.
  const result = concentricDrill('.card { --_ds-card-nest-radius: var(--ds-card-padding-current); }');

  assert.equal(result.ok, false);
  assert.deepEqual(result.concentricChannels, []);
});

test('RED: clause (a) -- a PUBLIC channel republishing the concentric value is a generic carrier', () => {
  const result = concentricDrill(
    `.card { ${LICENSED_CHANNEL} --ds-nest-radius: var(--_ds-card-nest-radius); }`,
  );

  assert.equal(result.ok, false, 'a public --ds-* radius carrier must fail');
  assert.deepEqual(result.concentricChannels, ['--_ds-card-nest-radius']);
  assert.equal(result.indirectViolations.length, 1);
  assert.equal(result.indirectViolations[0].property, '--ds-nest-radius');
  assert.equal(
    result.indirectViolations[0].classification,
    CLASSIFICATIONS.forbiddenGenericRadiusCarrier,
  );
});

test('RED: clause (b) -- a non-radius property may not drink from a concentric channel', () => {
  const result = concentricDrill(
    `.card { ${LICENSED_CHANNEL} } .card > .body { outline-offset: var(--_ds-card-nest-radius); }`,
  );

  assert.equal(result.ok, false);
  assert.equal(result.indirectUnclassified.length, 1);
  assert.equal(result.indirectUnclassified[0].property, 'outline-offset');
});

test('RED: one scaling site disqualifies the channel everywhere, not just there', () => {
  // The good declaration must not launder the bad one through a shared name.
  const result = concentricDrill(
    `.card { ${LICENSED_CHANNEL} }
     .card[data-size='lg'] { --_ds-card-nest-radius: calc(8px * var(--ds-card-padding-current)); }
     .card > .body { border-radius: var(--_ds-card-nest-radius); }`,
  );

  assert.equal(result.ok, false);
  assert.deepEqual(result.concentricChannels, [], 'the channel loses the allowance everywhere');
  assert.equal(result.indirectViolations.length, 3);
  assert.ok(
    result.indirectViolations.every(
      (finding) => finding.classification === CLASSIFICATIONS.forbiddenOuterRadius,
    ),
    'once the channel is disqualified, every site that drinks from it is an outer radius',
  );
});

test('the concentric allowance is discovered from the corpus, never enumerated', () => {
  // A name the gate has never seen earns the allowance purely by its shape,
  // which is what keeps the rule from becoming a hidden allowlist.
  const result = concentricDrill(
    `.widget { padding: var(--ds-card-padding-current); --_rottay-invented-corner: max(0px, calc(12px - var(--ds-card-padding-current))); }
     .widget > .inner { border-radius: var(--_rottay-invented-corner); }`,
  );

  assert.equal(result.ok, true);
  assert.deepEqual(result.concentricChannels, ['--_rottay-invented-corner']);
  const gateSource = readFileSync(
    new URL('./index.mjs', import.meta.url),
    'utf8',
  );
  assert.equal(
    gateSource.includes('--_ds-card-nest-radius'),
    false,
    'the gate must not name a concentric channel of the production corpus',
  );
});

// ---------------------------------------------------------------------------
// Inner versus outer. Clauses (d), (e) and (f) exist because the first three
// licensed the ruling's own named counterexample: a private, radius-semantic,
// non-scaling channel republished onto `.ds-semantic-surface`'s OWN corner.
// Every drill below is a MUTATION PAIR -- the same derivation painted on inner
// geometry must pass and on outer geometry must fail -- so a future
// simplification cannot collapse the two without turning a test red.
// ---------------------------------------------------------------------------

test('clause (d) -- containment must be PROVEN by the selector, not inherited', () => {
  // Identical value and identical channel. The only difference is whether the
  // selector demonstrates the subject sits inside anything.
  const inner = concentricDrill(
    `.card { ${LICENSED_CHANNEL} } .card > .body { border-radius: var(--_ds-card-nest-radius); }`,
  );
  assert.equal(inner.ok, true, 'a proven-inner corner is the licensed case');

  const bare = concentricDrill(
    `.card { ${LICENSED_CHANNEL} } .body { border-radius: var(--_ds-card-nest-radius); }`,
  );
  assert.equal(bare.ok, false, 'a bare compound proves nothing about being inside a card');
  assert.equal(bare.indirectViolations.length, 1);
  assert.equal(
    bare.indirectViolations[0].classification,
    CLASSIFICATIONS.forbiddenOuterRadius,
  );
  assert.deepEqual(bare.concentricAllowances.map((f) => f.property), ['--_ds-card-nest-radius']);
});

test('clause (d) -- a sibling is beside the padded parent, not inside it', () => {
  const sibling = concentricDrill(
    `.card { ${LICENSED_CHANNEL} } .card + .body { border-radius: var(--_ds-card-nest-radius); }`,
  );
  assert.equal(sibling.ok, false, '+ must not count as containment');
  assert.equal(
    sibling.indirectViolations[0].classification,
    CLASSIFICATIONS.forbiddenOuterRadius,
  );

  // ...but a sibling OF A CHILD is still inside the grandparent, so the
  // containment test must not degrade into "the last combinator is > or space".
  const siblingOfChild = concentricDrill(
    `.card { ${LICENSED_CHANNEL} } .card > .a + .body { border-radius: var(--_ds-card-nest-radius); }`,
  );
  assert.equal(siblingOfChild.ok, true, 'a sibling of a child is still inside the parent');
});

test('clause (d) -- containment is decided structurally, not by whitespace in a bracket', () => {
  // `[data-part='a b']` and `:not(.x .y)` both contain a space. A textual
  // "does the selector contain a space" test would call this bare compound
  // contained, which is exactly how an outer radius would slip through.
  assert.equal(subjectIsContained(".body[data-label='a b']"), false);
  assert.equal(subjectIsContained('.body:not(.x .y)'), false);
  assert.equal(subjectIsContained('.card .body'), true);
  assert.equal(subjectIsContained('.card>.body'), true);
  assert.equal(subjectIsContained('.card'), false);
  assert.equal(subjectIsContained(''), false);
});

test('clause (e) -- a whole component ROOT is outer geometry even when nested', () => {
  // This is the sentence "even when that component can be nested", mechanized.
  // The corner is proven-inner by the selector, derives correctly, and is still
  // forbidden, because what it paints is a nested component's own outer edge.
  const nestedRoot = concentricDrill(
    `.card { ${LICENSED_CHANNEL} }
     .card > .body [data-part='root'] { border-radius: var(--_ds-card-nest-radius); }`,
  );
  assert.equal(nestedRoot.ok, false, "a nested component's own root radius is outer");
  assert.equal(
    nestedRoot.indirectViolations[0].classification,
    CLASSIFICATIONS.forbiddenOuterRadius,
  );

  // The mutation: the SAME rule aimed at an inner part of that body passes.
  const innerPart = concentricDrill(
    `.card { ${LICENSED_CHANNEL} }
     .card > .body [data-part='header'] { border-radius: var(--_ds-card-nest-radius); }`,
  );
  assert.equal(innerPart.ok, true, 'an inner part of the padded body is the licensed case');
});

test('clause (e) -- a component nested in ITSELF is still its own radius', () => {
  const selfNested = concentricDrill(
    `.card { ${LICENSED_CHANNEL} } .surface .surface { border-radius: var(--_ds-card-nest-radius); }`,
  );
  assert.equal(selfNested.ok, false, '.x .x paints a nested instance of the same component');
  assert.equal(
    selfNested.indirectViolations[0].classification,
    CLASSIFICATIONS.forbiddenOuterRadius,
  );

  assert.equal(subjectIsComponentRoot('.ds-semantic-surface .ds-semantic-surface'), true);
  assert.equal(subjectIsComponentRoot(".card > [data-part='root']"), true);
  assert.equal(subjectIsComponentRoot(".card > [data-part='body'] > [data-part='header']"), false);
  // CORRECTED (defect 4, post-Fable audit): a class named INSIDE the subject's
  // own `:not()` argument is still a condition the compound's TEXT carries.
  // Reading this as "not a positive match" was the exact reasoning that let
  // `.ds-semantic-surface :is(.ds-semantic-surface)` escape detection --
  // stripping a logical pseudo's argument to decide it "doesn't count" is the
  // sanitizer bug, not a defense. The fail-closed model treats "mentions" as
  // the bar, not "requires": see the defect-4 drills below for the four
  // reproduced bypasses this closes.
  assert.equal(
    subjectIsComponentRoot(".ds-card > [data-part='body'] > [data-part='x']:not(.ds-card)"),
    true,
  );
  // The companion proof that this is not "everything now matches": an
  // UNRELATED class inside `:not()` must not manufacture a false positive.
  assert.equal(
    subjectIsComponentRoot(
      ".ds-card > [data-part='body'] > [data-part='x']:not(.totally-unrelated)",
    ),
    false,
  );
});

test('clause (f) -- a channel that wears the corner it declares is a generic carrier', () => {
  // THE RULING'S NAMED COUNTEREXAMPLE, reproduced structurally. The channel is
  // private, radius-semantic and non-scaling -- it satisfies (a), (b) and (c)
  // -- so before this clause it was licensed. Declaring a corner and painting
  // it on the SAME selector is republication, not publication.
  const selfPaint = concentricDrill(
    `.card { ${LICENSED_CHANNEL} }
     .surface { --_surface-radius-current: var(--_ds-card-nest-radius); border-radius: var(--_surface-radius-current); }`,
  );

  assert.equal(selfPaint.ok, false, "a carrier painted on its own selector must fail");
  assert.deepEqual(
    selfPaint.concentricChannels,
    ['--_ds-card-nest-radius'],
    'the honest producer keeps its allowance; only the republisher loses it',
  );
  const carrier = selfPaint.indirectViolations.find(
    (finding) => finding.property === '--_surface-radius-current',
  );
  assert.ok(carrier, 'the republishing channel was not reported');
  assert.equal(carrier.classification, CLASSIFICATIONS.forbiddenGenericRadiusCarrier);

  // The mutation: publish for DESCENDANTS instead of for self, and the same
  // derivation is licensed.
  const publishesDown = concentricDrill(
    `.card { ${LICENSED_CHANNEL} }
     .surface { --_surface-radius-current: var(--_ds-card-nest-radius); }
     .surface > .inner { border-radius: var(--_surface-radius-current); }`,
  );
  assert.equal(publishesDown.ok, true, 'publishing a corner for children is the licensed case');
  assert.deepEqual(publishesDown.concentricChannels, [
    '--_ds-card-nest-radius',
    '--_surface-radius-current',
  ]);
});

test('a selector LIST is judged fail-closed: one bare arm poisons the declaration', () => {
  // `.card > .body, .stray { ... }` paints the stray element wherever the
  // private reaches. Judging the list by its best arm would license that.
  const result = concentricDrill(
    `.card { ${LICENSED_CHANNEL} }
     .card > .body, .stray { border-radius: var(--_ds-card-nest-radius); }`,
  );
  assert.equal(result.ok, false);
  assert.equal(
    result.indirectViolations[0].classification,
    CLASSIFICATIONS.forbiddenOuterRadius,
  );
  assert.equal(subjectIsContained('.card > .body, .stray'), false);
  assert.equal(subjectIsContained('.card > .body, .other > .thing'), true);
  // A comma inside brackets or a functional pseudo is not a list separator.
  assert.deepEqual(splitSelectorList(':is(.a, .b) .c'), [':is(.a, .b) .c']);
  assert.deepEqual(splitSelectorList(".a[x='p,q'], .b .c"), [".a[x='p,q']", '.b .c']);
});

test('a direct read is judged once -- the indirect leg does not double-report it', () => {
  // The declaration below is BOTH a direct read and a consumer of a rhythm
  // carrier, which is the only shape that can be counted twice.
  const result = analyzeRhythmStylesheets([
    { file: '/fixture/tokens.css', css: `:root { --ds-panel-room: calc(1rem * ${READ}); }` },
    {
      file: '/fixture/panel.css',
      css: `.bad { block-size: calc(415px * ${READ} + var(--ds-panel-room)); }`,
    },
  ]);

  assert.equal(result.violations.length, 1);
  assert.equal(result.violations[0].reach, 'direct');
  assert.deepEqual(result.indirectViolations, []);
  assert.deepEqual(result.indirectUnclassified, []);
});

// ---------------------------------------------------------------------------
// 6. Family attribution comes from the canonical inventory, never a file list
// ---------------------------------------------------------------------------

test('a DashboardInsights panel-size read resolves to one canonical family without a file allowlist', () => {
  const familyId = resolveDashboardInsightsFamilyId();
  const result = analyzeRhythmStylesheets(
    fixture(`
      .dashboard-panel {
        block-size: var(${DASHBOARD_PANEL_SIZE_SEAM}, calc(415px * ${READ}));
      }
    `),
    { dashboardInsightsFamilyId: familyId },
  );

  assert.equal(result.ok, false);
  assert.equal(result.violations.length, 1);
  assert.equal(result.violations[0].familyId, familyId);
  assert.equal(result.violations[0].classification, CLASSIFICATIONS.forbiddenSize);
  assert.deepEqual(Object.keys(result.violationsByFamily), [familyId]);
});

test('RED: an inventory that does not resolve exactly one DashboardInsights row fails closed', () => {
  const none = writeInventory([{ id: 'primitive/layout/flex', family: 'Flex' }]);
  assert.throws(() => resolveDashboardInsightsFamilyId(none), /exactly one DashboardInsights row/u);

  const duplicated = writeInventory([
    { id: 'structure/dashboard/dashboard-insights', family: 'DashboardInsights' },
    { id: 'structure/dashboard/insights', family: 'DashboardInsights' },
  ]);
  assert.throws(() => resolveDashboardInsightsFamilyId(duplicated), /exactly one DashboardInsights row/u);

  const idless = writeInventory([{ family: 'DashboardInsights' }]);
  assert.throws(() => resolveDashboardInsightsFamilyId(idless), /exactly one DashboardInsights row/u);

  const rowless = writeInventory(undefined);
  assert.throws(() => resolveDashboardInsightsFamilyId(rowless), /exactly one DashboardInsights row/u);

  // ...and the positive control: the real inventory DOES resolve.
  assert.match(resolveDashboardInsightsFamilyId(), /^[a-z0-9/-]+$/u);
});

test('the gate carries no hard-coded family id of its own', () => {
  // With no id supplied the finding is honestly unattributed rather than
  // labelled from a literal that a rename would leave stale.
  const result = analyzeRhythmStylesheets(
    fixture(`.p { block-size: var(${DASHBOARD_PANEL_SIZE_SEAM}, calc(415px * ${READ})); }`),
  );
  assert.equal(result.violations[0].familyId, null);
  assert.deepEqual(Object.keys(result.violationsByFamily), ['UNRESOLVED_FAMILY']);
});

// ---------------------------------------------------------------------------
// 7. Fail-closed on a degraded corpus
// ---------------------------------------------------------------------------

test('RED: zero rhythm reads and malformed authored CSS fail closed', () => {
  const empty = analyzeRhythmStylesheets(fixture('.layout { gap: 1rem; }'));
  assert.equal(empty.ok, false);
  assert.equal(empty.reads.length, 0);
  assert.match(formatReport(empty), /zero .* reads in the Modern authored corpus/u);

  const noStylesheets = analyzeRhythmStylesheets([]);
  assert.equal(noStylesheets.ok, false);

  const malformed = analyzeRhythmStylesheets(fixture(`.layout { gap: var(${RHYTHM_CHANNEL});`));
  assert.equal(malformed.ok, false);
  assert.equal(malformed.parseErrors.length, 1);
  assert.match(formatReport(malformed), /stylesheet parse error/u);

  // A parse error is fatal even when every read the parser DID reach is legal:
  // the unparsed remainder is exactly where an escape would hide.
  const partly = analyzeRhythmStylesheets([
    { file: '/fixture/good.css', css: `.a { gap: calc(1rem * ${READ}); }` },
    { file: '/fixture/broken.css', css: '.b { gap: ;;; @@@' },
  ]);
  assert.equal(partly.ok, false);
  assert.equal(partly.parseErrors.length, 1);
});

test('RED: a missing, non-directory, or empty corpus root fails closed', () => {
  const root = tempDirectory('spacing-rhythm-root');

  assert.throws(
    () => collectAuthoredModernStylesheets(join(root, 'does-not-exist')),
    /corpus is missing/u,
  );

  const file = write(root, 'not-a-directory.css', '.a {}');
  assert.throws(() => collectAuthoredModernStylesheets(file), /is not a directory/u);

  const emptyRoot = tempDirectory('spacing-rhythm-empty');
  mkdirSync(join(emptyRoot, 'nested'), { recursive: true });
  assert.throws(
    () => collectAuthoredModernStylesheets(emptyRoot),
    /contains zero stylesheets/u,
  );

  // A root holding only EXCLUDED stylesheets is still an empty corpus.
  const excludedOnly = tempDirectory('spacing-rhythm-excluded-only');
  write(excludedOnly, 'runtime/engines/rustic/rustic.css', '.a { gap: 1rem; }');
  assert.throws(
    () => collectAuthoredModernStylesheets(excludedOnly),
    /contains zero stylesheets/u,
  );
});

test('RED: an excluded path that hides a rhythm read fails closed', () => {
  // The exclusion set is a claim ("nothing productive lives here"), so the walk
  // re-reads what it skipped instead of trusting the folder name.
  const root = tempDirectory('spacing-rhythm-hidden');
  write(root, 'presentation/modern.css', `.ok { gap: calc(1rem * ${READ}); }`);
  write(root, 'presentation/tests/hidden.css', `.bad { block-size: calc(1px * ${READ}); }`);

  assert.throws(
    () => collectAuthoredModernStylesheets(root),
    /exclusion set is no longer honest/u,
  );
});

// ---------------------------------------------------------------------------
// 8. Corpus discovery
// ---------------------------------------------------------------------------

test('Classic, Rustic, generated, dist, artifact, test and fixture CSS are outside the corpus', () => {
  const root = tempDirectory('spacing-rhythm-corpus');
  const inside = [
    'presentation/components/skin/layout-primitives.css',
    'runtime/engines/modern/skin/card.css',
    'foundation/themes/default.css',
    // Was `ui/patterns/commercial/presentation/proof/MonoStat.css` -- a synthetic
    // path asserting that CSS co-located with a component is in scope. No `.css`
    // file lives under `src/ui/` at all any more (the skin tree owns every
    // authored stylesheet), and the layer it named is not one, so the row now
    // uses the real home MonoStat's stylesheet was relocated to.
    'presentation/components/skin/mono-stat.css',
    // Segment-anchored, so a folder that merely STARTS with an excluded word
    // stays in scope. `distribution` is not `dist`.
    'presentation/distribution/rollup.css',
    'presentation/generated-by-hand/authored.css',
  ];
  const outside = [
    'runtime/engines/classic/theme.css',
    'runtime/engines/rustic/skin/card.css',
    'facade/artifacts/bithire/index.css',
    'facade/artifacts/bithire/_source/extension.css',
    'presentation/generated/output.css',
    'dist/output.css',
    'presentation/tests/fixture.css',
    'tooling/testing/fixtures/tenants/rottay.css',
    'presentation/__snapshots__/snap.css',
    'coverage/lcov.css',
  ];
  for (const path of inside) write(root, path, `.ok { gap: calc(1rem * ${READ}); }`);
  for (const path of outside) write(root, path, '.other { gap: 1rem; }');

  const stylesheets = collectAuthoredModernStylesheets(root);
  assert.equal(stylesheets.length, inside.length);
  for (const path of inside) {
    assert.ok(
      stylesheets.some(({ file }) => file.endsWith(path)),
      `authored stylesheet was excluded by accident: ${path}`,
    );
  }
  for (const path of outside) {
    assert.ok(
      !stylesheets.some(({ file }) => file.endsWith(path)),
      `out-of-scope stylesheet entered the corpus: ${path}`,
    );
  }
  assert.equal(analyzeRhythmStylesheets(stylesheets).ok, true);
});

test('the default source root is the authored tree, and it holds no build output', () => {
  const stylesheets = collectAuthoredModernStylesheets(DEFAULT_SOURCE_ROOT);
  assert.ok(stylesheets.length > 0);
  assert.ok(stylesheets.every(({ file }) => file.includes('/packages/core/src/')));
  assert.ok(
    stylesheets.every(
      ({ file }) =>
        !/\/(?:classic|rustic|generated|dist|coverage|__snapshots__|tests|fixtures)\//u.test(file) &&
        !file.includes('/facade/artifacts/'),
    ),
  );
  assert.ok(
    stylesheets.some(({ file }) => file.includes('/src/foundation/tokens/css/')),
    'the token CSS tree fell out of the corpus',
  );
  // This used to also require a stylesheet OUTSIDE the token tree, as evidence
  // that the root is wide enough to see CSS co-located with a component. The
  // taxonomy clean cut moved the last such tree (`ui/patterns/commercial/**`)
  // into `presentation/components/skin/`, so `src/` now holds zero authored
  // component-local CSS and the old assertion could only be satisfied by
  // reintroducing the shape it was guarding. The claim behind it -- the walk
  // starts at `src/`, not at the token subtree -- is asserted directly; the
  // synthetic-corpus test above still proves a component-local path would be
  // collected if one ever returned.
  assert.ok(
    DEFAULT_SOURCE_ROOT.endsWith(`${sep}packages${sep}core${sep}src`),
    `the corpus root was narrowed below packages/core/src: ${DEFAULT_SOURCE_ROOT}`,
  );
});

// ---------------------------------------------------------------------------
// 8b. The TypeScript honesty check -- the CSS-only scope is measured
// ---------------------------------------------------------------------------

test('a channel NAME in TypeScript is not a channel READ', () => {
  // A token vocabulary listing the channel and a compiler WRITING it both
  // mention it while painting nothing. Counting either as a carrier would make
  // the honesty check fire on every contract and compiler in the tree, and a
  // check that always fires is a check nobody can act on.
  const root = tempDirectory('spacing-rhythm-ts-names');
  write(root, 'contracts/index.ts', `export const TOKENS = ['${RHYTHM_CHANNEL}', '${RAW_RHYTHM_CHANNEL}'];`);
  write(root, 'compiler/index.ts', `vars['${RAW_RHYTHM_CHANNEL}'] = String(factor);`);

  assert.deepEqual(collectTypeScriptRhythmCarriers(root), []);
});

test('an evidence prefix that never closes var() is not a TypeScript carrier', () => {
  const root = tempDirectory('spacing-rhythm-ts-incomplete-prefix');
  write(
    root,
    'contracts/index.ts',
    `export const evidence = { symbol: 'var(${RHYTHM_CHANNEL}' };`,
  );

  assert.deepEqual(collectTypeScriptRhythmCarriers(root), []);
});

test('GREEN: a resolver carrier traced to a gap sink is decidable spacing', () => {
  const root = tempDirectory('spacing-rhythm-ts-resolver-gap');
  write(
    root,
    'layout/index.ts',
    `const SCALE = "var(${RHYTHM_CHANNEL}, 1)";
function resolveGap(value) { return \`calc(\${value} * \${SCALE})\`; }
export function collect() {
  const entries = [];
  entries.push({ cssProperty: "gap", value: {}, resolve: resolveGap });
  return entries;
}`,
  );

  const carriers = collectTypeScriptRhythmCarriers(root);
  assert.equal(carriers.length, 1);
  assert.equal(carriers[0].property, 'gap');
  assert.equal(carriers[0].classification, CLASSIFICATIONS.allowedSpacing);
});

test('RED: a resolver carrier traced to a block-size sink remains fail-closed', () => {
  const root = tempDirectory('spacing-rhythm-ts-resolver-size');
  write(
    root,
    'layout/index.ts',
    `const SCALE = "var(${RHYTHM_CHANNEL}, 1)";
function resolveSize(value) { return \`calc(\${value} * \${SCALE})\`; }
export function collect() {
  const entries = [];
  entries.push({ cssProperty: "block-size", value: {}, resolve: resolveSize });
  return entries;
}`,
  );

  const carriers = collectTypeScriptRhythmCarriers(root);
  assert.equal(carriers.length, 1);
  assert.equal(carriers[0].property, 'block-size');
  assert.equal(carriers[0].classification, CLASSIFICATIONS.forbiddenSize);
});

test('RED: a TS inline style reaching a DECIDABLE non-spacing property fails', () => {
  const root = tempDirectory('spacing-rhythm-ts-decidable');
  write(
    root,
    'panel/index.tsx',
    `export const Panel = () => <div style={{ blockSize: \`calc(415px * var(${RHYTHM_CHANNEL}, 1))\` }} />;`,
  );

  const carriers = collectTypeScriptRhythmCarriers(root);
  assert.equal(carriers.length, 1);
  // camelCase in JSX is normalized to the CSS spelling before classification,
  // so `blockSize` is judged by the same rule as `block-size`.
  assert.equal(carriers[0].property, 'block-size');
  assert.equal(carriers[0].classification, CLASSIFICATIONS.forbiddenSize);
});

test('GREEN: a TS inline style reaching a spacing property is exactly the licensed case', () => {
  const root = tempDirectory('spacing-rhythm-ts-spacing');
  write(
    root,
    'layout/index.tsx',
    `export const L = () => <div style={{ gap: \`calc(1rem * var(${RHYTHM_CHANNEL}, 1))\` }} />;`,
  );

  const carriers = collectTypeScriptRhythmCarriers(root);
  assert.equal(carriers.length, 1);
  assert.equal(carriers[0].classification, CLASSIFICATIONS.allowedSpacing);
});

test('an UNDECIDABLE TS carrier is classified honestly, neither adjudicated nor silently dropped', () => {
  // The real shape: a resolver builds the value and some caller decides the
  // property, so no static rule here can name a target. This unit checks only
  // the CLASSIFIER (`collectTypeScriptRhythmCarriers`), which still reports it
  // as its own UNDECIDABLE_TS_CARRIER classification rather than folding it
  // into an adjudicated capability (dropping it would let this gate claim a
  // CSS-only completeness it never measured). Whether an undecidable finding
  // BLOCKS the overall run is `runGate`'s concern (defect 1: it does) and is
  // covered separately, in section 11.
  const root = tempDirectory('spacing-rhythm-ts-undecidable');
  write(
    root,
    'resolver/index.ts',
    `const SCALE = "var(${RHYTHM_CHANNEL}, 1)";\nexport const resolve = (v) => \`calc(\${v} * \${SCALE})\`;`,
  );

  const carriers = collectTypeScriptRhythmCarriers(root);
  assert.equal(carriers.length, 1);
  assert.equal(carriers[0].property, null);
  assert.equal(carriers[0].classification, UNDECIDABLE_TS_CARRIER);
  assert.ok(
    !NAMED_FORBIDDEN_CAPABILITIES.includes(UNDECIDABLE_TS_CARRIER),
    'an undecidable carrier must not masquerade as an adjudicated capability',
  );
});

test('the live corpus discloses its TS carriers and none reaches a decidable non-spacing target', () => {
  const result = runGate();
  assert.ok(Array.isArray(result.typeScriptCarriers));
  assert.deepEqual(
    result.typeScriptViolations,
    [],
    'a TypeScript inline style is reaching a forbidden property the CSS walk cannot see',
  );
  // The disclosure is COMPUTED, never recorded: every undecidable entry must
  // still be a real, resolvable read in a real file.
  for (const finding of result.typeScriptUndecidable) {
    assert.match(finding.file, /\.tsx?$/u);
    assert.ok(Number.isInteger(finding.line) && finding.line > 0);
    assert.equal(finding.classification, UNDECIDABLE_TS_CARRIER);
  }
  assert.match(formatReport(result), /the CSS-only scope is MEASURED, not claimed/u);
});

// ---------------------------------------------------------------------------
// 9. The live corpus -- invariants, never a baseline
// ---------------------------------------------------------------------------

test('the live corpus resolves, and every finding names family, file, line, property, classification and selector', () => {
  const result = runGate();
  assert.ok(result.reads.length > 0, 'the live corpus reads the rhythm channel nowhere');

  for (const finding of [...result.violations, ...result.indirectViolations]) {
    assert.ok(finding.file.endsWith('.css'), 'a finding has no source file');
    assert.ok(Number.isInteger(finding.line) && finding.line > 0, 'a finding has no line');
    assert.ok(finding.property.length > 0, 'a finding has no property');
    assert.ok(
      Object.values(CLASSIFICATIONS).includes(finding.classification),
      'a finding carries an unknown classification',
    );
    assert.ok(typeof finding.selector === 'string' && finding.selector.length > 0);
    assert.ok(
      finding.familyId === null || typeof finding.familyId === 'string',
      'a finding has no family attribution field',
    );
  }

  const report = formatReport(result);
  assert.match(report, /^spacing-rhythm-contract (?:OK|FAIL)/u);
});

test('RED: an injected additional DashboardInsights size read is detected as growth', () => {
  // The anti-baseline drill. Whatever the corpus contains today, one more
  // off-contract reader must move the count by exactly one and turn the
  // verdict red -- a gate that enumerated its universe could not do this.
  const familyId = resolveDashboardInsightsFamilyId();
  const before = runGate().violations.filter((finding) => finding.familyId === familyId).length;
  const grown = runGate({
    extraStylesheets: fixture(
      `.injected-reader { block-size: var(${DASHBOARD_PANEL_SIZE_SEAM}, calc(1px * ${READ})); }`,
      '/fixture/injected-dashboard-reader.css',
    ),
  });
  const after = grown.violations.filter((finding) => finding.familyId === familyId).length;

  assert.equal(grown.ok, false);
  assert.equal(after, before + 1);
  assert.match(formatReport(grown), new RegExp(`family ${familyId}`, 'u'));
});

test('RED: an injected laundered reader is detected against the live corpus too', () => {
  // Same anti-baseline proof for the indirect leg, using a channel the live
  // corpus really declares as a rhythm carrier.
  const baseline = runGate();
  assert.ok(baseline.rhythmCarriers.length > 0, 'the live corpus declares no rhythm carrier');
  const carrier = baseline.rhythmCarriers[0];

  const grown = runGate({
    extraStylesheets: fixture(
      `.injected-launderer { block-size: var(${carrier}); }`,
      '/fixture/injected-laundered-reader.css',
    ),
  });

  assert.equal(grown.ok, false);
  assert.equal(grown.indirectViolations.length, baseline.indirectViolations.length + 1);
  assert.equal(
    grown.indirectViolations.at(-1).classification,
    CLASSIFICATIONS.forbiddenSize,
  );
});

// ---------------------------------------------------------------------------
// 10. The report
// ---------------------------------------------------------------------------

test('the report names every attribute of a violation on one line', () => {
  const result = analyzeRhythmStylesheets(
    fixture(`.panel[data-part='root'] { block-size: calc(415px * ${READ}); }`),
    { dashboardInsightsFamilyId: 'structure/dashboard/dashboard-insights' },
  );
  const report = formatReport(result);
  const lines = report.split('\n');

  assert.match(report, /spacing-rhythm-contract FAIL — 1\/1 read\(s\) escape spacing semantics/u);
  assert.ok(
    lines.some((line) => /^  family UNRESOLVED_FAMILY: 1$/u.test(line)),
    'the per-family rollup line is missing',
  );

  // All six attributes on ONE line: family, file, line, property,
  // classification, selector. A reader must not have to join two lines to
  // learn which family a finding belongs to.
  const detail = lines.find((line) => line.includes('block-size'));
  assert.ok(detail, 'the violation detail line is missing');
  assert.match(
    detail,
    new RegExp(
      `^  UNRESOLVED_FAMILY \\S*fixture/modern\\.css:1 block-size ${CLASSIFICATIONS.forbiddenSize} \\.panel\\[data-part='root'\\]$`,
      'u',
    ),
    `detail line does not carry all six attributes: ${detail}`,
  );

  const clean = analyzeRhythmStylesheets(fixture(`.a { gap: calc(1rem * ${READ}); }`));
  assert.match(formatReport(clean), /^spacing-rhythm-contract OK — 1 authored read\(s\)/u);
});

// ---------------------------------------------------------------------------
// 11. Defect 1 -- an undecidable read now BLOCKS; it is not a green disclosure
// ---------------------------------------------------------------------------

test('RED: an undecidable TS carrier now BLOCKS the run, it does not merely disclose', () => {
  // Same resolver shape as the "disclosed" fixture above (a value is built in
  // a helper, no caller-visible property key), but run through `runGate` so
  // the OVERALL VERDICT is observed. Before this fix, `ok` stayed true as
  // long as no DECIDABLE violation existed -- an indecidable read is not
  // evidence of innocence, so it must flip the verdict.
  const root = tempDirectory('spacing-rhythm-undecidable-blocks');
  write(root, 'tokens/modern.css', `.a { gap: calc(1rem * ${READ}); }`);
  write(
    root,
    'resolver/index.ts',
    `const SCALE = "var(${RHYTHM_CHANNEL}, 1)";\nexport const resolve = (v) => \`calc(\${v} * \${SCALE})\`;`,
  );

  const result = runGate({ sourceRoot: root, familyInventoryPath: DEFAULT_FAMILY_INVENTORY });

  assert.equal(result.ok, false, 'an undecidable TS carrier must block the gate');
  assert.deepEqual(result.violations, [], 'the CSS leg alone is clean');
  assert.deepEqual(result.typeScriptViolations, [], 'the read is not a DECIDABLE violation');
  assert.equal(result.typeScriptUndecidable.length, 1);
  assert.match(
    formatReport(result),
    /undecidable target; a channel this gate cannot classify is not evidence of innocence/u,
  );
});

test('GREEN: a comment illustrating the channel is not a read at all -- resolved structurally, not disclosed', () => {
  // The companion proof that stripping comments before the TS/TSX scan is a
  // STRUCTURAL RESOLUTION (defect 1's "or be resolved structurally" clause),
  // not a loophole: prose that merely shows an example must not manufacture
  // an undecidable finding -- or any finding -- out of documentation.
  const root = tempDirectory('spacing-rhythm-comment-not-a-read');
  write(root, 'tokens/modern.css', `.a { gap: calc(1rem * ${READ}); }`);
  write(
    root,
    'docs/index.ts',
    `/**\n * Example: \`calc(1rem * var(${RHYTHM_CHANNEL}, 1))\`\n */\nexport const NOTE = 1;\n// also var(${RHYTHM_CHANNEL}) in a line comment\n`,
  );

  assert.deepEqual(collectTypeScriptRhythmCarriers(root), []);
  const result = runGate({ sourceRoot: root, familyInventoryPath: DEFAULT_FAMILY_INVENTORY });
  assert.equal(result.ok, true);
});

// ---------------------------------------------------------------------------
// 12. Defect 2 -- the value parser is balanced-paren aware and resolves
// carrier chains; neither extra parens nor a multiplied intermediate carrier
// may license a radius at a 2:1 ratio.
// ---------------------------------------------------------------------------

test('scalesByReference sees a multiplication through redundant wrapping parentheses', () => {
  const name = ['--ds-card-padding-current'];
  assert.equal(scalesByReference('calc(8px * ((var(--ds-card-padding-current))))', name), true);
  assert.equal(scalesByReference('calc(((var(--ds-card-padding-current))) * 2)', name), true);
  assert.equal(scalesByReference('calc(2 * ((var(--ds-card-padding-current))))', name), true);
  assert.equal(scalesByReference('calc((var(--ds-card-padding-current)) * 2)', name), true);
  assert.equal(scalesByReference('calc(2 * (var(--ds-card-padding-current)))', name), true);
  assert.equal(scalesByReference('calc(((var(--ds-card-padding-current))) / 2)', name), true);
  // Pure redundant wrapping with NO operator must still read as not scaling.
  assert.equal(scalesByReference('calc(((var(--ds-card-padding-current))))', name), false);
  // A wrap around an unrelated SIBLING operand must not falsely implicate the
  // reference itself.
  assert.equal(scalesByReference('calc(var(--ds-card-padding-current) - (2px))', name), false);
});

test('RED: clause (c) -- a multiplication hidden behind extra parentheses must not license a radius', () => {
  // COUNTERFACTUAL against the pre-fix parser: `scalesByReference` looked only
  // at the character immediately adjacent to `var(...)`. Wrapping the
  // reference in redundant parens put a `)` there instead of `*`, so the
  // multiplication was invisible to the FIRST (scaling) check; the value still
  // contains a ` - ` for `derivesConcentrically` to find, so the pre-fix gate
  // would have licensed a radius that actually tracks the padding at 2x the
  // true rhythm rate.
  const result = concentricDrill(
    `.card {
       padding: var(--ds-card-padding-current);
       --_ds-card-nest-radius: max(0px, calc(8px - ((var(--ds-card-padding-current))) * 2));
     }`,
  );

  assert.equal(result.ok, false, 'a multiplication hidden behind parens must still block');
  assert.deepEqual(result.concentricChannels, []);
  assert.equal(result.indirectViolations.length, 1);
  assert.equal(
    result.indirectViolations[0].classification,
    CLASSIFICATIONS.forbiddenOuterRadius,
  );
});

test('RED: clause (c) -- an intermediate carrier that is itself multiplied must not launder into the radius', () => {
  // The DEFEAT: `--ds-card-padding-doubled` is not multiplied AT THE RADIUS
  // SITE -- it is only subtracted there, which reads as a legitimate
  // derivation. The multiplication happened one hop upstream, in the
  // intermediate carrier's OWN declaration. Before this fix that hop was
  // invisible to the radius check, so a corner that actually tracks the
  // padding at 2x the true rhythm rate was licensed as concentric geometry
  // wearing a name with "padding" in it -- and this fixture even satisfies
  // defect 3's real-padding-producer proof using the SAME doubled carrier, to
  // isolate that defect 2's taint (not defect 3's producer check) is what
  // catches it.
  const result = analyzeRhythmStylesheets([
    {
      file: '/fixture/tokens.css',
      css: `:root {
        --ds-card-padding-current: calc(1rem * ${READ});
        --ds-card-padding-doubled: calc(var(--ds-card-padding-current) * 2);
      }`,
    },
    {
      file: '/fixture/card.css',
      css: `.card {
        padding: var(--ds-card-padding-doubled);
        --_ds-card-nest-radius: max(0px, calc(8px - var(--ds-card-padding-doubled)));
      }
      .card > .body { border-radius: var(--_ds-card-nest-radius); }`,
    },
  ]);

  assert.equal(result.ok, false, 'a radius derived from a doubled carrier must not be licensed');
  assert.deepEqual(result.concentricChannels, []);
  assert.equal(result.indirectViolations.length, 2, 'the channel declaration and its consumer both fail');
  assert.ok(
    result.indirectViolations.every(
      (finding) => finding.classification === CLASSIFICATIONS.forbiddenOuterRadius,
    ),
  );
});

// ---------------------------------------------------------------------------
// 13. Defect 3 -- the concentric license must be REAL: the SAME producing
// rule must paint a real rhythm-scaled padding property, and the consumer
// must be a permitted descendant of THAT specific producer.
// ---------------------------------------------------------------------------

test('RED: clause (g) -- a same-named carrier used as padding ELSEWHERE does not license this radius', () => {
  // `--ds-globally-shared-room` is spacing-NAMED (it would satisfy the old,
  // name-only heuristic) and it genuinely carries rhythm. But `.widget` never
  // applies it as ITS OWN padding anywhere -- some UNRELATED selector does.
  // The owner ruling requires the SAME producing rule to emit a real
  // rhythm-scaled padding property; a global carrier that merely happens to
  // be named padding must not license anything.
  const result = analyzeRhythmStylesheets([
    { file: '/fixture/tokens.css', css: `:root { --ds-globally-shared-room: calc(1rem * ${READ}); }` },
    {
      file: '/fixture/other.css',
      css: '.unrelated-widget { padding: var(--ds-globally-shared-room); }',
    },
    {
      file: '/fixture/widget.css',
      css: `.widget { --_widget-corner: max(0px, calc(8px - var(--ds-globally-shared-room))); }
            .widget > .inner { border-radius: var(--_widget-corner); }`,
    },
  ]);

  assert.equal(
    result.ok,
    false,
    'a same-named carrier applied as padding elsewhere must not license this radius',
  );
  assert.deepEqual(result.concentricChannels, []);
  assert.ok(
    result.indirectViolations.some(
      (finding) =>
        finding.property === '--_widget-corner'
        && finding.classification === CLASSIFICATIONS.forbiddenOuterRadius,
    ),
  );
});

test('GREEN: clause (g) -- the mutation pair: the SAME rule painting real padding licenses the radius', () => {
  const result = analyzeRhythmStylesheets([
    { file: '/fixture/tokens.css', css: `:root { --ds-widget-room: calc(1rem * ${READ}); }` },
    {
      file: '/fixture/widget.css',
      css: `.widget { padding: var(--ds-widget-room); --_widget-corner: max(0px, calc(8px - var(--ds-widget-room))); }
            .widget > .inner { border-radius: var(--_widget-corner); }`,
    },
  ]);

  assert.equal(result.ok, true);
  assert.deepEqual(result.concentricChannels, ['--_widget-corner']);
});

test('RED: clause (h) -- a structurally "contained" but UNRELATED consumer must not be licensed', () => {
  // `.other-widget > .inner` has the SHAPE of containment (a `>` combinator,
  // no repeated ancestor class), but it is not nested under `.card` at all.
  // Generic containment (clause d) alone cannot see that; the consumer must
  // descend from the SPECIFIC rule that produced the channel.
  const result = concentricDrill(
    `.card { ${LICENSED_CHANNEL} }
     .other-widget > .inner { border-radius: var(--_ds-card-nest-radius); }`,
  );

  assert.equal(result.ok, false, 'an unrelated consumer must not inherit a license it never earned');
  assert.equal(subjectIsContained('.other-widget > .inner'), true, 'the shape alone looks contained');
  assert.equal(
    isDescendantOfSelector('.card', '.other-widget > .inner'),
    false,
    'the consumer does not actually descend from the producer',
  );
  const consumerFinding = result.indirectViolations.find(
    (finding) => finding.selector === '.other-widget > .inner',
  );
  assert.ok(consumerFinding, 'the unrelated consumer was not reported');
  assert.equal(consumerFinding.classification, CLASSIFICATIONS.forbiddenOuterRadius);
  // The producer's OWN declaration keeps its license; only the unrelated
  // consumer loses it.
  assert.deepEqual(result.concentricChannels, ['--_ds-card-nest-radius']);
});

test('isDescendantOfSelector: exact prefix plus a containing combinator, fail-closed across lists', () => {
  assert.equal(isDescendantOfSelector('.card > .body', ".card > .body > [data-part='header']"), true);
  assert.equal(
    isDescendantOfSelector('.card > .body', '.card > .body'),
    false,
    'a selector is not a descendant of itself',
  );
  assert.equal(isDescendantOfSelector('.card > .body', '.other > .body > .inner'), false);
  assert.equal(
    isDescendantOfSelector('.card > .body', '.card > .body + .sibling'),
    false,
    'a sibling combinator does not descend',
  );
  assert.equal(isDescendantOfSelector('', '.card > .inner'), false);
  assert.equal(isDescendantOfSelector('.card', ''), false);
  // Fail-closed across a consumer selector LIST: every arm must qualify.
  assert.equal(isDescendantOfSelector('.card', '.card > .a, .stray > .b'), false);
  // Permissive across a PRODUCER selector list: matching any one arm is enough.
  assert.equal(isDescendantOfSelector('.card, .card-compact', '.card-compact > .inner'), true);
});

test('same-producer proof permits suffix-only narrowing but not replacement or identifier continuation', () => {
  const producer = ".ds-card[data-part='root'] > [data-part='body']";
  const narrowed =
    ".ds-card[data-part='root']:not([data-tone]) > [data-part='body'] > [data-part='header']";

  assert.equal(isDescendantOfSelector(producer, narrowed), true);
  assert.equal(compoundIsExactOrNarrower('.card', '.card:not([hidden])'), true);
  assert.equal(compoundIsExactOrNarrower('.card', '.cardinal'), false);
  assert.equal(compoundIsExactOrNarrower('.card[data-x]', '.card'), false);
});

// ---------------------------------------------------------------------------
// 14. Defect 4 -- structural selector identity, not sanitized-text equality.
// The four reproduced Fable bypasses, each with its own drill.
// ---------------------------------------------------------------------------

test('compoundConditions sees a class hidden inside :is() and :where()', () => {
  assert.deepEqual(compoundConditions(':is(.ds-semantic-surface)'), ['ds-semantic-surface']);
  assert.deepEqual(compoundConditions(':where(.ds-semantic-surface)'), ['ds-semantic-surface']);
  // Nested logical pseudos resolve too.
  assert.deepEqual(compoundConditions(':is(:where(.a), .b)').sort(), ['a', 'b']);
  // A bare compound with no pseudo at all still extracts normally.
  assert.deepEqual(compoundConditions('.ds-card'), ['ds-card']);
});

test('compoundConditions treats [class~="x"] (and [class="x"]) as equivalent to .x', () => {
  assert.deepEqual(compoundConditions('[class~="ds-card"]'), ['ds-card']);
  assert.deepEqual(compoundConditions("[class~='ds-card']"), ['ds-card']);
  assert.deepEqual(compoundConditions('[class="ds-card"]'), ['ds-card']);
  // An unrelated attribute is not a class condition.
  assert.deepEqual(compoundConditions("[data-part='root']"), []);
});

test('Fable bypass 1 -- a subject re-spelled with :is() must still be caught as a repeated ancestor class', () => {
  // `.ds-semantic-surface :is(.ds-semantic-surface)` selects EXACTLY what
  // `.ds-semantic-surface .ds-semantic-surface` selects. Before this fix, the
  // subject's OWN class was hidden inside `:is()`, the stripped-text
  // extraction returned an empty set, and `subjectIsComponentRoot` returned
  // false at the very first "own.size === 0" early return -- never even
  // comparing against the ancestor chain.
  assert.equal(subjectIsComponentRoot('.ds-semantic-surface :is(.ds-semantic-surface)'), true);
});

test('Fable bypass 2 -- a class hidden inside :where() must still be caught', () => {
  assert.equal(subjectIsComponentRoot('.ds-semantic-surface :where(.ds-semantic-surface)'), true);
});

test('Fable bypass 3 -- [class~="ds-card"] must be caught as equivalent to .ds-card, either side', () => {
  assert.equal(subjectIsComponentRoot(".ds-card > [data-part='body'] [class~='ds-card']"), true);
  // ...and symmetrically when the ANCESTOR is spelled the attribute way.
  assert.equal(subjectIsComponentRoot("[class~='ds-card'] > [data-part='body'] .ds-card"), true);
});

test('Fable bypass 4 -- a * subject decorated with :not([hidden]) carries no identity', () => {
  // `:not([hidden])` excludes almost nothing in real markup, so `.card > *`
  // and `.card > *:not([hidden])` are the SAME hazard: either could paint a
  // nested whole component's own root. This is the universal-selector half of
  // defect 4, mechanized as `subjectLacksIdentity` and wired into the radius
  // judgment ahead of the component-root check.
  assert.equal(subjectHasNoIdentity('*'), true);
  assert.equal(subjectHasNoIdentity('*:not([hidden])'), true);
  assert.equal(subjectHasNoIdentity(':scope'), true);
  assert.equal(subjectHasNoIdentity('*:hover'), true);
  assert.equal(subjectHasNoIdentity("[data-part='header']"), false);
  assert.equal(subjectHasNoIdentity('.card'), false);
  assert.equal(subjectLacksIdentity('.card > *'), true);
  assert.equal(subjectLacksIdentity('.card > *:not([hidden])'), true);
  assert.equal(subjectLacksIdentity(".card > [data-part='header']"), false);

  const result = concentricDrill(
    `.card { ${LICENSED_CHANNEL} } .card > *:not([hidden]) { border-radius: var(--_ds-card-nest-radius); }`,
  );
  assert.equal(result.ok, false, 'a wildcard consumer must not be licensed even when decorated');
  assert.equal(result.indirectViolations.length, 1);
  assert.equal(
    result.indirectViolations[0].classification,
    CLASSIFICATIONS.forbiddenOuterRadius,
  );
  // The producer itself is unaffected -- only the identity-less consumer fails.
  assert.deepEqual(result.concentricChannels, ['--_ds-card-nest-radius']);
});

/* ---------------------------------------------------------------------------
 * ENMIENDA decision 20: un artefacto SI puede llevar ritmo, pero solo con el
 * factor. Las dos direcciones, porque una enmienda que solo prueba que el caso
 * nuevo pasa no prueba que la mordida sobrevivio.
 * ------------------------------------------------------------------------- */

test('decision 20 (a): un literal de ritmo crudo en un artefacto SIGUE fallando', () => {
  // El canal declarado a pelo: congela el dial en su propia raiz.
  const congelado = ':root { --ds-rhythm-effective-scale: 1; }';
  const ofensas = illicitRhythmMentions(congelado);
  assert.equal(ofensas.length, 1, 'declarar el canal es rojo');
  assert.match(ofensas[0].why, /congela el dial/u);

  /* LO QUE ESTA ENMIENDA NO HACE, y conviene que este escrito como prueba:
   * `padding: var(--ds-rhythm-effective-scale)` —una lectura que no multiplica,
   * sobre una propiedad de espaciado— NO se marca. El analizador de siempre la
   * admite, y un archivo excluido se juzga con EXACTAMENTE la misma ley que uno
   * incluido: hacer los excluidos mas estrictos que los autorados seria inventar
   * ley, no conservar la mordida. Si esa forma debe prohibirse, se prohibe en el
   * clasificador, para los dos lados a la vez. */
  const sinMultiplicar = ':root { padding: var(--ds-rhythm-effective-scale); }';
  assert.deepEqual(
    illicitRhythmMentions(sinMultiplicar),
    [],
    'misma ley que en un archivo autorado: ni mas blanda ni mas dura',
  );
});

test('decision 20 (b): la forma del sistema —factor en el sitio de declaracion— PASA', () => {
  // La forma de patterns.css:500, que es la que la decision 20 manda a los temas.
  const licito = ':root { --ds-command-home-gap: calc(16px * var(--ds-rhythm-effective-scale, 1)); }';
  assert.deepEqual(illicitRhythmMentions(licito), []);

  // Varios calc() consecutivos en una linea: el shorthand de dos componentes y
  // el clamp de tres. Contar parentesis desde el principio de la linea daba
  // falsos positivos aca, asi que la forma real del artefacto es fixture.
  const shorthand =
    ':root { --ds-compact-card-padding: calc(10px * var(--ds-rhythm-effective-scale, 1)) ' +
    'calc(12px * var(--ds-rhythm-effective-scale, 1)); }';
  assert.deepEqual(illicitRhythmMentions(shorthand), []);

  const conClamp =
    ':root { --ds-command-home-console-padding: clamp(calc(20px * var(--ds-rhythm-effective-scale, 1)), ' +
    'calc(3vw * var(--ds-rhythm-effective-scale, 1)), calc(34px * var(--ds-rhythm-effective-scale, 1))) ' +
    'calc(24px * var(--ds-rhythm-effective-scale, 1)); }';
  assert.deepEqual(illicitRhythmMentions(conClamp), []);
});

test('decision 20 (c): la mordida no se puede evadir metiendo el canal en un calc sin operador', () => {
  const disfrazado = ':root { --ds-x: calc(var(--ds-rhythm-effective-scale, 1)); }';
  const ofensas = illicitRhythmMentions(disfrazado);
  assert.equal(ofensas.length, 1, 'un calc() sin operador no es un factor');
  assert.match(ofensas[0].why, /FORBIDDEN_OTHER_CAPABILITY/u);
});

test('decision 20 (d): el arbol real pasa, y pasa por la forma, no por la exencion', () => {
  const artefacto = readFileSync(
    new URL('../../../src/foundation/tokens/css/facade/artifacts/bithire/index.css', import.meta.url),
    'utf8',
  );
  assert.ok(artefacto.includes('--ds-rhythm-effective-scale'), 'bithire SI lleva ritmo, por diseño');
  assert.deepEqual(
    illicitRhythmMentions(artefacto),
    [],
    'y cada mencion carga el factor: pasa por cumplir la forma',
  );
});

test('decision 20 (e): la mordida clasica intacta — ritmo sobre una propiedad de TAMANO sigue roja aunque cargue el factor', () => {
  /* Esta es la prueba que la enmienda tenia que no romper, y que en una version
   * intermedia mia SI rompio: un `block-size` con el factor pasaba por "licito".
   * La enmienda final no juzga la forma por su cuenta — delega en el clasificador
   * del gate — asi que la clase que el gate existe para pescar sigue siendo roja
   * incluso escondida en una carpeta excluida. */
  const escondido = '.bad { block-size: calc(1px * var(--ds-rhythm-effective-scale, 1)); }';
  const ofensas = illicitRhythmMentions(escondido);
  assert.equal(ofensas.length, 1);
  assert.match(ofensas[0].why, /FORBIDDEN_SIZE/u);
});
