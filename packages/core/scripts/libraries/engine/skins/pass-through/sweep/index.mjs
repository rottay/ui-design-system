/**
 * P-88 pass-through census -- the SWEEP (WO-ARC-12). A static TypeScript-AST sweep of
 * packages/core/src/components plus a selector index of the three skin dirs the dead-parts gate
 * reads. It returns the raw enumeration (engine sites, structural sites, compound caller uses)
 * that classify/ and summary/ turn into the census. READ-ONLY.
 *
 * ONE MEASUREMENT: this is the census the pass-through gate, the engine-token-audit rows and
 * family-cut G1 all read. The body below is the adopted census.mjs verbatim; only its CLI shell
 * (argv, the JSON write, console output) is replaced by this function's parameters and return.
 */
// Provenance: arc12/l2-tools/census.mjs sha256 1937b947ace1623c079a11fdc8b038f052d9aee6255475b8f121ddabc91e3b56 (census v7, adopted by the DT 2026-10-09).
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, relative, dirname, resolve } from 'node:path';
import { createRequire } from 'node:module';

/** @param {{ repoRoot: string }} options  repoRoot = the workspace root (holds packages/core). */
export function sweepPassThrough({ repoRoot } = {}) {
if (!repoRoot) throw new Error('sweepPassThrough: repoRoot (the workspace root) is required');
const REPO = resolve(repoRoot);
const CORE = join(REPO, 'packages/core');
const SRC = join(CORE, 'src');
const COMPONENTS = join(SRC, 'components');
const require = createRequire(join(CORE, 'package.json'));
const ts = require('typescript');

const SKIN_DIRS = {
  modern: 'foundation/tokens/css/runtime/engines/modern/skin',
  rustic: 'foundation/tokens/css/runtime/engines/rustic/skin',
  presentation: 'foundation/tokens/css/presentation/components/skin',
};

const rel = (p) => relative(REPO, p).replaceAll('\\', '/');
const isTestish = (p) => /(\.test\.|\.spec\.|\.stories\.|\/tests?\/|\/__tests__\/|\/__mocks__\/|\.fixture)/.test(p);

function walk(dir, out = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) { if (e.name !== 'node_modules') walk(p, out); }
    else if (/\.tsx?$/.test(e.name) && !/\.d\.ts$/.test(e.name)) out.push(p);
  }
  return out;
}

// ---------- skins: selector index ----------
const skinSelectors = []; // {file, skinDir, family, selector}
for (const [kind, d] of Object.entries(SKIN_DIRS)) {
  const full = join(SRC, d);
  if (!existsSync(full)) continue;
  const stack = [full];
  while (stack.length) {
    const cur = stack.pop();
    for (const e of readdirSync(cur, { withFileTypes: true })) {
      const p = join(cur, e.name);
      if (e.isDirectory()) { stack.push(p); continue; }
      if (!e.name.endsWith('.css')) continue;
      const css = readFileSync(p, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
      const family = relative(full, p).split('/')[0].replace(/\.css$/, '');
      // prelude = text before each '{' that is not an at-rule
      for (const m of css.matchAll(/([^{};]+)\{/g)) {
        const prelude = m[1].trim();
        if (!prelude || prelude.startsWith('@')) continue;
        if (/^(from|to|\d+%)/.test(prelude)) continue;
        for (const sel of prelude.split(',')) skinSelectors.push({ file: rel(p), kind, family, selector: sel.trim() });
      }
    }
  }
}
const partRe = (part) => new RegExp(`\\[data-part=["']${part}["']\\]`);
function skinCount({ family, part, stateOnly = false, anyFamily = false, engine = null }) {
  const re = partRe(part);
  const kinds = engine === 'modern' ? ['modern', 'presentation'] : engine === 'rustic' ? ['rustic', 'presentation'] : engine === 'classic' ? ['presentation'] : null;
  const hits = skinSelectors.filter((s) => (!kinds || kinds.includes(s.kind)) && (anyFamily || s.family === family) && re.test(s.selector) && (!stateOnly || /\[data-state/.test(s.selector)));
  const byFile = {};
  for (const h of hits) byFile[h.file] = (byFile[h.file] ?? 0) + 1;
  return { count: hits.length, byFile };
}
const familiesWithSkin = new Set(skinSelectors.map((s) => s.family));

// ---------- families (dirs that own engines/) ----------
const allFiles = walk(COMPONENTS).filter((p) => !isTestish(rel(p)));
const familyDirs = new Map(); // abs dir -> family name
for (const f of allFiles) {
  const m = f.match(/^(.*)\/engines\/(classic|modern|rustic)\/index\.tsx$/);
  if (m) familyDirs.set(m[1], m[1].split('/').pop());
}
const familyByName = new Map();
for (const [dir, name] of familyDirs) {
  if (!familyByName.has(name)) familyByName.set(name, []);
  familyByName.get(name).push(dir);
}

// ---------- AST helpers ----------
const textOf = (sf, n) => n.getText(sf);
const lineOf = (sf, n) => sf.getLineAndCharacterOfPosition(n.getStart(sf)).line + 1;
const propName = (n) => (n && (ts.isIdentifier(n) || ts.isStringLiteral(n)) ? n.text : undefined);

function analyzeFile(file) {
  const code = readFileSync(file, 'utf8');
  const sf = ts.createSourceFile(file, code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const carriers = new Map(); // name -> {part:bool, state:bool, origin}
  const callerPartIds = new Set();
  const callerStateIds = new Set();
  const objects = new Map(); // name -> ObjectLiteralExpression
  const paramNames = new Set();
  const aliases = [];
  const imperative = []; // {line, caller, value}

  const unwrap = (e) => { while (e && (ts.isAsExpression(e) || ts.isParenthesizedExpression(e) || ts.isSatisfiesExpression?.(e) || ts.isTypeAssertionExpression?.(e) || ts.isNonNullExpression(e))) e = e.expression; return e; };

  // pass 1: params
  const visitParams = (n) => {
    if ((ts.isFunctionDeclaration(n) || ts.isArrowFunction(n) || ts.isFunctionExpression(n)) && n.parameters.length) {
      const p0 = n.parameters[0];
      if (ts.isIdentifier(p0.name)) paramNames.add(p0.name.text);
    }
    ts.forEachChild(n, visitParams);
  };
  visitParams(sf);
  for (const p of paramNames) if (/^(props|p|allProps|rawProps|incomingProps|componentProps)$/.test(p)) carriers.set(p, { part: true, state: true, origin: p });

  // pass 2 (fixpoint): destructuring rest bindings + object literals
  const bindings = [];
  const collect = (n) => {
    if (ts.isObjectBindingPattern(n)) bindings.push(n);
    if (ts.isVariableDeclaration(n) && ts.isIdentifier(n.name) && n.initializer) {
      const init = unwrap(n.initializer);
      if (init && ts.isObjectLiteralExpression(init)) objects.set(n.name.text, init);
      if (init && ts.isIdentifier(init)) aliases.push([n.name.text, init.text]);
    }
    if (ts.isElementAccessExpression(n) && ts.isStringLiteral(n.argumentExpression)) {
      // props['data-part'] used directly is handled in expression scan
    }
    ts.forEachChild(n, collect);
  };
  collect(sf);
  const patternSource = (pat) => {
    const parent = pat.parent;
    if (ts.isParameter(parent)) return { param: true };
    if (ts.isVariableDeclaration(parent) && parent.initializer) return { init: unwrap(parent.initializer) };
    if (ts.isBindingElement(parent)) return { nested: true };
    return {};
  };
  for (let iter = 0; iter < 4; iter++) {
    for (const pat of bindings) {
      const restEl = pat.elements.find((el) => el.dotDotDotToken && ts.isIdentifier(el.name));
      let src = patternSource(pat);
      let srcCarrier = null;
      if (src.param) srcCarrier = { part: true, state: true, origin: 'param' };
      else if (src.init && ts.isIdentifier(src.init) && carriers.has(src.init.text)) srcCarrier = carriers.get(src.init.text);
      else if (src.init && ts.isIdentifier(src.init) && paramNames.has(src.init.text)) srcCarrier = { part: true, state: true, origin: src.init.text };
      if (!srcCarrier) continue;
      let takesPart = false, takesState = false;
      for (const el of pat.elements) {
        if (el.dotDotDotToken) continue;
        const key = propName(el.propertyName) ?? (ts.isIdentifier(el.name) ? el.name.text : undefined);
        if (key === 'data-part') { takesPart = true; if (ts.isIdentifier(el.name)) callerPartIds.add(el.name.text); }
        if (key === 'data-state') { takesState = true; if (ts.isIdentifier(el.name)) callerStateIds.add(el.name.text); }
      }
      for (const [a, b] of aliases) if (carriers.has(b) && !carriers.has(a)) carriers.set(a, { ...carriers.get(b), origin: `alias:${b}` });
      if (restEl) {
        const name = restEl.name.text;
        const c = { part: srcCarrier.part && !takesPart, state: srcCarrier.state && !takesState, origin: `rest:${name}@${lineOf(sf, restEl)}` };
        const prev = carriers.get(name);
        if (!prev || (prev.part !== c.part || prev.state !== c.state)) carriers.set(name, prev ? { part: prev.part || c.part, state: prev.state || c.state, origin: prev.origin } : c);
      }
    }
  }

  const refsCaller = (expr, ids, key) => {
    let hit = false;
    const v = (n) => {
      if (hit) return;
      if (ts.isIdentifier(n) && ids.has(n.text)) hit = true;
      if (ts.isElementAccessExpression(n) && ts.isStringLiteral(n.argumentExpression) && n.argumentExpression.text === key) {
        const base = unwrap(n.expression);
        if (ts.isIdentifier(base) && (carriers.has(base.text) || paramNames.has(base.text))) hit = true;
      }
      ts.forEachChild(n, v);
    };
    v(expr);
    return hit;
  };
  const isConditionalValue = (expr) => {
    if (!expr) return false;
    const e = unwrap(expr);
    if (ts.isStringLiteral(e) || ts.isNoSubstitutionTemplateLiteral(e)) return false;
    if (ts.isTemplateExpression(e)) return false;
    return true; // ternary, &&, identifiers, calls: may be undefined at rest
  };

  // turn an object literal / spread expression into an ordered entry list
  const entriesOfSpread = (expr, depth = 0) => {
    const e = unwrap(expr);
    const out = [];
    if (!e || depth > 4) return out;
    if (ts.isIdentifier(e)) {
      if (carriers.has(e.text)) { const c = carriers.get(e.text); out.push({ kind: 'rest', part: c.part, state: c.state, via: e.text }); return out; }
      if (objects.has(e.text)) return entriesOfObject(objects.get(e.text), depth + 1, e.text);
      return out;
    }
    if (ts.isCallExpression(e) && ts.isIdentifier(e.expression) && e.expression.text === 'partAttributes') {
      const arg = e.arguments[0];
      out.push({ kind: 'part', caller: arg ? refsCaller(arg, callerPartIds, 'data-part') : false, value: arg ? textOf(sf, arg) : '?' });
      out.push({ kind: 'state', cond: true, caller: false, value: 'partAttributes(...)' });
      return out;
    }
    if (ts.isObjectLiteralExpression(e)) return entriesOfObject(e, depth + 1);
    if (ts.isConditionalExpression(e)) { // {...(c ? a : b)}
      return [...entriesOfSpread(e.whenTrue, depth + 1), ...entriesOfSpread(e.whenFalse, depth + 1)].map((x) => ({ ...x, cond: true }));
    }
    if (ts.isBinaryExpression(e)) return entriesOfSpread(e.right, depth + 1).map((x) => ({ ...x, cond: true }));
    return out;
  };
  const entriesOfObject = (obj, depth, via) => {
    const out = [];
    for (const pr of obj.properties) {
      if (ts.isSpreadAssignment(pr)) out.push(...entriesOfSpread(pr.expression, depth).map((x) => ({ ...x, via: x.via ?? via })));
      else if (ts.isPropertyAssignment(pr)) {
        const k = propName(pr.name);
        if (k === 'data-part') out.push({ kind: 'part', caller: refsCaller(pr.initializer, callerPartIds, 'data-part'), value: textOf(sf, pr.initializer), via });
        if (k === 'data-state') out.push({ kind: 'state', cond: isConditionalValue(pr.initializer), caller: refsCaller(pr.initializer, callerStateIds, 'data-state'), value: textOf(sf, pr.initializer), via });
      } else if (ts.isShorthandPropertyAssignment(pr)) { /* not data-* */ }
    }
    return out;
  };

  for (const [a, b] of aliases) if (carriers.has(b) && !carriers.has(a)) carriers.set(a, { ...carriers.get(b), origin: `alias:${b}` });
  const findImperative = (n) => {
    if (ts.isCallExpression(n) && ts.isIdentifier(n.expression) && n.expression.text === 'stampDataPart' && n.arguments[1]) {
      imperative.push({ line: lineOf(sf, n), caller: refsCaller(n.arguments[1], callerPartIds, 'data-part'), value: textOf(sf, n.arguments[1]) });
    }
    ts.forEachChild(n, findImperative);
  };
  findImperative(sf);
  // exported component names (default, named, static members of exported)
  const exported = new Set();
  let defaultStmt = null;
  for (const st of sf.statements) {
    const mods = ts.canHaveModifiers?.(st) ? ts.getModifiers(st) ?? [] : st.modifiers ?? [];
    const isExp = mods.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
    const isDef = mods.some((m) => m.kind === ts.SyntaxKind.DefaultKeyword);
    if (ts.isFunctionDeclaration(st) && st.name && isExp) exported.add(st.name.text);
    if (ts.isFunctionDeclaration(st) && isDef) defaultStmt = st;
    if (ts.isVariableStatement(st) && isExp) for (const d of st.declarationList.declarations) if (ts.isIdentifier(d.name)) exported.add(d.name.text);
    if (ts.isExportAssignment(st)) { const e = unwrap(st.expression); if (ts.isIdentifier(e)) exported.add(e.text); else defaultStmt = st; }
    if (ts.isExportDeclaration(st) && st.exportClause && ts.isNamedExports(st.exportClause) && !st.moduleSpecifier) for (const el of st.exportClause.elements) exported.add((el.propertyName ?? el.name).text);
  }
  // Object.assign(X, { Y: Z }) / X.Y = Z  -> Z public if X public
  for (let k = 0; k < 2; k++) for (const st of sf.statements) {
    if (ts.isExpressionStatement(st) && ts.isBinaryExpression(st.expression) && st.expression.operatorToken.kind === ts.SyntaxKind.EqualsToken) {
      const l = st.expression.left, r = unwrap(st.expression.right);
      if (ts.isPropertyAccessExpression(l) && ts.isIdentifier(l.expression) && exported.has(l.expression.text) && ts.isIdentifier(r)) exported.add(r.text);
    }
    if (ts.isVariableStatement(st)) for (const d of st.declarationList.declarations) {
      const init = d.initializer && unwrap(d.initializer);
      if (init && ts.isCallExpression(init) && /Object\.assign/.test(textOf(sf, init.expression)) && ts.isIdentifier(d.name) && exported.has(d.name.text)) {
        for (const a of init.arguments) { const u = unwrap(a); if (ts.isIdentifier(u)) exported.add(u.text); if (ts.isObjectLiteralExpression(u)) for (const pr of u.properties) { if (ts.isPropertyAssignment(pr) && ts.isIdentifier(unwrap(pr.initializer))) exported.add(unwrap(pr.initializer).text); if (ts.isShorthandPropertyAssignment(pr)) exported.add(pr.name.text); } }
      }
    }
  }
  const topName = (n) => {
    let cur = n;
    while (cur.parent && cur.parent !== sf) cur = cur.parent;
    if (cur === defaultStmt) return { name: 'default', public: true };
    if (ts.isFunctionDeclaration(cur) && cur.name) return { name: cur.name.text, public: exported.has(cur.name.text) };
    if (ts.isVariableStatement(cur)) { const d = cur.declarationList.declarations[0]; const nm = ts.isIdentifier(d.name) ? d.name.text : '?'; return { name: nm, public: exported.has(nm) }; }
    if (ts.isExportAssignment(cur)) return { name: 'default', public: true };
    return { name: '?', public: false };
  };
  const sites = [];
  const compoundUses = [];
  const varInitText = new Map();
  const collectInits = (n) => {
    if (ts.isVariableDeclaration(n) && ts.isIdentifier(n.name) && n.initializer) varInitText.set(n.name.text, (varInitText.get(n.name.text) ?? '') + ' ' + textOf(sf, n.initializer));
    if (ts.isBindingElement(n) && ts.isIdentifier(n.name) && n.initializer) varInitText.set(n.name.text, (varInitText.get(n.name.text) ?? '') + ' ' + textOf(sf, n.initializer));
    ts.forEachChild(n, collectInits);
  };
  collectInits(sf);
  const DS_CLASS = /(^|[\s"'`])(ds|rottay)-[a-z]/;
  const dsClassIn = (text, depth = 0) => {
    if (DS_CLASS.test(text)) return true;
    if (depth > 3) return false;
    for (const id of new Set(text.match(/\b[A-Za-z_$][\w$]*\b/g) ?? [])) {
      if (varInitText.has(id) && dsClassIn(varInitText.get(id), depth + 1)) return true;
    }
    return false;
  };
  // v3 (e)(iv): component-authored inline style (not a bare caller `style` pass-through)
  const CALLER_STYLE = /^\s*\{?\s*(\.\.\.)?\s*(props\.)?style\s*\}?\s*$/;
  const authoredStyle = (text) => {
    const t = text.replace(/^\{\s*|\s*\}$/g, '').trim();
    if (!t || /^(props\.)?style$/.test(t)) return false;
    if (/^\{\s*\.\.\.\s*(props\.)?style\s*,?\s*\}$/.test(t)) return false;
    return !CALLER_STYLE.test(t);
  };
  const antClassIn = (text, depth = 0) => {
    if (/(^|[\s"'`])ant-[a-z]/.test(text)) return true;
    if (depth > 3) return false;
    for (const id of new Set(text.match(/\b[A-Za-z_$][\w$]*\b/g) ?? [])) if (varInitText.has(id) && antClassIn(varInitText.get(id), depth + 1)) return true;
    return false;
  };
  const visitCreate = (n) => {
    if (ts.isCallExpression(n) && /(^|\.)createElement$/.test(textOf(sf, n.expression)) && n.arguments.length >= 2) {
      const obj = unwrap(n.arguments[1]);
      const seq = obj ? entriesOfSpread(obj) : [];
      const objLit = obj && ts.isIdentifier(obj) && objects.has(obj.text) ? objects.get(obj.text) : obj;
      const classNameHook = Boolean(objLit && ts.isObjectLiteralExpression(objLit) && objLit.properties.some((pr) => propName(pr.name) === 'className'));
      const clsProp = objLit && ts.isObjectLiteralExpression(objLit) ? objLit.properties.find((pr) => propName(pr.name) === 'className') : null;
      const dsClass = Boolean(clsProp && dsClassIn(textOf(sf, clsProp)));
      const styleProp = objLit && ts.isObjectLiteralExpression(objLit) ? objLit.properties.find((pr) => propName(pr.name) === 'style') : null;
      const componentStyle = Boolean(styleProp && ts.isPropertyAssignment(styleProp) && authoredStyle(textOf(sf, styleProp.initializer)));
      const antPaintClass = Boolean(clsProp && antClassIn(textOf(sf, clsProp)));
      if (seq.some((x) => x.kind === 'rest' || x.caller)) sites.push({ line: lineOf(sf, n), tag: 'createElement(' + textOf(sf, n.arguments[0]).slice(0, 30) + ')', seq, classNameHook, dsClass, componentStyle, antPaintClass, intrinsic: true, owner: topName(n) });
    }
    ts.forEachChild(n, visitCreate);
  };
  visitCreate(sf);
  const visitJsx = (n) => {
    if (ts.isJsxOpeningElement(n) || ts.isJsxSelfClosingElement(n)) {
      const tag = textOf(sf, n.tagName);
      const seq = [];
      let classNameHook = false;
      let dsClass = false;
      let componentStyle = false;
      let antPaintClass = false;
      let literalCallerPart = null, literalCallerState = null;
      for (const a of n.attributes.properties) {
        if (ts.isJsxSpreadAttribute(a)) seq.push(...entriesOfSpread(a.expression));
        else if (ts.isJsxAttribute(a)) {
          const k = a.name.getText(sf);
          const init = a.initializer && ts.isJsxExpression(a.initializer) ? a.initializer.expression : a.initializer;
          if (k === 'data-part') {
            seq.push({ kind: 'part', caller: init ? refsCaller(init, callerPartIds, 'data-part') : false, value: init ? textOf(sf, init) : 'true' });
            if (init && ts.isStringLiteral(init)) literalCallerPart = init.text;
            else if (init) {
              const lits = [...textOf(sf, init).matchAll(/["'`]([a-z0-9-]+)["'`]/g)].map((m) => m[1]);
              if (lits.length) literalCallerPart = lits.join('|');
            }
          }
          if (k === 'data-state') {
            seq.push({ kind: 'state', cond: isConditionalValue(init), caller: init ? refsCaller(init, callerStateIds, 'data-state') : false, value: init ? textOf(sf, init) : 'true' });
            literalCallerState = init ? textOf(sf, init) : 'true';
          }
          if (k === 'className') { classNameHook = true; if (init && dsClassIn(textOf(sf, init))) dsClass = true; if (init && antClassIn(textOf(sf, init))) antPaintClass = true; }
          if (k === 'style' && init && authoredStyle(textOf(sf, init))) componentStyle = true;
        }
      }
      const hasRest = seq.some((x) => x.kind === 'rest');
      const callerPartStamp = seq.some((x) => x.kind === 'part' && x.caller);
      const callerStateStamp = seq.some((x) => x.kind === 'state' && x.caller);
      if (hasRest || callerPartStamp || callerStateStamp) {
        const refAttr = n.attributes.properties.find((a) => ts.isJsxAttribute(a) && a.name.getText(sf) === 'ref');
        if (imperative.length && /^[A-Z]/.test(tag) && refAttr) for (const im of imperative) seq.push({ kind: 'part', caller: im.caller, value: im.value + ' (imperative stampDataPart L' + im.line + ', post-commit)' });
        sites.push({ line: lineOf(sf, n), tag, seq, classNameHook, dsClass, componentStyle, antPaintClass, intrinsic: /^[a-z]/.test(tag), owner: topName(n) });
      }
      if (/^[A-Z]/.test(tag) && (literalCallerPart || literalCallerState)) {
        compoundUses.push({ line: lineOf(sf, n), tag, part: literalCallerPart, state: literalCallerState });
      }
    }
    ts.forEachChild(n, visitJsx);
  };
  visitJsx(sf);

  // imports: tag -> specifier
  const imports = new Map();
  for (const st of sf.statements) {
    if (!ts.isImportDeclaration(st) || !st.importClause) continue;
    const spec = st.moduleSpecifier.text;
    const ic = st.importClause;
    if (ic.name) imports.set(ic.name.text, { spec, imported: 'default' });
    if (ic.namedBindings && ts.isNamedImports(ic.namedBindings)) for (const el of ic.namedBindings.elements) imports.set(el.name.text, { spec, imported: (el.propertyName ?? el.name).text });
  }
  const antNames = new Set();
  for (const [nm, im] of imports) if (im.spec === 'antd' || im.spec.startsWith('antd/') || im.spec.startsWith('rc-')) antNames.add(nm);
  const localFns = new Set();
  const localDynamic = new Set();
  const scanDecl = (n) => {
    if (ts.isFunctionDeclaration(n) && n.name) localFns.add(n.name.text);
    if (ts.isVariableDeclaration(n)) {
      const init = n.initializer && unwrap(n.initializer);
      if (ts.isIdentifier(n.name)) {
        const isFn = init && (ts.isArrowFunction(init) || ts.isFunctionExpression(init) || (ts.isCallExpression(init) && /(forwardRef|memo|Object\.assign|createContext|styled|lazy)/.test(textOf(sf, init.expression))));
        const fromAnt = init && ((ts.isPropertyAccessExpression(init) && ts.isIdentifier(init.expression) && antNames.has(init.expression.text)) || (ts.isIdentifier(init) && antNames.has(init.text)));
        if (fromAnt) antNames.add(n.name.text);
        else if (isFn) localFns.add(n.name.text);
        else localDynamic.add(n.name.text);
      } else if (ts.isObjectBindingPattern(n.name) && init && ts.isIdentifier(init) && antNames.has(init.text)) {
        for (const el of n.name.elements) if (ts.isIdentifier(el.name)) antNames.add(el.name.text);
      }
    }
    if (ts.isBindingElement(n) && ts.isIdentifier(n.name) && /^[A-Z]/.test(n.name.text)) {
      const pat = n.parent; const decl = pat && pat.parent;
      if (!(decl && ts.isVariableDeclaration(decl) && decl.initializer && ts.isIdentifier(unwrap(decl.initializer)) && antNames.has(unwrap(decl.initializer).text))) localDynamic.add(n.name.text);
    }
    ts.forEachChild(n, scanDecl);
  };
  scanDecl(sf);
  const tagKind = (tag) => {
    if (tag.startsWith('createElement(')) {
      const inner = tag.slice(14, -1);
      if (/^["']/.test(inner)) return 'intrinsic';
      if (/^(ElementType|Component|Tag|Element|As|Comp)$/.test(inner)) return 'dynamic';
      return localFns.has(inner) ? 'local-component' : 'imported-component';
    }
    if (/^[a-z]/.test(tag)) return 'intrinsic';
    const root = tag.split('.')[0];
    if (antNames.has(root)) return 'ant';
    if (localDynamic.has(root) && !localFns.has(root) && !imports.has(root)) return 'dynamic';
    if (localFns.has(root)) return 'local-component';
    return 'imported-component';
  };
  for (const st of sites) st.tagKind = tagKind(st.tag);
  const native = new Set();
  const lits = (t) => [...t.matchAll(/["'`]([a-z0-9-]+)["'`]/g)].map((m) => m[1]);
  const scanNative = (n) => {
    if ((ts.isJsxOpeningElement(n) || ts.isJsxSelfClosingElement(n))) {
      const tg = textOf(sf, n.tagName); const k = tagKind(tg);
      const nativeTag = k === 'intrinsic' || k === 'dynamic';
      for (const a of n.attributes.properties) if (ts.isJsxAttribute(a)) {
        const nm = a.name.getText(sf);
        if (a.initializer && ((nm === 'data-part' && nativeTag) || nm === 'part')) lits(textOf(sf, a.initializer)).forEach((x) => native.add(x));
      }
    }
    if (ts.isPropertyAssignment(n) && propName(n.name) === 'data-part') lits(textOf(sf, n.initializer)).forEach((x) => native.add(x));
    if (ts.isCallExpression(n)) {
      const callee = textOf(sf, n.expression);
      if (/(^|\.)(partAttributes|stampDataPart)$/.test(callee) && n.arguments.length) lits(textOf(sf, n.arguments[callee.endsWith('stampDataPart') ? 1 : 0] ?? n.arguments[0])).forEach((x) => native.add(x));
      if (/\.attr$/.test(callee) && n.arguments.length === 2 && ts.isStringLiteral(n.arguments[0]) && n.arguments[0].text === 'data-part') lits(textOf(sf, n.arguments[1])).forEach((x) => native.add(x));
    }
    ts.forEachChild(n, scanNative);
  };
  scanNative(sf);
  return { native: [...native], sites, compoundUses, imports, imperative, carriers: Object.fromEntries(carriers), callerPartIds: [...callerPartIds], callerStateIds: [...callerStateIds] };
}

// classify one engine-site attribute sequence
function classify(seq) {
  const out = { part: 'keeps', state: 'keeps', canonicalPart: null };
  // part
  let lastPartIdx = -1, lastRestPartIdx = -1, lastEnginePartIdx = -1, callerIdPart = false;
  seq.forEach((x, i) => {
    if (x.kind === 'rest' && x.part) lastRestPartIdx = i;
    if (x.kind === 'part') { lastPartIdx = i; if (x.caller) callerIdPart = true; else { lastEnginePartIdx = i; } }
  });
  const partStamp = seq.filter((x) => x.kind === 'part');
  const lit = partStamp.map((x) => [...String(x.value).matchAll(/["'`]([a-z0-9-]+)["'`]/g)].map((m) => m[1])).flat();
  out.canonicalPart = lit.length ? [...new Set(lit)].join('|') : null;
  if (callerIdPart) out.part = 'part-replace';
  else if (lastRestPartIdx > -1 && lastEnginePartIdx > -1 && lastRestPartIdx > lastEnginePartIdx) out.part = 'part-replace';
  else if (lastRestPartIdx > -1 && partStamp.length === 0) out.part = 'part-forward';
  // state
  const restStateIdx = seq.map((x, i) => (x.kind === 'rest' && x.state ? i : -1)).filter((i) => i > -1);
  const states = seq.map((x, i) => ({ ...x, i })).filter((x) => x.kind === 'state');
  const callerState = states.some((x) => x.caller);
  if (callerState) out.state = 'state-forward';
  else if (restStateIdx.length) {
    const lastRest = Math.max(...restStateIdx);
    const after = states.filter((x) => x.i > lastRest);
    const before = states.filter((x) => x.i < lastRest);
    if (after.length === 0) out.state = before.length ? 'state-forward' : 'state-forward';
    else if (after.every((x) => x.cond)) out.state = 'state-rest';
    out.engineStampsState = states.length > 0;
  }
  return out;
}

// ---------- run ----------
const fileResults = new Map();
for (const f of allFiles) fileResults.set(f, analyzeFile(f));

const engineSites = [];
const structuralSites = [];
for (const [f, r] of fileResults) {
  const m = rel(f).match(/components\/(.*)\/([^/]+)\/engines\/(classic|modern|rustic)\/index\.tsx$/);
  const isEngine = Boolean(m);
  for (const s of r.sites) {
    const c = classify(s.seq);
    const row = {
      file: rel(f), line: s.line, tag: s.tag, intrinsic: s.intrinsic,
      engine: m ? m[3] : null, family: m ? m[2] : (rel(f).match(/\/([^/]+)\/compound\//)?.[1] ?? rel(f).split('/').slice(-2, -1)[0]), subpart: rel(f).match(/\/compound\/([^/]+)\//)?.[1] ?? null, layer: rel(f).split('/')[3],
      part: c.part, state: c.state, canonicalPart: c.canonicalPart, engineStampsState: c.engineStampsState ?? null,
      classNameHook: s.classNameHook, dsClass: s.dsClass ?? false, componentStyle: s.componentStyle ?? false, antPaintClass: s.antPaintClass ?? false, owner: s.owner?.name, publicOwner: s.owner?.public ?? false, tagKind: s.tagKind,
      seq: s.seq.map((x) => x.kind === 'rest' ? `rest(${x.via}${x.part ? ',part' : ''}${x.state ? ',state' : ''})` : `${x.kind}${x.caller ? '[caller]' : ''}${x.cond ? '?' : ''}=${String(x.value).slice(0, 60)}`),
      isEngine,
    };
    (isEngine ? engineSites : structuralSites).push(row);
  }
}

// family-level skin info
for (const row of [...engineSites, ...structuralSites]) {
  row.familyHasSkin = familiesWithSkin.has(row.family);
  row.engineSkinFiles = [...new Set(skinSelectors.filter((s) => s.family === row.family && (row.engine === 'modern' ? ['modern', 'presentation'] : row.engine === 'rustic' ? ['rustic', 'presentation'] : row.engine === 'classic' ? ['presentation'] : ['modern', 'rustic', 'presentation']).includes(s.kind)).map((s) => s.file))];
  row.engineSkinSelectorTotal = skinSelectors.filter((s) => row.engineSkinFiles.includes(s.file)).length;
  // C2 element-level condition (e): DS-owned class, stamped part, or a family skin selector whose
  // rightmost compound targets this element's tag (e.g. `.ds-toggle--modern input`).
  const realTag = /^[a-z][a-z0-9]*$/.test(row.tag) ? row.tag : null;
  const tagReach = realTag ? skinSelectors.filter((x) => row.engineSkinFiles.includes(x.file)).filter((x) => {
    const last = x.selector.split(/\s*[>+~]\s*|\s+/).filter(Boolean).pop() ?? '';
    return new RegExp(`^${realTag}(?=[.:\\[#]|$)`).test(last);
  }).length : 0;
  // (iv) the component itself applies paint: component-authored inline style, or an
  // Ant/engine-owned paint class/root (an Ant component root, or an ant-* class it authors)
  const antRoot = row.tagKind === 'ant';
  row.elementPaint = { dsClass: row.dsClass, stampedPart: Boolean(row.canonicalPart), skinTagSelectors: tagReach, componentStyle: row.componentStyle, antPaint: antRoot || row.antPaintClass };
  row.elementPainted = row.dsClass || Boolean(row.canonicalPart) || tagReach > 0 || row.componentStyle || antRoot || row.antPaintClass;
  const parts = (row.canonicalPart ?? '').split('|').filter(Boolean);
  let partRules = 0, stateRules = 0; const files = {};
  for (const p of parts) {
    const a = skinCount({ family: row.family, part: p, engine: row.engine });
    const b = skinCount({ family: row.family, part: p, stateOnly: true, engine: row.engine });
    partRules += a.count; stateRules += b.count;
    for (const [k, v] of Object.entries(a.byFile)) files[k] = (files[k] ?? 0) + v;
  }
  row.skinRulesOnCanonicalPart = partRules;
  row.skinStateRulesOnCanonicalPart = stateRules;
  row.skinFiles = files;
}

// ---------- compound: caller data-part/state passed to a skinned component ----------
const breachingFamilies = new Map(); // family -> {part:Set(engines), state:Set}
for (const r of engineSites) {
  if (!breachingFamilies.has(r.family)) breachingFamilies.set(r.family, { part: new Set(), state: new Set(), stateRest: new Set() });
  const b = breachingFamilies.get(r.family);
  if (r.part === 'part-replace' || r.part === 'part-forward') b.part.add(`${r.engine}:${r.part}`);
  if (r.state === 'state-forward') b.state.add(r.engine);
  if (r.state === 'state-rest') b.stateRest.add(r.engine);
}
const kebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
function resolveFamily(file, tag, imp) {
  const name = tag.split('.')[0];
  const cand = kebab(name);
  if (imp) {
    let base = null;
    if (imp.spec.startsWith('.')) base = resolve(dirname(file), imp.spec);
    else if (imp.spec.startsWith('@/')) base = join(SRC, imp.spec.slice(2));
    if (base) {
      for (const [dir, fam] of familyDirs) if (base === dir || base.startsWith(dir + '/')) return { family: fam, how: 'import-path' };
    }
  }
  const dirs = familyByName.get(cand);
  if (dirs && dirs.length) return { family: cand, how: 'tag-name' };
  return null;
}
const NATIVE_PARTS = new Set(); for (const r of fileResults.values()) for (const x of r.native) NATIVE_PARTS.add(x);
const compoundSites = [];
for (const [f, r] of fileResults) {
  for (const u of r.compoundUses) {
    const res = resolveFamily(f, u.tag, r.imports.get(u.tag.split('.')[0]));
    if (!res) continue;
    const b = breachingFamilies.get(res.family);
    if (!b) continue;
    const parts = (u.part ?? '').split('|').filter(Boolean);
    // v2 owner-skin attribution: nearest ancestor skin family, plus skin families named by a
    // hyphen-join of contiguous ancestor dirs (collection-workspace/render-dispatch ->
    // collection-workspace-render-dispatch) and families prefixed by the nearest one
    // (data-table -> data-table-mobile). v1 used only the nearest single-segment match.
    const dirSegs = rel(f).replace('packages/core/src/components/', '').split('/').slice(0, -1);
    const ownerSkins = new Set();
    const callerPartsForOwner = (u.part ?? '').split('|').filter(Boolean);
    const callerOnly = callerPartsForOwner.length > 0 && callerPartsForOwner.every((cp) => !NATIVE_PARTS.has(cp));
    const selects = (fam) => callerPartsForOwner.some((cp) => skinSelectors.some((y) => y.family === fam && partRe(cp).test(y.selector)));
    // rule 1: nearest skinned single-segment ancestor (the v1 rule), any part
    const nearest = [...dirSegs].reverse().find((x) => familiesWithSkin.has(x)) ?? null;
    if (nearest) ownerSkins.add(nearest);
    // rule 2: sub-skins named by a hyphen-join of >=2 contiguous ancestor dirs, any part
    for (let i = 0; i < dirSegs.length; i++) for (let j = i + 2; j <= Math.min(dirSegs.length, i + 3); j++) {
      const name = dirSegs.slice(i, j).join('-');
      if (familiesWithSkin.has(name)) ownerSkins.add(name);
    }
    // rule 3: other skinned ancestors and `<skinned ancestor>-<suffix>` sub-skins, only for
    // caller-only part names (never stamped natively), so `root` cannot over-attribute
    if (callerOnly) for (const fam of familiesWithSkin) {
      if (ownerSkins.has(fam)) continue;
      const isAncestor = dirSegs.includes(fam);
      const isSubSkin = dirSegs.some((x) => familiesWithSkin.has(x) && fam.startsWith(x + '-'));
      if ((isAncestor || isSubSkin) && selects(fam)) ownerSkins.add(fam);
    }
    const ownerSkinFamily = nearest ?? ([...ownerSkins][0] ?? null);
    const ownerSkinList = [...ownerSkins];
    let rules = 0; const byFile = {};
    for (const fam of ownerSkinList) for (const p of parts) { const a = skinCount({ family: fam, part: p }); rules += a.count; for (const [k, v] of Object.entries(a.byFile)) byFile[k] = (byFile[k] ?? 0) + v; }
    // C1: caller-STATE dependents -- owner-skin rules that select the caller's data-state value
    let stateRules = 0; const stateByFile = {}; const stateValues = []; let stateDynamic = false; const stateSelectorsHit = [];
    if (u.state) {
      const vals = [...String(u.state).matchAll(/["'`]([A-Za-z0-9_-]+)["'`]/g)].map((m) => m[1]);
      stateDynamic = vals.length === 0;
      stateValues.push(...vals);
      const callerParts = (u.part ?? '').split('|').filter(Boolean);
      for (const x of skinSelectors.filter((y) => ownerSkinList.includes(y.family) && /\[data-state/.test(y.selector))) {
        const sel = x.selector;
        if (callerParts.length && !callerParts.some((cp) => partRe(cp).test(sel))) continue;
        const selVals = [...sel.matchAll(/\[data-state\s*([~|^$*]?)=\s*["']?([^"'\]]+)["']?\s*\]/g)].map((m) => ({ op: m[1], v: m[2] }));
        const hit = stateDynamic ? true : selVals.some(({ op, v }) => vals.some((cv) => (op === '*' ? cv.includes(v) : op === '^' ? cv.startsWith(v) : op === '$' ? cv.endsWith(v) : cv === v)));
        if (hit) { stateRules++; stateByFile[x.file] = (stateByFile[x.file] ?? 0) + 1; stateSelectorsHit.push(x.file + ' :: ' + sel); }
      }
    }
    compoundSites.push({
      callerStateValues: stateValues, stateSelectorsHit, callerStateDynamic: stateDynamic, skinRulesSelectingCallerState: stateRules, stateSkinFiles: stateByFile,
      file: rel(f), line: u.line, tag: u.tag, childFamily: res.family, resolvedBy: res.how,
      callerPart: u.part, callerState: u.state, ownerSkinFamily, ownerSkins: ownerSkinList,
      childPartBreachEngines: [...b.part], childStateForwardEngines: [...b.state], childStateRestEngines: [...b.stateRest],
      skinRulesSelectingCallerPart: rules, skinFiles: byFile,
    });
  }
}

const nativeParts = new Set(); for (const r of fileResults.values()) for (const x of r.native) nativeParts.add(x);
for (const c of compoundSites) c.callerPartNativelyStamped = (c.callerPart ?? '').split('|').filter(Boolean).some((x) => nativeParts.has(x));
return { nativeParts: [...nativeParts].sort(), engineSites, structuralSites, compoundSites, familiesWithSkin: [...familiesWithSkin].sort(), engineFileCount: [...fileResults.keys()].filter((f) => /\/engines\/(classic|modern|rustic)\/index\.tsx$/.test(f)).length, skinSelectorCount: skinSelectors.length };
}
