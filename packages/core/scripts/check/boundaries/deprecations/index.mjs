#!/usr/bin/env node
/**
 * deprecations — every `@deprecated` marker in `src/` has exactly one ledger
 * row, and every row still tells the truth.
 *
 * THE SUBJECT. A `@deprecated` tag is a promise with no date and no owner: the
 * symbol stays published, nothing says who removes it, and a count of tags can
 * only go down by deleting things or up by nobody noticing. The ledger at
 * `contracts/package/deprecations/index.json` gives each marker a class, a
 * reason, a replacement, a release line, a receiver work order and evidence;
 * this gate compares the ledger against the tree in both directions and
 * re-verifies each row's claims on every run.
 *
 * NOT A BASELINE. There is no write or seed mode, no count ceiling and no
 * wildcard row. A row is keyed by one file and one anchor; a marker the ledger
 * does not name is red, and so is a row whose marker is gone.
 *
 * WHAT IS RED
 *   - a marker without a row, a row without a marker, a duplicate row;
 *   - a `@deprecated` outside a comment (a string literal is not a marker and is
 *     not skipped), in a file that cannot be parsed, or not anchored to a
 *     declaration, a member or a union literal;
 *   - a class or a blocker outside the closed lists, an unknown key, a glob;
 *   - an empty or vague reason; an empty scope or replacement;
 *   - a receiver that is not a work order, is `done`, or is named by
 *     `--assume-done=<WO>`;
 *   - a `debt` row whose receiver is not an open work order of lane `retire`,
 *     or is listed in `noDebtReceivers`;
 *   - a codemod id that is malformed, or absent from the codemod map;
 *   - a `direction-semantics:<fixture>` or `parity-failed:<fixture>` blocker
 *     whose fixture is not a directory of the codemod suite carrying an
 *     `expected` tree or named by one of the suite's `*.test.mjs`;
 *   - a non-`debt` row without a blocker, without a canonical owner, or without
 *     evidence that verifies: a frozen-engine implementer that still reads the
 *     legacy name and not the replacement, a persisted-data reader, a consumer;
 *   - `replacement-capability-absent:<name>` while `<name>` is an identifier of
 *     the canonical owner;
 *   - a row newer than `sealedAt` without a changeset that names the symbol;
 *   - a `removeIn` release line the package version has already reached;
 *
 * WHAT `--assume-done=<WO>` ADDS (the closure candidate). Re-homing every row to
 * another open work order must not close anything, so in this mode:
 *   - any `debt` row is red whatever its receiver: debt is retired, never
 *     transferred;
 *   - a non-`debt` row's receiver must be listed in `compatReceivers`;
 *   - a non-`debt` row needs a codemod id that the codemod map was actually
 *     asked about; a shape-only check, a missing map or a kit that fails to
 *     load is red;
 *   - `parity-unproven` is red: a verdict still owed cannot cross a closure.
 *
 * WHAT THIS GATE CANNOT SEE. It scans for the literal tag. A reworded comment
 * (`Deprecated:` with no tag, `@Deprecated`) is not a marker here, and neither
 * is a symbol whose tag was deleted while the legacy symbol stayed published;
 * the guards for those are the contract-changeset gate and review. A row's
 * `since` is authored, so a new marker can be back-dated past `sealedAt`.
 * Evidence under a sibling application that is not checked out (CI) is
 * reported as unverified and still satisfies the row.
 *
 * WHAT IS REPORTED AND NEVER A PASS. `receiverPhaseLocked` per row, so a
 * transfer to a locked work order cannot look actionable; evidence in a sibling
 * checkout that is not present; codemod ids the map could not be asked about.
 *
 * `--consumers` asks whether each `compat-consumed` row still has a
 * design-system-resolved use in the four consumer roots. The resolver is an
 * interface (`loadConsumerResolver`); while none is wired the flag fails
 * closed rather than reporting green.
 *
 * Usage: node scripts/check/boundaries/deprecations/index.mjs --check
 *          [--assume-done=<WO>[,<WO>]] [--consumers] [--json]
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import ts from 'typescript';

import {
  packageRoot as findPackageRoot,
  repoRoot as findRepoRoot,
} from '../../../libraries/repo-root/index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));

export const LEDGER_PATH = 'contracts/package/deprecations/index.json';
export const REGISTRY_PATH = 'roadmap/registry.json';
export const GATES_MANIFEST_PATH = 'scripts/check/automation/gates/manifest/index.mjs';
export const CODEMOD_MAP_PATH = 'scripts/maintain/codemods/maps/3.0/index.json';
export const CODEMOD_KIT_PATH = 'scripts/maintain/codemods/index.mjs';
export const CODEMOD_FIXTURES_PATH = 'scripts/maintain/codemods/fixtures';
export const CODEMOD_TESTS_PATH = 'scripts/maintain/codemods/tests';
export const MARKER = '@deprecated';
export const DEBT_LANE = 'retire';

export const CLASSES = Object.freeze([
  'debt',
  'compat-consumed',
  'compat-frozen-sole-implementer',
  'compat-canon-pending',
  'compat-persisted-data',
]);

/**
 * The blockers a non-`debt` row may name. A member ending in `:` takes an
 * argument: an identifier for `replacement-capability-absent`, a fixture of the
 * codemod suite for the two parity verdicts. `parity-unproven` is the state of
 * a consumed row before its verdict exists; it is refused under
 * `--assume-done`.
 */
export const BLOCKERS = Object.freeze([
  'frozen-equivalence-absent',
  'replacement-capability-absent:',
  'persisted-data-unproven',
  'direction-semantics:',
  'parity-failed:',
  'parity-unproven',
]);
const FIXTURE_BLOCKERS = new Set(['direction-semantics:', 'parity-failed:']);

const BLOCKERS_BY_CLASS = Object.freeze({
  'compat-consumed': ['parity-unproven', 'parity-failed:', 'direction-semantics:', 'replacement-capability-absent:'],
  'compat-frozen-sole-implementer': ['frozen-equivalence-absent'],
  'compat-canon-pending': ['replacement-capability-absent:'],
  'compat-persisted-data': ['persisted-data-unproven'],
});

const REQUIRED_EVIDENCE_BY_CLASS = Object.freeze({
  'compat-consumed': 'consumer',
  'compat-frozen-sole-implementer': 'frozen-implementer',
  'compat-persisted-data': 'persisted-reader',
});

export const EVIDENCE_KINDS = Object.freeze({
  consumer: ['kind', 'path', 'needle', 'note'],
  'frozen-implementer': ['kind', 'path', 'needle', 'absentNeedle', 'note'],
  'persisted-reader': ['kind', 'path', 'needle', 'note'],
  gate: ['kind', 'id', 'note'],
  'census-receipt': ['kind', 'path', 'needle', 'note'],
});

export const HEADER_KEYS = Object.freeze(['schema', 'sealedAt', 'noDebtReceivers', 'compatReceivers', 'notes', 'rows']);
export const ROW_KEYS = Object.freeze([
  'file', 'anchor', 'class', 'reason', 'scope', 'replacement', 'canonicalOwner', 'blocker',
  'receiver', 'since', 'removeIn', 'evidence', 'codemod', 'changeset',
]);

const SOURCE_EXTENSIONS = new Set(['.ts', '.tsx', '.mts', '.cts', '.js', '.jsx', '.mjs', '.cjs']);
const TEST_FILE = /\.(test|spec)\.[cm]?[jt]sx?$/;
const FROZEN_ENGINE = /\/engines\/(classic|rustic)\//;
const GLOB = /[*?[\]{}]/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const RELEASE_LINE = /^(\d+)\.(\d+)$/;
const WORK_ORDER = /^WO-[A-Z]+-\d+$/;
// The id grammar of the codemod kit (`parseEntryId`): a subpath entry spells its symbol `*`.
const CODEMOD_ID =
  /^[a-z][a-z-]*\/\.(?:\/[A-Za-z0-9._*-]+)*#(?:[A-Za-z_$*][\w$]*|\*)(?:\.[\w$-]+)?$/;

const VAGUE_WORDS = new Set([
  'a', 'alias', 'an', 'and', 'api', 'as', 'back', 'backward', 'backwards', 'be', 'because', 'been',
  'being', 'compat', 'compatibility', 'compatible', 'deprecated', 'deprecation', 'for', 'future',
  'historical', 'in', 'is', 'it', 'its', 'keep', 'kept', 'later', 'legacy', 'maintained', 'n/a',
  'na', 'none', 'now', 'of', 'old', 'on', 'pending', 'reason', 'reasons', 'remain', 'remains',
  'removal', 'remove', 'removed', 'retained', 'some', 'soon', 'still', 'support', 'supported',
  'tbd', 'temporary', 'that', 'the', 'this', 'time', 'to', 'todo', 'transitional', 'until',
  'unknown', 'use', 'used', 'was', 'we', 'will', 'with',
]);
const MIN_REASON_WORDS = 6;
const MIN_CONCRETE_WORDS = 4;

// ---------------------------------------------------------------------------
// Scanner
// ---------------------------------------------------------------------------

function walkFiles(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === 'dist') continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walkFiles(full, out);
    else if (entry.isFile()) out.push(full);
  }
  return out;
}

function extensionOf(file) {
  const match = /\.[A-Za-z]+$/.exec(file);
  return match ? match[0] : '';
}

function occurrencesOf(text, needle) {
  const found = [];
  for (let at = text.indexOf(needle); at !== -1; at = text.indexOf(needle, at + needle.length)) {
    found.push(at);
  }
  return found;
}

function propertyNameText(name) {
  if (!name) return null;
  if (ts.isIdentifier(name) || ts.isPrivateIdentifier(name)) return name.text;
  if (ts.isStringLiteralLike(name) || ts.isNumericLiteral(name)) return name.text;
  return null;
}

/** The name one ancestor contributes to an anchor, or null when it has none. */
function segmentOf(node) {
  if (ts.isLiteralTypeNode(node)) {
    const literal = node.literal;
    if (ts.isStringLiteralLike(literal)) return `'${literal.text}'`;
    return literal.getText();
  }
  if (
    ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node) || ts.isClassDeclaration(node)
    || ts.isFunctionDeclaration(node) || ts.isEnumDeclaration(node) || ts.isModuleDeclaration(node)
  ) {
    return node.name ? node.name.text : null;
  }
  if (ts.isVariableStatement(node)) {
    const names = node.declarationList.declarations.map((declaration) => propertyNameText(declaration.name));
    return names.every(Boolean) ? names.join('+') : null;
  }
  if (ts.isVariableDeclaration(node)) return propertyNameText(node.name);
  if (
    ts.isPropertySignature(node) || ts.isMethodSignature(node) || ts.isPropertyDeclaration(node)
    || ts.isMethodDeclaration(node) || ts.isPropertyAssignment(node) || ts.isEnumMember(node)
    || ts.isShorthandPropertyAssignment(node) || ts.isGetAccessorDeclaration(node)
    || ts.isSetAccessorDeclaration(node)
  ) {
    return propertyNameText(node.name);
  }
  if (ts.isExportSpecifier(node)) return node.name.text;
  return null;
}

function isAnchorable(node) {
  return (
    ts.isLiteralTypeNode(node) || ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node)
    || ts.isClassDeclaration(node) || ts.isFunctionDeclaration(node) || ts.isEnumDeclaration(node)
    || ts.isModuleDeclaration(node) || ts.isVariableStatement(node) || ts.isPropertySignature(node)
    || ts.isMethodSignature(node) || ts.isPropertyDeclaration(node) || ts.isMethodDeclaration(node)
    || ts.isPropertyAssignment(node) || ts.isShorthandPropertyAssignment(node) || ts.isEnumMember(node)
    || ts.isGetAccessorDeclaration(node) || ts.isSetAccessorDeclaration(node) || ts.isExportSpecifier(node)
  );
}

/**
 * The anchor of the declaration a comment precedes: the names of the anchored
 * node and of every named ancestor, outermost first, joined by `.`. A comment
 * that precedes the first statement or an import documents the module itself
 * and anchors to `<module>`.
 */
function anchorOf(token, sourceFile) {
  const start = token.getStart(sourceFile);
  let anchored = null;
  for (let node = token; node && !ts.isSourceFile(node); node = node.parent) {
    if (node.getStart(sourceFile) !== start) break;
    if (isAnchorable(node)) { anchored = node; break; }
  }
  if (!anchored) {
    const heads = sourceFile.statements.filter(
      (statement, index) => index === 0 || ts.isImportDeclaration(statement),
    );
    return heads.some((statement) => statement.getStart(sourceFile) === start) ? '<module>' : null;
  }
  const segments = [];
  for (let node = anchored; node && !ts.isSourceFile(node); node = node.parent) {
    if (ts.isVariableDeclaration(node) || ts.isVariableDeclarationList(node)) continue;
    const segment = node === anchored || isAnchorable(node) ? segmentOf(node) : null;
    if (node === anchored && segment === null) return null;
    if (segment !== null) segments.unshift(segment);
  }
  return segments.join('.');
}

/** Every comment range of a file, with the token each leading comment precedes. */
function commentRangesOf(sourceFile) {
  const text = sourceFile.text;
  const ranges = new Map();
  const tokens = [];
  const visit = (node) => {
    if (node.kind >= ts.SyntaxKind.FirstJSDocNode && node.kind <= ts.SyntaxKind.LastJSDocNode) return;
    const children = node.getChildren(sourceFile);
    if (children.length > 0) {
      for (const child of children) visit(child);
      return;
    }
    tokens.push(node);
    for (const range of ts.getLeadingCommentRanges(text, node.getFullStart()) ?? []) {
      if (!ranges.has(range.pos)) ranges.set(range.pos, { ...range, leadingOf: tokens.length - 1 });
    }
    for (const range of ts.getTrailingCommentRanges(text, node.getEnd()) ?? []) {
      if (!ranges.has(range.pos)) ranges.set(range.pos, { ...range, leadingOf: null });
    }
  };
  visit(sourceFile);
  return { ranges: [...ranges.values()], tokens };
}

function scanFile(text, file) {
  const markers = [];
  const problems = [];
  const offsets = occurrencesOf(text, MARKER);
  const scriptKind = /\.[cm]?[jt]sx$/.test(file) ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const sourceFile = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, scriptKind);
  const { ranges, tokens } = commentRangesOf(sourceFile);
  for (const offset of offsets) {
    const line = sourceFile.getLineAndCharacterOfPosition(offset).line + 1;
    const range = ranges.find((candidate) => candidate.pos <= offset && offset < candidate.end);
    if (!range) {
      problems.push(
        `${file}:${line}: \`${MARKER}\` outside a comment (a string literal or template text is not a marker; `
        + 'spell it differently or remove it)',
      );
      continue;
    }
    let index = range.leadingOf;
    while (index !== null && tokens[index]?.kind === ts.SyntaxKind.BarToken) index += 1;
    const token = index === null ? null : tokens[index] ?? null;
    const anchor = token ? anchorOf(token, sourceFile) : null;
    if (!anchor) {
      problems.push(
        `${file}:${line}: \`${MARKER}\` is not anchored to a declaration, a member or a union literal `
        + '(a trailing or free-floating comment cannot be ledgered)',
      );
      continue;
    }
    markers.push({ file, anchor, line });
  }
  return { markers, problems, raw: offsets.length };
}

/**
 * Every marker under `src/`. Files named `*.test.*` or `*.spec.*` are counted
 * and reported but not ledgered: a test is not public API. A file that merely
 * sits under a `tests/` folder is scanned like any other. Any other file that carries the
 * substring is either anchored or a problem; nothing is skipped silently.
 */
export function scanMarkers(packageRoot) {
  const sourceRoot = join(packageRoot, 'src');
  const markers = [];
  const problems = [];
  let raw = 0;
  let testFileOccurrences = 0;
  if (!existsSync(sourceRoot)) {
    return { markers, problems: [`${sourceRoot} does not exist`], raw, testFileOccurrences };
  }
  for (const full of walkFiles(sourceRoot).sort()) {
    const text = readFileSync(full, 'utf8');
    if (!text.includes(MARKER)) continue;
    const file = relative(packageRoot, full).split(sep).join('/');
    if (TEST_FILE.test(file)) {
      testFileOccurrences += occurrencesOf(text, MARKER).length;
      continue;
    }
    if (!SOURCE_EXTENSIONS.has(extensionOf(file))) {
      const count = occurrencesOf(text, MARKER).length;
      raw += count;
      problems.push(`${file}: ${count} \`${MARKER}\` occurrence(s) in a file the scanner cannot anchor`);
      continue;
    }
    const scanned = scanFile(text, file);
    raw += scanned.raw;
    markers.push(...scanned.markers);
    problems.push(...scanned.problems);
  }
  const seen = new Map();
  for (const marker of markers) {
    const key = rowKey(marker);
    if (seen.has(key)) {
      problems.push(
        `${marker.file}:${marker.line}: second \`${MARKER}\` on \`${marker.anchor}\` `
        + `(first at line ${seen.get(key)}); one declaration carries one marker`,
      );
    } else {
      seen.set(key, marker.line);
    }
  }
  return { markers, problems, raw, testFileOccurrences };
}

// ---------------------------------------------------------------------------
// Inputs
// ---------------------------------------------------------------------------

export function rowKey(row) {
  return `${row.file}#${row.anchor}`;
}

function readJson(path) {
  if (!existsSync(path)) return { value: null, error: `${path} does not exist` };
  try {
    return { value: JSON.parse(readFileSync(path, 'utf8')), error: null };
  } catch (error) {
    return { value: null, error: `${path} is not valid JSON: ${error.message}` };
  }
}

export function measure({ packageRoot, repoRoot }) {
  const ledger = readJson(join(packageRoot, LEDGER_PATH));
  const registry = readJson(join(repoRoot, REGISTRY_PATH));
  const pkg = readJson(join(packageRoot, 'package.json'));
  const manifestPath = join(packageRoot, GATES_MANIFEST_PATH);
  return {
    packageRoot,
    repoRoot,
    scan: scanMarkers(packageRoot),
    ledger: ledger.value,
    ledgerError: ledger.error,
    registry: registry.value,
    registryError: registry.error,
    version: pkg.value?.version ?? null,
    gatesManifest: existsSync(manifestPath) ? readFileSync(manifestPath, 'utf8') : null,
  };
}

// ---------------------------------------------------------------------------
// Row checks
// ---------------------------------------------------------------------------

function isText(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

/** Why a reason says nothing, or null when it says something. */
export function reasonProblem(reason) {
  if (!isText(reason)) return 'reason is empty';
  const words = reason.toLowerCase().split(/[^a-z0-9/'`_-]+/).filter(Boolean);
  if (words.length < MIN_REASON_WORDS) {
    return `reason is vague: ${words.length} word(s), at least ${MIN_REASON_WORDS} are required`;
  }
  const concrete = new Set(words.map((word) => word.replace(/[`']/g, '')).filter((word) => word && !VAGUE_WORDS.has(word)));
  if (concrete.size < MIN_CONCRETE_WORDS) {
    return (
      `reason is vague: only ${concrete.size} word(s) beyond stock phrasing `
      + `(${[...concrete].join(', ') || 'none'}); say what keeps the symbol published`
    );
  }
  return null;
}

function blockerShape(blocker) {
  if (!isText(blocker)) return null;
  for (const member of BLOCKERS) {
    if (member.endsWith(':')) {
      if (blocker.startsWith(member) && blocker.length > member.length) {
        return { id: member, argument: blocker.slice(member.length) };
      }
    } else if (blocker === member) {
      return { id: member, argument: null };
    }
  }
  return null;
}

/** Whether `name` is an identifier of the file: an export, a member, a binding or a read. */
export function identifierResolves(text, file, name) {
  const scriptKind = /\.[cm]?[jt]sx$/.test(file) ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const sourceFile = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, scriptKind);
  let found = false;
  const visit = (node) => {
    if (found) return;
    if (ts.isIdentifier(node) && node.text === name) { found = true; return; }
    if (
      ts.isStringLiteralLike(node) && node.text === name && node.parent
      && (ts.isPropertySignature(node.parent) || ts.isPropertyAssignment(node.parent)
        || ts.isElementAccessExpression(node.parent))
    ) {
      found = true;
      return;
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return found;
}

function evidencePathProblem(path) {
  if (!isText(path)) return 'path is empty';
  if (path.startsWith('/') || /^[A-Za-z]:/.test(path)) return `path \`${path}\` is absolute`;
  if (GLOB.test(path)) return `path \`${path}\` is a glob`;
  const parts = path.split('/');
  const climbs = parts.filter((part) => part === '..').length;
  if (climbs > 1 || (climbs === 1 && parts[0] !== '..')) return `path \`${path}\` leaves the workspace`;
  return null;
}

/**
 * One evidence entry, verified against the tree.
 * Returns `{ problems, verified, unverified }`: an entry in a sibling checkout
 * that is not present is neither a problem nor a verification.
 */
function verifyEvidence(entry, row, context) {
  const problems = [];
  if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
    return { problems: ['evidence entry is not an object'], verified: false, unverified: false };
  }
  const allowed = EVIDENCE_KINDS[entry.kind];
  if (!allowed) {
    return {
      problems: [`evidence kind \`${entry.kind}\` is not one of ${Object.keys(EVIDENCE_KINDS).join(', ')}`],
      verified: false,
      unverified: false,
    };
  }
  for (const key of Object.keys(entry)) {
    if (!allowed.includes(key)) problems.push(`evidence \`${entry.kind}\` has an unknown key \`${key}\``);
  }
  if (entry.kind === 'gate') {
    if (!isText(entry.id)) problems.push('evidence `gate` names no gate id');
    else if (context.gatesManifest === null) problems.push('evidence `gate`: the gates manifest is missing');
    else if (!new RegExp(`\\bid:\\s*['"]${entry.id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`).test(context.gatesManifest)) {
      problems.push(`evidence \`gate\`: no gate \`${entry.id}\` in ${GATES_MANIFEST_PATH}`);
    }
    return { problems, verified: problems.length === 0, unverified: false };
  }
  const pathProblem = evidencePathProblem(entry.path);
  if (pathProblem) {
    problems.push(`evidence \`${entry.kind}\`: ${pathProblem}`);
    return { problems, verified: false, unverified: false };
  }
  const needleRequired = entry.kind !== 'census-receipt';
  if (needleRequired && (!isText(entry.needle) || entry.needle.trim().length < 3)) {
    problems.push(`evidence \`${entry.kind}\` at ${entry.path}: needle is missing or shorter than three characters`);
  }
  if (entry.kind === 'census-receipt' && !isText(entry.note)) {
    problems.push(`evidence \`census-receipt\` at ${entry.path}: note must say what was measured and what was not`);
  }
  if (entry.kind === 'frozen-implementer') {
    if (!FROZEN_ENGINE.test(`/${entry.path}`)) {
      problems.push(`evidence \`frozen-implementer\`: ${entry.path} is not under engines/classic or engines/rustic`);
    }
    if (!isText(entry.absentNeedle)) {
      problems.push(`evidence \`frozen-implementer\` at ${entry.path}: absentNeedle (the replacement the engine does not read) is missing`);
    }
  }
  if (entry.kind === 'consumer') {
    if (entry.path === `packages/core/${row.file}`) {
      problems.push(`evidence \`consumer\`: ${entry.path} is the file that declares the marker, not a consumer`);
    }
    if (entry.path.startsWith('packages/core/scripts/')) {
      problems.push(`evidence \`consumer\`: ${entry.path} is tooling, not a consumer`);
    }
  }
  if (problems.length > 0) return { problems, verified: false, unverified: false };

  const sibling = entry.path.startsWith('../');
  if (sibling && !existsSync(resolve(context.repoRoot, entry.path.split('/').slice(0, 2).join('/')))) {
    return { problems, verified: false, unverified: true };
  }
  const full = resolve(context.repoRoot, entry.path);
  if (!existsSync(full) || !statSync(full).isFile()) {
    problems.push(`evidence \`${entry.kind}\`: ${entry.path} does not exist`);
    return { problems, verified: false, unverified: false };
  }
  const text = readFileSync(full, 'utf8');
  if (isText(entry.needle) && !text.includes(entry.needle)) {
    problems.push(`evidence \`${entry.kind}\`: ${entry.path} no longer contains \`${entry.needle}\``);
  }
  if (entry.kind === 'frozen-implementer' && text.includes(entry.absentNeedle)) {
    problems.push(
      `evidence \`frozen-implementer\`: ${entry.path} now contains \`${entry.absentNeedle}\`; `
      + 'the frozen engine reads the replacement, so the sole-implementer claim no longer holds',
    );
  }
  return { problems, verified: problems.length === 0, unverified: false };
}

/** Whether an id has the grammar of the codemod kit. */
export function codemodIdProblem(id) {
  if (CODEMOD_ID.test(id)) return null;
  return (
    `codemod id \`${id}\` is not of the form <class>/<subpath>#<symbol>[.<member>] `
    + '(for example `prop-removed/.#StepperProps.initial`)'
  );
}

/**
 * The lookup into the codemod map of one package: `{ status: 'wired', has }`,
 * or `{ status: 'unavailable', reason }` when the map is missing, or the kit or
 * the map fails to load. The kit is imported lazily and never trusted to load.
 */
export async function loadCodemodLookup({ packageRoot }) {
  const mapPath = join(packageRoot, CODEMOD_MAP_PATH);
  if (!existsSync(mapPath)) return { status: 'unavailable', reason: `${CODEMOD_MAP_PATH} does not exist` };
  try {
    const kit = await import(pathToFileURL(join(findPackageRoot(HERE), CODEMOD_KIT_PATH)).href);
    if (typeof kit.loadMap !== 'function') throw new Error('the kit exports no loadMap');
    const map = kit.loadMap(mapPath);
    if (!(map?.byId instanceof Map)) throw new Error('loadMap returned no id index');
    return { status: 'wired', has: (id) => map.byId.has(id) };
  } catch (error) {
    return { status: 'unavailable', reason: `the codemod map could not be loaded: ${error.message}` };
  }
}

/** Whether a fixture of the codemod suite carries a verdict: an `expected` tree, or a suite test that names it. */
export function fixtureVerdict(packageRoot, fixture) {
  if (!isText(fixture) || GLOB.test(fixture) || fixture.split('/').some((part) => part === '..' || part === '' || part === '.')) {
    return `\`${fixture}\` is not a fixture path of ${CODEMOD_FIXTURES_PATH}`;
  }
  const directory = join(packageRoot, CODEMOD_FIXTURES_PATH, fixture);
  if (!existsSync(directory) || !statSync(directory).isDirectory()) {
    return `no fixture directory at ${CODEMOD_FIXTURES_PATH}/${fixture}`;
  }
  const expected = join(directory, 'expected');
  if (existsSync(expected) && statSync(expected).isDirectory() && readdirSync(expected).length > 0) return null;
  const tests = join(packageRoot, CODEMOD_TESTS_PATH);
  const named = existsSync(tests)
    && walkFiles(tests).some((file) => file.endsWith('.test.mjs') && readFileSync(file, 'utf8').includes(fixture));
  if (named) return null;
  return (
    `fixture ${CODEMOD_FIXTURES_PATH}/${fixture} carries no verdict: it has no \`expected\` tree `
    + `and no *.test.mjs under ${CODEMOD_TESTS_PATH} names it`
  );
}

/**
 * The consumer resolver behind `--consumers`: `(row) => { uses, roots }`, where
 * `uses` counts design-system-resolved uses of the row's symbol across the
 * four consumer roots. None is wired yet, so this returns null and the flag
 * fails closed.
 */
export async function loadConsumerResolver() {
  return null;
}

function releaseLineOf(text) {
  const match = RELEASE_LINE.exec(text ?? '');
  return match ? [Number(match[1]), Number(match[2])] : null;
}

function versionLineOf(version) {
  const match = /^(\d+)\.(\d+)\./.exec(version ?? '');
  return match ? [Number(match[1]), Number(match[2])] : null;
}

function isLater(line, than) {
  return line[0] > than[0] || (line[0] === than[0] && line[1] > than[1]);
}

function phaseLocked(workOrder, registry) {
  if (!workOrder?.phase) return false;
  for (const program of workOrder.programs ?? []) {
    const control = registry.traceability?.[program]?.phaseControls?.[workOrder.phase];
    if (control?.claimState === 'locked') return true;
  }
  return false;
}

function symbolOf(row) {
  const last = row.anchor.split('.').at(-1) ?? row.anchor;
  return last.replace(/^'|'$/g, '');
}

function checkRow(row, context, report) {
  const problems = [];
  const { registry, assumeDone, noDebtReceivers, compatReceivers, sealedAt, version, codemods } = context;
  const closing = assumeDone.length > 0;

  if (!CLASSES.includes(row.class)) {
    problems.push(`class \`${row.class}\` is not one of ${CLASSES.join(', ')}`);
  }
  const vague = reasonProblem(row.reason);
  if (vague) problems.push(vague);
  if (!isText(row.scope)) problems.push('scope is empty');
  if (!isText(row.replacement)) {
    problems.push('replacement is empty; name it, or write `none: <why no replacement exists>`');
  } else if (/^none\b/i.test(row.replacement) && !/^none: \S.{10,}/.test(row.replacement)) {
    problems.push('replacement `none` must say why: `none: <why no replacement exists>`');
  }
  if (!ISO_DATE.test(row.since ?? '')) problems.push(`since \`${row.since}\` is not a YYYY-MM-DD date`);

  const removeIn = releaseLineOf(row.removeIn);
  const current = versionLineOf(version);
  if (!removeIn) problems.push(`removeIn \`${row.removeIn}\` is not a release line (for example \`3.0\`)`);
  else if (!current) problems.push('package.json carries no readable version to compare removeIn against');
  else if (!isLater(removeIn, current)) {
    problems.push(`removeIn \`${row.removeIn}\` is not later than the package version ${version}: the removal is overdue`);
  }

  // Receiver.
  const workOrder = registry?.workOrders?.find((candidate) => candidate.id === row.receiver) ?? null;
  if (!isText(row.receiver) || !WORK_ORDER.test(row.receiver)) {
    problems.push(`receiver \`${row.receiver}\` is not a work order id`);
  } else if (!workOrder) {
    problems.push(`receiver ${row.receiver} is not a work order of ${REGISTRY_PATH}`);
  } else if (workOrder.status === 'done') {
    problems.push(`receiver ${row.receiver} is done; a closed work order receives nothing`);
  } else if (assumeDone.includes(row.receiver)) {
    problems.push(`receiver ${row.receiver} is assumed done (--assume-done); the row must be retired or re-homed before it closes`);
  } else if (phaseLocked(workOrder, registry)) {
    report.receiverPhaseLocked.push({ row: rowKey(row), receiver: row.receiver, phase: workOrder.phase });
  }

  if (row.class === 'debt') {
    if (workOrder && workOrder.lane !== DEBT_LANE) {
      problems.push(`debt row names ${row.receiver} of lane \`${workOrder.lane}\`; debt is retired by an open work order of lane \`${DEBT_LANE}\``);
    }
    if (noDebtReceivers.includes(row.receiver)) {
      problems.push(`debt row names ${row.receiver}, which the ledger lists in noDebtReceivers`);
    }
    if (row.blocker !== null) problems.push('debt row carries a blocker; debt has no reason to stay');
    if (closing) problems.push('debt cannot cross a closure (--assume-done): retire the symbol, a transfer does not settle it');
  } else if (closing && CLASSES.includes(row.class) && !compatReceivers.includes(row.receiver)) {
    problems.push(
      `under --assume-done the receiver of a ${row.class} row must be listed in compatReceivers; `
      + `${row.receiver} is not (${compatReceivers.join(', ') || 'the list is empty'})`,
    );
  }

  // Evidence.
  const evidence = Array.isArray(row.evidence) ? row.evidence : null;
  if (!evidence) problems.push('evidence is not an array');
  const verifiedKinds = new Set();
  const unverifiedKinds = new Set();
  for (const entry of evidence ?? []) {
    const result = verifyEvidence(entry, row, context);
    problems.push(...result.problems);
    if (result.verified) verifiedKinds.add(entry.kind);
    if (result.unverified) {
      unverifiedKinds.add(entry.kind);
      report.unverifiedEvidence.push({ row: rowKey(row), kind: entry.kind, path: entry.path });
    }
  }

  if (CLASSES.includes(row.class) && row.class !== 'debt') {
    if (evidence && evidence.length === 0) problems.push(`${row.class} row has no evidence`);
    const required = REQUIRED_EVIDENCE_BY_CLASS[row.class];
    if (required && evidence && evidence.length > 0 && !verifiedKinds.has(required) && !unverifiedKinds.has(required)) {
      problems.push(`${row.class} row has no verified \`${required}\` evidence`);
    }
    const blocker = blockerShape(row.blocker);
    if (!isText(row.blocker)) {
      problems.push(`${row.class} row has no blocker`);
    } else if (!blocker) {
      problems.push(`blocker \`${row.blocker}\` is not one of ${BLOCKERS.map((member) => (member.endsWith(':') ? `${member}<name>` : member)).join(', ')}`);
    } else if (!BLOCKERS_BY_CLASS[row.class].includes(blocker.id)) {
      problems.push(`blocker \`${row.blocker}\` does not belong to class ${row.class}`);
    }
    if (blocker?.id === 'parity-unproven' && closing) {
      problems.push('blocker `parity-unproven` under --assume-done: the parity verdict is still owed');
    }
    if (blocker && FIXTURE_BLOCKERS.has(blocker.id)) {
      const unverified = fixtureVerdict(context.packageRoot, blocker.argument);
      if (unverified) problems.push(`blocker \`${row.blocker}\`: ${unverified}`);
    }

    let ownerText = null;
    if (!isText(row.canonicalOwner)) {
      problems.push(`${row.class} row names no canonicalOwner`);
    } else if (GLOB.test(row.canonicalOwner) || row.canonicalOwner.includes('..')) {
      problems.push(`canonicalOwner \`${row.canonicalOwner}\` is not one file of the package`);
    } else {
      const owner = join(context.packageRoot, row.canonicalOwner);
      if (!existsSync(owner) || !statSync(owner).isFile()) {
        problems.push(`canonicalOwner ${row.canonicalOwner} does not exist`);
      } else {
        ownerText = readFileSync(owner, 'utf8');
      }
    }
    if (blocker?.id === 'replacement-capability-absent:' && ownerText !== null) {
      if (!/^[A-Za-z_$][\w$]*$/.test(blocker.argument)) {
        problems.push(`blocker \`${row.blocker}\`: \`${blocker.argument}\` is not one identifier`);
      } else if (identifierResolves(ownerText, row.canonicalOwner, blocker.argument)) {
        problems.push(
          `blocker \`${row.blocker}\`: \`${blocker.argument}\` resolves in ${row.canonicalOwner}; `
          + 'the capability exists, so the claim is false',
        );
      }
    }
  } else if (row.canonicalOwner !== null && !isText(row.canonicalOwner)) {
    problems.push('canonicalOwner is neither null nor a path');
  }

  // Codemod.
  if (row.codemod === null && row.class !== 'debt' && closing) {
    problems.push(`${row.class} row names no codemod entry under --assume-done`);
  }
  if (row.codemod !== null) {
    const shape = isText(row.codemod) ? codemodIdProblem(row.codemod) : 'codemod is neither null nor an id';
    if (shape) problems.push(shape);
    else if (codemods?.status === 'wired') {
      report.codemodLookup.map = (report.codemodLookup.map ?? 0) + 1;
      if (!codemods.has(row.codemod)) problems.push(`codemod id \`${row.codemod}\` has no entry in ${CODEMOD_MAP_PATH}`);
    } else {
      report.codemodLookup['shape-only'] = (report.codemodLookup['shape-only'] ?? 0) + 1;
      if (closing) {
        problems.push(
          `codemod id \`${row.codemod}\` was checked for shape only under --assume-done `
          + `(${codemods?.reason ?? 'no map lookup was supplied'}); the map must confirm it`,
        );
      }
    }
  }

  // Changeset coupling for rows newer than the seal.
  const newer = ISO_DATE.test(row.since ?? '') && ISO_DATE.test(sealedAt ?? '') && row.since > sealedAt;
  if (row.changeset !== null || newer) {
    if (!isText(row.changeset)) {
      problems.push(`row is newer than sealedAt ${sealedAt} and names no changeset`);
    } else if (!/^\.changeset\/[\w.-]+\.md$/.test(row.changeset)) {
      problems.push(`changeset \`${row.changeset}\` is not a file of .changeset/`);
    } else {
      const changeset = join(context.repoRoot, row.changeset);
      if (!existsSync(changeset)) problems.push(`changeset ${row.changeset} does not exist`);
      else if (!readFileSync(changeset, 'utf8').includes(symbolOf(row))) {
        problems.push(`changeset ${row.changeset} does not name \`${symbolOf(row)}\``);
      }
    }
  }

  return problems;
}

// ---------------------------------------------------------------------------
// Evaluation
// ---------------------------------------------------------------------------

/**
 * @param measurement the result of `measure`
 * @param options `assumeDone`: work orders treated as closed;
 *   `consumers`: `(row) => { uses, roots }` or null when `--consumers` is off;
 *   `codemods`: the result of `loadCodemodLookup`, or null for a shape-only check.
 */
export function evaluate(measurement, { assumeDone = [], consumers = null, codemods = null } = {}) {
  const failures = [];
  const report = {
    markers: measurement.scan.markers.length,
    rawOccurrences: measurement.scan.raw,
    testFileOccurrences: measurement.scan.testFileOccurrences,
    rows: 0,
    byClass: Object.fromEntries(CLASSES.map((id) => [id, 0])),
    byReceiver: {},
    receiverPhaseLocked: [],
    unverifiedEvidence: [],
    codemodLookup: {},
    consumers: consumers ? [] : 'not requested',
  };

  failures.push(...measurement.scan.problems);
  if (measurement.ledgerError) failures.push(measurement.ledgerError);
  if (measurement.registryError) failures.push(measurement.registryError);
  const ledger = measurement.ledger;
  if (!ledger || typeof ledger !== 'object' || Array.isArray(ledger)) {
    if (!measurement.ledgerError) failures.push(`${LEDGER_PATH} is not an object`);
    return { failures, report };
  }

  for (const key of Object.keys(ledger)) {
    if (!HEADER_KEYS.includes(key)) failures.push(`${LEDGER_PATH}: unknown header key \`${key}\``);
  }
  for (const key of HEADER_KEYS) {
    if (!(key in ledger)) failures.push(`${LEDGER_PATH}: header key \`${key}\` is missing`);
  }
  if (!ISO_DATE.test(ledger.sealedAt ?? '')) failures.push(`${LEDGER_PATH}: sealedAt is not a YYYY-MM-DD date`);
  const noDebtReceivers = Array.isArray(ledger.noDebtReceivers) ? ledger.noDebtReceivers : [];
  if (!Array.isArray(ledger.noDebtReceivers)) failures.push(`${LEDGER_PATH}: noDebtReceivers is not an array`);
  for (const receiver of noDebtReceivers) {
    if (!WORK_ORDER.test(String(receiver))) failures.push(`${LEDGER_PATH}: noDebtReceivers entry \`${receiver}\` is not a work order id`);
  }
  const compatReceivers = Array.isArray(ledger.compatReceivers) ? ledger.compatReceivers : [];
  if (!Array.isArray(ledger.compatReceivers)) failures.push(`${LEDGER_PATH}: compatReceivers is not an array`);
  for (const receiver of compatReceivers) {
    if (!WORK_ORDER.test(String(receiver))) failures.push(`${LEDGER_PATH}: compatReceivers entry \`${receiver}\` is not a work order id`);
    else if (!measurement.registry?.workOrders?.some((candidate) => candidate.id === receiver)) {
      failures.push(`${LEDGER_PATH}: compatReceivers entry ${receiver} is not a work order of ${REGISTRY_PATH}`);
    }
  }
  if (!Array.isArray(ledger.notes) || ledger.notes.some((note) => !isText(note))) {
    failures.push(`${LEDGER_PATH}: notes is not an array of sentences`);
  }
  for (const id of assumeDone) {
    if (!measurement.registry?.workOrders?.some((candidate) => candidate.id === id)) {
      failures.push(`--assume-done=${id}: not a work order of ${REGISTRY_PATH}`);
    }
  }
  const rows = Array.isArray(ledger.rows) ? ledger.rows : [];
  if (!Array.isArray(ledger.rows)) failures.push(`${LEDGER_PATH}: rows is not an array`);

  const context = {
    packageRoot: measurement.packageRoot,
    repoRoot: measurement.repoRoot,
    registry: measurement.registry,
    gatesManifest: measurement.gatesManifest,
    version: measurement.version,
    sealedAt: ledger.sealedAt,
    noDebtReceivers,
    compatReceivers,
    assumeDone,
    codemods,
  };

  const markerKeys = new Map(measurement.scan.markers.map((marker) => [rowKey(marker), marker]));
  const seen = new Set();
  rows.forEach((row, index) => {
    if (!row || typeof row !== 'object' || Array.isArray(row)) {
      failures.push(`${LEDGER_PATH}: row ${index} is not an object`);
      return;
    }
    const label = `${row.file ?? '?'} \`${row.anchor ?? '?'}\``;
    const structural = [];
    for (const key of Object.keys(row)) {
      if (!ROW_KEYS.includes(key)) structural.push(`unknown key \`${key}\``);
    }
    for (const key of ROW_KEYS) {
      if (!(key in row)) structural.push(`key \`${key}\` is missing (write null where it does not apply)`);
    }
    if (!isText(row.file) || !isText(row.anchor)) {
      structural.push('file and anchor must both be named');
    } else if (GLOB.test(row.file) || row.anchor.includes('*')) {
      structural.push('a row names one file and one anchor; a glob is a blanket exemption');
    }
    if (structural.length > 0) {
      for (const problem of structural) failures.push(`${label}: ${problem}`);
      return;
    }
    report.rows += 1;
    const key = rowKey(row);
    if (seen.has(key)) {
      failures.push(`${label}: duplicate row`);
      return;
    }
    seen.add(key);
    if (CLASSES.includes(row.class)) report.byClass[row.class] += 1;
    report.byReceiver[row.receiver] = (report.byReceiver[row.receiver] ?? 0) + 1;
    if (!markerKeys.has(key)) {
      failures.push(`${label}: row without a marker (the \`${MARKER}\` is gone: delete the row with it)`);
    }
    for (const problem of checkRow(row, context, report)) failures.push(`${label}: ${problem}`);

    if (consumers && row.class === 'compat-consumed') {
      const result = consumers(row);
      const uses = result?.uses;
      report.consumers.push({ row: key, uses: uses ?? null, roots: result?.roots ?? [] });
      if (!Number.isInteger(uses)) failures.push(`${label}: --consumers returned no use count`);
      else if (uses === 0) {
        failures.push(`${label}: compat-consumed with zero design-system-resolved uses in the consumer roots; it is debt`);
      }
    }
  });

  for (const [key, marker] of markerKeys) {
    if (!seen.has(key)) {
      failures.push(`${marker.file}:${marker.line} \`${marker.anchor}\`: marker without a row in ${LEDGER_PATH}`);
    }
  }

  return { failures, report };
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

export function parseArgs(argv) {
  const options = { check: false, json: false, consumers: false, assumeDone: [], unknown: [] };
  for (const arg of argv) {
    if (arg === '--check') options.check = true;
    else if (arg === '--json') options.json = true;
    else if (arg === '--consumers') options.consumers = true;
    else if (arg.startsWith('--assume-done=')) {
      options.assumeDone.push(...arg.slice('--assume-done='.length).split(',').map((id) => id.trim()).filter(Boolean));
    } else options.unknown.push(arg);
  }
  return options;
}

export async function run(argv, { packageRoot, repoRoot, resolver = loadConsumerResolver, codemodLookup = loadCodemodLookup } = {}) {
  const options = parseArgs(argv);
  if (options.unknown.length > 0) {
    return { code: 2, failures: [`unknown argument(s): ${options.unknown.join(' ')}`], report: null };
  }
  let consumers = null;
  if (options.consumers) {
    consumers = await resolver({ packageRoot, repoRoot });
    if (!consumers) {
      return {
        code: 1,
        failures: [
          '--consumers: no consumer resolver is wired. The flag cannot be honoured, so it fails closed '
          + 'instead of reporting compat-consumed rows as consumed.',
        ],
        report: null,
      };
    }
  }
  const codemods = await codemodLookup({ packageRoot });
  const result = evaluate(measure({ packageRoot, repoRoot }), { assumeDone: options.assumeDone, consumers, codemods });
  return { code: result.failures.length > 0 ? 1 : 0, ...result, options };
}

async function main() {
  const packageRoot = findPackageRoot(HERE);
  const repoRoot = findRepoRoot(HERE);
  const { code, failures, report, options } = await run(process.argv.slice(2), { packageRoot, repoRoot });
  if (options?.json) {
    process.stdout.write(`${JSON.stringify({ ok: code === 0, failures, report }, null, 2)}\n`);
    process.exit(code);
  }
  if (report) {
    const classes = Object.entries(report.byClass).map(([id, count]) => `${id} ${count}`).join(', ');
    console.log(`deprecations: ${report.markers} marker(s), ${report.rows} row(s) — ${classes}`);
    const receivers = Object.entries(report.byReceiver).map(([id, count]) => `${id} ${count}`).join(', ');
    console.log(`  receivers: ${receivers || 'none'}`);
    if (options.assumeDone.length > 0) console.log(`  assumed done: ${options.assumeDone.join(', ')}`);
    for (const locked of report.receiverPhaseLocked) {
      console.log(`  REPORT receiverPhaseLocked: ${locked.row} -> ${locked.receiver} (phase ${locked.phase} is locked; not actionable)`);
    }
    if (report.unverifiedEvidence.length > 0) {
      console.log(`  REPORT ${report.unverifiedEvidence.length} evidence entr(ies) in sibling checkouts that are not present: NOT VERIFIED on this run`);
    }
    const shapeOnly = report.codemodLookup['shape-only'] ?? 0;
    if (shapeOnly > 0) console.log(`  REPORT ${shapeOnly} codemod id(s) checked for shape only: the codemod map was NOT consulted`);
    if (report.testFileOccurrences > 0) console.log(`  REPORT ${report.testFileOccurrences} occurrence(s) in test files: not ledgered`);
  }
  if (code !== 0) {
    console.error(`\ndeprecations: ${failures.length} failure(s)`);
    for (const failure of failures) console.error(`  ✗ ${failure}`);
    process.exit(code);
  }
  console.log('✓ every marker has one row and every row verifies');
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch((error) => {
    console.error(error);
    process.exit(2);
  });
}
