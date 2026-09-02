# Quality evidence

This directory contains executable component-quality contracts. It is
tooling-only and does not ship in `@rottay/design-system`.

`v2/` is the only generation. v1 was retired on 2026-08-19 (see «Retired v1»
below).

## v2 — the current wave

`v2/` implements the governed evaluation for `WO-CRA-23`
(`programs/modern-rescue/README.md`). Its defining rule is that **binary
eligibility and the 100-point sighted craft score are computed by separate
modules**: `craft-score.mjs` never sees a contract result, so a green gate can
never raise a sighted score, and `eligibility.mjs` consumes the score only to
compare it against the family's layer threshold.

It adds, as executable checks rather than prose:

- observable evidence required per scored dimension (a claim without evidence
  scores zero);
- the applicable `stressMatrix` floor inside every resilience declaration;
- hard-veto, freshness, non-vacuity and self-approval drills;
- work-order admission enforced before a lane writes;
- conflict-graph safety (one writer per file, singleton integrators, reviewers
  never write);
- the per-round minimum reliable evidence policy, including R0 being
  capture-free;
- total inventory correspondence — every declared family, with no denominator
  restated here — against real source and public exports.

```sh
node packages/core/scripts/tooling/quality/evidence/framework/cli/index.mjs inventory
node packages/core/scripts/tooling/quality/evidence/framework/cli/index.mjs eligibility <family-receipt.json>
node packages/core/scripts/tooling/quality/evidence/framework/cli/index.mjs conflict-graph <conflict-graph.json>
node packages/core/scripts/tooling/quality/evidence/framework/cli/index.mjs round-evidence R0
node --test packages/core/scripts/tooling/quality/evidence/framework/drills/index.test.mjs
```

No tooling in this tree can approve sighted quality. The executor maximum
claim is `IMPLEMENTED_PENDING_CODEX_AUDIT`; Codex is the sighted authority.

## Retired v1

The Wave 0 implementation (`registry.mjs`, `pairwise.mjs`, `schema.mjs`,
`scorer.mjs`, `cli.mjs`, `quality-evidence.schema.json`,
`scorecard.example.json`) declared itself *historical baseline only — may not
be cited as coverage, quality or premium status* while still being executed by
the `quality-evidence:check` package script. It was retired on 2026-08-19 per
`docs/QUE-SE-QUEDA-Y-QUE-SE-BORRA.md` (U2) and `docs/ARCHITECTURE.md` §3:
files deleted, script entry removed, gate test removed. Historical outputs
quoted anywhere remain labelled historical baseline.
