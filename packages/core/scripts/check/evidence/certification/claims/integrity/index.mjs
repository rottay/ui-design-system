#!/usr/bin/env node
/**
 * WO-GAT-09 — Phase-6 full public-claim integrity certification.
 *
 * This gate has structural, scoped V1 and final modes:
 *   --structural  proves the gate contract, inventory and negative posture while
 *                 reporting completion blockers as pending.
 *   --v1          executes reviewed clause evidence; never permits completion.
 *   --final       fails until every claim is evidenced, every other executable
 *                 DS authority is done, no deferred review is overdue, Phase 6
 *                 has explicit owner GO and the inherited GAT-07 proof is live.
 *
 * roadmap/registry.json remains the sole status authority. The adjacent JSON is
 * only a claim-to-evidence map; it cannot open a phase or complete a source ID.
 */
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  realpathSync,
  renameSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, extname, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { repoRoot as findRepoRoot } from '../../../../../libraries/repo-root/index.mjs';

import { V1_OWNER_DECISION, validateRegistryMutationIntegrity, validateV1PhaseMapping, validateGat09CompletionBarrier } from "../../../../../../../../scripts/maintain/roadmap/status/index.mjs";

import { APCA_BODY_MIN, APCA_UI_MIN, APCA_SKIP_DISPOSITIONS } from "../../../../engine/tokens/audit/counters/contrast/index.mjs";

const SCRIPT_PATH = fileURLToPath(import.meta.url);
const HERE = dirname(SCRIPT_PATH);
const DEFAULT_REPO_ROOT = findRepoRoot(HERE);
const EVIDENCE_MAP_PATH =
  "packages/core/scripts/check/evidence/certification/claims/integrity/public-claim-evidence/index.json";
const ROADMAP_REGISTRY_PATH = "roadmap/registry.json";
const GAT07_ARTIFACT_PATH =
  "packages/core/artifacts/quality/certification/claims/exactness/evidence/index.json";
const GAT07_HASH_PATH =
  "packages/core/artifacts/quality/certification/claims/exactness/digest/index.txt";
const GAT09_ARTIFACT_PATH =
  "packages/core/artifacts/quality/certification/claims/integrity/index.json";
const GAT07_SCRIPT_PATH = "packages/core/scripts/check/evidence/certification/claims/exactness/index.mjs";
const CLAIM_METHOD = "gat09-public-markdown-claim-line-v1";
const AUTHORITY_METHOD = "gat09-registry-dynamic-completion-barrier-v1";
const EVIDENCE_METHOD = "gat09-current-consumer-or-executable-evidence-v1";
const CLAIM_TERM_PATTERN =
  /\b(all|every(?:thing)?|complete(?:d|ly)?|working)\b/giu;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/u;
const SHA_PATTERN = /^[a-f0-9]{40}$/u;
const SOURCE_TEST_PATTERN =
  /(?:^|\/)(?:__tests__|tests|stories)(?:\/|$)|\.(?:spec|stories|test)\.[^.]+$/u;
const EXECUTABLE_ASSERTION_PATTERN =
  /(?:^|\/)(?:scripts\/[^/]+\.(?:cjs|js|mjs)|[^/]+\.(?:spec|test)\.(?:cjs|js|jsx|mjs|ts|tsx))$/u;
const PUBLIC_CORPUS = Object.freeze([
  { kind: "file", path: "README.md" },
  { kind: "file", path: "packages/core/README.md" },
  { kind: "file", path: "packages/core/docs/architecture/tenant-authority/index.md" },
  { kind: "file", path: "packages/core/docs/architecture/ui-tiers/structures/index.md" },
  { kind: "tree", path: "packages/core/docs/reference" },
  { kind: "file", path: "packages/showroom/README.md" },
]);
const REPOSITORY_ROOTS = Object.freeze({
  "ui-design-system": ".",
  "app-bithire": "../app-bithire",
  "app-platform": "../app-platform",
  "app-evnto": "../app-evnto",
  "docs-engineering": "../docs-engineering",
});

function portable(path, root) {
  return relative(root, path).split(sep).join("/");
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, canonicalize(value[key])])
    );
  }
  return value;
}

function canonicalJson(value) {
  return JSON.stringify(canonicalize(value));
}

function same(left, right) {
  return canonicalJson(left) === canonicalJson(right);
}

function exactKeys(value, expected, label, errors) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    errors.push(`${label} must be an object`);
    return false;
  }
  const actual = Object.keys(value).sort();
  const wanted = [...expected].sort();
  if (!same(actual, wanted)) {
    errors.push(
      `${label} keys must be exactly ${wanted.join(", ")}; found ${actual.join(
        ", "
      )}`
    );
    return false;
  }
  return true;
}

function readJson(path, errors, label) {
  if (!existsSync(path)) {
    errors.push(`${label} is missing: ${path}`);
    return null;
  }
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    errors.push(`${label} is not valid JSON: ${error.message}`);
    return null;
  }
}

function filesBelow(root) {
  if (!existsSync(root)) return [];
  const files = [];
  for (const entry of readdirSync(root, { withFileTypes: true }).sort((a, b) =>
    a.name.localeCompare(b.name)
  )) {
    const path = resolve(root, entry.name);
    if (entry.isDirectory()) {
      files.push(...filesBelow(path));
    } else if (entry.isFile() && extname(entry.name).toLowerCase() === ".md") {
      files.push(path);
    }
  }
  return files;
}

function gitRevision(repoRoot) {
  const result = spawnSync("git", ["rev-parse", "HEAD"], {
    cwd: repoRoot,
    encoding: "utf8",
    timeout: 10_000,
  });
  const revision = result.status === 0 ? result.stdout.trim() : "";
  return SHA_PATTERN.test(revision) ? revision : "unversioned-fixture";
}

function currentProgramDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function canonicalTerm(term) {
  const normalized = term.toLowerCase();
  if (normalized.startsWith("every")) return "every";
  if (normalized.startsWith("complete")) return "complete";
  return normalized;
}

export function discoverPublicCorpus({
  repoRoot,
  corpus = PUBLIC_CORPUS,
} = {}) {
  const root = resolve(repoRoot ?? DEFAULT_REPO_ROOT);
  const errors = [];
  const files = [];
  for (const entry of corpus) {
    const path = resolve(root, entry.path);
    if (!existsSync(path)) {
      errors.push(`public corpus ${entry.kind} is missing: ${entry.path}`);
      continue;
    }
    if (entry.kind === "file") {
      if (!statSync(path).isFile() || extname(path).toLowerCase() !== ".md") {
        errors.push(`public corpus file is not Markdown: ${entry.path}`);
      } else {
        files.push(path);
      }
    } else if (entry.kind === "tree") {
      if (!statSync(path).isDirectory()) {
        errors.push(`public corpus tree is not a directory: ${entry.path}`);
      } else {
        files.push(...filesBelow(path));
      }
    } else {
      errors.push(
        `unknown public corpus kind ${String(entry.kind)} for ${entry.path}`
      );
    }
  }
  return {
    errors,
    files: [...new Set(files)].sort((a, b) =>
      portable(a, root).localeCompare(portable(b, root))
    ),
  };
}

export function inventoryPublicClaims({
  repoRoot,
  corpus = PUBLIC_CORPUS,
} = {}) {
  const root = resolve(repoRoot ?? DEFAULT_REPO_ROOT);
  const discovered = discoverPublicCorpus({ repoRoot: root, corpus });
  const claims = [];
  const manifest = [];
  const occurrenceBySignature = new Map();

  for (const path of discovered.files) {
    const source = readFileSync(path, "utf8");
    const display = portable(path, root);
    manifest.push({
      path: display,
      bytes: Buffer.byteLength(source),
      sha256: sha256(source),
    });
    let fenced = false;
    source.split(/\r?\n/u).forEach((rawLine, lineIndex) => {
      if (/^\s*(?:```|~~~)/u.test(rawLine)) {
        fenced = !fenced;
        return;
      }
      if (fenced) return;
      const text = rawLine.trim().replace(/\s+/gu, " ");
      if (!text || /^<!--.*-->$/u.test(text)) return;
      const terms = [
        ...new Set(
          [...text.matchAll(CLAIM_TERM_PATTERN)].map((match) =>
            canonicalTerm(match[1])
          )
        ),
      ].sort();
      if (terms.length === 0) return;
      const signature = `${display}\u0000${text}\u0000${terms.join(",")}`;
      const occurrence = occurrenceBySignature.get(signature) ?? 0;
      occurrenceBySignature.set(signature, occurrence + 1);
      claims.push({
        id: `claim-${sha256(`${signature}\u0000${String(occurrence)}`).slice(
          0,
          20
        )}`,
        path: display,
        line: lineIndex + 1,
        terms,
        text,
      });
    });
  }

  claims.sort(
    (left, right) =>
      left.path.localeCompare(right.path) ||
      left.line - right.line ||
      left.id.localeCompare(right.id)
  );
  return {
    errors: discovered.errors,
    corpus: manifest,
    claims,
  };
}

function resolveRepositoryRoot(repoRoot, repository, errors, label) {
  const relativeRoot = REPOSITORY_ROOTS[repository];
  if (!relativeRoot) {
    errors.push(`${label}.repository is unknown: ${String(repository)}`);
    return null;
  }
  return resolve(repoRoot, relativeRoot);
}

function pathIsInside(root, path) {
  const rel = relative(root, path);
  return rel === "" || (!rel.startsWith(`..${sep}`) && rel !== "..");
}

function validateFileEvidence({ evidence, repoRoot, label, errors }) {
  const repositoryRoot = resolveRepositoryRoot(
    repoRoot,
    evidence.repository,
    errors,
    label
  );
  if (!repositoryRoot) return false;
  const path = resolve(repositoryRoot, evidence.path);
  if (!pathIsInside(repositoryRoot, path)) {
    errors.push(
      `${label}.path escapes ${evidence.repository}: ${evidence.path}`
    );
    return false;
  }
  if (!existsSync(path) || !statSync(path).isFile()) {
    errors.push(
      `${label}.path is missing: ${evidence.repository}/${evidence.path}`
    );
    return false;
  }
  const realRepositoryRoot = realpathSync(repositoryRoot);
  const realEvidencePath = realpathSync(path);
  if (!pathIsInside(realRepositoryRoot, realEvidencePath)) {
    errors.push(
      `${label}.path resolves outside ${evidence.repository}: ${evidence.path}`
    );
    return false;
  }
  const source = readFileSync(path, "utf8");
  if (!source.includes(evidence.contains)) {
    errors.push(
      `${label}.contains is absent from ${evidence.repository}/${evidence.path}`
    );
    return false;
  }
  const display = evidence.path.split(sep).join("/");
  if (evidence.kind === "production-consumer") {
    const isSource =
      display === "src" ||
      display.startsWith("src/") ||
      /^packages\/[^/]+\/src\//u.test(display);
    if (!isSource || SOURCE_TEST_PATTERN.test(display)) {
      errors.push(
        `${label} must point to productive source, not a test/doc: ${display}`
      );
      return false;
    }
  }
  if (
    evidence.kind === "executable-assertion" &&
    !EXECUTABLE_ASSERTION_PATTERN.test(display)
  ) {
    errors.push(
      `${label} must point to a test/spec or scripts/*.mjs assertion: ${display}`
    );
    return false;
  }
  return true;
}

function validateGat07ClaimEvidence({ evidence, gat07, label, errors }) {
  const floorClaims = gat07.artifact?.publicClaims?.floor?.claims;
  const claim = Array.isArray(floorClaims)
    ? floorClaims.find(({ id }) => id === evidence.claimId)
    : null;
  if (!claim) {
    errors.push(
      `${label}.claimId is absent from the current GAT-07 floor: ${evidence.claimId}`
    );
    return false;
  }
  if (claim.affirmativeBehaviorClaimAllowed !== true) {
    errors.push(
      `${label} cannot support an affirmative claim: ${evidence.claimId} is non-affirmative`
    );
    return false;
  }
  if (
    (claim.productionConsumers?.length ?? 0) === 0 &&
    (claim.executableAssertions?.length ?? 0) === 0
  ) {
    errors.push(
      `${label} has no GAT-07 production consumer or executable assertion`
    );
    return false;
  }
  return true;
}

function validateEvidenceEntry({ evidence, repoRoot, gat07, label, errors }) {
  if (!evidence || typeof evidence !== "object" || Array.isArray(evidence)) {
    errors.push(`${label} must be an object`);
    return false;
  }
  if (evidence.kind === "gat07-claim") {
    if (!exactKeys(evidence, ["kind", "claimId"], label, errors)) return false;
    return validateGat07ClaimEvidence({ evidence, gat07, label, errors });
  }
  if (
    !["production-consumer", "executable-assertion"].includes(evidence.kind)
  ) {
    errors.push(`${label}.kind is unknown: ${String(evidence.kind)}`);
    return false;
  }
  const keys =
    evidence.kind === "executable-assertion"
      ? ["kind", "repository", "path", "contains", "command"]
      : ["kind", "repository", "path", "contains"];
  if (!exactKeys(evidence, keys, label, errors)) return false;
  if (
    typeof evidence.repository !== "string" ||
    typeof evidence.path !== "string" ||
    typeof evidence.contains !== "string" ||
    evidence.path.length === 0 ||
    evidence.contains.length === 0
  ) {
    errors.push(`${label} repository/path/contains must be non-empty strings`);
    return false;
  }
  if (evidence.kind === "executable-assertion") {
    if (
      !Array.isArray(evidence.command) ||
      evidence.command.length === 0 ||
      evidence.command.some(
        (part) => typeof part !== "string" || part.length === 0
      )
    ) {
      errors.push(`${label}.command must be a non-empty argv string array`);
      return false;
    }
    const normalizedEvidencePath = evidence.path.split(sep).join("/");
    if (
      !evidence.command.some(
        (part) => part.split(sep).join("/") === normalizedEvidencePath
      )
    ) {
      errors.push(
        `${label}.command must name its assertion path exactly: ${normalizedEvidencePath}`
      );
      return false;
    }
    if (
      !["node", "pnpm", process.execPath].includes(evidence.command[0]) ||
      evidence.command.some((part) =>
        /^(?:deploy|publish|push|release)$/iu.test(part)
      )
    ) {
      errors.push(
        `${label}.command must be a read-only node/pnpm assertion command`
      );
      return false;
    }
  }
  return validateFileEvidence({ evidence, repoRoot, label, errors });
}

export function classifyClaimEvidence({
  claims,
  evidenceMap,
  repoRoot,
  gat07 = {},
} = {}) {
  const root = resolve(repoRoot ?? DEFAULT_REPO_ROOT);
  const errors = [];
  const supported = [];
  const nonClaims = [];
  const unsupported = [];
  const executableCommands = [];
  const claimById = new Map((claims ?? []).map((claim) => [claim.id, claim]));

  if (
    !exactKeys(
      evidenceMap,
      ["schemaVersion", "authority", "purpose", "entries"],
      "GAT-09 evidence map",
      errors
    )
  ) {
    return {
      errors,
      supported,
      nonClaims,
      unsupported: [...(claims ?? [])],
      executableCommands,
    };
  }
  if (
    evidenceMap.schemaVersion !== 1 ||
    evidenceMap.authority !== "WO-GAT-09" ||
    typeof evidenceMap.purpose !== "string" ||
    !Array.isArray(evidenceMap.entries)
  ) {
    errors.push(
      "GAT-09 evidence map schemaVersion/authority/purpose/entries are invalid"
    );
    return {
      errors,
      supported,
      nonClaims,
      unsupported: [...(claims ?? [])],
      executableCommands,
    };
  }

  const entries = new Map();
  for (const [index, entry] of evidenceMap.entries.entries()) {
    const label = `GAT-09 evidence map entries[${String(index)}]`;
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
      errors.push(`${label} must be an object`);
      continue;
    }
    if (entries.has(entry.claimId)) {
      errors.push(`${label}.claimId duplicates ${String(entry.claimId)}`);
      continue;
    }
    entries.set(entry.claimId, entry);
    if (!claimById.has(entry.claimId)) {
      errors.push(
        `${label}.claimId is stale or outside the public corpus: ${String(
          entry.claimId
        )}`
      );
      continue;
    }
    if (entry.disposition === "non-claim") {
      if (
        !exactKeys(
          entry,
          ["claimId", "disposition", "reason", "reviewedBy", "reviewedOn"],
          label,
          errors
        )
      )
        continue;
      if (
        typeof entry.reason !== "string" ||
        entry.reason.trim().length < 12 ||
        typeof entry.reviewedBy !== "string" ||
        entry.reviewedBy.trim().length === 0 ||
        !DATE_PATTERN.test(entry.reviewedOn ?? "")
      ) {
        errors.push(
          `${label} non-claim review requires reason, reviewedBy and YYYY-MM-DD reviewedOn`
        );
        continue;
      }
      nonClaims.push(entry.claimId);
      continue;
    }
    if (entry.disposition !== "supported") {
      errors.push(`${label}.disposition must be supported or non-claim`);
      continue;
    }
    if (
      !exactKeys(entry, ["claimId", "disposition", "evidence"], label, errors)
    )
      continue;
    if (!Array.isArray(entry.evidence) || entry.evidence.length === 0) {
      errors.push(
        `${label}.evidence must contain production consumption or an executable assertion`
      );
      continue;
    }
    let valid = true;
    entry.evidence.forEach((evidence, evidenceIndex) => {
      const evidenceValid = validateEvidenceEntry({
        evidence,
        repoRoot: root,
        gat07,
        label: `${label}.evidence[${String(evidenceIndex)}]`,
        errors,
      });
      valid = valid && evidenceValid;
      if (evidenceValid && evidence.kind === "executable-assertion") {
        executableCommands.push({
          claimId: entry.claimId,
          repository: evidence.repository,
          command: evidence.command,
        });
      }
    });
    if (valid) supported.push(entry.claimId);
  }

  for (const claim of claims ?? []) {
    if (!supported.includes(claim.id) && !nonClaims.includes(claim.id)) {
      unsupported.push(claim);
    }
  }
  return {
    errors,
    supported: supported.sort(),
    nonClaims: nonClaims.sort(),
    unsupported,
    executableCommands,
  };
}

export function auditRegistryBarrier({ registry, asOf } = {}) {
  const errors = [];
  const pending = [];
  const openAuthorities = [];
  const overdueDeferred = [];
  if (!registry || typeof registry !== "object" || Array.isArray(registry)) {
    return {
      errors: ["roadmap registry must be an object"],
      pending,
      openAuthorities,
      overdueDeferred,
      phase6: "missing",
      workOrderStatus: "missing",
    };
  }
  if (!DATE_PATTERN.test(asOf ?? ""))
    errors.push(`asOf must be YYYY-MM-DD, found ${String(asOf)}`);
  const workOrders = Array.isArray(registry.workOrders)
    ? registry.workOrders
    : [];
  const workOrderById = new Map();
  for (const workOrder of workOrders) {
    if (!workOrder?.id || workOrderById.has(workOrder.id)) {
      errors.push(
        `registry work-order id is missing or duplicated: ${String(
          workOrder?.id
        )}`
      );
    } else {
      workOrderById.set(workOrder.id, workOrder);
    }
  }
  const traceability = registry.traceability?.["ds-improvements"];
  const items = Array.isArray(traceability?.items) ? traceability.items : [];
  if (items.length === 0)
    errors.push("registry DS-improvements item inventory is missing");
  const gat09Source = items.find(({ id }) => id === "DS-IMP-060");
  if (
    gat09Source?.disposition !== "execute" ||
    gat09Source?.authority !== "WO-GAT-09" ||
    gat09Source?.phase !== "6"
  ) {
    errors.push(
      "DS-IMP-060 must remain execute authority WO-GAT-09 in Phase 6"
    );
  }
  const gat09 = workOrderById.get("WO-GAT-09");
  if (!gat09) {
    errors.push("WO-GAT-09 is missing from roadmap registry");
  } else {
    for (const dependency of [
      "WO-GAT-05",
      "WO-GAT-06",
      "WO-GAT-07",
      "WO-CRA-15",
    ]) {
      if (!gat09.dependsOn?.includes(dependency)) {
        errors.push(`WO-GAT-09 must depend on ${dependency}`);
      }
    }
  }

  const seenAuthorities = new Set();
  for (const item of items) {
    if (item.disposition === "execute") {
      if (
        typeof item.authority !== "string" ||
        !workOrderById.has(item.authority)
      ) {
        errors.push(
          `${String(item.id)} execute authority is missing from workOrders`
        );
        continue;
      }
      if (item.authority === "WO-GAT-09" || seenAuthorities.has(item.authority))
        continue;
      seenAuthorities.add(item.authority);
      const authority = workOrderById.get(item.authority);
      if (authority.status !== "done") {
        openAuthorities.push({
          id: item.authority,
          status: authority.status,
          sourceIds: items
            .filter(
              (candidate) =>
                candidate.disposition === "execute" &&
                candidate.authority === item.authority
            )
            .map(({ id }) => id)
            .sort(),
        });
      }
    } else if (item.disposition === "deferred") {
      if (
        !DATE_PATTERN.test(item.reviewBy ?? "") ||
        typeof item.owner !== "string"
      ) {
        errors.push(
          `${String(
            item.id
          )} deferred review requires owner and YYYY-MM-DD reviewBy`
        );
      } else if (DATE_PATTERN.test(asOf ?? "") && item.reviewBy < asOf) {
        overdueDeferred.push({
          id: item.id,
          owner: item.owner,
          reviewBy: item.reviewBy,
        });
      }
    }
  }
  openAuthorities.sort((a, b) => a.id.localeCompare(b.id));
  overdueDeferred.sort((a, b) => a.id.localeCompare(b.id));
  if (openAuthorities.length > 0) {
    pending.push(
      `open executable DS authorities: ${openAuthorities
        .map(({ id, status }) => `${id}(${status})`)
        .join(", ")}`
    );
  }
  if (overdueDeferred.length > 0) {
    pending.push(
      `overdue deferred reviews: ${overdueDeferred
        .map(({ id, reviewBy }) => `${id}(${reviewBy})`)
        .join(", ")}`
    );
  }
  const phase6 = traceability?.phaseControls?.["6"];
  if (phase6?.claimState !== "open" || phase6?.ownerGo?.decision !== "go") {
    pending.push("Phase 6 remains locked without explicit owner GO");
  }
  if (gat09 && gat09.status !== "in-progress") {
    pending.push(
      `WO-GAT-09 must be in-progress for final certification; found ${String(
        gat09.status
      )}`
    );
  }
  return {
    errors,
    pending,
    openAuthorities,
    overdueDeferred,
    phase6: phase6?.claimState ?? "missing",
    workOrderStatus: gat09?.status ?? "missing",
  };
}

export function auditGat07Artifact({ repoRoot } = {}) {
  const root = resolve(repoRoot ?? DEFAULT_REPO_ROOT);
  const errors = [];
  const artifact = readJson(
    resolve(root, GAT07_ARTIFACT_PATH),
    errors,
    "GAT-07 semantic artifact"
  );
  const hashPath = resolve(root, GAT07_HASH_PATH);
  const hash = existsSync(hashPath)
    ? readFileSync(hashPath, "utf8").trim()
    : "";
  if (!existsSync(hashPath))
    errors.push(`GAT-07 semantic hash is missing: ${GAT07_HASH_PATH}`);
  if (artifact) {
    if (
      artifact.authority !== "WO-GAT-07" ||
      artifact.publicClaims?.floor?.scope !== "DS-IMP-060-phase-0-minimum"
    ) {
      errors.push(
        "GAT-07 artifact must remain the WO-GAT-07 bounded Phase-0 minimum"
      );
    }
    if (
      artifact.publicClaims?.floor?.finalCertificationAuthority !== "WO-GAT-09"
    ) {
      errors.push(
        "GAT-07 floor must delegate final certification to WO-GAT-09"
      );
    }
    const runs = artifact.deterministicRuns;
    if (
      runs?.count !== 2 ||
      runs?.agree !== true ||
      !Array.isArray(runs.hashes) ||
      runs.hashes.length !== 2 ||
      runs.hashes[0] !== runs.hashes[1] ||
      hash !== runs.hashes[0]
    ) {
      errors.push("GAT-07 artifact/hash must prove two agreeing bounded runs");
    }
  }
  return { errors, artifact, hash };
}

function runEvidenceCommands({ commands, repoRoot }) {
  const results = [];
  const seen = new Set();
  for (const evidence of commands) {
    const key = canonicalJson({
      repository: evidence.repository,
      command: evidence.command,
    });
    if (seen.has(key)) continue;
    seen.add(key);
    const cwd = resolveRepositoryRoot(
      repoRoot,
      evidence.repository,
      [],
      "evidence command"
    );
    const result = spawnSync("nice", ["-n", "15", ...evidence.command], {
      cwd,
      encoding: "utf8",
      timeout: 300_000,
      env: { ...process.env, CI: "1" },
    });
    results.push({
      command: evidence.command,
      repository: evidence.repository,
      passed: result.status === 0,
      status: result.status,
      signal: result.signal,
    });
  }
  return results;
}

function runGat07Executable(repoRoot) {
  const result = spawnSync(
    "nice",
    [
      "-n",
      "15",
      process.execPath,
      resolve(repoRoot, GAT07_SCRIPT_PATH),
      "--check-artifact",
    ],
    {
      cwd: repoRoot,
      encoding: "utf8",
      timeout: 300_000,
      env: { ...process.env, CI: "1" },
    }
  );
  return {
    passed: result.status === 0,
    status: result.status,
    signal: result.signal,
  };
}

function buildStaticCertification({ repoRoot, asOf, corpus } = {}) {
  const root = resolve(repoRoot ?? DEFAULT_REPO_ROOT);
  const inventory = inventoryPublicClaims({ repoRoot: root, corpus });
  const registryErrors = [];
  const registry = readJson(
    resolve(root, ROADMAP_REGISTRY_PATH),
    registryErrors,
    "roadmap registry"
  );
  const mapErrors = [];
  const evidenceMap = readJson(
    resolve(root, EVIDENCE_MAP_PATH),
    mapErrors,
    "GAT-09 evidence map"
  );
  const gat07 = auditGat07Artifact({ repoRoot: root });
  const barrier = auditRegistryBarrier({ registry, asOf });
  const classified = classifyClaimEvidence({
    claims: inventory.claims,
    evidenceMap,
    repoRoot: root,
    gat07,
  });
  const inputManifest = [
    ...inventory.corpus,
    ...[
      ROADMAP_REGISTRY_PATH,
      EVIDENCE_MAP_PATH,
      GAT07_ARTIFACT_PATH,
      GAT07_HASH_PATH,
    ].map((path) => {
      const absolute = resolve(root, path);
      if (!existsSync(absolute)) return { path, missing: true };
      const bytes = readFileSync(absolute);
      return { path, bytes: bytes.length, sha256: sha256(bytes) };
    }),
  ].sort((a, b) => a.path.localeCompare(b.path));
  const revision = gitRevision(root);
  const inputDigest = sha256(canonicalJson(inputManifest));
  const errors = [
    ...inventory.errors,
    ...registryErrors,
    ...mapErrors,
    ...gat07.errors.map((error) => `GAT-07: ${error}`),
    ...barrier.errors.map((error) => `registry barrier: ${error}`),
    ...classified.errors.map((error) => `claim evidence: ${error}`),
  ];
  const pending = [
    ...barrier.pending.map((item) => `registry barrier: ${item}`),
    ...(classified.unsupported.length > 0
      ? [
          `${String(
            classified.unsupported.length
          )} public claim candidate(s) lack supported evidence or a reviewed non-claim classification`,
        ]
      : []),
  ];
  return {
    schemaVersion: 1,
    workOrder: "WO-GAT-09",
    asOf,
    revision,
    inputDigest,
    inputManifest,
    corpus: inventory.corpus,
    claims: inventory.claims,
    supportedClaimIds: classified.supported,
    nonClaimIds: classified.nonClaims,
    unsupportedClaims: classified.unsupported,
    executableCommands: classified.executableCommands,
    registryBarrier: barrier,
    gat07: {
      errors: gat07.errors,
      semanticHash: gat07.hash,
      floorScope: gat07.artifact?.publicClaims?.floor?.scope ?? "missing",
    },
    errors,
    pending,
  };
}

export function compareCertificationRuns(first, second) {
  const firstHash = sha256(canonicalJson(first));
  const secondHash = sha256(canonicalJson(second));
  return {
    classification:
      "two independent fresh read-only certification runs over the complete input manifest",
    runCount: 2,
    hashes: [firstHash, secondHash],
    agree: firstHash === secondHash,
  };
}

function measured(value, provenance) {
  return { value, provenance };
}

export function resolveGat09Disposition({ mode, errors, pending }) {
  if (!["final", "structural"].includes(mode)) {
    throw new Error(`unknown GAT-09 gate mode: ${mode}`);
  }
  const structurallyPassed = errors.length === 0;
  const completionEligible = structurallyPassed && pending.length === 0;
  return {
    passed: mode === "structural" ? structurallyPassed : completionEligible,
    structurallyPassed,
    completionEligible,
  };
}

export function auditGat09({
  repoRoot,
  mode = "final",
  asOf = process.env.GAT09_AS_OF || currentProgramDate(),
  currentDate = currentProgramDate(),
  corpus,
  executeFinalEvidence = true,
  scopeInputPath,
  reviewedInputSha256,
} = {}) {
  if (mode === "v1") return auditScopedV1({ repoRoot, scopeInputPath, reviewedInputSha256, asOf, currentDate });
  if (!["final", "structural"].includes(mode)) {
    throw new Error(`unknown GAT-09 gate mode: ${mode}`);
  }
  const root = resolve(repoRoot ?? DEFAULT_REPO_ROOT);
  const first = buildStaticCertification({ repoRoot: root, asOf, corpus });
  const second = buildStaticCertification({ repoRoot: root, asOf, corpus });
  const reproducibility = compareCertificationRuns(first, second);
  const errors = [...first.errors];
  const pending = [...first.pending];
  if (asOf !== currentDate) {
    errors.push(
      `certification asOf must equal the current America/New_York date ${currentDate}; found ${asOf}`
    );
  }
  if (!reproducibility.agree)
    errors.push("the two independent GAT-09 certification runs disagree");

  const staticReady = errors.length === 0 && pending.length === 0;
  let gat07Executable = { status: "not-run", passed: false };
  let executableEvidence = [];
  if (mode === "structural") {
    pending.push(
      "final executable evidence is intentionally not run in structural mode"
    );
  } else if (mode === "final" && staticReady && executeFinalEvidence) {
    gat07Executable = runGat07Executable(root);
    if (!gat07Executable.passed)
      errors.push("the live GAT-07 --check-artifact executable proof failed");
    executableEvidence = runEvidenceCommands({
      commands: first.executableCommands,
      repoRoot: root,
    });
    const failedCommands = executableEvidence.filter(({ passed }) => !passed);
    if (failedCommands.length > 0) {
      errors.push(
        `${String(
          failedCommands.length
        )} registered executable claim-evidence command(s) failed`
      );
    }
  } else if (mode === "final" && !staticReady) {
    pending.push(
      "live GAT-07 and executable claim evidence are not run until static completion barriers clear"
    );
  } else if (mode === "final" && !executeFinalEvidence) {
    pending.push("final executable evidence execution was explicitly disabled");
  }

  if (
    first.registryBarrier.workOrderStatus === "done" &&
    (errors.length > 0 || pending.length > 0)
  ) {
    errors.push(
      "WO-GAT-09 cannot be done while its integral certification is ineligible"
    );
  }
  const disposition = resolveGat09Disposition({ mode, errors, pending });
  const claimProvenanceId = "public-claim-corpus";
  const authorityProvenanceId = "registry-authority-corpus";
  const countProvenance = {
    [claimProvenanceId]: {
      revision: first.revision,
      inputDigest: first.inputDigest,
      method: CLAIM_METHOD,
      reproducibility,
    },
    [authorityProvenanceId]: {
      revision: first.revision,
      inputDigest: first.inputDigest,
      method: AUTHORITY_METHOD,
      reproducibility,
    },
    "claim-evidence": {
      revision: first.revision,
      inputDigest: first.inputDigest,
      method: EVIDENCE_METHOD,
      reproducibility,
    },
  };
  const termCounts = Object.fromEntries(
    ["all", "complete", "every", "working"].map((term) => [
      term,
      measured(
        first.claims.filter(({ terms }) => terms.includes(term)).length,
        claimProvenanceId
      ),
    ])
  );
  return {
    schemaVersion: 1,
    workOrder: "WO-GAT-09",
    mode,
    asOf,
    ...disposition,
    claimBoundaries: {
      workOrderComplete: false,
      sourceItemsClosed: [],
      statusAuthority: ROADMAP_REGISTRY_PATH,
      phase0ProofAuthority: "WO-GAT-07",
    },
    provenance: {
      revision: first.revision,
      inputDigest: first.inputDigest,
      inputManifest: first.inputManifest,
      countProvenance,
      reproducibility,
    },
    counts: {
      corpusFiles: measured(first.corpus.length, claimProvenanceId),
      corpusBytes: measured(
        first.corpus.reduce((total, file) => total + file.bytes, 0),
        claimProvenanceId
      ),
      claimCandidates: measured(first.claims.length, claimProvenanceId),
      supportedClaims: measured(
        first.supportedClaimIds.length,
        "claim-evidence"
      ),
      reviewedNonClaims: measured(first.nonClaimIds.length, "claim-evidence"),
      unsupportedClaims: measured(
        first.unsupportedClaims.length,
        "claim-evidence"
      ),
      openExecutableAuthorities: measured(
        first.registryBarrier.openAuthorities.length,
        authorityProvenanceId
      ),
      overdueDeferredReviews: measured(
        first.registryBarrier.overdueDeferred.length,
        authorityProvenanceId
      ),
      terms: termCounts,
    },
    publicClaims: {
      corpusMethod: CLAIM_METHOD,
      candidates: first.claims,
      supportedClaimIds: first.supportedClaimIds,
      reviewedNonClaimIds: first.nonClaimIds,
      unsupported: first.unsupportedClaims,
    },
    registryBarrier: first.registryBarrier,
    inheritedProof: {
      gat07Artifact: first.gat07,
      gat07Executable,
    },
    executableEvidence,
    errors,
    pending,
  };
}

export const V1_SCOPE = "modern-ds-v1";
const V1_WORK_ORDER_IDS_SHA256 = "8303e53961051b4386bf5c81e8de31583832d5072d9d6323a152473956247c56";
const V1_STATUS_SCRIPT = "scripts/maintain/roadmap/status/index.mjs";
const V1_CERTIFIER = "packages/core/scripts/check/evidence/certification/claims/integrity/index.mjs";
const V1_CERTIFIER_IMPORTS = [
  "packages/core/scripts/check/engine/tokens/audit/counters/contrast/index.mjs",
  "packages/core/scripts/check/engine/tokens/audit/context/paths/index.mjs",
  "packages/core/scripts/check/engine/tokens/audit/parsing/index.mjs",
  "packages/core/scripts/libraries/repo-root/index.mjs",
  "packages/core/scripts/libraries/archive/index.mjs",
  "packages/core/scripts/libraries/archive/units/index.mjs",
];
const V1_HOLDS = new Set(["WO-TOK-11", "WO-ARC-19", "WO-GAT-11", "WO-SKIN-08"]);
export const V1_EXCLUSIONS = Object.freeze([
  { id: "ARC21-app", wo: "WO-ARC-21", boundary: "Actual app-bithire DB-write-to-first-paint and W4 exit proof" },
  { id: "CON08-consumer", wo: "WO-CON-08", boundary: "App history, authenticated actor trail, CAS, transactional publish, restore and recertification" },
  { id: "CON09-step3", wo: "WO-CON-09", boundary: "Measured app migration and guaranteed-door flip" },
  { id: "RET06-consumer-ops", wo: "WO-RET-06", boundary: "Exact remaining app consumer and owner/ops portions; no fictitious consumer" },
  { id: "RET07-step3", wo: "WO-RET-07", boundary: "Stored-field migration/removal; keep safe admitted compatibility until then" },
  { id: "DER10-identity", wo: "WO-DER-10", boundary: "Final owner identity pick and final goldens" },
  { id: "GAT09-final", wo: "WO-GAT-09", boundary: "Full programme certification barrier and whole-WO closure" },
  { id: "EVI02-F72-ops", wo: "WO-EVI-02", boundary: "F-72 B-ops and Stage C after real data-owner record; full EVI-02 and milestone B cannot be claimed" },
  { id: "RET04-normalization", wo: "WO-RET-04", boundary: "Global size/path/facade normalization and unchanged full F-44 criteria" },
  { id: "CRA15-live", wo: "WO-CRA-15", boundary: "All live spatial/WebGPU/lifecycle/performance/app exposure criteria" },
  { id: "ENG25-ai", wo: "WO-ENG-25", boundary: "Unconsumed AI state-motion kit explicitly paused under D-19; no delivered claim" },
 ].map((exclusion) => Object.freeze({
  ...exclusion,
  owner: ["ARC21-app", "CON08-consumer", "CON09-step3", "RET06-consumer-ops", "RET07-step3", "EVI02-F72-ops"].includes(exclusion.id) ? "owning application/data owner/ops; DS retains its obligations" : "DS owner under the dated decision",
  condition: "Only the named tail is excluded from this V1 assertion; every retained DS clause executes and passes; no full-WO credit",
  fullWorkOrderReceiver: exclusion.wo,
  decisionRef: V1_OWNER_DECISION,
})));
const V1_RET06_NAMES = Object.freeze([
  "./styles/rottay", "./styles/modern", "./icons/foundation", "./icons/identity",
  "./icons/intelligence", "./icons/operations", "./pictograms", "BrandMotion step 4(ii)",
]);
const V1_RET04_NAMES = Object.freeze([
  "authored file size", "pipeline size", "repeated path words", "single-child folders",
  "empty facades", "showroom loose files", "preset data physical move",
]);
const V1_AXES = ["shape", "rhythm", "typography", "depth", "motion", "states"];

function v1File(root, path) {
  if (typeof path !== "string" || !path || path !== portable(resolve(root, path), root)
    || !pathIsInside(root, resolve(root, path))) throw new Error(`scoped path escapes candidate: ${String(path)}`);
  const absolute = resolve(root, path);
  if (!statSync(absolute).isFile() || !pathIsInside(realpathSync(root), realpathSync(absolute))) {
    throw new Error(`scoped input is not a candidate file: ${path}`);
  }
  return readFileSync(absolute);
}

function v1FilesBelow(root, path) {
  const absolute = resolve(root, path);
  const stat = statSync(absolute);
  if (stat.isFile()) return [path];
  if (!stat.isDirectory() || !pathIsInside(realpathSync(root), realpathSync(absolute))) throw new Error(`invalid candidate root ${path}`);
  return readdirSync(absolute, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))
    .flatMap((entry) => {
      if (entry.isSymbolicLink()) throw new Error(`candidate symlink is not admitted: ${path}/${entry.name}`);
      return v1FilesBelow(root, `${path}/${entry.name}`);
    });
}

/** Every original lane block participates, including amendments and full acceptance. */
export function discoverV1Clauses({ repoRoot, registry, exclusions = V1_EXCLUSIONS }) {
  if (!Array.isArray(registry.workOrders) || registry.workOrders.length !== 170) throw new Error("V1 requires the unchanged 170-WO population");
  if (sha256(canonicalJson(registry.workOrders.map((w) => w.id).sort())) !== V1_WORK_ORDER_IDS_SHA256) throw new Error("original 170-WO identities must be preserved");
  const clauses = [];
  for (const w of [...registry.workOrders].sort((a, b) => a.id.localeCompare(b.id))) {
    if (!/^[a-z-]+$/u.test(w.lane)) throw new Error(`${w.id}: invalid lane`);
    const path = `roadmap/${w.lane}.md`;
    const source = v1File(repoRoot, path).toString("utf8");
    const headings = [...source.matchAll(/^### (WO-[A-Z]+-\d+)\b.*$/gmu)];
    const expectedIds = registry.workOrders.filter((order) => order.lane === w.lane).map((order) => order.id).sort();
    if (!same(headings.map((m) => m.at(1)).sort(), expectedIds)) throw new Error(`${w.lane}: unregistered/missing lane receiver`);
    const heading = headings.find((m) => m.at(1) === w.id);
    if (!heading || headings.filter((m) => m.at(1) === w.id).length !== 1) throw new Error(`${w.id}: missing/duplicate lane block`);
    const following = source.slice(heading.index + heading.at(0).length).search(/^### WO-|^## /mu);
    const end = following < 0 ? source.length : heading.index + heading.at(0).length + following;
    const block = source.slice(heading.index, end).trim();
    if (!block) throw new Error(`${w.id}: empty lane contract`);
    const activeExclusions = exclusions.filter((e) => e.wo === w.id).map((e) => e.id);
    const parts = block.split(/(?=^- \*\*)/mu).map((text) => text.trim()).filter(Boolean);
    for (const [index, text] of parts.entries()) {
      clauses.push({ id: `${w.id}:${index + 1}`, wo: w.id, path, text, sha256: sha256(text), exclusions: activeExclusions });
    }
  }
  if (new Set(clauses.map((c) => c.id)).size !== clauses.length) throw new Error("duplicate V1 clause identity");
  return clauses;
}

export function validateV1Measurements(measurements, populations, errors) {
  if (!measurements || !populations) { errors.push("executed V1 safety/contrast/axis measurements are missing"); return; }
  const pairs = populations.contrast;
  const observed = measurements.contrast;
  if (!Array.isArray(pairs) || !pairs.length || !Array.isArray(observed) || pairs.length !== observed.length
    || new Set(pairs.map((p) => p.id)).size !== pairs.length) errors.push("APCA pairing population/cardinality mismatch");
  else for (const pair of pairs) {
    const result = observed.find((p) => p.id === pair.id);
    const floor = pair.kind === "body" ? APCA_BODY_MIN : pair.kind === "ui" ? APCA_UI_MIN : NaN;
    const disposition = APCA_SKIP_DISPOSITIONS.find((d) => d.pair === pair.pairId && d.palettes.includes(pair.palette));
    const justifiedSkip = result?.skipped === true && disposition
      && result.disposition === disposition.disposition && result.reason === disposition.reason;
    const measured = result?.skipped === false && Number.isFinite(result.lc) && Math.abs(result.lc) >= floor;
    if (APCA_BODY_MIN < 60 || APCA_UI_MIN < 45 || !Number.isFinite(floor) || pair.minimum !== floor || result?.minimum !== floor
      || (!justifiedSkip && !measured)) errors.push(`APCA floor/failure/unjustified skip: ${pair.id}`);
  }
  const axes = populations.axes;
  const measuredAxes = measurements.axes;
  if (!Array.isArray(axes) || !same(axes.map((a) => a.axis).sort(), [...V1_AXES].sort())
    || !Array.isArray(measuredAxes) || measuredAxes.length !== axes.length) errors.push("six-axis population mismatch");
  else for (const axis of axes) {
    const result = measuredAxes.find((a) => a.axis === axis.axis);
    if (!Array.isArray(axis.members) || !axis.members.length || new Set(axis.members).size !== axis.members.length
      || axis.minimum !== 0.8 || result?.minimum !== 0.8 || !same(result?.applicable, axis.members)
      || !Array.isArray(result?.moved) || new Set(result.moved).size !== result.moved.length
      || result.moved.some((id) => !axis.members.includes(id)) || result.moved.length / axis.members.length < 0.8) {
      errors.push(`axis floor/population failure: ${axis.axis}`);
    }
  }
  const states = populations.statesControls;
  const measuredStates = measurements.statesControls;
  if (!Array.isArray(states) || !states.length || !Array.isArray(measuredStates) || states.length !== measuredStates.length
    || new Set(states.map((s) => s.id)).size !== states.length) errors.push("states-control population mismatch");
  else for (const control of states) {
    const result = measuredStates.find((s) => s.id === control.id);
    if (control.minimum !== 20 || !Array.isArray(result?.moved) || new Set(result.moved).size !== result.moved.length
      || result.moved.length < 20 || !Array.isArray(control.members)
      || result.moved.some((id) => !control.members.includes(id))) errors.push(`D1 per-control floor failure: ${control.id}`);
  }
  if (measurements.paletteOnlyNoncolorMoved !== 0 || measurements.statesOnlyShapeTypographyMoved !== 0) errors.push("axis negative controls failed");
  if (measurements.legacy?.storedRowSafety !== true || measurements.legacy?.authoringRestriction !== true
    || measurements.legacy?.resolutionCoverage !== true || measurements.legacy?.renderingConsumer !== true) errors.push("unsafe legacy data/restrictions/consumer proof");
  if (measurements.spatial?.staticFallback !== true || !same(measurements.spatial?.productiveLivePaths, [])) errors.push("excluded live spatial path exposed or static fallback missing");
}

async function v1BoundBootstrap() {
  const fs = (await import("node:fs")).default;
  const paths = await import("node:path");
  const urls = await import("node:url");
  const { createHash } = await import("node:crypto");
  const { registerHooks, syncBuiltinESMExports } = await import("node:module");
  const root = paths.resolve(process.env.GAT09_BOUND_ROOT);
  const scopePath = paths.resolve(root, process.env.GAT09_SCOPE_INPUT);
  const pin = process.env.GAT09_SCOPE_SHA256;
  const role = process.env.GAT09_BOUND_ROLE;
  const childProcess = await import("node:child_process");
  const originals = new Map(Object.entries(fs));
  let internalRead = 0;
  const raw = (name, ...args) => { internalRead += 1; try { return Reflect.apply(originals.get(name), fs, args); } finally { internalRead -= 1; } };
  const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
  const portablePath = (absolute) => paths.relative(root, absolute).split(paths.sep).join("/") || ".";
  const inside = (absolute) => absolute === root || (!paths.relative(root, absolute).startsWith(".." + paths.sep)
    && paths.relative(root, absolute) !== ".." && !paths.isAbsolute(paths.relative(root, absolute)));
  const failures = new Set();
  const absences = new Set();
  const edges = new Map();
  const children = [];
  const runtimeExecutables = [];
  const entries = new Map();
  const directories = new Map();
  const observedDirectories = new Set();
  const fail = (message) => { failures.add(message); const error = new Error(message); error.stack = error.message; throw error; };
  const event = (kind, target, parent = null) => {
    const edge = { kind, from: parent, to: target };
    edges.set(JSON.stringify(edge), edge);
  };
  const scopeBytes = raw("readFileSync", scopePath);
  if (!inside(scopePath) || hash(scopeBytes) !== pin) fail("reviewed scoped input hash mismatch in bound process");
  const input = JSON.parse(scopeBytes);
  const contextEntry = input.bindings.inputs.find((entry) => entry.path === input.authorityContextPath);
  const contextBytes = raw("readFileSync", paths.resolve(root, input.authorityContextPath));
  if (!contextEntry || hash(contextBytes) !== contextEntry.sha256 || contextBytes.length !== contextEntry.bytes) fail("authority context hash mismatch");
  const authorityContext = JSON.parse(contextBytes);
  const executablePins = new Map();
  const commandProviders = new Map();
  for (const executable of authorityContext.executables) {
    if (!paths.isAbsolute(executable.path)) fail("runtime executable pin must be absolute");
    const resolvedPath = raw("realpathSync", executable.path);
    const bytes = raw("readFileSync", resolvedPath);
    if (hash(bytes) !== executable.sha256 || bytes.length !== executable.bytes) fail("runtime executable hash mismatch: " + executable.path);
    const previous = executablePins.get(resolvedPath);
    if (previous && (previous.sha256 !== executable.sha256 || previous.bytes !== executable.bytes)) fail("conflicting runtime executable pin: " + resolvedPath);
    const entry = { ...executable, resolvedPath };
    executablePins.set(resolvedPath, entry);
    runtimeExecutables.push(entry);
  }
  function executableAtLaunch(path) {
    if (typeof path !== "string" || !paths.isAbsolute(path)) return fail("unbound command executable: " + path);
    const resolvedPath = raw("realpathSync", path);
    const entry = executablePins.get(resolvedPath);
    if (!entry) return fail("unbound command executable: " + path);
    if (raw("realpathSync", entry.path) !== entry.resolvedPath) fail("runtime executable redirected: " + entry.path);
    const bytes = raw("readFileSync", resolvedPath);
    if (hash(bytes) !== entry.sha256 || bytes.length !== entry.bytes) fail("runtime executable hash mismatch at launch: " + path);
    return { entry, bytes };
  }
  executableAtLaunch(process.execPath);
  function commandProvider(binding) {
    const { entry, bytes } = executableAtLaunch(binding.executable);
    const signature = bytes.subarray(0, 4).toString("hex");
    const native = ["7f454c46", "feedface", "cefaedfe", "feedfacf", "cffaedfe", "cafebabe", "bebafeca", "cafebabf", "bfbafeca"].includes(signature);
    if (!native) fail("script command provider refused: interpreter and dependency closure unavailable");
    if (bytes.length !== 3603952 || hash(bytes) !== "344a7297ad66085daaf5faafcba9da1f12f5baa0e97f8d379fee884cf9d65a66") {
      fail("unsupported command provider identity: approved Git implementation required; interpreter/loader providers refused");
    }
    const args = binding.args;
    const revision = Array.isArray(args) && args.length === 2 && args.at(0) === "rev-parse" && args.at(1) === "HEAD";
    const rootQuery = Array.isArray(args) && args.length === 4 && args.at(0) === "-C" && paths.isAbsolute(args.at(1)) && args.at(2) === "rev-parse" && args.at(3) === "--show-toplevel";
    const archiveRead = Array.isArray(args) && args.length === 4 && args.at(0) === "-C" && paths.isAbsolute(args.at(1)) && args.at(2) === "show" && /^[a-f0-9]{40}:[^\0]+$/u.test(args.at(3));
    if (binding.command !== "git" || !(revision || rootQuery || archiveRead)) fail("unsupported command provider or interpreter/loader invocation");
    const previous = commandProviders.get(binding.executable);
    if (previous && previous !== entry.resolvedPath) fail("command executable redirected: " + binding.executable);
    commandProviders.set(binding.executable, entry.resolvedPath);
    return entry.resolvedPath;
  }
  for (const binding of authorityContext.commands) commandProvider(binding);
  const external = new Map(authorityContext.files.map((entry) => [entry.path, entry]));
  const sourceContexts = new Map();
  const implementationPaths = ["scripts/maintain/roadmap/status/index.mjs", "packages/core/scripts/libraries/archive/index.mjs", "packages/core/scripts/libraries/archive/units/index.mjs"];
  for (const path of implementationPaths) {
    sourceContexts.set(urls.pathToFileURL(paths.resolve(authorityContext.root, path)).href, path);
  }
  for (const path of [...(input.absentDependencies ?? []), ...authorityContext.absent]) {
    if (raw("existsSync", paths.resolve(root, path))) fail("dependency absence hash mismatch: " + path);
    absences.add(path);
  }
  for (const entry of Object.values(input.bindings).flat()) {
    const previous = entries.get(entry.path);
    if (previous && (previous.sha256 !== entry.sha256 || previous.bytes !== entry.bytes)) fail("conflicting dependency binding: " + entry.path);
    entries.set(entry.path, entry);
  }
  entries.set(portablePath(scopePath), { path: portablePath(scopePath), bytes: scopeBytes.length, sha256: pin });
  for (const entry of entries.values()) {
    const absolute = paths.resolve(root, entry.path);
    if (!inside(absolute) || !inside(raw("realpathSync", absolute))) fail("dependency escapes declared candidate root: " + entry.path);
    let child = entry.path;
    let directory = paths.posix.dirname(child);
    while (true) {
      if (!directories.has(directory)) directories.set(directory, new Set());
      directories.get(directory).add(paths.posix.basename(child));
      if (directory === ".") break;
      child = directory; directory = paths.posix.dirname(directory);
    }
  }
  function verify(entry) {
    const absolute = paths.resolve(root, entry.path);
    if (!inside(raw("realpathSync", absolute))) fail("dependency redirected outside candidate: " + entry.path);
    const bytes = raw("readFileSync", absolute);
    if (bytes.length !== entry.bytes || hash(bytes) !== entry.sha256) fail("dependency file hash mismatch: " + entry.path);
    return bytes;
  }
  function check(target, kind = "read") {
    if (target === 0 && kind === "read") return null;
    if (typeof target === "number") return fail("unbound dependency file descriptor: " + target);
    const absolute = paths.resolve(target instanceof URL ? urls.fileURLToPath(target) : Buffer.isBuffer(target) ? target.toString() : target);
    const relative = portablePath(absolute);
    if (kind === "metadata" && runtimeExecutables.some((entry) => entry.path === absolute || entry.resolvedPath === absolute)) {
      const { entry } = executableAtLaunch(absolute);
      event("executable-metadata", entry.resolvedPath); return entry;
    }
    if (!inside(absolute)) {
      const entry = external.get(absolute);
      if (entry) {
        const bytes = raw("readFileSync", absolute);
        if (bytes.length !== entry.bytes || hash(bytes) !== entry.sha256) return fail("external data dependency hash mismatch: " + absolute);
        event(kind, absolute); return entry;
      }
      if (kind === "metadata" && absences.has(absolute) && !raw("existsSync", absolute)) { event("absent", absolute); return null; }
      if (kind === "metadata" && authorityContext.directories.includes(absolute)) { event(kind, absolute); return null; }
      return fail("unbound dependency outside candidate: " + absolute);
    }
    const entry = entries.get(relative);
    if (entry) { verify(entry); event(kind, relative); return entry; }
    if (directories.has(relative) && kind === "metadata") { event(kind, relative); return null; }
    if (kind === "metadata" && absences.has(relative) && !raw("existsSync", absolute)) { event("absent", relative); return null; }
    return fail("unbound dependency: " + relative);
  }
  function recheck() {
    for (const executable of runtimeExecutables) {
      try {
        if (raw("realpathSync", executable.path) !== executable.resolvedPath) failures.add("runtime executable redirected: " + executable.path);
        const bytes = raw("readFileSync", executable.resolvedPath);
        if (hash(bytes) !== executable.sha256 || bytes.length !== executable.bytes) failures.add("runtime executable mutated: " + executable.path);
      }
      catch { failures.add("runtime executable unreadable: " + executable.path); }
    }
    for (const [path, resolvedPath] of commandProviders) {
      try { if (raw("realpathSync", path) !== resolvedPath) failures.add("command executable redirected: " + path); }
      catch { failures.add("command executable unreadable: " + path); }
    }
    for (const directory of observedDirectories) {
      const actual = raw("readdirSync", paths.resolve(root, directory)).sort();
      if (JSON.stringify(actual) !== JSON.stringify([...directories.get(directory)].sort())) failures.add("dependency directory mutated: " + directory);
    }
    for (const entry of external.values()) {
      try { const bytes = raw("readFileSync", entry.path); if (bytes.length !== entry.bytes || hash(bytes) !== entry.sha256) failures.add("external dependency mutated: " + entry.path); }
      catch (error) { failures.add("external dependency unreadable: " + entry.path); }
    }
    for (const path of absences) if (raw("existsSync", paths.resolve(root, path))) failures.add("dependency absence mutated: " + path);
    for (const entry of entries.values()) {
      try { verify(entry); } catch (error) { failures.add(error.message); }
    }
  }
  recheck();
  if (failures.size) fail([...failures].join("; "));
  const closure = [...entries.values()].sort((a,b) => a.path.localeCompare(b.path));
  const closureSha256 = hash(JSON.stringify(closure));
  process.on("exit", () => {
    recheck();
    if (failures.size) process.exitCode = 1;
    const receipt = { role, environment: { HOME: root, CI: "1", TZ: "America/New_York", GIT_OPTIONAL_LOCKS: "0", NODE_OPTIONS: null }, closure, children, runtimeExecutables, externalData: [...external.values()], authorityContextSha256: contextEntry.sha256, closureSha256, finalClosureSha256: failures.size ? null : closureSha256,
      edges: [...edges.values()].sort((a,b) => JSON.stringify(a).localeCompare(JSON.stringify(b))), errors: [...failures].sort() };
    raw("writeSync", 3, JSON.stringify(receipt));
  });
  registerHooks({
    resolve(specifier, context, nextResolve) {
      if (context.parentURL?.startsWith("file:") && inside(urls.fileURLToPath(context.parentURL))) {
        let directory = paths.dirname(urls.fileURLToPath(context.parentURL));
        const bare = !specifier.startsWith(".") && !specifier.startsWith("/") && !specifier.includes(":");
        const packageName = specifier.startsWith("@") ? specifier.split("/").slice(0,2).join("/") : specifier.split("/").at(0);
        while (inside(directory)) {
          const candidates = [paths.join(directory, "package.json")];
          if (bare) candidates.push(paths.join(directory, "node_modules", packageName, "package.json"));
          for (const candidate of candidates) {
            if (raw("existsSync", candidate)) check(candidate, "resolution-data");
            else { const absent = portablePath(candidate); absences.add(absent); event("absent", absent); }
          }
          if (directory === root) break;
          directory = paths.dirname(directory);
        }
      }
      let resolved = nextResolve(specifier, context);
      if (resolved.url.startsWith("node:")) {
        if (["node:module", "node:vm", "node:worker_threads", "node:net", "node:http", "node:https", "node:http2", "node:tls", "node:dgram", "node:dns", "node:inspector"].some((name) => resolved.url === name || resolved.url.startsWith(name + "/"))) fail("unbound executable capability: " + resolved.url);
        return resolved;
      }
      const status = "scripts/maintain/roadmap/status/index.mjs";
      if (resolved.url === urls.pathToFileURL(paths.resolve(root, status)).href) {
        resolved = { ...resolved, url: urls.pathToFileURL(paths.resolve(authorityContext.root, status)).href };
      }
      if (sourceContexts.has(resolved.url)) {
        const path = sourceContexts.get(resolved.url); verify(entries.get(path));
        event("bound-source-context", path, resolved.url); return resolved;
      }
      if (!resolved.url.startsWith("file:")) return fail("unbound executable URL: " + resolved.url);
      let packageDirectory = paths.dirname(urls.fileURLToPath(resolved.url));
      while (inside(packageDirectory)) {
        const metadata = paths.join(packageDirectory, "package.json");
        if (raw("existsSync", metadata)) check(metadata, "resolution-data");
        else { const absent = portablePath(metadata); absences.add(absent); event("absent", absent); }
        if (packageDirectory === root) break;
        packageDirectory = paths.dirname(packageDirectory);
      }
      check(new URL(resolved.url), "import");
      event("import", portablePath(urls.fileURLToPath(resolved.url)), context.parentURL?.startsWith("file:") ? portablePath(urls.fileURLToPath(context.parentURL)) : null);
      return resolved;
    },
    load(url, context, nextLoad) {
      if (url.startsWith("node:")) return nextLoad(url, context);
      if (sourceContexts.has(url)) {
        const path = sourceContexts.get(url); const bytes = verify(entries.get(path));
        event("load", path, url);
        return { format: "module", source: bytes, shortCircuit: true };
      }
      const absolute = urls.fileURLToPath(url);
      if (!inside(absolute)) return fail("executable dependency outside candidate: " + absolute);
      const entry = check(new URL(url), "load");
      let loaded;
      internalRead += 1;
      try { loaded = nextLoad(url, context); } finally { internalRead -= 1; }
      const source = typeof loaded.source === "string" ? Buffer.from(loaded.source) : loaded.source;
      if (!source || hash(source) !== entry.sha256) fail("executed-source/declared-source mismatch: " + entry.path);
      return loaded;
    },
  });
  for (const name of Object.keys(fs)) {
    if (typeof Reflect.get(fs, name) !== "function") continue;
    if (/^(readFile|stat|lstat|access|realpath|exists)/u.test(name)) {
      const original = originals.get(name);
      Reflect.set(fs, name, function(target, ...args) {
        if (internalRead) return raw(name, target, ...args);
        check(target, name.startsWith("readFile") ? "read" : "metadata");
        if (name.startsWith("readFile") && target !== 0) {
          const entry = check(target, "read");
          const absolute = target instanceof URL ? urls.fileURLToPath(target) : paths.resolve(target);
          const bytes = raw("readFileSync", absolute);
          if (hash(bytes) !== entry.sha256 || bytes.length !== entry.bytes) fail("dependency read bytes hash mismatch: " + entry.path);
          const option = args.at(0);
          const encoding = typeof option === "string" ? option : option?.encoding;
          const value = encoding ? bytes.toString(encoding) : bytes;
          if (name === "readFileSync") return value;
          const callback = args.at(-1); queueMicrotask(() => callback(null, value)); return;
        }
        return raw(name, target, ...args);
      });
    } else if (/^readdir/u.test(name)) {
      Reflect.set(fs, name, function(target, ...args) {
        const absolute = paths.resolve(target instanceof URL ? urls.fileURLToPath(target) : target);
        const relative = portablePath(absolute);
        const expected = directories.get(relative);
        if (!inside(absolute) || !expected) return fail("unbound dependency directory: " + relative);
        const names = raw("readdirSync", absolute).sort();
        if (JSON.stringify(names) !== JSON.stringify([...expected].sort())) return fail((/^packages\/core\/(?:src|contracts|dist|artifacts|styles)(?:\/|$)/u.test(relative) ? "complete candidate file population mismatch; " : "") + "unbound dependency directory population: " + relative);
        observedDirectories.add(relative);
        event("directory", relative);
        return raw(name, target, ...args);
      });
    } else if (/^(open|read|createReadStream|opendir)/u.test(name)) {
      Reflect.set(fs, name, (...args) => internalRead ? raw(name, ...args) : fail("unsupported untracked dependency access: fs." + name));
    } else if (/^(write|append|truncate|rename|unlink|rm|mkdir|rmdir|copy|cp|link|symlink|chmod|chown|utimes|mkdtemp|createWriteStream)/u.test(name)) {
      Reflect.set(fs, name, () => fail("dependency mutation refused: fs." + name));
    }
  }
  for (const name of Object.keys(fs.promises)) {
    if (typeof Reflect.get(fs.promises, name) !== "function") continue;
    const original = Reflect.get(fs.promises, name);
    if (/^(readFile|stat|lstat|access|realpath)/u.test(name)) {
      Reflect.set(fs.promises, name, async function(target, ...args) {
        check(target, name === "readFile" ? "read" : "metadata");
        if (name === "readFile") return fs.readFileSync(target, ...args);
        const result = await Reflect.apply(original, fs.promises, [target, ...args]);
        check(target, "metadata"); return result;
      });
    } else Reflect.set(fs.promises, name, () => fail("unsupported untracked dependency access: fs.promises." + name));
  }
  {
    const originalSpawn = childProcess.default.spawnSync;
    childProcess.default.spawnSync = function(command, args, options = {}) {
      if (options.shell || options.argv0) fail("command shell/loader redirection refused");
      if (command === process.execPath && args.includes("--experimental-permission") && args.includes("--import")
        && options.env?.GAT09_BOUND_ROOT === root && options.env?.GAT09_SCOPE_SHA256 === pin && role === "certifier") {
        const { entry } = executableAtLaunch(command);
        return originalSpawn(entry.resolvedPath, args, options);
      }
      if (["node", process.execPath].includes(command)) {
        if (!Array.isArray(args) || !args.length || args.at(0).startsWith("-") || args.some((part) => /^(?:--import|--loader|--experimental-loader|--eval|--require|-e|-r|-p|--print)(?:=|$)/u.test(part))) fail("unbound nested executable command");
        check(paths.resolve(root, args.at(0)), "nested-entry");
        const preload = "data:text/javascript," + encodeURIComponent("await (" + v1BoundBootstrap.toString() + ")();");
        const files = [...entries.values()].map((entry) => paths.resolve(root, entry.path));
        const allowed = [...files, ...absences, ...external.keys(), ...runtimeExecutables.flatMap((entry) => [entry.path, entry.resolvedPath]), root];
        const flags = ["--no-warnings", "--experimental-permission", "--allow-child-process", ...allowed.map((path) => "--allow-fs-read=" + paths.resolve(root,path)), "--import", preload];
        const { entry } = executableAtLaunch(process.execPath);
        const result = originalSpawn(entry.resolvedPath, [...flags, ...args], { ...options, cwd: root, encoding: "utf8", stdio: ["pipe","pipe","pipe","pipe"],
          env: { PATH: paths.dirname(process.execPath), HOME: root, CI: "1", TZ: "America/New_York", GIT_OPTIONAL_LOCKS: "0", GAT09_BOUND_ROOT: root, GAT09_SCOPE_INPUT: process.env.GAT09_SCOPE_INPUT, GAT09_SCOPE_SHA256: pin, GAT09_BOUND_ROLE: "nested" } });
        let receipt; try { receipt = JSON.parse(result.output?.at(3)); } catch { fail("missing nested dependency receipt"); }
        children.push(receipt);
        if (receipt.errors.length || receipt.finalClosureSha256 !== receipt.closureSha256) fail("nested dependency execution refused: " + receipt.errors.join("; "));
        return result;
      }
      const binding = authorityContext.commands.find((entry) => entry.command === command && entry.cwd === paths.resolve(options.cwd ?? process.cwd()) && JSON.stringify(entry.args) === JSON.stringify(args));
      if (!binding) return fail("unbound command data dependency: " + command + " " + JSON.stringify(args));
      const executable = commandProvider(binding);
      // Git uses git-<builtin> argv[0] names for dispatch, even with approved bytes.
      const result = originalSpawn(executable, args, { ...options, shell: false, argv0: "git", env: { PATH: authorityContext.commandPath, GIT_OPTIONAL_LOCKS: "0", HOME: root } });
      commandProvider(binding);
      if (result.status !== binding.status || hash(result.stdout ?? "") !== binding.stdoutSha256 || hash(result.stderr ?? "") !== binding.stderrSha256) fail("command data dependency hash mismatch");
      event("command-data", binding.stdoutSha256, command + " " + JSON.stringify(args));
      return result;
    };
    const forbiddenProcessMethods = ["exec", "execSync", "execFile", "execFileSync", "spawn", "fork"];
    for (const name of forbiddenProcessMethods) Reflect.set(childProcess.default, name, () => fail("untracked child process capability: " + name));
  }
  {
    globalThis.fetch = () => fail("unbound network data dependency");
    globalThis.WebSocket = () => fail("unbound network data dependency");
    process.getBuiltinModule = () => fail("untracked builtin module capability");
    process.binding = () => fail("untracked native binding capability");
  }
  syncBuiltinESMExports();
  Object.defineProperty(globalThis, "__gat09BoundExecution", { value: Object.freeze({ role, root, pin }), configurable: false });
}

function v1BoundEnvironment(root, scopeInputPath, reviewedInputSha256, role) {
  return { PATH: dirname(process.execPath), HOME: root, TZ: "America/New_York", CI: "1", GIT_OPTIONAL_LOCKS: "0",
    GAT09_BOUND_ROOT: root, GAT09_SCOPE_INPUT: scopeInputPath, GAT09_SCOPE_SHA256: reviewedInputSha256, GAT09_BOUND_ROLE: role };
}

function v1ExecuteBound({ root, scopeInputPath, reviewedInputSha256, role, command, input }) {
  const plan = JSON.parse(v1File(root, scopeInputPath));
  if (sha256(v1File(root, scopeInputPath)) !== reviewedInputSha256) throw new Error("reviewed scoped input hash mismatch");
  const entries = Object.values(plan.bindings).flat();
  const context = JSON.parse(v1File(root, plan.authorityContextPath));
  const paths = [...new Set([...entries.map((entry) => resolve(root, entry.path)), resolve(root, scopeInputPath)])].sort();
  const preload = "data:text/javascript," + encodeURIComponent("await (" + v1BoundBootstrap.toString() + ")();");
  const permissions = ["--no-warnings", "--experimental-permission", ...paths.map((path) => "--allow-fs-read=" + path),
    ...(plan.absentDependencies ?? []).map((path) => "--allow-fs-read=" + resolve(root, path))];
  permissions.push("--allow-child-process", "--allow-fs-read=" + root, ...context.files.map((entry) => "--allow-fs-read=" + entry.path), ...context.executables.flatMap((entry) => [entry.path, realpathSync(entry.path)]).map((path) => "--allow-fs-read=" + path), ...context.absent.map((path) => "--allow-fs-read=" + path), ...context.directories.map((path) => "--allow-fs-read=" + path));
  const result = spawnSync(process.execPath, [...permissions, "--import", preload, ...command], {
    cwd: root, encoding: "utf8", timeout: 60_000, maxBuffer: 32 * 1024 * 1024,
    input, stdio: ["pipe", "pipe", "pipe", "pipe"],
    env: v1BoundEnvironment(root, scopeInputPath, reviewedInputSha256, role),
  });
  let dependencyGraph;
  try { dependencyGraph = JSON.parse(result.output?.at(3)); } catch { dependencyGraph = null; }
  const errors = [];
  if (!dependencyGraph || dependencyGraph.role !== role || dependencyGraph.errors.length
    || dependencyGraph.finalClosureSha256 !== dependencyGraph.closureSha256) errors.push("bound dependency execution refused: " + (dependencyGraph?.errors.join("; ") || result.stderr || result.error?.message || "missing dependency receipt"));
  if (dependencyGraph) {
    const wanted = new Map(entries.map((entry) => [entry.path, entry]));
    const scopeBytes = v1File(root, scopeInputPath);
    wanted.set(scopeInputPath, { path: scopeInputPath, bytes: scopeBytes.length, sha256: reviewedInputSha256 });
    if (!same(dependencyGraph.closure, [...wanted.values()].sort((a,b) => a.path.localeCompare(b.path)))) errors.push("executed dependency closure differs from the reviewed closure");
  }
  for (const entry of entries) {
    try {
      const bytes = v1File(root, entry.path);
      if (bytes.length !== entry.bytes || sha256(bytes) !== entry.sha256) errors.push("dependency mutated during proof: " + entry.path);
    } catch (error) { errors.push("dependency mutated during proof: " + entry.path + ": " + error.message); }
  }
  if (sha256(v1File(root, scopeInputPath)) !== reviewedInputSha256) errors.push("scope plan mutated during proof");
  return { result, dependencyGraph, errors };
}

function v1ScopedRun({ root, scopeInputPath, reviewedInputSha256, asOf }) {
  const errors = [];
  const inputBytes = v1File(root, scopeInputPath);
  if (!/^[a-f0-9]{64}$/u.test(reviewedInputSha256 ?? "") || sha256(inputBytes) !== reviewedInputSha256) throw new Error("reviewed scoped input hash mismatch");
  const input = JSON.parse(inputBytes.toString("utf8"));
  exactKeys(input, ["schemaVersion", "scope", "decisionRef", "bindings", "digests", "populationPath", "exclusions", "clauseEvidence", "harnessPath", "absentDependencies", "authorityContextPath"], "V1 scope input", errors);
  if (input.schemaVersion !== 1 || input.scope !== V1_SCOPE || input.decisionRef !== V1_OWNER_DECISION) errors.push("invalid V1 scope/decision reference");
  if (!Array.isArray(input.exclusions) || new Set(input.exclusions.map((e) => e.id)).size !== input.exclusions.length
    || input.exclusions.some((exclusion) => !V1_EXCLUSIONS.some((allowed) => same(exclusion, allowed)))) errors.push("unlisted or changed V1 clause exclusion");
  const groups = ["candidate", "inputs", "harness", "artifacts", "population"];
  exactKeys(input.bindings, groups, "V1 bindings", errors);
  exactKeys(input.digests, groups, "V1 digests", errors);
  for (const group of groups) {
    const entries = Reflect.get(input.bindings ?? {}, group);
    if (!Array.isArray(entries) || !entries.length) { errors.push(`missing ${group} binding manifest`); continue; }
    const paths = entries.map((e) => e.path);
    if (new Set(paths).size !== paths.length || !same(paths, [...paths].sort())) errors.push(`${group} manifest must be unique and sorted`);
    for (const entry of entries) {
      exactKeys(entry, ["path", "sha256", "bytes"], `${group} binding`, errors);
      const bytes = v1File(root, entry.path);
      if (bytes.length !== entry.bytes || sha256(bytes) !== entry.sha256) errors.push(`${group} file hash mismatch: ${entry.path}`);
    }
    if (sha256(canonicalJson(entries)) !== Reflect.get(input.digests ?? {}, group)) errors.push(`${group} digest mismatch`);
  }
  const candidatePaths = input.bindings.candidate.map((e) => e.path);
  const requiredCandidate = ["packages/core/src", "packages/core/contracts", "packages/core/dist", "packages/core/artifacts", "packages/core/styles", "packages/core/package.json", "pnpm-lock.yaml"]
    .flatMap((path) => v1FilesBelow(root, path)).sort();
  if (!same(candidatePaths, requiredCandidate)) errors.push("complete candidate file population mismatch");
  const registry = JSON.parse(v1File(root, ROADMAP_REGISTRY_PATH));
  errors.push(...validateRegistryMutationIntegrity(registry, { today: asOf }));
  errors.push(...validateV1PhaseMapping(registry));
  for (const w of registry.workOrders) {
    if (w.status === "done" && input.exclusions.some((exclusion) => exclusion.wo === w.id)) errors.push(`${w.id}: false full-WO completion while its clauses remain excluded`);
  }
  const clauses = discoverV1Clauses({ repoRoot: root, registry, exclusions: input.exclusions });
  const inputPaths = input.bindings.inputs.map((e) => e.path);
  const requiredInputs = ["pnpm-workspace.yaml", ROADMAP_REGISTRY_PATH, "roadmap/README.md", ...new Set(clauses.map((c) => c.path))];
  if (requiredInputs.some((path) => !inputPaths.includes(path))) errors.push("scope inputs omit a registry/lane/owner contract");
  const ownerSource = v1File(root, "roadmap/README.md").toString("utf8");
  if (!ownerSource.includes("Owner-approved V1 scope and parallel delivery — 2026-10-27")) errors.push("approved V1 owner section missing");
  const harnessPaths = input.bindings.harness.map((e) => e.path);
  if (![V1_STATUS_SCRIPT, V1_CERTIFIER, ...V1_CERTIFIER_IMPORTS, input.harnessPath].every((path) => harnessPaths.includes(path))) errors.push("harness closure omits certifier/status/executor source");
  if (typeof input.harnessPath !== "string" || !input.harnessPath.endsWith(".mjs")) errors.push("V1 harness must be a reviewed node assertion module");
  if (!input.bindings.population.some((e) => e.path === input.populationPath)) errors.push("population file is not bound");
  const populations = JSON.parse(v1File(root, input.populationPath));
  const namedExclusions = { ret06: V1_RET06_NAMES, ret04: V1_RET04_NAMES };
  if (!same(populations.namedExclusions, namedExclusions)) errors.push("unlisted RET-04/RET-06 physical/consumer exclusion");
  const populationDigest = sha256(canonicalJson({ clauses, populations, exclusions: input.exclusions }));
  const bindings = { ...input.digests, clauses: populationDigest, scopeInput: reviewedInputSha256 };
  const records = input.clauseEvidence;
  if (!Array.isArray(records) || records.length !== clauses.length
    || new Set(records.map((r) => r.clauseId)).size !== clauses.length) errors.push("missing/duplicate/unlisted retained clause evidence");
  const allAssertionIds = [];
  for (const clause of clauses) {
    const record = Array.isArray(records) ? records.find((r) => r.clauseId === clause.id) : null;
    if (!record || record.sha256 !== clause.sha256 || !Array.isArray(record.assertionIds) || !record.assertionIds.length
      || record.assertionIds.some((id) => typeof id !== "string" || !id)) errors.push(`missing retained clause: ${clause.id}`);
    else allAssertionIds.push(...record.assertionIds);
  }
  if (new Set(allAssertionIds).size !== allAssertionIds.length) errors.push("assertion identities must be unique per retained clause");
  const staticReport = buildStaticCertification({ repoRoot: root, asOf });
  errors.push(...staticReport.errors);
  if (staticReport.unsupportedClaims.length) errors.push("unsupported public completeness claim retained in V1");
  const boundPaths = new Set(Object.values(input.bindings).flatMap((entries) => entries.map((e) => e.path)));
  if (staticReport.inputManifest.some((entry) => entry.missing || !boundPaths.has(entry.path))) errors.push("public/inherited certification input is outside the reviewed binding closure");
  const fullProgrammeBlockers = [
    ...staticReport.errors, ...staticReport.pending,
    ...validateGat09CompletionBarrier(registry, { today: asOf }),
    ...registry.workOrders.filter((w) => w.status !== "done").map((w) => `${w.id}: full WO is ${w.status}`),
  ];
  const results = [];
  const executableCommands = [
    { repository: "ui-design-system", command: [process.execPath, GAT07_SCRIPT_PATH, "--check-artifact"] },
    ...staticReport.executableCommands,
  ];
  for (const evidence of executableCommands) {
    const command = evidence.command;
    if (evidence.repository !== "ui-design-system" || !["node", process.execPath].includes(command.at(0))
      || !harnessPaths.includes(command.at(1)) || command.some((part) => ["-e", "--eval", "-p", "--print"].includes(part))) {
      errors.push("scoped public executable proof is outside the reviewed DS harness closure");
    }
  }
  if (!errors.length) {
    for (const evidence of executableCommands) {
      const execution = v1ExecuteBound({ root, scopeInputPath, reviewedInputSha256,
        role: "inherited/public", command: evidence.command.slice(1) });
      const { result, dependencyGraph } = execution;
      errors.push(...execution.errors);
      results.push({ command: evidence.command, dependencyGraph, status: result.status, signal: result.signal,
        stdoutSha256: sha256(result.stdout ?? ""), stderrSha256: sha256(result.stderr ?? "") });
      if (result.status !== 0 || result.error) errors.push("live GAT-07 or public executable evidence failed");
    }
  }
  if (!errors.length) {
    const execution = v1ExecuteBound({ root, scopeInputPath, reviewedInputSha256,
      role: "clause", command: [resolve(root, input.harnessPath)],
      input: canonicalJson({ scope: V1_SCOPE, bindings, clauses, populations }) });
    const { result, dependencyGraph } = execution;
    errors.push(...execution.errors);
    results.push({ path: input.harnessPath, dependencyGraph, status: result.status, signal: result.signal, stdoutSha256: sha256(result.stdout ?? ""), stderrSha256: sha256(result.stderr ?? "") });
    if (result.status !== 0 || result.error) errors.push("scoped clause executable evidence failed");
    else {
      let evidence;
      try { evidence = JSON.parse(result.stdout); } catch { errors.push("scoped harness returned malformed evidence"); }
      if (evidence) {
        if (!same(evidence.bindings, bindings)) errors.push("executed artifact/input/harness/population binding mismatch");
        const assertions = evidence.assertions;
        if (!Array.isArray(assertions) || assertions.length !== allAssertionIds.length
          || new Set(assertions.map((a) => a.id)).size !== assertions.length) errors.push("executed clause assertion cardinality mismatch");
        for (const record of records) for (const id of record.assertionIds) {
          const assertion = Array.isArray(assertions) ? assertions.find((a) => a.id === id) : null;
          if (assertion?.clauseId !== record.clauseId || assertion?.passed !== true) errors.push(`retained clause executable assertion failed: ${record.clauseId}/${id}`);
        }
        validateV1Measurements(evidence.measurements, populations, errors);
      }
    }
  }
  for (const group of groups) for (const entry of Reflect.get(input.bindings, group)) {
    try {
      const bytes = v1File(root, entry.path);
      if (bytes.length !== entry.bytes || sha256(bytes) !== entry.sha256) errors.push(`input mutated during proof: ${entry.path}`);
    } catch (error) { errors.push(`input mutated during proof: ${entry.path}: ${error.message}`); }
  }
  if (sha256(v1File(root, scopeInputPath)) !== reviewedInputSha256) errors.push("scope plan mutated during proof");
  const proofPassed = errors.length === 0;
  const mixed = new Set(input.exclusions.map((e) => e.wo));
  const dependencyHolds = [];
  for (const w of registry.workOrders) {
    if (w.status === "done") continue;
    if (V1_HOLDS.has(w.id) && proofPassed) dependencyHolds.push({ id: w.id, substantiveV1ProofPassed: true, fullDependencies: w.dependsOn });
    else if (!mixed.has(w.id)) errors.push(`${w.id}: retained V1 authority remains open${V1_HOLDS.has(w.id) ? "; substantive proof has not passed" : ""}`);
  }
  return { scope: V1_SCOPE, bindings, populationDigest, clauses, exclusions: input.exclusions,
    publicCertificationInputs: { inputDigest: staticReport.inputDigest, inputManifest: staticReport.inputManifest },
    namedExclusions, executedEvidence: results, dependencyHolds, fullProgrammeBlockers: [...new Set([...fullProgrammeBlockers, ...errors])],
    counts: { workOrders: registry.workOrders.length, done: registry.workOrders.filter((w) => w.status === "done").length }, errors };
}

function scopedFailureBlockers(root, asOf) {
  try {
    const registry = JSON.parse(v1File(root, ROADMAP_REGISTRY_PATH));
    const blockers = registry.workOrders.filter((w) => w.status !== "done").map((w) => `${w.id}: full WO is ${w.status}`);
    try {
      const report = buildStaticCertification({ repoRoot: root, asOf });
      return [...report.errors, ...report.pending, ...validateGat09CompletionBarrier(registry, { today: asOf }), ...blockers];
    } catch (error) { return [...blockers, "full-programme inputs invalid: " + error.message]; }
  } catch (error) { return ["full-programme inputs invalid: " + error.message]; }
}

function auditScopedV1Local({ repoRoot, scopeInputPath, reviewedInputSha256, asOf, currentDate }) {
  const root = resolve(repoRoot ?? DEFAULT_REPO_ROOT);
  let first;
  let second;
  try {
    first = v1ScopedRun({ root, scopeInputPath, reviewedInputSha256, asOf });
    second = v1ScopedRun({ root, scopeInputPath, reviewedInputSha256, asOf });
  } catch (error) {
    return { mode: "v1", scope: V1_SCOPE, passed: false, completionEligible: false, workOrdersClosed: 0,
      errors: [error.message], executedEvidence: first?.executedEvidence ?? [], fullProgrammeBlockers: scopedFailureBlockers(root, asOf) };
  }
  const reproducibility = compareCertificationRuns(first, second);
  const errors = [...first.errors];
  if (!reproducibility.agree) errors.push("two executed V1 scoped runs disagree");
  if (asOf !== currentDate) errors.push("V1 asOf must equal the current America/New_York date");
  return { schemaVersion: 1, workOrder: "WO-GAT-09", mode: "v1", scope: V1_SCOPE, asOf,
    ...first, runtime: { node: process.version, platform: process.platform, arch: process.arch }, passed: errors.length === 0, errors, completionEligible: false, workOrdersClosed: 0,
    claimBoundaries: { workOrderComplete: false, sourceItemsClosed: [], statusAuthority: ROADMAP_REGISTRY_PATH,
      finalCertificationArtifact: false, releaseAuthorized: false }, reproducibility };
}

export function auditScopedV1(options) {
  const root = resolve(options.repoRoot ?? DEFAULT_REPO_ROOT);
  try {
    const execution = v1ExecuteBound({ root, scopeInputPath: options.scopeInputPath,
      reviewedInputSha256: options.reviewedInputSha256, role: "certifier",
      command: [resolve(root, V1_CERTIFIER), "--v1-bound-worker"], input: canonicalJson({ ...options, repoRoot: root }) });
    const { result, dependencyGraph } = execution;
    if (execution.errors.length || result.status !== 0 || result.error) {
      let partial; try { partial = JSON.parse(result.stdout); } catch { partial = null; }
      return { mode: "v1", scope: V1_SCOPE, passed: false, completionEligible: false, workOrdersClosed: 0,
        errors: [...execution.errors, ...(partial?.errors ?? []), result.status !== 0 ? "bound certifier execution failed: " + result.stderr : ""].filter(Boolean),
        executedEvidence: partial?.executedEvidence ?? [], executingImplementation: dependencyGraph,
        fullProgrammeBlockers: partial?.fullProgrammeBlockers ?? scopedFailureBlockers(root, options.asOf) };
    }
    const report = JSON.parse(result.stdout);
    return { ...report, executingImplementation: dependencyGraph };
  } catch (error) {
    return { mode: "v1", scope: V1_SCOPE, passed: false, completionEligible: false, workOrdersClosed: 0,
      errors: [error.message], fullProgrammeBlockers: scopedFailureBlockers(root, options.asOf) };
  }
}

function argumentValue(name) {
  const prefix = `${name}=`;
  const argument = process.argv.find((value) => value.startsWith(prefix));
  return argument ? argument.slice(prefix.length) : null;
}

function writeAtomic(path, bytes) {
  mkdirSync(dirname(path), { recursive: true });
  const temporary = `${path}.tmp-${String(process.pid)}`;
  writeFileSync(temporary, bytes);
  renameSync(temporary, path);
}

function runCli() {
  if (process.argv.includes("--v1-bound-worker")) {
    if (globalThis.__gat09BoundExecution?.role !== "certifier" || globalThis.__gat09BoundExecution.root !== DEFAULT_REPO_ROOT || !process.permission?.has("fs.read", SCRIPT_PATH)) throw new Error("bound certifier worker requires guarded execution");
    const options = JSON.parse(readFileSync(0, "utf8"));
    process.stdout.write(JSON.stringify(auditScopedV1Local(options)) + "\n");
    return;
  }
  const modeFlags = ["--v1", "--structural", "--final"].filter((flag) => process.argv.includes(flag));
  if (modeFlags.length > 1) throw new Error("choose exactly one GAT-09 mode");
  const mode = process.argv.includes("--v1") ? "v1" : process.argv.includes("--structural") ? "structural" : "final";
  if (mode === "v1" && (process.argv.includes("--write") || process.argv.includes("--check-artifact"))) throw new Error("scoped V1 evidence cannot write/check a final-certification artifact");
  const explicitAsOf = argumentValue("--as-of");
  const asOf = explicitAsOf || process.env.GAT09_AS_OF || currentProgramDate();
  const result = auditGat09({ mode, asOf, scopeInputPath: argumentValue("--scope-input"), reviewedInputSha256: argumentValue("--reviewed-input-sha256") });
  const bytes = `${JSON.stringify(result, null, 2)}\n`;
  const artifactPath = resolve(DEFAULT_REPO_ROOT, GAT09_ARTIFACT_PATH);
  if (process.argv.includes("--write")) {
    if (!explicitAsOf && !process.env.GAT09_AS_OF) {
      throw new Error(
        "--write requires --as-of=YYYY-MM-DD or GAT09_AS_OF for reproducible provenance"
      );
    }
    writeAtomic(artifactPath, bytes);
  }
  if (process.argv.includes("--check-artifact")) {
    if (
      !existsSync(artifactPath) ||
      readFileSync(artifactPath, "utf8") !== bytes
    ) {
      throw new Error(
        `GAT-09 artifact is stale or missing: ${GAT09_ARTIFACT_PATH}`
      );
    }
  }
  process.stdout.write(bytes);
  if (!result.passed) {
    throw new Error(
      `WO-GAT-09 is not ${
        mode === "final" ? "completion-eligible" : "structurally valid"
      }: ` +
        `${String(result.errors.length)} error(s), ${String(
          result.pending.length
        )} pending item(s)`
    );
  }
}

const invokedAsScript =
  process.argv[1] &&
  realpathSync(process.argv[1]) === realpathSync(SCRIPT_PATH);
if (invokedAsScript) {
  try {
    runCli();
  } catch (error) {
    process.stderr.write(
      `WO-GAT-09 full claim-integrity gate: FAIL\n${
        error.stack ?? error.message
      }\n`
    );
    process.exitCode = 1;
  }
}
