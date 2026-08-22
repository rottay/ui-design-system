/**
 * PRE_F4B cross-file resolution subsystem -- PORTED from the sealed census v6
 * bundle, not invented. Dispositions fall out of the AST; there is no
 * allowlist of ids anywhere in this subsystem.
 */
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve as pathResolve } from "node:path";
import { fileURLToPath } from "node:url";

import ts from "typescript";

import { repoRoot as findRepoRoot } from "../../../lib/repo-root/index.mjs";

export const REPO_ABS = findRepoRoot(dirname(fileURLToPath(import.meta.url)));

import { getSource } from "./cascade-cross-file-resolver.mjs";
/**
 * v4 public-surface graph — READ-ONLY. Replaces v3's 2-barrel / 1-hop
 * `publicExportPath` (proven insufficient by the independent audit's
 * GridPattern counterexample: `./runtime/motion` reaches GridPattern via a
 * SEPARATE public entrypoint that v3 never looked at) with a graph built from
 * every subpath in `packages/core/package.json`'s `releaseSync.sourceEntrypoints`
 * (the authoritative subpath -> SOURCE .ts file map; the `exports` field
 * itself only names compiled `dist/` output, which is not source-analyzable)
 * plus the implicit root `.` entrypoint (`src/index.ts`).
 *
 * From each entrypoint, computeFileExports() recursively resolves:
 *   - own declarations (`export const X = ...`, `export function X(){}`, `export class X{}`)
 *   - `export default`
 *   - local export lists (`export { X, Y as Z }` referencing local decls)
 *   - re-export lists, with rename (`export { X as Y } from './mod'`)
 *   - `export * from './mod'` (star), recursively flattening the target's own
 *     full export set (cycle-safe via a visited-set, NOT a fixed hop budget)
 *   - `export * as NS from './mod'` (namespace re-export) is recorded as an
 *     opaque namespace binding, not individually name-resolved (documented
 *     bound, see NAMESPACE_STAR_REEXPORT below)
 *
 * A declaration is "publicly reachable" iff it appears as the ORIGIN of some
 * entrypoint's flattened export set. An unresolved re-export target (file
 * could not be found on disk) is NEVER treated as proof of reachability --
 * fail-closed.
 */

const ALIAS_ROOT = join(REPO_ABS, "packages/core/src");
const PKG_JSON_PATH = join(REPO_ABS, "packages/core/package.json");


function unwrap(expr) {
  let current = expr;
  for (let guard = 0; guard < 8 && current; guard += 1) {
    if (ts.isAsExpression(current) || ts.isParenthesizedExpression(current) || ts.isNonNullExpression(current)) {
      current = current.expression;
      continue;
    }
    if (ts.isSatisfiesExpression?.(current)) {
      current = current.expression;
      continue;
    }
    break;
  }
  return current;
}

export function resolveImportTargetFile(moduleSpecifier, fromFileRel) {
  let base;
  if (moduleSpecifier.startsWith("@/")) {
    base = join(ALIAS_ROOT, moduleSpecifier.slice(2));
  } else if (moduleSpecifier.startsWith(".")) {
    base = pathResolve(dirname(join(REPO_ABS, fromFileRel)), moduleSpecifier);
  } else {
    return null;
  }
  const candidates = [`${base}.ts`, `${base}.tsx`, join(base, "index.ts"), join(base, "index.tsx")];
  for (const c of candidates) if (existsSync(c)) return relative(REPO_ABS, c);
  return null;
}

function collectModuleImportsLocal(source) {
  const map = new Map();
  for (const stmt of source.statements) {
    if (!ts.isImportDeclaration(stmt) || !stmt.importClause) continue;
    const moduleSpecifier = ts.isStringLiteralLike(stmt.moduleSpecifier) ? stmt.moduleSpecifier.text : "<dynamic>";
    const clause = stmt.importClause;
    if (clause.name) map.set(clause.name.text, { moduleSpecifier, form: "default" });
    if (clause.namedBindings) {
      if (ts.isNamespaceImport(clause.namedBindings)) {
        map.set(clause.namedBindings.name.text, { moduleSpecifier, form: "namespace" });
      } else if (ts.isNamedImports(clause.namedBindings)) {
        for (const el of clause.namedBindings.elements) {
          map.set(el.name.text, { moduleSpecifier, form: "named", importedName: (el.propertyName ?? el.name).text });
        }
      }
    }
  }
  return map;
}

/* --------------------------------------------------------- entrypoints --- */
let entrypointFilesCache = null;
export function getEntrypointFiles() {
  if (entrypointFilesCache) return entrypointFilesCache;
  const pkg = JSON.parse(readFileSync(PKG_JSON_PATH, "utf8"));
  const files = new Set();
  // Root '.' subpath: package.json#main/module/types all point at compiled
  // dist/index.*; the SOURCE root is `src/index.ts` by repository convention
  // (verified: this is v3's PUBLIC_BARRELS[0], and `src/index.ts` is the only
  // file the structure law permits directly at the source root).
  files.add("packages/core/src/index.ts");
  const se = pkg.releaseSync?.sourceEntrypoints ?? {};
  for (const srcRel of Object.values(se)) {
    files.add(`packages/core/src/${srcRel}`);
  }
  entrypointFilesCache = [...files];
  return entrypointFilesCache;
}

/* --------------------------------------------------- export graph (P0-5) --- */
const fileExportCache = new Map();

/**
 * Full flattened export set of `fileRel`: [{ name, originFile, originName, hopChain }]
 * `originFile===null` means the re-export target could not be resolved on
 * disk (external package, or a specifier this analysis cannot follow) -- such
 * an entry is never treated as reachability proof for anything.
 */
export function computeFileExports(fileRel, visiting) {
  visiting = visiting ?? new Set();
  if (fileExportCache.has(fileRel)) return fileExportCache.get(fileRel);
  if (visiting.has(fileRel)) return []; // cycle guard: cycle-safe, not hop-budget-safe
  const nextVisiting = new Set([...visiting, fileRel]);
  const src = getSource(fileRel);
  if (!src) {
    fileExportCache.set(fileRel, []);
    return [];
  }
  const out = [];
  for (const stmt of src.source.statements) {
    const hasExportMod = (stmt.modifiers ?? []).some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
    if (ts.isVariableStatement(stmt) && hasExportMod) {
      for (const decl of stmt.declarationList.declarations) {
        if (ts.isIdentifier(decl.name)) {
          out.push({ name: decl.name.text, originFile: fileRel, originName: decl.name.text, hopChain: [{ file: fileRel, kind: "own-decl" }] });
        }
      }
      continue;
    }
    if ((ts.isFunctionDeclaration(stmt) || ts.isClassDeclaration(stmt)) && hasExportMod && stmt.name) {
      out.push({ name: stmt.name.text, originFile: fileRel, originName: stmt.name.text, hopChain: [{ file: fileRel, kind: "own-decl" }] });
      continue;
    }
    if (ts.isExportAssignment(stmt) && !stmt.isExportEquals) {
      out.push({ name: "default", originFile: fileRel, originName: "default", hopChain: [{ file: fileRel, kind: "export-default-assignment" }] });
      continue;
    }
    if (ts.isExportDeclaration(stmt)) {
      const spec = stmt.moduleSpecifier && ts.isStringLiteralLike(stmt.moduleSpecifier) ? stmt.moduleSpecifier.text : null;
      if (stmt.exportClause && ts.isNamespaceExport && ts.isNamespaceExport(stmt.exportClause)) {
        // `export * as NS from './mod'` -- opaque namespace binding (documented bound).
        out.push({ name: stmt.exportClause.name.text, originFile: null, originName: "*", hopChain: [{ file: fileRel, kind: "namespace-star-reexport", spec }] });
        continue;
      }
      if (stmt.exportClause && ts.isNamedExports(stmt.exportClause)) {
        for (const el of stmt.exportClause.elements) {
          const localName = (el.propertyName ?? el.name).text;
          const exportedAs = el.name.text;
          if (spec) {
            const target = resolveImportTargetFile(spec, fileRel);
            if (!target) {
              out.push({ name: exportedAs, originFile: null, originName: localName, hopChain: [{ file: fileRel, kind: "reexport-unresolved-specifier", spec }] });
              continue;
            }
            const targetExports = computeFileExports(target, nextVisiting);
            const match = targetExports.find((e) => e.name === localName);
            if (match) {
              out.push({ name: exportedAs, originFile: match.originFile, originName: match.originName, hopChain: [{ file: fileRel, kind: "reexport", spec }, ...match.hopChain] });
            } else {
              out.push({ name: exportedAs, originFile: null, originName: localName, hopChain: [{ file: fileRel, kind: "reexport-name-not-found-in-target", spec, target }] });
            }
          } else {
            // local export list, e.g. `export { A, B as C };`
            out.push({ name: exportedAs, originFile: fileRel, originName: localName, hopChain: [{ file: fileRel, kind: "local-export-list" }] });
          }
        }
        continue;
      }
      if (!stmt.exportClause && spec) {
        // `export * from './mod'`
        const target = resolveImportTargetFile(spec, fileRel);
        if (target) {
          const targetExports = computeFileExports(target, nextVisiting);
          for (const e of targetExports) {
            if (e.name === "default") continue; // `export *` never forwards a default export
            out.push({ name: e.name, originFile: e.originFile, originName: e.originName, hopChain: [{ file: fileRel, kind: "star-reexport", spec }, ...e.hopChain] });
          }
        }
        continue;
      }
    }
  }
  fileExportCache.set(fileRel, out);
  return out;
}

/* ----------------------------------------------------- reachability index --- */
let reachableIndexCache = null;
function buildReachableIndex() {
  if (reachableIndexCache) return reachableIndexCache;
  const index = new Map(); // `${originFile}::${originName}` -> [{entrypoint, exportedAs, hopChain}]
  for (const ep of getEntrypointFiles()) {
    const exports = computeFileExports(ep, new Set());
    for (const e of exports) {
      if (!e.originFile) continue; // unresolved -- never reachability proof
      const key = `${e.originFile}::${e.originName}`;
      if (!index.has(key)) index.set(key, []);
      index.get(key).push({ entrypoint: ep, exportedAs: e.name, hopChain: e.hopChain });
    }
  }
  reachableIndexCache = index;
  return index;
}

/** Returns the first reachability proof for (declFile, declName), or null. */
export function isDeclarationPubliclyReachable(declFile, declName) {
  const index = buildReachableIndex();
  const hits = index.get(`${declFile}::${declName}`);
  return hits && hits.length ? hits[0] : null;
}

/* ------------------------------------- createEngineComponent wrapper (P0-1) --- */
/**
 * `<ComponentDir>/engines/<engine>/index.ts(x)` is a per-engine implementation
 * file. Its own component is normally NEVER exported from the package's
 * public surface directly -- only the sibling `<ComponentDir>/index.ts(x)`
 * wrapper (`export const Name = createEngineComponent('Name', { engine: () =>
 * import('./engines/<engine>') | engineBinding })`) is public. Detect this
 * pattern and surface the WRAPPER's (file, name) as an additional reachability
 * candidate. Bounded heuristic (exact syntactic pattern match), documented,
 * never asserts non-existence -- an unmatched pattern simply yields no
 * additional candidate (fail-closed: falls through to whatever other
 * candidates already apply).
 */
const wrapperCandidateCache = new Map();
export function createEngineComponentWrapperCandidate(sinkFileRel) {
  if (wrapperCandidateCache.has(sinkFileRel)) return wrapperCandidateCache.get(sinkFileRel);
  const m = sinkFileRel.match(/^(.*)\/engines\/(classic|modern|rustic)\/index\.tsx?$/);
  if (!m) {
    wrapperCandidateCache.set(sinkFileRel, null);
    return null;
  }
  const componentDir = m[1];
  const engine = m[2];
  let found = null;
  for (const ext of ["index.tsx", "index.ts"]) {
    const wrapperFileRel = `${componentDir}/${ext}`;
    const src = getSource(wrapperFileRel);
    if (!src) continue;
    const imports = collectModuleImportsLocal(src.source);
    const walk = (node) => {
      if (found) return;
      if (ts.isVariableStatement(node)) {
        const hasExport = (node.modifiers ?? []).some((mm) => mm.kind === ts.SyntaxKind.ExportKeyword);
        for (const decl of node.declarationList.declarations) {
          if (!hasExport || !ts.isIdentifier(decl.name) || !decl.initializer) continue;
          const init = unwrap(decl.initializer);
          if (!ts.isCallExpression(init) || !ts.isIdentifier(init.expression) || init.expression.text !== "createEngineComponent") continue;
          const configArg = init.arguments.find((a) => ts.isObjectLiteralExpression(a));
          if (!configArg) continue;
          for (const prop of configArg.properties) {
            if (!ts.isPropertyAssignment(prop)) continue;
            const propKey = ts.isIdentifier(prop.name) ? prop.name.text : ts.isStringLiteralLike(prop.name) ? prop.name.text : null;
            if (propKey !== engine) continue;
            const val = unwrap(prop.initializer);
            let referencesEngineDir = false;
            let loaderForm = null;
            let loaderSpecifier = null;
            if (ts.isArrowFunction(val) && val.body) {
              const body = unwrap(val.body);
              if (ts.isCallExpression(body) && body.expression.kind === ts.SyntaxKind.ImportKeyword && body.arguments[0] && ts.isStringLiteralLike(body.arguments[0])) {
                loaderForm = "dynamic-import";
                loaderSpecifier = body.arguments[0].text;
                referencesEngineDir = loaderSpecifier.replace(/^\.\//, "").includes(`engines/${engine}`);
              }
            } else if (ts.isIdentifier(val)) {
              const imp = imports.get(val.text);
              loaderForm = "identifier-binding";
              loaderSpecifier = imp?.moduleSpecifier ?? null;
              referencesEngineDir = !!imp && typeof imp.moduleSpecifier === "string" && imp.moduleSpecifier.includes(`engines/${engine}`);
            }
            if (referencesEngineDir) {
              found = { wrapperFileRel, wrapperName: decl.name.text, engine, loaderForm, loaderSpecifier, configKeyLine: src.text ? src.source.getLineAndCharacterOfPosition(prop.getStart(src.source)).line + 1 : null };
            }
          }
        }
      }
      if (!found) ts.forEachChild(node, walk);
    };
    walk(src.source);
    if (found) break;
  }
  wrapperCandidateCache.set(sinkFileRel, found);
  return found;
}

/* --------------------------------- engine-module root + usage graph (blocker 4) --- */
/** Every named local function-like declaration in `sourceFile`: function
 * declarations, and `const Name = (arrow|function expression)`. Returns
 * Map<name, node>. */
/** `memo(fn)`, `forwardRef(fn)`, `React.memo(fn)`, `React.forwardRef(fn)`, and
 * nested combinations (`memo(forwardRef(fn))`) unwrap to the INNERMOST
 * function -- the node an owner-function walk (`isFunctionLike` in
 * resolver.mjs) actually lands on for a component defined this way (e.g.
 * `export const Calendar = React.forwardRef((props, ref) => {...})`). */
function unwrapComponentWrapperCalls(node) {
  let current = unwrap(node);
  for (let guard = 0; guard < 4 && current && ts.isCallExpression(current); guard += 1) {
    const callee = current.expression;
    const calleeName = ts.isIdentifier(callee) ? callee.text : ts.isPropertyAccessExpression(callee) ? callee.name.text : null;
    if ((calleeName === "memo" || calleeName === "forwardRef") && current.arguments[0]) {
      current = unwrap(current.arguments[0]);
      continue;
    }
    break;
  }
  return current;
}

/** v6 / P0-3 fix: recurse into the FULL tree, not just `sourceFile.statements`
 * -- v5 only registered TOP-LEVEL named function-likes, so a reference inside
 * a NESTED named local (e.g. `function NeverCalled(){ return <DeadHelper/>; }`
 * declared inside another function's body) was never itself a graph node.
 * `buildLocalUsageGraph`'s walk visits the whole file regardless of nesting,
 * so that reference's `nameOfEnclosingNamedFunction` lookup skipped PAST the
 * unregistered nested scope and landed on the nearest REGISTERED ancestor
 * (the outer, top-level function) -- misattributing the reference as if the
 * outer function had made it directly. Concretely: `Root` containing
 * `function NeverCalled(){ return <DeadHelper/>; }` where `NeverCalled` is
 * itself never called from anywhere produced a false `Root -> DeadHelper`
 * edge, so `proveEngineWrapperChain` reported `DeadHelper` as proven-reachable
 * even though nothing actually calls the path that reaches it.
 *
 * Registering every named function-like local at ANY depth -- not just top
 * level -- fixes this without touching `buildLocalUsageGraph`'s walk or
 * `nameOfEnclosingNamedFunction`'s nearest-enclosing-declaration match at
 * all: once `NeverCalled` is itself a registered scope, the nearest-match
 * correctly stops there instead of punching through to `Root`, and the
 * (now-correct) graph has no edge INTO `NeverCalled` unless something
 * actually calls/renders it. This is a strict superset of v5's top-level-only
 * collection -- the exact top-level negative fixture (a dead top-level
 * helper referenced nowhere) is unaffected. */
function collectLocalFunctionDecls(sourceFile) {
  const decls = new Map();
  const visit = (node) => {
    if (ts.isFunctionDeclaration(node) && node.name) {
      decls.set(node.name.text, node);
    } else if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer) {
      const init = unwrapComponentWrapperCalls(node.initializer);
      if (init && (ts.isArrowFunction(init) || ts.isFunctionExpression(init))) decls.set(node.name.text, init);
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return decls;
}

/** The exact React.lazy contract (`component-factory/index.tsx`:
 * `lazy(loaders.classic)` always resolves `{ default: ComponentType }`) means
 * the engine module's EFFECTIVE root is its `export default`. Returns the
 * root's name (registered in `decls` if it wasn't already, for an anonymous
 * default export) or `null` if the file has no default export at all -- a
 * genuine chain-breaking fact, not a search gap. */
function findDefaultExportRootName(sourceFile, decls) {
  for (const stmt of sourceFile.statements) {
    if (ts.isFunctionDeclaration(stmt) && stmt.name) {
      const hasDefault = (stmt.modifiers ?? []).some((m) => m.kind === ts.SyntaxKind.DefaultKeyword);
      const hasExport = (stmt.modifiers ?? []).some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
      if (hasExport && hasDefault) {
        decls.set(stmt.name.text, stmt);
        return stmt.name.text;
      }
    }
    if (ts.isExportAssignment(stmt) && !stmt.isExportEquals) {
      const expr = unwrap(stmt.expression);
      if (ts.isIdentifier(expr) && decls.has(expr.text)) return expr.text;
      const unwrapped = unwrapComponentWrapperCalls(expr);
      if (unwrapped && (ts.isArrowFunction(unwrapped) || ts.isFunctionExpression(unwrapped))) {
        const syntheticName = "<anonymous-default-export>";
        decls.set(syntheticName, unwrapped);
        return syntheticName;
      }
    }
  }
  return null;
}

/** The nearest enclosing named local declaration (by REFERENCE identity, not
 * just name text -- avoids matching an unrelated same-named node) containing
 * `node`, or null if `node` sits outside every named local. */
function nameOfEnclosingNamedFunction(node, decls) {
  let current = node;
  while (current) {
    for (const [name, declNode] of decls) if (declNode === current) return name;
    current = current.parent;
  }
  return null;
}

/** caller -> Set(callee) for every LOCAL function referenced via a JSX tag
 * (`<Callee .../>`) or a direct call (`Callee(...)`) inside another local
 * function's body. This is the "call/JSX/dataflow usage" hop of blocker 4. */
function buildLocalUsageGraph(sourceFile, decls) {
  const graph = new Map();
  for (const name of decls.keys()) graph.set(name, new Set());
  const record = (referrerNode, calleeName) => {
    const referrer = nameOfEnclosingNamedFunction(referrerNode, decls);
    if (referrer && referrer !== calleeName) graph.get(referrer)?.add(calleeName);
  };
  const walk = (node) => {
    if ((ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) && ts.isIdentifier(node.tagName) && decls.has(node.tagName.text)) {
      record(node, node.tagName.text);
    }
    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && decls.has(node.expression.text)) {
      record(node, node.expression.text);
    }
    ts.forEachChild(node, walk);
  };
  walk(sourceFile);
  return graph;
}

/** BFS reachability from `rootName` to `targetName` over `graph`,
 * cycle-safe, returning the hop chain (root..target) or null if unreachable. */
function reachableChain(graph, rootName, targetName) {
  if (rootName === targetName) return [rootName];
  const visited = new Set([rootName]);
  const parent = new Map();
  const queue = [rootName];
  while (queue.length) {
    const cur = queue.shift();
    for (const next of graph.get(cur) ?? []) {
      if (visited.has(next)) continue;
      visited.add(next);
      parent.set(next, cur);
      if (next === targetName) {
        const chain = [targetName];
        let n = targetName;
        while (parent.has(n)) {
          n = parent.get(n);
          chain.push(n);
        }
        return chain.reverse();
      }
      queue.push(next);
    }
  }
  return null;
}

/**
 * Blocker 4 -- the FULL chain proof the independent-final REJECT demanded:
 * package public subpath/root -> wrapper export -> factory engine mapping
 * (which config key, dynamic-import or identifier binding) -> engine module
 * effective default export -> call/JSX usage path -> ownerFunction exact ->
 * (intrinsic sink is checked by the caller). Every hop carries file/export/
 * binding/source coordinates. Returns `{applicable:false}` when the sink
 * file does not even match the engine-file convention (nothing to attempt);
 * `{applicable:true, proven:false, reason}` when the pattern matched but the
 * chain could not be closed (dead/foreign local helper, no default export,
 * owner not a named local at all); `{applicable:true, proven:true, chain}`
 * with the full per-hop receipt when every hop closes.
 */
const chainProofCache = new Map();
export function proveEngineWrapperChain(ownerFunctionNode, sinkFileRel) {
  const wrapperHit = createEngineComponentWrapperCandidate(sinkFileRel);
  if (!wrapperHit) return { applicable: false };
  // Ground truth for the engine-file tree is the OWNER NODE'S OWN source
  // file, not a freshly re-fetched `getSource(sinkFileRel)` -- the caller
  // (drive.mjs's scanTsxSource, intentionally byte-identical to
  // cascade-producers.mjs) parses the sink file with its OWN independent
  // `ts.createSourceFile` call, so `ownerFunctionNode` belongs to THAT parse
  // tree, not necessarily to the shared getSource() cache's parse of the
  // same path. Matching declarations by node IDENTITY (as
  // `nameOfEnclosingNamedFunction` does) requires walking the SAME tree the
  // node came from. `getSourceFile()` finds it via the node's own parent
  // chain, which is always correct regardless of which cache produced it.
  const engineSourceFile = ownerFunctionNode.getSourceFile();
  if (!engineSourceFile) return { applicable: true, proven: false, reason: "engine-file-unreadable", wrapperHit };

  const cacheKey = `${sinkFileRel}::${ownerFunctionNode.getStart(engineSourceFile)}`;
  if (chainProofCache.has(cacheKey)) return chainProofCache.get(cacheKey);

  const decls = collectLocalFunctionDecls(engineSourceFile);
  const rootName = findDefaultExportRootName(engineSourceFile, decls);
  if (!rootName) {
    const result = { applicable: true, proven: false, reason: "engine-module-has-no-default-export", wrapperHit };
    chainProofCache.set(cacheKey, result);
    return result;
  }
  const ownerName = nameOfEnclosingNamedFunction(ownerFunctionNode, decls);
  if (!ownerName) {
    const result = { applicable: true, proven: false, reason: "owner-function-is-not-a-named-local-declaration", wrapperHit, engineDefaultExportName: rootName };
    chainProofCache.set(cacheKey, result);
    return result;
  }
  const graph = buildLocalUsageGraph(engineSourceFile, decls);
  const usageChain = reachableChain(graph, rootName, ownerName);
  const result = usageChain
    ? {
        applicable: true,
        proven: true,
        chain: {
          wrapperFileRel: wrapperHit.wrapperFileRel,
          wrapperName: wrapperHit.wrapperName,
          engine: wrapperHit.engine,
          loaderForm: wrapperHit.loaderForm,
          loaderSpecifier: wrapperHit.loaderSpecifier,
          engineFileRel: sinkFileRel,
          engineDefaultExportName: rootName,
          usageChain,
          ownerFunctionName: ownerName,
        },
      }
    : { applicable: true, proven: false, reason: "owner-function-not-reachable-from-default-export-root (dead or foreign local helper)", wrapperHit, engineDefaultExportName: rootName, ownerName };
  chainProofCache.set(cacheKey, result);
  return result;
}

/* ---------------------------------------------- candidate export names --- */
/**
 * Given the function-like node that is a relay's parameter owner, and the
 * file it lives in, produce every candidate (file, name) pair worth checking
 * for public reachability: direct function-declaration export, the enclosing
 * `export const X = <this fn, possibly memo()/forwardRef()-wrapped>` variable,
 * and (independently, GATED on the full chain proof -- blocker 4) the
 * createEngineComponent sibling-wrapper candidate. `wrapperAttempt` is always
 * returned alongside so the caller can distinguish "no wrapper mechanism
 * applies here" from "a wrapper mechanism applied but did not prove" (the
 * latter must never fall back to a plain unexamined relay -- it is a
 * distinct, investigated-but-inconclusive fact).
 */
export function candidateExportedNamesForFunction(fnNode, fileRel) {
  const candidates = [];
  if (ts.isFunctionDeclaration(fnNode) && fnNode.name) {
    candidates.push({ file: fileRel, name: fnNode.name.text, via: "direct-function-declaration" });
  }
  let node = fnNode;
  const wrapperNames = [];
  while (node.parent && ts.isCallExpression(node.parent) && node.parent.arguments[0] === node) {
    const callee = node.parent.expression;
    wrapperNames.push(ts.isIdentifier(callee) ? callee.text : "(unknown-wrapper)");
    node = node.parent;
  }
  if (node.parent && ts.isVariableDeclaration(node.parent) && node.parent.initializer === node && ts.isIdentifier(node.parent.name)) {
    candidates.push({
      file: fileRel,
      name: node.parent.name.text,
      via: wrapperNames.length ? `variable-declaration-via-wrapper:${wrapperNames.join(">")}` : "variable-declaration",
    });
  }
  const wrapperAttempt = proveEngineWrapperChain(fnNode, fileRel);
  if (wrapperAttempt.applicable && wrapperAttempt.proven) {
    candidates.push({
      file: wrapperAttempt.chain.wrapperFileRel,
      name: wrapperAttempt.chain.wrapperName,
      via: "createEngineComponent-wrapper-delegation",
      chainReceipt: wrapperAttempt.chain,
    });
  }
  return { candidates, wrapperAttempt };
}

export { unwrap };
