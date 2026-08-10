/**
 * @fileoverview Lane plan loading and resolution.
 *
 * A LANE PLAN is the coordinator's declaration of who may write where during
 * one batch. It is the input every check in this folder reads, so it is the
 * only place a lane's boundary is stated and the only place it can be wrong.
 *
 * RESOLUTION IS THREE-LAYERED, on purpose:
 *
 *   row        — the ledger row that BOUNDS the lane (`writeRoot` minus
 *                `writeExcludes`). A lane with no row and no explicit
 *                `writeRoot` is refused: an unbounded lane cannot be checked,
 *                and "the agent will be careful" is not a boundary.
 *   patterns   — what the lane DECLARES it will write, which must be inside
 *                the row's bound. Narrowing is allowed; escaping is not.
 *   files      — what those patterns resolve to in the working tree TODAY.
 *
 * The third layer is evidence and the second is the contract. A check that
 * only ever consulted the third would call two lanes disjoint whenever their
 * shared subtree happens to be empty this afternoon.
 */
import { readFileSync, statSync } from 'node:fs';
import {
  compilePattern,
  compilePatterns,
  hasMagic,
  isUnderOrEqual,
  matchesAny,
  matchesCompiled,
  normalizePath,
  territoryOf,
} from '../../foundation/glob/index.mjs';
import { loadRows, writeExcludesForRow, writeSetForRow, DEFAULT_LEDGER_PATH, DEFAULT_SYNTHETIC_PATH } from '../../runtime/ledger/index.mjs';
import { listFiles } from '../../foundation/git/index.mjs';

export function readPlan(path) {
  const plan = JSON.parse(readFileSync(path, 'utf8'));
  if (!Array.isArray(plan.lanes) || plan.lanes.length === 0) {
    throw new Error(`lane-control: plan "${path}" declares no lanes`);
  }
  const seen = new Set();
  for (const lane of plan.lanes) {
    if (!lane.id) throw new Error('lane-control: every lane needs an id');
    if (seen.has(lane.id)) throw new Error(`lane-control: duplicate lane id "${lane.id}"`);
    seen.add(lane.id);
  }
  return plan;
}

function directoryProbe(root) {
  return (relative) => {
    try {
      return statSync(`${root}/${relative}`).isDirectory();
    } catch {
      return null;
    }
  };
}

/**
 * Resolve one lane: its bound, its declared patterns, the files those
 * patterns cover today, and every way the declaration escapes its bound.
 */
export function resolveLane(lane, context) {
  const { rowIndex, universe, isDirectory } = context;

  const row = lane.row ? rowIndex.get(lane.row) : null;
  if (lane.row && !row) throw new Error(`lane-control: lane "${lane.id}" names unknown row "${lane.row}"`);

  const writeRoot = normalizePath(lane.writeRoot ?? row?.writeRoot ?? '');
  if (!writeRoot) {
    throw new Error(
      `lane-control: lane "${lane.id}" has no writeRoot — name a ledger row or declare writeRoot. An unbounded lane cannot be checked.`,
    );
  }

  const rowExcludes = row ? writeExcludesForRow(row) : [];
  const laneExcludes = (lane.writeExcludes ?? []).map((entry) => normalizePath(entry));
  const writeExcludes = [...new Set([...rowExcludes, ...laneExcludes])];

  const declared = lane.writeSet ?? (row ? writeSetForRow(row) : [`${writeRoot}/**`]);
  const compiledWrite = compilePatterns(declared);

  // An exclusion naming a DIRECTORY excludes the directory and its subtree;
  // an exclusion carrying glob magic is a shape and is taken literally. Both
  // forms are needed: `writeExcludes` in the ledger are directories, while a
  // lane sharing a directory with another lane can only be separated by shape.
  const excludePatterns = writeExcludes.flatMap((entry) => (hasMagic(entry) ? [entry] : [entry, `${entry}/**`]));
  const compiledExclude = compilePatterns(excludePatterns);
  const excludeTerritories = excludePatterns.map((pattern) => territoryOf(pattern, { isDirectory }));

  const boundViolations = [];
  const territories = [];
  for (const compiled of compiledWrite) {
    for (const expansion of compiled.expansions) {
      const territory = territoryOf(expansion.pattern, { isDirectory });
      const anchor = territory.kind === 'file' ? territory.path : territory.dir;
      if (!isUnderOrEqual(anchor, writeRoot)) {
        boundViolations.push({
          kind: 'pattern-escapes-writeRoot',
          pattern: expansion.pattern,
          anchor,
          writeRoot,
        });
      }
      // A declaration that lands wholly inside an exclusion is a contradiction
      // the author has to resolve — only an unfiltered subtree exclusion can
      // swallow a whole declaration, so only that shape is reported.
      const inside = excludeTerritories.find(
        (exclude) => exclude.kind === 'subtree' && !exclude.filter && isUnderOrEqual(anchor, exclude.dir),
      );
      if (inside) {
        boundViolations.push({
          kind: 'pattern-inside-writeExcludes',
          pattern: expansion.pattern,
          anchor,
          exclude: inside.source,
        });
      }
      territories.push({ ...territory, lane: lane.id });
    }
  }

  const files = [];
  const filesOutsideBound = [];
  for (const file of universe) {
    if (!matchesAny(file, compiledWrite)) continue;
    if (compiledExclude.some((compiled) => matchesCompiled(file, compiled))) continue;
    if (!isUnderOrEqual(file, writeRoot)) {
      filesOutsideBound.push(file);
      continue;
    }
    files.push(file);
  }

  const claimsSharedFiles = (lane.claimsSharedFiles ?? []).map((entry) => normalizePath(entry));

  return {
    id: lane.id,
    rowId: lane.row ?? null,
    row,
    model: lane.model ?? null,
    writeRoot,
    writeExcludes,
    declaredWriteSet: declared.map((entry) => normalizePath(entry)),
    compiledWrite,
    compiledExclude,
    excludeTerritories,
    territories,
    files,
    fileSet: new Set(files),
    filesOutsideBound,
    boundViolations,
    claimsSharedFiles,
  };
}

/** Is this path inside the lane's declared, exclusion-adjusted write set? */
export function laneCovers(lane, path) {
  const normalized = normalizePath(path);
  if (!matchesAny(normalized, lane.compiledWrite)) return false;
  if (lane.compiledExclude.some((compiled) => matchesCompiled(normalized, compiled))) return false;
  return isUnderOrEqual(normalized, lane.writeRoot);
}

export function loadContext({ root, ledgerPath = DEFAULT_LEDGER_PATH, syntheticPath = DEFAULT_SYNTHETIC_PATH }) {
  const rows = loadRows({ root, ledgerPath, syntheticPath });
  return {
    root,
    rows,
    rowIndex: rows.index,
    universe: listFiles(root).map((file) => normalizePath(file)),
    isDirectory: directoryProbe(root),
  };
}

export { compilePattern };
