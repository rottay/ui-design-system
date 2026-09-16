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

import ts from 'typescript';

import { collectSkinFiles } from '../../libraries/engine/skins/files/index.mjs';
import { packageRoot as findPackageRoot } from '../../libraries/repo-root/index.mjs';
import { collectChannelProducers } from '../../libraries/tokens/producers/index.mjs';
import {
  BASELINE_PATH,
  OWED_ARMS,
  analyzeSkin,
  analyzeSource,
  collectFindings,
  fanOutFor,
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
  'src/components/primitives/feedback/skeleton/runtime/anatomy-renderer',
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
/** The calibration family's pins: a drill grows one of them by exactly one. */
const PIN = readBaseline().families[FAMILY];
const grew = (key) => `\`${key}\` GREW from ${PIN[key]} to ${PIN[key] + 1}`;
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
      `${text}\n.ds-button--planted { color: var(--ds-button-x, #ff0000); }\n`),
    (findings, measured) => {
      assert.ok(
        measured.detail.readWithoutProducer.includes('--ds-button-x'),
        'the planted name has no producer and must be classified as debt',
      );
      expectFinding(
        findings,
        grew('readWithoutProducer'),
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
      `${text}\n.ds-button--planted { color: var(--ds-button-x, #ff0000); }\n`),
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
      `${text}\n.ds-button--planted { color: var(--ds-button-x, #ff0000); }\n`);
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
      `${text}\n.ds-button--planted { color: var(--ant-primary-color); }\n`),
    (findings) => expectFinding(findings, 'BLOCKING `--ant-primary-color`', 'an Ant private variable is not a channel here'),
  );
});

test('PLANT: a second class vocabulary grows the namespace ratchet (F-66)', () => {
  withPlantedFamily(
    (sandbox) => patch(sandbox, MODERN_SKIN, (text) => `${text}\n.rt-button--planted { color: inherit; }\n`),
    (findings, measured) => {
      assert.ok(measured.detail.vocabularies.includes('rt'), 'the planted vocabulary is counted');
      expectFinding(findings, grew('classVocabularies'), 'one family, one namespace');
    },
  );
});

test('PLANT: a `data-part` nobody paints grows the contract census (F-67)', () => {
  withPlantedFamily(
    (sandbox) => patch(sandbox, MODERN_TSX, (text) =>
      text.replace("    'data-variant': effectiveVariant,", "    'data-part': 'planted-orphan',\n    'data-variant': effectiveVariant,")),
    (findings, measured) => {
      assert.ok(measured.detail.partsStampedNotConsumed.includes('planted-orphan'));
      expectFinding(findings, grew('partsStampedNotConsumed'), 'an attribute with no reader is not a contract');
    },
  );
});

test('PLANT: a skin rule on a `data-state` nobody stamps grows the census', () => {
  withPlantedFamily(
    (sandbox) => patch(sandbox, MODERN_SKIN, (text) =>
      `${text}\n.ds-button[data-state~='planted'] { color: inherit; }\n`),
    (findings) => expectFinding(findings, grew('statesConsumedNotStamped'), 'paint that can never match is dead paint'),
  );
});

test('PLANT: a bare state pseudo-class with no `data-state` twin grows the census (F-37)', () => {
  withPlantedFamily(
    (sandbox) => patch(sandbox, MODERN_SKIN, (text) =>
      `${text}\n.ds-button--planted:hover { color: inherit; }\n`),
    (findings) => expectFinding(
      findings,
      grew('unpairedStatePseudoSelectors'),
      'one place decides when a part is hovered',
    ),
  );
});

test('CONTROL: the same pseudo-class PAIRED with its `data-state` twin is governed', () => {
  withPlantedFamily(
    (sandbox) => patch(sandbox, MODERN_SKIN, (text) =>
      `${text}\n.ds-button--planted:is([data-state~='hovered'], :hover) { color: inherit; }\n`),
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
// The anatomy-derived skeleton arm: one renderer draws every loading state
// ---------------------------------------------------------------------------

const RENDERER = 'src/components/primitives/feedback/skeleton/runtime/anatomy-renderer/index.tsx';
const SKELETON_ARM = 'BLOCKING anatomy-derived-skeleton';

for (const [label, plant] of [
  ['a skeleton component under the family owner', (sandbox) => {
    const dir = join(sandbox, 'src/components/primitives/inputs/button/compound/skeleton');
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'index.tsx'), [
      "import React from 'react';",
      '',
      'export function ButtonSkeleton() {',
      '  return <span data-part="trigger" aria-hidden="true" />;',
      '}',
      '',
    ].join('\n'));
  }],
  ['a skeleton shimmer keyframe in the family skin', (sandbox) => patch(sandbox, MODERN_SKIN, (text) =>
    `${text}\n@keyframes ds-button-loading-shimmer { to { background-position: 200% 0; } }\n`)],
]) {
  test(`PLANT: a hand-made per-component skeleton -- ${label} -- is BLOCKING`, () => {
    withPlantedFamily(plant, (findings, measured) => {
      assert.ok(measured.blocking.skeleton.handMade.length > 0, 'the plant is measured as a hand-made skeleton');
      expectFinding(findings, `${SKELETON_ARM} -- hand-made skeleton`, 'a family may not draw its own loading state');
    });
  });
}

test('CONTROL: a family that composes the shared renderer is not a hand-made skeleton', () => {
  withPlantedFamily(
    (sandbox) => patch(sandbox, MODERN_TSX, (text) =>
      text.replace(
        '  const anatomyProps = {',
        '  const plantedLoading = <AnatomySkeleton><span data-part="trigger" /></AnatomySkeleton>;\n  void plantedLoading;\n  const anatomyProps = {',
      )),
    (findings, measured) => {
      assert.deepEqual(measured.blocking.skeleton.handMade, []);
      expectNoFinding(findings, SKELETON_ARM, 'the renderer is the one door, not a defect');
    },
  );
});

/**
 * Renames a part the family really stamps AND the rule that paints it, so every
 * other arm stays exactly at its pin: the only thing left to catch is that the
 * skeleton renderer was never told about the new part.
 */
const renameAnatomy = (sandbox) => {
  patch(sandbox, MODERN_TSX, (text) => {
    const renamed = text.replace('<span data-part="prefix">', '<span data-part="leading-adornment">');
    assert.notEqual(renamed, text, 'the drill must change a part the family really stamps');
    return renamed;
  });
  patch(sandbox, MODERN_SKIN, (text) => {
    const renamed = text.replace("[data-part='prefix']", "[data-part='leading-adornment']");
    assert.notEqual(renamed, text, 'the drill must move the paint with the part');
    return renamed;
  });
};

test('PLANT: a `data-part` anatomy change with no renderer change is BLOCKING', () => {
  withPlantedFamily(
    renameAnatomy,
    (findings, measured) => {
      assert.deepEqual(measured.blocking.skeleton.partsWithoutRole, ['leading-adornment']);
      assert.equal(findings.length, 1, `the rename moves no other arm; got ${JSON.stringify(findings)}`);
      expectFinding(
        findings,
        `${SKELETON_ARM} -- \`data-part\` \`leading-adornment\` has no role in the shared skeleton renderer`,
        'the renderer cannot derive a loading state from a part it has never been told how to draw',
      );
    },
  );
});

test('CONTROL: the SAME anatomy change WITH its renderer change holds', () => {
  withPlantedFamily(
    (sandbox) => {
      renameAnatomy(sandbox);
      patch(sandbox, RENDERER, (text) => {
        const taught = text.replace("  prefix: 'round',", "  prefix: 'round',\n  'leading-adornment': 'round',");
        assert.notEqual(taught, text, 'the control must teach the renderer the new part');
        return taught;
      });
    },
    (findings, measured) => {
      assert.deepEqual(measured.blocking.skeleton.partsWithoutRole, []);
      assert.deepEqual(findings, [], 'a renamed part the renderer can draw is not drift');
    },
  );
});

test('the anatomy-derived skeleton arm is BLOCKING, not OWED, and holds on the live tree', () => {
  assert.equal(OWED_ARMS.some((arm) => arm.id === 'anatomy-derived-skeleton'), false);
  const measured = measureFamily(resolveFamily(FAMILY), { producers: PRODUCERS });
  assert.equal(measured.blocking.skeleton.renderer, true);
  assert.deepEqual(measured.blocking.skeleton.handMade, []);
  assert.deepEqual(measured.blocking.skeleton.partsWithoutRole, []);
  expectNoFinding(judgeFamily(measured, readBaseline().families[FAMILY]), SKELETON_ARM, 'the calibration family is derived, not hand-made');
});

test('SHAPE: a missing shared renderer is BLOCKING, never a vacuous pass', () => {
  withPlantedFamily(
    (sandbox) => rmSync(join(sandbox, RENDERER), { force: true }),
    (findings, measured) => {
      assert.equal(measured.blocking.skeleton.renderer, false);
      expectFinding(findings, `${SKELETON_ARM} -- the shared renderer`, 'an arm with nothing to measure against is red');
    },
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

/**
 * Every real `style={…}` attribute of a file, read from its AST: a drill pinned
 * to one written shape stops planting the day the source is refactored.
 */
const styleSites = (text, file = MODERN_TSX) => {
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const sites = [];
  const visit = (node) => {
    if (ts.isJsxAttribute(node)
      && node.name.getText(source) === 'style'
      && node.initializer
      && ts.isJsxExpression(node.initializer)
      && node.initializer.expression) {
      const expression = node.initializer.expression;
      sites.push({
        start: expression.getStart(source),
        end: expression.getEnd(),
        text: expression.getText(source),
      });
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return sites;
};

/** Rewrites every real `style={…}` site of the Modern button through `wrap`. */
const plantAtEveryStyleSite = (wrap) => (text) => {
  const sites = styleSites(text);
  assert.equal(sites.length, 2, `the Modern button has two \`style\` sites; the drill found ${sites.length}`);
  let planted = text;
  for (const site of [...sites].reverse()) {
    planted = `${planted.slice(0, site.start)}${wrap(site.text)}${planted.slice(site.end)}`;
  }
  assert.notEqual(planted, text, 'a wrapper that rewrites nothing plants nothing, and proves nothing');
  assert.deepEqual(
    styleSites(planted).map((site) => site.text),
    sites.map((site) => wrap(site.text)),
    'the drill must rewrite both real style sites, or it proves nothing',
  );
  return planted;
};

/** The planted expression: the site's own style value, plus what `extra` adds. */
const merged = (style, extra) => `{ ${[`...(${style})`, ...extra].join(', ')} }`;

const TRANSPARENT_WRAPPERS = [
  ['an `as` cast', (style, extra) => `${merged(style, extra)} as React.CSSProperties`],
  ['a parenthesis', (style, extra) => `(${merged(style, extra)})`],
  ['a `satisfies`', (style, extra) => `${merged(style, extra)} satisfies React.CSSProperties`],
  ['a parenthesised cast', (style, extra) => `((${merged(style, extra)}) as React.CSSProperties)`],
  ['a spread of a literal', (style, extra) => `{ ...(${style}), ...{ ${extra.join(', ')} } }`],
];

const AUTHORED_PAINT = ["color: 'red'"];
const RUNTIME_CHANNEL = ["'--ds-button-planted': pressMotion.variables['--ds-recipe-enter']"];

for (const [label, wrap] of TRANSPARENT_WRAPPERS) {
  test(`PLANT: authored paint behind ${label} is still BLOCKING`, () => {
    withPlantedFamily(
      (sandbox) => patch(sandbox, MODERN_TSX, plantAtEveryStyleSite((style) => wrap(style, AUTHORED_PAINT))),
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

test('CONTROL: the same wrappers WITHOUT authored paint are not a violation', () => {
  // Without this the drills above would pass for the wrong reason: the gate
  // could be refusing wrappers rather than refusing paint.
  for (const [label, wrap] of TRANSPARENT_WRAPPERS) {
    withPlantedFamily(
      (sandbox) => patch(sandbox, MODERN_TSX, plantAtEveryStyleSite((style) => wrap(style, []))),
      (findings, measured) => {
        assert.deepEqual(measured.blocking.inlineStyleViolations, [], `${label} is not itself a paint decision`);
        expectNoFinding(findings, 'BLOCKING inline paint', `${label} is not itself a paint decision`);
      },
    );
  }
});

test('CONTROL: a runtime `--ds-*` channel behind each wrapper is still allowed inline', () => {
  for (const [label, wrap] of TRANSPARENT_WRAPPERS) {
    withPlantedFamily(
      (sandbox) => patch(sandbox, MODERN_TSX, plantAtEveryStyleSite((style) => wrap(style, RUNTIME_CHANNEL))),
      (findings, measured) => {
        assert.deepEqual(
          measured.blocking.inlineStyleViolations,
          [],
          `a runtime-computed channel behind ${label} may travel inline`,
        );
        expectNoFinding(
          findings,
          'BLOCKING inline paint',
          `a runtime-computed channel behind ${label} may travel inline`,
        );
      },
    );
  }
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

/**
 * The 2026-09-08 review's mutant, planted as a drill: thirteen ORDINARY passing
 * files whose accessibility assertions all sit in callbacks nothing invokes.
 * The counter walked into those bodies and reported 26 executed assertions with
 * no finding, which is the same false green the `describe.skip` mirror proves
 * against -- reached through a shape a reader would call a normal test file.
 */
const UNCALLED_CALLBACK_TEST = [
  "import { describe, it, expect } from 'vitest';",
  "import { render, screen } from '@testing-library/react';",
  "import Button from '../index';",
  '',
  '// Declared, never invoked: the assertions below run in no case.',
  'function assertNamed(name: string) {',
  "  expect(screen.getByRole('button', { name })).toHaveAccessibleName(name);",
  '}',
  '',
  "describe('button', () => {",
  "  it('renders its label', () => {",
  '    const check = () => {',
  "      expect(screen.getByRole('button')).toHaveAccessibleName('Save');",
  '    };',
  '    void check;',
  '    void assertNamed;',
  '    render(<Button onFocus={() => screen.getByLabelText(\'Save\')}>Save</Button>);',
  "    expect(document.body.textContent).toContain('Save');",
  '  });',
  '});',
  '',
].join('\n');

/** The green twin: the SAME two callbacks, now called by the executing case. */
const CALLED_CALLBACK_TEST = UNCALLED_CALLBACK_TEST
  .replace('    void check;', '    check();')
  .replace('    void assertNamed;', "    assertNamed('Save');");

function withOnlyTestFile(contents, run) {
  withPlantedFamily(
    (sandbox) => {
      const dir = join(sandbox, TEST_DIR);
      for (const name of readdirSync(dir)) rmSync(join(dir, name), { force: true });
      writeFileSync(join(dir, 'Button.callback-shape.test.tsx'), contents);
    },
    run,
  );
}

test('PLANT: an accessibility assertion in a callback NOTHING invokes is not evidence', () => {
  withOnlyTestFile(UNCALLED_CALLBACK_TEST, (findings, measured) => {
    assert.equal(measured.blocking.a11yAssertions, 0, 'an uninvoked body executes no assertion');
    assert.equal(measured.blocking.a11yProbes, 0, 'a file that executes none of them is not a probe');
    expectFinding(
      findings,
      'owns no executable accessibility assertion',
      'a passing file whose a11y calls sit in uncalled callbacks is text, not evidence',
    );
  });
});

test('CONTROL: the SAME callbacks counted once the executing case calls them', () => {
  // Without this the drill above would pass for the wrong reason: a counter
  // that had simply stopped reading callbacks would also report zero.
  withOnlyTestFile(CALLED_CALLBACK_TEST, (findings, measured) => {
    // Two per callback: the role query and the name matcher.
    assert.equal(measured.blocking.a11yAssertions, 4, 'both invoked callbacks execute their assertions');
    assert.equal(measured.blocking.a11yProbes, 1);
    expectNoFinding(
      findings,
      'owns no executable accessibility assertion',
      'an invoked callback is executed accessibility evidence',
    );
  });
});

test('CONTROL: a callback the case passes to a caller still executes', () => {
  // `await waitFor(() => expect(...).toHaveFocus())` is the ordinary shape of a
  // real assertion, and it must keep counting: the rule is "reaching it runs
  // it", not "callbacks do not count".
  withOnlyTestFile([
    "import { describe, it, expect } from 'vitest';",
    "import { render, screen, waitFor } from '@testing-library/react';",
    "import Button from '../index';",
    '',
    "describe('button', () => {",
    "  it('takes focus', async () => {",
    '    render(<Button>Save</Button>);',
    "    await waitFor(() => expect(screen.getByRole('button')).toHaveFocus());",
    '  });',
    '});',
    '',
  ].join('\n'), (findings, measured) => {
    assert.equal(measured.blocking.a11yAssertions, 2, 'the query and the focus matcher both execute');
    expectNoFinding(findings, 'owns no executable accessibility assertion', 'a passed callback runs');
  });
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
  // exists: a family's own `compound/*` or `engines/*` folder may share a name.
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
  expectFinding(
    judgeFamily(measured, inflated),
    `\`readWithoutProducer\` SHRANK from 99 to ${measured.ratchets.readWithoutProducer}`,
    'good news still has to be written down',
  );
});

test('SHAPE: a moved denominator is reported before any ratchet is touched', () => {
  const measured = measureFamily(resolveFamily(FAMILY), { producers: PRODUCERS });
  const pinned = readBaseline().families[FAMILY];
  const moved = { ...pinned, denominators: { ...pinned.denominators, channelsRead: 1 } };
  // Derived, not restated: the drill asserts that the MEASURED census reaches
  // the finding, so a lot that legitimately moves the denominator re-anchors
  // one number (the pin) instead of two.
  expectFinding(
    judgeFamily(measured, moved),
    `denominator \`channelsRead\` moved from 1 to ${measured.denominators.channelsRead}`,
    're-read the census first',
  );
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

// ---------------------------------------------------------------------------
// Resolution: one owner per family, compounds only when nothing else claims them
// ---------------------------------------------------------------------------

/** Mirrors the calibration family and measures it with an explicit roster pin. */
function withResolvedSandbox(edit, pin, run) {
  const sandbox = mkdtempSync(join(tmpdir(), 'family-cut-resolve-'));
  try {
    for (const relativePath of SANDBOX_SOURCES) {
      const target = join(sandbox, relativePath);
      mkdirSync(dirname(target), { recursive: true });
      cpSync(join(ROOT, relativePath), target, { recursive: true });
    }
    edit(sandbox);
    const resolved = resolveFamily(FAMILY, sandbox, pin);
    const measured = measureFamily(resolved, { producers: PRODUCERS });
    run(judgeFamily(measured, readBaseline().families[FAMILY]), resolved);
  } finally {
    rmSync(sandbox, { recursive: true, force: true });
  }
}

const OWNER = 'src/components/primitives/inputs/button';
const plantSecondOwner = (sandbox) => {
  const second = join(sandbox, 'src/components/structures/headers/button');
  mkdirSync(second, { recursive: true });
  writeFileSync(join(second, 'index.tsx'), "export const HeaderButton = () => <header className=\"ds-header-button\" data-part=\"root\" />;\n");
};

test('PLANT: a second owner with the family name is BLOCKING without a roster pin', () => {
  withResolvedSandbox(plantSecondOwner, {}, (findings, resolved) => {
    assert.equal(resolved.ownerCandidates.length, 2);
    expectFinding(findings, 'resolves to 2 component owner(s)', 'two owners and no pin is a guess the gate refuses');
  });
});

test('CONTROL: the roster pin selects exactly the declared owner among the candidates', () => {
  withResolvedSandbox(plantSecondOwner, { owner: OWNER }, (findings, resolved) => {
    assert.deepEqual(resolved.ownerCandidates.length, 2);
    assert.equal(resolved.componentDirs.length, 1);
    expectNoFinding(findings, 'component owner(s)', 'a pinned owner among the candidates resolves');
    assert.deepEqual(findings, []);
  });
});

test('PLANT: a roster pin naming no candidate adds no owner and is BLOCKING', () => {
  withResolvedSandbox(() => {}, { owner: 'src/components/structures/headers/button' }, (findings, resolved) => {
    assert.equal(resolved.componentDirs.length, 0);
    expectFinding(findings, 'resolves to 0 component owner(s)', 'a pin cannot invent an owner');
  });
});

const plantPrefixedSkin = (sandbox) => {
  const skin = join(sandbox, 'src/foundation/tokens/css/presentation/components/skin/button-planted/index.css');
  mkdirSync(dirname(skin), { recursive: true });
  writeFileSync(skin, ".ds-button-group [data-part='planted'] { color: inherit; }\n");
};

test('CONTROL: a prefixed skin that selects a class the family names is its compound', () => {
  withResolvedSandbox(plantPrefixedSkin, {}, (findings, resolved) => {
    assert.ok(resolved.skins.some((file) => file.includes('button-planted')), 'the compound is measured');
    expectFinding(findings, 'denominator `skinFiles` moved', 'the compound enters the census');
  });
});

const plantSiblingOwner = (sandbox) => {
  const sibling = join(sandbox, 'src/components/primitives/inputs/button-planted');
  mkdirSync(sibling, { recursive: true });
  writeFileSync(join(sibling, 'index.tsx'), 'export const Planted = () => <span className="ds-button-planted" data-part="root" />;\n');
};

test('CONTROL: a sibling owner\'s skin that paints only its own classes is excluded, and the exclusion is reported', () => {
  withResolvedSandbox((sandbox) => {
    plantSiblingOwner(sandbox);
    const skin = join(sandbox, 'src/foundation/tokens/css/runtime/engines/modern/skin/button-planted/index.css');
    mkdirSync(dirname(skin), { recursive: true });
    writeFileSync(skin, ".ds-button-planted[data-part='root'] { color: var(--ds-button-planted-unproduced, var(--ds-color-primary)); }\n");
  }, {}, (findings, resolved) => {
    assert.ok(!resolved.skins.some((file) => file.includes('button-planted')), 'the sibling-only skin is not the button family');
    assert.match(resolved.foreignSkins[0].reason, /sibling family `button-planted`/u);
    assert.deepEqual(findings, []);
  });
});

test('PLANT: a sibling owner directory never discharges a skin that paints the measured family', () => {
  withResolvedSandbox((sandbox) => {
    plantSiblingOwner(sandbox);
    plantPrefixedSkin(sandbox);
  }, {}, (findings, resolved) => {
    assert.ok(resolved.skins.some((file) => file.includes('button-planted')), 'paint on .ds-button-group stays measured');
    assert.equal(resolved.foreignSkins.length, 0);
    expectFinding(findings, 'denominator `skinFiles` moved', 'the retained skin enters the census');
  });
});

test('PLANT: a sibling-named Modern skin reading an unproduced channel on the measured root turns the family red', () => {
  withResolvedSandbox((sandbox) => {
    plantSiblingOwner(sandbox);
    const skin = join(sandbox, 'src/foundation/tokens/css/runtime/engines/modern/skin/button-planted/index.css');
    mkdirSync(dirname(skin), { recursive: true });
    writeFileSync(skin, ".ds-button.ds-button--modern[data-part='root'] {\n  color: var(--ds-button-audit-unproduced, var(--ds-color-primary));\n}\n");
  }, {}, (findings, resolved) => {
    assert.ok(resolved.skins.some((file) => file.includes('button-planted')));
    expectFinding(findings, grew('readWithoutProducer'), 'the unproduced read is the button family\'s debt');
  });
});

test('PLANT: a prefixed skin that selects no class the family names is another owner\'s paint', () => {
  withResolvedSandbox((sandbox) => {
    const skin = join(sandbox, 'src/foundation/tokens/css/presentation/components/skin/button-planted/index.css');
    mkdirSync(dirname(skin), { recursive: true });
    writeFileSync(skin, ".ds-button-planted [data-part='planted'] { color: inherit; }\n");
  }, {}, (findings, resolved) => {
    assert.ok(!resolved.skins.some((file) => file.includes('button-planted')));
    assert.match(resolved.foreignSkins[0].reason, /selects no class/u);
    assert.deepEqual(findings, []);
  });
});

const plantSkinNamedAfterNoOwner = (sandbox, dir, css) => {
  const skin = join(sandbox, `src/foundation/tokens/css/presentation/components/skin/${dir}/index.css`);
  mkdirSync(dirname(skin), { recursive: true });
  writeFileSync(skin, css);
};

test("PLANT: a skin directory nobody owns does not make another owner's class this family's paint", () => {
  withResolvedSandbox((sandbox) => {
    plantSiblingOwner(sandbox);
    plantSkinNamedAfterNoOwner(
      sandbox,
      'button-planted-connector',
      ".rt-button-planted [data-part='planted'] { color: inherit; }\n",
    );
  }, {}, (findings, resolved) => {
    assert.ok(
      !resolved.skins.some((file) => file.includes('button-planted-connector')),
      "a skin named after no owner still paints the owner whose class it selects",
    );
    assert.match(
      resolved.foreignSkins.find((entry) => entry.skin.includes('button-planted-connector')).reason,
      /selects no class/u,
    );
    expectNoFinding(findings, grew('classVocabularies'), "a sibling's vocabulary never enters this family");
    expectNoFinding(findings, grew('legacyNamespaceClasses'), "nor does its legacy class");
    assert.deepEqual(findings, []);
  });
});

test('CONTROL: a class no owner claims stays this family\'s candidate whatever the skin directory is called', () => {
  withResolvedSandbox((sandbox) => {
    plantSiblingOwner(sandbox);
    plantSkinNamedAfterNoOwner(
      sandbox,
      'button-planted-connector',
      ".ds-button-unclaimed[data-part='root'] { color: var(--ds-button-audit-unproduced, var(--ds-color-primary)); }\n",
    );
  }, {}, (findings, resolved) => {
    assert.ok(
      resolved.skins.some((file) => file.includes('button-planted-connector')),
      'no owner is named button-unclaimed, so the paint stays the measured family\'s',
    );
    assert.deepEqual(resolved.foreignSkins, []);
    expectFinding(findings, 'denominator `classTokens` moved', 'the unclaimed paint enters this family\'s census');
  });
});

const plantTierSkin = (sandbox, dir, css) => {
  const skin = join(sandbox, `src/foundation/tokens/css/runtime/engines/modern/skin/${dir}/index.css`);
  mkdirSync(dirname(skin), { recursive: true });
  writeFileSync(skin, css);
};

test('PLANT: a `pattern-<family>` skin painting the family\'s tier class is the family\'s', () => {
  withResolvedSandbox((sandbox) => {
    plantTierSkin(
      sandbox,
      'pattern-button',
      ".ds-pattern-button[data-part='root'] { color: var(--ds-button-tier-unproduced, var(--ds-color-primary)); }\n",
    );
  }, {}, (findings, resolved) => {
    // A pattern names its skin and its class for the TIER, never for the owner;
    // reading the directory literally left those families measuring zero skins.
    assert.ok(resolved.skins.some((file) => file.includes('pattern-button')), 'the tier skin is measured');
    expectFinding(findings, grew('readWithoutProducer'), "the tier skin's debt is the family's");
  });
});

test("CONTROL: a `pattern-<other>` skin is still another family's", () => {
  withResolvedSandbox((sandbox) => {
    plantTierSkin(
      sandbox,
      'pattern-planted',
      ".ds-pattern-planted[data-part='root'] { color: inherit; }\n",
    );
  }, {}, (findings, resolved) => {
    assert.ok(!resolved.skins.some((file) => file.includes('pattern-planted')));
    assert.deepEqual(findings, []);
  });
});

const PLANTED_CRAFT = 'src/components/primitives/inputs/button/runtime/planted-craft/index.tsx';

/** A module that paints inline, and the two import shapes that decide its fate. */
const plantCraftModule = (sandbox, importers) => {
  const target = join(sandbox, PLANTED_CRAFT);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(
    target,
    "export const PlantedCraft = () => <span style={{ fontSize: '12px' }} />;\n",
  );
  for (const [relativePath, specifier] of importers) {
    const file = join(sandbox, relativePath);
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(
      file,
      `import { PlantedCraft } from '${specifier}';\nexport const Use = () => <PlantedCraft />;\n`,
    );
  }
};

test('PLANT: a module the LIVE engine imports is censused, inline paint and all', () => {
  withResolvedSandbox((sandbox) => {
    plantCraftModule(sandbox, [
      ['src/components/primitives/inputs/button/engines/classic/planted.tsx', '../../runtime/planted-craft'],
      ['src/components/primitives/inputs/button/engines/modern/planted.tsx', '../../runtime/planted-craft'],
    ]);
  }, {}, (findings, resolved) => {
    assert.ok(resolved.sources.some((file) => file.includes('planted-craft')), 'a live importer keeps it in');
    expectFinding(findings, 'BLOCKING inline paint', 'its paint is the family\'s to answer for');
  });
});

test('CONTROL: a module only the FROZEN engines import leaves the census with its paint', () => {
  withResolvedSandbox((sandbox) => {
    plantCraftModule(sandbox, [
      ['src/components/primitives/inputs/button/engines/classic/planted.tsx', '../../runtime/planted-craft'],
      ['src/components/primitives/inputs/button/engines/rustic/planted.tsx', '../../runtime/planted-craft'],
    ]);
  }, {}, (findings, resolved) => {
    assert.ok(
      !resolved.sources.some((file) => file.includes('planted-craft')),
      'classic and rustic are already out by name; what only they paint through goes with them',
    );
    expectNoFinding(findings, 'BLOCKING inline paint', 'a frozen-only module raises nothing');
  });
});

test('CONTROL: a module nobody imports stays in the census', () => {
  withResolvedSandbox((sandbox) => {
    plantCraftModule(sandbox, []);
  }, {}, (findings, resolved) => {
    assert.ok(
      resolved.sources.some((file) => file.includes('planted-craft')),
      'the exclusion is earned by a frozen-only consumer graph, never by the absence of one',
    );
    expectFinding(findings, 'BLOCKING inline paint', 'an unimported module is still the family\'s');
  });
});

test('CONTROL: a data-only row that declares the family and produces no channel is not a fan-out claim', () => {
  const catalog = [{
    id: 'recipe-profile',
    effect: 'data-only',
    produces: { channels: [], rootAttributes: [] },
    minimumFamilies: { kind: 'declared-fan-out', families: [FAMILY] },
  }];
  assert.deepEqual(fanOutFor(FAMILY, new Set(), catalog), []);
});

test('PLANT: emptying produces.channels alone does not close the claim -- a css-channels row with no channel is still unreached', () => {
  const catalog = [{
    id: 'recipe-profile',
    effect: 'css-channels',
    produces: { channels: [], rootAttributes: [] },
    minimumFamilies: { kind: 'declared-fan-out', families: [FAMILY] },
  }];
  const rows = fanOutFor(FAMILY, new Set(), catalog);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].unreached, true);
});

test('LIVE: the real recipe-profile row is data-only, so no family under the cut carries it as an unreached claim', () => {
  for (const family of Object.keys(readBaseline().families)) {
    assert.deepEqual(fanOutFor(family, new Set()).filter((row) => row.control === 'recipe-profile'), [], family);
  }
});
