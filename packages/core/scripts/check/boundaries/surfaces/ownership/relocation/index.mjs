/**
 * DS-A002 — the count-neutral relocation of the ownership ledger.
 *
 * Row ids are path-keyed (`sha256(path\0category\0rule\0anchor)`), so moving or
 * splitting a file that holds rows reads as new rows plus stale rows, which the
 * tighten-only producer must refuse. This mode re-keys those rows instead. It
 * reads a move inventory (Git's rename inventory plus an explicit reviewed
 * inventory file, the only way to express a 1→N split), re-runs the detector on
 * the old blob at the old path and on each new file at its new path, and pairs
 * the findings by `(category, rule, anchor)`. Nothing is re-counted: every new
 * row is an old row under its new path, with the same count.
 *
 * Refused by name, nothing written: a count change on any key; a key that only
 * exists on the new side; a key whose occurrences land in more than one new
 * file (that would add a row); a change of counter or owner class; a frozen
 * `from` or `to`; a path outside the gate's scope; an old row whose live count
 * differs from its pin; a new id that collides with an existing row; an
 * allowlisted finding on a moved file (re-keying the allowlist is a separate
 * reviewed act). Post-conditions are asserted before anything is reported ok:
 * both counters keep their rows and occurrences, the total is unchanged and the
 * frozen id-set digest is the one the R32 Q4 amendment pins.
 */

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';

import { FROZEN } from '../../../../engine/lifecycle/freeze/index.mjs';
import { parseGitRenameStatus } from '../../../../../libraries/build/relocation/index.mjs';
import {
  BASELINE_PURPOSE,
  COUNTERS,
  FROZEN_TRANSFERRED,
  PRODUCTIVE,
  counterOf,
  ledgerRows,
  ownerClass,
  tallyCounters,
  totalOf,
} from '../counters/index.mjs';

/** The frozen id-set digest the relocation must leave unchanged (WO-RET-04, R32 Q4). */
export const FROZEN_ID_SET_DIGEST = '61df609c1c1c1d3cb4fb4367ef4e7e041fd11c657d91b11e8d36ec0f0f33b2f5';
export const RELOCATION_SCOPE = /^src\/components\/(?:patterns|surfaces)\//u;
const SOURCE_PATH = /^src\/[^\0]+\.[cm]?[jt]sx?$/u;

function keyOf(finding) {
  return `${finding.category}\0${finding.rule}\0${finding.anchor}`;
}

function describeKey(key) {
  const [category, rule, anchor] = key.split('\0');
  return { category, rule, anchor };
}

/** `[{ from, to: [..] }]`, package-relative `src/...` paths; issues name every malformed entry. */
export function parseInventory(document) {
  const issues = [];
  const moves = [];
  if (!Array.isArray(document)) return { moves, issues: ['inventory must be a JSON array of { from, to[] }'] };
  for (const [index, entry] of document.entries()) {
    const prefix = `inventory[${index}]`;
    const to = Array.isArray(entry?.to) ? entry.to : null;
    if (typeof entry?.from !== 'string' || !SOURCE_PATH.test(entry.from)) {
      issues.push(`${prefix}.from must be a package-relative source path under src/`);
      continue;
    }
    if (!to || to.length === 0 || to.some((path) => typeof path !== 'string' || !SOURCE_PATH.test(path))) {
      issues.push(`${prefix}.to must be a non-empty array of package-relative source paths under src/`);
      continue;
    }
    if (new Set(to).size !== to.length || to.includes(entry.from)) {
      issues.push(`${prefix}.to must list distinct paths other than its from`);
      continue;
    }
    moves.push({ from: entry.from, to: [...to].sort(), source: 'inventory' });
  }
  return { moves, issues };
}

/** One move per `from`. The reviewed inventory may widen a Git rename into a split; it may not contradict it. */
export function mergeMoves(gitRenames, inventoryMoves) {
  const issues = [];
  const byFrom = new Map();
  for (const { from, to } of gitRenames) byFrom.set(from, { from, to: [to], source: 'git' });
  for (const move of inventoryMoves) {
    const git = byFrom.get(move.from);
    if (byFrom.has(move.from) && git.source === 'inventory') {
      issues.push(`inventory names ${move.from} twice`);
      continue;
    }
    if (git && !git.to.every((path) => move.to.includes(path))) {
      issues.push(`inventory sends ${move.from} to ${move.to.join(', ')}, but Git renamed it to ${git.to[0]}`);
      continue;
    }
    byFrom.set(move.from, { ...move, source: git ? 'git+inventory' : 'inventory' });
  }
  const moves = [...byFrom.values()].sort((left, right) => left.from.localeCompare(right.from));
  const froms = new Set(moves.map((move) => move.from));
  const targets = new Map();
  for (const move of moves) {
    for (const path of move.to) {
      if (froms.has(path)) issues.push(`${path} is both moved and a move target; relocate one hop at a time`);
      if (targets.has(path)) issues.push(`${path} is the target of both ${targets.get(path)} and ${move.from}`);
      targets.set(path, move.from);
    }
  }
  return { moves, issues };
}

function counterFigures(document) {
  const counters = tallyCounters(ledgerRows(document));
  return { counters, total: totalOf(counters) };
}

/**
 * Pure planner. `readOld(from)` returns the source at HEAD or null; `readNew(to)` the
 * working-tree source or null. Returns the pairing, the refusals and, when there are
 * none, the next ledger stamped by the gate's own `baselineDocument`.
 */
export function planRelocation({
  baseline,
  allowlist,
  moves,
  readOld,
  readNew,
  analyze,
  applyAllowlist,
  baselineDocument,
  frozenDigest = FROZEN_ID_SET_DIGEST,
}) {
  const refusals = [];
  const pairs = [];
  const refuse = (kind, detail, move = {}) => refusals.push({ kind, detail, ...move });
  const pinned = new Map(ledgerRows(baseline).map((row) => [row.id, row]));
  const removedIds = new Set();
  const addedRows = [];

  for (const move of moves) {
    const where = { from: move.from };
    const refusedBefore = refusals.length;
    if (!RELOCATION_SCOPE.test(move.from)) {
      refuse('outside-scope', `${move.from} is outside src/components/{patterns,surfaces}`, where);
    }
    for (const to of move.to) {
      if (!RELOCATION_SCOPE.test(to)) refuse('outside-scope', `${to} is outside src/components/{patterns,surfaces}`, where);
    }
    for (const path of [move.from, ...move.to]) {
      if (FROZEN.test(path)) refuse('frozen-path', `${path} is a frozen engine path; the frozen ledger never moves`, where);
    }
    if (refusals.length > refusedBefore) continue;
    const oldSource = readOld(move.from);
    if (oldSource === null) {
      refuse('old-blob-missing', `HEAD has no blob at ${move.from}`, where);
      continue;
    }
    const oldAnalysed = analyze(oldSource, move.from).findings;
    const newAnalysed = [];
    let missing = false;
    for (const to of move.to) {
      const source = readNew(to);
      if (source === null) {
        refuse('new-file-missing', `${to} does not exist in the working tree`, where);
        missing = true;
        continue;
      }
      newAnalysed.push(...analyze(source, to).findings);
    }
    if (missing) continue;

    // The ledger holds active findings only, so allowlisted ones are refused once by id and never paired.
    const oldSplit = applyAllowlist(oldAnalysed, allowlist);
    const newSplit = applyAllowlist(newAnalysed, allowlist);
    const oldFindings = oldSplit.active;
    const newFindings = newSplit.active;
    const allowedIds = new Map();
    for (const { finding } of [...oldSplit.allowed, ...newSplit.allowed]) allowedIds.set(finding.id, finding);
    for (const finding of allowedIds.values()) {
      refuse(
        'allowlisted-finding',
        `${finding.path} [${finding.category}/${finding.rule}] ${finding.id} is allowlisted; re-key the allowlist as its own reviewed act`,
        where,
      );
    }

    const oldIds = new Map();
    for (const finding of oldFindings) oldIds.set(finding.id, (oldIds.get(finding.id) ?? 0) + 1);
    for (const [id, live] of oldIds) {
      if ((pinned.get(id)?.count ?? 0) !== live) {
        refuse('unpinned-drift', `${move.from} ${id}: live ${live}, pinned ${pinned.get(id)?.count ?? 0}`, where);
      }
    }
    for (const row of pinned.values()) {
      if (row.path === move.from && !oldIds.has(row.id)) {
        refuse('unpinned-drift', `${move.from} ${row.id}: pinned ${row.count}, absent from the HEAD blob`, where);
      }
    }
    if (oldFindings.length > 0) {
      for (const to of move.to) {
        if (counterOf(to) !== counterOf(move.from) || ownerClass(to) !== ownerClass(move.from)) {
          refuse(
            'owner-class-change',
            `${move.from} (${counterOf(move.from)}/${ownerClass(move.from)}) → ${to} (${counterOf(to)}/${ownerClass(to)})`,
            where,
          );
        }
      }
    }

    const oldByKey = new Map();
    for (const finding of oldFindings) {
      const entry = oldByKey.get(keyOf(finding)) ?? { count: 0, id: finding.id };
      entry.count += 1;
      oldByKey.set(keyOf(finding), entry);
    }
    const newByKey = new Map();
    for (const finding of newFindings) {
      const perPath = newByKey.get(keyOf(finding)) ?? new Map();
      const entry = perPath.get(finding.path) ?? { count: 0, id: finding.id };
      entry.count += 1;
      perPath.set(finding.path, entry);
      newByKey.set(keyOf(finding), perPath);
    }
    for (const key of new Set([...oldByKey.keys(), ...newByKey.keys()])) {
      const { category, rule, anchor } = describeKey(key);
      const label = `[${category}/${rule}] anchor ${JSON.stringify(anchor)}`;
      const old = oldByKey.get(key);
      const destinations = newByKey.get(key) ?? new Map();
      const moved = [...destinations.values()].reduce((sum, entry) => sum + entry.count, 0);
      if (!old) {
        refuse('new-key', `${label} exists only on the new side (${moved} occurrence(s))`, where);
        continue;
      }
      if (moved !== old.count) {
        refuse('count-change', `${label} ${old.count} at ${move.from} → ${moved} across ${move.to.join(', ')}`, where);
        continue;
      }
      if (destinations.size > 1) {
        refuse('key-split', `${label} spreads across ${[...destinations.keys()].join(', ')}; that adds a row`, where);
        continue;
      }
      const [[to, target]] = [...destinations.entries()];
      if (pinned.has(target.id) && !oldIds.has(target.id)) {
        refuse('id-collision', `${to} ${target.id} already holds a row`, where);
        continue;
      }
      removedIds.add(old.id);
      pairs.push({ from: move.from, to, category, rule, anchor, oldId: old.id, newId: target.id, count: old.count });
      addedRows.push({ id: target.id, path: to, category, rule, count: old.count });
    }
  }

  const before = counterFigures(baseline);
  if (refusals.length) return { ok: false, refusals, pairs, before, after: null, next: null };

  const kept = ledgerRows(baseline).filter((row) => !removedIds.has(row.id));
  const keptIds = new Set(kept.map((row) => row.id));
  for (const row of addedRows) {
    if (keptIds.has(row.id)) refuse('id-collision', `${row.path} ${row.id} already holds a row`, { from: row.path });
  }
  const next = baselineDocument([...kept, ...addedRows]);
  const after = counterFigures(next);
  const invariants = [
    [PRODUCTIVE, 'rows'], [PRODUCTIVE, 'occurrences'],
    [FROZEN_TRANSFERRED, 'rows'], [FROZEN_TRANSFERRED, 'occurrences'],
  ];
  for (const [counter, figure] of invariants) {
    if (before.counters[counter][figure] !== after.counters[counter][figure]) {
      refuse('postcondition', `${counter} ${figure} ${before.counters[counter][figure]} → ${after.counters[counter][figure]}`);
    }
  }
  if (before.total.rows !== after.total.rows || before.total.occurrences !== after.total.occurrences) {
    refuse('postcondition', `total ${before.total.occurrences}/${before.total.rows} → ${after.total.occurrences}/${after.total.rows}`);
  }
  for (const [label, digest] of [['before', before], ['after', after]]) {
    if (digest.counters[FROZEN_TRANSFERRED].idSetDigest !== frozenDigest) {
      refuse('postcondition', `frozen id-set digest ${label} is ${digest.counters[FROZEN_TRANSFERRED].idSetDigest}, not ${frozenDigest}`);
    }
  }
  if (refusals.length) return { ok: false, refusals, pairs, before, after, next: null };
  return { ok: true, refusals, pairs, before, after, next };
}

function git(args, cwd) {
  return execFileSync('git', args, { cwd, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'] });
}

/** Reads Git's rename inventory, the optional reviewed inventory file, HEAD blobs and the working tree. */
export function relocationFromRepository({
  packageRoot,
  inventoryPath = null,
  similarity = '60%',
  baseline,
  allowlist,
  analyze,
  applyAllowlist,
  baselineDocument,
  frozenDigest = FROZEN_ID_SET_DIGEST,
}) {
  if (!/^(?:[1-9]|[1-9]\d|100)%$/u.test(similarity)) {
    return { configurationIssues: ['--similarity must be an integer percentage from 1% to 100%'] };
  }
  const repositoryRoot = realpathSync(git(['rev-parse', '--show-toplevel'], packageRoot).trim());
  const packagePath = relative(repositoryRoot, realpathSync(packageRoot)).split('\\').join('/');
  const status = git(
    ['diff', '--name-status', `--find-renames=${similarity}`, 'HEAD', '--', `${packagePath}/src`],
    repositoryRoot,
  );
  const gitRenames = parseGitRenameStatus(status, { repositoryRoot, oldRoot: packagePath })
    .filter(({ from, to }) => from.startsWith('src/') && to.startsWith('src/'))
    .filter(({ from, to }) => RELOCATION_SCOPE.test(from) || RELOCATION_SCOPE.test(to));
  let inventoryMoves = [];
  const configurationIssues = [];
  if (inventoryPath) {
    if (!existsSync(inventoryPath)) configurationIssues.push(`inventory ${inventoryPath} does not exist`);
    else {
      const parsed = parseInventory(JSON.parse(readFileSync(inventoryPath, 'utf8')));
      configurationIssues.push(...parsed.issues);
      inventoryMoves = parsed.moves;
    }
  }
  const merged = mergeMoves(gitRenames, inventoryMoves);
  configurationIssues.push(...merged.issues);
  if (configurationIssues.length) return { configurationIssues, gitRenames, moves: merged.moves };
  const readOld = (path) => {
    try {
      return git(['show', `HEAD:${packagePath}/${path}`], repositoryRoot);
    } catch {
      return null;
    }
  };
  const readNew = (path) => {
    const file = resolve(packageRoot, path);
    return existsSync(file) ? readFileSync(file, 'utf8') : null;
  };
  const plan = planRelocation({
    baseline, allowlist, moves: merged.moves, readOld, readNew, analyze, applyAllowlist, baselineDocument, frozenDigest,
  });
  return { configurationIssues: [], gitRenames, moves: merged.moves, ...plan };
}

function figureLine(name, before, after) {
  const was = before.counters[name];
  const now = after?.counters[name] ?? was;
  return `  ${COUNTERS[name].label}: ${was.occurrences}/${was.rows} → ${now.occurrences}/${now.rows} · `
    + `id set ${was.idSetDigest.slice(0, 16)} → ${now.idSetDigest.slice(0, 16)}`;
}

/** The dry-run and write report: inventory, pairing table, refusals and invariants. */
export function relocationLines(result, { write = false } = {}) {
  const lines = [
    `DS-A002 relocation: ${result.gitRenames.length} Git rename(s), ${result.moves.length} move(s), `
    + `${result.pairs.length} row(s) ${result.ok && write ? 're-keyed' : 'paired'}${write ? '' : ' (dry run)'}.`,
  ];
  for (const move of result.moves) lines.push(`  move [${move.source}] ${move.from} → ${move.to.join(', ')}`);
  for (const pair of result.pairs) {
    lines.push(
      `  row ${pair.oldId} → ${pair.newId} ×${pair.count} [${pair.category}/${pair.rule}] `
      + `${pair.from} → ${pair.to}`,
    );
  }
  for (const refusal of result.refusals) lines.push(`  REFUSED ${refusal.kind}: ${refusal.detail}`);
  lines.push(figureLine(PRODUCTIVE, result.before, result.after));
  lines.push(figureLine(FROZEN_TRANSFERRED, result.before, result.after));
  const after = result.after?.total ?? result.before.total;
  lines.push(
    `  total ${result.before.total.occurrences}/${result.before.total.rows} → ${after.occurrences}/${after.rows}; `
    + `frozen digest pinned ${FROZEN_ID_SET_DIGEST.slice(0, 16)}`,
  );
  lines.push(result.ok
    ? (write ? '  ok: ledger re-keyed; counts, counters and the frozen id set are unchanged.'
      : '  ok: dry run, nothing written; pass --write after reviewing the pairing.')
    : `  refused: ${result.refusals.length} refusal(s); nothing written.`);
  return lines;
}

function flagValue(argv, name) {
  const exact = argv.indexOf(name);
  if (exact >= 0) return argv[exact + 1];
  return argv.find((argument) => argument.startsWith(`${name}=`))?.slice(name.length + 1);
}

/** `--relocate-paths [--inventory <json>] [--similarity 60%] [--write]`; returns the exit code. */
export function runRelocationCli({
  argv, packageRoot, baselinePath, allowlistPath, quiet = false, gate, frozenDigest = FROZEN_ID_SET_DIGEST,
}) {
  const write = argv.includes('--write');
  for (const other of ['--check', '--update-baseline', '--report']) {
    if (argv.includes(other)) {
      console.error(`DS-A002: --relocate-paths runs alone; drop ${other}.`);
      return 1;
    }
  }
  const baseline = existsSync(baselinePath) ? JSON.parse(readFileSync(baselinePath, 'utf8')) : null;
  const allowlist = existsSync(allowlistPath)
    ? JSON.parse(readFileSync(allowlistPath, 'utf8'))
    : { schemaVersion: 1, entries: [] };
  const issues = [...gate.validateBaseline(baseline), ...gate.validateAllowlist(allowlist)];
  if (!issues.length && baseline.purpose !== BASELINE_PURPOSE) issues.push('baseline.purpose is not the stamped subject');
  const inventory = flagValue(argv, '--inventory');
  const result = issues.length ? { configurationIssues: issues } : relocationFromRepository({
    packageRoot,
    inventoryPath: inventory ? resolve(inventory) : null,
    similarity: flagValue(argv, '--similarity') ?? '60%',
    baseline,
    allowlist,
    analyze: gate.analyze,
    applyAllowlist: gate.applyAllowlist,
    baselineDocument: gate.baselineDocument,
    frozenDigest,
  });
  if (result.configurationIssues.length) {
    for (const issue of result.configurationIssues) console.error(`DS-A002 relocation: ${issue}`);
    return 1;
  }
  for (const line of relocationLines(result, { write })) (result.ok ? console.log : console.error)(line);
  if (!result.ok) return 1;
  if (write && result.pairs.length) writeFileSync(baselinePath, `${JSON.stringify(result.next, null, 2)}\n`);
  if (write && !quiet) console.log(`Relocated ${relative(packageRoot, baselinePath)}: ${result.pairs.length} row(s).`);
  return 0;
}
