import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import { REPOSITORY_ROOT, loadProgramContracts } from '../contracts/index.mjs';
import {
  classifyReservedHit,
  deriveFamilyRoots,
  effectiveFiles,
  entriesConflict,
  laneScopeContains,
  globRelationship,
  patternToRegex,
} from '../ownership-overlap/index.mjs';

/**
 * orchestration/index.json#workOrderAdmission declares `requiredBeforeWrite: true`.
 * Enforcement means a lane packet that misses a required field is rejected here, so
 * the missing field blocks the write instead of being noted after the fact.
 */

const BLOCKING_FIELDS = Object.freeze([
  'observableDefect',
  'responsiveStrategy',
  'expectedTenantDivergence',
]);

function isPopulated(value) {
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (value && typeof value === 'object') return Object.keys(value).length > 0;
  return value !== undefined && value !== null;
}

export function admitWriterLane(packet, options = {}) {
  const contracts = options.contracts ?? loadProgramContracts();
  const admission = contracts.orchestration.workOrderAdmission;
  const required = contracts.orchestration[admission.requiredFieldsSource];
  const blockers = [];

  for (const field of required) {
    if (!Object.hasOwn(packet ?? {}, field)) {
      blockers.push(`lane packet is missing required field ${field}`);
      continue;
    }
    if (BLOCKING_FIELDS.includes(field) && !isPopulated(packet[field])) {
      blockers.push(`lane packet declares an empty ${field}, which blocks the lane`);
    }
  }

  const owned = Array.isArray(packet?.ownedFiles) ? packet.ownedFiles : [];
  if (owned.length === 0) blockers.push('lane packet declares no owned files, so ownership cannot be proven');

  const reserved = contracts.orchestration.reservedPaths;
  const barrelRule = contracts.orchestration.barrelOwnership ?? null;
  const root = options.root ?? REPOSITORY_ROOT;
  const proposal = options.proposal ?? null;
  // Family roots come from the round proposal. Without it the classifier has no authority,
  // so every adjudicated hit falls through to `unclassified` and blocks — fail closed.
  const familyRoots = deriveFamilyRoots(proposal?.lanes ?? []);
  const adjudicatedEntrypoints = [];

  /**
   * Global classification answers "what KIND of file is this". It does not answer "may THIS
   * lane write it". A packet must therefore resolve to exactly one proposal lane, and every
   * file it claims must fall inside that lane's own effective write set.
   */
  // Every WRITING lane class is bound, not just family-writer: an integrator packet claiming
  // a family's own entrypoint would otherwise face no ownership check at all. Reviewers are
  // exempt because they may own nothing, which is enforced separately.
  const laneType = contracts.orchestration.laneTypes[packet?.laneClass];
  // Gating on "is a writing class" fails OPEN for a laneClass nobody declared: an unknown
  // class is not a writing class, so it would skip lane resolution AND the family-writer
  // reserved loop, and be admitted with arbitrary owned files.
  if (!laneType) {
    blockers.push(`lane packet declares unknown laneClass ${packet?.laneClass ?? 'none'} — fail closed`);
  }

  let resolvedLane = null;
  if (laneType?.writes === true) {
    if (!proposal) {
      blockers.push(
        'admission requires the authorized ownership proposal; without it the packet lane cannot be resolved and ownership cannot be proven',
      );
    } else {
      const matches = (proposal.lanes ?? []).filter((lane) => lane.lane === packet?.lane);
      if (matches.length === 0) {
        blockers.push(`lane ${packet?.lane} is not declared in the ownership proposal`);
      } else if (matches.length > 1) {
        blockers.push(`lane ${packet?.lane} is declared ${matches.length} times in the ownership proposal`);
      } else {
        resolvedLane = matches[0];
        if (resolvedLane.laneClass !== packet?.laneClass) {
          blockers.push(
            `lane ${packet?.lane} declares laneClass ${packet?.laneClass} but the proposal declares ${resolvedLane.laneClass}`,
          );
        }
      }
    }
  }

  if (resolvedLane) {
    const allowed = effectiveFiles(resolvedLane, { root });
    for (const file of owned) {
      // An existing file is judged by the effective write set — the exact named authority.
      if (allowed.has(file)) continue;
      if (fs.existsSync(path.join(root, file))) {
        blockers.push(`owned file ${file} is outside the effective write set of lane ${packet?.lane}`);
        continue;
      }
      // A file that does not exist yet cannot be in any expansion, but admission runs BEFORE
      // the lane writes, so refusing every such claim would make the gate unsatisfiable for
      // exactly the work it authorizes. It is judged against the same lane's declared scope
      // instead — no weaker, since the path must still fall inside writeSet minus excludes.
      if (laneScopeContains(resolvedLane, file)) continue;
      blockers.push(
        `owned file ${file} does not exist yet and is outside the declared write scope of lane ${packet?.lane}`,
      );
    }
  }

  if (packet?.laneClass === 'family-writer') {
    const forbidden = contracts.orchestration.laneTypes['family-writer'].mayNotEdit;
    for (const file of owned) {
      // Evaluated PER PATTERN, not "matches any reserved path". A file can match both the
      // adjudicated index pattern and an unrelated reserved pattern; the unrelated one must
      // still block unconditionally.
      for (const pattern of reserved) {
        if (!matchesReservedPattern(file, pattern)) continue;
        if (barrelRule && pattern === barrelRule.appliesToReservedPattern) {
          const verdict = classifyReservedHit(file, pattern, familyRoots, barrelRule);
          if (verdict.classification !== 'permitted-by-contract-rule') {
            blockers.push(`family-writer lane may not own reserved path ${file} — ${verdict.reason}`);
            continue;
          }
          // The classifier says which lane this entrypoint belongs to. Discarding that and
          // admitting on the class alone lets one lane claim another lane's component.
          if (verdict.owningLane !== packet?.lane) {
            blockers.push(
              `lane ${packet?.lane} may not own reserved path ${file} — it is the implementation entrypoint of lane ${verdict.owningLane}`,
            );
            continue;
          }
          adjudicatedEntrypoints.push({
            file,
            ruleId: verdict.ruleId,
            owningFamilyRoot: verdict.owningFamilyRoot,
            owningLane: verdict.owningLane,
          });
          continue;
        }
        blockers.push(`family-writer lane may not own reserved path ${file}`);
      }
      for (const category of forbidden) {
        if (barrelRule && category === barrelRule.bindsMayNotEditCategory) {
          // Only a file the adjudicated pattern actually matches can be a barrel.
          if (!matchesReservedPattern(file, barrelRule.appliesToReservedPattern)) continue;
          const verdict = classifyReservedHit(file, barrelRule.appliesToReservedPattern, familyRoots, barrelRule);
          if (verdict.barrelClass === 'shared-barrel') {
            blockers.push(`family-writer lane may not own ${category} file ${file}`);
          }
          continue;
        }
        if (file.includes(`/${category}/`) || file.startsWith(`${category}/`)) {
          blockers.push(`family-writer lane may not own ${category} file ${file}`);
        }
      }
    }
  }

  if (admission.reviewerRequiresOneFreshScopedCheck && packet?.laneClass === 'reviewer') {
    if (!isPopulated(packet?.freshScopedCheck)) {
      blockers.push('reviewer lane must run one fresh scoped check');
    }
    if (owned.length > 0) blockers.push('reviewers never edit what they review');
  }

  return {
    schemaVersion: 2,
    lane: packet?.lane ?? null,
    admitted: blockers.length === 0,
    requiredBeforeWrite: admission.requiredBeforeWrite === true,
    proposalSupplied: proposal !== null,
    proposalPath: options.proposalPath ?? null,
    proposalSha256:
      options.proposalPath && fs.existsSync(options.proposalPath)
        ? crypto.createHash('sha256').update(fs.readFileSync(options.proposalPath)).digest('hex')
        : null,
    resolvedLane: resolvedLane?.lane ?? null,
    blockers,
    adjudicatedEntrypoints,
  };
}

/**
 * Single-pattern test, shared with the ownership analyzer so both consumers of
 * `reservedPaths` agree byte-for-byte. The previous naive `**` -> `.*` rewrite could not
 * match zero intermediate segments, so the index pattern missed `packages/core/src/index.ts`
 * exactly and that file escaped admission. The corrected builder is a strict superset;
 * verified against the R1 proposal, both forms yield the same 38 hits, so aligning them
 * moved no recorded number.
 */
export function matchesReservedPattern(file, pattern) {
  return patternToRegex(pattern).test(file);
}

export function matchesReserved(file, reservedPaths) {
  return reservedPaths.some((pattern) => matchesReservedPattern(file, pattern));
}

/**
 * A conflict graph is safe only when no two lanes in the same cohort write the same file
 * and no two lanes claim the same singleton integrator authority.
 *
 * "The same file" is a question about the sets two entries match, not about the strings.
 * Comparing strings let a broad parent such as `patterns/data/**` sit beside
 * `patterns/data/list-toolbar/**` and read as safe, because the two spellings differ.
 */
export function validateConflictGraph(graph, options = {}) {
  const contracts = options.contracts ?? loadProgramContracts();
  const blockers = [];
  const writerByFile = new Map();
  const singletonClasses = Object.entries(contracts.orchestration.laneTypes)
    .filter(([, definition]) => definition.singleton === true)
    .map(([name]) => name);
  const singletonSeen = new Map();

  for (const node of graph?.nodes ?? []) {
    for (const file of node.writeSet ?? []) {
      let claimed = false;
      for (const [owned, owner] of writerByFile) {
        const relationship = globRelationship(file, owned);
        if (relationship === 'DISJOINT') continue;
        claimed = true;
        if (relationship === 'EXACT_EQUAL') {
          blockers.push(`file ${file} is written by both ${owner} and ${node.lane}`);
        } else {
          const parent = relationship === 'LEFT_CONTAINS_RIGHT' ? file : owned;
          const child = relationship === 'LEFT_CONTAINS_RIGHT' ? owned : file;
          blockers.push(
            `write set ${parent} (${relationship === 'LEFT_CONTAINS_RIGHT' ? node.lane : owner})`
              + ` contains ${child} (${relationship === 'LEFT_CONTAINS_RIGHT' ? owner : node.lane}),`
              + ' so both lanes can write the same file',
          );
        }
      }
      if (!claimed) writerByFile.set(file, node.lane);
    }
    if (singletonClasses.includes(node.laneClass)) {
      if (singletonSeen.has(node.laneClass)) {
        blockers.push(
          `${node.laneClass} must be singleton but is claimed by ${singletonSeen.get(node.laneClass)} and ${node.lane}`,
        );
      } else {
        singletonSeen.set(node.laneClass, node.lane);
      }
    }
    if (node.laneClass === 'reviewer' && (node.writeSet ?? []).length > 0) {
      blockers.push(`reviewer lane ${node.lane} declares a write set`);
    }
  }

  const declaredEdges = new Set((graph?.edges ?? []).map((edge) => [edge.from, edge.to].sort().join('::')));
  for (const left of graph?.nodes ?? []) {
    for (const right of graph?.nodes ?? []) {
      if (left.lane >= right.lane) continue;
      const shared = (left.writeSet ?? []).filter((file) =>
        (right.writeSet ?? []).some((other) => entriesConflict(file, other)),
      );
      const readWrite = (left.writeSet ?? []).filter((file) =>
        (right.readSet ?? []).some((other) => entriesConflict(file, other)),
      );
      if ((shared.length > 0 || readWrite.length > 0) && !declaredEdges.has([left.lane, right.lane].sort().join('::'))) {
        blockers.push(`undeclared conflict edge between ${left.lane} and ${right.lane}`);
      }
    }
  }

  const parallel = (graph?.nodes ?? []).filter((node) => node.cohort === graph?.activeCohort);
  return {
    schemaVersion: 2,
    safe: blockers.length === 0,
    nodes: (graph?.nodes ?? []).length,
    activeCohortSize: parallel.length,
    blockers,
  };
}
