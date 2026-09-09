/**
 * Drills of the family-cut gate.
 *
 * Every drill plants a REAL defect -- the exact shape a family cut regresses
 * into -- and asserts the gate turns red. Nothing is planted in the real tree:
 * `resolveFamily` takes a root, so each drill mirrors the calibration family
 * into a tmpdir sandbox, edits the copy, and measures that.
 *
 * The producer set stays the REAL one throughout. A sandbox holds three skin
 * files and no authored token CSS, so a sandbox-local producer set would call
 * every channel debt and every drill would pass for the wrong reason.
 */

import assert from 'node:assert/strict';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import test from 'node:test';

import { collectSkinFiles } from '../../libraries/engine/skins/files/index.mjs';
import { packageRoot as findPackageRoot } from '../../libraries/repo-root/index.mjs';
import { collectChannelProducers } from '../../libraries/tokens/producers/index.mjs';
import {
  BASELINE_PATH,
  OWED_ARMS,
  analyzeSkin,
  analyzeSource,
  collectFindings,
  judgeFamily,
  measureFamily,
  readBaseline,
  resolveFamily,
} from './index.mjs';

const ROOT = findPackageRoot(new URL('.', import.meta.url).pathname);
const PRODUCERS = collectChannelProducers().producers;
const FAMILY = 'button';

/** The three trees a family lives in: its skins, its components, its recipe. */
const SANDBOX_SOURCES = [
  'src/components/primitives/inputs/button',
  'src/foundation/tokens/css/runtime/engines/modern/skin/button',
  'src/foundation/tokens/css/presentation/components/skin/button-group',
  'src/foundation/tokens/css/presentation/components/skin/button-icon',
  'src/infrastructure/runtime/foundation/recipes/contracts/families/button',
];

function expectFinding(findings, fragment, message) {
  assert.ok(
    findings.some((finding) => finding.includes(fragment)),
    `${message}; got ${JSON.stringify(findings, null, 1)}`,
  );
}

function expectNoFinding(findings, fragment, message) {
  assert.equal(
    findings.filter((finding) => finding.includes(fragment)).length,
    0,
    `${message}; got ${JSON.stringify(findings, null, 1)}`,
  );
}

/**
 * Mirrors the family into a sandbox, hands `edit` the sandbox root, then runs
 * `run` with the findings the gate produces against the edited copy.
 */
function withPlantedFamily(edit, run) {
  const sandbox = mkdtempSync(join(tmpdir(), 'family-cut-drill-'));
  try {
    for (const relativePath of SANDBOX_SOURCES) {
      const target = join(sandbox, relativePath);
      mkdirSync(dirname(target), { recursive: true });
      cpSync(join(ROOT, relativePath), target, { recursive: true });
    }
    edit(sandbox);
    const measured = measureFamily(resolveFamily(FAMILY, sandbox), { producers: PRODUCERS });
    run(judgeFamily(measured, readBaseline().families[FAMILY]), measured);
  } finally {
    rmSync(sandbox, { recursive: true, force: true });
  }
}

const patch = (sandbox, relativePath, replace) => {
  const file = join(sandbox, relativePath);
  writeFileSync(file, replace(readFileSync(file, 'utf8')));
};

const MODERN_TSX = 'src/components/primitives/inputs/button/engines/modern/index.tsx';
const MODERN_SKIN = 'src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css';

// ---------------------------------------------------------------------------
// The tree as it stands
// ---------------------------------------------------------------------------

test('the live tree matches its baseline', () => {
  assert.deepEqual(collectFindings().findings, []);
});

test('the pinned numbers are the measured numbers, not a guess', () => {
  const baseline = readBaseline();
  const measured = measureFamily(resolveFamily(FAMILY), { producers: PRODUCERS });
  const pinned = baseline.families[FAMILY];
  for (const [key, value] of Object.entries(measured.ratchets)) {
    assert.equal(value, pinned[key], `pin \`${key}\` must be the measurement`);
  }
  for (const [key, value] of Object.entries(measured.denominators)) {
    assert.equal(value, pinned.denominators[key], `denominator \`${key}\` must be the measurement`);
  }
});

test('the sandbox mirror measures exactly what the real tree measures', () => {
  // The control for every drill below: if the mirror did not reproduce the
  // real measurement, a planted red would prove nothing about the real gate.
  withPlantedFamily(() => {}, (findings) => {
    assert.deepEqual(findings, []);
  });
});

test('the corpus is Modern only: no frozen-engine file is ever measured', () => {
  const resolved = resolveFamily(FAMILY);
  assert.ok(resolved.skins.length > 0, 'an empty corpus is never a pass');
  assert.ok(resolved.sources.length > 0, 'an empty corpus is never a pass');
  for (const file of [...resolved.skins, ...resolved.sources]) {
    assert.ok(!file.includes('/engines/classic/'), `classic is frozen: ${file}`);
    assert.ok(!file.includes('/engines/rustic/'), `rustic is frozen: ${file}`);
  }
});

// ---------------------------------------------------------------------------
// The two drills the work order names
// ---------------------------------------------------------------------------

test('PLANT: `style={{ color }}` in the family TSX is BLOCKING', () => {
  withPlantedFamily(
    (sandbox) => patch(sandbox, MODERN_TSX, (text) =>
      text.replace(
        '  const anatomyProps = {',
        "  const plantedColor = 'var(--planted)';\n  const plantedStyle = <span style={{ color: plantedColor }} />;\n  void plantedStyle;\n  const anatomyProps = {",
      )),
    (findings) => {
      expectFinding(
        findings,
        'BLOCKING inline paint',
        'a component that sets `color` inline paints in the wrong layer and must fail',
      );
      expectFinding(findings, 'style` sets `color`', 'the finding names the property it caught');
    },
  );
});

test('CONTROL: an inline block of only `--ds-*` custom properties is NOT a violation', () => {
  // Without this the drill above would pass for the wrong reason: the gate
  // could be refusing `style` outright rather than refusing authored paint.
  withPlantedFamily(
    (sandbox) => patch(sandbox, MODERN_TSX, (text) =>
      text.replace(
        '  const anatomyProps = {',
        "  const plantedStyle = <span style={{ '--ds-button-planted': pressMotion.variables }} />;\n  void plantedStyle;\n  const anatomyProps = {",
      )),
    (findings) => {
      expectNoFinding(findings, 'BLOCKING inline paint', 'a runtime-computed channel may travel inline');
    },
  );
});

test('PLANT: a `--ds-button-x` read with no producer grows the ratchet', () => {
  withPlantedFamily(
    (sandbox) => patch(sandbox, MODERN_SKIN, (text) =>
      `${text}\n.rottay-button--planted { color: var(--ds-button-x, #ff0000); }\n`),
    (findings, measured) => {
      assert.ok(
        measured.detail.readWithoutProducer.includes('--ds-button-x'),
        'the planted name has no producer and must be classified as debt',
      );
      expectFinding(
        findings,
        '`readWithoutProducer` GREW from 34 to 35',
        'a name the skin reads that nobody writes must grow the ratchet and turn the gate red',
      );
    },
  );
});

test('CONTROL: the same `--ds-button-x` WITH a producer does not grow the ratchet', () => {
  // Proves the red above is caused by the MISSING PRODUCER and not by the
  // appearance of a new name.
  withPlantedFamily(
    (sandbox) => patch(sandbox, MODERN_SKIN, (text) =>
      `${text}\n.rottay-button--planted { color: var(--ds-button-x, #ff0000); }\n`),
    () => {},
  );
  const sandbox = mkdtempSync(join(tmpdir(), 'family-cut-control-'));
  try {
    for (const relativePath of SANDBOX_SOURCES) {
      const target = join(sandbox, relativePath);
      mkdirSync(dirname(target), { recursive: true });
      cpSync(join(ROOT, relativePath), target, { recursive: true });
    }
    patch(sandbox, MODERN_SKIN, (text) =>
      `${text}\n.rottay-button--planted { color: var(--ds-button-x, #ff0000); }\n`);
    const measured = measureFamily(resolveFamily(FAMILY, sandbox), {
      producers: new Set([...PRODUCERS, '--ds-button-x']),
    });
    expectNoFinding(
      judgeFamily(measured, readBaseline().families[FAMILY]),
      '`readWithoutProducer` GREW',
      'giving the name a producer cannot grow the ratchet',
    );
  } finally {
    rmSync(sandbox, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------------------
// The rest of the cut contract
// ---------------------------------------------------------------------------

test('PLANT: a colour literal in the family source is BLOCKING', () => {
  withPlantedFamily(
    (sandbox) => patch(sandbox, MODERN_TSX, (text) =>
      text.replace("  const anatomyProps = {", "  const plantedInk = '#ff0000';\n  void plantedInk;\n  const anatomyProps = {")),
    (findings) => expectFinding(findings, 'BLOCKING visual literal `#ff0000`', 'a colour belongs to a channel'),
  );
});

test('PLANT: an `--ant-*` read in the family skin is BLOCKING (F-67)', () => {
  withPlantedFamily(
    (sandbox) => patch(sandbox, MODERN_SKIN, (text) =>
      `${text}\n.rottay-button--planted { color: var(--ant-primary-color); }\n`),
    (findings) => expectFinding(findings, 'BLOCKING `--ant-primary-color`', 'an Ant private variable is not a channel here'),
  );
});

test('PLANT: a second class vocabulary grows the namespace ratchet (F-66)', () => {
  withPlantedFamily(
    (sandbox) => patch(sandbox, MODERN_SKIN, (text) => `${text}\n.rt-button--planted { color: inherit; }\n`),
    (findings, measured) => {
      assert.ok(measured.detail.vocabularies.includes('rt'), 'the planted vocabulary is counted');
      expectFinding(findings, '`classVocabularies` GREW from 2 to 3', 'one family, one namespace');
    },
  );
});

test('PLANT: a `data-part` nobody paints grows the contract census (F-67)', () => {
  withPlantedFamily(
    (sandbox) => patch(sandbox, MODERN_TSX, (text) =>
      text.replace("    'data-variant': effectiveVariant,", "    'data-part': 'planted-orphan',\n    'data-variant': effectiveVariant,")),
    (findings, measured) => {
      assert.ok(measured.detail.partsStampedNotConsumed.includes('planted-orphan'));
      expectFinding(findings, '`partsStampedNotConsumed` GREW from 2 to 3', 'an attribute with no reader is not a contract');
    },
  );
});

test('PLANT: a skin rule on a `data-state` nobody stamps grows the census', () => {
  withPlantedFamily(
    (sandbox) => patch(sandbox, MODERN_SKIN, (text) =>
      `${text}\n.rottay-button[data-state~='planted'] { color: inherit; }\n`),
    (findings) => expectFinding(findings, '`statesConsumedNotStamped` GREW from 1 to 2', 'paint that can never match is dead paint'),
  );
});

test('PLANT: a bare state pseudo-class with no `data-state` twin grows the census (F-37)', () => {
  withPlantedFamily(
    (sandbox) => patch(sandbox, MODERN_SKIN, (text) =>
      `${text}\n.rottay-button--planted:hover { color: inherit; }\n`),
    (findings) => expectFinding(
      findings,
      '`unpairedStatePseudoSelectors` GREW from 1 to 2',
      'one place decides when a part is hovered',
    ),
  );
});

test('CONTROL: the same pseudo-class PAIRED with its `data-state` twin is governed', () => {
  withPlantedFamily(
    (sandbox) => patch(sandbox, MODERN_SKIN, (text) =>
      `${text}\n.rottay-button--planted:is([data-state~='hovered'], :hover) { color: inherit; }\n`),
    (findings) => expectNoFinding(
      findings,
      '`unpairedStatePseudoSelectors` GREW',
      'a pseudo-class that backs up the kernel state is the pattern, not the defect',
    ),
  );
});

test('PLANT: dropping `partAttributes` while the skin still reads `[data-state]` is BLOCKING (F-37)', () => {
  withPlantedFamily(
    (sandbox) => patch(sandbox, MODERN_TSX, (text) =>
      text
        .replace('...partAttributes(dataPart ?? \'trigger\', interaction),', "'data-part': 'trigger',")
        .replace(/\bpartAttributes\b/gu, 'partAttributesRemoved')),
    (findings) => expectFinding(
      findings,
      'never calls `partAttributes`',
      'a skin that paints state needs one place that decides state',
    ),
  );
});

test('PLANT: `data-variant` painted with nothing stamping it is BLOCKING', () => {
  withPlantedFamily(
    (sandbox) => patch(sandbox, MODERN_TSX, (text) =>
      text.replace("    'data-variant': effectiveVariant,", "    'data-not-a-variant': effectiveVariant,")),
    (findings) => expectFinding(findings, '`data-variant` is on exactly one side', 'a variant axis is a two-sided contract'),
  );
});

test('PLANT: losing the family a11y probe is BLOCKING', () => {
  withPlantedFamily(
    (sandbox) => rmSync(join(sandbox, 'src/components/primitives/inputs/button/tests'), { recursive: true, force: true }),
    (findings) => expectFinding(findings, 'owns no executable accessibility assertion', 'a cut without an a11y probe is not verified'),
  );
});

// ---------------------------------------------------------------------------
// R4 (2026-09-08): the two arms the re-audit proved could report a false PASS
//
// Both mutants below are the ones `audit/95-reaudit-2026-09-08/verification/
// adversarial.md` ran against the delivered gate, which returned exit 0 for
// each. Realistic, not text-shaped: neither changes a single painted pixel or
// a single assertion's meaning -- only the syntax the reader walked through.
// ---------------------------------------------------------------------------

const TEST_DIR = 'src/components/primitives/inputs/button/tests';

/** Rewrites every file of the family's test directory. */
const patchTests = (sandbox, replace) => {
  const dir = join(sandbox, TEST_DIR);
  for (const name of readdirSync(dir)) {
    if (!/\.test\.tsx?$/u.test(name)) continue;
    const file = join(dir, name);
    writeFileSync(file, replace(readFileSync(file, 'utf8')));
  }
};

/** The two real `style={interactiveStyle}` sites of the Modern button. */
const wrapBothStyleSites = (wrap) => (text) => {
  const wrapped = text.replaceAll('style={interactiveStyle}', `style={${wrap}}`);
  assert.equal(
    (wrapped.match(new RegExp(`style=\\{${wrap.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&')}\\}`, 'gu')) ?? []).length,
    2,
    'the drill must rewrite both real style sites, or it proves nothing',
  );
  return wrapped;
};

for (const [label, wrap] of [
  ['an `as` cast', "{ ...interactiveStyle, color: 'red' } as React.CSSProperties"],
  ['a parenthesis', "({ ...interactiveStyle, color: 'red' })"],
  ['a `satisfies`', "{ ...interactiveStyle, color: 'red' } satisfies React.CSSProperties"],
  ['a parenthesised cast', "(({ ...interactiveStyle, color: 'red' }) as React.CSSProperties)"],
  ['a spread of a literal', "{ ...interactiveStyle, ...{ color: 'red' } }"],
]) {
  test(`PLANT: authored paint behind ${label} is still BLOCKING`, () => {
    withPlantedFamily(
      (sandbox) => patch(sandbox, MODERN_TSX, wrapBothStyleSites(wrap)),
      (findings, measured) => {
        expectFinding(
          findings,
          'style` sets `color`',
          `a transparent expression wrapper changes no runtime paint; ${label} must not hide it`,
        );
        assert.equal(
          measured.blocking.inlineStyleViolations.length,
          2,
          'both rewritten style sites must be reported, not one',
        );
      },
    );
  });
}

test('CONTROL: the same wrapper WITHOUT authored paint is not a violation', () => {
  // Without this the drills above would pass for the wrong reason: the gate
  // could be refusing casts rather than refusing paint.
  withPlantedFamily(
    (sandbox) => patch(
      sandbox,
      MODERN_TSX,
      wrapBothStyleSites('{ ...interactiveStyle } as React.CSSProperties'),
    ),
    (findings) => expectNoFinding(findings, 'BLOCKING inline paint', 'a cast is not itself a paint decision'),
  );
});

test('CONTROL: a runtime `--ds-*` channel behind a cast is still allowed inline', () => {
  withPlantedFamily(
    (sandbox) => patch(
      sandbox,
      MODERN_TSX,
      wrapBothStyleSites("{ ...interactiveStyle, '--ds-button-planted': pressMotion.duration } as React.CSSProperties"),
    ),
    (findings) => expectNoFinding(findings, 'BLOCKING inline paint', 'a runtime-computed channel may travel inline'),
  );
});

test('the calibration family has executable a11y evidence, not matching text', () => {
  const resolved = resolveFamily(FAMILY);
  assert.ok(resolved.a11yAssertions > 0, 'the calibration family must execute a11y assertions');
  assert.equal(
    resolved.a11yProbes.length > 0,
    true,
    'the probe list is the files that execute at least one of them',
  );
});

for (const [label, replace] of [
  ['every suite is `describe.skip`', (text) => text.replaceAll(/^describe(?=[(.])/gmu, 'describe.skip')],
  ['every case is `it.skip`', (text) => text.replaceAll(/(^|[^.\w])(it|test)(?=[(.])/gmu, '$1$2.skip')],
  ['every suite is `describe.todo`', (text) => text.replaceAll(/^describe(?=[(.])/gmu, 'describe.todo')],
]) {
  test(`PLANT: a11y evidence where ${label} is BLOCKING`, () => {
    withPlantedFamily(
      (sandbox) => patchTests(sandbox, replace),
      (findings, measured) => {
        assert.equal(measured.blocking.a11yAssertions, 0, 'a suite that never runs asserts nothing');
        assert.equal(measured.blocking.a11yProbes, 0, 'a file whose assertions never run is not a probe');
        expectFinding(
          findings,
          'owns no executable accessibility assertion',
          'a mechanically skipped mirror is not accessibility evidence',
        );
      },
    );
  });
}

test('CONTROL: the unskipped mirror keeps every executable a11y assertion', () => {
  // The negative control for the three drills above: the same rewrite machinery
  // applied as a no-op must leave the evidence exactly where it was.
  withPlantedFamily(
    (sandbox) => patchTests(sandbox, (text) => text),
    (findings, measured) => {
      assert.equal(measured.blocking.a11yAssertions, resolveFamily(FAMILY).a11yAssertions);
      expectNoFinding(findings, 'owns no executable accessibility assertion', 'the untouched mirror is evidence');
    },
  );
});

test('CONTROL: an a11y assertion reached only through a helper still counts', () => {
  withPlantedFamily(
    (sandbox) => {
      const dir = join(sandbox, TEST_DIR);
      for (const name of readdirSync(dir)) rmSync(join(dir, name), { force: true });
      writeFileSync(
        join(dir, 'Button.helper-reached.test.tsx'),
        [
          "import { describe, it, expect } from 'vitest';",
          "import { render, screen } from '@testing-library/react';",
          "import Button from '../index';",
          '',
          'function assertNamed(name: string) {',
          "  expect(screen.getByRole('button', { name })).toBeInTheDocument();",
          '}',
          '',
          "describe('button', () => {",
          "  it('has an accessible name', () => {",
          '    render(<Button>Save</Button>);',
          "    assertNamed('Save');",
          '  });',
          '});',
          '',
        ].join('\n'),
      );
    },
    (findings, measured) => {
      assert.equal(measured.blocking.a11yAssertions, 1, 'the helper an executing case calls is executed too');
      expectNoFinding(findings, 'owns no executable accessibility assertion', 'a helper-reached assertion is evidence');
    },
  );
});

test('PLANT: the SAME helper assertion is worthless when the only case is skipped', () => {
  withPlantedFamily(
    (sandbox) => {
      const dir = join(sandbox, TEST_DIR);
      for (const name of readdirSync(dir)) rmSync(join(dir, name), { force: true });
      writeFileSync(
        join(dir, 'Button.helper-reached.test.tsx'),
        [
          "import { describe, it, expect } from 'vitest';",
          "import { render, screen } from '@testing-library/react';",
          "import Button from '../index';",
          '',
          'function assertNamed(name: string) {',
          "  expect(screen.getByRole('button', { name })).toBeInTheDocument();",
          '}',
          '',
          "describe('button', () => {",
          "  it.skip('has an accessible name', () => {",
          '    render(<Button>Save</Button>);',
          "    assertNamed('Save');",
          '  });',
          '});',
          '',
        ].join('\n'),
      );
    },
    (findings, measured) => {
      assert.equal(measured.blocking.a11yAssertions, 0, 'nothing reaches the helper when the case is skipped');
      expectFinding(
        findings,
        'owns no executable accessibility assertion',
        'an unreachable helper is not accessibility evidence',
      );
    },
  );
});

// ---------------------------------------------------------------------------
// Shape: a counter can be green and be counting nothing
// ---------------------------------------------------------------------------

test('SHAPE: a family that resolves to no files is never a pass', () => {
  const empty = measureFamily(
    { family: 'nonexistent', root: ROOT, skins: [], sources: [], componentDirs: [], a11yProbes: [] },
    { producers: PRODUCERS },
  );
  const findings = judgeFamily(empty, readBaseline().families[FAMILY]);
  expectFinding(findings, 'resolves to zero Modern skin files', 'an empty corpus is never a pass');
  expectFinding(findings, 'resolves to zero authored source files', 'an empty corpus is never a pass');
  expectFinding(findings, 'resolves to 0 component owner(s)', 'a family with no owner is refused');
});

test('SHAPE: a family that resolves to two owners is refused, not guessed at', () => {
  const resolved = resolveFamily(FAMILY);
  const doubled = measureFamily(
    { ...resolved, componentDirs: [...resolved.componentDirs, ...resolved.componentDirs] },
    { producers: PRODUCERS },
  );
  expectFinding(
    judgeFamily(doubled, readBaseline().families[FAMILY]),
    'resolves to 2 component owner(s)',
    'a family has exactly one source owner',
  );
});

test('the calibration family resolves to exactly one owner in the real tree', () => {
  // The control for the drill above, and the reason the nested-owner filter
  // exists: `feedback/skeleton/compound/button` is named `button` too.
  const resolved = resolveFamily(FAMILY);
  assert.equal(resolved.componentDirs.length, 1);
  assert.ok(resolved.componentDirs[0].endsWith(join('primitives', 'inputs', 'button')));
});

test('SHAPE: a family with no pin is refused rather than skipped', () => {
  const measured = measureFamily(resolveFamily(FAMILY), { producers: PRODUCERS });
  expectFinding(
    judgeFamily(measured, undefined),
    'is not in baseline/index.json',
    'a family enters the cut contract by being pinned, not by being ignored',
  );
});

test('SHAPE: a shrinking ratchet is reported so the pin follows the tree DOWN', () => {
  const measured = measureFamily(resolveFamily(FAMILY), { producers: PRODUCERS });
  const inflated = { ...readBaseline().families[FAMILY], readWithoutProducer: 99 };
  expectFinding(judgeFamily(measured, inflated), '`readWithoutProducer` SHRANK from 99 to 34', 'good news still has to be written down');
});

test('SHAPE: a moved denominator is reported before any ratchet is touched', () => {
  const measured = measureFamily(resolveFamily(FAMILY), { producers: PRODUCERS });
  const pinned = readBaseline().families[FAMILY];
  const moved = { ...pinned, denominators: { ...pinned.denominators, channelsRead: 1 } };
  expectFinding(judgeFamily(measured, moved), 'denominator `channelsRead` moved from 1 to 252', 're-read the census first');
});

test('SHAPE: an empty roster is refused', () => {
  const sandbox = mkdtempSync(join(tmpdir(), 'family-cut-roster-'));
  try {
    const baselinePath = join(sandbox, 'index.json');
    writeFileSync(baselinePath, JSON.stringify({ schemaVersion: 1, families: {} }));
    const result = collectFindings({ baselinePath });
    assert.deepEqual(result.findings, [
      'family-cut: the roster is empty -- a gate with nothing to check is not a pass',
    ]);
    // The shape matters as much as the finding: `main` destructures this, and a
    // bare array here would exit 0 on the one input that most deserves a red.
    assert.deepEqual(result.measurements, []);
  } finally {
    rmSync(sandbox, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------------------
// Reading discipline
// ---------------------------------------------------------------------------

test('INJECTION: a name that lives only inside a CSS comment is not paint', () => {
  const sandbox = mkdtempSync(join(tmpdir(), 'family-cut-comment-'));
  try {
    const file = join(sandbox, 'index.css');
    writeFileSync(file, "/* .x[data-part='ghost'] { color: var(--ds-button-ghosted); } */\n.y { color: inherit; }\n");
    const analyzed = analyzeSkin(file);
    assert.ok(!analyzed.parts.has('ghost'), 'a comment is not a rule');
    writeFileSync(file, ".x[data-part='ghost'] { color: inherit; }\n");
    assert.ok(analyzeSkin(file).parts.has('ghost'), 'outside the comment the same part IS a rule');
  } finally {
    rmSync(sandbox, { recursive: true, force: true });
  }
});

test('INJECTION: an anatomy attribute authored as an object property is seen', () => {
  // The shape the calibration family uses. A reader that only saw JSX
  // attributes would report a family that stamps nothing and pass vacuously.
  const fromObject = analyzeSource(join(ROOT, MODERN_TSX));
  assert.ok(fromObject.stampsVariantAttribute, '`data-variant` is authored as an object property');
  assert.ok(fromObject.parts.has('trigger'), '`partAttributes(dataPart ?? \'trigger\', …)` stamps `trigger`');
});

test('the producer set is the SHARED one, never a second measurement', () => {
  const { declared, compiled, producers } = collectChannelProducers();
  assert.ok(declared.size > 0, 'the authored CSS declares channels');
  assert.ok(compiled.size > 0, 'the family derivers emit channels');
  assert.equal(producers.size, new Set([...declared, ...compiled]).size);
});

test('every owed arm names the work order that makes it measurable', () => {
  assert.ok(OWED_ARMS.length > 0);
  for (const arm of OWED_ARMS) {
    assert.ok(arm.id && arm.owner && arm.reason.length > 40, `owed arm ${arm.id} needs an owner and a reason`);
  }
});

test('the baseline path the gate reads is the one this suite pins', () => {
  assert.ok(BASELINE_PATH.endsWith(join('family-cut', 'baseline', 'index.json')));
});
