// Dependent attribution (census v7). READ-ONLY.
//  v4 (review-arc12-c4c6, 304b6e7c, M1/M2):
//  - C4: a caller under engines/<e>/ is credited only with rules from runtime/engines/<e>/skin
//    and presentation; engine-agnostic callers keep every engine's rules (v5: C4 ENGINE SCOPE).
//  - Rule 4b (rule 4 as worded is NOT implemented): a selector with [data-part='<p>'] outside the
//    census-attributed owner skins counts only if (a) it carries a ds-* class emitted by the
//    caller file, (b) every emitter of that class (non-test .ts/.tsx under
//    packages/core/src/components) lies under the caller's component root (caller path minus
//    /index.tsx and minus a trailing /engines/<e>), and (c) it is within the caller's C4 scope.
//  v6: C7 COMPOUND-SATISFIABILITY (review-arc12-l05-h1 §2).
//  v7: C8 ANCESTOR-UNSATISFIABILITY (review-arc12-het-adjudication §1), C9 ATTRIBUTE-LITERAL
//      CONTRADICTION (review-arc12-l13-holds-adjudication §1), C10 FOREIGN-ANCHOR NAME CREDIT
//      (same ruling §3). Every strike is attributed per rule; all rules are EVALUATED on every
//      credited rule (so overlaps are visible) and a rule counts as struck iff an ENABLED rule
//      strikes it. `opts.rules` selects the enabled set (v6 = ['C7']); `opts.bypass` disables one
//      clause (drill isolation only); `opts.overlay` maps repo-relative paths to file contents
//      (drill mutants; overlay files are added to every index).
//  Selector parsing is paren-aware (commas inside :is()/:where() do not split).
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative, dirname, resolve as resolvePath } from 'node:path';
import { createRequire } from 'node:module';

const SKIN_DIRS = ['runtime/engines/modern/skin', 'runtime/engines/rustic/skin', 'presentation/components/skin'];
const esc = (x) => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
export const ALL_RULES = Object.freeze(['C7', 'C8', 'C9', 'C10']);

function walk(d, keep) {
  const out = [];
  if (!existsSync(d)) return out;
  for (const n of readdirSync(d)) {
    const p = join(d, n);
    if (statSync(p).isDirectory()) { if (!/^(tests|stories|__tests__|node_modules)$/.test(n)) out.push(...walk(p, keep)); } else if (keep(p)) out.push(p);
  }
  return out;
}
export function parseSelectors(text) {
  text = text.replace(/\/\*[\s\S]*?\*\//g, '');
  const out = []; let buf = ''; let dp = 0;
  for (const ch of text) {
    if (ch === '(') dp += 1;
    if (ch === ')') dp -= 1;
    if (ch === '{' && dp === 0) {
      const pre = buf.trim(); buf = '';
      if (!pre.startsWith('@')) {
        let d = 0; let cur = '';
        for (const c of pre) { if (c === '(') d += 1; if (c === ')') d -= 1; if (c === ',' && d === 0) { out.push(cur.trim()); cur = ''; } else cur += c; }
        if (cur.trim()) out.push(cur.trim());
      }
      continue;
    }
    if ((ch === '}' || ch === ';') && dp === 0) { buf = ''; continue; }
    buf += ch;
  }
  return out;
}

export function buildAttribution(repo, opts = {}) {
  repo = resolvePath(repo);
  const rules = new Set(opts.rules ?? ALL_RULES);
  const bypass = new Set(opts.bypass ?? []);
  const overlay = opts.overlay ?? {};
  const on = (r) => rules.has(r);
  const by = (k) => bypass.has(k);
  const read = (rel) => (Object.prototype.hasOwnProperty.call(overlay, rel) ? overlay[rel] : readFileSync(join(repo, rel), 'utf8'));
  const exists = (rel) => Object.prototype.hasOwnProperty.call(overlay, rel) || existsSync(join(repo, rel));
  const cssRootRel = 'packages/core/src/foundation/tokens/css';
  const compRel = 'packages/core/src/components';
  const srcRel = 'packages/core/src';
  const listRel = (dirRel, keep) => {
    const set = new Set(walk(join(repo, dirRel), keep).map((f) => relative(repo, f)));
    for (const k of Object.keys(overlay)) if (k.startsWith(dirRel + '/') && keep(k) && !/\/(tests|stories|__tests__)\//.test(k)) set.add(k);
    return [...set];
  };

  const skin = [];
  for (const dir of SKIN_DIRS) for (const f of listRel(`${cssRootRel}/${dir}`, (p) => p.endsWith('.css'))) {
    const rel = f.slice(cssRootRel.length + 1);
    const eng = (rel.match(/runtime\/engines\/(modern|rustic)\/skin/) || [])[1] || null;
    for (const s of parseSelectors(read(f))) skin.push({ rel, eng, s });
  }
  // C4 ENGINE SCOPE (binding text, review-arc12-m1-assertion §2). Resolved after the emitter index.
  const markerFor = (e, s) => new RegExp(`\\.ds-engine-${e}\\b|\\[data-engine=['"]?${e}|-${e}\\b`).test(s);
  const compFiles = listRel(compRel, (p) => /\.(tsx|ts)$/.test(p) && !/\.(test|stories)\./.test(p) && !/\.d\.ts$/.test(p));
  const compText = new Map(compFiles.map((f) => [f, read(f)]));
  // class emitters (ds-* only: 4b / C7 / C8 ownership)
  const classEmitters = new Map();
  for (const [rel, t] of compText) for (const k of new Set(t.match(/\bds-[a-z0-9][a-z0-9_-]*/g) || [])) { if (!classEmitters.has(k)) classEmitters.set(k, new Set()); classEmitters.get(k).add(rel); }
  // ANCHOR emitters: .ds-* / .rottay-* classes, and [data-pattern=…] / [data-component=…] values
  const anchorEmitters = new Map();
  const addEm = (k, f) => { if (!anchorEmitters.has(k)) anchorEmitters.set(k, new Set()); anchorEmitters.get(k).add(f); };
  for (const [f, t] of compText) {
    for (const k of new Set(t.match(/\b(?:ds|rottay)-[a-z0-9][a-z0-9_-]*/g) || [])) addEm('class:' + k, f);
    for (const m of t.matchAll(/data-(pattern|component)["']?\s*[=:]\s*\{?\s*["'`]([a-z0-9_-]+)["'`]/g)) addEm(`attr:${m[1]}=${m[2]}`, f);
  }
  const anchorsOf = (sel) => [
    ...[...new Set(sel.match(/\.((?:ds|rottay)-[a-z0-9][a-z0-9_-]*)/g) || [])].map((c) => 'class:' + c.slice(1)),
    ...[...sel.matchAll(/\[data-(pattern|component)=['"]?([a-z0-9_-]+)['"]?\]/g)].map((m) => `attr:${m[1]}=${m[2]}`),
  ];
  const scopeRows = [];
  for (const r of skin) {
    if (!r.eng) { r.scope = 'ALL'; r.scopeClass = 'presentation'; continue; }
    const e = r.eng;
    const anchors = anchorsOf(r.s).map((a) => ({ a, em: [...(anchorEmitters.get(a) || [])] }));
    if (markerFor(e, r.s)) { r.scope = e; r.scopeClass = 'MARKED'; }
    else if (anchors.some(({ em }) => em.length > 0 && em.every((f) => f.includes(`/engines/${e}/`)))) { r.scope = e; r.scopeClass = 'ANCHORED'; }
    else if (anchors.some(({ em }) => em.length > 0)) { r.scope = 'ALL'; r.scopeClass = 'CROSS'; }
    else { r.scope = e; r.scopeClass = 'UNRESOLVED'; }
    if (/\[data-part=/.test(r.s)) scopeRows.push({ file: r.rel, selector: r.s, engine: e, scopeClass: r.scopeClass, anchors: anchors.filter(({ em }) => em.length).map(({ a, em }) => ({ anchor: a, emitters: em })) });
  }
  const countClass = (c) => scopeRows.filter((x) => x.scopeClass === c).length;
  const cross = scopeRows.filter((x) => x.scopeClass === 'CROSS');
  const assertion = {
    partSelectingEngineRules: scopeRows.length,
    marked: countClass('MARKED'),
    anchored: countClass('ANCHORED'),
    anchoredByAttr: scopeRows.filter((x) => x.scopeClass === 'ANCHORED' && !x.anchors.some((a) => a.anchor.startsWith('class:') && a.emitters.every((f) => f.includes(`/engines/${x.engine}/`)))).length,
    crossRows: cross.length,
    crossDistinct: new Set(cross.map((x) => x.file + '#' + x.selector)).size,
    crossRoster: [...new Set(cross.map((x) => x.file + '#' + x.selector))].sort(),
    crossDetail: cross,
    unresolved: scopeRows.filter((x) => x.scopeClass === 'UNRESOLVED').map((x) => ({ file: x.file, selector: x.selector })),
    passes: countClass('UNRESOLVED') === 0,
    violations: scopeRows.filter((x) => x.scopeClass === 'UNRESOLVED'),
  };
  const fileClasses = new Map();
  const dsClasses = (file) => {
    if (!fileClasses.has(file)) fileClasses.set(file, new Set(read(file).match(/\bds-[a-z0-9][a-z0-9_-]*/g) || []));
    return fileClasses.get(file);
  };
  const compRoot = (file) => file.replace(/\/index\.tsx?$/, '').replace(/\/engines\/(modern|rustic|classic|foundation)$/, '');
  const ownedBy = (k, file) => { const root = compRoot(file) + '/'; return [...(classEmitters.get(k) || [])].every((e) => e.startsWith(root)); };

  // ---- selector helpers (C7..C10) ----
  const compoundsOf = (sel) => { const out = []; let cur = ''; let d = 0; let br = 0; for (const ch of sel) { if (ch === '(') d += 1; if (ch === ')') d -= 1; if (ch === '[') br += 1; if (ch === ']') br -= 1; if (d === 0 && br === 0 && /[\s>+~]/.test(ch)) { if (cur.trim()) out.push(cur.trim()); cur = ''; continue; } cur += ch; } if (cur.trim()) out.push(cur.trim()); return out; };
  const topLevel = (cmp) => { let o = ''; let d = 0; for (const ch of cmp) { if (ch === '(') { d += 1; continue; } if (ch === ')') { d -= 1; continue; } if (d === 0) o += ch; } return o; };
  const c7Owned = (k, file) => { const root = compRoot(file) + '/'; const em = [...(classEmitters.get(k) || [])]; return em.length > 0 && em.every((e) => e.startsWith(root)); };
  const tokenResOf = (caller) => String(caller.callerPart ?? '').split('|').filter(Boolean).map((p) => new RegExp(`\\[data-part=(['"])${esc(p)}\\1\\]`));
  /** Split S at depth-0 compounds; returns { all, carryingIdx, nested } for C's part token. */
  function tokenShape(caller, sel, extra = null) {
    const tokenRes = tokenResOf(caller);
    const all = compoundsOf(sel);
    // v7: ANY occurrence inside a functional pseudo counts as nested, even beside a top-level one
    const countIn = (re, t) => (t.match(new RegExp(re.source, "g")) || []).length;
    const nested = all.some((cmp) => tokenRes.some((re) => countIn(re, cmp) > countIn(re, topLevel(cmp))));
    const carryingIdx = all.map((cmp, i) => (tokenRes.some((re) => re.test(topLevel(cmp))) && (!extra || extra.test(topLevel(cmp))) ? i : -1)).filter((i) => i >= 0);
    return { tokenRes, all, nested, carryingIdx };
  }

  const tagCache = new Map();
  function openingTag(file, line, child) {
    const key = file + ':' + line + ':' + child;
    if (tagCache.has(key)) return tagCache.get(key);
    let text = read(file).split('\n').slice(line - 1).join('\n');
    const at = child ? text.search(new RegExp('<' + String(child).replace(/[.]/g, '\\.') + '(?![A-Za-z0-9_])')) : -1;
    if (at < 0) { const r = { static: false, classes: new Set(), located: false, text: '', spread: true }; tagCache.set(key, r); return r; }
    text = text.slice(at);
    let d = 0; let end = -1; let inStr = null;
    for (let i = 0; i < text.length; i += 1) {
      const ch = text[i];
      if (inStr) { if (ch === inStr && text[i - 1] !== '\\') inStr = null; continue; }
      if (ch === '"' || ch === "'" || ch === '`') { inStr = ch; continue; }
      if (ch === '{') d += 1; else if (ch === '}') d -= 1;
      else if (ch === '>' && d === 0 && i > 0) { end = i; break; }
    }
    const tag = end > 0 ? text.slice(0, end + 1) : text.slice(0, 400);
    const spread = /\{\s*\.\.\./.test(tag);
    const lit = tag.match(/\bclassName\s*=\s*"([^"]*)"/) || tag.match(/\bclassName\s*=\s*'([^']*)'/) || tag.match(/\bclassName\s*=\s*\{\s*['"]([^'"`]*)['"]\s*\}/);
    const anyClassName = /\bclassName\s*=/.test(tag);
    const r = { static: !spread && (!anyClassName || !!lit), classes: new Set(lit ? lit[1].split(/\s+/).filter(Boolean) : []), located: true, text: tag, spread };
    tagCache.set(key, r);
    return r;
  }

  // ---- C7 COMPOUND-SATISFIABILITY (review-arc12-l05-h1 §2, binding) ----
  /** true iff C7 strikes selector `sel` for caller (file, line, child, part tokens); `extra` = an
   *  additional top-level requirement each carrying compound must have to be considered (state). */
  function c7Strikes(caller, sel, extra = null) {
    const tokenRes = tokenResOf(caller);
    if (!tokenRes.length) return false; // no part token: (i) cannot hold -> keep (fail-closed)
    const tag = openingTag(caller.file, caller.line, caller.child);
    if (!tag.static) return false; // (ii)
    const all = compoundsOf(sel);
    const nested = all.some((cmp) => tokenRes.some((re) => re.test(cmp) && !re.test(topLevel(cmp))));
    if (nested) return false; // (i)
    const carrying = all.filter((cmp) => tokenRes.some((re) => re.test(topLevel(cmp))) && (!extra || extra.test(topLevel(cmp))));
    if (!carrying.length) return false;
    return carrying.every((cmp) => (topLevel(cmp).match(/\.(ds-[a-z0-9][a-z0-9_-]*)/g) || []).map((x) => x.slice(1)).some((k) => c7Owned(k, caller.file) && !tag.classes.has(k))); // (iii)
  }

  // ---- TypeScript AST helpers (C8 / C9 / C10) ----
  const require = createRequire(join(repo, 'packages/core/package.json'));
  const ts = require('typescript');
  const astCache = new Map();
  const ast = (rel) => { if (!astCache.has(rel)) astCache.set(rel, ts.createSourceFile(rel, read(rel), ts.ScriptTarget.Latest, true, rel.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS)); return astCache.get(rel); };
  const lineOf = (sf, n) => sf.getLineAndCharacterOfPosition(n.getStart(sf)).line + 1;
  const unwrap = (e) => { while (e && (ts.isAsExpression(e) || ts.isParenthesizedExpression(e) || (ts.isSatisfiesExpression && ts.isSatisfiesExpression(e)) || ts.isNonNullExpression(e))) e = e.expression; return e; };
  const topStatement = (n, sf) => { let cur = n; while (cur.parent && cur.parent !== sf) cur = cur.parent; return cur; };
  const isExportedStmt = (st, sf) => {
    const mods = (ts.canHaveModifiers && ts.canHaveModifiers(st) ? ts.getModifiers(st) : st.modifiers) || [];
    if (mods.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)) return true;
    const name = ts.isFunctionDeclaration(st) && st.name ? st.name.text : ts.isVariableStatement(st) && ts.isIdentifier(st.declarationList.declarations[0].name) ? st.declarationList.declarations[0].name.text : null;
    if (!name) return false;
    for (const s of sf.statements) {
      if (ts.isExportAssignment(s) && ts.isIdentifier(unwrap(s.expression)) && unwrap(s.expression).text === name) return true;
      if (ts.isExportDeclaration(s) && !s.moduleSpecifier && s.exportClause && ts.isNamedExports(s.exportClause) && s.exportClause.elements.some((el) => (el.propertyName ?? el.name).text === name)) return true;
    }
    return false;
  };

  // module resolution for the static import closure (C10 (iii)) and type / writer resolution
  const resolveSpec = (fromRel, spec) => {
    let baseRel;
    if (spec.startsWith('.')) baseRel = relative(repo, resolvePath(join(repo, dirname(fromRel)), spec));
    else if (spec.startsWith('@/')) baseRel = `${srcRel}/${spec.slice(2)}`;
    else if (spec.startsWith('@rottay/')) return { unresolved: true };
    else return { external: true };
    if (/\.(css|scss|json|svg|png|woff2?)$/.test(spec)) return { asset: true };
    for (const cand of [baseRel, `${baseRel}.tsx`, `${baseRel}.ts`, `${baseRel}/index.tsx`, `${baseRel}/index.ts`, baseRel.replace(/\.js$/, '.ts'), baseRel.replace(/\.js$/, '.tsx')]) {
      if (/\.(tsx?|mjs)$/.test(cand) && exists(cand)) return { file: cand };
    }
    return { unresolved: true };
  };
  const directDeps = new Map();
  function depsOf(rel) {
    if (directDeps.has(rel)) return directDeps.get(rel);
    const sf = ast(rel);
    const out = { files: new Set(), unresolved: [] };
    const take = (spec, typeOnly) => {
      if (typeOnly) return; // type-only imports cannot render or emit
      const r = resolveSpec(rel, spec);
      if (r.file) out.files.add(r.file); else if (r.unresolved) out.unresolved.push(spec);
    };
    for (const st of sf.statements) {
      if (ts.isImportDeclaration(st) && ts.isStringLiteral(st.moduleSpecifier)) take(st.moduleSpecifier.text, Boolean(st.importClause && st.importClause.isTypeOnly));
      if (ts.isExportDeclaration(st) && st.moduleSpecifier && ts.isStringLiteral(st.moduleSpecifier)) take(st.moduleSpecifier.text, Boolean(st.isTypeOnly));
    }
    const dyn = (n) => { if (ts.isCallExpression(n) && n.expression.kind === ts.SyntaxKind.ImportKeyword && n.arguments[0] && ts.isStringLiteral(n.arguments[0])) take(n.arguments[0].text, false); ts.forEachChild(n, dyn); };
    dyn(sf);
    directDeps.set(rel, out);
    return out;
  }
  const closureCache = new Map();
  function importClosure(rel) {
    if (closureCache.has(rel)) return closureCache.get(rel);
    const seen = new Set([rel]); const queue = [rel]; const unresolved = [];
    while (queue.length) {
      const f = queue.pop();
      let d;
      try { d = depsOf(f); } catch { unresolved.push(`unparseable:${f}`); continue; }
      for (const u of d.unresolved) unresolved.push(`${f} -> ${u}`);
      for (const n of d.files) if (!seen.has(n)) { seen.add(n); queue.push(n); }
    }
    const r = { files: seen, unresolved };
    closureCache.set(rel, r);
    return r;
  }

  // ---- C10 FOREIGN-ANCHOR NAME CREDIT (review-arc12-l13-holds-adjudication §3, binding) ----
  // A rule R credited to C ONLY through owner-skin name rules 1/2/3 (not by 4b, which proves
  // ownership) is STRUCK iff the selector carrying C's part token has, in its LEFTMOST compound at
  // top level, a class K (ds-*/rottay-*) such that (ii) K has >= 1 non-test emitter and NO emitter
  // under C's component root; (iii) no K-emitter file is in the static import closure of C's
  // file. Fail-closed (iv): no class in the leftmost compound; K possibly built by a non-literal
  // (a template/concatenation prefix of K exists anywhere in the component tree); K emitted both
  // inside and outside C's root; an unresolvable import in the closure; the token inside a
  // functional pseudo -> R stays. Per (caller x rule), from the GLOBAL emitter index; no registry.
  const templatePrefixes = new Set();
  for (const t of compText.values()) {
    for (const m of t.matchAll(/\b((?:ds|rottay)-[a-z0-9_-]*)\$\{/g)) templatePrefixes.add(m[1]);
    for (const m of t.matchAll(/["'`]((?:ds|rottay)-[a-z0-9_-]*)["'`]\s*\+/g)) templatePrefixes.add(m[1]);
  }
  const nonLiteralRisk = (k) => [...templatePrefixes].some((p) => k.startsWith(p) && k !== p);
  function c10(caller, r) {
    const s = tokenShape(caller, r.s);
    if (!s.tokenRes.length || !s.carryingIdx.length) return { strike: false, why: 'no carrying compound' };
    if (s.nested && !by('C10.iv-nested')) return { strike: false, why: 'token inside a functional pseudo' };
    const left = by('C10.i-leftmost') ? s.all.map((c) => topLevel(c)).join(' ') : topLevel(s.all[0]);
    const ks = [...new Set((left.match(/\.((?:ds|rottay)-[a-z0-9][a-z0-9_-]*)/g) || []).map((x) => x.slice(1)))];
    if (!ks.length) return { strike: false, why: 'no class in the leftmost compound' };
    const root = compRoot(caller.file) + '/';
    const closure = importClosure(caller.file);
    if (closure.unresolved.length && !by('C10.iv-unresolved')) return { strike: false, why: `unresolvable import in closure (${closure.unresolved[0]})` };
    const perK = [];
    for (const k of ks) {
      const em = [...(anchorEmitters.get('class:' + k) || [])];
      if (!em.length) { perK.push({ K: k, kept: '(ii) no emitter' }); continue; } // (ii) needs >= 1 emitter
      if (!by('C10.ii') && em.some((e) => e.startsWith(root))) { perK.push({ K: k, kept: '(ii) emitted under C root' }); continue; } // (ii)
      if (!by('C10.iv-template') && nonLiteralRisk(k)) { perK.push({ K: k, kept: '(iv) a template/concatenation prefix can build K' }); continue; } // (iv)
      const inCl = em.filter((e) => closure.files.has(e));
      if (!by('C10.iii') && inCl.length) { perK.push({ K: k, kept: `(iii) K-emitter in C's import closure: ${inCl[0]}` }); continue; } // (iii)
      return { strike: true, K: k, emitterRoots: [...new Set(em.map((e) => compRoot(e)))] };
    }
    return { strike: false, why: 'no leftmost class satisfies (ii)-(iv)', perK };
  }

  // ---- C9 ATTRIBUTE-LITERAL CONTRADICTION (review-arc12-l13-holds-adjudication §1, binding) ----
  const familyDirs = new Map();
  for (const f of compFiles) { const m = f.match(/^(.*)\/engines\/(classic|modern|rustic)\/index\.tsx$/); if (m) { const name = m[1].split('/').pop(); if (!familyDirs.has(name)) familyDirs.set(name, new Set()); familyDirs.get(name).add(m[1]); } }
  const attrRe = /\[\s*([a-zA-Z_][\w-]*)\s*(?:([~|^$*]?=)\s*(?:"([^"]*)"|'([^']*)'|([^\s\]]+))\s*([iIsS])?)?\s*\]/g;
  const attrsOfCompound = (cmp) => [...topLevel(cmp).matchAll(attrRe)].map((m) => ({ A: m[1], op: m[2] ?? null, v: m[3] ?? m[4] ?? m[5] ?? null, flag: (m[6] || '').toLowerCase() }));
  const admissibleName = (A) => /^data-/.test(A) && A !== 'data-part' && A !== 'data-state';
  function contradicts(op, v, L, flag) {
    if (op === null) return false; // presence-only never contradicts
    const ci = flag === 'i';
    const a = ci ? L.toLowerCase() : L; const b = ci ? v.toLowerCase() : v;
    switch (op) {
      case '=': return a !== b;
      case '~=': return !a.split(/\s+/).filter(Boolean).includes(b);
      case '|=': return a !== b && !a.startsWith(b + '-');
      case '^=': return !(b !== '' && a.startsWith(b));
      case '$=': return !(b !== '' && a.endsWith(b));
      case '*=': return !(b !== '' && a.includes(b));
      default: return false;
    }
  }
  function staticAttrLiteral(tagText, A) {
    const a = esc(A);
    const m = tagText.match(new RegExp(`(?:^|\\s)${a}\\s*=\\s*"([^"]*)"`)) || tagText.match(new RegExp(`(?:^|\\s)${a}\\s*=\\s*'([^']*)'`)) || tagText.match(new RegExp(`(?:^|\\s)${a}\\s*=\\s*\\{\\s*(?:"([^"\`]*)"|'([^'\`]*)')\\s*\\}`));
    if (m) return { kind: 'static', L: m[1] ?? m[2] ?? m[3] ?? '' };
    if (new RegExp(`(?:^|\\s)${a}\\s*=`).test(tagText)) return { kind: 'dynamic' };
    return { kind: 'absent' };
  }
  // literal-absence proof that a module (and its static import closure) cannot produce attribute name A
  const writerProofCache = new Map();
  function moduleCannotWrite(rel, A) {
    const key = rel + '|' + A;
    if (writerProofCache.has(key)) return writerProofCache.get(key);
    const cl = importClosure(rel);
    let ok = cl.unresolved.length === 0;
    if (ok) for (const f of cl.files) {
      const t = read(f);
      if (t.includes(`'${A}'`) || t.includes(`"${A}"`) || t.includes('`' + A)) { ok = false; break; }
      if (/[`'"]data-[\w-]*\$\{/.test(t) || /data-\$\{/.test(t)) { ok = false; break; }
      for (const m of t.matchAll(/["'`](data-[\w-]*)["'`]/g)) if (A.startsWith(m[1]) && m[1] !== A) { ok = false; break; }
      if (!ok) break;
    }
    writerProofCache.set(key, ok);
    return ok;
  }
  const admissCache = new Map();
  /** forwarding proof (iv) for attribute A on the child family's engine files C lands on */
  function admissible(caller, A) {
    if (!admissibleName(A) && !by('C9.iv-name')) return { ok: false, why: `${A} is not admissible (data-part/data-state or non data-*)` };
    const dirs = familyDirs.get(caller.childFamily);
    if (!dirs || dirs.size !== 1) return { ok: false, why: `child family ${caller.childFamily} has ${dirs ? dirs.size : 0} engine dirs` };
    const dir = [...dirs][0];
    const callerEng = (caller.file.match(/\/engines\/(modern|rustic|classic)\//) || [])[1] || null;
    const engines = ['classic', 'modern', 'rustic'].filter((e) => exists(`${dir}/engines/${e}/index.tsx`) && (!callerEng || e === callerEng));
    if (!engines.length) return { ok: false, why: 'no engine file for the caller engine' };
    const key = `${dir}|${engines.join(',')}|${A}`;
    if (admissCache.has(key)) return admissCache.get(key);
    let res = { ok: true, engines };
    for (const e of engines) {
      const v = engineForwards(`${dir}/engines/${e}/index.tsx`, A);
      if (!v.ok) { res = { ok: false, why: `${e}: ${v.why}` }; break; }
    }
    admissCache.set(key, res);
    return res;
  }
  function engineForwards(rel, A) {
    const sf = ast(rel);
    const params = new Set(); const carriers = new Set(); const objects = new Map(); let destructuresA = false; const inits = new Map();
    const visit = (n) => {
      if ((ts.isFunctionDeclaration(n) || ts.isArrowFunction(n) || ts.isFunctionExpression(n)) && n.parameters[0] && ts.isIdentifier(n.parameters[0].name)) params.add(n.parameters[0].name.text);
      if (ts.isVariableDeclaration(n) && ts.isIdentifier(n.name) && n.initializer) { const i = unwrap(n.initializer); inits.set(n.name.text, i); if (ts.isObjectLiteralExpression(i)) objects.set(n.name.text, i); }
      if (ts.isObjectBindingPattern(n)) {
        for (const el of n.elements) {
          const k = el.propertyName ? (ts.isIdentifier(el.propertyName) || ts.isStringLiteral(el.propertyName) ? el.propertyName.text : null) : (ts.isIdentifier(el.name) ? el.name.text : null);
          if (k === A) destructuresA = true;
          if (el.dotDotDotToken && ts.isIdentifier(el.name)) carriers.add(el.name.text);
        }
      }
      ts.forEachChild(n, visit);
    };
    visit(sf);
    for (const p of params) if (/^(props|p|allProps|rawProps)$/.test(p)) carriers.add(p);
    for (const [name, i] of inits) if (ts.isIdentifier(i) && carriers.has(i.text)) carriers.add(name);
    if (destructuresA && !by('C9.iv-destructure')) return { ok: false, why: `destructures ${A}` };
    const roots = [];
    const isCarrierSpread = (expr) => { const e = unwrap(expr); return ts.isIdentifier(e) && carriers.has(e.text); };
    const visitJ = (n) => {
      if (ts.isJsxOpeningElement(n) || ts.isJsxSelfClosingElement(n)) {
        const props = n.attributes.properties;
        const idx = props.map((a, i) => (ts.isJsxSpreadAttribute(a) && isCarrierSpread(a.expression) ? i : -1)).filter((i) => i >= 0);
        if (idx.length) roots.push({ line: lineOf(sf, n), after: props.slice(Math.max(...idx) + 1).map((a) => (ts.isJsxSpreadAttribute(a) ? { spread: a.expression } : { name: a.name.getText(sf) })) });
      }
      if (ts.isCallExpression(n) && /(^|\.)createElement$/.test(n.expression.getText(sf)) && n.arguments[1]) {
        let o = unwrap(n.arguments[1]); if (ts.isIdentifier(o) && objects.has(o.text)) o = objects.get(o.text);
        if (ts.isObjectLiteralExpression(o)) {
          const pr = o.properties;
          const idx = pr.map((p, i) => (ts.isSpreadAssignment(p) && isCarrierSpread(p.expression) ? i : -1)).filter((i) => i >= 0);
          if (idx.length) roots.push({ line: lineOf(sf, n), after: pr.slice(Math.max(...idx) + 1).map((p) => (ts.isSpreadAssignment(p) ? { spread: p.expression } : { name: p.name ? p.name.getText(sf).replace(/^['"]|['"]$/g, '') : '?' })) });
        }
      }
      ts.forEachChild(n, visitJ);
    };
    visitJ(sf);
    if (!roots.length && !by('C9.iv-spread')) return { ok: false, why: 'no root spreads the caller rest props' };
    const objWrites = (o, depth = 0) => {
      for (const p of o.properties) {
        if (ts.isSpreadAssignment(p)) { const w = spreadWrites(p.expression, depth + 1); if (w) return w; continue; }
        if (!p.name) return 'unknown property';
        if (ts.isComputedPropertyName(p.name)) return 'computed key';
        if (p.name.getText(sf).replace(/^['"]|['"]$/g, '') === A) return `writes ${A}`;
      }
      return null;
    };
    const importOf = (id) => { for (const st of sf.statements) { if (!ts.isImportDeclaration(st) || !st.importClause) continue; const ic = st.importClause; if (ic.name && ic.name.text === id) return st.moduleSpecifier.text; if (ic.namedBindings && ts.isNamedImports(ic.namedBindings) && ic.namedBindings.elements.some((el) => el.name.text === id)) return st.moduleSpecifier.text; } return null; };
    const spreadWrites = (expr, depth = 0) => {
      if (depth > 4) return 'too deep';
      let e = unwrap(expr);
      if (ts.isObjectLiteralExpression(e)) return objWrites(e, depth);
      if (ts.isConditionalExpression(e)) return spreadWrites(e.whenTrue, depth + 1) || spreadWrites(e.whenFalse, depth + 1);
      if (ts.isBinaryExpression(e)) return spreadWrites(e.right, depth + 1);
      if (ts.isIdentifier(e) && objects.has(e.text)) return objWrites(objects.get(e.text), depth);
      // member/call/identifier from a helper: literal-absence proof over the helper module closure
      let root = e;
      while (ts.isPropertyAccessExpression(root) || ts.isCallExpression(root) || ts.isElementAccessExpression(root)) root = ts.isCallExpression(root) ? root.expression : root.expression;
      if (!ts.isIdentifier(root)) return 'unresolvable spread';
      let spec = importOf(root.text);
      if (!spec && inits.has(root.text)) { let i = inits.get(root.text); while (i && (ts.isCallExpression(i) || ts.isPropertyAccessExpression(i))) i = i.expression; if (i && ts.isIdentifier(i)) spec = importOf(i.text); }
      if (!spec) return `unresolvable spread ${root.text}`;
      const r = resolveSpec(rel, spec);
      if (!r.file) return `unresolvable module ${spec}`;
      return moduleCannotWrite(r.file, A) ? null : `helper module ${r.file} may write ${A}`;
    };
    for (const root of roots) for (const a of root.after) {
      if (a.name && a.name === A && !by('C9.iv-write')) return { ok: false, why: `writes ${A} after the spread at :${root.line}` };
      if (a.spread && !by('C9.iv-write')) { const w = spreadWrites(a.spread); if (w) return { ok: false, why: `${w} (after the spread at :${root.line})` }; }
    }
    return { ok: true };
  }
  function c9(caller, r) {
    const s = tokenShape(caller, r.s);
    if (!s.tokenRes.length || !s.carryingIdx.length) return { strike: false, why: 'no carrying compound' };
    if (s.nested && !by('C9.i-nested')) return { strike: false, why: 'token inside a functional pseudo' };
    const tag = openingTag(caller.file, caller.line, caller.child);
    if (!tag.located) return { strike: false, why: 'tag not located' };
    if (tag.spread && !by('C9.ii-spread')) return { strike: false, why: 'prop spread in the tag' };
    let hit = null;
    const carrying = by('C9.i-every') ? s.carryingIdx.slice(0, 1) : s.carryingIdx;
    for (const i of carrying) {
      const attrs = attrsOfCompound(s.all[i]).filter((x) => !/^data-(part|state)$/.test(x.A) || by('C9.iv-name'));
      let found = null;
      for (const at of attrs) {
        if (!by('C9.iv-name') && !admissibleName(at.A)) continue;
        if (!/^data-/.test(at.A)) continue;
        let lit = staticAttrLiteral(tag.text, at.A);
        if (lit.kind === 'dynamic' && by('C9.ii-dynamic')) lit = { kind: 'static', L: '' };
        if (lit.kind === 'absent' && by('C9.ii-absent')) lit = { kind: 'static', L: '' };
        if (lit.kind !== 'static') continue; // (ii) dynamic/absent keeps
        const presence = at.op === null;
        if (presence && !by('C9.iii-presence') && !by('C9.iii')) continue; // a presence-only [A] never contradicts
        const flag = by('C9.iii-iflag') ? '' : at.flag;
        if (!presence && !by('C9.iii') && !contradicts(at.op, at.v ?? '', lit.L, flag)) continue; // (iii)
        if (presence && by('C9.iii') && !by('C9.iii-presence')) continue;
        const adm = by('C9.iv') ? { ok: true } : admissible(caller, at.A);
        if (!adm.ok) continue; // (iv)
        found = { compound: s.all[i], A: at.A, op: at.op, v: at.v, L: lit.L };
        break;
      }
      if (!found) return { strike: false, why: `carrying compound ${s.all[i]} has no admissible contradicted static attribute` };
      hit = hit ?? found;
    }
    return { strike: true, ...hit };
  }

  // ---- C8 ANCESTOR-UNSATISFIABILITY (review-arc12-het-adjudication §1, binding) ----
  const REACTNODE_TYPE = /\b(ReactNode|ReactElement|ReactChild|ReactFragment|ReactPortal|JSX\.Element|ElementType|ComponentType|FC|FunctionComponent|RenderProp)\b/;
  function declaredType(name, fromRel, depth = 0) {
    if (depth > 4) return null;
    const sf = ast(fromRel);
    for (const st of sf.statements) {
      if ((ts.isInterfaceDeclaration(st) || ts.isTypeAliasDeclaration(st)) && st.name.text === name) return { node: st, rel: fromRel };
    }
    for (const st of sf.statements) {
      if (!ts.isImportDeclaration(st) || !st.importClause || !ts.isStringLiteral(st.moduleSpecifier)) continue;
      const nb = st.importClause.namedBindings;
      if (nb && ts.isNamedImports(nb)) for (const el of nb.elements) if (el.name.text === name) {
        const r = resolveSpec(fromRel, st.moduleSpecifier.text);
        if (!r.file) return null;
        return declaredType((el.propertyName ?? el.name).text, r.file, depth + 1) ?? reexported((el.propertyName ?? el.name).text, r.file, depth + 1);
      }
    }
    return null;
  }
  function reexported(name, rel, depth) {
    if (depth > 6) return null;
    const sf = ast(rel);
    for (const st of sf.statements) {
      if (!ts.isExportDeclaration(st) || !st.moduleSpecifier || !ts.isStringLiteral(st.moduleSpecifier)) continue;
      if (st.exportClause && ts.isNamedExports(st.exportClause) && !st.exportClause.elements.some((el) => el.name.text === name)) continue;
      const r = resolveSpec(rel, st.moduleSpecifier.text);
      if (!r.file) continue;
      const hit = declaredType(name, r.file, depth + 1) ?? reexported(name, r.file, depth + 1);
      if (hit) return hit;
    }
    return null;
  }
  /** true when the props type may carry a caller node (fail-closed on anything unresolvable) */
  function typeHostsNode(typeNode, rel, depth = 0) {
    if (!typeNode) return false;
    if (depth > 5) return true;
    const sf = ast(rel);
    const text = typeNode.getText(sf);
    if (ts.isTypeLiteralNode(typeNode)) return typeNode.members.some((m) => /\bchildren\b/.test(m.getText(sf)) || REACTNODE_TYPE.test(m.type ? m.type.getText(sf) : m.getText(sf)));
    if (ts.isIntersectionTypeNode(typeNode) || ts.isUnionTypeNode(typeNode)) return typeNode.types.some((t) => typeHostsNode(t, rel, depth + 1));
    if (ts.isTypeReferenceNode(typeNode)) {
      const name = typeNode.typeName.getText(sf);
      if (/^(Omit|Pick|Partial|Readonly|Required)$/.test(name)) return typeNode.typeArguments ? typeHostsNode(typeNode.typeArguments[0], rel, depth + 1) : true;
      if (/^React\.|^(PropsWithChildren|HTMLAttributes|ComponentProps|ComponentPropsWithoutRef|ComponentPropsWithRef)/.test(name)) return true; // DOM/React prop bags carry children
      const d = declaredType(name, rel);
      if (!d) return true; // unresolvable -> fail-closed
      if (ts.isTypeAliasDeclaration(d.node)) return typeHostsNode(d.node.type, d.rel, depth + 1);
      return interfaceHostsNode(d, depth + 1);
    }
    return REACTNODE_TYPE.test(text) || /\bchildren\b/.test(text);
  }
  function interfaceHostsNode(d, depth) {
    if (depth > 6) return true;
    const dsf = ast(d.rel);
    if (d.node.members.some((m) => /\bchildren\b/.test(m.getText(dsf)) || REACTNODE_TYPE.test(m.type ? m.type.getText(dsf) : m.getText(dsf)))) return true;
    for (const h of d.node.heritageClauses ?? []) for (const t of h.types) {
      const hn = t.expression.getText(dsf);
      if (/^(Omit|Pick|Partial|Readonly|Required)$/.test(hn)) { if (!t.typeArguments || typeHostsNode(t.typeArguments[0], d.rel, depth + 1)) return true; continue; }
      if (/^React\.|^(PropsWithChildren|HTMLAttributes|ComponentProps)/.test(hn)) return true;
      const hd = declaredType(hn, d.rel);
      if (!hd) return true;
      if (ts.isTypeAliasDeclaration(hd.node) ? typeHostsNode(hd.node.type, hd.rel, depth + 1) : interfaceHostsNode(hd, depth + 1)) return true;
    }
    return false;
  }
  function componentFn(stmt) {
    if (ts.isFunctionDeclaration(stmt)) return { fn: stmt, typeArgs: null };
    if (ts.isVariableStatement(stmt)) {
      const d = stmt.declarationList.declarations[0];
      let i = d.initializer ? unwrap(d.initializer) : null;
      let typeArgs = d.type && ts.isTypeReferenceNode(d.type) ? d.type.typeArguments : null;
      while (i && ts.isCallExpression(i)) { if (!typeArgs && i.typeArguments) typeArgs = i.typeArguments; i = unwrap(i.arguments[0]); }
      if (i && (ts.isArrowFunction(i) || ts.isFunctionExpression(i))) return { fn: i, typeArgs };
    }
    return null;
  }
  /** C8 (iii): may this component render a caller-supplied node? (static AST check, fail-closed) */
  const hostsCache = new Map();
  function hostsCallerContent(stmt, rel) {
    const hk = rel + '|' + stmt.pos;
    if (hostsCache.has(hk)) return hostsCache.get(hk);
    const res = hostsCallerContentRaw(stmt, rel);
    hostsCache.set(hk, res);
    return res;
  }
  function hostsCallerContentRaw(stmt, rel) {
    const c = componentFn(stmt);
    if (!c) return { hosts: true, why: 'not a resolvable component' };
    const sf = ast(rel);
    const fn = c.fn;
    let usesChildren = false; let spreadsProps = false;
    const p0 = fn.parameters[0];
    const paramNames = new Set(); const restNames = new Set();
    if (p0) {
      if (ts.isIdentifier(p0.name)) paramNames.add(p0.name.text);
      if (ts.isObjectBindingPattern(p0.name)) for (const el of p0.name.elements) { if (el.dotDotDotToken && ts.isIdentifier(el.name)) restNames.add(el.name.text); const k = el.propertyName ? el.propertyName.getText(sf) : el.name.getText(sf); if (k === 'children') usesChildren = true; }
    }
    const v = (n) => {
      if (ts.isIdentifier(n) && n.text === 'children') usesChildren = true;
      if ((ts.isJsxSpreadAttribute(n) || ts.isSpreadAssignment(n)) && ts.isIdentifier(unwrap(n.expression)) && (paramNames.has(unwrap(n.expression).text) || restNames.has(unwrap(n.expression).text))) spreadsProps = true;
      ts.forEachChild(n, v);
    };
    v(fn);
    if (usesChildren) return { hosts: true, why: 'uses children' };
    if (spreadsProps) return { hosts: true, why: 'spreads its props into its subtree' };
    if (!p0) return { hosts: false };
    const typeNode = p0.type ?? (c.typeArgs ? c.typeArgs[c.typeArgs.length - 1] : null);
    if (!typeNode) return { hosts: true, why: 'untyped props (fail-closed)' };
    if (typeHostsNode(typeNode, rel)) return { hosts: true, why: `props type ${typeNode.getText(sf)} may carry a node` };
    return { hosts: false };
  }
  const classTokenRe = (k) => new RegExp(`(^|[^a-z0-9_-])${esc(k)}(?![a-z0-9_-])`);
  /** every JSX element in file `rel` whose className carries K (directly or through a local constant) */
  const kEmCache = new Map();
  function kEmitterElements(rel, k) {
    const ck = rel + '|' + k;
    if (kEmCache.has(ck)) return kEmCache.get(ck);
    const sf = ast(rel);
    const re = classTokenRe(k);
    const constHolds = new Set();
    const vc = (n) => { if (ts.isVariableDeclaration(n) && ts.isIdentifier(n.name) && n.initializer && re.test(n.initializer.getText(sf))) constHolds.add(n.name.text); ts.forEachChild(n, vc); };
    vc(sf);
    const els = [];
    const vj = (n) => {
      if (ts.isJsxOpeningElement(n) || ts.isJsxSelfClosingElement(n)) {
        for (const a of n.attributes.properties) if (ts.isJsxAttribute(a) && a.name.getText(sf) === 'className' && a.initializer) {
          const t = a.initializer.getText(sf);
          if (re.test(t) || [...constHolds].some((c) => new RegExp(`\\b${esc(c)}\\b`).test(t))) els.push(n);
        }
      }
      if (ts.isPropertyAssignment(n) && n.name.getText(sf) === 'className' && (re.test(n.initializer.getText(sf)) || [...constHolds].some((c) => new RegExp(`\\b${esc(c)}\\b`).test(n.initializer.getText(sf))))) els.push(n);
      ts.forEachChild(n, vj);
    };
    vj(sf);
    kEmCache.set(ck, els);
    return els;
  }
  function callerElement(caller) {
    const sf = ast(caller.file);
    let found = null;
    const v = (n) => {
      if (found) return;
      if ((ts.isJsxOpeningElement(n) || ts.isJsxSelfClosingElement(n)) && lineOf(sf, n) === caller.line && n.tagName.getText(sf) === String(caller.child)) { found = n; return; }
      ts.forEachChild(n, v);
    };
    v(sf);
    return found;
  }
  // className text of an element, with local identifiers expanded through their initializers
  function classNameTextOf(elNode, sf) {
    const vars = new Map();
    const vc = (n) => { if (ts.isVariableDeclaration(n) && ts.isIdentifier(n.name) && n.initializer) vars.set(n.name.text, n.initializer.getText(sf)); ts.forEachChild(n, vc); };
    if (!sf.__vars) { vc(sf); sf.__vars = vars; }
    const V = sf.__vars;
    const attr = elNode.attributes.properties.find((x) => ts.isJsxAttribute(x) && x.name.getText(sf) === 'className');
    if (!attr || !attr.initializer) return '';
    let text = attr.initializer.getText(sf);
    for (let i = 0; i < 3; i += 1) text += ' ' + [...new Set(text.match(/\b[A-Za-z_$][\w$]*\b/g) || [])].filter((id) => V.has(id)).map((id) => V.get(id)).join(' ');
    return text;
  }
  function hasUnknownSpread(elNode, sf) {
    return elNode.attributes.properties.some((x) => ts.isJsxSpreadAttribute(x));
  }
  /** JSX ancestry of element `el` inside component function `fn`; closed iff every path reaches fn's return */
  function ancestryOf(el, sf, fn, depth = 0, seen = new Set()) {
    const elements = [];
    if (depth > 6) return { closed: false, elements, why: 'reference depth' };
    for (let n = el; n; n = n.parent) {
      if (ts.isJsxElement(n)) elements.push(n.openingElement);
      if (ts.isJsxOpeningElement(n) || ts.isJsxSelfClosingElement(n)) { if (!elements.includes(n)) elements.push(n); }
      if (n === fn) return { closed: true, elements }; // arrow body expression of the component
      if (ts.isReturnStatement(n)) {
        let f = n.parent; while (f && !ts.isFunctionLike(f)) f = f.parent;
        if (f === fn) return { closed: true, elements };
        // a return inside a nested helper function: follow the helper's references
        const name = f && f.parent && ts.isVariableDeclaration(f.parent) && ts.isIdentifier(f.parent.name) ? f.parent.name.text : f && ts.isFunctionDeclaration(f) && f.name ? f.name.text : null;
        if (!name) return { closed: false, elements, why: 'return inside an unnamed nested function' };
        return follow(name, f);
      }
      if (ts.isVariableDeclaration(n) && ts.isIdentifier(n.name)) return follow(n.name.text, n);
      if (ts.isSourceFile(n)) return { closed: false, elements, why: 'reached the file top level' };
    }
    return { closed: false, elements, why: 'walk ended' };
    function follow(name, declNode) {
      if (seen.has(name)) return { closed: false, elements, why: `cyclic reference ${name}` };
      seen.add(name);
      const uses = [];
      const vu = (m) => { if (ts.isIdentifier(m) && m.text === name && m !== declNode.name && !(m.parent && ts.isVariableDeclaration(m.parent) && m.parent.name === m)) uses.push(m); ts.forEachChild(m, vu); };
      vu(fn);
      if (!uses.length) return { closed: false, elements, why: `${name} never used in the component` };
      let closed = true; let why = '';
      for (const u of uses) {
        const sub = ancestryOf(u, sf, fn, depth + 1, seen);
        for (const e2 of sub.elements) if (!elements.includes(e2)) elements.push(e2);
        if (!sub.closed) { closed = false; why = sub.why; }
      }
      return { closed, elements, why };
    }
  }
  function c8(caller, r) {
    const s = tokenShape(caller, r.s);
    if (!s.tokenRes.length || !s.carryingIdx.length) return { strike: false, why: 'no carrying compound' };
    if (s.nested && !by('C8.nested')) return { strike: false, why: 'token inside a functional pseudo' };
    const el = callerElement(caller);
    if (!el) return { strike: false, why: 'caller element not located' };
    const sf = ast(caller.file);
    const stmt = topStatement(el, sf);
    if (!isExportedStmt(stmt, sf) && !by('C8.ii')) return { strike: false, why: 'caller not inside an exported component (ancestry not closed)' };
    // C's static ancestry inside its exported component (from C's opening tag up to the returned
    // root), following JSX held in local variables / render helpers to every place it is used.
    const comp = componentFn(stmt);
    if (!comp) return { strike: false, why: 'exported component not resolvable' };
    const anc = ancestryOf(el, sf, comp.fn);
    if (!anc.closed && !by('C8.ii')) return { strike: false, why: `ancestry not closed (${anc.why})` };
    const ancestry = anc.elements;
    const ancestryText = ancestry.map((a) => classNameTextOf(a, sf)).join('\n');
    if (ancestry.some((a) => hasUnknownSpread(a, sf)) && !by('C8.ii')) return { strike: false, why: 'an ancestor carries an attribute spread (className unprovable)' };
    const localFns = new Map();
    for (const st of sf.statements) { const nm = ts.isFunctionDeclaration(st) && st.name ? st.name.text : ts.isVariableStatement(st) && ts.isIdentifier(st.declarationList.declarations[0].name) ? st.declarationList.declarations[0].name.text : null; if (nm) localFns.set(nm, st); }
    const ancestorTagNames = ancestry.map((a) => a.tagName.getText(sf).split('.')[0]);
    let proof = null;
    for (const ci of s.carryingIdx) {
      const ancestors = s.all.slice(0, ci);
      let ok = null;
      for (const cmp of ancestors) {
        for (const k of [...new Set((topLevel(cmp).match(/\.(ds-[a-z0-9][a-z0-9_-]*)/g) || []).map((x) => x.slice(1)))]) {
          if (!by('C8.i') && !c7Owned(k, caller.file)) continue; // (i)
          const re = classTokenRe(k);
          if (!by('C8.ii') && (re.test(ancestryText) || ancestorTagNames.some((t) => localFns.has(t) && re.test(localFns.get(t).getText(sf))))) continue; // (ii)
          // (iv) C4 engine scope: emitters outside the rule's engine are not in play for an engine-scoped rule
          let em = [...(classEmitters.get(k) || [])];
          if (!by('C8.iv') && r.scope && r.scope !== 'ALL') em = em.filter((e) => !/\/engines\/(modern|rustic|classic)\//.test(e) || e.includes(`/engines/${r.scope}/`));
          if (!em.length) continue;
          let all = true; const hosts = [];
          for (const e of em) {
            const els = kEmitterElements(e, k);
            if (!els.length) { all = false; hosts.push(`${e}: K not on a locatable JSX className`); break; }
            for (const x of els) {
              const esf = ast(e); const st = topStatement(x, esf);
              if (!isExportedStmt(st, esf)) { all = false; hosts.push(`${e}:${lineOf(esf, x)} not in an exported component`); break; }
              const h = by('C8.iii') ? { hosts: false } : hostsCallerContent(st, e);
              if (h.hosts) { all = false; hosts.push(`${e}:${lineOf(esf, x)} ${h.why}`); break; }
            }
            if (!all) break;
          }
          if (all) { ok = { K: k, ancestorCompound: cmp, emitters: em }; break; }
        }
        if (ok) break;
      }
      if (!ok) return { strike: false, why: 'no ancestor K satisfies (i)-(iv)' };
      proof = proof ?? ok;
    }
    return { strike: true, ...proof };
  }

  /** caller: { file (repo-relative), line, child, childFamily, callerPart, skinFiles (css-root-relative keys) } */
  function attribute(caller) {
    const eng = (caller.file.match(/\/engines\/(modern|rustic|classic)\//) || [])[1] || null;
    // C4: exclude a rule for an engines/<x>/ caller only when SCOPE(S) is a single engine != x
    const inScope = (r) => !eng || r.scope === 'ALL' || r.scope === eng;
    const partRes = tokenResOf(caller);
    const selPart = (s) => partRes.some((re) => re.test(s));
    const attributed = new Set(Object.keys(caller.skinFiles || {}));
    const base = skin.filter((r) => attributed.has(r.rel) && selPart(r.s));
    const baseC4 = base.filter(inScope);
    const owned = [...dsClasses(caller.file)].filter((k) => ownedBy(k, caller.file));
    const classRes = owned.map((k) => new RegExp(`\\.${esc(k)}(?![a-z0-9_-])`));
    const r4b = skin.filter((r) => !attributed.has(r.rel) && inScope(r) && selPart(r.s) && classRes.some((re) => re.test(r.s)));
    const credited = [...baseC4.map((r) => ({ r, via: classRes.some((re) => re.test(r.s)) ? 'name+4b-class' : 'name' })), ...r4b.map((r) => ({ r, via: '4b' }))];
    const rows = credited.map(({ r, via }) => {
      const ev = {};
      ev.C7 = c7Strikes(caller, r.s) ? { strike: true } : { strike: false };
      ev.C8 = c8(caller, r);
      ev.C9 = c9(caller, r);
      ev.C10 = via === 'name' || by('C10.name-only') ? c10(caller, r) : { strike: false, why: via === '4b' ? '4b credit (ownership proven)' : 'also carries an owner class (4b condition holds)' };
      const strikers = ALL_RULES.filter((k) => ev[k].strike);
      const enabled = strikers.filter((k) => on(k));
      return { rel: r.rel, s: r.s, via, strikers, enabledStrikers: enabled, struck: enabled.length > 0, ev };
    });
    // C10 diagnostic: name-credited rules whose leftmost compound carries a class with >= 1 emitter
    // and NO emitter under C's root (a name collision candidate), with the C10 outcome.
    const callerRootDiag = compRoot(caller.file);
    const c10Diag = [];
    for (const x of rows) {
      if (x.via !== 'name') continue;
      const comps = compoundsOf(x.s);
      const left = comps.length ? topLevel(comps[0]) : '';
      const ks = [...new Set((left.match(/\.((?:ds|rottay)-[a-z0-9][a-z0-9_-]*)/g) || []).map((y) => y.slice(1)))];
      const foreign = ks.map((k) => ({ K: k, emitterRoots: [...new Set([...(anchorEmitters.get('class:' + k) || [])].map((e) => compRoot(e)))] })).filter((k) => k.emitterRoots.length && !k.emitterRoots.some((r) => (r + '/').startsWith(callerRootDiag + '/') || r === callerRootDiag));
      if (foreign.length) c10Diag.push({ skinFamily: x.rel.split('/').slice(-2, -1)[0], rel: x.rel, selector: x.s, callerRoot: callerRootDiag, foreignAnchors: foreign, c10: x.ev.C10 });
    }
    const kept = rows.filter((x) => !x.struck);
    const files = {};
    for (const x of kept) files[x.rel] = (files[x.rel] ?? 0) + 1;
    const tag = openingTag(caller.file, caller.line, caller.child);
    const c7Struck = rows.filter((x) => x.ev.C7.strike && on('C7')).length;
    return {
      engineScope: eng ?? 'all', base: base.length, baseC4: baseC4.length, c4Dropped: base.length - baseC4.length, r4b: r4b.length, r4bFiles: [...new Set(r4b.map((r) => r.rel))],
      preC7: credited.length, c7Struck, c7StruckSelectors: rows.filter((x) => x.ev.C7.strike && on('C7')).map((x) => x.rel + ' :: ' + x.s),
      staticTag: tag.static, total: kept.length, skinFiles: files, ownedClasses: owned,
      rules: rows.filter((x) => x.strikers.length).map((x) => ({ rel: x.rel, s: x.s, via: x.via, strikers: x.strikers, struck: x.struck, detail: Object.fromEntries(x.strikers.map((k) => [k, x.ev[k]])) })),
      struckBy: Object.fromEntries(ALL_RULES.map((k) => [k, rows.filter((x) => x.struck && x.enabledStrikers.includes(k)).length])),
      c10Diag,
      ...(opts.verbose ? { evaluated: rows.map((x) => ({ rel: x.rel, s: x.s, via: x.via, strikers: x.strikers, struck: x.struck, ev: x.ev })) } : {}),
    };
  }
  return { attribute, assertion, c7Strikes, c8, c9, c10, admissible, importClosure, anchorEmitters, classEmitters, compRoot, enabledRules: [...rules] };
}
