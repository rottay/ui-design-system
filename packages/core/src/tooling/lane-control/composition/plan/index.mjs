/**
 * @fileoverview Lane plan loading and resolution.
 *
 * A LANE PLAN is the coordinator's declaration of who may write where during
 * one batch. It is the input every check in this folder reads, so it is the
 * only place a lane's boundary is stated and the only place it can be wrong.
 *
 * RESOLUTION IS THREE-LAYERED, on purpose:
 *
 *   row        — the ownership row that BOUNDS the lane (`writeRoot` minus
 *                `writeExcludes`). For a family that row is derived from the
 *                canonical inventory, and its bound is the family's exact
 *                `sourceOwner` subtree. A lane with no row and no explicit
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
import { loadRows, writeExcludesForRow, writeSetForRow } from '../../runtime/ownership-rows/index.mjs';
import { listFiles } from '../../foundation/git/index.mjs';
import { INTEGRATOR_ROOTS } from '../../runtime/shared-files/index.mjs';

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
 * The closed set of lane shapes. A lane is one of exactly these three things,
 * and the role decides where its bound may come from.
 *
 * The hole this closes: a lane with NO row and an explicit `writeRoot` could
 * be pointed straight at a family's subtree. It then inherited none of that
 * family's derived `writeExcludes`, so it silently owned every family nested
 * inside it — the catalog was bypassed by simply not mentioning it. Declaring
 * a root is now only legitimate where no family owner exists to bind to.
 */
export const LANE_ROLES = Object.freeze(['family', 'domain', 'integrator']);

function inferRole(lane, row) {
  if (lane.laneRole) return lane.laneRole;
  if (row) return row.synthetic ? 'domain' : 'family';
  return 'integrator';
}

/**
 * Resolve one lane: its role, its bound, its declared patterns, the files
 * those patterns cover today, and every way the declaration escapes.
 */
export function resolveLane(lane, context) {
  const { rowIndex, universe, isDirectory, integratorRoots = [] } = context;

  const row = lane.row ? rowIndex.get(lane.row) : null;
  if (lane.row && !row) throw new Error(`lane-control: lane "${lane.id}" names unknown row "${lane.row}"`);

  const laneRole = inferRole(lane, row);
  const roleViolations = [];
  if (!LANE_ROLES.includes(laneRole)) {
    roleViolations.push({
      kind: 'unknown-role',
      message: `laneRole "${laneRole}" is not one of ${LANE_ROLES.join(', ')}`,
    });
  }
  if (laneRole === 'family' || laneRole === 'domain') {
    if (!row) {
      roleViolations.push({
        kind: 'role-needs-row',
        message: `a ${laneRole} lane must name an ownership row — that row IS its bound`,
      });
    } else if (laneRole === 'family' && row.synthetic) {
      roleViolations.push({
        kind: 'role-row-mismatch',
        message: `row "${row.id}" is synthetic, so this is a domain lane, not a family lane`,
      });
    } else if (laneRole === 'domain' && !row.synthetic) {
      roleViolations.push({
        kind: 'role-row-mismatch',
        message: `row "${row.id}" is a family, so this is a family lane, not a domain lane`,
      });
    }
    if (lane.writeRoot !== undefined) {
      roleViolations.push({
        kind: 'role-declares-root',
        message: `a ${laneRole} lane may not declare writeRoot — it inherits the row's bound, and a declared root is how the catalog gets bypassed`,
      });
    }
  }
  if (laneRole === 'integrator') {
    if (row) {
      roleViolations.push({
        kind: 'role-names-row',
        message: `an integrator lane may not name row "${lane.row}" — it exists to hold shared regions no row owns`,
      });
    }
    if (lane.writeRoot === undefined) {
      roleViolations.push({ kind: 'role-needs-root', message: 'an integrator lane must declare its writeRoot' });
    } else {
      const declaredRoot = normalizePath(lane.writeRoot);
      if (!integratorRoots.some((allowed) => isUnderOrEqual(declaredRoot, allowed))) {
        roleViolations.push({
          kind: 'root-outside-integrator-domains',
          message: `writeRoot "${declaredRoot}" is not inside a declared shared region (${integratorRoots.join(', ')}) — bind to an ownership row instead`,
        });
      }
    }
  }

  const writeRoot = normalizePath(lane.writeRoot ?? row?.writeRoot ?? '');
  if (!writeRoot) {
    throw new Error(
      `lane-control: lane "${lane.id}" has no writeRoot — name an ownership row or declare writeRoot. An unbounded lane cannot be checked.`,
    );
  }

  const rowExcludes = row ? writeExcludesForRow(row) : [];
  const laneExcludes = (lane.writeExcludes ?? []).map((entry) => normalizePath(entry));
  const writeExcludes = [...new Set([...rowExcludes, ...laneExcludes])];

  const declared = lane.writeSet ?? (row ? writeSetForRow(row) : [`${writeRoot}/**`]);
  const compiledWrite = compilePatterns(declared);

  // An exclusion naming a DIRECTORY excludes the directory and its subtree;
  // an exclusion carrying glob magic is a shape and is taken literally. Both
  // forms are needed: a row's `writeExcludes` are directories — the source
  // owners nesting inside this one — while a lane sharing a directory with
  // another lane can only be separated by shape.
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
    laneRole,
    roleViolations,
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

export function loadContext({ root, testCatalog }) {
  const rows = loadRows({ root, testCatalog });
  return {
    root,
    rows,
    rowIndex: rows.index,
    integratorRoots: INTEGRATOR_ROOTS,
    universe: listFiles(root).map((file) => normalizePath(file)),
    isDirectory: directoryProbe(root),
  };
}

export { compilePattern };
