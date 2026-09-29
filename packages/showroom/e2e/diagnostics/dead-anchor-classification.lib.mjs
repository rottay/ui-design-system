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
// Conservative bias is the law: a row leaves the failing class ONLY with positive
// source evidence. These never count as a gate: iteration (`.map` over data the
// fixture may well hold), hydration flags that are true at rest, conditions the
// browser proved true at rest (see positiveControl), render-prop callbacks whose
// caller is another component, and public exports a consumer may render
// directly. Any of those alone on a path leaves it UNGATED, and one ungated path
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

/**
 * Whether a stamp provably reaches the DOM. P-79 is a `data-part` handed to a
 * component that drops it, so only an intrinsic host (`<div>`, `<svg:g>`) or a
 * D3 `.attr` counts; a forwarded `part=` prop or a stamp on `<Card>` is unproven.
 */
function landsOnDom(site) {
  if (site.via === 'd3-attr') return { lands: true, host: null };
  if (site.via === 'part' || site.via === 'data-part-prop') return { lands: false, host: null };
  const element = hostElement(site.node);
  if (!element) return { lands: false, host: null };
  const tag = element.tagName.getText();
  return { lands: /^[a-z][a-z0-9-]*(?::[a-z][a-z0-9-]*)?$/.test(tag), host: tag };
}

/** Every literal part stamp in a source, located. `{ part, node, via, lands, host }` */
export function findStampSites(sf) {
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
  return sites.map((site) => ({ ...site, ...landsOnDom(site) }));
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

function makeCondition(kind, expr, negated, ctx) {
  const { sf, file } = ctx;
  const raw = text(expr);
  const conditionText = negated ? `!(${raw})` : raw;
  const line = sf.getLineAndCharacterOfPosition(expr.getStart(sf)).line + 1;
  const names = resolveNames(expr);
  const atRest = AT_REST_TRUE.test(raw) || (names.length > 0 && names.every((n) => AT_REST_TRUE.test(n.name)));
  return { kind, text: conditionText, file, line, names, gates: kind !== 'iteration' && !atRest };
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

/**
 * Every render path from `start` up to the file's component roots. Each path is
 * `{ conditions, end }` where end is `root` (a public export or top-level
 * boundary), or an ungated terminal (`render-prop`, `unused`, `hop-limit`).
 * `ctx` is `{ sf, file, importersOf }`; an export imported by a sibling source
 * is followed into that file.
 */
export function renderPaths(start, ctx, hops = 0, visiting = new Set()) {
  const conditions = [];
  let child = start;
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
      if (ts.isSourceFile(n)) return [{ conditions, end: 'root' }];
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
          continue;
        }
        if (TRANSPARENT_CALLS.has(callee) || /^Array\.from$/.test(callee)) continue;
        return [{ conditions, end: `callback:${callee}` }];
      }
      if (fnParent && (ts.isJsxExpression(fnParent) || (fnParent.parent && ts.isJsxAttribute(fnParent.parent)))) return [{ conditions, end: 'render-prop' }];
      // A named function or a const holding one: follow where it is used.
      let declName = null;
      let declNode = null;
      if (ts.isFunctionDeclaration(n) && n.name) { declName = n.name.text; declNode = n.name; }
      else if (fnParent && ts.isVariableDeclaration(fnParent) && ts.isIdentifier(fnParent.name)) { declName = fnParent.name.text; declNode = fnParent.name; }
      if (!declName) return [{ conditions, end: 'anonymous' }];
      return followUsages(declName, declNode, conditions, ctx, hops, visiting);
    }
    if (ts.isVariableDeclaration(n) && child === n.initializer && ts.isIdentifier(n.name)) {
      // `const toolbar = <div data-part="toolbar" />` or a useMemo result: follow its reads.
      return followUsages(n.name.text, n.name, conditions, ctx, hops, visiting);
    }
    if (ts.isClassDeclaration(n) || ts.isMethodDeclaration(n)) return [{ conditions, end: 'root' }];
  }
  return [{ conditions, end: 'root' }];
}

function followUsages(name, declNode, conditions, ctx, hops, visiting) {
  const key = `${ctx.file}:${name}@${declNode.pos}`;
  // Recursion re-entering itself only adds conditions to a path its outer usage already walks.
  if (visiting.has(key)) return [];
  if (hops >= MAX_HOPS) return [{ conditions, end: 'hop-limit' }];
  const next = new Set(visiting).add(key);
  const paths = [];
  const exported = exportNameOf(declNode, ctx.sf);
  if (exported) paths.push(...crossFilePaths(exported, conditions, ctx, hops, next));
  const uses = usagesOf(ctx.sf, name, declNode).filter((u) => !ts.isExportAssignment(u.parent));
  if (uses.length === 0 && !exported) return [{ conditions, end: 'unused' }];
  for (const use of uses) {
    for (const p of renderPaths(use, ctx, hops + 1, next)) paths.push({ conditions: [...conditions, ...p.conditions], end: p.end });
  }
  return paths;
}

/**
 * An export is followed into the sibling sources that import and render it. A
 * barrel re-export, a dynamic import, or no importer at all means a consumer
 * outside the census may render it directly: that stays an ungated `root`.
 */
function crossFilePaths(exportName, conditions, ctx, hops, visiting) {
  const importers = ctx.importersOf?.(ctx.file, exportName);
  if (!importers || importers.length === 0) return [{ conditions, end: 'root' }];
  const paths = [];
  for (const { ctx: other, local } of importers) {
    const uses = usagesOf(other.sf, local, null);
    if (uses.length === 0) continue;
    for (const use of uses) {
      for (const p of renderPaths(use, other, hops + 1, visiting)) paths.push({ conditions: [...conditions, ...p.conditions], end: p.end });
    }
  }
  return paths.length > 0 ? paths : [{ conditions, end: 'root' }];
}

export const conditionKey = (c) => `${c.file}:${c.line}:${c.text}`;

/**
 * A path is gated iff it ends at a real root and carries at least one gating
 * condition not proven to hold at rest (`atRest`: keys from the live-part control).
 */
export const pathGated = (p, atRest = new Set()) =>
  p.end === 'root' && p.conditions.some((c) => c.gates && !atRest.has(conditionKey(c)));

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
  const { imports, reexports, publicFiles } = indexImports(files, root);
  const ctxOf = (file) => {
    const entry = files.get(file);
    entry.ctx ??= {
      file,
      sf: ts.createSourceFile(file, entry.src, ts.ScriptTarget.Latest, true, file.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS),
      importersOf,
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
    entry.sites = findStampSites(ctx.sf).map((site) => ({
      file,
      part: site.part,
      via: site.via,
      lands: site.lands,
      host: site.host,
      line: ctx.sf.getLineAndCharacterOfPosition(site.node.getStart(ctx.sf)).line + 1,
      paths: renderPaths(site.node, ctx),
    }));
    return entry.sites;
  };
  return { root, files, global, sitesOf };
}

/**
 * Import edges into census files, read over the whole `src` tree so a consumer
 * outside `components/` is never missed. `imports` maps a target file to
 * `{ importer, name, local }` render edges; `reexports` maps it to barrel hops
 * `{ barrel, name, as }` (`name` '*' for `export *`). A target imported from
 * outside `components/`, or loaded by a dynamic `import()`, is public.
 */
function indexImports(files, componentsRoot) {
  const srcRoot = dirname(componentsRoot);
  const imports = new Map();
  const reexports = new Map();
  const publicFiles = new Set();
  const resolve = (importerAbs, spec) => {
    const abs = spec.startsWith('@/') ? join(srcRoot, spec.slice(2)) : spec.startsWith('.') ? join(dirname(importerAbs), spec) : null;
    if (!abs) return null;
    const base = relative(componentsRoot, abs).split(sep).join('/');
    if (base.startsWith('..')) return null;
    return [base, `${base}.tsx`, `${base}.ts`, `${base}/index.tsx`, `${base}/index.ts`].find((c) => files.has(c)) ?? null;
  };
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
      for (const m of src.matchAll(IMPORT)) {
        const target = resolve(abs, m[3]);
        if (!target) continue;
        if (!inside) { publicFiles.add(target); continue; }
        if (m[1]) push(imports, target, { importer, name: 'default', local: m[1] });
        for (const [name, local] of specifiers(m[2] ?? '')) push(imports, target, { importer, name, local: local ?? name });
      }
      for (const m of src.matchAll(REEXPORT)) {
        const target = resolve(abs, m[2]);
        if (!target) continue;
        if (!inside) { publicFiles.add(target); continue; }
        if (m[1] === '*') push(reexports, target, { barrel: importer, name: '*', as: null });
        else for (const [name, as] of specifiers(m[1].slice(1, -1))) push(reexports, target, { barrel: importer, name, as: as ?? name });
      }
      for (const m of src.matchAll(DYNAMIC)) {
        const target = resolve(abs, m[1]);
        if (target) publicFiles.add(target);
      }
    }
  };
  walk(srcRoot);
  return { imports, reexports, publicFiles };
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

/** Owner production files, minus sibling engines the skin does not paint. */
export function ownerFiles(census, dir, engine) {
  const key = `${dir}|${engine}`;
  census.ownerFilesCache ??= new Map();
  if (!census.ownerFilesCache.has(key)) {
    const excluded = EXCLUDED_ENGINES[engine] ?? [];
    census.ownerFilesCache.set(key, [...census.files.keys()].filter((f) => f.startsWith(`${dir}/`) && !excluded.some((e) => f.includes(`/engines/${e}/`))));
  }
  return census.ownerFilesCache.get(key);
}

// ---------------------------------------------------------------------------
// Classification
// ---------------------------------------------------------------------------

/** The data-part anchors a row's skeleton still requires (the parts the browser found absent). */
export function anchorParts(selector) {
  const probe = toProbe(selector);
  const skeleton = probe ? toSkeleton(probe) : null;
  if (!skeleton) return [];
  return [...new Set([...skeleton.matchAll(/\[\s*data-part\s*=\s*["']([a-z0-9-]+)["']\s*\]/gi)].map((m) => m[1]))];
}

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

/**
 * The positive control, read off the same skin files' rules the browser saw
 * alive. A live part was on the page, so:
 *   - every condition common to all render paths of all its owner stamps held at
 *     rest somewhere, and cannot explain another part's absence (`atRest`);
 *   - if every owner stamp of it sits on one component host (`<Box data-part>`),
 *     that host provably forwards `data-part` to the DOM under that skin engine
 *     (`forwardingHosts`, keyed `engine|Host`: modern Button is the P-79 drop).
 */
export function positiveControl(census, liveRows) {
  const atRest = new Set();
  const forwardingHosts = new Set();
  const seen = new Set();
  for (const { file: skinFile, selector } of liveRows) {
    const owner = resolveOwner(census, skinFile, selector);
    if (!owner.dir) continue;
    const files = ownerFiles(census, owner.dir, skinFile.split('/')[0]);
    for (const part of anchorParts(selector)) {
      const key = `${owner.dir}|${skinFile.split('/')[0]}|${part}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const { sites, unlocatable } = ownerSites(census, files, part);
      const paths = sites.flatMap((s) => s.paths);
      if (paths.length > 0) {
        let common = new Set(paths[0].conditions.map(conditionKey));
        for (const p of paths.slice(1)) common = new Set(p.conditions.map(conditionKey).filter((k) => common.has(k)));
        for (const k of common) atRest.add(k);
      }
      const hosts = new Set(sites.map((s) => (s.lands ? null : s.host)));
      if (sites.length > 0 && unlocatable.length === 0 && hosts.size === 1 && !hosts.has(null)) {
        // A stamp elsewhere in the tree could be the one the browser saw.
        const onlyOwner = [...census.global.get(part)].every((f) => files.includes(f));
        if (onlyOwner) forwardingHosts.add(`${skinFile.split('/')[0]}|${[...hosts][0]}`);
      }
    }
  }
  return { atRest, forwardingHosts };
}

const describePath = (p, atRest) =>
  `${p.end}${p.conditions.length ? `; ${p.conditions.map((c) => `${c.kind}:${c.text}${atRest.has(conditionKey(c)) ? ' (held at rest)' : c.gates ? '' : ' (not a gate)'}`).join(' & ')}` : '; no condition'}`;

/** Why one owner site cannot explain an absence, or null when it is a gated DOM stamp. */
function siteDefect(site, { atRest, forwardingHosts }, engine) {
  if (!site.lands && !(site.host && forwardingHosts.has(`${engine}|${site.host}`))) return `owner stamps it at components/${site.file}:${site.line} via ${site.via} on a non-DOM host: landing unproven (the P-79 drop)`;
  const open = site.paths.find((p) => !pathGated(p, atRest));
  if (site.paths.length === 0 || open) return `owner stamps it at components/${site.file}:${site.line} on an ungated render path (${open ? describePath(open, atRest) : 'no path'})`;
  return null;
}

/**
 * One stamp's evidence. `required` are the gating conditions on EVERY render path
 * (what the fixture must satisfy); when the paths share none, `anyOf` lists each
 * path's own gates instead.
 */
const summarizeSite = (site, atRest) => {
  const gatesOf = (p) => p.conditions.filter((c) => c.gates && !atRest.has(conditionKey(c)));
  const brief = (c) => ({ text: c.text, kind: c.kind, line: c.line, names: c.names });
  const perPath = site.paths.map(gatesOf);
  const byText = new Map(perPath[0].map((c) => [c.text, c]));
  for (const gates of perPath.slice(1)) {
    const texts = new Set(gates.map((c) => c.text));
    for (const t of [...byText.keys()]) if (!texts.has(t)) byText.delete(t);
  }
  const required = [...byText.values()].map(brief);
  const anyOf = required.length > 0 ? [] : [...new Map(perPath.map((g) => [g.map((c) => c.text).join(' && '), g.map(brief)])).values()];
  return { file: `components/${site.file}`, line: site.line, via: site.via, paths: site.paths.length, required, anyOf };
};

const namesOf = (stamp) => (stamp.required.length > 0 ? stamp.required : stamp.anyOf.flat()).flatMap((c) => c.names.map((n) => n.name));

/**
 * Classify one deadAnchor row. CONDITIONAL requires: owner resolved; every anchor
 * part stamped somewhere in the tree (the static census); and >= 1 anchor part
 * whose every owner stamp lands on a DOM host and whose every render path passes
 * a gating condition not proven to hold at rest. That part alone explains the
 * skeleton miss. Anything else is TRUE_DEAD.
 */
export function classifyRow(census, skinFile, selector, control = { atRest: new Set(), forwardingHosts: new Set() }) {
  const { atRest } = control;
  const engine = skinFile.split('/')[0];
  const parts = anchorParts(selector);
  const base = { file: skinFile, selector, parts };
  if (parts.length === 0) return { ...base, class: 'TRUE_DEAD', reason: 'no data-part anchor in the skeleton (class-only anchor): nothing to prove' };
  for (const part of parts) {
    if (!census.global.has(part)) return { ...base, class: 'TRUE_DEAD', reason: `part '${part}' is stamped by no component source` };
  }
  const owner = resolveOwner(census, skinFile, selector);
  if (!owner.dir) return { ...base, class: 'TRUE_DEAD', reason: owner.reason };
  const files = ownerFiles(census, owner.dir, engine);
  const evidence = [];
  const defects = [];
  for (const part of parts) {
    const { sites, unlocatable } = ownerSites(census, files, part);
    if (sites.length === 0) {
      defects.push(unlocatable.length ? `'${part}': the gate's regex matches ${unlocatable.map((f) => `components/${f}`).join(', ')} but no AST stamp site exists` : `'${part}': not stamped by the owner ${owner.dir} (only by a different component)`);
      continue;
    }
    const defect = sites.map((site) => siteDefect(site, control, engine)).find(Boolean);
    if (defect) { defects.push(`'${part}': ${defect}`); continue; }
    evidence.push({ part, stamps: sites.map((site) => summarizeSite(site, atRest)) });
  }
  if (evidence.length === 0) return { ...base, owner: owner.dir, class: 'TRUE_DEAD', reason: defects.join(' | ') };
  const conditionNames = [...new Set(evidence.flatMap((e) => e.stamps.flatMap(namesOf)))].sort();
  return { ...base, owner: owner.dir, class: 'CONDITIONAL', reason: `gated anchor part(s): ${evidence.map((e) => e.part).join(', ')}`, conditionNames, evidence };
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
  // Informational: one entry per (owner, part), naming what the torture page must render.
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

