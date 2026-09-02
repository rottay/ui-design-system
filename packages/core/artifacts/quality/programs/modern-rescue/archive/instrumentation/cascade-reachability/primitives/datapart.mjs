#!/usr/bin/env node
/**
 * WO-CRA-23 primitives census — instrument 1: data-part disposition per JSX element.
 *
 * Answers, per engine implementation: what does this element stamp as data-part,
 * and can a caller replace it? Ordering against spread attributes is the whole
 * question, so this walks the AST rather than matching attribute text.
 *
 * Verdicts:
 *   HARDCODED        literal/const value the caller cannot displace
 *   REPLACE          `caller ?? 'default'` — the caller's value wins outright
 *   PASSTHROUGH      bare caller expression, no default
 *   SPREAD_OVERRIDE  literal written, then an undestructured rest spread lands after it
 *   NONE_BUT_SPREAD  no data-part written, but an undestructured rest reaches the DOM
 *   STAMPED          imperative stampDataPart() after render
 */
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';

// `packages/core`, five levels up from
// test-artifacts/quality-evidence/wo-cra-23/harness/primitives/.
export const CORE = new URL('../../../../../', import.meta.url).pathname.replace(/\/$/, '');
const req = createRequire(CORE + '/package.json');
const ts = req('typescript');

/** Names bound by an object binding pattern, plus whether 'data-part' was taken out. */
function analyseParam(param) {
  const out = { restNames: [], removesDataPart: false, hasRest: false };
  if (!param || !ts.isObjectBindingPattern(param.name ?? param)) return out;
  const pattern = param.name ?? param;
  for (const el of pattern.elements) {
    if (el.dotDotDotToken) {
      out.hasRest = true;
      out.restNames.push(el.name.getText());
      continue;
    }
    const key = el.propertyName ?? el.name;
    let text = key.getText();
    if (ts.isStringLiteral(key)) text = key.text;
    text = text.replace(/^['"]|['"]$/g, '');
    if (text === 'data-part') out.removesDataPart = true;
  }
  return out;
}

/** Walk outward from a node to the enclosing function-like declarations. */
function enclosingFunctions(node) {
  const chain = [];
  let cur = node.parent;
  while (cur) {
    if (ts.isFunctionDeclaration(cur) || ts.isFunctionExpression(cur) || ts.isArrowFunction(cur)) {
      chain.push(cur);
    }
    cur = cur.parent;
  }
  return chain;
}

/** Does `name` resolve to a binding that could still carry data-part? */
function restCarriesDataPart(node, name) {
  for (const fn of enclosingFunctions(node)) {
    for (const p of fn.parameters ?? []) {
      // `(props) => <x {...props} />` — the whole props object, carries everything.
      if (p.name && ts.isIdentifier(p.name) && p.name.text === name) return true;
      const info = analyseParam(p);
      if (info.restNames.includes(name)) return !info.removesDataPart;
    }
    // `const { a, b, ...rest } = props;` inside the body — the shape rustic Button
    // uses, and the reason an earlier version of this walk reported it opaque.
    let hit = null;
    const scan = (n) => {
      if (hit) return;
      if (ts.isVariableDeclaration(n) && n.name && ts.isObjectBindingPattern(n.name)) {
        const info = analyseParam({ name: n.name });
        if (info.restNames.includes(name)) hit = !info.removesDataPart;
      }
      ts.forEachChild(n, scan);
    };
    if (fn.body) scan(fn.body);
    if (hit !== null) return hit;
  }
  // A spread of something we cannot resolve to a parameter — e.g. a locally
  // built object. Treated as opaque; reported separately so it is never silently
  // counted as safe.
  return null;
}

/** Resolve a bare identifier to a file-level `const X = 'literal'`, if one exists. */
function resolveLocalConst(sf, name) {
  let found;
  const visit = (n) => {
    if (ts.isVariableDeclaration(n) && ts.isIdentifier(n.name) && n.name.text === name &&
        n.initializer && ts.isStringLiteral(n.initializer)) {
      found = n.initializer.text;
    }
    ts.forEachChild(n, visit);
  };
  visit(sf);
  return found;
}

function classifyInitializer(init) {
  if (init === undefined) return { kind: 'HARDCODED', value: 'true' };
  if (ts.isStringLiteral(init)) return { kind: 'HARDCODED', value: init.text };
  if (ts.isJsxExpression(init)) {
    const e = init.expression;
    if (!e) return { kind: 'EMPTY', value: null };
    if (ts.isStringLiteral(e)) return { kind: 'HARDCODED', value: e.text };
    if (ts.isBinaryExpression(e) && e.operatorToken.kind === ts.SyntaxKind.QuestionQuestionToken) {
      const right = ts.isStringLiteral(e.right) ? e.right.text : e.right.getText();
      return { kind: 'REPLACE', value: right, caller: e.left.getText() };
    }
    if (ts.isConditionalExpression(e)) return { kind: 'CONDITIONAL', value: e.getText().slice(0, 80) };
    if (ts.isIdentifier(e)) return { kind: 'PASSTHROUGH', value: e.text };
    return { kind: 'COMPLEX', value: e.getText().slice(0, 80) };
  }
  return { kind: 'COMPLEX', value: init.getText().slice(0, 80) };
}

/**
 * `data-part` is emitted three ways in this tree, and only one of them is a JSX
 * attribute. The other two — `partAttributes(part, state)` spread onto the
 * element, and a hand-built attribute object spread onto it — are what a naive
 * attribute-only reader misses, which is how Button's root read as absent.
 */
function partEmissionFromSpread(expr, objectMap) {
  if (ts.isCallExpression(expr) && /(^|\.)partAttributes$/.test(expr.expression.getText())) {
    const a0 = expr.arguments[0];
    if (!a0) return { kind: 'COMPLEX', value: null, via: 'partAttributes' };
    if (ts.isStringLiteral(a0)) return { kind: 'HARDCODED', value: a0.text, via: 'partAttributes' };
    if (ts.isBinaryExpression(a0) && a0.operatorToken.kind === ts.SyntaxKind.QuestionQuestionToken) {
      return { kind: 'REPLACE', value: ts.isStringLiteral(a0.right) ? a0.right.text : a0.right.getText(),
               caller: a0.left.getText(), via: 'partAttributes' };
    }
    if (ts.isIdentifier(a0)) return { kind: 'PASSTHROUGH', value: a0.text, via: 'partAttributes' };
    return { kind: 'COMPLEX', value: a0.getText().slice(0, 60), via: 'partAttributes' };
  }
  if (ts.isIdentifier(expr) && objectMap.has(expr.text)) return objectMap.get(expr.text);
  if (ts.isObjectLiteralExpression(expr)) return partFromObjectLiteral(expr);
  return null;
}

function partFromObjectLiteral(obj) {
  // Object spread resolves left-to-right too, so the LAST writer of the key wins.
  let winner = null;
  for (const p of obj.properties) {
    if (ts.isSpreadAssignment(p)) {
      // `...partAttributes(x ?? 'trigger', state)` nested inside the attribute
      // object — Button/modern's real shape, and invisible to a property scan.
      const nested = partEmissionFromSpread(p.expression, new Map());
      if (nested) winner = { ...nested, via: 'objectSpread:' + nested.via };
      continue;
    }
    if (!ts.isPropertyAssignment(p)) continue;
    const key = ts.isStringLiteral(p.name) ? p.name.text : p.name.getText().replace(/^['"]|['"]$/g, '');
    if (key !== 'data-part') continue;
    const e = p.initializer;
    winner = partFromInitializer(e);
  }
  return winner;
}

function partFromInitializer(e) {
  {
    if (ts.isStringLiteral(e)) return { kind: 'HARDCODED', value: e.text, via: 'objectLiteral' };
    if (ts.isBinaryExpression(e) && e.operatorToken.kind === ts.SyntaxKind.QuestionQuestionToken) {
      return { kind: 'REPLACE', value: ts.isStringLiteral(e.right) ? e.right.text : e.right.getText(),
               caller: e.left.getText(), via: 'objectLiteral' };
    }
    if (ts.isIdentifier(e)) return { kind: 'PASSTHROUGH', value: e.text, via: 'objectLiteral' };
    return { kind: 'COMPLEX', value: e.getText().slice(0, 60), via: 'objectLiteral' };
  }
  return null;
}

/**
 * Scope classes a file emits. AST, not a text scan: a regex over quote pairs
 * desynchronises on the first apostrophe in a comment and then reports empty
 * for the rest of the file — which is how Badge and Empty read as scope-less.
 */
export function scopeClasses(file) {
  const text = readFileSync(file, 'utf8');
  const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const found = new Set();
  const add = (s) => {
    for (const tok of String(s).split(/\s+/)) {
      if (/^rottay-[a-z0-9][-a-z0-9]*$/.test(tok)) found.add(tok);
    }
  };
  const visit = (n) => {
    // Comments are not nodes, so a JSDoc mention of a class never reaches here.
    if (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) add(n.text);
    if (ts.isTemplateExpression(n)) {
      add(n.head.text);
      n.templateSpans.forEach((s) => add(s.literal.text));
    }
    ts.forEachChild(n, visit);
  };
  visit(sf);
  return [...found];
}

export function scanFile(file) {
  const text = readFileSync(file, 'utf8');
  const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const rows = [];
  const stamps = [];

  // Local `const X = { 'data-part': ... }` objects, so a spread of X is legible.
  const objectMap = new Map();
  const collectObjects = (n) => {
    if (ts.isVariableDeclaration(n) && ts.isIdentifier(n.name) && n.initializer) {
      let init = n.initializer;
      if (ts.isAsExpression(init)) init = init.expression;
      if (ts.isObjectLiteralExpression(init)) {
        const p = partFromObjectLiteral(init);
        if (p) objectMap.set(n.name.text, p);
      }
    }
    ts.forEachChild(n, collectObjects);
  };
  collectObjects(sf);

  const visit = (node) => {
    if (ts.isCallExpression(node)) {
      const callee = node.expression.getText();
      if (/stampDataPart$/.test(callee)) {
        const arg = node.arguments[1];
        stamps.push({
          file,
          line: sf.getLineAndCharacterOfPosition(node.getStart()).line + 1,
          value: arg && ts.isStringLiteral(arg) ? arg.text : arg ? arg.getText() : '?',
        });
      }
    }
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      const tag = node.tagName.getText();
      const attrs = node.attributes.properties;
      const line = sf.getLineAndCharacterOfPosition(node.getStart()).line + 1;

      // JSX resolves duplicate attributes left-to-right: the LAST writer wins.
      // Walk in order and keep the standing disposition.
      let effective = null;      // { kind, value, caller, via }
      let opaque = [];           // spreads we could not resolve
      const trace = [];

      for (const a of attrs) {
        if (ts.isJsxAttribute(a)) {
          const n = a.name.getText().replace(/^['"]|['"]$/g, '');
          if (n !== 'data-part') continue;
          const c = classifyInitializer(a.initializer);
          if (c.kind === 'PASSTHROUGH') {
            const lit = resolveLocalConst(sf, c.value);
            if (lit !== undefined) { c.kind = 'HARDCODED'; c.value = lit; }
          }
          c.via = 'jsxAttribute';
          effective = c;
          trace.push(`attr:${c.kind}(${c.value})`);
          continue;
        }
        if (!ts.isJsxSpreadAttribute(a)) continue;
        const expr = a.expression;
        const emission = partEmissionFromSpread(expr, objectMap);
        if (emission) {
          effective = { ...emission };
          trace.push(`spread:${emission.via}:${emission.kind}(${emission.value})`);
          continue;
        }
        const name = ts.isIdentifier(expr) ? expr.text : null;
        const carries = name ? restCarriesDataPart(node, name) : null;
        if (carries === true) {
          // A caller-supplied data-part inside this rest overwrites whatever
          // stood before it; when the caller passes none, the key is absent and
          // the prior value survives. Same semantics as `caller ?? default`.
          effective = effective && effective.kind === 'HARDCODED'
            ? { kind: 'SPREAD_OVERRIDE', value: effective.value, via: `rest:${name}` }
            : { kind: effective ? effective.kind : 'NONE_BUT_SPREAD',
                value: effective ? effective.value : null, via: `rest:${name}` };
          trace.push(`rest:${name}:carries`);
        } else if (carries === null && name) {
          opaque.push(name);
          trace.push(`rest:${name}:opaque`);
        } else {
          trace.push(`rest:${name}:sealed`);
        }
      }

      if (effective) {
        rows.push({ file, line, tag, kind: effective.kind, value: effective.value ?? null,
                    caller: effective.caller ?? null, via: effective.via ?? null,
                    opaque, trace });
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return { rows, stamps };
}

if (process.argv[2] === '--control') {
  const f = new URL('./control/datapart-control.tsx', import.meta.url).pathname;
  const { rows, stamps } = scanFile(f);
  const expected = {
    7: 'HARDCODED', 12: 'REPLACE', 17: 'PASSTHROUGH', 24: 'SPREAD_OVERRIDE',
    31: 'HARDCODED', 36: 'HARDCODED', 41: 'NONE_BUT_SPREAD', 49: 'NONE_BUT_SPREAD',
    55: 'HARDCODED',
    64: 'REPLACE', 69: 'HARDCODED', 74: 'SPREAD_OVERRIDE', 79: 'HARDCODED',
    91: 'REPLACE', 99: 'SPREAD_OVERRIDE',
  };
  let pass = 0, fail = 0;
  for (const [line, want] of Object.entries(expected)) {
    const got = rows.find((r) => String(r.line) === line);
    const ok = got && got.kind === want;
    if (ok) pass++; else fail++;
    console.log(`${ok ? 'ok  ' : 'FAIL'} line ${line}: want ${want}, got ${got ? got.kind : '(no row)'}`);
  }
  const stampOk = stamps.length === 1 && stamps[0].value === 'trigger';
  console.log(`${stampOk ? 'ok  ' : 'FAIL'} stampDataPart: want 1×'trigger', got ${JSON.stringify(stamps.map((s) => s.value))}`);
  if (!stampOk) fail++; else pass++;
  console.log(`\ncontrol: ${pass} pass / ${fail} fail`);
  process.exit(fail === 0 ? 0 : 1);
}
