/**
 * Root-public export resolver: what `@rottay/design-system` actually exports,
 * computed from source.
 *
 * WHY THIS EXISTS. `family-inventory/index.json` carries its own verdict about public
 * reachability -- every row ships `publicExports`, `declaredComponentsPublic`,
 * `declaredComponentsNotPubliclyNamed` and `sourceResolution:
 * "RESOLVED_SOURCE_AND_PUBLIC_EXPORT"`. Those fields are generated data that the
 * gate then reads back, so today the inventory grades its own homework: a symbol
 * can stop being exported, or start resolving to a different file, and every
 * binding still agrees because they all descend from the same generator run.
 * That is the false green this module removes. It re-derives the answer from
 * `src/index.ts` and the module graph below it, and knows nothing about the
 * inventory's opinion.
 *
 * WHY NOT A TYPESCRIPT PROGRAM. `ts.createProgram` would pull the full type
 * checker, every `lib.*.d.ts`, and every `node_modules` type it can reach --
 * seconds of work and a hard dependency on a resolvable compiler environment,
 * to answer a question that is purely syntactic. This walks the graph
 * on demand with `ts.createSourceFile` (the parser alone, no checker, no lib
 * loading) and parses only the files an actual claim reaches.
 *
 * WHY FAIL-CLOSED. Every way of not knowing is its own state --
 * `UNRESOLVED`, `AMBIGUOUS`, `CYCLE_ONLY` -- never a silent `MISSING` and never
 * a silent pass. A resolver that answers "not found" when it really means "I
 * could not read the file" manufactures exactly the false green it exists to
 * catch.
 */

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

/**
 * Source extensions the resolver will open, in resolution order. `.d.ts` is
 * deliberately absent: a declaration file describes a build artifact, and this
 * module answers what SOURCE exports.
 */
export const SOURCE_EXTENSIONS = Object.freeze(['.ts', '.tsx', '.mts', '.cts']);

/**
 * Terminal states. Anything other than VALUE/TYPE_ONLY means the resolver
 * refused to guess.
 */
export const RESOLUTION_STATES = Object.freeze([
  'VALUE',
  'TYPE_ONLY',
  'MISSING',
  'AMBIGUOUS',
  'UNRESOLVED',
  'CYCLE_ONLY',
]);

/**
 * Declaration shapes that can be a rendered component. Used only by the reverse
 * `public -> exactly one row` projection, where the question is "is this public
 * symbol a component that owes an inventory row, or a token/helper/context that
 * does not". A bare `const` object or a `createContext()` result is public API
 * but not a family, and reporting it as an unowned component would state
 * something untrue about the tree.
 */
const COMPONENT_DECL_KINDS = new Set(['function', 'class', 'const-arrow']);

/** Calls whose result is a component even though the declaration is a `const`. */
const COMPONENT_FACTORY_CALLEES = /^(React\.)?(forwardRef|memo)$|^createEngineComponent$/;

export function loadTypeScript() {
  const require = createRequire(import.meta.url);
  try {
    return require('typescript');
  } catch (cause) {
    // Fail-closed: a missing parser is a finding, never a reason to skip the
    // check and report agreement.
    const error = new Error(
      'root-public resolver requires the `typescript` parser (devDependency of @rottay/design-system)',
    );
    error.cause = cause;
    throw error;
  }
}

function scriptKindFor(ts, file) {
  if (file.endsWith('.tsx')) return ts.ScriptKind.TSX;
  return ts.ScriptKind.TS;
}

/**
 * Reads `compilerOptions.paths` off a tsconfig so alias specifiers resolve to
 * the same file as their relative spelling.
 *
 * Without this, `@/foundation/...` reads as an opaque external while
 * `../../foundation/...` reads as a declaration, and a name re-exported through
 * both spellings arrives at two terminals that are really one. That produced 17
 * false AMBIGUOUS verdicts against `foundation/contracts` -- all types today, so
 * no component row was affected, but a value re-exported both ways would have
 * been reported as genuinely ambiguous when nothing was wrong.
 *
 * Parsing goes through `ts.readConfigFile`, which handles the comments and
 * trailing commas that make tsconfig unreadable as plain JSON. A malformed
 * tsconfig throws rather than degrading to "no aliases": silently resolving
 * fewer specifiers is exactly the false green this resolver exists to prevent.
 */
/** Nearest tsconfig at or above `startDir`; '' when the walk reaches the root. */
export function findTsconfig(startDir) {
  let dir = path.resolve(startDir);
  for (;;) {
    const candidate = path.join(dir, 'tsconfig.json');
    if (fs.existsSync(candidate)) return candidate;
    const parent = path.dirname(dir);
    if (parent === dir) return '';
    dir = parent;
  }
}

export function loadPathAliases(ts, tsconfigFile) {
  if (!fs.existsSync(tsconfigFile)) return [];
  const read = ts.readConfigFile(tsconfigFile, (file) => fs.readFileSync(file, 'utf8'));
  if (read.error) {
    throw new Error(`cannot parse ${tsconfigFile} for compilerOptions.paths`);
  }
  const options = read.config?.compilerOptions ?? {};
  const paths = options.paths;
  if (!paths || typeof paths !== 'object') return [];

  const configDir = path.dirname(tsconfigFile);
  // TS 5 allows `paths` without `baseUrl`, in which case targets are relative to
  // the tsconfig's own directory.
  const baseDir = options.baseUrl ? path.resolve(configDir, options.baseUrl) : configDir;

  const aliases = [];
  for (const [pattern, rawTargets] of Object.entries(paths)) {
    if (!Array.isArray(rawTargets) || rawTargets.length === 0) continue;
    const star = pattern.indexOf('*');
    if (star === -1) {
      aliases.push({ wildcard: false, prefix: pattern, baseDir, rawTargets });
      continue;
    }
    aliases.push({ wildcard: true, prefix: pattern.slice(0, star), baseDir, rawTargets });
  }
  // Longest prefix first, so `@types/*` wins over a hypothetical `@*`.
  aliases.sort((left, right) => right.prefix.length - left.prefix.length);
  return aliases;
}

/** Every filesystem base a specifier could mean, in priority order. */
function aliasBases(specifier, aliases) {
  const bases = [];
  for (const alias of aliases) {
    if (alias.wildcard) {
      if (!specifier.startsWith(alias.prefix)) continue;
      const rest = specifier.slice(alias.prefix.length);
      // Substitute into the raw target before resolving: doing it after would
      // have to re-join a path whose trailing separator `path.resolve` ate.
      for (const target of alias.rawTargets) {
        bases.push(path.resolve(alias.baseDir, target.replace('*', rest)));
      }
      continue;
    }
    if (specifier !== alias.prefix) continue;
    for (const target of alias.rawTargets) bases.push(path.resolve(alias.baseDir, target));
  }
  return bases;
}

/** The extension/index probe TS runs against one candidate base path. */
function probeBase(base) {
  const candidates = [];

  // NodeNext writes `./x.js` and means `./x.ts`. Try the rewrite first so a
  // package that adopts it later does not silently start reading as UNRESOLVED.
  if (/\.m?js$/.test(base)) {
    candidates.push(base.replace(/\.mjs$/, '.mts'), base.replace(/\.js$/, '.ts'), base.replace(/\.js$/, '.tsx'));
  }
  if (/\.cjs$/.test(base)) candidates.push(base.replace(/\.cjs$/, '.cts'));
  if (SOURCE_EXTENSIONS.some((extension) => base.endsWith(extension))) candidates.push(base);
  for (const extension of SOURCE_EXTENSIONS) candidates.push(base + extension);
  for (const extension of SOURCE_EXTENSIONS) candidates.push(path.join(base, `index${extension}`));

  for (const candidate of candidates) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
  }
  return null;
}

/**
 * Relative- and alias-specifier resolution, TS-style. Bare specifiers that match
 * no configured alias are reported as external rather than resolved:
 * re-exporting a third-party symbol through the root barrel is legal, but it is
 * never a design-system family, so the caller must be able to tell the two
 * apart.
 *
 * A specifier that DOES match an alias but reaches no file is `unresolved`, not
 * `external` -- an alias pointing at nothing is a finding, not a third party.
 */
export function resolveModuleSpecifier(fromFile, specifier, aliases = []) {
  const bases = specifier.startsWith('.')
    ? [path.resolve(path.dirname(fromFile), specifier)]
    : aliasBases(specifier, aliases);

  if (bases.length === 0) return { external: true, specifier };

  for (const base of bases) {
    const found = probeBase(base);
    if (found) return { file: found };
  }
  return { unresolved: true, specifier, from: fromFile };
}

function declKindOf(ts, statement) {
  if (ts.isFunctionDeclaration(statement)) return 'function';
  if (ts.isClassDeclaration(statement)) return 'class';
  if (ts.isInterfaceDeclaration(statement)) return 'interface';
  if (ts.isTypeAliasDeclaration(statement)) return 'type';
  if (ts.isEnumDeclaration(statement)) return 'enum';
  if (ts.isModuleDeclaration(statement)) return 'namespace';
  return null;
}

function isTypeOnlyDecl(kind) {
  return kind === 'interface' || kind === 'type';
}

function variableDeclKind(ts, declaration) {
  const initializer = declaration.initializer;
  if (!initializer) return 'const';
  if (ts.isArrowFunction(initializer) || ts.isFunctionExpression(initializer)) return 'const-arrow';
  if (ts.isCallExpression(initializer)) {
    // `node.getText()` needs parent pointers, which this parser deliberately does
    // not build (setParentNodes: false). Read the callee off the AST instead.
    const target = initializer.expression;
    const name = ts.isIdentifier(target)
      ? target.text
      : ts.isPropertyAccessExpression(target) && ts.isIdentifier(target.name)
        ? `${ts.isIdentifier(target.expression) ? `${target.expression.text}.` : ''}${target.name.text}`
        : '';
    return `const-call:${name}`;
  }
  return 'const';
}

/**
 * For the compound-component idiom `const Button = Object.assign(ButtonComponent,
 * { Group, Icon })`, the component-ness lives in the first argument, not in the
 * call. Returns that argument's local name so the shape test can chase it.
 *
 * Without this, 36 `Object.assign` exports -- Button among them -- read as
 * non-components, which is the dangerous direction for a reverse projection:
 * a real public component that no row owns would have gone unreported.
 */
function variableDeclBase(ts, declaration) {
  const initializer = declaration.initializer;
  if (!initializer || !ts.isCallExpression(initializer)) return null;
  const target = initializer.expression;
  const isObjectAssign =
    ts.isPropertyAccessExpression(target) &&
    ts.isIdentifier(target.expression) &&
    target.expression.text === 'Object' &&
    ts.isIdentifier(target.name) &&
    target.name.text === 'assign';
  if (!isObjectAssign) return null;
  const first = initializer.arguments[0];
  return first && ts.isIdentifier(first) ? first.text : null;
}

/**
 * Parses one module into the four export mechanisms plus the local scope needed
 * to follow `export { X }` where `X` arrived by import.
 */
function parseModule(ts, file) {
  const text = fs.readFileSync(file, 'utf8');
  const source = ts.createSourceFile(
    file,
    text,
    ts.ScriptTarget.Latest,
    /* setParentNodes */ false,
    scriptKindFor(ts, file),
  );

  const module = {
    file,
    named: new Map(), // exportedName -> {from?, importedName?, localName?, typeOnly}
    stars: [], // {from, typeOnly}
    namespaces: new Map(), // exportedName -> {from, typeOnly}
    locals: new Map(), // localName -> {declKind}
    imports: new Map(), // localName -> {from, importedName|'default'|'*', typeOnly}
    defaultExport: null,
  };

  const hasExportModifier = (statement) =>
    statement.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword) ?? false;
  const hasDefaultModifier = (statement) =>
    statement.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.DefaultKeyword) ?? false;

  for (const statement of source.statements) {
    if (ts.isImportDeclaration(statement)) {
      const from = statement.moduleSpecifier.text;
      const clause = statement.importClause;
      if (!clause) continue;
      const typeOnly = Boolean(clause.isTypeOnly);
      if (clause.name) {
        module.imports.set(clause.name.text, { from, importedName: 'default', typeOnly });
      }
      const bindings = clause.namedBindings;
      if (bindings && ts.isNamespaceImport(bindings)) {
        module.imports.set(bindings.name.text, { from, importedName: '*', typeOnly });
      } else if (bindings && ts.isNamedImports(bindings)) {
        for (const element of bindings.elements) {
          module.imports.set(element.name.text, {
            from,
            importedName: (element.propertyName ?? element.name).text,
            typeOnly: typeOnly || Boolean(element.isTypeOnly),
          });
        }
      }
      continue;
    }

    if (ts.isExportDeclaration(statement)) {
      const typeOnly = Boolean(statement.isTypeOnly);
      const from = statement.moduleSpecifier?.text ?? null;
      const clause = statement.exportClause;

      if (!clause) {
        // `export * from './x'` -- the only form with no clause.
        if (from) module.stars.push({ from, typeOnly });
        continue;
      }
      if (ts.isNamespaceExport(clause)) {
        // `export * as NS from './x'`: NS is one binding. Its children are NOT
        // exports of this module -- see the resolver's namespace rule.
        if (from) module.namespaces.set(clause.name.text, { from, typeOnly });
        continue;
      }
      for (const element of clause.elements) {
        const exported = element.name.text;
        const imported = (element.propertyName ?? element.name).text;
        const elementTypeOnly = typeOnly || Boolean(element.isTypeOnly);
        module.named.set(
          exported,
          from
            ? { from, importedName: imported, typeOnly: elementTypeOnly }
            : { localName: imported, typeOnly: elementTypeOnly },
        );
      }
      continue;
    }

    if (ts.isExportAssignment(statement)) {
      module.defaultExport = { kind: statement.isExportEquals ? 'export=' : 'default' };
      continue;
    }

    if (ts.isVariableStatement(statement)) {
      const exported = hasExportModifier(statement);
      for (const declaration of statement.declarationList.declarations) {
        if (!ts.isIdentifier(declaration.name)) continue;
        const kind = variableDeclKind(ts, declaration);
        const declBase = variableDeclBase(ts, declaration);
        module.locals.set(declaration.name.text, declBase ? { declKind: kind, declBase } : { declKind: kind });
        if (exported) module.named.set(declaration.name.text, { localName: declaration.name.text, typeOnly: false });
      }
      continue;
    }

    const kind = declKindOf(ts, statement);
    if (!kind) continue;
    const name = statement.name?.text;
    if (name) module.locals.set(name, { declKind: kind });
    if (!hasExportModifier(statement)) continue;
    if (hasDefaultModifier(statement)) {
      module.defaultExport = { kind: 'default', localName: name ?? null, declKind: kind };
      continue;
    }
    if (name) module.named.set(name, { localName: name, typeOnly: isTypeOnlyDecl(kind) });
  }

  return module;
}

/**
 * Builds an on-demand resolver rooted at one entry file.
 *
 * `resolve(name)` walks only what that name needs. `enumerate()` walks the full
 * star closure, which the reverse projection requires.
 */
export function createRootPublicResolver({ entryFile, ts = loadTypeScript(), aliases }) {
  const modules = new Map();
  const memo = new Map();
  const pathAliases = aliases ?? loadPathAliases(ts, findTsconfig(path.dirname(entryFile)));

  function moduleFor(file) {
    let module = modules.get(file);
    if (!module) {
      module = parseModule(ts, file);
      modules.set(file, module);
    }
    return module;
  }

  function follow(fromFile, specifier) {
    const resolved = resolveModuleSpecifier(fromFile, specifier, pathAliases);
    if (resolved.file) return { file: resolved.file };
    if (resolved.external) return { external: resolved.specifier };
    return { unresolved: `${specifier} (from ${path.relative(process.cwd(), fromFile)})` };
  }

  function terminalId(resolution) {
    return resolution.terminal ? `${resolution.terminal.file}#${resolution.terminal.name}` : '';
  }

  function withTypeOnly(resolution, typeOnly) {
    if (!typeOnly || resolution.state !== 'VALUE') return resolution;
    return { ...resolution, state: 'TYPE_ONLY', typeOnly: true };
  }

  function resolveIn(file, name, stack) {
    const key = `${file}#${name}`;
    if (stack.has(key)) return { state: 'CYCLE_ONLY', reason: `cycle at ${key}` };
    const cached = memo.get(key);
    if (cached) return cached;

    stack.add(key);
    let result;
    try {
      result = resolveUncached(file, name, stack);
    } finally {
      stack.delete(key);
    }
    // Only stable answers are cached. A CYCLE_ONLY verdict depends on the stack
    // that produced it, so caching it would leak one path's shape onto another.
    if (result.state !== 'CYCLE_ONLY') memo.set(key, result);
    return result;
  }

  function resolveUncached(file, name, stack) {
    const module = moduleFor(file);

    const named = module.named.get(name);
    if (named) {
      if (named.from) {
        const step = follow(file, named.from);
        if (step.unresolved) return { state: 'UNRESOLVED', reason: `cannot resolve ${step.unresolved}` };
        if (step.external) {
          return withTypeOnly(
            { state: 'VALUE', terminal: { file: null, name: named.importedName, kind: 'external', module: step.external } },
            named.typeOnly,
          );
        }
        if (named.importedName === 'default') {
          const target = moduleFor(step.file);
          if (!target.defaultExport) {
            return { state: 'UNRESOLVED', reason: `${path.basename(step.file)} has no default export` };
          }
          return withTypeOnly(
            {
              state: 'VALUE',
              terminal: { file: step.file, name: 'default', kind: 'default', declKind: target.defaultExport.declKind ?? null },
            },
            named.typeOnly,
          );
        }
        return withTypeOnly(resolveIn(step.file, named.importedName, stack), named.typeOnly);
      }

      const local = module.locals.get(named.localName);
      if (local) {
        return withTypeOnly(
          {
            state: isTypeOnlyDecl(local.declKind) ? 'TYPE_ONLY' : 'VALUE',
            terminal: {
              file,
              name: named.localName,
              kind: 'declaration',
              declKind: local.declKind,
              declBase: local.declBase ?? null,
            },
          },
          named.typeOnly,
        );
      }
      // `export { X }` where X arrived by import -- the alias-through-import form.
      const imported = module.imports.get(named.localName);
      if (imported) {
        const step = follow(file, imported.from);
        if (step.unresolved) return { state: 'UNRESOLVED', reason: `cannot resolve ${step.unresolved}` };
        if (step.external) {
          return withTypeOnly(
            { state: 'VALUE', terminal: { file: null, name: imported.importedName, kind: 'external', module: step.external } },
            named.typeOnly || imported.typeOnly,
          );
        }
        if (imported.importedName === '*') {
          return withTypeOnly(
            { state: 'VALUE', terminal: { file: step.file, name: '*', kind: 'namespace' } },
            named.typeOnly || imported.typeOnly,
          );
        }
        if (imported.importedName === 'default') {
          const target = moduleFor(step.file);
          if (!target.defaultExport) {
            return { state: 'UNRESOLVED', reason: `${path.basename(step.file)} has no default export` };
          }
          return withTypeOnly(
            {
              state: 'VALUE',
              terminal: { file: step.file, name: 'default', kind: 'default', declKind: target.defaultExport.declKind ?? null },
            },
            named.typeOnly || imported.typeOnly,
          );
        }
        return withTypeOnly(
          resolveIn(step.file, imported.importedName, stack),
          named.typeOnly || imported.typeOnly,
        );
      }
      return { state: 'UNRESOLVED', reason: `${name} is exported but never declared or imported in ${path.basename(file)}` };
    }

    const namespaced = module.namespaces.get(name);
    if (namespaced) {
      const step = follow(file, namespaced.from);
      if (step.unresolved) return { state: 'UNRESOLVED', reason: `cannot resolve ${step.unresolved}` };
      return withTypeOnly(
        { state: 'VALUE', terminal: { file: step.file ?? null, name: '*', kind: 'namespace' } },
        namespaced.typeOnly,
      );
    }

    // Star re-exports. A namespace export is NOT searched here: `export * as NS`
    // publishes one binding called NS, and NS's children are not exports of this
    // module. Treating them as exports is the single most common way an audit
    // convinces itself a symbol is public when no consumer can import it.
    const found = [];
    let sawUnresolved = null;
    let sawCycle = false;
    for (const star of module.stars) {
      const step = follow(file, star.from);
      if (step.unresolved) {
        sawUnresolved = step.unresolved;
        continue;
      }
      if (step.external) continue;
      const result = withTypeOnly(resolveIn(step.file, name, stack), star.typeOnly);
      if (result.state === 'VALUE' || result.state === 'TYPE_ONLY') found.push(result);
      else if (result.state === 'CYCLE_ONLY') sawCycle = true;
      else if (result.state === 'UNRESOLVED') sawUnresolved = result.reason;
    }

    if (found.length === 0) {
      if (sawUnresolved) return { state: 'UNRESOLVED', reason: `cannot resolve ${sawUnresolved}` };
      if (sawCycle) return { state: 'CYCLE_ONLY', reason: `${name} is reachable only through a re-export cycle` };
      return { state: 'MISSING' };
    }

    const distinct = new Map();
    for (const result of found) distinct.set(terminalId(result), result);
    if (distinct.size > 1) {
      return {
        state: 'AMBIGUOUS',
        reason: `${name} arrives from ${distinct.size} different declarations via \`export *\``,
        terminals: [...distinct.values()].map((result) => result.terminal),
      };
    }
    // A single terminal reached twice is legal; prefer the VALUE reading, since
    // `export type` on one path does not un-export the value on another.
    const value = found.find((result) => result.state === 'VALUE');
    return value ?? found[0];
  }

  /** Every name the entry publishes, with the same fail-closed states. */
  function enumerate() {
    const names = new Set();
    const seen = new Set();
    const walk = (file) => {
      if (seen.has(file)) return;
      seen.add(file);
      const module = moduleFor(file);
      for (const name of module.named.keys()) names.add(name);
      for (const name of module.namespaces.keys()) names.add(name);
      for (const star of module.stars) {
        const step = follow(file, star.from);
        if (step.file) walk(step.file);
      }
    };
    walk(entryFile);

    const out = new Map();
    for (const name of names) out.set(name, resolve(name));
    return out;
  }

  function resolve(name) {
    return resolveIn(entryFile, name, new Set());
  }

  /**
   * Component-ness of one terminal, chasing `Object.assign` through its first
   * argument. `seen` guards `const A = Object.assign(A, ...)`, which is not
   * valid but must not hang the resolver.
   */
  function shapeOf(terminal, seen) {
    const declKind = terminal.declKind ?? '';
    if (COMPONENT_DECL_KINDS.has(declKind)) return true;
    if (!declKind.startsWith('const-call:')) return false;

    const callee = declKind.slice('const-call:'.length);
    if (COMPONENT_FACTORY_CALLEES.test(callee)) return true;
    if (callee !== 'Object.assign' || !terminal.declBase || !terminal.file) return false;

    const key = `${terminal.file}#${terminal.declBase}`;
    if (seen.has(key)) return false;
    seen.add(key);

    const local = moduleFor(terminal.file).locals.get(terminal.declBase);
    if (local) {
      return shapeOf({ file: terminal.file, declKind: local.declKind, declBase: local.declBase ?? null }, seen);
    }
    // The base arrived by import -- follow it to the module that declares it.
    const imported = moduleFor(terminal.file).imports.get(terminal.declBase);
    if (!imported || imported.importedName === '*') return false;
    const step = follow(terminal.file, imported.from);
    if (!step.file) return false;
    const target = resolveIn(step.file, imported.importedName, new Set());
    if (target.state !== 'VALUE' || !target.terminal) return false;
    return shapeOf(target.terminal, seen);
  }

  return {
    resolve,
    enumerate,
    isComponentShaped(resolution) {
      const terminal = resolution?.terminal;
      if (!terminal || resolution.state !== 'VALUE') return false;
      return shapeOf(terminal, new Set());
    },
    stats() {
      return { filesParsed: modules.size };
    },
  };
}
