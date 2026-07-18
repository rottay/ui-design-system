#!/usr/bin/env node
/**
 * WO-GAT-09 — Phase-6 full public-claim integrity certification.
 *
 * This gate deliberately has two modes:
 *   --structural  proves the gate contract, inventory and negative posture while
 *                 reporting completion blockers as pending.
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

const SCRIPT_PATH = fileURLToPath(import.meta.url);
const HERE = dirname(SCRIPT_PATH);
const DEFAULT_REPO_ROOT = resolve(HERE, "../../..");
const EVIDENCE_MAP_PATH =
  "packages/core/scripts/gat-09-public-claim-evidence.json";
const ROADMAP_REGISTRY_PATH = "roadmap/registry.json";
const GAT07_ARTIFACT_PATH =
  "test-artifacts/gates/gat-07/semantic-evidence.json";
const GAT07_HASH_PATH = "test-artifacts/gates/gat-07/semantic-hash.txt";
const GAT09_ARTIFACT_PATH = "test-artifacts/gates/gat-09/claim-integrity.json";
const GAT07_SCRIPT_PATH = "packages/core/scripts/gat-07-exact-proof.mjs";
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
  { kind: "file", path: "packages/core/docs/TENANT_MODEL.md" },
  { kind: "file", path: "packages/core/docs/structures-tier.md" },
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
} = {}) {
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
  const mode = process.argv.includes("--structural") ? "structural" : "final";
  const explicitAsOf = argumentValue("--as-of");
  const asOf = explicitAsOf || process.env.GAT09_AS_OF || currentProgramDate();
  const result = auditGat09({ mode, asOf });
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
