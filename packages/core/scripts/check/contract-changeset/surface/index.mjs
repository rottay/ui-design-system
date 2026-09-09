/**
 * The published signature surface, derived from exported declarations.
 *
 * WHY A DERIVATION AND NOT A PREFIX LIST. The first version of the release
 * check called a path a signature change only when it sat under
 * `src/entrypoints/` or the entry map. But an entrypoint is a barrel: the
 * declarations it publishes live where they are DEFINED. A range that changed
 * 74 public-contract paths -- including `MountTenantThemeOptions`, which an
 * application writes down -- classified as `library` and was asked for nothing
 * beyond a version bump. A surface described by where its names are re-exported
 * cannot see a change to what those names mean.
 *
 * WHAT THIS OWNS. Two questions, answered from source only, so the check runs
 * before a build:
 *
 *   1. Which files DEFINE a publicly exported declaration? That is the
 *      signature surface, and it is what `classifyPaths` reads.
 *   2. For a given base and head, which public symbols CHANGED shape? That is
 *      what the `contract-diff` block must cover, symbol by symbol.
 *
 * THE FINGERPRINT IS THE SIGNATURE, NOT THE BEHAVIOUR. A symbol's fingerprint
 * is its declaration text with every function body elided, so rewriting an
 * implementation is not a contract event and adding a parameter is. A value
 * declaration keeps its initializer: a public constant IS its value.
 *
 * EXCEPT WHERE THE BODY IS THE SIGNATURE. Eliding the body is only sound when
 * the return type is WRITTEN DOWN. Where it is inferred, the body is the
 * declaration: `export function value() { return 1; }` and `{ return String(1); }`
 * elide to the same text while a consumer holding `const n: number = value()`
 * goes from clean to TS2322. So a function-like with a block body and no return
 * annotation is elided to `{ }: <resolved return type>` -- the type TypeScript
 * would emit into the `.d.ts`, obtained from a real checker over the same
 * revision. A body edit that does not move that type still elides identically,
 * which is why an implementation change stays green.
 *
 * AND WHERE IT CANNOT BE CERTIFIED, IT IS REFUSED. With no certifier the
 * elision carries `UNCERTIFIED_INFERRED_RETURN`, and every published symbol
 * carrying it is reported as `unresolved` -- the same fail-closed channel as an
 * unreadable module. A pair of uncertified fingerprints comparing equal is not
 * evidence that the signature held still.
 *
 * FAIL-CLOSED. An export this resolver cannot follow -- an unreadable module, a
 * star through a package it cannot resolve, a depth or cycle bound -- is
 * recorded as `unresolved` and never silently dropped. A caller that treats
 * "resolved nothing" as "nothing changed" would rebuild the hole this replaces.
 */

import ts from 'typescript';

const MAX_DEPTH = 24;

const SOURCE_ROOT = 'packages/core/src/';
const MODULE_SUFFIXES = ['.ts', '.tsx', '/index.ts', '/index.tsx'];

/** `./dist/entrypoints/public/x/index.js` -> `packages/core/src/entrypoints/public/x/index.ts`. */
export function sourceForDistTarget(target) {
  if (typeof target !== 'string' || !target.startsWith('./dist/')) return null;
  const withoutDist = target.slice('./dist/'.length).replace(/\.(?:js|cjs|mjs|d\.ts)$/u, '');
  return `packages/core/src/${withoutDist}`;
}

/**
 * The bundler's own entry map. Most published subpaths mirror their source
 * path under `dist/`, but the flat bundles (`dist/server.js`,
 * `dist/icons-full.js`, `dist/marks-brand.js`) are named by the build config
 * and mirror nothing. Reading that config is reading the authority; guessing a
 * path for them would drop those subpaths out of the surface silently.
 */
export function viteEntryMap(viteConfigText) {
  const map = new Map();
  if (typeof viteConfigText !== 'string') return map;
  for (const [, name, path] of viteConfigText.matchAll(
    /(?:^|[{,\s])'?([\w./-]+)'?:\s*resolve\(__dirname,\s*'([^']+)'\)/gu,
  )) {
    map.set(name, `packages/core/${path}`);
  }
  return map;
}

/** The import/export target of one `exports` entry, whatever shape it carries. */
function entryTarget(value) {
  if (typeof value === 'string') return value;
  if (!value || typeof value !== 'object') return null;
  return entryTarget(value.import?.default ?? value.import ?? value.default ?? value.types ?? null);
}

/**
 * Every published subpath with the source module it is built from. A subpath
 * whose source cannot be located is REPORTED, never skipped: a surface that
 * quietly loses an entrypoint is a surface that stops demanding anything of it.
 */
export function publishedEntries({ packageManifest, entrypointContract = null, viteEntries = new Map(), exists }) {
  const entries = [];
  const unresolved = [];
  const declared = new Map(
    Object.entries(entrypointContract?.entries ?? {})
      .map(([subpath, entry]) => [subpath, `packages/core/${entry.source}`]),
  );
  for (const [subpath, value] of Object.entries(packageManifest.exports ?? {})) {
    if (subpath.includes('*')) continue;
    const target = entryTarget(value);
    if (typeof target !== 'string' || !target.endsWith('.js')) continue;
    const bundleName = target.slice('./dist/'.length).replace(/\.js$/u, '');
    const candidates = [
      declared.get(subpath),
      viteEntries.get(bundleName),
      ...MODULE_SUFFIXES.map((suffix) => `${sourceForDistTarget(target)}${suffix}`),
      sourceForDistTarget(target),
    ].filter(Boolean);
    const source = candidates.find((candidate) => exists(candidate));
    if (source) entries.push({ subpath, source });
    else unresolved.push({ subpath, target, reason: 'no source module for the published target' });
  }
  return { entries: entries.sort((a, b) => a.subpath.localeCompare(b.subpath)), unresolved };
}

/**
 * This package's own source aliases, as `tsconfig.json` declares them. They are
 * in-package edges and are followed exactly like relative ones; reading them as
 * "outside the source tree" lost every barrel that used one.
 */
const SOURCE_ALIASES = Object.freeze([
  ['@/', ''],
  ['@types/', 'foundation/contracts/'],
  ['@ui/', 'components/'],
]);

function resolveRelative(fromFile, specifier, exists) {
  for (const [prefix, root] of SOURCE_ALIASES) {
    if (!specifier.startsWith(prefix)) continue;
    const base = `${SOURCE_ROOT}${root}${specifier.slice(prefix.length)}`;
    return MODULE_SUFFIXES.map((suffix) => `${base}${suffix}`).find((candidate) => exists(candidate)) ?? null;
  }
  if (!specifier.startsWith('.')) return null;
  const segments = `${fromFile.slice(0, fromFile.lastIndexOf('/'))}/${specifier}`.split('/');
  const stack = [];
  for (const segment of segments) {
    if (segment === '.' || segment === '') continue;
    if (segment === '..') stack.pop();
    else stack.push(segment);
  }
  const base = stack.join('/');
  return MODULE_SUFFIXES.map((suffix) => `${base}${suffix}`).find((candidate) => exists(candidate)) ?? null;
}

/**
 * The elision of an inferred return that nothing certified.
 *
 * It is a visible token and not an empty string on purpose: a caller that
 * compares two fingerprints must be able to see that the comparison was made
 * over an uncertified shape, and `collectPublicSurface` turns it into an
 * `unresolved` row rather than a silent pass.
 */
export const UNCERTIFIED_INFERRED_RETURN = '/* uncertified inferred return */';

function isFunctionLike(node) {
  return ts.isFunctionDeclaration(node) || ts.isMethodDeclaration(node)
    || ts.isConstructorDeclaration(node) || ts.isGetAccessorDeclaration(node)
    || ts.isSetAccessorDeclaration(node) || ts.isFunctionExpression(node)
    || ts.isArrowFunction(node);
}

/**
 * Does this declaration publish a return type that only its BODY states?
 *
 * A constructor returns its class and a setter returns nothing, so neither has
 * an inferable return to certify. Everything else function-like without a
 * `: Type` annotation does, and eliding its body drops the only place the
 * published type is written.
 */
export function returnTypeIsInferred(node) {
  if (ts.isConstructorDeclaration(node) || ts.isSetAccessorDeclaration(node)) return false;
  return isFunctionLike(node) && node.type === undefined;
}

/**
 * A declaration's shape: its text with every function body removed, and the
 * resolved return type kept wherever removing the body would have removed the
 * only statement of it.
 *
 * `certify(node)` returns the emitted return type of one function-like as a
 * string, or null when this run cannot resolve it. Passing no certifier is the
 * pure, source-only mode: it still elides, and it still MARKS what it could not
 * certify.
 */
export function signatureFingerprint(node, source, certify = null) {
  const text = node.getText(source);
  const bodies = [];
  const visit = (current) => {
    if (isFunctionLike(current) && current.body && ts.isBlock(current.body)) {
      bodies.push([current.body.getStart(source), current.body.getEnd(), current]);
      return;
    }
    ts.forEachChild(current, visit);
  };
  visit(node);
  if (bodies.length === 0) return text.replace(/\s+/gu, ' ').trim();
  const elide = (fn) => {
    if (!returnTypeIsInferred(fn)) return '{ }';
    const resolved = certify === null ? null : certify(fn);
    return resolved === null ? `{ }${UNCERTIFIED_INFERRED_RETURN}` : `{ }: ${resolved}`;
  };
  const start = node.getStart(source);
  let out = '';
  let cursor = start;
  for (const [from, to, fn] of bodies.sort((a, b) => a[0] - b[0])) {
    out += text.slice(cursor - start, from - start) + elide(fn);
    cursor = to;
  }
  out += text.slice(cursor - start);
  return out.replace(/\s+/gu, ' ').trim();
}

function declarationKind(node) {
  if (ts.isTypeAliasDeclaration(node)) return 'type';
  if (ts.isInterfaceDeclaration(node)) return 'interface';
  if (ts.isEnumDeclaration(node)) return 'enum';
  if (ts.isClassDeclaration(node)) return 'class';
  if (ts.isFunctionDeclaration(node)) return 'function';
  return 'value';
}

/**
 * The published shape of ONE name from every declaration that carries it.
 *
 * A name can be declared more than once: a function's overload signatures with
 * its implementation, a merged interface, a merged namespace. When overload
 * signatures are present they ARE the contract -- TypeScript hides the
 * implementation signature from every caller -- so the shape is the ordered
 * list of overloads and the implementation is not part of it. Keeping only the
 * last declaration, as this collector first did, made changing an overload's
 * return type invisible while a consumer went from clean to TS2322.
 */
export function combineDeclarations(parts) {
  const overloads = parts.filter((part) => part.overload);
  return (overloads.length > 0 ? overloads : parts).map((part) => part.fingerprint).join(' ');
}

/**
 * One module's export table: what it declares itself, what it forwards, and
 * from where. Import bindings are included so `import { A } from './x'; export
 * { A }` resolves to the module that actually declares `A`.
 */
export function moduleExports(file, text, certify = null) {
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  // The certifier is asked about a node, and only ever about a node in THIS
  // module, so the file it needs to look the node up in travels with the call.
  const certifyHere = certify === null ? null : (node) => certify(file, node);
  const local = new Map();
  const declarations = new Map();
  const forwards = new Map();
  const stars = [];
  const imports = new Map();

  /** Records one declaration of `name`, keeping every earlier one. */
  const record = (table, name, part) => {
    const entry = table.get(name) ?? { kind: part.kind, parts: [] };
    entry.parts.push(part);
    table.set(name, entry);
    return entry;
  };
  const settle = (table) => {
    for (const [name, entry] of table) {
      table.set(name, { kind: entry.kind, fingerprint: combineDeclarations(entry.parts) });
    }
  };

  for (const statement of source.statements) {
    if (ts.isImportDeclaration(statement) && ts.isStringLiteral(statement.moduleSpecifier)) {
      const from = statement.moduleSpecifier.text;
      const clause = statement.importClause;
      if (!clause) continue;
      if (clause.name) imports.set(clause.name.text, { from, imported: 'default' });
      const bindings = clause.namedBindings;
      if (bindings && ts.isNamedImports(bindings)) {
        for (const element of bindings.elements) {
          imports.set(element.name.text, { from, imported: element.propertyName?.text ?? element.name.text });
        }
      }
      continue;
    }
    if (ts.isExportDeclaration(statement)) {
      const from = statement.moduleSpecifier && ts.isStringLiteral(statement.moduleSpecifier)
        ? statement.moduleSpecifier.text
        : null;
      if (!statement.exportClause) {
        if (from) stars.push(from);
        continue;
      }
      if (!ts.isNamedExports(statement.exportClause)) continue;
      for (const element of statement.exportClause.elements) {
        const imported = element.propertyName?.text ?? element.name.text;
        forwards.set(element.name.text, from ? { from, imported } : { from: null, imported });
      }
      continue;
    }
    if (ts.isExportAssignment(statement) && !statement.isExportEquals) {
      record(local, 'default', { kind: 'value', fingerprint: signatureFingerprint(statement.expression, source, certifyHere) });
      continue;
    }
    const modifiers = ts.canHaveModifiers(statement) ? ts.getModifiers(statement) : undefined;
    const exported = modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword) ?? false;
    const isDefault = modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.DefaultKeyword) ?? false;
    if (ts.isVariableStatement(statement)) {
      for (const declaration of statement.declarationList.declarations) {
        if (!ts.isIdentifier(declaration.name)) continue;
        // A declaration WITHOUT `export` is still the definition an
        // `export { … }` clause below it names, so it is recorded either way.
        record(exported ? local : declarations, declaration.name.text, {
          kind: 'value',
          fingerprint: signatureFingerprint(declaration, source, certifyHere),
        });
      }
      continue;
    }
    if (statement.name && ts.isIdentifier(statement.name)) {
      const part = {
        kind: declarationKind(statement),
        fingerprint: signatureFingerprint(statement, source, certifyHere),
        // A function declaration with no body is an overload SIGNATURE, which
        // is what a caller type-checks against.
        overload: ts.isFunctionDeclaration(statement) && statement.body === undefined,
      };
      const entry = record(exported ? local : declarations, statement.name.text, part);
      if (exported && isDefault) local.set('default', entry);
      continue;
    }
    if (exported && isDefault) {
      record(local, 'default', {
        kind: declarationKind(statement),
        fingerprint: signatureFingerprint(statement, source, certifyHere),
      });
    }
  }
  settle(local);
  settle(declarations);
  return { local, forwards, stars, imports, declarations };
}

/**
 * Resolves every published subpath to the declarations it exposes.
 *
 * `readModule(file)` returns the text of a repository-relative module or null;
 * `exists(file)` answers whether one is present. Both are injected so a caller
 * can run this over a git revision without checking it out.
 */
export function collectPublicSurface({ entries, readModule, exists, certify = null }) {
  const tables = new Map();
  const unresolved = [];

  const tableFor = (file) => {
    if (tables.has(file)) return tables.get(file);
    const text = readModule(file);
    const table = text === null ? null : moduleExports(file, text, certify);
    tables.set(file, table);
    return table;
  };

  const namesOf = (file, seen, depth) => {
    const table = tableFor(file);
    if (!table || depth > MAX_DEPTH || seen.has(file)) return [];
    const next = new Set(seen).add(file);
    const names = new Set([...table.local.keys(), ...table.forwards.keys()]);
    for (const star of table.stars) {
      const target = resolveRelative(file, star, exists);
      if (!target) {
        unresolved.push({ file, specifier: star, reason: 'star export leaves the source tree' });
        continue;
      }
      for (const name of namesOf(target, next, depth + 1)) names.add(name);
    }
    names.delete('default');
    return [...names];
  };

  const resolve = (file, name, seen, depth) => {
    const table = tableFor(file);
    if (!table) return { unresolved: 'module is unreadable' };
    if (depth > MAX_DEPTH) return { unresolved: 'export chain exceeded its depth bound' };
    const key = `${file}#${name}`;
    if (seen.has(key)) return { unresolved: 'export chain is cyclic' };
    const next = new Set(seen).add(key);

    const own = table.local.get(name);
    if (own) return { file, name, kind: own.kind, fingerprint: own.fingerprint };

    const forward = table.forwards.get(name);
    if (forward) {
      if (forward.from === null) {
        const declared = table.declarations.get(forward.imported) ?? table.local.get(forward.imported);
        if (declared) return { file, name, kind: declared.kind, fingerprint: declared.fingerprint };
        const binding = table.imports.get(forward.imported);
        if (!binding) return { unresolved: `\`${name}\` is exported from ${file} with no declaration` };
        const target = resolveRelative(file, binding.from, exists);
        if (!target) return { unresolved: `\`${name}\` forwards to ${binding.from}, outside the source tree` };
        return resolve(target, binding.imported, next, depth + 1);
      }
      const target = resolveRelative(file, forward.from, exists);
      if (!target) return { unresolved: `\`${name}\` forwards to ${forward.from}, outside the source tree` };
      return resolve(target, forward.imported, next, depth + 1);
    }

    for (const star of table.stars) {
      const target = resolveRelative(file, star, exists);
      if (!target) continue;
      if (!namesOf(target, new Set(), depth + 1).includes(name)) continue;
      return resolve(target, name, next, depth + 1);
    }
    return { unresolved: `\`${name}\` is not exported by ${file}` };
  };

  const symbols = new Map();
  const files = new Map();
  for (const entry of entries) {
    for (const name of namesOf(entry.source, new Set(), 0).sort()) {
      const resolved = resolve(entry.source, name, new Set(), 0);
      const target = `${entry.subpath}#${name}`;
      if (resolved.unresolved) {
        unresolved.push({ subpath: entry.subpath, name, reason: resolved.unresolved });
        continue;
      }
      symbols.set(target, { ...resolved, subpath: entry.subpath });
      // A published symbol whose inferred return nothing certified is a hole of
      // exactly the kind this collector refuses elsewhere: its two ends compare
      // equal because neither was read, not because neither moved.
      if (resolved.fingerprint.includes(UNCERTIFIED_INFERRED_RETURN)) {
        unresolved.push({
          subpath: entry.subpath,
          name,
          reason: 'its published return type is inferred and this run certified no resolved signature for it',
        });
      }
      if (!files.has(resolved.file)) files.set(resolved.file, new Set());
      files.get(resolved.file).add(target);
    }
  }
  return { symbols, files, unresolved };
}

/**
 * The public symbols whose SHAPE moved between two surfaces, as `contract-diff`
 * targets. Added and removed names count; a re-exported name whose declaration
 * did not move does not.
 */
export function diffSurfaces(base, head) {
  const rows = [];
  for (const [target, symbol] of head.symbols) {
    const previous = base.symbols.get(target);
    if (!previous) rows.push({ target, change: 'added', kind: symbol.kind, file: symbol.file });
    else if (previous.fingerprint !== symbol.fingerprint) {
      rows.push({ target, change: 'changed', kind: symbol.kind, file: symbol.file });
    }
  }
  for (const [target, symbol] of base.symbols) {
    if (!head.symbols.has(target)) rows.push({ target, change: 'removed', kind: symbol.kind, file: symbol.file });
  }
  return rows.sort((left, right) => left.target.localeCompare(right.target));
}

/**
 * The compiler options a certifying program uses over ONE revision's tree.
 *
 * `tsconfig.json` is read from that revision when it is present so the path
 * aliases and lib set match what the package is actually compiled with; a tree
 * without one (the drill sandboxes) falls back to the same bundler-mode
 * defaults. Emit is off in every case: only the checker is wanted.
 */
function certifyingOptions(packageDirectory) {
  const configPath = `${packageDirectory}/tsconfig.json`;
  const declared = ts.sys.fileExists(configPath)
    ? ts.parseJsonConfigFileContent(
      ts.readConfigFile(configPath, (file) => ts.sys.readFile(file)).config ?? {},
      ts.sys,
      packageDirectory,
    ).options
    : {
      target: ts.ScriptTarget.ES2020,
      lib: ['lib.es2020.d.ts', 'lib.dom.d.ts'],
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
      jsx: ts.JsxEmit.ReactJSX,
      strict: true,
    };
  return {
    ...declared,
    // `.mjs` entrypoints are published source too, and without this they are
    // simply absent from the program -- which reads as "cannot certify".
    allowJs: true,
    checkJs: false,
    noEmit: true,
    declaration: false,
    declarationMap: false,
    composite: false,
    incremental: false,
    tsBuildInfoFile: undefined,
    outDir: undefined,
    rootDir: undefined,
  };
}

/**
 * A resolved type printed so that two revisions of the same source print the
 * same string.
 *
 * `typeToString` names a type it cannot reach through an `import("<absolute
 * path>")`, and the two ends of a range are read from two different extracted
 * directories. Left alone, every React-returning component would have diffed on
 * its own tmpdir name. Package paths keep only what follows the last
 * `node_modules/`, so a pnpm store version directory does not move a signature
 * either; in-tree paths become repository-relative.
 */
export function normalizeResolvedType(text, rootDirectory) {
  return text
    .replace(/import\("([^"]*)"\)/gu, (_match, target) => {
      const marker = target.lastIndexOf('/node_modules/');
      if (marker >= 0) return `import("${target.slice(marker + '/node_modules/'.length)}")`;
      if (target.startsWith(`${rootDirectory}/`)) return `import("${target.slice(rootDirectory.length + 1)}")`;
      return `import("${target}")`;
    })
    .replace(/\s+/gu, ' ')
    .trim();
}

/**
 * The certifier `collectPublicSurface` asks for an inferred return type.
 *
 * It builds ONE program per revision, rooted at the published entry modules, and
 * only on the first question -- a revision whose whole surface annotates its
 * returns never pays for a checker. Nodes are matched by exact source span, so
 * the answer belongs to the same declaration the fingerprint was cut from; a
 * span the program does not carry returns null and is refused upstream rather
 * than guessed at.
 */
export function inferredReturnCertifier({ rootDirectory, packageDirectory, entrySources }) {
  let checker = null;
  let program = null;
  const spans = new Map();

  const load = () => {
    if (program !== null) return;
    program = ts.createProgram(
      entrySources.map((source) => `${rootDirectory}/${source}`),
      certifyingOptions(packageDirectory),
    );
    checker = program.getTypeChecker();
  };

  const spansOf = (file) => {
    if (spans.has(file)) return spans.get(file);
    const sourceFile = program.getSourceFile(`${rootDirectory}/${file}`);
    const index = sourceFile === undefined ? null : new Map();
    if (index !== null) {
      const walk = (node) => {
        if (isFunctionLike(node)) index.set(`${node.getStart(sourceFile)}:${node.end}`, node);
        ts.forEachChild(node, walk);
      };
      walk(sourceFile);
    }
    spans.set(file, index);
    return index;
  };

  return (file, node) => {
    load();
    const index = spansOf(file);
    if (index === null) return null;
    const resolved = index.get(`${node.getStart()}:${node.end}`);
    if (resolved === undefined) return null;
    const signature = checker.getSignatureFromDeclaration(resolved);
    if (signature === undefined) return null;
    return normalizeResolvedType(
      checker.typeToString(checker.getReturnTypeOfSignature(signature), resolved, ts.TypeFormatFlags.NoTruncation),
      rootDirectory,
    );
  };
}

export { SOURCE_ROOT };
