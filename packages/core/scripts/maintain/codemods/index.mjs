import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { packageRoot as findPackageRoot } from '../../libraries/repo-root/index.mjs';
import { analyzeFile, createWorkspace, DEFAULT_PACKAGE } from './resolve/index.mjs';
import { createPackageSurface } from './resolve/surface/index.mjs';
import { report } from './resolve/findings/index.mjs';
import { symbolKey } from './resolve/usages/index.mjs';
import ts from 'typescript';
import { transform as cssClassRenamed } from './transforms/css-class-renamed/index.mjs';
import { transform as cssCustomPropertyRenamed } from './transforms/css-custom-property-renamed/index.mjs';
import { transform as glyphRemoved } from './transforms/glyph-removed/index.mjs';
import { transform as memberChanged } from './transforms/member-changed/index.mjs';
import { transform as propRemoved } from './transforms/prop-removed/index.mjs';
import { transform as propRenamed } from './transforms/prop-renamed/index.mjs';
import { transform as subpathRemoved } from './transforms/subpath-removed/index.mjs';
import { transform as symbolRemovedNoReplacement } from './transforms/symbol-removed-no-replacement/index.mjs';
import { transform as symbolRemoved } from './transforms/symbol-removed/index.mjs';
import { transform as unionMemberRemoved } from './transforms/union-member-removed/index.mjs';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));

export const DEFAULT_MAP = path.join(SCRIPT_DIR, 'release-3-0-map/index.json');
export const DEFAULT_STANDING = path.join(SCRIPT_DIR, 'standing-reports/index.json');
const REPOSITORY_ROOT = path.resolve(findPackageRoot(SCRIPT_DIR), '../..');

/** Subpath re-pointing runs first so a later pass sees symbols on the door the map keys them by. */
export const TRANSFORMS = Object.freeze([
  subpathRemoved,
  symbolRemoved,
  symbolRemovedNoReplacement,
  propRemoved,
  propRenamed,
  unionMemberRemoved,
  memberChanged,
  cssClassRenamed,
  cssCustomPropertyRenamed,
  glyphRemoved,
]);

export const CLASSES = Object.freeze(TRANSFORMS.map((transform) => transform.class));

const REPORT_ONLY = new Set(TRANSFORMS.filter((transform) => transform.reportOnly).map((transform) => transform.class));
const SYMBOL_CLASSES = new Set(['symbol-removed', 'symbol-removed-no-replacement', 'glyph-removed']);
const TEXTUAL_CLASSES = new Set(['subpath-removed', 'css-class-renamed', 'css-custom-property-renamed']);
const RESOLVER_CLASS = 'resolver';
const SOURCE_EXTENSION = /\.[cm]?[jt]sx?$/;
const STYLESHEET_EXTENSION = /\.(css|scss|sass|less)$/;
const SKIPPED_ANYWHERE = new Set(['node_modules', '.git']);
const SKIPPED_AT_OPERAND_ROOT = new Set(['.next', 'dist', 'coverage', '.turbo', 'build', 'out']);
const SUBPATH = /^\.(\/[A-Za-z0-9._*-]+)*$/;
const ID = /^([a-z][a-z-]*)\/(\.(?:\/[A-Za-z0-9._*-]+)*)#([A-Za-z_$*][\w$]*|\*)(?:\.([\w$-]+))?$/;
const MEMBER_NAME = /^[A-Za-z_$][\w$]*$/;
const RELEASE_LINE = /^(\d+)\.(\d+)$/;
const MAX_PASSES = 6;
const STANDING_ROW_KEYS = ['id', 'file', 'count', 'class', 'proof', 'why'];
const GLOB = /[*?[\]{}!]/;

/** The shape every map id has: `<class>/<subpath>#<symbol>` with an optional `.<member>`. */
export function parseEntryId(id) {
  const match = ID.exec(id);
  if (!match) return null;
  return { class: match[1], subpath: match[2], symbol: match[3], member: match[4] ?? null };
}

function fail(id, message) {
  throw new Error(`codemod map: ${id}: ${message}`);
}

function requireText(entry, field) {
  if (typeof entry[field] !== 'string' || entry[field].trim() === '') fail(entry.id, `\`${field}\` must be a non-empty string`);
}

function requireComponents(entry) {
  if (!Array.isArray(entry.components) || entry.components.length === 0) fail(entry.id, '`components` must name at least one component');
}

/**
 * The two proofs a member-changed entry may state. `memberProof: "spelling"` needs the members it is about;
 * `maxArguments` is about a call's parameters, so it names no member. Each silences a site, so each is
 * refused wherever it would be read by a transform that does not implement it.
 */
function requireMemberProof(entry) {
  const members = entry.members ?? (entry.member ? [entry.member] : []);
  if (entry.members !== undefined && (!Array.isArray(entry.members) || entry.members.length === 0
    || entry.members.some((member) => typeof member !== 'string' || !MEMBER_NAME.test(member)))) {
    fail(entry.id, '`members` must be a non-empty list of member names');
  }
  if (entry.memberProof !== undefined) {
    if (entry.memberProof !== 'spelling') fail(entry.id, '`memberProof` is `spelling` or absent');
    if (members.length === 0) fail(entry.id, '`memberProof` needs the `member` or `members` it proves absent');
    if (entry.maxArguments !== undefined) fail(entry.id, 'state one proof: `memberProof` or `maxArguments`');
  }
  if (entry.maxArguments !== undefined) {
    if (!Number.isInteger(entry.maxArguments) || entry.maxArguments < 0) fail(entry.id, '`maxArguments` must be a non-negative integer');
    if (members.length > 0) fail(entry.id, '`maxArguments` is about a call, not a member; the entry names no member');
  }
}

/**
 * A notice is the entry a deprecation that outlives this line is told through: nothing is removed here,
 * `notice.removeIn` names the later line that removes it. It migrates nothing, so only a report-only
 * member-changed entry may carry one, and its `change` and `guidance` must say both halves.
 */
function requireNotice(entry, line) {
  if (entry.class !== 'member-changed' || entry.mode !== 'report-only') {
    fail(entry.id, '`notice` is stated by a report-only member-changed entry only');
  }
  const { notice } = entry;
  if (notice === null || typeof notice !== 'object' || Array.isArray(notice) || Object.keys(notice).join() !== 'removeIn') {
    fail(entry.id, '`notice` is exactly `{ removeIn }`');
  }
  const later = RELEASE_LINE.exec(typeof notice.removeIn === 'string' ? notice.removeIn : '');
  const current = RELEASE_LINE.exec(typeof line === 'string' ? line : '');
  if (!later) fail(entry.id, '`notice.removeIn` must be a release line (for example `4.0`)');
  if (!current) fail(entry.id, '`notice` needs the release line of the map to compare `removeIn` against');
  if (Number(later[1]) < Number(current[1]) || (Number(later[1]) === Number(current[1]) && Number(later[2]) <= Number(current[2]))) {
    fail(entry.id, `\`notice.removeIn\` ${notice.removeIn} is not later than the ${line} line: a removal in this line is not a notice`);
  }
  const quoted = (text) => text.replace(/\./g, '\\.');
  if (!new RegExp(`^not (removed|narrowed) in ${quoted(line)}(?!\\d|\\.\\d)`).test(entry.change)) {
    fail(entry.id, `the \`change\` of a notice opens with \`not removed in ${line}\` (or \`not narrowed in ${line}\`)`);
  }
  if (!new RegExp(`(^|[^\\d.])${quoted(notice.removeIn)}(?!\\d|\\.\\d)`).test(entry.guidance)) {
    fail(entry.id, `the \`guidance\` of a notice names the ${notice.removeIn} line and what it will ask`);
  }
}

function validateEntry(entry, line) {
  const parsed = parseEntryId(entry.id ?? '');
  if (!parsed) fail(String(entry.id), 'id is not `<class>/<subpath>#<symbol>[.<member>]`');
  if (!CLASSES.includes(entry.class)) fail(entry.id, `unknown class \`${entry.class}\``);
  if (parsed.class !== entry.class || parsed.subpath !== entry.subpath || parsed.symbol !== entry.symbol
    || parsed.member !== (entry.member ?? null)) fail(entry.id, 'id does not restate class, subpath, symbol and member');
  for (const field of ['changeset', 'census']) requireText(entry, field);
  if (entry.class !== 'member-changed' && (entry.memberProof !== undefined || entry.maxArguments !== undefined)) {
    fail(entry.id, '`memberProof` and `maxArguments` are proofs of a member-changed entry only');
  }
  const hasResolves = typeof entry.resolves === 'string';
  const hasImpossible = typeof entry.impossible === 'string';
  if (hasResolves === hasImpossible) fail(entry.id, 'state exactly one of `resolves` or `impossible`');
  if (!['rewrite', 'report-only'].includes(entry.mode)) fail(entry.id, '`mode` is `rewrite` or `report-only`');
  if (REPORT_ONLY.has(entry.class) && entry.mode !== 'report-only') fail(entry.id, `class \`${entry.class}\` is report-only`);
  if (entry.mode === 'report-only') requireText(entry, 'impossible');
  if (entry.replacement?.subpath !== undefined && !SUBPATH.test(entry.replacement.subpath)) {
    fail(entry.id, `replacement \`${entry.replacement.subpath}\` is not a package subpath`);
  }
  switch (entry.class) {
    case 'symbol-removed':
      if (!entry.replacement?.subpath || !entry.replacement.symbol) fail(entry.id, 'needs `replacement.subpath` and `replacement.symbol`');
      break;
    case 'symbol-removed-no-replacement':
    case 'glyph-removed':
      if (entry.replacement) fail(entry.id, 'a report-only symbol entry states no replacement');
      requireText(entry, 'guidance');
      break;
    case 'prop-removed':
      requireComponents(entry);
      requireText(entry, 'member');
      break;
    case 'prop-renamed':
      requireComponents(entry);
      requireText(entry, 'member');
      if (!entry.replacement?.member) fail(entry.id, 'needs `replacement.member`');
      break;
    case 'union-member-removed':
      requireComponents(entry);
      requireText(entry, 'member');
      requireText(entry, 'prop');
      break;
    case 'subpath-removed':
      if (entry.replacement !== null && !entry.replacement?.subpath) fail(entry.id, '`replacement` is `{ subpath }` or null');
      if (!['module', 'stylesheet'].includes(entry.kind)) fail(entry.id, '`kind` is `module` or `stylesheet`');
      if (entry.replacement === null) requireText(entry, 'guidance');
      break;
    case 'css-class-renamed':
      if (!entry.classes || Object.keys(entry.classes).length === 0) fail(entry.id, 'needs a `classes` table');
      break;
    case 'css-custom-property-renamed':
      if (Object.keys(entry.properties ?? {}).length + Object.keys(entry.prefixes ?? {}).length === 0) {
        fail(entry.id, 'needs a `properties` or `prefixes` table');
      }
      for (const name of [...Object.keys(entry.properties ?? {}), ...Object.keys(entry.prefixes ?? {})]) {
        if (!name.startsWith('--')) fail(entry.id, `\`${name}\` is not a custom property name`);
      }
      break;
    case 'member-changed':
      if (entry.replacement) fail(entry.id, 'a member-changed entry states no replacement; say it in `guidance`');
      requireText(entry, 'change');
      requireText(entry, 'guidance');
      requireMemberProof(entry);
      break;
    default:
  }
  if (entry.notice !== undefined) requireNotice(entry, line);
}

export function loadMap(mapPath = DEFAULT_MAP) {
  const raw = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
  if (raw.schemaVersion !== 1) throw new Error(`codemod map: unsupported schemaVersion ${raw.schemaVersion}`);
  const groups = raw.groups ?? {};
  const entries = [];
  const byId = new Map();
  for (const authored of raw.entries) {
    if (authored.group !== undefined && !groups[authored.group]) fail(String(authored.id), `unknown group \`${authored.group}\``);
    const entry = { ...(authored.group ? groups[authored.group] : {}), ...authored };
    validateEntry(entry, raw.line);
    if (byId.has(entry.id)) fail(entry.id, 'duplicate id');
    for (const alias of entry.aliases ?? []) {
      if (!parseEntryId(alias)) fail(entry.id, `alias \`${alias}\` is not an entry id`);
      if (byId.has(alias)) fail(entry.id, `alias \`${alias}\` collides with another id`);
    }
    byId.set(entry.id, entry);
    for (const alias of entry.aliases ?? []) byId.set(alias, entry);
    entries.push(Object.freeze(entry));
  }
  const symbolIndex = new Map();
  const memberRoots = new Set();
  for (const entry of entries) {
    if (!SYMBOL_CLASSES.has(entry.class)) continue;
    if (entry.member) memberRoots.add(symbolKey(entry.subpath, entry.symbol));
    else symbolIndex.set(symbolKey(entry.subpath, entry.symbol), entry);
  }
  return {
    path: mapPath, line: raw.line, packageName: raw.package ?? DEFAULT_PACKAGE, entries, byId, symbolIndex, memberRoots,
  };
}

/** True when the map (default: the 3.0 line) carries an entry, or an alias, with this id. */
export function hasEntry(id, mapPath = DEFAULT_MAP) {
  return loadMap(mapPath).byId.has(id);
}

export function collectFiles(operands) {
  const files = [];
  const visit = (target, atOperandRoot) => {
    const stat = fs.statSync(target);
    if (stat.isFile()) {
      if (SOURCE_EXTENSION.test(target) || STYLESHEET_EXTENSION.test(target)) files.push(target);
      return;
    }
    for (const item of fs.readdirSync(target, { withFileTypes: true })) {
      if (item.isDirectory() && SKIPPED_ANYWHERE.has(item.name)) continue;
      if (item.isDirectory() && atOperandRoot && SKIPPED_AT_OPERAND_ROOT.has(item.name)) continue;
      if (item.isSymbolicLink()) continue;
      visit(path.join(target, item.name), false);
    }
  };
  for (const operand of operands) visit(path.resolve(operand), true);
  return [...new Set(files)].sort();
}

function createContext({ map, surface, options, cwd }) {
  const workspace = createWorkspace({ packageName: map.packageName });
  const analyses = new Map();
  return {
    packageName: map.packageName,
    map,
    surface,
    options,
    workspace,
    analyses,
    analysis(file) {
      if (!analyses.has(file)) analyses.set(file, analyzeFile(workspace, file));
      return analyses.get(file);
    },
    relative: (file) => path.relative(cwd, file) || file,
  };
}

function applyEdits(text, edits) {
  let output = text;
  for (const edit of [...edits].sort((left, right) => right.start - left.start)) {
    output = `${output.slice(0, edit.start)}${edit.text}${output.slice(edit.end)}`;
  }
  return output;
}

/** Keeps every rewrite whose splices are disjoint from the ones already kept; the rest become reports. */
function admit(findings) {
  const taken = [];
  const edits = [];
  for (const item of findings) {
    if (item.action !== 'rewrite') continue;
    const unique = item.edits.filter((edit) => !taken.some((other) => other.start === edit.start
      && other.end === edit.end && other.text === edit.text));
    const clash = unique.some((edit) => taken.some((other) => edit.start < other.end && other.start < edit.end));
    if (clash) {
      item.action = 'report';
      item.reason = 'overlapping-edit';
      item.message = `${item.message}: overlaps another planned edit; run again after writing`;
      item.edits = [];
      continue;
    }
    taken.push(...unique);
    edits.push(...unique);
  }
  return edits;
}

/** `mode: "report-only"` is law: whatever a transform planned for such an entry is reported and never written. */
function enforceMode(map, findings) {
  for (const item of findings) {
    if (item.action !== 'rewrite') continue;
    const entry = map.byId.get(item.id);
    if (entry?.mode !== 'report-only') continue;
    item.action = 'report';
    item.reason = 'report-only';
    item.message = `${item.message}: not written, the map entry is report-only (${entry.impossible})`;
    item.edits = [];
  }
}

function reportKey(item) {
  return `${item.id}\0${item.reason}\0${item.excerpt}`;
}

/**
 * What the resolver could not stand behind in this file, one report each: the package name mapped to a
 * local folder by tsconfig `paths`, and consumer-shaped specifiers that resolve to no readable module.
 */
function resolverFindings(context, analysis) {
  const { workspace, file, sourceFile } = analysis;
  const aliased = [];
  const unresolved = [];
  for (const statement of sourceFile.statements) {
    if (!ts.isImportDeclaration(statement) && !ts.isExportDeclaration(statement)) continue;
    const literal = statement.moduleSpecifier;
    if (!literal || !ts.isStringLiteral(literal)) continue;
    if (workspace.isPackageAliased(literal.text, file)) aliased.push(literal);
    else if (!workspace.packageSubpath(literal.text, file) && workspace.isUnresolved(literal.text, file)) unresolved.push(literal);
  }
  const findings = [];
  const names = (literals) => [...new Set(literals.map((literal) => `\`${literal.text}\``))].join(', ');
  if (aliased.length > 0) {
    findings.push(report(analysis, { id: `${RESOLVER_CLASS}/.#PackageAlias`, class: RESOLVER_CLASS }, aliased[0],
      'package-aliased-locally',
      `tsconfig \`paths\` maps ${names(aliased)} to a local folder, so these imports are consumer code and nothing in this file is edited through them`));
  }
  if (unresolved.length > 0) {
    findings.push(report(analysis, { id: `${RESOLVER_CLASS}/.#UnresolvedSpecifier`, class: RESOLVER_CLASS }, unresolved[0],
      'unresolved-specifier',
      `${names(unresolved)} resolve to no readable module (no tsconfig alias or missing file); bindings imported through them are treated as not the design system`));
  }
  return findings;
}

function planSource(context, file, groups) {
  const original = context.workspace.parse(file).text;
  const findings = [];
  const seenReports = new Set();
  let text = original;
  for (let pass = 0; pass < MAX_PASSES; pass += 1) {
    const analysis = context.analysis(file);
    const reaches = analysis.reachesPackage();
    const current = pass === 0 && context.options.diagnostics ? resolverFindings(context, analysis) : [];
    for (const { transform, entries } of groups) {
      if (!reaches && !TEXTUAL_CLASSES.has(transform.class)) continue;
      current.push(...transform.run(context, analysis, entries));
    }
    enforceMode(context.map, current);
    const edits = admit(current);
    for (const item of current) {
      if (item.action === 'report') {
        const key = reportKey(item);
        if (seenReports.has(key) && pass > 0) continue;
        seenReports.add(key);
      }
      findings.push(item);
    }
    if (edits.length === 0) break;
    text = applyEdits(text, edits);
    context.workspace.overlay(file, text);
    context.analyses.delete(file);
  }
  if (text !== original) {
    context.workspace.overlay(file, original);
    context.analyses.delete(file);
  }
  return { findings, output: text, changed: text !== original };
}

function planStylesheet(context, file, groups) {
  const text = fs.readFileSync(file, 'utf8');
  const code = text.replace(/\/\*[\s\S]*?\*\//g, (comment) => comment.replace(/[^\n]/g, ' '));
  const sheet = {
    file,
    text,
    code,
    report(entry, index, token, reason, message) {
      const before = text.slice(0, index);
      const line = before.split('\n').length;
      const lineStart = before.lastIndexOf('\n') + 1;
      const lineEnd = text.indexOf('\n', index);
      return {
        id: entry.id,
        class: entry.class,
        file,
        line,
        column: index - lineStart + 1,
        action: 'report',
        reason,
        message,
        excerpt: text.slice(lineStart, lineEnd < 0 ? text.length : lineEnd).trim().slice(0, 96),
        edits: [],
      };
    },
  };
  const findings = [];
  for (const { transform, entries } of groups) {
    if (transform.runStylesheet) findings.push(...transform.runStylesheet(context, sheet, entries));
  }
  return { findings, output: text, changed: false };
}

function summarize(findings, scanned, changed) {
  const byClass = {};
  const byEntry = {};
  const files = new Set();
  for (const className of [...CLASSES, RESOLVER_CLASS]) byClass[className] = { rewrite: 0, report: 0, reasons: {} };
  for (const item of findings) {
    files.add(item.file);
    const bucket = byClass[item.class];
    bucket[item.action] += 1;
    bucket.reasons[item.reason] = (bucket.reasons[item.reason] ?? 0) + 1;
    byEntry[item.id] ??= { rewrite: 0, report: 0 };
    byEntry[item.id][item.action] += 1;
  }
  return {
    files: { scanned, withFindings: files.size, changed },
    totals: {
      rewrite: findings.filter((item) => item.action === 'rewrite').length,
      report: findings.filter((item) => item.action === 'report').length,
    },
    byClass,
    byEntry: Object.fromEntries(Object.entries(byEntry).sort(([left], [right]) => left.localeCompare(right))),
  };
}

/**
 * Plans the map over the operands and writes only when `write` is true. Each file is planned to a fixpoint
 * in memory against the on-disk state of the others, so a dry-run prints what `write` does and a rerun is a no-op.
 */
export function runCodemods({
  operands,
  map = loadMap(),
  surface = null,
  write = false,
  classes = null,
  only = null,
  assumeLtr = false,
  cwd = process.cwd(),
}) {
  const selected = map.entries.filter((entry) => (!classes || classes.includes(entry.class))
    && (!only || only.includes(entry.id)));
  const groups = TRANSFORMS
    .filter((transform) => !classes || classes.includes(transform.class))
    .map((transform) => ({ transform, entries: selected.filter((entry) => entry.class === transform.class) }))
    .filter((group) => group.entries.length > 0 || (group.transform.class === 'subpath-removed' && !only));
  const context = createContext({ map, surface, options: { assumeLtr, only, diagnostics: !only && !classes }, cwd });
  const files = collectFiles(operands);
  const findings = [];
  let changed = 0;
  for (const file of files) {
    const plan = SOURCE_EXTENSION.test(file) ? planSource(context, file, groups) : planStylesheet(context, file, groups);
    findings.push(...plan.findings);
    if (!plan.changed) continue;
    changed += 1;
    if (write) fs.writeFileSync(file, plan.output);
  }
  for (const item of findings) delete item.edits;
  return { mode: write ? 'write' : 'dry-run', findings, summary: summarize(findings, files.length, changed) };
}

function standingFail(where, message) {
  throw new Error(`standing register: ${where}: ${message}`);
}

/**
 * The register of reports `--check` lets stand. Each row names one (id, file) by literal path, the count
 * it may not exceed, its class and, for a member row, the proof kind the kit must keep finding there.
 */
export function loadStanding(standingPath = DEFAULT_STANDING) {
  const raw = JSON.parse(fs.readFileSync(standingPath, 'utf8'));
  if (raw.schemaVersion !== 1) standingFail(standingPath, `unsupported schemaVersion ${raw.schemaVersion}`);
  if (!Number.isInteger(raw.ceiling) || raw.ceiling < 0) standingFail(standingPath, '`ceiling` must be a non-negative integer');
  if (!Array.isArray(raw.rows)) standingFail(standingPath, '`rows` must be a list');
  const keys = new Set();
  for (const row of raw.rows) {
    const where = `${row?.id} ${row?.file}`;
    if (row === null || typeof row !== 'object' || Object.keys(row).some((key) => !STANDING_ROW_KEYS.includes(key))) {
      standingFail(where, `a row is \`{ ${STANDING_ROW_KEYS.join(', ')} }\``);
    }
    if (!parseEntryId(String(row.id))) standingFail(where, '`id` is not an entry id');
    if (typeof row.file !== 'string' || path.isAbsolute(row.file) || row.file.split('/').includes('..') || GLOB.test(row.file)
      || !(SOURCE_EXTENSION.test(row.file) || STYLESHEET_EXTENSION.test(row.file))) {
      standingFail(where, '`file` is one source file by literal relative path: no glob, no directory');
    }
    if (!Number.isInteger(row.count) || row.count < 1) standingFail(where, '`count` must be a positive integer');
    if (typeof row.why !== 'string' || row.why.trim() === '') standingFail(where, '`why` must be a non-empty string');
    if (!STANDING_CLASSES[row.class]) standingFail(where, `unknown class \`${row.class}\`; known: ${Object.keys(STANDING_CLASSES).join(', ')}`);
    if (row.class === 'retirement-assertion' ? row.proof !== undefined : typeof row.proof !== 'string') {
      standingFail(where, `a \`${row.class}\` row ${row.class === 'retirement-assertion' ? 'states no' : 'pins its'} \`proof\``);
    }
    const key = `${row.id}\0${row.file}`;
    if (keys.has(key)) standingFail(where, 'duplicate (id, file)');
    keys.add(key);
  }
  const total = raw.rows.reduce((sum, row) => sum + row.count, 0);
  if (total !== raw.ceiling) standingFail(standingPath, `the rows sum to ${total}, the header \`ceiling\` is ${raw.ceiling}`);
  return { path: standingPath, ceiling: raw.ceiling, rows: raw.rows };
}

/** What each class admits. A row the id, path, reason or proof of its findings does not fit is refused. */
const STANDING_CLASSES = Object.freeze({
  'retirement-assertion': {
    path: (file) => file.startsWith('packages/core/src/') && file.split('/').includes('tests'),
    reasons: new Set(['string-literal', 'unmapped-unpublished-subpath']),
    proofs: null,
  },
  'member-report': {
    path: (file) => file.startsWith('packages/showroom/src/'),
    reasons: new Set(['member-changed']),
    proofs: new Set(['spelled', 'import']),
    reportOnlyMember: true,
  },
  'member-carrier': {
    path: (file) => file.startsWith('packages/showroom/src/'),
    reasons: new Set(['member-changed']),
    proofs: new Set(['carrier']),
    reportOnlyMember: true,
  },
});

function admission(row, map) {
  const law = STANDING_CLASSES[row.class];
  if (!law.path(row.file)) return `class \`${row.class}\` does not admit the path`;
  if (law.reportOnlyMember) {
    const entry = map.byId.get(row.id);
    if (parseEntryId(row.id).class !== 'member-changed' || entry?.id !== row.id || entry.mode !== 'report-only') {
      return `class \`${row.class}\` admits only the id of a report-only member-changed entry`;
    }
  }
  if (law.proofs && !law.proofs.has(row.proof)) return `class \`${row.class}\` does not admit \`proof: ${row.proof}\``;
  return null;
}

/**
 * `--check` against the register: red on any rewrite, any report no row names, a row its findings exceed,
 * fall short of or contradict in proof, reason or class. Row paths are relative to `root`. A row is judged
 * only when the run covers its file and its id; one it does not cover is counted and left alone.
 */
export function checkStanding({
  findings, standing, map, operands, root, cwd = process.cwd(), classes = null, only = null,
}) {
  const relative = (file) => path.relative(root, file).split(path.sep).join('/');
  const scanned = operands.map((operand) => path.resolve(cwd, operand));
  const covered = (row) => {
    const target = path.resolve(root, row.file);
    if (!scanned.some((operand) => target === operand || target.startsWith(`${operand}${path.sep}`))) return false;
    if (classes && !classes.includes(parseEntryId(row.id).class)) return false;
    return !only || only.includes(row.id);
  };
  const violations = [];
  for (const row of standing.rows) {
    const refused = admission(row, map);
    if (refused) violations.push({ kind: 'class-refused', id: row.id, file: row.file, message: refused });
  }
  const live = new Map();
  for (const item of findings) {
    const file = relative(item.file);
    if (item.action === 'rewrite') {
      violations.push({ kind: 'rewrite', id: item.id, file, message: `L${item.line} a rewrite is never registrable; write it` });
      continue;
    }
    const key = `${item.id}\0${file}`;
    if (!live.has(key)) live.set(key, { id: item.id, file, items: [] });
    live.get(key).items.push(item);
  }
  const rows = new Map(standing.rows.map((row) => [`${row.id}\0${row.file}`, row]));
  let reports = 0;
  for (const [key, { id, file, items }] of live) {
    const row = rows.get(key);
    if (!row) {
      for (const item of items) violations.push({ kind: 'unregistered', id, file, message: `L${item.line} [${item.reason}] no register row` });
      continue;
    }
    reports += Math.min(items.length, row.count);
    if (items.length > row.count) violations.push({ kind: 'above-pin', id, file, message: `${items.length} live, the row stands at ${row.count}` });
    const law = STANDING_CLASSES[row.class];
    const reasons = [...new Set(items.map((item) => item.reason))].filter((reason) => !law.reasons.has(reason));
    if (reasons.length > 0) violations.push({ kind: 'class-refused', id, file, message: `class \`${row.class}\` does not admit reason ${reasons.join(', ')}` });
    const proofs = [...new Set(items.map((item) => item.proof ?? null))];
    if (proofs.length !== 1 || proofs[0] !== (row.proof ?? null)) {
      violations.push({ kind: 'proof-differs', id, file, message: `live proof ${proofs.map((proof) => proof ?? 'none').join(', ')}, the row pins ${row.proof ?? 'none'}` });
    }
  }
  let evaluated = 0;
  for (const row of standing.rows) {
    if (!covered(row)) continue;
    evaluated += 1;
    const count = live.get(`${row.id}\0${row.file}`)?.items.length ?? 0;
    if (count < row.count) {
      violations.push({
        kind: count === 0 ? 'zero' : 'below-pin',
        id: row.id,
        file: row.file,
        message: `${count} live, the row stands at ${row.count}: lower or delete the row in this lot`,
      });
    }
  }
  return { path: standing.path, ceiling: standing.ceiling, reports, rows: evaluated, outside: standing.rows.length - evaluated, violations };
}

function standingLine(result, options, cwd) {
  if (!result) return 'standing: not read (--no-standing)';
  const notes = [];
  if (result.path !== DEFAULT_STANDING) notes.push(`register ${path.relative(cwd, result.path)}`);
  if (options.mapPath !== DEFAULT_MAP) notes.push(`map ${path.relative(cwd, options.mapPath)}`);
  if (result.outside > 0) notes.push(`${result.outside} row(s) outside this run, not judged`);
  return `standing: ${result.reports} report(s) in ${result.rows} row(s), ceiling ${result.ceiling}${notes.length > 0 ? ` (${notes.join('; ')})` : ''}`;
}

const USAGE = `Usage: node scripts/maintain/codemods/index.mjs [--dry-run | --write | --check] [options] <file-or-directory> [...]

  --dry-run          plan and report; write nothing (default)
  --write            apply every proven rewrite; reports are still printed
  --check            dry-run that exits 1 on any rewrite and on any report the standing register does not hold
  --no-standing      with --check: read no register, exit 1 while any finding remains
  --standing <path>  standing register (default: standing-reports/index.json, its paths relative to the
                     repository root); the paths of a register given here are relative to the cwd
  --map <path>       codemod map (default: release-3-0-map/index.json)
  --class <name>     limit to one change class (repeatable)
  --only <id>        limit to one map entry id (repeatable)
  --assume-ltr       allow physical -> logical side rewrites
  --json             print the summary and findings as JSON
  --quiet            print the summary only`;

function parseArguments(argv) {
  const options = {
    write: false, check: false, json: false, quiet: false, assumeLtr: false, classes: [], only: [], operands: [], mapPath: DEFAULT_MAP,
    standing: true, standingPath: DEFAULT_STANDING,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    const value = () => {
      index += 1;
      if (index >= argv.length) throw new Error(`${argument} needs a value`);
      return argv[index];
    };
    if (argument === '--write') options.write = true;
    else if (argument === '--dry-run') options.dryRun = true;
    else if (argument === '--check') options.check = true;
    else if (argument === '--json') options.json = true;
    else if (argument === '--quiet') options.quiet = true;
    else if (argument === '--assume-ltr') options.assumeLtr = true;
    else if (argument === '--map') options.mapPath = path.resolve(value());
    else if (argument === '--no-standing') options.standing = false;
    else if (argument === '--standing') options.standingPath = path.resolve(value());
    else if (argument === '--class') options.classes.push(value());
    else if (argument === '--only') options.only.push(value());
    else if (argument.startsWith('--')) throw new Error(`unknown option ${argument}`);
    else options.operands.push(argument);
  }
  if (options.write && (options.check || options.dryRun)) throw new Error('--write excludes --check and --dry-run');
  if (options.operands.length === 0) throw new Error('no file or directory given');
  if (!options.standing && options.standingPath !== DEFAULT_STANDING) throw new Error('--standing excludes --no-standing');
  if ((!options.standing || options.standingPath !== DEFAULT_STANDING) && !options.check) throw new Error('--standing and --no-standing need --check');
  for (const name of options.classes) if (!CLASSES.includes(name)) throw new Error(`unknown class ${name}; known: ${CLASSES.join(', ')}`);
  return options;
}

function printReport(result, options, cwd, standing) {
  const verb = result.mode === 'write' ? 'REWROTE' : 'REWRITE';
  if (!options.quiet) {
    let currentFile = null;
    for (const item of result.findings) {
      if (item.file !== currentFile) {
        currentFile = item.file;
        console.log(`\n${path.relative(cwd, item.file)}`);
      }
      const label = item.action === 'rewrite' ? verb : 'REPORT ';
      console.log(`  ${label} ${item.line}:${item.column} ${item.id} [${item.reason}] ${item.message}`);
      console.log(`          ${item.excerpt}`);
    }
  }
  const { summary } = result;
  console.log(`\ncodemods mode=${options.check ? 'check' : result.mode} files=${summary.files.scanned} `
    + `filesWithFindings=${summary.files.withFindings} filesChanged=${result.mode === 'write' ? summary.files.changed : 0} `
    + `wouldChange=${summary.files.changed} rewrite=${summary.totals.rewrite} report=${summary.totals.report}`);
  for (const [className, bucket] of Object.entries(summary.byClass)) {
    const reasons = Object.entries(bucket.reasons).map(([reason, count]) => `${reason}=${count}`).join(' ');
    console.log(`  ${className.padEnd(30)} rewrite=${String(bucket.rewrite).padEnd(5)} report=${String(bucket.report).padEnd(5)} ${reasons}`);
  }
  if (!options.check) return;
  for (const violation of standing?.violations ?? []) {
    console.log(`  STANDING ${violation.kind} ${violation.id} ${violation.file}: ${violation.message}`);
  }
  console.log(standingLine(standing, options, cwd));
}

function runCli() {
  let options;
  try {
    options = parseArguments(process.argv.slice(2));
  } catch (error) {
    console.error(`${error.message}\n\n${USAGE}`);
    process.exitCode = 2;
    return;
  }
  const cwd = process.cwd();
  const map = loadMap(options.mapPath);
  let register = null;
  if (options.check && options.standing) {
    try {
      register = loadStanding(options.standingPath);
    } catch (error) {
      console.error(error.message);
      process.exitCode = 2;
      return;
    }
  }
  const unknown = options.only.filter((id) => !map.byId.has(id));
  if (unknown.length > 0) {
    console.error(`no map entry ${unknown.join(', ')}\n\n${USAGE}`);
    process.exitCode = 2;
    return;
  }
  const result = runCodemods({
    operands: options.operands,
    map,
    surface: createPackageSurface(findPackageRoot(SCRIPT_DIR)),
    write: options.write,
    classes: options.classes.length > 0 ? options.classes : null,
    only: options.only.length > 0 ? options.only.map((id) => map.byId.get(id).id) : null,
    assumeLtr: options.assumeLtr,
    cwd,
  });
  const standing = register && checkStanding({
    findings: result.findings,
    standing: register,
    map,
    operands: options.operands,
    root: options.standingPath === DEFAULT_STANDING ? REPOSITORY_ROOT : cwd,
    cwd,
    classes: options.classes.length > 0 ? options.classes : null,
    only: options.only.length > 0 ? options.only.map((id) => map.byId.get(id).id) : null,
  });
  if (options.json) {
    const findings = result.findings.map((item) => ({ ...item, file: path.relative(cwd, item.file) }));
    const output = { mode: options.check ? 'check' : result.mode, map: path.relative(cwd, map.path), line: map.line, roots: options.operands, summary: result.summary, findings };
    if (options.check) output.standing = standing ? { ...standing, path: path.relative(cwd, standing.path), line: standingLine(standing, options, cwd) } : null;
    console.log(JSON.stringify(output, null, 2));
  } else {
    printReport(result, options, cwd, standing);
  }
  if (!options.check) return;
  if (standing ? standing.violations.length > 0 : result.findings.length > 0) process.exitCode = 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) runCli();
