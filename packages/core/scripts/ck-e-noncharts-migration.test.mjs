import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import postcss from 'postcss';
import ts from 'typescript';

import { countArc09PaintInFile } from './lib/inline-paint-counter.mjs';
import { packageRoot as findPackageRoot } from './lib/repo-root/index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const packageRoot = findPackageRoot(HERE);
const patternsRoot = join(packageRoot, 'src/ui/patterns/visualization');
const cssRoot = join(packageRoot, 'src/foundation/tokens/css/runtime/engines');

const FILES = {
  calendarModern: {
    path: 'calendar-view/engines/modern/index.tsx',
    start: 28,
    floor: 0,
  },
  calendarRustic: {
    path: 'calendar-view/engines/rustic/index.tsx',
    start: 18,
    floor: 1,
  },
  mapModern: {
    path: 'map-view/engines/modern/index.tsx',
    start: 13,
    floor: 1,
  },
  mapRustic: {
    path: 'map-view/engines/rustic/index.tsx',
    start: 16,
    floor: 1,
  },
  kanbanModern: {
    path: 'kanban-board/engines/modern/index.tsx',
    start: 16,
    floor: 0,
  },
  kanbanRustic: {
    path: 'kanban-board/engines/rustic/index.tsx',
    start: 32,
    floor: 1,
  },
  timelineModern: {
    path: 'timeline/engines/modern/index.tsx',
    start: 16,
    floor: 0,
  },
  timelineRustic: {
    path: 'timeline/engines/rustic/index.tsx',
    start: 21,
    floor: 0,
  },
  treeModern: {
    path: 'tree-view/engines/modern/index.tsx',
    start: 16,
    floor: 0,
  },
  treeRustic: {
    path: 'tree-view/engines/rustic/index.tsx',
    start: 19,
    floor: 0,
  },
};

const SKINS = [
  ['modern', 'pattern-calendar-view.css', '.ds-pattern-calendar-view.ds-engine-modern'],
  ['rustic', 'pattern-calendar-view.css', '.ds-pattern-calendar-view.ds-engine-rustic'],
  ['modern', 'pattern-map-view.css', '.ds-pattern-map-view.ds-engine-modern'],
  ['rustic', 'pattern-map-view.css', '.ds-pattern-map-view.ds-engine-rustic'],
  ['modern', 'pattern-kanban-board.css', '.ds-pattern-kanban-board.ds-engine-modern'],
  ['rustic', 'pattern-kanban-board.css', '.ds-pattern-kanban-board.ds-engine-rustic'],
  ['modern', 'pattern-timeline.css', '.ds-pattern-timeline.ds-engine-modern'],
  ['rustic', 'pattern-timeline.css', '.ds-pattern-timeline.ds-engine-rustic'],
  ['modern', 'pattern-tree-view.css', '.ds-pattern-tree-view.ds-engine-modern'],
  ['rustic', 'pattern-tree-view.css', '.ds-pattern-tree-view.ds-engine-rustic'],
];

function pathFor(entry) {
  return join(patternsRoot, entry.path);
}

function source(entry) {
  return readFileSync(pathFor(entry), 'utf8');
}

// CSS whitespace is exactly five code points — TAB U+0009, LF U+000A, FF U+000C,
// CR U+000D, SPACE U+0020 (CSS Syntax L3 §4.2). JavaScript's `\s` and
// `String.prototype.trim` cover a much wider set: they over-match by twenty
// further code points — VT U+000B, plus NBSP U+00A0, U+1680, the U+2000–U+200A
// block, U+2028, U+2029, U+202F, U+205F, U+3000 and the BOM U+FEFF. Not one of
// the twenty separates CSS tokens; the nineteen above ASCII are identifier and
// value CONTINUATIONS. So every position in this file that means "CSS
// whitespace" spells the five characters out and never uses `\s` or `trim`.
// (`[\s\S]` is a different idiom — the any-code-point wildcard — and carries no
// whitespace meaning.)
const CSS_WHITESPACE_EDGES = /^[ \t\n\f\r]+|[ \t\n\f\r]+$/g;

function cssTrim(text) {
  return text.replace(CSS_WHITESPACE_EDGES, '');
}

// The R5 reduced-motion guard mandates exactly these three escalated longhands
// so they reach the element over whatever a neighbouring stylesheet declares.
// See src/foundation/tokens/__tests__/reduced-motion-guard.test.ts. Nothing else
// is exempt: another property, another value, a compound or negated query, an
// extra nesting level, or no query at all all stay escalation violations. This
// mirrors the exemption in ck-e-migration-certification.test.mjs; the scan is
// postcss-based because a text regex cannot tell a declaration from prose that
// merely mentions !important, and cannot see block context at all.
//
// This is the one boundary in the file that GRANTS something — an exemption from
// the escalation ban — so imprecision here widens the exemption rather than
// narrowing a scope. Under the JS whitespace set, each of these launders an
// `!important` the guard never mandated onto the exempt form:
//
//   @media (prefers-reduced-motion:<NBSP>reduce)   params, collapsed to `: `
//   @media <NBSP>(prefers-reduced-motion: reduce)  params edge, trimmed away
//   @media (prefers-reduced-motion: reduce)<NBSP>  params edge, trimmed away
//   @media<NBSP>(…)                                at-rule name `media<NBSP>`
//   transition-duration<NBSP>: 0.01ms !important   property `…-duration<NBSP>`
//   transition-duration: 0.01ms<NBSP> !important   value `0.01ms<NBSP>`
//
// Collapse runs of the five CSS characters to one ASCII space, `cssTrim` the
// same five at the edges, and normalize nothing else. NBSP is never a separator
// and never an edge.
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

function collectEscalations(css, from) {
  const escalations = [];
  postcss.parse(css, { from }).walkDecls((declaration) => {
    if (!declaration.important) return;
    if (isReducedMotionEscalation(declaration)) return;
    escalations.push(`${declaration.prop}: ${declaration.value} @ line ${declaration.source?.start?.line}`);
  });
  return escalations;
}

test('CK-E noncharts migrate the exact 195-site start to the four caller-derived floors', () => {
  let start = 0;
  let floor = 0;

  for (const [name, entry] of Object.entries(FILES)) {
    const actual = countArc09PaintInFile(source(entry), pathFor(entry));
    assert.equal(actual, entry.floor, `${name} must land at its exact final floor`);
    start += entry.start;
    floor += actual;
  }

  assert.equal(start, 195);
  assert.equal(floor, 4);
  assert.equal(start - floor, 191);
});

// Calendar and Kanban no longer share one identity across their two engines. The
// Modern pair migrated onto a scoped custom-property channel while the Rustic
// pair kept its legitimate inline floor, so a single loop over both engines
// would now assert a shape only one of them still has. Each surviving direct
// floor is named for the exact file that owns it.
test('CK-E nonchart direct-paint floors retain their exact caller-derived identities', () => {
  assert.equal(
    source(FILES.calendarRustic).match(/background: ev\.color \?\? 'var\(--ds-color-primary\)'/g)?.length,
    1,
    'calendarRustic event floor drifted',
  );

  for (const name of ['mapModern', 'mapRustic']) {
    const text = source(FILES[name]);
    assert.equal(text.match(/background: marker\.color/g)?.length, 1, `${name} marker floor drifted`);
  }

  assert.equal(
    source(FILES.kanbanRustic).match(/borderTop: column\.color/g)?.length,
    1,
    'kanbanRustic column floor drifted',
  );
});

// ---------------------------------------------------------------------------
// Producer side: read the parsed TSX, never the bytes.
//
// The first spelling of these two tests counted producers with
// `text.match(/'--ds-…-accent': ev\.color\b/g)` and banned direct paint with
// `assert.doesNotMatch(text, /background\s*:\s*ev\.color/)`. A regex reads bytes,
// so a producer that has been COMMENTED OUT still counts: delete the live
// `style={{ '--ds-calendar-event-accent': ev.color }}`, leave a commented corpse
// behind, and the count stays at exactly one while the channel publishes
// nothing. The migration this gate certifies would be silently undone. The ban
// fails the same way in the opposite direction — a commented
// `background: ev.color` reddens a file that violates nothing.
//
// Both facts are therefore collected from the TypeScript AST. Comments and
// string literals are not nodes in a property position; an object that never
// reaches a `style` attribute is not a style object; an aliased object
// (`const s = {…}` then `style={s}`) is not the style EXPRESSION; and a computed
// key (`{['--ds-…']: …}`) is not the canonical quoted-literal channel form this
// gate certifies. None of them count, and each is pinned below.
const CALENDAR_CHANNEL = '--ds-calendar-event-accent';
const KANBAN_CHANNEL = '--ds-kanban-column-accent';
const CALENDAR_FILL_PROPS = ['background', 'backgroundColor'];
const KANBAN_STRIP_PROPS = ['borderTop', 'borderBlockStart'];

// The abandoned spellings, kept only as the causal pins at the end of each
// channel test: they are quoted so the defect is written down as an executable
// assertion. `\s` is admissible in these two — they scan TSX source, where JS
// whitespace is the correct set; the CSS-only rule above governs CSS positions.
const RETIRED_CALENDAR_PRODUCER_REGEX = /'--ds-calendar-event-accent': ev\.color\b/g;
const RETIRED_KANBAN_PRODUCER_REGEX = /'--ds-kanban-column-accent': column\.color\b/g;
const RETIRED_CALENDAR_PAINT_REGEX = /(?:background|backgroundColor)\s*:\s*ev\.color/;
const RETIRED_KANBAN_PAINT_REGEX = /(?:borderTop|borderBlockStart)\s*:\s*column\.color/;

// Parent pointers are ON. The producer PLACEMENT clause below ascends from a
// style object to the JSX element that owns it, and `setParentNodes` is the only
// way a node knows its parent. It populates `.parent` and changes nothing else:
// the descent collectors and the `property.pos` line reporting are byte-identical
// either way.
function parseTsx(text, path) {
  return ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
}

// The transparent wrappers between a `style={…}` attribute and the object
// literal it actually hands React. Both live producers need them: Calendar
// writes `style={{…} as React.CSSProperties}` and Kanban writes
// `style={column.color ? ({…} as React.CSSProperties) : undefined}`. Anything
// NOT in this list — a call, an array, an arrow body, a variable reference —
// ends the chain, which is exactly why an aliased style object is not counted.
function collectStyleObjects(expression, objects) {
  if (!expression) return objects;

  if (
    ts.isParenthesizedExpression(expression) ||
    ts.isAsExpression(expression) ||
    ts.isSatisfiesExpression(expression) ||
    ts.isNonNullExpression(expression) ||
    ts.isTypeAssertionExpression(expression)
  ) {
    return collectStyleObjects(expression.expression, objects);
  }

  if (ts.isConditionalExpression(expression)) {
    collectStyleObjects(expression.whenTrue, objects);
    return collectStyleObjects(expression.whenFalse, objects);
  }

  if (ts.isBinaryExpression(expression)) {
    const operator = expression.operatorToken.kind;
    if (
      operator === ts.SyntaxKind.AmpersandAmpersandToken ||
      operator === ts.SyntaxKind.BarBarToken ||
      operator === ts.SyntaxKind.QuestionQuestionToken
    ) {
      collectStyleObjects(expression.left, objects);
      collectStyleObjects(expression.right, objects);
    }
    return objects;
  }

  if (ts.isObjectLiteralExpression(expression)) objects.push(expression);
  return objects;
}

function styleObjectLiterals(sourceFile) {
  const objects = [];
  const visit = (node) => {
    if (ts.isJsxAttribute(node) && ts.isIdentifier(node.name) && node.name.text === 'style') {
      if (node.initializer && ts.isJsxExpression(node.initializer)) {
        collectStyleObjects(node.initializer.expression, objects);
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return objects;
}

// A quoted key and a bare identifier key are both real property names; a
// computed key is deliberately neither.
function propertyKey(name) {
  if (ts.isStringLiteral(name)) return { quoted: true, text: name.text };
  if (ts.isIdentifier(name)) return { quoted: false, text: name.text };
  return { quoted: false, text: null };
}

function isDatumColor(node, datum) {
  return (
    ts.isPropertyAccessExpression(node) &&
    ts.isIdentifier(node.expression) &&
    node.expression.text === datum &&
    ts.isIdentifier(node.name) &&
    node.name.text === 'color'
  );
}

// ---------------------------------------------------------------------------
// Producer PLACEMENT.
//
// Counting the publication is only half the contract. A custom property
// inherits DOWN the tree and never up, so the accent has to be published on the
// element the skin's sink SELECTS or it never reaches the paint. Inheritance
// would also carry it down from an ANCESTOR, but that is not admitted here: an
// accent published on the day cell reaches every chip in the cell, which is a
// different picture from the one the sink describes. The element the sink names,
// exactly. The v2 collector asked only "is this the channel, on a style object,
// initialized by the datum colour" — a question every element in the file can
// answer. Take the producer off `data-part="event"` and put it on a child
// `<span>`: the count stays at exactly one, the direct-paint ban stays empty,
// the floors stay at zero and the entire sink half stays green, while the chip
// paints the fallback forever. The channel is published, and connected to
// nothing.
//
// So a producer is no longer a tally — it is a record carrying the JSX element
// that owns it, and the unique producer must sit on the element bearing the
// exact `data-part` literal the sink selector ends in.

// The ascent mirror of `collectStyleObjects`: a parent is transparent only when
// the child stands in the position that collector would have descended into.
// The `expression === node` / branch / operand checks are what make it a mirror
// rather than a superset — an object literal reached from a ternary CONDITION,
// or standing where the `as` TYPE belongs, is not a style object on the way up
// either.
function transparentParentOf(node) {
  const parent = node.parent;
  if (!parent) return null;

  if (
    (ts.isParenthesizedExpression(parent) ||
      ts.isAsExpression(parent) ||
      ts.isSatisfiesExpression(parent) ||
      ts.isNonNullExpression(parent) ||
      ts.isTypeAssertionExpression(parent)) &&
    parent.expression === node
  ) {
    return parent;
  }

  if (ts.isConditionalExpression(parent) && (parent.whenTrue === node || parent.whenFalse === node)) {
    return parent;
  }

  if (ts.isBinaryExpression(parent) && (parent.left === node || parent.right === node)) {
    const operator = parent.operatorToken.kind;
    if (
      operator === ts.SyntaxKind.AmpersandAmpersandToken ||
      operator === ts.SyntaxKind.BarBarToken ||
      operator === ts.SyntaxKind.QuestionQuestionToken
    ) {
      return parent;
    }
  }

  return null;
}

// ObjectLiteral -> transparent wrappers -> JsxExpression -> the `style`
// JsxAttribute -> JsxAttributes -> JsxOpeningElement | JsxSelfClosingElement.
// Every hop is checked by identity of position, so a chain that merely resembles
// this one resolves to null rather than to a plausible owner.
function owningJsxElement(object) {
  let node = object;
  for (let parent = transparentParentOf(node); parent; parent = transparentParentOf(node)) {
    node = parent;
  }

  const expression = node.parent;
  if (!expression || !ts.isJsxExpression(expression) || expression.expression !== node) return null;

  const attribute = expression.parent;
  if (!attribute || !ts.isJsxAttribute(attribute) || attribute.initializer !== expression) return null;
  if (!ts.isIdentifier(attribute.name) || attribute.name.text !== 'style') return null;

  const attributes = attribute.parent;
  if (!attributes || !ts.isJsxAttributes(attributes)) return null;

  const element = attributes.parent;
  if (!element || (!ts.isJsxOpeningElement(element) && !ts.isJsxSelfClosingElement(element))) return null;
  return element;
}

// The channel producer in its one canonical form: a QUOTED channel key on a
// style object, initialized by the datum's `.color` and nothing else. A renamed
// channel, a computed key, a wrapped or defaulted value all read as zero — the
// gate then names the missing publication rather than passing on a near-miss.
// Each hit is recorded WITH its owning element; the count is the length of that
// record list, so every v2 count fact is unchanged by construction.
function collectChannelProducers(text, path, channel, datum) {
  const producers = [];
  for (const object of styleObjectLiterals(parseTsx(text, path))) {
    for (const property of object.properties) {
      if (!ts.isPropertyAssignment(property)) continue;
      const key = propertyKey(property.name);
      if (!key.quoted || key.text !== channel) continue;
      if (!isDatumColor(property.initializer, datum)) continue;
      producers.push({ property, owner: owningJsxElement(object) });
    }
  }
  return producers;
}

function countChannelProducers(text, path, channel, datum) {
  return collectChannelProducers(text, path, channel, datum).length;
}

// `data-part` as an AST fact, never as text. A spread
// (`{...{ 'data-part': 'event' }}`) is a JsxSpreadAttribute and carries no
// attribute name at all; a dynamic value (`data-part={part}`) is not a literal
// any selector can be matched against; a `data-part` written in a comment or
// inside a string is not an attribute. Two of them are not one, so the count is
// reported rather than silently reduced to the first.
function literalDataPart(element) {
  const found = element.attributes.properties.filter(
    (attribute) =>
      ts.isJsxAttribute(attribute) &&
      ts.isIdentifier(attribute.name) &&
      attribute.name.text === 'data-part',
  );
  if (found.length !== 1) return { count: found.length, value: null };

  const initializer = found[0].initializer;
  if (initializer && ts.isStringLiteral(initializer)) return { count: 1, value: initializer.text };
  if (
    initializer &&
    ts.isJsxExpression(initializer) &&
    initializer.expression &&
    ts.isStringLiteral(initializer.expression)
  ) {
    return { count: 1, value: initializer.expression.text };
  }
  return { count: 1, value: null };
}

// The placement clause, self-contained: the channel is published exactly once in
// the file — so a duplicate or a second, misplaced publication fails here as
// well as at the count — and that one publication sits on the element the skin
// selects.
//
// Stated scope, so the next reader does not over-read this clause: it proves the
// producer's own `data-part` IDENTITY and nothing about where that element sits.
// Republishing on some other element that also spells `data-part="event"`
// satisfies it. That remaining hole is not left open — it is closed by
// `producerAncestryViolations` below, which walks the owner's enclosing JSX
// elements and compares the whole chain. The two clauses stay separate on
// purpose: each names its own defect, so a misidentified owner and a
// disconnected owner never collapse into one indistinguishable failure.
function producerPlacementViolations(text, path, channel, datum, part) {
  const producers = collectChannelProducers(text, path, channel, datum);
  if (producers.length !== 1) return [`the channel carries ${producers.length} producers, not 1`];

  const owner = producers[0].owner;
  if (!owner) return ['the producer style object never reaches a JSX element'];

  const dataPart = literalDataPart(owner);
  if (dataPart.count !== 1) {
    return [`the producer element carries ${dataPart.count} data-part attributes, not 1`];
  }
  if (dataPart.value === null) return ['the producer element data-part is not a string literal'];
  if (dataPart.value !== part) {
    return [`the producer element is data-part '${dataPart.value}', not '${part}'`];
  }
  return [];
}

// ---------------------------------------------------------------------------
// Producer ANCESTRY.
//
// The placement clause proves the producer's owner is labelled with the sink's
// own part. A DEAD element answers that question exactly as well as the live
// one. Delete the publication from the rendered chip and put it on a
// module-level helper nothing ever calls, or on a `const` inside the column
// callback that is never returned: the producer count stays at exactly 1, the
// owner's `data-part` is still exactly the part the sink selects, the
// direct-paint ban stays empty, the ARC09 floor stays at zero and the entire
// sink half stays green. The channel is published on an element that never
// reaches the document.
//
// So the owner is also walked UP: every enclosing JSX element, nearest-to-outer,
// recorded by the literal `data-part` on its opening element. Parent pointers
// cross callbacks, conditionals and fragments, which is what lets the chain run
// from a chip inside `dayEvents.slice(0, 3).map(...)` out to the root. The
// chains are pinned as exact arrays and compared position by position — a subset
// test or an `includes` would re-admit the very element this walk exists to
// reject.
//
// An enclosing element with NO `data-part` contributes no part identity, so it
// is invisible HERE. That is this clause's blindness, not a statement about what
// the sink selector tolerates: a descendant hop steps over an unnamed DOM
// element, but it does not step over an opaque component, and it is
// `producerSelectorPathViolations` — never this walk — that adjudicates either.
// An element with a non-literal or a doubled `data-part` is NOT invisible — it
// claims a part identity this walk cannot verify, so it enters the chain as an
// explicit marker and fails the comparison by name rather than being skipped.
//
// Stated scope, so the next reader does not over-read this clause either. It
// proves lexical ENCLOSURE, which is two facts short of a rendered producer,
// and neither shortfall is left open:
//
//   * enclosure is not liveness — a dead binding written inside the chain still
//     has the whole chain, and so does a producer returned from a `thisArg`.
//     `producerRenderPathViolations` closes both;
//   * an ancestor claiming no part is invisible here, so an unlabelled `<div>`
//     at a CHILD hop and an opaque component at ANY hop both leave this array
//     byte-identical while breaking the sink selector.
//     `producerSelectorPathViolations` closes both.
//
// All four stay separate functions on purpose: a misidentified owner, a
// disconnected owner, a dead owner and a wrapper-broken hop are four different
// defects, and each has to be able to name its own.
function ownerAncestryParts(owner) {
  const parts = [];

  for (let node = ts.isJsxOpeningElement(owner) ? owner.parent : owner; node; node = node.parent) {
    let opening = null;
    if (ts.isJsxSelfClosingElement(node)) opening = node;
    else if (ts.isJsxElement(node)) opening = node.openingElement;
    if (!opening) continue;

    const dataPart = literalDataPart(opening);
    if (dataPart.count > 1) parts.push(`<${dataPart.count} data-part attributes>`);
    else if (dataPart.count === 1 && dataPart.value === null) parts.push('<non-literal data-part>');
    else if (dataPart.count === 1) parts.push(dataPart.value);
  }

  return parts;
}

function producerAncestryViolations(text, path, channel, datum, ancestry) {
  const producers = collectChannelProducers(text, path, channel, datum);
  if (producers.length !== 1) return [`the channel carries ${producers.length} producers, not 1`];

  const owner = producers[0].owner;
  if (!owner) return ['the producer style object never reaches a JSX element'];

  const actual = ownerAncestryParts(owner);
  if (actual.length !== ancestry.length || actual.some((part, index) => part !== ancestry[index])) {
    return [`the producer ancestry is ${actual.join(' -> ') || '(none)'}, not ${ancestry.join(' -> ')}`];
  }
  return [];
}

// ---------------------------------------------------------------------------
// Producer RENDER PATH.
//
// The ancestry clause walks `.parent` pointers, so it proves where the producer
// is WRITTEN, not that anything returns it. Its own stated residual named the
// survivor: bind the producer to a dead `const` inside an IIFE that sits in
// JSX-child position INSIDE the real chain and returns `null`. The lexical
// ancestry is then the complete expected chain, the owner's `data-part` is
// exact, the count is 1, the paint ban is empty, the ARC09 floor holds — and
// nothing is ever rendered.
//
// So the owner is walked up a SECOND time, asking a different question at every
// hop: does the value carrying this element keep travelling outward AS A VALUE?
// Each hop must be one of
//
//   * a JSX child position, or the `{…}` expression that holds one;
//   * a transparent value wrapper — parentheses, `as`, `satisfies`, `!`;
//   * a rendered branch — a ternary arm, an `&&` RIGHT operand, either side of
//     `||`/`??`. An `&&` LEFT operand is a test, not a rendered value, and is
//     rejected;
//   * a concise arrow body (`(ev) => <div …/>`), which lifts the walk to that
//     arrow; or
//   * a `return` whose expression is the value, which lifts the walk to the
//     NEAREST enclosing function of that RETURN STATEMENT. Taking the nearest
//     function of the return — never of the producer — is what refuses a return
//     that belongs to a nested function: the walk continues from the function
//     that actually yields the value, and that function must then justify
//     itself in turn.
//
// Once the walk is standing on a function, the render has to consume it: either
// it is immediately invoked, or it is handed to `.map`/`.flatMap`, the only
// array methods whose RESULT is what React renders. `forEach`, `filter`,
// `useMemo`, `useCallback`, an event handler all read as not-rendering and are
// rejected rather than assumed. The result of that call then keeps travelling
// outward by the same rules.
//
// Naming the METHOD is not enough, and v5 shipped that hole: `Array.prototype.map`
// takes a SECOND argument, `thisArg`, which is a value the callback is bound to
// and is never itself invoked. A function sitting at argument index 1 of a `.map`
// call renders nothing at all, yet v5's `parent.arguments.includes(node)` admitted
// it and reported the whole chain green. So the callback POSITION is checked, not
// merely the callee name: argument index 0 and nothing else. Every other index is
// fail-closed and named, `thisArg` included.
//
// The walk succeeds only on arriving at the file's DEFAULT-EXPORTED component
// function. Anything else — the top of the file, a helper nothing invokes, a
// variable declaration, a statement, an IIFE whose return does not carry the
// owner — is fail-closed and named.
//
// Stated scope, honestly: this is NOT general data-flow analysis and does not
// claim to be. It follows ONE value outward through the syntactic positions
// that return it. It does not resolve an alias (`const chip = <div …/>` then
// `{chip}`), it does not evaluate conditions, it does not follow a producer
// through a prop, and it does not prove the component is mounted. Every one of
// those reads as a violation rather than as a pass, which is the only safe
// direction for a gate: a legitimate refactor into a shape this walk cannot
// verify reddens loudly instead of certifying silently.
const RENDERING_ARRAY_METHODS = ['map', 'flatMap'];

function isFunctionBoundary(node) {
  return (
    ts.isArrowFunction(node) ||
    ts.isFunctionExpression(node) ||
    ts.isFunctionDeclaration(node) ||
    ts.isMethodDeclaration(node)
  );
}

// The function a `return` actually returns from. It is always called with the
// RETURN STATEMENT, which is what makes "not a nested function" structural
// rather than a check: whatever this finds is by definition the function whose
// call yields the value, so the walk resumes from exactly that boundary.
function nearestFunctionOf(node) {
  for (let parent = node.parent; parent; parent = parent.parent) {
    if (isFunctionBoundary(parent)) return parent;
  }
  return null;
}

function isDefaultExportedComponent(node) {
  if (!ts.isFunctionDeclaration(node)) return false;
  const modifiers = node.modifiers ?? [];
  return (
    modifiers.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword) &&
    modifiers.some((modifier) => modifier.kind === ts.SyntaxKind.DefaultKeyword)
  );
}

// ---------------------------------------------------------------------------
// The ONE tag classification, shared by BOTH walks below.
//
// v7 asserted, in prose and in code, that "an intrinsic lowercase tag renders
// its children, always". **That is false**, and it was the second false green
// this clause shipped. HTML has a closed set of VOID elements — `<input>`,
// `<br>`, `<img>` and eleven others — that cannot contain anything at all. The
// TSX parser accepts `<input><div/></input>` without complaint, so a producer
// wrapped in one parsed clean, walked clean, and read as rendered while no DOM
// on earth would ever render it. A blanket lowercase assumption is exactly the
// shape of mistake the opaque-component finding already was, one level down.
//
// So the classification has THREE values, not two, and every consumer states
// which ones it cares about:
//
//   * `intrinsic` — a lowercase `Identifier` that is not a void tag. This, and
//     only this, is an element that provably emits one node AND renders the
//     children it is given.
//   * `void` — a lowercase `Identifier` in the closed HTML void set. It is
//     REAL, VISIBLE DOM this file can see — that is why the physical walk keeps
//     it as a known element and never calls it opaque — but it renders no
//     children, ever, so the render path must refuse it.
//   * `opaque` — everything else: a component identifier (`<ModernSpinner …>`),
//     a member expression (`<Motion.div …>`), a namespaced tag
//     (`<svg:rect …>`). What it emits, and whether it renders `children` at
//     all, is decided in code this file cannot see.
//
// Both walks read THIS function and nothing else, so they can never disagree
// about what a tag IS. They legitimately differ in what they DO with the
// verdict, and each says so at its own call site: the render path cares about
// `void` and `opaque`, the physical path cares only about `opaque`, because a
// void element is DOM the selector can see even though it can host nothing.
// Carrying the LABEL here rather than a bare kind is deliberate: one function
// owns the verdict AND the way it is spelled in every message either clause
// emits.
//
// The set is the HTML Standard's void-element list, closed and spelled out
// rather than pattern-matched. If HTML ever grows another, this line is the one
// place that changes.
const HTML_VOID_ELEMENTS = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
]);

function classifyTag(opening) {
  const tag = opening.tagName;
  if (!ts.isIdentifier(tag) || !/^[a-z]/.test(tag.text)) {
    return { kind: 'opaque', label: `<${tag.getText()}: component, DOM unknown>` };
  }
  if (HTML_VOID_ELEMENTS.has(tag.text)) {
    return { kind: 'void', label: `<${tag.text}: void element, renders no children>` };
  }
  return { kind: 'intrinsic', label: `<${tag.text}>` };
}

// Every branch below moves `node` strictly toward the file root — to a parent,
// or to the function enclosing a parent — so the walk terminates at the
// SourceFile even on input this gate has never seen.
//
// v6 accepted ANY parent JSX element as continuity: `parent.children.includes`
// was asked as one question of elements and fragments together. That is the
// third false green this gate has shipped, and it is the loudest of the three,
// because it lets a producer inside `<DropChildren>…</DropChildren>` — a
// component that renders `null` — read as rendered while the tree mounts
// nothing at all. A fragment and an element are NOT the same hop and are now
// asked separately.
function renderPathViolation(owner) {
  // The producer's OWN element is judged by the same classification, before the
  // walk starts. A style object handed to a component is a PROP, not a paint:
  // the component decides whether that object ever reaches a DOM node, or
  // reaches one this file never named. Same function as every hop below, so the
  // owner verdict and the crossing verdict can never drift apart.
  //
  // Only `opaque` is refused here, and the asymmetry is deliberate rather than
  // an oversight: a VOID element cannot host children, but it is still a real
  // DOM node that applies its own `style`. `<input style={producer} />` paints.
  // The void verdict belongs to the crossing branch, where children are what is
  // at stake — not here, where they are not.
  const ownerTag = classifyTag(owner);
  if (ownerTag.kind === 'opaque') {
    return `the producer is a style prop of '${ownerTag.label}', which may not apply it to DOM`;
  }

  let node = ts.isJsxOpeningElement(owner) ? owner.parent : owner;

  for (;;) {
    if (isFunctionBoundary(node) && isDefaultExportedComponent(node)) return null;

    const parent = node.parent;
    if (!parent) {
      return 'the render path reaches the top of the file without entering the exported component';
    }

    if (
      (ts.isParenthesizedExpression(parent) ||
        ts.isAsExpression(parent) ||
        ts.isSatisfiesExpression(parent) ||
        ts.isNonNullExpression(parent) ||
        ts.isTypeAssertionExpression(parent)) &&
      parent.expression === node
    ) {
      node = parent;
      continue;
    }

    if (isFunctionBoundary(node)) {
      if (ts.isCallExpression(parent) && parent.expression === node) {
        node = parent;
        continue;
      }
      if (ts.isCallExpression(parent) && parent.arguments.includes(node)) {
        const callee = parent.expression;
        const method =
          ts.isPropertyAccessExpression(callee) && ts.isIdentifier(callee.name)
            ? callee.name.text
            : null;
        if (method === null || !RENDERING_ARRAY_METHODS.includes(method)) {
          return `the producer is handed to '${method ?? ts.SyntaxKind[callee.kind]}', which is not a rendering array callback`;
        }
        // ONLY argument 0 is the rendered callback. Argument 1 of `.map` is
        // `thisArg` — a bound receiver, never invoked — and any further index is
        // a shape this walk has never seen. Both are refused by position.
        if (parent.arguments[0] !== node) {
          return `the producer is handed to '${method}' at argument index ${parent.arguments.indexOf(node)}, which is not the rendered callback`;
        }
        node = parent;
        continue;
      }
      return `the producer is returned by a function the render path never invokes (${ts.SyntaxKind[parent.kind]})`;
    }

    // A FRAGMENT is transparent, and provably so: it emits no node of its own
    // and has no implementation that could choose not to render a child. Being
    // a fragment child IS being rendered wherever the fragment is rendered, so
    // the walk continues through it without asking anything further.
    if (ts.isJsxFragment(parent) && parent.children.includes(node)) {
      node = parent;
      continue;
    }
    // An ELEMENT is a different question, and it is the question v6 never
    // asked. Only an INTRINSIC, NON-VOID DOM tag renders the children it is
    // given, and only that continues the walk.
    //
    // A COMPONENT may render `null`, ignore `children`, render them into a
    // portal, or render them behind a condition; lexical containment inside one
    // proves nothing about being rendered.
    //
    // A VOID element is worse, because it fails in the one direction a reader
    // would not check: the containment is not merely unproven, it is IMPOSSIBLE.
    // `<input><div style={producer} /></input>` parses — the TSX grammar has no
    // opinion about void tags — and v7 walked straight through it on the
    // strength of a lowercase first letter. Nothing inside it will ever mount.
    //
    // Both fail CLOSED, each naming its own reason with the shared label.
    if (ts.isJsxElement(parent) && parent.children.includes(node)) {
      const crossed = classifyTag(parent.openingElement);
      if (crossed.kind === 'opaque') {
        return `render path crosses '${crossed.label}', which may not render its children`;
      }
      if (crossed.kind === 'void') {
        return `render path crosses '${crossed.label}', which the TSX parser accepts but no DOM ever mounts`;
      }
      node = parent;
      continue;
    }
    if (ts.isJsxExpression(parent) && parent.expression === node) {
      node = parent;
      continue;
    }
    if (ts.isConditionalExpression(parent) && (parent.whenTrue === node || parent.whenFalse === node)) {
      node = parent;
      continue;
    }
    if (ts.isBinaryExpression(parent) && (parent.left === node || parent.right === node)) {
      const operator = parent.operatorToken.kind;
      const rendersLeft =
        operator === ts.SyntaxKind.BarBarToken || operator === ts.SyntaxKind.QuestionQuestionToken;
      const rendersRight = rendersLeft || operator === ts.SyntaxKind.AmpersandAmpersandToken;
      if ((parent.right === node && rendersRight) || (parent.left === node && rendersLeft)) {
        node = parent;
        continue;
      }
      return 'the render path enters a binary operand that is a test, not a rendered value';
    }
    if (ts.isArrowFunction(parent) && parent.body === node) {
      node = parent;
      continue;
    }
    if (ts.isReturnStatement(parent) && parent.expression === node) {
      const owningFunction = nearestFunctionOf(parent);
      if (!owningFunction) return 'the producer is returned outside any function';
      node = owningFunction;
      continue;
    }
    if (ts.isCallExpression(parent) && parent.expression === node) {
      node = parent;
      continue;
    }
    return `the render path stops at ${ts.SyntaxKind[parent.kind]}, which does not return the producer`;
  }
}

function producerRenderPathViolations(text, path, channel, datum) {
  const producers = collectChannelProducers(text, path, channel, datum);
  if (producers.length !== 1) return [`the channel carries ${producers.length} producers, not 1`];

  const owner = producers[0].owner;
  if (!owner) return ['the producer style object never reaches a JSX element'];

  const violation = renderPathViolation(owner);
  return violation ? [violation] : [];
}

// ---------------------------------------------------------------------------
// Producer PHYSICAL SELECTOR PATH.
//
// `ownerAncestryParts` records only elements that CLAIM a part, so an ancestor
// with no `data-part` is invisible to it. At a DESCENDANT hop that is correct —
// the combinator does not care what sits between. At a CHILD hop it is the
// second false green v4 shipped: wrap the grid in a bare `<div>` and the named
// ancestry is byte-identical while `root > grid` no longer matches anything.
// `selectorAncestryDisagreements` does not cover it either: that function
// compares two pinned CONSTANTS to each other and never reads the live tree.
//
// So the owner is walked up a THIRD time, recording EVERY physical DOM element
// on the way out — labelled or not. Nothing is dropped:
//
//   * one literal `data-part` enters as that part, and is the only kind of
//     entry a selector step can match;
//   * no `data-part` enters as `<div: no data-part>` — the wrapper is named,
//     not skipped;
//   * a non-literal or doubled `data-part` enters as its own marker, because it
//     claims a part identity this walk cannot verify;
//   * a COMPONENT element (`<ModernSpinner …/>`) enters as an OPAQUE marker: it
//     renders DOM this file cannot see, so it can never satisfy a step and can
//     never be assumed away.
//
// Only React fragments are transparent, and only because they provably emit no
// DOM node at all.
//
// The live path is then matched against the CANONICAL SINK SELECTOR itself, not
// against a second pinned array: a descendant hop may skip entries, a child hop
// must land on the immediately preceding entry, and the walk must finish on the
// owner. An anonymous wrapper at a child hop is reported BY ITS LABEL.
//
// "May skip entries" is where v5 shipped its second hole. A descendant hop
// tolerated ANY intervening entry, including an opaque component — so a
// component that renders `null`, or renders its children under a wrapper, or
// drops them entirely, was skipped over in silence and the hop still read green.
// A descendant combinator only tolerates DOM elements it does not name; it does
// NOT tolerate an element whose DOM this file cannot see, because that element
// may emit nothing, or emit a container that breaks the hop below it. So opacity
// is now refused at EVERY hop, descendant included, and named by label. An
// anonymous DOM wrapper stays legal at a descendant hop, because it provably
// emits exactly one element that the combinator is allowed to step over.
//
// The check runs only BETWEEN selector steps. Entries physically above the
// selector's HEAD are recorded but not examined, because the pinned selector
// does not anchor its head to the document root — the same stated boundary the
// clause has carried since v5, not a new exemption for opacity.
// `selectorAncestryDisagreements` stays and keeps its own separate job —
// proving the two pinned constants agree — because a drifted pin and a drifted
// DOM are different defects and must not collapse into one message.
function physicalPathStep(opening) {
  // The opacity verdict is NOT restated here. It is read from `classifyTag`,
  // the same function the render-path walk consults, so an element this gate
  // calls opaque in one clause cannot be transparent in the other.
  //
  // This clause consumes ONE of the three verdicts: `opaque`. A VOID element is
  // deliberately NOT opaque here, and calling it so would be a false report, not
  // extra strictness. `<input>` is DOM this file authored and the selector can
  // see — one element, known tag, known arity, exactly what a descendant
  // combinator may step over. What it cannot do is HOST the producer, and that
  // is a render-path fact, reported once, by the clause that owns it. A void
  // ancestor must never be described here as a component whose DOM is unknown.
  const classified = classifyTag(opening);
  if (classified.kind === 'opaque') return { part: null, opaque: true, label: classified.label };

  // Everything below is a real DOM element authored in this file. Its part may
  // be unknown, but its existence and its arity are not: exactly one node is
  // emitted here. That is what a descendant combinator is allowed to step over,
  // and it is why only the opaque branch above is refused.
  const tag = opening.tagName;
  const dataPart = literalDataPart(opening);
  if (dataPart.count > 1) {
    return { part: null, opaque: false, label: `<${tag.text}: ${dataPart.count} data-part attributes>` };
  }
  if (dataPart.count === 1 && dataPart.value === null) {
    return { part: null, opaque: false, label: `<${tag.text}: non-literal data-part>` };
  }
  if (dataPart.count === 1) return { part: dataPart.value, opaque: false, label: dataPart.value };
  return { part: null, opaque: false, label: `<${tag.text}: no data-part>` };
}

function ownerPhysicalJsxPath(owner) {
  const steps = [];

  for (let node = ts.isJsxOpeningElement(owner) ? owner.parent : owner; node; node = node.parent) {
    let opening = null;
    if (ts.isJsxSelfClosingElement(node)) opening = node;
    else if (ts.isJsxElement(node)) opening = node.openingElement;
    if (!opening) continue;
    steps.push(physicalPathStep(opening));
  }

  return steps;
}

function producerSelectorPathViolations(text, path, channel, datum, selector) {
  const producers = collectChannelProducers(text, path, channel, datum);
  if (producers.length !== 1) return [`the channel carries ${producers.length} producers, not 1`];

  const owner = producers[0].owner;
  if (!owner) return ['the producer style object never reaches a JSX element'];

  const outward = ownerPhysicalJsxPath(owner).reverse();
  const violations = [];
  let cursor = -1;

  for (const step of selectorSteps(selector)) {
    let found = -1;
    for (let index = cursor + 1; index < outward.length; index += 1) {
      if (outward[index].part === step.part) {
        found = index;
        break;
      }
    }

    if (found === -1) {
      violations.push(`selector part '${step.part}' is absent from the live physical path`);
      return violations;
    }

    const crossed = outward.slice(cursor + 1, found);
    if (step.child === true && found !== cursor + 1) {
      const inserted = crossed.map((entry) => `'${entry.label}'`).join(', ');
      const from = cursor >= 0 ? outward[cursor].label : '(document)';
      violations.push(
        `selector spells '${from}' > '${step.part}' but the live DOM inserts ${inserted}`,
      );
    }
    // Opacity is refused at EVERY hop, descendant included. `cursor >= 0` keeps
    // the clause off the entries ABOVE the selector's head, which it has never
    // examined; it is not an exemption for opaque entries between steps.
    if (cursor >= 0) {
      const opaque = crossed.filter((entry) => entry.opaque === true);
      if (opaque.length > 0) {
        violations.push(
          `selector hops '${outward[cursor].label}' to '${step.part}' across ${opaque
            .map((entry) => `'${entry.label}'`)
            .join(', ')}, whose emitted DOM this file cannot see`,
        );
      }
    }
    cursor = found;
  }

  if (cursor !== outward.length - 1) {
    violations.push(
      `the live physical path continues past the selector tail with ${outward
        .slice(cursor + 1)
        .map((entry) => entry.label)
        .join(' -> ')}`,
    );
  }

  return violations;
}

// The two structural mutants below are built by SPLICING TEXT AT AST
// POSITIONS, never by matching a source string. A textual anchor drifts
// silently the moment the file is reformatted; an element located by its
// literal `data-part` is either there exactly once or the builder fails loudly.
// The uniqueness assertion is the drift alarm, and it is also why a `data-part`
// mentioned in a comment or inside a `querySelector` string cannot be picked up
// as the anchor — neither is a JSX element.
function uniqueElementWithPart(text, path, part) {
  const sourceFile = parseTsx(text, path);
  const found = [];

  const visit = (node) => {
    let opening = null;
    if (ts.isJsxSelfClosingElement(node)) opening = node;
    else if (ts.isJsxElement(node)) opening = node.openingElement;
    if (opening) {
      const dataPart = literalDataPart(opening);
      if (dataPart.count === 1 && dataPart.value === part) found.push(node);
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);

  assert.equal(found.length, 1, `exactly one JSX element must carry data-part="${part}"`);
  return { sourceFile, element: found[0] };
}

// One wrapper element carrying no `data-part`, physically between the named
// element and its parent. The named ancestry is blind to it by design; the live
// selector path is not. The tag decides WHICH blindness is under test: a
// lowercase `div` is a transparent DOM interloper, an uppercase identifier is an
// opaque component whose emitted DOM this file cannot see.
function withWrapperElement(text, path, part, tag) {
  const { sourceFile, element } = uniqueElementWithPart(text, path, part);
  const start = element.getStart(sourceFile);
  const end = element.getEnd();
  return `${text.slice(0, start)}<${tag}>${text.slice(start, end)}</${tag}>${text.slice(end)}`;
}

function withAnonymousWrapper(text, path, part) {
  return withWrapperElement(text, path, part, 'div');
}

// A snippet spliced into JSX-CHILD position inside the named element, so that
// whatever it declares is lexically enclosed by the entire live chain and the
// ancestry clause reads it as perfect. What the snippet does with the producer —
// bind it to a dead `const`, return it from a `thisArg` — is the mutant's
// business, not this helper's.
function withJsxChildSnippet(text, path, part, snippet) {
  const { element } = uniqueElementWithPart(text, path, part);
  assert.ok(ts.isJsxElement(element), `data-part="${part}" must have children to host the snippet`);
  const at = element.openingElement.getEnd();
  return `${text.slice(0, at)}${snippet}${text.slice(at)}`;
}

// The two permanent disconnection mutants are only evidence if they are real
// TSX: a mutant that merely failed to parse would fail every clause at once, for
// the wrong reason, and would prove nothing about the ancestry chain.
// `transpileModule` reports SYNTACTIC diagnostics without building a program, so
// it answers "does this parse" without pretending to type-check a file whose
// imports are not resolved here.
function tsxSyntaxDiagnostics(text, path) {
  const { diagnostics } = ts.transpileModule(text, {
    fileName: path,
    reportDiagnostics: true,
    compilerOptions: { jsx: ts.JsxEmit.Preserve, target: ts.ScriptTarget.Latest },
  });
  return (diagnostics ?? []).map((diagnostic) =>
    ts.flattenDiagnosticMessageText(diagnostic.messageText, ' '),
  );
}

// The direct-paint ban is the wider net of the two: any paint property whose
// initializer MENTIONS the datum colour anywhere in its subtree, so
// `background: ev.color ?? 'var(--ds-color-primary)'` is caught as surely as a
// bare `background: ev.color`.
function collectDirectPaints(text, path, paintProps, datum) {
  const sourceFile = parseTsx(text, path);
  const paints = [];

  const mentionsDatumColor = (node) => {
    if (isDatumColor(node, datum)) return true;
    let found = false;
    ts.forEachChild(node, (child) => {
      if (!found) found = mentionsDatumColor(child);
    });
    return found;
  };

  for (const object of styleObjectLiterals(sourceFile)) {
    for (const property of object.properties) {
      if (!ts.isPropertyAssignment(property)) continue;
      const key = propertyKey(property.name);
      if (key.text === null || !paintProps.includes(key.text)) continue;
      if (!mentionsDatumColor(property.initializer)) continue;
      const start = sourceFile.getLineAndCharacterOfPosition(ts.skipTrivia(sourceFile.text, property.pos));
      paints.push(`${key.text} @ line ${start.line + 1}`);
    }
  }

  return paints;
}

// ---------------------------------------------------------------------------
// Sink side.
//
// A migrated accent channel is three independent facts, so it gets three
// independent assertions rather than one compound match: the caller publishes
// the custom property exactly once, the caller paints nothing directly from the
// same datum, and the engine skin consumes that property in exactly one scoped
// declaration.
//
// The sink net is deliberately wide — every declaration whose VALUE names the
// channel, not every declaration that already matches the expected shape. A net
// narrowed to the expected prop/value would collapse four distinct sink defects
// into one "count is 0" failure. Wide, they stay separable: deleting or
// duplicating the sink moves the count, while a drifted property, a drifted
// fallback and a widened selector each leave the count at exactly one and fail
// their own assertion. Comments that merely name the channel are not
// declarations, so postcss never sees them.
//
// The stylesheet arrives as text rather than as a path so the same collector
// serves the live file and the in-memory scope mutants at the end of each test.
function collectSinks(css, from, channel) {
  const sinks = [];
  postcss.parse(css, { from }).walkDecls((declaration) => {
    if (declaration.value.includes(channel)) sinks.push(declaration);
  });
  return sinks;
}

// Multi-line selectors carry the five CSS whitespace characters between their
// compound parts, so collapse those before comparing — same CSS-only whitespace
// set as the rest of this file, never `\s`/`trim`.
function normalizeSelector(selector) {
  return cssTrim(selector.replace(CSS_WHITESPACE_RUN, ' '));
}

// Scope is an IDENTITY, not a containment. The first spelling asked
// `selector.includes(root) && selector.includes(part)` of the whole selector
// text — but a rule carries a comma-separated LIST, so appending `, .anything`
// to the sink's rule leaves the declaration count at one, leaves both `includes`
// true, and paints the channel on every element that matches the appended
// alternative. So: exactly one selector in the list, spelled exactly the way the
// live stylesheet spells it. Both canonical literals are pinned constants read
// off the two Modern skins; no expectation is derived from the file under test.
const CALENDAR_ACCENT_SELECTOR =
  ".ds-pattern-calendar-view.ds-engine-modern[data-part='root']" +
  " > [data-part='grid'] [data-part='day-cell'] [data-part='event']";
const KANBAN_ACCENT_SELECTOR =
  ".ds-pattern-kanban-board.ds-engine-modern[data-part='root']" +
  " > [data-part='board'] > [data-part='column'] > [data-part='column-header']";

// The element the sink SELECTS, and therefore the only element the producer may
// sit on. These are pinned literals like the selectors above, not values read
// off the file under test; each channel test additionally proves its part is the
// tail of its selector, so the placement expectation and the sink expectation
// are provably about one element rather than two hopeful constants.
const CALENDAR_ACCENT_PART = 'event';
const KANBAN_ACCENT_PART = 'column-header';

// The exact JSX ancestry of each producer's owner, nearest-to-outer, read off
// the live tree by `ownerAncestryParts`. Pinned literals like the selectors
// above; no expectation is derived from the file under test.
//
// Calendar carries one level the sink selector never names: `week-row`, the
// layout-transparent row wrapper the Modern skin renders with `display:
// contents`. That is not a discrepancy to paper over and not a reason to prune
// the chain — it is exactly what the DESCENDANT combinator between `grid` and
// `day-cell` permits. `selectorAncestryDisagreements` proves it, so the pinned
// ancestry and the pinned selector are one element rather than two hopeful
// constants. Kanban's selector is spelled entirely with child combinators, so
// its ancestry matches it one level for one level.
const CALENDAR_ACCENT_ANCESTRY = ['event', 'day-cell', 'week-row', 'grid', 'root'];
const KANBAN_ACCENT_ANCESTRY = ['column-header', 'column', 'board', 'root'];

const SELECTOR_PART_PATTERN = /\[data-part='([^']+)'\]/g;

// The pinned selector read as an ordered list of parts, each carrying the
// combinator that precedes it: `>` is a CHILD hop, anything else a descendant
// hop. This reads the pinned CONSTANT, never a source file — the ancestry
// contract itself is an exact array comparison and never a text match.
function selectorSteps(selector) {
  const steps = [];
  let previousEnd = null;

  for (const match of selector.matchAll(SELECTOR_PART_PATTERN)) {
    const gap = previousEnd === null ? null : selector.slice(previousEnd, match.index);
    steps.push({ part: match[1], child: gap === null ? null : gap.includes('>') });
    previousEnd = match.index + match[0].length;
  }

  return steps;
}

// Do the two pinned constants describe ONE element? Every part the selector
// names must appear in the ancestry in the same order; a CHILD hop must be
// adjacent there, because an unnamed element between them would break the
// selector outright; a descendant hop may skip levels, which is precisely what
// makes `week-row` legal. The ancestry must also stop where the selector's
// outermost part does, so a chain that keeps climbing past `root` is reported
// rather than accepted.
function selectorAncestryDisagreements(selector, ancestry) {
  const outward = [...ancestry].reverse();
  const disagreements = [];
  let cursor = -1;

  for (const step of selectorSteps(selector)) {
    const found = outward.indexOf(step.part, cursor + 1);
    if (found === -1) {
      disagreements.push(`selector part '${step.part}' is absent from the ancestry`);
      return disagreements;
    }
    if (step.child === true && found !== cursor + 1) {
      const inserted = outward.slice(cursor + 1, found).map((part) => `'${part}'`).join(', ');
      disagreements.push(
        `selector spells '${outward[cursor]}' > '${step.part}' but the ancestry inserts ${inserted}`,
      );
    }
    cursor = found;
  }

  if (cursor !== outward.length - 1) {
    disagreements.push(
      `the ancestry continues past the selector tail with ${outward.slice(cursor + 1).join(' -> ')}`,
    );
  }

  return disagreements;
}

function scopeViolations(declaration, canonical) {
  const rule = declaration.parent;
  if (rule?.type !== 'rule') return ['the accent sink must live in a style rule'];

  const violations = [];
  if (rule.selectors.length !== 1) {
    violations.push(`the sink rule carries ${rule.selectors.length} selectors, not 1`);
  }

  const selector = normalizeSelector(rule.selector);
  if (selector !== canonical) violations.push(`the sink selector is ${selector}`);
  return violations;
}

// The unscoped-alternative mutant, built in memory from the live stylesheet: the
// sink's own rule gains a second, globally-matching selector. Nothing on disk is
// touched.
function withLeakedSelectorAlternative(css, rule) {
  const widened = css.replace(rule.selector, `${rule.selector}, .ds-leak`);
  assert.notEqual(widened, css, 'the leak mutant must actually widen the sink rule');
  return widened;
}

const CALENDAR_PRODUCER_LITERAL = "{ '--ds-calendar-event-accent': ev.color } as React.CSSProperties";

test('CK-E Calendar Modern crosses the event accent only through a scoped custom property', () => {
  const path = pathFor(FILES.calendarModern);
  const text = source(FILES.calendarModern);

  assert.equal(
    countChannelProducers(text, path, CALENDAR_CHANNEL, 'ev'),
    1,
    'the Modern calendar must publish the event accent exactly once',
  );
  assert.ok(
    CALENDAR_ACCENT_SELECTOR.endsWith(`[data-part='${CALENDAR_ACCENT_PART}']`),
    'the pinned part must be the tail of the pinned sink selector',
  );
  assert.deepEqual(
    producerPlacementViolations(text, path, CALENDAR_CHANNEL, 'ev', CALENDAR_ACCENT_PART),
    [],
    'the Modern calendar must publish the accent ON the event chip the skin selects',
  );
  assert.deepEqual(
    selectorAncestryDisagreements(CALENDAR_ACCENT_SELECTOR, CALENDAR_ACCENT_ANCESTRY),
    [],
    'the pinned ancestry and the pinned sink selector must describe one element',
  );
  assert.deepEqual(
    producerAncestryViolations(text, path, CALENDAR_CHANNEL, 'ev', CALENDAR_ACCENT_ANCESTRY),
    [],
    'the Modern calendar chip carrying the accent must be the one inside the live grid',
  );
  assert.deepEqual(
    producerRenderPathViolations(text, path, CALENDAR_CHANNEL, 'ev'),
    [],
    'the Modern calendar chip carrying the accent must be RETURNED into the rendered tree',
  );
  assert.deepEqual(
    producerSelectorPathViolations(text, path, CALENDAR_CHANNEL, 'ev', CALENDAR_ACCENT_SELECTOR),
    [],
    'the live DOM path down to the chip must satisfy the sink selector hop for hop',
  );
  assert.deepEqual(
    collectDirectPaints(text, path, CALENDAR_FILL_PROPS, 'ev'),
    [],
    'the Modern calendar must not paint the event fill directly from ev.color',
  );

  const cssPath = join(cssRoot, 'modern/skin/pattern-calendar-view.css');
  const css = readFileSync(cssPath, 'utf8');
  const sinks = collectSinks(css, cssPath, CALENDAR_CHANNEL);
  assert.equal(sinks.length, 1, 'the Modern calendar skin must consume the event accent exactly once');
  assert.equal(cssTrim(sinks[0].prop), 'background', 'the event accent must land as the chip fill');
  assert.equal(
    cssTrim(sinks[0].value),
    'var(--ds-calendar-event-accent, var(--ds-color-primary))',
    'the event accent sink lost its exact primary fallback',
  );
  assert.deepEqual(
    scopeViolations(sinks[0], CALENDAR_ACCENT_SELECTOR),
    [],
    'the event accent sink must carry exactly the canonical Modern calendar selector',
  );

  // The causal pins, permanent. Every mutant is constructed in memory from the
  // live source; no repository file is ever mutated. Each pair states what the
  // AST/identity check now reports and, beside it, the false green the retired
  // byte-level spelling produced on the same input.
  assert.equal(
    text.split(CALENDAR_PRODUCER_LITERAL).length - 1,
    1,
    'the live producer literal drifted, so the mutants below no longer describe it',
  );

  const commentedProducer = `${text}\n// style={${CALENDAR_PRODUCER_LITERAL}}\n`;
  assert.equal(
    countChannelProducers(commentedProducer, path, CALENDAR_CHANNEL, 'ev'),
    1,
    'a commented-out producer is not a producer',
  );
  assert.equal(
    commentedProducer.match(RETIRED_CALENDAR_PRODUCER_REGEX)?.length,
    2,
    'the retired regex is what counted the commented corpse as a second publication',
  );

  const commentedPaint = `${text}\n// <div style={{ background: ev.color }} />\n`;
  assert.deepEqual(
    collectDirectPaints(commentedPaint, path, CALENDAR_FILL_PROPS, 'ev'),
    [],
    'a commented-out direct paint is not a direct paint',
  );
  assert.match(
    commentedPaint,
    RETIRED_CALENDAR_PAINT_REGEX,
    'the retired regex is what reddened the ban on a commented corpse',
  );

  for (const [site, snippet] of [
    ['quoted in a string', `const quoted = "style={${CALENDAR_PRODUCER_LITERAL}}";`],
    ['on a non-style object', `const loose = { '${CALENDAR_CHANNEL}': ev.color };`],
    [
      'on an aliased style object',
      `const aliased = { '${CALENDAR_CHANNEL}': ev.color };\nconst alias = <div style={aliased} />;`,
    ],
    ['under a computed key', `const computed = <div style={{ ['${CALENDAR_CHANNEL}']: ev.color }} />;`],
  ]) {
    assert.equal(
      countChannelProducers(`${text}\n${snippet}\n`, path, CALENDAR_CHANNEL, 'ev'),
      1,
      `a channel ${site} must not be counted as the publication`,
    );
  }

  // The collector still moves when the real producer moves — the pins above
  // narrow it, they do not blind it.
  assert.equal(
    countChannelProducers(text.replace(CALENDAR_PRODUCER_LITERAL, '{} as React.CSSProperties'), path, CALENDAR_CHANNEL, 'ev'),
    0,
    'deleting the live producer must drop the count to zero',
  );
  assert.equal(
    countChannelProducers(`${text}\nconst twice = <div style={${CALENDAR_PRODUCER_LITERAL}} />;\n`, path, CALENDAR_CHANNEL, 'ev'),
    2,
    'a second live producer must raise the count',
  );
  const restoredPaint = collectDirectPaints(
    text.replace(CALENDAR_PRODUCER_LITERAL, '{ background: ev.color } as React.CSSProperties'),
    path,
    CALENDAR_FILL_PROPS,
    'ev',
  );
  assert.equal(restoredPaint.length, 1, 'restoring the inline fill must be reported exactly once');
  assert.match(
    restoredPaint[0],
    /^background @ line \d+$/,
    'a restored inline fill must be reported by property and site',
  );

  // Class C — the DISCONNECTED channel, the mutant that survived v2. Each
  // variant deletes the live publication from the chip and republishes it where
  // the sink can never inherit it from: on a CHILD of the chip, on an element
  // whose `data-part` is a spread rather than an attribute, on a dynamic
  // `data-part`, on a different part, and on two `data-part`s at once. Every one
  // keeps the producer count at exactly 1, keeps the direct-paint ban empty, and
  // leaves the whole sink half of this test green — the accent simply never
  // reaches the chip, because a custom property inherits down and never up. Only
  // the placement clause moves, and it names the site.
  const displaced = text.replace(CALENDAR_PRODUCER_LITERAL, '{} as React.CSSProperties');
  for (const [site, element, violation] of [
    [
      'on a child of the chip',
      `<div data-part="event"><span style={${CALENDAR_PRODUCER_LITERAL}} /></div>`,
      'the producer element carries 0 data-part attributes, not 1',
    ],
    [
      'on a spread data-part',
      `<div {...{ 'data-part': 'event' }} style={${CALENDAR_PRODUCER_LITERAL}} />`,
      'the producer element carries 0 data-part attributes, not 1',
    ],
    [
      'on a dynamic data-part',
      `<div data-part={part} style={${CALENDAR_PRODUCER_LITERAL}} />`,
      'the producer element data-part is not a string literal',
    ],
    [
      'on the wrong part',
      `<div data-part="day-cell" style={${CALENDAR_PRODUCER_LITERAL}} />`,
      "the producer element is data-part 'day-cell', not 'event'",
    ],
    [
      'on a doubled data-part',
      `<div data-part="event" data-part="event" style={${CALENDAR_PRODUCER_LITERAL}} />`,
      'the producer element carries 2 data-part attributes, not 1',
    ],
  ]) {
    const moved = `${displaced}\nconst moved = ${element};\n`;
    assert.equal(
      countChannelProducers(moved, path, CALENDAR_CHANNEL, 'ev'),
      1,
      `a producer ${site} still counts exactly once — that is the false green`,
    );
    assert.deepEqual(
      collectDirectPaints(moved, path, CALENDAR_FILL_PROPS, 'ev'),
      [],
      `a producer ${site} paints nothing directly either — the ban stays green`,
    );
    assert.deepEqual(
      producerPlacementViolations(moved, path, CALENDAR_CHANNEL, 'ev', CALENDAR_ACCENT_PART),
      [violation],
      `the placement clause must reject a producer ${site}`,
    );
    assert.equal(
      producerAncestryViolations(moved, path, CALENDAR_CHANNEL, 'ev', CALENDAR_ACCENT_ANCESTRY).length,
      1,
      `the ancestry clause must reject a producer ${site} as well`,
    );
    assert.equal(
      producerRenderPathViolations(moved, path, CALENDAR_CHANNEL, 'ev').length,
      1,
      `the render-path clause must reject a producer ${site} as well`,
    );
    assert.equal(
      producerSelectorPathViolations(moved, path, CALENDAR_CHANNEL, 'ev', CALENDAR_ACCENT_SELECTOR).length,
      1,
      `the live selector-path clause must reject a producer ${site} as well`,
    );
  }

  // The clause still moves with the real producer — it narrows, it does not
  // blind. A second live publication fails placement as well as the count.
  assert.deepEqual(
    producerPlacementViolations(
      `${text}\nconst twice = <div data-part="event" style={${CALENDAR_PRODUCER_LITERAL}} />;\n`,
      path,
      CALENDAR_CHANNEL,
      'ev',
      CALENDAR_ACCENT_PART,
    ),
    ['the channel carries 2 producers, not 1'],
    'a correctly-placed SECOND producer must still fail the placement clause',
  );

  // Class D — the DISCONNECTED OWNER, the mutant that survived v3, permanent.
  // The live publication is deleted from the rendered chip and republished on a
  // module-level helper that nothing ever calls. Every earlier clause is
  // satisfied by construction: the file still parses, the ARC09 floor is still
  // zero, the channel is still published exactly once, the owner still carries
  // exactly one literal `data-part` and that part is exactly the sink's own
  // `event`, and nothing is painted directly. A reviewer reading v3's report
  // would see an entirely green producer half while the chip in the grid paints
  // the fallback forever. The ancestry moves — a chip that is not inside
  // `day-cell > week-row > grid > root` is not the chip the sink paints, however
  // correctly it is labelled — and it names the chain it actually found. The two
  // v5 clauses reject it as well, from their own angles: nothing calls the
  // helper, and the physical path never reaches `root`. Those are additions to
  // this mutant's verdict, never a downgrade of the exact chain it pins.
  const orphanedProducer =
    `${displaced}\n` +
    `function DisconnectedEventChip(ev: { color?: string }) {\n` +
    `  return <div data-part="${CALENDAR_ACCENT_PART}" style={${CALENDAR_PRODUCER_LITERAL}} />;\n` +
    `}\n`;

  assert.deepEqual(
    tsxSyntaxDiagnostics(orphanedProducer, path),
    [],
    'the disconnected-owner mutant must be real TSX, not a parse failure',
  );
  assert.equal(
    countArc09PaintInFile(orphanedProducer, path),
    FILES.calendarModern.floor,
    'the disconnected-owner mutant must hold the ARC09 floor at zero',
  );
  assert.equal(
    countChannelProducers(orphanedProducer, path, CALENDAR_CHANNEL, 'ev'),
    1,
    'the disconnected owner still publishes exactly once — that is the false green',
  );
  assert.deepEqual(
    collectDirectPaints(orphanedProducer, path, CALENDAR_FILL_PROPS, 'ev'),
    [],
    'the disconnected owner paints nothing directly either — the ban stays green',
  );
  assert.deepEqual(
    producerPlacementViolations(orphanedProducer, path, CALENDAR_CHANNEL, 'ev', CALENDAR_ACCENT_PART),
    [],
    'the disconnected owner carries the sink part exactly — the v3 clause stays green',
  );
  assert.deepEqual(
    producerAncestryViolations(orphanedProducer, path, CALENDAR_CHANNEL, 'ev', CALENDAR_ACCENT_ANCESTRY),
    [
      `the producer ancestry is ${CALENDAR_ACCENT_PART}, not ${CALENDAR_ACCENT_ANCESTRY.join(' -> ')}`,
    ],
    'the ancestry clause must reject the disconnected owner, and it must name the chain',
  );
  assert.deepEqual(
    producerRenderPathViolations(orphanedProducer, path, CALENDAR_CHANNEL, 'ev'),
    ['the producer is returned by a function the render path never invokes (SourceFile)'],
    'the render-path clause must reject the disconnected owner as an uninvoked helper',
  );
  assert.equal(
    producerSelectorPathViolations(orphanedProducer, path, CALENDAR_CHANNEL, 'ev', CALENDAR_ACCENT_SELECTOR)
      .length,
    1,
    'the live selector-path clause must reject the disconnected owner as well',
  );

  // Class E — the DEAD IN-CHAIN producer, the mutant that survived v4,
  // permanent. This is the exact residual v4 wrote down and did not close: the
  // publication is deleted from the rendered chip and rebuilt as a `const`
  // inside an IIFE that sits in JSX-CHILD POSITION inside the live `day-cell`,
  // and the IIFE returns `null`. Lexical enclosure is therefore PERFECT — the
  // parent-pointer walk climbs out of the IIFE and reports the complete
  // `event -> day-cell -> week-row -> grid -> root` chain — and the physical DOM
  // path is perfect too, because every element it names is still there. Parse,
  // ARC09 floor, count, direct-paint ban, owner part, named ancestry and live
  // selector path are ALL green. Only the render path moves, and it names the
  // syntactic position where the value stops travelling: a VariableDeclaration
  // that nothing returns.
  const CALENDAR_DEAD_IIFE =
    `\n                    {((ev: { color?: string }) => {\n` +
    `                      const dead = <div data-part="${CALENDAR_ACCENT_PART}" style={${CALENDAR_PRODUCER_LITERAL}} />;\n` +
    `                      return null;\n` +
    `                    })(dayEvents[0])}`;
  const deadInChain = withJsxChildSnippet(displaced, path, 'day-cell', CALENDAR_DEAD_IIFE);
  assert.notEqual(deadInChain, displaced, 'the dead-in-chain mutant must actually land in the day cell');

  assert.deepEqual(
    tsxSyntaxDiagnostics(deadInChain, path),
    [],
    'the dead-in-chain mutant must be real TSX, not a parse failure',
  );
  assert.equal(
    countArc09PaintInFile(deadInChain, path),
    FILES.calendarModern.floor,
    'the dead-in-chain mutant must hold the ARC09 floor at zero',
  );
  assert.equal(
    countChannelProducers(deadInChain, path, CALENDAR_CHANNEL, 'ev'),
    1,
    'the dead producer still publishes exactly once — that is the false green',
  );
  assert.deepEqual(
    collectDirectPaints(deadInChain, path, CALENDAR_FILL_PROPS, 'ev'),
    [],
    'the dead producer paints nothing directly either — the ban stays green',
  );
  assert.deepEqual(
    producerPlacementViolations(deadInChain, path, CALENDAR_CHANNEL, 'ev', CALENDAR_ACCENT_PART),
    [],
    'the dead producer carries the sink part exactly — the v3 clause stays green',
  );
  assert.deepEqual(
    producerAncestryViolations(deadInChain, path, CALENDAR_CHANNEL, 'ev', CALENDAR_ACCENT_ANCESTRY),
    [],
    'the dead producer has the WHOLE lexical chain — the v4 clause stays green, and that is the point',
  );
  assert.deepEqual(
    producerSelectorPathViolations(deadInChain, path, CALENDAR_CHANNEL, 'ev', CALENDAR_ACCENT_SELECTOR),
    [],
    'the dead producer sits on a physically intact DOM path — the selector clause stays green too',
  );
  assert.deepEqual(
    producerRenderPathViolations(deadInChain, path, CALENDAR_CHANNEL, 'ev'),
    ['the render path stops at VariableDeclaration, which does not return the producer'],
    'ONLY the render-path clause may reject the dead in-chain producer, and it must name the position',
  );

  // Class F — the ANONYMOUS WRAPPER, the second mutant that survived v4,
  // permanent. Nothing about the producer changes: the live publication stays
  // exactly where it is, on the chip, inside the whole chain. One bare `<div>`
  // is spliced physically between `root` and `grid` — the one CHILD hop the
  // Calendar sink selector spells. `.ds-…[data-part='root'] > [data-part='grid']`
  // now matches nothing at all, and every earlier clause stays green because
  // none of them can see an element that claims no part: the count, the owner
  // part, the named ancestry (transparent by design) and the render path (a JSX
  // child is a JSX child) are all satisfied. Only the live physical path moves,
  // and it reports the interloper BY ITS LABEL rather than as an anonymous
  // count.
  const wrappedGrid = withAnonymousWrapper(text, path, 'grid');
  assert.notEqual(wrappedGrid, text, 'the wrapper mutant must actually wrap the grid');

  assert.deepEqual(
    tsxSyntaxDiagnostics(wrappedGrid, path),
    [],
    'the anonymous-wrapper mutant must be real TSX, not a parse failure',
  );
  assert.equal(
    countArc09PaintInFile(wrappedGrid, path),
    FILES.calendarModern.floor,
    'the anonymous-wrapper mutant must hold the ARC09 floor at zero',
  );
  assert.equal(
    countChannelProducers(wrappedGrid, path, CALENDAR_CHANNEL, 'ev'),
    1,
    'the wrapper changes nothing about the publication — that is the false green',
  );
  assert.deepEqual(
    collectDirectPaints(wrappedGrid, path, CALENDAR_FILL_PROPS, 'ev'),
    [],
    'the wrapper paints nothing directly either — the ban stays green',
  );
  assert.deepEqual(
    producerPlacementViolations(wrappedGrid, path, CALENDAR_CHANNEL, 'ev', CALENDAR_ACCENT_PART),
    [],
    'the wrapper leaves the owner part exactly as it was — the v3 clause stays green',
  );
  assert.deepEqual(
    producerAncestryViolations(wrappedGrid, path, CALENDAR_CHANNEL, 'ev', CALENDAR_ACCENT_ANCESTRY),
    [],
    'an unlabelled wrapper is invisible to the named ancestry — the v4 clause stays green',
  );
  assert.deepEqual(
    producerRenderPathViolations(wrappedGrid, path, CALENDAR_CHANNEL, 'ev'),
    [],
    'the wrapped chip is still returned into the rendered tree — the render path stays green',
  );
  assert.deepEqual(
    producerSelectorPathViolations(wrappedGrid, path, CALENDAR_CHANNEL, 'ev', CALENDAR_ACCENT_SELECTOR),
    ["selector spells 'root' > 'grid' but the live DOM inserts '<div: no data-part>'"],
    'ONLY the live selector-path clause may reject the anonymous wrapper, and it must name it',
  );

  // Class G — the THIS-ARG CALLBACK, the first false green v5 shipped and the
  // v5 audit caught, permanent. `Array.prototype.map` takes a SECOND argument,
  // `thisArg`: a receiver the callback is bound to. It is never invoked, and
  // nothing it returns is ever rendered. v5 asked only whether the METHOD was
  // `map`/`flatMap` and whether the function sat ANYWHERE in that call's
  // argument list, so a producer returned from a `thisArg` read as a rendered
  // chip. Here the live publication is deleted and rebuilt inside exactly such a
  // function, in JSX-child position inside the live `day-cell`. Everything an
  // earlier clause can see is intact: the file parses, the ARC09 floor holds,
  // the count is 1, nothing is painted directly, the owner part is exact, the
  // lexical chain is the complete `event -> day-cell -> week-row -> grid ->
  // root`, and the physical DOM path satisfies the sink selector hop for hop.
  // Only the render path moves, and it names the ARGUMENT INDEX, not the method.
  const CALENDAR_THIS_ARG =
    `\n                    {dayEvents.map(() => null, function deadThisArg() {\n` +
    `                      const ev = dayEvents[0];\n` +
    `                      return <div data-part="${CALENDAR_ACCENT_PART}" style={${CALENDAR_PRODUCER_LITERAL}} />;\n` +
    `                    })}`;
  const thisArgProducer = withJsxChildSnippet(displaced, path, 'day-cell', CALENDAR_THIS_ARG);
  assert.notEqual(thisArgProducer, displaced, 'the thisArg mutant must actually land in the day cell');

  assert.deepEqual(
    tsxSyntaxDiagnostics(thisArgProducer, path),
    [],
    'the thisArg mutant must be real TSX, not a parse failure',
  );
  assert.equal(
    countArc09PaintInFile(thisArgProducer, path),
    FILES.calendarModern.floor,
    'the thisArg mutant must hold the ARC09 floor at zero',
  );
  assert.equal(
    countChannelProducers(thisArgProducer, path, CALENDAR_CHANNEL, 'ev'),
    1,
    'the thisArg producer still publishes exactly once — that is the false green',
  );
  assert.deepEqual(
    collectDirectPaints(thisArgProducer, path, CALENDAR_FILL_PROPS, 'ev'),
    [],
    'the thisArg producer paints nothing directly either — the ban stays green',
  );
  assert.deepEqual(
    producerPlacementViolations(thisArgProducer, path, CALENDAR_CHANNEL, 'ev', CALENDAR_ACCENT_PART),
    [],
    'the thisArg producer carries the sink part exactly — the v3 clause stays green',
  );
  assert.deepEqual(
    producerAncestryViolations(thisArgProducer, path, CALENDAR_CHANNEL, 'ev', CALENDAR_ACCENT_ANCESTRY),
    [],
    'the thisArg producer has the WHOLE lexical chain — the v4 clause stays green',
  );
  assert.deepEqual(
    producerSelectorPathViolations(thisArgProducer, path, CALENDAR_CHANNEL, 'ev', CALENDAR_ACCENT_SELECTOR),
    [],
    'the thisArg producer sits on a physically intact DOM path — the selector clause stays green too',
  );
  assert.deepEqual(
    producerRenderPathViolations(thisArgProducer, path, CALENDAR_CHANNEL, 'ev'),
    ["the producer is handed to 'map' at argument index 1, which is not the rendered callback"],
    'ONLY the render-path clause may reject the thisArg producer, and it must name the ARGUMENT INDEX',
  );

  // Class H — the OPAQUE COMPONENT at a DESCENDANT hop, the second false green
  // v5 shipped, permanent. `DropChildren` accepts children and renders `null`.
  // It is spliced physically around the whole `day-cell`, which sits at the one
  // DESCENDANT hop the Calendar sink selector spells,
  // `[data-part='grid'] [data-part='day-cell']`. v5's descendant hop tolerated
  // ANY intervening entry, so an element whose emitted DOM this file cannot see
  // was stepped over in silence — while at runtime the grid renders nothing at
  // all below it. The producer itself never moved, so count, owner part and the
  // paint ban cannot notice; a component claims no `data-part`, so the named
  // ancestry is byte-identical.
  //
  // v7 CORRECTION — this mutant is BOTH defects at once, and v6 reported only
  // one of them. The component sits between the producer and the exported
  // component, so the RENDER path crosses it too, and v6 called that green on
  // the strength of "a JSX child is a JSX child". It is not: this tree mounts
  // nothing. So both clauses are now red, each for its own reason and in its own
  // words — the render path because the children may never be rendered, the
  // physical path because the DOM emitted at that hop cannot be seen. The
  // physical finding keeps its exact v6 causality; it is not absorbed into the
  // render verdict, and neither message is derivable from the other. Class F
  // immediately above is the contrast that keeps this honest: an anonymous DOM
  // wrapper at a hop draws the physical-adjacency message ALONE and stays
  // render-green, because a `div` provably does render its children.
  const CALENDAR_OPAQUE_COMPONENT =
    `\nfunction DropChildren({ children }: { children?: React.ReactNode }) {\n` +
    `  return null;\n` +
    `}\n`;
  const opaqueHop = `${withWrapperElement(text, path, 'day-cell', 'DropChildren')}${CALENDAR_OPAQUE_COMPONENT}`;
  assert.notEqual(opaqueHop, text, 'the opaque-component mutant must actually wrap the day cell');

  assert.deepEqual(
    tsxSyntaxDiagnostics(opaqueHop, path),
    [],
    'the opaque-component mutant must be real TSX, not a parse failure',
  );
  assert.equal(
    countArc09PaintInFile(opaqueHop, path),
    FILES.calendarModern.floor,
    'the opaque-component mutant must hold the ARC09 floor at zero',
  );
  assert.equal(
    countChannelProducers(opaqueHop, path, CALENDAR_CHANNEL, 'ev'),
    1,
    'the opaque component changes nothing about the publication — that is the false green',
  );
  assert.deepEqual(
    collectDirectPaints(opaqueHop, path, CALENDAR_FILL_PROPS, 'ev'),
    [],
    'the opaque component paints nothing directly either — the ban stays green',
  );
  assert.deepEqual(
    producerPlacementViolations(opaqueHop, path, CALENDAR_CHANNEL, 'ev', CALENDAR_ACCENT_PART),
    [],
    'the opaque component leaves the owner part exactly as it was — the v3 clause stays green',
  );
  assert.deepEqual(
    producerAncestryViolations(opaqueHop, path, CALENDAR_CHANNEL, 'ev', CALENDAR_ACCENT_ANCESTRY),
    [],
    'a component claims no part, so the named ancestry is byte-identical — the v4 clause stays green',
  );
  assert.deepEqual(
    producerRenderPathViolations(opaqueHop, path, CALENDAR_CHANNEL, 'ev'),
    ["render path crosses '<DropChildren: component, DOM unknown>', which may not render its children"],
    'the day cell is inside a component that renders null — the render path must reject it too',
  );
  assert.deepEqual(
    producerSelectorPathViolations(opaqueHop, path, CALENDAR_CHANNEL, 'ev', CALENDAR_ACCENT_SELECTOR),
    [
      "selector hops 'grid' to 'day-cell' across '<DropChildren: component, DOM unknown>'," +
        ' whose emitted DOM this file cannot see',
    ],
    'the live selector-path clause keeps its OWN causality for an opaque DESCENDANT hop',
  );

  // Class I — the ROOT-OPAQUE component, new in v7 and the exact shape the v6
  // audit falsified. The same `DropChildren` is spliced around the WHOLE `root`
  // element — ABOVE the selector's head, not between two of its steps. Nothing
  // inside the chain moves at all, and every clause this gate owns except one is
  // therefore honestly green:
  //
  //   * syntax, the ARC09 floor, the producer count and the direct-paint ban see
  //     an untouched producer;
  //   * the owner part is exact and the lexical chain is the complete
  //     `event -> day-cell -> week-row -> grid -> root`;
  //   * the live PHYSICAL path still satisfies the sink selector hop for hop,
  //     because that clause examines entries BETWEEN steps and this entry sits
  //     above the head — residual 4, stated since v5, unchanged and not widened
  //     here.
  //
  // That is what makes this the isolation: it is the only defect in the file,
  // and exactly one clause may see it. v6 could not, and agreed with the
  // physical clause for a reason the physical clause never claimed — that a JSX
  // child is rendered because it is a JSX child. At runtime `DropChildren`
  // returns `null`: the calendar does not mount, the sink selector matches
  // nothing, the channel is published into a tree that does not exist, and v6
  // reported the file clean. The render path now names the component, by the
  // same shared label the physical clause would use if the component ever
  // landed between two steps.
  const rootOpaque = `${withWrapperElement(text, path, 'root', 'DropChildren')}${CALENDAR_OPAQUE_COMPONENT}`;
  assert.notEqual(rootOpaque, text, 'the root-opaque mutant must actually wrap the root');

  assert.deepEqual(
    tsxSyntaxDiagnostics(rootOpaque, path),
    [],
    'the root-opaque mutant must be real TSX, not a parse failure',
  );
  assert.equal(
    countArc09PaintInFile(rootOpaque, path),
    FILES.calendarModern.floor,
    'the root-opaque mutant must hold the ARC09 floor at zero',
  );
  assert.equal(
    countChannelProducers(rootOpaque, path, CALENDAR_CHANNEL, 'ev'),
    1,
    'the root-opaque component changes nothing about the publication — that is the false green',
  );
  assert.deepEqual(
    collectDirectPaints(rootOpaque, path, CALENDAR_FILL_PROPS, 'ev'),
    [],
    'the root-opaque component paints nothing directly either — the ban stays green',
  );
  assert.deepEqual(
    producerPlacementViolations(rootOpaque, path, CALENDAR_CHANNEL, 'ev', CALENDAR_ACCENT_PART),
    [],
    'the root-opaque component leaves the owner part exactly as it was — the v3 clause stays green',
  );
  assert.deepEqual(
    producerAncestryViolations(rootOpaque, path, CALENDAR_CHANNEL, 'ev', CALENDAR_ACCENT_ANCESTRY),
    [],
    'a component claims no part, so the named ancestry is byte-identical — the v4 clause stays green',
  );
  assert.deepEqual(
    producerSelectorPathViolations(rootOpaque, path, CALENDAR_CHANNEL, 'ev', CALENDAR_ACCENT_SELECTOR),
    [],
    'the component sits ABOVE the selector head, which that clause has never examined — it stays green',
  );
  assert.deepEqual(
    producerRenderPathViolations(rootOpaque, path, CALENDAR_CHANNEL, 'ev'),
    ["render path crosses '<DropChildren: component, DOM unknown>', which may not render its children"],
    'ONLY the render-path clause may reject the root-opaque component, and it must name it',
  );

  // Class J — the OWNER COMPONENT, new in v7c, and the mutant that exists
  // because the v7 audit proved a branch can be WRITTEN, be REACHABLE, and still
  // be untested. v7 added an owner check to `renderPathViolation` and shipped no
  // mutant that entered it: probe M5 deleted the branch outright and the focal
  // suite stayed 10/10. A clause no test can kill is not a gate, it is a comment
  // that happens to compile — the same defect class this file exists to find,
  // one level up. This is that missing canary, reported by Fable and Turing.
  //
  // The live publication is deleted and rebuilt inside the live `day-cell`, on a
  // genuinely rendered `map` callback, so nothing v5 or v6 added is in play. The
  // ONE thing that moves is the tag of the element the style object is handed
  // to: `DropChildren`, which returns `null`. A style object given to a
  // component is a PROP. Whether it ever reaches a DOM node, and which one, is
  // decided in code this file cannot see — here, nowhere, because the component
  // renders nothing at all.
  //
  // Two clauses see two DIFFERENT defects, and each must state its own:
  //
  //   * the RENDER path sees a producer that is never applied to DOM;
  //   * the PHYSICAL path sees a selector part that is not on the live path at
  //     all — the tail step `event` is claimed by an element whose emitted DOM
  //     is unknown, so the selector's last hop has nothing to land on.
  //
  // The render assertion comes FIRST on purpose. `node:test` stops a test at its
  // first failed assertion, so ordering is what makes the owner branch
  // independently falsifiable: delete it and this assertion — not some later
  // one — is the assertion that fails. That is the whole point of Class J, and
  // putting the physical assertion first would have re-created exactly the
  // masking that hid the hole in v7.
  const CALENDAR_OWNER_COMPONENT =
    `\n                    {dayEvents.map((ev) => (\n` +
    `                      <DropChildren data-part="${CALENDAR_ACCENT_PART}" style={${CALENDAR_PRODUCER_LITERAL}} />\n` +
    `                    ))}`;
  const ownerComponent = `${withJsxChildSnippet(displaced, path, 'day-cell', CALENDAR_OWNER_COMPONENT)}${CALENDAR_OPAQUE_COMPONENT}`;
  assert.notEqual(ownerComponent, displaced, 'the owner-component mutant must actually land in the day cell');

  assert.deepEqual(
    tsxSyntaxDiagnostics(ownerComponent, path),
    [],
    'the owner-component mutant must be real TSX, not a parse failure',
  );
  assert.equal(
    countArc09PaintInFile(ownerComponent, path),
    FILES.calendarModern.floor,
    'the owner-component mutant must hold the ARC09 floor at zero',
  );
  assert.equal(
    countChannelProducers(ownerComponent, path, CALENDAR_CHANNEL, 'ev'),
    1,
    'the owner component still publishes exactly once — that is the false green',
  );
  assert.deepEqual(
    collectDirectPaints(ownerComponent, path, CALENDAR_FILL_PROPS, 'ev'),
    [],
    'the owner component paints nothing directly either — the ban stays green',
  );
  assert.deepEqual(
    producerPlacementViolations(ownerComponent, path, CALENDAR_CHANNEL, 'ev', CALENDAR_ACCENT_PART),
    [],
    'the owner component carries the sink part exactly — the v3 clause reads the attribute, not the tag',
  );
  assert.deepEqual(
    producerAncestryViolations(ownerComponent, path, CALENDAR_CHANNEL, 'ev', CALENDAR_ACCENT_ANCESTRY),
    [],
    'the LEXICAL chain is complete `event -> day-cell -> week-row -> grid -> root` — the v4 clause stays green',
  );
  assert.deepEqual(
    producerRenderPathViolations(ownerComponent, path, CALENDAR_CHANNEL, 'ev'),
    ["the producer is a style prop of '<DropChildren: component, DOM unknown>', which may not apply it to DOM"],
    'the render path must reject the OWNER itself, and it must name the component — delete that branch and this line is what fails',
  );
  assert.deepEqual(
    producerSelectorPathViolations(ownerComponent, path, CALENDAR_CHANNEL, 'ev', CALENDAR_ACCENT_SELECTOR),
    ["selector part 'event' is absent from the live physical path"],
    'the physical clause reaches its own INDEPENDENT finding: the sink tail has no live element to match',
  );

  // Class K — the ROOT-VOID element, new in v7c and the second false green the
  // v7 audit found. v7 wrote, in prose and in code, that an intrinsic lowercase
  // tag renders its children ALWAYS. That is false. HTML's void elements —
  // `<input>`, `<br>`, `<img>` and eleven more — cannot contain anything, and
  // the TSX grammar has no opinion about it: `<input>…</input>` parses cleanly.
  // So a producer wrapped in one passed the parser, passed the lowercase test,
  // and walked out the other side as "rendered" while no browser would ever
  // mount it. v7 traded a component-shaped hole for an element-shaped one.
  //
  // The wrapper goes around the WHOLE `root`, exactly where Class I put its
  // component, so the two are the same experiment with one variable changed —
  // and that variable is the one the classification now has a third value for.
  // Everything else is honestly green, including the PHYSICAL path, and that is
  // the load-bearing asymmetry: `<input>` is real DOM this file authored, one
  // element, known tag, known arity. Reporting it as a component whose DOM
  // cannot be seen would be a FALSE statement, not extra strictness. It is
  // recorded as the known element it is, and the one thing wrong with it —
  // that it can host nothing — is stated once, by the clause that owns children.
  const rootVoid = withWrapperElement(text, path, 'root', 'input');
  assert.notEqual(rootVoid, text, 'the root-void mutant must actually wrap the root');

  assert.deepEqual(
    tsxSyntaxDiagnostics(rootVoid, path),
    [],
    'the root-void mutant PARSES — that is precisely why the parser could never have caught this',
  );
  assert.equal(
    countArc09PaintInFile(rootVoid, path),
    FILES.calendarModern.floor,
    'the root-void mutant must hold the ARC09 floor at zero',
  );
  assert.equal(
    countChannelProducers(rootVoid, path, CALENDAR_CHANNEL, 'ev'),
    1,
    'the void wrapper changes nothing about the publication — that is the false green',
  );
  assert.deepEqual(
    collectDirectPaints(rootVoid, path, CALENDAR_FILL_PROPS, 'ev'),
    [],
    'the void wrapper paints nothing directly either — the ban stays green',
  );
  assert.deepEqual(
    producerPlacementViolations(rootVoid, path, CALENDAR_CHANNEL, 'ev', CALENDAR_ACCENT_PART),
    [],
    'the void wrapper leaves the owner part exactly as it was — the v3 clause stays green',
  );
  assert.deepEqual(
    producerAncestryViolations(rootVoid, path, CALENDAR_CHANNEL, 'ev', CALENDAR_ACCENT_ANCESTRY),
    [],
    'a void element claims no part, so the named ancestry is byte-identical — the v4 clause stays green',
  );
  assert.deepEqual(
    producerSelectorPathViolations(rootVoid, path, CALENDAR_CHANNEL, 'ev', CALENDAR_ACCENT_SELECTOR),
    [],
    'the physical clause keeps the void element as KNOWN DOM above the selector head — never as a component whose DOM is unknown',
  );
  assert.deepEqual(
    producerRenderPathViolations(rootVoid, path, CALENDAR_CHANNEL, 'ev'),
    [
      "render path crosses '<input: void element, renders no children>'," +
        ' which the TSX parser accepts but no DOM ever mounts',
    ],
    'ONLY the render-path clause may reject the void wrapper, and it must say that the parse proves nothing',
  );

  // Class K, second half — the IN-CHAIN void, and the assertion without which
  // the half above is not a canary at all. `rootVoid` puts the element ABOVE the
  // selector head, where the physical clause has never looked, so its green
  // reading there is produced by the head exemption and would survive an
  // implementation that wrongly called every void element opaque. That would be
  // a false report shipped under a passing test — the exact bargain this file
  // refuses.
  //
  // So the same `<input>` is spliced at the ONE child hop the sink spells,
  // exactly where Class F puts its `<div>`, and the two are read side by side.
  // Class F: `<div: no data-part>`, render green. Here: `<input: no data-part>`,
  // physical naming the same KIND of interloper by its own tag — no opacity
  // finding, no "DOM unknown" — while the render path alone reports the one
  // thing that is actually different about it. Mark void as opaque and this
  // message changes and a second violation appears beside it; drop `input` from
  // the void set and the render line above goes quiet. Both are caught here.
  const wrappedGridVoid = withWrapperElement(text, path, 'grid', 'input');
  assert.notEqual(wrappedGridVoid, text, 'the in-chain void mutant must actually wrap the grid');

  assert.deepEqual(
    tsxSyntaxDiagnostics(wrappedGridVoid, path),
    [],
    'the in-chain void mutant must be real TSX, not a parse failure',
  );
  assert.deepEqual(
    producerSelectorPathViolations(wrappedGridVoid, path, CALENDAR_CHANNEL, 'ev', CALENDAR_ACCENT_SELECTOR),
    ["selector spells 'root' > 'grid' but the live DOM inserts '<input: no data-part>'"],
    'the physical clause names a void element by its OWN tag as inserted DOM — never as a component whose DOM it cannot see',
  );
  assert.deepEqual(
    producerRenderPathViolations(wrappedGridVoid, path, CALENDAR_CHANNEL, 'ev'),
    [
      "render path crosses '<input: void element, renders no children>'," +
        ' which the TSX parser accepts but no DOM ever mounts',
    ],
    'the render path reports the one fact that separates this from the Class F div — and it is the only clause that may',
  );

  // The unscoped alternative: one declaration, both retired `includes` still
  // true, and the channel leaking onto every `.ds-leak` in the document.
  const leaked = collectSinks(
    withLeakedSelectorAlternative(css, sinks[0].parent),
    cssPath,
    CALENDAR_CHANNEL,
  );
  assert.equal(leaked.length, 1, 'the leaked alternative rides the SAME single declaration');
  const leakedSelector = normalizeSelector(leaked[0].parent.selector);
  assert.ok(
    leakedSelector.includes(".ds-pattern-calendar-view.ds-engine-modern[data-part='root']") &&
      leakedSelector.includes("[data-part='event']"),
    'the retired `includes` pair stays true on the leaked selector — that is the false green',
  );
  assert.deepEqual(
    scopeViolations(leaked[0], CALENDAR_ACCENT_SELECTOR),
    [
      'the sink rule carries 2 selectors, not 1',
      `the sink selector is ${CALENDAR_ACCENT_SELECTOR}, .ds-leak`,
    ],
    'the identity check must reject the unscoped alternative on both counts',
  );
});

const KANBAN_PRODUCER_LITERAL = "{ '--ds-kanban-column-accent': column.color } as React.CSSProperties";

test('CK-E Kanban Modern crosses the column accent only through a scoped custom property', () => {
  const path = pathFor(FILES.kanbanModern);
  const text = source(FILES.kanbanModern);

  assert.equal(
    countChannelProducers(text, path, KANBAN_CHANNEL, 'column'),
    1,
    'the Modern kanban must publish the column accent exactly once',
  );
  assert.ok(
    KANBAN_ACCENT_SELECTOR.endsWith(`[data-part='${KANBAN_ACCENT_PART}']`),
    'the pinned part must be the tail of the pinned sink selector',
  );
  assert.deepEqual(
    producerPlacementViolations(text, path, KANBAN_CHANNEL, 'column', KANBAN_ACCENT_PART),
    [],
    'the Modern kanban must publish the accent ON the column header the skin selects',
  );
  assert.deepEqual(
    selectorAncestryDisagreements(KANBAN_ACCENT_SELECTOR, KANBAN_ACCENT_ANCESTRY),
    [],
    'the pinned ancestry and the pinned sink selector must describe one element',
  );
  assert.deepEqual(
    producerAncestryViolations(text, path, KANBAN_CHANNEL, 'column', KANBAN_ACCENT_ANCESTRY),
    [],
    'the Modern kanban header carrying the accent must be the one inside the live board',
  );
  assert.deepEqual(
    producerRenderPathViolations(text, path, KANBAN_CHANNEL, 'column'),
    [],
    'the Modern kanban header carrying the accent must be RETURNED into the rendered tree',
  );
  assert.deepEqual(
    producerSelectorPathViolations(text, path, KANBAN_CHANNEL, 'column', KANBAN_ACCENT_SELECTOR),
    [],
    'the live DOM path down to the header must satisfy the sink selector hop for hop',
  );
  assert.deepEqual(
    collectDirectPaints(text, path, KANBAN_STRIP_PROPS, 'column'),
    [],
    'the Modern kanban must not paint the column strip directly from column.color',
  );

  const cssPath = join(cssRoot, 'modern/skin/pattern-kanban-board.css');
  const css = readFileSync(cssPath, 'utf8');
  const sinks = collectSinks(css, cssPath, KANBAN_CHANNEL);
  assert.equal(sinks.length, 1, 'the Modern kanban skin must consume the column accent exactly once');
  assert.equal(
    cssTrim(sinks[0].prop),
    'border-block-start',
    'the column accent must land as the header strip',
  );
  assert.equal(
    cssTrim(sinks[0].value),
    '3px solid var(--ds-kanban-column-accent, transparent)',
    'the column accent sink lost its exact transparent fallback',
  );
  assert.deepEqual(
    scopeViolations(sinks[0], KANBAN_ACCENT_SELECTOR),
    [],
    'the column accent sink must carry exactly the canonical Modern kanban selector',
  );

  // The causal pins, permanent — the Kanban half of the same two defect classes.
  // The live producer sits inside a conditional (`column.color ? (…) : undefined`),
  // so this half also proves the style-expression unwrap reaches through a
  // ternary branch without reaching an alias.
  assert.equal(
    text.split(KANBAN_PRODUCER_LITERAL).length - 1,
    1,
    'the live producer literal drifted, so the mutants below no longer describe it',
  );

  const commentedProducer = `${text}\n// style={${KANBAN_PRODUCER_LITERAL}}\n`;
  assert.equal(
    countChannelProducers(commentedProducer, path, KANBAN_CHANNEL, 'column'),
    1,
    'a commented-out producer is not a producer',
  );
  assert.equal(
    commentedProducer.match(RETIRED_KANBAN_PRODUCER_REGEX)?.length,
    2,
    'the retired regex is what counted the commented corpse as a second publication',
  );

  const commentedPaint = `${text}\n// <div style={{ borderTop: column.color }} />\n`;
  assert.deepEqual(
    collectDirectPaints(commentedPaint, path, KANBAN_STRIP_PROPS, 'column'),
    [],
    'a commented-out direct paint is not a direct paint',
  );
  assert.match(
    commentedPaint,
    RETIRED_KANBAN_PAINT_REGEX,
    'the retired regex is what reddened the ban on a commented corpse',
  );

  for (const [site, snippet] of [
    ['quoted in a string', `const quoted = "style={${KANBAN_PRODUCER_LITERAL}}";`],
    ['on a non-style object', `const loose = { '${KANBAN_CHANNEL}': column.color };`],
    [
      'on an aliased style object',
      `const aliased = { '${KANBAN_CHANNEL}': column.color };\nconst alias = <div style={aliased} />;`,
    ],
    ['under a computed key', `const computed = <div style={{ ['${KANBAN_CHANNEL}']: column.color }} />;`],
  ]) {
    assert.equal(
      countChannelProducers(`${text}\n${snippet}\n`, path, KANBAN_CHANNEL, 'column'),
      1,
      `a channel ${site} must not be counted as the publication`,
    );
  }

  assert.equal(
    countChannelProducers(text.replace(KANBAN_PRODUCER_LITERAL, '{} as React.CSSProperties'), path, KANBAN_CHANNEL, 'column'),
    0,
    'deleting the live producer must drop the count to zero',
  );
  assert.equal(
    countChannelProducers(`${text}\nconst twice = <div style={${KANBAN_PRODUCER_LITERAL}} />;\n`, path, KANBAN_CHANNEL, 'column'),
    2,
    'a second live producer must raise the count',
  );
  const restoredPaint = collectDirectPaints(
    text.replace(KANBAN_PRODUCER_LITERAL, '{ borderTop: column.color } as React.CSSProperties'),
    path,
    KANBAN_STRIP_PROPS,
    'column',
  );
  assert.equal(restoredPaint.length, 1, 'restoring the inline strip must be reported exactly once');
  assert.match(
    restoredPaint[0],
    /^borderTop @ line \d+$/,
    'a restored inline strip must be reported by property and site',
  );

  // Class C — the Kanban half of the disconnected channel. The positive
  // placement assertion at the top of this test carries a second fact the
  // Calendar half cannot: the live producer sits inside a ternary
  // (`column.color ? ({…} as React.CSSProperties) : undefined`), so resolving it
  // to `data-part="column-header"` proves the ownership ASCENT reaches the
  // element through a conditional branch, exactly as the descent reaches the
  // object through it.
  const displaced = text.replace(KANBAN_PRODUCER_LITERAL, '{} as React.CSSProperties');
  for (const [site, element, violation] of [
    [
      'on a child of the header',
      `<div data-part="column-header"><span style={${KANBAN_PRODUCER_LITERAL}} /></div>`,
      'the producer element carries 0 data-part attributes, not 1',
    ],
    [
      'on a spread data-part',
      `<div {...{ 'data-part': 'column-header' }} style={${KANBAN_PRODUCER_LITERAL}} />`,
      'the producer element carries 0 data-part attributes, not 1',
    ],
    [
      'on a dynamic data-part',
      `<div data-part={part} style={${KANBAN_PRODUCER_LITERAL}} />`,
      'the producer element data-part is not a string literal',
    ],
    [
      'on the wrong part',
      `<div data-part="column" style={${KANBAN_PRODUCER_LITERAL}} />`,
      "the producer element is data-part 'column', not 'column-header'",
    ],
    [
      'on a doubled data-part',
      `<div data-part="column-header" data-part="column-header" style={${KANBAN_PRODUCER_LITERAL}} />`,
      'the producer element carries 2 data-part attributes, not 1',
    ],
  ]) {
    const moved = `${displaced}\nconst moved = ${element};\n`;
    assert.equal(
      countChannelProducers(moved, path, KANBAN_CHANNEL, 'column'),
      1,
      `a producer ${site} still counts exactly once — that is the false green`,
    );
    assert.deepEqual(
      collectDirectPaints(moved, path, KANBAN_STRIP_PROPS, 'column'),
      [],
      `a producer ${site} paints nothing directly either — the ban stays green`,
    );
    assert.deepEqual(
      producerPlacementViolations(moved, path, KANBAN_CHANNEL, 'column', KANBAN_ACCENT_PART),
      [violation],
      `the placement clause must reject a producer ${site}`,
    );
    assert.equal(
      producerAncestryViolations(moved, path, KANBAN_CHANNEL, 'column', KANBAN_ACCENT_ANCESTRY).length,
      1,
      `the ancestry clause must reject a producer ${site} as well`,
    );
    assert.equal(
      producerRenderPathViolations(moved, path, KANBAN_CHANNEL, 'column').length,
      1,
      `the render-path clause must reject a producer ${site} as well`,
    );
    assert.equal(
      producerSelectorPathViolations(moved, path, KANBAN_CHANNEL, 'column', KANBAN_ACCENT_SELECTOR).length,
      1,
      `the live selector-path clause must reject a producer ${site} as well`,
    );
  }

  assert.deepEqual(
    producerPlacementViolations(
      `${text}\nconst twice = <div data-part="column-header" style={${KANBAN_PRODUCER_LITERAL}} />;\n`,
      path,
      KANBAN_CHANNEL,
      'column',
      KANBAN_ACCENT_PART,
    ),
    ['the channel carries 2 producers, not 1'],
    'a correctly-placed SECOND producer must still fail the placement clause',
  );

  // Class D — the Kanban half of the disconnected owner, permanent, and the
  // harder of the two. The publication is deleted from the rendered header and
  // rebuilt as a `const` INSIDE the live `columns.map` callback that is never
  // returned, never referenced, never rendered. It is bound in the same scope as
  // the real header, so it is not an obviously foreign element the way a
  // module-level helper is; the count, the owner part, the paint ban, the ARC09
  // floor and the parse all stay exactly where the live producer left them.
  //
  // What it cannot fake is the chain. Parent pointers cross the callback, so the
  // walk does reach the LEXICALLY enclosing `board -> root` — and stops there,
  // because the one link that only a RETURNED element earns, `column`, is
  // missing. The reported chain says exactly that, which is also the honest
  // statement of this clause's reach: it proves lexical enclosure, and the
  // missing `column` link is what a never-returned value costs. The Class E
  // mutant below is the same defect moved INSIDE `column`, where enclosure is
  // perfect and only the render path can still tell.
  const KANBAN_COLUMN_CALLBACK_ANCHOR = 'const isDropping = dropTarget?.columnId === column.id;';
  assert.equal(
    text.split(KANBAN_COLUMN_CALLBACK_ANCHOR).length - 1,
    1,
    'the column callback anchor drifted, so the disconnected-owner mutant no longer lands inside it',
  );

  const orphanedProducer = displaced.replace(
    KANBAN_COLUMN_CALLBACK_ANCHOR,
    `${KANBAN_COLUMN_CALLBACK_ANCHOR}\n` +
      `          const disconnectedAccent = (\n` +
      `            <div data-part="${KANBAN_ACCENT_PART}" style={${KANBAN_PRODUCER_LITERAL}} />\n` +
      `          );`,
  );
  assert.notEqual(
    orphanedProducer,
    displaced,
    'the disconnected-owner mutant must actually land inside the column callback',
  );

  assert.deepEqual(
    tsxSyntaxDiagnostics(orphanedProducer, path),
    [],
    'the disconnected-owner mutant must be real TSX, not a parse failure',
  );
  assert.equal(
    countArc09PaintInFile(orphanedProducer, path),
    FILES.kanbanModern.floor,
    'the disconnected-owner mutant must hold the ARC09 floor at zero',
  );
  assert.equal(
    countChannelProducers(orphanedProducer, path, KANBAN_CHANNEL, 'column'),
    1,
    'the disconnected owner still publishes exactly once — that is the false green',
  );
  assert.deepEqual(
    collectDirectPaints(orphanedProducer, path, KANBAN_STRIP_PROPS, 'column'),
    [],
    'the disconnected owner paints nothing directly either — the ban stays green',
  );
  assert.deepEqual(
    producerPlacementViolations(orphanedProducer, path, KANBAN_CHANNEL, 'column', KANBAN_ACCENT_PART),
    [],
    'the disconnected owner carries the sink part exactly — the v3 clause stays green',
  );
  assert.deepEqual(
    producerAncestryViolations(orphanedProducer, path, KANBAN_CHANNEL, 'column', KANBAN_ACCENT_ANCESTRY),
    [
      `the producer ancestry is ${KANBAN_ACCENT_PART} -> board -> root,` +
        ` not ${KANBAN_ACCENT_ANCESTRY.join(' -> ')}`,
    ],
    'the ancestry clause must reject the disconnected owner, and it must name the missing link',
  );
  assert.deepEqual(
    producerRenderPathViolations(orphanedProducer, path, KANBAN_CHANNEL, 'column'),
    ['the render path stops at VariableDeclaration, which does not return the producer'],
    'the render-path clause must reject the disconnected owner as a never-returned binding',
  );
  assert.equal(
    producerSelectorPathViolations(orphanedProducer, path, KANBAN_CHANNEL, 'column', KANBAN_ACCENT_SELECTOR)
      .length,
    1,
    'the live selector-path clause must reject the disconnected owner as well',
  );

  // Class E — the Kanban half of the DEAD IN-CHAIN producer, permanent, and the
  // exact v4 residual. Class D above failed the ancestry clause only because its
  // dead `const` sat OUTSIDE the `column` element. Move the same dead `const`
  // into an IIFE in JSX-child position INSIDE `column` and that last tell is
  // gone: the lexical chain is the complete `column-header -> column -> board ->
  // root`, the physical DOM path is untouched, the owner part is exact, the
  // count is 1, the paint ban is empty, the ARC09 floor holds and the file
  // parses. Only the render path can still tell, and it names the position where
  // the value stops travelling.
  const KANBAN_DEAD_IIFE =
    `\n              {((column: { color?: string }) => {\n` +
    `                const dead = <div data-part="${KANBAN_ACCENT_PART}" style={${KANBAN_PRODUCER_LITERAL}} />;\n` +
    `                return null;\n` +
    `              })(column)}`;
  const deadInChain = withJsxChildSnippet(displaced, path, 'column', KANBAN_DEAD_IIFE);
  assert.notEqual(deadInChain, displaced, 'the dead-in-chain mutant must actually land in the column');

  assert.deepEqual(
    tsxSyntaxDiagnostics(deadInChain, path),
    [],
    'the dead-in-chain mutant must be real TSX, not a parse failure',
  );
  assert.equal(
    countArc09PaintInFile(deadInChain, path),
    FILES.kanbanModern.floor,
    'the dead-in-chain mutant must hold the ARC09 floor at zero',
  );
  assert.equal(
    countChannelProducers(deadInChain, path, KANBAN_CHANNEL, 'column'),
    1,
    'the dead producer still publishes exactly once — that is the false green',
  );
  assert.deepEqual(
    collectDirectPaints(deadInChain, path, KANBAN_STRIP_PROPS, 'column'),
    [],
    'the dead producer paints nothing directly either — the ban stays green',
  );
  assert.deepEqual(
    producerPlacementViolations(deadInChain, path, KANBAN_CHANNEL, 'column', KANBAN_ACCENT_PART),
    [],
    'the dead producer carries the sink part exactly — the v3 clause stays green',
  );
  assert.deepEqual(
    producerAncestryViolations(deadInChain, path, KANBAN_CHANNEL, 'column', KANBAN_ACCENT_ANCESTRY),
    [],
    'the dead producer has the WHOLE lexical chain — the v4 clause stays green, and that is the point',
  );
  assert.deepEqual(
    producerSelectorPathViolations(deadInChain, path, KANBAN_CHANNEL, 'column', KANBAN_ACCENT_SELECTOR),
    [],
    'the dead producer sits on a physically intact DOM path — the selector clause stays green too',
  );
  assert.deepEqual(
    producerRenderPathViolations(deadInChain, path, KANBAN_CHANNEL, 'column'),
    ['the render path stops at VariableDeclaration, which does not return the producer'],
    'ONLY the render-path clause may reject the dead in-chain producer, and it must name the position',
  );

  // Class F — the Kanban half of the ANONYMOUS WRAPPER, permanent. The Kanban
  // sink selector is spelled entirely with CHILD combinators, so every hop in it
  // is breakable this way; the wrapper goes on the tightest and most stable one,
  // physically between `column` and the header that carries the publication.
  // `[data-part='column'] > [data-part='column-header']` now matches nothing,
  // while the producer itself is byte-identical and every earlier clause —
  // count, owner part, named ancestry, render path — stays green because none of
  // them can see an element that claims no part.
  const wrappedHeader = withAnonymousWrapper(text, path, KANBAN_ACCENT_PART);
  assert.notEqual(wrappedHeader, text, 'the wrapper mutant must actually wrap the column header');

  assert.deepEqual(
    tsxSyntaxDiagnostics(wrappedHeader, path),
    [],
    'the anonymous-wrapper mutant must be real TSX, not a parse failure',
  );
  assert.equal(
    countArc09PaintInFile(wrappedHeader, path),
    FILES.kanbanModern.floor,
    'the anonymous-wrapper mutant must hold the ARC09 floor at zero',
  );
  assert.equal(
    countChannelProducers(wrappedHeader, path, KANBAN_CHANNEL, 'column'),
    1,
    'the wrapper changes nothing about the publication — that is the false green',
  );
  assert.deepEqual(
    collectDirectPaints(wrappedHeader, path, KANBAN_STRIP_PROPS, 'column'),
    [],
    'the wrapper paints nothing directly either — the ban stays green',
  );
  assert.deepEqual(
    producerPlacementViolations(wrappedHeader, path, KANBAN_CHANNEL, 'column', KANBAN_ACCENT_PART),
    [],
    'the wrapper leaves the owner part exactly as it was — the v3 clause stays green',
  );
  assert.deepEqual(
    producerAncestryViolations(wrappedHeader, path, KANBAN_CHANNEL, 'column', KANBAN_ACCENT_ANCESTRY),
    [],
    'an unlabelled wrapper is invisible to the named ancestry — the v4 clause stays green',
  );
  assert.deepEqual(
    producerRenderPathViolations(wrappedHeader, path, KANBAN_CHANNEL, 'column'),
    [],
    'the wrapped header is still returned into the rendered tree — the render path stays green',
  );
  assert.deepEqual(
    producerSelectorPathViolations(wrappedHeader, path, KANBAN_CHANNEL, 'column', KANBAN_ACCENT_SELECTOR),
    ["selector spells 'column' > 'column-header' but the live DOM inserts '<div: no data-part>'"],
    'ONLY the live selector-path clause may reject the anonymous wrapper, and it must name it',
  );

  // Class G — the Kanban half of the THIS-ARG CALLBACK, permanent. Same defect,
  // second channel: the publication is deleted from the header and rebuilt
  // inside a function handed to `.map` at argument index 1, in JSX-child
  // position inside the live `column`. Lexical chain, physical DOM path, owner
  // part, count, paint ban and ARC09 floor are all exactly what the live file
  // has. Only the render path can tell, and only because it checks the callback
  // POSITION rather than the callee name.
  const KANBAN_THIS_ARG =
    `\n              {column.items.map(() => null, function deadThisArg() {\n` +
    `                return <div data-part="${KANBAN_ACCENT_PART}" style={${KANBAN_PRODUCER_LITERAL}} />;\n` +
    `              })}`;
  const thisArgProducer = withJsxChildSnippet(displaced, path, 'column', KANBAN_THIS_ARG);
  assert.notEqual(thisArgProducer, displaced, 'the thisArg mutant must actually land in the column');

  assert.deepEqual(
    tsxSyntaxDiagnostics(thisArgProducer, path),
    [],
    'the thisArg mutant must be real TSX, not a parse failure',
  );
  assert.equal(
    countArc09PaintInFile(thisArgProducer, path),
    FILES.kanbanModern.floor,
    'the thisArg mutant must hold the ARC09 floor at zero',
  );
  assert.equal(
    countChannelProducers(thisArgProducer, path, KANBAN_CHANNEL, 'column'),
    1,
    'the thisArg producer still publishes exactly once — that is the false green',
  );
  assert.deepEqual(
    collectDirectPaints(thisArgProducer, path, KANBAN_STRIP_PROPS, 'column'),
    [],
    'the thisArg producer paints nothing directly either — the ban stays green',
  );
  assert.deepEqual(
    producerPlacementViolations(thisArgProducer, path, KANBAN_CHANNEL, 'column', KANBAN_ACCENT_PART),
    [],
    'the thisArg producer carries the sink part exactly — the v3 clause stays green',
  );
  assert.deepEqual(
    producerAncestryViolations(thisArgProducer, path, KANBAN_CHANNEL, 'column', KANBAN_ACCENT_ANCESTRY),
    [],
    'the thisArg producer has the WHOLE lexical chain — the v4 clause stays green',
  );
  assert.deepEqual(
    producerSelectorPathViolations(thisArgProducer, path, KANBAN_CHANNEL, 'column', KANBAN_ACCENT_SELECTOR),
    [],
    'the thisArg producer sits on a physically intact DOM path — the selector clause stays green too',
  );
  assert.deepEqual(
    producerRenderPathViolations(thisArgProducer, path, KANBAN_CHANNEL, 'column'),
    ["the producer is handed to 'map' at argument index 1, which is not the rendered callback"],
    'ONLY the render-path clause may reject the thisArg producer, and it must name the ARGUMENT INDEX',
  );

  // Class H — the Kanban CONTROL for the opaque component, permanent, and it is
  // deliberately a different demonstration from Calendar's. The Kanban sink
  // selector is spelled entirely with CHILD combinators, so this file has NO
  // descendant hop and cannot host the isolated descendant-opacity mutant;
  // Calendar owns that proof alone. What Kanban proves instead is that an opaque
  // component is never quietly absorbed into an existing hop verdict: the same
  // `DropChildren` at the `column > column-header` hop is reported TWICE, once
  // by the child-adjacency rule and once by the opacity rule, each naming it by
  // label. Compare against class F immediately above, where an anonymous DOM
  // wrapper at the identical hop draws the adjacency message ALONE — that
  // contrast is the whole distinction between an element this file can see and
  // one it cannot.
  //
  // v7 CORRECTION — as on the Calendar side, the render path crosses this
  // component too, so it is red here as well and was wrongly green in v6. The
  // three findings stay three: the render path speaks about children that may
  // never be rendered, the adjacency rule about a hop that is no longer direct,
  // the opacity rule about DOM this file cannot see. Class F remains the control
  // that keeps them apart — an anonymous `div` at this same hop still draws the
  // adjacency message alone and stays render-green.
  const KANBAN_OPAQUE_COMPONENT =
    `\nfunction DropChildren({ children }: { children?: React.ReactNode }) {\n` +
    `  return null;\n` +
    `}\n`;
  const opaqueHop = `${withWrapperElement(text, path, KANBAN_ACCENT_PART, 'DropChildren')}${KANBAN_OPAQUE_COMPONENT}`;
  assert.notEqual(opaqueHop, text, 'the opaque-component mutant must actually wrap the column header');

  assert.deepEqual(
    tsxSyntaxDiagnostics(opaqueHop, path),
    [],
    'the opaque-component mutant must be real TSX, not a parse failure',
  );
  assert.equal(
    countArc09PaintInFile(opaqueHop, path),
    FILES.kanbanModern.floor,
    'the opaque-component mutant must hold the ARC09 floor at zero',
  );
  assert.equal(
    countChannelProducers(opaqueHop, path, KANBAN_CHANNEL, 'column'),
    1,
    'the opaque component changes nothing about the publication — that is the false green',
  );
  assert.deepEqual(
    collectDirectPaints(opaqueHop, path, KANBAN_STRIP_PROPS, 'column'),
    [],
    'the opaque component paints nothing directly either — the ban stays green',
  );
  assert.deepEqual(
    producerPlacementViolations(opaqueHop, path, KANBAN_CHANNEL, 'column', KANBAN_ACCENT_PART),
    [],
    'the opaque component leaves the owner part exactly as it was — the v3 clause stays green',
  );
  assert.deepEqual(
    producerAncestryViolations(opaqueHop, path, KANBAN_CHANNEL, 'column', KANBAN_ACCENT_ANCESTRY),
    [],
    'a component claims no part, so the named ancestry is byte-identical — the v4 clause stays green',
  );
  assert.deepEqual(
    producerRenderPathViolations(opaqueHop, path, KANBAN_CHANNEL, 'column'),
    ["render path crosses '<DropChildren: component, DOM unknown>', which may not render its children"],
    'the header is inside a component that renders null — the render path must reject it too',
  );
  assert.deepEqual(
    producerSelectorPathViolations(opaqueHop, path, KANBAN_CHANNEL, 'column', KANBAN_ACCENT_SELECTOR),
    [
      "selector spells 'column' > 'column-header' but the live DOM inserts" +
        " '<DropChildren: component, DOM unknown>'",
      "selector hops 'column' to 'column-header' across '<DropChildren: component, DOM unknown>'," +
        ' whose emitted DOM this file cannot see',
    ],
    'the live selector-path clause keeps BOTH of its own findings, each naming the component',
  );

  const leaked = collectSinks(
    withLeakedSelectorAlternative(css, sinks[0].parent),
    cssPath,
    KANBAN_CHANNEL,
  );
  assert.equal(leaked.length, 1, 'the leaked alternative rides the SAME single declaration');
  const leakedSelector = normalizeSelector(leaked[0].parent.selector);
  assert.ok(
    leakedSelector.includes(".ds-pattern-kanban-board.ds-engine-modern[data-part='root']") &&
      leakedSelector.includes("[data-part='column-header']"),
    'the retired `includes` pair stays true on the leaked selector — that is the false green',
  );
  assert.deepEqual(
    scopeViolations(leaked[0], KANBAN_ACCENT_SELECTOR),
    [
      'the sink rule carries 2 selectors, not 1',
      `the sink selector is ${KANBAN_ACCENT_SELECTOR}, .ds-leak`,
    ],
    'the identity check must reject the unscoped alternative on both counts',
  );
});

test('CK-E nonchart skins are engine-scoped and contain no generic hatch', () => {
  for (const [engine, filename, scope] of SKINS) {
    const path = join(cssRoot, engine, 'skin', filename);
    const css = readFileSync(path, 'utf8');
    assert.match(css, new RegExp(scope.replaceAll('.', '\\.')));
    assert.doesNotMatch(css, /(^|\})\s*\[data-part=/, `${engine}/${filename} contains a bare part selector`);

    const escalations = collectEscalations(css, path);
    assert.deepEqual(
      escalations,
      [],
      `${engine}/${filename} introduced ungoverned !important:\n  ${escalations.join('\n  ')}`,
    );
  }
});

// The NBSP test datum, built from its code point so this source file stays pure
// ASCII and carries no invisible byte. It must be the real code point at
// runtime: handing postcss a backslash-escaped form instead would hand postcss a
// CSS *escape* — a different input, testing a different law.
const NBSP = String.fromCodePoint(0xa0);

// The helper above is byte-identical to the one in
// ck-e-migration-certification.test.mjs, but "byte-identical to a tested copy" is
// not evidence — it is a claim about another file. This gate owns its own proof.
// Every case is constructed in memory and driven through this file's real
// `collectEscalations`; no CSS source file is ever mutated to exercise the gate.
test('CK-E noncharts escalation exemption admits the exact triple and launders no NBSP', () => {
  const scan = (css) => collectEscalations(css, 'in-memory.css');

  const guard = `
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  `;

  // The one admitted shape, and the same shape written with all five CSS
  // whitespace characters at every position this helper normalizes. Narrowing
  // `\s`/`trim` to `[ \t\n\f\r]` must not cost the four non-SPACE members.
  assert.deepEqual(scan(`@media (prefers-reduced-motion: reduce) { .a { ${guard} } }`), []);
  assert.deepEqual(
    scan(
      `@media\n  (prefers-reduced-motion:\t\treduce)\r\n { .a {\f transition-duration:\r0.01ms\t!important; } }`,
    ),
    [],
    'CSS whitespace formatting must still normalize onto the exempt form',
  );

  // Nothing else rides the exemption: not a paint property, not another value,
  // not the triple outside any query, not a compound or negated query.
  assert.equal(scan(`@media (prefers-reduced-motion: reduce) { .a { background: red !important; } }`).length, 1);
  assert.equal(scan(`@media (prefers-reduced-motion: reduce) { .a { transition-duration: 2s !important; } }`).length, 1);
  assert.equal(scan(`.a { ${guard} }`).length, 3);
  assert.equal(scan(`@media not (prefers-reduced-motion: reduce) { .a { ${guard} } }`).length, 3);
  assert.equal(
    scan(`@media (prefers-reduced-motion: reduce) and (min-width: 40rem) { .a { ${guard} } }`).length,
    3,
  );
  assert.equal(
    scan(`@media (prefers-reduced-motion: reduce) { @media (hover: hover) { .a { ${guard} } } }`).length,
    3,
  );

  // NBSP laundering. NBSP is whitespace to JavaScript and is NOT whitespace to
  // CSS, so under `/\s+/` + `String.prototype.trim` each line below normalized
  // onto the exempt form and had its `!important` laundered through — while
  // being a declaration the R5 guard does not mandate: a query no browser
  // matches, an at-rule that is not `media`, a property that is not
  // `transition-duration`, a value that is not `0.01ms`. Each reaches a
  // different normalization site. Every parse shape is what postcss actually
  // yields; none is hand-built.
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
      scan(css).length > 0,
      `NBSP must not launder the reduced-motion exemption (${site})`,
    );
  }

  // The causal pins, permanent: the exact strings the abandoned JS-whitespace
  // spelling would have produced. They are the defect written down as executable
  // assertions, and they fail the moment `\s`/`trim` returns.
  const nameLeak = postcss.parse(`@media${NBSP}(prefers-reduced-motion: reduce) { .a { ${guard} } }`);
  assert.equal(nameLeak.first.name, `media${NBSP}`, 'the raw at-rule name must keep the code point');
  assert.equal(nameLeak.first.name.trim(), 'media', 'JS trim is what falsely made it the media at-rule');
  assert.equal(cssTrim(nameLeak.first.name), `media${NBSP}`, 'cssTrim must keep it foreign');

  const paramsLeak = postcss.parse(`@media (prefers-reduced-motion:${NBSP}reduce) { .a { ${guard} } }`);
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

  // Comment-aware, not text-blind: the regex this replaced greps positive on
  // prose that merely mentions the word.
  assert.deepEqual(scan(`.a { /* these rules win without !important */ color: red; }`), []);
});

test('CK-E Timeline runtime marker colour crosses only through a scoped custom property', () => {
  const sourceText = source(FILES.timelineRustic);
  const css = readFileSync(join(cssRoot, 'rustic/skin/pattern-timeline.css'), 'utf8');
  assert.equal(sourceText.match(/'--ds-pattern-timeline-marker-color': color/g)?.length, 2);
  assert.equal(css.match(/var\(--ds-pattern-timeline-marker-color\)/g)?.length, 3);
});

test('CK-E Rustic Kanban preserves distinct initial, settled and hover card shadows', () => {
  const sourceText = source(FILES.kanbanRustic);
  const css = readFileSync(join(cssRoot, 'rustic/skin/pattern-kanban-board.css'), 'utf8');
  const initial = css.indexOf('box-shadow: var(--ds-card-shadow, var(--ds-shadow-sm));');
  const settled = css.indexOf("[data-part='card'][data-hover-cycle='settled']");
  const hover = css.indexOf("[data-part='card'][data-dragging='false']:hover");

  assert.notEqual(initial, -1, 'initial state must retain the shadow-sm fallback');
  assert.notEqual(settled, -1, 'mouseleave must have a finite settled selector');
  assert.notEqual(hover, -1, 'hover must retain its finite selector');
  assert.ok(initial < settled && settled < hover, 'initial, settled and hover cascade order drifted');
  assert.match(
    css,
    /> \[data-part='card'\]\[data-part='card'\] \{[\s\S]*?box-shadow: var\(--ds-card-shadow, var\(--ds-shadow-sm\)\);[\s\S]*?\}/,
  );
  assert.match(css.slice(settled, hover), /box-shadow: var\(--ds-card-shadow, none\);/);
  assert.match(
    css.slice(hover),
    /^\[data-part='card'\]\[data-dragging='false'\]:hover \{[\s\S]*?box-shadow: var\(--ds-card-shadow-hover, var\(--ds-shadow-md\)\);[\s\S]*?\}/,
  );
  assert.match(sourceText, /onMouseLeave=\{\(e\) => \{\s*if \(!isDragging\) e\.currentTarget\.dataset\.hoverCycle = 'settled';\s*\}\}/);
  assert.doesNotMatch(sourceText, /\.style\.(?:boxShadow|transform)\s*=/);
});

test('CK-E Rustic Timeline owns the reset shadow only for clickable cards', () => {
  const css = readFileSync(join(cssRoot, 'rustic/skin/pattern-timeline.css'), 'utf8');
  const cardRules = [...css.matchAll(/([^{}]*\.ds-timeline-rustic__item-card[^{}]*)\{([^{}]*)\}/g)];

  assert.equal(cardRules.length, 3);
  assert.doesNotMatch(cardRules[0][2], /box-shadow\s*:/);
  assert.match(cardRules[1][1], /\[data-clickable='true'\]/);
  assert.match(cardRules[1][2], /box-shadow: none;/);
  assert.match(cardRules[2][1], /\[data-clickable='true'\]:hover/);
  assert.match(cardRules[2][2], /box-shadow: 0 2px 8px rgba\(0, 0, 0, 0\.1\);/);
  assert.doesNotMatch(css, /\[data-clickable='false'\][^{]*\{[^}]*box-shadow\s*:/);
});

test('CK-E preserves shared Tree paint ownership and embedded structural CSS', () => {
  const modern = source(FILES.treeModern);
  const rustic = source(FILES.treeRustic);
  assert.match(modern, /import \{ panelCardStyle \}/);
  assert.equal(modern.match(/\.\.\.panelCardStyle/g)?.length, 2);
  assert.match(
    rustic,
    /<style>\{`@keyframes ds-tree-view-rustic-pulse \{ 0%,100%\{opacity:1\} 50%\{opacity:\.4\} \}`\}<\/style>/,
  );
  assert.doesNotMatch(rustic, /@keyframes\s+pulse\b/);
});
