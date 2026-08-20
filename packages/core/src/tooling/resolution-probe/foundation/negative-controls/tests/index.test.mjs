/**
 * @fileoverview Negative drills for the declared negative-control resolver.
 *
 * Run: node --test src/tooling/resolution-probe/foundation/negative-controls/tests/index.test.mjs
 *
 * These drills read the REAL modern-rescue manifest rather than a fixture copy.
 * A resolver tested against its own idea of the manifest is a resolver that
 * cannot notice the manifest changing, and the whole point of sourcing the list
 * from the contract is that the harness follows it rather than remembering it.
 *
 * @module Tooling/ResolutionProbe/Foundation/NegativeControls/Tests
 */

import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { test } from 'node:test';

import { CORE_ROOT } from '../../paths/index.mjs';
import { assertKnownTargetKeys } from '../../roster/index.mjs';
import {
  assertNegativeControlsHeld,
  declaredPhrasesFor,
  expandFixturesForNegativeControls,
  NEGATIVE_CONTROL_VOCABULARY,
  readManifest,
  requireResolvedNegativeControls,
  resolveNegativeControls,
} from '../index.mjs';

const MANIFEST_ROOT = resolve(CORE_ROOT, 'manifest');
const CONTROL_MANIFEST = readManifest(resolve(MANIFEST_ROOT, 'controls/spacing.rhythm.json'));
const FLEX_MANIFEST = readManifest(resolve(MANIFEST_ROOT, 'families/primitive/layout/flex.json'));

const SCOPE = 'rottay/light/modern/both';

/** The eight the control file declares today, verbatim. */
const CONTROL_LEVEL_IDS = [
  'numeric-instance-gaps-exact',
  'control-height-fixed',
  'touch-target-fixed',
  'icon-size-fixed',
  'font-metrics-fixed',
  'color-fixed',
  'border-fixed',
  'motion-fixed',
];

// Every target below MUST belong to FIXTURE_IDS (foundation/roster) --
// enforced mechanically below. `button-modern-md/hitbox` is the button's own
// hit area (no separate expanded touch wrapper exists in the modern engine's
// markup) and also stands in for `icon-size-fixed`: no fixture in this
// checkpoint renders a real icon, so this exercises the code path with a
// real, resolvable target rather than a fabricated one, not a semantic claim
// about icon geometry.
const BINDINGS = {
  'numeric-instance-gaps-exact': ['flex-modern-numeric-gap/root'],
  'control-height-fixed': ['button-modern-md/hitbox'],
  'touch-target-fixed': ['button-modern-md/hitbox'],
  'icon-size-fixed': ['button-modern-md/hitbox'],
  'flex-root-non-spacing-geometry-unchanged': ['flex-modern-preset-gap/root'],
};

test('every BINDINGS target names a real fixture/target pair, not a fabricated one', () => {
  // Before this existed, BINDINGS named `flex-numeric-gap/root`, `button/root`
  // and `icon/root` -- none of which the roster ever declared. Mechanical
  // enforcement, not a convention: assertKnownTargetKeys throws naming the
  // offending key.
  assert.doesNotThrow(() => assertKnownTargetKeys(Object.values(BINDINGS).flat(), { context: 'BINDINGS' }));
});

test('negative drill: assertKnownTargetKeys refuses a fabricated fixture/target pair', () => {
  assert.throws(
    () => assertKnownTargetKeys(['icon/root'], { context: 'BINDINGS' }),
    /does not declare: icon\/root/,
  );
});

test('the list comes from the manifest, not from this harness', () => {
  const declared = declaredPhrasesFor({
    controlManifest: CONTROL_MANIFEST,
    familyManifest: FLEX_MANIFEST,
    controlId: 'spacing.rhythm',
  });
  assert.deepEqual(declared.controlPhrases, CONTROL_MANIFEST.calibration.negativeControls);
  assert.ok(declared.controlPhrases.length >= 8, 'the control declares its own negative controls');
  assert.equal(declared.familyId, 'primitive/layout/flex');
  assert.ok(
    declared.effective.length > declared.controlPhrases.length,
    'a family that narrows the claim adds rows; it never escapes the control list',
  );
});

test('positive control: every control-level phrase resolves to a checkable property set', () => {
  const resolution = resolveNegativeControls({
    phrases: CONTROL_MANIFEST.calibration.negativeControls,
    bindings: BINDINGS,
  });
  assert.deepEqual(resolution.unresolved, []);
  assert.deepEqual(resolution.unbound, []);
  assert.deepEqual(
    resolution.resolved.map((entry) => entry.id).sort(),
    [...CONTROL_LEVEL_IDS].sort(),
  );
  assert.equal(resolution.complete, true);
});

test('negative drill: a phrase with NO vocabulary entry is named, never dropped', () => {
  const resolution = resolveNegativeControls({
    phrases: ['motion remains fixed', 'the vibe stays premium'],
    bindings: BINDINGS,
  });
  assert.equal(resolution.complete, false);
  assert.equal(resolution.unresolved.length, 1);
  assert.equal(resolution.unresolved[0].phrase, 'the vibe stays premium');
  assert.equal(
    resolution.resolved.length,
    1,
    'the resolvable half still resolves; the run fails on the half it cannot read',
  );
});

test('negative drill: a declared-targets control the run did not BIND fails closed', () => {
  const resolution = resolveNegativeControls({
    phrases: ['control height remains fixed'],
    bindings: {},
  });
  assert.deepEqual(resolution.resolved, []);
  assert.equal(resolution.unbound.length, 1);
  assert.equal(resolution.unbound[0].id, 'control-height-fixed');
  assert.match(resolution.unbound[0].reason, /would check nothing while reporting that it checked/);
});

test('negative drill: a control that HAS negative controls and a run that resolved none fails', () => {
  const declared = declaredPhrasesFor({
    controlManifest: CONTROL_MANIFEST,
    familyManifest: null,
    controlId: 'spacing.rhythm',
  });
  const gate = requireResolvedNegativeControls({
    declared,
    resolution: { resolved: [], unresolved: [], unbound: [] },
  });
  assert.equal(gate.ok, false);
  assert.equal(gate.failures[0].kind, 'no-negative-controls-resolved');
  assert.equal(gate.failures[0].declaredCount, declared.effective.length);
});

test('a run without the control manifest is refused rather than run with no negative controls', () => {
  assert.throws(
    () => declaredPhrasesFor({ controlManifest: null, controlId: 'spacing.rhythm' }),
    /needs the control manifest/,
  );
});

test('positive control: negative controls that did not move are held', () => {
  const resolution = resolveNegativeControls({
    phrases: ['color remains fixed', 'control height remains fixed'],
    bindings: BINDINGS,
  });
  const result = assertNegativeControlsHeld({
    resolved: resolution.resolved,
    movements: {
      [SCOPE]: {
        'flex-modern-preset-gap/root': {
          gap: { moved: true, from: '16px', to: '19.2px' },
          color: { moved: false, value: 'rgb(20, 20, 20)' },
        },
        'button-modern-md/hitbox': {
          'block-size': { moved: false, value: '40px' },
          height: { moved: false, value: '40px' },
          'min-block-size': { moved: false, value: '40px' },
          'min-height': { moved: false, value: '40px' },
          'max-block-size': { moved: false, value: 'none' },
          'max-height': { moved: false, value: 'none' },
          'aspect-ratio': { moved: false, value: 'auto' },
          scale: { moved: false, value: 'none' },
          zoom: { moved: false, value: '1' },
          'contain-intrinsic-size': { moved: false, value: 'none' },
          '@rect-inline-size': { moved: false, value: '96' },
          '@rect-block-size': { moved: false, value: '40' },
          color: { moved: false, value: 'rgb(255, 255, 255)' },
        },
      },
    },
  });
  assert.equal(result.held, true, JSON.stringify(result.violations));
  assert.ok(result.checkedRows > 0, 'a negative control nobody measured has not held');
});

test('the browser plan is expanded with every declared negative property before measurement', () => {
  const resolution = resolveNegativeControls({
    phrases: ['color remains fixed', 'control height remains fixed'],
    bindings: BINDINGS,
  });
  const fixtures = expandFixturesForNegativeControls({
    fixtures: [
      {
        id: 'flex-modern-preset-gap',
        targets: [{ id: 'root', selector: '[data-probe=x]', properties: ['gap'] }],
      },
      {
        id: 'button-modern-md',
        targets: [{ id: 'hitbox', selector: '[data-probe=y]', properties: ['block-size'] }],
      },
    ],
    resolved: resolution.resolved,
  });
  assert.ok(fixtures[0].targets[0].properties.includes('background-color'));
  assert.ok(fixtures[1].targets[0].properties.includes('@rect-block-size'));
  assert.ok(fixtures[1].targets[0].properties.includes('color'));
  assert.deepEqual(fixtures[0].targets[0].properties.slice(0, 1), ['gap']);
});

test('negative drill: an every-target property promised by the plan but absent from readings fails', () => {
  const resolution = resolveNegativeControls({ phrases: ['color remains fixed'], bindings: BINDINGS });
  const result = assertNegativeControlsHeld({
    resolved: resolution.resolved,
    movements: {
      [SCOPE]: {
        'flex-modern-preset-gap/root': { color: { moved: false, value: 'black' } },
      },
    },
    plan: [
      {
        fixtureId: 'flex-modern-preset-gap',
        targetId: 'root',
        properties: ['color', 'background-color'],
      },
    ],
  });
  assert.equal(result.held, false);
  assert.ok(
    result.violations.some(
      (row) => row.kind === 'unmeasured' && row.property === 'background-color',
    ),
  );
});

test('negative drill: a MOVED negative control fails and names control, target, property and values', () => {
  const resolution = resolveNegativeControls({
    phrases: ['control height remains fixed'],
    bindings: BINDINGS,
  });
  const result = assertNegativeControlsHeld({
    resolved: resolution.resolved,
    movements: {
      [SCOPE]: {
        'button-modern-md/hitbox': {
          'block-size': { moved: true, from: '40px', to: '48px' },
          height: { moved: false, value: '40px' },
          'min-block-size': { moved: false, value: '40px' },
          'min-height': { moved: false, value: '40px' },
          'max-block-size': { moved: false, value: 'none' },
          'max-height': { moved: false, value: 'none' },
          'aspect-ratio': { moved: false, value: 'auto' },
          scale: { moved: false, value: 'none' },
          zoom: { moved: false, value: '1' },
          'contain-intrinsic-size': { moved: false, value: 'none' },
          '@rect-inline-size': { moved: false, value: '96' },
          '@rect-block-size': { moved: false, value: '40' },
        },
      },
    },
  });
  assert.equal(result.held, false);
  assert.equal(result.violations.length, 1);
  assert.deepEqual(
    {
      kind: result.violations[0].kind,
      negativeControl: result.violations[0].negativeControl,
      target: result.violations[0].target,
      property: result.violations[0].property,
      from: result.violations[0].from,
      to: result.violations[0].to,
    },
    {
      kind: 'moved',
      negativeControl: 'control-height-fixed',
      target: 'button-modern-md/hitbox',
      property: 'block-size',
      from: '40px',
      to: '48px',
    },
  );
});

test('negative drill: a bound negative control that was never MEASURED is a violation, not a pass', () => {
  const resolution = resolveNegativeControls({
    phrases: ['control height remains fixed'],
    bindings: BINDINGS,
  });
  const result = assertNegativeControlsHeld({
    resolved: resolution.resolved,
    movements: { [SCOPE]: { 'flex-modern-preset-gap/root': { gap: { moved: true, from: '16px', to: '19.2px' } } } },
  });
  assert.equal(result.held, false);
  assert.equal(result.violations[0].kind, 'unmeasured');
  assert.equal(result.violations[0].target, 'button-modern-md/hitbox');
});

test('the vocabulary declares what a phrase does NOT mechanise, instead of implying full cover', () => {
  const partial = NEGATIVE_CONTROL_VOCABULARY.filter(
    (entry) => entry.partiallyMechanised.length > 0,
  );
  assert.ok(
    partial.length > 0,
    'phrases like "separator count" and "item spans" are not computed properties; the entry has ' +
      'to say so rather than quietly checking a subset',
  );
  for (const entry of NEGATIVE_CONTROL_VOCABULARY) {
    assert.equal(entry.assertion, 'did-not-move');
    assert.ok(entry.properties.length > 0, `${entry.id} forbids no property`);
    assert.ok(['every-measured-target', 'declared-targets'].includes(entry.targetScope));
  }
});

// -----------------------------------------------------------------------------
// Honesty check: the CSS-only boundary, made explicit rather than assumed.
//
// `runtime/bundle` resolves `.css` imports and `foundation/roster` substring-
// checks selectors against composed CSS (README.md, "What it cannot see") --
// this harness therefore CANNOT see a gated property set as an inline style
// from `.ts`/`.tsx`. That gap is not closeable from here (this instrument is
// CSS-measurement only, by design, and this file may only READ outside its
// own tree, never edit). What follows makes the gap BOUNDED instead of
// silently assumed away: it records exactly which inline style carriers exist
// for a gated property name, in the modern-engine sources the REAL fixture
// roster measures, so "CSS-only" is a checked, stated scope rather than an
// unchecked claim. A carrier existing here is not, by itself, evidence that
// any control reaches it -- only that this harness's CSS-only view could not
// have told either way.
// -----------------------------------------------------------------------------

/**
 * The modern-engine sources of the components the real roster measures
 * (`foundation/roster/fixtures.json`): Card, Button, Input, Skeleton and the
 * four layout primitives. Deliberately not "every engines/modern directory"
 * -- bounded to what this roster claims to speak for, and the bound is
 * reported (`scannedRoots`) rather than implied to be a repository-wide
 * sweep it did not do.
 */
const INLINE_STYLE_SCAN_ROOTS = Object.freeze([
  'src/ui/primitives/layout/Flex/engines/modern',
  'src/ui/primitives/layout/Grid/engines/modern',
  'src/ui/primitives/layout/Stack/engines/modern',
  'src/ui/primitives/layout/Space/engines/modern',
  'src/ui/primitives/inputs/Button/engines/modern',
  'src/ui/primitives/inputs/Input/engines/modern',
  'src/ui/primitives/display/Card/engines/modern',
  'src/ui/primitives/feedback/Skeleton/engines/modern',
]);

function gatedPropertyNames() {
  const names = new Set();
  for (const entry of NEGATIVE_CONTROL_VOCABULARY) {
    for (const property of entry.properties) names.add(property);
  }
  return [...names].sort();
}

function toKebabCase(name) {
  return name.startsWith('--') ? name : name.replace(/[A-Z]/gu, (letter) => `-${letter.toLowerCase()}`);
}

function lineAt(text, index) {
  let line = 1;
  for (let cursor = 0; cursor < index; cursor += 1) {
    if (text.charCodeAt(cursor) === 10) line += 1;
  }
  return line;
}

/** The matching `}` for a `{` at `openIndex`, brace-counted (no string/comment awareness). */
function matchingBraceEnd(text, openIndex) {
  let depth = 0;
  let index = openIndex;
  for (; index < text.length; index += 1) {
    const char = text[index];
    if (char === '{') depth += 1;
    else if (char === '}') {
      depth -= 1;
      if (depth === 0) return index;
    }
  }
  return text.length - 1;
}

const OBJECT_KEY = /(?:^|[{,])\s*(?:'([^']+)'|"([^"]+)"|([A-Za-z_$][A-Za-z0-9_$]*))\s*:/g;
const SET_PROPERTY_CALL = /\.style\.setProperty\(\s*['"]([^'"]+)['"]/g;
const STYLE_MEMBER_ASSIGN = /\.style\.([A-Za-z][A-Za-z0-9]*)\s*=(?!=)/g;
const JSX_STYLE_REF = /\bstyle=\{\s*([A-Za-z_$][A-Za-z0-9_$]*)\s*\}/g;

function keysOfObjectBody(text, bodyStart, bodyEnd) {
  const body = text.slice(bodyStart, bodyEnd + 1);
  const keys = [];
  OBJECT_KEY.lastIndex = 0;
  let match;
  while ((match = OBJECT_KEY.exec(body))) keys.push(match[1] ?? match[2] ?? match[3]);
  return keys;
}

/**
 * Best-effort, regex scan of one file's text for inline style carriers.
 *
 * Three carrier shapes, matched textually rather than parsed:
 *   1. a JSX `style={{ ... }}` object literal -- keys read directly;
 *   2. a local `const NAME = {...}` (NAME containing "style", this codebase's
 *      own convention -- `modernStyle`, `computedStyle`, `interactiveStyle`,
 *      `cardStyle`) later referenced as `style={NAME}`: keys read from the
 *      literal, AND every later `NAME.camelCaseProp = value` assignment
 *      (Grid's modern engine builds its style object exactly this way);
 *   3. direct DOM style writes: `.style.setProperty('name', ...)` and
 *      `.style.camelCaseProp = value`.
 *
 * NOT resolved, by design (see the drill's `limitations` output): spreads
 * (`...someProp`), `Object.assign(target, style)`, computed keys, and
 * anything inside a string/template literal that happens to contain a brace.
 */
function findInlineStyleHits(text) {
  const hits = [];

  let literalStart = text.indexOf('style={{');
  while (literalStart !== -1) {
    const bodyStart = literalStart + 'style={{'.length - 1;
    const bodyEnd = matchingBraceEnd(text, bodyStart);
    for (const raw of keysOfObjectBody(text, bodyStart, bodyEnd)) {
      hits.push({ property: toKebabCase(raw), kind: 'jsx-style-object', line: lineAt(text, literalStart) });
    }
    literalStart = text.indexOf('style={{', bodyEnd + 1);
  }

  const styleIdentifiers = new Set();
  JSX_STYLE_REF.lastIndex = 0;
  let jsxRefMatch;
  while ((jsxRefMatch = JSX_STYLE_REF.exec(text))) styleIdentifiers.add(jsxRefMatch[1]);
  const declarationScan = /\b(?:const|let)\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*(?::[^=]+)?=\s*\{/g;
  let declMatch;
  while ((declMatch = declarationScan.exec(text))) {
    if (/style/iu.test(declMatch[1])) styleIdentifiers.add(declMatch[1]);
  }

  for (const identifier of styleIdentifiers) {
    const declPattern = new RegExp(`\\b(?:const|let)\\s+${identifier}\\s*(?::[^=]+)?=\\s*\\{`, 'gu');
    let match;
    while ((match = declPattern.exec(text))) {
      const bodyStart = match.index + match[0].length - 1;
      const bodyEnd = matchingBraceEnd(text, bodyStart);
      for (const raw of keysOfObjectBody(text, bodyStart, bodyEnd)) {
        hits.push({
          property: toKebabCase(raw),
          kind: 'local-style-object',
          line: lineAt(text, match.index),
        });
      }
    }

    const assignPattern = new RegExp(`\\b${identifier}\\.([A-Za-z_$][A-Za-z0-9_$]*)\\s*=(?!=)`, 'gu');
    let assignMatch;
    while ((assignMatch = assignPattern.exec(text))) {
      hits.push({
        property: toKebabCase(assignMatch[1]),
        kind: 'local-style-object-assignment',
        line: lineAt(text, assignMatch.index),
      });
    }
  }

  SET_PROPERTY_CALL.lastIndex = 0;
  let setMatch;
  while ((setMatch = SET_PROPERTY_CALL.exec(text))) {
    hits.push({ property: setMatch[1], kind: 'dom-style.setProperty', line: lineAt(text, setMatch.index) });
  }

  STYLE_MEMBER_ASSIGN.lastIndex = 0;
  let styleAssignMatch;
  while ((styleAssignMatch = STYLE_MEMBER_ASSIGN.exec(text))) {
    hits.push({
      property: toKebabCase(styleAssignMatch[1]),
      kind: 'dom-style-assignment',
      line: lineAt(text, styleAssignMatch.index),
    });
  }

  return hits;
}

function walkSourceFiles(directory) {
  const found = [];
  if (!existsSync(directory)) return found;
  const walk = (current) => {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        if (['tests', '__tests__', 'stories'].includes(entry.name)) continue;
        walk(resolve(current, entry.name));
        continue;
      }
      if (!entry.isFile() || !/\.(tsx|ts)$/u.test(entry.name)) continue;
      if (entry.name.includes('.test.') || entry.name.includes('.stories.')) continue;
      found.push(resolve(current, entry.name));
    }
  };
  walk(directory);
  return found;
}

function scanInlineStyleCarriers({
  roots = INLINE_STYLE_SCAN_ROOTS,
  coreRoot = CORE_ROOT,
  gatedProperties = gatedPropertyNames(),
} = {}) {
  const gated = new Set(gatedProperties);
  const carriers = [];
  const filesScanned = [];
  for (const root of roots) {
    for (const file of walkSourceFiles(resolve(coreRoot, root))) {
      const relativePath = relative(coreRoot, file).split('\\').join('/');
      filesScanned.push(relativePath);
      const text = readFileSync(file, 'utf-8');
      for (const hit of findInlineStyleHits(text)) {
        if (gated.has(hit.property)) carriers.push({ file: relativePath, ...hit });
      }
    }
  }
  return {
    scannedRoots: [...roots],
    filesScanned: filesScanned.sort(),
    gatedProperties: [...gated].sort(),
    carriers,
    limitations: [
      'Regex-based, not a parser: a style object assembled from a spread variable ' +
        '(`...someProp`), `Object.assign(target, style)`, a computed key (`[name]: value`), a ' +
        "styled-components/emotion template, or `el.style.cssText = ...` is not detected. Button " +
        "and Input's own inline style objects in this roster ARE built entirely from spreads " +
        "(`{ ...pressMotion.variables, ...style }` / a bare forwarded `style` prop), so an empty " +
        'result for those two files means "nothing textually resolvable was found", not "proven ' +
        'absent".',
      `Scoped to the modern-engine sources of the components the real fixture roster measures ` +
        `(${INLINE_STYLE_SCAN_ROOTS.length} root(s)): Card, Button, Input, Skeleton, Flex, Grid, ` +
        'Stack, Space. A gated property set inline by any other component is out of scope for ' +
        'this check and is not claimed either way.',
      'A property name match is textual: it does not evaluate whether the carrier actually runs ' +
        'for the fixture shape this harness measures (a conditional branch, a default prop ' +
        'value), only that the source contains an assignment or object key with that name.',
      'Brace-balancing has no string/template-literal/comment awareness, so a `{`/`}` character ' +
        'inside a string within a matched object would desynchronise the scan for that carrier.',
    ],
  };
}

test('honesty check: the CSS-only claim is bounded against real inline style carriers, not assumed', () => {
  const result = scanInlineStyleCarriers();
  assert.ok(result.scannedRoots.length > 0);
  assert.ok(result.filesScanned.length > 0, 'the scan roots must resolve to real files, or this check proves nothing');
  assert.ok(result.gatedProperties.includes('min-inline-size'));
  assert.ok(
    result.gatedProperties.includes('scale') && result.gatedProperties.includes('contain-intrinsic-size'),
    'the newly gated indirect-size properties must be part of what this check gates too',
  );
  assert.ok(
    result.limitations.length > 0,
    'a regex scan must say what it cannot see, the same law the browser harness itself follows',
  );
  // Every carrier this scan reports names a real gated property on a real
  // scanned file -- `carriers` is never a list this check merely asserts
  // without being able to point at the row.
  for (const carrier of result.carriers) {
    assert.ok(result.gatedProperties.includes(carrier.property), JSON.stringify(carrier));
    assert.ok(result.filesScanned.includes(carrier.file), JSON.stringify(carrier));
    assert.ok(carrier.line > 0, JSON.stringify(carrier));
  }
  // Measured, 2026-08-11: Flex's modern engine unconditionally inlines
  // `min-inline-size: 0` (a fixed anti-overflow floor, not derived from any
  // control -- `primitives/layout/Flex/engines/modern/index.tsx`, `const
  // modernStyle = { minInlineSize: 0, ...resolvedStyle }`). That is exactly
  // the kind of carrier this harness's CSS-only view cannot see, recorded
  // here so the "CSS-only" claim stays bounded rather than silently
  // overstated. It is not, by itself, evidence that any control reaches it.
  assert.ok(
    result.carriers.some(
      (carrier) => carrier.property === 'min-inline-size' && carrier.file.includes('Flex/engines/modern'),
    ),
    'this is a KNOWN carrier as of 2026-08-11; if it is gone, the scanner or the component ' +
      'changed -- update this assertion to whatever scanInlineStyleCarriers() now finds instead ' +
      'of deleting it',
  );
});
