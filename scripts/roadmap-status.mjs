#!/usr/bin/env node
// Copied from app-bithire@c12901962 scripts/roadmap-status.mjs (2026-07-06).
// Byte-identical to the source except: (1) this provenance header, and (2) the
// LANES constant, which is the one repo-specific line — this repo has a single
// `engine-modern` lane. All orchestration logic is unchanged.
// - Divergence (2026-07-06, owner request): `progress` command + progressLog — step-level mid-WO handoff trail (STATUS shows the last entry; show/delegate print the full trail). Upstream-later candidate for app-bithire.
// - Divergence (2026-07-07, owner approval): added the `craft` lane (LANES = ['engine-modern','craft']) — DS interaction/craft/brand-tooling WOs (WO-CRA-01..05) converted from the approved proposals inbox.
// - Divergence (2026-07-07, owner approval: full-program conversion): three new lanes (LANES = ['engine-modern','craft','gates','tokens','architecture']) — WO-GAT-01..04, WO-TOK-01..03, WO-ARC-01..05, and the craft extension WO-CRA-06..10 converted from the approved proposals inbox.
// - Divergence (2026-07-07, owner approval then EXTRACTION): the `showroom` lane (WO-SHW-01..05, the commercial Monochrome Signature relaunch + the shared `@rottay/design-system/commercial` kit) was added 2026-07-07 and then EXTRACTED the same day (owner isolation decision) into the standalone `roadmap-commercial/` program with its own machinery (scripts/roadmap-commercial-status.mjs, `pnpm roadmap:commercial`). LANES here reverts to ['engine-modern','craft','gates','tokens','architecture']; the showroom lane is no longer part of this graph.
/**
 * Roadmap work-order orchestrator.
 *
 * Single source of WO STATE is roadmap/registry.json; WO SPECS live in the
 * lane markdown files (roadmap/{security,completeness,ux,design-adoption}.md).
 * This CLI is the only sanctioned way to change a WO status, so the
 * dependency graph and the documented sequencing hazards are enforced
 * mechanically instead of by prose.
 *
 * Commands:
 *   status                     regenerate roadmap/STATUS.md and print a summary
 *   check                      validate registry <-> lane-file consistency (CI gate; exit 1 on drift)
 *   next                       list actionable WOs (todo with satisfied deps)
 *   show <WO-ID>               print the full WO spec block + current state
 *   delegate <WO-ID>           print the ready-to-paste delegation prompt + fences + state warnings
 *   trace <DS-IMP-ID>          show disposition + live authority WO state
 *   claim <WO-ID> [--by name]  mark in-progress (refused while dependencies are open)
 *   progress <WO-ID> --note "t" [--by name]  append a step-level progress entry (in-progress only)
 *   done <WO-ID> --evidence "<how the acceptance gate was proven>"
 *   reopen <WO-ID> [--note t]  back to todo with a handoff note
 *
 * mustLandWith semantics ("same certified window"): a dependency that is also
 * a mustLandWith partner counts as satisfied while in-progress, and `done`
 * requires every partner to be at least in-progress. This encodes the
 * SEC-01/SEC-05 hazard without deadlocking the pair.
 *
 * Mid-WO continuity: executors append a `progress` entry after every completed
 * step and when hitting a blocker. If an agent dies mid-WO, the successor runs
 * `show <WO-ID>` and resumes from the last logged step instead of restarting.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ROADMAP = path.join(ROOT, "roadmap");
const REGISTRY_PATH = path.join(ROADMAP, "registry.json");
const STATUS_PATH = path.join(ROADMAP, "STATUS.md");
const LANES = ["engine-modern", "craft", "gates", "tokens", "architecture", "skin-adoption"];
const STATUSES = ["todo", "in-progress", "done"];
const DS_IMPROVEMENTS_KEY = "ds-improvements";
const DS_IMPROVEMENTS_PREFIX = "DS-IMP";
const DS_IMPROVEMENTS_FIRST = 1;
const DS_IMPROVEMENTS_LAST = 128;
const DS_IMPROVEMENTS_DISPOSITIONS = new Set(["execute", "deferred", "absorbed", "routed", "rejected"]);
const DS_IMPROVEMENTS_PHASES = ["0", "1", "2A", "2B", "2C", "3", "4", "5", "6"];

const dsImprovementId = (number) => `${DS_IMPROVEMENTS_PREFIX}-${String(number).padStart(3, "0")}`;
const expectedDsImprovementIds = () => Array.from(
  { length: DS_IMPROVEMENTS_LAST - DS_IMPROVEMENTS_FIRST + 1 },
  (_, index) => dsImprovementId(DS_IMPROVEMENTS_FIRST + index),
);
const isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;
const isNonEmptyStringArray = (value) => Array.isArray(value)
  && value.length > 0
  && value.every(isNonEmptyString);
const hasOwn = (value, key) => Object.prototype.hasOwnProperty.call(value, key);
const isFullGitSha = (value) => typeof value === "string" && /^[0-9a-f]{40}$/i.test(value);
const isIsoDate = (value) => {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
};

function sourceReference(program) {
  if (isNonEmptyString(program?.source)) {
    return { path: program.source, revision: program.sourceRevision };
  }
  if (program?.source && typeof program.source === "object" && !Array.isArray(program.source)) {
    return {
      path: program.source.path,
      revision: program.source.revision ?? program.source.sourceRevision ?? program.sourceRevision,
    };
  }
  return { path: null, revision: program?.sourceRevision };
}

function canonicalIds(item) {
  if (Array.isArray(item?.canonicalIds)) return item.canonicalIds;
  if (Array.isArray(item?.canonical)) return item.canonical;
  if (isNonEmptyString(item?.canonical)) return [item.canonical];
  return [];
}

/**
 * Validate the DS improvements traceability program without creating a second
 * status store. Trace items point at work orders; only workOrders[].status is
 * authoritative.
 *
 * Bootstrap compatibility is intentional: the completed pre-program roadmap
 * has neither a DS improvements traceability block nor DS-IMP sourceIds. Once
 * either side is introduced, both sides become mandatory and this validation
 * fails closed on a partial activation.
 */
export function validateDsImprovementsTraceability(
  reg,
  { today = new Date().toISOString().slice(0, 10) } = {},
) {
  const errors = [];
  const workOrders = Array.isArray(reg?.workOrders) ? reg.workOrders : [];
  const workOrderMap = Object.fromEntries(workOrders.map((workOrder) => [workOrder.id, workOrder]));
  const dsWorkOrders = workOrders.filter((workOrder) =>
    (workOrder.sourceIds || []).some((id) => isNonEmptyString(id) && id.startsWith(`${DS_IMPROVEMENTS_PREFIX}-`))
  );
  const program = reg?.traceability?.[DS_IMPROVEMENTS_KEY];

  if (!program) {
    if (dsWorkOrders.length > 0) {
      errors.push(
        `traceability.${DS_IMPROVEMENTS_KEY} is missing while ${dsWorkOrders.length} work order(s) declare DS-IMP sourceIds`,
      );
    }
    return errors;
  }

  const source = sourceReference(program);
  if (!isNonEmptyString(source.path)) {
    errors.push(`traceability.${DS_IMPROVEMENTS_KEY}.source must be a non-empty path or { path, revision } object`);
  } else if (!fs.existsSync(path.resolve(ROOT, source.path))) {
    errors.push(`traceability.${DS_IMPROVEMENTS_KEY}.source does not exist from the repository root: ${source.path}`);
  }
  if (!isFullGitSha(source.revision)) {
    errors.push(`traceability.${DS_IMPROVEMENTS_KEY}.sourceRevision must be a full 40-character Git SHA`);
  }
  if (!isNonEmptyString(program.adjudication)) {
    errors.push(`traceability.${DS_IMPROVEMENTS_KEY}.adjudication must be a non-empty string`);
  } else if (!fs.existsSync(path.resolve(ROOT, program.adjudication))) {
    errors.push(`traceability.${DS_IMPROVEMENTS_KEY}.adjudication does not exist from the repository root: ${program.adjudication}`);
  }
  if (
    program.range?.prefix !== DS_IMPROVEMENTS_PREFIX
    || program.range?.first !== DS_IMPROVEMENTS_FIRST
    || program.range?.last !== DS_IMPROVEMENTS_LAST
  ) {
    errors.push(
      `traceability.${DS_IMPROVEMENTS_KEY}.range must be { prefix: "${DS_IMPROVEMENTS_PREFIX}", first: ${DS_IMPROVEMENTS_FIRST}, last: ${DS_IMPROVEMENTS_LAST} }`,
    );
  }

  const phaseControls = program.phaseControls;
  const phaseControlKeys = phaseControls && typeof phaseControls === "object" && !Array.isArray(phaseControls)
    ? Object.keys(phaseControls)
    : [];
  if (!phaseControls || typeof phaseControls !== "object" || Array.isArray(phaseControls)) {
    errors.push(`traceability.${DS_IMPROVEMENTS_KEY}.phaseControls must be an object`);
  }
  for (const phase of DS_IMPROVEMENTS_PHASES) {
    const controls = phaseControls?.[phase];
    if (!controls || typeof controls !== "object" || Array.isArray(controls)) {
      errors.push(`traceability.${DS_IMPROVEMENTS_KEY}.phaseControls.${phase} is required`);
      continue;
    }
    for (const field of ["decisionOwner", "rollback", "disable"]) {
      if (!isNonEmptyString(controls[field])) {
        errors.push(`traceability.${DS_IMPROVEMENTS_KEY}.phaseControls.${phase}.${field} must be non-empty`);
      }
    }
    if (!isIsoDate(controls.decisionDate)) {
      errors.push(`traceability.${DS_IMPROVEMENTS_KEY}.phaseControls.${phase}.decisionDate must be a valid YYYY-MM-DD date`);
    }
    for (const field of ["telemetry", "stopConditions"]) {
      if (!isNonEmptyStringArray(controls[field])) {
        errors.push(`traceability.${DS_IMPROVEMENTS_KEY}.phaseControls.${phase}.${field} must be a non-empty string array`);
      }
    }
  }
  for (const phase of phaseControlKeys) {
    if (!DS_IMPROVEMENTS_PHASES.includes(phase)) {
      errors.push(`traceability.${DS_IMPROVEMENTS_KEY}.phaseControls.${phase} is not a declared DS improvements phase`);
    }
  }

  const items = Array.isArray(program.items) ? program.items : [];
  if (!Array.isArray(program.items)) {
    errors.push(`traceability.${DS_IMPROVEMENTS_KEY}.items must be an array`);
  }

  const expectedIds = expectedDsImprovementIds();
  const expectedSet = new Set(expectedIds);
  const itemCounts = new Map();
  const firstItemById = new Map();
  const sourceBacklinks = new Map();

  for (const workOrder of workOrders) {
    const seenInWorkOrder = new Set();
    for (const sourceId of workOrder.sourceIds || []) {
      if (!isNonEmptyString(sourceId) || !sourceId.startsWith(`${DS_IMPROVEMENTS_PREFIX}-`)) continue;
      if (seenInWorkOrder.has(sourceId)) {
        errors.push(`${workOrder.id}: sourceIds contains duplicate ${sourceId}`);
        continue;
      }
      seenInWorkOrder.add(sourceId);
      const backlinks = sourceBacklinks.get(sourceId) || [];
      backlinks.push(workOrder.id);
      sourceBacklinks.set(sourceId, backlinks);
    }
  }

  for (const [sourceId, backlinks] of sourceBacklinks) {
    if (backlinks.length > 1) {
      errors.push(`${sourceId}: sourceId is repeated across work orders: ${backlinks.join(", ")}`);
    }
  }

  for (const item of items) {
    const id = item?.id;
    if (!isNonEmptyString(id)) {
      errors.push(`traceability.${DS_IMPROVEMENTS_KEY}.items contains an item without a valid id`);
      continue;
    }
    itemCounts.set(id, (itemCounts.get(id) || 0) + 1);
    if (!firstItemById.has(id)) firstItemById.set(id, item);
    if (!expectedSet.has(id)) {
      errors.push(`${id}: outside the required ${dsImprovementId(1)}..${dsImprovementId(128)} range`);
    }
    if (hasOwn(item, "status")) {
      errors.push(`${id}: trace items must never store status; status belongs only to workOrders[]`);
    }
  }

  for (const [id, count] of itemCounts) {
    if (count > 1) errors.push(`${id}: duplicate traceability item (${count} entries)`);
  }
  for (const id of expectedIds) {
    if (!itemCounts.has(id)) errors.push(`${id}: missing traceability item`);
  }

  for (const [id, item] of firstItemById) {
    const disposition = item.disposition;
    if (!DS_IMPROVEMENTS_DISPOSITIONS.has(disposition)) {
      errors.push(`${id}: invalid disposition "${disposition}"`);
      continue;
    }

    if (disposition === "execute") {
      if (!isNonEmptyString(item.authority) || Array.isArray(item.authority) || hasOwn(item, "authorities")) {
        errors.push(`${id}: execute requires exactly one authority WO id`);
      } else if (!workOrderMap[item.authority]) {
        errors.push(`${id}: authority ${item.authority} does not exist in workOrders[]`);
      } else if (
        !Array.isArray(workOrderMap[item.authority].programs)
        || !workOrderMap[item.authority].programs.includes(DS_IMPROVEMENTS_KEY)
      ) {
        errors.push(`${id}: authority ${item.authority} programs must include ${DS_IMPROVEMENTS_KEY}`);
      }
    }

    if (disposition === "execute") {
      const backlinks = sourceBacklinks.get(id) || [];
      if (backlinks.length !== 1) {
        errors.push(`${id}: execute requires exactly one work-order sourceId backlink (found ${backlinks.length})`);
      } else if (backlinks[0] !== item.authority) {
        errors.push(`${id}: execute backlink ${backlinks[0]} must match authority ${item.authority}`);
      }
      if (hasOwn(item, "external")) errors.push(`${id}: execute must not declare an external authority`);
      if (hasOwn(item, "decisionRef")) errors.push(`${id}: execute must not declare decisionRef`);
    }

    if (disposition === "deferred") {
      if (!isNonEmptyString(item.owner)) {
        errors.push(`${id}: deferred requires a non-empty owner`);
      }
      if (!isIsoDate(item.reviewBy)) {
        errors.push(`${id}: deferred reviewBy must be a valid YYYY-MM-DD date`);
      } else if (item.reviewBy < today) {
        errors.push(`${id}: deferred reviewBy ${item.reviewBy} is overdue as of ${today}`);
      }
      if (!isNonEmptyString(item.reason)) {
        errors.push(`${id}: deferred requires a non-empty reason`);
      }
      if (!DS_IMPROVEMENTS_PHASES.includes(item.targetPhase)) {
        errors.push(`${id}: deferred targetPhase must be one of ${DS_IMPROVEMENTS_PHASES.join(", ")}`);
      }
      if (hasOwn(item, "authority") || hasOwn(item, "authorities")) {
        errors.push(`${id}: deferred must not declare an authority`);
      }
      if (hasOwn(item, "external")) {
        errors.push(`${id}: deferred must not declare external routing`);
      }
    }

    if (disposition === "absorbed") {
      const ids = canonicalIds(item);
      if (ids.length === 0) {
        errors.push(`${id}: absorbed requires at least one canonical DS-IMP id`);
      }
      for (const canonicalId of ids) {
        if (!expectedSet.has(canonicalId)) {
          errors.push(`${id}: absorbed canonical id ${canonicalId} is outside the DS-IMP range`);
        } else if (!firstItemById.has(canonicalId)) {
          errors.push(`${id}: absorbed canonical id ${canonicalId} does not exist in traceability items`);
        } else if (canonicalId === id) {
          errors.push(`${id}: absorbed cannot name itself as a canonical id`);
        }
      }
      if (!isNonEmptyString(item.decisionRef)) {
        errors.push(`${id}: absorbed requires a non-empty decisionRef`);
      }
      if (hasOwn(item, "authority") || hasOwn(item, "authorities")) {
        errors.push(`${id}: absorbed is terminal and must not declare an authority`);
      }
      if (hasOwn(item, "external")) errors.push(`${id}: absorbed must not declare an external authority`);
    }

    if (disposition === "routed") {
      if (hasOwn(item, "authority") || hasOwn(item, "authorities")) {
        errors.push(`${id}: routed work must not declare a DS work-order authority`);
      }
      if (!isNonEmptyString(item.external?.owner) || !isNonEmptyString(item.external?.path)) {
        errors.push(`${id}: routed requires external.owner and external.path`);
      } else if (!fs.existsSync(path.resolve(ROOT, item.external.path))) {
        errors.push(`${id}: routed external.path does not exist from the repository root: ${item.external.path}`);
      }
      if (item.external && hasOwn(item.external, "status")) {
        errors.push(`${id}: routed external links must never copy external status`);
      }
    }

    if (disposition === "rejected") {
      if (!isNonEmptyString(item.decisionRef)) {
        errors.push(`${id}: rejected requires a non-empty decisionRef`);
      }
      if (hasOwn(item, "authority") || hasOwn(item, "authorities") || hasOwn(item, "external")) {
        errors.push(`${id}: rejected is terminal and must not declare an authority`);
      }
    }
  }

  const absorbedState = new Map();
  const absorbedCycles = new Set();
  const visitAbsorbed = (id, stack) => {
    absorbedState.set(id, 1);
    const item = firstItemById.get(id);
    for (const canonicalId of canonicalIds(item)) {
      if (canonicalId === id || firstItemById.get(canonicalId)?.disposition !== "absorbed") continue;
      if (absorbedState.get(canonicalId) === 1) {
        const cycleStart = stack.indexOf(canonicalId);
        const cycle = [...stack.slice(cycleStart), canonicalId].join(" -> ");
        if (!absorbedCycles.has(cycle)) {
          absorbedCycles.add(cycle);
          errors.push(`absorbed canonical cycle: ${cycle}`);
        }
      } else if (absorbedState.get(canonicalId) !== 2) {
        visitAbsorbed(canonicalId, [...stack, canonicalId]);
      }
    }
    absorbedState.set(id, 2);
  };
  for (const [id, item] of firstItemById) {
    if (item.disposition === "absorbed" && !absorbedState.has(id)) visitAbsorbed(id, [id]);
  }

  for (const workOrder of dsWorkOrders) {
    const dsSourceIds = (workOrder.sourceIds || []).filter((id) =>
      isNonEmptyString(id) && id.startsWith(`${DS_IMPROVEMENTS_PREFIX}-`)
    );
    const execution = workOrder.execution;
    const phase = workOrder.phase ?? execution?.phase;

    if (!isNonEmptyString(phase)) {
      errors.push(`${workOrder.id}: DS-IMP work orders require phase`);
    } else if (!hasOwn(phaseControls || {}, phase)) {
      errors.push(`${workOrder.id}: phase ${phase} is not declared in traceability.${DS_IMPROVEMENTS_KEY}.phaseControls`);
    }
    if (!execution || typeof execution !== "object" || Array.isArray(execution)) {
      errors.push(`${workOrder.id}: DS-IMP work orders require an execution controls object`);
    } else {
      if (!isNonEmptyString(execution.decisionOwner)) {
        errors.push(`${workOrder.id}: execution.decisionOwner must be non-empty`);
      }
      if (!isNonEmptyStringArray(execution.touchedRepos)) {
        errors.push(`${workOrder.id}: execution.touchedRepos must be a non-empty string array`);
      }
      if (!isNonEmptyString(execution.rollback)) {
        errors.push(`${workOrder.id}: execution.rollback must be non-empty`);
      }
      if (!isNonEmptyString(execution.disable)) {
        errors.push(`${workOrder.id}: execution.disable must be non-empty (use "not-applicable" explicitly)`);
      }
      if (!isNonEmptyStringArray(execution.telemetry)) {
        errors.push(`${workOrder.id}: execution.telemetry must be a non-empty string array`);
      }
      if (!isNonEmptyStringArray(execution.stopConditions)) {
        errors.push(`${workOrder.id}: execution.stopConditions must be a non-empty string array`);
      }
    }

    for (const sourceId of new Set(dsSourceIds)) {
      if (!expectedSet.has(sourceId)) {
        errors.push(`${workOrder.id}: sourceIds contains out-of-range ${sourceId}`);
        continue;
      }
      const item = firstItemById.get(sourceId);
      if (!item || item.disposition !== "execute" || item.authority !== workOrder.id) {
        errors.push(`${workOrder.id}: sourceIds ${sourceId} must resolve back to execute authority ${workOrder.id}`);
      }
    }
  }

  return errors;
}

/** Derive program progress from the unique execute-authority work orders. */
export function summarizeDsImprovements(reg) {
  const program = reg?.traceability?.[DS_IMPROVEMENTS_KEY];
  if (!program || !Array.isArray(program.items)) return null;

  const workOrderMap = byId(reg);
  const authorityIds = [...new Set(
    program.items
      .filter((item) => item?.disposition === "execute" && isNonEmptyString(item.authority))
      .map((item) => item.authority),
  )];
  const counts = { done: 0, "in-progress": 0, todo: 0, unknown: 0 };
  for (const authorityId of authorityIds) {
    const status = workOrderMap[authorityId]?.status;
    if (STATUSES.includes(status)) counts[status] += 1;
    else counts.unknown += 1;
  }
  const sourceCounts = { done: 0, "in-progress": 0, todo: 0, unknown: 0 };
  for (const item of program.items.filter((candidate) => candidate?.disposition === "execute")) {
    const status = workOrderMap[item.authority]?.status;
    if (STATUSES.includes(status)) sourceCounts[status] += 1;
    else sourceCounts.unknown += 1;
  }
  const dispositionCounts = Object.fromEntries(
    [...DS_IMPROVEMENTS_DISPOSITIONS].map((disposition) => [
      disposition,
      program.items.filter((item) => item?.disposition === disposition).length,
    ]),
  );
  return {
    total: authorityIds.length,
    executeSourceIds: dispositionCounts.execute,
    authorityIds,
    ...counts,
    sourceDone: sourceCounts.done,
    sourceInProgress: sourceCounts["in-progress"],
    sourceTodo: sourceCounts.todo,
    sourceUnknown: sourceCounts.unknown,
    deferred: dispositionCounts.deferred,
    absorbed: dispositionCounts.absorbed,
    routed: dispositionCounts.routed,
    rejected: dispositionCounts.rejected,
  };
}

const loadRegistry = () => JSON.parse(fs.readFileSync(REGISTRY_PATH, "utf8"));
const saveRegistry = (reg) => {
  reg.updated = new Date().toISOString().slice(0, 10);
  fs.writeFileSync(REGISTRY_PATH, JSON.stringify(reg, null, 1) + "\n");
};
const byId = (reg) => Object.fromEntries(reg.workOrders.map((w) => [w.id, w]));

function laneHeadings(lane) {
  const text = fs.readFileSync(path.join(ROADMAP, `${lane}.md`), "utf8");
  return [...text.matchAll(/^### (WO-[A-Z]+-\d+)\s+(.+)$/gm)].map((m) => ({ id: m[1], title: m[2].trim() }));
}

function woBlock(lane, id) {
  const text = fs.readFileSync(path.join(ROADMAP, `${lane}.md`), "utf8");
  const re = new RegExp(`^### ${id}[\\s\\S]*?(?=^### WO-|^## |$(?![\\s\\S]))`, "m");
  const m = text.match(re);
  return m ? m[0].trim() : null;
}

function depSatisfied(w, depId, map) {
  const dep = map[depId];
  if (!dep) return false;
  if (dep.status === "done") return true;
  return (w.mustLandWith || []).includes(depId) && dep.status === "in-progress";
}
const openDeps = (w, map) => (w.dependsOn || []).filter((d) => !depSatisfied(w, d, map));
const actionable = (reg, map) => reg.workOrders.filter((w) => w.status === "todo" && openDeps(w, map).length === 0);

function detectCycles(reg) {
  const map = byId(reg);
  const state = {};
  const cycles = [];
  const visit = (id, stack) => {
    if (state[id] === 2) return;
    if (state[id] === 1) { cycles.push([...stack, id].join(" -> ")); return; }
    state[id] = 1;
    for (const d of map[id]?.dependsOn || []) if (map[d]) visit(d, [...stack, id]);
    state[id] = 2;
  };
  for (const w of reg.workOrders) visit(w.id, []);
  return cycles;
}

function check() {
  const reg = loadRegistry();
  const map = byId(reg);
  const errors = [];
  const seen = new Set();
  for (const lane of LANES) {
    for (const h of laneHeadings(lane)) {
      seen.add(h.id);
      const w = map[h.id];
      if (!w) errors.push(`${lane}.md has ${h.id} but registry.json does not — add it via a registry entry`);
      else {
        if (w.lane !== lane) errors.push(`${h.id}: lane mismatch (registry=${w.lane}, file=${lane}.md)`);
        if (w.title !== h.title) errors.push(`${h.id}: title drift (registry="${w.title}" vs file="${h.title}")`);
      }
    }
  }
  for (const w of reg.workOrders) {
    if (!seen.has(w.id)) errors.push(`registry has ${w.id} but no heading in ${w.lane}.md`);
    if (!STATUSES.includes(w.status)) errors.push(`${w.id}: invalid status "${w.status}"`);
    for (const d of w.dependsOn || []) if (!map[d]) errors.push(`${w.id}: unknown dependency ${d}`);
    for (const p of w.mustLandWith || []) if (!map[p]) errors.push(`${w.id}: unknown mustLandWith ${p}`);
    if (w.status === "done" && !w.evidence) errors.push(`${w.id}: done without evidence — reopen or record evidence`);
    if (w.status === "done") for (const d of w.dependsOn || []) if (map[d].status !== "done") errors.push(`${w.id}: done but dependency ${d} is ${map[d].status}`);
  }
  errors.push(...validateDsImprovementsTraceability(reg));
  errors.push(...detectCycles(reg).map((c) => `dependency cycle: ${c}`));
  if (errors.length) {
    console.error(`roadmap:check FAILED (${errors.length}):`);
    for (const e of errors) console.error("  - " + e);
    process.exit(1);
  }
  console.log(`roadmap:check OK — ${reg.workOrders.length} WOs consistent across registry + ${LANES.length} lane files`);
}

function generateStatus() {
  const reg = loadRegistry();
  const traceabilityErrors = validateDsImprovementsTraceability(reg);
  if (traceabilityErrors.length) {
    console.error(`roadmap:status REFUSED — DS improvements traceability is invalid (${traceabilityErrors.length}):`);
    for (const error of traceabilityErrors) console.error("  - " + error);
    process.exit(1);
  }
  const map = byId(reg);
  const today = new Date().toISOString().slice(0, 10);
  const counts = (lane) => {
    const ws = reg.workOrders.filter((w) => w.lane === lane);
    const c = { done: 0, "in-progress": 0, todo: 0 };
    for (const w of ws) c[w.status]++;
    return { total: ws.length, ...c };
  };
  const overallDone = reg.workOrders.filter((w) => w.status === "done").length;
  const pct = Math.round((overallDone / reg.workOrders.length) * 100);
  const lines = [];
  lines.push("# Roadmap Status");
  lines.push("");
  lines.push(`> GENERATED by \`pnpm roadmap:status\` on ${today} — do not edit by hand. State lives in \`registry.json\`; specs live in the lane files. Handoff protocol: [README.md](./README.md).`);
  lines.push("");
  lines.push(`## Burn-down — ${overallDone}/${reg.workOrders.length} done (${pct}%)`);
  lines.push("");
  lines.push("| Lane | Done | In progress | Todo | Total |");
  lines.push("| --- | --- | --- | --- | --- |");
  for (const lane of LANES) {
    const c = counts(lane);
    lines.push(`| [${lane}](./${lane}.md) | ${c.done} | ${c["in-progress"]} | ${c.todo} | ${c.total} |`);
  }
  lines.push("");
  const dsImprovements = summarizeDsImprovements(reg);
  if (dsImprovements) {
    const dsPct = dsImprovements.executeSourceIds
      ? Math.round((dsImprovements.sourceDone / dsImprovements.executeSourceIds) * 100)
      : 0;
    lines.push(`## DS improvements burn-down — ${dsImprovements.sourceDone}/${dsImprovements.executeSourceIds} execute source IDs done (${dsPct}%)`);
    lines.push("");
    lines.push("> Derived live from the unique execute-authority work orders. Deferred items never count as done; absorbed, routed, and rejected items remain separate dispositions.");
    lines.push("");
    lines.push("| Source IDs done | Source IDs in progress | Source IDs todo | Execute authorities done/total | Deferred | Absorbed | Routed | Rejected |");
    lines.push("| --- | --- | --- | --- | --- | --- | --- | --- |");
    lines.push(`| ${dsImprovements.sourceDone} | ${dsImprovements.sourceInProgress} | ${dsImprovements.sourceTodo} | ${dsImprovements.done}/${dsImprovements.total} | ${dsImprovements.deferred} | ${dsImprovements.absorbed} | ${dsImprovements.routed} | ${dsImprovements.rejected} |`);
    lines.push("");
  }
  const inProg = reg.workOrders.filter((w) => w.status === "in-progress");
  lines.push("## In progress");
  lines.push("");
  if (!inProg.length) lines.push("(none)");
  else {
    lines.push("| WO | Title | Claimed by | Since | Last progress |");
    lines.push("| --- | --- | --- | --- | --- |");
    for (const w of inProg) {
      const log = w.progressLog || [];
      const last = log.length
        ? `${log[log.length - 1].at} — ${log[log.length - 1].note}`.replace(/\|/g, "/")
        : "(no entries — log via `progress`)";
      lines.push(`| ${w.id} | ${w.title} | ${w.claimedBy || "?"} | ${w.claimedAt || "?"} | ${last} |`);
    }
  }
  lines.push("");
  const nextUp = actionable(reg, map);
  lines.push("## Next up (todo, dependencies satisfied)");
  lines.push("");
  lines.push("| WO | Title | Size | Lane | Programs |");
  lines.push("| --- | --- | --- | --- | --- |");
  for (const w of nextUp) lines.push(`| ${w.id} | ${w.title} | ${w.size} | ${w.lane} | ${(w.programs || []).join(", ")} |`);
  lines.push("");
  const blocked = reg.workOrders.filter((w) => w.status === "todo" && openDeps(w, map).length > 0);
  lines.push("## Blocked (waiting on dependencies)");
  lines.push("");
  lines.push("| WO | Waiting on |");
  lines.push("| --- | --- |");
  for (const w of blocked) lines.push(`| ${w.id} | ${openDeps(w, map).join(", ")} |`);
  lines.push("");
  lines.push("## Sequencing hazards (mechanically enforced)");
  lines.push("");
  const pairs = new Set();
  for (const w of reg.workOrders) for (const p of w.mustLandWith || []) pairs.add([w.id, p].sort().join(" + "));
  for (const p of pairs) lines.push(`- ${p} must land in the same certified window (\`done\` on either requires the other >= in-progress).`);
  if (!pairs.size) lines.push("(none)");
  lines.push("");
  lines.push("## North-star metrics");
  lines.push("");
  lines.push("| Metric | Baseline | Target | How to re-measure | As of |");
  lines.push("| --- | --- | --- | --- | --- |");
  for (const m of reg.metrics || []) lines.push(`| ${m.name} | ${m.baseline} | ${m.target} | ${m.measure} | ${m.asOf} |`);
  lines.push("");
  const doneList = reg.workOrders.filter((w) => w.status === "done");
  lines.push("## Done ledger");
  lines.push("");
  if (!doneList.length) lines.push("(none yet)");
  else {
    lines.push("| WO | Done | Evidence |");
    lines.push("| --- | --- | --- |");
    for (const w of doneList) lines.push(`| ${w.id} | ${w.doneAt} | ${w.evidence} |`);
  }
  lines.push("");
  fs.writeFileSync(STATUS_PATH, lines.join("\n"));
  console.log(`STATUS.md regenerated — ${overallDone}/${reg.workOrders.length} done, ${inProg.length} in progress, ${nextUp.length} actionable`);
}

function requireWo(reg, id) {
  const w = byId(reg)[id];
  if (!w) { console.error(`Unknown WO id: ${id}`); process.exit(1); }
  return w;
}
const flag = (args, name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : null;
};

export function main(argv = process.argv.slice(2)) {
const [cmd, arg, ...rest] = argv;
const args = [arg, ...rest].filter(Boolean);

switch (cmd) {
  case "status": generateStatus(); break;
  case "check": check(); break;
  case "next": {
    const reg = loadRegistry();
    for (const w of actionable(reg, byId(reg))) console.log(`${w.id} [${w.size}] (${w.lane}) ${w.title}`);
    break;
  }
  case "show": case "delegate": {
    const reg = loadRegistry();
    const w = requireWo(reg, arg);
    const block = woBlock(w.lane, w.id);
    if (!block) { console.error(`Spec block for ${w.id} not found in ${w.lane}.md`); process.exit(1); }
    const map = byId(reg);
    const open = openDeps(w, map);
    if (cmd === "show") console.log(block);
    else {
      const dm = block.match(/\*\*Delegation prompt\*\*\s*[—-]\s*([\s\S]*?)(?=\n- \*\*|\n### |\n---|$)/);
      console.log(dm ? dm[1].trim() : block);
      console.log("\n--- Universal fences (roadmap/README.md): work on main; commit only when full cert is green; never git-restore directories; no emojis/AI attribution; update the matching docs-engineering product/ chapter CURRENT lines before `done`.");
    }
    console.log(`\n[state] status=${w.status}${w.claimedBy ? ` claimedBy=${w.claimedBy}` : ""}${open.length ? ` OPEN-DEPS=${open.join(",")}` : " deps-satisfied"}${(w.mustLandWith || []).length ? ` mustLandWith=${w.mustLandWith.join(",")}` : ""}`);
    for (const p of w.progressLog || []) console.log(`[progress] ${p.at} ${p.by}: ${p.note}`);
    if (w.status === "in-progress" && (w.progressLog || []).length) console.log("[handoff] resume from the last progress entry — do not redo completed steps");
    if (open.length) console.log(`[warn] not actionable yet — complete ${open.join(", ")} first`);
    break;
  }
  case "trace": {
    const reg = loadRegistry();
    const errors = validateDsImprovementsTraceability(reg);
    if (errors.length) {
      console.error(`REFUSED: DS improvements traceability is invalid (${errors.length}); run roadmap:check for the full list.`);
      process.exit(1);
    }
    const program = reg.traceability?.[DS_IMPROVEMENTS_KEY];
    if (!program) {
      console.error(`DS improvements traceability is not initialized in ${REGISTRY_PATH}`);
      process.exit(1);
    }
    const item = program.items.find((candidate) => candidate.id === arg);
    if (!item) {
      console.error(`Unknown DS improvement id: ${arg}`);
      process.exit(1);
    }

    console.log(`${item.id} disposition=${item.disposition}`);
    if (item.disposition === "execute") {
      const authority = byId(reg)[item.authority];
      console.log(`authority=${authority.id} status=${authority.status} lane=${authority.lane} title=${authority.title}`);
    } else if (item.disposition === "absorbed") {
      const ids = canonicalIds(item);
      if (ids.length) console.log(`canonicalIds=${ids.join(",")}`);
      console.log(`decisionRef=${item.decisionRef}`);
    } else if (item.disposition === "deferred") {
      console.log(`owner=${item.owner}`);
      console.log(`reviewBy=${item.reviewBy}`);
      console.log(`targetPhase=${item.targetPhase}`);
      console.log(`reason=${item.reason}`);
    } else if (item.disposition === "routed") {
      console.log(`externalOwner=${item.external.owner}`);
      console.log(`externalPath=${item.external.path}`);
    } else if (item.disposition === "rejected") {
      console.log(`decisionRef=${item.decisionRef}`);
    }
    const source = sourceReference(program);
    console.log(`source=${source.path}`);
    console.log(`sourceRevision=${source.revision}`);
    console.log(`adjudication=${program.adjudication}`);
    break;
  }
  case "claim": {
    const reg = loadRegistry();
    const w = requireWo(reg, arg);
    const open = openDeps(w, byId(reg));
    if (w.status === "done") { console.error(`${w.id} is done; use reopen first`); process.exit(1); }
    if (open.length) { console.error(`REFUSED: ${w.id} has open dependencies: ${open.join(", ")}`); process.exit(1); }
    w.status = "in-progress";
    w.claimedBy = flag(args, "--by") || process.env.USER || "agent";
    w.claimedAt = new Date().toISOString().slice(0, 10);
    saveRegistry(reg); generateStatus();
    console.log(`${w.id} claimed by ${w.claimedBy}. Spec: pnpm roadmap show ${w.id}`);
    break;
  }
  case "progress": {
    const reg = loadRegistry();
    const w = requireWo(reg, arg);
    const note = flag(args, "--note");
    if (w.status !== "in-progress") { console.error(`REFUSED: ${w.id} is ${w.status} — progress entries are only for in-progress WOs (claim first)`); process.exit(1); }
    if (!note) { console.error(`REFUSED: --note "<what landed / what is next / blockers>" is mandatory`); process.exit(1); }
    w.progressLog = w.progressLog || [];
    w.progressLog.push({ at: new Date().toISOString().slice(0, 16).replace("T", " "), by: flag(args, "--by") || w.claimedBy || process.env.USER || "agent", note });
    saveRegistry(reg); generateStatus();
    console.log(`${w.id} progress logged (entry ${w.progressLog.length}). Successors resume via: node scripts/roadmap-status.mjs show ${w.id}`);
    break;
  }
  case "done": {
    const reg = loadRegistry();
    const w = requireWo(reg, arg);
    const map = byId(reg);
    const evidence = flag(args, "--evidence");
    if (!evidence) { console.error("REFUSED: --evidence \"<how the acceptance gate was proven>\" is mandatory"); process.exit(1); }
    const openHard = (w.dependsOn || []).filter((d) => map[d].status !== "done" && !((w.mustLandWith || []).includes(d) && map[d].status === "in-progress"));
    if (openHard.length) { console.error(`REFUSED: dependencies not done: ${openHard.join(", ")}`); process.exit(1); }
    const partnersNotReady = (w.mustLandWith || []).filter((p) => !["in-progress", "done"].includes(map[p].status));
    if (partnersNotReady.length) { console.error(`REFUSED (sequencing hazard): ${partnersNotReady.join(", ")} must be at least in-progress in the same certified window`); process.exit(1); }
    w.status = "done";
    w.doneAt = new Date().toISOString().slice(0, 10);
    w.evidence = evidence;
    saveRegistry(reg); generateStatus();
    console.log(`${w.id} DONE.`);
    console.log("Reminders: (1) update the matching docs-engineering product/ chapter CURRENT lines; (2) pnpm docs:anchors && pnpm roadmap:check; (3) full cert before push.");
    break;
  }
  case "reopen": {
    const reg = loadRegistry();
    const w = requireWo(reg, arg);
    w.status = "todo"; w.claimedBy = null; w.claimedAt = null; w.doneAt = null; w.evidence = null;
    w.notes = flag(args, "--note") || w.notes;
    saveRegistry(reg); generateStatus();
    console.log(`${w.id} reopened.`);
    break;
  }
  default:
    console.log("Usage: roadmap-status.mjs <status|check|next|show WO-ID|delegate WO-ID|trace DS-IMP-ID|claim WO-ID [--by name]|progress WO-ID --note \"...\" [--by name]|done WO-ID --evidence \"...\"|reopen WO-ID [--note ...]>");
    process.exit(cmd ? 1 : 0);
}
}

const invokedDirectly = process.argv[1]
  && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) main();
