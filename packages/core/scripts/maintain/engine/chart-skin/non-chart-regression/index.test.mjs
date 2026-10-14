import assert from 'node:assert/strict';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, posix, relative, sep } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import postcss from 'postcss';
import ts from 'typescript';

import { countArc09PaintInFile } from '../../../../libraries/paint/inline/index.mjs';
import { packageRoot as findPackageRoot } from '../../../../libraries/repo-root/index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const packageRoot = findPackageRoot(HERE);
const patternsRoot = join(packageRoot, 'src/components/patterns/visualization');
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
  ['modern', 'pattern-calendar-view/index.css', '.ds-pattern-calendar-view.ds-engine-modern'],
  ['rustic', 'pattern-calendar-view/index.css', '.ds-pattern-calendar-view.ds-engine-rustic'],
  ['modern', 'pattern-map-view/index.css', '.ds-pattern-map-view.ds-engine-modern'],
  ['rustic', 'pattern-map-view/index.css', '.ds-pattern-map-view.ds-engine-rustic'],
  ['modern', 'pattern-kanban-board/index.css', '.ds-pattern-kanban-board.ds-engine-modern'],
  ['rustic', 'pattern-kanban-board/index.css', '.ds-pattern-kanban-board.ds-engine-rustic'],
  ['modern', 'pattern-timeline/index.css', '.ds-pattern-timeline.ds-engine-modern'],
  ['rustic', 'pattern-timeline/index.css', '.ds-pattern-timeline.ds-engine-rustic'],
  ['modern', 'pattern-tree-view/index.css', '.ds-pattern-tree-view.ds-engine-modern'],
  ['rustic', 'pattern-tree-view/index.css', '.ds-pattern-tree-view.ds-engine-rustic'],
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
// See src/foundation/tokens/tests/reduced-motion-guard.test.ts. Nothing else
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

test('visualization skin noncharts migrate the exact 195-site start to the four caller-derived floors', () => {
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
test('visualization skin nonchart direct-paint floors retain their exact caller-derived identities', () => {
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
// `style={{ '--ds-calendar-view-entry-accent': ev.color }}`, leave a commented corpse
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
const CALENDAR_CHANNEL = '--ds-calendar-view-entry-accent';
const KANBAN_CHANNEL = '--ds-kanban-board-column-accent';
const CALENDAR_FILL_PROPS = ['background', 'backgroundColor'];
const KANBAN_STRIP_PROPS = ['borderTop', 'borderBlockStart'];

// The abandoned spellings, kept only as the causal pins at the end of each
// channel test: they are quoted so the defect is written down as an executable
// assertion. `\s` is admissible in these two — they scan TSX source, where JS
// whitespace is the correct set; the CSS-only rule above governs CSS positions.
const RETIRED_CALENDAR_PRODUCER_REGEX = /'--ds-calendar-view-entry-accent': ev\.color\b/g;
const RETIRED_KANBAN_PRODUCER_REGEX = /'--ds-kanban-board-column-accent': column\.color\b/g;
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

// The second live stamp form: a CONDITIONAL SPREAD. A family that must leave its
// channel reachable from the theme when the datum states no value cannot write
// `style={cond ? {…} : undefined}` — React still owns the attribute — so it
// spreads the whole `style` prop or nothing:
// `{...(ev.color === undefined ? {} : { style: {…} })}`. The object literal then
// sits in a PROPERTY position inside a spread payload, not in a `style`
// attribute, and a collector that only knows the attribute form counts zero
// publishers for a family that publishes correctly. The transparent-wrapper set
// is the same one on both sides; only the last hop differs.
function styleObjectsInSpreadPayload(expression, objects) {
  for (const payload of collectStyleObjects(expression, [])) {
    for (const property of payload.properties) {
      if (!ts.isPropertyAssignment(property)) continue;
      if (propertyKey(property.name).text !== 'style') continue;
      collectStyleObjects(property.initializer, objects);
    }
  }
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
    if (ts.isJsxSpreadAttribute(node)) styleObjectsInSpreadPayload(node.expression, objects);
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
  if (expression && ts.isPropertyAssignment(expression)) {
    return owningJsxElementOfSpreadStamp(node, expression);
  }
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

// The ascent mirror of `styleObjectsInSpreadPayload`. Every hop is checked by
// identity of position exactly as the attribute chain is, so a `style` property
// on an object that never reaches a JSX spread resolves to null.
function owningJsxElementOfSpreadStamp(styleObject, property) {
  if (property.initializer !== styleObject) return null;
  if (propertyKey(property.name).text !== 'style') return null;

  let payload = property.parent;
  if (!payload || !ts.isObjectLiteralExpression(payload)) return null;
  for (let parent = transparentParentOf(payload); parent; parent = transparentParentOf(payload)) {
    payload = parent;
  }

  const spread = payload.parent;
  if (!spread || !ts.isJsxSpreadAttribute(spread) || spread.expression !== payload) return null;

  const attributes = spread.parent;
  if (!attributes || !ts.isJsxAttributes(attributes)) return null;

  const element = attributes.parent;
  if (!element || (!ts.isJsxOpeningElement(element) && !ts.isJsxSelfClosingElement(element))) return null;
  return element;
}

// ---------------------------------------------------------------------------
// The HOISTED CONDITIONAL ALIAS (EVI-02 re-arm, the shape 042d10aa2 landed).
//
// A family whose one publication must reach TWO mutually exclusive owners — the
// read-only chip and the interactive one — cannot write the literal twice
// without publishing twice. So it hoists the literal ONCE into a `const` and
// hands the identifier to each branch:
//
//   const accent = ev.color === undefined ? undefined : ({ '<channel>': ev.color } as …);
//   if (!interactive) return <EventChip {...(accent === undefined ? {} : { style: accent })}>…;
//   return <ModernButton data-part="event" style={accent}>…;
//
// The collectors above only ever see a literal standing IN a style position, so
// this shape read as ZERO publishers for a family that publishes correctly. The
// admission is ONE binding hop and nothing wider, each condition what keeps it a
// mirror of the literal forms rather than general data flow:
//
//   * the binding is a `const` in a variable statement, its initializer a
//     conditional (through the transparent wrappers) whose arms are each either
//     `undefined` or an object literal — every object-literal arm is a style
//     object, so a conditional with TWO literal arms is two publications, never
//     one;
//   * EVERY reference to the binding in its enclosing block is one of exactly
//     three positions: `style={<id>}`, the `style: <id>` payload of a JSX spread
//     `{...(<id> === undefined ? {} : { style: <id> })}`, or that spread's own
//     `<id> === undefined` guard. Any other reference — a prop, a second `const`
//     re-binding it, a shorthand property — refuses the WHOLE alias, by name,
//     and its literal counts as nothing: a value that escapes to where this file
//     cannot follow it is not a publication this gate can certify;
//   * the owners are the SET of elements the style positions sit on. Every
//     downstream clause is then asked of each owner in turn, never of one picked
//     owner.
//
// Stated scope: exclusivity of the branches is not evaluated; a non-exclusive
// pair would publish the SAME literal on two elements that each have to pass
// every clause independently, so no clause is weakened by not proving it.
function unwrapTransparent(expression) {
  let node = expression;
  while (
    ts.isParenthesizedExpression(node) ||
    ts.isAsExpression(node) ||
    ts.isSatisfiesExpression(node) ||
    ts.isNonNullExpression(node) ||
    ts.isTypeAssertionExpression(node)
  ) {
    node = node.expression;
  }
  return node;
}

function isUndefinedIdentifier(node) {
  return ts.isIdentifier(node) && node.text === 'undefined';
}

function lineOf(node) {
  const sourceFile = node.getSourceFile();
  return sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1;
}

// An identifier that NAMES something (a property key, an attribute name, a
// member name) is not a reference to the binding.
function isReferencePosition(identifier) {
  const parent = identifier.parent;
  if (ts.isPropertyAccessExpression(parent) && parent.name === identifier) return false;
  if (ts.isPropertyAssignment(parent) && parent.name === identifier) return false;
  if (ts.isJsxAttribute(parent) && parent.name === identifier) return false;
  if (ts.isQualifiedName(parent) && parent.right === identifier) return false;
  if (
    (ts.isPropertySignature(parent) || ts.isPropertyDeclaration(parent) || ts.isMethodDeclaration(parent)) &&
    parent.name === identifier
  ) {
    return false;
  }
  return true;
}

// `<id> === undefined`, spelled exactly that way round.
function isUndefinedGuardOf(expression, name) {
  const node = unwrapTransparent(expression);
  return (
    ts.isBinaryExpression(node) &&
    node.operatorToken.kind === ts.SyntaxKind.EqualsEqualsEqualsToken &&
    ts.isIdentifier(node.left) &&
    node.left.text === name &&
    isUndefinedIdentifier(node.right)
  );
}

// The `{ style: <id> }` payload of `{...(<id> === undefined ? {} : { style: <id> })}`.
// The payload must be the ONLY property of the FALSE arm, the TRUE arm must be an
// empty object, and the guard must name the same binding.
function isGuardedSpreadPayload(property, name) {
  const payload = property.parent;
  if (!payload || !ts.isObjectLiteralExpression(payload) || payload.properties.length !== 1) return false;
  let arm = payload;
  while (arm.parent && !ts.isConditionalExpression(arm.parent) && transparentParentOf(arm)) {
    arm = arm.parent;
  }
  const conditional = arm.parent;
  if (!conditional || !ts.isConditionalExpression(conditional) || conditional.whenFalse !== arm) return false;
  const empty = unwrapTransparent(conditional.whenTrue);
  return (
    isUndefinedGuardOf(conditional.condition, name) &&
    ts.isObjectLiteralExpression(empty) &&
    empty.properties.length === 0
  );
}

// The JSX element a reference stamps as its `style`, or null.
function aliasStyleOwner(reference) {
  const parent = reference.parent;
  if (ts.isJsxExpression(parent) && parent.expression === reference) {
    const attribute = parent.parent;
    if (
      !attribute ||
      !ts.isJsxAttribute(attribute) ||
      attribute.initializer !== parent ||
      !ts.isIdentifier(attribute.name) ||
      attribute.name.text !== 'style'
    ) {
      return null;
    }
    const element = attribute.parent?.parent;
    if (!element || (!ts.isJsxOpeningElement(element) && !ts.isJsxSelfClosingElement(element))) return null;
    return element;
  }
  if (ts.isPropertyAssignment(parent) && parent.initializer === reference) {
    if (!isGuardedSpreadPayload(parent, reference.text)) return null;
    return owningJsxElementOfSpreadStamp(reference, parent);
  }
  return null;
}

// The `<id> === undefined` guard of an ADMITTED spread stamp — the only
// non-style reference the alias may carry.
function isAdmittedSpreadGuard(reference) {
  const guard = reference.parent;
  if (!ts.isBinaryExpression(guard) || guard.left !== reference || !isUndefinedGuardOf(guard, reference.text)) {
    return false;
  }
  const conditional = guard.parent;
  if (!conditional || !ts.isConditionalExpression(conditional) || conditional.condition !== guard) return false;
  const payload = unwrapTransparent(conditional.whenFalse);
  if (!ts.isObjectLiteralExpression(payload) || payload.properties.length !== 1) return false;
  const [property] = payload.properties;
  return (
    ts.isPropertyAssignment(property) &&
    ts.isIdentifier(property.initializer) &&
    property.initializer.text === reference.text &&
    aliasStyleOwner(property.initializer) !== null
  );
}

function aliasScopeOf(statement) {
  for (let node = statement.parent; node; node = node.parent) {
    if (
      ts.isBlock(node) ||
      ts.isSourceFile(node) ||
      ts.isModuleBlock(node) ||
      ts.isCaseClause(node) ||
      ts.isDefaultClause(node)
    ) {
      return node;
    }
  }
  return statement.getSourceFile();
}

const HOISTED_STYLE_ALIASES = new WeakMap();

function hoistedStyleAliases(sourceFile) {
  const cached = HOISTED_STYLE_ALIASES.get(sourceFile);
  if (cached) return cached;

  const aliases = [];
  const visit = (node) => {
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.initializer &&
      ts.isVariableDeclarationList(node.parent) &&
      (node.parent.flags & ts.NodeFlags.Const) !== 0 &&
      ts.isVariableStatement(node.parent.parent)
    ) {
      const conditional = unwrapTransparent(node.initializer);
      if (ts.isConditionalExpression(conditional)) {
        const arms = [conditional.whenTrue, conditional.whenFalse].map(unwrapTransparent);
        const literals = arms.filter((arm) => ts.isObjectLiteralExpression(arm));
        if (
          literals.length > 0 &&
          arms.every((arm) => isUndefinedIdentifier(arm) || ts.isObjectLiteralExpression(arm))
        ) {
          aliases.push(judgeHoistedAlias(node, literals));
        }
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);

  HOISTED_STYLE_ALIASES.set(sourceFile, aliases);
  return aliases;
}

function judgeHoistedAlias(declaration, literals) {
  const name = declaration.name.text;
  const references = [];
  const collect = (node) => {
    if (ts.isIdentifier(node) && node.text === name && node !== declaration.name && isReferencePosition(node)) {
      references.push(node);
    }
    ts.forEachChild(node, collect);
  };
  collect(aliasScopeOf(declaration.parent.parent));

  const owners = [];
  const refusals = [];
  for (const reference of references) {
    const owner = aliasStyleOwner(reference);
    if (owner) {
      owners.push(owner);
      continue;
    }
    if (isAdmittedSpreadGuard(reference)) continue;

    let value = reference;
    for (let parent = transparentParentOf(value); parent; parent = transparentParentOf(value)) value = parent;
    const binder = value.parent;
    if (binder && ts.isVariableDeclaration(binder) && binder.initializer === value) {
      refusals.push(
        `the alias '${name}' is re-bound by const '${binder.name.getText()}' @ line ${lineOf(binder)}; only one const hop is followed`,
      );
      continue;
    }
    refusals.push(
      `the alias '${name}' is used outside a style position (${ts.SyntaxKind[reference.parent.kind]} @ line ${lineOf(reference)})`,
    );
  }
  if (owners.length === 0 && refusals.length === 0) refusals.push(`the alias '${name}' reaches no style position`);

  return { name, declaration, literals, owners, refusals };
}

// Every style object this gate can attribute to an owner: the literals standing
// in a style position (one owner each, or none when the chain breaks), and the
// literal arms of an ADMITTED hoisted alias (the alias's owner set). A refused
// alias contributes nothing.
function styleObjectRecords(sourceFile) {
  const records = styleObjectLiterals(sourceFile).map((object) => {
    const owner = owningJsxElement(object);
    return { object, owners: owner ? [owner] : [] };
  });
  for (const alias of hoistedStyleAliases(sourceFile)) {
    if (alias.refusals.length > 0) continue;
    for (const object of alias.literals) records.push({ object, owners: alias.owners });
  }
  return records;
}

function isChannelProducer(property, channel, datum) {
  if (!ts.isPropertyAssignment(property)) return false;
  const key = propertyKey(property.name);
  return key.quoted && key.text === channel && isDatumColor(property.initializer, datum);
}

// The refusals of every hoisted alias whose literal carries the channel — the
// reason a hoisted publication reads as zero, by name.
function channelAliasRefusals(text, path, channel, datum) {
  return hoistedStyleAliases(parseTsx(text, path))
    .filter((alias) =>
      alias.literals.some((object) => object.properties.some((property) => isChannelProducer(property, channel, datum))),
    )
    .flatMap((alias) => alias.refusals);
}

// The channel producer in its one canonical form: a QUOTED channel key on a
// style object, initialized by the datum's `.color` and nothing else. A renamed
// channel, a computed key, a wrapped or defaulted value all read as zero — the
// gate then names the missing publication rather than passing on a near-miss.
// Each hit is recorded WITH the set of JSX elements that own it — one for a
// literal in a style position, the branch set for a hoisted alias. The count is
// the length of the record list, one per LITERAL, so every v2 count fact is
// unchanged by construction.
function collectChannelProducers(text, path, channel, datum) {
  const producers = [];
  for (const { object, owners } of styleObjectRecords(parseTsx(text, path))) {
    for (const property of object.properties) {
      if (!isChannelProducer(property, channel, datum)) continue;
      producers.push({ property, owners });
    }
  }
  return producers;
}

// Every owner-level clause below runs through here: the count is the shared
// precondition, and the clause is then judged for EACH owner of the one
// producer. A single owner reports its violations exactly as before; with
// several, each violation is prefixed by the owner it belongs to, so a red on
// one branch can never be read as the other's.
//
// The STYLE_HOSTS admission (below) is decided here, once per owner, and handed
// to the judge explicitly. It is never looked up from inside a walk: that is what
// keeps it scoped to the producer's OWN element (H5) — the same component met as
// an intermediate hop is a different node, and it is never handed an admission.
function judgeEachProducerOwner(text, path, channel, datum, judge) {
  const producers = collectChannelProducers(text, path, channel, datum);
  if (producers.length !== 1) return [`the channel carries ${producers.length} producers, not 1`];

  const { owners } = producers[0];
  if (owners.length === 0) return ['the producer style object never reaches a JSX element'];

  const violations = [];
  for (const owner of owners) {
    const found = judge(owner, styleHostAdmission(owner, channel));
    if (owners.length === 1) violations.push(...found);
    else violations.push(...found.map((violation) => `${ownerLabel(owner)}: ${violation}`));
  }
  return violations;
}

function ownerLabel(owner) {
  return `owner <${owner.tagName.getText()}> @ line ${lineOf(owner)}`;
}

// The owner set of each producer, for the evidence: tag, line and part.
function channelProducerOwners(text, path, channel, datum) {
  return collectChannelProducers(text, path, channel, datum).map(({ owners }) =>
    owners.map((owner) => ({
      tag: owner.tagName.getText(),
      line: lineOf(owner),
      part: literalDataPart(owner).value,
      className: staticClassNameLiteral(owner),
    })),
  );
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
// ---------------------------------------------------------------------------
// LOCAL PART WRAPPERS.
//
// A family whose part carries interaction state cannot spell that part as a
// literal attribute on a `<div>`: the state has to come from `useInteractionState`,
// and a hook needs a component. The families that took that step declare a tiny
// local wrapper — `const EventChip = React.forwardRef(function EventChip({ children,
// ...rest }, ref) { … return <div {...rest} {...partAttributes('event', state)}>
// {children}</div>; })` — and render `<EventChip>` where `<div data-part="event">`
// used to stand.
//
// That element is NOT opaque and its part is NOT unknown. The component is
// declared in THIS file, it emits exactly one intrinsic element, and the part it
// stamps is a string literal this walk can read. Treating it as a component whose
// DOM is unseen would report a defect that is not there, and would make every
// clause below fail on a family that publishes correctly.
//
// The admission is deliberately narrow, and each condition is what makes the
// resolution sound rather than convenient:
//
//   * the declaration is top-level and capitalised — it is a component, not a
//     helper that happens to build JSX;
//   * it stamps `partAttributes` with a string-literal part EXACTLY ONCE, so the
//     name resolves to one part and a wrapper that stamps two parts resolves to
//     neither;
//   * the stamped element's tag is intrinsic and carries no literal `data-part`
//     of its own, so the emitted node is one DOM element with one part identity;
//   * EVERY return in the declaration is that element, so the component cannot
//     render `null`, a fragment, or a different tree on another branch — that is
//     precisely the opacity `classifyTag` exists to refuse, and it is still
//     refused here.
//
// Anything short of all four stays opaque. `DropChildren` — the mutant component
// that returns `null` — fails the last condition and is refused, which is why the
// opaque-hop mutants below remain red.
const LOCAL_PART_WRAPPERS = new WeakMap();

function unwrapParens(expression) {
  let node = expression;
  while (ts.isParenthesizedExpression(node)) node = node.expression;
  return node;
}

function literalDataPartAttributes(element) {
  return element.attributes.properties.filter(
    (attribute) =>
      ts.isJsxAttribute(attribute) &&
      ts.isIdentifier(attribute.name) &&
      attribute.name.text === 'data-part',
  );
}

function localPartWrappers(sourceFile) {
  const cached = LOCAL_PART_WRAPPERS.get(sourceFile);
  if (cached) return cached;

  const wrappers = new Map();
  const declarations = [];
  for (const statement of sourceFile.statements) {
    if (ts.isFunctionDeclaration(statement) && statement.name) {
      declarations.push([statement.name.text, statement]);
    } else if (ts.isVariableStatement(statement)) {
      for (const declaration of statement.declarationList.declarations) {
        if (ts.isIdentifier(declaration.name) && declaration.initializer) {
          declarations.push([declaration.name.text, declaration.initializer]);
        }
      }
    }
  }

  for (const [name, body] of declarations) {
    if (!/^[A-Z]/.test(name)) continue;

    const stamps = [];
    const collectStamps = (node) => {
      if (
        ts.isJsxSpreadAttribute(node) &&
        ts.isCallExpression(node.expression) &&
        ts.isIdentifier(node.expression.expression) &&
        node.expression.expression.text === 'partAttributes' &&
        node.expression.arguments.length > 0 &&
        ts.isStringLiteral(node.expression.arguments[0])
      ) {
        stamps.push({ part: node.expression.arguments[0].text, attributes: node.parent });
      }
      ts.forEachChild(node, collectStamps);
    };
    collectStamps(body);
    if (stamps.length !== 1) continue;

    const attributes = stamps[0].attributes;
    if (!attributes || !ts.isJsxAttributes(attributes)) continue;
    const opening = attributes.parent;
    if (!opening || (!ts.isJsxOpeningElement(opening) && !ts.isJsxSelfClosingElement(opening))) continue;
    const tag = opening.tagName;
    if (!ts.isIdentifier(tag) || !/^[a-z]/.test(tag.text)) continue;
    if (literalDataPartAttributes(opening).length !== 0) continue;

    const stamped = ts.isJsxOpeningElement(opening) ? opening.parent : opening;
    const roots = [];
    const collectReturns = (node) => {
      if (ts.isReturnStatement(node) && node.expression) roots.push(unwrapParens(node.expression));
      ts.forEachChild(node, collectReturns);
    };
    collectReturns(body);
    if (roots.length === 0 || roots.some((root) => root !== stamped)) continue;

    wrappers.set(name, { part: stamps[0].part, tag: tag.text, classNameForwarded: wrapperForwardsClassName(body, opening) });
  }

  LOCAL_PART_WRAPPERS.set(sourceFile, wrappers);
  return wrappers;
}

// EVI-02 S2: does a local part wrapper hand the caller's `className` to the one
// element it stamps? Proven in THIS file: the render function's props pattern
// leaves `className` in its rest binding (never destructures it out), the
// stamped element spreads that rest binding, writes no `className` of its own,
// and every spread AFTER the rest spread is either the wrapper's single
// `partAttributes(…)` stamp or `<x>.handlers` of a `useInteractionState()`
// const. Stated residual, the same trust this gate has extended to the wrapper's
// `style` since S1: the keys of `useInteractionState().handlers` are not proven
// here. Anything else records no forwarding, and a class hop then fails closed.
function wrapperForwardsClassName(body, opening) {
  let fn = body;
  if (ts.isCallExpression(fn)) fn = fn.arguments.length > 0 ? unwrapTransparent(fn.arguments[0]) : null;
  if (!fn || !(ts.isArrowFunction(fn) || ts.isFunctionExpression(fn) || ts.isFunctionDeclaration(fn))) return false;
  const [props] = fn.parameters;
  if (!props || !ts.isObjectBindingPattern(props.name)) return false;
  const rest = props.name.elements.find((element) => element.dotDotDotToken && ts.isIdentifier(element.name));
  const destructured = props.name.elements.some(
    (element) => !element.dotDotDotToken && literalKeyText(element.propertyName ?? element.name) === 'className',
  );
  if (!rest || destructured) return false;

  const attributes = opening.attributes.properties;
  const restSpread = attributes.findIndex(
    (attribute) =>
      ts.isJsxSpreadAttribute(attribute) &&
      ts.isIdentifier(attribute.expression) &&
      attribute.expression.text === rest.name.text,
  );
  if (restSpread === -1) return false;
  if (attributes.some((attribute) => ts.isJsxAttribute(attribute) && attribute.name.getText() === 'className')) {
    return false;
  }
  const interactionConsts = new Set();
  const collectConsts = (node) => {
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.initializer &&
      ts.isCallExpression(node.initializer) &&
      ts.isIdentifier(node.initializer.expression) &&
      node.initializer.expression.text === 'useInteractionState'
    ) {
      interactionConsts.add(node.name.text);
    }
    ts.forEachChild(node, collectConsts);
  };
  collectConsts(fn);
  return attributes.slice(restSpread + 1).every((attribute) => {
    if (!ts.isJsxSpreadAttribute(attribute)) return true;
    const spread = attribute.expression;
    if (ts.isCallExpression(spread) && ts.isIdentifier(spread.expression) && spread.expression.text === 'partAttributes') {
      return true;
    }
    return (
      ts.isPropertyAccessExpression(spread) &&
      spread.name.text === 'handlers' &&
      ts.isIdentifier(spread.expression) &&
      interactionConsts.has(spread.expression.text)
    );
  });
}

// A spread that provably sets none of `key`: object literals only (through
// parentheses, assertions and conditional arms), with literal keys, none `key`.
function spreadCannotSet(expression, key) {
  const node = unwrapTransparent(expression);
  if (ts.isConditionalExpression(node)) {
    return spreadCannotSet(node.whenTrue, key) && spreadCannotSet(node.whenFalse, key);
  }
  if (!ts.isObjectLiteralExpression(node)) return false;
  return node.properties.every((member) => {
    if (!(ts.isPropertyAssignment(member) || ts.isShorthandPropertyAssignment(member))) return false;
    const name = literalKeyText(member.name);
    return name !== null && name !== key;
  });
}

// The element's STATIC className at the call site: exactly one `className`
// attribute whose value is a string literal, and no later spread that could
// replace it — unless that spread provably sets no `className`. Null otherwise.
function staticClassNameLiteral(opening) {
  const attributes = opening.attributes.properties;
  const named = attributes.filter((attribute) => ts.isJsxAttribute(attribute) && attribute.name.getText() === 'className');
  if (named.length !== 1) return null;
  const later = attributes.slice(attributes.indexOf(named[0]) + 1);
  if (later.some((attribute) => ts.isJsxSpreadAttribute(attribute) && !spreadCannotSet(attribute.expression, 'className'))) {
    return null;
  }
  const value = named[0].initializer;
  if (value && ts.isStringLiteral(value)) return value.text;
  const inner = value && ts.isJsxExpression(value) ? value.expression : null;
  if (inner && (ts.isStringLiteral(inner) || ts.isNoSubstitutionTemplateLiteral(inner))) return inner.text;
  return null;
}

function localPartWrapperOf(element) {
  const tag = element.tagName;
  if (!ts.isIdentifier(tag)) return null;
  return localPartWrappers(element.getSourceFile()).get(tag.text) ?? null;
}

function literalDataPart(element) {
  const found = literalDataPartAttributes(element);
  if (found.length === 0) {
    const wrapper = localPartWrapperOf(element);
    if (wrapper) return { count: 1, value: wrapper.part };
  }
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

// ---------------------------------------------------------------------------
// The ADMITTED HOST owner (P-88, DT ruling 2026-10-11, R-b / R-c).
//
// A style host is admitted by the proof that it stamps its OWN literal part and
// that the caller's `data-part` can never land (H4-T1). So the call site of an
// admitted host carries NO `data-part` at all, and the owner names the element
// through its class hook instead: one static `<block>__<part>` token, counted
// only when the host is PROVEN to hand the caller's className to its root (H6).
// This is the one place a class identifies an element without a part beside it;
// everywhere else the co-stamp (part AND class) stays the rule.
const OWNER_CLASS_TOKEN = /^(ds-[a-z0-9]+(?:-[a-z0-9]+)*)__([a-z0-9]+(?:-[a-z0-9]+)*)$/;

function hostOwnerIdentity(owner, admission) {
  if (admission?.admitted !== true) return null;
  const dataPart = literalDataPart(owner);
  if (dataPart.count !== 0) {
    return {
      refused: `the producer element carries ${dataPart.count} data-part attributes, not 0: an admitted host stamps its own part and a caller part never lands`,
      callerPart: true,
      tokens: [],
      hooks: [],
    };
  }
  if (admission.facts.classNameForwarded !== true) {
    return {
      refused: 'the admitted host is not proven to forward the caller className, so no class names it',
      callerPart: false,
      tokens: [],
      hooks: [],
    };
  }
  const tokens = (staticClassNameLiteral(owner) ?? '').split(/\s+/).filter(Boolean);
  const hooks = tokens.flatMap((token) => {
    const match = OWNER_CLASS_TOKEN.exec(token);
    return match ? [{ token, part: match[2] }] : [];
  });
  return { refused: null, callerPart: false, tokens, hooks };
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
function producerPlacementViolations(text, path, channel, datum, part, hostClass = null) {
  return judgeEachProducerOwner(text, path, channel, datum, (owner, admission) => {
    // R-c: an admitted host is identified by the exact owner class token alone, with NO data-part.
    const host = hostOwnerIdentity(owner, admission);
    if (host) {
      if (host.refused) return [host.refused];
      const naming = host.hooks.filter((hook) => hook.part === part);
      if (naming.length !== 1) {
        return [`the admitted host carries ${naming.length} static class hooks naming '${part}', not 1`];
      }
      if (hostClass !== null && naming[0].token !== hostClass) {
        return [`the admitted host is named by '.${naming[0].token}', not '.${hostClass}'`];
      }
      return [];
    }
    const dataPart = literalDataPart(owner);
    if (dataPart.count !== 1) {
      return [`the producer element carries ${dataPart.count} data-part attributes, not 1`];
    }
    if (dataPart.value === null) return ['the producer element data-part is not a string literal'];
    if (dataPart.value !== part) {
      return [`the producer element is data-part '${dataPart.value}', not '${part}'`];
    }
    return [];
  });
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
function ownerAncestryParts(owner, admission = null, hostClass = null) {
  const parts = [];

  for (let node = ts.isJsxOpeningElement(owner) ? owner.parent : owner; node; node = node.parent) {
    let opening = null;
    if (ts.isJsxSelfClosingElement(node)) opening = node;
    else if (ts.isJsxElement(node)) opening = node.openingElement;
    if (!opening) continue;

    // R-c: the admitted host owner (and only the owner's own node, H5) is named by its class hook.
    const host = opening === owner ? hostOwnerIdentity(owner, admission) : null;
    if (host) {
      if (host.refused) parts.push(host.callerPart ? '<admitted host: a caller data-part>' : '<admitted host: className not forwarded>');
      else if (host.hooks.length !== 1) parts.push(`<admitted host: ${host.hooks.length} class hooks>`);
      else if (hostClass !== null && host.hooks[0].token !== hostClass) parts.push(`<admitted host: '.${host.hooks[0].token}'>`);
      else parts.push(host.hooks[0].part);
      continue;
    }

    const dataPart = literalDataPart(opening);
    if (dataPart.count > 1) parts.push(`<${dataPart.count} data-part attributes>`);
    else if (dataPart.count === 1 && dataPart.value === null) parts.push('<non-literal data-part>');
    else if (dataPart.count === 1) parts.push(dataPart.value);
  }

  return parts;
}

function producerAncestryViolations(text, path, channel, datum, ancestry, hostClass = null) {
  return judgeEachProducerOwner(text, path, channel, datum, (owner, admission) => {
    const actual = ownerAncestryParts(owner, admission, hostClass);
    if (actual.length !== ancestry.length || actual.some((part, index) => part !== ancestry[index])) {
      return [`the producer ancestry is ${actual.join(' -> ') || '(none)'}, not ${ancestry.join(' -> ')}`];
    }
    return [];
  });
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
    // A local part wrapper is the one component this file CAN see through: it is
    // declared here and provably emits one intrinsic element carrying one literal
    // part. It is classified as that element, never as unknown DOM.
    const wrapper = ts.isIdentifier(tag) ? localPartWrapperOf(opening) : null;
    if (wrapper) return { kind: 'intrinsic', label: `<${wrapper.tag}>` };
    return { kind: 'opaque', label: `<${tag.getText()}: component, DOM unknown>` };
  }
  if (HTML_VOID_ELEMENTS.has(tag.text)) {
    return { kind: 'void', label: `<${tag.text}: void element, renders no children>` };
  }
  return { kind: 'intrinsic', label: `<${tag.text}>` };
}

// ---------------------------------------------------------------------------
// STYLE HOSTS (EVI-02 S1': the HOLD-1 (i) ruling, with H2/H4 as amended by the
// H4 ruling).
//
// Since 042d10aa2 the interactive calendar chip is `<ModernButton
// data-part="event" style={accent}>`: the accent is a PROP of a component this
// file cannot see, and `classifyTag` rightly calls that opaque. ModernButton
// does in fact apply the caller's `style` and `data-part` to the one DOM element
// it renders, so the refusal is a visibility limit of this gate, not a defect of
// the source. This table is the one, narrow way past that limit, and it admits
// by PROOF, never by name:
//
//   * the table is CLOSED. Adding an entry, or widening one, is a reviewed
//     instrument change with its own drills — never a convenience;
//   * A2 — the owner's tag resolves through ITS OWN FILE's default import to
//     exactly `module`; a local re-binding, another path or a namespace member
//     is refused (the owner stays opaque);
//   * every proof is RE-PARSED from the real files on every run (no pinned
//     hash: parses are memoised per process by content only), and any shape the
//     proof does not recognise REFUSES. Each refusal names its clause;
//   * H1 the default export is a `forwardRef`/function whose EVERY return is one
//     intrinsic element, alone or as the sole child of a fragment;
//   * H2 each root's `style` is an object literal reaching the destructured
//     caller `style` (directly or through ONE same-function const) and nothing
//     after it may set the channel: a literal key other than the channel, or a
//     `trailingSpreads` entry proven by T2'-T4 (write sites, returns, host use);
//   * H3 `style` is destructured out of props;
//   * H4 the caller's `data-part` reaches each root UNMODIFIED: T0 the part
//     source resolves through named re-exports only and returns literal objects
//     keyed by its first parameter (PART_KEYS = their keys); T1 exactly one
//     `...partAttributes(<the caller binding> ?? '<literal>', …)` member in the
//     one const spread onto the root, followed only by literal non-part keys or
//     `trailingPartSpreads` entries proven by T2-T4, and nothing on the root
//     after that spread sets a part key;
//   * H5 the admission is handed ONLY to the producer's own element (see
//     `judgeEachProducerOwner`). The same component met as an intermediate hop
//     stays opaque, and so does every component not in this table.
//
// Effect (A4): an admitted owner is modelled as its root intrinsic tag(s)
// carrying the caller's static `data-part`; every OTHER clause still runs on it.
//
// Fail-closed additions this file makes beyond the rulings' text (each holds on
// the source it was written against, and each only ever refuses): the caller
// `style` binding, the style-chain const and the part-carrying const may be
// referenced ONLY at the positions the proof admits, and no spread may follow a
// root's `style` attribute. Without them a later
// `interactiveStyle['<channel>'] = …` would pass the proof silently.
const STYLE_HOSTS = [
  {
    name: 'ModernButton',
    module: 'src/components/primitives/inputs/button/engines/modern/index.tsx',
    partSource: { fn: 'partAttributes', module: 'src/foundation/behavior/kernel/anatomy/index.ts' },
    // S2 (H6): the recipe whose `root` slot carries the caller className.
    classSource: { fn: 'defineRecipe', module: 'src/infrastructure/runtime/foundation/recipes/engine/index.ts', slot: 'root' },
    trailingSpreads: {
      'responsive.channels': {
        producer: {
          fn: 'generateResponsiveCSS',
          module: 'src/infrastructure/runtime/responsive/viewport/style-properties/index.ts',
          member: 'channels',
        },
        keyFn: { fn: 'responsiveChannelVariable', module: 'src/foundation/contracts/kernel/responsive/channels/index.ts' },
        keyPrefix: '--_ds-rsp-',
      },
    },
    trailingPartSpreads: {
      'responsive.attrs': {
        producer: {
          fn: 'generateResponsiveCSS',
          module: 'src/infrastructure/runtime/responsive/viewport/style-properties/index.ts',
          member: 'attrs',
        },
        keyConsts: { module: 'src/foundation/contracts/kernel/responsive/channels/index.ts' },
      },
    },
  },
];

// The injected file-reader. Drills override files IN MEMORY through
// `withCoreFiles`; nothing on disk is ever written.
let coreFileOverlay = null;

function readCoreFile(rel) {
  if (coreFileOverlay?.has(rel)) return coreFileOverlay.get(rel);
  const full = join(packageRoot, rel);
  if (!existsSync(full) || !statSync(full).isFile()) return null;
  return readFileSync(full, 'utf8');
}

function withCoreFiles(overrides, run) {
  const previous = coreFileOverlay;
  coreFileOverlay = new Map([...(previous ?? new Map()), ...Object.entries(overrides)]);
  try {
    return run();
  } finally {
    coreFileOverlay = previous;
  }
}

const CORE_PARSES = new Map();

function parseCoreFile(rel) {
  const text = readCoreFile(rel);
  if (text === null) return null;
  const key = `${rel}\u0000${text}`;
  let parsed = CORE_PARSES.get(key);
  if (!parsed) {
    const kind = rel.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
    parsed = ts.createSourceFile(rel, text, ts.ScriptTarget.Latest, true, kind);
    CORE_PARSES.set(key, parsed);
  }
  return parsed;
}

function coreRelOf(fileName) {
  return relative(packageRoot, fileName).split(sep).join('/');
}

function shortSite(rel, node) {
  return `${rel.split('/').at(-2)} :${lineOf(node)}`;
}

// `@/` is `src/`; a relative specifier is resolved from the importing file. The
// file must exist in exactly ONE of the candidate spellings — two is ambiguity.
function resolveCoreModule(fromRel, specifier) {
  let base;
  if (specifier.startsWith('@/')) base = `src/${specifier.slice(2)}`;
  else if (specifier.startsWith('./') || specifier.startsWith('../')) {
    base = posix.normalize(posix.join(posix.dirname(fromRel), specifier));
  } else return { error: `'${specifier}' is not a module path this gate resolves` };
  const candidates = [base, `${base}.ts`, `${base}.tsx`, `${base}/index.ts`, `${base}/index.tsx`].filter(
    (candidate) => readCoreFile(candidate) !== null,
  );
  if (candidates.length !== 1) return { error: `'${specifier}' resolves to ${candidates.length} files, not 1` };
  return { rel: candidates[0] };
}

// How `name` is imported into `sourceFile`: default or named, never renamed or a
// namespace member. Two imports of one name are ambiguity.
function importOf(sourceFile, name) {
  const found = [];
  for (const statement of sourceFile.statements) {
    if (!ts.isImportDeclaration(statement) || !statement.importClause || statement.importClause.isTypeOnly) continue;
    const clause = statement.importClause;
    const specifier = statement.moduleSpecifier.text;
    if (clause.name?.text === name) found.push({ kind: 'default', specifier });
    const bindings = clause.namedBindings;
    if (bindings && ts.isNamespaceImport(bindings) && bindings.name.text === name) {
      found.push({ error: `'${name}' is a namespace import` });
    }
    if (bindings && ts.isNamedImports(bindings)) {
      for (const element of bindings.elements) {
        if (element.name.text !== name || element.isTypeOnly) continue;
        if (element.propertyName && element.propertyName.text !== name) {
          found.push({ error: `'${name}' is a renamed import of '${element.propertyName.text}'` });
        } else found.push({ kind: 'named', specifier });
      }
    }
  }
  if (found.length !== 1) return { error: `'${name}' is imported ${found.length} times, not once` };
  return found[0];
}

// Every value binding of `name` in the file other than its import.
function localRebinds(sourceFile, name) {
  const found = [];
  const visit = (node) => {
    if (
      (ts.isVariableDeclaration(node) ||
        ts.isFunctionDeclaration(node) ||
        ts.isClassDeclaration(node) ||
        ts.isParameter(node) ||
        ts.isBindingElement(node) ||
        ts.isFunctionExpression(node) ||
        ts.isClassExpression(node) ||
        ts.isEnumDeclaration(node) ||
        ts.isImportEqualsDeclaration(node)) &&
      node.name &&
      ts.isIdentifier(node.name) &&
      node.name.text === name
    ) {
      found.push(node);
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return found;
}

// `name` imported into the file at `fromRel` and resolving to exactly `module`.
function importResolvesTo(sourceFile, fromRel, name, module) {
  const imported = importOf(sourceFile, name);
  if (imported.error) return imported.error;
  if (imported.kind !== 'named') return `'${name}' is not a named import`;
  const resolved = resolveCoreModule(fromRel, imported.specifier);
  if (resolved.error) return resolved.error;
  if (resolved.rel !== module) return `'${name}' resolves to ${resolved.rel}, not ${module}`;
  const rebinds = localRebinds(sourceFile, name);
  if (rebinds.length > 0) return `'${name}' is re-bound locally @ line ${lineOf(rebinds[0])}`;
  return null;
}

function exportedFunction(sourceFile, name) {
  const found = sourceFile.statements.filter(
    (statement) =>
      ts.isFunctionDeclaration(statement) &&
      statement.name?.text === name &&
      statement.body &&
      (statement.modifiers ?? []).some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword),
  );
  if (found.length !== 1 || localRebinds(sourceFile, name).length !== 1) return null;
  return found[0];
}

// The returns that belong to `fn` itself, never to a nested function.
function functionReturns(fn) {
  const returns = [];
  const visit = (node) => {
    if (node !== fn && ts.isFunctionLike(node)) return;
    if (ts.isReturnStatement(node)) returns.push(node);
    ts.forEachChild(node, visit);
  };
  visit(fn);
  return returns;
}

function referencesIn(scope, name, declarationName) {
  const found = [];
  const visit = (node) => {
    if (ts.isIdentifier(node) && node.text === name && node !== declarationName && isReferencePosition(node)) {
      found.push(node);
    }
    ts.forEachChild(node, visit);
  };
  visit(scope);
  return found;
}

// The top-level `const` bindings of a function body.
function functionConsts(fn) {
  const consts = new Map();
  for (const statement of fn.body.statements) {
    if (!ts.isVariableStatement(statement) || (statement.declarationList.flags & ts.NodeFlags.Const) === 0) continue;
    for (const declaration of statement.declarationList.declarations) {
      if (ts.isIdentifier(declaration.name) && declaration.initializer) consts.set(declaration.name.text, declaration);
    }
  }
  return consts;
}

function literalKeyText(name) {
  if (ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNumericLiteral(name)) return name.text;
  return null;
}

function unwrapFrozen(expression) {
  let node = unwrapTransparent(expression);
  if (
    ts.isCallExpression(node) &&
    node.arguments.length === 1 &&
    ts.isPropertyAccessExpression(node.expression) &&
    node.expression.getText() === 'Object.freeze'
  ) {
    node = unwrapTransparent(node.arguments[0]);
  }
  return node;
}

function isEmptyObjectInitializer(expression) {
  const node = unwrapFrozen(expression);
  return ts.isObjectLiteralExpression(node) && node.properties.length === 0;
}

function isReturnedBy(node, fn) {
  let value = node;
  while (value.parent && (ts.isParenthesizedExpression(value.parent) || ts.isAsExpression(value.parent))) {
    value = value.parent;
  }
  return ts.isReturnStatement(value.parent) && value.parent.expression === value && nearestFunctionOf(value.parent) === fn;
}

// H1: the default-exported component function.
function hostComponentFunction(host, refuse) {
  const defaults = host.statements.filter(
    (statement) =>
      (ts.isExportAssignment(statement) && !statement.isExportEquals) ||
      (ts.isFunctionDeclaration(statement) &&
        (statement.modifiers ?? []).some((modifier) => modifier.kind === ts.SyntaxKind.DefaultKeyword)),
  );
  if (defaults.length !== 1) return refuse('H1', `the host has ${defaults.length} default exports, not 1`);
  const [exported] = defaults;
  if (ts.isFunctionDeclaration(exported)) return exported.body ? exported : refuse('H1', 'the default export has no body');
  if (!ts.isIdentifier(exported.expression)) return refuse('H1', 'the default export is not a binding');

  const name = exported.expression.text;
  const declarations = localRebinds(host, name);
  if (declarations.length !== 1 || !ts.isVariableDeclaration(declarations[0])) {
    return refuse('H1', `'${name}' is bound ${declarations.length} times, not as one const`);
  }
  const [declaration] = declarations;
  if (
    !ts.isVariableStatement(declaration.parent.parent) ||
    declaration.parent.parent.parent !== host ||
    (declaration.parent.flags & ts.NodeFlags.Const) === 0
  ) {
    return refuse('H1', `'${name}' is not a top-level const`);
  }
  const call = unwrapTransparent(declaration.initializer);
  if (!ts.isCallExpression(call)) return refuse('H1', `'${name}' is not a forwardRef call`);
  const callee = call.expression;
  const viaNamed =
    ts.isIdentifier(callee) &&
    callee.text === 'forwardRef' &&
    importOf(host, 'forwardRef').specifier === 'react' &&
    importOf(host, 'forwardRef').kind === 'named';
  const viaDefault =
    ts.isPropertyAccessExpression(callee) &&
    ts.isIdentifier(callee.expression) &&
    callee.name.text === 'forwardRef' &&
    importOf(host, callee.expression.text).specifier === 'react' &&
    importOf(host, callee.expression.text).kind === 'default';
  if (!viaNamed && !viaDefault) return refuse('H1', `'${name}' is not React's forwardRef`);
  const fn = call.arguments.length === 1 ? unwrapTransparent(call.arguments[0]) : null;
  if (!fn || !(ts.isArrowFunction(fn) || ts.isFunctionExpression(fn)) || !ts.isBlock(fn.body)) {
    return refuse('H1', `'${name}' does not wrap one block-bodied render function`);
  }
  return fn;
}

// H1: every return is ONE intrinsic, non-void element.
function hostRoots(fn, refuse) {
  const roots = [];
  const returns = functionReturns(fn);
  if (returns.length === 0) refuse('H1', 'the render function never returns');
  for (const statement of returns) {
    if (!statement.expression) {
      refuse('H1', `return @ line ${lineOf(statement)} returns nothing`);
      continue;
    }
    let element = unwrapParens(statement.expression);
    if (ts.isJsxFragment(element)) {
      const children = element.children.filter((child) => !(ts.isJsxText(child) && child.containsOnlyTriviaWhiteSpaces));
      if (children.length !== 1) {
        refuse('H1', `return @ line ${lineOf(statement)} is a fragment with ${children.length} children, not 1`);
        continue;
      }
      [element] = children;
    }
    const opening = ts.isJsxElement(element) ? element.openingElement : ts.isJsxSelfClosingElement(element) ? element : null;
    if (!opening || classifyTag(opening).kind !== 'intrinsic' || localPartWrapperOf(opening)) {
      refuse('H1', `return @ line ${lineOf(statement)} is not one intrinsic element`);
      continue;
    }
    roots.push(opening);
  }
  return roots;
}

// H3 (and the data-part half of H4-T1): the destructured props.
function hostPropBindings(fn, refuse) {
  const [props] = fn.parameters;
  if (!props || !ts.isIdentifier(props.name)) {
    refuse('H3', 'the render function has no `props` parameter');
    return { style: null, dataPart: null, className: null, classNameDeclaration: null, declarations: new Set() };
  }
  const patterns = fn.body.statements.flatMap((statement) =>
    ts.isVariableStatement(statement)
      ? statement.declarationList.declarations.filter(
          (declaration) =>
            ts.isObjectBindingPattern(declaration.name) &&
            declaration.initializer &&
            ts.isIdentifier(declaration.initializer) &&
            declaration.initializer.text === props.name.text,
        )
      : [],
  );
  if (patterns.length !== 1) {
    refuse('H3', `props are destructured ${patterns.length} times, not once`);
    return { style: null, dataPart: null, className: null, classNameDeclaration: null, declarations: new Set() };
  }
  const named = (key) =>
    patterns[0].name.elements.find(
      (element) =>
        !element.dotDotDotToken &&
        literalKeyText(element.propertyName ?? element.name) === key &&
        ts.isIdentifier(element.name),
    )?.name ?? null;
  const style = named('style');
  const dataPart = named('data-part');
  const className = named('className');
  const bindings = {
    style: style?.text ?? null,
    dataPart: dataPart?.text ?? null,
    className: className?.text ?? null,
    classNameDeclaration: className,
    declarations: new Set([style, dataPart].filter(Boolean)),
  };
  if (!bindings.style) refuse('H3', '`style` is not destructured out of props');
  if (!bindings.dataPart) refuse('H4-T1', '`data-part` is not destructured out of props');
  return bindings;
}

// H4-T0: the part source, through named re-exports only.
function provePartSource(entry, host, refuse) {
  const { fn, module } = entry.partSource;
  const imported = importOf(host, fn);
  if (imported.error) return refuse('H4-T0', imported.error);
  if (imported.kind !== 'named') return refuse('H4-T0', `'${fn}' is not a named import`);
  if (localRebinds(host, fn).length > 0) return refuse('H4-T0', `'${fn}' is re-bound in the host`);

  let resolved = resolveCoreModule(entry.module, imported.specifier);
  for (let hop = 0; hop < 8; hop += 1) {
    if (resolved.error) return refuse('H4-T0', resolved.error);
    const sourceFile = parseCoreFile(resolved.rel);
    const local = exportedFunction(sourceFile, fn);
    const reexports = sourceFile.statements.flatMap((statement) =>
      ts.isExportDeclaration(statement) && statement.moduleSpecifier && statement.exportClause && ts.isNamedExports(statement.exportClause)
        ? statement.exportClause.elements
            .filter((element) => element.name.text === fn)
            .map((element) => ({ element, specifier: statement.moduleSpecifier.text }))
        : [],
    );
    if (reexports.some(({ element }) => element.propertyName && element.propertyName.text !== fn)) {
      return refuse('H4-T0', `'${fn}' is a renamed re-export in ${resolved.rel}`);
    }
    if (local && reexports.length === 0) {
      if (resolved.rel !== module) return refuse('H4-T0', `'${fn}' is declared in ${resolved.rel}, not ${module}`);
      return partKeysOf(local, sourceFile, refuse);
    }
    if (local || reexports.length !== 1) {
      return refuse('H4-T0', `'${fn}' reaches ${resolved.rel} through ${reexports.length} named re-exports${local ? ' and a local declaration' : ''} (export * is not followed)`);
    }
    resolved = resolveCoreModule(resolved.rel, reexports[0].specifier);
  }
  return refuse('H4-T0', `'${fn}' re-exports more than 8 hops deep`);
}

function partKeysOf(fn, sourceFile, refuse) {
  const [part] = fn.parameters;
  if (!part || !ts.isIdentifier(part.name)) return refuse('H4-T0', 'the part source has no first parameter');
  const keys = new Set();
  const objectsOf = (expression, site) => {
    const node = unwrapParens(expression);
    if (ts.isConditionalExpression(node)) return objectsOf(node.whenTrue, site) && objectsOf(node.whenFalse, site);
    if (!ts.isObjectLiteralExpression(node)) return refuse('H4-T0', `the part source returns a non-literal @ ${site}`) ?? false;
    let carriesPart = false;
    for (const member of node.properties) {
      const key = ts.isPropertyAssignment(member) ? literalKeyText(member.name) : null;
      if (key === null) return refuse('H4-T0', `the part source returns a non-literal key @ ${site}`) ?? false;
      keys.add(key);
      if (key === 'data-part') {
        carriesPart = ts.isIdentifier(member.initializer) && member.initializer.text === part.name.text;
      }
    }
    if (!carriesPart) return refuse('H4-T0', `the part source's 'data-part' is not its first parameter @ ${site}`) ?? false;
    return true;
  };
  const returns = functionReturns(fn);
  if (returns.length === 0) return refuse('H4-T0', 'the part source never returns');
  for (const statement of returns) {
    if (!statement.expression || !objectsOf(statement.expression, shortSite(coreRelOf(sourceFile.fileName), statement))) {
      return null;
    }
  }
  return keys;
}

// `name` in `sourceFile` resolves to `export const name = '<literal>'` in `module`.
function constKeyValue(sourceFile, fromRel, name, module) {
  const importError = importResolvesTo(sourceFile, fromRel, name, module);
  if (importError) return { error: importError };
  const keys = parseCoreFile(module);
  const declarations = localRebinds(keys, name);
  const [declaration] = declarations;
  if (
    declarations.length !== 1 ||
    !ts.isVariableDeclaration(declaration) ||
    !ts.isVariableStatement(declaration.parent.parent) ||
    declaration.parent.parent.parent !== keys ||
    (declaration.parent.flags & ts.NodeFlags.Const) === 0 ||
    !(declaration.parent.parent.modifiers ?? []).some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword) ||
    !declaration.initializer ||
    !(ts.isStringLiteral(declaration.initializer) || ts.isNoSubstitutionTemplateLiteral(declaration.initializer))
  ) {
    return { error: `'${name}' is not one exported string-literal const in ${module}` };
  }
  return { value: declaration.initializer.text };
}

// T2/T2', T3: the producer's own writes and returns for one member. The clause
// family is H4 for the attribute side and H2 for the style side.
function proveProducerMember(spec, mode, channel, partKeys, refuse, facts) {
  const tag = mode === 'attrs' ? 'H4-T' : 'H2-T';
  const t2 = mode === 'attrs' ? 'H4-T2' : "H2-T2'";
  const { fn: fnName, module, member } = spec.producer;
  const producer = parseCoreFile(module);
  const fn = producer ? exportedFunction(producer, fnName) : null;
  if (!fn) return refuse(t2, `'${fnName}' is not one exported function in ${module}`);

  const local = functionConsts(fn).get(member);
  const initial = local ? unwrapTransparent(local.initializer) : null;
  if (!initial || !ts.isObjectLiteralExpression(initial) || initial.properties.length !== 0) {
    return refuse(t2, `'${member}' is not a const initialised to {} in '${fnName}'`);
  }

  if (mode === 'channels') {
    const prefix = spec.keyPrefix;
    if (prefix.startsWith(channel) || channel.startsWith(prefix)) {
      refuse(t2, `the key prefix '${prefix}' and the channel '${channel}' overlap`);
    }
    const keyError = importResolvesTo(producer, module, spec.keyFn.fn, spec.keyFn.module);
    if (keyError) refuse(t2, keyError);
    const keyFn = exportedFunction(parseCoreFile(spec.keyFn.module), spec.keyFn.fn);
    if (!keyFn) refuse(t2, `'${spec.keyFn.fn}' is not one exported function in ${spec.keyFn.module}`);
    else {
      const returns = functionReturns(keyFn);
      if (returns.length === 0) refuse(t2, `'${spec.keyFn.fn}' never returns`);
      for (const statement of returns) {
        const value = statement.expression ? unwrapParens(statement.expression) : null;
        const head = !value
          ? null
          : ts.isTemplateExpression(value)
            ? value.head.text
            : ts.isNoSubstitutionTemplateLiteral(value) || ts.isStringLiteral(value)
              ? value.text
              : null;
        if (head === null || !head.startsWith(prefix)) {
          refuse(t2, `'${spec.keyFn.fn}' returns a key outside '${prefix}' @ ${shortSite(spec.keyFn.module, statement)}`);
        }
      }
      facts.channelKeyPrefix = prefix;
    }
  }

  for (const reference of referencesIn(fn, member, local.name)) {
    const parent = reference.parent;
    const site = shortSite(module, reference);
    if (ts.isElementAccessExpression(parent) && parent.expression === reference) {
      const write = parent.parent;
      if (!ts.isBinaryExpression(write) || write.operatorToken.kind !== ts.SyntaxKind.EqualsToken || write.left !== parent) {
        refuse(t2, `${member} escapes at ${site} (${ts.SyntaxKind[write.kind]})`);
        continue;
      }
      const key = parent.argumentExpression;
      if (mode === 'attrs') {
        const resolved = ts.isStringLiteral(key)
          ? { value: key.text }
          : ts.isIdentifier(key)
            ? constKeyValue(producer, module, key.text, spec.keyConsts.module)
            : { error: `the key ${key.getText()} is neither a string literal nor an imported const` };
        if (resolved.error) refuse(t2, `attrs[${key.getText()}] @ ${site}: ${resolved.error}`);
        else if (partKeys.has(resolved.value)) refuse(t2, `attrs key '${resolved.value}' @ ${site} is a part key`);
        else facts.attrsKeys.push(resolved.value);
      } else if (
        !ts.isCallExpression(key) ||
        !ts.isIdentifier(key.expression) ||
        key.expression.text !== spec.keyFn.fn
      ) {
        refuse(t2, `channels[${key.getText()}] @ ${site} is not keyed by '${spec.keyFn.fn}'`);
      }
      continue;
    }
    // T2(b): `attrs` only as the shorthand member, `channels` only as
    // `channels: channels` with an optional type assertion — each side exactly
    // as ruled, and no other wrapper (a `||`/`??` operand is not the local).
    const shorthand = mode === 'attrs' && ts.isShorthandPropertyAssignment(parent) && parent.name === reference;
    let value = reference;
    while (
      value.parent &&
      (ts.isAsExpression(value.parent) || ts.isSatisfiesExpression(value.parent) || ts.isParenthesizedExpression(value.parent)) &&
      value.parent.expression === value
    ) {
      value = value.parent;
    }
    const named =
      mode === 'channels' &&
      ts.isPropertyAssignment(value.parent) &&
      value.parent.initializer === value &&
      literalKeyText(value.parent.name) === member;
    const holder = shorthand ? parent.parent : named ? value.parent.parent : null;
    if (holder && ts.isObjectLiteralExpression(holder) && isReturnedBy(holder, fn)) continue;
    refuse(t2, `${member} escapes at ${site} (${ts.SyntaxKind[parent.kind]})`);
  }

  // T3: what the producer hands back.
  for (const statement of functionReturns(fn)) {
    const site = shortSite(module, statement);
    const value = statement.expression ? unwrapTransparent(statement.expression) : null;
    if (value && ts.isObjectLiteralExpression(value)) {
      if (value.properties.some((property) => ts.isSpreadAssignment(property))) {
        refuse(`${tag}3`, `the return @ ${site} spreads into its projection`);
        continue;
      }
      const members = value.properties.filter((property) => property.name && literalKeyText(property.name) === member);
      const handsBack =
        members.length === 1 &&
        (mode === 'attrs'
          ? ts.isShorthandPropertyAssignment(members[0])
          : ts.isPropertyAssignment(members[0]) &&
            ts.isIdentifier(unwrapTransparent(members[0].initializer)) &&
            unwrapTransparent(members[0].initializer).text === member);
      if (!handsBack) refuse(`${tag}3`, `the return @ ${site} does not hand back the local '${member}'`);
      continue;
    }
    if (value && ts.isIdentifier(value)) {
      const declarations = localRebinds(producer, value.text);
      const [declaration] = declarations;
      const shape =
        declarations.length === 1 &&
        ts.isVariableDeclaration(declaration) &&
        declaration.parent.parent.parent === producer &&
        (declaration.parent.flags & ts.NodeFlags.Const) !== 0 &&
        declaration.initializer
          ? unwrapFrozen(declaration.initializer)
          : null;
      const empty =
        shape &&
        ts.isObjectLiteralExpression(shape) &&
        shape.properties.length === 2 &&
        ['attrs', 'channels'].every((key) =>
          shape.properties.some(
            (property) =>
              ts.isPropertyAssignment(property) &&
              literalKeyText(property.name) === key &&
              isEmptyObjectInitializer(property.initializer),
          ),
        );
      const onlyReturned = referencesIn(producer, value.text, declaration?.name).every((reference) => isReturnedBy(reference, fn));
      if (!empty || !onlyReturned) refuse(`${tag}3`, `the return @ ${site} is not the empty projection`);
      continue;
    }
    refuse(`${tag}3`, `the return @ ${site} is neither the projection literal nor the empty projection`);
  }
  return true;
}

// The one proof. Every clause is evaluated and every refusal collected, so a
// drill reports the exact clause set its mutant breaks.
function proveStyleHost(entry, channel) {
  const refusals = [];
  const refuse = (clause, message) => {
    refusals.push(`${clause}: ${message}`);
    return null;
  };
  const facts = {
    rootTags: [],
    partKeys: [],
    attrsKeys: [],
    channelKeyPrefix: null,
    classNameForwarded: false,
    classRefusals: [],
  };
  const done = () => ({ refusals: [...new Set(refusals)], facts });

  const host = parseCoreFile(entry.module);
  if (!host) {
    refuse('H1', `the host module ${entry.module} is missing`);
    return done();
  }
  const fn = hostComponentFunction(host, refuse);
  if (!fn) return done();
  const roots = hostRoots(fn, refuse);
  // H1 is the precondition of every other clause: they are asked of a PROVEN
  // root set, and an unproven one would only multiply its own refusal.
  if (refusals.length > 0) return done();
  facts.rootTags = [...new Set(roots.map((root) => root.tagName.text))];
  const bindings = hostPropBindings(fn, refuse);
  const consts = functionConsts(fn);
  const partKeys = provePartSource(entry, host, refuse);
  facts.partKeys = partKeys ? [...partKeys].sort() : [];
  const keysForPart = partKeys ?? new Set(['data-part']);

  const admittedSpreads = new Set();
  const admittedReferences = new Set();
  const policed = new Map([
    [bindings.style, 'H2'],
    [bindings.dataPart, 'H4-T1'],
  ]);
  const proven = new Map();
  const proveTrailing = (spec, mode) => {
    const key = `${mode}:${spec.producer.module}:${spec.producer.fn}`;
    if (!proven.has(key)) proven.set(key, proveProducerMember(spec, mode, channel, keysForPart, refuse, facts));
  };

  for (const root of roots) {
    const site = `root <${root.tagName.text}> @ line ${lineOf(root)}`;
    const attributes = root.attributes.properties;

    // H2 — the caller style, and nothing after it that may set the channel.
    const styles = attributes.filter((attribute) => ts.isJsxAttribute(attribute) && attribute.name.getText() === 'style');
    if (styles.length !== 1) refuse('H2', `${site} carries ${styles.length} style attributes, not 1`);
    else {
      const at = attributes.indexOf(styles[0]);
      if (attributes.slice(at + 1).some((attribute) => ts.isJsxSpreadAttribute(attribute))) {
        refuse('H2', `${site} spreads after its style attribute`);
      }
      const object = styles[0].initializer?.expression ? unwrapTransparent(styles[0].initializer.expression) : null;
      if (!object || !ts.isObjectLiteralExpression(object)) refuse('H2', `${site} style is not an object literal`);
      else {
        const afterStyle = (members, where) => {
          for (const member of members) {
            if (ts.isSpreadAssignment(member)) {
              const text = member.expression.getText();
              const spec = entry.trailingSpreads?.[text];
              if (!spec) {
                refuse('H2', `'...${text}' after the caller style in ${where} is neither a literal key nor a proven trailing spread`);
                continue;
              }
              admittedSpreads.add(member);
              proveTrailing(spec, 'channels');
              continue;
            }
            const key =
              (ts.isPropertyAssignment(member) || ts.isShorthandPropertyAssignment(member)) && literalKeyText(member.name);
            if (!key) refuse('H2', `a non-literal member after the caller style in ${where}`);
            else if (key === channel) refuse('H2', `'${key}' after the caller style in ${where} sets the channel`);
          }
        };
        const reaching = [];
        object.properties.forEach((member, index) => {
          if (!ts.isSpreadAssignment(member) || !ts.isIdentifier(member.expression)) return;
          const name = member.expression.text;
          if (name === bindings.style) {
            reaching.push(index);
            admittedReferences.add(member.expression);
            return;
          }
          const chain = consts.get(name);
          const inner = chain ? unwrapTransparent(chain.initializer) : null;
          if (!inner || !ts.isObjectLiteralExpression(inner)) return;
          const spreads = inner.properties.filter(
            (property) => ts.isSpreadAssignment(property) && ts.isIdentifier(property.expression) && property.expression.text === bindings.style,
          );
          if (spreads.length !== 1) return;
          reaching.push(index);
          policed.set(name, 'H2');
          admittedReferences.add(member.expression);
          admittedReferences.add(spreads[0].expression);
          afterStyle(inner.properties.slice(inner.properties.indexOf(spreads[0]) + 1), `'${name}'`);
        });
        if (reaching.length !== 1) refuse('H2', `${site} style reaches the caller style ${reaching.length} times, not once`);
        else afterStyle(object.properties.slice(reaching[0] + 1), `${site} style`);
      }
    }

    // H4-T1 — the caller part, and nothing after it that may set a part key.
    const carriers = attributes.filter((attribute) => {
      if (!ts.isJsxSpreadAttribute(attribute) || !ts.isIdentifier(attribute.expression)) return false;
      const carrier = consts.get(attribute.expression.text);
      const object = carrier ? unwrapTransparent(carrier.initializer) : null;
      return (
        object &&
        ts.isObjectLiteralExpression(object) &&
        object.properties.some(
          (member) =>
            ts.isSpreadAssignment(member) &&
            ts.isCallExpression(member.expression) &&
            ts.isIdentifier(member.expression.expression) &&
            member.expression.expression.text === entry.partSource.fn,
        )
      );
    });
    if (carriers.length !== 1) {
      refuse('H4-T1', `${site} receives the part through ${carriers.length} const spreads, not 1`);
      continue;
    }
    const carrier = carriers[0];
    policed.set(carrier.expression.text, 'H4-T1');
    admittedReferences.add(carrier.expression);
    const object = unwrapTransparent(consts.get(carrier.expression.text).initializer);
    const parts = object.properties.filter(
      (member) =>
        ts.isSpreadAssignment(member) &&
        ts.isCallExpression(member.expression) &&
        ts.isIdentifier(member.expression.expression) &&
        member.expression.expression.text === entry.partSource.fn,
    );
    if (parts.length !== 1) refuse('H4-T1', `'${carrier.expression.text}' spreads ${entry.partSource.fn} ${parts.length} times, not once`);
    else {
      // R-a (P-88, DT ruling 2026-10-11): the host stamps its OWN literal part. The caller's `data-part` is
      // destructured out (H3 above) and, having no admitted reference, any read of it is refused by the
      // reference law below: the caller's part can never land.
      const [first] = parts[0].expression.arguments;
      const stampsOwnPart = first && ts.isStringLiteral(first);
      if (!stampsOwnPart) {
        refuse('H4-T1', `${entry.partSource.fn}(…) in '${carrier.expression.text}' does not stamp the host's own literal part`);
      } else facts.ownPart = first.text;
      for (const member of object.properties.slice(object.properties.indexOf(parts[0]) + 1)) {
        if (ts.isSpreadAssignment(member)) {
          const text = member.expression.getText();
          const spec = entry.trailingPartSpreads?.[text];
          if (!spec) {
            refuse('H4-T1', `'...${text}' after the part in '${carrier.expression.text}' is neither a literal key nor a proven trailing spread`);
            continue;
          }
          admittedSpreads.add(member);
          proveTrailing(spec, 'attrs');
          continue;
        }
        const key =
          (ts.isPropertyAssignment(member) || ts.isShorthandPropertyAssignment(member)) && literalKeyText(member.name);
        if (!key) refuse('H4-T1', `a non-literal member after the part in '${carrier.expression.text}'`);
        else if (keysForPart.has(key)) refuse('H4-T1', `'${key}' after the part in '${carrier.expression.text}' sets a part key`);
      }
    }
    for (const attribute of attributes.slice(attributes.indexOf(carrier) + 1)) {
      if (ts.isJsxSpreadAttribute(attribute)) refuse('H4-T1', `${site} spreads after the part`);
      else if (keysForPart.has(attribute.name.getText())) refuse('H4-T1', `${site} sets '${attribute.name.getText()}' after the part`);
    }
  }

  // The fail-closed reference law: the caller bindings and the consts the proof
  // walked are read ONLY where the proof read them.
  for (const [name, clause] of policed) {
    if (!name) continue;
    for (const reference of referencesIn(fn, name, consts.get(name)?.name)) {
      // The destructuring site that DECLARES a caller binding is not a read.
      if (admittedReferences.has(reference) || bindings.declarations.has(reference)) continue;
      refuse(clause, `'${name}' is referenced outside the proven chain @ line ${lineOf(reference)}`);
    }
  }

  // T4 — how the host consumes each producer binding.
  const trailing = [
    ...Object.entries(entry.trailingSpreads ?? {}).map(([text, spec]) => [text, spec, 'H2-T4']),
    ...Object.entries(entry.trailingPartSpreads ?? {}).map(([text, spec]) => [text, spec, 'H4-T4']),
  ];
  for (const [text, spec, clause] of trailing) {
    const [binding] = text.split('.');
    const declaration = consts.get(binding);
    const call = declaration ? unwrapTransparent(declaration.initializer) : null;
    if (!call || !ts.isCallExpression(call) || !ts.isIdentifier(call.expression) || call.expression.text !== spec.producer.fn) {
      refuse(clause, `'${binding}' is not a const initialised by '${spec.producer.fn}'`);
      continue;
    }
    const importError = importResolvesTo(host, entry.module, spec.producer.fn, spec.producer.module);
    if (importError) refuse(clause, importError);
    for (const reference of referencesIn(fn, binding, declaration.name)) {
      const access = reference.parent;
      const member = ts.isPropertyAccessExpression(access) && access.expression === reference ? access.name.text : null;
      const admitted = member !== null && ts.isSpreadAssignment(access.parent) && admittedSpreads.has(access.parent);
      if (admitted) continue;
      const owns = member === null || text.endsWith(`.${member}`) || !trailing.some(([other]) => other.endsWith(`.${member}`));
      if (owns) refuse(clause, `'${binding}' is used outside its admitted spreads @ line ${lineOf(reference)} (${ts.SyntaxKind[access.kind]})`);
    }
  }

  // H6 (EVI-02 S2) — the caller's static className reaches each root, re-proven
  // like H4: `className` destructured out of props; ONE same-function const
  // `<recipe>.resolve(<selection>, { <slot>: <className> }).<slot>` where
  // `<recipe>` is a top-level const built by classSource.fn imported from
  // classSource.module; exactly one `className={<that const>}` on each root with
  // no spread after it; the binding and the const read ONLY there. A failure is
  // recorded apart from the admission: the style/part model stands, and the
  // admitted host simply carries NO static className, so a class hop on it fails
  // closed rather than the part form being revoked.
  const classRefuse = (message) => {
    facts.classRefusals.push(`H6: ${message}`);
    return null;
  };
  const classProof = (() => {
    const source = entry.classSource;
    if (!source) return classRefuse('the table entry names no classSource');
    if (!bindings.className) return classRefuse('`className` is not destructured out of props');
    const carriers = new Set();
    for (const root of roots) {
      const attributes = root.attributes.properties;
      const named = attributes.filter((attribute) => ts.isJsxAttribute(attribute) && attribute.name.getText() === 'className');
      if (named.length !== 1) return classRefuse(`root <${root.tagName.text}> @ line ${lineOf(root)} carries ${named.length} className attributes, not 1`);
      if (attributes.slice(attributes.indexOf(named[0]) + 1).some((attribute) => ts.isJsxSpreadAttribute(attribute))) {
        return classRefuse(`root <${root.tagName.text}> @ line ${lineOf(root)} spreads after its className`);
      }
      const value = named[0].initializer && ts.isJsxExpression(named[0].initializer) ? named[0].initializer.expression : null;
      if (!value || !ts.isIdentifier(value) || !consts.has(value.text)) {
        return classRefuse(`root <${root.tagName.text}> @ line ${lineOf(root)} className is not a same-function const`);
      }
      carriers.add(value.text);
    }
    if (carriers.size !== 1) return classRefuse(`the roots read ${carriers.size} className consts, not 1`);
    const [carrier] = carriers;
    const read = unwrapTransparent(consts.get(carrier).initializer);
    const call = ts.isPropertyAccessExpression(read) && read.name.text === source.slot ? unwrapTransparent(read.expression) : null;
    const resolve =
      call && ts.isCallExpression(call) && ts.isPropertyAccessExpression(call.expression) && call.expression.name.text === 'resolve'
        ? call.expression
        : null;
    if (!resolve || call.arguments.length !== 2 || !ts.isIdentifier(resolve.expression)) {
      return classRefuse(`'${carrier}' is not <recipe>.resolve(<selection>, <extras>).${source.slot}`);
    }
    const extras = unwrapTransparent(call.arguments[1]);
    const slotMember = ts.isObjectLiteralExpression(extras) && extras.properties.length === 1 ? extras.properties[0] : null;
    const fed =
      slotMember &&
      ts.isPropertyAssignment(slotMember) &&
      literalKeyText(slotMember.name) === source.slot &&
      ts.isIdentifier(slotMember.initializer) &&
      slotMember.initializer.text === bindings.className;
    if (!fed) return classRefuse(`the recipe '${source.slot}' slot of '${carrier}' is not fed by the caller '${bindings.className}' alone`);

    const recipe = resolve.expression.text;
    const declarations = localRebinds(host, recipe);
    const [declaration] = declarations;
    const built =
      declarations.length === 1 &&
      ts.isVariableDeclaration(declaration) &&
      declaration.parent.parent.parent === host &&
      (declaration.parent.flags & ts.NodeFlags.Const) !== 0 &&
      declaration.initializer &&
      ts.isCallExpression(unwrapTransparent(declaration.initializer)) &&
      ts.isIdentifier(unwrapTransparent(declaration.initializer).expression) &&
      unwrapTransparent(declaration.initializer).expression.text === source.fn;
    if (!built) return classRefuse(`'${recipe}' is not one top-level const built by '${source.fn}'`);
    const importError = importResolvesTo(host, entry.module, source.fn, source.module);
    if (importError) return classRefuse(importError);

    for (const reference of referencesIn(fn, bindings.className, bindings.classNameDeclaration)) {
      if (reference !== slotMember.initializer) {
        return classRefuse(`'${bindings.className}' is referenced outside the recipe slot @ line ${lineOf(reference)}`);
      }
    }
    for (const reference of referencesIn(fn, carrier, consts.get(carrier).name)) {
      const attribute = reference.parent?.parent;
      if (!(ts.isJsxExpression(reference.parent) && attribute && ts.isJsxAttribute(attribute) && roots.includes(attribute.parent.parent))) {
        return classRefuse(`'${carrier}' is referenced outside the root className attributes @ line ${lineOf(reference)}`);
      }
    }
    return true;
  })();
  facts.classNameForwarded = classProof === true;

  facts.attrsKeys = [...new Set(facts.attrsKeys)].sort();
  return done();
}

// A2 + the proof, for one owner element. Null when the owner is not a table host.
function styleHostAdmission(owner, channel) {
  const tag = owner.tagName;
  if (!ts.isIdentifier(tag) || localPartWrapperOf(owner)) return null;
  const entry = STYLE_HOSTS.find((host) => host.name === tag.text);
  if (!entry) return null;

  const sourceFile = owner.getSourceFile();
  const imported = importOf(sourceFile, tag.text);
  let a2 = null;
  if (imported.error) a2 = imported.error;
  else if (imported.kind !== 'default') a2 = `'${tag.text}' is not the host's default import`;
  else {
    const resolved = resolveCoreModule(coreRelOf(sourceFile.fileName), imported.specifier);
    if (resolved.error) a2 = resolved.error;
    else if (resolved.rel !== entry.module) a2 = `'${tag.text}' resolves to ${resolved.rel}, not ${entry.module}`;
  }
  const rebinds = localRebinds(sourceFile, tag.text);
  if (!a2 && rebinds.length > 0) a2 = `'${tag.text}' is re-bound locally @ line ${lineOf(rebinds[0])}`;
  if (a2) return { admitted: false, refusals: [`A2: ${a2}`], facts: null };

  const proof = proveStyleHost(entry, channel);
  return { admitted: proof.refusals.length === 0, refusals: proof.refusals, facts: proof.facts };
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
function renderPathViolation(owner, admission = null) {
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
  //
  // The one exception is a STYLE_HOSTS admission, re-proven this run from the
  // host's own source (A4): the owner is then modelled as its root intrinsic
  // element(s). A table host that fails its proof keeps the opacity verdict and
  // names the failed clauses, so a refusal is never silent.
  const ownerTag = classifyTag(owner);
  if (ownerTag.kind === 'opaque' && admission?.admitted !== true) {
    const refused = admission ? ` (STYLE_HOSTS refused: ${admission.refusals.join('; ')})` : '';
    return `the producer is a style prop of '${ownerTag.label}', which may not apply it to DOM${refused}`;
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
  return judgeEachProducerOwner(text, path, channel, datum, (owner, admission) => {
    const violation = renderPathViolation(owner, admission);
    return violation ? [violation] : [];
  });
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
function physicalPathStep(opening, admission = null) {
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
  //
  // An ADMITTED style host (A4) is the one opaque element this clause may see
  // through, and only when it is the producer's own element: it is modelled as
  // its root intrinsic tag(s), carrying NO caller part (H4-T1: the host stamps
  // its own) and the class tokens it is proven to forward (H6).
  const classified = classifyTag(opening);
  const admitted = classified.kind === 'opaque' && admission?.admitted === true;
  if (classified.kind === 'opaque' && !admitted) {
    return { part: null, opaque: true, label: classified.label, className: null };
  }

  // Everything below is a real DOM element authored in this file. Its part may
  // be unknown, but its existence and its arity are not: exactly one node is
  // emitted here. That is what a descendant combinator is allowed to step over,
  // and it is why only the opaque branch above is refused.
  //
  // S2: the element's static className rides along for the class-hop co-stamp.
  // It is the call-site literal, and for a component it counts only when that
  // component is PROVEN to hand it to its DOM element: an admitted host through
  // H6, a local part wrapper through `wrapperForwardsClassName`. Otherwise null.
  const wrapper = localPartWrapperOf(opening);
  const forwards = admitted ? admission.facts.classNameForwarded === true : wrapper ? wrapper.classNameForwarded : true;
  const className = forwards ? staticClassNameLiteral(opening) : null;
  const tag = { text: admitted ? admission.facts.rootTags.join('|') : opening.tagName.text };
  // R-b: the admitted host stamps its OWN part; the step carries no caller part, only the class tokens the
  // host is proven to forward. A caller `data-part` on an admitted host never lands, so it names nothing.
  if (admitted) {
    const host = hostOwnerIdentity(opening, admission);
    if (host.callerPart) return { part: null, opaque: false, label: `<${tag.text}: a caller data-part on an admitted host>`, className: null };
    return { part: null, opaque: false, label: `<${tag.text}: admitted host>`, className, host: true, hostClassTokens: host.tokens };
  }
  const dataPart = literalDataPart(opening);
  if (dataPart.count > 1) {
    return { part: null, opaque: false, label: `<${tag.text}: ${dataPart.count} data-part attributes>`, className };
  }
  if (dataPart.count === 1 && dataPart.value === null) {
    return { part: null, opaque: false, label: `<${tag.text}: non-literal data-part>`, className };
  }
  if (dataPart.count === 1) return { part: dataPart.value, opaque: false, label: dataPart.value, className };
  return { part: null, opaque: false, label: `<${tag.text}: no data-part>`, className };
}

function ownerPhysicalJsxPath(owner, admission = null) {
  const steps = [];

  for (let node = ts.isJsxOpeningElement(owner) ? owner.parent : owner; node; node = node.parent) {
    let opening = null;
    if (ts.isJsxSelfClosingElement(node)) opening = node;
    else if (ts.isJsxElement(node)) opening = node.openingElement;
    if (!opening) continue;
    // The admission rides with the OWNER's own node and nothing else (H5).
    steps.push(physicalPathStep(opening, opening === owner ? admission : null));
  }

  return steps;
}

function producerSelectorPathViolations(text, path, channel, datum, selector) {
  return judgeEachProducerOwner(text, path, channel, datum, (owner, admission) =>
    ownerSelectorPathViolations(owner, selector, admission),
  );
}

function ownerSelectorPathViolations(owner, selector, admission = null) {
  const outward = ownerPhysicalJsxPath(owner, admission).reverse();
  const violations = [];
  let cursor = -1;

  const steps = selectorSteps(selector);
  for (const step of steps) {
    let found = -1;
    for (let index = cursor + 1; index < outward.length; index += 1) {
      // R-b, the one new arm: a CLASS hop is also satisfied by an ADMITTED HOST step carrying the exact class
      // token. A part hop never is, and no other element is ever matched by its class alone.
      const hostHop = step.via === 'class' && (outward[index].hostClassTokens ?? []).includes(step.className);
      if (outward[index].part === step.part || hostHop) {
        found = index;
        break;
      }
    }

    if (found === -1) {
      // An admitted host that does not carry the exact token is the TAIL class hop's landing, named as such:
      // the same co-stamp message, never a match.
      const tail = step === steps.at(-1) && step.via === 'class';
      const host = tail && outward.at(-1)?.host === true && cursor < outward.length - 1 ? outward.at(-1) : undefined;
      violations.push(
        host
          ? `selector class '.${step.className}' lands on '${host.label}', which carries no static className '${step.className}'`
          : `selector part '${step.part}' is absent from the live physical path`,
      );
      return violations;
    }

    // S2, the co-stamp (the G2 rule): a CLASS hop is satisfied only by an element
    // carrying the part AND the exact class token as a static literal. A part
    // match without the literal class is a violation, never a name-only match.
    if (step.via === 'class' && !(outward[found].className ?? '').split(/\s+/).includes(step.className)) {
      violations.push(
        `selector class '.${step.className}' lands on '${outward[found].label}', which carries no static className '${step.className}'`,
      );
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
// The loading branch of a family that adopted `AnatomySkeleton` stamps the
// family's OWN anatomy a second time, so that the renderer can measure it and
// paint one bone per part. That ghost copy is inert markup handed to the
// renderer — it hosts no producer and is not the chain these mutants splice
// into — so it is excluded by its enclosing `<AnatomySkeleton>` rather than by
// any textual tell. The uniqueness alarm still guards everything outside it.
function insideAnatomySkeleton(node) {
  for (let current = node.parent; current; current = current.parent) {
    if (!ts.isJsxElement(current)) continue;
    const tag = current.openingElement.tagName;
    if (ts.isIdentifier(tag) && tag.text === 'AnatomySkeleton') return true;
  }
  return false;
}

function uniqueElementWithPart(text, path, part) {
  const sourceFile = parseTsx(text, path);
  const found = [];

  const visit = (node) => {
    let opening = null;
    if (ts.isJsxSelfClosingElement(node)) opening = node;
    else if (ts.isJsxElement(node)) opening = node.openingElement;
    if (opening && !insideAnatomySkeleton(node)) {
      const dataPart = literalDataPart(opening);
      if (dataPart.count === 1 && dataPart.value === part) found.push(node);
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);

  assert.equal(
    found.length,
    1,
    `exactly one JSX element outside the skeleton source must carry data-part="${part}"`,
  );
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

  // The admitted hoisted-alias literals are style objects too: a paint written
  // into the alias reaches the DOM exactly as one written in `style={…}` does.
  for (const { object } of styleObjectRecords(sourceFile)) {
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
  " > [data-part='grid'] [data-part='day-cell'] .ds-pattern-calendar-view__event";
const KANBAN_ACCENT_SELECTOR =
  ".ds-pattern-kanban-board.ds-engine-modern[data-part='root']" +
  " > [data-part='board'] > [data-part='column'] > [data-part='column-header']";

// The element the sink SELECTS, and therefore the only element the producer may
// sit on. These are pinned literals like the selectors above, not values read
// off the file under test; each channel test additionally proves its part is the
// tail of its selector, so the placement expectation and the sink expectation
// are provably about one element rather than two hopeful constants.
const CALENDAR_ACCENT_PART = 'event';
// R-c: the admitted-host owner (the interactive chip) is named by this exact owner class token and no part.
const CALENDAR_ACCENT_HOST_CLASS = 'ds-pattern-calendar-view__event';
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

// EVI-02 S2 (the H-EV §3 class-hop amendment). A hop is spelled EITHER
// `[data-part='p']` OR the owner element class `.<ownerBlock>__p`. The owner
// block is DERIVED from the selector's head — the first class of its first
// compound (`ds-pattern-calendar-view`) — never read from a free-form list, so a
// class of ANOTHER block (`.ds-other__event`) is not a hop at all: it stays
// opaque text and names no part. The class is matched as a WHOLE token: the part
// runs to the end of the `[\w-]` run and must then be followed by the end of the
// selector or one of `[ : . whitespace > + ~ ,`, so `__event-extra` is the part
// `event-extra`, never `event`, and a token followed by anything else (`)` of a
// functional pseudo-class, `#`) is not a hop either.
function selectorOwnerBlock(selector) {
  const head = selector.trimStart().split(/[\s>+~,]/)[0];
  return head.match(/\.(-?[_a-zA-Z][\w-]*)/)?.[1] ?? null;
}

function selectorHopPattern(selector) {
  const block = selectorOwnerBlock(selector);
  const parts = SELECTOR_PART_PATTERN.source;
  if (block === null) return new RegExp(parts, 'g');
  const escaped = block.replace(/[.*+?^${}()|[\]\\-]/g, '\\$&');
  return new RegExp(`${parts}|\\.(${escaped}__([\\w-]+))(?=$|[\\[:.\\s>+~,])`, 'g');
}

// The pinned selector read as an ordered list of parts, each carrying the
// combinator that precedes it: `>` is a CHILD hop, anything else a descendant
// hop. This reads the pinned CONSTANT, never a source file — the ancestry
// contract itself is an exact array comparison and never a text match.
//
// Each step records `{ part, child, via: 'part' | 'class', className? }`. Two
// hops in ONE compound (no whitespace or combinator between them) are one
// element: the same part spelled both ways is one step that must satisfy the
// stricter class form; two different parts on one element name no part at all.
function selectorSteps(selector) {
  const steps = [];
  let previousEnd = null;

  for (const match of selector.matchAll(selectorHopPattern(selector))) {
    const gap = previousEnd === null ? null : selector.slice(previousEnd, match.index);
    const hop =
      match[1] !== undefined
        ? { part: match[1], via: 'part' }
        : { part: match[3], via: 'class', className: match[2] };
    previousEnd = match.index + match[0].length;

    if (gap !== null && !/[\s>+~,]/.test(gap)) {
      const previous = steps.at(-1);
      if (previous.part !== hop.part) {
        previous.part = `<${previous.part} & ${hop.part}: two parts on one element>`;
      } else if (hop.via === 'class') {
        previous.via = 'class';
        previous.className = hop.className;
      }
      continue;
    }
    steps.push({ ...hop, child: gap === null ? null : gap.includes('>') });
  }

  return steps;
}

// C — the tail of the pinned sink selector is the accent part, by EITHER form.
function selectorTailIsPart(selector, part) {
  const block = selectorOwnerBlock(selector);
  const spelled =
    selector.endsWith(`[data-part='${part}']`) || (block !== null && selector.endsWith(`.${block}__${part}`));
  return spelled && selectorSteps(selector).at(-1)?.part === part;
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

const CALENDAR_PRODUCER_LITERAL = "{ '--ds-calendar-view-entry-accent': ev.color } as React.CSSProperties";

test('visualization skin Calendar Modern crosses the event accent only through a scoped custom property', () => {
  const path = pathFor(FILES.calendarModern);
  const text = source(FILES.calendarModern);

  assert.equal(
    countChannelProducers(text, path, CALENDAR_CHANNEL, 'ev'),
    1,
    'the Modern calendar must publish the event accent exactly once',
  );

  // HOLD-2: since the hoisted alias, the one publication has TWO owners, so
  // every owner-level message below is one finding per owner, prefixed by it.
  // The owner lines are read ONCE from the gate's own owner record on the
  // unmutated fixture — never typed — and the prefix is spelled HERE, by a
  // test-side template, not by the gate's formatter: a drift in either reds.
  const [calendarOwners, ...extraProducers] = channelProducerOwners(text, path, CALENDAR_CHANNEL, 'ev');
  assert.equal(extraProducers.length, 0, 'the calendar owner record must describe exactly one producer');
  assert.deepEqual(
    calendarOwners.map(({ tag }) => tag),
    ['EventChip', 'ModernButton'],
    'the calendar producer owners must be exactly the read-only chip and the interactive chip, in source order',
  );
  const ownerLine = Object.fromEntries(calendarOwners.map(({ tag, line }) => [tag, line]));
  assert.notEqual(ownerLine.EventChip, ownerLine.ModernButton, 'the two owners must sit on distinct lines');
  const perOwner = (message) => [
    `owner <EventChip> @ line ${ownerLine.EventChip}: ${message}`,
    `owner <ModernButton> @ line ${ownerLine.ModernButton}: ${message}`,
  ];
  const assertPerOwner = (actual, message, why) => {
    assert.equal(actual.length, 2, `${why} — exactly one finding per owner, never vacuous`);
    assert.deepEqual(actual, perOwner(message), why);
  };
  assert.ok(
    selectorTailIsPart(CALENDAR_ACCENT_SELECTOR, CALENDAR_ACCENT_PART),
    'the pinned part must be the tail of the pinned sink selector, by either form',
  );
  assert.ok(
    CALENDAR_ACCENT_SELECTOR.endsWith(` .${CALENDAR_ACCENT_HOST_CLASS}`),
    'the pinned host class must be the exact tail token of the pinned sink selector',
  );
  assert.deepEqual(
    producerPlacementViolations(text, path, CALENDAR_CHANNEL, 'ev', CALENDAR_ACCENT_PART, CALENDAR_ACCENT_HOST_CLASS),
    [],
    'the Modern calendar must publish the accent ON the event chip the skin selects',
  );
  assert.deepEqual(
    selectorAncestryDisagreements(CALENDAR_ACCENT_SELECTOR, CALENDAR_ACCENT_ANCESTRY),
    [],
    'the pinned ancestry and the pinned sink selector must describe one element',
  );
  assert.deepEqual(
    producerAncestryViolations(text, path, CALENDAR_CHANNEL, 'ev', CALENDAR_ACCENT_ANCESTRY, CALENDAR_ACCENT_HOST_CLASS),
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

  const cssPath = join(cssRoot, 'modern/skin/pattern-calendar-view/index.css');
  const css = readFileSync(cssPath, 'utf8');
  const sinks = collectSinks(css, cssPath, CALENDAR_CHANNEL);
  // Two sinks, both on the chip: the fill, and (7abe19e52) the chip's own ink,
  // contrast-color() of that same accent under @supports.
  assert.equal(sinks.length, 2, 'the Modern calendar skin must consume the event accent as the chip fill and its ink, nothing else');
  const fill = sinks.filter((sink) => cssTrim(sink.prop) === 'background');
  const ink = sinks.filter((sink) => cssTrim(sink.prop) === 'color');
  assert.equal(fill.length, 1, 'the event accent must land as the chip fill exactly once');
  assert.equal(
    cssTrim(fill[0].value),
    'var(--ds-calendar-view-entry-accent, var(--ds-color-primary))',
    'the event accent sink lost its exact primary fallback',
  );
  assert.equal(ink.length, 1, 'the chip ink must read its own accent exactly once');
  assert.equal(
    cssTrim(ink[0].value),
    'contrast-color(var(--ds-calendar-view-entry-accent, var(--ds-color-primary)))',
    'the chip ink must be contrast-color() of the same accent, with the same primary fallback',
  );
  for (const sink of sinks) {
    assert.deepEqual(
      scopeViolations(sink, CALENDAR_ACCENT_SELECTOR),
      [],
      'every event accent sink must carry exactly the canonical Modern calendar selector',
    );
  }

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
      producerPlacementViolations(moved, path, CALENDAR_CHANNEL, 'ev', CALENDAR_ACCENT_PART, CALENDAR_ACCENT_HOST_CLASS),
      [violation],
      `the placement clause must reject a producer ${site}`,
    );
    assert.equal(
      producerAncestryViolations(moved, path, CALENDAR_CHANNEL, 'ev', CALENDAR_ACCENT_ANCESTRY, CALENDAR_ACCENT_HOST_CLASS).length,
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
      CALENDAR_ACCENT_HOST_CLASS,
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
    producerPlacementViolations(orphanedProducer, path, CALENDAR_CHANNEL, 'ev', CALENDAR_ACCENT_PART, CALENDAR_ACCENT_HOST_CLASS),
    [],
    'the disconnected owner carries the sink part exactly — the v3 clause stays green',
  );
  assert.deepEqual(
    producerAncestryViolations(orphanedProducer, path, CALENDAR_CHANNEL, 'ev', CALENDAR_ACCENT_ANCESTRY, CALENDAR_ACCENT_HOST_CLASS),
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
    `                      const dead = <div data-part="${CALENDAR_ACCENT_PART}" className="ds-pattern-calendar-view__event" style={${CALENDAR_PRODUCER_LITERAL}} />;\n` +
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
    producerPlacementViolations(deadInChain, path, CALENDAR_CHANNEL, 'ev', CALENDAR_ACCENT_PART, CALENDAR_ACCENT_HOST_CLASS),
    [],
    'the dead producer carries the sink part exactly — the v3 clause stays green',
  );
  assert.deepEqual(
    producerAncestryViolations(deadInChain, path, CALENDAR_CHANNEL, 'ev', CALENDAR_ACCENT_ANCESTRY, CALENDAR_ACCENT_HOST_CLASS),
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
    producerPlacementViolations(wrappedGrid, path, CALENDAR_CHANNEL, 'ev', CALENDAR_ACCENT_PART, CALENDAR_ACCENT_HOST_CLASS),
    [],
    'the wrapper leaves the owner part exactly as it was — the v3 clause stays green',
  );
  assert.deepEqual(
    producerAncestryViolations(wrappedGrid, path, CALENDAR_CHANNEL, 'ev', CALENDAR_ACCENT_ANCESTRY, CALENDAR_ACCENT_HOST_CLASS),
    [],
    'an unlabelled wrapper is invisible to the named ancestry — the v4 clause stays green',
  );
  assert.deepEqual(
    producerRenderPathViolations(wrappedGrid, path, CALENDAR_CHANNEL, 'ev'),
    [],
    'the wrapped chip is still returned into the rendered tree — the render path stays green',
  );
  assertPerOwner(
    producerSelectorPathViolations(wrappedGrid, path, CALENDAR_CHANNEL, 'ev', CALENDAR_ACCENT_SELECTOR),
    "selector spells 'root' > 'grid' but the live DOM inserts '<div: no data-part>'",
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
    `                      return <div data-part="${CALENDAR_ACCENT_PART}" className="ds-pattern-calendar-view__event" style={${CALENDAR_PRODUCER_LITERAL}} />;\n` +
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
    producerPlacementViolations(thisArgProducer, path, CALENDAR_CHANNEL, 'ev', CALENDAR_ACCENT_PART, CALENDAR_ACCENT_HOST_CLASS),
    [],
    'the thisArg producer carries the sink part exactly — the v3 clause stays green',
  );
  assert.deepEqual(
    producerAncestryViolations(thisArgProducer, path, CALENDAR_CHANNEL, 'ev', CALENDAR_ACCENT_ANCESTRY, CALENDAR_ACCENT_HOST_CLASS),
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
    producerPlacementViolations(opaqueHop, path, CALENDAR_CHANNEL, 'ev', CALENDAR_ACCENT_PART, CALENDAR_ACCENT_HOST_CLASS),
    [],
    'the opaque component leaves the owner part exactly as it was — the v3 clause stays green',
  );
  assert.deepEqual(
    producerAncestryViolations(opaqueHop, path, CALENDAR_CHANNEL, 'ev', CALENDAR_ACCENT_ANCESTRY, CALENDAR_ACCENT_HOST_CLASS),
    [],
    'a component claims no part, so the named ancestry is byte-identical — the v4 clause stays green',
  );
  assertPerOwner(
    producerRenderPathViolations(opaqueHop, path, CALENDAR_CHANNEL, 'ev'),
    "render path crosses '<DropChildren: component, DOM unknown>', which may not render its children",
    'the day cell is inside a component that renders null — the render path must reject it too',
  );
  assertPerOwner(
    producerSelectorPathViolations(opaqueHop, path, CALENDAR_CHANNEL, 'ev', CALENDAR_ACCENT_SELECTOR),
    "selector hops 'grid' to 'day-cell' across '<DropChildren: component, DOM unknown>'," +
      ' whose emitted DOM this file cannot see',
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
    producerPlacementViolations(rootOpaque, path, CALENDAR_CHANNEL, 'ev', CALENDAR_ACCENT_PART, CALENDAR_ACCENT_HOST_CLASS),
    [],
    'the root-opaque component leaves the owner part exactly as it was — the v3 clause stays green',
  );
  assert.deepEqual(
    producerAncestryViolations(rootOpaque, path, CALENDAR_CHANNEL, 'ev', CALENDAR_ACCENT_ANCESTRY, CALENDAR_ACCENT_HOST_CLASS),
    [],
    'a component claims no part, so the named ancestry is byte-identical — the v4 clause stays green',
  );
  assert.deepEqual(
    producerSelectorPathViolations(rootOpaque, path, CALENDAR_CHANNEL, 'ev', CALENDAR_ACCENT_SELECTOR),
    [],
    'the component sits ABOVE the selector head, which that clause has never examined — it stays green',
  );
  assertPerOwner(
    producerRenderPathViolations(rootOpaque, path, CALENDAR_CHANNEL, 'ev'),
    "render path crosses '<DropChildren: component, DOM unknown>', which may not render its children",
    'ONLY the render-path clause may reject the root-opaque component, and it must name it',
  );

  // Class J — the OWNER COMPONENT, new in v7c, and the mutant that exists
  // because the v7 audit proved a branch can be WRITTEN, be REACHABLE, and still
  // be untested. v7 added an owner check to `renderPathViolation` and shipped no
  // mutant that entered it: probe M5 deleted the branch outright and the focal
  // suite stayed 10/10. A clause no test can kill is not a gate, it is a comment
  // that happens to compile — the same defect class this file exists to find,
  // one level up. This is the missing canary reproduced by independent review.
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
    producerPlacementViolations(ownerComponent, path, CALENDAR_CHANNEL, 'ev', CALENDAR_ACCENT_PART, CALENDAR_ACCENT_HOST_CLASS),
    [],
    'the owner component carries the sink part exactly — the v3 clause reads the attribute, not the tag',
  );
  assert.deepEqual(
    producerAncestryViolations(ownerComponent, path, CALENDAR_CHANNEL, 'ev', CALENDAR_ACCENT_ANCESTRY, CALENDAR_ACCENT_HOST_CLASS),
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
    producerPlacementViolations(rootVoid, path, CALENDAR_CHANNEL, 'ev', CALENDAR_ACCENT_PART, CALENDAR_ACCENT_HOST_CLASS),
    [],
    'the void wrapper leaves the owner part exactly as it was — the v3 clause stays green',
  );
  assert.deepEqual(
    producerAncestryViolations(rootVoid, path, CALENDAR_CHANNEL, 'ev', CALENDAR_ACCENT_ANCESTRY, CALENDAR_ACCENT_HOST_CLASS),
    [],
    'a void element claims no part, so the named ancestry is byte-identical — the v4 clause stays green',
  );
  assert.deepEqual(
    producerSelectorPathViolations(rootVoid, path, CALENDAR_CHANNEL, 'ev', CALENDAR_ACCENT_SELECTOR),
    [],
    'the physical clause keeps the void element as KNOWN DOM above the selector head — never as a component whose DOM is unknown',
  );
  assertPerOwner(
    producerRenderPathViolations(rootVoid, path, CALENDAR_CHANNEL, 'ev'),
    "render path crosses '<input: void element, renders no children>'," +
      ' which the TSX parser accepts but no DOM ever mounts',
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
  assertPerOwner(
    producerSelectorPathViolations(wrappedGridVoid, path, CALENDAR_CHANNEL, 'ev', CALENDAR_ACCENT_SELECTOR),
    "selector spells 'root' > 'grid' but the live DOM inserts '<input: no data-part>'",
    'the physical clause names a void element by its OWN tag as inserted DOM — never as a component whose DOM it cannot see',
  );
  assertPerOwner(
    producerRenderPathViolations(wrappedGridVoid, path, CALENDAR_CHANNEL, 'ev'),
    "render path crosses '<input: void element, renders no children>'," +
      ' which the TSX parser accepts but no DOM ever mounts',
    'the render path reports the one fact that separates this from the Class F div — and it is the only clause that may',
  );

  // The unscoped alternative: one declaration, both retired `includes` still
  // true, and the channel leaking onto every `.ds-leak` in the document.
  const leakedSinks = collectSinks(
    withLeakedSelectorAlternative(css, fill[0].parent),
    cssPath,
    CALENDAR_CHANNEL,
  );
  const leaked = leakedSinks.filter((sink) => cssTrim(sink.prop) === 'background');
  assert.equal(leakedSinks.length, 2, 'widening the fill rule adds no sink');
  assert.equal(leaked.length, 1, 'the leaked alternative rides the SAME single fill declaration');
  const leakedSelector = normalizeSelector(leaked[0].parent.selector);
  assert.ok(
    leakedSelector.includes(".ds-pattern-calendar-view.ds-engine-modern[data-part='root']") &&
      leakedSelector.includes('.ds-pattern-calendar-view__event'),
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

// The live hoisted alias, located as an AST fact: exactly one alias in the file
// carries the channel, or the drills below no longer describe the source.
function liveChannelAlias(text, path, channel, datum) {
  const carrying = hoistedStyleAliases(parseTsx(text, path)).filter((alias) =>
    alias.literals.some((object) => object.properties.some((property) => isChannelProducer(property, channel, datum))),
  );
  assert.equal(carrying.length, 1, 'exactly one hoisted alias must carry the channel');
  return carrying[0];
}

// The JSX attribute `name={<alias>}` on the owner with the given tag.
function aliasAttributeOn(alias, tag, name) {
  const owner = alias.owners.find((element) => element.tagName.getText() === tag);
  assert.ok(owner, `the alias must have a <${tag}> owner`);
  const found = owner.attributes.properties.filter(
    (attribute) => ts.isJsxAttribute(attribute) && ts.isIdentifier(attribute.name) && attribute.name.text === name,
  );
  assert.equal(found.length, 1, `<${tag}> must carry exactly one ${name} attribute`);
  return found[0];
}

function spliceNode(text, node, replacement) {
  return `${text.slice(0, node.getStart())}${replacement}${text.slice(node.getEnd())}`;
}

test('visualization skin Calendar Modern follows the hoisted conditional accent alias to each exclusive owner', () => {
  const path = pathFor(FILES.calendarModern);
  const text = source(FILES.calendarModern);
  const alias = liveChannelAlias(text, path, CALENDAR_CHANNEL, 'ev');

  // The live shape, measured: one literal, two branch owners, both the sink's part.
  assert.deepEqual(alias.refusals, [], 'the live alias must be admitted');
  assert.equal(
    countChannelProducers(text, path, CALENDAR_CHANNEL, 'ev'),
    1,
    'the hoisted alias is ONE publication, however many branches receive it',
  );
  assert.deepEqual(
    channelProducerOwners(text, path, CALENDAR_CHANNEL, 'ev').map((owners) =>
      owners.map(({ tag, part, className }) => ({ tag, part, className })),
    ),
    [
      [
        { tag: 'EventChip', part: CALENDAR_ACCENT_PART, className: CALENDAR_ACCENT_HOST_CLASS },
        { tag: 'ModernButton', part: null, className: CALENDAR_ACCENT_HOST_CLASS },
      ],
    ],
    'the owners are the read-only chip (the sink part AND the class) and the interactive chip (the class alone, no part)',
  );
  assert.deepEqual(
    producerPlacementViolations(text, path, CALENDAR_CHANNEL, 'ev', CALENDAR_ACCENT_PART, CALENDAR_ACCENT_HOST_CLASS),
    [],
    'BOTH owners must be the element the sink selects: the chip by its part, the admitted host by its exact class',
  );
  assert.deepEqual(
    producerAncestryViolations(text, path, CALENDAR_CHANNEL, 'ev', CALENDAR_ACCENT_ANCESTRY, CALENDAR_ACCENT_HOST_CLASS),
    [],
    'BOTH owners must sit inside the live grid',
  );
  // The read-only branch is proven end to end. The interactive branch is judged
  // by the same clauses and reported under its own owner prefix — whatever those
  // clauses say of it is asserted by the calendar channel test above, never here.
  const readOnlyBranch = (violations) => violations.filter((violation) => violation.startsWith('owner <EventChip>'));
  assert.deepEqual(
    readOnlyBranch(producerRenderPathViolations(text, path, CALENDAR_CHANNEL, 'ev')),
    [],
    'the read-only chip must be RETURNED into the rendered tree',
  );
  assert.deepEqual(
    readOnlyBranch(
      producerSelectorPathViolations(text, path, CALENDAR_CHANNEL, 'ev', CALENDAR_ACCENT_SELECTOR),
    ),
    [],
    'the live DOM path down to the read-only chip must satisfy the sink selector hop for hop',
  );

  // M1 — BOTH arms literal: two publications, never one.
  const undefinedArm = [
    unwrapTransparent(alias.declaration.initializer).whenTrue,
    unwrapTransparent(alias.declaration.initializer).whenFalse,
  ].filter((arm) => isUndefinedIdentifier(unwrapTransparent(arm)));
  assert.equal(undefinedArm.length, 1, 'the live alias must carry exactly one undefined arm');
  const bothArms = spliceNode(text, undefinedArm[0], `(${CALENDAR_PRODUCER_LITERAL})`);
  assert.deepEqual(tsxSyntaxDiagnostics(bothArms, path), [], 'the both-arms mutant must be real TSX');
  assert.equal(
    countChannelProducers(bothArms, path, CALENDAR_CHANNEL, 'ev'),
    2,
    'a conditional whose BOTH arms carry the channel is two producers',
  );
  assert.deepEqual(
    channelAliasRefusals(bothArms, path, CALENDAR_CHANNEL, 'ev'),
    [],
    'the both-arms alias is still admitted — it is the COUNT that rejects it',
  );
  assert.deepEqual(
    producerPlacementViolations(bothArms, path, CALENDAR_CHANNEL, 'ev', CALENDAR_ACCENT_PART, CALENDAR_ACCENT_HOST_CLASS),
    ['the channel carries 2 producers, not 1'],
    'the owner clauses must refuse two producers before judging any owner',
  );

  // M2 — the alias ALSO used outside style: the interactive chip's `style` becomes
  // a `title`. The read-only spread is still legal, and the whole alias is refused.
  const outsideStyle = spliceNode(text, aliasAttributeOn(alias, 'ModernButton', 'style').name, 'title');
  assert.deepEqual(tsxSyntaxDiagnostics(outsideStyle, path), [], 'the outside-style mutant must be real TSX');
  const outsideRefusals = channelAliasRefusals(outsideStyle, path, CALENDAR_CHANNEL, 'ev');
  assert.equal(outsideRefusals.length, 1, 'exactly one refusal for one escaping reference');
  assert.match(
    outsideRefusals[0],
    /^the alias 'accent' is used outside a style position \(JsxExpression @ line \d+\)$/,
    'the refusal must name the alias and the escaping position',
  );
  assert.equal(
    countChannelProducers(outsideStyle, path, CALENDAR_CHANNEL, 'ev'),
    0,
    'an alias that escapes a style position is not a producer',
  );

  // M3 — a SECOND const alias: one binding hop is followed, never two.
  const statement = alias.declaration.parent.parent;
  const rebound = spliceNode(
    spliceNode(text, aliasAttributeOn(alias, 'ModernButton', 'style').initializer, '{chipAccent}'),
    statement,
    `${statement.getText()}\n                          const chipAccent = accent;`,
  );
  assert.deepEqual(tsxSyntaxDiagnostics(rebound, path), [], 'the second-alias mutant must be real TSX');
  const reboundRefusals = channelAliasRefusals(rebound, path, CALENDAR_CHANNEL, 'ev');
  assert.equal(reboundRefusals.length, 1, 'exactly one refusal for one re-binding');
  assert.match(
    reboundRefusals[0],
    /^the alias 'accent' is re-bound by const 'chipAccent' @ line \d+; only one const hop is followed$/,
    'the refusal must name the second binding',
  );
  assert.equal(
    countChannelProducers(rebound, path, CALENDAR_CHANNEL, 'ev'),
    0,
    'a second const alias is refused, so the publication reads as zero',
  );

  // M4 — a branch owner WITHOUT its identity. The admitted host is named by its exact class and carries no part
  // (R-c), so the interactive chip is unlabelled when it loses that class, mis-labelled when it carries another
  // block's hook, and refused BY NAME when it is handed the sink part (R-d: the part form on this owner is a
  // must-be-red negative). The count and the admission never move; placement names the owner by its branch.
  const hostClassAttribute = aliasAttributeOn(alias, 'ModernButton', 'className');
  for (const [name, mutant, reason] of [
    [
      'no class',
      spliceNode(text, hostClassAttribute, ''),
      /^owner <ModernButton> @ line \d+: the admitted host carries 0 static class hooks naming 'event', not 1$/,
    ],
    [
      "another block's hook",
      spliceNode(text, hostClassAttribute, 'className="ds-other__event"'),
      /^owner <ModernButton> @ line \d+: the admitted host is named by '\.ds-other__event', not '\.ds-pattern-calendar-view__event'$/,
    ],
    [
      'a longer token',
      spliceNode(text, hostClassAttribute, `className="${CALENDAR_ACCENT_HOST_CLASS}-extra"`),
      /^owner <ModernButton> @ line \d+: the admitted host carries 0 static class hooks naming 'event', not 1$/,
    ],
    [
      'a dynamic class',
      spliceNode(text, hostClassAttribute, 'className={eventClassName}'),
      /^owner <ModernButton> @ line \d+: the admitted host carries 0 static class hooks naming 'event', not 1$/,
    ],
    [
      'the sink part handed to the host',
      spliceNode(text, hostClassAttribute, `${hostClassAttribute.getText()} data-part="${CALENDAR_ACCENT_PART}"`),
      /^owner <ModernButton> @ line \d+: the producer element carries 1 data-part attributes, not 0: an admitted host stamps its own part and a caller part never lands$/,
    ],
    [
      'the sink part instead of the class',
      spliceNode(text, hostClassAttribute, `data-part="${CALENDAR_ACCENT_PART}"`),
      /^owner <ModernButton> @ line \d+: the producer element carries 1 data-part attributes, not 0: an admitted host stamps its own part and a caller part never lands$/,
    ],
  ]) {
    assert.deepEqual(tsxSyntaxDiagnostics(mutant, path), [], `M4 (${name}): the mutant must be real TSX`);
    assert.equal(countChannelProducers(mutant, path, CALENDAR_CHANNEL, 'ev'), 1, `M4 (${name}): the publication count stays at one`);
    assert.deepEqual(channelAliasRefusals(mutant, path, CALENDAR_CHANNEL, 'ev'), [], `M4 (${name}): and the alias admitted`);
    const placement = producerPlacementViolations(
      mutant,
      path,
      CALENDAR_CHANNEL,
      'ev',
      CALENDAR_ACCENT_PART,
      CALENDAR_ACCENT_HOST_CLASS,
    );
    assert.equal(placement.length, 1, `M4 (${name}): exactly one owner fails placement`);
    assert.match(placement[0], reason, `M4 (${name}): placement must name the interactive branch owner, not the other one`);
    const ancestry = producerAncestryViolations(mutant, path, CALENDAR_CHANNEL, 'ev', CALENDAR_ACCENT_ANCESTRY, CALENDAR_ACCENT_HOST_CLASS);
    assert.equal(ancestry.length, 1, `M4 (${name}): exactly one owner fails the ancestry`);
    assert.match(
      ancestry[0],
      /^owner <ModernButton> @ line \d+: the producer ancestry is <admitted host: [^>]+> -> day-cell -> week-row -> grid -> root, not event -> day-cell -> week-row -> grid -> root$/,
      `M4 (${name}): the ancestry never names an unidentified host 'event'`,
    );
  }
  // The live interactive chip itself: no caller part at all.
  assert.equal(literalDataPart(alias.owners.find((owner) => owner.tagName.getText() === 'ModernButton')).count, 0, 'the live host carries no data-part');
});

// The STYLE_HOSTS drills build their mutants IN MEMORY: each edit is an exact,
// unique anchor in the real file (the uniqueness assertion is the drift alarm),
// handed to the proof through the injected reader. No file on disk is touched.
const STYLE_HOST_FILES = {
  host: 'src/components/primitives/inputs/button/engines/modern/index.tsx',
  producer: 'src/infrastructure/runtime/responsive/viewport/style-properties/index.ts',
  keys: 'src/foundation/contracts/kernel/responsive/channels/index.ts',
  anatomy: 'src/foundation/behavior/kernel/anatomy/index.ts',
  barrel: 'src/foundation/behavior/index.ts',
};

function coreEdits(file, edits) {
  let text = readCoreFile(STYLE_HOST_FILES[file]);
  for (const [anchor, replacement] of edits) {
    assert.equal(text.split(anchor).length - 1, 1, `the drill anchor drifted in ${file}: ${anchor}`);
    text = text.replace(anchor, () => replacement);
  }
  return { [STYLE_HOST_FILES[file]]: text };
}

function refusedClauses(refusals) {
  return [...new Set(refusals.map((refusal) => refusal.slice(0, refusal.indexOf(':'))))].sort();
}

test('visualization skin Calendar Modern admits the ModernButton style host by proof only (STYLE_HOSTS drills)', () => {
  const path = pathFor(FILES.calendarModern);
  const text = source(FILES.calendarModern);
  const [host] = STYLE_HOSTS;
  assert.equal(STYLE_HOSTS.length, 1, 'the style-host table is closed at one reviewed entry');

  // G0 / D1 — the real files: admitted, with the proven facts named.
  const head = proveStyleHost(host, CALENDAR_CHANNEL);
  assert.deepEqual(head.refusals, [], 'the HEAD host must be admitted by proof');
  assert.deepEqual(
    head.facts,
    {
      rootTags: ['a', 'button'],
      partKeys: ['data-part', 'data-state'],
      attrsKeys: ['data-ds-responsive', 'data-ds-responsive-hard'],
      channelKeyPrefix: '--_ds-rsp-',
      classNameForwarded: true,
      classRefusals: [],
      ownPart: 'trigger',
    },
    'G0 must report the proven roots, part keys, attribute keys, channel key prefix, className forwarding (H6) and the own literal part (H4-T1)',
  );
  assert.deepEqual(
    producerRenderPathViolations(text, path, CALENDAR_CHANNEL, 'ev'),
    [],
    'D1: with the host admitted, both chips are rendered owners',
  );
  assert.deepEqual(
    producerSelectorPathViolations(text, path, CALENDAR_CHANNEL, 'ev', CALENDAR_ACCENT_SELECTOR),
    [],
    'D1: with the host admitted, both chips satisfy the sink selector hop for hop',
  );

  // R-a: the pinned line is the host stamping its OWN literal part; `CALLER_PART` is the destructured caller
  // binding the proof requires to have zero references.
  const P = "    ...partAttributes('trigger', interaction),\n";
  const CALLER_PART = "    'data-part': _callerDataPart,\n";
  const ATTRS_WRITE = "  if (tokens.length > 0) attrs[RESPONSIVE_CHANNEL_ATTRIBUTE] = tokens.join(' ');\n";
  const CHANNELS_WRITE = '      channels[responsiveChannelVariable(channel, breakpoint)] = value;\n';
  const PROJECTION = '  return { attrs, channels: channels as CSSProperties };';
  const drills = [
    // Attribute side (H4).
    ['A-1', coreEdits('producer', [[ATTRS_WRITE, `${ATTRS_WRITE}  attrs['data-part'] = 'x';\n`]]), ['H4-T2']],
    [
      'A-2',
      coreEdits('keys', [
        ["export const RESPONSIVE_CHANNEL_ATTRIBUTE = 'data-ds-responsive';", "export const RESPONSIVE_CHANNEL_ATTRIBUTE = 'data-part';"],
      ]),
      ['H4-T2'],
    ],
    ['A-3', coreEdits('producer', [[ATTRS_WRITE, `${ATTRS_WRITE}  attrs['data-state'] = 'x';\n`]]), ['H4-T2']],
    [
      'A-4',
      coreEdits('producer', [[ATTRS_WRITE, `${ATTRS_WRITE}  const someLocal = 'k';\n  attrs[someLocal] = 'x';\n`]]),
      ['H4-T2'],
    ],
    ['A-5 assign', coreEdits('producer', [[ATTRS_WRITE, `${ATTRS_WRITE}  Object.assign(attrs, extra);\n`]]), ['H4-T2']],
    ['A-5 alias', coreEdits('producer', [[ATTRS_WRITE, `${ATTRS_WRITE}  const a2 = attrs;\n`]]), ['H4-T2']],
    [
      'A-6',
      coreEdits('producer', [[PROJECTION, '  return { attrs: { ...attrs, ...more }, channels: channels as CSSProperties };']]),
      ['H4-T2', 'H4-T3'],
    ],
    [
      'A-7',
      coreEdits('producer', [
        ['  attrs: Object.freeze({}) as Record<string, string>,\n', "  attrs: Object.freeze({ 'data-part': 'x' }) as Record<string, string>,\n"],
      ]),
      ['H2-T3', 'H4-T3'],
    ],
    ['A-8', coreEdits('host', [[P, `${P}    'data-part': 'x',\n`]]), ['H4-T1']],
    ['A-9', coreEdits('host', [[P, `${P}    ...extraAttrs,\n`]]), ['H4-T1']],
    [
      'A-10 write',
      coreEdits('host', [
        [
          '  const responsive = generateResponsiveCSS(responsiveEntries);\n',
          "  const responsive = generateResponsiveCSS(responsiveEntries);\n  responsive.attrs['data-part'] = 'x';\n",
        ],
      ]),
      ['H4-T4'],
    ],
    [
      'A-10 escape',
      coreEdits('host', [
        [
          '  const responsive = generateResponsiveCSS(responsiveEntries);\n',
          '  const responsive = generateResponsiveCSS(responsiveEntries);\n  track(responsive);\n',
        ],
      ]),
      ['H2-T4', 'H4-T4'],
    ],
    [
      'A-11',
      coreEdits('host', [
        [
          'import {\n  generateResponsiveCSS,\n',
          "import { generateResponsiveCSS } from '@/foundation/contracts/kernel/responsive/channels';\nimport {\n",
        ],
      ]),
      ['H2-T4', 'H4-T4'],
    ],
    ['A-12', coreEdits('anatomy', [["    ? { 'data-part': part }\n", "    ? { 'data-part': 'trigger' }\n"]]), ['H4-T0']],
    [
      'A-13 export *',
      coreEdits('barrel', [
        ["export { serializeState, partAttributes } from './kernel/anatomy';", "export * from './kernel/anatomy';"],
      ]),
      ['H4-T0'],
    ],
    [
      'A-13 rename',
      coreEdits('barrel', [
        [
          "export { serializeState, partAttributes } from './kernel/anatomy';",
          "export { serializeState, anatomyPart as partAttributes } from './kernel/anatomy';",
        ],
      ]),
      ['H4-T0'],
    ],
    ['A-14', coreEdits('host', [['        aria-busy={busy}\n', '        aria-busy={busy}\n        data-state="x"\n']]), ['H4-T1']],
    // Non-over-refusal: both ADMIT.
    [
      'A-15',
      coreEdits('host', [
        ["    'data-variant': effectiveVariant,\n", ''],
        [P, `${P}    'data-variant': effectiveVariant,\n`],
      ]),
      [],
    ],
    [
      'A-16',
      {
        ...coreEdits('keys', [
          [
            "export const RESPONSIVE_CHANNEL_ATTRIBUTE = 'data-ds-responsive';\n",
            "export const RESPONSIVE_CHANNEL_ATTRIBUTE = 'data-ds-responsive';\nexport const RESPONSIVE_CHANNEL_EXTRA_ATTRIBUTE = 'data-ds-responsive-x';\n",
          ],
        ]),
        ...coreEdits('producer', [
          [
            '  RESPONSIVE_CHANNEL_PRIORITY_ATTRIBUTE,\n  isPriorityResponsiveChannel,\n',
            '  RESPONSIVE_CHANNEL_PRIORITY_ATTRIBUTE,\n  RESPONSIVE_CHANNEL_EXTRA_ATTRIBUTE,\n  isPriorityResponsiveChannel,\n',
          ],
          [ATTRS_WRITE, `${ATTRS_WRITE}  attrs[RESPONSIVE_CHANNEL_EXTRA_ATTRIBUTE] = 'x';\n`],
        ]),
      },
      [],
    ],
    // Style side (H2).
    [
      'S-1',
      coreEdits('producer', [[CHANNELS_WRITE, `${CHANNELS_WRITE}      channels['${CALENDAR_CHANNEL}'] = value;\n`]]),
      ["H2-T2'"],
    ],
    ['S-2', coreEdits('producer', [[CHANNELS_WRITE, `${CHANNELS_WRITE}      channels[otherFn(channel)] = value;\n`]]), ["H2-T2'"]],
    ['S-3', coreEdits('keys', [['return `--_ds-rsp-${', 'return `--ds-calendar-${']]), ["H2-T2'"]],
    [
      'S-4',
      coreEdits('producer', [
        [
          '  channels: Object.freeze({}) as CSSProperties,\n',
          `  channels: Object.freeze({ '${CALENDAR_CHANNEL}': 'x' }) as CSSProperties,\n`,
        ],
      ]),
      ['H2-T3', 'H4-T3'],
    ],
    ['S-5', coreEdits('producer', [[PROJECTION, '  return { attrs, channels: { ...channels, ...x } };']]), ["H2-T2'", 'H2-T3']],
    // HOLD-1 host drills.
    ['D2', coreEdits('host', [['  if (href && !isInert) {\n', "  if (pending === 'x') return <span />;\n  if (href && !isInert) {\n"]]), ['H2', 'H4-T1']],
    ['D3', coreEdits('host', [['    ...style,\n  } as React.CSSProperties;', '    ...style,\n    ...nativeButtonProps,\n  } as React.CSSProperties;']]), ['H2']],
    // D5 — the caller's part may never land (R-a). The admitted form is the pinned line itself (G0 above); each
    // shape that lets the caller's part through, or leaves it reachable, is refused.
    ['D5 caller part taken', coreEdits('host', [[P, "    ...partAttributes(_callerDataPart ?? 'trigger', interaction),\n"]]), ['H4-T1']],
    ['D5 caller part alone', coreEdits('host', [[P, '    ...partAttributes(_callerDataPart, interaction),\n']]), ['H4-T1']],
    ['D5 non-literal part', coreEdits('host', [[P, '    ...partAttributes(OWN_PART, interaction),\n']]), ['H4-T1']],
    ['D5 caller part read', coreEdits('host', [[P, `${P}    'data-caller': _callerDataPart,\n`]]), ['H4-T1']],
    ['D5 caller part not destructured', coreEdits('host', [[CALLER_PART, '']]), ['H4-T1']],
    ['D6', coreEdits('host', [['      </button>\n    </>', '      </button>\n      <span />\n    </>']]), ['H1']],
  ];

  for (const [name, overrides, expected] of drills) {
    const proof = withCoreFiles(overrides, () => proveStyleHost(host, CALENDAR_CHANNEL));
    assert.deepEqual(
      refusedClauses(proof.refusals),
      expected,
      `${name} must ${expected.length === 0 ? 'be ADMITTED' : `refuse by exactly ${expected.join(', ')}`}: ${proof.refusals.join(' | ')}`,
    );
    const rendered = withCoreFiles(overrides, () => producerRenderPathViolations(text, path, CALENDAR_CHANNEL, 'ev'));
    if (expected.length === 0) {
      assert.deepEqual(rendered, [], `${name}: an admitted host leaves both chips rendered`);
    } else {
      assert.equal(rendered.length, 1, `${name}: exactly the interactive chip falls back to opacity`);
      assert.ok(
        rendered[0].startsWith('owner <ModernButton> @ line ') &&
          rendered[0].includes("the producer is a style prop of '<ModernButton: component, DOM unknown>'") &&
          expected.every((clause) => rendered[0].includes(`${clause}:`)),
        `${name}: the refused host keeps the opacity red and names its clauses: ${rendered[0]}`,
      );
    }
  }
  // D5, each refusal by its own words (the clause alone would not tell the five shapes apart).
  for (const [name, reason] of [
    ['D5 caller part taken', /^H4-T1: partAttributes\(…\) in 'anatomyProps' does not stamp the host's own literal part$/],
    ['D5 caller part alone', /^H4-T1: partAttributes\(…\) in 'anatomyProps' does not stamp the host's own literal part$/],
    ['D5 non-literal part', /^H4-T1: partAttributes\(…\) in 'anatomyProps' does not stamp the host's own literal part$/],
    ['D5 caller part read', /^H4-T1: '_callerDataPart' is referenced outside the proven chain @ line \d+$/],
    ['D5 caller part not destructured', /^H4-T1: `data-part` is not destructured out of props$/],
  ]) {
    const proof = withCoreFiles(drills.find(([drill]) => drill === name)[1], () => proveStyleHost(host, CALENDAR_CHANNEL));
    assert.ok(
      proof.refusals.some((refusal) => reason.test(refusal)),
      `${name} must be refused in these words: ${proof.refusals.join(' | ')}`,
    );
  }
  assert.ok(
    withCoreFiles(drills.find(([name]) => name === 'A-16')[1], () => proveStyleHost(host, CALENDAR_CHANNEL)).facts.attrsKeys.includes(
      'data-ds-responsive-x',
    ),
    'A-16: a new non-part attribute const is admitted AND reported',
  );

  // The interactive chip, located on the live fixture.
  const alias = liveChannelAlias(text, path, CALENDAR_CHANNEL, 'ev');
  const button = alias.owners.find((owner) => owner.tagName.getText() === 'ModernButton');
  const buttonElement = button.parent;
  assert.ok(ts.isJsxElement(buttonElement), 'the interactive chip must have a closing tag');

  // D7 — a component NOT in the table keeps the opacity red as it always had.
  const other = spliceNode(spliceNode(text, buttonElement.closingElement.tagName, 'OtherButton'), button.tagName, 'OtherButton');
  const otherRender = producerRenderPathViolations(other, path, CALENDAR_CHANNEL, 'ev');
  assert.equal(otherRender.length, 1, 'D7: only the unlisted owner is refused');
  assert.match(
    otherRender[0],
    /^owner <OtherButton> @ line \d+: the producer is a style prop of '<OtherButton: component, DOM unknown>', which may not apply it to DOM$/,
    'D7: an unlisted component is opaque, with no STYLE_HOSTS clause in play',
  );

  // D8 — the right name from the wrong module, or re-bound locally: A2 refuses.
  const BUTTON_IMPORT = "import ModernButton from '../../../../../primitives/inputs/button/engines/modern';";
  assert.equal(text.split(BUTTON_IMPORT).length - 1, 1, 'the live host import drifted');
  for (const [variant, mutant, reason] of [
    [
      'another path',
      text.replace(BUTTON_IMPORT, () => BUTTON_IMPORT.replace('/engines/modern', '/engines/rustic')),
      /A2: 'ModernButton' resolves to src\/components\/primitives\/inputs\/button\/engines\/rustic\/index\.tsx, not /,
    ],
    ['a local shadow', `${text}\nfunction shadow() {\n  const ModernButton = null;\n  return ModernButton;\n}\n`, /A2: 'ModernButton' is re-bound locally @ line \d+/],
  ]) {
    const rendered = producerRenderPathViolations(mutant, path, CALENDAR_CHANNEL, 'ev');
    assert.equal(rendered.length, 1, `D8 (${variant}): only the interactive chip is refused`);
    assert.match(rendered[0], reason, `D8 (${variant}): A2 must name the refusal`);
  }

  // D9 — a component that renders null above the day cell is NOT masked: both
  // chips are still refused by the render path, each by the crossing.
  const opaqueDayCell = `${withWrapperElement(text, path, 'day-cell', 'DropChildren')}\nfunction DropChildren({ children }: { children?: React.ReactNode }) {\n  return null;\n}\n`;
  const opaqueRender = producerRenderPathViolations(opaqueDayCell, path, CALENDAR_CHANNEL, 'ev');
  assert.equal(opaqueRender.length, 2, 'D9: both owners are refused');
  assert.ok(
    opaqueRender.every((violation) => violation.endsWith("render path crosses '<DropChildren: component, DOM unknown>', which may not render its children")),
    'D9: the admission never masks an opaque crossing',
  );

  // D10 — ModernButton met as an INTERMEDIATE hop stays opaque (H5).
  const buttonHop = withWrapperElement(text, path, 'day-cell', 'ModernButton');
  const hopRender = producerRenderPathViolations(buttonHop, path, CALENDAR_CHANNEL, 'ev');
  const hopSelector = producerSelectorPathViolations(buttonHop, path, CALENDAR_CHANNEL, 'ev', CALENDAR_ACCENT_SELECTOR);
  assert.equal(hopRender.length, 2, 'D10: both owners are refused at the crossing');
  assert.ok(
    hopRender.every((violation) => violation.endsWith("render path crosses '<ModernButton: component, DOM unknown>', which may not render its children")),
    'D10: the admitted host is opaque as a hop',
  );
  assert.equal(hopSelector.length, 2, 'D10: the selector path refuses the hop for both owners');
  assert.ok(
    hopSelector.every((violation) =>
      violation.endsWith(
        "selector hops 'grid' to 'day-cell' across '<ModernButton: component, DOM unknown>', whose emitted DOM this file cannot see",
      ),
    ),
    'D10: the selector path names the opaque host hop',
  );
});

// S2 drills: static `className` literals spliced onto JSX elements located as AST
// facts, applied from the end of the text so earlier positions stay valid.
function withStaticClasses(text, stamps) {
  let out = text;
  for (const { opening, literal } of [...stamps].sort((a, b) => b.opening.tagName.getEnd() - a.opening.tagName.getEnd())) {
    const at = opening.tagName.getEnd();
    out = `${out.slice(0, at)} ${literal}${out.slice(at)}`;
  }
  return out;
}

test('visualization skin Calendar Modern reads a sink hop by part OR owner class, co-stamped per owner (S2 drills)', () => {
  const path = pathFor(FILES.calendarModern);
  const text = source(FILES.calendarModern);
  const BLOCK = 'ds-pattern-calendar-view';
  const EVENT_CLASS = `${BLOCK}__${CALENDAR_ACCENT_PART}`;
  const PART_TAIL = `[data-part='${CALENDAR_ACCENT_PART}']`;
  const CLASS_TAIL = `.${EVENT_CLASS}`;
  // Both forms are derived from the pinned constant, WHICHEVER form it spells (S3 moved it to the class form under
  // H3 (i)); exactly one accent tail form must end it.
  const liveTails = [PART_TAIL, CLASS_TAIL].filter((tail) => CALENDAR_ACCENT_SELECTOR.endsWith(tail));
  assert.equal(liveTails.length, 1, 'the pinned selector must end in exactly one accent tail form');
  assert.equal(selectorOwnerBlock(CALENDAR_ACCENT_SELECTOR), BLOCK, 'the owner block is derived from the selector head');
  const tailed = (tail) => `${CALENDAR_ACCENT_SELECTOR.slice(0, -liveTails[0].length)}${tail}`;
  const PART_FORM = tailed(PART_TAIL);
  const CLASS_FORM = tailed(CLASS_TAIL);

  // The co-stamp drills need chips WITHOUT the class literal. Since S3 the live chips carry it, so the drills run on a
  // BARE fixture: the live calendar with every className attribute on the two event emitters spliced out (AST
  // positions, from the end). The live fixture itself is held to the class form below (S2-5g).
  const liveAlias = liveChannelAlias(text, path, CALENDAR_CHANNEL, 'ev');
  const cuts = liveAlias.owners
    .flatMap((owner) => owner.attributes.properties)
    .filter((attribute) => ts.isJsxAttribute(attribute) && attribute.name.getText() === 'className')
    .map((attribute) => [attribute.getFullStart(), attribute.getEnd()])
    .sort((a, b) => b[0] - a[0]);
  const bare = cuts.reduce((out, [from, to]) => `${out.slice(0, from)}${out.slice(to)}`, text);

  // The owners and the elements a class may be stamped on, located on the BARE fixture.
  const alias = liveChannelAlias(bare, path, CALENDAR_CHANNEL, 'ev');
  assert.ok(
    alias.owners.every((owner) => staticClassNameLiteral(owner) === null),
    'the bare fixture carries no className on either event emitter',
  );
  const chip = alias.owners.find((owner) => owner.tagName.getText() === 'EventChip');
  const button = alias.owners.find((owner) => owner.tagName.getText() === 'ModernButton');
  const gridElement = uniqueElementWithPart(bare, path, 'grid').element;
  const grid = ts.isJsxElement(gridElement) ? gridElement.openingElement : gridElement;
  const stamp = (opening, className = EVENT_CLASS) => ({ opening, literal: `className="${className}"` });
  const [owners] = channelProducerOwners(bare, path, CALENDAR_CHANNEL, 'ev');
  const line = Object.fromEntries(owners.map(({ tag, line: at }) => [tag, at]));
  const onOwner = (tag, message) => `owner <${tag}> @ line ${line[tag]}: ${message}`;
  const missingClass = (label, className = EVENT_CLASS) =>
    `selector class '.${className}' lands on '${label}', which carries no static className '${className}'`;
  // R-b / R-d: the admitted host carries no part, so every PART-form assertion on it is a must-be-red negative,
  // by name; its class hop lands on the host step itself.
  const HOST = '<a|button: admitted host>';
  const noPart = (part = CALENDAR_ACCENT_PART) => `selector part '${part}' is absent from the live physical path`;
  const [liveOwners] = channelProducerOwners(text, path, CALENDAR_CHANNEL, 'ev');
  const liveLine = Object.fromEntries(liveOwners.map(({ tag, line: at }) => [tag, at]));
  const onLiveOwner = (tag, message) => `owner <${tag}> @ line ${liveLine[tag]}: ${message}`;
  assert.equal(EVENT_CLASS, CALENDAR_ACCENT_HOST_CLASS, 'the host class is the owner block hook of the accent part');

  // S2-1 — the PART form: all hops by part. The read-only chip satisfies it (its native part); the admitted host
  // must NOT (R-d): it carries no part, and no class is read by a part hop.
  assert.deepEqual(
    selectorSteps(PART_FORM),
    [
      { part: 'root', via: 'part', child: null },
      { part: 'grid', via: 'part', child: true },
      { part: 'day-cell', via: 'part', child: false },
      { part: 'event', via: 'part', child: false },
    ],
    'S2-1: the part form reads four part hops',
  );
  assert.ok(selectorTailIsPart(PART_FORM, CALENDAR_ACCENT_PART), 'S2-1: the part tail is the accent part');
  assert.deepEqual(selectorAncestryDisagreements(PART_FORM, CALENDAR_ACCENT_ANCESTRY), [], 'S2-1: ancestry agrees');
  assert.deepEqual(
    producerSelectorPathViolations(text, path, CALENDAR_CHANNEL, 'ev', PART_FORM),
    [onLiveOwner('ModernButton', noPart())],
    'S2-1: the live read-only chip satisfies the part form; the admitted host is red on it BY NAME',
  );

  // S2-2 — the CLASS form (the transformed constant): the same parts, the tail via class.
  for (const selector of [CLASS_FORM, `${CLASS_FORM}:hover`]) {
    const steps = selectorSteps(selector);
    assert.deepEqual(
      steps.at(-1),
      { part: 'event', via: 'class', className: EVENT_CLASS, child: false },
      `S2-2: the class tail is the event part via class (${selector})`,
    );
    assert.deepEqual(steps.map(({ part }) => part), ['root', 'grid', 'day-cell', 'event'], 'S2-2: the same four parts');
    assert.deepEqual(selectorAncestryDisagreements(selector, CALENDAR_ACCENT_ANCESTRY), [], 'S2-2: ancestry agrees');
  }
  assert.ok(selectorTailIsPart(CLASS_FORM, CALENDAR_ACCENT_PART), 'S2-2 / C: the class tail is the accent part');

  // S2-3 — a class of ANOTHER block is no hop: the ancestry outruns the selector.
  const OTHER = tailed('.ds-other__event');
  assert.deepEqual(selectorSteps(OTHER).map(({ part }) => part), ['root', 'grid', 'day-cell'], 'S2-3: no fourth hop');
  assert.deepEqual(
    selectorAncestryDisagreements(OTHER, CALENDAR_ACCENT_ANCESTRY),
    ['the ancestry continues past the selector tail with event'],
    'S2-3: an unknown block reds with the ancestry message',
  );
  assert.equal(selectorTailIsPart(OTHER, CALENDAR_ACCENT_PART), false, 'S2-3: and fails the tail check');

  // S2-4 — a shared prefix is a different, whole token; a token closed by `)` is no hop.
  const PREFIX = tailed(`.${EVENT_CLASS}-extra`);
  assert.equal(selectorSteps(PREFIX).at(-1).part, 'event-extra', 'S2-4: __event-extra is the part event-extra');
  assert.deepEqual(
    selectorAncestryDisagreements(PREFIX, CALENDAR_ACCENT_ANCESTRY),
    ["selector part 'event-extra' is absent from the ancestry"],
    'S2-4: the shared prefix is never event',
  );
  assert.equal(selectorTailIsPart(PREFIX, CALENDAR_ACCENT_PART), false, 'S2-4: and fails the tail check');
  const FUNCTIONAL = tailed(`:is(.${EVENT_CLASS})`);
  assert.deepEqual(selectorSteps(FUNCTIONAL).map(({ part }) => part), ['root', 'grid', 'day-cell'], 'S2-4: a token closed by ) is no hop');

  // S2-5 — the CO-STAMP, per owner.
  assert.deepEqual(
    producerSelectorPathViolations(bare, path, CALENDAR_CHANNEL, 'ev', CLASS_FORM),
    [onOwner('EventChip', missingClass('event')), onOwner('ModernButton', missingClass(HOST))],
    'S2-5a: no chip carries the class literal, so the class hop reds on BOTH owners',
  );
  const bothStamped = withStaticClasses(bare, [stamp(chip), stamp(button)]);
  assert.deepEqual(
    producerSelectorPathViolations(bothStamped, path, CALENDAR_CHANNEL, 'ev', CLASS_FORM),
    [],
    'S2-5b: both chips co-stamped -> the class form is green for both owners',
  );
  assert.deepEqual(
    producerSelectorPathViolations(bothStamped, path, CALENDAR_CHANNEL, 'ev', PART_FORM),
    [onOwner('ModernButton', noPart())],
    'S2-5b: and the part form stays green on the read-only chip, red BY NAME on the admitted host',
  );
  assert.deepEqual(
    producerSelectorPathViolations(withStaticClasses(bare, [stamp(button)]), path, CALENDAR_CHANNEL, 'ev', CLASS_FORM),
    [onOwner('EventChip', missingClass('event'))],
    'S2-5c: only the interactive chip co-stamped -> only the read-only owner reds',
  );
  assert.deepEqual(
    producerSelectorPathViolations(withStaticClasses(bare, [stamp(chip)]), path, CALENDAR_CHANNEL, 'ev', CLASS_FORM),
    [onOwner('ModernButton', missingClass(HOST))],
    'S2-5c: only the read-only chip co-stamped -> only the admitted host reds',
  );
  const unforwarded = coreEdits('host', [['    { root: className }\n', "    { root: 'fixed' }\n"]]);
  const hostProof = withCoreFiles(unforwarded, () => proveStyleHost(STYLE_HOSTS[0], CALENDAR_CHANNEL));
  assert.deepEqual(hostProof.refusals, [], 'S2-5d: a host that drops the caller className keeps its style/part admission');
  assert.equal(hostProof.facts.classNameForwarded, false, 'S2-5d: but forwards no className');
  assert.deepEqual(
    withCoreFiles(unforwarded, () => producerSelectorPathViolations(bothStamped, path, CALENDAR_CHANNEL, 'ev', CLASS_FORM)),
    [onOwner('ModernButton', missingClass(HOST))],
    'S2-5d: the call-site literal is not trusted past a host that drops it — the class hop fails closed on that owner',
  );
  assert.deepEqual(
    withCoreFiles(unforwarded, () =>
      producerSelectorPathViolations(bothStamped, path, CALENDAR_CHANNEL, 'ev', PART_FORM),
    ),
    [onOwner('ModernButton', noPart())],
    'S2-5d: and the part form is untouched by the className proof: green on the read-only chip, red BY NAME on the host',
  );
  assert.deepEqual(
    withCoreFiles(unforwarded, () =>
      producerPlacementViolations(bothStamped, path, CALENDAR_CHANNEL, 'ev', CALENDAR_ACCENT_PART, CALENDAR_ACCENT_HOST_CLASS),
    ),
    [onOwner('ModernButton', 'the admitted host is not proven to forward the caller className, so no class names it')],
    'S2-5d: nor does that literal identify the producer: placement fails closed on the host that drops it',
  );
  assert.deepEqual(
    withCoreFiles(unforwarded, () =>
      producerAncestryViolations(bothStamped, path, CALENDAR_CHANNEL, 'ev', CALENDAR_ACCENT_ANCESTRY, CALENDAR_ACCENT_HOST_CLASS),
    ),
    [
      onOwner(
        'ModernButton',
        `the producer ancestry is <admitted host: className not forwarded> -> day-cell -> week-row -> grid -> root, not ${CALENDAR_ACCENT_ANCESTRY.join(' -> ')}`,
      ),
    ],
    'S2-5d: and the ancestry never names it event',
  );
  const WRAPPER_SIGNATURE = 'function EventChip(\n  { children, onFocus, onBlur, ...rest },';
  assert.equal(bare.split(WRAPPER_SIGNATURE).length - 1, 1, 'the live EventChip signature drifted');
  const swallowed = withStaticClasses(
    bare.replace(WRAPPER_SIGNATURE, () => 'function EventChip(\n  { children, onFocus, onBlur, className, ...rest },'),
    [],
  );
  const swallowedAlias = liveChannelAlias(swallowed, path, CALENDAR_CHANNEL, 'ev');
  assert.deepEqual(
    producerSelectorPathViolations(
      withStaticClasses(swallowed, swallowedAlias.owners.map((owner) => stamp(owner))),
      path,
      CALENDAR_CHANNEL,
      'ev',
      CLASS_FORM,
    ).map((violation) => violation.replace(/@ line \d+/, '@ line L')),
    [`owner <EventChip> @ line L: ${missingClass('event')}`],
    'S2-5e: a wrapper that destructures className out never forwards it — its class hop fails closed',
  );
  assert.deepEqual(
    producerSelectorPathViolations(
      withStaticClasses(bare, [{ opening: chip, literal: `className="${EVENT_CLASS}" {...extraProps}` }, stamp(button)]),
      path,
      CALENDAR_CHANNEL,
      'ev',
      CLASS_FORM,
    ),
    [onOwner('EventChip', missingClass('event'))],
    'S2-5f: a later spread that may replace className voids the literal',
  );

  // S2-5g — the LIVE fixture (S3: both emitters carry the class as a static literal) satisfies the class form on
  // both owners. The part form is green on the read-only chip only; on the admitted host it must be red (R-d).
  assert.deepEqual(
    producerSelectorPathViolations(text, path, CALENDAR_CHANNEL, 'ev', CLASS_FORM),
    [],
    'S2-5g: the live chips satisfy the class form for both owners',
  );
  assert.deepEqual(
    producerSelectorPathViolations(text, path, CALENDAR_CHANNEL, 'ev', PART_FORM),
    [onLiveOwner('ModernButton', noPart())],
    'S2-5g: and the part form on the read-only chip alone; the admitted host is red on it BY NAME',
  );

  // S2-5h — the one new arm is exactly as wide as the ruling (R-b): an ADMITTED host, the EXACT owner token,
  // NO literal data-part. Every neighbouring shape stays red, each by name.
  for (const [name, fixture, form, expected] of [
    [
      'a caller part beside the class on the host',
      withStaticClasses(bare, [stamp(chip), { opening: button, literal: `className="${EVENT_CLASS}" data-part="${CALENDAR_ACCENT_PART}"` }]),
      CLASS_FORM,
      [onOwner('ModernButton', noPart())],
    ],
    [
      'a caller part alone on the host, read by the part form',
      withStaticClasses(bare, [stamp(chip), { opening: button, literal: `data-part="${CALENDAR_ACCENT_PART}"` }]),
      PART_FORM,
      [onOwner('ModernButton', noPart())],
    ],
    [
      "another block's hook on the host",
      withStaticClasses(bare, [stamp(chip), stamp(button, 'ds-other__event')]),
      CLASS_FORM,
      [onOwner('ModernButton', missingClass(HOST))],
    ],
    [
      'a longer token on the host',
      withStaticClasses(bare, [stamp(chip), stamp(button, `${EVENT_CLASS}-extra`)]),
      CLASS_FORM,
      [onOwner('ModernButton', missingClass(HOST))],
    ],
    [
      'a dynamic class on the host',
      withStaticClasses(bare, [stamp(chip), { opening: button, literal: 'className={eventClassName}' }]),
      CLASS_FORM,
      [onOwner('ModernButton', missingClass(HOST))],
    ],
  ]) {
    assert.deepEqual(tsxSyntaxDiagnostics(fixture, path), [], `S2-5h (${name}): the mutant must be real TSX`);
    assert.deepEqual(producerSelectorPathViolations(fixture, path, CALENDAR_CHANNEL, 'ev', form), expected, `S2-5h (${name})`);
  }
  // The exact token among others still names the host: a whole-token match, never a substring.
  assert.deepEqual(
    producerSelectorPathViolations(
      withStaticClasses(bare, [stamp(chip), stamp(button, `extra ${EVENT_CLASS}`)]),
      path,
      CALENDAR_CHANNEL,
      'ev',
      CLASS_FORM,
    ),
    [],
    'S2-5h: the exact token among other static tokens is the same hop',
  );
  // A component that is NOT an admitted host is never matched by its class: the name-only match stays forbidden.
  const unlisted = withStaticClasses(bare, [stamp(chip), stamp(button)]).replaceAll('ModernButton', 'OtherButton');
  const unlistedSelector = producerSelectorPathViolations(unlisted, path, CALENDAR_CHANNEL, 'ev', CLASS_FORM);
  assert.equal(unlistedSelector.length, 1, `S2-5h: only the unlisted owner is refused: ${unlistedSelector.join(' | ')}`);
  assert.match(
    unlistedSelector[0],
    /^owner <OtherButton> @ line \d+: selector part 'event' is absent from the live physical path$/,
    'S2-5h: a class on an unlisted component is no hop',
  );
  // And the read-only chip keeps its native-part arm exact: without its part, its class alone is no hop.
  const CHIP_PART = "      {...partAttributes('event', interaction.state)}\n";
  assert.equal(bare.split(CHIP_PART).length - 1, 1, 'the live EventChip part line drifted');
  const partless = withStaticClasses(bare.replace(CHIP_PART, () => ''), []);
  const partlessAlias = liveChannelAlias(partless, path, CALENDAR_CHANNEL, 'ev');
  const partlessSelector = producerSelectorPathViolations(
    withStaticClasses(partless, partlessAlias.owners.map((owner) => stamp(owner))),
    path,
    CALENDAR_CHANNEL,
    'ev',
    CLASS_FORM,
  );
  assert.equal(partlessSelector.length, 1, `S2-5h: only the partless chip is refused: ${partlessSelector.join(' | ')}`);
  assert.match(partlessSelector[0], /^owner <EventChip> @ line \d+: /, 'S2-5h: a class without the native part never names the chip');

  // S2-6 — mixed forms on different hops: each hop satisfied by its own form.
  const MIXED = `.${BLOCK}.ds-engine-modern[data-part='root'] > .${BLOCK}__grid [data-part='day-cell'] .${EVENT_CLASS}`;
  assert.deepEqual(
    selectorSteps(MIXED).map(({ part, via }) => `${via}:${part}`),
    ['part:root', 'class:grid', 'part:day-cell', 'class:event'],
    'S2-6: the mixed selector reads each hop by its own form',
  );
  assert.deepEqual(selectorAncestryDisagreements(MIXED, CALENDAR_ACCENT_ANCESTRY), [], 'S2-6: ancestry agrees');
  assert.deepEqual(
    producerSelectorPathViolations(
      withStaticClasses(bare, [stamp(chip), stamp(button), stamp(grid, `${BLOCK}__grid`)]),
      path,
      CALENDAR_CHANNEL,
      'ev',
      MIXED,
    ),
    [],
    'S2-6: green when every class hop is co-stamped',
  );
  assert.deepEqual(
    producerSelectorPathViolations(bothStamped, path, CALENDAR_CHANNEL, 'ev', MIXED),
    [
      onOwner('EventChip', missingClass('grid', `${BLOCK}__grid`)),
      onOwner('ModernButton', missingClass('grid', `${BLOCK}__grid`)),
    ],
    'S2-6: red on the one hop whose element lacks its class literal',
  );

  // S2-6, the name-only match (G2, unchanged by R-b): an element that is NOT an admitted host is never matched by
  // its class alone. The grid keeps its class and loses its part -> the class hop finds no element at all.
  const gridPart = grid.attributes.properties.filter(
    (attribute) => ts.isJsxAttribute(attribute) && attribute.name.getText() === 'data-part',
  );
  assert.equal(gridPart.length, 1, 'the live grid must carry exactly one data-part attribute');
  const classOnlyGrid = spliceNode(withStaticClasses(bare, [stamp(chip), stamp(button)]), gridPart[0], `className="${BLOCK}__grid"`);
  assert.deepEqual(tsxSyntaxDiagnostics(classOnlyGrid, path), [], 'S2-6: the class-only grid mutant must be real TSX');
  assert.deepEqual(
    producerSelectorPathViolations(classOnlyGrid, path, CALENDAR_CHANNEL, 'ev', MIXED),
    [onOwner('EventChip', noPart('grid')), onOwner('ModernButton', noPart('grid'))],
    'S2-6: a class without its part names nothing — the name-only match stays forbidden',
  );

  // S2-7 — both forms in ONE compound are one element, held to the class form.
  const COMPOUND = tailed(`${PART_TAIL}.${EVENT_CLASS}`);
  assert.deepEqual(
    selectorSteps(COMPOUND).at(-1),
    { part: 'event', via: 'class', className: EVENT_CLASS, child: false },
    'S2-7: one compound is one step, via class',
  );
  assert.equal(selectorSteps(COMPOUND).length, 4, 'S2-7: four steps, not five');
  assert.deepEqual(selectorAncestryDisagreements(COMPOUND, CALENDAR_ACCENT_ANCESTRY), [], 'S2-7: ancestry agrees');

  // H6 — the admitted host's className proof, each break named and isolated
  // from the style/part admission.
  for (const [name, edits, reason] of [
    ['slot fed by a literal', [['    { root: className }\n', "    { root: 'fixed' }\n"]], /^H6: the recipe 'root' slot of 'classes' is not fed by the caller 'className' alone$/],
    ['slot not alone', [['    { root: className }\n', '    { root: className, extra: 1 }\n']], /^H6: the recipe 'root' slot of 'classes' is not fed/],
    ['binding read elsewhere', [['  ).root;\n', '  ).root;\n  const echo = className;\n']], /^H6: 'className' is referenced outside the recipe slot @ line \d+$/],
    [
      'root className not the const',
      [['        className={classes}\n        disabled=', '        className={`${classes}`}\n        disabled=']],
      /^H6: root <button> @ line \d+ className is not a same-function const$/,
    ],
  ]) {
    const proof = withCoreFiles(coreEdits('host', edits), () => proveStyleHost(STYLE_HOSTS[0], CALENDAR_CHANNEL));
    assert.deepEqual(proof.refusals, [], `H6 (${name}): the style/part admission stands`);
    assert.equal(proof.facts.classNameForwarded, false, `H6 (${name}): no className is forwarded`);
    assert.equal(proof.facts.classRefusals.length, 1, `H6 (${name}): exactly one H6 refusal`);
    assert.match(proof.facts.classRefusals[0], reason, `H6 (${name}): the refusal names the break`);
  }
});

const KANBAN_PRODUCER_LITERAL = "{ '--ds-kanban-board-column-accent': column.color } as React.CSSProperties";

test('visualization skin Kanban Modern crosses the column accent only through a scoped custom property', () => {
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

  const cssPath = join(cssRoot, 'modern/skin/pattern-kanban-board/index.css');
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
    '3px solid var(--ds-kanban-board-column-accent, transparent)',
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
  const KANBAN_COLUMN_CALLBACK_ANCHOR = 'const isDropping = drag.session?.target?.columnId === column.id;';
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

test('visualization skin nonchart skins are engine-scoped and contain no generic hatch', () => {
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
test('visualization skin noncharts escalation exemption admits the exact triple and launders no NBSP', () => {
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

test('visualization skin Timeline runtime marker colour crosses only through a scoped custom property', () => {
  const sourceText = source(FILES.timelineRustic);
  const css = readFileSync(join(cssRoot, 'rustic/skin/pattern-timeline/index.css'), 'utf8');
  assert.equal(sourceText.match(/'--ds-pattern-timeline-marker-color': color/g)?.length, 2);
  assert.equal(css.match(/var\(--ds-pattern-timeline-marker-color\)/g)?.length, 3);
});

test('visualization skin Rustic Kanban preserves distinct initial, settled and hover card shadows', () => {
  const sourceText = source(FILES.kanbanRustic);
  const css = readFileSync(join(cssRoot, 'rustic/skin/pattern-kanban-board/index.css'), 'utf8');
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

test('visualization skin Rustic Timeline owns the reset shadow only for clickable cards', () => {
  const css = readFileSync(join(cssRoot, 'rustic/skin/pattern-timeline/index.css'), 'utf8');
  const cardRules = [...css.matchAll(/([^{}]*\.ds-timeline-rustic__item-card[^{}]*)\{([^{}]*)\}/g)];

  assert.equal(cardRules.length, 3);
  assert.doesNotMatch(cardRules[0][2], /box-shadow\s*:/);
  assert.match(cardRules[1][1], /\[data-clickable='true'\]/);
  assert.match(cardRules[1][2], /box-shadow: none;/);
  assert.match(cardRules[2][1], /\[data-clickable='true'\]:hover/);
  assert.match(cardRules[2][2], /box-shadow: 0 2px 8px rgba\(0, 0, 0, 0\.1\);/);
  assert.doesNotMatch(css, /\[data-clickable='false'\][^{]*\{[^}]*box-shadow\s*:/);
});

test('visualization skin preserves shared Tree paint ownership and embedded structural CSS', () => {
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
