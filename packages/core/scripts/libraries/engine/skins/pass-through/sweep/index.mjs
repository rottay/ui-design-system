/**
 * P-88 pass-through census -- the SWEEP (WO-ARC-12). A static TypeScript-AST sweep of
 * packages/core/src/components plus a selector index of the three skin dirs the dead-parts gate
 * reads. It returns the raw enumeration (engine sites, structural sites, compound caller uses)
 * that classify/ and summary/ turn into the census. READ-ONLY.
 *
 * ONE MEASUREMENT: this is the census the pass-through gate, the engine-token-audit rows and
 * family-cut G1 all read. The body below is the adopted census.mjs verbatim; only its CLI shell
 * (argv, the JSON write, console output) is replaced by this function's parameters and return.
 * Its AST helpers (analyzeFile, classify) are the sibling module ./ast/index.mjs.
 */
// Provenance: arc12/census-v7110/census.mjs sha256 9eeac4402df0057144dc64020a5487504628830fffe5cb9f9d39d2a293acd3a7 (census v7.1.10, 2026-10-15: rest
// carriers scoped per enclosing function; census.mjs unchanged from v7.1.9, the tool is census.mjs PLUS ast/index.mjs sha256
// 5a447bc88bd1a05d3796c5ed9d4a8c853cef3b281fc07450fc4023f8681613ae, byte-identical to ./ast/index.mjs; v7.1.9 was arc12/census-v719 -- the
// own-anatomy index keyed by class and the path-anchored layout carriers, ast/index.mjs c65e0abf carrying each site's own DS classes;
// v7.1.8 was arc12/census-v718/census.mjs 45c97c8b (the
// `AST helpers` section is the sibling module ./ast/index.mjs, moved verbatim -- the tool is census.mjs PLUS ast/index.mjs sha256
// b2d4d8a088bcb3fecc7ff1855523da582cf832aba4fbb2f8cc2dda3797578afe, byte-identical to ./ast/index.mjs; no measurement moves; v7.1.7 was
// arc12/census-v717/census.mjs d9456c63 -- the engine roster is read from libraries/engine/roster and ONE total ENGINE_SKIN_KINDS record replaces the two engine-name comparison
// chains, no measurement moves; v7.1.3 was arc12/census-v713/census.mjs 2f7e0518 -- a `{...partAttributes('<part>', <state>)}`
// spread is a caller row like the literal attributes; v7.1.1 was be21d40e -- the tag-name
// fallback removed; v7.1 was 3ca4db81 -- the lexical re-export chain and the unresolved-caller report; v7 was 1937b947).
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, relative, dirname, resolve } from 'node:path';
import { createRequire } from 'node:module';

import { IMPLEMENTED_ENGINE_NAMES } from '../../../roster/index.mjs';
import { createSweepAst } from './ast/index.mjs';

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
// The skin kinds an engine's rows read: its own engine skin, when it has one, and presentation.
// ONE total record over the roster's implemented engines (the loader-totality shape), never a
// chain of name comparisons: a missing or a foreign key fails closed below.
const ENGINE_SKIN_KINDS = {
  classic: ['presentation'],
  modern: ['modern', 'presentation'],
  rustic: ['rustic', 'presentation'],
};
{
  const owed = IMPLEMENTED_ENGINE_NAMES.filter((name) => !Object.hasOwn(ENGINE_SKIN_KINDS, name));
  const foreign = Object.keys(ENGINE_SKIN_KINDS).filter((name) => !IMPLEMENTED_ENGINE_NAMES.includes(name));
  if (owed.length || foreign.length) throw new Error(`sweepPassThrough: ENGINE_SKIN_KINDS is not total over the implemented engine roster (omits: ${owed.join(', ') || '-'}; foreign: ${foreign.join(', ') || '-'})`);
}
/** The skin kinds `engine` reads, or null for an engine-agnostic row (no engine, every kind). */
const skinKindsOf = (engine) => (Object.hasOwn(ENGINE_SKIN_KINDS, engine) ? ENGINE_SKIN_KINDS[engine] : null);

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
const skinPreludes = []; // v7.1.9: {file, kind, prelude}, one per rule, unsplit
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
        skinPreludes.push({ file: rel(p), kind, prelude }); // v7.1.9: the own-anatomy index parses these paren-aware
        for (const sel of prelude.split(',')) skinSelectors.push({ file: rel(p), kind, family, selector: sel.trim() });
      }
    }
  }
}
const partRe = (part) => new RegExp(`\\[data-part=["']${part}["']\\]`);
function skinCount({ family, part, stateOnly = false, anyFamily = false, engine = null }) {
  const re = partRe(part);
  const kinds = skinKindsOf(engine);
  const hits = skinSelectors.filter((s) => (!kinds || kinds.includes(s.kind)) && (anyFamily || s.family === family) && re.test(s.selector) && (!stateOnly || /\[data-state/.test(s.selector)));
  const byFile = {};
  for (const h of hits) byFile[h.file] = (byFile[h.file] ?? 0) + 1;
  return { count: hits.length, byFile };
}
const familiesWithSkin = new Set(skinSelectors.map((s) => s.family));

// v7.1.9: OWN-ELEMENT ANATOMY, keyed by CLASS. A skin family is named after its directory, so the
// rules painting a carrier from presentation/components/skin/layout-primitives (classic + rustic
// Flex, Stack) or runtime/engines/rustic/skin/layout (rustic Box) are charged to families no
// carrier is called. This index reads the rules by the element's own DS class instead: a selector
// counts against an element when one of its compounds carries that class (directly or inside a
// :where/:is/:not list) together with a [data-part] or [data-state]. Selectors and compounds are
// split paren- and bracket-aware.
const topLevel = (text, isSep) => {
  const out = []; let depth = 0, cur = '';
  for (const ch of text) {
    if (ch === '(' || ch === '[') depth++;
    else if (ch === ')' || ch === ']') depth--;
    if (depth === 0 && isSep(ch)) { out.push(cur); cur = ''; } else cur += ch;
  }
  out.push(cur);
  return out.map((x) => x.trim()).filter(Boolean);
};
const ANATOMY_ATTR = /\[data-(part|state)\b/;
const ownClassIndex = new Map(); // ds class -> Map(selector id -> { file, kind, anatomy })
skinPreludes.forEach((r, i) => topLevel(r.prelude, (ch) => ch === ',').forEach((sel, j) => {
  const id = `${i}:${j}`;
  for (const compound of topLevel(sel, (ch) => /[\s>+~]/.test(ch))) {
    const anatomy = ANATOMY_ATTR.test(compound);
    for (const m of compound.matchAll(/\.((?:ds|rottay)-[A-Za-z0-9_-]+)/g)) {
      if (!ownClassIndex.has(m[1])) ownClassIndex.set(m[1], new Map());
      const hit = ownClassIndex.get(m[1]).get(id);
      ownClassIndex.get(m[1]).set(id, { file: r.file, kind: r.kind, anatomy: Boolean(hit?.anatomy) || anatomy });
    }
  }
}));

// v7.1.9: a layout-carrier family is PATH-anchored at primitives/layout/<fam>/. A row elsewhere whose
// directory merely shares a carrier name (feedback/foundation/notifier/presentation/stack) is
// charged to its nearest skinned non-carrier ancestor -- its owner skin -- never to the carrier.
const LAYOUT_CARRIERS = ['box', 'flex', 'stack', 'grid', 'space', 'container'];
const anchorCarrierFamily = (row) => {
  if (!LAYOUT_CARRIERS.includes(row.family) || row.file.startsWith(`packages/core/src/components/primitives/layout/${row.family}/`)) return;
  const dirs = row.file.replace('packages/core/src/components/', '').split('/').slice(0, -2).filter((x) => !LAYOUT_CARRIERS.includes(x));
  const owner = [...dirs].reverse().find((x) => familiesWithSkin.has(x)) ?? dirs[dirs.length - 1] ?? 'unanchored';
  row.familyRelabel = { from: row.family, to: owner, rule: 'v7.1.9 path-anchored layout carrier: outside primitives/layout/<fam>/, the nearest skinned non-carrier ancestor' };
  row.family = owner;
};

// ---------- families (dirs that own engines/) ----------
const allFiles = walk(COMPONENTS).filter((p) => !isTestish(rel(p)));
const familyDirs = new Map(); // abs dir -> family name
for (const f of allFiles) {
  const m = f.match(/^(.*)\/engines\/(classic|modern|rustic)\/index\.tsx$/);
  if (m) familyDirs.set(m[1], m[1].split('/').pop());
}

// ---------- AST helpers (./ast/index.mjs: analyzeFile + classify over this tree's typescript) ----------
const { analyzeFile, classify } = createSweepAst({ ts });

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
      dsClasses: s.dsClasses ?? [], dsClassPartial: s.dsClassPartial ?? false, // v7.1.9
    };
    anchorCarrierFamily(row); // v7.1.9
    (isEngine ? engineSites : structuralSites).push(row);
  }
}

// family-level skin info
for (const row of [...engineSites, ...structuralSites]) {
  row.familyHasSkin = familiesWithSkin.has(row.family);
  row.engineSkinFiles = [...new Set(skinSelectors.filter((s) => s.family === row.family && (skinKindsOf(row.engine) ?? ['modern', 'rustic', 'presentation']).includes(s.kind)).map((s) => s.file))];
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
  // v7.1.9: the own-anatomy index over the skin kinds this row's engine loads (every kind for a
  // compound row). ownSkinFiles prints every file that selects the element by its own class.
  const ownKinds = skinKindsOf(row.engine) ?? ['modern', 'rustic', 'presentation'];
  const own = new Map();
  for (const cls of row.dsClasses) for (const [id, h] of ownClassIndex.get(cls) ?? []) if (ownKinds.includes(h.kind)) own.set(id, { file: h.file, anatomy: Boolean(own.get(id)?.anatomy) || h.anatomy });
  row.ownAnatomyRules = [...own.values()].filter((h) => h.anatomy).length;
  row.ownSkinFiles = [...new Set([...own.values()].map((h) => h.file))].sort();
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
// v7.1 (ARC-12): the LEXICAL re-export chain. v7 attributed a caller by its import path landing
// INSIDE a family dir, else by kebab(tag) being a family name. `import { Text } from
// '@/components/primitives'` lands in no family dir and 'text' is no family ('typography' is), so
// every barrel-imported Text/Heading was skipped in silence. The chain follows the imported name
// through `export { A as B } from`, `export * from`, import-then-export and `export const B = A`
// to the module that declares it; the caller counts as the FIRST family dir on that proven path.
// Fail-closed: a chain that does not reach a declaration resolves nothing and is REPORTED.
const ALIASES = [['@/', SRC], ['@ui/', COMPONENTS]]; // packages/core/tsconfig.json `paths`
const specBase = (file, spec) => {
  if (spec.startsWith('.')) return resolve(dirname(file), spec);
  for (const [prefix, dir] of ALIASES) if (spec.startsWith(prefix)) return join(dir, spec.slice(prefix.length));
  return null; // a package
};
const familyOfPath = (p) => { for (const [dir, fam] of familyDirs) if (p === dir || p.startsWith(dir + '/')) return fam; return null; };
const isFile = (p) => existsSync(p) && statSync(p).isFile();
const moduleFile = (base) => [base, `${base}.tsx`, `${base}.ts`, join(base, 'index.tsx'), join(base, 'index.ts')].find(isFile) ?? null;
const exportTables = new Map();
function exportTable(file) {
  if (exportTables.has(file)) return exportTables.get(file);
  const sf = ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true, file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const table = { imports: new Map(), named: new Map(), stars: [], locals: new Map() };
  const has = (st, kind) => (ts.canHaveModifiers(st) ? ts.getModifiers(st) ?? [] : []).some((m) => m.kind === kind);
  const declare = (st, name, aliasOf) => {
    table.locals.set(name, aliasOf);
    if (has(st, ts.SyntaxKind.ExportKeyword)) table.named.set(has(st, ts.SyntaxKind.DefaultKeyword) ? 'default' : name, { local: name });
  };
  for (const st of sf.statements) {
    if (ts.isImportDeclaration(st) && st.importClause) {
      const spec = st.moduleSpecifier.text; const ic = st.importClause;
      if (ic.name) table.imports.set(ic.name.text, { spec, imported: 'default' });
      if (ic.namedBindings && ts.isNamedImports(ic.namedBindings)) for (const el of ic.namedBindings.elements) table.imports.set(el.name.text, { spec, imported: (el.propertyName ?? el.name).text });
      if (ic.namedBindings && ts.isNamespaceImport(ic.namedBindings)) table.imports.set(ic.namedBindings.name.text, { spec, imported: '*' });
    } else if (ts.isExportDeclaration(st)) {
      const spec = st.moduleSpecifier ? st.moduleSpecifier.text : null;
      if (!st.exportClause) table.stars.push(spec);
      else if (ts.isNamespaceExport(st.exportClause)) table.named.set(st.exportClause.name.text, { spec, imported: '*' });
      else for (const el of st.exportClause.elements) table.named.set(el.name.text, spec ? { spec, imported: (el.propertyName ?? el.name).text } : { local: (el.propertyName ?? el.name).text });
    } else if (ts.isExportAssignment(st)) {
      table.named.set('default', ts.isIdentifier(st.expression) ? { local: st.expression.text } : { here: true });
    } else if ((ts.isFunctionDeclaration(st) || ts.isClassDeclaration(st)) && st.name) {
      declare(st, st.name.text, null);
    } else if ((ts.isFunctionDeclaration(st) || ts.isClassDeclaration(st)) && has(st, ts.SyntaxKind.DefaultKeyword)) {
      table.named.set('default', { here: true });
    } else if (ts.isVariableStatement(st)) {
      for (const d of st.declarationList.declarations) {
        if (!ts.isIdentifier(d.name)) continue;
        let init = d.initializer;
        while (init && (ts.isParenthesizedExpression(init) || ts.isAsExpression(init) || ts.isNonNullExpression(init) || ts.isSatisfiesExpression(init))) init = init.expression;
        declare(st, d.name.text, init && ts.isIdentifier(init) ? init.text : null);
      }
    }
  }
  exportTables.set(file, table);
  return table;
}
// -> { family } | { definedIn } (declared outside every family dir) | { thirdParty } | { broken }
function followExport(file, name, seen, path) {
  const key = `${file}\0${name}`;
  if (seen.has(key)) return { broken: `re-export cycle at ${rel(file)}#${name}` };
  seen.add(key);
  const here = [...path, file];
  const settle = (r) => (r.broken || r.family ? r : { ...r, family: here.map(familyOfPath).find(Boolean) ?? null });
  const hop = (spec, imported) => {
    const base = specBase(file, spec);
    if (!base) return settle({ thirdParty: spec });
    const target = moduleFile(base);
    if (!target) return { broken: `module not found: ${spec} (from ${rel(file)})` };
    if (imported === '*') return settle({ definedIn: rel(target), family: familyOfPath(target) ?? undefined });
    return followExport(target, imported, seen, here);
  };
  const table = exportTable(file);
  const local = (id, depth = 0) => {
    if (table.imports.has(id)) { const im = table.imports.get(id); return hop(im.spec, im.imported); }
    if (!table.locals.has(id)) return { broken: `no binding '${id}' in ${rel(file)}` };
    const aliasOf = table.locals.get(id);
    if (aliasOf && aliasOf !== id && depth < 8 && (table.imports.has(aliasOf) || table.locals.has(aliasOf))) return local(aliasOf, depth + 1);
    return settle({ definedIn: rel(file) });
  };
  const entry = table.named.get(name);
  if (entry) return entry.here ? settle({ definedIn: rel(file) }) : entry.spec ? hop(entry.spec, entry.imported) : local(entry.local);
  if (name !== 'default') for (const spec of table.stars) {
    const base = spec && specBase(file, spec);
    const target = base && moduleFile(base);
    if (!target) continue;
    const r = followExport(target, name, seen, here);
    if (!r.broken) return r;
  }
  return { broken: `no export '${name}' in ${rel(file)}` };
}
// v7.1.1: the kebab(tag)-is-a-family-name fallback is GONE. Once the chain existed it fired on two
// rows and was wrong on both (antd's Card counted as `card`; a local `"dl" | "div"` variable named
// Grid counted as `grid`): a name guess beating a proven path. A family is now attributed by
// proof only -- the import path or the chain -- and a tag that merely shares a family's name is
// reported like any other unresolved opener.
function resolveFamily(file, imp) {
  let chain = null;
  if (imp) {
    const base = specBase(file, imp.spec);
    if (base) {
      for (const [dir, fam] of familyDirs) if (base === dir || base.startsWith(dir + '/')) return { family: fam, how: 'import-path' };
      const target = moduleFile(base);
      chain = target ? followExport(target, imp.imported, new Set(), []) : { broken: `module not found: ${imp.spec}` };
      if (chain.family) return { family: chain.family, how: 're-export-chain' };
    } else chain = { thirdParty: imp.spec };
  }
  return { family: null, chain };
}
const NATIVE_PARTS = new Set(); for (const r of fileResults.values()) for (const x of r.native) NATIVE_PARTS.add(x);
const compoundSites = [];
// v7.1: NO SILENT SKIP. Every opener with a literal data-part/data-state whose family does not
// resolve is reported with the evidence that classifies it:
//   local-intrinsic-variable  the tag is a local binding initialised to a string/template literal
//                             (an intrinsic element, e.g. `h${level}`), never a DS component
//   local-component           the tag is a function/forwardRef/memo component declared in the file
//   third-party               the tag is imported from a package (antd, rc-*, ...)
//   non-family-component      the chain reaches a declaration outside every family dir (no engines/)
//   local-dynamic-binding     a local non-literal binding: the element type is not statically known
//   unresolvable              no import and no local binding, or a chain that breaks
// The last two are the GENUINELY UNRESOLVABLE set: it must be empty or individually justified.
const unresolvedCallers = [];
const nonBreachingCallers = {}; // family -> openers resolved to a family whose engines let no caller part/state land
for (const [f, r] of fileResults) {
  for (const u of r.compoundUses) {
    const imp = r.imports.get(u.tag.split('.')[0]);
    const res = resolveFamily(f, imp);
    const spreadMark = u.spread ? { callerForm: 'partAttributes-spread', ...(u.spread.partUnresolved ? { callerPartUnresolved: u.spread.partUnresolved } : {}) } : {};
    // v7.1.3 fail-closed: a spread part that is not static is REPORTED on a known family, never guessed
    if (res.family && u.spread?.partUnresolved) unresolvedCallers.push({ file: rel(f), line: u.line, tag: u.tag, callerPart: u.part, callerState: u.state, class: 'unresolvable', importSpec: imp ? imp.spec : null, evidence: `partAttributes part is not a static string literal: ${u.spread.partUnresolved.join(' ; ')}`, ...spreadMark });
    if (!res.family) {
      const ch = res.chain;
      const cls = u.tagKind === 'ant' || (ch && ch.thirdParty) ? 'third-party'
        : ch && ch.definedIn ? 'non-family-component'
        : ch ? 'unresolvable'
        : u.tagKind === 'local-component' ? 'local-component'
        : u.tagKind === 'dynamic' ? (u.localIntrinsic ? 'local-intrinsic-variable' : 'local-dynamic-binding')
        : 'unresolvable';
      const evidence = ch ? (ch.thirdParty ? `package ${ch.thirdParty}` : ch.definedIn ? `declared in ${ch.definedIn}` : ch.broken)
        : u.localInit ? `local binding = ${u.localInit}` : `tagKind ${u.tagKind}, no import`;
      unresolvedCallers.push({ file: rel(f), line: u.line, tag: u.tag, callerPart: u.part, callerState: u.state, class: cls, importSpec: imp ? imp.spec : null, evidence, ...spreadMark });
      continue;
    }
    const b = breachingFamilies.get(res.family);
    if (!b) { nonBreachingCallers[res.family] = (nonBreachingCallers[res.family] ?? 0) + 1; continue; }
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
      // v7.1.3: a spread state is the serialized interaction state -- dynamic; its text is never read for literals
      const vals = u.spread?.state ? [] : [...String(u.state).matchAll(/["'`]([A-Za-z0-9_-]+)["'`]/g)].map((m) => m[1]);
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
      skinRulesSelectingCallerPart: rules, skinFiles: byFile, ...spreadMark,
    });
  }
}

const nativeParts = new Set(); for (const r of fileResults.values()) for (const x of r.native) nativeParts.add(x);
for (const c of compoundSites) c.callerPartNativelyStamped = (c.callerPart ?? '').split('|').filter(Boolean).some((x) => nativeParts.has(x));
return { nativeParts: [...nativeParts].sort(), engineSites, structuralSites, compoundSites, unresolvedCallers, nonBreachingCallers, familiesWithSkin: [...familiesWithSkin].sort(), engineFileCount: [...fileResults.keys()].filter((f) => /\/engines\/(classic|modern|rustic)\/index\.tsx$/.test(f)).length, skinSelectorCount: skinSelectors.length, layoutCarriers: [...LAYOUT_CARRIERS] };
}
