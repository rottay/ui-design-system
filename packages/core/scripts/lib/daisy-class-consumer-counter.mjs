import { readFileSync, statSync } from 'node:fs';
import { dirname, extname, isAbsolute, join, resolve, sep } from 'node:path';
import ts from 'typescript';

import { paintedClassNames, readManifest } from '../daisy-painted-classes.mjs';

/**
 * `daisy.classConsumers` -- count the modern-engine files that actually RENDER a
 * DaisyUI class.
 *
 * WHY A TYPESCRIPT AST AND NOT A REGEX
 * ------------------------------------
 * The predecessor was two regex passes over raw file text and it did not strip
 * `//` or block comments, so its `'([^']*)'` alternation was apostrophe-parity
 * fragile: a comment reading "usePresence's" opened a phantom string that ran to
 * the next apostrophe, and whatever it swallowed was tokenized as class names.
 * Editing PROSE moved the counter. The ratchet was measuring English.
 *
 * A lexer (`ts.createScanner`) would fix that half -- comments, strings and
 * templates are the tokenizer's job and TypeScript's own tokenizer is correct by
 * construction. But it cannot fix the other half, which is the larger one. Every
 * false positive below is LEXICALLY IDENTICAL to a real class string and is only
 * distinguishable by its syntactic position:
 *
 *     kind: 'modal'                       union member (OverlayLayerKind)
 *     data-part="skeleton"                attribute value, never a class
 *     role="alert"                        ARIA role
 *     aria-current={... ? 'step' : ...}   ARIA value
 *     type="range"                        input type
 *     part: 'skeleton-action' | ...       a TYPE literal
 *     field.type === 'rating'             a comparison operand
 *
 * `DAISY_PAINTED_CLASSES` collides head-on with ordinary English and with this
 * codebase's own `data-part` vocabulary (`modal`, `step`, `link`, `progress`,
 * `range`, `alert`, `skeleton`, `timeline`, `toast`, `carousel`, `rating`), so
 * position is the ONLY sound discriminator. That is a parse-tree question, so
 * this counter parses. `ts.createSourceFile` attaches comments as trivia rather
 * than as nodes, which means a comment is not merely stripped here -- it is
 * structurally unreachable, and no future edit to comment prose can reach the
 * counter at all.
 *
 * WHAT COUNTS
 * -----------
 * A string counts only if it flows into a CLASS POSITION:
 *   - a JSX `className=` / `class=` attribute (literal, template, ternary,
 *     `&&`/`||`/`??`, concatenation, array + `.join()`, or a call);
 *   - an object property literally named `className`/`class`;
 *   - a destructuring default (`{ className = '...' }`);
 *   - `el.classList.add/toggle(...)` and `el.setAttribute('class', ...)`, the
 *     only imperative escape hatches (the audited tree contains zero of these
 *     today; they are modelled so the hatch cannot be opened silently later).
 *
 * From a class position the walk follows the value: file-local `const`s,
 * property/element access into a map (`PLACEMENT[side]`), object literal values,
 * and -- since the cross-module resolver below -- the same shapes reached
 * through an `import`. That preserves the Codex K2/K3 catch -- Message emitted
 * `.toast` through a placement map while the counter read 0 -- without the
 * predecessor's free-floating string pass, which had to guess from the string
 * alone and therefore counted `data-part` values and type literals. That pass is
 * deleted, not narrowed: it was unsound by construction, and it is not coming
 * back in any form. The replacement for it is REACHABILITY, not pattern
 * matching: a token counts only when there is a path of resolvable declarations
 * from a real class position to the literal.
 *
 * Matching is EXACT against `DAISY_PAINTED_CLASSES`. The predecessor also
 * accepted any `<daisyClass>-<suffix>` token, which is what turned the DS's own
 * `skeleton-action`, `skeleton-row`, `range-separator` and `link-wrapper` into
 * Daisy sightings. Prefix matching cannot tell a Daisy class from a DS class
 * that merely starts with an English word, so the curated verified list is the
 * whole rule.
 *
 * No class-composition helper exists to special-case: `packages/core/src`
 * exports no `cx`/`clsx`/`classNames`/`cn`, has zero call sites for any of them,
 * and neither `clsx` nor `classnames` nor `tailwind-merge` is a dependency
 * (className composition is inline template literals and ternaries). Calls in a
 * class position are therefore handled GENERICALLY -- every argument is followed
 * -- so introducing such a helper, in this package or imported from another,
 * needs no change here.
 *
 * The unit is FILES, matching the counter's name and its decrease-only baseline.
 */

/**
 * Class names DaisyUI actually paints, DERIVED from the pinned package by
 * `../daisy-painted-classes.mjs` and stored in `daisy-painted-classes.json`.
 *
 * This used to be a hand-written array of 25 names annotated "verified against
 * the `daisyui@5.5.19` package source". It was not verified, and could not be:
 * a hand-list is checked by reading it, and reading it is exactly what missed
 * `timeline-box`, `timeline-end`, `timeline-vertical`, `link-hover` and
 * `loading-spinner` -- all painted by the pinned version, all rendered by files
 * this ratchet was scoring clean. The vocabulary is now generated, version
 * pinned, and verified by `daisy-painted-classes.test.mjs`; see that generator
 * for what "painted" means and why `disabled` is deliberately absent.
 *
 * DaisyUI is TENANTED -- a bare `.alert` computes each tenant's own
 * `--color-base-200`, which every artifact declares unlayered -- so a class here
 * is not a white-label defect. It is residue: `modern` is documented as the
 * Rottay-native premium skin, and every one of these files makes that sentence
 * less true. Decrease-only, so the residue can only shrink.
 */
const MANIFEST = readManifest();

export const DAISY_PAINTED_CLASSES = Object.keys(MANIFEST.classes);

const PAINTED = paintedClassNames(MANIFEST);

/**
 * `class -> the base class it modifies`, e.g. `loading-spinner -> loading`.
 *
 * A modifier rendered WITHOUT its base is the shape of every `loading-spinner`
 * consumer in this tree: three files ask DaisyUI for a spinner mask and never
 * add `loading`, so the mask lands on an element with no size and no colour and
 * paints nothing visible. It still counts -- `.loading-spinner` is a standalone
 * rule that really does apply `mask-image`, the base can be supplied by a
 * parent or a consuming app, and the ratchet measures COUPLING to DaisyUI's
 * class contract rather than pixels. What it must never be is invisible, so the
 * inventory marks it and `DEBUG_DAISY_CONSUMERS` prints it.
 */
const CLASS_BASES = new Map(
  Object.entries(MANIFEST.classes)
    .filter(([, entry]) => entry.base)
    .map(([name, entry]) => [name, entry.base]),
);

/** Attribute / property names whose value the browser parses as a class list. */
const CLASS_NAMES = new Set(['className', 'class']);

/** `&&`/`||`/`??` guard a class; `+` concatenates one. Nothing else does. */
const CLASS_BINARY_OPERATORS = new Set([
  ts.SyntaxKind.AmpersandAmpersandToken,
  ts.SyntaxKind.BarBarToken,
  ts.SyntaxKind.QuestionQuestionToken,
  ts.SyntaxKind.PlusToken,
]);

/** Array methods that pass their receiver's strings through to the result. */
const PASSTHROUGH_METHODS = new Set(['join', 'filter', 'concat', 'map', 'flat', 'trim']);

/** DOM methods that write a class onto an element. */
const CLASS_LIST_METHODS = new Set(['add', 'toggle']);

/**
 * The three resolution budgets, and the ONE rule that governs all of them:
 * exhausting a budget FAILS THE AUDIT. It does not quietly return "not a
 * consumer".
 *
 * These bounds used to be described as fail-closed. They were the opposite. A
 * genuine Daisy consumer sitting one resolution past a limit was silently not
 * counted and the ratchet stayed green -- an under-count is not a safe
 * direction for a decrease-only gate, it is the direction that hides work. The
 * previous `MAX_DEPTH = 8` was doing exactly this in the live tree: the deepest
 * legitimate class-position walk under `src/ui` is 23 expression hops, so every
 * walk past eight was being truncated mid-flight with no signal at all. That is
 * the same class of defect as the predecessor counter that measured comment
 * prose: the number looked fine and meant nothing.
 *
 * A budget now exists only to terminate a hostile or pathological shape, and it
 * announces itself when it does. Termination of LEGITIMATE recursion is not a
 * budget's job and never shares its code path -- see `harvest`, where a closed
 * cycle returns normally off a path set before any budget is consulted.
 *
 * Every value is chosen against a measurement of this tree, with the headroom
 * written down so a future reader can tell a bound from a guess:
 *
 *   maxDepth       23 observed  ->  64  (2.7x)   expression hops inside one module
 *   maxModuleHops   1 observed  ->  48  (48x)    module boundaries crossed
 *   maxModules      2 observed  -> 5000 (2500x)  modules parsed per run
 *
 * `maxDepth` is reset at every module boundary: a chain's length in module A
 * says nothing about how far module B still has to resolve, and charging one
 * budget for both would make the counter depend on where a shared constant
 * happens to live. `maxModuleHops` clears a four-deep barrel chain many times
 * over. `maxModules` is a backstop against a pathological `export *` fan-out;
 * resolution is lazy, so only modules actually named by an import in a class
 * position are ever read.
 */
export const RESOLVER_LIMITS = {
  maxDepth: 64,
  maxModuleHops: 48,
  maxModules: 5000,
};

const MAX_DEPTH = RESOLVER_LIMITS.maxDepth;
const MAX_MODULE_HOPS = RESOLVER_LIMITS.maxModuleHops;
const MAX_MODULES = RESOLVER_LIMITS.maxModules;

/**
 * Thrown when a resolution budget is exhausted. Carries everything needed to
 * act on it without re-running the walk: which limit, the file and symbol the
 * walk was resolving, and the full provenance chain it had already crossed.
 *
 * It is deliberately NOT catchable-and-ignorable anywhere in this module. It
 * propagates through `scanDaisyClassSites` to the audit, which fails.
 */
export class DaisyResolverBudgetError extends Error {
  constructor({ limit, value, file, symbol, chain }) {
    const provenance = chain?.length
      ? chain.map((frame) => `${frame.file}#${frame.symbol}`).join('\n            -> ')
      : '(none -- the walk had not left the consuming file)';
    super(
      `daisy.classConsumers: resolver budget exhausted -- ${limit}=${value}\n` +
        `  file:       ${file}\n` +
        `  symbol:     ${symbol}\n` +
        `  provenance: ${provenance}\n` +
        '  A budget is a backstop against a pathological module shape, not a place to stop\n' +
        '  counting. Either this chain is real -- in which case raise RESOLVER_LIMITS and\n' +
        '  record the new measurement -- or it is a cycle the path set failed to close, which\n' +
        '  is a bug in this counter. Never lower the ratchet to make this go away.',
    );
    this.name = 'DaisyResolverBudgetError';
    this.limit = limit;
    this.value = value;
    this.file = file;
    this.symbol = symbol;
    this.chain = chain ?? [];
  }
}

/** Raise the budget error from a walk position. */
function budgetExhausted(limit, value, scope, symbol) {
  throw new DaisyResolverBudgetError({
    limit,
    value,
    file: scope?.mod?.fileName ?? '(unknown)',
    symbol: symbol ?? scope?.pick ?? '(unknown)',
    chain: scope?.trail ?? [],
  });
}

/**
 * Extensions a module specifier may resolve to, in TypeScript's own preference
 * order, so a tree holding both `x.ts` and `x.tsx` resolves the way the compiler
 * resolves it. `.d.ts` is absent on purpose: a declaration file has no
 * initializers, so it can only ever contribute a non-count.
 */
const SOURCE_EXTENSIONS = ['.ts', '.tsx', '.mts', '.cts', '.js', '.jsx', '.mjs', '.cjs'];

/**
 * TypeScript's ESM idiom writes `./x.js` and means `./x.ts`. Try the source
 * extension first so a `.js`-suffixed specifier is not silently unresolvable.
 */
const JS_TO_TS_EXTENSIONS = new Map([
  ['.js', ['.ts', '.tsx']],
  ['.jsx', ['.tsx']],
  ['.mjs', ['.mts']],
  ['.cjs', ['.cts']],
]);

function isClassName(name) {
  if (!name) return false;
  if (ts.isIdentifier(name) || ts.isStringLiteralLike(name)) return CLASS_NAMES.has(name.text);
  return false;
}

/* -------------------------------------------------------------------------- */
/* Module graph: the cross-file half                                          */
/* -------------------------------------------------------------------------- */

/**
 * The shared state behind cross-module resolution: parsed modules, resolved
 * specifiers, `tsconfig` path mappings and stat results, all keyed by absolute
 * path.
 *
 * One graph is built per counter run and reused across every audited file, so
 * the corpus parses each shared module once no matter how many consumers reach
 * it. It is deliberately NOT process-global: a stale cache would make the gate
 * report yesterday's tree, and a gate that can be wrong about the present is
 * worse than a slower one.
 */
export function createModuleGraph() {
  return {
    modules: new Map(),
    specifiers: new Map(),
    pathMappings: new Map(),
    stats: new Map(),
    parsed: 0,
    // The walk position resolution is currently being performed for. Module
    // loading sits three calls below the walk and has no scope of its own, and
    // a budget error with no file or provenance is not actionable. The walk is
    // synchronous and single-threaded, so one live frame is exact.
    frame: null,
  };
}

function isFile(graph, path) {
  const cached = graph.stats.get(path);
  if (cached !== undefined) return cached;
  let result = false;
  try {
    result = statSync(path).isFile();
  } catch {
    result = false;
  }
  graph.stats.set(path, result);
  return result;
}

/**
 * Every on-disk file a specifier could mean, in resolution order: the TS source
 * behind a `.js` specifier, the literal path, `<path><ext>`, then
 * `<path>/index<ext>`.
 */
function* fileCandidates(base) {
  const extension = extname(base);
  const rewrites = JS_TO_TS_EXTENSIONS.get(extension);
  if (rewrites) {
    const stem = base.slice(0, -extension.length);
    for (const rewrite of rewrites) yield stem + rewrite;
  }
  if (SOURCE_EXTENSIONS.includes(extension)) yield base;
  for (const candidate of SOURCE_EXTENSIONS) yield base + candidate;
  for (const candidate of SOURCE_EXTENSIONS) yield join(base, `index${candidate}`);
}

/**
 * Read `compilerOptions.paths` out of the nearest `tsconfig.json`, following a
 * relative `extends` chain when the leaf declares none.
 *
 * `ts.readConfigFile` is the parser TypeScript itself uses, so comments and
 * trailing commas in the config cannot desynchronize this from the compiler.
 * Aliases are not optional decoration here: of the 470 import specifiers in the
 * audited modern-engine files, 159 are `@/...`, and a resolver blind to them
 * would be blind to a third of the tree's own imports.
 */
function readPathMappings(graph, configPath, depth) {
  if (depth > 5) return null;
  let config;
  try {
    ({ config } = ts.readConfigFile(configPath, (file) => {
      try {
        return readFileSync(file, 'utf8');
      } catch {
        return undefined;
      }
    }));
  } catch {
    return null;
  }
  if (!config) return null;
  const options = config.compilerOptions ?? {};
  if (options.paths && typeof options.paths === 'object') {
    return {
      base: resolve(dirname(configPath), options.baseUrl ?? '.'),
      // Longest literal prefix first, which is how TypeScript picks between
      // overlapping patterns (`@/x/*` must beat `@/*`).
      patterns: Object.entries(options.paths)
        .filter(([, targets]) => Array.isArray(targets))
        .sort((a, b) => b[0].indexOf('*') - a[0].indexOf('*')),
    };
  }
  if (typeof config.extends === 'string' && config.extends.startsWith('.')) {
    const parent = resolve(dirname(configPath), config.extends);
    for (const candidate of [parent, `${parent}.json`, join(parent, 'tsconfig.json')]) {
      if (isFile(graph, candidate)) return readPathMappings(graph, candidate, depth + 1);
    }
  }
  return null;
}

/** The path mappings governing `fromFile`, memoized per directory. */
function pathMappingsFor(graph, fromFile) {
  const chain = [];
  let dir = dirname(fromFile);
  for (;;) {
    if (graph.pathMappings.has(dir)) {
      const mappings = graph.pathMappings.get(dir);
      for (const seen of chain) graph.pathMappings.set(seen, mappings);
      return mappings;
    }
    chain.push(dir);
    const configPath = join(dir, 'tsconfig.json');
    if (isFile(graph, configPath)) {
      const mappings = readPathMappings(graph, configPath, 0);
      for (const seen of chain) graph.pathMappings.set(seen, mappings);
      return mappings;
    }
    const parent = dirname(dir);
    if (parent === dir) {
      for (const seen of chain) graph.pathMappings.set(seen, null);
      return null;
    }
    dir = parent;
  }
}

/** Absolute path bases a non-relative specifier maps to through `paths`. */
function aliasBases(graph, fromFile, specifier) {
  const mappings = pathMappingsFor(graph, fromFile);
  if (!mappings) return [];
  const out = [];
  for (const [pattern, targets] of mappings.patterns) {
    const star = pattern.indexOf('*');
    if (star < 0) {
      if (pattern === specifier) for (const target of targets) out.push(resolve(mappings.base, target));
      continue;
    }
    const prefix = pattern.slice(0, star);
    const suffix = pattern.slice(star + 1);
    if (!specifier.startsWith(prefix) || !specifier.endsWith(suffix)) continue;
    if (specifier.length < prefix.length + suffix.length) continue;
    const captured = specifier.slice(prefix.length, specifier.length - suffix.length);
    for (const target of targets) {
      out.push(resolve(mappings.base, target.replace('*', captured)));
    }
    if (out.length) return out;
  }
  return out;
}

/**
 * The file a module specifier names, or `null` when it cannot be proven.
 *
 * Three things are deliberately unresolvable, and each one is a NON-COUNT
 * rather than a guess:
 *   - bare package specifiers (`react`, `antd`), which live in `node_modules`
 *     and cannot hold this package's classes;
 *   - this package's own name (`@rottay/design-system`, 33 imports among the
 *     audited files). Its `exports` map points at `dist/`, a BUILD ARTIFACT. A
 *     source gate that reads `dist` reports whatever was last built, so the
 *     self-reference stays closed on purpose. Every one of those 33 imports is
 *     a component or hook today, never a class constant;
 *   - a file whose own path is not absolute, which is how a fixture scanned as
 *     `'fixture.tsx'` is kept from resolving `./placement` against the process
 *     working directory.
 */
function resolveSpecifier(graph, fromFile, specifier) {
  if (!specifier || !isAbsolute(fromFile)) return null;
  const key = `${fromFile} ${specifier}`;
  if (graph.specifiers.has(key)) return graph.specifiers.get(key);

  let bases;
  if (specifier.startsWith('.')) bases = [resolve(dirname(fromFile), specifier)];
  else if (isAbsolute(specifier)) bases = [specifier];
  else bases = aliasBases(graph, fromFile, specifier);

  let found = null;
  search: for (const base of bases) {
    for (const candidate of fileCandidates(base)) {
      if (candidate.includes(`${sep}node_modules${sep}`)) continue;
      if (isFile(graph, candidate)) {
        found = candidate;
        break search;
      }
    }
  }
  graph.specifiers.set(key, found);
  return found;
}

/**
 * Index one module: its local value bindings, the names it declares (which
 * SHADOW an import of the same name), its imports and its exports.
 *
 * All initializers for a name are kept, not just the first: shadowed
 * declarations are indistinguishable without a type checker, and over-following
 * them can only ever ADD a class to a file that is already in a class position.
 * For a decrease-only ratchet, over-approximating here is the safe direction.
 */
function indexModule(mod) {
  const { sourceFile } = mod;

  const addBinding = (name, node) => {
    const existing = mod.bindings.get(name);
    if (existing) existing.push(node);
    else mod.bindings.set(name, [node]);
  };
  const addCallable = (name, node) => {
    const existing = mod.callables.get(name);
    if (existing) existing.push(node);
    else mod.callables.set(name, [node]);
  };

  (function index(node) {
    if (ts.isVariableDeclaration(node)) {
      if (ts.isIdentifier(node.name)) {
        mod.declared.add(node.name.text);
        if (node.initializer) addBinding(node.name.text, node.initializer);
      }
    } else if (ts.isBindingElement(node) || ts.isParameter(node)) {
      // A destructured field or a parameter is a real binding this counter
      // cannot follow. Recording the NAME is what stops it from being confused
      // with an import of the same name three scopes up.
      if (ts.isIdentifier(node.name)) mod.declared.add(node.name.text);
    } else if (ts.isFunctionDeclaration(node) || ts.isClassDeclaration(node)) {
      if (node.name) {
        mod.declared.add(node.name.text);
        addCallable(node.name.text, node);
      }
    } else if (ts.isEnumDeclaration(node)) {
      mod.declared.add(node.name.text);
      addCallable(node.name.text, node);
    }
    ts.forEachChild(node, index);
  })(sourceFile);

  for (const statement of sourceFile.statements) {
    indexImport(mod, statement);
    indexExport(mod, statement);
  }
}

function indexImport(mod, statement) {
  if (!ts.isImportDeclaration(statement)) return;
  if (!ts.isStringLiteral(statement.moduleSpecifier)) return;
  const clause = statement.importClause;
  // `import './side-effect'` binds nothing; `import type { X }` binds a TYPE,
  // and a type has no runtime value that could ever reach a className.
  if (!clause || clause.isTypeOnly) return;
  const specifier = statement.moduleSpecifier.text;
  if (clause.name) mod.imports.set(clause.name.text, { kind: 'default', specifier });
  const bindings = clause.namedBindings;
  if (!bindings) return;
  if (ts.isNamespaceImport(bindings)) {
    mod.imports.set(bindings.name.text, { kind: 'namespace', specifier });
    return;
  }
  for (const element of bindings.elements) {
    if (element.isTypeOnly) continue;
    mod.imports.set(element.name.text, {
      kind: 'named',
      specifier,
      importedName: (element.propertyName ?? element.name).text,
    });
  }
}

function hasModifier(node, kind) {
  return Boolean(node.modifiers?.some((modifier) => modifier.kind === kind));
}

function indexExport(mod, statement) {
  const exported = hasModifier(statement, ts.SyntaxKind.ExportKeyword);
  const isDefault = hasModifier(statement, ts.SyntaxKind.DefaultKeyword);

  if (ts.isVariableStatement(statement) && exported) {
    for (const declaration of statement.declarationList.declarations) {
      // `export const { a } = ...` is a destructuring export: unresolvable
      // without a checker, so it stays a non-count.
      if (ts.isIdentifier(declaration.name) && declaration.initializer) {
        mod.exports.set(declaration.name.text, { kind: 'binding', node: declaration.initializer });
      }
    }
    return;
  }
  if (
    (ts.isFunctionDeclaration(statement) ||
      ts.isClassDeclaration(statement) ||
      ts.isEnumDeclaration(statement)) &&
    exported
  ) {
    if (isDefault) mod.exports.set('default', { kind: 'binding', node: statement });
    else if (statement.name) mod.exports.set(statement.name.text, { kind: 'binding', node: statement });
    return;
  }
  if (ts.isExportAssignment(statement)) {
    // `export default <expr>`. `export = x` (isExportEquals) is CommonJS and has
    // no ESM import shape this walk can arrive through.
    if (!statement.isExportEquals) mod.exports.set('default', { kind: 'binding', node: statement.expression });
    return;
  }
  if (!ts.isExportDeclaration(statement)) return;
  if (statement.isTypeOnly) return;
  const specifier =
    statement.moduleSpecifier && ts.isStringLiteral(statement.moduleSpecifier)
      ? statement.moduleSpecifier.text
      : null;
  if (!statement.exportClause) {
    if (specifier) mod.starExports.push(specifier);
    return;
  }
  if (ts.isNamespaceExport(statement.exportClause)) {
    if (specifier)
      mod.exports.set(statement.exportClause.name.text, { kind: 'namespaceFrom', specifier });
    return;
  }
  for (const element of statement.exportClause.elements) {
    if (element.isTypeOnly) continue;
    const local = (element.propertyName ?? element.name).text;
    mod.exports.set(
      element.name.text,
      specifier ? { kind: 'from', specifier, importedName: local } : { kind: 'alias', local },
    );
  }
}

/** Parse one source text into an indexed module. */
function createModule(fileName, text) {
  const jsx = fileName.endsWith('.tsx') || fileName.endsWith('.jsx');
  const sourceFile = ts.createSourceFile(
    fileName,
    text,
    ts.ScriptTarget.Latest,
    false,
    jsx ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  const mod = {
    fileName,
    sourceFile,
    bindings: new Map(),
    declared: new Set(),
    callables: new Map(),
    imports: new Map(),
    exports: new Map(),
    starExports: [],
  };
  indexModule(mod);
  return mod;
}

/** Load and index a module from disk, once per graph. */
function loadModule(graph, filePath) {
  if (!filePath) return null;
  if (graph.modules.has(filePath)) return graph.modules.get(filePath);
  if (graph.parsed >= MAX_MODULES) {
    throw new DaisyResolverBudgetError({
      limit: 'maxModules',
      value: MAX_MODULES,
      file: filePath,
      symbol: graph.frame?.symbol ?? '(module load)',
      chain: graph.frame?.chain ?? [],
    });
  }
  let text;
  try {
    text = readFileSync(filePath, 'utf8');
  } catch {
    graph.modules.set(filePath, null);
    return null;
  }
  graph.parsed += 1;
  const mod = createModule(filePath, text);
  graph.modules.set(filePath, mod);
  return mod;
}

/** The module a specifier names, loaded and indexed. */
function importedModule(graph, mod, specifier) {
  return loadModule(graph, resolveSpecifier(graph, mod.fileName, specifier));
}

/**
 * Every declaration an EXPORTED name resolves to, following aliases, re-exports
 * and `export *` across module boundaries.
 *
 * `visited` is keyed by `<file>#<name>`, so a barrel cycle (`a` re-exports from
 * `b`, `b` re-exports from `a`) revisits nothing and the walk terminates on the
 * second arrival. A name with no export entry falls through to the star
 * re-exports in source order and takes the first module that has it, which is
 * what the module system itself does.
 *
 * `path` accumulates one `{ file, symbol }` frame per module entered, INCLUDING
 * the one being resolved now. It is the provenance the debug inventory prints:
 * a barrel three modules deep is otherwise indistinguishable from a direct
 * import, and the drain would be sent to the wrong file.
 */
function resolveExport(graph, mod, name, visited, path) {
  const key = `${mod.fileName}#${name}`;
  if (visited.has(key)) return [];
  visited.add(key);

  const entry = mod.exports.get(name);
  if (entry) {
    if (entry.kind === 'binding') return [{ mod, node: entry.node, symbol: name, path }];
    if (entry.kind === 'alias') return resolveLocal(graph, mod, entry.local, visited, path);
    if (entry.kind === 'from') {
      const target = importedModule(graph, mod, entry.specifier);
      return target
        ? resolveExport(graph, target, entry.importedName, visited, [
            ...path,
            { file: target.fileName, symbol: entry.importedName },
          ])
        : [];
    }
    if (entry.kind === 'namespaceFrom') {
      const target = importedModule(graph, mod, entry.specifier);
      return target ? [{ mod: target, namespace: true, symbol: name, path }] : [];
    }
  }
  for (const specifier of mod.starExports) {
    const target = importedModule(graph, mod, specifier);
    if (!target) continue;
    const hit = resolveExport(graph, target, name, visited, [
      ...path,
      { file: target.fileName, symbol: name },
    ]);
    if (hit.length) return hit;
  }
  return [];
}

/** Every declaration a name resolves to inside `mod`, imports included. */
function resolveLocal(graph, mod, name, visited, path = []) {
  const initializers = mod.bindings.get(name);
  if (initializers?.length) return initializers.map((node) => ({ mod, node, symbol: name, path }));
  const callables = mod.callables.get(name);
  if (callables?.length) return callables.map((node) => ({ mod, node, symbol: name, path }));
  const imported = mod.imports.get(name);
  if (!imported) return [];
  const target = importedModule(graph, mod, imported.specifier);
  if (!target) return [];
  if (imported.kind === 'namespace')
    return [{ mod: target, namespace: true, symbol: name, path: [] }];
  const exportName = imported.kind === 'default' ? 'default' : imported.importedName;
  return resolveExport(graph, target, exportName, visited ?? new Set(), [
    ...path,
    { file: target.fileName, symbol: exportName },
  ]);
}

/**
 * Every declaration an identifier IN A CLASS POSITION resolves to.
 *
 * A local binding wins outright and an import is not consulted, because the
 * local is what the class position actually reads. A name that is declared
 * locally by something this walk cannot follow -- a parameter, a destructured
 * field, a `let` assigned later -- BLOCKS import resolution instead of falling
 * through to it. `function Row({ link })` shadowing an imported `link` is the
 * shape that would otherwise let an unrelated module's constant be attributed
 * to this file, and a wrong attribution in a gate is worse than a miss.
 */
function resolveIdentifier(graph, mod, name) {
  const followable = mod.bindings.has(name) || mod.callables.has(name);
  if (!followable && mod.declared.has(name)) return [];
  return resolveLocal(graph, mod, name, new Set());
}

/* -------------------------------------------------------------------------- */
/* The walk                                                                    */
/* -------------------------------------------------------------------------- */

/** The static property name of `X.k` / `X['k']`, or `null` when it is dynamic. */
function staticKey(node) {
  if (ts.isPropertyAccessExpression(node)) {
    return ts.isIdentifier(node.name) ? node.name.text : null;
  }
  const argument = node.argumentExpression;
  if (!argument) return null;
  if (ts.isStringLiteralLike(argument)) return argument.text;
  if (ts.isNumericLiteral(argument)) return argument.text;
  return null;
}

/** A derived walk position: one expression hop deeper in the same module. */
function deeper(scope, pick = null) {
  return { mod: scope.mod, depth: scope.depth + 1, hops: scope.hops, trail: scope.trail, pick };
}

/**
 * A derived walk position on the far side of a resolution.
 *
 * Crossing into another module resets the expression budget and spends a module
 * hop; staying inside the current one just goes deeper. The trail records the
 * declaration that was entered, which is what `DEBUG_DAISY_CONSUMERS` prints as
 * the provenance chain -- the reason a token in some other file is attributed to
 * this consumer.
 */
function entered(scope, target) {
  if (target.mod === scope.mod) return deeper(scope);
  const crossed = target.path?.length ? target.path : [{ file: target.mod.fileName, symbol: target.symbol }];
  return {
    mod: target.mod,
    depth: 0,
    // Charged per module actually entered, so a barrel chain spends what it
    // costs and the hop bound stays a bound on modules, not on resolutions.
    hops: scope.hops + crossed.length,
    trail: [...scope.trail, ...crossed],
    pick: null,
  };
}

/**
 * Follow a resolved declaration, unless doing so would exceed the module-hop
 * bound. A namespace object is not a class and is never harvested as one; it is
 * only useful as the receiver of `NS.CONST`, which `harvest` handles directly.
 */
function follow(targets, ctx, scope, pick = null) {
  for (const target of targets) {
    if (target.namespace) continue;
    if (target.mod !== scope.mod && scope.hops >= MAX_MODULE_HOPS) {
      budgetExhausted('maxModuleHops', MAX_MODULE_HOPS, scope, target.symbol);
    }
    const next = entered(scope, target);
    harvest(target.node, ctx, pick ? { ...next, pick } : next);
  }
}

/**
 * Has this node already been harvested at least as favourably as now?
 *
 * A second arrival is normally a no-op because the first already harvested the
 * subtree -- but only if the first had at least as much budget and asked the
 * same question. `MAP.a` and `MAP.b` arrive at the SAME object literal with
 * different `pick`s, and treating the second as a repeat would silently drop
 * `MAP.b`'s class. The visit key is therefore (node, pick), and a shallower
 * arrival re-walks because the earlier one may have been truncated.
 */
function shouldVisit(ctx, node, scope) {
  let byPick = ctx.seen.get(node);
  if (!byPick) {
    byPick = new Map();
    ctx.seen.set(node, byPick);
  }
  const key = scope.pick ?? '';
  const previous = byPick.get(key);
  if (previous && previous.depth <= scope.depth && previous.hops <= scope.hops) return false;
  byPick.set(key, { depth: scope.depth, hops: scope.hops });
  return true;
}

/** A short, stable name for the expression a budget error was raised on. */
function describe(node, scope) {
  try {
    return node.getText(scope.mod.sourceFile).replace(/\s+/g, ' ').slice(0, 80);
  } catch {
    return `<${ts.SyntaxKind[node.kind] ?? 'expression'}>`;
  }
}

/**
 * Follow an expression sitting in a class position and record every Daisy class
 * it can contribute.
 *
 * Four exits, and the first two are kept apart on purpose:
 *
 *   1. CYCLE -- this node is already on the current resolution path, so the
 *      walk has come back to where it started. That is normal termination, it
 *      says nothing about budget, and it is checked FIRST so a legitimate cycle
 *      can never be reported as an exhausted budget. `ctx.path` is a path set,
 *      not a visited set: it is popped on the way out, so a node reached twice
 *      down two different branches is still walked twice.
 *   2. BUDGET -- the expression chain ran longer than any real one in this tree.
 *      That is a FAILURE, raised, never swallowed. Silently returning here is
 *      the fail-open this counter was built to eliminate.
 *   3. MEMOIZED -- already harvested at least as favourably (see shouldVisit).
 *   4. Nothing left to follow.
 */
function harvest(node, ctx, scope) {
  if (!node) return;
  if (ctx.path.has(node)) return;
  if (scope.depth > MAX_DEPTH) {
    budgetExhausted('maxDepth', MAX_DEPTH, scope, describe(node, scope));
  }
  if (!shouldVisit(ctx, node, scope)) return;

  ctx.path.add(node);
  try {
    harvestNode(node, ctx, scope);
  } finally {
    ctx.path.delete(node);
  }
}

function harvestNode(node, ctx, scope) {
  if (ts.isStringLiteralLike(node)) {
    record(node.text, ctx, scope, node);
    return;
  }
  if (ts.isTemplateExpression(node)) {
    record(node.head.text, ctx, scope, node.head);
    for (const span of node.templateSpans) {
      record(span.literal.text, ctx, scope, span.literal);
      harvest(span.expression, ctx, deeper(scope));
    }
    return;
  }
  if (ts.isConditionalExpression(node)) {
    harvest(node.whenTrue, ctx, deeper(scope, scope.pick));
    harvest(node.whenFalse, ctx, deeper(scope, scope.pick));
    return;
  }
  if (ts.isBinaryExpression(node)) {
    if (!CLASS_BINARY_OPERATORS.has(node.operatorToken.kind)) return;
    // `A ?? B` and `A || B` select one of two containers; `A + B` builds a
    // string and the key stops meaning anything, so it is dropped there.
    const pick = node.operatorToken.kind === ts.SyntaxKind.PlusToken ? null : scope.pick;
    harvest(node.left, ctx, deeper(scope, pick));
    harvest(node.right, ctx, deeper(scope, pick));
    return;
  }
  if (
    ts.isParenthesizedExpression(node) ||
    ts.isAsExpression(node) ||
    ts.isSatisfiesExpression(node) ||
    ts.isNonNullExpression(node) ||
    ts.isTypeAssertionExpression(node) ||
    ts.isJsxExpression(node) ||
    ts.isSpreadElement(node) ||
    ts.isSpreadAssignment(node)
  ) {
    harvest(node.expression, ctx, deeper(scope, scope.pick));
    return;
  }
  if (ts.isArrayLiteralExpression(node)) {
    for (const element of node.elements) harvest(element, ctx, deeper(scope));
    return;
  }
  if (ts.isCallExpression(node)) {
    const callee = node.expression;
    // `[...].filter(Boolean).join(' ')` -- follow the receiver, not the separator.
    if (ts.isPropertyAccessExpression(callee) && PASSTHROUGH_METHODS.has(callee.name.text)) {
      harvest(callee.expression, ctx, deeper(scope));
    }
    // Any other call in a class position composes its arguments into the result
    // (`cx(...)`, `clsx(...)`, or whatever helper lands next). The CALLEE's body
    // is deliberately not followed: harvesting every `return` of an arbitrary
    // function would put `className={t('a.b')}` one hop from an i18n catalog,
    // where "Copy link" tokenizes to a `link` sighting. A call's result is only
    // as provable as the function, so it stays a non-count.
    //
    // One exception, and it is the same argument seen from the other side. With
    // a `pick` pending the walk is not asking "what class does this call build",
    // it is asking "what is property K OF this call's result" -- and a SCALAR
    // argument cannot be a property of the result. `useRecipeProfileDefaults('card')`
    // is the live shape: Card's modern engine reads `.variant` off that hook,
    // and harvesting the arguments regardless read the RECIPE NAME `'card'` --
    // an input, never a class -- as a DaisyUI `card` sighting in a file that
    // renders no Daisy class at all.
    //
    // Only literal arguments are dropped, and only under a pick. An OBJECT
    // argument still carries class values a composition helper can return
    // (`recipe.resolve({ variant }, { root: className }).root` is how every
    // modern primitive builds its class string), so that path is untouched, and
    // `cx('modal-box')` in a class position has no pick at all.
    const literalArgumentIsUnprovable = Boolean(scope.pick);
    for (const argument of node.arguments) {
      if (literalArgumentIsUnprovable && ts.isStringLiteralLike(argument)) continue;
      harvest(argument, ctx, deeper(scope));
    }
    return;
  }
  if (ts.isArrowFunction(node) || ts.isFunctionExpression(node) || ts.isFunctionDeclaration(node)) {
    harvest(node.body, ctx, deeper(scope));
    return;
  }
  if (ts.isBlock(node)) {
    for (const statement of node.statements) {
      if (ts.isReturnStatement(statement)) harvest(statement.expression, ctx, deeper(scope));
    }
    return;
  }
  if (ts.isObjectLiteralExpression(node)) {
    harvestObject(node, ctx, scope);
    return;
  }
  if (ts.isEnumDeclaration(node)) {
    for (const member of node.members) {
      if (scope.pick && ts.isIdentifier(member.name) && member.name.text !== scope.pick) continue;
      harvest(member.initializer, ctx, deeper(scope));
    }
    return;
  }
  if (ts.isIdentifier(node)) {
    ctx.graph.frame = { symbol: node.text, chain: scope.trail };
    follow(resolveIdentifier(ctx.graph, scope.mod, node.text), ctx, scope, scope.pick);
    return;
  }
  if (ts.isElementAccessExpression(node) || ts.isPropertyAccessExpression(node)) {
    harvestMember(node, ctx, scope);
  }
}

/**
 * Harvest an object literal, honouring a static key when one is known.
 *
 * `PLACEMENT[side]` cannot say which entry it reads, so every value is a
 * candidate -- the container is in a class position, so all of it is reachable.
 * `PLACEMENT.top` CAN say, and narrowing to that one property is what keeps an
 * imported token map from contributing entries the consumer never reads. A
 * spread or a computed key means the literal does not enumerate itself, so the
 * narrowing is abandoned rather than trusted.
 */
function harvestObject(node, ctx, scope) {
  const enumerable =
    scope.pick &&
    node.properties.every(
      (property) =>
        (ts.isPropertyAssignment(property) || ts.isShorthandPropertyAssignment(property)) &&
        (ts.isIdentifier(property.name) || ts.isStringLiteralLike(property.name)),
    );

  for (const property of node.properties) {
    if (ts.isPropertyAssignment(property)) {
      if (enumerable && property.name.text !== scope.pick) continue;
      // Map values (`PLACEMENT[side]`) and the `clsx({ 'modal-box': on })`
      // object form, where the KEY is the class, are both class positions.
      if (ts.isStringLiteralLike(property.name)) record(property.name.text, ctx, scope, property.name);
      harvest(property.initializer, ctx, deeper(scope));
    } else if (ts.isShorthandPropertyAssignment(property)) {
      if (enumerable && property.name.text !== scope.pick) continue;
      ctx.graph.frame = { symbol: property.name.text, chain: scope.trail };
      follow(resolveIdentifier(ctx.graph, scope.mod, property.name.text), ctx, scope);
    } else if (ts.isSpreadAssignment(property)) {
      harvest(property.expression, ctx, deeper(scope));
    }
  }
}

/**
 * Harvest `X.k` / `X[k]`.
 *
 * Two receivers, two rules. A NAMESPACE import (`import * as tokens`) is not a
 * value: `tokens.CLASSES` is an export lookup and a dynamic `tokens[key]` is
 * unresolvable, so it counts nothing rather than sweeping in every export of
 * the module. Anything else is a container: resolve it and let the object
 * branch pick the property.
 */
function harvestMember(node, ctx, scope) {
  const key = staticKey(node);
  if (ts.isIdentifier(node.expression)) {
    const namespace = resolveIdentifier(ctx.graph, scope.mod, node.expression.text).find(
      (target) => target.namespace,
    );
    if (namespace) {
      // A dynamic key (`tokens[name]`) is unresolvable and counts nothing; an
      // exhausted hop budget is a failure, and the two must not share an exit.
      if (!key) return;
      if (scope.hops >= MAX_MODULE_HOPS) {
        budgetExhausted('maxModuleHops', MAX_MODULE_HOPS, scope, key);
      }
      ctx.graph.frame = { symbol: key, chain: scope.trail };
      const resolved = resolveExport(ctx.graph, namespace.mod, key, new Set(), [
        { file: namespace.mod.fileName, symbol: key },
      ]);
      follow(resolved, ctx, scope);
      return;
    }
  }
  harvest(node.expression, ctx, deeper(scope, key));
}

/**
 * Add every painted token in `value` to the result, and log the site that
 * contributed it.
 *
 * `scope.depth` is the distance from the class position: 0 means the literal
 * sits directly in it (`className="modal-box"`), and anything further means the
 * walk resolved a binding or a map to get there (`className={PLACEMENT[side]}`).
 * A site in another file is `imported`, and its `chain` is the provenance --
 * every declaration crossed to reach it. `sites` is diagnostics ONLY --
 * `DEBUG_DAISY_CONSUMERS` reads it and nothing else does, so it can never move
 * the count.
 */
function record(value, ctx, scope, node) {
  for (const token of value.split(/\s+/)) {
    if (!ctx.painted.has(token)) continue;
    ctx.found.add(token);
    ctx.sites.push({
      file: scope.mod.fileName,
      line:
        ts.getLineAndCharacterOfPosition(scope.mod.sourceFile, node.getStart(scope.mod.sourceFile))
          .line + 1,
      kind: scope.hops > 0 ? 'imported' : scope.depth === 0 ? 'className' : 'resolved',
      token,
      text: node.getText(scope.mod.sourceFile).replace(/\s+/g, ' ').slice(0, 120),
      chain: scope.trail.slice(),
    });
  }
}

/** True for `x.classList.add(...)` / `x.classList.toggle(...)`. */
function isClassListWrite(callee) {
  return (
    ts.isPropertyAccessExpression(callee) &&
    CLASS_LIST_METHODS.has(callee.name.text) &&
    ts.isPropertyAccessExpression(callee.expression) &&
    callee.expression.name.text === 'classList'
  );
}

/** True for `x.setAttribute('class', ...)`. */
function isSetClassAttribute(node) {
  const callee = node.expression;
  if (!ts.isPropertyAccessExpression(callee) || callee.name.text !== 'setAttribute') return false;
  const [attribute] = node.arguments;
  return Boolean(attribute) && ts.isStringLiteralLike(attribute) && CLASS_NAMES.has(attribute.text);
}

/**
 * Every DaisyUI class rendered by one source text, plus the site that renders
 * each one.
 *
 * The single scan behind every export here. `fileName` selects the parse mode --
 * so `.ts` is not parsed as TSX, where `<T>value` means something else entirely
 * -- and, when it is an absolute path, it is also the origin every relative and
 * aliased import is resolved against. `paintedClasses` is injectable so a
 * fixture can probe the walk with a class vocabulary of its own; the audit
 * always passes the curated list. `graph` is the shared module cache: pass one
 * to amortize supplier parses across a corpus, omit it to get a private one.
 */
export function scanDaisyClassSites(
  text,
  fileName = 'source.tsx',
  paintedClasses = PAINTED,
  graph = createModuleGraph(),
) {
  const mod = createModule(fileName, text);
  const ctx = {
    found: new Set(),
    seen: new Map(),
    // Nodes on the CURRENT resolution path, pushed on entry and popped on exit.
    // A repeat arrival here is a cycle, which terminates normally and must never
    // be confused with an exhausted budget.
    path: new Set(),
    sites: [],
    graph,
    painted: paintedClasses instanceof Set ? paintedClasses : new Set(paintedClasses),
  };
  const root = { mod, depth: 0, hops: 0, trail: [], pick: null };

  (function walk(node) {
    if (ts.isJsxAttribute(node) && isClassName(node.name) && node.initializer) {
      harvest(node.initializer, ctx, root);
    } else if (ts.isPropertyAssignment(node) && isClassName(node.name)) {
      harvest(node.initializer, ctx, root);
    } else if (ts.isBindingElement(node) && node.initializer) {
      // `{ className = 'modal' }` -- a default that reaches the DOM.
      if (isClassName(node.propertyName ?? node.name)) harvest(node.initializer, ctx, root);
    } else if (ts.isCallExpression(node)) {
      if (isClassListWrite(node.expression)) {
        for (const argument of node.arguments) harvest(argument, ctx, root);
      } else if (isSetClassAttribute(node)) {
        harvest(node.arguments[1], ctx, root);
      }
    }
    ts.forEachChild(node, walk);
  })(mod.sourceFile);

  // The scanned file first, then suppliers by path; within a file, by line. A
  // consumer's own sites are what the drain edits, so they lead.
  ctx.sites.sort(
    (a, b) =>
      (a.file === fileName ? 0 : 1) - (b.file === fileName ? 0 : 1) ||
      a.file.localeCompare(b.file) ||
      a.line - b.line ||
      a.token.localeCompare(b.token),
  );
  return { classes: ctx.found, sites: ctx.sites };
}

/** Every DaisyUI class rendered by one source text, as a `Set`. */
export function findDaisyClassesInText(
  text,
  fileName = 'source.tsx',
  paintedClasses = PAINTED,
  graph = createModuleGraph(),
) {
  return scanDaisyClassSites(text, fileName, paintedClasses, graph).classes;
}

/**
 * Per-file inventory for every consumer: the classes it renders and the exact
 * sites that render them.
 *
 * This is the diagnostic view behind `DEBUG_DAISY_CONSUMERS=1`. It shares one
 * scan with `countDaisyClassConsumers`, so a file appears here if and only if it
 * is counted -- the inventory cannot drift from the ratchet. One module graph
 * serves the whole corpus, so a constant shared by forty consumers is parsed
 * once.
 */
export function collectDaisyClassConsumers(files, paintedClasses = PAINTED) {
  const graph = createModuleGraph();
  const consumers = [];
  for (const file of new Set(files)) {
    const { classes, sites } = scanDaisyClassSites(
      readFileSync(file, 'utf8'),
      file,
      paintedClasses,
      graph,
    );
    if (classes.size > 0)
      consumers.push({
        file,
        tokens: [...classes].sort(),
        sites,
        // Daisy modifiers this file renders WITHOUT the base class they modify:
        // `loading-spinner` with no `loading`, `timeline-box` with no
        // `timeline`. Diagnostics only -- it never moves the count -- but the
        // drain needs it, because a modifier alone paints a single orphaned
        // declaration and removing it is the whole edit, with nothing else in
        // the file holding a base class up.
        modifiersWithoutBase: [...classes]
          .filter((token) => CLASS_BASES.has(token) && !classes.has(CLASS_BASES.get(token)))
          .map((token) => ({ token, base: CLASS_BASES.get(token) }))
          .sort((a, b) => a.token.localeCompare(b.token)),
      });
  }
  return consumers;
}

/**
 * Count the files in `files` that render at least one DaisyUI class.
 *
 * Paths are de-duplicated so a file supplied twice cannot inflate the ratchet.
 */
export function countDaisyClassConsumers(files, paintedClasses = PAINTED) {
  return collectDaisyClassConsumers(files, paintedClasses).length;
}

/** `[file, sortedClasses]` for each consumer -- the drain's worklist. */
export function listDaisyClassConsumers(files, paintedClasses = PAINTED) {
  return collectDaisyClassConsumers(files, paintedClasses).map(({ file, tokens }) => [file, tokens]);
}
