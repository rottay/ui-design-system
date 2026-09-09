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

/** A declaration's shape: its text with every function body removed. */
export function signatureFingerprint(node, source) {
  const text = node.getText(source);
  const bodies = [];
  const visit = (current) => {
    if ((ts.isFunctionDeclaration(current) || ts.isMethodDeclaration(current)
      || ts.isConstructorDeclaration(current) || ts.isGetAccessorDeclaration(current)
      || ts.isSetAccessorDeclaration(current) || ts.isFunctionExpression(current)
      || ts.isArrowFunction(current)) && current.body && ts.isBlock(current.body)) {
      bodies.push([current.body.getStart(source), current.body.getEnd()]);
      return;
    }
    ts.forEachChild(current, visit);
  };
  visit(node);
  if (bodies.length === 0) return text.replace(/\s+/gu, ' ').trim();
  const start = node.getStart(source);
  let out = '';
  let cursor = start;
  for (const [from, to] of bodies.sort((a, b) => a[0] - b[0])) {
    out += text.slice(cursor - start, from - start) + '{ }';
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
 * One module's export table: what it declares itself, what it forwards, and
 * from where. Import bindings are included so `import { A } from './x'; export
 * { A }` resolves to the module that actually declares `A`.
 */
export function moduleExports(file, text) {
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const local = new Map();
  const declarations = new Map();
  const forwards = new Map();
  const stars = [];
  const imports = new Map();

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
      local.set('default', { kind: 'value', fingerprint: signatureFingerprint(statement.expression, source) });
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
        (exported ? local : declarations).set(declaration.name.text, {
          kind: 'value',
          fingerprint: signatureFingerprint(declaration, source),
        });
      }
      continue;
    }
    if (statement.name && ts.isIdentifier(statement.name)) {
      const record = { kind: declarationKind(statement), fingerprint: signatureFingerprint(statement, source) };
      (exported ? local : declarations).set(statement.name.text, record);
      if (exported && isDefault) local.set('default', record);
      continue;
    }
    if (exported && isDefault) {
      local.set('default', { kind: declarationKind(statement), fingerprint: signatureFingerprint(statement, source) });
    }
  }
  return { local, forwards, stars, imports, declarations };
}

/**
 * Resolves every published subpath to the declarations it exposes.
 *
 * `readModule(file)` returns the text of a repository-relative module or null;
 * `exists(file)` answers whether one is present. Both are injected so a caller
 * can run this over a git revision without checking it out.
 */
export function collectPublicSurface({ entries, readModule, exists }) {
  const tables = new Map();
  const unresolved = [];

  const tableFor = (file) => {
    if (tables.has(file)) return tables.get(file);
    const text = readModule(file);
    const table = text === null ? null : moduleExports(file, text);
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

export { SOURCE_ROOT };
