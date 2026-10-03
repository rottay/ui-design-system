import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

export const DEFAULT_PACKAGE = '@rottay/design-system';

const SCRIPT_KINDS = new Map([
  ['.tsx', ts.ScriptKind.TSX],
  ['.jsx', ts.ScriptKind.JSX],
  ['.js', ts.ScriptKind.JSX],
  ['.mjs', ts.ScriptKind.JS],
  ['.cjs', ts.ScriptKind.JS],
]);

/**
 * The published subpath a specifier names (`@rottay/design-system/icons` -> `./icons`), or null.
 * A package whose name only starts the same way (`@rottay/design-system-extras`) is not the design system.
 */
export function dsSubpath(specifier, packageName = DEFAULT_PACKAGE) {
  if (specifier === packageName) return '.';
  if (specifier.startsWith(`${packageName}/`)) return `./${specifier.slice(packageName.length + 1)}`;
  return null;
}

export function specifierFor(subpath, packageName = DEFAULT_PACKAGE) {
  return subpath === '.' ? packageName : `${packageName}/${subpath.slice(2)}`;
}

const ASSET_SPECIFIER = /\.(css|scss|sass|less|svg|png|jpe?g|gif|webp|avif|ico|json|mdx?|woff2?|ttf|txt|ya?ml|graphql|wasm)(\?.*)?$/;
const ALIAS_SHAPED = /^(@\/|~|#)/;

function matchesPathsKey(specifier, options) {
  return Object.keys(options.paths ?? {}).some((pattern) => (pattern.includes('*')
    ? specifier.startsWith(pattern.split('*')[0])
    : specifier === pattern));
}

/** A relative path, a tsconfig `paths` alias or an alias-shaped name; a bare package name is never a consumer file. */
function isConsumerSpecifier(specifier, options) {
  if (specifier.startsWith('.') || specifier.startsWith('/')) return true;
  return matchesPathsKey(specifier, options) || ALIAS_SHAPED.test(specifier);
}

function ds(subpath, name, members, hops) {
  return { kind: 'ds', subpath, name, members, hops };
}

/**
 * True when the consumer reaches the symbol under its published name: directly or through `export *` only.
 * A named re-export or a local alias makes the name consumer-owned.
 */
export function reachesByPublishedName(origin) {
  return origin.kind === 'ds' && !origin.hops.some((hop) => hop.kind === 'named' || hop.kind === 'alias');
}

/**
 * Module graph over consumer files. A binding is design-system-owned only when its import or
 * re-export chain ends in a specifier that is the package or one of its subpaths.
 */
export function createWorkspace({ packageName = DEFAULT_PACKAGE } = {}) {
  const parsed = new Map();
  const tables = new Map();
  const optionsByDirectory = new Map();
  const resolutions = new Map();
  const exportOrigins = new Map();
  const unresolved = new Map();

  function read(file) {
    return fs.readFileSync(file, 'utf8');
  }

  function parse(file) {
    let entry = parsed.get(file);
    if (!entry) {
      const text = read(file);
      const kind = SCRIPT_KINDS.get(path.extname(file)) ?? ts.ScriptKind.TS;
      entry = { text, sourceFile: ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, kind) };
      parsed.set(file, entry);
    }
    return entry;
  }

  /** Replaces a file's text in memory, so a planned rewrite can be re-analysed without touching the disk. */
  function overlay(file, text) {
    const kind = SCRIPT_KINDS.get(path.extname(file)) ?? ts.ScriptKind.TS;
    parsed.set(file, { text, sourceFile: ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, kind) });
    tables.delete(file);
    exportOrigins.clear();
  }

  function compilerOptionsFor(file) {
    const directory = path.dirname(file);
    if (optionsByDirectory.has(directory)) return optionsByDirectory.get(directory);
    let options = { moduleResolution: ts.ModuleResolutionKind.Bundler, allowJs: true, jsx: ts.JsxEmit.Preserve };
    const configPath = ts.findConfigFile(directory, ts.sys.fileExists, 'tsconfig.json');
    if (configPath) {
      const raw = ts.readConfigFile(configPath, ts.sys.readFile);
      if (!raw.error) {
        const host = { ...ts.sys, readDirectory: () => [] };
        const config = ts.parseJsonConfigFileContent(raw.config, host, path.dirname(configPath));
        options = { ...config.options, allowJs: true };
      }
    }
    optionsByDirectory.set(directory, options);
    return options;
  }

  function resolveModule(specifier, fromFile) {
    const key = `${path.dirname(fromFile)}\0${specifier}`;
    if (resolutions.has(key)) return resolutions.get(key);
    let resolved = null;
    const options = compilerOptionsFor(fromFile);
    if (!isConsumerSpecifier(specifier, options)) {
      resolutions.set(key, null);
      return null;
    }
    const result = ts.resolveModuleName(specifier, fromFile, options, ts.sys);
    const module = result.resolvedModule;
    if (module && !module.isExternalLibraryImport && !module.resolvedFileName.includes('/node_modules/')
      && /\.[cm]?[jt]sx?$/.test(module.resolvedFileName)) {
      resolved = module.resolvedFileName;
    }
    const isAsset = ASSET_SPECIFIER.test(specifier)
      || (specifier.startsWith('.') && fs.existsSync(path.resolve(path.dirname(fromFile), specifier)));
    if (!module && !isAsset) {
      const directory = path.dirname(fromFile);
      if (!unresolved.has(directory)) unresolved.set(directory, new Set());
      unresolved.get(directory).add(specifier);
    }
    resolutions.set(key, resolved);
    return resolved;
  }

  /** True when the consumer-shaped specifier named from this file resolves to nothing the kit can read. */
  function isUnresolved(specifier, fromFile) {
    if (!isConsumerSpecifier(specifier, compilerOptionsFor(fromFile))) return false;
    resolveModule(specifier, fromFile);
    return unresolved.get(path.dirname(fromFile))?.has(specifier) ?? false;
  }

  /**
   * The published subpath the specifier names from this file, or null. A tsconfig `paths` entry that
   * maps the package name to a local folder makes the specifier consumer code, not the design system.
   */
  function packageSubpath(specifier, fromFile) {
    const subpath = dsSubpath(specifier, packageName);
    if (!subpath) return null;
    return matchesPathsKey(specifier, compilerOptionsFor(fromFile)) ? null : subpath;
  }

  function isPackageAliased(specifier, fromFile) {
    return dsSubpath(specifier, packageName) !== null && packageSubpath(specifier, fromFile) === null;
  }

  function bindingNames(name, into) {
    if (ts.isIdentifier(name)) into.push(name.text);
    else for (const element of name.elements) if (!ts.isOmittedExpression(element)) bindingNames(element.name, into);
    return into;
  }

  function moduleTable(file) {
    let table = tables.get(file);
    if (table) return table;
    const { sourceFile } = parse(file);
    table = { imports: new Map(), exports: new Map(), stars: [], declarations: new Map() };
    for (const statement of sourceFile.statements) {
      if (ts.isImportDeclaration(statement) && ts.isStringLiteral(statement.moduleSpecifier)) {
        const specifier = statement.moduleSpecifier.text;
        const clause = statement.importClause;
        if (!clause) continue;
        if (clause.name) table.imports.set(clause.name.text, { specifier, imported: 'default', node: clause });
        const bindings = clause.namedBindings;
        if (bindings && ts.isNamespaceImport(bindings)) {
          table.imports.set(bindings.name.text, { specifier, imported: '*', node: bindings });
        } else if (bindings) {
          for (const element of bindings.elements) {
            table.imports.set(element.name.text, {
              specifier,
              imported: (element.propertyName ?? element.name).text,
              node: element,
            });
          }
        }
        continue;
      }
      if (ts.isExportDeclaration(statement)) {
        const specifier = statement.moduleSpecifier && ts.isStringLiteral(statement.moduleSpecifier)
          ? statement.moduleSpecifier.text
          : null;
        const clause = statement.exportClause;
        if (specifier && !clause) table.stars.push(specifier);
        else if (specifier && ts.isNamespaceExport(clause)) {
          table.exports.set(clause.name.text, { kind: 'from', specifier, imported: '*' });
        } else if (clause && ts.isNamedExports(clause)) {
          for (const element of clause.elements) {
            const source = (element.propertyName ?? element.name).text;
            table.exports.set(element.name.text, specifier
              ? { kind: 'from', specifier, imported: source }
              : { kind: 'local', localName: source });
          }
        }
        continue;
      }
      if (ts.isExportAssignment(statement)) {
        if (!statement.isExportEquals && ts.isIdentifier(statement.expression)) {
          table.exports.set('default', { kind: 'local', localName: statement.expression.text });
        } else if (!statement.isExportEquals) {
          table.exports.set('default', { kind: 'local', localName: null });
        }
        continue;
      }
      const names = [];
      if (ts.isVariableStatement(statement)) {
        for (const declaration of statement.declarationList.declarations) {
          const declared = bindingNames(declaration.name, []);
          for (const name of declared) table.declarations.set(name, declaration);
          names.push(...declared);
        }
      } else if ((ts.isFunctionDeclaration(statement) || ts.isClassDeclaration(statement)
        || ts.isInterfaceDeclaration(statement) || ts.isTypeAliasDeclaration(statement)
        || ts.isEnumDeclaration(statement) || ts.isModuleDeclaration(statement)) && statement.name
        && ts.isIdentifier(statement.name)) {
        table.declarations.set(statement.name.text, statement);
        names.push(statement.name.text);
      }
      const modifiers = ts.canHaveModifiers(statement) ? ts.getModifiers(statement) ?? [] : [];
      if (!modifiers.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword)) continue;
      if (modifiers.some((modifier) => modifier.kind === ts.SyntaxKind.DefaultKeyword)) {
        table.exports.set('default', { kind: 'local', localName: names[0] ?? null });
      } else {
        for (const name of names) table.exports.set(name, { kind: 'local', localName: name });
      }
    }
    tables.set(file, table);
    return table;
  }

  function resolveImport(file, specifier, imported, hops = [], seen = new Set()) {
    const subpath = packageSubpath(specifier, file);
    if (subpath) return ds(subpath, imported, [], hops);
    if (isPackageAliased(specifier, file)) return { kind: 'aliased-package', specifier };
    const target = resolveModule(specifier, file);
    if (!target) return { kind: 'external', specifier };
    if (imported === '*') return { kind: 'module', file: target, hops };
    return resolveExport(target, imported, hops, seen);
  }

  function localAlias(file, declaration, hops, seen) {
    if (!declaration || !ts.isVariableDeclaration(declaration) || !declaration.initializer) return null;
    if (!ts.isIdentifier(declaration.name)) return null;
    if (!(declaration.parent.flags & ts.NodeFlags.Const)) return null;
    let expression = declaration.initializer;
    const members = [];
    while (ts.isPropertyAccessExpression(expression)) {
      members.unshift(expression.name.text);
      expression = expression.expression;
    }
    if (!ts.isIdentifier(expression)) return null;
    const table = moduleTable(file);
    const binding = table.imports.get(expression.text);
    if (!binding) return null;
    const origin = resolveImport(file, binding.specifier, binding.imported, [...hops, { file, kind: 'alias' }], seen);
    return applyMembers(origin, members);
  }

  function resolveExport(file, name, hops = [], seen = new Set()) {
    const key = `${file}\0${name}`;
    if (hops.length === 0 && exportOrigins.has(key)) return exportOrigins.get(key);
    if (seen.has(key)) return { kind: 'unknown', reason: 'cycle' };
    const visited = new Set(seen).add(key);
    const origin = resolveExportUncached(file, name, hops, visited);
    if (hops.length === 0) exportOrigins.set(key, origin);
    return origin;
  }

  function resolveExportUncached(file, name, hops, seen) {
    const table = moduleTable(file);
    const entry = table.exports.get(name);
    if (entry?.kind === 'from') {
      return resolveImport(file, entry.specifier, entry.imported, [...hops, { file, kind: 'named' }], seen);
    }
    if (entry?.kind === 'local') {
      const binding = entry.localName ? table.imports.get(entry.localName) : null;
      if (binding) {
        return resolveImport(file, binding.specifier, binding.imported, [...hops, { file, kind: 'named' }], seen);
      }
      const declaration = entry.localName ? table.declarations.get(entry.localName) : null;
      return localAlias(file, declaration, hops, seen)
        ?? { kind: 'local', file, name: entry.localName, declaration: declaration ?? null };
    }
    if (name === 'default') return { kind: 'unknown', reason: 'no-default-export' };
    let viaPackage = null;
    for (const specifier of table.stars) {
      const subpath = packageSubpath(specifier, file);
      if (subpath) {
        viaPackage ??= ds(subpath, name, [], [...hops, { file, kind: 'star' }]);
        continue;
      }
      const target = resolveModule(specifier, file);
      if (!target) continue;
      const origin = resolveExport(target, name, [...hops, { file, kind: 'star' }], seen);
      if (origin.kind !== 'unknown') return origin;
    }
    return viaPackage ?? { kind: 'unknown', reason: 'not-exported' };
  }

  function applyMembers(origin, members) {
    let current = origin;
    for (const member of members) current = memberOf(current, member);
    return current;
  }

  /** The origin of `<origin>.<member>`. */
  function memberOf(origin, member) {
    if (origin.kind === 'ds') {
      if (origin.name === '*') return ds(origin.subpath, member, [], origin.hops);
      return ds(origin.subpath, origin.name, [...origin.members, member], origin.hops);
    }
    if (origin.kind === 'module') return resolveExport(origin.file, member, origin.hops);
    return { kind: 'unknown', reason: 'member-of-non-module' };
  }

  /** Every name a module exports, following `export *` through consumer files. */
  function exportNames(file, seen = new Set()) {
    if (seen.has(file)) return { names: new Set(), complete: true };
    seen.add(file);
    const table = moduleTable(file);
    const names = new Set(table.exports.keys());
    let complete = true;
    for (const specifier of table.stars) {
      const target = resolveModule(specifier, file);
      if (!target) {
        complete = false;
        continue;
      }
      const inner = exportNames(target, seen);
      if (!inner.complete) complete = false;
      for (const name of inner.names) if (name !== 'default') names.add(name);
    }
    return { names, complete };
  }

  return {
    packageName, parse, overlay, moduleTable, packageSubpath, isPackageAliased, isUnresolved, resolveModule, resolveImport, resolveExport, memberOf, exportNames,
  };
}

function createChecker(sourceFile) {
  const host = {
    getSourceFile: (name) => (name === sourceFile.fileName ? sourceFile : undefined),
    getDefaultLibFileName: () => 'lib.d.ts',
    writeFile: () => {},
    getCurrentDirectory: () => path.dirname(sourceFile.fileName),
    getCanonicalFileName: (name) => name,
    useCaseSensitiveFileNames: () => true,
    getNewLine: () => '\n',
    fileExists: (name) => name === sourceFile.fileName,
    readFile: () => undefined,
  };
  const program = ts.createProgram([sourceFile.fileName], {
    noResolve: true,
    noLib: true,
    allowJs: true,
    types: [],
    jsx: ts.JsxEmit.Preserve,
    target: ts.ScriptTarget.Latest,
  }, host);
  return program.getTypeChecker();
}

function isNameOnlyPosition(identifier) {
  const parent = identifier.parent;
  if (ts.isPropertyAccessExpression(parent)) return parent.name === identifier;
  if (ts.isQualifiedName(parent)) return parent.right === identifier;
  if (ts.isJsxAttribute(parent)) return parent.name === identifier;
  if (ts.isBindingElement(parent)) return parent.propertyName === identifier;
  if (ts.isImportSpecifier(parent)) return parent.propertyName === identifier;
  if (ts.isPropertyAssignment(parent) || ts.isPropertySignature(parent) || ts.isPropertyDeclaration(parent)
    || ts.isMethodDeclaration(parent) || ts.isMethodSignature(parent) || ts.isEnumMember(parent)
    || ts.isGetAccessorDeclaration(parent) || ts.isSetAccessorDeclaration(parent)
    || ts.isNamedTupleMember(parent) || ts.isLabeledStatement(parent) || ts.isBreakOrContinueStatement(parent)) {
    return parent.name === identifier || parent.label === identifier;
  }
  return false;
}

/**
 * Lexical resolution inside one file. Scoping comes from the TypeScript binder (single-file program,
 * module resolution off), so a binding that shadows an import is never mistaken for the import.
 */
export function analyzeFile(workspace, file) {
  const { sourceFile, text } = workspace.parse(file);
  const table = workspace.moduleTable(file);
  let checker = null;
  const origins = new Map();

  function declarationOf(identifier) {
    checker ??= createChecker(sourceFile);
    const parent = identifier.parent;
    let symbol;
    if (ts.isShorthandPropertyAssignment(parent) && parent.name === identifier) {
      symbol = checker.getShorthandAssignmentValueSymbol(parent);
    } else if (ts.isExportSpecifier(parent)) {
      if (parent.parent.parent.moduleSpecifier) return null;
      if ((parent.propertyName ?? parent.name) !== identifier) return null;
      symbol = checker.getExportSpecifierLocalTargetSymbol(parent);
    } else if (isNameOnlyPosition(identifier)) {
      return null;
    } else {
      symbol = checker.getSymbolAtLocation(identifier);
    }
    return symbol?.declarations?.[0] ?? null;
  }

  function originOfDeclaration(declaration) {
    if (origins.has(declaration)) return origins.get(declaration);
    origins.set(declaration, { kind: 'unknown', reason: 'cycle' });
    const origin = computeDeclarationOrigin(declaration);
    origins.set(declaration, origin);
    return origin;
  }

  function importOrigin(declaration, imported) {
    let statement = declaration;
    while (!ts.isImportDeclaration(statement)) statement = statement.parent;
    if (!ts.isStringLiteral(statement.moduleSpecifier)) return { kind: 'unknown', reason: 'specifier' };
    return workspace.resolveImport(file, statement.moduleSpecifier.text, imported);
  }

  function computeDeclarationOrigin(declaration) {
    if (ts.isImportSpecifier(declaration)) {
      return importOrigin(declaration, (declaration.propertyName ?? declaration.name).text);
    }
    if (ts.isImportClause(declaration)) return importOrigin(declaration, 'default');
    if (ts.isNamespaceImport(declaration)) return importOrigin(declaration, '*');
    if (ts.isVariableDeclaration(declaration) && declaration.initializer && ts.isIdentifier(declaration.name)
      && declaration.parent.flags & ts.NodeFlags.Const) {
      const initializer = declaration.initializer;
      if (ts.isIdentifier(initializer) || ts.isPropertyAccessExpression(initializer)) {
        const origin = originOfExpression(initializer);
        if (origin.kind === 'ds') return { ...origin, hops: [...origin.hops, { file, kind: 'alias' }] };
        if (origin.kind === 'module') return origin;
      }
    }
    if (ts.isBindingElement(declaration) && ts.isObjectBindingPattern(declaration.parent)
      && ts.isVariableDeclaration(declaration.parent.parent) && declaration.parent.parent.initializer
      && !declaration.dotDotDotToken) {
      const source = originOfExpression(declaration.parent.parent.initializer);
      const key = declaration.propertyName ?? declaration.name;
      if ((source.kind === 'ds' || source.kind === 'module') && ts.isIdentifier(key)) {
        const origin = workspace.memberOf(source, key.text);
        if (origin.kind === 'ds') return { ...origin, hops: [...origin.hops, { file, kind: 'alias' }] };
        return origin;
      }
    }
    return { kind: 'local', file, declaration };
  }

  function originOfIdentifier(identifier) {
    const declaration = declarationOf(identifier);
    return declaration ? originOfDeclaration(declaration) : { kind: 'unknown', reason: 'unbound' };
  }

  /** Origin of an identifier, `a.b.c` chain or JSX tag name. */
  function originOfExpression(expression) {
    if (ts.isIdentifier(expression)) return originOfIdentifier(expression);
    if (ts.isPropertyAccessExpression(expression)) {
      const base = originOfExpression(expression.expression);
      if (base.kind !== 'ds' && base.kind !== 'module') return { kind: 'unknown', reason: 'member-of-local' };
      return workspace.memberOf(base, expression.name.text);
    }
    if (ts.isQualifiedName(expression)) {
      const base = originOfExpression(expression.left);
      if (base.kind !== 'ds' && base.kind !== 'module') return { kind: 'unknown', reason: 'member-of-local' };
      return workspace.memberOf(base, expression.right.text);
    }
    if (ts.isElementAccessExpression(expression)) {
      const base = originOfExpression(expression.expression);
      if (base.kind !== 'ds' && base.kind !== 'module') return { kind: 'unknown', reason: 'member-of-local' };
      const argument = expression.argumentExpression;
      if (ts.isStringLiteralLike(argument)) return workspace.memberOf(base, argument.text);
      return { kind: 'dynamic', base };
    }
    if (ts.isParenthesizedExpression(expression) || ts.isNonNullExpression(expression)) {
      return originOfExpression(expression.expression);
    }
    return { kind: 'unknown', reason: 'expression' };
  }

  function position(node) {
    const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
    return { line: line + 1, column: character + 1 };
  }

  function walk(visit, node = sourceFile) {
    visit(node);
    ts.forEachChild(node, (child) => walk(visit, child));
  }

  /** True when the file can reach the design system at all, directly or through a consumer barrel. */
  function reachesPackage() {
    if (table.stars.some((specifier) => workspace.packageSubpath(specifier, file))) return true;
    for (const entry of table.exports.values()) {
      if (entry.kind === 'from' && workspace.packageSubpath(entry.specifier, file)) return true;
    }
    for (const binding of table.imports.values()) {
      const origin = workspace.resolveImport(file, binding.specifier, binding.imported);
      if (origin.kind === 'ds' || origin.kind === 'module') return true;
      if (origin.kind === 'local' && origin.declaration) return true;
    }
    return false;
  }

  return {
    file, text, sourceFile, table, workspace, declarationOf, originOfDeclaration, originOfIdentifier,
    originOfExpression, position, walk, reachesPackage,
  };
}
