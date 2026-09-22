#!/usr/bin/env node
/**
 * theme-document-version — the retirement of the v2 WRITE, proven on the AST.
 *
 * THE LAW. v3 is the version a row is WRITTEN in; v2 is a version a row is
 * still READ in, forever. Those two facts are easy to state and easy to lose:
 * the way a transport rollout actually stalls is that some producer keeps
 * emitting the old literal, nobody measures it, and "we are on v3" becomes a
 * claim about intent rather than about the tree.
 *
 * So this gate asks three mechanical questions of the source:
 *
 *   1. DOES ANY PRODUCTIVE SOURCE CONSTRUCT A v2 DOCUMENT IN A WRITE POSITION?
 *      A write position is defined narrowly: an ARGUMENT to a persistence or
 *      publish producer. A `satisfies`/`as TenantThemeDocumentV2` annotation on
 *      a value returned into the migrate chain is explicitly NOT one -- reading
 *      and migrating v2 is the whole point of the chain and must stay legal.
 *   2. IS THE MIGRATE CHAIN STILL DECLARED? `migrateDocumentV1ToV2` writes a v2
 *      literal by design: it is the first link of the read path. It is enrolled
 *      in the roster BY NAME with a written reason, so the gate is not red on
 *      day one for the wrong reason -- a day-one-red gate is a fail-open by
 *      exhaustion, because the first thing anyone does with one is widen it.
 *   3. IS THE VERSION FORK STILL WIRED? `admitDocument` must call
 *      `assertSupportedDocumentVersion`. Deleting that one call leaves every
 *      type correct and returns two public doors to a bare `TypeError` that
 *      names neither the version nor the door.
 *
 * NOT A GREP. The walk is a TypeScript AST walk, so a comment or a string that
 * mentions `version: 2` is not a finding and a reformatted literal still is one.
 *
 * Usage:
 *   node scripts/check/theme/document-version/index.mjs          exit 1 on any finding
 *   node scripts/check/theme/document-version/index.mjs --json   the measurement
 */

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

import ts from 'typescript';

import { packageRoot as findPackageRoot, repoRoot as findRepoRoot } from '../../../libraries/repo-root/index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const CORE_ROOT = findPackageRoot(HERE);
const REPO_ROOT = findRepoRoot(HERE);

/** The document contract, which owns the version literals themselves. */
export const CONTRACT_FILE = 'src/contracts/theme/presentation/document/index.ts';

/** Where the fork must be consulted, and the name it is consulted under. */
export const ADMISSION_FILE =
  'src/infrastructure/compilers/runtime/theme/runtime/ingress/runtime/document-v2/presentation/admission/index.ts';
export const FORK_NAME = 'assertSupportedDocumentVersion';
export const FORK_CALLER = 'admitDocument';

/**
 * The producers a v2 literal may NOT be handed to: persistence and publish.
 *
 * Kept as DATA rather than derived, because the point of a roster is to be the
 * thing a human reviewed.
 */
export const WRITE_PRODUCERS = Object.freeze([
  'compileTenantThemeDocumentV2',
  'persistTenantThemeDocument',
  'writeTenantThemeDocument',
]);

/**
 * The declared v2 WRITERS, with the written reason each one is allowed for.
 *
 * `migrateDocumentV1ToV2` is not an exception and does not go to zero: it is a
 * permanent declaration about the READ path. A dated exception list would live
 * here beside it and would go to zero as the last real writer moves; there is
 * none today.
 */
export const DECLARED_V2_WRITERS = Object.freeze([
  {
    name: 'migrateDocumentV1ToV2',
    file: 'src/infrastructure/compilers/runtime/theme/runtime/ingress/runtime/document-v2/foundation/migrate/index.ts',
    reason:
      'the first link of the migrate-on-read chain; its v2 literal is a read-path lift, never a persisted row',
    permanent: true,
  },
]);

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
 * An object literal IS a v2 document when it states `version: 2` beside the two
 * fields no other shape in this tree carries with it (`plan` and `decisions`),
 * or when it is annotated as one.
 */
export function isV2DocumentLiteral(node, source) {
  if (!ts.isObjectLiteralExpression(node)) return false;
  const names = propertyNames(node, source);
  if (names.includes('plan') && names.includes('decisions')) {
    const version = node.properties.find(
      (property) => property.name && property.name.getText(source).replace(/['"]/gu, '') === 'version',
    );
    const text = version?.initializer?.getText(source) ?? '';
    if (text === '2' || /VERSION_V2$/u.test(text)) return true;
  }
  let parent = node.parent;
  while (parent && ts.isParenthesizedExpression(parent)) parent = parent.parent;
  if (parent && (ts.isAsExpression(parent) || (ts.isSatisfiesExpression?.(parent) ?? false))) {
    return parent.type?.getText(source).trim() === 'TenantThemeDocumentV2';
  }
  return false;
}

/**
 * The write position: the literal is an ARGUMENT to a declared producer, either
 * directly or as the `document` property of its single options object.
 */
function writeProducerOf(node, source) {
  let cursor = node.parent;
  let depth = 0;
  while (cursor && depth < 4) {
    if (ts.isCallExpression(cursor)) {
      const callee = cursor.expression.getText(source).split('.').pop();
      return WRITE_PRODUCERS.includes(callee) ? callee : null;
    }
    if (
      !ts.isPropertyAssignment(cursor)
      && !ts.isObjectLiteralExpression(cursor)
      && !ts.isParenthesizedExpression(cursor)
      && !ts.isAsExpression(cursor)
      && !(ts.isSatisfiesExpression?.(cursor) ?? false)
    ) {
      return null;
    }
    cursor = cursor.parent;
    depth += 1;
  }
  return null;
}

/** The enclosing exported function name, for the roster comparison. */
function enclosingFunction(node, source) {
  let cursor = node.parent;
  while (cursor) {
    if ((ts.isFunctionDeclaration(cursor) || ts.isFunctionExpression(cursor)) && cursor.name) {
      return cursor.name.text;
    }
    if (ts.isVariableDeclaration(cursor) && ts.isIdentifier(cursor.name)) return cursor.name.text;
    cursor = cursor.parent;
  }
  return null;
}

export function findV2Literals(root) {
  const literals = [];
  for (const file of sourceFiles(root)) {
    const text = readFileSync(file, 'utf8');
    if (!text.includes('decisions') && !text.includes('TenantThemeDocumentV2')) continue;
    const source = parse(file);
    const visit = (node) => {
      if (isV2DocumentLiteral(node, source)) {
        const { line } = source.getLineAndCharacterOfPosition(node.getStart(source));
        literals.push({
          file,
          line: line + 1,
          producer: writeProducerOf(node, source),
          enclosing: enclosingFunction(node, source),
        });
      }
      ts.forEachChild(node, visit);
    };
    visit(source);
  }
  return literals;
}

/** Does `admitDocument` still call the version fork? A deleted call is the mutant. */
export function forkIsWired(coreRoot = CORE_ROOT) {
  const file = join(coreRoot, ADMISSION_FILE);
  if (!existsSync(file)) return { calledFrom: [], file };
  const source = parse(file);
  const calledFrom = [];
  const visit = (node, enclosing) => {
    let scope = enclosing;
    if (ts.isFunctionDeclaration(node) && node.name) scope = node.name.text;
    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === FORK_NAME) {
      if (scope) calledFrom.push(scope);
    }
    ts.forEachChild(node, (child) => visit(child, scope));
  };
  visit(source, null);
  return { calledFrom, file };
}

/** The versions the contract declares, read off its own literal. */
export function declaredVersions(coreRoot = CORE_ROOT) {
  const file = join(coreRoot, CONTRACT_FILE);
  if (!existsSync(file)) return [];
  const source = parse(file);
  const versions = [];
  const visit = (node) => {
    if (
      ts.isVariableDeclaration(node)
      && ts.isIdentifier(node.name)
      && /^TENANT_THEME_DOCUMENT_VERSION_V\d+$/u.test(node.name.text)
    ) {
      const value = Number(node.initializer?.getText(source).replace(/\s*as const$/u, ''));
      if (Number.isFinite(value)) versions.push(value);
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return versions.sort((left, right) => left - right);
}

export function measure({ coreRoot = CORE_ROOT, repoRoot = REPO_ROOT } = {}) {
  const findings = [];
  const declared = new Map(DECLARED_V2_WRITERS.map((writer) => [writer.name, writer]));

  const literals = [];
  for (const { label, root } of scanRoots(repoRoot)) {
    for (const literal of findV2Literals(root)) {
      const where = `${relative(repoRoot, literal.file)}:${literal.line}`;
      literals.push({ where, workspace: label, producer: literal.producer, enclosing: literal.enclosing });
      if (literal.producer === null) continue;
      if (declared.has(literal.enclosing)) continue;
      findings.push({
        rule: 'V2_LITERAL_IN_WRITE_POSITION',
        where,
        detail: `a v2 document literal is handed to ${literal.producer}; v3 is the version a row is WRITTEN in, and `
          + 'v2 stays a version a row is READ in. Declare it in the roster with a written reason, or write v3',
      });
    }
  }

  for (const writer of DECLARED_V2_WRITERS) {
    const file = join(coreRoot, writer.file);
    const present = existsSync(file)
      && findV2Literals(dirname(file)).some((literal) => literal.enclosing === writer.name);
    if (!present) {
      findings.push({
        rule: 'DECLARED_WRITER_MISSING',
        where: writer.file,
        detail: `${writer.name} is declared as a v2 writer of the read path but no longer writes one; the roster `
          + 'and the source disagree about where the migrate chain starts',
      });
    }
  }

  const versions = declaredVersions(coreRoot);
  if (versions.length < 2 || versions[versions.length - 1] !== 3) {
    findings.push({
      rule: 'VERSION_SET_UNEXPECTED',
      where: CONTRACT_FILE,
      detail: `the contract declares versions [${versions.join(', ')}]; this gate exists because the set is {2, 3}`,
    });
  }

  const fork = forkIsWired(coreRoot);
  if (!fork.calledFrom.includes(FORK_CALLER)) {
    findings.push({
      rule: 'VERSION_FORK_NOT_CALLED',
      where: ADMISSION_FILE,
      detail: `${FORK_CALLER} does not call ${FORK_NAME}; an out-of-set version falls into the v1 branch and two `
        + `public doors crash with a bare TypeError (called from: ${fork.calledFrom.join(', ') || 'nowhere'})`,
    });
  }

  if (literals.length === 0) {
    findings.push({
      rule: 'VACUOUS_SCAN',
      where: 'src/**',
      detail: 'zero v2 document literals found anywhere in the workspace — the migrate chain writes one, so a scan '
        + 'that finds none has stopped scanning',
    });
  }

  return {
    roots: scanRoots(repoRoot).map((entry) => entry.label),
    versions,
    literals,
    declaredWriters: DECLARED_V2_WRITERS.map((writer) => writer.name),
    fork: { calledFrom: fork.calledFrom },
    findings,
  };
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  const result = measure();
  if (process.argv.includes('--json')) console.log(JSON.stringify(result, null, 2));
  if (result.findings.length > 0) {
    for (const finding of result.findings) {
      console.error(`theme-document-version FAIL — ${finding.rule} ${finding.where}\n    ${finding.detail}`);
    }
    process.exit(1);
  }
  console.log(
    `theme-document-version OK — versions {${result.versions.join(', ')}}; ${result.literals.length} v2 literal(s), `
    + `none in a write position; ${result.declaredWriters.length} declared read-path writer(s); `
    + `${FORK_CALLER} calls ${FORK_NAME}; roots: ${result.roots.join(', ')}`,
  );
}
