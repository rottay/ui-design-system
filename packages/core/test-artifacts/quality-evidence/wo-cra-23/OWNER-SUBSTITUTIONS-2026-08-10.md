# Owner substitutions — 2026-08-10

The program pack under `packages/core/scripts/quality-evidence/programs/modern-rescue/`
names **Codex** as the final sighted authority and forbids committing before Codex
accepts a round. Codex is not installed on this machine (`codex` does not resolve on
PATH), so that authority cannot be exercised as written.

The owner was shown this and decided the substitutions below on 2026-08-10. They are
recorded here, in the unpoliced evidence root, rather than applied to the pack, because
`program-check.mjs` — a blocking CI gate — hard-codes `Codex` as
`rubric.eligibility.finalSightedAuthority` and in seven further assertions, and
`packages/core/scripts/**` is a declared **no-write** domain for this program precisely
so a lane cannot edit the tooling that judges it. Amending the pack would mean rewriting
that judge, which is a separate owner-authorized action.

Until such an amendment is made, the pack remains the written law and this file records
where the run knowingly diverges from it.

| Pack provision | Source | Substitution in force |
|---|---|---|
| "only Codex may accept sighted quality" | `program.json#invariants` | An independent adversarial Claude reviewer audits captures at 1440/390 for BitHire and The Management against `visual-craft-contract.json` and may REJECT. The owner reviews a consolidated contact sheet per block. |
| "no commit before Codex accepts the round" | `program.json#invariants`, `README.md` | Local commits are authorized per validated block. |
| `nextRoundRequires: [... "codex-audit", "explicit-owner-go"]` | `rounds.json#roundBoundary` | The adversarial reviewer's verdict substitutes for `codex-audit`. Owner GO remains required and is unchanged. |
| Per-round seals, hashed evidence manifests, admission packets, per-batch `roadmap:status progress` notes | `evidence-contract.json`, `README.md` | Replaced by one durable ledger (`family-ledger.json`) and one status note per block. The owner directed development throughput over evidence ceremony. |

**Unchanged and still binding.** Everything that governs the quality of the output:
`visual-craft-contract.json` (20 categories / 120 checks / 12 hard-veto incidents),
`tenant-art-direction.json` (>=8 observable axes, >=6 non-color, same tree),
`customization-model.json`, `quality-rubric.json` (`familyCompletionContract`,
`cssOwnershipContract`), the lane classes and `reservedPaths` in
`agent-orchestration.json`, and every non-negotiable fence — no tenant selector or
tenant-conditional TSX, no second compiler/engine/icon supplier, no public `--ds-*`
minted by a family lane, no hand-edited `styles/**` or `dist/**`, no test or baseline
weakened to preserve a defect.

**Also unchanged:** `program.json#invariants` "this program never pushes publishes or
tags". The owner reaffirmed it. Work stays local.

## Claim vocabulary

`craft.md` forbids an executor from claiming `ACCEPTED`, `VERIFIED_VISUAL`, `10/10` or
`PRODUCTION_READY`. That still holds. No family in `family-ledger.json` carries an
elevation claim; its `state` field records only what git can prove was edited, and its
`reviewVerdict` stays null until the adversarial reviewer rules.
