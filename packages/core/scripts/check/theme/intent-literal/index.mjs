#!/usr/bin/env node
/**
 * intent-literal — the single door of `ThemeIntent`, proven on the AST.
 *
 * THE LAW (rubric J.1). A `ThemeIntent` is the only input `resolveTheme`
 * accepts, and `assertThemeIntent` is the only thing that refuses a bogus
 * origin, an unknown vertical or a fifth key. That guarantee is worth exactly
 * as much as the claim "every intent is built by the ingress": a caller that
 * assembles the four fields itself has an intent the ingress never normalised,
 * and F-24 demonstrated the bypass is reachable from outside the package.
 *
 * So this gate asks three mechanical questions of the source:
 *
 *   1. WHERE ARE INTENTS BUILT. An object literal carrying `origin` and
 *      `patch` -- or annotated `ThemeIntent` by `satisfies`/`as` -- is an
 *      intent under construction. Every one must sit inside a declared ingress
 *      producer file. A literal anywhere else is the hand-assembly this door
 *      exists to prevent, wherever in the workspace it is written.
 *   2. IS THE ROSTER STILL THE ROSTER. The declared producers are compared
 *      against what the ingress files actually export, in BOTH directions: a
 *      new door that appears without being declared is as much a defect as a
 *      declared door that has been deleted.
 *   3. IS THE REFUSAL STILL WIRED. `resolveTheme` must call
 *      `assertThemeIntent`. Deleting that one call leaves every test green and
 *      every type correct, and turns the closed unions into documentation.
 *
 * NOT A GREP. The literal walk is a TypeScript AST walk, so a `//` comment or
 * a string that mentions `origin:` is not a finding and a reformatted literal
 * still is one -- the exact pair of failures a textual scan gets wrong in both
 * directions.
 *
 * NO BASELINE. The tree is at zero today. A gate that shipped with a ledger of
 * permitted bypasses would be describing the door as optional.
 *
 * Usage:
 *   node scripts/check/theme/intent-literal/index.mjs            exit 1 on any finding
 *   node scripts/check/theme/intent-literal/index.mjs --json     the measurement
 */

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

import ts from 'typescript';

import { packageRoot as findPackageRoot, repoRoot as findRepoRoot } from '../../../libraries/repo-root/index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const CORE_ROOT = findPackageRoot(HERE);
const REPO_ROOT = findRepoRoot(HERE);

/** The ingress owner, relative to `packages/core`. Its files may build intents. */
export const INGRESS_ROOT = 'src/infrastructure/compilers/runtime/theme/runtime/ingress/presentation';

/**
 * The declared doors, one per transport.
 *
 * Kept as DATA rather than derived from the folder, because the point of the
 * roster is to be the thing a human reviewed: deriving it from the tree would
 * make a fourth door self-approving, which is exactly the state question 2
 * exists to detect.
 */
export const DECLARED_PRODUCERS = Object.freeze([
  { name: 'staticThemeIntent', file: `${INGRESS_ROOT}/static/index.ts`, transport: 'static-vertical' },
  { name: 'documentThemeIntent', file: `${INGRESS_ROOT}/document/index.ts`, transport: 'tenant-document' },
  { name: 'documentThemeAdmission', file: `${INGRESS_ROOT}/document/index.ts`, transport: 'tenant-document' },
  { name: 'previewThemeIntent', file: `${INGRESS_ROOT}/preview/index.ts`, transport: 'preview' },
  { name: 'previewThemeAdmission', file: `${INGRESS_ROOT}/preview/index.ts`, transport: 'preview' },
  { name: 'draftPreviewThemeIntent', file: `${INGRESS_ROOT}/preview/index.ts`, transport: 'preview' },
]);

/** Where `assertThemeIntent` is defined and where it must be called. */
export const RESOLVER_FILE = 'src/infrastructure/compilers/runtime/theme/runtime/resolution/index.ts';
export const GUARD_NAME = 'assertThemeIntent';
export const GUARDED_ENTRY = 'resolveTheme';

/** The workspace source roots scanned. A bypass in the showroom is still a bypass. */
export function scanRoots(repoRoot = REPO_ROOT) {
  return [
    { label: 'packages/core', root: join(repoRoot, 'packages/core/src') },
    { label: 'packages/showroom', root: join(repoRoot, 'packages/showroom/src') },
  ].filter((entry) => existsSync(entry.root));
}

const SKIP_DIRECTORIES = new Set(['tests', '__tests__', 'node_modules', 'fixtures']);

function sourceFiles(root, found = []) {
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const full = join(root, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRECTORIES.has(entry.name)) continue;
      sourceFiles(full, found);
    } else if (/\.tsx?$/u.test(entry.name) && !/\.test\.tsx?$/u.test(entry.name)) {
      found.push(full);
    }
  }
  return found;
}

function parse(file) {
  return ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
}

function propertyNames(node, source) {
  return node.properties
    .filter((property) => property.name)
    .map((property) => property.name.getText(source).replace(/['"]/gu, ''));
}

/**
 * An object literal IS an intent when it carries the two fields no other shape
 * in this tree carries together (`origin` and `patch`), or when it is typed as
 * one. `origin` alone matches an event, `patch` alone matches the ingestion
 * type, and neither is a door.
 */
function isIntentLiteral(node, source) {
  if (!ts.isObjectLiteralExpression(node)) return false;
  const names = propertyNames(node, source);
  if (names.includes('origin') && names.includes('patch')) return true;
  // Parentheses are transparent here on purpose: `({...}) as ThemeIntent` and
  // `{...} as ThemeIntent` are the same construction, and a check that only saw
  // the second would be a bypass documented in its own implementation.
  let parent = node.parent;
  while (parent && ts.isParenthesizedExpression(parent)) parent = parent.parent;
  if (parent && (ts.isAsExpression(parent) || (ts.isSatisfiesExpression?.(parent) ?? false))) {
    return parent.type?.getText(source).trim() === 'ThemeIntent';
  }
  return false;
}

/** Every intent literal in a workspace source root, with its position. */
export function findIntentLiterals(root) {
  const literals = [];
  for (const file of sourceFiles(root)) {
    const text = readFileSync(file, 'utf8');
    if (!text.includes('origin') && !text.includes('ThemeIntent')) continue;
    const source = parse(file);
    const visit = (node) => {
      if (isIntentLiteral(node, source)) {
        const { line } = source.getLineAndCharacterOfPosition(node.getStart(source));
        literals.push({ file, line: line + 1, keys: propertyNames(node, source) });
      }
      ts.forEachChild(node, visit);
    };
    visit(source);
  }
  return literals;
}

/** Exported functions of a file whose declared return type is exactly `ThemeIntent`. */
export function exportedIntentProducers(file) {
  if (!existsSync(file)) return [];
  const source = parse(file);
  const producers = [];
  const returnsIntent = (type) => {
    const text = type?.getText(source).trim();
    return text === 'ThemeIntent' || text === 'ThemeIntent | undefined';
  };
  const buildsIntent = (node) => {
    let found = false;
    const walk = (child) => {
      if (isIntentLiteral(child, source)) found = true;
      ts.forEachChild(child, walk);
    };
    if (node.body) walk(node.body);
    return found;
  };
  const visit = (node) => {
    if (ts.isFunctionDeclaration(node) && node.name) {
      const exported = node.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword);
      if (exported && (returnsIntent(node.type) || buildsIntent(node))) {
        const { line } = source.getLineAndCharacterOfPosition(node.getStart(source));
        producers.push({ name: node.name.text, line: line + 1 });
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return producers;
}

/** Does `resolveTheme` still call the guard? A deleted call is the mutant. */
export function guardIsWired(coreRoot = CORE_ROOT) {
  const file = join(coreRoot, RESOLVER_FILE);
  if (!existsSync(file)) return { defined: false, calledFrom: [], file };
  const source = parse(file);
  let defined = false;
  const calledFrom = [];
  const visit = (node, enclosing) => {
    let scope = enclosing;
    if (ts.isFunctionDeclaration(node) && node.name) {
      scope = node.name.text;
      if (node.name.text === GUARD_NAME) defined = true;
    }
    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === GUARD_NAME) {
      if (scope) calledFrom.push(scope);
    }
    ts.forEachChild(node, (child) => visit(child, scope));
  };
  visit(source, null);
  return { defined, calledFrom, file };
}

export function measure({ coreRoot = CORE_ROOT, repoRoot = REPO_ROOT } = {}) {
  const findings = [];
  const allowed = new Set(DECLARED_PRODUCERS.map((producer) => join(coreRoot, producer.file)));

  const literals = [];
  for (const { label, root } of scanRoots(repoRoot)) {
    for (const literal of findIntentLiterals(root)) {
      literals.push({ ...literal, workspace: label });
      if (!allowed.has(literal.file)) {
        findings.push({
          rule: 'INTENT_LITERAL_OUTSIDE_INGRESS',
          where: `${relative(repoRoot, literal.file)}:${literal.line}`,
          detail: `an intent assembled by hand ({${literal.keys.join(', ')}}) never passes through the ingress `
            + 'normalisation; build it with one of ' + DECLARED_PRODUCERS.map((p) => p.name).join(', '),
        });
      }
    }
  }

  const declaredByFile = new Map();
  for (const producer of DECLARED_PRODUCERS) {
    if (!declaredByFile.has(producer.file)) declaredByFile.set(producer.file, new Set());
    declaredByFile.get(producer.file).add(producer.name);
  }
  const producersFound = [];
  for (const [file, declared] of declaredByFile) {
    const found = exportedIntentProducers(join(coreRoot, file));
    const foundNames = new Set(found.map((entry) => entry.name));
    for (const entry of found) producersFound.push({ ...entry, file });
    for (const name of foundNames) {
      if (!declared.has(name)) {
        findings.push({
          rule: 'UNDECLARED_INGRESS_PRODUCER',
          where: `${file}:${found.find((entry) => entry.name === name).line}`,
          detail: `${name} builds or returns a ThemeIntent and is exported, but the reviewed roster does not `
            + 'name it; a door that adds itself is not a door anybody approved',
        });
      }
    }
    for (const name of declared) {
      if (!foundNames.has(name)) {
        findings.push({
          rule: 'DECLARED_PRODUCER_MISSING',
          where: file,
          detail: `${name} is declared as an ingress door but the file no longer exports it; the roster and the `
            + 'source disagree about what the doors are',
        });
      }
    }
  }

  const guard = guardIsWired(coreRoot);
  if (!guard.defined) {
    findings.push({
      rule: 'GUARD_MISSING',
      where: RESOLVER_FILE,
      detail: `${GUARD_NAME} is not defined; nothing refuses an unknown origin, vertical or extra key`,
    });
  } else if (!guard.calledFrom.includes(GUARDED_ENTRY)) {
    findings.push({
      rule: 'GUARD_NOT_CALLED',
      where: RESOLVER_FILE,
      detail: `${GUARDED_ENTRY} does not call ${GUARD_NAME}; the closed unions become documentation and every `
        + `existing test stays green (called from: ${guard.calledFrom.join(', ') || 'nowhere'})`,
    });
  }

  if (literals.length === 0) {
    findings.push({
      rule: 'VACUOUS_SCAN',
      where: 'src/**',
      detail: 'zero intent literals found anywhere in the workspace — the ingress builds intents, so a scan that '
        + 'finds none has stopped scanning',
    });
  }

  return {
    roots: scanRoots(repoRoot).map((entry) => entry.label),
    literals: literals.map((literal) => ({
      where: `${relative(repoRoot, literal.file)}:${literal.line}`,
      workspace: literal.workspace,
      keys: literal.keys,
    })),
    producers: producersFound,
    guard: { defined: guard.defined, calledFrom: guard.calledFrom },
    findings,
  };
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  const result = measure();
  if (process.argv.includes('--json')) {
    console.log(JSON.stringify(result, null, 2));
  }
  if (result.findings.length > 0) {
    for (const finding of result.findings) {
      console.error(`intent-literal FAIL — ${finding.rule} ${finding.where}\n    ${finding.detail}`);
    }
    process.exit(1);
  }
  console.log(
    `intent-literal OK — ${result.literals.length} intent literal(s), all inside the ingress; `
    + `${result.producers.length} declared door(s); ${GUARDED_ENTRY} calls ${GUARD_NAME}; `
    + `roots: ${result.roots.join(', ')}`,
  );
}
