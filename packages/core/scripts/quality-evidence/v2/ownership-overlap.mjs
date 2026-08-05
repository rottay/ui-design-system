import fs from 'node:fs';
import path from 'node:path';

import { REPOSITORY_ROOT, loadProgramContracts } from './contracts.mjs';

/**
 * Write-set overlap analysis.
 *
 * The original conflict-graph check compared write sets by exact string equality, so
 * `patterns/data/**` and `patterns/data/list-toolbar/**` read as two unrelated files and a
 * broad parent could never turn the check red. Ownership is a question about the SETS OF
 * FILES two globs match, not about the strings, so every predicate here reasons over scopes
 * and — where the contract is expressed per file — over the real expansion on disk.
 */


/**
 * Invocation-scoped caches. Only reads under REPOSITORY_ROOT are cached: that tree is never
 * written during an analysis run, while drills operate on temporary roots they DO write, so
 * those bypass the cache entirely and can never see a stale listing. Nothing is persisted
 * between processes.
 */
const expansionCache = new Map();
const sourceCache = new Map();
const resolveCache = new Map();
const laneFileCache = new Map();

function cacheable(root) {
  return root === REPOSITORY_ROOT;
}

/** Exposed so a long-lived process can drop the caches deliberately rather than by accident. */
export function clearAnalysisCaches() {
  expansionCache.clear();
  sourceCache.clear();
  resolveCache.clear();
  laneFileCache.clear();
}

/**
 * A write-set entry denotes either a directory subtree (`X/**`) or a single file. Both are
 * reduced to a scope so containment is one comparison instead of a special case per shape.
 */
export function toScope(entry) {
  const raw = String(entry ?? '').trim();
  if (raw.endsWith('/**')) return { kind: 'subtree', prefix: raw.slice(0, -3).replace(/\/+$/, '') };
  if (raw.endsWith('/*')) return { kind: 'children', prefix: raw.slice(0, -2).replace(/\/+$/, '') };
  return { kind: 'file', prefix: raw };
}

function underOrEqual(candidate, prefix) {
  return candidate === prefix || candidate.startsWith(`${prefix}/`);
}

/**
 * Relationship between two write-set entries, from the perspective of `left`.
 * Anything other than DISJOINT means two owners can reach the same file.
 *
 * Limit worth knowing before trusting this alone: the comparison is prefix-based and does
 * not model a mid-path wildcard, so `a/**{}/contracts/**` and `a/b/contracts/**` read as
 * DISJOINT here even though they overlap on disk. `findOwnershipCollisions` compares real
 * expansions and is the authority; this function is the intent-level signal that can name a
 * dangerous spelling before any file exists.
 */
export function globRelationship(left, right) {
  const a = toScope(left);
  const b = toScope(right);
  if (a.prefix === b.prefix && a.kind === b.kind) return 'EXACT_EQUAL';

  const aCoversB = a.kind !== 'file' && underOrEqual(b.prefix, a.prefix);
  const bCoversA = b.kind !== 'file' && underOrEqual(a.prefix, b.prefix);

  // `children` only reaches one level, so a deeper prefix is not actually covered.
  const depth = (value) => value.split('/').length;
  const aReaches = aCoversB && (a.kind === 'subtree' || depth(b.prefix) <= depth(a.prefix) + 1);
  const bReaches = bCoversA && (b.kind === 'subtree' || depth(a.prefix) <= depth(b.prefix) + 1);

  if (aReaches && bReaches) return 'EXACT_EQUAL';
  if (aReaches) return 'LEFT_CONTAINS_RIGHT';
  if (bReaches) return 'RIGHT_CONTAINS_LEFT';
  return 'DISJOINT';
}

export function entriesConflict(left, right) {
  return globRelationship(left, right) !== 'DISJOINT';
}

/**
 * Every unordered lane pair, every entry pair, compared as glob scopes. This is the
 * intent-level signal: it names the offending spellings even when no file exists yet.
 */
export function findGlobContainments(lanes) {
  const found = [];
  const list = Array.isArray(lanes) ? lanes : [];
  for (let i = 0; i < list.length; i++) {
    for (let j = i + 1; j < list.length; j++) {
      const left = list[i];
      const right = list[j];
      for (const leftEntry of left.writeSet ?? []) {
        for (const rightEntry of right.writeSet ?? []) {
          const relationship = globRelationship(leftEntry, rightEntry);
          if (relationship === 'DISJOINT') continue;
          found.push({
            leftLane: left.lane ?? null,
            rightLane: right.lane ?? null,
            leftEntry,
            rightEntry,
            relationship,
            parent:
              relationship === 'LEFT_CONTAINS_RIGHT'
                ? leftEntry
                : relationship === 'RIGHT_CONTAINS_LEFT'
                  ? rightEntry
                  : null,
          });
        }
      }
    }
  }
  return found;
}

/**
 * The files a lane may actually write: everything its write set reaches, minus everything
 * it hands to another owner. Exclusions are what let a family keep its own folder while a
 * singleton integrator keeps the barrel, the tests and the contracts inside it.
 */
export function effectiveFiles(lane, { root = REPOSITORY_ROOT } = {}) {
  const laneKey = cacheable(root)
    ? `${lane?.lane ?? ''}\u0000${JSON.stringify(lane?.writeSet ?? [])}\u0000${JSON.stringify(lane?.writeSetExcludes ?? [])}`
    : null;
  if (laneKey && laneFileCache.has(laneKey)) return laneFileCache.get(laneKey);
  const owned = new Set();
  for (const entry of lane?.writeSet ?? []) {
    for (const file of expandEntry(entry, { root })) owned.add(file);
  }
  for (const entry of lane?.writeSetExcludes ?? []) {
    for (const file of expandEntry(entry, { root })) owned.delete(file);
  }
  if (laneKey) laneFileCache.set(laneKey, owned);
  return owned;
}

/**
 * Intensional twin of `effectiveFiles`: does this lane's writeSet-minus-excludes COVER a
 * path, judged over patterns rather than over the filesystem?
 *
 * Needed because `workOrderAdmission.requiredBeforeWrite` runs admission BEFORE the lane
 * writes, so a file the lane is about to create does not exist yet. Judging authority only
 * by expansion would make the gate unsatisfiable for exactly the work it is meant to
 * authorize. Authority is a property of the path, not of the inode.
 *
 * For any file that DOES exist this agrees with `effectiveFiles` by construction — same
 * entries, same `patternToRegex` — and the agreement is asserted executably by a drill
 * rather than argued here.
 */
export function laneScopeContains(lane, file) {
  const covers = (entry) => {
    const raw = String(entry ?? '').trim();
    if (patternToRegex(raw).test(file)) return true;
    // A wildcard-free directory entry means its whole subtree, matching expandEntry.
    return !raw.includes('*') && file.startsWith(`${raw.replace(/\/+$/, '')}/`);
  };
  const inSet = (entries) => (Array.isArray(entries) ? entries : []).some(covers);
  return inSet(lane?.writeSet) && !inSet(lane?.writeSetExcludes);
}

/**
 * The decisive question — can two lanes write the same real file? Answered over expansions
 * so an exclusion actually resolves an overlap instead of merely claiming to.
 */
export function findOwnershipCollisions(lanes, { root = REPOSITORY_ROOT } = {}) {
  const list = Array.isArray(lanes) ? lanes : [];
  const expanded = list.map((lane) => ({ lane, files: effectiveFiles(lane, { root }) }));
  const collisions = [];
  for (let i = 0; i < expanded.length; i++) {
    for (let j = i + 1; j < expanded.length; j++) {
      const shared = [...expanded[i].files].filter((file) => expanded[j].files.has(file));
      if (shared.length === 0) continue;
      collisions.push({
        leftLane: expanded[i].lane.lane ?? null,
        rightLane: expanded[j].lane.lane ?? null,
        sharedFileCount: shared.length,
        sharedFiles: shared.slice(0, 10),
        truncated: shared.length > 10,
      });
    }
  }
  return collisions;
}

/** A lane whose own write set contains one of its own entries is redundant, not conflicting. */
export function findWithinLaneRedundancies(lanes) {
  const found = [];
  for (const lane of Array.isArray(lanes) ? lanes : []) {
    const entries = lane.writeSet ?? [];
    for (let i = 0; i < entries.length; i++) {
      for (let j = i + 1; j < entries.length; j++) {
        const relationship = globRelationship(entries[i], entries[j]);
        if (relationship === 'DISJOINT') continue;
        found.push({
          lane: lane.lane ?? null,
          relationship,
          parent: relationship === 'RIGHT_CONTAINS_LEFT' ? entries[j] : entries[i],
          child: relationship === 'RIGHT_CONTAINS_LEFT' ? entries[i] : entries[j],
        });
      }
    }
  }
  return found;
}

/**
 * Correct globstar semantics: `a/**{}/index.ts` must match `a/index.ts` as well as
 * `a/deep/index.ts`, so `**{}/` collapses to "zero or more directories" rather than the
 * "at least one" that a naive `**` -> `.*` rewrite produces.
 */
export function patternToRegex(pattern) {
  let source = '';
  for (let index = 0; index < pattern.length; index++) {
    if (pattern.startsWith('**/', index)) {
      source += '(?:.*/)?';
      index += 2;
      continue;
    }
    if (pattern.startsWith('**', index)) {
      source += '.*';
      index += 1;
      continue;
    }
    const character = pattern[index];
    if (character === '*') {
      source += '[^/]*';
      continue;
    }
    source += /[.+?^${}()|[]\]/.test(character) ? `\${character}` : character;
  }
  return new RegExp(`^${source}$`);
}

function walkFiles(absolute, relative, out) {
  for (const child of fs.readdirSync(absolute, { withFileTypes: true })) {
    const childRelative = `${relative}/${child.name}`;
    if (child.isDirectory()) walkFiles(path.join(absolute, child.name), childRelative, out);
    else out.push(childRelative);
  }
}

/** Real files a write-set entry reaches. Used where the contract binds per file. */
export function expandEntry(entry, { root = REPOSITORY_ROOT } = {}) {
  const raw = String(entry ?? '').trim();
  const cacheKey = `${root}\u0000${raw}`;
  if (cacheable(root) && expansionCache.has(cacheKey)) return expansionCache.get(cacheKey);
  const wildcard = raw.indexOf('*');
  const staticPart = wildcard === -1 ? raw : raw.slice(0, raw.lastIndexOf('/', wildcard));
  const absolute = path.join(root, staticPart);
  if (!fs.existsSync(absolute)) return [];

  if (!fs.statSync(absolute).isDirectory()) {
    const single = [staticPart];
    if (cacheable(root)) expansionCache.set(cacheKey, single);
    return single;
  }

  const all = [];
  walkFiles(absolute, staticPart, all);
  if (wildcard === -1) {
    const sorted = all.sort();
    if (cacheable(root)) expansionCache.set(cacheKey, sorted);
    return sorted;
  }

  const regex = patternToRegex(raw);
  const matched = all.filter((file) => regex.test(file)).sort();
  if (cacheable(root)) expansionCache.set(cacheKey, matched);
  return matched;
}

/**
 * Reserved-path matching uses the corrected globstar builder rather than the naive
 * `**` -> `.*` rewrite that `admission.mjs#matchesReserved` still carries. The naive form
 * cannot match zero intermediate segments, so a pattern like
 * `packages/core/src/**{}/index.ts` misses `packages/core/src/index.ts` exactly. The
 * corrected form is a strict superset — it can only ever catch more, never less.
 *
 * Verified on the current R1 proposal: both forms yield 38 hits with zero differences, so
 * this hardening moved no recorded number. `admission.mjs` is deliberately NOT changed here;
 * its matcher is existing validated behaviour on a different code path, and altering how
 * reserved paths are interpreted is a contract question, not an evidence-round edit. The
 * divergence is recorded as a known issue instead.
 */
function matchesReservedPattern(file, pattern) {
  return patternToRegex(pattern).test(file);
}

/**
 * The reserved-path and mayNotEdit rules bind per FILE. Checking them against the glob
 * string lets `.../data-table/**` pass while its expansion contains a reserved
 * `index.ts` — the same string-versus-set blindness the containment check fixes.
 */
/**
 * Adjudicates one reserved-path hit using the CONTRACT's barrelOwnership rule rather than a
 * filename heuristic. Classifying every `index.ts` as the family's own entrypoint would
 * neutralise a binding rule; classifying by position decides it, and anything the rule
 * cannot place fails closed.
 */
const insideOrEqual = (candidate, root) => candidate === root || candidate.startsWith(`${root}/`);
const strictlyInside = (candidate, root) => candidate !== root && candidate.startsWith(`${root}/`);

/** A bare string carries no lane, so it is treated as its own lane — conservatively. */
function normalizeFamilyRoots(familyRoots) {
  return (Array.isArray(familyRoots) ? familyRoots : []).map((entry) =>
    typeof entry === 'string' ? { root: entry, lane: entry } : { root: entry.root, lane: entry.lane ?? entry.root },
  );
}

/**
 * Derives the family roots the predicate reasons over: every family-writer writeSet root,
 * plus every `sourceOwner` that lies STRICTLY inside one of that same lane's roots.
 *
 * The strictly-inside filter is what makes it safe to read `sourceOwner` at all. That field
 * is a resolution pointer and is category-grade for three families, so admitting it whole
 * would classify `patterns/data/index.ts` as "inside the PatternDataTable family" and
 * resurrect the very bug this rule exists to stop. Nested markers such as
 * `structures/shell/bottom-tab-bar` are exactly what the filter keeps.
 */
export function deriveFamilyRoots(lanes) {
  const roots = [];
  for (const lane of (Array.isArray(lanes) ? lanes : []).filter((entry) => entry.laneClass === 'family-writer')) {
    const own = (lane.writeSet ?? []).map((entry) => toScope(entry).prefix.replace(/\/\*\*.*$/, ''));
    for (const root of own) roots.push({ root, lane: lane.lane ?? null, origin: 'writeSet' });
    for (const family of lane.families ?? []) {
      const pointer = family.sourceOwner;
      if (pointer && own.some((root) => strictlyInside(pointer, root))) {
        roots.push({ root: pointer, lane: lane.lane ?? null, origin: 'nested-sourceOwner' });
      }
    }
  }
  return roots;
}

/**
 * The canonical adjudication, implementing orchestration.barrelOwnership. Every leg either
 * classifies positively or fails closed; nothing is waved through on filename.
 */
export function classifyReservedHit(file, pattern, familyRoots, barrelRule) {
  if (!barrelRule || !barrelRule.appliesToReservedPattern) {
    return { classification: 'blocking', reason: 'no barrelOwnership rule available — fail closed' };
  }
  // Reserved hits on any other pattern were never in scope for this adjudication.
  if (pattern !== barrelRule.appliesToReservedPattern) {
    return { classification: 'blocking', reason: 'reserved path outside the barrel adjudication' };
  }

  const roots = normalizeFamilyRoots(familyRoots);
  if (roots.length === 0) {
    return {
      classification: 'blocking',
      barrelClass: 'unclassified',
      ruleId: barrelRule.ruleId ?? null,
      reason: 'no declared family roots, so the rule has no authority to classify — fail closed',
    };
  }

  const directory = file.includes('/') ? file.slice(0, file.lastIndexOf('/')) : '';

  // A directory sitting ABOVE any declared family root aggregates peers, so its index is a
  // shared barrel no matter who claimed it. Without this a lane could launder a category
  // barrel into its own source merely by declaring the category as its root.
  if (roots.some((entry) => strictlyInside(entry.root, directory))) {
    return {
      classification: 'blocking',
      barrelClass: 'shared-barrel',
      ruleId: barrelRule.ruleId ?? null,
      reason: `a declared family root lies strictly inside this directory, so it aggregates peers and belongs to ${barrelRule.sharedBarrelOwner}`,
    };
  }

  const containing = roots.filter((entry) => insideOrEqual(directory, entry.root));
  if (containing.length === 0) {
    return {
      classification: 'blocking',
      barrelClass: 'shared-barrel',
      ruleId: barrelRule.ruleId ?? null,
      reason: `sits outside every declared family root, so it is a shared barrel owned by ${barrelRule.sharedBarrelOwner}`,
    };
  }

  const owningLanes = [...new Set(containing.map((entry) => entry.lane))];
  if (owningLanes.length !== 1) {
    return {
      classification: 'blocking',
      barrelClass: 'unclassified',
      ruleId: barrelRule.ruleId ?? null,
      reason: `lies inside family roots of ${owningLanes.length} lanes, so single ownership cannot be established — fail closed`,
    };
  }

  return {
    classification: 'permitted-by-contract-rule',
    barrelClass: 'implementation-entrypoint',
    ruleId: barrelRule.ruleId ?? null,
    owningLane: owningLanes[0],
    owningFamilyRoot: containing.sort((left, right) => right.root.length - left.root.length)[0].root,
    reason: "at or inside exactly one lane's family roots and contains none, so it is that family's own authored source",
  };
}

export function findExpansionViolations(lanes, { root = REPOSITORY_ROOT, contracts = loadProgramContracts() } = {}) {
  const reserved = contracts.orchestration.reservedPaths ?? [];
  const forbidden = contracts.orchestration.laneTypes['family-writer']?.mayNotEdit ?? [];
  const barrelRule = contracts.orchestration.barrelOwnership ?? null;
  const familyRoots = deriveFamilyRoots(lanes);
  const violations = [];

  for (const lane of Array.isArray(lanes) ? lanes : []) {
    if (lane.laneClass !== 'family-writer') continue;
    for (const file of effectiveFiles(lane, { root })) {
      for (const pattern of reserved) {
        if (!matchesReservedPattern(file, pattern)) continue;
        const verdict = classifyReservedHit(file, pattern, familyRoots, barrelRule);
        // Inside the analyzer, owning-lane agreement is a structural invariant: a lane's
        // expansion comes from its own writeSet and every writeSet entry is a derived family
        // root, so a permitted verdict cannot name a foreign lane. Assert it executably
        // rather than trusting the argument — this program has twice been burned by
        // "structurally impossible" claims held only in prose.
        const foreignOwner =
          verdict.classification === 'permitted-by-contract-rule'
          && verdict.owningLane !== (lane.lane ?? null);
        violations.push({
          lane: lane.lane ?? null,
          file,
          rule: 'reservedPath',
          pattern,
          ...verdict,
          ...(foreignOwner
            ? {
                classification: 'blocking',
                reason: `permitted verdict names owningLane ${verdict.owningLane} inside lane ${lane.lane} — the analyzer's owning-lane invariant is violated`,
              }
            : {}),
        });
      }
      for (const category of forbidden) {
        // `barrels` names no directory anywhere in this tree, so the substring test has been
        // vacuous since inception. The contract binds the word to the classifier instead.
        if (category === barrelRule?.bindsMayNotEditCategory) {
          // Only a file the adjudicated pattern actually matches can be a barrel. Without
          // this guard the positional classifier would label any file sitting above a family
          // root — a README, a .tsx component — as a shared barrel.
          if (!matchesReservedPattern(file, barrelRule.appliesToReservedPattern)) continue;
          const verdict = classifyReservedHit(file, barrelRule.appliesToReservedPattern, familyRoots, barrelRule);
          if (verdict.barrelClass === 'shared-barrel') {
            violations.push({ lane: lane.lane ?? null, file, rule: 'mayNotEdit', pattern: category, classification: 'blocking', reason: verdict.reason });
          }
          continue;
        }
        if (file.includes(`/${category}/`) || file.startsWith(`${category}/`)) {
          violations.push({
            lane: lane.lane ?? null,
            file,
            rule: 'mayNotEdit',
            pattern: category,
            classification: 'blocking',
          });
        }
      }
    }
  }
  return violations;
}

/**
 * Full analysis of an R1-style ownership proposal. `safe` is computed here so a receipt can
 * carry a derived verdict instead of an asserted boolean.
 */
export function analyzeOwnershipProposal(proposal, options = {}) {
  const lanes = proposal?.lanes ?? [];
  const roundWriteDomains = options.roundWriteDomains ?? loadRoundWriteDomains(proposal?.roundBeingPlanned);
  const root = options.root ?? REPOSITORY_ROOT;
  const contracts = options.contracts ?? loadProgramContracts();
  const collisions = findOwnershipCollisions(lanes, { root });
  const redundancies = findWithinLaneRedundancies(lanes);
  const expansionViolations = findExpansionViolations(lanes, { ...options, root });

  // A parent glob that survives only because an exclusion carves the child out is still
  // worth naming: the spelling stays dangerous the moment the exclusion is dropped.
  const collidingPairs = new Set(collisions.map((c) => [c.leftLane, c.rightLane].sort().join('::')));
  const globContainments = findGlobContainments(lanes).map((entry) => ({
    ...entry,
    resolvedByExclusion: !collidingPairs.has([entry.leftLane, entry.rightLane].sort().join('::')),
  }));

  const anatomyEdges = deriveAnatomyEdges(lanes, { root });
  const sharedEdges = deriveSharedAuthorityEdges(proposal, roundWriteDomains);
  const domainCoverage = checkDomainCoverage(proposal, roundWriteDomains);
  const unitCoverage = checkDomainUnitCoverage(proposal, roundWriteDomains, { root });
  const noWriteExceptions = checkNoWriteExceptions(proposal, roundWriteDomains);
  const requestFindings = checkSharedRequests(proposal, { root, roundWriteDomains });
  const singletonFindings = checkSingletonCardinality(proposal, { contracts });
  const prospective = findProspectiveWriterConflicts(lanes);
  const readSetFindings = checkReadSetsAgainstDerivation(proposal, anatomyEdges);

  // deriveAnatomyEdges was previously called twice per analysis — once for the report and
  // once for the sequencing check — doubling the dominant cost for no additional information.
  const unsequenced = findUnsequencedCohortEdges(proposal, [...anatomyEdges, ...sharedEdges]);
  const declaredEdgeFindings = checkDeclaredEdges(proposal, [...anatomyEdges, ...sharedEdges]);

  const cohorts = proposal?.checkpointCohorts ?? [];
  const laneByCanary = new Map(lanes.map((lane) => [lane.canary, lane]));
  const cohortCollisions = [];
  for (const [index, cohort] of cohorts.entries()) {
    const members = cohort.map((canary) => laneByCanary.get(canary)).filter(Boolean);
    for (const collision of findOwnershipCollisions(members, { root })) {
      cohortCollisions.push({ cohort: index + 1, ...collision });
    }
  }

  return {
    schemaVersion: 2,
    lanes: lanes.length,
    pairsChecked: (lanes.length * (lanes.length - 1)) / 2,
    ownershipCollisions: collisions,
    withinLaneRedundancies: redundancies,
    expansionViolations: expansionViolations.filter((entry) => entry.classification === 'blocking'),
    // Adjudicated by the contract's barrelOwnership rule, not waved through: each of these
    // was positively classified as a family's own implementation entrypoint. Anything the
    // rule could not place is in expansionViolations above and blocks.
    permittedByContractRule: expansionViolations.filter(
      (entry) => entry.classification === 'permitted-by-contract-rule',
    ),
    globContainments,
    cohortCollisions,
    domainCoverageFindings: domainCoverage,
    domainUnitCoverageFindings: unitCoverage,
    noWriteExceptionFindings: noWriteExceptions,
    sharedRequestFindings: requestFindings,
    readSetFindings,
    unsequencedCohortEdges: unsequenced,
    declaredEdgeFindings,
    singletonCardinalityFindings: singletonFindings,
    prospectiveWriterConflicts: prospective,
    lanesMissingReadSet: lanes
      .filter((lane) => (lane.writeSet ?? []).length > 0 && !(Array.isArray(lane.readSet) && lane.readSet.length > 0))
      .map((lane) => lane.lane),
    edges: { anatomy: anatomyEdges, sharedAuthority: sharedEdges },
    conflictFree:
      collisions.length === 0
      && redundancies.length === 0
      && expansionViolations.some((entry) => entry.classification === 'blocking') === false
      && domainCoverage.length === 0
      && prospective.length === 0
      && lanes.filter((lane) => (lane.writeSet ?? []).length > 0 && !(Array.isArray(lane.readSet) && lane.readSet.length > 0)).length === 0
      && unitCoverage.length === 0
      && noWriteExceptions.length === 0
      && requestFindings.length === 0
      && readSetFindings.length === 0
      && unsequenced.length === 0
      && declaredEdgeFindings.length === 0
      && singletonFindings.length === 0,
  };
}

/**
 * Domain coverage: every domain the ROUND CONTRACT declares required must have exactly one
 * owner, and every no-write domain must be owned by nobody. The required list is read from
 * the contract, never from the proposal, so a plan cannot self-certify by omitting a domain.
 */
export function checkDomainCoverage(proposal, roundWriteDomains) {
  const findings = [];
  const lanes = proposal?.lanes ?? [];
  // Domain matching cannot use globRelationship alone: it is prefix-based, so a domain glob
  // with a mid-path wildcard (`ui/**/contracts/**`) reads DISJOINT against a lane entry
  // (`Button/**/contracts/**`) they both really cover. Match over real expansions where the
  // domain exists on disk, and fall back to static-prefix containment where it does not yet.
  const staticPrefix = (glob) => {
    const star = glob.indexOf('*');
    return star === -1 ? glob : glob.slice(0, glob.lastIndexOf('/', star));
  };
  const owners = (globs) => {
    const domainFiles = new Set((globs ?? []).flatMap((glob) => expandEntry(glob)));
    return lanes.filter((lane) => {
      const files = effectiveFiles(lane);
      if ([...domainFiles].some((file) => files.has(file))) return true;
      return (lane.writeSet ?? []).some((entry) =>
        (globs ?? []).some((glob) => {
          const a = staticPrefix(entry);
          const b = staticPrefix(glob);
          return a === b || a.startsWith(`${b}/`) || b.startsWith(`${a}/`);
        }),
      );
    });
  };

  for (const domain of roundWriteDomains?.required ?? []) {
    const matched = owners(domain.globs);
    const laneNames = [...new Set(matched.map((lane) => lane.lane))];
    if (laneNames.length === 0) {
      findings.push({ domainId: domain.domainId, issue: 'no owner', detail: `required domain ${domain.domainId} has no owning lane` });
    } else if (domain.ownerLaneClass && !matched.some((lane) => lane.laneClass === domain.ownerLaneClass)) {
      const wrong = [...new Set(matched.map((l) => `${l.lane}:${l.laneClass}`))];
      // A domain must have at least one owner of its declared class. Sole occupancy is not
      // required: family-source is partitioned across many family-writers, and integrators
      // hold declared carve-outs (contracts, tests, barrels, styles) inside it by design.
      findings.push({ domainId: domain.domainId, issue: 'wrong owner class', detail: `expected ${domain.ownerLaneClass}, found ${wrong.join(', ')}` });
    }
  }

  for (const domain of roundWriteDomains?.noWrite ?? []) {
    const globs = (domain.globs ?? []).filter((glob) => !glob.includes('(?!'));
    const matched = owners(globs);
    if (matched.length > 0) {
      findings.push({
        domainId: domain.domainId,
        issue: 'no-write domain is claimed',
        detail: `${[...new Set(matched.map((l) => l.lane))].join(', ')} claim a domain declared no-write: ${domain.why}`,
      });
    }
  }
  return findings;
}

const IMPORT_PATTERN = /import\s+(?:type\s+)?(?:\{([^}]*)\}|[\w*\s,]+?)\s+from\s+['\"]([^'\"]+)['\"]/g;

/**
 * Edge condition 3 — "one lane consumes anatomy concurrently changed by another" — computed
 * from REAL relative imports rather than declared by hand. For each lane's owned files, any
 * relative import resolving into another lane's scope is a consumption edge.
 *
 * Limit, stated rather than hidden: only relative specifiers are resolved. Alias and package
 * specifiers are not traced, so this under-reports rather than over-reports; it can prove an
 * edge exists but cannot prove none does.
 */
export function deriveAnatomyEdges(lanes, { root = REPOSITORY_ROOT } = {}) {
  const writing = (Array.isArray(lanes) ? lanes : []).filter((lane) => (lane.writeSet ?? []).length > 0);
  const edges = [];

  // Resolve a specifier to the real file it designates. A bare directory means its index
  // entrypoint. Membership is then tested against the lane's EXACT scope — never against a
  // root obtained by truncating a glob at its first wildcard, which is what previously made
  // `Button/**/contracts/**` collapse to `Button` and turned a module importing itself into
  // a consumer of the contracts and tests integrators.
  const resolveFile = (base) => {
    const key = `${root}\u0000${base}`;
    if (cacheable(root) && resolveCache.has(key)) return resolveCache.get(key);
    const candidates = [base, `${base}.ts`, `${base}.tsx`, `${base}/index.ts`, `${base}/index.tsx`];
    let found = null;
    for (const candidate of candidates) {
      const absolute = path.join(root, candidate);
      if (fs.existsSync(absolute) && fs.statSync(absolute).isFile()) {
        found = candidate;
        break;
      }
    }
    if (cacheable(root)) resolveCache.set(key, found);
    return found;
  };

  // Hoisted: previously effectiveFiles(other) ran inside the per-import loop, so the whole
  // tree was re-walked once per import of every file. That single line was the 22-second cost.
  const filesByLane = new Map(writing.map((entry) => [entry.lane, effectiveFiles(entry, { root })]));

  for (const lane of writing) {
    for (const file of effectiveFiles(lane, { root })) {
      if (!/\.(ts|tsx|mts|cts)$/.test(file)) continue;
      let source;
      const sourceKey = `${root}\u0000${file}`;
      if (cacheable(root) && sourceCache.has(sourceKey)) {
        source = sourceCache.get(sourceKey);
      } else {
        try {
          source = fs.readFileSync(path.join(root, file), 'utf8');
        } catch {
          continue;
        }
        if (cacheable(root)) sourceCache.set(sourceKey, source);
      }
      if (source === null) continue;
      const fromDirectory = file.slice(0, file.lastIndexOf('/'));
      for (const match of source.matchAll(IMPORT_PATTERN)) {
        const named = (match[1] ?? '')
          .split(',')
          .map((part) => part.split(/\bas\b/)[0].replace(/^type\s+/, '').trim())
          .filter(Boolean);
        const specifier = match[2];
        if (!specifier.startsWith('.')) continue;
        const resolvedDirectory = path.posix.normalize(path.posix.join(fromDirectory, specifier));
        const resolved = resolveFile(resolvedDirectory);
        if (!resolved) continue;

        for (const other of writing) {
          if (other.lane === lane.lane) continue;

          // Direct: the resolved FILE is inside the other lane's effective scope.
          const direct = laneScopeContains(other, resolved);

          // Barrel: the specifier designates an aggregating module ABOVE the other lane's
          // own files, and a named specifier actually names one of that lane's families.
          let viaBarrel = false;
          if (!direct) {
            const otherFiles = filesByLane.get(other.lane) ?? new Set();
            const aggregates = [...otherFiles].some((candidate) => candidate.startsWith(`${resolvedDirectory}/`));
            viaBarrel = aggregates && (other.families ?? []).some((family) => named.includes(family.family));
          }
          if (!direct && !viaBarrel) continue;

          const key = `${lane.lane}::${other.lane}`;
          if (edges.some((edge) => edge.key === key)) continue;
          edges.push({
            key,
            from: lane.lane,
            to: other.lane,
            reason: direct
              ? `${file} imports ${resolved}, which ${other.lane} owns`
              : `${file} imports the aggregator ${resolvedDirectory} and names ${(other.families ?? []).map((f) => f.family).filter((n) => named.includes(n)).join(', ')}, owned by ${other.lane}`,
            condition: 'consumes-anatomy',
            via: direct ? 'direct-file' : 'named-through-barrel',
            resolvedFile: direct ? resolved : null,
          });
        }
      }
    }
  }
  return edges;
}

/** Edge conditions 2 and 4 — two lanes needing the same shared authority or generated/i18n artifact. */
export function deriveSharedAuthorityEdges(proposal, roundWriteDomains) {
  const lanes = proposal?.lanes ?? [];
  const edges = [];
  const sharedDomains = (roundWriteDomains?.required ?? []).filter((domain) =>
    ['shared-contracts', 'shared-barrels', 'shared-recipes-tokens-styles', 'manifests', 'i18n-catalogs'].includes(domain.domainId),
  );
  for (const domain of sharedDomains) {
    const requesters = lanes.filter((lane) =>
      (lane.sharedRequests ?? []).some((request) => request.domainId === domain.domainId),
    );
    for (let i = 0; i < requesters.length; i++) {
      for (let j = i + 1; j < requesters.length; j++) {
        edges.push({
          from: requesters[i].lane,
          to: requesters[j].lane,
          reason: `both request the shared authority ${domain.domainId}, which must be sequenced by its integrator`,
          condition: domain.domainId === 'i18n-catalogs' ? 'shared-generated-or-i18n' : 'same-reserved-authority',
        });
      }
    }
  }
  return edges;
}

/** Two writers on the same PROSPECTIVE path — pattern-level, so a not-yet-created file counts. */
export function findProspectiveWriterConflicts(lanes) {
  const writing = (Array.isArray(lanes) ? lanes : []).filter((lane) => (lane.writeSet ?? []).length > 0);
  const conflicts = [];
  for (let i = 0; i < writing.length; i++) {
    for (let j = i + 1; j < writing.length; j++) {
      for (const left of writing[i].writeSet ?? []) {
        for (const right of writing[j].writeSet ?? []) {
          if (globRelationship(left, right) === 'DISJOINT') continue;
          // An exclusion on either side that covers the other resolves the prospective overlap.
          // Exclusion matching must be pattern-aware: `shell/**/tests/**` really covers
          // `shell/tests/**`, but the prefix comparison alone reads them as disjoint and would
          // report a resolved overlap as a conflict.
          const excludes = (entries, other) =>
            (entries ?? []).some((entry) => {
              if (globRelationship(entry, other) !== 'DISJOINT') return true;
              const star = other.indexOf('*');
              const prefix = star === -1 ? other : other.slice(0, other.lastIndexOf('/', star));
              return patternToRegex(entry).test(`${prefix}/probe`);
            });
          const leftExcludes = excludes(writing[i].writeSetExcludes, right);
          const rightExcludes = excludes(writing[j].writeSetExcludes, left);
          if (leftExcludes || rightExcludes) continue;
          conflicts.push({ leftLane: writing[i].lane, rightLane: writing[j].lane, leftEntry: left, rightEntry: right });
        }
      }
    }
  }
  return conflicts;
}

/** Reads the round's declared write domains from the CONTRACT, never from the proposal. */
export function loadRoundWriteDomains(roundId, { contracts = loadProgramContracts() } = {}) {
  if (!roundId) return null;
  const rounds = contracts.rounds?.rounds ?? contracts.rounds ?? [];
  const round = (Array.isArray(rounds) ? rounds : []).find((entry) => entry.id === roundId);
  return round?.writeDomains ?? null;
}

/**
 * F5 closure — coverage must be COVERAGE, not "somebody intersects this domain".
 * Every enumerated unit of a domain must have exactly one owner. A domain that names
 * `units` is checked unit by unit, so losing eleven of twelve canary roots can no longer
 * pass on the strength of the twelfth.
 */
export function checkDomainUnitCoverage(proposal, roundWriteDomains, { root = REPOSITORY_ROOT } = {}) {
  const findings = [];
  const lanes = proposal?.lanes ?? [];
  for (const domain of roundWriteDomains?.required ?? []) {
    for (const unit of domain.units ?? []) {
      const owners = lanes.filter((lane) => laneScopeContains(lane, `${unit}/probe`) || laneScopeContains(lane, unit));
      const names = [...new Set(owners.map((lane) => lane.lane))];
      if (names.length === 0) {
        findings.push({ domainId: domain.domainId, unit, issue: 'unit has no owner' });
      } else if (names.length > 1) {
        findings.push({ domainId: domain.domainId, unit, issue: 'unit has multiple owners', detail: names.join(', ') });
      } else if (domain.ownerLaneClass && owners[0].laneClass !== domain.ownerLaneClass) {
        // Uniqueness alone fails open: the existential class check elsewhere is satisfied by
        // any sibling of the right class, so a single unit could be owned by the wrong one.
        findings.push({
          domainId: domain.domainId,
          unit,
          issue: 'unit owner has the wrong lane class',
          detail: `${owners[0].lane} is ${owners[0].laneClass}, but ${domain.domainId} requires ${domain.ownerLaneClass}`,
        });
      }
    }
  }
  return findings;
}

/**
 * F6 closure — a no-write domain expressed with an unsupported matcher was silently dropped,
 * so it always passed. Exceptions are now expressed as a supported (root, allowed) rule:
 * any write under `root` that is not inside one of `allowedRoots` blocks.
 */
export function checkNoWriteExceptions(proposal, roundWriteDomains) {
  const findings = [];
  for (const rule of roundWriteDomains?.noWriteExcept ?? []) {
    for (const lane of proposal?.lanes ?? []) {
      for (const entry of lane.writeSet ?? []) {
        const prefix = toScope(entry).prefix.replace(/\/\*\*.*$/, '');
        if (!(prefix === rule.root || prefix.startsWith(`${rule.root}/`))) continue;
        const allowed = (rule.allowedRoots ?? []).some(
          (allowedRoot) => prefix === allowedRoot || prefix.startsWith(`${allowedRoot}/`),
        );
        if (!allowed) {
          findings.push({ domainId: rule.domainId, lane: lane.lane, entry, issue: 'write outside the allowed roots', why: rule.why });
        }
      }
    }
  }
  return findings;
}

/**
 * A probe path that PRESERVES structure. Truncating a glob at its first wildcard is the same
 * collapse that made a mid-path contracts glob read as ownership of the whole module;
 * replacing wildcard segments with a concrete token keeps the channel intact.
 */
export function probePath(glob) {
  return String(glob ?? '')
    .split('/')
    .map((segment) => (segment.includes('*') ? 'probe' : segment))
    .join('/');
}

/**
 * F4 closure — a request must actually be a request. Every path must fall inside the TARGET
 * lane's scope and outside the requesting lane's own scope; a lane cannot ask for something
 * it already owns, and cannot ask an owner who does not own it.
 */
const ALLOWED_REQUEST_CHANGES = Object.freeze(['create', 'modify', 'delete', 'regenerate']);

export function checkSharedRequests(proposal, { root = REPOSITORY_ROOT, roundWriteDomains = null } = {}) {
  const findings = [];
  const lanes = proposal?.lanes ?? [];
  const byName = new Map(lanes.map((lane) => [lane.lane, lane]));
  const domains = new Map((roundWriteDomains?.required ?? []).map((domain) => [domain.domainId, domain]));
  const seenIds = new Set();

  for (const lane of lanes) {
    for (const request of lane.sharedRequests ?? []) {
      // Closed schema. A field that is merely conventional is a field a plan can omit, and an
      // omitted field is one the gate cannot judge.
      if (!request.requestId) {
        findings.push({ lane: lane.lane, issue: 'request has no requestId' });
      } else if (seenIds.has(request.requestId)) {
        findings.push({ lane: lane.lane, issue: 'duplicate requestId', detail: request.requestId });
      } else {
        seenIds.add(request.requestId);
      }
      if (request.fromLane !== lane.lane) {
        findings.push({ lane: lane.lane, issue: 'request fromLane does not match its container lane', detail: String(request.fromLane) });
      }
      if (!ALLOWED_REQUEST_CHANGES.includes(request.change)) {
        findings.push({ lane: lane.lane, issue: 'request declares an unsupported change', detail: String(request.change) });
      }
      if (typeof request.dependsOnCompletion !== 'boolean') {
        findings.push({ lane: lane.lane, issue: 'request dependsOnCompletion must be a boolean', detail: String(request.dependsOnCompletion) });
      }
      if (!Array.isArray(request.paths) || request.paths.length === 0) {
        findings.push({ lane: lane.lane, issue: 'request declares no paths' });
      }
      if (domains.size > 0) {
        const domain = domains.get(request.domainId);
        if (!domain) {
          findings.push({ lane: lane.lane, issue: 'request names a domain that is not in the round registry', detail: String(request.domainId) });
        } else if (domain.ownerLaneClass && byName.get(request.targetLane)?.laneClass !== domain.ownerLaneClass) {
          findings.push({
            lane: lane.lane,
            issue: 'request target is not the authoritative class for the domain',
            detail: `${request.targetLane} is ${byName.get(request.targetLane)?.laneClass ?? 'missing'}, but ${request.domainId} is owned by ${domain.ownerLaneClass}`,
          });
        }
      }

      const target = byName.get(request.targetLane);
      if (!target) {
        findings.push({ lane: lane.lane, issue: 'request names a lane that does not exist', detail: request.targetLane });
        continue;
      }
      for (const requestedPath of request.paths ?? []) {
        const probe = probePath(requestedPath);
        if (!laneScopeContains(target, probe)) {
          findings.push({
            lane: lane.lane,
            issue: 'request target does not own the requested path',
            detail: `${request.targetLane} scope does not contain ${requestedPath}`,
          });
        }
        if (laneScopeContains(lane, probe)) {
          findings.push({
            lane: lane.lane,
            issue: 'lane requests a path it already owns',
            detail: requestedPath,
          });
        }
      }
    }
  }
  return findings;
}

/**
 * F3 closure — an edge that changes nothing is decoration. Two lanes in the SAME cohort with
 * a consumption or shared-authority edge between them must be sequenced; an undeclared
 * intra-cohort edge is a scheduling violation and turns the verdict red.
 */
export function findUnsequencedCohortEdges(proposal, edges) {
  const cohorts = proposal?.checkpointCohorts ?? [];
  const laneByCanary = new Map((proposal?.lanes ?? []).map((lane) => [lane.canary, lane.lane]));
  const declared = new Set(
    (proposal?.declaredEdges ?? []).map((edge) => [edge.from, edge.to].sort().join('::')),
  );
  const violations = [];
  for (const [index, cohort] of cohorts.entries()) {
    const members = new Set(cohort.map((canary) => laneByCanary.get(canary)).filter(Boolean));
    for (const edge of edges) {
      if (!members.has(edge.from) || !members.has(edge.to)) continue;
      if (declared.has([edge.from, edge.to].sort().join('::'))) continue;
      violations.push({ cohort: index + 1, from: edge.from, to: edge.to, condition: edge.condition, reason: edge.reason });
    }
  }
  return violations;
}

/**
 * F2 closure — a readSet must contain what the code actually reads. The tool derives; the
 * plan must contain at least the derivation. A decorative `readSet: ["x"]` now fails.
 */
export function checkReadSetsAgainstDerivation(proposal, edges) {
  const findings = [];
  const laneByName = new Map((proposal?.lanes ?? []).map((lane) => [lane.lane, lane]));
  for (const edge of edges) {
    const consumer = laneByName.get(edge.from);
    const producer = laneByName.get(edge.to);
    if (!consumer || !producer) continue;
    // Check the readSet against the FILE the import actually resolved to, not against the
    // producer's whole write set. Accepting any overlap with the producer roots would let a
    // lane declare 48 coarse roots and call it derived; this requires the real dependency.
    const target = edge.resolvedFile ?? null;
    const covered = target
      ? (consumer.readSet ?? []).some((entry) => patternToRegex(entry).test(target) || target.startsWith(`${toScope(entry).prefix}/`) || toScope(entry).prefix === target)
      : (consumer.readSet ?? []).some((entry) => {
          const prefix = toScope(entry).prefix.replace(/\/\*\*.*$/, '');
          return (producer.writeSet ?? []).some((producerEntry) => {
            const producerPrefix = toScope(producerEntry).prefix.replace(/\/\*\*.*$/, '');
            return producerPrefix === prefix || producerPrefix.startsWith(`${prefix}/`) || prefix.startsWith(`${producerPrefix}/`);
          });
        });
    if (!covered) {
      findings.push({ lane: edge.from, issue: 'readSet omits a derived dependency', detail: `consumes ${edge.to} but declares no covering readSet entry` });
    }
  }
  return findings;
}

/**
 * Declared sequencing must be a real DAG over real lanes, not a bag of unordered pairs.
 * Reducing an edge to a sorted pair let a reverse edge — a two-node cycle — satisfy the
 * sequencing requirement it was supposed to break.
 */
export function checkDeclaredEdges(proposal, derivedEdges) {
  const findings = [];
  const lanes = new Set((proposal?.lanes ?? []).map((lane) => lane.lane));
  const cohortCount = (proposal?.checkpointCohorts ?? []).length;
  const derived = new Map(derivedEdges.map((edge) => [`${edge.from}\u0000${edge.to}`, edge]));
  const seen = new Set();
  const declared = proposal?.declaredEdges ?? [];

  for (const edge of declared) {
    const key = `${edge.from}\u0000${edge.to}`;
    if (!lanes.has(edge.from) || !lanes.has(edge.to)) {
      findings.push({ issue: 'edge names a lane that does not exist', detail: `${edge.from} -> ${edge.to}` });
      continue;
    }
    if (edge.from === edge.to) {
      findings.push({ issue: 'self edge', detail: edge.from });
    }
    if (seen.has(key)) {
      findings.push({ issue: 'duplicate declared edge', detail: `${edge.from} -> ${edge.to}` });
    }
    seen.add(key);
    if (edge.cohort != null && (!Number.isInteger(edge.cohort) || edge.cohort < 1 || edge.cohort > cohortCount)) {
      findings.push({ issue: 'edge names a cohort that does not exist', detail: String(edge.cohort) });
    }
    if (!edge.sequencing || String(edge.sequencing).trim().length === 0) {
      findings.push({ issue: 'edge declares no sequencing', detail: `${edge.from} -> ${edge.to}` });
    }
    const match = derived.get(key);
    if (!match) {
      findings.push({ issue: 'declared edge has no derived counterpart in that direction', detail: `${edge.from} -> ${edge.to}` });
    } else if (edge.condition && edge.condition !== match.condition) {
      findings.push({ issue: 'edge condition disagrees with the derived edge', detail: `declared ${edge.condition}, derived ${match.condition}` });
    }
  }

  // Cycle detection over the declared graph.
  const adjacency = new Map();
  for (const edge of declared) {
    if (!adjacency.has(edge.from)) adjacency.set(edge.from, []);
    adjacency.get(edge.from).push(edge.to);
  }
  const state = new Map();
  const stack = [];
  const visit = (node) => {
    if (state.get(node) === 'done') return;
    if (state.get(node) === 'open') {
      findings.push({ issue: 'declared edges contain a cycle', detail: [...stack, node].join(' -> ') });
      return;
    }
    state.set(node, 'open');
    stack.push(node);
    for (const next of adjacency.get(node) ?? []) visit(next);
    stack.pop();
    state.set(node, 'done');
  };
  for (const node of adjacency.keys()) visit(node);

  return findings;
}

/**
 * A shared authority must have exactly one owning lane. agent-orchestration.json marks the
 * integrator classes `singleton: true`, but the ownership analyzer never enforced it, so two
 * lanes of the same singleton class could split one authority between disjoint write sets and
 * pass every file-level check — no collision, no prospective overlap, full domain coverage.
 *
 * The classes are DERIVED from the contract rather than named here, so a future singleton
 * class binds automatically instead of silently escaping.
 */
export function checkSingletonCardinality(proposal, { contracts = loadProgramContracts() } = {}) {
  const findings = [];
  const singletonClasses = Object.entries(contracts.orchestration.laneTypes ?? {})
    .filter(([, definition]) => definition.singleton === true)
    .map(([name]) => name);

  for (const laneClass of singletonClasses) {
    const holders = (proposal?.lanes ?? []).filter((lane) => lane.laneClass === laneClass);
    if (holders.length > 1) {
      findings.push({
        laneClass,
        issue: 'singleton lane class is claimed by more than one lane',
        detail: holders.map((lane) => lane.lane).join(', '),
        why: 'a shared authority split across two lanes passes every file-level check while still being two owners',
      });
    }
  }
  return findings;
}
