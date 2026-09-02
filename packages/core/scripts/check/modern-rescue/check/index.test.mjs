import assert from "node:assert/strict";
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  renameSync as rawRenameSync,
  symlinkSync,
  writeFileSync as rawWriteFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import test from "node:test";
import { repoRoot as findRepoRoot } from '../../../libraries/repo-root/index.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const LIVE = findRepoRoot(__dirname);
const programDir = "packages/core/scripts/check/modern-rescue";

// T-1a (sandbox isolation): this file is the only mutator of the live
// manifest tree in the blocking gate cohort (F4A-close, ratified). Every
// writeFileSync/renameSync call site below stays untouched; only the three
// roots move -- from the live repo to a throwaway copy built once per module
// load -- so the 37 writes and 3 rename pairs land in the copy instead.
const SANDBOX = mkdtempSync(join(tmpdir(), "modern-rescue-program-check-"));

// The exact read-set of validateModernRescueContracts(), derived member by
// member (F4A-close pre-K4 T-1a brief). A member missing here surfaces as a
// baseline-parity difference (A-1), not a silent skip: receipts.mjs hashes a
// missing sourceBinding as the literal 'MISSING' instead of throwing, so an
// incomplete copy changes the verdict rather than crashing.
const CLOSURE_MEMBERS = [
  "pnpm-workspace.yaml",
  "AGENTS.md",
  "CLAUDE.md",
  "packages/core/package.json",
  programDir,
  "packages/core/tests/fixtures/tenants",
  "packages/core/governance/tokens/prototypes/index.json",
  "roadmap/registry.json",
  "packages/core/governance/manifest",
  "packages/core/scripts/check/evidence",
  "packages/core/scripts/check/orchestration",
  "packages/core/scripts/libraries",
  "packages/core/scripts/generate/tokens/manifest",
  "packages/core/scripts/generate/tokens/customization/surface",
  "packages/core/scripts/generate/tokens/customization/preservation",
  "packages/core/contracts/css/hooks/index.json",
  "packages/core/docs/generated/customization-controls/index.md",
  "packages/core/src",
  // T-2: the evidence tree. Without it NO F4B receipt exists inside the
  // sandbox, so every cell that names one fails to resolve it and test 1
  // reported 56 error lines -- an artefact of the copy boundary, not of the
  // manifest under test. The sandbox is a CLOSURE: a check that reads receipts
  // needs the receipts in it.
  "packages/core/artifacts/quality",
  // ...and the four build outputs those receipts DECLARE as their own source.
  // Measured, not guessed: all 39 receipts name build-stamp.json and server.js,
  // 36 name the compiled brand-theme and 3 name index.js, and nothing else of
  // dist is referenced. With the receipts present but these absent the errors
  // merely changed shape -- from "does not exist" to "source digest is stale"
  // -- which is the same copy-boundary artefact wearing a different message.
  // Listed one by one rather than as `packages/core/dist`: the whole tree is
  // 67M against ~140K for these four, and naming them keeps the sandbox's
  // dependency on build output legible instead of wholesale.
  "packages/core/dist/build-stamp.json",
  "packages/core/dist/server.js",
  "packages/core/dist/index.js",
  "packages/core/dist/infrastructure/compilers/kernel/runtime/brand-theme/index.js",
  // R-2: the committed style mirrors. The palette.seeds receipts are the first
  // to bind a FAMILY manifest (primitive/inputs/button), and that family's
  // anatomy bindings pull the button skins, which pull these three. Measured
  // rather than guessed: diffing the new receipts' sourceFiles against this
  // closure names exactly styles/{index,rottay,bithire}.css and nothing else,
  // and without them receipts.mjs hashes each as the literal 'MISSING' -- the
  // same copy-boundary artefact the comment above describes, wearing the
  // "source digest is stale" message.
  "packages/core/artifacts/generated/css",
  // R-1 (F4B-14 close): typography.families' compound-case receipt is the
  // first to compile directly against the FIRST_PARTY_THEMES/rottayBrandTheme
  // exports (compileBrandTheme needs the raw BrandTheme, not the tenant-theme
  // compiler's own baseline loader), so it is the first to name this dist
  // module as a sourceBinding. Same copy-boundary artefact as the four dist
  // files above -- absent from the sandbox, receipts.mjs hashes it 'MISSING'
  // and a receipt that is genuinely fresh reads as stale for a reason that is
  // about the copy, not the manifest.
  "packages/core/dist/foundation/tokens/ts/presentation/brand-themes/index.js",
  "packages/showroom/src",
  "packages/showroom/e2e/whitelabel/density-authority-matrix.spec.ts",
];

for (const rel of CLOSURE_MEMBERS) {
  const dst = join(SANDBOX, rel);
  mkdirSync(dirname(dst), { recursive: true });
  cpSync(join(LIVE, rel), dst, { recursive: true });
}

// node_modules is never a write target (every write below derives from
// manifestRoot/programRoot), so it is reused read-only via symlink instead of
// copied; the D-4 guard further down still refuses to write through either
// link.
symlinkSync(join(LIVE, "node_modules"), join(SANDBOX, "node_modules"), "dir");
symlinkSync(
  join(LIVE, "packages/core/node_modules"),
  join(SANDBOX, "packages/core/node_modules"),
  "dir",
);

// Fence, asserted before anything is imported: if the sandbox were ever built
// inside the repo, the ascend-to-root search below would find the LIVE
// pnpm-workspace.yaml and silently validate the live tree. Fail closed.
if (!existsSync(join(SANDBOX, "pnpm-workspace.yaml"))) {
  throw new Error("T-1a sandbox fence: pnpm-workspace.yaml missing from sandbox root");
}
if (
  JSON.parse(readFileSync(join(SANDBOX, "packages/core/package.json"), "utf8")).name !==
  "@rottay/design-system"
) {
  throw new Error("T-1a sandbox fence: packages/core/package.json name mismatch in sandbox");
}
const sandboxProgramDir = join(SANDBOX, programDir);
const resolvedRoot = findRepoRoot(sandboxProgramDir);
if (resolvedRoot !== SANDBOX) {
  throw new Error(
    `T-1a sandbox fence: findRepoRoot(${sandboxProgramDir}) resolved to ${resolvedRoot}, expected ${SANDBOX}`,
  );
}

const { readModernRescueContracts, validateModernRescueContracts } = await import(
  pathToFileURL(join(sandboxProgramDir, "check/index.mjs")).href
);

const repoRoot = SANDBOX;
const programRoot = sandboxProgramDir;
// The manifest graduated to the package root; the programme still owns it.
const manifestRoot = join(repoRoot, "packages/core/governance/manifest");

// D-4: no write may escape the sandbox, including through either
// node_modules symlink above (C-1, Fable preaudit). Every one of the 37
// writeFileSync/renameSync call sites below is untouched; they resolve to
// these guarded wrappers by name, not to the raw node:fs functions.
const SANDBOX_ESCAPE_ROOTS = [
  join(SANDBOX, "node_modules"),
  join(SANDBOX, "packages/core/node_modules"),
];
function isUnderRoot(root, target) {
  return target === root || target.startsWith(`${root}${sep}`);
}
function assertSandboxWritePath(target) {
  if (!isUnderRoot(SANDBOX, target)) {
    throw new Error(`T-1a sandbox write guard: ${target} is outside the sandbox`);
  }
  if (SANDBOX_ESCAPE_ROOTS.some((root) => isUnderRoot(root, target))) {
    throw new Error(`T-1a sandbox write guard: ${target} targets a node_modules symlink`);
  }
}
function writeFileSync(target, data) {
  assertSandboxWritePath(target);
  rawWriteFileSync(target, data);
}
function renameSync(oldPath, newPath) {
  assertSandboxWritePath(oldPath);
  assertSandboxWritePath(newPath);
  rawRenameSync(oldPath, newPath);
}

const baseline = readModernRescueContracts();

function mutated(mutator) {
  const copy = structuredClone(baseline);
  mutator(copy);
  return validateModernRescueContracts(copy, { includeManifestGate: false });
}

function expectError(errors, fragment, message) {
  assert.ok(
    errors.some((error) => error.includes(fragment)),
    `${message ?? `expected error containing ${JSON.stringify(fragment)}`}; got ${JSON.stringify(errors)}`
  );
}

test("live modern-rescue program contracts are internally consistent", () => {
  // Constitution mutations are tested independently of live evidence freshness.
  // The current tree intentionally carries classified stale receipts and WIP;
  // rehashing those to make a role amendment green would falsify provenance.
  assert.deepEqual(validateModernRescueContracts(baseline, { includeManifestGate: false }), []);
});

test("role drift fails closed", () => {
  expectError(
    mutated((copy) => { copy.orchestration.coordinator.model = "Opus"; }),
    "coordinator must be Kimi K3",
    "Opus as coordinator must be rejected"
  );
  expectError(
    mutated((copy) => { copy.orchestration.coordinator.model = "Codex"; }),
    "coordinator must be Kimi K3",
    "reverting to the retired Codex DT must be rejected"
  );
  expectError(
    mutated((copy) => { copy.orchestration.modelRouting.implementer.actor = "Sonnet"; }),
    "primary source writer must be Opus",
    "Sonnet as primary source writer must be rejected"
  );
  expectError(
    mutated((copy) => { copy.orchestration.modelRouting.implementer.actor = "Kimi 2.7"; }),
    "primary source writer must be Opus",
    "reverting to the retired Kimi 2.7 implementer must be rejected"
  );
  expectError(
    mutated((copy) => {
      copy.orchestration.coordinator.model = "Opus";
      copy.orchestration.modelRouting.implementer.actor = "Codex";
    }),
    "coordinator must be Kimi K3",
    "swapped coordinator/implementer must be rejected"
  );
  expectError(
    mutated((copy) => {
      copy.orchestration.modelRouting.advisoryReadOnly.actors = [];
    }),
    "must name Fable 5 as an advisor",
    "dropping Fable 5 from advisors must be rejected"
  );
  expectError(
    mutated((copy) => {
      copy.orchestration.modelRouting.advisoryReadOnly.actors = ["Fable 5", "Codex", "Kimi K3"];
    }),
    "must not include the coordinator",
    "decision 13: the DT reappearing in advisoryReadOnly must be rejected"
  );
  expectError(
    mutated((copy) => {
      copy.orchestration.modelRouting.advisoryReadOnly.actors = ["Fable 5"];
    }),
    "must name Codex as an advisor",
    "dropping Codex from the checkpoint audit roster must be rejected"
  );
  expectError(
    mutated((copy) => {
      copy.orchestration.modelRouting.advisoryReadOnly.actors = ["Kimi K3"];
    }),
    "must name Fable 5 as an advisor",
    "the live DT may not replace Fable 5 in advisoryReadOnly"
  );
  expectError(
    mutated((copy) => {
      copy.orchestration.modelRouting.advisoryReadOnly.actors = ["Fable 5", "Codex", "Other"];
    }),
    "advisoryReadOnly.actors must be exactly [\"Fable 5\",\"Codex\"]",
    "an ungoverned third auditor must be rejected"
  );
  expectError(
    mutated((copy) => {
      copy.orchestration.doubleAccept.actors = ["Fable 5", "Codex", "Kimi K3"];
    }),
    "doubleAccept actors must be exactly [\"Fable 5\",\"Codex\"]",
    "the DT re-entering the independent audit roster must be rejected"
  );
  expectError(
    mutated((copy) => {
      copy.orchestration.modelRouting.scoutAndMechanical.actor = "Opus";
    }),
    "scout and mechanical actor must be Sonnet",
    "Opus may not silently replace the Sonnet scout lane"
  );
  expectError(
    mutated((copy) => {
      copy.orchestration.coordinator.mayAudit = true;
    }),
    "coordinator mayAudit must remain false",
    "Kimi may write but may never self-audit"
  );
});

test("coordinator succession fails closed", () => {
  expectError(
    mutated((copy) => { delete copy.orchestration.coordinator.succession; }),
    "coordinator must carry a succession record",
    "removing the DT succession record must be rejected"
  );
  expectError(
    mutated((copy) => { copy.orchestration.coordinator.succession = []; }),
    "coordinator must carry a succession record",
    "an empty DT succession chain must be rejected"
  );
  expectError(
    mutated((copy) => {
      copy.orchestration.coordinator.succession[0].predecessor = "Kimi K3";
    }),
    "coordinator succession record 0 predecessor must be Codex",
    "erasing the Codex origin of the DT chain must be rejected"
  );
  expectError(
    mutated((copy) => {
      copy.orchestration.coordinator.succession[0].ownerOrderDate = "2026-08-19";
    }),
    "coordinator succession record 0 must cite the 2026-08-20 owner order",
    "an unmoored first DT succession date must be rejected"
  );
  expectError(
    mutated((copy) => {
      copy.orchestration.coordinator.succession[1].ownerOrderDate = "2026-08-20";
    }),
    "coordinator succession record 1 must cite the 2026-08-21 owner order",
    "an unmoored second DT succession date must be rejected"
  );
  expectError(
    mutated((copy) => {
      copy.orchestration.coordinator.succession[1].predecessor = "Codex";
    }),
    "coordinator succession record 1 predecessor must be Kimi K3",
    "a DT succession chain with a gap must be rejected"
  );
  // Dropping the 2026-08-20 record would make the chain read Codex -> Codex
  // and erase the Kimi K3 tenure. The unbroken-chain law plus the pinned first
  // date is what keeps that history from being rewritten.
  expectError(
    mutated((copy) => {
      copy.orchestration.coordinator.succession = [copy.orchestration.coordinator.succession[1]];
    }),
    "coordinator succession must hold exactly 3 records",
    "deleting the historical Kimi K3 tenure must be rejected"
  );
  expectError(
    mutated((copy) => {
      copy.orchestration.coordinator.succession[1].successor = "Kimi K3";
    }),
    "coordinator succession record 1 successor must be Codex",
    "a DT chain whose second record does not reach Codex must be rejected"
  );
  expectError(
    mutated((copy) => {
      copy.orchestration.coordinator.succession[2].successor = "Codex";
    }),
    "coordinator succession record 2 successor must be Kimi K3",
    "a DT chain that does not end at the live coordinator must be rejected"
  );
  expectError(
    mutated((copy) => {
      copy.orchestration.coordinator.succession[2].predecessor = "Kimi K3";
    }),
    "coordinator succession record 2 predecessor must be Codex",
    "a DT succession chain with a gap before the live record must be rejected"
  );
  expectError(
    mutated((copy) => {
      copy.orchestration.coordinator.succession[2].ownerOrderDate = "2026-08-22";
    }),
    "coordinator succession record 2 must cite the 2026-08-23 owner order",
    "an unmoored third DT succession date must be rejected"
  );
  expectError(
    mutated((copy) => {
      copy.orchestration.coordinator.succession =
        copy.orchestration.coordinator.succession.slice(0, 2);
    }),
    "coordinator succession must hold exactly 3 records",
    "deleting the live 2026-08-23 DT succession must be rejected"
  );
  expectError(
    mutated((copy) => { copy.orchestration.coordinator.succession[2].proof = ""; }),
    "every coordinator succession record must state a written succession proof",
    "an unproven live DT succession must be rejected"
  );
  expectError(
    mutated((copy) => {
      copy.orchestration.coordinator.succession[2].retainedAuditCapacity = [];
    }),
    "record 2 must retain exactly the sole auditor roster",
    "a DT succession that drops Fable audit capacity must be rejected"
  );
  expectError(
    mutated((copy) => { copy.orchestration.coordinator.succession[1].proof = ""; }),
    "every coordinator succession record must state a written succession proof",
    "an unproven DT succession must be rejected"
  );
  expectError(
    mutated((copy) => {
      copy.orchestration.coordinator.succession[1].retainedAuditCapacity = [];
    }),
    "record 1 must retain exactly the sole auditor roster",
    "a DT succession that drops Fable audit capacity must be rejected"
  );
  // The tenure is immutable history. An origin/link/end-only law would accept
  // `Codex -> AnyActor -> Codex` and erase that Kimi K3 ever held the seat, so
  // the record count and every actor are pinned exactly.
  expectError(
    mutated((copy) => {
      const chain = copy.orchestration.coordinator.succession;
      copy.orchestration.coordinator.succession = [
        chain[0],
        { ...chain[0], predecessor: "Kimi K3", successor: "Codex", ownerOrderDate: "2026-08-21" },
        chain[1],
        chain[2],
      ];
    }),
    "coordinator succession must hold exactly 3 records",
    "padding the DT chain with an extra record must be rejected"
  );
  expectError(
    mutated((copy) => {
      copy.orchestration.coordinator.succession[0].successor = "ArbitraryActor";
      copy.orchestration.coordinator.succession[1].predecessor = "ArbitraryActor";
    }),
    "coordinator succession record 0 successor must be Kimi K3",
    "an unbroken chain through an arbitrary middle actor must be rejected"
  );
  expectError(
    mutated((copy) => {
      copy.orchestration.coordinator.succession[1].predecessor = "ArbitraryActor";
    }),
    "coordinator succession record 1 predecessor must be Kimi K3",
    "a wrong latest predecessor must be rejected"
  );
  expectError(
    mutated((copy) => {
      copy.orchestration.coordinator.succession[0].retainedAuditCapacity = [];
    }),
    "record 0 must retain exactly the sole auditor roster",
    "dropping audit capacity from the historical DT record must be rejected"
  );
  expectError(
    mutated((copy) => {
      copy.orchestration.coordinator.succession[0].retainedAuditCapacity = ["Fable 5", "Kimi K3"];
    }),
    "record 0 must retain exactly the sole auditor roster",
    "re-adding the retired DT to the historical record's audit capacity must be rejected"
  );
  expectError(
    mutated((copy) => {
      copy.orchestration.coordinator.succession[1].retainedAuditCapacity = ["Fable 5", "Kimi K3"];
    }),
    "record 1 must retain exactly the sole auditor roster",
    "re-adding a second auditor to the second record's audit capacity must be rejected"
  );
  expectError(
    mutated((copy) => {
      copy.orchestration.coordinator.succession[2].retainedAuditCapacity = ["Fable 5", "Codex"];
    }),
    "record 2 must retain exactly the sole auditor roster",
    "re-adding the consultant seat to the live record's audit capacity must be rejected"
  );
  expectError(
    mutated((copy) => { copy.orchestration.coordinator.succession[0].proof = ""; }),
    "every coordinator succession record must state a written succession proof",
    "an unproven historical DT succession must be rejected"
  );
});

test("implementer succession fails closed", () => {
  expectError(
    mutated((copy) => { delete copy.orchestration.modelRouting.implementer.succession; }),
    "implementer must carry a succession record",
    "removing the succession record must be rejected"
  );
  expectError(
    mutated((copy) => { copy.orchestration.modelRouting.implementer.succession = []; }),
    "implementer must carry a succession record",
    "an empty succession chain must be rejected"
  );
  expectError(
    mutated((copy) => {
      copy.orchestration.modelRouting.implementer.succession[0].predecessor = "Codex";
    }),
    "succession must begin with predecessor Kimi 2.7",
    "rewriting the retired implementer must be rejected"
  );
  expectError(
    mutated((copy) => {
      copy.orchestration.modelRouting.implementer.succession[0].ownerOrderDate = "2026-08-16";
    }),
    "succession must cite the 2026-08-17 owner order",
    "an unmoored first succession date must be rejected"
  );
  expectError(
    mutated((copy) => {
      copy.orchestration.modelRouting.implementer.succession[2].ownerOrderDate = "2026-08-29";
    }),
    "succession must cite the 2026-08-30 owner order for its latest record",
    "an unmoored live routing date must be rejected"
  );
  expectError(
    mutated((copy) => {
      copy.orchestration.modelRouting.implementer.succession[1].predecessor = "Kimi 2.7";
    }),
    "succession chain must be unbroken",
    "a succession chain with a gap must be rejected"
  );
  expectError(
    mutated((copy) => {
      copy.orchestration.modelRouting.implementer.succession[2].successor = "Claude implementer pool (Sonnet/Opus)";
    }),
    "succession must end with the Opus",
    "a succession chain that never reaches the live implementer must be rejected"
  );
  expectError(
    mutated((copy) => {
      copy.orchestration.modelRouting.implementer.succession[0].proof = "";
    }),
    "every implementer succession record must state a written succession proof",
    "an empty succession proof must be rejected"
  );
  expectError(
    mutated((copy) => {
      copy.orchestration.modelRouting.implementer.succession[2].retainedAuditCapacity = [];
    }),
    "succession must retain Fable 5 audit capacity",
    "dropping Fable 5 audit capacity in the succession must be rejected"
  );
  expectError(
    mutated((copy) => {
      copy.orchestration.doubleAccept.implementationActor = "Kimi 2.7";
    }),
    "doubleAccept implementationActor must be the Opus",
    "a doubleAccept implementer that contradicts the succession must be rejected"
  );
  expectError(
    mutated((copy) => { copy.orchestration.r7Execution.mechanicalWriters.maximum = 2; }),
    "mechanicalWriters.maximum must remain 1",
    "raising the mechanical writer ceiling must be rejected"
  );
  expectError(
    mutated((copy) => { copy.orchestration.r7Execution.mechanicalWriters.actor = "Kimi 2.7"; }),
    "r7Execution mechanical writer must be Sonnet",
    "an R7 mechanical writer that contradicts the succession must be rejected"
  );
});

test("Standard and Pro drift fail closed", () => {
  // The Standard baseline is DERIVED from the live capability registry
  // (decision 32), so the mutants move each contract away from the registry
  // instead of away from a literal. Reading the count from the snapshot is the
  // point: a number typed here would re-pin what the packet un-pinned.
  const registryStandard = baseline.capabilityRegistry.standardActiveIds.length;
  expectError(
    mutated((copy) => { copy.program.controlBaselines.standard = registryStandard + 1; }),
    "program/index.json standard controls must equal the live capability registry",
    "a program/index.json baseline above the registry must be rejected"
  );
  expectError(
    mutated((copy) => { copy.program.controlBaselines.standard = registryStandard - 1; }),
    "program/index.json standard controls must equal the live capability registry",
    "a program/index.json baseline below the registry must be rejected"
  );
  expectError(
    mutated((copy) => { copy.customization.standard.current.push("global.magic"); }),
    "standard.current must list exactly the",
    "an extra standard control must be rejected"
  );
  expectError(
    mutated((copy) => { copy.customization.standard.current.push("global.magic"); }),
    "does not match the live capability registry membership",
    "an id the registry never declared Standard must be rejected by name, not only by count"
  );
  // Membership, not only size: swapping one id keeps the length honest and the
  // roster wrong.
  expectError(
    mutated((copy) => { copy.customization.standard.current[0] = "global.magic"; }),
    "does not match the live capability registry membership",
    "a swapped standard id must be rejected even though the count still matches"
  );
  // Fail-closed: an authority that cannot be read is not permission to keep
  // the last number anybody typed.
  expectError(
    mutated((copy) => {
      copy.capabilityRegistry = {
        source: "packages/core/src/foundation/contracts/composition/tenants/capabilities/index.ts",
        readable: false,
        reason: "planted",
        standardActiveIds: [],
      };
    }),
    "could not be read as the Standard authority",
    "an unreadable capability registry must block instead of falling back to a pinned number"
  );
  expectError(
    mutated((copy) => { copy.program.controlBaselines.proCapabilities = 8; }),
    "pro capabilities must be 7",
    "program/index.json pro=8 must be rejected"
  );
  expectError(
    mutated((copy) => { copy.customization.pro.capabilities.push("chrome.extra"); }),
    "pro.capabilities must contain exactly 7 capabilities",
    "8th pro capability must be rejected"
  );
});

/*
 * ANTI-COLUSION. The two constitution files can agree with each other and both
 * be wrong -- that is not a hypothesis, it is what happened: `palette.status-
 * seeds` opened as Standard in the registry (P0, 2026-08-28) while
 * program/index.json said 13 and standard.current listed 13 ids, and every
 * JSON<->JSON check stayed green. These two mutants pin both directions of the
 * disagreement, and the second one asserts that the cross-check is BLIND to it
 * -- which is precisely why the registry has to be a third, independent term.
 */
test("Standard collusion between the two contracts fails closed", () => {
  // (a) both files raised together, source one behind. Agreement between two
  //     documents is not evidence about the source.
  const raisedTogether = mutated((copy) => {
    copy.capabilityRegistry.standardActiveIds =
      copy.capabilityRegistry.standardActiveIds.slice(0, -1);
  });
  expectError(
    raisedTogether,
    "program/index.json standard controls must equal the live capability registry",
    "a baseline both files share but the registry contradicts must be rejected"
  );
  expectError(
    raisedTogether,
    "standard.current must list exactly the",
    "the roster both files share but the registry contradicts must be rejected"
  );

  // (b) source ahead of both files: the real drift of 2026-08-28, reproduced
  //     without naming a number -- drop whatever the registry declared last.
  const bothBehind = mutated((copy) => {
    const dropped = copy.capabilityRegistry.standardActiveIds.at(-1);
    copy.program.controlBaselines.standard =
      copy.capabilityRegistry.standardActiveIds.length - 1;
    copy.customization.standard.current = copy.customization.standard.current.filter(
      (id) => id !== dropped
    );
  });
  expectError(
    bothBehind,
    "program/index.json standard controls must equal the live capability registry",
    "program/index.json trailing the registry must be rejected even when the model agrees with it"
  );
  expectError(
    bothBehind,
    "standard.current must list exactly the",
    "standard.current trailing the registry must be rejected even when program/index.json agrees with it"
  );
  expectError(
    bothBehind,
    "does not match the live capability registry membership",
    "the missing control must be named, not merely counted"
  );
  assert.ok(
    !bothBehind.some((error) =>
      error.includes("standard baseline must equal customization-model/index.json")
    ),
    `the JSON<->JSON cross-check cannot see this drift -- that is exactly why the registry is the third term; got ${JSON.stringify(bothBehind.filter((error) => error.includes("standard")))}`
  );
});

test("a hand-pinned Standard count in the README fails closed", () => {
  const target = join(programRoot, "README.md");
  const original = readFileSync(target, "utf8");
  const count = baseline.capabilityRegistry.standardActiveIds.length;
  const plant = (n) =>
    original.replace(
      "## Binding constitution",
      `## Binding constitution\n\nOperational product truth is exactly ${n} Standard controls.\n`
    );
  try {
    writeFileSync(target, plant(count - 1));
    expectError(
      validateModernRescueContracts(baseline, { includeManifestGate: false }),
      "the Standard count is derived, not typed",
      "re-pinning a wrong Standard count in prose must be rejected"
    );
    // CONTROL: the guard bites on DISAGREEMENT, not on the word "Standard" --
    // otherwise it would forbid the README from describing its own subject.
    writeFileSync(target, plant(count));
    const agreeing = validateModernRescueContracts(baseline, { includeManifestGate: false });
    assert.ok(
      !agreeing.some((error) => error.includes("the Standard count is derived, not typed")),
      `a count that agrees with the registry is not a finding; got ${JSON.stringify(agreeing.filter((error) => error.includes("Standard")))}`
    );
  } finally {
    writeFileSync(target, original);
  }
});

test("--_ds namespace loss fails closed", () => {
  expectError(
    mutated((copy) => {
      copy.customization.namespaceLifecycle.privateProvisional.prefix = "--ds-*";
    }),
    "privateProvisional must be --_ds-*",
    "erasing --_ds-* must be rejected"
  );
  expectError(
    mutated((copy) => { delete copy.customization.namespaceLifecycle; }),
    "must contain namespaceLifecycle",
    "removing namespaceLifecycle must be rejected"
  );
  expectError(
    mutated((copy) => {
      copy.customization.namespaceLifecycle.publicCanon.forbiddenPatterns = [];
    }),
    "must forbid product/vertical dialects",
    "dropping public deny-list must be rejected"
  );
});

test("target controls remain proposed, not operational", () => {
  expectError(
    mutated((copy) => {
      copy.customization.targetControlModel.implementationState = "OPERATIONAL";
    }),
    "PROPOSED_NOT_IMPLEMENTED",
    "target model promoted to operational must be rejected"
  );
});

test("r7Enabled stays false across all contracts", () => {
  expectError(
    mutated((copy) => { copy.program.r7Enabled = true; }),
    "r7Enabled must be false",
    "program/index.json r7Enabled=true must be rejected"
  );
  expectError(
    mutated((copy) => { copy.orchestration.r7Execution.enabled = true; }),
    "r7Execution.enabled must be false",
    "orchestration r7 enabled=true must be rejected"
  );
  expectError(
    mutated((copy) => { copy.customization.r7Execution.enabled = true; }),
    "r7Execution.enabled must equal orchestration/index.json r7Execution.enabled",
    "model r7 enabled=true must be rejected"
  );
});





test("home law: pattern folds stay green, literal duplicates go red", () => {
  const a = join(manifestRoot, "cascade/roots/surfaces/effect-intensity/index.json");
  const b = join(manifestRoot, "cascade/roots/typography/scale/index.json");
  const origA = readFileSync(a, "utf8");
  const origB = readFileSync(b, "utf8");
  try {
    // VERDE: dos raices con to "--ds-*" y toIsPattern true NO conflictuan
    let da = JSON.parse(origA); let db = JSON.parse(origB);
    da.derivations[0].to = "--ds-*"; da.derivations[0].toIsPattern = true;
    db.derivations[0].to = "--ds-*"; db.derivations[0].toIsPattern = true;
    writeFileSync(a, `${JSON.stringify(da, null, 2)}\n`);
    writeFileSync(b, `${JSON.stringify(db, null, 2)}\n`);
    let errors = validateModernRescueContracts(baseline, { includeManifestGate: false });
    assert.ok(!errors.some((e) => e.includes("has two homes")), `pattern folds must not conflict; got ${JSON.stringify(errors.filter((e) => e.includes("two homes")))}`);
    // ROJO: mismo canal LITERAL en dos raices
    da = JSON.parse(origA); db = JSON.parse(origB);
    da.derivations[0].to = "--ds-canal-duplicado"; delete da.derivations[0].toIsPattern;
    db.derivations[0].to = "--ds-canal-duplicado"; delete db.derivations[0].toIsPattern;
    writeFileSync(a, `${JSON.stringify(da, null, 2)}\n`);
    writeFileSync(b, `${JSON.stringify(db, null, 2)}\n`);
    errors = validateModernRescueContracts(baseline, { includeManifestGate: false });
    expectError(errors, "has two homes", "literal duplicate channel must fail R6");
  } finally {
    writeFileSync(a, origA);
    writeFileSync(b, origB);
  }
});

test("planted missing cascade root fails closed", () => {
  const target = join(manifestRoot, "cascade/roots/density/mode/index.json");
  const backup = join(SANDBOX, "density-mode.index.json.t1-test-backup");
  try {
    renameSync(target, backup);
    const errors = validateModernRescueContracts(baseline, { includeManifestGate: false });
    expectError(errors, "is missing for active control", "missing cascade root must fail");
  } finally {
    renameSync(backup, target);
  }
});
test("planted cascade defects fail closed (kind, site, orphan terminalReach)", () => {
  const target = join(manifestRoot, "cascade/roots/shape/radius-scale/index.json");
  const original = readFileSync(target, "utf8");
  const run = () => validateModernRescueContracts(baseline, { includeManifestGate: false });
  try {
    // 1) kind inventado
    let doc = JSON.parse(original);
    doc.derivations[0].rule.kind = "vibes-derive";
    writeFileSync(target, `${JSON.stringify(doc, null, 2)}\n`);
    expectError(run(), "is not a governed derivation kind", "invented derivation kind must fail");
    // 2) site inexistente
    doc = JSON.parse(original);
    doc.derivations[0].site = "packages/core/NO-EXISTE.css";
    writeFileSync(target, `${JSON.stringify(doc, null, 2)}\n`);
    expectError(run(), "site does not resolve", "nonexistent site must fail");
    // 3) terminalReach huerfano (sin edge que lo respalde)
    doc = JSON.parse(original);
    doc.terminalReach.push({ channelId: "--_ds-fantasma-radius", familyId: "primitive/inputs/button", state: "LIVE" });
    writeFileSync(target, `${JSON.stringify(doc, null, 2)}\n`);
    expectError(run(), "orphan terminalReach", "orphan terminalReach must fail");
  } finally {
    writeFileSync(target, original);
  }
});

test("cabeza nula: sin razon citada va rojo, bien declarada va verde", () => {
  const target = join(manifestRoot, "cascade/roots/responsive/posture/index.json");
  const original = readFileSync(target, "utf8");
  const run = () => validateModernRescueContracts(baseline, { includeManifestGate: false });
  try {
    // ROJO: cabeza nula SIN headEmptyReason -- la razon es obligatoria, como en la cola
    const doc = JSON.parse(original);
    delete doc.rootChannel.headEmptyReason;
    writeFileSync(target, `${JSON.stringify(doc, null, 2)}\n`);
    expectError(run(), "requires rootChannel.headEmptyReason", "null head without a cited reason must fail");
    // VERDE: el estado real de hoy -- cabeza nula con razon citada y colas vacias
    writeFileSync(target, original);
    const errors = run();
    assert.ok(
      !errors.some((e) => e.includes("responsive.posture.json")),
      `declared null head must be accepted; got ${JSON.stringify(errors.filter((e) => e.includes("responsive.posture")))}`
    );
  } finally {
    writeFileSync(target, original);
  }
});

test("planted invented domain.kind fails closed", () => {
  const target = join(manifestRoot, "controls/density/mode/index.json");
  const original = readFileSync(target, "utf8");
  try {
    const doc = JSON.parse(original);
    doc.domain.kind = "vibes-based";
    writeFileSync(target, `${JSON.stringify(doc, null, 2)}\n`);
    const errors = validateModernRescueContracts(baseline, { includeManifestGate: false });
    expectError(errors, "is not a governed domain kind", "invented kind must fail the gate");
  } finally {
    writeFileSync(target, original);
  }
});

test("manifest deep regression fails closed", () => {
  const target = join(manifestRoot, "families/primitive/inputs/button/index.json");
  const backup = `${target}.t1-test-backup`;
  let restored = false;
  try {
    renameSync(target, backup);
    const errors = validateModernRescueContracts(baseline);
    expectError(errors, "missing family manifest", "deleted family manifest must be reported");
  } finally {
    if (!restored) {
      renameSync(backup, target);
      restored = true;
    }
  }
});

test("double-accept does not authorize commit or R7", () => {
  expectError(
    mutated((copy) => { delete copy.orchestration.doubleAccept; }),
    "must codify doubleAccept",
    "removing doubleAccept must be rejected"
  );
  expectError(
    mutated((copy) => {
      copy.orchestration.doubleAccept.notAuthorizationFor = [];
    }),
    "notAuthorizationFor must list actions",
    "empty notAuthorizationFor must be rejected"
  );
  expectError(
    mutated((copy) => {
      copy.orchestration.doubleAccept.actors = [];
    }),
    "doubleAccept actors must include Fable 5",
    "dropping Fable 5 from doubleAccept must be rejected"
  );
  expectError(
    mutated((copy) => {
      copy.orchestration.doubleAccept.coordinator = "Kimi 2.7";
    }),
    "doubleAccept coordinator must be Kimi K3",
    "non-Kimi doubleAccept coordinator must be rejected"
  );
  expectError(
    mutated((copy) => {
      copy.orchestration.doubleAccept.coordinator = "Codex";
    }),
    "doubleAccept coordinator must be Kimi K3",
    "the retired Codex DT as doubleAccept coordinator must be rejected"
  );
});

test("cross-contract control baselines stay consistent", () => {
  // program/index.json stays exactly on the derived count and only the model moves,
  // so this drill isolates the JSON<->JSON term: the number is read from the
  // registry snapshot rather than typed, or the mutant would re-pin 13.
  expectError(
    mutated((copy) => {
      copy.program.controlBaselines.standard = copy.capabilityRegistry.standardActiveIds.length;
      copy.customization.standard.current = copy.customization.standard.current.slice(1);
    }),
    "standard baseline must equal",
    "program/model standard mismatch must be rejected"
  );
  expectError(
    mutated((copy) => {
      copy.program.controlBaselines.expertExactAllowlist = 295;
    }),
    "program/index.json Expert exact allowlist must equal the live TENANT_THEME_OVERRIDE_TOKENS reach",
    "Expert allowlist drift from the live source must be rejected"
  );
  expectError(
    mutated((copy) => {
      copy.customization.expert.exactAllowlistBaseline = 291;
    }),
    "customization-model/index.json Expert exactAllowlistBaseline must equal the live TENANT_THEME_OVERRIDE_TOKENS reach",
    "Expert allowlist drift in the model must be rejected"
  );
  // Anti-collusion: both contracts moved together to the same wrong count.
  // JSON<->JSON agreement proves nothing; the live source still says otherwise.
  expectError(
    mutated((copy) => {
      copy.program.controlBaselines.expertExactAllowlist = 291;
      copy.customization.expert.exactAllowlistBaseline = 291;
    }),
    "must equal the live TENANT_THEME_OVERRIDE_TOKENS reach",
    "colluded Expert counts in both contracts must be rejected"
  );
  expectError(
    mutated((copy) => {
      copy.program.controlBaselines.expertExactAllowlistDigest = "0".repeat(64);
    }),
    "program/index.json Expert allowlist digest must equal the live TENANT_THEME_OVERRIDE_TOKENS membership digest",
    "Expert digest drift in program/index.json must be rejected"
  );
  expectError(
    mutated((copy) => {
      copy.customization.expert.exactAllowlistDigest = "0".repeat(64);
    }),
    "customization-model/index.json Expert allowlist digest must equal the live TENANT_THEME_OVERRIDE_TOKENS membership digest",
    "Expert digest drift in the model must be rejected"
  );
});

test("Expert source drift fails closed against the sandbox tenant-theme contract", () => {
  // The sandboxed checker reads TENANT_THEME_OVERRIDE_TOKENS from the sandbox
  // copy of the tenant-theme contract, so these mutants exercise the real
  // source->gate path without touching the live file.
  const sourcePath = join(
    repoRoot,
    "packages/core/src/foundation/contracts/composition/tenants/themes/tenant-theme/index.ts"
  );
  const original = readFileSync(sourcePath, "utf8");
  const anchor = '"--ds-color-primary",';
  assert.ok(original.includes(anchor), "the Expert allowlist anchor must exist in the sandbox copy");
  const expectSourceFailure = (label) => {
    const contracts = readModernRescueContracts();
    const errors = validateModernRescueContracts(contracts, { includeManifestGate: false });
    assert.ok(
      errors.some((error) => error.includes("TENANT_THEME_OVERRIDE_TOKENS")),
      `${label}: expected an Expert failure naming TENANT_THEME_OVERRIDE_TOKENS; got ${JSON.stringify(errors)}`
    );
  };
  try {
    // +1 source: the allowlist grows, the contracts still say the old count.
    writeFileSync(sourcePath, original.replace(anchor, `${anchor}\n  "--ds-zzz-expert-mutant",`));
    expectSourceFailure("growth mutant");
    // Retired dark token reintroduced: same failure, by decision 25.
    writeFileSync(sourcePath, original.replace(anchor, `${anchor}\n  "--ds-color-dark-primary",`));
    expectSourceFailure("retired-token reintroduction");
    // Count-preserving swap: the count check stays silent, the digest must fire.
    const swapped = original.replace(anchor, '"--ds-zzz-expert-mutant",');
    writeFileSync(sourcePath, swapped);
    const contracts = readModernRescueContracts();
    assert.equal(contracts.expertAllowlist.reach, baseline.expertAllowlist.reach, "the swap preserves the count");
    const errors = validateModernRescueContracts(contracts, { includeManifestGate: false });
    assert.ok(
      errors.some((error) => error.includes("membership digest")),
      `count-preserving swap: expected a digest failure; got ${JSON.stringify(errors)}`
    );
    assert.ok(
      !errors.some((error) => error.includes("reach: the source declares")),
      `count-preserving swap: the count check must stay silent; got ${JSON.stringify(errors)}`
    );
  } finally {
    writeFileSync(sourcePath, original);
  }
});

test("amendment 2026-08-28 fences fail closed", () => {
  expectError(
    mutated((copy) => { copy.program.verticalScope.bithire.role = "active-vertical"; }),
    "verticalScope.bithire must be consumer-readiness-only",
    "reopening BitHire as a work vertical must be rejected"
  );
  expectError(
    mutated((copy) => { copy.program.verticalScope.appEvnto.disposition = "ACTIVE"; }),
    "verticalScope must keep appPlatform and appEvnto DEFERRED",
    "un-deferring an app must be rejected"
  );
  expectError(
    mutated((copy) => { copy.program.f4cCanary.visibilityHours = 24; }),
    "f4cCanary must pin visibilityHours 48",
    "shrinking the canary window must be rejected"
  );
  expectError(
    mutated((copy) => { copy.program.f4cCanary.stopCondition = ""; }),
    "a non-empty stopCondition",
    "erasing the canary stop condition must be rejected"
  );
  expectError(
    mutated((copy) => { delete copy.customization.targetControlModel.activationBlocks; }),
    "activationBlocks must keep control.size blocked",
    "unblocking control.size without a verdict must be rejected"
  );
  expectError(
    mutated((copy) => {
      copy.rounds.rounds.find((r) => r.id === "R7").scope.standardControlsBaseline = 13;
    }),
    "rounds/index.json R7 scope standardControlsBaseline must equal",
    "a typed R7 standard baseline drifting from the registry must be rejected"
  );
  expectError(
    mutated((copy) => {
      copy.rounds.rounds.find((r) => r.id === "R7").scope.expertExactAllowlistBaseline = 294;
    }),
    "rounds/index.json R7 scope expertExactAllowlistBaseline must equal the live TENANT_THEME_OVERRIDE_TOKENS reach",
    "re-pinning 294 in the R7 scope must be rejected"
  );
  expectError(
    mutated((copy) => {
      copy.orchestration.doubleAccept.notAuthorizationFor =
        copy.orchestration.doubleAccept.notAuthorizationFor.filter((action) => action !== "push");
    }),
    "must keep push outside every authorization",
    "lifting the push prohibition must be rejected"
  );
});

test("the standing-authorization fence fails closed in README and AGENTS.md", () => {
  const readmePath = join(programRoot, "README.md");
  const agentsPath = join(repoRoot, "AGENTS.md");
  const originals = new Map([
    [readmePath, readFileSync(readmePath, "utf8")],
    [agentsPath, readFileSync(agentsPath, "utf8")],
  ]);
  const expectFenceFailure = (label) => {
    const errors = validateModernRescueContracts(baseline, { includeManifestGate: false });
    assert.ok(
      errors.some((error) => error.includes("standing-authorization") || error.includes("push prohibition")),
      `${label}: expected a standing-authorization fence failure; got ${JSON.stringify(errors)}`
    );
  };
  const MARKERS = [
    "standing authorization",
    "write-set is explicit",
    "Fable's audit is ACCEPT or fully remediated",
    "applicable gates are green",
    "git diff --check",
    "no foreign files",
    "Never push",
  ];
  try {
    // Every condition, in each authority: erasing any one phrase must go red.
    // Phrases wrap in prose, so the erase pattern folds whitespace the same
    // way the guard does.
    for (const [path, original] of originals) {
      const folded = original.replace(/\s+/g, " ");
      for (const marker of MARKERS) {
        assert.ok(folded.includes(marker), `marker missing in ${path}: ${marker}`);
        const pattern = new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/ /g, "\\s+"));
        writeFileSync(path, original.replace(pattern, "erased-by-drill"));
        expectFenceFailure(`${path} without "${marker}"`);
        writeFileSync(path, original);
      }
    }
  } finally {
    for (const [path, original] of originals) writeFileSync(path, original);
  }
});

test("historical reference lab checks fail closed", () => {
  expectError(
    mutated((copy) => { copy.program.referenceLab.scenes.pop(); }),
    "must retain all eight governed scenes",
    "dropping a reference scene must be rejected"
  );
  expectError(
    mutated((copy) => { copy.program.referenceLab.route = "/probe/other"; }),
    "must remain /probe/ds-reference",
    "changing the reference lab route must be rejected"
  );
  expectError(
    mutated((copy) => { copy.program.referenceLab.applicationImportsAllowed = true; }),
    "must forbid product application imports",
    "allowing product imports in the lab must be rejected"
  );
});

test("historical quality rubric checks fail closed", () => {
  expectError(
    mutated((copy) => { copy.rubric.schemaVersion = 2; }),
    "quality rubric schema must remain v3",
    "rubric schema downgrade must be rejected"
  );
  expectError(
    mutated((copy) => { copy.rubric.dimensions[0].weight -= 1; }),
    "quality rubric weight must equal 100",
    "rubric weight drift must be rejected"
  );
  expectError(
    mutated((copy) => { copy.rubric.eligibility.finalSightedAuthority = "writer"; }),
    "Kimi K3 (DT) must remain final sighted authority",
    "non-DT final sighted authority must be rejected"
  );
  expectError(
    mutated((copy) => { copy.rubric.eligibility.finalSightedAuthority = "Codex (DT)"; }),
    "Kimi K3 (DT) must remain final sighted authority",
    "the retired Codex DT as final sighted authority must be rejected"
  );
  expectError(
    mutated((copy) => { copy.rubric.hardVetoes = copy.rubric.hardVetoes.slice(0, 19); }),
    "must retain at least 20 hard vetoes",
    "dropping hard vetoes must be rejected"
  );
  expectError(
    mutated((copy) => { copy.rubric.cssOwnershipContract.allowedClassifications.push("MISC_CSS"); }),
    "CSS ownership classifications must remain closed and exact",
    "extra CSS classification must be rejected"
  );
});

test("historical family inventory checks fail closed", () => {
  expectError(
    mutated((copy) => { copy.program.denominators.primitives = 104; }),
    "program denominator primitives must be 105",
    "primitive denominator shrink must be rejected"
  );
  expectError(
    mutated((copy) => { copy.inventory.rows[0].layer = "commercial"; }),
    "declares forbidden layer",
    "forbidden layer reintroduction must be rejected"
  );
  expectError(
    mutated((copy) => { copy.inventory.rows[0].sourceRoot = "packages/core/nonexistent"; }),
    "sourceRoot does not exist",
    "bogus family sourceRoot must be rejected"
  );
  expectError(
    mutated((copy) => { copy.inventory.counts.primitive = 104; }),
    "family inventory declared primitive count must be 105",
    "inventory count mismatch must be rejected"
  );
});

test("historical checkpoint and registry checks fail closed", () => {
  expectError(
    mutated((copy) => { delete copy.checkpoint.refused; }),
    "must explicitly refuse R7 execution",
    "removing R7 refusal from checkpoint must be rejected"
  );
  expectError(
    mutated((copy) => { copy.program.statusAuthority = "roadmap/other.json"; }),
    "statusAuthority must remain roadmap/registry.json",
    "changing status authority must be rejected"
  );
  expectError(
    mutated((copy) => { copy.program.workOrderId = "WO-OTHER"; }),
    "program.workOrderId must be WO-CRA-23",
    "changing work order id must be rejected"
  );
});

test("historical round and checkpoint cohort checks fail closed", () => {
  expectError(
    mutated((copy) => { copy.rounds.rounds[0].enabled = false; }),
    "must remain enabled inside the authorized R0-R6 scope",
    "disabling an R0-R6 round must be rejected"
  );
  expectError(
    mutated((copy) => {
      const r3 = copy.rounds.rounds.find((r) => r.id === "R3");
      r3.scope.patterns -= 1;
      r3.scope.charts += 1;
    }),
    "R3 scope patterns is",
    "same-total R3 axis trade must be rejected"
  );
  expectError(
    mutated((copy) => {
      const r7 = copy.rounds.rounds.find((r) => r.id === "R7");
      r7.scope.recipeGroups.target = 13;
    }),
    "fourteen target groups",
    "R7 target recipe group shrink must be rejected"
  );
});

test("historical visual craft and evidence receipt checks fail closed", () => {
  expectError(
    mutated((copy) => { copy.visualCraft.referenceIncidents.pop(); }),
    "must retain the twelve reproduced incidents",
    "dropping a reference incident must be rejected"
  );
  expectError(
    mutated((copy) => { copy.visualCraft.mechanicalFloors.coarsePointerTargetPx = 40; }),
    "coarsePointerTargetPx must remain 44",
    "touch-target floor regression must be rejected"
  );
  expectError(
    mutated((copy) => { copy.evidence.receiptRequiredFields.pop(); }),
    "evidence receipt must require",
    "dropping a receipt required field must be rejected"
  );
  expectError(
    mutated((copy) => {
      copy.evidence.checkpointRequiredFields = copy.evidence.checkpointRequiredFields.filter(
        (field) => field !== "fableDecision"
      );
    }),
    "visual checkpoint must require fableDecision",
    "dropping the independent Fable decision must be rejected"
  );
  expectError(
    mutated((copy) => { copy.evidence.schemaVersion = 1; }),
    "evidence contract schema must remain v2",
    "evidence schema downgrade must be rejected"
  );
});

test("historical orchestration mechanics fail closed", () => {
  expectError(
    mutated((copy) => { copy.orchestration.schemaVersion = 1; }),
    "agent orchestration schema must remain v2",
    "orchestration schema downgrade must be rejected"
  );
  expectError(
    mutated((copy) => { copy.orchestration.graph.agentCount = 5; }),
    "agent count must be dynamic",
    "fixed agentCount must be rejected"
  );
  expectError(
    mutated((copy) => { copy.orchestration.graph.integratorBatchRecalculationRequired = false; }),
    "integrator batch recalculation must be required",
    "disabling integrator batch recalculation must be rejected"
  );
  expectError(
    mutated((copy) => { copy.orchestration.efficiency = []; }),
    "agent efficiency must require useful comments and structured receipts",
    "empty efficiency array must be rejected"
  );
  expectError(
    mutated((copy) => { copy.orchestration.laneTypes["architecture-integrator"].singleton = false; }),
    "architecture-integrator must remain a singleton lane class",
    "non-singleton architecture integrator must be rejected"
  );
  expectError(
    mutated((copy) => { copy.orchestration.laneTypes["quality-integrator"].singleton = false; }),
    "quality-integrator must remain a singleton lane class",
    "non-singleton quality integrator must be rejected"
  );
  expectError(
    mutated((copy) => { copy.orchestration.reservedPaths = copy.orchestration.reservedPaths.slice(0, 9); }),
    "reservedPaths must contain at least 10 entries",
    "shrinking reservedPaths below 10 must be rejected"
  );
  expectError(
    mutated((copy) => { copy.orchestration.workOrderAdmission.requiredBeforeWrite = false; }),
    "workOrderAdmission.requiredBeforeWrite must block writes",
    "optional workOrderAdmission must be rejected"
  );
  expectError(
    mutated((copy) => { copy.orchestration.r7Execution.machineBudget.heavyBuildOrTest = 2; }),
    "R7 machine budget must allow exactly one heavy process",
    "heavyBuildOrTest >1 must be rejected"
  );
  expectError(
    mutated((copy) => { copy.orchestration.r7Execution.longIterationLaw = "reversible choices"; }),
    "R7 MAIN must run long checkpoint-sized iterations",
    "longIterationLaw without MAIN must be rejected"
  );
});

test("tenant art direction creative advisor retirement fails closed", () => {
  expectError(
    mutated((copy) => {
      copy.artDirection.authority.creativeAdvisor = "retired advisor restored";
    }),
    "art-direction/index.json authority.creativeAdvisor must equal exactly",
    "restoring the live Kimi seat in art-direction/index.json must be rejected"
  );
  expectError(
    mutated((copy) => {
      copy.artDirection.legacyProposalBoundary = { root: "retired-advisor-inbox" };
    }),
    "retired advisor inbox must not remain",
    "the retired inbox must not re-enter the live contract"
  );
});

/*
 * FORMA drills. The rule says an enum must name its vocabulary in ONE of two
 * governed domiciles. Three drills, because a one-sided drill would pass on a
 * rule that only ever checked `enumValues`: the planted red for each domicile
 * missing, and a planted GREEN proving the `calibration.catalog` branch is a
 * real alternative and not decoration.
 */
test("planted enum with neither enumValues nor calibration.catalog fails closed", () => {
  const target = join(manifestRoot, "controls/chrome/anatomy/index.json");
  const original = readFileSync(target, "utf8");
  try {
    const doc = JSON.parse(original);
    delete doc.calibration.catalog;
    writeFileSync(target, `${JSON.stringify(doc, null, 2)}\n`);
    const errors = validateModernRescueContracts(baseline, { includeManifestGate: false });
    expectError(
      errors,
      "an enum must name its vocabulary in one of the two governed domiciles",
      "an enum whose catalog is removed and whose enumValues are empty must fail"
    );
  } finally {
    writeFileSync(target, original);
  }
});

test("planted closed-enum emptied of enumValues, with no catalog, fails closed", () => {
  const target = join(manifestRoot, "controls/density/mode/index.json");
  const original = readFileSync(target, "utf8");
  try {
    const doc = JSON.parse(original);
    doc.domain.enumValues = [];
    delete doc.calibration?.catalog;
    writeFileSync(target, `${JSON.stringify(doc, null, 2)}\n`);
    const errors = validateModernRescueContracts(baseline, { includeManifestGate: false });
    expectError(
      errors,
      "an enum must name its vocabulary in one of the two governed domiciles",
      "emptying a closed-enum without a catalog must fail"
    );
  } finally {
    writeFileSync(target, original);
  }
});

test("CONTROL: a catalog is a real alternative domicile, not decoration", () => {
  const target = join(manifestRoot, "controls/density/mode/index.json");
  const original = readFileSync(target, "utf8");
  try {
    const doc = JSON.parse(original);
    doc.domain.enumValues = [];
    doc.calibration = { ...(doc.calibration ?? {}), catalog: { mode: ["compact", "normal", "spacious"] } };
    writeFileSync(target, `${JSON.stringify(doc, null, 2)}\n`);
    const errors = validateModernRescueContracts(baseline, { includeManifestGate: false });
    assert.equal(
      errors.filter((error) => error.includes("two governed domiciles")).length,
      0,
      `a catalog must satisfy the rule on its own; got ${JSON.stringify(errors)}`
    );
  } finally {
    writeFileSync(target, original);
  }
});

/*
 * ADMISSION drills. The rule is an implication (emitted => admitted), so a
 * drill that only proved the green path would pass on a rule that admitted
 * everything. Each of the three adjudications gets a planted red of its own,
 * plus the live tree as the standing positive.
 */
test("planted emitted value with no admission fails closed", () => {
  const target = join(manifestRoot, "cascade/roots/chrome/anatomy/index.json");
  const original = readFileSync(target, "utf8");
  try {
    const doc = JSON.parse(original);
    doc.variants.push({
      id: "card:invented",
      value: "invented",
      effects: { emits: "data-anatomy-card=invented" },
      pinned: {},
    });
    writeFileSync(target, `${JSON.stringify(doc, null, 2)}\n`);
    const errors = validateModernRescueContracts(baseline, { includeManifestGate: false });
    expectError(
      errors,
      'chrome.anatomy emits "card:invented"',
      "a value the catalog does not admit must fail"
    );
  } finally {
    writeFileSync(target, original);
  }
});

test("the card <-> cardComponent alias is the resolution path, not decoration", () => {
  const target = join(manifestRoot, "controls/chrome/anatomy/index.json");
  const original = readFileSync(target, "utf8");
  try {
    // The live tree is green while the root says `card` and the catalog says
    // `cardComponent`: that IS the alias working. Removing the catalog axis
    // proves the alias is where the lookup goes, and names it in the failure.
    const doc = JSON.parse(original);
    delete doc.calibration.catalog.cardComponent;
    writeFileSync(target, `${JSON.stringify(doc, null, 2)}\n`);
    const errors = validateModernRescueContracts(baseline, { includeManifestGate: false });
    expectError(
      errors,
      "calibration.catalog.cardComponent",
      "the card axis must resolve through the cardComponent alias"
    );
  } finally {
    writeFileSync(target, original);
  }
});

test("the density axis is admitted by density.mode, not by the sibling catalog", () => {
  const target = join(manifestRoot, "controls/density/mode/index.json");
  const original = readFileSync(target, "utf8");
  try {
    const doc = JSON.parse(original);
    doc.domain.enumValues = ["compact", "normal"];
    writeFileSync(target, `${JSON.stringify(doc, null, 2)}\n`);
    const errors = validateModernRescueContracts(baseline, { includeManifestGate: false });
    expectError(
      errors,
      'profiles.expressive emits "density:spacious" but controls/density/mode/index.json',
      "the cross-owner exception must read density.mode"
    );
  } finally {
    writeFileSync(target, original);
  }
});

test("planted root axis with no mapped owner fails closed", () => {
  const target = join(manifestRoot, "cascade/roots/profiles/expressive/index.json");
  const original = readFileSync(target, "utf8");
  try {
    const doc = JSON.parse(original);
    doc.variants.push({
      id: "weather:sunny",
      value: "sunny",
      effects: { emits: "--ds-weather: sunny" },
      pinned: {},
    });
    writeFileSync(target, `${JSON.stringify(doc, null, 2)}\n`);
    const errors = validateModernRescueContracts(baseline, { includeManifestGate: false });
    expectError(
      errors,
      'emits axis "weather" but no governed owner admits it',
      "an axis nobody owns must fail, never be skipped"
    );
  } finally {
    writeFileSync(target, original);
  }
});

/*
 * CELDA GOBERNADA drills. La regla es una disyuncion de tres, asi que un solo
 * drill no alcanza: hay que plantar la celda pelada Y probar que cada una de
 * las tres coberturas la salva por si sola. Si no, la regla podria estar
 * mirando una sola de las tres y nadie lo notaria.
 */
function withFamily(relPath, mutate, run) {
  const target = join(manifestRoot, `families/${relPath}`);
  const original = readFileSync(target, "utf8");
  try {
    const doc = JSON.parse(original);
    mutate(doc);
    writeFileSync(target, `${JSON.stringify(doc, null, 2)}\n`);
    run(validateModernRescueContracts(baseline, { includeManifestGate: false }));
  } finally {
    writeFileSync(target, original);
  }
}

/** Deja la celda pelada: sin filas, sin ley escrita y sin marca. */
function strip(cell) {
  delete cell.internalChannels;
  delete cell.targetBinding;
}

test("planted bare cell fails closed", () => {
  withFamily(
    "primitive/inputs/form/index.json",
    (doc) => strip(doc.themeControls.find((c) => c.controlId === "density.mode")),
    (errors) =>
      expectError(
        errors,
        "governed-cell: primitive/inputs/form/index#density.mode is bare",
        "una celda sin ninguna de las tres coberturas debe fallar"
      )
  );
});

test("CONTROL (a): internalChannels alone governs the cell", () => {
  withFamily(
    "primitive/inputs/form/index.json",
    (doc) => {
      const cell = doc.themeControls.find((c) => c.controlId === "density.mode");
      strip(cell);
      cell.internalChannels = [
        {
          channelId: "--_ds-form-radius",
          semanticOwner: "shape.radius-scale",
          producer: "packages/core/src/foundation/tokens/css/runtime/engines/modern/skin/form.css",
          fallbackAuthority: null,
          productiveConsumerFamilyIds: ["primitive/inputs/form"],
          sourceBindings: [
            "packages/core/src/foundation/tokens/css/runtime/engines/modern/skin/form.css",
          ],
          replacementDisposition: { state: "REQUIRED_ADDITION", reason: "drill" },
        },
      ];
    },
    (errors) =>
      assert.equal(
        errors.filter((e) => e.includes("primitive/inputs/form/index#density.mode is bare")).length,
        0,
        `las filas solas deben gobernar la celda; got ${JSON.stringify(errors)}`
      )
  );
});

test("CONTROL (b): a written status alone governs the cell", () => {
  withFamily(
    "primitive/inputs/form/index.json",
    (doc) => {
      const cell = doc.themeControls.find((c) => c.controlId === "density.mode");
      strip(cell);
      cell.targetBinding = { status: "MUST_NOT_REACH", source: "drill", bindings: [] };
    },
    (errors) =>
      assert.equal(
        errors.filter((e) => e.includes("primitive/inputs/form/index#density.mode is bare")).length,
        0,
        `la ley escrita sola debe gobernar la celda; got ${JSON.stringify(errors)}`
      )
  );
});

test("CONTROL (c): the adjudication mark alone governs the cell", () => {
  withFamily(
    "primitive/inputs/form/index.json",
    (doc) => {
      const cell = doc.themeControls.find((c) => c.controlId === "density.mode");
      strip(cell);
      cell.targetBinding = { source: "drill", bindings: [], migratedToInternalChannels: true };
    },
    (errors) =>
      assert.equal(
        errors.filter((e) => e.includes("primitive/inputs/form/index#density.mode is bare")).length,
        0,
        `la marca sola debe gobernar la celda; got ${JSON.stringify(errors)}`
      )
  );
});

test("an empty internalChannels list does not govern by itself", () => {
  withFamily(
    "primitive/inputs/form/index.json",
    (doc) => {
      const cell = doc.themeControls.find((c) => c.controlId === "density.mode");
      strip(cell);
      cell.internalChannels = [];
    },
    (errors) =>
      expectError(
        errors,
        "governed-cell: primitive/inputs/form/index#density.mode is bare",
        "una lista vacia es la ausencia de mecanismo, no su declaracion"
      )
  );
});

test("a walk that misses cells fails, instead of reporting zero bare ones", () => {
  // Derived, never pinned (owner decision 32): the expected counts come from
  // the same manifest index the gate reads, minus the one cell the mutant
  // removes below.
  const declared = JSON.parse(
    readFileSync(join(manifestRoot, "index.json"), "utf8")
  ).denominators.controlFamilyCells;
  withFamily(
    "primitive/inputs/form/index.json",
    (doc) => {
      doc.themeControls = doc.themeControls.filter((c) => c.controlId !== "density.mode");
    },
    (errors) =>
      expectError(
        errors,
        `the walk saw ${declared - 1} cells but governance/manifest/index.json declares ${declared}`,
        "un recorrido que pierde celdas no puede parecer un arbol limpio"
      )
  );
});

/*
 * ADMISSION universal (correccion F1 de la auditoria). La lista de raices se
 * deriva del arbol, asi que el drill que importa es el que Fable uso para
 * probar el agujero: una raiz que ANTES no estaba cubierta.
 */
test("F1: an invented variant in a newly covered root fails closed", () => {
  const target = join(manifestRoot, "cascade/roots/density/mode/index.json");
  const original = readFileSync(target, "utf8");
  try {
    const doc = JSON.parse(original);
    doc.variants.push({
      id: "ultra",
      value: 0.7,
      effects: { emits: "--ds-density-effective-scale: 0.7" },
      pinned: {},
    });
    writeFileSync(target, `${JSON.stringify(doc, null, 2)}\n`);
    const errors = validateModernRescueContracts(baseline, { includeManifestGate: false });
    expectError(
      errors,
      'admission: density.mode emits "ultra"',
      "density.mode no estaba en la lista pineada; derivada del arbol, si esta"
    );
  } finally {
    writeFileSync(target, original);
  }
});

test("F1: a flat root reads its token from the id, not from the emitted value", () => {
  // density.mode escribe id `compact` con value 0.85. Si la ley comparara
  // `value` contra enumValues, el arbol vivo daria rojo sin que nadie tocara
  // nada. Este control lo fija: hoy pasa, y si alguien invierte el criterio
  // el arbol REAL se cae.
  const errors = validateModernRescueContracts(baseline, { includeManifestGate: false });
  assert.equal(
    errors.filter((e) => e.includes("admission: density.mode")).length,
    0,
    `density.mode debe pasar leyendo el id; got ${JSON.stringify(errors)}`
  );
});

test("F1: a root that emits variants with no sibling control fails closed", () => {
  const target = join(manifestRoot, "controls/profiles/icon/index.json");
  const backup = join(SANDBOX, "profiles-icon.index.json.f1-drill-backup");
  try {
    renameSync(target, backup);
    const errors = validateModernRescueContracts(baseline, { includeManifestGate: false });
    expectError(
      errors,
      "profiles.icon emits 4 variants but has no sibling control",
      "una raiz que emite sin control hermano es un hueco de gobierno, no una exencion"
    );
  } finally {
    renameSync(backup, target);
  }
});

test("F3: an invented targetBinding.status is a typo, not a new law", () => {
  withFamily(
    "primitive/inputs/form/index.json",
    (doc) => {
      // La celda vive por (a) -- tiene filas -- asi que este drill prueba que el
      // vocabulario se revisa SIEMPRE, no solo cuando la celda depende de (b).
      const cell = doc.themeControls.find((c) => c.controlId === "density.mode");
      cell.targetBinding = { ...(cell.targetBinding ?? {}), status: "MUST_NOT_REACHX" };
    },
    (errors) =>
      expectError(
        errors,
        'declares targetBinding.status "MUST_NOT_REACHX", which is not one of',
        "un status inventado saca la celda de todas las particiones en silencio"
      )
  );
});

test("F5: an empty catalog is not a domicile", () => {
  const target = join(manifestRoot, "controls/chrome/anatomy/index.json");
  const original = readFileSync(target, "utf8");
  try {
    const doc = JSON.parse(original);
    doc.calibration.catalog = {};
    writeFileSync(target, `${JSON.stringify(doc, null, 2)}\n`);
    const errors = validateModernRescueContracts(baseline, { includeManifestGate: false });
    expectError(
      errors,
      "an enum must name its vocabulary in one of the two governed domiciles",
      "un catalogo vacio declara vocabulario vacio: FORMA debe rechazarlo"
    );
  } finally {
    writeFileSync(target, original);
  }
});

test("F6: a missing controlFamilyCells denominator fails closed", () => {
  const target = join(manifestRoot, "index.json");
  const original = readFileSync(target, "utf8");
  try {
    const doc = JSON.parse(original);
    delete doc.denominators.controlFamilyCells;
    writeFileSync(target, `${JSON.stringify(doc, null, 2)}\n`);
    const errors = validateModernRescueContracts(baseline, { includeManifestGate: false });
    expectError(
      errors,
      "does not publish a numeric denominators.controlFamilyCells",
      "un piso que se apaga desde el productor que vigila no es un piso"
    );
  } finally {
    writeFileSync(target, original);
  }
});
