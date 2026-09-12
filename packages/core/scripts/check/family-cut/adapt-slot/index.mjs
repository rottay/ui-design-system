#!/usr/bin/env node
/**
 * adapt-slot — every layout-sensitive family accepts `adapt` and stamps
 * `data-posture`, on one posture vocabulary.
 *
 * WHO IT MEASURES. The families declared in `LAYOUT_SENSITIVE_FAMILIES`
 * (`src/foundation/contracts/kernel/adaptation`), read from the source with the
 * TypeScript AST, so a row computed at runtime is invisible on purpose. The
 * registry names each family's single owner and the cut that owns adoption.
 *
 * WHAT A FAMILY MUST SHOW, three arms, all measured from its Modern source:
 *
 *   accepts-adapt   a props member named `adapt` typed `Adapt<...>` from the
 *                   shared contract.
 *   stamps-posture  a `data-posture` whose value is computed, not a literal,
 *                   in a family that resolves postures through the shared
 *                   runtime (`useAdaptation` / `postureAttribute`).
 *   one-vocabulary  no posture-named string set of its own outside the
 *                   contract's names.
 *
 * WHY IT IS RED TODAY, BY DESIGN. WO-INV-07 ships the contract, the runtime,
 * the reference implementation on `data-table` and this gate. The other
 * declared families adopt the slot in their own cuts, each of which is not
 * done until this gate is green for it (the family-cut gate enforces that
 * as a BLOCKING arm for a rostered layout-sensitive family). Until then a
 * whole-registry run lists them as findings rather than pretending otherwise.
 *
 * THE CENSUS (`--census`). Every string set under `src` that spells posture
 * names -- a literal union or a string array with two or more viewport names,
 * or a posture-named declaration with two or more container names -- must use
 * only the contract's names. One vocabulary means zero foreign names.
 *
 * Usage:
 *   node scripts/check/family-cut/adapt-slot/index.mjs                     every declared family
 *   node scripts/check/family-cut/adapt-slot/index.mjs --family=data-table one family
 *   node scripts/check/family-cut/adapt-slot/index.mjs --census            the vocabulary census
 *   node scripts/check/family-cut/adapt-slot/index.mjs --json              the measurement
 *
 * Exit 0 = every selected family holds all three arms (or the census counts
 * one vocabulary). Exit 1 = at least one finding.
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import ts from 'typescript';

import { packageRoot as findPackageRoot } from '../../../libraries/repo-root/index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const DEFAULT_ROOT = findPackageRoot(HERE);

export const CONTRACT_ROOT = 'src/foundation/contracts/kernel/adaptation';
export const REGISTRY_SOURCE = `${CONTRACT_ROOT}/composition/families/registry/index.ts`;
export const VOCABULARY_SOURCE = `${CONTRACT_ROOT}/foundation/index.ts`;
export const RUNTIME_MODULE = '@/infrastructure/runtime/adaptation';

/**
 * Names a posture could be spelled with. The contract admits a subset; any
 * other member of a posture set is a second vocabulary.
 */
const VIEWPORT_SPELLINGS = new Set(['phone', 'mobile', 'tablet', 'desktop']);
const CONTAINER_SPELLINGS = new Set(['compact', 'regular', 'standard', 'expanded', 'narrow', 'medium', 'wide']);

const toPosix = (value) => value.split(sep).join('/');

function parse(file) {
  return ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
}

/** `Object.freeze([...] as const satisfies T)` -> the array literal. */
function unwrapToLiteral(node) {
  let current = node;
  for (;;) {
    if (!current) return undefined;
    if (ts.isCallExpression(current) && current.arguments.length === 1) { current = current.arguments[0]; continue; }
    if (ts.isAsExpression(current) || ts.isParenthesizedExpression(current)
      || current.kind === ts.SyntaxKind.SatisfiesExpression) { current = current.expression; continue; }
    return current;
  }
}

function literal(node) {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
  if (ts.isArrayLiteralExpression(node)) return node.elements.map(literal);
  if (ts.isObjectLiteralExpression(node)) {
    const value = {};
    for (const property of node.properties) {
      if (ts.isPropertyAssignment(property)) value[property.name.getText().replace(/['"]/g, '')] = literal(property.initializer);
    }
    return value;
  }
  return undefined;
}

function readExportedArray(file, name) {
  const source = parse(file);
  for (const statement of source.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      if (!ts.isIdentifier(declaration.name) || declaration.name.text !== name) continue;
      const array = unwrapToLiteral(declaration.initializer);
      if (array && ts.isArrayLiteralExpression(array)) return literal(array);
    }
  }
  throw new Error(`adapt-slot: ${toPosix(file)} declares no literal ${name}`);
}

/** The declared layout-sensitive families. */
export function readLayoutSensitiveFamilies(root = DEFAULT_ROOT) {
  return readExportedArray(join(root, REGISTRY_SOURCE), 'LAYOUT_SENSITIVE_FAMILIES');
}

/** The contract's posture names, by axis. */
export function readPostureVocabulary(root = DEFAULT_ROOT) {
  const file = join(root, VOCABULARY_SOURCE);
  return {
    viewport: readExportedArray(file, 'VIEWPORT_POSTURES'),
    container: readExportedArray(file, 'CONTAINER_POSTURES'),
  };
}

function walk(dir, predicate, out = []) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules') continue;
      walk(full, predicate, out);
    } else if (predicate(full)) {
      out.push(full);
    }
  }
  return out;
}

/** Authored Modern-scope source: no tests, stories, fixtures or frozen engines. */
function isAuthoredSource(file) {
  const posix = toPosix(file);
  if (!/\.tsx?$/u.test(posix)) return false;
  if (/\/(?:tests|__snapshots__|fixtures|examples)\//u.test(posix)) return false;
  if (/\.(?:test|spec|stories)\.tsx?$/u.test(posix)) return false;
  if (/\/engines\/(?:classic|rustic)\//u.test(posix)) return false;
  return true;
}

/** The declaration a node belongs to, by name, for posture-context detection. */
function enclosingName(node) {
  for (let current = node.parent; current; current = current.parent) {
    if ((ts.isTypeAliasDeclaration(current) || ts.isVariableDeclaration(current)
      || ts.isPropertySignature(current) || ts.isPropertyDeclaration(current)
      || ts.isParameter(current) || ts.isPropertyAssignment(current)
      || ts.isInterfaceDeclaration(current)) && current.name) {
      return current.name.getText();
    }
    if (ts.isSourceFile(current)) return '';
  }
  return '';
}

/**
 * Every posture-spelling string set in one file.
 *
 * Viewport spellings are unambiguous, so two of them make a set. Container
 * spellings are not (`compact | standard | tall` is a control height), so they
 * make a set only inside a declaration whose name says posture.
 */
export function postureSetsIn(file, source = parse(file)) {
  const sets = [];
  const visit = (node) => {
    let members = null;
    if (ts.isUnionTypeNode(node)) {
      const literals = node.types
        .filter((type) => ts.isLiteralTypeNode(type) && ts.isStringLiteral(type.literal))
        .map((type) => type.literal.text);
      if (literals.length === node.types.length) members = literals;
    } else if (ts.isArrayLiteralExpression(node) && node.elements.length > 1) {
      const literals = node.elements.filter((element) => ts.isStringLiteral(element)).map((element) => element.text);
      if (literals.length === node.elements.length) members = literals;
    }
    if (members) {
      const viewport = members.filter((member) => VIEWPORT_SPELLINGS.has(member));
      const container = members.filter((member) => CONTAINER_SPELLINGS.has(member));
      const postureNamed = /posture/iu.test(enclosingName(node));
      if (viewport.length >= 2 || (container.length >= 2 && postureNamed)) {
        sets.push({
          file,
          line: source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1,
          members,
        });
      }
    }
    if (ts.isJsxAttribute(node) && node.name.getText(source) === 'data-posture' && node.initializer
      && ts.isStringLiteral(node.initializer)) {
      sets.push({
        file,
        line: source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1,
        members: node.initializer.text.split(/\s+/u).filter(Boolean),
        stamped: true,
      });
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return sets;
}

function foreignMembers(set, vocabulary) {
  const admitted = new Set([...vocabulary.viewport, ...vocabulary.container]);
  const spellings = new Set([...VIEWPORT_SPELLINGS, ...CONTAINER_SPELLINGS]);
  return set.members.filter((member) => spellings.has(member) && !admitted.has(member));
}

/** Three arms for one declared family. */
export function measureAdaptSlot(entry, root = DEFAULT_ROOT, vocabulary = readPostureVocabulary(root)) {
  const ownerDir = join(root, entry.owner);
  const exists = existsSync(ownerDir) && statSync(ownerDir).isDirectory();
  const sources = exists ? walk(ownerDir, isAuthoredSource).sort() : [];
  let acceptsAdapt = false;
  let computedPostureStamp = false;
  let resolvesThroughRuntime = false;
  const literalStamps = [];
  const ownVocabulary = [];

  for (const file of sources) {
    const source = parse(file);
    const visit = (node) => {
      if ((ts.isPropertySignature(node) || ts.isPropertyDeclaration(node)) && node.name?.getText(source) === 'adapt'
        && node.type && ts.isTypeReferenceNode(node.type) && node.type.typeName.getText(source) === 'Adapt') {
        acceptsAdapt = true;
      }
      const stampName = ts.isJsxAttribute(node)
        ? node.name.getText(source)
        : ts.isPropertyAssignment(node) ? node.name.getText(source).replace(/['"]/gu, '') : null;
      if (stampName === 'data-posture') {
        const value = ts.isJsxAttribute(node) ? node.initializer : node.initializer;
        if (value && (ts.isStringLiteral(value) || ts.isNoSubstitutionTemplateLiteral(value))) {
          literalStamps.push(`${toPosix(relative(root, file))}:${source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1}`);
        } else if (value) {
          computedPostureStamp = true;
        }
      }
      if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
        const specifier = node.moduleSpecifier.text;
        const names = node.importClause?.namedBindings && ts.isNamedImports(node.importClause.namedBindings)
          ? node.importClause.namedBindings.elements.map((element) => (element.propertyName ?? element.name).text)
          : [];
        if ((specifier === RUNTIME_MODULE && names.includes('useAdaptation'))
          || (specifier.endsWith('contracts/kernel/adaptation') && names.includes('postureAttribute'))) {
          resolvesThroughRuntime = true;
        }
      }
      ts.forEachChild(node, visit);
    };
    visit(source);
    for (const set of postureSetsIn(file, source)) {
      const foreign = foreignMembers(set, vocabulary);
      if (foreign.length > 0) {
        ownVocabulary.push(`${toPosix(relative(root, file))}:${set.line} [${set.members.join('|')}]`);
      }
    }
  }

  const findings = [];
  const label = `${entry.family} (${entry.cut})`;
  if (!exists) findings.push(`${label}: owner ${entry.owner} does not exist -- a declared family resolves to exactly one owner`);
  else if (sources.length === 0) findings.push(`${label}: owner ${entry.owner} has no authored source -- an empty corpus is never a pass`);
  if (exists && !acceptsAdapt) {
    findings.push(`${label}: accepts-adapt -- no props member \`adapt: Adapt<...>\` under ${entry.owner}`);
  }
  if (exists && !(computedPostureStamp && resolvesThroughRuntime)) {
    findings.push(
      `${label}: stamps-posture -- ${computedPostureStamp ? 'stamps `data-posture` but never resolves it through useAdaptation/postureAttribute' : 'stamps no computed `data-posture`'}`,
    );
  }
  for (const stamp of literalStamps) {
    findings.push(`${label}: stamps-posture -- literal \`data-posture\` at ${stamp}; the posture is resolved, never written`);
  }
  for (const set of ownVocabulary) {
    findings.push(`${label}: one-vocabulary -- posture names outside the contract at ${set}`);
  }

  return {
    family: entry.family,
    cut: entry.cut,
    owner: entry.owner,
    sources: sources.length,
    arms: {
      acceptsAdapt,
      stampsPosture: computedPostureStamp && resolvesThroughRuntime && literalStamps.length === 0,
      oneVocabulary: ownVocabulary.length === 0,
    },
    findings,
  };
}

/** The whole-tree vocabulary census. */
export function censusPostureVocabulary(root = DEFAULT_ROOT) {
  const vocabulary = readPostureVocabulary(root);
  const files = walk(join(root, 'src'), isAuthoredSource).sort();
  const sets = [];
  for (const file of files) {
    const text = readFileSync(file, 'utf8');
    if (!/phone|mobile|tablet|desktop|compact|regular|standard|expanded|narrow|medium|wide/u.test(text)) continue;
    for (const set of postureSetsIn(file)) sets.push({ ...set, file: toPosix(relative(root, file)) });
  }
  const foreign = sets
    .map((set) => ({ ...set, foreign: foreignMembers(set, vocabulary) }))
    .filter((set) => set.foreign.length > 0);
  const vocabularies = 1 + new Set(foreign.map((set) => [...new Set(set.members)].sort().join('|'))).size;
  return { vocabulary, sets, foreign, vocabularies };
}

export function collectAdaptSlot({ root = DEFAULT_ROOT, only } = {}) {
  const families = readLayoutSensitiveFamilies(root);
  const vocabulary = readPostureVocabulary(root);
  const selected = only ? families.filter((entry) => entry.family === only) : families;
  const findings = [];
  if (only && selected.length === 0) {
    findings.push(`adapt-slot: ${only} is not a declared layout-sensitive family (${families.map((entry) => entry.family).join(', ')})`);
  }
  const measurements = selected.map((entry) => measureAdaptSlot(entry, root, vocabulary));
  for (const measured of measurements) findings.push(...measured.findings);
  return { families, measurements, findings };
}

function main() {
  const args = process.argv.slice(2);
  const familyArg = args.find((arg) => arg.startsWith('--family='));
  const only = familyArg ? familyArg.slice('--family='.length) : undefined;

  if (args.includes('--census')) {
    const census = censusPostureVocabulary();
    if (args.includes('--json')) {
      console.log(JSON.stringify(census, null, 2));
    } else {
      console.log(`adapt-slot census -- contract: viewport ${census.vocabulary.viewport.join('|')}; container ${census.vocabulary.container.join('|')}`);
      console.log(`adapt-slot census -- ${census.sets.length} posture set(s) under src, ${census.foreign.length} with foreign names`);
      for (const set of census.foreign) {
        console.log(`  FOREIGN ${set.file}:${set.line} [${set.members.join('|')}] -> ${set.foreign.join(', ')}`);
      }
      console.log(`adapt-slot census -- vocabularies = ${census.vocabularies}`);
    }
    process.exit(census.vocabularies === 1 ? 0 : 1);
  }

  const { families, measurements, findings } = collectAdaptSlot({ only });
  if (args.includes('--json')) {
    console.log(JSON.stringify({ families, measurements, findings }, null, 2));
    process.exit(findings.length > 0 ? 1 : 0);
  }
  console.log(`adapt-slot -- declared layout-sensitive families: ${families.map((entry) => `${entry.family} (${entry.cut})`).join(', ')}`);
  for (const measured of measurements) {
    const verdict = measured.findings.length === 0 ? 'OK  ' : 'FAIL';
    const arms = Object.entries(measured.arms).map(([arm, holds]) => `${arm}=${holds ? 'yes' : 'no'}`).join(' ');
    console.log(`adapt-slot ${verdict} ${measured.family}: ${measured.sources} source file(s); ${arms}`);
  }
  if (findings.length > 0) {
    console.error('adapt-slot FAILED:');
    for (const finding of findings) console.error(`  - ${finding}`);
    process.exit(1);
  }
  console.log(`adapt-slot OK -- ${measurements.length} family(ies) expose \`adapt\` and stamp \`data-posture\``);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
