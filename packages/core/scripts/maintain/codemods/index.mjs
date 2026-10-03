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

export const DEFAULT_MAP = path.join(SCRIPT_DIR, 'maps/3.0/index.json');

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
const MAX_PASSES = 6;

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

function validateEntry(entry) {
  const parsed = parseEntryId(entry.id ?? '');
  if (!parsed) fail(String(entry.id), 'id is not `<class>/<subpath>#<symbol>[.<member>]`');
  if (!CLASSES.includes(entry.class)) fail(entry.id, `unknown class \`${entry.class}\``);
  if (parsed.class !== entry.class || parsed.subpath !== entry.subpath || parsed.symbol !== entry.symbol
    || parsed.member !== (entry.member ?? null)) fail(entry.id, 'id does not restate class, subpath, symbol and member');
  for (const field of ['changeset', 'census']) requireText(entry, field);
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
      break;
    default:
  }
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
    validateEntry(entry);
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

const USAGE = `Usage: node scripts/maintain/codemods/index.mjs [--dry-run | --write | --check] [options] <file-or-directory> [...]

  --dry-run          plan and report; write nothing (default)
  --write            apply every proven rewrite; reports are still printed
  --check            dry-run that exits 1 while any finding remains
  --map <path>       codemod map (default: maps/3.0/index.json)
  --class <name>     limit to one change class (repeatable)
  --only <id>        limit to one map entry id (repeatable)
  --assume-ltr       allow physical -> logical side rewrites
  --json             print the summary and findings as JSON
  --quiet            print the summary only`;

function parseArguments(argv) {
  const options = { write: false, check: false, json: false, quiet: false, assumeLtr: false, classes: [], only: [], operands: [], mapPath: DEFAULT_MAP };
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
    else if (argument === '--class') options.classes.push(value());
    else if (argument === '--only') options.only.push(value());
    else if (argument.startsWith('--')) throw new Error(`unknown option ${argument}`);
    else options.operands.push(argument);
  }
  if (options.write && (options.check || options.dryRun)) throw new Error('--write excludes --check and --dry-run');
  if (options.operands.length === 0) throw new Error('no file or directory given');
  for (const name of options.classes) if (!CLASSES.includes(name)) throw new Error(`unknown class ${name}; known: ${CLASSES.join(', ')}`);
  return options;
}

function printReport(result, options, cwd) {
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
  if (options.json) {
    const findings = result.findings.map((item) => ({ ...item, file: path.relative(cwd, item.file) }));
    console.log(JSON.stringify({ mode: options.check ? 'check' : result.mode, map: path.relative(cwd, map.path), line: map.line, roots: options.operands, summary: result.summary, findings }, null, 2));
  } else {
    printReport(result, options, cwd);
  }
  if (options.check && result.findings.length > 0) process.exitCode = 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) runCli();
