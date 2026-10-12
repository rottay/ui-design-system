/**
 * P-88 pass-through census -- the sweep's AST HELPERS (WO-ARC-12): what ONE source file hands the
 * sweep (analyzeFile: its pass-through sites, compound caller uses, natively stamped parts and
 * import table) and how one site's attribute sequence reads (classify). READ-ONLY.
 *
 * This is the `AST helpers` section of ../index.mjs moved here verbatim (census v7.1.8, 2026-10-12:
 * the structure law's 800-line limit); no measurement moves. The section closes over nothing of the
 * sweep but the tree's `typescript`, which createSweepAst receives. The pinned copy is
 * arc12/census-v718/ast/index.mjs, byte-identical to this file; ../index.mjs names its sha256.
 */
import { readFileSync } from 'node:fs';

/** @param {{ ts: typeof import('typescript') }} options  ts = the measured tree's own typescript. */
export function createSweepAst({ ts } = {}) {
if (!ts) throw new Error('createSweepAst: ts (the typescript module of the measured tree) is required');
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
  // v7.1.3 (ARC-12): the NON-LITERAL caller form. `{...partAttributes('<part>', <state>)}` hands an
  // opener the same data-part/data-state a literal attribute does, and until now only the literal
  // form made a caller row (22 spread callers onto Box/Flex were absent, step-3 pre-flight D-3 N).
  // The part is the call's first argument when it is a string literal, or a ternary of them; the
  // state is `serializeState(<second argument>)`, which is what the helper emits -- a dynamic
  // state, never read for literals. Fail-closed: a part that is not static is not guessed, it is
  // reported (class `unresolvable`). The callee is matched by name, as everywhere in this sweep.
  const partCallInits = new Map(); // name -> initializer that mentions partAttributes(...)
  const collectPartCalls = (n) => {
    if (ts.isVariableDeclaration(n) && ts.isIdentifier(n.name) && n.initializer && /\bpartAttributes\s*\(/.test(textOf(sf, n.initializer))) partCallInits.set(n.name.text, n.initializer);
    ts.forEachChild(n, collectPartCalls);
  };
  collectPartCalls(sf);
  const staticParts = (expr) => {
    const e = unwrap(expr);
    if (!e) return null;
    if (ts.isStringLiteral(e) || ts.isNoSubstitutionTemplateLiteral(e)) return e.text ? [e.text] : null;
    if (ts.isConditionalExpression(e)) { const a = staticParts(e.whenTrue), b = staticParts(e.whenFalse); return a && b ? [...a, ...b] : null; }
    return null;
  };
  const oneLine = (n) => (n ? textOf(sf, n).replace(/\s+/g, ' ') : '');
  // -> [{ parts: string[] | null, unresolved: string | null, state: string | null, cond: boolean }] in source order
  const spreadPartCalls = (expr, cond = false, depth = 0) => {
    const e = unwrap(expr);
    if (!e || depth > 4) return [];
    if (ts.isCallExpression(e) && ts.isIdentifier(e.expression) && e.expression.text === 'partAttributes') {
      const [partArg, stateArg] = e.arguments;
      const parts = partArg ? staticParts(partArg) : null;
      const stateArgU = stateArg ? unwrap(stateArg) : null;
      const resting = Boolean(stateArgU) && ts.isObjectLiteralExpression(stateArgU) && stateArgU.properties.length === 0;
      return [{ parts, unresolved: parts ? null : (oneLine(partArg) || '(no argument)'), state: resting ? null : `serializeState(${oneLine(stateArg)})`, cond }];
    }
    if (ts.isConditionalExpression(e)) return [...spreadPartCalls(e.whenTrue, true, depth + 1), ...spreadPartCalls(e.whenFalse, true, depth + 1)];
    if (ts.isBinaryExpression(e)) return spreadPartCalls(e.right, true, depth + 1);
    if (ts.isObjectLiteralExpression(e)) {
      const inner = e.properties.filter((pr) => ts.isSpreadAssignment(pr)).flatMap((pr) => spreadPartCalls(pr.expression, cond, depth + 1));
      // an own data-part key beside the spread decides the part by key order: not resolved here
      const ownPart = e.properties.some((pr) => !ts.isSpreadAssignment(pr) && propName(pr.name) === 'data-part');
      return inner.length && ownPart ? inner.map((x) => ({ ...x, parts: null, unresolved: oneLine(e).slice(0, 120) })) : inner;
    }
    if (ts.isIdentifier(e)) {
      if (objects.has(e.text)) return spreadPartCalls(objects.get(e.text), cond, depth + 1);
      if (partCallInits.has(e.text)) return spreadPartCalls(partCallInits.get(e.text), cond, depth + 1);
    }
    return [];
  };
  const visitJsx = (n) => {
    if (ts.isJsxOpeningElement(n) || ts.isJsxSelfClosingElement(n)) {
      const tag = textOf(sf, n.tagName);
      const seq = [];
      let classNameHook = false;
      let dsClass = false;
      let componentStyle = false;
      let antPaintClass = false;
      let literalCallerPart = null, literalCallerState = null;
      let spreadForm = false, spreadState = false, spreadPartUnresolved = null; // v7.1.3
      for (const a of n.attributes.properties) {
        if (ts.isJsxSpreadAttribute(a)) {
          seq.push(...entriesOfSpread(a.expression));
          for (const sp of spreadPartCalls(a.expression)) { // v7.1.3
            spreadForm = true;
            if (sp.parts) {
              const merged = sp.cond && literalCallerPart ? [...literalCallerPart.split('|'), ...sp.parts] : sp.parts;
              literalCallerPart = [...new Set(merged)].join('|');
              if (!sp.cond) spreadPartUnresolved = null;
            } else {
              spreadPartUnresolved = [...(spreadPartUnresolved ?? []), sp.unresolved];
              if (!sp.cond) literalCallerPart = null;
            }
            if (sp.state) { literalCallerState = sp.state; spreadState = true; }
          }
        }
        else if (ts.isJsxAttribute(a)) {
          const k = a.name.getText(sf);
          const init = a.initializer && ts.isJsxExpression(a.initializer) ? a.initializer.expression : a.initializer;
          if (k === 'data-part') {
            spreadPartUnresolved = null;
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
            spreadState = false;
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
      if (/^[A-Z]/.test(tag) && (literalCallerPart || literalCallerState || spreadPartUnresolved)) {
        const use = { line: lineOf(sf, n), tag, part: literalCallerPart, state: literalCallerState };
        // v7.1.3: a row a partAttributes spread fed carries its form; a literal-only row is unchanged
        if (spreadForm) use.spread = { state: spreadState, partUnresolved: spreadPartUnresolved };
        compoundUses.push(use);
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
  // v7.1: what a caller tag IS when its family does not resolve (tagKind), and -- for a local
  // binding -- its initializer. A tag bound to a string/template literal is an intrinsic element.
  const localInits = new Map();
  const scanInits = (n) => {
    if (ts.isVariableDeclaration(n) && ts.isIdentifier(n.name) && n.initializer) localInits.set(n.name.text, unwrap(n.initializer));
    ts.forEachChild(n, scanInits);
  };
  scanInits(sf);
  const intrinsicInit = (e) => Boolean(e) && (ts.isStringLiteralLike(e) || ts.isTemplateExpression(e)
    || (ts.isConditionalExpression(e) && intrinsicInit(unwrap(e.whenTrue)) && intrinsicInit(unwrap(e.whenFalse))));
  for (const u of compoundUses) {
    const init = localInits.get(u.tag.split('.')[0]);
    u.tagKind = tagKind(u.tag);
    u.localInit = init ? textOf(sf, init).replace(/\s+/g, ' ').slice(0, 120) : null;
    u.localIntrinsic = intrinsicInit(init);
  }
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

return { analyzeFile, classify };
}
