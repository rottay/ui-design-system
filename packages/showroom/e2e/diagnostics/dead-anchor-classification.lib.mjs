// Conditional-coverage classifier for the dead-selector audit (P-79 follow-up).
//
// The browser audit (skin-rule-coverage.spec.ts) files a rule as a DEAD ANCHOR
// when its `[data-part]` skeleton matches nothing on the torture pages while
// other rules of the same skin file do. Most of those rows are parts the
// component stamps only under a prop / state configuration the fixture never
// sets (`showTime`, `isSearchable`, an editing cell). This module splits every
// deadAnchor row into:
//
//   TRUE_DEAD    the P-79 bug class, or anything the census cannot prove. Stays failing.
//   CONDITIONAL  every anchor part of the row is stamped somewhere in the tree, and
//                at least one of them is stamped by the OWNING component such that
//                every owner stamp lands on a DOM host and every render path to it
//                (followed through locals, helpers and sibling imports) passes a
//                static condition (`&&`, `||`, ternary, `if`, early return,
//                `switch`). Each row names the stamp file:line and the condition.
//
// Anchors are read as a tree: `:is()`/`:has()` arms and selector lists are
// alternatives. A stamp site counts for a row only when its JSX ancestry (hosts,
// siblings, wrapper and portal boundaries) can satisfy the row's combinators; when
// no site of an anchor can, the row is a DEAD RULE (a skin bug). Gates include
// lookup-table members and prop-driven class tokens; an unreadable selection is
// unanalysable, never 'no condition'.
//
// Producers are read where the source holds them: a tag bound to a prop typed as a union
// of intrinsic names (the selector's tag becomes the gate), recipe slot tables and
// class-window pair tables (both spellings at the keyed read). A `>` parent the stamp's
// ancestry cannot see must be an element that renders composed children; a prop a host
// mounts only behind its own gate (an overlay's `content`) carries that gate.
//
// Conservative bias is the law: a row leaves the failing class ONLY with positive
// source evidence. These never count as a gate: iteration (`.map` over data the
// fixture may well hold), hydration flags that are true at rest, conditions the
// browser proved true together on one instance (see positiveControl),
// render-prop callbacks whose caller is another component, and public exports a
// consumer may render directly. Any of those alone on a path leaves it UNGATED, and one ungated path
// keeps the part from explaining the absence.
//
// The stamp vocabulary is the static gate's (core/scripts/check/engine/skins/
// dead-parts): a part that gate's census sees in an owner file but the AST cannot
// place is unproven and cannot be relaxed.
//
// No Playwright import lives here: importing this module has no side effects.

import ts from 'typescript';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { collectRules, isForeignVendorSelector, toProbe, toSkeleton } from './skin-rule-coverage.lib.mjs';
import { collectStampedPartsFromSource } from '../../../core/scripts/check/engine/skins/dead-parts/index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
export const COMPONENTS_ROOT = join(HERE, '../../../core/src/components');
export const REPORT_PATH = join(HERE, '../../dead-selector-report.json');

const EXCLUDED_ENGINES = { modern: ['rustic', 'classic'], rustic: ['modern', 'classic'], agnostic: [] };
const ITERATORS = new Set(['map', 'flatMap', 'forEach', 'filter', 'reduce']);
const TRANSPARENT_CALLS = new Set(['useCallback', 'useMemo', 'memo', 'forwardRef', 'React.memo', 'React.forwardRef', 'React.useCallback', 'React.useMemo']);
// True once the page has hydrated: gating on them does not make a part absent at rest.
const AT_REST_TRUE = /^(?:!*\s*)?(?:mounted|isMounted|hasMounted|hydrated|isHydrated|isClient|portalReady|canPortal|portalHost|portalTarget|portalContainer|container)$/;
const MAX_HOPS = 12;

const isProductionSource = (path) =>
  /\.tsx?$/.test(path) && !/\.d\.ts$/.test(path) && !/\.(test|spec|stories)\.tsx?$/.test(path) && !/[\\/](tests?|__tests__|stories)[\\/]/.test(path);

/** Every production TS/TSX file under a root, as root-relative posix paths. */
export function listSources(root = COMPONENTS_ROOT) {
  const out = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, entry.name);
      if (entry.isDirectory()) { if (entry.name !== 'node_modules') walk(p); }
      else if (isProductionSource(p)) out.push(relative(root, p).split(sep).join('/'));
    }
  };
  walk(root);
  return out.sort();
}

// ---------------------------------------------------------------------------
// Stamp sites (AST)
// ---------------------------------------------------------------------------

const literalsIn = (node) => {
  const out = [];
  const visit = (n) => {
    if (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) { if (/^[a-z0-9-]+$/i.test(n.text)) out.push(n); return; }
    if (ts.isTemplateExpression(n)) return; // built dynamically: not a literal stamp
    if (ts.isCallExpression(n)) return;
    ts.forEachChild(n, visit);
  };
  visit(node);
  return out;
};

const attrName = (a) => (ts.isJsxAttribute(a) ? a.name.getText() : null);
const calleeName = (call) => call.expression.getText().replace(/\s+/g, '');

/** The JSX element a stamp node sits on (attribute or spread), if any. */
function hostElement(node) {
  for (let n = node.parent; n; n = n.parent) {
    if (ts.isJsxOpeningElement(n) || ts.isJsxSelfClosingElement(n)) return n;
    if (!(ts.isJsxAttribute(n) || ts.isJsxAttributes(n) || ts.isJsxSpreadAttribute(n) || ts.isJsxExpression(n) || ts.isConditionalExpression(n) || ts.isBinaryExpression(n) || ts.isParenthesizedExpression(n) || ts.isCallExpression(n))) return null;
  }
  return null;
}

const INTRINSIC_TAG = /^[a-z][a-z0-9-]*(?::[a-z][a-z0-9-]*)?$/;

const stripTypeWrappers = (n) => {
  while (n && (ts.isParenthesizedExpression(n) || ts.isAsExpression(n) || ts.isNonNullExpression(n) || (ts.isSatisfiesExpression && ts.isSatisfiesExpression(n)) || (ts.isTypeAssertionExpression && ts.isTypeAssertionExpression(n)))) n = n.expression;
  return n;
};

/** The initializer of the nearest `const name = ...` in scope, or null. */
function localInitializer(id) {
  const name = id.text;
  for (let scope = id.parent; scope; scope = scope.parent) {
    const statements = ts.isBlock(scope) || ts.isSourceFile(scope) ? scope.statements : null;
    if (!statements) continue;
    for (const st of statements) {
      if (!ts.isVariableStatement(st)) continue;
      for (const d of st.declarationList.declarations) if (ts.isIdentifier(d.name) && d.name.text === name) return d.initializer ?? null;
    }
  }
  return null;
}

function isIntrinsicTagValue(n) {
  n = stripTypeWrappers(n);
  if (!n) return false;
  if (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) return INTRINSIC_TAG.test(n.text);
  if (ts.isTemplateExpression(n)) return /^[a-z]/.test(n.head.text);
  if (ts.isConditionalExpression(n)) return isIntrinsicTagValue(n.whenTrue) && isIntrinsicTagValue(n.whenFalse);
  return false;
}

/**
 * `<div>`, `<svg:g>`, a variable tag bound to an intrinsic name (`const Heading = \`h${level}\``),
 * or one bound to a prop whose declared type is a union of intrinsic names (`const Component = as`).
 */
function isIntrinsicTag(tagNode, ctx = null) {
  if (INTRINSIC_TAG.test(tagNode.getText())) return true;
  if (!ts.isIdentifier(tagNode)) return false;
  const init = localInitializer(tagNode);
  return (Boolean(init) && isIntrinsicTagValue(init)) || Boolean(propTagOf(tagNode, ctx));
}

const isTypeDecl = (st) => ts.isInterfaceDeclaration(st) || ts.isTypeAliasDeclaration(st);

/** The interface or type alias `name` resolves to in a census file, through type and value imports. */
function resolveTypeName(census, file, name, seen = new Set()) {
  const key = `n|${file}|${name}`;
  if (seen.has(key) || !census.files.has(file)) return null;
  seen.add(key);
  const { sf } = census.ctxOf(file);
  for (const st of sf.statements) {
    if (isTypeDecl(st) && st.name.text === name) return { file, node: st };
    const named = ts.isImportDeclaration(st) && ts.isStringLiteral(st.moduleSpecifier) ? st.importClause?.namedBindings : null;
    if (!named || !ts.isNamedImports(named)) continue;
    const el = named.elements.find((x) => x.name.text === name);
    if (!el) continue;
    const target = census.resolveSpecifier(file, st.moduleSpecifier.text);
    return target ? resolveTypeExport(census, target, (el.propertyName ?? el.name).text, seen) : null;
  }
  return null;
}

/** An exported interface or type alias, following re-export barrels. */
function resolveTypeExport(census, file, name, seen) {
  const key = `e|${file}|${name}`;
  if (seen.has(key) || !census.files.has(file)) return null;
  seen.add(key);
  const local = resolveTypeName(census, file, name, seen);
  if (local) return local;
  for (const st of census.ctxOf(file).sf.statements) {
    if (!ts.isExportDeclaration(st)) continue;
    const clause = st.exportClause && ts.isNamedExports(st.exportClause) ? st.exportClause : null;
    const el = clause?.elements.find((x) => x.name.text === name);
    if (!st.moduleSpecifier) {
      if (el) return resolveTypeName(census, file, (el.propertyName ?? el.name).text, seen);
      continue;
    }
    const target = ts.isStringLiteral(st.moduleSpecifier) ? census.resolveSpecifier(file, st.moduleSpecifier.text) : null;
    if (!target) continue;
    if (!st.exportClause) { const found = resolveTypeExport(census, target, name, seen); if (found) return found; }
    else if (el) return resolveTypeExport(census, target, (el.propertyName ?? el.name).text, seen);
  }
  return null;
}

/** The string literals a type can hold, or null when it can hold anything else. */
function stringLiteralUnion(census, file, type, depth = 0) {
  if (!type || depth > 6) return null;
  if (ts.isParenthesizedTypeNode(type)) return stringLiteralUnion(census, file, type.type, depth + 1);
  if (ts.isLiteralTypeNode(type)) return ts.isStringLiteral(type.literal) ? [type.literal.text] : null;
  if (ts.isUnionTypeNode(type)) {
    const out = [];
    for (const t of type.types) {
      const v = stringLiteralUnion(census, file, t, depth + 1);
      if (!v) return null;
      out.push(...v);
    }
    return [...new Set(out)];
  }
  if (ts.isTypeReferenceNode(type) && ts.isIdentifier(type.typeName) && !type.typeArguments) {
    const decl = resolveTypeName(census, file, type.typeName.text);
    return decl && ts.isTypeAliasDeclaration(decl.node) ? stringLiteralUnion(census, decl.file, decl.node.type, depth + 1) : null;
  }
  return null;
}

/** `{ file, type }` of a member `prop` of a props type (interfaces, their bases, literals, intersections). */
function propMemberType(census, file, type, prop, depth = 0) {
  if (!type || depth > 8) return null;
  const inMembers = (members, f) => {
    const m = members.find((x) => ts.isPropertySignature(x) && x.name && propertyKeyText(x.name) === prop);
    return m ? (m.type ? { file: f, type: m.type } : null) : undefined;
  };
  if (ts.isParenthesizedTypeNode(type)) return propMemberType(census, file, type.type, prop, depth + 1);
  if (ts.isTypeLiteralNode(type)) return inMembers(type.members, file) ?? null;
  if (ts.isIntersectionTypeNode(type)) {
    for (const t of type.types) { const hit = propMemberType(census, file, t, prop, depth + 1); if (hit) return hit; }
    return null;
  }
  if (!ts.isTypeReferenceNode(type) || !ts.isIdentifier(type.typeName) || type.typeArguments) return null;
  const decl = resolveTypeName(census, file, type.typeName.text);
  if (!decl) return null;
  if (ts.isTypeAliasDeclaration(decl.node)) return propMemberType(census, decl.file, decl.node.type, prop, depth + 1);
  const own = inMembers(decl.node.members, decl.file);
  if (own !== undefined) return own;
  for (const clause of decl.node.heritageClauses ?? []) {
    for (const base of clause.types) {
      if (!ts.isIdentifier(base.expression) || base.typeArguments) continue;
      const hit = propMemberType(census, decl.file, ts.factory.createTypeReferenceNode(base.expression.text), prop, depth + 1);
      if (hit) return hit;
    }
  }
  return null;
}

/** The props type a component function declares: its parameter annotation or `forwardRef<R, P>`. */
function componentPropsType(fn) {
  const param = fn.parameters?.[0];
  if (param?.type) return param.type;
  let outer = fn;
  while (outer.parent && ts.isParenthesizedExpression(outer.parent)) outer = outer.parent;
  const call = outer.parent;
  if (call && ts.isCallExpression(call) && call.arguments[0] === outer && /(^|\.)forwardRef$/.test(calleeName(call)) && call.typeArguments?.length === 2) return call.typeArguments[1];
  return null;
}

/** The object literal an expression always evaluates to (`DEFAULTS.text`), across imports. */
function constObject(census, file, expr, depth = 0) {
  const e = stripTypeWrappers(expr);
  if (!e || depth > 6) return null;
  if (ts.isObjectLiteralExpression(e)) return { file, node: e };
  if (ts.isIdentifier(e)) {
    const local = localInitializer(e);
    if (local) return constObject(census, file, local, depth + 1);
    const decl = resolveLocalBinding(census, file, e.text, new Set());
    return decl ? constObject(census, decl.file, decl.node, depth + 1) : null;
  }
  if (ts.isPropertyAccessExpression(e)) {
    const obj = constObject(census, file, e.expression, depth + 1);
    const prop = obj?.node.properties.find((p) => ts.isPropertyAssignment(p) && propertyKeyText(p.name) === e.name.text);
    return prop ? constObject(census, obj.file, prop.initializer, depth + 1) : null;
  }
  return null;
}

/** The string an expression always evaluates to (`'span'`, `DEFAULTS.text.as`), across imports; else null. */
function constString(census, file, expr, depth = 0) {
  const e = stripTypeWrappers(expr);
  if (!e || depth > 6) return null;
  if (ts.isStringLiteral(e) || ts.isNoSubstitutionTemplateLiteral(e)) return e.text;
  if (ts.isIdentifier(e)) {
    const local = localInitializer(e);
    if (local) return constString(census, file, local, depth + 1);
    const decl = resolveLocalBinding(census, file, e.text, new Set());
    return decl ? constString(census, decl.file, decl.node, depth + 1) : null;
  }
  if (ts.isPropertyAccessExpression(e)) {
    const obj = constObject(census, file, e.expression, depth + 1);
    const prop = obj?.node.properties.find((p) => ts.isPropertyAssignment(p) && propertyKeyText(p.name) === e.name.text);
    return prop ? constString(census, obj.file, prop.initializer, depth + 1) : null;
  }
  return null;
}

/**
 * A variable tag bound to a destructured prop (`const Component = as`) whose declared type is a
 * union of intrinsic names and whose default is one of them: `{ prop, values, def, file, line }`.
 * An untyped, widened (`string`) or default-less prop is no proof.
 */
function propTagOf(tagNode, ctx) {
  const census = ctx?.census;
  if (!census || !ts.isIdentifier(tagNode)) return null;
  census.propTagCache ??= new Map();
  if (census.propTagCache.has(tagNode)) return census.propTagCache.get(tagNode);
  let result = null;
  const init = stripTypeWrappers(localInitializer(tagNode));
  if (init && ts.isIdentifier(init)) {
    for (let fn = tagNode.parent; fn && !result; fn = fn.parent) {
      if (!isFunctionLike(fn)) continue;
      const bound = destructuredProps(fn).get(init.text);
      if (!bound) continue;
      const propsType = bound.def ? componentPropsType(fn) : null;
      const member = propsType ? propMemberType(census, ctx.file, propsType, bound.prop) : null;
      const values = member ? stringLiteralUnion(census, member.file, member.type) : null;
      const def = values ? constString(census, ctx.file, bound.def) : null;
      if (values && values.length > 0 && values.every((v) => INTRINSIC_TAG.test(v)) && def !== null && values.includes(def)) {
        result = { prop: bound.prop, values, def, file: ctx.file, line: ctx.sf.getLineAndCharacterOfPosition(init.getStart(ctx.sf)).line + 1 };
      }
      break;
    }
  }
  census.propTagCache.set(tagNode, result);
  return result;
}

const literalTagValues = (n) => {
  n = stripTypeWrappers(n);
  if (!n) return null;
  if (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) return INTRINSIC_TAG.test(n.text) ? [n.text.toLowerCase()] : null;
  if (ts.isConditionalExpression(n)) {
    const a = literalTagValues(n.whenTrue);
    const b = literalTagValues(n.whenFalse);
    return a && b ? [...new Set([...a, ...b])] : null;
  }
  return null;
};

/** The tags an intrinsic host can render as: `{ tags, prefix, prop }` (`tags` null when only a prefix is known). */
function tagShape(tagNode, ctx) {
  const textTag = tagNode.getText();
  if (INTRINSIC_TAG.test(textTag)) return { tags: [textTag.toLowerCase()], prefix: null, prop: null };
  const none = { tags: null, prefix: null, prop: null };
  if (!ts.isIdentifier(tagNode)) return none;
  const init = stripTypeWrappers(localInitializer(tagNode));
  const literal = init ? literalTagValues(init) : null;
  if (literal) return { tags: literal, prefix: null, prop: null };
  if (init && ts.isTemplateExpression(init) && /^[a-z]/.test(init.head.text)) return { tags: null, prefix: init.head.text, prop: null };
  const prop = propTagOf(tagNode, ctx);
  return prop ? { tags: prop.values, prefix: null, prop } : none;
}

/**
 * Whether a stamp provably reaches the DOM. P-79 is a `data-part` handed to a
 * component that drops it, so only an intrinsic host (`<div>`, `<svg:g>`, a
 * variable intrinsic tag) or a D3 `.attr` counts here; a component host is
 * proven later by the forwarding analysis or the browser's positive control.
 */
function landsOnDom(site, ctx = null) {
  if (site.via === 'd3-attr') return { lands: true, host: null };
  if (site.via === 'part' || site.via === 'data-part-prop') return { lands: false, host: null };
  const element = hostElement(site.node);
  if (!element) return { lands: false, host: null };
  return { lands: isIntrinsicTag(element.tagName, ctx), host: element.tagName.getText() };
}

/** Every literal part stamp in a source, located. `{ part, node, via, lands, host }` */
export function findStampSites(sf, ctx = null) {
  const sites = [];
  const visit = (n) => {
    if (ts.isJsxAttribute(n) && (attrName(n) === 'data-part' || attrName(n) === 'part') && n.initializer) {
      const init = n.initializer;
      if (ts.isStringLiteral(init)) sites.push({ part: init.text, node: n, via: attrName(n) });
      else if (ts.isJsxExpression(init) && init.expression && attrName(n) === 'data-part') {
        for (const lit of literalsIn(init.expression)) sites.push({ part: lit.text, node: lit, via: 'data-part' });
      }
    } else if (ts.isCallExpression(n)) {
      const name = calleeName(n);
      if (/(^|\.)partAttributes$/.test(name) && n.arguments[0]) {
        for (const lit of literalsIn(n.arguments[0])) sites.push({ part: lit.text, node: lit, via: 'partAttributes' });
      } else if (/\.attr$/.test(name) && n.arguments.length === 2 && ts.isStringLiteral(n.arguments[0]) && n.arguments[0].text === 'data-part' && ts.isStringLiteral(n.arguments[1])) {
        sites.push({ part: n.arguments[1].text, node: n, via: 'd3-attr' });
      }
    } else if (ts.isPropertyAssignment(n) && ts.isStringLiteral(n.name) && n.name.text === 'data-part' && ts.isStringLiteral(n.initializer)) {
      sites.push({ part: n.initializer.text, node: n, via: 'data-part-prop' });
    }
    ts.forEachChild(n, visit);
  };
  visit(sf);
  return sites.map((site) => ({ ...site, ...landsOnDom(site, ctx) }));
}

// ---------------------------------------------------------------------------
// Render-path conditions
// ---------------------------------------------------------------------------

const unparen = (n) => { while (n && ts.isParenthesizedExpression(n)) n = n.expression; return n; };
const text = (n) => n.getText().replace(/\s+/g, ' ').trim();
const isFunctionLike = (n) => ts.isArrowFunction(n) || ts.isFunctionExpression(n) || ts.isFunctionDeclaration(n) || ts.isMethodDeclaration(n);

function containsReturn(stmt) {
  if (ts.isReturnStatement(stmt) || ts.isThrowStatement(stmt)) return true;
  if (ts.isBlock(stmt)) return stmt.statements.length > 0 && containsReturn(stmt.statements[stmt.statements.length - 1]);
  return false;
}

/** Identifiers read by an expression, resolved through local consts to props / state / params. */
function resolveNames(expr, depth = 0, seen = new Set()) {
  const out = [];
  const visit = (n) => {
    if (ts.isIdentifier(n)) {
      const parent = n.parent;
      if (parent && ts.isPropertyAccessExpression(parent) && parent.name === n) return;
      if (seen.has(n.text) || ['undefined', 'null', 'true', 'false'].includes(n.text)) return;
      seen.add(n.text);
      out.push(...resolveIdentifier(n, depth, seen));
      return;
    }
    if (ts.isPropertyAccessExpression(n)) {
      const root = unparen(n.expression);
      // `props.showTime`, `features.editing` -> the member name is the switch.
      if (ts.isIdentifier(root) && /^(props|options|features|config|settings)$/.test(root.text)) { out.push({ name: n.name.text, kind: 'prop' }); return; }
    }
    if (isFunctionLike(n) || ts.isTypeNode(n) || ts.isJsxElement(n) || ts.isJsxSelfClosingElement(n) || ts.isJsxFragment(n)) return;
    // A call reads its arguments (hook dependency arrays included), not its callee.
    if (ts.isCallExpression(n)) { n.arguments.forEach(visit); return; }
    ts.forEachChild(n, visit);
  };
  visit(expr);
  return out;
}

function resolveIdentifier(id, depth, seen) {
  const name = id.text;
  for (let scope = id.parent; scope; scope = scope.parent) {
    if (isFunctionLike(scope)) {
      for (const param of scope.parameters) {
        const hit = bindingIn(param.name, name);
        if (hit) return [{ name: hit.propName ?? name, kind: hit.propName !== undefined || ts.isObjectBindingPattern(param.name) ? 'prop' : 'param' }];
      }
    }
    const statements = ts.isBlock(scope) || ts.isSourceFile(scope) ? scope.statements : null;
    if (!statements) continue;
    for (const st of statements) {
      if (!ts.isVariableStatement(st)) continue;
      for (const decl of st.declarationList.declarations) {
        const hit = bindingIn(decl.name, name);
        if (!hit) continue;
        const init = decl.initializer && unparen(decl.initializer);
        if (init && ts.isCallExpression(init) && /(^|\.)useState$|(^|\.)useReducer$|(^|\.)useControllableState$|(^|\.)useControlled/.test(calleeName(init))) return [{ name, kind: 'state' }];
        if (hit.propName !== undefined && init && ts.isIdentifier(init) && /^props$/.test(init.text)) return [{ name: hit.propName, kind: 'prop' }];
        if (hit.propName !== undefined) return [{ name: hit.propName, kind: 'field' }];
        if (!init || depth >= 4 || isFunctionLike(init)) return [{ name, kind: 'local' }];
        const deeper = resolveNames(init, depth + 1, seen);
        return deeper.length ? deeper : [{ name, kind: 'local' }];
      }
    }
  }
  return [{ name, kind: 'free' }];
}

/** Whether a binding pattern binds `name`; `propName` is the destructured key. */
function bindingIn(pattern, name) {
  if (ts.isIdentifier(pattern)) return pattern.text === name ? {} : null;
  for (const el of pattern.elements ?? []) {
    if (ts.isOmittedExpression(el)) continue;
    if (ts.isIdentifier(el.name) && el.name.text === name) {
      if (ts.isObjectBindingPattern(pattern)) return { propName: el.propertyName ? el.propertyName.getText() : name };
      return {};
    }
    if (!ts.isIdentifier(el.name)) { const inner = bindingIn(el.name, name); if (inner) return inner; }
  }
  return null;
}

function makeCondition(kind, expr, negated, ctx, textOverride) {
  const { sf, file } = ctx;
  const raw = text(expr);
  const conditionText = textOverride ?? (negated ? `!(${raw})` : raw);
  const line = sf.getLineAndCharacterOfPosition(expr.getStart(sf)).line + 1;
  const names = resolveNames(expr);
  const atRest = AT_REST_TRUE.test(raw) || (names.length > 0 && names.every((n) => AT_REST_TRUE.test(n.name)));
  return { kind, text: conditionText, file, line, names, gates: kind !== 'iteration' && !atRest };
}

/** A gate the analysis cannot read. It never gates and never reads as 'no condition'. */
function unknownCondition(node, why, ctx) {
  const line = ctx.sf.getLineAndCharacterOfPosition(node.getStart(ctx.sf)).line + 1;
  return { kind: 'unknown', text: why, file: ctx.file, line, names: [], gates: false };
}

/** Every identifier reference to `name` in the file that is a use, not a declaration or a hook dependency. */
function usagesOf(sf, name, declNode) {
  const out = [];
  const visit = (n) => {
    if (ts.isIdentifier(n) && n.text === name && n !== declNode) {
      const p = n.parent;
      const isDecl = (ts.isVariableDeclaration(p) || ts.isFunctionDeclaration(p) || ts.isParameter(p) || ts.isBindingElement(p)) && p.name === n;
      // `Part.displayName = ...` reads a static member; it renders nothing.
      const isKey = ts.isPropertyAccessExpression(p) || (ts.isPropertyAssignment(p) && p.name === n) || ts.isJsxAttribute(p) || (ts.isJsxClosingElement(p));
      const isImportExport = ts.isImportSpecifier(p) || ts.isImportClause(p) || ts.isExportSpecifier(p) || ts.isTypeReferenceNode(p) || ts.isTypeQueryNode(p);
      const inDeps = ts.isArrayLiteralExpression(p) && p.parent && ts.isCallExpression(p.parent) && /use(Callback|Memo|Effect|LayoutEffect|ImperativeHandle)$/.test(calleeName(p.parent)) && p.parent.arguments.indexOf(p) > 0;
      if (!isDecl && !isKey && !isImportExport && !inDeps) out.push(n);
    }
    ts.forEachChild(n, visit);
  };
  visit(sf);
  return out;
}

/** The name a declaration is exported under from its file (`default` included), or null. */
const exportNameOf = (node, sf) => {
  const name = node.text;
  for (let n = node; n; n = n.parent) {
    const mods = ts.canHaveModifiers?.(n) ? ts.getModifiers(n) ?? [] : [];
    if (mods.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)) return mods.some((m) => m.kind === ts.SyntaxKind.DefaultKeyword) ? 'default' : name;
    if (ts.isVariableStatement(n) || ts.isFunctionDeclaration(n)) break;
  }
  for (const st of sf.statements) {
    if (ts.isExportAssignment(st) && ts.isIdentifier(st.expression) && st.expression.text === name) return 'default';
    if (ts.isExportDeclaration(st) && !st.moduleSpecifier && st.exportClause && ts.isNamedExports(st.exportClause)) {
      for (const el of st.exportClause.elements) if ((el.propertyName ?? el.name).text === name) return el.name.text;
    }
  }
  return null;
};

const PORTAL_TAGS = new Set(['Portal']);
const OPAQUE_SIBLING = Object.freeze({ kind: 'opaque', optional: true });

const propertyKeyText = (name) => (ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNumericLiteral(name) || ts.isNoSubstitutionTemplateLiteral(name) ? name.text : null);
const isJsxValue = (n) => {
  const u = stripTypeWrappers(n);
  return Boolean(u) && (ts.isJsxElement(u) || ts.isJsxSelfClosingElement(u) || ts.isJsxFragment(u));
};

/** The literal a JSX attribute initializer always yields, or null. */
function staticString(init, subst = null) {
  if (!init) return null;
  if (ts.isStringLiteral(init)) return init.text;
  if (ts.isJsxExpression(init) && init.expression) {
    const e = stripTypeWrappers(init.expression);
    if (ts.isStringLiteral(e) || ts.isNoSubstitutionTemplateLiteral(e)) return e.text;
    if (subst && ts.isBinaryExpression(e) && e.operatorToken.kind === ts.SyntaxKind.QuestionQuestionToken) {
      const left = subst(e.left);
      const right = stripTypeWrappers(e.right);
      if (left && left.value === undefined && (ts.isStringLiteral(right) || ts.isNoSubstitutionTemplateLiteral(right))) return right.text;
    }
  }
  return null;
}

/** Classes a className expression always carries; `complete` when it can carry nothing else. */
function staticClasses(init, depth = 0, subst = null) {
  const words = (s) => s.split(/\s+/).filter(Boolean);
  const open = (present) => ({ present: new Set(present), complete: false });
  if (!init) return { present: new Set(), complete: true };
  let e = ts.isJsxExpression(init) ? init.expression : init;
  e = stripTypeWrappers(e);
  if (!e) return open([]);
  if (ts.isStringLiteral(e) || ts.isNoSubstitutionTemplateLiteral(e)) return { present: new Set(words(e.text)), complete: true };
  if (ts.isTemplateExpression(e) && subst) {
    // A substitution the call site fixes (a prop it never passes) is static text.
    let flat = e.head.text;
    let open_ = false;
    for (const span of e.templateSpans) {
      const v = subst(span.expression);
      if (v) flat += v.value === undefined ? 'undefined' : v.value;
      else { flat += '\u0000'; open_ = true; }
      flat += span.literal.text;
    }
    const present = flat.split(/\s+/).filter((w) => w && !w.includes('\u0000'));
    return open_ ? open(present) : { present: new Set(present), complete: true };
  }
  if (ts.isTemplateExpression(e)) {
    const pieces = [e.head.text, ...e.templateSpans.map((s) => s.literal.text)];
    const present = [];
    pieces.forEach((p, i) => {
      const ws = words(p);
      // A word touching a substitution may be a prefix of a longer class.
      if (i > 0 && !/^\s/.test(p)) ws.shift();
      if (i < pieces.length - 1 && !/\s$/.test(p)) ws.pop();
      present.push(...ws);
    });
    return open(present);
  }
  if (ts.isArrayLiteralExpression(e)) return open(e.elements.filter((x) => ts.isStringLiteral(x)).flatMap((x) => words(x.text)));
  if (ts.isCallExpression(e)) {
    let target = e;
    while (ts.isCallExpression(target) && ts.isPropertyAccessExpression(target.expression)) target = target.expression.expression;
    target = stripTypeWrappers(target);
    if (ts.isArrayLiteralExpression(target) || ts.isTemplateExpression(target) || ts.isStringLiteral(target) || ts.isNoSubstitutionTemplateLiteral(target)) {
      // `.trim()` and `.filter(Boolean).join(' ')` keep the tokens.
      const inner = staticClasses(target, depth, subst);
      return ts.isArrayLiteralExpression(target) ? inner : inner;
    }
    return open(e.arguments.filter((x) => ts.isStringLiteral(x)).flatMap((x) => words(x.text)));
  }
  if (ts.isIdentifier(e) && depth < 3) {
    const v = subst?.(e);
    if (v) return { present: new Set((v.value ?? '').split(/\s+/).filter(Boolean)), complete: true };
    const initNode = localInitializer(e);
    if (initNode) return staticClasses(initNode, depth + 1, subst);
  }
  return open([]);
}

/** What a selector compound can be checked against on one JSX element. */
function describeElement(opening, subst = null, ctx = null) {
  const tag = opening.tagName.getText();
  if (!isIntrinsicTag(opening.tagName, ctx)) {
    const names = new Set();
    let spread = false;
    for (const a of opening.attributes.properties) { if (ts.isJsxSpreadAttribute(a)) spread = true; else names.add(a.name.getText()); }
    return { kind: 'component', tag, passed: { names, spread } };
  }
  let part = null; // null: no data-part; '?': unknown; else the literal
  let classes = { present: new Set(), complete: true };
  for (const a of opening.attributes.properties) {
    if (ts.isJsxSpreadAttribute(a)) {
      const e = stripTypeWrappers(a.expression);
      if (ts.isCallExpression(e) && /(^|\.)partAttributes$/.test(calleeName(e))) {
        const first = e.arguments[0] && stripTypeWrappers(e.arguments[0]);
        part = first && ts.isStringLiteral(first) ? first.text : '?';
        continue;
      }
      part = '?';
      classes = { present: new Set(), complete: false };
      continue;
    }
    const name = a.name.getText();
    if (name === 'data-part') part = staticString(a.initializer, subst) ?? '?';
    else if (name === 'className' || name === 'class') classes = staticClasses(a.initializer, 0, subst);
  }
  const shape = tagShape(opening.tagName, ctx);
  return { kind: 'el', tag: INTRINSIC_TAG.test(tag) ? tag.toLowerCase() : '?', tags: shape.tags, tagPrefix: shape.prefix, tagProp: shape.prop, part, classes, at: opening };
}

/** Preceding siblings of `child` among JSX children, in DOM order; `optional` ones may be absent. */
function precedingSiblings(children, child) {
  const out = [];
  for (const c of children) {
    if (c === child) break;
    if (ts.isJsxText(c)) continue;
    if (ts.isJsxElement(c) || ts.isJsxSelfClosingElement(c)) {
      const d = describeElement(ts.isJsxElement(c) ? c.openingElement : c);
      out.push(d.kind === 'el' ? { ...d, optional: false } : { kind: 'opaque', optional: false });
      continue;
    }
    if (ts.isJsxExpression(c)) {
      if (!c.expression) continue;
      const branches = [];
      const collect = (e) => {
        e = stripTypeWrappers(e);
        if (ts.isBinaryExpression(e) && e.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken) return collect(e.right);
        if (ts.isConditionalExpression(e)) return collect(e.whenTrue) && collect(e.whenFalse);
        if (e.kind === ts.SyntaxKind.NullKeyword || (ts.isIdentifier(e) && e.text === 'undefined') || e.kind === ts.SyntaxKind.FalseKeyword) return true;
        if (ts.isJsxElement(e) || ts.isJsxSelfClosingElement(e)) {
          const d = describeElement(ts.isJsxElement(e) ? e.openingElement : e);
          if (d.kind !== 'el') return false;
          branches.push(d);
          return true;
        }
        return false;
      };
      if (collect(c.expression)) for (const d of branches) out.push({ ...d, optional: true });
      else out.push(OPAQUE_SIBLING);
      continue;
    }
    out.push(OPAQUE_SIBLING);
  }
  return out;
}

const isTagUse = (use) => {
  const p = use.parent;
  return Boolean(p) && (ts.isJsxOpeningElement(p) || ts.isJsxSelfClosingElement(p)) && p.tagName === use;
};

/**
 * Every render path from `start` up to the file's component roots. Each path is
 * `{ conditions, end, chain }`. `end` is `root` (a public export or top-level
 * boundary) or an unanalysable terminal (`callback:*`, `render-prop`,
 * `anonymous`, `unused`, `hop-limit`). `chain` is the JSX ancestry from the
 * stamp's host outward -- intrinsic elements with their definite part/classes
 * and preceding siblings, plus component, prop and portal boundaries -- which a
 * selector's combinators are checked against. `ctx` is `{ sf, file, importersOf }`.
 */
export function renderPaths(start, ctx, hops = 0, visiting = new Set(), opts = {}) {
  const conditions = [];
  const chain = [];
  let sibAcc = opts.sibAcc ?? [];
  let iterated = Boolean(opts.iterated);
  let skipTagElement = Boolean(opts.viaTag);
  let hostDone = Boolean(opts.viaTag || opts.hostDone);
  let hostAt = null;
  let hostAttr = opts.hostAttr ?? null;
  let lastAttr = null;
  let lookup = null;
  let child = start;
  const attach = (sibs) => {
    const top = chain.length > 0 ? chain[chain.length - 1] : opts.outerTop;
    if (top && top.siblings === undefined) top.siblings = [...sibs, ...sibAcc, ...(iterated ? [OPAQUE_SIBLING] : [])];
    sibAcc = [];
    iterated = false;
  };
  const done = (end) => {
    if (lookup) conditions.push(unknownCondition(lookup.node, `object member '${lookup.key}' with no readable selection`, ctx));
    return [{ conditions, end, chain, hostAt, hostAttr }];
  };
  const carry = () => ({ sibAcc, iterated, lookup, hostAt, hostAttr });
  for (let n = start.parent; n; child = n, n = n.parent) {
    if (ts.isBinaryExpression(n) && child === n.right) {
      const op = n.operatorToken.kind;
      if (op === ts.SyntaxKind.AmpersandAmpersandToken) conditions.push(makeCondition('and', n.left, false, ctx));
      else if (op === ts.SyntaxKind.BarBarToken || op === ts.SyntaxKind.QuestionQuestionToken) conditions.push(makeCondition('or', n.left, true, ctx));
    } else if (ts.isConditionalExpression(n) && child !== n.condition) {
      conditions.push(makeCondition('ternary', n.condition, child === n.whenFalse, ctx));
    } else if (ts.isIfStatement(n) && child !== n.expression) {
      conditions.push(makeCondition('if', n.expression, child === n.elseStatement, ctx));
    } else if (ts.isCaseClause(n) && n.parent?.parent && ts.isSwitchStatement(n.parent.parent)) {
      const sw = n.parent.parent;
      const cond = makeCondition('switch', sw.expression, false, ctx);
      conditions.push({ ...cond, text: `${cond.text} === ${text(n.expression)}` });
    } else if (ts.isBlock(n) || ts.isSourceFile(n)) {
      // Early returns before the statement on our path gate everything after them.
      for (const st of n.statements) {
        if (st === child) break;
        if (ts.isIfStatement(st) && !st.elseStatement && containsReturn(st.thenStatement)) conditions.push(makeCondition('early-return', st.expression, true, ctx));
      }
      if (ts.isSourceFile(n)) return done('root');
    }

    // Structure: the JSX ancestry the selector's combinators are checked against.
    if (ts.isJsxAttribute(n)) {
      lastAttr = n.name.getText();
    } else if (ts.isPropertyAssignment(n) && child === n.initializer && lookup === null && ts.isObjectLiteralExpression(n.parent) && isJsxValue(child)) {
      lookup = { key: propertyKeyText(n.name), node: n };
    } else if (ts.isJsxElement(n) || ts.isJsxSelfClosingElement(n)) {
      const opening = ts.isJsxElement(n) ? n.openingElement : n;
      if (!ts.isJsxElement(n) || child === n.openingElement) {
        if (skipTagElement) skipTagElement = false; // a component element: its rendered root is already the chain's top
        else if (!hostDone) { chain.push(describeElement(opening, null, ctx)); hostDone = true; hostAt = conditions.length; hostAttr = lastAttr; }
        else {
          const line = ctx.sf.getLineAndCharacterOfPosition(opening.getStart(ctx.sf)).line + 1;
          const passed = describeElement(opening).passed ?? { names: new Set(), spread: true };
          chain.push({ kind: 'prop', tag: opening.tagName.getText(), prop: lastAttr, file: ctx.file, line, passed });
        }
      } else if (n.children.includes(child)) {
        attach(precedingSiblings(n.children, child));
        chain.push(PORTAL_TAGS.has(opening.tagName.getText()) ? { kind: 'portal', via: opening.tagName.getText() } : { ...describeElement(opening, null, ctx), file: ctx.file, container: true });
      }
    } else if (ts.isJsxFragment(n) && n.children.includes(child)) {
      sibAcc = [...precedingSiblings(n.children, child), ...sibAcc];
    } else if (ts.isCallExpression(n) && n.arguments[0] === child && /(^|\.)createPortal$/.test(calleeName(n))) {
      chain.push({ kind: 'portal', via: 'createPortal' });
    }

    if (isFunctionLike(n)) {
      let outer = n;
      while (outer.parent && ts.isParenthesizedExpression(outer.parent)) outer = outer.parent;
      // An IIFE (`{(() => { ... })()}`) renders in place.
      if (outer.parent && ts.isCallExpression(outer.parent) && outer.parent.expression === outer) { child = outer; n = outer; continue; }
      const fnParent = n.parent;
      if (fnParent && ts.isCallExpression(fnParent) && fnParent.arguments.includes(n)) {
        const callee = calleeName(fnParent);
        const member = ts.isPropertyAccessExpression(fnParent.expression) ? fnParent.expression.name.text : null;
        if (member && ITERATORS.has(member)) {
          conditions.push(makeCondition('iteration', fnParent.expression.expression, false, ctx));
          iterated = true;
          continue;
        }
        if (TRANSPARENT_CALLS.has(callee) || /^Array\.from$/.test(callee)) continue;
        return done(`callback:${callee}`);
      }
      if (fnParent && (ts.isJsxExpression(fnParent) || (fnParent.parent && ts.isJsxAttribute(fnParent.parent)))) return done('render-prop');
      // A named function or a const holding one: follow where it is used.
      let declName = null;
      let declNode = null;
      if (ts.isFunctionDeclaration(n) && n.name) { declName = n.name.text; declNode = n.name; }
      else if (fnParent && ts.isVariableDeclaration(fnParent) && ts.isIdentifier(fnParent.name)) { declName = fnParent.name.text; declNode = fnParent.name; }
      if (!declName) return done('anonymous');
      return followUsages(declName, declNode, conditions, chain, ctx, hops, visiting, carry());
    }
    if (ts.isVariableDeclaration(n) && child === n.initializer && ts.isIdentifier(n.name)) {
      // `const toolbar = <div data-part="toolbar" />`, a useMemo result or a lookup table: follow its reads.
      return followUsages(n.name.text, n.name, conditions, chain, ctx, hops, visiting, carry());
    }
    if (ts.isClassDeclaration(n) || ts.isMethodDeclaration(n)) return done('root');
  }
  return done('root');
}

/** The extra conditions one read of a lookup table adds, or null when the read selects a different member. */
function lookupConditions(use, lookup, ctx) {
  if (!lookup) return [];
  const p = use.parent;
  if (p && ts.isElementAccessExpression(p) && p.expression === use) {
    const arg = p.argumentExpression;
    const lit = stripTypeWrappers(arg);
    if (lit && (ts.isStringLiteral(lit) || ts.isNumericLiteral(lit))) return lit.text === lookup.key ? [] : null;
    return [makeCondition('lookup', arg, false, ctx, `${text(arg)} === ${JSON.stringify(lookup.key)}`)];
  }
  if (p && ts.isPropertyAccessExpression(p) && p.expression === use) return p.name.text === lookup.key ? [] : null;
  return [unknownCondition(use, `object member '${lookup.key}' reached through ${text(p ?? use).slice(0, 60)}`, ctx)];
}

function followUsages(name, declNode, conditions, chain, ctx, hops, visiting, carry) {
  const key = `${ctx.file}:${name}@${declNode.pos}`;
  // Recursion re-entering itself only adds conditions to a path its outer usage already walks.
  if (visiting.has(key)) return [];
  if (hops >= MAX_HOPS) return [{ conditions, end: 'hop-limit', chain, hostAt: carry.hostAt, hostAttr: carry.hostAttr }];
  const next = new Set(visiting).add(key);
  const paths = [];
  const exported = exportNameOf(declNode, ctx.sf);
  if (exported) paths.push(...crossFilePaths(exported, conditions, chain, ctx, hops, next, carry.hostAt, carry.hostAttr));
  const uses = usagesOf(ctx.sf, name, declNode).filter((u) => !ts.isExportAssignment(u.parent));
  if (uses.length === 0 && !exported) return [{ conditions, end: 'unused', chain, hostAt: carry.hostAt, hostAttr: carry.hostAttr }];
  for (const use of uses) {
    const extra = lookupConditions(use, carry.lookup, ctx);
    if (extra === null) continue;
    // Each continuation gets its own copy of the outer top: its siblings are found at this use.
    const head = chain.length > 0 ? [...chain.slice(0, -1), { ...chain[chain.length - 1] }] : [];
    const opts = { hostDone: chain.length > 0, viaTag: isTagUse(use), sibAcc: carry.sibAcc, iterated: carry.iterated, outerTop: head[head.length - 1] };
    for (const p of renderPaths(use, ctx, hops + 1, next, opts)) {
      const hostAt = carry.hostAt ?? (p.hostAt === null ? null : conditions.length + extra.length + p.hostAt);
      paths.push({ conditions: [...conditions, ...extra, ...p.conditions], end: p.end, chain: [...head, ...p.chain], hostAt, hostAttr: carry.hostAttr ?? p.hostAttr });
    }
  }
  return paths;
}

/**
 * An export is followed into the sibling sources that import and render it. A
 * barrel re-export, a dynamic import, or no importer at all means a consumer
 * outside the census may render it directly: that stays an ungated `root`.
 */
function crossFilePaths(exportName, conditions, chain, ctx, hops, visiting, outerHostAt = null, outerHostAttr = null) {
  const importers = ctx.importersOf?.(ctx.file, exportName);
  if (!importers || importers.length === 0) return [{ conditions, end: 'root', chain, hostAt: outerHostAt, hostAttr: outerHostAttr }];
  const paths = [];
  for (const { ctx: other, local } of importers) {
    const uses = usagesOf(other.sf, local, null);
    if (uses.length === 0) continue;
    for (const use of uses) {
      const head = chain.length > 0 ? [...chain.slice(0, -1), { ...chain[chain.length - 1] }] : [];
      for (const p of renderPaths(use, other, hops + 1, visiting, { hostDone: chain.length > 0, viaTag: isTagUse(use), outerTop: head[head.length - 1] })) {
        const hostAt = outerHostAt ?? (p.hostAt === null ? null : conditions.length + p.hostAt);
        paths.push({ conditions: [...conditions, ...p.conditions], end: p.end, chain: [...head, ...p.chain], hostAt, hostAttr: outerHostAttr ?? p.hostAttr });
      }
    }
  }
  return paths.length > 0 ? paths : [{ conditions, end: 'root', chain, hostAt: outerHostAt, hostAttr: outerHostAttr }];
}

export const conditionKey = (c) => `${c.file}:${c.line}:${c.text}`;

/**
 * Gated iff it ends at a root and its gates were never all held ON ONE INSTANCE (a witness).
 * `control` is a positive control or a bare Set of keys (one witness).
 */
export const pathGated = (p, control = new Set()) => {
  if (p.end !== 'root') return false;
  const keys = p.conditions.filter((c) => c.gates).map(conditionKey);
  if (keys.length === 0) return false;
  const witnesses = control instanceof Set ? [control] : control?.witnesses ?? [];
  return !witnesses.some((w) => keys.every((k) => w.has(k)));
};

// ---------------------------------------------------------------------------
// Census
// ---------------------------------------------------------------------------

/**
 * Parse the component tree once. `sites` maps file -> located stamp sites with
 * their render paths; `global` is the static gate's own census over the same files.
 */
export function buildCensus(root = COMPONENTS_ROOT) {
  const files = new Map();
  const global = new Map(); // part -> Set(file), the static gate's census
  for (const file of listSources(root)) {
    const src = readFileSync(join(root, file), 'utf8');
    const gateParts = collectStampedPartsFromSource(src);
    for (const part of gateParts) {
      if (!global.has(part)) global.set(part, new Set());
      global.get(part).add(file);
    }
    files.set(file, { src, gateParts, sites: null, ctx: null });
  }
  const { imports, reexports, publicFiles, importMap, exportFrom } = indexImports(files, root);
  let census = null;
  const ctxOf = (file) => {
    const entry = files.get(file);
    entry.ctx ??= {
      file,
      sf: ts.createSourceFile(file, entry.src, ts.ScriptTarget.Latest, true, file.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS),
      importersOf,
      get census() { return census; },
    };
    return entry.ctx;
  };
  // Render importers of `exportName`, through barrels; null once any hop is public or unimported.
  function importersOf(file, exportName, seen = new Set()) {
    if (publicFiles.has(file) || seen.has(`${file}|${exportName}`)) return null;
    seen.add(`${file}|${exportName}`);
    const out = (imports.get(file) ?? []).filter((i) => i.name === exportName).map((i) => ({ ctx: ctxOf(i.importer), local: i.local }));
    for (const hop of reexports.get(file) ?? []) {
      if (hop.name !== '*' && hop.name !== exportName) continue;
      const further = importersOf(hop.barrel, hop.name === '*' ? exportName : hop.as, seen);
      if (further === null) return null;
      out.push(...further);
    }
    return out.length > 0 ? out : null;
  }
  const sitesOf = (file) => {
    const entry = files.get(file);
    if (entry.sites) return entry.sites;
    const ctx = ctxOf(file);
    entry.sites = findStampSites(ctx.sf, ctx).map((site) => ({
      file,
      part: site.part,
      kind: 'part',
      via: site.via,
      lands: site.lands,
      host: site.host,
      line: ctx.sf.getLineAndCharacterOfPosition(site.node.getStart(ctx.sf)).line + 1,
      paths: renderPaths(site.node, ctx),
    }));
    return entry.sites;
  };
  census = { root, srcRoot: dirname(root), files, global, sitesOf, ctxOf, importMap, exportFrom, resolveSpecifier: (importer, spec) => resolveSpecifier(files, root, importer, spec) };
  return census;
}

/** A relative or `@/` specifier from a census file, resolved to a census file (or null). */
function resolveSpecifier(files, componentsRoot, importer, spec) {
  const srcRoot = dirname(componentsRoot);
  const importerAbs = join(componentsRoot, importer);
  const abs = spec.startsWith('@/') ? join(srcRoot, spec.slice(2)) : spec.startsWith('.') ? join(dirname(importerAbs), spec) : null;
  if (!abs) return null;
  const base = relative(componentsRoot, abs).split(sep).join('/');
  if (base.startsWith('..')) return null;
  return [base, `${base}.tsx`, `${base}.ts`, `${base}/index.tsx`, `${base}/index.ts`].find((c) => files.has(c)) ?? null;
}

/**
 * Import edges into census files, read over the whole `src` tree so a consumer
 * outside `components/` is never missed. `imports` maps a target file to
 * `{ importer, name, local }` render edges; `reexports` maps it to barrel hops
 * `{ barrel, name, as }` (`name` '*' for `export *`). A target imported from
 * outside `components/`, or loaded by a dynamic `import()`, is public.
 * `importMap` (importer -> local -> { target, name }) and `exportFrom`
 * (barrel -> [{ name, as, target }]) are the same edges read forwards.
 */
function indexImports(files, componentsRoot) {
  const srcRoot = dirname(componentsRoot);
  const imports = new Map();
  const reexports = new Map();
  const publicFiles = new Set();
  const importMap = new Map();
  const exportFrom = new Map();
  const push = (map, key, value) => (map.get(key) ?? map.set(key, []).get(key)).push(value);
  const SPEC = `['"]((?:\\.{1,2}|@)\\/[^'"]*)['"]`;
  const IMPORT = new RegExp(`import\\s+(?!type\\b)([A-Za-z_$][\\w$]*)?\\s*,?\\s*(?:\\{([^}]*)\\})?\\s*from\\s*${SPEC}`, 'g');
  const REEXPORT = new RegExp(`export\\s+(?:type\\s+)?(\\*|\\{[^}]*\\})\\s*(?:as\\s+[\\w$]+\\s*)?from\\s*${SPEC}`, 'g');
  const DYNAMIC = new RegExp(`import\\(\\s*${SPEC}`, 'g');
  const specifiers = (list) =>
    list.split(',').map((x) => x.trim().replace(/^type\s+/, '').split(/\s+as\s+/)).filter((x) => x[0]);
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const abs = join(dir, entry.name);
      if (entry.isDirectory()) { if (entry.name !== 'node_modules') walk(abs); continue; }
      if (!isProductionSource(abs)) continue;
      const importer = relative(componentsRoot, abs).split(sep).join('/');
      const inside = files.has(importer);
      const src = inside ? files.get(importer).src : readFileSync(abs, 'utf8');
      const resolveFrom = (spec) => {
        const target = spec.startsWith('@/') ? join(srcRoot, spec.slice(2)) : join(dirname(abs), spec);
        const base = relative(componentsRoot, target).split(sep).join('/');
        if (base.startsWith('..')) return null;
        return [base, `${base}.tsx`, `${base}.ts`, `${base}/index.tsx`, `${base}/index.ts`].find((c) => files.has(c)) ?? null;
      };
      for (const m of src.matchAll(IMPORT)) {
        const target = resolveFrom(m[3]);
        if (!target) continue;
        if (!inside) { publicFiles.add(target); continue; }
        const locals = importMap.get(importer) ?? importMap.set(importer, new Map()).get(importer);
        if (m[1]) { push(imports, target, { importer, name: 'default', local: m[1] }); locals.set(m[1], { target, name: 'default' }); }
        for (const [name, local] of specifiers(m[2] ?? '')) {
          push(imports, target, { importer, name, local: local ?? name });
          locals.set(local ?? name, { target, name });
        }
      }
      for (const m of src.matchAll(REEXPORT)) {
        const target = resolveFrom(m[2]);
        if (!target) continue;
        if (!inside) { publicFiles.add(target); continue; }
        if (m[1] === '*') { push(reexports, target, { barrel: importer, name: '*', as: null }); push(exportFrom, importer, { name: '*', as: null, target }); }
        else for (const [name, as] of specifiers(m[1].slice(1, -1))) { push(reexports, target, { barrel: importer, name, as: as ?? name }); push(exportFrom, importer, { name, as: as ?? name, target }); }
      }
      for (const m of src.matchAll(DYNAMIC)) {
        const target = resolveFrom(m[1]);
        if (target) publicFiles.add(target);
      }
    }
  };
  walk(srcRoot);
  return { imports, reexports, publicFiles, importMap, exportFrom };
}

// ---------------------------------------------------------------------------
// Owner resolution
// ---------------------------------------------------------------------------

/** The component directory a source belongs to: the path above `/engines/`, else its folder. */
const componentDirOf = (file) => {
  const i = file.indexOf('/engines/');
  return i >= 0 ? file.slice(0, i) : dirname(file);
};

const classTokenRe = (cls) => new RegExp(`(^|[^\\w-])${cls.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\w-])`);

/**
 * The owning component directory for a skin row: basename == skin folder name,
 * disambiguated by which component sources carry the selector's leading class.
 * Returns `{ dir }` or `{ dir: null, reason }`. Ambiguity is never guessed.
 */
export function resolveOwner(census, skinFile, selector) {
  const leading = (selector.trim().match(/^\.([a-z0-9_-]+)/i) || [])[1] ?? null;
  const key = `${skinFile}|${leading}`;
  census.ownerCache ??= new Map();
  if (!census.ownerCache.has(key)) census.ownerCache.set(key, computeOwner(census, skinFile, leading));
  return census.ownerCache.get(key);
}

function computeOwner(census, skinFile, leading) {
  const [, name] = skinFile.split('/');
  const allDirs = new Set([...census.files.keys()].map((f) => dirname(f)));
  const nameDirs = new Set();
  for (const d of allDirs) {
    for (let cur = d; cur && cur !== '.'; cur = dirname(cur)) {
      if (cur.split('/').pop() === name && !/(^|\/)engines(\/|$)/.test(cur)) nameDirs.add(cur);
    }
  }
  const classDirs = new Set();
  if (leading) {
    const re = classTokenRe(leading);
    for (const [file, entry] of census.files) if (re.test(entry.src)) classDirs.add(componentDirOf(file));
  }
  const within = (dir, anc) => dir === anc || dir.startsWith(`${anc}/`);
  let owners;
  if (nameDirs.size > 0) {
    if (classDirs.size === 0) owners = [...nameDirs];
    else owners = [...nameDirs].filter((d) => [...classDirs].some((c) => within(c, d)));
    // Nested matches (`data-table` and `data-table/presentation/table`) collapse to the outermost.
    owners = owners.filter((d) => !owners.some((o) => o !== d && within(d, o)));
  } else {
    owners = [...classDirs].filter((d) => ![...classDirs].some((o) => o !== d && within(d, o)));
  }
  if (owners.length === 1) return { dir: owners[0], leading };
  return { dir: null, leading, reason: owners.length === 0 ? `no component resolves skin '${skinFile}' (leading class ${leading ?? 'none'})` : `ambiguous owner for '${skinFile}': ${owners.sort().join(', ')}` };
}

/** The component a source belongs to: its folder above `engines/`, `compound/`, `presentation/`, `runtime/` or `parts/`. */
const componentRootOf = (file) => {
  const dir = componentDirOf(file);
  const m = dir.match(/^(.*?)\/(?:compound|presentation|runtime|parts)(?:\/|$)/);
  return m ? m[1] : dir;
};

/**
 * The owner the class and part census names when the skin folder cannot: walking from
 * the subject compound leftwards, the first DS class or part only ONE component generates.
 * `{ dir }`, or `{ dir: null, reason }` naming the components that share every identifier.
 */
function censusOwner(census, probe) {
  if (!probe) return { dir: null, reason: 'no probe' };
  let shared = null;
  for (const seq of probeSequences(census, probe)) {
    const compounds = seq.filter((x) => typeof x !== 'string').reverse();
    for (const c of compounds) {
      const altClasses = c.alts.flatMap((a) => splitTop(a.args).flatMap((arm) => parseSequence(arm).filter((x) => typeof x !== 'string').flatMap((x) => x.classes)));
      const ids = [...c.classes, ...altClasses].filter(isDsClass).map((cls) => ({ label: `.${cls}`, files: classProducerFiles(census, cls) }));
      ids.push(...c.parts.map((part) => ({ label: `[data-part='${part}']`, files: census.global.get(part) ?? new Set() })));
      for (const id of ids) {
        const roots = [...new Set([...id.files].map(componentRootOf))].sort();
        if (roots.length === 1) return { dir: roots[0], via: id.label };
        if (roots.length > 1 && !shared) shared = { label: id.label, roots };
      }
    }
  }
  if (!shared) return { dir: null, reason: 'no DS class or part of the selector is generated by any component' };
  const listed = shared.roots.length > 4 ? `${shared.roots.slice(0, 4).join(', ')} and ${shared.roots.length - 4} more` : shared.roots.join(', ');
  return { dir: null, reason: `ambiguous owner: every identifier is generated by several components (${shared.label}: ${listed})` };
}

/** Owner production files, minus sibling engines the skin does not paint and compounds its engine reads as data. */
export function ownerFiles(census, dir, engine) {
  const key = `${dir}|${engine}`;
  census.ownerFilesCache ??= new Map();
  if (!census.ownerFilesCache.has(key)) {
    const excluded = EXCLUDED_ENGINES[engine] ?? [];
    const asData = engine === 'agnostic' ? new Set() : consumedAsData(census, dir, engine);
    census.ownerFilesCache.set(key, [...census.files.keys()].filter((f) => f.startsWith(`${dir}/`) && !excluded.some((e) => f.includes(`/engines/${e}/`)) && !asData.has(f)));
  }
  return census.ownerFilesCache.get(key);
}

// ---------------------------------------------------------------------------
// Element-as-data compounds
// ---------------------------------------------------------------------------

/** Whether the branch taken on a displayName match renders the element (clone, create, JSX). */
function displayNameMatchRenders(cmp) {
  const negated = cmp.operatorToken.kind === ts.SyntaxKind.ExclamationEqualsEqualsToken;
  let stmt = cmp.parent;
  while (stmt && !ts.isIfStatement(stmt) && !isFunctionLike(stmt) && !ts.isBlock(stmt)) stmt = stmt.parent;
  if (!stmt || !ts.isIfStatement(stmt)) return true;
  let region;
  if (!negated) region = [stmt.thenStatement];
  else if (containsReturn(stmt.thenStatement) && ts.isBlock(stmt.parent)) region = stmt.parent.statements.slice(stmt.parent.statements.indexOf(stmt) + 1);
  else region = stmt.elseStatement ? [stmt.elseStatement] : [];
  if (region.length === 0) return true;
  return /cloneElement|createElement|<[A-Za-z]/.test(region.map((s) => s.getText()).join('\n'));
}

/** Compound files an engine matches by displayName and reads only as props (never renders): no evidence for its rows. */
function consumedAsData(census, dir, engine) {
  const key = `${dir}|${engine}`;
  census.consumedCache ??= new Map();
  if (census.consumedCache.has(key)) return census.consumedCache.get(key);
  const dataNames = new Set();
  const renderedNames = new Set();
  for (const file of census.files.keys()) {
    if (!file.startsWith(`${dir}/engines/${engine}/`)) continue;
    const visit = (n) => {
      if (ts.isBinaryExpression(n) && (n.operatorToken.kind === ts.SyntaxKind.EqualsEqualsEqualsToken || n.operatorToken.kind === ts.SyntaxKind.ExclamationEqualsEqualsToken)) {
        const [l, r] = [unparen(n.left), unparen(n.right)];
        const lit = ts.isStringLiteral(r) ? r : ts.isStringLiteral(l) ? l : null;
        const other = lit === r ? l : r;
        if (lit && /\bdisplayName\b/.test(other.getText())) (displayNameMatchRenders(n) ? renderedNames : dataNames).add(lit.text);
      }
      ts.forEachChild(n, visit);
    };
    visit(census.ctxOf(file).sf);
  }
  for (const name of renderedNames) dataNames.delete(name);
  const out = new Set();
  if (dataNames.size > 0) {
    for (const [file, entry] of census.files) {
      if (!file.startsWith(`${dir}/`) || file.includes('/engines/')) continue;
      for (const m of entry.src.matchAll(/\.displayName\s*=\s*['"]([^'"]+)['"]/g)) if (dataNames.has(m[1])) out.add(file);
    }
  }
  census.consumedCache.set(key, out);
  return out;
}

// ---------------------------------------------------------------------------
// Class anchors: a skin class the owner produces behind a gate
// ---------------------------------------------------------------------------

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const isDsClass = (c) => /^(ds|rottay)-/.test(c);
const wholeClass = (token) => new RegExp(`(^|[^\\w-])${escapeRe(token)}(?![\\w-])`);
const classPrefixes = (token) => {
  const out = [];
  for (let i = 1; i < token.length; i++) if (token[i - 1] === '-' || token[i - 1] === '_') out.push(token.slice(0, i));
  return out;
};

/**
 * Whether source text can produce a class: the literal word, or a prefix completed by a substitution.
 * `specific` ignores bare namespace prefixes (`ds-${x}`), which would make every class look produced.
 */
function textProducesClass(src, token, { specific = false } = {}) {
  if (wholeClass(token).test(src)) return true;
  return classPrefixes(token)
    .filter((p) => !specific || !/^(ds|rottay)-$/.test(p))
    .some((p) => src.includes(`${p}\${`) || src.includes(`${p}' +`) || src.includes(`${p}" +`));
}

/** Class producers in one source: a literal naming the class, or a template whose static text is its prefix. */
function findClassSites(sf, token) {
  const out = [];
  const word = new RegExp(`(^|\\s)${escapeRe(token)}(?=\\s|$)`);
  const visit = (n) => {
    if (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) {
      if (word.test(n.text)) out.push({ node: n, match: token });
    } else if (ts.isTemplateExpression(n)) {
      const pieces = [n.head.text, ...n.templateSpans.map((s) => s.literal.text)];
      if (pieces.some((p) => word.test(p))) out.push({ node: n, match: token });
      else {
        n.templateSpans.forEach((span, i) => {
          const m = pieces[i].match(/(?:^|\s)([\w-]+)$/);
          const after = span.literal.text;
          if (m && token.startsWith(m[1]) && token.length > m[1].length && (after === '' || /^\s/.test(after))) {
            out.push({ node: n, match: m[1], suffix: token.slice(m[1].length), expr: span.expression });
          }
        });
      }
    }
    ts.forEachChild(n, visit);
  };
  visit(sf);
  return out;
}

const CLASS_ATTRS = new Set(['className', 'class']);

/** The owner-file sites that produce a class, shaped like part stamp sites. */
function classSitesOf(census, file, token, full = false) {
  const entry = census.files.get(file);
  entry.classSites ??= new Map();
  const key = `${token}|${full}`;
  if (entry.classSites.has(key)) return entry.classSites.get(key);
  const ctx = census.ctxOf(file);
  const textual = textProducesClass(entry.src, token) ? findClassSites(ctx.sf, token) : [];
  const covered = (node) => textual.some((s) => s.node.pos >= node.pos && s.node.end <= node.end);
  const derived = tableClassSites(census, file, token).filter((s) => !covered(s.node));
  const sites = [...textual, ...derived].map((s) => {
    const value = s.suffix === undefined ? [] : [makeCondition('class-value', s.expr, false, ctx, `${text(s.expr)} === ${JSON.stringify(s.suffix)}`)];
    // Only gates inside the className expression select the class; the element's own render path is the element's.
    // (A class-only row's subject IS the classed element: there, `full` keeps the element's gates.)
    const own = (p) => (full ? p.conditions : p.conditions.map((c, i) => (p.hostAt !== null && i >= p.hostAt && c.gates ? { ...c, gates: false, element: true } : c)));
    // A utility token is a class only where it reaches its host through `className`; elsewhere it is any string (`data-state="press"`).
    const asClass = (p) => isDsClass(token) || CLASS_ATTRS.has(p.hostAttr);
    const paths = renderPaths(s.node, ctx).filter(asClass).map((p) => ({ ...p, conditions: [...value, ...own(p)] }));
    const hosts = paths.map((p) => p.chain[0]);
    const lands = hosts.length > 0 && hosts.every((h) => h?.kind === 'el');
    return {
      file,
      part: `.${token}`,
      kind: 'class',
      via: s.via ?? 'className',
      match: s.match,
      full,
      lands,
      host: hosts.find((h) => h?.kind === 'component')?.tag ?? null,
      line: ctx.sf.getLineAndCharacterOfPosition(s.node.getStart(ctx.sf)).line + 1,
      paths,
    };
  }).filter((site) => isDsClass(token) || site.paths.length > 0);
  entry.classSites.set(key, sites);
  return sites;
}

// ---------------------------------------------------------------------------
// Class tables: classes a source produces through data it reads, not literals it holds
// ---------------------------------------------------------------------------

/** A module under `src/` resolved from a specifier, parsed once: `{ abs, sf }` or null. */
function moduleAt(census, fromAbs, spec) {
  const base = spec.startsWith('@/') ? join(census.srcRoot, spec.slice(2)) : spec.startsWith('.') ? join(dirname(fromAbs), spec) : null;
  if (!base) return null;
  census.moduleCache ??= new Map();
  for (const abs of [base, `${base}.ts`, `${base}.tsx`, join(base, 'index.ts'), join(base, 'index.tsx')]) {
    if (census.moduleCache.has(abs)) return census.moduleCache.get(abs);
    if (!existsSync(abs) || !/\.tsx?$/.test(abs)) continue;
    const mod = { abs, sf: ts.createSourceFile(abs, readFileSync(abs, 'utf8'), ts.ScriptTarget.Latest, true, abs.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS) };
    census.moduleCache.set(abs, mod);
    return mod;
  }
  return null;
}

/** The initializer of a const a module exports (directly or through re-exports), in any source under `src/`. */
function moduleConst(census, mod, name, seen = new Set()) {
  if (!mod || seen.has(`${mod.abs}|${name}`)) return null;
  seen.add(`${mod.abs}|${name}`);
  for (const st of mod.sf.statements) {
    if (ts.isVariableStatement(st) && hasExportModifier(st)) {
      for (const d of st.declarationList.declarations) if (ts.isIdentifier(d.name) && d.name.text === name && d.initializer) return d.initializer;
    }
    if (!ts.isExportDeclaration(st) || !st.moduleSpecifier || !ts.isStringLiteral(st.moduleSpecifier)) continue;
    const el = st.exportClause && ts.isNamedExports(st.exportClause) ? st.exportClause.elements.find((x) => x.name.text === name) : null;
    if (st.exportClause && !el) continue;
    const found = moduleConst(census, moduleAt(census, mod.abs, st.moduleSpecifier.text), el ? (el.propertyName ?? el.name).text : name, seen);
    if (found) return found;
  }
  return null;
}

/** The object literal an identifier read in a census file evaluates to, through imports reaching outside `components/`. */
function importedObject(census, file, expr) {
  const e = stripTypeWrappers(expr);
  if (!e) return null;
  if (ts.isObjectLiteralExpression(e)) return e;
  if (!ts.isIdentifier(e)) return null;
  const local = localInitializer(e);
  if (local) return importedObject(census, file, local);
  for (const st of census.ctxOf(file).sf.statements) {
    const named = ts.isImportDeclaration(st) && ts.isStringLiteral(st.moduleSpecifier) ? st.importClause?.namedBindings : null;
    const el = named && ts.isNamedImports(named) ? named.elements.find((x) => x.name.text === e.text) : null;
    if (!el) continue;
    const init = moduleConst(census, moduleAt(census, join(census.root, file), st.moduleSpecifier.text), (el.propertyName ?? el.name).text);
    const obj = stripTypeWrappers(init);
    return obj && ts.isObjectLiteralExpression(obj) ? obj : null;
  }
  return null;
}

const literalWords = (n) => {
  n = stripTypeWrappers(n);
  if (!n) return null;
  if (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) return n.text.split(/\s+/).filter(Boolean);
  if (ts.isArrayLiteralExpression(n)) {
    const out = [];
    for (const x of n.elements) { const w = literalWords(x); if (!w) return null; out.push(...w); }
    return out;
  }
  return null;
};

/** Recipe bindings of a source (`const r = defineRecipe(DEF)`): local -> slot -> classes. Unreadable slots are absent. */
function recipeSlotsOf(census, file) {
  const entry = census.files.get(file);
  if (entry.recipeSlots) return entry.recipeSlots;
  const out = new Map();
  const visit = (n) => {
    if (ts.isVariableDeclaration(n) && ts.isIdentifier(n.name) && n.initializer) {
      const call = stripTypeWrappers(n.initializer);
      if (call && ts.isCallExpression(call) && /(^|\.)defineRecipe$/.test(calleeName(call)) && call.arguments[0]) {
        const def = importedObject(census, file, call.arguments[0]);
        const slots = def?.properties.find((p) => ts.isPropertyAssignment(p) && propertyKeyText(p.name) === 'slots');
        const table = slots && stripTypeWrappers(slots.initializer);
        if (table && ts.isObjectLiteralExpression(table)) {
          const map = new Map();
          for (const p of table.properties) {
            const words = ts.isPropertyAssignment(p) ? literalWords(p.initializer) : null;
            if (words) map.set(propertyKeyText(p.name), words);
          }
          out.set(n.name.text, map);
        }
      }
    }
    ts.forEachChild(n, visit);
  };
  visit(census.ctxOf(file).sf);
  entry.recipeSlots = out;
  return out;
}

/** `windowFor('x').pairs` style: a local finder over a const array of object literals, selected by a literal. */
function finderSelection(census, file, call) {
  const callee = stripTypeWrappers(call.expression);
  const arg = stripTypeWrappers(call.arguments[0]);
  if (!ts.isIdentifier(callee) || !arg || !ts.isStringLiteral(arg)) return null;
  const decl = resolveLocalBinding(census, file, callee.text, new Set());
  const fn = decl && stripTypeWrappers(decl.node);
  if (!fn || !isFunctionLike(fn) || !fn.body || fn.parameters.length !== 1 || !ts.isIdentifier(fn.parameters[0].name)) return null;
  const param = fn.parameters[0].name.text;
  let picked = null;
  const visit = (n) => {
    if (picked !== null) return;
    if (ts.isCallExpression(n) && ts.isPropertyAccessExpression(n.expression) && n.expression.name.text === 'find' && n.arguments[0] && ts.isArrowFunction(n.arguments[0])) {
      const cb = n.arguments[0];
      const body = stripTypeWrappers(cb.body);
      const item = cb.parameters[0] && ts.isIdentifier(cb.parameters[0].name) ? cb.parameters[0].name.text : null;
      if (item && body && ts.isBinaryExpression(body) && body.operatorToken.kind === ts.SyntaxKind.EqualsEqualsEqualsToken) {
        const [l, r] = [stripTypeWrappers(body.left), stripTypeWrappers(body.right)];
        const access = ts.isPropertyAccessExpression(l) && ts.isIdentifier(r) && r.text === param ? l : ts.isPropertyAccessExpression(r) && ts.isIdentifier(l) && l.text === param ? r : null;
        const list = access && ts.isIdentifier(access.expression) && access.expression.text === item ? stripTypeWrappers(localInitializer(stripTypeWrappers(n.expression.expression))) : null;
        if (list && ts.isArrayLiteralExpression(list)) {
          const keyName = access.name.text;
          picked = list.elements.map(stripTypeWrappers).find((o) => o && ts.isObjectLiteralExpression(o) && o.properties.some((p) => ts.isPropertyAssignment(p) && propertyKeyText(p.name) === keyName && ts.isStringLiteral(stripTypeWrappers(p.initializer)) && stripTypeWrappers(p.initializer).text === arg.text)) ?? false;
        }
      }
    }
    ts.forEachChild(n, visit);
  };
  visit(fn.body);
  return picked || null;
}

/**
 * Pair tables (`const T = pairedClasses(PAIRS)`) visible to a census file: local -> key -> classes.
 * `pairedClasses` must have the pairing shape: each `[key, value]` of its argument maps to `\`${value} ${key}\``.
 */
function pairedTablesOf(census, file) {
  const entry = census.files.get(file);
  if (entry.pairedTables) return entry.pairedTables;
  const out = new Map();
  const locals = new Set([...(census.importMap.get(file)?.keys() ?? [])]);
  for (const st of census.ctxOf(file).sf.statements) if (ts.isVariableStatement(st)) for (const d of st.declarationList.declarations) if (ts.isIdentifier(d.name)) locals.add(d.name.text);
  for (const local of locals) {
    const decl = resolveLocalBinding(census, file, local, new Set());
    const call = decl && stripTypeWrappers(decl.node);
    if (!call || !ts.isCallExpression(call) || !ts.isIdentifier(call.expression) || call.arguments.length !== 1) continue;
    const pairer = resolveLocalBinding(census, decl.file, call.expression.text, new Set());
    const fn = pairer && stripTypeWrappers(pairer.node);
    if (!fn || !isFunctionLike(fn) || !fn.body || !fn.parameters[0] || !ts.isIdentifier(fn.parameters[0].name)) continue;
    const body = fn.body.getText();
    const m = body.match(new RegExp(`for\\s*\\(\\s*const\\s*\\[\\s*(\\w+)\\s*,\\s*(\\w+)\\s*\\]\\s*of\\s*Object\\.entries\\(\\s*${escapeRe(fn.parameters[0].name.text)}\\s*\\)\\s*\\)`));
    if (!m || !body.includes(`\`\${${m[2]}} \${${m[1]}}\``)) continue;
    let arg = stripTypeWrappers(call.arguments[0]);
    if (arg && ts.isPropertyAccessExpression(arg) && ts.isCallExpression(stripTypeWrappers(arg.expression))) {
      const picked = finderSelection(census, decl.file, stripTypeWrappers(arg.expression));
      const prop = picked?.properties.find((p) => ts.isPropertyAssignment(p) && propertyKeyText(p.name) === arg.name.text);
      arg = prop ? stripTypeWrappers(prop.initializer) : null;
    } else {
      arg = constObject(census, decl.file, arg)?.node ?? null;
    }
    if (!arg || !ts.isObjectLiteralExpression(arg)) continue;
    const table = new Map();
    for (const p of arg.properties) {
      const v = ts.isPropertyAssignment(p) ? stripTypeWrappers(p.initializer) : null;
      const k = ts.isPropertyAssignment(p) ? propertyKeyText(p.name) : null;
      if (k && v && ts.isStringLiteral(v)) table.set(k, [v.text, k]);
    }
    out.set(local, table);
  }
  entry.pairedTables = out;
  return out;
}

/** Sites in a census file that produce a class through a recipe slot table or a pair table. */
function tableClassSites(census, file, token) {
  const recipes = recipeSlotsOf(census, file);
  const pairs = pairedTablesOf(census, file);
  if (recipes.size === 0 && pairs.size === 0) return [];
  const out = [];
  const visit = (n) => {
    if (ts.isCallExpression(n) && ts.isPropertyAccessExpression(n.expression) && n.expression.name.text === 'resolve' && ts.isIdentifier(n.expression.expression) && recipes.has(n.expression.expression.text)) {
      const slots = recipes.get(n.expression.expression.text);
      const pick = n.parent && ts.isPropertyAccessExpression(n.parent) && n.parent.expression === n ? n.parent.name.text : null;
      const words = pick ? slots.get(pick) ?? [] : [...slots.values()].flat();
      if (words.includes(token)) out.push({ node: n, match: `${n.expression.expression.text}.resolve`, via: 'recipe-slot' });
    } else if ((ts.isElementAccessExpression(n) || ts.isPropertyAccessExpression(n)) && ts.isIdentifier(n.expression) && pairs.has(n.expression.text)) {
      const keyNode = ts.isElementAccessExpression(n) ? stripTypeWrappers(n.argumentExpression) : n.name;
      const k = keyNode && (ts.isStringLiteral(keyNode) || ts.isIdentifier(keyNode)) ? keyNode.text : null;
      if (k && pairs.get(n.expression.text).get(k)?.includes(token)) out.push({ node: n, match: k, via: 'class-window' });
    }
    ts.forEachChild(n, visit);
  };
  visit(census.ctxOf(file).sf);
  return out;
}

/** Census files that can produce a class token (namespace-only templates aside). */
function classProducerFiles(census, token) {
  census.classProducers ??= new Map();
  if (!census.classProducers.has(token)) {
    census.classProducers.set(token, new Set([...census.files].filter(([, e]) => textProducesClass(e.src, token, { specific: true })).map(([f]) => f)));
  }
  return census.classProducers.get(token);
}

/** Whether ANY production source under `src/` can produce the class (the orphan test reads beyond components). */
function classGeneratedAnywhere(census, token) {
  if (!census.codeCorpus) {
    const corpus = [];
    const walk = (dir) => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const abs = join(dir, entry.name);
        if (entry.isDirectory()) { if (entry.name !== 'node_modules') walk(abs); }
        else if (isProductionSource(abs)) corpus.push(readFileSync(abs, 'utf8'));
      }
    };
    walk(census.srcRoot);
    census.codeCorpus = corpus;
  }
  return census.codeCorpus.some((src) => textProducesClass(src, token, { specific: true }));
}

// ---------------------------------------------------------------------------
// Component resolution: forwarding (does a host pass `data-part` / `className`
// to the DOM?) and portaled props (does a host render a prop in a portal?)
// ---------------------------------------------------------------------------

const MAX_COMPONENT_DEPTH = 5;
const ENGINE_KEYS = ['modern', 'rustic', 'classic'];
// Third-party overlays that render these props in a body-level portal unless a container is passed.
const THIRD_PARTY_PORTALS = { antd: { Popover: ['content', 'title'], Tooltip: ['title'], Popconfirm: ['title', 'description'], Dropdown: ['menu', 'dropdownRender', 'overlay'], Modal: ['children', 'title', 'footer'], Drawer: ['children', 'title', 'footer'] } };
const PORTAL_CONTAINER_ATTRS = new Set(['getPopupContainer', 'getContainer']);

const hasExportModifier = (n) => (ts.canHaveModifiers?.(n) ? ts.getModifiers(n) ?? [] : []).some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
const hasDefaultModifier = (n) => (ts.canHaveModifiers?.(n) ? ts.getModifiers(n) ?? [] : []).some((m) => m.kind === ts.SyntaxKind.DefaultKeyword);

/** A top-level binding of `name` in a census file: `{ file, node }` (a function or an initializer), following imports. */
function resolveLocalBinding(census, file, name, seen) {
  const { sf } = census.ctxOf(file);
  for (const st of sf.statements) {
    if (ts.isFunctionDeclaration(st) && st.name?.text === name) return { file, node: st };
    if (ts.isVariableStatement(st)) for (const d of st.declarationList.declarations) if (ts.isIdentifier(d.name) && d.name.text === name && d.initializer) return { file, node: d.initializer };
  }
  const imported = census.importMap.get(file)?.get(name);
  return imported ? resolveExport(census, imported.target, imported.name, seen) : null;
}

/** The declaration behind an export of a census file, following re-export barrels. */
function resolveExport(census, file, exportName, seen = new Set()) {
  const key = `${file}|${exportName}`;
  if (seen.has(key)) return null;
  seen.add(key);
  const { sf } = census.ctxOf(file);
  for (const st of sf.statements) {
    if (exportName === 'default' && ts.isExportAssignment(st)) return ts.isIdentifier(st.expression) ? resolveLocalBinding(census, file, st.expression.text, seen) : { file, node: st.expression };
    if (ts.isFunctionDeclaration(st) && hasExportModifier(st) && (exportName === 'default' ? hasDefaultModifier(st) : st.name?.text === exportName)) return { file, node: st };
    if (ts.isVariableStatement(st) && hasExportModifier(st)) for (const d of st.declarationList.declarations) if (ts.isIdentifier(d.name) && d.name.text === exportName && d.initializer) return { file, node: d.initializer };
    if (ts.isExportDeclaration(st) && !st.moduleSpecifier && st.exportClause && ts.isNamedExports(st.exportClause)) {
      for (const el of st.exportClause.elements) if (el.name.text === exportName) return resolveLocalBinding(census, file, (el.propertyName ?? el.name).text, seen);
    }
  }
  for (const hop of census.exportFrom.get(file) ?? []) {
    if (hop.name === '*' || hop.as === exportName) {
      const found = resolveExport(census, hop.target, hop.name === '*' ? exportName : hop.name, seen);
      if (found) return found;
    }
  }
  return null;
}

/** `{ file, node }` for a JSX tag used in a census file (`Popover`, `Card.Header`), or null. */
function resolveTag(census, file, tag) {
  const [base, ...members] = tag.split('.');
  let decl = resolveLocalBinding(census, file, base, new Set());
  for (const member of members) {
    if (!decl) return null;
    const node = stripTypeWrappers(decl.node);
    const obj = node && ts.isCallExpression(node) && /(^|\.)assign$/.test(calleeName(node)) ? stripTypeWrappers(node.arguments[1]) : null;
    const prop = obj && ts.isObjectLiteralExpression(obj) ? obj.properties.find((p) => (ts.isPropertyAssignment(p) || ts.isShorthandPropertyAssignment(p)) && p.name.getText() === member) : null;
    if (!prop) return null;
    const value = ts.isShorthandPropertyAssignment(prop) ? prop.name : stripTypeWrappers(prop.initializer);
    decl = ts.isIdentifier(value) ? resolveLocalBinding(census, decl.file, value.text, new Set()) : { file: decl.file, node: value };
  }
  return decl;
}

/** The functions a component declaration renders through, per engine: `[{ file, fn }]`, or null when unreadable. */
function componentFunctions(census, decl, engine, depth = 0) {
  if (!decl || depth > MAX_COMPONENT_DEPTH) return null;
  const node = stripTypeWrappers(decl.node);
  if (!node) return null;
  if (ts.isFunctionDeclaration(node) || ts.isArrowFunction(node) || ts.isFunctionExpression(node)) return [{ file: decl.file, fn: node }];
  if (ts.isIdentifier(node)) return componentFunctions(census, resolveLocalBinding(census, decl.file, node.text, new Set()), engine, depth + 1);
  if (ts.isCallExpression(node)) {
    const callee = calleeName(node);
    if (/(^|\.)(forwardRef|memo)$/.test(callee) || /(^|\.)assign$/.test(callee)) return componentFunctions(census, { file: decl.file, node: node.arguments[0] }, engine, depth + 1);
    if (/(^|\.)createEngineComponent$/.test(callee)) {
      const map = stripTypeWrappers(node.arguments[1]);
      if (!map || !ts.isObjectLiteralExpression(map)) return null;
      const engines = engine === 'agnostic' ? ENGINE_KEYS : [engine];
      const out = [];
      for (const key of engines) {
        const prop = map.properties.find((p) => ts.isPropertyAssignment(p) && p.name.getText() === key);
        if (!prop) { if (engine === 'agnostic') continue; return null; }
        const spec = prop.initializer.getText().match(/import\(\s*['"]([^'"]+)['"]\s*\)/)?.[1];
        const target = spec ? census.resolveSpecifier(decl.file, spec) : null;
        const fns = target ? componentFunctions(census, resolveExport(census, target, 'default'), key, depth + 1) : null;
        if (!fns) return null;
        out.push(...fns);
      }
      return out.length > 0 ? out : null;
    }
  }
  return null;
}

/** The local a component binds `prop` to, its rest binding and its props identifier. */
function propBindings(fn, prop) {
  const out = { local: null, rest: null, props: null };
  const read = (pattern) => {
    for (const el of pattern.elements) {
      if (el.dotDotDotToken) { if (ts.isIdentifier(el.name)) out.rest = el.name.text; continue; }
      const key = el.propertyName ? propertyKeyText(el.propertyName) : ts.isIdentifier(el.name) ? el.name.text : null;
      if (key === prop && ts.isIdentifier(el.name)) out.local = el.name.text;
    }
  };
  const param = fn.parameters[0];
  if (!param) return out;
  if (ts.isObjectBindingPattern(param.name)) read(param.name);
  else if (ts.isIdentifier(param.name)) {
    out.props = param.name.text;
    const visit = (n) => {
      if (ts.isVariableDeclaration(n) && ts.isObjectBindingPattern(n.name) && n.initializer && unparen(n.initializer).getText() === out.props) read(n.name);
      if (n !== fn && isFunctionLike(n)) return;
      ts.forEachChild(n, visit);
    };
    if (fn.body) visit(fn.body);
  }
  return out;
}

const refersTo = (node, name) => {
  let hit = false;
  const visit = (n) => { if (hit) return; if (ts.isIdentifier(n) && n.text === name) { hit = true; return; } ts.forEachChild(n, visit); };
  visit(node);
  return hit;
};

/** The JSX opening element an attribute or spread belongs to. */
const ownerOpening = (attr) => { let n = attr.parent; while (n && !ts.isJsxOpeningElement(n) && !ts.isJsxSelfClosingElement(n)) n = n.parent; return n; };

/** Whether a component forwards `prop` (`data-part` or `className`) to a DOM element under an engine. */
function hostForwards(census, file, tag, prop, engine, depth = 0) {
  const key = `${file}|${tag}|${prop}|${engine}`;
  census.forwardCache ??= new Map();
  if (census.forwardCache.has(key)) return census.forwardCache.get(key);
  census.forwardCache.set(key, false);
  let result = false;
  if (depth <= MAX_COMPONENT_DEPTH) {
    const fns = componentFunctions(census, resolveTag(census, file, tag), engine);
    result = Boolean(fns) && fns.length > 0 && fns.every(({ file: f, fn }) => functionForwards(census, f, fn, prop, engine, depth));
  }
  census.forwardCache.set(key, result);
  return result;
}

function functionForwards(census, file, fn, prop, engine, depth) {
  const { local, rest, props } = propBindings(fn, prop);
  const elementForwards = (opening) => isIntrinsicTag(opening.tagName) || hostForwards(census, file, opening.tagName.getText(), prop, engine, depth + 1);
  let ok = false;
  const visit = (n) => {
    if (ok) return;
    if (local) {
      if (ts.isJsxAttribute(n) && n.name.getText() === prop && n.initializer && refersTo(n.initializer, local) && elementForwards(ownerOpening(n))) { ok = true; return; }
      if (prop === 'data-part' && ts.isCallExpression(n) && /(^|\.)partAttributes$/.test(calleeName(n)) && n.arguments.some((a) => refersTo(a, local))) { ok = true; return; }
      if (ts.isPropertyAssignment(n) && propertyKeyText(n.name) === prop && refersTo(n.initializer, local)) { ok = true; return; }
    } else {
      const spread = rest ?? props;
      if (spread && ts.isJsxSpreadAttribute(n) && unparen(n.expression).getText() === spread) {
        const opening = ownerOpening(n);
        const attrs = opening.attributes.properties;
        const after = attrs.slice(attrs.indexOf(n) + 1);
        const overridden = after.some((a) => (ts.isJsxAttribute(a) && a.name.getText() === prop) || (prop === 'data-part' && ts.isJsxSpreadAttribute(a) && /partAttributes/.test(a.expression.getText())));
        if (!overridden && elementForwards(opening)) { ok = true; return; }
      }
    }
    ts.forEachChild(n, visit);
  };
  if (fn.body) visit(fn.body);
  return ok;
}

/** Local names a file imports from a bare package, e.g. `{ Popover as AntPopover } from 'antd'`. */
function packageImports(src, pkg) {
  const out = new Map();
  for (const m of src.matchAll(new RegExp(`import\\s*\\{([^}]*)\\}\\s*from\\s*['"]${escapeRe(pkg)}['"]`, 'g'))) {
    for (const spec of m[1].split(',')) {
      const [name, local] = spec.trim().replace(/^type\s+/, '').split(/\s+as\s+/);
      if (name) out.set(local ?? name, name);
    }
  }
  return out;
}

/** Whether every engine of a host renders its `prop` only inside a portal (so it never sits under the host). */
function propPortaled(census, file, tag, prop, engine, depth = 0) {
  const key = `${file}|${tag}|${prop}|${engine}`;
  census.portalCache ??= new Map();
  if (census.portalCache.has(key)) return census.portalCache.get(key);
  census.portalCache.set(key, false);
  let result = false;
  if (depth <= MAX_COMPONENT_DEPTH && prop) {
    const fns = componentFunctions(census, resolveTag(census, file, tag), engine);
    result = Boolean(fns) && fns.length > 0 && fns.every(({ file: f, fn }) => functionPortalsProp(census, f, fn, prop, engine, depth));
  }
  census.portalCache.set(key, result);
  return result;
}

function functionPortalsProp(census, file, fn, prop, engine, depth) {
  const { local } = propBindings(fn, prop);
  if (!local || !fn.body) return false;
  const third = new Map(Object.entries(THIRD_PARTY_PORTALS).flatMap(([pkg, table]) => [...packageImports(census.files.get(file).src, pkg)].filter(([, name]) => table[name]).map(([l, name]) => [l, table[name]])));
  const reads = [];
  const visit = (n) => {
    if (ts.isIdentifier(n) && n.text === local && !(ts.isBindingElement(n.parent) || ts.isPropertyAccessExpression(n.parent) && n.parent.name === n)) reads.push(n);
    ts.forEachChild(n, visit);
  };
  visit(fn.body);
  if (reads.length === 0) return false;
  return reads.every((read) => {
    for (let n = read.parent; n && n !== fn; n = n.parent) {
      if (ts.isJsxElement(n) && PORTAL_TAGS.has(n.openingElement.tagName.getText())) return true;
      if (ts.isCallExpression(n) && /(^|\.)createPortal$/.test(calleeName(n))) return true;
      if (ts.isJsxAttribute(n)) {
        const opening = ownerOpening(n);
        const tagName = opening.tagName.getText();
        const attrName = n.name.getText();
        const table = third.get(tagName);
        if (table) return table.includes(attrName) && !opening.attributes.properties.some((a) => ts.isJsxAttribute(a) && PORTAL_CONTAINER_ATTRS.has(a.name.getText()));
        if (!isIntrinsicTag(opening.tagName)) return propPortaled(census, file, tagName, attrName, engine, depth + 1);
        return false;
      }
    }
    return false;
  });
}

// Third-party overlays that mount these props only once opened, unless an open or force attribute says otherwise.
const THIRD_PARTY_LAZY = { antd: { Popover: ['content', 'title'], Tooltip: ['title'], Popconfirm: ['title', 'description'], Dropdown: ['menu', 'dropdownRender', 'overlay'], Modal: ['children', 'title', 'footer'], Drawer: ['children', 'title', 'footer'] } };
const LAZY_OPEN_ATTRS = ['open', 'defaultOpen', 'visible', 'defaultVisible'];
const LAZY_FORCE_ATTRS = ['forceRender', 'forceMount'];

/**
 * The gate a host puts on a prop it renders, as seen from one call site: every engine renders
 * every read of the prop behind a condition that call site does not set (the host's own state,
 * or a prop it neither passes nor defaults). `{ text, names }`, or null when any read escapes.
 */
function propMountGate(census, file, tag, prop, engine, passed, depth = 0) {
  if (!prop || !tag || !passed || passed.spread || depth > MAX_COMPONENT_DEPTH) return null;
  const key = `${file}|${tag}|${prop}|${engine}|${[...passed.names].sort().join(',')}`;
  census.mountGateCache ??= new Map();
  if (census.mountGateCache.has(key)) return census.mountGateCache.get(key);
  census.mountGateCache.set(key, null);
  let result = null;
  const fns = componentFunctions(census, resolveTag(census, file, tag), engine);
  if (fns && fns.length > 0) {
    const gates = [];
    for (const { file: f, fn } of fns) {
      const gate = functionMountGate(census, f, fn, prop, engine, passed, depth);
      if (!gate) { gates.length = 0; break; }
      gates.push(gate);
    }
    if (gates.length > 0) {
      const names = [...new Map(gates.flatMap((g) => g.names).map((n) => [`${n.kind}:${n.name}`, n])).values()];
      result = { text: [...new Set(gates.map((g) => g.text))].join(' | '), names };
    }
  }
  census.mountGateCache.set(key, result);
  return result;
}

function functionMountGate(census, file, fn, prop, engine, passed, depth) {
  const { local } = propBindings(fn, prop);
  if (!local || !fn.body) return null;
  const ctx = census.ctxOf(file);
  const bound = destructuredProps(fn);
  // An unpassed prop is unset at rest unless its default is truthy (`defaultOpen = false` stays unset).
  const falsy = (d) => { d = stripTypeWrappers(d); return d.kind === ts.SyntaxKind.FalseKeyword || d.kind === ts.SyntaxKind.NullKeyword || (ts.isIdentifier(d) && d.text === 'undefined'); };
  const truthyDefault = new Set([...bound.values()].filter((b) => b.def && !falsy(b.def)).map((b) => b.prop));
  const outerProp = (name) => !passed.names.has(name) && !truthyDefault.has(name) && name !== prop;
  // A state counts only when its initial value reads nothing the call site sets.
  const stateUnset = (name) => {
    let ok = false;
    const visit = (n) => {
      if (ok) return;
      if (ts.isVariableDeclaration(n) && n.initializer && ts.isCallExpression(unparen(n.initializer)) && bindingIn(n.name, name)) {
        ok = unparen(n.initializer).arguments.every((a) => resolveNames(a).every((x) => x.kind === 'prop' ? outerProp(x.name) : x.kind !== 'free'));
        return;
      }
      ts.forEachChild(n, visit);
    };
    visit(fn.body);
    return ok;
  };
  const counts = (c) => c.gates && c.names.length > 0 && c.names.every((n) => (n.kind === 'state' ? stateUnset(n.name) : n.kind === 'prop' && outerProp(n.name)));
  const [from, to] = [fn.getStart(ctx.sf), fn.getEnd()];
  const lineOf = (pos) => ctx.sf.getLineAndCharacterOfPosition(pos).line + 1;
  const [fromLine, toLine] = [lineOf(from), lineOf(to)];
  const reads = [];
  const visit = (n) => {
    if (ts.isIdentifier(n) && n.text === local) {
      const p = n.parent;
      const isName = (ts.isBindingElement(p) && (p.name === n || p.propertyName === n)) || (ts.isPropertyAccessExpression(p) && p.name === n) || (ts.isPropertyAssignment(p) && p.name === n) || (ts.isJsxAttribute(p) && p.name === n);
      if (!isName) reads.push(n);
    }
    ts.forEachChild(n, visit);
  };
  visit(fn.body);
  if (reads.length === 0) return null;
  const third = new Map(Object.entries(THIRD_PARTY_LAZY).flatMap(([pkg, table]) => [...packageImports(census.files.get(file).src, pkg)].filter(([, name]) => table[name]).map(([l, name]) => [l, table[name]])));
  const texts = new Set();
  const names = [];
  for (const read of reads) {
    let expr = read;
    while (expr.parent && (ts.isParenthesizedExpression(expr.parent) || ts.isAsExpression(expr.parent) || ts.isNonNullExpression(expr.parent))) expr = expr.parent;
    const holder = expr.parent;
    if (!holder || !ts.isJsxExpression(holder)) return null;
    if (ts.isJsxAttribute(holder.parent)) {
      const opening = ownerOpening(holder.parent);
      const tagName = opening.tagName.getText();
      const attr = holder.parent.name.getText();
      if (isIntrinsicTag(opening.tagName, ctx)) return null;
      const table = third.get(tagName);
      if (table) {
        if (!table.includes(attr)) return null;
        const attrs = opening.attributes.properties;
        if (attrs.some((a) => ts.isJsxSpreadAttribute(a) || LAZY_FORCE_ATTRS.includes(a.name.getText()))) return null;
        for (const a of attrs) {
          if (!LAZY_OPEN_ATTRS.includes(a.name.getText())) continue;
          const v = a.initializer && ts.isJsxExpression(a.initializer) ? stripTypeWrappers(a.initializer.expression) : null;
          const via = v && ts.isIdentifier(v) ? bound.get(v.text) : null;
          if (!via || !outerProp(via.prop)) return null;
          names.push({ name: via.prop, kind: 'prop' });
        }
        texts.add(`${tagName}.${attr} mounts once opened`);
        names.push({ name: `${tagName}:open`, kind: 'state' });
        continue;
      }
      const inner = propMountGate(census, file, tagName, attr, engine, describeElement(opening).passed, depth + 1);
      if (!inner) return null;
      texts.add(inner.text);
      names.push(...inner.names);
      continue;
    }
    const parent = holder.parent;
    if (!parent || !(ts.isJsxElement(parent) || ts.isJsxFragment(parent)) || !parent.children.includes(holder)) return null;
    for (const p of renderPaths(read, ctx)) {
      if (p.end !== 'root') return null;
      const own = p.conditions.filter((c) => c.file === file && c.line >= fromLine && c.line <= toLine && counts(c));
      if (own.length === 0) return null;
      for (const c of own) { texts.add(c.text); names.push(...c.names); }
    }
  }
  return { text: [...texts].join(' & '), names };
}

// ---------------------------------------------------------------------------
// Selector structure
// ---------------------------------------------------------------------------

const ALTERNATION_FNS = new Set(['is', 'where', 'matches', '-webkit-any', 'has']);

function closeOf(s, i, open, close) {
  let depth = 0;
  for (; i < s.length; i++) {
    const ch = s[i];
    if (ch === '\\') { i++; continue; }
    if (ch === '"' || ch === "'") { for (i++; i < s.length && s[i] !== ch; i++) if (s[i] === '\\') i++; continue; }
    if (ch === open) depth++;
    else if (ch === close && --depth === 0) return i + 1;
  }
  return s.length;
}

function splitTop(s) {
  const out = [];
  let from = 0;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (ch === '\\') i++;
    else if (ch === '[') i = closeOf(s, i, '[', ']') - 1;
    else if (ch === '(') i = closeOf(s, i, '(', ')') - 1;
    else if (ch === ',') { out.push(s.slice(from, i)); from = i + 1; }
  }
  out.push(s.slice(from));
  return out.map((x) => x.trim()).filter(Boolean);
}

/** One complex selector as `[compound, combinator, compound, ...]`; a compound is `{ tag, classes, parts, notClasses, alts }`. */
function parseSequence(s) {
  const seq = [];
  let cur = null;
  const compound = () => (cur ??= { tag: null, classes: [], parts: [], notClasses: [], alts: [] });
  const flush = () => { if (cur) { seq.push(cur); cur = null; } };
  let i = 0;
  while (i < s.length) {
    const ch = s[i];
    if (/[\s>+~]/.test(ch)) {
      let j = i;
      while (j < s.length && /[\s>+~]/.test(s[j])) j++;
      const comb = s.slice(i, j).trim() || ' ';
      flush();
      if (seq.length === 0) seq.push({ tag: null, classes: [], parts: [], notClasses: [], alts: [] });
      seq.push(comb);
      i = j;
      continue;
    }
    if (ch === '[') {
      const j = closeOf(s, i, '[', ']');
      const m = s.slice(i, j).match(/^\[\s*data-part\s*=\s*["']?([\w-]+)["']?\s*\]$/);
      if (m) compound().parts.push(m[1]);
      else compound();
      i = j;
    } else if (ch === ':') {
      const element = s[i + 1] === ':';
      let j = i + (element ? 2 : 1);
      const start = j;
      while (j < s.length && /[\w-]/.test(s[j])) j++;
      const name = s.slice(start, j).toLowerCase();
      let args = null;
      if (s[j] === '(') { const k = closeOf(s, j, '(', ')'); args = s.slice(j + 1, k - 1); j = k; }
      const c = compound();
      if (!element && name === 'not' && args !== null) for (const arm of splitTop(args)) { const m = arm.match(/^\.([\w-]+)$/); if (m) c.notClasses.push(m[1]); }
      else if (!element && ALTERNATION_FNS.has(name) && args !== null) c.alts.push({ name, args });
      i = j;
    } else if (ch === '.') {
      let j = i + 1;
      while (j < s.length && /[\w-]/.test(s[j])) j++;
      compound().classes.push(s.slice(i + 1, j));
      i = j;
    } else if (ch === '#') {
      let j = i + 1;
      while (j < s.length && /[\w-]/.test(s[j])) j++;
      compound();
      i = j;
    } else if (/[a-zA-Z]/.test(ch)) {
      let j = i;
      while (j < s.length && /[\w-]/.test(s[j])) j++;
      compound().tag = s.slice(i, j).toLowerCase();
      i = j;
    } else {
      compound();
      i += 1;
    }
  }
  flush();
  while (typeof seq[seq.length - 1] === 'string') seq.pop();
  return seq;
}

/**
 * A skeleton's anchors: `parts`/`classes` are required outright; each `groups` entry is an
 * alternation (`:is()`, `:has()`, a list) whose arms are alternatives -- one arm suffices.
 */
export function anchorTree(skeleton) {
  const arms = splitTop(skeleton);
  if (arms.length > 1) return { parts: [], classes: [], groups: [arms.map(anchorTree)] };
  const node = { parts: [], classes: [], groups: [] };
  for (const item of parseSequence(skeleton)) {
    if (typeof item === 'string') continue;
    node.parts.push(...item.parts);
    node.classes.push(...item.classes);
    for (const alt of item.alts) node.groups.push(splitTop(alt.args).map(anchorTree));
  }
  node.parts = [...new Set(node.parts)];
  node.classes = [...new Set(node.classes)];
  return node;
}

const flattenTree = (node, kind) => [...new Set([...node[kind], ...node.groups.flatMap((arms) => arms.flatMap((a) => flattenTree(a, kind)))])];

/** Anchors present in EVERY way the skeleton can match (outright, or common to all arms of an alternation). */
export function requiredAnchors(node) {
  const parts = new Set(node.parts);
  const classes = new Set(node.classes);
  for (const arms of node.groups) {
    const each = arms.map(requiredAnchors);
    for (const p of each[0]?.parts ?? []) if (each.every((e) => e.parts.has(p))) parts.add(p);
    for (const c of each[0]?.classes ?? []) if (each.every((e) => e.classes.has(c))) classes.add(c);
  }
  return { parts, classes };
}

/** Whether `holds(kind, name)` settles the tree: an outright anchor, or every arm of one alternation. */
const treeSettledBy = (node, holds) =>
  node.parts.some((p) => holds('part', p)) || node.classes.some((c) => holds('class', c)) || node.groups.some((arms) => arms.every((a) => treeSettledBy(a, holds)));

const skeletonOf = (selector) => {
  const probe = toProbe(selector);
  return { probe, skeleton: probe ? toSkeleton(probe) : null };
};

/** The data-part anchors a row's skeleton names (every arm of every alternation). */
export function anchorParts(selector) {
  const { skeleton } = skeletonOf(selector);
  return skeleton ? flattenTree(anchorTree(skeleton), 'parts') : [];
}

// ---------------------------------------------------------------------------
// Structural compatibility: can a stamp's JSX ancestry satisfy the selector?
// ---------------------------------------------------------------------------

/** A definite contradiction between a compound and an element, or null. */
function compoundContradiction(c, el) {
  if (!el || el.kind !== 'el') return null;
  if (c.tag && el.tag !== '?' && c.tag !== el.tag) return `<${el.tag}> is not <${c.tag}>`;
  const want = requiredTags(c);
  if (want) {
    const can = el.tags ?? (el.tag !== '?' ? [el.tag] : null);
    const wanted = [...want].map((t) => `<${t}>`).join(' or ');
    if (can && !can.some((t) => want.has(t))) return `renders only as ${can.map((t) => `<${t}>`).join(', ')}, never ${wanted}`;
    if (!can && el.tagPrefix && ![...want].some((t) => t.startsWith(el.tagPrefix))) return `renders only as <${el.tagPrefix}…>, never ${wanted}`;
  }
  for (const p of c.parts) {
    if (el.part === '?') continue;
    if (el.part !== p) return el.part === null ? `carries no data-part, not [data-part='${p}']` : `is [data-part='${el.part}'], not [data-part='${p}']`;
  }
  for (const cls of c.classes) if (el.classes.complete && !el.classes.present.has(cls)) return `never carries .${cls}`;
  for (const cls of c.notClasses) if (el.classes.present.has(cls)) return `always carries .${cls} (the selector excludes it)`;
  return null;
}

const BARE_TAG = /^[a-z][a-z0-9]*$/i;

/** The tags a compound admits (`code`, or every arm of `:is(sub, sup)`), or null when any tag can match. */
function requiredTags(c) {
  if (c.tagsCache !== undefined) return c.tagsCache;
  let want = c.tag ? new Set([c.tag]) : null;
  for (const alt of c.alts) {
    if (alt.name === 'has') continue;
    const arms = splitTop(alt.args);
    if (arms.length === 0 || !arms.every((a) => BARE_TAG.test(a))) continue;
    const set = new Set(arms.map((a) => a.toLowerCase()));
    want = want ? new Set([...want].filter((t) => set.has(t))) : set;
  }
  Object.defineProperty(c, 'tagsCache', { value: want, enumerable: false });
  return want;
}

/**
 * The gate a prop-bound host tag adds when the compound admits only some of its tags:
 * `as === "code"`. Null when the default tag already satisfies the compound.
 */
function tagGate(c, el) {
  const want = el?.kind === 'el' && el.tagProp ? requiredTags(c) : null;
  if (!want || want.has(el.tagProp.def)) return null;
  const { prop, values, file, line } = el.tagProp;
  const allowed = values.filter((v) => want.has(v));
  const textGate = allowed.length === 1 ? `${prop} === ${JSON.stringify(allowed[0])}` : `${prop} in ${JSON.stringify(allowed)}`;
  return { kind: 'tag', text: textGate, file, line, names: [{ name: prop, kind: 'prop' }], gates: true };
}

/** A component's destructured props: local -> { prop, def } (from the parameter or `const {...} = props`). */
function destructuredProps(fn) {
  const out = new Map();
  const read = (pattern) => {
    for (const el of pattern.elements) {
      if (el.dotDotDotToken || !ts.isIdentifier(el.name)) continue;
      out.set(el.name.text, { prop: el.propertyName ? propertyKeyText(el.propertyName) : el.name.text, def: el.initializer ?? null });
    }
  };
  const param = fn.parameters[0];
  if (!param) return out;
  if (ts.isObjectBindingPattern(param.name)) read(param.name);
  else if (ts.isIdentifier(param.name) && fn.body) {
    const visit = (n) => {
      if (ts.isVariableDeclaration(n) && ts.isObjectBindingPattern(n.name) && n.initializer && unparen(n.initializer).getText() === param.name.text) read(n.name);
      if (n !== fn.body && isFunctionLike(n)) return;
      ts.forEachChild(n, visit);
    };
    visit(fn.body);
  }
  return out;
}

/**
 * The intrinsic elements around a component's single `children` slot (innermost first), resolved
 * against the call site (an unpassed prop takes its default). Null when not provable.
 */
function childrenWrappers(census, entry, engine) {
  const key = `${entry.file}|${entry.tag}|${engine}|${[...entry.passed.names].sort().join(',')}|${entry.passed.spread}`;
  census.wrapperCache ??= new Map();
  if (census.wrapperCache.has(key)) return census.wrapperCache.get(key);
  census.wrapperCache.set(key, null);
  let result = null;
  const fns = componentFunctions(census, resolveTag(census, entry.file, entry.tag), engine);
  if (fns && fns.length === 1 && fns[0].fn.body) {
    const { fn } = fns[0];
    const bound = destructuredProps(fn);
    const childrenLocal = [...bound].find(([, b]) => b.prop === 'children')?.[0] ?? null;
    const propsName = fn.parameters[0] && ts.isIdentifier(fn.parameters[0].name) ? fn.parameters[0].name.text : null;
    const reads = [];
    const visit = (n) => {
      if (ts.isJsxExpression(n) && n.expression) {
        const t = unparen(n.expression).getText();
        if ((childrenLocal && t === childrenLocal) || (propsName && t === `${propsName}.children`)) reads.push(n);
      }
      ts.forEachChild(n, visit);
    };
    visit(fn.body);
    const subst = (expr) => {
      const e = stripTypeWrappers(expr);
      if (!e || !ts.isIdentifier(e) || !bound.has(e.text) || entry.passed.spread) return null;
      const { prop, def } = bound.get(e.text);
      if (entry.passed.names.has(prop)) return null;
      if (!def) return { value: undefined };
      const d = stripTypeWrappers(def);
      return ts.isStringLiteral(d) || ts.isNoSubstitutionTemplateLiteral(d) ? { value: d.text } : null;
    };
    if (reads.length === 1) {
      const out = [];
      let slotSiblings = [];
      let child = reads[0];
      let ok = false;
      for (let n = child.parent; n; child = n, n = n.parent) {
        if (ts.isJsxElement(n) && n.children.includes(child)) {
          const sibs = precedingSiblings(n.children, child);
          if (out.length === 0) slotSiblings = sibs;
          else out[out.length - 1].siblings = sibs;
          const d = describeElement(n.openingElement, subst);
          if (d.kind !== 'el') break;
          out.push(d);
          continue;
        }
        if (ts.isJsxFragment(n) || ts.isParenthesizedExpression(n)) continue;
        if (ts.isReturnStatement(n)) { ok = n.parent && ts.isBlock(n.parent) && n.parent.parent === fn; break; }
        if (isFunctionLike(n)) { ok = n === fn && child === fn.body; break; }
        break;
      }
      // Any other return that hands back the slot bypasses the wrapper.
      const handsSlot = (e) => Boolean(e) && ((childrenLocal && refersTo(e, childrenLocal)) || (propsName && e.getText().includes(`${propsName}.children`)));
      const returns = [];
      const collect = (n) => { if (n !== fn && isFunctionLike(n)) return; if (ts.isReturnStatement(n)) returns.push(n); ts.forEachChild(n, collect); };
      collect(fn.body);
      const containsRead = (r) => r.getStart() <= reads[0].getStart() && r.getEnd() >= reads[0].getEnd();
      const bypass = returns.some((r) => !containsRead(r) && handsSlot(r.expression));
      if (ok && out.length > 0 && !bypass) result = { wrappers: out, slotSiblings };
    }
  }
  census.wrapperCache.set(key, result);
  return result;
}

/** The chain with each resolvable component container replaced by the elements it wraps its children in. */
function expandChain(census, chain, engine) {
  const out = [];
  for (let i = 0; i < chain.length; i++) {
    const entry = chain[i];
    if (entry.kind === 'component' && entry.container && entry.passed) {
      const w = childrenWrappers(census, entry, engine);
      if (w) {
        const prev = out[out.length - 1];
        if (prev && prev.siblings !== undefined) out[out.length - 1] = { ...prev, siblings: [...w.slotSiblings, ...prev.siblings] };
        const wrappers = w.wrappers.map((d) => ({ ...d }));
        wrappers[wrappers.length - 1].siblings = entry.siblings;
        out.push(...wrappers);
        continue;
      }
    }
    out.push(entry);
  }
  return out;
}

/** Above a portal only the portal root, body and html exist: no part, no DS component class. */
const portalRegionFits = (compounds) => compounds.every((c) => c.parts.length === 0 && !c.classes.some(isDsClass));

/**
 * Whether a render path can put the anchor under the selector: `{ ok, why }`. What the path cannot
 * see (a component's output, a prop, the consumer) is permissive; only a proven contradiction rejects.
 */
function pathSatisfies(census, path, seq, anchor, engine, depth = 0) {
  const compounds = seq.filter((x) => typeof x !== 'string');
  const combs = seq.filter((x) => typeof x === 'string');
  return pathSatisfiesAt(census, path, compounds, combs, anchor, engine, depth, null, false);
}

/**
 * `pathSatisfies` over parsed compounds; `onlyAt` pins the anchor to one compound index. `strict`
 * also refuses an element no producer of a required DS class reaches (see `classCarriers`). `{ ok, why, gate }`
 */
function pathSatisfiesAt(census, path, compounds, combs, anchor, engine, depth, onlyAt, strict) {
  census.expandedChains ??= new WeakMap();
  let byEngine = census.expandedChains.get(path);
  if (!byEngine) census.expandedChains.set(path, (byEngine = new Map()));
  if (!byEngine.has(engine)) byEngine.set(engine, expandChain(census, path.chain, engine));
  const chain = byEngine.get(engine);
  let why = null;
  const reject = (w) => { why ??= w; return false; };
  const contradiction = (c, el) => compoundContradiction(c, el) ?? (strict ? carrierContradiction(census, c, el) : null);
  const marker = (entry) => {
    if (!entry || entry.kind === 'component') return 'open';
    if (entry.kind === 'portal') return 'portal';
    if (entry.kind === 'prop') return propPortaled(census, entry.file, entry.tag, entry.prop, engine) ? 'portal' : 'open';
    return 'el';
  };
  const portalFits = (k, via) => portalRegionFits(compounds.slice(0, k + 1)) || reject(`rendered inside a portal (${via}): nothing above it can be ${describeCompound(compounds[k])}`);
  const siblingsOf = (node) => {
    const list = chain[node.level]?.siblings;
    if (list === undefined) return undefined;
    return node.sib === null ? list : list.slice(0, node.sib);
  };
  // An unknown parent under `>` must still be an element that can be the target and renders composed children.
  const openParent = (k) => {
    const closed = closedParent(census, compounds, combs, k - 1, engine, depth);
    return closed ? reject(closed) : true;
  };
  const sat = (k, node) => {
    if (k === 0) return true;
    const comb = combs[k - 1];
    const target = compounds[k - 1];
    if (comb === '>' || comb === ' ') {
      for (let j = node.level + 1; j < chain.length; j++) {
        const kind = marker(chain[j]);
        if (kind === 'open') return comb === '>' ? openParent(k) : true;
        if (kind === 'portal') return portalFits(k - 1, chain[j].via ?? `${chain[j].tag}.${chain[j].prop}`);
        const contra = contradiction(target, chain[j]);
        if (!contra && sat(k - 1, { level: j, sib: null })) return true;
        if (comb === '>') return contra ? reject(`its parent ${contra}`) : false;
      }
      return comb === '>' ? openParent(k) : true; // above the owner's root: the consumer's composition
    }
    const list = siblingsOf(node);
    if (list === undefined) return true;
    for (let i = list.length - 1; i >= 0; i--) {
      const s = list[i];
      if (s.kind === 'opaque') return true;
      const contra = contradiction(target, s);
      if (!contra && sat(k - 1, { level: node.level, sib: i })) return true;
      if (comb === '+' && !s.optional) return reject(`its preceding sibling ${contra ?? 'cannot continue the selector'}`);
    }
    return reject(`no preceding sibling can be ${describeCompound(target)}`);
  };
  for (let k = 0; k < compounds.length; k++) {
    if (onlyAt !== null && k !== onlyAt) continue;
    const c = compounds[k];
    if (anchor.kind === 'part' ? !c.parts.includes(anchor.name) : !c.classes.includes(anchor.name)) continue;
    const host = chain[0];
    const contra = host?.kind === 'el' ? contradiction(c, host) : null;
    if (contra) { reject(`its host ${contra}`); continue; }
    if (sat(k, { level: 0, sib: null })) return { ok: true, gate: tagGate(c, host) };
  }
  // The anchor only appears inside an alternation or :has(): its placement is not read.
  if (why === null) return { ok: true, gate: null };
  return { ok: false, why };
}

const MAX_PARENT_DEPTH = 3;

/** Whether an element's direct children are all known elements: no slot for composed content. */
function closedChildren(el, ctx) {
  const opening = el?.at;
  if (!opening || !isIntrinsicTag(opening.tagName, ctx)) return false;
  const attrs = opening.attributes.properties;
  if (attrs.some((a) => ts.isJsxAttribute(a) && a.name.getText() === 'children')) return false;
  // Nested children override a spread's `children`; a self-closing element takes them from the spread.
  if (ts.isJsxSelfClosingElement(opening)) return !attrs.some((a) => ts.isJsxSpreadAttribute(a));
  const intrinsicJsx = (e) => {
    e = stripTypeWrappers(e);
    if (!e) return false;
    if (ts.isBinaryExpression(e) && e.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken) return intrinsicJsx(e.right);
    if (ts.isConditionalExpression(e)) return intrinsicJsx(e.whenTrue) && intrinsicJsx(e.whenFalse);
    if (e.kind === ts.SyntaxKind.NullKeyword || e.kind === ts.SyntaxKind.FalseKeyword || (ts.isIdentifier(e) && e.text === 'undefined')) return true;
    if (ts.isJsxElement(e) || ts.isJsxSelfClosingElement(e)) return isIntrinsicTag((ts.isJsxElement(e) ? e.openingElement : e).tagName, ctx);
    return false;
  };
  return opening.parent.children.every((c) => {
    if (ts.isJsxText(c)) return true;
    if (ts.isJsxExpression(c)) return !c.expression || intrinsicJsx(c.expression);
    if (ts.isJsxElement(c) || ts.isJsxSelfClosingElement(c)) return isIntrinsicTag((ts.isJsxElement(c) ? c.openingElement : c).tagName, ctx);
    return false;
  });
}

/**
 * Whether no element can be compound `idx` AND hold, as a direct child, content composed
 * outside its own file: a reason string when proven, else null. Candidates are every census
 * stamp of the compound's first part; one with a slot whose ancestry can satisfy the selector
 * up to `idx` (or any unreadable one) defeats the proof.
 */
function closedParent(census, compounds, combs, idx, engine, depth) {
  const target = compounds[idx];
  const part = target?.parts[0];
  if (!target || depth >= MAX_PARENT_DEPTH) return null;
  const prefix = compounds.slice(0, idx + 1);
  const key = `${engine}|${depth}|${JSON.stringify([prefix, combs.slice(0, idx)])}`;
  census.closedParentCache ??= new Map();
  if (census.closedParentCache.has(key)) return census.closedParentCache.get(key);
  census.closedParentCache.set(key, null);
  const excluded = EXCLUDED_ENGINES[engine] ?? [];
  const inEngine = (f) => !excluded.some((e) => f.includes(`/engines/${e}/`));
  // Every element that can be the target: the carriers of one of its DS classes, else every stamp of its part.
  let candidates = null;
  let anchor = null;
  for (const cls of target.classes.filter(isDsClass)) {
    if (!classCarriers(census, cls)) continue;
    candidates = classCarrierSites(census, cls).filter((s) => inEngine(s.file));
    anchor = { kind: 'class', name: cls };
    break;
  }
  if (!candidates && part) {
    const files = [...(census.global.get(part) ?? [])].filter(inEngine);
    const { sites, unlocatable } = ownerSites(census, files, part);
    if (files.length > 0 && unlocatable.length === 0) { candidates = sites; anchor = { kind: 'part', name: part }; }
  }
  let result = null;
  if (candidates) {
    const closedAt = new Set();
    const open = candidates.some((s) => s.paths.some((p) => {
      const host = p.chain[0];
      if (host?.kind === 'el' && closedChildren(host, census.ctxOf(s.file))) { closedAt.add(`components/${s.file}:${s.line}`); return false; }
      return pathSatisfiesAt(census, p, prefix, combs.slice(0, idx), anchor, engine, depth + 1, idx, true).ok;
    }));
    if (!open) {
      const listed = [...closedAt];
      result = `its parent must be ${describeCompound(target)}, and no element that can be one renders composed children (${listed.length > 3 ? `${listed.slice(0, 3).join(', ')} and ${listed.length - 3} more` : listed.join(', ') || 'none in reach'})`;
    }
  }
  census.closedParentCache.set(key, result);
  return result;
}

/** Class sites of a DS class across the census (namespace templates included), for carrier proofs. */
function classCarrierSites(census, cls) {
  return [...census.files].filter(([, e]) => textProducesClass(e.src, cls)).flatMap(([f]) => classSitesOf(census, f, cls, true));
}

/**
 * The elements a DS class can reach, as the set of their opening tags, or null when it can reach
 * an element the census cannot name: a producer outside `components/`, or a producer whose
 * class lands on a component (which may forward it anywhere). The orphan law's premise: a DS
 * class reaches the DOM only through a source that produces it.
 */
function classCarriers(census, cls) {
  census.carrierCache ??= new Map();
  if (census.carrierCache.has(cls)) return census.carrierCache.get(cls);
  let result = null;
  if (isDsClass(cls) && !classGeneratedOutside(census, cls)) {
    const sites = classCarrierSites(census, cls);
    const hosts = sites.flatMap((s) => s.paths.map((p) => p.chain[0]));
    if (sites.length > 0 && hosts.length > 0 && hosts.every((h) => h?.kind === 'el' && h.at)) result = new Set(hosts.map((h) => h.at));
  }
  census.carrierCache.set(cls, result);
  return result;
}

/** A required DS class whose every carrier is known, on an element that is none of them. */
function carrierContradiction(census, c, el) {
  if (!el || el.kind !== 'el' || !el.at) return null;
  for (const cls of c.classes.filter(isDsClass)) {
    const carriers = classCarriers(census, cls);
    if (carriers && !carriers.has(el.at)) return `never carries .${cls} (no producer of it lands there)`;
  }
  return null;
}

/** Whether a production source under `src/` but outside `components/` can produce the class. */
function classGeneratedOutside(census, token) {
  if (!census.outsideCorpus) {
    const corpus = [];
    const walk = (dir) => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const abs = join(dir, entry.name);
        if (entry.isDirectory()) { if (entry.name !== 'node_modules' && abs !== census.root) walk(abs); }
        else if (isProductionSource(abs)) corpus.push(readFileSync(abs, 'utf8'));
      }
    };
    walk(census.srcRoot);
    census.outsideCorpus = corpus;
  }
  return census.outsideCorpus.some((src) => textProducesClass(src, token, { specific: true }));
}

function describeCompound(c) {
  return `${c.tag ?? ''}${c.classes.map((x) => `.${x}`).join('')}${c.parts.map((p) => `[data-part='${p}']`).join('')}` || 'that compound';
}

/** The probe's complex selectors (a list becomes alternatives), parsed once per selector. */
function probeSequences(census, probe) {
  census.seqCache ??= new Map();
  if (!census.seqCache.has(probe)) census.seqCache.set(probe, splitTop(probe).map(parseSequence));
  return census.seqCache.get(probe);
}

/**
 * Whether a site can satisfy the row selector on at least one render path: `{ ok, why, paths }`.
 * Each fitting path also carries the gates its placement adds: the tag a prop-bound host must
 * take, and the prop a host mounts only behind its own gate.
 */
function siteFits(census, site, probe, engine) {
  if (!probe || site.paths.length === 0) return { ok: true, paths: site.paths };
  const anchor = { kind: site.kind === 'class' ? 'class' : 'part', name: site.kind === 'class' ? site.part.slice(1) : site.part };
  const seqs = probeSequences(census, probe);
  // A class qualifier on a part row is selected by its className expression alone: the element's gates are the element's.
  const own = (c) => (site.kind === 'class' && !site.full ? { ...c, gates: false, element: true } : c);
  let why = null;
  const paths = [];
  for (const path of site.paths) {
    let fit = null;
    for (const seq of seqs) {
      const r = pathSatisfies(census, path, seq, anchor, engine);
      if (r.ok) { fit = r; break; }
      why ??= r.why;
    }
    if (!fit) continue;
    const extra = [];
    if (fit.gate) extra.push(own(fit.gate));
    for (const entry of path.chain) {
      if (entry.kind !== 'prop') continue;
      const gate = propMountGate(census, entry.file, entry.tag, entry.prop, engine, entry.passed);
      if (gate) extra.push(own({ kind: 'mount', text: `<${entry.tag}> mounts ${entry.prop} only behind ${gate.text}`, file: entry.file, line: entry.line, names: gate.names, gates: true }));
    }
    paths.push(extra.length > 0 ? { ...path, conditions: [...path.conditions, ...extra] } : path);
  }
  return paths.length > 0 ? { ok: true, paths } : { ok: false, why };
}

/** The site narrowed to the render paths that can satisfy the selector (landing re-read on them), or null when none can. */
function fittingSite(census, site, probe, engine) {
  const fit = siteFits(census, site, probe, engine);
  if (!fit.ok) return null;
  if (fit.paths.length === site.paths.length && fit.paths.every((p, i) => p === site.paths[i])) return site;
  return narrowSite(site, fit.paths);
}

/** A site on a subset of its paths: a class site's landing is decided by the hosts of those paths only. */
function narrowSite(site, paths) {
  if (site.kind !== 'class') return { ...site, paths };
  const hosts = paths.map((p) => p.chain[0]);
  return { ...site, paths, lands: hosts.length > 0 && hosts.every((h) => h?.kind === 'el'), host: hosts.find((h) => h?.kind === 'component')?.tag ?? null };
}

// ---------------------------------------------------------------------------
// Classification
// ---------------------------------------------------------------------------

// Orphan rules a later wave owns: they stay failing, but read as that wave's debt, not a component defect.
const DEFERRED_ORPHAN_OWNERS = new Map([['agnostic/overlay-modal-compounds/index.css', 'the token-drainage wave']]);

/** Owner stamp sites of a part, plus files where only the gate's regex sees it. */
export function ownerSites(census, files, part) {
  const sites = [];
  const unlocatable = [];
  for (const file of files) {
    if (!census.files.get(file).gateParts.has(part)) continue;
    const located = census.sitesOf(file).filter((s) => s.part === part);
    if (located.length === 0) unlocatable.push(file);
    sites.push(...located);
  }
  return { sites, unlocatable };
}

const ownerClassSites = (census, files, token, full = false) => ({ sites: files.flatMap((f) => classSitesOf(census, f, token, full)), unlocatable: [] });
const sitesFor = (census, files, kind, name, full = false) => (kind === 'part' ? ownerSites(census, files, name) : ownerClassSites(census, files, name, full));

/** Classes on the compound(s) of a live selector that carry the part. */
function subjectClasses(census, probe, part) {
  return probeSequences(census, probe).flatMap((seq) => seq.filter((c) => typeof c !== 'string' && c.parts.includes(part)).flatMap((c) => c.classes));
}

/**
 * A live `part` counts as the owner's only when no foreign stamp could be the match: its compound
 * carries an owner-only class, or every foreign site is proven unable to satisfy the live selector.
 */
const MAX_FOREIGN_STAMPERS = 40;

function creditable(census, files, part, probe, engine) {
  const foreign = [...(census.global.get(part) ?? [])].filter((f) => !files.includes(f));
  if (foreign.length === 0) return true;
  const ownerOnlyClass = subjectClasses(census, probe, part).some((cls) => {
    const producers = classProducerFiles(census, cls);
    return producers.size > 0 && [...producers].every((f) => files.includes(f));
  });
  if (ownerOnlyClass) return true;
  // Every foreign stamp proven unable to satisfy the live selector: the match was the owner's.
  if (foreign.length > MAX_FOREIGN_STAMPERS) return false;
  return foreign.every((f) => {
    const { sites, unlocatable } = ownerSites(census, [f], part);
    return unlocatable.length === 0 && sites.every((s) => !siteFits(census, s, probe, engine).ok);
  });
}

/**
 * The positive control, read off the rules the browser saw alive. For every
 * anchor a live row REQUIRES (outright, or in every arm of an alternation) and
 * that can be credited to the owner:
 *   - the sites that can satisfy the live selector are the only candidates for
 *     the match, so the conditions common to all their render paths held on
 *     that one instance: one `witnesses` entry (conditions proven on different
 *     instances never combine); `atRest` is their union, for labels only;
 *   - if every candidate sits on one component host, that host provably
 *     forwards `data-part` under that engine (`forwardingHosts`, `engine|Host`).
 */
export function positiveControl(census, liveRows) {
  const atRest = new Set();
  const witnesses = [];
  const forwardingHosts = new Set();
  const seen = new Set();
  for (const { file: skinFile, selector } of liveRows) {
    const owner = resolveOwner(census, skinFile, selector);
    if (!owner.dir) continue;
    const engine = skinFile.split('/')[0];
    const { probe, skeleton } = skeletonOf(selector);
    if (!skeleton) continue;
    const files = ownerFiles(census, owner.dir, engine);
    const required = requiredAnchors(anchorTree(skeleton));
    const anchors = [...[...required.parts].map((name) => ({ kind: 'part', name })), ...[...required.classes].map((name) => ({ kind: 'class', name }))];
    for (const { kind, name } of anchors) {
      if (kind === 'part' && !creditable(census, files, name, probe, engine)) continue;
      const { sites, unlocatable } = sitesFor(census, files, kind, name);
      const fitting = sites.map((s) => fittingSite(census, s, probe, engine)).filter(Boolean);
      if (fitting.length === 0) continue;
      const signature = `${owner.dir}|${engine}|${kind}|${name}|${fitting.map((s) => `${s.file}:${s.line}`).join(',')}`;
      if (seen.has(signature)) continue;
      seen.add(signature);
      const paths = fitting.flatMap((s) => s.paths);
      if (paths.length > 0) {
        let common = new Set(paths[0].conditions.map(conditionKey));
        for (const p of paths.slice(1)) common = new Set(p.conditions.map(conditionKey).filter((k) => common.has(k)));
        if (common.size > 0) { witnesses.push(common); for (const k of common) atRest.add(k); }
      }
      if (kind === 'part') {
        const hosts = new Set(fitting.map((s) => (s.lands ? null : s.host)));
        if (hosts.size === 1 && !hosts.has(null) && unlocatable.length === 0) forwardingHosts.add(`${engine}|${[...hosts][0]}`);
      }
    }
  }
  return { atRest, witnesses, forwardingHosts };
}

const UNANALYSABLE_END = (end) => end !== 'root';

const describePath = (p, atRest) => {
  const conds = p.conditions.map((c) => `${c.kind}:${c.text}${c.kind === 'unknown' ? ' (unanalysable)' : atRest.has(conditionKey(c)) ? ' (held at rest)' : c.gates ? '' : ' (not a gate)'}`);
  return `${p.end}${conds.length ? `; ${conds.join(' & ')}` : '; no condition'}`;
};

/** Why one owner site cannot explain an absence, or null when it is a gated stamp that reaches the DOM. */
function siteDefect(census, site, control, engine) {
  const { atRest, forwardingHosts } = control;
  const where = `components/${site.file}:${site.line}`;
  if (!site.lands) {
    const prop = site.kind === 'class' ? 'className' : 'data-part';
    const proven = site.host && (forwardingHosts.has(`${engine}|${site.host}`) || hostForwards(census, site.file, site.host, prop, engine));
    if (!proven) return `owner stamps it at ${where} via ${site.via} on a non-DOM host: landing unproven (the P-79 drop${site.host ? `; host <${site.host}>` : ''})`;
  }
  if (site.paths.length === 0) return `owner stamps it at ${where} on no render path`;
  const open = site.paths.find((p) => !pathGated(p, control));
  if (!open) return null;
  const unknown = UNANALYSABLE_END(open.end) || open.conditions.some((c) => c.kind === 'unknown');
  const held = open.conditions.filter((c) => c.gates);
  const jointly = held.length > 1 && held.every((c) => atRest.has(conditionKey(c)));
  if (unknown) return `owner stamps it at ${where} behind an unanalysable gate (${describePath(open, atRest)})`;
  return `owner stamps it at ${where} on an ungated render path (${describePath(open, atRest)})${jointly ? ' -- held together on one instance' : ''}`;
}

/**
 * One stamp's evidence. `required` are the gating conditions on EVERY render path
 * (what the fixture must satisfy); when the paths share none, `anyOf` lists each
 * path's own gates instead. A condition held at rest on its own stays listed when
 * it is part of a combination no single instance held.
 */
const summarizeSite = (site, control) => {
  const { atRest } = control;
  const gatesOf = (p) => {
    const gates = p.conditions.filter((c) => c.gates);
    const unheld = gates.filter((c) => !atRest.has(conditionKey(c)));
    return unheld.length > 0 ? unheld : gates;
  };
  const brief = (c) => ({ text: c.text, kind: c.kind, line: c.line, names: c.names });
  const perPath = site.paths.map(gatesOf);
  const byText = new Map(perPath[0].map((c) => [c.text, c]));
  for (const gates of perPath.slice(1)) {
    const texts = new Set(gates.map((c) => c.text));
    for (const t of [...byText.keys()]) if (!texts.has(t)) byText.delete(t);
  }
  const required = [...byText.values()].map(brief);
  const anyOf = required.length > 0 ? [] : [...new Map(perPath.map((g) => [g.map((c) => c.text).join(' && '), g.map(brief)])).values()];
  return { file: `components/${site.file}`, line: site.line, via: site.via, kind: site.kind ?? 'part', match: site.match ?? site.part, paths: site.paths.length, required, anyOf };
};

const namesOf = (stamp) => (stamp.required.length > 0 ? stamp.required : stamp.anyOf.flat()).flatMap((c) => c.names.map((n) => n.name));

/**
 * One anchor against the owner: `explained` (every fitting site lands behind an unheld gate),
 * `dead` (no site can ever satisfy the selector) or `defect` (unexplained: the failing class).
 */
function judgeAnchor(census, files, kind, name, probe, engine, control, owner, full = false) {
  const label = kind === 'part' ? `'${name}'` : `'.${name}'`;
  const { sites, unlocatable } = sitesFor(census, files, kind, name, full);
  if (sites.length === 0) {
    if (kind === 'part') return { status: 'defect', reason: unlocatable.length ? `${label}: the gate's regex matches ${unlocatable.map((f) => `components/${f}`).join(', ')} but no AST stamp site exists` : `${label}: not stamped by the owner ${owner} (only by a different component)` };
    return { status: 'defect', reason: `${label}: no owner source produces the class` };
  }
  const fits = sites.map((s) => ({ s, fit: siteFits(census, s, probe, engine) }));
  const fitting = fits.filter((x) => x.fit.ok).map((x) => narrowSite(x.s, mergeComplements(x.fit.paths)));
  if (fitting.length === 0 && unlocatable.length === 0) {
    const why = fits.map((x) => `components/${x.s.file}:${x.s.line} ${x.fit.why}`).join('; ');
    return { status: 'dead', reason: `DEAD RULE: ${label} can never satisfy the selector -- ${why}` };
  }
  const defect = fitting.map((s) => siteDefect(census, s, control, engine)).find(Boolean);
  if (defect) return { status: 'defect', reason: `${label}: ${defect}` };
  // Sites that each look gated can still cover every branch of one gate between them.
  if (fitting.length > 1) {
    const open = mergeComplements(fitting.flatMap((s) => s.paths)).find((p) => !pathGated(p, control));
    if (open) return { status: 'defect', reason: `${label}: its sites cover both branches of a gate (${fitting.map((s) => `components/${s.file}:${s.line}`).join(', ')}): an ungated render path (${describePath(open, control.atRest)})` };
  }
  if (fitting.length === 0) return { status: 'defect', reason: `${label}: the gate's regex matches ${unlocatable.map((f) => `components/${f}`).join(', ')} but no located stamp site can satisfy the selector` };
  return { status: 'explained', evidence: { part: kind === 'part' ? name : `.${name}`, kind, stamps: fitting.map((s) => summarizeSite(s, control)) } };
}

const complementary = (x, y) => x.file === y.file && x.line === y.line && (x.text === `!(${y.text})` || y.text === `!(${x.text})`);

/** Paths merged where two differ only by one gate and its negation (`x ? <a/> : <a/>`): that gate selects nothing. */
function mergeComplements(paths) {
  const list = [...paths];
  for (let changed = true; changed; ) {
    changed = false;
    search: for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        if (list[i].end !== list[j].end) continue;
        const ka = new Map(list[i].conditions.filter((c) => c.gates).map((c) => [conditionKey(c), c]));
        const kb = new Map(list[j].conditions.filter((c) => c.gates).map((c) => [conditionKey(c), c]));
        const onlyA = [...ka.keys()].filter((k) => !kb.has(k));
        const onlyB = [...kb.keys()].filter((k) => !ka.has(k));
        if (onlyA.length === 1 && onlyB.length === 1 && complementary(ka.get(onlyA[0]), kb.get(onlyB[0]))) {
          list[i] = { ...list[i], conditions: list[i].conditions.filter((c) => conditionKey(c) !== onlyA[0]) };
          list.splice(j, 1);
          changed = true;
          break search;
        }
      }
    }
  }
  return list;
}

const EMPTY_CONTROL = Object.freeze({ atRest: new Set(), witnesses: [], forwardingHosts: new Set() });

/**
 * Classify one deadAnchor row. CONDITIONAL requires: owner resolved; every anchor
 * part stamped somewhere in the tree; and the skeleton settled by explained
 * anchors (one outright anchor, or every arm of an alternation). A row whose
 * anchors no owner site can ever satisfy is TRUE_DEAD with `verdict: 'dead-rule'`
 * (a skin bug); a class no source can generate is a dead rule too (an orphan).
 * Anything else is TRUE_DEAD, unexplained.
 */
export function classifyRow(census, skinFile, selector, control = EMPTY_CONTROL) {
  const ctl = control instanceof Set ? { ...EMPTY_CONTROL, atRest: control, witnesses: [control] } : { ...EMPTY_CONTROL, ...control };
  const engine = skinFile.split('/')[0];
  const { probe, skeleton } = skeletonOf(selector);
  const tree = skeleton ? anchorTree(skeleton) : { parts: [], classes: [], groups: [] };
  const parts = flattenTree(tree, 'parts');
  const base = { file: skinFile, selector, parts };
  const required = requiredAnchors(tree);
  for (const cls of required.classes) {
    if (isDsClass(cls) && !classGeneratedAnywhere(census, cls)) {
      const owner = DEFERRED_ORPHAN_OWNERS.get(skinFile);
      return { ...base, class: 'TRUE_DEAD', verdict: 'dead-rule', reason: `DEAD RULE: class '.${cls}' is generated by no source (orphan selector)${owner ? `; owned by ${owner}, not a component defect` : ''}` };
    }
  }
  for (const part of parts) {
    if (!census.global.has(part)) return { ...base, class: 'TRUE_DEAD', reason: `part '${part}' is stamped by no component source` };
  }
  let owner = resolveOwner(census, skinFile, selector);
  if (!owner.dir) {
    const byCensus = censusOwner(census, probe);
    if (!byCensus.dir) return { ...base, class: 'TRUE_DEAD', reason: `${owner.reason}; ${byCensus.reason}` };
    owner = byCensus;
  }
  const files = ownerFiles(census, owner.dir, engine);
  if (parts.length === 0) return classifyClassOnly(census, base, tree, files, probe, engine, ctl, owner);
  const verdicts = new Map();
  const judge = (kind, name) => {
    const key = `${kind}|${name}`;
    if (!verdicts.has(key)) verdicts.set(key, judgeAnchor(census, files, kind, name, probe, engine, ctl, owner.dir));
    return verdicts.get(key);
  };
  // Parts first so their defects lead the reason; classes can only add an explanation.
  for (const p of parts) judge('part', p);
  const explained = treeSettledBy(tree, (kind, name) => judge(kind, name).status === 'explained');
  if (explained) {
    const evidence = [...verdicts.values()].filter((v) => v.status === 'explained').map((v) => v.evidence);
    const conditionNames = [...new Set(evidence.flatMap((e) => e.stamps.flatMap(namesOf)))].sort();
    return { ...base, owner: owner.dir, class: 'CONDITIONAL', reason: `gated anchor(s): ${evidence.map((e) => e.part).join(', ')}`, conditionNames, evidence };
  }
  const dead = treeSettledBy(tree, (kind, name) => kind === 'part' && judge(kind, name).status === 'dead');
  const partVerdicts = parts.map((p) => judge('part', p));
  if (dead) {
    return { ...base, owner: owner.dir, class: 'TRUE_DEAD', verdict: 'dead-rule', reason: partVerdicts.filter((v) => v.status === 'dead').map((v) => v.reason).join(' | ') };
  }
  const defects = partVerdicts.filter((v) => v.status !== 'explained').map((v) => v.reason);
  return { ...base, owner: owner.dir, class: 'TRUE_DEAD', reason: defects.join(' | ') };
}

/**
 * A row with no part: its classes are the anchors, and the classed element's own render
 * conditions gate it (the element IS the subject). A tag or state-only arm stays unexplained.
 */
function classifyClassOnly(census, base, tree, files, probe, engine, control, owner) {
  const classes = flattenTree(tree, 'classes').filter(isDsClass);
  if (classes.length === 0) return { ...base, owner: owner.dir, class: 'TRUE_DEAD', reason: 'class-only anchor with no DS class: nothing to prove' };
  const verdicts = new Map();
  // A utility class (`font-mono`) the owner stamps behind a gate is evidence like a DS class; the row still needs a DS class to name its owner.
  const judge = (kind, name) => {
    if (kind !== 'class') return { status: 'defect', reason: `'${name}': not a class` };
    if (!verdicts.has(name)) verdicts.set(name, judgeAnchor(census, files, 'class', name, probe, engine, control, owner.dir, true));
    return verdicts.get(name);
  };
  const all = flattenTree(tree, 'classes');
  for (const c of all) judge('class', c);
  if (treeSettledBy(tree, (kind, name) => judge(kind, name).status === 'explained')) {
    const evidence = [...verdicts.values()].filter((v) => v.status === 'explained').map((v) => v.evidence);
    const conditionNames = [...new Set(evidence.flatMap((e) => e.stamps.flatMap(namesOf)))].sort();
    return { ...base, owner: owner.dir, class: 'CONDITIONAL', reason: `gated class anchor(s): ${evidence.map((e) => e.part).join(', ')}`, conditionNames, evidence };
  }
  if (treeSettledBy(tree, (kind, name) => judge(kind, name).status === 'dead')) {
    return { ...base, owner: owner.dir, class: 'TRUE_DEAD', verdict: 'dead-rule', reason: [...verdicts.values()].filter((v) => v.status === 'dead').map((v) => v.reason).join(' | ') };
  }
  const defects = all.map((c) => judge('class', c)).filter((v) => v.status !== 'explained').map((v) => v.reason);
  return { ...base, owner: owner.dir, class: 'TRUE_DEAD', reason: `class-only anchor: ${defects.join(' | ')}` };
}

/** The same file's rules the browser saw alive: the positive control's input. */
export function liveRowsOf(report, rules) {
  const dead = new Map((report.deadAnchors ?? []).map((e) => [e.file, new Set(e.selectors)]));
  const excluded = new Set([
    ...(report.unappliableRules ?? []).map((r) => `${r.file}\n${r.selector}`),
    ...(report.invalidSelectors ?? []).map((r) => `${r.file}\n${r.selector}`),
  ]);
  return rules
    .map((r) => ({ file: `${r.engine}/${r.file}`, selector: r.selector }))
    .filter((r) => dead.has(r.file) && !dead.get(r.file).has(r.selector) && !excluded.has(`${r.file}\n${r.selector}`) && !isForeignVendorSelector(r.selector));
}

/** Classify every deadAnchor row of a dead-selector report. */
export function classifyReport(report, { census = buildCensus(), rules = collectRules() } = {}) {
  const control = positiveControl(census, liveRowsOf(report, rules));
  const rows = [];
  for (const entry of report.deadAnchors ?? []) {
    for (const selector of entry.selectors) rows.push(classifyRow(census, entry.file, selector, control));
  }
  const trueDead = rows.filter((r) => r.class === 'TRUE_DEAD');
  const conditional = rows.filter((r) => r.class === 'CONDITIONAL');
  // Informational: one entry per (owner, anchor), naming what the torture page must render.
  const byPart = new Map();
  for (const r of conditional) {
    for (const ev of r.evidence) {
      const key = `${r.owner}::${r.file.split('/')[0]}::${ev.part}`;
      if (!byPart.has(key)) byPart.set(key, { owner: r.owner, part: ev.part, stamps: ev.stamps, rows: 0, skinFiles: new Set() });
      const e = byPart.get(key);
      e.rows += 1;
      e.skinFiles.add(r.file);
    }
  }
  const conditionalParts = [...byPart.values()].map((e) => ({ ...e, skinFiles: [...e.skinFiles].sort() })).sort((a, b) => b.rows - a.rows || a.part.localeCompare(b.part));
  return { rows, trueDead, conditional, conditionalParts, control };
}

export function loadReport(path = REPORT_PATH) {
  if (!existsSync(path)) throw new Error(`dead-anchor-classification: report missing at ${path}`);
  return JSON.parse(readFileSync(path, 'utf8'));
}
