# Quality evidence

This directory contains executable component-quality contracts. It is
tooling-only and does not ship in `@rottay/design-system`.

Two generations live here and they are not interchangeable.

## v1 — HISTORICAL BASELINE ONLY

The Wave 0 implementation (`registry.mjs`, `pairwise.mjs`, `schema.mjs`,
`scorer.mjs`, `cli.mjs`, `quality-evidence.schema.json`) is **v1**. It covers a
public **primitive subset** and is retained as a historical baseline. It is
**not current-wave evidence** and may not be cited as coverage, quality or
premium status for the design system.

Specifically, v1:

- does not reach the canonical family denominator declared by
  `programs/modern-rescue/family-inventory.json`;
- composes its score in a way that lets contract/binary checks carry weight that
  the current rubric reserves for sighted craft;
- proves no receipt freshness against source digests.

Any v1 output quoted in a report must be labelled historical baseline.

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
node packages/core/scripts/quality-evidence/v2/cli.mjs inventory
node packages/core/scripts/quality-evidence/v2/cli.mjs eligibility <family-receipt.json>
node packages/core/scripts/quality-evidence/v2/cli.mjs conflict-graph <conflict-graph.json>
node packages/core/scripts/quality-evidence/v2/cli.mjs round-evidence R0
node --test packages/core/scripts/quality-evidence/v2/drills.test.mjs
```

Neither generation can approve sighted quality. The executor maximum claim is
`IMPLEMENTED_PENDING_CODEX_AUDIT`; Codex is the sighted authority.

## v1 ownership

- `registry.mjs` expands 89 public primitive contracts.
- `pairwise.mjs` builds a bounded, deterministic evidence matrix.
- `schema.mjs` validates registry and scorecard policy.
- `quality-evidence.schema.json` documents the scorecard interchange shape.
- `scorer.mjs` calculates Pass 1, Pass 2 and final disposition.
- `scorecard.example.json` is deliberately pending and makes no quality claim.

States and short/long/pathological content are rendered together inside every
evidence cell. The generated matrix pairwise-covers only the declared, disjoint
axis groups:

1. density × brand × canvas × locale;
2. responsive context × direction;
3. motion preference × input modality.

This is intentionally not the full Cartesian product. Every cell still exposes
all states and content profiles to DOM assertions and sighted review.

## CLI

The commands are intentionally not package scripts yet. Wave 0 can be reviewed
without changing the repository's build or CI contract.

```sh
node packages/core/scripts/quality-evidence/cli.mjs validate-manifest
node packages/core/scripts/quality-evidence/cli.mjs manifest DS-P032
node packages/core/scripts/quality-evidence/cli.mjs matrix DS-P032
node packages/core/scripts/quality-evidence/cli.mjs empty-scorecard DS-P032
node packages/core/scripts/quality-evidence/cli.mjs validate-scorecard ./scorecard.json
node packages/core/scripts/quality-evidence/cli.mjs score ./scorecard.json
```

`score` exits unsuccessfully until the component is completion-eligible. A
perfect Pass 1 and a numeric score of 100 still cannot approve Pass 2 unless a
reviewer, timestamp and every required craft artifact are present.

## Non-claims

- The registry does not prove the referenced stories or artifacts exist yet.
- It does not generate or approve screenshots.
- It does not replace existing regression baselines.
- It does not certify current components.
- `bithire-static` and `themanagementmiami-db` are the required real fixture
  identities. Locale is orthogonal to brand: every component must prove the
  BitHire static artifact and The Management DB fixture in English and Spanish,
  plus an Arabic RTL stress cell. Wiring screenshots and computed-style capture
  into the evidence runner remains integration work.
- Applications may compose DS components and choose recipes, but application CSS
  must not repair private DS anatomy or shared component chrome.
