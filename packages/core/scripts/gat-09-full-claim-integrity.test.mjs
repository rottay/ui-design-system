import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import test from "node:test";

import {
  auditGat09,
  auditRegistryBarrier,
  classifyClaimEvidence,
  compareCertificationRuns,
  inventoryPublicClaims,
  resolveGat09Disposition,
} from "./gat-09-full-claim-integrity.mjs";

function withFixture(prefix, run) {
  const root = mkdtempSync(resolve(tmpdir(), prefix));
  try {
    return run(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

function write(path, bytes) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, bytes);
}

function writeJson(path, value) {
  write(path, `${JSON.stringify(value, null, 2)}\n`);
}

function evidenceMap(entries = []) {
  return {
    schemaVersion: 1,
    authority: "WO-GAT-09",
    purpose: "Fixture evidence metadata; never a status authority.",
    entries,
  };
}

function completeRegistry(overrides = {}) {
  const workOrders = [
    ["WO-GAT-05", "done"],
    ["WO-GAT-06", "done"],
    ["WO-GAT-07", "done"],
    ["WO-CRA-15", "done"],
    ["WO-CRA-17", "done"],
    ["WO-GAT-09", "in-progress"],
  ].map(([id, status]) => ({
    id,
    status,
    dependsOn:
      id === "WO-GAT-09"
        ? ["WO-GAT-05", "WO-GAT-06", "WO-GAT-07", "WO-CRA-15"]
        : [],
  }));
  return {
    workOrders,
    traceability: {
      "ds-improvements": {
        items: [
          {
            id: "DS-IMP-127",
            disposition: "execute",
            authority: "WO-GAT-05",
            phase: "0",
          },
          {
            id: "DS-IMP-128",
            disposition: "execute",
            authority: "WO-GAT-06",
            phase: "0",
          },
          {
            id: "DS-IMP-059",
            disposition: "execute",
            authority: "WO-GAT-07",
            phase: "0",
          },
          {
            id: "DS-IMP-106",
            disposition: "execute",
            authority: "WO-CRA-15",
            phase: "2C",
          },
          {
            id: "DS-IMP-090",
            disposition: "execute",
            authority: "WO-CRA-17",
            phase: "2B",
          },
          {
            id: "DS-IMP-060",
            disposition: "execute",
            authority: "WO-GAT-09",
            phase: "6",
          },
        ],
        phaseControls: {
          6: {
            claimState: "open",
            ownerGo: { decision: "go" },
          },
        },
      },
    },
    ...overrides,
  };
}

function writeGat07Artifact(root) {
  const semanticHash = "a".repeat(64);
  writeJson(
    resolve(root, "test-artifacts/gates/gat-07/semantic-evidence.json"),
    {
      schemaVersion: 1,
      authority: "WO-GAT-07",
      scope:
        "Phase-0 exact proof and minimal public-claim floor; not DS-IMP-060 completion",
      deterministicRuns: {
        count: 2,
        hashes: [semanticHash, semanticHash],
        agree: true,
      },
      publicClaims: {
        floor: {
          scope: "DS-IMP-060-phase-0-minimum",
          finalCertificationAuthority: "WO-GAT-09",
          claims: [],
        },
      },
    }
  );
  write(
    resolve(root, "test-artifacts/gates/gat-07/semantic-hash.txt"),
    `${semanticHash}\n`
  );
}

function writePublicCorpus(root, rootReadme) {
  write(resolve(root, "README.md"), rootReadme);
  write(resolve(root, "packages/core/README.md"), "Core package.\n");
  write(resolve(root, "packages/core/docs/TENANT_MODEL.md"), "Tenant model.\n");
  write(
    resolve(root, "packages/core/docs/structures-tier.md"),
    "Structures.\n"
  );
  write(
    resolve(root, "packages/core/docs/reference/README.md"),
    "Reference.\n"
  );
  write(resolve(root, "packages/showroom/README.md"), "Showroom.\n");
}

test("public claim inventory is deterministic, line-based and ignores fenced examples", () => {
  withFixture("gat09-claims-", (root) => {
    write(
      resolve(root, "README.md"),
      [
        "All widgets are working and complete.",
        "",
        "```md",
        "Every fake example is complete.",
        "```",
        "",
        "Everything ships.",
      ].join("\n")
    );
    const corpus = [{ kind: "file", path: "README.md" }];
    const first = inventoryPublicClaims({ repoRoot: root, corpus });
    const second = inventoryPublicClaims({ repoRoot: root, corpus });
    assert.deepEqual(first, second);
    assert.equal(first.claims.length, 2);
    assert.deepEqual(first.claims[0].terms, ["all", "complete", "working"]);
    assert.deepEqual(first.claims[1].terms, ["every"]);
    assert.match(first.claims[0].id, /^claim-[a-f0-9]{20}$/u);
  });
});

test("negative drill makes a newly injected unsupported completeness claim completion-blocking", () => {
  withFixture("gat09-negative-claim-", (root) => {
    const readme = resolve(root, "README.md");
    const consumer = resolve(root, "packages/core/src/widgets/index.ts");
    write(readme, "All widgets are working.\n");
    write(consumer, "export const allWidgetsAreWorking = true;\n");
    const corpus = [{ kind: "file", path: "README.md" }];
    const before = inventoryPublicClaims({ repoRoot: root, corpus });
    const map = evidenceMap([
      {
        claimId: before.claims[0].id,
        disposition: "supported",
        evidence: [
          {
            kind: "production-consumer",
            repository: "ui-design-system",
            path: "packages/core/src/widgets/index.ts",
            contains: "allWidgetsAreWorking",
          },
        ],
      },
    ]);
    assert.deepEqual(
      classifyClaimEvidence({
        claims: before.claims,
        evidenceMap: map,
        repoRoot: root,
      }).unsupported,
      []
    );

    write(
      readme,
      "All widgets are working.\nEvery exported hook is complete.\n"
    );
    const after = inventoryPublicClaims({ repoRoot: root, corpus });
    const result = classifyClaimEvidence({
      claims: after.claims,
      evidenceMap: map,
      repoRoot: root,
    });
    assert.equal(result.errors.length, 0);
    assert.equal(result.unsupported.length, 1);
    assert.match(
      result.unsupported[0].text,
      /Every exported hook is complete/u
    );
    assert.equal(
      resolveGat09Disposition({
        mode: "final",
        errors: result.errors,
        pending: ["unsupported claim"],
      }).passed,
      false
    );
  });
});

test("evidence cannot escape a repository or use prose as executable proof", () => {
  withFixture("gat09-evidence-", (root) => {
    write(resolve(root, "README.md"), "All widgets are working.\n");
    write(resolve(root, "proof.md"), "claim proof\n");
    const claim = inventoryPublicClaims({
      repoRoot: root,
      corpus: [{ kind: "file", path: "README.md" }],
    }).claims[0];
    const result = classifyClaimEvidence({
      claims: [claim],
      evidenceMap: evidenceMap([
        {
          claimId: claim.id,
          disposition: "supported",
          evidence: [
            {
              kind: "executable-assertion",
              repository: "ui-design-system",
              path: "proof.md",
              contains: "claim proof",
              command: ["node", "--test", "proof.md"],
            },
          ],
        },
      ]),
      repoRoot: root,
    });
    assert.match(
      result.errors.join("\n"),
      /test\/spec or scripts\/\*\.mjs assertion/u
    );
    assert.equal(result.unsupported.length, 1);
  });
});

test("dynamic registry barrier exposes open authorities and expired deferred reviews", () => {
  const registry = completeRegistry();
  registry.workOrders.find(({ id }) => id === "WO-CRA-15").status = "todo";
  registry.workOrders.find(({ id }) => id === "WO-CRA-17").status =
    "in-progress";
  registry.traceability["ds-improvements"].items.push({
    id: "DS-IMP-002",
    disposition: "deferred",
    owner: "design-system-program",
    targetPhase: "1",
    reviewBy: "2026-07-01",
    reason: "fixture",
  });
  registry.traceability["ds-improvements"].phaseControls[6] = {
    claimState: "locked",
    ownerGo: { decision: "pending" },
  };
  const result = auditRegistryBarrier({ registry, asOf: "2026-07-17" });
  assert.deepEqual(result.errors, []);
  assert.deepEqual(
    result.openAuthorities.map(({ id }) => id),
    ["WO-CRA-15", "WO-CRA-17"]
  );
  assert.deepEqual(
    result.overdueDeferred.map(({ id }) => id),
    ["DS-IMP-002"]
  );
  assert.match(result.pending.join("\n"), /Phase 6 remains locked/u);
});

test("two fresh certifications agree only when all semantic inputs agree", () => {
  const first = { claims: [{ id: "claim-a" }], revision: "a".repeat(40) };
  assert.equal(
    compareCertificationRuns(first, structuredClone(first)).agree,
    true
  );
  assert.equal(
    compareCertificationRuns(first, {
      claims: [{ id: "claim-b" }],
      revision: "a".repeat(40),
    }).agree,
    false
  );
});

test("structural mode proves the contract while final mode cannot bypass live execution", () => {
  withFixture("gat09-integral-", (root) => {
    writePublicCorpus(root, "All widgets are working.\n");
    const inventory = inventoryPublicClaims({ repoRoot: root });
    write(
      resolve(root, "packages/core/src/widgets/index.ts"),
      "export const widgetsReady = true;\n"
    );
    writeJson(
      resolve(root, "packages/core/scripts/gat-09-public-claim-evidence.json"),
      evidenceMap([
        {
          claimId: inventory.claims[0].id,
          disposition: "supported",
          evidence: [
            {
              kind: "production-consumer",
              repository: "ui-design-system",
              path: "packages/core/src/widgets/index.ts",
              contains: "widgetsReady",
            },
          ],
        },
      ])
    );
    writeJson(resolve(root, "roadmap/registry.json"), completeRegistry());
    writeGat07Artifact(root);

    const structural = auditGat09({
      repoRoot: root,
      mode: "structural",
      asOf: "2026-07-17",
      currentDate: "2026-07-17",
    });
    assert.equal(structural.passed, true);
    assert.equal(structural.completionEligible, false);
    assert.match(structural.pending.join("\n"), /structural mode/u);
    for (const count of Object.values(structural.counts).filter(
      ({ value }) => value !== undefined
    )) {
      assert.equal(typeof count.provenance, "string");
    }

    const finalWithoutExecution = auditGat09({
      repoRoot: root,
      mode: "final",
      asOf: "2026-07-17",
      currentDate: "2026-07-17",
      executeFinalEvidence: false,
    });
    assert.equal(finalWithoutExecution.passed, false);
    assert.match(
      finalWithoutExecution.pending.join("\n"),
      /explicitly disabled/u
    );

    const backdated = auditGat09({
      repoRoot: root,
      mode: "structural",
      asOf: "2026-07-16",
      currentDate: "2026-07-17",
    });
    assert.equal(backdated.passed, false);
    assert.match(backdated.errors.join("\n"), /must equal the current/u);
  });
});
