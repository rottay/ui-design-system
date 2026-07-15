#!/usr/bin/env node
// Derived from app-bithire@c12901962 scripts/roadmap-status.mjs (2026-07-06).
// This copy now intentionally diverges for the design-system DS-improvements
// program: canonical traceability, phase claim locks, non-completing support
// milestones, final-certification barriers, and local-time temporal guards are
// enforced here in addition to the repo-specific lane graph.
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
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
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
const DS_IMPROVEMENTS_CLAIM_STATES = new Set(["open", "locked"]);
const DS_IMPROVEMENTS_BOOTSTRAP_REGISTRY_WO = "WO-GAT-05";
const DS_IMPROVEMENTS_BOOTSTRAP_PHASE_WO = "WO-GAT-06";
const DS_IMPROVEMENTS_FINAL_CLAIM_WO = "WO-GAT-09";
const DS_IMPROVEMENTS_TENANT_THEME_ID = "DS-IMP-061";
const DS_IMPROVEMENTS_STATUS_AUTHORITY = "roadmap/registry.json";
const DS_IMPROVEMENTS_OWNER_OPENER = "owner";
const DS_IMPROVEMENTS_OWNER_GO_DECISION = "go";
const DS_IMPROVEMENTS_OWNER_PENDING_DECISION = "pending";
const DS_IMPROVEMENTS_NEGATIVE_GO_REASON = /\b(?:denied|revoked|rejected|declined|refused|veto(?:ed)?|withheld|withhold|fake|fabricated|non-?existent|denegad\w*|revocad\w*|rechazad\w*|vetad\w*|retirad\w*|not\s+(?:approved|authorized)|does\s+not\s+exist|doesn't\s+exist|no\s+(?:go|approval|authorization)|without\s+(?:approval|authorization)|sin\s+autorizaci[oó]n)\b/i;
const DS_IMPROVEMENTS_PHASE_INDEX = new Map(
  DS_IMPROVEMENTS_PHASES.map((phase, index) => [phase, index]),
);
// Adjudicated program-plan lock. Mutable status/evidence/review dates are
// deliberately excluded; trace mapping and mapped-WO topology changes require
// a reviewed code+registry update when the owner opens the next wave.
const DS_IMPROVEMENTS_PLAN_SHA256 = "a381034eb9253b71223199848c9e1a1dff5f6b0b39767f558c8c3e7f4c4e53cd";
const DS_IMPROVEMENTS_SOURCE_REVISION = "969205380fd24eb45947bf3748db5a6cacd798f8";
const DS_IMPROVEMENTS_DOC_ROOT = path.resolve(
  ROOT,
  "../docs-engineering/engineering/audits/ds-improvements",
);
const DS_IMPROVEMENTS_SOURCE_PATH = path.join(
  DS_IMPROVEMENTS_DOC_ROOT,
  "08-consolidated-findings-and-feature-backlog.md",
);
const DS_IMPROVEMENTS_ROADMAP_PATH = path.join(
  DS_IMPROVEMENTS_DOC_ROOT,
  "09-implementation-roadmap-and-gates.md",
);
const DS_IMPROVEMENTS_ADJUDICATION_PATH = path.join(
  DS_IMPROVEMENTS_DOC_ROOT,
  "13-claude-reaudit-adjudication.md",
);

const ROADMAP_TIME_ZONE = "America/New_York";
const localDateTimeParts = (now, timeZone) => Object.fromEntries(
  new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  })
    .formatToParts(now)
    .filter(({ type }) => type !== "literal")
    .map(({ type, value }) => [type, value]),
);

/**
 * Format an instant as the roadmap's local calendar date. The optional time
 * zone makes boundary behavior deterministic in tests while production uses
 * the fixed Rottay program calendar (America/New_York), including UTC CI.
 */
export function localDate(now = new Date(), { timeZone = ROADMAP_TIME_ZONE } = {}) {
  const { year, month, day } = localDateTimeParts(now, timeZone);
  return `${year}-${month}-${day}`;
}

/** Format an instant as the local, minute-precision progress timestamp. */
export function localDateTime(now = new Date(), { timeZone = ROADMAP_TIME_ZONE } = {}) {
  const { year, month, day, hour, minute } = localDateTimeParts(now, timeZone);
  return `${year}-${month}-${day} ${hour}:${minute}`;
}

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
const isDsImprovementsWorkOrder = (workOrder) => Array.isArray(workOrder?.programs)
  && workOrder.programs.includes(DS_IMPROVEMENTS_KEY);
const isFullGitSha = (value) => typeof value === "string" && /^[0-9a-f]{40}$/i.test(value);
const isIsoDate = (value) => {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
};
const isLocalDateTime = (value) => typeof value === "string"
  && /^\d{4}-\d{2}-\d{2} [0-2]\d:[0-5]\d$/.test(value)
  && isIsoDate(value.slice(0, 10))
  && Number(value.slice(11, 13)) <= 23;

const pinnedPathCache = new Map();
function pinnedPathContent(filePath, revision) {
  const absolutePath = path.resolve(ROOT, filePath);
  const cacheKey = `${absolutePath}\0${revision}`;
  if (pinnedPathCache.has(cacheKey)) return pinnedPathCache.get(cacheKey);

  const rootResult = spawnSync(
    "git",
    ["-C", path.dirname(absolutePath), "rev-parse", "--show-toplevel"],
    { encoding: "utf8" },
  );
  if (rootResult.status !== 0) {
    pinnedPathCache.set(cacheKey, null);
    return null;
  }
  const repositoryRoot = rootResult.stdout.trim();
  const repositoryPath = path.relative(repositoryRoot, absolutePath).split(path.sep).join("/");
  if (!repositoryPath || repositoryPath.startsWith("../")) {
    pinnedPathCache.set(cacheKey, null);
    return null;
  }
  const showResult = spawnSync(
    "git",
    ["-C", repositoryRoot, "show", `${revision}:${repositoryPath}`],
    { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 },
  );
  const content = showResult.status === 0 ? showResult.stdout : null;
  pinnedPathCache.set(cacheKey, content);
  return content;
}

const githubHeadingSlug = (heading) => heading
  .trim()
  .toLowerCase()
  .replace(/<[^>]*>/g, "")
  .replace(/[^\p{L}\p{N}\s-]/gu, "")
  .replace(/\s+/g, "-")
  .replace(/-+/g, "-")
  .replace(/^-|-$/g, "");

function markdownReferenceError(reference, { basePath, revision, label }) {
  if (!isNonEmptyString(reference)) return `${label} must be a non-empty Markdown reference`;
  const [referencePath, anchor] = reference.split("#", 2);
  if (!referencePath) return `${label} must include a Markdown path`;
  const absolutePath = path.resolve(path.dirname(path.resolve(ROOT, basePath)), referencePath);
  if (!fs.existsSync(absolutePath)) return `${label} path does not exist: ${referencePath}`;
  const content = pinnedPathContent(absolutePath, revision);
  if (content == null) return `${label} path is absent at pinned revision ${revision}: ${referencePath}`;
  if (anchor) {
    const anchors = new Set(
      [...content.matchAll(/^#{1,6}\s+(.+)$/gm)].map((match) => githubHeadingSlug(match[1])),
    );
    if (!anchors.has(anchor)) return `${label} anchor does not resolve at pinned revision ${revision}: #${anchor}`;
  }
  return null;
}

const parallelStateKey = (key) => {
  const normalized = String(key).toLowerCase().replace(/[^a-z0-9]/g, "");
  return /^(?:(?:shadow|live|current|program|trace|item|authority|workorder|completion|dsimprovements))?(?:status(?:es)?|states?)(?:(?:map|byid|board|ledger|store|snapshot))?$/.test(normalized);
};

const unknownObjectKeyErrors = (value, label, allowedKeys) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return [];
  return Object.keys(value)
    .filter((key) => !allowedKeys.has(key))
    .map((key) => `${label}.${key} is not part of the closed DS-improvements schema`);
};

const DS_IMPROVEMENTS_PROGRAM_KEYS = new Set([
  "source",
  "sourceRevision",
  "roadmap",
  "adjudication",
  "statusAuthority",
  "range",
  "phaseControls",
  "items",
]);
const DS_IMPROVEMENTS_PHASE_CONTROL_KEYS = new Set([
  "decisionOwner",
  "decisionDate",
  "claimState",
  "openedBy",
  "openedAt",
  "claimStateReason",
  "ownerGo",
  "rollback",
  "disable",
  "telemetry",
  "stopConditions",
]);
const DS_IMPROVEMENTS_OWNER_GO_KEYS = new Set(["decision", "by", "at", "evidence"]);
const DS_IMPROVEMENTS_ITEM_KEYS = {
  execute: new Set(["id", "disposition", "authority", "phase"]),
  deferred: new Set(["id", "disposition", "owner", "targetPhase", "reviewBy", "reason"]),
  absorbed: new Set(["id", "disposition", "canonicalIds", "decisionRef", "reason"]),
  routed: new Set(["id", "disposition", "external", "reason"]),
  rejected: new Set(["id", "disposition", "decisionRef", "reason"]),
};
const DS_IMPROVEMENTS_EXTERNAL_KEYS = new Set(["owner", "path"]);
const REGISTRY_ROOT_KEYS = new Set(["$schema", "updated", "rules", "metrics", "workOrders", "traceability"]);
const REGISTRY_RULE_KEYS = new Set(["done_requires", "claim_requires", "edit_via", "new_work", "wave_gate"]);
const REGISTRY_METRIC_KEYS = new Set(["name", "baseline", "target", "measure", "asOf"]);
const REGISTRY_TRACEABILITY_KEYS = new Set([DS_IMPROVEMENTS_KEY]);
const REGISTRY_WORK_ORDER_KEYS = new Set([
  "id",
  "title",
  "lane",
  "order",
  "size",
  "status",
  "dependsOn",
  "mustLandWith",
  "coordinatesWith",
  "programs",
  "sourceIds",
  "supportsSourceIds",
  "milestone",
  "phase",
  "notes",
  "progressLog",
  "claimedBy",
  "claimedAt",
  "doneAt",
  "evidence",
  "execution",
]);
const REGISTRY_EXECUTION_KEYS = new Set([
  "decisionOwner",
  "touchedRepos",
  "rollback",
  "disable",
  "telemetry",
  "stopConditions",
]);
const REGISTRY_MILESTONE_KEYS = new Set([
  "id",
  "scope",
  "completionEffect",
  "finalAuthority",
  "finalPhase",
]);
const REGISTRY_PROGRESS_KEYS = new Set(["at", "by", "note"]);

function parallelStateErrors(value, label, seen = new WeakSet()) {
  if (value == null || typeof value !== "object") return [];
  if (seen.has(value)) return [];
  seen.add(value);
  const errors = [];
  if (Array.isArray(value)) {
    value.forEach((entry, index) => {
      errors.push(...parallelStateErrors(entry, `${label}[${index}]`, seen));
    });
    return errors;
  }
  for (const [key, nested] of Object.entries(value)) {
    if (parallelStateKey(key)) {
      errors.push(`${label}.${key} is a forbidden parallel state/status store; workOrders[].status is the sole authority`);
    }
    errors.push(...parallelStateErrors(nested, `${label}.${key}`, seen));
  }
  return errors;
}

const sortedArrayOrValue = (value) => Array.isArray(value) ? [...value].sort() : value;
const dsSourceIds = (workOrder, field) => Array.isArray(workOrder?.[field])
  ? workOrder[field].filter((id) => isNonEmptyString(id) && id.startsWith(`${DS_IMPROVEMENTS_PREFIX}-`))
  : [];

export function dsImprovementsPlanFingerprint(reg) {
  const items = Array.isArray(reg?.traceability?.[DS_IMPROVEMENTS_KEY]?.items)
    ? reg.traceability[DS_IMPROVEMENTS_KEY].items
    : [];
  const normalizedItems = items
    .map((item) => {
      const base = { id: item?.id, disposition: item?.disposition };
      switch (item?.disposition) {
        case "execute":
          return { ...base, authority: item.authority, phase: item.phase };
        case "deferred":
          return { ...base, owner: item.owner, targetPhase: item.targetPhase, reason: item.reason };
        case "absorbed":
          return {
            ...base,
            canonicalIds: [...canonicalIds(item)].sort(),
            decisionRef: item.decisionRef,
            reason: item.reason,
          };
        case "routed":
          return {
            ...base,
            externalOwner: item.external?.owner,
            externalPath: item.external?.path,
            reason: item.reason,
          };
        case "rejected":
          return { ...base, decisionRef: item.decisionRef, reason: item.reason };
        default:
          return base;
      }
    })
    .sort((left, right) => String(left.id).localeCompare(String(right.id)));
  const normalizedWorkOrders = (Array.isArray(reg?.workOrders) ? reg.workOrders : [])
    .filter((workOrder) => dsSourceIds(workOrder, "sourceIds").length || dsSourceIds(workOrder, "supportsSourceIds").length)
    .map((workOrder) => ({
      id: workOrder.id,
      phase: workOrder.phase,
      dependsOn: sortedArrayOrValue(workOrder.dependsOn),
      mustLandWith: sortedArrayOrValue(workOrder.mustLandWith),
      sourceIds: dsSourceIds(workOrder, "sourceIds").sort(),
      supportsSourceIds: dsSourceIds(workOrder, "supportsSourceIds").sort(),
      milestone: workOrder.milestone ? {
        id: workOrder.milestone.id,
        scope: workOrder.milestone.scope,
        completionEffect: workOrder.milestone.completionEffect,
        finalAuthority: workOrder.milestone.finalAuthority,
        finalPhase: workOrder.milestone.finalPhase,
      } : null,
    }))
    .sort((left, right) => String(left.id).localeCompare(String(right.id)));
  const phaseControls = reg?.traceability?.[DS_IMPROVEMENTS_KEY]?.phaseControls || {};
  const normalizedPhaseControls = DS_IMPROVEMENTS_PHASES.map((phase) => {
    const controls = phaseControls[phase] || {};
    return {
      phase,
      decisionOwner: controls.decisionOwner,
      decisionDate: controls.decisionDate,
      claimState: controls.claimState,
      openedBy: controls.openedBy,
      openedAt: controls.openedAt,
      claimStateReason: controls.claimStateReason,
      ownerGo: controls.ownerGo ? {
        decision: controls.ownerGo.decision,
        by: controls.ownerGo.by,
        at: controls.ownerGo.at,
        evidence: controls.ownerGo.evidence,
      } : null,
      rollback: controls.rollback,
      disable: controls.disable,
      telemetry: sortedArrayOrValue(controls.telemetry),
      stopConditions: sortedArrayOrValue(controls.stopConditions),
    };
  });
  return createHash("sha256")
    .update(JSON.stringify({
      items: normalizedItems,
      workOrders: normalizedWorkOrders,
      phaseControls: normalizedPhaseControls,
    }))
    .digest("hex");
}

/**
 * Reject malformed or future-dated registry state. Null dates are valid for
 * todo/reopened work orders; status-specific required fields remain governed
 * by the existing roadmap rules.
 */
export function validateRegistryTemporalIntegrity(
  reg,
  { today = localDate() } = {},
) {
  const errors = [];
  const validateDate = (label, value) => {
    if (value == null) return;
    if (!isIsoDate(value)) {
      errors.push(`${label} must be a valid YYYY-MM-DD date`);
    } else if (value > today) {
      errors.push(`${label} ${value} is in the future as of local date ${today}`);
    }
  };

  if (!hasOwn(reg || {}, "updated")) errors.push("registry.updated is required");
  else validateDate("registry.updated", reg.updated);
  for (const workOrder of Array.isArray(reg?.workOrders) ? reg.workOrders : []) {
    if (hasOwn(workOrder, "claimedAt")) validateDate(`${workOrder.id}.claimedAt`, workOrder.claimedAt);
    if (hasOwn(workOrder, "doneAt")) validateDate(`${workOrder.id}.doneAt`, workOrder.doneAt);
    for (const [index, entry] of (Array.isArray(workOrder.progressLog) ? workOrder.progressLog : []).entries()) {
      if (!isLocalDateTime(entry?.at)) {
        errors.push(`${workOrder.id}.progressLog[${index}].at must be a valid YYYY-MM-DD HH:mm local timestamp`);
      } else if (entry.at.slice(0, 10) > today) {
        errors.push(`${workOrder.id}.progressLog[${index}].at ${entry.at} is in the future as of local date ${today}`);
      }
    }
  }

  return errors;
}

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
 * The DS-improvements program is activated in this repository and cannot be
 * removed to regain the old pre-program compatibility behavior.
 */
export function validateDsImprovementsTraceability(
  reg,
  { today = localDate(), enforcePinnedPlan = false } = {},
) {
  const errors = [];
  const workOrders = Array.isArray(reg?.workOrders) ? reg.workOrders : [];
  const workOrderMap = Object.fromEntries(workOrders.map((workOrder) => [workOrder.id, workOrder]));
  const dsWorkOrders = workOrders.filter(isDsImprovementsWorkOrder);
  const program = reg?.traceability?.[DS_IMPROVEMENTS_KEY];

  if (!program) {
    errors.push(`traceability.${DS_IMPROVEMENTS_KEY} is required; the activated program cannot be disabled`);
    return errors;
  }

  errors.push(...unknownObjectKeyErrors(
    program,
    `traceability.${DS_IMPROVEMENTS_KEY}`,
    DS_IMPROVEMENTS_PROGRAM_KEYS,
  ));
  errors.push(...parallelStateErrors(program, `traceability.${DS_IMPROVEMENTS_KEY}`));
  for (const key of Object.keys(reg || {})) {
    if (parallelStateKey(key) || ["statusAuthority", "claimState", "claimStateReason"].includes(key)) {
      errors.push(`${key} is a forbidden root-level parallel DS state/status container`);
    }
  }
  for (const key of Object.keys(reg?.traceability || {})) {
    if (key !== DS_IMPROVEMENTS_KEY && parallelStateKey(key)) {
      errors.push(`traceability.${key} is a forbidden parallel DS state/status container`);
    }
  }

  const source = sourceReference(program);
  if (!isNonEmptyString(source.path)) {
    errors.push(`traceability.${DS_IMPROVEMENTS_KEY}.source must be a non-empty path or { path, revision } object`);
  } else if (!fs.existsSync(path.resolve(ROOT, source.path))) {
    errors.push(`traceability.${DS_IMPROVEMENTS_KEY}.source does not exist from the repository root: ${source.path}`);
  } else if (path.resolve(ROOT, source.path) !== DS_IMPROVEMENTS_SOURCE_PATH) {
    errors.push(`traceability.${DS_IMPROVEMENTS_KEY}.source must resolve to ${DS_IMPROVEMENTS_SOURCE_PATH}`);
  }
  if (!isFullGitSha(source.revision)) {
    errors.push(`traceability.${DS_IMPROVEMENTS_KEY}.sourceRevision must be a full 40-character Git SHA`);
  } else if (source.revision !== DS_IMPROVEMENTS_SOURCE_REVISION) {
    errors.push(`traceability.${DS_IMPROVEMENTS_KEY}.sourceRevision must remain pinned to ${DS_IMPROVEMENTS_SOURCE_REVISION}`);
  } else if (isNonEmptyString(source.path) && pinnedPathContent(source.path, source.revision) == null) {
    errors.push(`traceability.${DS_IMPROVEMENTS_KEY}.source is absent at pinned revision ${source.revision}`);
  }
  if (!isNonEmptyString(program.roadmap)) {
    errors.push(`traceability.${DS_IMPROVEMENTS_KEY}.roadmap must be a non-empty path`);
  } else if (!fs.existsSync(path.resolve(ROOT, program.roadmap))) {
    errors.push(`traceability.${DS_IMPROVEMENTS_KEY}.roadmap does not exist from the repository root: ${program.roadmap}`);
  } else if (path.resolve(ROOT, program.roadmap) !== DS_IMPROVEMENTS_ROADMAP_PATH) {
    errors.push(`traceability.${DS_IMPROVEMENTS_KEY}.roadmap must resolve to ${DS_IMPROVEMENTS_ROADMAP_PATH}`);
  } else if (isFullGitSha(source.revision) && pinnedPathContent(program.roadmap, source.revision) == null) {
    errors.push(`traceability.${DS_IMPROVEMENTS_KEY}.roadmap is absent at pinned revision ${source.revision}`);
  }
  if (!isNonEmptyString(program.adjudication)) {
    errors.push(`traceability.${DS_IMPROVEMENTS_KEY}.adjudication must be a non-empty string`);
  } else if (!fs.existsSync(path.resolve(ROOT, program.adjudication))) {
    errors.push(`traceability.${DS_IMPROVEMENTS_KEY}.adjudication does not exist from the repository root: ${program.adjudication}`);
  } else if (path.resolve(ROOT, program.adjudication) !== DS_IMPROVEMENTS_ADJUDICATION_PATH) {
    errors.push(`traceability.${DS_IMPROVEMENTS_KEY}.adjudication must resolve to ${DS_IMPROVEMENTS_ADJUDICATION_PATH}`);
  } else if (isFullGitSha(source.revision) && pinnedPathContent(program.adjudication, source.revision) == null) {
    errors.push(`traceability.${DS_IMPROVEMENTS_KEY}.adjudication is absent at pinned revision ${source.revision}`);
  }
  if (program.statusAuthority !== DS_IMPROVEMENTS_STATUS_AUTHORITY) {
    errors.push(
      `traceability.${DS_IMPROVEMENTS_KEY}.statusAuthority must be ${DS_IMPROVEMENTS_STATUS_AUTHORITY}`,
    );
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
    errors.push(...unknownObjectKeyErrors(
      controls,
      `traceability.${DS_IMPROVEMENTS_KEY}.phaseControls.${phase}`,
      DS_IMPROVEMENTS_PHASE_CONTROL_KEYS,
    ));
    for (const field of ["decisionOwner", "rollback", "disable"]) {
      if (!isNonEmptyString(controls[field])) {
        errors.push(`traceability.${DS_IMPROVEMENTS_KEY}.phaseControls.${phase}.${field} must be non-empty`);
      }
    }
    if (!isIsoDate(controls.decisionDate)) {
      errors.push(`traceability.${DS_IMPROVEMENTS_KEY}.phaseControls.${phase}.decisionDate must be a valid YYYY-MM-DD date`);
    } else if (controls.decisionDate > today) {
      errors.push(`traceability.${DS_IMPROVEMENTS_KEY}.phaseControls.${phase}.decisionDate ${controls.decisionDate} is in the future as of local date ${today}`);
    }
    if (!DS_IMPROVEMENTS_CLAIM_STATES.has(controls.claimState)) {
      errors.push(`traceability.${DS_IMPROVEMENTS_KEY}.phaseControls.${phase}.claimState must be open or locked`);
    }
    if (!isNonEmptyString(controls.claimStateReason)) {
      errors.push(`traceability.${DS_IMPROVEMENTS_KEY}.phaseControls.${phase}.claimStateReason must be non-empty`);
    }
    if (controls.claimState === "open") {
      if (controls.openedBy !== DS_IMPROVEMENTS_OWNER_OPENER) {
        errors.push(`traceability.${DS_IMPROVEMENTS_KEY}.phaseControls.${phase}.openedBy must be "${DS_IMPROVEMENTS_OWNER_OPENER}" while claimState is open`);
      }
      if (!isIsoDate(controls.openedAt)) {
        errors.push(`traceability.${DS_IMPROVEMENTS_KEY}.phaseControls.${phase}.openedAt must be a valid YYYY-MM-DD date while claimState is open`);
      } else {
        if (controls.openedAt > today) {
          errors.push(`traceability.${DS_IMPROVEMENTS_KEY}.phaseControls.${phase}.openedAt ${controls.openedAt} is in the future as of local date ${today}`);
        }
        if (isIsoDate(controls.decisionDate) && controls.openedAt < controls.decisionDate) {
          errors.push(`traceability.${DS_IMPROVEMENTS_KEY}.phaseControls.${phase}.openedAt cannot precede decisionDate`);
        }
      }
      const ownerGo = controls.ownerGo;
      if (!ownerGo || typeof ownerGo !== "object" || Array.isArray(ownerGo)) {
        errors.push(`traceability.${DS_IMPROVEMENTS_KEY}.phaseControls.${phase}.ownerGo must be a structured approval while claimState is open`);
      } else {
        errors.push(...unknownObjectKeyErrors(
          ownerGo,
          `traceability.${DS_IMPROVEMENTS_KEY}.phaseControls.${phase}.ownerGo`,
          DS_IMPROVEMENTS_OWNER_GO_KEYS,
        ));
        if (ownerGo.decision !== DS_IMPROVEMENTS_OWNER_GO_DECISION) {
          errors.push(`traceability.${DS_IMPROVEMENTS_KEY}.phaseControls.${phase}.ownerGo.decision must be "${DS_IMPROVEMENTS_OWNER_GO_DECISION}"`);
        }
        if (ownerGo.by !== DS_IMPROVEMENTS_OWNER_OPENER) {
          errors.push(`traceability.${DS_IMPROVEMENTS_KEY}.phaseControls.${phase}.ownerGo.by must be "${DS_IMPROVEMENTS_OWNER_OPENER}"`);
        }
        if (!isIsoDate(ownerGo.at)) {
          errors.push(`traceability.${DS_IMPROVEMENTS_KEY}.phaseControls.${phase}.ownerGo.at must be a valid YYYY-MM-DD date`);
        } else {
          if (ownerGo.at > today) {
            errors.push(`traceability.${DS_IMPROVEMENTS_KEY}.phaseControls.${phase}.ownerGo.at ${ownerGo.at} is in the future as of local date ${today}`);
          }
          if (isIsoDate(controls.openedAt) && ownerGo.at !== controls.openedAt) {
            errors.push(`traceability.${DS_IMPROVEMENTS_KEY}.phaseControls.${phase}.ownerGo.at must equal openedAt`);
          }
        }
        if (!isNonEmptyString(ownerGo.evidence)) {
          errors.push(`traceability.${DS_IMPROVEMENTS_KEY}.phaseControls.${phase}.ownerGo.evidence must be non-empty`);
        }
      }
      if (DS_IMPROVEMENTS_NEGATIVE_GO_REASON.test(
        `${controls.claimStateReason || ""} ${ownerGo?.evidence || ""}`,
      )) {
        errors.push(`traceability.${DS_IMPROVEMENTS_KEY}.phaseControls.${phase}.claimStateReason records a denied/revoked owner decision`);
      }
    } else if (controls.claimState === "locked") {
      if (controls.openedBy !== null) {
        errors.push(`traceability.${DS_IMPROVEMENTS_KEY}.phaseControls.${phase}.openedBy must be null while claimState is locked`);
      }
      if (controls.openedAt !== null) {
        errors.push(`traceability.${DS_IMPROVEMENTS_KEY}.phaseControls.${phase}.openedAt must be null while claimState is locked`);
      }
      const ownerGo = controls.ownerGo;
      if (!ownerGo || typeof ownerGo !== "object" || Array.isArray(ownerGo)) {
        errors.push(`traceability.${DS_IMPROVEMENTS_KEY}.phaseControls.${phase}.ownerGo must be a structured pending decision while claimState is locked`);
      } else {
        errors.push(...unknownObjectKeyErrors(
          ownerGo,
          `traceability.${DS_IMPROVEMENTS_KEY}.phaseControls.${phase}.ownerGo`,
          DS_IMPROVEMENTS_OWNER_GO_KEYS,
        ));
        if (ownerGo.decision !== DS_IMPROVEMENTS_OWNER_PENDING_DECISION) {
          errors.push(`traceability.${DS_IMPROVEMENTS_KEY}.phaseControls.${phase}.ownerGo.decision must be "${DS_IMPROVEMENTS_OWNER_PENDING_DECISION}" while claimState is locked`);
        }
        for (const field of ["by", "at", "evidence"]) {
          if (ownerGo[field] !== null) {
            errors.push(`traceability.${DS_IMPROVEMENTS_KEY}.phaseControls.${phase}.ownerGo.${field} must be null while claimState is locked`);
          }
        }
      }
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
  if (enforcePinnedPlan && DS_IMPROVEMENTS_PLAN_SHA256 !== "__CALCULATE_AFTER_NORMALIZER__") {
    const actualFingerprint = dsImprovementsPlanFingerprint(reg);
    if (actualFingerprint !== DS_IMPROVEMENTS_PLAN_SHA256) {
      errors.push(
        `traceability.${DS_IMPROVEMENTS_KEY} adjudicated plan fingerprint changed: ${actualFingerprint} != ${DS_IMPROVEMENTS_PLAN_SHA256}; require an owner-approved wave mapping update`,
      );
    }
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
    errors.push(...unknownObjectKeyErrors(
      item,
      `${id}`,
      DS_IMPROVEMENTS_ITEM_KEYS[disposition],
    ));

    if (disposition === "execute") {
      if (!DS_IMPROVEMENTS_PHASES.includes(item.phase)) {
        errors.push(`${id}: execute phase must be one of ${DS_IMPROVEMENTS_PHASES.join(", ")}`);
      }
      if (!isNonEmptyString(item.authority) || Array.isArray(item.authority) || hasOwn(item, "authorities")) {
        errors.push(`${id}: execute requires exactly one authority WO id`);
      } else if (!workOrderMap[item.authority]) {
        errors.push(`${id}: authority ${item.authority} does not exist in workOrders[]`);
      } else if (
        !Array.isArray(workOrderMap[item.authority].programs)
        || !workOrderMap[item.authority].programs.includes(DS_IMPROVEMENTS_KEY)
      ) {
        errors.push(`${id}: authority ${item.authority} programs must include ${DS_IMPROVEMENTS_KEY}`);
      } else if (workOrderMap[item.authority].phase !== item.phase) {
        errors.push(`${id}: execute phase ${item.phase} must match authority ${item.authority} phase ${workOrderMap[item.authority].phase}`);
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

    if (id === DS_IMPROVEMENTS_TENANT_THEME_ID) {
      const phase = disposition === "deferred" ? item.targetPhase : item.phase;
      if (!["deferred", "execute"].includes(disposition) || phase !== "1") {
        errors.push(`${DS_IMPROVEMENTS_TENANT_THEME_ID}: TenantThemeConfig runtime authority must remain in Phase 1`);
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
      } else if (isFullGitSha(source.revision) && isNonEmptyString(program.adjudication)) {
        const referenceError = markdownReferenceError(item.decisionRef, {
          basePath: program.adjudication,
          revision: source.revision,
          label: `${id}.decisionRef`,
        });
        if (referenceError) errors.push(referenceError);
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
      errors.push(...unknownObjectKeyErrors(
        item.external,
        `${id}.external`,
        DS_IMPROVEMENTS_EXTERNAL_KEYS,
      ));
      if (item.external && hasOwn(item.external, "status")) {
        errors.push(`${id}: routed external links must never copy external status`);
      }
    }

    if (disposition === "rejected") {
      if (!isNonEmptyString(item.decisionRef)) {
        errors.push(`${id}: rejected requires a non-empty decisionRef`);
      } else if (isFullGitSha(source.revision) && isNonEmptyString(program.adjudication)) {
        const referenceError = markdownReferenceError(item.decisionRef, {
          basePath: program.adjudication,
          revision: source.revision,
          label: `${id}.decisionRef`,
        });
        if (referenceError) errors.push(referenceError);
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

  for (const workOrder of workOrders.filter((candidate) => !isDsImprovementsWorkOrder(candidate))) {
    const leakedIds = [...(workOrder.sourceIds || []), ...(workOrder.supportsSourceIds || [])]
      .filter((id) => isNonEmptyString(id) && id.startsWith(`${DS_IMPROVEMENTS_PREFIX}-`));
    if (leakedIds.length) {
      errors.push(`${workOrder.id}: DS-IMP source/support ids require programs to include ${DS_IMPROVEMENTS_KEY}`);
    }
  }

  const executionControlOwners = {
    rollback: new Map(),
    disable: new Map(),
  };
  for (const workOrder of dsWorkOrders) {
    const dsSourceIds = (workOrder.sourceIds || []).filter((id) =>
      isNonEmptyString(id) && id.startsWith(`${DS_IMPROVEMENTS_PREFIX}-`)
    );
    const hasSupports = hasOwn(workOrder, "supportsSourceIds");
    const supportIds = Array.isArray(workOrder.supportsSourceIds)
      ? workOrder.supportsSourceIds.filter(isNonEmptyString)
      : [];
    const execution = workOrder.execution;
    const phase = workOrder.phase ?? execution?.phase;

    if (workOrder.status === "todo") {
      for (const field of ["claimedBy", "claimedAt", "doneAt", "evidence"]) {
        if (workOrder[field] != null) errors.push(`${workOrder.id}: todo requires ${field}=null`);
      }
    } else if (workOrder.status === "in-progress") {
      if (!isNonEmptyString(workOrder.claimedBy)) errors.push(`${workOrder.id}: in-progress requires claimedBy`);
      if (!isIsoDate(workOrder.claimedAt)) errors.push(`${workOrder.id}: in-progress requires a valid claimedAt`);
      if (workOrder.doneAt != null) errors.push(`${workOrder.id}: in-progress requires doneAt=null`);
      if (workOrder.evidence != null) errors.push(`${workOrder.id}: in-progress requires evidence=null`);
    } else if (workOrder.status === "done") {
      if (!isNonEmptyString(workOrder.claimedBy)) errors.push(`${workOrder.id}: done requires claimedBy`);
      if (!isIsoDate(workOrder.claimedAt)) errors.push(`${workOrder.id}: done requires a valid claimedAt`);
      if (!isIsoDate(workOrder.doneAt)) errors.push(`${workOrder.id}: done requires a valid doneAt`);
      if (!isNonEmptyString(workOrder.evidence)) errors.push(`${workOrder.id}: done requires non-empty evidence`);
    }

    if (!dsSourceIds.length && !supportIds.length) {
      errors.push(`${workOrder.id}: ${DS_IMPROVEMENTS_KEY} work orders require sourceIds or supportsSourceIds`);
    }
    if (hasSupports && !isNonEmptyStringArray(workOrder.supportsSourceIds)) {
      errors.push(`${workOrder.id}: supportsSourceIds must be a non-empty string array when declared`);
    }
    if (new Set(supportIds).size !== supportIds.length) {
      errors.push(`${workOrder.id}: supportsSourceIds contains duplicate ids`);
    }

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
      } else {
        const key = execution.rollback.trim();
        executionControlOwners.rollback.set(key, [
          ...(executionControlOwners.rollback.get(key) || []),
          workOrder.id,
        ]);
      }
      if (!isNonEmptyString(execution.disable)) {
        errors.push(`${workOrder.id}: execution.disable must be non-empty (use "not-applicable" explicitly)`);
      } else {
        const key = execution.disable.trim();
        executionControlOwners.disable.set(key, [
          ...(executionControlOwners.disable.get(key) || []),
          workOrder.id,
        ]);
      }
      if (!isNonEmptyStringArray(execution.telemetry)) {
        errors.push(`${workOrder.id}: execution.telemetry must be a non-empty string array`);
      }
      if (!isNonEmptyStringArray(execution.stopConditions)) {
        errors.push(`${workOrder.id}: execution.stopConditions must be a non-empty string array`);
      }
    }

    const dependencies = Array.isArray(workOrder.dependsOn) ? workOrder.dependsOn : [];
    if (
      workOrder.id !== DS_IMPROVEMENTS_BOOTSTRAP_REGISTRY_WO
      && !dependencies.includes(DS_IMPROVEMENTS_BOOTSTRAP_REGISTRY_WO)
    ) {
      errors.push(`${workOrder.id}: ${DS_IMPROVEMENTS_KEY} bootstrap requires dependsOn ${DS_IMPROVEMENTS_BOOTSTRAP_REGISTRY_WO}`);
    }
    if (
      ![DS_IMPROVEMENTS_BOOTSTRAP_REGISTRY_WO, DS_IMPROVEMENTS_BOOTSTRAP_PHASE_WO].includes(workOrder.id)
      && !dependencies.includes(DS_IMPROVEMENTS_BOOTSTRAP_PHASE_WO)
    ) {
      errors.push(`${workOrder.id}: ${DS_IMPROVEMENTS_KEY} bootstrap requires dependsOn ${DS_IMPROVEMENTS_BOOTSTRAP_PHASE_WO}`);
    }
    for (const dependencyId of dependencies) {
      const dependency = workOrderMap[dependencyId];
      if (!isDsImprovementsWorkOrder(dependency)) continue;
      const dependencyPhase = dependency.phase ?? dependency.execution?.phase;
      if (
        DS_IMPROVEMENTS_PHASE_INDEX.has(phase)
        && DS_IMPROVEMENTS_PHASE_INDEX.has(dependencyPhase)
        && DS_IMPROVEMENTS_PHASE_INDEX.get(dependencyPhase) > DS_IMPROVEMENTS_PHASE_INDEX.get(phase)
      ) {
        errors.push(`${workOrder.id}: phase ${phase} cannot depend on later-phase ${dependencyId} (${dependencyPhase})`);
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

    if (supportIds.length) {
      const milestone = workOrder.milestone;
      if (!milestone || typeof milestone !== "object" || Array.isArray(milestone)) {
        errors.push(`${workOrder.id}: supportsSourceIds require a milestone object`);
      } else {
        if (!isNonEmptyString(milestone.id)) {
          errors.push(`${workOrder.id}: milestone.id must be non-empty`);
        }
        if (!isNonEmptyString(milestone.scope)) {
          errors.push(`${workOrder.id}: milestone.scope must be non-empty`);
        }
        if (milestone.completionEffect !== "none") {
          errors.push(`${workOrder.id}: milestone.completionEffect must be "none"`);
        }
        if (!isNonEmptyString(milestone.finalAuthority)) {
          errors.push(`${workOrder.id}: milestone.finalAuthority must be a work-order id`);
        }
        if (!DS_IMPROVEMENTS_PHASES.includes(milestone.finalPhase)) {
          errors.push(`${workOrder.id}: milestone.finalPhase must be one of ${DS_IMPROVEMENTS_PHASES.join(", ")}`);
        }

        const finalAuthority = workOrderMap[milestone.finalAuthority];
        if (milestone.finalAuthority === workOrder.id) {
          errors.push(`${workOrder.id}: a support milestone cannot be its own finalAuthority`);
        } else if (!finalAuthority) {
          errors.push(`${workOrder.id}: milestone.finalAuthority ${milestone.finalAuthority} does not exist`);
        } else {
          if (!isDsImprovementsWorkOrder(finalAuthority)) {
            errors.push(`${workOrder.id}: milestone.finalAuthority ${milestone.finalAuthority} must include ${DS_IMPROVEMENTS_KEY}`);
          }
          if (finalAuthority.phase !== milestone.finalPhase) {
            errors.push(`${workOrder.id}: milestone.finalPhase ${milestone.finalPhase} must match finalAuthority ${milestone.finalAuthority} phase ${finalAuthority.phase}`);
          }
        }

        for (const supportId of new Set(supportIds)) {
          if (!expectedSet.has(supportId)) {
            errors.push(`${workOrder.id}: supportsSourceIds contains out-of-range ${supportId}`);
            continue;
          }
          if (dsSourceIds.includes(supportId)) {
            errors.push(`${workOrder.id}: ${supportId} cannot be both sourceIds authority work and a non-completing support milestone`);
          }
          const item = firstItemById.get(supportId);
          if (!item || item.disposition !== "execute") {
            errors.push(`${workOrder.id}: supportsSourceIds ${supportId} must resolve to an execute trace item`);
          } else {
            if (item.authority !== milestone.finalAuthority) {
              errors.push(`${workOrder.id}: supportsSourceIds ${supportId} finalAuthority ${milestone.finalAuthority} must match trace authority ${item.authority}`);
            }
            if (item.phase !== milestone.finalPhase) {
              errors.push(`${workOrder.id}: supportsSourceIds ${supportId} finalPhase ${milestone.finalPhase} must match trace phase ${item.phase}`);
            }
          }
        }
      }
    } else if (hasOwn(workOrder, "milestone")) {
      errors.push(`${workOrder.id}: milestone is only valid with non-empty supportsSourceIds`);
    }
  }

  const openPhases = DS_IMPROVEMENTS_PHASES.filter(
    (phase) => phaseControls?.[phase]?.claimState === "open",
  );
  if (openPhases.length > 1) {
    errors.push(`traceability.${DS_IMPROVEMENTS_KEY}.phaseControls may open at most one phase (open: ${openPhases.join(", ")})`);
  }
  if (openPhases.length === 1) {
    const openPhase = openPhases[0];
    const openIndex = DS_IMPROVEMENTS_PHASE_INDEX.get(openPhase);
    const priorOpenControls = DS_IMPROVEMENTS_PHASES
      .slice(0, openIndex)
      .filter((phase) => phaseControls?.[phase]?.claimState !== "locked");
    if (priorOpenControls.length) {
      errors.push(`phase ${openPhase} cannot open until prior phases are locked: ${priorOpenControls.join(", ")}`);
    }

    const incompletePriorAuthorities = [...new Set(
      items
        .filter((item) => item?.disposition === "execute")
        .filter((item) => DS_IMPROVEMENTS_PHASE_INDEX.get(item.phase) < openIndex)
        .map((item) => item.authority),
    )].filter((authority) => workOrderMap[authority]?.status !== "done");
    if (incompletePriorAuthorities.length) {
      errors.push(`phase ${openPhase} cannot open before prior execute authorities are done: ${incompletePriorAuthorities.join(", ")}`);
    }

    const unresolvedThroughOpenPhase = items
      .filter((item) => item?.disposition === "deferred")
      .filter((item) => DS_IMPROVEMENTS_PHASE_INDEX.get(item.targetPhase) <= openIndex)
      .map((item) => item.id);
    if (unresolvedThroughOpenPhase.length) {
      errors.push(`phase ${openPhase} cannot open with deferred items targeted through that phase: ${unresolvedThroughOpenPhase.join(", ")}`);
    }
  }

  for (const field of ["rollback", "disable"]) {
    for (const owners of executionControlOwners[field].values()) {
      if (owners.length > 1) {
        errors.push(`DS-IMP execution.${field} is duplicated across work orders: ${owners.join(", ")}`);
      }
    }
  }

  if (workOrderMap[DS_IMPROVEMENTS_FINAL_CLAIM_WO]?.status === "done") {
    errors.push(...validateGat09CompletionBarrier(reg));
  }

  return errors;
}

/** Return a fail-closed reason when a DS work order's phase cannot be claimed. */
export function phaseClaimBlocker(
  reg,
  workOrder,
  { today = localDate() } = {},
) {
  if (!isDsImprovementsWorkOrder(workOrder)) return null;
  const phase = workOrder.phase ?? workOrder.execution?.phase;
  const controls = reg?.traceability?.[DS_IMPROVEMENTS_KEY]?.phaseControls?.[phase];
  if (!controls || typeof controls !== "object" || Array.isArray(controls)) {
    return `phase ${phase || "?"} has no valid claim controls`;
  }
  if (controls.claimState === "locked") {
    return `phase ${phase} is locked${isNonEmptyString(controls.claimStateReason) ? `: ${controls.claimStateReason}` : ""}`;
  }
  if (controls.claimState !== "open") return `phase ${phase} claimState is invalid`;
  if (!isNonEmptyString(controls.claimStateReason)) return `phase ${phase} claimStateReason is invalid`;
  if (DS_IMPROVEMENTS_NEGATIVE_GO_REASON.test(
    `${controls.claimStateReason || ""} ${controls.ownerGo?.evidence || ""}`,
  )) {
    return `phase ${phase} owner GO is denied or revoked`;
  }
  if (!isIsoDate(controls.decisionDate) || controls.decisionDate > today) {
    return `phase ${phase} decisionDate is invalid or future-dated`;
  }
  if (controls.openedBy !== DS_IMPROVEMENTS_OWNER_OPENER) {
    return `phase ${phase} openedBy must be "${DS_IMPROVEMENTS_OWNER_OPENER}"`;
  }
  if (!isIsoDate(controls.openedAt) || controls.openedAt > today) {
    return `phase ${phase} openedAt is invalid or future-dated`;
  }
  if (controls.openedAt < controls.decisionDate) return `phase ${phase} openedAt precedes decisionDate`;
  const ownerGo = controls.ownerGo;
  if (!ownerGo || typeof ownerGo !== "object" || Array.isArray(ownerGo)) {
    return `phase ${phase} ownerGo approval is missing`;
  }
  if (ownerGo.decision !== DS_IMPROVEMENTS_OWNER_GO_DECISION) {
    return `phase ${phase} ownerGo.decision must be "${DS_IMPROVEMENTS_OWNER_GO_DECISION}"`;
  }
  if (ownerGo.by !== DS_IMPROVEMENTS_OWNER_OPENER) {
    return `phase ${phase} ownerGo.by must be "${DS_IMPROVEMENTS_OWNER_OPENER}"`;
  }
  if (!isIsoDate(ownerGo.at) || ownerGo.at > today || ownerGo.at !== controls.openedAt) {
    return `phase ${phase} ownerGo.at must be a non-future date equal to openedAt`;
  }
  if (!isNonEmptyString(ownerGo.evidence)) return `phase ${phase} ownerGo.evidence is missing`;
  const openPhases = DS_IMPROVEMENTS_PHASES.filter(
    (candidate) => reg?.traceability?.[DS_IMPROVEMENTS_KEY]?.phaseControls?.[candidate]?.claimState === "open",
  );
  if (openPhases.length !== 1 || openPhases[0] !== phase) {
    return `phase ${phase} is not the sole open phase (open: ${openPhases.join(", ") || "none"})`;
  }
  const phaseIndex = DS_IMPROVEMENTS_PHASE_INDEX.get(phase);
  const priorNotLocked = DS_IMPROVEMENTS_PHASES
    .slice(0, phaseIndex)
    .filter((candidate) => reg.traceability[DS_IMPROVEMENTS_KEY].phaseControls[candidate]?.claimState !== "locked");
  if (priorNotLocked.length) return `phase ${phase} has prior phases not locked: ${priorNotLocked.join(", ")}`;

  const map = byId(reg);
  const items = reg?.traceability?.[DS_IMPROVEMENTS_KEY]?.items || [];
  const incompletePriorAuthorities = [...new Set(
    items
      .filter((item) => item?.disposition === "execute")
      .filter((item) => DS_IMPROVEMENTS_PHASE_INDEX.get(item.phase) < phaseIndex)
      .map((item) => item.authority),
  )].filter((authority) => map[authority]?.status !== "done");
  if (incompletePriorAuthorities.length) {
    return `phase ${phase} has incomplete prior authorities: ${incompletePriorAuthorities.join(", ")}`;
  }
  const unresolvedThroughPhase = items
    .filter((item) => item?.disposition === "deferred")
    .filter((item) => DS_IMPROVEMENTS_PHASE_INDEX.get(item.targetPhase) <= phaseIndex)
    .map((item) => item.id);
  if (unresolvedThroughPhase.length) {
    return `phase ${phase} has deferred items targeted through it: ${unresolvedThroughPhase.join(", ")}`;
  }
  return null;
}

/** Phase-6 certification cannot land while any execute authority or deferral remains open. */
export function validateGat09CompletionBarrier(
  reg,
  { today = localDate() } = {},
) {
  const errors = [];
  const workOrderMap = byId(reg);
  const gat09 = workOrderMap[DS_IMPROVEMENTS_FINAL_CLAIM_WO];
  if (!gat09) return [`${DS_IMPROVEMENTS_FINAL_CLAIM_WO}: final claim authority is missing`];

  const phaseBlocker = phaseClaimBlocker(reg, gat09, { today });
  if (phaseBlocker) errors.push(`${DS_IMPROVEMENTS_FINAL_CLAIM_WO}: ${phaseBlocker}`);

  const items = reg?.traceability?.[DS_IMPROVEMENTS_KEY]?.items || [];
  const deferredIds = items
    .filter((item) => item?.disposition === "deferred")
    .map((item) => item.id);
  if (deferredIds.length) {
    errors.push(`${DS_IMPROVEMENTS_FINAL_CLAIM_WO}: completion requires zero deferred items (found ${deferredIds.length}: ${deferredIds.join(", ")})`);
  }

  const otherAuthorityIds = [...new Set(
    items
      .filter((item) => item?.disposition === "execute" && isNonEmptyString(item.authority))
      .map((item) => item.authority)
      .filter((authority) => authority !== DS_IMPROVEMENTS_FINAL_CLAIM_WO),
  )];
  const openAuthorities = otherAuthorityIds
    .filter((authority) => workOrderMap[authority]?.status !== "done")
    .map((authority) => `${authority}=${workOrderMap[authority]?.status || "missing"}`);
  if (openAuthorities.length) {
    errors.push(`${DS_IMPROVEMENTS_FINAL_CLAIM_WO}: every other execute authority must be done (${openAuthorities.join(", ")})`);
  }
  return errors;
}

/** Validate the pre-state and global barrier for a requested done transition. */
export function validateDoneTransition(reg, workOrder, options = {}) {
  const errors = [];
  if (!workOrder || typeof workOrder !== "object") return ["done transition requires a work order"];
  if (workOrder.status !== "in-progress") {
    errors.push(`${workOrder.id}: done requires status in-progress (current=${workOrder.status})`);
  }
  const map = byId(reg);
  const openHard = (workOrder.dependsOn || []).filter((dependency) =>
    map[dependency]?.status !== "done"
    && !((workOrder.mustLandWith || []).includes(dependency) && map[dependency]?.status === "in-progress")
  );
  if (openHard.length) errors.push(`${workOrder.id}: dependencies not done: ${openHard.join(", ")}`);
  const partnersNotReady = (workOrder.mustLandWith || []).filter((partner) =>
    !["in-progress", "done"].includes(map[partner]?.status)
  );
  if (partnersNotReady.length) {
    errors.push(`${workOrder.id}: sequencing partners must be at least in-progress: ${partnersNotReady.join(", ")}`);
  }
  const phaseBlocker = phaseClaimBlocker(reg, workOrder, options);
  if (phaseBlocker) errors.push(`${workOrder.id}: ${phaseBlocker}`);
  if (workOrder.id === DS_IMPROVEMENTS_FINAL_CLAIM_WO) {
    errors.push(...validateGat09CompletionBarrier(reg, options));
  }
  return errors;
}

/** Support milestones are deliberately reported outside authority burn-down. */
export function summarizeDsSupportMilestones(reg) {
  return (Array.isArray(reg?.workOrders) ? reg.workOrders : [])
    .filter((workOrder) => isDsImprovementsWorkOrder(workOrder) && isNonEmptyStringArray(workOrder.supportsSourceIds))
    .map((workOrder) => ({
      id: workOrder.id,
      status: workOrder.status,
      phase: workOrder.phase ?? workOrder.execution?.phase,
      supportsSourceIds: [...workOrder.supportsSourceIds],
      milestoneId: workOrder.milestone?.id,
      finalAuthority: workOrder.milestone?.finalAuthority,
      finalPhase: workOrder.milestone?.finalPhase,
      completionEffect: workOrder.milestone?.completionEffect,
    }));
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
  reg.updated = localDate();
  const mutationErrors = validateRegistryMutationIntegrity(reg);
  if (mutationErrors.length) {
    console.error(`roadmap mutation REFUSED — registry validation is invalid (${mutationErrors.length}):`);
    for (const error of mutationErrors) console.error("  - " + error);
    process.exit(1);
  }
  const temporaryPath = `${REGISTRY_PATH}.${process.pid}.tmp`;
  try {
    fs.writeFileSync(temporaryPath, JSON.stringify(reg, null, 1) + "\n");
    fs.renameSync(temporaryPath, REGISTRY_PATH);
  } finally {
    if (fs.existsSync(temporaryPath)) fs.rmSync(temporaryPath);
  }
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
const actionable = (reg, map) => reg.workOrders.filter((w) =>
  w.status === "todo"
  && openDeps(w, map).length === 0
  && !phaseClaimBlocker(reg, w)
);

export function actionableWorkOrders(reg) {
  return actionable(reg, byId(reg));
}

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

/** Pure registry gate used immediately before every filesystem mutation. */
export function validateRegistryMutationIntegrity(
  reg,
  { today = localDate() } = {},
) {
  const errors = [];
  errors.push(...unknownObjectKeyErrors(reg, "registry", REGISTRY_ROOT_KEYS));
  errors.push(...unknownObjectKeyErrors(reg?.rules, "registry.rules", REGISTRY_RULE_KEYS));
  for (const [index, metric] of (Array.isArray(reg?.metrics) ? reg.metrics : []).entries()) {
    errors.push(...unknownObjectKeyErrors(metric, `registry.metrics[${index}]`, REGISTRY_METRIC_KEYS));
  }
  errors.push(...unknownObjectKeyErrors(
    reg?.traceability,
    "registry.traceability",
    REGISTRY_TRACEABILITY_KEYS,
  ));
  const workOrders = Array.isArray(reg?.workOrders) ? reg.workOrders : [];
  if (!Array.isArray(reg?.workOrders)) errors.push("workOrders must be an array");
  const idCounts = new Map();
  for (const workOrder of workOrders) {
    if (!isNonEmptyString(workOrder?.id)) {
      errors.push("workOrders contains an entry without a non-empty id");
      continue;
    }
    idCounts.set(workOrder.id, (idCounts.get(workOrder.id) || 0) + 1);
  }
  for (const [id, count] of idCounts) {
    if (count > 1) errors.push(`${id}: duplicate work-order id (${count} entries)`);
  }
  const map = Object.fromEntries(workOrders.map((workOrder) => [workOrder.id, workOrder]));
  for (const workOrder of workOrders) {
    errors.push(...unknownObjectKeyErrors(
      workOrder,
      `workOrders.${workOrder.id || "?"}`,
      REGISTRY_WORK_ORDER_KEYS,
    ));
    errors.push(...unknownObjectKeyErrors(
      workOrder.execution,
      `workOrders.${workOrder.id || "?"}.execution`,
      REGISTRY_EXECUTION_KEYS,
    ));
    errors.push(...unknownObjectKeyErrors(
      workOrder.milestone,
      `workOrders.${workOrder.id || "?"}.milestone`,
      REGISTRY_MILESTONE_KEYS,
    ));
    for (const [index, entry] of (Array.isArray(workOrder.progressLog) ? workOrder.progressLog : []).entries()) {
      errors.push(...unknownObjectKeyErrors(
        entry,
        `workOrders.${workOrder.id || "?"}.progressLog[${index}]`,
        REGISTRY_PROGRESS_KEYS,
      ));
    }
    if (!STATUSES.includes(workOrder.status)) errors.push(`${workOrder.id}: invalid status "${workOrder.status}"`);
    if (!Array.isArray(workOrder.dependsOn)) errors.push(`${workOrder.id}: dependsOn must be an array`);
    if (!Array.isArray(workOrder.mustLandWith)) errors.push(`${workOrder.id}: mustLandWith must be an array`);
    if (Array.isArray(workOrder.dependsOn) && new Set(workOrder.dependsOn).size !== workOrder.dependsOn.length) {
      errors.push(`${workOrder.id}: dependsOn contains duplicate ids`);
    }
    if (Array.isArray(workOrder.mustLandWith) && new Set(workOrder.mustLandWith).size !== workOrder.mustLandWith.length) {
      errors.push(`${workOrder.id}: mustLandWith contains duplicate ids`);
    }
    if ((workOrder.dependsOn || []).includes(workOrder.id)) errors.push(`${workOrder.id}: cannot depend on itself`);
    for (const dependency of workOrder.dependsOn || []) {
      if (!map[dependency]) errors.push(`${workOrder.id}: unknown dependency ${dependency}`);
    }
    for (const partner of workOrder.mustLandWith || []) {
      if (!map[partner]) errors.push(`${workOrder.id}: unknown mustLandWith ${partner}`);
    }
    if (workOrder.status === "done" && !isNonEmptyString(workOrder.evidence)) {
      errors.push(`${workOrder.id}: done without evidence — reopen or record evidence`);
    }
    if (workOrder.status === "done") {
      for (const dependency of workOrder.dependsOn || []) {
        const sameWindowInProgress = (workOrder.mustLandWith || []).includes(dependency)
          && map[dependency]?.status === "in-progress";
        if (map[dependency] && map[dependency].status !== "done" && !sameWindowInProgress) {
          errors.push(`${workOrder.id}: done but dependency ${dependency} is ${map[dependency].status}`);
        }
      }
    }
  }
  errors.push(...validateRegistryTemporalIntegrity(reg, { today }));
  errors.push(...validateDsImprovementsTraceability(reg, { today, enforcePinnedPlan: true }));
  errors.push(...detectCycles(reg).map((cycle) => `dependency cycle: ${cycle}`));
  return errors;
}

function check() {
  const reg = loadRegistry();
  const map = byId(reg);
  const errors = [];
  const seen = new Set();
  for (const lane of LANES) {
    for (const h of laneHeadings(lane)) {
      if (seen.has(h.id)) errors.push(`${h.id}: duplicate lane heading detected in ${lane}.md`);
      seen.add(h.id);
      const w = map[h.id];
      if (!w) errors.push(`${lane}.md has ${h.id} but registry.json does not — add it via a registry entry`);
      else {
        if (w.lane !== lane) errors.push(`${h.id}: lane mismatch (registry=${w.lane}, file=${lane}.md)`);
        if (w.title !== h.title) errors.push(`${h.id}: title drift (registry="${w.title}" vs file="${h.title}")`);
      }
    }
  }
  for (const w of reg.workOrders) if (!seen.has(w.id)) {
    errors.push(`registry has ${w.id} but no heading in ${w.lane}.md`);
  }
  errors.push(...validateRegistryMutationIntegrity(reg));
  if (errors.length) {
    console.error(`roadmap:check FAILED (${errors.length}):`);
    for (const e of errors) console.error("  - " + e);
    process.exit(1);
  }
  console.log(`roadmap:check OK — ${reg.workOrders.length} WOs consistent across registry + ${LANES.length} lane files`);
}

function generateStatus() {
  const reg = loadRegistry();
  const registryErrors = validateRegistryMutationIntegrity(reg);
  if (registryErrors.length) {
    console.error(`roadmap:status REFUSED — registry validation is invalid (${registryErrors.length}):`);
    for (const error of registryErrors) console.error("  - " + error);
    process.exit(1);
  }
  const map = byId(reg);
  const today = localDate();
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
  const supportMilestones = summarizeDsSupportMilestones(reg);
  lines.push("## Support milestones — partial evidence, no source completion effect");
  lines.push("");
  if (!supportMilestones.length) lines.push("(none)");
  else {
    lines.push("| WO | Status | Support phase | Supports source IDs | Milestone | Final authority | Final phase |");
    lines.push("| --- | --- | --- | --- | --- | --- | --- |");
    for (const milestone of supportMilestones) {
      lines.push(`| ${milestone.id} | ${milestone.status} | ${milestone.phase} | ${milestone.supportsSourceIds.join(", ")} | ${milestone.milestoneId} | ${milestone.finalAuthority} | ${milestone.finalPhase} |`);
    }
  }
  lines.push("");
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
  const blocked = reg.workOrders.filter((w) =>
    w.status === "todo" && (openDeps(w, map).length > 0 || phaseClaimBlocker(reg, w))
  );
  lines.push("## Blocked (dependencies or phase claim lock)");
  lines.push("");
  lines.push("| WO | Waiting on |");
  lines.push("| --- | --- |");
  for (const w of blocked) {
    const reasons = [
      ...(openDeps(w, map).length ? [`dependencies: ${openDeps(w, map).join(", ")}`] : []),
      ...(phaseClaimBlocker(reg, w) ? [phaseClaimBlocker(reg, w)] : []),
    ];
    lines.push(`| ${w.id} | ${reasons.join("; ").replace(/\|/g, "/")} |`);
  }
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
  const temporaryStatusPath = `${STATUS_PATH}.${process.pid}.tmp`;
  try {
    fs.writeFileSync(temporaryStatusPath, lines.join("\n"));
    fs.renameSync(temporaryStatusPath, STATUS_PATH);
  } finally {
    if (fs.existsSync(temporaryStatusPath)) fs.rmSync(temporaryStatusPath);
  }
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
    const errors = validateRegistryMutationIntegrity(reg);
    if (errors.length) {
      console.error(`REFUSED: registry is invalid (${errors.length}); run pnpm roadmap:check.`);
      process.exit(1);
    }
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
    const errors = validateRegistryMutationIntegrity(reg);
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
    const registryErrors = validateRegistryMutationIntegrity(reg);
    if (registryErrors.length) {
      console.error(`REFUSED: registry is invalid (${registryErrors.length}); run pnpm roadmap:check.`);
      process.exit(1);
    }
    const w = requireWo(reg, arg);
    const open = openDeps(w, byId(reg));
    if (w.status !== "todo") { console.error(`REFUSED: ${w.id} is ${w.status}; claim requires todo`); process.exit(1); }
    if (open.length) { console.error(`REFUSED: ${w.id} has open dependencies: ${open.join(", ")}`); process.exit(1); }
    const phaseBlocker = phaseClaimBlocker(reg, w);
    if (phaseBlocker) { console.error(`REFUSED: ${w.id} ${phaseBlocker}`); process.exit(1); }
    w.status = "in-progress";
    w.claimedBy = flag(args, "--by") || process.env.USER || "agent";
    w.claimedAt = localDate();
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
    w.progressLog.push({ at: localDateTime(), by: flag(args, "--by") || w.claimedBy || process.env.USER || "agent", note });
    saveRegistry(reg); generateStatus();
    console.log(`${w.id} progress logged (entry ${w.progressLog.length}). Successors resume via: node scripts/roadmap-status.mjs show ${w.id}`);
    break;
  }
  case "done": {
    const reg = loadRegistry();
    const w = requireWo(reg, arg);
    const evidence = flag(args, "--evidence");
    if (!evidence) { console.error("REFUSED: --evidence \"<how the acceptance gate was proven>\" is mandatory"); process.exit(1); }
    const transitionErrors = validateDoneTransition(reg, w);
    if (transitionErrors.length) {
      console.error(`REFUSED: ${transitionErrors.join("; ")}`);
      process.exit(1);
    }
    w.status = "done";
    w.doneAt = localDate();
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
