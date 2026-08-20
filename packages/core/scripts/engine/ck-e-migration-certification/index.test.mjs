import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import postcss from 'postcss';
import { packageRoot as findPackageRoot } from '../../lib/repo-root/index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const packageRoot = findPackageRoot(HERE);
const cssRoot = join(packageRoot, 'src/foundation/tokens/css');

const skins = [
  {
    path: 'presentation/components/skin/chart-foundation.css',
    anchors: [
      '.ds-chart-scaffold',
      '.ds-chart-frame',
      '.ds-chart-data-access',
      '.ds-chart-renderer',
      '.ds-chart-renderer-bar',
      '.ds-chart-renderer-heatmap',
      '.ds-chart-renderer-line',
      '.ds-chart-renderer-pie',
      '.ds-chart-renderer-scatter',
      '.ds-chart-metric-trend',
      '.ds-chart-ranked-rows',
      '.ds-chart-brush',
      '.ds-chart-tooltip',
      '.ds-chart-tooltip-value',
      '.ds-chart-tooltip-series',
    ],
  },
  { path: 'presentation/components/skin/chart-area.css', anchors: ['.ds-chart-area'] },
  { path: 'presentation/components/skin/chart-bar.css', anchors: ['.ds-chart-bar'] },
  { path: 'presentation/components/skin/chart-bullet.css', anchors: ['.ds-chart-bullet'] },
  { path: 'presentation/components/skin/chart-calendar-heatmap.css', anchors: ['.ds-chart-calendar-heatmap'] },
  { path: 'presentation/components/skin/chart-gantt.css', anchors: ['.ds-chart-gantt'] },
  { path: 'presentation/components/skin/chart-heatmap.css', anchors: ['.ds-chart-heatmap'] },
  { path: 'presentation/components/skin/chart-line.css', anchors: ['.ds-chart-line'] },
  { path: 'presentation/components/skin/chart-pie.css', anchors: ['.ds-chart-pie'] },
  { path: 'presentation/components/skin/chart-radar.css', anchors: ['.ds-chart-radar'] },
  { path: 'presentation/components/skin/chart-treemap.css', anchors: ['.ds-chart-treemap'] },
  { path: 'presentation/components/skin/chart-waterfall.css', anchors: ['.ds-chart-waterfall'] },
  {
    path: 'presentation/components/skin/chart-c.css',
    anchors: [
      '.ds-chart-histogram',
      '.ds-chart-scatter',
      '.ds-chart-gauge',
      '.ds-chart-sankey',
      '.ds-chart-sparkline',
      '.ds-chart-funnel',
      '.ds-chart-network-graph',
    ],
  },
  { path: 'runtime/engines/modern/skin/pattern-calendar-view.css', anchors: ['.ds-pattern-calendar-view.ds-engine-modern'] },
  { path: 'runtime/engines/rustic/skin/pattern-calendar-view.css', anchors: ['.ds-pattern-calendar-view.ds-engine-rustic'] },
  { path: 'runtime/engines/modern/skin/pattern-kanban-board.css', anchors: ['.ds-pattern-kanban-board.ds-engine-modern'] },
  { path: 'runtime/engines/rustic/skin/pattern-kanban-board.css', anchors: ['.ds-pattern-kanban-board.ds-engine-rustic'] },
  { path: 'runtime/engines/modern/skin/pattern-map-view.css', anchors: ['.ds-pattern-map-view.ds-engine-modern'] },
  { path: 'runtime/engines/rustic/skin/pattern-map-view.css', anchors: ['.ds-pattern-map-view.ds-engine-rustic'] },
  { path: 'runtime/engines/modern/skin/pattern-timeline.css', anchors: ['.ds-pattern-timeline.ds-engine-modern'] },
  { path: 'runtime/engines/rustic/skin/pattern-timeline.css', anchors: ['.ds-pattern-timeline.ds-engine-rustic'] },
  { path: 'runtime/engines/modern/skin/pattern-tree-view.css', anchors: ['.ds-pattern-tree-view.ds-engine-modern'] },
  { path: 'runtime/engines/rustic/skin/pattern-tree-view.css', anchors: ['.ds-pattern-tree-view.ds-engine-rustic'] },
];

const entrypoints = [
  { name: 'styles.css', path: join(cssRoot, 'facade/entrypoints/styles.css') },
  { name: 'facade/entrypoints/base.css', path: join(cssRoot, 'facade/entrypoints/base.css') },
];

function isInsideKeyframes(rule) {
  for (let parent = rule.parent; parent; parent = parent.parent) {
    if (parent.type === 'atrule' && /keyframes$/i.test(parent.name)) return true;
  }
  return false;
}

// Ownership is proven by an explicit boundary, never by the absence of one. A
// CSS identifier continues through far more than ASCII `[A-Za-z0-9_-]`: any
// code point above ASCII (`.ds-chart-scaffoldé`) and any backslash escape
// (`.ds-chart-scaffold\72 ogue`) also extend the class name, so a deny-list of
// ASCII identifier bytes would hand those unrelated classes to the anchor.
//
// Admitted after the anchor: only end-of-selector, or a character that can do
// nothing but begin the next selector token — whitespace, a combinator, a class
// dot, an id hash, an attribute bracket, or a pseudo colon. Deliberately NOT
// admitted: backslash and non-ASCII (identifier continuations), ASCII
// identifier characters including `-` and `_`, and `,` `)` `=` (they would mean
// the anchor was read out of a selector list, a nested function, or an
// attribute value rather than owning the selector).
//
// "Whitespace" there means CSS whitespace, which is exactly five code points —
// TAB U+0009, LF U+000A, FF U+000C, CR U+000D, SPACE U+0020 (CSS Syntax L3
// §4.2). JavaScript's `\s` is a much wider set: it over-matches by twenty
// further code points — VT U+000B, plus NBSP U+00A0, U+1680, the U+2000–U+200A
// block, U+2028, U+2029, U+202F, U+205F, U+3000 and the BOM U+FEFF. Not one of
// them separates CSS selector tokens, and the nineteen above ASCII are
// identifier CONTINUATIONS under the rule stated above. Spelling this position
// `\s` would therefore contradict the very law it enforces, reading
// `.ds-chart-scaffold<NBSP>rogue` — one single class — as the anchor followed
// by a safe delimiter.
//
// So every position in this file that means "CSS selector whitespace" spells
// the five characters out as `[ \t\n\f\r]` and never uses `\s`. (`[\s\S]` is a
// different idiom — the any-code-point wildcard — and carries no whitespace
// meaning; it stays.)
const SAFE_ANCHOR_BOUNDARY = /[ \t\n\f\r>+~.#[:]/;

function endsOnSafeBoundary(text, index) {
  return index === text.length || SAFE_ANCHOR_BOUNDARY.test(text.charAt(index));
}

// `String.prototype.trim` strips the wide JS whitespace set, NBSP included, so
// it cannot be used to normalize a captured scope before ownership is decided:
// it would silently delete the very identifier continuation the boundary rule
// exists to catch, handing `:where(.ds-chart-scaffold<NBSP>)` — really the class
// `ds-chart-scaffold<NBSP>` — to `.ds-chart-scaffold`. Trim on CSS whitespace
// only, at every site that feeds `ownsScope`.
const CSS_WHITESPACE_EDGES = /^[ \t\n\f\r]+|[ \t\n\f\r]+$/g;

function cssTrim(text) {
  return text.replace(CSS_WHITESPACE_EDGES, '');
}

// The same law binds how a selector list is taken apart, and this is where the
// gate's own productive path leaked. PostCSS's `rule.selectors` getter splits
// `rule.selector` on commas and applies JavaScript `String.prototype.trim` to
// each arm, so it destroys the very code points the boundary rule exists to
// judge before the predicate is ever consulted: parsing
// `.ds-chart-scaffold<NBSP> { color: red }` leaves the NBSP intact in
// `rule.selector` — the real class is `ds-chart-scaffold<NBSP>` — yet
// `rule.selectors[0]` is already the bare anchor `.ds-chart-scaffold`, and the
// scan goes falsely green. `rule.selectors` and JS `trim` are therefore banned
// from every ownership path in this file; the raw `rule.selector` is split here
// instead and normalized only with `cssTrim`.
//
// Splitting raw text means the splitter must know where a comma cannot mean
// "next selector": inside a string (`[data-part=','] `), inside a functional
// pseudo (`:is(.a, .b)`), behind a backslash escape (`.a\,b`), inside a
// bracket or paren nesting, or inside a comment. Each of those is tracked, and
// only a comma at nesting depth zero splits. Every other code point — NBSP
// included — is copied through byte for byte.
//
// Fail closed, never normalize: an unterminated string, escape, comment,
// bracket or paren is not a selector this gate can prove ownership of, so it
// throws a gate failure rather than guessing a repair.
function splitTopLevelSelectorList(rawSelector) {
  const fail = (reason) =>
    new Error(`CK-E cannot own an unparsable selector (${reason}): ${JSON.stringify(rawSelector)}`);

  // A CSS escape consumes one whole code point, which may be an astral pair.
  const escapeWidth = (index) => {
    const escaped = rawSelector.codePointAt(index + 1);
    if (escaped === undefined) throw fail('unterminated escape');
    return 1 + (escaped > 0xffff ? 2 : 1);
  };

  const parts = [];
  const nesting = [];
  let current = '';
  let index = 0;

  while (index < rawSelector.length) {
    const character = rawSelector.charAt(index);

    if (character === '\\') {
      const width = escapeWidth(index);
      current += rawSelector.slice(index, index + width);
      index += width;
      continue;
    }

    if (character === '"' || character === "'") {
      let cursor = index + 1;
      let closed = false;
      while (cursor < rawSelector.length) {
        const inner = rawSelector.charAt(cursor);
        if (inner === '\\') {
          cursor += escapeWidth(cursor);
          continue;
        }
        if (inner === character) {
          cursor += 1;
          closed = true;
          break;
        }
        cursor += 1;
      }
      if (!closed) throw fail('unterminated string');
      current += rawSelector.slice(index, cursor);
      index = cursor;
      continue;
    }

    if (character === '/' && rawSelector.charAt(index + 1) === '*') {
      const end = rawSelector.indexOf('*/', index + 2);
      if (end === -1) throw fail('unterminated comment');
      current += rawSelector.slice(index, end + 2);
      index = end + 2;
      continue;
    }

    if (character === '[' || character === '(') {
      nesting.push(character);
      current += character;
      index += 1;
      continue;
    }

    if (character === ']' || character === ')') {
      if (nesting.pop() !== (character === ']' ? '[' : '(')) throw fail(`unbalanced ${character}`);
      current += character;
      index += 1;
      continue;
    }

    if (character === ',' && nesting.length === 0) {
      parts.push(current);
      current = '';
      index += 1;
      continue;
    }

    current += character;
    index += 1;
  }

  if (nesting.length > 0) throw fail(`unclosed ${nesting[nesting.length - 1]}`);

  parts.push(current);
  return parts;
}

// `.ds-chart-scaffold` therefore owns `.ds-chart-scaffold[data-part='x']` and
// `.ds-chart-scaffold.ds-x`, but never `.ds-chart-scaffold-rogue`,
// `.ds-chart-scaffoldé`, nor `.ds-chart-scaffold\72 ogue`.
function ownsScope(text, anchors) {
  return anchors.some(
    (anchor) => text.startsWith(anchor) && endsOnSafeBoundary(text, anchor.length),
  );
}

// Direction is document context, not paint ownership. Both the attribute form
// and the `:dir()` pseudo-class express the same law, so both are admitted, and
// both still require the skin scope as the first owning selector after them.
// The separator is a descendant combinator, so it is CSS whitespace only.
const DIRECTIONAL_CONTEXT =
  /^(?::where\(\[dir=['"](?:rtl|ltr)['"]\]\)|:dir\((?:rtl|ltr)\))[ \t\n\f\r]+([\s\S]+)$/;

// Static SVG presentation attributes have zero specificity. A byte-exact
// migration may therefore wrap the complete scoped selector in :where() so
// ordinary consumer author CSS keeps the same ability to override it.
const ZERO_SPECIFICITY_WHOLE = /^:where\(([^,()]*)\)$/;

// A foundation rule may instead weaken only its scope prefix so family skins
// keep winning the cascade. The remainder must start on a descendant or child
// combinator — CSS whitespace only for the descendant case — and `[^,()]*`
// keeps selector lists and nested functions out.
const ZERO_SPECIFICITY_PREFIX = /^:where\(([^,()]*)\)([ \t\n\f\r>+~][\s\S]*)$/;

function isScopeAnchored(selector, anchors) {
  if (ownsScope(selector, anchors)) return true;

  const directional = selector.match(DIRECTIONAL_CONTEXT);
  if (directional) return ownsScope(directional[1], anchors);

  const whole = selector.match(ZERO_SPECIFICITY_WHOLE);
  if (whole) return ownsScope(cssTrim(whole[1]), anchors);

  const prefix = selector.match(ZERO_SPECIFICITY_PREFIX);
  if (prefix && cssTrim(prefix[2]) !== '') return ownsScope(cssTrim(prefix[1]), anchors);

  return false;
}

// The productive path, factored out so the permanent tests below drive the very
// walk the 23 per-skin scans drive — parse, walk, split, `cssTrim`, decide —
// rather than only the predicate at the end of it. A test that reaches
// `isScopeAnchored` directly cannot see a defect that lives in how the selector
// was obtained, which is exactly how the `rule.selectors` leak survived.
function collectUnscopedSelectors(root, anchors) {
  const scopedSelectors = [];
  const unscopedSelectors = [];

  root.walkRules((rule) => {
    if (isInsideKeyframes(rule)) return;

    for (const arm of splitTopLevelSelectorList(rule.selector)) {
      const selector = cssTrim(arm);
      if (isScopeAnchored(selector, anchors)) {
        scopedSelectors.push(selector);
      } else {
        unscopedSelectors.push(`line ${rule.source?.start?.line}: ${selector}`);
      }
    }
  });

  return { scopedSelectors, unscopedSelectors };
}

// The R5 reduced-motion guard mandates exactly these three escalated longhands
// so they reach the element over whatever a neighbouring stylesheet declares.
// See src/foundation/tokens/__tests__/reduced-motion-guard.test.ts. Nothing else
// is exempt: another property, another value, a compound or negated query, an
// extra nesting level, or no query at all all stay escalation violations.
//
// The CSS-whitespace law stated above `SAFE_ANCHOR_BOUNDARY` binds this boundary
// too, and this is the one boundary that GRANTS something — an exemption from
// the escalation ban — so imprecision here widens the exemption rather than
// narrowing a scope. Spelling any position below with JavaScript's `\s` or
// `String.prototype.trim` admits the twenty code points JS calls whitespace and
// CSS does not, and each one of them then launders a declaration that is NOT the
// mandated one onto the exempt form:
//
//   @media (prefers-reduced-motion:<NBSP>reduce)   params, collapsed to `: `
//   @media <NBSP>(prefers-reduced-motion: reduce)  params edge, trimmed away
//   @media (prefers-reduced-motion: reduce)<NBSP>  params edge, trimmed away
//   @media<NBSP>(…)                                at-rule name `media<NBSP>`
//   transition-duration<NBSP>: 0.01ms !important   property `…-duration<NBSP>`
//   transition-duration: 0.01ms<NBSP> !important   value `0.01ms<NBSP>`
//
// None of those is the declaration the R5 guard mandates: the property, the
// value and the query are each a different string once the code point is kept.
// So CSS whitespace only, here as everywhere — collapse runs of the five
// characters to one ASCII space, `cssTrim` the same five at the edges, and
// normalize nothing else. NBSP is never separator and never edge.
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const REDUCED_MOTION_ESCALATIONS = new Map([
  ['transition-duration', '0.01ms'],
  ['animation-duration', '0.01ms'],
  ['animation-iteration-count', '1'],
]);

const CSS_WHITESPACE_RUN = /[ \t\n\f\r]+/g;

function normalizeMediaParams(params) {
  return cssTrim(params.replace(CSS_WHITESPACE_RUN, ' ')).toLowerCase();
}

function isReducedMotionEscalation(declaration) {
  if (!declaration.important) return false;

  const expected = REDUCED_MOTION_ESCALATIONS.get(cssTrim(declaration.prop).toLowerCase());
  if (expected === undefined) return false;
  if (cssTrim(declaration.value) !== expected) return false;

  const atRules = [];
  for (let parent = declaration.parent; parent; parent = parent.parent) {
    if (parent.type === 'atrule') atRules.push(parent);
  }

  return (
    atRules.length === 1 &&
    cssTrim(atRules[0].name).toLowerCase() === 'media' &&
    normalizeMediaParams(atRules[0].params) === REDUCED_MOTION_QUERY
  );
}

function collectEscalations(root) {
  const escalations = [];
  root.walkDecls((declaration) => {
    if (!declaration.important) return;
    if (isReducedMotionEscalation(declaration)) return;
    escalations.push(`${declaration.prop}: ${declaration.value} @ line ${declaration.source?.start?.line}`);
  });
  return escalations;
}

function parseImportParams(params) {
  const quoted = params.trim().match(/^(['"])(.*?)\1(.*)$/s);
  if (quoted) return { target: quoted[2], suffix: quoted[3].trim() };

  const url = params.trim().match(/^url\(\s*(['"])(.*?)\1\s*\)(.*)$/s);
  if (url) return { target: url[2], suffix: url[3].trim() };

  return null;
}

// The roster lives in its own test so a roster defect can never abort — and so
// mask — the per-skin scans below.
test('CK-E certifies a roster of exactly 23 uniquely anchored skins', () => {
  assert.equal(skins.length, 23, 'CK-E must certify exactly 23 skins');
  assert.equal(
    new Set(skins.map(({ path }) => path)).size,
    skins.length,
    'CK-E skin paths must be unique',
  );

  for (const skin of skins) {
    assert.ok(Array.isArray(skin.anchors), `${skin.path} must declare an anchor list`);
    assert.ok(skin.anchors.length > 0, `${skin.path} must declare at least one anchor`);
    assert.equal(
      new Set(skin.anchors).size,
      skin.anchors.length,
      `${skin.path} must not repeat an anchor`,
    );
    for (const anchor of skin.anchors) {
      assert.ok(anchor.startsWith('.ds-'), `${skin.path} anchor must be a DS class: ${anchor}`);
    }
  }
});

// One independent test per skin. The previous single mega-test aborted on its
// first assertion and reported 1 of 9 live violations; full enumeration is the
// only honest way to validate this gate.
for (const skin of skins) {
  test(`CK-E skin is scope-anchored and free of escalation: ${skin.path}`, () => {
    const absolutePath = join(cssRoot, skin.path);
    assert.ok(existsSync(absolutePath), `missing CK-E skin: ${skin.path}`);

    const root = postcss.parse(readFileSync(absolutePath, 'utf8'), { from: absolutePath });
    const layers = [];

    root.walkAtRules('layer', (atRule) => layers.push(atRule));

    const { scopedSelectors, unscopedSelectors } = collectUnscopedSelectors(root, skin.anchors);
    const escalations = collectEscalations(root);

    assert.deepEqual(
      unscopedSelectors,
      [],
      `${skin.path} has unscoped selectors:\n  ${unscopedSelectors.join('\n  ')}`,
    );
    assert.deepEqual(
      escalations,
      [],
      `${skin.path} has ungoverned !important:\n  ${escalations.join('\n  ')}`,
    );
    assert.equal(layers.length, 0, `${skin.path} must remain unlayered`);
    assert.ok(scopedSelectors.length > 0, `${skin.path} must contain at least one scoped selector`);
  });
}

test('both canonical entrypoints import every CK-E skin exactly once in its owning layer', () => {
  for (const entrypoint of entrypoints) {
    assert.ok(existsSync(entrypoint.path), `missing CK-E entrypoint: ${entrypoint.name}`);
    const root = postcss.parse(readFileSync(entrypoint.path, 'utf8'), { from: entrypoint.path });
    const imports = [];

    root.walkAtRules('import', (atRule) => {
      const parsed = parseImportParams(atRule.params);
      if (parsed) imports.push(parsed);
    });

    for (const skin of skins) {
      const target = `../../${skin.path}`;
      const matches = imports.filter((entry) => entry.target === target);

      assert.equal(matches.length, 1, `${entrypoint.name} must import ${target} exactly once`);
      const expectedLayer = skin.path.startsWith('runtime/engines/')
        ? 'layer(rottay-engines)'
        : 'layer(rottay-components)';
      assert.equal(
        matches[0].suffix,
        expectedLayer,
        `${entrypoint.name} must import ${target} through ${expectedLayer}`,
      );
    }
  }
});

// The NBSP test datum, built from its code point so this source file stays pure
// ASCII and carries no invisible byte. It must be the real code point at
// runtime: handing postcss a backslash-escaped form instead would hand
// postcss a CSS *escape* — a different input, testing a different law — and the
// causal assertions below would no longer describe the defect they pin.
const NBSP = String.fromCodePoint(0xa0);

// Permanent negatives. Every case below is constructed in memory; no CSS source
// file is ever mutated to exercise the gate.
test('CK-E scope predicate owns on a lexical boundary and rejects near misses', () => {
  const chartAnchors = ['.ds-chart-scaffold', '.ds-chart-renderer', '.ds-chart-renderer-bar'];
  const kanbanAnchors = ['.ds-pattern-kanban-board.ds-engine-modern'];

  const positives = [
    // The exact live chart-foundation :where() scope prefix.
    [":where(.ds-chart-scaffold[data-part='chart-scaffold']) > [data-part='legend']", chartAnchors],
    [
      ":where(.ds-chart-scaffold[data-part='chart-scaffold']) > [data-part='legend'] [data-part='legend-item']",
      chartAnchors,
    ],
    // The exact live pattern-kanban-board :dir(rtl) mirror.
    [
      ":dir(rtl) .ds-pattern-kanban-board.ds-engine-modern [data-part='board'][data-scrollable-start='true']",
      kanbanAnchors,
    ],
    // The attribute directional form stays admitted.
    [":where([dir='rtl']) .ds-chart-renderer.ds-chart-renderer[data-part='chart-renderer']", chartAnchors],
    // Direct ownership, and the wholly wrapped zero-specificity form.
    [".ds-chart-scaffold[data-part='chart-scaffold']", chartAnchors],
    [":where(.ds-chart-scaffold [data-part='axis-line'])", chartAnchors],
    // A longer anchor owns where the shorter one must not.
    [".ds-chart-renderer-bar[data-part='bar']", chartAnchors],
    // The boundary is satisfied by end-of-selector and by a pseudo colon.
    ['.ds-chart-scaffold', chartAnchors],
    ['.ds-chart-scaffold:hover', chartAnchors],
    // All five CSS whitespace characters stay live at every position that means
    // "descendant combinator" — the boundary after an anchor, the directional
    // separator, and the head of a :where() prefix remainder. Narrowing `\s` to
    // `[ \t\n\f\r]` must not cost the four non-SPACE members.
    ['.ds-chart-scaffold\f[data-part=\'legend\']', chartAnchors],
    [":dir(rtl)\t.ds-pattern-kanban-board.ds-engine-modern [data-part='board']", kanbanAnchors],
    [":where(.ds-chart-scaffold)\r\n> [data-part='legend']", chartAnchors],
  ];

  for (const [selector, anchors] of positives) {
    assert.ok(isScopeAnchored(selector, anchors), `must stay admitted: ${selector}`);
  }

  const negatives = [
    // No owner at all.
    ["[data-part='legend']", chartAnchors],
    [':where([data-part="legend"]) > [data-part="legend-item"]', chartAnchors],
    // Wrong owner.
    [":where(.ds-pattern-timeline) > [data-part='legend']", chartAnchors],
    [".ds-chart-scaffold[data-part='chart-scaffold']", kanbanAnchors],
    // Selector list smuggled into the scope prefix.
    [":where(.ds-chart-scaffold, .anything) > [data-part='legend']", chartAnchors],
    [':where(.ds-chart-scaffold:not(.x)) > [data-part="legend"]', chartAnchors],
    // Near prefix: a different class that merely starts with an anchor.
    [":where(.ds-chart-scaffold-rogue[data-part='chart-scaffold']) > [data-part='legend']", chartAnchors],
    [".ds-chart-scaffold-rogue[data-part='chart-scaffold']", chartAnchors],
    [":dir(rtl) .ds-pattern-kanban-board.ds-engine-modern-rogue [data-part='board']", kanbanAnchors],
    // Near prefix continued by a NON-ASCII identifier code point (U+00E9). The
    // ASCII deny-list could not see it, so `.ds-chart-scaffoldé` — a different
    // class entirely — was falsely owned by `.ds-chart-scaffold`.
    [".ds-chart-scaffoldé[data-part='chart-scaffold']", chartAnchors],
    [":where(.ds-chart-scaffoldé[data-part='chart-scaffold']) > [data-part='legend']", chartAnchors],
    [":where(.ds-chart-scaffoldé [data-part='axis-line'])", chartAnchors],
    // Near prefix continued by a CSS escape. `\\72 ` is one backslash, `7`, `2`,
    // space — the escape for `r`, so the class is really `.ds-chart-scaffoldrogue`.
    [".ds-chart-scaffold\\72 ogue[data-part='chart-scaffold']", chartAnchors],
    [":where(.ds-chart-scaffold\\72 ogue[data-part='chart-scaffold']) > [data-part='legend']", chartAnchors],
    [":where(.ds-chart-scaffold\\72 ogue [data-part='axis-line'])", chartAnchors],
    [":dir(rtl) .ds-pattern-kanban-board.ds-engine-modern\\65 rogue [data-part='board']", kanbanAnchors],
    // Near prefix continued by NBSP (U+00A0). Written as a `\u00A0` escape so
    // the source carries no invisible byte, but the string the predicate sees
    // holds the real code point. NBSP is whitespace to JavaScript's `\s` and an
    // identifier continuation to CSS, so every position that once spelled `\s`
    // — the anchor boundary, the directional separator, the :where() prefix
    // separator — could be crossed with it. All six are the same defect at six
    // sites; each is listed because each reaches a different branch.
    [".ds-chart-scaffold\u00A0rogue[data-part='chart-scaffold']", chartAnchors],
    [":dir(rtl)\u00A0.ds-pattern-kanban-board.ds-engine-modern [data-part='board']", kanbanAnchors],
    [":dir(rtl) .ds-pattern-kanban-board.ds-engine-modern\u00A0rogue [data-part='board']", kanbanAnchors],
    [":where(.ds-chart-scaffold)\u00A0> [data-part='legend']", chartAnchors],
    [":where(.ds-chart-scaffold\u00A0rogue[data-part='chart-scaffold']) > [data-part='legend']", chartAnchors],
    [":where(.ds-chart-scaffold\u00A0[data-part='axis-line'])", chartAnchors],
    // The same code point at the END of a :where() capture, where the leak was
    // `String.prototype.trim` rather than a regex: JS trim deletes NBSP, so the
    // real class `ds-chart-scaffold<NBSP>` was normalized into the anchor before
    // ownership was ever decided. `cssTrim` strips the five CSS characters only.
    [':where(.ds-chart-scaffold\u00A0)', chartAnchors],
    [":where(.ds-chart-scaffold\u00A0) > [data-part='legend']", chartAnchors],
    // Direction context with no owning scope after it.
    [":dir(rtl) [data-part='board']", kanbanAnchors],
    [":where([dir='rtl']) [data-part='legend']", chartAnchors],
    // The scope prefix must be followed by a combinator, not glued to a compound.
    [":where(.ds-chart-scaffold)[data-part='legend']", chartAnchors],
  ];

  for (const [selector, anchors] of negatives) {
    assert.ok(!isScopeAnchored(selector, anchors), `must stay rejected: ${selector}`);
  }
});

// Predicate tests alone certified nothing about the productive path: the scan
// could hold a perfect predicate and still go green because the selector handed
// to it had already been normalized. These cases parse real CSS and drive
// `collectUnscopedSelectors` — the exact function the 23 per-skin scans call.
test('CK-E per-skin scan judges the raw parsed selector, never a JS-trimmed arm', () => {
  const anchors = ['.ds-chart-scaffold'];
  const nbsp = NBSP;

  // The NBSP is interpolated from its code point, so this file carries no
  // invisible byte while postcss receives the real character — not a
  // backslash escape, which would be a different input entirely. The class is
  // `ds-chart-scaffold<NBSP>`, which no anchor owns.
  const leak = postcss.parse(`.ds-chart-scaffold${nbsp} { color: red }`);

  // Causal pin, permanent: this is the abandoned production path. PostCSS has
  // already JS-trimmed the NBSP out of `rule.selectors`, so a scan reading that
  // getter is handed the bare anchor and certifies a foreign class. The
  // assertion documents the bypass and fails the moment the leak is reachable
  // again through a restored `rule.selectors` read.
  assert.equal(leak.first.selectors[0], '.ds-chart-scaffold', 'rule.selectors must still be shown to trim');
  assert.ok(isScopeAnchored(leak.first.selectors[0], anchors), 'the trimmed arm is what went falsely green');
  assert.equal(leak.first.selector, `.ds-chart-scaffold${nbsp}`, 'the raw selector must keep the code point');

  const leaked = collectUnscopedSelectors(leak, anchors);
  assert.equal(leaked.unscopedSelectors.length, 1, 'the NBSP-continued class must be reported unscoped');
  assert.match(leaked.unscopedSelectors[0], /^line 1: /);
  assert.deepEqual(leaked.scopedSelectors, [], 'nothing in that rule is owned');

  // A normal multi-arm list keeps working: both arms owned, both counted, so
  // the anti-vacuity floor below is fed by real arms rather than by one.
  const list = postcss.parse(
    ".ds-chart-scaffold[data-part='chart-scaffold'],\n.ds-chart-scaffold [data-part='axis-line'] { color: red }",
  );
  const listed = collectUnscopedSelectors(list, anchors);
  assert.deepEqual(listed.unscopedSelectors, [], 'both arms are owned');
  assert.deepEqual(listed.scopedSelectors, [
    ".ds-chart-scaffold[data-part='chart-scaffold']",
    ".ds-chart-scaffold [data-part='axis-line']",
  ]);

  // A comma that never meant "next selector" must not be split into a second,
  // unowned arm by the walk that feeds the gate.
  const held = postcss.parse(".ds-chart-scaffold[data-part='a,b'] :is(.x, .y) { color: red }");
  const heldResult = collectUnscopedSelectors(held, anchors);
  assert.deepEqual(heldResult.unscopedSelectors, []);
  assert.equal(heldResult.scopedSelectors.length, 1, 'the rule is one arm, not three');

  // Keyframe steps are still excluded, and a foreign rule is still reported.
  const mixed = postcss.parse(
    '@keyframes ds-x { from { opacity: 0 } }\n.ds-chart-scaffold { color: red }\n[data-part=\'legend\'] { color: red }',
  );
  const mixedResult = collectUnscopedSelectors(mixed, anchors);
  assert.deepEqual(mixedResult.scopedSelectors, ['.ds-chart-scaffold']);
  assert.equal(mixedResult.unscopedSelectors.length, 1);
  assert.match(mixedResult.unscopedSelectors[0], /\[data-part='legend'\]$/);
});

test('CK-E selector splitter splits only top-level commas and fails closed', () => {
  const nbsp = NBSP;

  // Every code point survives the split; only `cssTrim` may remove anything,
  // and only the five CSS whitespace characters at the edges. The NBSP arm is
  // the load-bearing one: it is what `rule.selectors` would have destroyed.
  assert.deepEqual(splitTopLevelSelectorList('.a,.b'), ['.a', '.b']);
  assert.deepEqual(splitTopLevelSelectorList('.a,\n  .b'), ['.a', '\n  .b']);
  assert.deepEqual(splitTopLevelSelectorList(`.a${nbsp} , .b`), [`.a${nbsp} `, ' .b']);

  // A comma inside a quoted attribute value is data, not a separator — in both
  // quote styles, and while a bracket nesting is open.
  assert.deepEqual(splitTopLevelSelectorList(".a[data-part='p,q']"), [".a[data-part='p,q']"]);
  assert.deepEqual(splitTopLevelSelectorList('.a[data-part="p,q"], .b'), ['.a[data-part="p,q"]', ' .b']);
  assert.deepEqual(splitTopLevelSelectorList('.a[data-part=":is(p,q)"]'), ['.a[data-part=":is(p,q)"]']);

  // A comma inside a functional pseudo belongs to that function, at any depth.
  assert.deepEqual(splitTopLevelSelectorList(':is(.a, .b) .c'), [':is(.a, .b) .c']);
  assert.deepEqual(splitTopLevelSelectorList(':not(:is(.a, .b)), .c'), [':not(:is(.a, .b))', ' .c']);

  // An escaped comma is part of the identifier. `\\,` in this source is one
  // backslash plus a comma, so the class is really `a,b`.
  assert.deepEqual(splitTopLevelSelectorList('.a\\,b'), ['.a\\,b']);
  assert.deepEqual(splitTopLevelSelectorList('.a\\,b, .c'), ['.a\\,b', ' .c']);
  // An escaped quote must not open a string and swallow the rest.
  assert.deepEqual(splitTopLevelSelectorList(".a\\'b, .c"), [".a\\'b", ' .c']);

  // A comma inside a comment is prose.
  assert.deepEqual(splitTopLevelSelectorList('.a/* x, y */, .b'), ['.a/* x, y */', ' .b']);
  // ...and a comment marker inside a string is not a comment.
  assert.deepEqual(splitTopLevelSelectorList('.a[data-part="/*"], .b'), ['.a[data-part="/*"]', ' .b']);

  // Fail closed. Each of these is a selector whose ownership cannot be proven,
  // so the gate refuses rather than normalizing a guess.
  for (const broken of [
    ".a[data-part='p",
    '.a[data-part="p',
    '.a[data-part=p',
    ':is(.a',
    '.a)',
    '.a]',
    '.a[data-part=x)',
    '.a/* unterminated',
    '.a\\',
    ".a[data-part='p\\",
  ]) {
    assert.throws(
      () => splitTopLevelSelectorList(broken),
      /CK-E cannot own an unparsable selector/,
      `must fail closed: ${broken}`,
    );
  }
});

test('CK-E escalation exemption is confined to the three reduced-motion longhands', () => {
  const scan = (css) => collectEscalations(postcss.parse(css)).map((entry) => entry.split(':')[0]);

  const guard = `
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  `;

  // The one admitted shape: the exact triple, each escalated, directly inside
  // the exact reduce query.
  assert.deepEqual(
    scan(`@media (prefers-reduced-motion: reduce) { .a { ${guard} } }`),
    [],
    'the mandated reduced-motion triple must be exempt',
  );
  assert.deepEqual(
    scan(`@media\n  (prefers-reduced-motion:   reduce)   { .a { ${guard} } }`),
    [],
    'whitespace in the query params must normalize',
  );

  // A paint property never rides the exemption.
  assert.deepEqual(
    scan(`@media (prefers-reduced-motion: reduce) { .a { background: red !important; } }`),
    ['background'],
  );
  assert.deepEqual(
    scan(`@media (prefers-reduced-motion: reduce) { .a { transition: none !important; } }`),
    ['transition'],
  );

  // A different value never rides the exemption.
  assert.deepEqual(
    scan(`@media (prefers-reduced-motion: reduce) { .a { transition-duration: 2s !important; } }`),
    ['transition-duration'],
  );
  assert.deepEqual(
    scan(`@media (prefers-reduced-motion: reduce) { .a { animation-iteration-count: infinite !important; } }`),
    ['animation-iteration-count'],
  );

  // Outside any query, the same triple is a plain escalation.
  assert.deepEqual(scan(`.a { ${guard} }`), [
    'transition-duration',
    'animation-duration',
    'animation-iteration-count',
  ]);

  // Compound, negated, other, and extra-nested queries are all still red.
  for (const params of [
    '(prefers-reduced-motion: reduce) and (min-width: 40rem)',
    'not (prefers-reduced-motion: reduce)',
    '(prefers-reduced-motion: no-preference)',
    '(prefers-reduced-transparency: reduce)',
    'screen and (prefers-reduced-motion: reduce)',
    '(prefers-reduced-motion: reduce), (hover: none)',
  ]) {
    assert.deepEqual(
      scan(`@media ${params} { .a { ${guard} } }`),
      ['transition-duration', 'animation-duration', 'animation-iteration-count'],
      `@media ${params} must not grant the exemption`,
    );
  }

  assert.deepEqual(
    scan(`@media (prefers-reduced-motion: reduce) { @media (hover: hover) { .a { ${guard} } } }`),
    ['transition-duration', 'animation-duration', 'animation-iteration-count'],
    'an extra nesting level must not grant the exemption',
  );
  assert.deepEqual(
    scan(`@supports (color: red) { @media (prefers-reduced-motion: reduce) { .a { ${guard} } } }`),
    ['transition-duration', 'animation-duration', 'animation-iteration-count'],
    'an enclosing at-rule must not grant the exemption',
  );

  // The scan is comment-aware, not text-blind: prose is never a declaration,
  // and an unescalated declaration is never a violation.
  assert.deepEqual(scan(`.a { /* these rules win without !important */ color: red; }`), []);
  assert.deepEqual(scan(`@media (prefers-reduced-motion: reduce) { .a { transition-duration: 2s; } }`), []);

  // All five CSS whitespace characters stay live at every position this helper
  // normalizes — the params separator and both edges, the space between the
  // property colon and the value, and the space before `!important`. Narrowing
  // `\s`/`trim` to `[ \t\n\f\r]` must not cost the four non-SPACE members.
  assert.deepEqual(
    scan(
      `@media\n  (prefers-reduced-motion:\t\treduce)\r\n { .a {\f transition-duration:\r0.01ms\t!important; } }`,
    ),
    [],
    'CSS whitespace formatting must still normalize onto the exempt form',
  );

  // NBSP laundering, driven through the productive `collectEscalations` on real
  // parsed CSS — not through the predicate. NBSP is whitespace to JavaScript and
  // is NOT whitespace to CSS, so under `/\s+/` + `String.prototype.trim` each
  // line below normalized onto the exempt form and had its `!important`
  // laundered through. Each reaches a different normalization site, and each is
  // a declaration the R5 guard does not mandate: a query that no browser
  // matches, an at-rule that is not `media`, a property that is not
  // `transition-duration`, a value that is not `0.01ms`. Every parse shape here
  // is what postcss actually yields; none is hand-built.
  const laundering = [
    [`@media (prefers-reduced-motion:${NBSP}reduce) { .a { ${guard} } }`, 'params, colon adjacency'],
    [`@media ${NBSP}(prefers-reduced-motion: reduce) { .a { ${guard} } }`, 'params, leading edge'],
    [`@media (prefers-reduced-motion: reduce)${NBSP} { .a { ${guard} } }`, 'params, trailing edge'],
    [`@media${NBSP}(prefers-reduced-motion: reduce) { .a { ${guard} } }`, 'at-rule name, appended'],
    [
      `@media (prefers-reduced-motion: reduce) { .a { transition-duration${NBSP}: 0.01ms !important; } }`,
      'property, appended',
    ],
    [
      `@media (prefers-reduced-motion: reduce) { .a { transition-duration: 0.01ms${NBSP} !important; } }`,
      'value, appended',
    ],
  ];

  for (const [css, site] of laundering) {
    assert.ok(
      collectEscalations(postcss.parse(css)).length > 0,
      `NBSP must not launder the reduced-motion exemption (${site})`,
    );
  }

  // The causal pins, permanent: the exact strings the abandoned JS-whitespace
  // spelling would have produced. They are the defect written down as
  // executable assertions, and they fail the moment `\s`/`trim` returns.
  const nameLeak = postcss.parse(`@media${NBSP}(prefers-reduced-motion: reduce) { .a { ${guard} } }`);
  assert.equal(nameLeak.first.name, `media${NBSP}`, 'the raw at-rule name must keep the code point');
  assert.equal(nameLeak.first.name.trim(), 'media', 'JS trim is what falsely made it the media at-rule');
  assert.equal(cssTrim(nameLeak.first.name), `media${NBSP}`, 'cssTrim must keep it foreign');

  const paramsLeak = postcss.parse(
    `@media (prefers-reduced-motion:${NBSP}reduce) { .a { ${guard} } }`,
  );
  assert.equal(
    paramsLeak.first.params.replace(/\s+/g, ' ').trim(),
    REDUCED_MOTION_QUERY,
    'JS `\\s` is what falsely normalized the query onto the exempt form',
  );
  assert.equal(
    normalizeMediaParams(paramsLeak.first.params),
    `(prefers-reduced-motion:${NBSP}reduce)`,
    'CSS-only collapse must leave the query foreign',
  );
});
