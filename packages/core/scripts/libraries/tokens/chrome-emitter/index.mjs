/**
 * chrome-emitter — the one authority for which files ARE the chrome CSS
 * variable emitter (`kernel/foundation/css/chrome-variables`).
 *
 * Every instrument that reads the emitter (theme parity, the hook manifest,
 * tenant reach, cascade producers) takes its file list from here, so a file
 * the emitter grows can never be read by one reader and missed by another.
 *
 * The list is CLOSED and checked three ways against the real tree before any
 * reader may use it:
 *   - the productive inventory: every non-test source file under the folder;
 *   - the value-import closure of the root `index.ts` (type-only imports,
 *     comments and strings are not edges; targets outside the folder are not
 *     members);
 *   - the declared members below.
 * The three sets must be equal. An orphan file, a declared file nobody
 * imports, or a new undeclared import each throws; nothing is admitted by
 * directory or by name pattern. `tests/`, `fixtures/` and `stories/` are not
 * inventory, and for that reason a member may not value-import into one: the
 * file would run inside the emitter and be read by no instrument, so the edge
 * throws instead of being skipped.
 *
 * The declared list holds exactly one member per singleton role (`root`,
 * `data`, `writer`) and zero or more `section` members, each declared by path.
 *
 * A `data` member must be data only: type-only imports, type declarations and
 * `const` bindings to object/array literals or `chromeVariableMap(...)` calls
 * (optionally wrapped in `as` / `satisfies`). A bare identifier is data only when
 * it names an earlier admitted const of the same member. The one admitted helper
 * is the existing `chromeVariableMap` arrow, matched by its exact syntax tree. A
 * writer, a function, a statement or a value import in a data member throws.
 *
 * A `writer` member holds template-free channel writers only: type-only
 * imports, type declarations, plain function declarations and one trailing
 * `export { … }` naming exactly those functions. A writer imports no value: a
 * writer -> data edge is a sibling-owner dependency the structure law refuses.
 * Every call site stays in the root, and a writer names no other writer. A
 * template builds a channel name only as the key of `vars[`…`] = value`, or as
 * a function-local `const` used only inside such keys, and every hole is a
 * parameter of the writer or such a const: the forms the readers that resolve
 * a hole from the root's literal call sites can follow. The root must import
 * exactly the exported writers, without aliases, may not shadow them, and is
 * the writer member's only importer anywhere in src/ or tests/. The root itself
 * is not held to the template grammar.
 *
 * A `section` member holds literal channel assignments only: type-only
 * imports, type declarations, plain function declarations and one trailing
 * `export { … }` naming exactly those functions. Each function takes `vars` as
 * a parameter, and its one effect is `vars["--ds-…"] = value` with a string
 * literal key: no other assignment, no read or hand-off of `vars`, no template
 * literal, no nested function, no call but `String(…)`. A section imports no
 * value and names no writer and no section, so every writer call site and every
 * section call site stays in the root. The root must import exactly the
 * exported sections of each section member, without aliases, may not shadow
 * them, and is each section member's only importer anywhere in src/ or tests/.
 * A channel a section writes is therefore a literal every reader reads without
 * resolving anything.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { basename, dirname, join, relative, resolve, sep } from 'node:path';

import ts from 'typescript';

import { dataOnlyViolations, declaredFunctionNames, parse, sectionViolations, writerViolations } from './grammar/index.mjs';

export { dataOnlyViolations, sectionViolations, writerViolations };

export const CHROME_EMITTER_DIR = 'src/infrastructure/compilers/kernel/foundation/css/chrome-variables';

export const CHROME_EMITTER_FILES = Object.freeze([
  Object.freeze({ path: 'index.ts', role: 'root' }),
  Object.freeze({ path: 'sections/buttons/index.ts', role: 'section' }),
  Object.freeze({ path: 'sections/containers/index.ts', role: 'section' }),
  Object.freeze({ path: 'sections/fields/index.ts', role: 'section' }),
  Object.freeze({ path: 'sections/frame/index.ts', role: 'section' }),
  Object.freeze({ path: 'tables/index.ts', role: 'data' }),
  Object.freeze({ path: 'writers/index.ts', role: 'writer' }),
]);

const CHROME_EMITTER_SINGLETON_ROLES = Object.freeze(['root', 'data', 'writer']);
const CHROME_EMITTER_SECTION_ROLE = 'section';
const CHROME_EMITTER_ROLES = Object.freeze([...CHROME_EMITTER_SINGLETON_ROLES, CHROME_EMITTER_SECTION_ROLE]);

const NON_PRODUCTIVE_DIRS = new Set(['tests', 'test', '__tests__', 'fixtures', '__fixtures__', 'stories']);
const SOURCE_FILE = /\.(?:ts|tsx|mts|cts|js|mjs|cjs|jsx)$/;
const NON_PRODUCTIVE_FILE = /(?:\.d\.ts|\.(?:test|spec|stories)\.[cm]?[jt]sx?)$/;
const RESOLVE_SUFFIXES = ['.ts', '.tsx', `${sep}index.ts`, `${sep}index.tsx`];
const toPosix = (path) => path.split(sep).join('/');

function fail(message) {
  throw new Error(`chrome-emitter: ${message}`);
}

/** Every productive source file under the emitter folder, folder-relative. */
export function chromeEmitterInventory(emitterDir) {
  const found = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!NON_PRODUCTIVE_DIRS.has(entry.name)) walk(full);
        continue;
      }
      if (SOURCE_FILE.test(entry.name) && !NON_PRODUCTIVE_FILE.test(entry.name)) {
        found.push(toPosix(relative(emitterDir, full)));
      }
    }
  };
  walk(emitterDir);
  return found.sort();
}

function isTypeOnlyImport(node) {
  const clause = node.importClause;
  if (!clause) return false;
  if (clause.isTypeOnly) return true;
  if (clause.name) return false;
  const bindings = clause.namedBindings;
  return Boolean(
    bindings &&
      ts.isNamedImports(bindings) &&
      bindings.elements.length > 0 &&
      bindings.elements.every((element) => element.isTypeOnly),
  );
}

/** Module specifiers a file depends on at RUNTIME. */
export function valueImportSpecifiers(sourceFile) {
  const specifiers = [];
  const visit = (node) => {
    if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
      if (!isTypeOnlyImport(node)) specifiers.push(node.moduleSpecifier.text);
    } else if (
      ts.isExportDeclaration(node) &&
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier) &&
      !node.isTypeOnly
    ) {
      specifiers.push(node.moduleSpecifier.text);
    } else if (
      ts.isCallExpression(node) &&
      node.expression.kind === ts.SyntaxKind.ImportKeyword &&
      node.arguments[0] &&
      ts.isStringLiteralLike(node.arguments[0])
    ) {
      specifiers.push(node.arguments[0].text);
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return specifiers;
}

function resolveSpecifier(coreRoot, fromFile, specifier) {
  let base;
  if (specifier.startsWith('.')) base = resolve(dirname(fromFile), specifier);
  else if (specifier.startsWith('@/')) base = join(coreRoot, 'src', specifier.slice(2));
  else return null;
  base = base.replace(/\.(?:js|ts)$/, '');
  for (const suffix of RESOLVE_SUFFIXES) {
    if (existsSync(`${base}${suffix}`)) return `${base}${suffix}`;
  }
  return { unresolved: base };
}

/** The value-import closure of the root, restricted to the emitter folder. */
export function chromeEmitterClosure(coreRoot, emitterDir = join(coreRoot, CHROME_EMITTER_DIR)) {
  const rootFile = join(emitterDir, 'index.ts');
  if (!existsSync(rootFile)) fail(`root ${toPosix(relative(coreRoot, rootFile))} is missing`);
  const members = new Set();
  const queue = [rootFile];
  while (queue.length > 0) {
    const file = queue.shift();
    const rel = toPosix(relative(emitterDir, file));
    if (members.has(rel)) continue;
    members.add(rel);
    for (const specifier of valueImportSpecifiers(parse(file, readFileSync(file, 'utf8')))) {
      const target = resolveSpecifier(coreRoot, file, specifier);
      if (target === null) continue;
      const targetPath = typeof target === 'string' ? target : target.unresolved;
      const inside = relative(emitterDir, targetPath);
      if (inside.startsWith('..') || inside === '') continue;
      if (inside.split(sep).some((segment) => NON_PRODUCTIVE_DIRS.has(segment))) {
        fail(`${rel} imports "${specifier}", which is under a non-productive directory: no reader reads it`);
      }
      if (typeof target !== 'string') fail(`${rel} imports "${specifier}", which resolves to no file`);
      queue.push(target);
    }
  }
  return [...members].sort();
}

/**
 * Violations of the closed role list: exactly one member per singleton role,
 * zero or more sections, no other role, no path declared twice.
 */
export function chromeEmitterRoleViolations(files) {
  const violations = [];
  const paths = new Set();
  for (const entry of files) {
    if (!CHROME_EMITTER_ROLES.includes(entry.role)) violations.push(`${entry.path} has unknown role "${entry.role}"`);
    if (paths.has(entry.path)) violations.push(`${entry.path} is declared twice`);
    paths.add(entry.path);
  }
  for (const role of CHROME_EMITTER_SINGLETON_ROLES) {
    const count = files.filter((entry) => entry.role === role).length;
    if (count !== 1) violations.push(`role ${role} has ${count} members, not 1`);
  }
  return violations;
}

const importerCache = new Map();
const IMPORTER_SOURCE = /\.(?:ts|tsx|mts|cts|js|mjs|cjs|jsx)$/;

/** The word a specifier must carry to reach `memberFile` from outside its own folder. */
const memberToken = (memberFile) =>
  /^index\.[cm]?[jt]sx?$/.test(basename(memberFile)) ? basename(dirname(memberFile)) : basename(memberFile).replace(/\.[^.]+$/, '');

/**
 * Every string literal under src/ and tests/ (declarations excluded) that
 * starts with "." or "@/" and resolves to one of `memberFiles`, as the
 * core-relative file that holds it, once per literal, per member.
 */
function memberImporters(coreRoot, memberFiles) {
  const key = [coreRoot, ...memberFiles].join('\0');
  if (importerCache.has(key)) return importerCache.get(key);
  const tokens = memberFiles.map(memberToken);
  const memberDirs = memberFiles.map((memberFile) => `${dirname(memberFile)}${sep}`);
  const files = [];
  const walk = (dir) => {
    if (!existsSync(dir)) return;
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name !== 'node_modules') walk(full);
      } else if (IMPORTER_SOURCE.test(entry.name) && !entry.name.endsWith('.d.ts')) {
        files.push(full);
      }
    }
  };
  walk(join(coreRoot, 'src'));
  walk(join(coreRoot, 'tests'));
  const importers = new Map(memberFiles.map((memberFile) => [memberFile, []]));
  for (const file of files.sort()) {
    const text = readFileSync(file, 'utf8');
    if (!tokens.some((token) => text.includes(token)) && !memberDirs.some((memberDir) => file.startsWith(memberDir))) continue;
    const sourceFile = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, /x$/.test(file) ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
    const visit = (node) => {
      if ((ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) && /^(?:\.|@\/)/.test(node.text)) {
        const target = resolveSpecifier(coreRoot, file, node.text);
        if (typeof target === 'string' && importers.has(target)) importers.get(target).push(toPosix(relative(coreRoot, file)));
      }
      ts.forEachChild(node, visit);
    };
    visit(sourceFile);
  }
  for (const [memberFile, list] of importers) importers.set(memberFile, Object.freeze(list));
  importerCache.set(key, importers);
  return importers;
}

/**
 * The importers of the writer member. The law is that this list is exactly
 * [the root], held by the root's single import declaration.
 */
export function chromeEmitterWriterImporters(coreRoot) {
  const writerRelative = CHROME_EMITTER_FILES.find((entry) => entry.role === 'writer').path;
  const writerFile = join(coreRoot, CHROME_EMITTER_DIR, writerRelative);
  return memberImporters(coreRoot, [writerFile]).get(writerFile);
}

/** The importers of every section member of `files`, keyed by declared path; the same law, per member. */
export function chromeEmitterSectionImporters(coreRoot, files = CHROME_EMITTER_FILES) {
  const sections = files.filter((entry) => entry.role === CHROME_EMITTER_SECTION_ROLE);
  if (sections.length === 0) return {};
  const absolute = sections.map((entry) => join(coreRoot, CHROME_EMITTER_DIR, entry.path));
  const importers = memberImporters(coreRoot, absolute);
  return Object.fromEntries(sections.map((entry, index) => [entry.path, importers.get(absolute[index])]));
}

/** Names a parsed file value-imports from one absolute target. */
function importedNamesFrom(sourceFile, resolveImport, target) {
  const names = [];
  for (const statement of sourceFile.statements) {
    if (!ts.isImportDeclaration(statement) || statement.importClause?.isTypeOnly) continue;
    if (!ts.isStringLiteral(statement.moduleSpecifier) || resolveImport(statement.moduleSpecifier.text) !== target) continue;
    const bindings = statement.importClause?.namedBindings;
    if (bindings && ts.isNamedImports(bindings)) {
      for (const element of bindings.elements) {
        if (element.isTypeOnly) continue;
        names.push(element.propertyName ? `<aliased ${element.propertyName.text} as ${element.name.text}>` : element.name.text);
      }
    } else {
      names.push('<non-named import>');
    }
  }
  return names;
}

/**
 * The emitter law over an explicit member list: the files, absolute, in
 * declared order. Throws unless the inventory, the value-import closure and
 * the declared list are one set and every member keeps the grammar of its
 * role. No reader calls this: `chromeEmitterSources` is the one door, and it
 * fixes the list. It is exported so the law can be drilled against a planted
 * tree that declares members the shipped list does not.
 */
export function validateChromeEmitterMembers(coreRoot, files) {
  const roles = chromeEmitterRoleViolations(files);
  if (roles.length > 0) fail(roles.join('; '));
  const dir = join(coreRoot, CHROME_EMITTER_DIR);
  const declared = files.map((entry) => entry.path).sort();
  const inventory = chromeEmitterInventory(dir);
  const closure = chromeEmitterClosure(coreRoot, dir);
  const problems = [];
  for (const path of inventory) if (!closure.includes(path)) problems.push(`orphan ${path} is not imported by the root`);
  for (const path of declared) if (!closure.includes(path)) problems.push(`declared ${path} is not imported by the root`);
  for (const path of closure) if (!declared.includes(path)) problems.push(`undeclared ${path} is imported by the root`);
  if (problems.length > 0) fail(problems.join('; '));
  const memberOf = (role) => join(dir, files.find((entry) => entry.role === role).path);
  const rootFile = memberOf('root');
  const dataFile = memberOf('data');
  const writerFile = memberOf('writer');
  const sectionEntries = files.filter((entry) => entry.role === CHROME_EMITTER_SECTION_ROLE);
  const resolverFor = (file) => (specifier) => {
    const target = resolveSpecifier(coreRoot, file, specifier);
    return typeof target === 'string' ? target : null;
  };
  const dataViolations = dataOnlyViolations(dataFile, readFileSync(dataFile, 'utf8'));
  if (dataViolations.length > 0) fail(`data member ${relative(dir, dataFile)} is not data only: ${dataViolations.join(', ')}`);
  const writerText = readFileSync(writerFile, 'utf8');
  const writerProblems = writerViolations(writerFile, writerText);
  if (writerProblems.length > 0) fail(`writer member ${relative(dir, writerFile)} is not a writer: ${writerProblems.join(', ')}`);
  const writers = declaredFunctionNames(parse(writerFile, writerText));
  const sections = sectionEntries.map((entry) => {
    const file = join(dir, entry.path);
    const text = readFileSync(file, 'utf8');
    return { path: entry.path, file, text, functions: declaredFunctionNames(parse(file, text)) };
  });
  for (const section of sections) {
    const others = sections.filter((other) => other !== section).flatMap((other) => other.functions);
    const sectionProblems = sectionViolations(section.file, section.text, { writers, sections: others });
    if (sectionProblems.length > 0) fail(`section member ${section.path} is not a section: ${sectionProblems.join(', ')}`);
  }
  const rootSource = parse(rootFile, readFileSync(rootFile, 'utf8'));
  const rootFunctions = declaredFunctionNames(rootSource);
  const crossProblems = [];
  const imported = importedNamesFrom(rootSource, resolverFor(rootFile), writerFile);
  if ([...new Set(imported)].sort().join() !== [...writers].sort().join() || imported.length !== writers.length) {
    crossProblems.push(`the root imports [${imported.join(', ')}] from the writer, not its writers [${writers.join(', ')}]`);
  }
  for (const name of writers) if (rootFunctions.includes(name)) crossProblems.push(`the root shadows writer ${name}`);
  for (const section of sections) {
    const names = importedNamesFrom(rootSource, resolverFor(rootFile), section.file);
    if ([...new Set(names)].sort().join() !== [...section.functions].sort().join() || names.length !== section.functions.length) {
      crossProblems.push(`the root imports [${names.join(', ')}] from section ${section.path}, not its sections [${section.functions.join(', ')}]`);
    }
    for (const name of section.functions) if (rootFunctions.includes(name)) crossProblems.push(`the root shadows section ${name}`);
  }
  const seen = new Set();
  for (const name of [...rootFunctions, ...writers, ...sections.flatMap((section) => section.functions)]) {
    if (seen.has(name)) crossProblems.push(`function ${name} is declared twice across members`);
    seen.add(name);
  }
  const rootMember = toPosix(relative(coreRoot, rootFile));
  for (const [path, importers] of Object.entries(chromeEmitterSectionImporters(coreRoot, files))) {
    if (importers.length !== 1 || importers[0] !== rootMember) {
      crossProblems.push(`section ${path} is imported by [${importers.join(', ')}], not by the root alone`);
    }
  }
  if (crossProblems.length > 0) fail(crossProblems.join('; '));
  return files.map((entry) => join(dir, entry.path));
}

/** The validated emitter files, absolute, in declared order: the law over the shipped list, and nothing else. */
export function chromeEmitterSources(coreRoot) {
  return validateChromeEmitterMembers(coreRoot, CHROME_EMITTER_FILES);
}
