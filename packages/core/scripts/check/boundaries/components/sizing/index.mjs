#!/usr/bin/env node
/**
 * size-axis-law-gate — TAX-SIZE-TONE axis-law ratchet (design 2.7).
 *
 * Enumerates every exported `*Props` interface/type-alias across `src/components/**`
 * (production sources only -- tests/stories/dist excluded by the project
 * tsconfig) and, for each declared `size` field, resolves its real TypeScript
 * type through a full program+checker and verifies every string-literal
 * constituent is a member of `Size | ModalSize`
 * (`src/foundation/contracts/kernel/common/index.ts`). Non-literal
 * constituents (e.g. Space's `size?: ... | number | [number, number]`) are
 * ignored -- they are a different axis riding the same prop name, not a size
 * spelling. Generic wrappers (`ResponsiveValue<XSize>`) are handled for free:
 * the checker resolves the instantiated type before this gate ever sees it,
 * so the wrapper's own union branches (plain value vs. breakpoint object)
 * flatten alongside the literal size steps.
 *
 * This is a hard law, not a decrease-only ledger: any exported `*Props` size
 * field outside the canonical vocabulary fails the gate. There is no baseline
 * file and no `--seed` mode -- a genuinely new size axis on some future
 * component is expected to reuse `Size`, not invent a parallel spelling.
 *
 * The Ant Design spellings (`small | middle | large | default`) are not
 * vocabulary. They survive in exactly the engine bindings enumerated in
 * `ENGINE_BINDING_SIZE_FIELDS`: the props the three engines of a family
 * implement, behind a facade whose own `size` takes canonical steps only and
 * hands them to the engines. A binding is held to its exact literal set, must
 * exist, and must sit behind a facade `*Props.size` that is canonical -- so
 * the list cannot widen, go stale, or shelter a public prop.
 *
 * Usage:
 *   node scripts/check/boundaries/components/sizing/index.mjs           # print the census
 *   node scripts/check/boundaries/components/sizing/index.mjs --check   # exit 1 on any violation
 */
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { packageRoot as findPackageRoot } from '../../../../libraries/repo-root/index.mjs';

const require = createRequire(import.meta.url);
const ts = require('typescript');

const HERE = dirname(fileURLToPath(import.meta.url));
const CORE_ROOT = findPackageRoot(HERE);
const TSCONFIG_PATH = join(CORE_ROOT, 'tsconfig.json');
const KERNEL_COMMON_PATH = join(CORE_ROOT, 'src/foundation/contracts/kernel/common/index.ts');
const UI_ROOT = join(CORE_ROOT, 'src/components') + sep;

function toPosix(value) {
  return value.split(sep).join('/');
}

function displayPath(absolute) {
  return toPosix(relative(CORE_ROOT, absolute));
}

/** Parses tsconfig.json the same way `tsc` does, honoring its own `exclude` (tests/stories/dist). */
function loadProjectFiles() {
  const configFile = ts.readConfigFile(TSCONFIG_PATH, ts.sys.readFile);
  if (configFile.error) {
    throw new Error(ts.flattenDiagnosticMessageText(configFile.error.messageText, '\n'));
  }
  const parsed = ts.parseJsonConfigFileContent(configFile.config, ts.sys, CORE_ROOT, {
    noEmit: true,
    incremental: false,
    tsBuildInfoFile: undefined,
  }, TSCONFIG_PATH);
  if (parsed.errors.length > 0) {
    throw new Error(parsed.errors.map((d) => ts.flattenDiagnosticMessageText(d.messageText, '\n')).join('\n'));
  }
  return { fileNames: parsed.fileNames, options: { ...parsed.options, skipLibCheck: true } };
}

function hasExportModifier(node) {
  return node.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword) ?? false;
}

/** Recursively flattens a (possibly nested/generic-instantiated) type to its string-literal constituents; non-literal branches (object types, `number`, `[number, number]`, plain `string`, ...) are silently skipped -- they are not size vocabulary. */
function collectStringLiterals(type, out, seen) {
  if (seen.has(type)) return;
  seen.add(type);
  if (type.isUnion()) {
    for (const member of type.types) collectStringLiterals(member, out, seen);
    return;
  }
  if (type.isStringLiteral()) {
    out.add(type.value);
  }
}

function literalsOf(checker, type) {
  const out = new Set();
  collectStringLiterals(type, out, new Set());
  return out;
}

/**
 * The kernel-sanctioned size-axis exports. `Size` is the density-scale law
 * this gate exists to enforce. `ModalSize` is a second, equally
 * kernel-defined and documented export ("Modal width scale, shared by both
 * Modal component families") that deliberately widens `Size` with
 * `'4xl' | '5xl' | 'full'` for the viewport-filling case -- a principled,
 * single-authority extension for width/dimension pickers, not a per-component
 * parallel vocabulary. Drawer's locally-declared `DrawerSize` independently
 * adds only `'full'` to the same `Size` steps for the identical reason; since
 * it is a strict subset of `ModalSize`'s extras, no separate allowance is
 * needed for it. A genuinely new ad hoc size spelling on some other component
 * is exactly what this gate is designed to catch.
 */
const SANCTIONED_KERNEL_SIZE_EXPORTS = ['Size', 'ModalSize'];

/**
 * The engine bindings that keep an Ant Design spelling. `owner`/`file` name the
 * props the engines implement and `literals` the exact set they read;
 * `facadeOwner`/`facadeFile` name the public props whose `size` the facade
 * narrows to canonical steps. Frozen Classic and Rustic engines read these
 * spellings raw, which is why they are stated here instead of being renamed.
 * The Space engines read both spellings, so its binding lists both.
 */
export const ENGINE_BINDING_SIZE_FIELDS = Object.freeze([
  Object.freeze({
    owner: 'DescriptionsEngineProps',
    file: 'src/components/primitives/display/descriptions/contracts/index.ts',
    literals: Object.freeze(['default', 'middle', 'small']),
    facadeOwner: 'DescriptionsProps',
    facadeFile: 'src/components/primitives/display/descriptions/index.tsx',
  }),
  Object.freeze({
    owner: 'ListEngineProps',
    file: 'src/components/primitives/display/list/contracts/index.ts',
    literals: Object.freeze(['default', 'large', 'small']),
    facadeOwner: 'ListProps',
    facadeFile: 'src/components/primitives/display/list/index.tsx',
  }),
  Object.freeze({
    owner: 'SpaceEngineProps',
    file: 'src/components/primitives/layout/space/contracts/index.ts',
    literals: Object.freeze(['large', 'lg', 'md', 'middle', 'sm', 'small']),
    facadeOwner: 'SpaceProps',
    facadeFile: 'src/components/primitives/layout/space/index.ts',
  }),
  Object.freeze({
    owner: 'SegmentedEngineProps',
    file: 'src/components/primitives/navigation/segmented/contracts/index.ts',
    literals: Object.freeze(['large', 'middle', 'small']),
    facadeOwner: 'SegmentedProps',
    facadeFile: 'src/components/primitives/navigation/segmented/index.tsx',
  }),
]);

/** Resolves the sanctioned kernel size-axis exports to their allowed literal-string set. */
function loadAllowedVocabulary(program, checker) {
  const sourceFile = program.getSourceFile(KERNEL_COMMON_PATH);
  if (!sourceFile) {
    throw new Error(`size-axis-law-gate: could not load ${displayPath(KERNEL_COMMON_PATH)} into the program`);
  }
  const allowed = new Set();
  const found = new Set();
  for (const statement of sourceFile.statements) {
    if (!ts.isTypeAliasDeclaration(statement) || !hasExportModifier(statement)) continue;
    const name = statement.name.text;
    if (!SANCTIONED_KERNEL_SIZE_EXPORTS.includes(name)) continue;
    const symbol = checker.getSymbolAtLocation(statement.name);
    if (!symbol) continue;
    const type = checker.getDeclaredTypeOfSymbol(symbol);
    for (const literal of literalsOf(checker, type)) allowed.add(literal);
    found.add(name);
  }
  for (const required of SANCTIONED_KERNEL_SIZE_EXPORTS) {
    if (!found.has(required)) {
      throw new Error(`size-axis-law-gate: kernel/common no longer exports ${required} -- update this gate`);
    }
  }
  return allowed;
}

function isPropsOwnerName(name) {
  return /Props$/.test(name);
}

/** Scans every exported `interface *Props` / `type *Props = { ... }` for a declared `size` member (own members only -- an interface that merely inherits `size` via `extends`/`Omit` is proven compliant when its base is scanned, so re-checking it would be redundant, not additive). */
function scanFileForSizeFields(sourceFile, checker, census) {
  for (const statement of sourceFile.statements) {
    if (!hasExportModifier(statement)) continue;
    let members;
    let ownerName;
    if (ts.isInterfaceDeclaration(statement) && isPropsOwnerName(statement.name.text)) {
      members = statement.members;
      ownerName = statement.name.text;
    } else if (
      ts.isTypeAliasDeclaration(statement)
      && isPropsOwnerName(statement.name.text)
      && ts.isTypeLiteralNode(statement.type)
    ) {
      members = statement.type.members;
      ownerName = statement.name.text;
    } else {
      continue;
    }
    for (const member of members) {
      if (!ts.isPropertySignature(member) || !member.type) continue;
      if (!ts.isIdentifier(member.name) || member.name.text !== 'size') continue;
      const type = checker.getTypeFromTypeNode(member.type);
      const literals = literalsOf(checker, type);
      const position = sourceFile.getLineAndCharacterOfPosition(member.getStart(sourceFile));
      const site = { owner: ownerName, file: displayPath(sourceFile.fileName), line: position.line + 1 };
      census.push({ ...site, literals: [...literals].sort() });
    }
  }
}

function sameLiterals(left, right) {
  return left.length === right.length && left.every((literal, index) => literal === right[index]);
}

/**
 * Judges a census against the kernel vocabulary and the engine bindings. Pure:
 * it reads no file, so a drill can hand it any census.
 *
 * A field named by a binding must carry exactly the binding's literals. Every
 * other field must stay inside the kernel vocabulary. A binding with no field,
 * or whose facade field is missing or not canonical, is a violation of its
 * own -- the allowance is void without the facade that justifies it.
 */
export function evaluateSizeCensus(census, allowedVocabulary, bindings = ENGINE_BINDING_SIZE_FIELDS) {
  const allowed = new Set(allowedVocabulary);
  const violations = [];
  const bindingOf = (entry) => bindings.find((binding) => binding.owner === entry.owner && binding.file === entry.file);

  for (const entry of census) {
    const binding = bindingOf(entry);
    if (binding) {
      const expected = [...binding.literals].sort();
      if (!sameLiterals(entry.literals, expected)) {
        violations.push({
          owner: entry.owner,
          file: entry.file,
          line: entry.line,
          badLiterals: entry.literals,
          reason: `engine binding drifted from ${expected.join(' | ')}`,
        });
      }
      continue;
    }
    const bad = entry.literals.filter((literal) => !allowed.has(literal));
    if (bad.length > 0) {
      violations.push({ owner: entry.owner, file: entry.file, line: entry.line, badLiterals: bad.sort(), reason: 'outside Size | ModalSize' });
    }
  }

  for (const binding of bindings) {
    const bound = census.find((entry) => entry.owner === binding.owner && entry.file === binding.file);
    if (!bound) {
      violations.push({
        owner: binding.owner,
        file: binding.file,
        line: 0,
        badLiterals: [],
        reason: 'stale engine binding: no such size field',
      });
    }
    const facade = census.find((entry) => entry.owner === binding.facadeOwner && entry.file === binding.facadeFile);
    if (!facade || facade.literals.length === 0 || facade.literals.some((literal) => !allowed.has(literal))) {
      violations.push({
        owner: binding.facadeOwner,
        file: binding.facadeFile,
        line: facade ? facade.line : 0,
        badLiterals: facade ? facade.literals.filter((literal) => !allowed.has(literal)) : [],
        reason: `engine binding ${binding.owner} has no canonical facade size field`,
      });
    }
  }

  violations.sort((left, right) => left.file.localeCompare(right.file) || left.line - right.line);
  return violations;
}

/** A compiler host that serves `overlay` (absolute path -> source text) in front of the disk. */
function createOverlayHost(options, overlay) {
  const host = ts.createCompilerHost(options, true);
  const virtual = new Map(Object.entries(overlay).map(([path, text]) => [resolve(path), text]));
  const fileExists = host.fileExists.bind(host);
  const readFile = host.readFile.bind(host);
  const getSourceFile = host.getSourceFile.bind(host);
  host.fileExists = (fileName) => virtual.has(resolve(fileName)) || fileExists(fileName);
  host.readFile = (fileName) => virtual.get(resolve(fileName)) ?? readFile(fileName);
  host.getSourceFile = (fileName, languageVersionOrOptions, ...rest) => {
    const text = virtual.get(resolve(fileName));
    if (text === undefined) return getSourceFile(fileName, languageVersionOrOptions, ...rest);
    return ts.createSourceFile(fileName, text, languageVersionOrOptions, true);
  };
  return { host, rootNames: [...virtual.keys()] };
}

/**
 * Runs the law over the real project. `overlay` (absolute path -> source text)
 * replaces or adds files in front of the disk without writing anything; it is
 * how the drill plants a violation in the program the checker really resolves.
 */
export function runSizeAxisLawGate({ overlay = {} } = {}) {
  const { fileNames, options } = loadProjectFiles();
  const { host, rootNames } = createOverlayHost(options, overlay);
  const program = ts.createProgram({ rootNames: [...new Set([...fileNames, ...rootNames])], options, host });
  const checker = program.getTypeChecker();
  const allowed = loadAllowedVocabulary(program, checker);

  const census = [];
  for (const sourceFile of program.getSourceFiles()) {
    if (sourceFile.isDeclarationFile) continue;
    const absolute = resolve(sourceFile.fileName);
    if (!absolute.startsWith(UI_ROOT)) continue;
    scanFileForSizeFields(sourceFile, checker, census);
  }

  census.sort((left, right) => left.file.localeCompare(right.file) || left.line - right.line);
  const allowedVocabulary = [...allowed].sort();
  const violations = evaluateSizeCensus(census, allowedVocabulary);

  return {
    allowedVocabulary,
    engineBindings: ENGINE_BINDING_SIZE_FIELDS.map((binding) => `${binding.owner}.size`),
    sizeFieldsChecked: census.length,
    census,
    violations,
    pass: violations.length === 0,
  };
}

async function main() {
  const mode = process.argv.includes('--check') ? 'check' : 'report';
  const result = runSizeAxisLawGate();

  console.log('[size-axis-law-gate]');
  console.log(`  allowed vocabulary   : ${result.allowedVocabulary.join(', ')}`);
  console.log(`  engine bindings      : ${result.engineBindings.join(', ')}`);
  console.log(`  size fields checked  : ${result.sizeFieldsChecked}`);
  console.log(`  violations           : ${result.violations.length}`);

  if (mode === 'report') {
    for (const entry of result.census) {
      console.log(`    ${entry.file}:${entry.line} ${entry.owner}.size -> ${entry.literals.join(' | ') || '(no literal members)'}`);
    }
  }

  if (result.violations.length > 0) {
    console.error('[size-axis-law-gate] FAIL: size field(s) outside the size-axis law:');
    for (const violation of result.violations) {
      console.error(`  - ${violation.file}:${violation.line} ${violation.owner}.size -> ${violation.badLiterals.join(', ') || '(none)'} (${violation.reason})`);
    }
    if (mode === 'check') process.exit(1);
  } else {
    console.log('[size-axis-law-gate] OK — every exported *Props size field resolves within Size | ModalSize; the engine bindings hold their exact spelling behind a canonical facade.');
  }
}

const invokedDirectly =
  process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) {
  main().catch((error) => {
    console.error(`[size-axis-law-gate] ${error.message}`);
    process.exit(1);
  });
}
