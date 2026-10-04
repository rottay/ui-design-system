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
 * NOT A BASELINE. No mode writes or seeds the ledger; there is no count ceiling
 * and no wildcard row. A row is keyed by one file and one anchor; a marker the
 * ledger does not name is red, and so is a row whose marker is gone.
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
 *   - a row that names a notice entry of the codemod map (an entry carrying
 *     `notice: { removeIn }`) whose `removeIn` is not the row's own, or that
 *     is not a report-only `member-changed` entry;
 *   - a notice entry that no row whose receiver is listed in `compatReceivers`
 *     names: the symbol was retired or never ledgered, and a notice cannot
 *     stand in for a removal;
 *   - a `direction-semantics:<fixture>` or `parity-failed:<fixture>` blocker
 *     whose fixture is not a directory of the codemod suite carrying an
 *     `expected` tree or named by one of the suite's `*.test.mjs`;
 *   - a `parity-failed:<fixture>` blocker whose fixture does not also prove the
 *     failure for this row: an entry of the fixture's own `map/index.json` must
 *     declare `parity` and list the row's anchor, the fixture's
 *     `report/index.json` must carry a `report` row of that entry at the failing
 *     member and value in `input/`, and the component test it names must exist.
 *     Missing, ambiguous or malformed metadata refuses the row;
 *   - a non-`debt` row without a blocker, without a canonical owner, or without
 *     evidence that verifies: a frozen-engine implementer that still reads the
 *     legacy name and not the replacement, a persisted-data reader, a consumer;
 *   - `replacement-capability-absent:<name>` while `<name>` is an identifier of
 *     the canonical owner;
 *   - a row newer than `sealedAt` without a changeset that names the symbol;
 *   - a `removeIn` release line the package version has already reached;
 *   - a receipt that is incomplete, duplicated, edited after it was minted,
 *     contradicted by the sibling checkout it cites, or that names no evidence
 *     entry of the ledger; an audited mark whose kept audit record is missing
 *     or re-derived other values.
 *
 * WHAT `--assume-done=<WO>` ADDS (the closure candidate). Re-homing every row to
 * another open work order must not close anything, so in this mode:
 *   - any `debt` row is red whatever its receiver: debt is retired, never
 *     transferred;
 *   - a non-`debt` row's receiver must be listed in `compatReceivers`;
 *   - a non-`debt` row needs a codemod id that the codemod map was actually
 *     asked about; a shape-only check, a missing map or a kit that fails to
 *     load is red;
 *   - the entry a non-`debt` row names must be a notice entry: a row that
 *     survives the closure removes nothing in this line, so a rewrite entry,
 *     or a report-only entry without `notice`, is red;
 *   - `parity-unproven` is red: a verdict still owed cannot cross a closure;
 *   - the evidence kind a class requires must be verified live on this run or
 *     rest on an audited receipt; evidence that is merely unavailable is red;
 *   - a receipt without the audited mark is red;
 *   - a receipt that is stale (its row changed, or the sibling's HEAD no longer
 *     carries the needle) or that a present sibling cannot re-prove is red.
 *
 * WHAT THIS GATE CANNOT SEE. It scans for the literal tag. A reworded comment
 * (`Deprecated:` with no tag, `@Deprecated`) is not a marker here, and neither
 * is a symbol whose tag was deleted while the legacy symbol stayed published;
 * the guards for those are the contract-changeset gate and review. A row's
 * `since` is authored, so a new marker can be back-dated past `sealedAt`.
 *
 * EVIDENCE IN A SIBLING CHECKOUT. An entry under `../<application>` is verified
 * live when that checkout is present. When it is absent (CI) a plain `--check`
 * reports the entry by row and does not fail the row; under `--assume-done`
 * only an audited receipt stands in for it. A receipt
 * (`contracts/package/deprecations/receipts/index.json`, one per row, kind,
 * path and needle) records the sibling's origin, the commit the evidence was
 * read at, the digests of the file and of the matched line at that commit, the
 * digest of the ledger row it certifies and a digest of itself.
 *
 * INTEGRITY IS NOT PROVENANCE. The receipt's own digests prove only that the
 * record and its row were not edited since minting; they are unkeyed and say
 * nothing about whether the evidence came from the cited application.
 * Provenance is established once, by an audit that re-derives every value from
 * the source commits in read-only checkouts: `--audit-receipts` re-proves each
 * receipt live, requires the kept audit record to hold the same values hash
 * for hash, and only then sets `auditedBy`, `auditedAt` and `auditRecord`.
 * Audits accumulate, one kept record per audit: a later audit marks only the
 * receipts its own record covers and keeps the marks an earlier record backs.
 * Without the sibling the gate checks integrity and agreement with that kept
 * record, and calls the result a historical audited receipt, not re-verified
 * here; it is never an independent check of the source.
 * The limit, stated plainly: with the siblings absent, a forger who fabricates
 * both the receipt and the audit record passes; the gate does not detect it,
 * and closure is therefore run with the siblings present.
 *
 * ORDER AT CLOSURE. The row digest covers the whole row, so re-homing a row
 * invalidates its receipt. Re-home the rows, run `--write-receipts` with the
 * siblings present, have the receipts audited and marked, then run the closure
 * check with the siblings present and keep its `--json` beside the audit
 * record.
 *
 * WHAT IS REPORTED AND NEVER A PASS. `receiverPhaseLocked` per row, so a
 * transfer to a locked work order cannot look actionable; evidence in a sibling
 * checkout that is not present, by row; rows that rest on historical audited
 * receipts; receipts that are stale or unaudited; codemod ids the map could
 * not be asked about.
 *
 * `--consumers` asks whether each `compat-consumed` row still has a
 * design-system-resolved use in the four consumer roots. The resolver is an
 * interface (`loadConsumerResolver`); while none is wired the flag fails
 * closed rather than reporting green.
 *
 * `--siblings=absent` evaluates as CI does, with no sibling checkout.
 *
 * Usage: node scripts/check/boundaries/deprecations/index.mjs --check
 *          [--assume-done=<WO>[,<WO>]] [--consumers] [--siblings=absent] [--json]
 *        node scripts/check/boundaries/deprecations/index.mjs --write-receipts
 *        node scripts/check/boundaries/deprecations/index.mjs --audit-receipts
 *          --by=<auditor> --record=<repo-relative path of the kept audit record>
 */

import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, realpathSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import ts from 'typescript';

import {
  packageRoot as findPackageRoot,
  repoRoot as findRepoRoot,
} from '../../../libraries/repo-root/index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));

export const LEDGER_PATH = 'contracts/package/deprecations/index.json';
export const RECEIPTS_PATH = 'contracts/package/deprecations/receipts/index.json';
export const REGISTRY_PATH = 'roadmap/registry.json';
export const GATES_MANIFEST_PATH = 'scripts/check/automation/gates/manifest/index.mjs';
export const CODEMOD_MAP_PATH = 'scripts/maintain/codemods/release-3-0-map/index.json';
export const CODEMOD_KIT_PATH = 'scripts/maintain/codemods/index.mjs';
export const CODEMOD_FIXTURES_PATH = 'scripts/maintain/codemods/tests/fixtures';
export const CODEMOD_TESTS_PATH = 'scripts/maintain/codemods/tests';
const NOTICE_CLASS = 'member-changed';
const NOTICE_MODE = 'report-only';
export const FIXTURE_MAP_FILE = 'map/index.json';
export const FIXTURE_REPORT_FILE = 'report/index.json';
export const FIXTURE_INPUT_DIR = 'input';
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

/**
 * What a fixture declares to stand behind a `parity-failed` row: the `parity`
 * object of one entry of its own map. `anchors` are the ledger anchors it
 * answers for, `failing` the member (and the value, when one value failed) the
 * replacement cannot reproduce, `test` the package-relative component test that
 * measured it. The lists are closed.
 */
export const PARITY_KEYS = Object.freeze(['anchors', 'failing', 'test']);
export const PARITY_FAILING_KEYS = Object.freeze(['member', 'value']);
const PARITY_TEST_FILE = /\.test\.(?:tsx?|mjs)$/;

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

export const RECEIPT_HEADER_KEYS = Object.freeze(['schema', 'receipts']);
export const RECEIPT_KEYS = Object.freeze([
  'file', 'anchor', 'kind', 'path', 'needle', 'repository', 'commit', 'fileDigest', 'matchLine', 'matchDigest',
  'rowDigest', 'date', 'integrity',
]);
export const RECEIPT_AUDIT_KEYS = Object.freeze(['auditedBy', 'auditedAt', 'auditRecord']);

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
const COMMIT_SHA = /^[0-9a-f]{40}$/;
const SHA256 = /^sha256:[0-9a-f]{64}$/;
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
  const receiptsPath = join(packageRoot, RECEIPTS_PATH);
  const receipts = existsSync(receiptsPath) ? readJson(receiptsPath) : { value: null, error: null };
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
    receipts: receipts.value,
    receiptsError: receipts.error,
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
 * Returns `{ problems, verified, unverified, sibling }`: an entry in a sibling
 * checkout that is not present is neither a problem nor a verification.
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
  if (sibling && !context.siblingOf(entry.path).info.present) {
    return { problems, verified: false, unverified: true, sibling };
  }
  const full = resolve(context.repoRoot, entry.path);
  if (!existsSync(full) || !statSync(full).isFile()) {
    problems.push(`evidence \`${entry.kind}\`: ${entry.path} does not exist`);
    return { problems, verified: false, unverified: false, sibling };
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
  return { problems, verified: problems.length === 0, unverified: false, sibling };
}

// ---------------------------------------------------------------------------
// Receipts
// ---------------------------------------------------------------------------

function canonicalJson(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value) ?? 'null';
}

export function digestOf(bytes) {
  return `sha256:${createHash('sha256').update(bytes).digest('hex')}`;
}

/** The digest of one ledger row: every key, in canonical order. */
export function rowDigestOf(row) {
  return digestOf(canonicalJson(row));
}

/** The digest a receipt carries of its own content. */
export function receiptIntegrityOf(receipt) {
  const body = Object.fromEntries(Object.entries(receipt).filter(([key]) => key !== 'integrity'));
  return digestOf(canonicalJson(body));
}

export function isAudited(receipt) {
  return RECEIPT_AUDIT_KEYS.every((key) => key in receipt);
}

/** The integrity digest the receipt carried when it was minted, before any audited mark. */
export function mintIntegrityOf(receipt) {
  return receiptIntegrityOf(Object.fromEntries(Object.entries(receipt).filter(([key]) => !RECEIPT_AUDIT_KEYS.includes(key))));
}

function readAuditRecord(repoRoot, path) {
  if (!isText(path) || path.startsWith('/') || /^[A-Za-z]:/.test(path) || GLOB.test(path) || path.split('/').includes('..')) {
    return { value: null, error: `audit record \`${path}\` is not a repository-relative path` };
  }
  return readJson(join(repoRoot, path));
}

/**
 * Why a kept audit record does not vouch for a receipt, or null when it does:
 * the record must list the receipt as VERIFIED with the same commit and the
 * same re-derived digests, hash for hash.
 */
export function auditRecordDisagreement(record, receipt) {
  if (!record || typeof record !== 'object' || !Array.isArray(record.receipts)) return 'the audit record lists no receipts';
  const entry = record.receipts.find((candidate) => (
    candidate && candidate.row === `${receipt.file}#${receipt.anchor}` && candidate.kind === receipt.kind
    && candidate.path === receipt.path && candidate.needle === receipt.needle
  ));
  if (!entry) return 'the audit record has no entry for it';
  if (entry.verdict !== 'VERIFIED') return `the audit record's verdict for it is \`${entry.verdict}\``;
  const differing = [
    ['commit', entry.commit, receipt.commit],
    ['fileDigest', entry.recomputed?.fileSha256, receipt.fileDigest],
    ['matchLine', entry.recomputed?.matchLine, receipt.matchLine],
    ['matchDigest', entry.recomputed?.matchDigest, receipt.matchDigest],
    ['rowDigest', entry.recomputed?.rowDigest, receipt.rowDigest],
    ['integrity at minting', entry.recomputed?.integrity, mintIntegrityOf(receipt)],
  ].filter(([, audited, recorded]) => audited !== recorded);
  if (differing.length === 0) return null;
  return `the audit record re-derived other values: ${differing.map(([name, audited, recorded]) => `${name} (record ${audited}, receipt ${recorded})`).join('; ')}`;
}

/** Why the audited mark of a receipt is not backed by its kept record; empty when it is. */
function auditMarkProblems(receipt, repoRoot, records) {
  if (!records.has(receipt.auditRecord)) records.set(receipt.auditRecord, readAuditRecord(repoRoot, receipt.auditRecord));
  const { value, error } = records.get(receipt.auditRecord);
  if (error) return [`AUDIT MARK: ${error}`];
  const problems = [];
  if (value?.audit?.date !== receipt.auditedAt) {
    problems.push(`AUDIT MARK: auditedAt ${receipt.auditedAt} is not the date of ${receipt.auditRecord} (${value?.audit?.date})`);
  }
  if (!String(value?.audit?.auditor ?? '').includes(receipt.auditedBy)) {
    problems.push(`AUDIT MARK: auditedBy \`${receipt.auditedBy}\` is not the auditor of ${receipt.auditRecord} (\`${value?.audit?.auditor}\`)`);
  }
  const disagreement = auditRecordDisagreement(value, receipt);
  if (disagreement) problems.push(`AUDIT MARK: ${disagreement}`);
  return problems;
}

/** One receipt per row, evidence kind, path and needle: a row may cite one file for two needles. */
export function receiptKey({ file, anchor, kind, path, needle }) {
  return `${file}#${anchor} ${kind} ${path} needle=${JSON.stringify(needle)}`;
}

/** The first occurrence of `needle`: its 1-based line and the digest of the whole line(s) it spans. */
export function matchOf(bytes, needle) {
  const text = bytes.toString('utf8');
  const at = text.indexOf(needle);
  if (at === -1) return null;
  const start = text.lastIndexOf('\n', at - 1) + 1;
  const stop = text.indexOf('\n', at + needle.length);
  const range = text.slice(start, stop === -1 ? text.length : stop);
  return { line: text.slice(0, start).split('\n').length, digest: digestOf(Buffer.from(range, 'utf8')) };
}

/**
 * What a sibling directory is: absent, a plain directory, or a git checkout
 * that can be asked for its origin, its HEAD and a file at a commit. Read-only.
 */
export function inspectSibling(dir) {
  if (!existsSync(dir)) return { present: false };
  const git = (args) => {
    try {
      return execFileSync('git', ['-C', dir, ...args], { stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 2 ** 28 });
    } catch {
      return null;
    }
  };
  const top = git(['rev-parse', '--show-toplevel']);
  const checkout = top !== null && realpathSync(top.toString('utf8').trim()) === realpathSync(dir);
  if (!checkout) return { present: true, checkout: false };
  return {
    present: true,
    checkout: true,
    origin: git(['config', '--get', 'remote.origin.url'])?.toString('utf8').trim() || null,
    head: git(['rev-parse', '--verify', 'HEAD^{commit}'])?.toString('utf8').trim() || null,
    hasCommit: (sha) => COMMIT_SHA.test(sha) && git(['cat-file', '-e', `${sha}^{commit}`]) !== null,
    onOriginMain: (sha) => COMMIT_SHA.test(sha) && git(['merge-base', '--is-ancestor', sha, 'origin/main']) !== null,
    blobAt: (revision, inner) => git(['show', `${revision}:./${inner}`]),
  };
}

function siblingLocator(repoRoot, siblings, inspect) {
  const cache = new Map();
  return (path) => {
    const [, name, ...rest] = path.split('/');
    if (!cache.has(name)) {
      cache.set(name, siblings === 'absent' ? { present: false } : inspect(resolve(repoRoot, '..', name)));
    }
    return { name: `../${name}`, inner: rest.join('/'), info: cache.get(name) };
  };
}

/** Why a receipt is not a complete, self-consistent record; empty when it is. */
export function receiptProblems(receipt) {
  if (!receipt || typeof receipt !== 'object' || Array.isArray(receipt)) return ['is not an object'];
  const problems = [];
  for (const key of Object.keys(receipt)) {
    if (!RECEIPT_KEYS.includes(key) && !RECEIPT_AUDIT_KEYS.includes(key)) problems.push(`unknown key \`${key}\``);
  }
  for (const key of RECEIPT_KEYS) {
    if (!(key in receipt)) problems.push(`key \`${key}\` is missing`);
  }
  const marks = RECEIPT_AUDIT_KEYS.filter((key) => key in receipt);
  if (marks.length > 0 && marks.length < RECEIPT_AUDIT_KEYS.length) {
    problems.push(`the audited mark is partial: ${RECEIPT_AUDIT_KEYS.join(', ')} are set together or not at all`);
  }
  if (problems.length > 0) return problems;
  if (marks.length > 0) {
    if (!isText(receipt.auditedBy)) problems.push('`auditedBy` is empty');
    if (!ISO_DATE.test(String(receipt.auditedAt))) problems.push(`auditedAt \`${receipt.auditedAt}\` is not a YYYY-MM-DD date`);
    if (!isText(receipt.auditRecord)) problems.push('`auditRecord` is empty');
  }
  for (const key of ['file', 'anchor', 'kind', 'path', 'needle', 'repository']) {
    if (!isText(receipt[key])) problems.push(`\`${key}\` is empty`);
  }
  if (isText(receipt.path) && (!receipt.path.startsWith('../') || evidencePathProblem(receipt.path))) {
    problems.push(`path \`${receipt.path}\` is not a file of a sibling checkout`);
  }
  if (!COMMIT_SHA.test(String(receipt.commit))) problems.push(`commit \`${receipt.commit}\` is not a full commit SHA`);
  for (const key of ['fileDigest', 'matchDigest', 'rowDigest', 'integrity']) {
    if (!SHA256.test(String(receipt[key]))) problems.push(`\`${key}\` is not a sha256 digest`);
  }
  if (!Number.isInteger(receipt.matchLine) || receipt.matchLine < 1) problems.push('`matchLine` is not a line number');
  if (!ISO_DATE.test(String(receipt.date))) problems.push(`date \`${receipt.date}\` is not a YYYY-MM-DD date`);
  if (problems.length === 0 && receipt.integrity !== receiptIntegrityOf(receipt)) {
    problems.push('ALTERED: the integrity digest does not match the content; the receipt was edited after it was minted');
  }
  return problems;
}

const short = (digest) => String(digest).replace(/^sha256:/, '').slice(0, 12);

/**
 * One receipt against the row it names and, when present, the sibling it cites.
 * `refuted` is red in every mode: the sibling contradicts the record. `stale`
 * is red at closure and reported otherwise: the record no longer certifies the
 * current row or the current sibling, or cannot be re-proven here.
 */
function proveReceipt(receipt, row, entry, sibling) {
  const refuted = [];
  const stale = [];
  const { info, inner, name } = sibling;
  if (receipt.rowDigest !== rowDigestOf(row)) {
    stale.push(
      `STALE: it certifies row digest ${short(receipt.rowDigest)} and the row is now ${short(rowDigestOf(row))}; `
      + `the row or its needle changed after ${receipt.date}`,
    );
  }
  if (!info.present) return { refuted, stale, reproven: false };
  if (!info.checkout) {
    stale.push(`${name} is present but is not a git checkout; the receipt cannot be re-proven`);
    return { refuted, stale, reproven: false };
  }
  if (info.origin !== receipt.repository) {
    refuted.push(`ALTERED: it names repository \`${receipt.repository}\` and ${name} has origin \`${info.origin}\``);
  }
  if (!info.hasCommit(receipt.commit)) {
    stale.push(`commit ${receipt.commit} is not in ${name}; the receipt cannot be re-proven (fetch the commit or mint again)`);
    return { refuted, stale, reproven: false };
  }
  const blob = info.blobAt(receipt.commit, inner);
  if (blob === null) {
    refuted.push(`ALTERED: ${entry.path} does not exist at commit ${receipt.commit}`);
  } else {
    const match = matchOf(blob, receipt.needle);
    if (digestOf(blob) !== receipt.fileDigest) {
      refuted.push(
        `ALTERED: at commit ${receipt.commit} the file digest is ${short(digestOf(blob))}, `
        + `the receipt records ${short(receipt.fileDigest)}`,
      );
    } else if (!match) {
      refuted.push(`ALTERED: at commit ${receipt.commit} the file does not contain the needle`);
    } else if (match.line !== receipt.matchLine || match.digest !== receipt.matchDigest) {
      refuted.push(`ALTERED: at commit ${receipt.commit} the needle matches line ${match.line} (${short(match.digest)}), not the recorded line`);
    }
  }
  const head = info.blobAt('HEAD', inner);
  if (head === null || !head.includes(entry.needle)) {
    stale.push(
      `STALE: at HEAD ${info.head} of ${name} the file ${head === null ? 'is gone' : `no longer contains \`${entry.needle}\``}; `
      + `the receipt was read at ${receipt.commit}`,
    );
  }
  return { refuted, stale, reproven: refuted.length === 0 };
}

function isSiblingEntry(entry) {
  return Boolean(entry) && typeof entry === 'object' && typeof entry.path === 'string' && entry.path.startsWith('../');
}

/**
 * The receipts of every sibling evidence entry that verifies live on this run,
 * read from the sibling's HEAD commit. An entry whose sibling is absent keeps
 * the receipt it already has when that receipt is intact and still certifies
 * the row; every other entry is refused by name. A new receipt carries no
 * audited mark.
 */
export function mintReceipts(measurement, { inspect = inspectSibling, today = new Date().toISOString().slice(0, 10) } = {}) {
  const existing = new Map();
  for (const receipt of measurement.receipts?.receipts ?? []) {
    if (receiptProblems(receipt).length === 0) existing.set(receiptKey(receipt), receipt);
  }
  const context = {
    repoRoot: measurement.repoRoot,
    gatesManifest: measurement.gatesManifest,
    siblingOf: siblingLocator(measurement.repoRoot, 'detect', inspect),
  };
  const receipts = [];
  const minted = [];
  const kept = [];
  const refused = [];
  const seen = new Set();
  for (const row of Array.isArray(measurement.ledger?.rows) ? measurement.ledger.rows : []) {
    if (!row || typeof row !== 'object' || !isText(row.file) || !isText(row.anchor)) continue;
    for (const entry of Array.isArray(row.evidence) ? row.evidence : []) {
      if (!isSiblingEntry(entry)) continue;
      const key = receiptKey({ file: row.file, anchor: row.anchor, kind: entry.kind, path: entry.path, needle: entry.needle });
      if (seen.has(key)) continue;
      seen.add(key);
      const refuse = (why) => refused.push({ row: rowKey(row), kind: entry.kind, path: entry.path, why });
      const result = verifyEvidence(entry, row, context);
      const prior = existing.get(key) ?? null;
      if (result.unverified) {
        if (prior && prior.rowDigest === rowDigestOf(row)) { receipts.push(prior); kept.push(key); }
        else refuse('the sibling checkout is not present, so nothing was verified on this run');
        continue;
      }
      if (!result.verified) { refuse(result.problems.join('; ')); continue; }
      const { info, inner, name } = context.siblingOf(entry.path);
      if (!info.checkout) { refuse(`${name} is not a git checkout; evidence cannot be anchored to a commit`); continue; }
      if (!info.origin) { refuse(`${name} has no origin remote; the repository cannot be identified`); continue; }
      if (!info.head) { refuse(`${name} has no HEAD commit`); continue; }
      if (!info.onOriginMain(info.head)) {
        refuse(`HEAD ${info.head} of ${name} is not an ancestor of its origin/main; a commit nobody else can fetch anchors nothing`);
        continue;
      }
      const blob = info.blobAt('HEAD', inner);
      const match = blob === null ? null : matchOf(blob, entry.needle);
      if (!match) {
        refuse(`at HEAD ${info.head} the committed file ${blob === null ? 'does not exist' : 'does not contain the needle'}; only the working tree does`);
        continue;
      }
      const body = {
        file: row.file,
        anchor: row.anchor,
        kind: entry.kind,
        path: entry.path,
        needle: entry.needle,
        repository: info.origin,
        commit: info.head,
        fileDigest: digestOf(blob),
        matchLine: match.line,
        matchDigest: match.digest,
        rowDigest: rowDigestOf(row),
      };
      const same = prior && Object.keys(body).every((field) => prior[field] === body[field]);
      if (same) { receipts.push(prior); kept.push(key); continue; }
      const receipt = { ...body, date: today };
      receipts.push({ ...receipt, integrity: receiptIntegrityOf(receipt) });
      minted.push(key);
    }
  }
  const dropped = [...existing.keys()].filter((key) => !seen.has(key));
  return { document: { schema: 1, receipts }, minted, kept, refused, dropped };
}

/**
 * The audit step: sets the audited mark on every receipt that re-proves live on
 * this run against its recorded commit, sits on the sibling's origin/main, and
 * that the kept audit record re-derived to the same values. A receipt already
 * marked by another kept record is left untouched when that record still
 * vouches for it. Anything else is refused by name.
 */
export function auditReceipts(measurement, { by, record, inspect = inspectSibling } = {}) {
  const refused = [];
  const marked = [];
  const kept = [];
  const keptRecord = readAuditRecord(measurement.repoRoot, record);
  const auditedAt = keptRecord.value?.audit?.date;
  const fatal = [];
  if (!isText(by)) fatal.push('--by names no auditor');
  if (keptRecord.error) fatal.push(keptRecord.error);
  else {
    if (!ISO_DATE.test(String(auditedAt))) fatal.push(`${record} carries no audit date`);
    if (isText(by) && !String(keptRecord.value?.audit?.auditor ?? '').includes(by)) {
      fatal.push(`${record} names auditor \`${keptRecord.value?.audit?.auditor}\`, not \`${by}\``);
    }
  }
  const source = measurement.receipts?.receipts;
  if (!Array.isArray(source)) fatal.push(`${RECEIPTS_PATH} holds no receipts`);
  if (fatal.length > 0) return { document: null, marked, kept, refused: fatal.map((why) => ({ receipt: null, why })) };

  const entries = new Map();
  for (const row of Array.isArray(measurement.ledger?.rows) ? measurement.ledger.rows : []) {
    if (!row || typeof row !== 'object' || !isText(row.file) || !isText(row.anchor)) continue;
    for (const entry of Array.isArray(row.evidence) ? row.evidence : []) {
      if (!isSiblingEntry(entry)) continue;
      entries.set(receiptKey({ file: row.file, anchor: row.anchor, kind: entry.kind, path: entry.path, needle: entry.needle }), { row, entry });
    }
  }
  const siblingOf = siblingLocator(measurement.repoRoot, 'detect', inspect);
  const records = new Map();
  const receipts = source.map((receipt, index) => {
    const structural = receiptProblems(receipt);
    const label = structural.length === 0 ? receiptKey(receipt) : `receipt ${index}`;
    const refuse = (why) => { refused.push({ receipt: label, why }); return receipt; };
    if (structural.length > 0) return refuse(structural.join('; '));
    if (isAudited(receipt) && receipt.auditRecord !== record) {
      const unbacked = auditMarkProblems(receipt, measurement.repoRoot, records);
      if (unbacked.length > 0) return refuse(unbacked.join('; '));
      kept.push(label);
      return receipt;
    }
    const cited = entries.get(label);
    if (!cited) return refuse('it names no evidence entry of the ledger');
    const sibling = siblingOf(receipt.path);
    const proof = proveReceipt(receipt, cited.row, cited.entry, sibling);
    if (proof.refuted.length > 0 || proof.stale.length > 0) return refuse([...proof.refuted, ...proof.stale].join('; '));
    if (!proof.reproven) return refuse(`${sibling.name} is not present; nothing was re-proven on this run`);
    if (!sibling.info.onOriginMain(receipt.commit)) return refuse(`commit ${receipt.commit} is not an ancestor of origin/main of ${sibling.name}`);
    const disagreement = auditRecordDisagreement(keptRecord.value, receipt);
    if (disagreement) return refuse(disagreement);
    if (receipt.auditedBy === by && receipt.auditedAt === auditedAt && receipt.auditRecord === record) {
      kept.push(label);
      return receipt;
    }
    const body = Object.fromEntries(
      Object.entries(receipt).filter(([key]) => key !== 'integrity' && !RECEIPT_AUDIT_KEYS.includes(key)),
    );
    const audited = { ...body, auditedBy: by, auditedAt, auditRecord: record };
    marked.push(label);
    return { ...audited, integrity: receiptIntegrityOf(audited) };
  });
  return { document: { schema: 1, receipts }, marked, kept, refused };
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
 * The lookup into the codemod map of one package:
 * `{ status: 'wired', has, entry, notices }`, where `entry(id)` is the map entry
 * an id or an alias names (or null) and `notices` are the entries carrying
 * `notice`; or `{ status: 'unavailable', reason }` when the map is missing, or
 * the kit or the map fails to load. The kit is imported lazily and never
 * trusted to load.
 */
export async function loadCodemodLookup({ packageRoot }) {
  const mapPath = join(packageRoot, CODEMOD_MAP_PATH);
  if (!existsSync(mapPath)) return { status: 'unavailable', reason: `${CODEMOD_MAP_PATH} does not exist` };
  try {
    const kit = await import(pathToFileURL(join(findPackageRoot(HERE), CODEMOD_KIT_PATH)).href);
    if (typeof kit.loadMap !== 'function') throw new Error('the kit exports no loadMap');
    const map = kit.loadMap(mapPath);
    if (!(map?.byId instanceof Map)) throw new Error('loadMap returned no id index');
    if (!Array.isArray(map.entries)) throw new Error('loadMap returned no entries');
    return {
      status: 'wired',
      has: (id) => map.byId.has(id),
      entry: (id) => map.byId.get(id) ?? null,
      notices: map.entries.filter((entry) => entry.notice !== undefined),
    };
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

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isRelativeFile(value) {
  return isText(value) && !GLOB.test(value) && !value.startsWith('/')
    && value.split('/').every((part) => part !== '..' && part !== '' && part !== '.');
}

/** Why one map entry's `parity` declaration is unreadable, or null. */
function parityShapeProblem(entry) {
  const { parity } = entry;
  if (!isText(entry.id)) return 'an entry that declares `parity` has no id';
  if (!isRecord(parity)) return `\`parity\` of ${entry.id} is not an object`;
  const unknown = Object.keys(parity).filter((key) => !PARITY_KEYS.includes(key));
  if (unknown.length > 0) return `\`parity\` of ${entry.id} has unknown key(s) ${unknown.join(', ')}`;
  const missing = PARITY_KEYS.filter((key) => !(key in parity));
  if (missing.length > 0) return `\`parity\` of ${entry.id} lacks ${missing.join(', ')}`;
  if (!Array.isArray(parity.anchors) || parity.anchors.length === 0 || !parity.anchors.every(isText)
    || new Set(parity.anchors).size !== parity.anchors.length) {
    return `\`parity.anchors\` of ${entry.id} is not a non-empty list of distinct ledger anchors`;
  }
  if (!isRecord(parity.failing)) return `\`parity.failing\` of ${entry.id} is not an object`;
  const stray = Object.keys(parity.failing).filter((key) => !PARITY_FAILING_KEYS.includes(key));
  if (stray.length > 0) return `\`parity.failing\` of ${entry.id} has unknown key(s) ${stray.join(', ')}`;
  if (!isText(parity.failing.member) || !/^[A-Za-z_$][\w$]*$/.test(parity.failing.member)) {
    return `\`parity.failing.member\` of ${entry.id} is not one member name`;
  }
  if ('value' in parity.failing && !isText(parity.failing.value)) {
    return `\`parity.failing.value\` of ${entry.id} is not a non-empty string`;
  }
  if (!isRelativeFile(parity.test) || !PARITY_TEST_FILE.test(parity.test)) {
    return `\`parity.test\` of ${entry.id} is not one package-relative test file`;
  }
  return null;
}

const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Whether the source read from a report row's column is the failing member, assigned the failing value when one is declared. */
function siteNamesFailure(site, failing) {
  const member = escapeRegExp(failing.member);
  if (failing.value === undefined) return new RegExp(`^${member}(?![\\w$])`).test(site);
  return new RegExp(`^${member}\\s*=\\s*(?:\\{\\s*)?(["'\`])${escapeRegExp(failing.value)}\\1`).test(site);
}

/**
 * Whether a fixture proves a failed parity for one ledger row, beyond carrying
 * a verdict: null, or the first thing it lacks. The fixture must name the row
 * (`NO SYMBOL`), carry a `report` row at the failing member and value
 * (`NO REPORT ROW`) and name a component test that exists (`NO BACKING TEST`);
 * metadata that cannot be read is `MALFORMED` and refuses the row.
 */
export function parityVerdict(packageRoot, fixture, row) {
  const at = `${CODEMOD_FIXTURES_PATH}/${fixture}`;
  const directory = join(packageRoot, CODEMOD_FIXTURES_PATH, fixture);
  const refuse = (why) => `fixture ${at} does not prove a failed parity for \`${row.anchor}\`: ${why}`;

  const mapPath = join(directory, FIXTURE_MAP_FILE);
  if (!existsSync(mapPath) || !statSync(mapPath).isFile()) {
    return refuse(`NO SYMBOL: it has no ${FIXTURE_MAP_FILE} of its own, so it declares no symbol`);
  }
  let entries;
  try {
    entries = JSON.parse(readFileSync(mapPath, 'utf8'))?.entries;
  } catch (error) {
    return refuse(`MALFORMED: ${FIXTURE_MAP_FILE} is not JSON (${error.message})`);
  }
  if (!Array.isArray(entries) || !entries.every(isRecord)) return refuse(`MALFORMED: ${FIXTURE_MAP_FILE} has no list of entries`);
  const declaring = entries.filter((entry) => 'parity' in entry);
  for (const entry of declaring) {
    const malformed = parityShapeProblem(entry);
    if (malformed) return refuse(`MALFORMED: ${malformed}`);
  }
  if (declaring.length === 0) return refuse(`NO SYMBOL: no entry of ${FIXTURE_MAP_FILE} declares \`parity\``);
  const naming = declaring.filter((entry) => entry.parity.anchors.includes(row.anchor));
  if (naming.length === 0) {
    return refuse(
      `NO SYMBOL: \`parity.anchors\` names ${declaring.flatMap((entry) => entry.parity.anchors).join(', ')}, not this row`,
    );
  }
  if (naming.length > 1) {
    return refuse(`MALFORMED: ${naming.map((entry) => entry.id).join(' and ')} both name this row; one entry answers for a row`);
  }
  const [{ id, parity }] = naming;
  const failing = parity.failing.value === undefined
    ? `\`${parity.failing.member}\``
    : `\`${parity.failing.member}\` = \`${parity.failing.value}\``;

  const reportPath = join(directory, FIXTURE_REPORT_FILE);
  if (!existsSync(reportPath) || !statSync(reportPath).isFile()) return refuse(`NO REPORT ROW: it has no ${FIXTURE_REPORT_FILE}`);
  let rows;
  try {
    rows = JSON.parse(readFileSync(reportPath, 'utf8'));
  } catch (error) {
    return refuse(`MALFORMED: ${FIXTURE_REPORT_FILE} is not JSON (${error.message})`);
  }
  if (!Array.isArray(rows) || !rows.every(isRecord)) return refuse(`MALFORMED: ${FIXTURE_REPORT_FILE} is not a list of rows`);
  const reported = rows.some((item) => {
    if (item.action !== 'report' || item.id !== id) return false;
    if (!isRelativeFile(item.file) || !Number.isInteger(item.line) || !Number.isInteger(item.column)) return false;
    const source = join(directory, FIXTURE_INPUT_DIR, item.file);
    if (!existsSync(source) || !statSync(source).isFile()) return false;
    const line = readFileSync(source, 'utf8').split('\n')[item.line - 1];
    return line !== undefined && item.column >= 1 && siteNamesFailure(line.slice(item.column - 1), parity.failing);
  });
  if (!reported) {
    return refuse(
      `NO REPORT ROW: ${FIXTURE_REPORT_FILE} has no \`report\` row of ${id} located at ${failing} in ${FIXTURE_INPUT_DIR}/`,
    );
  }

  const backing = join(packageRoot, parity.test);
  if (!existsSync(backing) || !statSync(backing).isFile()) {
    return refuse(`NO BACKING TEST: the component test it names, ${parity.test}, does not exist`);
  }
  return null;
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

/** The entry a wired lookup holds for an id. A lookup that can only answer `has` yields an entry that states nothing. */
function codemodEntryOf(codemods, id) {
  if (typeof codemods.entry === 'function') return codemods.entry(id) ?? null;
  return codemods.has(id) ? {} : null;
}

const isNotice = (entry) => entry?.notice !== undefined;

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
  const receiptedKinds = new Set();
  const unverifiedKinds = new Set();
  for (const entry of evidence ?? []) {
    const result = verifyEvidence(entry, row, context);
    problems.push(...result.problems);
    if (result.verified) verifiedKinds.add(entry.kind);
    if (!result.sibling) continue;

    const key = receiptKey({ file: row.file, anchor: row.anchor, kind: entry.kind, path: entry.path, needle: entry.needle });
    const receipt = context.receipts.get(key) ?? null;
    let holds = false;
    let reproven = false;
    if (receipt) {
      context.receiptsUsed.add(key);
      const proof = proveReceipt(receipt, row, entry, context.siblingOf(entry.path));
      for (const problem of proof.refuted) problems.push(`receipt for \`${entry.kind}\` at ${entry.path}: ${problem}`);
      for (const problem of proof.stale) {
        if (closing) problems.push(`receipt for \`${entry.kind}\` at ${entry.path}: ${problem}`);
        else report.staleReceipts.push({ row: rowKey(row), kind: entry.kind, path: entry.path, why: problem });
      }
      if (!isAudited(receipt)) {
        const problem = 'UNAUDITED: it carries no audited mark; its digests show integrity, not that the evidence comes from the cited application';
        if (closing) problems.push(`receipt for \`${entry.kind}\` at ${entry.path}: ${problem}`);
        else report.unauditedReceipts.push({ row: rowKey(row), kind: entry.kind, path: entry.path });
      }
      holds = proof.refuted.length === 0 && proof.stale.length === 0 && context.vouched.has(key);
      reproven = proof.refuted.length === 0 && proof.stale.length === 0 && proof.reproven;
    }
    if (result.unverified && holds) receiptedKinds.add(entry.kind);
    if (result.unverified && !holds) {
      unverifiedKinds.add(entry.kind);
      report.unverifiedEvidence.push({ row: rowKey(row), kind: entry.kind, path: entry.path });
    }
    report.siblingEvidence.push({
      row: rowKey(row),
      kind: entry.kind,
      path: entry.path,
      status: result.verified ? 'verified-live' : result.unverified ? (holds ? 'historical-receipt' : 'not-verified') : 'failed',
      receipt: receipt
        ? {
          commit: receipt.commit,
          date: receipt.date,
          holds,
          reproven,
          audited: isAudited(receipt) ? { by: receipt.auditedBy, at: receipt.auditedAt, record: receipt.auditRecord } : null,
        }
        : null,
    });
  }

  if (CLASSES.includes(row.class) && row.class !== 'debt') {
    if (evidence && evidence.length === 0) problems.push(`${row.class} row has no evidence`);
    const required = REQUIRED_EVIDENCE_BY_CLASS[row.class];
    const satisfied = verifiedKinds.has(required) || receiptedKinds.has(required);
    if (required && !verifiedKinds.has(required) && receiptedKinds.has(required)) {
      report.rowsOnHistoricalReceipts.push(rowKey(row));
    }
    if (required && evidence && evidence.length > 0 && !satisfied) {
      if (!unverifiedKinds.has(required)) {
        problems.push(`${row.class} row has no verified \`${required}\` evidence`);
      } else if (closing) {
        problems.push(
          `${row.class} row: \`${required}\` evidence is NOT VERIFIED under --assume-done: its sibling checkout is not `
          + 'present and no audited receipt stands in for it; closure needs it verified live or a historical audited receipt',
        );
      }
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
      const unverified = fixtureVerdict(context.packageRoot, blocker.argument)
        ?? (blocker.id === 'parity-failed:' ? parityVerdict(context.packageRoot, blocker.argument, row) : null);
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
      const entry = codemodEntryOf(codemods, row.codemod);
      if (!entry) problems.push(`codemod id \`${row.codemod}\` has no entry in ${CODEMOD_MAP_PATH}`);
      else if (isNotice(entry)) {
        if (entry.class !== NOTICE_CLASS || entry.mode !== NOTICE_MODE) {
          problems.push(
            `codemod id \`${row.codemod}\` carries a notice on a \`${entry.mode}\` entry of class \`${entry.class}\`; `
            + `a notice is a ${NOTICE_MODE} ${NOTICE_CLASS} entry and migrates nothing`,
          );
        }
        if (entry.notice?.removeIn !== row.removeIn) {
          problems.push(
            `codemod id \`${row.codemod}\` is a notice of removal in \`${entry.notice?.removeIn}\` `
            + `and the row says removeIn \`${row.removeIn}\`; the two must be equal`,
          );
        }
        if (isText(entry.id) && compatReceivers.includes(row.receiver)) context.noticesNamed.add(entry.id);
      } else if (closing && row.class !== 'debt') {
        problems.push(
          entry.mode === 'rewrite'
            ? `under --assume-done a row that survives the closure names a notice entry; \`${row.codemod}\` is a rewrite entry: `
              + 'a removal cannot hide behind a surviving row'
            : `under --assume-done a row that survives the closure names a notice entry; \`${row.codemod}\` `
              + `carries no \`notice\` in ${CODEMOD_MAP_PATH}`,
        );
      }
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
 *   `codemods`: the result of `loadCodemodLookup`, or null for a shape-only check;
 *   `siblings`: `'absent'` treats every sibling checkout as not present (what CI sees);
 *   `inspect`: the reader of a sibling directory.
 */
export function evaluate(
  measurement,
  { assumeDone = [], consumers = null, codemods = null, siblings = 'detect', inspect = inspectSibling } = {},
) {
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
    unverifiedByRow: {},
    siblingEvidence: [],
    rowsOnHistoricalReceipts: [],
    staleReceipts: [],
    unauditedReceipts: [],
    receipts: 0,
    codemodLookup: {},
    notices: { entries: 0, named: 0 },
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

  const receipts = new Map();
  const vouched = new Set();
  const auditRecords = new Map();
  if (measurement.receiptsError) failures.push(measurement.receiptsError);
  const receiptDocument = measurement.receipts ?? null;
  if (receiptDocument !== null) {
    const shaped = typeof receiptDocument === 'object' && !Array.isArray(receiptDocument)
      && Object.keys(receiptDocument).sort().join() === [...RECEIPT_HEADER_KEYS].sort().join()
      && Array.isArray(receiptDocument.receipts);
    if (!shaped) failures.push(`${RECEIPTS_PATH}: not an object of exactly ${RECEIPT_HEADER_KEYS.join(', ')}`);
    (shaped ? receiptDocument.receipts : []).forEach((receipt, index) => {
      const label = `${RECEIPTS_PATH}: receipt ${index}${isText(receipt?.anchor) ? ` (\`${receipt.anchor}\`)` : ''}`;
      const found = receiptProblems(receipt);
      for (const problem of found) failures.push(`${label}: ${problem}`);
      if (found.length > 0) return;
      const key = receiptKey(receipt);
      if (receipts.has(key)) { failures.push(`${label}: duplicate receipt`); return; }
      receipts.set(key, receipt);
      if (!isAudited(receipt)) return;
      const unbacked = auditMarkProblems(receipt, measurement.repoRoot, auditRecords);
      for (const problem of unbacked) failures.push(`${label}: ${problem}`);
      if (unbacked.length === 0) vouched.add(key);
    });
  }
  report.receipts = receipts.size;
  const receiptsUsed = new Set();

  const context = {
    receipts,
    receiptsUsed,
    vouched,
    siblingOf: siblingLocator(measurement.repoRoot, siblings, inspect),
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
    noticesNamed: new Set(),
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
  if (codemods?.status === 'wired') {
    const notices = Array.isArray(codemods.notices) ? codemods.notices : [];
    report.notices.entries = notices.length;
    for (const entry of notices) {
      if (context.noticesNamed.has(entry.id)) {
        report.notices.named += 1;
        continue;
      }
      failures.push(
        `${CODEMOD_MAP_PATH}: notice entry \`${entry.id}\` is named by no ledger row whose receiver is listed in compatReceivers `
        + `(${compatReceivers.join(', ') || 'the list is empty'}): the symbol was retired or never ledgered, `
        + 'and a notice cannot stand in for a removal; delete the entry or state the removal',
      );
    }
  }
  for (const [key, receipt] of receipts) {
    if (!receiptsUsed.has(key)) {
      failures.push(
        `${RECEIPTS_PATH}: receipt for ${receipt.file} \`${receipt.anchor}\` (\`${receipt.kind}\` at ${receipt.path}) `
        + 'names no evidence entry of the ledger: delete it with the row or the entry',
      );
    }
  }
  for (const entry of report.unverifiedEvidence) {
    report.unverifiedByRow[entry.row] = (report.unverifiedByRow[entry.row] ?? 0) + 1;
  }

  return { failures, report };
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

export function parseArgs(argv) {
  const options = {
    check: false, json: false, consumers: false, writeReceipts: false, auditReceipts: false, by: null, record: null,
    siblings: 'detect', assumeDone: [], unknown: [],
  };
  for (const arg of argv) {
    if (arg === '--check') options.check = true;
    else if (arg === '--json') options.json = true;
    else if (arg === '--consumers') options.consumers = true;
    else if (arg === '--write-receipts') options.writeReceipts = true;
    else if (arg === '--audit-receipts') options.auditReceipts = true;
    else if (arg.startsWith('--by=') && arg.length > '--by='.length) options.by = arg.slice('--by='.length);
    else if (arg.startsWith('--record=') && arg.length > '--record='.length) options.record = arg.slice('--record='.length);
    else if (arg === '--siblings=absent') options.siblings = 'absent';
    else if (arg.startsWith('--assume-done=')) {
      options.assumeDone.push(...arg.slice('--assume-done='.length).split(',').map((id) => id.trim()).filter(Boolean));
    } else options.unknown.push(arg);
  }
  return options;
}

export async function run(
  argv,
  { packageRoot, repoRoot, resolver = loadConsumerResolver, codemodLookup = loadCodemodLookup, inspect = inspectSibling, today } = {},
) {
  const options = parseArgs(argv);
  if (options.unknown.length > 0) {
    return { code: 2, failures: [`unknown argument(s): ${options.unknown.join(' ')}`], report: null };
  }
  const checking = options.check || options.consumers || options.assumeDone.length > 0 || options.siblings !== 'detect';
  if (!options.auditReceipts && (options.by !== null || options.record !== null)) {
    return { code: 2, failures: ['--by and --record belong to --audit-receipts'], report: null };
  }
  if (options.writeReceipts || options.auditReceipts) {
    if (checking || (options.writeReceipts && options.auditReceipts)) {
      return { code: 2, failures: ['--write-receipts and --audit-receipts are modes of their own: neither combines with a check or with the other'], report: null };
    }
    if (options.auditReceipts && (options.by === null || options.record === null)) {
      return { code: 2, failures: ['--audit-receipts needs --by=<auditor> and --record=<kept audit record>'], report: null };
    }
    const measurement = measure({ packageRoot, repoRoot });
    if (measurement.ledgerError || measurement.receiptsError) {
      return { code: 1, failures: [measurement.ledgerError, measurement.receiptsError].filter(Boolean), report: null, options };
    }
    const target = join(packageRoot, RECEIPTS_PATH);
    const write = (document) => {
      mkdirSync(dirname(target), { recursive: true });
      writeFileSync(target, `${JSON.stringify(document, null, 2)}\n`);
    };
    if (options.auditReceipts) {
      const audit = auditReceipts(measurement, { by: options.by, record: options.record, inspect });
      const failures = audit.refused.map((entry) => `${entry.receipt ?? RECEIPTS_PATH}: not marked audited: ${entry.why}`);
      if (failures.length === 0) write(audit.document);
      return { code: failures.length > 0 ? 1 : 0, failures, report: null, audit, written: failures.length === 0, options };
    }
    const mint = mintReceipts(measurement, { inspect, ...(today ? { today } : {}) });
    const failures = mint.refused.map((entry) => `${entry.row}: \`${entry.kind}\` at ${entry.path}: no receipt minted: ${entry.why}`);
    if (failures.length === 0) write(mint.document);
    return { code: failures.length > 0 ? 1 : 0, failures, report: null, mint, written: failures.length === 0, options };
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
  const result = evaluate(measure({ packageRoot, repoRoot }), {
    assumeDone: options.assumeDone, consumers, codemods, siblings: options.siblings, inspect,
  });
  return { code: result.failures.length > 0 ? 1 : 0, ...result, options };
}

async function main() {
  const packageRoot = findPackageRoot(HERE);
  const repoRoot = findRepoRoot(HERE);
  const { code, failures, report, options, mint, audit, written } = await run(process.argv.slice(2), { packageRoot, repoRoot });
  if (options?.json) {
    const minted = mint ? { written, minted: mint.minted, kept: mint.kept, refused: mint.refused, dropped: mint.dropped } : undefined;
    const audited = audit ? { written, marked: audit.marked, kept: audit.kept, refused: audit.refused } : undefined;
    process.stdout.write(`${JSON.stringify({ ok: code === 0, failures, report, mint: minted, audit: audited }, null, 2)}\n`);
    process.exit(code);
  }
  if (mint) {
    console.log(
      `deprecations: ${RECEIPTS_PATH} ${written ? 'written' : 'NOT WRITTEN (a refusal leaves the file as it was)'} — `
      + `${mint.minted.length} minted, ${mint.kept.length} kept, ${mint.dropped.length} dropped, ${mint.refused.length} refused`,
    );
    for (const key of mint.minted) console.log(`  MINTED (unaudited) ${key}`);
    for (const key of mint.dropped) console.log(`  DROPPED ${key}`);
  }
  if (audit) {
    console.log(
      `deprecations: ${RECEIPTS_PATH} ${written ? 'written' : 'NOT WRITTEN (a refusal leaves the file as it was)'} — `
      + `${audit.marked.length} marked audited, ${audit.kept.length} already marked, ${audit.refused.length} refused`,
    );
    for (const key of audit.marked) console.log(`  AUDITED ${key}`);
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
    const closing = options.assumeDone.length > 0;
    const live = report.siblingEvidence.filter((entry) => entry.status === 'verified-live');
    const historical = report.siblingEvidence.filter((entry) => entry.status === 'historical-receipt');
    if (report.siblingEvidence.length > 0) {
      console.log(
        `  REPORT sibling evidence: ${live.length} verified live, ${historical.length} historical audited receipt(s), `
        + `not re-verified here, ${report.unverifiedEvidence.length} NOT VERIFIED`,
      );
    }
    if (closing) {
      for (const entry of live) {
        const backing = entry.receipt?.reproven ? `; receipt at ${entry.receipt.commit} re-proven` : '';
        console.log(`  EVIDENCE ${entry.row}: \`${entry.kind}\` verified live at ${entry.path}${backing}`);
      }
    }
    for (const entry of historical) {
      console.log(
        `  EVIDENCE ${entry.row}: \`${entry.kind}\` historical audited receipt, not re-verified here `
        + `(read at ${entry.receipt.commit}; audited ${entry.receipt.audited.at} by ${entry.receipt.audited.by}, ${entry.receipt.audited.record})`,
      );
    }
    if (report.unauditedReceipts.length > 0) {
      console.log(
        `  REPORT ${report.unauditedReceipts.length} receipt(s) carry no audited mark: integrity only, they stand in for nothing `
        + 'and are red under --assume-done',
      );
    }
    const unverifiedRows = Object.entries(report.unverifiedByRow);
    if (unverifiedRows.length > 0) {
      console.log(
        `  REPORT NOT VERIFIED: ${report.unverifiedEvidence.length} evidence entr(ies) across ${unverifiedRows.length} row(s) sit in `
        + 'sibling checkouts that are not present and have no valid receipt. These rows are not satisfied; '
        + `${closing ? 'closure fails them' : 'this run does not fail them and --assume-done would'}:`,
      );
      for (const [row, count] of unverifiedRows) console.log(`    NOT VERIFIED ${row}: ${count} entr(ies)`);
    }
    for (const stale of report.staleReceipts) {
      console.log(`  REPORT stale receipt (red under --assume-done): ${stale.row} \`${stale.kind}\` at ${stale.path}: ${stale.why}`);
    }
    if (report.notices.entries > 0) {
      console.log(
        `  REPORT notice entries: ${report.notices.entries} in the codemod map, ${report.notices.named} named by a row `
        + 'whose receiver is listed in compatReceivers',
      );
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
  if (!report) return;
  const pending = Object.keys(report.unverifiedByRow).length;
  const resting = report.rowsOnHistoricalReceipts.length;
  if (pending === 0 && resting === 0) {
    console.log('✓ every marker has one row and every row verifies');
    return;
  }
  const notes = [];
  if (resting > 0) notes.push(`${resting} row(s) rest on historical audited receipts, not re-verified here`);
  if (pending > 0) notes.push(`${pending} row(s) carry evidence that was NOT VERIFIED on this run`);
  console.log(`✓ every marker has one row and no row failed; ${notes.join('; ')}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch((error) => {
    console.error(error);
    process.exit(2);
  });
}
