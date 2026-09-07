#!/usr/bin/env node
/**
 * contract-changeset — a change to the guaranteed surface arrives with its
 * release declaration, or it does not arrive.
 *
 * WHY THIS EXISTS. Milestone A decouples two autonomous tracks: one agent
 * improves the design system, another builds an application against it. The
 * decoupling is a version pin, and a version pin is only worth the changeset
 * that moves it. Without a mechanical requirement, a signature under
 * `src/entrypoints/` changes, no version is bumped, the applications pinned to
 * the previous version silently disagree with the package they name, and the
 * first symptom is a build failure in a repository this one is not allowed to
 * touch.
 *
 * WHY THE PREVIOUS CHECK COULD NOT FAIL. The inline CI step this replaces
 * asked whether ANY file matched `.changeset/*.md` minus the README. One such
 * file is committed on `main` and stays there by design — the retained 3.0
 * changeset of WO-RET-01, finalized at publish time. So the condition was
 * satisfied by the repository itself, on every branch, forever: a gate that
 * was structurally incapable of reporting the defect it was written for. This
 * one counts only the changesets the RANGE introduces, which is the only
 * population that can describe the range's own changes.
 *
 * THE THREE PATH CLASSES.
 *   contract — the guaranteed surface an application programs against:
 *              `src/entrypoints/**`, the published subpath map, and the
 *              consumer-contract documents. All of it needs a changeset; the
 *              signature half additionally needs a `contract-diff` block
 *              naming what moved, because a version number alone does not tell
 *              a reader which import to re-read.
 *   library  — the rest of `packages/core/`: shipped bytes that need a version
 *              to travel, but not a contract announcement.
 *   exempt   — `packages/core/docs/**` outside the consumer contract.
 *              `packages/core/package.json` ships no `docs/` entry in `files`,
 *              so those documents are not published bytes and cannot reach a
 *              pinned consumer. Demanding a changeset for them trains authors
 *              to open empty changesets, which is how the signal dies.
 *
 * THE `contract-diff` BLOCK is the single source for the STATUS "Contract diff"
 * section: the roadmap status tool imports the parser below rather than reading
 * the same grammar a second time. One grammar, one owner, two readers.
 *
 *   ```contract-diff
 *   subpath ./commercial — removed; the root barrel is the public way
 *   signature ./server#mountTenantTheme — accepts the retained `artifact` input
 *   export .#DetailSurface — added
 *   ```
 *
 * Usage:
 *   node scripts/check/contract-changeset/index.mjs [--base=<ref>] [--head=<ref>]
 *   node scripts/check/contract-changeset/index.mjs --drill=<class>
 *   node scripts/check/contract-changeset/index.mjs --list-drills
 *   node scripts/check/contract-changeset/index.mjs --emit-pending
 *
 * With no `--head`, the range is `<base>` against the WORKING TREE, so an
 * author sees the verdict before committing. CI passes `--head=HEAD` and reads
 * the merge-base range, which is what the pull request actually proposes.
 *
 * Exit 0 = clean. Exit 1 = at least one finding, or a drill that did not land
 * in the direction it declares.
 */

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { repoRoot as findRepoRoot } from '../../libraries/repo-root/index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = findRepoRoot(HERE);

/** The package whose surface this gate governs, as `files`/`exports` see it. */
export const LIBRARY_ROOT = 'packages/core/';

/**
 * The signature surface: every published module, and the machine-readable
 * subpath map that ships inside the package. A change here can move an import
 * an application already wrote, so it owes a `contract-diff` block naming what
 * moved -- a version number does not tell a reader which import to re-read.
 */
export const SIGNATURE_PREFIXES = Object.freeze([
  'packages/core/src/entrypoints/',
  'packages/core/contracts/package/entrypoints/',
]);

/**
 * The contract document set. It owes a changeset -- the contract an
 * application programs against moved, and the version is how that travels --
 * but not a diff block: prose has no subpath, signature or export to name, and
 * demanding a row here would only buy invented ones.
 */
export const CONTRACT_DOC_PREFIXES = Object.freeze(['packages/core/docs/consumer-contract/']);

export const CONTRACT_PREFIXES = Object.freeze([...SIGNATURE_PREFIXES, ...CONTRACT_DOC_PREFIXES]);

/** Documentation outside the contract: authored for this repository, not shipped. */
export const EXEMPT_PREFIXES = Object.freeze(['packages/core/docs/']);

export const CHANGESET_DIR = '.changeset';
export const CONTRACT_DIFF_KINDS = Object.freeze(['subpath', 'signature', 'export']);
/** Publication order of the diff: what disappeared, then what changed shape, then what arrived. */
export const CONTRACT_DIFF_KIND_ORDER = Object.freeze(['subpath', 'signature', 'export']);
export const BUMP_LEVELS = Object.freeze(['major', 'minor', 'patch']);

// ── classification ─────────────────────────────────────────────────────────

/**
 * One path, one class. `contract` wins over `exempt` so the consumer-contract
 * documents are never read as ordinary documentation.
 */
export function classifyPath(path) {
  if (CONTRACT_PREFIXES.some((prefix) => path.startsWith(prefix))) return 'contract';
  if (!path.startsWith(LIBRARY_ROOT)) return 'outside';
  if (EXEMPT_PREFIXES.some((prefix) => path.startsWith(prefix))) return 'exempt';
  return 'library';
}

export function classifyPaths(paths) {
  const buckets = { contract: [], library: [], exempt: [], outside: [] };
  for (const path of paths) buckets[classifyPath(path)].push(path);
  buckets.signature = buckets.contract.filter((path) =>
    SIGNATURE_PREFIXES.some((prefix) => path.startsWith(prefix)));
  return buckets;
}

// ── the changeset grammar ──────────────────────────────────────────────────

/** A row of a `contract-diff` block, or a stated reason it cannot be one. */
export function parseContractDiffRow(line) {
  const match = /^(\S+)\s+(\S+)\s+—\s+(.+)$/.exec(line.trim());
  if (!match) {
    return { error: 'expected `<kind> <target> — <detail>` with an em dash separator' };
  }
  const [, kind, target, detail] = match;
  if (!CONTRACT_DIFF_KINDS.includes(kind)) {
    return { error: `unknown kind ${JSON.stringify(kind)} (expected ${CONTRACT_DIFF_KINDS.join(', ')})` };
  }
  if (!target.startsWith('.')) {
    return { error: `target ${JSON.stringify(target)} is not a package subpath (it must start with \`.\`)` };
  }
  if (kind !== 'subpath') {
    const [subpath, ...rest] = target.split('#');
    if (rest.length !== 1 || rest[0].length === 0 || subpath.length === 0) {
      return { error: `a ${kind} target must be \`<subpath>#<symbol>\`, not ${JSON.stringify(target)}` };
    }
  }
  return { row: { kind, target, detail: detail.trim() } };
}

/**
 * Reads one changeset file. Throws on anything it cannot certify: an
 * unparseable file is a release declaration nobody can act on, and treating it
 * as absent would be the silence this gate exists to remove.
 */
export function parseChangeset(name, text) {
  const fail = (reason) => {
    throw new Error(`contract-changeset: ${CHANGESET_DIR}/${name} is not a valid changeset — ${reason}`);
  };
  const frontmatter = /^---\r?\n([\s\S]*?)\r?\n?---\r?\n?([\s\S]*)$/.exec(text);
  if (!frontmatter) fail('no `---` frontmatter block');
  const [, head, body] = frontmatter;

  const packages = [];
  for (const rawLine of head.split('\n')) {
    const line = rawLine.trim();
    if (line.length === 0) continue;
    const entry = /^(?:"([^"]+)"|'([^']+)'|([\w@/.-]+)):\s*(\w+)$/.exec(line);
    if (!entry) fail(`frontmatter line ${JSON.stringify(line)} is not \`"package": level\``);
    const level = entry[4];
    if (!BUMP_LEVELS.includes(level)) fail(`bump level ${JSON.stringify(level)} is not ${BUMP_LEVELS.join('/')}`);
    packages.push({ name: entry[1] ?? entry[2] ?? entry[3], level });
  }
  if (packages.length === 0) fail('the frontmatter names no package');

  const summary = body.replace(/```contract-diff\r?\n[\s\S]*?```/g, '').trim();
  if (summary.length === 0) fail('the summary is empty');

  const contractDiff = [];
  const fences = [...body.matchAll(/```contract-diff\r?\n([\s\S]*?)```/g)];
  const openings = (body.match(/```contract-diff/g) || []).length;
  if (openings !== fences.length) fail('a ```contract-diff fence is opened and never closed');
  for (const [, block] of fences) {
    const rows = block.split('\n').map((line) => line.trim()).filter((line) => line.length > 0);
    if (rows.length === 0) fail('a ```contract-diff block declares nothing');
    for (const line of rows) {
      const parsed = parseContractDiffRow(line);
      if (parsed.error) fail(`contract-diff row ${JSON.stringify(line)}: ${parsed.error}`);
      contractDiff.push({ ...parsed.row, changeset: name });
    }
  }

  const highest = BUMP_LEVELS.find((level) => packages.some((entry) => entry.level === level));
  return { name, packages, level: highest, summary, contractDiff };
}

/** A changeset file name, as opposed to the README or the config. */
export function isChangesetFile(path) {
  return path.startsWith(`${CHANGESET_DIR}/`)
    && path.endsWith('.md')
    && !path.endsWith('/README.md');
}

/**
 * Every changeset on disk, parsed, in a deterministic order. This is the
 * population the next release will publish, and it is what the roadmap status
 * tool republishes as the contract diff -- through `--emit-pending`, not
 * through an import: STATUS reads producers, it never recomputes them, and the
 * package boundary stays a boundary.
 */
export function readPendingChangesets(repoRoot = REPO_ROOT) {
  const directory = join(repoRoot, CHANGESET_DIR);
  if (!existsSync(directory)) return [];
  const listed = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', CHANGESET_DIR], {
    cwd: repoRoot,
    encoding: 'utf8',
  });
  return listed
    .split('\n')
    .filter((path) => isChangesetFile(path))
    .sort()
    .map((path) => parseChangeset(path.slice(CHANGESET_DIR.length + 1), readFileSync(join(repoRoot, path), 'utf8')));
}

/**
 * The pending declarations as data, with the version they are pending against.
 * Deterministic: changesets sorted by file name, rows by kind, then target,
 * then the changeset that declared them.
 */
export function pendingContractDiff(repoRoot = REPO_ROOT) {
  const manifest = JSON.parse(readFileSync(join(repoRoot, `${LIBRARY_ROOT}package.json`), 'utf8'));
  const changesets = readPendingChangesets(repoRoot);
  const levelOf = new Map(changesets.map((entry) => [entry.name, entry.level]));
  const rows = changesets
    .flatMap((entry) => entry.contractDiff)
    .map((row) => ({ ...row, level: levelOf.get(row.changeset) }))
    .sort((left, right) =>
      CONTRACT_DIFF_KIND_ORDER.indexOf(left.kind) - CONTRACT_DIFF_KIND_ORDER.indexOf(right.kind)
      || left.target.localeCompare(right.target)
      || left.changeset.localeCompare(right.changeset));
  return {
    package: manifest.name,
    version: manifest.version,
    changesets: changesets.map((entry) => ({
      name: entry.name,
      level: entry.level,
      declares: entry.contractDiff.length,
    })),
    rows,
  };
}

// ── the audit ──────────────────────────────────────────────────────────────

/**
 * The verdict, computed from facts a caller can supply directly. Every git
 * read is in `readRange` below, so this function is exactly as testable as it
 * is authoritative.
 */
export function auditRange({ changed, declared = [], consumed = [], versionBumped = false }) {
  const findings = [];
  const buckets = classifyPaths(changed);
  const released = consumed.length > 0 && versionBumped;

  if (buckets.contract.length > 0 && !released) {
    if (declared.length === 0) {
      findings.push({
        leg: 'contract',
        detail:
          `${buckets.contract.length} guaranteed-surface path(s) changed and the range adds no changeset: `
          + `${buckets.contract.slice(0, 5).join(', ')}${buckets.contract.length > 5 ? ', …' : ''}`,
      });
    } else if (buckets.signature.length > 0 && declared.every((entry) => entry.contractDiff.length === 0)) {
      findings.push({
        leg: 'contract-diff',
        detail:
          'a published signature changed and no changeset in the range carries a `contract-diff` block; '
          + 'the applications pinned to the published version cannot learn which import moved',
      });
    }
  }

  if (buckets.library.length > 0 && declared.length === 0 && !released) {
    findings.push({
      leg: 'library',
      detail:
        `${buckets.library.length} shipped path(s) under ${LIBRARY_ROOT} changed with no changeset in the range: `
        + `${buckets.library.slice(0, 5).join(', ')}${buckets.library.length > 5 ? ', …' : ''}`,
    });
  }

  return findings;
}

// ── reading a real range ───────────────────────────────────────────────────

function git(repoRoot, args) {
  return execFileSync('git', args, { cwd: repoRoot, encoding: 'utf8' });
}

function readAt(repoRoot, ref, path) {
  if (ref === null) return existsSync(join(repoRoot, path)) ? readFileSync(join(repoRoot, path), 'utf8') : null;
  try {
    return git(repoRoot, ['show', `${ref}:${path}`]);
  } catch {
    return null;
  }
}

function versionOf(text) {
  if (text === null) return null;
  try {
    return JSON.parse(text).version ?? null;
  } catch {
    return null;
  }
}

/**
 * The range as git reports it. `head === null` means the working tree, which
 * is what an author runs before committing; a ref means the merge-base range,
 * which is what a pull request proposes.
 */
export function readRange({ repoRoot = REPO_ROOT, base, head = null } = {}) {
  const nameStatus = head === null
    ? git(repoRoot, ['diff', '--name-status', base])
    : git(repoRoot, ['diff', '--name-status', `${base}...${head}`]);

  const changed = [];
  const added = [];
  const modified = [];
  const deleted = [];
  for (const line of nameStatus.split('\n')) {
    if (line.trim().length === 0) continue;
    const columns = line.split('\t');
    const status = columns[0][0];
    // A rename reports source and destination; the destination is the file the
    // range now ships, and the source is a removal from the surface.
    const paths = status === 'R' || status === 'C' ? columns.slice(1) : [columns[1]];
    for (const path of paths) {
      changed.push(path);
      if (status === 'A' || status === 'R' || status === 'C') added.push(path);
      else if (status === 'D') deleted.push(path);
      else modified.push(path);
    }
  }

  if (head === null) {
    const untracked = git(repoRoot, ['ls-files', '--others', '--exclude-standard']);
    for (const path of untracked.split('\n')) {
      if (path.trim().length === 0) continue;
      changed.push(path);
      added.push(path);
    }
  }

  const declaredPaths = [...new Set([...added, ...modified])].filter(isChangesetFile).sort();
  const declared = declaredPaths.map((path) =>
    parseChangeset(path.slice(CHANGESET_DIR.length + 1), readAt(repoRoot, head, path) ?? ''));
  const consumed = deleted.filter(isChangesetFile).sort();

  const manifest = `${LIBRARY_ROOT}package.json`;
  const versionBumped =
    versionOf(readAt(repoRoot, base, manifest)) !== versionOf(readAt(repoRoot, head, manifest));

  return { changed: [...new Set(changed)].sort(), declared, consumed, versionBumped };
}

export function auditWorkingTree({ repoRoot = REPO_ROOT, base, head = null } = {}) {
  return auditRange(readRange({ repoRoot, base, head }));
}

// ── drills ─────────────────────────────────────────────────────────────────

/**
 * Each drill plants ONE range in a throwaway git repository and declares which
 * direction the gate must land in. A red drill that stays green and a green
 * drill that goes red both fail: a gate is evidence only when both of its
 * answers are demonstrated.
 */
export const DRILLS = Object.freeze({
  'contract-without-changeset': 'red',
  'stale-changeset-only': 'red',
  'malformed-changeset': 'red',
  'contract-without-diff-block': 'red',
  'library-without-changeset': 'red',
  'contract-doc-without-diff-block': 'green',
  'contract-with-changeset': 'green',
  'docs-outside-contract': 'green',
});

const RETAINED_CHANGESET = [
  '---',
  '"@rottay/design-system": major',
  '---',
  '',
  'The retained release changeset, committed on the base branch.',
  '',
].join('\n');

const VALID_CHANGESET = [
  '---',
  '"@rottay/design-system": minor',
  '---',
  '',
  'The planted change, declared.',
  '',
  '```contract-diff',
  'signature ./server#mountTenantTheme — accepts the retained `artifact` input',
  '```',
  '',
].join('\n');

function plant(workspace, path, contents) {
  mkdirSync(join(workspace, dirname(path)), { recursive: true });
  writeFileSync(join(workspace, path), contents);
}

/** A base commit with one file of every class this gate distinguishes. */
function sandbox() {
  const workspace = mkdtempSync(join(tmpdir(), 'contract-changeset-drill-'));
  plant(workspace, `${LIBRARY_ROOT}package.json`, `${JSON.stringify({ name: '@rottay/design-system', version: '2.19.36' }, null, 2)}\n`);
  plant(workspace, `${LIBRARY_ROOT}src/entrypoints/server/index.ts`, 'export const mountTenantTheme = 1;\n');
  plant(workspace, `${LIBRARY_ROOT}src/index.ts`, 'export const root = 1;\n');
  plant(workspace, `${LIBRARY_ROOT}docs/consumer-contract/index.md`, '# Consumer contract\n');
  plant(workspace, `${LIBRARY_ROOT}docs/guides/getting-started/index.md`, '# Getting started\n');
  plant(workspace, `${CHANGESET_DIR}/README.md`, '# Changesets\n');
  plant(workspace, `${CHANGESET_DIR}/retained.md`, RETAINED_CHANGESET);
  for (const args of [
    ['init', '--quiet', '--initial-branch=main'],
    ['config', 'user.email', 'gate@example.invalid'],
    ['config', 'user.name', 'gate'],
    ['add', '--all'],
    ['commit', '--quiet', '--message', 'base'],
  ]) git(workspace, args);
  return workspace;
}

export function runDrill(drill) {
  if (!Object.hasOwn(DRILLS, drill)) {
    throw new Error(`contract-changeset: unknown drill class ${JSON.stringify(drill)}`);
  }
  const workspace = sandbox();
  try {
    if (drill === 'contract-without-changeset' || drill === 'stale-changeset-only') {
      plant(workspace, `${LIBRARY_ROOT}src/entrypoints/server/index.ts`, 'export const mountTenantTheme = 2;\n');
    }
    if (drill === 'stale-changeset-only') {
      // The retained changeset is committed on the base and untouched: the
      // exact population the replaced inline step counted as a declaration.
      if (readFileSync(join(workspace, `${CHANGESET_DIR}/retained.md`), 'utf8') !== RETAINED_CHANGESET) {
        throw new Error('contract-changeset: the drill disturbed the retained changeset');
      }
    }
    if (drill === 'malformed-changeset') {
      plant(workspace, `${LIBRARY_ROOT}src/entrypoints/server/index.ts`, 'export const mountTenantTheme = 2;\n');
      plant(workspace, `${CHANGESET_DIR}/planted.md`, [
        '---',
        '"@rottay/design-system": minor',
        '---',
        '',
        'Declared, but the block does not parse.',
        '',
        '```contract-diff',
        'mountTenantTheme changed a bit',
        '```',
        '',
      ].join('\n'));
    }
    if (drill === 'contract-without-diff-block') {
      plant(workspace, `${LIBRARY_ROOT}src/entrypoints/server/index.ts`, 'export const mountTenantTheme = 2;\n');
      plant(workspace, `${CHANGESET_DIR}/planted.md`, [
        '---',
        '"@rottay/design-system": minor',
        '---',
        '',
        'A version bump with no statement of what an application must re-read.',
        '',
      ].join('\n'));
    }
    if (drill === 'library-without-changeset') {
      plant(workspace, `${LIBRARY_ROOT}src/index.ts`, 'export const root = 2;\n');
    }
    if (drill === 'contract-doc-without-diff-block') {
      plant(workspace, `${LIBRARY_ROOT}docs/consumer-contract/index.md`, '# Consumer contract, revised\n');
      plant(workspace, `${CHANGESET_DIR}/planted.md`, [
        '---',
        '"@rottay/design-system": patch',
        '---',
        '',
        'The contract document set moved; no published signature did.',
        '',
      ].join('\n'));
    }
    if (drill === 'contract-with-changeset') {
      plant(workspace, `${LIBRARY_ROOT}src/entrypoints/server/index.ts`, 'export const mountTenantTheme = 2;\n');
      plant(workspace, `${CHANGESET_DIR}/planted.md`, VALID_CHANGESET);
    }
    if (drill === 'docs-outside-contract') {
      plant(workspace, `${LIBRARY_ROOT}docs/guides/getting-started/index.md`, '# Getting started, revised\n');
    }

    let findings;
    let error = null;
    try {
      findings = auditWorkingTree({ repoRoot: workspace, base: 'main' });
    } catch (thrown) {
      // A refusal to parse IS the finding for the malformed class: the gate
      // stops rather than reading an unparseable declaration as absent.
      error = thrown;
      findings = [{ leg: 'changeset', detail: thrown.message }];
    }
    const expected = DRILLS[drill];
    const landed = findings.length > 0 ? 'red' : 'green';
    return { drill, expected, landed, findings, threw: error !== null };
  } finally {
    rmSync(workspace, { recursive: true, force: true });
  }
}

// ── cli ────────────────────────────────────────────────────────────────────

function optionOf(argv, name, fallback) {
  const prefixed = argv.find((argument) => argument.startsWith(`--${name}=`));
  if (prefixed) return prefixed.slice(name.length + 3);
  const index = argv.indexOf(`--${name}`);
  return index >= 0 && argv[index + 1] && !argv[index + 1].startsWith('--') ? argv[index + 1] : fallback;
}

function main(argv) {
  if (argv.includes('--list-drills')) {
    for (const [drill, expected] of Object.entries(DRILLS)) console.log(`${drill}\t${expected}`);
    return 0;
  }

  if (argv.includes('--emit-pending')) {
    // The producer half. A changeset it cannot parse exits non-zero with the
    // reason on stderr -- one readable line, not a stack -- so the consumer
    // fails closed instead of publishing a diff that quietly dropped a
    // declaration.
    try {
      console.log(JSON.stringify(pendingContractDiff()));
    } catch (error) {
      console.error(error.message);
      return 1;
    }
    return 0;
  }

  const drill = optionOf(argv, 'drill', null);
  if (drill !== null) {
    const result = runDrill(drill);
    if (result.landed !== result.expected) {
      console.error(
        `contract-changeset: DRILL FAILED — ${drill} must land ${result.expected} and landed ${result.landed}.`,
      );
      for (const finding of result.findings) console.error(`  [${finding.leg}] ${finding.detail}`);
      return 1;
    }
    console.log(
      `contract-changeset: drill ${drill} landed ${result.landed} as declared`
      + `${result.findings.length ? ` (${result.findings.length} finding(s))` : ''}.`,
    );
    return 0;
  }

  const base = optionOf(argv, 'base', 'origin/main');
  const head = optionOf(argv, 'head', null);
  let findings;
  try {
    findings = auditWorkingTree({ base, head });
  } catch (error) {
    console.error(`contract-changeset: FAIL — ${error.message}`);
    return 1;
  }
  if (findings.length > 0) {
    for (const finding of findings) console.error(`contract-changeset: [${finding.leg}] ${finding.detail}`);
    console.error(
      `contract-changeset: FAIL — ${findings.length} finding(s). Run \`pnpm changeset\` and, for a guaranteed-surface `
      + 'change, add a `contract-diff` block naming every subpath, signature and export that moved.',
    );
    return 1;
  }
  console.log(
    `contract-changeset: OK — every guaranteed-surface and shipped change in ${base}...${head ?? 'WORKING TREE'} `
    + 'is covered by a changeset the range introduces.',
  );
  return 0;
}

if (resolve(process.argv[1] ?? '') === resolve(fileURLToPath(import.meta.url))) {
  process.exitCode = main(process.argv.slice(2));
}
